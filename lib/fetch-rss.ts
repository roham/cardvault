// RSS feed fetcher — runs server-side only at build / revalidation time
// Returns NewsItem-compatible objects; falls back gracefully on any failure

import type { NewsItem } from '@/data/news';

interface RssFeed {
  url: string;
  source: string;
  category: NewsItem['category'];
  imageColor: string;
}

const RSS_FEEDS: RssFeed[] = [
  {
    url: 'https://www.cardboardconnection.com/feed',
    source: 'Cardboard Connection',
    category: 'sports',
    imageColor: 'from-blue-900 to-blue-700',
  },
  {
    url: 'https://www.beckett.com/news/feed/',
    source: 'Beckett Media',
    category: 'sports',
    imageColor: 'from-indigo-900 to-indigo-700',
  },
  {
    url: 'https://www.sportscollectorsdaily.com/feed/',
    source: 'Sports Collectors Daily',
    category: 'market',
    imageColor: 'from-gray-800 to-gray-700',
  },
  {
    url: 'https://forums.blowoutcards.com/external.php?type=RSS2',
    source: 'Blowout Buzz',
    category: 'market',
    imageColor: 'from-emerald-900 to-emerald-700',
  },
];

function extractTagValue(xml: string, tag: string): string {
  const cdataRe = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, 'i');
  const plainRe = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const cdataMatch = xml.match(cdataRe);
  if (cdataMatch) return cdataMatch[1].trim();
  const plainMatch = xml.match(plainRe);
  if (plainMatch) return plainMatch[1].replace(/<[^>]+>/g, '').trim();
  return '';
}

function extractItems(xml: string): Array<{ title: string; link: string; description: string; pubDate: string }> {
  const items: Array<{ title: string; link: string; description: string; pubDate: string }> = [];
  const itemRe = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let match: RegExpExecArray | null;
  while ((match = itemRe.exec(xml)) !== null) {
    const block = match[1];
    items.push({
      title: extractTagValue(block, 'title'),
      link: extractTagValue(block, 'link'),
      description: extractTagValue(block, 'description'),
      pubDate: extractTagValue(block, 'pubDate'),
    });
  }
  return items;
}

function slugify(title: string, source: string): string {
  return `rss-${source.toLowerCase().replace(/\s+/g, '-')}-${title.slice(0, 40).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;
}

function parseDate(pubDate: string): string {
  try {
    const d = new Date(pubDate);
    if (isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
    return d.toISOString().slice(0, 10);
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

async function fetchFeed(feed: RssFeed, limit: number): Promise<NewsItem[]> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(feed.url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'CardVault/1.0 RSS Reader' },
      next: { revalidate: 1800 },
    });
    clearTimeout(id);
    if (!res.ok) return [];
    const xml = await res.text();
    const raw = extractItems(xml).slice(0, limit);
    return raw
      .filter(i => i.title)
      .map(i => ({
        id: slugify(i.title, feed.source),
        title: i.title,
        date: parseDate(i.pubDate),
        source: feed.source,
        summary: i.description.length > 280 ? i.description.slice(0, 280) + '...' : i.description,
        category: feed.category,
        sourceUrl: i.link || feed.url,
        imageColor: feed.imageColor,
      }));
  } catch {
    clearTimeout(id);
    return [];
  }
}

export async function fetchLiveNews(limit = 4): Promise<{ items: NewsItem[]; fromRss: boolean }> {
  const results = await Promise.allSettled(RSS_FEEDS.map(f => fetchFeed(f, limit)));
  const items: NewsItem[] = results
    .flatMap(r => (r.status === 'fulfilled' ? r.value : []))
    .sort((a, b) => b.date.localeCompare(a.date));
  return { items, fromRss: items.length > 0 };
}
