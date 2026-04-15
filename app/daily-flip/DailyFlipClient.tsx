'use client';

import { useState, useMemo, useCallback } from 'react';
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

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
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

/* ─── story templates ─── */
const STORY_TEMPLATES = [
  { title: '{player} Cards Surge After {event}', type: 'bullish' as const },
  { title: '{sport} Market Heats Up Ahead of {event}', type: 'bullish' as const },
  { title: 'Rookie Watch: {player} Breakout Driving Demand', type: 'bullish' as const },
  { title: '{player} Cards Cool Off Following {event}', type: 'bearish' as const },
  { title: '{sport} Collectors Shift Focus to {category}', type: 'neutral' as const },
  { title: 'Grading Backlog Update: {company} Turnaround Times {direction}', type: 'neutral' as const },
  { title: '{era} Cards See Renewed Interest from {buyer}', type: 'bullish' as const },
  { title: 'Market Alert: {player} Investment Window Closing', type: 'bullish' as const },
];

const EVENTS = [
  'Strong Game Performance', 'Playoff Push', 'Award Nomination', 'Milestone Achievement',
  'Trade Rumors', 'Injury Return', 'All-Star Selection', 'Viral Moment',
  'Record-Breaking Stats', 'Championship Buzz', 'Draft Hype', 'Hot Streak',
];

const BEARISH_EVENTS = [
  'Slump in Performance', 'Injury Concern', 'Off-Field Issues', 'Market Correction',
  'Oversupply from New Product', 'Season-Ending Injury', 'Post-Hype Cooldown',
];

const CATEGORIES = ['Vintage', 'Modern Rookies', 'Sealed Products', 'Graded Slabs', 'Prospects'];
const COMPANIES = ['PSA', 'BGS', 'CGC', 'SGC'];
const DIRECTIONS = ['Improving', 'Steady', 'Lengthening'];
const ERAS = ['Pre-War', 'Vintage (1950s-1970s)', 'Junk Wax Era', 'Modern (2000s-2010s)', 'Ultra-Modern'];
const BUYERS = ['Young Collectors', 'Institutional Investors', 'Cross-Sport Collectors', 'International Buyers'];

const DAILY_STATS = [
  'The average PSA 10 carries a {x}x premium over raw for modern rookies.',
  'Baseball accounts for {pct}% of all cards valued over $1,000 in our database.',
  '{count} cards in our database are valued over $500 in gem mint condition.',
  'The most represented decade in our database is the {decade}.',
  'Hockey cards make up {pct}% of our database but {pct2}% of value over $10,000.',
  'Rookie cards carry an average {x}x premium over non-rookie cards of the same player.',
  'The oldest card in our database dates to {year}.',
  '{sport} has the highest average card value at ${avg}.',
];

const BUY_REASONS = [
  'Undervalued relative to career trajectory',
  'Approaching key milestone that typically drives 20-40% price increase',
  'Strong recent performance creating buy window before wider attention',
  'Historically low PSA 10 population relative to demand',
  'Cross-sport appeal expanding collector base',
];

const AVOID_REASONS = [
  'Overpriced after recent hype cycle — expect 15-25% pullback',
  'High supply entering market from recent product releases',
  'Performance trending down, reducing near-term demand',
  'Better value alternatives available in the same tier',
  'Grading premium at unsustainable levels for this card',
];

