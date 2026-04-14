'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

/* ───── Grading company data ───── */
interface ServiceTier {
  name: string;
  price: number;
  turnaround: string;
  turnaroundDays: number;
  maxDeclaredValue: number | null; // null = unlimited
}

interface GradingCompany {
  id: string;
  name: string;
  color: string;
  bgColor: string;
  borderColor: string;
  membershipFee: number;
  membershipName: string;
  tiers: ServiceTier[];
  shippingToCompany: number;
  returnShipping: number;
  insurancePer1000: number;
}

const gradingCompanies: GradingCompany[] = [
  {
    id: 'psa',
    name: 'PSA',
    color: 'text-red-400',
    bgColor: 'bg-red-950/40',
    borderColor: 'border-red-800/50',
    membershipFee: 99,
    membershipName: 'PSA Collectors Club ($99/yr)',
    tiers: [
      { name: 'Value', price: 25, turnaround: '60-90 business days', turnaroundDays: 75, maxDeclaredValue: 499 },
      { name: 'Regular', price: 50, turnaround: '30-45 business days', turnaroundDays: 38, maxDeclaredValue: 999 },
      { name: 'Express', price: 100, turnaround: '15-20 business days', turnaroundDays: 18, maxDeclaredValue: 2499 },
      { name: 'Super Express', price: 200, turnaround: '5-10 business days', turnaroundDays: 8, maxDeclaredValue: 4999 },
      { name: 'Walk-Through', price: 600, turnaround: '1-3 business days', turnaroundDays: 2, maxDeclaredValue: null },
    ],
    shippingToCompany: 12,
    returnShipping: 15,
    insurancePer1000: 3,
  },
  {
    id: 'bgs',
    name: 'BGS (Beckett)',
    color: 'text-blue-400',
    bgColor: 'bg-blue-950/40',
    borderColor: 'border-blue-800/50',
    membershipFee: 0,
    membershipName: 'No membership required',
    tiers: [
      { name: 'Economy', price: 20, turnaround: '65-90 business days', turnaroundDays: 78, maxDeclaredValue: 249 },
      { name: 'Standard', price: 35, turnaround: '30-45 business days', turnaroundDays: 38, maxDeclaredValue: 499 },
      { name: 'Express', price: 75, turnaround: '10-15 business days', turnaroundDays: 13, maxDeclaredValue: 2499 },
      { name: 'Premium', price: 150, turnaround: '5-7 business days', turnaroundDays: 6, maxDeclaredValue: 4999 },
      { name: '1-Day', price: 500, turnaround: '1 business day', turnaroundDays: 1, maxDeclaredValue: null },
    ],
    shippingToCompany: 10,
    returnShipping: 12,
    insurancePer1000: 2.5,
  },
  {
    id: 'cgc',
    name: 'CGC',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-950/40',
    borderColor: 'border-yellow-800/50',
    membershipFee: 25,
    membershipName: 'CGC Membership ($25/yr)',
    tiers: [
      { name: 'Economy', price: 18, turnaround: '60-90 business days', turnaroundDays: 75, maxDeclaredValue: 250 },
      { name: 'Standard', price: 30, turnaround: '30-45 business days', turnaroundDays: 38, maxDeclaredValue: 500 },
      { name: 'Express', price: 65, turnaround: '10-15 business days', turnaroundDays: 13, maxDeclaredValue: 2500 },
      { name: 'Premium', price: 125, turnaround: '5-7 business days', turnaroundDays: 6, maxDeclaredValue: 5000 },
      { name: 'Walk-Through', price: 400, turnaround: '2-3 business days', turnaroundDays: 3, maxDeclaredValue: null },
    ],
    shippingToCompany: 10,
    returnShipping: 12,
    insurancePer1000: 2.5,
  },
  {
    id: 'sgc',
    name: 'SGC',
    color: 'text-purple-400',
    bgColor: 'bg-purple-950/40',
    borderColor: 'border-purple-800/50',
    membershipFee: 0,
    membershipName: 'No membership required',
    tiers: [
      { name: 'Economy', price: 15, turnaround: '45-60 business days', turnaroundDays: 53, maxDeclaredValue: 250 },
      { name: 'Regular', price: 30, turnaround: '20-30 business days', turnaroundDays: 25, maxDeclaredValue: 999 },
      { name: 'Express', price: 60, turnaround: '10-15 business days', turnaroundDays: 13, maxDeclaredValue: 2499 },
      { name: 'Premium', price: 125, turnaround: '5-7 business days', turnaroundDays: 6, maxDeclaredValue: 4999 },
      { name: 'Walk-Through', price: 300, turnaround: '1-2 business days', turnaroundDays: 2, maxDeclaredValue: null },
    ],
    shippingToCompany: 8,
    returnShipping: 10,
    insurancePer1000: 2,
  },
];

