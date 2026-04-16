'use client';

import { useMemo, useState } from 'react';

type Platform = {
  key: string;
  name: string;
  feePct: number;
  fixedFee: number;
  hint: string;
};

const PLATFORMS: Platform[] = [
  { key: 'ebay', name: 'eBay', feePct: 13.25, fixedFee: 0.40, hint: '13.25% FVF + $0.40/order' },
  { key: 'whatnot', name: 'Whatnot', feePct: 8, fixedFee: 0.30, hint: '8% + $0.30 payment processing' },
  { key: 'comc', name: 'COMC', feePct: 7.5, fixedFee: 0, hint: '5% FVF + 2.5% processing' },
  { key: 'myslabs', name: 'MySlabs', feePct: 9, fixedFee: 0.30, hint: '9% + $0.30 payment processing' },
  { key: 'pwcc', name: 'PWCC Marketplace', feePct: 10, fixedFee: 0, hint: '10% consignment fee' },
  { key: 'mercari', name: 'Mercari', feePct: 10, fixedFee: 0.30, hint: '10% + $0.30 payment processing' },
  { key: 'fanatics', name: 'Fanatics Collect', feePct: 10, fixedFee: 0, hint: '10% seller fee' },
  { key: 'direct', name: 'Direct / Private', feePct: 0, fixedFee: 0, hint: 'No platform fee' },
];

function netProceeds(sale: number, pf: Platform): number {
  if (sale <= 0) return 0;
  const pct = sale * (pf.feePct / 100);
  return Math.max(0, sale - pct - pf.fixedFee);
}