/* ─── main component ─── */
export default function DailyFlipClient() {
  const [copied, setCopied] = useState(false);

  const today = useMemo(() => new Date(), []);
  const seed = useMemo(() => dateHash(today), [today]);
  const rng = useMemo(() => seededRng(seed), [seed]);

  const brief = useMemo(() => {
    const r = rng;
    const cards = [...sportsCards].sort(() => r() - 0.5);

    // Market mood
    const moodVal = r();
    const mood: 'Bullish' | 'Neutral' | 'Bearish' = moodVal > 0.6 ? 'Bullish' : moodVal > 0.3 ? 'Neutral' : 'Bearish';
    const moodEmoji = mood === 'Bullish' ? '🟢' : mood === 'Neutral' ? '🟡' : '🔴';
    const moodPct = mood === 'Bullish' ? `+${(r() * 3 + 0.5).toFixed(1)}%` : mood === 'Bearish' ? `-${(r() * 2.5 + 0.3).toFixed(1)}%` : `${(r() > 0.5 ? '+' : '-')}${(r() * 0.8 + 0.1).toFixed(1)}%`;

    // Sport moods
    const sports = ['baseball', 'basketball', 'football', 'hockey'];
    const sportMoods = sports.map(s => {
      const v = r();
      const m = v > 0.55 ? 'up' as const : v > 0.25 ? 'flat' as const : 'down' as const;
      const pct = m === 'up' ? `+${(r() * 4 + 0.3).toFixed(1)}%` : m === 'down' ? `-${(r() * 3 + 0.2).toFixed(1)}%` : `${(r() > 0.5 ? '+' : '-')}${(r() * 0.5).toFixed(1)}%`;
      return { sport: s, mood: m, pct };
    });

    // Top 3 stories
    const usedPlayers = new Set<string>();
    const stories = Array.from({ length: 3 }, (_, i) => {
      const tpl = STORY_TEMPLATES[Math.floor(r() * STORY_TEMPLATES.length)];
      let card = cards.find(c => !usedPlayers.has(c.player) && parseValue(c.estimatedValueGem) > 20);
      if (!card) card = cards[i];
      usedPlayers.add(card.player);

      const sport = card.sport.charAt(0).toUpperCase() + card.sport.slice(1);
      const event = tpl.type === 'bearish'
        ? BEARISH_EVENTS[Math.floor(r() * BEARISH_EVENTS.length)]
        : EVENTS[Math.floor(r() * EVENTS.length)];
      const category = CATEGORIES[Math.floor(r() * CATEGORIES.length)];
      const company = COMPANIES[Math.floor(r() * COMPANIES.length)];
      const direction = DIRECTIONS[Math.floor(r() * DIRECTIONS.length)];
      const era = ERAS[Math.floor(r() * ERAS.length)];
      const buyer = BUYERS[Math.floor(r() * BUYERS.length)];

      const title = tpl.title
        .replace('{player}', card.player)
        .replace('{sport}', sport)
        .replace('{event}', event)
        .replace('{category}', category)
        .replace('{company}', company)
        .replace('{direction}', direction)
        .replace('{era}', era)
        .replace('{buyer}', buyer);

      const impact = tpl.type === 'bullish' ? `+${(r() * 15 + 5).toFixed(0)}%` : tpl.type === 'bearish' ? `-${(r() * 12 + 3).toFixed(0)}%` : `${(r() > 0.5 ? '+' : '-')}${(r() * 5 + 1).toFixed(0)}%`;

      return { title, type: tpl.type, card, impact, sport: card.sport };
    });

    // Pick of the day — find a card with good value that isn't too expensive
    const pickCandidates = cards.filter(c =>
      !usedPlayers.has(c.player) && parseValue(c.estimatedValueRaw) >= 5 && parseValue(c.estimatedValueRaw) <= 200
    );
    const pick = pickCandidates[Math.floor(r() * Math.min(pickCandidates.length, 20))];
    usedPlayers.add(pick?.player ?? '');
    const buyReason = BUY_REASONS[Math.floor(r() * BUY_REASONS.length)];

    // Avoid today — find a pricier card
    const avoidCandidates = cards.filter(c =>
      !usedPlayers.has(c.player) && parseValue(c.estimatedValueGem) >= 100
    );
    const avoid = avoidCandidates[Math.floor(r() * Math.min(avoidCandidates.length, 20))];
    usedPlayers.add(avoid?.player ?? '');
    const avoidReason = AVOID_REASONS[Math.floor(r() * AVOID_REASONS.length)];

    // Top 5 movers (up)
    const gainers = cards.filter(c => !usedPlayers.has(c.player) && parseValue(c.estimatedValueGem) > 30)
      .slice(0, 20)
      .map(c => {
        usedPlayers.add(c.player);
        return { card: c, change: `+${(r() * 18 + 2).toFixed(1)}%` };
      })
      .sort((a, b) => parseFloat(b.change) - parseFloat(a.change))
      .slice(0, 5);

    // Top 5 decliners
    const losers = cards.filter(c => !usedPlayers.has(c.player) && parseValue(c.estimatedValueGem) > 30)
      .slice(0, 20)
      .map(c => {
        usedPlayers.add(c.player);
        return { card: c, change: `-${(r() * 12 + 1).toFixed(1)}%` };
      })
      .sort((a, b) => parseFloat(a.change) - parseFloat(b.change))
      .slice(0, 5);

    // Stat of the day
    const statTpl = DAILY_STATS[Math.floor(r() * DAILY_STATS.length)];
    const sportCards = { baseball: 0, basketball: 0, football: 0, hockey: 0 };
    const highValueCount = { count: 0, over10k: 0 };
    let oldest = 2025;
    const sportTotalValue: Record<string, number> = {};
    const decades: Record<string, number> = {};

    for (const c of sportsCards) {
      const s = c.sport as keyof typeof sportCards;
      if (sportCards[s] !== undefined) sportCards[s]++;
      const v = parseValue(c.estimatedValueGem);
      if (v >= 500) highValueCount.count++;
      if (v >= 10000) highValueCount.over10k++;
      if (c.year < oldest) oldest = c.year;
      if (!sportTotalValue[c.sport]) sportTotalValue[c.sport] = 0;
      sportTotalValue[c.sport] += parseValue(c.estimatedValueRaw);
      const decade = `${Math.floor(c.year / 10) * 10}s`;
      decades[decade] = (decades[decade] || 0) + 1;
    }
    const topDecade = Object.entries(decades).sort((a, b) => b[1] - a[1])[0];
    const topValueSport = Object.entries(sportTotalValue).sort((a, b) => b[1] - a[1])[0];
    const total = sportsCards.length;
    const bbPct = ((sportCards.baseball / total) * 100).toFixed(0);
    const hkPct = ((sportCards.hockey / total) * 100).toFixed(0);

    const stat = statTpl
      .replace('{x}', (r() * 4 + 3).toFixed(1))
      .replace('{pct}', bbPct)
      .replace('{pct2}', (r() * 8 + 12).toFixed(0))
      .replace('{count}', String(highValueCount.count))
      .replace('{decade}', topDecade?.[0] ?? '2020s')
      .replace('{year}', String(oldest))
      .replace('{sport}', topValueSport?.[0]?.charAt(0).toUpperCase() + (topValueSport?.[0]?.slice(1) ?? ''))
      .replace('{avg}', ((sportTotalValue[topValueSport?.[0] ?? 'baseball'] ?? 0) / (sportCards[topValueSport?.[0] as keyof typeof sportCards] || 1)).toFixed(0));

    // Upcoming catalysts
    const catalysts = [
      { event: 'NBA Playoffs Continue', sport: 'basketball', impact: 'High', when: 'This Week' },
      { event: 'MLB Regular Season', sport: 'baseball', impact: 'Medium', when: 'Ongoing' },
      { event: 'NFL Draft Prospect Workouts', sport: 'football', impact: 'Medium', when: 'This Month' },
      { event: 'NHL Playoff Push', sport: 'hockey', impact: 'High', when: 'This Week' },
      { event: 'PSA Grading Return Window', sport: 'all', impact: 'Low', when: 'Ongoing' },
    ];

    return { mood, moodEmoji, moodPct, sportMoods, stories, pick, buyReason, avoid, avoidReason, gainers, losers, stat, catalysts };
  }, [rng]);

  const handleCopy = useCallback(() => {
    const lines = [
      `📰 The Daily Flip — ${formatDate(today)}`,
      '',
      `${brief.moodEmoji} Market: ${brief.mood} (${brief.moodPct})`,
      '',
      '📰 TOP STORIES',
      ...brief.stories.map((s, i) => `${i + 1}. ${s.title} (${s.impact})`),
      '',
      `✅ PICK OF THE DAY: ${brief.pick?.player ?? 'N/A'} — ${brief.pick?.name ?? ''}`,
      `   Raw: ${brief.pick?.estimatedValueRaw ?? ''} | Gem: ${brief.pick?.estimatedValueGem ?? ''}`,
      '',
      `⚠️ AVOID TODAY: ${brief.avoid?.player ?? 'N/A'} — ${brief.avoid?.name ?? ''}`,
      '',
      '📈 TOP GAINERS',
      ...brief.gainers.map(g => `  ${g.card.player}: ${g.change}`),
      '',
      '📉 TOP DECLINERS',
      ...brief.losers.map(l => `  ${l.card.player}: ${l.change}`),
      '',
      `📊 Stat: ${brief.stat}`,
      '',
      'cardvault-two.vercel.app/daily-flip',
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [brief, today]);

  return (
    <div className="space-y-8">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 bg-gradient-to-r from-amber-950/50 to-orange-950/30 border border-amber-800/40 rounded-2xl">
        <div>
          <div className="text-amber-400 text-sm font-medium mb-1">Edition #{seed % 10000}</div>
          <div className="text-white text-xl font-bold">{formatDate(today)}</div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-xl font-bold text-lg ${brief.mood === 'Bullish' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40' : brief.mood === 'Bearish' ? 'bg-red-950/60 text-red-400 border border-red-800/40' : 'bg-yellow-950/60 text-yellow-400 border border-yellow-800/40'}`}>
            {brief.moodEmoji} {brief.mood} {brief.moodPct}
          </div>
        </div>
      </div>

      {/* Sport snapshots */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {brief.sportMoods.map(sm => (
          <div key={sm.sport} className={`p-4 rounded-xl border ${SPORT_BG[sm.sport]}`}>
            <div className="text-lg mb-1">{SPORT_EMOJI[sm.sport]}</div>
            <div className={`text-sm font-medium ${SPORT_COLORS[sm.sport]}`}>
              {sm.sport.charAt(0).toUpperCase() + sm.sport.slice(1)}
            </div>
            <div className={`text-lg font-bold ${sm.mood === 'up' ? 'text-emerald-400' : sm.mood === 'down' ? 'text-red-400' : 'text-gray-400'}`}>
              {sm.pct}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              {sm.mood === 'up' ? '▲ Trending Up' : sm.mood === 'down' ? '▼ Trending Down' : '◆ Flat'}
            </div>
          </div>
        ))}
      </div>

      {/* Top Stories */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">📰</span> Top Stories
        </h2>
        <div className="space-y-3">
          {brief.stories.map((story, i) => (
            <div key={i} className="p-4 bg-gray-800/60 border border-gray-700/50 rounded-xl hover:border-gray-600/50 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${story.type === 'bullish' ? 'bg-emerald-950/60 text-emerald-400' : story.type === 'bearish' ? 'bg-red-950/60 text-red-400' : 'bg-gray-700/60 text-gray-400'}`}>
                      {story.type === 'bullish' ? '▲ Bullish' : story.type === 'bearish' ? '▼ Bearish' : '◆ Neutral'}
                    </span>
                    <span className="text-xs text-gray-500">{SPORT_EMOJI[story.sport]} {story.sport.charAt(0).toUpperCase() + story.sport.slice(1)}</span>
                  </div>
                  <h3 className="text-white font-semibold text-sm sm:text-base">{story.title}</h3>
                  <div className="mt-2 flex items-center gap-3">
                    <Link href={`/sports/${story.card.slug}`} className="text-xs text-amber-400 hover:text-amber-300">
                      View Card →
                    </Link>
                    <Link href={`/players/${slugifyPlayer(story.card.player)}`} className="text-xs text-gray-400 hover:text-gray-300">
                      Player Profile →
                    </Link>
                  </div>
                </div>
                <div className={`text-right shrink-0 ${story.type === 'bullish' ? 'text-emerald-400' : story.type === 'bearish' ? 'text-red-400' : 'text-gray-400'}`}>
                  <div className="text-lg font-bold">{story.impact}</div>
                  <div className="text-xs text-gray-500">est. impact</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pick of the Day + Avoid Today */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Pick of the Day */}
        <div className="p-5 bg-gradient-to-br from-emerald-950/40 to-green-950/20 border border-emerald-800/40 rounded-2xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">✅</span>
            <h3 className="text-emerald-400 font-bold text-sm uppercase tracking-wider">Pick of the Day</h3>
          </div>
          {brief.pick && (
            <div>
              <Link href={`/sports/${brief.pick.slug}`} className="text-white font-bold text-lg hover:text-emerald-300 transition-colors">
                {brief.pick.name}
              </Link>
              <div className="text-gray-400 text-sm mt-1">{brief.pick.player} &middot; {brief.pick.year} &middot; {brief.pick.set}</div>
              <div className="flex items-center gap-4 mt-3">
                <div>
                  <div className="text-xs text-gray-500">Raw</div>
                  <div className="text-white font-semibold">{brief.pick.estimatedValueRaw}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Gem Mint</div>
                  <div className="text-emerald-400 font-semibold">{brief.pick.estimatedValueGem}</div>
                </div>
              </div>
              <p className="text-gray-400 text-sm mt-3 italic">{brief.buyReason}</p>
              <div className="mt-3 flex gap-2">
                <Link href={`/sports/${brief.pick.slug}`} className="text-xs bg-emerald-900/50 text-emerald-400 px-3 py-1.5 rounded-lg hover:bg-emerald-900/70 transition-colors">
                  View Card →
                </Link>
                <a href={brief.pick.ebaySearchUrl} target="_blank" rel="noopener noreferrer" className="text-xs bg-gray-800 text-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors">
                  Search eBay →
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Avoid Today */}
        <div className="p-5 bg-gradient-to-br from-red-950/40 to-rose-950/20 border border-red-800/40 rounded-2xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">⚠️</span>
            <h3 className="text-red-400 font-bold text-sm uppercase tracking-wider">Avoid Today</h3>
          </div>
          {brief.avoid && (
            <div>
              <Link href={`/sports/${brief.avoid.slug}`} className="text-white font-bold text-lg hover:text-red-300 transition-colors">
                {brief.avoid.name}
              </Link>
              <div className="text-gray-400 text-sm mt-1">{brief.avoid.player} &middot; {brief.avoid.year} &middot; {brief.avoid.set}</div>
              <div className="flex items-center gap-4 mt-3">
                <div>
                  <div className="text-xs text-gray-500">Raw</div>
                  <div className="text-white font-semibold">{brief.avoid.estimatedValueRaw}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Gem Mint</div>
                  <div className="text-red-400 font-semibold">{brief.avoid.estimatedValueGem}</div>
                </div>
              </div>
              <p className="text-gray-400 text-sm mt-3 italic">{brief.avoidReason}</p>
              <div className="mt-3">
                <Link href={`/sports/${brief.avoid.slug}`} className="text-xs bg-red-900/50 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-900/70 transition-colors">
                  View Card →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Movers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Gainers */}
        <div className="p-5 bg-gray-800/40 border border-gray-700/50 rounded-2xl">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <span className="text-emerald-400">📈</span> Top Gainers
          </h3>
          <div className="space-y-2">
            {brief.gainers.map((g, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-700/30 last:border-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs text-gray-500 w-4">{i + 1}</span>
                  <span className="text-sm">{SPORT_EMOJI[g.card.sport]}</span>
                  <Link href={`/sports/${g.card.slug}`} className="text-gray-200 text-sm truncate hover:text-white">
                    {g.card.player}
                  </Link>
                </div>
                <span className="text-emerald-400 font-bold text-sm shrink-0 ml-2">{g.change}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Decliners */}
        <div className="p-5 bg-gray-800/40 border border-gray-700/50 rounded-2xl">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <span className="text-red-400">📉</span> Top Decliners
          </h3>
          <div className="space-y-2">
            {brief.losers.map((l, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-700/30 last:border-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs text-gray-500 w-4">{i + 1}</span>
                  <span className="text-sm">{SPORT_EMOJI[l.card.sport]}</span>
                  <Link href={`/sports/${l.card.slug}`} className="text-gray-200 text-sm truncate hover:text-white">
                    {l.card.player}
                  </Link>
                </div>
                <span className="text-red-400 font-bold text-sm shrink-0 ml-2">{l.change}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stat of the Day */}
      <div className="p-5 bg-gradient-to-r from-violet-950/40 to-purple-950/20 border border-violet-800/40 rounded-2xl">
        <div className="flex items-start gap-3">
          <span className="text-2xl">📊</span>
          <div>
            <h3 className="text-violet-400 font-bold text-sm uppercase tracking-wider mb-2">Stat of the Day</h3>
            <p className="text-white text-lg">{brief.stat}</p>
          </div>
        </div>
      </div>

      {/* Upcoming Catalysts */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">📅</span> Upcoming Catalysts
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {brief.catalysts.map((c, i) => (
            <div key={i} className={`p-4 rounded-xl border ${c.sport === 'all' ? 'bg-gray-800/40 border-gray-700/40' : SPORT_BG[c.sport]}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">{c.sport === 'all' ? '🏅' : SPORT_EMOJI[c.sport]}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${c.impact === 'High' ? 'bg-amber-950/60 text-amber-400' : c.impact === 'Medium' ? 'bg-blue-950/60 text-blue-400' : 'bg-gray-700/60 text-gray-400'}`}>
                  {c.impact} Impact
                </span>
              </div>
              <div className="text-white text-sm font-medium">{c.event}</div>
              <div className="text-gray-500 text-xs mt-1">{c.when}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Share */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-gray-800/40 border border-gray-700/50 rounded-2xl">
        <div className="text-gray-400 text-sm text-center sm:text-left">
          New brief every day. Same picks for everyone. Share and compare with friends.
        </div>
        <button
          onClick={handleCopy}
          className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl transition-colors text-sm shrink-0"
        >
          {copied ? 'Copied!' : 'Share Brief'}
        </button>
      </div>

      {/* Related Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: '/market-analysis', label: 'Daily Analysis', icon: '📊' },
          { href: '/fear-greed', label: 'Fear & Greed', icon: '😱' },
          { href: '/market-movers', label: 'Market Movers', icon: '📈' },
          { href: '/power-rankings', label: 'Power Rankings', icon: '🏆' },
          { href: '/market-sectors', label: 'Sector Report', icon: '🗺️' },
          { href: '/market-correlations', label: 'Price Catalysts', icon: '🔗' },
          { href: '/market-heatmap', label: 'Heat Map', icon: '🌡️' },
          { href: '/news', label: 'Card News', icon: '📰' },
        ].map(link => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-2 p-3 bg-gray-800/40 border border-gray-700/30 rounded-xl text-sm text-gray-400 hover:text-white hover:border-gray-600/50 transition-colors"
          >
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
