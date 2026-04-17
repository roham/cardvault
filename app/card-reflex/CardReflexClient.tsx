'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { sportsCards, type SportsCard } from '@/data/sports-cards';

const STATS_KEY = 'cv_card_reflex_stats_v1';
const DAILY_KEY = 'cv_card_reflex_daily_v1';

type Difficulty = 'easy' | 'normal' | 'hard';
type Mode = 'daily' | 'free';
type Phase = 'idle' | 'countdown' | 'playing' | 'done';
type Criterion = 'baseball' | 'preNineties' | 'rookie' | 'valueTier';

type DifficultyMeta = {
  flashMs: number;
  durationSec: number;
  matchRate: number;
  label: string;
};
const DIFFICULTY: Record<Difficulty, DifficultyMeta> = {
  easy:   { flashMs: 1500, durationSec: 45, matchRate: 0.5, label: 'Easy' },
  normal: { flashMs: 1100, durationSec: 45, matchRate: 0.4, label: 'Normal' },
  hard:   { flashMs: 800,  durationSec: 60, matchRate: 0.3, label: 'Hard' },
};

const CRITERION_META: Record<Criterion, { label: string; describe: string; test: (c: SportsCard) => boolean }> = {
  baseball:     { label: 'Baseball cards', describe: 'Tap if the card is BASEBALL', test: c => c.sport === 'baseball' },
  preNineties:  { label: 'Pre-1990 cards', describe: 'Tap if the card year is BEFORE 1990', test: c => c.year < 1990 },
  rookie:       { label: 'Rookie cards', describe: 'Tap if the card is marked ROOKIE', test: c => c.rookie === true },
  valueTier:    { label: 'High-value ($1K+ gem)', describe: 'Tap if gem-mint value contains $1K+', test: c => {
    const v = c.estimatedValueGem || '';
    const match = v.match(/\$([0-9,]+)/);
    if (!match) return false;
    const num = parseInt(match[1].replace(/,/g, ''), 10);
    return num >= 1000;
  } },
};

const CRITERION_ORDER: Criterion[] = ['baseball', 'preNineties', 'rookie', 'valueTier'];

type Stats = {
  games: number;
  bestEasy: number;
  bestNormal: number;
  bestHard: number;
  lifetimeHits: number;
  bestGrade: string;
  dailyStreak: number;
  lastDaily: string;
};
const ZERO_STATS: Stats = { games: 0, bestEasy: 0, bestNormal: 0, bestHard: 0, lifetimeHits: 0, bestGrade: '—', dailyStreak: 0, lastDaily: '' };

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
function dailyKey(): string { return new Date().toISOString().slice(0, 10); }

function gradeScore(s: number): string {
  if (s >= 200) return 'S';
  if (s >= 150) return 'A';
  if (s >= 100) return 'B';
  if (s >= 50) return 'C';
  if (s >= 10) return 'D';
  return 'F';
}

