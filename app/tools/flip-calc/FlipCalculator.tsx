'use client';

import { useState, useMemo } from 'react';

interface Platform {
  id: string;
  name: string;
  sellerFee: number; // percentage
  paymentFee: number; // percentage
  fixedFee: number; // flat fee per transaction
  description: string;
}

const platforms: Platform[] = [
  { id: 'ebay', name: 'eBay', sellerFee: 0.1325, paymentFee: 0.0, fixedFee: 0.30, description: '13.25% final value fee + $0.30/order' },
  { id: 'comc', name: 'COMC', sellerFee: 0.05, paymentFee: 0.025, fixedFee: 0.50, description: '5% commission + 2.5% processing + $0.50 shipping credit' },
  { id: 'myslabs', name: 'MySlabs', sellerFee: 0.09, paymentFee: 0.0, fixedFee: 0, description: '9% seller fee, no additional processing' },
  { id: 'mercari', name: 'Mercari', sellerFee: 0.10, paymentFee: 0.0, fixedFee: 0, description: '10% seller fee on completed sales' },
  { id: 'facebook', name: 'Facebook Marketplace', sellerFee: 0.0, paymentFee: 0.0, fixedFee: 0, description: 'No fees for local pickup / cash deals' },
  { id: 'cardshow', name: 'Card Show (In-Person)', sellerFee: 0.0, paymentFee: 0.0, fixedFee: 0, description: 'No platform fees — account for table cost separately' },
  { id: 'instagram', name: 'Instagram / X / Direct', sellerFee: 0.0, paymentFee: 0.029, fixedFee: 0.30, description: 'PayPal/Venmo G&S: 2.9% + $0.30' },
];

interface FlipEntry {
  id: string;
  cardName: string;
  buyPrice: number;
  sellPrice: number;
  platformId: string;
  shippingCost: number;
  gradingCost: number;
}

let entryId = 0;
function newEntry(): FlipEntry {
  return {
    id: `flip-${++entryId}`,
    cardName: '',
    buyPrice: 0,
    sellPrice: 0,
    platformId: 'ebay',
    shippingCost: 1.50,
    gradingCost: 0,
  };
}

function calcFlip(entry: FlipEntry) {
  const platform = platforms.find(p => p.id === entry.platformId) || platforms[0];
  const sellerFees = entry.sellPrice * platform.sellerFee;
  const paymentFees = entry.sellPrice * platform.paymentFee;
  const fixedFees = platform.fixedFee;
  const totalFees = sellerFees + paymentFees + fixedFees;
  const totalCost = entry.buyPrice + entry.shippingCost + entry.gradingCost + totalFees;
  const netProfit = entry.sellPrice - totalCost;
  const roi = entry.buyPrice > 0 ? (netProfit / (entry.buyPrice + entry.shippingCost + entry.gradingCost)) * 100 : 0;
  return { sellerFees, paymentFees, fixedFees, totalFees, totalCost, netProfit, roi };
}

