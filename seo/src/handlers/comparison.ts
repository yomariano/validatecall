/**
 * Comparison page handler
 * Generates pages like: /compare/validatecall-vs-apollo
 */

import { Context } from 'hono';

const COMPETITORS: Record<string, { name: string; description: string; differences: string[] }> = {
  'apollo': {
    name: 'Apollo.io',
    description: 'Sales intelligence and engagement platform',
    differences: ['AI-powered voice calling', 'Market research focus', 'Multilingual support']
  },
  'instantly': {
    name: 'Instantly',
    description: 'Cold email outreach platform',
    differences: ['Voice-first approach', 'Real-time conversations', 'Higher response rates']
  },
  'lemlist': {
    name: 'Lemlist',
    description: 'Email outreach and personalization',
    differences: ['AI voice agents', 'Phone-based research', 'Instant feedback']
  },
  'aircall': {
    name: 'Aircall',
    description: 'Cloud phone system',
    differences: ['AI-powered automation', 'Lead generation included', 'Market research features']
  },
  'dialpad': {
    name: 'Dialpad',
    description: 'AI-powered communications',
    differences: ['Focused on outbound', 'Lead database included', 'Research-first approach']
  }
};

export async function comparisonHandler(c: Context, comparisonSlug?: string): Promise<Response> {
  const slug = comparisonSlug || c.req.param('comparison');
  const match = slug.match(/validatecall-vs-(.+)/);

  if (!match) {
    return c.notFound();
  }

  const competitorSlug = match[1];
  const competitor = COMPETITORS[competitorSlug];

  if (!competitor) {
    return c.notFound();
  }

  const siteUrl = c.env?.SITE_URL || 'https://validatecall.com';
  const appUrl = c.env?.APP_URL || 'https://app.validatecall.com';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ValidateCall vs ${competitor.name} | Comparison</title>
  <meta name="description" content="Compare ValidateCall with ${competitor.name}. See why ValidateCall is the better choice for AI-powered lead generation and market research.">
  <link rel="canonical" href="${siteUrl}/compare/validatecall-vs-${competitorSlug}">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
    .header { background: #fff; border-bottom: 1px solid #e5e7eb; padding: 16px 0; }
    .header-content { display: flex; justify-content: space-between; align-items: center; }
    .logo { font-weight: 700; font-size: 1.5rem; color: #3b82f6; text-decoration: none; }
    .btn { display: inline-block; padding: 10px 20px; border-radius: 8px; font-weight: 600; text-decoration: none; background: #3b82f6; color: #fff; }
    .hero { background: #f8fafc; padding: 80px 0; text-align: center; }
    .hero h1 { font-size: 2.5rem; margin-bottom: 20px; color: #1e3a5f; }
    .hero p { font-size: 1.25rem; color: #64748b; }
    .comparison { padding: 80px 0; }
    .comparison h2 { text-align: center; margin-bottom: 48px; }
    .comparison-table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .comparison-table th, .comparison-table td { padding: 20px; text-align: left; border-bottom: 1px solid #e5e7eb; }
    .comparison-table th { background: #f8fafc; font-weight: 600; }
    .comparison-table tr:last-child td { border-bottom: none; }
    .check { color: #22c55e; font-weight: bold; }
    .x { color: #ef4444; }
    .differences { padding: 80px 0; background: #f8fafc; }
    .differences h2 { text-align: center; margin-bottom: 48px; }
    .diff-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; }
    .diff-card { padding: 32px; background: #fff; border-radius: 12px; border-left: 4px solid #3b82f6; }
    .diff-card h3 { margin-bottom: 12px; color: #1e3a5f; }
    .cta { background: #3b82f6; color: #fff; padding: 80px 0; text-align: center; }
    .cta .btn { background: #fff; color: #3b82f6; padding: 14px 28px; }
    .footer { background: #0f172a; color: #94a3b8; padding: 40px 0; text-align: center; }
  </style>
</head>
<body>
  <header class="header">
    <div class="container header-content">
      <a href="${siteUrl}" class="logo">ValidateCall</a>
      <a href="${appUrl}/signup" class="btn">Try ValidateCall Free</a>
    </div>
  </header>

  <section class="hero">
    <div class="container">
      <h1>ValidateCall vs ${competitor.name}</h1>
      <p>${competitor.description} compared to AI-powered lead generation</p>
    </div>
  </section>

  <section class="comparison">
    <div class="container">
      <h2>Feature Comparison</h2>
      <table class="comparison-table">
        <tr>
          <th>Feature</th>
          <th>ValidateCall</th>
          <th>${competitor.name}</th>
        </tr>
        <tr>
          <td>AI Voice Agents</td>
          <td class="check">✓ Included</td>
          <td class="x">✗ Not available</td>
        </tr>
        <tr>
          <td>Lead Database</td>
          <td class="check">✓ 100+ Industries</td>
          <td class="check">✓ Available</td>
        </tr>
        <tr>
          <td>Multilingual Support</td>
          <td class="check">✓ 30+ Languages</td>
          <td class="x">✗ Limited</td>
        </tr>
        <tr>
          <td>Market Research</td>
          <td class="check">✓ Built-in</td>
          <td class="x">✗ Not focused</td>
        </tr>
        <tr>
          <td>Automated Calling</td>
          <td class="check">✓ AI-powered</td>
          <td class="x">✗ Manual</td>
        </tr>
        <tr>
          <td>Free Trial</td>
          <td class="check">✓ Yes</td>
          <td class="check">✓ Limited</td>
        </tr>
      </table>
    </div>
  </section>

  <section class="differences">
    <div class="container">
      <h2>Why Choose ValidateCall</h2>
      <div class="diff-grid">
        ${competitor.differences.map(diff => `
          <div class="diff-card">
            <h3>${diff}</h3>
            <p>ValidateCall offers ${diff.toLowerCase()} that ${competitor.name} doesn't provide.</p>
          </div>
        `).join('')}
      </div>
    </div>
  </section>

  <section class="cta">
    <div class="container">
      <h2>Ready to Try ValidateCall?</h2>
      <p style="margin-bottom: 32px; opacity: 0.9;">See why businesses choose ValidateCall over ${competitor.name}</p>
      <a href="${appUrl}/signup" class="btn">Start Free Trial</a>
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
