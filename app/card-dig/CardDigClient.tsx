'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

/* ─── Constants ─────────────────────────────────────────── */
const GRID_COLS = 6;
const GRID_ROWS = 5;
const TOTAL_CELLS = GRID_COLS * GRID_ROWS;
const MAX_DIGS = 15;
const CARD_COUNT = 6; // hidden cards to find

type LayerType = 'dirt' | 'clay' | 'rock' | 'card' | 'empty' | 'gem';

interface DigCell {
  layer: LayerType;
  card: typeof sportsCards[0] | null;
  digsRemaining: number; // 0=exposed, 1=one dig, 2=two digs, 3=three digs
  revealed: boolean;
}

interface DigStats {
  gamesPlayed: number;
  cardsFound: number;
  bestValue: number;
  bestGame: number;
}

/* ─── Helpers ───────────────────────────────────────────── */
function seededRng(seed: number) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
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

function getGrade(totalValue: number, cardsFound: number): { grade: string; color: string } {
  const score = totalValue * (cardsFound / CARD_COUNT);
  if (score >= 500) return { grade: 'S', color: 'text-yellow-400' };
  if (score >= 200) return { grade: 'A', color: 'text-green-400' };
  if (score >= 100) return { grade: 'B', color: 'text-blue-400' };
  if (score >= 50) return { grade: 'C', color: 'text-purple-400' };
  if (score >= 20) return { grade: 'D', color: 'text-gray-400' };
  return { grade: 'F', color: 'text-red-400' };
}

const layerStyles: Record<LayerType, { bg: string; icon: string; label: string }> = {
  dirt: { bg: 'bg-amber-900/70 border-amber-700/60', icon: '🟤', label: 'Dirt' },
  clay: { bg: 'bg-orange-800/60 border-orange-600/50', icon: '🟠', label: 'Clay' },
  rock: { bg: 'bg-gray-600/70 border-gray-500/60', icon: '🪨', label: 'Rock' },
  card: { bg: 'bg-yellow-900/60 border-yellow-500 shadow-lg shadow-yellow-500/20', icon: '🃏', label: 'Card!' },
  empty: { bg: 'bg-gray-900/30 border-gray-800/30', icon: '', label: 'Empty' },
  gem: { bg: 'bg-purple-900/50 border-purple-500/50', icon: '💎', label: 'Gem' },
};

const STATS_KEY = 'cv-card-dig-stats';

function loadStats(): DigStats {
  if (typeof window === 'undefined') return { gamesPlayed: 0, cardsFound: 0, bestValue: 0, bestGame: 0 };
  try {
    const raw = localStorage.getItem(STATS_KEY);
    return raw ? JSON.parse(raw) : { gamesPlayed: 0, cardsFound: 0, bestValue: 0, bestGame: 0 };
  } catch { return { gamesPlayed: 0, cardsFound: 0, bestValue: 0, bestGame: 0 }; }
}

function saveStats(s: DigStats) {
  try { localStorage.setItem(STATS_KEY, JSON.stringify(s)); } catch {}
}

