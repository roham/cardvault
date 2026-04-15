'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { sportsCards, type SportsCard } from '@/data/sports-cards';
import Link from 'next/link';

// ── Helpers ────────────────────────────────────────────────────────────────
function dateHash(): number {
  const d = new Date();
  const str = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  let h = 0;
  for (let i = 0; i < str.length; i++) { h = ((h << 5) - h + str.charCodeAt(i)) | 0; }
  return Math.abs(h);
}

function seededRng(seed: number) {
  let s = seed;
  return () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
}

function shuffleWithSeed<T>(arr: T[], seed: number): T[] {
  const rng = seededRng(seed);
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const sportColors: Record<string, string> = {
  baseball: 'border-rose-500/40 bg-rose-950/20',
  basketball: 'border-orange-500/40 bg-orange-950/20',
  football: 'border-emerald-500/40 bg-emerald-950/20',
  hockey: 'border-sky-500/40 bg-sky-950/20',
};

const sportTextColors: Record<string, string> = {
  baseball: 'text-rose-400',
  basketball: 'text-orange-400',
  football: 'text-emerald-400',
  hockey: 'text-sky-400',
};

const CARDS_PER_ROUND = 7;
const STORAGE_KEY = 'cardvault-timeline-stats';
const DAILY_KEY = 'cardvault-timeline-daily';

interface Stats {
  gamesPlayed: number;
  bestScore: number;
  totalCorrect: number;
  totalCards: number;
  dailyStreak: number;
  lastDailyDate: string;
}

const defaultStats: Stats = { gamesPlayed: 0, bestScore: 0, totalCorrect: 0, totalCards: 0, dailyStreak: 0, lastDailyDate: '' };

type GamePhase = 'menu' | 'playing' | 'results';

// ── Select cards with year spread ──────────────────────────────────────────
function selectCards(seed: number): SportsCard[] {
  const rng = seededRng(seed);
  const validCards = sportsCards.filter(c => c.year && c.year >= 1900 && c.year <= 2025 && (c.sport as string) !== 'pokemon');

  // Group by decade to ensure spread
  const decades: Record<number, SportsCard[]> = {};
  validCards.forEach(c => {
    const dec = Math.floor(c.year / 10) * 10;
    if (!decades[dec]) decades[dec] = [];
    decades[dec].push(c);
  });

  const decadeKeys = Object.keys(decades).map(Number).sort((a, b) => a - b);
  const selected: SportsCard[] = [];
  const usedPlayers = new Set<string>();

  // Pick from different decades for variety
  const shuffledDecades = [...decadeKeys];
  for (let i = shuffledDecades.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffledDecades[i], shuffledDecades[j]] = [shuffledDecades[j], shuffledDecades[i]];
  }

  for (const dec of shuffledDecades) {
    if (selected.length >= CARDS_PER_ROUND) break;
    const pool = decades[dec].filter(c => !usedPlayers.has(c.player));
    if (pool.length === 0) continue;
    const card = pool[Math.floor(rng() * pool.length)];
    selected.push(card);
    usedPlayers.add(card.player);
  }

  // Fill remaining if needed
  while (selected.length < CARDS_PER_ROUND) {
    const pool = validCards.filter(c => !usedPlayers.has(c.player));
    if (pool.length === 0) break;
    const card = pool[Math.floor(rng() * pool.length)];
    selected.push(card);
    usedPlayers.add(card.player);
  }

  return selected;
}

