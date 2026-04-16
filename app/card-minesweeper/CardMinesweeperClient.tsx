'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';

type Difficulty = 'easy' | 'medium' | 'hard';
type CellState = 'hidden' | 'revealed' | 'flagged';

interface Cell {
  isHit: boolean;
  adjacentHits: number;
  state: CellState;
}

const DIFFICULTIES: Record<Difficulty, { rows: number; cols: number; hits: number; label: string }> = {
  easy: { rows: 8, cols: 8, hits: 10, label: 'Easy (8×8, 10 hits)' },
  medium: { rows: 10, cols: 10, hits: 18, label: 'Medium (10×10, 18 hits)' },
  hard: { rows: 12, cols: 12, hits: 30, label: 'Hard (12×12, 30 hits)' },
};

const CARD_HIT_NAMES = [
  'PSA 10 Gem Mint', 'BGS 9.5 Gem Mint', '1/1 Superfractor', 'Auto Patch /25',
  'Prizm Silver RC', 'Topps Chrome RC', 'Bowman 1st Auto', 'Optic Rated Rookie',
  'National Treasures /99', 'Gold Parallel /50', 'Cracked Ice /25', 'Purple Shimmer /15',
  'Red Wave /5', 'Black Gold /1', 'Printing Plate 1/1', 'Logoman Auto',
  'Laundry Tag /5', 'RPA Booklet /49', 'Stained Glass SSP', 'Downtown Insert',
  'Kaboom! Insert', 'Color Blast 1/1', 'Case Hit SSP', 'Mojo Refractor',
  'Atomic Refractor', 'Gold Vinyl /5', 'Sapphire /75', 'Tiger Stripe /25',
  'Snakeskin /15', 'Disco Prizm /10', 'Camo /25', 'Tie-Dye /25',
];

function dateHash(d: Date): number {
  const str = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function seededRng(seed: number) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
}

function createBoard(rows: number, cols: number, hitCount: number, seed: number, firstClick?: [number, number]): Cell[][] {
  const rng = seededRng(seed);
  const board: Cell[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ isHit: false, adjacentHits: 0, state: 'hidden' as CellState }))
  );

  // Place hits, avoiding first click and its neighbors
  let placed = 0;
  const positions: [number, number][] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (firstClick && Math.abs(r - firstClick[0]) <= 1 && Math.abs(c - firstClick[1]) <= 1) continue;
      positions.push([r, c]);
    }
  }
  // Shuffle positions using seeded rng
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }
  for (let i = 0; i < Math.min(hitCount, positions.length); i++) {
    const [r, c] = positions[i];
    board[r][c].isHit = true;
    placed++;
  }

  // Calculate adjacent hit counts
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].isHit) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].isHit) count++;
        }
      }
      board[r][c].adjacentHits = count;
    }
  }
  return board;
}

function getNumberColor(n: number): string {
  const colors = ['', 'text-blue-400', 'text-green-400', 'text-red-400', 'text-purple-400', 'text-yellow-400', 'text-pink-400', 'text-cyan-400', 'text-white'];
  return colors[n] || 'text-white';
}

const STATS_KEY = 'cardvault-minesweeper-stats';

interface Stats {
  played: number;
  won: number;
  bestTimeEasy: number;
  bestTimeMedium: number;
  bestTimeHard: number;
  streak: number;
  bestStreak: number;
}

function loadStats(): Stats {
  if (typeof window === 'undefined') return { played: 0, won: 0, bestTimeEasy: 0, bestTimeMedium: 0, bestTimeHard: 0, streak: 0, bestStreak: 0 };
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { played: 0, won: 0, bestTimeEasy: 0, bestTimeMedium: 0, bestTimeHard: 0, streak: 0, bestStreak: 0 };
}

function saveStats(stats: Stats) {
  try { localStorage.setItem(STATS_KEY, JSON.stringify(stats)); } catch {}
}

