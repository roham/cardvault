'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

/* ───── Service Level Data (April 2026 estimates) ───── */
interface ServiceLevel {
  tier: string;
  company: string;
  cost: string;
  costNum: number;
  turnaroundDays: string;
  turnaroundMin: number;
  turnaroundMax: number;
  maxDeclaredValue: string;
  notes: string;
}

const serviceLevels: ServiceLevel[] = [
  // PSA
  { tier: 'Value', company: 'PSA', cost: '$25/card', costNum: 25, turnaroundDays: '65–90 business days', turnaroundMin: 65, turnaroundMax: 90, maxDeclaredValue: '$499', notes: 'Best for bulk submissions of lower-value cards. Minimum 10 cards per order.' },
  { tier: 'Regular', company: 'PSA', cost: '$50/card', costNum: 50, turnaroundDays: '40–65 business days', turnaroundMin: 40, turnaroundMax: 65, maxDeclaredValue: '$999', notes: 'Most popular tier. Good balance of cost and speed for mid-range cards.' },
  { tier: 'Express', company: 'PSA', cost: '$100/card', costNum: 100, turnaroundDays: '20–30 business days', turnaroundMin: 20, turnaroundMax: 30, maxDeclaredValue: '$2,499', notes: 'Faster turnaround for cards worth grading quickly. Popular for new releases.' },
  { tier: 'Super Express', company: 'PSA', cost: '$200/card', costNum: 200, turnaroundDays: '10–15 business days', turnaroundMin: 10, turnaroundMax: 15, maxDeclaredValue: '$4,999', notes: 'Premium speed for valuable cards. Great for flipping hot rookies.' },
  { tier: 'Walk-Through', company: 'PSA', cost: '$300/card', costNum: 300, turnaroundDays: '3–5 business days', turnaroundMin: 3, turnaroundMax: 5, maxDeclaredValue: '$9,999', notes: 'Fastest standard tier. Cards must be shipped to PSA Santa Ana office.' },
  { tier: 'Premium', company: 'PSA', cost: '$600/card', costNum: 600, turnaroundDays: '2–3 business days', turnaroundMin: 2, turnaroundMax: 3, maxDeclaredValue: '$24,999', notes: 'For high-value cards. Priority handling and verification.' },
  // BGS
  { tier: 'Economy', company: 'BGS', cost: '$22/card', costNum: 22, turnaroundDays: '80–120 business days', turnaroundMin: 80, turnaroundMax: 120, maxDeclaredValue: '$250', notes: 'Cheapest BGS option. Minimum 10 cards. Sub-grades included.' },
  { tier: 'Standard', company: 'BGS', cost: '$40/card', costNum: 40, turnaroundDays: '30–50 business days', turnaroundMin: 30, turnaroundMax: 50, maxDeclaredValue: '$999', notes: 'Standard BGS with sub-grades. Most popular Beckett tier.' },
  { tier: 'Express', company: 'BGS', cost: '$100/card', costNum: 100, turnaroundDays: '15–20 business days', turnaroundMin: 15, turnaroundMax: 20, maxDeclaredValue: '$2,499', notes: 'Faster BGS turnaround with full sub-grades.' },
  { tier: 'Premium', company: 'BGS', cost: '$250/card', costNum: 250, turnaroundDays: '5–10 business days', turnaroundMin: 5, turnaroundMax: 10, maxDeclaredValue: '$4,999', notes: 'Priority Beckett service. Full sub-grades and fast return.' },
  // CGC
  { tier: 'Economy', company: 'CGC', cost: '$18/card', costNum: 18, turnaroundDays: '80–120 business days', turnaroundMin: 80, turnaroundMax: 120, maxDeclaredValue: '$250', notes: 'Cheapest grading option on the market. Minimum 10 cards. CGC growing fast.' },
  { tier: 'Standard', company: 'CGC', cost: '$30/card', costNum: 30, turnaroundDays: '30–50 business days', turnaroundMin: 30, turnaroundMax: 50, maxDeclaredValue: '$999', notes: 'Standard CGC with sub-grades option. Great value.' },
  { tier: 'Express', company: 'CGC', cost: '$65/card', costNum: 65, turnaroundDays: '10–15 business days', turnaroundMin: 10, turnaroundMax: 15, maxDeclaredValue: '$4,999', notes: 'Fast CGC turnaround. Sub-grades available for extra fee.' },
  { tier: 'Walk-Through', company: 'CGC', cost: '$150/card', costNum: 150, turnaroundDays: '3–5 business days', turnaroundMin: 3, turnaroundMax: 5, maxDeclaredValue: '$9,999', notes: 'Fastest CGC option. Priority handling.' },
  // SGC
  { tier: 'Economy', company: 'SGC', cost: '$15/card', costNum: 15, turnaroundDays: '50–90 business days', turnaroundMin: 50, turnaroundMax: 90, maxDeclaredValue: '$499', notes: 'Most affordable grading company. Known for vintage expertise.' },
  { tier: 'Standard', company: 'SGC', cost: '$30/card', costNum: 30, turnaroundDays: '20–35 business days', turnaroundMin: 20, turnaroundMax: 35, maxDeclaredValue: '$2,499', notes: 'Solid turnaround times. SGC tuxedo slabs are gaining market share.' },
  { tier: 'Express', company: 'SGC', cost: '$75/card', costNum: 75, turnaroundDays: '5–10 business days', turnaroundMin: 5, turnaroundMax: 10, maxDeclaredValue: '$9,999', notes: 'Fast SGC service. Popular for vintage cards and quick flips.' },
];

