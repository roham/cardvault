'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

/* ─── helpers ─── */
function dateHash(d: Date): number {
  const s = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  let h = 0;
  for (let i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) | 0; }
  return Math.abs(h);
}

function seededRng(seed: number) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
}

function parseValue(v: string): number {
  const m = v.match(/\$[\d,]+/);
  return m ? parseInt(m[0].replace(/[$,]/g, ''), 10) : 0;
}

function slugifyPlayer(name: string): string {
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/* ─── sport config ─── */
const SPORT_COLORS: Record<string, string> = {
  baseball: 'text-rose-400', basketball: 'text-orange-400',
  football: 'text-emerald-400', hockey: 'text-sky-400',
};
const SPORT_BG: Record<string, string> = {
  baseball: 'bg-rose-950/40 border-rose-800/40',
  basketball: 'bg-orange-950/40 border-orange-800/40',
  football: 'bg-emerald-950/40 border-emerald-800/40',
  hockey: 'bg-sky-950/40 border-sky-800/40',
};
const SPORT_EMOJI: Record<string, string> = {
  baseball: '⚾', basketball: '🏀', football: '🏈', hockey: '🏒',
};

/* ─── quarterly outlook data ─── */
const QUARTERLY_OUTLOOK = [
  {
    quarter: 'Q2 2025',
    period: 'Apr - Jun',
    overall: 'Bullish',
    confidence: 78,
    summary: 'Peak activity. NFL Draft and NBA Playoffs drive massive hobby attention. Rookie card demand surges across all sports as draft prospects get their first pro cards.',
    catalysts: [
      { event: 'NFL Draft (Apr 24-26)', impact: 'High', sport: 'football', description: 'Top prospect cards spike 50-200% on draft night. Day 1-2 picks see biggest gains.' },
      { event: 'NBA Playoffs (Apr-Jun)', impact: 'High', sport: 'basketball', description: 'Breakout playoff performers see 30-80% card value increases. Conference Finals are peak.' },
      { event: 'MLB Season Underway', impact: 'Medium', sport: 'baseball', description: 'Early-season breakouts create buying windows. Hot starts drive 20-40% gains.' },
      { event: 'NHL Stanley Cup Playoffs', impact: 'Medium', sport: 'hockey', description: 'Playoff runs boost hockey card interest 25-50% from regular season baseline.' },
      { event: 'National Sports Collectors Convention Prep', impact: 'Medium', sport: 'baseball', description: 'Pre-show buying begins. Dealers and flippers stock up on inventory.' },
    ],
    risks: [
      'Overpriced draft prospects that bust (50%+ of top picks decline within 18 months)',
      'Market saturation from new product releases (Panini, Topps, Upper Deck all releasing)',
      'Economic headwinds affecting discretionary spending on collectibles',
    ],
  },
  {
    quarter: 'Q3 2025',
    period: 'Jul - Sep',
    overall: 'Neutral',
    confidence: 62,
    summary: 'Mixed signals. The National brings temporary market boost but post-event correction is typical. Football preseason hype builds while baseball fatigue sets in for mid-tier cards.',
    catalysts: [
      { event: 'The National (Jul 23-27)', impact: 'High', sport: 'baseball', description: 'Biggest card show of the year. Transaction volume peaks. Exclusive products released.' },
      { event: 'NBA Draft (Jun 26)', impact: 'High', sport: 'basketball', description: 'Next wave of rookie class revealed. Cooper Flagg card market explodes.' },
      { event: 'NFL Training Camps (Jul)', impact: 'Medium', sport: 'football', description: 'Rookie hype cycle begins. Camp standouts see 15-30% card appreciation.' },
      { event: 'MLB All-Star Game (Jul 15)', impact: 'Low', sport: 'baseball', description: 'First-time All-Stars see modest 10-20% bumps. Veteran selections have minimal impact.' },
      { event: 'NHL Free Agency (Jul 1)', impact: 'Low', sport: 'hockey', description: 'Player movement creates short-term volatility. New team cards generate interest.' },
    ],
    risks: [
      'Post-National hangover as inventory acquired at shows hits online markets',
      'Summer seasonality — collector attention drops as outdoor activities increase',
      'NFL rookie card oversupply as multiple manufacturers release football products',
    ],
  },
  {
    quarter: 'Q4 2025',
    period: 'Oct - Dec',
    overall: 'Bullish',
    confidence: 72,
    summary: 'Strong finish. NFL and NBA seasons drive daily engagement. Holiday buying creates demand surge. Year-end tax-loss selling creates bargain opportunities for savvy collectors.',
    catalysts: [
      { event: 'NFL Season (Sep-Dec)', impact: 'High', sport: 'football', description: 'Strongest period for football cards. Breakout players see 40-100% gains.' },
      { event: 'NBA Season Opens (Oct)', impact: 'High', sport: 'basketball', description: 'New season brings fresh narratives. Sophomore players to watch closely.' },
      { event: 'World Series (Oct)', impact: 'Medium', sport: 'baseball', description: 'WS MVP cards surge 50-150%. Surprise team players get biggest boosts.' },
      { event: 'Holiday Shopping (Nov-Dec)', impact: 'High', sport: 'baseball', description: 'Gift buying drives retail product sales. Sealed hobby boxes appreciate 10-20%.' },
      { event: 'NHL Season Ramps Up', impact: 'Medium', sport: 'hockey', description: 'Young stars emerging by December create buying opportunities.' },
    ],
    risks: [
      'Tax-loss selling pressure in December (collectors selling losers to offset gains)',
      'Credit card debt concerns reducing discretionary spending',
      'Grading company backlogs lengthening submission ROI timelines',
    ],
  },
];

/* ─── sector outlook ─── */
const SECTOR_OUTLOOK = [
  { name: 'Modern Rookies', signal: 'Buy', confidence: 82, trend: 'up', color: 'text-emerald-400', description: 'Strongest sector for 2025. Draft classes across all 4 sports are loaded with generational talents. Early-career cards of confirmed stars are the safest bet.' },
  { name: 'Vintage (Pre-1980)', signal: 'Hold', confidence: 70, trend: 'stable', color: 'text-amber-400', description: 'Blue-chip vintage continues to appreciate 5-8% annually. Limited supply. High barrier to entry. Best for long-term holders, not flippers.' },
  { name: 'Sealed Products', signal: 'Buy', confidence: 75, trend: 'up', color: 'text-emerald-400', description: 'Hobby boxes from 2020-2023 are appreciating as supply dries up. Focus on football and basketball hobby boxes with confirmed hit potential.' },
  { name: 'Graded Slabs', signal: 'Hold', confidence: 65, trend: 'stable', color: 'text-amber-400', description: 'PSA 10 premiums are stabilizing after post-COVID normalization. BGS 9.5/10 still commands a strong premium for modern cards.' },
  { name: 'Pre-War (Pre-1940)', signal: 'Strong Buy', confidence: 88, trend: 'up', color: 'text-emerald-400', description: 'Safest sector in the hobby. T206, Goudey, Play Ball — these are 80-100 year old pieces of history. Institutional money is entering this space.' },
  { name: 'Prospects/Minors', signal: 'Speculative', confidence: 45, trend: 'volatile', color: 'text-red-400', description: 'High risk, high reward. For every Wembanyama there are 10 busts. Limit exposure to 10-15% of your card portfolio.' },
];

/* ─── budget strategies ─── */
const BUDGET_STRATEGIES = [
  { tier: 'Under $25', icon: '💵', picks: 'Raw rookies of emerging 2nd/3rd year players. Base Prizm, Topps Chrome, Upper Deck Young Guns.', strategy: 'Buy volume. 10-15 cards of different players. If 2-3 hit, the portfolio doubles.', risk: 'Low' },
  { tier: '$25 - $100', icon: '💰', picks: 'Numbered parallels (/199, /99) of confirmed starters. PSA 9 rookies of rising stars.', strategy: 'Targeted bets on players with upcoming catalysts (playoffs, awards, milestones).', risk: 'Medium' },
  { tier: '$100 - $500', icon: '💎', picks: 'PSA 10 rookies of established stars. Hobby box sealed products from strong years.', strategy: 'Focus on confirmed stars. Buy dips on elite players after losses or slow starts.', risk: 'Medium' },
  { tier: '$500 - $2,000', icon: '🏆', picks: 'BGS 9.5/10 Prizm Silver rookies. Vintage HOF cards in VG-EX condition. Key rookie cards.', strategy: 'Portfolio anchors. These are your blue chips. Hold 2-5 years minimum.', risk: 'Medium-Low' },
  { tier: '$2,000+', icon: '👑', picks: 'PSA 10 flagship rookies of generational players. Pre-war HOF cards. Key vintage.', strategy: 'Trophy cards. Buy the best example you can afford. Quality over quantity at this level.', risk: 'Low (if quality)' },
];

export default function MarketOutlookClient() {
  const [activeQuarter, setActiveQuarter] = useState(0);
  const [activeSport, setActiveSport] = useState<string | null>(null);

  const today = new Date();
  const seed = dateHash(today);
  const rng = seededRng(seed);

  const sportData = useMemo(() => {
    const sports = ['baseball', 'basketball', 'football', 'hockey'];
    return sports.map(sport => {
      const cards = sportsCards.filter(c => c.sport === sport);
      const totalValue = cards.reduce((sum, c) => sum + parseValue(c.estimatedValueRaw), 0);
      const rookieCount = cards.filter(c => c.rookie).length;
      const avgValue = cards.length > 0 ? Math.round(totalValue / cards.length) : 0;

      // Simulated outlook metrics
      const sportSeed = seededRng(seed + sport.charCodeAt(0) * 100);
      const ytdReturn = Math.round((sportSeed() * 30 - 8) * 10) / 10;
      const forecastReturn = Math.round((sportSeed() * 25 - 5) * 10) / 10;
      const volume = Math.round(sportSeed() * 40 + 60);

      // Top pick for this sport (highest value rookie)
      const rookies = cards.filter(c => c.rookie).sort((a, b) => parseValue(b.estimatedValueRaw) - parseValue(a.estimatedValueRaw));
      const topPick = rookies[Math.floor(sportSeed() * Math.min(5, rookies.length))];

      return {
        sport, cards: cards.length, totalValue, rookieCount, avgValue,
        ytdReturn, forecastReturn, volume, topPick,
      };
    });
  }, [seed]);

  // Overall market confidence (weighted avg of quarterly outlooks)
  const overallConfidence = useMemo(() => {
    const weights = [0.5, 0.3, 0.2]; // near-term weighted heavier
    return Math.round(QUARTERLY_OUTLOOK.reduce((sum, q, i) => sum + q.confidence * weights[i], 0));
  }, []);

  // Top picks of the day (seeded from card data)
  const topPicks = useMemo(() => {
    const eligible = sportsCards.filter(c => c.rookie && parseValue(c.estimatedValueRaw) >= 5 && parseValue(c.estimatedValueRaw) <= 500);
    const shuffled = [...eligible].sort(() => rng() - 0.5);
    return shuffled.slice(0, 6);
  }, [rng]);

  const q = QUARTERLY_OUTLOOK[activeQuarter];

  return (
    <div className="space-y-8">
      {/* Overall Market Confidence */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">2025 Market Confidence</h2>
          <span className={`text-2xl font-bold ${overallConfidence >= 70 ? 'text-emerald-400' : overallConfidence >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
            {overallConfidence}/100
          </span>
        </div>
        <div className="w-full bg-gray-700/50 rounded-full h-4 mb-3">
          <div
            className={`h-4 rounded-full transition-all ${overallConfidence >= 70 ? 'bg-emerald-500' : overallConfidence >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
            style={{ width: `${overallConfidence}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>Bearish</span>
          <span>Neutral</span>
          <span>Bullish</span>
        </div>
        <p className="mt-4 text-gray-400 text-sm">
          The 2025 card market outlook is <strong className="text-white">{overallConfidence >= 70 ? 'bullish' : overallConfidence >= 50 ? 'cautiously optimistic' : 'uncertain'}</strong>.
          Strong draft classes across all sports, institutional interest in vintage, and growing international collectors are driving demand. Key risks include oversupply from manufacturers and macroeconomic headwinds.
        </p>
      </div>

      {/* Quarterly Tabs */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Quarterly Breakdown</h2>
        <div className="flex gap-2 mb-4">
          {QUARTERLY_OUTLOOK.map((quarter, i) => (
            <button
              key={i}
              onClick={() => setActiveQuarter(i)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeQuarter === i
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-800/60 text-gray-400 hover:text-white hover:bg-gray-700/60'
              }`}
            >
              {quarter.quarter}
            </button>
          ))}
        </div>

        <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-lg font-bold text-white">{q.quarter} <span className="text-gray-500 font-normal text-sm">({q.period})</span></h3>
              <span className={`inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                q.overall === 'Bullish' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50'
                : q.overall === 'Neutral' ? 'bg-amber-950/60 text-amber-400 border border-amber-800/50'
                : 'bg-red-950/60 text-red-400 border border-red-800/50'
              }`}>
                {q.overall} &middot; {q.confidence}% confidence
              </span>
            </div>
          </div>
          <p className="text-gray-400 text-sm mt-3 mb-6">{q.summary}</p>

          <h4 className="text-sm font-semibold text-white mb-3">Key Catalysts</h4>
          <div className="space-y-3 mb-6">
            {q.catalysts.map((cat, i) => (
              <div key={i} className={`${SPORT_BG[cat.sport]} border rounded-xl p-3`}>
                <div className="flex items-center gap-2 mb-1">
                  <span>{SPORT_EMOJI[cat.sport]}</span>
                  <span className="text-white text-sm font-medium">{cat.event}</span>
                  <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                    cat.impact === 'High' ? 'bg-emerald-950/60 text-emerald-400'
                    : cat.impact === 'Medium' ? 'bg-amber-950/60 text-amber-400'
                    : 'bg-gray-700/60 text-gray-400'
                  }`}>
                    {cat.impact} Impact
                  </span>
                </div>
                <p className="text-gray-400 text-xs">{cat.description}</p>
              </div>
            ))}
          </div>

          <h4 className="text-sm font-semibold text-white mb-3">Risk Factors</h4>
          <div className="space-y-2">
            {q.risks.map((risk, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span className="text-red-400 mt-0.5">&#9888;</span>
                <span className="text-gray-400">{risk}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sport-by-Sport Outlook */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Sport-by-Sport Outlook</h2>
        <div className="flex gap-2 mb-4 flex-wrap">
          <button
            onClick={() => setActiveSport(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeSport === null ? 'bg-amber-600 text-white' : 'bg-gray-800/60 text-gray-400 hover:text-white'
            }`}
          >
            All Sports
          </button>
          {['baseball', 'basketball', 'football', 'hockey'].map(sport => (
            <button
              key={sport}
              onClick={() => setActiveSport(sport)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeSport === sport ? 'bg-amber-600 text-white' : 'bg-gray-800/60 text-gray-400 hover:text-white'
              }`}
            >
              {SPORT_EMOJI[sport]} {sport.charAt(0).toUpperCase() + sport.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sportData.filter(s => !activeSport || s.sport === activeSport).map(s => (
            <div key={s.sport} className={`${SPORT_BG[s.sport]} border rounded-2xl p-5`}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{SPORT_EMOJI[s.sport]}</span>
                <h3 className={`text-lg font-bold ${SPORT_COLORS[s.sport]}`}>
                  {s.sport.charAt(0).toUpperCase() + s.sport.slice(1)}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-900/40 rounded-lg p-2 text-center">
                  <div className="text-xs text-gray-500">YTD Return</div>
                  <div className={`text-lg font-bold ${s.ytdReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {s.ytdReturn >= 0 ? '+' : ''}{s.ytdReturn}%
                  </div>
                </div>
                <div className="bg-gray-900/40 rounded-lg p-2 text-center">
                  <div className="text-xs text-gray-500">2025 Forecast</div>
                  <div className={`text-lg font-bold ${s.forecastReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {s.forecastReturn >= 0 ? '+' : ''}{s.forecastReturn}%
                  </div>
                </div>
                <div className="bg-gray-900/40 rounded-lg p-2 text-center">
                  <div className="text-xs text-gray-500">Cards Tracked</div>
                  <div className="text-lg font-bold text-white">{s.cards.toLocaleString()}</div>
                </div>
                <div className="bg-gray-900/40 rounded-lg p-2 text-center">
                  <div className="text-xs text-gray-500">Volume Index</div>
                  <div className="text-lg font-bold text-white">{s.volume}</div>
                </div>
              </div>

              {s.topPick && (
                <div className="bg-gray-900/40 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Top Pick for 2025</div>
                  <Link href={`/sports/${s.topPick.slug}`} className="text-sm font-medium text-amber-400 hover:text-amber-300">
                    {s.topPick.name} &rarr;
                  </Link>
                  <div className="text-xs text-gray-500 mt-0.5">{s.topPick.estimatedValueRaw} raw &middot; {s.topPick.player}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Sector Outlook */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Sector Outlook</h2>
        <div className="space-y-3">
          {SECTOR_OUTLOOK.map((sector, i) => (
            <details key={i} className="group bg-gray-800/50 border border-gray-700/50 rounded-xl">
              <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-800/70 transition-colors rounded-xl">
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold ${sector.color}`}>{sector.signal}</span>
                  <span className="text-white font-medium text-sm">{sector.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">{sector.confidence}% conf.</span>
                  <span className={`text-sm ${sector.trend === 'up' ? 'text-emerald-400' : sector.trend === 'stable' ? 'text-amber-400' : 'text-red-400'}`}>
                    {sector.trend === 'up' ? '&#9650;' : sector.trend === 'stable' ? '&#9644;' : '&#9660;'}
                  </span>
                  <span className="text-gray-500 group-open:rotate-180 transition-transform text-xs">&#9660;</span>
                </div>
              </summary>
              <div className="px-4 pb-4 text-gray-400 text-sm leading-relaxed">
                {sector.description}
                <div className="mt-2 w-full bg-gray-700/50 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${sector.confidence >= 70 ? 'bg-emerald-500' : sector.confidence >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${sector.confidence}%` }}
                  />
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Budget Strategy Guide */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Investment Strategy by Budget</h2>
        <div className="space-y-3">
          {BUDGET_STRATEGIES.map((tier, i) => (
            <div key={i} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl">{tier.icon}</span>
                <h3 className="text-white font-bold text-sm">{tier.tier}</h3>
                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                  tier.risk === 'Low' ? 'bg-emerald-950/60 text-emerald-400'
                  : tier.risk === 'Medium-Low' ? 'bg-teal-950/60 text-teal-400'
                  : tier.risk === 'Medium' ? 'bg-amber-950/60 text-amber-400'
                  : 'bg-red-950/60 text-red-400'
                }`}>
                  {tier.risk} Risk
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-gray-500 mb-1">What to Buy</div>
                  <div className="text-gray-300">{tier.picks}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Strategy</div>
                  <div className="text-gray-300">{tier.strategy}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Picks */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Today&apos;s Outlook Picks</h2>
        <p className="text-gray-500 text-sm mb-4">6 rookie cards highlighted daily based on market conditions. Same picks for everyone.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {topPicks.map((card, i) => (
            <Link key={i} href={`/sports/${card.slug}`} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 hover:border-amber-700/50 transition-colors block">
              <div className="flex items-center gap-2 mb-1">
                <span>{SPORT_EMOJI[card.sport] || '🃏'}</span>
                <span className={`text-xs font-medium ${SPORT_COLORS[card.sport] || 'text-gray-400'}`}>
                  {card.sport.charAt(0).toUpperCase() + card.sport.slice(1)}
                </span>
                {card.rookie && <span className="text-xs bg-amber-950/60 text-amber-400 px-1.5 py-0.5 rounded">RC</span>}
              </div>
              <div className="text-white text-sm font-medium truncate">{card.name}</div>
              <div className="text-gray-500 text-xs mt-0.5">{card.player} &middot; {card.year}</div>
              <div className="text-amber-400 text-sm font-bold mt-2">{card.estimatedValueRaw}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Key Dates */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Key Dates Remaining in 2025</h2>
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl overflow-hidden">
          <div className="divide-y divide-gray-700/50">
            {[
              { date: 'Apr 24-26', event: 'NFL Draft', sport: 'football', impact: 'Very High' },
              { date: 'Apr-Jun', event: 'NBA Playoffs', sport: 'basketball', impact: 'High' },
              { date: 'Apr-Jun', event: 'NHL Stanley Cup Playoffs', sport: 'hockey', impact: 'High' },
              { date: 'Jun 26', event: 'NBA Draft', sport: 'basketball', impact: 'Very High' },
              { date: 'Jul 1', event: 'NHL Free Agency', sport: 'hockey', impact: 'Medium' },
              { date: 'Jul 15', event: 'MLB All-Star Game', sport: 'baseball', impact: 'Medium' },
              { date: 'Jul 23-27', event: 'The National Convention', sport: 'baseball', impact: 'Very High' },
              { date: 'Sep 4', event: 'NFL Season Opener', sport: 'football', impact: 'High' },
              { date: 'Oct', event: 'World Series', sport: 'baseball', impact: 'High' },
              { date: 'Oct', event: 'NBA Season Opener', sport: 'basketball', impact: 'High' },
              { date: 'Nov-Dec', event: 'Holiday Shopping Season', sport: 'baseball', impact: 'High' },
            ].map((d, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <span className="text-xs text-gray-500 w-20 shrink-0">{d.date}</span>
                <span>{SPORT_EMOJI[d.sport]}</span>
                <span className="text-white text-sm font-medium flex-1">{d.event}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  d.impact === 'Very High' ? 'bg-emerald-950/60 text-emerald-400'
                  : d.impact === 'High' ? 'bg-amber-950/60 text-amber-400'
                  : 'bg-gray-700/60 text-gray-400'
                }`}>
                  {d.impact}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-900/50 border border-gray-700/30 rounded-xl p-4 text-xs text-gray-500">
        <strong className="text-gray-400">Disclaimer:</strong> This outlook is for educational and entertainment purposes only. Card market predictions are based on historical patterns, seasonal trends, and estimated data — not real-time market feeds. Past performance does not guarantee future results. Always do your own research before making investment decisions. CardVault is not a financial advisor.
      </div>
    </div>
  );
}
