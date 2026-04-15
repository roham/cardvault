'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

/* ─── Auction house data ─── */
const AUCTION_HOUSES = [
  { id: 'heritage', name: 'Heritage Auctions', premium: 0.20, flatFee: 0, minPremium: 0, shipping: 15, notes: '20% buyer\'s premium' },
  { id: 'goldin', name: 'Goldin Auctions', premium: 0.20, flatFee: 0, minPremium: 0, shipping: 12, notes: '20% buyer\'s premium' },
  { id: 'pwcc', name: 'PWCC Marketplace', premium: 0.20, flatFee: 0, minPremium: 0, shipping: 10, notes: '20% buyer\'s premium' },
  { id: 'lelands', name: 'Lelands', premium: 0.20, flatFee: 0, minPremium: 0, shipping: 15, notes: '20% buyer\'s premium' },
  { id: 'rea', name: 'Robert Edward Auctions', premium: 0.20, flatFee: 0, minPremium: 0, shipping: 18, notes: '20% buyer\'s premium' },
  { id: 'ebay', name: 'eBay Auction', premium: 0, flatFee: 0, minPremium: 0, shipping: 5, notes: 'No buyer premium — price is what you pay' },
  { id: 'myslabs', name: 'MySlabs', premium: 0.15, flatFee: 0, minPremium: 0, shipping: 8, notes: '15% buyer\'s premium' },
  { id: 'probstein', name: 'Probstein123 (eBay)', premium: 0, flatFee: 0, minPremium: 0, shipping: 5, notes: 'eBay auction — no additional premium' },
];

const GRADING_COSTS = [
  { company: 'PSA', tiers: [{ name: 'Economy', cost: 20, days: '180+' }, { name: 'Regular', cost: 50, days: '65' }, { name: 'Express', cost: 100, days: '15' }, { name: 'Super Express', cost: 200, days: '5' }] },
  { company: 'BGS', tiers: [{ name: 'Economy', cost: 25, days: '120' }, { name: 'Standard', cost: 50, days: '50' }, { name: 'Express', cost: 150, days: '10' }, { name: 'Premium', cost: 250, days: '5' }] },
  { company: 'CGC', tiers: [{ name: 'Economy', cost: 20, days: '150' }, { name: 'Standard', cost: 40, days: '50' }, { name: 'Express', cost: 100, days: '10' }] },
  { company: 'SGC', tiers: [{ name: 'Economy', cost: 15, days: '120' }, { name: 'Regular', cost: 30, days: '45' }, { name: 'Express', cost: 100, days: '10' }] },
];

