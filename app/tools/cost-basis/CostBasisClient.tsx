'use client';

import { useEffect, useMemo, useState } from 'react';

const STATE_KEY = 'cv_cost_basis_v1';

type BasisAddition = {
  id: string;
  date: string;
  description: string;
  amount: number;
};

type Lot = {
  id: string;
  purchaseDate: string;
  quantity: number;
  pricePerUnit: number;
  acquisitionFees: number; // shipping + sales tax + other at-purchase fees
  additions: BasisAddition[]; // post-purchase basis additions (grading, auth, etc)
};

type State = {
  cardLabel: string;
  lots: Lot[];
  unitsToSell: number;
};

const DEFAULT_STATE: State = {
  cardLabel: '2003-04 Topps Chrome LeBron James RC #111 (PSA 9)',
  unitsToSell: 2,
  lots: [
    { id: 'l1', purchaseDate: '2020-06-10', quantity: 1, pricePerUnit: 1200, acquisitionFees: 15, additions: [{ id: 'a1', date: '2021-03-02', description: 'PSA regular grading', amount: 50 }] },
    { id: 'l2', purchaseDate: '2021-11-03', quantity: 2, pricePerUnit: 4500, acquisitionFees: 40, additions: [] },
    { id: 'l3', purchaseDate: '2023-08-22', quantity: 1, pricePerUnit: 8200, acquisitionFees: 25, additions: [{ id: 'a2', date: '2024-01-10', description: 'PSA crossover submission', amount: 85 }] },
  ],
};

function fmt(n: number): string {
  if (!isFinite(n)) return '—';
  return `$${Math.round(n * 100) / 100}`.replace(/\.00$/, '');
}
function fmtMoney(n: number): string {
  if (!isFinite(n)) return '—';
  return `$${Math.round(n).toLocaleString()}`;
}
function totalLotBasis(lot: Lot): number {
  const base = lot.quantity * lot.pricePerUnit + lot.acquisitionFees;
  const additions = lot.additions.reduce((s, a) => s + a.amount, 0);
  return base + additions;
}
function perUnitBasis(lot: Lot): number {
  if (lot.quantity <= 0) return 0;
  return totalLotBasis(lot) / lot.quantity;
}

type MethodResult = {
  name: string;
  basisForSold: number;
  basisPerUnit: number;
  remainingBasis: number;
  lotBreakdown: string;
  notes: string;
};

function computeWeightedAverage(lots: Lot[], unitsToSell: number): MethodResult {
  const totalUnits = lots.reduce((s, l) => s + l.quantity, 0);
  const totalBasis = lots.reduce((s, l) => s + totalLotBasis(l), 0);
  const perUnit = totalUnits > 0 ? totalBasis / totalUnits : 0;
  const sold = Math.min(unitsToSell, totalUnits);
  return {
    name: 'Weighted Average',
    basisForSold: perUnit * sold,
    basisPerUnit: perUnit,
    remainingBasis: perUnit * (totalUnits - sold),
    lotBreakdown: `All ${totalUnits} units assigned equal basis: ${fmt(perUnit)}/unit`,
    notes: 'Simplest to compute. Every unit has identical basis. Gives up tax-planning flexibility. Allowed for collectibles by election but rarely optimal.',
  };
}

function computeFIFO(lots: Lot[], unitsToSell: number): MethodResult {
  const sorted = [...lots].sort((a, b) => a.purchaseDate.localeCompare(b.purchaseDate));
  let remaining = unitsToSell;
  let basis = 0;
  const breakdown: string[] = [];
  for (const lot of sorted) {
    if (remaining <= 0) break;
    const take = Math.min(lot.quantity, remaining);
    const per = perUnitBasis(lot);
    basis += take * per;
    breakdown.push(`${take} × ${fmt(per)} (${lot.purchaseDate})`);
    remaining -= take;
  }
  const totalUnits = lots.reduce((s, l) => s + l.quantity, 0);
  const totalBasis = lots.reduce((s, l) => s + totalLotBasis(l), 0);
  const actuallySold = unitsToSell - remaining;
  return {
    name: 'FIFO (First-In, First-Out)',
    basisForSold: basis,
    basisPerUnit: actuallySold > 0 ? basis / actuallySold : 0,
    remainingBasis: totalBasis - basis,
    lotBreakdown: breakdown.join(' + '),
    notes: 'IRS default if no other method elected. Older lots (lower prices historically) sold first → higher taxes in rising market. But lots remaining are younger, qualifying for LTCG sooner from purchase date.',
  };
}

