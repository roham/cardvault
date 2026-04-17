'use client';

import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'cv_psa_tier_picker_v1';

type PsaTier = {
  id: string;
  name: string;
  fee: number;
  turnaroundDays: number;
  maxDeclaredValue: number | null;
  notes: string;
};

// PSA 2026 service-tier fees (approximate; public schedule)
const PSA_TIERS: PsaTier[] = [
  { id: 'bulk',         name: 'Bulk',             fee: 19,    turnaroundDays: 65, maxDeclaredValue: 499,    notes: '20-card minimum, shared queue' },
  { id: 'value',        name: 'Value',            fee: 25,    turnaroundDays: 45, maxDeclaredValue: 499,    notes: 'Standard entry, widest usage' },
  { id: 'value-plus',   name: 'Value Plus',       fee: 40,    turnaroundDays: 30, maxDeclaredValue: 499,    notes: 'Slightly faster Value' },
  { id: 'regular',      name: 'Regular',          fee: 75,    turnaroundDays: 20, maxDeclaredValue: 1499,   notes: 'Mid-value workhorse' },
  { id: 'express',      name: 'Express',          fee: 150,   turnaroundDays: 10, maxDeclaredValue: 2499,   notes: 'Fast turnaround, mid-high value' },
  { id: 'super-express', name: 'Super Express',   fee: 300,   turnaroundDays: 5,  maxDeclaredValue: 4999,   notes: 'Major flip cards' },
  { id: 'walkthrough',  name: 'Walkthrough',      fee: 600,   turnaroundDays: 3,  maxDeclaredValue: 9999,   notes: 'High-end flip window' },
  { id: 'walkthrough-plus', name: 'Walkthrough+', fee: 1000,  turnaroundDays: 2,  maxDeclaredValue: 24999,  notes: 'Grail-adjacent speed' },
  { id: 'premier',      name: 'Premier',          fee: 5000,  turnaroundDays: 2,  maxDeclaredValue: 99999,  notes: 'Grail-tier, $25K-$99K declared' },
  { id: 'super-premier', name: 'SuperPremier',    fee: 10000, turnaroundDays: 2,  maxDeclaredValue: null,   notes: 'Six-figure+ declared value' },
];

type Form = {
  rawValue: string;
  val10: string;
  val9: string;
  val8: string;
  p10: string;
  p9: string;
  p8: string;
  // anything below 8 goes to raw value
  capitalCost: string;
  shipping: string;
  mode: 'now' | 'flat' | 'rising' | 'falling';
  sortBy: 'net' | 'fee' | 'turnaround';
  hideUnavailable: boolean;
};

const DEFAULT: Form = {
  rawValue: '300',
  val10: '1200',
  val9: '500',
  val8: '220',
  p10: '30',
  p9: '45',
  p8: '20',
  capitalCost: '15',
  shipping: '25',
  mode: 'flat',
  sortBy: 'net',
  hideUnavailable: false,
};

function money(n: number): string {
  if (!isFinite(n)) return '—';
  const s = Math.abs(n).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  return n < 0 ? '-' + s : s;
}
function fmtShort(n: number): string {
  if (!isFinite(n)) return '—';
  if (Math.abs(n) >= 1000) return (n >= 0 ? '' : '-') + '$' + (Math.abs(n) / 1000).toFixed(1) + 'K';
  return money(n);
}

