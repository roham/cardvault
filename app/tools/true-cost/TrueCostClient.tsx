'use client';

import { useState, useMemo } from 'react';

interface StorageTier {
  id: string;
  label: string;
  annualCost: number;
  note: string;
}
interface InsuranceTier {
  id: string;
  label: string;
  rate: number; // fraction of collection value per year
  note: string;
}
interface GradingTier {
  id: string;
  label: string;
  costPerCard: number;
  note: string;
}

const STORAGE_TIERS: StorageTier[] = [
  { id: 'box', label: 'Plastic box (free)', annualCost: 0, note: 'Stack of top loaders in a plastic bin. Zero cash cost but zero climate or theft protection.' },
  { id: 'shoebox', label: 'Shoebox + desiccants', annualCost: 40, note: 'Replacement desiccants, basic silica gel, small fireproof pouch.' },
  { id: 'binders', label: 'Top loaders + binders', annualCost: 120, note: 'Ongoing sleeves, top loaders, pages, binders for ~500 card collection.' },
  { id: 'case', label: 'Climate case', annualCost: 300, note: 'Dedicated display case with humidity control, ~20 sqft footprint.' },
  { id: 'vault-bank', label: 'Safe deposit box', annualCost: 250, note: 'Bank-rental deposit box — $200-300/yr typical at a community bank.' },
  { id: 'vault-pro', label: 'Pro vault service', annualCost: 1200, note: 'PWCC / Goldin / ALT / Dallas Gold & Silver Vault — typically 1-2% of value per year.' },
];

const INSURANCE_TIERS: InsuranceTier[] = [
  { id: 'none', label: 'Uninsured', rate: 0, note: 'Relying on homeowners default limits. Most policies cap collectibles at $500-2,500.' },
  { id: 'rider', label: 'Homeowners rider', rate: 0.008, note: 'Scheduled personal property rider — approximately 0.8% of appraised value per year.' },
  { id: 'standalone', label: 'Collectibles policy', rate: 0.014, note: 'Collectibles Insurance Services or American Collectors — approx 1.4% per year.' },
  { id: 'high-end', label: 'High-end / blanket', rate: 0.020, note: 'Chubb / AIG blanket with higher per-item limits — approx 2.0% per year.' },
];

const GRADING_TIERS: GradingTier[] = [
  { id: 'economy', label: 'Economy tier', costPerCard: 30, note: 'PSA Value / SGC standard — $25-35 all-in with shipping & insurance.' },
  { id: 'regular', label: 'Regular tier', costPerCard: 50, note: 'PSA Regular — $50-75 when factoring in shipping & insurance.' },
  { id: 'express', label: 'Express / Walkthrough', costPerCard: 150, note: 'Faster turn or higher declared value — $100-300 per card.' },
];

function currency(n: number): string {
  const round = Math.round(n);
  if (Math.abs(round) >= 1000) return `$${(round).toLocaleString()}`;
  return `$${round}`;
}

function formatPct(n: number, digits = 1): string {
  return `${n.toFixed(digits)}%`;
}

