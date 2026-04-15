'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

function parseValue(s: string): number {
  const m = s.match(/\$([0-9,.]+)/);
  if (!m) return 0;
  const n = m[1].replace(/,/g, '');
  return parseFloat(n) || 0;
}

function fmt(n: number): string {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return `$${Math.round(n).toLocaleString()}`;
}

// Grade multipliers relative to raw value (PSA grades 1-10)
const GRADE_MULTIPLIERS: Record<number, number> = {
  1: 0.15, 2: 0.2, 3: 0.3, 4: 0.4, 5: 0.5,
  6: 0.65, 7: 0.85, 8: 1.2, 9: 2.5, 10: 8.0,
};

// Condition ratings map to probability distributions
type ConditionRating = 1 | 2 | 3 | 4 | 5;

interface ProbabilityResult {
  grade: number;
  probability: number;
  estimatedValue: number;
}

// Generate probability distribution based on condition ratings
function computeProbabilities(
  corners: ConditionRating,
  edges: ConditionRating,
  surface: ConditionRating,
  centering: ConditionRating
): number[] {
  // Weighted score (centering is slightly less impactful than physical condition)
  const score = (corners * 0.3 + edges * 0.25 + surface * 0.25 + centering * 0.2);

  // Map score to a center grade and spread
  // Score range: 1.0 (worst) to 5.0 (best)
  const centerGrade = 3 + (score - 1) * 1.75; // Maps 1→3, 5→10
  const spread = 1.2 - (score - 1) * 0.15; // Tighter spread for better condition

  // Generate normal-ish distribution around center grade
  const probs = new Array(10).fill(0);
  let total = 0;
  for (let g = 1; g <= 10; g++) {
    const diff = g - centerGrade;
    const p = Math.exp(-(diff * diff) / (2 * spread * spread));
    probs[g - 1] = p;
    total += p;
  }

  // Normalize
  return probs.map(p => p / total);
}

const CONDITION_LABELS: Record<ConditionRating, string> = {
  1: 'Poor',
  2: 'Below Average',
  3: 'Average',
  4: 'Good',
  5: 'Excellent',
};

const CONDITION_DESCRIPTIONS: Record<string, Record<ConditionRating, string>> = {
  corners: {
    1: 'Heavily worn, rounded, or paper loss',
    2: 'Noticeable wear, fuzzing on multiple corners',
    3: 'Minor wear on 1-2 corners, slight fuzzing',
    4: 'Very slight touch on one corner only',
    5: 'Razor sharp on all four corners',
  },
  edges: {
    1: 'Major chipping, rough edges throughout',
    2: 'Visible chipping or wear on multiple edges',
    3: 'Minor edge wear, slight roughness on 1-2 edges',
    4: 'Barely noticeable imperfection on one edge',
    5: 'Clean, smooth edges all around',
  },
  surface: {
    1: 'Creases, stains, or major surface damage',
    2: 'Light scratches or print defects visible',
    3: 'Minor surface imperfections, small print dots',
    4: 'Near perfect with very minor issue under magnification',
    5: 'Flawless surface, perfect gloss and print quality',
  },
  centering: {
    1: 'Severely off-center (70/30 or worse)',
    2: 'Noticeably off-center (65/35)',
    3: 'Slightly off-center (60/40)',
    4: 'Well-centered (55/45 or better)',
    5: 'Perfect centering (50/50 on both axes)',
  },
};

const GRADING_COSTS: Record<string, number> = {
  'PSA Economy': 25,
  'PSA Regular': 50,
  'PSA Express': 100,
  'BGS Standard': 25,
  'BGS Express': 75,
  'CGC Standard': 20,
  'CGC Express': 65,
  'SGC Standard': 20,
};

const GRADE_LABELS: Record<number, string> = {
  1: 'Poor', 2: 'Good', 3: 'VG', 4: 'VG-EX', 5: 'EX',
  6: 'EX-MT', 7: 'NM', 8: 'NM-MT', 9: 'Mint', 10: 'Gem Mint',
};

