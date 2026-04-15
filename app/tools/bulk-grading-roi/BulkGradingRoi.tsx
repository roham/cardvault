'use client';

import { useState, useMemo } from 'react';
import { sportsCards } from '@/data/sports-cards';

interface CardEntry {
  id: string;
  name: string;
  rawValue: number;
  gemValue: number;
  condition: number; // 1-5 (1=poor, 5=pack fresh)
  service: 'psa' | 'bgs' | 'cgc' | 'sgc';
}

const SERVICES = {
  psa: { name: 'PSA', tiers: [{ name: 'Economy', cost: 20, days: '65 business days' }, { name: 'Regular', cost: 50, days: '30 business days' }, { name: 'Express', cost: 100, days: '10 business days' }] },
  bgs: { name: 'BGS', tiers: [{ name: 'Economy', cost: 18, days: '80 business days' }, { name: 'Standard', cost: 40, days: '20 business days' }, { name: 'Express', cost: 100, days: '5 business days' }] },
  cgc: { name: 'CGC', tiers: [{ name: 'Economy', cost: 15, days: '90 business days' }, { name: 'Standard', cost: 35, days: '30 business days' }, { name: 'Express', cost: 75, days: '10 business days' }] },
  sgc: { name: 'SGC', tiers: [{ name: 'Economy', cost: 15, days: '60 business days' }, { name: 'Regular', cost: 30, days: '20 business days' }, { name: 'Express', cost: 75, days: '5 business days' }] },
};

const CONDITION_TO_GRADE: Record<number, { likely: number; best: number; worst: number }> = {
  1: { likely: 5, best: 7, worst: 3 },
  2: { likely: 7, best: 8, worst: 5 },
  3: { likely: 8, best: 9, worst: 7 },
  4: { likely: 9, best: 10, worst: 8 },
  5: { likely: 10, best: 10, worst: 9 },
};

const GRADE_MULTIPLIERS: Record<number, number> = {
  1: 0.10, 2: 0.15, 3: 0.20, 4: 0.30, 5: 0.40,
  6: 0.50, 7: 0.65, 8: 0.80, 9: 0.90, 10: 1.00,
};

function parsePrice(s: string): number {
  const match = s.match(/\$([\d,.]+)/);
  if (!match) return 0;
  return parseFloat(match[1].replace(',', ''));
}

