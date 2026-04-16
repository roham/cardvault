'use client';

import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'cv_trade_contract_draft_v1';

type CardLine = {
  player: string;
  year: string;
  set: string;
  grade: string;
  cert: string;
  value: string; // USD, numeric string
};

type Party = {
  name: string;
  email: string;
  address: string;
  cards: CardLine[];
};

type Form = {
  tradeDate: string;
  executionCity: string;
  executionState: string;
  partyA: Party;
  partyB: Party;
  // Boot: cash balance paid FROM lower-value side TO higher-value side.
  bootAmount: string;
  bootDirection: 'a-to-b' | 'b-to-a' | 'none';
  inspectionDays: string;
  shippingSplit: 'each-own' | 'a-covers' | 'b-covers' | 'shared';
  gradingDispute: 'psa' | 'bgs' | 'sgc' | 'mutual';
  asIs: boolean;
  execStatus: 'draft' | 'executed';
  signatureA: string;
  signatureB: string;
};

const EMPTY_CARD: CardLine = { player: '', year: '', set: '', grade: '', cert: '', value: '' };

const DEFAULT_FORM: Form = {
  tradeDate: new Date().toISOString().slice(0, 10),
  executionCity: '',
  executionState: '',
  partyA: { name: '', email: '', address: '', cards: [ { ...EMPTY_CARD } ] },
  partyB: { name: '', email: '', address: '', cards: [ { ...EMPTY_CARD } ] },
  bootAmount: '',
  bootDirection: 'none',
  inspectionDays: '3',
  shippingSplit: 'each-own',
  gradingDispute: 'psa',
  asIs: true,
  execStatus: 'draft',
  signatureA: '',
  signatureB: '',
};

