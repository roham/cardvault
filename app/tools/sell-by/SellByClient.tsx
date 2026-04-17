'use client';

import { useEffect, useMemo, useState } from 'react';

const STATE_KEY = 'cv_sell_by_v1';

type Lot = {
  id: string;
  cardName: string;
  purchaseDate: string; // ISO YYYY-MM-DD
  costBasis: number;
  currentValue: number;
};

type OrdinaryBand = 'low' | 'mid' | 'high' | 'top';

type State = {
  lots: Lot[];
  ordinaryBand: OrdinaryBand;
  asOfDate: string; // ISO — allow "what if" testing
};

const ORDINARY_BANDS: Record<OrdinaryBand, { label: string; rate: number; desc: string }> = {
  low:  { label: '12% bracket',  rate: 0.12, desc: '~$12K-$48K single / $24K-$96K joint' },
  mid:  { label: '22% bracket',  rate: 0.22, desc: '~$48K-$103K single / $96K-$207K joint' },
  high: { label: '32% bracket',  rate: 0.32, desc: '~$197K-$250K single / $394K-$501K joint' },
  top:  { label: '37% bracket',  rate: 0.37, desc: '>$626K single / >$752K joint' },
};

const COLLECTIBLES_LTCG_CAP = 0.28;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}
function daysBetween(a: string, b: string): number {
  const da = new Date(a + 'T00:00:00Z').getTime();
  const db = new Date(b + 'T00:00:00Z').getTime();
  return Math.round((db - da) / (1000 * 60 * 60 * 24));
}
function addYear(iso: string, years: number): string {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCFullYear(d.getUTCFullYear() + years);
  return d.toISOString().slice(0, 10);
}
function addDays(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
function yearEnd(iso: string): string {
  const y = new Date(iso + 'T00:00:00Z').getUTCFullYear();
  return `${y}-12-31`;
}
function fmt(n: number): string {
  if (!isFinite(n)) return '—';
  return `$${Math.round(n).toLocaleString()}`;
}
function fmtDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00Z');
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
}

const STARTER_LOTS: Lot[] = [
  { id: 'a', cardName: '2003-04 Topps Chrome LeBron James RC #111 (PSA 9)', purchaseDate: '2025-06-12', costBasis: 8200, currentValue: 12500 },
  { id: 'b', cardName: '2018 Topps Chrome Update Shohei Ohtani RC #HMT1 (Raw)', purchaseDate: '2025-11-03', costBasis: 160, currentValue: 85 },
  { id: 'c', cardName: '1986 Fleer Michael Jordan RC #57 (PSA 8)', purchaseDate: '2023-08-20', costBasis: 4100, currentValue: 6800 },
];

