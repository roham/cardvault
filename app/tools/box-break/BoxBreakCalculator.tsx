'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

interface Product {
  name: string;
  sport: string;
  type: string;
  retailPrice: number;
  packsPerBox: number;
  cardsPerPack: number;
  maxSpots: number;
  description: string;
  hitOdds: string;
  estimatedEV: number;
}

const products: Product[] = [
  // Baseball
  { name: '2025 Topps Series 1 Hobby Box', sport: 'Baseball', type: 'Hobby', retailPrice: 90, packsPerBox: 24, cardsPerPack: 14, maxSpots: 30, description: '1 auto or relic per box, base set building', hitOdds: '1 auto/relic guaranteed', estimatedEV: 75 },
  { name: '2025 Topps Chrome Hobby Box', sport: 'Baseball', type: 'Hobby', retailPrice: 250, packsPerBox: 24, cardsPerPack: 4, maxSpots: 30, description: 'Premium chrome cards with refractors', hitOdds: '2 autos per box', estimatedEV: 220 },
  { name: '2024 Bowman Chrome Hobby Box', sport: 'Baseball', type: 'Hobby', retailPrice: 300, packsPerBox: 24, cardsPerPack: 5, maxSpots: 30, description: 'Prospect cards, the future of baseball', hitOdds: '2 autos per box', estimatedEV: 260 },
  { name: '2025 Topps Series 1 Blaster', sport: 'Baseball', type: 'Blaster', retailPrice: 30, packsPerBox: 7, cardsPerPack: 14, maxSpots: 6, description: 'Retail exclusive parallels', hitOdds: '1 relic or auto possible', estimatedEV: 22 },
  // Basketball
  { name: '2024-25 Panini Prizm Hobby Box', sport: 'Basketball', type: 'Hobby', retailPrice: 500, packsPerBox: 12, cardsPerPack: 12, maxSpots: 30, description: 'The flagship basketball product', hitOdds: '2 autos, 12 Prizm parallels', estimatedEV: 450 },
  { name: '2024-25 Panini Donruss Hobby Box', sport: 'Basketball', type: 'Hobby', retailPrice: 180, packsPerBox: 24, cardsPerPack: 8, maxSpots: 30, description: 'Rated Rookies and value autos', hitOdds: '2 autos per box', estimatedEV: 150 },
  { name: '2024-25 Panini Select Hobby Box', sport: 'Basketball', type: 'Hobby', retailPrice: 600, packsPerBox: 12, cardsPerPack: 8, maxSpots: 30, description: 'Concourse/Premier/Courtside tiers', hitOdds: '3 autos, multiple Prizm parallels', estimatedEV: 520 },
  { name: '2024-25 Panini Prizm Blaster', sport: 'Basketball', type: 'Blaster', retailPrice: 40, packsPerBox: 6, cardsPerPack: 4, maxSpots: 6, description: 'Retail exclusive Ice Prizms', hitOdds: 'Auto possible, parallels in every pack', estimatedEV: 30 },
  // Football
  { name: '2024 Panini Prizm Football Hobby Box', sport: 'Football', type: 'Hobby', retailPrice: 650, packsPerBox: 12, cardsPerPack: 12, maxSpots: 32, description: 'The king of football cards', hitOdds: '2 autos, 12+ Prizm parallels', estimatedEV: 580 },
  { name: '2024 Panini Donruss Football Hobby Box', sport: 'Football', type: 'Hobby', retailPrice: 200, packsPerBox: 24, cardsPerPack: 8, maxSpots: 32, description: 'Rated Rookies and value', hitOdds: '2 autos per box', estimatedEV: 165 },
  { name: '2024 Topps Chrome Football Hobby Box', sport: 'Football', type: 'Hobby', retailPrice: 280, packsPerBox: 24, cardsPerPack: 4, maxSpots: 32, description: 'Chrome refractors in football', hitOdds: '2 autos per box', estimatedEV: 240 },
  { name: '2024 Panini Prizm Football Blaster', sport: 'Football', type: 'Blaster', retailPrice: 40, packsPerBox: 6, cardsPerPack: 4, maxSpots: 8, description: 'Retail exclusive Prizm parallels', hitOdds: 'Auto possible', estimatedEV: 28 },
  // Hockey
  { name: '2024-25 Upper Deck Series 1 Hobby Box', sport: 'Hockey', type: 'Hobby', retailPrice: 100, packsPerBox: 24, cardsPerPack: 8, maxSpots: 16, description: 'Young Guns rookies', hitOdds: '6 Young Guns per box', estimatedEV: 85 },
  { name: '2024-25 Upper Deck Series 2 Hobby Box', sport: 'Hockey', type: 'Hobby', retailPrice: 100, packsPerBox: 24, cardsPerPack: 8, maxSpots: 16, description: 'More Young Guns and inserts', hitOdds: '6 Young Guns per box', estimatedEV: 80 },
  // Multi-box formats
  { name: '2024 Panini Prizm Football FOTL Box', sport: 'Football', type: 'FOTL', retailPrice: 1200, packsPerBox: 12, cardsPerPack: 12, maxSpots: 32, description: 'First Off The Line exclusive parallels', hitOdds: '3 autos, exclusive Gold Shimmer', estimatedEV: 1050 },
  { name: '2024-25 Panini Prizm Basketball FOTL Box', sport: 'Basketball', type: 'FOTL', retailPrice: 1000, packsPerBox: 12, cardsPerPack: 12, maxSpots: 30, description: 'First Off The Line exclusive parallels', hitOdds: '3 autos, exclusive Gold Shimmer', estimatedEV: 900 },
];

