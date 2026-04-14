'use client';

import { useState, useMemo } from 'react';

interface CollectionTier {
  id: string;
  label: string;
  description: string;
  count: number;
  avgValue: number;
}

const defaultTiers: CollectionTier[] = [
  { id: 'high', label: 'High-Value Cards ($500+)', description: 'Graded gems, vintage keys, rare parallels', count: 0, avgValue: 1500 },
  { id: 'mid', label: 'Mid-Value Cards ($50-$499)', description: 'Graded rookies, numbered cards, popular players', count: 0, avgValue: 150 },
  { id: 'low', label: 'Low-Value Cards ($10-$49)', description: 'Raw rookies, base holos, common graded cards', count: 0, avgValue: 25 },
  { id: 'bulk', label: 'Bulk/Base Cards (<$10)', description: 'Base cards, commons, unsorted lots', count: 0, avgValue: 0.50 },
];

const storageMethods = [
  { id: 'safe', label: 'Fire-rated safe', discount: 0.15, desc: '-15% premium' },
  { id: 'vault', label: 'Bank vault / safe deposit', discount: 0.20, desc: '-20% premium' },
  { id: 'closet', label: 'Home closet / shelf', discount: 0, desc: 'Standard rate' },
  { id: 'none', label: 'No special storage', discount: -0.10, desc: '+10% premium' },
];

