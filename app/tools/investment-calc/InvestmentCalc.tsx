'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

// Benchmark annual returns (approximate historical)
const BENCHMARKS = [
  { name: 'S&P 500', annualReturn: 0.104, color: 'text-blue-400', bg: 'bg-blue-500' },
  { name: 'Gold', annualReturn: 0.078, color: 'text-yellow-400', bg: 'bg-yellow-500' },
  { name: 'Real Estate', annualReturn: 0.055, color: 'text-emerald-400', bg: 'bg-emerald-500' },
  { name: 'Bonds', annualReturn: 0.035, color: 'text-zinc-400', bg: 'bg-zinc-500' },
  { name: 'Bitcoin (5yr avg)', annualReturn: 0.45, color: 'text-orange-400', bg: 'bg-orange-500' },
];

interface InvestmentResult {
  totalReturn: number;
  totalReturnPct: number;
  annualizedReturn: number;
  holdingDays: number;
  holdingYears: number;
  profit: number;
  benchmarks: { name: string; hypothetical: number; color: string; bg: string }[];
  verdict: { label: string; detail: string; color: string };
}

function calculateInvestment(
  purchasePrice: number,
  currentValue: number,
  purchaseDate: Date,
): InvestmentResult {
  const now = new Date();
  const holdingDays = Math.max(1, Math.floor((now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24)));
  const holdingYears = holdingDays / 365.25;

  const profit = currentValue - purchasePrice;
  const totalReturnPct = ((currentValue - purchasePrice) / purchasePrice) * 100;

  // Annualized return: (current/purchase)^(1/years) - 1
  const annualizedReturn = holdingYears > 0
    ? (Math.pow(currentValue / purchasePrice, 1 / holdingYears) - 1) * 100
    : totalReturnPct;

  // Calculate benchmarks
  const benchmarks = BENCHMARKS.map(b => ({
    name: b.name,
    hypothetical: purchasePrice * Math.pow(1 + b.annualReturn, holdingYears),
    color: b.color,
    bg: b.bg,
  }));

  // Verdict
  let verdict: { label: string; detail: string; color: string };
  const beatsCount = benchmarks.filter(b => currentValue > b.hypothetical).length;

  if (annualizedReturn > 50) {
    verdict = { label: 'Exceptional Investment', detail: 'Your card outperformed virtually every traditional asset class. This is a home run.', color: 'text-yellow-400' };
  } else if (annualizedReturn > 20) {
    verdict = { label: 'Strong Performer', detail: 'Your card significantly outperformed the stock market. Great investment.', color: 'text-emerald-400' };
  } else if (annualizedReturn > 10) {
    verdict = { label: 'Solid Return', detail: 'Your card matched or beat the S&P 500. Better than most alternative investments.', color: 'text-sky-400' };
  } else if (annualizedReturn > 0) {
    verdict = { label: 'Modest Gain', detail: `Your card made money but underperformed ${5 - beatsCount} of 5 benchmarks. Consider whether the holding period was worth it.`, color: 'text-zinc-300' };
  } else if (annualizedReturn > -10) {
    verdict = { label: 'Slight Loss', detail: 'Your card lost value. This happens — card prices are cyclical. Consider whether the market has bottomed.', color: 'text-orange-400' };
  } else {
    verdict = { label: 'Significant Loss', detail: 'Your card has depreciated substantially. Consider tax-loss harvesting by selling and reinvesting in cards with better upside.', color: 'text-red-400' };
  }

  return { totalReturn: currentValue - purchasePrice, totalReturnPct, annualizedReturn, holdingDays, holdingYears, profit, benchmarks, verdict };
}

