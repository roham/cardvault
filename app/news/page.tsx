// Server Component — fetches RSS at build/revalidation time, falls back to static data
import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchLiveNews } from '@/lib/fetch-rss';
import { newsItems as staticNews } from '@/data/news';
import NewsFilter from '@/components/NewsFilter';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';

export const revalidate = 1800; // 30-minute ISR

export const metadata: Metadata = {
  title: 'Card Collecting News — Market Updates, Releases & Auctions',
  description: 'Latest sports card and Pokemon TCG news. Auction results, set releases, grading updates, market trends, and hobby analysis. Updated daily from Beckett, PSA, TCGPlayer, and more.',
  openGraph: {
    title: 'Card Collecting News — CardVault',
    description: 'Latest card collecting news: auction records, set releases, grading updates, and market analysis.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Collecting News — CardVault',
    description: 'Sports card + Pokemon TCG news: auctions, releases, grading, market trends.',
  },
  alternates: { canonical: './' },
};

// Upcoming releases data (inline, synced with /calendar)
const upcomingReleases = [
  { name: '2025-26 Panini Select NBA', date: 'Apr 15', category: 'basketball', emoji: '\uD83C\uDFC0' },
  { name: '2025-26 UD Series 2 Hockey', date: 'Apr 22', category: 'hockey', emoji: '\uD83C\uDFD2' },
  { name: 'Pokemon SV Surging Sparks Reprint', date: 'May 1', category: 'pokemon', emoji: '\u26A1' },
  { name: '2026 Bowman Baseball', date: 'May 7', category: 'baseball', emoji: '\u26BE' },
  { name: 'Pokemon SV Destined Rivals', date: 'May 30', category: 'pokemon', emoji: '\u26A1' },
];

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'News' },
];

export default async function NewsPage() {
  let items = staticNews;
  let fromRss = false;

  try {
    const result = await fetchLiveNews(5);
    if (result.fromRss && result.items.length >= 4) {
      items = result.items;
      fromRss = true;
    }
  } catch {
    // fallback to static data already set above
  }

  // Top story = most recent item
  const topStory = items[0];
  const weekItems = items.filter(n => {
    const d = new Date(n.date);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return d >= weekAgo;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Card Collecting News',
        description: 'Latest sports card and Pokemon TCG news, auction results, and market analysis.',
        url: 'https://cardvault-two.vercel.app/news',
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: items.length,
          itemListElement: items.slice(0, 5).map((n, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: n.title,
            url: n.sourceUrl,
          })),
        },
      }} />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Collecting News</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Set releases, auction records, grading updates, and market trends for sports cards and Pokemon TCG.
        </p>
      </div>

      {/* Top Story Hero */}
      {topStory && (
        <div className="mb-8 bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className={`h-2 bg-gradient-to-r ${topStory.imageColor}`} />
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold bg-emerald-900/60 text-emerald-400 px-2.5 py-1 rounded-full">TOP STORY</span>
              <span className="text-gray-500 text-xs">{new Date(topStory.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              <span className="text-gray-600 text-xs">{topStory.source}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 leading-snug">{topStory.title}</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-4 max-w-3xl">{topStory.summary}</p>
            <a
              href={topStory.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors"
            >
              Read full article &rarr;
            </a>
          </div>
        </div>
      )}

      {/* This Week + Upcoming Releases row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        {/* This Week summary */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-400 rounded-full" />
            This Week ({weekItems.length} stories)
          </h3>
          <div className="space-y-3">
            {weekItems.slice(0, 5).map(n => (
              <a
                key={n.id}
                href={n.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 group"
              >
                <div className={`w-1 h-full min-h-[2rem] bg-gradient-to-b ${n.imageColor} rounded-full shrink-0 mt-1`} />
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium group-hover:text-emerald-400 transition-colors leading-snug line-clamp-2">{n.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{n.source} &middot; {new Date(n.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                </div>
              </a>
            ))}
            {weekItems.length === 0 && (
              <p className="text-gray-500 text-sm">No news in the past 7 days. Check back soon.</p>
            )}
          </div>
        </div>

        {/* Upcoming Releases sidebar */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
            Upcoming Releases
          </h3>
          <div className="space-y-3">
            {upcomingReleases.map(r => (
              <div key={r.name} className="flex items-center gap-3">
                <span className="text-lg shrink-0">{r.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-white text-sm font-medium truncate">{r.name}</p>
                  <p className="text-gray-500 text-xs">{r.date}</p>
                </div>
              </div>
            ))}
          </div>
          <Link href="/calendar" className="mt-4 block text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors">
            Full release calendar &rarr;
          </Link>
        </div>
      </div>

      <NewsFilter items={items} fromRss={fromRss} />

      {/* Bottom cross-links */}
      <div className="mt-12 p-5 bg-gray-900/40 border border-gray-800 rounded-2xl">
        <h3 className="text-white font-semibold text-sm mb-3">Explore More</h3>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/breaking-news" className="text-emerald-400 hover:text-emerald-300 transition-colors">Breaking News Alerts &rarr;</Link>
          <Link href="/card-catalysts" className="text-emerald-400 hover:text-emerald-300 transition-colors">Price Catalysts &rarr;</Link>
          <Link href="/market-movers" className="text-emerald-400 hover:text-emerald-300 transition-colors">Market Movers &rarr;</Link>
          <Link href="/calendar" className="text-emerald-400 hover:text-emerald-300 transition-colors">Release Calendar &rarr;</Link>
          <Link href="/tools/price-history" className="text-emerald-400 hover:text-emerald-300 transition-colors">Price History &rarr;</Link>
          <Link href="/guides" className="text-emerald-400 hover:text-emerald-300 transition-colors">Collector Guides &rarr;</Link>
          <Link href="/tools/watchlist" className="text-emerald-400 hover:text-emerald-300 transition-colors">Price Watchlist &rarr;</Link>
        </div>
      </div>
    </div>
  );
}
