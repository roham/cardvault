import type { Metadata } from 'next';
import { sportsCards } from '@/data/sports-cards';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Browse Sports Cards by Set — All Sets & Checklists',
  description: `Browse ${new Set(sportsCards.map(c => c.set)).size}+ sports card sets across baseball, basketball, football, and hockey. Checklists, card counts, and estimated values for every set.`,
  alternates: { canonical: './' },
};

type Sport = 'baseball' | 'basketball' | 'football' | 'hockey';

const sportConfig: Record<Sport, { label: string; color: string; border: string }> = {
  baseball: { label: 'Baseball', color: 'text-red-400', border: 'border-red-900/40' },
  basketball: { label: 'Basketball', color: 'text-orange-400', border: 'border-orange-900/40' },
  football: { label: 'Football', color: 'text-blue-400', border: 'border-blue-900/40' },
  hockey: { label: 'Hockey', color: 'text-cyan-400', border: 'border-cyan-900/40' },
};

function setSlug(setName: string): string {
  return setName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

interface SetSummary {
  name: string;
  slug: string;
  cardCount: number;
  rookieCount: number;
  minYear: number;
  sport: Sport;
  topPlayer: string;
}

function buildSetData(): Record<Sport, SetSummary[]> {
  const map = new Map<string, SetSummary>();
  for (const card of sportsCards) {
    const key = card.set + '|' + card.sport;
    const existing = map.get(key);
    if (existing) {
      existing.cardCount++;
      if (card.rookie) existing.rookieCount++;
    } else {
      map.set(key, {
        name: card.set,
        slug: setSlug(card.set),
        cardCount: 1,
        rookieCount: card.rookie ? 1 : 0,
        minYear: card.year,
        sport: card.sport,
        topPlayer: card.player,
      });
    }
  }
  const result: Record<Sport, SetSummary[]> = {
    baseball: [],
    basketball: [],
    football: [],
    hockey: [],
  };
  for (const s of map.values()) {
    result[s.sport].push(s);
  }
  for (const sport of Object.keys(result) as Sport[]) {
    result[sport].sort((a, b) => b.minYear - a.minYear);
  }
  return result;
}

export default function SetsPage() {
  const setsBySport = buildSetData();
  const sports: Sport[] = ['baseball', 'basketball', 'football', 'hockey'];

  const totalSets = Object.values(setsBySport).reduce((sum, arr) => sum + arr.length, 0);
  const totalCards = sportsCards.length;

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Sports Cards', item: 'https://cardvault-two.vercel.app/sports' },
      { '@type': 'ListItem', position: 2, name: 'Browse by Set' },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={breadcrumbLd} />

      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/sports" className="hover:text-gray-300 transition-colors">Sports Cards</Link>
        <span>/</span>
        <span className="text-gray-300">Browse by Set</span>
      </div>

      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Browse by Set</h1>
        <p className="text-gray-400 text-lg">
          {totalSets} sets · {totalCards} iconic cards across baseball, basketball, football, and hockey.
        </p>
      </div>

      {sports.map(sport => {
        const sets = setsBySport[sport];
        if (sets.length === 0) return null;
        const cfg = sportConfig[sport];
        return (
          <section key={sport} className="mb-12">
            <div className={`flex items-center gap-3 mb-5 pb-3 border-b ${cfg.border}`}>
              <h2 className={`text-xl font-bold ${cfg.color}`}>{cfg.label}</h2>
              <span className="text-gray-500 text-sm">({sets.length} sets)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sets.map(s => (
                <Link
                  key={s.slug + s.sport}
                  href={`/sports/sets/${s.slug}?sport=${s.sport}`}
                  className="group bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl p-4 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-white font-semibold text-sm leading-snug group-hover:text-emerald-400 transition-colors">
                      {s.name}
                    </h3>
                    <span className="text-gray-500 text-xs shrink-0">{s.minYear}</span>
                  </div>
                  <p className="text-gray-500 text-xs mb-3">
                    {s.topPlayer}{s.rookieCount > 0 ? ` · ${s.rookieCount} RC${s.rookieCount > 1 ? 's' : ''}` : ''}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-xs">{s.cardCount} card{s.cardCount > 1 ? 's' : ''} tracked</span>
                    <span className={`text-xs font-medium ${cfg.color}`}>View set</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