export default function InsuranceCalculator() {
  const [tiers, setTiers] = useState(defaultTiers);
  const [storage, setStorage] = useState('closet');
  const [percentGraded, setPercentGraded] = useState(30);

  const updateTier = (id: string, field: 'count' | 'avgValue', value: number) => {
    setTiers(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const analysis = useMemo(() => {
    const tierValues = tiers.map(t => ({
      ...t,
      totalValue: t.count * t.avgValue,
    }));

    const totalMarketValue = tierValues.reduce((sum, t) => sum + t.totalValue, 0);
    const totalCards = tiers.reduce((sum, t) => sum + t.count, 0);

    if (totalMarketValue === 0) return null;

    // Replacement cost is 15% above market value (buying premium, fees, shipping)
    const replacementCost = totalMarketValue * 1.15;

    // Recommended coverage: round up to nearest $1,000
    const recommendedCoverage = Math.ceil(replacementCost / 1000) * 1000;

    // Base rate: $14 per $1,000 of coverage per year (1.4%)
    const baseRate = 0.014;
    const storageMethod = storageMethods.find(s => s.id === storage);
    const storageDiscount = storageMethod?.discount || 0;

    // Graded cards lower risk (harder to counterfeit, easier to appraise)
    const gradedDiscount = (percentGraded / 100) * 0.05; // up to 5% discount

    const adjustedRate = baseRate * (1 - storageDiscount - gradedDiscount);
    const annualPremium = recommendedCoverage * adjustedRate;
    const monthlyPremium = annualPremium / 12;

    // Coverage tiers
    const coverageTiers = [
      { name: 'Basic', coverage: Math.ceil(totalMarketValue / 1000) * 1000, desc: 'Market value only' },
      { name: 'Recommended', coverage: recommendedCoverage, desc: 'Replacement cost + buffer' },
      { name: 'Premium', coverage: Math.ceil(replacementCost * 1.25 / 1000) * 1000, desc: 'Full replacement + appreciation' },
    ];

    return {
      tierValues,
      totalMarketValue,
      totalCards,
      replacementCost,
      recommendedCoverage,
      annualPremium,
      monthlyPremium,
      adjustedRate,
      coverageTiers,
    };
  }, [tiers, storage, percentGraded]);

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Your Collection</h2>
        <p className="text-zinc-400 text-sm mb-6">
          Enter the number of cards and average value per tier. Be honest — underinsuring hurts you in a claim.
        </p>

        <div className="space-y-4">
          {tiers.map(tier => (
            <div key={tier.id} className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="text-white font-medium text-sm">{tier.label}</div>
                  <div className="text-zinc-500 text-xs">{tier.description}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div>
                    <label className="text-zinc-500 text-xs block mb-1">Cards</label>
                    <input
                      type="number"
                      value={tier.count || ''}
                      onChange={e => updateTier(tier.id, 'count', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="w-24 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-500 text-xs block mb-1">Avg Value</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                      <input
                        type="number"
                        value={tier.avgValue || ''}
                        onChange={e => updateTier(tier.id, 'avgValue', parseFloat(e.target.value) || 0)}
                        className="w-28 bg-zinc-900 border border-zinc-700 rounded-lg pl-7 pr-3 py-2 text-white text-sm"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  <div className="w-28 text-right">
                    <label className="text-zinc-500 text-xs block mb-1">Subtotal</label>
                    <div className="text-amber-400 font-bold text-sm py-2">
                      ${(tier.count * tier.avgValue).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Storage & Grading */}
        <div className="grid sm:grid-cols-2 gap-4 mt-6">
          <div>
            <label className="text-zinc-400 text-sm block mb-2">Storage Method</label>
            <div className="space-y-2">
              {storageMethods.map(method => (
                <label key={method.id} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="storage"
                    value={method.id}
                    checked={storage === method.id}
                    onChange={e => setStorage(e.target.value)}
                    className="accent-violet-500"
                  />
                  <span className="text-white text-sm">{method.label}</span>
                  <span className="text-zinc-500 text-xs">{method.desc}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="text-zinc-400 text-sm block mb-2">
              Percent Graded: {percentGraded}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={percentGraded}
              onChange={e => setPercentGraded(parseInt(e.target.value))}
              className="w-full accent-violet-500"
            />
            <div className="flex justify-between text-zinc-600 text-xs mt-1">
              <span>0% raw</span>
              <span>100% graded</span>
            </div>
            <p className="text-zinc-500 text-xs mt-2">
              Graded cards are easier to appraise and harder to counterfeit, which can lower premiums.
            </p>
          </div>
        </div>
      </div>

      {/* Results */}
      {analysis && (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Insurance Estimate</h2>

          {/* Summary Cards */}
          <div className="grid sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Market Value', value: `$${analysis.totalMarketValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: 'text-white' },
              { label: 'Replacement Cost', value: `$${analysis.replacementCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: 'text-amber-400' },
              { label: 'Annual Premium', value: `$${analysis.annualPremium.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: 'text-violet-400' },
              { label: 'Monthly Premium', value: `$${analysis.monthlyPremium.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, color: 'text-violet-400' },
            ].map(item => (
              <div key={item.label} className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700/50 text-center">
                <div className="text-zinc-400 text-xs mb-1">{item.label}</div>
                <div className={`text-xl font-bold ${item.color}`}>{item.value}</div>
              </div>
            ))}
          </div>

          {/* Coverage Tiers */}
          <div className="mb-6">
            <h3 className="text-white font-medium mb-3">Coverage Options</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {analysis.coverageTiers.map((tier, i) => (
                <div
                  key={tier.name}
                  className={`rounded-xl p-5 border ${
                    i === 1
                      ? 'bg-violet-950/30 border-violet-800/50'
                      : 'bg-zinc-800/50 border-zinc-700/50'
                  }`}
                >
                  {i === 1 && (
                    <div className="text-violet-400 text-xs font-medium mb-2">RECOMMENDED</div>
                  )}
                  <div className="text-white font-semibold">{tier.name}</div>
                  <div className={`text-2xl font-bold mt-1 ${i === 1 ? 'text-violet-400' : 'text-white'}`}>
                    ${tier.coverage.toLocaleString()}
                  </div>
                  <div className="text-zinc-400 text-xs mt-1">{tier.desc}</div>
                  <div className="text-zinc-500 text-xs mt-2">
                    ~${(tier.coverage * analysis.adjustedRate).toLocaleString(undefined, { maximumFractionDigits: 0 })}/year
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Breakdown */}
          <div className="mb-6">
            <h3 className="text-white font-medium mb-3">Value Breakdown</h3>
            <div className="space-y-2">
              {analysis.tierValues.filter(t => t.totalValue > 0).map(tier => (
                <div key={tier.id} className="flex items-center gap-3">
                  <div className="flex-1 text-sm text-white">{tier.label}</div>
                  <div className="text-zinc-400 text-sm">{tier.count} cards</div>
                  <div className="w-32 bg-zinc-800 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-violet-500"
                      style={{ width: `${Math.min(100, (tier.totalValue / analysis.totalMarketValue) * 100)}%` }}
                    />
                  </div>
                  <div className="text-amber-400 text-sm w-24 text-right">
                    ${tier.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-zinc-800/30 rounded-lg p-4 border border-zinc-700/30">
            <h3 className="text-white font-medium text-sm mb-2">Insurance Tips</h3>
            <ul className="text-zinc-400 text-xs space-y-1">
              <li>- Document every card: photos, cert numbers for graded cards, purchase receipts</li>
              <li>- Update your inventory at least annually — card values change significantly</li>
              <li>- Get agreed-value coverage, not actual cash value (ACV depreciates)</li>
              <li>- Collectibles Insurance Services (collectinsure.com) specializes in card collections</li>
              <li>- Your homeowners policy likely has a $2,500-$5,000 collectibles sublimit — check it</li>
              <li>- Shipping insurance is separate — insure cards in transit through the carrier or your policy</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
