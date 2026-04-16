'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { sportsCards } from '@/data/sports-cards';

/* ---------- Types ---------- */

type Trajectory = 'rising-star' | 'established-star' | 'aging-legend' | 'retired-hof' | 'prospect' | 'declining';

interface Projection {
  year: number;
  low: number;
  mid: number;
  high: number;
}

interface ProjectionResult {
  trajectory: Trajectory;
  trajectoryLabel: string;
  trajectoryDesc: string;
  currentValue: number;
  projections: Projection[];
  factors: { label: string; impact: 'positive' | 'negative' | 'neutral'; detail: string }[];
  confidence: 'high' | 'medium' | 'low';
}

/* ---------- Projection Engine ---------- */

const TRAJECTORY_DATA: Record<Trajectory, { label: string; desc: string; annualGrowth: { low: number; mid: number; high: number } }> = {
  'rising-star': { label: 'Rising Star', desc: 'Young player with breakout potential. High variance.', annualGrowth: { low: -5, mid: 15, high: 40 } },
  'established-star': { label: 'Established Star', desc: 'Proven performer in prime years. Steady growth.', annualGrowth: { low: 2, mid: 8, high: 18 } },
  'aging-legend': { label: 'Aging Legend', desc: 'Late career, HOF trajectory. Value stabilizing.', annualGrowth: { low: -2, mid: 5, high: 12 } },
  'retired-hof': { label: 'Retired HOF', desc: 'Hall of Famer. Vintage appreciation. Stable floor.', annualGrowth: { low: 3, mid: 7, high: 15 } },
  'prospect': { label: 'Prospect', desc: 'Pre-debut or early career. Highest risk/reward.', annualGrowth: { low: -30, mid: 20, high: 60 } },
  'declining': { label: 'Declining/Role Player', desc: 'Career winding down. Value likely flat or declining.', annualGrowth: { low: -15, mid: -3, high: 5 } },
};

function buildProjection(trajectory: Trajectory, currentValue: number, isRookie: boolean, sport: string): ProjectionResult {
  const td = TRAJECTORY_DATA[trajectory];
  const projections: Projection[] = [];
  const years = [1, 2, 3, 5, 7, 10];

  for (const yr of years) {
    const low = Math.max(0, Math.round(currentValue * Math.pow(1 + td.annualGrowth.low / 100, yr)));
    const mid = Math.max(0, Math.round(currentValue * Math.pow(1 + td.annualGrowth.mid / 100, yr)));
    const high = Math.max(0, Math.round(currentValue * Math.pow(1 + td.annualGrowth.high / 100, yr)));
    projections.push({ year: yr, low, mid, high });
  }

  const factors: ProjectionResult['factors'] = [];
  if (isRookie) factors.push({ label: 'Rookie Card', impact: 'positive', detail: 'Rookie cards historically appreciate fastest among all card types' });
  if (trajectory === 'rising-star') factors.push({ label: 'Breakout Potential', impact: 'positive', detail: 'Young stars can see 100%+ value spikes after awards/championships' });
  if (trajectory === 'retired-hof') factors.push({ label: 'Scarcity', impact: 'positive', detail: 'No new supply of vintage cards — scarcity drives long-term appreciation' });
  if (trajectory === 'prospect') factors.push({ label: 'Bust Risk', impact: 'negative', detail: '60-70% of prospect cards lose value — only a few become stars' });
  if (trajectory === 'declining') factors.push({ label: 'Career Decline', impact: 'negative', detail: 'Cards of declining players typically lose 5-15% per year' });
  if (sport === 'basketball') factors.push({ label: 'Basketball Premium', impact: 'positive', detail: 'Basketball cards have the highest growth rate among all sports (2020-2025)' });
  if (sport === 'hockey') factors.push({ label: 'Hockey Niche', impact: 'neutral', detail: 'Hockey has a smaller collector base but stronger community loyalty' });
  factors.push({ label: 'Market Cycles', impact: 'neutral', detail: 'The card market has 3-5 year cycles — timing of buy/sell matters significantly' });
  factors.push({ label: 'Grading', impact: 'positive', detail: 'PSA 10 / BGS 9.5 grades amplify value growth by 2-5x vs raw cards' });

  const confidence: ProjectionResult['confidence'] = trajectory === 'retired-hof' || trajectory === 'established-star' ? 'high' : trajectory === 'aging-legend' ? 'medium' : 'low';

  return { trajectory, trajectoryLabel: td.label, trajectoryDesc: td.desc, currentValue, projections, factors, confidence };
}

/* ---------- Component ---------- */

