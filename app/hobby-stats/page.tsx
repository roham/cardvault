import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import { sportsCards } from '@/data/sports-cards';

export const metadata: Metadata = {
  title: 'Card Hobby Stats — 6,200+ Cards by the Numbers | CardVault',
  description: 'Real-time stats from CardVault\'s database of 6,200+ sports cards. Breakdown by sport, era, value tier, rookie percentage, most valuable cards, top players, and set counts. Data-driven insights into the card collecting hobby.',
  openGraph: {
    title: 'Card Hobby Stats — CardVault',
    description: '6,200+ cards by the numbers. Stats by sport, era, value, and more.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Hobby Stats — CardVault',
    description: 'The card collecting hobby in numbers. Real data from 6,200+ cards.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Hobby Stats' },
];

/* ─── compute stats from real data ─── */
function parseValue(est: string): number {
  const m = est.match(/\$([0-9,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) || 5 : 5;
}

function fmt(n: number): string {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

function computeStats() {
  const totalCards = sportsCards.length;
  const sports: Record<string, number> = {};
  const eras: Record<string, number> = {};
  const playerCounts: Record<string, number> = {};
  const setCounts: Record<string, number> = {};
  let rookieCount = 0;
  let totalRawValue = 0;
  let totalGemValue = 0;
  const valueTiers: Record<string, number> = { 'Under $10': 0, '$10-$50': 0, '$50-$200': 0, '$200-$1K': 0, '$1K-$10K': 0, '$10K+': 0 };
  let minYear = 9999;
  let maxYear = 0;

  const topCards: { name: string; value: number; sport: string }[] = [];

  for (const card of sportsCards) {
    // Sport
    sports[card.sport] = (sports[card.sport] || 0) + 1;

    // Era
    const era = card.year < 1920 ? 'Pre-War (before 1920)' :
      card.year < 1950 ? 'Post-War (1920-1949)' :
      card.year < 1970 ? 'Vintage (1950-1969)' :
      card.year < 1990 ? 'Classic (1970-1989)' :
      card.year < 2000 ? 'Junk Wax & 90s (1990-1999)' :
      card.year < 2015 ? 'Modern (2000-2014)' :
      'Ultra-Modern (2015+)';
    eras[era] = (eras[era] || 0) + 1;

    // Player
    playerCounts[card.player] = (playerCounts[card.player] || 0) + 1;

    // Set
    setCounts[card.set] = (setCounts[card.set] || 0) + 1;

    // Rookie
    if (card.rookie) rookieCount++;

    // Values
    const rawVal = parseValue(card.estimatedValueRaw);
    const gemVal = parseValue(card.estimatedValueGem);
    totalRawValue += rawVal;
    totalGemValue += gemVal;

    // Value tiers
    if (rawVal < 10) valueTiers['Under $10']++;
    else if (rawVal < 50) valueTiers['$10-$50']++;
    else if (rawVal < 200) valueTiers['$50-$200']++;
    else if (rawVal < 1000) valueTiers['$200-$1K']++;
    else if (rawVal < 10000) valueTiers['$1K-$10K']++;
    else valueTiers['$10K+']++;

    // Year range
    if (card.year < minYear) minYear = card.year;
    if (card.year > maxYear) maxYear = card.year;

    // Top cards
    topCards.push({ name: card.name, value: gemVal, sport: card.sport });
  }

  topCards.sort((a, b) => b.value - a.value);
  const top10Cards = topCards.slice(0, 10);

  // Top players by card count
  const topPlayers = Object.entries(playerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const uniquePlayers = Object.keys(playerCounts).length;
  const uniqueSets = Object.keys(setCounts).length;

  // Sport breakdown sorted
  const sportBreakdown = Object.entries(sports).sort((a, b) => b[1] - a[1]);

  // Era breakdown sorted chronologically
  const eraOrder = ['Pre-War (before 1920)', 'Post-War (1920-1949)', 'Vintage (1950-1969)', 'Classic (1970-1989)', 'Junk Wax & 90s (1990-1999)', 'Modern (2000-2014)', 'Ultra-Modern (2015+)'];
  const eraBreakdown = eraOrder.map(e => ({ era: e, count: eras[e] || 0 })).filter(e => e.count > 0);

  return {
    totalCards, sports: sportBreakdown, eraBreakdown, topPlayers, top10Cards, uniquePlayers, uniqueSets,
    rookieCount, rookiePct: ((rookieCount / totalCards) * 100).toFixed(1),
    totalRawValue, totalGemValue,
    avgRawValue: Math.round(totalRawValue / totalCards),
    avgGemValue: Math.round(totalGemValue / totalCards),
    valueTiers: Object.entries(valueTiers).filter(([, v]) => v > 0),
    yearRange: `${minYear}–${maxYear}`,
  };
}

const stats = computeStats();

const SPORT_COLORS: Record<string, string> = {
  baseball: 'bg-red-600',
  basketball: 'bg-orange-600',
  football: 'bg-green-600',
  hockey: 'bg-blue-600',
};

const SPORT_TEXT: Record<string, string> = {
  baseball: 'text-red-400',
  basketball: 'text-orange-400',
  football: 'text-green-400',
  hockey: 'text-blue-400',
};

const faqItems = [
  { question: 'Where does CardVault get its card data?', answer: 'CardVault\'s sports card database is built from public sources including set checklists, price guides, and auction records. Pokemon data comes from the PokemonTCG.io API. All estimated values are based on recent eBay sold listings and auction house results. The database is updated regularly with new players, sets, and value adjustments.' },
  { question: 'How many cards does CardVault track?', answer: `CardVault currently tracks ${stats.totalCards.toLocaleString()}+ sports cards across ${stats.sports.length} sports (${stats.sports.map(([s]) => s).join(', ')}), plus 20,000+ Pokemon cards via API integration. That's ${stats.uniquePlayers.toLocaleString()} unique players across ${stats.uniqueSets.toLocaleString()} different card sets spanning ${stats.yearRange}.` },
  { question: 'What is the most valuable card in the database?', answer: `The most valuable card in CardVault is ${stats.top10Cards[0]?.name || 'N/A'} with an estimated gem mint value of ${fmt(stats.top10Cards[0]?.value || 0)}. The top 10 most valuable cards represent some of the most iconic cards in hobby history.` },
];

export default function HobbyStatsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Card Hobby Stats',
        description: `Real-time statistics from CardVault's database of ${stats.totalCards.toLocaleString()}+ sports cards.`,
        url: 'https://cardvault-two.vercel.app/hobby-stats',
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map(f => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: { '@type': 'Answer', text: f.answer },
        })),
      }} />

      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-violet-950/60 border border-violet-800/50 text-violet-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          Real Data &middot; {stats.totalCards.toLocaleString()} Cards &middot; Live Computed
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Hobby Stats</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          The card collecting hobby by the numbers. All stats computed in real time from CardVault&apos;s database
          of {stats.totalCards.toLocaleString()} sports cards across {stats.yearRange}.
        </p>
      </div>

      {/* Hero Numbers */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Total Cards', value: stats.totalCards.toLocaleString(), sub: `${stats.yearRange}` },
          { label: 'Unique Players', value: stats.uniquePlayers.toLocaleString(), sub: `${stats.sports.length} sports` },
          { label: 'Card Sets', value: stats.uniqueSets.toLocaleString(), sub: 'unique sets' },
          { label: 'Total DB Value', value: fmt(stats.totalGemValue), sub: 'gem mint total' },
        ].map(s => (
          <div key={s.label} className="bg-gray-800/40 border border-gray-700 rounded-xl p-5 text-center">
            <div className="text-3xl font-bold text-white">{s.value}</div>
            <div className="text-sm text-gray-400 mt-1">{s.label}</div>
            <div className="text-xs text-gray-600">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Sport Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Cards by Sport</h2>
          <div className="space-y-3">
            {stats.sports.map(([sport, count]) => {
              const pct = ((count / stats.totalCards) * 100).toFixed(1);
              return (
                <div key={sport}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className={`font-medium capitalize ${SPORT_TEXT[sport] || 'text-white'}`}>{sport}</span>
                    <span className="text-gray-400">{count.toLocaleString()} ({pct}%)</span>
                  </div>
                  <div className="h-3 bg-gray-900 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${SPORT_COLORS[sport] || 'bg-gray-600'}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Cards by Era</h2>
          <div className="space-y-3">
            {stats.eraBreakdown.map(({ era, count }) => {
              const pct = ((count / stats.totalCards) * 100).toFixed(1);
              return (
                <div key={era}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white font-medium text-xs">{era}</span>
                    <span className="text-gray-400 text-xs">{count.toLocaleString()} ({pct}%)</span>
                  </div>
                  <div className="h-3 bg-gray-900 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-violet-700 to-violet-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Value Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Value Distribution</h2>
          <div className="space-y-3">
            {stats.valueTiers.map(([tier, count]) => {
              const pct = ((count / stats.totalCards) * 100).toFixed(1);
              return (
                <div key={tier}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white font-medium">{tier}</span>
                    <span className="text-gray-400">{count.toLocaleString()} ({pct}%)</span>
                  </div>
                  <div className="h-3 bg-gray-900 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-amber-700 to-amber-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-900/40 rounded-lg text-center">
              <div className="text-amber-400 font-bold text-lg">{fmt(stats.avgRawValue)}</div>
              <div className="text-xs text-gray-500">Avg Raw Value</div>
            </div>
            <div className="p-3 bg-gray-900/40 rounded-lg text-center">
              <div className="text-amber-400 font-bold text-lg">{fmt(stats.avgGemValue)}</div>
              <div className="text-xs text-gray-500">Avg Gem Mint Value</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Facts</h2>
          <div className="space-y-3">
            {[
              { label: 'Rookie Cards', value: `${stats.rookieCount.toLocaleString()} (${stats.rookiePct}%)`, desc: 'cards with rookie designation' },
              { label: 'Total Raw Value', value: fmt(stats.totalRawValue), desc: 'sum of all raw card values' },
              { label: 'Total Gem Mint Value', value: fmt(stats.totalGemValue), desc: 'sum of all PSA 10 values' },
              { label: 'Year Span', value: stats.yearRange, desc: `${parseInt(stats.yearRange.split('–')[1]) - parseInt(stats.yearRange.split('–')[0])}+ years of cards` },
              { label: 'Avg Cards Per Player', value: (stats.totalCards / stats.uniquePlayers).toFixed(1), desc: 'cards per unique player' },
            ].map(f => (
              <div key={f.label} className="flex items-center justify-between p-3 bg-gray-900/40 rounded-lg">
                <div>
                  <div className="text-white text-sm font-medium">{f.label}</div>
                  <div className="text-gray-500 text-xs">{f.desc}</div>
                </div>
                <span className="text-violet-400 font-bold text-sm">{f.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top 10 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Most Valuable Cards</h2>
          <div className="space-y-2">
            {stats.top10Cards.map((card, i) => (
              <div key={i} className="flex items-center gap-3 p-2 bg-gray-900/40 rounded-lg">
                <span className="text-xs font-mono text-gray-600 w-5">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate">{card.name}</div>
                  <span className={`text-xs uppercase ${SPORT_TEXT[card.sport] || 'text-gray-400'}`}>{card.sport}</span>
                </div>
                <span className="text-amber-400 font-bold text-sm whitespace-nowrap">{fmt(card.value)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Most Represented Players</h2>
          <div className="space-y-2">
            {stats.topPlayers.map(([player, count], i) => (
              <div key={i} className="flex items-center gap-3 p-2 bg-gray-900/40 rounded-lg">
                <span className="text-xs font-mono text-gray-600 w-5">{i + 1}</span>
                <div className="flex-1">
                  <span className="text-white text-sm font-medium">{player}</span>
                </div>
                <span className="text-violet-400 font-bold text-sm">{count} cards</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <section className="mt-10 mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((f, i) => (
            <details key={i} className="group bg-gray-800/50 border border-gray-700 rounded-xl">
              <summary className="cursor-pointer px-6 py-4 text-white font-medium list-none flex items-center justify-between">
                {f.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform">&#9662;</span>
              </summary>
              <div className="px-6 pb-4 text-gray-400 text-sm leading-relaxed">{f.answer}</div>
            </details>
          ))}
        </div>
      </section>

      {/* Cross-links */}
      <div className="border-t border-gray-800 pt-8">
        <h2 className="text-lg font-semibold text-white mb-4">Explore More</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/sports', label: 'Browse Cards', desc: 'All sports cards' },
            { href: '/players', label: 'Player Profiles', desc: `${stats.uniquePlayers}+ players` },
            { href: '/tools', label: 'Card Tools', desc: '79+ interactive tools' },
            { href: '/market-data', label: 'Market Data Room', desc: 'Deep market analytics' },
            { href: '/hobby-timeline', label: 'Hobby Timeline', desc: 'History of card collecting' },
            { href: '/seasonal-calendar', label: 'Seasonal Calendar', desc: 'When to buy and sell' },
          ].map(l => (
            <Link key={l.href} href={l.href} className="p-3 bg-gray-800/40 hover:bg-gray-800/70 border border-gray-700 rounded-lg transition-colors group">
              <div className="text-white text-sm font-medium group-hover:text-violet-400 transition-colors">{l.label}</div>
              <div className="text-gray-500 text-xs">{l.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
