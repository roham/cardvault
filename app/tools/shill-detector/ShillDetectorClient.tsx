'use client';

import { useMemo, useState } from 'react';

type Platform = 'ebay' | 'whatnot' | 'myslabs' | 'fb-auction' | 'goldin' | 'heritage' | 'pwcc' | 'ig-live' | 'other';
type BidderAge = 'new-week' | 'new-month' | 'under-year' | 'established' | 'veteran' | 'unknown';
type TopShare = 'under-20' | '20-40' | '40-60' | '60-80' | 'over-80';
type BidTiming = 'steady-spread' | 'cluster-early' | 'cluster-mid' | 'cluster-late' | 'snipe-only';
type ReservePattern = 'no-reserve' | 'natural' | 'step-to-reserve' | 'over-reserve-nudges' | 'unknown';
type FeedbackVisibility = 'public' | 'private' | 'hidden' | 'zero';
type CrossListing = 'none-seen' | 'one-match' | 'two-three-matches' | 'four-plus-matches' | 'unknown';
type Retractions = 'none' | 'one' | 'two-three' | 'four-plus' | 'unknown';
type PriceVsFmv = 'under-fmv' | 'near-fmv' | 'slightly-over' | 'well-over-fmv' | 'anomaly';

const PLATFORM_META: Record<Platform, { label: string; risk: number; note: string }> = {
  'ebay': { label: 'eBay auction', risk: 0, note: 'eBay formally bans shill bidding and penalizes proven cases. Detection is algorithmic but slow.' },
  'whatnot': { label: 'Whatnot live auction', risk: 4, note: 'Live format. Bids happen fast. Shill accounts can drive numbers before real buyers catch up.' },
  'myslabs': { label: 'MySlabs timed auction', risk: 3, note: 'Smaller marketplace. Community is tight but enforcement is informal.' },
  'fb-auction': { label: 'Facebook group auction', risk: 14, note: 'Zero structural enforcement. Admin-moderated at best. Easy for seller accounts to place bumps.' },
  'goldin': { label: 'Goldin (public house)', risk: -6, note: 'Reputable auction house with real staff and floor oversight. Shill risk is institutional, not casual.' },
  'heritage': { label: 'Heritage Auctions', risk: -8, note: 'Major legacy house. Shill risk at minimum. They have fiduciary liability.' },
  'pwcc': { label: 'PWCC marketplace', risk: -2, note: 'Marketplace style. House oversight but third-party consignors can shill their own lots.' },
  'ig-live': { label: 'Instagram Live bidding', risk: 16, note: 'No marketplace infrastructure. Host-controlled. Easiest venue for bid manipulation.' },
  'other': { label: 'Other / unknown venue', risk: 5, note: 'Baseline. When you cannot verify the venue, assume moderate exposure.' },
};

const BIDDER_AGE_META: Record<BidderAge, { label: string; risk: number }> = {
  'new-week': { label: 'New account (<7 days old)', risk: 22 },
  'new-month': { label: 'New account (7-30 days)', risk: 14 },
  'under-year': { label: 'Under a year old', risk: 6 },
  'established': { label: '1-3 years old, real history', risk: -2 },
  'veteran': { label: '3+ years with steady activity', risk: -6 },
  'unknown': { label: 'Cannot see account age', risk: 8 },
};

const TOP_SHARE_META: Record<TopShare, { label: string; risk: number }> = {
  'under-20': { label: 'Top bidder placed <20% of bids', risk: -6 },
  '20-40': { label: 'Top bidder placed 20-40% of bids', risk: -2 },
  '40-60': { label: 'Top bidder placed 40-60% of bids', risk: 4 },
  '60-80': { label: 'Top bidder placed 60-80% of bids', risk: 14 },
  'over-80': { label: 'Top bidder placed 80%+ of bids', risk: 22 },
};

const TIMING_META: Record<BidTiming, { label: string; risk: number }> = {
  'steady-spread': { label: 'Bids spread steadily across auction window', risk: -3 },
  'cluster-early': { label: 'Heavy cluster early, then quiet', risk: 8 },
  'cluster-mid': { label: 'Mid-auction bump cluster (suspicious)', risk: 10 },
  'cluster-late': { label: 'Heavy cluster in last 10% of auction', risk: 4 },
  'snipe-only': { label: 'One snipe at the end, otherwise dead', risk: -2 },
};

