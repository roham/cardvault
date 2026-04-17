'use client';

import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'cv_donation_receipt_v1';

type Lot = {
  id: string;
  description: string;
  grade: string;
  certNumber: string;
  fmv: string;
  basis: string;
  acqDate: string;
};

type UseType = 'related' | 'unrelated' | 'undetermined';
type GoodsServices = 'none' | 'de-minimis' | 'provided';

type Form = {
  ackDate: string;
  donationDate: string;

  charityName: string;
  charityEin: string;
  charityAddress: string;
  charityType: 'public-501c3' | 'private-operating-foundation' | 'donor-advised-fund' | 'other';
  officerName: string;
  officerTitle: string;
  officerEmail: string;

  donorName: string;
  donorAddress: string;
  donorEmail: string;

  lots: Lot[];

  useType: UseType;
  useDescription: string;
  goodsServices: GoodsServices;
  goodsDescription: string;
  goodsValue: string;

  threeYearNotice: boolean;
  appraiserNamed: boolean;
  appraiserName: string;
  appraiserCredential: string;
  priorYearGifts: string;

  officerSig: string;
  executed: boolean;
};

function mkLot(): Lot {
  return { id: Math.random().toString(36).slice(2, 9), description: '', grade: '', certNumber: '', fmv: '', basis: '', acqDate: '' };
}

const DEFAULT: Form = {
  ackDate: new Date().toISOString().slice(0, 10),
  donationDate: new Date().toISOString().slice(0, 10),

  charityName: '',
  charityEin: '',
  charityAddress: '',
  charityType: 'public-501c3',
  officerName: '',
  officerTitle: '',
  officerEmail: '',

  donorName: '',
  donorAddress: '',
  donorEmail: '',

  lots: [mkLot()],

  useType: 'related',
  useDescription: '',
  goodsServices: 'none',
  goodsDescription: '',
  goodsValue: '',

  threeYearNotice: true,
  appraiserNamed: false,
  appraiserName: '',
  appraiserCredential: '',
  priorYearGifts: '',

  officerSig: '',
  executed: false,
};

function fmtMoney(n: number) {
  try {
    return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  } catch {
    return `$${n.toFixed(0)}`;
  }
}

