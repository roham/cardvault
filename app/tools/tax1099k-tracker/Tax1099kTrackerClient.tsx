'use client';

import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'cv_tax_1099k_tracker_v1';

type TaxYear = '2024' | '2025' | '2026';

// Federal 1099-K gross-payment threshold by tax year.
// 2024 threshold: $5,000 (IRS Notice 2023-74 + Notice 2024-85, final transition year)
// 2025 threshold: $2,500 (phase-down to ARPA target)
// 2026+ threshold: $600 (American Rescue Plan full implementation, once phased in)
const FEDERAL_THRESHOLDS: Record<TaxYear, number> = {
  '2024': 5000,
  '2025': 2500,
  '2026': 600,
};

// States with lower-than-federal 1099-K thresholds.
// Platform must issue 1099-K based on the LOWER of federal vs state threshold.
const STATE_THRESHOLDS: Record<string, { amount: number; transactions?: number; notes: string }> = {
  MA: { amount: 600, notes: 'Massachusetts has required $600 reporting since 2017' },
  VT: { amount: 600, notes: 'Vermont has required $600 reporting since 2017' },
  VA: { amount: 600, notes: 'Virginia adopted $600 threshold in 2020' },
  MD: { amount: 600, notes: 'Maryland adopted $600 threshold in 2022' },
  DC: { amount: 600, notes: 'DC has required $600 reporting since 2011' },
  IL: { amount: 1000, transactions: 4, notes: 'Illinois requires $1,000 AND 4+ transactions' },
  NJ: { amount: 1000, notes: 'New Jersey uses $1,000 threshold' },
  MO: { amount: 1200, notes: 'Missouri uses $1,200 threshold' },
  AR: { amount: 2500, notes: 'Arkansas uses $2,500 threshold' },
};

// All US states/territories where a user might live (abbrev list for UX)
const US_STATES: { code: string; name: string }[] = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'DC', name: 'DC' },
  { code: 'FL', name: 'Florida' }, { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' }, { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' }, { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' }, { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' }, { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' }, { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' }, { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' }, { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' }, { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' }, { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' }, { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' }, { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' }, { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' }, { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' },
];

type Platform = {
  id: string;
  name: string;
  emoji: string;
  issues1099k: boolean;
  typicalFeePct: number; // approx total platform take for net-proceeds estimate
  notes: string;
};

// Platforms ordered by typical card-selling volume
const PLATFORMS: Platform[] = [
  { id: 'ebay', name: 'eBay', emoji: '🅴', issues1099k: true, typicalFeePct: 13.25, notes: 'Final value fee 13.25% + $0.30 order fee + optional promoted listings' },
  { id: 'whatnot', name: 'Whatnot', emoji: '📺', issues1099k: true, typicalFeePct: 11, notes: '8% sale fee + 2.9% + $0.30 payment processing' },
  { id: 'fanatics-collect', name: 'Fanatics Collect', emoji: '🏅', issues1099k: true, typicalFeePct: 10, notes: '10% Fanatics Collect / PWCC marketplace fee' },
  { id: 'pwcc', name: 'PWCC Marketplace', emoji: '📦', issues1099k: true, typicalFeePct: 10, notes: '10% sell-through rate (3% BP to buyer)' },
  { id: 'myslabs', name: 'MySlabs', emoji: '💎', issues1099k: true, typicalFeePct: 6, notes: '6% sale + $0.35 per listing (monthly plans available)' },
  { id: 'mercari', name: 'Mercari', emoji: '🛍️', issues1099k: true, typicalFeePct: 12.9, notes: '10% sale + 2.9% + $0.50 payment processing' },
  { id: 'stockx', name: 'StockX', emoji: '📈', issues1099k: true, typicalFeePct: 12, notes: '9% transaction + 3% payment processing' },
  { id: 'comc', name: 'COMC', emoji: '🏦', issues1099k: true, typicalFeePct: 20, notes: '20% sale fee + $0.50/card processing (consignment model)' },
  { id: 'goldin', name: 'Goldin Auctions', emoji: '🔨', issues1099k: true, typicalFeePct: 15, notes: '15% seller commission (20% buyer premium passed through)' },
  { id: 'heritage', name: 'Heritage Auctions', emoji: '🏛️', issues1099k: true, typicalFeePct: 10, notes: '10% seller commission (25% buyer premium passed through)' },
  { id: 'offerup', name: 'OfferUp (shipped)', emoji: '📫', issues1099k: true, typicalFeePct: 12.9, notes: 'Shipped transactions through OfferUp Payments only' },
  { id: 'paypal-goods', name: 'PayPal Goods & Services', emoji: '🅿️', issues1099k: true, typicalFeePct: 3.49, notes: 'Direct PayPal G&S (3.49% + $0.49 per transaction)' },
  { id: 'fb-shipped', name: 'Facebook Marketplace (shipped)', emoji: '🅕', issues1099k: true, typicalFeePct: 5, notes: 'Only shipped orders through Meta Pay issue 1099-K; local cash is NOT reported' },
  { id: 'cashapp-biz', name: 'Cash App for Business', emoji: '💵', issues1099k: true, typicalFeePct: 2.75, notes: 'Cash App BUSINESS accounts only; personal accounts do NOT issue 1099-K' },
  { id: 'venmo-biz', name: 'Venmo for Business', emoji: '🟦', issues1099k: true, typicalFeePct: 1.9, notes: 'Venmo BUSINESS accounts only; Friends & Family transfers do NOT issue 1099-K' },
  { id: 'zelle', name: 'Zelle (NOT REPORTED)', emoji: '⚪', issues1099k: false, typicalFeePct: 0, notes: 'Zelle is statutorily exempt from 1099-K. Income is still taxable; just no form is issued.' },
];

