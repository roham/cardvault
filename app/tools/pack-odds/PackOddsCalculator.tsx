'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { sealedProducts } from '@/data/sealed-products';

/* ───── Types ───── */
type Sport = 'all' | 'baseball' | 'basketball' | 'football' | 'hockey' | 'pokemon';

interface OddsResult {
  perPack: number;
  perBox: number;
  perCase: number;
  packsFor50: number;
  packsFor90: number;
  packsFor99: number;
  boxesFor50: number;
  boxesFor90: number;
  boxesFor99: number;
  costFor50: number;
  costFor90: number;
  costFor99: number;
}

/* ───── Helpers ───── */
function parseOdds(odds: string): number {
  // "1:24 packs" → 24, "1:12 packs" → 12, "1:3 packs" → 3
  const match = odds.match(/1:(\d+)/);
  return match ? parseInt(match[1], 10) : 24;
}

function calcProbability(perPackOdds: number, numPacks: number): number {
  // P(at least 1) = 1 - (1 - 1/odds)^packs
  return 1 - Math.pow(1 - 1 / perPackOdds, numPacks);
}

function packsNeededForConfidence(perPackOdds: number, confidence: number): number {
  // n = log(1 - confidence) / log(1 - 1/odds)
  return Math.ceil(Math.log(1 - confidence) / Math.log(1 - 1 / perPackOdds));
}

function formatPct(n: number): string {
  if (n >= 0.999) return '99.9%+';
  if (n < 0.001) return '<0.1%';
  if (n < 0.01) return (n * 100).toFixed(2) + '%';
  return (n * 100).toFixed(1) + '%';
}

function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 10000) return (n / 1000).toFixed(1) + 'K';
  if (n >= 1000) return n.toLocaleString();
  return n.toString();
}

