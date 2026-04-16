'use client';

import { useMemo, useState } from 'react';

type ConsigneeType =
  | 'major-auction-house'
  | 'regional-auction-house'
  | 'local-card-shop'
  | 'online-consignment-broker'
  | 'private-dealer'
  | 'ebay-consignment-broker';

type UnsoldHandling = 'return-at-consignee-cost' | 'return-at-consignor-cost' | 'relist-with-approval' | 'donate';
type PayoutMethod = 'Check' | 'ACH' | 'Wire' | 'PayPal' | 'Zelle';

interface CardRow {
  id: number;
  description: string;
  reserve: string;
  estimateLow: string;
  estimateHigh: string;
}

interface FormState {
  // Consignor (card owner)
  consignorName: string;
  consignorAddress: string;
  consignorCity: string;
  consignorState: string;
  consignorZip: string;
  consignorEmail: string;
  consignorPhone: string;

  // Consignee (auction house / dealer)
  consigneeName: string;
  consigneeType: ConsigneeType;
  consigneeAddress: string;
  consigneeCity: string;
  consigneeState: string;
  consigneeZip: string;

  // Terms
  sellerCommissionPct: string;
  buyerPremiumPct: string;
  buyerPremiumPassthrough: boolean;
  receivedDate: string;
  listingStartDate: string;
  auctionDate: string;
  settlementDays: string;
  payoutMethod: PayoutMethod;
  payoutFeeResponsibility: 'consignor' | 'consignee';

  // Insurance
  insuranceCovered: boolean;
  insuranceCarrier: string;
  insuranceLimit: string;

  // Unsold lots
  unsoldHandling: UnsoldHandling;
  returnShippingResponsibility: 'consignor' | 'consignee';

  // Withdrawal
  inspectionWindowHours: string;
  withdrawalFeePct: string;

  // Jurisdiction
  jurisdictionState: string;

  // Cards
  cards: CardRow[];

  // Notes
  notes: string;
}

const CONSIGNEE_TYPE_LABELS: Record<ConsigneeType, string> = {
  'major-auction-house': 'Major National Auction House (Heritage / Goldin / PWCC / REA / Lelands)',
  'regional-auction-house': 'Regional Auction House',
  'local-card-shop': 'Local Card Shop',
  'online-consignment-broker': 'Online Consignment Broker (MySlabs / Probstein / Alt)',
  'private-dealer': 'Private Dealer',
  'ebay-consignment-broker': 'eBay Consignment Broker',
};

const TYPE_DEFAULTS: Record<ConsigneeType, Partial<FormState>> = {
  'major-auction-house': { sellerCommissionPct: '17.5', buyerPremiumPct: '22', buyerPremiumPassthrough: true, settlementDays: '45', insuranceCovered: true },
  'regional-auction-house': { sellerCommissionPct: '15', buyerPremiumPct: '20', buyerPremiumPassthrough: true, settlementDays: '30', insuranceCovered: true },
  'local-card-shop': { sellerCommissionPct: '30', buyerPremiumPct: '0', buyerPremiumPassthrough: false, settlementDays: '14', insuranceCovered: false },
  'online-consignment-broker': { sellerCommissionPct: '12.5', buyerPremiumPct: '17.5', buyerPremiumPassthrough: true, settlementDays: '21', insuranceCovered: true },
  'private-dealer': { sellerCommissionPct: '20', buyerPremiumPct: '0', buyerPremiumPassthrough: false, settlementDays: '14', insuranceCovered: false },
  'ebay-consignment-broker': { sellerCommissionPct: '12', buyerPremiumPct: '0', buyerPremiumPassthrough: false, settlementDays: '14', insuranceCovered: false },
};

