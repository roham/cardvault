'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

const SPORT_ICONS: Record<string, string> = {
  baseball: '⚾', basketball: '🏀', football: '🏈', hockey: '🏒',
};
const SPORT_COLORS: Record<string, string> = {
  baseball: 'text-red-400', basketball: 'text-orange-400', football: 'text-blue-400', hockey: 'text-cyan-400',
};

function seededRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xFFFFFFFF;
    return (s >>> 0) / 0xFFFFFFFF;
  };
}

function parseValue(raw: string): number {
  const m = raw.match(/\$(\d[\d,]*)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 5;
}

function dateHash(): number {
  const now = new Date();
  return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
}

type ScoringCategory = {
  name: string;
  description: string;
  points: number;
  icon: string;
  check: (cards: typeof sportsCards[number][]) => boolean;
};

const SCORING_CATEGORIES: ScoringCategory[] = [
  { name: 'Rookie Rush', description: 'All 5 cards are rookie cards', points: 100, icon: '🌟',
    check: (cards) => cards.every(c => c.rookie) },
  { name: 'Full Team', description: 'All 5 cards from the same team/set', points: 90, icon: '👥',
    check: (cards) => { const sets = new Set(cards.map(c => c.set)); return sets.size === 1; } },
  { name: 'Full Sport', description: 'All 5 cards from the same sport', points: 80, icon: '🏆',
    check: (cards) => { const sports = new Set(cards.map(c => c.sport)); return sports.size === 1; } },
  { name: 'High Roller', description: 'Total hand value over $500', points: 70, icon: '💰',
    check: (cards) => cards.reduce((sum, c) => sum + parseValue(c.estimatedValueRaw), 0) > 500 },
  { name: 'Decade Match', description: 'All 5 cards from the same decade', points: 60, icon: '📅',
    check: (cards) => { const decades = new Set(cards.map(c => Math.floor(c.year / 10))); return decades.size === 1; } },
  { name: 'Triple', description: '3 or more cards of the same player', points: 50, icon: '🃏',
    check: (cards) => {
      const counts = new Map<string, number>();
      cards.forEach(c => counts.set(c.player, (counts.get(c.player) || 0) + 1));
      return [...counts.values()].some(v => v >= 3);
    } },
  { name: 'Value Run', description: '5 cards in ascending value order', points: 45, icon: '📈',
    check: (cards) => {
      const vals = cards.map(c => parseValue(c.estimatedValueRaw));
      return vals.every((v, i) => i === 0 || v >= vals[i - 1]) && new Set(vals).size >= 4;
    } },
  { name: 'Two Pair', description: '2 different pairs of same-player cards', points: 40, icon: '✌️',
    check: (cards) => {
      const counts = new Map<string, number>();
      cards.forEach(c => counts.set(c.player, (counts.get(c.player) || 0) + 1));
      return [...counts.values()].filter(v => v >= 2).length >= 2;
    } },
  { name: 'Pair', description: '2 cards of the same player', points: 25, icon: '🤝',
    check: (cards) => {
      const counts = new Map<string, number>();
      cards.forEach(c => counts.set(c.player, (counts.get(c.player) || 0) + 1));
      return [...counts.values()].some(v => v >= 2);
    } },
  { name: 'Mixed Bag', description: 'Cards from 4+ different sports', points: 20, icon: '🎲',
    check: (cards) => new Set(cards.map(c => c.sport)).size >= 4 },
];

function scoreHand(cards: typeof sportsCards[number][]): { category: ScoringCategory; bonus: number } {
  const baseValue = cards.reduce((sum, c) => sum + parseValue(c.estimatedValueRaw), 0);
  const bonus = Math.floor(baseValue / 50); // +1 point per $50 of hand value

  for (const cat of SCORING_CATEGORIES) {
    if (cat.check(cards)) {
      return { category: cat, bonus };
    }
  }
  return { category: { name: 'Junk Hand', description: 'No matching pattern', points: 5, icon: '😐', check: () => true }, bonus };
}

function getGrade(total: number): { grade: string; color: string } {
  if (total >= 100) return { grade: 'S', color: 'text-yellow-400' };
  if (total >= 80) return { grade: 'A', color: 'text-green-400' };
  if (total >= 60) return { grade: 'B', color: 'text-blue-400' };
  if (total >= 40) return { grade: 'C', color: 'text-orange-400' };
  if (total >= 20) return { grade: 'D', color: 'text-red-400' };
  return { grade: 'F', color: 'text-gray-400' };
}

const STORAGE_KEY = 'cardvault-yahtzee-stats';

interface Stats {
  gamesPlayed: number;
  totalScore: number;
  bestScore: number;
  bestCategory: string;
  currentStreak: number;
  lastDate: string;
}

function loadStats(): Stats {
  if (typeof window === 'undefined') return { gamesPlayed: 0, totalScore: 0, bestScore: 0, bestCategory: '', currentStreak: 0, lastDate: '' };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { gamesPlayed: 0, totalScore: 0, bestScore: 0, bestCategory: '', currentStreak: 0, lastDate: '' };
  } catch { return { gamesPlayed: 0, totalScore: 0, bestScore: 0, bestCategory: '', currentStreak: 0, lastDate: '' }; }
}

