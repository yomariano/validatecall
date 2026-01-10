/**
 * Use case page handler
 */

import { Context } from 'hono';

const USE_CASES: Record<string, { title: string; description: string; benefits: string[] }> = {
  'startup-validation': {
    title: 'Startup Idea Validation',
    description: 'Validate your startup idea before investing time and money',
    benefits: ['Test product-market fit', 'Gather customer feedback', 'Refine your value proposition']
  },
  'market-research': {
    title: 'Market Research Surveys',
    description: 'Conduct comprehensive market research with AI-powered calls',
    benefits: ['Reach target demographics', 'Collect quantitative data', 'Understand market trends']
  },
  'customer-feedback': {
    title: 'Customer Feedback Collection',
    description: 'Gather valuable feedback from customers at scale',
    benefits: ['Improve products', 'Increase satisfaction', 'Reduce churn']
  },
  'lead-qualification': {
    title: 'Lead Qualification',
    description: 'Qualify leads automatically with AI conversations',
    benefits: ['Save sales time', 'Improve lead quality', 'Increase conversion rates']
  },
  'appointment-setting': {
    title: 'Appointment Setting',
    description: 'Schedule appointments and demos automatically',
    benefits: ['Fill your calendar', 'Reduce no-shows', 'Scale outreach']
  }
};

export async function useCaseHandler(c: Context): Promise<Response> {
  const useCaseSlug = c.req.param('useCase');
  const useCase = USE_CASES[useCaseSlug];

  if (!useCase) {
    return c.notFound();
  }

  const siteUrl = c.env?.SITE_URL || 'https://validatecall.com';
  const appUrl = c.env?.APP_URL || 'https://app.validatecall.com';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${useCase.title} | ValidateCall</title>
  <meta name="description" content="${useCase.description}. AI-powered market research and lead generation.">
  <link rel="canonical" href="${siteUrl}/use-cases/${useCaseSlug}">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
    .header { background: #fff; border-bottom: 1px solid #e5e7eb; padding: 16px 0; }
    .header-content { display: flex; justify-content: space-between; align-items: center; }
    .logo { font-weight: 700; font-size: 1.5rem; color: #3b82f6; text-decoration: none; }
    .btn { display: inline-block; padding: 10px 20px; border-radius: 8px; font-weight: 600; text-decoration: none; background: #3b82f6; color: #fff; }
    .hero { background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%); color: #fff; padding: 100px 0; text-align: center; }
    .hero h1 { font-size: 3rem; margin-bottom: 20px; }
    .hero p { font-size: 1.25rem; opacity: 0.9; margin-bottom: 40px; }
    .benefits { padding: 80px 0; }
    .benefits h2 { text-align: center; margin-bottom: 48px; font-size: 2rem; }
    .benefits-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; }
    .benefit-card { padding: 32px; background: #f8fafc; border-radius: 12px; text-align: center; }
    .benefit-card h3 { margin-bottom: 12px; color: #1e3a5f; }
    .cta { background: #3b82f6; color: #fff; padding: 80px 0; text-align: center; }
    .cta .btn { background: #fff; color: #3b82f6; padding: 14px 28px; }
    .footer { background: #0f172a; color: #94a3b8; padding: 40px 0; text-align: center; }
  </style>
</head>
<body>
  <header class="header">
    <div class="container header-content">
      <a href="${siteUrl}" class="logo">ValidateCall</a>
      <a href="${appUrl}/signup" class="btn">Get Started</a>
    </div>
  </header>

  <section class="hero">
    <div class="container">
      <h1>${useCase.title}</h1>
      <p>${useCase.description}</p>
      <a href="${appUrl}/signup" class="btn" style="padding: 14px 28px;">Start Free Trial</a>
    </div>
  </section>

  <section class="benefits">
    <div class="container">
      <h2>Key Benefits</h2>
      <div class="benefits-grid">
        ${useCase.benefits.map(benefit => `
          <div class="benefit-card">
            <h3>${benefit}</h3>
            <p>Our AI-powered platform makes ${benefit.toLowerCase()} simple and scalable.</p>
          </div>
        `).join('')}
      </div>
    </div>
  </section>

  <section class="cta">
    <div class="container">
      <h2>Ready for ${useCase.title}?</h2>
      <p style="margin-bottom: 32px; opacity: 0.9;">Start your free trial today</p>
      <a href="${appUrl}/signup" class="btn">Get Started Free</a>
    </div>
  </section>

  <footer class="footer">
    <div class="container">
      <p>&copy; ${new Date().getFullYear()} ValidateCall</p>
    </div>
  </footer>
</body>
</html>`;

  return c.html(html);
}