export default function GradingProbability() {
  const [query, setQuery] = useState('');
  const [selectedCard, setSelectedCard] = useState<typeof sportsCards[0] | null>(null);
  const [corners, setCorners] = useState<ConditionRating>(3);
  const [edges, setEdges] = useState<ConditionRating>(3);
  const [surface, setSurface] = useState<ConditionRating>(3);
  const [centering, setCentering] = useState<ConditionRating>(3);
  const [gradingService, setGradingService] = useState('PSA Economy');
  const [showResults, setShowResults] = useState(false);
  const [manualRaw, setManualRaw] = useState('');

  const filtered = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    return sportsCards.filter(c =>
      c.name.toLowerCase().includes(q) || c.player.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [query]);

  const rawValue = useMemo(() => {
    if (manualRaw) return parseFloat(manualRaw) || 0;
    if (selectedCard) return parseValue(selectedCard.estimatedValueRaw);
    return 0;
  }, [selectedCard, manualRaw]);

  const gemValue = useMemo(() => {
    if (selectedCard) return parseValue(selectedCard.estimatedValueGem);
    if (rawValue > 0) return rawValue * 8; // rough estimate
    return 0;
  }, [selectedCard, rawValue]);

  const probabilities = useMemo((): ProbabilityResult[] => {
    const probs = computeProbabilities(corners, edges, surface, centering);
    return probs.map((p, i) => {
      const grade = i + 1;
      const mult = GRADE_MULTIPLIERS[grade];
      // For gem mint, use gemValue if available
      const value = grade === 10 && gemValue > 0 ? gemValue :
        grade === 9 ? rawValue * 2.5 :
        rawValue * mult;
      return { grade, probability: p, estimatedValue: value };
    });
  }, [corners, edges, surface, centering, rawValue, gemValue]);

  const expectedValue = useMemo(() => {
    return probabilities.reduce((sum, p) => sum + p.probability * p.estimatedValue, 0);
  }, [probabilities]);

  const gradingCost = GRADING_COSTS[gradingService] || 25;
  const netExpectedValue = expectedValue - gradingCost;
  const roi = rawValue > 0 ? ((netExpectedValue - rawValue) / (rawValue + gradingCost)) * 100 : 0;

  const mostLikelyGrade = probabilities.reduce((best, p) =>
    p.probability > best.probability ? p : best, probabilities[0]);

  const psa10Prob = probabilities[9]?.probability || 0;
  const psa9PlusProb = (probabilities[8]?.probability || 0) + psa10Prob;

  const handleCalculate = () => {
    setShowResults(true);
  };

  const verdict = roi > 50 ? { text: 'Strong Grade', color: 'text-green-400 bg-green-950/50 border-green-800/50', desc: 'High expected ROI. Grading is likely profitable.' }
    : roi > 10 ? { text: 'Worth Grading', color: 'text-emerald-400 bg-emerald-950/50 border-emerald-800/50', desc: 'Positive expected return after grading costs.' }
    : roi > -10 ? { text: 'Break Even', color: 'text-yellow-400 bg-yellow-950/50 border-yellow-800/50', desc: 'Marginal return. Consider if you want the slab for protection.' }
    : { text: 'Skip Grading', color: 'text-red-400 bg-red-950/50 border-red-800/50', desc: 'Grading cost likely exceeds the value increase.' };

  return (
    <div className="space-y-8">
      {/* Card Search */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">1. Select a Card</h2>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setShowResults(false); }}
            placeholder="Search 5,200+ cards... (e.g., 2024 Topps Chrome Ohtani)"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />
          {filtered.length > 0 && !selectedCard && (
            <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg max-h-64 overflow-y-auto">
              {filtered.map(c => (
                <button
                  key={c.slug}
                  onClick={() => { setSelectedCard(c); setQuery(c.name); setManualRaw(''); }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors border-b border-gray-700/50 last:border-0"
                >
                  <div className="text-white text-sm font-medium">{c.name}</div>
                  <div className="text-gray-400 text-xs">{c.player} &middot; {c.sport} &middot; Raw: {c.estimatedValueRaw}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedCard && (
          <div className="mt-4 flex items-center gap-4 bg-gray-800/60 border border-gray-700/50 rounded-lg p-4">
            <div className="flex-1">
              <div className="text-white font-semibold">{selectedCard.name}</div>
              <div className="text-gray-400 text-sm mt-1">
                Raw: {selectedCard.estimatedValueRaw} &middot; Gem: {selectedCard.estimatedValueGem}
              </div>
            </div>
            <button
              onClick={() => { setSelectedCard(null); setQuery(''); setShowResults(false); }}
              className="text-gray-500 hover:text-white text-sm"
            >
              Change
            </button>
          </div>
        )}

        <div className="mt-4">
          <label className="text-gray-400 text-sm block mb-1">Or enter raw value manually ($)</label>
          <input
            type="number"
            value={manualRaw}
            onChange={e => { setManualRaw(e.target.value); setShowResults(false); }}
            placeholder="e.g., 50"
            className="w-40 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 text-sm"
          />
        </div>
      </div>

      {/* Condition Assessment */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">2. Assess Condition</h2>
        <p className="text-gray-400 text-sm mb-6">Rate each aspect of your card&apos;s condition. Be honest — optimistic ratings lead to disappointment.</p>

        {[
          { label: 'Corners', key: 'corners' as const, value: corners, set: setCorners },
          { label: 'Edges', key: 'edges' as const, value: edges, set: setEdges },
          { label: 'Surface', key: 'surface' as const, value: surface, set: setSurface },
          { label: 'Centering', key: 'centering' as const, value: centering, set: setCentering },
        ].map(({ label, key, value, set }) => (
          <div key={key} className="mb-6 last:mb-0">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white font-medium">{label}</span>
              <span className="text-sm font-mono text-indigo-400">{value}/5 — {CONDITION_LABELS[value]}</span>
            </div>
            <div className="flex gap-2 mb-2">
              {([1, 2, 3, 4, 5] as ConditionRating[]).map(r => (
                <button
                  key={r}
                  onClick={() => { set(r); setShowResults(false); }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    value === r
                      ? 'bg-indigo-600 text-white border border-indigo-500'
                      : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <p className="text-gray-500 text-xs">{CONDITION_DESCRIPTIONS[key][value]}</p>
          </div>
        ))}
      </div>

      {/* Grading Service */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">3. Grading Service</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(GRADING_COSTS).map(([service, cost]) => (
            <button
              key={service}
              onClick={() => { setGradingService(service); setShowResults(false); }}
              className={`p-3 rounded-lg text-sm border transition-all ${
                gradingService === service
                  ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <div className="font-medium">{service}</div>
              <div className="text-xs mt-1 opacity-70">${cost}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Calculate Button */}
      <button
        onClick={handleCalculate}
        disabled={rawValue === 0}
        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold rounded-xl text-lg transition-all"
      >
        {rawValue > 0 ? 'Calculate Grading Probabilities' : 'Select a card or enter a value first'}
      </button>

      {/* Results */}
      {showResults && rawValue > 0 && (
        <div className="space-y-6">
          {/* Verdict Banner */}
          <div className={`border rounded-xl p-6 ${verdict.color}`}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="text-2xl font-bold">{verdict.text}</div>
                <div className="text-sm opacity-80 mt-1">{verdict.desc}</div>
              </div>
              <div className="text-right">
                <div className="text-sm opacity-70">Expected ROI</div>
                <div className="text-2xl font-bold">{roi > 0 ? '+' : ''}{roi.toFixed(0)}%</div>
              </div>
            </div>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Most Likely Grade', value: `PSA ${mostLikelyGrade.grade}`, sub: `${(mostLikelyGrade.probability * 100).toFixed(0)}% chance` },
              { label: 'PSA 10 Probability', value: `${(psa10Prob * 100).toFixed(1)}%`, sub: psa10Prob > 0.15 ? 'Good shot' : psa10Prob > 0.05 ? 'Possible' : 'Unlikely' },
              { label: 'Expected Value', value: fmt(netExpectedValue), sub: `After ${fmt(gradingCost)} grading` },
              { label: 'PSA 9+ Chance', value: `${(psa9PlusProb * 100).toFixed(0)}%`, sub: psa9PlusProb > 0.5 ? 'Likely high grade' : 'Mixed outcome' },
            ].map(s => (
              <div key={s.label} className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
                <div className="text-gray-400 text-xs mb-1">{s.label}</div>
                <div className="text-white text-xl font-bold">{s.value}</div>
                <div className="text-gray-500 text-xs mt-1">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Probability Distribution Chart */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
            <h3 className="text-white font-bold mb-4">Grade Probability Distribution</h3>
            <div className="space-y-2">
              {probabilities.map(p => {
                const barWidth = Math.max(p.probability * 100, 1);
                const isTop = p.grade === mostLikelyGrade.grade;
                return (
                  <div key={p.grade} className="flex items-center gap-3">
                    <div className="w-20 text-right">
                      <span className={`text-sm font-mono ${isTop ? 'text-indigo-400 font-bold' : 'text-gray-400'}`}>
                        PSA {p.grade}
                      </span>
                    </div>
                    <div className="flex-1 bg-gray-800 rounded-full h-6 relative overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isTop ? 'bg-indigo-500' : p.grade >= 9 ? 'bg-emerald-600/70' : p.grade >= 7 ? 'bg-blue-600/60' : 'bg-gray-600/60'
                        }`}
                        style={{ width: `${barWidth}%` }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-xs text-white/80 font-medium">
                        {(p.probability * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-20 text-right">
                      <span className={`text-sm ${isTop ? 'text-white font-bold' : 'text-gray-500'}`}>
                        {fmt(p.estimatedValue)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 text-xs text-gray-500">
              Values estimated using market multipliers. PSA 10 uses gem mint value when available.
            </div>
          </div>

          {/* Expected Value Breakdown */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
            <h3 className="text-white font-bold mb-4">Expected Value Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-800">
                    <th className="text-left py-2 px-2">Grade</th>
                    <th className="text-left py-2 px-2">Name</th>
                    <th className="text-right py-2 px-2">Probability</th>
                    <th className="text-right py-2 px-2">Value</th>
                    <th className="text-right py-2 px-2">Weighted</th>
                  </tr>
                </thead>
                <tbody>
                  {probabilities.filter(p => p.probability > 0.01).map(p => (
                    <tr key={p.grade} className={`border-b border-gray-800/50 ${p.grade === mostLikelyGrade.grade ? 'bg-indigo-950/20' : ''}`}>
                      <td className="py-2 px-2 font-mono text-white">PSA {p.grade}</td>
                      <td className="py-2 px-2 text-gray-400">{GRADE_LABELS[p.grade]}</td>
                      <td className="py-2 px-2 text-right text-gray-300">{(p.probability * 100).toFixed(1)}%</td>
                      <td className="py-2 px-2 text-right text-gray-300">{fmt(p.estimatedValue)}</td>
                      <td className="py-2 px-2 text-right text-indigo-400">{fmt(p.probability * p.estimatedValue)}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-gray-700 font-bold">
                    <td colSpan={4} className="py-2 px-2 text-white">Expected Graded Value</td>
                    <td className="py-2 px-2 text-right text-indigo-400">{fmt(expectedValue)}</td>
                  </tr>
                  <tr>
                    <td colSpan={4} className="py-2 px-2 text-gray-400">Minus grading cost ({gradingService})</td>
                    <td className="py-2 px-2 text-right text-red-400">-{fmt(gradingCost)}</td>
                  </tr>
                  <tr className="font-bold">
                    <td colSpan={4} className="py-2 px-2 text-white">Net Expected Value</td>
                    <td className={`py-2 px-2 text-right ${netExpectedValue > rawValue ? 'text-green-400' : 'text-red-400'}`}>
                      {fmt(netExpectedValue)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={4} className="py-2 px-2 text-gray-400">Current raw value</td>
                    <td className="py-2 px-2 text-right text-gray-300">{fmt(rawValue)}</td>
                  </tr>
                  <tr className="font-bold border-t-2 border-gray-700">
                    <td colSpan={4} className="py-2 px-2 text-white">Net Gain/Loss</td>
                    <td className={`py-2 px-2 text-right ${netExpectedValue > rawValue ? 'text-green-400' : 'text-red-400'}`}>
                      {netExpectedValue > rawValue ? '+' : ''}{fmt(netExpectedValue - rawValue)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Scenario Analysis */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
            <h3 className="text-white font-bold mb-4">Scenario Analysis</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                {
                  label: 'Best Case',
                  desc: `Gets PSA 10 (${(psa10Prob * 100).toFixed(1)}% chance)`,
                  value: (probabilities[9]?.estimatedValue || 0) - gradingCost,
                  profit: (probabilities[9]?.estimatedValue || 0) - gradingCost - rawValue,
                },
                {
                  label: 'Most Likely',
                  desc: `Gets PSA ${mostLikelyGrade.grade} (${(mostLikelyGrade.probability * 100).toFixed(0)}% chance)`,
                  value: mostLikelyGrade.estimatedValue - gradingCost,
                  profit: mostLikelyGrade.estimatedValue - gradingCost - rawValue,
                },
                {
                  label: 'Worst Case',
                  desc: `Gets PSA ${Math.max(1, mostLikelyGrade.grade - 3)}`,
                  value: (probabilities[Math.max(0, mostLikelyGrade.grade - 4)]?.estimatedValue || 0) - gradingCost,
                  profit: (probabilities[Math.max(0, mostLikelyGrade.grade - 4)]?.estimatedValue || 0) - gradingCost - rawValue,
                },
              ].map(s => (
                <div key={s.label} className="bg-gray-800/50 rounded-lg p-4">
                  <div className="text-white font-semibold mb-1">{s.label}</div>
                  <div className="text-gray-400 text-xs mb-3">{s.desc}</div>
                  <div className="text-white text-lg font-bold">{fmt(s.value)}</div>
                  <div className={`text-sm mt-1 ${s.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {s.profit >= 0 ? '+' : ''}{fmt(s.profit)} profit
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Presets */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
            <h3 className="text-white font-bold mb-4">Quick Condition Presets</h3>
            <div className="flex flex-wrap gap-3">
              {[
                { label: 'Pack Fresh', c: 5 as ConditionRating, e: 5 as ConditionRating, s: 5 as ConditionRating, cn: 4 as ConditionRating },
                { label: 'Near Mint', c: 4 as ConditionRating, e: 4 as ConditionRating, s: 4 as ConditionRating, cn: 3 as ConditionRating },
                { label: 'Light Wear', c: 3 as ConditionRating, e: 3 as ConditionRating, s: 3 as ConditionRating, cn: 3 as ConditionRating },
                { label: 'Moderate Wear', c: 2 as ConditionRating, e: 2 as ConditionRating, s: 3 as ConditionRating, cn: 3 as ConditionRating },
                { label: 'Heavy Wear', c: 1 as ConditionRating, e: 1 as ConditionRating, s: 2 as ConditionRating, cn: 2 as ConditionRating },
              ].map(p => (
                <button
                  key={p.label}
                  onClick={() => {
                    setCorners(p.c); setEdges(p.e); setSurface(p.s); setCentering(p.cn);
                    setShowResults(false);
                  }}
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 text-sm hover:bg-gray-700 hover:text-white transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Related Tools */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
            <h3 className="text-white font-bold mb-4">Related Tools</h3>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { href: '/tools/condition-grader', label: 'Condition Self-Grader', desc: 'Step-by-step condition assessment' },
                { href: '/tools/grade-value-chart', label: 'Grade Value Chart', desc: 'Value at every PSA grade' },
                { href: '/tools/submission-planner', label: 'Submission Planner', desc: 'Compare grading companies & tiers' },
                { href: '/tools/grading-roi', label: 'Grading ROI Calculator', desc: 'Raw vs graded value analysis' },
                { href: '/tools/bgs-subgrade', label: 'BGS Subgrade Calculator', desc: 'Calculate BGS subgrade impact' },
                { href: '/tools/photo-grade-estimator', label: 'Photo Grade Estimator', desc: 'Quick visual grade assessment' },
              ].map(t => (
                <Link key={t.href} href={t.href}
                  className="p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg hover:bg-gray-700/50 transition-colors"
                >
                  <div className="text-white text-sm font-medium">{t.label}</div>
                  <div className="text-gray-500 text-xs mt-1">{t.desc}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
