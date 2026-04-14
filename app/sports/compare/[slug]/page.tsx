import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { sportsCards, SportsCard } from '@/data/sports-cards';
import SportsCardTile from '@/components/SportsCardTile';
import JsonLd from '@/components/JsonLd';

type Sport = 'baseball' | 'basketball' | 'football' | 'hockey';

function slugifyPlayer(name: string): string {
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

interface PlayerData {
  slug: string;
  name: string;
  sport: Sport;
  cardCount: number;
  cards: SportsCard[];
  hasRookie: boolean;
  yearRange: [number, number];
  topCard: SportsCard | null;
}

function buildPlayersBySport(): Map<string, PlayerData> {
  const map = new Map<string, PlayerData>();
  for (const card of sportsCards) {
    const slug = slugifyPlayer(card.player);
    const existing = map.get(slug);
    if (existing) {
      existing.cardCount++;
      existing.cards.push(card);
      if (card.rookie) existing.hasRookie = true;
      if (card.year < existing.yearRange[0]) existing.yearRange[0] = card.year;
      if (card.year > existing.yearRange[1]) existing.yearRange[1] = card.year;
    } else {
      map.set(slug, {
        slug,
        name: card.player,
        sport: card.sport,
        cardCount: 1,
        cards: [card],
        hasRookie: card.rookie,
        yearRange: [card.year, card.year],
        topCard: null,
      });
    }
  }
  // Set top card (highest gem value) for each player
  for (const player of map.values()) {
    player.topCard = player.cards.reduce((best, card) => {
      const val = parsePrice(card.estimatedValueGem);
      const bestVal = best ? parsePrice(best.estimatedValueGem) : 0;
      return val > bestVal ? card : best;
    }, player.cards[0]);
  }
  return map;
}

function parsePrice(str: string): number {
  const match = str.replace(/,/g, '').match(/\$?([\d.]+)/);
  return match ? parseFloat(match[1]) : 0;
}

const allPlayers = buildPlayersBySport();

// Generate all comparison pairs (within same sport, players with 3+ cards)
function generatePairs(): Array<{ slug: string; a: string; b: string; sport: Sport }> {
  const bySport: Record<Sport, PlayerData[]> = { baseball: [], basketball: [], football: [], hockey: [] };
  for (const p of allPlayers.values()) {
    if (p.cardCount >= 3) bySport[p.sport].push(p);
  }
  const pairs: Array<{ slug: string; a: string; b: string; sport: Sport }> = [];
  for (const sport of Object.keys(bySport) as Sport[]) {
    const players = bySport[sport].sort((a, b) => a.slug.localeCompare(b.slug));
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        pairs.push({
          slug: `${players[i].slug}-vs-${players[j].slug}`,
          a: players[i].slug,
          b: players[j].slug,
          sport,
        });
      }
    }
  }
  return pairs;
}

const allPairs = generatePairs();
const pairMap = new Map(allPairs.map(p => [p.slug, p]));

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams(): Array<{ slug: string }> {
  return allPairs.map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pair = pairMap.get(slug);
  if (!pair) return { title: 'Comparison Not Found' };
  const a = allPlayers.get(pair.a);
  const b = allPlayers.get(pair.b);
  if (!a || !b) return { title: 'Comparison Not Found' };
  return {
    title: `${a.name} vs ${b.name} Cards — Price Comparison & Investment Guide`,
    description: `Compare ${a.name} and ${b.name} ${sportLabel[pair.sport]} cards side by side. ${a.cardCount + b.cardCount} cards tracked with prices, rookie cards, and investment analysis.`,
    alternates: { canonical: './' },
  };
}

const sportLabel: Record<Sport, string> = {
  baseball: 'Baseball',
  basketball: 'Basketball',
  football: 'Football',
  hockey: 'Hockey',
};

const sportColor: Record<Sport, string> = {
  baseball: 'text-red-400',
  basketball: 'text-orange-400',
  football: 'text-blue-400',
  hockey: 'text-cyan-400',
};

const sportBg: Record<Sport, string> = {
  baseball: 'from-red-950/50',
  basketball: 'from-orange-950/50',
  football: 'from-blue-950/50',
  hockey: 'from-cyan-950/50',
};

