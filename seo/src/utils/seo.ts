/**
 * SEO utilities for generating schema markup and meta tags
 */

export interface SchemaMarkupOptions {
  type: 'Service' | 'Organization' | 'WebPage' | 'FAQPage';
  name: string;
  description: string;
  provider?: string;
  areaServed?: string;
  serviceType?: string;
  url?: string;
}

export function generateSchemaMarkup(options: SchemaMarkupOptions): object {
  const base = {
    '@context': 'https://schema.org',
    '@type': options.type,
    name: options.name,
    description: options.description,
  };

  if (options.type === 'Service') {
    return {
      ...base,
      provider: {
        '@type': 'Organization',
        name: options.provider || 'ValidateCall',
      },
      areaServed: options.areaServed || 'Worldwide',
      serviceType: options.serviceType || 'Lead Generation',
    };
  }

  return base;
}

export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateBaseHtml(options: {
  title: string;
  description: string;
  canonicalUrl: string;
  content: string;
  scripts?: string[];
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${options.title}</title>
  <meta name="description" content="${options.description}">
  <link rel="canonical" href="${options.canonicalUrl}">
  ${options.scripts?.map(s => `<script type="application/ld+json">${s}</script>`).join('\n') || ''}
</head>
<body>
  ${options.content}
</body>
</html>`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function capitalize(text: string): string {
  return text
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
