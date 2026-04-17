'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { sportsCards, type SportsCard } from '@/data/sports-cards';

const STATS_KEY = 'cv_card_race_stats_v1';
const DAILY_KEY = 'cv_card_race_daily_v1';
const FIELD_SIZE = 5;
const FURLONGS = 12;
const FURLONG_MS = 320;

type Stats = {
  plays: number;
  wins: number;      // correct Win pick
  trifectas: number; // all 3 correct in order
  bestScore: number;
  totalScore: number;
  dailyStreak: number;
  lastDaily: string;
};
const ZERO_STATS: Stats = { plays: 0, wins: 0, trifectas: 0, bestScore: 0, totalScore: 0, dailyStreak: 0, lastDaily: '' };

type Mode = 'daily' | 'free';
type Phase = 'picking' | 'running' | 'finished';
type Pick = 'win' | 'place' | 'show' | null;

const SPORT_COLORS: Record<SportsCard['sport'], string> = {
  baseball: 'bg-sky-500',
  basketball: 'bg-orange-500',
  football: 'bg-emerald-500',
  hockey: 'bg-cyan-500',
};

const SILKS_COLORS: string[] = [
  'bg-red-500',
  'bg-blue-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-pink-500',
];

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
function todayMinus(n: number): string {
  const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10);
}

function deterministicStep(cardSlug: string, furlong: number, seed: string): number {
  // Produce a step between 0.5 and 1.5 based on card+furlong+seed hash
  const h = fnv1a(`${seed}::${cardSlug}::${furlong}`);
  return 0.5 + (h % 1000) / 999;
}

