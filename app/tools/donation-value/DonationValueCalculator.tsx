'use client';

import { useMemo, useState } from 'react';

type OrgType = 'public_charity' | 'private_operating' | 'private_nonoperating' | 'donor_advised';
type UseClass = 'related' | 'unrelated';
type HoldingPeriod = 'short' | 'long';

const ORG_META: Record<OrgType, { label: string; agiCapAppreciated: number; agiCapBasis: number; note: string }> = {
  public_charity: {
    label: 'Public charity (museum, 501(c)(3) HoF, school)',
    agiCapAppreciated: 0.30,
    agiCapBasis: 0.50,
    note: 'Cooperstown, Naismith HoF, Pro Football HoF, most university athletics museums, and charity auctions run by public 501(c)(3) orgs fall here.',
  },
  private_operating: {
    label: 'Private operating foundation',
    agiCapAppreciated: 0.30,
    agiCapBasis: 0.50,
    note: 'Active-program private foundation (rare in the hobby). Treated more favorably than non-operating foundations.',
  },
  private_nonoperating: {
    label: 'Private non-operating foundation',
    agiCapAppreciated: 0.20,
    agiCapBasis: 0.30,
    note: 'Grant-making family foundation. For non-publicly-traded collectibles, deduction is capped at COST BASIS, not FMV.',
  },
  donor_advised: {
    label: 'Donor-advised fund (DAF)',
    agiCapAppreciated: 0.30,
    agiCapBasis: 0.50,
    note: 'Fidelity Charitable, Schwab Charitable, community-foundation DAF. Must appraise high-value cards before transfer.',
  },
};

const USE_META: Record<UseClass, { label: string; note: string }> = {
  related: {
    label: 'Related use (org displays / preserves the card)',
    note: 'Card is used in the org\u2019s exempt purpose. Example: donating a 52 Mantle to the Hall of Fame museum for permanent display.',
  },
  unrelated: {
    label: 'Unrelated use (org will auction / sell the card)',
    note: 'Org plans to liquidate. Example: donating a 86 Fleer Jordan to a charity auction. Deduction is capped at cost basis.',
  },
};

function fmt(n: number): string {
  if (!isFinite(n)) return '$0';
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 10_000) return `$${Math.round(n).toLocaleString()}`;
  return `$${n.toFixed(2).replace(/\.00$/, '')}`;
}

function pct(n: number): string {
  return `${(n * 100).toFixed(0)}%`;
}

