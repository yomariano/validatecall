/**
 * Industry + Location combination page handler
 * Generates pages like: /dental-clinic-leads-in-dublin
 */

import { Context } from 'hono';
import { getIndustry, Industry } from '../data/industries';
import { findCityBySlug, City, Country } from '../data/locations';

export async function industryLocationHandler(
  c: Context,
  industrySlug: string,
  locationSlug: string
): Promise<Response> {
  const industry = getIndustry(industrySlug);
  const locationData = findCityBySlug(locationSlug);

  if (!industry || !locationData) {
    return c.notFound();
  }

  const { city, country } = locationData;
  const html = generateIndustryLocationPage(industry, city, country, c.env);
  return c.html(html);
}

function generateIndustryLocationPage(
  industry: Industry,
  city: City,
  country: Country,
  env: any
): string {
  const siteUrl = env?.SITE_URL || 'https://validatecall.com';
  const appUrl = env?.APP_URL || 'https://app.validatecall.com';

  const pageTitle = `${industry.name} Leads in ${city.name}, ${country.name}`;
  const metaDescription = `Find verified ${industry.name.toLowerCase()} leads in ${city.name}, ${country.name}. AI-powered market research and cold calling for ${industry.namePlural.toLowerCase()}.`;

  // Estimate local lead count (population-based approximation)
  const estimatedLeads = Math.floor((city.population / 100000) * (industry.leadsCount / 1000));

  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": `${industry.name} Lead Generation in ${city.name}`,
    "description": metaDescription,
    "provider": {
      "@type": "Organization",
      "name": "ValidateCall"
    },
    "areaServed": {
      "@type": "City",
      "name": city.name,
      "containedInPlace": {
        "@type": "Country",
        "name": country.name
      }
    },
    "serviceType": "Lead Generation"
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageTitle} | ValidateCall</title>
  <meta name="description" content="${metaDescription}">
  <link rel="canonical" href="${siteUrl}/${industry.slug}-leads-in-${city.slug}">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="${pageTitle} | ValidateCall">
  <meta property="og:description" content="${metaDescription}">
  <meta property="og:url" content="${siteUrl}/${industry.slug}-leads-in-${city.slug}">

  <!-- Schema.org -->
  <script type="application/ld+json">${JSON.stringify(schemaMarkup)}</script>

  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a2e; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
    .header { background: #fff; border-bottom: 1px solid #e5e7eb; padding: 16px 0; }
    .header-content { display: flex; justify-content: space-between; align-items: center; }
    .logo { font-weight: 700; font-size: 1.5rem; color: #3b82f6; text-decoration: none; }
    .nav { display: flex; gap: 24px; align-items: center; }
    .nav a { text-decoration: none; color: #64748b; font-weight: 500; }
    .btn { display: inline-block; padding: 10px 20px; border-radius: 8px; font-weight: 600; text-decoration: none; }
    .btn-primary { background: #3b82f6; color: #fff; }
    .btn-outline { border: 2px solid #3b82f6; color: #3b82f6; }
    .breadcrumbs { padding: 12px 0; background: #f8fafc; font-size: 0.9rem; }
    .breadcrumbs ol { display: flex; list-style: none; gap: 8px; }
    .breadcrumbs li::after { content: '/'; margin-left: 8px; color: #94a3b8; }
    .breadcrumbs li:last-child::after { content: ''; }
    .breadcrumbs a { color: #3b82f6; text-decoration: none; }
    .hero { background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%); color: #fff; padding: 80px 0; text-align: center; }
    .hero h1 { font-size: 2.5rem; margin-bottom: 16px; }
    .hero-subtitle { font-size: 1.25rem; opacity: 0.9; margin-bottom: 32px; }
    .hero-cta { display: flex; gap: 16px; justify-content: center; }
    .hero .btn-primary { padding: 14px 28px; font-size: 1.1rem; }
    .stats { padding: 60px 0; background: #fff; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px; }
    .stat-card { text-align: center; padding: 24px; background: #f8fafc; border-radius: 12px; }
    .stat-number { display: block; font-size: 2.5rem; font-weight: 700; color: #3b82f6; }
    .stat-label { color: #64748b; font-size: 0.9rem; }
    .content-section { padding: 80px 0; }
    .content-section.alt-bg { background: #f8fafc; }
    .content-section h2 { font-size: 2rem; text-align: center; margin-bottom: 12px; }
    .section-subtitle { text-align: center; color: #64748b; margin-bottom: 48px; }
    .cards-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
    .card { background: #fff; padding: 24px; border-radius: 12px; border: 1px solid #e5e7eb; }
    .card h3 { margin-bottom: 12px; color: #1e3a5f; }
    .links-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
    .link-card { padding: 16px; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; text-decoration: none; color: #1e3a5f; display: block; }
    .link-card:hover { border-color: #3b82f6; }
    .cta-section { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #fff; padding: 80px 0; text-align: center; }
    .cta-section h2 { margin-bottom: 12px; }
    .cta-section p { opacity: 0.9; margin-bottom: 32px; }
    .cta-section .btn-primary { background: #fff; color: #3b82f6; padding: 14px 28px; }
    .footer { background: #0f172a; color: #94a3b8; padding: 40px 0; text-align: center; }
    .footer a { color: #94a3b8; }
    @media (max-width: 768px) {
      .hero h1 { font-size: 1.75rem; }
      .nav { display: none; }
    }
  </style>
</head>
<body>
  <header class="header">
    <div class="container header-content">
      <a href="${siteUrl}" class="logo">ValidateCall</a>
      <nav class="nav">
        <a href="${siteUrl}/industries">Industries</a>
        <a href="${siteUrl}/locations">Locations</a>
        <a href="${appUrl}/signup" class="btn btn-primary">Get Started</a>
      </nav>
    </div>
  </header>

  <main>
    <nav class="breadcrumbs">
      <div class="container">
        <ol>
          <li><a href="${siteUrl}">Home</a></li>
          <li><a href="${siteUrl}/industries/${industry.slug}">${industry.name}</a></li>
          <li><a href="${siteUrl}/locations/${country.slug}">${country.name}</a></li>
          <li>${city.name}</li>
        </ol>
      </div>
    </nav>

    <section class="hero">
      <div class="container">
        <h1>${industry.name} Leads in ${city.name}</h1>
        <p class="hero-subtitle">Find and validate ${industry.namePlural.toLowerCase()} in ${city.name}, ${country.name} with AI-powered market research</p>
        <div class="hero-cta">
          <a href="${appUrl}/signup?industry=${industry.slug}&location=${city.slug}" class="btn btn-primary">
            Start Free Trial
          </a>
        </div>
      </div>
    </section>

    <section class="stats">
      <div class="container">
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-number">${estimatedLeads.toLocaleString()}+</span>
            <span class="stat-label">${industry.name} Leads in ${city.name}</span>
          </div>
          <div class="stat-card">
            <span class="stat-number">${industry.avgResponseRate}%</span>
            <span class="stat-label">Average Response Rate</span>
          </div>
          <div class="stat-card">
            <span class="stat-number">${country.language}</span>
            <span class="stat-label">AI Agent Language</span>
          </div>
          <div class="stat-card">
            <span class="stat-number">24/7</span>
            <span class="stat-label">Availability</span>
          </div>
        </div>
      </div>
    </section>

    <section class="content-section">
      <div class="container">
        <h2>Why ValidateCall for ${industry.name} in ${city.name}?</h2>
        <p class="section-subtitle">Everything you need to research and validate your ${industry.name.toLowerCase()} business idea in ${city.name}</p>
        <div class="cards-grid">
          <div class="card">
            <h3>Local ${industry.name} Database</h3>
            <p>Access verified ${industry.namePlural.toLowerCase()} in ${city.name} and surrounding areas of ${country.name}.</p>
          </div>
          <div class="card">
            <h3>${country.language}-Speaking AI Agents</h3>
            <p>Our AI agents conduct natural conversations in ${country.language}, perfect for ${city.name} market research.</p>
          </div>
          <div class="card">
            <h3>Local Market Insights</h3>
            <p>Understand ${city.name}'s ${industry.name.toLowerCase()} market with AI-powered analysis and reporting.</p>
          </div>
          <div class="card">
            <h3>Compliance Built-In</h3>
            <p>Fully compliant with ${country.name} calling regulations and data protection laws.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="content-section alt-bg">
      <div class="container">
        <h2>More ${industry.name} Locations</h2>
        <p class="section-subtitle">Find ${industry.namePlural.toLowerCase()} in other cities</p>
        <div class="links-grid">
          ${industry.topLocations.filter(l => l !== city.slug).slice(0, 6).map(loc => {
            const cityName = loc.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            return `<a href="${siteUrl}/${industry.slug}-leads-in-${loc}" class="link-card">${industry.name} in ${cityName}</a>`;
          }).join('')}
        </div>
      </div>
    </section>

    <section class="cta-section">
      <div class="container">
        <h2>Ready to Find ${industry.name} Leads in ${city.name}?</h2>
        <p>Start your free trial and connect with ${industry.namePlural.toLowerCase()} today</p>
        <a href="${appUrl}/signup?industry=${industry.slug}&location=${city.slug}" class="btn btn-primary">
          Start Free Trial
        </a>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="container">
      <p>&copy; ${new Date().getFullYear()} ValidateCall. All rights reserved.</p>
      <p><a href="${siteUrl}/privacy">Privacy</a> | <a href="${siteUrl}/terms">Terms</a></p>
    </div>
  </footer>
</body>
</html>`;
}
