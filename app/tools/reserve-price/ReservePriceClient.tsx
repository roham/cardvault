'use client';

import { useEffect, useMemo, useState } from 'react';

const STATE_KEY = 'cv_reserve_price_v1';

type Risk = 'protective' | 'balanced' | 'aggressive';

type Platform = {
  id: string;
  name: string;
  // fee stack
  sellerFee: number;       // % taken from hammer
  paymentFee: number;      // % payment-processing fee
  buyerPremium: number;    // % added to hammer for buyer (affects hammer equilibrium)
  reserveFeePct: number;   // % of reserve charged if reserve set
  reserveFeeMin: number;   // $ threshold below which reserve-fee does not apply
  supportsReserve: boolean;
  shippingCost: number;    // assumed seller-paid shipping typical for cards
  notes: string;
};

const PLATFORMS: Platform[] = [
  { id: 'ebay', name: 'eBay', sellerFee: 13.25, paymentFee: 0, buyerPremium: 0, reserveFeePct: 0, reserveFeeMin: 200, supportsReserve: true, shippingCost: 6, notes: 'Reserve available but only for listings $200+. 13.25% FVF standard, 2% promoted bump. Shipping charged to buyer but reported in gross.' },
  { id: 'whatnot', name: 'Whatnot', sellerFee: 8, paymentFee: 2.9, buyerPremium: 0, reserveFeePct: 0, reserveFeeMin: 0, supportsReserve: false, shippingCost: 5, notes: 'Live-auction platform — no reserve support. Use a floor starting bid instead. 8% seller fee + 2.9% payment processing.' },
  { id: 'goldin', name: 'Goldin', sellerFee: 10, paymentFee: 0, buyerPremium: 20, reserveFeePct: 1, reserveFeeMin: 5000, supportsReserve: true, shippingCost: 0, notes: '20% buyer premium (buyer pays 20% above hammer). Seller commission 5-15% negotiable, ~10% standard. Reserve-fee case-by-case on high-end.' },
  { id: 'heritage', name: 'Heritage', sellerFee: 10, paymentFee: 0, buyerPremium: 20, reserveFeePct: 3, reserveFeeMin: 5000, supportsReserve: true, shippingCost: 0, notes: '20% buyer premium. Seller commission 0-20% tiered on estimate. Reserve fee 3% of reserve for reserves above $5K.' },
  { id: 'pwcc', name: 'PWCC', sellerFee: 20, paymentFee: 0, buyerPremium: 17.5, reserveFeePct: 1, reserveFeeMin: 1000, supportsReserve: true, shippingCost: 0, notes: '17.5% buyer premium (Premier). 20% seller commission on Premier, lower on Weekly. Reserve available with small surcharge.' },
  { id: 'fanatics-collect', name: 'Fanatics Collect', sellerFee: 10, paymentFee: 0, buyerPremium: 15, reserveFeePct: 0, reserveFeeMin: 0, supportsReserve: true, shippingCost: 0, notes: '15% buyer premium. 10% seller fee standard. Reserves supported without surcharge.' },
  { id: 'mercari', name: 'Mercari', sellerFee: 10, paymentFee: 2.9, buyerPremium: 0, reserveFeePct: 0, reserveFeeMin: 0, supportsReserve: false, shippingCost: 4, notes: 'Fixed-price marketplace — no auction reserves. 10% seller fee + 2.9% payment. Use best-offer instead for floor control.' },
  { id: 'myslabs', name: 'MySlabs', sellerFee: 3, paymentFee: 2.9, buyerPremium: 0, reserveFeePct: 0, reserveFeeMin: 0, supportsReserve: false, shippingCost: 6, notes: 'BIN/best-offer marketplace. 3% seller fee + 2.9% payment. No auction reserve mechanism.' },
  { id: 'offerup', name: 'OfferUp', sellerFee: 12.9, paymentFee: 0, buyerPremium: 0, reserveFeePct: 0, reserveFeeMin: 0, supportsReserve: false, shippingCost: 4, notes: 'Local/shipping marketplace. 12.9% seller fee. No auction-reserve mechanism. Use listing price + best-offer.' },
];

const RISK_PROFILES: Record<Risk, { reservePct: number; startingBidPct: number; label: string; desc: string; emoji: string }> = {
  protective: { reservePct: 0.82, startingBidPct: 0.10, label: 'Protective', desc: 'Reserve at 82% of FMV. Rarely passes. Captures most of the upside with minimal give-back risk.', emoji: '🛡️' },
  balanced: { reservePct: 0.67, startingBidPct: 0.08, label: 'Balanced', desc: 'Reserve at 67% of FMV. Industry standard. Protects from cold rooms while inviting multi-party bidding.', emoji: '⚖️' },
  aggressive: { reservePct: 0.50, startingBidPct: 0.05, label: 'Aggressive', desc: 'Reserve at 50% of FMV. Accepts pass risk to attract early bids and a hot-room bidding war.', emoji: '🔥' },
};

