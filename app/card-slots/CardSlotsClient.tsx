'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';

/* ───── Types ───── */
interface SlotCard {
  name: string;
  player: string;
  sport: string;
  year: number;
  set: string;
  value: number;
  slug: string;
}

interface SpinResult {
  cards: [SlotCard, SlotCard, SlotCard];
  matches: Match[];
  points: number;
}

interface Match {
  type: 'jackpot' | 'sport' | 'era' | 'team' | 'value-tier';
  label: string;
  points: number;
}

/* ───── Helpers ───── */
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function shuffleArray<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function parseValue(raw: string): number {
  const match = raw.match(/\$([0-9,]+)/);
  if (!match) return 0;
  return parseInt(match[1].replace(/,/g, ''), 10);
}

function formatValue(v: number): string {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}K`;
  return `$${v}`;
}

function getDecade(year: number): string {
  return `${Math.floor(year / 10) * 10}s`;
}

function getTeamFromSet(set: string): string | null {
  // Extract team hints from set names like "2024 Topps Chrome" - not useful
  // But for team-colored cards, we check player names aren't enough
  return null;
}

function getValueTier(v: number): string {
  if (v >= 10000) return 'premium';
  if (v >= 1000) return 'mid';
  if (v >= 100) return 'budget';
  return 'common';
}

const sportColors: Record<string, { bg: string; border: string; text: string }> = {
  baseball: { bg: 'bg-red-950/60', border: 'border-red-800/50', text: 'text-red-400' },
  basketball: { bg: 'bg-orange-950/60', border: 'border-orange-800/50', text: 'text-orange-400' },
  football: { bg: 'bg-green-950/60', border: 'border-green-800/50', text: 'text-green-400' },
  hockey: { bg: 'bg-blue-950/60', border: 'border-blue-800/50', text: 'text-blue-400' },
};

const sportEmoji: Record<string, string> = {
  baseball: '\u26BE',
  basketball: '\uD83C\uDFC0',
  football: '\uD83C\uDFC8',
  hockey: '\uD83C\uDFD2',
};

function evaluateSpin(cards: [SlotCard, SlotCard, SlotCard]): Match[] {
  const matches: Match[] = [];

  // Jackpot: all three same player
  if (cards[0].player === cards[1].player && cards[1].player === cards[2].player) {
    matches.push({ type: 'jackpot', label: `JACKPOT! Triple ${cards[0].player}`, points: 500 });
    return matches; // Jackpot trumps everything
  }

  // Two of a kind (same player)
  if (cards[0].player === cards[1].player || cards[0].player === cards[2].player || cards[1].player === cards[2].player) {
    const p = cards[0].player === cards[1].player ? cards[0].player :
              cards[0].player === cards[2].player ? cards[0].player : cards[1].player;
    matches.push({ type: 'jackpot', label: `Pair! Double ${p}`, points: 200 });
  }

  // Same sport (all three)
  if (cards[0].sport === cards[1].sport && cards[1].sport === cards[2].sport) {
    matches.push({ type: 'sport', label: `Triple ${cards[0].sport}`, points: 100 });
  }

  // Same era/decade (all three)
  const decades = cards.map(c => getDecade(c.year));
  if (decades[0] === decades[1] && decades[1] === decades[2]) {
    matches.push({ type: 'era', label: `${decades[0]} trio`, points: 75 });
  }

  // Same value tier (all three)
  const tiers = cards.map(c => getValueTier(c.value));
  if (tiers[0] === tiers[1] && tiers[1] === tiers[2]) {
    const tierLabel = tiers[0] === 'premium' ? 'Premium' : tiers[0] === 'mid' ? 'Mid-Range' : tiers[0] === 'budget' ? 'Budget' : 'Common';
    matches.push({ type: 'value-tier', label: `${tierLabel} lineup`, points: 50 });
  }

  return matches;
}

/* ───── LocalStorage Helpers ───── */
function getStorageKey(): string {
  const d = new Date();
  return `cardslots-${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function loadDailyState(): { spinsUsed: number; totalPoints: number; results: SpinResult[] } {
  if (typeof window === 'undefined') return { spinsUsed: 0, totalPoints: 0, results: [] };
  try {
    const raw = localStorage.getItem(getStorageKey());
    if (!raw) return { spinsUsed: 0, totalPoints: 0, results: [] };
    return JSON.parse(raw);
  } catch {
    return { spinsUsed: 0, totalPoints: 0, results: [] };
  }
}

function saveDailyState(state: { spinsUsed: number; totalPoints: number; results: SpinResult[] }) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(getStorageKey(), JSON.stringify(state));
}

