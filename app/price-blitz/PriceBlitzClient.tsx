'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { sportsCards } from '@/data/sports-cards';
import Link from 'next/link';

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseValue(v: string | undefined): number {
  if (!v) return 0;
  const m = v.match(/\$[\d,]+/);
  if (!m) return 0;
  return parseInt(m[0].replace(/[$,]/g, ''), 10) || 0;
}

function seededRng(seed: number) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
}

function dateHash(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

type GameMode = 'daily' | 'random';
type GameState = 'menu' | 'playing' | 'results';

interface CardRound {
  card: typeof sportsCards[0];
  threshold: number;
  actualValue: number;
  correct: boolean | null;
  answer: 'over' | 'under' | null;
}

const STORAGE_KEY = 'cardvault-price-blitz';
const TOTAL_CARDS = 20;
const TIME_LIMIT = 60;

const sportColors: Record<string, string> = {
  baseball: 'text-red-400', basketball: 'text-orange-400',
  football: 'text-blue-400', hockey: 'text-cyan-400',
};

function getGrade(score: number): { grade: string; color: string } {
  if (score >= 2500) return { grade: 'S', color: 'text-yellow-400' };
  if (score >= 2000) return { grade: 'A', color: 'text-emerald-400' };
  if (score >= 1500) return { grade: 'B', color: 'text-blue-400' };
  if (score >= 1000) return { grade: 'C', color: 'text-purple-400' };
  if (score >= 500) return { grade: 'D', color: 'text-orange-400' };
  return { grade: 'F', color: 'text-red-400' };
}

// ── Component ────────────────────────────────────────────────────────────────

export default function PriceBlitzClient() {
  const [mounted, setMounted] = useState(false);
  const [gameState, setGameState] = useState<GameState>('menu');
  const [mode, setMode] = useState<GameMode>('daily');
  const [rounds, setRounds] = useState<CardRound[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [stats, setStats] = useState({ gamesPlayed: 0, bestScore: 0, bestDaily: 0, avgAccuracy: 0 });
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => { setMounted(true); }, []);

  // Load stats
  useEffect(() => {
    if (!mounted) return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setStats(JSON.parse(saved));
    } catch { /* ignore */ }
  }, [mounted]);

  // Save stats
  const saveStats = useCallback((newStats: typeof stats) => {
    setStats(newStats);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newStats));
  }, []);

  // Generate rounds
  const generateRounds = useCallback((gameMode: GameMode): CardRound[] => {
    const seed = gameMode === 'daily' ? dateHash() : Date.now();
    const rng = seededRng(seed);
    const valuableCards = sportsCards.filter(c => {
      const v = parseValue(c.estimatedValueRaw);
      return v >= 5 && v <= 50000;
    });
    const shuffled = [...valuableCards].sort(() => rng() - 0.5);
    const selected = shuffled.slice(0, TOTAL_CARDS);

    return selected.map(card => {
      const actualValue = parseValue(card.estimatedValueRaw);
      // Generate a threshold near the actual value to make it challenging
      const factor = 0.4 + rng() * 1.2; // 0.4x to 1.6x
      const threshold = Math.max(5, Math.round(actualValue * factor / 5) * 5);
      return { card, threshold, actualValue, correct: null, answer: null };
    });
  }, []);

  // Start game
  const startGame = useCallback((gameMode: GameMode) => {
    setMode(gameMode);
    setRounds(generateRounds(gameMode));
    setCurrentIdx(0);
    setScore(0);
    setStreak(0);
    setTimeLeft(TIME_LIMIT);
    setGameState('playing');
  }, [generateRounds]);

  // Timer
  useEffect(() => {
    if (gameState !== 'playing') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState('results');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [gameState]);

  // Handle answer
  const handleAnswer = useCallback((answer: 'over' | 'under') => {
    if (gameState !== 'playing' || currentIdx >= rounds.length) return;

    const round = rounds[currentIdx];
    const isCorrect = answer === 'over' ? round.actualValue >= round.threshold : round.actualValue < round.threshold;
    const newStreak = isCorrect ? streak + 1 : 0;
    const multiplier = Math.min(3, 1 + (newStreak - 1) * 0.5);
    const pointsEarned = isCorrect ? Math.round(50 * (newStreak > 0 ? multiplier : 1)) : 0;

    setRounds(prev => prev.map((r, i) =>
      i === currentIdx ? { ...r, correct: isCorrect, answer } : r
    ));
    setScore(prev => prev + pointsEarned);
    setStreak(newStreak);

    if (currentIdx + 1 >= rounds.length) {
      // Game over — add time bonus
      const timeBonus = timeLeft * 5;
      setScore(prev => prev + timeBonus);
      setTimeout(() => setGameState('results'), 500);
    } else {
      setCurrentIdx(prev => prev + 1);
    }
  }, [gameState, currentIdx, rounds, streak, timeLeft]);

  // Keyboard controls
  useEffect(() => {
    if (gameState !== 'playing') return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') handleAnswer('under');
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') handleAnswer('over');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [gameState, handleAnswer]);

  // Save stats on game over
  useEffect(() => {
    if (gameState !== 'results') return;
    const finalScore = score;
    const correct = rounds.filter(r => r.correct).length;
    const accuracy = rounds.length > 0 ? correct / rounds.filter(r => r.answer !== null).length : 0;
    const newStats = {
      gamesPlayed: stats.gamesPlayed + 1,
      bestScore: Math.max(stats.bestScore, finalScore),
      bestDaily: mode === 'daily' ? Math.max(stats.bestDaily, finalScore) : stats.bestDaily,
      avgAccuracy: Math.round(((stats.avgAccuracy * stats.gamesPlayed) + accuracy * 100) / (stats.gamesPlayed + 1)),
    };
    saveStats(newStats);
  }, [gameState]); // eslint-disable-line react-hooks/exhaustive-deps

  // Share results
  const shareResults = () => {
    const correct = rounds.filter(r => r.correct).length;
    const answered = rounds.filter(r => r.answer !== null).length;
    const { grade } = getGrade(score);
    const emojis = rounds.filter(r => r.answer !== null).map(r => r.correct ? '🟢' : '🔴').join('');
    const text = `Card Price Blitz ${mode === 'daily' ? '(Daily)' : ''}\n${emojis}\nScore: ${score} (Grade ${grade})\n${correct}/${answered} correct\nhttps://cardvault-two.vercel.app/price-blitz`;
    navigator.clipboard.writeText(text);
  };

  if (!mounted) return <div className="min-h-[400px] flex items-center justify-center text-gray-500">Loading...</div>;

  // ── Menu ───────────────────────────────────────────────────────────────────
  if (gameState === 'menu') {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => startGame('daily')}
            className="bg-gradient-to-br from-rose-900/40 to-pink-900/20 border border-rose-800/50 rounded-xl p-6 text-left hover:border-rose-600/50 transition-colors"
          >
            <div className="text-2xl mb-2">📅</div>
            <h3 className="text-white font-bold text-lg">Daily Challenge</h3>
            <p className="text-gray-400 text-sm mt-1">Same cards for everyone today. Compare scores!</p>
          </button>
          <button
            onClick={() => startGame('random')}
            className="bg-gradient-to-br from-purple-900/40 to-violet-900/20 border border-purple-800/50 rounded-xl p-6 text-left hover:border-purple-600/50 transition-colors"
          >
            <div className="text-2xl mb-2">🎲</div>
            <h3 className="text-white font-bold text-lg">Random Game</h3>
            <p className="text-gray-400 text-sm mt-1">Fresh cards every time. Unlimited practice.</p>
          </button>
        </div>

        {/* Stats */}
        {stats.gamesPlayed > 0 && (
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5">
            <h3 className="text-white font-bold mb-3">Your Stats</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div><div className="text-gray-500 text-xs">Games Played</div><div className="text-white font-bold">{stats.gamesPlayed}</div></div>
              <div><div className="text-gray-500 text-xs">Best Score</div><div className="text-emerald-400 font-bold">{stats.bestScore}</div></div>
              <div><div className="text-gray-500 text-xs">Best Daily</div><div className="text-rose-400 font-bold">{stats.bestDaily}</div></div>
              <div><div className="text-gray-500 text-xs">Avg Accuracy</div><div className="text-white font-bold">{stats.avgAccuracy}%</div></div>
            </div>
          </div>
        )}

        {/* How to Play */}
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5">
          <h3 className="text-white font-bold mb-3">How to Play</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-400">
            <div className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">1.</span>
              <span>See a card with a price threshold — is the actual value OVER or UNDER?</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">2.</span>
              <span>Answer fast — you have 60 seconds for all 20 cards. Remaining time = bonus points.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">3.</span>
              <span>Build streaks for multipliers: 2 in a row = 1.5x, 3 = 2x, 5+ = 3x!</span>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-3">Keyboard: A/Left Arrow = UNDER | D/Right Arrow = OVER</p>
        </div>
      </div>
    );
  }

  // ── Playing ────────────────────────────────────────────────────────────────
  if (gameState === 'playing' && currentIdx < rounds.length) {
    const round = rounds[currentIdx];
    const timerPct = (timeLeft / TIME_LIMIT) * 100;
    const multiplier = streak > 0 ? Math.min(3, 1 + (streak - 1) * 0.5) : 1;

    return (
      <div className="space-y-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-white font-bold">{currentIdx + 1}/{TOTAL_CARDS}</span>
            <span className="text-gray-400 text-sm">Score: <span className="text-white font-bold">{score}</span></span>
          </div>
          <div className="flex items-center gap-4">
            {streak > 1 && <span className="text-amber-400 text-sm font-bold">{multiplier}x Streak!</span>}
            <span className={`font-mono font-bold text-lg ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : timeLeft <= 20 ? 'text-amber-400' : 'text-white'}`}>
              {timeLeft}s
            </span>
          </div>
        </div>

        {/* Timer Bar */}
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 rounded-full ${timerPct > 50 ? 'bg-emerald-500' : timerPct > 20 ? 'bg-amber-500' : 'bg-red-500'}`}
            style={{ width: `${timerPct}%` }}
          />
        </div>

        {/* Card Display */}
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 text-center">
          <span className={`text-xs font-bold ${sportColors[round.card.sport] ?? 'text-gray-400'}`}>{round.card.sport.toUpperCase()}</span>
          <h2 className="text-xl font-bold text-white mt-1">{round.card.name}</h2>
          <p className="text-gray-400 text-sm mt-1">{round.card.player} &middot; {round.card.year} &middot; {round.card.set}</p>

          <div className="mt-6 mb-2">
            <p className="text-gray-500 text-sm mb-1">Is this card worth...</p>
            <p className="text-3xl font-bold text-white">${round.threshold.toLocaleString()}</p>
          </div>
        </div>

        {/* Answer Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleAnswer('under')}
            className="bg-gradient-to-br from-red-900/40 to-red-800/20 border border-red-700/50 hover:border-red-500/70 rounded-xl py-6 text-center transition-colors"
          >
            <div className="text-3xl mb-1">👇</div>
            <div className="text-red-400 font-bold text-lg">UNDER</div>
            <div className="text-gray-500 text-xs mt-1">A / Left Arrow</div>
          </button>
          <button
            onClick={() => handleAnswer('over')}
            className="bg-gradient-to-br from-emerald-900/40 to-emerald-800/20 border border-emerald-700/50 hover:border-emerald-500/70 rounded-xl py-6 text-center transition-colors"
          >
            <div className="text-3xl mb-1">👆</div>
            <div className="text-emerald-400 font-bold text-lg">OVER</div>
            <div className="text-gray-500 text-xs mt-1">D / Right Arrow</div>
          </button>
        </div>

        {/* Progress Dots */}
        <div className="flex gap-1 justify-center flex-wrap">
          {rounds.map((r, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full ${
                i === currentIdx ? 'bg-white' :
                r.correct === true ? 'bg-emerald-500' :
                r.correct === false ? 'bg-red-500' :
                'bg-gray-700'
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  // ── Results ────────────────────────────────────────────────────────────────
  if (gameState === 'results') {
    const answered = rounds.filter(r => r.answer !== null);
    const correct = rounds.filter(r => r.correct === true).length;
    const accuracy = answered.length > 0 ? Math.round((correct / answered.length) * 100) : 0;
    const { grade, color } = getGrade(score);
    const timeBonus = timeLeft * 5;

    return (
      <div className="space-y-6">
        {/* Score Card */}
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 text-center">
          <div className={`text-6xl font-black ${color} mb-2`}>{grade}</div>
          <div className="text-3xl font-bold text-white mb-1">{score} points</div>
          <p className="text-gray-400">{correct}/{answered.length} correct ({accuracy}%) &middot; Time bonus: +{timeBonus}</p>
          {mode === 'daily' && <p className="text-rose-400 text-sm mt-1">Daily Challenge</p>}
        </div>

        {/* Round-by-round breakdown */}
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5">
          <h3 className="text-white font-bold mb-3">Round Breakdown</h3>
          <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
            {answered.map((r, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-900/40 rounded-lg px-3 py-2 text-xs">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className={`w-2 h-2 rounded-full ${r.correct ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  <span className="text-white truncate">{r.card.player}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-500">Threshold: ${r.threshold}</span>
                  <span className="text-gray-400">Actual: ${r.actualValue}</span>
                  <span className={r.correct ? 'text-emerald-400' : 'text-red-400'}>
                    {r.answer?.toUpperCase()} {r.correct ? '✓' : '✗'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-center">
          <button onClick={shareResults} className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-sm font-medium transition-colors">
            Share Score
          </button>
          <button onClick={() => startGame(mode)} className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors">
            Play Again
          </button>
          <button onClick={() => setGameState('menu')} className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium transition-colors border border-gray-700">
            Menu
          </button>
        </div>

        {/* Card links */}
        <div className="text-center">
          <p className="text-gray-500 text-xs">
            Cards from our database of {sportsCards.length.toLocaleString()} sports cards.{' '}
            <Link href="/sports" className="text-emerald-400 hover:underline">Browse all cards</Link>
          </p>
        </div>
      </div>
    );
  }

  return null;
}
