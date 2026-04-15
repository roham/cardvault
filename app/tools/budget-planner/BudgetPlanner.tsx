'use client';

import { useState, useMemo } from 'react';

// ─── Budget Categories ─────────────────────────────────────────────
const CATEGORIES = [
  { id: 'singles', label: 'Singles', icon: '🃏', description: 'Individual cards — rookies, stars, vintage', color: 'emerald' },
  { id: 'sealed', label: 'Sealed Products', icon: '📦', description: 'Hobby boxes, blasters, ETBs, packs', color: 'blue' },
  { id: 'grading', label: 'Grading', icon: '🏅', description: 'PSA, BGS, CGC, SGC submissions', color: 'amber' },
  { id: 'supplies', label: 'Supplies', icon: '🛡️', description: 'Sleeves, top-loaders, binders, cases', color: 'purple' },
  { id: 'shows', label: 'Card Shows', icon: '📍', description: 'Admission, travel, food, table costs', color: 'rose' },
  { id: 'flipping', label: 'Flipping Budget', icon: '💸', description: 'Buy-low inventory for resale', color: 'cyan' },
] as const;

type CategoryId = typeof CATEGORIES[number]['id'];

// ─── Collector Presets ─────────────────────────────────────────────
const PRESETS: Record<string, { label: string; description: string; allocations: Record<CategoryId, number> }> = {
  beginner: {
    label: 'Beginner Dave',
    description: 'Just getting started — focus on fun singles and supplies',
    allocations: { singles: 50, sealed: 20, grading: 0, supplies: 20, shows: 10, flipping: 0 },
  },
  flipper: {
    label: 'Flipper Marcus',
    description: 'Maximize ROI — buy inventory, grade winners, sell fast',
    allocations: { singles: 15, sealed: 10, grading: 25, supplies: 5, shows: 15, flipping: 30 },
  },
  completionist: {
    label: 'Completionist Mia',
    description: 'Complete sets — singles-heavy with supplies to protect them',
    allocations: { singles: 60, sealed: 10, grading: 5, supplies: 20, shows: 5, flipping: 0 },
  },
  ripper: {
    label: 'Ripper Jess',
    description: 'The thrill of the rip — sealed products and pack breaks',
    allocations: { singles: 10, sealed: 55, grading: 10, supplies: 10, shows: 10, flipping: 5 },
  },
  investor: {
    label: 'Investor Kai',
    description: 'Long-term holds — blue-chip singles, grade everything high-value',
    allocations: { singles: 45, sealed: 5, grading: 30, supplies: 10, shows: 5, flipping: 5 },
  },
  dealer: {
    label: 'Dealer Tony',
    description: 'Card show vendor — inventory, supplies, show costs',
    allocations: { singles: 10, sealed: 15, grading: 10, supplies: 10, shows: 25, flipping: 30 },
  },
};

// ─── ROI Estimates by category ─────────────────────────────────────
const ROI_ESTIMATES: Record<CategoryId, { low: number; mid: number; high: number; note: string }> = {
  singles: { low: -20, mid: 5, high: 40, note: 'Highly variable — vintage/grail cards appreciate, commons decline' },
  sealed: { low: -40, mid: -15, high: 30, note: 'EV is typically negative short-term; unopened sealed appreciates 5-15% per year long-term' },
  grading: { low: -10, mid: 50, high: 200, note: 'Only grade cards worth 5x+ the grading fee. PSA 10s can double or triple raw value' },
  supplies: { low: 0, mid: 0, high: 0, note: 'Supplies don\'t appreciate — but they protect value. Budget $0.10-$0.50 per card for protection' },
  shows: { low: -20, mid: 10, high: 50, note: 'Show deals beat online prices by 10-30%. Travel cost is the variable' },
  flipping: { low: -15, mid: 20, high: 60, note: 'Successful flippers target 20-40% margins after fees. Volume is key' },
};

// ─── Grail Tiers ───────────────────────────────────────────────────
const GRAIL_TIERS = [
  { label: 'Attainable Grail', range: '$50–$200', example: 'PSA 9 Rookie of a current star', months: (budget: number) => Math.max(1, Math.ceil(150 / (budget * 0.15))) },
  { label: 'Stretch Grail', range: '$200–$1,000', example: 'PSA 10 Key Rookie or vintage star', months: (budget: number) => Math.max(2, Math.ceil(600 / (budget * 0.15))) },
  { label: 'Dream Grail', range: '$1,000–$5,000', example: 'PSA 10 Prizm Silver of a superstar', months: (budget: number) => Math.max(6, Math.ceil(3000 / (budget * 0.15))) },
  { label: 'Legendary Grail', range: '$5,000+', example: 'Vintage HOF RC, 1/1 patch auto', months: (budget: number) => Math.max(12, Math.ceil(7500 / (budget * 0.15))) },
];