function computeLot(lot: Lot, asOf: string, ordinaryRate: number) {
  // Holding period starts day AFTER acquisition; LTCG qualifies on day exactly 1 year later.
  const holdingStart = addDays(lot.purchaseDate, 1);
  const crossoverDate = addYear(holdingStart, 1);
  const daysHeld = Math.max(0, daysBetween(lot.purchaseDate, asOf));
  const daysToCrossover = daysBetween(asOf, crossoverDate); // negative if already crossed
  const isLongTerm = daysToCrossover <= 0;

  const gain = lot.currentValue - lot.costBasis;
  const gainPct = lot.costBasis > 0 ? (gain / lot.costBasis) * 100 : 0;
  const isLoss = gain < 0;

  // Tax liability under each scenario
  const shortTermTax = Math.max(0, gain) * ordinaryRate;
  const collectiblesRate = Math.min(ordinaryRate, COLLECTIBLES_LTCG_CAP);
  const longTermTax = Math.max(0, gain) * collectiblesRate;
  const taxSavingsFromWaiting = shortTermTax - longTermTax;

  // Year-end loss harvest deadline (same tax year as asOf)
  const yearEndDate = yearEnd(asOf);
  const daysToYearEnd = Math.max(0, daysBetween(asOf, yearEndDate));

  // Verdict
  let verdict: 'hold-ltcg' | 'wait-crossover' | 'harvest-loss' | 'sell-anytime' | 'hold-appreciating';
  let verdictLabel: string;
  let verdictColor: string;
  let verdictReason: string;

  if (isLoss && daysToYearEnd <= 60) {
    verdict = 'harvest-loss';
    verdictLabel = 'HARVEST LOSS';
    verdictColor = 'bg-red-900/60 text-red-200 border-red-700/60';
    verdictReason = `Hold at paper loss of ${fmt(Math.abs(gain))}. Year-end is ${daysToYearEnd} day${daysToYearEnd === 1 ? '' : 's'} away. Sell before Dec 31 to realize loss + offset other gains this tax year.`;
  } else if (!isLongTerm && daysToCrossover <= 60 && gain > 0 && taxSavingsFromWaiting > 20) {
    verdict = 'wait-crossover';
    verdictLabel = 'WAIT FOR LTCG';
    verdictColor = 'bg-amber-900/60 text-amber-200 border-amber-700/60';
    verdictReason = `${daysToCrossover} day${daysToCrossover === 1 ? '' : 's'} until long-term crossover on ${fmtDate(crossoverDate)}. Waiting saves ≈${fmt(taxSavingsFromWaiting)} in tax (${((ordinaryRate - collectiblesRate) * 100).toFixed(1)} pt differential).`;
  } else if (isLongTerm && gain > 0) {
    verdict = 'hold-ltcg';
    verdictLabel = 'LTCG QUALIFIED';
    verdictColor = 'bg-emerald-900/60 text-emerald-200 border-emerald-700/60';
    verdictReason = `Already past 12-month mark (crossed ${fmtDate(crossoverDate)}). Sell anytime at long-term rate (${(collectiblesRate * 100).toFixed(0)}% max). No tax-timing urgency — sell when the price is right.`;
  } else if (!isLongTerm && gain > 0 && daysToCrossover > 60) {
    verdict = 'hold-appreciating';
    verdictLabel = 'HOLD';
    verdictColor = 'bg-slate-800/60 text-slate-200 border-slate-600';
    verdictReason = `${daysToCrossover} days until long-term. Too far out for LTCG to dominate the decision — hold based on market thesis, not tax timing.`;
  } else {
    verdict = 'sell-anytime';
    verdictLabel = 'NO URGENCY';
    verdictColor = 'bg-slate-800/60 text-slate-300 border-slate-700';
    verdictReason = 'No tax-timing trigger. Sell when the market gives you the price you want.';
  }

  // Urgency score: higher = more urgent action
  let urgency = 0;
  if (verdict === 'harvest-loss') urgency = 1000 - daysToYearEnd;
  else if (verdict === 'wait-crossover') urgency = 800 - daysToCrossover;
  else if (verdict === 'hold-ltcg') urgency = 300;
  else if (verdict === 'hold-appreciating') urgency = 100;
  else urgency = 50;

  return {
    holdingStart, crossoverDate, daysHeld, daysToCrossover, isLongTerm,
    gain, gainPct, isLoss,
    shortTermTax, longTermTax, taxSavingsFromWaiting, collectiblesRate,
    yearEndDate, daysToYearEnd,
    verdict, verdictLabel, verdictColor, verdictReason, urgency,
  };
}

