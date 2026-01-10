# ValidateCall Programmatic SEO

Cloudflare Workers-based programmatic SEO for generating thousands of optimized landing pages.

## Deployed URL

**Production:** https://validatecall-seo.isoview.workers.dev

## Quick Start

```bash
cd seo

# Install dependencies
npm install

# Run locally
npm run dev

# Deploy to Cloudflare
npm run deploy

# View logs
npm run tail
```

## Pages Generated

| Type | Count | Example URL |
|------|-------|-------------|
| Industries | 20+ | `/industries/dental-clinics` |
| Locations | 100+ | `/locations/ireland/dublin` |
| Industry+Location | 2,000+ | `/dental-clinics-leads-in-dublin` |
| Use Cases | 5 | `/use-cases/startup-validation` |
| Comparisons | 5 | `/compare/validatecall-vs-apollo` |

## Test URLs

- Health: https://validatecall-seo.isoview.workers.dev/health
- Industry: https://validatecall-seo.isoview.workers.dev/industries/dental-clinics
- Location: https://validatecall-seo.isoview.workers.dev/locations/ireland/dublin
- Combo: https://validatecall-seo.isoview.workers.dev/dental-clinics-leads-in-dublin
- Sitemap: https://validatecall-seo.isoview.workers.dev/sitemap.xml

## KV Namespaces

Already configured in wrangler.toml:
- `SEO_CACHE` - a385631145b4496ebb789ce3b97ff8e3
- `CONTENT_CACHE` - 56ed8a65b895437e89b93b4fa18f95f0

## AI Content Generation

Pages are dynamically generated with unique AI-written content using Claude. Content is stored in KV cache and refreshed periodically.

### Automated Generation (Cron Job on VPS)

Since Cloudflare Workers cannot directly call your Claude proxy (HTTP restriction), run the generator from your VPS:

```bash
# Set environment variables
export CLAUDE_API_KEY="your-api-key"
export CF_API_TOKEN="your-cloudflare-api-token"  # Needs KV write permission

# Run the generator
node scripts/generate-content.js
```

### Set up cron job (2am daily):

```bash
# Edit crontab
crontab -e

# Add this line:
0 2 * * * cd /path/to/seo && CLAUDE_API_KEY="xxx" CF_API_TOKEN="xxx" node scripts/generate-content.js >> /var/log/seo-generator.log 2>&1
```

### Create Cloudflare API Token

1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Create token with "Edit Cloudflare Workers KV Storage" permission
3. Use this token as `CF_API_TOKEN`

### Check Generated Content

```bash
curl https://validatecall-seo.isoview.workers.dev/admin/cache-status
```

## Adding Industries

Edit `src/data/industries.ts` and add new entries:

```typescript
"new-industry": {
  slug: "new-industry",
  name: "New Industry",
  namePlural: "New Industry Professionals",
  leadsCount: 50000,
  // ... other fields
}
```

## Adding Locations

Edit `src/data/locations.ts` and add cities:

```typescript
cities: [
  { slug: "new-city", name: "New City", country: "Country", countryCode: "XX", population: 100000 }
]
```

## Domain Configuration

To connect to your domain (validatecall.com):

1. Go to Cloudflare Dashboard > Workers & Pages > validatecall-seo
2. Click "Settings" > "Triggers" > "Add Custom Domain"
3. Add routes like:
   - `validatecall.com/industries/*`
   - `validatecall.com/locations/*`
   - `validatecall.com/*-leads-in-*`

## File Structure

```
seo/
├── wrangler.toml          # Cloudflare config with KV namespaces
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
└── src/
    ├── index.ts           # Main router
    ├── handlers/
    │   ├── industry.ts    # /industries/:slug
    │   ├── location.ts    # /locations/:country/:city
    │   ├── industry-location.ts  # /:industry-leads-in-:city
    │   ├── use-case.ts    # /use-cases/:slug
    │   ├── comparison.ts  # /compare/:slug
    │   ├── sitemap.ts     # XML sitemaps
    │   └── robots.ts      # robots.txt
    ├── data/
    │   ├── industries.ts  # Industry definitions
    │   └── locations.ts   # Country/city data
    └── utils/
        └── seo.ts         # SEO helpers
```
