'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

function parseValue(raw: string): number {
  const m = raw.match(/\$[\d,]+/);
  if (!m) return 0;
  return parseInt(m[0].replace(/[$,]/g, ''), 10);
}

const SPORT_COLORS: Record<string, string> = {
  baseball: 'text-red-400',
  basketball: 'text-orange-400',
  football: 'text-blue-400',
  hockey: 'text-cyan-400',
};

const SPORT_BG: Record<string, string> = {
  baseball: 'bg-red-950/40 border-red-800/40',
  basketball: 'bg-orange-950/40 border-orange-800/40',
  football: 'bg-blue-950/40 border-blue-800/40',
  hockey: 'bg-cyan-950/40 border-cyan-800/40',
};

const SPORT_ICONS: Record<string, string> = {
  baseball: '⚾',
  basketball: '🏀',
  football: '🏈',
  hockey: '🏒',
};

const BUDGET_OPTIONS = [25, 50, 100, 200, 500];
const HORIZON_OPTIONS = [3, 6, 12, 24];

// Volatility by sport (monthly std dev as % of price)
function getVolatility(sport: string, year: number): number {
  const currentYear = 2026;
  const age = currentYear - year;
  const baseVol: Record<string, number> = {
    football: 0.12, // highest — injury risk
    basketball: 0.10,
    baseball: 0.08,
    hockey: 0.09,
  };
  const sportVol = baseVol[sport] || 0.10;
  // Vintage cards are less volatile
  if (age > 50) return sportVol * 0.4;
  if (age > 30) return sportVol * 0.6;
  if (age > 15) return sportVol * 0.8;
  return sportVol; // modern cards — full volatility
}

// Appreciation rate by era (annual)
function getAppreciation(year: number): number {
  const currentYear = 2026;
  const age = currentYear - year;
  if (age > 80) return 0.04; // pre-war: steady 4%
  if (age > 50) return 0.05; // vintage: 5%
  if (age > 30) return 0.06; // junk wax era: 6% (recovering)
  if (age > 15) return 0.07; // modern: 7%
  return 0.10; // ultra-modern: 10% but volatile
}

function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// Box-Muller transform for normal distribution
function normalRandom(rng: () => number): number {
  const u1 = rng();
  const u2 = rng();
  return Math.sqrt(-2 * Math.log(Math.max(u1, 0.0001))) * Math.cos(2 * Math.PI * u2);
}

interface MonthData {
  month: number;
  price: number;
  bought: number;
  spent: number;
  totalCards: number;
  totalSpent: number;
  avgCost: number;
  portfolioValue: number;
  pnl: number;
  pnlPct: number;
}

interface DcaResult {
  months: MonthData[];
  totalCards: number;
  totalSpent: number;
  avgCostBasis: number;
  finalValue: number;
  totalReturn: number;
  totalReturnPct: number;
  lumpSumCards: number;
  lumpSumValue: number;
  lumpSumReturn: number;
  lumpSumReturnPct: number;
  dcaWins: boolean;
  volatility: number;
  appreciation: number;
}