/* ─── Helpers ─── */
function fmt(n: number): string {
  if (n < 0) return `-$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtWhole(n: number): string {
  return `$${Math.round(n).toLocaleString()}`;
}

interface CostBreakdown {
  house: typeof AUCTION_HOUSES[0];
  hammerPrice: number;
  premium: number;
  tax: number;
  shipping: number;
  gradingCost: number;
  totalCost: number;
  profit: number;
  roi: number;
}

export default function AuctionBidClient() {
  const [bidAmount, setBidAmount] = useState('');
  const [taxRate, setTaxRate] = useState('8');
  const [includeGrading, setIncludeGrading] = useState(false);
  const [gradingCompany, setGradingCompany] = useState('PSA');
  const [gradingTier, setGradingTier] = useState('Economy');
  const [targetResale, setTargetResale] = useState('');
  const [selectedHouse, setSelectedHouse] = useState('heritage');
  const [mode, setMode] = useState<'cost' | 'max-bid'>('cost');
  const [maxBudget, setMaxBudget] = useState('');

  const bid = parseFloat(bidAmount) || 0;
  const tax = parseFloat(taxRate) || 0;
  const resale = parseFloat(targetResale) || 0;
  const budget = parseFloat(maxBudget) || 0;

  const gradingCostValue = useMemo(() => {
    if (!includeGrading) return 0;
    const company = GRADING_COSTS.find(g => g.company === gradingCompany);
    const tier = company?.tiers.find(t => t.name === gradingTier);
    return tier?.cost || 0;
  }, [includeGrading, gradingCompany, gradingTier]);

  const selectedGradingTiers = useMemo(() => {
    return GRADING_COSTS.find(g => g.company === gradingCompany)?.tiers || [];
  }, [gradingCompany]);

  /* ─── Cost analysis for all houses ─── */
  const costBreakdowns: CostBreakdown[] = useMemo(() => {
    if (bid <= 0) return [];
    return AUCTION_HOUSES.map(house => {
      const premium = bid * house.premium + house.flatFee;
      const subtotal = bid + premium;
      const taxAmount = subtotal * (tax / 100);
      const totalCost = subtotal + taxAmount + house.shipping + gradingCostValue;
      const profit = resale > 0 ? resale - totalCost : 0;
      const roi = resale > 0 && totalCost > 0 ? ((resale - totalCost) / totalCost) * 100 : 0;
      return {
        house,
        hammerPrice: bid,
        premium,
        tax: taxAmount,
        shipping: house.shipping,
        gradingCost: gradingCostValue,
        totalCost,
        profit,
        roi,
      };
    }).sort((a, b) => a.totalCost - b.totalCost);
  }, [bid, tax, gradingCostValue, resale]);

  /* ─── Max bid calculator (reverse) ─── */
  const maxBids = useMemo(() => {
    if (budget <= 0) return [];
    return AUCTION_HOUSES.map(house => {
      // budget = bid + bid*premium + (bid + bid*premium)*tax/100 + shipping + grading
      // budget - shipping - grading = bid*(1 + premium) * (1 + tax/100)
      const netBudget = budget - house.shipping - gradingCostValue;
      if (netBudget <= 0) return { house, maxBid: 0, totalCost: 0 };
      const multiplier = (1 + house.premium) * (1 + tax / 100);
      const maxBid = netBudget / multiplier;
      return { house, maxBid: Math.max(0, maxBid), totalCost: budget };
    }).sort((a, b) => b.maxBid - a.maxBid);
  }, [budget, tax, gradingCostValue]);

  /* ─── Selected house detail ─── */
  const selectedBreakdown = costBreakdowns.find(b => b.house.id === selectedHouse);

  return (
    <div className="space-y-8">
      {/* Mode Toggle */}
      <div className="flex gap-2 p-1 bg-gray-800/60 rounded-xl w-fit">
        <button
          onClick={() => setMode('cost')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'cost' ? 'bg-amber-600 text-white' : 'text-gray-400 hover:text-white'}`}
        >
          True Cost Calculator
        </button>
        <button
          onClick={() => setMode('max-bid')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'max-bid' ? 'bg-amber-600 text-white' : 'text-gray-400 hover:text-white'}`}
        >
          Max Bid Finder
        </button>
      </div>

      {mode === 'cost' ? (
        <>
          {/* ─── True Cost Calculator ─── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input panel */}
            <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6 space-y-5">
              <h2 className="text-lg font-semibold text-white">Your Bid</h2>

              <div>
                <label className="text-sm text-gray-400 block mb-1">Hammer Price (Winning Bid)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={e => setBidAmount(e.target.value)}
                    placeholder="500"
                    className="w-full pl-7 pr-4 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-1">Sales Tax Rate (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={taxRate}
                    onChange={e => setTaxRate(e.target.value)}
                    placeholder="8"
                    step="0.1"
                    className="w-full pr-8 pl-4 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Varies by state. 0% in OR, MT, NH, DE, AK.</p>
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-1">Target Resale Value (optional)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={targetResale}
                    onChange={e => setTargetResale(e.target.value)}
                    placeholder="800"
                    className="w-full pl-7 pr-4 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">If you plan to flip — shows profit per house.</p>
              </div>

              {/* Grading toggle */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeGrading}
                    onChange={e => setIncludeGrading(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-900 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="text-sm text-gray-300">Card is raw — include grading cost</span>
                </label>
                {includeGrading && (
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Company</label>
                      <select
                        value={gradingCompany}
                        onChange={e => { setGradingCompany(e.target.value); setGradingTier('Economy'); }}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm focus:border-amber-500 focus:outline-none"
                      >
                        {GRADING_COSTS.map(g => (
                          <option key={g.company} value={g.company}>{g.company}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Service Tier</label>
                      <select
                        value={gradingTier}
                        onChange={e => setGradingTier(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm focus:border-amber-500 focus:outline-none"
                      >
                        {selectedGradingTiers.map(t => (
                          <option key={t.name} value={t.name}>{t.name} — ${t.cost} ({t.days} days)</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Results panel */}
            <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">True Cost Breakdown</h2>
              {bid > 0 && selectedBreakdown ? (
                <div className="space-y-4">
                  {/* Breakdown */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Hammer Price</span>
                      <span className="text-white">{fmt(selectedBreakdown.hammerPrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Buyer&apos;s Premium ({(selectedBreakdown.house.premium * 100).toFixed(0)}%)</span>
                      <span className="text-amber-400">+{fmt(selectedBreakdown.premium)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Sales Tax ({tax}%)</span>
                      <span className="text-amber-400">+{fmt(selectedBreakdown.tax)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Shipping</span>
                      <span className="text-amber-400">+{fmt(selectedBreakdown.shipping)}</span>
                    </div>
                    {includeGrading && gradingCostValue > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Grading ({gradingCompany} {gradingTier})</span>
                        <span className="text-amber-400">+{fmt(gradingCostValue)}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-600 pt-2 flex justify-between">
                      <span className="text-white font-semibold">Total Landed Cost</span>
                      <span className="text-amber-400 font-bold text-lg">{fmt(selectedBreakdown.totalCost)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Premium over bid</span>
                      <span className="text-rose-400">+{((selectedBreakdown.totalCost / bid - 1) * 100).toFixed(1)}%</span>
                    </div>
                  </div>

                  {/* Profit section */}
                  {resale > 0 && (
                    <div className="mt-4 bg-gray-900/60 border border-gray-700 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-300 mb-2">Flip Analysis</h3>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Target Resale</span>
                        <span className="text-white">{fmt(resale)}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Total Cost</span>
                        <span className="text-white">-{fmt(selectedBreakdown.totalCost)}</span>
                      </div>
                      <div className="flex justify-between border-t border-gray-700 pt-1">
                        <span className="text-white font-medium">Net Profit</span>
                        <span className={`font-bold ${selectedBreakdown.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {fmt(selectedBreakdown.profit)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-gray-400">ROI</span>
                        <span className={selectedBreakdown.roi >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {selectedBreakdown.roi.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Auction house selector */}
                  <div className="mt-4">
                    <label className="text-xs text-gray-500 block mb-2">Select Auction House</label>
                    <select
                      value={selectedHouse}
                      onChange={e => setSelectedHouse(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm focus:border-amber-500 focus:outline-none"
                    >
                      {AUCTION_HOUSES.map(h => (
                        <option key={h.id} value={h.id}>{h.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Enter a bid amount to see the true cost.</p>
              )}
            </div>
          </div>

          {/* ─── All Houses Comparison ─── */}
          {bid > 0 && costBreakdowns.length > 0 && (
            <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Auction House Comparison — {fmtWhole(bid)} Bid</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left text-gray-400 py-2 pr-4">Auction House</th>
                      <th className="text-right text-gray-400 py-2 px-2">Premium</th>
                      <th className="text-right text-gray-400 py-2 px-2">Tax</th>
                      <th className="text-right text-gray-400 py-2 px-2">Ship</th>
                      {includeGrading && <th className="text-right text-gray-400 py-2 px-2">Grade</th>}
                      <th className="text-right text-gray-400 py-2 px-2 font-semibold">Total</th>
                      {resale > 0 && <th className="text-right text-gray-400 py-2 pl-2">Profit</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {costBreakdowns.map((b, i) => (
                      <tr
                        key={b.house.id}
                        className={`border-b border-gray-800 ${i === 0 ? 'bg-emerald-950/20' : ''} ${b.house.id === selectedHouse ? 'ring-1 ring-amber-600/40' : ''}`}
                      >
                        <td className="py-2.5 pr-4">
                          <div className="flex items-center gap-2">
                            {i === 0 && <span className="text-xs bg-emerald-900/60 text-emerald-400 px-1.5 py-0.5 rounded">Best</span>}
                            <span className="text-white">{b.house.name}</span>
                          </div>
                        </td>
                        <td className="text-right py-2.5 px-2 text-amber-400">{fmt(b.premium)}</td>
                        <td className="text-right py-2.5 px-2 text-gray-300">{fmt(b.tax)}</td>
                        <td className="text-right py-2.5 px-2 text-gray-300">{fmt(b.shipping)}</td>
                        {includeGrading && <td className="text-right py-2.5 px-2 text-gray-300">{fmt(b.gradingCost)}</td>}
                        <td className="text-right py-2.5 px-2 font-semibold text-white">{fmt(b.totalCost)}</td>
                        {resale > 0 && (
                          <td className={`text-right py-2.5 pl-2 font-medium ${b.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {fmt(b.profit)}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {costBreakdowns.length >= 2 && (
                <p className="text-xs text-gray-500 mt-3">
                  Buying at {costBreakdowns[costBreakdowns.length - 1].house.name} costs {fmt(costBreakdowns[costBreakdowns.length - 1].totalCost - costBreakdowns[0].totalCost)} more
                  than {costBreakdowns[0].house.name} for the same {fmtWhole(bid)} winning bid.
                </p>
              )}
            </div>
          )}
        </>
      ) : (
        <>
          {/* ─── Max Bid Finder ─── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6 space-y-5">
              <h2 className="text-lg font-semibold text-white">Your Budget</h2>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Maximum Total Budget</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={maxBudget}
                    onChange={e => setMaxBudget(e.target.value)}
                    placeholder="1000"
                    className="w-full pl-7 pr-4 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Your absolute max spend including all fees.</p>
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Sales Tax Rate (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={taxRate}
                    onChange={e => setTaxRate(e.target.value)}
                    placeholder="8"
                    step="0.1"
                    className="w-full pr-8 pl-4 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeGrading}
                  onChange={e => setIncludeGrading(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-900 text-amber-500 focus:ring-amber-500"
                />
                <span className="text-sm text-gray-300">Include grading cost</span>
              </label>
              {includeGrading && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Company</label>
                    <select value={gradingCompany} onChange={e => { setGradingCompany(e.target.value); setGradingTier('Economy'); }} className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm focus:border-amber-500 focus:outline-none">
                      {GRADING_COSTS.map(g => <option key={g.company} value={g.company}>{g.company}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Tier</label>
                    <select value={gradingTier} onChange={e => setGradingTier(e.target.value)} className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm focus:border-amber-500 focus:outline-none">
                      {selectedGradingTiers.map(t => <option key={t.name} value={t.name}>{t.name} — ${t.cost}</option>)}
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Maximum Bids by House</h2>
              {budget > 0 && maxBids.length > 0 ? (
                <div className="space-y-3">
                  {maxBids.map((m, i) => (
                    <div
                      key={m.house.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${i === 0 ? 'bg-emerald-950/20 border-emerald-800/40' : 'bg-gray-900/40 border-gray-700/50'}`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          {i === 0 && <span className="text-xs bg-emerald-900/60 text-emerald-400 px-1.5 py-0.5 rounded">Best</span>}
                          <span className="text-white text-sm font-medium">{m.house.name}</span>
                        </div>
                        <span className="text-xs text-gray-500">{m.house.notes}</span>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold text-lg ${m.maxBid > 0 ? 'text-amber-400' : 'text-gray-600'}`}>
                          {m.maxBid > 0 ? fmtWhole(m.maxBid) : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">max bid</div>
                      </div>
                    </div>
                  ))}
                  <p className="text-xs text-gray-500 mt-2">
                    With a {fmtWhole(budget)} budget, you can bid up to {fmtWhole(maxBids[0]?.maxBid || 0)} at {maxBids[0]?.house.name}
                    {maxBids.length >= 2 && maxBids[maxBids.length - 1].maxBid > 0 &&
                      ` vs {fmtWhole(maxBids[maxBids.length - 1].maxBid)} at ${maxBids[maxBids.length - 1].house.name}`
                    }.
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Enter your total budget to see max bids.</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* ─── Quick Examples ─── */}
      <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Common Scenarios</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'PSA 10 Wemby Prizm', bid: 500, resale: 800, desc: 'Hot auction item' },
            { label: 'Vintage Mantle Raw', bid: 2000, resale: 0, desc: 'Personal collection' },
            { label: 'Junk Wax Lot', bid: 50, resale: 0, desc: 'Nostalgia buy' },
            { label: 'Topps Chrome Case', bid: 5000, resale: 6500, desc: 'Sealed investment' },
          ].map(ex => (
            <button
              key={ex.label}
              onClick={() => { setMode('cost'); setBidAmount(String(ex.bid)); setTargetResale(String(ex.resale)); }}
              className="text-left p-4 bg-gray-900/60 border border-gray-700 rounded-lg hover:border-amber-700/50 transition-colors"
            >
              <div className="text-white text-sm font-medium">{ex.label}</div>
              <div className="text-amber-400 text-lg font-bold">{fmtWhole(ex.bid)}</div>
              <div className="text-gray-500 text-xs">{ex.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* ─── Buyer Premium Reference ─── */}
      <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Buyer&apos;s Premium Reference</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {AUCTION_HOUSES.map(h => (
            <div key={h.id} className="flex items-center justify-between p-3 bg-gray-900/40 rounded-lg border border-gray-800">
              <div>
                <div className="text-white text-sm font-medium">{h.name}</div>
                <div className="text-xs text-gray-500">{h.notes}</div>
              </div>
              <div className="text-amber-400 font-bold">{h.premium > 0 ? `${(h.premium * 100).toFixed(0)}%` : 'None'}</div>
            </div>
          ))}
        </div>
        <div className="bg-amber-950/30 border border-amber-900/40 rounded-lg p-4">
          <h3 className="text-amber-400 text-sm font-semibold mb-2">What is a Buyer&apos;s Premium?</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            A buyer&apos;s premium is an additional fee charged by auction houses on top of the winning bid (hammer price).
            If you win a card for $500 at an auction with a 20% buyer&apos;s premium, you actually pay $600 before tax and shipping.
            This is pure profit for the auction house and is the #1 hidden cost that catches new bidders off guard.
            Always calculate your maximum bid AFTER accounting for the premium.
          </p>
        </div>
      </div>

      {/* ─── Bidding Tips ─── */}
      <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Auction Bidding Tips</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { title: 'Set Your Max Before the Auction', tip: 'Use the Max Bid Finder to calculate your absolute ceiling. Write it down. Don\'t go over it — auction fever is real and costs collectors thousands every year.' },
            { title: 'Factor in ALL Costs', tip: 'Buyer\'s premium, sales tax, shipping, and potential grading fees can add 25-35% to your winning bid. A $500 hammer price easily becomes $650+ total.' },
            { title: 'Compare Across Platforms', tip: 'The same card often appears on multiple platforms simultaneously. Heritage charges 20% premium vs 0% on eBay — check both before bidding.' },
            { title: 'Bid Odd Numbers', tip: 'Instead of $500, bid $510 or $525. Most bidders use round numbers, so odd bids often win by a small margin. This works especially well on eBay.' },
            { title: 'Watch the Final Minutes', tip: 'Most auction action happens in the last 2 minutes. Set a maximum and let the sniping tools do the work — avoid emotional bidding during live auctions.' },
            { title: 'Check Sold Comps First', tip: 'Before bidding, search eBay sold listings and 130point.com for recent sales of the same card. Never bid more than the last 3 comparable sales.' },
          ].map(t => (
            <div key={t.title} className="p-4 bg-gray-900/40 border border-gray-800 rounded-lg">
              <h3 className="text-white text-sm font-semibold mb-1">{t.title}</h3>
              <p className="text-gray-400 text-xs leading-relaxed">{t.tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Cross-links ─── */}
      <div className="flex flex-wrap gap-3">
        {[
          { href: '/tools/flip-calc', label: 'Flip Profit Calculator' },
          { href: '/tools/investment-calc', label: 'Investment Calculator' },
          { href: '/tools/ebay-fee-calc', label: 'eBay Fee Calculator' },
          { href: '/tools/grading-roi', label: 'Grading ROI Calculator' },
          { href: '/tools/submission-planner', label: 'Submission Planner' },
          { href: '/tools/buyback-calc', label: 'Dealer Buyback Calculator' },
          { href: '/vault/consignment', label: 'Consignment Tracker' },
        ].map(l => (
          <Link key={l.href} href={l.href} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white border border-gray-700 rounded-lg text-xs transition-colors">
            {l.label} &rarr;
          </Link>
        ))}
      </div>
    </div>
  );
}
