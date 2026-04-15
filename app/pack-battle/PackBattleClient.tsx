'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { sealedProducts, type SealedProduct, type HitRate } from '@/data/sealed-products';

/* ───── Types ───── */
type Sport = 'all' | 'baseball' | 'basketball' | 'football' | 'hockey' | 'pokemon';

interface Pull {
  insert: string;
  value: number;
  description: string;
}

interface BattleResult {
  product: SealedProduct;
  pulls: Pull[];
  totalValue: number;
  bestPull: Pull | null;
  hitCount: number;
}

interface BattleHistory {
  left: BattleResult;
  right: BattleResult;
  winner: 'left' | 'right' | 'tie';
}

/* ───── Helpers ───── */
function parseOdds(odds: string): number {
  const match = odds.match(/1:(\d+)/);
  return match ? parseInt(match[1], 10) : 24;
}

function simulateBox(product: SealedProduct): BattleResult {
  const pulls: Pull[] = [];
  const totalPacks = product.packsPerBox;

  for (let pack = 0; pack < totalPacks; pack++) {
    for (const hr of product.hitRates) {
      const odds = parseOdds(hr.odds);
      if (Math.random() < 1 / odds) {
        // Randomize value around the average (+/- 60%)
        const variance = 0.4 + Math.random() * 1.2;
        const value = Math.round(hr.avgValue * variance * 100) / 100;
        pulls.push({
          insert: hr.insert,
          value,
          description: hr.description,
        });
      }
    }
  }

  // Add base card value
  pulls.unshift({
    insert: 'Base Cards',
    value: product.baseCardValue,
    description: `${product.totalCards} base cards at average market value`,
  });

  const totalValue = pulls.reduce((sum, p) => sum + p.value, 0);
  const hitPulls = pulls.filter(p => p.insert !== 'Base Cards');
  const bestPull = hitPulls.length > 0
    ? hitPulls.reduce((best, p) => p.value > best.value ? p : best, hitPulls[0])
    : null;

  return {
    product,
    pulls,
    totalValue: Math.round(totalValue * 100) / 100,
    bestPull,
    hitCount: hitPulls.length,
  };
}

/* ───── Sport filter ───── */
const sportTabs: { value: Sport; label: string; icon: string }[] = [
  { value: 'all', label: 'All', icon: '🃏' },
  { value: 'baseball', label: 'Baseball', icon: '⚾' },
  { value: 'basketball', label: 'Basketball', icon: '🏀' },
  { value: 'football', label: 'Football', icon: '🏈' },
  { value: 'hockey', label: 'Hockey', icon: '🏒' },
  { value: 'pokemon', label: 'Pokemon', icon: '⚡' },
];