function fmt(n: number): string {
  if (n >= 1000) return `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  return `$${n.toFixed(2)}`;
}

let idCounter = 0;
function newId() { return `card-${++idCounter}-${Date.now()}`; }

export default function BulkGradingRoi() {
  const [cards, setCards] = useState<CardEntry[]>([]);
  const [serviceTier, setServiceTier] = useState(0); // index into tiers
  const [globalService, setGlobalService] = useState<'psa' | 'bgs' | 'cgc' | 'sgc'>('psa');
  const [shippingCost, setShippingCost] = useState('15');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualRaw, setManualRaw] = useState('');
  const [manualGem, setManualGem] = useState('');

  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase();
    return sportsCards
      .filter(c => c.name.toLowerCase().includes(q) || c.player.toLowerCase().includes(q))
      .slice(0, 6);
  }, [searchQuery]);

  function addCardFromDb(card: typeof sportsCards[0]) {
    const rawVal = parsePrice(card.estimatedValueRaw);
    const gemVal = parsePrice(card.estimatedValueGem);
    setCards(prev => [...prev, {
      id: newId(),
      name: card.name,
      rawValue: rawVal,
      gemValue: gemVal,
      condition: 4,
      service: globalService,
    }]);
    setSearchQuery('');
    setShowSearch(false);
  }

  function addManualCard() {
    const raw = parseFloat(manualRaw) || 0;
    const gem = parseFloat(manualGem) || 0;
    if (!manualName || gem <= 0) return;
    setCards(prev => [...prev, {
      id: newId(),
      name: manualName,
      rawValue: raw,
      gemValue: gem,
      condition: 4,
      service: globalService,
    }]);
    setManualName('');
    setManualRaw('');
    setManualGem('');
  }

  function removeCard(id: string) {
    setCards(prev => prev.filter(c => c.id !== id));
  }

  function updateCondition(id: string, condition: number) {
    setCards(prev => prev.map(c => c.id === id ? { ...c, condition } : c));
  }

  const analysis = useMemo(() => {
    if (cards.length === 0) return null;

    const tier = SERVICES[globalService].tiers[serviceTier];
    const gradingCostPer = tier.cost;
    const shipping = parseFloat(shippingCost) || 0;

    const results = cards.map(card => {
      const grades = CONDITION_TO_GRADE[card.condition];
      const likelyGrade = grades.likely;
      const likelyMult = GRADE_MULTIPLIERS[likelyGrade];
      const gradedValue = card.gemValue * likelyMult;
      const profit = gradedValue - card.rawValue - gradingCostPer;
      const roi = card.rawValue > 0 ? ((gradedValue - card.rawValue - gradingCostPer) / (card.rawValue + gradingCostPer)) * 100 : 0;
      const worthIt = profit > 0;

      return {
        ...card,
        likelyGrade,
        gradedValue,
        gradingCost: gradingCostPer,
        profit,
        roi,
        worthIt,
      };
    });

    const totalRawValue = results.reduce((s, r) => s + r.rawValue, 0);
    const totalGradedValue = results.reduce((s, r) => s + r.gradedValue, 0);
    const totalGradingCost = gradingCostPer * cards.length + shipping;
    const totalProfit = totalGradedValue - totalRawValue - totalGradingCost;
    const totalRoi = (totalRawValue + totalGradingCost) > 0
      ? ((totalGradedValue - totalRawValue - totalGradingCost) / (totalRawValue + totalGradingCost)) * 100
      : 0;
    const worthGrading = results.filter(r => r.worthIt).length;
    const notWorth = results.filter(r => !r.worthIt).length;

    return { results, totalRawValue, totalGradedValue, totalGradingCost, totalProfit, totalRoi, worthGrading, notWorth, tier };
  }, [cards, globalService, serviceTier, shippingCost]);

  return (
    <div className="space-y-8">
      {/* Service & Tier Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Grading Company</label>
          <div className="grid grid-cols-4 gap-2">
            {(['psa', 'bgs', 'cgc', 'sgc'] as const).map(s => (
              <button
                key={s}
                onClick={() => { setGlobalService(s); setServiceTier(0); }}
                className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                  globalService === s ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {SERVICES[s].name}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Service Tier ({fmt(SERVICES[globalService].tiers[serviceTier].cost)}/card)</label>
          <select
            value={serviceTier}
            onChange={e => setServiceTier(parseInt(e.target.value))}
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
          >
            {SERVICES[globalService].tiers.map((t, i) => (
              <option key={i} value={i}>{t.name} — {fmt(t.cost)} ({t.days})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Shipping Cost (total)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="text"
              inputMode="decimal"
              value={shippingCost}
              onChange={e => setShippingCost(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-7 pr-4 py-3 text-white focus:border-blue-500 outline-none"
              placeholder="15"
            />
          </div>
        </div>
      </div>

      {/* Add Cards */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Add Cards to Submission</h2>

        {/* DB Search */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">Search Card Database (5,700+)</label>
          <input
            type="text"
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setShowSearch(true); }}
            onFocus={() => setShowSearch(true)}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
            placeholder="Type player name or card..."
          />
          {showSearch && searchResults.length > 0 && (
            <div className="mt-1 bg-gray-800 border border-gray-700 rounded-xl max-h-48 overflow-y-auto">
              {searchResults.map(c => (
                <button
                  key={c.slug}
                  onClick={() => addCardFromDb(c)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-700 text-sm text-gray-300 hover:text-white transition-colors"
                >
                  <span className="font-medium">{c.name}</span>
                  <span className="text-gray-500 ml-2">Raw: {c.estimatedValueRaw} | Gem: {c.estimatedValueGem}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Manual Entry */}
        <div className="border-t border-gray-800 pt-4">
          <p className="text-xs text-gray-500 mb-2">Or add manually:</p>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <input
              type="text"
              value={manualName}
              onChange={e => setManualName(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none"
              placeholder="Card name"
            />
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
              <input
                type="text"
                inputMode="decimal"
                value={manualRaw}
                onChange={e => setManualRaw(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-5 pr-3 py-2 text-white text-sm focus:border-blue-500 outline-none"
                placeholder="Raw value"
              />
            </div>
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
              <input
                type="text"
                inputMode="decimal"
                value={manualGem}
                onChange={e => setManualGem(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-5 pr-3 py-2 text-white text-sm focus:border-blue-500 outline-none"
                placeholder="PSA 10 value"
              />
            </div>
            <button
              onClick={addManualCard}
              className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            >
              Add Card
            </button>
          </div>
        </div>
      </div>

      {/* Card List */}
      {cards.length > 0 && (
        <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Your Submission ({cards.length} card{cards.length !== 1 ? 's' : ''})</h2>
          <div className="space-y-3">
            {cards.map(card => (
              <div key={card.id} className="flex items-center gap-3 bg-gray-800/60 rounded-xl p-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{card.name}</p>
                  <p className="text-xs text-gray-500">Raw: {fmt(card.rawValue)} | Gem: {fmt(card.gemValue)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <label className="text-xs text-gray-500 mr-1">Condition:</label>
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      onClick={() => updateCondition(card.id, n)}
                      className={`w-7 h-7 rounded text-xs font-bold transition-colors ${
                        card.condition === n
                          ? n >= 4 ? 'bg-green-600 text-white' : n >= 3 ? 'bg-yellow-600 text-white' : 'bg-red-600 text-white'
                          : 'bg-gray-700 text-gray-400 hover:text-white'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => removeCard(card.id)}
                  className="text-gray-500 hover:text-red-400 text-lg transition-colors"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500">Total Raw Value</p>
              <p className="text-xl font-bold text-white">{fmt(analysis.totalRawValue)}</p>
            </div>
            <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500">Est. Graded Value</p>
              <p className="text-xl font-bold text-blue-400">{fmt(analysis.totalGradedValue)}</p>
            </div>
            <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500">Total Grading Cost</p>
              <p className="text-xl font-bold text-yellow-400">{fmt(analysis.totalGradingCost)}</p>
            </div>
            <div className={`bg-gray-900/80 border rounded-xl p-4 text-center ${analysis.totalProfit >= 0 ? 'border-green-800/50' : 'border-red-800/50'}`}>
              <p className="text-xs text-gray-500">Net Profit/Loss</p>
              <p className={`text-xl font-bold ${analysis.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {analysis.totalProfit >= 0 ? '+' : ''}{fmt(analysis.totalProfit)}
              </p>
              <p className={`text-xs ${analysis.totalRoi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {analysis.totalRoi >= 0 ? '+' : ''}{analysis.totalRoi.toFixed(1)}% ROI
              </p>
            </div>
          </div>

          {/* Verdict */}
          <div className={`rounded-2xl p-6 text-center ${
            analysis.totalRoi > 20 ? 'bg-green-950/30 border border-green-800/40' :
            analysis.totalRoi > 0 ? 'bg-yellow-950/30 border border-yellow-800/40' :
            'bg-red-950/30 border border-red-800/40'
          }`}>
            <p className={`text-2xl font-bold mb-2 ${
              analysis.totalRoi > 20 ? 'text-green-400' : analysis.totalRoi > 0 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {analysis.totalRoi > 20 ? 'SUBMIT — Strong ROI' :
               analysis.totalRoi > 0 ? 'MARGINAL — Consider Removing Low-ROI Cards' :
               'DO NOT SUBMIT — Grading Costs Exceed Value Gain'}
            </p>
            <p className="text-sm text-gray-400">
              {analysis.worthGrading} of {cards.length} cards worth grading | {analysis.notWorth} cards losing money
            </p>
          </div>

          {/* Per-Card Breakdown */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Per-Card Analysis</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-800">
                    <th className="pb-2 pr-3">Card</th>
                    <th className="pb-2 pr-3 text-right">Raw</th>
                    <th className="pb-2 pr-3 text-center">Grade</th>
                    <th className="pb-2 pr-3 text-right">Graded</th>
                    <th className="pb-2 pr-3 text-right">Cost</th>
                    <th className="pb-2 pr-3 text-right">Profit</th>
                    <th className="pb-2 text-center">Verdict</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  {analysis.results.map(r => (
                    <tr key={r.id} className="border-b border-gray-800/50">
                      <td className="py-2 pr-3 max-w-[200px] truncate">{r.name}</td>
                      <td className="py-2 pr-3 text-right">{fmt(r.rawValue)}</td>
                      <td className="py-2 pr-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                          r.likelyGrade >= 9 ? 'bg-green-900 text-green-400' :
                          r.likelyGrade >= 7 ? 'bg-yellow-900 text-yellow-400' :
                          'bg-red-900 text-red-400'
                        }`}>
                          {r.likelyGrade}
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-right text-blue-400">{fmt(r.gradedValue)}</td>
                      <td className="py-2 pr-3 text-right text-yellow-400">{fmt(r.gradingCost)}</td>
                      <td className={`py-2 pr-3 text-right font-medium ${r.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {r.profit >= 0 ? '+' : ''}{fmt(r.profit)}
                      </td>
                      <td className="py-2 text-center">
                        <span className={`text-xs font-bold ${r.worthIt ? 'text-green-400' : 'text-red-400'}`}>
                          {r.worthIt ? 'GRADE' : 'SKIP'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-gray-400 mb-3">Bulk Submission Tips</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-400">
              <div className="bg-gray-800/60 rounded-lg p-3">
                <p className="font-medium text-white mb-1">Remove the &ldquo;SKIP&rdquo; cards</p>
                <p>Every card that loses money on grading drags down your overall ROI. Only submit cards with positive expected profit.</p>
              </div>
              <div className="bg-gray-800/60 rounded-lg p-3">
                <p className="font-medium text-white mb-1">Batch for discounts</p>
                <p>PSA and BGS offer volume discounts at 20+ and 50+ card thresholds. The cost per card drops significantly with larger batches.</p>
              </div>
              <div className="bg-gray-800/60 rounded-lg p-3">
                <p className="font-medium text-white mb-1">Economy tier for low-value cards</p>
                <p>Cards worth under $100 graded should go economy tier. The grade is the same — only the turnaround time changes.</p>
              </div>
              <div className="bg-gray-800/60 rounded-lg p-3">
                <p className="font-medium text-white mb-1">Condition is everything</p>
                <p>A PSA 9 vs PSA 10 can mean 3-5x the value. Be honest with your condition assessment to get accurate ROI estimates.</p>
              </div>
            </div>
          </div>

          {/* Related Tools */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
            <h3 className="text-sm font-bold text-gray-400 mb-3">Related Tools</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { href: '/tools/grading-roi', label: 'Grading ROI Calculator' },
                { href: '/tools/submission-planner', label: 'Submission Planner' },
                { href: '/tools/grading-probability', label: 'Grading Probability' },
                { href: '/tools/grade-value-chart', label: 'Grade Value Chart' },
                { href: '/tools/bgs-subgrade', label: 'BGS Subgrade Calculator' },
                { href: '/tools/condition-grader', label: 'Condition Grader' },
                { href: '/tools/turnaround-estimator', label: 'Turnaround Estimator' },
                { href: '/tools/cross-grade', label: 'Cross-Grade Converter' },
              ].map(l => (
                <a key={l.href} href={l.href} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg text-xs transition-colors">
                  {l.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {cards.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-4">📦</p>
          <p className="text-lg font-medium mb-2">Add cards to analyze your bulk grading submission</p>
          <p className="text-sm">Search the database above or add cards manually to see which are worth grading.</p>
        </div>
      )}
    </div>
  );
}
