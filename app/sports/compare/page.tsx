import type { Metadata } from 'next';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Compare Sports Card Players — Side-by-Side Card Values',
  description: 'Compare sports card values between players. Side-by-side price comparisons, rookie cards, and investment analysis for baseball, basketball, football, and hockey.',
  alternates: { canonical: './' },
};

type Sport = 'baseball' | 'basketball' | 'football' | 'hockey';

function slugifyPlayer(name: string): string {
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

interface PlayerSummary {
  slug: string;
  name: string;
  sport: Sport;
  cardCount: number;
  hasRookie: boolean;
}

function buildComparisons() {
  const playerMap = new Map<string, PlayerSummary>();
  for (const card of sportsCards) {
    const slug = slugifyPlayer(card.player);
    const existing = playerMap.get(slug);
    if (existing) {
      existing.cardCount++;
      if (card.rookie) existing.hasRookie = true;
    } else {
      playerMap.set(slug, {
        slug,
        name: card.player,
        sport: card.sport,
        cardCount: 1,
        hasRookie: card.rookie,
      });
    }
  }

  // Group by sport, only players with 3+ cards
  const bySport: Record<Sport, PlayerSummary[]> = { baseball: [], basketball: [], football: [], hockey: [] };
  for (const p of playerMap.values()) {
    if (p.cardCount >= 3) bySport[p.sport].push(p);
  }
  // Sort by card count desc within each sport
  for (const sport of Object.keys(bySport) as Sport[]) {
    bySport[sport].sort((a, b) => b.cardCount - a.cardCount);
  }

  // Generate featured comparisons (top 10 per sport, first 10 pairs each)
  const featured: Record<Sport, Array<{ slug: string; a: PlayerSummary; b: PlayerSummary }>> = {
    baseball: [], basketball: [], football: [], hockey: [],
  };
  for (const sport of Object.keys(bySport) as Sport[]) {
    const top = bySport[sport].slice(0, 15);
    for (let i = 0; i < top.length && featured[sport].length < 15; i++) {
      for (let j = i + 1; j < top.length && featured[sport].length < 15; j++) {
        const [a, b] = top[i].slug < top[j].slug ? [top[i], top[j]] : [top[j], top[i]];
        featured[sport].push({ slug: `${a.slug}-vs-${b.slug}`, a, b });
      }
    }
  }

  // Total pairs count
  let totalPairs = 0;
  for (const sport of Object.keys(bySport) as Sport[]) {
    const n = bySport[sport].length;
    totalPairs += n * (n - 1) / 2;
  }

  return { bySport, featured, totalPairs };
}

const sportConfig: Record<Sport, { label: string; color: string; border: string }> = {
  baseball: { label: 'Baseball', color: 'text-red-400', border: 'border-red-900/40' },
  basketball: { label: 'Basketball', color: 'text-orange-400', border: 'border-orange-900/40' },
  football: { label: 'Football', color: 'text-blue-400', border: 'border-blue-900/40' },
  hockey: { label: 'Hockey', color: 'text-cyan-400', border: 'border-cyan-900/40' },
};

export default function ComparePage() {
  const { bySport, featured, totalPairs } = buildComparisons();
  const sports: Sport[] = ['baseball', 'basketball', 'football', 'hockey'];

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Sports Cards', item: 'https://cardvault-two.vercel.app/sports' },
      { '@type': 'ListItem', position: 2, name: 'Compare Players' },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={breadcrumbLd} />

      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/sports" className="hover:text-gray-300 transition-colors">Sports Cards</Link>
        <span>/</span>
        <span className="text-gray-300">Compare Players</span>
      </nav>

      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Compare Sports Card Players</h1>
        <p className="text-gray-400 text-lg">
          {totalPairs.toLocaleString()} player comparisons across {sports.map(s => sportConfig[s].label).join(', ')}.
          Side-by-side card values, rookie cards, and investment analysis.
        </p>
      </div>

      {sports.map(sport => {
        const cfg = sportConfig[sport];
        const pairs = featured[sport];
        if (pairs.length === 0) return null;
        return (
          <section key={sport} className="mb-12">
            <div className={`flex items-center gap-3 mb-5 pb-3 border-b ${cfg.border}`}>
              <h2 className={`text-xl font-bold ${cfg.color}`}>{cfg.label} Comparisons</h2>
              <span className="text-gray-500 text-sm">
                ({bySport[sport].length} players · {(bySport[sport].length * (bySport[sport].length - 1) / 2).toLocaleString()} matchups)
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {pairs.map(p => (
                <Link
                  key={p.slug}
                  href={`/sports/compare/${p.slug}`}
                  className="group bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl p-4 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-semibold text-sm group-hover:text-emerald-400 transition-colors">
                      {p.a.name}
                    </span>
                    <span className="text-gray-600 text-xs mx-2">vs</span>
                    <span className="text-white font-semibold text-sm group-hover:text-emerald-400 transition-colors">
                      {p.b.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{p.a.cardCount} cards</span>
                    <span className={`font-medium ${cfg.color}`}>Compare</span>
                    <span>{p.b.cardCount} cards</span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Show all players in this sport for browsing */}
            <div className="mt-4">
              <details className="group">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-300 transition-colors">
                  Browse all {bySport[sport].length} {cfg.label.toLowerCase()} players with comparisons
                </summary>
                <div className="mt-3 flex flex-wrap gap-2">
                  {bySport[sport].map(player => (
                    <Link
                      key={player.slug}
                      href={`/players/${player.slug}`}
                      className="text-xs bg-gray-900 border border-gray-800 hover:border-gray-600 px-2.5 py-1 rounded-lg text-gray-400 hover:text-white transition-colors"
                    >
                      {player.name} ({player.cardCount})
                    </Link>
                  ))}
                </div>
              </details>
            </div>
          </section>
        );
      })}

      {/* Tools CTA */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mt-8">
        <h2 className="text-white font-bold text-lg mb-2">Compare Specific Cards</h2>
        <p className="text-gray-400 text-sm mb-4">
          Want to compare two specific cards side-by-side? Use our interactive Card Comparison Tool
          to pick any two cards from our database and see detailed value comparisons.
        </p>
        <Link
          href="/tools/compare"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          Open Card Comparison Tool
        </Link>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-800 flex flex-wrap gap-4">
        <Link href="/sports" className="text-emerald-400 text-sm hover:text-emerald-300">All sports cards</Link>
        <Link href="/sports/sets" className="text-gray-400 text-sm hover:text-gray-300">Browse by set</Link>
        <Link href="/players" className="text-gray-400 text-sm hover:text-gray-300">Player profiles</Link>
        <Link href="/tools" className="text-gray-400 text-sm hover:text-gray-300">All tools</Link>
      </div>
    </div>
  );
}
