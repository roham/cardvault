'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { sportsCards, type Sport } from '@/data/sports-cards';

const SPORTS: Sport[] = ['baseball', 'basketball', 'football', 'hockey'];
const SPORT_LABELS: Record<string, string> = { baseball: 'MLB', basketball: 'NBA', football: 'NFL', hockey: 'NHL' };
const SPORT_COLORS: Record<string, string> = {
  baseball: 'bg-red-900/60 border-red-700/50 text-red-300',
  basketball: 'bg-orange-900/60 border-orange-700/50 text-orange-300',
  football: 'bg-blue-900/60 border-blue-700/50 text-blue-300',
  hockey: 'bg-cyan-900/60 border-cyan-700/50 text-cyan-300',
};
const SPORT_ICONS: Record<string, string> = { baseball: '⚾', basketball: '🏀', football: '🏈', hockey: '🏒' };

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

interface PuzzleCard {
  player: string;
  sport: Sport;
  year: number;
  set: string;
  slug: string;
}

function generatePuzzle(seed: number): { solution: (PuzzleCard | null)[][]; clues: (PuzzleCard | null)[][] } {
  const rng = seededRng(seed);

  // Pick 16 cards — 4 per sport
  const cardsBySport: Record<Sport, PuzzleCard[]> = { baseball: [], basketball: [], football: [], hockey: [] };
  for (const sport of SPORTS) {
    const sportCards = sportsCards.filter(c => c.sport === sport);
    const shuffled = [...sportCards].sort(() => rng() - 0.5);
    const seen = new Set<string>();
    for (const card of shuffled) {
      if (!seen.has(card.player) && cardsBySport[sport].length < 4) {
        seen.add(card.player);
        cardsBySport[sport].push({ player: card.player, sport: card.sport, year: card.year, set: card.set, slug: card.slug });
      }
    }
  }

  // Create a valid 4x4 Latin square for sports
  // Each row and column has exactly one of each sport
  const sportOrders: Sport[][] = [
    [...SPORTS],
    [SPORTS[1], SPORTS[0], SPORTS[3], SPORTS[2]],
    [SPORTS[2], SPORTS[3], SPORTS[0], SPORTS[1]],
    [SPORTS[3], SPORTS[2], SPORTS[1], SPORTS[0]],
  ];

  // Shuffle rows and columns for variety
  const rowOrder = [0, 1, 2, 3].sort(() => rng() - 0.5);
  const colOrder = [0, 1, 2, 3].sort(() => rng() - 0.5);

  const solution: (PuzzleCard | null)[][] = Array.from({ length: 4 }, () => Array(4).fill(null));
  const sportIndex: Record<Sport, number> = { baseball: 0, basketball: 0, football: 0, hockey: 0 };

  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const sport = sportOrders[rowOrder[r]][colOrder[c]];
      const card = cardsBySport[sport][sportIndex[sport]];
      sportIndex[sport]++;
      solution[r][c] = card;
    }
  }

  // Create clues — reveal some cells
  const clues: (PuzzleCard | null)[][] = Array.from({ length: 4 }, () => Array(4).fill(null));
  // Reveal 6-8 cells as clues
  const positions: [number, number][] = [];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) positions.push([r, c]);
  const shuffledPos = positions.sort(() => rng() - 0.5);
  const clueCount = 6 + Math.floor(rng() * 3); // 6-8 clues
  for (let i = 0; i < clueCount; i++) {
    const [r, c] = shuffledPos[i];
    clues[r][c] = solution[r][c];
  }

  return { solution, clues };
}

const STATS_KEY = 'cardvault-sudoku-stats';
interface Stats { played: number; won: number; streak: number; bestStreak: number; }

function loadStats(): Stats {
  if (typeof window === 'undefined') return { played: 0, won: 0, streak: 0, bestStreak: 0 };
  try { const r = localStorage.getItem(STATS_KEY); if (r) return JSON.parse(r); } catch {}
  return { played: 0, won: 0, streak: 0, bestStreak: 0 };
}
function saveStats(s: Stats) { try { localStorage.setItem(STATS_KEY, JSON.stringify(s)); } catch {} }