function eraLabel(year: number): string {
  if (year < 1960) return 'Vintage';
  if (year < 1980) return 'Classic';
  if (year < 2000) return 'Junk Wax / Modern';
  if (year < 2015) return 'Modern';
  return 'Ultra-Modern';
}

function getHighValue(cards: SportsCard[]): number {
  return Math.max(...cards.map(c => parsePrice(c.estimatedValueGem)));
}

function formatPrice(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

export default async function ComparisonPage({ params }: Props) {
  const { slug } = await params;
  const pair = pairMap.get(slug);
  if (!pair) notFound();

  const a = allPlayers.get(pair.a);
  const b = allPlayers.get(pair.b);
  if (!a || !b) notFound();

  const aHighValue = getHighValue(a.cards);
  const bHighValue = getHighValue(b.cards);
  const aRookieCount = a.cards.filter(c => c.rookie).length;
  const bRookieCount = b.cards.filter(c => c.rookie).length;

  // Sort cards by gem value descending
  const aSorted = [...a.cards].sort((x, y) => parsePrice(y.estimatedValueGem) - parsePrice(x.estimatedValueGem));
  const bSorted = [...b.cards].sort((x, y) => parsePrice(y.estimatedValueGem) - parsePrice(x.estimatedValueGem));

  const faqData = [
    {
      q: `Which is more valuable — ${a.name} or ${b.name} cards?`,
      ans: aHighValue > bHighValue
        ? `${a.name} cards reach higher values, with top cards valued at ${formatPrice(aHighValue)} in gem mint condition compared to ${formatPrice(bHighValue)} for ${b.name}.`
        : aHighValue < bHighValue
        ? `${b.name} cards reach higher values, with top cards valued at ${formatPrice(bHighValue)} in gem mint condition compared to ${formatPrice(aHighValue)} for ${a.name}.`
        : `Both players have cards valued similarly at around ${formatPrice(aHighValue)} in gem mint condition.`,
    },
    {
      q: `How many ${a.name} vs ${b.name} cards does CardVault track?`,
      ans: `CardVault tracks ${a.cardCount} ${a.name} cards and ${b.cardCount} ${b.name} cards, covering key rookie cards, flagship sets, and modern releases.`,
    },
    {
      q: `Should I invest in ${a.name} or ${b.name} cards?`,
      ans: `Both players offer collecting opportunities. ${a.name} cards span ${a.yearRange[0]}–${a.yearRange[1]} (${eraLabel(a.yearRange[0])}) while ${b.name} cards span ${b.yearRange[0]}–${b.yearRange[1]} (${eraLabel(b.yearRange[0])}). Consider your budget, collecting goals, and whether you prefer vintage or modern cards. Use our Grading ROI Calculator to compare grading potential.`,
    },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqData.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.ans },
    })),
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Sports Cards', item: 'https://cardvault-two.vercel.app/sports' },
      { '@type': 'ListItem', position: 2, name: 'Compare Players', item: 'https://cardvault-two.vercel.app/sports/compare' },
      { '@type': 'ListItem', position: 3, name: `${a.name} vs ${b.name}` },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <JsonLd data={jsonLd} />
      <JsonLd data={breadcrumbLd} />

      {/* Hero */}
      <div className={`bg-gradient-to-b ${sportBg[pair.sport]} to-gray-950 py-10`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link href="/sports" className="hover:text-gray-300 transition-colors">Sports Cards</Link>
            <span>/</span>
            <Link href="/sports/compare" className="hover:text-gray-300 transition-colors">Compare</Link>
            <span>/</span>
            <span className="text-gray-300">{a.name} vs {b.name}</span>
          </nav>

          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            {a.name} <span className="text-gray-500">vs</span> {b.name}
          </h1>
          <p className="text-gray-400 text-lg mb-1">
            {sportLabel[pair.sport]} Card Comparison & Investment Analysis
          </p>
          <p className="text-gray-500 text-sm">
            {a.cardCount + b.cardCount} cards tracked across {[...new Set([...a.cards, ...b.cards].map(c => c.set))].length} sets
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <PlayerStatCard player={a} highValue={aHighValue} rookieCount={aRookieCount} sport={pair.sport} />
          <PlayerStatCard player={b} highValue={bHighValue} rookieCount={bRookieCount} sport={pair.sport} />
        </div>

        {/* Side-by-side comparison table */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4">Head-to-Head Comparison</h2>
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="py-3 px-4 text-left text-gray-500 font-medium">Stat</th>
                  <th className="py-3 px-4 text-center text-white font-semibold">{a.name}</th>
                  <th className="py-3 px-4 text-center text-white font-semibold">{b.name}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                <CompareRow label="Cards Tracked" aVal={String(a.cardCount)} bVal={String(b.cardCount)} aWins={a.cardCount > b.cardCount} bWins={b.cardCount > a.cardCount} />
                <CompareRow label="Rookie Cards" aVal={String(aRookieCount)} bVal={String(bRookieCount)} aWins={aRookieCount > bRookieCount} bWins={bRookieCount > aRookieCount} />
                <CompareRow label="Top Card Value (Gem)" aVal={formatPrice(aHighValue)} bVal={formatPrice(bHighValue)} aWins={aHighValue > bHighValue} bWins={bHighValue > aHighValue} />
                <CompareRow label="Year Range" aVal={`${a.yearRange[0]}–${a.yearRange[1]}`} bVal={`${b.yearRange[0]}–${b.yearRange[1]}`} />
                <CompareRow label="Era" aVal={eraLabel(a.yearRange[0])} bVal={eraLabel(b.yearRange[0])} />
                <CompareRow label="Sets Represented" aVal={String([...new Set(a.cards.map(c => c.set))].length)} bVal={String([...new Set(b.cards.map(c => c.set))].length)} />
              </tbody>
            </table>
          </div>
        </section>

        {/* Top cards side by side */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4">Top Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-3">{a.name} — Top {Math.min(aSorted.length, 5)}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {aSorted.slice(0, 6).map(card => (
                  <SportsCardTile key={card.slug} card={card} />
                ))}
              </div>
              <Link href={`/players/${a.slug}`} className="inline-block mt-3 text-sm text-emerald-400 hover:text-emerald-300">
                View all {a.name} cards →
              </Link>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-3">{b.name} — Top {Math.min(bSorted.length, 5)}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {bSorted.slice(0, 6).map(card => (
                  <SportsCardTile key={card.slug} card={card} />
                ))}
              </div>
              <Link href={`/players/${b.slug}`} className="inline-block mt-3 text-sm text-emerald-400 hover:text-emerald-300">
                View all {b.name} cards →
              </Link>
            </div>
          </div>
        </section>

        {/* Investment Analysis */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4">Investment Analysis</h2>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-white font-semibold mb-2">{a.name}</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>• <span className="text-gray-300">{a.cardCount} cards</span> across {[...new Set(a.cards.map(c => c.set))].length} sets</li>
                  <li>• Top card: <span className="text-emerald-400">{formatPrice(aHighValue)}</span> (gem mint)</li>
                  <li>• {aRookieCount > 0 ? `${aRookieCount} rookie card${aRookieCount > 1 ? 's' : ''} — key entry points` : 'No rookie cards tracked'}</li>
                  <li>• Era: {eraLabel(a.yearRange[0])} ({a.yearRange[0]}–{a.yearRange[1]})</li>
                  {a.yearRange[0] < 1990 && <li>• Vintage cards tend to have <span className="text-amber-400">stable, appreciating</span> values</li>}
                  {a.yearRange[0] >= 2015 && <li>• Ultra-modern cards are <span className="text-amber-400">performance-driven</span> and more volatile</li>}
                </ul>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-2">{b.name}</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>• <span className="text-gray-300">{b.cardCount} cards</span> across {[...new Set(b.cards.map(c => c.set))].length} sets</li>
                  <li>• Top card: <span className="text-emerald-400">{formatPrice(bHighValue)}</span> (gem mint)</li>
                  <li>• {bRookieCount > 0 ? `${bRookieCount} rookie card${bRookieCount > 1 ? 's' : ''} — key entry points` : 'No rookie cards tracked'}</li>
                  <li>• Era: {eraLabel(b.yearRange[0])} ({b.yearRange[0]}–{b.yearRange[1]})</li>
                  {b.yearRange[0] < 1990 && <li>• Vintage cards tend to have <span className="text-amber-400">stable, appreciating</span> values</li>}
                  {b.yearRange[0] >= 2015 && <li>• Ultra-modern cards are <span className="text-amber-400">performance-driven</span> and more volatile</li>}
                </ul>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-gray-800">
              <p className="text-gray-500 text-xs">
                Investment analysis based on estimated market values. Use our{' '}
                <Link href="/tools/grading-roi" className="text-emerald-400 hover:text-emerald-300">Grading ROI Calculator</Link>{' '}
                and{' '}
                <Link href="/tools/trade" className="text-emerald-400 hover:text-emerald-300">Trade Evaluator</Link>{' '}
                for detailed grading and trade analysis.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqData.map((f, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-white font-semibold text-sm mb-2">{f.q}</h3>
                <p className="text-gray-400 text-sm">{f.ans}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Related Comparisons */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4">More {sportLabel[pair.sport]} Comparisons</h2>
          <div className="flex flex-wrap gap-2">
            {allPairs
              .filter(p => p.sport === pair.sport && p.slug !== slug && (p.a === a.slug || p.a === b.slug || p.b === a.slug || p.b === b.slug))
              .slice(0, 12)
              .map(p => {
                const pa = allPlayers.get(p.a);
                const pb = allPlayers.get(p.b);
                if (!pa || !pb) return null;
                return (
                  <Link
                    key={p.slug}
                    href={`/sports/compare/${p.slug}`}
                    className="text-xs bg-gray-900 border border-gray-800 hover:border-gray-600 px-3 py-1.5 rounded-lg text-gray-400 hover:text-white transition-colors"
                  >
                    {pa.name} vs {pb.name}
                  </Link>
                );
              })}
          </div>
        </section>

        {/* Footer */}
        <div className="pt-6 border-t border-gray-800">
          <p className="text-gray-600 text-sm mb-3">
            Prices are estimated based on recent eBay sold listings. Actual values may vary by condition, centering, and market conditions.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/sports/compare" className="text-emerald-400 text-sm hover:text-emerald-300">All comparisons</Link>
            <Link href="/tools/compare" className="text-gray-400 text-sm hover:text-gray-300">Card Comparison Tool</Link>
            <Link href="/tools/grading-roi" className="text-gray-400 text-sm hover:text-gray-300">Grading ROI Calculator</Link>
            <Link href="/sports" className="text-gray-400 text-sm hover:text-gray-300">All sports cards</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlayerStatCard({ player, highValue, rookieCount, sport }: { player: PlayerData; highValue: number; rookieCount: number; sport: Sport }) {
  return (
    <Link href={`/players/${player.slug}`} className="group bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl p-4 transition-colors">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-white font-bold text-lg group-hover:text-emerald-400 transition-colors">{player.name}</h3>
        <span className={`text-xs font-medium ${sportColor[sport]}`}>{sportLabel[sport]}</span>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-gray-500 text-xs block">Cards</span>
          <span className="text-white font-semibold">{player.cardCount}</span>
        </div>
        <div>
          <span className="text-gray-500 text-xs block">Top Value</span>
          <span className="text-emerald-400 font-semibold">{formatPrice(highValue)}</span>
        </div>
        <div>
          <span className="text-gray-500 text-xs block">Rookies</span>
          <span className="text-white font-semibold">{rookieCount}</span>
        </div>
        <div>
          <span className="text-gray-500 text-xs block">Years</span>
          <span className="text-white font-semibold">{player.yearRange[0]}–{player.yearRange[1]}</span>
        </div>
      </div>
    </Link>
  );
}

function CompareRow({ label, aVal, bVal, aWins, bWins }: { label: string; aVal: string; bVal: string; aWins?: boolean; bWins?: boolean }) {
  return (
    <tr>
      <td className="py-2.5 px-4 text-gray-500 font-medium">{label}</td>
      <td className={`py-2.5 px-4 text-center ${aWins ? 'text-emerald-400 font-semibold' : 'text-gray-300'}`}>{aVal}</td>
      <td className={`py-2.5 px-4 text-center ${bWins ? 'text-emerald-400 font-semibold' : 'text-gray-300'}`}>{bVal}</td>
    </tr>
  );
}
