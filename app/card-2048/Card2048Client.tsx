'use client';

import { useState, useEffect, useCallback } from 'react';

// Card value tiers (powers of 2 mapped to collecting values)
const VALUE_TIERS = [1, 2, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000];
const TIER_LABELS: Record<number, string> = {
  1: 'Common', 2: 'Common', 5: 'Uncommon', 10: 'Uncommon',
  25: 'Rare', 50: 'Rare', 100: 'Epic', 250: 'Epic',
  500: 'Legendary', 1000: 'Legendary', 2500: 'Mythic', 5000: 'Mythic', 10000: 'Grail',
};
const TIER_COLORS: Record<number, string> = {
  1: 'bg-gray-700 text-gray-300',
  2: 'bg-gray-600 text-gray-200',
  5: 'bg-green-800 text-green-200',
  10: 'bg-green-700 text-green-100',
  25: 'bg-blue-800 text-blue-200',
  50: 'bg-blue-700 text-blue-100',
  100: 'bg-purple-800 text-purple-200',
  250: 'bg-purple-700 text-purple-100',
  500: 'bg-amber-800 text-amber-200',
  1000: 'bg-amber-600 text-amber-100',
  2500: 'bg-rose-700 text-rose-100',
  5000: 'bg-rose-600 text-rose-100',
  10000: 'bg-yellow-500 text-yellow-900',
};
const TIER_BORDERS: Record<number, string> = {
  1: 'border-gray-600', 2: 'border-gray-500', 5: 'border-green-600', 10: 'border-green-500',
  25: 'border-blue-600', 50: 'border-blue-500', 100: 'border-purple-600', 250: 'border-purple-500',
  500: 'border-amber-600', 1000: 'border-amber-400', 2500: 'border-rose-500', 5000: 'border-rose-400',
  10000: 'border-yellow-400',
};

type Grid = (number | null)[][];

function createEmptyGrid(): Grid {
  return Array.from({ length: 4 }, () => Array(4).fill(null));
}

function getNextTier(val: number): number {
  const idx = VALUE_TIERS.indexOf(val);
  if (idx < 0 || idx >= VALUE_TIERS.length - 1) return val;
  return VALUE_TIERS[idx + 1];
}

function addRandomTile(grid: Grid): Grid {
  const empty: [number, number][] = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (!grid[r][c]) empty.push([r, c]);
    }
  }
  if (empty.length === 0) return grid;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  const newGrid = grid.map(row => [...row]);
  // 90% $1, 10% $2
  newGrid[r][c] = Math.random() < 0.9 ? 1 : 2;
  return newGrid;
}

function slideRow(row: (number | null)[]): { row: (number | null)[]; score: number; moved: boolean } {
  // Remove nulls
  const tiles = row.filter(v => v !== null) as number[];
  const merged: number[] = [];
  let score = 0;
  let i = 0;
  while (i < tiles.length) {
    if (i + 1 < tiles.length && tiles[i] === tiles[i + 1]) {
      const next = getNextTier(tiles[i]);
      merged.push(next);
      score += next;
      i += 2;
    } else {
      merged.push(tiles[i]);
      i++;
    }
  }
  // Pad with nulls
  while (merged.length < 4) merged.push(0);
  const result = merged.map(v => v === 0 ? null : v);
  const moved = JSON.stringify(result) !== JSON.stringify(row);
  return { row: result, score, moved };
}

function move(grid: Grid, direction: 'left' | 'right' | 'up' | 'down'): { grid: Grid; score: number; moved: boolean } {
  let totalScore = 0;
  let anyMoved = false;
  const newGrid = createEmptyGrid();

  if (direction === 'left') {
    for (let r = 0; r < 4; r++) {
      const { row, score, moved } = slideRow(grid[r]);
      newGrid[r] = row;
      totalScore += score;
      if (moved) anyMoved = true;
    }
  } else if (direction === 'right') {
    for (let r = 0; r < 4; r++) {
      const reversed = [...grid[r]].reverse();
      const { row, score, moved } = slideRow(reversed);
      newGrid[r] = row.reverse();
      totalScore += score;
      if (moved) anyMoved = true;
    }
  } else if (direction === 'up') {
    for (let c = 0; c < 4; c++) {
      const col = [grid[0][c], grid[1][c], grid[2][c], grid[3][c]];
      const { row, score, moved } = slideRow(col);
      for (let r = 0; r < 4; r++) newGrid[r][c] = row[r];
      totalScore += score;
      if (moved) anyMoved = true;
    }
  } else {
    for (let c = 0; c < 4; c++) {
      const col = [grid[3][c], grid[2][c], grid[1][c], grid[0][c]];
      const { row, score, moved } = slideRow(col);
      const reversed = row.reverse();
      for (let r = 0; r < 4; r++) newGrid[r][c] = reversed[r];
      totalScore += score;
      if (moved) anyMoved = true;
    }
  }

  return { grid: newGrid, score: totalScore, moved: anyMoved };
}

function canMove(grid: Grid): boolean {
  // Check for empty cells
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (!grid[r][c]) return true;
    }
  }
  // Check for adjacent equal values
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const val = grid[r][c];
      if (c < 3 && grid[r][c + 1] === val) return true;
      if (r < 3 && grid[r + 1][c] === val) return true;
    }
  }
  return false;
}

function getHighestTile(grid: Grid): number {
  let max = 0;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (grid[r][c] && grid[r][c]! > max) max = grid[r][c]!;
    }
  }
  return max;
}

const STORAGE_KEY = 'cardvault-2048';