const DEFAULT_FORM: FormState = {
  consignorName: '',
  consignorAddress: '',
  consignorCity: '',
  consignorState: '',
  consignorZip: '',
  consignorEmail: '',
  consignorPhone: '',
  consigneeName: '',
  consigneeType: 'major-auction-house',
  consigneeAddress: '',
  consigneeCity: '',
  consigneeState: '',
  consigneeZip: '',
  sellerCommissionPct: '17.5',
  buyerPremiumPct: '22',
  buyerPremiumPassthrough: true,
  receivedDate: new Date().toISOString().slice(0, 10),
  listingStartDate: '',
  auctionDate: '',
  settlementDays: '45',
  payoutMethod: 'ACH',
  payoutFeeResponsibility: 'consignor',
  insuranceCovered: true,
  insuranceCarrier: '',
  insuranceLimit: '',
  unsoldHandling: 'return-at-consignee-cost',
  returnShippingResponsibility: 'consignee',
  inspectionWindowHours: '72',
  withdrawalFeePct: '5',
  jurisdictionState: '',
  cards: [{ id: 1, description: '', reserve: '', estimateLow: '', estimateHigh: '' }],
  notes: '',
};

const STORAGE_KEY = 'cv_consignment_agreement_draft_v1';

const STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

function fmtMoney(v: string): string {
  const n = parseFloat(v);
  if (!isFinite(n)) return '$[amount]';
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtPct(v: string): string {
  const n = parseFloat(v);
  if (!isFinite(n)) return '[%]';
  return `${n}%`;
}

function formatAddress(name: string, address: string, city: string, state: string, zip: string): string {
  const line2 = [city, state, zip].filter(Boolean).join(', ').trim();
  return `${name || '[name]'}\n${address || '[street address]'}\n${line2 || '[city, state, zip]'}`;
}

function buildDocument(s: FormState): string {
  const consignorBlock = formatAddress(s.consignorName, s.consignorAddress, s.consignorCity, s.consignorState, s.consignorZip);
  const consigneeBlock = formatAddress(s.consigneeName, s.consigneeAddress, s.consigneeCity, s.consigneeState, s.consigneeZip);

  const contactBlock = [
    s.consignorEmail ? `Email: ${s.consignorEmail}` : '',
    s.consignorPhone ? `Phone: ${s.consignorPhone}` : '',
  ].filter(Boolean).join('\n');

  const cardsBlock = s.cards.length
    ? s.cards.map((c, i) => {
        const reserve = c.reserve ? fmtMoney(c.reserve) : 'No reserve';
        const estimate = c.estimateLow && c.estimateHigh
          ? `Estimate: ${fmtMoney(c.estimateLow)} – ${fmtMoney(c.estimateHigh)}`
          : c.estimateLow
            ? `Estimate: ${fmtMoney(c.estimateLow)}+`
            : 'Estimate: TBD';
        return `Lot ${i + 1}: ${c.description || '[card description]'}\n         Reserve: ${reserve}   |   ${estimate}`;
      }).join('\n\n')
    : '[no cards listed]';

  const totalEstimateLow = s.cards.reduce((sum, c) => sum + (parseFloat(c.estimateLow) || 0), 0);
  const totalEstimateHigh = s.cards.reduce((sum, c) => sum + (parseFloat(c.estimateHigh) || 0), 0);
  const totalBlock = totalEstimateLow || totalEstimateHigh
    ? `Aggregate Estimate: $${totalEstimateLow.toLocaleString('en-US')} – $${totalEstimateHigh.toLocaleString('en-US')}`
    : '';

  const premiumClause = s.buyerPremiumPassthrough && s.consigneeType !== 'local-card-shop' && s.consigneeType !== 'ebay-consignment-broker'
    ? `A buyer's premium of ${fmtPct(s.buyerPremiumPct)} shall be added to each winning bid and paid by the Buyer; this premium is retained in full by the Consignee and does not affect the Consignor's net proceeds.`
    : 'No buyer\'s premium applies. Commission is calculated solely on the sale price.';

  const insuranceClause = s.insuranceCovered
    ? `The Consignee shall maintain commercial insurance covering the Cards against loss, theft, and damage from the date of receipt through the date of payout${s.insuranceCarrier ? `, underwritten by ${s.insuranceCarrier}` : ''}${s.insuranceLimit ? ` with a per-occurrence limit of ${fmtMoney(s.insuranceLimit)}` : ''}. In the event of loss, theft, or damage, the Consignee shall compensate the Consignor at the higher of (a) the card's reserve price or (b) the low estimate.`
    : 'THE CONSIGNEE DOES NOT PROVIDE INSURANCE. The Consignor is advised to maintain their own in-transit and custody insurance covering the full replacement value of the Cards. Consignor bears all risk of loss not caused by Consignee\'s gross negligence.';

  const unsoldClauses: Record<UnsoldHandling, string> = {
    'return-at-consignee-cost': 'Unsold Cards shall be returned to the Consignor within 30 days of the close of auction or sale window, with shipping and insurance paid by the Consignee.',
    'return-at-consignor-cost': 'Unsold Cards shall be returned to the Consignor within 30 days of the close of auction or sale window, with shipping and insurance billed to the Consignor.',
    'relist-with-approval': 'Unsold Cards may be relisted in a subsequent auction or sale window at a reduced reserve only with the written approval of the Consignor. If the Consignor declines relisting, the Cards shall be returned per the return-shipping terms below.',
    'donate': 'The Consignor authorizes the Consignee to donate any unsold Cards valued under $25 to a verified hobby charity after 60 days, with a donation receipt provided to the Consignor. Cards valued above $25 shall be returned.',
  };

  const returnShipping = s.returnShippingResponsibility === 'consignor'
    ? 'Consignor is responsible for return shipping and insurance.'
    : 'Consignee is responsible for return shipping and insurance.';

  const payoutFeeClause = s.payoutMethod === 'Wire'
    ? ` Wire transfer fees are paid by the ${s.payoutFeeResponsibility === 'consignor' ? 'Consignor (typically $25-50)' : 'Consignee'}.`
    : '';

  return `CONSIGNMENT AGREEMENT — SPORTS TRADING CARDS

Agreement Date: ${s.receivedDate}

PARTIES

CONSIGNOR (Card Owner)
${consignorBlock}
${contactBlock || ''}

CONSIGNEE (Auction House / Dealer)
${consigneeBlock}
Consignee Type: ${CONSIGNEE_TYPE_LABELS[s.consigneeType]}

1. CONSIGNED PROPERTY

The Consignor delivers to the Consignee the following trading cards (collectively, the "Cards") for sale on the terms set forth below:

${cardsBlock}

${totalBlock ? `${totalBlock}\n` : ''}
2. GRANT OF AUTHORITY

The Consignor grants the Consignee the exclusive right to offer the Cards for sale, on the Consignor's behalf, during the Sale Window defined in Section 4. Title to the Cards remains with the Consignor until a completed sale is recorded and settled.

3. COMMISSION AND PROCEEDS

The Consignee shall retain a seller's commission of ${fmtPct(s.sellerCommissionPct)} of the hammer or sale price on each Card sold. ${premiumClause}

Net proceeds to Consignor on a given Card = (Hammer Price) × (1 − ${fmtPct(s.sellerCommissionPct)}), less any Card-specific fees disclosed in Section 10.

4. SALE WINDOW

Cards received by Consignee: ${s.receivedDate}
Listing start date: ${s.listingStartDate || '[to be scheduled]'}
Auction / sale date: ${s.auctionDate || '[to be scheduled]'}
Settlement window: ${s.settlementDays} days after close of sale

5. RESERVE PRICES

Reserve prices for each Card are set forth in the Consigned Property list in Section 1. A Card shall not be sold for less than its stated Reserve. Cards listed with "No reserve" may be sold at the highest bid regardless of amount. The Consignee shall not bid against reserves, place shill bids, or solicit shill bids on the Consignor's lots.

6. PAYMENT TO CONSIGNOR

Within ${s.settlementDays} days following the close of the Sale Window, the Consignee shall remit to the Consignor the net proceeds of all sold Cards via ${s.payoutMethod}.${payoutFeeClause} Settlement statement shall itemize hammer price, commission, fees, and net proceeds for each Card.

7. INSURANCE AND CUSTODY

${insuranceClause}

The Consignee shall store the Cards in a secure, climate-controlled facility and handle them in accordance with industry-standard preservation practices. The Consignee shall not alter, re-grade, crack-out, or submit for regrading any Card without the express written consent of the Consignor.

8. UNSOLD LOTS

${unsoldClauses[s.unsoldHandling]} ${returnShipping}

9. WITHDRAWAL AND CANCELLATION

The Consignor may withdraw any or all Cards without penalty within ${s.inspectionWindowHours} hours of the Consignee's receipt (the "Inspection Window"). After the Inspection Window closes but before bids are opened, the Consignor may withdraw Cards subject to a withdrawal fee of ${fmtPct(s.withdrawalFeePct)} of the low estimate. Once bids have been opened, Cards may not be withdrawn.

10. FEES AND EXPENSES

All fees not explicitly allocated above (photography, authentication, catalog, marketing, grading if requested by Consignor) shall be disclosed to the Consignor in writing before being incurred. No undisclosed fees may be deducted from Consignor's proceeds.

11. REPRESENTATIONS AND WARRANTIES

The Consignor represents and warrants that: (a) the Consignor is the sole and lawful owner of the Cards, (b) the Cards are free of liens, encumbrances, or third-party claims, (c) the Cards are authentic and accurately described to the best of the Consignor's knowledge, and (d) the Consignor has the legal right to consign the Cards for sale.

12. DISPUTE RESOLUTION AND JURISDICTION

This Agreement shall be governed by the laws of the State of ${s.jurisdictionState || '[state]'}. Any dispute arising under or in connection with this Agreement shall be resolved by binding arbitration in ${s.jurisdictionState || '[state]'}, administered in accordance with commercial arbitration rules, before either party may seek judicial relief.

13. ENTIRE AGREEMENT

This document, including the Consigned Property list in Section 1, constitutes the complete agreement between the parties and supersedes any prior verbal or written understanding. Modifications require a written amendment signed by both parties.

${s.notes ? `14. ADDITIONAL TERMS\n\n${s.notes}\n\n` : ''}SIGNATURES

CONSIGNOR: _______________________________        Date: ____________
           ${s.consignorName || '[printed name]'}

CONSIGNEE: _______________________________        Date: ____________
           ${s.consigneeName || '[printed name / authorized signatory]'}

—
Generated via CardVault · cardvault-two.vercel.app/vault/consignment-agreement
This document is a general template. Not legal advice. For consignments over $25,000 or cross-border sales, consult a licensed attorney.`;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</span>
      {children}
    </label>
  );
}

function StateSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-sm text-slate-200">
      <option value="">—</option>
      {STATES.map((s) => (<option key={s} value={s}>{s}</option>))}
    </select>
  );
}

export default function ConsignmentAgreementClient() {
  const [form, setForm] = useState<FormState>(() => {
    if (typeof window === 'undefined') return DEFAULT_FORM;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? { ...DEFAULT_FORM, ...JSON.parse(raw) } : DEFAULT_FORM;
    } catch {
      return DEFAULT_FORM;
    }
  });
  const [copied, setCopied] = useState(false);

  const doc = useMemo(() => buildDocument(form), [form]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    const next = { ...form, [key]: value };
    setForm(next);
    persist(next);
  }

  function applyConsigneeType(type: ConsigneeType) {
    const defaults = TYPE_DEFAULTS[type];
    const next: FormState = { ...form, consigneeType: type, ...defaults } as FormState;
    setForm(next);
    persist(next);
  }

  function persist(next: FormState) {
    if (typeof window !== 'undefined') {
      try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
    }
  }

  function addCard() {
    if (form.cards.length >= 20) return;
    const nextId = Math.max(0, ...form.cards.map((c) => c.id)) + 1;
    update('cards', [...form.cards, { id: nextId, description: '', reserve: '', estimateLow: '', estimateHigh: '' }]);
  }

  function removeCard(id: number) {
    if (form.cards.length <= 1) return;
    update('cards', form.cards.filter((c) => c.id !== id));
  }

  function updateCard(id: number, field: keyof CardRow, value: string) {
    update('cards', form.cards.map((c) => c.id === id ? { ...c, [field]: value } : c));
  }

  function clearDraft() {
    if (!confirm('Clear all fields and reset the agreement?')) return;
    setForm(DEFAULT_FORM);
    if (typeof window !== 'undefined') {
      try { window.localStorage.removeItem(STORAGE_KEY); } catch {}
    }
  }

  function copyDoc() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(doc).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }).catch(() => {});
    }
  }

  function printDoc() {
    const w = window.open('', '_blank', 'width=800,height=900');
    if (!w) return;
    const body = w.document.body;
    body.style.margin = '0';
    const pre = w.document.createElement('pre');
    pre.style.fontFamily = "Georgia, 'Times New Roman', serif";
    pre.style.fontSize = '11pt';
    pre.style.whiteSpace = 'pre-wrap';
    pre.style.padding = '1in';
    pre.style.maxWidth = '7in';
    pre.style.margin = '0 auto';
    pre.textContent = doc;
    body.appendChild(pre);
    setTimeout(() => w.print(), 100);
  }

  const canGenerate = !!(form.consignorName && form.consigneeName && form.cards.some((c) => c.description));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* FORM */}
      <div className="space-y-5">
        {/* Consignee Type FIRST so defaults cascade */}
        <section className="rounded-2xl border border-indigo-500/30 bg-indigo-500/5 p-4">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo-300">1. Consignee Type</h3>
          <p className="mb-2 text-xs text-slate-400">Picking a type pre-fills typical commission, premium, and settlement terms. Edit them after.</p>
          <select
            value={form.consigneeType}
            onChange={(e) => applyConsigneeType(e.target.value as ConsigneeType)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200"
          >
            {(Object.keys(CONSIGNEE_TYPE_LABELS) as ConsigneeType[]).map((t) => (
              <option key={t} value={t}>{CONSIGNEE_TYPE_LABELS[t]}</option>
            ))}
          </select>
        </section>

        {/* Consignor */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo-300">2. Consignor (Card Owner)</h3>
          <div className="grid gap-3">
            <Field label="Full legal name">
              <input value={form.consignorName} onChange={(e) => update('consignorName', e.target.value)} placeholder="Jane Q. Collector" className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm" />
            </Field>
            <Field label="Street address">
              <input value={form.consignorAddress} onChange={(e) => update('consignorAddress', e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm" />
            </Field>
            <div className="grid grid-cols-3 gap-2">
              <Field label="City"><input value={form.consignorCity} onChange={(e) => update('consignorCity', e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm" /></Field>
              <Field label="State"><StateSelect value={form.consignorState} onChange={(v) => update('consignorState', v)} /></Field>
              <Field label="Zip"><input value={form.consignorZip} onChange={(e) => update('consignorZip', e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm" /></Field>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Email"><input type="email" value={form.consignorEmail} onChange={(e) => update('consignorEmail', e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm" /></Field>
              <Field label="Phone"><input type="tel" value={form.consignorPhone} onChange={(e) => update('consignorPhone', e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm" /></Field>
            </div>
          </div>
        </section>

        {/* Consignee */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo-300">3. Consignee (Auction House / Dealer)</h3>
          <div className="grid gap-3">
            <Field label="Business / company name">
              <input value={form.consigneeName} onChange={(e) => update('consigneeName', e.target.value)} placeholder="Heritage Auctions" className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm" />
            </Field>
            <Field label="Street address">
              <input value={form.consigneeAddress} onChange={(e) => update('consigneeAddress', e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm" />
            </Field>
            <div className="grid grid-cols-3 gap-2">
              <Field label="City"><input value={form.consigneeCity} onChange={(e) => update('consigneeCity', e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm" /></Field>
              <Field label="State"><StateSelect value={form.consigneeState} onChange={(v) => update('consigneeState', v)} /></Field>
              <Field label="Zip"><input value={form.consigneeZip} onChange={(e) => update('consigneeZip', e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm" /></Field>
            </div>
          </div>
        </section>

        {/* Cards */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-indigo-300">4. Consigned Cards</h3>
            <button onClick={addCard} disabled={form.cards.length >= 20} className="rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-2 py-1 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20 disabled:opacity-40">+ Add lot</button>
          </div>
          <div className="space-y-3">
            {form.cards.map((c, i) => (
              <div key={c.id} className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Lot {i + 1}</span>
                  {form.cards.length > 1 && (
                    <button onClick={() => removeCard(c.id)} className="text-xs text-rose-400 hover:text-rose-300">remove</button>
                  )}
                </div>
                <div className="grid gap-2">
                  <input placeholder="2021 Bowman Chrome Julio Rodriguez RC Auto #CPA-JR, PSA 10 (Cert 72345678)" value={c.description} onChange={(e) => updateCard(c.id, 'description', e.target.value)} className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm" />
                  <div className="grid grid-cols-3 gap-2">
                    <Field label="Reserve $"><input type="number" min="0" value={c.reserve} onChange={(e) => updateCard(c.id, 'reserve', e.target.value)} className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm" /></Field>
                    <Field label="Est. low $"><input type="number" min="0" value={c.estimateLow} onChange={(e) => updateCard(c.id, 'estimateLow', e.target.value)} className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm" /></Field>
                    <Field label="Est. high $"><input type="number" min="0" value={c.estimateHigh} onChange={(e) => updateCard(c.id, 'estimateHigh', e.target.value)} className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm" /></Field>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Commission */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo-300">5. Commission &amp; Settlement</h3>
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-2">
              <Field label="Seller commission %"><input type="number" min="0" max="60" step="0.5" value={form.sellerCommissionPct} onChange={(e) => update('sellerCommissionPct', e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm" /></Field>
              <Field label="Buyer premium %"><input type="number" min="0" max="30" step="0.5" value={form.buyerPremiumPct} onChange={(e) => update('buyerPremiumPct', e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm" /></Field>
            </div>
            <label className="flex items-center gap-2 text-xs text-slate-300">
              <input type="checkbox" checked={form.buyerPremiumPassthrough} onChange={(e) => update('buyerPremiumPassthrough', e.target.checked)} className="rounded border-slate-600 bg-slate-950" />
              Buyer&apos;s premium is retained by consignee (does not reduce consignor proceeds)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Settlement days"><input type="number" min="1" max="120" value={form.settlementDays} onChange={(e) => update('settlementDays', e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm" /></Field>
              <Field label="Payout method">
                <select value={form.payoutMethod} onChange={(e) => update('payoutMethod', e.target.value as PayoutMethod)} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm">
                  <option value="ACH">ACH</option>
                  <option value="Check">Check</option>
                  <option value="Wire">Wire</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Zelle">Zelle</option>
                </select>
              </Field>
            </div>
            {form.payoutMethod === 'Wire' && (
              <Field label="Wire fee paid by">
                <select value={form.payoutFeeResponsibility} onChange={(e) => update('payoutFeeResponsibility', e.target.value as 'consignor' | 'consignee')} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm">
                  <option value="consignor">Consignor</option>
                  <option value="consignee">Consignee</option>
                </select>
              </Field>
            )}
          </div>
        </section>

        {/* Timeline */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo-300">6. Timeline</h3>
          <div className="grid gap-3">
            <div className="grid grid-cols-3 gap-2">
              <Field label="Received date"><input type="date" value={form.receivedDate} onChange={(e) => update('receivedDate', e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-sm" /></Field>
              <Field label="Listing start"><input type="date" value={form.listingStartDate} onChange={(e) => update('listingStartDate', e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-sm" /></Field>
              <Field label="Auction / sale"><input type="date" value={form.auctionDate} onChange={(e) => update('auctionDate', e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-sm" /></Field>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Inspection window (hours)"><input type="number" min="0" max="168" value={form.inspectionWindowHours} onChange={(e) => update('inspectionWindowHours', e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm" /></Field>
              <Field label="Post-window withdrawal fee %"><input type="number" min="0" max="25" step="0.5" value={form.withdrawalFeePct} onChange={(e) => update('withdrawalFeePct', e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm" /></Field>
            </div>
          </div>
        </section>

        {/* Insurance */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo-300">7. Insurance</h3>
          <label className="flex items-center gap-2 text-sm text-slate-200">
            <input type="checkbox" checked={form.insuranceCovered} onChange={(e) => update('insuranceCovered', e.target.checked)} className="rounded border-slate-600 bg-slate-950" />
            Consignee maintains commercial insurance on cards in custody
          </label>
          {form.insuranceCovered && (
            <div className="mt-3 grid gap-3">
              <Field label="Insurance carrier (optional)"><input value={form.insuranceCarrier} onChange={(e) => update('insuranceCarrier', e.target.value)} placeholder="Lloyd's of London / Collectibles Insurance Services" className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm" /></Field>
              <Field label="Per-occurrence limit $ (optional)"><input type="number" min="0" value={form.insuranceLimit} onChange={(e) => update('insuranceLimit', e.target.value)} placeholder="250000" className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm" /></Field>
            </div>
          )}
        </section>

        {/* Unsold */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo-300">8. Unsold Lots</h3>
          <div className="grid gap-3">
            <Field label="Handling of unsold cards">
              <select value={form.unsoldHandling} onChange={(e) => update('unsoldHandling', e.target.value as UnsoldHandling)} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm">
                <option value="return-at-consignee-cost">Return to consignor (consignee pays shipping)</option>
                <option value="return-at-consignor-cost">Return to consignor (consignor pays shipping)</option>
                <option value="relist-with-approval">Relist at reduced reserve with consignor approval</option>
                <option value="donate">Donate under $25 after 60 days</option>
              </select>
            </Field>
            <Field label="Return shipping paid by">
              <select value={form.returnShippingResponsibility} onChange={(e) => update('returnShippingResponsibility', e.target.value as 'consignor' | 'consignee')} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm">
                <option value="consignee">Consignee</option>
                <option value="consignor">Consignor</option>
              </select>
            </Field>
          </div>
        </section>

        {/* Jurisdiction + Notes */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo-300">9. Jurisdiction &amp; Notes</h3>
          <div className="grid gap-3">
            <Field label="Governing state">
              <StateSelect value={form.jurisdictionState} onChange={(v) => update('jurisdictionState', v)} />
            </Field>
            <Field label="Additional terms (optional)">
              <textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} rows={3} placeholder="Photography handled by consignee at no additional fee. Catalog listing must reflect agreed descriptions verbatim." className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm" />
            </Field>
          </div>
        </section>

        <div className="flex flex-wrap gap-2">
          <button onClick={printDoc} disabled={!canGenerate} className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-40">Print / Save PDF</button>
          <button onClick={copyDoc} disabled={!canGenerate} className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-40">{copied ? 'Copied ✓' : 'Copy text'}</button>
          <button onClick={clearDraft} className="ml-auto rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-xs text-slate-400 hover:border-rose-500/40 hover:text-rose-300">Clear draft</button>
        </div>
        {!canGenerate && (
          <p className="text-xs text-slate-500">Fill in consignor name, consignee name, and at least one card description to enable the document.</p>
        )}
      </div>

      {/* PREVIEW */}
      <div className="lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Live preview</h3>
            <span className="rounded-full border border-indigo-500/40 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-indigo-300">Draft auto-saved</span>
          </div>
          <pre className="max-h-[70vh] overflow-auto whitespace-pre-wrap rounded-lg border border-slate-800 bg-slate-950 p-4 text-[11px] leading-relaxed text-slate-300" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
            {doc}
          </pre>
        </div>
      </div>
    </div>
  );
}
