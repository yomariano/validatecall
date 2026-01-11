/**
 * Industries Index page handler
 * Lists all 100+ industries with links to individual industry pages
 */

import { Context } from 'hono';
import { INDUSTRIES, getIndustrySlugs, Industry } from '../data/industries';

export async function industriesIndexHandler(c: Context): Promise<Response> {
  const siteUrl = c.env?.SITE_URL || 'https://validatecall.com';
  const appUrl = c.env?.APP_URL || 'https://app.validatecall.com';

  // Group industries by category
  const categories: Record<string, Industry[]> = {
    'Healthcare': [],
    'Home Services': [],
    'Professional Services': [],
    'Food & Hospitality': [],
    'Automotive': [],
    'Beauty & Wellness': [],
    'Education': [],
    'Retail': [],
    'Technology': [],
    'Other Services': [],
  };

  // Categorize industries
  Object.values(INDUSTRIES).forEach(industry => {
    if (['dental-clinics', 'medical-practices', 'chiropractors', 'physical-therapists', 'veterinarians', 'optometrists', 'pharmacies', 'mental-health', 'dermatologists', 'home-health', 'urgent-care'].includes(industry.slug)) {
      categories['Healthcare'].push(industry);
    } else if (['plumbers', 'electricians', 'hvac', 'roofing-contractors', 'pest-control', 'pool-services', 'garage-door', 'locksmiths', 'painting-contractors', 'flooring-contractors', 'kitchen-remodelers', 'bathroom-remodelers', 'general-contractors', 'moving-companies', 'appliance-repair', 'handymen', 'landscapers', 'cleaning-services', 'home-inspection'].includes(industry.slug)) {
      categories['Home Services'].push(industry);
    } else if (['lawyers', 'accountants', 'insurance-agents', 'financial-advisors', 'mortgage-brokers', 'staffing-agencies', 'consulting-firms', 'translation-services', 'pr-agencies', 'property-management'].includes(industry.slug)) {
      categories['Professional Services'].push(industry);
    } else if (['restaurants', 'bakeries', 'catering-services', 'food-trucks', 'juice-bars', 'bars-pubs', 'hotels'].includes(industry.slug)) {
      categories['Food & Hospitality'].push(industry);
    } else if (['auto-repair', 'car-wash', 'tire-shops', 'auto-body', 'tow-trucks', 'car-dealerships'].includes(industry.slug)) {
      categories['Automotive'].push(industry);
    } else if (['hair-salons', 'nail-salons', 'spas', 'barbershops', 'med-spas', 'massage-therapists', 'tattoo-shops', 'yoga-studios', 'pilates-studios', 'personal-trainers', 'martial-arts', 'gyms'].includes(industry.slug)) {
      categories['Beauty & Wellness'].push(industry);
    } else if (['tutoring-services', 'music-schools', 'dance-studios', 'driving-schools', 'language-schools', 'daycares', 'test-prep'].includes(industry.slug)) {
      categories['Education'].push(industry);
    } else if (['florists', 'pet-stores', 'jewelry-stores', 'furniture-stores', 'clothing-boutiques', 'ecommerce'].includes(industry.slug)) {
      categories['Retail'].push(industry);
    } else if (['it-services', 'seo-agencies', 'web-development', 'graphic-design'].includes(industry.slug)) {
      categories['Technology'].push(industry);
    } else {
      categories['Other Services'].push(industry);
    }
  });

  const totalIndustries = Object.keys(INDUSTRIES).length;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>All Industries - ${totalIndustries}+ Lead Generation Categories | ValidateCall</title>
  <meta name="description" content="Browse ${totalIndustries}+ industries for AI-powered lead generation and market research. Find verified business leads in healthcare, home services, professional services, and more.">
  <link rel="canonical" href="${siteUrl}/industries">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="All Industries | ValidateCall">
  <meta property="og:description" content="Browse ${totalIndustries}+ industries for AI-powered lead generation. Find verified leads in any business category.">
  <meta property="og:url" content="${siteUrl}/industries">

  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a2e; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }

    /* Header */
    .header { background: #fff; border-bottom: 1px solid #e5e7eb; padding: 16px 0; position: sticky; top: 0; z-index: 100; }
    .header-content { display: flex; justify-content: space-between; align-items: center; }
    .logo { font-weight: 700; font-size: 1.5rem; color: #3b82f6; text-decoration: none; }
    .nav { display: flex; gap: 24px; align-items: center; }
    .nav a { text-decoration: none; color: #64748b; font-weight: 500; }
    .nav a:hover { color: #3b82f6; }

    /* Buttons */
    .btn { display: inline-block; padding: 10px 20px; border-radius: 8px; font-weight: 600; text-decoration: none; transition: all 0.2s; }
    .btn-primary { background: #3b82f6; color: #fff; }
    .btn-primary:hover { background: #2563eb; }
    .btn-outline { border: 2px solid #3b82f6; color: #3b82f6; }
    .btn-outline:hover { background: #3b82f6; color: #fff; }

    /* Hero */
    .hero { background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%); color: #fff; padding: 60px 0; text-align: center; }
    .hero h1 { font-size: 2.5rem; margin-bottom: 16px; }
    .hero p { font-size: 1.2rem; opacity: 0.9; max-width: 600px; margin: 0 auto; }
    .hero-stats { display: flex; justify-content: center; gap: 48px; margin-top: 32px; }
    .hero-stat { text-align: center; }
    .hero-stat-number { display: block; font-size: 2rem; font-weight: 700; }
    .hero-stat-label { font-size: 0.9rem; opacity: 0.8; }

    /* Categories */
    .categories { padding: 60px 0; }
    .category { margin-bottom: 48px; }
    .category h2 { font-size: 1.5rem; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 2px solid #e5e7eb; }
    .category h2 span { color: #64748b; font-weight: 400; font-size: 1rem; }

    /* Industries Grid */
    .industries-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px; }
    .industry-card { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; text-decoration: none; color: #1e3a5f; transition: all 0.2s; }
    .industry-card:hover { border-color: #3b82f6; background: #f0f9ff; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1); }
    .industry-name { font-weight: 500; }
    .industry-count { font-size: 0.85rem; color: #64748b; }
    .industry-arrow { color: #3b82f6; font-weight: 600; }

    /* CTA */
    .cta { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #fff; padding: 60px 0; text-align: center; }
    .cta h2 { font-size: 2rem; margin-bottom: 12px; }
    .cta p { opacity: 0.9; margin-bottom: 24px; }
    .cta .btn-primary { background: #fff; color: #3b82f6; }

    /* Footer */
    .footer { background: #0f172a; color: #94a3b8; padding: 40px 0 24px; }
    .footer-content { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; }
    .footer a { color: #94a3b8; text-decoration: none; margin-left: 24px; }
    .footer a:hover { color: #fff; }

    @media (max-width: 768px) {
      .hero h1 { font-size: 1.75rem; }
      .hero-stats { flex-direction: column; gap: 16px; }
      .nav { display: none; }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <header class="header">
    <div class="container header-content">
      <a href="${siteUrl}" class="logo">ValidateCall</a>
      <nav class="nav">
        <a href="${siteUrl}/industries">Industries</a>
        <a href="${siteUrl}/pricing">Pricing</a>
        <a href="${appUrl}/login" class="btn btn-outline">Login</a>
        <a href="${appUrl}/signup" class="btn btn-primary">Get Started</a>
      </nav>
    </div>
  </header>

  <main>
    <!-- Hero -->
    <section class="hero">
      <div class="container">
        <h1>Browse All Industries</h1>
        <p>Find AI-powered lead generation and market research solutions for ${totalIndustries}+ business categories</p>
        <div class="hero-stats">
          <div class="hero-stat">
            <span class="hero-stat-number">${totalIndustries}+</span>
            <span class="hero-stat-label">Industries</span>
          </div>
          <div class="hero-stat">
            <span class="hero-stat-number">10M+</span>
            <span class="hero-stat-label">Total Leads</span>
          </div>
          <div class="hero-stat">
            <span class="hero-stat-number">150+</span>
            <span class="hero-stat-label">Countries</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Categories -->
    <section class="categories">
      <div class="container">
        ${Object.entries(categories)
          .filter(([_, industries]) => industries.length > 0)
          .map(([category, industries]) => `
            <div class="category">
              <h2>${category} <span>(${industries.length} industries)</span></h2>
              <div class="industries-grid">
                ${industries.map(ind => `
                  <a href="${siteUrl}/industries/${ind.slug}" class="industry-card">
                    <div>
                      <div class="industry-name">${ind.name}</div>
                      <div class="industry-count">${ind.leadsCount.toLocaleString()}+ leads</div>
                    </div>
                    <span class="industry-arrow">→</span>
                  </a>
                `).join('')}
              </div>
            </div>
          `).join('')}
      </div>
    </section>

    <!-- CTA -->
    <section class="cta">
      <div class="container">
        <h2>Ready to Generate Leads?</h2>
        <p>Start your free trial and connect with businesses in any industry</p>
        <a href="${appUrl}/signup" class="btn btn-primary">Start Free Trial</a>
      </div>
    </section>
  </main>

  <!-- Footer -->
  <footer class="footer">
    <div class="container footer-content">
      <p>&copy; ${new Date().getFullYear()} ValidateCall. All rights reserved.</p>
      <div>
        <a href="${siteUrl}">Home</a>
        <a href="${siteUrl}/pricing">Pricing</a>
        <a href="${siteUrl}/privacy">Privacy</a>
        <a href="${siteUrl}/terms">Terms</a>
        <a href="${siteUrl}/sitemap.xml">Sitemap</a>
      </div>
    </div>
  </footer>
</body>
</html>`;

  return c.html(html);
}