type BreakFormat = 'random-team' | 'pick-your-team' | 'hit-draft' | 'random-division';

const breakFormats: { id: BreakFormat; label: string; description: string; premiumMultiplier: number }[] = [
  { id: 'random-team', label: 'Random Team', description: 'Teams randomly assigned to participants. Cheapest format — everyone pays the same.', premiumMultiplier: 1.0 },
  { id: 'pick-your-team', label: 'Pick Your Team (PYT)', description: 'Choose your team before the break. Popular teams cost more — priced by team demand.', premiumMultiplier: 1.15 },
  { id: 'hit-draft', label: 'Hit Draft', description: 'All hits are drafted by participants in order. Everyone gets equal access to the best pulls.', premiumMultiplier: 1.1 },
  { id: 'random-division', label: 'Random Division', description: 'Divisions randomly assigned. Fewer spots, higher cost per spot, more teams per person.', premiumMultiplier: 1.05 },
];

const sportTeamCounts: Record<string, number> = {
  Baseball: 30,
  Basketball: 30,
  Football: 32,
  Hockey: 16,
};

export default function BoxBreakCalculator() {
  const [selectedProduct, setSelectedProduct] = useState<Product>(products[0]);
  const [selectedFormat, setSelectedFormat] = useState<BreakFormat>('random-team');
  const [numBoxes, setNumBoxes] = useState(1);
  const [sportFilter, setSportFilter] = useState<string>('All');
  const [breakerFeePercent, setBreakerFeePercent] = useState(15);
  const [shippingPerSpot, setShippingPerSpot] = useState(5);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const format = breakFormats.find(f => f.id === selectedFormat)!;
  const numTeams = sportTeamCounts[selectedProduct.sport] || 30;
  const numSpots = selectedFormat === 'random-division'
    ? Math.ceil(numTeams / 4)
    : Math.min(selectedProduct.maxSpots, numTeams);

  const filteredProducts = sportFilter === 'All'
    ? products
    : products.filter(p => p.sport === sportFilter);

  const calculations = useMemo(() => {
    const totalCost = selectedProduct.retailPrice * numBoxes;
    const breakerFee = totalCost * (breakerFeePercent / 100);
    const totalWithFee = (totalCost + breakerFee) * format.premiumMultiplier;
    const costPerSpot = totalWithFee / numSpots;
    const costWithShipping = costPerSpot + shippingPerSpot;
    const totalEV = selectedProduct.estimatedEV * numBoxes;
    const evPerSpot = totalEV / numSpots;
    const evRatio = evPerSpot / costWithShipping;
    const breakEvenValue = costWithShipping;

    return {
      totalCost,
      breakerFee,
      totalWithFee,
      costPerSpot,
      costWithShipping,
      totalEV,
      evPerSpot,
      evRatio,
      breakEvenValue,
      numSpots,
    };
  }, [selectedProduct, numBoxes, breakerFeePercent, shippingPerSpot, format, numSpots]);

  const getVerdictColor = (ratio: number) => {
    if (ratio >= 0.9) return 'text-emerald-400';
    if (ratio >= 0.7) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getVerdictText = (ratio: number) => {
    if (ratio >= 1.0) return 'Great Value — EV exceeds cost';
    if (ratio >= 0.9) return 'Fair Value — close to break-even';
    if (ratio >= 0.7) return 'Below EV — but big hits possible';
    if (ratio >= 0.5) return 'Poor Value — you need a big hit';
    return 'Bad Deal — heavily negative EV';
  };

  const getVerdictEmoji = (ratio: number) => {
    if (ratio >= 1.0) return '🟢';
    if (ratio >= 0.9) return '🟡';
    if (ratio >= 0.7) return '🟠';
    return '🔴';
  };

  return (
    <div className="space-y-8">
      {/* Sport Filter */}
      <div className="flex flex-wrap gap-2">
        {['All', 'Baseball', 'Basketball', 'Football', 'Hockey'].map(sport => (
          <button
            key={sport}
            onClick={() => {
              setSportFilter(sport);
              const available = sport === 'All' ? products : products.filter(p => p.sport === sport);
              if (available.length > 0 && !available.includes(selectedProduct)) {
                setSelectedProduct(available[0]);
              }
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              sportFilter === sport
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
            }`}
          >
            {sport}
          </button>
        ))}
      </div>

      {/* Product Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Select Product</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredProducts.map(product => (
            <button
              key={product.name}
              onClick={() => setSelectedProduct(product)}
              className={`text-left p-4 rounded-xl border transition-all ${
                selectedProduct.name === product.name
                  ? 'bg-emerald-950/40 border-emerald-500/50 ring-1 ring-emerald-500/30'
                  : 'bg-gray-900 border-gray-800 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-500 uppercase">{product.sport} · {product.type}</span>
                <span className="text-emerald-400 font-bold text-sm">${product.retailPrice}</span>
              </div>
              <p className="text-white text-sm font-semibold">{product.name}</p>
              <p className="text-gray-500 text-xs mt-1">{product.hitOdds}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Break Format */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Break Format</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {breakFormats.map(fmt => (
            <button
              key={fmt.id}
              onClick={() => setSelectedFormat(fmt.id)}
              className={`text-left p-4 rounded-xl border transition-all ${
                selectedFormat === fmt.id
                  ? 'bg-emerald-950/40 border-emerald-500/50 ring-1 ring-emerald-500/30'
                  : 'bg-gray-900 border-gray-800 hover:border-gray-600'
              }`}
            >
              <p className="text-white text-sm font-semibold">{fmt.label}</p>
              <p className="text-gray-500 text-xs mt-1">{fmt.description}</p>
              {fmt.premiumMultiplier > 1 && (
                <span className="inline-block mt-2 text-xs text-yellow-400 bg-yellow-950/40 px-2 py-0.5 rounded">
                  +{Math.round((fmt.premiumMultiplier - 1) * 100)}% premium
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Number of Boxes */}
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-300 mb-2">Number of Boxes</label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setNumBoxes(Math.max(1, numBoxes - 1))}
              className="w-10 h-10 rounded-lg bg-gray-800 text-white border border-gray-700 hover:bg-gray-700 text-lg font-bold"
            >
              -
            </button>
            <span className="text-white text-2xl font-bold w-12 text-center">{numBoxes}</span>
            <button
              onClick={() => setNumBoxes(Math.min(10, numBoxes + 1))}
              className="w-10 h-10 rounded-lg bg-gray-800 text-white border border-gray-700 hover:bg-gray-700 text-lg font-bold"
            >
              +
            </button>
          </div>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-300 mb-2">Spots Available</label>
          <p className="text-3xl font-bold text-white">{calculations.numSpots}</p>
          <p className="text-xs text-gray-500">{selectedProduct.sport} has {numTeams} teams</p>
        </div>
      </div>

      {/* Advanced Settings */}
      <div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          <svg className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
          Advanced Settings
        </button>
        {showAdvanced && (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-900 rounded-xl border border-gray-800">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Breaker Fee (%)</label>
              <input
                type="range"
                min={0}
                max={30}
                value={breakerFeePercent}
                onChange={e => setBreakerFeePercent(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
              <span className="text-sm text-white font-medium">{breakerFeePercent}%</span>
              <p className="text-xs text-gray-500">Most breakers charge 10-20%</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Shipping per Spot ($)</label>
              <input
                type="range"
                min={0}
                max={15}
                value={shippingPerSpot}
                onChange={e => setShippingPerSpot(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
              <span className="text-sm text-white font-medium">${shippingPerSpot}</span>
              <p className="text-xs text-gray-500">BMWT shipping typically $4-8</p>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">Break Cost Analysis</h2>
          <p className="text-sm text-gray-400 mt-1">
            {numBoxes}x {selectedProduct.name} · {format.label} · {calculations.numSpots} spots
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-gray-800">
          <div className="bg-gray-900 p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Product Cost</p>
            <p className="text-2xl font-bold text-white">${calculations.totalCost.toFixed(0)}</p>
            <p className="text-xs text-gray-500">{numBoxes} box{numBoxes > 1 ? 'es' : ''} × ${selectedProduct.retailPrice}</p>
          </div>
          <div className="bg-gray-900 p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Breaker Fee</p>
            <p className="text-2xl font-bold text-yellow-400">${calculations.breakerFee.toFixed(0)}</p>
            <p className="text-xs text-gray-500">{breakerFeePercent}% of product cost</p>
          </div>
          <div className="bg-gray-900 p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Cost Per Spot</p>
            <p className="text-2xl font-bold text-white">${calculations.costPerSpot.toFixed(2)}</p>
            <p className="text-xs text-gray-500">before shipping</p>
          </div>
          <div className="bg-gray-900 p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Total Per Spot</p>
            <p className="text-2xl font-bold text-emerald-400">${calculations.costWithShipping.toFixed(2)}</p>
            <p className="text-xs text-gray-500">+ ${shippingPerSpot} shipping</p>
          </div>
        </div>

        {/* EV Analysis */}
        <div className="p-6 border-t border-gray-800">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Expected Value Analysis</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-800/50 rounded-xl p-4">
              <p className="text-xs text-gray-500">Total Box EV</p>
              <p className="text-xl font-bold text-white">${calculations.totalEV.toFixed(0)}</p>
              <p className="text-xs text-gray-500">estimated market value of pulls</p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4">
              <p className="text-xs text-gray-500">EV Per Spot</p>
              <p className="text-xl font-bold text-white">${calculations.evPerSpot.toFixed(2)}</p>
              <p className="text-xs text-gray-500">avg value you can expect</p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4">
              <p className="text-xs text-gray-500">EV / Cost Ratio</p>
              <p className={`text-xl font-bold ${getVerdictColor(calculations.evRatio)}`}>
                {(calculations.evRatio * 100).toFixed(0)}%
              </p>
              <p className="text-xs text-gray-500">100% = break-even</p>
            </div>
          </div>
        </div>

        {/* Verdict */}
        <div className="p-6 border-t border-gray-800 bg-gray-950/50">
          <div className="flex items-start gap-3">
            <span className="text-2xl">{getVerdictEmoji(calculations.evRatio)}</span>
            <div>
              <p className={`font-bold text-lg ${getVerdictColor(calculations.evRatio)}`}>
                {getVerdictText(calculations.evRatio)}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                You need to pull at least <strong className="text-white">${calculations.breakEvenValue.toFixed(2)}</strong> in value from your spot to break even.
                {calculations.evRatio < 0.8 && ' Consider joining a break with fewer boxes or a lower breaker fee.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Break Comparison Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-gray-800">
          <h3 className="text-lg font-bold text-white">Format Comparison</h3>
          <p className="text-xs text-gray-500 mt-1">Same product, different break formats</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-800">
              <tr className="text-xs text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3 text-left">Format</th>
                <th className="px-4 py-3 text-right">Cost/Spot</th>
                <th className="px-4 py-3 text-right">EV/Spot</th>
                <th className="px-4 py-3 text-right">EV Ratio</th>
                <th className="px-4 py-3 text-center">Verdict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {breakFormats.map(fmt => {
                const spots = fmt.id === 'random-division' ? Math.ceil(numTeams / 4) : Math.min(selectedProduct.maxSpots, numTeams);
                const total = (selectedProduct.retailPrice * numBoxes * (1 + breakerFeePercent / 100)) * fmt.premiumMultiplier;
                const cps = total / spots + shippingPerSpot;
                const evps = (selectedProduct.estimatedEV * numBoxes) / spots;
                const ratio = evps / cps;
                return (
                  <tr key={fmt.id} className={selectedFormat === fmt.id ? 'bg-emerald-950/20' : ''}>
                    <td className="px-4 py-3 text-sm text-white font-medium">
                      {fmt.label}
                      {selectedFormat === fmt.id && <span className="ml-2 text-xs text-emerald-400">(selected)</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300 text-right">${cps.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-300 text-right">${evps.toFixed(2)}</td>
                    <td className={`px-4 py-3 text-sm font-medium text-right ${getVerdictColor(ratio)}`}>
                      {(ratio * 100).toFixed(0)}%
                    </td>
                    <td className="px-4 py-3 text-center">{getVerdictEmoji(ratio)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-amber-950/20 border border-amber-800/30 rounded-xl p-5">
        <h3 className="text-amber-300 font-semibold text-sm mb-3">Box Break Tips</h3>
        <div className="space-y-2 text-sm text-amber-200/70">
          <div className="flex items-start gap-2">
            <span className="text-amber-400 shrink-0">1.</span>
            <span><strong>Random team</strong> is almost always the best value. PYT formats charge premiums for popular teams like the Chiefs, Lakers, or Yankees.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-amber-400 shrink-0">2.</span>
            <span><strong>Watch the breaker fee.</strong> Anything over 20% is expensive. Many reputable breakers charge 10-15%.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-amber-400 shrink-0">3.</span>
            <span><strong>Multi-box breaks</strong> give you more chances at hits but cost more per spot. Single box breaks are better for budget-conscious collectors.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-amber-400 shrink-0">4.</span>
            <span><strong>Check the breaker&apos;s reputation</strong> on Loupe, Whatnot, or BreakNinja before joining. Stick to verified breakers with 100+ positive reviews.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-amber-400 shrink-0">5.</span>
            <span><strong>EV is an average.</strong> Most spots will return less than EV. The value is concentrated in a few big hits — which is why breaks are exciting.</span>
          </div>
        </div>
      </div>

      {/* Related Tools */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
        <Link href="/tools/sealed-ev" className="block p-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-600 transition-colors">
          <h3 className="font-semibold text-white text-sm">Sealed Product EV</h3>
          <p className="text-xs text-gray-400 mt-1">Full expected value breakdown per product.</p>
        </Link>
        <Link href="/tools/pack-sim" className="block p-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-600 transition-colors">
          <h3 className="font-semibold text-white text-sm">Pack Simulator</h3>
          <p className="text-xs text-gray-400 mt-1">Simulate opening packs before you buy.</p>
        </Link>
        <Link href="/tools/grading-roi" className="block p-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-600 transition-colors">
          <h3 className="font-semibold text-white text-sm">Grading ROI Calculator</h3>
          <p className="text-xs text-gray-400 mt-1">Should you grade your pulls? Find out.</p>
        </Link>
      </div>
    </div>
  );
}