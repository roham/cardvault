'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

function parseValue(raw: string): number {
  const m = raw.match(/\$[\d,]+/);
  if (!m) return 0;
  return parseInt(m[0].replace(/[$,]/g, ''), 10);
}

function parseGemValue(gem: string): number {
  const m = gem.match(/\$[\d,]+/);
  if (!m) return 0;
  return parseInt(m[0].replace(/[$,]/g, ''), 10);
}

const SPORT_COLORS: Record<string, string> = {
  baseball: 'text-red-400',
  basketball: 'text-orange-400',
  football: 'text-blue-400',
  hockey: 'text-cyan-400',
};

const COMPANIES = ['PSA', 'BGS', 'CGC', 'SGC'] as const;
type Company = (typeof COMPANIES)[number];

// Grades available per company
const GRADES: Record<Company, number[]> = {
  PSA: [1, 1.5, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  BGS: [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
  CGC: [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
  SGC: [1, 1.5, 2, 3, 4, 5, 6, 7, 8, 9, 10],
};

const COMPANY_COLORS: Record<Company, { text: string; bg: string; border: string }> = {
  PSA: { text: 'text-red-400', bg: 'bg-red-950/40', border: 'border-red-800/40' },
  BGS: { text: 'text-amber-400', bg: 'bg-amber-950/40', border: 'border-amber-800/40' },
  CGC: { text: 'text-emerald-400', bg: 'bg-emerald-950/40', border: 'border-emerald-800/40' },
  SGC: { text: 'text-sky-400', bg: 'bg-sky-950/40', border: 'border-sky-800/40' },
};

// Grading costs (economy tier)
const GRADING_COSTS: Record<Company, { base: number; premiumThreshold: number; premiumCost: number }> = {
  PSA: { base: 20, premiumThreshold: 500, premiumCost: 50 },
  BGS: { base: 22, premiumThreshold: 500, premiumCost: 40 },
  CGC: { base: 20, premiumThreshold: 500, premiumCost: 35 },
  SGC: { base: 20, premiumThreshold: 500, premiumCost: 30 },
};

const CRACK_COST = 10; // average cost to crack a slab
const SHIPPING_COST = 12; // return shipping per card

// Value multiplier by grade (relative to raw value)
// Raw = 1.0, PSA 1 = 0.3, PSA 10 = gem value
function gradeMultiplier(grade: number, company: Company): number {
  // Base curve: exponential growth from grade 1 to 10
  const base: Record<number, number> = {
    1: 0.3, 1.5: 0.35, 2: 0.4, 2.5: 0.45, 3: 0.5, 3.5: 0.55,
    4: 0.6, 4.5: 0.65, 5: 0.7, 5.5: 0.8, 6: 0.9, 6.5: 1.0,
    7: 1.2, 7.5: 1.4, 8: 1.8, 8.5: 2.2, 9: 3.0, 9.5: 5.0, 10: 8.0,
  };
  let mult = base[grade] || 1.0;

  // Company premium adjustments
  if (company === 'PSA') mult *= 1.15; // PSA commands highest premiums
  if (company === 'BGS' && grade === 9.5) mult *= 1.1; // BGS 9.5 is prestigious
  if (company === 'BGS' && grade === 10) mult *= 1.3; // BGS 10 (Pristine) is rarer than PSA 10
  if (company === 'CGC') mult *= 0.85; // CGC trades at slight discount
  if (company === 'SGC') mult *= 0.80; // SGC trades at bigger discount

  return mult;
}

// Upgrade probability matrix: what grade you might get when regrading
function getOutcomeProbabilities(currentGrade: number, fromCompany: Company, toCompany: Company): { grade: number; prob: number }[] {
  const outcomes: { grade: number; prob: number }[] = [];
  const targetGrades = GRADES[toCompany];

  // Find the equivalent grade on target scale
  for (const g of targetGrades) {
    let prob = 0;

    if (fromCompany === toCompany) {
      // Same company resubmit
      const diff = g - currentGrade;
      if (diff === 0) prob = 0.50; // 50% same grade
      else if (diff === 0.5) prob = 0.18;
      else if (diff === 1) prob = 0.08;
      else if (diff === -0.5) prob = 0.12;
      else if (diff === -1) prob = 0.06;
      else if (diff === -1.5 || diff === -2) prob = 0.02;
      else if (diff === 1.5) prob = 0.02;
      else prob = 0;

      // PSA 9 to PSA 10 is especially sought after
      if (fromCompany === 'PSA' && currentGrade === 9 && g === 10) prob = 0.12;
      if (fromCompany === 'PSA' && currentGrade === 9 && g === 9) prob = 0.60;
      if (fromCompany === 'PSA' && currentGrade === 9 && g === 8) prob = 0.15;
    } else {
      // Cross-company regrade
      const diff = g - currentGrade;

      // BGS → PSA crossover tendencies
      if (fromCompany === 'BGS' && toCompany === 'PSA') {
        if (currentGrade === 9.5 && g === 10) prob = 0.55;
        else if (currentGrade === 9.5 && g === 9) prob = 0.35;
        else if (currentGrade === 9.5 && g === 8) prob = 0.05;
        else if (currentGrade === 9 && g === 10) prob = 0.08;
        else if (currentGrade === 9 && g === 9) prob = 0.65;
        else if (currentGrade === 9 && g === 8) prob = 0.18;
        else {
          if (diff === 0) prob = 0.55;
          else if (diff === 0.5 || diff === 1) prob = 0.15;
          else if (diff === -0.5 || diff === -1) prob = 0.10;
          else prob = 0;
        }
      }
      // CGC → PSA
      else if (fromCompany === 'CGC' && toCompany === 'PSA') {
        if (diff === 0) prob = 0.50;
        else if (diff === 0.5 || diff === 1) prob = 0.18;
        else if (diff === -0.5 || diff === -1) prob = 0.10;
        else prob = 0;
      }
      // SGC → PSA
      else if (fromCompany === 'SGC' && toCompany === 'PSA') {
        if (diff === 0) prob = 0.48;
        else if (diff === 1) prob = 0.15;
        else if (diff === -1) prob = 0.12;
        else prob = 0;
      }
      // PSA → BGS (usually downgrades or holds)
      else if (fromCompany === 'PSA' && toCompany === 'BGS') {
        if (currentGrade === 10 && g === 9.5) prob = 0.55;
        else if (currentGrade === 10 && g === 10) prob = 0.15;
        else if (currentGrade === 10 && g === 9) prob = 0.20;
        else {
          if (diff === 0) prob = 0.40;
          else if (diff === -0.5) prob = 0.25;
          else if (diff === -1) prob = 0.15;
          else if (diff === 0.5) prob = 0.10;
          else prob = 0;
        }
      }
      // Default cross-company
      else {
        if (diff === 0) prob = 0.45;
        else if (diff === 0.5 || diff === 1) prob = 0.15;
        else if (diff === -0.5) prob = 0.15;
        else if (diff === -1) prob = 0.08;
        else prob = 0;
      }
    }

    if (prob > 0 && g >= 1 && g <= 10) {
      outcomes.push({ grade: g, prob });
    }
  }

  // Normalize probabilities to sum to 1
  const total = outcomes.reduce((s, o) => s + o.prob, 0);
  if (total > 0) {
    for (const o of outcomes) o.prob = o.prob / total;
  }

  return outcomes.sort((a, b) => b.grade - a.grade);
}

export default function RegradeCalcClient() {
  const [query, setQuery] = useState('');
  const [selectedCard, setSelectedCard] = useState<(typeof sportsCards)[0] | null>(null);
  const [fromCompany, setFromCompany] = useState<Company>('PSA');
  const [currentGrade, setCurrentGrade] = useState<number>(9);
  const [toCompany, setToCompany] = useState<Company>('PSA');
  const [showResults, setShowResults] = useState(false);

  const searchResults = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    return sportsCards
      .filter(c => c.name.toLowerCase().includes(q) || c.player.toLowerCase().includes(q))
      .slice(0, 12);
  }, [query]);

  const selectCard = useCallback((card: (typeof sportsCards)[0]) => {
    setSelectedCard(card);
    setQuery('');
    setShowResults(false);
  }, []);

  const analysis = useMemo(() => {
    if (!selectedCard) return null;

    const rawVal = parseValue(selectedCard.estimatedValueRaw);
    const gemVal = parseGemValue(selectedCard.estimatedValueGem);
    if (rawVal === 0) return null;

    // Current value at current grade
    const currentMult = gradeMultiplier(currentGrade, fromCompany);
    const currentValue = Math.round(rawVal * currentMult);

    // Costs
    const isSameCompany = fromCompany === toCompany;
    const crackCost = isSameCompany ? 0 : CRACK_COST;
    const gradingCostInfo = GRADING_COSTS[toCompany];
    const gradingCost = currentValue >= gradingCostInfo.premiumThreshold ? gradingCostInfo.premiumCost : gradingCostInfo.base;
    const totalCost = crackCost + gradingCost + SHIPPING_COST;

    // Get outcome probabilities
    const outcomes = getOutcomeProbabilities(currentGrade, fromCompany, toCompany);

    // Calculate EV for each outcome
    const outcomeDetails = outcomes.map(o => {
      const newMult = gradeMultiplier(o.grade, toCompany);
      const newValue = Math.round(rawVal * newMult);
      const profit = newValue - currentValue - totalCost;
      return {
        grade: o.grade,
        prob: o.prob,
        value: newValue,
        profit,
        ev: o.prob * profit,
      };
    });

    const totalEV = outcomeDetails.reduce((s, o) => s + o.ev, 0);
    const upgradeProb = outcomeDetails.filter(o => o.grade > currentGrade).reduce((s, o) => s + o.prob, 0);
    const downgradeProb = outcomeDetails.filter(o => o.grade < currentGrade).reduce((s, o) => s + o.prob, 0);
    const sameProb = outcomeDetails.filter(o => o.grade === currentGrade).reduce((s, o) => s + o.prob, 0);

    // Best and worst case
    const bestCase = outcomeDetails.reduce((best, o) => o.profit > best.profit ? o : best, outcomeDetails[0]);
    const worstCase = outcomeDetails.reduce((worst, o) => o.profit < worst.profit ? o : worst, outcomeDetails[0]);

    // Verdict
    let verdict: string;
    let verdictColor: string;
    let verdictBg: string;
    let verdictDesc: string;

    if (totalEV > totalCost * 0.5) {
      verdict = 'REGRADE';
      verdictColor = 'text-emerald-400';
      verdictBg = 'bg-emerald-950/50 border-emerald-800/40';
      verdictDesc = 'Expected value gain exceeds costs. The regrade has positive expected value.';
    } else if (totalEV > 0) {
      verdict = 'MARGINAL';
      verdictColor = 'text-amber-400';
      verdictBg = 'bg-amber-950/50 border-amber-800/40';
      verdictDesc = 'Slightly positive EV, but tight margins. Only regrade if you believe the card is undergraded.';
    } else if (totalEV > -totalCost * 0.5) {
      verdict = 'HOLD';
      verdictColor = 'text-gray-400';
      verdictBg = 'bg-gray-900/50 border-gray-800/40';
      verdictDesc = 'Expected value is near break-even or slightly negative. Keep the current slab.';
    } else {
      verdict = 'NOT WORTH IT';
      verdictColor = 'text-rose-400';
      verdictBg = 'bg-rose-950/50 border-rose-800/40';
      verdictDesc = 'The costs and downgrade risk outweigh the potential gain. Keep your current slab.';
    }

    return {
      currentValue,
      crackCost,
      gradingCost,
      shippingCost: SHIPPING_COST,
      totalCost,
      outcomes: outcomeDetails,
      totalEV,
      upgradeProb,
      downgradeProb,
      sameProb,
      bestCase,
      worstCase,
      verdict,
      verdictColor,
      verdictBg,
      verdictDesc,
      isSameCompany,
    };
  }, [selectedCard, fromCompany, currentGrade, toCompany]);

  const handleAnalyze = () => {
    if (selectedCard) setShowResults(true);
  };

  return (
    <div className="space-y-6">
      {/* Step 1: Find Card */}
      <div className="bg-gray-900/60 border border-gray-800/50 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-amber-400 mb-3">Step 1: Find Your Card</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search by player name or card name..."
            value={selectedCard ? selectedCard.name : query}
            onChange={e => { setQuery(e.target.value); setSelectedCard(null); setShowResults(false); }}
            className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 outline-none text-sm"
          />
          {query.length >= 2 && searchResults.length > 0 && !selectedCard && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-700 rounded-lg max-h-72 overflow-y-auto z-20">
              {searchResults.map(c => (
                <button
                  key={c.slug}
                  onClick={() => selectCard(c)}
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-800 flex items-center justify-between gap-3 border-b border-gray-800/50 last:border-0"
                >
                  <div>
                    <div className="text-sm text-white">{c.name}</div>
                    <div className="text-xs text-gray-500">{c.player} &middot; {c.sport}</div>
                  </div>
                  <div className="text-xs text-gray-400 whitespace-nowrap">{c.estimatedValueRaw}</div>
                </button>
              ))}
            </div>
          )}
        </div>
        {selectedCard && (
          <div className="mt-3 flex items-center gap-3 bg-gray-950/60 border border-gray-800/40 rounded-lg p-3">
            <div className="flex-1">
              <div className="text-sm font-medium text-white">{selectedCard.name}</div>
              <div className="text-xs text-gray-400 mt-0.5">
                <span className={SPORT_COLORS[selectedCard.sport]}>{selectedCard.sport}</span>
                {' '}&middot; Raw: {selectedCard.estimatedValueRaw} &middot; Gem: {selectedCard.estimatedValueGem}
                {selectedCard.rookie && <span className="ml-2 text-amber-400">RC</span>}
              </div>
            </div>
            <button onClick={() => { setSelectedCard(null); setQuery(''); setShowResults(false); }} className="text-xs text-gray-500 hover:text-white">
              Change
            </button>
          </div>
        )}
      </div>

      {/* Step 2: Current Slab */}
      <div className="bg-gray-900/60 border border-gray-800/50 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-amber-400 mb-3">Step 2: Current Slab</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Grading Company</label>
            <div className="grid grid-cols-4 gap-2">
              {COMPANIES.map(c => (
                <button
                  key={c}
                  onClick={() => {
                    setFromCompany(c);
                    if (!GRADES[c].includes(currentGrade)) {
                      setCurrentGrade(GRADES[c].reduce((prev, curr) =>
                        Math.abs(curr - currentGrade) < Math.abs(prev - currentGrade) ? curr : prev
                      ));
                    }
                    setShowResults(false);
                  }}
                  className={`py-2 rounded-lg text-xs font-bold border transition-colors ${
                    fromCompany === c
                      ? `${COMPANY_COLORS[c].bg} ${COMPANY_COLORS[c].border} ${COMPANY_COLORS[c].text}`
                      : 'bg-gray-950 border-gray-800 text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Current Grade</label>
            <select
              value={currentGrade}
              onChange={e => { setCurrentGrade(parseFloat(e.target.value)); setShowResults(false); }}
              className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-amber-600"
            >
              {GRADES[fromCompany].map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Step 3: Target Company */}
      <div className="bg-gray-900/60 border border-gray-800/50 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-amber-400 mb-3">Step 3: Regrade To</h2>
        <div className="grid grid-cols-4 gap-2">
          {COMPANIES.map(c => (
            <button
              key={c}
              onClick={() => { setToCompany(c); setShowResults(false); }}
              className={`py-2.5 rounded-lg text-xs font-bold border transition-colors ${
                toCompany === c
                  ? `${COMPANY_COLORS[c].bg} ${COMPANY_COLORS[c].border} ${COMPANY_COLORS[c].text}`
                  : 'bg-gray-950 border-gray-800 text-gray-500 hover:text-gray-300'
              }`}
            >
              {c}
              {c === fromCompany && <div className="text-[10px] font-normal mt-0.5 opacity-60">Same</div>}
            </button>
          ))}
        </div>
      </div>

      {/* Analyze Button */}
      <button
        onClick={handleAnalyze}
        disabled={!selectedCard}
        className="w-full py-3.5 rounded-xl font-bold text-sm bg-amber-600 hover:bg-amber-500 text-white disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
      >
        {selectedCard ? `Analyze ${fromCompany} ${currentGrade} \u2192 ${toCompany} Regrade` : 'Select a Card First'}
      </button>

      {/* Results */}
      {showResults && analysis && (
        <div className="space-y-5 animate-in fade-in duration-300">
          {/* Verdict */}
          <div className={`border rounded-xl p-5 ${analysis.verdictBg}`}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className={`text-2xl font-bold ${analysis.verdictColor}`}>{analysis.verdict}</div>
                <div className="text-sm text-gray-400 mt-1">{analysis.verdictDesc}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500 uppercase">Expected Value</div>
                <div className={`text-xl font-bold ${analysis.totalEV >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {analysis.totalEV >= 0 ? '+' : ''}{formatMoney(analysis.totalEV)}
                </div>
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="bg-gray-900/60 border border-gray-800/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Cost Breakdown</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Current slab value ({fromCompany} {currentGrade})</span>
                <span className="text-white font-medium">{formatMoney(analysis.currentValue)}</span>
              </div>
              {!analysis.isSameCompany && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Slab cracking cost</span>
                  <span className="text-rose-400">-{formatMoney(analysis.crackCost)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Grading fee ({toCompany})</span>
                <span className="text-rose-400">-{formatMoney(analysis.gradingCost)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Return shipping</span>
                <span className="text-rose-400">-{formatMoney(analysis.shippingCost)}</span>
              </div>
              <div className="border-t border-gray-800 pt-2 flex justify-between text-sm font-bold">
                <span className="text-gray-300">Total regrade cost</span>
                <span className="text-rose-400">-{formatMoney(analysis.totalCost)}</span>
              </div>
            </div>
          </div>

          {/* Probability Breakdown */}
          <div className="bg-gray-900/60 border border-gray-800/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Grade Outcome Probabilities</h3>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center bg-emerald-950/30 border border-emerald-900/30 rounded-lg p-3">
                <div className="text-lg font-bold text-emerald-400">{(analysis.upgradeProb * 100).toFixed(0)}%</div>
                <div className="text-xs text-gray-500">Upgrade</div>
              </div>
              <div className="text-center bg-gray-800/30 border border-gray-700/30 rounded-lg p-3">
                <div className="text-lg font-bold text-gray-300">{(analysis.sameProb * 100).toFixed(0)}%</div>
                <div className="text-xs text-gray-500">Same Grade</div>
              </div>
              <div className="text-center bg-rose-950/30 border border-rose-900/30 rounded-lg p-3">
                <div className="text-lg font-bold text-rose-400">{(analysis.downgradeProb * 100).toFixed(0)}%</div>
                <div className="text-xs text-gray-500">Downgrade</div>
              </div>
            </div>

            <div className="space-y-1.5">
              {analysis.outcomes.map(o => {
                const isUpgrade = o.grade > currentGrade;
                const isDowngrade = o.grade < currentGrade;
                const barColor = isUpgrade ? 'bg-emerald-500' : isDowngrade ? 'bg-rose-500' : 'bg-gray-500';
                const textColor = isUpgrade ? 'text-emerald-400' : isDowngrade ? 'text-rose-400' : 'text-gray-400';
                return (
                  <div key={o.grade} className="flex items-center gap-3 text-sm">
                    <div className="w-20 text-right">
                      <span className={`font-medium ${textColor}`}>{toCompany} {o.grade}</span>
                    </div>
                    <div className="flex-1 bg-gray-800 rounded-full h-4 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${barColor} transition-all duration-500`}
                        style={{ width: `${Math.max(o.prob * 100, 2)}%` }}
                      />
                    </div>
                    <div className="w-12 text-right text-xs text-gray-400">{(o.prob * 100).toFixed(0)}%</div>
                    <div className={`w-20 text-right text-xs font-medium ${o.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {o.profit >= 0 ? '+' : ''}{formatMoney(o.profit)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scenario Comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-4">
              <div className="text-xs text-emerald-500 uppercase font-medium mb-1">Best Case</div>
              <div className="text-lg font-bold text-white">{toCompany} {analysis.bestCase.grade}</div>
              <div className="text-sm text-emerald-400 font-medium">+{formatMoney(analysis.bestCase.profit)} profit</div>
              <div className="text-xs text-gray-500 mt-1">New value: {formatMoney(analysis.bestCase.value)} ({(analysis.bestCase.prob * 100).toFixed(0)}% chance)</div>
            </div>
            <div className="bg-rose-950/20 border border-rose-900/30 rounded-xl p-4">
              <div className="text-xs text-rose-500 uppercase font-medium mb-1">Worst Case</div>
              <div className="text-lg font-bold text-white">{toCompany} {analysis.worstCase.grade}</div>
              <div className="text-sm text-rose-400 font-medium">{formatMoney(analysis.worstCase.profit)} loss</div>
              <div className="text-xs text-gray-500 mt-1">New value: {formatMoney(analysis.worstCase.value)} ({(analysis.worstCase.prob * 100).toFixed(0)}% chance)</div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-gray-900/60 border border-gray-800/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Regrade Tips</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              {analysis.isSameCompany ? (
                <>
                  <li className="flex gap-2"><span className="text-amber-400">*</span> Same-company resubmits skip the cracking step but rarely produce more than +0.5 grade improvement</li>
                  <li className="flex gap-2"><span className="text-amber-400">*</span> If you believe the card was undergraded due to a specific flaw (centering, surface), note it on the submission form</li>
                  <li className="flex gap-2"><span className="text-amber-400">*</span> {fromCompany} resubmit turnaround is typically 30-60 days at economy service level</li>
                </>
              ) : (
                <>
                  <li className="flex gap-2"><span className="text-amber-400">*</span> Use a proper slab cracking tool (not pliers or hammers) to avoid damaging the card</li>
                  <li className="flex gap-2"><span className="text-amber-400">*</span> Wear cotton gloves when handling the raw card after cracking — fingerprints cause surface deductions</li>
                  <li className="flex gap-2"><span className="text-amber-400">*</span> Place the card in a penny sleeve and top loader immediately after cracking</li>
                </>
              )}
              {currentGrade >= 9 && (
                <li className="flex gap-2"><span className="text-amber-400">*</span> High-grade cards ({currentGrade}+) have the most to gain from regrading but also the most to lose</li>
              )}
              {analysis.totalEV < 0 && (
                <li className="flex gap-2"><span className="text-amber-400">*</span> The math says hold, but if you genuinely believe the card was undergraded, trust your eye test</li>
              )}
              <li className="flex gap-2">
                <span className="text-amber-400">*</span>
                <span>Check <Link href="/tools/grade-spread" className="text-amber-400 underline">Grade Price Spread</Link> to see the full value curve for this card</span>
              </li>
            </ul>
          </div>

          {/* Share */}
          <button
            onClick={() => {
              const text = `Card Regrade Analysis:\n${selectedCard?.name}\n${fromCompany} ${currentGrade} → ${toCompany}\nVerdict: ${analysis.verdict}\nExpected Value: ${analysis.totalEV >= 0 ? '+' : ''}${formatMoney(analysis.totalEV)}\nUpgrade: ${(analysis.upgradeProb * 100).toFixed(0)}% | Same: ${(analysis.sameProb * 100).toFixed(0)}% | Down: ${(analysis.downgradeProb * 100).toFixed(0)}%\nTotal Cost: ${formatMoney(analysis.totalCost)}\n\ncardvault-two.vercel.app/tools/regrade-calc`;
              navigator.clipboard.writeText(text);
            }}
            className="w-full py-2.5 rounded-lg text-sm font-medium bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 transition-colors"
          >
            Copy Analysis to Clipboard
          </button>
        </div>
      )}
    </div>
  );
}

function formatMoney(val: number): string {
  const abs = Math.abs(Math.round(val));
  const formatted = abs >= 1000 ? `$${(abs / 1000).toFixed(1)}K` : `$${abs}`;
  return val < 0 ? `-${formatted}` : formatted;
}