function computeLIFO(lots: Lot[], unitsToSell: number): MethodResult {
  const sorted = [...lots].sort((a, b) => b.purchaseDate.localeCompare(a.purchaseDate));
  let remaining = unitsToSell;
  let basis = 0;
  const breakdown: string[] = [];
  for (const lot of sorted) {
    if (remaining <= 0) break;
    const take = Math.min(lot.quantity, remaining);
    const per = perUnitBasis(lot);
    basis += take * per;
    breakdown.push(`${take} × ${fmt(per)} (${lot.purchaseDate})`);
    remaining -= take;
  }
  const totalUnits = lots.reduce((s, l) => s + l.quantity, 0);
  const totalBasis = lots.reduce((s, l) => s + totalLotBasis(l), 0);
  const actuallySold = unitsToSell - remaining;
  return {
    name: 'LIFO (Last-In, First-Out)',
    basisForSold: basis,
    basisPerUnit: actuallySold > 0 ? basis / actuallySold : 0,
    remainingBasis: totalBasis - basis,
    lotBreakdown: breakdown.join(' + '),
    notes: 'Generally NOT permitted for collectibles/securities by IRS. Shown for comparison only. Would assign highest-price recent lots to sales → lowest gain in rising market.',
  };
}

function computeSpecificID(lots: Lot[], unitsToSell: number, designatedLotIds: string[]): MethodResult {
  let remaining = unitsToSell;
  let basis = 0;
  const breakdown: string[] = [];
  for (const lotId of designatedLotIds) {
    if (remaining <= 0) break;
    const lot = lots.find(l => l.id === lotId);
    if (!lot) continue;
    const take = Math.min(lot.quantity, remaining);
    const per = perUnitBasis(lot);
    basis += take * per;
    breakdown.push(`${take} × ${fmt(per)} (${lot.purchaseDate})`);
    remaining -= take;
  }
  const totalUnits = lots.reduce((s, l) => s + l.quantity, 0);
  const totalBasis = lots.reduce((s, l) => s + totalLotBasis(l), 0);
  const actuallySold = unitsToSell - remaining;
  return {
    name: 'Specific Identification',
    basisForSold: basis,
    basisPerUnit: actuallySold > 0 ? basis / actuallySold : 0,
    remainingBasis: totalBasis - basis,
    lotBreakdown: breakdown.length > 0 ? breakdown.join(' + ') : 'Select lots below to designate',
    notes: 'Maximum tax flexibility. Designate WHICH specific units are sold at sale time. Allowed by IRS if you can document the physical unit. Best method for cards where each copy is trackable via cert number or photos.',
  };
}

