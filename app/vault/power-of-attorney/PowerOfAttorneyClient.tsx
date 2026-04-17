'use client';

import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'cv_poa_draft_v1';

type Action = 'grading' | 'sale' | 'consignment' | 'mail' | 'shipping' | 'insurance-claim' | 'dispute' | 'auction-bid';

type Form = {
  effectiveDate: string;
  expirationDate: string;
  durable: boolean;
  principalName: string;
  principalAddress: string;
  principalEmail: string;
  agentName: string;
  agentAddress: string;
  agentEmail: string;
  actions: Record<Action, boolean>;
  totalValueCap: string;
  perTxCap: string;
  categoryLimit: 'all' | 'graded-only' | 'raw-only' | 'vintage-only' | 'modern-only';
  selfDealingProhibited: boolean;
  agentFee: string;
  governingState: string;
  principalSig: string;
  agentSig: string;
  witness1: string;
  witness2: string;
  notarized: boolean;
};

const DEFAULT: Form = {
  effectiveDate: new Date().toISOString().slice(0, 10),
  expirationDate: '',
  durable: false,
  principalName: '', principalAddress: '', principalEmail: '',
  agentName: '', agentAddress: '', agentEmail: '',
  actions: {
    grading: true,
    sale: false,
    consignment: false,
    mail: true,
    shipping: true,
    'insurance-claim': false,
    dispute: false,
    'auction-bid': false,
  },
  totalValueCap: '10000',
  perTxCap: '',
  categoryLimit: 'all',
  selfDealingProhibited: true,
  agentFee: '',
  governingState: '',
  principalSig: '', agentSig: '',
  witness1: '', witness2: '',
  notarized: false,
};

