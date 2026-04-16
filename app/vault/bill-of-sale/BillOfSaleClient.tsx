'use client';

import { useMemo, useState } from 'react';

interface FormState {
  sellerName: string;
  sellerAddress: string;
  sellerCity: string;
  sellerState: string;
  sellerZip: string;
  buyerName: string;
  buyerAddress: string;
  buyerCity: string;
  buyerState: string;
  buyerZip: string;
  cardYear: string;
  cardSet: string;
  cardPlayer: string;
  cardNumber: string;
  isGraded: boolean;
  grader: string;
  grade: string;
  certNumber: string;
  condition: string;
  accessories: string;
  price: string;
  paymentMethod: string;
  saleDate: string;
  asIs: boolean;
  warranty: string;
  notes: string;
}

const DEFAULT_FORM: FormState = {
  sellerName: '',
  sellerAddress: '',
  sellerCity: '',
  sellerState: '',
  sellerZip: '',
  buyerName: '',
  buyerAddress: '',
  buyerCity: '',
  buyerState: '',
  buyerZip: '',
  cardYear: '',
  cardSet: '',
  cardPlayer: '',
  cardNumber: '',
  isGraded: false,
  grader: 'PSA',
  grade: '',
  certNumber: '',
  condition: 'Near Mint',
  accessories: '',
  price: '',
  paymentMethod: 'Cash',
  saleDate: new Date().toISOString().slice(0, 10),
  asIs: true,
  warranty: '',
  notes: '',
};

const STORAGE_KEY = 'cv_bill_of_sale_draft_v1';

function formatAddress(s: FormState, who: 'seller' | 'buyer'): string {
  if (who === 'seller') {
    const line1 = s.sellerAddress || '[street address]';
    const line2 = [s.sellerCity, s.sellerState, s.sellerZip].filter(Boolean).join(', ').trim();
    return `${line1}\n${line2 || '[city, state, zip]'}`;
  }
  const line1 = s.buyerAddress || '[street address]';
  const line2 = [s.buyerCity, s.buyerState, s.buyerZip].filter(Boolean).join(', ').trim();
  return `${line1}\n${line2 || '[city, state, zip]'}`;
}

