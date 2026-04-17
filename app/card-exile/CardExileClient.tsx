'use client';

import { useEffect, useMemo, useState } from 'react';
import { sportsCards, type SportsCard } from '@/data/sports-cards';

const STATS_KEY = 'cv_card_exile_stats_v1';
const DAILY_KEY = 'cv_card_exile_daily_v1';
const PUZZLES_PER_ROUND = 5;
const CARDS_PER_PUZZLE = 4;
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

type RuleType = 'older-than' | 'newer-than' | 'exile-sport' | 'exile-rookies' | 'exile-veterans' | 'exile-under-value' | 'exile-over-value';

type Rule = {
  type: RuleType;
  param: string | number;
  label: string;
  predicate: (c: SportsCard) => boolean;
};

type Puzzle = {
  cards: SportsCard[];       // 4 cards
  exileIdx: number;          // which card violates the rule
  rule: Rule;
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
function todaySeed(): string { return new Date().toISOString().slice(0, 10); }
function dayBefore(dateIso: string): string {
  const d = new Date(dateIso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

const RULE_TEMPLATES: Array<(rand: () => number) => Rule | null> = [
  // Older than
  (rand) => {
    const yr = [1980, 1990, 2000, 2010][Math.floor(rand() * 4)];
    return { type: 'older-than', param: yr, label: `Exile any card from BEFORE ${yr}`, predicate: c => c.year < yr };
  },
  // Newer than
  (rand) => {
    const yr = [1980, 1990, 2000, 2010, 2020][Math.floor(rand() * 5)];
    return { type: 'newer-than', param: yr, label: `Exile any card from AFTER ${yr}`, predicate: c => c.year > yr };
  },
  // Exile sport
  (rand) => {
    const sport = (['baseball', 'basketball', 'football', 'hockey'] as const)[Math.floor(rand() * 4)];
    return { type: 'exile-sport', param: sport, label: `Exile all ${sport} cards`, predicate: c => c.sport === sport };
  },
  // Exile rookies
  () => ({ type: 'exile-rookies', param: 'true', label: 'Exile all rookie cards', predicate: c => c.rookie }),
  // Exile veterans
  () => ({ type: 'exile-veterans', param: 'false', label: 'Exile all veteran (non-rookie) cards', predicate: c => !c.rookie }),
  // Exile under value
  (rand) => {
    const threshold = [100, 500, 1000][Math.floor(rand() * 3)];
    return { type: 'exile-under-value', param: threshold, label: `Exile any card worth UNDER $${threshold}`, predicate: c => parsePrice(c.estimatedValueRaw) < threshold };
  },
  // Exile over value
  (rand) => {
    const threshold = [1000, 5000, 10000][Math.floor(rand() * 3)];
    return { type: 'exile-over-value', param: threshold, label: `Exile any card worth OVER $${threshold}`, predicate: c => parsePrice(c.estimatedValueRaw) > threshold };
  },
];

function generatePuzzle(seed: string, puzzleIdx: number, pool: SportsCard[]): Puzzle | null {
  const rand = mulberry32(fnv1a(`${seed}::exile::${puzzleIdx}`));
  // Shuffle rule templates
  const tmplOrder = shuffle(RULE_TEMPLATES, rand);

  for (const tmpl of tmplOrder) {
    const rule = tmpl(rand);
    if (!rule) continue;
    // Find violators and non-violators
    const violators = pool.filter(c => rule.predicate(c));
    const nonViolators = pool.filter(c => !rule.predicate(c));
    if (violators.length < 1 || nonViolators.length < 3) continue;
    // Pick 1 violator + 3 non-violators
    const exile = shuffle(violators, rand)[0];
    const clean = shuffle(nonViolators, rand).slice(0, 3);
    if (clean.length < 3) continue;
    // Assemble and shuffle
    const positioned = shuffle([exile, ...clean], rand);
    const exileIdx = positioned.findIndex(c => c.slug === exile.slug);
    if (exileIdx < 0) continue;
    return { cards: positioned, exileIdx, rule };
  }
  return null;
}

function generateRound(seed: string): Puzzle[] {
  const pool = sportsCards.filter(c => parsePrice(c.estimatedValueRaw) > 0);
  const puzzles: Puzzle[] = [];
  let attemptIdx = 0;
  while (puzzles.length < PUZZLES_PER_ROUND && attemptIdx < PUZZLES_PER_ROUND * 4) {
    const p = generatePuzzle(seed, attemptIdx, pool);
    if (p) {
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
  let score = 15;
  if (timeMs <= FAST_MS) score += 10;
  else if (timeMs <= SLOW_MS) score += 5;
  return score;
}
function gradeFor(total: number): string {
  if (total >= 115) return 'S';
  if (total >= 95) return 'A';
  if (total >= 75) return 'B';
  if (total >= 50) return 'C';
  if (total >= 25) return 'D';
  return 'F';
}
function resultEmoji(r: Result | null): string {
  if (!r || r.pickedIdx === null) return '⬜';
  if (!r.correct) return '🔴';
  if (r.timeMs <= FAST_MS) return '🟢';
  return '🟡';
}

export default function CardExileClient() {
  const [mode, setMode] = useState<Mode>('daily');
  const [seed, setSeed] = useState<string>(todaySeed());
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [current, setCurrent] = useState<number>(0);
  const [phase, setPhase] = useState<Phase>('playing');
  const [results, setResults] = useState<Result[]>([]);
  const [startedAt, setStartedAt] = useState<number>(Date.now());
  const [stats, setStats] = useState<Stats>(ZERO_STATS);
  const [shareMsg, setShareMsg] = useState<string>('');
  const [locked, setLocked] = useState<boolean>(false);

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
    const correct = idx === puzzle.exileIdx;
    const score = computeScore(correct, timeMs);
    const r: Result = { pickedIdx: idx, correct, timeMs, score };
    setResults(prev => [...prev, r]);
    setPhase('revealed');
  }

  function handleNext() {
    if (current + 1 >= puzzles.length) finishRound();
    else {
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
      try {
        localStorage.setItem(DAILY_KEY, JSON.stringify({ date: seed, results, score: totalScore, grade }));
      } catch {}
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
    const text = `Card Exile ${seed} · ${totalScore} / 125 · Grade ${grade}\n${emojis}\nhttps://cardvault-two.vercel.app/card-exile`;
    try {
      if (navigator.share) {
        await navigator.share({ text, title: 'Card Exile' });
        setShareMsg('Shared!');
      } else {
        await navigator.clipboard.writeText(text);
        setShareMsg('Copied to clipboard!');
      }
    } catch { setShareMsg('Copy failed'); }
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
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="inline-flex bg-slate-900 border border-slate-800 rounded-lg p-1">
          <button
            onClick={() => setMode('daily')}
            disabled={locked && mode === 'free'}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition ${mode === 'daily' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Daily {locked ? '(done)' : ''}
          </button>
          <button
            onClick={() => setMode('free')}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition ${mode === 'free' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}
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
            className="text-xs text-rose-300 bg-rose-950/40 border border-rose-800/50 rounded-md px-3 py-1.5 hover:bg-rose-900/40"
          >
            ↻ New round
          </button>
        )}
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span>Puzzle {Math.min(current + 1, puzzles.length)} / {puzzles.length}</span>
          <span className="font-mono">Score: {totalScore} / {puzzles.length * 25}</span>
        </div>
        <div className="flex gap-1.5">
          {puzzles.map((_, i) => {
            const r = results[i];
            const bg = r ? (r.correct ? (r.timeMs <= FAST_MS ? 'bg-emerald-500' : 'bg-yellow-500') : 'bg-red-500') : i === current ? 'bg-rose-500' : 'bg-slate-700';
            return <div key={i} className={`flex-1 h-2 rounded ${bg}`} />;
          })}
        </div>
      </div>

      {phase === 'round-end' && (
        <div className="bg-gradient-to-br from-rose-950/60 to-rose-900/30 border border-rose-700/50 rounded-xl p-6">
          <div className="text-center">
            <div className="text-sm uppercase tracking-wider text-rose-300 mb-2">Round complete</div>
            <div className="text-5xl font-bold text-white mb-1">{totalScore} <span className="text-2xl text-rose-300">/ 125</span></div>
            <div className="text-3xl font-bold text-rose-300 mb-4">Grade: {grade}</div>
            <div className="flex justify-center gap-1 text-3xl mb-6">{results.map((r, i) => <span key={i}>{resultEmoji(r)}</span>)}</div>
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={handleShare}
                className="bg-rose-600 hover:bg-rose-500 text-white font-semibold px-5 py-2 rounded-lg transition"
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

          <div className="mt-6 space-y-2">
            {puzzles.map((p, i) => {
              const r = results[i];
              if (!r) return null;
              return (
                <div key={i} className="flex items-center justify-between bg-slate-900/60 border border-slate-800 rounded-md px-3 py-2 text-sm gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{resultEmoji(r)}</span>
                    <span className="text-slate-400">#{i + 1}</span>
                    <span className="text-slate-300 truncate">{p.rule.label}</span>
                  </div>
                  <div className="font-mono text-rose-300 flex-shrink-0">+{r.score}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {phase !== 'round-end' && puzzle && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-rose-950/40 to-red-950/20 border border-rose-800/50 rounded-xl p-4 text-center">
            <div className="text-xs uppercase tracking-wider text-rose-300 mb-1">The rule</div>
            <div className="text-lg sm:text-xl font-bold text-white">⚖️ {puzzle.rule.label}</div>
            <div className="text-xs text-slate-400 mt-1">Find the card that violates.</div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {puzzle.cards.map((c, idx) => {
              const isPicked = lastResult?.pickedIdx === idx && phase === 'revealed';
              const isExile = idx === puzzle.exileIdx;
              const reveal = phase === 'revealed';
              const correctPick = reveal && isExile;
              const wrongPick = reveal && isPicked && !isExile;
              return (
                <button
                  key={c.slug}
                  onClick={() => handlePick(idx)}
                  disabled={phase !== 'playing'}
                  className={`relative text-left rounded-lg border-2 p-3 transition overflow-hidden ${
                    correctPick ? 'bg-red-950/60 border-red-500' :
                    wrongPick ? 'bg-slate-950/60 border-slate-600' :
                    reveal ? 'bg-slate-900/40 border-slate-800 opacity-60' :
                    'bg-slate-900/60 border-slate-700 hover:border-rose-500 hover:bg-slate-800/60 cursor-pointer'
                  }`}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <span className="inline-block w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-center text-xs font-bold text-slate-300 leading-6">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    {reveal && isExile && <span className="ml-auto text-xs font-bold text-red-400">⚖️ EXILE</span>}
                    {reveal && !isExile && <span className="ml-auto text-xs text-slate-500">clean</span>}
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

          {phase === 'revealed' && lastResult && (
            <div className={`rounded-xl p-5 text-center border ${lastResult.correct ? 'bg-emerald-950/40 border-emerald-700/50' : 'bg-red-950/30 border-red-800/50'}`}>
              <div className={`text-xl font-bold mb-2 ${lastResult.correct ? 'text-emerald-300' : 'text-red-300'}`}>
                {lastResult.correct ? `✓ Correct! +${lastResult.score} pts` : '✗ Wrong'}
              </div>
              <div className="text-sm text-slate-300">
                {!lastResult.correct && `The exile was card ${String.fromCharCode(65 + puzzle.exileIdx)}.`}
              </div>
              {lastResult.correct && (
                <div className="text-xs text-slate-500 mt-2">
                  Time: {(lastResult.timeMs / 1000).toFixed(1)}s ·
                  {lastResult.timeMs <= FAST_MS ? ' Fast bonus +10' : lastResult.timeMs <= SLOW_MS ? ' Slow bonus +5' : ' No time bonus'}
                </div>
              )}
              <button
                onClick={handleNext}
                className="mt-4 bg-rose-600 hover:bg-rose-500 text-white font-semibold px-6 py-2.5 rounded-lg transition"
              >
                {current + 1 >= puzzles.length ? 'Finish round →' : 'Next puzzle →'}
              </button>
            </div>
          )}
        </div>
      )}

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
