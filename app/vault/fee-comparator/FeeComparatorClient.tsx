'use client';

import { useMemo, useState } from 'react';

type CardKind = 'raw-modern' | 'raw-vintage' | 'graded-modern' | 'graded-vintage' | 'sealed' | 'tcg';

type FitKey = 'rawModern' | 'rawVintage' | 'gradedModern' | 'gradedVintage' | 'sealed' | 'tcg';

type PayoutSpeed = 'same-day' | 'fast' | 'medium' | 'slow';

type Marketplace = {
  slug: string;
  name: string;
  emoji: string;
  category: 'generalist' | 'hobby-live' | 'hobby-slab' | 'consignment' | 'social' | 'platform';
  fvfPct: number;           // % on gross
  fvfTieredOver?: { threshold: number; rateAbove: number }; // eBay: 7.25% above $2000
  procPct: number;          // payment processing %
  procFlat: number;         // flat per transaction
  listingFee: number;       // per-listing fixed
  optionalPromoDefault: number; // default promoted-listing rate if toggled
  payoutDays: number;
  payoutSpeed: PayoutSpeed;
  audience: 'massive' | 'large' | 'medium' | 'niche';
  categoryFit: Record<FitKey, number>; // 0-5
  bpPct?: number; // buyer's premium % (info-only, does not deduct from seller)
  blurb: string;
  strengths: string;
  weaknesses: string;
  color: string; // tailwind colorful accent (text-)
};

