/**
 * Sitemap generation handlers
 */

import { Context } from 'hono';
import { getIndustrySlugs, INDUSTRIES } from '../data/industries';
import { COUNTRIES, getAllCities } from '../data/locations';

export async function sitemapIndexHandler(c: Context): Promise<Response> {
  const siteUrl = c.env?.SITE_URL || 'https://validatecall.com';
  const today = new Date().toISOString().split('T')[0];

  const sitemaps = [
    'industries',
    'use-cases',
    'comparisons',
    ...Object.keys(COUNTRIES).map(country => `locations-${country}`),
    'industry-locations-1',
    'industry-locations-2',
    'industry-locations-3',
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map(sitemap => `  <sitemap>
    <loc>${siteUrl}/sitemaps/${sitemap}.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;

  return c.text(xml, 200, {
    'Content-Type': 'application/xml',
    'Cache-Control': 'public, max-age=86400'
  });
}

export async function sitemapHandler(c: Context): Promise<Response> {
  const type = c.req.param('type').replace('.xml', '');
  const siteUrl = c.env?.SITE_URL || 'https://validatecall.com';
  const today = new Date().toISOString().split('T')[0];

  let urls: Array<{ loc: string; priority: string; changefreq: string }> = [];

  if (type === 'industries') {
    urls = getIndustrySlugs().map(slug => ({
      loc: `${siteUrl}/industries/${slug}`,
      priority: '0.8',
      changefreq: 'weekly'
    }));
  } else if (type === 'use-cases') {
    const useCases = ['startup-validation', 'market-research', 'customer-feedback', 'lead-qualification', 'appointment-setting'];
    urls = useCases.map(slug => ({
      loc: `${siteUrl}/use-cases/${slug}`,
      priority: '0.7',
      changefreq: 'monthly'
    }));
  } else if (type === 'comparisons') {
    const competitors = ['apollo', 'instantly', 'lemlist', 'aircall', 'dialpad'];
    urls = competitors.map(comp => ({
      loc: `${siteUrl}/compare/validatecall-vs-${comp}`,
      priority: '0.6',
      changefreq: 'monthly'
    }));
  } else if (type.startsWith('locations-')) {
    const countrySlug = type.replace('locations-', '');
    const country = COUNTRIES[countrySlug];
    if (country) {
      urls = country.cities.map(city => ({
        loc: `${siteUrl}/locations/${countrySlug}/${city.slug}`,
        priority: '0.7',
        changefreq: 'weekly'
      }));
    }
  } else if (type.startsWith('industry-locations-')) {
    const page = parseInt(type.replace('industry-locations-', ''));
    const industries = getIndustrySlugs();
    const cities = getAllCities();

    // Generate industry+location combinations
    const combinations: Array<{ industry: string; city: string }> = [];
    for (const industry of industries) {
      for (const city of cities) {
        combinations.push({ industry, city: city.slug });
      }
    }

    // Paginate (500 per page)
    const pageSize = 500;
    const start = (page - 1) * pageSize;
    const pageUrls = combinations.slice(start, start + pageSize);

    urls = pageUrls.map(({ industry, city }) => ({
      loc: `${siteUrl}/${industry}-leads-in-${city}`,
      priority: '0.6',
      changefreq: 'weekly'
    }));
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return c.text(xml, 200, {
    'Content-Type': 'application/xml',
    'Cache-Control': 'public, max-age=86400'
  });
}
