'use client';

import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'cv_estate_tax_v1';

type EstateState = '' | 'CT' | 'HI' | 'IL' | 'MA' | 'ME' | 'MD' | 'MN' | 'NY' | 'OR' | 'RI' | 'VT' | 'WA' | 'DC' | 'other';
type InheritanceState = '' | 'IA' | 'KY' | 'MD' | 'NE' | 'NJ' | 'PA' | 'other';
type Relationship = 'spouse' | 'child' | 'parent' | 'sibling' | 'niece-nephew' | 'distant-relative' | 'non-relative';
type Election = 'date-of-death' | 'alt-valuation';

type Form = {
  // Estate overview
  totalEstateValue: string;
  cardPortfolioFmv: string;
  cardDecedentBasis: string;
  altValuationCards: string; // FMV 6 months later
  election: Election;

  // Location
  decedentState: EstateState;
  heirState: InheritanceState;

  // Heir details
  heir: Relationship;
  portabilityUsed: boolean;
  priorDsue: string; // deceased-spouse unused exclusion

  // Comparison scenario
  yearsHeldPreDeath: string;
  heirPlanToSellYears: string;
  heirOrdinaryRate: string;
};

const DEFAULT: Form = {
  totalEstateValue: '',
  cardPortfolioFmv: '',
  cardDecedentBasis: '',
  altValuationCards: '',
  election: 'date-of-death',

  decedentState: '',
  heirState: '',

  heir: 'child',
  portabilityUsed: false,
  priorDsue: '',

  yearsHeldPreDeath: '10',
  heirPlanToSellYears: '0',
  heirOrdinaryRate: '32',
};

// 2026 federal
const FED_EXCLUSION_2026 = 13_990_000;
const FED_TOP_RATE = 0.40;

// State estate tax 2026 (approximated, check state DOR for authoritative figures)
const STATE_ESTATE: Record<string, { name: string; exclusion: number; topRate: number }> = {
  'CT': { name: 'Connecticut', exclusion: 13_990_000, topRate: 0.12 },
  'HI': { name: 'Hawaii',      exclusion: 5_490_000,  topRate: 0.20 },
  'IL': { name: 'Illinois',    exclusion: 4_000_000,  topRate: 0.16 },
  'MA': { name: 'Massachusetts', exclusion: 2_000_000, topRate: 0.16 },
  'ME': { name: 'Maine',       exclusion: 7_000_000,  topRate: 0.12 },
  'MD': { name: 'Maryland',    exclusion: 5_000_000,  topRate: 0.16 },
  'MN': { name: 'Minnesota',   exclusion: 3_000_000,  topRate: 0.16 },
  'NY': { name: 'New York',    exclusion: 7_160_000,  topRate: 0.16 },
  'OR': { name: 'Oregon',      exclusion: 1_000_000,  topRate: 0.16 },
  'RI': { name: 'Rhode Island', exclusion: 1_770_000, topRate: 0.16 },
  'VT': { name: 'Vermont',     exclusion: 5_000_000,  topRate: 0.16 },
  'WA': { name: 'Washington',  exclusion: 2_193_000,  topRate: 0.20 },
  'DC': { name: 'District of Columbia', exclusion: 4_710_000, topRate: 0.16 },
};

// Inheritance tax rates (top marginal, approximated)
const INHERITANCE_TAX: Record<string, Partial<Record<Relationship, number>>> = {
  'IA': { child: 0, spouse: 0, parent: 0, sibling: 0, 'niece-nephew': 0, 'distant-relative': 0, 'non-relative': 0 }, // phased out 2025
  'KY': { spouse: 0, child: 0, parent: 0, sibling: 0.04, 'niece-nephew': 0.08, 'distant-relative': 0.16, 'non-relative': 0.16 },
  'MD': { spouse: 0, child: 0, parent: 0, sibling: 0, 'niece-nephew': 0.10, 'distant-relative': 0.10, 'non-relative': 0.10 },
  'NE': { spouse: 0, child: 0.01, parent: 0.01, sibling: 0.11, 'niece-nephew': 0.11, 'distant-relative': 0.15, 'non-relative': 0.15 },
  'NJ': { spouse: 0, child: 0, parent: 0, sibling: 0.16, 'niece-nephew': 0.16, 'distant-relative': 0.16, 'non-relative': 0.16 },
  'PA': { spouse: 0, child: 0.045, parent: 0.045, sibling: 0.12, 'niece-nephew': 0.15, 'distant-relative': 0.15, 'non-relative': 0.15 },
};

