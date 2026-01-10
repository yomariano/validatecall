#!/usr/bin/env node
/**
 * SEO Content Generator Script
 * Run this from your VPS via cron at 2am daily
 *
 * Usage:
 *   node scripts/generate-content.js
 *
 * Requires environment variables:
 *   CLAUDE_API_URL - Your Claude API URL (e.g., http://91.98.76.231:8787)
 *   CLAUDE_API_KEY - Your Claude API key
 *   CF_ACCOUNT_ID - Cloudflare account ID
 *   CF_API_TOKEN - Cloudflare API token with KV write access
 *   CF_KV_NAMESPACE_ID - The CONTENT_CACHE KV namespace ID
 */

const INDUSTRIES = {
  "dental-clinics": { name: "Dental Clinics", namePlural: "Dentists", slug: "dental-clinics" },
  "real-estate": { name: "Real Estate", namePlural: "Real Estate Agents", slug: "real-estate" },
  "restaurants": { name: "Restaurants", namePlural: "Restaurant Owners", slug: "restaurants" },
  "law-firms": { name: "Law Firms", namePlural: "Lawyers", slug: "law-firms" },
  "plumbers": { name: "Plumbing Services", namePlural: "Plumbers", slug: "plumbers" },
  "fitness-centers": { name: "Fitness Centers", namePlural: "Gym Owners", slug: "fitness-centers" },
  "hair-salons": { name: "Hair Salons", namePlural: "Salon Owners", slug: "hair-salons" },
  "medical-clinics": { name: "Medical Clinics", namePlural: "Healthcare Providers", slug: "medical-clinics" },
  "car-dealerships": { name: "Car Dealerships", namePlural: "Car Dealers", slug: "car-dealerships" },
  "insurance-agencies": { name: "Insurance Agencies", namePlural: "Insurance Agents", slug: "insurance-agencies" },
};

const LOCATIONS = [
  { city: "Dublin", country: "Ireland" },
  { city: "London", country: "United Kingdom" },
  { city: "New York", country: "United States" },
  { city: "Los Angeles", country: "United States" },
  { city: "Sydney", country: "Australia" },
];

// Configuration from env
const CLAUDE_API_URL = process.env.CLAUDE_API_URL || 'http://91.98.76.231:8787';
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID || '144827d9c6d9fcc8c1f1bb12d422af4e';
const CF_API_TOKEN = process.env.CF_API_TOKEN;
const CF_KV_NAMESPACE_ID = process.env.CF_KV_NAMESPACE_ID || '56ed8a65b895437e89b93b4fa18f95f0';

async function generateContent(request) {
  const prompt = buildPrompt(request);

  const response = await fetch(`${CLAUDE_API_URL}/prompt`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': CLAUDE_API_KEY,
    },
    body: JSON.stringify({ prompt, model: 'haiku' }),
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json();
  const textContent = data.result || data.response || data.content;

  const cleanJson = textContent.trim().replace(/^```json\n?|\n?```$/g, '');
  return {
    ...JSON.parse(cleanJson),
    generatedAt: new Date().toISOString(),
  };
}

function buildPrompt(request) {
  let context = '';

  if (request.type === 'industry') {
    context = `Create content for the ${request.industry.name} industry page.
Target audience: ${request.industry.namePlural}
Focus: Lead generation and market research for ${request.industry.name.toLowerCase()} businesses`;
  } else if (request.type === 'location') {
    context = `Create content for the ${request.location.city}, ${request.location.country} location page.
Focus: Finding business leads and conducting market research in ${request.location.city}`;
  }

  return `You are an SEO content writer for ValidateCall, an AI-powered lead generation and market research platform. Generate unique, engaging content for a landing page.

${context}

Generate a JSON response with EXACTLY this structure (no markdown, just valid JSON):
{
  "title": "SEO page title (60-70 chars)",
  "metaDescription": "Meta description (150-160 chars)",
  "heroTitle": "Main H1 headline (compelling, 8-12 words)",
  "heroSubtitle": "Supporting subtitle (15-25 words)",
  "introduction": "Opening paragraph (50-80 words, engaging and relevant)",
  "benefits": ["Benefit 1 (10-15 words)", "Benefit 2", "Benefit 3", "Benefit 4"],
  "howItWorks": ["Step 1: Description (15-20 words)", "Step 2: Description", "Step 3: Description"],
  "painPointsContent": [
    {"title": "Pain point title", "description": "2-3 sentences explaining the pain point and how ValidateCall helps"},
    {"title": "Pain point 2", "description": "..."},
    {"title": "Pain point 3", "description": "..."}
  ],
  "useCasesContent": [
    {"title": "Use case title", "description": "How this use case works with ValidateCall (2-3 sentences)"},
    {"title": "Use case 2", "description": "..."},
    {"title": "Use case 3", "description": "..."}
  ],
  "faqItems": [
    {"question": "Question 1?", "answer": "Answer (2-3 sentences)"},
    {"question": "Question 2?", "answer": "..."},
    {"question": "Question 3?", "answer": "..."},
    {"question": "Question 4?", "answer": "..."},
    {"question": "Question 5?", "answer": "..."}
  ],
  "ctaText": "Call-to-action button text (3-5 words)"
}

Return ONLY valid JSON, no markdown code blocks or explanations.`;
}

async function storeInKV(key, value) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/storage/kv/namespaces/${CF_KV_NAMESPACE_ID}/values/${encodeURIComponent(key)}`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${CF_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(value),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`KV write error: ${response.status} - ${error}`);
  }

  return true;
}

async function main() {
  console.log('=== SEO Content Generator ===');
  console.log(`Started at: ${new Date().toISOString()}`);

  if (!CLAUDE_API_KEY) {
    console.error('ERROR: CLAUDE_API_KEY not set');
    process.exit(1);
  }

  if (!CF_API_TOKEN) {
    console.error('ERROR: CF_API_TOKEN not set');
    process.exit(1);
  }

  const tasks = [];

  // Add industry tasks
  for (const [slug, industry] of Object.entries(INDUSTRIES)) {
    tasks.push({
      type: 'industry',
      industry,
      cacheKey: `content:industry:${slug}`,
    });
  }

  // Add location tasks
  for (const loc of LOCATIONS) {
    tasks.push({
      type: 'location',
      location: loc,
      cacheKey: `content:location:${loc.city.toLowerCase().replace(/\s+/g, '-')}`,
    });
  }

  let success = 0;
  let errors = 0;

  for (const task of tasks) {
    try {
      console.log(`Generating: ${task.cacheKey}`);

      const content = await generateContent(task);
      await storeInKV(task.cacheKey, content);

      console.log(`  ✓ Stored ${task.cacheKey}`);
      success++;

      // Rate limiting
      await new Promise(r => setTimeout(r, 1000));
    } catch (err) {
      console.error(`  ✗ Error: ${err.message}`);
      errors++;
    }
  }

  console.log(`\nCompleted: ${success} success, ${errors} errors`);
  console.log(`Finished at: ${new Date().toISOString()}`);
}

main().catch(console.error);