type Scenario = {
  label: string;
  emoji: string;
  hammerPct: number;
  color: string;
};
const SCENARIOS: Scenario[] = [
  { label: 'Undersell', emoji: '🧊', hammerPct: 0.60, color: 'text-red-300' },
  { label: 'Target', emoji: '🎯', hammerPct: 1.00, color: 'text-slate-200' },
  { label: 'Outperform', emoji: '🔥', hammerPct: 1.20, color: 'text-emerald-300' },
];

function fmt(n: number): string {
  if (!isFinite(n)) return '—';
  if (Math.abs(n) >= 1000) return `$${Math.round(n).toLocaleString()}`;
  return `$${n.toFixed(2)}`;
}

type State = {
  fmv: number;
  costBasis: number;
  platformId: string;
  risk: Risk;
  useReserve: boolean;
};

const DEFAULT_STATE: State = {
  fmv: 1000,
  costBasis: 500,
  platformId: 'ebay',
  risk: 'balanced',
  useReserve: true,
};

export default function ReservePriceClient() {
  const [state, setState] = useState<State>(DEFAULT_STATE);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem(STATE_KEY);
      if (s) setState({ ...DEFAULT_STATE, ...JSON.parse(s) });
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem(STATE_KEY, JSON.stringify(state)); } catch {}
  }, [state]);

  const platform = PLATFORMS.find(p => p.id === state.platformId) || PLATFORMS[0];
  const risk = RISK_PROFILES[state.risk];

  const recommended = useMemo(() => {
    const fmv = Math.max(0, state.fmv);
    const reserve = Math.round(fmv * risk.reservePct);
    const startingBid = Math.round(fmv * risk.startingBidPct);
    // Break-even: hammer × (1 - sellerFee% - paymentFee%) = costBasis + shipping → solve for hammer
    const netRate = 1 - (platform.sellerFee + platform.paymentFee) / 100;
    const breakEven = netRate > 0 ? (state.costBasis + platform.shippingCost) / netRate : Infinity;
    // Reserve fee (if applicable)
    const reserveFee = state.useReserve && platform.supportsReserve && reserve >= platform.reserveFeeMin
      ? reserve * platform.reserveFeePct / 100
      : 0;
    const actuallyCanUseReserve = state.useReserve && platform.supportsReserve;
    return { reserve, startingBid, breakEven, reserveFee, actuallyCanUseReserve };
  }, [state, platform, risk]);

  const scenarioRows = useMemo(() => {
    return SCENARIOS.map(s => {
      const hammer = state.fmv * s.hammerPct;
      const sellerFees = hammer * (platform.sellerFee + platform.paymentFee) / 100;
      const net = hammer - sellerFees - platform.shippingCost - recommended.reserveFee;
      const netProfit = net - state.costBasis;
      const clearsReserve = !recommended.actuallyCanUseReserve || hammer >= recommended.reserve;
      const clearsBreakEven = net >= state.costBasis;
      return { ...s, hammer, sellerFees, net, netProfit, clearsReserve, clearsBreakEven };
    });
  }, [state, platform, recommended]);

  const reserveBelowBreakEven = recommended.actuallyCanUseReserve
    && isFinite(recommended.breakEven)
    && recommended.reserve < recommended.breakEven;

  async function handleCopy() {
    const text = `Reserve Price Plan
FMV: ${fmt(state.fmv)} | Cost basis: ${fmt(state.costBasis)} | Platform: ${platform.name} | Risk: ${risk.label}
Recommended reserve: ${recommended.actuallyCanUseReserve ? fmt(recommended.reserve) : 'N/A (platform does not support reserves)'}
Suggested starting bid: ${fmt(recommended.startingBid)}
Break-even hammer: ${isFinite(recommended.breakEven) ? fmt(recommended.breakEven) : '—'}
${recommended.reserveFee > 0 ? `Reserve fee: ${fmt(recommended.reserveFee)} (${platform.reserveFeePct}% of reserve)` : ''}

Scenarios:
${scenarioRows.map(r => `  ${r.emoji} ${r.label} (hammer ${fmt(r.hammer)}): net ${fmt(r.net)} | profit ${fmt(r.netProfit)} | ${r.clearsReserve ? '✓ clears reserve' : '✗ below reserve'}`).join('\n')}

via CardVault · https://cardvault-two.vercel.app/tools/reserve-price`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block">
            <div className="text-sm font-semibold text-slate-300 mb-1.5">Estimated FMV (raw hammer target)</div>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400">$</span>
              <input
                type="number"
                value={state.fmv}
                onChange={e => setState({ ...state, fmv: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-700 rounded-md pl-7 pr-3 py-2 text-white focus:outline-none focus:border-sky-500"
                min={0}
                step={10}
              />
            </div>
            <div className="text-xs text-slate-500 mt-1">Your target hammer price — what you believe a fair-market closing would deliver.</div>
          </label>

          <label className="block">
            <div className="text-sm font-semibold text-slate-300 mb-1.5">Your cost basis</div>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400">$</span>
              <input
                type="number"
                value={state.costBasis}
                onChange={e => setState({ ...state, costBasis: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-700 rounded-md pl-7 pr-3 py-2 text-white focus:outline-none focus:border-sky-500"
                min={0}
                step={10}
              />
            </div>
            <div className="text-xs text-slate-500 mt-1">What you paid for the card. Used to compute break-even and profit.</div>
          </label>
        </div>

        <div>
          <div className="text-sm font-semibold text-slate-300 mb-2">Platform</div>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map(p => (
              <button
                key={p.id}
                onClick={() => setState({ ...state, platformId: p.id })}
                className={`px-3 py-1.5 rounded-md text-sm font-medium border transition ${
                  state.platformId === p.id
                    ? 'bg-sky-600 border-sky-500 text-white'
                    : 'bg-slate-950 border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                {p.name}
                {!p.supportsReserve && <span className="ml-1 text-xs opacity-60">(no reserve)</span>}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold text-slate-300 mb-2">Risk tolerance</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {(Object.keys(RISK_PROFILES) as Risk[]).map(r => {
              const p = RISK_PROFILES[r];
              return (
                <button
                  key={r}
                  onClick={() => setState({ ...state, risk: r })}
                  className={`text-left p-3 rounded-lg border-2 transition ${
                    state.risk === r
                      ? 'bg-sky-950/40 border-sky-500'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{p.emoji}</span>
                    <span className="font-bold text-white">{p.label}</span>
                  </div>
                  <div className="text-xs text-slate-400">{p.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={state.useReserve}
            disabled={!platform.supportsReserve}
            onChange={e => setState({ ...state, useReserve: e.target.checked })}
            className="w-4 h-4 accent-sky-500"
          />
          Use reserve {!platform.supportsReserve && <span className="text-xs text-red-400">(not available on {platform.name})</span>}
        </label>
      </div>

      {/* Recommendation card */}
      <div className="bg-gradient-to-br from-sky-950/60 to-sky-900/30 border border-sky-700/50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs uppercase tracking-wider text-sky-300 font-semibold">Recommended listing plan</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-slate-400 mb-1">Reserve price</div>
            <div className="text-2xl font-bold text-white">
              {recommended.actuallyCanUseReserve ? fmt(recommended.reserve) : '—'}
            </div>
            {!recommended.actuallyCanUseReserve && <div className="text-xs text-red-400 mt-0.5">N/A on {platform.name}</div>}
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1">Starting bid</div>
            <div className="text-2xl font-bold text-white">{fmt(recommended.startingBid)}</div>
            <div className="text-xs text-slate-500 mt-0.5">{(risk.startingBidPct * 100).toFixed(0)}% of FMV</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1">Break-even</div>
            <div className="text-2xl font-bold text-white">{isFinite(recommended.breakEven) ? fmt(recommended.breakEven) : '—'}</div>
            <div className="text-xs text-slate-500 mt-0.5">after fees</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1">Reserve fee</div>
            <div className="text-2xl font-bold text-white">{recommended.reserveFee > 0 ? fmt(recommended.reserveFee) : '—'}</div>
            <div className="text-xs text-slate-500 mt-0.5">{recommended.reserveFee > 0 ? `${platform.reserveFeePct}% of reserve` : 'no reserve fee'}</div>
          </div>
        </div>

        {reserveBelowBreakEven && (
          <div className="mt-4 bg-red-950/40 border border-red-700/50 rounded-lg p-3 text-sm text-red-200">
            ⚠️ <strong>Warning:</strong> Your recommended reserve ({fmt(recommended.reserve)}) is BELOW your break-even ({fmt(recommended.breakEven)}).
            If the hammer lands exactly at the reserve, you will sell at a loss. Consider Protective risk, raising the reserve manually,
            or a cheaper platform.
          </div>
        )}
      </div>

      {/* Platform notes */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
        <div className="text-xs uppercase tracking-wider text-slate-400 mb-2">{platform.name} fee structure</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-3">
          <div>
            <div className="text-xs text-slate-500">Seller fee</div>
            <div className="font-mono text-white">{platform.sellerFee}%</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Payment</div>
            <div className="font-mono text-white">{platform.paymentFee}%</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Buyer premium</div>
            <div className="font-mono text-white">{platform.buyerPremium > 0 ? `${platform.buyerPremium}%` : '—'}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Reserve supported</div>
            <div className="font-mono text-white">{platform.supportsReserve ? 'Yes' : 'No'}</div>
          </div>
        </div>
        <div className="text-xs text-slate-400 leading-relaxed">{platform.notes}</div>
      </div>

      {/* Scenarios table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800">
          <div className="text-sm font-semibold text-white">3-scenario proceeds table</div>
          <div className="text-xs text-slate-500">Stress-test your plan across a cold room, a fair market, and a hot room.</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-950/60 text-slate-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-2">Scenario</th>
                <th className="text-right px-4 py-2">Hammer</th>
                <th className="text-right px-4 py-2">Fees</th>
                <th className="text-right px-4 py-2">Net proceeds</th>
                <th className="text-right px-4 py-2">Profit</th>
                <th className="text-center px-4 py-2">Clears</th>
              </tr>
            </thead>
            <tbody>
              {scenarioRows.map(r => (
                <tr key={r.label} className="border-t border-slate-800">
                  <td className="px-4 py-2.5">
                    <span className="mr-2">{r.emoji}</span>
                    <span className={`font-semibold ${r.color}`}>{r.label}</span>
                    <span className="text-xs text-slate-500 ml-1">({(r.hammerPct * 100).toFixed(0)}% FMV)</span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-white">{fmt(r.hammer)}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-slate-400">{fmt(r.sellerFees + platform.shippingCost + recommended.reserveFee)}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-white font-bold">{fmt(r.net)}</td>
                  <td className={`px-4 py-2.5 text-right font-mono ${r.netProfit >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                    {r.netProfit >= 0 ? '+' : ''}{fmt(r.netProfit)}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <div className="flex justify-center gap-1">
                      {recommended.actuallyCanUseReserve && (
                        <span className={`text-xs px-1.5 py-0.5 rounded ${r.clearsReserve ? 'bg-emerald-900/60 text-emerald-300' : 'bg-red-900/60 text-red-300'}`}>
                          R {r.clearsReserve ? '✓' : '✗'}
                        </span>
                      )}
                      <span className={`text-xs px-1.5 py-0.5 rounded ${r.clearsBreakEven ? 'bg-emerald-900/60 text-emerald-300' : 'bg-red-900/60 text-red-300'}`}>
                        BE {r.clearsBreakEven ? '✓' : '✗'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rationale */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
        <div className="text-sm font-semibold text-white mb-3">Why these numbers?</div>
        <ul className="space-y-2 text-sm text-slate-300 list-disc list-inside">
          <li>
            <strong>Reserve</strong> at {(risk.reservePct * 100).toFixed(0)}% of FMV — {risk.desc}
          </li>
          <li>
            <strong>Starting bid</strong> at {(risk.startingBidPct * 100).toFixed(0)}% of FMV — low enough to attract early bidders, high enough to avoid nuisance bids that waste the momentum window.
          </li>
          <li>
            <strong>Break-even</strong> on {platform.name} = (cost basis {fmt(state.costBasis)} + shipping {fmt(platform.shippingCost)}) ÷ (1 - {platform.sellerFee}% seller - {platform.paymentFee}% payment) = {fmt(recommended.breakEven)}.
          </li>
          {recommended.reserveFee > 0 && (
            <li>
              <strong>Reserve fee</strong> = {platform.reserveFeePct}% of reserve ({fmt(recommended.reserve)}) = {fmt(recommended.reserveFee)}, applied regardless of sale outcome because reserve is at or above the {fmt(platform.reserveFeeMin)} threshold.
            </li>
          )}
          {!platform.supportsReserve && (
            <li>
              <strong>{platform.name} does not support reserves.</strong> Your starting bid IS your floor. Consider using a higher starting bid (~50-65% of FMV) to approximate reserve behavior, or list on a platform with reserve support.
            </li>
          )}
        </ul>
      </div>

      {/* Copy plan */}
      <div className="flex justify-center">
        <button
          onClick={handleCopy}
          className="bg-sky-600 hover:bg-sky-500 text-white font-semibold px-6 py-2.5 rounded-lg transition"
        >
          {copied ? '✓ Copied' : 'Copy plan'}
        </button>
      </div>
    </div>
  );
}