const companyColors: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  PSA: { bg: 'bg-red-950/40', border: 'border-red-800/50', text: 'text-red-400', dot: 'bg-red-400' },
  BGS: { bg: 'bg-blue-950/40', border: 'border-blue-800/50', text: 'text-blue-400', dot: 'bg-blue-400' },
  CGC: { bg: 'bg-yellow-950/40', border: 'border-yellow-800/50', text: 'text-yellow-400', dot: 'bg-yellow-400' },
  SGC: { bg: 'bg-green-950/40', border: 'border-green-800/50', text: 'text-green-400', dot: 'bg-green-400' },
};

type SortMode = 'fastest' | 'cheapest' | 'value';
type CompanyFilter = 'all' | 'PSA' | 'BGS' | 'CGC' | 'SGC';

export default function TurnaroundEstimator() {
  const [cardValue, setCardValue] = useState('');
  const [numCards, setNumCards] = useState('1');
  const [sort, setSort] = useState<SortMode>('fastest');
  const [companyFilter, setCompanyFilter] = useState<CompanyFilter>('all');
  const [deadline, setDeadline] = useState('');

  const parsedValue = parseFloat(cardValue.replace(/[^0-9.]/g, '')) || 0;
  const parsedCards = parseInt(numCards) || 1;

  const filtered = useMemo(() => {
    let levels = serviceLevels.filter(s => {
      if (companyFilter !== 'all' && s.company !== companyFilter) return false;
      // Filter by max declared value
      if (parsedValue > 0) {
        const maxVal = parseInt(s.maxDeclaredValue.replace(/[^0-9]/g, ''));
        if (parsedValue > maxVal) return false;
      }
      return true;
    });

    levels = levels.map(s => ({ ...s }));

    if (sort === 'fastest') levels.sort((a, b) => a.turnaroundMin - b.turnaroundMin);
    else if (sort === 'cheapest') levels.sort((a, b) => a.costNum - b.costNum);
    else levels.sort((a, b) => (a.costNum / (a.turnaroundMax || 1)) - (b.costNum / (b.turnaroundMax || 1)));

    return levels;
  }, [companyFilter, parsedValue, sort]);

  // Deadline calculation
  const deadlineDays = useMemo(() => {
    if (!deadline) return null;
    const target = new Date(deadline);
    const today = new Date();
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    // Business days ≈ diff * 5/7
    const businessDays = Math.floor(diff * 5 / 7);
    return { calendar: diff, business: businessDays };
  }, [deadline]);

  const meetsDeadline = (s: ServiceLevel) => {
    if (!deadlineDays) return null;
    if (s.turnaroundMax <= deadlineDays.business) return 'yes';
    if (s.turnaroundMin <= deadlineDays.business) return 'maybe';
    return 'no';
  };

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Your Submission Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Card Value (est.)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="text"
                value={cardValue}
                onChange={e => setCardValue(e.target.value)}
                placeholder="250"
                className="w-full pl-7 pr-3 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Number of Cards</label>
            <input
              type="number"
              min="1"
              max="500"
              value={numCards}
              onChange={e => setNumCards(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Need Back By (optional)</label>
            <input
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Company</label>
            <select
              value={companyFilter}
              onChange={e => setCompanyFilter(e.target.value as CompanyFilter)}
              className="w-full px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 text-sm"
            >
              <option value="all">All Companies</option>
              <option value="PSA">PSA</option>
              <option value="BGS">BGS (Beckett)</option>
              <option value="CGC">CGC</option>
              <option value="SGC">SGC</option>
            </select>
          </div>
        </div>
        {deadlineDays && deadlineDays.calendar > 0 && (
          <div className="mt-3 text-sm text-gray-400">
            Your deadline is in <span className="text-white font-medium">{deadlineDays.calendar} calendar days</span> (~{deadlineDays.business} business days).
          </div>
        )}
      </div>

      {/* Sort + Summary */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-gray-500">Sort by:</span>
        {([
          ['fastest', 'Fastest'],
          ['cheapest', 'Cheapest'],
          ['value', 'Best Value'],
        ] as [SortMode, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSort(key)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${sort === key ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'}`}
          >
            {label}
          </button>
        ))}
        <span className="ml-auto text-sm text-gray-500">{filtered.length} options</span>
      </div>

      {/* Results Table */}
      <div className="space-y-3">
        {filtered.map((s, i) => {
          const colors = companyColors[s.company];
          const deadline_status = meetsDeadline(s);
          const totalCost = s.costNum * parsedCards;
          return (
            <div key={`${s.company}-${s.tier}`} className={`${colors.bg} border ${colors.border} rounded-xl p-5 transition-colors hover:brightness-110`}>
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}>
                    <span className={`w-1.5 h-1.5 ${colors.dot} rounded-full`} />
                    {s.company}
                  </span>
                  <span className="text-white font-semibold">{s.tier}</span>
                  {i === 0 && (
                    <span className="text-xs bg-emerald-600/30 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-700/50">
                      {sort === 'fastest' ? 'Fastest' : sort === 'cheapest' ? 'Cheapest' : 'Best Value'}
                    </span>
                  )}
                  {deadline_status === 'yes' && (
                    <span className="text-xs bg-green-600/30 text-green-400 px-2 py-0.5 rounded-full">Meets Deadline</span>
                  )}
                  {deadline_status === 'maybe' && (
                    <span className="text-xs bg-yellow-600/30 text-yellow-400 px-2 py-0.5 rounded-full">Might Meet Deadline</span>
                  )}
                  {deadline_status === 'no' && (
                    <span className="text-xs bg-red-600/30 text-red-400 px-2 py-0.5 rounded-full">Too Slow</span>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-white font-bold">{s.cost}</div>
                  {parsedCards > 1 && (
                    <div className="text-xs text-gray-400">Total: ${totalCost.toLocaleString()}</div>
                  )}
                </div>
              </div>

              {/* Turnaround bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                  <span>Turnaround</span>
                  <span className="text-white font-medium">{s.turnaroundDays}</span>
                </div>
                <div className="h-2 bg-gray-900 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${s.turnaroundMax <= 15 ? 'bg-emerald-500' : s.turnaroundMax <= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min(100, (s.turnaroundMax / 120) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-400">
                <span>Max declared value: <span className="text-white">{s.maxDeclaredValue}</span></span>
                {parsedValue > 0 && s.costNum > 0 && (
                  <span>Grading cost as % of value: <span className={`font-medium ${(s.costNum / parsedValue * 100) > 25 ? 'text-red-400' : (s.costNum / parsedValue * 100) > 10 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                    {(s.costNum / parsedValue * 100).toFixed(1)}%
                  </span></span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">{s.notes}</p>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">No matching service levels</p>
            <p className="text-sm">Try adjusting your card value or company filter.</p>
          </div>
        )}
      </div>

      {/* Quick Comparison Table */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4">Quick Comparison: Fastest Tier Per Company</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-3 text-gray-400 font-medium">Company</th>
                <th className="text-left py-3 px-3 text-gray-400 font-medium">Fastest Tier</th>
                <th className="text-left py-3 px-3 text-gray-400 font-medium">Turnaround</th>
                <th className="text-left py-3 px-3 text-gray-400 font-medium">Cost</th>
                <th className="text-left py-3 px-3 text-gray-400 font-medium">Cheapest Tier</th>
                <th className="text-left py-3 px-3 text-gray-400 font-medium">Turnaround</th>
                <th className="text-left py-3 px-3 text-gray-400 font-medium">Cost</th>
              </tr>
            </thead>
            <tbody>
              {['PSA', 'BGS', 'CGC', 'SGC'].map(company => {
                const companyLevels = serviceLevels.filter(s => s.company === company);
                const fastest = [...companyLevels].sort((a, b) => a.turnaroundMin - b.turnaroundMin)[0];
                const cheapest = [...companyLevels].sort((a, b) => a.costNum - b.costNum)[0];
                const colors = companyColors[company];
                return (
                  <tr key={company} className="border-b border-gray-800/50">
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}>
                        <span className={`w-1.5 h-1.5 ${colors.dot} rounded-full`} />
                        {company}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-white">{fastest.tier}</td>
                    <td className="py-3 px-3 text-emerald-400">{fastest.turnaroundDays}</td>
                    <td className="py-3 px-3 text-white">{fastest.cost}</td>
                    <td className="py-3 px-3 text-white">{cheapest.tier}</td>
                    <td className="py-3 px-3 text-yellow-400">{cheapest.turnaroundDays}</td>
                    <td className="py-3 px-3 text-white">{cheapest.cost}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Pro Tips */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4">Submission Tips</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { title: 'Time Your Submissions', tip: 'Turnaround times spike after big product releases (October-December). Submit in January-March when volume is lowest for fastest returns.' },
            { title: 'Bundle Economy Orders', tip: 'Economy tiers require minimum 10-20 cards. Coordinate with friends or local card groups to split submissions and save on per-card costs.' },
            { title: 'Match Tier to Card Value', tip: 'Never spend more than 10-15% of a card\'s value on grading. A $50 card does not justify a $200 express submission. Use economy tiers for sub-$100 cards.' },
            { title: 'Consider SGC for Vintage', tip: 'SGC is gaining market share in vintage cards (pre-1970). Their tuxedo slabs are well-regarded and turnaround times are often faster than PSA for similar prices.' },
            { title: 'Track Actual vs Quoted', tip: 'Quoted turnaround times are estimates. PSA "40-65 business days" may take 90 days during peak seasons. Check community forums for real-time reports.' },
            { title: 'Crossover Strategy', tip: 'If you grade with BGS or SGC first (faster, cheaper), you can later crossover to PSA if the grade is strong. This gets your card protected quickly while planning the final holder.' },
          ].map((t, i) => (
            <div key={i} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
              <h3 className="font-medium text-white text-sm mb-1">{t.title}</h3>
              <p className="text-gray-400 text-xs leading-relaxed">{t.tip}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Related Tools */}
      <section className="pt-6 border-t border-gray-800">
        <h2 className="text-lg font-semibold text-white mb-4">Related Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { href: '/tools/submission-planner', label: 'Submission Planner', desc: 'Compare all tiers side by side' },
            { href: '/tools/grading-roi', label: 'Grading ROI Calculator', desc: 'Is grading worth it for your card?' },
            { href: '/tools/cert-check', label: 'PSA Cert Verifier', desc: 'Verify any PSA certification number' },
          ].map(t => (
            <Link key={t.href} href={t.href} className="block bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 hover:bg-gray-700/50 transition-colors">
              <span className="text-white font-medium text-sm">{t.label}</span>
              <span className="block text-gray-500 text-xs mt-1">{t.desc}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
