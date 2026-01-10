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
    .btn-primary:hover { background: #2563eb; }
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
    .hero { background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%); color: #fff; padding: 80px 0; text-align: center; }
    .hero h1 { font-size: 2.5rem; margin-bottom: 16px; }
    .hero-subtitle { font-size: 1.25rem; opacity: 0.9; margin-bottom: 32px; max-width: 600px; margin-left: auto; margin-right: auto; }
    .hero-cta { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }

    /* Stats */
    .stats { padding: 60px 0; background: #fff; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px; }
    .stat-card { text-align: center; padding: 24px; background: #f8fafc; border-radius: 12px; }
    .stat-number { display: block; font-size: 2.5rem; font-weight: 700; color: #3b82f6; }
    .stat-label { color: #64748b; font-size: 0.9rem; }

    /* Content Sections */
    .content-section { padding: 80px 0; }
    .content-section.alt-bg { background: #f8fafc; }
    .content-section h2 { font-size: 2rem; text-align: center; margin-bottom: 12px; }
    .section-subtitle { text-align: center; color: #64748b; margin-bottom: 48px; }

    /* Cards Grid */
    .cards-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
    .card { background: #fff; padding: 24px; border-radius: 12px; border: 1px solid #e5e7eb; }
    .card h3 { margin-bottom: 12px; color: #1e3a5f; }

    /* Use Cases */
    .use-cases-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 24px; }
    .use-case-card { background: #fff; padding: 24px; border-radius: 12px; border: 1px solid #e5e7eb; position: relative; }
    .use-case-number { position: absolute; top: -12px; left: 24px; background: #3b82f6; color: #fff; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; }

    /* Locations */
    .locations-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 32px; }
    .location-card { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; text-decoration: none; color: #1e3a5f; transition: all 0.2s; }
    .location-card:hover { border-color: #3b82f6; background: #f0f9ff; }
    .view-all { text-align: center; }

    /* Related */
    .related-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
    .related-card { padding: 20px; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; text-decoration: none; color: #1e3a5f; }
    .related-card:hover { border-color: #3b82f6; }
    .related-card span { color: #64748b; font-size: 0.9rem; }

    /* FAQ */
    .faq-list { max-width: 800px; margin: 0 auto; }
    .faq-item { border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 12px; overflow: hidden; }
    .faq-item summary { padding: 16px 20px; cursor: pointer; font-weight: 600; background: #fff; }
    .faq-item summary:hover { background: #f8fafc; }
    .faq-item p { padding: 0 20px 16px; color: #64748b; }

    /* CTA */
    .cta-section { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #fff; padding: 80px 0; text-align: center; }
    .cta-section h2 { font-size: 2rem; margin-bottom: 12px; }
    .cta-section p { opacity: 0.9; margin-bottom: 32px; }
    .cta-section .btn-primary { background: #fff; color: #3b82f6; }
    .cta-section .btn-primary:hover { background: #f0f9ff; }

    /* Footer */
    .footer { background: #0f172a; color: #94a3b8; padding: 60px 0 24px; }
    .footer-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 40px; margin-bottom: 40px; }
    .footer-col h4 { color: #fff; margin-bottom: 16px; }
    .footer-col a { display: block; color: #94a3b8; text-decoration: none; margin-bottom: 8px; }
    .footer-col a:hover { color: #fff; }
    .footer-bottom { border-top: 1px solid #1e293b; padding-top: 24px; text-align: center; }

    @media (max-width: 768px) {
      .hero h1 { font-size: 1.75rem; }
      .nav { display: none; }
      .hero-cta { flex-direction: column; }
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

  // Schema markup
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

  <!-- Schema.org -->
  <script type="application/ld+json">${JSON.stringify(schemaMarkup)}</script>
  <script type="application/ld+json">${JSON.stringify(faqSchema)}</script>

  <!-- AI Content Generated -->
  <meta name="generator" content="ValidateCall AI - ${content.generatedAt}">

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

    <!-- Introduction -->
    <section class="content-section">
      <div class="container" style="max-width: 800px; text-align: center;">
        <p style="font-size: 1.2rem; line-height: 1.8; color: #475569;">${content.introduction}</p>
      </div>
    </section>

    <!-- Benefits - AI Generated -->
    <section class="stats">
      <div class="container">
        <h2 style="text-align: center; margin-bottom: 32px;">Why Choose ValidateCall for ${industry.name}</h2>
        <div class="stats-grid">
          ${content.benefits.map((benefit, i) => `
            <div class="stat-card">
              <span class="stat-number" style="font-size: 2rem;">${['✓', '⚡', '🎯', '📈'][i] || '✓'}</span>
              <span class="stat-label" style="font-size: 1rem; color: #1e3a5f;">${benefit}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- How It Works - AI Generated -->
    <section class="content-section alt-bg" id="how-it-works">
      <div class="container">
        <h2>How It Works</h2>
        <p class="section-subtitle">Get started with ${industry.name.toLowerCase()} lead generation in 3 simple steps</p>
        <div class="use-cases-grid">
          ${content.howItWorks.map((step, i) => `
            <div class="use-case-card">
              <span class="use-case-number">${i + 1}</span>
              <p style="margin-top: 8px;">${step}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- Pain Points - AI Generated -->
    <section class="content-section">
      <div class="container">
        <h2>Challenges We Help Solve</h2>
        <p class="section-subtitle">Common ${industry.name.toLowerCase()} challenges that ValidateCall addresses</p>
        <div class="cards-grid">
          ${content.painPointsContent.map(point => `
            <div class="card">
              <h3>${point.title}</h3>
              <p>${point.description}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- Use Cases - AI Generated -->
    <section class="content-section alt-bg">
      <div class="container">
        <h2>Use Cases for ${industry.namePlural}</h2>
        <p class="section-subtitle">Discover how ${industry.namePlural.toLowerCase()} leverage ValidateCall</p>
        <div class="cards-grid">
          ${content.useCasesContent.map(useCase => `
            <div class="card">
              <h3>${useCase.title}</h3>
              <p>${useCase.description}</p>
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
