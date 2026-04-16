'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

/* ─── Constants ─────────────────────────────────────────── */
const GRID_SIZE = 7;
const MAX_MOVES = 20;
const LOOT_COUNT = 8; // minor reward cells

type CellState = 'hidden' | 'revealed' | 'treasure' | 'loot' | 'empty';

interface Cell {
  row: number;
  col: number;
  state: CellState;
  card: typeof sportsCards[0] | null;
  distance: number; // distance to treasure
}

interface GameStats {
  gamesPlayed: number;
  treasuresFound: number;
  bestMoves: number;
  currentStreak: number;
  bestStreak: number;
}

/* ─── Helpers ───────────────────────────────────────────── */
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

function formatMoney(n: number): string {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${Math.round(n).toLocaleString()}`;
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function manhattanDistance(r1: number, c1: number, r2: number, c2: number): number {
  return Math.abs(r1 - r2) + Math.abs(c1 - c2);
}

function getHintLabel(distance: number): { label: string; color: string; bg: string } {
  if (distance === 0) return { label: '💎 TREASURE!', color: 'text-yellow-300', bg: 'bg-yellow-900/60 border-yellow-500' };
  if (distance <= 2) return { label: '🔥 Scorching', color: 'text-red-400', bg: 'bg-red-900/40 border-red-700/50' };
  if (distance <= 4) return { label: '🌡️ Hot', color: 'text-orange-400', bg: 'bg-orange-900/30 border-orange-700/40' };
  if (distance <= 6) return { label: '☀️ Warm', color: 'text-amber-400', bg: 'bg-amber-900/30 border-amber-700/40' };
  if (distance <= 8) return { label: '🌤️ Cool', color: 'text-blue-300', bg: 'bg-blue-900/30 border-blue-700/40' };
  return { label: '❄️ Cold', color: 'text-cyan-300', bg: 'bg-cyan-900/30 border-cyan-700/40' };
}

function getGrade(movesUsed: number, found: boolean): { grade: string; color: string } {
  if (!found) return { grade: 'F', color: 'text-red-400' };
  if (movesUsed <= 5) return { grade: 'S', color: 'text-yellow-400' };
  if (movesUsed <= 8) return { grade: 'A', color: 'text-green-400' };
  if (movesUsed <= 12) return { grade: 'B', color: 'text-blue-400' };
  if (movesUsed <= 16) return { grade: 'C', color: 'text-purple-400' };
  return { grade: 'D', color: 'text-gray-400' };
}

/* ─── Storage ──────────────────────────────────────────── */
const STATS_KEY = 'cv-treasure-map-stats';
const DAILY_KEY = 'cv-treasure-map-daily';

function loadStats(): GameStats {
  if (typeof window === 'undefined') return { gamesPlayed: 0, treasuresFound: 0, bestMoves: 99, currentStreak: 0, bestStreak: 0 };
  try {
    const raw = localStorage.getItem(STATS_KEY);
    return raw ? JSON.parse(raw) : { gamesPlayed: 0, treasuresFound: 0, bestMoves: 99, currentStreak: 0, bestStreak: 0 };
  } catch { return { gamesPlayed: 0, treasuresFound: 0, bestMoves: 99, currentStreak: 0, bestStreak: 0 }; }
}

function saveStats(s: GameStats) {
  try { localStorage.setItem(STATS_KEY, JSON.stringify(s)); } catch {}
}

function getDailyCompleted(): string | null {
  if (typeof window === 'undefined') return null;
  try { return localStorage.getItem(DAILY_KEY); } catch { return null; }
}

function setDailyCompleted(hash: string) {
  try { localStorage.setItem(DAILY_KEY, hash); } catch {}
}

/* ─── Component ────────────────────────────────────────── */
export default function CardTreasureMapClient() {
  const [mode, setMode] = useState<'daily' | 'random'>('daily');
  const [grid, setGrid] = useState<Cell[]>([]);
  const [movesUsed, setMovesUsed] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [treasureFound, setTreasureFound] = useState(false);
  const [treasureCard, setTreasureCard] = useState<typeof sportsCards[0] | null>(null);
  const [treasurePos, setTreasurePos] = useState<{ row: number; col: number }>({ row: 0, col: 0 });
  const [lastHint, setLastHint] = useState<{ label: string; color: string; bg: string } | null>(null);
  const [lootCollected, setLootCollected] = useState<typeof sportsCards[0][]>([]);
  const [stats, setStats] = useState<GameStats>(loadStats());
  const [sportFilter, setSportFilter] = useState<string>('all');
  const [shareText, setShareText] = useState('');
  const [dailyDone, setDailyDone] = useState(false);

  const initGame = useCallback((gameMode: 'daily' | 'random') => {
    const seed = gameMode === 'daily' ? dateHash() * 7919 : Date.now();
    const rng = seededRng(seed);

    const filtered = sportFilter === 'all' ? sportsCards : sportsCards.filter(c => c.sport.toLowerCase() === sportFilter);
    const pool = filtered.length > 20 ? filtered : sportsCards;
    const shuffled = shuffle(pool, rng);

    // Pick treasure card (high-value card)
    const sorted = [...shuffled].sort((a, b) => parseValue(b.estimatedValueRaw) - parseValue(a.estimatedValueRaw));
    const topCards = sorted.slice(0, Math.max(20, Math.floor(sorted.length * 0.05)));
    const tCard = topCards[Math.floor(rng() * topCards.length)];

    // Pick loot cards (random mid-value)
    const lootCards = shuffled.filter(c => c.slug !== tCard.slug).slice(0, LOOT_COUNT);

    // Place treasure
    const tRow = Math.floor(rng() * GRID_SIZE);
    const tCol = Math.floor(rng() * GRID_SIZE);

    // Place loot
    const lootPositions: Set<string> = new Set();
    lootPositions.add(`${tRow}-${tCol}`);
    const lootMap = new Map<string, typeof sportsCards[0]>();
    let li = 0;
    while (lootMap.size < LOOT_COUNT && li < 200) {
      const r = Math.floor(rng() * GRID_SIZE);
      const c = Math.floor(rng() * GRID_SIZE);
      const key = `${r}-${c}`;
      if (!lootPositions.has(key)) {
        lootPositions.add(key);
        lootMap.set(key, lootCards[lootMap.size % lootCards.length]);
      }
      li++;
    }

    // Build grid
    const cells: Cell[] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const dist = manhattanDistance(r, c, tRow, tCol);
        const key = `${r}-${c}`;
        const isT = r === tRow && c === tCol;
        const lootCard = lootMap.get(key);
        cells.push({
          row: r,
          col: c,
          state: 'hidden',
          card: isT ? tCard : (lootCard || null),
          distance: dist,
        });
      }
    }

    setGrid(cells);
    setTreasureCard(tCard);
    setTreasurePos({ row: tRow, col: tCol });
    setMovesUsed(0);
    setGameOver(false);
    setTreasureFound(false);
    setLastHint(null);
    setLootCollected([]);
    setShareText('');

    // Check if daily already completed
    if (gameMode === 'daily') {
      const hash = String(dateHash());
      setDailyDone(getDailyCompleted() === hash);
    } else {
      setDailyDone(false);
    }
  }, [sportFilter]);

  useEffect(() => {
    setStats(loadStats());
    initGame(mode);
  }, [mode, initGame]);

  const revealCell = (index: number) => {
    if (gameOver || grid[index].state !== 'hidden') return;
    if (mode === 'daily' && dailyDone) return;

    const newGrid = [...grid];
    const cell = { ...newGrid[index] };
    const dist = cell.distance;

    const hint = getHintLabel(dist);
    setLastHint(hint);

    if (dist === 0) {
      // Found treasure!
      cell.state = 'treasure';
      newGrid[index] = cell;
      setGrid(newGrid);
      setTreasureFound(true);
      setGameOver(true);
      const newMoves = movesUsed + 1;
      setMovesUsed(newMoves);

      const newStats = { ...stats };
      newStats.gamesPlayed++;
      newStats.treasuresFound++;
      newStats.currentStreak++;
      if (newStats.currentStreak > newStats.bestStreak) newStats.bestStreak = newStats.currentStreak;
      if (newMoves < newStats.bestMoves) newStats.bestMoves = newMoves;
      setStats(newStats);
      saveStats(newStats);

      if (mode === 'daily') setDailyCompleted(String(dateHash()));

      // Generate share text
      const grade = getGrade(newMoves, true);
      const gridEmoji = newGrid.map(c => {
        if (c.state === 'treasure') return '💎';
        if (c.state === 'loot') return '🟡';
        if (c.state === 'revealed') return c.distance <= 2 ? '🟥' : c.distance <= 4 ? '🟧' : c.distance <= 6 ? '🟨' : '🟦';
        return '⬛';
      });
      const rows: string[] = [];
      for (let r = 0; r < GRID_SIZE; r++) {
        rows.push(gridEmoji.slice(r * GRID_SIZE, (r + 1) * GRID_SIZE).join(''));
      }
      setShareText(`Card Treasure Map ${mode === 'daily' ? '(Daily)' : '(Random)'}\n${grade.grade} Grade — Found in ${newMoves}/${MAX_MOVES} moves\n\n${rows.join('\n')}\n\nhttps://cardvault-two.vercel.app/card-treasure-map`);
    } else if (cell.card) {
      // Found loot
      cell.state = 'loot';
      newGrid[index] = cell;
      setGrid(newGrid);
      setLootCollected(prev => [...prev, cell.card!]);
      setMovesUsed(prev => prev + 1);

      // Check if out of moves
      if (movesUsed + 1 >= MAX_MOVES) {
        endGame(newGrid, movesUsed + 1, false);
      }
    } else {
      // Empty cell
      cell.state = 'revealed';
      newGrid[index] = cell;
      setGrid(newGrid);
      setMovesUsed(prev => prev + 1);

      if (movesUsed + 1 >= MAX_MOVES) {
        endGame(newGrid, movesUsed + 1, false);
      }
    }
  };

  const endGame = (finalGrid: Cell[], finalMoves: number, found: boolean) => {
    setGameOver(true);
    setTreasureFound(found);

    // Reveal treasure location
    const idx = treasurePos.row * GRID_SIZE + treasurePos.col;
    const ng = [...finalGrid];
    if (ng[idx].state === 'hidden') {
      ng[idx] = { ...ng[idx], state: 'treasure' };
      setGrid(ng);
    }

    const newStats = { ...stats };
    newStats.gamesPlayed++;
    if (!found) newStats.currentStreak = 0;
    setStats(newStats);
    saveStats(newStats);

    if (mode === 'daily') setDailyCompleted(String(dateHash()));

    const grade = getGrade(finalMoves, found);
    const gridEmoji = ng.map(c => {
      if (c.state === 'treasure') return found ? '💎' : '❌';
      if (c.state === 'loot') return '🟡';
      if (c.state === 'revealed') return c.distance <= 2 ? '🟥' : c.distance <= 4 ? '🟧' : c.distance <= 6 ? '🟨' : '🟦';
      return '⬛';
    });
    const rows: string[] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      rows.push(gridEmoji.slice(r * GRID_SIZE, (r + 1) * GRID_SIZE).join(''));
    }
    setShareText(`Card Treasure Map ${mode === 'daily' ? '(Daily)' : '(Random)'}\n${grade.grade} Grade — ${found ? `Found in ${finalMoves}` : `Not found (${finalMoves})`}/${MAX_MOVES} moves\n\n${rows.join('\n')}\n\nhttps://cardvault-two.vercel.app/card-treasure-map`);
  };

  const copyShare = () => {
    navigator.clipboard.writeText(shareText).catch(() => {});
  };

  const movesLeft = MAX_MOVES - movesUsed;
  const grade = getGrade(movesUsed, treasureFound);

  return (
    <div>
      {/* Mode Toggle + Sport Filter */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex rounded-lg overflow-hidden border border-gray-700">
          <button
            onClick={() => setMode('daily')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${mode === 'daily' ? 'bg-amber-700 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
          >
            Daily Map
          </button>
          <button
            onClick={() => setMode('random')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${mode === 'random' ? 'bg-amber-700 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
          >
            Random
          </button>
        </div>
        <select
          value={sportFilter}
          onChange={e => setSportFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2"
        >
          <option value="all">All Sports</option>
          <option value="baseball">Baseball</option>
          <option value="basketball">Basketball</option>
          <option value="football">Football</option>
          <option value="hockey">Hockey</option>
        </select>
        {mode === 'random' && (
          <button
            onClick={() => initGame('random')}
            className="px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg hover:bg-gray-700 transition-colors"
          >
            New Map
          </button>
        )}
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-gray-800/60 border border-gray-700/50 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-amber-400">{movesLeft}</div>
          <div className="text-xs text-gray-500">Moves Left</div>
        </div>
        <div className="bg-gray-800/60 border border-gray-700/50 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-green-400">{lootCollected.length}</div>
          <div className="text-xs text-gray-500">Loot Found</div>
        </div>
        <div className="bg-gray-800/60 border border-gray-700/50 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-purple-400">{stats.treasuresFound}</div>
          <div className="text-xs text-gray-500">Total Finds</div>
        </div>
        <div className="bg-gray-800/60 border border-gray-700/50 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-cyan-400">{stats.bestMoves < 99 ? stats.bestMoves : '—'}</div>
          <div className="text-xs text-gray-500">Best Moves</div>
        </div>
      </div>

      {/* Last Hint */}
      {lastHint && !gameOver && (
        <div className={`mb-4 px-4 py-2 rounded-lg border text-center text-sm font-medium ${lastHint.bg} ${lastHint.color}`}>
          {lastHint.label} — {movesLeft} moves remaining
        </div>
      )}

      {/* Daily Already Completed */}
      {mode === 'daily' && dailyDone && !gameOver && (
        <div className="mb-4 px-4 py-3 rounded-lg border border-amber-700/50 bg-amber-900/30 text-amber-300 text-sm text-center">
          You already completed today&apos;s map. Try Random mode for more!
        </div>
      )}

      {/* Grid */}
      <div className="mb-6">
        <div
          className="grid gap-1 sm:gap-1.5 mx-auto"
          style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`, maxWidth: '420px' }}
        >
          {grid.map((cell, i) => {
            const isClickable = !gameOver && cell.state === 'hidden' && !(mode === 'daily' && dailyDone);
            let cellClass = 'aspect-square rounded-md flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-200 border ';

            if (cell.state === 'hidden') {
              cellClass += isClickable
                ? 'bg-gray-800 border-gray-600 hover:bg-gray-700 hover:border-amber-600 cursor-pointer active:scale-95'
                : 'bg-gray-800/50 border-gray-700/50 cursor-default';
            } else if (cell.state === 'treasure') {
              cellClass += 'bg-yellow-900/60 border-yellow-500 animate-pulse shadow-lg shadow-yellow-500/20';
            } else if (cell.state === 'loot') {
              cellClass += 'bg-green-900/40 border-green-600/50';
            } else {
              // revealed empty — color by distance
              if (cell.distance <= 2) cellClass += 'bg-red-900/30 border-red-700/40';
              else if (cell.distance <= 4) cellClass += 'bg-orange-900/25 border-orange-700/30';
              else if (cell.distance <= 6) cellClass += 'bg-amber-900/20 border-amber-700/30';
              else cellClass += 'bg-blue-900/20 border-blue-700/30';
            }

            return (
              <button
                key={i}
                onClick={() => revealCell(i)}
                disabled={!isClickable}
                className={cellClass}
                title={cell.state === 'hidden' ? `Row ${cell.row + 1}, Col ${cell.col + 1}` : ''}
              >
                {cell.state === 'hidden' && '?'}
                {cell.state === 'treasure' && '💎'}
                {cell.state === 'loot' && '🟡'}
                {cell.state === 'revealed' && (
                  <span className={cell.distance <= 2 ? 'text-red-400' : cell.distance <= 4 ? 'text-orange-400' : cell.distance <= 6 ? 'text-amber-400' : 'text-blue-400'}>
                    {cell.distance}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-gray-500 text-center mt-2">
          Numbers show distance to treasure. Lower = closer.
        </p>
      </div>

      {/* Game Over */}
      {gameOver && (
        <div className={`mb-6 p-5 rounded-xl border ${treasureFound ? 'bg-yellow-900/20 border-yellow-600/50' : 'bg-red-900/20 border-red-600/50'}`}>
          <div className="text-center mb-4">
            <div className={`text-3xl font-black ${grade.color}`}>{grade.grade}</div>
            <p className={`text-lg font-bold ${treasureFound ? 'text-yellow-300' : 'text-red-400'}`}>
              {treasureFound ? `Treasure found in ${movesUsed} moves!` : `Treasure not found (${movesUsed} moves used)`}
            </p>
          </div>

          {treasureCard && (
            <div className={`p-4 rounded-lg border mb-4 ${treasureFound ? 'bg-yellow-900/30 border-yellow-700/40' : 'bg-gray-800/60 border-gray-700/50'}`}>
              <div className="text-xs text-gray-400 mb-1">{treasureFound ? 'Your Treasure' : 'The Hidden Treasure Was'}</div>
              <div className="font-bold text-white">{treasureCard.name}</div>
              <div className="text-sm text-gray-400">{treasureCard.year} {treasureCard.set}</div>
              <div className="text-sm text-amber-400 font-medium mt-1">{treasureCard.estimatedValueRaw}</div>
              <Link href={`/sports/${treasureCard.slug}`} className="text-xs text-amber-500 hover:text-amber-400 mt-1 inline-block">
                View card &rarr;
              </Link>
            </div>
          )}

          {lootCollected.length > 0 && (
            <div className="mb-4">
              <div className="text-xs text-gray-400 mb-2">Loot Collected ({lootCollected.length})</div>
              <div className="flex flex-wrap gap-2">
                {lootCollected.map((c, i) => (
                  <Link key={i} href={`/sports/${c.slug}`} className="bg-gray-800/60 border border-green-800/40 rounded px-2 py-1 text-xs text-green-300 hover:text-green-200">
                    {c.name} ({formatMoney(parseValue(c.estimatedValueRaw))})
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {shareText && (
              <button onClick={copyShare} className="px-4 py-2 bg-amber-700 text-white text-sm rounded-lg hover:bg-amber-600 transition-colors">
                Copy Results
              </button>
            )}
            {mode === 'random' && (
              <button onClick={() => initGame('random')} className="px-4 py-2 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors">
                New Map
              </button>
            )}
            {mode === 'daily' && (
              <button onClick={() => setMode('random')} className="px-4 py-2 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors">
                Play Random
              </button>
            )}
          </div>
        </div>
      )}

      {/* How to Play */}
      <div className="bg-gray-800/40 border border-gray-700/40 rounded-xl p-5 mb-6">
        <h2 className="text-lg font-bold text-white mb-3">How to Play</h2>
        <div className="grid sm:grid-cols-2 gap-3 text-sm text-gray-300">
          <div className="flex gap-2">
            <span className="text-amber-400 font-bold">1.</span>
            <span>Tap any cell on the 7&times;7 grid to reveal it</span>
          </div>
          <div className="flex gap-2">
            <span className="text-amber-400 font-bold">2.</span>
            <span>Each cell shows its distance to the hidden treasure</span>
          </div>
          <div className="flex gap-2">
            <span className="text-amber-400 font-bold">3.</span>
            <span>Lower numbers mean you&apos;re closer — use them to triangulate</span>
          </div>
          <div className="flex gap-2">
            <span className="text-amber-400 font-bold">4.</span>
            <span>Find the treasure in 20 moves or fewer to win</span>
          </div>
          <div className="flex gap-2">
            <span className="text-amber-400 font-bold">5.</span>
            <span>Yellow dots are bonus loot cards — extra finds along the way</span>
          </div>
          <div className="flex gap-2">
            <span className="text-amber-400 font-bold">6.</span>
            <span>Fewer moves = higher grade (S is 5 or fewer!)</span>
          </div>
        </div>
      </div>

      {/* Distance Legend */}
      <div className="bg-gray-800/40 border border-gray-700/40 rounded-xl p-5 mb-6">
        <h2 className="text-lg font-bold text-white mb-3">Distance Guide</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
          {[
            { range: '0', label: 'Treasure!', emoji: '💎', color: 'text-yellow-300' },
            { range: '1-2', label: 'Scorching', emoji: '🔥', color: 'text-red-400' },
            { range: '3-4', label: 'Hot', emoji: '🌡️', color: 'text-orange-400' },
            { range: '5-6', label: 'Warm', emoji: '☀️', color: 'text-amber-400' },
            { range: '7-8', label: 'Cool', emoji: '🌤️', color: 'text-blue-300' },
            { range: '9+', label: 'Cold', emoji: '❄️', color: 'text-cyan-300' },
          ].map(h => (
            <div key={h.range} className="flex items-center gap-2">
              <span>{h.emoji}</span>
              <span className={h.color}>{h.range}</span>
              <span className="text-gray-500">— {h.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* All-Time Stats */}
      <div className="bg-gray-800/40 border border-gray-700/40 rounded-xl p-5 mb-6">
        <h2 className="text-lg font-bold text-white mb-3">Your Stats</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-white">{stats.gamesPlayed}</div>
            <div className="text-xs text-gray-500">Games Played</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">{stats.treasuresFound}</div>
            <div className="text-xs text-gray-500">Treasures Found</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-400">{stats.bestMoves < 99 ? stats.bestMoves : '—'}</div>
            <div className="text-xs text-gray-500">Best (Fewest Moves)</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">{stats.bestStreak}</div>
            <div className="text-xs text-gray-500">Best Streak</div>
          </div>
        </div>
      </div>

      {/* Related Links */}
      <div className="bg-gray-800/40 border border-gray-700/40 rounded-xl p-5">
        <h2 className="text-lg font-bold text-white mb-3">More Games</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { href: '/card-minesweeper', label: 'Card Minesweeper' },
            { href: '/card-detective', label: 'Card Detective' },
            { href: '/guess-the-card', label: 'Guess the Card' },
            { href: '/card-mystery-box', label: 'Mystery Box' },
            { href: '/card-plinko', label: 'Card Plinko' },
            { href: '/games', label: 'All Games' },
          ].map(l => (
            <Link key={l.href} href={l.href} className="text-sm text-amber-500 hover:text-amber-400 transition-colors">
              {l.label} &rarr;
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
