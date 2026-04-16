'use client';

import { useMemo, useState } from 'react';

type Country = 'Japan' | 'UK' | 'Canada' | 'Germany' | 'Australia' | 'Hong Kong' | 'France' | 'Italy' | 'Mexico' | 'Other';
type Method = 'economy' | 'tracked' | 'express';
type Weight = 'raw' | 'toploader' | 'slab' | 'box';
type UsState = 'CA' | 'NY' | 'TX' | 'FL' | 'PA' | 'WA' | 'IL' | 'OH' | 'NJ' | 'MI' | 'none' | 'other';

const COUNTRIES: Country[] = ['Japan', 'UK', 'Canada', 'Germany', 'Australia', 'Hong Kong', 'France', 'Italy', 'Mexico', 'Other'];

const SHIPPING_BASE: Record<Country, Record<Method, number>> = {
  Japan:        { economy: 8,  tracked: 30, express: 45 },
  UK:           { economy: 12, tracked: 25, express: 55 },
  Canada:       { economy: 10, tracked: 25, express: 40 },
  Germany:      { economy: 15, tracked: 28, express: 50 },
  Australia:    { economy: 18, tracked: 35, express: 60 },
  'Hong Kong':  { economy: 10, tracked: 28, express: 45 },
  France:       { economy: 15, tracked: 28, express: 50 },
  Italy:        { economy: 18, tracked: 32, express: 55 },
  Mexico:       { economy: 10, tracked: 22, express: 40 },
  Other:        { economy: 20, tracked: 35, express: 55 },
};

const METHOD_LABEL: Record<Method, string> = {
  economy: 'Economy postal (slowest, duty-free de minimis)',
  tracked: 'Tracked / registered (sweet spot)',
  express: 'Express courier — DHL / FedEx (fastest, broker fee)',
};

const WEIGHT_MULT: Record<Weight, number> = {
  raw: 1.0,
  toploader: 1.15,
  slab: 1.9,
  box: 2.6,
};

const WEIGHT_LABEL: Record<Weight, string> = {
  raw: 'Raw card in penny sleeve (~5g)',
  toploader: 'Card in toploader + team bag (~15g)',
  slab: 'Graded slab (PSA / BGS / CGC, ~180g)',
  box: 'Small box / multiple slabs (~500g)',
};

const STATE_TAX: Record<UsState, { label: string; rate: number }> = {
  CA:    { label: 'California', rate: 0.0725 },
  NY:    { label: 'New York (NYC)', rate: 0.08875 },
  TX:    { label: 'Texas', rate: 0.0625 },
  FL:    { label: 'Florida', rate: 0.06 },
  PA:    { label: 'Pennsylvania', rate: 0.06 },
  WA:    { label: 'Washington', rate: 0.065 },
  IL:    { label: 'Illinois', rate: 0.0625 },
  OH:    { label: 'Ohio', rate: 0.0575 },
  NJ:    { label: 'New Jersey', rate: 0.06625 },
  MI:    { label: 'Michigan', rate: 0.06 },
  none:  { label: 'No sales tax (OR / NH / MT / DE / AK)', rate: 0 },
  other: { label: 'Other US state (estimate 6.00%)', rate: 0.06 },
};