/* ───── Component ───── */
export default function PackBattleClient() {
  const [sportFilter, setSportFilter] = useState<Sport>('all');
  const [leftSlug, setLeftSlug] = useState('');
  const [rightSlug, setRightSlug] = useState('');
  const [history, setHistory] = useState<BattleHistory[]>([]);
  const [currentBattle, setCurrentBattle] = useState<BattleHistory | null>(null);
  const [animating, setAnimating] = useState(false);

  const filteredProducts = useMemo(
    () => sportFilter === 'all' ? sealedProducts : sealedProducts.filter(p => p.sport === sportFilter),
    [sportFilter],
  );

  const leftProduct = sealedProducts.find(p => p.slug === leftSlug);
  const rightProduct = sealedProducts.find(p => p.slug === rightSlug);

  const stats = useMemo(() => {
    if (history.length === 0) return null;
    const leftWins = history.filter(h => h.winner === 'left').length;
    const rightWins = history.filter(h => h.winner === 'right').length;
    const ties = history.filter(h => h.winner === 'tie').length;
    const leftAvg = history.reduce((s, h) => s + h.left.totalValue, 0) / history.length;
    const rightAvg = history.reduce((s, h) => s + h.right.totalValue, 0) / history.length;
    return { leftWins, rightWins, ties, leftAvg, rightAvg, total: history.length };
  }, [history]);

  function runBattle() {
    if (!leftProduct || !rightProduct) return;
    setAnimating(true);

    setTimeout(() => {
      const left = simulateBox(leftProduct);
      const right = simulateBox(rightProduct);
      const winner = left.totalValue > right.totalValue ? 'left' as const
        : right.totalValue > left.totalValue ? 'right' as const
        : 'tie' as const;
      const battle: BattleHistory = { left, right, winner };
      setCurrentBattle(battle);
      setHistory(prev => [battle, ...prev].slice(0, 20));
      setAnimating(false);
    }, 800);
  }

  function resetBattle() {
    setCurrentBattle(null);
    setHistory([]);
  }

  return (
    <div className="space-y-8">
      {/* Sport filter */}
      <div className="flex flex-wrap gap-2">
        {sportTabs.map(s => (
          <button
            key={s.value}
            onClick={() => { setSportFilter(s.value); setLeftSlug(''); setRightSlug(''); setCurrentBattle(null); setHistory([]); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              sportFilter === s.value
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-700/60 text-gray-300 hover:bg-gray-600/60'
            }`}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {/* Product selection — side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left product */}
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-3">Challenger A</h3>
          <select
            value={leftSlug}
            onChange={e => { setLeftSlug(e.target.value); setCurrentBattle(null); setHistory([]); }}
            className="w-full px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
          >
            <option value="">Select a product...</option>
            {filteredProducts.map(p => (
              <option key={p.slug} value={p.slug} disabled={p.slug === rightSlug}>
                {p.name} (${p.retailPrice})
              </option>
            ))}
          </select>
          {leftProduct && (
            <div className="mt-3 text-xs text-gray-400 space-y-1">
              <p>{leftProduct.packsPerBox} packs &middot; {leftProduct.cardsPerPack} cards/pack &middot; ${leftProduct.retailPrice}</p>
              <p>{leftProduct.hitRates.length} insert types</p>
            </div>
          )}
        </div>

        {/* Right product */}
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-3">Challenger B</h3>
          <select
            value={rightSlug}
            onChange={e => { setRightSlug(e.target.value); setCurrentBattle(null); setHistory([]); }}
            className="w-full px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
          >
            <option value="">Select a product...</option>
            {filteredProducts.map(p => (
              <option key={p.slug} value={p.slug} disabled={p.slug === leftSlug}>
                {p.name} (${p.retailPrice})
              </option>
            ))}
          </select>
          {rightProduct && (
            <div className="mt-3 text-xs text-gray-400 space-y-1">
              <p>{rightProduct.packsPerBox} packs &middot; {rightProduct.cardsPerPack} cards/pack &middot; ${rightProduct.retailPrice}</p>
              <p>{rightProduct.hitRates.length} insert types</p>
            </div>
          )}
        </div>
      </div>

      {/* Battle button */}
      <div className="text-center">
        <button
          onClick={runBattle}
          disabled={!leftProduct || !rightProduct || animating}
          className={`px-8 py-4 rounded-xl text-lg font-bold transition-all ${
            !leftProduct || !rightProduct || animating
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-red-600 to-blue-600 text-white hover:from-red-500 hover:to-blue-500 shadow-lg hover:shadow-xl transform hover:scale-105'
          }`}
        >
          {animating ? 'Opening...' : currentBattle ? 'Battle Again!' : 'BATTLE!'}
        </button>
        {history.length > 0 && (
          <button
            onClick={resetBattle}
            className="ml-4 px-4 py-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      {/* Battle results */}
      {currentBattle && (
        <div className="space-y-6">
          {/* Winner banner */}
          <div className={`text-center py-4 rounded-xl border ${
            currentBattle.winner === 'left'
              ? 'bg-red-950/40 border-red-800/40'
              : currentBattle.winner === 'right'
                ? 'bg-blue-950/40 border-blue-800/40'
                : 'bg-gray-800/50 border-gray-700/50'
          }`}>
            <p className="text-2xl font-bold text-white">
              {currentBattle.winner === 'tie' ? 'TIE!' : (
                <>
                  {currentBattle.winner === 'left' ? currentBattle.left.product.name : currentBattle.right.product.name}
                  <span className="text-emerald-400"> WINS!</span>
                </>
              )}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              ${currentBattle.left.totalValue.toFixed(2)} vs ${currentBattle.right.totalValue.toFixed(2)}
              {currentBattle.winner !== 'tie' && (
                <> &middot; ${Math.abs(currentBattle.left.totalValue - currentBattle.right.totalValue).toFixed(2)} difference</>
              )}
            </p>
          </div>

          {/* Side-by-side results */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { result: currentBattle.left, color: 'red', side: 'left' as const },
              { result: currentBattle.right, color: 'blue', side: 'right' as const },
            ].map(({ result, color, side }) => (
              <div
                key={side}
                className={`rounded-xl border p-5 ${
                  currentBattle.winner === side
                    ? `bg-${color}-950/30 border-${color}-800/40`
                    : 'bg-gray-800/50 border-gray-700/50'
                }`}
                style={currentBattle.winner === side ? {
                  backgroundColor: color === 'red' ? 'rgba(69, 10, 10, 0.3)' : 'rgba(10, 10, 69, 0.3)',
                  borderColor: color === 'red' ? 'rgba(153, 27, 27, 0.4)' : 'rgba(30, 58, 138, 0.4)',
                } : undefined}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-white truncate">{result.product.name}</h4>
                  {currentBattle.winner === side && (
                    <span className="text-xs bg-emerald-600 text-white px-2 py-0.5 rounded-full shrink-0 ml-2">WINNER</span>
                  )}
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-emerald-400">${result.totalValue.toFixed(0)}</p>
                    <p className="text-xs text-gray-500">Total Value</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-white">{result.hitCount}</p>
                    <p className="text-xs text-gray-500">Hits</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-yellow-400">
                      {result.totalValue > result.product.retailPrice ? '+' : ''}
                      {((result.totalValue / result.product.retailPrice - 1) * 100).toFixed(0)}%
                    </p>
                    <p className="text-xs text-gray-500">ROI</p>
                  </div>
                </div>

                {/* Pulls list */}
                <div className="space-y-1.5">
                  {result.pulls.map((pull, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5 px-2 rounded bg-gray-900/40 text-xs">
                      <span className={`font-medium ${pull.insert === 'Base Cards' ? 'text-gray-400' : 'text-white'}`}>
                        {pull.insert}
                      </span>
                      <span className="text-emerald-400 font-mono">${pull.value.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {result.bestPull && (
                  <div className="mt-3 pt-3 border-t border-gray-700/50 text-xs text-gray-400">
                    Best Pull: <span className="text-yellow-400">{result.bestPull.insert}</span> (${result.bestPull.value.toFixed(2)})
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Battle history / stats */}
      {stats && stats.total > 1 && (
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Battle Record ({stats.total} battles)
          </h3>
          <div className="grid grid-cols-5 gap-4 text-center mb-4">
            <div>
              <p className="text-xl font-bold text-red-400">{stats.leftWins}</p>
              <p className="text-xs text-gray-400 truncate">{leftProduct?.name.split(' ').slice(0, 3).join(' ')}</p>
            </div>
            <div>
              <p className="text-xl font-bold text-gray-400">{stats.ties}</p>
              <p className="text-xs text-gray-400">Ties</p>
            </div>
            <div>
              <p className="text-xl font-bold text-blue-400">{stats.rightWins}</p>
              <p className="text-xs text-gray-400 truncate">{rightProduct?.name.split(' ').slice(0, 3).join(' ')}</p>
            </div>
            <div>
              <p className="text-xl font-bold text-white">${stats.leftAvg.toFixed(0)}</p>
              <p className="text-xs text-gray-400">Avg Value A</p>
            </div>
            <div>
              <p className="text-xl font-bold text-white">${stats.rightAvg.toFixed(0)}</p>
              <p className="text-xs text-gray-400">Avg Value B</p>
            </div>
          </div>

          {/* Win bar */}
          <div className="h-4 bg-gray-700 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-red-500 transition-all"
              style={{ width: `${(stats.leftWins / stats.total) * 100}%` }}
            />
            <div
              className="h-full bg-gray-500 transition-all"
              style={{ width: `${(stats.ties / stats.total) * 100}%` }}
            />
            <div
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${(stats.rightWins / stats.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Related */}
      <section className="pt-8 border-t border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">Related</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/tools/pack-sim', label: 'Pack Simulator', icon: '🎰' },
            { href: '/tools/pack-odds', label: 'Pack Odds Calculator', icon: '🎲' },
            { href: '/tools/sealed-ev', label: 'Sealed Product EV', icon: '📦' },
            { href: '/tools/wax-vs-singles', label: 'Wax vs Singles', icon: '🃏' },
            { href: '/tools/box-break', label: 'Box Break Calculator', icon: '📦' },
            { href: '/tools/mystery-pack', label: 'Mystery Repack Sim', icon: '🎲' },
            { href: '/tools/daily-pack', label: 'Daily Free Pack', icon: '🎁' },
            { href: '/packs', label: 'Pack Store', icon: '🏪' },
          ].map(t => (
            <Link
              key={t.href}
              href={t.href}
              className="flex items-center gap-2 px-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 rounded-xl text-sm text-gray-300 hover:text-white transition-colors"
            >
              <span>{t.icon}</span>
              <span className="truncate">{t.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
