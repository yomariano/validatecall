/**
 * Location page handler
 * Generates pages like: /locations/ireland/dublin
 */

import { Context } from 'hono';
import { getCountry, getCity, City, Country } from '../data/locations';
import { INDUSTRIES, getIndustrySlugs } from '../data/industries';

export async function locationHandler(c: Context): Promise<Response> {
  const countrySlug = c.req.param('country');
  const citySlug = c.req.param('city');

  const country = getCountry(countrySlug);
  if (!country) {
    return c.notFound();
  }

  const city = getCity(countrySlug, citySlug);
  if (!city) {
    return c.notFound();
  }

  const html = generateLocationPage(city, country, c.env);
  return c.html(html);
}

function generateLocationPage(city: City, country: Country, env: any): string {
  const siteUrl = env?.SITE_URL || 'https://validatecall.com';
  const appUrl = env?.APP_URL || 'https://app.validatecall.com';

  const pageTitle = `Lead Generation in ${city.name}, ${country.name}`;
  const metaDescription = `Find verified business leads in ${city.name}, ${country.name}. AI-powered market research and cold calling across all industries.`;

  // Get top industries for this location
  const topIndustries = Object.values(INDUSTRIES).slice(0, 12);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageTitle} | ValidateCall</title>
  <meta name="description" content="${metaDescription}">
  <link rel="canonical" href="${siteUrl}/locations/${country.slug}/${city.slug}">

  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a2e; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
    .header { background: #fff; border-bottom: 1px solid #e5e7eb; padding: 16px 0; }
    .header-content { display: flex; justify-content: space-between; align-items: center; }
    .logo { font-weight: 700; font-size: 1.5rem; color: #3b82f6; text-decoration: none; }
    .btn { display: inline-block; padding: 10px 20px; border-radius: 8px; font-weight: 600; text-decoration: none; }
    .btn-primary { background: #3b82f6; color: #fff; }
    .hero { background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%); color: #fff; padding: 80px 0; text-align: center; }
    .hero h1 { font-size: 2.5rem; margin-bottom: 16px; }
    .hero-subtitle { font-size: 1.25rem; opacity: 0.9; margin-bottom: 32px; }
    .content-section { padding: 80px 0; }
    .content-section h2 { font-size: 2rem; text-align: center; margin-bottom: 48px; }
    .industries-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; }
    .industry-card { padding: 20px; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; text-decoration: none; color: #1e3a5f; display: flex; justify-content: space-between; align-items: center; }
    .industry-card:hover { border-color: #3b82f6; background: #f0f9ff; }
    .industry-card span { color: #64748b; font-size: 0.9rem; }
    .cta-section { background: #3b82f6; color: #fff; padding: 80px 0; text-align: center; }
    .cta-section .btn { background: #fff; color: #3b82f6; padding: 14px 28px; }
    .footer { background: #0f172a; color: #94a3b8; padding: 40px 0; text-align: center; }
  </style>
</head>
<body>
  <header class="header">
    <div class="container header-content">
      <a href="${siteUrl}" class="logo">ValidateCall</a>
      <a href="${appUrl}/signup" class="btn btn-primary">Get Started</a>
    </div>
  </header>

  <main>
    <section class="hero">
      <div class="container">
        <h1>Lead Generation in ${city.name}</h1>
        <p class="hero-subtitle">Find and validate business prospects in ${city.name}, ${country.name} across all industries</p>
        <a href="${appUrl}/signup?location=${city.slug}" class="btn btn-primary" style="padding: 14px 28px;">
          Start Free Trial
        </a>
      </div>
    </section>

    <section class="content-section">
      <div class="container">
        <h2>Find Leads By Industry in ${city.name}</h2>
        <div class="industries-grid">
          ${topIndustries.map(ind => `
            <a href="${siteUrl}/${ind.slug}-leads-in-${city.slug}" class="industry-card">
              <strong>${ind.name}</strong>
              <span>${ind.leadsCount.toLocaleString()}+ leads</span>
            </a>
          `).join('')}
        </div>
      </div>
    </section>

    <section class="cta-section">
      <div class="container">
        <h2>Ready to Find Leads in ${city.name}?</h2>
        <p style="margin-bottom: 32px; opacity: 0.9;">Start your free trial today</p>
        <a href="${appUrl}/signup?location=${city.slug}" class="btn">Start Free Trial</a>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="container">
      <p>&copy; ${new Date().getFullYear()} ValidateCall</p>
    </div>
  </footer>
</body>
</html>`;
}
