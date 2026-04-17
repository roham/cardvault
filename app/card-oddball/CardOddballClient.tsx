'use client';

import { useEffect, useMemo, useState } from 'react';
import { sportsCards, type SportsCard } from '@/data/sports-cards';

const STATS_KEY = 'cv_card_oddball_stats_v1';
const DAILY_KEY = 'cv_card_oddball_daily_v1';
const PUZZLES_PER_ROUND = 5;
const FAST_MS = 5000;
const SLOW_MS = 10000;

type Stats = {
  plays: number;
  totalScore: number;
  bestScore: number;
  perfectDays: number;
  streak: number;
  lastDaily: string;
  gradeCounts: Record<string, number>;
};
const ZERO_STATS: Stats = { plays: 0, totalScore: 0, bestScore: 0, perfectDays: 0, streak: 0, lastDaily: '', gradeCounts: {} };

type Mode = 'daily' | 'free';
type Phase = 'playing' | 'revealed' | 'round-end';
type Category = 'sport' | 'decade' | 'rookie' | 'value';

type Puzzle = {
  cards: SportsCard[];      // 4 cards, position 0-3
  outlierIdx: number;       // which index is the outlier
  category: Category;
  majorityLabel: string;    // e.g. 'baseball', '1990s', 'Rookies', '$500-2K'
  outlierLabel: string;     // e.g. 'football', '1980s', 'Veteran', '$2K-10K'
};

