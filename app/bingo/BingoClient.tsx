'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

/* ── helpers ────────────────────────────────────────────────────── */

function dateKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function dateHash(d: string): number {
  let h = 0;
  for (let i = 0; i < d.length; i++) {
    h = ((h << 5) - h + d.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/* ── challenge pool ─────────────────────────────────────────────── */

interface Challenge {
  label: string;
  emoji: string;
  link?: string;
  category: 'tools' | 'games' | 'explore' | 'collect' | 'learn';
}

const CHALLENGES: Challenge[] = [
  // Tools
  { label: 'Check a card\'s grading ROI', emoji: '📊', link: '/tools/grading-roi', category: 'tools' },
  { label: 'Calculate sealed EV', emoji: '📦', link: '/tools/sealed-ev', category: 'tools' },
  { label: 'Use the trade evaluator', emoji: '⚖️', link: '/tools/trade', category: 'tools' },
  { label: 'Find a card with identifier', emoji: '🔍', link: '/tools/identify', category: 'tools' },
  { label: 'Check a set completion cost', emoji: '📋', link: '/tools/set-cost', category: 'tools' },
  { label: 'Compare two cards head-to-head', emoji: '🥊', link: '/tools/head-to-head', category: 'tools' },
  { label: 'View price history chart', emoji: '📈', link: '/tools/price-history', category: 'tools' },
  { label: 'Calculate a flip profit', emoji: '💰', link: '/tools/flip-calc', category: 'tools' },
  { label: 'Check card centering', emoji: '📐', link: '/tools/centering-calc', category: 'tools' },
  { label: 'Run wax vs singles calc', emoji: '🃏', link: '/tools/wax-vs-singles', category: 'tools' },
  { label: 'Estimate insurance cost', emoji: '🛡️', link: '/tools/insurance-calc', category: 'tools' },
  { label: 'Use box break calculator', emoji: '📊', link: '/tools/box-break', category: 'tools' },
  { label: 'Track a grading submission', emoji: '📝', link: '/tools/grading-tracker', category: 'tools' },

  // Games
  { label: 'Open a simulated pack', emoji: '🎴', link: '/tools/pack-sim', category: 'games' },
  { label: 'Play daily trivia', emoji: '🧠', link: '/trivia', category: 'games' },
  { label: 'Play Flip or Keep', emoji: '🔄', link: '/flip-or-keep', category: 'games' },
  { label: 'Vote Rip or Skip', emoji: '✂️', link: '/rip-or-skip', category: 'games' },
  { label: 'Win a card battle', emoji: '⚔️', link: '/card-battle', category: 'games' },
  { label: 'Make a prediction', emoji: '🔮', link: '/predictions', category: 'games' },
  { label: 'Open your daily pack', emoji: '🎁', link: '/tools/daily-pack', category: 'games' },
  { label: 'Draft a fantasy portfolio', emoji: '💼', link: '/tools/portfolio', category: 'games' },

  // Explore
  { label: 'View a card worth $100+', emoji: '💎', link: '/sports', category: 'explore' },
  { label: 'Find a pre-1970 vintage card', emoji: '📜', link: '/sports', category: 'explore' },
  { label: 'View a rookie card', emoji: '⭐', link: '/sports', category: 'explore' },
  { label: 'Browse a complete set', emoji: '📁', link: '/sports/sets', category: 'explore' },
  { label: 'Check a player profile', emoji: '👤', link: '/players', category: 'explore' },
  { label: 'View cards from your birth year', emoji: '🎂', link: '/sports', category: 'explore' },
  { label: 'Find a hockey HOF card', emoji: '🏒', link: '/sports/sport/hockey', category: 'explore' },
  { label: 'Find a baseball HOF card', emoji: '⚾', link: '/sports/sport/baseball', category: 'explore' },
  { label: 'Find a basketball HOF card', emoji: '🏀', link: '/sports/sport/basketball', category: 'explore' },
  { label: 'Find a football HOF card', emoji: '🏈', link: '/sports/sport/football', category: 'explore' },
  { label: 'View today\'s market movers', emoji: '📊', link: '/market-movers', category: 'explore' },
  { label: 'Read market analysis', emoji: '📰', link: '/market-analysis', category: 'explore' },

  // Collect
  { label: 'Add a card to your binder', emoji: '📒', link: '/binder', category: 'collect' },
  { label: 'Add a card to your want list', emoji: '📝', link: '/binder', category: 'collect' },
  { label: 'Open a digital pack', emoji: '🎴', link: '/digital-pack', category: 'collect' },
  { label: 'Open a premium pack', emoji: '👑', link: '/premium-packs', category: 'collect' },
  { label: 'Buy a pack from the store', emoji: '🛒', link: '/packs', category: 'collect' },
  { label: 'Check your vault stats', emoji: '🏦', link: '/vault', category: 'collect' },
  { label: 'Update your trophy case', emoji: '🏆', link: '/showcase', category: 'collect' },
  { label: 'Propose a trade', emoji: '🤝', link: '/trade-hub', category: 'collect' },

  // Learn
  { label: 'Read a collecting guide', emoji: '📖', link: '/guides', category: 'learn' },
  { label: 'Check the release calendar', emoji: '📅', link: '/calendar', category: 'learn' },
  { label: 'Take the collector quiz', emoji: '❓', link: '/tools/quiz', category: 'learn' },
  { label: 'Read hobby news', emoji: '📰', link: '/news', category: 'learn' },
  { label: 'View the card of the day', emoji: '🌟', link: '/card-of-the-day', category: 'learn' },
  { label: 'Check upcoming releases', emoji: '🗓️', link: '/release-tracker', category: 'learn' },
  { label: 'Review the weekly challenge', emoji: '🏅', link: '/weekly-challenge', category: 'learn' },
  { label: 'Check the leaderboard', emoji: '🥇', link: '/leaderboard', category: 'learn' },
];

function generateBoard(day: string): Challenge[] {
  const rng = seededRng(dateHash(day + '-bingo'));
  const shuffled = [...CHALLENGES].sort(() => rng() - 0.5);

  // Pick 24 challenges (center is FREE)
  const picked = shuffled.slice(0, 24);

  // Insert FREE space at index 12 (center of 5x5)
  const board: Challenge[] = [];
  for (let i = 0; i < 25; i++) {
    if (i === 12) {
      board.push({ label: 'FREE SPACE', emoji: '⭐', category: 'games' });
    } else {
      board.push(picked[i < 12 ? i : i - 1]);
    }
  }
  return board;
}

/* ── bingo line detection ───────────────────────────────────────── */

const LINES = [
  // rows
  [0, 1, 2, 3, 4],
  [5, 6, 7, 8, 9],
  [10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19],
  [20, 21, 22, 23, 24],
  // columns
  [0, 5, 10, 15, 20],
  [1, 6, 11, 16, 21],
  [2, 7, 12, 17, 22],
  [3, 8, 13, 18, 23],
  [4, 9, 14, 19, 24],
  // diagonals
  [0, 6, 12, 18, 24],
  [4, 8, 12, 16, 20],
];

function getCompletedLines(marked: boolean[]): number[][] {
  return LINES.filter(line => line.every(i => marked[i]));
}

function getScore(lineCount: number, totalMarked: number): number {
  if (totalMarked === 25) return 1000; // blackout
  if (lineCount >= 3) return 500;
  if (lineCount === 2) return 250;
  if (lineCount === 1) return 100;
  return 0;
}

/* ── share text ─────────────────────────────────────────────────── */

function generateShareText(marked: boolean[], lineCount: number, score: number): string {
  let grid = 'CardVault Bingo ' + dateKey() + '\n\n';
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      const i = r * 5 + c;
      if (i === 12) grid += '⭐';
      else if (marked[i]) grid += '🟩';
      else grid += '⬛';
    }
    grid += '\n';
  }
  grid += `\n${lineCount} Bingo${lineCount !== 1 ? 's' : ''} | ${score} pts`;
  grid += '\nhttps://cardvault-two.vercel.app/bingo';
  return grid;
}

/* ── persistence ────────────────────────────────────────────────── */

interface BingoStats {
  totalBingos: number;
  totalPoints: number;
  daysPlayed: number;
  bestScore: number;
  currentStreak: number;
  bestStreak: number;
  lastPlayDate: string;
  blackouts: number;
}

function loadStats(): BingoStats {
  if (typeof window === 'undefined') return defaultStats();
  try {
    const s = localStorage.getItem('cardvault-bingo-stats');
    return s ? JSON.parse(s) : defaultStats();
  } catch { return defaultStats(); }
}

function defaultStats(): BingoStats {
  return { totalBingos: 0, totalPoints: 0, daysPlayed: 0, bestScore: 0, currentStreak: 0, bestStreak: 0, lastPlayDate: '', blackouts: 0 };
}

function saveStats(stats: BingoStats) {
  try { localStorage.setItem('cardvault-bingo-stats', JSON.stringify(stats)); } catch {}
}

function loadDayState(day: string): boolean[] {
  if (typeof window === 'undefined') return new Array(25).fill(false);
  try {
    const s = localStorage.getItem(`cardvault-bingo-${day}`);
    if (s) {
      const arr = JSON.parse(s);
      // Always mark center
      arr[12] = true;
      return arr;
    }
  } catch {}
  const fresh = new Array(25).fill(false);
  fresh[12] = true; // free space
  return fresh;
}

function saveDayState(day: string, marked: boolean[]) {
  try { localStorage.setItem(`cardvault-bingo-${day}`, JSON.stringify(marked)); } catch {}
}

/* ── category colors ────────────────────────────────────────────── */

const CAT_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  tools: { bg: 'bg-blue-950/40', border: 'border-blue-800/40', text: 'text-blue-300' },
  games: { bg: 'bg-purple-950/40', border: 'border-purple-800/40', text: 'text-purple-300' },
  explore: { bg: 'bg-emerald-950/40', border: 'border-emerald-800/40', text: 'text-emerald-300' },
  collect: { bg: 'bg-amber-950/40', border: 'border-amber-800/40', text: 'text-amber-300' },
  learn: { bg: 'bg-rose-950/40', border: 'border-rose-800/40', text: 'text-rose-300' },
};