export default function TrueCostClient() {
  // Collection inputs
  const [collectionValue, setCollectionValue] = useState<number>(25000);
  const [cardCount, setCardCount] = useState<number>(500);
  const [slabCount, setSlabCount] = useState<number>(80);

  // Storage
  const [storageId, setStorageId] = useState<string>('binders');
  // Insurance
  const [insuranceId, setInsuranceId] = useState<string>('rider');
  // Grading
  const [resubRatePct, setResubRatePct] = useState<number>(8);
  const [gradingTierId, setGradingTierId] = useState<string>('regular');
  // Time
  const [hoursPerMonth, setHoursPerMonth] = useState<number>(4);
  const [hourlyRate, setHourlyRate] = useState<number>(50);
  // Opportunity cost
  const [benchmarkReturn, setBenchmarkReturn] = useState<number>(7);
  // Travel
  const [showsPerYear, setShowsPerYear] = useState<number>(3);
  const [perShowCost, setPerShowCost] = useState<number>(150);

  const storage = useMemo(() => STORAGE_TIERS.find(t => t.id === storageId)!, [storageId]);
  const insurance = useMemo(() => INSURANCE_TIERS.find(t => t.id === insuranceId)!, [insuranceId]);
  const grading = useMemo(() => GRADING_TIERS.find(t => t.id === gradingTierId)!, [gradingTierId]);

  const costs = useMemo(() => {
    const storageCost = storage.annualCost;
    const insuranceCost = collectionValue * insurance.rate;
    const resubCount = Math.round(slabCount * (resubRatePct / 100));
    const gradingCost = resubCount * grading.costPerCard;
    const timeCost = hoursPerMonth * 12 * hourlyRate;
    const opportunityCost = collectionValue * (benchmarkReturn / 100);
    const travelCost = showsPerYear * perShowCost;

    const cashCosts = storageCost + insuranceCost + gradingCost + travelCost;
    const softCosts = timeCost + opportunityCost;
    const total = cashCosts + softCosts;

    const pctOfValue = collectionValue > 0 ? (total / collectionValue) * 100 : 0;
    const cashPct = collectionValue > 0 ? (cashCosts / collectionValue) * 100 : 0;
    const breakevenAppreciation = pctOfValue; // % your collection must grow per year to net zero
    const perCardCost = cardCount > 0 ? total / cardCount : 0;

    return {
      storageCost,
      insuranceCost,
      gradingCost,
      timeCost,
      opportunityCost,
      travelCost,
      cashCosts,
      softCosts,
      total,
      pctOfValue,
      cashPct,
      breakevenAppreciation,
      perCardCost,
      resubCount,
    };
  }, [collectionValue, cardCount, slabCount, storage, insurance, grading, resubRatePct, hoursPerMonth, hourlyRate, benchmarkReturn, showsPerYear, perShowCost]);

  const verdict = useMemo(() => {
    const pct = costs.pctOfValue;
    if (pct < 6) return { label: 'LEAN', tone: 'emerald', msg: 'Efficient holding cost. You are running a tight hobby operation.' };
    if (pct < 12) return { label: 'COMFORTABLE', tone: 'amber', msg: 'Normal overhead for an engaged hobbyist. Cards must still appreciate to match market returns.' };
    if (pct < 20) return { label: 'HEAVY', tone: 'orange', msg: 'Your holding costs meaningfully drag returns. Consider trimming grading budget or time hours.' };
    return { label: 'EXCESSIVE', tone: 'rose', msg: 'You are paying more than 20% of collection value annually. Aggressive cost reduction needed or the portfolio cannot win.' };
  }, [costs.pctOfValue]);

  const opportunityGain = collectionValue * (benchmarkReturn / 100);
  const copySummary = () => {
    const text = `💰 My Card Collection True-Cost
Collection: ${currency(collectionValue)} · ${cardCount} cards (${slabCount} slabs)
Annual total: ${currency(costs.total)} (${formatPct(costs.pctOfValue)} of value)
Cash out: ${currency(costs.cashCosts)}/yr · Soft cost: ${currency(costs.softCosts)}/yr
Breakeven appreciation vs S&P ${benchmarkReturn}%: ${formatPct(costs.breakevenAppreciation)}/yr
Verdict: ${verdict.label} — ${verdict.msg}
#CardCollecting #HobbyMath`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => alert('Summary copied to clipboard'));
    }
  };

  return (
    <div className="space-y-4">
      {/* Collection basics */}
      <section className="bg-gray-900 border border-gray-800 rounded-2xl p-4 sm:p-5">
        <h2 className="text-sm font-bold text-white uppercase tracking-wide mb-3">Your Collection</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <NumberInput
            label="Collection value"
            prefix="$"
            value={collectionValue}
            onChange={setCollectionValue}
            step={1000}
            min={0}
          />
          <NumberInput
            label="Total cards"
            value={cardCount}
            onChange={setCardCount}
            step={50}
            min={0}
          />
          <NumberInput
            label="Slabbed cards"
            value={slabCount}
            onChange={setSlabCount}
            step={10}
            min={0}
            max={cardCount}
          />
        </div>
      </section>

      {/* Storage */}
      <CostSection
        title="Storage"
        emoji="📦"
        annualCost={costs.storageCost}
        tone="emerald"
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {STORAGE_TIERS.map(t => (
            <TierButton
              key={t.id}
              active={storageId === t.id}
              label={t.label}
              sub={`${currency(t.annualCost)}/yr`}
              onClick={() => setStorageId(t.id)}
              tone="emerald"
            />
          ))}
        </div>
        <p className="text-gray-500 text-xs mt-2">{storage.note}</p>
      </CostSection>

      {/* Insurance */}
      <CostSection
        title="Insurance"
        emoji="🛡️"
        annualCost={costs.insuranceCost}
        tone="sky"
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {INSURANCE_TIERS.map(t => (
            <TierButton
              key={t.id}
              active={insuranceId === t.id}
              label={t.label}
              sub={`${formatPct(t.rate * 100, 2)} of value`}
              onClick={() => setInsuranceId(t.id)}
              tone="sky"
            />
          ))}
        </div>
        <p className="text-gray-500 text-xs mt-2">{insurance.note}</p>
      </CostSection>

      {/* Grading / Resubmissions */}
      <CostSection
        title="Grading & Resubmissions"
        emoji="📝"
        annualCost={costs.gradingCost}
        tone="violet"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SliderInput
            label={`Resub rate: ${resubRatePct}%`}
            value={resubRatePct}
            onChange={setResubRatePct}
            min={0}
            max={30}
            step={1}
            tone="violet"
          />
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wide block mb-1">Service tier</label>
            <div className="grid grid-cols-3 gap-1.5">
              {GRADING_TIERS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setGradingTierId(t.id)}
                  className={`text-[11px] px-2 py-2 rounded border transition-colors ${
                    gradingTierId === t.id
                      ? 'bg-violet-950/70 border-violet-600 text-white'
                      : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  <div className="font-semibold">{t.label.split(' ')[0]}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">{currency(t.costPerCard)}/card</div>
                </button>
              ))}
            </div>
          </div>
        </div>
        <p className="text-gray-500 text-xs mt-2">
          Resubmitting {costs.resubCount} slab{costs.resubCount === 1 ? '' : 's'}/yr at {currency(grading.costPerCard)} each · {grading.note}
        </p>
      </CostSection>

      {/* Time */}
      <CostSection
        title="Your Time"
        emoji="⏱️"
        annualCost={costs.timeCost}
        tone="amber"
        sub="Soft cost"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SliderInput
            label={`Hours/month: ${hoursPerMonth}`}
            value={hoursPerMonth}
            onChange={setHoursPerMonth}
            min={0}
            max={40}
            step={1}
            tone="amber"
          />
          <NumberInput
            label="Your hourly rate"
            prefix="$"
            suffix="/hr"
            value={hourlyRate}
            onChange={setHourlyRate}
            step={5}
            min={0}
          />
        </div>
        <p className="text-gray-500 text-xs mt-2">
          Inspecting, photographing, listing, organizing, researching — {hoursPerMonth * 12} hrs/yr × {currency(hourlyRate)}/hr
        </p>
      </CostSection>

      {/* Opportunity cost */}
      <CostSection
        title="Opportunity Cost"
        emoji="📉"
        annualCost={costs.opportunityCost}
        tone="rose"
        sub="Soft cost"
      >
        <SliderInput
          label={`Benchmark return: ${benchmarkReturn}%`}
          value={benchmarkReturn}
          onChange={setBenchmarkReturn}
          min={0}
          max={15}
          step={0.5}
          tone="rose"
        />
        <p className="text-gray-500 text-xs mt-2">
          If the {currency(collectionValue)} locked in cards were in an S&P 500 index fund instead, you would earn roughly {currency(opportunityGain)}/yr at {benchmarkReturn}%.
          This is the hurdle rate your cards must beat.
        </p>
      </CostSection>

      {/* Travel */}
      <CostSection
        title="Show Travel & Entry"
        emoji="🎪"
        annualCost={costs.travelCost}
        tone="cyan"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SliderInput
            label={`Shows/year: ${showsPerYear}`}
            value={showsPerYear}
            onChange={setShowsPerYear}
            min={0}
            max={20}
            step={1}
            tone="cyan"
          />
          <NumberInput
            label="Avg cost per show"
            prefix="$"
            value={perShowCost}
            onChange={setPerShowCost}
            step={25}
            min={0}
          />
        </div>
        <p className="text-gray-500 text-xs mt-2">
          Entry, parking, fuel, meals — {showsPerYear} shows × {currency(perShowCost)}
        </p>
      </CostSection>

      {/* Summary */}
      <section className={`rounded-2xl p-5 sm:p-6 border-2 ${
        verdict.tone === 'emerald' ? 'border-emerald-700/60 bg-gradient-to-br from-emerald-950/40 to-gray-900' :
        verdict.tone === 'amber' ? 'border-amber-700/60 bg-gradient-to-br from-amber-950/40 to-gray-900' :
        verdict.tone === 'orange' ? 'border-orange-700/60 bg-gradient-to-br from-orange-950/40 to-gray-900' :
        'border-rose-700/60 bg-gradient-to-br from-rose-950/40 to-gray-900'
      }`}>
        <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Annual True-Cost</div>
            <div className="text-4xl sm:text-5xl font-bold text-white tabular-nums">{currency(costs.total)}</div>
            <div className="text-sm text-gray-400 mt-1">
              {formatPct(costs.pctOfValue)} of collection value · {currency(costs.perCardCost)}/card
            </div>
          </div>
          <div className={`px-3 py-1.5 rounded-full text-sm font-bold ${
            verdict.tone === 'emerald' ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' :
            verdict.tone === 'amber' ? 'bg-amber-950 text-amber-300 border border-amber-700' :
            verdict.tone === 'orange' ? 'bg-orange-950 text-orange-300 border border-orange-700' :
            'bg-rose-950 text-rose-300 border border-rose-700'
          }`}>
            {verdict.label}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          <SummaryStat label="Cash out" value={currency(costs.cashCosts)} sub={`${formatPct(costs.cashPct)} of value`} />
          <SummaryStat label="Soft cost" value={currency(costs.softCosts)} sub="time + opportunity" />
          <SummaryStat label="Breakeven appreciation" value={formatPct(costs.breakevenAppreciation)} sub="to net zero vs benchmark" />
        </div>

        <div className="bg-black/40 border border-gray-800 rounded-xl p-3 mb-3">
          <div className="text-xs text-gray-400 mb-1">Verdict</div>
          <p className="text-sm text-white">{verdict.msg}</p>
        </div>

        <div className="bg-black/40 border border-gray-800 rounded-xl p-3 mb-3">
          <div className="text-xs text-gray-400 mb-2">Cost breakdown</div>
          <div className="space-y-1.5">
            {[
              { label: '📦 Storage', v: costs.storageCost, color: 'bg-emerald-500' },
              { label: '🛡️ Insurance', v: costs.insuranceCost, color: 'bg-sky-500' },
              { label: '📝 Grading', v: costs.gradingCost, color: 'bg-violet-500' },
              { label: '⏱️ Time', v: costs.timeCost, color: 'bg-amber-500' },
              { label: '📉 Opportunity', v: costs.opportunityCost, color: 'bg-rose-500' },
              { label: '🎪 Travel', v: costs.travelCost, color: 'bg-cyan-500' },
            ].map(row => {
              const pct = costs.total > 0 ? (row.v / costs.total) * 100 : 0;
              return (
                <div key={row.label} className="flex items-center gap-2 text-xs">
                  <div className="w-20 sm:w-24 text-gray-400">{row.label}</div>
                  <div className="flex-1 bg-gray-800 rounded h-2 overflow-hidden">
                    <div className={`h-full ${row.color}`} style={{ width: `${Math.min(100, pct)}%` }} />
                  </div>
                  <div className="w-16 text-right text-white tabular-nums">{currency(row.v)}</div>
                  <div className="w-10 text-right text-gray-500 tabular-nums">{formatPct(pct, 0)}</div>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={copySummary}
          className="w-full py-2.5 rounded-xl text-sm font-semibold bg-gray-900 border border-gray-700 hover:border-gray-600 text-white transition-colors"
        >
          📋 Copy summary
        </button>
      </section>

      {/* Cost-reduction tips */}
      <section className="bg-gray-900 border border-gray-800 rounded-2xl p-4 sm:p-5">
        <h2 className="text-sm font-bold text-white uppercase tracking-wide mb-3">Cost Reduction Tips</h2>
        <ul className="space-y-2 text-sm text-gray-300">
          <li className="flex gap-2"><span className="text-emerald-400">▸</span> Storage: bundle acquisitions to cut shipping; buy top loaders and penny sleeves in bulk once a year instead of per-pack.</li>
          <li className="flex gap-2"><span className="text-sky-400">▸</span> Insurance: a collectibles-specific policy typically costs 0.8-1.5% of value but lifts per-item limits from homeowners\' $500 default to $50,000+ — worth it for anything over $10K.</li>
          <li className="flex gap-2"><span className="text-violet-400">▸</span> Grading: only resubmit PSA 9s with centering/corners that are clearly PSA 10 candidates. A 3-5% resub rate on selected candidates beats blanket 15% resubs.</li>
          <li className="flex gap-2"><span className="text-amber-400">▸</span> Time: batch listings weekly rather than daily. One 3-hour session beats seven 30-min sessions due to context-switch cost.</li>
          <li className="flex gap-2"><span className="text-rose-400">▸</span> Opportunity: the silent killer. Stocks yield ~7% real. A flat 5-year collection lost 35% to opportunity cost — verify appreciation per card annually.</li>
          <li className="flex gap-2"><span className="text-cyan-400">▸</span> Travel: co-load with a buddy for large shows. National show entry + hotel + meals can be split 2-3 ways without losing any of the experience.</li>
        </ul>
      </section>
    </div>
  );
}

function NumberInput({
  label, value, onChange, step = 1, min, max, prefix, suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <div>
      <label className="text-xs text-gray-400 uppercase tracking-wide block mb-1">{label}</label>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">{prefix}</span>}
        <input
          type="number"
          value={value}
          step={step}
          min={min}
          max={max}
          onChange={e => {
            const v = parseFloat(e.target.value);
            if (!isNaN(v)) onChange(v);
            else if (e.target.value === '') onChange(0);
          }}
          className={`w-full bg-gray-950 border border-gray-800 text-white rounded-lg py-2 text-sm tabular-nums focus:border-gray-600 focus:outline-none ${prefix ? 'pl-7' : 'pl-3'} ${suffix ? 'pr-10' : 'pr-3'}`}
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">{suffix}</span>}
      </div>
    </div>
  );
}

function SliderInput({
  label, value, onChange, min, max, step = 1, tone,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  tone: 'emerald' | 'sky' | 'violet' | 'amber' | 'rose' | 'cyan';
}) {
  const accent = {
    emerald: 'accent-emerald-500',
    sky: 'accent-sky-500',
    violet: 'accent-violet-500',
    amber: 'accent-amber-500',
    rose: 'accent-rose-500',
    cyan: 'accent-cyan-500',
  }[tone];
  return (
    <div>
      <label className="text-xs text-gray-400 uppercase tracking-wide block mb-1">{label}</label>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={e => onChange(parseFloat(e.target.value))}
        className={`w-full ${accent}`}
      />
    </div>
  );
}

function TierButton({
  active, label, sub, onClick, tone,
}: {
  active: boolean;
  label: string;
  sub: string;
  onClick: () => void;
  tone: 'emerald' | 'sky' | 'violet' | 'amber' | 'rose' | 'cyan';
}) {
  const activeClass = {
    emerald: 'bg-emerald-950/70 border-emerald-600 text-white',
    sky: 'bg-sky-950/70 border-sky-600 text-white',
    violet: 'bg-violet-950/70 border-violet-600 text-white',
    amber: 'bg-amber-950/70 border-amber-600 text-white',
    rose: 'bg-rose-950/70 border-rose-600 text-white',
    cyan: 'bg-cyan-950/70 border-cyan-600 text-white',
  }[tone];
  return (
    <button
      onClick={onClick}
      className={`text-left px-2.5 py-2 rounded border transition-colors ${
        active ? activeClass : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700'
      }`}
    >
      <div className="text-xs font-semibold leading-tight">{label}</div>
      <div className="text-[10px] text-gray-500 mt-0.5">{sub}</div>
    </button>
  );
}

function CostSection({
  title, emoji, annualCost, tone, sub, children,
}: {
  title: string;
  emoji: string;
  annualCost: number;
  tone: 'emerald' | 'sky' | 'violet' | 'amber' | 'rose' | 'cyan';
  sub?: string;
  children: React.ReactNode;
}) {
  const tint = {
    emerald: 'text-emerald-400',
    sky: 'text-sky-400',
    violet: 'text-violet-400',
    amber: 'text-amber-400',
    rose: 'text-rose-400',
    cyan: 'text-cyan-400',
  }[tone];
  return (
    <section className="bg-gray-900 border border-gray-800 rounded-2xl p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2">
            <span>{emoji}</span>
            {title}
            {sub && <span className="text-[10px] text-gray-500 font-normal normal-case tracking-normal">({sub})</span>}
          </h2>
        </div>
        <div className={`text-xl font-bold tabular-nums ${tint}`}>{currency(annualCost)}/yr</div>
      </div>
      {children}
    </section>
  );
}

function SummaryStat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-black/40 border border-gray-800 rounded-xl p-3 text-center">
      <div className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</div>
      <div className="text-lg sm:text-xl font-bold text-white tabular-nums">{value}</div>
      <div className="text-[10px] text-gray-500">{sub}</div>
    </div>
  );
}
