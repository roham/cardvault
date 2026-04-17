'use client';

import { useMemo, useState } from 'react';

type House = {
  id: string;
  name: string;
  bp: number;
  note: string;
  tier: 'high' | 'mid' | 'low';
  shipFlat: number;
};

const HOUSES: House[] = [
  { id: 'heritage', name: 'Heritage Auctions', bp: 25, note: 'Sports/TCG tier — 20% on selected categories', tier: 'high', shipFlat: 35 },
  { id: 'goldin', name: 'Goldin (Fanatics)', bp: 20, note: 'Industry-standard 20% across most lots', tier: 'mid', shipFlat: 25 },
  { id: 'pwcc', name: 'PWCC Marketplace Premier', bp: 17.5, note: 'Lowest BP among modern card premier venues', tier: 'low', shipFlat: 20 },
  { id: 'lelands', name: 'Lelands', bp: 22, note: 'Vintage-leaning catalog + high-end memorabilia', tier: 'high', shipFlat: 40 },
  { id: 'memorylane', name: 'Memory Lane Inc', bp: 20, note: 'Vintage specialists — standard 20% BP', tier: 'mid', shipFlat: 30 },
  { id: 'rea', name: 'Robert Edward Auctions', bp: 20, note: 'Pre-war / vintage sports cards + memorabilia', tier: 'mid', shipFlat: 35 },
  { id: 'hugscott', name: 'Huggins & Scott', bp: 22, note: 'Baltimore-based generalist catalog', tier: 'high', shipFlat: 30 },
  { id: 'fanaticscol', name: 'Fanatics Collect', bp: 15, note: 'Lowest BP — launched 2024, weekly drops', tier: 'low', shipFlat: 15 },
  { id: 'lotg', name: 'Love of the Game', bp: 20, note: 'Smaller-cap vintage specialist', tier: 'mid', shipFlat: 25 },
  { id: 'ebay', name: 'eBay (auction)', bp: 0, note: 'No BP — fees on seller side. Sales tax applies.', tier: 'low', shipFlat: 15 },
  { id: 'whatnot', name: 'Whatnot (live)', bp: 0, note: 'No BP — 2.9% + 0.30 buyer processing fee', tier: 'low', shipFlat: 15 },
];

type StateRate = { abbr: string; name: string; rate: number };

const STATES: StateRate[] = [
  { abbr: '--', name: 'No state (out of US / select)', rate: 0 },
  { abbr: 'DE', name: 'Delaware — no sales tax', rate: 0 },
  { abbr: 'MT', name: 'Montana — no sales tax', rate: 0 },
  { abbr: 'NH', name: 'New Hampshire — no sales tax', rate: 0 },
  { abbr: 'OR', name: 'Oregon — no sales tax', rate: 0 },
  { abbr: 'AK', name: 'Alaska — local only, avg ~1.8%', rate: 1.8 },
  { abbr: 'AL', name: 'Alabama — combined avg 9.25%', rate: 9.25 },
  { abbr: 'AZ', name: 'Arizona — combined avg 8.4%', rate: 8.4 },
  { abbr: 'CA', name: 'California — combined avg 8.85%', rate: 8.85 },
  { abbr: 'CO', name: 'Colorado — combined avg 7.8%', rate: 7.8 },
  { abbr: 'CT', name: 'Connecticut — 6.35%', rate: 6.35 },
  { abbr: 'FL', name: 'Florida — combined avg 7.0%', rate: 7.0 },
  { abbr: 'GA', name: 'Georgia — combined avg 7.4%', rate: 7.4 },
  { abbr: 'IL', name: 'Illinois — combined avg 8.85%', rate: 8.85 },
  { abbr: 'IN', name: 'Indiana — 7.0%', rate: 7.0 },
  { abbr: 'MA', name: 'Massachusetts — 6.25%', rate: 6.25 },
  { abbr: 'MD', name: 'Maryland — 6.0%', rate: 6.0 },
  { abbr: 'MI', name: 'Michigan — 6.0%', rate: 6.0 },
  { abbr: 'MN', name: 'Minnesota — combined avg 7.5%', rate: 7.5 },
  { abbr: 'NC', name: 'North Carolina — combined avg 7.0%', rate: 7.0 },
  { abbr: 'NJ', name: 'New Jersey — 6.625%', rate: 6.625 },
  { abbr: 'NV', name: 'Nevada — combined avg 8.25%', rate: 8.25 },
  { abbr: 'NY', name: 'New York — combined avg 8.525%', rate: 8.525 },
  { abbr: 'OH', name: 'Ohio — combined avg 7.2%', rate: 7.2 },
  { abbr: 'PA', name: 'Pennsylvania — 6.0%', rate: 6.0 },
  { abbr: 'TN', name: 'Tennessee — combined avg 9.55%', rate: 9.55 },
  { abbr: 'TX', name: 'Texas — combined avg 8.2%', rate: 8.2 },
  { abbr: 'VA', name: 'Virginia — combined avg 5.75%', rate: 5.75 },
  { abbr: 'WA', name: 'Washington — combined avg 9.4%', rate: 9.4 },
  { abbr: 'WI', name: 'Wisconsin — combined avg 5.43%', rate: 5.43 },
];