function fmtMoney(n: number) {
  if (!isFinite(n)) return '$0';
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

function toN(s: string): number { const n = parseFloat(s); return isFinite(n) ? n : 0; }

export default function EstateTaxClient() {
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

  const calc = useMemo(() => {
    const gross = toN(form.totalEstateValue);
    const cardsDod = toN(form.cardPortfolioFmv);
    const cardsAlt = toN(form.altValuationCards) || cardsDod;
    const basis = toN(form.cardDecedentBasis);

    // Election effects
    const cardsValue = form.election === 'alt-valuation' ? cardsAlt : cardsDod;
    const altSavings = cardsDod - cardsAlt; // positive if values dropped

    // Federal exclusion including portability
    const portability = form.portabilityUsed ? toN(form.priorDsue) : 0;
    const fedExclusion = FED_EXCLUSION_2026 + portability;
    const fedTaxable = Math.max(0, gross - fedExclusion);
    const fedTax = fedTaxable * FED_TOP_RATE;

    // State estate tax
    const stateInfo = STATE_ESTATE[form.decedentState];
    const stateTaxable = stateInfo ? Math.max(0, gross - stateInfo.exclusion) : 0;
    const stateTax = stateInfo ? stateTaxable * stateInfo.topRate : 0;

    // Inheritance tax (heir-side)
    const inhRates = INHERITANCE_TAX[form.heirState] || {};
    const inhRate = inhRates[form.heir] ?? 0;
    const inheritanceTax = cardsValue * inhRate;

    // Step-up basis outcomes
    const heirNewBasis = cardsValue;
    const appreciation = heirNewBasis - basis;

    // Heir's future-sale comparison: bequest path
    const heirFutureSaleGain = 0; // assuming sale at new basis year 1
    const bequestHeirTax = 0;

    // Lifetime gift path (carryover basis comparison)
    const carryoverBasis = basis;
    const carryoverGain = cardsDod - carryoverBasis;
    const COLLECTIBLES_RATE = 0.28;
    const carryoverCapGainsTax = carryoverGain > 0 ? carryoverGain * COLLECTIBLES_RATE : 0;

    // Total tax bill by path
    const bequestPathTotal = fedTax + stateTax + inheritanceTax;
    const giftPathTotal = carryoverCapGainsTax; // simplified — ignores lifetime gift-tax if above annual exclusion
    const bequestAdvantage = giftPathTotal - bequestPathTotal - inheritanceTax; // net savings vs lifetime gift (excluding inh tax duplication)

    return {
      gross, cardsDod, cardsAlt, cardsValue, altSavings, basis,
      fedExclusion, fedTaxable, fedTax,
      stateInfo, stateTaxable, stateTax,
      inhRate, inheritanceTax,
      heirNewBasis, appreciation,
      heirFutureSaleGain, bequestHeirTax,
      carryoverBasis, carryoverGain, carryoverCapGainsTax,
      bequestPathTotal, giftPathTotal, bequestAdvantage,
    };
  }, [form]);

  function copy() {
    if (!navigator?.clipboard) return;
    const txt = buildReport(form, calc);
    navigator.clipboard.writeText(txt).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1600); });
  }
  function reset() {
    if (!window.confirm('Reset all inputs?')) return;
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setForm(DEFAULT);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-5">
        <Sec title="1. Gross estate">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Fld label="Total gross estate value (all assets)"><input type="number" inputMode="decimal" value={form.totalEstateValue} onChange={e => upd('totalEstateValue', e.target.value)} placeholder="4200000" className={inp} /></Fld>
            <Fld label="Card portfolio FMV at date of death"><input type="number" inputMode="decimal" value={form.cardPortfolioFmv} onChange={e => upd('cardPortfolioFmv', e.target.value)} placeholder="350000" className={inp} /></Fld>
            <Fld label="Decedent's cost basis in card portfolio"><input type="number" inputMode="decimal" value={form.cardDecedentBasis} onChange={e => upd('cardDecedentBasis', e.target.value)} placeholder="45000" className={inp} /></Fld>
            <Fld label="Card FMV 6 months after death (for §2032)"><input type="number" inputMode="decimal" value={form.altValuationCards} onChange={e => upd('altValuationCards', e.target.value)} placeholder="280000" className={inp} /></Fld>
            <Fld label="Valuation election" className="sm:col-span-2">
              <select value={form.election} onChange={e => upd('election', e.target.value as Election)} className={inp}>
                <option value="date-of-death">Date of death (default)</option>
                <option value="alt-valuation">Alternate valuation date (6 months later, IRC §2032)</option>
              </select>
            </Fld>
          </div>
        </Sec>

        <Sec title="2. Jurisdiction">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Fld label="Decedent's state (estate tax)">
              <select value={form.decedentState} onChange={e => upd('decedentState', e.target.value as EstateState)} className={inp}>
                <option value="">No state estate tax</option>
                {Object.entries(STATE_ESTATE).map(([k, v]) => (
                  <option key={k} value={k}>{v.name} ({fmtMoney(v.exclusion)} excl)</option>
                ))}
                <option value="other">Other (no state estate tax)</option>
              </select>
            </Fld>
            <Fld label="Heir's state (inheritance tax)">
              <select value={form.heirState} onChange={e => upd('heirState', e.target.value as InheritanceState)} className={inp}>
                <option value="">No inheritance tax state</option>
                <option value="IA">Iowa (phased out 2025)</option>
                <option value="KY">Kentucky</option>
                <option value="MD">Maryland</option>
                <option value="NE">Nebraska</option>
                <option value="NJ">New Jersey</option>
                <option value="PA">Pennsylvania</option>
                <option value="other">Other (no inheritance tax)</option>
              </select>
            </Fld>
          </div>
        </Sec>

        <Sec title="3. Heir and portability">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Fld label="Relationship to decedent">
              <select value={form.heir} onChange={e => upd('heir', e.target.value as Relationship)} className={inp}>
                <option value="spouse">Spouse</option>
                <option value="child">Child / grandchild (lineal descendant)</option>
                <option value="parent">Parent (lineal ascendant)</option>
                <option value="sibling">Sibling</option>
                <option value="niece-nephew">Niece / nephew</option>
                <option value="distant-relative">Distant relative (cousin etc.)</option>
                <option value="non-relative">Non-relative</option>
              </select>
            </Fld>
            <Fld label="Portability used (deceased-spouse unused exclusion)">
              <label className="flex items-center gap-2 text-sm text-gray-300 mt-2">
                <input type="checkbox" checked={form.portabilityUsed} onChange={e => upd('portabilityUsed', e.target.checked)} className="accent-fuchsia-500" />
                <span>DSUE from predeceased spouse</span>
              </label>
            </Fld>
            {form.portabilityUsed && (
              <Fld label="DSUE amount" className="sm:col-span-2"><input type="number" inputMode="decimal" value={form.priorDsue} onChange={e => upd('priorDsue', e.target.value)} placeholder="8000000" className={inp} /></Fld>
            )}
          </div>
        </Sec>

        <Sec title="4. Comparison: bequest vs lifetime gift">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Fld label="Years held pre-death (for appreciation estimate)"><input type="number" inputMode="decimal" value={form.yearsHeldPreDeath} onChange={e => upd('yearsHeldPreDeath', e.target.value)} className={inp} /></Fld>
            <Fld label="Heir plans to sell in N years"><input type="number" inputMode="decimal" value={form.heirPlanToSellYears} onChange={e => upd('heirPlanToSellYears', e.target.value)} className={inp} /></Fld>
            <Fld label="Heir's ordinary income tax rate (for collectibles 28% floor check)" className="sm:col-span-2">
              <select value={form.heirOrdinaryRate} onChange={e => upd('heirOrdinaryRate', e.target.value)} className={inp}>
                <option value="10">10% (up to $11,925)</option>
                <option value="12">12% ($11,926 - $48,475)</option>
                <option value="22">22% ($48,476 - $103,350)</option>
                <option value="24">24% ($103,351 - $197,300)</option>
                <option value="32">32% ($197,301 - $250,525)</option>
                <option value="35">35% ($250,526 - $626,350)</option>
                <option value="37">37% ($626,351+)</option>
              </select>
            </Fld>
          </div>
          <div className="mt-2 text-[11px] text-gray-500">Collectibles are capped at 28% long-term capital gains (IRC §1(h)(4)); the effective rate is min(ordinary, 28%).</div>
        </Sec>

        <div className="flex flex-wrap gap-3">
          <button onClick={copy} className="px-4 py-2 rounded-lg bg-fuchsia-500 hover:bg-fuchsia-400 text-black font-semibold text-sm">{copied ? 'Copied!' : 'Copy report'}</button>
          <button onClick={reset} className="px-4 py-2 rounded-lg bg-transparent hover:bg-slate-800 text-gray-400 hover:text-gray-200 font-medium text-sm">Reset</button>
        </div>
      </div>

      <div className="lg:sticky lg:top-24 lg:self-start space-y-4">
        <ResultCard title="Federal estate tax" rows={[
          ['Gross estate',           fmtMoney(calc.gross)],
          [`Federal exclusion (2026${form.portabilityUsed ? ' + DSUE' : ''})`, fmtMoney(calc.fedExclusion)],
          ['Taxable estate',         fmtMoney(calc.fedTaxable)],
          ['Federal tax at 40%',     fmtMoney(calc.fedTax)],
        ]} highlight={calc.fedTax > 0 ? 'red' : 'green'} />

        {calc.stateInfo && (
          <ResultCard title={`${calc.stateInfo.name} estate tax`} rows={[
            [`State exclusion`,       fmtMoney(calc.stateInfo.exclusion)],
            ['Taxable estate (state)', fmtMoney(calc.stateTaxable)],
            [`State tax at ${(calc.stateInfo.topRate * 100).toFixed(0)}%`, fmtMoney(calc.stateTax)],
          ]} highlight={calc.stateTax > 0 ? 'red' : 'green'} />
        )}

        {form.heirState && INHERITANCE_TAX[form.heirState] && (
          <ResultCard title={`${form.heirState} inheritance tax (heir-paid)`} rows={[
            ['Relationship',            labelRelation(form.heir)],
            [`Rate for this class`,      `${(calc.inhRate * 100).toFixed(1)}%`],
            ['Inheritance tax on cards', fmtMoney(calc.inheritanceTax)],
          ]} highlight={calc.inheritanceTax > 0 ? 'red' : 'green'} />
        )}

        <ResultCard title="IRC §1014 step-up basis (heir)" rows={[
          ['Decedent basis in cards',   fmtMoney(calc.basis)],
          ['Heir\'s new basis (step-up)', fmtMoney(calc.heirNewBasis)],
          ['Appreciation wiped out',    fmtMoney(calc.appreciation)],
        ]} highlight="green" />

        {calc.cardsDod > 0 && calc.basis > 0 && (
          <ResultCard title="Bequest vs lifetime gift on these cards" rows={[
            ['Bequest path: heir sells at FMV basis (zero gain)', fmtMoney(0)],
            ['Lifetime gift path: heir sells with carryover basis', fmtMoney(calc.carryoverCapGainsTax)],
            [`Savings from bequest vs gift`, fmtMoney(calc.carryoverCapGainsTax)],
          ]} highlight="green" note={`28% collectibles cap applied (IRC §1(h)(4)).`} />
        )}

        {form.election === 'alt-valuation' && calc.altSavings !== 0 && (
          <ResultCard title="Alternate valuation (§2032)" rows={[
            ['Date-of-death card FMV', fmtMoney(calc.cardsDod)],
            ['Alt-valuation card FMV', fmtMoney(calc.cardsAlt)],
            ['FMV change', fmtMoney(calc.altSavings)],
            ['Heir\'s step-up basis under election', fmtMoney(calc.cardsAlt)],
          ]} highlight={calc.altSavings > 0 ? 'amber' : 'green'} note="Alt-valuation reduces estate tax AND reduces heir's basis. Election only available if both drop." />
        )}

        <div className="rounded-xl bg-gray-900/50 border border-gray-800 p-4 text-xs text-gray-400 space-y-1">
          <div className="text-gray-300 font-semibold">Total estate-side tax on the whole estate</div>
          <div className="flex justify-between"><span>Federal</span><span className="font-mono">{fmtMoney(calc.fedTax)}</span></div>
          <div className="flex justify-between"><span>State estate</span><span className="font-mono">{fmtMoney(calc.stateTax)}</span></div>
          <div className="flex justify-between"><span>State inheritance (heir-paid on cards)</span><span className="font-mono">{fmtMoney(calc.inheritanceTax)}</span></div>
          <div className="flex justify-between border-t border-gray-800 pt-1 mt-1 text-white"><span>Combined</span><span className="font-mono">{fmtMoney(calc.fedTax + calc.stateTax + calc.inheritanceTax)}</span></div>
        </div>
      </div>
    </div>
  );
}

