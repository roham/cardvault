'use client';

import { useEffect, useMemo, useState } from 'react';

type Carrier = 'usps' | 'ups' | 'fedex' | 'dhl' | 'private';
type ClaimType = 'lost' | 'damaged' | 'rifled' | 'partial';
type Role = 'seller' | 'buyer';

interface CarrierMeta {
  label: string;
  claimForm: string;
  filingWindow: string;
  includedCoverage: string;
  maxCoverage: string;
  filingUrl: string;
  evidence: string[];
  palette: string;
}

const CARRIERS: Record<Carrier, CarrierMeta> = {
  usps: {
    label: 'USPS',
    claimForm: 'PS Form 1000 (online claim)',
    filingWindow: '60 days from mailing date (Priority / Ground Advantage)',
    includedCoverage: '$100 free on Priority Mail & Ground Advantage',
    maxCoverage: '$5,000 (counter) / $10,000 (online)',
    filingUrl: 'usps.com/help/claims.htm',
    palette: 'blue',
    evidence: [
      'Tracking number & mailing receipt',
      'Proof of value (purchase receipt, invoice, or comp sale)',
      'Photos of damaged packaging (outer box, inner padding)',
      'Photos of the damaged item itself',
      'Original packaging retained (do not discard until claim resolves)',
      'USPS label & postage proof',
    ],
  },
  ups: {
    label: 'UPS',
    claimForm: 'Claims dashboard at ups.com/claims',
    filingWindow: '60 days from scheduled delivery date',
    includedCoverage: '$100 free Declared Value',
    maxCoverage: '$50,000 (ground) / $100,000 (air)',
    filingUrl: 'ups.com/claims',
    palette: 'amber',
    evidence: [
      'UPS tracking number & shipping receipt',
      'Declared Value proof & shipping label',
      'Photos of damaged packaging (all sides, multiple angles)',
      'Photos of damaged item & remaining packaging materials',
      'Repair estimate or replacement cost quote',
      'Invoice / purchase receipt proving value',
    ],
  },
  fedex: {
    label: 'FedEx',
    claimForm: 'Claim form at fedex.com/claims',
    filingWindow: '60 days domestic / 21 days international',
    includedCoverage: '$100 free Declared Value',
    maxCoverage: '$50,000 (Home Delivery) / $1,000 (Express Saver)',
    filingUrl: 'fedex.com/en-us/customer-support/claims.html',
    palette: 'purple',
    evidence: [
      'FedEx tracking number & air waybill',
      'Photos of damaged outer carton',
      'Photos of inner packaging & item damage',
      'Serial numbers or authentication (grading cert) if applicable',
      'Invoice or payment record for value substantiation',
      'Bank account / payment routing for refund disbursement',
    ],
  },
  dhl: {
    label: 'DHL',
    claimForm: 'Claim submission via DHL Customer Service',
    filingWindow: '30 days from delivery date (varies by service)',
    includedCoverage: '$100 USD free (Express) / varies by service',
    maxCoverage: '$25,000 per shipment (Express Worldwide)',
    filingUrl: 'dhl.com/us-en/home/customer-service/claims.html',
    palette: 'yellow',
    evidence: [
      'DHL tracking number & waybill',
      'Commercial invoice or customs declaration',
      'Photos of damaged parcel',
      'Photos of damaged contents',
      'Original retail or resale value documentation',
      'Export / import paperwork if cross-border',
    ],
  },
  private: {
    label: 'Private Insurance (Hugh Wood / CIS / Distinguished)',
    claimForm: 'Policy-specific claim form from insurer',
    filingWindow: 'Usually 30-60 days from incident discovery',
    includedCoverage: 'Per policy schedule',
    maxCoverage: 'Per policy limit ($100K+ possible)',
    filingUrl: 'contact insurer directly',
    palette: 'emerald',
    evidence: [
      'Policy number & insured schedule listing the item',
      'Recent appraisal or valuation (within 12 months)',
      'Photos of damage / documentation of loss',
      'Police or carrier incident report',
      'Purchase receipt or invoice',
      'Any prior claim history on the policy',
    ],
  },
};

const CLAIM_TYPES: Record<ClaimType, { label: string; description: string; palette: string }> = {
  lost: { label: 'Lost in transit', description: 'Package never delivered, tracking stopped updating', palette: 'rose' },
  damaged: { label: 'Damaged on arrival', description: 'Package arrived but contents crushed, bent, or broken', palette: 'amber' },
  rifled: { label: 'Rifled / contents missing', description: 'Box arrived tampered with, contents removed', palette: 'red' },
  partial: { label: 'Partial loss', description: 'Multi-item shipment with some items missing', palette: 'orange' },
};

