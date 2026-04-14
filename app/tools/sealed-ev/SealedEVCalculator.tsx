'use client';

import { useState, useMemo } from 'react';
import { sealedProducts, calculateEV } from '@/data/sealed-products';
import type { SealedProduct } from '@/data/sealed-products';

const sportLabels: Record<string, string> = {
  baseball: 'Baseball',
  basketball: 'Basketball',
  football: 'Football',
  hockey: 'Hockey',
  pokemon: 'Pokemon',
};

const typeLabels: Record<string, string> = {
  'hobby-box': 'Hobby Box',
  'blaster': 'Blaster',
  'mega-box': 'Mega Box',
  'hanger': 'Hanger',
  'fat-pack': 'Bundle / Fat Pack',
  'etb': 'Elite Trainer Box',
};

const sportColors: Record<string, { bg: string; border: string; text: string }> = {
  baseball: { bg: 'bg-red-950/30', border: 'border-red-800/50', text: 'text-red-400' },
  basketball: { bg: 'bg-orange-950/30', border: 'border-orange-800/50', text: 'text-orange-400' },
  football: { bg: 'bg-green-950/30', border: 'border-green-800/50', text: 'text-green-400' },
  hockey: { bg: 'bg-blue-950/30', border: 'border-blue-800/50', text: 'text-blue-400' },
  pokemon: { bg: 'bg-yellow-950/30', border: 'border-yellow-800/50', text: 'text-yellow-400' },
};

function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return `$${Math.round(value).toLocaleString()}`;
}