function loadHighScore(): number {
  if (typeof window === 'undefined') return 0;
  try {
    return parseInt(localStorage.getItem('cardslots-highscore') || '0', 10);
  } catch {
    return 0;
  }
}

function saveHighScore(score: number) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('cardslots-highscore', String(score));
}

function loadTotalSpins(): number {
  if (typeof window === 'undefined') return 0;
  try {
    return parseInt(localStorage.getItem('cardslots-totalspins') || '0', 10);
  } catch {
    return 0;
  }
}

function saveTotalSpins(n: number) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('cardslots-totalspins', String(n));
}

const MAX_SPINS = 10;

/* ───── Component ───── */
export default function CardSlotsClient({ cards }: { cards: { name: string; player: string; sport: string; year: number; set: string; estimatedValueRaw: string; slug: string }[] }) {
  const [spinsUsed, setSpinsUsed] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [results, setResults] = useState<SpinResult[]>([]);
  const [highScore, setHighScore] = useState(0);
  const [totalSpins, setTotalSpins] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [currentSpin, setCurrentSpin] = useState<SpinResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Build card pool
  const pool = useMemo(() => {
    return cards
      .map(c => ({
        name: c.name,
        player: c.player,
        sport: c.sport,
        year: c.year,
        set: c.set,
        value: parseValue(c.estimatedValueRaw),
        slug: c.slug,
      }))
      .filter(c => c.value > 0);
  }, [cards]);

  // Seeded daily shuffle
  const dailyPool = useMemo(() => {
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const rng = seededRandom(seed);
    return shuffleArray(pool, rng);
  }, [pool]);

  // Load saved state on mount
  useEffect(() => {
    const saved = loadDailyState();
    setSpinsUsed(saved.spinsUsed);
    setTotalPoints(saved.totalPoints);
    setResults(saved.results);
    setHighScore(loadHighScore());
    setTotalSpins(loadTotalSpins());
    setMounted(true);
  }, []);

  const doSpin = useCallback(() => {
    if (spinning || spinsUsed >= MAX_SPINS) return;

    setSpinning(true);
    setShowResult(false);
    setCurrentSpin(null);

    // Pick 3 random cards from daily pool using spin index
    const spinSeed = spinsUsed * 3;
    const idx1 = spinSeed % dailyPool.length;
    const idx2 = (spinSeed + Math.floor(dailyPool.length / 3)) % dailyPool.length;
    const idx3 = (spinSeed + Math.floor(dailyPool.length * 2 / 3)) % dailyPool.length;
    const triplet: [SlotCard, SlotCard, SlotCard] = [dailyPool[idx1], dailyPool[idx2], dailyPool[idx3]];

    // Animate for 1.5 seconds
    setTimeout(() => {
      const matches = evaluateSpin(triplet);
      const points = matches.reduce((sum, m) => sum + m.points, 0);

      const result: SpinResult = { cards: triplet, matches, points };
      const newSpins = spinsUsed + 1;
      const newPoints = totalPoints + points;
      const newResults = [...results, result];

      setCurrentSpin(result);
      setShowResult(true);
      setSpinning(false);
      setSpinsUsed(newSpins);
      setTotalPoints(newPoints);
      setResults(newResults);

      const newTotalSpins = totalSpins + 1;
      setTotalSpins(newTotalSpins);
      saveTotalSpins(newTotalSpins);

      saveDailyState({ spinsUsed: newSpins, totalPoints: newPoints, results: newResults });

      if (newSpins >= MAX_SPINS && newPoints > highScore) {
        setHighScore(newPoints);
        saveHighScore(newPoints);
      }
    }, 1200);
  }, [spinning, spinsUsed, dailyPool, totalPoints, results, highScore, totalSpins]);

  const shareText = `Card Slots on CardVault!\nScore: ${totalPoints} pts (${spinsUsed}/${MAX_SPINS} spins)\nBest matches: ${results.filter(r => r.points > 0).length}/${results.length} spins scored\nHigh score: ${Math.max(highScore, totalPoints)}\nhttps://cardvault-two.vercel.app/card-slots`;

  const gameComplete = spinsUsed >= MAX_SPINS;

  const grade = totalPoints >= 800 ? { label: 'S', color: 'text-yellow-400', desc: 'Slot Machine Legend' } :
                totalPoints >= 500 ? { label: 'A', color: 'text-green-400', desc: 'High Roller' } :
                totalPoints >= 300 ? { label: 'B', color: 'text-blue-400', desc: 'Lucky Streak' } :
                totalPoints >= 150 ? { label: 'C', color: 'text-purple-400', desc: 'Getting Warm' } :
                totalPoints >= 50 ? { label: 'D', color: 'text-gray-400', desc: 'Spin Again' } :
                { label: 'F', color: 'text-red-400', desc: 'Cold Reels' };

  if (!mounted) {
    return (
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-8 text-center">
        <p className="text-gray-400">Loading Card Slots...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
          <p className="text-gray-500 text-xs">Spins</p>
          <p className="text-white font-bold text-lg">{spinsUsed}/{MAX_SPINS}</p>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
          <p className="text-gray-500 text-xs">Points</p>
          <p className="text-yellow-400 font-bold text-lg">{totalPoints}</p>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
          <p className="text-gray-500 text-xs">High Score</p>
          <p className="text-green-400 font-bold text-lg">{Math.max(highScore, gameComplete ? totalPoints : 0)}</p>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
          <p className="text-gray-500 text-xs">All-time Spins</p>
          <p className="text-blue-400 font-bold text-lg">{totalSpins}</p>
        </div>
      </div>

      {/* Slot Machine */}
      <div className="bg-gradient-to-b from-yellow-950/30 to-gray-900/60 border-2 border-yellow-800/40 rounded-2xl p-6 relative overflow-hidden">
        {/* Decorative top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600" />

        <div className="text-center mb-4">
          <p className="text-yellow-400 text-sm font-medium tracking-wider uppercase">
            {spinning ? 'Spinning...' : gameComplete ? 'Game Over' : `Spin ${spinsUsed + 1} of ${MAX_SPINS}`}
          </p>
        </div>

        {/* Three Reels */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[0, 1, 2].map(i => {
            const card = currentSpin?.cards[i];
            const isSpinning = spinning;
            const sc = card ? sportColors[card.sport] || sportColors.baseball : sportColors.baseball;

            return (
              <div key={i} className={`relative rounded-xl border-2 overflow-hidden transition-all duration-300 ${
                isSpinning ? 'border-yellow-500/50 animate-pulse' :
                card ? `${sc.border} ${sc.bg}` : 'border-gray-700 bg-gray-900/80'
              }`}>
                <div className="aspect-[3/4] flex flex-col items-center justify-center p-3 text-center">
                  {isSpinning ? (
                    <div className="space-y-2">
                      <div className="text-3xl animate-bounce">{['&#9824;', '&#9829;', '&#9830;'][i]}</div>
                      <div className="w-8 h-1 bg-yellow-500/40 rounded-full mx-auto animate-pulse" />
                    </div>
                  ) : card ? (
                    <>
                      <span className="text-2xl mb-1">{sportEmoji[card.sport] || '&#127183;'}</span>
                      <p className={`font-bold text-sm leading-tight ${sc.text}`}>{card.player}</p>
                      <p className="text-gray-400 text-xs mt-1">{card.year} {card.set.split(' ').slice(1).join(' ')}</p>
                      <p className="text-white font-mono text-sm mt-2">{formatValue(card.value)}</p>
                    </>
                  ) : (
                    <>
                      <span className="text-3xl text-gray-600">?</span>
                      <p className="text-gray-600 text-xs mt-2">Reel {i + 1}</p>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Match result */}
        {showResult && currentSpin && (
          <div className={`rounded-xl p-4 mb-4 text-center transition-all ${
            currentSpin.points > 0 ? 'bg-yellow-950/40 border border-yellow-800/50' : 'bg-gray-900/40 border border-gray-800'
          }`}>
            {currentSpin.matches.length > 0 ? (
              <div className="space-y-1">
                {currentSpin.matches.map((m, i) => (
                  <p key={i} className={`font-bold ${
                    m.type === 'jackpot' ? 'text-yellow-400 text-lg' : 'text-green-400 text-sm'
                  }`}>
                    {m.type === 'jackpot' && m.points >= 500 ? '&#127881; ' : ''}
                    {m.label} +{m.points} pts
                  </p>
                ))}
                <p className="text-yellow-400 font-bold text-xl mt-2">+{currentSpin.points} pts</p>
              </div>
            ) : (
              <p className="text-gray-500">No matches this spin</p>
            )}
          </div>
        )}

        {/* Spin button */}
        {!gameComplete ? (
          <button
            onClick={doSpin}
            disabled={spinning}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
              spinning
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-gray-900 shadow-lg shadow-yellow-900/30 active:scale-[0.98]'
            }`}
          >
            {spinning ? 'Spinning...' : 'SPIN'}
          </button>
        ) : (
          <div className="text-center space-y-4">
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
              <p className={`text-5xl font-black ${grade.color}`}>{grade.label}</p>
              <p className="text-gray-400 text-sm mt-1">{grade.desc}</p>
              <p className="text-white font-bold text-2xl mt-3">{totalPoints} points</p>
              {totalPoints >= highScore && totalPoints > 0 && (
                <p className="text-yellow-400 text-sm mt-1">New high score!</p>
              )}
            </div>
            <button
              onClick={() => {
                if (typeof navigator !== 'undefined' && navigator.clipboard) {
                  navigator.clipboard.writeText(shareText);
                }
              }}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors"
            >
              Copy Results to Share
            </button>
          </div>
        )}
      </div>

      {/* Spin History */}
      {results.length > 0 && (
        <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-3">Spin History</h3>
          <div className="space-y-2">
            {results.map((r, i) => (
              <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-gray-800/50 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-gray-500 text-xs w-6">#{i + 1}</span>
                  <div className="flex gap-1">
                    {r.cards.map((c, j) => (
                      <span key={j} className="text-xs px-1.5 py-0.5 bg-gray-800 rounded text-gray-300">
                        {sportEmoji[c.sport]} {c.player.split(' ').pop()}
                      </span>
                    ))}
                  </div>
                </div>
                <span className={`font-medium ${r.points > 0 ? 'text-yellow-400' : 'text-gray-600'}`}>
                  {r.points > 0 ? `+${r.points}` : '0'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scoring Guide */}
      <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-5">
        <h3 className="text-white font-semibold text-sm mb-3">Scoring Guide</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex justify-between bg-gray-800/40 rounded-lg px-3 py-2">
            <span className="text-yellow-400">Triple Player (Jackpot)</span>
            <span className="text-white font-bold">500 pts</span>
          </div>
          <div className="flex justify-between bg-gray-800/40 rounded-lg px-3 py-2">
            <span className="text-yellow-400">Double Player (Pair)</span>
            <span className="text-white font-bold">200 pts</span>
          </div>
          <div className="flex justify-between bg-gray-800/40 rounded-lg px-3 py-2">
            <span className="text-green-400">Same Team</span>
            <span className="text-white font-bold">150 pts</span>
          </div>
          <div className="flex justify-between bg-gray-800/40 rounded-lg px-3 py-2">
            <span className="text-blue-400">Triple Sport</span>
            <span className="text-white font-bold">100 pts</span>
          </div>
          <div className="flex justify-between bg-gray-800/40 rounded-lg px-3 py-2">
            <span className="text-purple-400">Same Decade</span>
            <span className="text-white font-bold">75 pts</span>
          </div>
          <div className="flex justify-between bg-gray-800/40 rounded-lg px-3 py-2">
            <span className="text-gray-400">Same Value Tier</span>
            <span className="text-white font-bold">50 pts</span>
          </div>
        </div>
      </div>
    </div>
  );
}