const SERVICE_TIERS: Record<Carrier, string[]> = {
  usps: ['Ground Advantage', 'Priority Mail', 'Priority Mail Express', 'Registered Mail', 'First-Class (legacy)', 'Media Mail'],
  ups: ['UPS Ground', 'UPS 3-Day Select', '2nd Day Air', 'Next Day Air Saver', 'Next Day Air', 'UPS Worldwide Express'],
  fedex: ['FedEx Ground', 'Home Delivery', 'Express Saver', '2Day', 'Priority Overnight', 'International Economy', 'International Priority'],
  dhl: ['DHL Express Worldwide', 'DHL Express 9:00', 'DHL Express 12:00', 'DHL Parcel International'],
  private: ['Scheduled Policy', 'Blanket Policy', 'Transit Policy', 'In-Show Policy'],
};

interface FormState {
  role: Role;
  claimantName: string;
  claimantAddress: string;
  claimantEmail: string;
  claimantPhone: string;
  otherPartyName: string;
  otherPartyAddress: string;
  carrier: Carrier;
  service: string;
  tracking: string;
  shipDate: string;
  deliveryDate: string;
  incidentDate: string;
  originZip: string;
  destZip: string;
  claimType: ClaimType;
  cardDescription: string;
  cardGrade: string;
  cardCert: string;
  declaredValue: string;
  purchasePrice: string;
  purchaseSource: string;
  incidentDescription: string;
  evidenceNotes: string;
  requestedAmount: string;
  paymentMethod: string;
  closing: string;
}

const DEFAULT_FORM: FormState = {
  role: 'seller',
  claimantName: '',
  claimantAddress: '',
  claimantEmail: '',
  claimantPhone: '',
  otherPartyName: '',
  otherPartyAddress: '',
  carrier: 'usps',
  service: 'Priority Mail',
  tracking: '',
  shipDate: '',
  deliveryDate: '',
  incidentDate: '',
  originZip: '',
  destZip: '',
  claimType: 'damaged',
  cardDescription: '',
  cardGrade: '',
  cardCert: '',
  declaredValue: '',
  purchasePrice: '',
  purchaseSource: '',
  incidentDescription: '',
  evidenceNotes: '',
  requestedAmount: '',
  paymentMethod: 'ACH / direct deposit',
  closing: 'Respectfully',
};

const STORAGE_KEY = 'cv_shipping_claim_draft_v1';

const PALETTE_ACCENT: Record<string, string> = {
  blue: 'text-blue-400 border-blue-500/40 bg-blue-500/10',
  amber: 'text-amber-400 border-amber-500/40 bg-amber-500/10',
  purple: 'text-purple-400 border-purple-500/40 bg-purple-500/10',
  yellow: 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10',
  emerald: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
  rose: 'text-rose-400 border-rose-500/40 bg-rose-500/10',
  red: 'text-red-400 border-red-500/40 bg-red-500/10',
  orange: 'text-orange-400 border-orange-500/40 bg-orange-500/10',
};