export default function CardRaceClient() {
  const [mode, setMode] = useState<Mode>('daily');
  const [phase, setPhase] = useState<Phase>('picking');
  const [field, setField] = useState<SportsCard[]>([]);
  const [positions, setPositions] = useState<number[]>([]);
  const [currentFurlong, setCurrentFurlong] = useState(0);
  const [finishOrder, setFinishOrder] = useState<number[]>([]);
  const [winPick, setWinPick] = useState<number | null>(null);
  const [placePick, setPlacePick] = useState<number | null>(null);
  const [showPick, setShowPick] = useState<number | null>(null);
  const [stats, setStats] = useState<Stats>(ZERO_STATS);
  const [hydrated, setHydrated] = useState(false);
  const [dailyPlayed, setDailyPlayed] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const [lastScore, setLastScore] = useState(0);

  const seed = mode === 'daily' ? todaySeed() : `free-${Math.floor(Math.random() * 1e9)}`;
  const [activeSeed, setActiveSeed] = useState(seed);

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
    if (!hydrated) return;
    buildField(mode === 'daily' ? todaySeed() : `free-${Date.now()}`);
  }, [mode, hydrated]);

  function buildField(newSeed: string) {
    const rand = mulberry32(fnv1a(`race-field-${newSeed}`));
    const pool = sportsCards.filter((c) => parsePrice(c.estimatedValueRaw) > 25);
    const selected = shuffle(pool, rand).slice(0, FIELD_SIZE);
    setField(selected);
    setPositions(new Array(FIELD_SIZE).fill(0));
    setCurrentFurlong(0);
    setFinishOrder([]);
    setWinPick(null); setPlacePick(null); setShowPick(null);
    setPhase('picking');
    setActiveSeed(newSeed);
    setLastScore(0);
  }

  function selectPick(idx: number) {
    if (phase !== 'picking') return;
    // Cycle: not picked → win → place → show → not picked
    if (winPick === idx) { setWinPick(null); setPlacePick(idx); return; }
    if (placePick === idx) { setPlacePick(null); setShowPick(idx); return; }
    if (showPick === idx) { setShowPick(null); return; }
    // Assign to first empty slot
    if (winPick === null) { setWinPick(idx); return; }
    if (placePick === null) { setPlacePick(idx); return; }
    if (showPick === null) { setShowPick(idx); return; }
    // All three filled — replace win with this pick, rotate others down
    setShowPick(placePick); setPlacePick(winPick); setWinPick(idx);
  }

  function startRace() {
    if (mode === 'daily' && dailyPlayed) return;
    if (winPick === null || placePick === null || showPick === null) return;
    setPhase('running');
    let f = 0;
    intervalRef.current = window.setInterval(() => {
      f++;
      setCurrentFurlong(f);
      setPositions((prev) => prev.map((p, i) => p + deterministicStep(field[i].slug, f, activeSeed)));
      if (f >= FURLONGS) {
        if (intervalRef.current) window.clearInterval(intervalRef.current);
        finalize();
      }
    }, FURLONG_MS);
  }

  function finalize() {
    // Compute finish order by summing all furlong steps (deterministic)
    const totals = field.map((c) => {
      let s = 0;
      for (let f = 1; f <= FURLONGS; f++) s += deterministicStep(c.slug, f, activeSeed);
      return s;
    });
    const indexed = totals.map((t, i) => ({ idx: i, total: t }));
    indexed.sort((a, b) => b.total - a.total);
    const order = indexed.map((e) => e.idx);
    setFinishOrder(order);
    setPositions(totals);

    // Scoring
    let score = 0;
    if (winPick === order[0]) score += 10;
    if (placePick === order[1]) score += 5;
    if (showPick === order[2]) score += 3;
    const trifecta = winPick === order[0] && placePick === order[1] && showPick === order[2];
    if (trifecta) score += 50;

    setLastScore(score);
    setStats((s) => {
      const winCorrect = winPick === order[0];
      const today = todaySeed();
      const streakIncr = mode === 'daily' && winCorrect
        ? (s.lastDaily === todayMinus(1) ? s.dailyStreak + 1 : 1)
        : s.dailyStreak;
      return {
        plays: s.plays + 1,
        wins: s.wins + (winCorrect ? 1 : 0),
        trifectas: s.trifectas + (trifecta ? 1 : 0),
        bestScore: Math.max(s.bestScore, score),
        totalScore: s.totalScore + score,
        dailyStreak: mode === 'daily' ? streakIncr : s.dailyStreak,
        lastDaily: mode === 'daily' ? today : s.lastDaily,
      };
    });
    if (mode === 'daily') {
      try { localStorage.setItem(DAILY_KEY, todaySeed()); } catch {}
      setDailyPlayed(true);
    }
    setPhase('finished');
  }

  function playAgain() {
    if (mode === 'free') buildField(`free-${Date.now()}`);
  }

  const maxPos = useMemo(() => positions.length ? Math.max(...positions) : FURLONGS, [positions]);

  const leader = positions.length ? positions.indexOf(Math.max(...positions)) : -1;

  const gradeLetter = (() => {
    if (lastScore >= 60) return 'A';
    if (lastScore >= 40) return 'B';
    if (lastScore >= 20) return 'C';
    if (lastScore >= 10) return 'D';
    return 'F';
  })();

  function share() {
    if (phase !== 'finished') return;
    const lines: string[] = [];
    lines.push(`Card Race ${mode === 'daily' ? todaySeed() : ''} · ${lastScore} / 68 · Grade ${gradeLetter}`);
    const winCorrect = winPick === finishOrder[0];
    const placeCorrect = placePick === finishOrder[1];
    const showCorrect = showPick === finishOrder[2];
    const trifecta = winCorrect && placeCorrect && showCorrect;
    lines.push(`🥇 ${winCorrect ? '🟢' : '🔴'}   🥈 ${placeCorrect ? '🟢' : '🔴'}   🥉 ${showCorrect ? '🟢' : '🔴'}${trifecta ? '   ⭐ TRIFECTA' : ''}`);
    lines.push('');
    lines.push('cardvault-two.vercel.app/card-race');
    if (navigator?.clipboard) navigator.clipboard.writeText(lines.join('\n'));
  }

  if (!hydrated) {
    return <div className="rounded-2xl bg-slate-900/40 border border-slate-800 p-8 text-center text-gray-500 text-sm">Saddling up&hellip;</div>;
  }

  return (
    <div className="space-y-5">
      {/* Mode + Stats */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button onClick={() => setMode('daily')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${mode === 'daily' ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-gray-400 hover:text-white'}`}>Daily</button>
          <button onClick={() => setMode('free')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${mode === 'free' ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-gray-400 hover:text-white'}`}>Free-play</button>
          {mode === 'daily' && dailyPlayed && phase === 'picking' && (
            <span className="text-xs text-amber-300 self-center">Daily played — switch to free-play to keep racing.</span>
          )}
        </div>
        <div className="flex gap-3 text-xs text-gray-400">
          <span>Plays <span className="text-white font-semibold">{stats.plays}</span></span>
          <span>Win% <span className="text-cyan-300 font-semibold">{stats.plays ? ((stats.wins / stats.plays) * 100).toFixed(0) : 0}%</span></span>
          <span>Trifectas <span className="text-amber-300 font-semibold">{stats.trifectas}</span></span>
          <span>Best <span className="text-pink-300 font-semibold">{stats.bestScore}</span></span>
          <span>Streak <span className="text-emerald-300 font-semibold">{stats.dailyStreak}</span></span>
        </div>
      </div>

      {/* Race Track */}
      <div className="rounded-2xl border border-cyan-900/40 bg-gradient-to-br from-cyan-950/30 via-sky-950/20 to-slate-950 p-4 sm:p-6">
        <div className="mb-3 flex items-center justify-between text-xs">
          <span className="text-cyan-300 font-semibold">
            {phase === 'picking' ? 'Pick your Win / Place / Show' : phase === 'running' ? `Furlong ${currentFurlong} / ${FURLONGS}` : `Final results · Score ${lastScore} / 68 · Grade ${gradeLetter}`}
          </span>
          {phase === 'finished' && (
            <span className="text-amber-300 font-semibold">
              {winPick === finishOrder[0] && placePick === finishOrder[1] && showPick === finishOrder[2] ? '⭐ TRIFECTA' : ''}
            </span>
          )}
        </div>

        <div className="space-y-2">
          {field.map((c, i) => {
            const silks = SILKS_COLORS[i];
            const pickStatus = winPick === i ? 'WIN' : placePick === i ? 'PLACE' : showPick === i ? 'SHOW' : null;
            const finishPos = finishOrder.indexOf(i);
            const medal = finishPos === 0 ? '🥇' : finishPos === 1 ? '🥈' : finishPos === 2 ? '🥉' : '';
            const progress = phase === 'picking' ? 0 : Math.min(100, (positions[i] / (FURLONGS * 1.5)) * 100);
            const isLeader = phase === 'running' && leader === i;
            return (
              <button
                key={i}
                onClick={() => selectPick(i)}
                disabled={phase !== 'picking' || (mode === 'daily' && dailyPlayed)}
                className={`w-full rounded-lg p-2 sm:p-3 border flex items-center gap-3 transition-all ${
                  pickStatus ? 'border-cyan-400 bg-cyan-950/30' : 'border-slate-800 bg-slate-900/30 hover:border-slate-600'
                } ${phase !== 'picking' ? 'cursor-default' : 'cursor-pointer'}`}
              >
                {/* Silk + number */}
                <div className={`w-8 h-8 rounded ${silks} flex items-center justify-center text-white font-black text-sm shrink-0`}>
                  {i + 1}
                </div>
                {/* Card label */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="text-white text-sm font-semibold truncate">{c.player.split(' ').slice(-1)[0]}</div>
                  <div className="text-[10px] text-gray-500 truncate">{c.year} {c.set}</div>
                </div>
                {/* Pick badge / finish medal */}
                <div className="shrink-0 flex items-center gap-2">
                  {pickStatus && phase !== 'finished' && <span className="text-[10px] font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-700/50 px-1.5 py-0.5 rounded">{pickStatus}</span>}
                  {medal && <span className="text-xl">{medal}</span>}
                  <span className={`w-1.5 h-1.5 rounded-full ${SPORT_COLORS[c.sport]}`}></span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Track visualization */}
        {phase !== 'picking' && (
          <div className="mt-4 rounded-lg bg-slate-950/60 p-3 space-y-1.5">
            {field.map((c, i) => {
              const silks = SILKS_COLORS[i];
              const progress = Math.min(100, (positions[i] / (FURLONGS * 1.5)) * 100);
              return (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded ${silks} flex items-center justify-center text-white font-black text-[10px] shrink-0`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 h-3 rounded-full bg-slate-800 overflow-hidden relative">
                    <div className={`${silks} h-full transition-all`} style={{ width: `${progress}%` }}></div>
                    {phase === 'running' && progress > 5 && (
                      <div className="absolute top-1/2 -translate-y-1/2 text-[10px] font-bold text-white/80" style={{ left: `${Math.max(0, progress - 5)}%` }}>
                        🏇
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-500 w-12 text-right font-mono">{positions[i].toFixed(1)}f</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-4 flex flex-wrap gap-2">
          {phase === 'picking' && (
            <>
              <button
                onClick={startRace}
                disabled={winPick === null || placePick === null || showPick === null || (mode === 'daily' && dailyPlayed)}
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-white font-bold text-sm"
              >
                🏁 Start race
              </button>
              {(winPick !== null || placePick !== null || showPick !== null) && (
                <button onClick={() => { setWinPick(null); setPlacePick(null); setShowPick(null); }} className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-gray-200 font-medium text-sm">Clear picks</button>
              )}
              <div className="flex items-center text-xs text-gray-500">
                Tap a horse once for Win, twice for Place, three times for Show.
              </div>
            </>
          )}
          {phase === 'finished' && (
            <>
              <button onClick={share} className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-sm">Share result</button>
              {mode === 'free' && <button onClick={playAgain} className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold text-sm">Play again</button>}
              <div className="flex items-center text-xs text-gray-400 gap-4">
                <span>Win: <span className={winPick === finishOrder[0] ? 'text-emerald-300 font-semibold' : 'text-red-300 font-semibold'}>{winPick === finishOrder[0] ? '+10' : '0'}</span></span>
                <span>Place: <span className={placePick === finishOrder[1] ? 'text-emerald-300 font-semibold' : 'text-red-300 font-semibold'}>{placePick === finishOrder[1] ? '+5' : '0'}</span></span>
                <span>Show: <span className={showPick === finishOrder[2] ? 'text-emerald-300 font-semibold' : 'text-red-300 font-semibold'}>{showPick === finishOrder[2] ? '+3' : '0'}</span></span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