export default function CardMinesweeperClient() {
  const [mounted, setMounted] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [mode, setMode] = useState<'daily' | 'random'>('daily');
  const [board, setBoard] = useState<Cell[][] | null>(null);
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'won' | 'lost'>('waiting');
  const [timer, setTimer] = useState(0);
  const [flagCount, setFlagCount] = useState(0);
  const [stats, setStats] = useState<Stats>(loadStats());
  const [seed, setSeed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const firstClickRef = useRef(false);

  useEffect(() => { setMounted(true); setStats(loadStats()); }, []);

  const config = DIFFICULTIES[difficulty];

  const startGame = useCallback((diff: Difficulty, gameMode: 'daily' | 'random') => {
    setDifficulty(diff);
    setMode(gameMode);
    const s = gameMode === 'daily' ? dateHash(new Date()) + diff.charCodeAt(0) : Math.floor(Math.random() * 999999);
    setSeed(s);
    const b = createBoard(DIFFICULTIES[diff].rows, DIFFICULTIES[diff].cols, DIFFICULTIES[diff].hits, s);
    setBoard(b);
    setGameState('waiting');
    setTimer(0);
    setFlagCount(0);
    firstClickRef.current = false;
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (mounted) startGame(difficulty, mode);
  }, [mounted]);

  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [gameState]);

  const revealCell = useCallback((board: Cell[][], r: number, c: number): Cell[][] => {
    const rows = board.length, cols = board[0].length;
    const newBoard = board.map(row => row.map(cell => ({ ...cell })));
    const stack: [number, number][] = [[r, c]];
    while (stack.length > 0) {
      const [cr, cc] = stack.pop()!;
      if (cr < 0 || cr >= rows || cc < 0 || cc >= cols) continue;
      if (newBoard[cr][cc].state !== 'hidden') continue;
      newBoard[cr][cc].state = 'revealed';
      if (newBoard[cr][cc].adjacentHits === 0 && !newBoard[cr][cc].isHit) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            stack.push([cr + dr, cc + dc]);
          }
        }
      }
    }
    return newBoard;
  }, []);

  const checkWin = useCallback((board: Cell[][]): boolean => {
    for (const row of board) {
      for (const cell of row) {
        if (!cell.isHit && cell.state === 'hidden') return false;
        if (!cell.isHit && cell.state === 'flagged') return false;
      }
    }
    return true;
  }, []);

  const handleClick = useCallback((r: number, c: number) => {
    if (!board || gameState === 'won' || gameState === 'lost') return;
    if (board[r][c].state === 'flagged') return;
    if (board[r][c].state === 'revealed') return;

    let currentBoard = board;

    // First click — regenerate board to ensure safe opening
    if (!firstClickRef.current) {
      firstClickRef.current = true;
      currentBoard = createBoard(config.rows, config.cols, config.hits, seed + r * 100 + c, [r, c]);
      setGameState('playing');
    }

    if (currentBoard[r][c].isHit) {
      // Game over — reveal all
      const newBoard = currentBoard.map(row => row.map(cell => ({ ...cell, state: 'revealed' as CellState })));
      setBoard(newBoard);
      setGameState('lost');
      const newStats = { ...stats, played: stats.played + 1, streak: 0 };
      setStats(newStats);
      saveStats(newStats);
      return;
    }

    const newBoard = revealCell(currentBoard, r, c);
    setBoard(newBoard);

    if (checkWin(newBoard)) {
      setGameState('won');
      const newStreak = stats.streak + 1;
      const bestTimeKey = `bestTime${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}` as keyof Stats;
      const currentBest = stats[bestTimeKey] as number;
      const newStats: Stats = {
        ...stats,
        played: stats.played + 1,
        won: stats.won + 1,
        streak: newStreak,
        bestStreak: Math.max(stats.bestStreak, newStreak),
        [bestTimeKey]: currentBest === 0 ? timer : Math.min(currentBest, timer),
      };
      setStats(newStats);
      saveStats(newStats);
    }
  }, [board, gameState, config, seed, stats, timer, difficulty, revealCell, checkWin]);

  const handleRightClick = useCallback((e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (!board || gameState === 'won' || gameState === 'lost') return;
    if (board[r][c].state === 'revealed') return;

    const newBoard = board.map(row => row.map(cell => ({ ...cell })));
    if (newBoard[r][c].state === 'hidden') {
      newBoard[r][c].state = 'flagged';
      setFlagCount(f => f + 1);
    } else if (newBoard[r][c].state === 'flagged') {
      newBoard[r][c].state = 'hidden';
      setFlagCount(f => f - 1);
    }
    setBoard(newBoard);

    if (checkWin(newBoard)) {
      setGameState('won');
      const newStreak = stats.streak + 1;
      const bestTimeKey = `bestTime${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}` as keyof Stats;
      const currentBest = stats[bestTimeKey] as number;
      const newStats: Stats = {
        ...stats,
        played: stats.played + 1,
        won: stats.won + 1,
        streak: newStreak,
        bestStreak: Math.max(stats.bestStreak, newStreak),
        [bestTimeKey]: currentBest === 0 ? timer : Math.min(currentBest, timer),
      };
      setStats(newStats);
      saveStats(newStats);
    }
  }, [board, gameState, stats, timer, difficulty, checkWin]);

  // Long press for mobile flagging
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggered = useRef(false);

  const handleTouchStart = useCallback((r: number, c: number) => {
    longPressTriggered.current = false;
    longPressTimer.current = setTimeout(() => {
      longPressTriggered.current = true;
      if (!board || gameState === 'won' || gameState === 'lost') return;
      if (board[r][c].state === 'revealed') return;
      const newBoard = board.map(row => row.map(cell => ({ ...cell })));
      if (newBoard[r][c].state === 'hidden') {
        newBoard[r][c].state = 'flagged';
        setFlagCount(f => f + 1);
      } else if (newBoard[r][c].state === 'flagged') {
        newBoard[r][c].state = 'hidden';
        setFlagCount(f => f - 1);
      }
      setBoard(newBoard);
    }, 500);
  }, [board, gameState]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  }, []);

  const hitCards = useMemo(() => {
    if (!board) return [];
    const rng = seededRng(seed + 42);
    const shuffled = [...CARD_HIT_NAMES].sort(() => rng() - 0.5);
    return shuffled;
  }, [board, seed]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  if (!mounted) return <div className="text-center py-20 text-gray-400">Loading...</div>;

  const cellSize = difficulty === 'hard' ? 'w-7 h-7 sm:w-8 sm:h-8' : difficulty === 'medium' ? 'w-8 h-8 sm:w-9 sm:h-9' : 'w-9 h-9 sm:w-10 sm:h-10';
  const textSize = difficulty === 'hard' ? 'text-xs sm:text-sm' : 'text-sm sm:text-base';

  return (
    <div>
      {/* Difficulty + Mode selection */}
      <div className="flex flex-wrap gap-2 mb-4">
        {(Object.keys(DIFFICULTIES) as Difficulty[]).map(d => (
          <button
            key={d}
            onClick={() => startGame(d, mode)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${difficulty === d ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
          >
            {d.charAt(0).toUpperCase() + d.slice(1)}
          </button>
        ))}
        <div className="w-px bg-gray-700 mx-1" />
        <button
          onClick={() => startGame(difficulty, 'daily')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${mode === 'daily' ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
        >
          Daily Challenge
        </button>
        <button
          onClick={() => startGame(difficulty, 'random')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${mode === 'random' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
        >
          Random
        </button>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4 mb-4 text-sm">
        <div className="flex items-center gap-1.5">
          <span className="text-gray-500">💎 Hits:</span>
          <span className="text-white font-mono">{config.hits - flagCount}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-gray-500">🚩 Flags:</span>
          <span className="text-white font-mono">{flagCount}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-gray-500">⏱️</span>
          <span className="text-white font-mono">{formatTime(timer)}</span>
        </div>
        {gameState === 'won' && <span className="text-emerald-400 font-bold animate-pulse">🎉 YOU WIN!</span>}
        {gameState === 'lost' && <span className="text-red-400 font-bold">💥 Game Over</span>}
      </div>

      {/* Board */}
      {board && (
        <div className="inline-block bg-gray-900 border border-gray-700 rounded-xl p-2 sm:p-3 overflow-x-auto">
          <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${config.cols}, minmax(0, 1fr))` }}>
            {board.map((row, r) =>
              row.map((cell, c) => {
                let content = '';
                let bg = 'bg-gray-700 hover:bg-gray-600 cursor-pointer';
                let textColor = '';

                if (cell.state === 'revealed') {
                  if (cell.isHit) {
                    bg = gameState === 'lost' ? 'bg-red-900/80' : 'bg-amber-900/80';
                    content = '💎';
                  } else if (cell.adjacentHits > 0) {
                    bg = 'bg-gray-800';
                    content = String(cell.adjacentHits);
                    textColor = getNumberColor(cell.adjacentHits);
                  } else {
                    bg = 'bg-gray-850 bg-gray-800/50';
                    content = '';
                  }
                } else if (cell.state === 'flagged') {
                  bg = 'bg-amber-900/40 border border-amber-600/50';
                  content = '🚩';
                }

                return (
                  <button
                    key={`${r}-${c}`}
                    className={`${cellSize} ${bg} ${textColor} ${textSize} rounded-sm flex items-center justify-center font-bold select-none transition-colors`}
                    onClick={() => {
                      if (!longPressTriggered.current) handleClick(r, c);
                    }}
                    onContextMenu={(e) => handleRightClick(e, r, c)}
                    onTouchStart={() => handleTouchStart(r, c)}
                    onTouchEnd={handleTouchEnd}
                    disabled={cell.state === 'revealed'}
                  >
                    {content}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => startGame(difficulty, mode)}
          className="px-4 py-2 bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
        >
          {gameState === 'won' || gameState === 'lost' ? '🔄 New Game' : '🔄 Restart'}
        </button>
        {mode === 'random' && (
          <button
            onClick={() => startGame(difficulty, 'random')}
            className="px-4 py-2 bg-blue-900/50 text-blue-300 hover:bg-blue-800/50 rounded-lg text-sm font-medium transition-colors"
          >
            🎲 Random Board
          </button>
        )}
      </div>

      {/* Mobile flagging hint */}
      <p className="text-gray-500 text-xs mt-3">
        💡 Tip: Right-click (desktop) or long-press (mobile) to flag a cell. Left-click to reveal.
      </p>

      {/* Win results — show hit cards found */}
      {gameState === 'won' && (
        <div className="mt-6 bg-emerald-950/30 border border-emerald-800/50 rounded-xl p-4">
          <h3 className="text-lg font-bold text-emerald-400 mb-3">💎 Hit Cards Found!</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {hitCards.slice(0, config.hits).map((name, i) => (
              <div key={i} className="bg-gray-800/60 border border-gray-700/50 rounded-lg px-3 py-2 text-xs">
                <span className="text-amber-400 font-medium">{name}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 text-sm text-gray-400">
            Completed in <span className="text-white font-mono">{formatTime(timer)}</span> on {difficulty} difficulty
          </div>
        </div>
      )}

      {/* Loss results — show where hits were */}
      {gameState === 'lost' && (
        <div className="mt-6 bg-red-950/30 border border-red-800/50 rounded-xl p-4">
          <h3 className="text-lg font-bold text-red-400 mb-2">💥 You hit a card!</h3>
          <p className="text-gray-400 text-sm mb-3">
            The 💎 gems show where all the hit cards were hidden. Flag them instead of clicking to win!
          </p>
          <button
            onClick={() => startGame(difficulty, mode === 'daily' ? 'random' : 'random')}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-500 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="mt-8 bg-gray-800/40 border border-gray-700/50 rounded-xl p-4">
        <h3 className="text-base font-bold text-white mb-3">Your Stats</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div>
            <div className="text-2xl font-bold text-white">{stats.played}</div>
            <div className="text-xs text-gray-500">Played</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-400">{stats.won}</div>
            <div className="text-xs text-gray-500">Won</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-400">{stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0}%</div>
            <div className="text-xs text-gray-500">Win Rate</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">{stats.bestStreak}</div>
            <div className="text-xs text-gray-500">Best Streak</div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => {
            const key = `bestTime${d.charAt(0).toUpperCase() + d.slice(1)}` as keyof Stats;
            const best = stats[key] as number;
            return (
              <div key={d} className="bg-gray-900/50 rounded-lg py-2">
                <div className="text-xs text-gray-500 capitalize">{d} Best</div>
                <div className="text-sm font-mono text-white">{best > 0 ? formatTime(best) : '—'}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* How to Play */}
      <div className="mt-8 bg-gray-800/40 border border-gray-700/50 rounded-xl p-5">
        <h3 className="text-base font-bold text-white mb-3">How to Play</h3>
        <div className="space-y-2 text-sm text-gray-400">
          <p>🎯 <strong className="text-gray-200">Goal:</strong> Reveal all safe cells without clicking on a 💎 hit card.</p>
          <p>🔢 <strong className="text-gray-200">Numbers:</strong> Each number tells you how many adjacent cells contain hit cards.</p>
          <p>🚩 <strong className="text-gray-200">Flagging:</strong> Right-click or long-press to flag cells you think contain hits.</p>
          <p>💥 <strong className="text-gray-200">Game Over:</strong> Click on a hit card and the game ends.</p>
          <p>🏆 <strong className="text-gray-200">Win:</strong> Reveal every safe cell to win. Flagging all hits is optional.</p>
          <p>📅 <strong className="text-gray-200">Daily:</strong> Same board for everyone each day. Random mode for unlimited games.</p>
        </div>
      </div>

      {/* Related links */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { href: '/card-crossword', title: 'Card Crossword', desc: 'Daily mini puzzle' },
          { href: '/guess-the-card', title: 'Guess the Card', desc: 'Wordle-style card game' },
          { href: '/word-search', title: 'Word Search', desc: 'Find hobby terms' },
          { href: '/trivia', title: 'Daily Trivia', desc: '5 questions a day' },
          { href: '/card-typing', title: 'Typing Challenge', desc: 'Speed typing game' },
          { href: '/card-scramble', title: 'Card Scramble', desc: 'Unscramble player names' },
        ].map(link => (
          <Link key={link.href} href={link.href} className="bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2.5 hover:border-gray-600 transition-colors">
            <div className="text-sm font-medium text-white">{link.title}</div>
            <div className="text-xs text-gray-500">{link.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