const MARKETPLACES: Marketplace[] = [
  {
    slug: 'ebay',
    name: 'eBay',
    emoji: '🅴',
    category: 'generalist',
    fvfPct: 0.1325,
    fvfTieredOver: { threshold: 2000, rateAbove: 0.0725 },
    procPct: 0,
    procFlat: 0.30,
    listingFee: 0,
    optionalPromoDefault: 0.05,
    payoutDays: 2,
    payoutSpeed: 'fast',
    audience: 'massive',
    categoryFit: { rawModern: 5, rawVintage: 5, gradedModern: 5, gradedVintage: 5, sealed: 5, tcg: 5 },
    blurb: '180M+ global buyers. Trading-cards FVF is 13.25% on first $2,000, 7.25% above.',
    strengths: 'Largest audience. Authenticity Guarantee on $250+ graded slabs. Fast payout.',
    weaknesses: 'Highest headline rate for sub-$2K sales. Promoted-listings pressure in competitive categories.',
    color: 'text-sky-300',
  },
  {
    slug: 'whatnot',
    name: 'Whatnot',
    emoji: '📺',
    category: 'hobby-live',
    fvfPct: 0.08,
    procPct: 0.029,
    procFlat: 0.30,
    listingFee: 0,
    optionalPromoDefault: 0,
    payoutDays: 3,
    payoutSpeed: 'fast',
    audience: 'large',
    categoryFit: { rawModern: 4, rawVintage: 3, gradedModern: 5, gradedVintage: 4, sealed: 5, tcg: 5 },
    blurb: 'Live-auction and livestream-sales platform. 8% commission + 2.9% + $0.30 processing.',
    strengths: 'Impulse-buy live audience. Pack-breaks and show-style auctions thrive. Strong Gen Z reach.',
    weaknesses: 'Live-only format; raw-card buyers often anchor on lower comps than eBay.',
    color: 'text-purple-300',
  },
  {
    slug: 'myslabs',
    name: 'MySlabs',
    emoji: '🟦',
    category: 'hobby-slab',
    fvfPct: 0.06,
    procPct: 0,
    procFlat: 0,
    listingFee: 0.35,
    optionalPromoDefault: 0,
    payoutDays: 2,
    payoutSpeed: 'fast',
    audience: 'medium',
    categoryFit: { rawModern: 1, rawVintage: 1, gradedModern: 5, gradedVintage: 5, sealed: 0, tcg: 3 },
    blurb: 'Graded-slab-focused marketplace. 6% flat commission + $0.35 listing fee. No processing on seller.',
    strengths: 'Best fee ratio for graded cards. Niche hobby-focused buyers. Low friction for consignors.',
    weaknesses: 'Graded-only-ish audience. Small vs eBay. Can take days to move a modern PSA 10.',
    color: 'text-blue-300',
  },
  {
    slug: 'fanatics-collect',
    name: 'Fanatics Collect',
    emoji: '🃏',
    category: 'hobby-slab',
    fvfPct: 0.10,
    procPct: 0,
    procFlat: 0,
    listingFee: 0,
    optionalPromoDefault: 0,
    payoutDays: 7,
    payoutSpeed: 'medium',
    audience: 'large',
    categoryFit: { rawModern: 2, rawVintage: 2, gradedModern: 5, gradedVintage: 5, sealed: 4, tcg: 2 },
    blurb: 'Consolidated Fanatics hobby marketplace. 10% commission on fixed-price. Weekly Premier Auctions separate.',
    strengths: 'Hobby-savvy buyer pool. Integrated with Topps product pipeline.',
    weaknesses: 'Weekly payout cycle slower than eBay. Newer platform — audience still scaling vs eBay.',
    color: 'text-emerald-300',
  },
  {
    slug: 'pwcc',
    name: 'PWCC Marketplace',
    emoji: '🔷',
    category: 'consignment',
    fvfPct: 0.10,
    procPct: 0,
    procFlat: 0,
    listingFee: 0,
    optionalPromoDefault: 0,
    payoutDays: 14,
    payoutSpeed: 'medium',
    audience: 'medium',
    categoryFit: { rawModern: 2, rawVintage: 3, gradedModern: 5, gradedVintage: 5, sealed: 3, tcg: 2 },
    bpPct: 0.03,
    blurb: 'Fixed-price consigned marketplace tier. 10% seller fee + 3% buyer’s premium. Premier Auctions separate.',
    strengths: 'High-end buyer pool. Vault integration for instant re-listing. Pro-tier shipping.',
    weaknesses: 'Smaller audience than eBay. Payouts 2 weeks after buyer confirmation.',
    color: 'text-cyan-300',
  },
  {
    slug: 'goldin',
    name: 'Goldin Auctions',
    emoji: '🏛️',
    category: 'consignment',
    fvfPct: 0.15,
    procPct: 0,
    procFlat: 0,
    listingFee: 0,
    optionalPromoDefault: 0,
    payoutDays: 45,
    payoutSpeed: 'slow',
    audience: 'medium',
    categoryFit: { rawModern: 1, rawVintage: 4, gradedModern: 4, gradedVintage: 5, sealed: 3, tcg: 2 },
    bpPct: 0.20,
    blurb: 'Premium auction house. 15% seller commission (negotiable for $25K+). 20% buyer’s premium.',
    strengths: 'Top-of-market buyer pool for grails. Marketing push on notable lots. Authenticated pipeline.',
    weaknesses: 'Auction-only cadence (monthly). Slow payout. Not economical sub-$2K.',
    color: 'text-amber-300',
  },
  {
    slug: 'heritage',
    name: 'Heritage Auctions',
    emoji: '🏺',
    category: 'consignment',
    fvfPct: 0.10,
    procPct: 0,
    procFlat: 0,
    listingFee: 0,
    optionalPromoDefault: 0,
    payoutDays: 45,
    payoutSpeed: 'slow',
    audience: 'medium',
    categoryFit: { rawModern: 1, rawVintage: 5, gradedModern: 3, gradedVintage: 5, sealed: 2, tcg: 1 },
    bpPct: 0.25,
    blurb: 'Cross-collectibles auction house. 10% seller commission (often waived for $5K+). 25% buyer’s premium.',
    strengths: 'Deep vintage-sports buyer network. Multi-category cross-pollination (coins/comics/cards).',
    weaknesses: 'Highest BP in the hobby — depresses hammer price ~15-20% vs no-BP platforms.',
    color: 'text-orange-300',
  },
  {
    slug: 'comc',
    name: 'COMC',
    emoji: '📘',
    category: 'consignment',
    fvfPct: 0.20,
    procPct: 0,
    procFlat: 0,
    listingFee: 0.50,
    optionalPromoDefault: 0,
    payoutDays: 14,
    payoutSpeed: 'medium',
    audience: 'medium',
    categoryFit: { rawModern: 5, rawVintage: 4, gradedModern: 3, gradedVintage: 3, sealed: 1, tcg: 4 },
    blurb: 'Check-Out-My-Cards port-and-list platform. $0.50/card processing + 20% commission on sale.',
    strengths: 'Best platform for high-volume, low-dollar raw cards ($1-$25). Port-once, sell-from-warehouse.',
    weaknesses: 'High headline commission. Cashout fee additional. Not competitive for $100+ cards.',
    color: 'text-yellow-300',
  },
  {
    slug: 'mercari',
    name: 'Mercari',
    emoji: '🟧',
    category: 'generalist',
    fvfPct: 0.10,
    procPct: 0.029,
    procFlat: 0.50,
    listingFee: 0,
    optionalPromoDefault: 0,
    payoutDays: 3,
    payoutSpeed: 'fast',
    audience: 'large',
    categoryFit: { rawModern: 3, rawVintage: 2, gradedModern: 2, gradedVintage: 2, sealed: 3, tcg: 3 },
    blurb: 'Generalist mobile marketplace. 10% flat seller fee + 2.9% + $0.50 processing.',
    strengths: 'Strong app UX. Bundled shipping discounts. Younger audience.',
    weaknesses: 'Shallow buyer pool for hobby-specific items. Card-specific authenticity is buyer-beware.',
    color: 'text-red-300',
  },
  {
    slug: 'stockx',
    name: 'StockX',
    emoji: '📈',
    category: 'platform',
    fvfPct: 0.09,
    procPct: 0.03,
    procFlat: 0,
    listingFee: 0,
    optionalPromoDefault: 0,
    payoutDays: 5,
    payoutSpeed: 'medium',
    audience: 'large',
    categoryFit: { rawModern: 0, rawVintage: 0, gradedModern: 4, gradedVintage: 2, sealed: 5, tcg: 4 },
    blurb: 'Stock-market-style bid/ask platform. 9% seller fee + 3% payment processing (12% total effective).',
    strengths: 'Sealed-wax prices and Pokemon graded cards clear fast. Verified authentication reduces disputes.',
    weaknesses: 'Authentication step adds 2-5 business days. Raw singles have no market.',
    color: 'text-lime-300',
  },
  {
    slug: 'facebook',
    name: 'Facebook Marketplace',
    emoji: '📘',
    category: 'social',
    fvfPct: 0,
    procPct: 0,
    procFlat: 0,
    listingFee: 0,
    optionalPromoDefault: 0,
    payoutDays: 0,
    payoutSpeed: 'same-day',
    audience: 'massive',
    categoryFit: { rawModern: 3, rawVintage: 2, gradedModern: 3, gradedVintage: 2, sealed: 3, tcg: 3 },
    blurb: 'Local-pickup marketplace. 0% fee for local, 5% shipping-fee for nationwide shipped sales.',
    strengths: 'Zero-fee for local deals. Same-day cash. Negotiation flexibility.',
    weaknesses: 'No buyer protection. Cash-only creates tax-reporting friction. Flake rate high.',
    color: 'text-indigo-300',
  },
  {
    slug: 'offerup',
    name: 'OfferUp',
    emoji: '🟢',
    category: 'social',
    fvfPct: 0.129,
    procPct: 0,
    procFlat: 1.99,
    listingFee: 0,
    optionalPromoDefault: 0,
    payoutDays: 2,
    payoutSpeed: 'fast',
    audience: 'medium',
    categoryFit: { rawModern: 2, rawVintage: 2, gradedModern: 2, gradedVintage: 1, sealed: 3, tcg: 2 },
    blurb: 'Local + national marketplace. Free for local pickup, 12.9% + $1.99 for shipped sales.',
    strengths: 'Decent local reach in major metros. Lower-friction than Facebook for cold buyers.',
    weaknesses: 'Shallow hobby-specific audience. Shipped fee on-par with eBay without eBay’s reach.',
    color: 'text-green-300',
  },
];

