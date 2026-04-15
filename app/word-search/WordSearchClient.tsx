'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';

// ── Seed-based RNG ────────────────────────────────────────────────────
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

function shuffleWithSeed<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Word Banks ────────────────────────────────────────────────────────
const HOBBY_WORDS = [
  'ROOKIE', 'GRADED', 'CHROME', 'PRIZM', 'TOPPS', 'PANINI', 'SLAB',
  'HOBBY', 'RETAIL', 'INSERT', 'REFRACTOR', 'PATCH', 'AUTO', 'SERIAL',
  'MINT', 'VINTAGE', 'MOSAIC', 'FLEER', 'BOWMAN', 'DONRUSS', 'OPTIC',
  'CENTERING', 'EDGES', 'CORNERS', 'SURFACE', 'PARALLEL', 'SELECT',
  'BREAK', 'PACK', 'SEALED', 'WAX', 'CASE', 'HIT', 'BASE', 'CARD',
];

const PLAYER_WORDS = [
  'TROUT', 'OHTANI', 'JUDGE', 'JETER', 'BONDS', 'MANTLE', 'RUTH',
  'JORDAN', 'LEBRON', 'CURRY', 'MAGIC', 'BIRD', 'KOBE', 'SHAQ',
  'MAHOMES', 'BRADY', 'RICE', 'MONTANA', 'ALLEN', 'LAMAR',
  'GRETZKY', 'CROSBY', 'LEMIEUX', 'OVECHKIN', 'MCDAVID',
  'ACUNA', 'SOTO', 'TATUM', 'LUKA', 'WEMBY',
];

const GRID_SIZE = 12;
const WORDS_PER_GAME = 8;

type Direction = [number, number];
const DIRECTIONS: Direction[] = [
  [0, 1],   // right
  [1, 0],   // down
  [1, 1],   // diagonal down-right
  [-1, 1],  // diagonal up-right
  [0, -1],  // left
  [1, -1],  // diagonal down-left
];

interface PlacedWord {
  word: string;
  startRow: number;
  startCol: number;
  direction: Direction;
  cells: [number, number][];
  category: 'hobby' | 'player';
}

function generateGrid(words: { word: string; category: 'hobby' | 'player' }[], rng: () => number): { grid: string[][]; placed: PlacedWord[] } {
  const grid: string[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(''));
  const placed: PlacedWord[] = [];

  // Sort by length descending for better placement
  const sorted = [...words].sort((a, b) => b.word.length - a.word.length);

  for (const { word, category } of sorted) {
    let success = false;
    const dirs = shuffleWithSeed([...DIRECTIONS], rng);

    for (let attempt = 0; attempt < 100 && !success; attempt++) {
      const dir = dirs[attempt % dirs.length];
      const maxRow = GRID_SIZE - (dir[0] > 0 ? word.length : dir[0] < 0 ? word.length : 1) + (dir[0] > 0 ? 1 : dir[0] < 0 ? word.length - 1 : 0);
      const maxCol = GRID_SIZE - (dir[1] > 0 ? word.length : dir[1] < 0 ? word.length : 1) + (dir[1] > 0 ? 1 : dir[1] < 0 ? word.length - 1 : 0);

      const startRow = Math.floor(rng() * GRID_SIZE);
      const startCol = Math.floor(rng() * GRID_SIZE);

      // Check if word fits
      let fits = true;
      const cells: [number, number][] = [];
      for (let i = 0; i < word.length; i++) {
        const r = startRow + dir[0] * i;
        const c = startCol + dir[1] * i;
        if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) { fits = false; break; }
        if (grid[r][c] !== '' && grid[r][c] !== word[i]) { fits = false; break; }
        cells.push([r, c]);
      }

      if (fits) {
        for (let i = 0; i < word.length; i++) {
          grid[cells[i][0]][cells[i][1]] = word[i];
        }
        placed.push({ word, startRow, startCol, direction: dir, cells, category });
        success = true;
      }
    }
  }

  // Fill empty cells with random letters
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === '') {
        grid[r][c] = letters[Math.floor(rng() * 26)];
      }
    }
  }

  return { grid, placed };
}

type GameState = 'playing' | 'won';

