'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { sportsCards } from '@/data/sports-cards';

const STORAGE_KEY = 'cv_card_shuffle_v1';
const DAILY_KEY = 'cv_card_shuffle_daily_v1';
const ROUNDS = 10;
const CELL_W = 76;
const GAP = 10;
const CARD_H = 120;

type Difficulty = 'easy' | 'normal' | 'hard';
type Mode = 'daily' | 'free';
type Phase = 'idle' | 'reveal' | 'shuffle' | 'pick' | 'result' | 'done';

const DIFFICULTY: Record<Difficulty, {
  cards: number;
  swaps: number;
  swapMs: number;
  revealMs: number;
  label: string;
  multiplier: number;
}> = {
  easy: { cards: 3, swaps: 3, swapMs: 800, revealMs: 2500, label: 'Easy', multiplier: 1 },
  normal: { cards: 4, swaps: 6, swapMs: 500, revealMs: 2000, label: 'Normal', multiplier: 1.5 },
  hard: { cards: 5, swaps: 10, swapMs: 300, revealMs: 1500, label: 'Hard', multiplier: 2 },
};

type MiniCard = {
  slug: string;
  player: string;
  year: number;
  sport: string;
  fmv: number;
};

type Stats = {
  games: number;
  bestScore: number;
  bestGrade: string;
  lifetimeCorrect: number;
  lifetimeAttempts: number;
  dailyStreak: number;
  lastDailyDate: string;
  lastDailyScore: number;
};

const DEFAULT_STATS: Stats = {
  games: 0,
  bestScore: 0,
  bestGrade: '—',
  lifetimeCorrect: 0,
  lifetimeAttempts: 0,
  dailyStreak: 0,
  lastDailyDate: '',
  lastDailyScore: 0,
};

const GRADE_ORDER: Record<string, number> = { F: 0, D: 1, C: 2, B: 3, A: 4, S: 5, '—': -1 };

