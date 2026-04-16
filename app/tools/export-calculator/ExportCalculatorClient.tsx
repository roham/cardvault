'use client';

import { useMemo, useState } from 'react';

type Country = 'Japan' | 'UK' | 'Canada' | 'Germany' | 'Australia' | 'Hong Kong' | 'France' | 'Italy' | 'Mexico' | 'Other';
type Carrier = 'fcpis' | 'priority-intl' | 'express-intl' | 'ups-ws' | 'dhl-express';
type Weight = 'raw' | 'toploader' | 'slab' | 'box';
type Platform = 'ebay-intl' | 'ebay-gsp' | 'mercari' | 'comc' | 'direct-paypal' | 'direct-wise';

const COUNTRIES: Country[] = ['Japan', 'UK', 'Canada', 'Germany', 'Australia', 'Hong Kong', 'France', 'Italy', 'Mexico', 'Other'];

// Outbound shipping from US — approximate list prices for Apr 2026 (USPS Commercial Base).
const SHIP_BASE: Record<Country, Record<Carrier, number>> = {
  Japan:        { fcpis: 16, 'priority-intl': 38, 'express-intl': 72, 'ups-ws': 88,  'dhl-express': 78 },
  UK:           { fcpis: 18, 'priority-intl': 42, 'express-intl': 68, 'ups-ws': 82,  'dhl-express': 70 },
  Canada:       { fcpis: 14, 'priority-intl': 32, 'express-intl': 58, 'ups-ws': 65,  'dhl-express': 60 },
  Germany:      { fcpis: 20, 'priority-intl': 45, 'express-intl': 75, 'ups-ws': 88,  'dhl-express': 72 },
  Australia:    { fcpis: 22, 'priority-intl': 48, 'express-intl': 82, 'ups-ws': 102, 'dhl-express': 92 },
  'Hong Kong':  { fcpis: 18, 'priority-intl': 40, 'express-intl': 72, 'ups-ws': 84,  'dhl-express': 74 },
  France:       { fcpis: 20, 'priority-intl': 44, 'express-intl': 74, 'ups-ws': 88,  'dhl-express': 72 },
  Italy:        { fcpis: 20, 'priority-intl': 46, 'express-intl': 78, 'ups-ws': 92,  'dhl-express': 76 },
  Mexico:       { fcpis: 14, 'priority-intl': 32, 'express-intl': 58, 'ups-ws': 62,  'dhl-express': 58 },
  Other:        { fcpis: 24, 'priority-intl': 52, 'express-intl': 85, 'ups-ws': 105, 'dhl-express': 95 },
};

const CARRIER_LABEL: Record<Carrier, string> = {
  'fcpis':          'USPS First-Class International (up to 4 lb)',
  'priority-intl':  'USPS Priority Mail International',
  'express-intl':   'USPS Priority Express International',
  'ups-ws':         'UPS Worldwide Saver',
  'dhl-express':    'DHL Express Worldwide',
};

const CARRIER_NOTE: Record<Carrier, string> = {
  'fcpis':          'Best value for raw cards and single slabs under 4 lb. 7-14 day transit. $100 default insurance.',
  'priority-intl':  'Higher insurance ceiling ($200 included, up to $5K add-on). 6-10 day transit. Recommended for mid-value slabs.',
  'express-intl':   'Fastest USPS option, 3-5 day transit. Up to $200 insurance included, full carrier tracking.',
  'ups-ws':         'Commercial courier. Fastest transit (1-3 days). Broker and customs handled end-to-end.',
  'dhl-express':    'Premium commercial courier. 2-4 day delivery. Preferred for high-value graded slabs.',
};

const WEIGHT_MULT: Record<Weight, number> = {
  raw: 1.0,
  toploader: 1.05,
  slab: 1.5,
  box: 2.2,
};

const WEIGHT_LABEL: Record<Weight, string> = {
  raw: 'Raw card in penny sleeve (~5g)',
  toploader: 'Card in toploader + team bag (~15g)',
  slab: 'Graded slab (PSA / BGS / CGC, ~180g)',
  box: 'Small box / multiple slabs (~500g)',
};

