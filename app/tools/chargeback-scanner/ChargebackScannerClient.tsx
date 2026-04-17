'use client';

import { useMemo, useState } from 'react';

type Platform = 'ebay-managed' | 'paypal-g-s' | 'paypal-ff' | 'venmo-business' | 'venmo-ff' | 'zelle' | 'cashapp' | 'wire' | 'stripe-direct' | 'whatnot' | 'check-or-cash';
type BuyerAge = 'new-week' | 'new-month' | 'under-year' | 'established' | 'veteran' | 'unknown';
type FeedbackRep = 'verified-power' | '1000-plus' | '100-999' | '10-99' | '1-9' | 'zero' | 'hidden' | 'unknown';
type CardValue = 'under-100' | '100-499' | '500-1499' | '1500-4999' | '5000-14999' | '15000-49999' | 'over-50k';
type OffPlatform = 'no' | 'asked-once' | 'asked-repeatedly' | 'insisting';
type Photos = 'full-macro-disclosed' | 'multi-angle' | 'stock-only' | 'few' | 'refused';
type Shipping = 'tracked-insured-sig' | 'tracked-insured' | 'tracked-only' | 'untracked' | 'direct-delivery';
type International = 'domestic' | 'canada-uk-au' | 'eu' | 'asia' | 'other-international';
type Returns = 'no-returns' | '3-day' | '7-day-sig' | '14-day' | '30-day-full';
type PriorDisputes = 'none-known' | 'one-old' | 'one-recent' | 'multiple' | 'pattern-chargebacker' | 'unknown';

const PLATFORM_META: Record<Platform, { label: string; risk: number; note: string }> = {
  'ebay-managed': { label: 'eBay Managed Payments', risk: -4, note: 'eBay\u2019s Seller Protection covers authenticity and INR claims with tracking + signature on cards over $750. Platform has real policy.' },
  'paypal-g-s': { label: 'PayPal Goods & Services', risk: 0, note: 'Standard seller protection IF you ship with signature + tracking to the confirmed address. Disputes tilt buyer-side but are resolvable.' },
  'paypal-ff': { label: 'PayPal Friends & Family', risk: 26, note: 'Zero seller protection on F&F. Buyer can still file a credit-card chargeback through their bank even after PayPal clears.' },
  'venmo-business': { label: 'Venmo Business Profile', risk: 6, note: 'Purchase Protection covers eligible business transactions with limits. Cleaner than F&F but thinner than eBay/PayPal G&S.' },
  'venmo-ff': { label: 'Venmo Friends & Family', risk: 24, note: 'Zero protection. Buyer bank chargeback is still possible through the underlying card.' },
  'zelle': { label: 'Zelle', risk: 18, note: 'Zero dispute process. Bank will occasionally recover funds for documented fraud but never for "not as described".' },
  'cashapp': { label: 'Cash App', risk: 20, note: 'Limited dispute process. Treats most card transactions as informal P2P.' },
  'wire': { label: 'Wire transfer', risk: 14, note: 'No chargeback possible once cleared. However, wires can be reversed by the sending bank for up to 48 hours and are a magnet for social-engineering fraud.' },
  'stripe-direct': { label: 'Stripe direct (invoice)', risk: 8, note: 'Standard credit-card chargeback exposure. Strong with tracking + signature but dispute rate is roughly 0.6% on card transactions.' },
  'whatnot': { label: 'Whatnot live', risk: 6, note: 'Whatnot dispute process exists but inconsistent enforcement for items over $1K. Live-chat evidence helps.' },
  'check-or-cash': { label: 'Check or cash (in person)', risk: -8, note: 'In-person cash is bulletproof once delivered. Checks bounce — wait for clearance.' },
};

const BUYER_AGE_META: Record<BuyerAge, { label: string; risk: number }> = {
  'new-week': { label: 'New account (<7 days)', risk: 18 },
  'new-month': { label: 'New account (7-30 days)', risk: 12 },
  'under-year': { label: 'Under a year old', risk: 5 },
  'established': { label: '1-3 years old', risk: -2 },
  'veteran': { label: '3+ years with consistent activity', risk: -5 },
  'unknown': { label: 'Cannot see account age', risk: 7 },
};

const FEEDBACK_META: Record<FeedbackRep, { label: string; risk: number }> = {
  'verified-power': { label: 'Power-Seller / verified buyer / 10K+ 100% fb', risk: -12 },
  '1000-plus': { label: '1,000+ feedback, 99%+ positive', risk: -7 },
  '100-999': { label: '100-999 feedback', risk: -1 },
  '10-99': { label: '10-99 feedback', risk: 6 },
  '1-9': { label: '1-9 feedback', risk: 11 },
  'zero': { label: '0 feedback', risk: 14 },
  'hidden': { label: 'Feedback PRIVATE / hidden', risk: 16 },
  'unknown': { label: 'Unknown', risk: 8 },
};

