'use client';

import { useMemo, useState } from 'react';

type Result = {
  months: number | null;     // months until afford (null = never crosses)
  targetPrice: number | null;
  priceDeltaFromToday: number | null;
  totalSaved: number | null;
  treadmillMonths: number;   // months longer than naive plan
};

function simulate(
  grailToday: number,
  grailAppr: number,          // annual %
  currentSavings: number,
  monthlyContrib: number,
  savingsApy: number,         // annual %
  capMonths: number = 600,    // 50 years
  windfall: number = 0,
  windfallMonth: number = 0,
): Result {
  const grailM = Math.pow(1 + grailAppr / 100, 1 / 12);
  const savingsM = Math.pow(1 + savingsApy / 100, 1 / 12);
  let price = grailToday;
  let bal = currentSavings;
  for (let m = 1; m <= capMonths; m++) {
    bal = bal * savingsM + monthlyContrib;
    if (m === windfallMonth && windfall > 0) bal += windfall;
    price = price * grailM;
    if (bal >= price) {
      return {
        months: m,
        targetPrice: +price.toFixed(2),
        priceDeltaFromToday: +(price - grailToday).toFixed(2),
        totalSaved: +bal.toFixed(2),
        treadmillMonths: 0, // computed at caller
      };
    }
  }
  return { months: null, targetPrice: null, priceDeltaFromToday: null, totalSaved: null, treadmillMonths: 0 };
}

function monthsToYears(m: number | null) {
  if (m === null) return '—';
  const y = Math.floor(m / 12);
  const mo = m % 12;
  if (y === 0) return `${mo} mo`;
  if (mo === 0) return `${y}y`;
  return `${y}y ${mo}mo`;
}

function fmt$(n: number | null) {
  if (n === null || !isFinite(n)) return '—';
  return `$${Math.round(n).toLocaleString('en-US')}`;
}

