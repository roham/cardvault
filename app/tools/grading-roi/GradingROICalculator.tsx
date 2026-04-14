'use client';

import { useState, useMemo } from 'react';

interface GradingTier {
  name: string;
  cost: number;
  turnaround: string;
}

interface GradingCompany {
  id: string;
  name: string;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  tiers: GradingTier[];
  shippingCost: number;
  // Premium multiplier relative to raw at each grade level
  // Index 0 = grade 1, index 9 = grade 10
  gradeMultipliers: number[];
  // Market premium vs other companies (PSA = 1.0 baseline)
  marketPremium: number;
}

const gradingCompanies: GradingCompany[] = [
  {
    id: 'psa',
    name: 'PSA',
    label: 'Professional Sports Authenticator',
    color: 'text-red-400',
    bgColor: 'bg-red-950/30',
    borderColor: 'border-red-800/50',
    shippingCost: 18,
    tiers: [
      { name: 'Economy', cost: 20, turnaround: '65+ business days' },
      { name: 'Regular', cost: 50, turnaround: '30 business days' },
      { name: 'Express', cost: 100, turnaround: '10 business days' },
      { name: 'Super Express', cost: 200, turnaround: '5 business days' },
    ],
    gradeMultipliers: [0.4, 0.5, 0.6, 0.75, 0.9, 1.1, 1.4, 2.0, 3.5, 5.5],
    marketPremium: 1.0,
  },
  {
    id: 'cgc',
    name: 'CGC',
    label: 'Certified Guaranty Company',
    color: 'text-blue-400',
    bgColor: 'bg-blue-950/30',
    borderColor: 'border-blue-800/50',
    shippingCost: 16,
    tiers: [
      { name: 'Value', cost: 15, turnaround: '50+ business days' },
      { name: 'Standard', cost: 30, turnaround: '30 business days' },
      { name: 'Express', cost: 65, turnaround: '10 business days' },
      { name: 'Premium', cost: 150, turnaround: '5 business days' },
    ],
    gradeMultipliers: [0.35, 0.45, 0.55, 0.7, 0.85, 1.05, 1.3, 1.8, 3.0, 4.8],
    marketPremium: 0.85,
  },
  {
    id: 'sgc',
    name: 'SGC',
    label: 'Sportscard Guaranty Corporation',
    color: 'text-amber-400',
    bgColor: 'bg-amber-950/30',
    borderColor: 'border-amber-800/50',
    shippingCost: 15,
    tiers: [
      { name: 'Economy', cost: 20, turnaround: '45+ business days' },
      { name: 'Standard', cost: 30, turnaround: '20 business days' },
      { name: 'Express', cost: 50, turnaround: '5 business days' },
      { name: 'Premium', cost: 100, turnaround: '2 business days' },
    ],
    gradeMultipliers: [0.35, 0.45, 0.55, 0.7, 0.85, 1.0, 1.25, 1.7, 2.8, 4.5],
    marketPremium: 0.80,
  },
];

const gradeLabels: Record<number, string> = {
  1: 'Poor (1)',
  2: 'Good (2)',
  3: 'Very Good (3)',
  4: 'VG-EX (4)',
  5: 'Excellent (5)',
  6: 'EX-MT (6)',
  7: 'Near Mint (7)',
  8: 'NM-MT (8)',
  9: 'Mint (9)',
  10: 'Gem Mint (10)',
};