const RESERVE_META: Record<ReservePattern, { label: string; risk: number }> = {
  'no-reserve': { label: 'No reserve listed', risk: -1 },
  'natural': { label: 'Reserve met organically in natural bidding', risk: -3 },
  'step-to-reserve': { label: 'Bids step conveniently up to reserve', risk: 12 },
  'over-reserve-nudges': { label: 'Tiny nudge bids above reserve by same account', risk: 16 },
  'unknown': { label: 'Reserve behavior unclear', risk: 2 },
};

const FEEDBACK_VIS_META: Record<FeedbackVisibility, { label: string; risk: number }> = {
  'public': { label: 'Top bidder has public feedback + history', risk: -4 },
  'private': { label: 'Top bidder feedback is PRIVATE', risk: 16 },
  'hidden': { label: 'Auction has ALL bidder IDs hidden', risk: 10 },
  'zero': { label: 'Top bidder shows 0 feedback', risk: 14 },
};

const CROSS_META: Record<CrossListing, { label: string; risk: number }> = {
  'none-seen': { label: 'No cross-listing pattern observed', risk: -2 },
  'one-match': { label: 'Top bidder bid on 1 other of seller\u2019s listings', risk: 6 },
  'two-three-matches': { label: 'Top bidder bid on 2-3 of seller\u2019s listings', risk: 14 },
  'four-plus-matches': { label: 'Top bidder bid on 4+ of seller\u2019s listings', risk: 22 },
  'unknown': { label: 'Cannot check cross-listing history', risk: 4 },
};

const RETRACTIONS_META: Record<Retractions, { label: string; risk: number }> = {
  'none': { label: 'No retracted bids', risk: -2 },
  'one': { label: '1 retracted bid by top or second bidder', risk: 6 },
  'two-three': { label: '2-3 retractions on this auction', risk: 14 },
  'four-plus': { label: '4+ retractions — red flag pattern', risk: 20 },
  'unknown': { label: 'Retraction history not visible', risk: 3 },
};

const PRICE_META: Record<PriceVsFmv, { label: string; risk: number }> = {
  'under-fmv': { label: 'Current price still well under FMV', risk: -2 },
  'near-fmv': { label: 'Current price near FMV', risk: 0 },
  'slightly-over': { label: 'Slightly above FMV (1-10%)', risk: 4 },
  'well-over-fmv': { label: 'Well above FMV (10-30%)', risk: 10 },
  'anomaly': { label: 'Well above FMV AND sparse real bids', risk: 18 },
};

type Flag = { label: string; risk: number };

const TOGGLE_FLAGS: Flag[] = [
  { label: 'Seller has a history of canceled high bids', risk: 10 },
  { label: 'Seller and top bidder share a location or IP pattern', risk: 18 },
  { label: 'Second bidder is also a low-feedback account', risk: 8 },
  { label: 'Auction relisted after previous sale was canceled', risk: 7 },
  { label: 'Top bidder only active during this seller\u2019s live auctions', risk: 14 },
  { label: 'Seller is a known-case flagged account (community or forum reports)', risk: 22 },
];

type VerdictTier = 'clean' | 'normal' | 'suspicious' | 'likely';

const VERDICT: Record<VerdictTier, { label: string; color: string; ring: string; bg: string; blurb: string }> = {
  'clean': {
    label: 'CLEAN',
    color: 'text-emerald-400',
    ring: 'ring-emerald-500/50',
    bg: 'bg-emerald-950/50',
    blurb: 'No meaningful shill signal. Bid as you would with any normal auction.',
  },
  'normal': {
    label: 'NORMAL',
    color: 'text-yellow-300',
    ring: 'ring-yellow-500/50',
    bg: 'bg-yellow-950/40',
    blurb: 'Mixed signal, inside normal auction noise. Stay at or below your ceiling.',
  },
  'suspicious': {
    label: 'SUSPICIOUS',
    color: 'text-amber-400',
    ring: 'ring-amber-500/60',
    bg: 'bg-amber-950/50',
    blurb: 'Pattern suggests artificial bid pressure. Cap your bid at your independent FMV \u2014 do not chase the count.',
  },
  'likely': {
    label: 'LIKELY SHILL',
    color: 'text-red-400',
    ring: 'ring-red-500/60',
    bg: 'bg-red-950/50',
    blurb: 'Strong shill profile. Walk away or report the pattern to the platform before paying.',
  },
};

function verdictFromScore(score: number): VerdictTier {
  if (score <= 22) return 'clean';
  if (score <= 48) return 'normal';
  if (score <= 72) return 'suspicious';
  return 'likely';
}

