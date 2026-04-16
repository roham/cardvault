'use client';

import { useMemo, useState } from 'react';

// ─── Hot Counterfeit Targets ─────────────────────────────────────────
// Real-world history: which card families have the worst counterfeit/altered-card problem
type HotTarget = {
  key: string;
  label: string;
  baseRisk: number; // 0-60
  blurb: string; // one-line why
};

const HOT_TARGETS: HotTarget[] = [
  { key: '1909-t206-honus', label: '1909 T206 Honus Wagner', baseRisk: 60, blurb: 'Most-faked card in history. Reprints, reproductions, and trimmed copies flood the market — even a real one sells for $1M+.' },
  { key: '1952-topps-mantle', label: '1952 Topps Mantle (#311)', baseRisk: 55, blurb: 'Reprints and doctored copies are rampant. Factory tear sheet editions circulate as "authentics." Trimming adds another layer.' },
  { key: '1986-fleer-jordan', label: '1986 Fleer Jordan RC (#57)', baseRisk: 50, blurb: 'The counterfeit poster child of modern cards. High-res reprints on glossy stock circulate widely, especially on eBay raw.' },
  { key: '1979-opc-gretzky', label: '1979 O-Pee-Chee Gretzky RC', baseRisk: 40, blurb: 'Trimming is the main fraud — centering-cut copies boost grade from 6 to 8 and add $50K to value.' },
  { key: '2003-04-ud-exquisite-lebron', label: '2003-04 UD Exquisite LeBron RC /99', baseRisk: 45, blurb: 'Autograph forgeries and label swaps. Fake slabs with genuine cases exist. Always verify cert on UD + grader sites.' },
  { key: '2017-bowman-chrome-acuna', label: '2017 Bowman Chrome Acuña 1st Auto', baseRisk: 30, blurb: 'Color-matched refractor counterfeits from Chinese print shops. Sticker-auto forgeries on base parallels.' },
  { key: '2018-prizm-luka', label: '2018-19 Panini Prizm Luka RC', baseRisk: 35, blurb: 'Silver Prizm counterfeits are common. Parallels without foil variance raise flags. Trimmed copies also frequent.' },
  { key: '1998-topps-chrome-manning', label: '1998 Topps Chrome Manning RC Refractor', baseRisk: 25, blurb: 'Refractor counterfeits lack the true diamond-light play. Recolored bases passed as refractors are common.' },
  { key: 'pokemon-pikachu-illustrator', label: 'Pokémon Pikachu Illustrator', baseRisk: 55, blurb: 'Highest counterfeit rate in Pokémon. Pop of 39. Never buy raw. Only verified BGS/PSA with matching pop-report cert.' },
  { key: 'pokemon-base-charizard', label: '1999 Pokémon Base Set Charizard (#4)', baseRisk: 40, blurb: '1st Edition and Shadowless counterfeits with fake holofoil. Reprint stamps can be added by hand.' },
  { key: 'pokemon-trophy', label: 'Pokémon Trophy / Promo (Japanese)', baseRisk: 50, blurb: 'Japanese trophy and invite-only promos are frequently counterfeited with near-perfect printing.' },
  { key: 'vintage-pre-war', label: 'Pre-War tobacco / candy card (non-T206)', baseRisk: 35, blurb: 'Cracker Jack, Goudey, Diamond Stars — all commonly reprinted. Paper stock weight test is first defense.' },
  { key: 'vintage-post-war', label: 'Post-war vintage (1948-1979)', baseRisk: 20, blurb: 'Trimming is the main fraud. Reprints less common but present for key rookies (Clemente, Koufax, Aaron).' },
  { key: 'modern-rc-grail', label: 'Modern grail RC ($5K+ raw)', baseRisk: 25, blurb: 'Any modern card over ~$5K raw draws counterfeiters. Color-shift parallels and refractors are the usual targets.' },
  { key: 'modern-rc-mid', label: 'Modern RC ($100-$5K)', baseRisk: 12, blurb: 'Counterfeiting becomes economical above ~$100 raw. Below that, rarely worth the effort.' },
  { key: 'modern-auto-patch', label: 'Modern auto / patch card', baseRisk: 30, blurb: 'Sticker-auto forgeries and patch swaps (Player Jersey → Logoman swap) are a $10M+/yr fraud category.' },
  { key: 'modern-low-value', label: 'Modern card under $100', baseRisk: 5, blurb: 'Counterfeiting not economical at this price. Main risk is condition misrepresentation, not fakes.' },
  { key: 'other', label: 'Other / unknown', baseRisk: 15, blurb: 'Generic baseline — if you cannot identify a specific hot-target family, assume some residual risk.' },
];