function money(n: number): string {
  if (!n) return '__________';
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

const ACTION_LABELS: Record<Action, { label: string; desc: string }> = {
  grading: { label: 'Grading submission', desc: 'Prepare, package, submit, and receive cards to/from PSA, BGS, SGC, CGC, or similar.' },
  sale: { label: 'Private sale', desc: 'Negotiate, execute, and receive proceeds from private-party sales of Principal\u2019s cards.' },
  consignment: { label: 'Auction consignment', desc: 'Sign consignment agreements with PWCC, Goldin, Heritage, REA, or similar on Principal\u2019s behalf.' },
  mail: { label: 'Mail receipt', desc: 'Receive and sign for packages containing Principal\u2019s cards, grading returns, or auction consignment shipments.' },
  shipping: { label: 'Shipping release', desc: 'Package, insure, label, and release outbound shipments of Principal\u2019s cards to counterparties.' },
  'insurance-claim': { label: 'Insurance claim', desc: 'File claims with Principal\u2019s insurance carrier for loss, theft, or damage to cards covered by scheduled-property rider.' },
  dispute: { label: 'Dispute resolution', desc: 'Represent Principal in eBay/marketplace disputes, chargeback challenges, or shipping-carrier claims.' },
  'auction-bid': { label: 'Auction bidding', desc: 'Place bids and execute purchases on Principal\u2019s behalf at in-person or online auctions, subject to the per-transaction cap.' },
};

export default function PowerOfAttorneyClient() {
  const [form, setForm] = useState<Form>(DEFAULT);
  const [hydrated, setHydrated] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) setForm((f) => ({ ...f, ...JSON.parse(raw) })); } catch {}
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(form)); } catch {}
  }, [form, hydrated]);

  function upd<K extends keyof Form>(k: K, v: Form[K]) { setForm((f) => ({ ...f, [k]: v })); }
  function toggleAction(a: Action) { setForm((f) => ({ ...f, actions: { ...f.actions, [a]: !f.actions[a] } })); }

  const totalCap = parseFloat(form.totalValueCap) || 0;
  const perTxCap = parseFloat(form.perTxCap) || 0;
  const fee = parseFloat(form.agentFee) || 0;

  const authorizedActions = useMemo(() => (Object.keys(form.actions) as Action[]).filter((a) => form.actions[a]), [form.actions]);
  const ready = !!form.principalName && !!form.agentName && authorizedActions.length > 0;
  const doc = useMemo(() => buildDoc(form, authorizedActions, totalCap, perTxCap, fee), [form, authorizedActions, totalCap, perTxCap, fee]);

  function copy() {
    if (!navigator?.clipboard) return;
    navigator.clipboard.writeText(doc).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1600); });
  }
  function printDoc() {
    const w = window.open('', '_blank', 'width=800,height=900');
    if (!w) return;
    w.document.body.style.margin = '0';
    const pre = w.document.createElement('pre');
    pre.style.fontFamily = "Georgia,'Times New Roman',serif"; pre.style.fontSize = '12pt'; pre.style.whiteSpace = 'pre-wrap';
    pre.style.padding = '1in'; pre.style.maxWidth = '7in'; pre.style.margin = '0 auto';
    pre.textContent = doc; w.document.body.appendChild(pre);
    setTimeout(() => w.print(), 100);
  }
  function reset() {
    if (!window.confirm('Reset the draft?')) return;
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setForm(DEFAULT);
  }

  if (!hydrated) return <div className="rounded-2xl bg-slate-900/40 border border-slate-800 p-8 text-center text-gray-500 text-sm">Loading&hellip;</div>;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-5">
        <Sec title="1. Dates">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Fld label="Effective date"><input type="date" value={form.effectiveDate} onChange={(e) => upd('effectiveDate', e.target.value)} className={inp} /></Fld>
            <Fld label="Expiration date (optional)"><input type="date" value={form.expirationDate} onChange={(e) => upd('expirationDate', e.target.value)} className={inp} /></Fld>
          </div>
          <label className="flex items-center gap-2 mt-3 text-sm text-gray-300">
            <input type="checkbox" checked={form.durable} onChange={(e) => upd('durable', e.target.checked)} className="accent-fuchsia-500" />
            <span>Durable (survives Principal&rsquo;s incapacity — requires jurisdiction-specific statutory language)</span>
          </label>
        </Sec>

        <Sec title="2. Principal (grantor)">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Fld label="Full name"><input type="text" value={form.principalName} onChange={(e) => upd('principalName', e.target.value)} className={inp} /></Fld>
            <Fld label="Email"><input type="email" value={form.principalEmail} onChange={(e) => upd('principalEmail', e.target.value)} className={inp} /></Fld>
            <Fld label="Address / city / state" className="sm:col-span-2"><input type="text" value={form.principalAddress} onChange={(e) => upd('principalAddress', e.target.value)} className={inp} /></Fld>
          </div>
        </Sec>

        <Sec title="3. Agent (attorney-in-fact)">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Fld label="Full name"><input type="text" value={form.agentName} onChange={(e) => upd('agentName', e.target.value)} className={inp} /></Fld>
            <Fld label="Email"><input type="email" value={form.agentEmail} onChange={(e) => upd('agentEmail', e.target.value)} className={inp} /></Fld>
            <Fld label="Address / city / state" className="sm:col-span-2"><input type="text" value={form.agentAddress} onChange={(e) => upd('agentAddress', e.target.value)} className={inp} /></Fld>
          </div>
        </Sec>

        <Sec title="4. Authorized actions">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(Object.keys(ACTION_LABELS) as Action[]).map((a) => (
              <label key={a} className={`flex items-start gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${form.actions[a] ? 'bg-fuchsia-950/30 border-fuchsia-700/60' : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}`}>
                <input type="checkbox" checked={form.actions[a]} onChange={() => toggleAction(a)} className="accent-fuchsia-500 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-white">{ACTION_LABELS[a].label}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">{ACTION_LABELS[a].desc}</div>
                </div>
              </label>
            ))}
          </div>
        </Sec>

        <Sec title="5. Scope limits">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Fld label="Total-value cap ($)"><input type="number" inputMode="decimal" value={form.totalValueCap} onChange={(e) => upd('totalValueCap', e.target.value)} className={inp} /></Fld>
            <Fld label="Per-transaction cap ($) optional"><input type="number" inputMode="decimal" value={form.perTxCap} onChange={(e) => upd('perTxCap', e.target.value)} className={inp} /></Fld>
            <Fld label="Category limit">
              <select value={form.categoryLimit} onChange={(e) => upd('categoryLimit', e.target.value as Form['categoryLimit'])} className={inp}>
                <option value="all">All cards</option>
                <option value="graded-only">Graded only</option>
                <option value="raw-only">Raw only</option>
                <option value="vintage-only">Vintage only (pre-1980)</option>
                <option value="modern-only">Modern only (1980+)</option>
              </select>
            </Fld>
            <Fld label="Agent fee (optional $)"><input type="number" inputMode="decimal" value={form.agentFee} onChange={(e) => upd('agentFee', e.target.value)} placeholder="e.g. 250" className={inp} /></Fld>
          </div>
          <label className="flex items-center gap-2 mt-3 text-sm text-gray-300">
            <input type="checkbox" checked={form.selfDealingProhibited} onChange={(e) => upd('selfDealingProhibited', e.target.checked)} className="accent-fuchsia-500" />
            <span>Prohibit self-dealing (agent may not buy/sell/profit personally beyond fee above)</span>
          </label>
        </Sec>

        <Sec title="6. Execution">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Fld label="Governing state"><input type="text" value={form.governingState} onChange={(e) => upd('governingState', e.target.value)} placeholder="California" className={inp} /></Fld>
            <Fld label="Principal signature"><input type="text" value={form.principalSig} onChange={(e) => upd('principalSig', e.target.value)} placeholder="/s/ Principal" className={inp} /></Fld>
            <Fld label="Agent acceptance signature"><input type="text" value={form.agentSig} onChange={(e) => upd('agentSig', e.target.value)} placeholder="/s/ Agent" className={inp} /></Fld>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <Fld label="Witness 1 (optional)"><input type="text" value={form.witness1} onChange={(e) => upd('witness1', e.target.value)} className={inp} /></Fld>
            <Fld label="Witness 2 (optional)"><input type="text" value={form.witness2} onChange={(e) => upd('witness2', e.target.value)} className={inp} /></Fld>
          </div>
          <label className="flex items-center gap-2 mt-3 text-sm text-gray-300">
            <input type="checkbox" checked={form.notarized} onChange={(e) => upd('notarized', e.target.checked)} className="accent-fuchsia-500" />
            <span>Notarized (recommended for $5,000+ transactions)</span>
          </label>
        </Sec>

        <div className="flex flex-wrap gap-3">
          <button onClick={copy} disabled={!ready} className="px-4 py-2 rounded-lg bg-fuchsia-500 hover:bg-fuchsia-400 disabled:opacity-40 text-white font-semibold text-sm">{copied ? 'Copied!' : 'Copy POA'}</button>
          <button onClick={printDoc} disabled={!ready} className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-gray-100 font-semibold text-sm">Print / PDF</button>
          <button onClick={reset} className="px-4 py-2 rounded-lg bg-transparent hover:bg-slate-800 text-gray-400 hover:text-gray-200 font-medium text-sm">Reset</button>
        </div>
      </div>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl bg-stone-50 text-stone-900 p-6 shadow-2xl ring-1 ring-stone-200 overflow-auto max-h-[85vh]">
          <pre className="whitespace-pre-wrap text-[11px] leading-relaxed" style={{ fontFamily: "Georgia,'Times New Roman',serif" }}>{doc}</pre>
        </div>
        <div className="mt-2 text-xs text-gray-500">Draft auto-saves locally. Sign in front of a notary for any POA intended for $5,000+ transactions.</div>
      </div>
    </div>
  );
}