// Platform fee config. finalValuePct + intlSurchargePct applied to (sale + buyer shipping).
// paymentPct + paymentFixed on sale side (what processor collects from seller).
const PLATFORM: Record<Platform, {
  label: string;
  finalValuePct: number;   // final-value / commission
  intlSurchargePct: number; // cross-border fee layer
  paymentPct: number;       // payment processing percent
  paymentFixed: number;     // payment processing fixed
  note: string;
}> = {
  'ebay-intl': {
    label: 'eBay International Shipping',
    finalValuePct: 0.1325,
    intlSurchargePct: 0.0165,
    paymentPct: 0,
    paymentFixed: 0.30,
    note: 'Buyer pays domestic shipping to US hub; eBay handles export and duty collection. Final-value fee on total, +1.65% cross-border.',
  },
  'ebay-gsp': {
    label: 'eBay Global Shipping Program (legacy)',
    finalValuePct: 0.1325,
    intlSurchargePct: 0.0165,
    paymentPct: 0,
    paymentFixed: 0.30,
    note: 'Legacy program, retired in many categories — check eligibility. Otherwise behaves like International Shipping.',
  },
  'mercari': {
    label: 'Mercari (outgoing-ship label)',
    finalValuePct: 0.10,
    intlSurchargePct: 0,
    paymentPct: 0.029,
    paymentFixed: 0.50,
    note: 'Mercari supports international via integrated labels in some corridors. Flat 10% commission + processing.',
  },
  'comc': {
    label: 'COMC (consigned pro-grade)',
    finalValuePct: 0.08,
    intlSurchargePct: 0.02,
    paymentPct: 0,
    paymentFixed: 0,
    note: 'Consignment model — you ship to COMC, they sell and handle export. 8% commission + 2% international surcharge.',
  },
  'direct-paypal': {
    label: 'Direct sale (PayPal international)',
    finalValuePct: 0,
    intlSurchargePct: 0,
    paymentPct: 0.0449,
    paymentFixed: 0.49,
    note: 'No platform commission. PayPal cross-border rate applies (4.49% + $0.49 per transaction). Higher chargeback risk.',
  },
  'direct-wise': {
    label: 'Direct sale (Wise / bank transfer)',
    finalValuePct: 0,
    intlSurchargePct: 0,
    paymentPct: 0.006,
    paymentFixed: 0,
    note: 'Lowest fee path (~0.6% on FX). Zero buyer protection — use only with trusted repeat buyers.',
  },
};

// Destination-side buyer VAT / GST — matters because IOSS-threshold shipments have tax collected at checkout.
const DEST_VAT: Record<Country, { rate: number; ioss_threshold_usd: number; note: string }> = {
  Japan:       { rate: 0.10, ioss_threshold_usd: 200, note: 'Japan consumption tax (10%) on imports above ¥10,000 threshold. Collected by Japan Post on delivery.' },
  UK:          { rate: 0.20, ioss_threshold_usd: 170, note: 'UK VAT (20%) collected at checkout under £135 IOSS threshold. Above £135, HMRC collects on import with handling fee.' },
  Canada:      { rate: 0.13, ioss_threshold_usd: 150, note: 'GST/HST (13% ON blended) on imports above CAD $20. Canada Post collects on delivery for postal shipments.' },
  Germany:     { rate: 0.19, ioss_threshold_usd: 160, note: 'EU VAT (19% DE) collected at checkout under €150 IOSS threshold. Above threshold, carrier collects + charges handling fee.' },
  Australia:   { rate: 0.10, ioss_threshold_usd: 0,   note: 'Australian GST (10%) on all import parcels regardless of value. Platforms collect and remit for sales under AUD $1,000.' },
  'Hong Kong': { rate: 0.00, ioss_threshold_usd: 9999, note: 'Hong Kong has no sales tax or VAT. Most advantageous destination for cross-border card shipments.' },
  France:      { rate: 0.20, ioss_threshold_usd: 160, note: 'EU VAT (20% FR) collected at checkout under €150 IOSS threshold. La Poste collects above.' },
  Italy:       { rate: 0.22, ioss_threshold_usd: 160, note: 'EU VAT (22% IT) collected at checkout under €150 IOSS threshold. Poste Italiane collects above.' },
  Mexico:      { rate: 0.16, ioss_threshold_usd: 50,  note: 'Mexican IVA (16%) on imports above USD $50. SAT enforces via express courier; informal postal often flows duty-free.' },
  Other:       { rate: 0.00, ioss_threshold_usd: 9999, note: 'Varies by country — research the destination VAT/GST scheme before listing. Consumer-protection and chargeback rules also vary.' },
};