function saveStats(s: Stats) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
}

export default function CardYahtzeeClient() {
  const [mode, setMode] = useState<'daily' | 'random'>('daily');
  const [hand, setHand] = useState<typeof sportsCards[number][]>([]);
  const [held, setHeld] = useState<boolean[]>([false, false, false, false, false]);
  const [rollsLeft, setRollsLeft] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [scored, setScored] = useState<ReturnType<typeof scoreHand> | null>(null);
  const [stats, setStats] = useState<Stats>({ gamesPlayed: 0, totalScore: 0, bestScore: 0, bestCategory: '', currentStreak: 0, lastDate: '' });
  const [mounted, setMounted] = useState(false);
  const [rolling, setRolling] = useState(false);

  useEffect(() => {
    setMounted(true);
    setStats(loadStats());
  }, []);

  const eligible = useMemo(() => sportsCards.filter(c => parseValue(c.estimatedValueRaw) >= 3), []);

  const roll = useCallback(() => {
    if (rollsLeft <= 0) return;

    setRolling(true);
    setTimeout(() => {
      const seed = mode === 'daily'
        ? dateHash() * 1000 + (3 - rollsLeft) * 100 + held.filter(Boolean).length
        : Date.now() + Math.random() * 10000;
      const rng = seededRng(Math.floor(seed));

      const newHand = hand.length === 0 ? Array(5).fill(null) : [...hand];
      for (let i = 0; i < 5; i++) {
        if (!held[i] || hand.length === 0) {
          const idx = Math.floor(rng() * eligible.length);
          newHand[i] = eligible[idx];
        }
      }

      setHand(newHand);
      setRollsLeft(prev => prev - 1);
      setRolling(false);
    }, 400);
  }, [rollsLeft, hand, held, eligible, mode]);

  const toggleHold = (idx: number) => {
    if (gameOver || rollsLeft >= 3 || rollsLeft <= 0) return;
    setHeld(prev => {
      const next = [...prev];
      next[idx] = !next[idx];
      return next;
    });
  };

  const stand = useCallback(() => {
    if (hand.length === 0) return;
    const result = scoreHand(hand);
    setScored(result);
    setGameOver(true);

    const total = result.category.points + result.bonus;
    const today = new Date().toDateString();
    const newStats = { ...loadStats() };
    newStats.gamesPlayed++;
    newStats.totalScore += total;
    if (total > newStats.bestScore) {
      newStats.bestScore = total;
      newStats.bestCategory = result.category.name;
    }
    if (newStats.lastDate === today) {
      // already played today
    } else {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      newStats.currentStreak = newStats.lastDate === yesterday ? newStats.currentStreak + 1 : 1;
    }
    newStats.lastDate = today;
    saveStats(newStats);
    setStats(newStats);
  }, [hand]);

  const newGame = () => {
    setHand([]);
    setHeld([false, false, false, false, false]);
    setRollsLeft(3);
    setGameOver(false);
    setScored(null);
    if (mode === 'daily') setMode('random');
  };

  const shareResult = () => {
    if (!scored) return;
    const total = scored.category.points + scored.bonus;
    const grade = getGrade(total);
    const text = `Card Yahtzee ${mode === 'daily' ? 'Daily' : 'Random'}\n${scored.category.icon} ${scored.category.name} — ${total} pts (Grade: ${grade.grade})\n${hand.map(c => `${SPORT_ICONS[c.sport]} ${c.player}`).join('\n')}\nhttps://cardvault-two.vercel.app/card-yahtzee`;
    navigator.clipboard.writeText(text).catch(() => {});
  };

  const handValue = hand.length > 0 ? hand.reduce((s, c) => s + parseValue(c.estimatedValueRaw), 0) : 0;

  return (
    <div>
      {/* Stats Bar */}
      {mounted && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-white">{stats.gamesPlayed}</div>
            <div className="text-xs text-gray-400">Games Played</div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-yellow-400">{stats.bestScore}</div>
            <div className="text-xs text-gray-400">Best Score</div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-400">{stats.gamesPlayed > 0 ? Math.round(stats.totalScore / stats.gamesPlayed) : 0}</div>
            <div className="text-xs text-gray-400">Avg Score</div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-400">{stats.currentStreak}</div>
            <div className="text-xs text-gray-400">Day Streak</div>
          </div>
        </div>
      )}

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => { setMode('daily'); setHand([]); setHeld([false,false,false,false,false]); setRollsLeft(3); setGameOver(false); setScored(null); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'daily' ? 'bg-yellow-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
          Daily Challenge
        </button>
        <button onClick={() => { setMode('random'); setHand([]); setHeld([false,false,false,false,false]); setRollsLeft(3); setGameOver(false); setScored(null); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'random' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
          Random Game
        </button>
      </div>

      {/* Hand Display */}
      <div className="grid grid-cols-5 gap-2 sm:gap-3 mb-6">
        {[0, 1, 2, 3, 4].map(i => {
          const card = hand[i];
          const isHeld = held[i];
          return (
            <button key={i} onClick={() => toggleHold(i)}
              disabled={hand.length === 0 || gameOver || rollsLeft >= 3 || rollsLeft <= 0}
              className={`relative rounded-lg border-2 transition-all p-2 sm:p-3 text-left min-h-[120px] sm:min-h-[160px] ${
                card
                  ? isHeld
                    ? 'border-yellow-500 bg-yellow-950/30 shadow-lg shadow-yellow-900/20'
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-500'
                  : rolling
                    ? 'border-gray-600 bg-gray-800/80 animate-pulse'
                    : 'border-gray-800 bg-gray-900/50'
              }`}>
              {card ? (
                <>
                  {isHeld && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded">
                      HOLD
                    </div>
                  )}
                  <div className={`text-lg sm:text-xl ${SPORT_COLORS[card.sport]}`}>{SPORT_ICONS[card.sport]}</div>
                  <div className="text-xs sm:text-sm font-semibold text-white mt-1 line-clamp-2">{card.player}</div>
                  <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5">{card.year}</div>
                  <div className="text-[10px] sm:text-xs text-green-400 mt-0.5">${parseValue(card.estimatedValueRaw)}</div>
                  {card.rookie && <div className="text-[10px] text-yellow-400 mt-0.5">RC</div>}
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-2xl text-gray-700">
                  {rolling ? '🎲' : '?'}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Hand Info */}
      {hand.length > 0 && !gameOver && (
        <div className="text-center text-sm text-gray-400 mb-4">
          Hand Value: <span className="text-green-400 font-bold">${handValue}</span>
          {rollsLeft < 3 && rollsLeft > 0 && <span className="ml-3">Tap cards to hold, then reroll</span>}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center gap-3 mb-8">
        {!gameOver && (
          <>
            <button onClick={roll} disabled={rollsLeft <= 0 || rolling}
              className={`px-6 py-3 rounded-lg font-bold text-lg transition-all ${
                rollsLeft > 0 && !rolling
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-800 text-gray-600 cursor-not-allowed'
              }`}>
              {hand.length === 0 ? '🎲 Roll Cards' : `🎲 Reroll (${rollsLeft} left)`}
            </button>
            {hand.length > 0 && (
              <button onClick={stand}
                className="px-6 py-3 rounded-lg font-bold text-lg bg-green-600 hover:bg-green-500 text-white shadow-lg transition-all">
                ✅ Stand
              </button>
            )}
          </>
        )}
        {gameOver && (
          <button onClick={newGame}
            className="px-6 py-3 rounded-lg font-bold text-lg bg-purple-600 hover:bg-purple-500 text-white shadow-lg transition-all">
            🔄 New Game
          </button>
        )}
      </div>

      {/* Score Result */}
      {scored && gameOver && (
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 mb-8 text-center">
          <div className="text-4xl mb-2">{scored.category.icon}</div>
          <div className="text-2xl font-bold text-white mb-1">{scored.category.name}</div>
          <div className="text-sm text-gray-400 mb-3">{scored.category.description}</div>

          <div className="flex justify-center gap-6 mb-4">
            <div>
              <div className="text-sm text-gray-500">Category</div>
              <div className="text-2xl font-bold text-blue-400">{scored.category.points}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Value Bonus</div>
              <div className="text-2xl font-bold text-green-400">+{scored.bonus}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Total</div>
              <div className={`text-3xl font-bold ${getGrade(scored.category.points + scored.bonus).color}`}>
                {scored.category.points + scored.bonus}
              </div>
            </div>
          </div>

          <div className={`text-5xl font-black ${getGrade(scored.category.points + scored.bonus).color}`}>
            Grade: {getGrade(scored.category.points + scored.bonus).grade}
          </div>

          <button onClick={shareResult}
            className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors">
            📋 Copy Results
          </button>
        </div>
      )}

      {/* Scoring Guide */}
      <section className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-bold text-white mb-4">Scoring Guide</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {SCORING_CATEGORIES.map(cat => (
            <div key={cat.name} className="flex items-start gap-3 bg-black/20 rounded-lg p-3">
              <span className="text-xl">{cat.icon}</span>
              <div>
                <div className="font-semibold text-white text-sm">{cat.name} <span className="text-yellow-400 ml-1">+{cat.points}</span></div>
                <div className="text-xs text-gray-400">{cat.description}</div>
              </div>
            </div>
          ))}
          <div className="flex items-start gap-3 bg-black/20 rounded-lg p-3">
            <span className="text-xl">💵</span>
            <div>
              <div className="font-semibold text-white text-sm">Value Bonus <span className="text-green-400 ml-1">+1 per $50</span></div>
              <div className="text-xs text-gray-400">Bonus points based on total hand value</div>
            </div>
          </div>
        </div>
      </section>

      {/* How to Play */}
      <section className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-6">
        <h2 className="text-lg font-bold text-white mb-3">How to Play</h2>
        <ol className="space-y-2 text-sm text-gray-300">
          <li className="flex items-start gap-2"><span className="text-yellow-400 font-bold">1.</span> Roll 5 random cards from the 7,500+ card database</li>
          <li className="flex items-start gap-2"><span className="text-yellow-400 font-bold">2.</span> Tap cards you want to HOLD — they stay for your next roll</li>
          <li className="flex items-start gap-2"><span className="text-yellow-400 font-bold">3.</span> Reroll unheld cards up to 2 more times (3 rolls total)</li>
          <li className="flex items-start gap-2"><span className="text-yellow-400 font-bold">4.</span> Click Stand when you are satisfied with your hand</li>
          <li className="flex items-start gap-2"><span className="text-yellow-400 font-bold">5.</span> Your hand is scored by the best matching category + a value bonus</li>
          <li className="flex items-start gap-2"><span className="text-yellow-400 font-bold">6.</span> Strategy: hold rookies for Rookie Rush, same-sport cards for Full Sport, or high-value cards for High Roller</li>
        </ol>
      </section>
    </div>
  );
}
