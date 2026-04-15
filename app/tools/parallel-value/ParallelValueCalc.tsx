'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

type Brand = 'topps_chrome' | 'prizm' | 'select' | 'optic' | 'bowman_chrome' | 'mosaic' | 'spectra' | 'flawless' | 'national_treasures';
type CardEra = 'modern' | 'vintage' | 'ultra_modern';

interface ParallelTier {
  name: string;
  printRun: string;
  multiplier: [number, number]; // [low, high] multiplier range vs base
  color: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'super_rare' | 'ultra_rare' | 'legendary';
}

interface BrandConfig {
  id: Brand;
  label: string;
  sport: string;
  parallels: ParallelTier[];
}

const BRANDS: BrandConfig[] = [
  {
    id: 'topps_chrome',
    label: 'Topps Chrome',
    sport: 'Baseball',
    parallels: [
      { name: 'Base', printRun: 'Unlimited', multiplier: [1, 1], color: '#94a3b8', rarity: 'common' },
      { name: 'Refractor', printRun: '~500–1000', multiplier: [2, 4], color: '#38bdf8', rarity: 'uncommon' },
      { name: 'Sepia Refractor', printRun: '/399', multiplier: [3, 6], color: '#d4a574', rarity: 'uncommon' },
      { name: 'Pink Refractor', printRun: '/299', multiplier: [3, 7], color: '#f472b6', rarity: 'rare' },
      { name: 'Green Refractor', printRun: '/99', multiplier: [8, 15], color: '#4ade80', rarity: 'rare' },
      { name: 'Orange Refractor', printRun: '/25', multiplier: [20, 40], color: '#fb923c', rarity: 'super_rare' },
      { name: 'Red Refractor', printRun: '/5', multiplier: [60, 120], color: '#ef4444', rarity: 'ultra_rare' },
      { name: 'Gold Refractor', printRun: '/50', multiplier: [15, 30], color: '#facc15', rarity: 'super_rare' },
      { name: 'Superfractor', printRun: '1/1', multiplier: [150, 400], color: '#fbbf24', rarity: 'legendary' },
    ],
  },
  {
    id: 'prizm',
    label: 'Panini Prizm',
    sport: 'Multi-Sport',
    parallels: [
      { name: 'Base', printRun: 'Unlimited', multiplier: [1, 1], color: '#94a3b8', rarity: 'common' },
      { name: 'Silver Prizm', printRun: '~200–500', multiplier: [3, 8], color: '#cbd5e1', rarity: 'uncommon' },
      { name: 'Red White & Blue', printRun: '~200', multiplier: [2, 5], color: '#818cf8', rarity: 'uncommon' },
      { name: 'Blue Prizm', printRun: '/199', multiplier: [4, 10], color: '#3b82f6', rarity: 'rare' },
      { name: 'Orange Prizm', printRun: '/49', multiplier: [15, 35], color: '#fb923c', rarity: 'super_rare' },
      { name: 'Green Prizm', printRun: '/75', multiplier: [10, 25], color: '#22c55e', rarity: 'rare' },
      { name: 'Purple Prizm', printRun: '/49', multiplier: [15, 35], color: '#a855f7', rarity: 'super_rare' },
      { name: 'Gold Prizm', printRun: '/10', multiplier: [50, 100], color: '#facc15', rarity: 'ultra_rare' },
      { name: 'Black Prizm', printRun: '1/1', multiplier: [150, 500], color: '#1e293b', rarity: 'legendary' },
    ],
  },
  {
    id: 'select',
    label: 'Panini Select',
    sport: 'Multi-Sport',
    parallels: [
      { name: 'Base (Concourse)', printRun: 'Unlimited', multiplier: [1, 1], color: '#94a3b8', rarity: 'common' },
      { name: 'Premier Level', printRun: '~200–400', multiplier: [1.5, 3], color: '#60a5fa', rarity: 'uncommon' },
      { name: 'Courtside/Field Level', printRun: '~100–200', multiplier: [2, 5], color: '#c084fc', rarity: 'uncommon' },
      { name: 'Silver Prizm', printRun: '~200', multiplier: [3, 8], color: '#cbd5e1', rarity: 'rare' },
      { name: 'Tie-Dye', printRun: '/25', multiplier: [20, 50], color: '#ec4899', rarity: 'super_rare' },
      { name: 'Gold', printRun: '/10', multiplier: [40, 80], color: '#facc15', rarity: 'ultra_rare' },
      { name: 'Green', printRun: '/5', multiplier: [60, 120], color: '#22c55e', rarity: 'ultra_rare' },
      { name: 'Black', printRun: '1/1', multiplier: [120, 350], color: '#1e293b', rarity: 'legendary' },
    ],
  },
  {
    id: 'optic',
    label: 'Donruss Optic',
    sport: 'Multi-Sport',
    parallels: [
      { name: 'Base', printRun: 'Unlimited', multiplier: [1, 1], color: '#94a3b8', rarity: 'common' },
      { name: 'Holo', printRun: '~300', multiplier: [2, 5], color: '#67e8f9', rarity: 'uncommon' },
      { name: 'Pink Velocity', printRun: '/79', multiplier: [6, 15], color: '#f472b6', rarity: 'rare' },
      { name: 'Blue', printRun: '/49', multiplier: [10, 25], color: '#3b82f6', rarity: 'super_rare' },
      { name: 'Orange', printRun: '/25', multiplier: [20, 45], color: '#fb923c', rarity: 'super_rare' },
      { name: 'Red', printRun: '/10', multiplier: [40, 80], color: '#ef4444', rarity: 'ultra_rare' },
      { name: 'Gold', printRun: '/5', multiplier: [60, 120], color: '#facc15', rarity: 'ultra_rare' },
      { name: 'Black', printRun: '1/1', multiplier: [120, 300], color: '#1e293b', rarity: 'legendary' },
    ],
  },
  {
    id: 'bowman_chrome',
    label: 'Bowman Chrome',
    sport: 'Baseball',
    parallels: [
      { name: 'Base', printRun: 'Unlimited', multiplier: [1, 1], color: '#94a3b8', rarity: 'common' },
      { name: 'Refractor', printRun: '~499', multiplier: [2, 5], color: '#38bdf8', rarity: 'uncommon' },
      { name: 'Blue Refractor', printRun: '/150', multiplier: [4, 10], color: '#3b82f6', rarity: 'rare' },
      { name: 'Green Refractor', printRun: '/99', multiplier: [6, 15], color: '#22c55e', rarity: 'rare' },
      { name: 'Gold Refractor', printRun: '/50', multiplier: [12, 30], color: '#facc15', rarity: 'super_rare' },
      { name: 'Orange Refractor', printRun: '/25', multiplier: [20, 50], color: '#fb923c', rarity: 'super_rare' },
      { name: 'Red Refractor', printRun: '/5', multiplier: [50, 120], color: '#ef4444', rarity: 'ultra_rare' },
      { name: 'Superfractor', printRun: '1/1', multiplier: [100, 400], color: '#fbbf24', rarity: 'legendary' },
    ],
  },
  {
    id: 'mosaic',
    label: 'Panini Mosaic',
    sport: 'Multi-Sport',
    parallels: [
      { name: 'Base', printRun: 'Unlimited', multiplier: [1, 1], color: '#94a3b8', rarity: 'common' },
      { name: 'Silver Mosaic', printRun: '~200', multiplier: [2, 5], color: '#e2e8f0', rarity: 'uncommon' },
      { name: 'Blue Mosaic', printRun: '/99', multiplier: [5, 12], color: '#3b82f6', rarity: 'rare' },
      { name: 'Green Mosaic', printRun: '/49', multiplier: [10, 25], color: '#22c55e', rarity: 'super_rare' },
      { name: 'Orange Fluorescent', printRun: '/25', multiplier: [18, 40], color: '#fb923c', rarity: 'super_rare' },
      { name: 'Gold Mosaic', printRun: '/10', multiplier: [35, 70], color: '#facc15', rarity: 'ultra_rare' },
      { name: 'Black Mosaic', printRun: '1/1', multiplier: [80, 250], color: '#1e293b', rarity: 'legendary' },
    ],
  },
  {
    id: 'spectra',
    label: 'Panini Spectra',
    sport: 'Multi-Sport',
    parallels: [
      { name: 'Base', printRun: '/99', multiplier: [1, 1], color: '#94a3b8', rarity: 'uncommon' },
      { name: 'Neon Blue', printRun: '/49', multiplier: [1.5, 3], color: '#38bdf8', rarity: 'rare' },
      { name: 'Neon Green', printRun: '/35', multiplier: [2, 4], color: '#22c55e', rarity: 'rare' },
      { name: 'Neon Orange', printRun: '/25', multiplier: [3, 6], color: '#fb923c', rarity: 'super_rare' },
      { name: 'Neon Pink', printRun: '/15', multiplier: [4, 8], color: '#ec4899', rarity: 'super_rare' },
      { name: 'Gold', printRun: '/10', multiplier: [6, 12], color: '#facc15', rarity: 'ultra_rare' },
      { name: 'Black', printRun: '1/1', multiplier: [20, 60], color: '#1e293b', rarity: 'legendary' },
    ],
  },
  {
    id: 'national_treasures',
    label: 'National Treasures',
    sport: 'Multi-Sport',
    parallels: [
      { name: 'Base', printRun: '/99', multiplier: [1, 1], color: '#94a3b8', rarity: 'rare' },
      { name: 'Bronze', printRun: '/49', multiplier: [1.5, 3], color: '#cd7f32', rarity: 'super_rare' },
      { name: 'Silver', printRun: '/25', multiplier: [3, 6], color: '#cbd5e1', rarity: 'super_rare' },
      { name: 'Gold', printRun: '/10', multiplier: [6, 12], color: '#facc15', rarity: 'ultra_rare' },
      { name: 'Emerald', printRun: '/5', multiplier: [10, 20], color: '#10b981', rarity: 'ultra_rare' },
      { name: 'Platinum', printRun: '1/1', multiplier: [25, 80], color: '#e2e8f0', rarity: 'legendary' },
    ],
  },
  {
    id: 'flawless',
    label: 'Panini Flawless',
    sport: 'Multi-Sport',
    parallels: [
      { name: 'Base (Diamond)', printRun: '/20', multiplier: [1, 1], color: '#e2e8f0', rarity: 'super_rare' },
      { name: 'Ruby', printRun: '/15', multiplier: [1.3, 2], color: '#ef4444', rarity: 'super_rare' },
      { name: 'Sapphire', printRun: '/10', multiplier: [1.8, 3], color: '#3b82f6', rarity: 'ultra_rare' },
      { name: 'Emerald', printRun: '/5', multiplier: [3, 6], color: '#10b981', rarity: 'ultra_rare' },
      { name: 'Gold', printRun: '/3', multiplier: [5, 10], color: '#facc15', rarity: 'ultra_rare' },
      { name: 'Platinum', printRun: '1/1', multiplier: [12, 30], color: '#e2e8f0', rarity: 'legendary' },
    ],
  },
];