type CalcResult = {
  shipping: number;
  platformFee: number;
  intlSurcharge: number;
  paymentFee: number;
  buyerVat: number;           // informational — buyer pays this, seller does not pocket
  returnBuffer: number;       // recommended buffer seller should bake in
  sellerNetBeforeBuffer: number;
  sellerNetWithBuffer: number;
  buyerTotal: number;
};

function calculate(
  salePrice: number,
  country: Country,
  carrier: Carrier,
  weight: Weight,
  platform: Platform,
  buyerPaysShipping: boolean,
  returnBufferPct: number,
): CalcResult {
  const shipping = +(SHIP_BASE[country][carrier] * WEIGHT_MULT[weight]).toFixed(2);
  const p = PLATFORM[platform];

  // Fee base: sale + any buyer-paid shipping (platforms compute final value on the total to buyer).
  const feeBase = buyerPaysShipping ? (salePrice + shipping) : salePrice;

  const platformFee = +(feeBase * p.finalValuePct).toFixed(2);
  const intlSurcharge = +(feeBase * p.intlSurchargePct).toFixed(2);
  const paymentFee = +((feeBase * p.paymentPct) + p.paymentFixed).toFixed(2);

  // Informational: VAT collected by platform at checkout (for IOSS-eligible shipments).
  const vatCfg = DEST_VAT[country];
  const ioss_eligible = salePrice <= vatCfg.ioss_threshold_usd && p.finalValuePct > 0;
  const buyerVat = ioss_eligible ? +(salePrice * vatCfg.rate).toFixed(2) : 0;

  const returnBuffer = +(salePrice * (returnBufferPct / 100)).toFixed(2);

  const sellerCostOfShipping = buyerPaysShipping ? 0 : shipping;
  const sellerNetBeforeBuffer = +(salePrice - platformFee - intlSurcharge - paymentFee - sellerCostOfShipping).toFixed(2);
  const sellerNetWithBuffer = +(sellerNetBeforeBuffer - returnBuffer).toFixed(2);

  const buyerTotal = +(salePrice + (buyerPaysShipping ? shipping : 0) + buyerVat).toFixed(2);

  return { shipping, platformFee, intlSurcharge, paymentFee, buyerVat, returnBuffer, sellerNetBeforeBuffer, sellerNetWithBuffer, buyerTotal };
}

function verdict(netWithBuffer: number, usComp: number) {
  if (!usComp || usComp <= 0) return null;
  const ratio = netWithBuffer / usComp;
  if (ratio >= 1.15) {
    return {
      label: 'LIST IT',
      desc: `Net is ${Math.round((ratio - 1) * 100)}% above US comp. International premium clearly worth the hassle.`,
      color: 'emerald' as const,
    };
  }
  if (ratio >= 1.00) {
    return {
      label: 'FAIR DEAL',
      desc: `Net is ${Math.round((ratio - 1) * 100)}% above US comp. Marginal upside — worth it if no local buyer bid.`,
      color: 'sky' as const,
    };
  }
  if (ratio >= 0.90) {
    return {
      label: 'BREAKEVEN',
      desc: 'Net within 10% of US comp. Skip unless relationship or chain-building outside US matters.',
      color: 'amber' as const,
    };
  }
  return {
    label: 'SELL DOMESTIC',
    desc: `Net is ${Math.round((1 - ratio) * 100)}% below US comp. International is a net loss on this listing.`,
    color: 'rose' as const,
  };
}