function fmt(n: number): string {
  if (!isFinite(n)) return '$0';
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(n);
  if (abs >= 1000) return `${sign}$${abs.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  return `${sign}$${abs.toFixed(2)}`;
}

type Verdict = {
  action: 'ACCEPT' | 'COUNTER' | 'REJECT';
  gradient: string;
  label: string;
  rationale: string;
};

export default function BestOfferClient() {
  const [ask, setAsk] = useState('100');
  const [offer, setOffer] = useState('75');
  const [basis, setBasis] = useState('50');
  const [days, setDays] = useState('7');
  const [platformKey, setPlatformKey] = useState('ebay');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const askNum = parseFloat(ask) || 0;
  const offerNum = parseFloat(offer) || 0;
  const basisNum = parseFloat(basis) || 0;
  const daysNum = parseInt(days) || 0;
  const platform = PLATFORMS.find(p => p.key === platformKey) ?? PLATFORMS[0];

  const math = useMemo(() => {
    const netAtOffer = netProceeds(offerNum, platform);
    const netAtAsk = netProceeds(askNum, platform);
    const profitAtOffer = netAtOffer - basisNum;
    const profitAtAsk = netAtAsk - basisNum;
    const marginAtOffer = basisNum > 0 ? (profitAtOffer / basisNum) * 100 : 0;
    const marginAtAsk = basisNum > 0 ? (profitAtAsk / basisNum) * 100 : 0;
    const offerPctOfAsk = askNum > 0 ? (offerNum / askNum) * 100 : 0;

    let counterPrice = 0;
    if (askNum > 0 && offerNum > 0) {
      const midpoint = (askNum + offerNum) / 2;
      const percentMove = askNum * 0.93;
      counterPrice = Math.round(Math.max(midpoint, percentMove));
      if (counterPrice >= askNum) counterPrice = Math.round(askNum * 0.95);
      if (counterPrice <= offerNum) counterPrice = Math.round(offerNum + (askNum - offerNum) * 0.5);
    }
    const netAtCounter = netProceeds(counterPrice, platform);
    const profitAtCounter = netAtCounter - basisNum;

    let verdict: Verdict;
    if (offerNum <= basisNum + 2) {
      verdict = {
        action: 'REJECT',
        gradient: 'from-rose-500 to-red-600',
        label: 'Reject — Offer Below Cost Basis',
        rationale: `Accepting would result in a ${fmt(profitAtOffer)} ${profitAtOffer < 0 ? 'loss' : 'breakeven'} after fees. Decline politely and ask them to re-offer.`,
      };
    } else if (profitAtOffer < 0) {
      verdict = {
        action: 'REJECT',
        gradient: 'from-rose-500 to-red-600',
        label: 'Reject — Net Loss After Fees',
        rationale: `Platform fees on ${fmt(offerNum)} leave you with ${fmt(netAtOffer)} net — below your ${fmt(basisNum)} cost basis. Counter at ${fmt(counterPrice)} or decline.`,
      };
    } else if (offerPctOfAsk >= 92 || (daysNum >= 45 && offerPctOfAsk >= 80)) {
      verdict = {
        action: 'ACCEPT',
        gradient: 'from-emerald-500 to-teal-600',
        label: 'Accept — Strong Offer',
        rationale: daysNum >= 45
          ? `Listing is ${daysNum} days stale — eBay search rank is decaying. ${offerPctOfAsk.toFixed(0)}% of ask locks in ${fmt(profitAtOffer)} profit (${marginAtOffer.toFixed(0)}% margin). Take it.`
          : `${offerPctOfAsk.toFixed(0)}% of asking is in the auto-accept zone (92%+). Net ${fmt(netAtOffer)}, profit ${fmt(profitAtOffer)} (${marginAtOffer.toFixed(0)}% margin). Accepting leaves only ${fmt(profitAtAsk - profitAtOffer)} on the table vs holding — not worth the relist risk.`,
      };
    } else if (offerPctOfAsk >= 75) {
      verdict = {
        action: 'COUNTER',
        gradient: 'from-amber-500 to-orange-600',
        label: `Counter — Suggested ${fmt(counterPrice)}`,
        rationale: `${offerPctOfAsk.toFixed(0)}% of asking is negotiable territory. Counter at ${fmt(counterPrice)} (nets ${fmt(netAtCounter)}, ${fmt(profitAtCounter)} profit). Most successful Best Offer deals land in 2 rounds of countering.`,
      };
    } else {
      verdict = {
        action: 'COUNTER',
        gradient: 'from-amber-500 to-orange-600',
        label: `Counter — Lowball, Counter Firm at ${fmt(counterPrice)}`,
        rationale: `${offerPctOfAsk.toFixed(0)}% of ask is a lowball. Counter at ${fmt(counterPrice)} to signal you are engaged but not desperate. If they drop more than 10% below this counter, decline.`,
      };
    }

    return {
      netAtOffer,
      netAtAsk,
      profitAtOffer,
      profitAtAsk,
      marginAtOffer,
      marginAtAsk,
      offerPctOfAsk,
      counterPrice,
      netAtCounter,
      profitAtCounter,
      verdict,
    };
  }, [askNum, offerNum, basisNum, daysNum, platform]);

  const scripts = useMemo(() => {
    if (math.verdict.action === 'ACCEPT') {
      return [
        {
          title: 'Accept (Warm)',
          body: `Accepted! Thanks for the offer — I'll pack this up with penny sleeve + top-loader and ship tomorrow via tracked mail. Message me when it arrives so I know it got there safe. Appreciate the business.`,
        },
        {
          title: 'Accept (Neutral)',
          body: `Offer accepted. Shipping tomorrow morning via [USPS/UPS] with tracking. You should have it within 3–5 business days.`,
        },
      ];
    }
    if (math.verdict.action === 'REJECT') {
      return [
        {
          title: 'Decline (Polite)',
          body: `Thanks for the offer — unfortunately I can't go that low on this one. My floor on this card is ${fmt(Math.max(askNum * 0.85, basisNum + (askNum - basisNum) * 0.5))}. If you can get there, I'm open to making a deal. Otherwise, appreciate the look.`,
        },
        {
          title: 'Decline (Firm)',
          body: `Thanks for reaching out but this offer is below my cost basis. I'm going to pass. Feel free to message me if you want to make a stronger offer — otherwise I'll hold at the listed price.`,
        },
      ];
    }
    return [
      {
        title: 'Counter (Split-the-Difference)',
        body: `Thanks for the offer — I can't do ${fmt(offerNum)} but I'll meet you in the middle at ${fmt(math.counterPrice)}. Solid card for a collector price. Let me know.`,
      },
      {
        title: 'Counter (Firm, Value-Justified)',
        body: `Appreciate the offer. Recent comps on this card are running ${fmt(askNum * 0.95)}–${fmt(askNum * 1.05)}, so ${fmt(offerNum)} is a bit light for where the market is. I can come down to ${fmt(math.counterPrice)} — that's a fair deal for both of us.`,
      },
      {
        title: 'Counter (Bundled Sweetener)',
        body: `${fmt(offerNum)} is a bit low but I'd take ${fmt(math.counterPrice)}. If you want to bundle anything else from my store, I can tack on free shipping and knock another 5% off the total. Let me know what you're looking for.`,
      },
    ];
  }, [math, askNum, offerNum, basisNum]);

  function copyScript(body: string, idx: number) {
    navigator.clipboard?.writeText(body).then(() => {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1800);
    }).catch(() => {});
  }

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Offer Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <label className="block">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Your Asking Price</span>
            <div className="mt-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="1"
                value={ask}
                onChange={e => setAsk(e.target.value)}
                className="w-full pl-7 pr-3 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </label>
          <label className="block">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Offer Received</span>
            <div className="mt-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="1"
                value={offer}
                onChange={e => setOffer(e.target.value)}
                className="w-full pl-7 pr-3 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </label>
          <label className="block">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Your Cost Basis</span>
            <div className="mt-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="1"
                value={basis}
                onChange={e => setBasis(e.target.value)}
                className="w-full pl-7 pr-3 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </label>
          <label className="block">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Days Listed</span>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={days}
              onChange={e => setDays(e.target.value)}
              className="mt-1 w-full px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
            />
          </label>
        </div>
        <div className="mt-4">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Platform</span>
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PLATFORMS.map(p => (
              <button
                key={p.key}
                type="button"
                onClick={() => setPlatformKey(p.key)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                  platformKey === p.key
                    ? 'bg-cyan-500/15 border border-cyan-500/60 text-cyan-200'
                    : 'bg-gray-900 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'
                }`}
              >
                <div className="font-semibold">{p.name}</div>
                <div className="text-[10px] opacity-70 mt-0.5">{p.hint}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Verdict */}
      {askNum > 0 && offerNum > 0 && (
        <div className={`rounded-2xl p-6 bg-gradient-to-br ${math.verdict.gradient} text-white shadow-lg`}>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-bold uppercase tracking-widest bg-black/25 px-2.5 py-1 rounded-full">
              Verdict
            </span>
            <span className="text-xs font-medium bg-black/25 px-2.5 py-1 rounded-full">
              Offer is {math.offerPctOfAsk.toFixed(0)}% of ask
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black leading-tight">{math.verdict.label}</h3>
          <p className="mt-2 text-sm sm:text-base text-white/90 max-w-3xl leading-relaxed">
            {math.verdict.rationale}
          </p>
        </div>
      )}

      {/* Proceeds breakdown */}
      {askNum > 0 && offerNum > 0 && (
        <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Net Proceeds Breakdown</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-4">
              <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">If You Accept</div>
              <div className="text-2xl font-black text-white mb-1">{fmt(math.netAtOffer)}</div>
              <div className="text-xs text-gray-400">
                Profit {fmt(math.profitAtOffer)} ({math.marginAtOffer.toFixed(0)}%)
              </div>
              <div className="text-[11px] text-gray-500 mt-2">
                {fmt(offerNum)} sale − {fmt(offerNum * platform.feePct / 100 + platform.fixedFee)} {platform.name} fees
              </div>
            </div>
            <div className="bg-gray-900/60 border border-amber-500/40 rounded-xl p-4">
              <div className="text-xs text-amber-400 uppercase tracking-wide font-semibold mb-1">If You Counter</div>
              <div className="text-2xl font-black text-white mb-1">{fmt(math.netAtCounter)}</div>
              <div className="text-xs text-gray-400">
                Profit {fmt(math.profitAtCounter)} ({basisNum > 0 ? ((math.profitAtCounter / basisNum) * 100).toFixed(0) : 0}%)
              </div>
              <div className="text-[11px] text-gray-500 mt-2">
                Counter {fmt(math.counterPrice)} &middot; midpoint-or-93% rule
              </div>
            </div>
            <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-4">
              <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">If Asking Holds</div>
              <div className="text-2xl font-black text-white mb-1">{fmt(math.netAtAsk)}</div>
              <div className="text-xs text-gray-400">
                Profit {fmt(math.profitAtAsk)} ({math.marginAtAsk.toFixed(0)}%)
              </div>
              <div className="text-[11px] text-gray-500 mt-2">
                {fmt(askNum)} sale − {fmt(askNum * platform.feePct / 100 + platform.fixedFee)} {platform.name} fees
              </div>
            </div>
          </div>

          {/* Time-pressure bar */}
          <div className="mt-5">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-gray-500 uppercase tracking-wide font-semibold">Listing Age Pressure</span>
              <span className="text-gray-400">{daysNum} days listed</span>
            </div>
            <div className="h-2 bg-gray-900 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  daysNum < 14 ? 'bg-emerald-500' : daysNum < 30 ? 'bg-yellow-500' : daysNum < 60 ? 'bg-orange-500' : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(100, (daysNum / 60) * 100)}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-gray-500 leading-relaxed">
              {daysNum < 14 && 'Fresh listing — you have leverage. Counter hard, buyer is probably seeing real comps.'}
              {daysNum >= 14 && daysNum < 30 && 'Mid-cycle — buyer knows the card\'s sat for a bit. Still room to counter.'}
              {daysNum >= 30 && daysNum < 60 && 'Listing is stale. eBay search rank is decaying. Take a strong offer.'}
              {daysNum >= 60 && 'Deep stale zone. Every week hurts search rank. Accept anything that clears cost basis.'}
            </div>
          </div>
        </div>
      )}

      {/* Scripts */}
      {askNum > 0 && offerNum > 0 && (
        <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-2">Ready-to-Send {math.verdict.action === 'ACCEPT' ? 'Acceptance' : math.verdict.action === 'REJECT' ? 'Decline' : 'Counter'} Scripts</h2>
          <p className="text-xs text-gray-500 mb-4">Tap any script to copy. Paste into eBay Messages, Whatnot DMs, or your platform of choice.</p>
          <div className="space-y-3">
            {scripts.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => copyScript(s.body, i)}
                className="w-full text-left bg-gray-900/60 border border-gray-700 hover:border-cyan-500/50 rounded-xl p-4 transition-colors group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">{s.title}</span>
                  <span className="text-[11px] text-gray-500 group-hover:text-cyan-400">
                    {copiedIdx === i ? '✓ Copied' : 'Tap to copy'}
                  </span>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">{s.body}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tactic notes */}
      <div className="bg-gradient-to-br from-cyan-950/40 to-teal-950/40 border border-cyan-800/30 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-3">Best Offer Tactics</h2>
        <ul className="space-y-2 text-sm text-gray-300">
          <li className="flex gap-2"><span className="text-cyan-400">•</span><span><strong className="text-white">Never end counter in a round number.</strong> $97 reads as precise; $100 reads as bluff. Same effort, better close rate.</span></li>
          <li className="flex gap-2"><span className="text-cyan-400">•</span><span><strong className="text-white">Respond within 4 hours.</strong> Best Offers expire in 48h but buyer enthusiasm expires faster. Even a counter signals engagement.</span></li>
          <li className="flex gap-2"><span className="text-cyan-400">•</span><span><strong className="text-white">70% of successful deals require 2+ counter rounds.</strong> Your first counter isn&apos;t the final number — leave room.</span></li>
          <li className="flex gap-2"><span className="text-cyan-400">•</span><span><strong className="text-white">Auto-decline is reserved for insultingly low.</strong> Countering keeps the buyer engaged on your other listings; outright decline loses the relationship.</span></li>
          <li className="flex gap-2"><span className="text-cyan-400">•</span><span><strong className="text-white">Bundle sweetener beats raw price cut.</strong> &quot;Add another card and I&apos;ll knock 5% off the total&quot; often closes faster than pure counter.</span></li>
        </ul>
      </div>
    </div>
  );
}