function formatDate(iso: string): string {
  if (!iso) return '__________';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatMoney(raw: string): string {
  if (!raw) return '$__________';
  const n = parseFloat(raw.replace(/[$,]/g, ''));
  if (isNaN(n)) return raw;
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function ShippingClaimClient() {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [loaded, setLoaded] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setForm({ ...DEFAULT_FORM, ...parsed });
      }
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    } catch {}
  }, [form, loaded]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function handleCarrierChange(c: Carrier) {
    const tiers = SERVICE_TIERS[c];
    setForm(prev => ({ ...prev, carrier: c, service: tiers[0] }));
  }

  const carrierMeta = CARRIERS[form.carrier];
  const claimMeta = CLAIM_TYPES[form.claimType];

  const filledCount = useMemo(() => {
    const required: (keyof FormState)[] = [
      'claimantName', 'claimantAddress', 'tracking', 'shipDate',
      'cardDescription', 'declaredValue', 'purchasePrice', 'incidentDescription',
    ];
    return required.filter(k => (form[k] as string).trim().length > 0).length;
  }, [form]);

  const letterText = useMemo(() => buildLetter(form, carrierMeta, claimMeta), [form, carrierMeta, claimMeta]);

  function copyLetter() {
    navigator.clipboard.writeText(letterText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function printLetter() {
    const w = window.open('', '_blank');
    if (!w) return;
    const doc = w.document;
    doc.title = 'Shipping Insurance Claim';
    const style = doc.createElement('style');
    style.textContent = 'body{font-family:Georgia,serif;max-width:720px;margin:40px auto;padding:0 24px;line-height:1.55;color:#111;}h1{font-size:20px;margin-bottom:4px;}pre{white-space:pre-wrap;font-family:Georgia,serif;font-size:14px;}@media print{body{margin:20px;}}';
    doc.head.appendChild(style);
    const h1 = doc.createElement('h1');
    h1.textContent = 'Shipping Insurance Claim';
    doc.body.appendChild(h1);
    const meta = doc.createElement('p');
    meta.style.cssText = 'font-size:12px;color:#666;margin-bottom:24px;';
    meta.textContent = `Generated by CardVault • ${new Date().toLocaleDateString()}`;
    doc.body.appendChild(meta);
    const pre = doc.createElement('pre');
    pre.textContent = letterText;
    doc.body.appendChild(pre);
    setTimeout(() => w.print(), 200);
  }

  function resetForm() {
    if (!confirm('Clear the entire draft?')) return;
    setForm(DEFAULT_FORM);
  }

  const accentClass = PALETTE_ACCENT[carrierMeta.palette] ?? PALETTE_ACCENT.blue;
  const claimAccent = PALETTE_ACCENT[claimMeta.palette] ?? PALETTE_ACCENT.amber;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3 space-y-6">
        <div className="flex items-center justify-between bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3">
          <div className="text-sm">
            <span className="text-gray-400">Draft progress</span>
            <span className="ml-2 font-bold text-white">{filledCount}/8 required fields</span>
          </div>
          <div className={`text-xs font-semibold px-2 py-1 rounded-full ${filledCount >= 8 ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'bg-gray-700/40 text-gray-400 border border-gray-700'}`}>
            {filledCount >= 8 ? '✓ READY' : 'DRAFT'}
          </div>
        </div>

        <section className="bg-gray-900/40 border border-gray-800 rounded-2xl p-5">
          <h3 className="text-lg font-bold text-white mb-3">1. Who is filing?</h3>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {(['seller', 'buyer'] as Role[]).map(r => (
              <button
                key={r}
                type="button"
                onClick={() => update('role', r)}
                className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${form.role === r ? 'border-teal-500 bg-teal-500/10 text-teal-300' : 'border-gray-800 bg-black/30 text-gray-400 hover:border-gray-700'}`}
              >
                {r === 'seller' ? 'Seller / Shipper' : 'Buyer / Recipient'}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Your name" value={form.claimantName} onChange={v => update('claimantName', v)} placeholder="John Collector" />
            <Input label="Email" value={form.claimantEmail} onChange={v => update('claimantEmail', v)} type="email" placeholder="you@email.com" />
            <Input label="Phone" value={form.claimantPhone} onChange={v => update('claimantPhone', v)} placeholder="(555) 123-4567" />
            <Input label="Mailing address" value={form.claimantAddress} onChange={v => update('claimantAddress', v)} placeholder="123 Main St, City, ST 12345" />
            <Input label="Other party name" value={form.otherPartyName} onChange={v => update('otherPartyName', v)} placeholder={form.role === 'seller' ? 'Buyer name' : 'Seller name'} />
            <Input label="Other party address (optional)" value={form.otherPartyAddress} onChange={v => update('otherPartyAddress', v)} placeholder="City, ST ZIP" />
          </div>
        </section>

        <section className="bg-gray-900/40 border border-gray-800 rounded-2xl p-5">
          <h3 className="text-lg font-bold text-white mb-3">2. Carrier & shipment</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
            {(Object.keys(CARRIERS) as Carrier[]).map(c => (
              <button
                key={c}
                type="button"
                onClick={() => handleCarrierChange(c)}
                className={`px-2 py-2 rounded-lg text-xs font-bold border transition-colors ${form.carrier === c ? 'border-teal-500 bg-teal-500/10 text-teal-300' : 'border-gray-800 bg-black/30 text-gray-400 hover:border-gray-700'}`}
              >
                {CARRIERS[c].label.split(' ')[0]}
              </button>
            ))}
          </div>
          <div className={`rounded-lg border p-3 mb-4 text-xs ${accentClass}`}>
            <div className="font-semibold mb-1">{carrierMeta.label} • {carrierMeta.claimForm}</div>
            <div className="opacity-80">File at {carrierMeta.filingUrl} — deadline: {carrierMeta.filingWindow}</div>
            <div className="opacity-80 mt-1">Included coverage: {carrierMeta.includedCoverage} • Max: {carrierMeta.maxCoverage}</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Service level"
              value={form.service}
              onChange={v => update('service', v)}
              options={SERVICE_TIERS[form.carrier]}
            />
            <Input label="Tracking #" value={form.tracking} onChange={v => update('tracking', v)} placeholder="9400..." />
            <Input label="Ship date" value={form.shipDate} onChange={v => update('shipDate', v)} type="date" />
            <Input label="Scheduled / actual delivery date" value={form.deliveryDate} onChange={v => update('deliveryDate', v)} type="date" />
            <Input label="Origin ZIP" value={form.originZip} onChange={v => update('originZip', v)} placeholder="10001" />
            <Input label="Destination ZIP" value={form.destZip} onChange={v => update('destZip', v)} placeholder="94102" />
          </div>
        </section>

        <section className="bg-gray-900/40 border border-gray-800 rounded-2xl p-5">
          <h3 className="text-lg font-bold text-white mb-3">3. Incident</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            {(Object.keys(CLAIM_TYPES) as ClaimType[]).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => update('claimType', t)}
                className={`px-2 py-2 rounded-lg text-xs font-bold border transition-colors ${form.claimType === t ? 'border-teal-500 bg-teal-500/10 text-teal-300' : 'border-gray-800 bg-black/30 text-gray-400 hover:border-gray-700'}`}
              >
                {CLAIM_TYPES[t].label.split(' ')[0]}
              </button>
            ))}
          </div>
          <div className={`rounded-lg border p-3 mb-4 text-xs ${claimAccent}`}>
            <div className="font-semibold">{claimMeta.label}</div>
            <div className="opacity-80 mt-1">{claimMeta.description}</div>
          </div>
          <Input label="Incident / discovery date" value={form.incidentDate} onChange={v => update('incidentDate', v)} type="date" />
          <div className="mt-3">
            <label className="block text-xs font-medium text-gray-400 mb-1">What happened (be factual, no speculation)</label>
            <textarea
              value={form.incidentDescription}
              onChange={e => update('incidentDescription', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 bg-black/40 border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:border-teal-500/60"
              placeholder="Package tracking last updated [DATE] with status [STATUS]. Recipient reported [X] on [DATE]. Outer box showed [condition]. Inner padding [condition]. Card sustained [specific damage] to [location]."
            />
          </div>
        </section>

        <section className="bg-gray-900/40 border border-gray-800 rounded-2xl p-5">
          <h3 className="text-lg font-bold text-white mb-3">4. Item & value</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Card description" value={form.cardDescription} onChange={v => update('cardDescription', v)} placeholder="2011 Topps Update Mike Trout RC #US175" />
            <Input label="Grade (if graded)" value={form.cardGrade} onChange={v => update('cardGrade', v)} placeholder="PSA 10, BGS 9.5..." />
            <Input label="Cert number" value={form.cardCert} onChange={v => update('cardCert', v)} placeholder="12345678" />
            <Input label="Declared value at shipping" value={form.declaredValue} onChange={v => update('declaredValue', v)} placeholder="2500.00" />
            <Input label="Documented purchase price" value={form.purchasePrice} onChange={v => update('purchasePrice', v)} placeholder="2400.00" />
            <Input label="Purchase source" value={form.purchaseSource} onChange={v => update('purchaseSource', v)} placeholder="eBay listing 12345, PWCC auction..." />
          </div>
        </section>

        <section className="bg-gray-900/40 border border-gray-800 rounded-2xl p-5">
          <h3 className="text-lg font-bold text-white mb-3">5. Evidence attached</h3>
          <div className="mb-3 text-xs text-gray-400">
            Check off what you&apos;re submitting with this claim. The letter references your attached evidence.
          </div>
          <ul className="space-y-1.5 text-sm text-gray-300 mb-3">
            {carrierMeta.evidence.map((e, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-teal-400 mt-0.5">✓</span>
                <span>{e}</span>
              </li>
            ))}
          </ul>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Additional evidence notes</label>
            <textarea
              value={form.evidenceNotes}
              onChange={e => update('evidenceNotes', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-black/40 border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:border-teal-500/60"
              placeholder="e.g. PSA pop-report snapshot showing market comp, video of unboxing, recipient signed statement..."
            />
          </div>
        </section>

        <section className="bg-gray-900/40 border border-gray-800 rounded-2xl p-5">
          <h3 className="text-lg font-bold text-white mb-3">6. Requested resolution</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Requested payout amount" value={form.requestedAmount} onChange={v => update('requestedAmount', v)} placeholder="2500.00" />
            <Select
              label="Preferred payment method"
              value={form.paymentMethod}
              onChange={v => update('paymentMethod', v)}
              options={['ACH / direct deposit', 'Paper check', 'Credit back to shipping account', 'PayPal', 'Wire transfer']}
            />
          </div>
        </section>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={copyLetter}
            className="px-4 py-2 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/40 text-sm font-semibold hover:bg-teal-500/30 transition-colors"
          >
            {copied ? '✓ Copied' : '📋 Copy letter'}
          </button>
          <button
            type="button"
            onClick={printLetter}
            className="px-4 py-2 rounded-lg bg-gray-800 text-gray-200 border border-gray-700 text-sm font-semibold hover:bg-gray-700 transition-colors"
          >
            🖨️ Print / Save PDF
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="px-4 py-2 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/30 text-sm font-semibold hover:bg-rose-500/20 transition-colors ml-auto"
          >
            Reset draft
          </button>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="lg:sticky lg:top-4 space-y-3">
          <div className="flex items-center justify-between text-xs uppercase tracking-wider text-gray-500 px-1">
            <span>Live preview</span>
            <span className="font-mono">{filledCount >= 8 ? 'READY' : 'DRAFT'}</span>
          </div>
          <pre className="bg-stone-100 text-stone-900 p-5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap overflow-x-auto font-serif min-h-[520px] border border-stone-300 max-h-[85vh] overflow-y-auto">
            {letterText}
          </pre>
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-black/40 border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:border-teal-500/60"
      />
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-black/40 border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:border-teal-500/60"
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function buildLetter(f: FormState, carrier: CarrierMeta, claim: { label: string; description: string }): string {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const name = f.claimantName || '[YOUR NAME]';
  const role = f.role === 'seller' ? 'Shipper (Seller)' : 'Recipient (Buyer)';
  const otherRole = f.role === 'seller' ? 'Recipient' : 'Shipper';
  const amount = formatMoney(f.requestedAmount || f.declaredValue || f.purchasePrice);
  const itemLine = [f.cardDescription, f.cardGrade && `— ${f.cardGrade}`, f.cardCert && `Cert ${f.cardCert}`].filter(Boolean).join(' ');

  return `${today}

${carrier.label} Claims Department
Via: ${carrier.filingUrl}
Form: ${carrier.claimForm}

Re: Insurance Claim — ${claim.label}
Tracking: ${f.tracking || '[TRACKING NUMBER]'}
Shipped: ${formatDate(f.shipDate)} • Service: ${f.service}
Ship Origin → Destination: ${f.originZip || '[ORIGIN]'} → ${f.destZip || '[DEST]'}

Dear Claims Adjuster,

I am submitting this claim as the ${role} of the shipment above. The ${otherRole.toLowerCase()} is ${f.otherPartyName || '[OTHER PARTY]'}${f.otherPartyAddress ? ` of ${f.otherPartyAddress}` : ''}.

INCIDENT SUMMARY
Incident type: ${claim.label}
Incident / discovery date: ${formatDate(f.incidentDate)}
Scheduled delivery: ${formatDate(f.deliveryDate)}

${f.incidentDescription || '[Provide a factual account of the incident in one to two paragraphs — tracking status, packaging condition, damage specifics, and any contact with the other party.]'}

ITEM DESCRIPTION
${itemLine || '[Card description — year, brand, set, player, parallel, grade]'}
Declared value at shipping: ${formatMoney(f.declaredValue)}
Documented purchase price: ${formatMoney(f.purchasePrice)}${f.purchaseSource ? `\nPurchase source: ${f.purchaseSource}` : ''}

REQUESTED SETTLEMENT
Amount requested: ${amount}
Preferred disbursement: ${f.paymentMethod}

EVIDENCE ATTACHED
${carrier.evidence.map((e, i) => `${i + 1}. ${e}`).join('\n')}${f.evidenceNotes ? `\n\nAdditional evidence:\n${f.evidenceNotes}` : ''}

ATTESTATION
I certify that the facts stated in this claim are true and accurate to the best of my knowledge. I acknowledge that knowingly filing a false claim is a federal offense under 18 U.S.C. § 1341 (mail fraud) where applicable. All supporting documentation is authentic and unaltered.

Please confirm receipt of this claim and provide a case number. I am available for follow-up questions at ${f.claimantEmail || '[EMAIL]'}${f.claimantPhone ? ` or ${f.claimantPhone}` : ''}.

${f.closing},

${name}
${f.claimantAddress || '[Your mailing address]'}
${f.claimantEmail || '[Your email]'}
${f.claimantPhone || ''}
Filed: ${today}`;
}
