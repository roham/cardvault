'use client';

import { useMemo, useState } from 'react';

type Velocity = 'fast' | 'medium' | 'slow';
type Grade = 'top-pop' | 'mid-grade' | 'raw';
type Brand = 'hero' | 'strong' | 'mid' | 'unloved';

const VELOCITY: Record<Velocity, { label: string; hint: string; multiplier: number }> = {
  fast:   { label: 'Fast',   hint: 'Sells in 30 days — current rookie stars, top brand', multiplier: 1.15 },
  medium: { label: 'Medium', hint: 'Sells in 30-90 days — most modern, mid-tier vintage', multiplier: 1.00 },
  slow:   { label: 'Slow',   hint: '90+ days — commons, unloved sets, off-brand',         multiplier: 0.80 },
};

const GRADE: Record<Grade, { label: string; hint: string; multiplier: number }> = {
  'top-pop':   { label: 'PSA 10 / BGS 9.5+', hint: 'Grade carries buyer confidence',    multiplier: 1.15 },
  'mid-grade': { label: 'PSA 8-9 / BGS 9',   hint: 'Graded but not top-pop',           multiplier: 1.00 },
  'raw':       { label: 'Raw',               hint: 'Dealer absorbs grading risk',      multiplier: 0.82 },
};

const BRAND: Record<Brand, { label: string; hint: string; multiplier: number }> = {
  'hero':     { label: 'Hero',     hint: 'Topps Chrome, Bowman Chrome, Prizm, Select, Optic', multiplier: 1.10 },
  'strong':   { label: 'Strong',   hint: 'Topps Flagship, Panini Donruss, Fleer Ultra',       multiplier: 1.00 },
  'mid':      { label: 'Mid',      hint: 'Score, Upper Deck modern, most base sets',         multiplier: 0.92 },
  'unloved':  { label: 'Unloved',  hint: 'Junk-wax era, off-brand, unlicensed modern',      multiplier: 0.78 },
};