export default function CardSudokuClient() {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<'daily' | 'random'>('daily');
  const [seed, setSeed] = useState(0);
  const [board, setBoard] = useState<(PuzzleCard | null)[][]>([]);
  const [clues, setClues] = useState<(PuzzleCard | null)[][]>([]);
  const [solution, setSolution] = useState<(PuzzleCard | null)[][]>([]);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
  const [gameState, setGameState] = useState<'playing' | 'won'>('playing');
  const [stats, setStats] = useState<Stats>(loadStats());
  const [errors, setErrors] = useState<Set<string>>(new Set());

  useEffect(() => { setMounted(true); setStats(loadStats()); }, []);

  const startGame = useCallback((gameMode: 'daily' | 'random') => {
    setMode(gameMode);
    const s = gameMode === 'daily' ? dateHash(new Date()) + 777 : Math.floor(Math.random() * 999999);
    setSeed(s);
    const puzzle = generatePuzzle(s);
    setSolution(puzzle.solution);
    setClues(puzzle.clues);
    setBoard(puzzle.clues.map(row => [...row]));
    setSelectedCell(null);
    setSelectedSport(null);
    setGameState('playing');
    setErrors(new Set());
  }, []);

  useEffect(() => { if (mounted) startGame('daily'); }, [mounted, startGame]);

  // Available cards for each sport (from the solution, not yet placed)
  const availableCards = useMemo(() => {
    const result: Record<Sport, PuzzleCard[]> = { baseball: [], basketball: [], football: [], hockey: [] };
    if (!solution.length) return result;

    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const sol = solution[r][c];
        const placed = board[r]?.[c];
        if (sol && !placed) {
          result[sol.sport].push(sol);
        }
      }
    }
    return result;
  }, [solution, board]);

  const handleCellClick = useCallback((r: number, c: number) => {
    if (gameState !== 'playing') return;
    if (clues[r]?.[c]) return; // Can't change clues
    setSelectedCell([r, c]);

    if (selectedSport && !board[r]?.[c]) {
      // Find a card for this sport from solution at this position
      const sol = solution[r][c];
      if (sol && sol.sport === selectedSport) {
        const newBoard = board.map(row => [...row]);
        newBoard[r][c] = sol;
        setBoard(newBoard);
        setSelectedSport(null);
        setSelectedCell(null);

        // Remove from errors if it was there
        const newErrors = new Set(errors);
        newErrors.delete(`${r}-${c}`);
        setErrors(newErrors);

        // Check win
        const filled = newBoard.every(row => row.every(cell => cell !== null));
        if (filled) {
          setGameState('won');
          const newStats: Stats = {
            played: stats.played + 1,
            won: stats.won + 1,
            streak: stats.streak + 1,
            bestStreak: Math.max(stats.bestStreak, stats.streak + 1),
          };
          setStats(newStats);
          saveStats(newStats);
        }
      } else if (sol && sol.sport !== selectedSport) {
        // Wrong sport — mark error
        const newErrors = new Set(errors);
        newErrors.add(`${r}-${c}`);
        setErrors(newErrors);
        setSelectedSport(null);
        setTimeout(() => {
          setErrors(prev => { const n = new Set(prev); n.delete(`${r}-${c}`); return n; });
        }, 1000);
      }
    }
  }, [gameState, clues, board, solution, selectedSport, errors, stats]);

  const handleSportSelect = useCallback((sport: Sport) => {
    if (gameState !== 'playing') return;
    setSelectedSport(prev => prev === sport ? null : sport);
  }, [gameState]);

  const handleClear = useCallback((r: number, c: number) => {
    if (clues[r]?.[c]) return;
    const newBoard = board.map(row => [...row]);
    newBoard[r][c] = null;
    setBoard(newBoard);
  }, [board, clues]);

  if (!mounted) return <div className="text-center py-20 text-gray-400">Loading...</div>;

  const filledCount = board.flat().filter(c => c !== null).length;

  return (
    <div>
      {/* Mode selector */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => startGame('daily')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${mode === 'daily' ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
          Daily Challenge
        </button>
        <button onClick={() => startGame('random')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${mode === 'random' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
          Random
        </button>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-4 mb-4 text-sm">
        <span className="text-gray-500">Filled: <span className="text-white font-mono">{filledCount}/16</span></span>
        {gameState === 'won' && <span className="text-emerald-400 font-bold animate-pulse">Solved!</span>}
      </div>

      {/* Sport selector palette */}
      <div className="flex gap-2 mb-4">
        {SPORTS.map(sport => {
          const remaining = availableCards[sport].length;
          return (
            <button
              key={sport}
              onClick={() => handleSportSelect(sport)}
              disabled={remaining === 0}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                selectedSport === sport
                  ? `${SPORT_COLORS[sport]} ring-2 ring-white/30`
                  : remaining === 0
                    ? 'bg-gray-800/30 text-gray-600 border-gray-800 cursor-not-allowed'
                    : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
              }`}
            >
              <span>{SPORT_ICONS[sport]}</span>
              <span>{SPORT_LABELS[sport]}</span>
              <span className="text-xs opacity-70">({remaining})</span>
            </button>
          );
        })}
      </div>

      {selectedSport && (
        <p className="text-sm text-amber-400 mb-3">
          Click a cell to place {SPORT_ICONS[selectedSport]} {SPORT_LABELS[selectedSport]}
        </p>
      )}

      {/* Board */}
      <div className="inline-block bg-gray-900 border border-gray-700 rounded-xl p-3">
        {/* Column headers */}
        <div className="grid grid-cols-4 gap-1 mb-1">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="w-20 h-6 sm:w-24 text-center text-xs text-gray-600 font-medium">
              Col {i}
            </div>
          ))}
        </div>
        {/* Grid */}
        <div className="grid grid-cols-4 gap-1">
          {board.map((row, r) =>
            row.map((cell, c) => {
              const isClue = clues[r]?.[c] !== null;
              const isSelected = selectedCell?.[0] === r && selectedCell?.[1] === c;
              const isError = errors.has(`${r}-${c}`);

              let cellClass = 'bg-gray-800 hover:bg-gray-700 cursor-pointer';
              if (isClue) cellClass = `${SPORT_COLORS[cell!.sport]} opacity-80`;
              else if (cell) cellClass = `${SPORT_COLORS[cell.sport]}`;
              else if (isError) cellClass = 'bg-red-900/50 border-red-500 animate-pulse';
              if (isSelected && !isClue) cellClass += ' ring-2 ring-amber-400';

              return (
                <button
                  key={`${r}-${c}`}
                  className={`w-20 h-20 sm:w-24 sm:h-24 rounded-lg border flex flex-col items-center justify-center p-1.5 transition-all ${cellClass}`}
                  onClick={() => handleCellClick(r, c)}
                  onDoubleClick={() => handleClear(r, c)}
                >
                  {cell ? (
                    <>
                      <span className="text-xl sm:text-2xl">{SPORT_ICONS[cell.sport]}</span>
                      <span className="text-[9px] sm:text-[10px] text-center leading-tight mt-0.5 line-clamp-2 opacity-80">
                        {cell.player}
                      </span>
                      {isClue && <span className="text-[8px] text-gray-500 mt-0.5">clue</span>}
                    </>
                  ) : (
                    <span className="text-gray-600 text-xs">?</span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="mt-4 flex gap-2">
        <button onClick={() => startGame(mode)} className="px-4 py-2 bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors">
          {gameState === 'won' ? '🔄 New Game' : '🔄 Restart'}
        </button>
      </div>

      <p className="text-gray-500 text-xs mt-3">
        💡 Select a sport, then click a cell. Each row and column must have exactly one of each sport. Double-click to clear a cell.
      </p>

      {/* Win message */}
      {gameState === 'won' && (
        <div className="mt-6 bg-emerald-950/30 border border-emerald-800/50 rounded-xl p-4">
          <h3 className="text-lg font-bold text-emerald-400 mb-2">Puzzle Complete!</h3>
          <p className="text-gray-400 text-sm">
            You placed all 16 cards correctly — one {SPORT_ICONS.baseball} {SPORT_ICONS.basketball} {SPORT_ICONS.football} {SPORT_ICONS.hockey} per row and column.
          </p>
          <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
            {SPORTS.map(sport => {
              const cards = solution.flat().filter(c => c?.sport === sport);
              return (
                <div key={sport} className={`rounded-lg p-2 ${SPORT_COLORS[sport]}`}>
                  <div className="text-lg">{SPORT_ICONS[sport]}</div>
                  <div className="font-medium">{SPORT_LABELS[sport]}</div>
                  <div className="opacity-70">{cards.map(c => c?.player.split(' ').pop()).join(', ')}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="mt-8 bg-gray-800/40 border border-gray-700/50 rounded-xl p-4">
        <h3 className="text-base font-bold text-white mb-3">Your Stats</h3>
        <div className="grid grid-cols-4 gap-3 text-center">
          <div><div className="text-2xl font-bold text-white">{stats.played}</div><div className="text-xs text-gray-500">Played</div></div>
          <div><div className="text-2xl font-bold text-emerald-400">{stats.won}</div><div className="text-xs text-gray-500">Solved</div></div>
          <div><div className="text-2xl font-bold text-amber-400">{stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0}%</div><div className="text-xs text-gray-500">Win Rate</div></div>
          <div><div className="text-2xl font-bold text-purple-400">{stats.bestStreak}</div><div className="text-xs text-gray-500">Best Streak</div></div>
        </div>
      </div>

      {/* How to Play */}
      <div className="mt-8 bg-gray-800/40 border border-gray-700/50 rounded-xl p-5">
        <h3 className="text-base font-bold text-white mb-3">How to Play</h3>
        <div className="space-y-2 text-sm text-gray-400">
          <p>🎯 <strong className="text-gray-200">Goal:</strong> Fill every cell so each row and column contains exactly one card from each sport.</p>
          <p>🎨 <strong className="text-gray-200">Place:</strong> Select a sport from the palette, then click an empty cell to place it.</p>
          <p>🔒 <strong className="text-gray-200">Clues:</strong> Pre-filled cells are locked — use them as hints to deduce the rest.</p>
          <p>❌ <strong className="text-gray-200">Wrong:</strong> If you place the wrong sport, the cell flashes red.</p>
          <p>🔄 <strong className="text-gray-200">Clear:</strong> Double-click a non-clue cell to remove your placement.</p>
          <p>📅 <strong className="text-gray-200">Daily:</strong> Same puzzle for everyone each day. Random mode for unlimited play.</p>
        </div>
      </div>

      {/* Related */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { href: '/card-crossword', title: 'Card Crossword', desc: 'Daily mini puzzle' },
          { href: '/card-minesweeper', title: 'Card Minesweeper', desc: 'Find hidden hits' },
          { href: '/card-connections', title: 'Card Connections', desc: 'Group cards by theme' },
          { href: '/guess-the-card', title: 'Guess the Card', desc: 'Wordle-style game' },
          { href: '/trivia', title: 'Daily Trivia', desc: '5 questions a day' },
          { href: '/word-search', title: 'Word Search', desc: 'Find hobby terms' },
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
