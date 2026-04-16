'use client';

import { useEffect, useMemo, useState } from 'react';

type IssueType = 'damage' | 'counterfeit' | 'misrepresented' | 'not-arrived' | 'wrong-card' | 'other';

type Resolution = 'full-refund' | 'partial-refund' | 'replacement' | 'return-refund';

interface FormState {
  buyerName: string;
  buyerEmail: string;
  buyerAddress: string;
  sellerName: string;
  sellerHandle: string;
  sellerEmail: string;
  platform: string;
  orderId: string;
  orderDate: string;
  receivedDate: string;
  cardDescription: string;
  cardGrade: string;
  cardCert: string;
  amountPaid: string;
  paymentMethod: string;
  issueType: IssueType;
  issueDetails: string;
  partialRefundAmount: string;
  resolution: Resolution;
  deadline: string;
  evidence: string;
  closing: string;
  reasonForReturn: string;
  shippingAgreement: 'seller-pays' | 'buyer-pays' | 'split';
}

const DEFAULT_FORM: FormState = {
  buyerName: '',
  buyerEmail: '',
  buyerAddress: '',
  sellerName: '',
  sellerHandle: '',
  sellerEmail: '',
  platform: 'eBay',
  orderId: '',
  orderDate: '',
  receivedDate: '',
  cardDescription: '',
  cardGrade: '',
  cardCert: '',
  amountPaid: '',
  paymentMethod: 'PayPal',
  issueType: 'damage',
  issueDetails: '',
  partialRefundAmount: '',
  resolution: 'full-refund',
  deadline: '',
  evidence: '',
  closing: 'Regards',
  reasonForReturn: '',
  shippingAgreement: 'seller-pays',
};

const PLATFORMS = ['eBay', 'COMC', 'MySlabs', 'PWCC', 'Goldin', 'Facebook Marketplace', 'Instagram DM', 'Twitter/X DM', 'Whatnot', 'Fanatics Collect', 'Private Sale (direct)', 'Other'];

const PAYMENT_METHODS = ['PayPal', 'Credit Card', 'Debit Card', 'Venmo', 'Cash App', 'Zelle', 'Bank Transfer (ACH)', 'Wire Transfer', 'Cash', 'Cryptocurrency', 'Other'];

const ISSUE_OPTIONS: Array<{ value: IssueType; label: string; icon: string; hint: string }> = [
  { value: 'damage', label: 'Damaged on Arrival', icon: '📦', hint: 'Bent, creased, scratched, cracked slab, water-damaged' },
  { value: 'counterfeit', label: 'Counterfeit / Fake', icon: '🚫', hint: 'Not a genuine card or the cert does not match' },
  { value: 'misrepresented', label: 'Not as Described', icon: '❌', hint: 'Condition, grade, variation, or authenticity differs from listing' },
  { value: 'not-arrived', label: 'Never Arrived', icon: '📭', hint: 'Paid but package never delivered or tracking stopped' },
  { value: 'wrong-card', label: 'Wrong Card Sent', icon: '🔀', hint: 'Seller shipped a different card than what you bought' },
  { value: 'other', label: 'Other Issue', icon: '⚠️', hint: 'Describe the problem in detail below' },
];

const RESOLUTION_OPTIONS: Array<{ value: Resolution; label: string; note: string }> = [
  { value: 'full-refund', label: 'Full Refund', note: 'Money back, you do NOT return the card (damaged/counterfeit context)' },
  { value: 'partial-refund', label: 'Partial Refund', note: 'Keep the card at a discounted price' },
  { value: 'replacement', label: 'Replacement', note: 'Send a correct or equivalent card' },
  { value: 'return-refund', label: 'Return & Refund', note: 'Ship card back, receive full refund (standard)' },
];

const STORAGE_KEY = 'cv-return-request-draft-v1';