function labelRelation(r: Relationship): string {
  return ({
    spouse: 'Spouse', child: 'Child/grandchild', parent: 'Parent', sibling: 'Sibling',
    'niece-nephew': 'Niece/nephew', 'distant-relative': 'Distant relative', 'non-relative': 'Non-relative'
  })[r] ?? r;
}

function ResultCard({ title, rows, highlight, note }: { title: string; rows: [string, string][]; highlight: 'red' | 'green' | 'amber'; note?: string }) {
  const ring = highlight === 'red' ? 'border-rose-900/50 bg-rose-950/15' : highlight === 'amber' ? 'border-amber-900/50 bg-amber-950/15' : 'border-emerald-900/50 bg-emerald-950/15';
  const head = highlight === 'red' ? 'text-rose-300' : highlight === 'amber' ? 'text-amber-300' : 'text-emerald-300';
  return (
    <div className={`rounded-xl border ${ring} p-4`}>
      <div className={`text-xs font-semibold uppercase tracking-wide ${head} mb-2`}>{title}</div>
      <div className="space-y-1 text-xs text-gray-300">
        {rows.map(([k, v], i) => (
          <div key={i} className="flex justify-between"><span>{k}</span><span className="font-mono text-white">{v}</span></div>
        ))}
      </div>
      {note && <div className="mt-2 text-[11px] text-gray-500">{note}</div>}
    </div>
  );
}