export default function DonationReceiptClient() {
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
  function updLot(id: string, patch: Partial<Lot>) {
    setForm((f) => ({ ...f, lots: f.lots.map((l) => (l.id === id ? { ...l, ...patch } : l)) }));
  }
  function addLot() { setForm((f) => ({ ...f, lots: [...f.lots, mkLot()] })); }
  function removeLot(id: string) { setForm((f) => ({ ...f, lots: f.lots.filter((l) => l.id !== id) })); }

  const totals = useMemo(() => {
    const fmvTotal = form.lots.reduce((s, l) => s + (parseFloat(l.fmv) || 0), 0);
    const basisTotal = form.lots.reduce((s, l) => s + (parseFloat(l.basis) || 0), 0);
    const maxSingleFmv = form.lots.reduce((m, l) => Math.max(m, parseFloat(l.fmv) || 0), 0);
    const similarItemsFmv = fmvTotal; // all cards are "similar items" for §170 purposes
    const gsValue = form.goodsServices === 'provided' ? (parseFloat(form.goodsValue) || 0) : 0;
    const priorGifts = parseFloat(form.priorYearGifts) || 0;
    const deductibleBase = form.useType === 'unrelated' ? basisTotal : fmvTotal;
    const deductible = Math.max(0, deductibleBase - gsValue);
    return { fmvTotal, basisTotal, maxSingleFmv, similarItemsFmv, gsValue, priorGifts, deductibleBase, deductible };
  }, [form]);

  const cwaTrigger = totals.fmvTotal >= 250; // IRC §170(f)(8)
  const form8283A = totals.fmvTotal > 500 || totals.priorGifts + totals.fmvTotal > 500;
  const form8283B = totals.maxSingleFmv > 5000 || totals.similarItemsFmv > 5000;
  const fullAppraisal = totals.maxSingleFmv > 500000 || totals.similarItemsFmv > 500000;

  const doc = useMemo(() => buildDoc(form, totals, { cwaTrigger, form8283A, form8283B, fullAppraisal }),
    [form, totals, cwaTrigger, form8283A, form8283B, fullAppraisal]);

  const ready = !!form.charityName && !!form.donorName && totals.fmvTotal > 0 && !!form.officerName;

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
        <Sec title="1. Dates">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Fld label="Donation date (property transferred)"><input type="date" value={form.donationDate} onChange={e => upd('donationDate', e.target.value)} className={inp} /></Fld>
            <Fld label="Acknowledgment date (signed by charity)"><input type="date" value={form.ackDate} onChange={e => upd('ackDate', e.target.value)} className={inp} /></Fld>
          </div>
        </Sec>

        <Sec title="2. Donee charity">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Fld label="Legal name" className="sm:col-span-2"><input type="text" value={form.charityName} onChange={e => upd('charityName', e.target.value)} placeholder="Example: National Sports Heritage Foundation" className={inp} /></Fld>
            <Fld label="EIN (Employer Identification Number)"><input type="text" value={form.charityEin} onChange={e => upd('charityEin', e.target.value)} placeholder="12-3456789" className={inp} /></Fld>
            <Fld label="Charity type">
              <select value={form.charityType} onChange={e => upd('charityType', e.target.value as Form['charityType'])} className={inp}>
                <option value="public-501c3">Public 501(c)(3)</option>
                <option value="private-operating-foundation">Private operating foundation</option>
                <option value="donor-advised-fund">Donor-advised fund (sponsored by 501(c)(3))</option>
                <option value="other">Other exempt org</option>
              </select>
            </Fld>
            <Fld label="Mailing address" className="sm:col-span-2"><input type="text" value={form.charityAddress} onChange={e => upd('charityAddress', e.target.value)} placeholder="100 Museum Way, Springfield, MA 01103" className={inp} /></Fld>
            <Fld label="Authorized officer name"><input type="text" value={form.officerName} onChange={e => upd('officerName', e.target.value)} placeholder="Jane Director" className={inp} /></Fld>
            <Fld label="Officer title"><input type="text" value={form.officerTitle} onChange={e => upd('officerTitle', e.target.value)} placeholder="Executive Director" className={inp} /></Fld>
            <Fld label="Officer email" className="sm:col-span-2"><input type="email" value={form.officerEmail} onChange={e => upd('officerEmail', e.target.value)} className={inp} /></Fld>
          </div>
        </Sec>

        <Sec title="3. Donor">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Fld label="Full name" className="sm:col-span-2"><input type="text" value={form.donorName} onChange={e => upd('donorName', e.target.value)} className={inp} /></Fld>
            <Fld label="Mailing address" className="sm:col-span-2"><input type="text" value={form.donorAddress} onChange={e => upd('donorAddress', e.target.value)} placeholder="456 Oak Ave, Portland, OR 97204" className={inp} /></Fld>
            <Fld label="Email"><input type="email" value={form.donorEmail} onChange={e => upd('donorEmail', e.target.value)} className={inp} /></Fld>
            <Fld label="Prior-year gifts (non-cash, for §8283 aggregation)">
              <input type="number" inputMode="decimal" value={form.priorYearGifts} onChange={e => upd('priorYearGifts', e.target.value)} placeholder="0" className={inp} />
            </Fld>
          </div>
        </Sec>

        <Sec title="4. Donated property">
          <div className="space-y-3">
            {form.lots.map((l, i) => (
              <div key={l.id} className="rounded-lg border border-lime-900/40 bg-lime-950/10 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-lime-300">Lot {i + 1}</span>
                  {form.lots.length > 1 && (
                    <button onClick={() => removeLot(l.id)} className="text-xs text-gray-500 hover:text-rose-300">Remove</button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Fld label="Description" className="sm:col-span-2">
                    <input type="text" value={l.description} onChange={e => updLot(l.id, { description: e.target.value })} placeholder="1986 Fleer Michael Jordan Rookie #57" className={inp} />
                  </Fld>
                  <Fld label="Grade / condition"><input type="text" value={l.grade} onChange={e => updLot(l.id, { grade: e.target.value })} placeholder="PSA 9" className={inp} /></Fld>
                  <Fld label="Cert # (if graded)"><input type="text" value={l.certNumber} onChange={e => updLot(l.id, { certNumber: e.target.value })} placeholder="12345678" className={inp} /></Fld>
                  <Fld label="FMV at donation date (USD)">
                    <input type="number" inputMode="decimal" value={l.fmv} onChange={e => updLot(l.id, { fmv: e.target.value })} placeholder="25000" className={inp} />
                  </Fld>
                  <Fld label="Donor's cost basis (USD)">
                    <input type="number" inputMode="decimal" value={l.basis} onChange={e => updLot(l.id, { basis: e.target.value })} placeholder="1200" className={inp} />
                  </Fld>
                  <Fld label="Original acquisition date" className="sm:col-span-2"><input type="date" value={l.acqDate} onChange={e => updLot(l.id, { acqDate: e.target.value })} className={inp} /></Fld>
                </div>
              </div>
            ))}
            <button onClick={addLot} className="w-full px-3 py-2 rounded-lg border border-dashed border-lime-700/50 text-lime-300 hover:bg-lime-950/30 text-sm">+ Add another card</button>
          </div>
          {totals.fmvTotal > 0 && (
            <div className="mt-3 rounded-lg border border-lime-900/40 bg-lime-950/20 p-3 text-xs text-lime-200 space-y-1">
              <div className="flex justify-between"><span>Total claimed FMV</span><span className="font-mono">{fmtMoney(totals.fmvTotal)}</span></div>
              <div className="flex justify-between"><span>Total donor basis</span><span className="font-mono">{fmtMoney(totals.basisTotal)}</span></div>
              <div className="flex justify-between"><span>Max single-lot FMV</span><span className="font-mono">{fmtMoney(totals.maxSingleFmv)}</span></div>
              <div className="flex justify-between border-t border-lime-900/40 pt-1"><span>Deductible (after related-use + G&amp;S)</span><span className="font-mono">{fmtMoney(totals.deductible)}</span></div>
            </div>
          )}
        </Sec>

        <Sec title="5. Intended use (related vs unrelated)">
          <div className="space-y-2">
            <Fld label="Use type">
              <select value={form.useType} onChange={e => upd('useType', e.target.value as UseType)} className={inp}>
                <option value="related">Related use — charity retains / displays / archives</option>
                <option value="unrelated">Unrelated use — charity will sell / auction the property</option>
                <option value="undetermined">Undetermined at this time</option>
              </select>
            </Fld>
            <Fld label="Describe intended use">
              <input type="text" value={form.useDescription} onChange={e => upd('useDescription', e.target.value)} placeholder="Permanent exhibition in the Hall of Fame archive" className={inp} />
            </Fld>
            {form.useType === 'unrelated' && (
              <div className="rounded-lg border border-amber-900/40 bg-amber-950/20 p-3 text-xs text-amber-200">
                <strong>Basis-only deduction.</strong> Under IRC §170(e)(1)(B)(i), unrelated use limits your deduction to cost basis{totals.basisTotal > 0 ? ` (${fmtMoney(totals.basisTotal)})` : ''}, not fair market value. For appreciated cards this may eliminate most of the tax benefit.
              </div>
            )}
            {form.useType === 'related' && totals.fmvTotal >= 5000 && (
              <label className="flex items-start gap-2 text-sm text-gray-300">
                <input type="checkbox" checked={form.threeYearNotice} onChange={e => upd('threeYearNotice', e.target.checked)} className="mt-1 accent-lime-500" />
                <span>Include three-year disposal notice (IRC §170(e)(7) / Form 8282 trigger). Recommended for FMV-claim donations.</span>
              </label>
            )}
          </div>
        </Sec>

        <Sec title="6. Goods or services provided by charity">
          <div className="space-y-2">
            <Fld label="Did the charity provide anything in exchange?">
              <select value={form.goodsServices} onChange={e => upd('goodsServices', e.target.value as GoodsServices)} className={inp}>
                <option value="none">No goods or services provided</option>
                <option value="de-minimis">Only de minimis benefits (under $12.50 / Rev. Proc. 90-12)</option>
                <option value="provided">Yes — goods or services provided (deduction reduced)</option>
              </select>
            </Fld>
            {form.goodsServices === 'provided' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Fld label="Description" className="sm:col-span-2"><input type="text" value={form.goodsDescription} onChange={e => upd('goodsDescription', e.target.value)} placeholder="Two gala-event tickets" className={inp} /></Fld>
                <Fld label="Good-faith estimated value"><input type="number" inputMode="decimal" value={form.goodsValue} onChange={e => upd('goodsValue', e.target.value)} placeholder="400" className={inp} /></Fld>
              </div>
            )}
          </div>
        </Sec>

        {form8283B && (
          <Sec title="7. Qualified appraiser (Form 8283 Section B required)">
            <div className="rounded-lg border border-rose-900/40 bg-rose-950/20 p-3 text-xs text-rose-200 mb-2">
              <strong>Threshold triggered.</strong> Single-lot FMV {fmtMoney(totals.maxSingleFmv)} or similar-items total {fmtMoney(totals.similarItemsFmv)} exceeds $5,000. Donor must obtain a qualified appraisal AND file Form 8283 Section B signed by the appraiser AND by the charity officer.
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Fld label="Appraiser name" className="sm:col-span-2"><input type="text" value={form.appraiserName} onChange={e => upd('appraiserName', e.target.value)} placeholder="John Smith, ISA AM" className={inp} /></Fld>
              <Fld label="Credential (ASA, ISA, AAA, etc.)" className="sm:col-span-2"><input type="text" value={form.appraiserCredential} onChange={e => upd('appraiserCredential', e.target.value)} placeholder="ISA Accredited Member, Sports Memorabilia" className={inp} /></Fld>
            </div>
          </Sec>
        )}

        <Sec title={form8283B ? '8. Officer signature' : '7. Officer signature'}>
          <Fld label="Signature (typed counts as /s/)"><input type="text" value={form.officerSig} onChange={e => upd('officerSig', e.target.value)} placeholder="/s/ Jane Director" className={inp} /></Fld>
          <label className="flex items-center gap-2 mt-3 text-sm text-gray-300">
            <input type="checkbox" checked={form.executed} onChange={e => upd('executed', e.target.checked)} className="accent-lime-500" />
            <span>Signed and delivered to donor on or before the return-filing deadline</span>
          </label>
        </Sec>

        <ComplianceStrip fmv={totals.fmvTotal} cwa={cwaTrigger} a={form8283A} b={form8283B} full={fullAppraisal} />

        <div className="flex flex-wrap gap-3">
          <button onClick={copy} disabled={!ready} className="px-4 py-2 rounded-lg bg-lime-500 hover:bg-lime-400 disabled:opacity-40 text-black font-semibold text-sm">{copied ? 'Copied!' : 'Copy letter'}</button>
          <button onClick={printDoc} disabled={!ready} className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-gray-100 font-semibold text-sm">Print / PDF</button>
          <button onClick={reset} className="px-4 py-2 rounded-lg bg-transparent hover:bg-slate-800 text-gray-400 hover:text-gray-200 font-medium text-sm">Reset</button>
        </div>
      </div>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl bg-stone-50 text-stone-900 p-6 shadow-2xl ring-1 ring-stone-200 overflow-auto max-h-[85vh]">
          <pre className="whitespace-pre-wrap text-[11px] leading-relaxed" style={{ fontFamily: "Georgia,'Times New Roman',serif" }}>{doc}</pre>
        </div>
        <div className="mt-2 text-xs text-gray-500">Draft auto-saves locally. Charity officer signs on letterhead &mdash; original retained by donor for tax records.</div>
      </div>
    </div>
  );
}

