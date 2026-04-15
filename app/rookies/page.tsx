import type { Metadata } from 'next';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: 'Rookie Card Index — Every Rookie Card by Year (1909–2025)',
  description: 'Browse every rookie card in our database organized by year. From pre-war legends to 2025 NFL draft picks. Find the best rookie cards to collect and invest in.',
  openGraph: {
    title: 'Rookie Card Index — CardVault',
    description: 'Browse rookie cards by year from 1909 to 2025.',
    type: 'website',
  },
  alternates: { canonical: './' },
};

const sportEmoji: Record<string, string> = {
  baseball: '⚾', basketball: '🏀', football: '🏈', hockey: '🏒',
};

export default function RookiesPage() {
  const rookies = sportsCards.filter(c => c.rookie);
  const yearMap = new Map<number, typeof rookies>();
  for (const card of rookies) {
    const list = yearMap.get(card.year) || [];
    list.push(card);
    yearMap.set(card.year, list);
  }

  const years = [...yearMap.keys()].sort((a, b) => b - a);
  const decades = new Map<string, number[]>();
  for (const year of years) {
    const dec = `${Math.floor(year / 10) * 10}s`;
    const list = decades.get(dec) || [];
    list.push(year);
    decades.set(dec, list);
  }

  const crumbs = [{ label: 'Home', href: '/' }, { label: 'Rookie Cards' }];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Breadcrumb items={crumbs} />
        <JsonLd data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Rookie Card Index',
          description: `Browse ${rookies.length} rookie cards organized by year.`,
          url: 'https://cardvault-two.vercel.app/rookies',
          numberOfItems: rookies.length,
        }} />

        <h1 className="text-3xl md:text-4xl font-bold mb-3">Rookie Card Index</h1>
        <p className="text-gray-400 text-lg mb-2">
          Browse {rookies.length.toLocaleString()} rookie cards across {years.length} years, from pre-war legends to the 2025 draft class.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800 text-center">
            <div className="text-2xl font-bold">{rookies.length.toLocaleString()}</div>
            <div className="text-sm text-gray-400">Rookie Cards</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800 text-center">
            <div className="text-2xl font-bold">{years.length}</div>
            <div className="text-sm text-gray-400">Years</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800 text-center">
            <div className="text-2xl font-bold">{rookies.filter(c => c.sport === 'baseball').length}</div>
            <div className="text-sm text-gray-400">Baseball</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800 text-center">
            <div className="text-2xl font-bold">{rookies.filter(c => c.sport !== 'baseball').length}</div>
            <div className="text-sm text-gray-400">Other Sports</div>
          </div>
        </div>

        {/* Decade Navigation */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[...decades.keys()].map(dec => (
            <a key={dec} href={`#${dec}`} className="px-3 py-1.5 rounded-full text-sm font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 transition">
              {dec} ({decades.get(dec)!.length})
            </a>
          ))}
        </div>

        {/* Year Grid */}
        {[...decades.entries()].map(([decade, decYears]) => (
          <section key={decade} id={decade} className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-gray-300">{decade}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {decYears.map(year => {
                const cards = yearMap.get(year)!;
                const sportCounts = new Map<string, number>();
                for (const c of cards) sportCounts.set(c.sport, (sportCounts.get(c.sport) || 0) + 1);
                return (
                  <Link
                    key={year}
                    href={`/rookies/${year}`}
                    className="bg-gray-900 rounded-lg p-4 border border-gray-800 hover:border-gray-600 transition"
                  >
                    <div className="text-lg font-bold mb-1">{year}</div>
                    <div className="text-sm text-gray-400 mb-2">{cards.length} rookie{cards.length !== 1 ? 's' : ''}</div>
                    <div className="flex gap-1.5 flex-wrap">
                      {[...sportCounts.entries()].map(([sport, count]) => (
                        <span key={sport} className="text-xs text-gray-500">
                          {sportEmoji[sport] || ''} {count}
                        </span>
                      ))}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}

        {/* Related */}
        <section className="mt-8 bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-lg font-bold mb-3">Related</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link href="/tools/rookie-finder" className="bg-gray-800 rounded-lg p-3 hover:bg-gray-700 transition">
              <div className="text-sm font-medium text-blue-400">Rookie Finder</div>
              <div className="text-xs text-gray-500">Search rookies</div>
            </Link>
            <Link href="/rookie-tracker" className="bg-gray-800 rounded-lg p-3 hover:bg-gray-700 transition">
              <div className="text-sm font-medium text-blue-400">Rookie Tracker</div>
              <div className="text-xs text-gray-500">Track investments</div>
            </Link>
            <Link href="/tools/draft-predictor" className="bg-gray-800 rounded-lg p-3 hover:bg-gray-700 transition">
              <div className="text-sm font-medium text-blue-400">Draft Predictor</div>
              <div className="text-xs text-gray-500">2025 rookies</div>
            </Link>
            <Link href="/prospects" className="bg-gray-800 rounded-lg p-3 hover:bg-gray-700 transition">
              <div className="text-sm font-medium text-blue-400">Prospects</div>
              <div className="text-xs text-gray-500">Future rookies</div>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