function buildDocument(s: FormState): string {
  const cardId = s.isGraded
    ? `${s.cardYear || '[year]'} ${s.cardSet || '[set]'} ${s.cardPlayer || '[player]'} #${s.cardNumber || '[#]'} — graded ${s.grader} ${s.grade || '[grade]'} (Cert #${s.certNumber || '[cert number]'})`
    : `${s.cardYear || '[year]'} ${s.cardSet || '[set]'} ${s.cardPlayer || '[player]'} #${s.cardNumber || '[#]'} — raw, stated condition: ${s.condition}`;

  const priceFmt = s.price
    ? `$${parseFloat(s.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : '$[amount]';

  const warrantyClause = s.asIs
    ? 'The Seller makes no representations or warranties regarding the Card beyond the condition and grading details stated above. The Card is sold "AS IS" and the Buyer accepts the Card in its current condition. No refunds unless the Card is materially different from the description above.'
    : `The Seller warrants the following: ${s.warranty || '[warranty terms]'}`;

  return `BILL OF SALE — SPORTS TRADING CARD

Date of Sale: ${s.saleDate}

SELLER
${s.sellerName || '[Seller full legal name]'}
${formatAddress(s, 'seller')}

BUYER
${s.buyerName || '[Buyer full legal name]'}
${formatAddress(s, 'buyer')}

CARD DESCRIPTION
${cardId}
${s.accessories ? `Included accessories: ${s.accessories}` : 'No additional accessories included.'}

CONSIDERATION
For the sum of ${priceFmt} US Dollars (the "Purchase Price"), paid by the Buyer to the Seller via ${s.paymentMethod}, the Seller hereby sells, transfers, and conveys to the Buyer all rights, title, and interest in and to the Card described above.

CONDITION AND WARRANTIES
${warrantyClause}

ACKNOWLEDGMENT
The Buyer acknowledges receipt of the Card and confirms that payment has been made in full. The Seller acknowledges receipt of the Purchase Price. This document constitutes the complete record of the transaction between the parties.

${s.notes ? `ADDITIONAL NOTES\n${s.notes}\n\n` : ''}SIGNATURES

Seller: _______________________________        Date: ____________
        ${s.sellerName || '[printed name]'}

Buyer:  _______________________________        Date: ____________
        ${s.buyerName || '[printed name]'}

—
Generated via CardVault · cardvault-two.vercel.app/vault/bill-of-sale
This document is a general template. Not legal advice. For transactions over $5,000 or cross-border sales, consult a licensed attorney.`;
}

function StateSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const states = ['AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-sm text-slate-200"
    >
      <option value="">—</option>
      {states.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </span>
      {children}
    </label>
  );
}

export default function BillOfSaleClient() {
  const [form, setForm] = useState<FormState>(() => {
    if (typeof window === 'undefined') return DEFAULT_FORM;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? { ...DEFAULT_FORM, ...JSON.parse(raw) } : DEFAULT_FORM;
    } catch {
      return DEFAULT_FORM;
    }
  });

  const doc = useMemo(() => buildDocument(form), [form]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    const next = { ...form, [key]: value };
    setForm(next);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
    }
  }

  function clearDraft() {
    setForm(DEFAULT_FORM);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {}
    }
  }

  function copyDoc() {
    if (navigator.clipboard) navigator.clipboard.writeText(doc).catch(() => {});
  }

  function printDoc() {
    const w = window.open('', '_blank', 'width=800,height=900');
    if (!w) return;
    const body = w.document.body;
    body.style.margin = '0';
    const pre = w.document.createElement('pre');
    pre.style.fontFamily = "Georgia, 'Times New Roman', serif";
    pre.style.fontSize = '12pt';
    pre.style.whiteSpace = 'pre-wrap';
    pre.style.padding = '1in';
    pre.style.maxWidth = '7in';
    pre.style.margin = '0 auto';
    pre.textContent = doc;
    body.appendChild(pre);
    setTimeout(() => w.print(), 100);
  }

  const canGenerate = form.sellerName && form.buyerName && form.cardPlayer && form.price;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Form */}
      <div className="space-y-6">
        {/* Seller */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-300">
            1. Seller
          </h3>
          <div className="grid gap-3">
            <Field label="Full legal name">
              <input
                type="text"
                value={form.sellerName}
                onChange={(e) => update('sellerName', e.target.value)}
                placeholder="Jane Q. Seller"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              />
            </Field>
            <Field label="Street address">
              <input
                type="text"
                value={form.sellerAddress}
                onChange={(e) => update('sellerAddress', e.target.value)}
                placeholder="123 Main St"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              />
            </Field>
            <div className="grid grid-cols-3 gap-2">
              <Field label="City">
                <input
                  type="text"
                  value={form.sellerCity}
                  onChange={(e) => update('sellerCity', e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                />
              </Field>
              <Field label="State">
                <StateSelect value={form.sellerState} onChange={(v) => update('sellerState', v)} />
              </Field>
              <Field label="Zip">
                <input
                  type="text"
                  value={form.sellerZip}
                  onChange={(e) => update('sellerZip', e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                />
              </Field>
            </div>
          </div>
        </section>

        {/* Buyer */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-300">
            2. Buyer
          </h3>
          <div className="grid gap-3">
            <Field label="Full legal name">
              <input
                type="text"
                value={form.buyerName}
                onChange={(e) => update('buyerName', e.target.value)}
                placeholder="John Q. Buyer"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              />
            </Field>
            <Field label="Street address">
              <input
                type="text"
                value={form.buyerAddress}
                onChange={(e) => update('buyerAddress', e.target.value)}
                placeholder="456 Oak Ave"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              />
            </Field>
            <div className="grid grid-cols-3 gap-2">
              <Field label="City">
                <input
                  type="text"
                  value={form.buyerCity}
                  onChange={(e) => update('buyerCity', e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                />
              </Field>
              <Field label="State">
                <StateSelect value={form.buyerState} onChange={(v) => update('buyerState', v)} />
              </Field>
              <Field label="Zip">
                <input
                  type="text"
                  value={form.buyerZip}
                  onChange={(e) => update('buyerZip', e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                />
              </Field>
            </div>
          </div>
        </section>

        {/* Card */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-300">
            3. Card
          </h3>
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-2">
              <Field label="Year">
                <input
                  type="text"
                  value={form.cardYear}
                  onChange={(e) => update('cardYear', e.target.value)}
                  placeholder="1986"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                />
              </Field>
              <Field label="Set">
                <input
                  type="text"
                  value={form.cardSet}
                  onChange={(e) => update('cardSet', e.target.value)}
                  placeholder="Fleer Basketball"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                />
              </Field>
            </div>
            <Field label="Player">
              <input
                type="text"
                value={form.cardPlayer}
                onChange={(e) => update('cardPlayer', e.target.value)}
                placeholder="Michael Jordan"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              />
            </Field>
            <Field label="Card number">
              <input
                type="text"
                value={form.cardNumber}
                onChange={(e) => update('cardNumber', e.target.value)}
                placeholder="57"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isGraded}
                onChange={(e) => update('isGraded', e.target.checked)}
                className="rounded"
              />
              <span>Card is professionally graded</span>
            </label>
            {form.isGraded && (
              <div className="grid grid-cols-3 gap-2 rounded-lg border border-stone-500/30 bg-stone-500/5 p-3">
                <Field label="Grader">
                  <select
                    value={form.grader}
                    onChange={(e) => update('grader', e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-sm"
                  >
                    <option>PSA</option>
                    <option>CGC</option>
                    <option>BGS</option>
                    <option>SGC</option>
                    <option>HGA</option>
                    <option>TAG</option>
                  </select>
                </Field>
                <Field label="Grade">
                  <input
                    type="text"
                    value={form.grade}
                    onChange={(e) => update('grade', e.target.value)}
                    placeholder="9"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                  />
                </Field>
                <Field label="Cert #">
                  <input
                    type="text"
                    value={form.certNumber}
                    onChange={(e) => update('certNumber', e.target.value)}
                    placeholder="12345678"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                  />
                </Field>
              </div>
            )}
            {!form.isGraded && (
              <Field label="Condition (raw)">
                <select
                  value={form.condition}
                  onChange={(e) => update('condition', e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                >
                  <option>Gem Mint</option>
                  <option>Mint</option>
                  <option>Near Mint-Mint</option>
                  <option>Near Mint</option>
                  <option>Excellent-Mint</option>
                  <option>Excellent</option>
                  <option>Very Good-Excellent</option>
                  <option>Very Good</option>
                  <option>Good</option>
                  <option>Fair</option>
                  <option>Poor</option>
                </select>
              </Field>
            )}
            <Field label="Included accessories (optional)">
              <input
                type="text"
                value={form.accessories}
                onChange={(e) => update('accessories', e.target.value)}
                placeholder="e.g., magnetic case, COA, original packaging"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              />
            </Field>
          </div>
        </section>

        {/* Transaction */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-300">
            4. Transaction
          </h3>
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-2">
              <Field label="Sale price ($)">
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => update('price', e.target.value)}
                  placeholder="2500"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                />
              </Field>
              <Field label="Payment method">
                <select
                  value={form.paymentMethod}
                  onChange={(e) => update('paymentMethod', e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                >
                  <option>Cash</option>
                  <option>Certified check</option>
                  <option>Wire transfer</option>
                  <option>PayPal Goods &amp; Services</option>
                  <option>Venmo</option>
                  <option>Zelle</option>
                  <option>Money order</option>
                  <option>ACH</option>
                </select>
              </Field>
            </div>
            <Field label="Sale date">
              <input
                type="date"
                value={form.saleDate}
                onChange={(e) => update('saleDate', e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.asIs}
                onChange={(e) => update('asIs', e.target.checked)}
                className="rounded"
              />
              <span>Sell "AS IS" (no additional warranties)</span>
            </label>
            {!form.asIs && (
              <Field label="Warranty terms">
                <textarea
                  value={form.warranty}
                  onChange={(e) => update('warranty', e.target.value)}
                  rows={3}
                  placeholder="e.g., Seller warrants that the card is genuine and as described. 7-day inspection window."
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                />
              </Field>
            )}
            <Field label="Additional notes (optional)">
              <textarea
                value={form.notes}
                onChange={(e) => update('notes', e.target.value)}
                rows={2}
                placeholder="Any special terms, delivery instructions, or context"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              />
            </Field>
          </div>
        </section>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={printDoc}
            disabled={!canGenerate}
            className="rounded-lg bg-stone-600 px-3 py-2 text-sm font-semibold text-white hover:bg-stone-500 disabled:opacity-50"
          >
            Print / Save as PDF
          </button>
          <button
            onClick={copyDoc}
            className="rounded-lg border border-stone-500/40 bg-stone-500/10 px-3 py-2 text-sm font-semibold text-stone-200 hover:bg-stone-500/20"
          >
            Copy text
          </button>
          <button
            onClick={clearDraft}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-400 hover:border-rose-500/40 hover:text-rose-200"
          >
            Clear draft
          </button>
          <span className="text-xs text-slate-500">
            Draft auto-saved locally. No data sent anywhere.
          </span>
        </div>
      </div>

      {/* Preview */}
      <div className="lg:sticky lg:top-4 lg:h-fit">
        <div className="rounded-2xl border border-stone-500/30 bg-slate-950/80 p-5 shadow-xl">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-wider text-stone-300">
              Preview · A4
            </div>
            {canGenerate ? (
              <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                READY
              </span>
            ) : (
              <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                DRAFT
              </span>
            )}
          </div>
          <pre className="whitespace-pre-wrap font-serif text-[12px] leading-relaxed text-slate-300">
            {doc}
          </pre>
        </div>
        {!canGenerate && (
          <div className="mt-3 rounded-lg border border-slate-800 bg-slate-900/40 p-3 text-xs text-slate-400">
            Fill seller name, buyer name, player, and price to enable print/save.
          </div>
        )}
      </div>
    </div>
  );
}
