'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { sportsCards, type SportsCard } from '@/data/sports-cards';

// ─── Types ───────────────────────────────────────────────────────────

interface CardTile {
  id: number;
  card: SportsCard;
  flipped: boolean;
  matched: boolean;
}

interface GameStats {
  bestTime: number | null;
  bestMoves: number | null;
  gamesPlayed: number;
  gamesWon: number;
  lastPlayDate: string;
  streak: number;
}

type Phase = 'ready' | 'playing' | 'won';

// ─── Helpers ─────────────────────────────────────────────────────────

const STORAGE_KEY = 'cardvault-memory-match';
const PAIRS = 8;
const TOTAL_TILES = PAIRS * 2;

const sportEmoji: Record<string, string> = {
  baseball: '\u26BE',
  basketball: '\uD83C\uDFC0',
  football: '\uD83C\uDFC8',
  hockey: '\uD83C\uDFD2',
};

const sportColor: Record<string, string> = {
  baseball: 'border-red-600',
  basketball: 'border-orange-500',
  football: 'border-green-600',
  hockey: 'border-blue-500',
};

function dateHash(dateStr: string, salt: number = 0): number {
  let hash = salt;
  const str = dateStr + '-memory-match-v1-' + salt;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function shuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = ((s * 1103515245 + 12345) & 0x7fffffff);
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}:${sec.toString().padStart(2, '0')}` : `${sec}s`;
}

// ─── Component ───────────────────────────────────────────────────────

export default function MemoryMatchClient() {
  const [mounted, setMounted] = useState(false);
  const [tiles, setTiles] = useState<CardTile[]>([]);
  const [phase, setPhase] = useState<Phase>('ready');
  const [moves, setMoves] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [stats, setStats] = useState<GameStats>({ bestTime: null, bestMoves: null, gamesPlayed: 0, gamesWon: 0, lastPlayDate: '', streak: 0 });
  const [copied, setCopied] = useState(false);
  const flippedRef = useRef<number[]>([]);
  const lockRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const today = useMemo(() => todayStr(), []);

  // Select 8 cards for today
  const dailyCards = useMemo(() => {
    const seed = dateHash(today);
    const shuffled = shuffle(sportsCards, seed);
    return shuffled.slice(0, PAIRS);
  }, [today]);

  // Initialize board
  const initBoard = useCallback(() => {
    const seed = dateHash(today, 42);
    const pairs: CardTile[] = [];
    dailyCards.forEach((card, i) => {
      pairs.push({ id: i * 2, card, flipped: false, matched: false });
      pairs.push({ id: i * 2 + 1, card, flipped: false, matched: false });
    });
    setTiles(shuffle(pairs, seed));
    setMoves(0);
    setElapsed(0);
    setPhase('ready');
    flippedRef.current = [];
    lockRef.current = false;
    if (timerRef.current) clearInterval(timerRef.current);
  }, [dailyCards, today]);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setStats(JSON.parse(raw));
    } catch { /* ignore */ }
    initBoard();
  }, [initBoard]);

  // Timer
  useEffect(() => {
    if (phase === 'playing') {
      timerRef.current = setInterval(() => {
        setElapsed(Date.now() - startTime);
      }, 100);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase, startTime]);

  const flipTile = useCallback((index: number) => {
    if (lockRef.current) return;
    if (phase === 'won') return;

    const tile = tiles[index];
    if (!tile || tile.flipped || tile.matched) return;

    // Start game on first flip
    if (phase === 'ready') {
      setPhase('playing');
      setStartTime(Date.now());
    }

    const newTiles = [...tiles];
    newTiles[index] = { ...tile, flipped: true };
    setTiles(newTiles);

    const flipped = [...flippedRef.current, index];
    flippedRef.current = flipped;

    if (flipped.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = flipped;
      lockRef.current = true;

      if (newTiles[first].card.slug === newTiles[second].card.slug) {
        // Match!
        setTimeout(() => {
          setTiles(prev => prev.map((t, i) =>
            i === first || i === second ? { ...t, matched: true } : t
          ));
          flippedRef.current = [];
          lockRef.current = false;

          // Check win
          const matchedCount = newTiles.filter(t => t.matched).length + 2;
          if (matchedCount === TOTAL_TILES) {
            const finalTime = Date.now() - startTime;
            setElapsed(finalTime);
            setPhase('won');
            if (timerRef.current) clearInterval(timerRef.current);

            // Update stats
            setStats(prev => {
              const yesterday = new Date(new Date(today).getTime() - 86400000).toISOString().slice(0, 10);
              const isConsecutive = prev.lastPlayDate === yesterday;
              const newMoveCount = moves + 1;
              const updated: GameStats = {
                bestTime: prev.bestTime === null ? finalTime : Math.min(prev.bestTime, finalTime),
                bestMoves: prev.bestMoves === null ? newMoveCount : Math.min(prev.bestMoves, newMoveCount),
                gamesPlayed: prev.gamesPlayed + 1,
                gamesWon: prev.gamesWon + 1,
                lastPlayDate: today,
                streak: isConsecutive ? prev.streak + 1 : 1,
              };
              localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
              return updated;
            });
          }
        }, 300);
      } else {
        // No match — flip back
        setTimeout(() => {
          setTiles(prev => prev.map((t, i) =>
            i === first || i === second ? { ...t, flipped: false } : t
          ));
          flippedRef.current = [];
          lockRef.current = false;
        }, 800);
      }
    }
  }, [tiles, phase, moves, startTime, today]);

  const shareResults = () => {
    const text = [
      `Card Memory Match ${formatTime(elapsed)} | ${moves} moves`,
      `${PAIRS} pairs matched`,
      '',
      'cardvault-two.vercel.app/memory-match',
    ].join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!mounted) {
    return <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-8 text-center text-gray-500">Loading game...</div>;
  }

  return (
    <div>
      {/* Stats bar */}
      <div className="flex justify-between items-center mb-4 px-1">
        <div className="flex gap-4 text-sm">
          <div>
            <span className="text-gray-500">Moves: </span>
            <span className="text-white font-medium">{moves}</span>
          </div>
          <div>
            <span className="text-gray-500">Time: </span>
            <span className="text-white font-medium font-mono">{formatTime(elapsed)}</span>
          </div>
        </div>
        {phase !== 'ready' && (
          <button
            onClick={initBoard}
            className="text-xs text-gray-500 hover:text-white transition-colors"
          >
            Restart
          </button>
        )}
      </div>

      {/* Game grid */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-6">
        {tiles.map((tile, i) => (
          <button
            key={tile.id}
            onClick={() => flipTile(i)}
            disabled={tile.flipped || tile.matched || lockRef.current}
            className={`aspect-[3/4] rounded-xl border-2 transition-all duration-300 relative overflow-hidden ${
              tile.matched
                ? 'bg-emerald-900/30 border-emerald-600/50 opacity-60'
                : tile.flipped
                  ? `bg-gray-800 ${sportColor[tile.card.sport] || 'border-gray-600'}`
                  : 'bg-gray-900 border-gray-700 hover:border-gray-500 hover:bg-gray-800/80 cursor-pointer'
            }`}
          >
            {(tile.flipped || tile.matched) ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-1.5">
                <div className="text-lg sm:text-xl mb-0.5">{sportEmoji[tile.card.sport]}</div>
                <div className="text-[9px] sm:text-[10px] text-white font-medium text-center leading-tight line-clamp-2">
                  {tile.card.player}
                </div>
                <div className="text-[8px] sm:text-[9px] text-gray-400 text-center">{tile.card.year}</div>
                {tile.card.rookie && (
                  <span className="text-[7px] bg-amber-900/60 text-amber-400 px-1 rounded mt-0.5">RC</span>
                )}
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-2xl sm:text-3xl text-gray-600">?</div>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Win screen */}
      {phase === 'won' && (
        <div className="p-6 bg-emerald-950/40 border border-emerald-800/50 rounded-2xl mb-6">
          <div className="text-center mb-4">
            <div className="text-3xl mb-2">&#127881;</div>
            <h3 className="text-xl font-bold text-white">All Matched!</h3>
            <p className="text-emerald-400 text-sm">{formatTime(elapsed)} &middot; {moves} moves</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="text-center">
              <div className="text-lg font-bold text-white">{stats.gamesWon}</div>
              <div className="text-[10px] text-gray-500">Won</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white">{stats.bestTime ? formatTime(stats.bestTime) : '-'}</div>
              <div className="text-[10px] text-gray-500">Best Time</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white">{stats.bestMoves || '-'}</div>
              <div className="text-[10px] text-gray-500">Best Moves</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white">{stats.streak}</div>
              <div className="text-[10px] text-gray-500">Streak</div>
            </div>
          </div>

          {/* Cards matched */}
          <div className="mb-4">
            <div className="text-xs text-gray-500 mb-2">Today&apos;s Cards</div>
            <div className="grid grid-cols-4 gap-1.5">
              {dailyCards.map(card => (
                <Link
                  key={card.slug}
                  href={`/sports/${card.slug}`}
                  className="p-1.5 bg-gray-800/60 border border-gray-700/50 rounded-lg text-center hover:bg-gray-700/60 transition-colors"
                >
                  <div className="text-sm">{sportEmoji[card.sport]}</div>
                  <div className="text-[8px] text-gray-400 truncate">{card.player}</div>
                </Link>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={shareResults}
              className="flex-1 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-xl transition-colors text-sm"
            >
              {copied ? 'Copied!' : 'Share Score'}
            </button>
            <button
              onClick={initBoard}
              className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl transition-colors text-sm border border-gray-700"
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      {/* Tip */}
      {phase === 'ready' && (
        <div className="p-4 bg-gray-900/40 border border-gray-800 rounded-2xl text-center">
          <p className="text-gray-400 text-sm">
            Tap any card to begin. Match all 8 pairs as fast as you can!
          </p>
        </div>
      )}
    </div>
  );
}
