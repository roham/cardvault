'use client';

import { useState, useMemo } from 'react';

interface GradeTier {
  label: string;
  psa: string;
  bgs: string;
  multiplier: number;
  description: string;
  color: string;
  textColor: string;
}

const gradeTiers: GradeTier[] = [
  {
    label: 'Gem Mint',
    psa: 'PSA 10',
    bgs: 'BGS 9.5–10',
    multiplier: 12,
    description: 'Perfect card — top 1–3% of all submissions. Massive premium.',
    color: 'from-yellow-900/40 to-amber-900/20',
    textColor: 'text-yellow-400',
  },
  {
    label: 'Mint',
    psa: 'PSA 9',
    bgs: 'BGS 9',
    multiplier: 4,
    description: 'Near-perfect, minor flaws under magnification. Sweet spot for most collectors.',
    color: 'from-emerald-900/40 to-teal-900/20',
    textColor: 'text-emerald-400',
  },
  {
    label: 'Near Mint-Mint',
    psa: 'PSA 8',
    bgs: 'BGS 8.5',
    multiplier: 1.8,
    description: 'Slight corner/edge wear. Most common graded condition in circulation.',
    color: 'from-blue-900/40 to-indigo-900/20',
    textColor: 'text-blue-400',
  },
  {
    label: 'Near Mint',
    psa: 'PSA 7',
    bgs: 'BGS 8',
    multiplier: 1,
    description: 'Light visible wear. This is your baseline — other grades multiply from here.',
    color: 'from-gray-800/60 to-gray-900/40',
    textColor: 'text-gray-300',
  },
  {
    label: 'Excellent-Mint',
    psa: 'PSA 6',
    bgs: 'BGS 7.5',
    multiplier: 0.55,
    description: 'Moderate wear, still attractive. Value driven primarily by card rarity.',
    color: 'from-orange-900/30 to-red-900/20',
    textColor: 'text-orange-400',
  },
  {
    label: 'Excellent',
    psa: 'PSA 5',
    bgs: 'BGS 7',
    multiplier: 0.3,
    description: 'Noticeable wear. Collector grade only — avoid for investment.',
    color: 'from-red-900/30 to-rose-900/20',
    textColor: 'text-red-400',
  },
];

function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }
  return `$${value.toFixed(0)}`;
}

export default function GradeCalculator() {
  const [baseValue, setBaseValue] = useState('');
  const [baseGrade, setBaseGrade] = useState<string>('psa7');

  const parsedBase = useMemo(() => {
    const cleaned = baseValue.replace(/[$,]/g, '').trim();
    const num = parseFloat(cleaned);
    return isNaN(num) || num <= 0 ? null : num;
  }, [baseValue]);

  // Normalize base to PSA 7 equivalent
  const normalizedBase = useMemo(() => {
    if (!parsedBase) return null;
    const gradeMultiplierMap: Record<string, number> = {
      raw: 0.6,
      psa6: 0.55,
      psa7: 1,
      psa8: 1.8,
      psa9: 4,
      psa10: 12,
    };
    const m = gradeMultiplierMap[baseGrade] ?? 1;
    return parsedBase / m;
  }, [parsedBase, baseGrade]);

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-5">Enter your card&apos;s known value</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-400 text-sm mb-2">
              Card value (USD)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input
                type="text"
                value={baseValue}
                onChange={e => setBaseValue(e.target.value)}
                placeholder="e.g. 250"
                className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl pl-7 pr-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-2">
              Known grade / condition
            </label>
            <select
              value={baseGrade}
              onChange={e => setBaseGrade(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            >
              <option value="raw">Raw (ungraded)</option>
              <option value="psa6">PSA 6 / BGS 7.5</option>
              <option value="psa7">PSA 7 / BGS 8 (Near Mint)</option>
              <option value="psa8">PSA 8 / BGS 8.5 (NM-Mint)</option>
              <option value="psa9">PSA 9 / BGS 9 (Mint)</option>
              <option value="psa10">PSA 10 / BGS 9.5 (Gem)</option>
            </select>
          </div>
        </div>
        {parsedBase && (
          <p className="text-gray-500 text-xs mt-3">
            Normalized PSA 7 baseline: <span className="text-gray-300">{normalizedBase ? formatCurrency(normalizedBase) : '—'}</span>
            {' '}· Multipliers applied from this base.
          </p>
        )}
      </div>

      {/* Grade Tiers */}
      {normalizedBase ? (
        <div className="space-y-3">
          <p className="text-gray-400 text-sm">Estimated value across all grade tiers:</p>
          {gradeTiers.map(tier => {
            const estimated = normalizedBase * tier.multiplier;
            const isBase = (baseGrade === 'psa7' && tier.psa === 'PSA 7') ||
                           (baseGrade === 'psa8' && tier.psa === 'PSA 8') ||
                           (baseGrade === 'psa9' && tier.psa === 'PSA 9') ||
                           (baseGrade === 'psa10' && tier.psa === 'PSA 10') ||
                           (baseGrade === 'psa6' && tier.psa === 'PSA 6');

            return (
              <div
                key={tier.label}
                className={`relative flex items-start gap-4 bg-gradient-to-br ${tier.color} border ${isBase ? 'border-emerald-500/60' : 'border-gray-800'} rounded-xl p-4 transition-all`}
              >
                {isBase && (
                  <span className="absolute top-3 right-3 text-xs bg-emerald-600 text-white px-2 py-0.5 rounded-full font-medium">
                    Your input
                  </span>
                )}
                <div className="shrink-0 w-20 text-center">
                  <p className={`font-bold text-lg ${tier.textColor}`}>{formatCurrency(estimated)}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{tier.psa}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-white text-sm font-semibold">{tier.label}</span>
                    <span className="text-gray-500 text-xs">{tier.bgs}</span>
                    <span className="text-gray-600 text-xs">{tier.multiplier}x base</span>
                  </div>
                  <p className="text-gray-400 text-xs leading-relaxed">{tier.description}</p>
                </div>
              </div>
            );
          })}
          <div className="bg-amber-950/20 border border-amber-800/30 rounded-xl px-4 py-3 mt-2">
            <p className="text-amber-300/80 text-xs">
              <strong>Disclaimer:</strong> These are estimates based on general hobby market multipliers. Individual cards — especially vintage, ultra-rare, or player-specific — can vary dramatically. Verify with recent eBay sold comps before making financial decisions.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-gray-400 text-sm">Enter a card value above to see estimated prices across all grade tiers.</p>
          <p className="text-gray-500 text-xs mt-2">Example: Enter &ldquo;$250&rdquo; at PSA 8 to see what the same card might be worth at PSA 9 or PSA 10.</p>
        </div>
      )}
    </div>
  );
}