export default function SealedEVCalculator() {
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<SealedProduct | null>(null);
  const [customPrice, setCustomPrice] = useState<string>('');

  const sports = useMemo(() => [...new Set(sealedProducts.map(p => p.sport))], []);
  const types = useMemo(() => [...new Set(sealedProducts.map(p => p.type))], []);

  const filteredProducts = useMemo(() => {
    return sealedProducts.filter(p => {
      if (selectedSport !== 'all' && p.sport !== selectedSport) return false;
      if (selectedType !== 'all' && p.type !== selectedType) return false;
      return true;
    });
  }, [selectedSport, selectedType]);

  const effectivePrice = customPrice ? parseFloat(customPrice) : selectedProduct?.retailPrice ?? 0;

  const evResult = useMemo(() => {
    if (!selectedProduct) return null;
    const result = calculateEV(selectedProduct);
    if (customPrice && parseFloat(customPrice) > 0) {
      const price = parseFloat(customPrice);
      return {
        ...result,
        roi: result.expectedValue - price,
        roiPercent: ((result.expectedValue - price) / price) * 100,
      };
    }
    return result;
  }, [selectedProduct, customPrice]);

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1.5 font-medium">Sport / Category</label>
          <select
            value={selectedSport}
            onChange={(e) => { setSelectedSport(e.target.value); setSelectedProduct(null); }}
            className="bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          >
            <option value="all">All Categories</option>
            {sports.map(s => <option key={s} value={s}>{sportLabels[s] || s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1.5 font-medium">Product Type</label>
          <select
            value={selectedType}
            onChange={(e) => { setSelectedType(e.target.value); setSelectedProduct(null); }}
            className="bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          >
            <option value="all">All Types</option>
            {types.map(t => <option key={t} value={t}>{typeLabels[t] || t}</option>)}
          </select>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredProducts.map(product => {
          const ev = calculateEV(product);
          const colors = sportColors[product.sport] || sportColors.baseball;
          const isSelected = selectedProduct?.slug === product.slug;
          return (
            <button
              key={product.slug}
              onClick={() => { setSelectedProduct(product); setCustomPrice(''); }}
              className={`text-left p-4 rounded-xl border transition-all ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-950/20 ring-1 ring-emerald-500/30'
                  : 'border-gray-800 bg-gray-900 hover:border-gray-600'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors.bg} ${colors.border} border ${colors.text}`}>
                  {sportLabels[product.sport]}
                </span>
                <span className="text-xs text-gray-500">{typeLabels[product.type]}</span>
              </div>
              <h3 className="text-white font-semibold text-sm mb-1 leading-tight">{product.name}</h3>
              <div className="flex items-baseline gap-3 mt-2">
                <span className="text-gray-400 text-xs">Retail: <span className="text-white font-medium">${product.retailPrice}</span></span>
                <span className="text-gray-400 text-xs">EV: <span className={ev.roi >= 0 ? 'text-emerald-400 font-medium' : 'text-red-400 font-medium'}>{formatCurrency(ev.expectedValue)}</span></span>
              </div>
              <div className={`mt-1 text-xs font-medium ${ev.roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {ev.roi >= 0 ? '+' : ''}{formatCurrency(ev.roi)} ({ev.roiPercent >= 0 ? '+' : ''}{ev.roiPercent.toFixed(0)}%)
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Product Detail */}
      {selectedProduct && evResult && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">{selectedProduct.name}</h3>
              <p className="text-gray-400 text-sm">{selectedProduct.description}</p>
              <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
                <span>{selectedProduct.packsPerBox} packs &times; {selectedProduct.cardsPerPack} cards</span>
                <span>{selectedProduct.totalCards} total cards</span>
                <span>Released {selectedProduct.releaseDate}</span>
              </div>
            </div>
            <div className="shrink-0">
              <label className="block text-xs text-gray-500 mb-1.5 font-medium">Your Purchase Price</label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm">$</span>
                <input
                  type="number"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  placeholder={selectedProduct.retailPrice.toString()}
                  className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm w-24 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <p className="text-gray-600 text-xs mt-1">Retail: ${selectedProduct.retailPrice}</p>
            </div>
          </div>

          {/* EV Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Purchase Price</p>
              <p className="text-white font-bold text-lg">${effectivePrice.toFixed(0)}</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Expected Value</p>
              <p className="text-white font-bold text-lg">{formatCurrency(evResult.expectedValue)}</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Expected Profit / Loss</p>
              <p className={`font-bold text-lg ${evResult.roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {evResult.roi >= 0 ? '+' : ''}{formatCurrency(evResult.roi)}
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">ROI</p>
              <p className={`font-bold text-lg ${evResult.roiPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {evResult.roiPercent >= 0 ? '+' : ''}{evResult.roiPercent.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Hit Rate Breakdown */}
          <h4 className="text-white font-semibold text-sm mb-3">Expected Hit Breakdown</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left text-gray-400 font-medium py-2 px-3">Insert Type</th>
                  <th className="text-left text-gray-400 font-medium py-2 px-3">Pull Odds</th>
                  <th className="text-right text-gray-400 font-medium py-2 px-3">Avg Value</th>
                  <th className="text-right text-gray-400 font-medium py-2 px-3">Expected Hits</th>
                  <th className="text-right text-gray-400 font-medium py-2 px-3">Expected Value</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                {selectedProduct.hitRates.map((hit, i) => {
                  const breakdown = evResult.hitBreakdown[i];
                  return (
                    <tr key={hit.insert} className="border-b border-gray-800/50">
                      <td className="py-2 px-3">
                        <span className="text-white font-medium">{hit.insert}</span>
                        <p className="text-gray-500 text-xs mt-0.5">{hit.description}</p>
                      </td>
                      <td className="py-2 px-3 text-gray-400">{hit.odds}</td>
                      <td className="py-2 px-3 text-right">${hit.avgValue}</td>
                      <td className="py-2 px-3 text-right">{breakdown.expectedHits.toFixed(1)}</td>
                      <td className="py-2 px-3 text-right text-emerald-400 font-medium">{formatCurrency(breakdown.expectedValue)}</td>
                    </tr>
                  );
                })}
                <tr className="border-b border-gray-800/50">
                  <td className="py-2 px-3 text-white font-medium">Base Cards (combined)</td>
                  <td className="py-2 px-3 text-gray-500">—</td>
                  <td className="py-2 px-3 text-right text-gray-500">—</td>
                  <td className="py-2 px-3 text-right text-gray-500">{selectedProduct.totalCards}</td>
                  <td className="py-2 px-3 text-right text-emerald-400 font-medium">{formatCurrency(selectedProduct.baseCardValue)}</td>
                </tr>
                <tr className="bg-gray-800/30">
                  <td colSpan={4} className="py-2 px-3 text-white font-bold">Total Expected Value</td>
                  <td className="py-2 px-3 text-right text-emerald-400 font-bold text-base">{formatCurrency(evResult.expectedValue)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Verdict */}
          <div className={`mt-6 rounded-xl p-4 border ${
            evResult.roi >= 0
              ? 'bg-emerald-950/20 border-emerald-800/50'
              : evResult.roiPercent > -20
                ? 'bg-amber-950/20 border-amber-800/50'
                : 'bg-red-950/20 border-red-800/50'
          }`}>
            <h4 className={`font-semibold text-sm mb-1 ${
              evResult.roi >= 0 ? 'text-emerald-400' : evResult.roiPercent > -20 ? 'text-amber-400' : 'text-red-400'
            }`}>
              {evResult.roi >= 0
                ? 'Positive EV — Good Buy at This Price'
                : evResult.roiPercent > -20
                  ? 'Slightly Negative EV — Buy for the Experience, Not the Value'
                  : 'Negative EV — Likely to Lose Money'}
            </h4>
            <p className="text-gray-400 text-sm">
              {evResult.roi >= 0
                ? `At $${effectivePrice.toFixed(0)}, this product has positive expected value. On average, you'll pull ${formatCurrency(evResult.expectedValue)} worth of cards. Note: this is an average — individual box results vary widely.`
                : `At $${effectivePrice.toFixed(0)}, you'd need to pull above-average hits to break even. The expected return is ${formatCurrency(evResult.expectedValue)} per box. Individual results vary — you might hit a big card, but on average you'll lose ${formatCurrency(Math.abs(evResult.roi))}.`}
            </p>
          </div>

          {/* eBay link */}
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={selectedProduct.ebaySearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 rounded-xl text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Buy on eBay
            </a>
            <a
              href={`${selectedProduct.ebaySearchUrl}&LH_Sold=1&LH_Complete=1`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 rounded-xl text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              eBay Sold Prices
            </a>
          </div>
        </div>
      )}

      {/* Methodology note */}
      <div className="bg-amber-950/20 border border-amber-800/30 rounded-xl px-4 py-3">
        <p className="text-amber-300/80 text-sm">
          <strong className="font-semibold">How we calculate EV:</strong> Expected Value = (hit rate &times; average card value for each insert type) + base card value. Hit rates are based on published odds from manufacturers and verified community data. Card values reflect recent eBay sold prices. Individual box results will vary — EV is a statistical average across many boxes, not a guarantee for any single box.
        </p>
      </div>
    </div>
  );
}