type Platform = 'lcs' | 'major-auction' | 'ebay-sold' | 'ebay-raw' | 'whatnot' | 'fb-marketplace' | 'instagram-dm' | 'twitter-dm' | 'craigslist';
type Feedback = 'verified-dealer' | '1000+' | '100-999' | '10-99' | '0-9' | 'brand-new' | 'unknown';
type Encap = 'psa' | 'bgs' | 'cgc' | 'sgc' | 'tag' | 'offbrand-slab' | 'raw';
type PhotoQuality = 'video-walkaround' | 'macro-both-sides' | 'front-back' | 'one-angle' | 'stock-only' | 'no-photos';
type PriceRatio = 'under-30' | '30-50' | '50-70' | '70-90' | '90-110' | 'over-110';
type Returns = 'money-back-plus-authentication' | 'money-back-14-day' | 'money-back-3-day' | 'final-sale';

const PLATFORM_LABEL: Record<Platform, string> = {
  'lcs': 'Local card shop (in person)',
  'major-auction': 'Major auction house (Heritage, Goldin, PWCC)',
  'ebay-sold': 'eBay slabbed listing from established seller',
  'ebay-raw': 'eBay raw listing (any seller)',
  'whatnot': 'Whatnot live breaker',
  'fb-marketplace': 'Facebook Marketplace',
  'instagram-dm': 'Instagram DM',
  'twitter-dm': 'Twitter/X DM',
  'craigslist': 'Craigslist / offer-up / in-person stranger',
};

const PLATFORM_RISK: Record<Platform, number> = {
  'lcs': -12,
  'major-auction': -18,
  'ebay-sold': -3,
  'ebay-raw': 6,
  'whatnot': 4,
  'fb-marketplace': 15,
  'instagram-dm': 22,
  'twitter-dm': 22,
  'craigslist': 18,
};

const FEEDBACK_LABEL: Record<Feedback, string> = {
  'verified-dealer': 'Verified dealer / Top-Rated Plus / long-term known',
  '1000+': '1,000+ feedback, 99%+ positive',
  '100-999': '100-999 feedback',
  '10-99': '10-99 feedback',
  '0-9': '0-9 feedback',
  'brand-new': 'Brand new account (< 30 days)',
  'unknown': 'Unknown / no feedback visible',
};

const FEEDBACK_RISK: Record<Feedback, number> = {
  'verified-dealer': -15,
  '1000+': -8,
  '100-999': 0,
  '10-99': 8,
  '0-9': 18,
  'brand-new': 25,
  'unknown': 12,
};

const ENCAP_LABEL: Record<Encap, string> = {
  'psa': 'PSA slab with verifiable cert #',
  'bgs': 'BGS slab with verifiable cert #',
  'cgc': 'CGC slab with verifiable cert #',
  'sgc': 'SGC slab with verifiable cert #',
  'tag': 'TAG slab with verifiable cert #',
  'offbrand-slab': 'Off-brand or unknown slab',
  'raw': 'Raw / unencapsulated',
};

const ENCAP_RISK: Record<Encap, number> = {
  'psa': -22,
  'bgs': -20,
  'cgc': -18,
  'sgc': -15,
  'tag': -10,
  'offbrand-slab': 8,
  'raw': 10,
};

const PHOTO_LABEL: Record<PhotoQuality, string> = {
  'video-walkaround': 'Video walkaround of the actual card',
  'macro-both-sides': 'Macro (close-up) photos front and back',
  'front-back': 'Clear photos front and back',
  'one-angle': 'One photo only / one angle',
  'stock-only': 'Stock photos / generic images',
  'no-photos': 'No photos provided',
};

const PHOTO_RISK: Record<PhotoQuality, number> = {
  'video-walkaround': -12,
  'macro-both-sides': -8,
  'front-back': -2,
  'one-angle': 12,
  'stock-only': 28,
  'no-photos': 35,
};

