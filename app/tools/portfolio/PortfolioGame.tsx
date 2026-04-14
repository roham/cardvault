'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';
import type { SportsCard } from '@/data/sports-cards';

// ─── Types ───────────────────────────────────────────────────────────

interface PortfolioCard {
  card: SportsCard;
  buyPrice: number;
  dailyPrices: number[];
  finalPrice: number;
  gainPct: number;
}

interface Portfolio {
  cards: PortfolioCard[];
  totalGain: number;
  timestamp: number;
}

// ─── Simulation ──────────────────────────────────────────────────────

function parseEstimatedValue(value: string): number {
  // "$100–$400 (PSA 9)" → midpoint 250
  const match = value.match(/\$([0-9,]+).*?\$([0-9,]+)/);
  if (!match) {
    const single = value.match(/\$([0-9,]+)/);
    return single ? parseInt(single[1].replace(/,/g, ''), 10) : 50;
  }
  const low = parseInt(match[1].replace(/,/g, ''), 10);
  const high = parseInt(match[2].replace(/,/g, ''), 10);
  return Math.round((low + high) / 2);
}

function getVolatility(card: SportsCard): number {
  // Rookies are more volatile, vintage is more stable
  const age = 2026 - card.year;
  const baseVol = card.rookie ? 0.06 : 0.03;
  const ageFactor = age > 30 ? 0.5 : age > 10 ? 0.8 : 1.2;
  return baseVol * ageFactor;
}

function simulateWeek(card: SportsCard): { dailyPrices: number[]; finalPrice: number } {
  const startPrice = parseEstimatedValue(card.estimatedValueRaw);
  const vol = getVolatility(card);
  const drift = (Math.random() - 0.45) * 0.02; // slight upward bias

  const prices: number[] = [startPrice];
  let price = startPrice;

  for (let d = 0; d < 7; d++) {
    const change = drift + vol * (Math.random() * 2 - 1);
    // Occasional spike event (5% chance per day)
    const spike = Math.random() < 0.05 ? (Math.random() - 0.3) * 0.15 : 0;
    price = Math.max(price * 0.5, price * (1 + change + spike));
    prices.push(Math.round(price * 100) / 100);
  }

  return { dailyPrices: prices, finalPrice: prices[prices.length - 1] };
}

function buildPortfolio(cards: SportsCard[]): Portfolio {
  const portfolioCards: PortfolioCard[] = cards.map(card => {
    const buyPrice = parseEstimatedValue(card.estimatedValueRaw);
    const { dailyPrices, finalPrice } = simulateWeek(card);
    const gainPct = ((finalPrice - buyPrice) / buyPrice) * 100;
    return { card, buyPrice, dailyPrices, finalPrice, gainPct };
  });

  const totalGain = portfolioCards.reduce((sum, c) => sum + c.gainPct, 0) / portfolioCards.length;

  return { cards: portfolioCards, totalGain, timestamp: Date.now() };
}

// ─── Mini Sparkline ──────────────────────────────────────────────────