const RARITY_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  common: { label: 'Common', bg: 'bg-gray-800', text: 'text-gray-400' },
  uncommon: { label: 'Uncommon', bg: 'bg-blue-950', text: 'text-blue-400' },
  rare: { label: 'Rare', bg: 'bg-purple-950', text: 'text-purple-400' },
  super_rare: { label: 'Super Rare', bg: 'bg-orange-950', text: 'text-orange-400' },
  ultra_rare: { label: 'Ultra Rare', bg: 'bg-red-950', text: 'text-red-400' },
  legendary: { label: 'Legendary', bg: 'bg-yellow-950', text: 'text-yellow-400' },
};

function formatPrice(val: number): string {
  if (val >= 10000) return `$${(val / 1000).toFixed(0)}K`;
  if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`;
  return `$${val.toFixed(0)}`;
}

export default function ParallelValueCalc() {
  const [baseValue, setBaseValue] = useState<string>('10');
  const [selectedBrand, setSelectedBrand] = useState<Brand>('topps_chrome');
  const [isRookie, setIsRookie] = useState(false);
  const [isAutograph, setIsAutograph] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'value_asc' | 'value_desc'>('default');

  const brand = BRANDS.find(b => b.id === selectedBrand)!;
  const numericBase = parseFloat(baseValue) || 0;

  // Rookie and auto multipliers
  const contextMultiplier = (isRookie ? 1.5 : 1) * (isAutograph ? 2.5 : 1);

  const results = useMemo(() => {
    const items = brand.parallels.map((p, i) => {
      const low = numericBase * p.multiplier[0] * contextMultiplier;
      const high = numericBase * p.multiplier[1] * contextMultiplier;
      return { ...p, low, high, index: i };
    });

    if (sortBy === 'value_asc') return [...items].sort((a, b) => a.low - b.low);
    if (sortBy === 'value_desc') return [...items].sort((a, b) => b.high - a.high);
    return items;
  }, [brand, numericBase, contextMultiplier, sortBy]);

  const maxValue = Math.max(...results.map(r => r.high), 1);

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
        <h2 className="text-lg font-semibold text-white">Card Details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Base Card Value ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={baseValue}
              onChange={e => setBaseValue(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              placeholder="Enter base card value"
            />
            <p className="text-xs text-gray-500 mt-1">The raw/ungraded base version price</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Brand / Product Line</label>
            <select
              value={selectedBrand}
              onChange={e => setSelectedBrand(e.target.value as Brand)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            >
              {BRANDS.map(b => (
                <option key={b.id} value={b.id}>{b.label} ({b.sport})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isRookie}
              onChange={e => setIsRookie(e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-violet-500 focus:ring-violet-500"
            />
            <span className="text-sm text-gray-300">Rookie Card (+50% premium)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isAutograph}
              onChange={e => setIsAutograph(e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-violet-500 focus:ring-violet-500"
            />
            <span className="text-sm text-gray-300">Autograph (+150% premium)</span>
          </label>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">{brand.label} Parallel Values</h2>
        <div className="flex gap-2">
          {[
            { id: 'default' as const, label: 'Default' },
            { id: 'value_asc' as const, label: 'Value: Low' },
            { id: 'value_desc' as const, label: 'Value: High' },
          ].map(s => (
            <button
              key={s.id}
              onClick={() => setSortBy(s.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                sortBy === s.id
                  ? 'bg-violet-600 border-violet-500 text-white'
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Table */}
      {numericBase > 0 ? (
        <div className="space-y-2">
          {results.map((r) => {
            const barWidth = maxValue > 0 ? (r.high / maxValue) * 100 : 0;
            const rarityInfo = RARITY_LABELS[r.rarity];
            return (
              <div key={r.name} className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full border-2 flex-shrink-0"
                      style={{ backgroundColor: r.color, borderColor: r.color }}
                    />
                    <div>
                      <span className="text-white font-medium">{r.name}</span>
                      <span className="text-gray-500 text-sm ml-2">{r.printRun}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${rarityInfo.bg} ${rarityInfo.text}`}>
                      {rarityInfo.label}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(barWidth, 2)}%`,
                          background: `linear-gradient(90deg, ${r.color}80, ${r.color})`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-right min-w-[120px]">
                    <span className="text-white font-semibold text-lg">
                      {formatPrice(r.low)}
                      {r.low !== r.high && ` – ${formatPrice(r.high)}`}
                    </span>
                    {r.multiplier[0] !== 1 && (
                      <div className="text-xs text-gray-500">
                        {r.multiplier[0]}x – {r.multiplier[1]}x base
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Summary */}
          <div className="bg-violet-950/30 border border-violet-800/40 rounded-xl p-5 mt-4">
            <h3 className="text-sm font-semibold text-violet-300 mb-3">Quick Summary</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-gray-400 text-xs mb-1">Base Value</div>
                <div className="text-white font-bold">{formatPrice(numericBase * contextMultiplier)}</div>
              </div>
              <div>
                <div className="text-gray-400 text-xs mb-1">Most Common Parallel</div>
                <div className="text-white font-bold">{formatPrice(results[1]?.low || 0)} – {formatPrice(results[1]?.high || 0)}</div>
              </div>
              <div>
                <div className="text-gray-400 text-xs mb-1">Mid-Tier Peak</div>
                <div className="text-white font-bold">
                  {formatPrice(results.find(r => r.rarity === 'super_rare')?.high || 0)}
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-xs mb-1">1/1 Estimate</div>
                <div className="text-yellow-400 font-bold">
                  {formatPrice(results[results.length - 1]?.high || 0)}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
          <p className="text-gray-500">Enter a base card value above to see parallel estimates</p>
        </div>
      )}

      {/* Comparison Across Brands */}
      {numericBase > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Compare 1/1 Values Across Brands</h2>
          <div className="space-y-2">
            {BRANDS.map(b => {
              const oneOfOne = b.parallels[b.parallels.length - 1];
              const high = numericBase * oneOfOne.multiplier[1] * contextMultiplier;
              const barWidth = high / (numericBase * 500 * contextMultiplier) * 100;
              return (
                <div key={b.id} className="flex items-center gap-3">
                  <div className="w-36 sm:w-44 text-sm text-gray-400 truncate">{b.label}</div>
                  <div className="flex-1 h-4 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-600 to-violet-400"
                      style={{ width: `${Math.min(barWidth, 100)}%` }}
                    />
                  </div>
                  <div className="text-white font-medium text-sm min-w-[80px] text-right">{formatPrice(high)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Educational Section */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">Understanding Parallels</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-violet-400">What Are Parallels?</h3>
            <p className="text-sm text-gray-400">
              Parallels are alternate versions of a base card with different colors, finishes, or numbering.
              They use the same photo and design but are printed in limited quantities, making them rarer
              and more valuable than the base version.
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-violet-400">Why Print Run Matters</h3>
            <p className="text-sm text-gray-400">
              Lower print runs = higher scarcity = higher value. A /25 card means only 25 copies exist worldwide.
              The ultimate parallel is a 1/1 (one-of-one) — a truly unique card. Serial-numbered cards carry
              a premium that increases exponentially as the print run decreases.
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-violet-400">Key Factors That Affect Multipliers</h3>
            <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
              <li>Player popularity and demand</li>
              <li>Rookie year vs veteran cards</li>
              <li>Autograph or patch inclusion</li>
              <li>Visual appeal of the parallel color</li>
              <li>Jersey number matches (e.g., /10 for a #10 player)</li>
              <li>Recent on-field performance</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-violet-400">Tips for Buying Parallels</h3>
            <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
              <li>Verify the serial number on the back matches the listing</li>
              <li>Check recent eBay sold data for the exact parallel</li>
              <li>Numbered parallels under /50 tend to hold value better</li>
              <li>Color-match parallels (team color) carry a small premium</li>
              <li>1st Bowman Chrome parallels command the highest baseball premiums</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Related Tools */}
      <div className="flex flex-wrap gap-3">
        {[
          { href: '/tools/grading-roi', label: 'Grading ROI Calculator' },
          { href: '/tools/rarity-score', label: 'Rarity Score Calculator' },
          { href: '/tools/flip-calc', label: 'Flip Profit Calculator' },
          { href: '/tools/investment-calc', label: 'Investment Calculator' },
          { href: '/tools/pop-report', label: 'Population Report' },
          { href: '/tools/error-cards', label: 'Error Card Guide' },
        ].map(t => (
          <Link
            key={t.href}
            href={t.href}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 rounded-xl text-sm font-medium transition-colors"
          >
            {t.label} &rarr;
          </Link>
        ))}
      </div>
    </div>
  );
}