const COUNTRY_NOTE: Record<Country, { vat: string; caveat: string }> = {
  Japan: {
    vat: 'Japan consumption tax is removed on exports.',
    caveat: 'Yahoo Japan auctions almost always require a proxy service (Buyee, ZenMarket, FromJapan). Add proxy fees (10-15% of hammer price) plus domestic shipping to the proxy warehouse. EMS is the safe middle ground for $100+ cards; DHL or FedEx above $500.',
  },
  UK: {
    vat: 'UK VAT (20%) can be removed on export — confirm the seller issues an ex-VAT invoice for US buyers.',
    caveat: 'Many UK sellers keep VAT in the sticker price by default. Always ask before paying. Royal Mail International Tracked is reliable but slow; DHL Express is the premium option for graded vintage.',
  },
  Canada: {
    vat: 'GST / HST is removed on exports from Canadian sellers.',
    caveat: 'COMC, Steel City, and other US-facing Canadian dealers already handle border paperwork. Direct-from-seller via Canada Post is usually friction-free at de minimis.',
  },
  Germany: {
    vat: 'German VAT (19%) is removed on export — the seller must mark the parcel as an export shipment.',
    caveat: 'Deutsche Post Priority is fast (7-10 days) and almost always duty-free at de minimis. DHL Express adds a broker fee but delivers in 3 business days.',
  },
  Australia: {
    vat: 'Australian GST (10%) is removed on exports.',
    caveat: 'Australia Post Sea Mail is the cheapest option but takes 6-8 weeks. Air Mail Tracked is the sweet spot for $50-500 cards.',
  },
  'Hong Kong': {
    vat: 'Hong Kong has no sales tax or VAT.',
    caveat: 'HK Post Air Mail is fast (5-7 days) and typically duty-free for cards below $800. A major source for Japanese-set Pokemon and graded Asian vintage.',
  },
  France: {
    vat: 'French VAT (20%) is removed on export.',
    caveat: 'La Poste Colissimo International is reliable and tracked. DHL is the premium option with a broker fee but 3-day delivery.',
  },
  Italy: {
    vat: 'Italian VAT (22%) is removed on export.',
    caveat: 'Poste Italiane Raccomandata is tracked but notoriously slow (3-4 weeks). Private couriers (DHL / UPS) are worth the extra cost for valuable cards.',
  },
  Mexico: {
    vat: 'Mexican IVA (16%) is removed on exports to the US.',
    caveat: 'Express courier is strongly recommended — Correos de México is unreliable for cards. Cross-border consignment services are emerging as an alternative.',
  },
  Other: {
    vat: 'Most origin countries remove VAT / consumption tax on documented exports.',
    caveat: 'Landed-cost surprises are most common from unfamiliar origins. Always request a total quote (card + shipping + any brokerage) in writing before paying.',
  },
};

const DE_MINIMIS = 800;

type CalcResult = {
  shipping: number;
  duty: number;
  cbpFee: number;
  brokerFee: number;
  useTax: number;
  landed: number;
};

function calculate(cardPrice: number, country: Country, method: Method, weight: Weight, state: UsState): CalcResult {
  const shipping = +(SHIPPING_BASE[country][method] * WEIGHT_MULT[weight]).toFixed(2);

  // HTS 4911.91 (printed pictures / designs) has a 0% MFN duty rate for most sports cards.
  const duty = 0;

  // US Customs and Border Protection fees
  let cbpFee = 0;
  if (cardPrice > DE_MINIMIS && cardPrice <= 2500) {
    cbpFee = 2.22; // informal entry merchandise processing fee (flat)
  } else if (cardPrice > 2500) {
    cbpFee = +Math.min(Math.max(cardPrice * 0.003464, 31.67), 614.35).toFixed(2);
  }

  // Broker fee — express couriers charge when a formal entry is required (over de minimis).
  // For low-value express parcels, brokerage is usually waived.
  const brokerFee = method === 'express' && cardPrice > DE_MINIMIS ? 18 : 0;

  const useTax = +(cardPrice * STATE_TAX[state].rate).toFixed(2);

  const landed = +(cardPrice + shipping + duty + cbpFee + brokerFee + useTax).toFixed(2);

  return { shipping, duty, cbpFee, brokerFee, useTax, landed };
}

function verdict(landed: number, comp: number) {
  if (!comp || comp <= 0) return null;
  const ratio = landed / comp;
  if (ratio < 0.85) {
    return {
      label: 'SEND IT',
      desc: `Landed cost is ${Math.round((1 - ratio) * 100)}% under US market. Clear value — import likely worth the wait.`,
      color: 'emerald' as const,
    };
  }
  if (ratio < 1.00) {
    return {
      label: 'FAIR DEAL',
      desc: `Landed cost is ${Math.round((1 - ratio) * 100)}% under US market. Marginal savings; consider if US supply is thin.`,
      color: 'sky' as const,
    };
  }
  if (ratio < 1.10) {
    return {
      label: 'BREAKEVEN',
      desc: 'Landed cost is within 10% of US market. Skip unless the specific copy is hard to find domestic.',
      color: 'amber' as const,
    };
  }
  return {
    label: 'OVERPRICED',
    desc: `Landed cost is ${Math.round((ratio - 1) * 100)}% over US market. Source domestic instead.`,
    color: 'rose' as const,
  };
}