/* ── component ──────────────────────────────────────────────────── */

export default function BingoClient() {
  const [mounted, setMounted] = useState(false);
  const [day] = useState(dateKey);
  const [board, setBoard] = useState<Challenge[]>([]);
  const [marked, setMarked] = useState<boolean[]>(new Array(25).fill(false));
  const [stats, setStats] = useState<BingoStats>(defaultStats);
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setBoard(generateBoard(day));
    setMarked(loadDayState(day));
    setStats(loadStats());
    setMounted(true);
  }, [day]);

  const completedLines = getCompletedLines(marked);
  const lineCount = completedLines.length;
  const totalMarked = marked.filter(Boolean).length;
  const score = getScore(lineCount, totalMarked);

  // Highlight cells that are part of a completed line
  const inCompletedLine = new Set<number>();
  completedLines.forEach(line => line.forEach(i => inCompletedLine.add(i)));

  const toggleSquare = useCallback((index: number) => {
    if (index === 12) return; // can't untoggle free space
    setMarked(prev => {
      const next = [...prev];
      next[index] = !next[index];
      saveDayState(day, next);

      // Update stats
      const newLines = getCompletedLines(next);
      const newTotal = next.filter(Boolean).length;
      const newScore = getScore(newLines.length, newTotal);
      if (newScore > 0) {
        setStats(prev => {
          const updated = { ...prev };
          updated.totalBingos = Math.max(updated.totalBingos, newLines.length);
          updated.totalPoints = Math.max(updated.totalPoints, newScore);
          if (newScore > updated.bestScore) updated.bestScore = newScore;
          if (updated.lastPlayDate !== day) {
            updated.daysPlayed += 1;
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
            updated.currentStreak = updated.lastPlayDate === yKey ? updated.currentStreak + 1 : 1;
            if (updated.currentStreak > updated.bestStreak) updated.bestStreak = updated.currentStreak;
            updated.lastPlayDate = day;
          }
          if (newTotal === 25) updated.blackouts += 1;
          saveStats(updated);
          return updated;
        });
      }

      return next;
    });
  }, [day]);

  const handleShare = useCallback(() => {
    const text = generateShareText(marked, lineCount, score);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
    setShowShare(true);
  }, [marked, lineCount, score]);

  if (!mounted) {
    return <div className="text-center py-20 text-gray-500">Loading bingo board...</div>;
  }

  return (
    <div>
      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-gray-900/80 border border-gray-800 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-yellow-400">{totalMarked - 1}/24</div>
          <div className="text-xs text-gray-500">Completed</div>
        </div>
        <div className="bg-gray-900/80 border border-gray-800 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-400">{lineCount}</div>
          <div className="text-xs text-gray-500">Bingo{lineCount !== 1 ? 's' : ''}</div>
        </div>
        <div className="bg-gray-900/80 border border-gray-800 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-purple-400">{score}</div>
          <div className="text-xs text-gray-500">Points</div>
        </div>
        <div className="bg-gray-900/80 border border-gray-800 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-400">{stats.currentStreak}</div>
          <div className="text-xs text-gray-500">Day Streak</div>
        </div>
      </div>

      {/* Scoring reference */}
      <div className="flex flex-wrap gap-2 mb-6 text-xs text-gray-500">
        <span className="bg-gray-900/60 border border-gray-800 rounded px-2 py-1">1 line = 100 pts</span>
        <span className="bg-gray-900/60 border border-gray-800 rounded px-2 py-1">2 lines = 250 pts</span>
        <span className="bg-gray-900/60 border border-gray-800 rounded px-2 py-1">3 lines = 500 pts</span>
        <span className="bg-gray-900/60 border border-gray-800 rounded px-2 py-1">Blackout = 1,000 pts</span>
      </div>

      {/* Bingo grid */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2 mb-6">
        {board.map((challenge, i) => {
          const isCenter = i === 12;
          const isMarked = marked[i];
          const isInLine = inCompletedLine.has(i);
          const cat = CAT_COLORS[challenge.category] || CAT_COLORS.tools;

          let cellClass = 'relative rounded-lg border p-2 sm:p-3 text-center transition-all cursor-pointer select-none min-h-[80px] sm:min-h-[100px] flex flex-col items-center justify-center gap-1';

          if (isCenter) {
            cellClass += ' bg-yellow-950/50 border-yellow-700/60 ring-1 ring-yellow-600/30';
          } else if (isMarked && isInLine) {
            cellClass += ' bg-green-950/60 border-green-500/60 ring-1 ring-green-400/40';
          } else if (isMarked) {
            cellClass += ' bg-green-950/40 border-green-700/50';
          } else {
            cellClass += ` ${cat.bg} ${cat.border} hover:brightness-125`;
          }

          const inner = (
            <div className={cellClass} onClick={() => toggleSquare(i)}>
              {isMarked && !isCenter && (
                <div className="absolute top-1 right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
              )}
              <span className="text-lg sm:text-xl">{challenge.emoji}</span>
              <span className={`text-[10px] sm:text-xs leading-tight ${isMarked ? 'text-green-300' : isCenter ? 'text-yellow-300 font-bold' : cat.text}`}>
                {challenge.label}
              </span>
            </div>
          );

          if (challenge.link && !isMarked) {
            return (
              <Link key={i} href={challenge.link} className="block" onClick={(e) => e.stopPropagation()}>
                {inner}
              </Link>
            );
          }

          return <div key={i}>{inner}</div>;
        })}
      </div>

      {/* Bingo notification */}
      {lineCount > 0 && (
        <div className="bg-gradient-to-r from-yellow-900/40 via-amber-900/30 to-yellow-900/40 border border-yellow-700/50 rounded-xl p-4 mb-6 text-center">
          <div className="text-2xl mb-1">
            {totalMarked === 25 ? '🎆 BLACKOUT! 🎆' : lineCount >= 3 ? '🔥 TRIPLE BINGO! 🔥' : lineCount === 2 ? '🎉 DOUBLE BINGO! 🎉' : '🎯 BINGO!'}
          </div>
          <p className="text-yellow-300 text-sm">
            {totalMarked === 25
              ? 'You completed every square! Maximum 1,000 points!'
              : `${lineCount} completed line${lineCount !== 1 ? 's' : ''} — ${score} points!`}
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 mb-8">
        <button
          onClick={handleShare}
          className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-black font-semibold py-3 rounded-lg transition-colors"
        >
          {copied ? 'Copied!' : 'Share Results'}
        </button>
        <button
          onClick={() => {
            const fresh = new Array(25).fill(false);
            fresh[12] = true;
            setMarked(fresh);
            saveDayState(day, fresh);
          }}
          className="px-6 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-3 rounded-lg transition-colors border border-gray-700"
        >
          Reset
        </button>
      </div>

      {/* Share preview */}
      {showShare && (
        <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 mb-8 font-mono text-sm text-center">
          <pre className="text-gray-300 whitespace-pre inline-block text-left">
            {generateShareText(marked, lineCount, score)}
          </pre>
          <button
            onClick={() => setShowShare(false)}
            className="block mx-auto mt-3 text-xs text-gray-500 hover:text-gray-400"
          >
            Hide preview
          </button>
        </div>
      )}

      {/* Lifetime stats */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-4">Lifetime Stats</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <div className="text-xl font-bold text-white">{stats.daysPlayed}</div>
            <div className="text-xs text-gray-500">Days Played</div>
          </div>
          <div>
            <div className="text-xl font-bold text-yellow-400">{stats.totalPoints}</div>
            <div className="text-xs text-gray-500">Total Points</div>
          </div>
          <div>
            <div className="text-xl font-bold text-green-400">{stats.bestScore}</div>
            <div className="text-xs text-gray-500">Best Score</div>
          </div>
          <div>
            <div className="text-xl font-bold text-purple-400">{stats.blackouts}</div>
            <div className="text-xs text-gray-500">Blackouts</div>
          </div>
          <div>
            <div className="text-xl font-bold text-blue-400">{stats.bestStreak}</div>
            <div className="text-xs text-gray-500">Best Streak</div>
          </div>
          <div>
            <div className="text-xl font-bold text-orange-400">{stats.totalBingos}</div>
            <div className="text-xs text-gray-500">Total Bingos</div>
          </div>
        </div>
      </div>

      {/* Category legend */}
      <div className="mt-6 flex flex-wrap gap-2">
        {Object.entries(CAT_COLORS).map(([cat, colors]) => (
          <span key={cat} className={`${colors.bg} border ${colors.border} ${colors.text} text-xs px-2 py-1 rounded capitalize`}>
            {cat}
          </span>
        ))}
      </div>
    </div>
  );
}
