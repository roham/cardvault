import type { Metadata } from 'next';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: 'Card Investment Guides — Player-by-Player Analysis | CardVault',
  description: 'Free investment guides for 1,800+ sports card players. Data-driven buy/sell/hold verdicts, bull/bear cases, grading ROI, and budget-specific card picks. Baseball, basketball, football, and hockey.',
  openGraph: {
    title: 'Card Investment Guides — CardVault',
    description: 'Investment analysis for 1,800+ sports card players. Data-driven verdicts and budget picks.',
    type: 'website',
  },
  alternates: { canonical: './' },
};

/* ─── helpers ─── */
function parseValue(est: string): number {
  const m = est.match(/\$([0-9,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) || 5 : 5;
}
function fmt(n: number): string { return `$${n.toLocaleString()}`; }
function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

interface PlayerSummary {
  name: string;
  slug: string;
  sport: string;
  cardCount: number;
  topRaw: number;
  topGem: number;
  hasRookies: boolean;
  avgSpread: number;
}

function buildPlayerSummaries(): PlayerSummary[] {
  const playerMap = new Map<string, typeof sportsCards>();
  for (const c of sportsCards) {
    const existing = playerMap.get(c.player) || [];
    existing.push(c);
    playerMap.set(c.player, existing);
  }

  const summaries: PlayerSummary[] = [];
  for (const [name, cards] of playerMap) {
    if (cards.length < 3) continue; // only show players with 3+ cards
    const rawValues = cards.map(c => parseValue(c.estimatedValueRaw));
    const gemValues = cards.map(c => parseValue(c.estimatedValueGem));
    const totalRaw = rawValues.reduce((s, v) => s + v, 0);
    const totalGem = gemValues.reduce((s, v) => s + v, 0);
    summaries.push({
      name,
      slug: slugify(name),
      sport: cards[0].sport,
      cardCount: cards.length,
      topRaw: Math.max(...rawValues),
      topGem: Math.max(...gemValues),
      hasRookies: cards.some(c => c.rookie),
      avgSpread: totalRaw > 0 ? totalGem / totalRaw : 1,
    });
  }

  // Sort by top gem value (most valuable players first)
  return summaries.sort((a, b) => b.topGem - a.topGem);
}

const SPORT_BADGES: Record<string, string> = {
  baseball: 'bg-red-500/15 text-red-400 border-red-500/30',
  basketball: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  football: 'bg-green-500/15 text-green-400 border-green-500/30',
  hockey: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
};

export default function InvestIndexPage() {
  const crumbs = [{ label: 'Home', href: '/' }, { label: 'Investment Guides' }];
  const players = buildPlayerSummaries();

  const sportCounts = players.reduce((acc, p) => {
    acc[p.sport] = (acc[p.sport] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={crumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Card Investment Guides',
        description: `Investment analysis for ${players.length}+ sports card players with data-driven verdicts.`,
        url: 'https://cardvault-two.vercel.app/invest',
        numberOfItems: players.length,
      }} />

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          {players.length}+ Players &middot; Data-Driven Verdicts &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Investment Guides</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Player-by-player investment analysis. Each guide includes bull/bear cases, risk rating,
          grading ROI, and budget-specific card picks — all computed from real market data.
        </p>
      </div>

      {/* Sport breakdown */}
      <div className="flex flex-wrap gap-3 mb-8">
        {Object.entries(sportCounts).sort(([,a], [,b]) => b - a).map(([sport, count]) => (
          <span key={sport} className={`text-xs px-3 py-1.5 rounded-full border ${SPORT_BADGES[sport] || 'text-gray-400'}`}>
            {sport.charAt(0).toUpperCase() + sport.slice(1)}: {count} players
          </span>
        ))}
      </div>

      {/* Player grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {players.slice(0, 300).map(p => (
          <Link
            key={p.slug}
            href={`/invest/${p.slug}`}
            className="p-4 bg-gray-800/50 hover:bg-gray-800/70 border border-gray-700 hover:border-gray-600 rounded-xl transition-colors group"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="text-white font-medium group-hover:text-amber-400 transition-colors text-sm">
                {p.name}
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${SPORT_BADGES[p.sport] || ''}`}>
                {p.sport.slice(0, 3).toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span>{p.cardCount} cards</span>
              <span className="text-green-400">{fmt(p.topGem)} gem</span>
              {p.hasRookies && <span className="text-yellow-400">RC</span>}
              <span>{p.avgSpread.toFixed(1)}x</span>
            </div>
          </Link>
        ))}
      </div>

      {players.length > 300 && (
        <p className="text-gray-500 text-sm text-center mt-6">
          Showing top 300 of {players.length} players by gem mint value.
          Search for any player using the tools above.
        </p>
      )}

      {/* Related */}
      <div className="border-t border-gray-800 pt-8 mt-12">
        <h2 className="text-lg font-semibold text-white mb-4">Investment Tools</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/tools/investment-calc', label: 'Investment Calculator', desc: 'Returns analysis' },
            { href: '/tools/grading-roi', label: 'Grading ROI', desc: 'Grade before selling' },
            { href: '/tools/flip-calc', label: 'Flip Calculator', desc: 'Profit potential' },
            { href: '/tools/diversification', label: 'Diversification', desc: 'Portfolio balance' },
            { href: '/tools/roi-heatmap', label: 'ROI Heatmap', desc: 'Best grading ROI' },
            { href: '/tools/starter-kit', label: 'Starter Kit', desc: 'Build a collection' },
          ].map(l => (
            <Link key={l.href} href={l.href} className="p-3 bg-gray-800/40 hover:bg-gray-800/70 border border-gray-700 rounded-lg transition-colors group">
              <div className="text-white text-sm font-medium group-hover:text-amber-400 transition-colors">{l.label}</div>
              <div className="text-gray-500 text-xs">{l.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