function fnv1a(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

function seededRand(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = Math.imul(s ^ (s >>> 15), 2246822507) >>> 0;
    s = Math.imul(s ^ (s >>> 13), 3266489909) >>> 0;
    return ((s ^= s >>> 16) >>> 0) / 0xffffffff;
  };
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function parseFmv(raw?: string, gem?: string): number {
  const src = raw || gem || '';
  const m = src.match(/\$([0-9,]+)/);
  if (!m) return 5;
  return parseInt(m[1].replace(/,/g, ''), 10) || 5;
}

function toMini(c: typeof sportsCards[number]): MiniCard {
  return {
    slug: c.slug,
    player: c.player,
    year: c.year,
    sport: String(c.sport),
    fmv: parseFmv(c.estimatedValueRaw as string, c.estimatedValueGem as string),
  };
}

function sportEmoji(s: string): string {
  if (s === 'baseball') return '⚾';
  if (s === 'basketball') return '🏀';
  if (s === 'football') return '🏈';
  if (s === 'hockey') return '🏒';
  return '🎴';
}

function gradeOf(score: number): string {
  if (score >= 25000) return 'S';
  if (score >= 12000) return 'A';
  if (score >= 6000) return 'B';
  if (score >= 2500) return 'C';
  if (score >= 800) return 'D';
  return 'F';
}

function pickRound(rnd: () => number, difficulty: Difficulty): {
  pool: MiniCard[];
  targetIdx: number;
  swapSequence: Array<[number, number]>;
} {
  const cfg = DIFFICULTY[difficulty];
  const valueFilter = sportsCards.filter((c: typeof sportsCards[number]) => {
    const v = parseFmv(c.estimatedValueRaw as string, c.estimatedValueGem as string);
    return v >= 200 && v <= 100000;
  });
  const pool: MiniCard[] = [];
  const used = new Set<string>();
  let attempts = 0;
  while (pool.length < cfg.cards && attempts < 200) {
    attempts++;
    const pick = valueFilter[Math.floor(rnd() * valueFilter.length)];
    if (!pick || used.has(pick.slug)) continue;
    used.add(pick.slug);
    pool.push(toMini(pick));
  }
  // Target = highest-value card (most valuable to track)
  let targetIdx = 0;
  let max = pool[0]?.fmv ?? 0;
  for (let i = 1; i < pool.length; i++) {
    if (pool[i].fmv > max) {
      max = pool[i].fmv;
      targetIdx = i;
    }
  }
  // Swap sequence
  const swaps: Array<[number, number]> = [];
  let lastPair: [number, number] | null = null;
  for (let i = 0; i < cfg.swaps; i++) {
    let a = Math.floor(rnd() * cfg.cards);
    let b = Math.floor(rnd() * cfg.cards);
    if (a === b) b = (b + 1) % cfg.cards;
    if (lastPair && ((lastPair[0] === a && lastPair[1] === b) || (lastPair[0] === b && lastPair[1] === a))) {
      b = (b + 1) % cfg.cards;
      if (a === b) a = (a + 1) % cfg.cards;
    }
    swaps.push([a, b]);
    lastPair = [a, b];
  }
  return { pool, targetIdx, swapSequence: swaps };
}

export default function CardShuffleClient() {
  const [mode, setMode] = useState<Mode>('daily');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS);
  const [phase, setPhase] = useState<Phase>('idle');
  const [roundNum, setRoundNum] = useState(1);
  const [pool, setPool] = useState<MiniCard[]>([]);
  const [targetIdx, setTargetIdx] = useState(0);
  const [positions, setPositions] = useState<number[]>([]);
  const [swapSequence, setSwapSequence] = useState<Array<[number, number]>>([]);
  const [revealed, setRevealed] = useState(false);
  const [guessedCol, setGuessedCol] = useState<number | null>(null);
  const [totalScore, setTotalScore] = useState(0);
  const [lastRoundScore, setLastRoundScore] = useState(0);
  const [roundResults, setRoundResults] = useState<Array<'correct' | 'wrong'>>([]);
  const [dailyBlocked, setDailyBlocked] = useState(false);
  const rndRef = useRef<(() => number) | null>(null);
  const difficultyRef = useRef<Difficulty>('normal');
  const roundRef = useRef(1);
  const modeRef = useRef<Mode>('daily');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setStats(JSON.parse(raw));
    } catch {}
  }, []);

  const persistStats = useCallback((next: Stats) => {
    setStats(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  }, []);

  const checkDailyBlocked = useCallback((m: Mode, d: Difficulty) => {
    if (m !== 'daily') { setDailyBlocked(false); return; }
    try {
      const raw = localStorage.getItem(DAILY_KEY);
      if (!raw) { setDailyBlocked(false); return; }
      const p = JSON.parse(raw);
      setDailyBlocked(p.date === todayKey() && p.difficulty === d);
    } catch { setDailyBlocked(false); }
  }, []);

  useEffect(() => { checkDailyBlocked(mode, difficulty); }, [mode, difficulty, checkDailyBlocked]);

  function markDaily(score: number, correct: number) {
    try {
      localStorage.setItem(DAILY_KEY, JSON.stringify({
        date: todayKey(), difficulty: difficultyRef.current, score, correct,
      }));
    } catch {}
  }

  function beginRound(n: number, rnd: () => number) {
    const { pool: p, targetIdx: t, swapSequence: seq } = pickRound(rnd, difficultyRef.current);
    setPool(p);
    setTargetIdx(t);
    setSwapSequence(seq);
    setPositions(p.map((_, i) => i));
    setRevealed(true);
    setGuessedCol(null);
    setLastRoundScore(0);
    setPhase('reveal');
    roundRef.current = n;
  }

  function startGame() {
    difficultyRef.current = difficulty;
    modeRef.current = mode;
    const seed = mode === 'daily'
      ? fnv1a(`card-shuffle::${todayKey()}::${difficulty}`)
      : fnv1a(`free::${Date.now()}::${Math.floor(Math.random() * 1e9)}`);
    rndRef.current = seededRand(seed);
    setRoundNum(1);
    setTotalScore(0);
    setRoundResults([]);
    beginRound(1, rndRef.current);
  }

  // reveal -> shuffle
  useEffect(() => {
    if (phase !== 'reveal') return;
    const cfg = DIFFICULTY[difficultyRef.current];
    const t = setTimeout(() => {
      setRevealed(false);
      setPhase('shuffle');
    }, cfg.revealMs);
    return () => clearTimeout(t);
  }, [phase]);

  // shuffle -> pick
  useEffect(() => {
    if (phase !== 'shuffle') return;
    const cfg = DIFFICULTY[difficultyRef.current];
    let i = 0;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const step = () => {
      if (cancelled) return;
      if (i >= swapSequence.length) {
        setPhase('pick');
        return;
      }
      const [a, b] = swapSequence[i];
      setPositions(prev => {
        const next = prev.slice();
        const pa = next[a], pb = next[b];
        next[a] = pb;
        next[b] = pa;
        return next;
      });
      i++;
      timer = setTimeout(step, cfg.swapMs);
    };
    timer = setTimeout(step, 450);
    return () => { cancelled = true; if (timer) clearTimeout(timer); };
  }, [phase, swapSequence]);

  function handlePick(col: number) {
    if (phase !== 'pick') return;
    const cardAtCol = positions.indexOf(col);
    const correct = cardAtCol === targetIdx;
    const cfg = DIFFICULTY[difficultyRef.current];
    const earned = correct ? Math.round(pool[targetIdx].fmv * cfg.multiplier) : 0;
    const results = [...roundResults, correct ? ('correct' as const) : ('wrong' as const)];
    const newScore = totalScore + earned;
    setGuessedCol(col);
    setLastRoundScore(earned);
    setRevealed(true);
    setRoundResults(results);
    setTotalScore(newScore);
    setPhase('result');
    const advanceMs = 1700;
    setTimeout(() => {
      if (roundRef.current >= ROUNDS) {
        finishGame(newScore, results);
      } else {
        const nextN = roundRef.current + 1;
        setRoundNum(nextN);
        beginRound(nextN, rndRef.current!);
      }
    }, advanceMs);
  }

  function finishGame(finalScore: number, results: Array<'correct' | 'wrong'>) {
    setPhase('done');
    const correct = results.filter(r => r === 'correct').length;
    const grade = gradeOf(finalScore);
    const isDaily = modeRef.current === 'daily';
    const already = isDaily && stats.lastDailyDate === todayKey();
    const nextStats: Stats = {
      games: stats.games + 1,
      bestScore: Math.max(stats.bestScore, finalScore),
      bestGrade: GRADE_ORDER[grade] > GRADE_ORDER[stats.bestGrade] ? grade : stats.bestGrade,
      lifetimeCorrect: stats.lifetimeCorrect + correct,
      lifetimeAttempts: stats.lifetimeAttempts + ROUNDS,
      dailyStreak: isDaily && !already ? stats.dailyStreak + 1 : stats.dailyStreak,
      lastDailyDate: isDaily ? todayKey() : stats.lastDailyDate,
      lastDailyScore: isDaily ? finalScore : stats.lastDailyScore,
    };
    persistStats(nextStats);
    if (isDaily) {
      markDaily(finalScore, correct);
      setDailyBlocked(true);
    }
  }

  function copyShare() {
    const correct = roundResults.filter(r => r === 'correct').length;
    const grade = gradeOf(totalScore);
    const grid = roundResults.map(r => r === 'correct' ? '🎯' : '❌').join('');
    const modeLbl = modeRef.current === 'daily' ? 'Daily' : 'Free';
    const diffLbl = DIFFICULTY[difficultyRef.current].label;
    const text = `Card Shuffle ${modeLbl} · ${diffLbl}\n${grid} ${correct}/${ROUNDS}\nScore $${totalScore.toLocaleString()} · Grade ${grade}\ncardvault-two.vercel.app/card-shuffle`;
    try { navigator.clipboard.writeText(text); } catch {}
  }

  const cfg = DIFFICULTY[difficulty];
  const activeCfg = DIFFICULTY[difficultyRef.current];
  const containerW = (phase === 'idle' ? cfg : activeCfg).cards * CELL_W + ((phase === 'idle' ? cfg : activeCfg).cards - 1) * GAP;
  const hitRate = stats.lifetimeAttempts > 0 ? Math.round((stats.lifetimeCorrect / stats.lifetimeAttempts) * 100) : 0;
  const correctInRun = roundResults.filter(r => r === 'correct').length;

  return (
    <div className="space-y-6">
      {/* Mode + Difficulty */}
      <div className="bg-gray-800/40 border border-gray-700/40 rounded-xl p-4 sm:p-5">
        <div className="flex flex-wrap gap-6 items-start">
          <div className="flex-1 min-w-[220px]">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Mode</div>
            <div className="inline-flex rounded-lg border border-gray-700 overflow-hidden">
              {(['daily', 'free'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => { if (phase === 'idle' || phase === 'done') setMode(m); }}
                  disabled={phase !== 'idle' && phase !== 'done'}
                  className={`px-4 py-2 text-sm font-medium transition ${mode === m ? 'bg-cyan-500 text-gray-950' : 'bg-gray-900 text-gray-300 hover:bg-gray-800'} disabled:opacity-50`}
                >
                  {m === 'daily' ? 'Daily' : 'Free Play'}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 min-w-[260px]">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Difficulty</div>
            <div className="inline-flex rounded-lg border border-gray-700 overflow-hidden">
              {(['easy', 'normal', 'hard'] as const).map(d => (
                <button
                  key={d}
                  onClick={() => { if (phase === 'idle' || phase === 'done') setDifficulty(d); }}
                  disabled={phase !== 'idle' && phase !== 'done'}
                  className={`px-4 py-2 text-sm font-medium transition ${difficulty === d ? 'bg-cyan-500 text-gray-950' : 'bg-gray-900 text-gray-300 hover:bg-gray-800'} disabled:opacity-50`}
                >
                  {DIFFICULTY[d].label}
                </button>
              ))}
            </div>
            <div className="text-xs text-gray-500 mt-2">
              {cfg.cards} cards · {cfg.swaps} swaps · {cfg.swapMs}ms each · {cfg.multiplier}× payout
            </div>
          </div>
        </div>
      </div>

      {/* Game board */}
      <div className="bg-gray-800/40 border border-gray-700/40 rounded-xl p-4 sm:p-6">
        {phase === 'idle' && (
          <div className="text-center py-6">
            <div className="text-gray-400 text-sm mb-4">
              {dailyBlocked
                ? <>You&rsquo;ve run today&rsquo;s Daily at {DIFFICULTY[difficulty].label}. Switch difficulty or try Free Play.</>
                : <>Memorize the target position, watch the shuffle, pick the target. {ROUNDS} rounds.</>}
            </div>
            <button
              onClick={startGame}
              disabled={mode === 'daily' && dailyBlocked}
              className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-700 disabled:text-gray-500 text-gray-950 font-bold px-6 py-3 rounded-lg transition"
            >
              {mode === 'daily' && !dailyBlocked ? `Play Today's Daily (${DIFFICULTY[difficulty].label})` : 'Start Free Play'}
            </button>
            {dailyBlocked && stats.lastDailyDate === todayKey() && (
              <div className="text-xs text-gray-500 mt-3">
                Last daily at this difficulty: ${stats.lastDailyScore.toLocaleString()}
              </div>
            )}
          </div>
        )}

        {phase !== 'idle' && phase !== 'done' && (
          <>
            <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
              <div className="text-sm">
                <span className="text-gray-400">Round </span>
                <span className="text-white font-bold">{roundRef.current}</span>
                <span className="text-gray-500"> / {ROUNDS}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-400">Score </span>
                <span className="text-cyan-300 font-bold">${totalScore.toLocaleString()}</span>
              </div>
              <div className="text-xs text-gray-500">
                {phase === 'reveal' && '👁️ Memorize target'}
                {phase === 'shuffle' && '🔀 Tracking...'}
                {phase === 'pick' && '🎯 Pick the target'}
                {phase === 'result' && (guessedCol !== null && positions.indexOf(guessedCol) === targetIdx ? '✅ Correct!' : '❌ Wrong')}
              </div>
            </div>

            {/* Card lanes */}
            <div className="mx-auto overflow-x-auto" style={{ maxWidth: '100%' }}>
              <div className="relative mx-auto" style={{ width: `${containerW}px`, height: `${CARD_H}px` }}>
                {pool.map((card, cardIdx) => {
                  const col = positions[cardIdx];
                  const isTarget = cardIdx === targetIdx;
                  const showFace = revealed;
                  const cfgLocal = DIFFICULTY[difficultyRef.current];
                  return (
                    <div
                      key={cardIdx}
                      className="absolute"
                      style={{
                        left: 0,
                        top: 0,
                        width: `${CELL_W}px`,
                        height: `${CARD_H}px`,
                        transform: `translateX(${col * (CELL_W + GAP)}px)`,
                        transition: `transform ${cfgLocal.swapMs - 30}ms ease-in-out`,
                      }}
                    >
                      <div
                        className={`w-full h-full rounded-lg border-2 flex flex-col items-center justify-center px-2 text-center ${
                          showFace
                            ? (isTarget ? 'bg-cyan-500/20 border-cyan-400 text-cyan-100 shadow-lg shadow-cyan-500/30' : 'bg-gray-900 border-gray-700 text-gray-300')
                            : 'bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 text-gray-700'
                        }`}
                      >
                        {showFace ? (
                          <>
                            <div className="text-xl mb-1">{sportEmoji(card.sport)}</div>
                            <div className="text-[10px] font-semibold leading-tight line-clamp-2 mb-1">{card.player}</div>
                            <div className="text-[10px] text-gray-400">{card.year}</div>
                            <div className="text-[11px] font-bold mt-1">${card.fmv.toLocaleString()}</div>
                            {isTarget && (
                              <div className="text-[9px] font-black uppercase tracking-widest text-cyan-300 mt-1">Target</div>
                            )}
                          </>
                        ) : (
                          <div className="text-3xl opacity-50">?</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pick buttons */}
            {(phase === 'pick' || phase === 'result') && (
              <div
                className="mx-auto mt-4 flex"
                style={{ width: `${containerW}px`, gap: `${GAP}px`, maxWidth: '100%' }}
              >
                {Array.from({ length: DIFFICULTY[difficultyRef.current].cards }, (_, col) => {
                  const isGuessed = guessedCol === col;
                  const actualTargetCol = positions[targetIdx];
                  const showTarget = phase === 'result' && col === actualTargetCol;
                  return (
                    <button
                      key={col}
                      onClick={() => handlePick(col)}
                      disabled={phase !== 'pick'}
                      style={{ width: `${CELL_W}px`, flexShrink: 0 }}
                      className={`py-2 text-xs font-semibold rounded-md border transition ${
                        showTarget
                          ? 'bg-cyan-500 text-gray-950 border-cyan-400'
                          : isGuessed && phase === 'result'
                            ? 'bg-rose-500/30 text-rose-200 border-rose-600'
                            : phase === 'pick'
                              ? 'bg-gray-900 border-gray-700 text-gray-200 hover:bg-cyan-500 hover:text-gray-950 hover:border-cyan-400'
                              : 'bg-gray-900 border-gray-800 text-gray-600'
                      }`}
                    >
                      {col + 1}
                    </button>
                  );
                })}
              </div>
            )}

            {phase === 'result' && lastRoundScore > 0 && (
              <div className="text-center mt-3 text-sm text-cyan-300">
                +${lastRoundScore.toLocaleString()}
              </div>
            )}
          </>
        )}

        {phase === 'done' && (
          <div className="text-center py-6 space-y-4">
            <div className="text-xs text-gray-400 uppercase tracking-widest">Final</div>
            <div className="flex justify-center items-center gap-8">
              <div>
                <div className="text-4xl sm:text-5xl font-black text-cyan-300">${totalScore.toLocaleString()}</div>
                <div className="text-xs text-gray-500 mt-1">total value</div>
              </div>
              <div>
                <div className="text-4xl sm:text-5xl font-black text-white">{gradeOf(totalScore)}</div>
                <div className="text-xs text-gray-500 mt-1">grade</div>
              </div>
              <div>
                <div className="text-4xl sm:text-5xl font-black text-emerald-300">{correctInRun}/{ROUNDS}</div>
                <div className="text-xs text-gray-500 mt-1">tracked</div>
              </div>
            </div>
            <div className="text-2xl tracking-wider">
              {roundResults.map((r, i) => <span key={i}>{r === 'correct' ? '🎯' : '❌'}</span>)}
            </div>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <button
                onClick={copyShare}
                className="bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold px-5 py-2 rounded-lg text-sm transition"
              >
                Copy share
              </button>
              <button
                onClick={() => { setPhase('idle'); checkDailyBlocked(mode, difficulty); }}
                className="bg-gray-800 hover:bg-gray-700 text-white font-bold px-5 py-2 rounded-lg text-sm transition border border-gray-700"
              >
                Play again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="bg-gray-800/40 border border-gray-700/40 rounded-xl p-4 sm:p-5">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Lifetime Stats</div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
          <div>
            <div className="text-lg sm:text-xl font-bold text-white">{stats.games}</div>
            <div className="text-[10px] uppercase tracking-wide text-gray-500">Games</div>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold text-cyan-300">${stats.bestScore.toLocaleString()}</div>
            <div className="text-[10px] uppercase tracking-wide text-gray-500">Best Score</div>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold text-white">{stats.bestGrade}</div>
            <div className="text-[10px] uppercase tracking-wide text-gray-500">Best Grade</div>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold text-emerald-300">{hitRate}%</div>
            <div className="text-[10px] uppercase tracking-wide text-gray-500">Hit Rate</div>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold text-amber-300">{stats.dailyStreak}</div>
            <div className="text-[10px] uppercase tracking-wide text-gray-500">Daily Streak</div>
          </div>
        </div>
      </div>
    </div>
  );
}