export default function ShillDetectorClient() {
  const [platform, setPlatform] = useState<Platform>('ebay');
  const [bidderAge, setBidderAge] = useState<BidderAge>('established');
  const [topShare, setTopShare] = useState<TopShare>('40-60');
  const [timing, setTiming] = useState<BidTiming>('steady-spread');
  const [reserve, setReserve] = useState<ReservePattern>('natural');
  const [feedbackVis, setFeedbackVis] = useState<FeedbackVisibility>('public');
  const [cross, setCross] = useState<CrossListing>('none-seen');
  const [retractions, setRetractions] = useState<Retractions>('none');
  const [priceVsFmv, setPriceVsFmv] = useState<PriceVsFmv>('near-fmv');
  const [flags, setFlags] = useState<boolean[]>(new Array(TOGGLE_FLAGS.length).fill(false));
  const [copied, setCopied] = useState(false);

  const { score, contributions } = useMemo(() => {
    const parts: { label: string; delta: number }[] = [];
    const p = PLATFORM_META[platform]; parts.push({ label: `Venue: ${p.label}`, delta: p.risk });
    const a = BIDDER_AGE_META[bidderAge]; parts.push({ label: `Top bidder age: ${a.label}`, delta: a.risk });
    const ts = TOP_SHARE_META[topShare]; parts.push({ label: ts.label, delta: ts.risk });
    const t = TIMING_META[timing]; parts.push({ label: `Timing: ${t.label}`, delta: t.risk });
    const r = RESERVE_META[reserve]; parts.push({ label: `Reserve: ${r.label}`, delta: r.risk });
    const fv = FEEDBACK_VIS_META[feedbackVis]; parts.push({ label: fv.label, delta: fv.risk });
    const cr = CROSS_META[cross]; parts.push({ label: cr.label, delta: cr.risk });
    const rt = RETRACTIONS_META[retractions]; parts.push({ label: rt.label, delta: rt.risk });
    const pm = PRICE_META[priceVsFmv]; parts.push({ label: `Price: ${pm.label}`, delta: pm.risk });
    flags.forEach((on, idx) => {
      if (on) parts.push({ label: TOGGLE_FLAGS[idx].label, delta: TOGGLE_FLAGS[idx].risk });
    });
    const raw = parts.reduce((sum, c) => sum + c.delta, 0);
    // baseline 18 — most auctions have some noise. Clamp 0-100.
    const clamped = Math.max(0, Math.min(100, 18 + raw));
    return { score: clamped, contributions: parts.sort((x, y) => y.delta - x.delta) };
  }, [platform, bidderAge, topShare, timing, reserve, feedbackVis, cross, retractions, priceVsFmv, flags]);

  const tier = verdictFromScore(score);
  const v = VERDICT[tier];

  const recs = useMemo(() => {
    const out: string[] = [];
    if (tier === 'likely') {
      out.push('Do not place another bid. Walk away from the listing.');
      out.push('Report the auction to the platform with timestamps and screenshots of the bid-retraction or cross-listing pattern.');
    }
    if (tier === 'suspicious' || tier === 'likely') {
      out.push('Cap your bid at your independent fair market value. Do not chase the live count \u2014 inflated counts signal a shill ladder, not real demand.');
    }
    if (cross === 'two-three-matches' || cross === 'four-plus-matches') {
      out.push('Search the seller\u2019s ended listings. If the same bidder keeps showing up as runner-up or winner and returns it, that is a classic shill rotation.');
    }
    if (feedbackVis === 'private' || feedbackVis === 'zero') {
      out.push('Private / zero-feedback top bidder is the single clearest shill signal on eBay. Treat it as a veto until resolved.');
    }
    if (retractions === 'two-three' || retractions === 'four-plus') {
      out.push('Multiple retractions mean bidders are backing off proxy highs \u2014 usually because they fear a shill ladder. Follow the crowd.');
    }
    if (reserve === 'step-to-reserve' || reserve === 'over-reserve-nudges') {
      out.push('Reserve-nudge pattern is a seller\u2019s signature. If your bid has not been beaten by a real buyer, let it sit.');
    }
    if (platform === 'ebay' && tier !== 'clean') {
      out.push('eBay\u2019s Unpaid Item Protection does not cover shill. Use Report Listing \u2192 Fraudulent Activity \u2192 Shill Bidding.');
    }
    if (platform === 'fb-auction' || platform === 'ig-live') {
      out.push('Unmoderated venues have no recourse. Only pay what you would pay to a stranger in cash.');
    }
    if (tier === 'clean') {
      out.push('Signals look clean. Bid your ceiling once and do not re-bid if outbid \u2014 that is still the defense against any missed signal.');
    }
    return out;
  }, [tier, cross, feedbackVis, retractions, reserve, platform]);

  const report = useMemo(() => {
    const top = contributions.filter(c => c.delta > 0).slice(0, 4);
    const pros = contributions.filter(c => c.delta < 0).slice(0, 2);
    const lines: string[] = [];
    lines.push(`Shill Risk: ${score}/100 \u2014 ${v.label}`);
    lines.push('');
    if (top.length) {
      lines.push('Top red flags:');
      top.forEach(c => lines.push(`  + ${c.delta >= 0 ? '+' : ''}${c.delta}  ${c.label}`));
    }
    if (pros.length) {
      lines.push('');
      lines.push('Mitigating factors:');
      pros.forEach(c => lines.push(`  ${c.delta}  ${c.label}`));
    }
    lines.push('');
    lines.push('Checked with CardVault Shill Bid Detector');
    lines.push('https://cardvault-two.vercel.app/tools/shill-detector');
    return lines.join('\n');
  }, [contributions, score, v.label]);

  function copyReport() {
    if (typeof navigator === 'undefined') return;
    navigator.clipboard?.writeText(report).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  function reset() {
    setPlatform('ebay');
    setBidderAge('established');
    setTopShare('40-60');
    setTiming('steady-spread');
    setReserve('natural');
    setFeedbackVis('public');
    setCross('none-seen');
    setRetractions('none');
    setPriceVsFmv('near-fmv');
    setFlags(new Array(TOGGLE_FLAGS.length).fill(false));
  }

  return (
    <div className="space-y-6">
      {/* Result card */}
      <div className={`rounded-2xl ring-1 ${v.ring} ${v.bg} p-6`}>
        <div className="flex flex-wrap items-center gap-4 justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">Shill Risk Score</div>
            <div className="flex items-end gap-3">
              <div className={`text-5xl sm:text-6xl font-black ${v.color}`}>{score}</div>
              <div className="text-gray-500 pb-2 text-sm">/ 100</div>
            </div>
          </div>
          <div className={`${v.color} font-black text-2xl sm:text-3xl tracking-wide`}>{v.label}</div>
        </div>
        <div className="mt-3 text-gray-300 text-sm max-w-3xl">{v.blurb}</div>
        <div className="mt-5 h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full ${tier === 'clean' ? 'bg-emerald-500' : tier === 'normal' ? 'bg-yellow-400' : tier === 'suspicious' ? 'bg-amber-500' : 'bg-red-500'}`}
            style={{ width: `${score}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-gray-500 uppercase tracking-wider">
          <span>Clean</span><span>Normal</span><span>Suspicious</span><span>Likely Shill</span>
        </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Venue">
          <select value={platform} onChange={e => setPlatform(e.target.value as Platform)} className={selectCls}>
            {Object.keys(PLATFORM_META).map(k => (
              <option key={k} value={k}>{PLATFORM_META[k as Platform].label}</option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">{PLATFORM_META[platform].note}</p>
        </Field>
        <Field label="Top bidder account age">
          <select value={bidderAge} onChange={e => setBidderAge(e.target.value as BidderAge)} className={selectCls}>
            {Object.keys(BIDDER_AGE_META).map(k => (
              <option key={k} value={k}>{BIDDER_AGE_META[k as BidderAge].label}</option>
            ))}
          </select>
        </Field>
        <Field label="Top bidder share of bids">
          <select value={topShare} onChange={e => setTopShare(e.target.value as TopShare)} className={selectCls}>
            {Object.keys(TOP_SHARE_META).map(k => (
              <option key={k} value={k}>{TOP_SHARE_META[k as TopShare].label}</option>
            ))}
          </select>
        </Field>
        <Field label="Bid timing pattern">
          <select value={timing} onChange={e => setTiming(e.target.value as BidTiming)} className={selectCls}>
            {Object.keys(TIMING_META).map(k => (
              <option key={k} value={k}>{TIMING_META[k as BidTiming].label}</option>
            ))}
          </select>
        </Field>
        <Field label="Reserve behavior">
          <select value={reserve} onChange={e => setReserve(e.target.value as ReservePattern)} className={selectCls}>
            {Object.keys(RESERVE_META).map(k => (
              <option key={k} value={k}>{RESERVE_META[k as ReservePattern].label}</option>
            ))}
          </select>
        </Field>
        <Field label="Top bidder feedback visibility">
          <select value={feedbackVis} onChange={e => setFeedbackVis(e.target.value as FeedbackVisibility)} className={selectCls}>
            {Object.keys(FEEDBACK_VIS_META).map(k => (
              <option key={k} value={k}>{FEEDBACK_VIS_META[k as FeedbackVisibility].label}</option>
            ))}
          </select>
        </Field>
        <Field label="Cross-listing: same bidder on seller's other auctions">
          <select value={cross} onChange={e => setCross(e.target.value as CrossListing)} className={selectCls}>
            {Object.keys(CROSS_META).map(k => (
              <option key={k} value={k}>{CROSS_META[k as CrossListing].label}</option>
            ))}
          </select>
        </Field>
        <Field label="Bid retraction history on this auction">
          <select value={retractions} onChange={e => setRetractions(e.target.value as Retractions)} className={selectCls}>
            {Object.keys(RETRACTIONS_META).map(k => (
              <option key={k} value={k}>{RETRACTIONS_META[k as Retractions].label}</option>
            ))}
          </select>
        </Field>
        <Field label="Price vs FMV">
          <select value={priceVsFmv} onChange={e => setPriceVsFmv(e.target.value as PriceVsFmv)} className={selectCls}>
            {Object.keys(PRICE_META).map(k => (
              <option key={k} value={k}>{PRICE_META[k as PriceVsFmv].label}</option>
            ))}
          </select>
        </Field>
      </div>

      {/* Toggle flags */}
      <div className="rounded-xl bg-gray-900/60 border border-gray-800 p-4">
        <div className="text-sm font-semibold text-yellow-300 mb-3">Additional red-flag toggles</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {TOGGLE_FLAGS.map((f, i) => (
            <label key={i} className={`flex items-start gap-2 text-sm rounded-lg p-2 cursor-pointer select-none transition-colors ${flags[i] ? 'bg-red-950/40 text-gray-100 ring-1 ring-red-900/60' : 'hover:bg-gray-800/60 text-gray-300'}`}>
              <input
                type="checkbox"
                checked={flags[i]}
                onChange={() => setFlags(prev => prev.map((v, j) => j === i ? !v : v))}
                className="mt-0.5 accent-red-500"
              />
              <span className="flex-1">{f.label}</span>
              <span className="text-xs text-red-300 font-mono">+{f.risk}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Top contributing factors */}
      <div className="rounded-xl bg-gray-900/60 border border-gray-800 p-4">
        <div className="text-sm font-semibold text-yellow-300 mb-3">Contribution breakdown</div>
        <div className="space-y-1">
          {contributions.map((c, i) => (
            <div key={i} className="flex items-center justify-between text-sm py-1 border-b border-gray-800/60 last:border-0">
              <span className="text-gray-300">{c.label}</span>
              <span className={`font-mono text-xs ${c.delta > 0 ? 'text-red-400' : c.delta < 0 ? 'text-emerald-400' : 'text-gray-500'}`}>
                {c.delta >= 0 ? '+' : ''}{c.delta}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between text-sm pt-2 text-gray-400">
            <span>Baseline</span>
            <span className="font-mono text-xs">+18</span>
          </div>
          <div className="flex items-center justify-between text-sm pt-2 font-semibold text-white border-t border-gray-800">
            <span>Total (clamped 0-100)</span>
            <span className="font-mono">{score}</span>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="rounded-xl bg-gray-900/60 border border-gray-800 p-4">
        <div className="text-sm font-semibold text-yellow-300 mb-3">What to do next</div>
        <ul className="space-y-2">
          {recs.map((r, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
              <span className="text-yellow-400 mt-0.5">→</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button onClick={copyReport} className="px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-semibold text-sm transition-colors">
          {copied ? 'Copied!' : 'Copy report'}
        </button>
        <button onClick={reset} className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium text-sm">
          Reset
        </button>
      </div>

      <div className="text-xs text-gray-500 leading-relaxed">
        Not legal or financial advice. This tool summarizes publicly observable bidding signals into a heuristic score. Proof of shill bidding requires platform-level audit of IP, account linkage, and bid ledgers. Report suspected shill activity to the platform rather than pursuing the listing.
      </div>
    </div>
  );
}

const selectCls = 'w-full rounded-lg bg-gray-900 border border-gray-700 text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">{label}</div>
      {children}
    </label>
  );
}
