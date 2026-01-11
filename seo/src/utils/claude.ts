/**
 * Claude API integration for generating dynamic SEO content
 */

import { NewsArticle, formatNewsForPrompt } from './news';

export interface GeneratedContent {
  title: string;
  metaDescription: string;
  heroTitle: string;
  heroSubtitle: string;
  // GEO: Clear definition near the top for AI extraction
  definition: string;
  // GEO: Direct answer (inverted pyramid) - bolded first sentence
  quickAnswer: string;
  introduction: string;
  // GEO: Statistics with sources for AI citation
  keyStats: Array<{ stat: string; context: string }>;
  benefits: string[];
  howItWorks: string[];
  painPointsContent: Array<{ title: string; description: string }>;
  useCasesContent: Array<{ title: string; description: string }>;
  // GEO: Question-based FAQ for chunking
  faqItems: Array<{ question: string; answer: string }>;
  ctaText: string;
  trendInsight?: string;
  generatedAt: string;
}

export interface ContentRequest {
  type: 'industry' | 'location' | 'industry-location';
  industry?: { name: string; namePlural: string; slug: string };
  location?: { city: string; country: string };
  newsArticles?: NewsArticle[]; // News context for content generation
}

export async function generateContent(
  apiKey: string,
  request: ContentRequest,
  apiUrl?: string
): Promise<GeneratedContent> {
  const prompt = buildPrompt(request);

  // Use custom API URL (ValidateCall proxy format)
  const baseUrl = apiUrl || 'https://claude-api.validatecall.com';
  const endpoint = `${baseUrl}/v1/claude`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
    },
    body: JSON.stringify({
      prompt,
      model: 'haiku',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${response.status} - ${error}`);
  }

  const data = await response.json() as {
    success?: boolean;
    result?: string;
    response?: string;
    content?: string;
  };

  // Handle various response formats from the proxy
  const textContent = data.response || data.result || data.content || (typeof data === 'string' ? data : null);
  if (!textContent) {
    throw new Error('No text content in Claude response');
  }

  // Clean up the response (remove markdown code blocks if present)
  const cleanJson = typeof textContent === 'string'
    ? textContent.trim().replace(/^```json\n?|\n?```$/g, '')
    : JSON.stringify(textContent);

  // Parse the JSON response
  const parsed = JSON.parse(cleanJson) as Omit<GeneratedContent, 'generatedAt'>;

  return {
    ...parsed,
    generatedAt: new Date().toISOString(),
  };
}

function buildPrompt(request: ContentRequest): string {
  const context = buildContext(request);
  const newsContext = request.newsArticles && request.newsArticles.length > 0
    ? formatNewsForPrompt(request.newsArticles)
    : '';

  const newsInstructions = newsContext
    ? `
CURRENT INDUSTRY NEWS & TRENDS:
${newsContext}

Use these recent news items to:
- Reference current trends or challenges in the industry in your content
- Make the introduction and pain points feel timely and relevant
- Generate a "trendInsight" that connects current news to how ValidateCall can help
- Ensure the content feels fresh and up-to-date with what's happening in the industry
`
    : '';

  return `Generate SEO landing page content for ValidateCall, an AI-powered lead generation and market research platform.

${context}
${newsInstructions}

=== GEO (Generative Engine Optimization) GUIDELINES ===
Follow these 2026 SEO best practices for AI Overview optimization:
1. INVERTED PYRAMID: Answer the user's main question immediately
2. CLEAR DEFINITIONS: Define key concepts for AI extraction
3. STATISTICS: Include specific numbers with context (AI loves citing stats)
4. QUESTION-BASED HEADINGS: FAQ questions should mirror how users search
5. DIRECT ANSWERS: Start FAQ answers with a direct statement before elaborating
6. E-E-A-T: Show first-hand experience ("When testing...", "Based on our data...")

Generate a JSON response with EXACTLY this structure (no markdown, just valid JSON):
{
  "title": "SEO page title (60-70 chars)",
  "metaDescription": "Meta description (150-160 chars)",
  "heroTitle": "Main H1 headline (compelling, 8-12 words)",
  "heroSubtitle": "Supporting subtitle (15-25 words)",
  "definition": "Clear 1-2 sentence definition of the concept (e.g., 'AI lead generation for [industry] is the process of...'). This helps AI models extract and cite your content.",
  "quickAnswer": "Direct answer to the main user intent (2-3 sentences). Start with a bold statement that directly answers what the user is looking for. This is the 'inverted pyramid' - most important info first.",
  "introduction": "Opening paragraph (50-80 words) that demonstrates first-hand experience. Use phrases like 'Based on our experience...' or 'When we analyzed...'${newsContext ? ' Reference current industry trends.' : ''}",
  "keyStats": [
    {"stat": "Specific number or percentage", "context": "What this stat means and source context"},
    {"stat": "Another relevant statistic", "context": "Brief explanation"},
    {"stat": "Third data point", "context": "Why this matters"}
  ],
  "benefits": ["Benefit 1 (10-15 words)", "Benefit 2", "Benefit 3", "Benefit 4"],
  "howItWorks": ["Step 1: Description (15-20 words)", "Step 2: Description", "Step 3: Description"],
  "painPointsContent": [
    {"title": "Question-format pain point (e.g., 'Why is finding quality leads so hard?')", "description": "Start with direct answer, then elaborate. 2-3 sentences."},
    {"title": "Pain point 2 as question", "description": "..."},
    {"title": "Pain point 3 as question", "description": "..."}
  ],
  "useCasesContent": [
    {"title": "Use case as question (e.g., 'How do [professionals] use ValidateCall?')", "description": "Direct answer first, then details. 2-3 sentences showing first-hand experience."},
    {"title": "Use case 2", "description": "..."},
    {"title": "Use case 3", "description": "..."}
  ],
  "faqItems": [
    {"question": "How much does [specific service] cost?", "answer": "Start with direct price/range, then explain factors."},
    {"question": "What is the best way to [achieve goal]?", "answer": "Direct recommendation first, then reasoning."},
    {"question": "How long does it take to [get results]?", "answer": "Specific timeframe first, then variables."},
    {"question": "Can ValidateCall help with [specific need]?", "answer": "Yes/No first, then explanation."},
    {"question": "What makes ValidateCall different from [alternatives]?", "answer": "Key differentiator first, then details."}
  ],
  "ctaText": "Call-to-action button text (3-5 words)"${newsContext ? `,
  "trendInsight": "2-3 sentences connecting current news to why businesses need ValidateCall NOW. Include a specific stat or trend."` : ''}
}

Requirements:
- Content must be unique and provide INFORMATION GAIN (not just summarizing what exists)
- Focus on the specific industry/location mentioned
- Be informative and helpful, demonstrate expertise
- Use natural language that reads well
- Include relevant keywords naturally
- ValidateCall helps find leads and validate business ideas through AI-powered research calls
- Use first-person plural ("we tested", "our data shows") to demonstrate E-E-A-T
- Make statistics realistic and industry-appropriate${newsContext ? `
- Incorporate current news to make content timely
- The trendInsight should feel current and actionable` : ''}

Return ONLY valid JSON, no markdown code blocks or explanations.`;
}

function buildContext(request: ContentRequest): string {
  switch (request.type) {
    case 'industry':
      return `Create content for the ${request.industry?.name} industry page.
Target audience: ${request.industry?.namePlural}
Focus: Lead generation and market research for ${request.industry?.name?.toLowerCase()} businesses`;

    case 'location':
      return `Create content for the ${request.location?.city}, ${request.location?.country} location page.
Focus: Finding business leads and conducting market research in ${request.location?.city}`;

    case 'industry-location':
      return `Create content for ${request.industry?.name} leads in ${request.location?.city}, ${request.location?.country}.
Target audience: Businesses looking for ${request.industry?.namePlural?.toLowerCase()} in ${request.location?.city}
Focus: Industry-specific lead generation in this location`;

    default:
      return '';
  }
}

/**
 * Store generated content in KV
 */
export async function storeContent(
  kv: KVNamespace,
  key: string,
  content: GeneratedContent,
  expirationTtl = 86400 * 7 // 7 days
): Promise<void> {
  await kv.put(key, JSON.stringify(content), { expirationTtl });
}

/**
 * Retrieve content from KV
 */
export async function getContent(
  kv: KVNamespace,
  key: string
): Promise<GeneratedContent | null> {
  const data = await kv.get(key);
  if (!data) return null;
  return JSON.parse(data) as GeneratedContent;
}

/**
 * Build cache key for content
 */
export function buildCacheKey(request: ContentRequest): string {
  switch (request.type) {
    case 'industry':
      return `content:industry:${request.industry?.slug}`;
    case 'location':
      return `content:location:${request.location?.city?.toLowerCase().replace(/\s+/g, '-')}`;
    case 'industry-location':
      return `content:combo:${request.industry?.slug}:${request.location?.city?.toLowerCase().replace(/\s+/g, '-')}`;
    default:
      return 'content:unknown';
  }
}
