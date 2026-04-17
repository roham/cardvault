'use client';

import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'cv_break_agreement_draft_v1';

type Participant = { name: string; email: string; team: string; slot: string; paid: string };

type Form = {
  breakDate: string;
  organizer: string;
  organizerEmail: string;
  breakType: 'random-team' | 'pyt' | 'hit-draft' | 'pick-your-price';
  product: string;
  breakPlatform: 'whatnot' | 'fanatics-live' | 'ebay-live' | 'instagram-live' | 'other';
  totalBuyIn: string;
  participants: Participant[];
  randomizer: 'dice' | 'random-org' | 'digital-wheel' | 'card-draw' | 'other';
  shippingPolicy: 'organizer-ships-all' | 'ship-per-participant' | 'pickup';
  hitsPolicy: 'stays-with-team-owner' | 'split-by-buy-in' | 'randomized';
  disputePolicy: 'organizer-decision' | 'majority-vote' | 'refund-and-void';
  executed: boolean;
  organizerSig: string;
};

const EMPTY_P: Participant = { name: '', email: '', team: '', slot: '', paid: '' };
const DEFAULT: Form = {
  breakDate: new Date().toISOString().slice(0, 10),
  organizer: '', organizerEmail: '',
  breakType: 'random-team',
  product: '',
  breakPlatform: 'whatnot',
  totalBuyIn: '',
  participants: [ { ...EMPTY_P }, { ...EMPTY_P } ],
  randomizer: 'random-org',
  shippingPolicy: 'organizer-ships-all',
  hitsPolicy: 'stays-with-team-owner',
  disputePolicy: 'organizer-decision',
  executed: false,
  organizerSig: '',
};

