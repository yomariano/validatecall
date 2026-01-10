/**
 * Scheduled handler - runs daily at 2am UTC
 * Generates fresh AI content for SEO pages using Claude
 */

import { INDUSTRIES, getIndustrySlugs } from '../data/industries';
import { COUNTRIES } from '../data/locations';
import {
  generateContent,
  storeContent,
  buildCacheKey,
  ContentRequest,
} from '../utils/claude';

interface Env {
  CONTENT_CACHE: KVNamespace;
  CLAUDE_API_KEY: string;
  CLAUDE_API_URL?: string;
}

// Rate limiting - Claude API limits
const DELAY_BETWEEN_REQUESTS = 500; // 500ms between API calls
const MAX_REQUESTS_PER_RUN = 100; // Limit per cron run to avoid timeouts

/**
 * Main scheduled handler
 */
export async function scheduledHandler(
  event: ScheduledEvent,
  env: Env,
  ctx: ExecutionContext
): Promise<void> {
  console.log(`[Scheduled] Starting content generation at ${new Date().toISOString()}`);

  if (!env.CLAUDE_API_KEY) {
    console.error('[Scheduled] CLAUDE_API_KEY not configured');
    return;
  }

  const tasks: ContentRequest[] = [];

  // Priority 1: All industry pages (20 items)
  const industrySlugs = getIndustrySlugs();
  for (const slug of industrySlugs) {
    const industry = INDUSTRIES[slug];
    tasks.push({
      type: 'industry',
      industry: {
        name: industry.name,
        namePlural: industry.namePlural,
        slug: industry.slug,
      },
    });
  }

  // Priority 2: Top locations (20 items)
  const topCities = COUNTRIES.flatMap((country) =>
    country.cities.slice(0, 3).map((city) => ({
      city: city.name,
      country: country.name,
      slug: city.slug,
    }))
  ).slice(0, 20);

  for (const loc of topCities) {
    tasks.push({
      type: 'location',
      location: { city: loc.city, country: loc.country },
    });
  }

  // Priority 3: Top industry + location combos (60 items)
  const topIndustries = industrySlugs.slice(0, 10);
  for (const industrySlug of topIndustries) {
    const industry = INDUSTRIES[industrySlug];
    for (const loc of topCities.slice(0, 6)) {
      tasks.push({
        type: 'industry-location',
        industry: {
          name: industry.name,
          namePlural: industry.namePlural,
          slug: industry.slug,
        },
        location: { city: loc.city, country: loc.country },
      });
    }
  }

  // Limit tasks to avoid timeout
  const tasksToProcess = tasks.slice(0, MAX_REQUESTS_PER_RUN);

  console.log(
    `[Scheduled] Processing ${tasksToProcess.length} of ${tasks.length} total tasks`
  );

  let successCount = 0;
  let errorCount = 0;

  for (const task of tasksToProcess) {
    const cacheKey = buildCacheKey(task);

    try {
      // Check if content exists and is recent (less than 3 days old)
      const existing = await env.CONTENT_CACHE.get(cacheKey);
      if (existing) {
        const parsed = JSON.parse(existing);
        const generatedAt = new Date(parsed.generatedAt);
        const ageInDays =
          (Date.now() - generatedAt.getTime()) / (1000 * 60 * 60 * 24);

        if (ageInDays < 3) {
          console.log(`[Scheduled] Skipping ${cacheKey} - content is fresh`);
          continue;
        }
      }

      // Generate fresh content
      console.log(`[Scheduled] Generating content for ${cacheKey}`);
      const content = await generateContent(env.CLAUDE_API_KEY, task, env.CLAUDE_API_URL);

      // Store in KV
      await storeContent(env.CONTENT_CACHE, cacheKey, content);
      successCount++;

      console.log(`[Scheduled] Stored ${cacheKey}`);

      // Rate limiting delay
      await delay(DELAY_BETWEEN_REQUESTS);
    } catch (error) {
      errorCount++;
      console.error(`[Scheduled] Error generating ${cacheKey}:`, error);

      // Continue with next task even if one fails
      await delay(DELAY_BETWEEN_REQUESTS);
    }
  }

  console.log(
    `[Scheduled] Completed: ${successCount} success, ${errorCount} errors`
  );
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Manual trigger for testing - generates content for a specific page
 */
export async function manualGenerateContent(
  env: Env,
  request: ContentRequest
): Promise<{ success: boolean; message: string }> {
  if (!env.CLAUDE_API_KEY) {
    return { success: false, message: 'CLAUDE_API_KEY not configured' };
  }

  const cacheKey = buildCacheKey(request);

  try {
    const content = await generateContent(env.CLAUDE_API_KEY, request, env.CLAUDE_API_URL);
    await storeContent(env.CONTENT_CACHE, cacheKey, content);
    return { success: true, message: `Content generated for ${cacheKey}` };
  } catch (error) {
    return {
      success: false,
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