export default function CardReflexClient() {
  const [stats, setStats] = useState<Stats>(ZERO_STATS);
  const [mode, setMode] = useState<Mode>('daily');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [criterion, setCriterion] = useState<Criterion>('rookie');
  const [phase, setPhase] = useState<Phase>('idle');
  const [countdownNum, setCountdownNum] = useState(3);
  const [currentCard, setCurrentCard] = useState<SportsCard | null>(null);
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [falseAlarms, setFalseAlarms] = useState(0);
  const [correctRejects, setCorrectRejects] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [feedback, setFeedback] = useState<{ kind: string; at: number } | null>(null);
  const [dailyLocked, setDailyLocked] = useState(false);
  const startTimeRef = useRef(0);
  const cardIntervalRef = useRef<number | null>(null);
  const cardIndexRef = useRef(0);
  const cardTimestampRef = useRef(0);
  const cardRespondedRef = useRef(false);
  const poolRef = useRef<SportsCard[]>([]);

  useEffect(() => {
    try {
      const s = localStorage.getItem(STATS_KEY);
      if (s) setStats({ ...ZERO_STATS, ...JSON.parse(s) });
      const d = localStorage.getItem(`${DAILY_KEY}::${dailyKey()}`);
      if (d) setDailyLocked(true);
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STATS_KEY, JSON.stringify(stats)); } catch {}
  }, [stats]);

  const diffMeta = DIFFICULTY[difficulty];
  const critMeta = CRITERION_META[criterion];

  const generatePool = useCallback(() => {
    const seed = mode === 'daily'
      ? fnv1a(`card-reflex::${dailyKey()}::${difficulty}::${criterion}`)
      : fnv1a(`card-reflex::free::${Date.now()}::${Math.random()}`);
    const rand = mulberry32(seed);
    const all = sportsCards.filter(c => c.player);
    const matches = all.filter(c => critMeta.test(c));
    const nonMatches = all.filter(c => !critMeta.test(c));
    const totalCards = Math.floor((diffMeta.durationSec * 1000) / diffMeta.flashMs);
    const wantedMatches = Math.round(totalCards * diffMeta.matchRate);
    const wantedNonMatches = totalCards - wantedMatches;
    const pool: SportsCard[] = [];
    for (let i = 0; i < wantedMatches && matches.length > 0; i++) {
      pool.push(matches[Math.floor(rand() * matches.length)]);
    }
    for (let i = 0; i < wantedNonMatches && nonMatches.length > 0; i++) {
      pool.push(nonMatches[Math.floor(rand() * nonMatches.length)]);
    }
    // Shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool;
  }, [mode, difficulty, criterion, diffMeta, critMeta]);

  // Daily criterion is seeded from date
  useEffect(() => {
    if (mode === 'daily') {
      const seed = fnv1a(`card-reflex-crit::${dailyKey()}`);
      const rand = mulberry32(seed);
      setCriterion(CRITERION_ORDER[Math.floor(rand() * CRITERION_ORDER.length)]);
    }
  }, [mode]);

  function finishRound() {
    if (cardIntervalRef.current) { window.clearInterval(cardIntervalRef.current); cardIntervalRef.current = null; }
    setPhase('done');
    setCurrentCard(null);
    const grade = gradeScore(score);
    setStats(s => {
      const next = { ...s, games: s.games + 1, lifetimeHits: s.lifetimeHits + hits };
      if (difficulty === 'easy') next.bestEasy = Math.max(s.bestEasy, score);
      if (difficulty === 'normal') next.bestNormal = Math.max(s.bestNormal, score);
      if (difficulty === 'hard') next.bestHard = Math.max(s.bestHard, score);
      const tierOrder = ['F', 'D', 'C', 'B', 'A', 'S'];
      if (tierOrder.indexOf(grade) > tierOrder.indexOf(s.bestGrade === '—' ? 'F' : s.bestGrade)) next.bestGrade = grade;
      return next;
    });
    if (mode === 'daily') {
      try { localStorage.setItem(`${DAILY_KEY}::${dailyKey()}`, JSON.stringify({ score, grade, hits, misses, falseAlarms })); } catch {}
      setDailyLocked(true);
    }
  }

  function nextCard() {
    const pool = poolRef.current;
    if (!pool || cardIndexRef.current >= pool.length) {
      finishRound();
      return;
    }
    // If previous card was a match and user did not respond, it's a MISS
    if (currentCard && !cardRespondedRef.current) {
      if (critMeta.test(currentCard)) {
        setMisses(m => m + 1);
        setScore(s => s - 3);
        setFeedback({ kind: 'MISS', at: Date.now() });
      } else {
        setCorrectRejects(cr => cr + 1);
        setScore(s => s + 2);
        setFeedback({ kind: 'REJECT', at: Date.now() });
      }
    }
    const card = pool[cardIndexRef.current];
    cardIndexRef.current++;
    cardTimestampRef.current = performance.now();
    cardRespondedRef.current = false;
    setCurrentCard(card);
  }

  function handleTap() {
    if (phase !== 'playing' || !currentCard) return;
    if (cardRespondedRef.current) return;
    cardRespondedRef.current = true;
    if (critMeta.test(currentCard)) {
      setHits(h => h + 1);
      setScore(s => s + 10);
      setFeedback({ kind: 'HIT', at: Date.now() });
    } else {
      setFalseAlarms(fa => fa + 1);
      setScore(s => s - 5);
      setFeedback({ kind: 'FALSE', at: Date.now() });
    }
  }

  useEffect(() => {
    if (phase !== 'playing') return;
    let running = true;
    const loop = () => {
      if (!running) return;
      setElapsedMs(performance.now() - startTimeRef.current);
      if (performance.now() - startTimeRef.current >= diffMeta.durationSec * 1000) {
        finishRound();
        return;
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    return () => { running = false; };
  }, [phase, diffMeta.durationSec]);

  const startCountdown = useCallback(() => {
    poolRef.current = generatePool();
    cardIndexRef.current = 0;
    setScore(0);
    setHits(0);
    setMisses(0);
    setFalseAlarms(0);
    setCorrectRejects(0);
    setElapsedMs(0);
    setFeedback(null);
    setPhase('countdown');
    setCountdownNum(3);
    let c = 3;
    const ci = window.setInterval(() => {
      c--;
      if (c > 0) {
        setCountdownNum(c);
      } else {
        window.clearInterval(ci);
        startTimeRef.current = performance.now();
        setPhase('playing');
        nextCard();
        cardIntervalRef.current = window.setInterval(nextCard, diffMeta.flashMs);
      }
    }, 1000);
  }, [generatePool, diffMeta.flashMs]);

  const finalGrade = useMemo(() => gradeScore(score), [score]);
  const bestForDifficulty = difficulty === 'easy' ? stats.bestEasy : difficulty === 'normal' ? stats.bestNormal : stats.bestHard;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 text-center">
          <div className="text-[10px] uppercase tracking-wider text-slate-500">Games</div>
          <div className="text-xl font-bold text-white">{stats.games}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 text-center">
          <div className="text-[10px] uppercase tracking-wider text-slate-500">Best ({difficulty})</div>
          <div className="text-xl font-bold text-fuchsia-300">{bestForDifficulty}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 text-center">
          <div className="text-[10px] uppercase tracking-wider text-slate-500">Lifetime hits</div>
          <div className="text-xl font-bold text-white">{stats.lifetimeHits}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 text-center">
          <div className="text-[10px] uppercase tracking-wider text-slate-500">Best grade</div>
          <div className="text-xl font-bold text-fuchsia-300">{stats.bestGrade}</div>
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
        <div>
          <div className="text-xs uppercase tracking-wider text-slate-500 mb-2">Mode</div>
          <div className="flex gap-2 flex-wrap">
            <button disabled={phase === 'playing' || phase === 'countdown'} onClick={() => setMode('daily')} className={`text-xs px-3 py-1.5 rounded-md border disabled:opacity-50 ${mode === 'daily' ? 'bg-fuchsia-600 border-fuchsia-500 text-white' : 'bg-slate-950 border-slate-700 text-slate-300'}`}>🗓 Daily {dailyLocked ? '(played)' : ''}</button>
            <button disabled={phase === 'playing' || phase === 'countdown'} onClick={() => setMode('free')} className={`text-xs px-3 py-1.5 rounded-md border disabled:opacity-50 ${mode === 'free' ? 'bg-fuchsia-600 border-fuchsia-500 text-white' : 'bg-slate-950 border-slate-700 text-slate-300'}`}>♾ Free play</button>
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wider text-slate-500 mb-2">Difficulty</div>
          <div className="flex gap-2 flex-wrap">
            {(Object.keys(DIFFICULTY) as Difficulty[]).map(d => (
              <button key={d} disabled={phase === 'playing' || phase === 'countdown'} onClick={() => setDifficulty(d)} className={`text-xs px-3 py-1.5 rounded-md border disabled:opacity-50 ${difficulty === d ? 'bg-fuchsia-600 border-fuchsia-500 text-white' : 'bg-slate-950 border-slate-700 text-slate-300'}`}>{DIFFICULTY[d].label} · {DIFFICULTY[d].flashMs}ms · {DIFFICULTY[d].durationSec}s</button>
            ))}
          </div>
        </div>

        {mode === 'free' && (
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-500 mb-2">Criterion (free play only)</div>
            <div className="flex gap-2 flex-wrap">
              {CRITERION_ORDER.map(c => (
                <button key={c} disabled={phase === 'playing' || phase === 'countdown'} onClick={() => setCriterion(c)} className={`text-xs px-2.5 py-1 rounded-md border disabled:opacity-50 ${criterion === c ? 'bg-fuchsia-600 border-fuchsia-500 text-white' : 'bg-slate-950 border-slate-700 text-slate-300'}`}>{CRITERION_META[c].label}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-6">
        <div className="text-center mb-4">
          <div className="text-xs uppercase tracking-wider text-slate-500">Target criterion</div>
          <div className="text-lg font-bold text-fuchsia-300">{critMeta.label}</div>
          <div className="text-xs text-slate-400 italic">{critMeta.describe}</div>
        </div>

        <div className="relative h-64 flex items-center justify-center bg-slate-900/60 rounded-lg border border-slate-800 mb-4">
          {phase === 'idle' && (
            <div className="text-center">
              <button onClick={startCountdown} disabled={mode === 'daily' && dailyLocked} className="bg-fuchsia-600 hover:bg-fuchsia-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold px-6 py-3 rounded-lg">
                {mode === 'daily' && dailyLocked ? 'Daily done — try Free Play' : `▶ Start ${DIFFICULTY[difficulty].label}`}
              </button>
            </div>
          )}
          {phase === 'countdown' && (
            <div className="text-center">
              <div className="text-7xl font-bold text-fuchsia-400">{countdownNum}</div>
              <div className="text-xs text-slate-500 mt-2">Get ready…</div>
            </div>
          )}
          {phase === 'playing' && currentCard && (
            <button onClick={handleTap} className="w-full h-full text-left p-6 bg-slate-800/60 border border-slate-700 rounded-lg hover:border-fuchsia-400 transition">
              <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">{currentCard.year} {currentCard.set}</div>
              <div className="text-2xl font-bold text-white mb-1">{currentCard.player}</div>
              <div className="text-xs text-slate-400">
                {currentCard.sport} · #{currentCard.cardNumber}
                {currentCard.rookie && <span className="ml-2 text-fuchsia-400">RC</span>}
              </div>
              <div className="text-xs text-slate-500 mt-1">{currentCard.estimatedValueGem}</div>
              <div className="absolute bottom-2 right-2 text-[10px] text-slate-600">Tap anywhere to MATCH</div>
            </button>
          )}
          {phase === 'done' && (
            <div className="text-center w-full">
              <div className="text-xs uppercase tracking-wider text-fuchsia-300 mb-2">Round complete</div>
              <div className="text-6xl font-bold text-white mb-3">{finalGrade}</div>
              <div className="grid grid-cols-4 gap-2 text-xs max-w-md mx-auto">
                <div><div className="text-slate-500">Score</div><div className="font-bold text-white">{score}</div></div>
                <div><div className="text-slate-500">Hits</div><div className="font-bold text-emerald-300">{hits}</div></div>
                <div><div className="text-slate-500">Misses</div><div className="font-bold text-red-300">{misses}</div></div>
                <div><div className="text-slate-500">False alarms</div><div className="font-bold text-amber-300">{falseAlarms}</div></div>
              </div>
              <button onClick={() => setPhase('idle')} className="mt-4 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-semibold px-4 py-1.5 rounded-md text-sm">Back to menu</button>
            </div>
          )}
        </div>

        {phase === 'playing' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex gap-3">
                <span className="text-slate-400">Score: <span className="text-white font-bold">{score}</span></span>
                <span className="text-emerald-400">✓{hits}</span>
                <span className="text-red-400">✗{misses}</span>
                <span className="text-amber-400">⚡{falseAlarms}</span>
              </div>
              {feedback && Date.now() - feedback.at < 800 && (
                <span className={`font-bold text-sm ${feedback.kind === 'HIT' ? 'text-emerald-400' : feedback.kind === 'REJECT' ? 'text-slate-400' : feedback.kind === 'MISS' ? 'text-red-400' : 'text-amber-400'}`}>{feedback.kind}</span>
              )}
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-fuchsia-500 to-violet-500 transition-all" style={{ width: `${Math.min(100, (elapsedMs / (diffMeta.durationSec * 1000)) * 100)}%` }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