function fmt(n: number): string {
  if (!isFinite(n)) return '$0';
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(n);
  if (abs >= 1000) return `${sign}$${abs.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  return `${sign}$${abs.toFixed(0)}`;
}

export default function CashOfferClient() {
  const [retail, setRetail] = useState('500');
  const [velocity, setVelocity] = useState<Velocity>('medium');
  const [grade, setGrade] = useState<Grade>('mid-grade');
  const [brand, setBrand] = useState<Brand>('strong');

  const retailNum = parseFloat(retail) || 0;

  const result = useMemo(() => {
    const baseline = 0.55;
    const v = VELOCITY[velocity].multiplier;
    const g = GRADE[grade].multiplier;
    const b = BRAND[brand].multiplier;
    const adjusted = baseline * v * g * b;

    const lowPct = Math.max(0.25, adjusted - 0.07);
    const midPct = adjusted;
    const highPct = Math.min(0.75, adjusted + 0.07);

    const low = retailNum * lowPct;
    const mid = retailNum * midPct;
    const high = retailNum * highPct;

    const ebayFeePct = 0.1365;
    const ebayFixed = 0.40;
    const ebayNet = retailNum * (1 - ebayFeePct) - ebayFixed - 6;

    const deltaVsEbay = mid - ebayNet;
    const dealerWins = deltaVsEbay > 0;

    return {
      low,
      mid,
      high,
      lowPct,
      midPct,
      highPct,
      ebayNet,
      deltaVsEbay,
      dealerWins,
      baseline,
      velocityMult: v,
      gradeMult: g,
      brandMult: b,
    };
  }, [retailNum, velocity, grade, brand]);

  let recommendation = '';
  let recGradient = '';
  if (retailNum <= 0) {
    recommendation = 'Enter a retail value to see offer estimate.';
    recGradient = 'from-gray-600 to-gray-700';
  } else if (retailNum < 100) {
    recommendation = `Under $100: dealer cash offer (${fmt(result.mid)}) often beats eBay net (${fmt(result.ebayNet)}) due to fixed fee drag. Take the cash unless you want to bulk 5-10 cards together for a single eBay listing.`;
    recGradient = 'from-emerald-600 to-teal-700';
  } else if (retailNum < 500) {
    recommendation = `$100-$500 zone: dealer ${fmt(result.mid)} vs eBay net ${fmt(result.ebayNet)}. ${result.dealerWins ? 'Dealer offer wins — take the cash unless you need maximum price.' : `eBay wins by ${fmt(Math.abs(result.deltaVsEbay))}, but factor your listing/ship time.`}`;
    recGradient = result.dealerWins ? 'from-emerald-600 to-teal-700' : 'from-amber-600 to-orange-700';
  } else if (retailNum < 2000) {
    recommendation = `$500-$2,000 zone: dealer ${fmt(result.mid)} vs eBay net ${fmt(result.ebayNet)}. eBay net usually wins on raw math, but dealer gives instant cash. Auction consignment (PWCC/Goldin ~15% fee) nets ~${fmt(retailNum * 0.85 - 25)} but takes 3-6 months.`;
    recGradient = 'from-amber-600 to-orange-700';
  } else {
    recommendation = `Above $2,000: auction consignment beats both dealer cash (${fmt(result.mid)}) and eBay (${fmt(result.ebayNet)}). Major auctions drive competitive bidding — expect ~${fmt(retailNum * 0.85)} net at PWCC/Heritage/Goldin. Take the wait.`;
    recGradient = 'from-rose-600 to-red-700';
  }

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Card Profile</h2>

        <label className="block mb-5">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Verified Retail Value</span>
          <div className="mt-1 relative max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={retail}
              onChange={e => setRetail(e.target.value)}
              className="w-full pl-7 pr-3 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-violet-500 focus:outline-none"
            />
          </div>
          <span className="text-[11px] text-gray-500 mt-1.5 block">Use recent PSA-auction / eBay-sold comps for this number. Listed prices inflate estimates.</span>
        </label>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide block mb-2">Velocity</span>
            <div className="space-y-2">
              {(['fast', 'medium', 'slow'] as Velocity[]).map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVelocity(v)}
                  className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                    velocity === v
                      ? 'bg-violet-500/15 border border-violet-500/60 text-violet-200'
                      : 'bg-gray-900 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{VELOCITY[v].label}</span>
                    <span className="text-[10px] opacity-60 font-mono">
                      {VELOCITY[v].multiplier >= 1 ? '+' : ''}{((VELOCITY[v].multiplier - 1) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="text-[11px] opacity-70 mt-0.5">{VELOCITY[v].hint}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide block mb-2">Grade Tier</span>
            <div className="space-y-2">
              {(['top-pop', 'mid-grade', 'raw'] as Grade[]).map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGrade(g)}
                  className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                    grade === g
                      ? 'bg-violet-500/15 border border-violet-500/60 text-violet-200'
                      : 'bg-gray-900 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{GRADE[g].label}</span>
                    <span className="text-[10px] opacity-60 font-mono">
                      {GRADE[g].multiplier >= 1 ? '+' : ''}{((GRADE[g].multiplier - 1) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="text-[11px] opacity-70 mt-0.5">{GRADE[g].hint}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide block mb-2">Brand Tier</span>
            <div className="space-y-2">
              {(['hero', 'strong', 'mid', 'unloved'] as Brand[]).map(b => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBrand(b)}
                  className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                    brand === b
                      ? 'bg-violet-500/15 border border-violet-500/60 text-violet-200'
                      : 'bg-gray-900 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{BRAND[b].label}</span>
                    <span className="text-[10px] opacity-60 font-mono">
                      {BRAND[b].multiplier >= 1 ? '+' : ''}{((BRAND[b].multiplier - 1) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="text-[11px] opacity-70 mt-0.5">{BRAND[b].hint}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Offer band */}
      {retailNum > 0 && (
        <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Expected Dealer Offer Range</h2>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-4">
              <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Low Ball</div>
              <div className="text-2xl font-black text-white">{fmt(result.low)}</div>
              <div className="text-[11px] text-gray-500 mt-1">{(result.lowPct * 100).toFixed(0)}% of retail</div>
            </div>
            <div className="bg-violet-950/40 border-2 border-violet-500/50 rounded-xl p-4 shadow-lg shadow-violet-900/20">
              <div className="text-xs text-violet-300 uppercase tracking-wide font-semibold mb-1">Likely Offer</div>
              <div className="text-3xl font-black text-white">{fmt(result.mid)}</div>
              <div className="text-[11px] text-violet-200 mt-1">{(result.midPct * 100).toFixed(0)}% of retail</div>
            </div>
            <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-4">
              <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Top Dealer</div>
              <div className="text-2xl font-black text-white">{fmt(result.high)}</div>
              <div className="text-[11px] text-gray-500 mt-1">{(result.highPct * 100).toFixed(0)}% of retail</div>
            </div>
          </div>

          {/* Recommendation */}
          <div className={`rounded-xl p-4 bg-gradient-to-br ${recGradient} text-white`}>
            <div className="text-[10px] font-bold uppercase tracking-widest bg-black/25 inline-block px-2 py-1 rounded-full mb-2">
              Recommendation
            </div>
            <p className="text-sm sm:text-base leading-relaxed">{recommendation}</p>
          </div>
        </div>
      )}

      {/* Math breakdown */}
      {retailNum > 0 && (
        <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">The Math</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-4">
              <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-3">Dealer Offer Formula</div>
              <div className="space-y-1.5 text-sm font-mono">
                <div className="flex justify-between"><span className="text-gray-400">Baseline</span><span className="text-white">{(result.baseline * 100).toFixed(0)}%</span></div>
                <div className="flex justify-between"><span className="text-gray-400">× Velocity ({VELOCITY[velocity].label})</span><span className="text-white">×{result.velocityMult.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">× Grade ({GRADE[grade].label.split(' ')[0]})</span><span className="text-white">×{result.gradeMult.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">× Brand ({BRAND[brand].label})</span><span className="text-white">×{result.brandMult.toFixed(2)}</span></div>
                <div className="pt-1.5 mt-1.5 border-t border-gray-700 flex justify-between">
                  <span className="text-violet-300 font-semibold">= Offer Pct</span>
                  <span className="text-violet-200 font-bold">{(result.midPct * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-violet-300 font-semibold">× Retail {fmt(retailNum)}</span>
                  <span className="text-violet-200 font-bold">= {fmt(result.mid)}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-4">
              <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-3">eBay Direct Sale (comparison)</div>
              <div className="space-y-1.5 text-sm font-mono">
                <div className="flex justify-between"><span className="text-gray-400">Retail sale</span><span className="text-white">{fmt(retailNum)}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">− eBay fee 13.65%</span><span className="text-white">−{fmt(retailNum * 0.1365)}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">− Per-order fee</span><span className="text-white">−$0.40</span></div>
                <div className="flex justify-between"><span className="text-gray-400">− Shipping + supplies</span><span className="text-white">−$6</span></div>
                <div className="pt-1.5 mt-1.5 border-t border-gray-700 flex justify-between">
                  <span className="text-violet-300 font-semibold">= Net proceeds</span>
                  <span className="text-violet-200 font-bold">{fmt(result.ebayNet)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Delta vs dealer</span>
                  <span className={result.dealerWins ? 'text-emerald-400' : 'text-rose-400'}>
                    {result.dealerWins ? '+' : '−'}{fmt(Math.abs(result.deltaVsEbay))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Negotiation leverage */}
      <div className="bg-gradient-to-br from-violet-950/40 to-purple-950/40 border border-violet-800/30 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-3">4 Ways to Push the Dealer Offer Up</h2>
        <ul className="space-y-2 text-sm text-gray-300">
          <li className="flex gap-2"><span className="text-violet-400">1</span><span><strong className="text-white">Bring verified comps.</strong> Three recent sold comps on your phone turns a 45% offer into a 55% offer. Dealers respect sellers who do their homework.</span></li>
          <li className="flex gap-2"><span className="text-violet-400">2</span><span><strong className="text-white">Bundle cards.</strong> 10 cards together gets a higher per-card percentage than 10 individual transactions. Amortizes dealer due-diligence time.</span></li>
          <li className="flex gap-2"><span className="text-violet-400">3</span><span><strong className="text-white">Time your sale.</strong> End-of-month dealers run their P&L. They may stretch offers to hit inventory or cashflow goals.</span></li>
          <li className="flex gap-2"><span className="text-violet-400">4</span><span><strong className="text-white">Show your alternative.</strong> &quot;I can get 55% on eBay once fees come out, so 58% cash today works&quot; frames the negotiation. Dealers know which sellers are desperate.</span></li>
        </ul>
      </div>
    </div>
  );
}