function ComplianceStrip({ fmv, cwa, a, b, full }: { fmv: number; cwa: boolean; a: boolean; b: boolean; full: boolean }) {
  return (
    <div className="rounded-lg border border-lime-900/40 bg-lime-950/15 p-3">
      <div className="text-xs font-semibold text-lime-300 mb-2">IRS compliance checklist</div>
      <div className="space-y-1 text-xs">
        <Row label="IRC §170(f)(8) contemporaneous written acknowledgment ($250+)" active={cwa} />
        <Row label="IRS Form 8283 Section A (non-cash gifts &gt; $500)" active={a} />
        <Row label="IRS Form 8283 Section B + qualified appraisal (single lot or similar items &gt; $5,000)" active={b} />
        <Row label="Full appraisal attached to Form 1040 (&gt; $500,000)" active={full} />
      </div>
      {fmv === 0 && <div className="mt-2 text-[11px] text-gray-500">Thresholds activate as you fill in FMV above.</div>}
    </div>
  );
}

function Row({ label, active }: { label: string; active: boolean }) {
  return (
    <div className={`flex items-start gap-2 ${active ? 'text-lime-200' : 'text-gray-500'}`}>
      <span className={`mt-0.5 inline-flex w-4 h-4 rounded border ${active ? 'bg-lime-500 border-lime-400 text-black' : 'bg-transparent border-gray-700'} items-center justify-center text-[10px]`}>{active ? '✓' : ''}</span>
      <span>{label}</span>
    </div>
  );
}