type PlatformEntry = {
  platformId: string;
  grossYTD: string; // string to allow typing
  transactions: string;
  costBasis: string; // optional cost basis for taxable gain estimate
  fees: string; // optional override for fees paid
};

type State = {
  taxYear: TaxYear;
  userState: string;
  platforms: Record<string, PlatformEntry>;
  showAdvanced: boolean;
};

const DEFAULT_STATE: State = {
  taxYear: '2026',
  userState: 'CA',
  platforms: {},
  showAdvanced: false,
};

function makeEntry(platformId: string): PlatformEntry {
  return { platformId, grossYTD: '', transactions: '', costBasis: '', fees: '' };
}

function fmt(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function fmt2(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

type ThresholdVerdict = {
  band: 'SAFE' | 'WATCH' | 'APPROACHING' | 'TRIGGERED';
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
};

function verdictFor(gross: number, threshold: number, issues: boolean, txCount: number, txMin: number | undefined): ThresholdVerdict {
  if (!issues) {
    return { band: 'SAFE', label: 'No 1099-K ever issued (statutory exemption)', color: 'text-slate-300', bgColor: 'bg-slate-900/40', borderColor: 'border-slate-700/40' };
  }
  const pct = gross / threshold;
  // Transaction-count gate for IL ($1,000 AND 4+ transactions)
  if (txMin && txMin > 1 && txCount < txMin) {
    return { band: 'SAFE', label: `Under ${txMin}-transaction gate — no form unless ${txMin}+ sales AND $${fmt(threshold)}+`, color: 'text-emerald-300', bgColor: 'bg-emerald-950/40', borderColor: 'border-emerald-800/40' };
  }
  if (pct >= 1.0) return { band: 'TRIGGERED', label: 'Will receive 1099-K', color: 'text-rose-200', bgColor: 'bg-rose-950/50', borderColor: 'border-rose-700/50' };
  if (pct >= 0.9) return { band: 'APPROACHING', label: 'Approaching threshold (≥90%)', color: 'text-amber-200', bgColor: 'bg-amber-950/40', borderColor: 'border-amber-800/40' };
  if (pct >= 0.5) return { band: 'WATCH', label: 'Watch zone (50–90%)', color: 'text-yellow-200', bgColor: 'bg-yellow-950/40', borderColor: 'border-yellow-800/40' };
  return { band: 'SAFE', label: 'Below watch zone', color: 'text-emerald-200', bgColor: 'bg-emerald-950/40', borderColor: 'border-emerald-800/40' };
}

export default function Tax1099kTrackerClient() {
  const [state, setState] = useState<State>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<State>;
        setState(s => ({ ...s, ...parsed, platforms: parsed.platforms ?? s.platforms }));
      }
    } catch {}
    setHydrated(true);
  }, []);

  // Persist on change
  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }, [state, hydrated]);

  function getEntry(platformId: string): PlatformEntry {
    return state.platforms[platformId] ?? makeEntry(platformId);
  }

  function setEntryField(platformId: string, field: keyof PlatformEntry, value: string) {
    setState(s => ({
      ...s,
      platforms: {
        ...s.platforms,
        [platformId]: { ...getEntry(platformId), [field]: value },
      },
    }));
  }

  function reset() {
    if (typeof window !== 'undefined' && !window.confirm('Reset all platform data? This cannot be undone.')) return;
    setState(DEFAULT_STATE);
  }

  // Effective threshold: lower of federal vs state
  const federalThreshold = FEDERAL_THRESHOLDS[state.taxYear];
  const stateRule = STATE_THRESHOLDS[state.userState];
  const effectiveThreshold = stateRule && stateRule.amount < federalThreshold ? stateRule.amount : federalThreshold;
  const thresholdSource: 'federal' | 'state' = stateRule && stateRule.amount < federalThreshold ? 'state' : 'federal';
  const stateTxMin = stateRule?.transactions;

  // Derived per-platform rows
  const rows = useMemo(() => {
    return PLATFORMS.map(p => {
      const e = getEntry(p.id);
      const gross = parseFloat(e.grossYTD) || 0;
      const txCount = parseInt(e.transactions) || 0;
      const basisRaw = parseFloat(e.costBasis);
      const feesOverride = parseFloat(e.fees);
      const basis = isNaN(basisRaw) ? 0 : basisRaw;
      const fees = isNaN(feesOverride) ? gross * (p.typicalFeePct / 100) : feesOverride;
      const netProceeds = Math.max(0, gross - fees);
      const taxableGain = basis > 0 ? Math.max(0, netProceeds - basis) : null;
      const v = verdictFor(gross, effectiveThreshold, p.issues1099k, txCount, stateTxMin);
      const distanceToThreshold = Math.max(0, effectiveThreshold - gross);
      const pctOfThreshold = p.issues1099k ? Math.min(2, gross / effectiveThreshold) : 0;
      return { platform: p, entry: e, gross, txCount, basis, fees, netProceeds, taxableGain, verdict: v, distanceToThreshold, pctOfThreshold };
    });
  }, [state, effectiveThreshold, stateTxMin]); // eslint-disable-line react-hooks/exhaustive-deps

  // Portfolio-level aggregates
  const totalGross = rows.reduce((a, r) => a + r.gross, 0);
  const totalNet = rows.reduce((a, r) => a + r.netProceeds, 0);
  const totalFees = rows.reduce((a, r) => a + r.fees, 0);
  const totalTaxableGain = rows.reduce((a, r) => a + (r.taxableGain ?? 0), 0);
  const totalTransactions = rows.reduce((a, r) => a + r.txCount, 0);
  const platformsTriggered = rows.filter(r => r.verdict.band === 'TRIGGERED').length;
  const platformsApproaching = rows.filter(r => r.verdict.band === 'APPROACHING').length;

  // Highest-volume platform (biggest exposure)
  const topExposure = rows.filter(r => r.gross > 0).sort((a, b) => b.gross - a.gross)[0];

  function copySummary() {
    const lines: string[] = [];
    lines.push(`CardVault 1099-K Threshold Tracker — ${state.taxYear}`);
    lines.push(`State: ${state.userState} | Effective threshold: $${fmt(effectiveThreshold)} (${thresholdSource})`);
    lines.push('');
    lines.push(`Total YTD gross: $${fmt2(totalGross)}`);
    lines.push(`Total fees paid: $${fmt2(totalFees)}`);
    lines.push(`Total net proceeds: $${fmt2(totalNet)}`);
    if (totalTaxableGain > 0) lines.push(`Estimated taxable gain (entered basis): $${fmt2(totalTaxableGain)}`);
    lines.push(`Platforms triggered: ${platformsTriggered} | Approaching: ${platformsApproaching}`);
    lines.push('');
    lines.push('Per-platform:');
    rows.filter(r => r.gross > 0 || r.txCount > 0).forEach(r => {
      lines.push(`- ${r.platform.name}: $${fmt2(r.gross)} gross, ${r.txCount} tx, ${r.verdict.label}`);
    });
    const text = lines.join('\n');
    try { navigator.clipboard.writeText(text); } catch {}
  }

  return (
    <div className="space-y-6">
      {/* Header config bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl bg-gray-900/60 border border-gray-800 p-4">
          <label className="text-xs text-gray-400 uppercase tracking-wide mb-2 block">Tax Year</label>
          <div className="flex gap-2">
            {(['2024', '2025', '2026'] as TaxYear[]).map(y => (
              <button
                key={y}
                onClick={() => setState(s => ({ ...s, taxYear: y }))}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${state.taxYear === y ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
              >
                {y}{y === '2026' ? '+' : ''}
              </button>
            ))}
          </div>
          <div className="mt-2 text-xs text-gray-500">Federal threshold: <span className="text-blue-300 font-semibold">${fmt(federalThreshold)}</span></div>
        </div>

        <div className="rounded-xl bg-gray-900/60 border border-gray-800 p-4">
          <label className="text-xs text-gray-400 uppercase tracking-wide mb-2 block">Your State</label>
          <select
            value={state.userState}
            onChange={e => setState(s => ({ ...s, userState: e.target.value }))}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm"
          >
            {US_STATES.map(s => <option key={s.code} value={s.code}>{s.code} — {s.name}</option>)}
          </select>
          <div className="mt-2 text-xs text-gray-500">
            {stateRule ? <span className="text-amber-300">State threshold ${fmt(stateRule.amount)}{stateRule.transactions ? ` + ${stateRule.transactions} tx` : ''}</span> : 'Follows federal'}
          </div>
        </div>

        <div className="rounded-xl bg-blue-950/40 border border-blue-800/50 p-4">
          <div className="text-xs text-blue-300 uppercase tracking-wide mb-1">Effective threshold</div>
          <div className="text-2xl font-black text-white">${fmt(effectiveThreshold)}</div>
          <div className="text-xs text-blue-300 mt-1">
            {thresholdSource === 'state' ? 'Using your state\'s lower threshold' : 'Federal threshold applies'}
          </div>
        </div>
      </div>

      {/* Top-level stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatTile label="Total YTD Gross" value={`$${fmt(totalGross)}`} accent="blue" />
        <StatTile label="Platform Fees" value={`$${fmt(totalFees)}`} accent="rose" />
        <StatTile label="Net Proceeds" value={`$${fmt(totalNet)}`} accent="emerald" />
        <StatTile label="Forms Triggered" value={`${platformsTriggered}`} accent={platformsTriggered > 0 ? 'rose' : 'slate'} />
        <StatTile label="Approaching" value={`${platformsApproaching}`} accent={platformsApproaching > 0 ? 'amber' : 'slate'} />
      </div>

      {/* State-threshold note */}
      {stateRule && (
        <div className="rounded-xl bg-amber-950/30 border border-amber-900/40 p-4 text-sm text-amber-200">
          <strong className="text-amber-300">{US_STATES.find(s => s.code === state.userState)?.name}:</strong> {stateRule.notes}. {stateRule.amount < federalThreshold ? `Because your state threshold ($${fmt(stateRule.amount)}) is lower than federal ($${fmt(federalThreshold)}), platforms will issue a 1099-K at the LOWER threshold.` : `Your state threshold ($${fmt(stateRule.amount)}) is higher than federal ($${fmt(federalThreshold)}) for ${state.taxYear} — federal applies.`}
        </div>
      )}

      {/* Platform rows */}
      <div className="rounded-xl bg-gray-900/60 border border-gray-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Per-Platform YTD Tracker</h3>
          <div className="flex gap-2 text-xs">
            <button
              onClick={() => setState(s => ({ ...s, showAdvanced: !s.showAdvanced }))}
              className="px-2.5 py-1 rounded bg-gray-800 text-gray-300 hover:bg-gray-700"
            >
              {state.showAdvanced ? 'Hide advanced' : 'Show advanced'}
            </button>
            <button onClick={copySummary} className="px-2.5 py-1 rounded bg-blue-900/60 text-blue-200 hover:bg-blue-800/60">Copy summary</button>
            <button onClick={reset} className="px-2.5 py-1 rounded bg-rose-900/40 text-rose-300 hover:bg-rose-800/40">Reset</button>
          </div>
        </div>

        <div className="divide-y divide-gray-800">
          {rows.map(r => {
            const p = r.platform;
            const v = r.verdict;
            const pct = Math.min(100, (r.gross / effectiveThreshold) * 100);
            return (
              <div key={p.id} className={`p-4 ${v.bgColor} ${v.band === 'TRIGGERED' ? 'ring-1 ring-inset ring-rose-800/40' : ''}`}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl" aria-hidden>{p.emoji}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-semibold truncate">{p.name}</span>
                        {!p.issues1099k && <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">EXEMPT</span>}
                      </div>
                      <div className="text-xs text-gray-500 truncate">{p.notes}</div>
                    </div>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded border ${v.borderColor} ${v.color} font-medium whitespace-nowrap`}>
                    {v.band}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                  <LabeledInput
                    label="YTD gross $"
                    value={r.entry.grossYTD}
                    onChange={v => setEntryField(p.id, 'grossYTD', v)}
                    placeholder="0"
                  />
                  <LabeledInput
                    label="Transactions"
                    value={r.entry.transactions}
                    onChange={v => setEntryField(p.id, 'transactions', v)}
                    placeholder="0"
                  />
                  {state.showAdvanced && (
                    <>
                      <LabeledInput
                        label="Cost basis $ (optional)"
                        value={r.entry.costBasis}
                        onChange={v => setEntryField(p.id, 'costBasis', v)}
                        placeholder="0"
                      />
                      <LabeledInput
                        label="Fees override $ (optional)"
                        value={r.entry.fees}
                        onChange={v => setEntryField(p.id, 'fees', v)}
                        placeholder={`~${fmt(r.fees)}`}
                      />
                    </>
                  )}
                </div>

                {/* Progress bar */}
                {p.issues1099k && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>{v.label}</span>
                      <span>${fmt(r.gross)} of ${fmt(effectiveThreshold)}</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          v.band === 'TRIGGERED' ? 'bg-rose-500' :
                          v.band === 'APPROACHING' ? 'bg-amber-500' :
                          v.band === 'WATCH' ? 'bg-yellow-500' :
                          'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.max(2, pct)}%` }}
                      />
                    </div>
                    {r.distanceToThreshold > 0 && r.gross > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        ${fmt(r.distanceToThreshold)} remaining before form triggers
                      </div>
                    )}
                  </div>
                )}

                {/* Net-proceeds breakdown */}
                {r.gross > 0 && (
                  <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2 text-xs">
                    <MetricChip label="Gross" value={`$${fmt(r.gross)}`} />
                    <MetricChip label="Fees" value={`$${fmt(r.fees)}`} muted />
                    <MetricChip label="Net" value={`$${fmt(r.netProceeds)}`} accent="emerald" />
                    {r.taxableGain !== null && (
                      <MetricChip label="Taxable gain" value={`$${fmt(r.taxableGain)}`} accent="amber" />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Top exposure summary */}
      {topExposure && topExposure.gross > 0 && (
        <div className="rounded-xl bg-gray-900/60 border border-gray-800 p-4">
          <h3 className="text-sm font-semibold text-white mb-2">Your Biggest Platform Exposure</h3>
          <div className="text-gray-400 text-sm">
            <span className="text-white font-semibold">{topExposure.platform.name}</span> is your highest-volume marketplace this year at <span className="text-blue-300 font-semibold">${fmt(topExposure.gross)}</span>.
            {' '}
            {topExposure.verdict.band === 'TRIGGERED' && <>A 1099-K <span className="text-rose-300 font-semibold">will be issued</span>. Organize cost-basis documentation for every sale.</>}
            {topExposure.verdict.band === 'APPROACHING' && <>You are <span className="text-amber-300 font-semibold">within 10%</span> of the threshold. Decide whether to continue, slow down, or move excess volume elsewhere.</>}
            {topExposure.verdict.band === 'WATCH' && <>Mid-year pace. At this rate, confirm whether projected year-end exceeds ${fmt(effectiveThreshold)}.</>}
            {topExposure.verdict.band === 'SAFE' && <>Well below threshold. Platform fees aside, form paperwork is not a concern here.</>}
          </div>
        </div>
      )}

      {/* Aggregate taxable-gain summary */}
      {totalTaxableGain > 0 && (
        <div className="rounded-xl bg-emerald-950/30 border border-emerald-900/40 p-4">
          <h3 className="text-sm font-semibold text-emerald-300 mb-2">Estimated Taxable Gain (Across All Platforms)</h3>
          <div className="text-2xl font-black text-white mb-1">${fmt2(totalTaxableGain)}</div>
          <div className="text-xs text-emerald-200/80">
            This is the sum of (net proceeds − cost basis) across platforms where you entered a basis. Collectibles long-term capital gains are capped at 28% federal. Short-term gains (held &lt;1 year) are taxed at your ordinary-income rate. State tax applies additionally in most states.
          </div>
        </div>
      )}

      {/* Action footer */}
      <div className="rounded-xl bg-blue-950/30 border border-blue-800/40 p-4 text-sm text-blue-100">
        <strong className="text-blue-300">What to do next:</strong> Export this summary for your CPA, or import to a spreadsheet. Every platform that triggers a 1099-K will send a copy to the IRS in January; the IRS expects you to report NET gain (gross − basis − fees − shipping − deductible expenses) on Schedule D or Schedule C depending on whether you are a hobbyist or a dealer. The Flip Tracker P&amp;L tool can organize per-sale cost basis; the Card Tax Calculator handles the capital-gains math per sale.
      </div>
    </div>
  );
}

function LabeledInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="text-xs text-gray-400 block">
      <span className="block mb-1">{label}</span>
      <input
        type="number"
        inputMode="decimal"
        min="0"
        step="any"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-gray-800 border border-gray-700 text-white rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500"
      />
    </label>
  );
}

