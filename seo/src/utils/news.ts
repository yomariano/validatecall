/**
 * Google News RSS integration for fetching industry-related news
 */

export interface NewsArticle {
  title: string;
  link: string;
  snippet: string;
  source: string;
  pubDate: string;
}

export interface NewsContext {
  industry: string;
  articles: NewsArticle[];
  fetchedAt: string;
}

/**
 * Fetch recent news from Google News RSS for a given industry/topic
 */
export async function fetchIndustryNews(
  industry: string,
  maxArticles = 5
): Promise<NewsArticle[]> {
  try {
    // Build search query - focus on industry + business/market trends
    const searchTerms = buildSearchQuery(industry);
    const encodedQuery = encodeURIComponent(searchTerms);

    // Google News RSS URL
    const rssUrl = `https://news.google.com/rss/search?q=${encodedQuery}&hl=en-US&gl=US&ceid=US:en`;

    const response = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ValidateCallBot/1.0)',
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch news: ${response.status}`);
      return [];
    }

    const xml = await response.text();
    const articles = parseRssFeed(xml, maxArticles);

    return articles;
  } catch (error) {
    console.error('Error fetching industry news:', error);
    return [];
  }
}

/**
 * Build optimized search query for an industry
 */
function buildSearchQuery(industry: string): string {
  // Remove common suffixes and clean up
  const cleanIndustry = industry
    .replace(/\s+(industry|sector|business|services?)$/i, '')
    .trim();

  // Add context for better results
  return `${cleanIndustry} business trends OR ${cleanIndustry} market OR ${cleanIndustry} industry news`;
}

/**
 * Parse Google News RSS XML feed
 */
function parseRssFeed(xml: string, maxArticles: number): NewsArticle[] {
  const articles: NewsArticle[] = [];

  // Simple XML parsing without external dependencies
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null && articles.length < maxArticles) {
    const itemXml = match[1];

    const title = extractTag(itemXml, 'title');
    const link = extractTag(itemXml, 'link');
    const description = extractTag(itemXml, 'description');
    const pubDate = extractTag(itemXml, 'pubDate');
    const source = extractSource(itemXml);

    if (title && link) {
      articles.push({
        title: cleanHtml(title),
        link,
        snippet: cleanHtml(description || '').substring(0, 200),
        source: source || 'Unknown',
        pubDate: pubDate || new Date().toISOString(),
      });
    }
  }

  return articles;
}

/**
 * Extract content from an XML tag
 */
function extractTag(xml: string, tagName: string): string | null {
  const regex = new RegExp(`<${tagName}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tagName}>|<${tagName}[^>]*>([\\s\\S]*?)</${tagName}>`);
  const match = xml.match(regex);
  return match ? (match[1] || match[2] || '').trim() : null;
}

/**
 * Extract source from Google News item
 */
function extractSource(xml: string): string | null {
  // Google News includes source in <source> tag
  const sourceMatch = xml.match(/<source[^>]*>([^<]+)<\/source>/);
  return sourceMatch ? sourceMatch[1].trim() : null;
}

/**
 * Clean HTML entities and tags from text
 */
function cleanHtml(text: string): string {
  return text
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Format news articles for Claude prompt context
 */
export function formatNewsForPrompt(articles: NewsArticle[]): string {
  if (articles.length === 0) {
    return 'No recent news available.';
  }

  const newsItems = articles.map((article, index) => {
    const date = new Date(article.pubDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    return `${index + 1}. "${article.title}" (${article.source}, ${date})
   ${article.snippet}`;
  });

  return `Recent Industry News:\n${newsItems.join('\n\n')}`;
}

/**
 * Cache key for news data
 */
export function buildNewsCacheKey(industry: string): string {
  const slug = industry.toLowerCase().replace(/\s+/g, '-');
  return `news:${slug}`;
}

/**
 * Store news in KV cache
 */
export async function cacheNews(
  kv: KVNamespace,
  industry: string,
  articles: NewsArticle[],
  ttl = 3600 * 6 // 6 hours
): Promise<void> {
  const key = buildNewsCacheKey(industry);
  const data: NewsContext = {
    industry,
    articles,
    fetchedAt: new Date().toISOString(),
  };
  await kv.put(key, JSON.stringify(data), { expirationTtl: ttl });
}

/**
 * Get cached news from KV
 */
export async function getCachedNews(
  kv: KVNamespace,
  industry: string
): Promise<NewsContext | null> {
  const key = buildNewsCacheKey(industry);
  const data = await kv.get(key);
  if (!data) return null;
  return JSON.parse(data) as NewsContext;
}
