'use client';

import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'cv_gift_deed_draft_v1';

const ANNUAL_EXCLUSION_2026 = 19000; // IRS 2025-2026 annual exclusion (per recipient)
const ANNUAL_EXCLUSION_SPOUSE_NONUS = 190000; // non-US-citizen spouse 2026
const LIFETIME_EXCLUSION_2026 = 13_990_000; // federal unified credit basic exclusion 2026

type Relationship =
  | 'spouse'
  | 'child'
  | 'grandchild'
  | 'parent'
  | 'sibling'
  | 'niece-nephew'
  | 'friend'
  | 'other';

type CardEntry = {
  description: string;
  year: string;
  player: string;
  condition: string;
  fmv: string;
  basis: string;
};

type Form = {
  deedDate: string;
  donorName: string;
  donorAddress: string;
  donorEmail: string;
  recipientName: string;
  recipientAddress: string;
  recipientEmail: string;
  relationship: Relationship;
  recipientIsMinor: boolean;
  custodianName: string;
  cards: CardEntry[];
  priorGiftsYTD: string;
  isSpouseNonCitizen: boolean;
  irrevocable: boolean;
  presentInterest: boolean;
  basisCarryoverAck: boolean;
  governingState: string;
  donorSig: string;
  recipientSig: string;
  witness1: string;
  witness2: string;
  notarized: boolean;
};

const BLANK_CARD: CardEntry = { description: '', year: '', player: '', condition: '', fmv: '', basis: '' };

const DEFAULT: Form = {
  deedDate: new Date().toISOString().slice(0, 10),
  donorName: '', donorAddress: '', donorEmail: '',
  recipientName: '', recipientAddress: '', recipientEmail: '',
  relationship: 'child',
  recipientIsMinor: false,
  custodianName: '',
  cards: [{ ...BLANK_CARD }],
  priorGiftsYTD: '',
  isSpouseNonCitizen: false,
  irrevocable: true,
  presentInterest: true,
  basisCarryoverAck: true,
  governingState: '',
  donorSig: '', recipientSig: '',
  witness1: '', witness2: '',
  notarized: false,
};

const RELATIONSHIP_LABELS: Record<Relationship, string> = {
  spouse: 'Spouse',
  child: 'Child (son / daughter)',
  grandchild: 'Grandchild',
  parent: 'Parent',
  sibling: 'Sibling',
  'niece-nephew': 'Niece / Nephew',
  friend: 'Friend',
  other: 'Other',
};