function Sparkline({ prices, positive }: { prices: number[]; positive: boolean }) {
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const w = 100;
  const h = 30;
  const points = prices.map((p, i) => {
    const x = (i / (prices.length - 1)) * w;
    const y = h - ((p - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-8" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={positive ? '#22c55e' : '#ef4444'}
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

// ─── Card Search ─────────────────────────────────────────────────────

function CardSearch({ onSelect, selectedSlugs }: { onSelect: (card: SportsCard) => void; selectedSlugs: Set<string> }) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    return sportsCards
      .filter(c => !selectedSlugs.has(c.slug))
      .filter(c =>
        c.player.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.set.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [query, selectedSlugs]);

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search by player, set, or year..."
        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
      />
      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-700 rounded-xl overflow-hidden z-10 max-h-64 overflow-y-auto">
          {results.map(card => (
            <button
              key={card.slug}
              onClick={() => { onSelect(card); setQuery(''); }}
              className="w-full text-left px-4 py-3 hover:bg-gray-800 transition-colors border-b border-gray-800 last:border-0"
            >
              <p className="text-white text-sm font-medium">{card.name}</p>
              <p className="text-gray-500 text-xs">{card.sport} &middot; {card.estimatedValueRaw}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────

const LEADERBOARD_ENTRIES = [
  { name: 'CardKing99', gain: 14.2, cards: ['Wembanyama', 'Ohtani', 'Bedard', 'MHJ', 'Skenes'] },
  { name: 'VintageVibes', gain: 8.7, cards: ['Mantle', 'Jordan', 'Gretzky', 'Montana', 'Ruth'] },
  { name: 'RookieHunter', gain: 6.3, cards: ['Holliday', 'Daniels', 'Sheppard', 'Celebrini', 'Flagg'] },
  { name: 'TheFlipster', gain: 3.1, cards: ['Trout', 'Mahomes', 'Crosby', 'LeBron', 'Brady'] },
  { name: 'SetBuilder42', gain: -1.5, cards: ['Jeter', 'Griffey', 'Piazza', 'Chipper', 'Ripken'] },
];

export default function PortfolioGame() {
  const [selected, setSelected] = useState<SportsCard[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [copied, setCopied] = useState(false);

  const selectedSlugs = useMemo(() => new Set(selected.map(c => c.slug)), [selected]);

  const handleAdd = useCallback((card: SportsCard) => {
    if (selected.length >= 5 || selectedSlugs.has(card.slug)) return;
    setSelected(prev => [...prev, card]);
  }, [selected, selectedSlugs]);

  const handleRemove = useCallback((slug: string) => {
    setSelected(prev => prev.filter(c => c.slug !== slug));
  }, []);

  const handleSimulate = useCallback(() => {
    if (selected.length !== 5) return;
    setPortfolio(buildPortfolio(selected));
  }, [selected]);

  const handleShare = useCallback(() => {
    if (!portfolio) return;
    const data = {
      c: portfolio.cards.map(c => c.card.slug),
      g: portfolio.totalGain.toFixed(1),
    };
    const url = `${window.location.origin}/tools/portfolio?p=${btoa(JSON.stringify(data))}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [portfolio]);

  const handleReset = useCallback(() => {
    setPortfolio(null);
    setSelected([]);
  }, []);

  // ─── Results View ────────────────────────────────────────────────

  if (portfolio) {
    const sorted = [...portfolio.cards].sort((a, b) => b.gainPct - a.gainPct);
    const isPositive = portfolio.totalGain >= 0;

    return (
      <div>
        {/* Summary */}
        <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Portfolio Results — 7 Day Simulation</h3>
            <div className={`text-2xl font-extrabold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? '+' : ''}{portfolio.totalGain.toFixed(1)}%
            </div>
          </div>

          <div className="space-y-3">
            {sorted.map((pc, i) => (
              <div key={pc.card.slug} className="flex items-center gap-4 bg-gray-800/50 rounded-lg p-3">
                <span className="text-gray-500 font-mono text-sm w-6">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <Link href={`/sports/${pc.card.slug}`} className="text-white text-sm font-medium hover:text-emerald-400 transition-colors truncate block">
                    {pc.card.name}
                  </Link>
                  <p className="text-gray-500 text-xs">
                    ${pc.buyPrice.toLocaleString()} → ${pc.finalPrice.toLocaleString()}
                  </p>
                </div>
                <div className="w-24 shrink-0">
                  <Sparkline prices={pc.dailyPrices} positive={pc.gainPct >= 0} />
                </div>
                <div className={`text-right w-16 font-bold text-sm ${pc.gainPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {pc.gainPct >= 0 ? '+' : ''}{pc.gainPct.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={handleReset} className="flex-1 py-3 px-4 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-black font-bold hover:from-green-400 hover:to-emerald-400 transition-all">
              Build New Portfolio
            </button>
            <button onClick={handleShare} className="py-3 px-4 rounded-lg border border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white transition-colors font-medium">
              {copied ? 'Copied!' : 'Share'}
            </button>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Leaderboard — This Week</h3>
          <div className="space-y-2">
            {[
              ...(portfolio.totalGain > LEADERBOARD_ENTRIES[0].gain
                ? [{ name: 'You', gain: portfolio.totalGain, cards: portfolio.cards.map(c => c.card.player.split(' ').pop() || '') }]
                : []),
              ...LEADERBOARD_ENTRIES,
              ...(portfolio.totalGain <= LEADERBOARD_ENTRIES[0].gain
                ? [{ name: 'You', gain: portfolio.totalGain, cards: portfolio.cards.map(c => c.card.player.split(' ').pop() || '') }]
                : []),
            ].sort((a, b) => b.gain - a.gain).map((entry, i) => (
              <div
                key={entry.name + i}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  entry.name === 'You' ? 'bg-emerald-950/30 border border-emerald-800/40' : 'bg-gray-800/30'
                }`}
              >
                <span className={`font-mono text-sm w-6 ${i < 3 ? 'text-yellow-400' : 'text-gray-500'}`}>
                  #{i + 1}
                </span>
                <span className={`font-semibold text-sm flex-1 ${entry.name === 'You' ? 'text-emerald-400' : 'text-white'}`}>
                  {entry.name}
                </span>
                <span className="text-gray-500 text-xs hidden sm:block">
                  {entry.cards.join(', ')}
                </span>
                <span className={`font-bold text-sm ${entry.gain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {entry.gain >= 0 ? '+' : ''}{entry.gain.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── Draft View ──────────────────────────────────────────────────

  return (
    <div>
      {/* Instructions */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 mb-6 text-center">
        <p className="text-gray-300 text-sm">
          <strong className="text-white">Draft your lineup:</strong> Search and select exactly 5 cards.
          Your goal is to pick cards that will gain the most value over 7 simulated days.
        </p>
        <p className="text-gray-500 text-xs mt-2">
          Tip: Rookies are volatile (big gains or losses). Vintage is stable. Mix your strategy.
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Add Card ({selected.length}/5)
        </label>
        <CardSearch onSelect={handleAdd} selectedSlugs={selectedSlugs} />
      </div>

      {/* Selected Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-8">
        {Array.from({ length: 5 }).map((_, i) => {
          const card = selected[i];
          if (card) {
            return (
              <div key={card.slug} className="bg-gray-900 border border-gray-700 rounded-xl p-4 relative">
                <button
                  onClick={() => handleRemove(card.slug)}
                  className="absolute top-2 right-2 text-gray-600 hover:text-red-400 transition-colors"
                  aria-label="Remove card"
                >
                  &times;
                </button>
                <p className="text-white text-sm font-medium leading-tight pr-6">{card.name}</p>
                <p className="text-gray-500 text-xs mt-1">{card.sport}</p>
                <p className="text-emerald-400 text-xs font-medium mt-1">{card.estimatedValueRaw}</p>
              </div>
            );
          }
          return (
            <div key={i} className="border-2 border-dashed border-gray-800 rounded-xl p-4 flex items-center justify-center min-h-[100px]">
              <span className="text-gray-600 text-sm">Slot {i + 1}</span>
            </div>
          );
        })}
      </div>

      {/* Simulate Button */}
      <div className="text-center">
        <button
          onClick={handleSimulate}
          disabled={selected.length !== 5}
          className="py-4 px-8 rounded-xl bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-black font-extrabold text-lg hover:from-green-400 hover:via-emerald-400 hover:to-teal-400 transition-all transform hover:scale-105 disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed"
        >
          {selected.length === 5 ? 'Simulate 7-Day Performance' : `Select ${5 - selected.length} more card${5 - selected.length !== 1 ? 's' : ''}`}
        </button>
      </div>

      {/* Quick Picks */}
      <div className="mt-8">
        <h3 className="text-sm font-medium text-gray-500 mb-3 text-center">Quick Picks — Popular Strategies</h3>
        <div className="flex flex-wrap justify-center gap-2">
          {[
            { label: 'Rookie Rush', players: ['Victor Wembanyama', 'Connor Bedard', 'Paul Skenes', 'Caleb Williams', 'Reed Sheppard'] },
            { label: 'Blue Chips', players: ['Michael Jordan', 'Mickey Mantle', 'Wayne Gretzky', 'Tom Brady', 'LeBron James'] },
            { label: 'Modern Mix', players: ['Shohei Ohtani', 'Luka Doncic', 'Patrick Mahomes', 'Connor McDavid', 'Juan Soto'] },
          ].map(strat => (
            <button
              key={strat.label}
              onClick={() => {
                const picks = strat.players
                  .map(name => sportsCards.find(c => c.player === name))
                  .filter((c): c is SportsCard => c !== undefined)
                  .slice(0, 5);
                if (picks.length === 5) setSelected(picks);
              }}
              className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-full text-xs text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
            >
              {strat.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