export default function CostBasisClient() {
  const [state, setState] = useState<State>(DEFAULT_STATE);
  const [designatedLotIds, setDesignatedLotIds] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem(STATE_KEY);
      if (s) {
        const parsed = JSON.parse(s);
        setState({ ...DEFAULT_STATE, ...parsed, lots: Array.isArray(parsed.lots) ? parsed.lots : DEFAULT_STATE.lots });
      }
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem(STATE_KEY, JSON.stringify(state)); } catch {}
  }, [state]);

  const totalUnits = useMemo(() => state.lots.reduce((s, l) => s + l.quantity, 0), [state.lots]);
  const totalBasis = useMemo(() => state.lots.reduce((s, l) => s + totalLotBasis(l), 0), [state.lots]);

  const methods: MethodResult[] = useMemo(() => [
    computeWeightedAverage(state.lots, state.unitsToSell),
    computeFIFO(state.lots, state.unitsToSell),
    computeLIFO(state.lots, state.unitsToSell),
    computeSpecificID(state.lots, state.unitsToSell, designatedLotIds),
  ], [state.lots, state.unitsToSell, designatedLotIds]);

  function addLot() {
    const id = Math.random().toString(36).slice(2, 10);
    setState({
      ...state,
      lots: [...state.lots, { id, purchaseDate: new Date().toISOString().slice(0, 10), quantity: 1, pricePerUnit: 0, acquisitionFees: 0, additions: [] }],
    });
  }
  function removeLot(id: string) {
    setState({ ...state, lots: state.lots.filter(l => l.id !== id) });
    setDesignatedLotIds(prev => prev.filter(x => x !== id));
  }
  function updateLot(id: string, patch: Partial<Lot>) {
    setState({ ...state, lots: state.lots.map(l => l.id === id ? { ...l, ...patch } : l) });
  }
  function addAddition(lotId: string) {
    const aid = Math.random().toString(36).slice(2, 10);
    updateLot(lotId, { additions: [...(state.lots.find(l => l.id === lotId)?.additions || []), { id: aid, date: new Date().toISOString().slice(0, 10), description: '', amount: 0 }] });
  }
  function removeAddition(lotId: string, addId: string) {
    const lot = state.lots.find(l => l.id === lotId);
    if (!lot) return;
    updateLot(lotId, { additions: lot.additions.filter(a => a.id !== addId) });
  }
  function updateAddition(lotId: string, addId: string, patch: Partial<BasisAddition>) {
    const lot = state.lots.find(l => l.id === lotId);
    if (!lot) return;
    updateLot(lotId, { additions: lot.additions.map(a => a.id === addId ? { ...a, ...patch } : a) });
  }

  function toggleDesignated(lotId: string) {
    setDesignatedLotIds(prev => prev.includes(lotId) ? prev.filter(x => x !== lotId) : [...prev, lotId]);
  }

  async function handleCopy() {
    const lines: string[] = [
      `Cost Basis Report — ${state.cardLabel}`,
      `Total units owned: ${totalUnits}`,
      `Total basis: ${fmtMoney(totalBasis)}`,
      `Units to sell: ${state.unitsToSell}`,
      ``,
      `Per-method basis for the ${state.unitsToSell} units sold:`,
      ...methods.map(m => `  ${m.name}: ${fmtMoney(m.basisForSold)} (${fmt(m.basisPerUnit)}/unit)`),
      ``,
      `Lot detail:`,
      ...state.lots.map((l, i) => `  Lot ${i+1} (${l.purchaseDate}): ${l.quantity} × ${fmt(l.pricePerUnit)} + ${fmt(l.acquisitionFees)} fees + ${fmt(l.additions.reduce((s, a) => s + a.amount, 0))} additions = ${fmt(totalLotBasis(l))} total (${fmt(perUnitBasis(l))}/unit)`),
      ``,
      `via CardVault · https://cardvault-two.vercel.app/tools/cost-basis`,
    ];
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <div className="space-y-6">
      {/* Card label + units */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
        <label className="block">
          <div className="text-sm font-semibold text-slate-300 mb-1.5">Card identification</div>
          <input
            type="text"
            value={state.cardLabel}
            onChange={e => setState({ ...state, cardLabel: e.target.value })}
            className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:border-yellow-500"
            placeholder="Year, set, player, card number, grade"
          />
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">Total owned</div>
            <div className="text-2xl font-bold text-white">{totalUnits}</div>
            <div className="text-xs text-slate-500">units</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">Total basis</div>
            <div className="text-2xl font-bold text-yellow-300">{fmtMoney(totalBasis)}</div>
            <div className="text-xs text-slate-500">across all lots</div>
          </div>
          <label className="block">
            <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">Units to sell</div>
            <input
              type="number"
              value={state.unitsToSell}
              onChange={e => setState({ ...state, unitsToSell: Math.min(totalUnits, Math.max(0, parseInt(e.target.value) || 0)) })}
              min={0}
              max={totalUnits}
              className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-lg font-bold text-white focus:outline-none focus:border-yellow-500"
            />
          </label>
        </div>
      </div>

      {/* Lots */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="text-sm font-semibold text-white">Purchase lots ({state.lots.length})</div>
          <button onClick={addLot} className="text-xs px-3 py-1.5 rounded-md bg-yellow-600 hover:bg-yellow-500 text-slate-900 font-semibold transition">+ Add lot</button>
        </div>
        <div className="divide-y divide-slate-800">
          {state.lots.map((lot, idx) => (
            <div key={lot.id} className="p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-yellow-400">LOT {idx + 1}</span>
                  <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={designatedLotIds.includes(lot.id)}
                      onChange={() => toggleDesignated(lot.id)}
                      className="accent-yellow-500"
                    />
                    Designate for specific-ID sale
                  </label>
                </div>
                <button onClick={() => removeLot(lot.id)} className="text-xs text-slate-500 hover:text-red-400">✕ Remove lot</button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <label className="block">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Purchase date</div>
                  <input
                    type="date"
                    value={lot.purchaseDate}
                    onChange={e => updateLot(lot.id, { purchaseDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-md px-2 py-1.5 text-xs text-white focus:outline-none focus:border-yellow-500"
                  />
                </label>
                <label className="block">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Quantity</div>
                  <input
                    type="number"
                    value={lot.quantity}
                    onChange={e => updateLot(lot.id, { quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                    min={1}
                    className="w-full bg-slate-950 border border-slate-700 rounded-md px-2 py-1.5 text-xs text-white focus:outline-none focus:border-yellow-500"
                  />
                </label>
                <label className="block">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Price/unit</div>
                  <div className="relative">
                    <span className="absolute left-2 top-1.5 text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      value={lot.pricePerUnit}
                      onChange={e => updateLot(lot.id, { pricePerUnit: parseFloat(e.target.value) || 0 })}
                      min={0}
                      className="w-full bg-slate-950 border border-slate-700 rounded-md pl-5 pr-2 py-1.5 text-xs text-white focus:outline-none focus:border-yellow-500"
                    />
                  </div>
                </label>
                <label className="block">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Acquisition fees</div>
                  <div className="relative">
                    <span className="absolute left-2 top-1.5 text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      value={lot.acquisitionFees}
                      onChange={e => updateLot(lot.id, { acquisitionFees: parseFloat(e.target.value) || 0 })}
                      min={0}
                      className="w-full bg-slate-950 border border-slate-700 rounded-md pl-5 pr-2 py-1.5 text-xs text-white focus:outline-none focus:border-yellow-500"
                    />
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">shipping + sales tax</div>
                </label>
              </div>

              {/* Basis additions */}
              <div className="pl-3 border-l-2 border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Basis additions (grading, auth, etc.)</div>
                  <button onClick={() => addAddition(lot.id)} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300">+ Add</button>
                </div>
                {lot.additions.length === 0 && <div className="text-xs text-slate-600 italic">No basis additions.</div>}
                {lot.additions.map(add => (
                  <div key={add.id} className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-1.5 items-center">
                    <input
                      type="date"
                      value={add.date}
                      onChange={e => updateAddition(lot.id, add.id, { date: e.target.value })}
                      className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                    />
                    <input
                      type="text"
                      value={add.description}
                      onChange={e => updateAddition(lot.id, add.id, { description: e.target.value })}
                      placeholder="PSA grading"
                      className="sm:col-span-2 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                    />
                    <div className="flex items-center gap-1">
                      <div className="relative flex-1">
                        <span className="absolute left-2 top-1 text-slate-400 text-xs">$</span>
                        <input
                          type="number"
                          value={add.amount}
                          onChange={e => updateAddition(lot.id, add.id, { amount: parseFloat(e.target.value) || 0 })}
                          min={0}
                          className="w-full bg-slate-950 border border-slate-700 rounded pl-5 pr-2 py-1 text-xs text-white"
                        />
                      </div>
                      <button onClick={() => removeAddition(lot.id, add.id)} className="text-xs text-slate-500 hover:text-red-400 px-1">✕</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Lot summary */}
              <div className="bg-slate-950/60 rounded-md p-2 text-xs flex items-center justify-between">
                <span className="text-slate-500">Lot {idx + 1} total basis</span>
                <span className="font-mono text-yellow-300">{fmtMoney(totalLotBasis(lot))} ({fmt(perUnitBasis(lot))}/unit)</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Method comparison */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800">
          <div className="text-sm font-semibold text-white">Side-by-side method comparison</div>
          <div className="text-xs text-slate-500">Cost basis for the {state.unitsToSell} units sold under each IRS-recognized method.</div>
        </div>
        <div className="divide-y divide-slate-800">
          {methods.map(m => (
            <div key={m.name} className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                <h3 className="text-base font-bold text-white">{m.name}</h3>
                <div className="text-right">
                  <div className="text-xs text-slate-500">Basis for sold units</div>
                  <div className="text-xl font-mono font-bold text-yellow-300">{fmtMoney(m.basisForSold)}</div>
                  <div className="text-xs text-slate-500">{fmt(m.basisPerUnit)}/unit avg</div>
                </div>
              </div>
              <div className="text-xs text-slate-400 mb-1.5">
                <span className="text-slate-500 uppercase tracking-wider text-[10px] mr-2">Breakdown:</span>
                {m.lotBreakdown || '(none)'}
              </div>
              <div className="text-xs text-slate-500 mb-1.5">
                <span className="text-slate-500 uppercase tracking-wider text-[10px] mr-2">Remaining basis:</span>
                {fmtMoney(m.remainingBasis)} on {totalUnits - Math.min(state.unitsToSell, totalUnits)} remaining units
              </div>
              <div className="text-xs text-slate-400 italic leading-relaxed">{m.notes}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Copy */}
      {state.lots.length > 0 && (
        <div className="flex justify-center">
          <button
            onClick={handleCopy}
            className="bg-yellow-600 hover:bg-yellow-500 text-slate-900 font-semibold px-6 py-2.5 rounded-lg transition"
          >
            {copied ? '✓ Copied report' : 'Copy cost-basis report'}
          </button>
        </div>
      )}
    </div>
  );
}
