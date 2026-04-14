'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { sealedProducts } from '@/data/sealed-products';
import type { SealedProduct } from '@/data/sealed-products';

// ─── Types ───────────────────────────────────────────────────────────

interface PulledCard {
  type: 'base' | 'hit';
  label: string;
  value: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'ultra-rare';
  description: string;
}

interface DailyResult {
  date: string;
  productSlug: string;
  productName: string;
  cards: PulledCard[];
  totalValue: number;
  bestPull: PulledCard | null;
  hitCount: number;
}

interface DailyState {
  results: DailyResult[];
  streak: number;
  lastOpenDate: string;
  totalPacks: number;
  totalHits: number;
  bestEverPull: { label: string; value: number; date: string } | null;
}

// ─── Constants ───────────────────────────────────────────────────────

const STORAGE_KEY = 'cardvault-daily-pack';

const sportEmoji: Record<string, string> = {
  baseball: '\u26BE', basketball: '\uD83C\uDFC0', football: '\uD83C\uDFC8',
  hockey: '\uD83C\uDFD2', pokemon: '\u26A1',
};

const rarityColors: Record<string, string> = {
  common: 'border-gray-700 bg-gray-900/50',
  uncommon: 'border-blue-700 bg-blue-950/30',
  rare: 'border-purple-600 bg-purple-950/30',
  'ultra-rare': 'border-yellow-500 bg-yellow-950/30 shadow-yellow-500/20 shadow-lg',
};

const rarityLabels: Record<string, string> = {
  common: 'Base', uncommon: 'Parallel', rare: 'Hit', 'ultra-rare': 'Big Hit!',
};

// ─── Helpers ─────────────────────────────────────────────────────────

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

function getProductForDate(dateStr: string): SealedProduct {
  // Deterministic product rotation based on date
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % sealedProducts.length;
  return sealedProducts[idx];
}

function parseOdds(odds: string): number {
  const match = odds.match(/1:(\d+)/);
  if (!match) return 0.05;
  return 1 / parseInt(match[1], 10);
}

function getRarityFromValue(value: number): PulledCard['rarity'] {
  if (value >= 50) return 'ultra-rare';
  if (value >= 15) return 'rare';
  if (value >= 5) return 'uncommon';
  return 'common';
}

function simulatePack(product: SealedProduct): PulledCard[] {
  const cards: PulledCard[] = [];

  for (const hit of product.hitRates) {
    const prob = parseOdds(hit.odds);
    // Boost hit rates slightly for daily pack to make it more exciting
    if (Math.random() < prob * 1.5) {
      const variance = 0.5 + Math.random();
      const value = Math.round(hit.avgValue * variance);
      cards.push({
        type: 'hit',
        label: hit.insert,
        value,
        rarity: getRarityFromValue(value),
        description: hit.description,
      });
    }
  }

  const baseValuePerCard = product.baseCardValue / (product.packsPerBox * product.cardsPerPack);
  const baseSlots = Math.max(1, product.cardsPerPack - cards.length);
  for (let c = 0; c < baseSlots; c++) {
    const variance = 0.3 + Math.random() * 1.4;
    const value = Math.round(basePerCardValue(baseValuePerCard) * variance * 100) / 100;
    cards.push({
      type: 'base',
      label: 'Base Card',
      value: Math.max(0.01, value),
      rarity: 'common',
      description: 'Standard base card',
    });
  }

  return cards;
}

function basePerCardValue(v: number): number { return v; }

function loadState(): DailyState {
  if (typeof window === 'undefined') return { results: [], streak: 0, lastOpenDate: '', totalPacks: 0, totalHits: 0, bestEverPull: null };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* empty */ }
  return { results: [], streak: 0, lastOpenDate: '', totalPacks: 0, totalHits: 0, bestEverPull: null };
}

function saveState(state: DailyState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* empty */ }
}

function calculateStreak(lastDate: string, today: string): number {
  if (!lastDate) return 0;
  const last = new Date(lastDate);
  const now = new Date(today);
  const diffMs = now.getTime() - last.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return -1; // already opened today
  if (diffDays === 1) return 1; // consecutive day
  return 0; // streak broken
}

