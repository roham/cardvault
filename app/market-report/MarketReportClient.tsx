'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

// ─── Deterministic Random ────────────────────────────────────────────

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function strToSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) || 1;
}

function getWeekKey(): string {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  const monday = new Date(d.setDate(diff));
  return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
}

function formatWeekRange(): string {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.getFullYear(), d.getMonth(), diff);
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  const fmt = (dt: Date) => dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${fmt(monday)} – ${fmt(sunday)}, ${monday.getFullYear()}`;
}

function parseValue(val: string): number {
  const m = val.match(/\$([\d,]+)/);
  if (!m) return 0;
  return parseInt(m[1].replace(/,/g, ''), 10) || 0;
}

// ─── Sport metadata ─────────────────────────────────────────────────

const sportIcons: Record<string, string> = {
  baseball: '&#9918;',
  basketball: '&#127936;',
  football: '&#127944;',
  hockey: '&#127954;',
};

const sportColors: Record<string, string> = {
  baseball: 'text-red-400',
  basketball: 'text-orange-400',
  football: 'text-green-400',
  hockey: 'text-blue-400',
};

const sportLabels: Record<string, string> = {
  baseball: 'Baseball',
  basketball: 'Basketball',
  football: 'Football',
  hockey: 'Hockey',
};

// ─── Analysis templates ─────────────────────────────────────────────

const marketNarratives = [
  'The market showed strength this week with blue-chip vintage cards leading the way.',
  'Mixed signals across sectors as rookie cards surged while vintage cooled slightly.',
  'A strong week for modern rookies as playoff buzz drove collector demand higher.',
  'Steady gains across all sectors with notable strength in graded gem mint copies.',
  'Vintage cards rebounded after last week\'s dip, led by pre-war issues.',
  'Basketball cards outperformed all sectors this week on the back of playoff matchups.',
  'Football rookie cards dominated gains as draft speculation intensified.',
  'Hockey cards saw the biggest weekly move, driven by playoff series upsets.',
  'A consolidation week. Most sectors traded flat with selective pockets of strength.',
  'Strong buying pressure across mid-tier cards ($50-$500) suggests retail collector re-entry.',
  'Premium cards ($1000+) showed resilience while budget cards saw increased selling pressure.',
  'Cross-sport collecting continued to trend, with multi-sport collectors driving volume.',
];

const sectorOutlooks = [
  { label: 'Bullish', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { label: 'Neutral', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { label: 'Bearish', color: 'text-red-400', bg: 'bg-red-500/10' },
  { label: 'Bullish', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { label: 'Neutral', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
];

const buyingTips = [
  'Look for PSA 8-9 copies of 1990s rookies — the price gap to PSA 10 is widest here.',
  'Sealed product from 2024 sets is still near retail. Good long-term hold potential.',
  'Pre-war cards (T206, Goudey) remain undervalued relative to post-war blue chips.',
  'Rookie cards of eliminated playoff teams often dip temporarily — buying opportunity.',
  'Grading submissions are at record levels. Expect raw card prices to lag graded for 3-6 months.',
  'Pokemon Scarlet & Violet era chase cards are finding their floor. Selective buying makes sense.',
  'Watch for arbitrage between eBay raw prices and COMC graded prices.',
  'Modern basketball refractors under $100 offer strong risk/reward heading into playoffs.',
  'Football rookie cards typically bottom in March and peak in September. We are in the accumulation window.',
  'Second-year cards of confirmed stars are often more undervalued than their rookies.',
];

interface TopMover {
  slug: string;
  name: string;
  player: string;
  sport: string;
  change: number;
  reason: string;
}

interface SectorData {
  sport: string;
  change: number;
  volume: number;
  outlook: typeof sectorOutlooks[number];
  topCard: string;
  topCardSlug: string;
}

interface WeeklyReport {
  weekKey: string;
  weekRange: string;
  narrative: string;
  gainers: TopMover[];
  losers: TopMover[];
  sectors: SectorData[];
  buyTip: string;
  rookieWatch: TopMover[];
  vintageSpotlight: { slug: string; name: string; player: string; story: string };
  overallSentiment: number; // -100 to 100
}

// ─── Generate weekly report ─────────────────────────────────────────

function generateReport(): WeeklyReport {
  const weekKey = getWeekKey();
  const rng = seededRandom(strToSeed('market-report-' + weekKey));

  const narrative = marketNarratives[Math.floor(rng() * marketNarratives.length)];
  const buyTip = buyingTips[Math.floor(rng() * buyingTips.length)];
  const overallSentiment = Math.floor(rng() * 80) - 20; // slight bullish bias

  const gainReasons = [
    'Playoff performance driving demand',
    'Social media viral moment',
    'Award announcement buzz',
    'Record-breaking game performance',
    'Major card show sale record',
    'YouTube break hit going viral',
    'Streaming documentary boost',
    'Anniversary milestone generating interest',
  ];

  const lossReasons = [
    'Injury report dampening short-term demand',
    'Post-season cooling after elimination',
    'Increased supply from PSA submissions',
    'Profit-taking after recent gains',
    'Seasonal demand shift',
    'Grading population increase',
    'New product release diluting attention',
    'Market rotation into other sectors',
  ];

  // Shuffle cards deterministically
  const shuffled = [...sportsCards].sort((a, b) => {
    const sa = strToSeed(a.slug + weekKey);
    const sb = strToSeed(b.slug + weekKey);
    return sa - sb;
  });

  const highValueCards = shuffled.filter(c => parseValue(c.estimatedValueRaw) > 50);

  // Gainers
  const gainers: TopMover[] = highValueCards.slice(0, 5).map(c => ({
    slug: c.slug,
    name: c.name,
    player: c.player,
    sport: c.sport,
    change: Math.floor(rng() * 25) + 5,
    reason: gainReasons[Math.floor(rng() * gainReasons.length)],
  }));

  // Losers
  const losers: TopMover[] = highValueCards.slice(5, 10).map(c => ({
    slug: c.slug,
    name: c.name,
    player: c.player,
    sport: c.sport,
    change: -(Math.floor(rng() * 15) + 3),
    reason: lossReasons[Math.floor(rng() * lossReasons.length)],
  }));

  // Sector analysis
  const sports = ['baseball', 'basketball', 'football', 'hockey'] as const;
  const sectors: SectorData[] = sports.map(sport => {
    const sportCards = sportsCards.filter(c => c.sport === sport);
    const change = Math.floor(rng() * 20) - 7; // -7 to +13
    const vol = Math.floor(rng() * 5000) + 2000;
    const outlook = sectorOutlooks[Math.floor(rng() * sectorOutlooks.length)];
    const topIdx = Math.floor(rng() * Math.min(sportCards.length, 20));
    const topCard = sportCards[topIdx];
    return {
      sport,
      change,
      volume: vol,
      outlook,
      topCard: topCard?.name || '',
      topCardSlug: topCard?.slug || '',
    };
  });

  // Rookie watch
  const rookies = shuffled.filter(c => c.rookie).slice(0, 4).map(c => ({
    slug: c.slug,
    name: c.name,
    player: c.player,
    sport: c.sport,
    change: Math.floor(rng() * 30) - 5,
    reason: rng() > 0.5 ? 'Recent performance boosting rookie card demand' : 'Collector interest growing ahead of awards season',
  }));

  // Vintage spotlight
  const vintage = shuffled.filter(c => c.year < 1970 && parseValue(c.estimatedValueRaw) > 500);
  const spotlightCard = vintage[0] || sportsCards[0];
  const vintageStories = [
    `This ${spotlightCard.year} classic continues to appreciate as fewer high-grade examples surface at auction.`,
    `A cornerstone of any serious collection, this card saw renewed interest after a recent auction record.`,
    `Pre-war cards like this remain among the most undervalued segments relative to their historical significance.`,
    `With a dwindling supply of gradeable examples, this card represents strong long-term value.`,
  ];

  return {
    weekKey,
    weekRange: formatWeekRange(),
    narrative,
    gainers,
    losers,
    sectors,
    buyTip,
    rookieWatch: rookies,
    vintageSpotlight: {
      slug: spotlightCard.slug,
      name: spotlightCard.name,
      player: spotlightCard.player,
      story: vintageStories[Math.floor(rng() * vintageStories.length)],
    },
    overallSentiment,
  };
}

// ─── Sparkline SVG ──────────────────────────────────────────────────

function MiniSparkline({ change }: { change: number }) {
  const points = useMemo(() => {
    const rng = seededRandom(Math.abs(change * 137) + 42);
    const pts: number[] = [];
    let val = 50;
    for (let i = 0; i < 7; i++) {
      val += (rng() - 0.5) * 10 + (change > 0 ? 1.5 : -1.5);
      pts.push(Math.max(10, Math.min(90, val)));
    }
    return pts;
  }, [change]);

  const color = change >= 0 ? '#34d399' : '#f87171';
  const d = points.map((y, i) => `${i === 0 ? 'M' : 'L'}${i * 10},${100 - y}`).join(' ');

  return (
    <svg viewBox="0 0 60 100" className="w-12 h-8" preserveAspectRatio="none">
      <path d={d} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Sentiment gauge ────────────────────────────────────────────────

function SentimentGauge({ value }: { value: number }) {
  const normalized = (value + 100) / 200; // 0 to 1
  const label = value > 30 ? 'Bullish' : value > -10 ? 'Neutral' : 'Bearish';
  const color = value > 30 ? 'text-emerald-400' : value > -10 ? 'text-yellow-400' : 'text-red-400';
  const barColor = value > 30 ? 'bg-emerald-500' : value > -10 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${normalized * 100}%` }} />
      </div>
      <span className={`text-sm font-bold ${color}`}>{label}</span>
    </div>
  );
}