function StatTile({ label, value, accent }: { label: string; value: string; accent: 'blue' | 'rose' | 'emerald' | 'amber' | 'slate' }) {
  const colorMap: Record<typeof accent, string> = {
    blue: 'text-blue-300 bg-blue-950/40 border-blue-800/40',
    rose: 'text-rose-200 bg-rose-950/40 border-rose-800/40',
    emerald: 'text-emerald-200 bg-emerald-950/40 border-emerald-800/40',
    amber: 'text-amber-200 bg-amber-950/40 border-amber-800/40',
    slate: 'text-slate-300 bg-slate-900/40 border-slate-700/40',
  };
  return (
    <div className={`rounded-xl border p-3 ${colorMap[accent]}`}>
      <div className="text-[10px] uppercase tracking-wide opacity-80">{label}</div>
      <div className="text-xl font-black text-white mt-1">{value}</div>
    </div>
  );
}

function MetricChip({ label, value, muted, accent }: { label: string; value: string; muted?: boolean; accent?: 'emerald' | 'amber' }) {
  const color = accent === 'emerald' ? 'text-emerald-300' : accent === 'amber' ? 'text-amber-300' : muted ? 'text-gray-500' : 'text-gray-300';
  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded px-2 py-1.5">
      <div className="text-[10px] uppercase tracking-wide text-gray-500">{label}</div>
      <div className={`text-sm font-semibold ${color}`}>{value}</div>
    </div>
  );
}