// ─── Components ──────────────────────────────────────────────────────

function CardReveal({ card, index }: { card: PulledCard; index: number }) {
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), index * 120 + 200);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div className={`transition-all duration-500 ${revealed ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
      <div className={`rounded-lg border-2 p-3 ${rarityColors[card.rarity]} relative overflow-hidden`}>
        {card.rarity === 'ultra-rare' && (
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-yellow-400/5 animate-pulse" />
        )}
        <div className="relative">
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${
              card.rarity === 'ultra-rare' ? 'text-yellow-400' :
              card.rarity === 'rare' ? 'text-purple-400' :
              card.rarity === 'uncommon' ? 'text-blue-400' :
              'text-gray-500'
            }`}>
              {rarityLabels[card.rarity]}
            </span>
            <span className={`text-xs font-bold ${card.value >= 15 ? 'text-green-400' : 'text-gray-400'}`}>
              ${card.value.toFixed(card.value < 1 ? 2 : 0)}
            </span>
          </div>
          <p className="text-sm text-white font-medium leading-tight">{card.label}</p>
          {card.type === 'hit' && (
            <p className="text-[10px] text-gray-400 mt-1 leading-tight">{card.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatsBar({ state }: { state: DailyState }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
      <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-3 text-center">
        <p className="text-2xl font-bold text-orange-400">{state.streak}</p>
        <p className="text-xs text-gray-500 uppercase tracking-wider">Day Streak</p>
      </div>
      <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-3 text-center">
        <p className="text-2xl font-bold text-white">{state.totalPacks}</p>
        <p className="text-xs text-gray-500 uppercase tracking-wider">Packs Opened</p>
      </div>
      <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-3 text-center">
        <p className="text-2xl font-bold text-purple-400">{state.totalHits}</p>
        <p className="text-xs text-gray-500 uppercase tracking-wider">Total Hits</p>
      </div>
      <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-3 text-center">
        <p className="text-2xl font-bold text-green-400">
          {state.bestEverPull ? `$${state.bestEverPull.value}` : '--'}
        </p>
        <p className="text-xs text-gray-500 uppercase tracking-wider">Best Pull</p>
      </div>
    </div>
  );
}

function Countdown() {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    function update() {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    }
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center py-8">
      <div className="inline-block bg-gray-900/80 border border-gray-800 rounded-xl p-8">
        <p className="text-5xl mb-3">&#x1F381;</p>
        <h3 className="text-xl font-bold text-white mb-2">Next free pack in</h3>
        <p className="text-3xl font-mono font-bold text-orange-400">{timeLeft}</p>
        <p className="text-sm text-gray-500 mt-3">Come back tomorrow to keep your streak alive!</p>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────

export default function DailyPack() {
  const [state, setState] = useState<DailyState | null>(null);
  const [todayResult, setTodayResult] = useState<DailyResult | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  const [showCards, setShowCards] = useState(false);

  const today = useMemo(() => getTodayString(), []);
  const todayProduct = useMemo(() => getProductForDate(today), [today]);

  // Load state on mount
  useEffect(() => {
    const loaded = loadState();
    setState(loaded);
    // Check if already opened today
    const existing = loaded.results.find(r => r.date === today);
    if (existing) {
      setTodayResult(existing);
      setShowCards(true);
    }
  }, [today]);

  const alreadyOpened = todayResult !== null;

  const handleOpen = useCallback(() => {
    if (!state || alreadyOpened) return;
    setIsOpening(true);

    setTimeout(() => {
      const cards = simulatePack(todayProduct);
      const totalValue = cards.reduce((sum, c) => sum + c.value, 0);
      const hits = cards.filter(c => c.type === 'hit');
      const bestPull = hits.length > 0
        ? hits.reduce((best, c) => c.value > best.value ? c : best)
        : null;

      const result: DailyResult = {
        date: today,
        productSlug: todayProduct.slug,
        productName: todayProduct.name,
        cards,
        totalValue: Math.round(totalValue * 100) / 100,
        bestPull,
        hitCount: hits.length,
      };

      const streakInfo = calculateStreak(state.lastOpenDate, today);
      const newStreak = streakInfo === -1 ? state.streak : streakInfo === 1 ? state.streak + 1 : 1;

      const newBest = bestPull && (!state.bestEverPull || bestPull.value > state.bestEverPull.value)
        ? { label: bestPull.label, value: bestPull.value, date: today }
        : state.bestEverPull;

      const newState: DailyState = {
        results: [result, ...state.results].slice(0, 30), // Keep last 30 days
        streak: newStreak,
        lastOpenDate: today,
        totalPacks: state.totalPacks + 1,
        totalHits: state.totalHits + hits.length,
        bestEverPull: newBest,
      };

      setState(newState);
      saveState(newState);
      setTodayResult(result);
      setIsOpening(false);

      // Stagger card reveal
      setTimeout(() => setShowCards(true), 300);
    }, 800);
  }, [state, alreadyOpened, todayProduct, today]);

  if (!state) {
    return <div className="text-center py-20 text-gray-500">Loading...</div>;
  }

  return (
    <div>
      <StatsBar state={state} />

      {/* Today's Product */}
      <div className="text-center mb-8">
        <div className="inline-block bg-gray-900/80 border border-gray-800 rounded-xl p-6">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Today&apos;s Product</p>
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl">{sportEmoji[todayProduct.sport]}</span>
            <h3 className="text-lg font-bold text-white">{todayProduct.name}</h3>
          </div>
          <p className="text-sm text-gray-400">
            {todayProduct.cardsPerPack} cards per pack &middot; ${todayProduct.retailPrice} retail value
          </p>
        </div>
      </div>

      {/* Open Button or Countdown */}
      {!alreadyOpened ? (
        <div className="text-center mb-8">
          <button
            onClick={handleOpen}
            disabled={isOpening}
            className="py-5 px-12 rounded-xl bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-black font-extrabold text-xl hover:from-yellow-400 hover:via-orange-400 hover:to-red-400 transition-all transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-orange-500/25"
          >
            {isOpening ? 'Opening...' : 'Open Free Pack!'}
          </button>
          <p className="text-sm text-gray-500 mt-3">One free pack every day. No account needed.</p>
        </div>
      ) : (
        <Countdown />
      )}

      {/* Today's Cards */}
      {showCards && todayResult && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">
              Today&apos;s Pull
              {todayResult.hitCount > 0 && (
                <span className="ml-2 text-sm text-yellow-400">{todayResult.hitCount} hit{todayResult.hitCount > 1 ? 's' : ''}!</span>
              )}
            </h3>
            <span className="text-sm text-green-400 font-bold">
              ${todayResult.totalValue.toFixed(0)} total value
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {[
              ...todayResult.cards.filter(c => c.type === 'hit'),
              ...todayResult.cards.filter(c => c.type === 'base'),
            ].map((card, i) => (
              <CardReveal key={i} card={card} index={alreadyOpened ? 0 : i} />
            ))}
          </div>
        </div>
      )}

      {/* Recent History */}
      {state.results.length > 1 && (
        <section className="mt-8">
          <h3 className="text-lg font-bold text-white mb-4">Recent Pulls</h3>
          <div className="space-y-2">
            {state.results.slice(1, 8).map((result, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-900/50 border border-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">{result.date}</span>
                  <span className="text-sm text-white">{result.productName}</span>
                </div>
                <div className="flex items-center gap-4">
                  {result.hitCount > 0 && (
                    <span className="text-xs text-purple-400">{result.hitCount} hit{result.hitCount > 1 ? 's' : ''}</span>
                  )}
                  <span className="text-sm font-bold text-green-400">${result.totalValue.toFixed(0)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="mt-12 text-center">
        <p className="text-gray-400 mb-3">Want to open more?</p>
        <Link
          href="/tools/pack-sim"
          className="inline-block py-3 px-6 rounded-lg bg-gray-800 text-white font-bold hover:bg-gray-700 transition-colors"
        >
          Try the Full Pack Simulator
        </Link>
      </section>
    </div>
  );
}