const VALUE_META: Record<CardValue, { label: string; risk: number }> = {
  'under-100': { label: 'Under $100', risk: -4 },
  '100-499': { label: '$100 - $499', risk: 0 },
  '500-1499': { label: '$500 - $1,499', risk: 5 },
  '1500-4999': { label: '$1,500 - $4,999', risk: 10 },
  '5000-14999': { label: '$5,000 - $14,999', risk: 16 },
  '15000-49999': { label: '$15,000 - $49,999', risk: 22 },
  'over-50k': { label: '$50,000 or more', risk: 28 },
};

const OFFPLAT_META: Record<OffPlatform, { label: string; risk: number }> = {
  'no': { label: 'Buyer stayed on-platform', risk: -2 },
  'asked-once': { label: 'Asked once to DM / text', risk: 4 },
  'asked-repeatedly': { label: 'Asked repeatedly', risk: 14 },
  'insisting': { label: 'Insisting on off-platform payment', risk: 22 },
};

const PHOTO_META: Record<Photos, { label: string; risk: number }> = {
  'full-macro-disclosed': { label: 'Listing has full macro photos, all defects disclosed', risk: -5 },
  'multi-angle': { label: 'Multi-angle photos, major defects noted', risk: -1 },
  'stock-only': { label: 'Stock photos only (no actual card photos)', risk: 10 },
  'few': { label: 'Only 1-2 photos, no detail', risk: 6 },
  'refused': { label: 'Seller refused buyer\u2019s request for more photos', risk: 12 },
};

const SHIPPING_META: Record<Shipping, { label: string; risk: number }> = {
  'tracked-insured-sig': { label: 'Tracked + insured + signature required', risk: -8 },
  'tracked-insured': { label: 'Tracked + insured, no signature', risk: -2 },
  'tracked-only': { label: 'Tracked only, not insured', risk: 8 },
  'untracked': { label: 'Untracked (PWE / standard mail)', risk: 20 },
  'direct-delivery': { label: 'In-person hand-off / local pickup', risk: -6 },
};

const INTL_META: Record<International, { label: string; risk: number }> = {
  'domestic': { label: 'Domestic (same country)', risk: -3 },
  'canada-uk-au': { label: 'Canada / UK / Australia', risk: 4 },
  'eu': { label: 'EU', risk: 6 },
  'asia': { label: 'Asia (Japan / Hong Kong / Singapore)', risk: 7 },
  'other-international': { label: 'Other international (LATAM / Africa / CIS)', risk: 14 },
};

const RETURNS_META: Record<Returns, { label: string; risk: number }> = {
  'no-returns': { label: 'No returns stated (may not survive a dispute)', risk: 8 },
  '3-day': { label: '3-day return window, signature req.', risk: -1 },
  '7-day-sig': { label: '7-day returns, sig-confirmation required', risk: -3 },
  '14-day': { label: '14-day returns', risk: 0 },
  '30-day-full': { label: '30-day full returns', risk: -2 },
};

const PRIOR_META: Record<PriorDisputes, { label: string; risk: number }> = {
  'none-known': { label: 'No prior disputes visible', risk: -3 },
  'one-old': { label: 'One dispute 12+ months ago', risk: 3 },
  'one-recent': { label: 'One dispute in last 6 months', risk: 10 },
  'multiple': { label: 'Multiple disputes on record', risk: 18 },
  'pattern-chargebacker': { label: 'Community-flagged pattern chargebacker', risk: 28 },
  'unknown': { label: 'Cannot check dispute history', risk: 5 },
};

const TOGGLE_FLAGS: { label: string; risk: number }[] = [
  { label: 'Buyer name, address, or card info does not match PayPal/eBay registered details', risk: 22 },
  { label: 'Shipping address is a freight-forwarder or parcel locker', risk: 12 },
  { label: 'Buyer asked seller to mark package as "gift" or understate customs value', risk: 15 },
  { label: 'Same buyer has messaged from multiple accounts', risk: 16 },
  { label: 'Buyer is a known reseller flipping within 24 hours (inspection-dispute risk)', risk: 6 },
  { label: 'Buyer demanded seller sign a release or private contract instead of platform flow', risk: 10 },
];

type Tier = 'clean' | 'normal' | 'elevated' | 'high';

