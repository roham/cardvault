'use client';

import { useState, useEffect, useCallback } from 'react';
import type { SportsCard } from '@/data/sports-cards';

function parseValue(v: string): number {
  const m = v.match(/\$([\d,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
}

function formatCurrency(n: number): string {
  return '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

type Rarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'ULTRA RARE' | 'LEGENDARY';

function getRarity(value: number): { label: Rarity; color: string; bg: string; glow: string; ring: string; flash: string } {
  if (value >= 5000) return { label: 'LEGENDARY', color: 'text-yellow-300', bg: 'bg-yellow-500/20 border-yellow-500/50', glow: 'shadow-yellow-500/60', ring: 'ring-yellow-400/80', flash: 'bg-yellow-400' };
  if (value >= 1000) return { label: 'ULTRA RARE', color: 'text-red-300', bg: 'bg-red-500/20 border-red-500/50', glow: 'shadow-red-500/60', ring: 'ring-red-400/60', flash: 'bg-red-400' };
  if (value >= 200) return { label: 'RARE', color: 'text-purple-300', bg: 'bg-purple-500/20 border-purple-500/50', glow: 'shadow-purple-500/40', ring: 'ring-purple-400/40', flash: 'bg-purple-400' };
  if (value >= 50) return { label: 'UNCOMMON', color: 'text-blue-300', bg: 'bg-blue-500/20 border-blue-500/50', glow: 'shadow-blue-500/30', ring: 'ring-blue-400/30', flash: 'bg-blue-400' };
  return { label: 'COMMON', color: 'text-gray-400', bg: 'bg-gray-700/30 border-gray-600/50', glow: '', ring: '', flash: '' };
}

function getRevealDelay(rarity: Rarity): number {
  switch (rarity) {
    case 'LEGENDARY': return 1200;
    case 'ULTRA RARE': return 1000;
    case 'RARE': return 800;
    case 'UNCOMMON': return 600;
    default: return 500;
  }
}

interface Props {
  cards: SportsCard[];
  packName: string;
  packPrice: number;
  onComplete: () => void;
  onBuyAnother?: () => void;
}

type Phase = 'anticipation' | 'revealing' | 'summary';

export default function CinematicReveal({ cards, packName, packPrice, onComplete, onBuyAnother }: Props) {
  const [phase, setPhase] = useState<Phase>('anticipation');
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [flashActive, setFlashActive] = useState(false);
  const [flashColor, setFlashColor] = useState('');
  const [bestPullIndex, setBestPullIndex] = useState(-1);

  // Find the best pull
  useEffect(() => {
    let best = 0;
    let bestIdx = 0;
    cards.forEach((c, i) => {
      const v = parseValue(c.estimatedValueRaw);
      if (v > best) { best = v; bestIdx = i; }
    });
    setBestPullIndex(bestIdx);
  }, [cards]);

  // Anticipation phase
  useEffect(() => {
    if (phase !== 'anticipation') return;
    const timer = setTimeout(() => {
      setPhase('revealing');
      setCurrentIndex(0);
    }, 1500);
    return () => clearTimeout(timer);
  }, [phase]);

  // Card reveal sequencing
  useEffect(() => {
    if (phase !== 'revealing' || currentIndex < 0 || currentIndex >= cards.length) return;

    const card = cards[currentIndex];
    const value = parseValue(card.estimatedValueRaw);
    const rarity = getRarity(value);
    const delay = getRevealDelay(rarity.label);

    const timer = setTimeout(() => {
      // Flip the card
      setFlippedCards(prev => new Set(prev).add(currentIndex));

      // Flash effect for rare+
      if (rarity.label !== 'COMMON' && rarity.label !== 'UNCOMMON') {
        setFlashColor(rarity.flash);
        setFlashActive(true);
        setTimeout(() => setFlashActive(false), 300);
      }

      // Move to next card or summary
      setTimeout(() => {
        if (currentIndex + 1 >= cards.length) {
          setPhase('summary');
        } else {
          setCurrentIndex(currentIndex + 1);
        }
      }, delay);
    }, 400); // Initial pause before flip

    return () => clearTimeout(timer);
  }, [phase, currentIndex, cards]);

  const totalValue = cards.reduce((s, c) => s + parseValue(c.estimatedValueRaw), 0);
  const profit = totalValue - packPrice;

  // ── Anticipation ──
  if (phase === 'anticipation') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        </div>
        <div className="relative z-10 text-center">
          <div className="w-24 h-32 bg-gradient-to-br from-emerald-800 to-emerald-950 border-2 border-emerald-600/50 rounded-xl mx-auto mb-6 flex items-center justify-center animate-bounce shadow-lg shadow-emerald-500/20">
            <span className="text-3xl">?</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Opening {packName}</h2>
          <p className="text-gray-400 text-sm animate-pulse">{cards.length} cards incoming...</p>
        </div>
      </div>
    );
  }

  // ── Revealing ──
  if (phase === 'revealing') {
    return (
      <div className="relative">
        {/* Screen flash overlay */}
        {flashActive && (
          <div className={`fixed inset-0 ${flashColor} opacity-20 z-50 pointer-events-none transition-opacity duration-300`} />
        )}

        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-white mb-1">
            Revealing... {flippedCards.size}/{cards.length}
          </h2>
          <div className="w-full max-w-xs mx-auto bg-gray-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${(flippedCards.size / cards.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {cards.map((card, i) => {
            const isFlipped = flippedCards.has(i);
            const isCurrent = i === currentIndex && !isFlipped;
            const value = parseValue(card.estimatedValueRaw);
            const rarity = getRarity(value);

            return (
              <div
                key={card.slug + '-' + i}
                className="perspective-500"
              >
                <div
                  className={`relative h-36 sm:h-44 transition-all duration-700 ${
                    isFlipped ? 'rotate-y-0' : 'rotate-y-180'
                  }`}
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(0deg)' : 'rotateY(180deg)',
                  }}
                >
                  {/* Card Back */}
                  <div
                    className={`absolute inset-0 rounded-xl border-2 flex items-center justify-center ${
                      isCurrent
                        ? 'border-emerald-400 bg-gradient-to-br from-emerald-900 to-emerald-950 animate-pulse shadow-lg shadow-emerald-500/30'
                        : i > (currentIndex === -1 ? 0 : currentIndex)
                          ? 'border-gray-700 bg-gray-800/60'
                          : 'border-gray-700 bg-gray-800/60'
                    }`}
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                  >
                    <div className="text-center">
                      <span className="text-2xl">{isCurrent ? '...' : '?'}</span>
                      {!isCurrent && i > currentIndex && (
                        <p className="text-xs text-gray-600 mt-1">Card {i + 1}</p>
                      )}
                    </div>
                  </div>

                  {/* Card Front */}
                  <div
                    className={`absolute inset-0 rounded-xl border-2 ${rarity.bg} overflow-hidden ${
                      isFlipped && rarity.glow ? `shadow-lg ${rarity.glow}` : ''
                    }`}
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <div className="p-3 sm:p-4 h-full flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between mb-1.5">
                          <p className="text-white font-bold text-xs sm:text-sm leading-tight flex-1 min-w-0 truncate">
                            {card.player}
                          </p>
                        </div>
                        <p className="text-gray-400 text-xs truncate">{card.year} {card.set}</p>
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${rarity.bg} ${rarity.color}`}>
                            {rarity.label}
                          </span>
                          {card.rookie && (
                            <span className="text-xs bg-amber-900/40 text-amber-400 px-1.5 py-0.5 rounded border border-amber-800/50">RC</span>
                          )}
                        </div>
                        <p className="text-emerald-400 font-bold text-sm mt-1.5">{card.estimatedValueRaw}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Summary ──
  const bestPull = bestPullIndex >= 0 ? cards[bestPullIndex] : null;
  const bestPullValue = bestPull ? parseValue(bestPull.estimatedValueRaw) : 0;
  const bestRarity = getRarity(bestPullValue);
  const rarityCounts = { COMMON: 0, UNCOMMON: 0, RARE: 0, 'ULTRA RARE': 0, LEGENDARY: 0 };
  cards.forEach(c => {
    const r = getRarity(parseValue(c.estimatedValueRaw));
    rarityCounts[r.label]++;
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Best Pull Showcase */}
      {bestPull && bestPullValue >= 200 && (
        <div className={`text-center p-6 rounded-2xl border-2 ${bestRarity.bg} ${bestRarity.glow ? `shadow-xl ${bestRarity.glow}` : ''}`}>
          <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Best Pull</p>
          <p className={`text-xl font-bold ${bestRarity.color} mb-1`}>{bestPull.player}</p>
          <p className="text-gray-400 text-sm">{bestPull.year} {bestPull.set}</p>
          <div className="flex items-center justify-center gap-3 mt-3">
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${bestRarity.bg} ${bestRarity.color}`}>
              {bestRarity.label}
            </span>
            {bestPull.rookie && (
              <span className="text-xs bg-amber-900/40 text-amber-400 px-1.5 py-0.5 rounded border border-amber-800/50">ROOKIE</span>
            )}
          </div>
          <p className="text-emerald-400 font-bold text-2xl mt-3">{bestPull.estimatedValueRaw}</p>
        </div>
      )}

      {/* Pack Summary */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
        <h3 className="text-lg font-bold text-white mb-4">Pack Summary</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-800/40 rounded-lg">
            <p className="text-gray-500 text-xs mb-1">Total Value</p>
            <p className="text-emerald-400 font-bold text-xl">{formatCurrency(totalValue)}</p>
          </div>
          <div className="text-center p-3 bg-gray-800/40 rounded-lg">
            <p className="text-gray-500 text-xs mb-1">Profit / Loss</p>
            <p className={`font-bold text-xl ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {profit >= 0 ? '+' : ''}{formatCurrency(profit)}
            </p>
          </div>
        </div>

        {/* Rarity breakdown */}
        <div className="flex flex-wrap gap-2 text-xs">
          {rarityCounts.LEGENDARY > 0 && <span className="text-yellow-300 bg-yellow-500/10 px-2 py-1 rounded">{rarityCounts.LEGENDARY}x Legendary</span>}
          {rarityCounts['ULTRA RARE'] > 0 && <span className="text-red-300 bg-red-500/10 px-2 py-1 rounded">{rarityCounts['ULTRA RARE']}x Ultra Rare</span>}
          {rarityCounts.RARE > 0 && <span className="text-purple-300 bg-purple-500/10 px-2 py-1 rounded">{rarityCounts.RARE}x Rare</span>}
          {rarityCounts.UNCOMMON > 0 && <span className="text-blue-300 bg-blue-500/10 px-2 py-1 rounded">{rarityCounts.UNCOMMON}x Uncommon</span>}
          {rarityCounts.COMMON > 0 && <span className="text-gray-400 bg-gray-500/10 px-2 py-1 rounded">{rarityCounts.COMMON}x Common</span>}
        </div>
      </div>

      {/* All cards */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-800">
          <h3 className="text-white font-semibold text-sm">All {cards.length} Cards</h3>
        </div>
        <div className="divide-y divide-gray-800/60">
          {cards
            .map((card, i) => ({ card, idx: i, value: parseValue(card.estimatedValueRaw) }))
            .sort((a, b) => b.value - a.value)
            .map(({ card, value }) => {
              const rarity = getRarity(value);
              return (
                <div key={card.slug} className="px-5 py-3 flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-sm font-medium truncate">{card.player}</p>
                    <p className="text-gray-500 text-xs">{card.year} {card.set}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${rarity.bg} ${rarity.color}`}>
                      {rarity.label}
                    </span>
                    <span className="text-emerald-400 font-bold text-sm">{card.estimatedValueRaw}</span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onComplete}
          className="flex-1 py-3 rounded-xl bg-gray-800 text-gray-300 font-medium text-sm hover:bg-gray-700 transition-colors"
        >
          Back to Store
        </button>
        {onBuyAnother && (
          <button
            onClick={onBuyAnother}
            className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-500 transition-colors"
          >
            Open Another Pack
          </button>
        )}
      </div>
    </div>
  );
}