export default function ImportCalculatorClient() {
  const [cardPrice, setCardPrice] = useState<string>('250');
  const [country, setCountry] = useState<Country>('Japan');
  const [method, setMethod] = useState<Method>('tracked');
  const [weight, setWeight] = useState<Weight>('toploader');
  const [state, setState] = useState<UsState>('CA');
  const [compPrice, setCompPrice] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const priceNum = Math.max(0, parseFloat(cardPrice) || 0);
  const compNum = Math.max(0, parseFloat(compPrice) || 0);

  const calc = useMemo(
    () => calculate(priceNum, country, method, weight, state),
    [priceNum, country, method, weight, state]
  );

  const v = useMemo(() => verdict(calc.landed, compNum), [calc.landed, compNum]);

  const note = COUNTRY_NOTE[country];

  const handleCopy = () => {
    const lines = [
      'CardVault Import Calculator',
      `Card: $${priceNum.toFixed(2)} from ${country}`,
      `Shipping (${method}, ${weight}): $${calc.shipping.toFixed(2)}`,
      `Duty: $${calc.duty.toFixed(2)} | CBP fees: $${calc.cbpFee.toFixed(2)} | Broker: $${calc.brokerFee.toFixed(2)}`,
      `State use tax (${STATE_TAX[state].label}): $${calc.useTax.toFixed(2)}`,
      `Landed total: $${calc.landed.toFixed(2)}`,
      v ? `Verdict: ${v.label} — ${v.desc}` : '',
      '— Via CardVault',
    ].filter(Boolean);
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const deMinimisStatus = priceNum <= DE_MINIMIS
    ? { label: 'Under $800 de minimis', tone: 'emerald' as const, desc: 'No customs duty. No CBP merchandise fee. Typically no broker fee on postal channel.' }
    : priceNum <= 2500
      ? { label: '$800 – $2,500 informal entry', tone: 'amber' as const, desc: 'Flat $2.22 CBP fee applies. Express couriers usually add a broker fee (~$18). Postal usually waives.' }
      : { label: 'Over $2,500 formal entry', tone: 'rose' as const, desc: 'Merchandise Processing Fee (0.3464% of value, min $31.67) applies. Broker fee likely required regardless of carrier.' };

  const vColorClass = v
    ? {
        emerald: 'bg-emerald-950/40 border-emerald-700/40 text-emerald-300',
        sky:     'bg-sky-950/40 border-sky-700/40 text-sky-300',
        amber:   'bg-amber-950/40 border-amber-700/40 text-amber-300',
        rose:    'bg-rose-950/40 border-rose-700/40 text-rose-300',
      }[v.color]
    : '';

  const dmColorClass = {
    emerald: 'bg-emerald-950/40 border-emerald-700/40 text-emerald-300',
    amber:   'bg-amber-950/40 border-amber-700/40 text-amber-300',
    rose:    'bg-rose-950/40 border-rose-700/40 text-rose-300',
  }[deMinimisStatus.tone];

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-5 sm:p-6">
        <h2 className="text-white font-semibold mb-4">Your Import</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-xs uppercase tracking-wide text-gray-500 font-medium">Card price (USD)</span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={cardPrice}
              onChange={(e) => setCardPrice(e.target.value)}
              className="mt-1 w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
              placeholder="e.g. 250"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wide text-gray-500 font-medium">Origin country</span>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value as Country)}
              className="mt-1 w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wide text-gray-500 font-medium">Shipping method</span>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as Method)}
              className="mt-1 w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
            >
              {(['economy', 'tracked', 'express'] as Method[]).map((m) => (
                <option key={m} value={m}>{METHOD_LABEL[m]}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wide text-gray-500 font-medium">Parcel weight / form</span>
            <select
              value={weight}
              onChange={(e) => setWeight(e.target.value as Weight)}
              className="mt-1 w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
            >
              {(['raw', 'toploader', 'slab', 'box'] as Weight[]).map((w) => (
                <option key={w} value={w}>{WEIGHT_LABEL[w]}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wide text-gray-500 font-medium">Destination state</span>
            <select
              value={state}
              onChange={(e) => setState(e.target.value as UsState)}
              className="mt-1 w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
            >
              {(Object.keys(STATE_TAX) as UsState[]).map((s) => (
                <option key={s} value={s}>
                  {STATE_TAX[s].label} ({(STATE_TAX[s].rate * 100).toFixed(2)}%)
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wide text-gray-500 font-medium">US comp price (optional)</span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={compPrice}
              onChange={(e) => setCompPrice(e.target.value)}
              className="mt-1 w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
              placeholder="e.g. 320 (for verdict)"
            />
          </label>
        </div>
      </div>

      {/* De minimis badge */}
      <div className={`rounded-xl border px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2 ${dmColorClass}`}>
        <span className="font-semibold text-sm">{deMinimisStatus.label}</span>
        <span className="text-xs opacity-80">{deMinimisStatus.desc}</span>
      </div>

      {/* Breakdown */}
      <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-5 sm:p-6">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-white font-semibold">Landed Cost Breakdown</h2>
          <button
            onClick={handleCopy}
            className="text-xs uppercase tracking-wide px-3 py-1.5 bg-sky-950/60 border border-sky-800/50 text-sky-300 rounded-full hover:bg-sky-900/60 transition"
          >
            {copied ? 'Copied' : 'Copy summary'}
          </button>
        </div>
        <div className="divide-y divide-gray-800/60 text-sm">
          <Row label="Card price" value={priceNum} />
          <Row label={`Shipping (${method}, ${weight})`} value={calc.shipping} />
          <Row
            label="Customs duty"
            value={calc.duty}
            hint="HTS 4911.91 printed-card classification — 0% MFN rate for most sports and trading cards."
          />
          <Row
            label="CBP merchandise fee"
            value={calc.cbpFee}
            hint={priceNum <= DE_MINIMIS ? 'Waived under $800 de minimis.' : priceNum <= 2500 ? 'Flat $2.22 informal entry fee.' : '0.3464% of declared value (min $31.67, max $614.35).'}
          />
          <Row
            label="Carrier broker fee"
            value={calc.brokerFee}
            hint={method === 'express' && priceNum > DE_MINIMIS ? 'DHL / FedEx / UPS charge this when formal entry is required.' : 'No broker fee — postal channel or under de minimis.'}
          />
          <Row
            label={`State use tax (${STATE_TAX[state].label})`}
            value={calc.useTax}
            hint={STATE_TAX[state].rate === 0 ? 'No sales tax in your state.' : 'Most states require use tax on out-of-state purchases; many collectors do not self-report, but the liability exists.'}
          />
        </div>
        <div className="mt-5 pt-4 border-t border-gray-700 flex items-baseline justify-between">
          <span className="text-sm uppercase tracking-wide text-gray-400 font-semibold">Landed total</span>
          <span className="text-3xl font-black text-white">${calc.landed.toFixed(2)}</span>
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

      {/* Country note */}
      <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-5">
        <div className="text-xs uppercase tracking-wide text-sky-400 font-semibold mb-2">
          {country} — buyer notes
        </div>
        <p className="text-sm text-gray-300 mb-2">{note.vat}</p>
        <p className="text-sm text-gray-400">{note.caveat}</p>
      </div>

      {/* Education */}
      <details className="group bg-gray-900/30 border border-gray-800 rounded-xl">
        <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium hover:text-sky-400 transition-colors">
          How US customs treats imported trading cards
          <span className="text-gray-500 group-open:rotate-180 transition-transform">&#9660;</span>
        </summary>
        <div className="px-4 pb-4 text-sm text-gray-400 space-y-2">
          <p><strong className="text-white">De minimis ($800).</strong> Personal imports under $800 per shipment enter duty-free and fee-free. Splitting one $1,200 purchase into two $600 shipments is a legal and commonly-used tactic — as long as the two parcels are truly separate transactions.</p>
          <p><strong className="text-white">Zero duty on cards.</strong> Sports and trading cards classify under HTS 4911.91 (printed pictures / designs), which carries a 0% MFN duty rate regardless of origin. Even above de minimis you pay no duty — only CBP fees and possibly a broker charge.</p>
          <p><strong className="text-white">Postal vs express channel.</strong> USPS, Royal Mail, Canada Post, Japan Post and other national postal services hand off to USPS at the border, which processes under the informal-entry lane with minimal fees. DHL, FedEx, UPS each act as their own brokers and add fees when formal entry is needed.</p>
          <p><strong className="text-white">State use tax.</strong> 45 states require residents to self-report use tax on out-of-state purchases. Enforcement is mostly honor-system at the individual level, but high-value transactions over $5,000 can surface in state audits. Oregon, New Hampshire, Montana, Delaware, and Alaska have no sales tax.</p>
          <p><strong className="text-white">Declared value fraud.</strong> Sellers sometimes offer to declare a $500 card as "gift, $50" on the customs form. This is customs fraud, voids insurance, and if the parcel is lost you recover the declared value only. Always declare true value.</p>
        </div>
      </details>

      <div className="text-xs text-gray-500 leading-relaxed">
        Estimates for informational use only. CBP fees and carrier charges change; call the carrier or your customs broker for
        binding quotes on any shipment over $2,500. State use tax rates shown are state-base rates — local municipalities
        may add 1-4 percentage points.
      </div>
    </div>
  );
}

function Row({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="py-2.5 flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="text-gray-300">{label}</div>
        {hint && <div className="text-xs text-gray-500 mt-0.5">{hint}</div>}
      </div>
      <div className="text-white font-semibold tabular-nums">${value.toFixed(2)}</div>
    </div>
  );
}