const VERDICT: Record<Tier, { label: string; color: string; ring: string; bg: string; blurb: string }> = {
  'clean': { label: 'CLEAN', color: 'text-emerald-400', ring: 'ring-emerald-500/50', bg: 'bg-emerald-950/50', blurb: 'Standard seller protection applies. Ship as scheduled with tracking + signature.' },
  'normal': { label: 'NORMAL', color: 'text-yellow-300', ring: 'ring-yellow-500/50', bg: 'bg-yellow-950/40', blurb: 'Typical hobby-transaction exposure. Follow the standard hardening checklist below.' },
  'elevated': { label: 'ELEVATED', color: 'text-orange-400', ring: 'ring-orange-500/60', bg: 'bg-orange-950/50', blurb: 'Pattern suggests chargeback exposure. Add every available protection or renegotiate terms.' },
  'high': { label: 'HIGH RISK', color: 'text-red-400', ring: 'ring-red-500/60', bg: 'bg-red-950/50', blurb: 'Stop. Require pre-ship changes: platform migration, additional photos/signatures, or refuse the sale.' },
};

function tierFromScore(s: number): Tier {
  if (s <= 20) return 'clean';
  if (s <= 45) return 'normal';
  if (s <= 70) return 'elevated';
  return 'high';
}

export default function ChargebackScannerClient() {
  const [platform, setPlatform] = useState<Platform>('ebay-managed');
  const [buyerAge, setBuyerAge] = useState<BuyerAge>('established');
  const [feedback, setFeedback] = useState<FeedbackRep>('100-999');
  const [value, setValue] = useState<CardValue>('500-1499');
  const [offPlat, setOffPlat] = useState<OffPlatform>('no');
  const [photos, setPhotos] = useState<Photos>('multi-angle');
  const [shipping, setShipping] = useState<Shipping>('tracked-insured');
  const [intl, setIntl] = useState<International>('domestic');
  const [returns, setReturns] = useState<Returns>('14-day');
  const [prior, setPrior] = useState<PriorDisputes>('unknown');
  const [flags, setFlags] = useState<boolean[]>(new Array(TOGGLE_FLAGS.length).fill(false));
  const [copied, setCopied] = useState(false);

  const { score, contributions } = useMemo(() => {
    const parts: { label: string; delta: number }[] = [];
    const push = (label: string, delta: number) => parts.push({ label, delta });
    push(`Platform: ${PLATFORM_META[platform].label}`, PLATFORM_META[platform].risk);
    push(`Buyer age: ${BUYER_AGE_META[buyerAge].label}`, BUYER_AGE_META[buyerAge].risk);
    push(`Feedback: ${FEEDBACK_META[feedback].label}`, FEEDBACK_META[feedback].risk);
    push(`Value: ${VALUE_META[value].label}`, VALUE_META[value].risk);
    push(`Off-platform: ${OFFPLAT_META[offPlat].label}`, OFFPLAT_META[offPlat].risk);
    push(`Photos: ${PHOTO_META[photos].label}`, PHOTO_META[photos].risk);
    push(`Shipping: ${SHIPPING_META[shipping].label}`, SHIPPING_META[shipping].risk);
    push(`Destination: ${INTL_META[intl].label}`, INTL_META[intl].risk);
    push(`Returns: ${RETURNS_META[returns].label}`, RETURNS_META[returns].risk);
    push(`Prior disputes: ${PRIOR_META[prior].label}`, PRIOR_META[prior].risk);
    flags.forEach((on, i) => { if (on) push(TOGGLE_FLAGS[i].label, TOGGLE_FLAGS[i].risk); });
    const raw = parts.reduce((s, c) => s + c.delta, 0);
    const clamped = Math.max(0, Math.min(100, 15 + raw));
    return { score: clamped, contributions: parts.sort((a, b) => b.delta - a.delta) };
  }, [platform, buyerAge, feedback, value, offPlat, photos, shipping, intl, returns, prior, flags]);

  const tier = tierFromScore(score);
  const v = VERDICT[tier];

  const recs = useMemo(() => {
    const out: string[] = [];
    if (tier === 'high') {
      out.push('Do not ship until payment platform and buyer profile are hardened. The risk/reward is negative at this level.');
      out.push('Offer the buyer a choice: migrate to eBay Managed or PayPal G&S with signature-required shipping, OR cancel and refund.');
    }
    if (tier === 'elevated' || tier === 'high') {
      out.push('Require signature confirmation at delivery. Ship USPS Registered, UPS Ground with declared value, or FedEx Ground signature required.');
      out.push('Take video of packing: 360-degree shots of the card, tracking label affixed, and the sealed package being handed to the carrier.');
    }
    if (platform === 'paypal-ff' || platform === 'venmo-ff' || platform === 'zelle') {
      out.push('The buyer\u2019s credit-card issuer can still file a chargeback even after funds clear on a P2P service. Migrate to Goods & Services or cancel.');
    }
    if (offPlat === 'asked-repeatedly' || offPlat === 'insisting') {
      out.push('Off-platform insistence is the #1 chargeback pre-signal. Refuse politely and state that the listing platform terms are non-negotiable for this item.');
    }
    if (value === 'over-50k' || value === '15000-49999') {
      out.push('Use a hobby-insured service (Hugh Wood, CIS, Collectibles Insurance Services) or an auction-house consignment to push the risk off-book entirely.');
    }
    if (feedback === 'hidden' || feedback === 'zero' || feedback === '1-9') {
      out.push('Low-history or hidden-feedback buyers are the single clearest chargeback tell. Require a ramp: ship after 7-day hold, demand a video unboxing on receipt.');
    }
    if (intl === 'other-international') {
      out.push('For non-major destinations, use DDP (Delivered Duty Paid) shipping with declared value and enforce a no-returns policy unless platform requires it.');
    }
    if (shipping === 'untracked') {
      out.push('Untracked shipping on any card over $25 is malpractice. If the buyer claims Item Not Received and you cannot prove delivery, you will lose every dispute.');
    }
    if (photos === 'stock-only' || photos === 'refused') {
      out.push('Relist with full macro photos of the actual card BEFORE shipping. Stock-photo listings are the most common "not as described" chargeback vector.');
    }
    if (tier === 'clean') {
      out.push('Everything looks good. Standard hardening still applies: tracking + signature + packing video, retain for 180 days post-ship.');
    }
    return out;
  }, [tier, platform, offPlat, value, feedback, intl, shipping, photos]);

  const report = useMemo(() => {
    const top = contributions.filter(c => c.delta > 0).slice(0, 4);
    const pros = contributions.filter(c => c.delta < 0).slice(0, 2);
    const lines: string[] = [];
    lines.push(`Chargeback Risk: ${score}/100 \u2014 ${v.label}`);
    lines.push('');
    if (top.length) {
      lines.push('Top risk factors:');
      top.forEach(c => lines.push(`  + ${c.delta >= 0 ? '+' : ''}${c.delta}  ${c.label}`));
    }
    if (pros.length) {
      lines.push('');
      lines.push('Mitigating factors:');
      pros.forEach(c => lines.push(`  ${c.delta}  ${c.label}`));
    }
    lines.push('');
    lines.push('Scored with CardVault Chargeback Risk Scanner');
    lines.push('https://cardvault-two.vercel.app/tools/chargeback-scanner');
    return lines.join('\n');
  }, [contributions, score, v.label]);

  function copyReport() {
    if (typeof navigator === 'undefined') return;
    navigator.clipboard?.writeText(report).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); });
  }

  function reset() {
    setPlatform('ebay-managed'); setBuyerAge('established'); setFeedback('100-999'); setValue('500-1499');
    setOffPlat('no'); setPhotos('multi-angle'); setShipping('tracked-insured'); setIntl('domestic');
    setReturns('14-day'); setPrior('unknown');
    setFlags(new Array(TOGGLE_FLAGS.length).fill(false));
  }

  return (
    <div className="space-y-6">
      <div className={`rounded-2xl ring-1 ${v.ring} ${v.bg} p-6`}>
        <div className="flex flex-wrap items-center gap-4 justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">Chargeback Risk Score</div>
            <div className="flex items-end gap-3">
              <div className={`text-5xl sm:text-6xl font-black ${v.color}`}>{score}</div>
              <div className="text-gray-500 pb-2 text-sm">/ 100</div>
            </div>
          </div>
          <div className={`${v.color} font-black text-2xl sm:text-3xl tracking-wide`}>{v.label}</div>
        </div>
        <div className="mt-3 text-gray-300 text-sm max-w-3xl">{v.blurb}</div>
        <div className="mt-5 h-2 bg-gray-800 rounded-full overflow-hidden">
          <div className={`h-full ${tier === 'clean' ? 'bg-emerald-500' : tier === 'normal' ? 'bg-yellow-400' : tier === 'elevated' ? 'bg-orange-500' : 'bg-red-500'}`} style={{ width: `${score}%` }} />
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-gray-500 uppercase tracking-wider">
          <span>Clean</span><span>Normal</span><span>Elevated</span><span>High</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Payment platform">
          <select value={platform} onChange={e => setPlatform(e.target.value as Platform)} className={sel}>
            {Object.entries(PLATFORM_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <p className="mt-1 text-xs text-gray-500">{PLATFORM_META[platform].note}</p>
        </Field>
        <Field label="Card / listing value">
          <select value={value} onChange={e => setValue(e.target.value as CardValue)} className={sel}>
            {Object.entries(VALUE_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </Field>
        <Field label="Buyer account age">
          <select value={buyerAge} onChange={e => setBuyerAge(e.target.value as BuyerAge)} className={sel}>
            {Object.entries(BUYER_AGE_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </Field>
        <Field label="Buyer feedback / reputation">
          <select value={feedback} onChange={e => setFeedback(e.target.value as FeedbackRep)} className={sel}>
            {Object.entries(FEEDBACK_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </Field>
        <Field label="Off-platform pressure">
          <select value={offPlat} onChange={e => setOffPlat(e.target.value as OffPlatform)} className={sel}>
            {Object.entries(OFFPLAT_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </Field>
        <Field label="Listing photo quality">
          <select value={photos} onChange={e => setPhotos(e.target.value as Photos)} className={sel}>
            {Object.entries(PHOTO_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </Field>
        <Field label="Shipping method">
          <select value={shipping} onChange={e => setShipping(e.target.value as Shipping)} className={sel}>
            {Object.entries(SHIPPING_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </Field>
        <Field label="Destination">
          <select value={intl} onChange={e => setIntl(e.target.value as International)} className={sel}>
            {Object.entries(INTL_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </Field>
        <Field label="Return policy">
          <select value={returns} onChange={e => setReturns(e.target.value as Returns)} className={sel}>
            {Object.entries(RETURNS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </Field>
        <Field label="Buyer prior-dispute history">
          <select value={prior} onChange={e => setPrior(e.target.value as PriorDisputes)} className={sel}>
            {Object.entries(PRIOR_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </Field>
      </div>

      <div className="rounded-xl bg-gray-900/60 border border-gray-800 p-4">
        <div className="text-sm font-semibold text-red-300 mb-3">Additional red-flag toggles</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {TOGGLE_FLAGS.map((f, i) => (
            <label key={i} className={`flex items-start gap-2 text-sm rounded-lg p-2 cursor-pointer select-none transition-colors ${flags[i] ? 'bg-red-950/40 text-gray-100 ring-1 ring-red-900/60' : 'hover:bg-gray-800/60 text-gray-300'}`}>
              <input type="checkbox" checked={flags[i]} onChange={() => setFlags(prev => prev.map((v, j) => j === i ? !v : v))} className="mt-0.5 accent-red-500" />
              <span className="flex-1">{f.label}</span>
              <span className="text-xs text-red-300 font-mono">+{f.risk}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-gray-900/60 border border-gray-800 p-4">
        <div className="text-sm font-semibold text-red-300 mb-3">Contribution breakdown</div>
        <div className="space-y-1 max-h-72 overflow-y-auto pr-2">
          {contributions.map((c, i) => (
            <div key={i} className="flex items-center justify-between text-sm py-1 border-b border-gray-800/60 last:border-0">
              <span className="text-gray-300">{c.label}</span>
              <span className={`font-mono text-xs ${c.delta > 0 ? 'text-red-400' : c.delta < 0 ? 'text-emerald-400' : 'text-gray-500'}`}>{c.delta >= 0 ? '+' : ''}{c.delta}</span>
            </div>
          ))}
          <div className="flex items-center justify-between text-sm pt-2 text-gray-400">
            <span>Baseline</span><span className="font-mono text-xs">+15</span>
          </div>
          <div className="flex items-center justify-between text-sm pt-2 font-semibold text-white border-t border-gray-800">
            <span>Total (clamped 0-100)</span><span className="font-mono">{score}</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-gray-900/60 border border-gray-800 p-4">
        <div className="text-sm font-semibold text-red-300 mb-3">What to do before you ship</div>
        <ul className="space-y-2">
          {recs.map((r, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
              <span className="text-red-400 mt-0.5">\u2192</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap gap-3">
        <button onClick={copyReport} className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-400 text-white font-semibold text-sm transition-colors">
          {copied ? 'Copied!' : 'Copy report'}
        </button>
        <button onClick={reset} className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium text-sm">Reset</button>
      </div>

      <div className="text-xs text-gray-500 leading-relaxed">
        Not legal or financial advice. Chargeback outcomes depend on the platform\u2019s specific seller-protection policy, the buyer\u2019s credit-card-issuer rules, your documentation, and the timing of the dispute filing. This scanner estimates risk from public-signal heuristics; it does not guarantee any outcome.
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">{label}</div>
      {children}
    </label>
  );
}

const sel = 'w-full rounded-lg bg-gray-900 border border-gray-700 text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500';