function money(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export default function BreakAgreementClient() {
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
  function updP(i: number, k: keyof Participant, v: string) {
    setForm((f) => ({ ...f, participants: f.participants.map((p, j) => j === i ? { ...p, [k]: v } : p) }));
  }
  function addP() { setForm((f) => f.participants.length >= 32 ? f : ({ ...f, participants: [...f.participants, { ...EMPTY_P }] })); }
  function rmP(i: number) { setForm((f) => ({ ...f, participants: f.participants.length <= 1 ? f.participants : f.participants.filter((_, j) => j !== i) })); }

  const totalPaid = useMemo(() => form.participants.reduce((s, p) => s + (parseFloat(p.paid) || 0), 0), [form.participants]);
  const totalBuyIn = parseFloat(form.totalBuyIn) || 0;
  const coverage = totalBuyIn === 0 ? 0 : (totalPaid / totalBuyIn) * 100;

  const doc = useMemo(() => buildDoc(form, totalPaid), [form, totalPaid]);

  const ready = !!form.organizer && !!form.product && form.participants.some(p => p.name && p.team);

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

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-5">
        <Sec title="1. Break meta">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Fld label="Break date"><input type="date" value={form.breakDate} onChange={e => upd('breakDate', e.target.value)} className={inp} /></Fld>
            <Fld label="Break platform">
              <select value={form.breakPlatform} onChange={e => upd('breakPlatform', e.target.value as Form['breakPlatform'])} className={inp}>
                <option value="whatnot">Whatnot</option><option value="fanatics-live">Fanatics Live</option><option value="ebay-live">eBay Live</option><option value="instagram-live">Instagram Live</option><option value="other">Other</option>
              </select>
            </Fld>
            <Fld label="Break type">
              <select value={form.breakType} onChange={e => upd('breakType', e.target.value as Form['breakType'])} className={inp}>
                <option value="random-team">Random Team</option><option value="pyt">Pick Your Team</option><option value="hit-draft">Hit Draft</option><option value="pick-your-price">Pick Your Price</option>
              </select>
            </Fld>
            <Fld label="Product"><input type="text" value={form.product} onChange={e => upd('product', e.target.value)} placeholder="2025 Topps Chrome Hobby Box" className={inp} /></Fld>
            <Fld label="Total buy-in ($)"><input type="number" inputMode="decimal" value={form.totalBuyIn} onChange={e => upd('totalBuyIn', e.target.value)} className={inp} /></Fld>
            <Fld label="Randomizer method">
              <select value={form.randomizer} onChange={e => upd('randomizer', e.target.value as Form['randomizer'])} className={inp}>
                <option value="random-org">random.org</option><option value="dice">Physical dice</option><option value="digital-wheel">Digital wheel</option><option value="card-draw">Card draw</option><option value="other">Other</option>
              </select>
            </Fld>
          </div>
        </Sec>

        <Sec title="2. Organizer">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Fld label="Full name"><input type="text" value={form.organizer} onChange={e => upd('organizer', e.target.value)} className={inp} /></Fld>
            <Fld label="Email"><input type="email" value={form.organizerEmail} onChange={e => upd('organizerEmail', e.target.value)} className={inp} /></Fld>
          </div>
        </Sec>

        <Sec title="3. Participants">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-indigo-300 font-semibold uppercase tracking-wider">Slots paid: {money(totalPaid)} / {money(totalBuyIn)} ({coverage.toFixed(0)}%)</div>
            <button onClick={addP} disabled={form.participants.length >= 32} className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 disabled:opacity-40">+ Add (max 32)</button>
          </div>
          <div className="space-y-2">
            {form.participants.map((p, i) => (
              <div key={i} className="rounded-lg border border-indigo-900/40 bg-indigo-950/20 p-2.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-indigo-400 font-mono">P{i + 1}</span>
                  {form.participants.length > 1 && <button onClick={() => rmP(i)} className="text-xs text-red-400 hover:text-red-300">Remove</button>}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <input type="text" placeholder="Name" value={p.name} onChange={e => updP(i, 'name', e.target.value)} className={`${inpT} col-span-2`} />
                  <input type="email" placeholder="Email" value={p.email} onChange={e => updP(i, 'email', e.target.value)} className={inpT} />
                  <input type="text" placeholder="Team(s) / slot(s)" value={p.team} onChange={e => updP(i, 'team', e.target.value)} className={`${inpT} col-span-2`} />
                  <input type="text" placeholder="Slot #" value={p.slot} onChange={e => updP(i, 'slot', e.target.value)} className={inpT} />
                  <input type="number" placeholder="Paid $" value={p.paid} onChange={e => updP(i, 'paid', e.target.value)} className={inpT} />
                </div>
              </div>
            ))}
          </div>
        </Sec>

        <Sec title="4. Rules">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Fld label="Shipping policy">
              <select value={form.shippingPolicy} onChange={e => upd('shippingPolicy', e.target.value as Form['shippingPolicy'])} className={inp}>
                <option value="organizer-ships-all">Organizer ships all hits (BGS 1.0+ required)</option>
                <option value="ship-per-participant">Ship per participant, PWE for commons OK</option>
                <option value="pickup">Local pickup only</option>
              </select>
            </Fld>
            <Fld label="Hits policy">
              <select value={form.hitsPolicy} onChange={e => upd('hitsPolicy', e.target.value as Form['hitsPolicy'])} className={inp}>
                <option value="stays-with-team-owner">Hit stays with team owner</option>
                <option value="split-by-buy-in">Split proceeds by buy-in proportion</option>
                <option value="randomized">All hits re-randomized post-break</option>
              </select>
            </Fld>
            <Fld label="Dispute resolution">
              <select value={form.disputePolicy} onChange={e => upd('disputePolicy', e.target.value as Form['disputePolicy'])} className={inp}>
                <option value="organizer-decision">Organizer final decision</option>
                <option value="majority-vote">Majority vote of participants</option>
                <option value="refund-and-void">Refund all + void break</option>
              </select>
            </Fld>
          </div>
        </Sec>

        <Sec title="5. Executed">
          <Fld label="Organizer typed signature"><input type="text" value={form.organizerSig} onChange={e => upd('organizerSig', e.target.value)} placeholder="/s/ Jane Doe" className={inp} /></Fld>
          <label className="flex items-center gap-2 mt-2 text-sm text-gray-300">
            <input type="checkbox" checked={form.executed} onChange={e => upd('executed', e.target.checked)} className="accent-indigo-500" />
            <span>All participants have confirmed receipt of this agreement</span>
          </label>
        </Sec>

        <div className="flex flex-wrap gap-3">
          <button onClick={copy} disabled={!ready} className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 disabled:opacity-40 text-white font-semibold text-sm">{copied ? 'Copied!' : 'Copy contract'}</button>
          <button onClick={printDoc} disabled={!ready} className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-gray-100 font-semibold text-sm">Print / PDF</button>
          <button onClick={reset} className="px-4 py-2 rounded-lg bg-transparent hover:bg-slate-800 text-gray-400 hover:text-gray-200 font-medium text-sm">Reset</button>
        </div>
      </div>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl bg-stone-50 text-stone-900 p-6 shadow-2xl ring-1 ring-stone-200 overflow-auto max-h-[85vh]">
          <pre className="whitespace-pre-wrap text-[11px] leading-relaxed" style={{ fontFamily: "Georgia,'Times New Roman',serif" }}>{doc}</pre>
        </div>
        <div className="mt-2 text-xs text-gray-500">Draft auto-saves locally. Share a copy with every participant BEFORE the break begins.</div>
      </div>
    </div>
  );
}

