'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

/* ─── helpers ─── */
function parseValue(est: string): number {
  const m = est.match(/\$([0-9,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) || 5 : 5;
}

function fmt(n: number): string {
  return `$${n.toLocaleString()}`;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const TARGET = 500;
const STACK_SIZE = 5;
const TIME_LIMIT = 30;
const SPORT_COLORS: Record<string, string> = {
  baseball: 'text-red-400',
  basketball: 'text-orange-400',
  football: 'text-green-400',
  hockey: 'text-blue-400',
};

/* ─── card pool (cards $10-$300 raw for interesting gameplay) ─── */
const cardPool = sportsCards
  .filter(c => {
    const v = parseValue(c.estimatedValueRaw);
    return v >= 10 && v <= 300;
  });

function getDailyCards(count: number): typeof sportsCards {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const rng = seededRandom(seed);
  const shuffled = [...cardPool].sort(() => rng() - 0.5);
  return shuffled.slice(0, count);
}

type GameState = 'ready' | 'playing' | 'done';

export default function CardStackClient() {
  const [gameState, setGameState] = useState<GameState>('ready');
  const [stack, setStack] = useState<typeof sportsCards>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [skipped, setSkipped] = useState(0);
  const [highScore, setHighScore] = useState<number | null>(null);

  const dailyCards = useMemo(() => getDailyCards(30), []);
  const currentCard = dailyCards[currentIndex] || null;

  const stackTotal = useMemo(() => stack.reduce((sum, c) => sum + parseValue(c.estimatedValueRaw), 0), [stack]);
  const distance = Math.abs(stackTotal - TARGET);

  /* Score: 1000 max, minus points for distance from target */
  const score = useMemo(() => {
    if (stack.length === 0) return 0;
    const pctOff = distance / TARGET;
    const raw = Math.max(0, 1000 - Math.round(pctOff * 1000));
    // Bonus for exact stack size
    const sizeBonus = stack.length === STACK_SIZE ? 200 : 0;
    return raw + sizeBonus;
  }, [distance, stack.length]);

  const grade = useMemo(() => {
    if (score >= 1100) return { letter: 'S', color: 'text-amber-400', label: 'PERFECT STACK' };
    if (score >= 900) return { letter: 'A+', color: 'text-emerald-400', label: 'Master Stacker' };
    if (score >= 700) return { letter: 'A', color: 'text-green-400', label: 'Great Eye' };
    if (score >= 500) return { letter: 'B', color: 'text-blue-400', label: 'Solid Picks' };
    if (score >= 300) return { letter: 'C', color: 'text-yellow-400', label: 'Getting There' };
    return { letter: 'D', color: 'text-red-400', label: 'Keep Practicing' };
  }, [score]);

  /* Load high score */
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cardvault-stack-highscore');
      if (saved) setHighScore(parseInt(saved));
    } catch {}
  }, []);

  /* Timer */
  useEffect(() => {
    if (gameState !== 'playing') return;
    if (timeLeft <= 0) {
      setGameState('done');
      return;
    }
    const t = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearTimeout(t);
  }, [gameState, timeLeft]);

  /* End game if stack full or no more cards */
  useEffect(() => {
    if (gameState === 'playing' && stack.length >= STACK_SIZE) {
      setGameState('done');
    }
    if (gameState === 'playing' && currentIndex >= dailyCards.length) {
      setGameState('done');
    }
  }, [gameState, stack.length, currentIndex, dailyCards.length]);

  /* Save high score on game end */
  useEffect(() => {
    if (gameState === 'done' && score > 0) {
      try {
        const prev = parseInt(localStorage.getItem('cardvault-stack-highscore') || '0');
        if (score > prev) {
          localStorage.setItem('cardvault-stack-highscore', String(score));
          setHighScore(score);
        }
      } catch {}
    }
  }, [gameState, score]);

  const startGame = useCallback(() => {
    setStack([]);
    setCurrentIndex(0);
    setTimeLeft(TIME_LIMIT);
    setSkipped(0);
    setGameState('playing');
  }, []);

  const addToStack = useCallback(() => {
    if (!currentCard || stack.length >= STACK_SIZE) return;
    setStack(prev => [...prev, currentCard]);
    setCurrentIndex(prev => prev + 1);
  }, [currentCard, stack.length]);

  const skipCard = useCallback(() => {
    setCurrentIndex(prev => prev + 1);
    setSkipped(prev => prev + 1);
  }, []);

  const shareText = useMemo(() => {
    const dots = stack.map(c => {
      const v = parseValue(c.estimatedValueRaw);
      if (v >= 200) return '🔴';
      if (v >= 100) return '🟠';
      if (v >= 50) return '🟡';
      return '🟢';
    }).join('');
    return `Card Stack Challenge 🃏\nTarget: ${fmt(TARGET)} | My Stack: ${fmt(stackTotal)}\n${dots} ${distance === 0 ? '💎 PERFECT!' : `(${fmt(distance)} off)`}\nScore: ${score}/1,200 | Grade: ${grade.letter}\nhttps://cardvault-two.vercel.app/card-stack`;
  }, [stack, stackTotal, distance, score, grade.letter]);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="px-4 py-2 bg-amber-950/40 border border-amber-800/50 rounded-lg">
          <div className="text-xs text-amber-400">Target</div>
          <div className="text-xl font-bold text-white">{fmt(TARGET)}</div>
        </div>
        <div className="px-4 py-2 bg-gray-800/40 border border-gray-700 rounded-lg">
          <div className="text-xs text-gray-400">Your Stack</div>
          <div className={`text-xl font-bold ${stackTotal > TARGET ? 'text-rose-400' : stackTotal === TARGET ? 'text-emerald-400' : 'text-white'}`}>{fmt(stackTotal)}</div>
        </div>
        <div className="px-4 py-2 bg-gray-800/40 border border-gray-700 rounded-lg">
          <div className="text-xs text-gray-400">Cards</div>
          <div className="text-xl font-bold text-white">{stack.length}/{STACK_SIZE}</div>
        </div>
        {gameState === 'playing' && (
          <div className={`px-4 py-2 rounded-lg border ${timeLeft <= 10 ? 'bg-rose-950/40 border-rose-800/50' : 'bg-gray-800/40 border-gray-700'}`}>
            <div className="text-xs text-gray-400">Time</div>
            <div className={`text-xl font-bold font-mono ${timeLeft <= 10 ? 'text-rose-400' : 'text-white'}`}>{timeLeft}s</div>
          </div>
        )}
        {highScore !== null && gameState === 'ready' && (
          <div className="px-4 py-2 bg-violet-950/40 border border-violet-800/50 rounded-lg">
            <div className="text-xs text-violet-400">High Score</div>
            <div className="text-xl font-bold text-white">{highScore}</div>
          </div>
        )}
      </div>

      {/* Target Bar */}
      {(gameState === 'playing' || gameState === 'done') && (
        <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>$0</span>
            <span className="text-amber-400 font-semibold">Target: {fmt(TARGET)}</span>
            <span>{fmt(TARGET * 2)}</span>
          </div>
          <div className="h-4 bg-gray-900 rounded-full relative overflow-hidden">
            {/* Target marker */}
            <div className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10" style={{ left: '50%' }} />
            {/* Fill bar */}
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                stackTotal > TARGET ? 'bg-gradient-to-r from-rose-600 to-rose-400' :
                stackTotal === TARGET ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' :
                'bg-gradient-to-r from-indigo-700 to-indigo-500'
              }`}
              style={{ width: `${Math.min((stackTotal / (TARGET * 2)) * 100, 100)}%` }}
            />
          </div>
          <div className="text-center mt-1">
            <span className={`text-sm font-medium ${distance === 0 ? 'text-emerald-400' : distance < 50 ? 'text-amber-400' : 'text-gray-400'}`}>
              {distance === 0 ? 'PERFECT!' : `${fmt(distance)} ${stackTotal > TARGET ? 'over' : 'under'} target`}
            </span>
          </div>
        </div>
      )}

      {/* Game Area */}
      {gameState === 'ready' && (
        <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">How To Play</h2>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Cards stream by one at a time. Add up to {STACK_SIZE} cards to your stack.
            Get as close to <span className="text-amber-400 font-bold">{fmt(TARGET)}</span> total value as possible.
            You have {TIME_LIMIT} seconds. Choose wisely!
          </p>
          <button
            onClick={startGame}
            className="px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold text-lg rounded-xl transition-colors"
          >
            Start Challenge
          </button>
        </div>
      )}

      {gameState === 'playing' && currentCard && (
        <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6">
          <div className="text-center mb-4">
            <span className="text-xs text-gray-500">Card {currentIndex + 1} of {dailyCards.length}</span>
          </div>
          <div className="max-w-sm mx-auto bg-gray-900/60 border border-gray-700 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-medium uppercase ${SPORT_COLORS[currentCard.sport] || 'text-gray-400'}`}>
                {currentCard.sport}
              </span>
              <span className="text-xs text-gray-500">{currentCard.year}</span>
            </div>
            <h3 className="text-white font-bold text-lg mb-1">{currentCard.player}</h3>
            <p className="text-gray-500 text-sm mb-3">{currentCard.set}</p>
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-amber-400">{fmt(parseValue(currentCard.estimatedValueRaw))}</div>
              <div className="text-xs text-gray-500">estimated raw value</div>
            </div>
            <div className="text-center text-xs text-gray-500 mb-4">
              Adding this card would bring your total to{' '}
              <span className={`font-semibold ${(stackTotal + parseValue(currentCard.estimatedValueRaw)) > TARGET ? 'text-rose-400' : 'text-emerald-400'}`}>
                {fmt(stackTotal + parseValue(currentCard.estimatedValueRaw))}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={addToStack}
                disabled={stack.length >= STACK_SIZE}
                className="py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold rounded-lg transition-colors"
              >
                Add to Stack
              </button>
              <button
                onClick={skipCard}
                className="py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 font-bold rounded-lg transition-colors"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stack display */}
      {stack.length > 0 && (
        <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Your Stack</h3>
          <div className="space-y-2">
            {stack.map((c, i) => {
              const val = parseValue(c.estimatedValueRaw);
              return (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-900/40 rounded-lg border border-gray-800">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-gray-600 w-5">{i + 1}</span>
                    <div>
                      <div className="text-white text-sm font-medium">{c.player}</div>
                      <div className="text-gray-500 text-xs">{c.set} &middot; {c.year}</div>
                    </div>
                  </div>
                  <span className="text-amber-400 font-bold">{fmt(val)}</span>
                </div>
              );
            })}
            <div className="flex justify-between pt-2 border-t border-gray-700">
              <span className="text-white font-semibold">Total</span>
              <span className={`font-bold text-lg ${stackTotal === TARGET ? 'text-emerald-400' : stackTotal > TARGET ? 'text-rose-400' : 'text-amber-400'}`}>
                {fmt(stackTotal)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {gameState === 'done' && (
        <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-8 text-center">
          <div className={`text-6xl font-bold ${grade.color} mb-2`}>{grade.letter}</div>
          <div className="text-gray-400 text-lg mb-4">{grade.label}</div>
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-6">
            <div>
              <div className="text-2xl font-bold text-white">{score}</div>
              <div className="text-xs text-gray-500">Score</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{fmt(stackTotal)}</div>
              <div className="text-xs text-gray-500">Stack Value</div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${distance === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {distance === 0 ? 'EXACT' : fmt(distance)}
              </div>
              <div className="text-xs text-gray-500">{distance === 0 ? 'Perfect!' : 'Off Target'}</div>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <button
              onClick={startGame}
              className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg transition-colors"
            >
              Play Again
            </button>
            <button
              onClick={() => { navigator.clipboard?.writeText(shareText); }}
              className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
            >
              Copy Results
            </button>
            <a
              href={`https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
            >
              Share to X
            </a>
          </div>
          <div className="text-xs text-gray-600">
            Cards seen: {currentIndex} | Skipped: {skipped} | Time used: {TIME_LIMIT - timeLeft}s
          </div>
        </div>
      )}

      {/* Cross-links */}
      <div className="flex flex-wrap gap-3">
        {[
          { href: '/card-value-snap', label: 'Card Value Snap' },
          { href: '/card-roulette', label: 'Card Roulette' },
          { href: '/flip-or-keep', label: 'Flip or Keep' },
          { href: '/card-war', label: 'Card War' },
          { href: '/trivia', label: 'Daily Trivia' },
          { href: '/leaderboard', label: 'Leaderboards' },
        ].map(l => (
          <Link key={l.href} href={l.href} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white border border-gray-700 rounded-lg text-xs transition-colors">
            {l.label} &rarr;
          </Link>
        ))}
      </div>
    </div>
  );
}