const inp = 'w-full bg-gray-900/60 border border-gray-700 rounded-md px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50';

function Sec({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-gray-900/40 border border-gray-800/60 p-4 sm:p-5">
      <h3 className="text-sm font-semibold text-fuchsia-300 mb-3">{title}</h3>
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

function buildReport(f: Form, c: ReturnType<typeof compute>): string {
  const L: string[] = [];
  L.push('CardVault Estate Tax & Step-Up Basis Report');
  L.push('');
  L.push(`Gross estate:              ${fmtMoney(c.gross)}`);
  L.push(`Card portfolio (DoD):      ${fmtMoney(c.cardsDod)}`);
  L.push(`Decedent basis in cards:   ${fmtMoney(c.basis)}`);
  L.push(`Valuation election:        ${f.election === 'alt-valuation' ? 'Alternate valuation (§2032)' : 'Date of death'}`);
  L.push('');
  L.push('Federal estate tax');
  L.push(`  Exclusion (2026${f.portabilityUsed ? ' + DSUE' : ''}):  ${fmtMoney(c.fedExclusion)}`);
  L.push(`  Taxable estate:          ${fmtMoney(c.fedTaxable)}`);
  L.push(`  Federal tax @ 40%:       ${fmtMoney(c.fedTax)}`);
  if (c.stateInfo) {
    L.push(`State estate tax (${c.stateInfo.name})`);
    L.push(`  State exclusion:         ${fmtMoney(c.stateInfo.exclusion)}`);
    L.push(`  State taxable:           ${fmtMoney(c.stateTaxable)}`);
    L.push(`  State tax:               ${fmtMoney(c.stateTax)}`);
  }
  if (f.heirState && INHERITANCE_TAX[f.heirState]) {
    L.push(`State inheritance tax (${f.heirState})`);
    L.push(`  Rate (${labelRelation(f.heir)}):  ${(c.inhRate * 100).toFixed(1)}%`);
    L.push(`  Inheritance tax:          ${fmtMoney(c.inheritanceTax)}`);
  }
  L.push('');
  L.push('IRC §1014 step-up basis');
  L.push(`  Heir's new basis:        ${fmtMoney(c.heirNewBasis)}`);
  L.push(`  Appreciation wiped out:  ${fmtMoney(c.appreciation)}`);
  L.push('');
  if (c.basis > 0 && c.cardsDod > 0) {
    L.push('Bequest vs lifetime gift');
    L.push(`  Bequest path tax:         ${fmtMoney(0)} (step-up wipes gain)`);
    L.push(`  Lifetime gift path tax:   ${fmtMoney(c.carryoverCapGainsTax)} (28% collectibles on carryover)`);
    L.push(`  Savings from bequest:     ${fmtMoney(c.carryoverCapGainsTax)}`);
  }
  L.push('');
  L.push('Total estate-side tax on the whole estate:');
  L.push(`  ${fmtMoney(c.fedTax + c.stateTax + c.inheritanceTax)}`);
  L.push('');
  L.push('Educational only. Consult a qualified estate-planning attorney and CPA.');
  return L.join('\n');
}

type ComputeResult = {
  gross: number; cardsDod: number; cardsAlt: number; cardsValue: number; altSavings: number; basis: number;
  fedExclusion: number; fedTaxable: number; fedTax: number;
  stateInfo: (typeof STATE_ESTATE)[string] | undefined; stateTaxable: number; stateTax: number;
  inhRate: number; inheritanceTax: number;
  heirNewBasis: number; appreciation: number;
  heirFutureSaleGain: number; bequestHeirTax: number;
  carryoverBasis: number; carryoverGain: number; carryoverCapGainsTax: number;
  bequestPathTotal: number; giftPathTotal: number; bequestAdvantage: number;
};

function compute(_: Form): ComputeResult {
  throw new Error('unused — kept for type helper on buildReport');
}