export default function DonationValueCalculator() {
  const [fmv, setFmv] = useState<number>(2500);
  const [basis, setBasis] = useState<number>(400);
  const [holding, setHolding] = useState<HoldingPeriod>('long');
  const [orgType, setOrgType] = useState<OrgType>('public_charity');
  const [useClass, setUseClass] = useState<UseClass>('related');
  const [agi, setAgi] = useState<number>(150000);
  const [marginalRate, setMarginalRate] = useState<number>(0.24);
  const [itemizes, setItemizes] = useState<boolean>(true);

  const result = useMemo(() => {
    const orgMeta = ORG_META[orgType];
    const isPrivateNonop = orgType === 'private_nonoperating';

    // Deduction value rules (IRS Pub 526 / 561)
    //  - Short-term capital gain property: always LESSER of FMV or basis
    //  - Long-term capital gain property:
    //      public charity + related use: FMV
    //      public charity + unrelated use: basis
    //      private non-operating foundation: basis (always, for tangible personal property)
    //      DAF / private operating + related use: FMV
    //      DAF / private operating + unrelated use: basis
    let deductionValue: number;
    let deductionRule: string;

    if (holding === 'short') {
      deductionValue = Math.min(fmv, basis);
      deductionRule = 'Short-term property: deduction is the LESSER of FMV or cost basis (ordinary-income property rule, IRC \u00a7170(e)(1)(A)).';
    } else if (isPrivateNonop) {
      deductionValue = Math.min(fmv, basis);
      deductionRule = 'Non-operating private foundations: tangible personal property deduction is CAPPED AT COST BASIS, not FMV (IRC \u00a7170(e)(1)(B)(ii)).';
    } else if (useClass === 'unrelated') {
      deductionValue = Math.min(fmv, basis);
      deductionRule = 'Unrelated use (org will sell the card): long-term tangible personal property deduction is CAPPED AT COST BASIS (IRC \u00a7170(e)(1)(B)(i)).';
    } else {
      deductionValue = fmv;
      deductionRule = 'Related use (org displays / preserves the card) + long-term: deduction is the FULL FAIR MARKET VALUE.';
    }

    // AGI cap
    const usesBasisCap = deductionValue <= basis + 0.5;
    const agiCapPct = usesBasisCap ? orgMeta.agiCapBasis : orgMeta.agiCapAppreciated;
    const agiCap = agi * agiCapPct;
    const allowedThisYear = Math.min(deductionValue, agiCap);
    const carryforward = Math.max(0, deductionValue - allowedThisYear);

    // Form 8283 / appraisal requirements
    const form8283Required = deductionValue > 500;
    const form8283SectionB = deductionValue > 5000;
    const qualifiedAppraisalRequired = deductionValue > 5000;
    const acknowledgementRequired = fmv >= 250;

    // Tax savings vs alternative path
    const taxSavingsFromDeduction = itemizes ? allowedThisYear * marginalRate : 0;

    // Alternative: sell card, pay 28% collectibles long-term (or marginal short-term), donate cash
    const capGain = Math.max(0, fmv - basis);
    const sellTaxRate = holding === 'long' ? Math.max(0.28, marginalRate) : marginalRate;
    const sellTaxOwed = capGain * sellTaxRate;
    const afterTaxProceeds = fmv - sellTaxOwed;
    const cashDeduction = Math.min(afterTaxProceeds, agi * (isPrivateNonop ? 0.30 : 0.50));
    const cashTaxSavings = itemizes ? cashDeduction * marginalRate : 0;
    const altNetBenefit = cashTaxSavings - sellTaxOwed + cashDeduction; // total charitable impact (what org gets + tax saved - tax paid)

    // Donation path net benefit: what org receives at FMV + your tax savings
    const donationNetBenefit = fmv + taxSavingsFromDeduction;
    const altNetPath = afterTaxProceeds + cashTaxSavings;
    const arbitrage = donationNetBenefit - altNetPath;

    return {
      deductionValue,
      deductionRule,
      agiCapPct,
      agiCap,
      allowedThisYear,
      carryforward,
      form8283Required,
      form8283SectionB,
      qualifiedAppraisalRequired,
      acknowledgementRequired,
      taxSavingsFromDeduction,
      capGain,
      sellTaxRate,
      sellTaxOwed,
      afterTaxProceeds,
      cashTaxSavings,
      donationNetBenefit,
      altNetPath,
      arbitrage,
      usesBasisCap,
    };
  }, [fmv, basis, holding, orgType, useClass, agi, marginalRate, itemizes]);

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-900/60 border border-violet-900/30 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-violet-300 mb-4 uppercase tracking-wider">1. The card</h3>
          <div className="space-y-3">
            <label className="block">
              <span className="text-xs text-gray-400">Fair market value (FMV) at donation date</span>
              <input
                type="number"
                min={0}
                step={50}
                value={fmv}
                onChange={(e) => setFmv(Math.max(0, Number(e.target.value) || 0))}
                className="mt-1 w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-lg font-semibold"
              />
              <span className="text-[11px] text-gray-500 mt-1 block">Cite your comp source. For cards over $5,000, you\u2019ll need a qualified appraiser.</span>
            </label>
            <label className="block">
              <span className="text-xs text-gray-400">Your cost basis (what you paid)</span>
              <input
                type="number"
                min={0}
                step={25}
                value={basis}
                onChange={(e) => setBasis(Math.max(0, Number(e.target.value) || 0))}
                className="mt-1 w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-lg font-semibold"
              />
              <span className="text-[11px] text-gray-500 mt-1 block">Purchase price + grading fees + commissions. Inherited cards take stepped-up basis at date of death.</span>
            </label>
            <label className="block">
              <span className="text-xs text-gray-400">Holding period</span>
              <select
                value={holding}
                onChange={(e) => setHolding(e.target.value as HoldingPeriod)}
                className="mt-1 w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
              >
                <option value="long">Long-term (held more than 1 year)</option>
                <option value="short">Short-term (held 1 year or less)</option>
              </select>
            </label>
          </div>
        </div>

        <div className="bg-gray-900/60 border border-violet-900/30 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-violet-300 mb-4 uppercase tracking-wider">2. The recipient</h3>
          <div className="space-y-3">
            <label className="block">
              <span className="text-xs text-gray-400">Recipient organization type</span>
              <select
                value={orgType}
                onChange={(e) => setOrgType(e.target.value as OrgType)}
                className="mt-1 w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
              >
                {(Object.keys(ORG_META) as OrgType[]).map((k) => (
                  <option key={k} value={k}>{ORG_META[k].label}</option>
                ))}
              </select>
              <span className="text-[11px] text-gray-500 mt-1 block">{ORG_META[orgType].note}</span>
            </label>
            <label className="block">
              <span className="text-xs text-gray-400">How will the org use the card?</span>
              <select
                value={useClass}
                onChange={(e) => setUseClass(e.target.value as UseClass)}
                disabled={orgType === 'private_nonoperating'}
                className="mt-1 w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white disabled:opacity-50"
              >
                {(Object.keys(USE_META) as UseClass[]).map((k) => (
                  <option key={k} value={k}>{USE_META[k].label}</option>
                ))}
              </select>
              <span className="text-[11px] text-gray-500 mt-1 block">{USE_META[useClass].note}</span>
            </label>
            <label className="block">
              <span className="text-xs text-gray-400">Your adjusted gross income (AGI)</span>
              <input
                type="number"
                min={0}
                step={5000}
                value={agi}
                onChange={(e) => setAgi(Math.max(0, Number(e.target.value) || 0))}
                className="mt-1 w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white font-semibold"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="bg-gray-900/60 border border-violet-900/30 rounded-lg p-5">
        <h3 className="text-sm font-semibold text-violet-300 mb-4 uppercase tracking-wider">3. Your tax posture</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="block">
            <span className="text-xs text-gray-400">Marginal federal tax rate</span>
            <select
              value={marginalRate}
              onChange={(e) => setMarginalRate(Number(e.target.value))}
              className="mt-1 w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
            >
              <option value={0.10}>10% (low)</option>
              <option value={0.12}>12%</option>
              <option value={0.22}>22%</option>
              <option value={0.24}>24% (middle)</option>
              <option value={0.32}>32%</option>
              <option value={0.35}>35%</option>
              <option value={0.37}>37% (top)</option>
            </select>
          </label>
          <label className="flex items-center gap-2 mt-6">
            <input
              type="checkbox"
              checked={itemizes}
              onChange={(e) => setItemizes(e.target.checked)}
              className="w-4 h-4 accent-violet-500"
            />
            <span className="text-sm text-gray-300">I itemize deductions</span>
          </label>
          <div className="text-[11px] text-gray-500 mt-6 leading-snug">
            The charitable deduction only helps if you itemize on Schedule A. Standard deduction filers get no direct tax benefit.
          </div>
        </div>
      </div>

      {/* Verdict */}
      <div className={`rounded-lg p-6 border-2 ${result.arbitrage > 0 ? 'bg-violet-950/40 border-violet-500' : 'bg-gray-900/60 border-gray-700'}`}>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-xl font-black text-white">Your deduction</h2>
          <div className="text-right">
            <div className="text-4xl font-black text-violet-400">{fmt(result.deductionValue)}</div>
            <div className="text-xs text-gray-500">of {fmt(fmv)} FMV</div>
          </div>
        </div>
        <p className="text-sm text-gray-300 mb-4">{result.deductionRule}</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <Stat label="AGI cap" value={`${pct(result.agiCapPct)} = ${fmt(result.agiCap)}`} />
          <Stat label="Allowed this year" value={fmt(result.allowedThisYear)} highlight />
          <Stat label="Carryforward (5 yr)" value={fmt(result.carryforward)} />
          <Stat label="Est. tax savings" value={fmt(result.taxSavingsFromDeduction)} highlight />
        </div>
      </div>

      {/* Arbitrage panel */}
      <div className="bg-gray-900/60 border border-violet-900/30 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-1">Donate the card vs. sell then donate the cash</h3>
        <p className="text-xs text-gray-500 mb-4">
          Donating appreciated long-term property directly often beats selling first + donating the after-tax cash. Collectibles pay a 28% long-term federal capital-gains rate vs. 15-20% for stocks.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-violet-950/40 border border-violet-700/40 rounded p-4">
            <div className="text-xs text-violet-300 font-semibold uppercase tracking-wider mb-2">Path A \u2014 Donate the card</div>
            <Row label="Charity receives" value={fmt(fmv)} />
            <Row label="Your tax savings" value={fmt(result.taxSavingsFromDeduction)} />
            <Row label="Capital gains tax paid" value="$0" />
            <div className="border-t border-violet-800 mt-2 pt-2">
              <Row label="Combined impact" value={fmt(result.donationNetBenefit)} bold />
            </div>
          </div>
          <div className="bg-gray-800/40 border border-gray-700/40 rounded p-4">
            <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">Path B \u2014 Sell, then donate cash</div>
            <Row label="Sale proceeds" value={fmt(fmv)} />
            <Row label={`Cap-gains tax (${pct(result.sellTaxRate)})`} value={`\u2212 ${fmt(result.sellTaxOwed)}`} />
            <Row label="Cash after tax" value={fmt(result.afterTaxProceeds)} />
            <Row label="Cash-donation tax savings" value={fmt(result.cashTaxSavings)} />
            <div className="border-t border-gray-700 mt-2 pt-2">
              <Row label="Combined impact" value={fmt(result.altNetPath)} bold />
            </div>
          </div>
        </div>
        <div className={`mt-4 p-3 rounded text-sm ${result.arbitrage > 0 ? 'bg-violet-900/40 text-violet-200' : 'bg-amber-900/30 text-amber-200'}`}>
          {result.arbitrage > 0
            ? <>Direct donation wins by <strong>{fmt(result.arbitrage)}</strong>. Give the card; don\u2019t sell it first.</>
            : <>Selling first is not worse here. Check your basis \u2014 if the card isn\u2019t meaningfully appreciated, the arbitrage shrinks.</>}
        </div>
      </div>

      {/* Paperwork */}
      <div className="bg-gray-900/60 border border-violet-900/30 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-3">Paperwork checklist</h3>
        <ul className="space-y-2 text-sm">
          <CheckRow on={result.acknowledgementRequired}>
            <span>Written acknowledgement from the charity (required for any donation <strong>$250+</strong>, per IRC \u00a7170(f)(8))</span>
          </CheckRow>
          <CheckRow on={result.form8283Required}>
            <span>IRS Form 8283 <strong>Section A</strong> (non-cash contributions over <strong>$500</strong>)</span>
          </CheckRow>
          <CheckRow on={result.form8283SectionB}>
            <span>IRS Form 8283 <strong>Section B</strong> + donee signature (per item over <strong>$5,000</strong>)</span>
          </CheckRow>
          <CheckRow on={result.qualifiedAppraisalRequired}>
            <span>Qualified written appraisal from an IRS-qualified appraiser (per item over <strong>$5,000</strong>). Appraisal must be dated within 60 days before donation.</span>
          </CheckRow>
          <CheckRow on={true}>
            <span>Records of cost basis (purchase receipt, grading invoices, prior appraisals) kept for 3 years after the filing</span>
          </CheckRow>
          <CheckRow on={true}>
            <span>Photograph of the card pre-donation (slab serial visible) plus a copy of any provenance</span>
          </CheckRow>
          <CheckRow on={fmv >= 500000}>
            <span>Attach a <strong>copy of the appraisal</strong> to Form 8283 (required for donations over <strong>$500,000</strong>)</span>
          </CheckRow>
        </ul>
      </div>

      {/* Copy summary */}
      <div className="flex flex-wrap gap-3 text-sm">
        <button
          onClick={() => {
            const text = `CardVault Donation Deduction Summary\n\nCard FMV: ${fmt(fmv)}\nCost basis: ${fmt(basis)}\nHolding: ${holding === 'long' ? 'long-term' : 'short-term'}\nRecipient: ${ORG_META[orgType].label}\nUse: ${USE_META[useClass].label}\n\nDeduction value: ${fmt(result.deductionValue)}\nAGI cap: ${pct(result.agiCapPct)} = ${fmt(result.agiCap)}\nAllowed this year: ${fmt(result.allowedThisYear)}\nCarryforward (5-year): ${fmt(result.carryforward)}\nEstimated tax savings at ${pct(marginalRate)}: ${fmt(result.taxSavingsFromDeduction)}\n\nForm 8283 required: ${result.form8283Required ? 'Yes' : 'No'}${result.form8283SectionB ? ' (Section B)' : ''}\nQualified appraisal: ${result.qualifiedAppraisalRequired ? 'Required' : 'Not required'}\n\nThis summary is informational and not tax advice. See IRS Pub 561 + Pub 526.`;
            navigator.clipboard.writeText(text);
          }}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded font-medium"
        >
          Copy summary
        </button>
        <div className="text-[11px] text-gray-500 self-center max-w-xl">
          Not tax advice. The tool applies IRS Pub 526 / Pub 561 rules for tangible personal-property donations but does not substitute for a tax professional. High-value donations warrant a CPA review and a qualified appraiser.
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded px-3 py-2 ${highlight ? 'bg-violet-950/60 border border-violet-700/40' : 'bg-gray-800/40 border border-gray-700/40'}`}>
      <div className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</div>
      <div className={`text-base font-bold ${highlight ? 'text-violet-200' : 'text-white'}`}>{value}</div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-baseline justify-between py-1">
      <span className={`text-xs ${bold ? 'text-white font-semibold' : 'text-gray-400'}`}>{label}</span>
      <span className={`text-sm tabular-nums ${bold ? 'text-white font-bold' : 'text-gray-200'}`}>{value}</span>
    </div>
  );
}

function CheckRow({ on, children }: { on: boolean; children: React.ReactNode }) {
  return (
    <li className={`flex items-start gap-2 ${on ? 'text-gray-200' : 'text-gray-600'}`}>
      <span className={`mt-0.5 w-4 h-4 flex-shrink-0 rounded border ${on ? 'bg-violet-600 border-violet-400 text-white' : 'border-gray-700 text-gray-700'} text-[10px] flex items-center justify-center font-bold`}>
        {on ? '\u2713' : ''}
      </span>
      <div className="text-xs leading-relaxed">{children}</div>
    </li>
  );
}