/* ───── Card input type ───── */
interface CardEntry {
  id: string;
  name: string;
  rawValue: number;
  expectedGradedValue: number;
}

let nextId = 1;

export default function SubmissionPlanner() {
  const [company, setCompany] = useState('psa');
  const [tierIndex, setTierIndex] = useState(0);
  const [cards, setCards] = useState<CardEntry[]>([]);
  const [cardName, setCardName] = useState('');
  const [rawValue, setRawValue] = useState('');
  const [gradedValue, setGradedValue] = useState('');
  const [includeInsurance, setIncludeInsurance] = useState(false);
  const [includeMembership, setIncludeMembership] = useState(false);

  const selectedCompany = gradingCompanies.find(c => c.id === company)!;
  const selectedTier = selectedCompany.tiers[tierIndex];

  const addCard = () => {
    if (!cardName.trim()) return;
    const rv = parseFloat(rawValue) || 0;
    const gv = parseFloat(gradedValue) || rv * 2;
    setCards(prev => [...prev, {
      id: String(nextId++),
      name: cardName.trim(),
      rawValue: rv,
      expectedGradedValue: gv,
    }]);
    setCardName('');
    setRawValue('');
    setGradedValue('');
  };

  const removeCard = (id: string) => {
    setCards(prev => prev.filter(c => c.id !== id));
  };

  /* ───── Cost breakdown ───── */
  const breakdown = useMemo(() => {
    const numCards = cards.length;
    if (numCards === 0) return null;

    const gradingCost = numCards * selectedTier.price;
    const shippingTo = selectedCompany.shippingToCompany;
    const shippingBack = selectedCompany.returnShipping;
    const totalDeclaredValue = cards.reduce((sum, c) => sum + c.expectedGradedValue, 0);
    const insuranceCost = includeInsurance
      ? Math.ceil(totalDeclaredValue / 1000) * selectedCompany.insurancePer1000
      : 0;
    const membershipCost = includeMembership ? selectedCompany.membershipFee : 0;
    const totalRawValue = cards.reduce((sum, c) => sum + c.rawValue, 0);
    const totalGradedValue = cards.reduce((sum, c) => sum + c.expectedGradedValue, 0);

    const totalCost = gradingCost + shippingTo + shippingBack + insuranceCost + membershipCost;
    const costPerCard = totalCost / numCards;
    const netValueIncrease = totalGradedValue - totalRawValue - totalCost;
    const roi = totalCost > 0 ? ((totalGradedValue - totalRawValue - totalCost) / totalCost) * 100 : 0;

    const worthIt = netValueIncrease > 0;

    return {
      numCards,
      gradingCost,
      shippingTo,
      shippingBack,
      insuranceCost,
      membershipCost,
      totalCost,
      costPerCard,
      totalRawValue,
      totalGradedValue,
      netValueIncrease,
      roi,
      worthIt,
      turnaround: selectedTier.turnaround,
      turnaroundDays: selectedTier.turnaroundDays,
    };
  }, [cards, selectedTier, selectedCompany, includeInsurance, includeMembership]);

  /* ───── Compare across companies ───── */
  const comparison = useMemo(() => {
    if (cards.length === 0) return [];
    const numCards = cards.length;
    const totalGV = cards.reduce((sum, c) => sum + c.expectedGradedValue, 0);
    const totalRV = cards.reduce((sum, c) => sum + c.rawValue, 0);

    return gradingCompanies.map(comp => {
      // Find cheapest tier that fits
      const tier = comp.tiers[0];
      const gradingCost = numCards * tier.price;
      const total = gradingCost + comp.shippingToCompany + comp.returnShipping;
      const net = totalGV - totalRV - total;
      return {
        id: comp.id,
        name: comp.name,
        color: comp.color,
        tierName: tier.name,
        total,
        net,
        turnaround: tier.turnaround,
        pricePerCard: tier.price,
      };
    }).sort((a, b) => a.total - b.total);
  }, [cards]);

  return (
    <div className="space-y-8">
      {/* Company selector */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">1. Choose Grading Company</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {gradingCompanies.map(c => (
            <button
              key={c.id}
              onClick={() => { setCompany(c.id); setTierIndex(0); }}
              className={`p-4 rounded-xl border text-center transition-all ${
                company === c.id
                  ? `${c.bgColor} ${c.borderColor} ring-1 ring-offset-1 ring-offset-gray-950 ring-${c.id === 'psa' ? 'red' : c.id === 'bgs' ? 'blue' : c.id === 'cgc' ? 'yellow' : 'purple'}-500/30`
                  : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-600'
              }`}
            >
              <span className={`text-lg font-bold ${company === c.id ? c.color : 'text-white'}`}>{c.name}</span>
              <p className="text-zinc-500 text-xs mt-1">From ${c.tiers[0].price}/card</p>
            </button>
          ))}
        </div>
      </div>

      {/* Service tier */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">2. Select Service Tier</h2>
        <div className="grid gap-2">
          {selectedCompany.tiers.map((tier, idx) => (
            <button
              key={tier.name}
              onClick={() => setTierIndex(idx)}
              className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                tierIndex === idx
                  ? `${selectedCompany.bgColor} ${selectedCompany.borderColor}`
                  : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${tierIndex === idx ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                <div>
                  <span className={`font-medium ${tierIndex === idx ? 'text-white' : 'text-zinc-300'}`}>{tier.name}</span>
                  <span className="text-zinc-500 text-sm ml-2">{tier.turnaround}</span>
                </div>
              </div>
              <div className="text-right">
                <span className={`font-bold ${tierIndex === idx ? selectedCompany.color : 'text-zinc-300'}`}>${tier.price}</span>
                <span className="text-zinc-500 text-xs ml-1">/card</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Add cards */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">3. Add Your Cards</h2>
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
          <div className="grid sm:grid-cols-4 gap-3 mb-3">
            <div className="sm:col-span-2">
              <label className="text-xs text-zinc-500 mb-1 block">Card name / description</label>
              <input
                type="text"
                value={cardName}
                onChange={e => setCardName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCard()}
                placeholder="2024 Topps Chrome Ohtani #1"
                className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-emerald-600"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Raw value ($)</label>
              <input
                type="number"
                value={rawValue}
                onChange={e => setRawValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCard()}
                placeholder="50"
                className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-emerald-600"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Expected graded ($)</label>
              <input
                type="number"
                value={gradedValue}
                onChange={e => setGradedValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCard()}
                placeholder="120"
                className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>
          <button
            onClick={addCard}
            disabled={!cardName.trim()}
            className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-medium rounded-lg text-sm transition-colors"
          >
            + Add Card
          </button>
        </div>
      </div>

      {/* Card list */}
      {cards.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white">Your Cards ({cards.length})</h2>
            <button
              onClick={() => setCards([])}
              className="text-xs text-zinc-500 hover:text-red-400 transition-colors"
            >
              Clear all
            </button>
          </div>
          <div className="space-y-2">
            {cards.map((card, i) => (
              <div key={card.id} className="flex items-center justify-between bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-zinc-600 text-sm w-6 shrink-0">{i + 1}.</span>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">{card.name}</p>
                    <p className="text-zinc-500 text-xs">
                      Raw: ${card.rawValue.toLocaleString()} &rarr; Graded: ${card.expectedGradedValue.toLocaleString()}
                      <span className="text-emerald-400 ml-2">(+${(card.expectedGradedValue - card.rawValue).toLocaleString()})</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeCard(card.id)}
                  className="text-zinc-600 hover:text-red-400 transition-colors ml-2 shrink-0"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Options */}
      {cards.length > 0 && (
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
            <input
              type="checkbox"
              checked={includeInsurance}
              onChange={e => setIncludeInsurance(e.target.checked)}
              className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-emerald-500 focus:ring-emerald-500"
            />
            Include shipping insurance
          </label>
          {selectedCompany.membershipFee > 0 && (
            <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={includeMembership}
                onChange={e => setIncludeMembership(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-emerald-500 focus:ring-emerald-500"
              />
              Include {selectedCompany.membershipName}
            </label>
          )}
        </div>
      )}

      {/* Cost breakdown */}
      {breakdown && (
        <div className={`rounded-xl border p-6 ${
          breakdown.worthIt
            ? 'bg-emerald-950/30 border-emerald-800/50'
            : 'bg-red-950/30 border-red-800/50'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Cost Breakdown</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              breakdown.worthIt ? 'bg-emerald-900/60 text-emerald-400' : 'bg-red-900/60 text-red-400'
            }`}>
              {breakdown.worthIt ? 'WORTH GRADING' : 'NOT WORTH IT'}
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {/* Left: line items */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Grading ({breakdown.numCards} cards x ${selectedTier.price})</span>
                <span className="text-white">${breakdown.gradingCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Shipping to {selectedCompany.name}</span>
                <span className="text-white">${breakdown.shippingTo}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Return shipping</span>
                <span className="text-white">${breakdown.shippingBack}</span>
              </div>
              {breakdown.insuranceCost > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Insurance</span>
                  <span className="text-white">${breakdown.insuranceCost.toFixed(2)}</span>
                </div>
              )}
              {breakdown.membershipCost > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Membership</span>
                  <span className="text-white">${breakdown.membershipCost}</span>
                </div>
              )}
              <div className="border-t border-zinc-700 pt-2 flex justify-between text-sm font-bold">
                <span className="text-white">Total Cost</span>
                <span className={selectedCompany.color}>${breakdown.totalCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Cost per card</span>
                <span className="text-zinc-400">${breakdown.costPerCard.toFixed(2)}</span>
              </div>
            </div>

            {/* Right: summary */}
            <div className="space-y-3">
              <div className="bg-zinc-900/60 rounded-lg p-3">
                <p className="text-xs text-zinc-500 mb-1">Total Raw Value</p>
                <p className="text-white font-bold">${breakdown.totalRawValue.toLocaleString()}</p>
              </div>
              <div className="bg-zinc-900/60 rounded-lg p-3">
                <p className="text-xs text-zinc-500 mb-1">Expected Graded Value</p>
                <p className="text-white font-bold">${breakdown.totalGradedValue.toLocaleString()}</p>
              </div>
              <div className={`rounded-lg p-3 ${breakdown.worthIt ? 'bg-emerald-900/30' : 'bg-red-900/30'}`}>
                <p className="text-xs text-zinc-500 mb-1">Net Profit After Grading</p>
                <p className={`font-bold text-lg ${breakdown.worthIt ? 'text-emerald-400' : 'text-red-400'}`}>
                  {breakdown.netValueIncrease >= 0 ? '+' : ''}${breakdown.netValueIncrease.toLocaleString()}
                </p>
                <p className={`text-xs ${breakdown.roi >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  ROI: {breakdown.roi >= 0 ? '+' : ''}{breakdown.roi.toFixed(1)}%
                </p>
              </div>
              <div className="bg-zinc-900/60 rounded-lg p-3">
                <p className="text-xs text-zinc-500 mb-1">Estimated Turnaround</p>
                <p className="text-white font-medium text-sm">{breakdown.turnaround}</p>
                <p className="text-zinc-500 text-xs">~{breakdown.turnaroundDays} business days avg</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Company comparison */}
      {comparison.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">Compare Economy Tiers Across Companies</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left text-zinc-500 pb-2 font-medium">Company</th>
                  <th className="text-right text-zinc-500 pb-2 font-medium">Per Card</th>
                  <th className="text-right text-zinc-500 pb-2 font-medium">Total Cost</th>
                  <th className="text-right text-zinc-500 pb-2 font-medium">Net Profit</th>
                  <th className="text-right text-zinc-500 pb-2 font-medium">Turnaround</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((comp, i) => (
                  <tr key={comp.id} className={`border-b border-zinc-800/50 ${i === 0 ? 'bg-emerald-950/20' : ''}`}>
                    <td className={`py-3 font-medium ${comp.color}`}>
                      {comp.name}
                      {i === 0 && <span className="text-emerald-400 text-xs ml-2">Best Value</span>}
                    </td>
                    <td className="py-3 text-right text-zinc-300">${comp.pricePerCard}</td>
                    <td className="py-3 text-right text-white font-medium">${comp.total.toLocaleString()}</td>
                    <td className={`py-3 text-right font-medium ${comp.net >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {comp.net >= 0 ? '+' : ''}${comp.net.toLocaleString()}
                    </td>
                    <td className="py-3 text-right text-zinc-400 text-xs">{comp.turnaround}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pro tips */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Submission Tips</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              title: 'Batch your submissions',
              tip: 'Grading companies charge flat shipping fees regardless of quantity. Sending 20 cards costs nearly the same in shipping as 5. Batch to minimize per-card cost.',
            },
            {
              title: 'Know the breakeven',
              tip: 'A card needs to gain at least the grading cost + shipping in value to be worth submitting. For PSA Value ($25), your card should gain $30+ from the slab.',
            },
            {
              title: 'Use the right tier',
              tip: 'Economy tiers work great for cards under $500. Express/Premium are only worth it for high-value cards where you need them back fast for a selling window.',
            },
            {
              title: 'Consider crossovers',
              tip: 'If a card gets a lower grade than expected, you can "crossover" to another company. BGS 9.5 holders often crack for PSA 10 re-submission. Budget for this possibility.',
            },
            {
              title: 'Group by declared value',
              tip: 'Most companies require all cards in a submission to be in the same declared value tier. Group similar-value cards together to avoid paying premium rates on low-value cards.',
            },
            {
              title: 'Pre-grade before submitting',
              tip: 'Use a loupe and our Condition Self-Grader tool to assess your cards first. Only submit cards you genuinely expect to grade PSA 9+.',
            },
          ].map(item => (
            <div key={item.title} className="bg-zinc-800/50 rounded-lg p-4">
              <h3 className="text-white font-medium text-sm mb-1">{item.title}</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">{item.tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related tools */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Related Tools</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Condition Self-Grader', href: '/tools/condition-grader', desc: 'Assess your card before submitting' },
            { title: 'Grading ROI Calculator', href: '/tools/grading-roi', desc: 'Is the grade bump worth the cost?' },
            { title: 'Grading Tracker', href: '/tools/grading-tracker', desc: 'Track your submitted cards' },
            { title: 'Population Report', href: '/tools/pop-report', desc: 'Check grade scarcity' },
          ].map(tool => (
            <Link key={tool.href} href={tool.href} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 hover:border-emerald-700/50 transition-colors">
              <h3 className="text-white font-medium text-sm mb-1">{tool.title}</h3>
              <p className="text-zinc-500 text-xs">{tool.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
