'use client';

import { useEffect, useMemo, useState } from 'react';
import { sportsCards, type SportsCard } from '@/data/sports-cards';

const STATS_KEY = 'cv_card_keno_stats_v1';
const DAILY_KEY = 'cv_card_keno_daily_v1';
const GRID_SIZE = 40;
const DRAW_COUNT = 10;
const MAX_PICKS = 8;
const BET_PER_PICK = 10;

type Stats = {
  plays: number;
  totalDust: number;
  bestRound: number;
  dailyStreak: number;
  lastDaily: string;
  topHit: number;
};

const ZERO_STATS: Stats = { plays: 0, totalDust: 0, bestRound: 0, dailyStreak: 0, lastDaily: '', topHit: 0 };

type Phase = 'picking' | 'drawing' | 'revealed';
type Mode = 'daily' | 'free';

function fnv1a(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return h >>> 0;
}
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function parsePrice(v: string): number {
  const cleaned = v.replace(/,/g, '');
  const m = cleaned.match(/\$([0-9]+(?:\.[0-9]+)?)/);
  return m ? parseFloat(m[1]) : 0;
}
function todaySeed(): string { return new Date().toISOString().slice(0, 10); }

// Pay table: rows = picks (1..8), cols = hits (0..picks)
// Keno-style — tuned for ~95% expected return per dollar bet at each pick count.
const PAY_TABLE: Record<number, number[]> = {
  1: [0, 3],
  2: [0, 1, 15],
  3: [0, 0, 2, 50],
  4: [0, 0, 1, 10, 125],
  5: [0, 0, 0, 3, 25, 300],
  6: [0, 0, 0, 2, 10, 75, 800],
  7: [0, 0, 0, 1, 3, 20, 175, 2000],
  8: [0, 0, 0, 0, 2, 15, 80, 450, 5000],
};

const SPORT_META: Record<SportsCard['sport'], { label: string; color: string }> = {
  baseball: { label: 'MLB', color: 'text-sky-300' },
  basketball: { label: 'NBA', color: 'text-orange-300' },
  football: { label: 'NFL', color: 'text-emerald-300' },
  hockey: { label: 'NHL', color: 'text-cyan-300' },
};

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return Math.round(n).toLocaleString('en-US');
}