export default function WordSearchClient() {
  const [mode, setMode] = useState<'daily' | 'random'>('daily');
  const [gameKey, setGameKey] = useState(0);
  const [selecting, setSelecting] = useState<[number, number][]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [startTime] = useState(() => Date.now());
  const [endTime, setEndTime] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState({ played: 0, bestTime: 0, totalFound: 0 });

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('cardvault-wordsearch-stats');
      if (saved) setStats(JSON.parse(saved));
    } catch { /* no stats */ }
  }, []);

  const seed = mode === 'daily' ? dateHash(new Date()) : dateHash(new Date()) + gameKey + 999;
  const rng = useMemo(() => seededRng(seed), [seed]);

  const { words, grid, placed } = useMemo(() => {
    const r = seededRng(seed);
    const hobbyPick = shuffleWithSeed(HOBBY_WORDS, r).slice(0, 4);
    const playerPick = shuffleWithSeed(PLAYER_WORDS, r).slice(0, 4);
    const allWords = [
      ...hobbyPick.map(w => ({ word: w, category: 'hobby' as const })),
      ...playerPick.map(w => ({ word: w, category: 'player' as const })),
    ];
    const { grid, placed } = generateGrid(allWords, r);
    return { words: allWords, grid, placed };
  }, [seed]);

  const gameState: GameState = foundWords.length >= placed.length ? 'won' : 'playing';

  // Cell selection
  const isInSelection = useCallback((r: number, c: number) => {
    return selecting.some(([sr, sc]) => sr === r && sc === c);
  }, [selecting]);

  const isFoundCell = useCallback((r: number, c: number) => {
    return placed.some(p => foundWords.includes(p.word) && p.cells.some(([cr, cc]) => cr === r && cc === c));
  }, [placed, foundWords]);

  const getCellCategory = useCallback((r: number, c: number): 'hobby' | 'player' | null => {
    for (const p of placed) {
      if (foundWords.includes(p.word) && p.cells.some(([cr, cc]) => cr === r && cc === c)) {
        return p.category;
      }
    }
    return null;
  }, [placed, foundWords]);

  const handleCellClick = useCallback((r: number, c: number) => {
    if (gameState === 'won') return;

    if (selecting.length === 0) {
      setSelecting([[r, c]]);
      return;
    }

    // Check if this extends the current selection in a valid direction
    const [firstR, firstC] = selecting[0];

    if (selecting.length === 1) {
      // Second click establishes direction
      setSelecting([[firstR, firstC], [r, c]]);
    } else {
      // Extend selection
      setSelecting(prev => [...prev, [r, c]]);
    }

    // Check if the current selection plus this cell matches any word
    const newSelection = [...selecting, [r, c]];
    const selectedLetters = newSelection.map(([sr, sc]) => grid[sr][sc]).join('');

    for (const p of placed) {
      if (!foundWords.includes(p.word)) {
        if (selectedLetters === p.word || selectedLetters === p.word.split('').reverse().join('')) {
          // Check cells match
          const matchForward = p.cells.every((cell, i) => newSelection[i] && cell[0] === newSelection[i][0] && cell[1] === newSelection[i][1]);
          const matchReverse = [...p.cells].reverse().every((cell, i) => newSelection[i] && cell[0] === newSelection[i][0] && cell[1] === newSelection[i][1]);
          if (matchForward || matchReverse) {
            setFoundWords(prev => {
              const next = [...prev, p.word];
              if (next.length >= placed.length) {
                setEndTime(Date.now());
                // Save stats
                try {
                  const elapsed = Math.round((Date.now() - startTime) / 1000);
                  const newStats = {
                    played: stats.played + 1,
                    bestTime: stats.bestTime === 0 ? elapsed : Math.min(stats.bestTime, elapsed),
                    totalFound: stats.totalFound + next.length,
                  };
                  setStats(newStats);
                  localStorage.setItem('cardvault-wordsearch-stats', JSON.stringify(newStats));
                } catch { /* ok */ }
              }
              return next;
            });
            setSelecting([]);
            return;
          }
        }
      }
    }

    // If selection is too long, reset
    if (newSelection.length > 11) {
      setSelecting([]);
    }
  }, [selecting, grid, placed, foundWords, gameState, startTime, stats]);

  const resetSelection = useCallback(() => setSelecting([]), []);

  const elapsed = endTime ? Math.round((endTime - startTime) / 1000) : null;
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const shareResults = useCallback(() => {
    if (!elapsed) return;
    const emojiGrid = placed.map(p => foundWords.includes(p.word) ? '🟩' : '🟥').join('');
    const text = `CardVault Word Search ${mode === 'daily' ? '(Daily)' : '(Random)'}\n${emojiGrid}\n${foundWords.length}/${placed.length} words in ${formatTime(elapsed)}\nhttps://cardvault-two.vercel.app/word-search`;
    navigator.clipboard.writeText(text);
  }, [elapsed, placed, foundWords, mode]);

  const newRandomGame = useCallback(() => {
    setGameKey(k => k + 1);
    setFoundWords([]);
    setSelecting([]);
    setEndTime(null);
  }, []);

  return (
    <div className="space-y-6">
      {/* Mode selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => { setMode('daily'); setFoundWords([]); setSelecting([]); setEndTime(null); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'daily' ? 'bg-emerald-900/60 text-emerald-400 border border-emerald-700/50' : 'bg-gray-800 text-gray-400 border border-gray-700 hover:text-white'}`}
        >
          Daily Challenge
        </button>
        <button
          onClick={() => { setMode('random'); newRandomGame(); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'random' ? 'bg-violet-900/60 text-violet-400 border border-violet-700/50' : 'bg-gray-800 text-gray-400 border border-gray-700 hover:text-white'}`}
        >
          Random
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grid */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-3 sm:p-4">
            {/* Instructions */}
            {gameState === 'playing' && (
              <p className="text-gray-500 text-xs mb-3 text-center">
                Click cells to select letters. Click to extend selection. Words can go right, down, diagonal, or reversed.
              </p>
            )}

            {/* Grid */}
            <div className="grid gap-0.5 mx-auto" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`, maxWidth: '480px' }}>
              {grid.map((row, r) =>
                row.map((letter, c) => {
                  const found = isFoundCell(r, c);
                  const selected = isInSelection(r, c);
                  const cat = getCellCategory(r, c);
                  return (
                    <button
                      key={`${r}-${c}`}
                      onClick={() => handleCellClick(r, c)}
                      onContextMenu={e => { e.preventDefault(); resetSelection(); }}
                      className={`aspect-square flex items-center justify-center text-xs sm:text-sm font-bold rounded transition-all select-none
                        ${found && cat === 'hobby' ? 'bg-emerald-800/60 text-emerald-300 border border-emerald-700/50'
                          : found && cat === 'player' ? 'bg-amber-800/60 text-amber-300 border border-amber-700/50'
                          : selected ? 'bg-violet-800/60 text-violet-200 border border-violet-600/50 scale-105'
                          : 'bg-gray-900/80 text-gray-300 border border-gray-700/30 hover:bg-gray-700/50 hover:text-white'}`}
                    >
                      {letter}
                    </button>
                  );
                })
              )}
            </div>

            {selecting.length > 0 && (
              <div className="mt-2 flex items-center justify-center gap-2">
                <span className="text-violet-400 text-sm font-mono">{selecting.map(([r, c]) => grid[r][c]).join('')}</span>
                <button onClick={resetSelection} className="text-gray-500 hover:text-red-400 text-xs transition-colors">Clear</button>
              </div>
            )}
          </div>
        </div>

        {/* Word list + stats */}
        <div className="space-y-4">
          {/* Words to find */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
            <h3 className="text-white font-bold text-sm mb-3">Words to Find ({foundWords.length}/{placed.length})</h3>
            <div className="space-y-1.5">
              {placed.map(p => {
                const isFound = foundWords.includes(p.word);
                return (
                  <div key={p.word} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm ${isFound ? 'bg-gray-700/30' : ''}`}>
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isFound ? 'bg-emerald-500' : p.category === 'hobby' ? 'bg-emerald-800' : 'bg-amber-800'}`} />
                    <span className={`font-mono tracking-wide ${isFound ? 'line-through text-gray-500' : 'text-white'}`}>{p.word}</span>
                    <span className={`text-xs ml-auto ${isFound ? 'text-gray-600' : p.category === 'hobby' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {p.category === 'hobby' ? 'hobby' : 'player'}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2 mt-3 text-xs">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-800" /> Hobby terms</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-800" /> Player names</span>
            </div>
          </div>

          {/* Stats */}
          {mounted && stats.played > 0 && (
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
              <h3 className="text-white font-bold text-sm mb-2">Your Stats</h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-white font-bold">{stats.played}</p>
                  <p className="text-gray-500 text-xs">Played</p>
                </div>
                <div>
                  <p className="text-emerald-400 font-bold">{stats.bestTime > 0 ? formatTime(stats.bestTime) : '-'}</p>
                  <p className="text-gray-500 text-xs">Best Time</p>
                </div>
                <div>
                  <p className="text-amber-400 font-bold">{stats.totalFound}</p>
                  <p className="text-gray-500 text-xs">Words Found</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Win state */}
      {gameState === 'won' && elapsed !== null && (
        <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-6 text-center">
          <p className="text-4xl mb-2">🎉</p>
          <h2 className="text-2xl font-bold text-white mb-1">Puzzle Complete!</h2>
          <p className="text-emerald-400 text-lg font-semibold mb-1">
            All {placed.length} words found in {formatTime(elapsed)}
          </p>
          <p className="text-gray-400 text-sm mb-4">
            {elapsed < 60 ? 'Lightning fast!' : elapsed < 120 ? 'Great speed!' : elapsed < 180 ? 'Nice work!' : 'You found them all!'}
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={shareResults} className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors">
              Share Results
            </button>
            {mode === 'random' && (
              <button onClick={newRandomGame} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors">
                New Puzzle
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