export default function SellByClient() {
  const [state, setState] = useState<State>({ lots: STARTER_LOTS, ordinaryBand: 'mid', asOfDate: today() });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem(STATE_KEY);
      if (s) {
        const parsed = JSON.parse(s);
        setState({
          lots: Array.isArray(parsed.lots) ? parsed.lots : STARTER_LOTS,
          ordinaryBand: parsed.ordinaryBand ?? 'mid',
          asOfDate: parsed.asOfDate ?? today(),
        });
      }
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem(STATE_KEY, JSON.stringify(state)); } catch {}
  }, [state]);

  const ordinaryRate = ORDINARY_BANDS[state.ordinaryBand].rate;

  const rows = useMemo(() => {
    return state.lots
      .map(lot => ({ lot, calc: computeLot(lot, state.asOfDate, ordinaryRate) }))
      .sort((a, b) => b.calc.urgency - a.calc.urgency);
  }, [state.lots, state.asOfDate, ordinaryRate]);

  const portfolio = useMemo(() => {
    const totalCost = state.lots.reduce((s, l) => s + l.costBasis, 0);
    const totalValue = state.lots.reduce((s, l) => s + l.currentValue, 0);
    const totalGain = totalValue - totalCost;
    const unrealizedLosses = rows.filter(r => r.calc.isLoss).reduce((s, r) => s + r.calc.gain, 0);
    const potentialLtcgSavings = rows
      .filter(r => !r.calc.isLongTerm && r.calc.gain > 0)
      .reduce((s, r) => s + r.calc.taxSavingsFromWaiting, 0);
    return { totalCost, totalValue, totalGain, unrealizedLosses, potentialLtcgSavings, count: state.lots.length };
  }, [state.lots, rows]);

  function addLot() {
    const id = Math.random().toString(36).slice(2, 10);
    setState({
      ...state,
      lots: [...state.lots, { id, cardName: '', purchaseDate: today(), costBasis: 0, currentValue: 0 }],
    });
  }
  function removeLot(id: string) {
    setState({ ...state, lots: state.lots.filter(l => l.id !== id) });
  }
  function updateLot(id: string, patch: Partial<Lot>) {
    setState({ ...state, lots: state.lots.map(l => l.id === id ? { ...l, ...patch } : l) });
  }
  function resetLots() {
    if (!confirm('Replace all cards with the sample starter set?')) return;
    setState({ ...state, lots: STARTER_LOTS });
  }
  function clearAll() {
    if (!confirm('Remove all cards? This cannot be undone.')) return;
    setState({ ...state, lots: [] });
  }

  async function handleCopy() {
    const lines = [
      `Sell-By Date Tracker — ${fmtDate(state.asOfDate)}`,
      `Portfolio: ${portfolio.count} card${portfolio.count === 1 ? '' : 's'} · cost ${fmt(portfolio.totalCost)} · value ${fmt(portfolio.totalValue)} · unrealized ${portfolio.totalGain >= 0 ? '+' : ''}${fmt(portfolio.totalGain)}`,
      `Tax band: ${ORDINARY_BANDS[state.ordinaryBand].label} ordinary / ${(Math.min(ordinaryRate, COLLECTIBLES_LTCG_CAP) * 100).toFixed(0)}% LTCG cap`,
      ``,
      `Priority queue (urgent → calm):`,
      ...rows.map((r, i) => {
        const c = r.calc;
        return `${i + 1}. [${c.verdictLabel}] ${r.lot.cardName || '(unnamed)'} · bought ${fmtDate(r.lot.purchaseDate)} · gain ${c.gain >= 0 ? '+' : ''}${fmt(c.gain)} (${c.gainPct >= 0 ? '+' : ''}${c.gainPct.toFixed(1)}%) · ${c.isLongTerm ? 'LTCG qualified' : `LTCG in ${c.daysToCrossover}d on ${fmtDate(c.crossoverDate)}`}`;
      }),
      ``,
      `via CardVault · https://cardvault-two.vercel.app/tools/sell-by`,
    ];
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block">
            <div className="text-sm font-semibold text-slate-300 mb-1.5">As-of date</div>
            <input
              type="date"
              value={state.asOfDate}
              onChange={e => setState({ ...state, asOfDate: e.target.value || today() })}
              className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:border-lime-500"
            />
            <div className="text-xs text-slate-500 mt-1">Change this to run "what if I sold on this date?" analysis.</div>
          </label>
          <div>
            <div className="text-sm font-semibold text-slate-300 mb-1.5">Your ordinary-income tax bracket</div>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(ORDINARY_BANDS) as OrdinaryBand[]).map(b => {
                const bd = ORDINARY_BANDS[b];
                return (
                  <button
                    key={b}
                    onClick={() => setState({ ...state, ordinaryBand: b })}
                    className={`text-left px-3 py-1.5 rounded-md border text-xs transition ${
                      state.ordinaryBand === b
                        ? 'bg-lime-600 border-lime-500 text-white'
                        : 'bg-slate-950 border-slate-700 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <div className="font-semibold">{bd.label}</div>
                    <div className={`text-[10px] mt-0.5 ${state.ordinaryBand === b ? 'text-lime-100' : 'text-slate-500'}`}>{bd.desc}</div>
                  </button>
                );
              })}
            </div>
            <div className="text-xs text-slate-500 mt-2">Used to compute short-term tax liability and LTCG savings differential.</div>
          </div>
        </div>
      </div>

      {/* Portfolio summary */}
      <div className="bg-gradient-to-br from-lime-950/60 to-lime-900/30 border border-lime-700/50 rounded-xl p-6">
        <div className="text-xs uppercase tracking-wider text-lime-300 font-semibold mb-4">Portfolio summary</div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div>
            <div className="text-xs text-slate-400 mb-1">Lots tracked</div>
            <div className="text-2xl font-bold text-white">{portfolio.count}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1">Total cost</div>
            <div className="text-2xl font-bold text-white">{fmt(portfolio.totalCost)}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1">Current value</div>
            <div className="text-2xl font-bold text-white">{fmt(portfolio.totalValue)}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1">Unrealized</div>
            <div className={`text-2xl font-bold ${portfolio.totalGain >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
              {portfolio.totalGain >= 0 ? '+' : ''}{fmt(portfolio.totalGain)}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1">LTCG waiting-tax saved</div>
            <div className="text-2xl font-bold text-lime-300">{fmt(portfolio.potentialLtcgSavings)}</div>
            <div className="text-[10px] text-slate-500">if all short-term lots wait for crossover</div>
          </div>
        </div>
      </div>

      {/* Lots table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between gap-2 flex-wrap">
          <div>
            <div className="text-sm font-semibold text-white">Priority queue</div>
            <div className="text-xs text-slate-500">Sorted by tax-action urgency.</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={addLot} className="text-xs px-3 py-1.5 rounded-md bg-lime-600 hover:bg-lime-500 text-white font-semibold transition">+ Add card</button>
            <button onClick={resetLots} className="text-xs px-3 py-1.5 rounded-md bg-slate-700 hover:bg-slate-600 text-white transition">Reset sample</button>
            <button onClick={clearAll} className="text-xs px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition">Clear all</button>
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="p-10 text-center text-slate-500 text-sm">
            No cards tracked. Click <strong className="text-lime-400">+ Add card</strong> above to start, or <button onClick={resetLots} className="underline text-lime-300 hover:text-lime-200">load the sample set</button>.
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {rows.map(({ lot, calc }) => (
              <div key={lot.id} className="p-4 sm:p-5 space-y-3">
                <div className="flex items-start gap-3 flex-wrap">
                  <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded border ${calc.verdictColor}`}>
                    {calc.verdictLabel}
                  </span>
                  <input
                    type="text"
                    value={lot.cardName}
                    onChange={e => updateLot(lot.id, { cardName: e.target.value })}
                    placeholder="Card name + set + grade (e.g. '2003-04 Topps Chrome LeBron #111 PSA 9')"
                    className="flex-1 min-w-[240px] bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:border-lime-500"
                  />
                  <button onClick={() => removeLot(lot.id)} className="text-xs text-slate-500 hover:text-red-400 transition px-2 py-1" aria-label="Remove card">✕ Remove</button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <label className="block">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Purchase date</div>
                    <input
                      type="date"
                      value={lot.purchaseDate}
                      onChange={e => updateLot(lot.id, { purchaseDate: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-md px-2 py-1.5 text-xs text-white focus:outline-none focus:border-lime-500"
                    />
                  </label>
                  <label className="block">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Cost basis</div>
                    <div className="relative">
                      <span className="absolute left-2 top-1.5 text-slate-400 text-xs">$</span>
                      <input
                        type="number"
                        value={lot.costBasis}
                        onChange={e => updateLot(lot.id, { costBasis: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-md pl-5 pr-2 py-1.5 text-xs text-white focus:outline-none focus:border-lime-500"
                        min={0}
                      />
                    </div>
                  </label>
                  <label className="block">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Current value</div>
                    <div className="relative">
                      <span className="absolute left-2 top-1.5 text-slate-400 text-xs">$</span>
                      <input
                        type="number"
                        value={lot.currentValue}
                        onChange={e => updateLot(lot.id, { currentValue: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-md pl-5 pr-2 py-1.5 text-xs text-white focus:outline-none focus:border-lime-500"
                        min={0}
                      />
                    </div>
                  </label>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Unrealized</div>
                    <div className={`text-sm font-mono font-bold ${calc.gain >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                      {calc.gain >= 0 ? '+' : ''}{fmt(calc.gain)}
                    </div>
                    <div className={`text-[10px] ${calc.gain >= 0 ? 'text-emerald-400/70' : 'text-red-400/70'}`}>
                      {calc.gainPct >= 0 ? '+' : ''}{calc.gainPct.toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-950/60 rounded-md p-3">
                  <div>
                    <div className="text-slate-500">Days held</div>
                    <div className="font-mono text-white">{calc.daysHeld}d</div>
                  </div>
                  <div>
                    <div className="text-slate-500">LTCG crossover</div>
                    <div className="font-mono text-white">{fmtDate(calc.crossoverDate)}</div>
                    <div className={`text-[10px] ${calc.isLongTerm ? 'text-emerald-400' : calc.daysToCrossover <= 60 ? 'text-amber-400' : 'text-slate-500'}`}>
                      {calc.isLongTerm ? `✓ qualified ${-calc.daysToCrossover}d ago` : `in ${calc.daysToCrossover}d`}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">Short-term tax</div>
                    <div className="font-mono text-white">{fmt(calc.shortTermTax)}</div>
                    <div className="text-[10px] text-slate-500">at {(ordinaryRate * 100).toFixed(0)}%</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Long-term tax</div>
                    <div className="font-mono text-white">{fmt(calc.longTermTax)}</div>
                    <div className="text-[10px] text-slate-500">at {(calc.collectiblesRate * 100).toFixed(0)}% {calc.collectiblesRate === COLLECTIBLES_LTCG_CAP && calc.gain > 0 ? '(collectibles cap)' : ''}</div>
                  </div>
                </div>

                <div className="text-sm text-slate-300 leading-relaxed">
                  {calc.verdictReason}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Copy */}
      {rows.length > 0 && (
        <div className="flex justify-center">
          <button
            onClick={handleCopy}
            className="bg-lime-600 hover:bg-lime-500 text-white font-semibold px-6 py-2.5 rounded-lg transition"
          >
            {copied ? '✓ Copied portfolio report' : 'Copy portfolio report'}
          </button>
        </div>
      )}
    </div>
  );
}