export default function ReturnRequestClient() {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [copied, setCopied] = useState(false);

  // Load draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setForm({ ...DEFAULT_FORM, ...JSON.parse(saved) });
    } catch {}
  }, []);

  // Auto-save draft
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(form)); } catch {}
  }, [form]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const clearDraft = () => {
    if (confirm('Clear the current draft? This cannot be undone.')) {
      setForm(DEFAULT_FORM);
      try { localStorage.removeItem(STORAGE_KEY); } catch {}
    }
  };

  const isReady = useMemo(() => {
    return !!(form.buyerName && form.sellerName && form.cardDescription && form.amountPaid && form.issueDetails);
  }, [form]);

  const letterText = useMemo(() => buildLetter(form), [form]);

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(letterText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('Copy failed. Please select the preview text manually.');
    }
  };

  const printDocument = () => {
    const w = window.open('', '_blank', 'width=800,height=900');
    if (!w) { alert('Popup blocked. Please allow popups or copy the letter.'); return; }

    const style = w.document.createElement('style');
    style.textContent = `
      body { font-family: Georgia, 'Times New Roman', serif; max-width: 7.5in; margin: 1in auto; padding: 0 0.5in; color: #111; line-height: 1.6; font-size: 11pt; }
      h1 { font-size: 18pt; margin: 0 0 0.4in 0; }
      pre { font-family: inherit; white-space: pre-wrap; word-wrap: break-word; }
    `;
    w.document.head.appendChild(style);

    const title = w.document.createElement('h1');
    title.textContent = 'Return and Refund Request';
    w.document.body.appendChild(title);

    const pre = w.document.createElement('pre');
    pre.textContent = letterText;
    w.document.body.appendChild(pre);

    setTimeout(() => w.print(), 300);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Form */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Fill in the details</h2>
          <div className="flex gap-2">
            <button
              onClick={clearDraft}
              className="px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-rose-400 hover:border-rose-500/40 text-xs font-semibold transition-colors"
            >
              Clear draft
            </button>
          </div>
        </div>

        {/* Buyer */}
        <Section title="Your Details (Buyer)">
          <Field label="Your Full Name" value={form.buyerName} onChange={v => update('buyerName', v)} placeholder="Jane Smith" />
          <Field label="Your Email" value={form.buyerEmail} onChange={v => update('buyerEmail', v)} placeholder="jane@example.com" />
          <Field label="Your Address" value={form.buyerAddress} onChange={v => update('buyerAddress', v)} placeholder="123 Main St, Anytown, CA 90210" multiline />
        </Section>

        {/* Seller */}
        <Section title="Seller Details">
          <Field label="Seller Full Name or Business" value={form.sellerName} onChange={v => update('sellerName', v)} placeholder="John Doe / Acme Cards LLC" />
          <Field label="Seller Username / Handle" value={form.sellerHandle} onChange={v => update('sellerHandle', v)} placeholder="@cardseller99" />
          <Field label="Seller Email (if known)" value={form.sellerEmail} onChange={v => update('sellerEmail', v)} placeholder="seller@example.com" />
          <Select label="Platform" value={form.platform} onChange={v => update('platform', v)} options={PLATFORMS} />
        </Section>

        {/* Order */}
        <Section title="Order & Card">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Order / Transaction ID" value={form.orderId} onChange={v => update('orderId', v)} placeholder="123456789-abc" />
            <Select label="Payment Method" value={form.paymentMethod} onChange={v => update('paymentMethod', v)} options={PAYMENT_METHODS} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Order Date" value={form.orderDate} onChange={v => update('orderDate', v)} type="date" />
            <Field label="Date Received (if arrived)" value={form.receivedDate} onChange={v => update('receivedDate', v)} type="date" />
          </div>
          <Field label="Card Description (Year + Set + Player + # + Parallel)" value={form.cardDescription} onChange={v => update('cardDescription', v)} placeholder="2018 Topps Chrome Ronald Acuña Jr. RC #193 Refractor" multiline />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Grade (if graded)" value={form.cardGrade} onChange={v => update('cardGrade', v)} placeholder="PSA 10 / BGS 9.5 / raw" />
            <Field label="Cert Number (if graded)" value={form.cardCert} onChange={v => update('cardCert', v)} placeholder="71234567" />
          </div>
          <Field label="Amount Paid (USD)" value={form.amountPaid} onChange={v => update('amountPaid', v)} placeholder="450.00" />
        </Section>

        {/* Issue */}
        <Section title="The Problem">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Issue Type</div>
            <div className="grid grid-cols-2 gap-2">
              {ISSUE_OPTIONS.map(o => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => update('issueType', o.value)}
                  className={`p-2.5 rounded-xl border text-left transition-colors ${
                    form.issueType === o.value
                      ? 'bg-rose-500/10 border-rose-500/40 ring-1 ring-rose-500/30'
                      : 'bg-gray-900/60 border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span>{o.icon}</span>
                    <span className="font-semibold text-xs text-white">{o.label}</span>
                  </div>
                  <div className="text-[10px] text-gray-500 leading-tight">{o.hint}</div>
                </button>
              ))}
            </div>
          </div>
          <Field
            label="Describe the Issue in Detail"
            value={form.issueDetails}
            onChange={v => update('issueDetails', v)}
            placeholder="The card arrived with a visible crease on the top-left corner. The listing photos showed a crisp corner. The crease is approximately 5mm and goes through the border into the image area."
            multiline
            rows={4}
          />
          <Field
            label="Evidence You Have (list what you can attach)"
            value={form.evidence}
            onChange={v => update('evidence', v)}
            placeholder="(1) Unboxing photos timestamped on arrival date. (2) Clear photos of the damaged area. (3) Side-by-side comparison with listing photos. (4) Original listing screenshot."
            multiline
            rows={3}
          />
        </Section>

        {/* Resolution */}
        <Section title="Requested Resolution">
          <div className="space-y-2">
            {RESOLUTION_OPTIONS.map(r => (
              <button
                key={r.value}
                type="button"
                onClick={() => update('resolution', r.value)}
                className={`w-full p-3 rounded-xl border text-left transition-colors ${
                  form.resolution === r.value
                    ? 'bg-rose-500/10 border-rose-500/40 ring-1 ring-rose-500/30'
                    : 'bg-gray-900/60 border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="font-semibold text-sm text-white mb-0.5">{r.label}</div>
                <div className="text-xs text-gray-500">{r.note}</div>
              </button>
            ))}
          </div>
          {form.resolution === 'partial-refund' && (
            <Field
              label="Partial Refund Amount (USD)"
              value={form.partialRefundAmount}
              onChange={v => update('partialRefundAmount', v)}
              placeholder="100.00"
            />
          )}
          {form.resolution === 'return-refund' && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Return Shipping</div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { v: 'seller-pays', l: 'Seller pays' },
                  { v: 'buyer-pays', l: 'I pay' },
                  { v: 'split', l: 'Split cost' },
                ].map(o => (
                  <button
                    key={o.v}
                    type="button"
                    onClick={() => update('shippingAgreement', o.v as FormState['shippingAgreement'])}
                    className={`p-2 rounded-lg text-xs font-semibold border transition-colors ${
                      form.shippingAgreement === o.v
                        ? 'bg-rose-500/10 text-rose-300 border-rose-500/40'
                        : 'bg-gray-900/60 text-gray-400 border-gray-800'
                    }`}
                  >
                    {o.l}
                  </button>
                ))}
              </div>
            </div>
          )}
          <Field
            label="Response Deadline (suggested: 7-10 business days)"
            value={form.deadline}
            onChange={v => update('deadline', v)}
            type="date"
          />
        </Section>
      </div>

      {/* Preview */}
      <div className="lg:sticky lg:top-6 h-fit">
        <div className="bg-white text-gray-900 rounded-2xl overflow-hidden border-2 border-gray-300 shadow-2xl">
          <div className="bg-gray-100 border-b border-gray-300 px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isReady ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'}`}>
                {isReady ? '✓ READY TO SEND' : 'DRAFT'}
              </span>
              <span className="text-xs text-gray-500">Live preview</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={copyText}
                className="text-xs font-semibold px-3 py-1.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
              <button
                onClick={printDocument}
                className="text-xs font-semibold px-3 py-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-500 transition-colors"
              >
                Print / PDF
              </button>
            </div>
          </div>
          <div className="px-6 py-6 max-h-[75vh] overflow-y-auto">
            <pre className="font-serif text-[13px] leading-relaxed whitespace-pre-wrap break-words">
              {letterText}
            </pre>
          </div>
        </div>
        <p className="mt-3 text-xs text-gray-500 text-center">
          Draft auto-saves in your browser. Clear it with the button above when done.
        </p>
      </div>
    </div>
  );
}

