'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { sportsCards, type SportsCard } from '@/data/sports-cards';

const SPORT_ICONS: Record<string, string> = { baseball: '\u26be', basketball: '\ud83c\udfc0', football: '\ud83c\udfc8', hockey: '\ud83c\udfd2' };

type Difficulty = 'easy' | 'medium' | 'hard';
const DIFFICULTIES: { id: Difficulty; label: string; pairs: number; cols: number; rows: number }[] = [
  { id: 'easy', label: 'Easy', pairs: 6, cols: 4, rows: 3 },
  { id: 'medium', label: 'Medium', pairs: 8, cols: 4, rows: 4 },
  { id: 'hard', label: 'Hard', pairs: 10, cols: 5, rows: 4 },
];

type SportFilter = 'all' | 'baseball' | 'basketball' | 'football' | 'hockey';

interface CardTile {
  id: number;
  card: SportsCard;
  matched: boolean;
  flipped: boolean;
}

interface HighScore {
  moves: number;
  time: number;
  date: string;
}

const STORAGE_KEY = 'cardvault-memory-scores';

function getHighScores(): Record<string, HighScore> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return {};
}

function saveHighScore(difficulty: Difficulty, daily: boolean, score: HighScore) {
  const scores = getHighScores();
  const key = daily ? `daily-${difficulty}` : difficulty;
  const existing = scores[key];
  if (!existing || score.moves < existing.moves || (score.moves === existing.moves && score.time < existing.time)) {
    scores[key] = score;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
    return true;
  }
  return false;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getDailySeed(): number {
  const now = new Date();
  return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}:${s.toString().padStart(2, '0')}` : `${s}s`;
}

function getUniquePlayerCards(sport: SportFilter, count: number, rng: () => number): SportsCard[] {
  let pool = sportsCards;
  if (sport !== 'all') pool = pool.filter(c => c.sport === sport);

  // Get one card per unique player
  const byPlayer = new Map<string, SportsCard[]>();
  for (const card of pool) {
    const existing = byPlayer.get(card.player);
    if (existing) existing.push(card);
    else byPlayer.set(card.player, [card]);
  }

  const players = shuffle([...byPlayer.keys()], rng);
  const result: SportsCard[] = [];
  for (const player of players) {
    if (result.length >= count) break;
    const cards = byPlayer.get(player)!;
    result.push(cards[Math.floor(rng() * cards.length)]);
  }
  return result;
}

export default function CardMemoryClient() {
  const [mounted, setMounted] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [sportFilter, setSportFilter] = useState<SportFilter>('all');
  const [daily, setDaily] = useState(false);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'won'>('menu');
  const [tiles, setTiles] = useState<CardTile[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isNewBest, setIsNewBest] = useState(false);
  const [highScores, setHighScores] = useState<Record<string, HighScore>>({});
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lockRef = useRef(false);

  const config = DIFFICULTIES.find(d => d.id === difficulty)!;

  useEffect(() => {
    setMounted(true);
    setHighScores(getHighScores());
  }, []);

  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  const startGame = useCallback(() => {
    const seed = daily ? getDailySeed() + config.pairs : Date.now();
    const rng = seededRandom(seed);
    const cards = getUniquePlayerCards(sportFilter, config.pairs, rng);

    // Create pairs
    const tilePairs: CardTile[] = [];
    cards.forEach((card, idx) => {
      tilePairs.push({ id: idx * 2, card, matched: false, flipped: false });
      tilePairs.push({ id: idx * 2 + 1, card, matched: false, flipped: false });
    });

    setTiles(shuffle(tilePairs, rng));
    setFlippedIndices([]);
    setMoves(0);
    setMatchedPairs(0);
    setTimer(0);
    setIsNewBest(false);
    setGameState('playing');
    lockRef.current = false;
  }, [daily, config.pairs, sportFilter]);

  const handleTileClick = useCallback((index: number) => {
    if (lockRef.current) return;
    if (tiles[index].matched || tiles[index].flipped) return;

    const newTiles = [...tiles];
    newTiles[index] = { ...newTiles[index], flipped: true };
    const newFlipped = [...flippedIndices, index];

    if (newFlipped.length === 2) {
      lockRef.current = true;
      const [first, second] = newFlipped;
      const newMoves = moves + 1;
      setMoves(newMoves);

      if (newTiles[first].card.player === newTiles[second].card.player) {
        // Match!
        newTiles[first] = { ...newTiles[first], matched: true };
        newTiles[second] = { ...newTiles[second], matched: true };
        const newMatched = matchedPairs + 1;
        setMatchedPairs(newMatched);

        if (newMatched === config.pairs) {
          // Game won!
          if (timerRef.current) clearInterval(timerRef.current);
          setGameState('won');
          const best = saveHighScore(difficulty, daily, { moves: newMoves, time: timer, date: new Date().toISOString() });
          setIsNewBest(best);
          setHighScores(getHighScores());
        }
        setFlippedIndices([]);
        lockRef.current = false;
      } else {
        // No match — flip back after delay
        setTimeout(() => {
          setTiles(prev => {
            const updated = [...prev];
            updated[first] = { ...updated[first], flipped: false };
            updated[second] = { ...updated[second], flipped: false };
            return updated;
          });
          setFlippedIndices([]);
          lockRef.current = false;
        }, 800);
      }
    } else {
      setFlippedIndices(newFlipped);
    }

    setTiles(newTiles);
  }, [tiles, flippedIndices, moves, matchedPairs, config.pairs, difficulty, daily, timer]);

  if (!mounted) {
    return <div className="h-64 bg-gray-900/60 border border-gray-800 rounded-xl animate-pulse" />;
  }

  // ── Win Screen ──
  if (gameState === 'won') {
    const stars = moves <= config.pairs + 2 ? 3 : moves <= config.pairs * 2 ? 2 : 1;
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-emerald-950 to-teal-950 border border-emerald-700/40 rounded-2xl p-8 text-center">
          <div className="text-5xl mb-3">{stars === 3 ? '🌟🌟🌟' : stars === 2 ? '⭐⭐' : '⭐'}</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {isNewBest ? 'New Personal Best!' : 'Matched!'}
          </h2>
          <p className="text-emerald-400 text-lg mb-4">
            {config.pairs} pairs in {moves} moves | {formatTime(timer)}
          </p>
          <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mb-6">
            <div className="bg-gray-900/60 rounded-lg p-3">
              <div className="text-white font-bold text-lg">{moves}</div>
              <div className="text-gray-500 text-xs">Moves</div>
            </div>
            <div className="bg-gray-900/60 rounded-lg p-3">
              <div className="text-white font-bold text-lg">{formatTime(timer)}</div>
              <div className="text-gray-500 text-xs">Time</div>
            </div>
            <div className="bg-gray-900/60 rounded-lg p-3">
              <div className="text-amber-400 font-bold text-lg">{'★'.repeat(stars)}</div>
              <div className="text-gray-500 text-xs">Rating</div>
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <button onClick={startGame} className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-medium text-sm transition-colors">
              Play Again
            </button>
            <button onClick={() => setGameState('menu')} className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors">
              Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Menu ──
  if (gameState === 'menu') {
    return (
      <div className="space-y-6">
        {/* Difficulty */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Difficulty</h3>
          <div className="grid grid-cols-3 gap-2">
            {DIFFICULTIES.map(d => (
              <button
                key={d.id}
                onClick={() => setDifficulty(d.id)}
                className={`px-3 py-3 rounded-lg text-sm text-center transition-colors border ${
                  difficulty === d.id
                    ? 'bg-emerald-950/60 border-emerald-600/60 text-emerald-400'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
              >
                <div className="font-semibold">{d.label}</div>
                <div className="text-xs text-gray-500 mt-1">{d.pairs} pairs ({d.cols}x{d.rows})</div>
                {highScores[d.id] && (
                  <div className="text-[10px] text-emerald-500 mt-1">
                    Best: {highScores[d.id].moves} moves
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Sport Filter */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Sport</h3>
          <div className="flex flex-wrap gap-2">
            {(['all', 'baseball', 'basketball', 'football', 'hockey'] as const).map(s => (
              <button
                key={s}
                onClick={() => setSportFilter(s)}
                className={`px-3 py-2 rounded-lg text-sm transition-colors border ${
                  sportFilter === s
                    ? 'bg-emerald-950/60 border-emerald-600/60 text-emerald-400'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
              >
                {s === 'all' ? 'All Sports' : `${SPORT_ICONS[s]} ${s.charAt(0).toUpperCase() + s.slice(1)}`}
              </button>
            ))}
          </div>
        </div>

        {/* Mode */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Mode</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setDaily(false)}
              className={`px-3 py-3 rounded-lg text-sm text-left transition-colors border ${
                !daily ? 'bg-emerald-950/60 border-emerald-600/60 text-emerald-400' : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
            >
              <div className="font-semibold">Practice</div>
              <div className="text-xs text-gray-500 mt-1">Random cards each game</div>
            </button>
            <button
              onClick={() => setDaily(true)}
              className={`px-3 py-3 rounded-lg text-sm text-left transition-colors border ${
                daily ? 'bg-amber-950/60 border-amber-600/60 text-amber-400' : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
            >
              <div className="font-semibold">Daily Challenge</div>
              <div className="text-xs text-gray-500 mt-1">Same cards for everyone today</div>
              {highScores[`daily-${difficulty}`] && (
                <div className="text-[10px] text-amber-500 mt-1">
                  Today: {highScores[`daily-${difficulty}`].moves} moves
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Start */}
        <button onClick={startGame} className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors text-sm">
          Start Game
        </button>
      </div>
    );
  }

  // ── Playing ──
  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="flex items-center justify-between bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-2.5">
        <div className="flex gap-4">
          <div className="text-center">
            <div className="text-white font-bold text-sm">{moves}</div>
            <div className="text-gray-500 text-[10px]">Moves</div>
          </div>
          <div className="text-center">
            <div className="text-white font-bold text-sm">{matchedPairs}/{config.pairs}</div>
            <div className="text-gray-500 text-[10px]">Matched</div>
          </div>
          <div className="text-center">
            <div className="text-white font-bold text-sm">{formatTime(timer)}</div>
            <div className="text-gray-500 text-[10px]">Time</div>
          </div>
        </div>
        <div className="flex gap-2">
          {daily && <span className="px-2 py-0.5 bg-amber-950/60 border border-amber-700/40 text-amber-400 text-[10px] rounded-full">Daily</span>}
          <button onClick={() => setGameState('menu')} className="text-gray-500 hover:text-white text-xs px-2 py-1">
            Menu
          </button>
        </div>
      </div>

      {/* Game Grid */}
      <div
        className="grid gap-2 sm:gap-3"
        style={{ gridTemplateColumns: `repeat(${config.cols}, minmax(0, 1fr))` }}
      >
        {tiles.map((tile, idx) => (
          <button
            key={tile.id}
            onClick={() => handleTileClick(idx)}
            disabled={tile.matched || tile.flipped}
            className={`aspect-[3/4] rounded-xl border-2 transition-all duration-300 text-center flex flex-col items-center justify-center p-1 sm:p-2 ${
              tile.matched
                ? 'bg-emerald-950/40 border-emerald-600/40 scale-95 opacity-60'
                : tile.flipped
                ? 'bg-gray-800 border-amber-500/60 scale-105'
                : 'bg-gray-900 border-gray-700 hover:border-gray-500 cursor-pointer hover:scale-[1.02]'
            }`}
          >
            {tile.flipped || tile.matched ? (
              <>
                <span className="text-xl sm:text-2xl mb-0.5">{SPORT_ICONS[tile.card.sport] || ''}</span>
                <span className="text-white text-[10px] sm:text-xs font-medium leading-tight line-clamp-2">
                  {tile.card.player}
                </span>
                <span className="text-gray-500 text-[8px] sm:text-[10px] mt-0.5 truncate max-w-full">
                  {tile.card.year}
                </span>
              </>
            ) : (
              <span className="text-2xl sm:text-3xl text-gray-600">?</span>
            )}
          </button>
        ))}
      </div>

      {/* Restart */}
      <div className="text-center">
        <button onClick={startGame} className="text-gray-500 hover:text-white text-xs underline">
          Restart
        </button>
      </div>
    </div>
  );
}