// ─── Component ──────────────────────────────────────────────────────

export default function MarketReportClient() {
  const report = useMemo(() => generateReport(), []);

  return (
    <div className="space-y-8">
      {/* Week header + sentiment */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Week of</p>
            <p className="text-white text-lg font-bold">{report.weekRange}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Market Sentiment</p>
            <SentimentGauge value={report.overallSentiment} />
          </div>
        </div>
        <p className="text-gray-300 leading-relaxed">{report.narrative}</p>
      </div>

      {/* Top Gainers + Losers */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Gainers */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
            <span className="text-emerald-400">&#9650;</span> Top Gainers
          </h2>
          <div className="space-y-3">
            {report.gainers.map((card, i) => (
              <Link key={card.slug} href={`/sports/${card.slug}`} className="flex items-center gap-3 group">
                <span className="text-gray-600 text-xs w-5 text-right">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate group-hover:text-emerald-400 transition-colors">{card.player}</p>
                  <p className="text-gray-500 text-xs truncate">{card.name}</p>
                </div>
                <MiniSparkline change={card.change} />
                <span className="text-emerald-400 text-sm font-bold w-14 text-right">+{card.change}%</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Losers */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
            <span className="text-red-400">&#9660;</span> Top Losers
          </h2>
          <div className="space-y-3">
            {report.losers.map((card, i) => (
              <Link key={card.slug} href={`/sports/${card.slug}`} className="flex items-center gap-3 group">
                <span className="text-gray-600 text-xs w-5 text-right">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate group-hover:text-red-400 transition-colors">{card.player}</p>
                  <p className="text-gray-500 text-xs truncate">{card.name}</p>
                </div>
                <MiniSparkline change={card.change} />
                <span className="text-red-400 text-sm font-bold w-14 text-right">{card.change}%</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Sector Performance */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <h2 className="text-white font-bold text-lg mb-4">Sector Performance</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {report.sectors.map(sector => (
            <div key={sector.sport} className="bg-gray-950/50 border border-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-semibold text-sm">{sportLabels[sector.sport]}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${sector.outlook.bg} ${sector.outlook.color}`}>
                  {sector.outlook.label}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-lg font-bold ${sector.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {sector.change >= 0 ? '+' : ''}{sector.change}%
                </span>
                <MiniSparkline change={sector.change} />
              </div>
              <div className="text-gray-500 text-xs">
                <p>Volume: {sector.volume.toLocaleString()} searches</p>
                {sector.topCard && (
                  <p className="mt-1 truncate">
                    Top: <Link href={`/sports/${sector.topCardSlug}`} className="text-gray-400 hover:text-white transition-colors">{sector.topCard.split(' ').slice(0, 4).join(' ')}</Link>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rookie Watch */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <h2 className="text-white font-bold text-lg mb-1">Rookie Watch</h2>
        <p className="text-gray-500 text-sm mb-4">Tracking rookie card performance across all sports</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {report.rookieWatch.map(card => (
            <Link key={card.slug} href={`/sports/${card.slug}`} className="flex items-center gap-3 bg-gray-950/50 border border-gray-800 rounded-xl p-3 hover:border-gray-700 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{card.player}</p>
                <p className="text-gray-500 text-xs truncate">{card.reason}</p>
              </div>
              <div className="text-right shrink-0">
                <span className={`text-sm font-bold ${card.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {card.change >= 0 ? '+' : ''}{card.change}%
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Vintage Spotlight + Buying Tip */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-amber-950/30 to-gray-900 border border-amber-900/30 rounded-2xl p-5">
          <h2 className="text-amber-400 font-bold text-lg mb-3">Vintage Spotlight</h2>
          <Link href={`/sports/${report.vintageSpotlight.slug}`} className="block group">
            <p className="text-white font-semibold group-hover:text-amber-400 transition-colors">{report.vintageSpotlight.name}</p>
            <p className="text-gray-400 text-sm mt-2 leading-relaxed">{report.vintageSpotlight.story}</p>
            <p className="text-amber-400/80 text-xs mt-3">View card details &rarr;</p>
          </Link>
        </div>

        <div className="bg-gradient-to-br from-emerald-950/30 to-gray-900 border border-emerald-900/30 rounded-2xl p-5">
          <h2 className="text-emerald-400 font-bold text-lg mb-3">Buying Tip of the Week</h2>
          <p className="text-gray-300 text-sm leading-relaxed">{report.buyTip}</p>
          <div className="flex gap-2 mt-4">
            <Link href="/tools/grading-roi" className="text-emerald-400/80 text-xs hover:text-emerald-300 transition-colors">Grading ROI &rarr;</Link>
            <Link href="/tools/sealed-ev" className="text-emerald-400/80 text-xs hover:text-emerald-300 transition-colors">Sealed EV &rarr;</Link>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="text-center">
        <p className="text-gray-600 text-xs max-w-xl mx-auto">
          Market analysis is generated from simulated price data for educational purposes. Actual card values may differ.
          Always research current market conditions before making purchasing decisions.
        </p>
      </div>
    </div>
  );
}
