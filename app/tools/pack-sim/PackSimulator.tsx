'use client';

import { useState, useMemo, useCallback } from 'react';
import { sealedProducts } from '@/data/sealed-products';
import type { SealedProduct, HitRate } from '@/data/sealed-products';

// ─── Types ───────────────────────────────────────────────────────────

interface PulledCard {
  type: 'base' | 'hit';
  label: string;
  value: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'ultra-rare';
  description: string;
}

interface PackResult {
  packNumber: number;
  cards: PulledCard[];
}

interface BoxResult {
  product: SealedProduct;
  packs: PackResult[];
  totalValue: number;
  bestPull: PulledCard | null;
  hitCount: number;
  timestamp: number;
}

// ─── Constants ───────────────────────────────────────────────────────

const sportLabels: Record<string, string> = {
  baseball: 'Baseball', basketball: 'Basketball', football: 'Football',
  hockey: 'Hockey', pokemon: 'Pokemon',
};

const sportEmoji: Record<string, string> = {
  baseball: '\u26BE', basketball: '\uD83C\uDFC0', football: '\uD83C\uDFC8',
  hockey: '\uD83C\uDFD2', pokemon: '\u26A1',
};

const typeLabels: Record<string, string> = {
  'hobby-box': 'Hobby Box', 'blaster': 'Blaster', 'mega-box': 'Mega Box',
  'hanger': 'Hanger', 'fat-pack': 'Fat Pack', 'etb': 'Elite Trainer Box',
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

// ─── Simulation Logic ────────────────────────────────────────────────

function parseOdds(odds: string): number {
  // "1:12 packs" → 1/12 = 0.0833
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

function simulateBox(product: SealedProduct): BoxResult {
  const packs: PackResult[] = [];
  let totalValue = 0;
  let bestPull: PulledCard | null = null;
  let hitCount = 0;

  // Distribute base card value across packs
  const baseValuePerPack = product.baseCardValue / product.packsPerBox;

  for (let p = 0; p < product.packsPerBox; p++) {
    const cards: PulledCard[] = [];

    // Simulate hits for this pack
    for (const hit of product.hitRates) {
      const prob = parseOdds(hit.odds);
      if (Math.random() < prob) {
        // Hit! Add some variance to value (+/- 50%)
        const variance = 0.5 + Math.random();
        const value = Math.round(hit.avgValue * variance);
        const card: PulledCard = {
          type: 'hit',
          label: hit.insert,
          value,
          rarity: getRarityFromValue(value),
          description: hit.description,
        };
        cards.push(card);
        totalValue += value;
        hitCount++;
        if (!bestPull || value > bestPull.value) bestPull = card;
      }
    }

    // Fill remaining slots with base cards
    const hitSlots = cards.length;
    const baseSlots = Math.max(1, product.cardsPerPack - hitSlots);
    const basePerCard = baseValuePerPack / product.cardsPerPack;

    for (let c = 0; c < baseSlots; c++) {
      const variance = 0.3 + Math.random() * 1.4;
      const value = Math.round(basePerCard * variance * 100) / 100;
      cards.push({
        type: 'base',
        label: 'Base Card',
        value: Math.max(0.01, value),
        rarity: 'common',
        description: 'Standard base card from the set checklist',
      });
      totalValue += value;
    }

    packs.push({ packNumber: p + 1, cards });
  }

  return {
    product,
    packs,
    totalValue: Math.round(totalValue * 100) / 100,
    bestPull,
    hitCount,
    timestamp: Date.now(),
  };
}

// ─── Components ──────────────────────────────────────────────────────

function ProductCard({ product, onSelect, selected }: { product: SealedProduct; onSelect: (p: SealedProduct) => void; selected: boolean }) {
  return (
    <button
      onClick={() => onSelect(product)}
      className={`w-full text-left p-4 rounded-xl border transition-all ${
        selected
          ? 'border-yellow-500 bg-yellow-950/20 ring-1 ring-yellow-500/50'
          : 'border-gray-800 bg-gray-900/50 hover:border-gray-600'
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{sportEmoji[product.sport]}</span>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">
          {typeLabels[product.type]}
        </span>
      </div>
      <h3 className="font-semibold text-white text-sm leading-tight mt-1">{product.name}</h3>
      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
        <span>${product.retailPrice}</span>
        <span>{product.packsPerBox} packs</span>
        <span>{product.cardsPerPack} cards/pack</span>
      </div>
    </button>
  );
}

function CardReveal({ card, index, revealed }: { card: PulledCard; index: number; revealed: boolean }) {
  return (
    <div
      className={`transition-all duration-500 ${
        revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
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

function ResultsSummary({ result, onShare, onReset }: { result: BoxResult; onShare: () => void; onReset: () => void }) {
  const roi = ((result.totalValue - result.product.retailPrice) / result.product.retailPrice * 100).toFixed(0);
  const isProfit = result.totalValue >= result.product.retailPrice;

  return (
    <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6 mb-8">
      <h3 className="text-xl font-bold text-white mb-4">Box Results</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider">Total Value</p>
          <p className={`text-2xl font-bold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
            ${result.totalValue.toFixed(0)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider">Box Cost</p>
          <p className="text-2xl font-bold text-white">${result.product.retailPrice}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider">ROI</p>
          <p className={`text-2xl font-bold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
            {isProfit ? '+' : ''}{roi}%
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider">Hits</p>
          <p className="text-2xl font-bold text-purple-400">{result.hitCount}</p>
        </div>
      </div>

      {result.bestPull && (
        <div className="bg-yellow-950/20 border border-yellow-700/30 rounded-lg p-3 mb-4">
          <p className="text-xs text-yellow-500 uppercase tracking-wider font-bold mb-1">Best Pull</p>
          <p className="text-white font-semibold">{result.bestPull.label}</p>
          <p className="text-green-400 font-bold">${result.bestPull.value.toFixed(0)}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onReset}
          className="flex-1 py-3 px-4 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold hover:from-yellow-400 hover:to-orange-400 transition-all"
        >
          Open Another Box
        </button>
        <button
          onClick={onShare}
          className="py-3 px-4 rounded-lg border border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white transition-colors font-medium"
        >
          Share Results
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────

export default function PackSimulator() {
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<SealedProduct | null>(null);
  const [boxResult, setBoxResult] = useState<BoxResult | null>(null);
  const [currentPack, setCurrentPack] = useState(0);
  const [revealedPacks, setRevealedPacks] = useState<Set<number>>(new Set());
  const [isOpening, setIsOpening] = useState(false);
  const [copied, setCopied] = useState(false);

  const sports = useMemo(() => [...new Set(sealedProducts.map(p => p.sport))], []);

  const filteredProducts = useMemo(() => {
    if (selectedSport === 'all') return sealedProducts;
    return sealedProducts.filter(p => p.sport === selectedSport);
  }, [selectedSport]);

  const handleOpenBox = useCallback(() => {
    if (!selectedProduct) return;
    setIsOpening(true);
    setRevealedPacks(new Set());
    setCurrentPack(0);

    // Simulate the box
    const result = simulateBox(selectedProduct);
    setBoxResult(result);

    // Auto-reveal first pack after a short delay
    setTimeout(() => {
      setRevealedPacks(new Set([0]));
      setCurrentPack(0);
      setIsOpening(false);
    }, 600);
  }, [selectedProduct]);

  const handleRevealPack = useCallback((packIndex: number) => {
    setRevealedPacks(prev => new Set([...prev, packIndex]));
    setCurrentPack(packIndex);
  }, []);

  const handleRevealAll = useCallback(() => {
    if (!boxResult) return;
    const all = new Set(boxResult.packs.map((_, i) => i));
    setRevealedPacks(all);
  }, [boxResult]);

  const handleShare = useCallback(() => {
    if (!boxResult) return;
    const data = {
      p: boxResult.product.slug,
      v: boxResult.totalValue.toFixed(0),
      h: boxResult.hitCount,
      b: boxResult.bestPull ? `${boxResult.bestPull.label}|${boxResult.bestPull.value.toFixed(0)}` : '',
    };
    const encoded = btoa(JSON.stringify(data));
    const url = `${window.location.origin}/tools/pack-sim?r=${encoded}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [boxResult]);

  const handleReset = useCallback(() => {
    setBoxResult(null);
    setRevealedPacks(new Set());
    setCurrentPack(0);
  }, []);

  // ─── Render: Product Selection ─────────────────────────────────────

  if (!boxResult) {
    return (
      <div>
        {/* Sport Filter */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          <button
            onClick={() => setSelectedSport('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedSport === 'all' ? 'bg-white text-black' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            All Sports
          </button>
          {sports.map(sport => (
            <button
              key={sport}
              onClick={() => setSelectedSport(sport)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedSport === sport ? 'bg-white text-black' : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {sportEmoji[sport]} {sportLabels[sport]}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.slug}
              product={product}
              onSelect={setSelectedProduct}
              selected={selectedProduct?.slug === product.slug}
            />
          ))}
        </div>

        {/* Open Box Button */}
        {selectedProduct && (
          <div className="text-center">
            <div className="inline-block bg-gray-900/80 border border-gray-800 rounded-xl p-6 mb-4">
              <p className="text-gray-400 text-sm mb-2">Selected Product:</p>
              <p className="text-white font-bold text-lg mb-1">{selectedProduct.name}</p>
              <p className="text-gray-400 text-sm">
                {selectedProduct.packsPerBox} packs &middot; {selectedProduct.cardsPerPack} cards per pack &middot; ${selectedProduct.retailPrice}
              </p>
            </div>
            <div>
              <button
                onClick={handleOpenBox}
                disabled={isOpening}
                className="py-4 px-8 rounded-xl bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-black font-extrabold text-lg hover:from-yellow-400 hover:via-orange-400 hover:to-red-400 transition-all transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              >
                {isOpening ? 'Opening...' : 'RIP IT OPEN!'}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── Render: Box Results ───────────────────────────────────────────

  const allRevealed = revealedPacks.size === boxResult.packs.length;

  return (
    <div>
      <ResultsSummary result={boxResult} onShare={handleShare} onReset={handleReset} />

      {copied && (
        <div className="fixed bottom-4 right-4 bg-green-900/90 border border-green-700 text-green-300 px-4 py-2 rounded-lg text-sm z-50">
          Link copied to clipboard!
        </div>
      )}

      {/* Pack Navigation */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">
          Packs ({revealedPacks.size} / {boxResult.packs.length} opened)
        </h3>
        {!allRevealed && (
          <button
            onClick={handleRevealAll}
            className="text-sm text-yellow-500 hover:text-yellow-400 font-medium"
          >
            Reveal All Packs
          </button>
        )}
      </div>

      {/* Pack Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2 mb-8">
        {boxResult.packs.map((pack, i) => {
          const isRevealed = revealedPacks.has(i);
          const isCurrent = currentPack === i;
          const hasHit = pack.cards.some(c => c.type === 'hit');

          return (
            <button
              key={i}
              onClick={() => {
                if (!isRevealed) handleRevealPack(i);
                setCurrentPack(i);
              }}
              className={`aspect-[3/4] rounded-lg border-2 flex flex-col items-center justify-center text-xs font-bold transition-all ${
                isCurrent && isRevealed
                  ? hasHit
                    ? 'border-yellow-500 bg-yellow-950/30 text-yellow-400 ring-2 ring-yellow-500/50'
                    : 'border-white bg-gray-800 text-white ring-2 ring-white/50'
                  : isRevealed
                    ? hasHit
                      ? 'border-yellow-700/50 bg-yellow-950/20 text-yellow-500'
                      : 'border-gray-700 bg-gray-900 text-gray-400'
                    : 'border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 text-gray-500 hover:border-yellow-600 hover:text-yellow-500 cursor-pointer'
              }`}
            >
              {isRevealed ? (
                <>
                  <span className="text-[10px]">Pack</span>
                  <span>{i + 1}</span>
                  {hasHit && <span className="text-[9px] mt-0.5">HIT</span>}
                </>
              ) : (
                <>
                  <span className="text-lg">?</span>
                  <span className="text-[9px] mt-0.5">#{i + 1}</span>
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* Current Pack Cards */}
      {revealedPacks.has(currentPack) && (
        <div>
          <h3 className="text-lg font-bold text-white mb-3">
            Pack {currentPack + 1}
            {boxResult.packs[currentPack].cards.some(c => c.type === 'hit') && (
              <span className="ml-2 text-sm text-yellow-400">Contains Hits!</span>
            )}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {/* Show hits first, then base cards */}
            {[
              ...boxResult.packs[currentPack].cards.filter(c => c.type === 'hit'),
              ...boxResult.packs[currentPack].cards.filter(c => c.type === 'base'),
            ].map((card, i) => (
              <CardReveal key={i} card={card} index={i} revealed={true} />
            ))}
          </div>
        </div>
      )}

      {/* Hits Summary */}
      {allRevealed && boxResult.hitCount > 0 && (
        <div className="mt-8 bg-gray-900/80 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">All Hits ({boxResult.hitCount})</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {boxResult.packs.flatMap(pack =>
              pack.cards.filter(c => c.type === 'hit')
            ).sort((a, b) => b.value - a.value).map((card, i) => (
              <CardReveal key={i} card={card} index={0} revealed={true} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
