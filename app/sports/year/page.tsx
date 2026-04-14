import type { Metadata } from 'next';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Browse Sports Cards by Year — Every Era from 1909 to 2025',
  description: 'Browse sports cards by year. Pre-war tobacco cards to modern rookies. See every year of card collecting with prices, rookie cards, and set breakdowns.',
  alternates: { canonical: './' },
};

interface YearSummary {
  year: number;
  cardCount: number;
  rookieCount: number;
  setCount: number;
  sports: string[];
  topPlayer: string;
}

function buildYearData(): YearSummary[] {
  const map = new Map<number, { cards: number; rookies: number; sets: Set<string>; sports: Set<string>; topPlayer: string }>();
  for (const card of sportsCards) {
    const existing = map.get(card.year);
    if (existing) {
      existing.cards++;
      if (card.rookie) existing.rookies++;
      existing.sets.add(card.set);
      existing.sports.add(card.sport);
    } else {
      map.set(card.year, {
        cards: 1,
        rookies: card.rookie ? 1 : 0,
        sets: new Set([card.set]),
        sports: new Set([card.sport]),
        topPlayer: card.player,
      });
    }
  }
  return [...map.entries()]
    .map(([year, data]) => ({
      year,
      cardCount: data.cards,
      rookieCount: data.rookies,
      setCount: data.sets.size,
      sports: [...data.sports],
      topPlayer: data.topPlayer,
    }))
    .sort((a, b) => b.year - a.year);
}

function eraLabel(year: number): string {
  if (year < 1941) return 'Pre-War';
  if (year < 1960) return 'Golden Age';
  if (year < 1980) return 'Vintage';
  if (year < 1993) return 'Junk Wax';
  if (year < 2005) return 'Post-Junk Wax';
  if (year < 2015) return 'Modern';
  return 'Ultra-Modern';
}

function eraBg(year: number): string {
  if (year < 1941) return 'border-amber-900/40';
  if (year < 1960) return 'border-yellow-900/40';
  if (year < 1980) return 'border-purple-900/40';
  if (year < 1993) return 'border-gray-700';
  if (year < 2005) return 'border-gray-700';
  if (year < 2015) return 'border-blue-900/40';
  return 'border-emerald-900/40';
}

function eraColor(year: number): string {
  if (year < 1941) return 'text-amber-400';
  if (year < 1960) return 'text-yellow-400';
  if (year < 1980) return 'text-purple-400';
  if (year < 1993) return 'text-gray-400';
  if (year < 2005) return 'text-gray-400';
  if (year < 2015) return 'text-blue-400';
  return 'text-emerald-400';
}

export default function YearsPage() {
  const years = buildYearData();
  const totalYears = years.length;
  const minYear = years[years.length - 1]?.year || 0;
  const maxYear = years[0]?.year || 0;

  // Group by decade
  const decades = new Map<number, YearSummary[]>();
  for (const y of years) {
    const decade = Math.floor(y.year / 10) * 10;
    const existing = decades.get(decade);
    if (existing) existing.push(y);
    else decades.set(decade, [y]);
  }
  const sortedDecades = [...decades.entries()].sort((a, b) => b[0] - a[0]);

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Sports Cards', item: 'https://cardvault-two.vercel.app/sports' },
      { '@type': 'ListItem', position: 2, name: 'Browse by Year' },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={breadcrumbLd} />

      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/sports" className="hover:text-gray-300 transition-colors">Sports Cards</Link>
        <span>/</span>
        <span className="text-gray-300">Browse by Year</span>
      </nav>

      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Browse by Year</h1>
        <p className="text-gray-400 text-lg">
          {totalYears} years of card history from {minYear} to {maxYear}. {sportsCards.length} cards across every era.
        </p>
      </div>

      {/* Decade jump links */}
      <div className="flex flex-wrap gap-2 mb-8">
        {sortedDecades.map(([decade]) => (
          <a
            key={decade}
            href={`#decade-${decade}`}
            className="text-xs bg-gray-900 border border-gray-800 hover:border-gray-600 px-3 py-1.5 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            {decade}s
          </a>
        ))}
      </div>

      {sortedDecades.map(([decade, decadeYears]) => {
        const totalCards = decadeYears.reduce((sum, y) => sum + y.cardCount, 0);
        return (
          <section key={decade} id={`decade-${decade}`} className="mb-12">
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">{decade}s</h2>
              <span className="text-gray-500 text-sm">({totalCards} cards · {decadeYears.length} years)</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {decadeYears.map(y => (
                <Link
                  key={y.year}
                  href={`/sports/year/${y.year}`}
                  className={`group bg-gray-900 border ${eraBg(y.year)} hover:border-gray-600 rounded-xl p-4 transition-colors`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-bold text-lg group-hover:text-emerald-400 transition-colors">{y.year}</span>
                    <span className={`text-xs font-medium ${eraColor(y.year)}`}>{eraLabel(y.year)}</span>
                  </div>
                  <div className="text-gray-500 text-xs space-y-0.5">
                    <div>{y.cardCount} card{y.cardCount > 1 ? 's' : ''}</div>
                    <div>{y.setCount} set{y.setCount > 1 ? 's' : ''}</div>
                    {y.rookieCount > 0 && <div className="text-emerald-400">{y.rookieCount} RC{y.rookieCount > 1 ? 's' : ''}</div>}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}

      <div className="mt-8 pt-6 border-t border-gray-800 flex flex-wrap gap-4">
        <Link href="/sports" className="text-emerald-400 text-sm hover:text-emerald-300">All sports cards</Link>
        <Link href="/sports/sets" className="text-gray-400 text-sm hover:text-gray-300">Browse by set</Link>
        <Link href="/sports/compare" className="text-gray-400 text-sm hover:text-gray-300">Compare players</Link>
        <Link href="/players" className="text-gray-400 text-sm hover:text-gray-300">Player profiles</Link>
      </div>
    </div>
  );
}