const FIT_LABELS: Record<CardKind, { label: string; fitKey: FitKey; emoji: string; blurb: string }> = {
  'raw-modern': { label: 'Raw Modern', fitKey: 'rawModern', emoji: '🆕', blurb: 'Ungraded card, 2000+ era. Rookies, parallels, autos, patches.' },
  'raw-vintage': { label: 'Raw Vintage', fitKey: 'rawVintage', emoji: '📜', blurb: 'Ungraded card, pre-2000. Condition-sensitive; buyers discount heavily.' },
  'graded-modern': { label: 'Graded Modern', fitKey: 'gradedModern', emoji: '💎', blurb: 'PSA / BGS / CGC / SGC graded, 2000+ era. Most liquid card category.' },
  'graded-vintage': { label: 'Graded Vintage', fitKey: 'gradedVintage', emoji: '🏛️', blurb: 'PSA / SGC graded pre-2000 card. Highest grail-tier liquidity.' },
  'sealed': { label: 'Sealed Wax', fitKey: 'sealed', emoji: '📦', blurb: 'Unopened box, pack, or case. Speculative; audience matters more than fee.' },
  'tcg': { label: 'Pokemon / TCG', fitKey: 'tcg', emoji: '⚡', blurb: 'Pokemon and other trading-card-game items. StockX, Whatnot, eBay lead.' },
};

