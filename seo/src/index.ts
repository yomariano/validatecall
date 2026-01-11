/**
 * ValidateCall Programmatic SEO - Cloudflare Worker
 * Generates thousands of SEO-optimized pages at the edge
 */

import { Hono } from 'hono';
import { cache } from 'hono/cache';
import { industryHandler } from './handlers/industry';
import { industriesIndexHandler } from './handlers/industries-index';
import { locationHandler } from './handlers/location';
import { industryLocationHandler } from './handlers/industry-location';
import { useCaseHandler } from './handlers/use-case';
import { comparisonHandler } from './handlers/comparison';
import { sitemapHandler, sitemapIndexHandler } from './handlers/sitemap';
import { robotsHandler } from './handlers/robots';
import { scheduledHandler, manualGenerateContent } from './handlers/scheduled';
import { INDUSTRIES } from './data/industries';
import { COUNTRIES } from './data/locations';

type Bindings = {
  SEO_CACHE: KVNamespace;
  CONTENT_CACHE: KVNamespace;
  SITE_URL: string;
  APP_URL: string;
  CLAUDE_API_KEY: string;
  CLAUDE_API_URL: string;
  ADMIN_SECRET: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Cache middleware - only for GET requests on non-admin routes
app.use('*', async (c, next) => {
  // Skip caching for admin routes and non-GET requests
  if (c.req.path.startsWith('/admin') || c.req.method !== 'GET') {
    return next();
  }

  // Apply cache for GET requests on public routes
  const cacheMiddleware = cache({
    cacheName: 'validatecall-seo',
    cacheControl: 'max-age=3600, stale-while-revalidate=86400',
  });
  return cacheMiddleware(c, next);
});

// Health check
app.get('/health', (c) => c.json({ status: 'ok', service: 'validatecall-seo' }));

// Robots.txt
app.get('/robots.txt', robotsHandler);

// Sitemap routes
app.get('/sitemap.xml', sitemapIndexHandler);
app.get('/sitemaps/:type.xml', sitemapHandler);

// Industry index page - lists all 100+ industries (must be before parameterized route)
app.get('/industries', industriesIndexHandler);

// Industry pages: /industries/dental-clinics
app.get('/industries/:industry', industryHandler);

// Location pages: /locations/ireland/dublin
app.get('/locations/:country/:city', locationHandler);

// Location index pages
app.get('/locations/:country', (c) => {
  // Render country page with all cities
  return c.redirect('/locations');
});

app.get('/locations', (c) => {
  // Render all locations page
  return c.redirect('/');
});

// Industry + Location pages: /dental-clinic-leads-in-dublin
app.get('/:industryLocation', async (c) => {
  const slug = c.req.param('industryLocation');

  // Check if it matches the pattern: {industry}-leads-in-{location}
  const match = slug.match(/^(.+)-leads-in-(.+)$/);
  if (match) {
    const [, industry, location] = match;
    return industryLocationHandler(c, industry, location);
  }

  // Not a match - return 404 or pass through
  return c.notFound();
});

// Use case pages: /use-cases/startup-validation
app.get('/use-cases/:useCase', useCaseHandler);

// Comparison pages: /compare/validatecall-vs-apollo
app.get('/compare/:comparison', comparisonHandler);

// Alternative pages: /alternatives/apollo-alternative
app.get('/alternatives/:product', (c) => {
  const product = c.req.param('product');
  return comparisonHandler(c, `validatecall-vs-${product.replace('-alternative', '')}`);
});

// 404 handler
app.notFound((c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Page Not Found | ValidateCall</title>
      <meta name="robots" content="noindex">
      <style>
        body { font-family: system-ui; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
        .container { text-align: center; }
        h1 { font-size: 4rem; margin: 0; }
        a { color: #3b82f6; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>404</h1>
        <p>Page not found</p>
        <a href="/">Go to ValidateCall</a>
      </div>
    </body>
    </html>
  `, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Error:', err);
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Error | ValidateCall</title>
      <meta name="robots" content="noindex">
    </head>
    <body>
      <h1>Something went wrong</h1>
      <a href="/">Go to ValidateCall</a>
    </body>
    </html>
  `, 500);
});

// Admin endpoint for manual content generation
app.post('/admin/generate', async (c) => {
  const body = await c.req.json() as {
    type?: string;
    industry?: string;
    location?: string;
    secret?: string;
  };

  // Simple secret check - in production use proper auth
  const adminSecret = c.env.ADMIN_SECRET || 'validatecall-seo-admin';
  if (body.secret !== adminSecret) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  let request: Parameters<typeof manualGenerateContent>[1];

  if (body.type === 'industry' && body.industry) {
    const industry = INDUSTRIES[body.industry];
    if (!industry) {
      return c.json({ error: 'Industry not found' }, 404);
    }
    request = {
      type: 'industry',
      industry: { name: industry.name, namePlural: industry.namePlural, slug: industry.slug },
    };
  } else if (body.type === 'location' && body.location) {
    const [citySlug, countrySlug] = body.location.split(':');
    const country = COUNTRIES[countrySlug];
    const city = country?.cities.find((c) => c.slug === citySlug);
    if (!city || !country) {
      return c.json({ error: 'Location not found' }, 404);
    }
    request = {
      type: 'location',
      location: { city: city.name, country: country.name },
    };
  } else {
    return c.json({ error: 'Invalid request. Provide type (industry/location) and corresponding data' }, 400);
  }

  const result = await manualGenerateContent(c.env, request);
  return c.json(result);
});

// Cache status endpoint
app.get('/admin/cache-status', async (c) => {
  const keys = await c.env.CONTENT_CACHE.list({ limit: 100 });
  return c.json({
    totalKeys: keys.keys.length,
    keys: keys.keys.map((k) => ({
      name: k.name,
      expiration: k.expiration,
    })),
  });
});

// Bulk content generation endpoint - replaces cron trigger
// Call this via external cron service at 2am or manually
app.post('/admin/generate-all', async (c) => {
  const body = await c.req.json().catch(() => ({})) as { secret?: string; limit?: number };

  // Simple secret check
  const adminSecret = c.env.ADMIN_SECRET || 'validatecall-seo-admin';
  if (body.secret !== adminSecret) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  // Use waitUntil to run content generation in background
  // This allows the response to return immediately
  c.executionCtx.waitUntil(
    scheduledHandler(
      { scheduledTime: Date.now(), cron: 'manual', noRetry: true } as unknown as ScheduledEvent,
      c.env,
      c.executionCtx
    )
  );

  return c.json({
    success: true,
    message: 'Content generation started in background. Check /admin/cache-status for progress.',
  });
});

export default {
  fetch: app.fetch,
  scheduled: scheduledHandler,
};
