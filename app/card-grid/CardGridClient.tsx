'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

// --- Types ---
type CriteriaType = 'sport' | 'decade' | 'valueTier' | 'isRookie';

interface Criteria {
  label: string;
  type: CriteriaType;
  value: string;
  color: string;
  match: (card: typeof sportsCards[0]) => boolean;
}

interface CellState {
  card: typeof sportsCards[0] | null;
  correct: boolean;
}

interface GameStats {
  gamesPlayed: number;
  bestScore: number;
  perfectGrids: number;
  totalCorrect: number;
}

// --- Helpers ---
function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function dateHash(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function parseValue(v: string): number {
  const m = v.match(/\$([0-9,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 5;
}

function getDecade(year: number): string {
  if (year < 1980) return 'Pre-1980';
  if (year < 1990) return '1980s';
  if (year < 2000) return '1990s';
  if (year < 2010) return '2000s';
  if (year < 2020) return '2010s';
  return '2020s';
}

function getValueTier(val: number): string {
  if (val >= 500) return '$500+';
  if (val >= 100) return '$100-499';
  if (val >= 25) return '$25-99';
  return 'Under $25';
}

const sportColors: Record<string, string> = {
  baseball: 'text-red-400',
  basketball: 'text-orange-400',
  football: 'text-blue-400',
  hockey: 'text-cyan-400',
};

const sportBg: Record<string, string> = {
  baseball: 'bg-red-950/60',
  basketball: 'bg-orange-950/60',
  football: 'bg-blue-950/60',
  hockey: 'bg-cyan-950/60',
};

// --- Criteria pool ---
const sportCriteria: Criteria[] = [
  { label: 'Baseball', type: 'sport', value: 'baseball', color: 'text-red-400', match: c => c.sport === 'baseball' },
  { label: 'Basketball', type: 'sport', value: 'basketball', color: 'text-orange-400', match: c => c.sport === 'basketball' },
  { label: 'Football', type: 'sport', value: 'football', color: 'text-blue-400', match: c => c.sport === 'football' },
  { label: 'Hockey', type: 'sport', value: 'hockey', color: 'text-cyan-400', match: c => c.sport === 'hockey' },
];

const decadeCriteria: Criteria[] = [
  { label: 'Pre-1980', type: 'decade', value: 'pre1980', color: 'text-amber-400', match: c => c.year < 1980 },
  { label: '1980s', type: 'decade', value: '1980s', color: 'text-amber-400', match: c => c.year >= 1980 && c.year < 1990 },
  { label: '1990s', type: 'decade', value: '1990s', color: 'text-purple-400', match: c => c.year >= 1990 && c.year < 2000 },
  { label: '2000s', type: 'decade', value: '2000s', color: 'text-teal-400', match: c => c.year >= 2000 && c.year < 2010 },
  { label: '2010s', type: 'decade', value: '2010s', color: 'text-emerald-400', match: c => c.year >= 2010 && c.year < 2020 },
  { label: '2020s', type: 'decade', value: '2020s', color: 'text-green-400', match: c => c.year >= 2020 },
];

const valueCriteria: Criteria[] = [
  { label: '$500+', type: 'valueTier', value: '500plus', color: 'text-yellow-400', match: c => parseValue(c.estimatedValueRaw) >= 500 },
  { label: '$100-499', type: 'valueTier', value: '100to499', color: 'text-emerald-400', match: c => { const v = parseValue(c.estimatedValueRaw); return v >= 100 && v < 500; } },
  { label: '$25-99', type: 'valueTier', value: '25to99', color: 'text-blue-400', match: c => { const v = parseValue(c.estimatedValueRaw); return v >= 25 && v < 100; } },
  { label: 'Under $25', type: 'valueTier', value: 'under25', color: 'text-zinc-400', match: c => parseValue(c.estimatedValueRaw) < 25 },
];

const rookieCriteria: Criteria[] = [
  { label: 'Rookies', type: 'isRookie', value: 'rookie', color: 'text-pink-400', match: c => c.rookie === true },
  { label: 'Veterans', type: 'isRookie', value: 'veteran', color: 'text-zinc-400', match: c => c.rookie !== true },
];

function shuffleArray<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickCriteria(rng: () => number): { rows: Criteria[]; cols: Criteria[] } {
  // Pick row criteria from one pool, column criteria from a different pool
  // Ensure every cell has at least some valid cards
  const pools = [sportCriteria, decadeCriteria, valueCriteria, rookieCriteria];
  const shuffledPools = shuffleArray(pools, rng);

  const rowPool = shuffledPools[0];
  const colPool = shuffledPools[1];

  const rows = shuffleArray(rowPool, rng).slice(0, 3);
  const cols = shuffleArray(colPool, rng).slice(0, 3);

  return { rows, cols };
}

function validateGrid(rows: Criteria[], cols: Criteria[]): boolean {
  // Ensure every cell has at least 2 matching cards
  for (const row of rows) {
    for (const col of cols) {
      const matches = sportsCards.filter(c => row.match(c) && col.match(c));
      if (matches.length < 2) return false;
    }
  }
  return true;
}

function generateGrid(seed: number): { rows: Criteria[]; cols: Criteria[] } {
  let attempts = 0;
  let rng = seededRng(seed);

  while (attempts < 50) {
    rng = seededRng(seed + attempts);
    const { rows, cols } = pickCriteria(rng);
    if (validateGrid(rows, cols)) return { rows, cols };
    attempts++;
  }

  // Fallback: safe grid with sports as rows and decades as columns
  return {
    rows: sportCriteria.slice(0, 3),
    cols: [decadeCriteria[4], decadeCriteria[5], decadeCriteria[2]], // 2010s, 2020s, 1990s
  };
}

const GAME_TIME = 90;
const GRID_SIZE = 3;

export default function CardGridClient() {
  const [mode, setMode] = useState<'daily' | 'random'>('daily');
  const [phase, setPhase] = useState<'ready' | 'playing' | 'done'>('ready');
  const [grid, setGrid] = useState<{ rows: Criteria[]; cols: Criteria[] }>({ rows: [], cols: [] });
  const [cells, setCells] = useState<CellState[][]>(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill({ card: null, correct: false })));
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [search, setSearch] = useState('');
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [usedCards, setUsedCards] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [guesses, setGuesses] = useState(0);
  const [maxGuesses] = useState(9);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [stats, setStats] = useState<GameStats>({ gamesPlayed: 0, bestScore: 0, perfectGrids: 0, totalCorrect: 0 });
  const [shareText, setShareText] = useState('');
  const [showCopied, setShowCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Load stats
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cardvault-card-grid-stats');
      if (saved) setStats(JSON.parse(saved));
    } catch {}
  }, []);

  // Generate grid on mode change
  useEffect(() => {
    const seed = mode === 'daily' ? dateHash() : Math.floor(Math.random() * 999999);
    const g = generateGrid(seed);
    setGrid(g);
    setCells(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill({ card: null, correct: false })));
    setSelectedCell(null);
    setSearch('');
    setTimeLeft(GAME_TIME);
    setUsedCards(new Set());
    setScore(0);
    setGuesses(0);
    setWrongGuesses(0);
    setPhase('ready');
    setShareText('');
    if (timerRef.current) clearInterval(timerRef.current);
  }, [mode]);

  // Timer
  useEffect(() => {
    if (phase === 'playing') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setPhase('done');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  // Check if grid is complete
  useEffect(() => {
    if (phase !== 'playing') return;
    const filledCount = cells.flat().filter(c => c.card !== null).length;
    if (filledCount === 9 || guesses >= maxGuesses) {
      if (timerRef.current) clearInterval(timerRef.current);
      setPhase('done');
    }
  }, [cells, guesses, maxGuesses, phase]);

  // End game — save stats and generate share
  useEffect(() => {
    if (phase !== 'done') return;
    const correct = cells.flat().filter(c => c.correct).length;
    const newStats = {
      gamesPlayed: stats.gamesPlayed + 1,
      bestScore: Math.max(stats.bestScore, score),
      perfectGrids: stats.perfectGrids + (correct === 9 ? 1 : 0),
      totalCorrect: stats.totalCorrect + correct,
    };
    setStats(newStats);
    try { localStorage.setItem('cardvault-card-grid-stats', JSON.stringify(newStats)); } catch {}

    // Generate share text
    const emojiGrid = cells.map(row =>
      row.map(c => c.correct ? '🟩' : c.card ? '🟥' : '⬛').join('')
    ).join('\n');
    const text = `CardVault Card Grid ${mode === 'daily' ? `#${dateHash()}` : '(Random)'}\n${correct}/9 | ${score} pts\n${emojiGrid}\nhttps://cardvault-two.vercel.app/card-grid`;
    setShareText(text);
  }, [phase]);

  const startGame = useCallback(() => {
    setPhase('playing');
  }, []);

  const newGame = useCallback(() => {
    if (mode === 'random') {
      const seed = Math.floor(Math.random() * 999999);
      const g = generateGrid(seed);
      setGrid(g);
    }
    setCells(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill({ card: null, correct: false })));
    setSelectedCell(null);
    setSearch('');
    setTimeLeft(GAME_TIME);
    setUsedCards(new Set());
    setScore(0);
    setGuesses(0);
    setWrongGuesses(0);
    setPhase('ready');
    setShareText('');
    if (timerRef.current) clearInterval(timerRef.current);
  }, [mode]);

  // Search results
  const searchResults = useMemo(() => {
    if (!search || search.length < 2 || !selectedCell) return [];
    const q = search.toLowerCase();
    return sportsCards
      .filter(c => !usedCards.has(c.slug) && (
        c.player.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.set.toLowerCase().includes(q)
      ))
      .slice(0, 8);
  }, [search, usedCards, selectedCell]);

  const selectCard = useCallback((card: typeof sportsCards[0]) => {
    if (!selectedCell || phase !== 'playing') return;
    const [r, c] = selectedCell;
    const rowCrit = grid.rows[r];
    const colCrit = grid.cols[c];
    const isCorrect = rowCrit.match(card) && colCrit.match(card);

    setCells(prev => {
      const next = prev.map(row => [...row]);
      next[r][c] = { card, correct: isCorrect };
      return next;
    });
    setUsedCards(prev => new Set([...prev, card.slug]));
    setGuesses(prev => prev + 1);

    if (isCorrect) {
      const timeBonus = Math.floor(timeLeft / 10);
      setScore(prev => prev + 100 + timeBonus);
    } else {
      setWrongGuesses(prev => prev + 1);
    }

    setSelectedCell(null);
    setSearch('');
  }, [selectedCell, phase, grid, timeLeft]);

  const copyShare = useCallback(() => {
    navigator.clipboard.writeText(shareText);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  }, [shareText]);

  const correctCount = cells.flat().filter(c => c.correct).length;
  const filledCount = cells.flat().filter(c => c.card !== null).length;

  const getGrade = () => {
    if (correctCount === 9 && wrongGuesses === 0 && timeLeft > 45) return { grade: 'S', label: 'Legendary', color: 'text-yellow-400' };
    if (correctCount === 9 && wrongGuesses === 0) return { grade: 'A+', label: 'Perfect', color: 'text-green-400' };
    if (correctCount >= 8) return { grade: 'A', label: 'Excellent', color: 'text-green-400' };
    if (correctCount >= 7) return { grade: 'B+', label: 'Great', color: 'text-blue-400' };
    if (correctCount >= 6) return { grade: 'B', label: 'Good', color: 'text-blue-400' };
    if (correctCount >= 5) return { grade: 'C+', label: 'Solid', color: 'text-amber-400' };
    if (correctCount >= 4) return { grade: 'C', label: 'Decent', color: 'text-amber-400' };
    if (correctCount >= 3) return { grade: 'D', label: 'Rough', color: 'text-orange-400' };
    return { grade: 'F', label: 'Study Up', color: 'text-red-400' };
  };

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMode('daily')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'daily' ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
        >
          Daily Challenge
        </button>
        <button
          onClick={() => setMode('random')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'random' ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
        >
          Random
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-white">{phase === 'playing' || phase === 'done' ? `${correctCount}/9` : '-'}</div>
          <div className="text-[10px] text-zinc-500">Correct</div>
        </div>
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-3 text-center">
          <div className={`text-lg font-bold ${timeLeft <= 15 ? 'text-red-400' : timeLeft <= 30 ? 'text-amber-400' : 'text-white'}`}>
            {phase === 'ready' ? `${GAME_TIME}s` : `${timeLeft}s`}
          </div>
          <div className="text-[10px] text-zinc-500">Time</div>
        </div>
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-white">{score}</div>
          <div className="text-[10px] text-zinc-500">Score</div>
        </div>
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-white">{guesses}/{maxGuesses}</div>
          <div className="text-[10px] text-zinc-500">Guesses</div>
        </div>
      </div>

      {/* Pre-game */}
      {phase === 'ready' && grid.rows.length > 0 && (
        <div className="text-center space-y-4">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-2">How to Play</h2>
            <div className="text-zinc-400 text-sm space-y-2 max-w-md mx-auto text-left">
              <p>1. Each cell has a <span className="text-indigo-400">row</span> and <span className="text-emerald-400">column</span> criteria</p>
              <p>2. Search for a card that matches <strong className="text-white">both</strong> criteria</p>
              <p>3. Fill all 9 cells before time runs out</p>
              <p>4. Each card can only be used once</p>
              <p>5. Wrong picks count against you but stay on the board</p>
            </div>
            <button
              onClick={startGame}
              className="mt-6 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors text-lg"
            >
              Start Game
            </button>
          </div>
        </div>
      )}

      {/* Game Grid */}
      {(phase === 'playing' || phase === 'done') && grid.rows.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <div className="min-w-[360px]">
              {/* Column headers */}
              <div className="grid grid-cols-4 gap-1 mb-1">
                <div className="p-2" /> {/* Empty corner */}
                {grid.cols.map((col, ci) => (
                  <div key={ci} className="bg-zinc-900/80 border border-zinc-700/50 rounded-lg p-2 text-center">
                    <span className={`text-xs sm:text-sm font-bold ${col.color}`}>{col.label}</span>
                  </div>
                ))}
              </div>

              {/* Grid rows */}
              {grid.rows.map((row, ri) => (
                <div key={ri} className="grid grid-cols-4 gap-1 mb-1">
                  {/* Row header */}
                  <div className="bg-zinc-900/80 border border-zinc-700/50 rounded-lg p-2 flex items-center justify-center">
                    <span className={`text-xs sm:text-sm font-bold ${row.color}`}>{row.label}</span>
                  </div>

                  {/* Cells */}
                  {grid.cols.map((col, ci) => {
                    const cell = cells[ri][ci];
                    const isSelected = selectedCell?.[0] === ri && selectedCell?.[1] === ci;
                    const isEmpty = !cell.card;
                    const canSelect = phase === 'playing' && isEmpty && guesses < maxGuesses;

                    return (
                      <button
                        key={ci}
                        onClick={() => {
                          if (canSelect) {
                            setSelectedCell([ri, ci]);
                            setSearch('');
                            setTimeout(() => searchRef.current?.focus(), 100);
                          }
                        }}
                        disabled={!canSelect}
                        className={`relative rounded-lg p-1.5 sm:p-2 min-h-[72px] sm:min-h-[90px] transition-all text-left ${
                          cell.card
                            ? cell.correct
                              ? 'bg-green-950/60 border-2 border-green-600/60'
                              : 'bg-red-950/60 border-2 border-red-600/60'
                            : isSelected
                              ? 'bg-indigo-950/60 border-2 border-indigo-500 ring-2 ring-indigo-400/30'
                              : canSelect
                                ? 'bg-zinc-800/60 border-2 border-zinc-700/50 hover:border-zinc-600 hover:bg-zinc-800 cursor-pointer'
                                : 'bg-zinc-900/40 border-2 border-zinc-800/30'
                        }`}
                      >
                        {cell.card ? (
                          <div className="space-y-0.5">
                            <p className="text-[10px] sm:text-xs font-semibold text-white leading-tight truncate">{cell.card.player}</p>
                            <p className="text-[9px] sm:text-[10px] text-zinc-400 leading-tight truncate">{cell.card.year} {cell.card.set}</p>
                            <p className={`text-[10px] font-medium ${sportColors[cell.card.sport] || 'text-zinc-400'}`}>{cell.card.sport}</p>
                            <p className="text-[10px] text-zinc-500">{cell.card.estimatedValueRaw}</p>
                            {cell.correct && <span className="absolute top-1 right-1 text-green-400 text-xs">&#10003;</span>}
                            {!cell.correct && <span className="absolute top-1 right-1 text-red-400 text-xs">&#10007;</span>}
                          </div>
                        ) : isSelected ? (
                          <div className="flex items-center justify-center h-full">
                            <span className="text-indigo-400 text-xs animate-pulse">Search below...</span>
                          </div>
                        ) : canSelect ? (
                          <div className="flex items-center justify-center h-full">
                            <span className="text-zinc-600 text-xl">+</span>
                          </div>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Search input */}
          {phase === 'playing' && selectedCell && (
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-zinc-500">
                  Cell: <span className={grid.rows[selectedCell[0]].color}>{grid.rows[selectedCell[0]].label}</span>
                  {' + '}
                  <span className={grid.cols[selectedCell[1]].color}>{grid.cols[selectedCell[1]].label}</span>
                </span>
                <button onClick={() => { setSelectedCell(null); setSearch(''); }} className="text-xs text-zinc-600 hover:text-zinc-400">Cancel</button>
              </div>
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search for a card (player name, set, year)..."
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                autoComplete="off"
              />
              {searchResults.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                  {searchResults.map(card => {
                    const rowMatch = grid.rows[selectedCell[0]].match(card);
                    const colMatch = grid.cols[selectedCell[1]].match(card);
                    return (
                      <button
                        key={card.slug}
                        onClick={() => selectCard(card)}
                        className="w-full text-left px-4 py-2.5 hover:bg-zinc-800 border-b border-zinc-800/50 last:border-0 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm text-white font-medium truncate">{card.player}</p>
                            <p className="text-xs text-zinc-400 truncate">{card.year} {card.set} {card.name}</p>
                          </div>
                          <div className="shrink-0 flex items-center gap-1.5">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${sportBg[card.sport] || 'bg-zinc-800'} ${sportColors[card.sport] || 'text-zinc-400'}`}>
                              {card.sport.slice(0, 3).toUpperCase()}
                            </span>
                            <span className="text-xs text-zinc-500">{card.estimatedValueRaw}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
              {search.length >= 2 && searchResults.length === 0 && (
                <div className="absolute z-20 w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-lg p-4 text-center">
                  <p className="text-zinc-500 text-sm">No cards found. Try a different search.</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Results */}
      {phase === 'done' && (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 space-y-6">
          <div className="text-center">
            {(() => { const g = getGrade(); return (
              <>
                <div className={`text-5xl font-black ${g.color} mb-2`}>{g.grade}</div>
                <div className="text-lg text-zinc-400">{g.label}</div>
              </>
            ); })()}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-zinc-800/60 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-green-400">{correctCount}/9</div>
              <div className="text-[10px] text-zinc-500">Correct</div>
            </div>
            <div className="bg-zinc-800/60 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-red-400">{wrongGuesses}</div>
              <div className="text-[10px] text-zinc-500">Wrong</div>
            </div>
            <div className="bg-zinc-800/60 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-indigo-400">{score}</div>
              <div className="text-[10px] text-zinc-500">Score</div>
            </div>
            <div className="bg-zinc-800/60 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-amber-400">{GAME_TIME - timeLeft}s</div>
              <div className="text-[10px] text-zinc-500">Time Used</div>
            </div>
          </div>

          {/* Share */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={copyShare}
              className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors text-sm"
            >
              {showCopied ? 'Copied!' : 'Share Results'}
            </button>
            <button
              onClick={() => { setMode('random'); }}
              className="flex-1 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors text-sm"
            >
              New Random Grid
            </button>
          </div>

          {/* Lifetime stats */}
          <div className="border-t border-zinc-800 pt-4">
            <h3 className="text-sm font-semibold text-white mb-3">Lifetime Stats</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div>
                <div className="text-lg font-bold text-white">{stats.gamesPlayed}</div>
                <div className="text-[10px] text-zinc-500">Games</div>
              </div>
              <div>
                <div className="text-lg font-bold text-white">{stats.bestScore}</div>
                <div className="text-[10px] text-zinc-500">Best Score</div>
              </div>
              <div>
                <div className="text-lg font-bold text-white">{stats.perfectGrids}</div>
                <div className="text-[10px] text-zinc-500">Perfect Grids</div>
              </div>
              <div>
                <div className="text-lg font-bold text-white">{stats.totalCorrect}</div>
                <div className="text-[10px] text-zinc-500">Total Correct</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* How to Play Guide */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">How Card Grid Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { step: '1', title: 'Read the Grid', desc: 'Each row and column has a criteria — sport, decade, value tier, or card type. Every cell needs a card matching both its row AND column.' },
            { step: '2', title: 'Search & Place', desc: 'Click a cell, then search for any card from our 9,000+ database. Pick one that satisfies both criteria to fill the cell.' },
            { step: '3', title: 'Beat the Clock', desc: 'You have 90 seconds and 9 guesses. Correct placements earn 100 points plus a time bonus. Wrong picks stay on the board.' },
            { step: '4', title: 'Share Your Grid', desc: 'After the game, share your emoji result grid. Daily mode uses the same grid for everyone so you can compare with friends.' },
          ].map(item => (
            <div key={item.step} className="flex gap-3">
              <div className="shrink-0 w-8 h-8 bg-indigo-600/30 border border-indigo-500/30 rounded-full flex items-center justify-center text-indigo-400 font-bold text-sm">
                {item.step}
              </div>
              <div>
                <p className="text-white text-sm font-medium">{item.title}</p>
                <p className="text-zinc-400 text-xs mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Grid Tips</h2>
        <div className="space-y-3">
          {[
            'Start with the hardest cells first — they have fewer valid cards, so pick them while your options are open.',
            'Use versatile cards wisely. A 2020s baseball rookie worth $100+ could fit many cells.',
            'Remember your sports history. Knowing which players played in which decade gives you an edge.',
            'The daily grid is the same for everyone — compare with friends to see who knows cards best.',
            'Each card can only be used once. Plan ahead to avoid painting yourself into a corner.',
          ].map((tip, i) => (
            <div key={i} className="flex gap-2">
              <span className="text-indigo-400 shrink-0">&#8226;</span>
              <p className="text-zinc-400 text-sm">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