export default function PsaTierPickerClient() {
  const [form, setForm] = useState<Form>(DEFAULT);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) setForm((f) => ({ ...f, ...JSON.parse(raw) })); } catch {}
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(form)); } catch {}
  }, [form, hydrated]);

  function upd<K extends keyof Form>(k: K, v: Form[K]) { setForm((f) => ({ ...f, [k]: v })); }

  const n = {
    raw: parseFloat(form.rawValue) || 0,
    v10: parseFloat(form.val10) || 0,
    v9: parseFloat(form.val9) || 0,
    v8: parseFloat(form.val8) || 0,
    p10: (parseFloat(form.p10) || 0) / 100,
    p9: (parseFloat(form.p9) || 0) / 100,
    p8: (parseFloat(form.p8) || 0) / 100,
    cap: (parseFloat(form.capitalCost) || 0) / 100,
    ship: parseFloat(form.shipping) || 0,
  };

  const probSum = n.p10 + n.p9 + n.p8;
  const pBelow = Math.max(0, 1 - probSum);

  const expectedGradedValue = n.p10 * n.v10 + n.p9 * n.v9 + n.p8 * n.v8 + pBelow * n.raw;

  const marketDrift = form.mode === 'rising' ? 0.15 : form.mode === 'falling' ? -0.15 : 0;

  const rows = useMemo(() => {
    return PSA_TIERS.map((t) => {
      const available = t.maxDeclaredValue === null || n.raw <= t.maxDeclaredValue;
      const years = t.turnaroundDays / 365;
      const opportunityCost = n.raw * n.cap * years;
      const driftEffect = expectedGradedValue * marketDrift * years;
      const driftAdjusted = expectedGradedValue + driftEffect;
      const netProfit = driftAdjusted - n.raw - t.fee - n.ship - opportunityCost;
      const roi = n.raw > 0 ? (netProfit / (n.raw + t.fee + n.ship)) * 100 : 0;
      return { tier: t, available, netProfit, opportunityCost, driftAdjusted, roi };
    });
  }, [n.raw, n.cap, expectedGradedValue, marketDrift, n.ship]);

  const visibleRows = useMemo(() => {
    const arr = form.hideUnavailable ? rows.filter((r) => r.available) : rows;
    if (form.sortBy === 'net') return [...arr].sort((a, b) => (b.available ? b.netProfit : -1e9) - (a.available ? a.netProfit : -1e9));
    if (form.sortBy === 'fee') return [...arr].sort((a, b) => a.tier.fee - b.tier.fee);
    return [...arr].sort((a, b) => a.tier.turnaroundDays - b.tier.turnaroundDays);
  }, [rows, form.sortBy, form.hideUnavailable]);

  const winner = useMemo(() => {
    const avail = rows.filter((r) => r.available);
    if (!avail.length) return null;
    return [...avail].sort((a, b) => b.netProfit - a.netProfit)[0];
  }, [rows]);

  const probsSumPercent = Math.round(probSum * 100 + pBelow * 100);

  function reset() {
    if (!window.confirm('Reset to defaults?')) return;
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setForm(DEFAULT);
  }

  if (!hydrated) return <div className="rounded-2xl bg-slate-900/40 border border-slate-800 p-8 text-center text-gray-500 text-sm">Loading&hellip;</div>;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-5">
        <Sec title="1. Card value">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Fld label="Raw value (current)">
              <input type="number" inputMode="decimal" value={form.rawValue} onChange={(e) => upd('rawValue', e.target.value)} className={inp} />
            </Fld>
            <Fld label="Return shipping + insurance">
              <input type="number" inputMode="decimal" value={form.shipping} onChange={(e) => upd('shipping', e.target.value)} className={inp} />
            </Fld>
          </div>
        </Sec>

        <Sec title="2. Graded values">
          <div className="grid grid-cols-3 gap-3">
            <Fld label="PSA 10"><input type="number" inputMode="decimal" value={form.val10} onChange={(e) => upd('val10', e.target.value)} className={inp} /></Fld>
            <Fld label="PSA 9"><input type="number" inputMode="decimal" value={form.val9} onChange={(e) => upd('val9', e.target.value)} className={inp} /></Fld>
            <Fld label="PSA 8"><input type="number" inputMode="decimal" value={form.val8} onChange={(e) => upd('val8', e.target.value)} className={inp} /></Fld>
          </div>
          <div className="mt-1 text-[11px] text-gray-500">Anything PSA 7 or below is treated as equivalent to raw value.</div>
        </Sec>

        <Sec title="3. Grade probability">
          <div className="grid grid-cols-3 gap-3">
            <Fld label="P(10) %"><input type="number" inputMode="decimal" value={form.p10} onChange={(e) => upd('p10', e.target.value)} className={inp} /></Fld>
            <Fld label="P(9) %"><input type="number" inputMode="decimal" value={form.p9} onChange={(e) => upd('p9', e.target.value)} className={inp} /></Fld>
            <Fld label="P(8) %"><input type="number" inputMode="decimal" value={form.p8} onChange={(e) => upd('p8', e.target.value)} className={inp} /></Fld>
          </div>
          <div className={`mt-2 text-xs ${probsSumPercent > 100 || probsSumPercent < 50 ? 'text-amber-300' : 'text-gray-400'}`}>
            Sum: {(probSum * 100).toFixed(0)}% specified + {(pBelow * 100).toFixed(0)}% PSA 7 or below {probsSumPercent === 100 ? '✓' : '(should sum to 100%)'}
          </div>
        </Sec>

        <Sec title="4. Market + capital">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Fld label="Capital cost (annualized %)">
              <input type="number" inputMode="decimal" value={form.capitalCost} onChange={(e) => upd('capitalCost', e.target.value)} className={inp} />
            </Fld>
            <Fld label="Market trajectory">
              <select value={form.mode} onChange={(e) => upd('mode', e.target.value as Form['mode'])} className={inp}>
                <option value="flat">Flat</option>
                <option value="rising">Rising (+15% annualized)</option>
                <option value="falling">Falling (-15% annualized)</option>
                <option value="now">Sell on return (0 drift)</option>
              </select>
            </Fld>
          </div>
        </Sec>

        <Sec title="5. Display">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
            <Fld label="Sort tiers by">
              <select value={form.sortBy} onChange={(e) => upd('sortBy', e.target.value as Form['sortBy'])} className={inp}>
                <option value="net">Net profit (best first)</option>
                <option value="fee">Fee (cheapest first)</option>
                <option value="turnaround">Turnaround (fastest first)</option>
              </select>
            </Fld>
            <label className="flex items-center gap-2 text-sm text-gray-300 mt-1">
              <input type="checkbox" checked={form.hideUnavailable} onChange={(e) => upd('hideUnavailable', e.target.checked)} className="accent-sky-500" />
              <span>Hide tiers unavailable for this card value</span>
            </label>
          </div>
          <button onClick={reset} className="mt-3 px-3 py-1.5 rounded-lg bg-transparent hover:bg-slate-800 text-gray-400 hover:text-gray-200 font-medium text-xs">Reset</button>
        </Sec>
      </div>

      <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        {winner && (
          <div className="rounded-2xl bg-gradient-to-br from-sky-900/40 via-sky-800/30 to-blue-900/30 border border-sky-700/50 p-5">
            <div className="text-[11px] font-semibold text-sky-300 uppercase tracking-wider">Recommended tier</div>
            <div className="text-2xl font-black text-white mt-1">{winner.tier.name}</div>
            <div className="text-xs text-sky-200 mt-1">{winner.tier.notes}</div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
              <div className="rounded-lg bg-slate-900/60 p-2">
                <div className="text-gray-500">Fee</div>
                <div className="text-white font-semibold">{money(winner.tier.fee)}</div>
              </div>
              <div className="rounded-lg bg-slate-900/60 p-2">
                <div className="text-gray-500">Turnaround</div>
                <div className="text-white font-semibold">{winner.tier.turnaroundDays}d</div>
              </div>
              <div className="rounded-lg bg-slate-900/60 p-2">
                <div className="text-gray-500">Net profit</div>
                <div className={`font-semibold ${winner.netProfit >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>{fmtShort(winner.netProfit)}</div>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-sky-300">All PSA tiers</h3>
            <div className="text-[11px] text-gray-500">EV graded: {money(expectedGradedValue)}</div>
          </div>
          <div className="space-y-1.5">
            {visibleRows.map((r) => {
              const isWinner = winner && r.tier.id === winner.tier.id && r.available;
              return (
                <div
                  key={r.tier.id}
                  className={`rounded-lg p-3 border text-xs flex items-center gap-3 ${
                    !r.available
                      ? 'bg-slate-900/30 border-slate-800/60 text-gray-500'
                      : isWinner
                      ? 'bg-sky-950/40 border-sky-700/60 text-white'
                      : 'bg-slate-900/60 border-slate-700/40 text-gray-300'
                  }`}
                >
                  <div className="w-28 shrink-0">
                    <div className={`font-semibold ${isWinner ? 'text-sky-200' : 'text-white'}`}>{r.tier.name}</div>
                    <div className="text-[10px] text-gray-500">{r.tier.turnaroundDays}d · {money(r.tier.fee)}</div>
                  </div>
                  <div className="flex-1 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-[10px] text-gray-500">Opp cost</div>
                      <div className={`font-mono ${r.available ? 'text-amber-300' : ''}`}>{r.available ? fmtShort(-r.opportunityCost) : '—'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-500">ROI</div>
                      <div className={`font-mono ${r.available ? (r.roi >= 0 ? 'text-emerald-300' : 'text-red-300') : ''}`}>{r.available ? `${r.roi.toFixed(0)}%` : '—'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-500">Net</div>
                      <div className={`font-mono font-semibold ${r.available ? (r.netProfit >= 0 ? 'text-emerald-300' : 'text-red-300') : ''}`}>{r.available ? fmtShort(r.netProfit) : 'over cap'}</div>
                    </div>
                  </div>
                  {isWinner && <div className="shrink-0 text-lg">🏆</div>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg bg-slate-900/40 border border-slate-800 p-3 text-[11px] text-gray-500 space-y-1">
          <div>Net profit = expected graded value (after drift) − raw value − tier fee − return shipping − capital opportunity cost over turnaround.</div>
          <div>Expected graded value = P(10) × val10 + P(9) × val9 + P(8) × val8 + P(≤7) × raw value.</div>
          <div>Opportunity cost = raw value × capital cost × (turnaround days / 365).</div>
        </div>
      </div>
    </div>
  );
}

function Sec({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4"><h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-sky-300">{title}</h3>{children}</section>;
}
function Fld({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><div className="text-[11px] font-semibold text-gray-400 mb-1 uppercase tracking-wider">{label}</div>{children}</label>;
}
const inp = 'w-full rounded-lg bg-slate-950 border border-slate-700 text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500';
