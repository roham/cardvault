'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';

// Deterministic daily seed
function dateHash(d: Date): number {
  const s = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  let h = 0;
  for (let i = 0; i < s.length; i++) { h = ((h << 5) - h + s.charCodeAt(i)) | 0; }
  return Math.abs(h);
}

function seededRandom(seed: number) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
}

interface BingoSquare {
  id: string;
  text: string;
  category: 'browse' | 'tools' | 'games' | 'collect' | 'social';
  link?: string;
}

const ALL_SQUARES: BingoSquare[] = [
  // Browse
  { id: 'b1', text: 'View a baseball card', category: 'browse', link: '/sports/baseball' },
  { id: 'b2', text: 'View a basketball card', category: 'browse', link: '/sports/basketball' },
  { id: 'b3', text: 'View a football card', category: 'browse', link: '/sports/football' },
  { id: 'b4', text: 'View a hockey card', category: 'browse', link: '/sports/hockey' },
  { id: 'b5', text: 'Check Card of the Day', category: 'browse', link: '/card-of-the-day' },
  { id: 'b6', text: 'Browse a player page', category: 'browse', link: '/players' },
  { id: 'b7', text: 'Read a guide', category: 'browse', link: '/guides' },
  { id: 'b8', text: 'View a card set', category: 'browse', link: '/sports/sets' },
  { id: 'b9', text: 'Check Market Movers', category: 'browse', link: '/market-movers' },
  { id: 'b10', text: 'Visit Hot Right Now', category: 'browse', link: '/hot-right-now' },
  // Tools
  { id: 't1', text: 'Use the Price Checker', category: 'tools', link: '/tools' },
  { id: 't2', text: 'Calculate Grading ROI', category: 'tools', link: '/tools/grading-roi' },
  { id: 't3', text: 'Check Sealed Product EV', category: 'tools', link: '/tools/sealed-ev' },
  { id: 't4', text: 'Use the Trade Evaluator', category: 'tools', link: '/tools/trade' },
  { id: 't5', text: 'Run a Centering Check', category: 'tools', link: '/tools/centering-calc' },
  { id: 't6', text: 'Try the Grading Probability tool', category: 'tools', link: '/tools/grading-probability' },
  { id: 't7', text: 'Check a PSA Cert', category: 'tools', link: '/tools/cert-check' },
  { id: 't8', text: 'Use the Condition Grader', category: 'tools', link: '/tools/condition-grader' },
  { id: 't9', text: 'Compare two cards', category: 'tools', link: '/tools/compare-matrix' },
  { id: 't10', text: 'Check the Pop Report', category: 'tools', link: '/tools/pop-report' },
  // Games
  { id: 'g1', text: 'Open a Daily Pack', category: 'games', link: '/tools/daily-pack' },
  { id: 'g2', text: 'Play Card Trivia', category: 'games', link: '/trivia' },
  { id: 'g3', text: 'Play Flip or Keep', category: 'games', link: '/flip-or-keep' },
  { id: 'g4', text: 'Play Card Streak', category: 'games', link: '/card-streak' },
  { id: 'g5', text: 'Play Rip or Skip', category: 'games', link: '/rip-or-skip' },
  { id: 'g6', text: 'Open Pack Simulator', category: 'games', link: '/tools/pack-sim' },
  { id: 'g7', text: 'Play Grade or Fade', category: 'games', link: '/grade-or-fade' },
  { id: 'g8', text: 'Play Price Prediction', category: 'games', link: '/price-prediction' },
  { id: 'g9', text: 'Try Card Auction', category: 'games', link: '/card-auction' },
  { id: 'g10', text: 'Guess the Card', category: 'games', link: '/guess-the-card' },
  // Collect
  { id: 'c1', text: 'Add to your Binder', category: 'collect', link: '/binder' },
  { id: 'c2', text: 'Open a Digital Pack', category: 'collect', link: '/digital-pack' },
  { id: 'c3', text: 'Check your Watchlist', category: 'collect', link: '/tools/watchlist' },
  { id: 'c4', text: 'Visit your Hub', category: 'collect', link: '/my-hub' },
  { id: 'c5', text: 'Check your Streak', category: 'collect', link: '/streak' },
  { id: 'c6', text: 'View Achievements', category: 'collect', link: '/achievements' },
  { id: 'c7', text: 'Check the Leaderboard', category: 'collect', link: '/leaderboard' },
  { id: 'c8', text: 'Visit the Trade Hub', category: 'collect', link: '/trade-hub' },
  { id: 'c9', text: 'Open Premium Pack', category: 'collect', link: '/premium-packs' },
  { id: 'c10', text: 'Check Weekly Challenge', category: 'collect', link: '/weekly-challenge' },
  // Social
  { id: 's1', text: 'Share a card on X', category: 'social' },
  { id: 's2', text: 'Visit League Chat', category: 'social', link: '/league-chat' },
  { id: 's3', text: 'Check a comparison', category: 'social', link: '/sports/compare' },
  { id: 's4', text: 'Visit the Showcase', category: 'social', link: '/showcase' },
  { id: 's5', text: 'Check Hobby Debates', category: 'social', link: '/hobby-debates' },
  { id: 's6', text: 'Read the News', category: 'social', link: '/news' },
  { id: 's7', text: 'Check Market Report', category: 'social', link: '/market-report' },
  { id: 's8', text: 'Visit Media Hub', category: 'social', link: '/media-hub' },
];

