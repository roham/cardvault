'use client';

import { useMemo, useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

/* ───── Utilities ───── */
function dateHash(dateStr: string): number {
  let hash = 0;
  const str = 'cardvault-streak-' + dateStr;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function parseValue(v: string): number {
  const match = v.match(/\$([\d,]+)/);
  if (!match) return 0;
  return parseInt(match[1].replace(/,/g, ''), 10);
}

function formatPrice(n: number): string {
  if (n >= 1000000) return '$' + (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return '$' + (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'K';
  return '$' + n.toLocaleString();
}

function slugifyPlayer(name: string): string {
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const sportIcons: Record<string, string> = { baseball: '\u26be', basketball: '\ud83c\udfc0', football: '\ud83c\udfc8', hockey: '\ud83c\udfd2' };
const sportColors: Record<string, string> = {
  baseball: 'border-red-700/60 bg-red-950/40',
  basketball: 'border-orange-700/60 bg-orange-950/40',
  football: 'border-green-700/60 bg-green-950/40',
  hockey: 'border-blue-700/60 bg-blue-950/40',
};

interface CardItem {
  name: string;
  player: string;
  sport: string;
  year: number;
  set: string;
  value: number;
  valueStr: string;
  rookie: boolean;
}

const STORAGE_KEY = 'cardvault-streak-stats';

interface StreakStats {
  bestStreak: number;
  totalGames: number;
  totalCorrect: number;
  lastPlayedDate: string;
  dailyStreak: number;
  dailyBest: number;
}

function loadStats(): StreakStats {
  if (typeof window === 'undefined') return { bestStreak: 0, totalGames: 0, totalCorrect: 0, lastPlayedDate: '', dailyStreak: 0, dailyBest: 0 };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* noop */ }
  return { bestStreak: 0, totalGames: 0, totalCorrect: 0, lastPlayedDate: '', dailyStreak: 0, dailyBest: 0 };
}

function saveStats(stats: StreakStats) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(stats)); } catch { /* noop */ }
}

export default function CardStreakClient() {
  /* ───── Build card pool (cards with parseable values > $1) ───── */
  const cardPool = useMemo(() => {
    return sportsCards
      .map(c => ({ name: c.name, player: c.player, sport: c.sport, year: c.year, set: c.set, value: parseValue(c.estimatedValueRaw), valueStr: c.estimatedValueRaw, rookie: c.rookie }))
      .filter(c => c.value > 1);
  }, []);

  /* ───── Daily mode: deterministic card sequence ───── */
  const today = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const dailySequence = useMemo(() => {
    const rng = seededRng(dateHash(today));
    const indices: number[] = [];
    const used = new Set<number>();
    while (indices.length < Math.min(50, cardPool.length)) {
      const idx = Math.floor(rng() * cardPool.length);
      if (!used.has(idx)) { used.add(idx); indices.push(idx); }
    }
    return indices.map(i => cardPool[i]);
  }, [cardPool, today]);

  /* ───── State ───── */
  const [mode, setMode] = useState<'menu' | 'daily' | 'endless'>('menu');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [endlessPool, setEndlessPool] = useState<CardItem[]>([]);
  const [stats, setStats] = useState<StreakStats>(loadStats);
  const [animating, setAnimating] = useState(false);

  /* ───── Card sequence based on mode ───── */
  const sequence = mode === 'daily' ? dailySequence : endlessPool;
  const currentCard = sequence[currentIndex];
  const nextCard = sequence[currentIndex + 1];

  /* ───── Start Endless mode ───── */
  const startEndless = useCallback(() => {
    const shuffled = [...cardPool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setEndlessPool(shuffled);
    setCurrentIndex(0);
    setStreak(0);
    setGameOver(false);
    setShowResult(false);
    setLastCorrect(null);
    setMode('endless');
  }, [cardPool]);

  const startDaily = useCallback(() => {
    setCurrentIndex(0);
    setStreak(0);
    setGameOver(false);
    setShowResult(false);
    setLastCorrect(null);
    setMode('daily');
  }, []);

  /* ───── Handle guess ───── */
  const handleGuess = useCallback((guess: 'higher' | 'lower') => {
    if (!currentCard || !nextCard || animating) return;

    const isHigher = nextCard.value >= currentCard.value;
    const isCorrect = (guess === 'higher' && isHigher) || (guess === 'lower' && !isHigher);

    setAnimating(true);
    setShowResult(true);
    setLastCorrect(isCorrect);

    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);

      setTimeout(() => {
        setShowResult(false);
        setCurrentIndex(prev => prev + 1);
        setAnimating(false);

        // Check if we ran out of cards
        if (currentIndex + 2 >= sequence.length) {
          setGameOver(true);
          updateStats(newStreak);
        }
      }, 1200);
    } else {
      setTimeout(() => {
        setGameOver(true);
        updateStats(streak);
        setAnimating(false);
      }, 1500);
    }
  }, [currentCard, nextCard, animating, streak, currentIndex, sequence.length]);

  /* ───── Update stats ───── */
  const updateStats = useCallback((finalStreak: number) => {
    setStats(prev => {
      const newStats: StreakStats = {
        ...prev,
        totalGames: prev.totalGames + 1,
        totalCorrect: prev.totalCorrect + finalStreak,
        bestStreak: Math.max(prev.bestStreak, finalStreak),
        lastPlayedDate: today,
        dailyStreak: mode === 'daily' ? finalStreak : prev.dailyStreak,
        dailyBest: mode === 'daily' ? Math.max(prev.dailyBest, finalStreak) : prev.dailyBest,
      };
      saveStats(newStats);
      return newStats;
    });
  }, [today, mode]);

  /* ───── Share results ───── */
  const shareText = useMemo(() => {
    const modeLabel = mode === 'daily' ? 'Daily' : 'Endless';
    return `Card Streak ${modeLabel}: ${streak} in a row! ${streak >= 15 ? '🔥🔥🔥' : streak >= 10 ? '🔥🔥' : streak >= 5 ? '🔥' : '📈'}\n${'🟢'.repeat(Math.min(streak, 20))}${'🔴'}\nhttps://cardvault-two.vercel.app/card-streak`;
  }, [mode, streak]);

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({ text: shareText }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText).catch(() => {});
    }
  }, [shareText]);

  /* ───── Grade ───── */
  const grade = useMemo(() => {
    if (streak >= 20) return { letter: 'S', title: 'Market Genius', color: 'text-purple-400' };
    if (streak >= 15) return { letter: 'A', title: 'Sharp Trader', color: 'text-emerald-400' };
    if (streak >= 10) return { letter: 'B', title: 'Savvy Collector', color: 'text-blue-400' };
    if (streak >= 5) return { letter: 'C', title: 'Decent Eye', color: 'text-yellow-400' };
    if (streak >= 2) return { letter: 'D', title: 'Getting Warmer', color: 'text-gray-400' };
    return { letter: 'F', title: 'Study Up', color: 'text-red-400' };
  }, [streak]);

  /* ───── Render: Menu ───── */
  if (mode === 'menu') {
    return (
      <div className="space-y-8">
        {/* Stats overview */}
        {stats.totalGames > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-gray-900/60 border border-gray-800/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-white">{stats.bestStreak}</div>
              <div className="text-xs text-gray-400">Best Streak</div>
            </div>
            <div className="bg-gray-900/60 border border-gray-800/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-white">{stats.totalGames}</div>
              <div className="text-xs text-gray-400">Games Played</div>
            </div>
            <div className="bg-gray-900/60 border border-gray-800/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-white">{stats.totalGames > 0 ? (stats.totalCorrect / stats.totalGames).toFixed(1) : '0'}</div>
              <div className="text-xs text-gray-400">Avg Streak</div>
            </div>
            <div className="bg-gray-900/60 border border-gray-800/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-white">{stats.dailyBest}</div>
              <div className="text-xs text-gray-400">Daily Best</div>
            </div>
          </div>
        )}

        {/* Mode selection */}
        <div className="grid gap-4 sm:grid-cols-2">
          <button onClick={startDaily} className="bg-gradient-to-br from-emerald-900/60 to-green-900/40 border border-emerald-700/50 hover:border-emerald-500/70 rounded-xl p-6 text-left transition-all group">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">📅</span>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">Daily Challenge</h3>
                <p className="text-xs text-emerald-400">Same cards for everyone today</p>
              </div>
            </div>
            <p className="text-sm text-gray-400">Everyone gets the same 50-card sequence. Compare your streak with friends. Resets at midnight.</p>
          </button>

          <button onClick={startEndless} className="bg-gradient-to-br from-purple-900/60 to-indigo-900/40 border border-purple-700/50 hover:border-purple-500/70 rounded-xl p-6 text-left transition-all group">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">♾️</span>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">Endless Mode</h3>
                <p className="text-xs text-purple-400">Random cards, no limit</p>
              </div>
            </div>
            <p className="text-sm text-gray-400">Random card sequence from {cardPool.length.toLocaleString()}+ cards. How long can you keep the streak alive?</p>
          </button>
        </div>

        {/* How to play */}
        <div className="bg-gray-900/40 border border-gray-800/50 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-3">How to Play</h3>
          <div className="space-y-3 text-sm text-gray-400">
            <div className="flex gap-3"><span className="text-emerald-400 font-bold shrink-0">1.</span> You see a card with its estimated value.</div>
            <div className="flex gap-3"><span className="text-emerald-400 font-bold shrink-0">2.</span> A mystery card appears next to it. Is it worth <span className="text-emerald-400 font-medium">MORE</span> or <span className="text-red-400 font-medium">LESS</span>?</div>
            <div className="flex gap-3"><span className="text-emerald-400 font-bold shrink-0">3.</span> Guess correctly to extend your streak. One wrong answer and it&apos;s game over.</div>
            <div className="flex gap-3"><span className="text-emerald-400 font-bold shrink-0">4.</span> The longer your streak, the higher your grade. Beat your personal best!</div>
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/price-is-right" className="text-blue-400 hover:text-blue-300">Price is Right</Link>
          <span className="text-gray-600">|</span>
          <Link href="/grade-or-fade" className="text-blue-400 hover:text-blue-300">Grade or Fade</Link>
          <span className="text-gray-600">|</span>
          <Link href="/guess-the-card" className="text-blue-400 hover:text-blue-300">Guess the Card</Link>
          <span className="text-gray-600">|</span>
          <Link href="/trivia" className="text-blue-400 hover:text-blue-300">Daily Trivia</Link>
          <span className="text-gray-600">|</span>
          <Link href="/tools" className="text-blue-400 hover:text-blue-300">All Tools</Link>
        </div>
      </div>
    );
  }

  /* ───── Render: Game Over ───── */
  if (gameOver) {
    return (
      <div className="space-y-6">
        {/* Result header */}
        <div className="text-center space-y-3">
          <div className={`text-6xl font-black ${grade.color}`}>{grade.letter}</div>
          <div className="text-lg text-gray-300">{grade.title}</div>
          <div className="text-4xl font-bold text-white">
            {streak} {streak === 1 ? 'Card' : 'Cards'} Streak
            {streak >= 10 && <span className="ml-2">🔥</span>}
          </div>
          {streak > stats.bestStreak && (
            <div className="text-emerald-400 font-semibold animate-pulse">New Personal Best!</div>
          )}
        </div>

        {/* The wrong answer */}
        {lastCorrect === false && currentCard && nextCard && (
          <div className="bg-red-950/30 border border-red-800/40 rounded-xl p-4 text-center">
            <p className="text-red-400 text-sm mb-2">The streak breaker:</p>
            <p className="text-white font-medium">{nextCard.name}</p>
            <p className="text-lg font-bold text-white">{formatPrice(nextCard.value)}</p>
            <p className="text-gray-400 text-xs mt-1">
              {nextCard.value >= currentCard.value ? 'Higher' : 'Lower'} than {currentCard.name} ({formatPrice(currentCard.value)})
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-gray-900/60 border border-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-white">{streak}</div>
            <div className="text-xs text-gray-400">This Game</div>
          </div>
          <div className="bg-gray-900/60 border border-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-emerald-400">{stats.bestStreak}</div>
            <div className="text-xs text-gray-400">All-Time Best</div>
          </div>
          <div className="bg-gray-900/60 border border-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-white">{stats.totalGames}</div>
            <div className="text-xs text-gray-400">Games Played</div>
          </div>
          <div className="bg-gray-900/60 border border-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-white">{stats.totalGames > 0 ? (stats.totalCorrect / stats.totalGames).toFixed(1) : '0'}</div>
            <div className="text-xs text-gray-400">Avg Streak</div>
          </div>
        </div>

        {/* Share */}
        <div className="bg-gray-900/40 border border-gray-800/50 rounded-xl p-4">
          <p className="text-sm text-gray-400 mb-2">Share your result:</p>
          <pre className="text-sm text-white bg-gray-950 rounded p-3 mb-3 whitespace-pre-wrap">{shareText}</pre>
          <button onClick={handleShare} className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors">
            Share Result
          </button>
        </div>

        {/* Action buttons */}
        <div className="grid gap-3 sm:grid-cols-2">
          {mode === 'endless' && (
            <button onClick={startEndless} className="py-3 bg-purple-700 hover:bg-purple-600 text-white font-semibold rounded-lg transition-colors">
              Play Endless Again
            </button>
          )}
          <button onClick={() => setMode('menu')} className="py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors">
            Back to Menu
          </button>
        </div>

        {/* Links */}
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/price-is-right" className="text-blue-400 hover:text-blue-300">Price is Right</Link>
          <span className="text-gray-600">|</span>
          <Link href="/grade-or-fade" className="text-blue-400 hover:text-blue-300">Grade or Fade</Link>
          <span className="text-gray-600">|</span>
          <Link href="/guess-the-card" className="text-blue-400 hover:text-blue-300">Guess the Card</Link>
          <span className="text-gray-600">|</span>
          <Link href="/daily-challenges" className="text-blue-400 hover:text-blue-300">Daily Challenges</Link>
        </div>
      </div>
    );
  }

  /* ───── Render: Playing ───── */
  if (!currentCard || !nextCard) return null;

  return (
    <div className="space-y-6">
      {/* Streak counter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-950/60 border border-emerald-800/50 rounded-lg px-4 py-2">
            <span className="text-emerald-400 font-bold text-xl">{streak}</span>
            <span className="text-emerald-400/70 text-sm ml-1.5">streak</span>
          </div>
          {streak >= 5 && <span className="text-xl">{streak >= 15 ? '🔥🔥🔥' : streak >= 10 ? '🔥🔥' : '🔥'}</span>}
        </div>
        <div className="text-sm text-gray-500">
          Card {currentIndex + 1} of {sequence.length}
        </div>
      </div>

      {/* Card comparison area */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Current card (known) */}
        <div className={`rounded-xl border p-5 ${sportColors[currentCard.sport] || 'border-gray-700/50 bg-gray-900/40'}`}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">{sportIcons[currentCard.sport] || '🃏'}</span>
            <span className="text-xs text-gray-400 uppercase tracking-wider">{currentCard.sport}</span>
            {currentCard.rookie && <span className="text-xs bg-amber-700/50 text-amber-300 px-1.5 py-0.5 rounded">RC</span>}
          </div>
          <h3 className="text-lg font-bold text-white mb-1 leading-tight">{currentCard.name}</h3>
          <Link href={`/players/${slugifyPlayer(currentCard.player)}`} className="text-sm text-blue-400 hover:text-blue-300">
            {currentCard.player}
          </Link>
          <div className="mt-3 text-3xl font-black text-white">{formatPrice(currentCard.value)}</div>
          <div className="text-xs text-gray-500 mt-1">{currentCard.set} &middot; {currentCard.year}</div>
        </div>

        {/* Mystery card */}
        <div className={`rounded-xl border p-5 relative overflow-hidden ${showResult ? (sportColors[nextCard.sport] || 'border-gray-700/50 bg-gray-900/40') : 'border-gray-700/50 bg-gray-900/60'}`}>
          {showResult ? (
            <>
              {/* Revealed card */}
              <div className={`absolute inset-0 ${lastCorrect ? 'bg-emerald-500/10' : 'bg-red-500/10'} transition-all duration-300`} />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{sportIcons[nextCard.sport] || '🃏'}</span>
                  <span className="text-xs text-gray-400 uppercase tracking-wider">{nextCard.sport}</span>
                  {nextCard.rookie && <span className="text-xs bg-amber-700/50 text-amber-300 px-1.5 py-0.5 rounded">RC</span>}
                </div>
                <h3 className="text-lg font-bold text-white mb-1 leading-tight">{nextCard.name}</h3>
                <p className="text-sm text-gray-400">{nextCard.player}</p>
                <div className="mt-3 text-3xl font-black text-white">{formatPrice(nextCard.value)}</div>
                <div className="text-xs text-gray-500 mt-1">{nextCard.set} &middot; {nextCard.year}</div>
                <div className={`mt-3 text-center text-lg font-bold ${lastCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                  {lastCorrect ? '✓ Correct!' : '✗ Wrong!'}
                </div>
              </div>
            </>
          ) : (
            /* Mystery card (hidden) */
            <div className="flex flex-col items-center justify-center h-full min-h-[200px]">
              <div className="text-5xl mb-3 opacity-30">❓</div>
              <p className="text-gray-400 font-medium text-center">Is this card worth more or less?</p>
              <p className="text-gray-600 text-xs mt-2 text-center">Compared to {formatPrice(currentCard.value)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Higher / Lower buttons */}
      {!showResult && (
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleGuess('higher')}
            disabled={animating}
            className="py-4 bg-gradient-to-br from-emerald-700 to-emerald-800 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 text-white font-bold text-lg rounded-xl transition-all active:scale-95 border border-emerald-600/50"
          >
            <span className="text-2xl block mb-1">↑</span>
            Higher
          </button>
          <button
            onClick={() => handleGuess('lower')}
            disabled={animating}
            className="py-4 bg-gradient-to-br from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 disabled:opacity-50 text-white font-bold text-lg rounded-xl transition-all active:scale-95 border border-red-600/50"
          >
            <span className="text-2xl block mb-1">↓</span>
            Lower
          </button>
        </div>
      )}

      {/* Progress */}
      {streak > 0 && (
        <div className="flex gap-0.5 justify-center flex-wrap">
          {Array.from({ length: streak }).map((_, i) => (
            <div key={i} className="w-3 h-3 rounded-full bg-emerald-500" />
          ))}
          {!gameOver && <div className="w-3 h-3 rounded-full bg-gray-700 animate-pulse" />}
        </div>
      )}

      {/* Quit button */}
      <div className="text-center">
        <button onClick={() => { setGameOver(true); updateStats(streak); }} className="text-sm text-gray-500 hover:text-gray-400 transition-colors">
          End Game
        </button>
      </div>
    </div>
  );
}