export default function ValueProjectorClient() {
  const [searchQ, setSearchQ] = useState('');
  const [selectedCard, setSelectedCard] = useState<typeof sportsCards[0] | null>(null);
  const [trajectory, setTrajectory] = useState<Trajectory>('rising-star');
  const [customValue, setCustomValue] = useState('');
  const [manualMode, setManualMode] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.parentElement?.contains(e.target as Node)) setDropdownOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const searchResults = useMemo(() => {
    if (!searchQ.trim() || searchQ.length < 2) return [];
    const q = searchQ.toLowerCase();
    return sportsCards.filter(c => c.name.toLowerCase().includes(q) || c.player.toLowerCase().includes(q)).slice(0, 8);
  }, [searchQ]);

  function parseValue(str: string): number {
    const match = str.match(/\$([0-9,]+)/);
    if (!match) return 50;
    const parts = str.match(/\$([0-9,]+)/g);
    if (!parts || parts.length < 2) return parseInt(match[1].replace(',', '')) || 50;
    const vals = parts.map(p => parseInt(p.replace(/[$,]/g, '')) || 0);
    return Math.round((vals[0] + vals[vals.length - 1]) / 2);
  }

  const currentValue = manualMode ? (parseFloat(customValue) || 50) : (selectedCard ? parseValue(selectedCard.estimatedValueGem) : 50);

  const result = useMemo(() => {
    if (!showResults) return null;
    const sport = selectedCard?.sport || 'baseball';
    const isRookie = selectedCard?.rookie || false;
    return buildProjection(trajectory, currentValue, isRookie, sport);
  }, [showResults, trajectory, currentValue, selectedCard]);

  function fmt(n: number): string {
    return n < 1 ? '<$1' : `$${n.toLocaleString('en-US')}`;
  }

  return (
    <div>
      {/* Step 1: Card Selection */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 mb-6">
        <h2 className="text-white font-bold text-lg mb-4">1. Select a Card</h2>
        <div className="flex gap-2 mb-4">
          <button onClick={() => { setManualMode(false); setShowResults(false); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!manualMode ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
            Search Database
          </button>
          <button onClick={() => { setManualMode(true); setShowResults(false); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${manualMode ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
            Enter Value
          </button>
        </div>

        {!manualMode ? (
          <div className="relative">
            <input ref={searchRef} type="text" value={searchQ}
              onChange={e => { setSearchQ(e.target.value); setDropdownOpen(true); setShowResults(false); }}
              onFocus={() => setDropdownOpen(true)}
              placeholder="Search 9,000+ cards by player or card name..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:border-blue-600 focus:outline-none" />
            {dropdownOpen && searchResults.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-gray-900 border border-gray-700 rounded-lg max-h-60 overflow-y-auto">
                {searchResults.map(c => (
                  <button key={c.slug} onClick={() => { setSelectedCard(c); setSearchQ(c.name); setDropdownOpen(false); }}
                    className="w-full text-left p-3 hover:bg-gray-800 transition-colors border-b border-gray-800 last:border-0">
                    <div className="text-white text-sm">{c.name}</div>
                    <div className="text-gray-500 text-xs">{c.player} &middot; {c.sport} &middot; {c.estimatedValueGem}</div>
                  </button>
                ))}
              </div>
            )}
            {selectedCard && (
              <div className="mt-3 bg-blue-950/30 border border-blue-800/30 rounded-lg p-3">
                <div className="text-blue-400 font-medium text-sm">{selectedCard.name}</div>
                <div className="text-gray-400 text-xs mt-1">{selectedCard.player} &middot; Est. gem mint: {selectedCard.estimatedValueGem} {selectedCard.rookie && <span className="text-yellow-400 ml-1">RC</span>}</div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <label className="block text-gray-400 text-sm mb-1">Current estimated value ($)</label>
            <input type="number" value={customValue} onChange={e => { setCustomValue(e.target.value); setShowResults(false); }}
              placeholder="e.g. 200" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:border-blue-600 focus:outline-none" />
          </div>
        )}
      </div>

      {/* Step 2: Player Trajectory */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 mb-6">
        <h2 className="text-white font-bold text-lg mb-4">2. Player Trajectory</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {(Object.entries(TRAJECTORY_DATA) as [Trajectory, typeof TRAJECTORY_DATA[Trajectory]][]).map(([key, td]) => (
            <button key={key} onClick={() => { setTrajectory(key); setShowResults(false); }}
              className={`text-left p-3 rounded-xl border transition-colors ${trajectory === key ? 'bg-blue-600/20 border-blue-600/50' : 'bg-gray-800/60 border-transparent hover:border-gray-700'}`}>
              <div className="text-white font-semibold text-sm">{td.label}</div>
              <div className="text-gray-500 text-xs mt-0.5">{td.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <button onClick={() => setShowResults(true)}
        disabled={!manualMode && !selectedCard}
        className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed mb-8">
        Project Future Value
      </button>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-gradient-to-r from-blue-950/60 to-purple-950/60 border border-blue-800/40 rounded-2xl p-6">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-blue-600/20 text-blue-400 text-sm rounded-full font-medium">{result.trajectoryLabel}</span>
              <span className={`px-3 py-1 text-sm rounded-full font-medium ${result.confidence === 'high' ? 'bg-green-600/20 text-green-400' : result.confidence === 'medium' ? 'bg-yellow-600/20 text-yellow-400' : 'bg-red-600/20 text-red-400'}`}>
                {result.confidence.charAt(0).toUpperCase() + result.confidence.slice(1)} Confidence
              </span>
            </div>
            <div className="text-gray-400 text-sm mb-1">Current Value</div>
            <div className="text-3xl font-bold text-white mb-2">{fmt(result.currentValue)}</div>
            <div className="text-gray-500 text-sm">{result.trajectoryDesc}</div>
          </div>

          {/* Projection Table */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left p-3 text-gray-400 text-xs font-medium">Timeframe</th>
                  <th className="text-right p-3 text-red-400 text-xs font-medium">Bear Case</th>
                  <th className="text-right p-3 text-blue-400 text-xs font-medium">Base Case</th>
                  <th className="text-right p-3 text-green-400 text-xs font-medium">Bull Case</th>
                </tr>
              </thead>
              <tbody>
                {result.projections.map(p => {
                  const midChange = ((p.mid - result.currentValue) / result.currentValue * 100);
                  return (
                    <tr key={p.year} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="p-3 text-white text-sm font-medium">{p.year}yr</td>
                      <td className="p-3 text-right text-red-400 text-sm">{fmt(p.low)}</td>
                      <td className="p-3 text-right">
                        <span className="text-blue-400 text-sm font-semibold">{fmt(p.mid)}</span>
                        <span className={`text-xs ml-1 ${midChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          ({midChange >= 0 ? '+' : ''}{midChange.toFixed(0)}%)
                        </span>
                      </td>
                      <td className="p-3 text-right text-green-400 text-sm">{fmt(p.high)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Visual Bar Chart */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
            <h3 className="text-white font-bold mb-4">10-Year Value Range</h3>
            <div className="space-y-3">
              {result.projections.map(p => {
                const maxVal = Math.max(...result.projections.map(x => x.high), result.currentValue);
                const lowPct = (p.low / maxVal) * 100;
                const midPct = ((p.mid - p.low) / maxVal) * 100;
                const highPct = ((p.high - p.mid) / maxVal) * 100;
                return (
                  <div key={p.year} className="flex items-center gap-3">
                    <div className="w-10 text-right text-gray-400 text-xs">{p.year}yr</div>
                    <div className="flex-1 flex h-5 rounded-full overflow-hidden bg-gray-800">
                      <div className="bg-red-600/40" style={{ width: `${lowPct}%` }} />
                      <div className="bg-blue-600" style={{ width: `${midPct}%` }} />
                      <div className="bg-green-600/40" style={{ width: `${highPct}%` }} />
                    </div>
                    <div className="w-16 text-right text-gray-400 text-xs">{fmt(p.mid)}</div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-4 mt-3 justify-center text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-600/40" /> Bear</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-600" /> Base</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-600/40" /> Bull</span>
            </div>
          </div>

          {/* Factors */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
            <h3 className="text-white font-bold mb-3">Value Factors</h3>
            <div className="space-y-2">
              {result.factors.map((f, i) => (
                <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-gray-800/30">
                  <span className={`text-sm mt-0.5 ${f.impact === 'positive' ? 'text-green-400' : f.impact === 'negative' ? 'text-red-400' : 'text-yellow-400'}`}>
                    {f.impact === 'positive' ? '+' : f.impact === 'negative' ? '-' : '~'}
                  </span>
                  <div>
                    <div className="text-white text-sm font-medium">{f.label}</div>
                    <div className="text-gray-500 text-xs">{f.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-yellow-950/30 border border-yellow-800/40 rounded-xl p-4 text-sm text-yellow-400/80">
            <strong>Disclaimer:</strong> These projections are estimates based on historical card market trends and player trajectory patterns. Actual values may vary significantly. Card collecting carries financial risk — never invest more than you can afford to lose. Past performance does not guarantee future results.
          </div>
        </div>
      )}
    </div>
  );
}