/* ─── Component ────────────────────────────────────────── */
export default function CardDigClient() {
  const [mode, setMode] = useState<'daily' | 'random'>('daily');
  const [grid, setGrid] = useState<DigCell[]>([]);
  const [digsUsed, setDigsUsed] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [foundCards, setFoundCards] = useState<typeof sportsCards[0][]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [stats, setStats] = useState<DigStats>(loadStats());
  const [sportFilter, setSportFilter] = useState<string>('all');
  const [shareText, setShareText] = useState('');

  const initGame = useCallback((gameMode: 'daily' | 'random') => {
    const seed = gameMode === 'daily' ? dateHash() * 5381 : Date.now();
    const rng = seededRng(seed);

    const filtered = sportFilter === 'all' ? sportsCards : sportsCards.filter(c => c.sport.toLowerCase() === sportFilter);
    const pool = filtered.length > 20 ? filtered : sportsCards;
    const shuffled = shuffle(pool, rng);
    const digCards = shuffled.slice(0, CARD_COUNT);

    // Place cards randomly
    const cardPositions = new Set<number>();
    while (cardPositions.size < CARD_COUNT) {
      cardPositions.add(Math.floor(rng() * TOTAL_CELLS));
    }

    const cells: DigCell[] = [];
    let cardIdx = 0;
    for (let i = 0; i < TOTAL_CELLS; i++) {
      if (cardPositions.has(i)) {
        // Card buried under 1-3 layers
        const depth = Math.floor(rng() * 3) + 1;
        cells.push({
          layer: depth === 3 ? 'rock' : depth === 2 ? 'clay' : 'dirt',
          card: digCards[cardIdx++],
          digsRemaining: depth,
          revealed: false,
        });
      } else {
        // Random terrain
        const roll = rng();
        const depth = roll < 0.15 ? 3 : roll < 0.4 ? 2 : 1;
        cells.push({
          layer: depth === 3 ? 'rock' : depth === 2 ? 'clay' : 'dirt',
          card: null,
          digsRemaining: depth,
          revealed: false,
        });
      }
    }

    setGrid(cells);
    setDigsUsed(0);
    setGameOver(false);
    setFoundCards([]);
    setTotalValue(0);
    setShareText('');
  }, [sportFilter]);

  useEffect(() => {
    setStats(loadStats());
    initGame(mode);
  }, [mode, initGame]);

  const dig = (index: number) => {
    if (gameOver || grid[index].revealed) return;

    const newGrid = [...grid];
    const cell = { ...newGrid[index] };
    cell.digsRemaining--;

    if (cell.digsRemaining <= 0) {
      cell.revealed = true;
      if (cell.card) {
        cell.layer = 'card';
        const newFound = [...foundCards, cell.card];
        const val = parseValue(cell.card.estimatedValueRaw);
        const newTotal = totalValue + val;
        setFoundCards(newFound);
        setTotalValue(newTotal);
      } else {
        cell.layer = 'empty';
      }
    } else {
      cell.layer = cell.digsRemaining === 2 ? 'clay' : cell.digsRemaining === 1 ? 'dirt' : 'rock';
    }

    newGrid[index] = cell;
    setGrid(newGrid);
    const newDigs = digsUsed + 1;
    setDigsUsed(newDigs);

    // Check end conditions
    const allCardsFound = newGrid.filter(c => c.card && c.revealed).length >= CARD_COUNT;
    if (newDigs >= MAX_DIGS || allCardsFound) {
      setGameOver(true);
      const fc = newGrid.filter(c => c.card && c.revealed).length;
      const tv = newGrid.filter(c => c.card && c.revealed).reduce((sum, c) => sum + parseValue(c.card!.estimatedValueRaw), 0);

      const newStats = { ...stats };
      newStats.gamesPlayed++;
      newStats.cardsFound += fc;
      if (tv > newStats.bestValue) newStats.bestValue = tv;
      if (fc > newStats.bestGame) newStats.bestGame = fc;
      setStats(newStats);
      saveStats(newStats);

      const grade = getGrade(tv, fc);
      const gridEmoji = newGrid.map(c => {
        if (c.revealed && c.card) return '🃏';
        if (c.revealed) return '⬜';
        return c.digsRemaining >= 3 ? '🪨' : c.digsRemaining >= 2 ? '🟠' : '🟤';
      });
      const rows: string[] = [];
      for (let r = 0; r < GRID_ROWS; r++) {
        rows.push(gridEmoji.slice(r * GRID_COLS, (r + 1) * GRID_COLS).join(''));
      }
      setShareText(
        `Card Dig ${mode === 'daily' ? '(Daily)' : '(Random)'}\n` +
        `${grade.grade} Grade | ${fc}/${CARD_COUNT} cards | ${formatMoney(tv)} total\n\n` +
        `${rows.join('\n')}\n\nhttps://cardvault-two.vercel.app/card-dig`
      );
    }
  };

  const digsLeft = MAX_DIGS - digsUsed;
  const grade = getGrade(totalValue, foundCards.length);

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex rounded-lg overflow-hidden border border-gray-700">
          <button onClick={() => setMode('daily')} className={`px-4 py-2 text-sm font-medium transition-colors ${mode === 'daily' ? 'bg-amber-700 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>Daily Dig</button>
          <button onClick={() => setMode('random')} className={`px-4 py-2 text-sm font-medium transition-colors ${mode === 'random' ? 'bg-amber-700 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>Random</button>
        </div>
        <select value={sportFilter} onChange={e => setSportFilter(e.target.value)} className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2">
          <option value="all">All Sports</option>
          <option value="baseball">Baseball</option>
          <option value="basketball">Basketball</option>
          <option value="football">Football</option>
          <option value="hockey">Hockey</option>
        </select>
        {mode === 'random' && (
          <button onClick={() => initGame('random')} className="px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg hover:bg-gray-700">New Dig</button>
        )}
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-gray-800/60 border border-gray-700/50 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-amber-400">{digsLeft}</div>
          <div className="text-xs text-gray-500">Digs Left</div>
        </div>
        <div className="bg-gray-800/60 border border-gray-700/50 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-green-400">{foundCards.length}/{CARD_COUNT}</div>
          <div className="text-xs text-gray-500">Cards Found</div>
        </div>
        <div className="bg-gray-800/60 border border-gray-700/50 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-yellow-400">{formatMoney(totalValue)}</div>
          <div className="text-xs text-gray-500">Value Found</div>
        </div>
        <div className="bg-gray-800/60 border border-gray-700/50 rounded-lg p-3 text-center">
          <div className={`text-xl font-bold ${grade.color}`}>{grade.grade}</div>
          <div className="text-xs text-gray-500">Grade</div>
        </div>
      </div>

      {/* Dig Grid */}
      <div className="mb-6">
        <div className="grid gap-1.5 sm:gap-2 mx-auto" style={{ gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`, maxWidth: '480px' }}>
          {grid.map((cell, i) => {
            const isClickable = !gameOver && !cell.revealed;
            const style = layerStyles[cell.layer];
            let cls = `aspect-square rounded-lg flex flex-col items-center justify-center transition-all duration-200 border text-xs sm:text-sm `;
            if (cell.revealed) {
              cls += style.bg;
            } else {
              cls += `${style.bg} ${isClickable ? 'cursor-pointer hover:brightness-125 active:scale-95' : 'cursor-default opacity-60'}`;
            }

            return (
              <button key={i} onClick={() => dig(i)} disabled={!isClickable} className={cls}>
                {cell.revealed && cell.card ? (
                  <div className="text-center p-0.5">
                    <div className="text-lg">🃏</div>
                    <div className="text-[8px] sm:text-[10px] text-yellow-300 font-bold truncate max-w-full">{formatMoney(parseValue(cell.card.estimatedValueRaw))}</div>
                  </div>
                ) : cell.revealed ? (
                  <span className="text-gray-600 text-lg">&#183;</span>
                ) : (
                  <div className="text-center">
                    <div className="text-base sm:text-lg">{cell.digsRemaining >= 3 ? '🪨' : cell.digsRemaining >= 2 ? '🟠' : '🟤'}</div>
                    <div className="text-[8px] text-gray-400">{cell.digsRemaining}x</div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <div className="flex justify-center gap-4 mt-2 text-xs text-gray-500">
          <span>🟤 1 dig</span><span>🟠 2 digs</span><span>🪨 3 digs</span>
        </div>
      </div>

      {/* Game Over */}
      {gameOver && (
        <div className="mb-6 p-5 rounded-xl border bg-amber-900/20 border-amber-600/50">
          <div className="text-center mb-4">
            <div className={`text-3xl font-black ${grade.color}`}>{grade.grade}</div>
            <p className="text-lg font-bold text-white">
              Found {foundCards.length}/{CARD_COUNT} cards worth {formatMoney(totalValue)}
            </p>
          </div>

          {foundCards.length > 0 && (
            <div className="space-y-2 mb-4">
              {foundCards.map((c, i) => (
                <Link key={i} href={`/sports/${c.slug}`} className="flex items-center justify-between p-2 bg-gray-800/60 rounded-lg hover:bg-gray-700/40 transition-colors">
                  <div className="min-w-0">
                    <div className="text-sm text-white font-medium truncate">{c.name}</div>
                    <div className="text-xs text-gray-500">{c.set}</div>
                  </div>
                  <div className="text-sm text-amber-400 font-medium whitespace-nowrap ml-2">{c.estimatedValueRaw}</div>
                </Link>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {shareText && (
              <button onClick={() => navigator.clipboard.writeText(shareText).catch(() => {})} className="px-4 py-2 bg-amber-700 text-white text-sm rounded-lg hover:bg-amber-600">Copy Results</button>
            )}
            {mode === 'random' && (
              <button onClick={() => initGame('random')} className="px-4 py-2 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-600">New Dig</button>
            )}
            {mode === 'daily' && (
              <button onClick={() => setMode('random')} className="px-4 py-2 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-600">Play Random</button>
            )}
          </div>
        </div>
      )}

      {/* How to Play */}
      <div className="bg-gray-800/40 border border-gray-700/40 rounded-xl p-5 mb-6">
        <h2 className="text-lg font-bold text-white mb-3">How to Play</h2>
        <div className="grid sm:grid-cols-2 gap-3 text-sm text-gray-300">
          <div className="flex gap-2"><span className="text-amber-400 font-bold">1.</span><span>Tap cells to dig. Each cell has 1-3 layers to excavate.</span></div>
          <div className="flex gap-2"><span className="text-amber-400 font-bold">2.</span><span>6 sports cards are buried in the grid. Find as many as possible.</span></div>
          <div className="flex gap-2"><span className="text-amber-400 font-bold">3.</span><span>You have 15 digs total — spend them wisely.</span></div>
          <div className="flex gap-2"><span className="text-amber-400 font-bold">4.</span><span>Shallow cells (1 dig) are faster but may be empty. Deep cells (3 digs) cost more but may hide treasures.</span></div>
        </div>
      </div>

      {/* All-Time Stats */}
      <div className="bg-gray-800/40 border border-gray-700/40 rounded-xl p-5 mb-6">
        <h2 className="text-lg font-bold text-white mb-3">Your Stats</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div><div className="text-2xl font-bold text-white">{stats.gamesPlayed}</div><div className="text-xs text-gray-500">Games</div></div>
          <div><div className="text-2xl font-bold text-green-400">{stats.cardsFound}</div><div className="text-xs text-gray-500">Total Cards</div></div>
          <div><div className="text-2xl font-bold text-amber-400">{stats.bestValue > 0 ? formatMoney(stats.bestValue) : '—'}</div><div className="text-xs text-gray-500">Best Value</div></div>
          <div><div className="text-2xl font-bold text-purple-400">{stats.bestGame > 0 ? `${stats.bestGame}/${CARD_COUNT}` : '—'}</div><div className="text-xs text-gray-500">Most Found</div></div>
        </div>
      </div>

      {/* Related */}
      <div className="bg-gray-800/40 border border-gray-700/40 rounded-xl p-5">
        <h2 className="text-lg font-bold text-white mb-3">More Games</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { href: '/card-treasure-map', label: 'Treasure Map' },
            { href: '/card-minesweeper', label: 'Card Minesweeper' },
            { href: '/card-mystery-box', label: 'Mystery Box' },
            { href: '/card-plinko', label: 'Card Plinko' },
            { href: '/card-detective', label: 'Card Detective' },
            { href: '/games', label: 'All Games' },
          ].map(l => (
            <Link key={l.href} href={l.href} className="text-sm text-amber-500 hover:text-amber-400">{l.label} &rarr;</Link>
          ))}
        </div>
      </div>
    </div>
  );
}