export default function CardTimelineClient() {
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<Stats>(defaultStats);
  const [phase, setPhase] = useState<GamePhase>('menu');
  const [isDaily, setIsDaily] = useState(true);
  const [dailyCompleted, setDailyCompleted] = useState(false);
  const [cards, setCards] = useState<SportsCard[]>([]);
  const [userOrder, setUserOrder] = useState<number[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [startTime, setStartTime] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      if (s) setStats(JSON.parse(s));
      const d = localStorage.getItem(DAILY_KEY);
      if (d) {
        const dailyData = JSON.parse(d);
        const today = new Date().toISOString().slice(0, 10);
        if (dailyData.date === today) setDailyCompleted(true);
      }
    } catch { /* ignore */ }
  }, []);

  const saveStats = useCallback((updated: Stats) => {
    setStats(updated);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
  }, []);

  const startGame = useCallback((daily: boolean) => {
    setIsDaily(daily);
    const seed = daily ? dateHash() : Date.now();
    const selected = selectCards(seed);
    setCards(selected);

    // Correct order is sorted by year
    const correctOrder = [...selected].sort((a, b) => a.year - b.year);
    // Scramble the indices for user to sort
    const scrambled = shuffleWithSeed(
      correctOrder.map((_, i) => i),
      seed + 42
    );
    setUserOrder(scrambled);
    setSelectedIdx(null);
    setStartTime(Date.now());
    setPhase('playing');
  }, []);

  const sortedCards = useMemo(() => {
    if (cards.length === 0) return [];
    return [...cards].sort((a, b) => a.year - b.year);
  }, [cards]);

  const handleSlotClick = (slotIdx: number) => {
    if (phase !== 'playing') return;

    if (selectedIdx === null) {
      setSelectedIdx(slotIdx);
    } else {
      // Swap the two positions
      const newOrder = [...userOrder];
      [newOrder[selectedIdx], newOrder[slotIdx]] = [newOrder[slotIdx], newOrder[selectedIdx]];
      setUserOrder(newOrder);
      setSelectedIdx(null);
    }
  };

  const submitOrder = () => {
    const elapsed = (Date.now() - startTime) / 1000;
    let correct = 0;
    let partialScore = 0;

    userOrder.forEach((cardIdx, position) => {
      if (cardIdx === position) {
        correct++;
        partialScore += 100;
      } else if (Math.abs(cardIdx - position) === 1) {
        partialScore += 30;
      }
    });

    // Speed bonus: up to 300 for finishing under 30s
    const speedBonus = Math.max(0, Math.round(300 * (1 - Math.min(elapsed, 120) / 120)));
    const totalScore = partialScore + speedBonus;

    setScore(totalScore);
    setCorrectCount(correct);

    const today = new Date().toISOString().slice(0, 10);
    const newStats = {
      ...stats,
      gamesPlayed: stats.gamesPlayed + 1,
      bestScore: Math.max(stats.bestScore, totalScore),
      totalCorrect: stats.totalCorrect + correct,
      totalCards: stats.totalCards + CARDS_PER_ROUND,
      dailyStreak: isDaily
        ? (stats.lastDailyDate === new Date(Date.now() - 86400000).toISOString().slice(0, 10) ? stats.dailyStreak + 1 : 1)
        : stats.dailyStreak,
      lastDailyDate: isDaily ? today : stats.lastDailyDate,
    };
    saveStats(newStats);

    if (isDaily) {
      setDailyCompleted(true);
      try { localStorage.setItem(DAILY_KEY, JSON.stringify({ date: today, score: totalScore, correct })); } catch { /* ignore */ }
    }

    setPhase('results');
  };

  const getGrade = (s: number): { grade: string; color: string } => {
    if (s >= 900) return { grade: 'S', color: 'text-yellow-400' };
    if (s >= 750) return { grade: 'A', color: 'text-emerald-400' };
    if (s >= 550) return { grade: 'B', color: 'text-blue-400' };
    if (s >= 350) return { grade: 'C', color: 'text-orange-400' };
    if (s >= 200) return { grade: 'D', color: 'text-red-400' };
    return { grade: 'F', color: 'text-red-500' };
  };

  const shareResults = () => {
    const emoji = userOrder.map((cardIdx, pos) => cardIdx === pos ? '🟩' : Math.abs(cardIdx - pos) === 1 ? '🟨' : '🟥').join('');
    const { grade } = getGrade(score);
    const text = `Card Timeline Challenge ${isDaily ? '(Daily)' : ''}\n${emoji}\nScore: ${score}/1000 (${grade})\n${correctCount}/${CARDS_PER_ROUND} correct\nhttps://cardvault-two.vercel.app/card-timeline`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!mounted) return <div className="h-96 flex items-center justify-center text-gray-500">Loading...</div>;

  // ── Menu Phase ──────────────────────────────────────────────────────────
  if (phase === 'menu') {
    const accuracy = stats.totalCards > 0 ? Math.round((stats.totalCorrect / stats.totalCards) * 100) : 0;
    return (
      <div className="space-y-6">
        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{stats.gamesPlayed}</div>
            <div className="text-xs text-gray-500">Games Played</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-indigo-400">{stats.bestScore}</div>
            <div className="text-xs text-gray-500">Best Score</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{accuracy}%</div>
            <div className="text-xs text-gray-500">Accuracy</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-amber-400">{stats.dailyStreak}</div>
            <div className="text-xs text-gray-500">Daily Streak</div>
          </div>
        </div>

        {/* Game modes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => startGame(true)}
            disabled={dailyCompleted}
            className={`p-6 rounded-xl border text-left transition-colors ${
              dailyCompleted
                ? 'border-gray-700 bg-gray-900/30 opacity-60 cursor-not-allowed'
                : 'border-indigo-600 bg-indigo-950/30 hover:bg-indigo-950/50 cursor-pointer'
            }`}
          >
            <div className="text-2xl mb-2">📅</div>
            <h3 className="text-lg font-bold text-white">Daily Challenge</h3>
            <p className="text-sm text-gray-400 mt-1">Same cards for everyone today. Compare your score!</p>
            {dailyCompleted && <p className="text-xs text-indigo-400 mt-2">Completed today! Come back tomorrow.</p>}
          </button>
          <button
            onClick={() => startGame(false)}
            className="p-6 rounded-xl border border-gray-700 bg-gray-900/30 hover:bg-gray-800/50 text-left transition-colors cursor-pointer"
          >
            <div className="text-2xl mb-2">🎲</div>
            <h3 className="text-lg font-bold text-white">Random Game</h3>
            <p className="text-sm text-gray-400 mt-1">Fresh set of cards each time. Unlimited plays.</p>
          </button>
        </div>

        {/* How to play */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-3">How to Play</h3>
          <div className="space-y-2 text-sm text-gray-400">
            <p>1. You get 7 sports cards in a scrambled order</p>
            <p>2. Tap two cards to swap their positions</p>
            <p>3. Arrange them from oldest (top) to newest (bottom)</p>
            <p>4. Submit when you think the order is correct</p>
            <p>5. Earn points for correct placements + speed bonus</p>
          </div>
          <div className="mt-3 flex gap-3 text-xs text-gray-500">
            <span>🟩 = Correct position (100 pts)</span>
            <span>🟨 = Off by 1 (30 pts)</span>
            <span>🟥 = Wrong (0 pts)</span>
          </div>
        </div>
      </div>
    );
  }

  // ── Playing Phase ───────────────────────────────────────────────────────
  if (phase === 'playing') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-white">
            {isDaily ? 'Daily Challenge' : 'Random Game'} — Arrange Oldest to Newest
          </h2>
          <div className="text-sm text-gray-400">Tap two cards to swap</div>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-1">
          <div className="flex items-center gap-2 px-3 py-2 text-xs text-gray-500 border-b border-gray-800">
            <span>Oldest</span>
            <span className="flex-1 h-px bg-gray-800" />
            <span>Newest</span>
          </div>

          <div className="space-y-2 p-3">
            {userOrder.map((cardIdx, slotIdx) => {
              const card = sortedCards[cardIdx];
              if (!card) return null;
              const sport = (card.sport || '').toLowerCase();
              const isSelected = selectedIdx === slotIdx;
              return (
                <button
                  key={slotIdx}
                  onClick={() => handleSlotClick(slotIdx)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-950/40 ring-2 ring-indigo-500/50'
                      : `${sportColors[sport] || 'border-gray-700 bg-gray-800/50'} hover:border-indigo-400/50`
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-sm font-bold text-gray-400 shrink-0">
                    {slotIdx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{card.name}</div>
                    <div className="text-xs text-gray-500 truncate">{card.player} &middot; {card.set}</div>
                  </div>
                  <div className={`text-xs font-medium px-2 py-1 rounded ${sportTextColors[sport] || 'text-gray-400'}`}>
                    {sport}
                  </div>
                  <div className="text-lg font-bold text-gray-600 tabular-nums">????</div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setPhase('menu')}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-xl transition-colors text-sm"
          >
            Quit
          </button>
          <button
            onClick={submitOrder}
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-colors text-sm"
          >
            Submit Order
          </button>
        </div>
      </div>
    );
  }

  // ── Results Phase ───────────────────────────────────────────────────────
  const { grade, color: gradeColor } = getGrade(score);
  const elapsed = Math.round((Date.now() - startTime) / 1000);

  return (
    <div className="space-y-6">
      {/* Score hero */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-center">
        <div className={`text-6xl font-black ${gradeColor}`}>{grade}</div>
        <div className="text-3xl font-bold text-white mt-2">{score} / 1,000</div>
        <div className="text-sm text-gray-400 mt-1">{correctCount}/{CARDS_PER_ROUND} correct &middot; {elapsed}s</div>

        {/* Emoji grid */}
        <div className="flex justify-center gap-1 mt-4">
          {userOrder.map((cardIdx, pos) => (
            <span key={pos} className="text-2xl">
              {cardIdx === pos ? '🟩' : Math.abs(cardIdx - pos) === 1 ? '🟨' : '🟥'}
            </span>
          ))}
        </div>
      </div>

      {/* Round breakdown */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-white mb-3">Results</h3>
        <div className="space-y-2">
          {sortedCards.map((card, correctPos) => {
            const userPos = userOrder.indexOf(correctPos);
            const isCorrect = userPos === correctPos;
            const isClose = Math.abs(userPos - correctPos) === 1;
            const sport = (card.sport || '').toLowerCase();
            return (
              <div key={correctPos} className={`flex items-center gap-3 p-3 rounded-lg border ${isCorrect ? 'border-emerald-600/40 bg-emerald-950/20' : isClose ? 'border-yellow-600/40 bg-yellow-950/20' : 'border-red-600/40 bg-red-950/20'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${isCorrect ? 'bg-emerald-900 text-emerald-300' : isClose ? 'bg-yellow-900 text-yellow-300' : 'bg-red-900 text-red-300'}`}>
                  {isCorrect ? '✓' : userPos + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{card.name}</div>
                  <div className="text-xs text-gray-500 truncate">{card.player} &middot; {card.set}</div>
                </div>
                <div className={`text-xs font-medium ${sportTextColors[sport] || 'text-gray-400'}`}>{sport}</div>
                <div className="text-lg font-bold text-white tabular-nums">{card.year}</div>
                {!isCorrect && (
                  <div className="text-xs text-gray-500">You: #{userPos + 1}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={shareResults} className="flex-1 py-3 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-colors text-sm">
          {copied ? 'Copied!' : 'Share Results'}
        </button>
        <button onClick={() => startGame(false)} className="flex-1 py-3 px-6 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-xl transition-colors text-sm">
          Play Again (Random)
        </button>
        <button onClick={() => setPhase('menu')} className="py-3 px-6 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-xl transition-colors text-sm">
          Menu
        </button>
      </div>
    </div>
  );
}