const PRICE_LABEL: Record<PriceRatio, string> = {
  'under-30': 'Under 30% of fair market (deeply under-priced)',
  '30-50': '30-50% of FMV',
  '50-70': '50-70% of FMV',
  '70-90': '70-90% of FMV (slight discount)',
  '90-110': '90-110% of FMV (at comp)',
  'over-110': 'Over 110% of FMV (at or above market)',
};

const PRICE_RISK: Record<PriceRatio, number> = {
  'under-30': 35,
  '30-50': 22,
  '50-70': 10,
  '70-90': 2,
  '90-110': 0,
  'over-110': -3,
};

const RETURNS_LABEL: Record<Returns, string> = {
  'money-back-plus-authentication': 'Returns + buyer pays authentication (PSA cross / BGS review)',
  'money-back-14-day': '14-day money-back guarantee',
  'money-back-3-day': '3-day money-back (platform minimum)',
  'final-sale': 'Final sale / no returns',
};

const RETURNS_RISK: Record<Returns, number> = {
  'money-back-plus-authentication': -10,
  'money-back-14-day': -4,
  'money-back-3-day': 4,
  'final-sale': 18,
};

// ─── Verdict Engine ──────────────────────────────────────────────────
type Verdict = {
  label: string;
  tone: 'emerald' | 'sky' | 'amber' | 'rose';
  blurb: string;
};

function scoreToVerdict(score: number): Verdict {
  if (score < 25) {
    return {
      label: 'LOW RISK',
      tone: 'emerald',
      blurb: 'Signals are consistent with a genuine card. Proceed with standard buyer diligence.',
    };
  }
  if (score < 55) {
    return {
      label: 'CAUTION',
      tone: 'sky',
      blurb: 'Some risk signals present. Ask for additional photos and keep return options open.',
    };
  }
  if (score < 80) {
    return {
      label: 'HIGH RISK',
      tone: 'amber',
      blurb: 'Multiple warning signs. Do not pay until you have authentication, or walk away.',
    };
  }
  return {
    label: 'LIKELY FAKE',
    tone: 'rose',
    blurb: 'Profile matches a classic counterfeit/altered listing. Strong recommendation to decline.',
  };
}