export default function CardKenoClient() {
  const [mode, setMode] = useState<Mode>('daily');
  const [phase, setPhase] = useState<Phase>('picking');
  const [grid, setGrid] = useState<SportsCard[]>([]);
  const [picks, setPicks] = useState<Set<number>>(new Set());
  const [drawn, setDrawn] = useState<Set<number>>(new Set());
  const [revealed, setRevealed] = useState<number[]>([]);
  const [stats, setStats] = useState<Stats>(ZERO_STATS);
  const [hydrated, setHydrated] = useState(false);
  const [dailyPlayed, setDailyPlayed] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STATS_KEY);
      if (raw) setStats({ ...ZERO_STATS, ...JSON.parse(raw) });
      const d = localStorage.getItem(DAILY_KEY);
      if (d === todaySeed()) setDailyPlayed(true);
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(STATS_KEY, JSON.stringify(stats)); } catch {}
  }, [stats, hydrated]);

  useEffect(() => {
    // Rebuild grid when mode changes or new round starts
    if (!hydrated) return;
    const seed = mode === 'daily' ? fnv1a('keno-' + todaySeed()) : Math.floor(Math.random() * 2 ** 31);
    const rand = mulberry32(seed);
    const pool = sportsCards.filter((c) => parsePrice(c.estimatedValueRaw) > 0);
    const g = shuffle(pool, rand).slice(0, GRID_SIZE);
    setGrid(g);
    setPicks(new Set());
    setDrawn(new Set());
    setRevealed([]);
    setPhase('picking');
  }, [mode, hydrated]);

  function togglePick(i: number) {
    if (phase !== 'picking') return;
    setPicks((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else if (next.size < MAX_PICKS) next.add(i);
      return next;
    });
  }

  function roll() {
    if (phase !== 'picking' || picks.size === 0) return;
    if (mode === 'daily' && dailyPlayed) return;
    const seed = mode === 'daily'
      ? fnv1a('keno-draw-' + todaySeed())
      : Math.floor(Math.random() * 2 ** 31);
    const rand = mulberry32(seed);
    const indices = Array.from({ length: GRID_SIZE }, (_, i) => i);
    const drawnList = shuffle(indices, rand).slice(0, DRAW_COUNT);
    setDrawn(new Set(drawnList));
    setPhase('drawing');
    // reveal one at a time
    drawnList.forEach((idx, k) => {
      setTimeout(() => {
        setRevealed((prev) => [...prev, idx]);
        if (k === drawnList.length - 1) {
          setTimeout(() => { setPhase('revealed'); finalize(drawnList); }, 350);
        }
      }, 250 + k * 260);
    });
  }

  function finalize(drawnList: number[]) {
    const drawnSet = new Set(drawnList);
    const hits = Array.from(picks).filter((p) => drawnSet.has(p)).length;
    const picksCount = picks.size;
    const pay = PAY_TABLE[picksCount]?.[hits] ?? 0;
    const bet = picksCount * BET_PER_PICK;
    const payout = pay * BET_PER_PICK;
    const net = payout - bet;
    setStats((s) => {
      const today = todaySeed();
      const streakIncr = mode === 'daily' && net > 0
        ? (s.lastDaily === todayMinus(1) ? s.dailyStreak + 1 : 1)
        : s.dailyStreak;
      return {
        plays: s.plays + 1,
        totalDust: s.totalDust + net,
        bestRound: Math.max(s.bestRound, net),
        dailyStreak: mode === 'daily' ? streakIncr : s.dailyStreak,
        lastDaily: mode === 'daily' ? today : s.lastDaily,
        topHit: Math.max(s.topHit, hits),
      };
    });
    if (mode === 'daily') {
      try { localStorage.setItem(DAILY_KEY, todaySeed()); } catch {}
      setDailyPlayed(true);
    }
  }

  function resetRound() {
    setPhase('picking');
    setPicks(new Set());
    setDrawn(new Set());
    setRevealed([]);
    // regenerate grid for free-play
    if (mode === 'free') {
      const rand = mulberry32(Math.floor(Math.random() * 2 ** 31));
      const pool = sportsCards.filter((c) => parsePrice(c.estimatedValueRaw) > 0);
      setGrid(shuffle(pool, rand).slice(0, GRID_SIZE));
    }
  }

  const hits = useMemo(() => Array.from(picks).filter((p) => drawn.has(p)).length, [picks, drawn]);
  const picksCount = picks.size;
  const currentPay = PAY_TABLE[picksCount]?.[hits] ?? 0;
  const betAmount = picksCount * BET_PER_PICK;
  const payoutAmount = currentPay * BET_PER_PICK;
  const netAmount = payoutAmount - betAmount;
  const hitRate = picksCount > 0 ? ((hits / picksCount) * 100).toFixed(0) : '0';

  function share() {
    const squares = Array.from({ length: GRID_SIZE }, (_, i) => {
      const isPick = picks.has(i);
      const isDrawn = drawn.has(i);
      if (isPick && isDrawn) return '🟢';
      if (isPick) return '🔴';
      if (isDrawn) return '🟡';
      return '⚪';
    });
    const rows: string[] = [];
    for (let r = 0; r < 4; r++) rows.push(squares.slice(r * 10, r * 10 + 10).join(''));
    const tier = netAmount >= 1000 ? '🏆 GRAIL' : netAmount >= 200 ? '💎 GEM' : netAmount >= 50 ? '⭐ HIT' : netAmount > 0 ? '✅ WIN' : '❌ MISS';
    const text = `Card Keno ${mode === 'daily' ? todaySeed() : ''}\n${picksCount} spots · ${hits}/${picksCount} hits · ${netAmount >= 0 ? '+' : ''}${fmt(netAmount)} dust\n${tier}\n\n${rows.join('\n')}\n\ncardvault-two.vercel.app/card-keno`;
    if (navigator?.clipboard) navigator.clipboard.writeText(text);
  }

  if (!hydrated) {
    return <div className="rounded-2xl bg-slate-900/40 border border-slate-800 p-8 text-center text-gray-500 text-sm">Loading grid&hellip;</div>;
  }

  return (
    <div className="space-y-6">
      {/* Mode + Stats bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button onClick={() => setMode('daily')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${mode === 'daily' ? 'bg-pink-500 text-white' : 'bg-slate-800 text-gray-400 hover:text-white'}`}>Daily</button>
          <button onClick={() => setMode('free')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${mode === 'free' ? 'bg-pink-500 text-white' : 'bg-slate-800 text-gray-400 hover:text-white'}`}>Free-play</button>
          {mode === 'daily' && dailyPlayed && phase !== 'revealed' && (
            <span className="text-xs text-amber-300">Daily already played. Switch to free-play.</span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span>Plays <span className="text-white font-semibold">{stats.plays}</span></span>
          <span>Lifetime <span className={`font-semibold ${stats.totalDust >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>{stats.totalDust >= 0 ? '+' : ''}{fmt(stats.totalDust)}</span></span>
          <span>Best round <span className="text-pink-300 font-semibold">{fmt(stats.bestRound)}</span></span>
          <span>Streak <span className="text-amber-300 font-semibold">{stats.dailyStreak}</span></span>
        </div>
      </div>

      {/* Grid */}
      <div className="rounded-2xl border border-pink-900/40 bg-gradient-to-br from-pink-950/30 via-rose-950/20 to-fuchsia-950/20 p-4 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="text-gray-400">
            Picks: <span className="text-pink-300 font-semibold">{picksCount}</span> / {MAX_PICKS}
            {phase !== 'picking' && <> &middot; Drawn: <span className="text-amber-300 font-semibold">{revealed.length}</span> / {DRAW_COUNT}</>}
            {phase === 'revealed' && <> &middot; Hits: <span className={hits > 0 ? 'text-emerald-300 font-semibold' : 'text-red-300 font-semibold'}>{hits}</span> ({hitRate}%)</>}
          </div>
          <div className="text-gray-400">
            Bet: <span className="text-white font-semibold">{fmt(betAmount)}</span> dust
            {phase === 'revealed' && <> &middot; Payout: <span className="text-pink-300 font-semibold">{fmt(payoutAmount)}</span> &middot; Net: <span className={netAmount >= 0 ? 'text-emerald-300 font-semibold' : 'text-red-300 font-semibold'}>{netAmount >= 0 ? '+' : ''}{fmt(netAmount)}</span></>}
          </div>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
          {grid.map((c, i) => {
            const picked = picks.has(i);
            const isRevealed = revealed.includes(i);
            const hit = picked && drawn.has(i) && isRevealed;
            const drawnOnly = drawn.has(i) && !picked && isRevealed;
            const meta = SPORT_META[c.sport];
            let cls = 'bg-slate-900/60 border-slate-700/60 hover:border-pink-500/50 text-gray-200';
            if (picked && phase === 'picking') cls = 'bg-pink-500/20 border-pink-400 text-white ring-2 ring-pink-400/40';
            if (hit) cls = 'bg-emerald-500/30 border-emerald-400 text-white ring-2 ring-emerald-400';
            if (drawnOnly) cls = 'bg-amber-500/20 border-amber-500/60 text-amber-100';
            if (picked && phase === 'revealed' && !hit) cls = 'bg-red-500/20 border-red-400 text-red-100';
            return (
              <button
                key={i}
                onClick={() => togglePick(i)}
                disabled={phase !== 'picking' || (mode === 'daily' && dailyPlayed)}
                title={`${c.name} — ${c.player} (${c.year})`}
                className={`relative aspect-[3/4] rounded-md border p-1 text-[9px] leading-tight text-left transition-all disabled:cursor-not-allowed ${cls}`}
              >
                <div className={`absolute top-0.5 right-0.5 text-[8px] font-mono uppercase ${meta.color}`}>{meta.label}</div>
                <div className="font-semibold truncate text-[10px]">{c.player.split(' ').slice(-1)[0]}</div>
                <div className="truncate opacity-70 mt-1">{c.year}</div>
                <div className="absolute bottom-0.5 right-0.5 text-[10px]">
                  {hit && '🟢'}
                  {drawnOnly && '🟡'}
                  {picked && phase === 'revealed' && !hit && '🔴'}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {phase === 'picking' && (
            <button
              onClick={roll}
              disabled={picksCount === 0 || (mode === 'daily' && dailyPlayed)}
              className="px-4 py-2 rounded-lg bg-pink-500 hover:bg-pink-400 disabled:opacity-40 text-white font-bold text-sm"
            >
              Draw 10 cards ({fmt(betAmount)} dust bet)
            </button>
          )}
          {phase === 'revealed' && (
            <>
              <button onClick={share} className="px-4 py-2 rounded-lg bg-pink-500 hover:bg-pink-400 text-white font-bold text-sm">Share result</button>
              {mode === 'free' && (
                <button onClick={resetRound} className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold text-sm">Play again</button>
              )}
            </>
          )}
          {phase === 'picking' && picksCount > 0 && (
            <button onClick={() => setPicks(new Set())} className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-gray-200 font-medium text-sm">Clear picks</button>
          )}
        </div>
      </div>

      {/* Pay table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 overflow-x-auto">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-pink-300 mb-3">Pay table (dust per 10-dust bet)</h3>
        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-500">
              <th className="text-left p-1">Picks</th>
              {Array.from({ length: 9 }, (_, h) => <th key={h} className="p-1 text-center">{h} hit{h === 1 ? '' : 's'}</th>)}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((p) => (
              <tr key={p} className={`border-t border-slate-800 ${picksCount === p ? 'bg-pink-950/30' : ''}`}>
                <td className="p-1 text-pink-200 font-semibold">{p}</td>
                {Array.from({ length: 9 }, (_, h) => {
                  const v = PAY_TABLE[p][h];
                  if (v === undefined) return <td key={h} className="p-1 text-center text-gray-700">&mdash;</td>;
                  const current = phase === 'revealed' && picksCount === p && hits === h;
                  return (
                    <td key={h} className={`p-1 text-center ${current ? 'text-emerald-300 font-black' : v > 0 ? 'text-gray-200' : 'text-gray-600'}`}>
                      {v > 0 ? fmt(v * BET_PER_PICK) : '0'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-[11px] text-gray-500">Bet = picks &times; {BET_PER_PICK} dust. Payout = pay-table value &times; {BET_PER_PICK}. Expected return ~95% across all pick counts; variance scales with pick count.</p>
      </div>
    </div>
  );
}

function todayMinus(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}