function buildDoc(f: Form, totalPaid: number): string {
  const L: string[] = [];
  L.push('GROUP BREAK PARTICIPATION AGREEMENT');
  L.push('');
  L.push(`Date: ${f.breakDate}`);
  L.push(`Organizer: ${f.organizer || '__________'}${f.organizerEmail ? ` (${f.organizerEmail})` : ''}`);
  L.push(`Platform: ${f.breakPlatform.replace('-', ' ')}`);
  L.push(`Product: ${f.product || '__________'}`);
  L.push(`Break type: ${labelBreakType(f.breakType)}`);
  L.push(`Total buy-in: ${money(parseFloat(f.totalBuyIn) || 0)}`);
  L.push('');
  L.push('PARTICIPANTS AND SLOTS');
  f.participants.forEach((p, i) => {
    if (!p.name) return;
    const paid = parseFloat(p.paid) || 0;
    const parts = [`P${i + 1}`, p.name];
    if (p.email) parts.push(`<${p.email}>`);
    if (p.team) parts.push(`Team(s): ${p.team}`);
    if (p.slot) parts.push(`Slot ${p.slot}`);
    parts.push(`Paid: ${money(paid)}`);
    L.push('  ' + parts.join(' | '));
  });
  L.push(`  SLOT TOTAL: ${money(totalPaid)}`);
  L.push('');
  L.push(`RANDOMIZATION: ${labelRand(f.randomizer)}. Recorded and shared with all participants prior to opening packs.`);
  L.push('');
  L.push(`SHIPPING: ${labelShip(f.shippingPolicy)}. Shipping costs outside the buy-in unless specifically negotiated above.`);
  L.push('');
  L.push(`HITS POLICY: ${labelHits(f.hitsPolicy)}.`);
  L.push('');
  L.push(`DISPUTE RESOLUTION: ${labelDisp(f.disputePolicy)}. Any disagreement regarding slot assignment, product authenticity, card condition, or shipping shall be resolved per this policy before payments are considered final.`);
  L.push('');
  L.push('ORGANIZER WARRANTIES');
  L.push('Organizer warrants that (a) the product is factory sealed and unopened prior to the break, (b) all participants will see the randomization and break live or in recorded form, (c) all hits and base cards are delivered per the policy above, (d) no slot will be double-assigned or pre-assigned to the organizer.');
  L.push('');
  L.push('PARTICIPANT ACKNOWLEDGEMENTS');
  L.push('Each participant acknowledges that (a) the product is a sealed pack/box with no guaranteed hits, (b) the value of cards received may be greater than, equal to, or less than their buy-in, (c) all sales final once randomization occurs and packs begin opening, (d) the organizer is not responsible for post-delivery loss or damage.');
  L.push('');
  L.push('SIGNATURES');
  L.push('');
  L.push(`Organizer: ${f.organizerSig || '__________________________'}   Date: ${f.breakDate}`);
  L.push('');
  L.push('Participants acknowledge by payment of their buy-in.');
  L.push('');
  L.push(f.executed ? '[ EXECUTED ] All participants have confirmed receipt of this agreement.' : '[ DRAFT — NOT YET EXECUTED ]');
  return L.join('\n');
}

function labelBreakType(t: Form['breakType']) {
  return t === 'random-team' ? 'Random Team (every slot randomized to a single team)' :
         t === 'pyt' ? 'Pick Your Team (participants pre-select teams at fixed or tiered prices)' :
         t === 'hit-draft' ? 'Hit Draft (hits drafted in a pre-set order after pack opens)' :
         'Pick Your Price (participants choose teams at organizer-set price points)';
}
function labelRand(r: Form['randomizer']) {
  return r === 'random-org' ? 'random.org list shuffler with recorded seed and timestamp' :
         r === 'dice' ? 'physical dice roll on camera' :
         r === 'digital-wheel' ? 'digital wheel spinner (Wheelofnames, Spinnerwheel, or equivalent) with recorded result' :
         r === 'card-draw' ? 'physical card draw from a shuffled deck on camera' :
         'organizer-disclosed method as agreed in advance';
}
function labelShip(s: Form['shippingPolicy']) {
  return s === 'organizer-ships-all' ? 'Organizer ships all hits via tracked + insured service with signature for any card over $250' :
         s === 'ship-per-participant' ? 'Organizer ships per participant; PWE acceptable for cards under $20, tracked + insured required for $20+' :
         'Local pickup within 14 days of break completion; organizer holds cards in safe storage pending pickup';
}
function labelHits(h: Form['hitsPolicy']) {
  return h === 'stays-with-team-owner' ? 'Each hit stays with the participant who owns the team on which the card appears. Base cards follow the same rule unless noted otherwise' :
         h === 'split-by-buy-in' ? 'Hit proceeds are sold and split among participants proportional to each participant\u2019s buy-in' :
         'All hits pulled during the break are re-randomized post-break using the same randomization method';
}
function labelDisp(d: Form['disputePolicy']) {
  return d === 'organizer-decision' ? 'Organizer shall be the final arbiter of disputes. Organizer\u2019s decision is binding if communicated within 72 hours of the break' :
         d === 'majority-vote' ? 'Disputes resolved by majority vote of all paid participants within 72 hours, facilitated by the organizer' :
         'Any dispute voids the break; all participants receive a full refund of their buy-in within 7 days';
}

function Sec({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4"><h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo-300">{title}</h3>{children}</section>;
}
function Fld({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><div className="text-[11px] font-semibold text-gray-400 mb-1 uppercase tracking-wider">{label}</div>{children}</label>;
}
const inp = 'w-full rounded-lg bg-slate-950 border border-slate-700 text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';
const inpT = 'w-full rounded-md bg-slate-950 border border-slate-700 text-gray-100 px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500';
