'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';

interface CrosswordClue {
  answer: string;
  clue: string;
  row: number;
  col: number;
  direction: 'across' | 'down';
  number: number;
}

interface PuzzleData {
  grid: string[][];
  clues: CrosswordClue[];
  size: number;
}

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

// Pre-made mini crossword puzzles (5x5)
const PUZZLES: { grid: string[][]; clues: Omit<CrosswordClue, 'number'>[] }[] = [
  {
    grid: [
      ['S','L','A','B','#'],
      ['L','#','U','#','R'],
      ['A','U','T','O','C'],
      ['B','#','O','#','#'],
      ['#','G','E','M','S'],
    ],
    clues: [
      { answer: 'SLAB', clue: 'Graded card in a plastic holder', row: 0, col: 0, direction: 'across' },
      { answer: 'AUTO', clue: 'Autographed card abbreviation', row: 2, col: 0, direction: 'across' },
      { answer: 'GEMS', clue: 'BGS perfect 10 rating name', row: 4, col: 1, direction: 'across' },
      { answer: 'SLAB', clue: 'What PSA puts your card in', row: 0, col: 0, direction: 'down' },
      { answer: 'RC', clue: 'Rookie card abbreviation', row: 0, col: 4, direction: 'down' },
      { answer: 'AUTO', clue: 'Signature on a card', row: 0, col: 2, direction: 'down' },
    ],
  },
  {
    grid: [
      ['W','A','X','#','P'],
      ['#','#','#','#','S'],
      ['F','L','I','P','A'],
      ['#','#','#','#','#'],
      ['M','I','N','T','#'],
    ],
    clues: [
      { answer: 'WAX', clue: 'Old-school term for sealed packs', row: 0, col: 0, direction: 'across' },
      { answer: 'FLIP', clue: 'Buy low, sell high in the hobby', row: 2, col: 0, direction: 'across' },
      { answer: 'MINT', clue: 'Perfect condition, never touched', row: 4, col: 0, direction: 'across' },
      { answer: 'PSA', clue: 'Most popular grading company', row: 0, col: 4, direction: 'down' },
    ],
  },
  {
    grid: [
      ['H','I','T','#','#'],
      ['O','#','O','P','S'],
      ['B','O','P','#','E'],
      ['B','#','P','S','T'],
      ['Y','E','S','#','#'],
    ],
    clues: [
      { answer: 'HIT', clue: 'A valuable pull from a pack', row: 0, col: 0, direction: 'across' },
      { answer: 'OPS', clue: 'Short for Pack Opening', row: 1, col: 2, direction: 'across' },
      { answer: 'BOP', clue: 'Base, other, prime — card types', row: 2, col: 0, direction: 'across' },
      { answer: 'PST', clue: 'Abbreviation: Pre-Sell Thread', row: 3, col: 2, direction: 'across' },
      { answer: 'YES', clue: '"Rip it!" answer', row: 4, col: 0, direction: 'across' },
      { answer: 'HOBBY', clue: 'Card collecting is a ___', row: 0, col: 0, direction: 'down' },
      { answer: 'TOPPS', clue: 'Baseball card brand since 1951', row: 0, col: 2, direction: 'down' },
      { answer: 'SET', clue: 'Complete collection of one release', row: 1, col: 3, direction: 'down' },
    ],
  },
  {
    grid: [
      ['P','A','C','K','#'],
      ['S','#','G','#','#'],
      ['A','U','C','#','R'],
      ['#','#','#','#','C'],
      ['B','O','X','#','#'],
    ],
    clues: [
      { answer: 'PACK', clue: 'Rip one of these to pull cards', row: 0, col: 0, direction: 'across' },
      { answer: 'AUC', clue: 'Auction abbreviation', row: 2, col: 0, direction: 'across' },
      { answer: 'BOX', clue: 'Contains multiple packs', row: 4, col: 0, direction: 'across' },
      { answer: 'PSA', clue: '___ 10 is the holy grail grade', row: 0, col: 0, direction: 'down' },
      { answer: 'CGC', clue: 'Third-largest grading company', row: 0, col: 2, direction: 'down' },
      { answer: 'RC', clue: 'Rookie card marking', row: 2, col: 4, direction: 'down' },
    ],
  },
  {
    grid: [
      ['#','B','A','S','E'],
      ['#','G','#','#','B'],
      ['C','A','S','E','A'],
      ['#','S','#','#','Y'],
      ['F','#','L','O','T'],
    ],
    clues: [
      { answer: 'BASE', clue: 'Common card, not a parallel', row: 0, col: 1, direction: 'across' },
      { answer: 'CASE', clue: 'Contains multiple boxes', row: 2, col: 0, direction: 'across' },
      { answer: 'LOT', clue: 'Bundle of cards sold together', row: 4, col: 2, direction: 'across' },
      { answer: 'BGAS', clue: 'Beckett ___ (grading system)', row: 0, col: 1, direction: 'down' },
      { answer: 'EBAY', clue: 'Where most cards are sold online', row: 0, col: 4, direction: 'down' },
    ],
  },
  {
    grid: [
      ['G','R','A','D','E'],
      ['#','#','#','#','V'],
      ['P','U','L','L','#'],
      ['#','#','#','#','#'],
      ['S','E','T','S','#'],
    ],
    clues: [
      { answer: 'GRADE', clue: 'PSA assigns this to your card', row: 0, col: 0, direction: 'across' },
      { answer: 'PULL', clue: 'What you get from ripping a pack', row: 2, col: 0, direction: 'across' },
      { answer: 'SETS', clue: 'Topps releases multiple ___ per year', row: 4, col: 0, direction: 'across' },
      { answer: 'EV', clue: 'Expected ___ of a pack', row: 0, col: 4, direction: 'down' },
    ],
  },
  {
    grid: [
      ['R','A','W','#','#'],
      ['#','#','A','X','#'],
      ['T','E','N','#','#'],
      ['#','#','#','#','#'],
      ['H','O','F','#','#'],
    ],
    clues: [
      { answer: 'RAW', clue: 'Ungraded card condition', row: 0, col: 0, direction: 'across' },
      { answer: 'AX', clue: 'Short for accessories/extras', row: 1, col: 2, direction: 'across' },
      { answer: 'TEN', clue: 'Perfect PSA grade', row: 2, col: 0, direction: 'across' },
      { answer: 'HOF', clue: 'Hall of Fame abbreviation', row: 4, col: 0, direction: 'across' },
      { answer: 'WANT', clue: '___ list for card shows', row: 0, col: 2, direction: 'down' },
    ],
  },
  {
    grid: [
      ['#','#','S','S','P'],
      ['#','#','P','#','O'],
      ['N','U','M','#','P'],
      ['#','#','#','#','#'],
      ['G','E','M','#','#'],
    ],
    clues: [
      { answer: 'SSP', clue: 'Super short print (rare variant)', row: 0, col: 2, direction: 'across' },
      { answer: 'SP', clue: 'Short print card', row: 1, col: 2, direction: 'across' },
      { answer: 'NUM', clue: 'Numbered card (serial)', row: 2, col: 0, direction: 'across' },
      { answer: 'GEM', clue: '___ mint condition', row: 4, col: 0, direction: 'across' },
      { answer: 'POP', clue: 'Population report count', row: 0, col: 4, direction: 'down' },
      { answer: 'SPMM', clue: 'Short for Set Price Market Maker', row: 0, col: 2, direction: 'down' },
    ],
  },
];

