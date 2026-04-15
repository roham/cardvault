'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

/* ───── Platform Fee Structures ───── */
interface PlatformFees {
  name: string;
  icon: string;
  sellerFee: number;
  processing: number;
  fixedFee: number;
  shipping: number;
}

const platforms: PlatformFees[] = [
  { name: 'eBay', icon: '🛒', sellerFee: 0.1325, processing: 0, fixedFee: 0.30, shipping: 4.50 },
  { name: 'PWCC', icon: '🏛️', sellerFee: 0.10, processing: 0, fixedFee: 0, shipping: 0 },
  { name: 'Goldin', icon: '⭐', sellerFee: 0.10, processing: 0, fixedFee: 0, shipping: 0 },
  { name: 'MySlabs', icon: '📱', sellerFee: 0.08, processing: 0.029, fixedFee: 0.30, shipping: 5.00 },
  { name: 'Facebook Groups', icon: '👥', sellerFee: 0, processing: 0.029, fixedFee: 0.30, shipping: 4.50 },
  { name: 'COMC', icon: '📦', sellerFee: 0.05, processing: 0, fixedFee: 1.00, shipping: 0 },
];

function calcBreakEven(totalCost: number, platform: PlatformFees): number {
  // breakEven = (totalCost + fixedFee + shipping) / (1 - sellerFee - processing)
  const feeRate = platform.sellerFee + platform.processing;
  if (feeRate >= 1) return Infinity;
  return (totalCost + platform.fixedFee + platform.shipping) / (1 - feeRate);
}