function buildLetter(f: FormState): string {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const issueLabel = ISSUE_OPTIONS.find(o => o.value === f.issueType)?.label || 'Issue with Order';
  const resolutionLabel = RESOLUTION_OPTIONS.find(o => o.value === f.resolution)?.label || 'Resolution Requested';

  const buyer = f.buyerName || '[Buyer full name]';
  const buyerEmail = f.buyerEmail || '[Buyer email]';
  const buyerAddr = f.buyerAddress || '[Buyer address]';
  const seller = f.sellerName || '[Seller name]';
  const sellerHandle = f.sellerHandle ? ` (@${f.sellerHandle.replace(/^@/, '')})` : '';
  const sellerEmailLine = f.sellerEmail ? `\nSeller email: ${f.sellerEmail}` : '';
  const platform = f.platform || '[Platform]';
  const orderId = f.orderId || '[Order ID]';
  const orderDate = f.orderDate || '[Order date]';
  const receivedDate = f.receivedDate || 'card did not arrive';
  const card = f.cardDescription || '[Card description]';
  const grade = f.cardGrade ? ` Condition / grade as advertised: ${f.cardGrade}.` : '';
  const cert = f.cardCert ? ` Cert number: ${f.cardCert}.` : '';
  const amount = f.amountPaid ? `$${f.amountPaid}` : '[$ amount]';
  const paymentMethod = f.paymentMethod || '[payment method]';
  const deadline = f.deadline ? new Date(f.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '[response deadline]';

  let resolutionLine = '';
  switch (f.resolution) {
    case 'full-refund':
      resolutionLine = `I am requesting a full refund of ${amount} to my original ${paymentMethod} payment method. Given the nature of the issue, return of the card is not required from my side; please confirm in writing if you nonetheless require return.`;
      break;
    case 'partial-refund':
      resolutionLine = `I am requesting a partial refund of $${f.partialRefundAmount || '[amount]'} to my original ${paymentMethod} payment method. I am willing to keep the card at this adjusted price as a good-faith resolution.`;
      break;
    case 'replacement':
      resolutionLine = `I am requesting a replacement card of equivalent description and condition to what was advertised. I will return the card I received upon receipt of the replacement.`;
      break;
    case 'return-refund':
      const shipping = f.shippingAgreement === 'seller-pays'
        ? 'Per marketplace convention for "not as described" claims, return shipping should be covered by the seller — please send a prepaid return label.'
        : f.shippingAgreement === 'buyer-pays'
        ? 'I will cover return shipping at my expense.'
        : 'I propose splitting return shipping cost equally between both parties.';
      resolutionLine = `I am requesting to return the card for a full refund of ${amount} to my original ${paymentMethod} payment method. ${shipping}`;
      break;
  }

  const deliveryInfo = f.issueType === 'not-arrived'
    ? `Order was placed on ${orderDate}. As of today, the card has not arrived and tracking has not updated. I have waited a reasonable time and attempted contact.`
    : `Order was placed on ${orderDate} and the card was received on ${receivedDate}.`;

  return `${today}

RE: Return and Refund Request — ${issueLabel}
Order: ${orderId}
Platform: ${platform}
${sellerEmailLine ? `${sellerEmailLine.trim()}\n` : ''}
To: ${seller}${sellerHandle}

From: ${buyer}
${buyerEmail}
${buyerAddr}

Dear ${seller},

I am writing regarding a recent purchase made through ${platform}. ${deliveryInfo}

ITEM PURCHASED
Card: ${card}
${grade}${cert}
Amount paid: ${amount} via ${paymentMethod}.

NATURE OF THE ISSUE — ${issueLabel.toUpperCase()}
${f.issueDetails || '[Describe the issue in detail]'}

EVIDENCE
${f.evidence || '[List the evidence you can provide]'}

RESOLUTION REQUESTED — ${resolutionLabel.toUpperCase()}
${resolutionLine}

NEXT STEPS
Please respond to this request by ${deadline} confirming the resolution. If I do not receive a response or a good-faith attempt at resolution by that date, I will proceed with:
  (1) a formal dispute through ${platform}'s buyer-protection process;
  (2) a chargeback with my payment issuer, attaching this correspondence as evidence of good-faith resolution attempt;
  (3) any additional remedies available to me under applicable consumer-protection law.

My strong preference is to resolve this directly and amicably. I am available by email at ${buyerEmail} for any questions or discussion.

Thank you for your prompt attention.

${f.closing || 'Regards'},

${buyer}
${buyerEmail}`;
}

// Helper components

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-4 space-y-3">
      <h3 className="text-sm font-bold text-white uppercase tracking-wider">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text', multiline, rows = 2 }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  multiline?: boolean;
  rows?: number;
}) {
  return (
    <label className="block">
      <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">{label}</div>
      {multiline ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full bg-black/60 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-rose-500 resize-y"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-black/60 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-rose-500"
        />
      )}
    </label>
  );
}

function Select({ label, value, onChange, options }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">{label}</div>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-black/60 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}
