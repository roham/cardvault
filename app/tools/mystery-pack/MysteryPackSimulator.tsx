'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface MysteryItem {
  name: string;
  player: string;
  year: number;
  set: string;
  sport: 'baseball' | 'basketball' | 'football' | 'hockey';
  estimatedValue: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'hit' | 'jackpot';
  isRookie: boolean;
}

interface PackTier {
  id: string;
  name: string;
  price: number;
  cardCount: number;
  description: string;
  hitRate: number; // % chance of a card being rare+
  jackpotRate: number; // % chance of jackpot
  expectedEV: number; // average expected value
  icon: string;
}

interface OpenResult {
  tier: PackTier;
  cards: MysteryItem[];
  totalValue: number;
  profit: number;
  timestamp: number;
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const TIERS: PackTier[] = [
  {
    id: 'budget',
    name: '$10 Mystery Pack',
    price: 10,
    cardCount: 5,
    description: 'Budget repack — mostly base cards with a chance at something decent',
    hitRate: 8,
    jackpotRate: 0.5,
    expectedEV: 7.50,
    icon: '📦',
  },
  {
    id: 'standard',
    name: '$25 Mystery Box',
    price: 25,
    cardCount: 10,
    description: 'Standard repack — guaranteed at least 1 numbered or parallel card',
    hitRate: 15,
    jackpotRate: 1.5,
    expectedEV: 20,
    icon: '🎁',
  },
  {
    id: 'premium',
    name: '$50 Premium Box',
    price: 50,
    cardCount: 15,
    description: 'Premium mystery box — guaranteed graded card + multiple hits',
    hitRate: 25,
    jackpotRate: 3,
    expectedEV: 42,
    icon: '💎',
  },
  {
    id: 'ultra',
    name: '$100 Ultra Box',
    price: 100,
    cardCount: 20,
    description: 'Ultra tier — multiple graded cards, autos, or relics guaranteed',
    hitRate: 35,
    jackpotRate: 5,
    expectedEV: 85,
    icon: '🔥',
  },
];

/* Card pools for generation */
const COMMON_PLAYERS: { name: string; sport: MysteryItem['sport'] }[] = [
  { name: 'Mike Trout', sport: 'baseball' }, { name: 'Aaron Judge', sport: 'baseball' },
  { name: 'Shohei Ohtani', sport: 'baseball' }, { name: 'Ronald Acuna Jr.', sport: 'baseball' },
  { name: 'Mookie Betts', sport: 'baseball' }, { name: 'Juan Soto', sport: 'baseball' },
  { name: 'LeBron James', sport: 'basketball' }, { name: 'Stephen Curry', sport: 'basketball' },
  { name: 'Luka Doncic', sport: 'basketball' }, { name: 'Jayson Tatum', sport: 'basketball' },
  { name: 'Giannis Antetokounmpo', sport: 'basketball' }, { name: 'Kevin Durant', sport: 'basketball' },
  { name: 'Patrick Mahomes', sport: 'football' }, { name: 'Josh Allen', sport: 'football' },
  { name: 'Lamar Jackson', sport: 'football' }, { name: 'CJ Stroud', sport: 'football' },
  { name: 'Caleb Williams', sport: 'football' }, { name: 'Jayden Daniels', sport: 'football' },
  { name: 'Connor McDavid', sport: 'hockey' }, { name: 'Connor Bedard', sport: 'hockey' },
  { name: 'Auston Matthews', sport: 'hockey' }, { name: 'Nathan MacKinnon', sport: 'hockey' },
];

const SETS_BY_SPORT: Record<string, { name: string; year: number }[]> = {
  baseball: [
    { name: 'Topps Series 1', year: 2025 }, { name: 'Topps Chrome', year: 2024 },
    { name: 'Bowman Chrome', year: 2024 }, { name: 'Topps Heritage', year: 2024 },
    { name: 'Topps Series 2', year: 2024 }, { name: 'Topps Update', year: 2023 },
  ],
  basketball: [
    { name: 'Panini Prizm', year: 2024 }, { name: 'Panini Select', year: 2024 },
    { name: 'Panini Mosaic', year: 2024 }, { name: 'Donruss Optic', year: 2024 },
    { name: 'NBA Hoops', year: 2024 }, { name: 'Panini Chronicles', year: 2024 },
  ],
  football: [
    { name: 'Panini Prizm', year: 2024 }, { name: 'Topps Chrome', year: 2024 },
    { name: 'Panini Select', year: 2024 }, { name: 'Donruss', year: 2025 },
    { name: 'Panini Mosaic', year: 2024 }, { name: 'Score', year: 2025 },
  ],
  hockey: [
    { name: 'Upper Deck Series 1', year: 2024 }, { name: 'Upper Deck Young Guns', year: 2024 },
    { name: 'O-Pee-Chee', year: 2024 }, { name: 'SP Authentic', year: 2024 },
  ],
};

const RARITY_COLORS: Record<string, string> = {
  common: 'text-gray-400 border-gray-700 bg-gray-800/50',
  uncommon: 'text-green-400 border-green-700 bg-green-900/30',
  rare: 'text-blue-400 border-blue-600 bg-blue-900/30',
  hit: 'text-purple-400 border-purple-600 bg-purple-900/30',
  jackpot: 'text-yellow-400 border-yellow-500 bg-yellow-900/30',
};

const RARITY_LABELS: Record<string, string> = {
  common: 'Base',
  uncommon: 'Parallel',
  rare: 'Numbered',
  hit: 'Auto / Relic',
  jackpot: 'JACKPOT',
};

const SPORT_ICONS: Record<string, string> = {
  baseball: '⚾',
  basketball: '🏀',
  football: '🏈',
  hockey: '🏒',
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function generateCard(tier: PackTier, rng: () => number): MysteryItem {
  const roll = rng() * 100;

  let rarity: MysteryItem['rarity'];
  let valueMin: number;
  let valueMax: number;

  if (roll < tier.jackpotRate) {
    rarity = 'jackpot';
    valueMin = tier.price * 2;
    valueMax = tier.price * 10;
  } else if (roll < tier.jackpotRate + tier.hitRate * 0.3) {
    rarity = 'hit';
    valueMin = tier.price * 0.5;
    valueMax = tier.price * 3;
  } else if (roll < tier.jackpotRate + tier.hitRate) {
    rarity = 'rare';
    valueMin = 5;
    valueMax = tier.price * 1.5;
  } else if (roll < tier.jackpotRate + tier.hitRate + 20) {
    rarity = 'uncommon';
    valueMin = 1;
    valueMax = 8;
  } else {
    rarity = 'common';
    valueMin = 0.25;
    valueMax = 2;
  }

  const value = Math.round((valueMin + rng() * (valueMax - valueMin)) * 100) / 100;
  const playerEntry = COMMON_PLAYERS[Math.floor(rng() * COMMON_PLAYERS.length)];
  const sets = SETS_BY_SPORT[playerEntry.sport];
  const setEntry = sets[Math.floor(rng() * sets.length)];
  const isRookie = rng() < 0.15;

  return {
    name: `${setEntry.year} ${setEntry.name} ${playerEntry.name}${isRookie ? ' RC' : ''}`,
    player: playerEntry.name,
    year: setEntry.year,
    set: setEntry.name,
    sport: playerEntry.sport,
    estimatedValue: value,
    rarity,
    isRookie,
  };
}

function formatCurrency(n: number): string {
  return n < 0
    ? `-$${Math.abs(n).toFixed(2)}`
    : `$${n.toFixed(2)}`;
}

const STORAGE_KEY = 'cardvault-mystery-pack-history';

function loadHistory(): OpenResult[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(history: OpenResult[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 50)));
  } catch { /* quota */ }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function MysteryPackSimulator() {
  const [selectedTier, setSelectedTier] = useState<PackTier | null>(null);
  const [result, setResult] = useState<OpenResult | null>(null);
  const [history, setHistory] = useState<OpenResult[]>(() => loadHistory());
  const [isOpening, setIsOpening] = useState(false);
  const [revealedCount, setRevealedCount] = useState(0);
  const [showHistory, setShowHistory] = useState(false);

  const totalSpent = history.reduce((s, r) => s + r.tier.price, 0);
  const totalValue = history.reduce((s, r) => s + r.totalValue, 0);
  const totalProfit = totalValue - totalSpent;
  const boxesOpened = history.length;

  const openPack = useCallback((tier: PackTier) => {
    setIsOpening(true);
    setRevealedCount(0);
    setResult(null);

    const seed = Date.now() + Math.floor(Math.random() * 100000);
    const rng = seededRandom(seed);

    const cards: MysteryItem[] = [];
    for (let i = 0; i < tier.cardCount; i++) {
      cards.push(generateCard(tier, rng));
    }
    // Sort: jackpots last (big reveal)
    cards.sort((a, b) => {
      const order = { common: 0, uncommon: 1, rare: 2, hit: 3, jackpot: 4 };
      return order[a.rarity] - order[b.rarity];
    });

    const tv = Math.round(cards.reduce((s, c) => s + c.estimatedValue, 0) * 100) / 100;
    const profit = Math.round((tv - tier.price) * 100) / 100;

    const openResult: OpenResult = { tier, cards, totalValue: tv, profit, timestamp: Date.now() };

    // Reveal cards one by one
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setRevealedCount(count);
      if (count >= cards.length) {
        clearInterval(interval);
        setIsOpening(false);
        setResult(openResult);
        const updated = [openResult, ...history].slice(0, 50);
        setHistory(updated);
        saveHistory(updated);
      }
    }, 300);

    setSelectedTier(tier);
    setResult(openResult);
  }, [history]);

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div className="space-y-10">
      {/* Stats Bar */}
      {boxesOpened > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Boxes Opened', value: boxesOpened.toString(), color: 'text-white' },
            { label: 'Total Spent', value: formatCurrency(totalSpent), color: 'text-red-400' },
            { label: 'Total Value', value: formatCurrency(totalValue), color: 'text-green-400' },
            { label: 'Net P&L', value: formatCurrency(totalProfit), color: totalProfit >= 0 ? 'text-green-400' : 'text-red-400' },
          ].map(s => (
            <div key={s.label} className="bg-gray-800/60 border border-gray-700 rounded-xl p-3 text-center">
              <div className="text-xs text-gray-500 uppercase tracking-wide">{s.label}</div>
              <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tier Selection */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Pick Your Mystery Box</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TIERS.map(tier => (
            <button
              key={tier.id}
              onClick={() => openPack(tier)}
              disabled={isOpening}
              className={`text-left p-5 rounded-xl border transition-all ${
                isOpening
                  ? 'opacity-50 cursor-not-allowed border-gray-700 bg-gray-800/40'
                  : 'border-gray-700 bg-gray-800/60 hover:border-yellow-600 hover:bg-gray-800 cursor-pointer'
              }`}
            >
              <div className="text-3xl mb-2">{tier.icon}</div>
              <div className="font-bold text-white text-lg">{tier.name}</div>
              <div className="text-sm text-gray-400 mt-1">{tier.description}</div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
                <span className="text-xs text-gray-500">{tier.cardCount} cards</span>
                <span className="text-xs text-gray-500">~{formatCurrency(tier.expectedEV)} avg EV</span>
              </div>
              <div className="mt-2 text-xs text-yellow-500/80">
                {tier.jackpotRate}% jackpot chance
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Current Open Result */}
      {result && (
        <div className="bg-gray-900/80 border border-gray-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-white">
              {result.tier.icon} {result.tier.name} — Results
            </h2>
            <div className={`text-lg font-bold ${result.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {result.profit >= 0 ? 'W' : 'L'} {formatCurrency(result.profit)}
            </div>
          </div>

          {/* Value bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Total value: <span className="text-white font-medium">{formatCurrency(result.totalValue)}</span></span>
              <span className="text-gray-400">Paid: <span className="text-white font-medium">{formatCurrency(result.tier.price)}</span></span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${result.profit >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                style={{ width: `${Math.min(100, (result.totalValue / result.tier.price) * 100)}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {Math.round((result.totalValue / result.tier.price) * 100)}% return on cost
            </div>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {result.cards.map((card, i) => {
              const revealed = i < revealedCount;
              return (
                <div
                  key={i}
                  className={`rounded-lg border p-3 transition-all duration-300 ${
                    revealed
                      ? RARITY_COLORS[card.rarity]
                      : 'border-gray-700 bg-gray-800/40'
                  } ${card.rarity === 'jackpot' && revealed ? 'ring-2 ring-yellow-500/50' : ''}`}
                >
                  {revealed ? (
                    <>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium uppercase tracking-wider">
                          {RARITY_LABELS[card.rarity]}
                        </span>
                        <span className="text-xs">{SPORT_ICONS[card.sport]}</span>
                      </div>
                      <div className="font-medium text-sm text-white truncate">{card.name}</div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">{card.set}</span>
                        <span className={`font-bold text-sm ${card.rarity === 'jackpot' ? 'text-yellow-400' : 'text-white'}`}>
                          {formatCurrency(card.estimatedValue)}
                        </span>
                      </div>
                      {card.isRookie && (
                        <span className="inline-block mt-1 text-[10px] bg-orange-900/40 text-orange-400 border border-orange-700/50 rounded px-1.5 py-0.5">
                          RC
                        </span>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-16 text-gray-600 text-2xl animate-pulse">
                      ?
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Best Pull */}
          {!isOpening && (
            <div className="mt-5 pt-4 border-t border-gray-700">
              <div className="text-sm text-gray-400">
                Best pull: <span className="text-white font-medium">
                  {result.cards.reduce((best, c) => c.estimatedValue > best.estimatedValue ? c : best).name}
                </span>
                {' — '}
                <span className="text-green-400 font-medium">
                  {formatCurrency(result.cards.reduce((best, c) => c.estimatedValue > best.estimatedValue ? c : best).estimatedValue)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* History Toggle */}
      {history.length > 0 && (
        <div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            {showHistory ? 'Hide' : 'Show'} History ({history.length} boxes)
          </button>

          {showHistory && (
            <div className="mt-4 space-y-2">
              {history.map((h, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-800/40 border border-gray-700/50 rounded-lg px-4 py-2 text-sm">
                  <div className="flex items-center gap-3">
                    <span>{h.tier.icon}</span>
                    <span className="text-gray-300">{h.tier.name}</span>
                    <span className="text-gray-500 text-xs">
                      {new Date(h.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <div className={`font-medium ${h.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency(h.profit)}
                  </div>
                </div>
              ))}
              <button
                onClick={clearHistory}
                className="text-xs text-red-400/60 hover:text-red-400 transition-colors mt-2"
              >
                Clear history
              </button>
            </div>
          )}
        </div>
      )}

      {/* Educational Section */}
      <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-5">
        <h3 className="font-bold text-white mb-3">Mystery Box Reality Check</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-400">
          <div>
            <div className="font-medium text-gray-300 mb-1">The Math</div>
            <p>Most mystery/repack boxes sell at a markup. On average, you get 70-85% of what you pay in card value. The seller profit margin is built into the price.</p>
          </div>
          <div>
            <div className="font-medium text-gray-300 mb-1">Why People Buy Them</div>
            <p>The thrill of the unknown. Sometimes you hit big — a graded card, a rare auto, or a card worth 5x the box price. That possibility is what makes it fun.</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/tools/sealed-ev" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
            Sealed Product EV Calculator &rarr;
          </Link>
          <Link href="/tools/flip-calc" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
            Flip Profit Calculator &rarr;
          </Link>
          <Link href="/tools/pack-sim" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
            Pack Simulator &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
