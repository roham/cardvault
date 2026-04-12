// Server Component — fetches RSS at build/revalidation time, falls back to static data
import { fetchLiveNews } from '@/lib/fetch-rss';
import { newsItems as staticNews } from '@/data/news';
import NewsFilter from '@/components/NewsFilter';

export const revalidate = 1800; // 30-minute ISR

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Market News</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Set releases, auction records, grading updates, and market trends for sports cards and Pokémon TCG.
        </p>
      </div>

      <NewsFilter items={items} fromRss={fromRss} />
    </div>
  );
}