export default function FlipCalculator() {
  const [entries, setEntries] = useState<FlipEntry[]>([newEntry()]);
  const [showBatch, setShowBatch] = useState(false);

  const updateEntry = (id: string, field: keyof FlipEntry, value: string | number) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const addEntry = () => {
    setEntries(prev => [...prev, newEntry()]);
    setShowBatch(true);
  };

  const removeEntry = (id: string) => {
    setEntries(prev => prev.length > 1 ? prev.filter(e => e.id !== id) : prev);
  };

  const batchSummary = useMemo(() => {
    const results = entries.map(e => ({ entry: e, ...calcFlip(e) }));
    const totalBuyPrice = results.reduce((s, r) => s + r.entry.buyPrice, 0);
    const totalSellPrice = results.reduce((s, r) => s + r.entry.sellPrice, 0);
    const totalFees = results.reduce((s, r) => s + r.totalFees, 0);
    const totalShipping = results.reduce((s, r) => s + r.entry.shippingCost, 0);
    const totalGrading = results.reduce((s, r) => s + r.entry.gradingCost, 0);
    const totalProfit = results.reduce((s, r) => s + r.netProfit, 0);
    const totalInvested = totalBuyPrice + totalShipping + totalGrading;
    const overallRoi = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;
    const profitableFlips = results.filter(r => r.netProfit > 0).length;
    return { results, totalBuyPrice, totalSellPrice, totalFees, totalShipping, totalGrading, totalProfit, overallRoi, profitableFlips };
  }, [entries]);

  const primary = entries[0];
  const primaryResult = calcFlip(primary);
  const platform = platforms.find(p => p.id === primary.platformId) || platforms[0];

  return (
    <div className="space-y-8">
      {/* Single Flip Calculator */}
      <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Calculate Your Flip</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Card Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-400 mb-1">Card Name (optional)</label>
            <input
              type="text"
              value={primary.cardName}
              onChange={e => updateEntry(primary.id, 'cardName', e.target.value)}
              placeholder="e.g., 2023 Topps Chrome Wemby RC PSA 10"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
            />
          </div>

          {/* Buy Price */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Buy Price</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={primary.buyPrice || ''}
                onChange={e => updateEntry(primary.id, 'buyPrice', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* Sell Price */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Sell Price</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={primary.sellPrice || ''}
                onChange={e => updateEntry(primary.id, 'sellPrice', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* Platform */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Selling Platform</label>
            <select
              value={primary.platformId}
              onChange={e => updateEntry(primary.id, 'platformId', e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
            >
              {platforms.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">{platform.description}</p>
          </div>

          {/* Shipping Cost */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Shipping Cost</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={primary.shippingCost || ''}
                onChange={e => updateEntry(primary.id, 'shippingCost', parseFloat(e.target.value) || 0)}
                placeholder="1.50"
                className="w-full pl-8 pr-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">PWE ~$1.50, bubble mailer ~$4, small box ~$8</p>
          </div>

          {/* Grading Cost */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-400 mb-1">Grading Cost (if you graded before selling)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={primary.gradingCost || ''}
                onChange={e => updateEntry(primary.id, 'gradingCost', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">PSA: $20-$150+ | BGS: $22-$250+ | CGC: $15-$100+ (depends on tier and turnaround)</p>
          </div>
        </div>

        {/* Results */}
        {primary.sellPrice > 0 && (
          <div className="border-t border-gray-700 pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-900/80 rounded-xl p-4 text-center">
                <div className="text-xs text-gray-500 mb-1">Total Invested</div>
                <div className="text-lg font-bold text-white">${(primary.buyPrice + primary.shippingCost + primary.gradingCost).toFixed(2)}</div>
              </div>
              <div className="bg-gray-900/80 rounded-xl p-4 text-center">
                <div className="text-xs text-gray-500 mb-1">Platform Fees</div>
                <div className="text-lg font-bold text-red-400">-${primaryResult.totalFees.toFixed(2)}</div>
              </div>
              <div className="bg-gray-900/80 rounded-xl p-4 text-center">
                <div className="text-xs text-gray-500 mb-1">Net Profit</div>
                <div className={`text-lg font-bold ${primaryResult.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {primaryResult.netProfit >= 0 ? '+' : ''}${primaryResult.netProfit.toFixed(2)}
                </div>
              </div>
              <div className="bg-gray-900/80 rounded-xl p-4 text-center">
                <div className="text-xs text-gray-500 mb-1">ROI</div>
                <div className={`text-lg font-bold ${primaryResult.roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {primaryResult.roi >= 0 ? '+' : ''}{primaryResult.roi.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Fee Breakdown */}
            <div className="bg-gray-900/60 rounded-xl p-4 mb-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Fee Breakdown</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Sell Price</span>
                  <span className="text-white">${primary.sellPrice.toFixed(2)}</span>
                </div>
                {primaryResult.sellerFees > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">{platform.name} Seller Fee ({(platform.sellerFee * 100).toFixed(2)}%)</span>
                    <span className="text-red-400">-${primaryResult.sellerFees.toFixed(2)}</span>
                  </div>
                )}
                {primaryResult.paymentFees > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Payment Processing ({(platform.paymentFee * 100).toFixed(1)}%)</span>
                    <span className="text-red-400">-${primaryResult.paymentFees.toFixed(2)}</span>
                  </div>
                )}
                {primaryResult.fixedFees > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Fixed Fee</span>
                    <span className="text-red-400">-${primaryResult.fixedFees.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Buy Price</span>
                  <span className="text-red-400">-${primary.buyPrice.toFixed(2)}</span>
                </div>
                {primary.shippingCost > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Shipping Cost</span>
                    <span className="text-red-400">-${primary.shippingCost.toFixed(2)}</span>
                  </div>
                )}
                {primary.gradingCost > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Grading Cost</span>
                    <span className="text-red-400">-${primary.gradingCost.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-gray-700 pt-2 flex justify-between font-semibold">
                  <span className={primaryResult.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}>Net Profit</span>
                  <span className={primaryResult.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                    {primaryResult.netProfit >= 0 ? '+' : ''}${primaryResult.netProfit.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Verdict */}
            <div className={`rounded-xl p-4 border ${primaryResult.netProfit > 0 ? 'bg-emerald-950/30 border-emerald-800/50' : primaryResult.netProfit === 0 ? 'bg-yellow-950/30 border-yellow-800/50' : 'bg-red-950/30 border-red-800/50'}`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{primaryResult.netProfit > 0 ? '💰' : primaryResult.netProfit === 0 ? '⚖️' : '🚫'}</span>
                <div>
                  <div className={`font-bold ${primaryResult.netProfit > 0 ? 'text-emerald-400' : primaryResult.netProfit === 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {primaryResult.netProfit > 0 ? 'Profitable Flip!' : primaryResult.netProfit === 0 ? 'Break Even' : 'Not Worth Flipping'}
                  </div>
                  <div className="text-sm text-gray-400">
                    {primaryResult.netProfit > 0 && primaryResult.roi >= 50
                      ? `Great flip — ${primaryResult.roi.toFixed(0)}% ROI. You keep $${primaryResult.netProfit.toFixed(2)} after all fees.`
                      : primaryResult.netProfit > 0 && primaryResult.roi >= 20
                      ? `Decent flip — ${primaryResult.roi.toFixed(0)}% ROI. Consider if the time invested is worth $${primaryResult.netProfit.toFixed(2)}.`
                      : primaryResult.netProfit > 0
                      ? `Thin margins — only ${primaryResult.roi.toFixed(0)}% ROI ($${primaryResult.netProfit.toFixed(2)} profit). Factor in your time and risk.`
                      : primaryResult.netProfit === 0
                      ? 'You break even on this flip. Sell for more or buy for less.'
                      : `You lose $${Math.abs(primaryResult.netProfit).toFixed(2)} on this flip. You need to sell for at least $${primaryResult.totalCost.toFixed(2)} to break even.`
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* Breakeven Analysis */}
            <div className="mt-4 bg-gray-900/60 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Breakeven Analysis</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div className="bg-gray-800/60 rounded-lg p-3">
                  <div className="text-xs text-gray-500">Min Sell Price to Break Even</div>
                  <div className="text-white font-bold">
                    ${(() => {
                      const cost = primary.buyPrice + primary.shippingCost + primary.gradingCost;
                      const feeRate = platform.sellerFee + platform.paymentFee;
                      return feeRate > 0 ? ((cost + platform.fixedFee) / (1 - feeRate)).toFixed(2) : (cost + platform.fixedFee).toFixed(2);
                    })()}
                  </div>
                </div>
                <div className="bg-gray-800/60 rounded-lg p-3">
                  <div className="text-xs text-gray-500">Max Buy Price at This Sell</div>
                  <div className="text-white font-bold">
                    ${(primary.sellPrice - primaryResult.totalFees - primary.shippingCost - primary.gradingCost).toFixed(2)}
                  </div>
                </div>
                <div className="bg-gray-800/60 rounded-lg p-3">
                  <div className="text-xs text-gray-500">Fee % of Sell Price</div>
                  <div className="text-white font-bold">
                    {primary.sellPrice > 0 ? ((primaryResult.totalFees / primary.sellPrice) * 100).toFixed(1) : '0.0'}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Platform Fee Comparison */}
      {primary.sellPrice > 0 && primary.buyPrice > 0 && (
        <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Platform Comparison</h2>
          <p className="text-sm text-gray-400 mb-4">Same flip across all platforms — see where you keep the most profit.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Platform</th>
                  <th className="text-right py-2 px-3 text-gray-400 font-medium">Fees</th>
                  <th className="text-right py-2 px-3 text-gray-400 font-medium">Net Profit</th>
                  <th className="text-right py-2 px-3 text-gray-400 font-medium">ROI</th>
                </tr>
              </thead>
              <tbody>
                {platforms
                  .map(p => {
                    const mockEntry = { ...primary, platformId: p.id };
                    const result = calcFlip(mockEntry);
                    return { platform: p, ...result };
                  })
                  .sort((a, b) => b.netProfit - a.netProfit)
                  .map(row => (
                    <tr key={row.platform.id} className={`border-b border-gray-700/50 ${row.platform.id === primary.platformId ? 'bg-emerald-950/20' : ''}`}>
                      <td className="py-2.5 px-3 text-white">
                        {row.platform.name}
                        {row.platform.id === primary.platformId && <span className="ml-2 text-xs text-emerald-400">(selected)</span>}
                      </td>
                      <td className="py-2.5 px-3 text-right text-red-400">${row.totalFees.toFixed(2)}</td>
                      <td className={`py-2.5 px-3 text-right font-medium ${row.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {row.netProfit >= 0 ? '+' : ''}${row.netProfit.toFixed(2)}
                      </td>
                      <td className={`py-2.5 px-3 text-right ${row.roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {row.roi >= 0 ? '+' : ''}{row.roi.toFixed(1)}%
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Batch Flip Tracker */}
      <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Batch Flip Tracker</h2>
          <button
            onClick={addEntry}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl transition-colors"
          >
            + Add Flip
          </button>
        </div>
        <p className="text-sm text-gray-400 mb-6">Track multiple flips to see your total P&L. Great for card show hauls or bulk flipping sessions.</p>

        {showBatch && entries.length > 1 && (
          <>
            <div className="space-y-3 mb-6">
              {entries.map((entry, i) => {
                const result = calcFlip(entry);
                return (
                  <div key={entry.id} className="bg-gray-900/60 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-xs text-gray-500 mt-2 w-6 shrink-0">#{i + 1}</span>
                      <div className="flex-1 grid grid-cols-2 sm:grid-cols-5 gap-2">
                        <input
                          type="text"
                          value={entry.cardName}
                          onChange={e => updateEntry(entry.id, 'cardName', e.target.value)}
                          placeholder="Card name"
                          className="sm:col-span-2 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:border-emerald-500 outline-none"
                        />
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">Buy $</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={entry.buyPrice || ''}
                            onChange={e => updateEntry(entry.id, 'buyPrice', parseFloat(e.target.value) || 0)}
                            className="w-full pl-12 pr-2 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:border-emerald-500 outline-none"
                          />
                        </div>
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">Sell $</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={entry.sellPrice || ''}
                            onChange={e => updateEntry(entry.id, 'sellPrice', parseFloat(e.target.value) || 0)}
                            className="w-full pl-12 pr-2 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:border-emerald-500 outline-none"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${result.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {result.netProfit >= 0 ? '+' : ''}${result.netProfit.toFixed(2)}
                          </span>
                          {entries.length > 1 && (
                            <button onClick={() => removeEntry(entry.id)} className="text-gray-500 hover:text-red-400 ml-auto text-lg leading-none">&times;</button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Batch Summary */}
            {entries.length > 1 && (
              <div className="border-t border-gray-700 pt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="bg-gray-900/80 rounded-xl p-3 text-center">
                    <div className="text-xs text-gray-500">Total Invested</div>
                    <div className="text-lg font-bold text-white">${(batchSummary.totalBuyPrice + batchSummary.totalShipping + batchSummary.totalGrading).toFixed(2)}</div>
                  </div>
                  <div className="bg-gray-900/80 rounded-xl p-3 text-center">
                    <div className="text-xs text-gray-500">Total Revenue</div>
                    <div className="text-lg font-bold text-white">${batchSummary.totalSellPrice.toFixed(2)}</div>
                  </div>
                  <div className="bg-gray-900/80 rounded-xl p-3 text-center">
                    <div className="text-xs text-gray-500">Total Profit</div>
                    <div className={`text-lg font-bold ${batchSummary.totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {batchSummary.totalProfit >= 0 ? '+' : ''}${batchSummary.totalProfit.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-gray-900/80 rounded-xl p-3 text-center">
                    <div className="text-xs text-gray-500">Overall ROI</div>
                    <div className={`text-lg font-bold ${batchSummary.overallRoi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {batchSummary.overallRoi >= 0 ? '+' : ''}{batchSummary.overallRoi.toFixed(1)}%
                    </div>
                  </div>
                </div>
                <div className="text-center text-sm text-gray-400">
                  {batchSummary.profitableFlips}/{entries.length} profitable flips &middot; ${batchSummary.totalFees.toFixed(2)} total fees paid
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Pro Tips */}
      <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Flipping Pro Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-900/60 rounded-xl p-4">
            <h3 className="font-semibold text-amber-400 text-sm mb-2">Target 30%+ ROI Minimum</h3>
            <p className="text-gray-400 text-sm">After fees, shipping, and your time, flips under 30% ROI are rarely worth it. Your time has value — factor in photography, listing, packaging, and post office trips.</p>
          </div>
          <div className="bg-gray-900/60 rounded-xl p-4">
            <h3 className="font-semibold text-amber-400 text-sm mb-2">eBay Promoted Listings Add Up</h3>
            <p className="text-gray-400 text-sm">If you use eBay Promoted Listings Standard (2-5% ad rate), add that to your costs. On a $100 card, that is another $2-$5 on top of the 13.25% final value fee.</p>
          </div>
          <div className="bg-gray-900/60 rounded-xl p-4">
            <h3 className="font-semibold text-amber-400 text-sm mb-2">Card Shows = Zero Fees</h3>
            <p className="text-gray-400 text-sm">Buying at card shows and selling direct (Facebook groups, X, local meetups) eliminates platform fees entirely. Table rental is usually $50-$200/day — calculate your break-even flip count.</p>
          </div>
          <div className="bg-gray-900/60 rounded-xl p-4">
            <h3 className="font-semibold text-amber-400 text-sm mb-2">Grade Before Flipping High-Value</h3>
            <p className="text-gray-400 text-sm">A $20 PSA grading fee on a $50 raw card that grades PSA 10 at $200+ is an 8x return. Use our <a href="/tools/grading-roi" className="text-emerald-400 hover:underline">Grading ROI Calculator</a> to check.</p>
          </div>
          <div className="bg-gray-900/60 rounded-xl p-4">
            <h3 className="font-semibold text-amber-400 text-sm mb-2">Track Everything</h3>
            <p className="text-gray-400 text-sm">Successful flippers track every buy, sell, and fee. Use the batch tracker above after card show visits. At tax time, you will need records of cost basis and sales.</p>
          </div>
          <div className="bg-gray-900/60 rounded-xl p-4">
            <h3 className="font-semibold text-amber-400 text-sm mb-2">PWE vs Bubble Mailer</h3>
            <p className="text-gray-400 text-sm">Cards under $20: PWE (plain white envelope) at ~$1.50 shipped. Over $20: bubble mailer with tracking at ~$4. Over $100: small box with insurance. Never skimp on shipping for valuable cards.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
