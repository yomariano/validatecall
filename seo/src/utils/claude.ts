/**
 * Claude API integration for generating dynamic SEO content
 */

export interface GeneratedContent {
  title: string;
  metaDescription: string;
  heroTitle: string;
  heroSubtitle: string;
  introduction: string;
  benefits: string[];
  howItWorks: string[];
  painPointsContent: Array<{ title: string; description: string }>;
  useCasesContent: Array<{ title: string; description: string }>;
  faqItems: Array<{ question: string; answer: string }>;
  ctaText: string;
  generatedAt: string;
}

export interface ContentRequest {
  type: 'industry' | 'location' | 'industry-location';
  industry?: { name: string; namePlural: string; slug: string };
  location?: { city: string; country: string };
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

  return `Generate SEO landing page content for ValidateCall, an AI-powered lead generation and market research platform.

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

Requirements:
- Content must be unique and not templated
- Focus on the specific industry/location mentioned
- Be informative and helpful, not overly salesy
- Use natural language that reads well
- Include relevant keywords naturally
- ValidateCall helps find leads and validate business ideas through AI-powered research calls

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
