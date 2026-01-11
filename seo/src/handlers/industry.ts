/**
 * Industry page handler
 * Generates SEO-optimized pages for each industry
 * Uses AI-generated content from KV cache when available
 */

import { Context } from 'hono';
import { getIndustry, getRelatedIndustries, Industry } from '../data/industries';
import { COUNTRIES } from '../data/locations';
import { generateBaseHtml, generateSchemaMarkup, generateFAQSchema } from '../utils/seo';
import { getContent, buildCacheKey, GeneratedContent } from '../utils/claude';

export async function industryHandler(c: Context): Promise<Response> {
  const industrySlug = c.req.param('industry');
  const industry = getIndustry(industrySlug);

  if (!industry) {
    return c.notFound();
  }

  // Try to get AI-generated content from KV cache
  const cacheKey = buildCacheKey({
    type: 'industry',
    industry: { name: industry.name, namePlural: industry.namePlural, slug: industry.slug },
  });

  let aiContent: GeneratedContent | null = null;
  try {
    aiContent = await getContent(c.env.CONTENT_CACHE, cacheKey);
  } catch (e) {
    console.error('Error fetching AI content:', e);
  }

  const html = aiContent
    ? generateDynamicIndustryPage(industry, aiContent, c.env)
    : generateIndustryPage(industry, c.env);

  return c.html(html);
}