export default function GrailTimelineClient() {
  const [grailToday, setGrailToday] = useState<string>('25000');
  const [grailAppr, setGrailAppr] = useState<string>('7');
  const [currentSavings, setCurrentSavings] = useState<string>('2000');
  const [monthlyContrib, setMonthlyContrib] = useState<string>('300');
  const [savingsApy, setSavingsApy] = useState<string>('4.5');
  const [acceleratorAmount, setAcceleratorAmount] = useState<string>('5000');

  const inputs = {
    grailToday: Math.max(0, parseFloat(grailToday) || 0),
    grailAppr: Math.max(-50, Math.min(50, parseFloat(grailAppr) || 0)),
    currentSavings: Math.max(0, parseFloat(currentSavings) || 0),
    monthlyContrib: Math.max(0, parseFloat(monthlyContrib) || 0),
    savingsApy: Math.max(0, Math.min(20, parseFloat(savingsApy) || 0)),
    accelerator: Math.max(0, parseFloat(acceleratorAmount) || 0),
  };

  const base = useMemo(
    () =>
      simulate(
        inputs.grailToday,
        inputs.grailAppr,
        inputs.currentSavings,
        inputs.monthlyContrib,
        inputs.savingsApy,
      ),
    [inputs.grailToday, inputs.grailAppr, inputs.currentSavings, inputs.monthlyContrib, inputs.savingsApy],
  );

  // Naive plan (ignores appreciation): months = (grailToday - currentSavings) / monthlyContrib
  const naiveMonths = useMemo(() => {
    const needed = inputs.grailToday - inputs.currentSavings;
    if (needed <= 0) return 0;
    if (inputs.monthlyContrib <= 0) return null;
    return Math.ceil(needed / inputs.monthlyContrib);
  }, [inputs.grailToday, inputs.currentSavings, inputs.monthlyContrib]);

  const treadmillMonths = base.months !== null && naiveMonths !== null ? base.months - naiveMonths : 0;

  const accelerated = useMemo(
    () =>
      simulate(
        inputs.grailToday,
        inputs.grailAppr,
        inputs.currentSavings + inputs.accelerator,
        inputs.monthlyContrib,
        inputs.savingsApy,
      ),
    [inputs.grailToday, inputs.grailAppr, inputs.currentSavings, inputs.monthlyContrib, inputs.savingsApy, inputs.accelerator],
  );

  const monthsSaved = base.months !== null && accelerated.months !== null ? base.months - accelerated.months : 0;

  const higherContrib = useMemo(
    () =>
      simulate(
        inputs.grailToday,
        inputs.grailAppr,
        inputs.currentSavings,
        inputs.monthlyContrib * 2,
        inputs.savingsApy,
      ),
    [inputs.grailToday, inputs.grailAppr, inputs.currentSavings, inputs.monthlyContrib, inputs.savingsApy],
  );

  const equityGrowth = useMemo(
    () =>
      simulate(
        inputs.grailToday,
        inputs.grailAppr,
        inputs.currentSavings,
        inputs.monthlyContrib,
        7,
      ),
    [inputs.grailToday, inputs.grailAppr, inputs.currentSavings, inputs.monthlyContrib],
  );

  // "Realistic grail" suggestion if base is unreachable
  const realisticGrail = useMemo(() => {
    if (base.months !== null) return null;
    // binary search largest grail affordable within 120 months
    let lo = 0, hi = inputs.grailToday;
    for (let i = 0; i < 30; i++) {
      const mid = (lo + hi) / 2;
      const r = simulate(mid, inputs.grailAppr, inputs.currentSavings, inputs.monthlyContrib, inputs.savingsApy, 120);
      if (r.months !== null) lo = mid;
      else hi = mid;
    }
    return Math.round(lo);
  }, [base.months, inputs.grailToday, inputs.grailAppr, inputs.currentSavings, inputs.monthlyContrib, inputs.savingsApy]);

  const verdict = useMemo(() => {
    if (base.months === null) return { label: 'UNREACHABLE', color: 'rose' as const, desc: `At $${inputs.monthlyContrib}/mo, your grail appreciates faster than you can save. Your savings line never crosses the grail line.` };
    const years = base.months / 12;
    if (years <= 2) return { label: 'CLOSE', color: 'emerald' as const, desc: `You afford the grail within ${monthsToYears(base.months)}. Stay the course.` };
    if (years <= 5) return { label: 'ON TRACK', color: 'teal' as const, desc: `Grail is ${monthsToYears(base.months)} out. Treadmill adds ${treadmillMonths} month${treadmillMonths === 1 ? '' : 's'} vs naive plan.` };
    if (years <= 10) return { label: 'LONG HORIZON', color: 'amber' as const, desc: `Grail is ${monthsToYears(base.months)} out. Consider acceleration scenarios below.` };
    return { label: 'VERY LONG', color: 'rose' as const, desc: `${monthsToYears(base.months)} until afford. Acceleration or higher savings rate strongly advised.` };
  }, [base.months, inputs.monthlyContrib, treadmillMonths]);

  const verdictClass = {
    emerald: 'bg-emerald-950/40 border-emerald-700/40 text-emerald-300',
    teal:    'bg-teal-950/40 border-teal-700/40 text-teal-300',
    amber:   'bg-amber-950/40 border-amber-700/40 text-amber-300',
    rose:    'bg-rose-950/40 border-rose-700/40 text-rose-300',
  }[verdict.color];

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-5 sm:p-6">
        <h2 className="text-white font-semibold mb-4">Your Grail Plan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-xs uppercase tracking-wide text-gray-500 font-medium">Grail price today (USD)</span>
            <input
              type="number" inputMode="decimal" min="0"
              value={grailToday}
              onChange={(e) => setGrailToday(e.target.value)}
              className="mt-1 w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-fuchsia-500"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wide text-gray-500 font-medium">Grail appreciation (%/year)</span>
            <input
              type="number" inputMode="decimal" step="0.5"
              value={grailAppr}
              onChange={(e) => setGrailAppr(e.target.value)}
              className="mt-1 w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-fuchsia-500"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wide text-gray-500 font-medium">Current savings (USD)</span>
            <input
              type="number" inputMode="decimal" min="0"
              value={currentSavings}
              onChange={(e) => setCurrentSavings(e.target.value)}
              className="mt-1 w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-fuchsia-500"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wide text-gray-500 font-medium">Monthly contribution (USD)</span>
            <input
              type="number" inputMode="decimal" min="0"
              value={monthlyContrib}
              onChange={(e) => setMonthlyContrib(e.target.value)}
              className="mt-1 w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-fuchsia-500"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wide text-gray-500 font-medium">Savings APY (%)</span>
            <input
              type="number" inputMode="decimal" step="0.5" min="0"
              value={savingsApy}
              onChange={(e) => setSavingsApy(e.target.value)}
              className="mt-1 w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-fuchsia-500"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wide text-gray-500 font-medium">Accelerator sale amount (USD, optional)</span>
            <input
              type="number" inputMode="decimal" min="0"
              value={acceleratorAmount}
              onChange={(e) => setAcceleratorAmount(e.target.value)}
              className="mt-1 w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-fuchsia-500"
            />
          </label>
        </div>
      </div>

      {/* Verdict */}
      <div className={`border rounded-xl p-5 ${verdictClass}`}>
        <div className="text-xs uppercase tracking-wide opacity-70 mb-1">Verdict</div>
        <div className="text-2xl font-black mb-1">{verdict.label}</div>
        <div className="text-sm opacity-90">{verdict.desc}</div>
      </div>

      {/* Base result */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-4">
          <div className="text-xs uppercase tracking-wide text-gray-500">Time to afford</div>
          <div className="text-2xl font-black text-white mt-1">{monthsToYears(base.months)}</div>
          <div className="text-xs text-gray-500 mt-1">naive: {monthsToYears(naiveMonths)}</div>
        </div>
        <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-4">
          <div className="text-xs uppercase tracking-wide text-gray-500">Grail price then</div>
          <div className="text-2xl font-black text-white mt-1">{fmt$(base.targetPrice)}</div>
          <div className="text-xs text-gray-500 mt-1">today: {fmt$(inputs.grailToday)}</div>
        </div>
        <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-4">
          <div className="text-xs uppercase tracking-wide text-gray-500">Treadmill cost</div>
          <div className="text-2xl font-black text-fuchsia-300 mt-1">{fmt$(base.priceDeltaFromToday)}</div>
          <div className="text-xs text-gray-500 mt-1">extra vs today</div>
        </div>
        <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-4">
          <div className="text-xs uppercase tracking-wide text-gray-500">Total saved</div>
          <div className="text-2xl font-black text-white mt-1">{fmt$(base.totalSaved)}</div>
          <div className="text-xs text-gray-500 mt-1">at arrival</div>
        </div>
      </div>

      {/* Scenarios */}
      <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-5 sm:p-6">
        <h3 className="text-white font-semibold mb-4">Acceleration Scenarios</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between gap-3 p-3 bg-gray-950/50 border border-gray-800 rounded-lg">
            <div>
              <div className="text-white font-medium">One-time accelerator sale of {fmt$(inputs.accelerator)}</div>
              <div className="text-xs text-gray-500">Sell adjacent cards; add lump sum today</div>
            </div>
            <div className="text-right">
              <div className="text-fuchsia-300 font-bold">{monthsToYears(accelerated.months)}</div>
              <div className="text-xs text-gray-500">
                {monthsSaved > 0 ? `− ${monthsSaved} mo` : accelerated.months === null ? 'still unreachable' : 'no change'}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 p-3 bg-gray-950/50 border border-gray-800 rounded-lg">
            <div>
              <div className="text-white font-medium">Double the monthly contribution (${(inputs.monthlyContrib * 2).toLocaleString()})</div>
              <div className="text-xs text-gray-500">Trim lifestyle; redirect to grail fund</div>
            </div>
            <div className="text-right">
              <div className="text-fuchsia-300 font-bold">{monthsToYears(higherContrib.months)}</div>
              <div className="text-xs text-gray-500">
                {base.months !== null && higherContrib.months !== null
                  ? `− ${base.months - higherContrib.months} mo`
                  : higherContrib.months === null ? 'still unreachable' : '—'}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 p-3 bg-gray-950/50 border border-gray-800 rounded-lg">
            <div>
              <div className="text-white font-medium">Shift savings to equity (7% growth)</div>
              <div className="text-xs text-gray-500">Balanced index portfolio instead of HYSA</div>
            </div>
            <div className="text-right">
              <div className="text-fuchsia-300 font-bold">{monthsToYears(equityGrowth.months)}</div>
              <div className="text-xs text-gray-500">
                {base.months !== null && equityGrowth.months !== null
                  ? equityGrowth.months === base.months ? 'no change' : `${equityGrowth.months < base.months ? '−' : '+'} ${Math.abs(base.months - equityGrowth.months)} mo`
                  : equityGrowth.months === null ? 'still unreachable' : '—'}
              </div>
            </div>
          </div>
          {realisticGrail !== null && realisticGrail > 0 && (
            <div className="flex items-center justify-between gap-3 p-3 bg-amber-950/20 border border-amber-800/40 rounded-lg">
              <div>
                <div className="text-amber-200 font-medium">Realistic grail at this savings rate</div>
                <div className="text-xs text-amber-400/70">Largest grail you can afford within 10 years</div>
              </div>
              <div className="text-right">
                <div className="text-amber-300 font-bold">{fmt$(realisticGrail)}</div>
                <div className="text-xs text-amber-400/70">vs asking {fmt$(inputs.grailToday)}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