export default function BudgetPlanner() {
  const [monthlyBudget, setMonthlyBudget] = useState<string>('200');
  const [allocations, setAllocations] = useState<Record<CategoryId, number>>({
    singles: 40, sealed: 20, grading: 10, supplies: 15, shows: 10, flipping: 5,
  });
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [savingsGoal, setSavingsGoal] = useState<string>('500');

  const budget = parseFloat(monthlyBudget) || 0;
  const totalAlloc = Object.values(allocations).reduce((a, b) => a + b, 0);

  const applyPreset = (key: string) => {
    setAllocations({ ...PRESETS[key].allocations });
    setActivePreset(key);
  };

  const updateAllocation = (cat: CategoryId, value: number) => {
    setAllocations(prev => ({ ...prev, [cat]: value }));
    setActivePreset(null);
  };

  const breakdown = useMemo(() => {
    return CATEGORIES.map(cat => {
      const pct = allocations[cat.id];
      const amount = (budget * pct) / 100;
      const roi = ROI_ESTIMATES[cat.id];
      return {
        ...cat,
        pct,
        amount,
        roi,
        annualAmount: amount * 12,
        expectedReturnLow: amount * 12 * (roi.low / 100),
        expectedReturnMid: amount * 12 * (roi.mid / 100),
        expectedReturnHigh: amount * 12 * (roi.high / 100),
      };
    });
  }, [budget, allocations]);

  const annualTotal = budget * 12;
  const annualReturnMid = breakdown.reduce((sum, b) => sum + b.expectedReturnMid, 0);

  const savingsGoalNum = parseFloat(savingsGoal) || 0;
  const monthlySavings = budget * 0.15; // 15% grail fund
  const monthsToGoal = monthlySavings > 0 ? Math.ceil(savingsGoalNum / monthlySavings) : Infinity;

  // ─── Tips based on budget ────────────────────────────────────────
  const tips = useMemo(() => {
    const t: string[] = [];
    if (budget < 100) {
      t.push('At this budget, focus 80%+ on singles. Skip sealed — the EV math doesn\'t work at low volume.');
      t.push('Buy supplies in bulk on Amazon — $15 gets you 200 penny sleeves + 25 top-loaders.');
      t.push('Hit local card shows for deals 20-30% below eBay prices.');
    } else if (budget < 300) {
      t.push('Sweet spot for singles + occasional sealed. One hobby box per month keeps the thrill alive.');
      t.push('Start grading your best pulls — PSA Economy ($20/card) is worth it on cards valued $100+ raw.');
      t.push('Track every purchase. At this budget, one bad buy can wipe a month\'s gains.');
    } else if (budget < 500) {
      t.push('You can diversify across all categories. Consider 2-3 grading submissions per month.');
      t.push('Sealed product flipping becomes viable — buy at retail, sell hobby boxes that spike.');
      t.push('Set aside 15% as a "grail fund" — you\'ll accumulate enough for a significant card in 6-12 months.');
    } else {
      t.push('At this budget, treat it like a business. Track P&L monthly. Target 15-25% annual returns.');
      t.push('Grading volume discounts kick in — PSA bulk saves 30% vs individual submissions.');
      t.push('Card show buying power is real. Dealers negotiate harder on $500+ deals.');
      t.push('Diversify across sports and eras. Don\'t put 100% into current year rookies.');
    }
    // Allocation-specific tips
    if (allocations.sealed > 40) t.push('Warning: Sealed allocation over 40% is high-risk. Average sealed EV is -15% of retail price. You\'re paying for entertainment, not investment.');
    if (allocations.grading > 0 && budget < 150) t.push('Grading at this budget is only worth it for cards valued $75+ raw. Otherwise, fees eat your margin.');
    if (allocations.flipping > 0 && allocations.flipping < 15) t.push('Flipping budget under 15% may be too thin. Either commit 20%+ or reallocate to singles.');
    if (allocations.supplies < 5 && budget > 100) t.push('Under 5% on supplies is risky. Damaged cards lose 30-50% of value. Protection is cheap insurance.');
    return t;
  }, [budget, allocations]);

  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-500', blue: 'bg-blue-500', amber: 'bg-amber-500',
    purple: 'bg-purple-500', rose: 'bg-rose-500', cyan: 'bg-cyan-500',
  };
  const borderColorMap: Record<string, string> = {
    emerald: 'border-emerald-700', blue: 'border-blue-700', amber: 'border-amber-700',
    purple: 'border-purple-700', rose: 'border-rose-700', cyan: 'border-cyan-700',
  };

  return (
    <div className="space-y-8">
      {/* Monthly Budget Input */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">Monthly Hobby Budget</label>
        <div className="flex items-center gap-3">
          <span className="text-2xl text-gray-400">$</span>
          <input
            type="number"
            min="0"
            step="25"
            value={monthlyBudget}
            onChange={e => setMonthlyBudget(e.target.value)}
            className="w-40 bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-2xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <span className="text-gray-400">/month</span>
          <span className="text-gray-500 ml-4">(${(budget * 12).toLocaleString()}/year)</span>
        </div>
        <div className="flex gap-2 mt-3">
          {[50, 100, 200, 300, 500, 1000].map(v => (
            <button key={v} onClick={() => setMonthlyBudget(String(v))}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${budget === v ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
              ${v}
            </button>
          ))}
        </div>
      </div>

      {/* Collector Presets */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Collector Profiles</h3>
        <p className="text-gray-400 text-sm mb-4">Pick a profile to auto-fill allocations, or customize below.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Object.entries(PRESETS).map(([key, preset]) => (
            <button key={key} onClick={() => applyPreset(key)}
              className={`text-left p-3 rounded-xl border transition-colors ${activePreset === key ? 'bg-emerald-950/40 border-emerald-600 text-white' : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:border-gray-500'}`}>
              <div className="font-semibold text-sm">{preset.label}</div>
              <div className="text-xs text-gray-400 mt-1">{preset.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Allocation Sliders */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white">Budget Allocation</h3>
          <span className={`text-sm font-medium ${totalAlloc === 100 ? 'text-emerald-400' : totalAlloc > 100 ? 'text-red-400' : 'text-amber-400'}`}>
            {totalAlloc}% allocated {totalAlloc !== 100 && `(${totalAlloc > 100 ? 'over' : 'under'} by ${Math.abs(totalAlloc - 100)}%)`}
          </span>
        </div>

        {/* Allocation bar */}
        <div className="h-6 rounded-full bg-gray-800 overflow-hidden flex mb-6">
          {breakdown.map(cat => cat.pct > 0 && (
            <div key={cat.id} className={`${colorMap[cat.color]} h-full transition-all relative group`} style={{ width: `${(cat.pct / Math.max(totalAlloc, 100)) * 100}%` }}>
              {cat.pct >= 8 && <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white/90">{cat.icon} {cat.pct}%</span>}
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {CATEGORIES.map(cat => (
            <div key={cat.id} className={`bg-gray-800/30 border ${borderColorMap[cat.color]} rounded-xl p-4`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{cat.icon}</span>
                  <span className="font-medium text-white">{cat.label}</span>
                  <span className="text-xs text-gray-500">{cat.description}</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-white">${((budget * allocations[cat.id]) / 100).toFixed(0)}</span>
                  <span className="text-gray-400 text-sm">/mo</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input type="range" min="0" max="100" step="5" value={allocations[cat.id]}
                  onChange={e => updateAllocation(cat.id, parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                <span className="w-12 text-right text-sm font-mono text-gray-300">{allocations[cat.id]}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Breakdown Table */}
      {budget > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Monthly & Annual Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2 text-gray-400 font-medium">Category</th>
                  <th className="text-right py-2 text-gray-400 font-medium">Monthly</th>
                  <th className="text-right py-2 text-gray-400 font-medium">Annual</th>
                  <th className="text-right py-2 text-gray-400 font-medium">Est. ROI</th>
                  <th className="text-right py-2 text-gray-400 font-medium">Est. Return</th>
                </tr>
              </thead>
              <tbody>
                {breakdown.filter(b => b.pct > 0).map(b => (
                  <tr key={b.id} className="border-b border-gray-800">
                    <td className="py-2 text-white">{b.icon} {b.label}</td>
                    <td className="text-right py-2 text-gray-300">${b.amount.toFixed(0)}</td>
                    <td className="text-right py-2 text-gray-300">${b.annualAmount.toFixed(0)}</td>
                    <td className="text-right py-2">
                      <span className={b.roi.mid >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                        {b.roi.mid >= 0 ? '+' : ''}{b.roi.mid}%
                      </span>
                    </td>
                    <td className="text-right py-2">
                      <span className={b.expectedReturnMid >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                        {b.expectedReturnMid >= 0 ? '+' : ''}${b.expectedReturnMid.toFixed(0)}
                      </span>
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-gray-600 font-bold">
                  <td className="py-2 text-white">Total</td>
                  <td className="text-right py-2 text-white">${budget.toFixed(0)}</td>
                  <td className="text-right py-2 text-white">${annualTotal.toFixed(0)}</td>
                  <td className="text-right py-2">—</td>
                  <td className="text-right py-2">
                    <span className={annualReturnMid >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                      {annualReturnMid >= 0 ? '+' : ''}${annualReturnMid.toFixed(0)}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-2">* ROI estimates are historical averages for the card hobby. Actual returns vary significantly based on card selection, timing, and market conditions.</p>
        </div>
      )}

      {/* ROI Range Breakdown */}
      {budget > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">ROI Range by Category</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {breakdown.filter(b => b.pct > 0).map(b => (
              <div key={b.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span>{b.icon}</span>
                  <span className="font-medium text-white">{b.label}</span>
                </div>
                <div className="flex items-center gap-2 text-sm mb-1">
                  <span className="text-red-400 w-16 text-right">{b.roi.low}%</span>
                  <div className="flex-1 h-2 bg-gray-700 rounded-full relative">
                    <div className="absolute left-0 h-full bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 rounded-full" style={{ width: '100%', opacity: 0.3 }} />
                    <div className="absolute h-4 w-1 bg-white rounded-full -top-1" style={{ left: `${Math.min(100, Math.max(0, ((b.roi.mid - b.roi.low) / (b.roi.high - b.roi.low)) * 100))}%` }} />
                  </div>
                  <span className="text-emerald-400 w-16">+{b.roi.high}%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{b.roi.note}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grail Fund Savings Goal */}
      <div className="bg-gradient-to-r from-amber-950/30 to-amber-900/10 border border-amber-800/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-amber-400 mb-2">Grail Card Savings Goal</h3>
        <p className="text-gray-400 text-sm mb-4">Set aside 15% of your budget as a &quot;grail fund&quot; to save up for that dream card.</p>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-gray-400">Target:</span>
          <span className="text-xl text-gray-400">$</span>
          <input type="number" min="0" step="50" value={savingsGoal} onChange={e => setSavingsGoal(e.target.value)}
            className="w-32 bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-lg font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-500" />
          <span className="text-gray-400">→ ${monthlySavings.toFixed(0)}/mo saved → <span className="font-bold text-amber-400">{monthsToGoal === Infinity ? '∞' : monthsToGoal} months</span></span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {GRAIL_TIERS.map(tier => {
            const months = tier.months(budget);
            return (
              <div key={tier.label} className="bg-gray-900/50 rounded-lg p-3">
                <div className="text-xs text-amber-400 font-medium">{tier.label}</div>
                <div className="text-sm font-bold text-white">{tier.range}</div>
                <div className="text-xs text-gray-400 mt-1">{tier.example}</div>
                <div className="text-xs text-gray-500 mt-1">{budget > 0 ? `~${months} months` : '—'}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Smart Tips */}
      {tips.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Budget Tips</h3>
          <div className="space-y-2">
            {tips.map((tip, i) => (
              <div key={i} className="flex gap-3 bg-gray-800/40 border border-gray-700 rounded-lg p-3">
                <span className="text-emerald-400 text-sm mt-0.5">{tip.startsWith('Warning') ? '⚠️' : '💡'}</span>
                <p className="text-sm text-gray-300">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Annual Projection */}
      {budget > 0 && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">12-Month Projection</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">Total Spent</div>
              <div className="text-2xl font-bold text-white">${annualTotal.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">Est. Collection Value</div>
              <div className="text-2xl font-bold text-emerald-400">${(annualTotal + annualReturnMid).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">Est. Net Return</div>
              <div className={`text-2xl font-bold ${annualReturnMid >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {annualReturnMid >= 0 ? '+' : ''}${annualReturnMid.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">Grail Fund (15%)</div>
              <div className="text-2xl font-bold text-amber-400">${(monthlySavings * 12).toLocaleString()}</div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-gray-900/50 rounded-lg">
            <p className="text-xs text-gray-500">
              Projections assume average market conditions. The card market is cyclical — 2020-21 saw 200%+ gains, 2022-23 saw 30-50% corrections.
              Diversify across sports, eras, and price points to reduce risk. These numbers are estimates, not guarantees.
            </p>
          </div>
        </div>
      )}

      {/* Related Tools */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Related Tools</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/tools/flip-calc', label: 'Flip Profit Calculator', icon: '💸' },
            { href: '/tools/investment-calc', label: 'Investment Calculator', icon: '📊' },
            { href: '/tools/tax-calc', label: 'Card Tax Calculator', icon: '🧾' },
            { href: '/tools/grading-roi', label: 'Grading ROI Calculator', icon: '💰' },
            { href: '/tools/sealed-ev', label: 'Sealed Product EV', icon: '📦' },
            { href: '/tools/insurance-calc', label: 'Insurance Calculator', icon: '🛡️' },
            { href: '/tools/storage-calc', label: 'Storage & Supplies', icon: '📦' },
            { href: '/tools/show-finder', label: 'Card Show Finder', icon: '📍' },
          ].map(t => (
            <a key={t.href} href={t.href} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg p-3 text-sm text-gray-300 hover:text-white transition-colors">
              <span>{t.icon}</span> {t.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