function formatCurrency(value: number): string {
  if (value >= 1000) return `$${(value / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return `$${Math.round(value).toLocaleString()}`;
}

function formatCurrencyExact(value: number): string {
  return `$${Math.round(value).toLocaleString()}`;
}

export default function GradingROICalculator() {
  const [rawValue, setRawValue] = useState<string>('100');
  const [selectedCompany, setSelectedCompany] = useState<string>('psa');
  const [selectedTier, setSelectedTier] = useState<number>(0);
  const [expectedGrade, setExpectedGrade] = useState<number>(9);
  const [cardType, setCardType] = useState<'sports' | 'pokemon'>('sports');

  const rawNum = useMemo(() => {
    const n = parseFloat(rawValue.replace(/[,$]/g, ''));
    return isNaN(n) || n < 0 ? 0 : n;
  }, [rawValue]);

  const company = gradingCompanies.find(c => c.id === selectedCompany)!;
  const tier = company.tiers[selectedTier];

  const results = useMemo(() => {
    if (rawNum === 0) return null;

    const totalCost = tier.cost + company.shippingCost;
    const multiplier = company.gradeMultipliers[expectedGrade - 1];
    // Pokemon cards have slightly different multipliers for CGC (CGC is preferred for Pokemon)
    const pokemonBonus = cardType === 'pokemon' && company.id === 'cgc' ? 1.1 : 1.0;
    const estimatedGradedValue = rawNum * multiplier * company.marketPremium * pokemonBonus;
    const profit = estimatedGradedValue - rawNum - totalCost;
    const roi = ((profit) / totalCost) * 100;
    const breakEvenMultiplier = (rawNum + totalCost) / rawNum;

    // Find break-even grade (lowest grade where grading is profitable)
    let breakEvenGrade = -1;
    for (let g = 1; g <= 10; g++) {
      const gradedVal = rawNum * company.gradeMultipliers[g - 1] * company.marketPremium * pokemonBonus;
      if (gradedVal > rawNum + totalCost) {
        breakEvenGrade = g;
        break;
      }
    }

    // All companies comparison at the selected grade
    const comparison = gradingCompanies.map(c => {
      const cTier = c.tiers[Math.min(selectedTier, c.tiers.length - 1)];
      const cCost = cTier.cost + c.shippingCost;
      const cBonus = cardType === 'pokemon' && c.id === 'cgc' ? 1.1 : 1.0;
      const cGradedValue = rawNum * c.gradeMultipliers[expectedGrade - 1] * c.marketPremium * cBonus;
      const cProfit = cGradedValue - rawNum - cCost;
      const cRoi = (cProfit / cCost) * 100;
      return {
        company: c,
        tier: cTier,
        totalCost: cCost,
        gradedValue: cGradedValue,
        profit: cProfit,
        roi: cRoi,
      };
    });

    return {
      totalCost,
      estimatedGradedValue,
      profit,
      roi,
      breakEvenMultiplier,
      breakEvenGrade,
      comparison,
    };
  }, [rawNum, company, tier, expectedGrade, cardType, selectedTier]);

  return (
    <div className="space-y-8">
      {/* Input section */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-6">Card Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Card Type */}
          <div>
            <label className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-2 block">Card Type</label>
            <div className="flex gap-2">
              {[
                { id: 'sports' as const, label: 'Sports Card', icon: '🏆' },
                { id: 'pokemon' as const, label: 'Pokemon', icon: '⚡' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setCardType(t.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    cardType === t.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
                  }`}
                >
                  <span>{t.icon}</span> {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Raw Value */}
          <div>
            <label className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-2 block">
              Estimated Raw Value (USD)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
              <input
                type="text"
                value={rawValue}
                onChange={(e) => setRawValue(e.target.value.replace(/[^0-9.,]/g, ''))}
                placeholder="100"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-8 pr-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <p className="text-gray-600 text-xs mt-1">Based on recent eBay sold comps for the ungraded card</p>
          </div>

          {/* Grading Company */}
          <div>
            <label className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-2 block">
              Grading Company
            </label>
            <div className="flex gap-2">
              {gradingCompanies.map(c => (
                <button
                  key={c.id}
                  onClick={() => { setSelectedCompany(c.id); setSelectedTier(0); }}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    selectedCompany === c.id
                      ? `${c.bgColor} ${c.borderColor} border ${c.color}`
                      : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Service Tier */}
          <div>
            <label className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-2 block">
              Service Level
            </label>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(Number(e.target.value))}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {company.tiers.map((t, i) => (
                <option key={i} value={i}>
                  {t.name} — ${t.cost}/card ({t.turnaround})
                </option>
              ))}
            </select>
          </div>

          {/* Expected Grade */}
          <div className="sm:col-span-2">
            <label className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-2 block">
              Expected Grade: <span className="text-white font-bold">{gradeLabels[expectedGrade]}</span>
            </label>
            <input
              type="range"
              min={1}
              max={10}
              value={expectedGrade}
              onChange={(e) => setExpectedGrade(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1 px-1">
              {Array.from({ length: 10 }, (_, i) => (
                <span key={i + 1} className={expectedGrade === i + 1 ? 'text-emerald-400 font-bold' : ''}>
                  {i + 1}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {results && rawNum > 0 && (
        <>
          {/* Primary result */}
          <div className={`rounded-2xl p-6 border ${results.profit >= 0 ? 'bg-emerald-950/20 border-emerald-800/50' : 'bg-red-950/20 border-red-800/50'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${results.profit >= 0 ? 'bg-emerald-900/50' : 'bg-red-900/50'}`}>
                {results.profit >= 0 ? '✅' : '❌'}
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">
                  {results.profit >= 0 ? 'Grading is likely profitable' : 'Grading may not be worth it'}
                </h3>
                <p className="text-gray-400 text-sm">
                  {company.name} {gradeLabels[expectedGrade]} · {tier.name} service
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-gray-900/50 rounded-xl p-4">
                <p className="text-gray-500 text-xs mb-1">Total Grading Cost</p>
                <p className="text-white font-bold text-lg">{formatCurrencyExact(results.totalCost)}</p>
                <p className="text-gray-600 text-xs">${tier.cost} + ${company.shippingCost} ship</p>
              </div>
              <div className="bg-gray-900/50 rounded-xl p-4">
                <p className="text-gray-500 text-xs mb-1">Est. Graded Value</p>
                <p className="text-emerald-400 font-bold text-lg">{formatCurrencyExact(results.estimatedGradedValue)}</p>
                <p className="text-gray-600 text-xs">{company.name} {expectedGrade}</p>
              </div>
              <div className="bg-gray-900/50 rounded-xl p-4">
                <p className="text-gray-500 text-xs mb-1">Expected Profit</p>
                <p className={`font-bold text-lg ${results.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {results.profit >= 0 ? '+' : ''}{formatCurrencyExact(results.profit)}
                </p>
                <p className="text-gray-600 text-xs">after grading costs</p>
              </div>
              <div className="bg-gray-900/50 rounded-xl p-4">
                <p className="text-gray-500 text-xs mb-1">ROI</p>
                <p className={`font-bold text-lg ${results.roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {results.roi >= 0 ? '+' : ''}{Math.round(results.roi)}%
                </p>
                <p className="text-gray-600 text-xs">
                  {results.breakEvenGrade > 0
                    ? `Break-even: grade ${results.breakEvenGrade}+`
                    : 'No profitable grade'}
                </p>
              </div>
            </div>

            {/* Grade-by-grade breakdown for selected company */}
            <div className="mt-6">
              <h4 className="text-white font-semibold text-sm mb-3">Grade-by-Grade Breakdown ({company.name})</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left text-gray-500 py-2 px-3">Grade</th>
                      <th className="text-right text-gray-500 py-2 px-3">Est. Value</th>
                      <th className="text-right text-gray-500 py-2 px-3">Profit</th>
                      <th className="text-right text-gray-500 py-2 px-3">ROI</th>
                      <th className="text-left text-gray-500 py-2 px-3">Verdict</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 10 }, (_, i) => {
                      const grade = i + 1;
                      const pokemonBonus = cardType === 'pokemon' && company.id === 'cgc' ? 1.1 : 1.0;
                      const gradedVal = rawNum * company.gradeMultipliers[i] * company.marketPremium * pokemonBonus;
                      const profit = gradedVal - rawNum - results.totalCost;
                      const roi = (profit / results.totalCost) * 100;
                      const isSelected = grade === expectedGrade;
                      return (
                        <tr
                          key={grade}
                          className={`border-b border-gray-800/30 ${isSelected ? 'bg-emerald-950/20' : ''}`}
                        >
                          <td className={`py-2 px-3 font-medium ${isSelected ? 'text-emerald-400' : 'text-gray-300'}`}>
                            {gradeLabels[grade]}
                            {isSelected && ' ←'}
                          </td>
                          <td className="py-2 px-3 text-right text-gray-300">{formatCurrency(gradedVal)}</td>
                          <td className={`py-2 px-3 text-right font-medium ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {profit >= 0 ? '+' : ''}{formatCurrency(profit)}
                          </td>
                          <td className={`py-2 px-3 text-right ${roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {roi >= 0 ? '+' : ''}{Math.round(roi)}%
                          </td>
                          <td className="py-2 px-3">
                            {profit >= 100 ? (
                              <span className="text-emerald-400">Worth it</span>
                            ) : profit >= 0 ? (
                              <span className="text-yellow-400">Marginal</span>
                            ) : (
                              <span className="text-red-400">Not worth it</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Company Comparison */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-white font-bold text-lg mb-4">Company Comparison at Grade {expectedGrade}</h3>
            <p className="text-gray-400 text-sm mb-4">
              Same card, same expected grade — different grading companies. PSA commands the highest market premium but costs more.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {results.comparison.map(c => {
                const isBest = c.profit === Math.max(...results.comparison.map(x => x.profit));
                return (
                  <div
                    key={c.company.id}
                    className={`border rounded-xl p-4 ${isBest ? `${c.company.borderColor} ${c.company.bgColor}` : 'border-gray-800 bg-gray-900/50'}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className={`font-bold ${c.company.color}`}>{c.company.name}</h4>
                      {isBest && (
                        <span className="text-xs bg-emerald-900/50 text-emerald-400 px-2 py-0.5 rounded-full font-medium">Best ROI</span>
                      )}
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Grading cost</span>
                        <span className="text-gray-300">{formatCurrencyExact(c.totalCost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Graded value</span>
                        <span className="text-gray-300">{formatCurrencyExact(c.gradedValue)}</span>
                      </div>
                      <div className="flex justify-between border-t border-gray-800 pt-2">
                        <span className="text-gray-500">Profit</span>
                        <span className={`font-bold ${c.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {c.profit >= 0 ? '+' : ''}{formatCurrencyExact(c.profit)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">ROI</span>
                        <span className={`font-bold ${c.roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {c.roi >= 0 ? '+' : ''}{Math.round(c.roi)}%
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-xs mt-3">
                      {c.tier.name} · {c.tier.turnaround}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pro Tips */}
          <div className="bg-amber-950/20 border border-amber-800/30 rounded-xl p-5">
            <h3 className="text-amber-300 font-semibold text-sm mb-3">Pro Tips for Maximizing Grading ROI</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { tip: 'Batch submissions', detail: 'Submit 10+ cards at once to split the shipping cost. A $15 shipping cost on 1 card = $15 each. On 10 cards = $1.50 each.' },
                { tip: 'Be realistic about grade', detail: 'Most cards don\'t get a 10. Research PSA pop reports — if 50% of submissions get a 9, that\'s your likely grade.' },
                { tip: 'Economy tier for lower-value cards', detail: 'If ROI is marginal, the cheapest tier maximizes your profit. Wait time is the tradeoff.' },
                { tip: 'Check the market first', detail: 'Use eBay sold listings to verify the graded price before submitting. Multipliers vary wildly by card.' },
              ].map(t => (
                <div key={t.tip} className="flex items-start gap-2">
                  <span className="text-amber-500 shrink-0 mt-0.5">*</span>
                  <div>
                    <p className="text-amber-200 text-sm font-medium">{t.tip}</p>
                    <p className="text-amber-400/60 text-xs mt-0.5">{t.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