export default function BreakEven() {
  const [purchasePrice, setPurchasePrice] = useState<number>(50);
  const [shippingPaid, setShippingPaid] = useState<number>(5);
  const [gradingCost, setGradingCost] = useState<number>(0);
  const [otherCosts, setOtherCosts] = useState<number>(0);
  const [selectedPlatform, setSelectedPlatform] = useState(0);

  const totalCost = purchasePrice + shippingPaid + gradingCost + otherCosts;

  const results = useMemo(() => {
    return platforms.map(p => {
      const breakEven = calcBreakEven(totalCost, p);
      const markup = totalCost > 0 ? ((breakEven - totalCost) / totalCost) * 100 : 0;
      return { platform: p, breakEven, markup };
    }).sort((a, b) => a.breakEven - b.breakEven);
  }, [totalCost]);

  const selectedResult = results.find(r => r.platform.name === platforms[selectedPlatform].name);
  const bestPlatform = results[0];

  const quickPresets = [
    { label: '$5 raw card', purchase: 5, shipping: 1, grading: 0, other: 0 },
    { label: '$25 raw card', purchase: 25, shipping: 4, grading: 0, other: 0 },
    { label: '$50 raw → grade', purchase: 50, shipping: 5, grading: 25, other: 0 },
    { label: '$100 graded slab', purchase: 100, shipping: 8, grading: 0, other: 0 },
    { label: '$200 hobby box', purchase: 200, shipping: 10, grading: 0, other: 0 },
    { label: '$500 investment', purchase: 500, shipping: 12, grading: 50, other: 0 },
  ];

  return (
    <div className="space-y-8">
      {/* Quick Presets */}
      <div className="flex flex-wrap gap-2">
        {quickPresets.map(p => (
          <button
            key={p.label}
            onClick={() => { setPurchasePrice(p.purchase); setShippingPaid(p.shipping); setGradingCost(p.grading); setOtherCosts(p.other); }}
            className="px-3 py-1.5 bg-gray-800 border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-white rounded-lg text-xs font-medium transition-colors"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Input Section */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">What Did You Pay?</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { label: 'Purchase Price', value: purchasePrice, setter: setPurchasePrice, hint: 'What you paid for the card' },
            { label: 'Shipping Paid', value: shippingPaid, setter: setShippingPaid, hint: 'Shipping cost to receive it' },
            { label: 'Grading Cost', value: gradingCost, setter: setGradingCost, hint: 'PSA/BGS/CGC fee (if graded)' },
            { label: 'Other Costs', value: otherCosts, setter: setOtherCosts, hint: 'Insurance, supplies, etc.' },
          ].map(f => (
            <div key={f.label}>
              <label className="block text-sm font-medium text-gray-400 mb-1">{f.label}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={f.value}
                  onChange={e => f.setter(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-gray-900 border border-gray-600 text-white rounded-xl pl-7 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  min={0}
                  step={1}
                />
              </div>
              <p className="text-[10px] text-gray-600 mt-1">{f.hint}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-700/50 flex items-center justify-between">
          <span className="text-sm text-gray-400">Total Investment</span>
          <span className="text-2xl font-bold text-white">${totalCost.toFixed(2)}</span>
        </div>
      </div>

      {/* Big Result */}
      {selectedResult && (
        <div className="bg-gradient-to-br from-emerald-950/40 to-gray-900 border border-emerald-800/40 rounded-2xl p-6 text-center">
          <div className="text-sm text-gray-400 mb-1">
            Minimum sell price on <span className="text-white font-medium">{platforms[selectedPlatform].name}</span> to break even
          </div>
          <div className="text-5xl font-bold text-emerald-400 my-3">
            ${selectedResult.breakEven.toFixed(2)}
          </div>
          <div className="text-sm text-gray-500">
            That is a <span className="text-yellow-400 font-medium">{selectedResult.markup.toFixed(1)}% markup</span> over your ${totalCost.toFixed(2)} total cost
          </div>
          {bestPlatform.platform.name !== platforms[selectedPlatform].name && (
            <div className="mt-3 text-xs text-emerald-500">
              Tip: {bestPlatform.platform.name} has the lowest break-even at ${bestPlatform.breakEven.toFixed(2)}
            </div>
          )}
        </div>
      )}

      {/* Platform Selector */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-white mb-4">Select Selling Platform</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {platforms.map((p, idx) => {
            const be = calcBreakEven(totalCost, p);
            const isBest = be === bestPlatform.breakEven;
            return (
              <button
                key={p.name}
                onClick={() => setSelectedPlatform(idx)}
                className={`p-4 rounded-xl border text-center transition-all ${
                  selectedPlatform === idx
                    ? 'bg-emerald-600/20 border-emerald-500 ring-1 ring-emerald-500/20'
                    : 'bg-gray-800 border-gray-600 hover:border-gray-500'
                }`}
              >
                <div className="text-2xl mb-1">{p.icon}</div>
                <div className={`text-sm font-medium ${selectedPlatform === idx ? 'text-emerald-400' : 'text-gray-300'}`}>{p.name}</div>
                <div className="text-lg font-bold text-white mt-1">${be.toFixed(2)}</div>
                <div className="text-[10px] text-gray-500">break-even</div>
                {isBest && (
                  <span className="inline-block mt-1 text-[9px] font-bold bg-emerald-600 text-white px-1.5 py-0.5 rounded-full">LOWEST</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-gray-700/50">
          <h2 className="text-lg font-semibold text-white">Platform Comparison</h2>
          <p className="text-sm text-gray-400">Break-even sell price for your ${totalCost.toFixed(2)} investment</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700/50">
                <th className="text-left text-gray-400 font-medium px-5 py-3">Platform</th>
                <th className="text-right text-gray-400 font-medium px-5 py-3">Break-Even</th>
                <th className="text-right text-gray-400 font-medium px-5 py-3">Markup</th>
                <th className="text-right text-gray-400 font-medium px-5 py-3">Total Fees</th>
                <th className="text-right text-gray-400 font-medium px-5 py-3">Fee %</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, idx) => {
                const fees = r.breakEven - totalCost;
                const feePct = r.breakEven > 0 ? (fees / r.breakEven) * 100 : 0;
                return (
                  <tr key={r.platform.name} className={`border-b border-gray-700/30 ${idx === 0 ? 'bg-emerald-950/20' : ''}`}>
                    <td className="px-5 py-3 font-medium text-white">{r.platform.icon} {r.platform.name}</td>
                    <td className={`px-5 py-3 text-right font-bold ${idx === 0 ? 'text-emerald-400' : 'text-white'}`}>${r.breakEven.toFixed(2)}</td>
                    <td className="px-5 py-3 text-right text-yellow-400">{r.markup.toFixed(1)}%</td>
                    <td className="px-5 py-3 text-right text-red-400">${fees.toFixed(2)}</td>
                    <td className="px-5 py-3 text-right text-gray-400">{feePct.toFixed(1)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tips */}
      <section className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Break-Even Tips</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { tip: 'Always include ALL costs', detail: 'Purchase price is just the start. Add shipping, grading fees, supplies (penny sleeves, toploaders, bubble mailers), and insurance. Missing costs lead to surprise losses.' },
            { tip: 'Grading adds $25-50+ per card', detail: 'PSA Value is $25/card. For a $50 raw card, grading alone adds 50% to your cost basis. Only grade if the gem value exceeds break-even by 2x or more.' },
            { tip: 'Platform choice matters more for cheap cards', detail: 'On a $10 card, eBay fees ($1.62) vs Facebook Groups ($0.59) is a 10% difference. On a $1,000 card, it is less meaningful percentage-wise.' },
            { tip: 'Factor in time value', detail: 'COMC and Heritage take weeks to pay out. If you need fast cash, the higher fees on eBay or Facebook Groups may be worth the speed.' },
            { tip: 'Negotiate your basis down', detail: 'Ask for cash discounts at card shows (5-10% off). Buy bulk lots on eBay. Lower your purchase price = lower break-even = easier to profit.' },
            { tip: 'Track every transaction', detail: 'Use CardVault Flip Tracker to log buys, sells, and all costs. Without tracking, you cannot know if you are actually profitable.' },
          ].map(t => (
            <div key={t.tip} className="bg-gray-900/50 rounded-xl p-4">
              <div className="text-sm font-semibold text-emerald-400 mb-1">{t.tip}</div>
              <p className="text-xs text-gray-400 leading-relaxed">{t.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Related Tools */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Related Tools</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/tools/flip-calc', label: 'Flip Profit Calculator', icon: '💸' },
            { href: '/tools/selling-platforms', label: 'Selling Platforms', icon: '🏪' },
            { href: '/tools/flip-tracker', label: 'Flip Tracker P&L', icon: '📒' },
            { href: '/tools/grading-roi', label: 'Grading ROI Calculator', icon: '💰' },
          ].map(t => (
            <Link
              key={t.href}
              href={t.href}
              className="bg-gray-800/50 border border-gray-700/50 hover:border-gray-600 rounded-xl p-4 text-center transition-colors"
            >
              <div className="text-2xl mb-2">{t.icon}</div>
              <div className="text-xs text-gray-400">{t.label}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