type Result = {
  pickedIdx: number | null;
  correct: boolean;
  timeMs: number;
  score: number;
};

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
  const cleaned = (v || '').replace(/,/g, '');
  const m = cleaned.match(/\$([0-9]+(?:\.[0-9]+)?)/);
  return m ? parseFloat(m[1]) : 0;
}
function valueTier(price: number): string {
  if (price < 100) return '$0–100';
  if (price < 500) return '$100–500';
  if (price < 2000) return '$500–2K';
  if (price < 10000) return '$2K–10K';
  return '$10K+';
}
function decade(year: number): string {
  return `${Math.floor(year / 10) * 10}s`;
}
function todaySeed(): string { return new Date().toISOString().slice(0, 10); }
function dayBefore(dateIso: string): string {
  const d = new Date(dateIso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

function generatePuzzle(seed: string, puzzleIdx: number, pool: SportsCard[]): Puzzle | null {
  const rand = mulberry32(fnv1a(`${seed}::oddball::${puzzleIdx}`));
  const categoryOrder: Category[] = shuffle(['sport', 'decade', 'rookie', 'value'], rand);

  for (const category of categoryOrder) {
    // Bucket the pool by the category's discrete label
    const buckets = new Map<string, SportsCard[]>();
    for (const c of pool) {
      let label: string;
      switch (category) {
        case 'sport': label = c.sport; break;
        case 'decade': label = decade(c.year); break;
        case 'rookie': label = c.rookie ? 'Rookies' : 'Veterans'; break;
        case 'value': label = valueTier(parsePrice(c.estimatedValueRaw)); break;
      }
      const arr = buckets.get(label) || [];
      arr.push(c);
      buckets.set(label, arr);
    }

    // Find a majority bucket with >=3 cards, and a different bucket with >=1 card
    const bucketEntries = Array.from(buckets.entries()).filter(([, arr]) => arr.length >= 3);
    if (bucketEntries.length < 1) continue;
    // Shuffle then pick first that allows a distinct outlier bucket
    const shuffledBuckets = shuffle(bucketEntries, rand);
    for (const [majorityLabel, majorityPool] of shuffledBuckets) {
      const outlierEntries = Array.from(buckets.entries()).filter(([l, arr]) => l !== majorityLabel && arr.length >= 1);
      if (outlierEntries.length < 1) continue;
      const [outlierLabel, outlierPool] = shuffle(outlierEntries, rand)[0];

      // Pick 3 from majority + 1 from outlier, all distinct slugs
      const threeMajority = shuffle(majorityPool, rand).slice(0, 3);
      const oneOutlier = shuffle(outlierPool, rand)[0];
      if (!oneOutlier) continue;

      // Assemble and shuffle positions
      const positioned = shuffle([...threeMajority, oneOutlier], rand);
      const outlierIdx = positioned.findIndex(c => c.slug === oneOutlier.slug);
      if (outlierIdx < 0) continue;
      return { cards: positioned, outlierIdx, category, majorityLabel, outlierLabel };
    }
  }
  return null;
}

function generateRound(seed: string): Puzzle[] {
  // Quality filter: skip cards with no value or placeholder players
  const pool = sportsCards.filter(c => parsePrice(c.estimatedValueRaw) > 0);
  const puzzles: Puzzle[] = [];
  let attemptIdx = 0;
  while (puzzles.length < PUZZLES_PER_ROUND && attemptIdx < PUZZLES_PER_ROUND * 4) {
    const p = generatePuzzle(seed, attemptIdx, pool);
    if (p) {
      // Dedup: don't repeat a card across puzzles in the same round
      const usedSlugs = new Set(puzzles.flatMap(q => q.cards.map(c => c.slug)));
      const hasDup = p.cards.some(c => usedSlugs.has(c.slug));
      if (!hasDup) puzzles.push(p);
    }
    attemptIdx++;
  }
  return puzzles;
}

function computeScore(correct: boolean, timeMs: number): number {
  if (!correct) return 0;
  let score = 20;
  if (timeMs <= FAST_MS) score += 10;
  else if (timeMs <= SLOW_MS) score += 5;
  return score;
}
function gradeFor(total: number): string {
  if (total >= 135) return 'S';
  if (total >= 110) return 'A';
  if (total >= 85) return 'B';
  if (total >= 60) return 'C';
  if (total >= 30) return 'D';
  return 'F';
}
function categoryLabel(c: Category): string {
  switch (c) {
    case 'sport': return 'Sport';
    case 'decade': return 'Decade';
    case 'rookie': return 'Rookie status';
    case 'value': return 'Value tier';
  }
}
function categoryEmoji(c: Category): string {
  switch (c) {
    case 'sport': return '⚾';
    case 'decade': return '📅';
    case 'rookie': return '🌟';
    case 'value': return '💰';
  }
}
function resultEmoji(r: Result | null): string {
  if (!r || r.pickedIdx === null) return '⬜';
  if (!r.correct) return '🔴';
  if (r.timeMs <= FAST_MS) return '🟢';
  return '🟡';
}

export default function CardOddballClient() {
  const [mode, setMode] = useState<Mode>('daily');
  const [seed, setSeed] = useState<string>(todaySeed());
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [current, setCurrent] = useState<number>(0);
  const [phase, setPhase] = useState<Phase>('playing');
  const [results, setResults] = useState<Result[]>([]);
  const [startedAt, setStartedAt] = useState<number>(Date.now());
  const [stats, setStats] = useState<Stats>(ZERO_STATS);
  const [shareMsg, setShareMsg] = useState<string>('');
  const [locked, setLocked] = useState<boolean>(false); // Daily already played today?

  // Load stats + check daily lock
  useEffect(() => {
    try {
      const s = localStorage.getItem(STATS_KEY);
      if (s) setStats({ ...ZERO_STATS, ...JSON.parse(s) });
      const d = localStorage.getItem(DAILY_KEY);
      if (d) {
        const parsed = JSON.parse(d);
        if (parsed.date === todaySeed()) {
          setResults(parsed.results || []);
          setLocked(true);
          setPhase('round-end');
        }
      }
    } catch {}
  }, []);

  // Regenerate puzzles when mode/seed changes
  useEffect(() => {
    if (locked && mode === 'daily') return;
    const newSeed = mode === 'daily' ? todaySeed() : `free-${Math.random().toString(36).slice(2)}-${Date.now()}`;
    setSeed(newSeed);
    setPuzzles(generateRound(newSeed));
    setCurrent(0);
    setResults([]);
    setPhase('playing');
    setStartedAt(Date.now());
    setShareMsg('');
  }, [mode, locked]);

  const puzzle = puzzles[current];

  function handlePick(idx: number) {
    if (!puzzle || phase !== 'playing') return;
    const timeMs = Date.now() - startedAt;
    const correct = idx === puzzle.outlierIdx;
    const score = computeScore(correct, timeMs);
    const r: Result = { pickedIdx: idx, correct, timeMs, score };
    setResults(prev => [...prev, r]);
    setPhase('revealed');
  }

  function handleSkip() {
    if (phase !== 'playing') return;
    const r: Result = { pickedIdx: null, correct: false, timeMs: Date.now() - startedAt, score: 0 };
    setResults(prev => [...prev, r]);
    setPhase('revealed');
  }

  function handleNext() {
    if (current + 1 >= puzzles.length) {
      finishRound();
    } else {
      setCurrent(c => c + 1);
      setPhase('playing');
      setStartedAt(Date.now());
    }
  }

  function finishRound() {
    setPhase('round-end');
    const totalScore = results.reduce((s, r) => s + r.score, 0);
    const grade = gradeFor(totalScore);

    if (mode === 'daily' && !locked) {
      // Save daily result
      try {
        localStorage.setItem(DAILY_KEY, JSON.stringify({
          date: seed,
          results,
          score: totalScore,
          grade,
        }));
      } catch {}

      // Update stats
      const correctCount = results.filter(r => r.correct).length;
      const newStats: Stats = {
        ...stats,
        plays: stats.plays + 1,
        totalScore: stats.totalScore + totalScore,
        bestScore: Math.max(stats.bestScore, totalScore),
        perfectDays: stats.perfectDays + (correctCount === PUZZLES_PER_ROUND ? 1 : 0),
        streak: stats.lastDaily === dayBefore(seed) || stats.plays === 0 ? stats.streak + 1 : 1,
        lastDaily: seed,
        gradeCounts: { ...stats.gradeCounts, [grade]: (stats.gradeCounts[grade] || 0) + 1 },
      };
      setStats(newStats);
      try { localStorage.setItem(STATS_KEY, JSON.stringify(newStats)); } catch {}
      setLocked(true);
    }
  }

  function handleReset() {
    setMode('free');
    setLocked(false);
  }

  async function handleShare() {
    const totalScore = results.reduce((s, r) => s + r.score, 0);
    const grade = gradeFor(totalScore);
    const emojis = results.map(r => resultEmoji(r)).join('');
    const date = seed;
    const text = `Card Oddball ${date} · ${totalScore} / 150 · Grade ${grade}\n${emojis}\nhttps://cardvault-two.vercel.app/card-oddball`;
    try {
      if (navigator.share) {
        await navigator.share({ text, title: 'Card Oddball' });
        setShareMsg('Shared!');
      } else {
        await navigator.clipboard.writeText(text);
        setShareMsg('Copied to clipboard!');
      }
    } catch {
      setShareMsg('Copy failed — try again');
    }
    setTimeout(() => setShareMsg(''), 2500);
  }

  const totalScore = results.reduce((s, r) => s + r.score, 0);
  const grade = gradeFor(totalScore);
  const lastResult = results[results.length - 1];

  if (puzzles.length === 0) {
    return <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center text-slate-400">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Mode toggle */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="inline-flex bg-slate-900 border border-slate-800 rounded-lg p-1">
          <button
            onClick={() => setMode('daily')}
            disabled={locked && mode === 'free'}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition ${mode === 'daily' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Daily {locked ? '(done)' : ''}
          </button>
          <button
            onClick={() => setMode('free')}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition ${mode === 'free' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Free play
          </button>
        </div>
        {mode === 'daily' && (
          <div className="text-xs text-slate-400 bg-slate-900/60 border border-slate-800 rounded-md px-3 py-1.5">
            {seed} · streak: {stats.streak} 🔥 · best: {stats.bestScore}
          </div>
        )}
        {mode === 'free' && phase !== 'round-end' && (
          <button
            onClick={() => { setPuzzles(generateRound(`free-${Math.random().toString(36).slice(2)}-${Date.now()}`)); setCurrent(0); setResults([]); setPhase('playing'); setStartedAt(Date.now()); }}
            className="text-xs text-amber-300 bg-amber-950/40 border border-amber-800/50 rounded-md px-3 py-1.5 hover:bg-amber-900/40"
          >
            ↻ New round
          </button>
        )}
      </div>

      {/* Progress strip */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span>Puzzle {Math.min(current + 1, puzzles.length)} / {puzzles.length}</span>
          <span className="font-mono">Score: {totalScore} / {puzzles.length * 30}</span>
        </div>
        <div className="flex gap-1.5">
          {puzzles.map((_, i) => {
            const r = results[i];
            const bg = r ? (r.correct ? (r.timeMs <= FAST_MS ? 'bg-emerald-500' : 'bg-yellow-500') : 'bg-red-500') : i === current ? 'bg-amber-500' : 'bg-slate-700';
            return <div key={i} className={`flex-1 h-2 rounded ${bg}`} />;
          })}
        </div>
      </div>

      {/* Round end */}
      {phase === 'round-end' && (
        <div className="bg-gradient-to-br from-amber-950/60 to-amber-900/30 border border-amber-700/50 rounded-xl p-6">
          <div className="text-center">
            <div className="text-sm uppercase tracking-wider text-amber-300 mb-2">Round complete</div>
            <div className="text-5xl font-bold text-white mb-1">{totalScore} <span className="text-2xl text-amber-300">/ 150</span></div>
            <div className="text-3xl font-bold text-amber-300 mb-4">Grade: {grade}</div>
            <div className="flex justify-center gap-1 text-3xl mb-6">{results.map((r, i) => <span key={i}>{resultEmoji(r)}</span>)}</div>
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={handleShare}
                className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-5 py-2 rounded-lg transition"
              >
                Share result
              </button>
              <button
                onClick={handleReset}
                className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-5 py-2 rounded-lg transition"
              >
                {locked ? 'Play free rounds' : 'Play again (free)'}
              </button>
            </div>
            {shareMsg && <div className="mt-3 text-xs text-emerald-300">{shareMsg}</div>}
          </div>

          {/* Per-puzzle recap */}
          <div className="mt-6 space-y-2">
            {puzzles.map((p, i) => {
              const r = results[i];
              if (!r) return null;
              return (
                <div key={i} className="flex items-center justify-between bg-slate-900/60 border border-slate-800 rounded-md px-3 py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{resultEmoji(r)}</span>
                    <span className="text-slate-400">Puzzle {i + 1}</span>
                    <span className="text-slate-500 text-xs">{categoryEmoji(p.category)} {categoryLabel(p.category)}</span>
                  </div>
                  <div className="text-slate-300">
                    <span className="text-xs text-slate-500 mr-2">majority: {p.majorityLabel} · outlier: {p.outlierLabel}</span>
                    <span className="font-mono text-amber-300">+{r.score}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Game board */}
      {phase !== 'round-end' && puzzle && (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-xs uppercase tracking-wider text-slate-400 mb-1">Find the card that does NOT fit</div>
            <div className="text-lg text-white font-semibold">Three share a trait. One does not.</div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {puzzle.cards.map((c, idx) => {
              const isPicked = lastResult?.pickedIdx === idx && phase === 'revealed';
              const isOutlier = idx === puzzle.outlierIdx;
              const reveal = phase === 'revealed';
              const correctPick = reveal && isOutlier;
              const wrongPick = reveal && isPicked && !isOutlier;
              return (
                <button
                  key={c.slug}
                  onClick={() => handlePick(idx)}
                  disabled={phase !== 'playing'}
                  className={`relative text-left rounded-lg border-2 p-3 transition overflow-hidden ${
                    correctPick ? 'bg-emerald-950/60 border-emerald-500' :
                    wrongPick ? 'bg-red-950/60 border-red-500' :
                    reveal ? 'bg-slate-900/40 border-slate-800 opacity-60' :
                    'bg-slate-900/60 border-slate-700 hover:border-amber-500 hover:bg-slate-800/60 cursor-pointer'
                  }`}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <span className="inline-block w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-center text-xs font-bold text-slate-300 leading-6">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    {reveal && isOutlier && <span className="ml-auto text-xs font-bold text-emerald-400">✓ OUTLIER</span>}
                    {reveal && !isOutlier && <span className="ml-auto text-xs text-slate-500">in group</span>}
                  </div>
                  <div className="font-semibold text-white text-sm line-clamp-2 mb-1">{c.player}</div>
                  <div className="text-xs text-slate-400 mb-1">{c.year} {c.set.replace(`${c.year} `, '')}</div>
                  <div className="flex flex-wrap gap-1 text-xs">
                    <span className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">#{c.cardNumber}</span>
                    <span className={`px-1.5 py-0.5 rounded text-white ${
                      c.sport === 'baseball' ? 'bg-sky-700' :
                      c.sport === 'basketball' ? 'bg-orange-700' :
                      c.sport === 'football' ? 'bg-emerald-700' : 'bg-cyan-700'
                    }`}>{c.sport}</span>
                    {c.rookie && <span className="bg-amber-700 text-white px-1.5 py-0.5 rounded">RC</span>}
                  </div>
                  <div className="text-xs text-slate-500 mt-1.5 truncate">{c.estimatedValueRaw}</div>
                </button>
              );
            })}
          </div>

          {phase === 'playing' && (
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleSkip}
                className="text-sm text-slate-400 hover:text-white border border-slate-700 rounded-md px-4 py-2 transition"
              >
                Skip (0 pts)
              </button>
            </div>
          )}

          {phase === 'revealed' && lastResult && (
            <div className={`rounded-xl p-5 text-center border ${lastResult.correct ? 'bg-emerald-950/40 border-emerald-700/50' : 'bg-red-950/30 border-red-800/50'}`}>
              <div className={`text-xl font-bold mb-2 ${lastResult.correct ? 'text-emerald-300' : 'text-red-300'}`}>
                {lastResult.correct ? `✓ Correct! +${lastResult.score} pts` : '✗ Wrong'}
              </div>
              <div className="text-sm text-slate-300 mb-1">
                Category: <span className="font-semibold text-white">{categoryEmoji(puzzle.category)} {categoryLabel(puzzle.category)}</span>
              </div>
              <div className="text-sm text-slate-400">
                Three cards were <span className="text-white font-semibold">{puzzle.majorityLabel}</span>.
                The outlier ({String.fromCharCode(65 + puzzle.outlierIdx)}) was <span className="text-white font-semibold">{puzzle.outlierLabel}</span>.
              </div>
              {lastResult.correct && (
                <div className="text-xs text-slate-500 mt-2">
                  Time: {(lastResult.timeMs / 1000).toFixed(1)}s ·
                  {lastResult.timeMs <= FAST_MS ? ' Fast bonus +10' : lastResult.timeMs <= SLOW_MS ? ' Slow bonus +5' : ' No time bonus'}
                </div>
              )}
              <button
                onClick={handleNext}
                className="mt-4 bg-amber-600 hover:bg-amber-500 text-white font-semibold px-6 py-2.5 rounded-lg transition"
              >
                {current + 1 >= puzzles.length ? 'Finish round →' : 'Next puzzle →'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Stats footer */}
      {mode === 'daily' && stats.plays > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
          <div className="text-xs uppercase tracking-wider text-slate-400 mb-2">Your stats</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div>
              <div className="text-2xl font-bold text-white">{stats.plays}</div>
              <div className="text-xs text-slate-500">Plays</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stats.bestScore}</div>
              <div className="text-xs text-slate-500">Best</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stats.perfectDays}</div>
              <div className="text-xs text-slate-500">Perfect</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stats.streak} 🔥</div>
              <div className="text-xs text-slate-500">Streak</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