function simulateDca(
  basePrice: number,
  sport: string,
  year: number,
  monthlyBudget: number,
  horizonMonths: number,
): DcaResult {
  const vol = getVolatility(sport, year);
  const annualAppreciation = getAppreciation(year);
  const monthlyAppreciation = annualAppreciation / 12;

  // Seed based on card properties for consistency
  const seed = basePrice * 1000 + year * 7 + sport.length * 31;
  const rng = seededRng(seed);

  let currentPrice = basePrice;
  const months: MonthData[] = [];
  let totalCards = 0;
  let totalSpent = 0;

  // Lump-sum: buy everything at starting price
  const lumpSumBudget = monthlyBudget * horizonMonths;
  const lumpSumCards = Math.floor(lumpSumBudget / basePrice) + (lumpSumBudget % basePrice >= basePrice * 0.01 ? 0 : 0);
  const lumpSumCardsBought = lumpSumBudget / basePrice; // fractional

  for (let m = 1; m <= horizonMonths; m++) {
    // Monthly price change: drift + noise
    const noise = normalRandom(rng) * vol;
    const drift = monthlyAppreciation;
    currentPrice = Math.max(currentPrice * (1 + drift + noise), basePrice * 0.3); // floor at 30% of base

    // Buy cards this month
    const cardsBought = monthlyBudget / currentPrice;
    totalCards += cardsBought;
    totalSpent += monthlyBudget;

    const avgCost = totalSpent / totalCards;
    const portfolioValue = totalCards * currentPrice;
    const pnl = portfolioValue - totalSpent;
    const pnlPct = totalSpent > 0 ? (pnl / totalSpent) * 100 : 0;

    months.push({
      month: m,
      price: currentPrice,
      bought: cardsBought,
      spent: monthlyBudget,
      totalCards,
      totalSpent,
      avgCost,
      portfolioValue,
      pnl,
      pnlPct,
    });
  }

  const finalPrice = currentPrice;
  const finalValue = totalCards * finalPrice;
  const totalReturn = finalValue - totalSpent;
  const totalReturnPct = (totalReturn / totalSpent) * 100;

  const lumpSumValue = lumpSumCardsBought * finalPrice;
  const lumpSumReturn = lumpSumValue - lumpSumBudget;
  const lumpSumReturnPct = (lumpSumReturn / lumpSumBudget) * 100;

  return {
    months,
    totalCards,
    totalSpent,
    avgCostBasis: totalSpent / totalCards,
    finalValue,
    totalReturn,
    totalReturnPct,
    lumpSumCards: lumpSumCardsBought,
    lumpSumValue,
    lumpSumReturn,
    lumpSumReturnPct,
    dcaWins: totalReturnPct > lumpSumReturnPct,
    volatility: vol * 100,
    appreciation: annualAppreciation * 100,
  };
}