const CATEGORY_COLORS: Record<string, string> = {
  browse: 'bg-blue-900/40 border-blue-700/50 text-blue-300',
  tools: 'bg-emerald-900/40 border-emerald-700/50 text-emerald-300',
  games: 'bg-purple-900/40 border-purple-700/50 text-purple-300',
  collect: 'bg-amber-900/40 border-amber-700/50 text-amber-300',
  social: 'bg-pink-900/40 border-pink-700/50 text-pink-300',
};

const CATEGORY_COMPLETED: Record<string, string> = {
  browse: 'bg-blue-600/60 border-blue-500 text-white',
  tools: 'bg-emerald-600/60 border-emerald-500 text-white',
  games: 'bg-purple-600/60 border-purple-500 text-white',
  collect: 'bg-amber-600/60 border-amber-500 text-white',
  social: 'bg-pink-600/60 border-pink-500 text-white',
};

function getStorageKey(date: Date): string {
  return `cardvault-bingo-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function getStatsKey(): string { return 'cardvault-bingo-stats'; }

interface BingoStats {
  totalBingos: number;
  totalSquares: number;
  perfectDays: number;
  longestStreak: number;
  currentStreak: number;
  lastPlayDate: string;
}

export default function CardBingo() {
  const today = new Date();
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [stats, setStats] = useState<BingoStats>({
    totalBingos: 0, totalSquares: 0, perfectDays: 0,
    longestStreak: 0, currentStreak: 0, lastPlayDate: '',
  });

  // Generate today's bingo board (deterministic)
  const board = useMemo(() => {
    const seed = dateHash(today);
    const rng = seededRandom(seed);

    // Pick 24 squares (center is FREE) — mix of categories
    const byCategory = {
      browse: ALL_SQUARES.filter(s => s.category === 'browse'),
      tools: ALL_SQUARES.filter(s => s.category === 'tools'),
      games: ALL_SQUARES.filter(s => s.category === 'games'),
      collect: ALL_SQUARES.filter(s => s.category === 'collect'),
      social: ALL_SQUARES.filter(s => s.category === 'social'),
    };

    // Shuffle each category
    const shuffle = <T,>(arr: T[]): T[] => {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };

    // 5 from each category, pick 5 categories × 5 = 25, minus 1 for FREE
    const picks: BingoSquare[] = [
      ...shuffle(byCategory.browse).slice(0, 5),
      ...shuffle(byCategory.tools).slice(0, 5),
      ...shuffle(byCategory.games).slice(0, 5),
      ...shuffle(byCategory.collect).slice(0, 5),
      ...shuffle(byCategory.social).slice(0, 4), // 4 from social + 1 FREE
    ];

    // Shuffle all and place on board
    const shuffled = shuffle(picks);
    // Insert FREE in center (index 12)
    shuffled.splice(12, 0, { id: 'free', text: 'FREE', category: 'games' });
    return shuffled;
  }, [today]);

  // Load from localStorage
  useEffect(() => {
    const key = getStorageKey(today);
    const saved = localStorage.getItem(key);
    if (saved) {
      setCompleted(new Set(JSON.parse(saved)));
    } else {
      // Auto-complete FREE square
      setCompleted(new Set([12]));
      localStorage.setItem(key, JSON.stringify([12]));
    }

    const statsJson = localStorage.getItem(getStatsKey());
    if (statsJson) setStats(JSON.parse(statsJson));
  }, [today]);

  const toggleSquare = useCallback((idx: number) => {
    if (idx === 12) return; // FREE is always complete
    setCompleted(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);

      localStorage.setItem(getStorageKey(today), JSON.stringify([...next]));

      // Update stats
      const s = { ...stats };
      s.totalSquares = Math.max(s.totalSquares, next.size);
      const todayStr = today.toISOString().split('T')[0];
      if (s.lastPlayDate !== todayStr) {
        s.currentStreak += 1;
        s.longestStreak = Math.max(s.longestStreak, s.currentStreak);
        s.lastPlayDate = todayStr;
      }
      if (next.size >= 25) {
        s.perfectDays += 1;
      }
      setStats(s);
      localStorage.setItem(getStatsKey(), JSON.stringify(s));

      return next;
    });
  }, [today, stats]);

  // Check for bingos
  const bingos = useMemo(() => {
    const lines: number[][] = [];
    // Rows
    for (let r = 0; r < 5; r++) lines.push([0, 1, 2, 3, 4].map(c => r * 5 + c));
    // Columns
    for (let c = 0; c < 5; c++) lines.push([0, 1, 2, 3, 4].map(r => r * 5 + c));
    // Diagonals
    lines.push([0, 6, 12, 18, 24]);
    lines.push([4, 8, 12, 16, 20]);

    const completedLines = lines.filter(line => line.every(i => completed.has(i)));
    return completedLines;
  }, [completed]);

  const bingoIndices = useMemo(() => {
    const set = new Set<number>();
    bingos.forEach(line => line.forEach(i => set.add(i)));
    return set;
  }, [bingos]);

  const completedCount = completed.size;
  const progressPct = Math.round((completedCount / 25) * 100);

  // Shareable result
  const shareText = useMemo(() => {
    const grid = board.map((_, i) => {
      if (bingoIndices.has(i) && completed.has(i)) return '🟩';
      if (completed.has(i)) return '🟨';
      return '⬛';
    });
    const rows = [];
    for (let r = 0; r < 5; r++) rows.push(grid.slice(r * 5, (r + 1) * 5).join(''));
    return `CardVault Bingo ${today.toLocaleDateString()}\n${rows.join('\n')}\n${completedCount}/25 | ${bingos.length} BINGO${bingos.length !== 1 ? 'S' : ''}\nhttps://cardvault-two.vercel.app/card-bingo`;
  }, [board, completed, bingos, bingoIndices, completedCount, today]);

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-400 text-sm">{completedCount}/25 squares</span>
          <span className="text-indigo-400 text-sm font-bold">{bingos.length} BINGO{bingos.length !== 1 ? 'S' : ''}</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-3">
          <div
            className="bg-indigo-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Bingo Board */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        {/* Column Headers */}
        {['B', 'I', 'N', 'G', 'O'].map(letter => (
          <div key={letter} className="text-center text-2xl sm:text-3xl font-black text-indigo-400 pb-1">
            {letter}
          </div>
        ))}

        {/* Squares */}
        {board.map((square, idx) => {
          const isCompleted = completed.has(idx);
          const isBingo = bingoIndices.has(idx);
          const isFree = idx === 12;

          return (
            <button
              key={idx}
              onClick={() => toggleSquare(idx)}
              className={`relative aspect-square rounded-lg border text-xs sm:text-sm p-1 sm:p-2 flex flex-col items-center justify-center text-center transition-all duration-200 ${
                isFree
                  ? 'bg-indigo-600/50 border-indigo-500 text-indigo-200 cursor-default'
                  : isCompleted
                    ? isBingo
                      ? 'bg-indigo-600/70 border-indigo-400 text-white ring-2 ring-indigo-400/50 scale-[1.02]'
                      : CATEGORY_COMPLETED[square.category]
                    : `${CATEGORY_COLORS[square.category]} hover:scale-[1.03] hover:brightness-110 cursor-pointer`
              }`}
            >
              {isCompleted && !isFree && (
                <span className="absolute top-0.5 right-0.5 text-xs">&#10003;</span>
              )}
              <span className="leading-tight font-medium">
                {isFree ? 'FREE' : square.text}
              </span>
              {square.link && !isCompleted && !isFree && (
                <Link
                  href={square.link}
                  onClick={e => e.stopPropagation()}
                  className="text-[10px] underline opacity-60 mt-0.5 hover:opacity-100"
                >
                  Go
                </Link>
              )}
            </button>
          );
        })}
      </div>

      {/* Category Legend */}
      <div className="flex flex-wrap gap-3 justify-center">
        {[
          { cat: 'browse', label: 'Browse' },
          { cat: 'tools', label: 'Tools' },
          { cat: 'games', label: 'Games' },
          { cat: 'collect', label: 'Collect' },
          { cat: 'social', label: 'Social' },
        ].map(c => (
          <div key={c.cat} className={`px-3 py-1 rounded-full text-xs border ${CATEGORY_COLORS[c.cat]}`}>
            {c.label}
          </div>
        ))}
      </div>

      {/* Bingo Alert */}
      {bingos.length > 0 && (
        <div className="bg-indigo-950/60 border border-indigo-700/50 rounded-xl p-6 text-center">
          <div className="text-3xl font-black text-indigo-400 mb-2">
            BINGO{bingos.length > 1 ? ` x${bingos.length}` : ''}!
          </div>
          <p className="text-indigo-300/70 text-sm mb-4">
            {bingos.length === 1 ? 'You completed a line!' : `You completed ${bingos.length} lines!`}
            {completedCount >= 25 ? ' PERFECT BOARD!' : ` Keep going — ${25 - completedCount} squares left!`}
          </p>
          <button
            onClick={() => navigator.clipboard.writeText(shareText)}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Copy Results to Share
          </button>
        </div>
      )}

      {/* Share Button (always visible) */}
      <div className="flex gap-3 justify-center">
        <button
          onClick={() => navigator.clipboard.writeText(shareText)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 text-sm hover:bg-gray-700 transition-colors"
        >
          Copy Results
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Bingos', value: stats.totalBingos + bingos.length },
          { label: 'Squares Today', value: `${completedCount}/25` },
          { label: 'Perfect Days', value: stats.perfectDays + (completedCount >= 25 ? 1 : 0) },
          { label: 'Day Streak', value: stats.currentStreak || 1 },
        ].map(s => (
          <div key={s.label} className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
            <div className="text-gray-400 text-xs">{s.label}</div>
            <div className="text-white text-xl font-bold">{s.value}</div>
          </div>
        ))}
      </div>

      {/* How to Play */}
      <details className="bg-gray-900/60 border border-gray-800 rounded-xl">
        <summary className="cursor-pointer p-4 text-white font-medium hover:text-indigo-400 transition-colors list-none flex justify-between items-center">
          How to Play
          <span className="text-gray-500 group-open:rotate-45 transition-transform text-xl">+</span>
        </summary>
        <div className="px-4 pb-4 text-gray-400 text-sm space-y-2">
          <p>1. Each day you get a fresh 5x5 bingo board with card collecting challenges.</p>
          <p>2. Complete challenges by visiting features, using tools, and playing games.</p>
          <p>3. Tap a square to mark it complete. The center square is always FREE.</p>
          <p>4. Complete 5 in a row (horizontal, vertical, or diagonal) to get a BINGO.</p>
          <p>5. Try to complete the entire board for a perfect day!</p>
          <p>6. Share your emoji grid results with friends.</p>
        </div>
      </details>

      {/* Related Features */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
        <h3 className="text-white font-bold mb-4">More Daily Activities</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { href: '/daily-challenges', label: 'Daily Challenges', desc: '3 new challenges every day' },
            { href: '/card-of-the-day', label: 'Card of the Day', desc: 'Featured card with trivia' },
            { href: '/streak', label: 'Visit Streak', desc: 'Track your daily visits' },
            { href: '/trivia', label: 'Daily Trivia', desc: '5 questions, 10-second timer' },
            { href: '/grade-or-fade', label: 'Grade or Fade', desc: 'Daily card investment game' },
            { href: '/my-hub', label: 'Collector Hub', desc: 'Your personal dashboard' },
          ].map(t => (
            <Link key={t.href} href={t.href}
              className="p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg hover:bg-gray-700/50 transition-colors"
            >
              <div className="text-white text-sm font-medium">{t.label}</div>
              <div className="text-gray-500 text-xs mt-1">{t.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