function money(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export default function TradeContractClient() {
  const [form, setForm] = useState<Form>(DEFAULT_FORM);
  const [copied, setCopied] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Form>;
        setForm((f) => ({ ...f, ...parsed }));
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(form)); } catch {}
  }, [form, hydrated]);

  function update<K extends keyof Form>(key: K, val: Form[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function updateParty(side: 'partyA' | 'partyB', field: keyof Omit<Party, 'cards'>, val: string) {
    setForm((f) => ({ ...f, [side]: { ...f[side], [field]: val } }));
  }

  function updateCard(side: 'partyA' | 'partyB', idx: number, field: keyof CardLine, val: string) {
    setForm((f) => {
      const cards = f[side].cards.map((c, i) => (i === idx ? { ...c, [field]: val } : c));
      return { ...f, [side]: { ...f[side], cards } };
    });
  }

  function addCard(side: 'partyA' | 'partyB') {
    setForm((f) => {
      if (f[side].cards.length >= 5) return f;
      return { ...f, [side]: { ...f[side], cards: [...f[side].cards, { ...EMPTY_CARD }] } };
    });
  }

  function removeCard(side: 'partyA' | 'partyB', idx: number) {
    setForm((f) => {
      const cards = f[side].cards.filter((_, i) => i !== idx);
      return { ...f, [side]: { ...f[side], cards: cards.length ? cards : [{ ...EMPTY_CARD }] } };
    });
  }

  const totalA = useMemo(
    () => form.partyA.cards.reduce((sum, c) => sum + (parseFloat(c.value) || 0), 0),
    [form.partyA.cards]
  );
  const totalB = useMemo(
    () => form.partyB.cards.reduce((sum, c) => sum + (parseFloat(c.value) || 0), 0),
    [form.partyB.cards]
  );
  const delta = Math.abs(totalA - totalB);
  const fairness = totalA + totalB === 0 ? 0 : (1 - delta / Math.max(totalA, totalB, 1)) * 100;

  const doc = useMemo(() => buildDocument(form, totalA, totalB), [form, totalA, totalB]);

  const requiredReady =
    form.partyA.name.trim() &&
    form.partyB.name.trim() &&
    form.partyA.cards.some(c => c.player.trim()) &&
    form.partyB.cards.some(c => c.player.trim()) &&
    form.tradeDate;

  const executionReady =
    requiredReady && form.signatureA.trim() && form.signatureB.trim();

  function copyDoc() {
    if (typeof navigator === 'undefined') return;
    navigator.clipboard?.writeText(doc).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
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

  function reset() {
    if (typeof window === 'undefined') return;
    const ok = window.confirm('Reset the draft? This clears every field and deletes the local save.');
    if (!ok) return;
    try { window.localStorage.removeItem(STORAGE_KEY); } catch {}
    setForm(DEFAULT_FORM);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Left: form */}
      <div className="space-y-6">
        {/* Meta */}
        <Section title="1. Trade meta">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Trade date">
              <input type="date" value={form.tradeDate} onChange={e => update('tradeDate', e.target.value)} className={inpCls} />
            </Field>
            <Field label="City">
              <input type="text" value={form.executionCity} onChange={e => update('executionCity', e.target.value)} placeholder="Brooklyn" className={inpCls} />
            </Field>
            <Field label="State">
              <input type="text" value={form.executionState} onChange={e => update('executionState', e.target.value)} placeholder="NY" maxLength={2} className={inpCls} />
            </Field>
          </div>
        </Section>

        {/* Party A */}
        <PartyBlock
          label="2. Party A"
          party={form.partyA}
          onChangeField={(f, v) => updateParty('partyA', f, v)}
          onChangeCard={(i, f, v) => updateCard('partyA', i, f, v)}
          onAdd={() => addCard('partyA')}
          onRemove={(i) => removeCard('partyA', i)}
          total={totalA}
        />

        {/* Party B */}
        <PartyBlock
          label="3. Party B"
          party={form.partyB}
          onChangeField={(f, v) => updateParty('partyB', f, v)}
          onChangeCard={(i, f, v) => updateCard('partyB', i, f, v)}
          onAdd={() => addCard('partyB')}
          onRemove={(i) => removeCard('partyB', i)}
          total={totalB}
        />

        {/* Balance / boot */}
        <Section title="4. Value balance">
          <div className="rounded-xl bg-blue-950/40 border border-blue-900/50 p-4 space-y-2 text-sm">
            <Row label="Party A value">{money(totalA)}</Row>
            <Row label="Party B value">{money(totalB)}</Row>
            <Row label="Delta">{money(delta)}</Row>
            <Row label="Fairness">
              <span className={fairness >= 90 ? 'text-emerald-400' : fairness >= 75 ? 'text-yellow-300' : 'text-amber-400'}>
                {fairness.toFixed(1)}%
              </span>
            </Row>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <Field label="Cash boot (USD)">
              <input type="number" inputMode="decimal" value={form.bootAmount} onChange={e => update('bootAmount', e.target.value)} placeholder="0.00" className={inpCls} />
            </Field>
            <Field label="Boot direction">
              <select value={form.bootDirection} onChange={e => update('bootDirection', e.target.value as Form['bootDirection'])} className={inpCls}>
                <option value="none">No boot</option>
                <option value="a-to-b">Party A pays Party B</option>
                <option value="b-to-a">Party B pays Party A</option>
              </select>
            </Field>
          </div>
        </Section>

        {/* Terms */}
        <Section title="5. Terms">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Inspection window (days)">
              <input type="number" min={0} max={30} value={form.inspectionDays} onChange={e => update('inspectionDays', e.target.value)} className={inpCls} />
            </Field>
            <Field label="Shipping cost split">
              <select value={form.shippingSplit} onChange={e => update('shippingSplit', e.target.value as Form['shippingSplit'])} className={inpCls}>
                <option value="each-own">Each party pays own outbound</option>
                <option value="shared">Split shipping 50/50</option>
                <option value="a-covers">Party A covers both</option>
                <option value="b-covers">Party B covers both</option>
              </select>
            </Field>
            <Field label="Grading-dispute arbiter">
              <select value={form.gradingDispute} onChange={e => update('gradingDispute', e.target.value as Form['gradingDispute'])} className={inpCls}>
                <option value="psa">PSA</option>
                <option value="bgs">BGS</option>
                <option value="sgc">SGC</option>
                <option value="mutual">Mutually chosen grader</option>
              </select>
            </Field>
            <Field label="Warranty posture">
              <select value={form.asIs ? 'asis' : 'warranty'} onChange={e => update('asIs', e.target.value === 'asis')} className={inpCls}>
                <option value="asis">Cards delivered AS IS (no warranty)</option>
                <option value="warranty">Parties warrant condition as described</option>
              </select>
            </Field>
          </div>
        </Section>

        {/* Sign */}
        <Section title="6. Signatures">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Party A typed signature">
              <input type="text" value={form.signatureA} onChange={e => update('signatureA', e.target.value)} placeholder="/s/ Jane Doe" className={inpCls} />
            </Field>
            <Field label="Party B typed signature">
              <input type="text" value={form.signatureB} onChange={e => update('signatureB', e.target.value)} placeholder="/s/ John Smith" className={inpCls} />
            </Field>
          </div>
          <label className="flex items-center gap-2 mt-3 text-sm text-gray-300">
            <input type="checkbox" checked={form.execStatus === 'executed'} onChange={e => update('execStatus', e.target.checked ? 'executed' : 'draft')} className="accent-blue-500" />
            <span>Mark as executed (both parties have signed)</span>
          </label>
          <div className="mt-3 text-xs">
            <StatusBadge ready={!!requiredReady} executed={!!executionReady && form.execStatus === 'executed'} />
          </div>
        </Section>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button onClick={copyDoc} disabled={!requiredReady} className={btnPrimary}>
            {copied ? 'Copied!' : 'Copy contract text'}
          </button>
          <button onClick={printDoc} disabled={!requiredReady} className={btnSecondary}>
            Print / Save PDF
          </button>
          <button onClick={reset} className={btnGhost}>Reset</button>
        </div>
      </div>

      {/* Right: preview */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl bg-stone-50 text-stone-900 p-6 shadow-2xl ring-1 ring-stone-200 overflow-auto max-h-[85vh]">
          <pre className="whitespace-pre-wrap text-[11px] leading-relaxed" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
{doc}
          </pre>
        </div>
        <div className="mt-2 text-xs text-gray-500 leading-relaxed">
          Draft auto-saves locally. Preview reflects the current form state. Sign, print two copies, and give one to each party.
        </div>
      </div>
    </div>
  );
}

function buildDocument(form: Form, totalA: number, totalB: number): string {
  const L: string[] = [];
  L.push('CARD TRADE CONTRACT');
  L.push('');
  L.push(`Date: ${form.tradeDate || '__________'}`);
  if (form.executionCity || form.executionState) {
    L.push(`Executed at: ${form.executionCity}${form.executionCity && form.executionState ? ', ' : ''}${form.executionState}`);
  }
  L.push('');

  L.push(`PARTY A: ${form.partyA.name || '__________'}`);
  if (form.partyA.email) L.push(`  Email: ${form.partyA.email}`);
  if (form.partyA.address) L.push(`  Address: ${form.partyA.address}`);
  L.push('');
  L.push(`PARTY B: ${form.partyB.name || '__________'}`);
  if (form.partyB.email) L.push(`  Email: ${form.partyB.email}`);
  if (form.partyB.address) L.push(`  Address: ${form.partyB.address}`);
  L.push('');

  L.push('RECITALS');
  L.push('Party A and Party B wish to exchange the cards identified below at the stated fair market values. The parties execute this agreement for purposes of insurance, tax basis, and dispute-resolution record-keeping.');
  L.push('');

  L.push('1. CARDS FROM PARTY A TO PARTY B');
  form.partyA.cards.forEach((c, i) => {
    if (!c.player) return;
    L.push(`  A.${i + 1}  ${c.year || '—'} ${c.set || '—'} ${c.player}`);
    const meta: string[] = [];
    if (c.grade) meta.push(`Grade: ${c.grade}`);
    if (c.cert) meta.push(`Cert: ${c.cert}`);
    if (c.value) meta.push(`FMV: ${money(parseFloat(c.value) || 0)}`);
    if (meta.length) L.push(`       ${meta.join('  |  ')}`);
  });
  L.push(`       SUBTOTAL: ${money(totalA)}`);
  L.push('');

  L.push('2. CARDS FROM PARTY B TO PARTY A');
  form.partyB.cards.forEach((c, i) => {
    if (!c.player) return;
    L.push(`  B.${i + 1}  ${c.year || '—'} ${c.set || '—'} ${c.player}`);
    const meta: string[] = [];
    if (c.grade) meta.push(`Grade: ${c.grade}`);
    if (c.cert) meta.push(`Cert: ${c.cert}`);
    if (c.value) meta.push(`FMV: ${money(parseFloat(c.value) || 0)}`);
    if (meta.length) L.push(`       ${meta.join('  |  ')}`);
  });
  L.push(`       SUBTOTAL: ${money(totalB)}`);
  L.push('');

  // Boot
  const bootAmt = parseFloat(form.bootAmount) || 0;
  if (bootAmt > 0 && form.bootDirection !== 'none') {
    const payer = form.bootDirection === 'a-to-b' ? 'Party A' : 'Party B';
    const payee = form.bootDirection === 'a-to-b' ? 'Party B' : 'Party A';
    L.push('3. CASH BOOT');
    L.push(`${payer} shall pay ${payee} the sum of ${money(bootAmt)} at or before delivery to equalize consideration.`);
    L.push('');
  }

  L.push(`${bootAmt > 0 && form.bootDirection !== 'none' ? '4' : '3'}. INSPECTION & RETURN`);
  L.push(`Each party shall have ${form.inspectionDays || '3'} calendar days from receipt to inspect the cards received. If any card materially differs from the description in sections 1 or 2 (grade, cert number, condition visible from the front or back, or obvious alteration), the receiving party may return the non-conforming card by the original shipping method at the sending party's expense, and the trade shall be void as to that card, with pro-rata adjustment to any cash boot.`);
  L.push('');

  const shipMap: Record<Form['shippingSplit'], string> = {
    'each-own': 'Each party pays for shipping of the cards they send (outbound).',
    'shared': 'Parties shall split total shipping and insurance costs 50/50, reconciled upon delivery.',
    'a-covers': 'Party A shall pay shipping and insurance for both outbound shipments.',
    'b-covers': 'Party B shall pay shipping and insurance for both outbound shipments.',
  };
  L.push(`${bootAmt > 0 && form.bootDirection !== 'none' ? '5' : '4'}. SHIPPING & INSURANCE`);
  L.push(shipMap[form.shippingSplit]);
  L.push('Each card shall ship via tracked, insured service with signature confirmation. Declared value shall equal the FMV stated in sections 1 and 2.');
  L.push('');

  const arbMap: Record<Form['gradingDispute'], string> = {
    'psa': 'PSA (Professional Sports Authenticator)',
    'bgs': 'BGS (Beckett Grading Services)',
    'sgc': 'SGC (Sportscard Guaranty)',
    'mutual': 'a grader mutually agreed to in writing',
  };
  L.push(`${bootAmt > 0 && form.bootDirection !== 'none' ? '6' : '5'}. GRADING DISPUTE`);
  L.push(`If a party disputes that a card received matches the represented grade and the card is encapsulated by a recognized grader, the slab shall be accepted as dispositive. If the dispute concerns a raw card, the receiving party may submit the card at their cost to ${arbMap[form.gradingDispute]} at Regular-tier service; the resulting grade shall govern, and if lower than represented by two full grade points or more, the sending party shall refund the FMV differential or return the original card.`);
  L.push('');

  L.push(`${bootAmt > 0 && form.bootDirection !== 'none' ? '7' : '6'}. WARRANTY`);
  if (form.asIs) {
    L.push('Cards are delivered AS IS, WHERE IS. No express or implied warranty of merchantability, grade accuracy beyond stated grade, centering, or future value is made by either party, except that each party warrants that (a) the card is not knowingly counterfeit, trimmed, recolored, or otherwise altered beyond any noted alterations, and (b) the party has clear title to convey.');
  } else {
    L.push('Each party warrants that the cards delivered match the descriptions in sections 1 and 2 as to grade, condition, and authenticity, and that the party has clear title to convey. This warranty shall survive delivery for thirty (30) days.');
  }
  L.push('');

  L.push(`${bootAmt > 0 && form.bootDirection !== 'none' ? '8' : '7'}. ENTIRE AGREEMENT`);
  L.push(`This document constitutes the entire agreement between the parties regarding this trade, supersedes any prior discussions, and may be modified only by a writing signed by both parties.`);
  L.push('');

  L.push('SIGNATURES');
  L.push('');
  L.push(`Party A:  ${form.signatureA || '__________________________'}    Date: ${form.tradeDate || '__________'}`);
  L.push('');
  L.push(`Party B:  ${form.signatureB || '__________________________'}    Date: ${form.tradeDate || '__________'}`);
  L.push('');
  if (form.execStatus === 'executed') {
    L.push('[ EXECUTED ]  Both parties acknowledge they have signed and received a copy of this agreement.');
  } else {
    L.push('[ DRAFT — NOT YET EXECUTED ]');
  }

  return L.join('\n');
}

function PartyBlock(props: {
  label: string;
  party: Party;
  onChangeField: (f: keyof Omit<Party, 'cards'>, v: string) => void;
  onChangeCard: (i: number, f: keyof CardLine, v: string) => void;
  onAdd: () => void;
  onRemove: (i: number) => void;
  total: number;
}) {
  const { label, party, onChangeField, onChangeCard, onAdd, onRemove, total } = props;
  return (
    <Section title={label}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Full legal name">
          <input type="text" value={party.name} onChange={e => onChangeField('name', e.target.value)} className={inpCls} />
        </Field>
        <Field label="Email">
          <input type="email" value={party.email} onChange={e => onChangeField('email', e.target.value)} className={inpCls} />
        </Field>
        <Field label="Address (optional)" className="sm:col-span-2">
          <input type="text" value={party.address} onChange={e => onChangeField('address', e.target.value)} placeholder="Street, City, ST ZIP" className={inpCls} />
        </Field>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs uppercase tracking-wider text-blue-300 font-semibold">Cards this party gives</div>
          <button type="button" onClick={onAdd} disabled={party.cards.length >= 5} className="text-xs font-semibold text-blue-400 hover:text-blue-300 disabled:opacity-40">+ Add card (max 5)</button>
        </div>
        {party.cards.map((c, i) => (
          <div key={i} className="rounded-lg border border-blue-900/40 bg-blue-950/30 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs text-blue-400 font-mono">Card {i + 1}</div>
              {party.cards.length > 1 && (
                <button type="button" onClick={() => onRemove(i)} className="text-xs text-red-400 hover:text-red-300">Remove</button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              <input type="text" placeholder="Year" value={c.year} onChange={e => onChangeCard(i, 'year', e.target.value)} className={inpTight} />
              <input type="text" placeholder="Set" value={c.set} onChange={e => onChangeCard(i, 'set', e.target.value)} className={`${inpTight} col-span-2`} />
              <input type="text" placeholder="Player" value={c.player} onChange={e => onChangeCard(i, 'player', e.target.value)} className={`${inpTight} col-span-3`} />
              <input type="text" placeholder="Grade" value={c.grade} onChange={e => onChangeCard(i, 'grade', e.target.value)} className={inpTight} />
              <input type="text" placeholder="Cert #" value={c.cert} onChange={e => onChangeCard(i, 'cert', e.target.value)} className={`${inpTight} col-span-3`} />
              <input type="number" inputMode="decimal" placeholder="FMV $" value={c.value} onChange={e => onChangeCard(i, 'value', e.target.value)} className={`${inpTight} col-span-2`} />
            </div>
          </div>
        ))}
        <div className="text-sm font-semibold text-right text-blue-200">Subtotal: {money(total)}</div>
      </div>
    </Section>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-blue-300">{title}</h3>
      {children}
    </section>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className || ''}`}>
      <div className="text-[11px] font-semibold text-gray-400 mb-1 uppercase tracking-wider">{label}</div>
      {children}
    </label>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-400">{label}</span>
      <span className="font-semibold text-gray-100">{children}</span>
    </div>
  );
}

function StatusBadge({ ready, executed }: { ready: boolean; executed: boolean }) {
  if (executed) return <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-950/60 text-emerald-300 ring-1 ring-emerald-700/50 text-[11px] font-semibold tracking-wider">EXECUTED</span>;
  if (ready) return <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-950/60 text-blue-300 ring-1 ring-blue-700/50 text-[11px] font-semibold tracking-wider">READY TO SIGN</span>;
  return <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-gray-800 text-gray-400 ring-1 ring-gray-700 text-[11px] font-semibold tracking-wider">FILL REQUIRED FIELDS</span>;
}

const inpCls = 'w-full rounded-lg bg-slate-950 border border-slate-700 text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500';
const inpTight = 'w-full rounded-md bg-slate-950 border border-slate-700 text-gray-100 px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500';
const btnPrimary = 'px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors';
const btnSecondary = 'px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-gray-100 font-semibold text-sm transition-colors';
const btnGhost = 'px-4 py-2 rounded-lg bg-transparent hover:bg-slate-800 text-gray-400 hover:text-gray-200 font-medium text-sm';