function buildDoc(f: Form, actions: Action[], totalCap: number, perTxCap: number, fee: number): string {
  const L: string[] = [];
  L.push('LIMITED POWER OF ATTORNEY');
  L.push('(Card-Handling Authorization)');
  L.push('');
  L.push(`Effective date: ${f.effectiveDate}`);
  if (f.expirationDate) L.push(`Expiration date: ${f.expirationDate}`);
  L.push(f.durable ? 'DURABLE — this power survives the Principal\u2019s incapacity to the extent permitted by state law.' : 'NOT DURABLE — this power terminates automatically upon the Principal\u2019s incapacity.');
  L.push('');
  L.push('PRINCIPAL');
  L.push(`  ${f.principalName || '__________'}${f.principalEmail ? ` <${f.principalEmail}>` : ''}`);
  if (f.principalAddress) L.push(`  ${f.principalAddress}`);
  L.push('');
  L.push('AGENT (attorney-in-fact)');
  L.push(`  ${f.agentName || '__________'}${f.agentEmail ? ` <${f.agentEmail}>` : ''}`);
  if (f.agentAddress) L.push(`  ${f.agentAddress}`);
  L.push('');
  L.push('1. GRANT OF AUTHORITY');
  L.push('   The undersigned Principal hereby appoints the Agent as Principal\u2019s true and lawful attorney-in-fact to act for Principal with respect to trading-card transactions only, limited to the Authorized Actions listed below. This POA is NOT a general power of attorney and shall not be construed to grant authority beyond the card-handling scope specified herein.');
  L.push('');
  L.push('2. AUTHORIZED ACTIONS');
  if (actions.length === 0) {
    L.push('   NONE — this POA is inoperative until Principal selects at least one authorized action.');
  } else {
    actions.forEach((a, i) => {
      L.push(`   (${String.fromCharCode(97 + i)}) ${ACTION_LABELS[a].label} — ${ACTION_LABELS[a].desc}`);
    });
  }
  L.push('');
  L.push('3. SCOPE LIMITS');
  const limits: string[] = [];
  if (totalCap > 0) limits.push(`Total-value cap: Agent may not execute transactions whose aggregate value exceeds ${money(totalCap)}.`);
  if (perTxCap > 0) limits.push(`Per-transaction cap: Agent may not execute any single transaction whose value exceeds ${money(perTxCap)}.`);
  if (f.categoryLimit !== 'all') {
    const catText: Record<Form['categoryLimit'], string> = {
      all: '',
      'graded-only': 'Agent\u2019s authority extends to PSA/BGS/SGC/CGC graded cards only — raw (ungraded) cards are excluded from this POA.',
      'raw-only': 'Agent\u2019s authority extends to raw (ungraded) cards only — graded cards are excluded from this POA.',
      'vintage-only': 'Agent\u2019s authority extends to vintage cards (pre-1980 production) only — modern cards are excluded from this POA.',
      'modern-only': 'Agent\u2019s authority extends to modern cards (1980 production or later) only — vintage cards are excluded from this POA.',
    };
    limits.push(catText[f.categoryLimit]);
  }
  if (f.selfDealingProhibited) {
    limits.push('Self-dealing is prohibited: Agent may not buy Principal\u2019s cards personally, sell Agent\u2019s own cards to Principal, or direct transaction proceeds to Agent personally beyond the fee specified in Section 4.');
  }
  if (limits.length === 0) {
    L.push('   No specific scope limits — Agent may act within the ordinary course of the Authorized Actions.');
  } else {
    limits.forEach((s, i) => L.push(`   (${String.fromCharCode(97 + i)}) ${s}`));
  }
  L.push('');
  L.push('4. AGENT COMPENSATION');
  L.push(fee > 0
    ? `   Agent shall be paid a fee of ${money(fee)} for services rendered under this POA. Agent shall also be reimbursed for reasonable documented expenses (shipping, insurance, grading fees, notary, etc) upon presentation of receipts.`
    : '   Agent serves without compensation. Agent shall be reimbursed for reasonable documented expenses (shipping, insurance, grading fees, notary, etc) upon presentation of receipts.');
  L.push('');
  L.push('5. AGENT DUTIES AND STANDARD OF CARE');
  L.push('   Agent shall act in good faith, with the care and prudence of a reasonable person handling valuable collectibles, and solely in Principal\u2019s best interest. Agent shall maintain clear records of every transaction executed under this POA and provide copies upon Principal\u2019s request.');
  L.push('');
  L.push('6. TERMINATION');
  L.push(`   This POA terminates on the earliest of: (a) ${f.expirationDate || 'the expiration date specified above, if any'}; (b) written revocation delivered to Agent by Principal; (c) completion of the transactions contemplated by the Authorized Actions${f.durable ? '' : '; (d) Principal\u2019s incapacity or death'}; (e) Agent\u2019s resignation delivered to Principal in writing.`);
  L.push('');
  L.push('7. REVOCATION');
  L.push('   Principal may revoke this POA at any time by (a) written notice delivered to Agent, (b) written notice to any counterparty that has received a copy of this POA, or (c) filing a Notice of Revocation with the county clerk in Principal\u2019s state of residence. Revocation is effective upon Agent\u2019s actual receipt of the notice.');
  L.push('');
  L.push('8. THIRD-PARTY RELIANCE');
  L.push('   Any third party (grading service, auction house, marketplace, carrier, insurer, or counterparty) may rely on a copy of this POA certified by Principal\u2019s signature (and, if notarized, the notary\u2019s acknowledgment below) as conclusive evidence of Agent\u2019s authority until the third party receives written notice of revocation.');
  L.push('');
  L.push(`9. GOVERNING LAW`);
  L.push(`   This POA is governed by the laws of the State of ${f.governingState || '__________'}. Venue for any action to enforce or interpret this POA lies in the state or federal courts sitting in that state.`);
  L.push('');
  L.push('SIGNATURES');
  L.push('');
  L.push(`PRINCIPAL: ${f.principalSig || '______________________________'}   Date: ${f.effectiveDate}`);
  L.push(`           Print: ${f.principalName || '______________________________'}`);
  L.push('');
  L.push(`AGENT (acceptance): ${f.agentSig || '______________________________'}   Date: ${f.effectiveDate}`);
  L.push(`           Print: ${f.agentName || '______________________________'}`);
  L.push('');
  if (f.witness1 || f.witness2) {
    L.push('WITNESSES');
    if (f.witness1) L.push(`  Witness 1: ${f.witness1}   Signature: ______________________________   Date: ${f.effectiveDate}`);
    if (f.witness2) L.push(`  Witness 2: ${f.witness2}   Signature: ______________________________   Date: ${f.effectiveDate}`);
    L.push('');
  }
  if (f.notarized) {
    L.push('NOTARY ACKNOWLEDGMENT');
    L.push(`State of ${f.governingState || '__________'}`);
    L.push('County of __________');
    L.push('');
    L.push(`On ${f.effectiveDate}, before me personally appeared ${f.principalName || '__________'}, who proved on the basis of satisfactory evidence to be the person whose name is subscribed to the within instrument, and acknowledged that ${f.principalName || 'he/she'} executed the same in ${f.principalName || 'his/her'} authorized capacity. I certify under PENALTY OF PERJURY under the laws of the State that the foregoing paragraph is true and correct.`);
    L.push('');
    L.push('Notary Public: ______________________________');
    L.push('Commission expires: __________');
    L.push('(Notary seal)');
  } else {
    L.push('[ NOT NOTARIZED ] — counterparties may require notarization before accepting Agent\u2019s signature for transactions exceeding $5,000.');
  }
  return L.join('\n');
}

function Sec({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4"><h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-fuchsia-300">{title}</h3>{children}</section>;
}
function Fld({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return <label className={`block ${className}`}><div className="text-[11px] font-semibold text-gray-400 mb-1 uppercase tracking-wider">{label}</div>{children}</label>;
}
const inp = 'w-full rounded-lg bg-slate-950 border border-slate-700 text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500';