const inp = 'w-full bg-gray-900/60 border border-gray-700 rounded-md px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-lime-500/50';

function Sec({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-gray-900/40 border border-gray-800/60 p-4 sm:p-5">
      <h3 className="text-sm font-semibold text-lime-300 mb-3">{title}</h3>
      {children}
    </section>
  );
}

function Fld({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block text-xs text-gray-400 ${className ?? ''}`}>
      <span className="block mb-1">{label}</span>
      {children}
    </label>
  );
}

type TripTriggers = { cwaTrigger: boolean; form8283A: boolean; form8283B: boolean; fullAppraisal: boolean };
type Totals = {
  fmvTotal: number; basisTotal: number; maxSingleFmv: number; similarItemsFmv: number;
  gsValue: number; priorGifts: number; deductibleBase: number; deductible: number;
};

function buildDoc(f: Form, t: Totals, trig: TripTriggers): string {
  const L: string[] = [];
  const charityLabel = {
    'public-501c3': 'public charity organized under Section 501(c)(3)',
    'private-operating-foundation': 'private operating foundation under Section 4942(j)(3)',
    'donor-advised-fund': 'donor-advised fund sponsored by a 501(c)(3) public charity',
    'other': 'tax-exempt organization',
  }[f.charityType];

  L.push('DONATION ACKNOWLEDGMENT');
  L.push('(IRC §170(f)(8) Contemporaneous Written Acknowledgment)');
  L.push('');
  L.push(`Acknowledgment date: ${f.ackDate}`);
  L.push(`Donation date:       ${f.donationDate}`);
  L.push('');
  L.push('DONEE ORGANIZATION');
  L.push(`${f.charityName || '__________'}`);
  if (f.charityAddress) L.push(f.charityAddress);
  if (f.charityEin) L.push(`EIN: ${f.charityEin}`);
  L.push(`Classification: ${charityLabel}`);
  L.push('');
  L.push('DONOR');
  L.push(`${f.donorName || '__________'}`);
  if (f.donorAddress) L.push(f.donorAddress);
  if (f.donorEmail) L.push(f.donorEmail);
  L.push('');
  L.push(`Dear ${f.donorName || 'Donor'}:`);
  L.push('');
  L.push(`${f.charityName || 'The Organization'} is pleased to acknowledge receipt of your non-cash charitable contribution, which was delivered on ${f.donationDate}. The property described below is recorded in our records at the donation date. This letter constitutes the contemporaneous written acknowledgment required by Section 170(f)(8) of the Internal Revenue Code.`);
  L.push('');
  L.push('1. DESCRIPTION OF DONATED PROPERTY');
  f.lots.forEach((l, i) => {
    const line1 = `   Lot ${i + 1}: ${l.description || '__________'}`;
    L.push(line1);
    const extra = [l.grade && `Grade: ${l.grade}`, l.certNumber && `Cert #: ${l.certNumber}`, l.acqDate && `Original acquisition: ${l.acqDate}`].filter(Boolean).join('   ');
    if (extra) L.push(`     ${extra}`);
  });
  L.push('');
  L.push('   Per IRS Publication 1771, the donee does NOT state the fair market value of the property. Valuation is the responsibility of the donor.');
  L.push('');

  L.push('2. GOODS OR SERVICES PROVIDED IN EXCHANGE');
  if (f.goodsServices === 'none') {
    L.push('   No goods or services were provided by the Organization to the Donor in exchange for this contribution.');
  } else if (f.goodsServices === 'de-minimis') {
    L.push('   Only de minimis goods or services were provided (within the safe-harbor threshold of Rev. Proc. 90-12). Pursuant to that safe harbor, the Donor\u2019s deduction is not reduced.');
  } else {
    L.push(`   The Organization provided the following in exchange: ${f.goodsDescription || '__________'}`);
    L.push(`   Good-faith estimated value: ${fmtMoney(t.gsValue)}. The Donor\u2019s deductible contribution is reduced by this amount.`);
  }
  L.push('');

  L.push('3. INTENDED USE');
  if (f.useType === 'related') {
    L.push('   The Organization certifies that the donated property will be used in a manner RELATED to its tax-exempt purpose and function.');
    if (f.useDescription) L.push(`   Intended use: ${f.useDescription}`);
    L.push('   This related-use certification supports the Donor\u2019s fair-market-value deduction under IRC §170(e)(1)(B)(i).');
    if (f.threeYearNotice) {
      L.push('   THREE-YEAR NOTICE: If the Organization disposes of the property within three years of the donation date, IRS Form 8282 must be filed, and the Donor may be required to recapture the deduction difference between FMV and basis as ordinary income pursuant to IRC §170(e)(7).');
    }
  } else if (f.useType === 'unrelated') {
    L.push('   The Organization intends to put the property to an UNRELATED USE (sale or auction for fundraising).');
    if (f.useDescription) L.push(`   Intended use: ${f.useDescription}`);
    L.push('   Pursuant to IRC §170(e)(1)(B)(i), the Donor\u2019s deduction is limited to cost basis, not fair market value.');
  } else {
    L.push('   The Organization has not yet determined whether the intended use will be related or unrelated. The Donor should consult a qualified tax advisor regarding the effect on the deduction.');
    if (f.useDescription) L.push(`   Preliminary intended use: ${f.useDescription}`);
  }
  L.push('');

  L.push('4. IRS COMPLIANCE NOTES (informational — donor responsibility)');
  if (trig.cwaTrigger) L.push('   - This letter serves as the contemporaneous written acknowledgment under IRC §170(f)(8) for donations of $250 or more.');
  if (trig.form8283A) L.push('   - Because total non-cash contributions exceed $500, Donor must file Form 8283 Section A with their return.');
  if (trig.form8283B) {
    L.push('   - Because a single lot or aggregate similar items exceed $5,000, Donor must obtain a qualified appraisal AND file Form 8283 Section B. The Organization\u2019s authorized officer signs Section B Part IV acknowledging receipt.');
    if (f.appraiserName) L.push(`     Appraiser on file: ${f.appraiserName}${f.appraiserCredential ? ` (${f.appraiserCredential})` : ''}`);
  }
  if (trig.fullAppraisal) L.push('   - Because a single lot or aggregate similar items exceed $500,000, Donor must attach the full qualified appraisal to the tax return.');
  L.push(`   - Total claimed fair market value:  ${fmtMoney(t.fmvTotal)}`);
  if (f.useType === 'unrelated') L.push(`   - Donor cost basis (unrelated-use limit): ${fmtMoney(t.basisTotal)}`);
  if (f.goodsServices === 'provided') L.push(`   - Reduction for goods/services provided: ${fmtMoney(t.gsValue)}`);
  L.push(`   - Deductible amount (subject to AGI limits): ${fmtMoney(t.deductible)}`);
  L.push('');

  L.push('5. CERTIFICATION AND SIGNATURE');
  L.push(`   I, ${f.officerName || '__________'}, ${f.officerTitle || 'authorized officer'} of ${f.charityName || 'the Organization'}, certify that the information provided above is true and correct to the best of my knowledge, and that the Organization is currently recognized by the Internal Revenue Service as described in Section 2 of this acknowledgment.`);
  L.push('');
  L.push(`   Signed: ${f.officerSig || '________________________'}`);
  L.push(`   Name:   ${f.officerName || '________________________'}`);
  L.push(`   Title:  ${f.officerTitle || '________________________'}`);
  L.push(`   Date:   ${f.ackDate}`);
  if (f.officerEmail) L.push(`   Email:  ${f.officerEmail}`);
  L.push('');
  L.push('This letter is not tax advice. Donor should consult a qualified tax professional regarding deductibility, AGI limits, and Form 8283 preparation.');

  return L.join('\n');
}