export default function ExportCalculatorClient() {
  const [salePrice, setSalePrice] = useState<string>('300');
  const [country, setCountry] = useState<Country>('UK');
  const [carrier, setCarrier] = useState<Carrier>('priority-intl');
  const [weight, setWeight] = useState<Weight>('slab');
  const [platform, setPlatform] = useState<Platform>('ebay-intl');
  const [buyerPaysShipping, setBuyerPaysShipping] = useState<boolean>(true);
  const [returnBuffer, setReturnBuffer] = useState<string>('5');
  const [usComp, setUsComp] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const priceNum = Math.max(0, parseFloat(salePrice) || 0);
  const compNum = Math.max(0, parseFloat(usComp) || 0);
  const bufferNum = Math.max(0, Math.min(15, parseFloat(returnBuffer) || 0));

  const calc = useMemo(
    () => calculate(priceNum, country, carrier, weight, platform, buyerPaysShipping, bufferNum),
    [priceNum, country, carrier, weight, platform, buyerPaysShipping, bufferNum]
  );

  const v = useMemo(() => verdict(calc.sellerNetWithBuffer, compNum), [calc.sellerNetWithBuffer, compNum]);

  const vatCfg = DEST_VAT[country];
  const ioss_eligible = priceNum <= vatCfg.ioss_threshold_usd && PLATFORM[platform].finalValuePct > 0;

  const handleCopy = () => {
    const p = PLATFORM[platform];
    const lines = [
      'CardVault Export Calculator',
      `Sale: $${priceNum.toFixed(2)} to ${country} via ${p.label}`,
      `Shipping (${CARRIER_LABEL[carrier]}, ${weight}): $${calc.shipping.toFixed(2)} ${buyerPaysShipping ? '(buyer pays)' : '(seller pays)'}`,
      `Platform: $${calc.platformFee.toFixed(2)} | Intl surcharge: $${calc.intlSurcharge.toFixed(2)} | Payment: $${calc.paymentFee.toFixed(2)}`,
      calc.buyerVat > 0 ? `Buyer VAT (collected at checkout, IOSS): $${calc.buyerVat.toFixed(2)}` : '',
      `Return-risk buffer (${bufferNum}%): $${calc.returnBuffer.toFixed(2)}`,
      `Seller net (after buffer): $${calc.sellerNetWithBuffer.toFixed(2)}`,
      `Buyer pays total: $${calc.buyerTotal.toFixed(2)}`,
      v ? `Verdict: ${v.label} — ${v.desc}` : '',
      '— Via CardVault',
    ].filter(Boolean);
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const iossStatus = ioss_eligible
    ? { label: `IOSS eligible — VAT collected at checkout`, tone: 'emerald' as const, desc: `Platform collects $${calc.buyerVat.toFixed(2)} ${country} VAT from buyer at checkout. Parcel ships without customs hold.` }
    : priceNum > vatCfg.ioss_threshold_usd && vatCfg.rate > 0
      ? { label: `Above IOSS threshold — buyer pays VAT on delivery`, tone: 'amber' as const, desc: `Buyer owes ${country} VAT (${(vatCfg.rate * 100).toFixed(0)}%) plus handling fee on arrival. Expect buyer friction — consider splitting high-value listings.` }
      : vatCfg.rate === 0
        ? { label: `No destination VAT`, tone: 'emerald' as const, desc: `${country} has no import VAT / GST on consumer parcels. Frictionless cross-border destination.` }
        : { label: `Direct-sale path — buyer pays VAT on delivery`, tone: 'amber' as const, desc: `Direct / Wise / PayPal paths don't collect VAT at checkout. Buyer handles on arrival regardless of value.` };

  const vColorClass = v
    ? {
        emerald: 'bg-emerald-950/40 border-emerald-700/40 text-emerald-300',
        sky:     'bg-sky-950/40 border-sky-700/40 text-sky-300',
        amber:   'bg-amber-950/40 border-amber-700/40 text-amber-300',
        rose:    'bg-rose-950/40 border-rose-700/40 text-rose-300',
      }[v.color]
    : '';

  const iossColorClass = {
    emerald: 'bg-emerald-950/40 border-emerald-700/40 text-emerald-300',
    amber:   'bg-amber-950/40 border-amber-700/40 text-amber-300',
    rose:    'bg-rose-950/40 border-rose-700/40 text-rose-300',
  }[iossStatus.tone];

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-5 sm:p-6">
        <h2 className="text-white font-semibold mb-4">Your Listing</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-xs uppercase tracking-wide text-gray-500 font-medium">Sale price (USD)</span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              className="mt-1 w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-fuchsia-500"
              placeholder="e.g. 300"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wide text-gray-500 font-medium">Destination country</span>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value as Country)}
              className="mt-1 w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-fuchsia-500"
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wide text-gray-500 font-medium">Outbound carrier</span>
            <select
              value={carrier}
              onChange={(e) => setCarrier(e.target.value as Carrier)}
              className="mt-1 w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-fuchsia-500"
            >
              {(['fcpis', 'priority-intl', 'express-intl', 'ups-ws', 'dhl-express'] as Carrier[]).map((c) => (
                <option key={c} value={c}>{CARRIER_LABEL[c]}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wide text-gray-500 font-medium">Parcel weight / form</span>
            <select
              value={weight}
              onChange={(e) => setWeight(e.target.value as Weight)}
              className="mt-1 w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-fuchsia-500"
            >
              {(['raw', 'toploader', 'slab', 'box'] as Weight[]).map((w) => (
                <option key={w} value={w}>{WEIGHT_LABEL[w]}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wide text-gray-500 font-medium">Selling platform</span>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as Platform)}
              className="mt-1 w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-fuchsia-500"
            >
              {(Object.keys(PLATFORM) as Platform[]).map((p) => (
                <option key={p} value={p}>{PLATFORM[p].label}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wide text-gray-500 font-medium">Return-risk buffer %</span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              max="15"
              step="0.5"
              value={returnBuffer}
              onChange={(e) => setReturnBuffer(e.target.value)}
              className="mt-1 w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-fuchsia-500"
            />
          </label>
          <label className="sm:col-span-2 flex items-center gap-3 bg-gray-950/60 border border-gray-800 rounded-lg px-3 py-2.5">
            <input
              type="checkbox"
              checked={buyerPaysShipping}
              onChange={(e) => setBuyerPaysShipping(e.target.checked)}
              className="w-4 h-4 accent-fuchsia-500"
            />
            <span className="text-sm text-gray-300">Buyer pays shipping (unchecked = free international shipping offered)</span>
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs uppercase tracking-wide text-gray-500 font-medium">US comp price (optional)</span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={usComp}
              onChange={(e) => setUsComp(e.target.value)}
              className="mt-1 w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-fuchsia-500"
              placeholder="e.g. 280 (for verdict: domestic vs international)"
            />
          </label>
        </div>
      </div>

      {/* IOSS badge */}
      <div className={`rounded-xl border px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2 ${iossColorClass}`}>
        <span className="font-semibold text-sm">{iossStatus.label}</span>
        <span className="text-xs opacity-80">{iossStatus.desc}</span>
      </div>

      {/* Breakdown */}
      <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-5 sm:p-6">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-white font-semibold">Seller Net Breakdown</h2>
          <button
            onClick={handleCopy}
            className="text-xs uppercase tracking-wide px-3 py-1.5 bg-fuchsia-950/60 border border-fuchsia-800/50 text-fuchsia-300 rounded-full hover:bg-fuchsia-900/60 transition"
          >
            {copied ? 'Copied' : 'Copy summary'}
          </button>
        </div>
        <div className="divide-y divide-gray-800/60 text-sm">
          <Row label="Sale price" value={priceNum} />
          <Row
            label={`Outbound shipping (${buyerPaysShipping ? 'buyer' : 'seller'} pays)`}
            value={buyerPaysShipping ? 0 : -calc.shipping}
            hint={CARRIER_NOTE[carrier]}
            raw
          />
          <Row
            label={`Platform commission (${(PLATFORM[platform].finalValuePct * 100).toFixed(2)}%)`}
            value={-calc.platformFee}
            hint={PLATFORM[platform].note}
            raw
          />
          <Row
            label={`International surcharge (${(PLATFORM[platform].intlSurchargePct * 100).toFixed(2)}%)`}
            value={-calc.intlSurcharge}
            hint={PLATFORM[platform].intlSurchargePct > 0 ? 'Cross-border fee added on top of domestic commission.' : 'No international surcharge on this platform.'}
            raw
          />
          <Row
            label={`Payment processing`}
            value={-calc.paymentFee}
            hint={PLATFORM[platform].paymentPct > 0 ? `${(PLATFORM[platform].paymentPct * 100).toFixed(2)}% + $${PLATFORM[platform].paymentFixed.toFixed(2)} per transaction.` : `Flat $${PLATFORM[platform].paymentFixed.toFixed(2)} fee.`}
            raw
          />
          <Row
            label={`Return-risk buffer (${bufferNum}%)`}
            value={-calc.returnBuffer}
            hint="Prudent pad for international return or partial-refund exposure. Not paid to anyone — just reserved mentally."
            raw
          />
        </div>
        <div className="mt-5 pt-4 border-t border-gray-700 flex items-baseline justify-between">
          <span className="text-sm uppercase tracking-wide text-gray-400 font-semibold">Seller net (after buffer)</span>
          <span className="text-3xl font-black text-white tabular-nums">${calc.sellerNetWithBuffer.toFixed(2)}</span>
        </div>
        {calc.returnBuffer > 0 && (
          <div className="text-xs text-gray-500 text-right mt-1">
            (Pre-buffer: ${calc.sellerNetBeforeBuffer.toFixed(2)})
          </div>
        )}
      </div>

      {/* Buyer Total */}
      <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-5">
        <div className="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-2">
          Buyer pays at checkout
        </div>
        <div className="flex items-baseline justify-between">
          <div className="text-sm text-gray-400">
            Sale ${priceNum.toFixed(2)}
            {buyerPaysShipping && ` + shipping $${calc.shipping.toFixed(2)}`}
            {calc.buyerVat > 0 && ` + VAT $${calc.buyerVat.toFixed(2)}`}
          </div>
          <div className="text-2xl font-bold text-fuchsia-300 tabular-nums">${calc.buyerTotal.toFixed(2)}</div>
        </div>
      </div>

      {/* Verdict */}
      {v && (
        <div className={`rounded-xl border px-5 py-4 ${vColorClass}`}>
          <div className="text-xs uppercase tracking-wide font-semibold mb-1 opacity-80">Verdict vs US comp of ${compNum.toFixed(2)}</div>
          <div className="text-2xl font-black mb-1">{v.label}</div>
          <div className="text-sm opacity-90">{v.desc}</div>
        </div>
      )}

      {/* Destination note */}
      <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-5">
        <div className="text-xs uppercase tracking-wide text-fuchsia-400 font-semibold mb-2">
          {country} — seller notes
        </div>
        <p className="text-sm text-gray-300 mb-2">{vatCfg.note}</p>
      </div>

      {/* Education */}
      <details className="group bg-gray-900/30 border border-gray-800 rounded-xl">
        <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium hover:text-fuchsia-400 transition-colors">
          How international card sales actually work for US sellers
          <span className="text-gray-500 group-open:rotate-180 transition-transform">&#9660;</span>
        </summary>
        <div className="px-4 pb-4 text-sm text-gray-400 space-y-2">
          <p><strong className="text-white">IOSS and equivalent schemes.</strong> Since 2021 the EU (€150), UK (£135), and Australia collect buyer-side VAT / GST at checkout through platforms like eBay. This removes customs hold on arrival but appears as a higher total to your buyer. Factor that into your pricing — a $200 card to a UK buyer actually costs them $240 all-in including VAT.</p>
          <p><strong className="text-white">First-Class International is the workhorse.</strong> For raw cards and single slabs, USPS FCPIS is $16-22 to most destinations and tracked via the destination post. For anything over $300 of value, Priority Mail International or DHL Express is worth the extra $15-25 for the insurance and tracking upgrade.</p>
          <p><strong className="text-white">Platform fee stack.</strong> eBay International adds 1.65% on top of the domestic 13.25% final-value fee — effectively 16-17% all-in with payment processing. Direct PayPal cross-border runs about 6% (4.49% + $0.49 + FX), but buyer-protection and chargeback risk shift entirely to you.</p>
          <p><strong className="text-white">Return-risk math.</strong> International returns on "not as described" claims are asymmetric — buyer is protected, seller eats inbound shipping or issues a no-return refund. Prudent sellers bake 3-8% of sale price into the asking price as a return reserve. Lower buffer for graded slabs (harder to dispute), higher for raw cards and sealed wax (easier to dispute).</p>
          <p><strong className="text-white">Currency risk.</strong> eBay converts in USD. Direct Wise / PayPal exposes you to FX variance between sale and settlement. For any listing over $1,000, consider locking the exchange rate at the time the offer is accepted.</p>
        </div>
      </details>

      <div className="text-xs text-gray-500 leading-relaxed">
        Estimates for informational use only. Platform fees, postal rates, VAT thresholds, and currency conversion all change —
        verify current rates with USPS, eBay, and your payment processor before listing. Tax guidance above is general; consult a
        CPA for high-volume international selling (over $10K annually).
      </div>
    </div>
  );
}

function Row({ label, value, hint, raw }: { label: string; value: number; hint?: string; raw?: boolean }) {
  const isNeg = value < 0;
  const display = raw ? (isNeg ? `-$${Math.abs(value).toFixed(2)}` : `$${value.toFixed(2)}`) : `$${value.toFixed(2)}`;
  const color = raw ? (isNeg ? 'text-rose-300' : 'text-white') : 'text-white';
  return (
    <div className="py-2.5 flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="text-gray-300">{label}</div>
        {hint && <div className="text-xs text-gray-500 mt-0.5">{hint}</div>}
      </div>
      <div className={`font-semibold tabular-nums ${color}`}>{display}</div>
    </div>
  );
}