function generatePuzzle(seed: number): PuzzleData {
  const rng = seededRng(seed);
  const idx = Math.floor(rng() * PUZZLES.length);
  const puzzle = PUZZLES[idx];

  let num = 1;
  const numberMap = new Map<string, number>();
  const clues: CrosswordClue[] = [];

  // Sort clues by position to assign numbers correctly
  const sorted = [...puzzle.clues].sort((a, b) => {
    if (a.row !== b.row) return a.row - b.row;
    return a.col - b.col;
  });

  for (const clue of sorted) {
    const key = `${clue.row}-${clue.col}`;
    if (!numberMap.has(key)) {
      numberMap.set(key, num++);
    }
    clues.push({ ...clue, number: numberMap.get(key)! });
  }

  return { grid: puzzle.grid, clues, size: 5 };
}

const LS_KEY = 'cardvault-crossword-stats';

export default function CardCrosswordClient() {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<'daily' | 'random'>('daily');
  const [puzzle, setPuzzle] = useState<PuzzleData | null>(null);
  const [userGrid, setUserGrid] = useState<string[][]>([]);
  const [activeCell, setActiveCell] = useState<[number, number] | null>(null);
  const [activeDir, setActiveDir] = useState<'across' | 'down'>('across');
  const [solved, setSolved] = useState(false);
  const [stats, setStats] = useState({ played: 0, won: 0, streak: 0 });
  const inputRefs = useRef<(HTMLInputElement | null)[][]>([]);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) setStats(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(LS_KEY, JSON.stringify(stats));
  }, [stats, mounted]);

  const startGame = useCallback((m: 'daily' | 'random') => {
    setMode(m);
    const seed = m === 'daily' ? dateHash(new Date()) : Math.floor(Math.random() * 1000000);
    const p = generatePuzzle(seed);
    setPuzzle(p);
    setUserGrid(p.grid.map(row => row.map(c => c === '#' ? '#' : '')));
    setActiveCell(null);
    setSolved(false);
    inputRefs.current = Array.from({ length: p.size }, () => Array(p.size).fill(null));
  }, []);

  useEffect(() => {
    if (mounted && !puzzle) startGame('daily');
  }, [mounted, puzzle, startGame]);

  const checkSolved = useCallback((grid: string[][]) => {
    if (!puzzle) return;
    for (let r = 0; r < puzzle.size; r++) {
      for (let c = 0; c < puzzle.size; c++) {
        if (puzzle.grid[r][c] !== '#' && grid[r][c].toUpperCase() !== puzzle.grid[r][c]) return;
      }
    }
    setSolved(true);
    setStats(prev => ({ played: prev.played + 1, won: prev.won + 1, streak: prev.streak + 1 }));
  }, [puzzle]);

  const handleInput = useCallback((row: number, col: number, value: string) => {
    if (!puzzle || puzzle.grid[row][col] === '#') return;
    const char = value.toUpperCase().replace(/[^A-Z]/g, '').slice(-1);
    setUserGrid(prev => {
      const next = prev.map(r => [...r]);
      next[row][col] = char;
      checkSolved(next);
      return next;
    });

    // Auto-advance to next cell
    if (char && puzzle) {
      const nextRow = activeDir === 'down' ? row + 1 : row;
      const nextCol = activeDir === 'across' ? col + 1 : col;
      if (nextRow < puzzle.size && nextCol < puzzle.size && puzzle.grid[nextRow][nextCol] !== '#') {
        setActiveCell([nextRow, nextCol]);
        inputRefs.current[nextRow]?.[nextCol]?.focus();
      }
    }
  }, [puzzle, activeDir, checkSolved]);

  const handleCellClick = useCallback((row: number, col: number) => {
    if (!puzzle || puzzle.grid[row][col] === '#') return;
    if (activeCell && activeCell[0] === row && activeCell[1] === col) {
      setActiveDir(prev => prev === 'across' ? 'down' : 'across');
    }
    setActiveCell([row, col]);
    inputRefs.current[row]?.[col]?.focus();
  }, [puzzle, activeCell]);

  const getCellNumber = useCallback((row: number, col: number) => {
    if (!puzzle) return null;
    const clue = puzzle.clues.find(c => c.row === row && c.col === col);
    return clue ? clue.number : null;
  }, [puzzle]);

  const acrossClues = useMemo(() => puzzle?.clues.filter(c => c.direction === 'across') || [], [puzzle]);
  const downClues = useMemo(() => puzzle?.clues.filter(c => c.direction === 'down') || [], [puzzle]);

  const revealAll = useCallback(() => {
    if (!puzzle) return;
    setUserGrid(puzzle.grid.map(r => [...r]));
    setSolved(true);
    setStats(prev => ({ ...prev, played: prev.played + 1, streak: 0 }));
  }, [puzzle]);

  if (!mounted || !puzzle) {
    return (
      <div className="space-y-6">
        <div className="h-24 bg-gray-800/50 rounded-xl animate-pulse" />
        <div className="h-64 bg-gray-800/50 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mode + Stats */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => startGame('daily')}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              mode === 'daily' ? 'bg-amber-900/60 border-amber-800/50 text-amber-400' : 'bg-gray-800 border-gray-700 text-gray-400'
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => startGame('random')}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              mode === 'random' ? 'bg-amber-900/60 border-amber-800/50 text-amber-400' : 'bg-gray-800 border-gray-700 text-gray-400'
            }`}
          >
            Random
          </button>
        </div>
        <div className="flex gap-4 text-center">
          <div><div className="text-lg font-bold text-white">{stats.played}</div><div className="text-xs text-gray-500">Played</div></div>
          <div><div className="text-lg font-bold text-emerald-400">{stats.won}</div><div className="text-xs text-gray-500">Won</div></div>
          <div><div className="text-lg font-bold text-amber-400">{stats.streak}</div><div className="text-xs text-gray-500">Streak</div></div>
        </div>
      </div>

      {solved && (
        <div className="bg-emerald-900/30 border border-emerald-800/50 rounded-xl p-4 text-center">
          <div className="text-2xl mb-1">🎉</div>
          <div className="text-lg font-bold text-white">Puzzle Complete!</div>
          <div className="flex gap-2 justify-center mt-3">
            <button
              onClick={() => startGame('random')}
              className="px-4 py-2 bg-amber-900/60 border border-amber-800/50 text-amber-400 rounded-lg text-sm font-medium hover:bg-amber-900/80 transition-colors"
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="flex justify-center">
        <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${puzzle.size}, minmax(0, 1fr))` }}>
          {puzzle.grid.map((row, r) =>
            row.map((cell, c) => {
              const isBlocked = cell === '#';
              const cellNum = getCellNumber(r, c);
              const isActive = activeCell && activeCell[0] === r && activeCell[1] === c;
              const isCorrect = userGrid[r]?.[c]?.toUpperCase() === cell && cell !== '#';

              return (
                <div
                  key={`${r}-${c}`}
                  className={`relative w-12 h-12 sm:w-14 sm:h-14 ${
                    isBlocked
                      ? 'bg-gray-900'
                      : isActive
                      ? 'bg-amber-900/40 border-2 border-amber-400'
                      : isCorrect && solved
                      ? 'bg-emerald-900/30 border border-emerald-700/50'
                      : 'bg-gray-800 border border-gray-700'
                  }`}
                  onClick={() => handleCellClick(r, c)}
                >
                  {cellNum && (
                    <span className="absolute top-0.5 left-1 text-[9px] text-gray-500 font-medium">{cellNum}</span>
                  )}
                  {!isBlocked && (
                    <input
                      ref={el => {
                        if (!inputRefs.current[r]) inputRefs.current[r] = [];
                        inputRefs.current[r][c] = el;
                      }}
                      type="text"
                      maxLength={1}
                      value={userGrid[r]?.[c] || ''}
                      onChange={e => handleInput(r, c, e.target.value)}
                      onFocus={() => { setActiveCell([r, c]); }}
                      className="w-full h-full bg-transparent text-center text-lg sm:text-xl font-bold text-white uppercase focus:outline-none caret-amber-400"
                      disabled={solved}
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {!solved && (
        <div className="text-center">
          <button
            onClick={revealAll}
            className="px-4 py-2 bg-gray-800 border border-gray-700 text-gray-400 rounded-lg text-sm hover:text-white transition-colors"
          >
            Reveal Answer
          </button>
        </div>
      )}

      {/* Clues */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
          <h3 className="text-sm font-bold text-white mb-3">ACROSS</h3>
          <div className="space-y-2">
            {acrossClues.map(clue => (
              <div
                key={`a-${clue.number}`}
                className="text-sm cursor-pointer hover:text-white transition-colors"
                onClick={() => { setActiveCell([clue.row, clue.col]); setActiveDir('across'); inputRefs.current[clue.row]?.[clue.col]?.focus(); }}
              >
                <span className="text-amber-400 font-medium mr-2">{clue.number}.</span>
                <span className="text-gray-400">{clue.clue}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
          <h3 className="text-sm font-bold text-white mb-3">DOWN</h3>
          <div className="space-y-2">
            {downClues.map(clue => (
              <div
                key={`d-${clue.number}`}
                className="text-sm cursor-pointer hover:text-white transition-colors"
                onClick={() => { setActiveCell([clue.row, clue.col]); setActiveDir('down'); inputRefs.current[clue.row]?.[clue.col]?.focus(); }}
              >
                <span className="text-amber-400 font-medium mr-2">{clue.number}.</span>
                <span className="text-gray-400">{clue.clue}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related */}
      <div className="flex flex-wrap gap-2">
        {[
          { href: '/word-search', label: 'Word Search' },
          { href: '/card-scramble', label: 'Card Scramble' },
          { href: '/trivia', label: 'Card Trivia' },
          { href: '/card-connections', label: 'Card Connections' },
          { href: '/grading-game', label: 'Grading Game' },
        ].map(link => (
          <Link
            key={link.href}
            href={link.href}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white border border-gray-700 rounded-lg text-xs transition-colors"
          >
            {link.label} &rarr;
          </Link>
        ))}
      </div>
    </div>
  );
}
