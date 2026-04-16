'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { sportsCards } from '@/data/sports-cards';

type GameState = 'menu' | 'playing' | 'over';
type ConnectionType = 'sport' | 'decade' | 'value' | 'player';

interface ChainCard {
  slug: string;
  name: string;
  player: string;
  sport: string;
  year: number;
  value: number;
  decade: string;
  valueTier: string;
  rookie: boolean;
}

function parseValue(val: string): number {
  const m = val.match(/\$([0-9,.]+)/);
  return m ? parseFloat(m[1].replace(',', '')) : 5;
}

function getDecade(year: number): string {
  if (year < 1950) return 'Pre-1950';
  return `${Math.floor(year / 10) * 10}s`;
}

function getValueTier(val: number): string {
  if (val < 5) return 'Under $5';
  if (val < 25) return '$5-$24';
  if (val < 100) return '$25-$99';
  if (val < 500) return '$100-$499';
  return '$500+';
}

function seededRng(seed: number): () => number {
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

function findConnection(a: ChainCard, b: ChainCard): ConnectionType | null {
  if (a.player === b.player && a.slug !== b.slug) return 'player';
  if (a.sport === b.sport) return 'sport';
  if (a.decade === b.decade) return 'decade';
  if (a.valueTier === b.valueTier) return 'value';
  return null;
}

const CONNECTION_COLORS: Record<ConnectionType, string> = {
  sport: 'bg-blue-600',
  decade: 'bg-amber-600',
  value: 'bg-emerald-600',
  player: 'bg-purple-600',
};

const CONNECTION_LABELS: Record<ConnectionType, string> = {
  sport: 'Same Sport',
  decade: 'Same Decade',
  value: 'Same Value',
  player: 'Same Player',
};

const SPORT_COLORS: Record<string, string> = {
  baseball: 'bg-red-900/50 text-red-400',
  basketball: 'bg-orange-900/50 text-orange-400',
  football: 'bg-blue-900/50 text-blue-400',
  hockey: 'bg-cyan-900/50 text-cyan-400',
};

function getGrade(length: number): { grade: string; color: string } {
  if (length >= 15) return { grade: 'S', color: 'text-yellow-400' };
  if (length >= 12) return { grade: 'A', color: 'text-emerald-400' };
  if (length >= 9) return { grade: 'B', color: 'text-blue-400' };
  if (length >= 6) return { grade: 'C', color: 'text-white' };
  if (length >= 3) return { grade: 'D', color: 'text-orange-400' };
  return { grade: 'F', color: 'text-red-400' };
}

export default function CardChainClient() {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [mode, setMode] = useState<'daily' | 'random'>('daily');
  const [chain, setChain] = useState<ChainCard[]>([]);
  const [options, setOptions] = useState<ChainCard[]>([]);
  const [timer, setTimer] = useState(90);
  const [score, setScore] = useState(0);
  const [rng, setRng] = useState<() => number>(() => Math.random);

  // Build card pool
  const allCards = useMemo((): ChainCard[] => {
    return sportsCards.map(c => ({
      slug: c.slug,
      name: c.name,
      player: c.player,
      sport: c.sport,
      year: c.year,
      value: parseValue(c.estimatedValueRaw),
      decade: getDecade(c.year),
      valueTier: getValueTier(parseValue(c.estimatedValueRaw)),
      rookie: c.rookie,
    }));
  }, []);

  // Stats
  const [stats, setStats] = useState<{ gamesPlayed: number; bestChain: number; bestScore: number; totalLinks: number }>({
    gamesPlayed: 0, bestChain: 0, bestScore: 0, totalLinks: 0,
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('cardvault-chain-stats');
      if (stored) setStats(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const saveStats = useCallback((chainLen: number, finalScore: number) => {
    setStats(prev => {
      const next = {
        gamesPlayed: prev.gamesPlayed + 1,
        bestChain: Math.max(prev.bestChain, chainLen),
        bestScore: Math.max(prev.bestScore, finalScore),
        totalLinks: prev.totalLinks + chainLen,
      };
      try { localStorage.setItem('cardvault-chain-stats', JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  // Generate options for current card
  const generateOptions = useCallback((currentCard: ChainCard, rngFn: () => number) => {
    // Find cards that connect via at least one attribute
    const connected = allCards.filter(c =>
      c.slug !== currentCard.slug && findConnection(currentCard, c) !== null
    );

    // Shuffle and pick 3 connected + 1 trap (no connection)
    const shuffled = [...connected].sort(() => rngFn() - 0.5);
    const picks = shuffled.slice(0, 3);

    // Find a trap card (no connection)
    const traps = allCards.filter(c =>
      c.slug !== currentCard.slug && findConnection(currentCard, c) === null
    );
    const trap = traps[Math.floor(rngFn() * traps.length)];

    if (trap && picks.length === 3) {
      picks.push(trap);
    } else if (picks.length < 4) {
      // If not enough connected, fill with more connected
      picks.push(...shuffled.slice(3, 4));
    }

    // Shuffle the 4 options
    return picks.sort(() => rngFn() - 0.5);
  }, [allCards]);

  // Start game
  const startGame = useCallback((gameMode: 'daily' | 'random') => {
    const seed = gameMode === 'daily' ? dateHash() : Date.now();
    const rngFn = seededRng(seed);
    setRng(() => rngFn);
    setMode(gameMode);

    // Pick starting card
    const startIdx = Math.floor(rngFn() * allCards.length);
    const startCard = allCards[startIdx];
    setChain([startCard]);
    setOptions(generateOptions(startCard, rngFn));
    setTimer(90);
    setScore(0);
    setGameState('playing');
  }, [allCards, generateOptions]);

  // Timer
  useEffect(() => {
    if (gameState !== 'playing') return;
    if (timer <= 0) {
      setGameState('over');
      saveStats(chain.length - 1, score);
      return;
    }
    const t = setInterval(() => setTimer(prev => prev - 1), 1000);
    return () => clearInterval(t);
  }, [gameState, timer, chain.length, score, saveStats]);

  // Pick a card
  const pickCard = useCallback((card: ChainCard) => {
    const currentCard = chain[chain.length - 1];
    const connection = findConnection(currentCard, card);

    if (!connection) {
      // Wrong pick — game over
      setGameState('over');
      saveStats(chain.length - 1, score);
      return;
    }

    // Correct pick
    const chainLen = chain.length;
    const multiplier = chainLen >= 10 ? 3 : chainLen >= 5 ? 2 : 1;
    const speedBonus = Math.max(0, Math.floor(timer / 10));
    const points = (10 + speedBonus) * multiplier;

    setChain(prev => [...prev, card]);
    setScore(prev => prev + points);
    setOptions(generateOptions(card, rng));
  }, [chain, score, timer, rng, generateOptions, saveStats]);

  const chainLength = chain.length - 1; // Links, not cards
  const { grade, color: gradeColor } = getGrade(chainLength);

  return (
    <div>
      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-gray-800/60 border border-gray-700/50 rounded-lg p-3 text-center">
          <div className="text-cyan-400 text-lg font-bold">{stats.gamesPlayed}</div>
          <div className="text-gray-500 text-xs">Games Played</div>
        </div>
        <div className="bg-gray-800/60 border border-gray-700/50 rounded-lg p-3 text-center">
          <div className="text-white text-lg font-bold">{stats.bestChain}</div>
          <div className="text-gray-500 text-xs">Longest Chain</div>
        </div>
        <div className="bg-gray-800/60 border border-gray-700/50 rounded-lg p-3 text-center">
          <div className="text-amber-400 text-lg font-bold">{stats.bestScore}</div>
          <div className="text-gray-500 text-xs">Best Score</div>
        </div>
        <div className="bg-gray-800/60 border border-gray-700/50 rounded-lg p-3 text-center">
          <div className="text-emerald-400 text-lg font-bold">{stats.totalLinks}</div>
          <div className="text-gray-500 text-xs">Total Links</div>
        </div>
      </div>

      {/* Menu */}
      {gameState === 'menu' && (
        <div className="text-center py-12 bg-gray-800/40 border border-gray-700/50 rounded-xl">
          <h2 className="text-2xl font-bold text-white mb-4">Start a Chain</h2>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Pick cards that connect to the previous one. Same sport, decade, value tier, or player.
            90 seconds. Go!
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => startGame('daily')}
              className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg transition-colors"
            >
              Daily Challenge
            </button>
            <button
              onClick={() => startGame('random')}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
            >
              Random Game
            </button>
          </div>
        </div>
      )}

      {/* Playing */}
      {gameState === 'playing' && chain.length > 0 && (
        <div>
          {/* Timer + Score */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className={`text-2xl font-bold ${timer <= 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                {timer}s
              </div>
              <div className="text-gray-500 text-sm">Chain: <span className="text-cyan-400 font-bold">{chainLength}</span></div>
            </div>
            <div className="text-amber-400 font-bold text-lg">{score} pts</div>
          </div>

          {/* Current Card */}
          <div className="bg-cyan-950/30 border border-cyan-800/50 rounded-xl p-4 mb-4">
            <div className="text-gray-500 text-xs mb-1">Current Card</div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-white font-bold">{chain[chain.length - 1].player}</span>
                <span className="text-gray-400 text-sm ml-2">{chain[chain.length - 1].name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-1.5 py-0.5 rounded ${SPORT_COLORS[chain[chain.length - 1].sport] || 'bg-gray-800 text-gray-400'}`}>
                  {chain[chain.length - 1].sport}
                </span>
                <span className="text-gray-400 text-xs">{chain[chain.length - 1].decade}</span>
                <span className="text-emerald-400 text-xs">{chain[chain.length - 1].valueTier}</span>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="text-gray-500 text-xs mb-2">Pick a card that connects:</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {options.map(card => {
              const conn = findConnection(chain[chain.length - 1], card);
              return (
                <button
                  key={card.slug}
                  onClick={() => pickCard(card)}
                  className="text-left p-4 rounded-xl border border-gray-700/50 bg-gray-800/60 hover:border-cyan-600/50 hover:bg-gray-800/80 transition-all"
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-white font-medium text-sm">{card.player}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${SPORT_COLORS[card.sport] || 'bg-gray-800 text-gray-400'}`}>
                      {card.sport}
                    </span>
                  </div>
                  <div className="text-gray-500 text-xs mb-2">{card.name}</div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-400">{card.decade}</span>
                    <span className="text-emerald-400">{card.valueTier}</span>
                    {card.rookie && <span className="text-yellow-400">RC</span>}
                    {conn && (
                      <span className={`${CONNECTION_COLORS[conn]} text-white text-xs px-1.5 py-0.5 rounded`}>
                        {CONNECTION_LABELS[conn]}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Chain History (last 5) */}
          {chain.length > 1 && (
            <div className="bg-gray-800/30 border border-gray-700/30 rounded-lg p-3">
              <div className="text-gray-500 text-xs mb-2">Chain ({chainLength} links)</div>
              <div className="flex flex-wrap gap-1">
                {chain.slice(-6, -1).map((c, i) => (
                  <span key={`${c.slug}-${i}`} className="text-xs bg-gray-700/50 text-gray-300 px-2 py-0.5 rounded">
                    {c.player}
                  </span>
                ))}
                <span className="text-xs bg-cyan-700/50 text-cyan-300 px-2 py-0.5 rounded font-medium">
                  {chain[chain.length - 1].player}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Game Over */}
      {gameState === 'over' && (
        <div className="text-center py-12 bg-gray-800/40 border border-gray-700/50 rounded-xl">
          <div className={`text-6xl font-bold mb-2 ${gradeColor}`}>{grade}</div>
          <h2 className="text-2xl font-bold text-white mb-4">Chain Complete!</h2>
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-6">
            <div>
              <div className="text-cyan-400 text-2xl font-bold">{chainLength}</div>
              <div className="text-gray-500 text-xs">Links</div>
            </div>
            <div>
              <div className="text-amber-400 text-2xl font-bold">{score}</div>
              <div className="text-gray-500 text-xs">Score</div>
            </div>
            <div>
              <div className="text-white text-2xl font-bold">{90 - timer}s</div>
              <div className="text-gray-500 text-xs">Time Used</div>
            </div>
          </div>

          {/* Chain Summary */}
          {chain.length > 1 && (
            <div className="max-w-lg mx-auto mb-6 text-left bg-gray-800/40 rounded-lg p-4">
              <div className="text-gray-400 text-xs mb-2">Your Chain</div>
              <div className="flex flex-wrap gap-1">
                {chain.map((c, i) => (
                  <span key={`${c.slug}-${i}`} className="text-xs bg-gray-700/50 text-gray-300 px-2 py-0.5 rounded">
                    {c.player}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => startGame(mode)}
              className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg transition-colors"
            >
              Play Again ({mode === 'daily' ? 'Daily' : 'Random'})
            </button>
            <button
              onClick={() => setGameState('menu')}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
            >
              Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
