'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

/* ─── Constants ─────────────────────────────────────────── */
const ROWS = 10;
const SLOTS = ROWS + 1; // 11 slots
const DROPS_PER_GAME = 5;
const BOUNCE_DELAY = 180; // ms between each row bounce

// Multipliers: edges = 0x, center = 5x
const MULTIPLIERS = [0, 0.3, 0.5, 1, 2, 5, 2, 1, 0.5, 0.3, 0];
const SLOT_COLORS = [
  'bg-red-900 text-red-300',
  'bg-red-800 text-red-200',
  'bg-orange-800 text-orange-200',
  'bg-yellow-800 text-yellow-200',
  'bg-green-800 text-green-200',
  'bg-yellow-400 text-black font-bold',
  'bg-green-800 text-green-200',
  'bg-yellow-800 text-yellow-200',
  'bg-orange-800 text-orange-200',
  'bg-red-800 text-red-200',
  'bg-red-900 text-red-300',
];

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

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatMoney(n: number): string {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${Math.round(n).toLocaleString()}`;
}

function getGrade(score: number): { grade: string; label: string; color: string } {
  if (score >= 50000) return { grade: 'S', label: 'Jackpot King', color: 'text-yellow-400' };
  if (score >= 25000) return { grade: 'A', label: 'Plinko Pro', color: 'text-green-400' };
  if (score >= 10000) return { grade: 'B', label: 'Good Drops', color: 'text-blue-400' };
  if (score >= 5000) return { grade: 'C', label: 'Average', color: 'text-gray-300' };
  if (score >= 1000) return { grade: 'D', label: 'Unlucky', color: 'text-orange-400' };
  return { grade: 'F', label: 'Guttered', color: 'text-red-400' };
}

function sportEmoji(sport: string): string {
  switch (sport) {
    case 'baseball': return '\u26be';
    case 'basketball': return '\ud83c\udfc0';
    case 'football': return '\ud83c\udfc8';
    case 'hockey': return '\ud83c\udfd2';
    default: return '\ud83c\udccf';
  }
}

/* ─── Types ─────────────────────────────────────────────── */
interface DropResult {
  card: typeof sportsCards[0];
  cardValue: number;
  path: number[];  // position at each row (0 to SLOTS-1)
  finalSlot: number;
  multiplier: number;
  score: number;
}

interface GameStats {
  gamesPlayed: number;
  bestScore: number;
  totalJackpots: number;
  totalGutters: number;
}

type Phase = 'menu' | 'ready' | 'dropping' | 'landed' | 'complete';

/* ─── Component ─────────────────────────────────────────── */
export default function CardPlinkoClient() {
  const [phase, setPhase] = useState<Phase>('menu');
  const [mode, setMode] = useState<'daily' | 'random'>('daily');
  const [cards, setCards] = useState<typeof sportsCards[0][]>([]);
  const [dropIndex, setDropIndex] = useState(0);
  const [results, setResults] = useState<DropResult[]>([]);
  const [animRow, setAnimRow] = useState(-1);
  const [animPath, setAnimPath] = useState<number[]>([]);
  const [stats, setStats] = useState<GameStats>({ gamesPlayed: 0, bestScore: 0, totalJackpots: 0, totalGutters: 0 });
  const rngRef = useRef<(() => number) | null>(null);

  // Load stats
  useEffect(() => {
    const saved = localStorage.getItem('cv-plinko-stats');
    if (saved) {
      try { setStats(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  const saveStats = useCallback((s: GameStats) => {
    setStats(s);
    localStorage.setItem('cv-plinko-stats', JSON.stringify(s));
  }, []);

  // Start game
  const startGame = useCallback((m: 'daily' | 'random') => {
    const seed = m === 'daily' ? dateHash() : Date.now();
    const rng = seededRng(seed);
    rngRef.current = rng;
    const shuffled = shuffle([...sportsCards], rng);
    setCards(shuffled.slice(0, DROPS_PER_GAME));
    setMode(m);
    setDropIndex(0);
    setResults([]);
    setAnimRow(-1);
    setAnimPath([]);
    setPhase('ready');
  }, []);

  // Execute a drop
  const doDrop = useCallback(() => {
    if (!rngRef.current || dropIndex >= cards.length) return;
    const rng = rngRef.current;
    const card = cards[dropIndex];
    const cardValue = parseValue(card.estimatedValueRaw);

    // Calculate path: start at center (position 5 out of 0-10)
    const path: number[] = [5]; // starting position
    let pos = 5;
    for (let row = 0; row < ROWS; row++) {
      // At each peg, go left or right
      // But clamp to valid range [0, SLOTS-1]
      if (pos <= 0) {
        pos = 1;
      } else if (pos >= SLOTS - 1) {
        pos = SLOTS - 2;
      } else {
        pos += rng() < 0.5 ? -1 : 1;
      }
      path.push(pos);
    }

    const finalSlot = path[path.length - 1];
    const multiplier = MULTIPLIERS[finalSlot];
    const score = Math.round(cardValue * multiplier);

    const result: DropResult = { card, cardValue, path, finalSlot, multiplier, score };

    // Animate
    setPhase('dropping');
    setAnimPath(path);
    setAnimRow(0);

    let row = 0;
    const interval = setInterval(() => {
      row++;
      if (row > ROWS) {
        clearInterval(interval);
        setResults(prev => [...prev, result]);
        setAnimRow(-1);
        if (dropIndex + 1 >= DROPS_PER_GAME) {
          // Game over
          setTimeout(() => {
            const totalScore = [...results, result].reduce((sum, r) => sum + r.score, 0);
            const jackpots = [...results, result].filter(r => r.multiplier === 5).length;
            const gutters = [...results, result].filter(r => r.multiplier === 0).length;
            const newStats = {
              gamesPlayed: stats.gamesPlayed + 1,
              bestScore: Math.max(stats.bestScore, totalScore),
              totalJackpots: stats.totalJackpots + jackpots,
              totalGutters: stats.totalGutters + gutters,
            };
            saveStats(newStats);
            setPhase('complete');
          }, 400);
        } else {
          setDropIndex(prev => prev + 1);
          setTimeout(() => setPhase('ready'), 400);
        }
      } else {
        setAnimRow(row);
      }
    }, BOUNCE_DELAY);
  }, [cards, dropIndex, results, stats, saveStats]);

  const totalScore = results.reduce((sum, r) => sum + r.score, 0);
  const currentCard = cards[dropIndex];
  const gradeInfo = getGrade(totalScore);

  // --- Render ---
  return (
    <div className="space-y-6">
      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="bg-gray-900/60 border border-gray-800/50 rounded-lg p-2">
          <div className="text-xs text-gray-500">Games</div>
          <div className="text-white font-bold">{stats.gamesPlayed}</div>
        </div>
        <div className="bg-gray-900/60 border border-gray-800/50 rounded-lg p-2">
          <div className="text-xs text-gray-500">Best Score</div>
          <div className="text-white font-bold">{formatMoney(stats.bestScore)}</div>
        </div>
        <div className="bg-gray-900/60 border border-gray-800/50 rounded-lg p-2">
          <div className="text-xs text-gray-500">Jackpots (5x)</div>
          <div className="text-yellow-400 font-bold">{stats.totalJackpots}</div>
        </div>
        <div className="bg-gray-900/60 border border-gray-800/50 rounded-lg p-2">
          <div className="text-xs text-gray-500">Gutters (0x)</div>
          <div className="text-red-400 font-bold">{stats.totalGutters}</div>
        </div>
      </div>

      {/* Menu */}
      {phase === 'menu' && (
        <div className="bg-gray-900/60 border border-gray-800/50 rounded-xl p-8 text-center">
          <div className="text-6xl mb-4">📌</div>
          <h2 className="text-2xl font-bold text-white mb-2">Card Plinko</h2>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Drop 5 cards down the plinko board. Each card bounces through pegs and lands on a multiplier.
            Hit the 5x jackpot center — or fall to the 0x gutter on the edges.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => startGame('daily')}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-medium transition-colors"
            >
              Daily Challenge
            </button>
            <button
              onClick={() => startGame('random')}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              Random Mode
            </button>
          </div>
        </div>
      )}

      {/* Active game */}
      {(phase === 'ready' || phase === 'dropping' || phase === 'landed') && currentCard && (
        <div className="space-y-4">
          {/* Game header */}
          <div className="flex items-center justify-between bg-gray-900/60 border border-gray-800/50 rounded-xl p-4">
            <div>
              <span className="text-xs text-gray-500">Drop {dropIndex + 1} of {DROPS_PER_GAME}</span>
              <span className="mx-2 text-gray-700">|</span>
              <span className="text-xs text-gray-500 capitalize">{mode} mode</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-500">Total Score:</span>
              <span className="ml-2 text-white font-bold">{formatMoney(totalScore)}</span>
            </div>
          </div>

          {/* Current card */}
          <div className="bg-gray-900/60 border border-gray-800/50 rounded-xl p-4 text-center">
            <div className="text-2xl mb-1">{sportEmoji(currentCard.sport)}</div>
            <h3 className="text-white font-bold text-lg">{currentCard.name}</h3>
            <p className="text-gray-400 text-sm">{currentCard.player} &middot; {currentCard.set}</p>
            <p className="text-orange-400 font-bold text-xl mt-2">
              Base Value: {formatMoney(parseValue(currentCard.estimatedValueRaw))}
            </p>
          </div>

          {/* Plinko board */}
          <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 overflow-hidden">
            <div className="relative mx-auto" style={{ maxWidth: 340 }}>
              {/* Peg rows */}
              {Array.from({ length: ROWS }).map((_, rowIdx) => {
                const pegsInRow = rowIdx % 2 === 0 ? SLOTS : SLOTS - 1;
                const offset = rowIdx % 2 === 0 ? 0 : 0.5;
                return (
                  <div
                    key={rowIdx}
                    className="flex justify-around items-center relative"
                    style={{ height: 28, paddingLeft: `${offset * (100 / SLOTS)}%`, paddingRight: `${offset * (100 / SLOTS)}%` }}
                  >
                    {Array.from({ length: pegsInRow }).map((_, pegIdx) => (
                      <div
                        key={pegIdx}
                        className="w-2 h-2 rounded-full bg-gray-600 flex-shrink-0"
                      />
                    ))}
                    {/* Ball at this row */}
                    {phase === 'dropping' && animRow === rowIdx && (
                      <div
                        className="absolute w-5 h-5 rounded-full bg-orange-500 shadow-lg shadow-orange-500/50 transition-all duration-150"
                        style={{
                          left: `${(animPath[rowIdx + 1] ?? animPath[rowIdx] ?? 5) * (100 / (SLOTS - 1))}%`,
                          transform: 'translate(-50%, -50%)',
                          top: '50%',
                        }}
                      />
                    )}
                  </div>
                );
              })}

              {/* Multiplier slots */}
              <div className="flex gap-0.5 mt-2">
                {MULTIPLIERS.map((mult, idx) => {
                  const isActive = phase !== 'dropping' && results.length > 0 && results[results.length - 1]?.finalSlot === idx;
                  return (
                    <div
                      key={idx}
                      className={`flex-1 text-center py-1.5 rounded text-xs font-bold transition-all ${SLOT_COLORS[idx]} ${isActive ? 'ring-2 ring-white scale-110' : ''}`}
                    >
                      {mult}x
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Drop button */}
          {phase === 'ready' && (
            <button
              onClick={doDrop}
              className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold text-lg transition-colors"
            >
              Drop Card #{dropIndex + 1}
            </button>
          )}

          {phase === 'dropping' && (
            <div className="w-full py-4 bg-gray-700 text-gray-400 rounded-xl font-bold text-lg text-center">
              Dropping...
            </div>
          )}

          {/* Drop results so far */}
          {results.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-400">Drop History</h3>
              {results.map((r, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-900/40 border border-gray-800/30 rounded-lg p-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">#{i + 1}</span>
                    <span>{sportEmoji(r.card.sport)}</span>
                    <span className="text-white font-medium truncate max-w-[180px]">{r.card.player}</span>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <span className="text-gray-400">{formatMoney(r.cardValue)}</span>
                    <span className={r.multiplier >= 2 ? 'text-green-400 font-bold' : r.multiplier === 0 ? 'text-red-400 font-bold' : 'text-gray-300'}>
                      {r.multiplier}x
                    </span>
                    <span className="text-white font-bold">{formatMoney(r.score)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Game complete */}
      {phase === 'complete' && (
        <div className="bg-gray-900/60 border border-gray-800/50 rounded-xl p-8 text-center space-y-6">
          <div className="space-y-2">
            <div className={`text-6xl font-black ${gradeInfo.color}`}>{gradeInfo.grade}</div>
            <div className="text-gray-400 text-sm">{gradeInfo.label}</div>
            <div className="text-3xl font-bold text-white">{formatMoney(totalScore)}</div>
            <div className="text-sm text-gray-500 capitalize">{mode} mode &middot; {DROPS_PER_GAME} drops</div>
          </div>

          {/* Drop breakdown */}
          <div className="space-y-2 text-left max-w-md mx-auto">
            {results.map((r, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-800/40 rounded-lg p-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 w-6">#{i + 1}</span>
                  <span>{sportEmoji(r.card.sport)}</span>
                  <span className="text-white truncate max-w-[140px]">{r.card.player}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">{formatMoney(r.cardValue)}</span>
                  <span className="text-gray-600">&times;</span>
                  <span className={`font-bold ${r.multiplier >= 5 ? 'text-yellow-400' : r.multiplier >= 2 ? 'text-green-400' : r.multiplier === 0 ? 'text-red-400' : 'text-gray-300'}`}>
                    {r.multiplier}x
                  </span>
                  <span className="text-gray-600">=</span>
                  <span className="text-white font-bold w-16 text-right">{formatMoney(r.score)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Share text */}
          <button
            onClick={() => {
              const lines = results.map(r => {
                if (r.multiplier >= 5) return '💎';
                if (r.multiplier >= 2) return '🟢';
                if (r.multiplier >= 1) return '🟡';
                if (r.multiplier > 0) return '🟠';
                return '💀';
              });
              const text = `Card Plinko ${mode === 'daily' ? '(Daily)' : ''}\n${lines.join('')}\nScore: ${formatMoney(totalScore)} (${gradeInfo.grade})\nhttps://cardvault-two.vercel.app/card-plinko`;
              navigator.clipboard.writeText(text);
            }}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
          >
            Copy Results
          </button>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => startGame('daily')}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-medium transition-colors"
            >
              Play Daily
            </button>
            <button
              onClick={() => startGame('random')}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              Random Mode
            </button>
            <Link
              href="/games"
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors text-center"
            >
              More Games
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
