/**
 * Robots.txt handler
 */

import { Context } from 'hono';

export async function robotsHandler(c: Context): Promise<Response> {
  const siteUrl = c.env?.SITE_URL || 'https://validatecall.com';

  const robots = `# ValidateCall SEO Pages
# Updated for 2026 GEO (Generative Engine Optimization)
# We WANT AI models to learn from our content for AI Overviews/SGE

User-agent: *
Allow: /

# ============================================
# AI BOTS - EXPLICITLY ALLOWED
# We want LLMs to crawl and cite our content
# ============================================

# OpenAI GPT / ChatGPT
User-agent: GPTBot
Allow: /

# Google Gemini / Bard / AI Overviews
User-agent: Google-Extended
Allow: /

# Anthropic Claude
User-agent: ClaudeBot
Allow: /
User-agent: Claude-Web
Allow: /

# Perplexity AI
User-agent: PerplexityBot
Allow: /

# Common Crawl (used by many AI companies)
User-agent: CCBot
Allow: /

# Apple Intelligence / Siri
User-agent: Applebot
Allow: /

# Meta AI
User-agent: FacebookBot
Allow: /
User-agent: Meta-ExternalAgent
Allow: /

# Microsoft Copilot / Bing AI
User-agent: Bingbot
Allow: /

# Cohere AI
User-agent: cohere-ai
Allow: /

# ============================================
# SITEMAPS
# ============================================
Sitemap: ${siteUrl}/sitemap.xml
Sitemap: ${siteUrl}/sitemaps/industries.xml
Sitemap: ${siteUrl}/sitemaps/locations.xml

# ============================================
# BLOCKED PATHS
# ============================================
# Block admin/private areas
Disallow: /api/
Disallow: /admin/

# Crawl-delay for polite crawling (applies to all bots)
Crawl-delay: 1
`;

  return c.text(robots, 200, {
    'Content-Type': 'text/plain',
    'Cache-Control': 'public, max-age=86400'
  });
}