function formatCurrency(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1000) return `${n < 0 ? '-' : ''}$${abs.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  return `${n < 0 ? '-' : ''}$${abs.toFixed(2)}`;
}

export default function InvestmentCalc() {
  const [purchasePrice, setPurchasePrice] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [gradingCost, setGradingCost] = useState('');
  const [shippingCost, setShippingCost] = useState('');

  const result = useMemo(() => {
    const pp = parseFloat(purchasePrice);
    const cv = parseFloat(currentValue);
    const pd = purchaseDate ? new Date(purchaseDate) : null;
    const gc = parseFloat(gradingCost) || 0;
    const sc = parseFloat(shippingCost) || 0;

    if (!pp || !cv || !pd || isNaN(pp) || isNaN(cv)) return null;
    if (pd > new Date()) return null;

    const totalCost = pp + gc + sc;
    return calculateInvestment(totalCost, cv, pd);
  }, [purchasePrice, currentValue, purchaseDate, gradingCost, shippingCost]);

  const totalCost = (parseFloat(purchasePrice) || 0) + (parseFloat(gradingCost) || 0) + (parseFloat(shippingCost) || 0);

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Enter Your Investment</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Purchase Price ($)</label>
            <input
              type="number"
              value={purchasePrice}
              onChange={e => setPurchasePrice(e.target.value)}
              placeholder="100"
              min="0"
              step="0.01"
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50"
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Current Value ($)</label>
            <input
              type="number"
              value={currentValue}
              onChange={e => setCurrentValue(e.target.value)}
              placeholder="250"
              min="0"
              step="0.01"
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50"
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Purchase Date</label>
            <input
              type="date"
              value={purchaseDate}
              onChange={e => setPurchaseDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Grading Cost ($)</label>
              <input
                type="number"
                value={gradingCost}
                onChange={e => setGradingCost(e.target.value)}
                placeholder="0"
                min="0"
                step="1"
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Shipping ($)</label>
              <input
                type="number"
                value={shippingCost}
                onChange={e => setShippingCost(e.target.value)}
                placeholder="0"
                min="0"
                step="1"
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50"
              />
            </div>
          </div>
        </div>
        {totalCost > 0 && (
          <div className="mt-3 text-sm text-zinc-500">
            Total cost basis: {formatCurrency(totalCost)}
          </div>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 text-center">
              <div className="text-zinc-500 text-xs mb-1">Total Return</div>
              <div className={`text-2xl font-bold ${result.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {result.profit >= 0 ? '+' : ''}{formatCurrency(result.profit)}
              </div>
            </div>
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 text-center">
              <div className="text-zinc-500 text-xs mb-1">Total Return %</div>
              <div className={`text-2xl font-bold ${result.totalReturnPct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {result.totalReturnPct >= 0 ? '+' : ''}{result.totalReturnPct.toFixed(1)}%
              </div>
            </div>
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 text-center">
              <div className="text-zinc-500 text-xs mb-1">Annualized Return</div>
              <div className={`text-2xl font-bold ${result.annualizedReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {result.annualizedReturn >= 0 ? '+' : ''}{result.annualizedReturn.toFixed(1)}%
              </div>
            </div>
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 text-center">
              <div className="text-zinc-500 text-xs mb-1">Holding Period</div>
              <div className="text-2xl font-bold text-white">
                {result.holdingYears >= 1
                  ? `${result.holdingYears.toFixed(1)}yr`
                  : `${result.holdingDays}d`
                }
              </div>
            </div>
          </div>

          {/* Verdict */}
          <div className={`bg-zinc-900/60 border border-zinc-800 rounded-xl p-6`}>
            <h3 className={`text-xl font-bold ${result.verdict.color} mb-2`}>
              {result.verdict.label}
            </h3>
            <p className="text-zinc-300 text-sm">{result.verdict.detail}</p>
          </div>

          {/* Benchmark Comparison */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">
              vs. Benchmarks ({result.holdingYears.toFixed(1)} year{result.holdingYears >= 2 ? 's' : ''})
            </h3>
            <p className="text-zinc-500 text-sm mb-4">
              If you had invested {formatCurrency(totalCost)} in these assets instead:
            </p>
            <div className="space-y-3">
              {/* Your Card */}
              <div className="flex items-center gap-3">
                <div className="w-32 text-sm font-bold text-teal-400">Your Card</div>
                <div className="flex-1 h-8 bg-zinc-800 rounded-lg overflow-hidden relative">
                  <div
                    className="h-full bg-teal-500 rounded-lg transition-all duration-700"
                    style={{ width: `${Math.min(100, Math.max(2, (parseFloat(currentValue) / Math.max(...result.benchmarks.map(b => b.hypothetical), parseFloat(currentValue)) * 100)))}%` }}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-white font-medium">
                    {formatCurrency(parseFloat(currentValue))}
                  </span>
                </div>
              </div>
              {result.benchmarks.map(b => {
                const maxVal = Math.max(...result.benchmarks.map(x => x.hypothetical), parseFloat(currentValue));
                const barW = Math.min(100, Math.max(2, (b.hypothetical / maxVal * 100)));
                const beats = parseFloat(currentValue) > b.hypothetical;
                return (
                  <div key={b.name} className="flex items-center gap-3">
                    <div className={`w-32 text-sm ${b.color}`}>{b.name}</div>
                    <div className="flex-1 h-8 bg-zinc-800 rounded-lg overflow-hidden relative">
                      <div
                        className={`h-full ${b.bg} rounded-lg transition-all duration-700 opacity-60`}
                        style={{ width: `${barW}%` }}
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-white font-medium">
                        {formatCurrency(b.hypothetical)} {beats ? '' : ''}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 text-xs text-zinc-600">
              Benchmark returns are historical averages and not guaranteed. S&P 500: ~10.4% annualized (1957-2025). Gold: ~7.8% (2000-2025). Bitcoin: ~45% (5yr avg, high volatility).
            </div>
          </div>

          {/* Tips */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Investment Tips</h3>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <div className="text-teal-400 font-medium mb-1">Tax Implications</div>
                <p className="text-zinc-400">Cards held over 1 year qualify for long-term capital gains rates (0-20%) vs. short-term rates (up to 37%). Collectibles may be taxed at 28% max federal rate.</p>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <div className="text-teal-400 font-medium mb-1">When to Sell</div>
                <p className="text-zinc-400">Consider selling when annualized returns exceed 25% — that beats most traditional investments. Lock in gains before market corrections or player retirements.</p>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <div className="text-teal-400 font-medium mb-1">Dollar Cost Averaging</div>
                <p className="text-zinc-400">Don&apos;t put all your card budget into one purchase. Spread buys over time to average out price fluctuations — especially for rookie cards during the season.</p>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <div className="text-teal-400 font-medium mb-1">Hidden Costs</div>
                <p className="text-zinc-400">Remember to factor in grading ($20-$150), shipping ($5-$30), insurance, storage, and selling platform fees (eBay 13%, COMC 5%) when calculating true ROI.</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => { setPurchasePrice(''); setCurrentValue(''); setPurchaseDate(''); setGradingCost(''); setShippingCost(''); }}
              className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors text-sm border border-zinc-700"
            >
              Calculate Another
            </button>
            <Link
              href="/tools/flip-calc"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors text-sm"
            >
              Flip Profit Calculator →
            </Link>
            <Link
              href="/tools/grading-roi"
              className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-medium rounded-lg transition-colors text-sm"
            >
              Grading ROI →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