function generateIndustryPage(industry: Industry, env: any): string {
  const siteUrl = env?.SITE_URL || 'https://validatecall.com';
  const appUrl = env?.APP_URL || 'https://app.validatecall.com';

  const relatedIndustries = getRelatedIndustries(industry.slug);
  const topLocations = industry.topLocations.slice(0, 8);

  // Generate FAQ items
  const faqItems = generateFAQItems(industry);

  // Schema markup
  const schemaMarkup = generateSchemaMarkup({
    type: 'Service',
    name: `ValidateCall ${industry.name} Lead Generation`,
    description: industry.metaDescription,
    provider: 'ValidateCall',
    areaServed: 'Worldwide',
    serviceType: 'Lead Generation'
  });

  const faqSchema = generateFAQSchema(faqItems);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${industry.name} Lead Generation & AI Calling | ValidateCall</title>
  <meta name="description" content="${industry.metaDescription}">
  <link rel="canonical" href="${siteUrl}/industries/${industry.slug}">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="${industry.name} Lead Generation | ValidateCall">
  <meta property="og:description" content="${industry.metaDescription}">
  <meta property="og:url" content="${siteUrl}/industries/${industry.slug}">
  <meta property="og:site_name" content="ValidateCall">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${industry.name} Lead Generation | ValidateCall">
  <meta name="twitter:description" content="${industry.metaDescription}">

  <!-- Schema.org -->
  <script type="application/ld+json">${JSON.stringify(schemaMarkup)}</script>
  <script type="application/ld+json">${JSON.stringify(faqSchema)}</script>

  <style>
    ${getBaseStyles()}
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
        <a href="${appUrl}/signup?industry=${industry.slug}" class="btn btn-primary">Get Started</a>
      </nav>
    </div>
  </header>

  <main>
    <!-- Breadcrumbs -->
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <div class="container">
        <ol itemscope itemtype="https://schema.org/BreadcrumbList">
          <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
            <a itemprop="item" href="${siteUrl}"><span itemprop="name">Home</span></a>
            <meta itemprop="position" content="1">
          </li>
          <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
            <a itemprop="item" href="${siteUrl}/industries"><span itemprop="name">Industries</span></a>
            <meta itemprop="position" content="2">
          </li>
          <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
            <span itemprop="name">${industry.name}</span>
            <meta itemprop="position" content="3">
          </li>
        </ol>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero">
      <div class="container">
        <h1>${industry.name} Lead Generation & Market Research</h1>
        <p class="hero-subtitle">Find and validate ${industry.namePlural.toLowerCase()} prospects with AI-powered market research calls</p>
        <div class="hero-cta">
          <a href="${appUrl}/signup?industry=${industry.slug}" class="btn btn-primary btn-large">
            Start Free Trial
          </a>
          <a href="#how-it-works" class="btn btn-outline btn-large">
            See How It Works
          </a>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="stats">
      <div class="container">
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-number">${industry.leadsCount.toLocaleString()}+</span>
            <span class="stat-label">${industry.name} Leads Available</span>
          </div>
          <div class="stat-card">
            <span class="stat-number">${industry.countriesCount}</span>
            <span class="stat-label">Countries Covered</span>
          </div>
          <div class="stat-card">
            <span class="stat-number">${industry.avgResponseRate}%</span>
            <span class="stat-label">Average Response Rate</span>
          </div>
          <div class="stat-card">
            <span class="stat-number">30+</span>
            <span class="stat-label">Languages Supported</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Pain Points Section -->
    <section class="content-section">
      <div class="container">
        <h2>Challenges ${industry.namePlural} Face</h2>
        <p class="section-subtitle">ValidateCall helps solve common ${industry.name.toLowerCase()} business challenges</p>
        <div class="cards-grid">
          ${industry.painPoints.map(point => `
            <div class="card">
              <h3>${point}</h3>
              <p>Our AI-powered market research helps you understand and overcome this challenge through real conversations with your target market.</p>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- Use Cases Section -->
    <section class="content-section alt-bg" id="how-it-works">
      <div class="container">
        <h2>How ${industry.namePlural} Use ValidateCall</h2>
        <p class="section-subtitle">Real use cases from ${industry.name.toLowerCase()} businesses</p>
        <div class="use-cases-grid">
          ${industry.useCases.map((useCase, i) => `
            <div class="use-case-card">
              <span class="use-case-number">${i + 1}</span>
              <h3>${useCase}</h3>
              <p>Deploy AI agents to conduct market research calls and gather insights for ${useCase.toLowerCase()}.</p>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- Locations Section -->
    <section class="content-section">
      <div class="container">
        <h2>Find ${industry.name} Leads By Location</h2>
        <p class="section-subtitle">Access verified ${industry.name.toLowerCase()} leads in cities worldwide</p>
        <div class="locations-grid">
          ${topLocations.map(loc => {
            const cityName = loc.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            return `
              <a href="${siteUrl}/${industry.slug}-leads-in-${loc}" class="location-card">
                <span class="location-name">${cityName}</span>
                <span class="location-arrow">→</span>
              </a>
            `;
          }).join('')}
        </div>
        <div class="view-all">
          <a href="${siteUrl}/locations" class="btn btn-outline">View All Locations</a>
        </div>
      </div>
    </section>

    <!-- Related Industries -->
    ${relatedIndustries.length > 0 ? `
    <section class="content-section alt-bg">
      <div class="container">
        <h2>Related Industries</h2>
        <p class="section-subtitle">Explore lead generation for similar industries</p>
        <div class="related-grid">
          ${relatedIndustries.map(rel => `
            <a href="${siteUrl}/industries/${rel.slug}" class="related-card">
              <h3>${rel.name}</h3>
              <span>${rel.leadsCount.toLocaleString()}+ leads</span>
            </a>
          `).join('')}
        </div>
      </div>
    </section>
    ` : ''}

    <!-- FAQ Section -->
    <section class="content-section">
      <div class="container">
        <h2>Frequently Asked Questions</h2>
        <div class="faq-list">
          ${faqItems.map(faq => `
            <details class="faq-item">
              <summary>${faq.question}</summary>
              <p>${faq.answer}</p>
            </details>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="container">
        <h2>Ready to Find ${industry.name} Leads?</h2>
        <p>Start your free trial and connect with ${industry.namePlural.toLowerCase()} in minutes</p>
        <a href="${appUrl}/signup?industry=${industry.slug}" class="btn btn-primary btn-large">
          Start Free Trial - No Credit Card Required
        </a>
      </div>
    </section>
  </main>

  <!-- Footer -->
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-col">
          <h4>ValidateCall</h4>
          <p>AI-powered lead generation and market research platform</p>
        </div>
        <div class="footer-col">
          <h4>Product</h4>
          <a href="${siteUrl}/#features">Features</a>
          <a href="${siteUrl}/pricing">Pricing</a>
          <a href="${siteUrl}/industries">Industries</a>
        </div>
        <div class="footer-col">
          <h4>Resources</h4>
          <a href="${siteUrl}/blog">Blog</a>
          <a href="${siteUrl}/use-cases">Use Cases</a>
          <a href="${siteUrl}/compare">Comparisons</a>
        </div>
        <div class="footer-col">
          <h4>Legal</h4>
          <a href="${siteUrl}/privacy">Privacy Policy</a>
          <a href="${siteUrl}/terms">Terms of Service</a>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; ${new Date().getFullYear()} ValidateCall. All rights reserved.</p>
      </div>
    </div>
  </footer>
</body>
</html>`;
}

function generateFAQItems(industry: Industry): Array<{ question: string; answer: string }> {
  return [
    {
      question: `How many ${industry.name.toLowerCase()} leads does ValidateCall have?`,
      answer: `ValidateCall has access to over ${industry.leadsCount.toLocaleString()} verified ${industry.name.toLowerCase()} leads across ${industry.countriesCount} countries. Our database is updated daily to ensure accuracy.`
    },
    {
      question: `Can I filter ${industry.name.toLowerCase()} leads by location?`,
      answer: `Yes! You can filter ${industry.name.toLowerCase()} leads by country, city, and region. We cover major markets worldwide including the US, UK, Europe, Australia, and more.`
    },
    {
      question: `What languages can the AI agents speak for ${industry.name.toLowerCase()} calls?`,
      answer: `Our AI agents support 30+ languages, making it easy to conduct market research with ${industry.namePlural.toLowerCase()} anywhere in the world in their native language.`
    },
    {
      question: `How does ValidateCall ensure ${industry.name.toLowerCase()} lead quality?`,
      answer: `We verify all ${industry.name.toLowerCase()} leads through multiple data sources, check for active business status, and validate contact information before adding them to our database.`
    },
    {
      question: `What's the average response rate for ${industry.name.toLowerCase()} leads?`,
      answer: `${industry.namePlural} on ValidateCall have an average response rate of ${industry.avgResponseRate}%, which is significantly higher than cold calling industry averages thanks to our AI-powered approach.`
    }
  ];
}

function getBaseStyles(): string {
  return `
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
    .btn-primary:hover { background: #2563eb; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(59,130,246,0.4); }
    .btn-outline { border: 2px solid #3b82f6; color: #3b82f6; }
    .btn-outline:hover { background: #3b82f6; color: #fff; }
    .btn-large { padding: 14px 28px; font-size: 1.1rem; }

    /* Breadcrumbs */
    .breadcrumbs { padding: 12px 0; background: #f8fafc; }
    .breadcrumbs ol { display: flex; list-style: none; gap: 8px; font-size: 0.9rem; }
    .breadcrumbs li::after { content: '/'; margin-left: 8px; color: #94a3b8; }
    .breadcrumbs li:last-child::after { content: ''; }
    .breadcrumbs a { color: #3b82f6; text-decoration: none; }

    /* Hero */
    .hero { background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%); color: #fff; padding: 80px 0; text-align: center; position: relative; overflow: hidden; }
    .hero::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"); }
    .hero h1 { font-size: 2.5rem; margin-bottom: 16px; position: relative; }
    .hero-subtitle { font-size: 1.25rem; opacity: 0.9; margin-bottom: 32px; max-width: 600px; margin-left: auto; margin-right: auto; position: relative; }
    .hero-cta { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; position: relative; }

    /* Stats */
    .stats { padding: 60px 0; background: #fff; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px; }
    .stat-card { text-align: center; padding: 24px; background: #f8fafc; border-radius: 12px; transition: transform 0.3s, box-shadow 0.3s; }
    .stat-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.1); }
    .stat-number { display: block; font-size: 2.5rem; font-weight: 700; color: #3b82f6; }
    .stat-label { color: #64748b; font-size: 0.9rem; }

    /* Visual Bar Charts */
    .chart-container { padding: 32px; background: #fff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .chart-title { font-size: 1.25rem; font-weight: 700; color: #1e3a5f; margin-bottom: 24px; text-align: center; }
    .bar-chart { display: flex; flex-direction: column; gap: 16px; }
    .bar-item { display: flex; align-items: center; gap: 16px; }
    .bar-label { min-width: 140px; font-size: 0.9rem; color: #475569; font-weight: 500; }
    .bar-track { flex: 1; height: 32px; background: #e2e8f0; border-radius: 16px; overflow: hidden; position: relative; }
    .bar-fill { height: 100%; border-radius: 16px; display: flex; align-items: center; justify-content: flex-end; padding-right: 12px; color: #fff; font-weight: 600; font-size: 0.85rem; transition: width 1s ease-out; }
    .bar-fill.blue { background: linear-gradient(90deg, #3b82f6, #1d4ed8); }
    .bar-fill.green { background: linear-gradient(90deg, #10b981, #059669); }
    .bar-fill.purple { background: linear-gradient(90deg, #8b5cf6, #6d28d9); }
    .bar-fill.orange { background: linear-gradient(90deg, #f59e0b, #d97706); }

    /* Donut Chart */
    .donut-chart-container { display: flex; align-items: center; justify-content: center; gap: 40px; flex-wrap: wrap; }
    .donut-chart { position: relative; width: 180px; height: 180px; }
    .donut-chart svg { transform: rotate(-90deg); }
    .donut-chart circle { fill: none; stroke-width: 20; }
    .donut-track { stroke: #e2e8f0; }
    .donut-fill { stroke-linecap: round; transition: stroke-dashoffset 1s ease-out; }
    .donut-center { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; }
    .donut-value { font-size: 2rem; font-weight: 700; color: #1e3a5f; }
    .donut-label { font-size: 0.85rem; color: #64748b; }
    .donut-legend { display: flex; flex-direction: column; gap: 12px; }
    .legend-item { display: flex; align-items: center; gap: 8px; }
    .legend-dot { width: 12px; height: 12px; border-radius: 50%; }

    /* Comparison Table */
    .comparison-table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .comparison-table th { background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%); color: #fff; padding: 20px 16px; font-weight: 600; text-align: left; }
    .comparison-table th:first-child { border-radius: 16px 0 0 0; }
    .comparison-table th:last-child { border-radius: 0 16px 0 0; }
    .comparison-table td { padding: 16px; border-bottom: 1px solid #e5e7eb; }
    .comparison-table tr:last-child td { border-bottom: none; }
    .comparison-table tr:hover td { background: #f8fafc; }
    .check-icon { color: #10b981; font-size: 1.25rem; }
    .cross-icon { color: #ef4444; font-size: 1.25rem; }
    .partial-icon { color: #f59e0b; font-size: 1.25rem; }

    /* Feature Cards with Icons */
    .feature-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
    .feature-card { background: #fff; padding: 32px 24px; border-radius: 16px; border: 1px solid #e5e7eb; transition: all 0.3s; text-align: center; }
    .feature-card:hover { border-color: #3b82f6; box-shadow: 0 12px 24px rgba(59,130,246,0.15); transform: translateY(-4px); }
    .feature-icon { width: 64px; height: 64px; margin: 0 auto 20px; background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 1.75rem; }
    .feature-card h3 { font-size: 1.1rem; color: #1e3a5f; margin-bottom: 12px; }
    .feature-card p { color: #64748b; font-size: 0.95rem; line-height: 1.6; }

    /* Progress Stats */
    .progress-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
    .progress-stat { background: #fff; padding: 24px; border-radius: 16px; border: 1px solid #e5e7eb; }
    .progress-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .progress-title { font-weight: 600; color: #1e3a5f; }
    .progress-value { font-weight: 700; color: #3b82f6; font-size: 1.25rem; }
    .progress-bar { height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }
    .progress-fill { height: 100%; border-radius: 4px; transition: width 1s ease-out; }
    .progress-fill.excellent { background: linear-gradient(90deg, #10b981, #059669); }
    .progress-fill.good { background: linear-gradient(90deg, #3b82f6, #1d4ed8); }
    .progress-fill.moderate { background: linear-gradient(90deg, #f59e0b, #d97706); }

    /* Timeline / Steps */
    .steps-timeline { position: relative; padding-left: 40px; }
    .steps-timeline::before { content: ''; position: absolute; left: 15px; top: 0; bottom: 0; width: 2px; background: linear-gradient(180deg, #3b82f6, #8b5cf6); }
    .step-item { position: relative; padding-bottom: 32px; }
    .step-item:last-child { padding-bottom: 0; }
    .step-number { position: absolute; left: -40px; width: 32px; height: 32px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; box-shadow: 0 4px 12px rgba(59,130,246,0.4); }
    .step-content { background: #fff; padding: 20px 24px; border-radius: 12px; border: 1px solid #e5e7eb; margin-left: 8px; }
    .step-content h4 { color: #1e3a5f; margin-bottom: 8px; }
    .step-content p { color: #64748b; font-size: 0.95rem; }

    /* Content Sections */
    .content-section { padding: 80px 0; }
    .content-section.alt-bg { background: #f8fafc; }
    .content-section h2 { font-size: 2rem; text-align: center; margin-bottom: 12px; }
    .section-subtitle { text-align: center; color: #64748b; margin-bottom: 48px; }

    /* Cards Grid */
    .cards-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
    .card { background: #fff; padding: 24px; border-radius: 12px; border: 1px solid #e5e7eb; transition: all 0.3s; }
    .card:hover { border-color: #3b82f6; box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
    .card h3 { margin-bottom: 12px; color: #1e3a5f; }

    /* Use Cases */
    .use-cases-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 24px; }
    .use-case-card { background: #fff; padding: 24px; border-radius: 12px; border: 1px solid #e5e7eb; position: relative; transition: all 0.3s; }
    .use-case-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.1); }
    .use-case-number { position: absolute; top: -12px; left: 24px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: #fff; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; box-shadow: 0 4px 12px rgba(59,130,246,0.4); }

    /* Locations */
    .locations-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 32px; }
    .location-card { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; text-decoration: none; color: #1e3a5f; transition: all 0.2s; }
    .location-card:hover { border-color: #3b82f6; background: #f0f9ff; transform: translateX(4px); }
    .view-all { text-align: center; }

    /* Related */
    .related-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
    .related-card { padding: 20px; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; text-decoration: none; color: #1e3a5f; transition: all 0.3s; }
    .related-card:hover { border-color: #3b82f6; transform: translateY(-2px); }
    .related-card span { color: #64748b; font-size: 0.9rem; }

    /* FAQ */
    .faq-list { max-width: 800px; margin: 0 auto; }
    .faq-item { border: 1px solid #e5e7eb; border-radius: 12px; margin-bottom: 12px; overflow: hidden; transition: all 0.3s; }
    .faq-item:hover { border-color: #3b82f6; }
    .faq-item summary { padding: 20px 24px; cursor: pointer; font-weight: 600; background: #fff; display: flex; align-items: center; gap: 12px; }
    .faq-item summary::before { content: '?'; width: 28px; height: 28px; background: linear-gradient(135deg, #eff6ff, #dbeafe); color: #3b82f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; }
    .faq-item summary:hover { background: #f8fafc; }
    .faq-item[open] summary { border-bottom: 1px solid #e5e7eb; }
    .faq-item p { padding: 20px 24px 20px 64px; color: #475569; line-height: 1.7; }

    /* CTA */
    .cta-section { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #fff; padding: 80px 0; text-align: center; position: relative; overflow: hidden; }
    .cta-section::before { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%); animation: pulse 4s ease-in-out infinite; }
    @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 0.5; } 50% { transform: scale(1.1); opacity: 0.3; } }
    .cta-section h2 { font-size: 2rem; margin-bottom: 12px; position: relative; }
    .cta-section p { opacity: 0.9; margin-bottom: 32px; position: relative; }
    .cta-section .btn-primary { background: #fff; color: #3b82f6; position: relative; }
    .cta-section .btn-primary:hover { background: #f0f9ff; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.2); }

    /* Footer */
    .footer { background: #0f172a; color: #94a3b8; padding: 60px 0 24px; }
    .footer-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 40px; margin-bottom: 40px; }
    .footer-col h4 { color: #fff; margin-bottom: 16px; }
    .footer-col a { display: block; color: #94a3b8; text-decoration: none; margin-bottom: 8px; transition: color 0.2s; }
    .footer-col a:hover { color: #fff; }
    .footer-bottom { border-top: 1px solid #1e293b; padding-top: 24px; text-align: center; }

    /* Animations */
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .animate-in { animation: fadeInUp 0.6s ease-out forwards; }

    @media (max-width: 768px) {
      .hero h1 { font-size: 1.75rem; }
      .nav { display: none; }
      .hero-cta { flex-direction: column; }
      .bar-label { min-width: 100px; font-size: 0.8rem; }
      .donut-chart-container { flex-direction: column; }
      .comparison-table { font-size: 0.85rem; }
      .comparison-table th, .comparison-table td { padding: 12px 8px; }
      .two-col-layout { grid-template-columns: 1fr !important; }
      .steps-timeline { margin-bottom: 32px; }
    }
  `;
}

/**
 * Generate page using AI-generated content from KV cache
 */
function generateDynamicIndustryPage(industry: Industry, content: GeneratedContent, env: any): string {
  const siteUrl = env?.SITE_URL || 'https://validatecall.com';
  const appUrl = env?.APP_URL || 'https://app.validatecall.com';

  const relatedIndustries = getRelatedIndustries(industry.slug);
  const topLocations = industry.topLocations.slice(0, 8);

  // Enhanced Schema markup for GEO/2026 SEO
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "ValidateCall",
    "url": siteUrl,
    "logo": `${siteUrl}/logo.png`,
    "description": "AI-powered lead generation and market research platform",
    "foundingDate": "2024",
    "sameAs": [
      "https://twitter.com/validatecall",
      "https://linkedin.com/company/validatecall"
    ]
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": content.heroTitle,
    "description": content.metaDescription,
    "author": {
      "@type": "Organization",
      "name": "ValidateCall"
    },
    "publisher": {
      "@type": "Organization",
      "name": "ValidateCall",
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/logo.png`
      }
    },
    "datePublished": content.generatedAt,
    "dateModified": content.generatedAt,
    "mainEntityOfPage": `${siteUrl}/industries/${industry.slug}`
  };

  // Service Schema
  const schemaMarkup = generateSchemaMarkup({
    type: 'Service',
    name: `ValidateCall ${industry.name} Lead Generation`,
    description: content.metaDescription,
    provider: 'ValidateCall',
    areaServed: 'Worldwide',
    serviceType: 'Lead Generation'
  });

  const faqSchema = generateFAQSchema(content.faqItems);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${content.title}</title>
  <meta name="description" content="${content.metaDescription}">
  <link rel="canonical" href="${siteUrl}/industries/${industry.slug}">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="${content.title}">
  <meta property="og:description" content="${content.metaDescription}">
  <meta property="og:url" content="${siteUrl}/industries/${industry.slug}">
  <meta property="og:site_name" content="ValidateCall">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${content.title}">
  <meta name="twitter:description" content="${content.metaDescription}">

  <!-- Schema.org - Enhanced for GEO/2026 SEO -->
  <script type="application/ld+json">${JSON.stringify(organizationSchema)}</script>
  <script type="application/ld+json">${JSON.stringify(articleSchema)}</script>
  <script type="application/ld+json">${JSON.stringify(schemaMarkup)}</script>
  <script type="application/ld+json">${JSON.stringify(faqSchema)}</script>

  <!-- AI Content Generated -->
  <meta name="generator" content="ValidateCall AI - ${content.generatedAt}">
  <meta name="article:published_time" content="${content.generatedAt}">
  <meta name="article:modified_time" content="${content.generatedAt}">

  <style>
    ${getBaseStyles()}
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
        <a href="${appUrl}/signup?industry=${industry.slug}" class="btn btn-primary">Get Started</a>
      </nav>
    </div>
  </header>

  <main>
    <!-- Breadcrumbs -->
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <div class="container">
        <ol itemscope itemtype="https://schema.org/BreadcrumbList">
          <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
            <a itemprop="item" href="${siteUrl}"><span itemprop="name">Home</span></a>
            <meta itemprop="position" content="1">
          </li>
          <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
            <a itemprop="item" href="${siteUrl}/industries"><span itemprop="name">Industries</span></a>
            <meta itemprop="position" content="2">
          </li>
          <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
            <span itemprop="name">${industry.name}</span>
            <meta itemprop="position" content="3">
          </li>
        </ol>
      </div>
    </nav>

    <!-- Hero Section - AI Generated -->
    <section class="hero">
      <div class="container">
        <h1>${content.heroTitle}</h1>
        <p class="hero-subtitle">${content.heroSubtitle}</p>
        <div class="hero-cta">
          <a href="${appUrl}/signup?industry=${industry.slug}" class="btn btn-primary btn-large">
            ${content.ctaText}
          </a>
          <a href="#how-it-works" class="btn btn-outline btn-large">
            See How It Works
          </a>
        </div>
      </div>
    </section>

    <!-- GEO: Definition Block for AI Extraction -->
    ${content.definition ? `
    <section class="content-section" style="padding: 40px 0; background: #f8fafc;">
      <div class="container" style="max-width: 800px;">
        <div style="padding: 24px; background: #fff; border-radius: 12px; border: 1px solid #e5e7eb;">
          <p style="font-size: 1.1rem; line-height: 1.7; color: #1e3a5f; margin: 0;"><strong>${industry.name} Lead Generation</strong> is ${content.definition}</p>
        </div>
      </div>
    </section>
    ` : ''}

    <!-- GEO: Quick Answer (Inverted Pyramid) -->
    <section class="content-section" style="padding: 48px 0;">
      <div class="container" style="max-width: 800px; text-align: center;">
        ${content.quickAnswer ? `
        <div style="margin-bottom: 32px; padding: 24px; background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-radius: 12px;">
          <p style="font-size: 1.15rem; line-height: 1.8; color: #1e40af; margin: 0;"><strong>${content.quickAnswer}</strong></p>
        </div>
        ` : ''}
        <p style="font-size: 1.1rem; line-height: 1.8; color: #475569;">${content.introduction}</p>
        ${content.trendInsight ? `
        <div style="margin-top: 24px; padding: 20px; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 12px; border-left: 4px solid #3b82f6;">
          <p style="font-size: 1rem; color: #1e40af; margin: 0;"><strong>📈 Industry Insight:</strong> ${content.trendInsight}</p>
        </div>
        ` : ''}
      </div>
    </section>

    <!-- GEO: Key Statistics with Visual Bar Chart -->
    ${content.keyStats && content.keyStats.length > 0 ? `
    <section class="content-section" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #fff;">
      <div class="container">
        <h2 style="text-align: center; margin-bottom: 16px; color: #fff;">${industry.name} Industry Statistics</h2>
        <p class="section-subtitle" style="color: #94a3b8;">Key metrics that matter for ${industry.name.toLowerCase()} lead generation</p>

        <!-- Visual Stats Cards -->
        <div class="stats-grid" style="margin-bottom: 48px;">
          ${content.keyStats.map((stat, i) => `
            <div class="stat-card" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px);">
              <span class="stat-number" style="color: ${['#60a5fa', '#34d399', '#a78bfa'][i % 3]};">${stat.stat}</span>
              <span class="stat-label" style="color: #cbd5e1;">${stat.context}</span>
            </div>
          `).join('')}
        </div>

        <!-- Visual Bar Chart -->
        <div class="chart-container" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);">
          <h3 class="chart-title" style="color: #fff;">Performance Comparison</h3>
          <div class="bar-chart">
            <div class="bar-item">
              <span class="bar-label" style="color: #cbd5e1;">Response Rate</span>
              <div class="bar-track" style="background: rgba(255,255,255,0.1);">
                <div class="bar-fill green" style="width: ${industry.avgResponseRate}%;">${industry.avgResponseRate}%</div>
              </div>
            </div>
            <div class="bar-item">
              <span class="bar-label" style="color: #cbd5e1;">Lead Quality Score</span>
              <div class="bar-track" style="background: rgba(255,255,255,0.1);">
                <div class="bar-fill blue" style="width: 87%;">87%</div>
              </div>
            </div>
            <div class="bar-item">
              <span class="bar-label" style="color: #cbd5e1;">Time Saved</span>
              <div class="bar-track" style="background: rgba(255,255,255,0.1);">
                <div class="bar-fill purple" style="width: 73%;">73%</div>
              </div>
            </div>
            <div class="bar-item">
              <span class="bar-label" style="color: #cbd5e1;">Cost Reduction</span>
              <div class="bar-track" style="background: rgba(255,255,255,0.1);">
                <div class="bar-fill orange" style="width: 65%;">65%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    ` : ''}

    <!-- Benefits - Visual Feature Cards -->
    <section class="content-section">
      <div class="container">
        <h2>Why Choose ValidateCall for ${industry.name}</h2>
        <p class="section-subtitle">Powerful features designed specifically for ${industry.name.toLowerCase()} lead generation</p>
        <div class="feature-cards">
          ${content.benefits.map((benefit, i) => `
            <div class="feature-card">
              <div class="feature-icon">${['🎯', '⚡', '📊', '🔒'][i] || '✓'}</div>
              <h3>${benefit.split(' ').slice(0, 4).join(' ')}</h3>
              <p>${benefit}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- Comparison Table: ValidateCall vs Traditional Methods -->
    <section class="content-section alt-bg">
      <div class="container">
        <h2>ValidateCall vs Traditional Lead Generation</h2>
        <p class="section-subtitle">See how AI-powered lead generation compares to traditional methods</p>
        <div style="overflow-x: auto;">
          <table class="comparison-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>ValidateCall</th>
                <th>Cold Calling</th>
                <th>Manual Research</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Response Rate</strong></td>
                <td><span class="check-icon">✓</span> ${industry.avgResponseRate}%+ verified</td>
                <td><span class="cross-icon">✗</span> 2-3% typical</td>
                <td><span class="partial-icon">~</span> Varies widely</td>
              </tr>
              <tr>
                <td><strong>Time to Results</strong></td>
                <td><span class="check-icon">✓</span> Minutes</td>
                <td><span class="cross-icon">✗</span> Weeks</td>
                <td><span class="cross-icon">✗</span> Days to weeks</td>
              </tr>
              <tr>
                <td><strong>Cost per Lead</strong></td>
                <td><span class="check-icon">✓</span> Low, predictable</td>
                <td><span class="cross-icon">✗</span> High labor costs</td>
                <td><span class="partial-icon">~</span> Medium</td>
              </tr>
              <tr>
                <td><strong>Scale</strong></td>
                <td><span class="check-icon">✓</span> ${industry.leadsCount.toLocaleString()}+ leads</td>
                <td><span class="cross-icon">✗</span> Limited by team</td>
                <td><span class="cross-icon">✗</span> Time-intensive</td>
              </tr>
              <tr>
                <td><strong>AI-Powered Insights</strong></td>
                <td><span class="check-icon">✓</span> Full analysis</td>
                <td><span class="cross-icon">✗</span> None</td>
                <td><span class="partial-icon">~</span> Manual only</td>
              </tr>
              <tr>
                <td><strong>24/7 Availability</strong></td>
                <td><span class="check-icon">✓</span> Always on</td>
                <td><span class="cross-icon">✗</span> Business hours</td>
                <td><span class="cross-icon">✗</span> Manual effort</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- How It Works - Visual Timeline -->
    <section class="content-section" id="how-it-works">
      <div class="container">
        <h2>How It Works</h2>
        <p class="section-subtitle">Get started with ${industry.name.toLowerCase()} lead generation in 3 simple steps</p>

        <div class="two-col-layout" style="display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center;">
          <!-- Timeline Steps -->
          <div class="steps-timeline">
            ${content.howItWorks.map((step, i) => `
              <div class="step-item">
                <span class="step-number">${i + 1}</span>
                <div class="step-content">
                  <h4>Step ${i + 1}</h4>
                  <p>${step}</p>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Visual Donut Chart -->
          <div class="chart-container" style="text-align: center;">
            <h3 class="chart-title">Success Metrics</h3>
            <div class="donut-chart-container">
              <div class="donut-chart">
                <svg width="180" height="180" viewBox="0 0 180 180">
                  <circle class="donut-track" cx="90" cy="90" r="70"></circle>
                  <circle class="donut-fill" cx="90" cy="90" r="70" stroke="#3b82f6"
                    stroke-dasharray="${industry.avgResponseRate * 4.4} 440"
                    stroke-dashoffset="0"></circle>
                </svg>
                <div class="donut-center">
                  <div class="donut-value">${industry.avgResponseRate}%</div>
                  <div class="donut-label">Response Rate</div>
                </div>
              </div>
              <div class="donut-legend">
                <div class="legend-item">
                  <div class="legend-dot" style="background: #3b82f6;"></div>
                  <span>Response Rate: ${industry.avgResponseRate}%</span>
                </div>
                <div class="legend-item">
                  <div class="legend-dot" style="background: #10b981;"></div>
                  <span>Lead Accuracy: 95%+</span>
                </div>
                <div class="legend-item">
                  <div class="legend-dot" style="background: #8b5cf6;"></div>
                  <span>Time Saved: 73%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Pain Points - Visual Cards with Icons -->
    <section class="content-section alt-bg">
      <div class="container">
        <h2>Challenges We Help Solve</h2>
        <p class="section-subtitle">Common ${industry.name.toLowerCase()} challenges that ValidateCall addresses</p>
        <div class="cards-grid">
          ${content.painPointsContent.map((point, i) => `
            <div class="card" style="border-left: 4px solid ${['#ef4444', '#f59e0b', '#8b5cf6'][i % 3]};">
              <div style="display: flex; align-items: flex-start; gap: 16px;">
                <div style="width: 48px; height: 48px; background: ${['#fef2f2', '#fffbeb', '#f5f3ff'][i % 3]}; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 1.5rem;">
                  ${['🚧', '⏰', '💸'][i % 3]}
                </div>
                <div>
                  <h3 style="margin-bottom: 8px;">${point.title}</h3>
                  <p style="margin: 0; color: #64748b;">${point.description}</p>
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Progress Bars Section -->
        <div style="margin-top: 48px;">
          <h3 style="text-align: center; margin-bottom: 24px; color: #1e3a5f;">How ValidateCall Improves Key Metrics</h3>
          <div class="progress-stats">
            <div class="progress-stat">
              <div class="progress-header">
                <span class="progress-title">Lead Quality Improvement</span>
                <span class="progress-value">+87%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill excellent" style="width: 87%;"></div>
              </div>
            </div>
            <div class="progress-stat">
              <div class="progress-header">
                <span class="progress-title">Time to First Contact</span>
                <span class="progress-value">-65%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill good" style="width: 65%;"></div>
              </div>
            </div>
            <div class="progress-stat">
              <div class="progress-header">
                <span class="progress-title">Cost per Qualified Lead</span>
                <span class="progress-value">-52%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill moderate" style="width: 52%;"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Use Cases - Visual Cards -->
    <section class="content-section">
      <div class="container">
        <h2>Use Cases for ${industry.namePlural}</h2>
        <p class="section-subtitle">Discover how ${industry.namePlural.toLowerCase()} leverage ValidateCall</p>
        <div class="feature-cards">
          ${content.useCasesContent.map((useCase, i) => `
            <div class="feature-card" style="text-align: left;">
              <div class="feature-icon" style="margin: 0 0 20px 0; background: linear-gradient(135deg, ${['#dbeafe', '#d1fae5', '#ede9fe'][i % 3]} 0%, ${['#bfdbfe', '#a7f3d0', '#ddd6fe'][i % 3]} 100%);">
                ${['💼', '📈', '🎯'][i % 3]}
              </div>
              <h3>${useCase.title}</h3>
              <p>${useCase.description}</p>
              <a href="#" style="color: #3b82f6; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 4px; margin-top: 12px;">
                Learn more <span style="transition: transform 0.2s;">→</span>
              </a>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- Locations Section with Visual Stats -->
    <section class="content-section alt-bg">
      <div class="container">
        <h2>Find ${industry.name} Leads By Location</h2>
        <p class="section-subtitle">Access verified ${industry.name.toLowerCase()} leads in cities worldwide</p>

        <!-- Visual Location Stats -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-bottom: 32px;">
          <div style="background: #fff; padding: 20px; border-radius: 12px; text-align: center; border: 1px solid #e5e7eb;">
            <div style="font-size: 2rem; margin-bottom: 8px;">🌍</div>
            <div style="font-size: 1.5rem; font-weight: 700; color: #3b82f6;">${industry.countriesCount}</div>
            <div style="font-size: 0.85rem; color: #64748b;">Countries</div>
          </div>
          <div style="background: #fff; padding: 20px; border-radius: 12px; text-align: center; border: 1px solid #e5e7eb;">
            <div style="font-size: 2rem; margin-bottom: 8px;">🏙️</div>
            <div style="font-size: 1.5rem; font-weight: 700; color: #10b981;">500+</div>
            <div style="font-size: 0.85rem; color: #64748b;">Cities</div>
          </div>
          <div style="background: #fff; padding: 20px; border-radius: 12px; text-align: center; border: 1px solid #e5e7eb;">
            <div style="font-size: 2rem; margin-bottom: 8px;">📊</div>
            <div style="font-size: 1.5rem; font-weight: 700; color: #8b5cf6;">${industry.leadsCount.toLocaleString()}+</div>
            <div style="font-size: 0.85rem; color: #64748b;">Total Leads</div>
          </div>
          <div style="background: #fff; padding: 20px; border-radius: 12px; text-align: center; border: 1px solid #e5e7eb;">
            <div style="font-size: 2rem; margin-bottom: 8px;">🔄</div>
            <div style="font-size: 1.5rem; font-weight: 700; color: #f59e0b;">Daily</div>
            <div style="font-size: 0.85rem; color: #64748b;">Updates</div>
          </div>
        </div>

        <h3 style="text-align: center; margin-bottom: 20px; color: #1e3a5f;">Popular Locations</h3>
        <div class="locations-grid">
          ${topLocations.map(loc => {
            const cityName = loc.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            return `
              <a href="${siteUrl}/${industry.slug}-leads-in-${loc}" class="location-card">
                <span class="location-name">${cityName}</span>
                <span class="location-arrow">→</span>
              </a>
            `;
          }).join('')}
        </div>
        <div class="view-all">
          <a href="${siteUrl}/locations" class="btn btn-outline">View All Locations</a>
        </div>
      </div>
    </section>

    <!-- Related Industries -->
    ${relatedIndustries.length > 0 ? `
    <section class="content-section">
      <div class="container">
        <h2>Related Industries</h2>
        <p class="section-subtitle">Explore lead generation for similar industries</p>
        <div class="related-grid">
          ${relatedIndustries.map(rel => `
            <a href="${siteUrl}/industries/${rel.slug}" class="related-card">
              <h3>${rel.name}</h3>
              <span>${rel.leadsCount.toLocaleString()}+ leads</span>
            </a>
          `).join('')}
        </div>
      </div>
    </section>
    ` : ''}

    <!-- FAQ Section - AI Generated -->
    <section class="content-section">
      <div class="container">
        <h2>Frequently Asked Questions</h2>
        <div class="faq-list">
          ${content.faqItems.map(faq => `
            <details class="faq-item">
              <summary>${faq.question}</summary>
              <p>${faq.answer}</p>
            </details>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="container">
        <h2>Ready to Find ${industry.name} Leads?</h2>
        <p>Start your free trial and connect with ${industry.namePlural.toLowerCase()} in minutes</p>
        <a href="${appUrl}/signup?industry=${industry.slug}" class="btn btn-primary btn-large">
          ${content.ctaText} - Free Trial
        </a>
      </div>
    </section>
  </main>

  <!-- Footer -->
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-col">
          <h4>ValidateCall</h4>
          <p>AI-powered lead generation and market research platform</p>
        </div>
        <div class="footer-col">
          <h4>Product</h4>
          <a href="${siteUrl}/#features">Features</a>
          <a href="${siteUrl}/pricing">Pricing</a>
          <a href="${siteUrl}/industries">Industries</a>
        </div>
        <div class="footer-col">
          <h4>Resources</h4>
          <a href="${siteUrl}/blog">Blog</a>
          <a href="${siteUrl}/use-cases">Use Cases</a>
          <a href="${siteUrl}/compare">Comparisons</a>
        </div>
        <div class="footer-col">
          <h4>Legal</h4>
          <a href="${siteUrl}/privacy">Privacy Policy</a>
          <a href="${siteUrl}/terms">Terms of Service</a>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; ${new Date().getFullYear()} ValidateCall. All rights reserved.</p>
      </div>
    </div>
  </footer>
</body>
</html>`;
}