function computeFee(m: Marketplace, price: number, usePromo: boolean) {
  if (price <= 0) return { fvf: 0, proc: 0, listing: 0, promo: 0, totalFee: 0, net: 0 };
  let fvf = price * m.fvfPct;
  if (m.fvfTieredOver && price > m.fvfTieredOver.threshold) {
    fvf = m.fvfTieredOver.threshold * m.fvfPct + (price - m.fvfTieredOver.threshold) * m.fvfTieredOver.rateAbove;
  }
  const proc = price * m.procPct + (price > 0 ? m.procFlat : 0);
  const listing = m.listingFee;
  const promo = usePromo && m.optionalPromoDefault > 0 ? price * m.optionalPromoDefault : 0;
  const totalFee = fvf + proc + listing + promo;
  const net = price - totalFee;
  return { fvf, proc, listing, promo, totalFee, net };
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
}

function fmtPct(n: number) {
  return `${(n * 100).toFixed(2)}%`;
}

function payoutBadge(speed: PayoutSpeed) {
  const map: Record<PayoutSpeed, { label: string; cls: string }> = {
    'same-day': { label: 'Same day', cls: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60' },
    'fast': { label: 'Fast', cls: 'bg-sky-950/60 text-sky-300 border-sky-800/60' },
    'medium': { label: 'Medium', cls: 'bg-amber-950/60 text-amber-300 border-amber-800/60' },
    'slow': { label: 'Slow', cls: 'bg-rose-950/60 text-rose-300 border-rose-800/60' },
  };
  return map[speed];
}

function audienceBadge(a: Marketplace['audience']) {
  const map: Record<Marketplace['audience'], { label: string; cls: string }> = {
    'massive': { label: 'Massive', cls: 'text-emerald-300' },
    'large': { label: 'Large', cls: 'text-sky-300' },
    'medium': { label: 'Medium', cls: 'text-amber-300' },
    'niche': { label: 'Niche', cls: 'text-gray-400' },
  };
  return map[a];
}

type SortKey = 'net' | 'speed' | 'rate' | 'fit';

const SPEED_ORDER: Record<PayoutSpeed, number> = { 'same-day': 0, 'fast': 1, 'medium': 2, 'slow': 3 };

export default function FeeComparatorClient() {
  const [priceStr, setPriceStr] = useState('500');
  const [kind, setKind] = useState<CardKind>('graded-modern');
  const [usePromo, setUsePromo] = useState(false);
  const [hideSlow, setHideSlow] = useState(false);
  const [minFit, setMinFit] = useState(0);
  const [sort, setSort] = useState<SortKey>('net');
  const [expanded, setExpanded] = useState<string | null>(null);

  const price = useMemo(() => {
    const p = parseFloat(priceStr);
    return Number.isFinite(p) && p > 0 ? p : 0;
  }, [priceStr]);

  const kindMeta = FIT_LABELS[kind];

  const rows = useMemo(() => {
    const mapped = MARKETPLACES.map((m) => {
      const fee = computeFee(m, price, usePromo);
      const fit = m.categoryFit[kindMeta.fitKey];
      return { m, fee, fit };
    });
    const filtered = mapped.filter(({ m, fit }) => {
      if (hideSlow && m.payoutSpeed === 'slow') return false;
      if (fit < minFit) return false;
      return true;
    });
    const sorted = [...filtered].sort((a, b) => {
      if (sort === 'net') return b.fee.net - a.fee.net;
      if (sort === 'speed') {
        const sp = SPEED_ORDER[a.m.payoutSpeed] - SPEED_ORDER[b.m.payoutSpeed];
        return sp !== 0 ? sp : b.fee.net - a.fee.net;
      }
      if (sort === 'rate') {
        const ra = price > 0 ? a.fee.totalFee / price : 0;
        const rb = price > 0 ? b.fee.totalFee / price : 0;
        return ra - rb;
      }
      // fit
      return b.fit - a.fit || b.fee.net - a.fee.net;
    });
    return sorted;
  }, [price, kindMeta.fitKey, usePromo, hideSlow, minFit, sort]);

  const winner = rows[0];
  const fastest = useMemo(() => {
    const viable = rows.filter(r => r.fee.net > 0);
    return [...viable].sort((a, b) => SPEED_ORDER[a.m.payoutSpeed] - SPEED_ORDER[b.m.payoutSpeed] || b.fee.net - a.fee.net)[0];
  }, [rows]);
  const bestFit = useMemo(() => {
    const viable = rows.filter(r => r.fee.net > 0);
    return [...viable].sort((a, b) => b.fit - a.fit || b.fee.net - a.fee.net)[0];
  }, [rows]);

  const copySummary = () => {
    if (!winner) return;
    const lines = [
      `CardVault Marketplace Fee Comparator — ${kindMeta.label}`,
      `Sale Price: ${fmt(price)}`,
      '',
      'Top 5 Net-to-Seller:',
      ...rows.slice(0, 5).map((r, i) => `${i + 1}. ${r.m.name} — ${fmt(r.fee.net)} net (${fmtPct(r.fee.totalFee / price)} fee, ${r.m.payoutDays}d payout)`),
      '',
      `Best Net: ${winner.m.name} (${fmt(winner.fee.net)})`,
      fastest ? `Fastest Payout (viable): ${fastest.m.name} (${fastest.m.payoutDays}d)` : '',
      bestFit ? `Best Category Fit: ${bestFit.m.name} (${bestFit.fit}/5)` : '',
      '',
      'Get yours at https://cardvault-two.vercel.app/vault/fee-comparator',
    ].filter(Boolean).join('\n');
    navigator.clipboard?.writeText(lines);
  };

  return (
    <div className="space-y-6">
      {/* Input Panel */}
      <div className="rounded-2xl bg-gradient-to-br from-rose-950/30 to-gray-900/60 border border-rose-900/40 p-5 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1">
            <label className="block text-xs font-semibold text-rose-300 uppercase tracking-wide mb-2">Sale Price (USD)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                min={0}
                step={1}
                inputMode="decimal"
                value={priceStr}
                onChange={(e) => setPriceStr(e.target.value)}
                className="w-full pl-7 pr-3 py-3 bg-gray-950/80 border border-gray-700 text-white text-xl font-bold rounded-lg focus:border-rose-500 focus:outline-none"
                placeholder="500"
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
              {[25, 100, 500, 1000, 5000, 25000].map(p => (
                <button
                  key={p}
                  onClick={() => setPriceStr(String(p))}
                  className="px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300"
                >
                  ${p.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-rose-300 uppercase tracking-wide mb-2">Card Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(FIT_LABELS) as CardKind[]).map(k => {
                const meta = FIT_LABELS[k];
                const active = kind === k;
                return (
                  <button
                    key={k}
                    onClick={() => setKind(k)}
                    className={`text-left px-3 py-2 rounded-lg border transition-colors ${active ? 'bg-rose-950/70 border-rose-500 text-white' : 'bg-gray-900/60 border-gray-700 text-gray-300 hover:border-gray-500'}`}
                  >
                    <div className="text-sm font-semibold">{meta.emoji} {meta.label}</div>
                  </button>
                );
              })}
            </div>
            <div className="mt-2 text-xs text-gray-400">{kindMeta.blurb}</div>
          </div>
        </div>

        {/* Filters row */}
        <div className="mt-5 pt-4 border-t border-gray-800 flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
            <input type="checkbox" checked={usePromo} onChange={(e) => setUsePromo(e.target.checked)} className="w-3.5 h-3.5 accent-rose-500" />
            Add eBay Promoted Listings (+5%)
          </label>
          <label className="inline-flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
            <input type="checkbox" checked={hideSlow} onChange={(e) => setHideSlow(e.target.checked)} className="w-3.5 h-3.5 accent-rose-500" />
            Hide slow-payout (auction houses)
          </label>
          <div className="inline-flex items-center gap-2 text-xs text-gray-300">
            <span>Min category fit:</span>
            {[0, 3, 4, 5].map(v => (
              <button
                key={v}
                onClick={() => setMinFit(v)}
                className={`px-2 py-0.5 rounded ${minFit === v ? 'bg-rose-900 text-rose-200' : 'bg-gray-800 text-gray-400 hover:text-gray-200'}`}
              >
                {v === 0 ? 'any' : `≥ ${v}`}
              </button>
            ))}
          </div>
          <div className="inline-flex items-center gap-2 text-xs text-gray-300 ml-auto">
            <span>Sort:</span>
            {(['net', 'speed', 'rate', 'fit'] as SortKey[]).map(s => (
              <button
                key={s}
                onClick={() => setSort(s)}
                className={`px-2 py-0.5 rounded ${sort === s ? 'bg-rose-900 text-rose-200' : 'bg-gray-800 text-gray-400 hover:text-gray-200'}`}
              >
                {s === 'net' ? 'Net $' : s === 'speed' ? 'Payout' : s === 'rate' ? 'Fee %' : 'Category fit'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Callouts */}
      {price > 0 && winner && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl bg-emerald-950/40 border border-emerald-900/50 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-emerald-400">💰 Best Net</div>
            <div className="mt-1 text-2xl font-bold text-white">{fmt(winner.fee.net)}</div>
            <div className="text-sm text-emerald-300">{winner.m.name}</div>
            <div className="text-xs text-gray-400 mt-1">{fmtPct(winner.fee.totalFee / Math.max(price, 1))} fee &middot; {winner.m.payoutDays}d payout</div>
          </div>
          {fastest && (
            <div className="rounded-xl bg-sky-950/40 border border-sky-900/50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-sky-400">⚡ Fastest Payout</div>
              <div className="mt-1 text-2xl font-bold text-white">{fastest.m.payoutDays === 0 ? 'Same day' : `${fastest.m.payoutDays} days`}</div>
              <div className="text-sm text-sky-300">{fastest.m.name}</div>
              <div className="text-xs text-gray-400 mt-1">{fmt(fastest.fee.net)} net &middot; {fmtPct(fastest.fee.totalFee / Math.max(price, 1))} fee</div>
            </div>
          )}
          {bestFit && (
            <div className="rounded-xl bg-purple-950/40 border border-purple-900/50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-purple-400">🎯 Best Category Fit</div>
              <div className="mt-1 text-2xl font-bold text-white">{bestFit.fit}<span className="text-base text-gray-400"> / 5</span></div>
              <div className="text-sm text-purple-300">{bestFit.m.name}</div>
              <div className="text-xs text-gray-400 mt-1">{fmt(bestFit.fee.net)} net &middot; {kindMeta.label}</div>
            </div>
          )}
        </div>
      )}

      {/* Ranked List */}
      <div className="rounded-2xl bg-gray-900/40 border border-gray-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
          <div className="text-sm font-semibold text-white">Ranked: {rows.length} marketplaces</div>
          <button
            onClick={copySummary}
            disabled={!winner}
            className="text-xs px-3 py-1.5 rounded-lg bg-rose-900/40 border border-rose-800 text-rose-200 hover:bg-rose-900/60 disabled:opacity-40"
          >
            Copy Summary
          </button>
        </div>
        <div className="divide-y divide-gray-800">
          {rows.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-gray-500">No marketplaces match the filter. Relax a constraint.</div>
          )}
          {rows.map(({ m, fee, fit }, idx) => {
            const isExpanded = expanded === m.slug;
            const badge = payoutBadge(m.payoutSpeed);
            const aud = audienceBadge(m.audience);
            const ratePct = price > 0 ? fee.totalFee / price : 0;
            const maxNet = winner ? winner.fee.net : 0;
            const netBarPct = maxNet > 0 ? Math.max(0, (fee.net / maxNet) * 100) : 0;
            return (
              <div key={m.slug} className="hover:bg-gray-900/60 transition-colors">
                <button
                  onClick={() => setExpanded(isExpanded ? null : m.slug)}
                  className="w-full px-4 py-3 flex items-center gap-3 text-left"
                >
                  <div className="w-6 text-center text-xs font-bold text-gray-500">{idx + 1}</div>
                  <div className="w-8 text-xl">{m.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${m.color} truncate`}>{m.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${badge.cls}`}>{badge.label}</span>
                      <span className={`text-[10px] ${aud.cls}`}>&middot; {aud.label} audience</span>
                    </div>
                    <div className="mt-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-rose-500 to-rose-300" style={{ width: `${netBarPct}%` }} />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold">{fmt(fee.net)}</div>
                    <div className="text-xs text-gray-500">{fmtPct(ratePct)} fee &middot; {m.payoutDays === 0 ? 'instant' : `${m.payoutDays}d`}</div>
                  </div>
                  <div className="text-right ml-2 hidden sm:block">
                    <div className="text-xs font-medium" title={`Fit for ${kindMeta.label}`}>
                      {Array.from({ length: 5 }, (_, i) => (
                        <span key={i} className={i < fit ? 'text-amber-400' : 'text-gray-700'}>●</span>
                      ))}
                    </div>
                    <div className="text-[10px] text-gray-500">fit {fit}/5</div>
                  </div>
                  <span className={`text-gray-500 text-xs transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▾</span>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3">
                    <div className="text-sm text-gray-300 leading-relaxed">{m.blurb}</div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="rounded-lg bg-gray-950/60 border border-gray-800 p-3">
                        <div className="text-[10px] uppercase tracking-wide text-emerald-400 font-semibold mb-1">Strengths</div>
                        <div className="text-gray-300">{m.strengths}</div>
                      </div>
                      <div className="rounded-lg bg-gray-950/60 border border-gray-800 p-3">
                        <div className="text-[10px] uppercase tracking-wide text-rose-400 font-semibold mb-1">Weaknesses</div>
                        <div className="text-gray-300">{m.weaknesses}</div>
                      </div>
                    </div>

                    <div className="rounded-lg bg-gray-950/60 border border-gray-800 p-3">
                      <div className="text-[10px] uppercase tracking-wide text-rose-400 font-semibold mb-2">Fee Breakdown ({fmt(price)} sale)</div>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between text-gray-400"><span>Gross sale price</span><span className="text-white font-mono">{fmt(price)}</span></div>
                        <div className="flex justify-between text-gray-400"><span>Final value fee ({fmtPct(m.fvfPct)}{m.fvfTieredOver && price > m.fvfTieredOver.threshold ? ` tier ${fmtPct(m.fvfTieredOver.rateAbove)}` : ''})</span><span className="text-rose-300 font-mono">−{fmt(fee.fvf)}</span></div>
                        {fee.proc > 0 && <div className="flex justify-between text-gray-400"><span>Payment processing{m.procPct > 0 ? ` (${fmtPct(m.procPct)}` : ' ('}{m.procFlat > 0 ? `${m.procPct > 0 ? ' + ' : ''}${fmt(m.procFlat)}` : ''})</span><span className="text-rose-300 font-mono">−{fmt(fee.proc)}</span></div>}
                        {fee.listing > 0 && <div className="flex justify-between text-gray-400"><span>Listing fee</span><span className="text-rose-300 font-mono">−{fmt(fee.listing)}</span></div>}
                        {fee.promo > 0 && <div className="flex justify-between text-gray-400"><span>Promoted listing ({fmtPct(m.optionalPromoDefault)})</span><span className="text-rose-300 font-mono">−{fmt(fee.promo)}</span></div>}
                        <div className="pt-1.5 mt-1.5 border-t border-gray-800 flex justify-between font-semibold"><span className="text-gray-300">Total fees</span><span className="text-rose-300 font-mono">−{fmt(fee.totalFee)} ({fmtPct(ratePct)})</span></div>
                        <div className="flex justify-between text-sm font-bold"><span className="text-white">Net to seller</span><span className="text-emerald-300 font-mono">{fmt(fee.net)}</span></div>
                        {m.bpPct && (
                          <div className="pt-2 mt-2 border-t border-gray-800 text-[10px] text-amber-300">
                            ℹ️ Buyer pays additional {fmtPct(m.bpPct)} buyer’s premium ({fmt(price * m.bpPct)}). Does not reduce your net; affects bidder psychology.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-[10px] text-gray-500">Category: <span className="text-gray-400">{m.category}</span> &middot; Audience: <span className="text-gray-400">{m.audience}</span> &middot; Payout: <span className="text-gray-400">{m.payoutDays === 0 ? 'instant' : `${m.payoutDays} days`}</span> &middot; Fit for {kindMeta.label}: <span className="text-amber-300">{fit}/5</span></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend + footnotes */}
      <div className="rounded-xl bg-gray-900/40 border border-gray-800 p-4 text-xs text-gray-400 leading-relaxed space-y-2">
        <div><span className="text-gray-300 font-semibold">Fit rating</span> reflects how well the platform matches the selected card type. 5/5 = category-leading audience and infrastructure. 3/5 = viable but not specialized. 0-2 = off-category, use only if you have a specific buyer in mind.</div>
        <div><span className="text-gray-300 font-semibold">Payout speed</span> reflects funds-available timing after buyer confirmation. Same-day = local cash. Fast = 1-3 business days. Medium = 1-2 weeks. Slow = 30-45 days (auction houses settle after the monthly auction closes).</div>
        <div><span className="text-gray-300 font-semibold">Buyer’s premium</span> on auction houses (Goldin / Heritage / PWCC) is paid by the winning bidder on top of the hammer — it does NOT reduce your proceeds. However, high BP tends to suppress hammer prices by 15-20% of the BP rate as bidders anchor on the all-in cost. The net-to-seller numbers above reflect the seller commission only; adjust hammer expectations accordingly.</div>
      </div>
    </div>
  );
}
