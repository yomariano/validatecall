/**
 * Robots.txt handler
 */

import { Context } from 'hono';

export async function robotsHandler(c: Context): Promise<Response> {
  const siteUrl = c.env?.SITE_URL || 'https://validatecall.com';

  const robots = `# ValidateCall SEO Pages
User-agent: *
Allow: /

# Sitemaps
Sitemap: ${siteUrl}/sitemap.xml

# Crawl-delay for polite crawling
Crawl-delay: 1

# Block admin/private areas (if any)
Disallow: /api/
Disallow: /admin/
`;

  return c.text(robots, 200, {
    'Content-Type': 'text/plain',
    'Cache-Control': 'public, max-age=86400'
  });
}