// ─── UI ──────────────────────────────────────────────────────────────
export default function CounterfeitScannerClient() {
  const [target, setTarget] = useState<string>('modern-rc-mid');
  const [platform, setPlatform] = useState<Platform>('ebay-sold');
  const [feedback, setFeedback] = useState<Feedback>('100-999');
  const [encap, setEncap] = useState<Encap>('raw');
  const [photo, setPhoto] = useState<PhotoQuality>('front-back');
  const [price, setPrice] = useState<PriceRatio>('90-110');
  const [returns, setReturns] = useState<Returns>('money-back-14-day');
  const [stickerAuto, setStickerAuto] = useState(false);
  const [certUnverified, setCertUnverified] = useState(false);
  const [rushPressure, setRushPressure] = useState(false);
  const [paymentOffPlatform, setPaymentOffPlatform] = useState(false);

  const result = useMemo(() => {
    const targetInfo = HOT_TARGETS.find(t => t.key === target) ?? HOT_TARGETS[HOT_TARGETS.length - 1];

    // Build weighted contribution list
    const contributions: { label: string; delta: number; tone: 'good' | 'bad' | 'neutral' }[] = [];

    contributions.push({ label: `Hot-target family: ${targetInfo.label}`, delta: targetInfo.baseRisk, tone: targetInfo.baseRisk >= 25 ? 'bad' : 'neutral' });
    contributions.push({ label: `Venue: ${PLATFORM_LABEL[platform]}`, delta: PLATFORM_RISK[platform], tone: PLATFORM_RISK[platform] > 0 ? 'bad' : PLATFORM_RISK[platform] < 0 ? 'good' : 'neutral' });
    contributions.push({ label: `Seller reputation: ${FEEDBACK_LABEL[feedback]}`, delta: FEEDBACK_RISK[feedback], tone: FEEDBACK_RISK[feedback] > 0 ? 'bad' : FEEDBACK_RISK[feedback] < 0 ? 'good' : 'neutral' });
    contributions.push({ label: `Encapsulation: ${ENCAP_LABEL[encap]}`, delta: ENCAP_RISK[encap], tone: ENCAP_RISK[encap] > 0 ? 'bad' : 'good' });
    contributions.push({ label: `Photo quality: ${PHOTO_LABEL[photo]}`, delta: PHOTO_RISK[photo], tone: PHOTO_RISK[photo] > 0 ? 'bad' : PHOTO_RISK[photo] < 0 ? 'good' : 'neutral' });
    contributions.push({ label: `Price vs FMV: ${PRICE_LABEL[price]}`, delta: PRICE_RISK[price], tone: PRICE_RISK[price] > 0 ? 'bad' : PRICE_RISK[price] < 0 ? 'good' : 'neutral' });
    contributions.push({ label: `Return policy: ${RETURNS_LABEL[returns]}`, delta: RETURNS_RISK[returns], tone: RETURNS_RISK[returns] > 0 ? 'bad' : RETURNS_RISK[returns] < 0 ? 'good' : 'neutral' });

    if (stickerAuto) contributions.push({ label: 'Sticker autograph (higher forgery risk)', delta: 8, tone: 'bad' });
    if (certUnverified) contributions.push({ label: 'Cert # unverifiable on grader site', delta: 30, tone: 'bad' });
    if (rushPressure) contributions.push({ label: 'Seller pressuring fast close / FOMO', delta: 12, tone: 'bad' });
    if (paymentOffPlatform) contributions.push({ label: 'Payment routed off-platform (Zelle, Venmo F&F, Cash App)', delta: 22, tone: 'bad' });

    // Raw score sum, clamped 0-100
    const rawScore = contributions.reduce((acc, c) => acc + c.delta, 0);
    const score = Math.max(0, Math.min(100, rawScore));
    const verdict = scoreToVerdict(score);

    // Actionable red flags (biggest bad contributors)
    const flags = contributions
      .filter(c => c.tone === 'bad' && c.delta >= 10)
      .sort((a, b) => b.delta - a.delta)
      .slice(0, 5);

    // Recommendations based on what's off
    const recs: string[] = [];
    if (encap === 'raw' && targetInfo.baseRisk >= 30) {
      recs.push(`Require an authenticated slab (PSA, BGS, CGC, or SGC) for any ${targetInfo.label}. Raw at this price tier is not worth the risk.`);
    }
    if (encap !== 'raw' && certUnverified) {
      recs.push('Refuse to pay until the cert number verifies on the grader\'s website AND the photo on their database matches the listing photo. Fake labels with real case numbers exist.');
    }
    if (photo === 'stock-only' || photo === 'no-photos') {
      recs.push('Request 4+ macro photos of the actual card: front, back, and both edges at 45°. If the seller declines, walk.');
    }
    if (price === 'under-30' || price === '30-50') {
      recs.push('Price 30-50% below market is the #1 counterfeit red flag. Legitimate grail cards do not sell at blowout discount on a public venue.');
    }
    if (paymentOffPlatform) {
      recs.push('Refuse off-platform payment (Zelle, Venmo Friends & Family, Cash App). These have zero buyer protection — that is the entire point of the request.');
    }
    if (platform === 'instagram-dm' || platform === 'twitter-dm' || platform === 'fb-marketplace') {
      recs.push('Insist on eBay / Goldin / Whatnot for the actual transaction. DM-originated deals offer no dispute path if the card is fake.');
    }
    if (stickerAuto) {
      recs.push('Sticker autographs are a primary forgery target. Only trust ones in sealed BGS/PSA slabs with matching pop-report photos.');
    }
    if (returns === 'final-sale' && score >= 40) {
      recs.push('Never buy "final sale" on a card flagged CAUTION or worse. A 3-day return window is the minimum.');
    }
    if (rushPressure) {
      recs.push('Rush tactics ("someone else is about to buy it", "price goes up in an hour") are classic fraud patterns. Walk away — a real deal will wait.');
    }
    if (recs.length === 0) {
      recs.push('Risk profile is acceptable. Standard diligence applies: keep receipts, photograph the card on arrival, and authenticate if you plan to grade.');
    }

    return { score, verdict, contributions, flags, recs, targetInfo };
  }, [target, platform, feedback, encap, photo, price, returns, stickerAuto, certUnverified, rushPressure, paymentOffPlatform]);

  const toneBorder: Record<'emerald' | 'sky' | 'amber' | 'rose', string> = {
    emerald: 'border-emerald-800/40 bg-emerald-950/40',
    sky: 'border-sky-800/40 bg-sky-950/40',
    amber: 'border-amber-800/40 bg-amber-950/40',
    rose: 'border-rose-800/40 bg-rose-950/40',
  };
  const toneText: Record<'emerald' | 'sky' | 'amber' | 'rose', string> = {
    emerald: 'text-emerald-400',
    sky: 'text-sky-400',
    amber: 'text-amber-400',
    rose: 'text-rose-400',
  };

  function copyReport() {
    const lines: string[] = [];
    lines.push(`CardVault Counterfeit Risk Scan`);
    lines.push(`Target: ${result.targetInfo.label}`);
    lines.push(`Risk Score: ${result.score} / 100 — ${result.verdict.label}`);
    lines.push('');
    lines.push('Top red flags:');
    if (result.flags.length === 0) lines.push('  (none significant)');
    for (const f of result.flags) lines.push(`  • ${f.label} (+${f.delta})`);
    lines.push('');
    lines.push('Recommendations:');
    for (const r of result.recs) lines.push(`  • ${r}`);
    lines.push('');
    lines.push('Scanned at cardvault-two.vercel.app/tools/counterfeit-scanner');
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(lines.join('\n')).catch(() => {});
    }
  }

  return (
    <div className="space-y-6">
      {/* Inputs grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Hot-target family">
          <select
            value={target}
            onChange={e => setTarget(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-rose-500"
          >
            {HOT_TARGETS.map(t => (
              <option key={t.key} value={t.key}>{t.label}</option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">{result.targetInfo.blurb}</p>
        </Field>

        <Field label="Where is it being sold?">
          <select
            value={platform}
            onChange={e => setPlatform(e.target.value as Platform)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-rose-500"
          >
            {(Object.keys(PLATFORM_LABEL) as Platform[]).map(p => (
              <option key={p} value={p}>{PLATFORM_LABEL[p]}</option>
            ))}
          </select>
        </Field>

        <Field label="Seller reputation">
          <select
            value={feedback}
            onChange={e => setFeedback(e.target.value as Feedback)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-rose-500"
          >
            {(Object.keys(FEEDBACK_LABEL) as Feedback[]).map(p => (
              <option key={p} value={p}>{FEEDBACK_LABEL[p]}</option>
            ))}
          </select>
        </Field>

        <Field label="Encapsulation (slab / raw)">
          <select
            value={encap}
            onChange={e => setEncap(e.target.value as Encap)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-rose-500"
          >
            {(Object.keys(ENCAP_LABEL) as Encap[]).map(p => (
              <option key={p} value={p}>{ENCAP_LABEL[p]}</option>
            ))}
          </select>
        </Field>

        <Field label="Photo quality">
          <select
            value={photo}
            onChange={e => setPhoto(e.target.value as PhotoQuality)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-rose-500"
          >
            {(Object.keys(PHOTO_LABEL) as PhotoQuality[]).map(p => (
              <option key={p} value={p}>{PHOTO_LABEL[p]}</option>
            ))}
          </select>
        </Field>

        <Field label="Price vs fair market value (FMV)">
          <select
            value={price}
            onChange={e => setPrice(e.target.value as PriceRatio)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-rose-500"
          >
            {(Object.keys(PRICE_LABEL) as PriceRatio[]).map(p => (
              <option key={p} value={p}>{PRICE_LABEL[p]}</option>
            ))}
          </select>
        </Field>

        <Field label="Return policy">
          <select
            value={returns}
            onChange={e => setReturns(e.target.value as Returns)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-rose-500"
          >
            {(Object.keys(RETURNS_LABEL) as Returns[]).map(p => (
              <option key={p} value={p}>{RETURNS_LABEL[p]}</option>
            ))}
          </select>
        </Field>

        <div className="space-y-2 bg-gray-900/40 border border-gray-800 rounded-lg p-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Additional red flags</p>
          <Check label="Card has a sticker autograph (not on-card)" checked={stickerAuto} onChange={setStickerAuto} />
          <Check label="Slab cert # does NOT verify on grader's website" checked={certUnverified} onChange={setCertUnverified} />
          <Check label="Seller is pushing me to close fast (FOMO)" checked={rushPressure} onChange={setRushPressure} />
          <Check label="Seller insists on Zelle / Venmo F&F / off-platform" checked={paymentOffPlatform} onChange={setPaymentOffPlatform} />
        </div>
      </div>

      {/* Verdict banner */}
      <div className={`border rounded-xl p-5 ${toneBorder[result.verdict.tone]}`}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className={`text-xs font-semibold uppercase tracking-wider ${toneText[result.verdict.tone]}`}>Risk Score</span>
              <span className="text-4xl font-black text-white">{result.score}<span className="text-lg text-gray-500 font-medium"> / 100</span></span>
            </div>
            <div className={`text-2xl font-black ${toneText[result.verdict.tone]} mb-2`}>{result.verdict.label}</div>
            <p className="text-sm text-gray-300 max-w-xl">{result.verdict.blurb}</p>
          </div>
          <button
            onClick={copyReport}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
          >
            Copy report
          </button>
        </div>
        {/* Score bar */}
        <div className="mt-4 h-2 w-full bg-gray-900 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              result.verdict.tone === 'emerald' ? 'bg-emerald-500' :
              result.verdict.tone === 'sky' ? 'bg-sky-500' :
              result.verdict.tone === 'amber' ? 'bg-amber-500' : 'bg-rose-500'
            }`}
            style={{ width: `${result.score}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-gray-600 tracking-wide">
          <span>0 SAFE</span>
          <span>25</span>
          <span>55</span>
          <span>80</span>
          <span>100 FAKE</span>
        </div>
      </div>

      {/* Red flags */}
      {result.flags.length > 0 && (
        <div className="bg-rose-950/30 border border-rose-800/30 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-rose-400 mb-3 uppercase tracking-wide">Top red flags</h3>
          <ul className="space-y-2">
            {result.flags.map((f, i) => (
              <li key={i} className="flex items-center justify-between gap-3 text-sm text-gray-200 border-b border-rose-900/30 pb-2 last:border-0">
                <span>{f.label}</span>
                <span className="text-rose-400 font-mono text-xs whitespace-nowrap">+{f.delta}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">What to do next</h3>
        <ul className="space-y-2 text-sm text-gray-300">
          {result.recs.map((r, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-sky-400 mt-0.5">•</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Contribution breakdown */}
      <details className="bg-gray-900/40 border border-gray-800 rounded-xl">
        <summary className="p-4 cursor-pointer text-sm font-semibold text-gray-300 uppercase tracking-wide hover:text-white">
          Full score breakdown
        </summary>
        <div className="px-4 pb-4">
          <p className="text-xs text-gray-500 mb-3">Every input contributes to the final risk score. Negative values reduce risk; positive values increase it. The final number is clamped between 0 and 100.</p>
          <ul className="space-y-1.5 text-xs">
            {result.contributions.map((c, i) => (
              <li key={i} className="flex items-center justify-between gap-3 border-b border-gray-800 pb-1.5">
                <span className="text-gray-400">{c.label}</span>
                <span className={`font-mono ${c.delta > 0 ? 'text-rose-400' : c.delta < 0 ? 'text-emerald-400' : 'text-gray-500'}`}>
                  {c.delta > 0 ? '+' : ''}{c.delta}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </details>

      {/* Educational footer */}
      <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-5 text-sm text-gray-400 space-y-3">
        <h3 className="text-white font-semibold">How this scanner works</h3>
        <p>
          The Counterfeit Risk Scanner combines the hobby&apos;s most common fraud patterns — hot-target card families,
          venue risk profiles, seller signals, encapsulation status, photo quality, price anomalies, and specific red
          flags (sticker autos, unverifiable certs, off-platform payment) — into a single 0-100 risk score. It is a
          heuristic tool, not a replacement for physical authentication.
        </p>
        <p>
          A LOW RISK score does not guarantee authenticity. A LIKELY FAKE score does not prove counterfeit. Use this as
          a structured gut-check before you pay, and always prefer graded slabs with verifiable certs for any card
          over a few hundred dollars. When in doubt: walk.
        </p>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-start gap-2 cursor-pointer text-sm text-gray-300 hover:text-white">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="mt-0.5 accent-rose-500"
      />
      <span>{label}</span>
    </label>
  );
}