function shippingForValue(allIn: number, houseFlat: number): number {
  if (allIn >= 100000) return Math.max(houseFlat, 400);
  if (allIn >= 20000) return Math.max(houseFlat, 150);
  if (allIn >= 5000) return Math.max(houseFlat, 65);
  if (allIn >= 1000) return Math.max(houseFlat, 30);
  return houseFlat;
}

function fmt(n: number): string {
  if (!isFinite(n) || isNaN(n)) return '—';
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 0 })}`;
}

function fmtPct(n: number): string {
  return `${n.toFixed(2)}%`;
}

export default function BuyersPremiumClient() {
  const [mode, setMode] = useState<'budget' | 'hammer'>('hammer');
  const [houseId, setHouseId] = useState<string>('heritage');
  const [hammer, setHammer] = useState<number>(5000);
  const [budget, setBudget] = useState<number>(6000);
  const [stateAbbr, setStateAbbr] = useState<string>('CA');
  const [customTax, setCustomTax] = useState<number | null>(null);
  const [ccSurcharge, setCcSurcharge] = useState<boolean>(false);
  const [addGrading, setAddGrading] = useState<boolean>(false);
  const [gradingTier, setGradingTier] = useState<number>(75);

  const house = HOUSES.find(h => h.id === houseId) || HOUSES[0];
  const stateObj = STATES.find(s => s.abbr === stateAbbr) || STATES[0];
  const taxRate = customTax !== null ? customTax : stateObj.rate;

  const computeAllIn = (h: House, hammerAmt: number) => {
    const bp = hammerAmt * (h.bp / 100);
    const preTax = hammerAmt + bp;
    const ccFee = ccSurcharge ? preTax * 0.025 : 0;
    const salesTax = preTax * (taxRate / 100);
    const shipping = shippingForValue(preTax, h.shipFlat);
    const grading = addGrading ? gradingTier : 0;
    const total = preTax + ccFee + salesTax + shipping + grading;
    return { hammer: hammerAmt, bp, preTax, ccFee, salesTax, shipping, grading, total };
  };

  // Reverse-calc: given budget, find max hammer for selected house
  const reverseMaxHammer = (h: House, totalBudget: number) => {
    // total = hammer * (1 + bp/100) * (1 + taxRate/100 + (cc?0.025:0)) + shipping(total_estimate) + grading
    // Approximate: solve iteratively
    const grading = addGrading ? gradingTier : 0;
    let lo = 0;
    let hi = totalBudget;
    for (let i = 0; i < 40; i++) {
      const mid = (lo + hi) / 2;
      const { total } = computeAllIn(h, mid);
      if (total <= totalBudget) {
        lo = mid;
      } else {
        hi = mid;
      }
    }
    const maxHammer = lo;
    const full = computeAllIn(h, maxHammer);
    return { maxHammer, ...full, gradingAddon: grading };
  };

  const primary = useMemo(() => {
    if (mode === 'hammer') {
      return computeAllIn(house, Math.max(0, hammer));
    } else {
      const r = reverseMaxHammer(house, Math.max(0, budget));
      return { ...r, preTax: r.preTax, bp: r.bp };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, houseId, hammer, budget, taxRate, ccSurcharge, addGrading, gradingTier]);

  const comparison = useMemo(() => {
    const effectiveHammer = mode === 'hammer' ? Math.max(0, hammer) : null;
    const effectiveBudget = mode === 'budget' ? Math.max(0, budget) : null;
    return HOUSES.map(h => {
      if (effectiveHammer !== null) {
        const r = computeAllIn(h, effectiveHammer);
        return { house: h, hammer: effectiveHammer, total: r.total, bp: r.bp };
      } else if (effectiveBudget !== null) {
        const r = reverseMaxHammer(h, effectiveBudget);
        return { house: h, hammer: r.maxHammer, total: r.total, bp: r.bp };
      }
      return { house: h, hammer: 0, total: 0, bp: 0 };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, hammer, budget, taxRate, ccSurcharge, addGrading, gradingTier]);

  const sortedComp = [...comparison].sort((a, b) => {
    if (mode === 'hammer') return a.total - b.total; // cheapest first
    return b.hammer - a.hammer; // most-hammer-for-budget first
  });

  const best = sortedComp[0];
  const worst = sortedComp[sortedComp.length - 1];
  const spread = mode === 'hammer' ? (worst.total - best.total) : (best.hammer - worst.hammer);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-5">
            <button
              onClick={() => setMode('hammer')}
              className={`px-4 py-2 rounded text-sm font-semibold transition ${mode === 'hammer' ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              I won at a hammer
            </button>
            <button
              onClick={() => setMode('budget')}
              className={`px-4 py-2 rounded text-sm font-semibold transition ${mode === 'budget' ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              I have a total budget
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <label className="block">
              <span className="text-sm text-slate-400 mb-1 block">Auction house</span>
              <select
                value={houseId}
                onChange={e => setHouseId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-orange-500"
              >
                {HOUSES.map(h => (
                  <option key={h.id} value={h.id}>{h.name} — {h.bp}% BP</option>
                ))}
              </select>
              <span className="text-xs text-slate-500 mt-1 block">{house.note}</span>
            </label>

            {mode === 'hammer' ? (
              <label className="block">
                <span className="text-sm text-slate-400 mb-1 block">Hammer price ($)</span>
                <input
                  type="number"
                  value={hammer}
                  onChange={e => setHammer(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                  min={0}
                  step={100}
                />
                <span className="text-xs text-slate-500 mt-1 block">What you bid / what it hammered at</span>
              </label>
            ) : (
              <label className="block">
                <span className="text-sm text-slate-400 mb-1 block">Total all-in budget ($)</span>
                <input
                  type="number"
                  value={budget}
                  onChange={e => setBudget(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                  min={0}
                  step={100}
                />
                <span className="text-xs text-slate-500 mt-1 block">Your hard ceiling including BP + tax + shipping</span>
              </label>
            )}

            <label className="block">
              <span className="text-sm text-slate-400 mb-1 block">Shipping-destination state</span>
              <select
                value={stateAbbr}
                onChange={e => { setStateAbbr(e.target.value); setCustomTax(null); }}
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-orange-500"
              >
                {STATES.map(s => (
                  <option key={s.abbr} value={s.abbr}>{s.name}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm text-slate-400 mb-1 block">Custom sales-tax rate (%, optional)</span>
              <input
                type="number"
                value={customTax ?? ''}
                onChange={e => setCustomTax(e.target.value === '' ? null : parseFloat(e.target.value))}
                placeholder={`Using ${stateObj.rate}%`}
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                min={0}
                step={0.01}
              />
              <span className="text-xs text-slate-500 mt-1 block">Override for exact local rate</span>
            </label>
          </div>

          <div className="flex flex-wrap gap-4 pt-3 border-t border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={ccSurcharge}
                onChange={e => setCcSurcharge(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-orange-500 focus:ring-orange-500"
              />
              <span className="text-sm text-slate-300">Credit-card surcharge (+2.5%)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={addGrading}
                onChange={e => setAddGrading(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-orange-500 focus:ring-orange-500"
              />
              <span className="text-sm text-slate-300">Add grading fee (after win)</span>
            </label>
            {addGrading && (
              <label className="flex items-center gap-2">
                <span className="text-sm text-slate-400">Tier $</span>
                <input
                  type="number"
                  value={gradingTier}
                  onChange={e => setGradingTier(parseFloat(e.target.value) || 0)}
                  className="w-24 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-orange-500"
                  min={0}
                  step={25}
                />
              </label>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-950/60 to-amber-950/40 border border-orange-900/60 rounded-lg p-6">
          <div className="text-xs uppercase tracking-wider text-orange-400 font-semibold mb-3">
            {mode === 'hammer' ? 'All-in cost' : 'Max hammer for your budget'}
          </div>
          <div className="text-4xl font-bold text-white mb-4">
            {mode === 'hammer' ? fmt(primary.total) : fmt((primary as ReturnType<typeof reverseMaxHammer>).maxHammer)}
          </div>
          <div className="space-y-2 text-sm">
            {mode === 'budget' && (
              <div className="flex justify-between text-slate-300 pb-2 border-b border-slate-800">
                <span>Max hammer to bid</span>
                <span className="font-mono text-white">{fmt((primary as ReturnType<typeof reverseMaxHammer>).maxHammer)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-400">
              <span>Hammer</span>
              <span className="font-mono">{fmt(mode === 'hammer' ? hammer : (primary as ReturnType<typeof reverseMaxHammer>).maxHammer)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Buyer's Premium ({fmtPct(house.bp)})</span>
              <span className="font-mono">{fmt(primary.bp)}</span>
            </div>
            {primary.ccFee > 0 && (
              <div className="flex justify-between text-slate-400">
                <span>Credit-card surcharge</span>
                <span className="font-mono">{fmt(primary.ccFee)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-400">
              <span>Sales tax ({fmtPct(taxRate)})</span>
              <span className="font-mono">{fmt(primary.salesTax)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Shipping (insured est.)</span>
              <span className="font-mono">{fmt(primary.shipping)}</span>
            </div>
            {primary.grading > 0 && (
              <div className="flex justify-between text-slate-400">
                <span>Grading add-on</span>
                <span className="font-mono">{fmt(primary.grading)}</span>
              </div>
            )}
            <div className="flex justify-between text-white font-bold pt-2 border-t border-slate-800 text-base">
              <span>{mode === 'hammer' ? 'Total out of pocket' : 'At budget ceiling'}</span>
              <span className="font-mono">{fmt(primary.total)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-6">
        <div className="flex items-end justify-between mb-5 flex-wrap gap-2">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Side-by-side house comparison</h3>
            <p className="text-sm text-slate-400">
              {mode === 'hammer'
                ? `Same ${fmt(hammer)} hammer across 11 houses — cheapest all-in at top.`
                : `Maximum hammer each house allows within your ${fmt(budget)} budget — most hammer at top.`}
            </p>
          </div>
          <div className="text-xs text-slate-400">
            Spread: <span className="text-orange-400 font-mono font-semibold">
              {mode === 'hammer' ? fmt(spread) : fmt(spread)}
            </span>
            {mode === 'hammer' ? ' more at costliest' : ' more hammer at best'}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-slate-500 border-b border-slate-800">
                <th className="pb-2 pr-3">#</th>
                <th className="pb-2 pr-3">House</th>
                <th className="pb-2 pr-3 text-right">BP</th>
                <th className="pb-2 pr-3 text-right">{mode === 'hammer' ? 'Hammer' : 'Max hammer'}</th>
                <th className="pb-2 pr-3 text-right">BP $</th>
                <th className="pb-2 pr-3 text-right">All-in</th>
                <th className="pb-2 text-right">Δ vs best</th>
              </tr>
            </thead>
            <tbody>
              {sortedComp.map((row, i) => {
                const delta = mode === 'hammer' ? (row.total - best.total) : (row.hammer - best.hammer);
                const isSelected = row.house.id === houseId;
                return (
                  <tr
                    key={row.house.id}
                    className={`border-b border-slate-800/60 ${isSelected ? 'bg-orange-950/30' : ''} hover:bg-slate-800/40 cursor-pointer`}
                    onClick={() => setHouseId(row.house.id)}
                  >
                    <td className="py-2 pr-3 text-slate-500 text-xs">{i + 1}</td>
                    <td className="py-2 pr-3 text-white font-medium">{row.house.name}</td>
                    <td className="py-2 pr-3 text-right text-slate-300 font-mono">{fmtPct(row.house.bp)}</td>
                    <td className="py-2 pr-3 text-right text-slate-300 font-mono">{fmt(row.hammer)}</td>
                    <td className="py-2 pr-3 text-right text-slate-400 font-mono text-xs">{fmt(row.bp)}</td>
                    <td className="py-2 pr-3 text-right text-white font-mono font-semibold">{fmt(row.total)}</td>
                    <td className={`py-2 text-right font-mono text-xs ${i === 0 ? 'text-emerald-400' : mode === 'hammer' ? 'text-rose-400' : 'text-rose-400'}`}>
                      {i === 0 ? '— best' : mode === 'hammer' ? `+${fmt(delta)}` : `−${fmt(-delta)}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500 mt-4">
          Click any row to make that house the selected one. BP rates reflect 2026 published catalog terms; verify
          before bidding as houses adjust rates periodically and some apply tier-specific BP on ultra-high-end lots.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-5">
          <div className="text-xs uppercase tracking-wider text-orange-400 font-semibold mb-2">Rule of thumb</div>
          <p className="text-sm text-slate-300">
            On a 20% BP auction, your hammer ceiling is ~83% of your total budget.
            On 25% BP, it drops to ~80%. Add 8% sales tax and the ratios become 77% / 74% respectively.
          </p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-5">
          <div className="text-xs uppercase tracking-wider text-orange-400 font-semibold mb-2">BP vs hammer psychology</div>
          <p className="text-sm text-slate-300">
            Bidders anchor on hammer. BP is invisible in the moment. Set your max-hammer number BEFORE
            the lot opens — then do not exceed it even if the room is hot. The calculator gives you that number.
          </p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-5">
          <div className="text-xs uppercase tracking-wider text-orange-400 font-semibold mb-2">Cross-house arbitrage</div>
          <p className="text-sm text-slate-300">
            Same card at two houses? The 15% BP venue can be $400+ cheaper on a $5K hammer than the 25% venue.
            Liquid cards travel. Thin-comp cards stay.
          </p>
        </div>
      </div>
    </div>
  );
}