function formatCurrency(n: number): string {
  if (n >= 1000000) return '$' + (n / 1000000).toFixed(1) + 'M';
  if (n >= 10000) return '$' + (n / 1000).toFixed(1) + 'K';
  return '$' + n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

/* ───── Sport tabs ───── */
const sportTabs: { value: Sport; label: string; icon: string }[] = [
  { value: 'all', label: 'All', icon: '🃏' },
  { value: 'baseball', label: 'Baseball', icon: '⚾' },
  { value: 'basketball', label: 'Basketball', icon: '🏀' },
  { value: 'football', label: 'Football', icon: '🏈' },
  { value: 'hockey', label: 'Hockey', icon: '🏒' },
  { value: 'pokemon', label: 'Pokemon', icon: '⚡' },
];

/* ───── Component ───── */
export default function PackOddsCalculator() {
  const [sportFilter, setSportFilter] = useState<Sport>('all');
  const [selectedProductSlug, setSelectedProductSlug] = useState('');
  const [selectedInsertIdx, setSelectedInsertIdx] = useState(0);
  const [customOdds, setCustomOdds] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [specificCardFactor, setSpecificCardFactor] = useState(1);

  const filteredProducts = useMemo(
    () => sportFilter === 'all' ? sealedProducts : sealedProducts.filter(p => p.sport === sportFilter),
    [sportFilter],
  );

  const selectedProduct = useMemo(
    () => sealedProducts.find(p => p.slug === selectedProductSlug),
    [selectedProductSlug],
  );

  const selectedInsert = selectedProduct?.hitRates[selectedInsertIdx];

  // Calculate odds
  const results: OddsResult | null = useMemo(() => {
    if (!selectedProduct) return null;
    let baseOdds: number;
    if (useCustom && customOdds) {
      baseOdds = parseInt(customOdds, 10);
      if (isNaN(baseOdds) || baseOdds < 1) return null;
    } else if (selectedInsert) {
      baseOdds = parseOdds(selectedInsert.odds);
    } else {
      return null;
    }

    // Apply specific card factor (e.g., 1 out of 50 possible auto subjects)
    const effectiveOdds = baseOdds * specificCardFactor;
    const packsPerBox = selectedProduct.packsPerBox;
    const packsPerCase = packsPerBox * 12; // standard case = 12 boxes
    const pricePerPack = selectedProduct.retailPrice / packsPerBox;

    const perPack = 1 / effectiveOdds;
    const perBox = calcProbability(effectiveOdds, packsPerBox);
    const perCase = calcProbability(effectiveOdds, packsPerCase);

    const packsFor50 = packsNeededForConfidence(effectiveOdds, 0.5);
    const packsFor90 = packsNeededForConfidence(effectiveOdds, 0.9);
    const packsFor99 = packsNeededForConfidence(effectiveOdds, 0.99);

    return {
      perPack,
      perBox,
      perCase,
      packsFor50,
      packsFor90,
      packsFor99,
      boxesFor50: Math.ceil(packsFor50 / packsPerBox),
      boxesFor90: Math.ceil(packsFor90 / packsPerBox),
      boxesFor99: Math.ceil(packsFor99 / packsPerBox),
      costFor50: Math.ceil(packsFor50 / packsPerBox) * selectedProduct.retailPrice,
      costFor90: Math.ceil(packsFor90 / packsPerBox) * selectedProduct.retailPrice,
      costFor99: Math.ceil(packsFor99 / packsPerBox) * selectedProduct.retailPrice,
    };
  }, [selectedProduct, selectedInsert, useCustom, customOdds, specificCardFactor]);

  return (
    <div className="space-y-8">
      {/* Step 1: Select Sport */}
      <section className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">1. Choose a Sport</h2>
        <div className="flex flex-wrap gap-2">
          {sportTabs.map(s => (
            <button
              key={s.value}
              onClick={() => { setSportFilter(s.value); setSelectedProductSlug(''); setSelectedInsertIdx(0); }}
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
      </section>

      {/* Step 2: Select Product */}
      <section className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">2. Select a Product</h2>
        {filteredProducts.length === 0 ? (
          <p className="text-gray-500 text-sm">No products available for this sport.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredProducts.map(p => (
              <button
                key={p.slug}
                onClick={() => { setSelectedProductSlug(p.slug); setSelectedInsertIdx(0); setUseCustom(false); }}
                className={`text-left p-4 rounded-lg border transition-colors ${
                  selectedProductSlug === p.slug
                    ? 'border-emerald-500 bg-emerald-950/40'
                    : 'border-gray-700/50 bg-gray-700/30 hover:border-gray-600'
                }`}
              >
                <p className="text-sm font-medium text-white truncate">{p.name}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {p.packsPerBox} packs &middot; {p.cardsPerPack} cards/pack &middot; ${p.retailPrice}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{p.hitRates.length} insert types</p>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Step 3: Select Insert Type */}
      {selectedProduct && (
        <section className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">3. What Are You Chasing?</h2>
          <div className="space-y-3">
            {selectedProduct.hitRates.map((hr, idx) => {
              const odds = parseOdds(hr.odds);
              return (
                <button
                  key={idx}
                  onClick={() => { setSelectedInsertIdx(idx); setUseCustom(false); }}
                  className={`w-full text-left p-4 rounded-lg border transition-colors ${
                    !useCustom && selectedInsertIdx === idx
                      ? 'border-emerald-500 bg-emerald-950/40'
                      : 'border-gray-700/50 bg-gray-700/30 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">{hr.insert}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{hr.description}</p>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="text-sm font-mono text-emerald-400">{hr.odds}</p>
                      <p className="text-xs text-gray-500">~${hr.avgValue} avg value</p>
                    </div>
                  </div>
                  {/* Mini probability bar */}
                  <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (1 / odds) * 100 * 10)}%` }}
                    />
                  </div>
                </button>
              );
            })}

            {/* Custom odds toggle */}
            <div className="pt-3 border-t border-gray-700/50">
              <button
                onClick={() => setUseCustom(!useCustom)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  useCustom
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-700/60 text-gray-300 hover:bg-gray-600/60'
                }`}
              >
                Custom Odds
              </button>
              {useCustom && (
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-gray-400 text-sm">1 :</span>
                  <input
                    type="number"
                    min={1}
                    value={customOdds}
                    onChange={e => setCustomOdds(e.target.value)}
                    placeholder="e.g. 48"
                    className="w-28 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-gray-400 text-sm">packs</span>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Step 4: Specific Card Factor */}
      {selectedProduct && (results || useCustom) && (
        <section className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-2">4. Targeting a Specific Card? (Optional)</h2>
          <p className="text-gray-400 text-xs mb-4">
            If you want a specific player&rsquo;s auto (not just any auto), set the checklist size below. For example, if there are 50 possible auto subjects, enter 50.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">1 out of</span>
              <input
                type="number"
                min={1}
                max={10000}
                value={specificCardFactor}
                onChange={e => setSpecificCardFactor(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-24 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
              />
              <span className="text-gray-400 text-sm">possible cards</span>
            </div>
            {specificCardFactor > 1 && (
              <button
                onClick={() => setSpecificCardFactor(1)}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                Reset to any card
              </button>
            )}
          </div>
          {/* Quick presets */}
          <div className="flex flex-wrap gap-2 mt-3">
            {[
              { label: 'Any card', value: 1 },
              { label: '1 of 10', value: 10 },
              { label: '1 of 25', value: 25 },
              { label: '1 of 50', value: 50 },
              { label: '1 of 100', value: 100 },
              { label: '1 of 200', value: 200 },
              { label: '1 of 500', value: 500 },
            ].map(p => (
              <button
                key={p.value}
                onClick={() => setSpecificCardFactor(p.value)}
                className={`px-3 py-1 rounded-md text-xs transition-colors ${
                  specificCardFactor === p.value
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-700/60 text-gray-400 hover:text-gray-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Results */}
      {results && selectedProduct && (
        <section className="space-y-6">
          {/* Hero probability */}
          <div className="bg-gradient-to-br from-emerald-950/60 to-gray-800/50 border border-emerald-800/40 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Your Odds</h2>

            {/* Three main stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-emerald-400">{formatPct(results.perPack)}</p>
                <p className="text-xs text-gray-400 mt-1">Per Pack</p>
              </div>
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-emerald-300">{formatPct(results.perBox)}</p>
                <p className="text-xs text-gray-400 mt-1">Per Box ({selectedProduct.packsPerBox} packs)</p>
              </div>
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-emerald-200">{formatPct(results.perCase)}</p>
                <p className="text-xs text-gray-400 mt-1">Per Case (12 boxes)</p>
              </div>
            </div>

            {/* Effective odds callout */}
            {specificCardFactor > 1 && (
              <div className="bg-gray-900/50 rounded-lg p-3 mb-4">
                <p className="text-xs text-gray-400">
                  Base insert odds multiplied by checklist factor: <span className="text-white font-mono">1:{parseOdds(useCustom ? `1:${customOdds}` : selectedInsert?.odds || '1:24')}</span>{' '}
                  &times; <span className="text-white font-mono">{specificCardFactor}</span>{' '}
                  = effective <span className="text-emerald-400 font-mono">1:{parseOdds(useCustom ? `1:${customOdds}` : selectedInsert?.odds || '1:24') * specificCardFactor}</span> per pack
                </p>
              </div>
            )}
          </div>

          {/* Confidence table */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">How Many Do You Need to Open?</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left text-gray-400 pb-3 pr-4">Confidence</th>
                    <th className="text-right text-gray-400 pb-3 px-4">Packs</th>
                    <th className="text-right text-gray-400 pb-3 px-4">Boxes</th>
                    <th className="text-right text-gray-400 pb-3 pl-4">Est. Cost</th>
                  </tr>
                </thead>
                <tbody className="text-white">
                  <tr className="border-b border-gray-700/50">
                    <td className="py-3 pr-4">
                      <span className="inline-flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-yellow-400" />
                        50% chance
                      </span>
                    </td>
                    <td className="text-right py-3 px-4 font-mono">{formatNumber(results.packsFor50)}</td>
                    <td className="text-right py-3 px-4 font-mono">{formatNumber(results.boxesFor50)}</td>
                    <td className="text-right py-3 pl-4 font-mono text-yellow-400">{formatCurrency(results.costFor50)}</td>
                  </tr>
                  <tr className="border-b border-gray-700/50">
                    <td className="py-3 pr-4">
                      <span className="inline-flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-orange-400" />
                        90% chance
                      </span>
                    </td>
                    <td className="text-right py-3 px-4 font-mono">{formatNumber(results.packsFor90)}</td>
                    <td className="text-right py-3 px-4 font-mono">{formatNumber(results.boxesFor90)}</td>
                    <td className="text-right py-3 pl-4 font-mono text-orange-400">{formatCurrency(results.costFor90)}</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">
                      <span className="inline-flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-400" />
                        99% chance
                      </span>
                    </td>
                    <td className="text-right py-3 px-4 font-mono">{formatNumber(results.packsFor99)}</td>
                    <td className="text-right py-3 px-4 font-mono">{formatNumber(results.boxesFor99)}</td>
                    <td className="text-right py-3 pl-4 font-mono text-red-400">{formatCurrency(results.costFor99)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Visual probability curve */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Probability Curve</h3>
            <p className="text-xs text-gray-400 mb-4">Chance of pulling at least one as you open more boxes</p>
            <div className="space-y-2">
              {[1, 2, 3, 5, 10, 20, 50].map(boxes => {
                const packs = boxes * selectedProduct.packsPerBox;
                const prob = calcProbability(
                  (parseOdds(useCustom ? `1:${customOdds}` : selectedInsert?.odds || '1:24')) * specificCardFactor,
                  packs,
                );
                return (
                  <div key={boxes} className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-16 text-right shrink-0">{boxes} box{boxes !== 1 ? 'es' : ''}</span>
                    <div className="flex-1 h-6 bg-gray-700/50 rounded-full overflow-hidden relative">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, prob * 100)}%`,
                          background: prob > 0.9 ? '#10b981' : prob > 0.5 ? '#f59e0b' : '#ef4444',
                        }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-mono text-white/90">
                        {formatPct(prob)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 w-20 shrink-0">{formatCurrency(boxes * selectedProduct.retailPrice)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Buy the single comparison */}
          {selectedInsert && (
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Should You Just Buy the Single?</h3>
              <p className="text-gray-400 text-sm mb-4">
                The average value of a <span className="text-white">{selectedInsert.insert}</span> from this product
                is <span className="text-emerald-400 font-mono">${selectedInsert.avgValue}</span>.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-red-950/30 border border-red-800/30 rounded-lg p-4">
                  <p className="text-sm font-medium text-red-300 mb-1">Ripping for It</p>
                  <p className="text-xl font-bold text-white">{formatCurrency(results.costFor90)}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Cost for 90% chance ({formatNumber(results.boxesFor90)} boxes)
                  </p>
                </div>
                <div className="bg-emerald-950/30 border border-emerald-800/30 rounded-lg p-4">
                  <p className="text-sm font-medium text-emerald-300 mb-1">Buying the Single</p>
                  <p className="text-xl font-bold text-white">${selectedInsert.avgValue}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Average market value (instant, guaranteed)
                  </p>
                </div>
              </div>
              {results.costFor90 > selectedInsert.avgValue * 2 && (
                <div className="mt-4 p-3 bg-yellow-950/30 border border-yellow-800/30 rounded-lg">
                  <p className="text-sm text-yellow-300">
                    <strong>Verdict:</strong> Buying the single saves you{' '}
                    <span className="font-mono">{formatCurrency(results.costFor90 - selectedInsert.avgValue)}</span>{' '}
                    ({((results.costFor90 / selectedInsert.avgValue - 1) * 100).toFixed(0)}x more expensive to rip).
                    Of course, ripping is more fun.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Pro tips */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Pro Tips</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: 'Odds are averages', tip: 'Published odds are long-run averages across millions of packs. Your individual experience will vary — streaks and droughts are normal.' },
                { title: 'Checklist size matters', tip: 'An auto checklist with 200 players means your odds of a specific player are 200x worse than "any auto." Always check the checklist.' },
                { title: 'Hobby vs retail', tip: 'Hobby boxes have guaranteed hits and better odds. Retail has exclusive parallels but lower hit rates and no guaranteed inserts.' },
                { title: 'Cost per hit', tip: 'Compare box price to expected number of hits. A $250 box with 2 guaranteed autos = $125/auto. A $30 blaster with no guarantees might be $300+/auto.' },
                { title: 'Don\'t chase, buy', tip: 'If you want a specific card, almost always cheaper to buy the single. Rip for the experience, not to target specific cards.' },
                { title: 'Case odds matter', tip: 'Some inserts are "1 per case" — that means 1:288 packs in a 24-pack product. Don\'t expect to hit these in a single box.' },
              ].map((t, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-emerald-400 text-lg mt-0.5 shrink-0">*</span>
                  <div>
                    <p className="text-sm font-medium text-white">{t.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{t.tip}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related tools */}
      <section className="pt-8 border-t border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">Related Tools</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/tools/pack-sim', label: 'Pack Simulator', icon: '🎰' },
            { href: '/tools/sealed-ev', label: 'Sealed Product EV', icon: '📦' },
            { href: '/tools/box-break', label: 'Box Break Calculator', icon: '📦' },
            { href: '/tools/wax-vs-singles', label: 'Wax vs Singles', icon: '🃏' },
            { href: '/tools/mystery-pack', label: 'Mystery Repack Sim', icon: '🎲' },
            { href: '/tools/daily-pack', label: 'Daily Free Pack', icon: '🎁' },
            { href: '/tools/break-even', label: 'Break-Even Calculator', icon: '📉' },
            { href: '/tools/subscription-boxes', label: 'Subscription Boxes', icon: '📬' },
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