function money(n: number): string {
  if (!n) return '__________';
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

function parseNum(s: string): number {
  const v = parseFloat((s || '').replace(/[$,]/g, ''));
  return isNaN(v) ? 0 : v;
}

export default function GiftDeedClient() {
  const [form, setForm] = useState<Form>(DEFAULT);
  const [hydrated, setHydrated] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setForm((f) => ({ ...f, ...JSON.parse(raw) }));
    } catch { /* noop */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(form)); } catch { /* noop */ }
  }, [form, hydrated]);

  function upd<K extends keyof Form>(k: K, v: Form[K]) { setForm((f) => ({ ...f, [k]: v })); }
  function updCard(i: number, k: keyof CardEntry, v: string) {
    setForm((f) => ({
      ...f,
      cards: f.cards.map((c, idx) => (idx === i ? { ...c, [k]: v } : c)),
    }));
  }
  function addCard() {
    setForm((f) => (f.cards.length >= 10 ? f : { ...f, cards: [...f.cards, { ...BLANK_CARD }] }));
  }
  function removeCard(i: number) {
    setForm((f) => (f.cards.length <= 1 ? f : { ...f, cards: f.cards.filter((_, idx) => idx !== i) }));
  }

  const totalFMV = useMemo(
    () => form.cards.reduce((s, c) => s + parseNum(c.fmv), 0),
    [form.cards]
  );
  const totalBasis = useMemo(
    () => form.cards.reduce((s, c) => s + parseNum(c.basis), 0),
    [form.cards]
  );
  const priorYTD = parseNum(form.priorGiftsYTD);
  const annualExclusion = form.relationship === 'spouse' && form.isSpouseNonCitizen
    ? ANNUAL_EXCLUSION_SPOUSE_NONUS
    : ANNUAL_EXCLUSION_2026;
  const isSpouseFull = form.relationship === 'spouse' && !form.isSpouseNonCitizen;
  const totalGiftsThisYearToRecipient = totalFMV + priorYTD;
  const exceedsAnnual = !isSpouseFull && totalGiftsThisYearToRecipient > annualExclusion;
  const overByAmount = Math.max(0, totalGiftsThisYearToRecipient - annualExclusion);
  const form709Required = exceedsAnnual;
  const unrealizedGain = Math.max(0, totalFMV - totalBasis);

  const doc = useMemo(() => buildDoc(form, totalFMV, totalBasis, annualExclusion, priorYTD), [form, totalFMV, totalBasis, annualExclusion, priorYTD]);

  const ready = !!form.donorName && !!form.recipientName && form.cards.some((c) => c.player || c.description);

  function copy() {
    if (!navigator?.clipboard) return;
    navigator.clipboard.writeText(doc).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1600); });
  }
  function printDoc() {
    const w = window.open('', '_blank', 'width=800,height=900');
    if (!w) return;
    w.document.body.style.margin = '0';
    const pre = w.document.createElement('pre');
    pre.style.fontFamily = "Georgia,'Times New Roman',serif";
    pre.style.fontSize = '12pt';
    pre.style.whiteSpace = 'pre-wrap';
    pre.style.padding = '1in';
    pre.style.maxWidth = '7in';
    pre.style.margin = '0 auto';
    pre.textContent = doc;
    w.document.body.appendChild(pre);
    setTimeout(() => w.print(), 100);
  }
  function reset() {
    if (!window.confirm('Reset the draft?')) return;
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
    setForm(DEFAULT);
  }

  if (!hydrated) {
    return <div className="rounded-2xl bg-slate-900/40 border border-slate-800 p-8 text-center text-gray-500 text-sm">Loading&hellip;</div>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-5">
        <Sec title="1. Deed date">
          <Fld label="Date of gift">
            <input type="date" value={form.deedDate} onChange={(e) => upd('deedDate', e.target.value)} className={inp} />
          </Fld>
        </Sec>

        <Sec title="2. Donor (giver)">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Fld label="Full name"><input type="text" value={form.donorName} onChange={(e) => upd('donorName', e.target.value)} className={inp} /></Fld>
            <Fld label="Email"><input type="email" value={form.donorEmail} onChange={(e) => upd('donorEmail', e.target.value)} className={inp} /></Fld>
            <Fld label="Address / city / state" className="sm:col-span-2">
              <input type="text" value={form.donorAddress} onChange={(e) => upd('donorAddress', e.target.value)} className={inp} />
            </Fld>
          </div>
        </Sec>

        <Sec title="3. Recipient (donee)">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Fld label="Full name"><input type="text" value={form.recipientName} onChange={(e) => upd('recipientName', e.target.value)} className={inp} /></Fld>
            <Fld label="Email"><input type="email" value={form.recipientEmail} onChange={(e) => upd('recipientEmail', e.target.value)} className={inp} /></Fld>
            <Fld label="Address / city / state" className="sm:col-span-2">
              <input type="text" value={form.recipientAddress} onChange={(e) => upd('recipientAddress', e.target.value)} className={inp} />
            </Fld>
            <Fld label="Relationship to donor">
              <select value={form.relationship} onChange={(e) => upd('relationship', e.target.value as Relationship)} className={inp}>
                {(Object.keys(RELATIONSHIP_LABELS) as Relationship[]).map((r) => (
                  <option key={r} value={r}>{RELATIONSHIP_LABELS[r]}</option>
                ))}
              </select>
            </Fld>
            <Fld label="Recipient is a minor?">
              <label className="flex items-center gap-2 mt-2 text-sm text-gray-300">
                <input type="checkbox" checked={form.recipientIsMinor} onChange={(e) => upd('recipientIsMinor', e.target.checked)} className="accent-sky-500" />
                <span>Yes &mdash; custodian under UTMA/UGMA required</span>
              </label>
            </Fld>
          </div>
          {form.recipientIsMinor && (
            <Fld label="Custodian name (UTMA/UGMA)" className="mt-3">
              <input type="text" value={form.custodianName} onChange={(e) => upd('custodianName', e.target.value)} className={inp} placeholder="John Doe, as Custodian for Recipient under [State] UTMA" />
            </Fld>
          )}
          {form.relationship === 'spouse' && (
            <label className="flex items-center gap-2 mt-3 text-sm text-gray-300">
              <input type="checkbox" checked={form.isSpouseNonCitizen} onChange={(e) => upd('isSpouseNonCitizen', e.target.checked)} className="accent-sky-500" />
              <span>Spouse is NOT a U.S. citizen &mdash; $190,000 annual exclusion cap applies</span>
            </label>
          )}
        </Sec>

        <Sec title="4. Schedule of gifted cards">
          <div className="space-y-3">
            {form.cards.map((c, i) => (
              <div key={i} className="p-3 rounded-lg border border-slate-800 bg-slate-900/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500 font-semibold">Lot #{i + 1}</div>
                  {form.cards.length > 1 && (
                    <button onClick={() => removeCard(i)} className="text-xs text-rose-400 hover:text-rose-300 underline">Remove</button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Fld label="Description (set + card #)">
                    <input type="text" value={c.description} onChange={(e) => updCard(i, 'description', e.target.value)} className={inp} placeholder="1986 Fleer #57" />
                  </Fld>
                  <Fld label="Year">
                    <input type="text" value={c.year} onChange={(e) => updCard(i, 'year', e.target.value)} className={inp} placeholder="1986" />
                  </Fld>
                  <Fld label="Player">
                    <input type="text" value={c.player} onChange={(e) => updCard(i, 'player', e.target.value)} className={inp} placeholder="Michael Jordan" />
                  </Fld>
                  <Fld label="Condition / grade">
                    <input type="text" value={c.condition} onChange={(e) => updCard(i, 'condition', e.target.value)} className={inp} placeholder="PSA 8" />
                  </Fld>
                  <Fld label="FMV (date of gift)">
                    <input type="text" value={c.fmv} onChange={(e) => updCard(i, 'fmv', e.target.value)} className={inp} placeholder="2500" />
                  </Fld>
                  <Fld label="Donor cost basis">
                    <input type="text" value={c.basis} onChange={(e) => updCard(i, 'basis', e.target.value)} className={inp} placeholder="400" />
                  </Fld>
                </div>
              </div>
            ))}
            {form.cards.length < 10 && (
              <button onClick={addCard} className="w-full py-2 rounded-lg border border-dashed border-sky-700/60 text-sm text-sky-400 hover:bg-sky-950/40 transition-colors">
                + Add card
              </button>
            )}
          </div>
        </Sec>

        <Sec title="5. Prior gifts this year">
          <Fld label={`Total prior gifts to this recipient, YTD (pre-this-deed)`}>
            <input type="text" value={form.priorGiftsYTD} onChange={(e) => upd('priorGiftsYTD', e.target.value)} className={inp} placeholder="0" />
          </Fld>
          <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">
            Include cash, property, and prior card gifts made to the same recipient in the current calendar year. Used to determine whether this gift pushes total annual gifts above the <strong>{money(annualExclusion)}</strong> IRS annual exclusion cap.
          </p>
        </Sec>

        <Sec title="6. Donor intent &amp; acknowledgements">
          <label className="flex items-start gap-2 text-sm text-gray-300 mt-1">
            <input type="checkbox" checked={form.irrevocable} onChange={(e) => upd('irrevocable', e.target.checked)} className="accent-sky-500 mt-0.5" />
            <span>Irrevocable &mdash; donor retains no right to reclaim the gifted cards.</span>
          </label>
          <label className="flex items-start gap-2 text-sm text-gray-300 mt-2">
            <input type="checkbox" checked={form.presentInterest} onChange={(e) => upd('presentInterest', e.target.checked)} className="accent-sky-500 mt-0.5" />
            <span>Present interest &mdash; recipient takes immediate possession, use, and enjoyment (required for annual exclusion eligibility).</span>
          </label>
          <label className="flex items-start gap-2 text-sm text-gray-300 mt-2">
            <input type="checkbox" checked={form.basisCarryoverAck} onChange={(e) => upd('basisCarryoverAck', e.target.checked)} className="accent-sky-500 mt-0.5" />
            <span>Recipient acknowledges basis carryover &mdash; inherits donor&rsquo;s cost basis of {money(totalBasis)} under IRC &sect;1015 (NOT stepped up).</span>
          </label>
          <Fld label="Governing state" className="mt-3">
            <input type="text" value={form.governingState} onChange={(e) => upd('governingState', e.target.value)} className={inp} placeholder="Texas" />
          </Fld>
        </Sec>

        <Sec title="7. Signatures &amp; notary">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Fld label="Donor signature"><input type="text" value={form.donorSig} onChange={(e) => upd('donorSig', e.target.value)} className={inp} /></Fld>
            <Fld label="Recipient signature"><input type="text" value={form.recipientSig} onChange={(e) => upd('recipientSig', e.target.value)} className={inp} /></Fld>
            <Fld label="Witness 1 (required)"><input type="text" value={form.witness1} onChange={(e) => upd('witness1', e.target.value)} className={inp} /></Fld>
            <Fld label="Witness 2 (recommended)"><input type="text" value={form.witness2} onChange={(e) => upd('witness2', e.target.value)} className={inp} /></Fld>
          </div>
          <label className="flex items-center gap-2 mt-3 text-sm text-gray-300">
            <input type="checkbox" checked={form.notarized} onChange={(e) => upd('notarized', e.target.checked)} className="accent-sky-500" />
            <span>Notarize (strongly recommended for gifts above {money(annualExclusion)})</span>
          </label>
        </Sec>
      </div>

      <div className="space-y-4 lg:sticky lg:top-4 self-start">
        {/* Live stats strip */}
        <div className="grid grid-cols-2 gap-2">
          <Stat label="Total FMV" value={money(totalFMV)} tone="sky" />
          <Stat label="Donor basis" value={money(totalBasis)} tone="neutral" />
          <Stat label="Annual cap" value={money(annualExclusion)} tone={isSpouseFull ? 'emerald' : 'sky'} sub={isSpouseFull ? 'Unlimited spouse' : `Ex. ${form.relationship === 'spouse' && form.isSpouseNonCitizen ? 'non-US spouse' : 'per recipient'}`} />
          <Stat label="YTD incl. this" value={money(totalGiftsThisYearToRecipient)} tone={form709Required ? 'rose' : 'emerald'} />
        </div>

        {/* Threshold / Form 709 callout */}
        <div className={`rounded-2xl p-4 border ${form709Required ? 'bg-rose-950/40 border-rose-800/60' : 'bg-emerald-950/30 border-emerald-800/50'}`}>
          {form709Required ? (
            <>
              <div className="text-xs uppercase tracking-wider text-rose-300 font-semibold mb-1">Form 709 required</div>
              <p className="text-sm text-rose-100 leading-relaxed">
                Total gifts to this recipient this year <strong>{money(totalGiftsThisYearToRecipient)}</strong> exceed the {money(annualExclusion)} annual exclusion by <strong>{money(overByAmount)}</strong>. Donor must file <strong>IRS Form 709 (United States Gift Tax Return)</strong> by April 15 of next year. The excess is typically absorbed by the {money(LIFETIME_EXCLUSION_2026)} federal lifetime unified credit (no out-of-pocket tax unless the donor has already used their lifetime amount).
              </p>
            </>
          ) : (
            <>
              <div className="text-xs uppercase tracking-wider text-emerald-300 font-semibold mb-1">Under annual exclusion</div>
              <p className="text-sm text-emerald-100 leading-relaxed">
                Gift total {money(totalGiftsThisYearToRecipient)} is at or below the {money(annualExclusion)} annual exclusion{isSpouseFull ? ' (unlimited for US-citizen spouse)' : ''}. No Form 709 filing triggered by this gift alone.
              </p>
            </>
          )}
        </div>

        {/* Basis carryover callout */}
        {unrealizedGain > 0 && (
          <div className="rounded-2xl p-4 border bg-amber-950/30 border-amber-800/50">
            <div className="text-xs uppercase tracking-wider text-amber-300 font-semibold mb-1">Basis carryover</div>
            <p className="text-sm text-amber-100 leading-relaxed">
              Donor basis <strong>{money(totalBasis)}</strong> carries to recipient. Unrealized gain <strong>{money(unrealizedGain)}</strong> moves with the card. If recipient sells at FMV, they owe the 28% collectibles cap-gains tax on the full appreciation (est. ~{money(unrealizedGain * 0.28)} federal). This is a KEY difference from inheritance, which would reset basis to FMV at death (IRC &sect;1014 step-up). For highly-appreciated cards, consider whether a bequest (via estate) serves the recipient&rsquo;s tax situation better than a lifetime gift.
            </p>
          </div>
        )}

        {/* CT warning */}
        {form.governingState.trim().toLowerCase().startsWith('connecticut') && (
          <div className="rounded-2xl p-4 border bg-rose-950/30 border-rose-800/50">
            <div className="text-xs uppercase tracking-wider text-rose-300 font-semibold mb-1">Connecticut state gift tax</div>
            <p className="text-sm text-rose-100 leading-relaxed">
              Connecticut is the <strong>only U.S. state with its own gift tax</strong> (in addition to federal). CT allows a lifetime exclusion matching the federal amount ({money(LIFETIME_EXCLUSION_2026)}), but gifts above the federal annual exclusion still require CT Form CT-706/709 reporting. Check current CT DRS rules before relying on this deed.
            </p>
          </div>
        )}

        {/* Document preview */}
        <div className="rounded-2xl border border-sky-800/60 bg-slate-900/70 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs uppercase tracking-wider text-sky-300 font-semibold">Deed preview</div>
            <div className="flex gap-2">
              <button onClick={copy} disabled={!ready} className={btn}>{copied ? 'Copied ✓' : 'Copy'}</button>
              <button onClick={printDoc} disabled={!ready} className={btn}>Print / PDF</button>
              <button onClick={reset} className={btnGhost}>Reset</button>
            </div>
          </div>
          <pre className="text-[10.5px] text-gray-300 whitespace-pre-wrap font-serif leading-relaxed max-h-[640px] overflow-y-auto">
            {doc}
          </pre>
        </div>
      </div>
    </div>
  );
}

/* ─── Subcomponents ───────────────────────────── */
const inp = 'w-full px-2.5 py-1.5 rounded-md bg-slate-950/60 border border-slate-700 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-sky-600';
const btn = 'px-3 py-1 rounded-md bg-sky-700 hover:bg-sky-600 text-xs text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors';
const btnGhost = 'px-3 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-xs text-gray-300 font-semibold transition-colors';

function Sec({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-slate-900/40 border border-slate-800 p-4">
      <h3 className="text-sm font-bold text-white mb-3">{title}</h3>
      {children}
    </div>
  );
}
function Fld({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className || ''}`}>
      <span className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</span>
      {children}
    </label>
  );
}
function Stat({ label, value, tone, sub }: { label: string; value: string; tone: 'sky' | 'emerald' | 'rose' | 'neutral'; sub?: string }) {
  const toneCls = {
    sky: 'bg-sky-950/50 border-sky-800/60 text-sky-100',
    emerald: 'bg-emerald-950/50 border-emerald-800/60 text-emerald-100',
    rose: 'bg-rose-950/50 border-rose-800/60 text-rose-100',
    neutral: 'bg-slate-900/60 border-slate-700 text-slate-200',
  }[tone];
  return (
    <div className={`p-3 rounded-lg border ${toneCls}`}>
      <div className="text-[10px] uppercase tracking-wider font-semibold opacity-80">{label}</div>
      <div className="text-base font-bold leading-tight">{value}</div>
      {sub && <div className="text-[10px] opacity-75 mt-0.5">{sub}</div>}
    </div>
  );
}

/* ─── Document builder ────────────────────────── */
function buildDoc(f: Form, totalFMV: number, totalBasis: number, annualEx: number, priorYTD: number): string {
  const lines: string[] = [];
  lines.push('DEED OF GIFT');
  lines.push('─'.repeat(60));
  lines.push('');
  lines.push(`Date of gift: ${f.deedDate || '__________'}`);
  lines.push(`Governing state: ${f.governingState || '__________'}`);
  lines.push('');
  lines.push('1. PARTIES');
  lines.push('');
  lines.push(`  Donor:      ${f.donorName || '__________'}`);
  if (f.donorAddress) lines.push(`              ${f.donorAddress}`);
  if (f.donorEmail) lines.push(`              ${f.donorEmail}`);
  lines.push('');
  lines.push(`  Recipient:  ${f.recipientName || '__________'}`);
  if (f.recipientAddress) lines.push(`              ${f.recipientAddress}`);
  if (f.recipientEmail) lines.push(`              ${f.recipientEmail}`);
  lines.push(`              Relationship: ${RELATIONSHIP_LABELS[f.relationship]}`);
  if (f.recipientIsMinor) {
    lines.push(`              Minor — held by: ${f.custodianName || '__________'}`);
  }
  lines.push('');
  lines.push('2. SCHEDULE OF GIFTED PROPERTY');
  lines.push('');
  f.cards.forEach((c, i) => {
    const parts: string[] = [];
    if (c.year) parts.push(c.year);
    if (c.description) parts.push(c.description);
    if (c.player) parts.push(c.player);
    if (c.condition) parts.push(`[${c.condition}]`);
    const title = parts.join(' ') || '__________';
    lines.push(`  Lot ${i + 1}: ${title}`);
    lines.push(`          FMV: ${money(parseNum(c.fmv))}  |  Donor basis: ${money(parseNum(c.basis))}`);
    lines.push('');
  });
  lines.push(`  Totals:  FMV ${money(totalFMV)}  |  Basis ${money(totalBasis)}`);
  const unreal = Math.max(0, totalFMV - totalBasis);
  if (unreal > 0) lines.push(`           Unrealized appreciation transferred: ${money(unreal)}`);
  lines.push('');
  lines.push('3. DONOR INTENT');
  lines.push('');
  lines.push(`  Donor, for and in consideration of the natural love and affection`);
  lines.push(`  that Donor has for Recipient${f.relationship !== 'other' && f.relationship !== 'friend' ? ` as Donor's ${RELATIONSHIP_LABELS[f.relationship].toLowerCase()}` : ''}, and`);
  lines.push(`  without any consideration or compensation whatsoever, does hereby`);
  lines.push(`  give, grant, transfer, and deliver to Recipient the property`);
  lines.push(`  described in Section 2, together with all right, title, and`);
  lines.push(`  interest therein.`);
  lines.push('');
  if (f.irrevocable) {
    lines.push(`  This gift is IRREVOCABLE. Donor retains no right, power, or`);
    lines.push(`  authority to alter, amend, revoke, or recall the property.`);
    lines.push('');
  }
  if (f.presentInterest) {
    lines.push(`  Recipient takes immediate possession, use, and enjoyment of the`);
    lines.push(`  property as of the date above (present interest for IRC`);
    lines.push(`  §2503(b) annual exclusion purposes).`);
    lines.push('');
  }
  lines.push('4. BASIS CARRYOVER ACKNOWLEDGEMENT');
  lines.push('');
  lines.push(`  Under IRC §1015, Recipient's cost basis in the gifted property`);
  lines.push(`  is ${money(totalBasis)} (Donor's adjusted basis carried over). Recipient`);
  lines.push(`  expressly acknowledges that basis is NOT stepped up to fair market`);
  lines.push(`  value as would occur with inherited property under IRC §1014.`);
  lines.push(`  Recipient is responsible for the unrealized gain of ${money(unreal)}`);
  lines.push(`  upon any subsequent sale or taxable disposition.`);
  lines.push('');
  lines.push('5. GIFT TAX / FORM 709 DISCLOSURE');
  lines.push('');
  const totalYTD = totalFMV + priorYTD;
  const isSpouseUS = f.relationship === 'spouse' && !f.isSpouseNonCitizen;
  if (isSpouseUS) {
    lines.push(`  Gift to U.S.-citizen spouse — UNLIMITED MARITAL DEDUCTION applies.`);
    lines.push(`  No gift tax reporting triggered by this transfer.`);
  } else if (totalYTD > annualEx) {
    const excess = totalYTD - annualEx;
    lines.push(`  Total gifts from Donor to Recipient this calendar year, including`);
    lines.push(`  prior YTD gifts of ${money(priorYTD)}, equal ${money(totalYTD)} — exceeding`);
    lines.push(`  the ${money(annualEx)} annual exclusion by ${money(excess)}. Donor is`);
    lines.push(`  required to file IRS Form 709 (United States Gift Tax Return)`);
    lines.push(`  by April 15 following the calendar year of the gift. The excess`);
    lines.push(`  is typically absorbed by the ${money(LIFETIME_EXCLUSION_2026)} federal lifetime`);
    lines.push(`  unified credit (basic exclusion amount for 2026).`);
  } else {
    lines.push(`  Total gifts from Donor to Recipient this calendar year, including`);
    lines.push(`  prior YTD gifts of ${money(priorYTD)}, equal ${money(totalYTD)} — at or below`);
    lines.push(`  the ${money(annualEx)} annual exclusion. No Form 709 filing triggered.`);
  }
  lines.push('');
  lines.push('6. GOVERNING LAW');
  lines.push('');
  lines.push(`  This deed shall be governed by the laws of the State of`);
  lines.push(`  ${f.governingState || '__________'}.`);
  if (f.governingState.trim().toLowerCase().startsWith('connecticut')) {
    lines.push('');
    lines.push(`  NOTICE: Connecticut imposes its own state gift tax in addition`);
    lines.push(`  to federal. Separate CT Form CT-706/709 reporting may be`);
    lines.push(`  required — consult a qualified Connecticut tax advisor.`);
  }
  lines.push('');
  lines.push('7. EXECUTION');
  lines.push('');
  lines.push(`  Donor:        _____________________________   Date: _________`);
  lines.push(`                ${f.donorSig || ''}`);
  lines.push(`                ${f.donorName || ''}`);
  lines.push('');
  lines.push(`  Recipient:    _____________________________   Date: _________`);
  lines.push(`                ${f.recipientSig || ''}`);
  lines.push(`                ${f.recipientName || ''}`);
  lines.push('');
  lines.push(`  Witness 1:    _____________________________   Date: _________`);
  lines.push(`                ${f.witness1 || ''}`);
  lines.push('');
  lines.push(`  Witness 2:    _____________________________   Date: _________`);
  lines.push(`                ${f.witness2 || ''}`);
  lines.push('');
  if (f.notarized) {
    lines.push('─'.repeat(60));
    lines.push('NOTARY ACKNOWLEDGEMENT');
    lines.push('');
    lines.push(`State of ${f.governingState || '__________'}        )`);
    lines.push(`County of __________________    ) ss.`);
    lines.push('');
    lines.push(`On this ___ day of _________________, 20____, before me`);
    lines.push(`personally appeared ${f.donorName || 'the Donor'} and ${f.recipientName || 'the Recipient'},`);
    lines.push(`known to me (or satisfactorily proven) to be the persons whose`);
    lines.push(`names are subscribed to the within instrument, and acknowledged`);
    lines.push(`that they executed the same for the purposes therein contained.`);
    lines.push('');
    lines.push(`_____________________________`);
    lines.push(`Notary Public`);
    lines.push(`My commission expires: _______________`);
  }
  lines.push('');
  lines.push('─'.repeat(60));
  lines.push('This deed is a drafting aid provided by CardVault for informational');
  lines.push('purposes only. It is not tax or legal advice. Consult a qualified');
  lines.push('tax professional before relying on this document for any gift');
  lines.push('that may trigger IRS Form 709 filing, estate planning, or cross-state');
  lines.push('transfer rules.');
  return lines.join('\n');
}