export default function DcaCalculatorClient() {
  const [query, setQuery] = useState('');
  const [selectedCard, setSelectedCard] = useState<typeof sportsCards[0] | null>(null);
  const [monthlyBudget, setMonthlyBudget] = useState(100);
  const [customBudget, setCustomBudget] = useState('');
  const [horizon, setHorizon] = useState(12);
  const [showResults, setShowResults] = useState(false);

  const searchResults = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    return sportsCards
      .filter(c => {
        const val = parseValue(c.estimatedValueRaw);
        if (val < 5) return false; // skip very cheap cards
        return c.name.toLowerCase().includes(q) || c.player.toLowerCase().includes(q);
      })
      .slice(0, 8);
  }, [query]);

  const result = useMemo(() => {
    if (!selectedCard) return null;
    const basePrice = parseValue(selectedCard.estimatedValueRaw);
    if (basePrice <= 0) return null;
    const budget = customBudget ? parseInt(customBudget, 10) : monthlyBudget;
    if (!budget || budget <= 0) return null;
    return simulateDca(basePrice, selectedCard.sport, selectedCard.year, budget, horizon);
  }, [selectedCard, monthlyBudget, customBudget, horizon]);

  const handleSelectCard = useCallback((card: typeof sportsCards[0]) => {
    setSelectedCard(card);
    setQuery('');
    setShowResults(false);
  }, []);

  const handleCalculate = useCallback(() => {
    setShowResults(true);
  }, []);

  const activeBudget = customBudget ? parseInt(customBudget, 10) : monthlyBudget;

  // SVG chart
  const chartWidth = 600;
  const chartHeight = 200;
  const chartPadding = 40;

  const chartData = useMemo(() => {
    if (!result) return null;
    const prices = result.months.map(m => m.price);
    const avgCosts = result.months.map(m => m.avgCost);
    const allVals = [...prices, ...avgCosts];
    const minVal = Math.min(...allVals) * 0.9;
    const maxVal = Math.max(...allVals) * 1.1;
    const range = maxVal - minVal || 1;

    const toY = (v: number) => chartHeight - chartPadding - ((v - minVal) / range) * (chartHeight - chartPadding * 2);
    const toX = (i: number) => chartPadding + (i / (result.months.length - 1)) * (chartWidth - chartPadding * 2);

    const pricePath = result.months.map((m, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(m.price)}`).join(' ');
    const avgPath = result.months.map((m, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(m.avgCost)}`).join(' ');

    return { pricePath, avgPath, minVal, maxVal, toY, toX };
  }, [result]);

  const fmt = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(1)}K` : `$${Math.round(n)}`;
  const fmtPct = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`;

  return (
    <div className="space-y-6">
      {/* Card Search */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">1. Select a Card</h2>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowResults(false); }}
            placeholder="Search by player name or card name..."
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />
          {searchResults.length > 0 && !selectedCard && (
            <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-xl max-h-80 overflow-y-auto">
              {searchResults.map(card => {
                const val = parseValue(card.estimatedValueRaw);
                return (
                  <button
                    key={card.slug}
                    onClick={() => handleSelectCard(card)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-700/60 transition-colors border-b border-gray-700/50 last:border-0"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-white text-sm font-medium">{card.name}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-xs ${SPORT_COLORS[card.sport] || 'text-gray-400'}`}>
                            {SPORT_ICONS[card.sport] || ''} {card.sport}
                          </span>
                          <span className="text-gray-500 text-xs">{card.year}</span>
                          {card.rookie && <span className="text-yellow-400 text-xs">RC</span>}
                        </div>
                      </div>
                      <span className="text-emerald-400 text-sm font-medium">${val}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {selectedCard && (
          <div className={`mt-4 rounded-xl border p-4 ${SPORT_BG[selectedCard.sport] || 'bg-gray-800/50 border-gray-700'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold">{selectedCard.name}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`text-sm ${SPORT_COLORS[selectedCard.sport] || 'text-gray-400'}`}>
                    {SPORT_ICONS[selectedCard.sport]} {selectedCard.sport} &middot; {selectedCard.year}
                  </span>
                  {selectedCard.rookie && <span className="text-yellow-400 text-xs bg-yellow-950/50 px-2 py-0.5 rounded-full">Rookie</span>}
                </div>
              </div>
              <div className="text-right">
                <div className="text-emerald-400 font-bold text-lg">${parseValue(selectedCard.estimatedValueRaw)}</div>
                <div className="text-gray-500 text-xs">raw value</div>
              </div>
            </div>
            <button onClick={() => { setSelectedCard(null); setQuery(''); setShowResults(false); }} className="mt-2 text-gray-500 hover:text-gray-300 text-xs">
              Change card
            </button>
          </div>
        )}
      </div>

      {/* Budget & Horizon */}
      {selectedCard && (
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">2. Set Your DCA Plan</h2>

          <div className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Monthly Budget</label>
              <div className="flex flex-wrap gap-2">
                {BUDGET_OPTIONS.map(b => (
                  <button
                    key={b}
                    onClick={() => { setMonthlyBudget(b); setCustomBudget(''); }}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      !customBudget && monthlyBudget === b
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white border border-gray-700'
                    }`}
                  >
                    ${b}/mo
                  </button>
                ))}
                <input
                  type="number"
                  placeholder="Custom $"
                  value={customBudget}
                  onChange={(e) => setCustomBudget(e.target.value)}
                  className="w-28 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-gray-400 text-sm mb-2 block">Time Horizon</label>
              <div className="flex flex-wrap gap-2">
                {HORIZON_OPTIONS.map(h => (
                  <button
                    key={h}
                    onClick={() => setHorizon(h)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      horizon === h
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white border border-gray-700'
                    }`}
                  >
                    {h} months
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleCalculate}
              disabled={!activeBudget || activeBudget <= 0}
              className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold rounded-xl transition-colors"
            >
              Calculate DCA Strategy
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {showResults && result && selectedCard && (
        <>
          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Cards Accumulated', value: result.totalCards.toFixed(1), sub: `~${Math.floor(result.totalCards)} whole cards` },
              { label: 'Total Invested', value: fmt(result.totalSpent), sub: `${horizon} months @ $${activeBudget}/mo` },
              { label: 'Avg Cost Basis', value: fmt(result.avgCostBasis), sub: `vs ${fmt(parseValue(selectedCard.estimatedValueRaw))} start` },
              { label: 'Portfolio Value', value: fmt(result.finalValue), sub: fmtPct(result.totalReturnPct), color: result.totalReturn >= 0 ? 'text-emerald-400' : 'text-red-400' },
            ].map(s => (
              <div key={s.label} className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 text-center">
                <div className="text-gray-500 text-xs mb-1">{s.label}</div>
                <div className={`text-xl font-bold ${(s as { color?: string }).color || 'text-white'}`}>{s.value}</div>
                <div className={`text-xs mt-0.5 ${(s as { color?: string }).color || 'text-gray-500'}`}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* DCA vs Lump-Sum Comparison */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">DCA vs Lump-Sum</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className={`rounded-xl border p-4 ${result.dcaWins ? 'border-emerald-700 bg-emerald-950/30' : 'border-gray-700 bg-gray-800/50'}`}>
                <div className="flex items-center gap-2 mb-3">
                  {result.dcaWins && <span className="text-emerald-400 text-xs font-bold bg-emerald-950/60 px-2 py-0.5 rounded-full">WINNER</span>}
                  <h3 className="text-white font-bold">Dollar-Cost Average</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-400">Total Invested</span><span className="text-white">{fmt(result.totalSpent)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Cards Bought</span><span className="text-white">{result.totalCards.toFixed(1)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Avg Cost/Card</span><span className="text-white">{fmt(result.avgCostBasis)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Final Value</span><span className="text-white">{fmt(result.finalValue)}</span></div>
                  <div className="flex justify-between border-t border-gray-700 pt-2">
                    <span className="text-gray-400 font-medium">Return</span>
                    <span className={result.totalReturn >= 0 ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                      {fmt(result.totalReturn)} ({fmtPct(result.totalReturnPct)})
                    </span>
                  </div>
                </div>
              </div>

              <div className={`rounded-xl border p-4 ${!result.dcaWins ? 'border-emerald-700 bg-emerald-950/30' : 'border-gray-700 bg-gray-800/50'}`}>
                <div className="flex items-center gap-2 mb-3">
                  {!result.dcaWins && <span className="text-emerald-400 text-xs font-bold bg-emerald-950/60 px-2 py-0.5 rounded-full">WINNER</span>}
                  <h3 className="text-white font-bold">Lump-Sum Buy</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-400">Total Invested</span><span className="text-white">{fmt(result.totalSpent)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Cards Bought</span><span className="text-white">{result.lumpSumCards.toFixed(1)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Cost/Card</span><span className="text-white">{fmt(parseValue(selectedCard.estimatedValueRaw))}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Final Value</span><span className="text-white">{fmt(result.lumpSumValue)}</span></div>
                  <div className="flex justify-between border-t border-gray-700 pt-2">
                    <span className="text-gray-400 font-medium">Return</span>
                    <span className={result.lumpSumReturn >= 0 ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                      {fmt(result.lumpSumReturn)} ({fmtPct(result.lumpSumReturnPct)})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className={`mt-4 rounded-xl p-4 text-sm ${result.dcaWins ? 'bg-indigo-950/30 border border-indigo-800/50' : 'bg-amber-950/30 border border-amber-800/50'}`}>
              {result.dcaWins ? (
                <p className="text-indigo-300">
                  <strong>DCA wins by {(result.totalReturnPct - result.lumpSumReturnPct).toFixed(1)}%.</strong> The card&apos;s volatility ({result.volatility.toFixed(0)}% monthly) means DCA captured better average prices by buying more during dips. This is typical for {selectedCard.year >= 2015 ? 'modern' : 'vintage'} {selectedCard.sport} cards.
                </p>
              ) : (
                <p className="text-amber-300">
                  <strong>Lump-sum wins by {(result.lumpSumReturnPct - result.totalReturnPct).toFixed(1)}%.</strong> The card&apos;s steady appreciation ({result.appreciation.toFixed(0)}%/year) meant buying early captured more upside. Lump-sum tends to win for {selectedCard.year < 2000 ? 'vintage' : 'stable'} cards with consistent demand.
                </p>
              )}
            </div>
          </div>

          {/* Price vs Cost Basis Chart */}
          {chartData && (
            <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">Price vs Your Cost Basis</h2>
              <div className="overflow-x-auto">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full max-w-2xl mx-auto" preserveAspectRatio="xMidYMid meet">
                  {/* Grid lines */}
                  {[0.25, 0.5, 0.75].map(pct => {
                    const y = chartPadding + (chartHeight - chartPadding * 2) * (1 - pct);
                    const val = chartData.minVal + (chartData.maxVal - chartData.minVal) * pct;
                    return (
                      <g key={pct}>
                        <line x1={chartPadding} y1={y} x2={chartWidth - chartPadding} y2={y} stroke="#374151" strokeWidth="0.5" strokeDasharray="4,4" />
                        <text x={chartPadding - 4} y={y + 3} fill="#6b7280" fontSize="9" textAnchor="end">{fmt(val)}</text>
                      </g>
                    );
                  })}

                  {/* Month labels */}
                  {result.months.filter((_, i) => i % Math.max(1, Math.floor(result.months.length / 6)) === 0 || i === result.months.length - 1).map((m, _idx) => {
                    const x = chartData.toX(m.month - 1);
                    return (
                      <text key={m.month} x={x} y={chartHeight - 8} fill="#6b7280" fontSize="9" textAnchor="middle">
                        M{m.month}
                      </text>
                    );
                  })}

                  {/* Market price line */}
                  <path d={chartData.pricePath} fill="none" stroke="#818cf8" strokeWidth="2" />

                  {/* Avg cost basis line */}
                  <path d={chartData.avgPath} fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="6,3" />

                  {/* Legend */}
                  <line x1={chartPadding} y1={12} x2={chartPadding + 20} y2={12} stroke="#818cf8" strokeWidth="2" />
                  <text x={chartPadding + 24} y={15} fill="#818cf8" fontSize="10">Market Price</text>

                  <line x1={chartPadding + 120} y1={12} x2={chartPadding + 140} y2={12} stroke="#f59e0b" strokeWidth="2" strokeDasharray="6,3" />
                  <text x={chartPadding + 144} y={15} fill="#f59e0b" fontSize="10">Your Avg Cost</text>
                </svg>
              </div>
              <p className="text-gray-500 text-xs text-center mt-2">
                When the blue line (market) is above the dashed line (your cost), you&apos;re in profit.
              </p>
            </div>
          )}

          {/* Monthly Breakdown */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Monthly Breakdown</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 text-xs border-b border-gray-800">
                    <th className="text-left py-2 px-2">Month</th>
                    <th className="text-right py-2 px-2">Price</th>
                    <th className="text-right py-2 px-2">Bought</th>
                    <th className="text-right py-2 px-2">Total Cards</th>
                    <th className="text-right py-2 px-2">Avg Cost</th>
                    <th className="text-right py-2 px-2">Value</th>
                    <th className="text-right py-2 px-2">P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {result.months.map(m => (
                    <tr key={m.month} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="py-2 px-2 text-gray-400">M{m.month}</td>
                      <td className="py-2 px-2 text-right text-white">{fmt(m.price)}</td>
                      <td className="py-2 px-2 text-right text-gray-300">{m.bought.toFixed(2)}</td>
                      <td className="py-2 px-2 text-right text-gray-300">{m.totalCards.toFixed(1)}</td>
                      <td className="py-2 px-2 text-right text-amber-400">{fmt(m.avgCost)}</td>
                      <td className="py-2 px-2 text-right text-white">{fmt(m.portfolioValue)}</td>
                      <td className={`py-2 px-2 text-right font-medium ${m.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {fmtPct(m.pnlPct)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card-Specific Insights */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Investment Profile</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                <div className="text-gray-500 text-xs mb-1">Monthly Volatility</div>
                <div className={`text-2xl font-bold ${result.volatility > 10 ? 'text-red-400' : result.volatility > 7 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {result.volatility.toFixed(1)}%
                </div>
                <div className="text-gray-500 text-xs mt-1">
                  {result.volatility > 10 ? 'High — DCA recommended' : result.volatility > 7 ? 'Moderate — DCA helpful' : 'Low — Lump-sum may win'}
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                <div className="text-gray-500 text-xs mb-1">Expected Annual Return</div>
                <div className="text-2xl font-bold text-indigo-400">{result.appreciation.toFixed(1)}%</div>
                <div className="text-gray-500 text-xs mt-1">
                  Based on {selectedCard.year < 1950 ? 'pre-war' : selectedCard.year < 1980 ? 'vintage' : selectedCard.year < 2010 ? 'modern' : 'ultra-modern'} era trends
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                <div className="text-gray-500 text-xs mb-1">DCA Verdict</div>
                <div className={`text-2xl font-bold ${result.dcaWins ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {result.dcaWins ? 'DCA Wins' : 'Lump-Sum'}
                </div>
                <div className="text-gray-500 text-xs mt-1">
                  By {Math.abs(result.totalReturnPct - result.lumpSumReturnPct).toFixed(1)}% over {horizon} months
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Empty State */}
      {!selectedCard && (
        <div className="bg-gray-900/60 border border-gray-800 border-dashed rounded-2xl p-12 text-center">
          <div className="text-4xl mb-4">📈</div>
          <h3 className="text-white font-bold text-lg mb-2">Search for a Card to Start</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Enter a player name or card name above to plan your dollar-cost averaging strategy. Works best for cards valued $20+ with active markets.
          </p>
          <div className="flex flex-wrap gap-2 justify-center mt-4">
            {['Mike Trout', 'Victor Wembanyama', 'Patrick Mahomes', 'Connor McDavid'].map(name => (
              <button
                key={name}
                onClick={() => setQuery(name)}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white border border-gray-700 rounded-lg text-xs transition-colors"
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
