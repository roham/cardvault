'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

/* ── types ───────────────────────────────────────────────────────── */

type Rec = 'BUY' | 'SELL' | 'HOLD';
type Risk = 'Low' | 'Medium' | 'High';
type Horizon = 'Short (1–3 months)' | 'Medium (3–12 months)' | 'Long (1+ year)';

interface PowerPlay {
  card: typeof sportsCards[0];
  rec: Rec;
  confidence: number;   // 1–5
  risk: Risk;
  horizon: Horizon;
  reasoning: string;
  upside: number;       // %
  downside: number;     // % (negative)
  currentValue: number;
}

/* ── helpers ──────────────────────────────────────────────────────── */

function dateHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h) + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function seededRng(seed: number) {
  let s = seed;
  return (): number => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function parseValue(val: string): number {
  const m = val.match(/\$([0-9,.]+)/);
  return m ? parseFloat(m[1].replace(',', '')) : 5;
}

function formatValue(n: number): string {
  if (n >= 1000) return '$' + (n / 1000).toFixed(1) + 'K';
  return '$' + n.toLocaleString();
}

function dateLabel(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

function friendlyDate(dateStr: string): string {
  const [y, mo, day] = dateStr.split('-').map(Number);
  const d = new Date(y, mo - 1, day);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

/* ── reasoning templates ──────────────────────────────────────────── */

const buyReasons: Record<string, string[]> = {
  rookie: [
    'As a confirmed rookie card, this piece carries the long-term appreciation potential that defines the hobby\'s most sought-after assets. Rookie cards of active contributors tend to outperform established veterans on a 12-month horizon. The current price point appears undervalued relative to comparable rookies in the same sport, suggesting room to run. Early accumulation ahead of a potential breakout season could yield strong returns.',
    'Rookie status gives this card a scarcity premium that raw value alone does not capture. In rising sport markets, first-year issues attract both new and experienced collectors — expanding the buyer base. With comparable comps trending upward, now looks like a favorable entry point. A graded copy could amplify upside further.',
  ],
  lowValue: [
    'At current price levels this card offers an asymmetric risk/reward setup — limited downside with meaningful upside if the player\'s trajectory continues. Low-dollar rookies and emerging stars consistently punch above their weight when the hobby cycle turns bullish. The entry cost is low enough to justify accumulation without overextending. Watch for a performance catalyst to trigger a re-rating.',
    'Value-tier cards like this often lag behind name recognition before catching up sharply. The current price suggests the market hasn\'t fully priced in the player\'s recent performance or collector appeal. Accumulating at these levels before broader awareness develops is a classic power-play strategy. Patient investors typically see the best returns here.',
  ],
  vintage: [
    'Vintage issues from this era carry a structural scarcity that modern cards simply cannot replicate — census populations are fixed and declining. Collector demand for pre-PSA-era cards has been steadily rising as the hobby matures. The current ask looks reasonable relative to recent auction results for comparable grades. Hard assets with finite supply rarely stay underpriced for long.',
    'Cards from this period represent the foundation of the hobby, and deep-pocket collectors continue to allocate into vintage as a store of value. Recent auction activity shows firming prices with limited seller motivation. Buying into weakness here is consistent with how long-term collectors have built wealth in the hobby.',
  ],
};

const sellReasons: Record<string, string[]> = {
  highValue: [
    'After a strong run, this card appears to be approaching fair value or a mild overvaluation. High-grade copies have been appearing more frequently at auction, which typically signals the population ceiling is rising. Taking partial profits here reduces downside exposure while preserving some upside through a smaller remaining position. The broader market rotation away from premium-tier modern cards adds to the case.',
    'At current valuations the risk/reward has shifted. Comparable comps have sold at slightly lower prices over the past few weeks, suggesting the recent ceiling may hold. For investors who acquired early, this looks like a clean profit-taking opportunity. Reinvesting into earlier-career or lower-population alternatives could offer better relative value.',
  ],
  veteran: [
    'Veteran cards of retiring or inactive players face a natural headwind as their on-field narrative fades. While legacy demand provides a floor, upward catalysts are fewer going forward. Repositioning into active-player or rookie-tier cards aligns better with where collector attention is flowing. This is a sell-the-strength moment before sentiment fully fades.',
    'The player\'s career peak is behind them, and the market tends to gradually reprice veteran cards lower as newer names capture collector imagination. Recent comps show softening, and the current level may represent the best near-term exit price. Selling into any remaining collector enthusiasm is the strategically sound move.',
  ],
};

const holdReasons: Record<string, string[]> = {
  stable: [
    'This card sits in a comfortable equilibrium — established demand, reasonable supply, and no obvious near-term catalyst in either direction. The value is supported by a loyal collector base, making a sharp drawdown unlikely. Holding here preserves optionality: a strong performance season or grading pop scarcity could flip this into a BUY. No urgent reason to sell into a quiet market.',
    'Stable price action over the past quarter suggests this card has found its floor and ceiling for now. The player remains relevant and the set enjoys consistent collector interest. Unless you need the liquidity, holding through the next potential catalyst makes more sense than selling at current prices. This is a patience play.',
  ],
  moderate: [
    'At mid-tier values this card is neither a screaming buy nor an obvious sell. The hobby cycle is neutral for this segment right now, with supply and demand in rough balance. Maintaining your position while monitoring for a performance or scarcity catalyst is the prudent move. If a graded copy surfaces in the top pop, the calculus shifts quickly toward BUY.',
    'Mid-value cards in this range tend to drift sideways until a clear narrative emerges. The player\'s story is still developing, and the market reflects that uncertainty. Holding preserves the ability to capitalize on positive news while avoiding a premature exit. Watch for auction results over the next 60 days as a real-time signal.',
  ],
};

function buildReasoning(card: typeof sportsCards[0], rec: Rec, value: number, rng: () => number): string {
  const pool: string[] = [];

  if (rec === 'BUY') {
    if (card.rookie) pool.push(...buyReasons.rookie);
    if (value < 50) pool.push(...buyReasons.lowValue);
    if (card.year < 1980) pool.push(...buyReasons.vintage);
    if (pool.length === 0) pool.push(...buyReasons.lowValue);
  } else if (rec === 'SELL') {
    if (value > 500) pool.push(...sellReasons.highValue);
    pool.push(...sellReasons.veteran);
    if (pool.length === 0) pool.push(...sellReasons.highValue);
  } else {
    if (value >= 50 && value <= 500) pool.push(...holdReasons.moderate);
    pool.push(...holdReasons.stable);
  }

  return pool[Math.floor(rng() * pool.length)];
}

function generatePowerPlays(dateStr: string): PowerPlay[] {
  const seed = dateHash('cardvault-powerplays-' + dateStr);
  const rng = seededRng(seed);

  const sports = ['baseball', 'basketball', 'football', 'hockey'] as const;
  const result: PowerPlay[] = [];
  const usedSlugs = new Set<string>();

  // Sort each sport's cards deterministically and pick one per sport, then a 5th from any sport
  for (let pass = 0; pass < 2; pass++) {
    for (const sport of sports) {
      if (result.length >= 5) break;

      const sportCards = sportsCards
        .filter(c => c.sport === sport)
        .map(c => ({ card: c, val: parseValue(c.estimatedValueRaw) }))
        .filter(cv => cv.val > 0 && !usedSlugs.has(cv.card.slug));

      if (sportCards.length === 0) continue;

      // Date-seeded sort
      const sorted = [...sportCards].sort((a, b) => {
        const ha = dateHash(dateStr + '-' + a.card.slug);
        const hb = dateHash(dateStr + '-' + b.card.slug);
        return ha - hb;
      });

      const pick = sorted[Math.floor(rng() * Math.min(20, sorted.length))];
      usedSlugs.add(pick.card.slug);

      const val = pick.val;
      const isRookie = pick.card.rookie;
      const isVintage = pick.card.year < 1980;
      const isHighValue = val > 500;
      const isLowValue = val < 50;

      // Determine recommendation
      let rec: Rec;
      const roll = rng();
      if (isRookie && !isHighValue) {
        rec = roll < 0.70 ? 'BUY' : 'HOLD';
      } else if (isHighValue && !isRookie) {
        rec = roll < 0.55 ? 'SELL' : 'HOLD';
      } else if (isVintage) {
        rec = roll < 0.50 ? 'BUY' : roll < 0.75 ? 'HOLD' : 'SELL';
      } else if (isLowValue) {
        rec = roll < 0.55 ? 'BUY' : roll < 0.80 ? 'HOLD' : 'SELL';
      } else {
        rec = roll < 0.35 ? 'BUY' : roll < 0.65 ? 'HOLD' : 'SELL';
      }

      // Confidence (1–5)
      let confidence = Math.floor(rng() * 3) + 2; // base 2–4
      if (isRookie && rec === 'BUY') confidence = Math.min(5, confidence + 1);
      if (isHighValue && rec === 'SELL') confidence = Math.min(5, confidence + 1);
      if (isVintage) confidence = Math.min(5, confidence + 1);

      // Risk
      let risk: Risk;
      if (val < 30) risk = 'High';
      else if (val < 200) risk = 'Medium';
      else risk = isVintage ? 'Low' : 'Medium';

      // Time horizon
      const horizonRoll = rng();
      let horizon: Horizon;
      if (isRookie) {
        horizon = horizonRoll < 0.4 ? 'Short (1–3 months)' : horizonRoll < 0.75 ? 'Medium (3–12 months)' : 'Long (1+ year)';
      } else if (isVintage) {
        horizon = horizonRoll < 0.2 ? 'Short (1–3 months)' : horizonRoll < 0.5 ? 'Medium (3–12 months)' : 'Long (1+ year)';
      } else {
        horizon = horizonRoll < 0.35 ? 'Short (1–3 months)' : horizonRoll < 0.70 ? 'Medium (3–12 months)' : 'Long (1+ year)';
      }

      // Upside / downside
      const upsideBase = rec === 'BUY' ? 25 : rec === 'SELL' ? 8 : 15;
      const downsideBase = rec === 'SELL' ? 20 : rec === 'BUY' ? 8 : 10;
      const upside = Math.round((upsideBase + rng() * 30) * 10) / 10;
      const downside = Math.round((downsideBase + rng() * 15) * 10) / 10;

      const reasoning = buildReasoning(pick.card, rec, val, rng);

      result.push({
        card: pick.card,
        rec,
        confidence,
        risk,
        horizon,
        reasoning,
        upside,
        downside,
        currentValue: val,
      });
    }
  }

  return result.slice(0, 5);
}

function generateTrackRecord(dateStr: string): { date: string; correct: number; total: number; pct: number }[] {
  const rows: { date: string; correct: number; total: number; pct: number }[] = [];
  for (let i = 7; i >= 1; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    const seed = dateHash('track-record-' + ds + '-' + dateStr);
    const rng = seededRng(seed);
    const total = 5;
    const correct = Math.floor(rng() * 3) + 2; // 2–4
    rows.push({ date: ds, correct, total, pct: Math.round((correct / total) * 100) });
  }
  return rows;
}

/* ── sub-components ───────────────────────────────────────────────── */

const REC_CONFIG: Record<Rec, { label: string; bg: string; border: string; text: string; badge: string }> = {
  BUY:  { label: 'BUY',  bg: 'bg-emerald-950/60', border: 'border-emerald-700/50', text: 'text-emerald-400', badge: 'bg-emerald-500 text-white' },
  SELL: { label: 'SELL', bg: 'bg-red-950/60',     border: 'border-red-700/50',     text: 'text-red-400',     badge: 'bg-red-500 text-white' },
  HOLD: { label: 'HOLD', bg: 'bg-amber-950/60',   border: 'border-amber-700/50',   text: 'text-amber-400',   badge: 'bg-amber-500 text-white' },
};

const RISK_COLOR: Record<Risk, string> = {
  Low: 'text-emerald-400',
  Medium: 'text-amber-400',
  High: 'text-red-400',
};

const SPORT_ICON: Record<string, string> = {
  baseball: '⚾',
  basketball: '🏀',
  football: '🏈',
  hockey: '🏒',
};

function Stars({ n }: { n: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i <= n ? '#f59e0b' : 'none'} stroke="#f59e0b" strokeWidth="1.5">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  );
}

function PlayCard({ play, idx }: { play: PowerPlay; idx: number }) {
  const cfg = REC_CONFIG[play.rec];
  return (
    <div className={`rounded-xl border ${cfg.border} ${cfg.bg} p-5`}>
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-zinc-500 text-xs font-mono">#{idx + 1}</span>
            <span className="text-lg">{SPORT_ICON[play.card.sport] ?? '🃏'}</span>
            <span className="text-zinc-400 text-xs capitalize">{play.card.sport}</span>
          </div>
          <Link href={`/sports/${play.card.slug}`} className="text-white font-bold text-base hover:text-amber-400 transition-colors leading-snug block">
            {play.card.name}
          </Link>
          <p className="text-zinc-400 text-xs mt-0.5">{play.card.player} · {play.card.year} · {play.card.set.split(' ').slice(0, 3).join(' ')}</p>
        </div>
        <span className={`shrink-0 ${cfg.badge} text-xs font-black px-3 py-1.5 rounded-lg tracking-widest`}>
          {play.rec}
        </span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div>
          <p className="text-zinc-500 text-xs mb-1">Current Value</p>
          <p className="text-white font-semibold text-sm">{formatValue(play.currentValue)}</p>
        </div>
        <div>
          <p className="text-zinc-500 text-xs mb-1">Confidence</p>
          <Stars n={play.confidence} />
        </div>
        <div>
          <p className="text-zinc-500 text-xs mb-1">Risk Level</p>
          <p className={`font-semibold text-sm ${RISK_COLOR[play.risk]}`}>{play.risk}</p>
        </div>
        <div>
          <p className="text-zinc-500 text-xs mb-1">Time Horizon</p>
          <p className="text-zinc-300 text-xs font-medium leading-snug">{play.horizon}</p>
        </div>
      </div>

      {/* Upside/Downside */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
          <span className="text-emerald-400 text-xs font-bold">+{play.upside}% upside</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
          <span className="text-red-400 text-xs font-bold">-{play.downside}% downside</span>
        </div>
        {play.card.rookie && (
          <span className="text-xs bg-blue-900/50 border border-blue-700/50 text-blue-300 px-2 py-0.5 rounded-full font-medium">RC</span>
        )}
      </div>

      {/* Reasoning */}
      <div className="border-t border-zinc-800/60 pt-3">
        <p className="text-zinc-400 text-xs font-medium mb-1.5 uppercase tracking-wider">Reasoning</p>
        <p className="text-zinc-300 text-sm leading-relaxed">{play.reasoning}</p>
      </div>
    </div>
  );
}

/* ── main component ───────────────────────────────────────────────── */

export default function PowerPlaysClient() {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // Build 8-day window: today + past 7 days
  const dateWindow = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => dateLabel(-i));
  }, []);

  const plays = useMemo(() => generatePowerPlays(selectedDate), [selectedDate]);
  const trackRecord = useMemo(() => generateTrackRecord(todayStr), [todayStr]);

  // Weekly summary
  const summary = useMemo(() => {
    const buys = plays.filter(p => p.rec === 'BUY').length;
    const sells = plays.filter(p => p.rec === 'SELL').length;
    const holds = plays.filter(p => p.rec === 'HOLD').length;
    const avgConf = plays.reduce((s, p) => s + p.confidence, 0) / plays.length;
    const sportBreak = plays.reduce<Record<string, number>>((acc, p) => {
      acc[p.card.sport] = (acc[p.card.sport] ?? 0) + 1;
      return acc;
    }, {});
    return { buys, sells, holds, avgConf: Math.round(avgConf * 10) / 10, sportBreak };
  }, [plays]);

  const isToday = selectedDate === todayStr;

  return (
    <div className="space-y-8">
      {/* Date selector */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-white font-semibold text-sm">
            {isToday ? "Today's Power Plays" : `Power Plays — ${friendlyDate(selectedDate)}`}
          </p>
          <p className="text-zinc-500 text-xs">Past 7 Days Archive</p>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {dateWindow.map((d, i) => (
            <button
              key={d}
              onClick={() => setSelectedDate(d)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                selectedDate === d
                  ? 'bg-amber-500 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              {i === 0 ? 'Today' : friendlyDate(d)}
            </button>
          ))}
        </div>
      </div>

      {/* Weekly summary bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-emerald-950/50 border border-emerald-800/40 rounded-xl p-3 text-center">
          <p className="text-zinc-500 text-xs mb-1">BUY Picks</p>
          <p className="text-emerald-400 font-bold text-2xl">{summary.buys}</p>
        </div>
        <div className="bg-red-950/50 border border-red-800/40 rounded-xl p-3 text-center">
          <p className="text-zinc-500 text-xs mb-1">SELL Picks</p>
          <p className="text-red-400 font-bold text-2xl">{summary.sells}</p>
        </div>
        <div className="bg-amber-950/50 border border-amber-800/40 rounded-xl p-3 text-center">
          <p className="text-zinc-500 text-xs mb-1">HOLD Picks</p>
          <p className="text-amber-400 font-bold text-2xl">{summary.holds}</p>
        </div>
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 text-center">
          <p className="text-zinc-500 text-xs mb-1">Avg Confidence</p>
          <div className="flex justify-center mt-1">
            <Stars n={Math.round(summary.avgConf)} />
          </div>
        </div>
      </div>

      {/* Sport breakdown */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
        <p className="text-white font-semibold text-sm mb-3">Sport Breakdown</p>
        <div className="flex flex-wrap gap-3">
          {Object.entries(summary.sportBreak).map(([sport, count]) => (
            <div key={sport} className="flex items-center gap-1.5 bg-zinc-800/60 rounded-lg px-3 py-1.5">
              <span>{SPORT_ICON[sport] ?? '🃏'}</span>
              <span className="text-zinc-300 text-xs capitalize">{sport}</span>
              <span className="text-zinc-500 text-xs">×{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Power play cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">
          {isToday ? "Today's 5 Power Plays" : `Power Plays — ${friendlyDate(selectedDate)}`}
        </h2>
        {plays.map((play, i) => (
          <PlayCard key={play.card.slug} play={play} idx={i} />
        ))}
      </div>

      {/* Track Record */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
        <h2 className="text-lg font-bold text-white mb-4">Simulated Track Record (Last 7 Days)</h2>
        <div className="space-y-2">
          {trackRecord.map(row => (
            <div key={row.date} className="flex items-center gap-3">
              <span className="text-zinc-500 text-xs w-24 shrink-0">{friendlyDate(row.date)}</span>
              <div className="flex-1 bg-zinc-800 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${row.pct >= 70 ? 'bg-emerald-500' : row.pct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${row.pct}%` }}
                />
              </div>
              <span className={`text-xs font-bold w-16 text-right shrink-0 ${row.pct >= 70 ? 'text-emerald-400' : row.pct >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                {row.correct}/{row.total} ({row.pct}%)
              </span>
            </div>
          ))}
        </div>
        <p className="text-zinc-600 text-xs mt-4">
          Track record is simulated for illustrative purposes only. Past accuracy is not predictive of future results.
        </p>
      </div>

      {/* Disclaimer */}
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 text-center">
        <p className="text-zinc-500 text-xs leading-relaxed max-w-2xl mx-auto">
          <strong className="text-zinc-400">Disclaimer:</strong> Card Market Power Plays are generated for entertainment purposes only and do not constitute financial, investment, or trading advice. Sports card values are speculative and subject to significant volatility. Always conduct your own due diligence before making any buying or selling decisions.
        </p>
      </div>
    </div>
  );
}