export default function Card2048Client() {
  const [grid, setGrid] = useState<Grid>(createEmptyGrid);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [moves, setMoves] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Init
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.bestScore) setBestScore(data.bestScore);
      } catch { /* ignore */ }
    }
    // Start new game
    let g = createEmptyGrid();
    g = addRandomTile(g);
    g = addRandomTile(g);
    setGrid(g);
  }, []);

  const saveState = useCallback((newBest: number) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ bestScore: newBest }));
  }, []);

  const handleMove = useCallback((direction: 'left' | 'right' | 'up' | 'down') => {
    if (gameOver || won) return;

    const result = move(grid, direction);
    if (!result.moved) return;

    let newGrid = addRandomTile(result.grid);
    const newScore = score + result.score;
    const newMoves = moves + 1;

    setGrid(newGrid);
    setScore(newScore);
    setMoves(newMoves);

    if (newScore > bestScore) {
      setBestScore(newScore);
      saveState(newScore);
    }

    // Check win
    if (getHighestTile(newGrid) >= 10000) {
      setWon(true);
      return;
    }

    // Check game over
    if (!canMove(newGrid)) {
      setGameOver(true);
    }
  }, [grid, score, bestScore, moves, gameOver, won, saveState]);

  // Keyboard controls
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const dir = e.key.replace('Arrow', '').toLowerCase() as 'up' | 'down' | 'left' | 'right';
        handleMove(dir);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleMove]);

  // Touch controls
  useEffect(() => {
    let startX = 0, startY = 0;
    const onStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };
    const onEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      if (Math.max(absDx, absDy) < 30) return; // too small
      if (absDx > absDy) {
        handleMove(dx > 0 ? 'right' : 'left');
      } else {
        handleMove(dy > 0 ? 'down' : 'up');
      }
    };
    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchend', onEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchend', onEnd);
    };
  }, [handleMove]);

  const newGame = useCallback(() => {
    let g = createEmptyGrid();
    g = addRandomTile(g);
    g = addRandomTile(g);
    setGrid(g);
    setScore(0);
    setMoves(0);
    setGameOver(false);
    setWon(false);
  }, []);

  const shareResult = useCallback(() => {
    const highest = getHighestTile(grid);
    const text = `Card 2048 | Score: ${score.toLocaleString()} | Highest: $${highest.toLocaleString()} (${TIER_LABELS[highest] || 'Card'}) | Moves: ${moves}\n\nhttps://cardvault-two.vercel.app/card-2048`;
    navigator.clipboard.writeText(text);
  }, [grid, score, moves]);

  const fmt = (n: number) => `$${n.toLocaleString()}`;

  if (!mounted) {
    return <div className="h-96 bg-gray-900/60 rounded-2xl animate-pulse" />;
  }

  const highest = getHighestTile(grid);

  return (
    <div className="space-y-4">
      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Score', value: score.toLocaleString() },
          { label: 'Best', value: bestScore.toLocaleString() },
          { label: 'Moves', value: moves.toString() },
          { label: 'Highest', value: fmt(highest) },
        ].map(s => (
          <div key={s.label} className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
            <div className="text-gray-500 text-xs">{s.label}</div>
            <div className="text-white font-bold text-sm">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Game Board */}
      <div className="relative bg-gray-900/80 border border-gray-700 rounded-2xl p-3 aspect-square max-w-md mx-auto">
        <div className="grid grid-cols-4 gap-2 h-full">
          {grid.flat().map((val, i) => (
            <div
              key={i}
              className={`rounded-xl border-2 flex flex-col items-center justify-center transition-all duration-150 ${
                val
                  ? `${TIER_COLORS[val] || 'bg-gray-700 text-white'} ${TIER_BORDERS[val] || 'border-gray-600'}`
                  : 'bg-gray-800/40 border-gray-800/60'
              }`}
            >
              {val && (
                <>
                  <span className={`font-bold ${val >= 1000 ? 'text-base sm:text-lg' : 'text-lg sm:text-xl'}`}>
                    {fmt(val)}
                  </span>
                  <span className="text-[9px] sm:text-[10px] opacity-70 mt-0.5">
                    {TIER_LABELS[val]}
                  </span>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Game Over Overlay */}
        {(gameOver || won) && (
          <div className="absolute inset-0 bg-black/70 rounded-2xl flex flex-col items-center justify-center">
            <h2 className={`text-2xl font-bold mb-2 ${won ? 'text-yellow-400' : 'text-white'}`}>
              {won ? 'You reached $10,000!' : 'Game Over'}
            </h2>
            <p className="text-gray-400 mb-1">Score: {score.toLocaleString()}</p>
            <p className="text-gray-500 text-sm mb-4">Highest: {fmt(highest)} ({TIER_LABELS[highest]})</p>
            <div className="flex gap-3">
              <button onClick={newGame} className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition-colors">
                New Game
              </button>
              <button onClick={shareResult} className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl transition-colors">
                Share
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <p className="text-gray-500 text-xs">Swipe or use arrow keys</p>
        <div className="flex gap-2">
          <button onClick={shareResult} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-xl border border-gray-700 transition-colors">
            Share
          </button>
          <button onClick={newGame} className="px-4 py-2 bg-amber-700 hover:bg-amber-600 text-white text-sm font-medium rounded-xl transition-colors">
            New Game
          </button>
        </div>
      </div>

      {/* Value Tier Reference */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4">
        <h3 className="text-white font-bold text-sm mb-3">Value Tiers</h3>
        <div className="flex flex-wrap gap-1.5">
          {VALUE_TIERS.map(v => (
            <span key={v} className={`px-2 py-1 rounded-lg text-xs font-medium border ${TIER_COLORS[v]} ${TIER_BORDERS[v]}`}>
              {fmt(v)} — {TIER_LABELS[v]}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
