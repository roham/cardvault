'use client';

import { useState, useMemo } from 'react';

// ─── Tax Data ────────────────────────────────────────────────────────

// 2024 federal income tax brackets (single filer)
const FEDERAL_BRACKETS = [
  { min: 0, max: 11600, rate: 0.10 },
  { min: 11600, max: 47150, rate: 0.12 },
  { min: 47150, max: 100525, rate: 0.22 },
  { min: 100525, max: 191950, rate: 0.24 },
  { min: 191950, max: 243725, rate: 0.32 },
  { min: 243725, max: 609350, rate: 0.35 },
  { min: 609350, max: Infinity, rate: 0.37 },
];

// Collectibles long-term cap gains rate: 28% max (or ordinary rate if lower)
const COLLECTIBLES_LT_RATE = 0.28;

// State income tax rates (simplified — top marginal rate)
const STATE_RATES: Record<string, { name: string; rate: number }> = {
  'none': { name: 'No State Tax', rate: 0 },
  'AL': { name: 'Alabama', rate: 0.05 },
  'AK': { name: 'Alaska', rate: 0 },
  'AZ': { name: 'Arizona', rate: 0.025 },
  'AR': { name: 'Arkansas', rate: 0.044 },
  'CA': { name: 'California', rate: 0.133 },
  'CO': { name: 'Colorado', rate: 0.044 },
  'CT': { name: 'Connecticut', rate: 0.0699 },
  'DE': { name: 'Delaware', rate: 0.066 },
  'FL': { name: 'Florida', rate: 0 },
  'GA': { name: 'Georgia', rate: 0.055 },
  'HI': { name: 'Hawaii', rate: 0.11 },
  'ID': { name: 'Idaho', rate: 0.058 },
  'IL': { name: 'Illinois', rate: 0.0495 },
  'IN': { name: 'Indiana', rate: 0.031 },
  'IA': { name: 'Iowa', rate: 0.06 },
  'KS': { name: 'Kansas', rate: 0.057 },
  'KY': { name: 'Kentucky', rate: 0.04 },
  'LA': { name: 'Louisiana', rate: 0.0425 },
  'ME': { name: 'Maine', rate: 0.0715 },
  'MD': { name: 'Maryland', rate: 0.0575 },
  'MA': { name: 'Massachusetts', rate: 0.09 },
  'MI': { name: 'Michigan', rate: 0.0425 },
  'MN': { name: 'Minnesota', rate: 0.0985 },
  'MS': { name: 'Mississippi', rate: 0.05 },
  'MO': { name: 'Missouri', rate: 0.048 },
  'MT': { name: 'Montana', rate: 0.059 },
  'NE': { name: 'Nebraska', rate: 0.0584 },
  'NV': { name: 'Nevada', rate: 0 },
  'NH': { name: 'New Hampshire', rate: 0 },
  'NJ': { name: 'New Jersey', rate: 0.1075 },
  'NM': { name: 'New Mexico', rate: 0.059 },
  'NY': { name: 'New York', rate: 0.109 },
  'NC': { name: 'North Carolina', rate: 0.045 },
  'ND': { name: 'North Dakota', rate: 0.025 },
  'OH': { name: 'Ohio', rate: 0.0399 },
  'OK': { name: 'Oklahoma', rate: 0.0475 },
  'OR': { name: 'Oregon', rate: 0.099 },
  'PA': { name: 'Pennsylvania', rate: 0.0307 },
  'RI': { name: 'Rhode Island', rate: 0.0599 },
  'SC': { name: 'South Carolina', rate: 0.064 },
  'SD': { name: 'South Dakota', rate: 0 },
  'TN': { name: 'Tennessee', rate: 0 },
  'TX': { name: 'Texas', rate: 0 },
  'UT': { name: 'Utah', rate: 0.0465 },
  'VT': { name: 'Vermont', rate: 0.0875 },
  'VA': { name: 'Virginia', rate: 0.0575 },
  'WA': { name: 'Washington', rate: 0 },
  'WV': { name: 'West Virginia', rate: 0.055 },
  'WI': { name: 'Wisconsin', rate: 0.0765 },
  'WY': { name: 'Wyoming', rate: 0 },
  'DC': { name: 'Washington D.C.', rate: 0.105 },
};

type FilingStatus = 'single' | 'married';
type HoldingPeriod = 'short' | 'long';

function getFederalBracketRate(income: number): number {
  for (let i = FEDERAL_BRACKETS.length - 1; i >= 0; i--) {
    if (income >= FEDERAL_BRACKETS[i].min) return FEDERAL_BRACKETS[i].rate;
  }
  return 0.10;
}

function formatUSD(val: number): string {
  return val.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatPct(val: number): string {
  return (val * 100).toFixed(1) + '%';
}

// ─── Component ───────────────────────────────────────────────────────

export default function TaxCalculator() {
  const [buyPrice, setBuyPrice] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [expenses, setExpenses] = useState('');
  const [holdingPeriod, setHoldingPeriod] = useState<HoldingPeriod>('short');
  const [annualIncome, setAnnualIncome] = useState('75000');
  const [state, setState] = useState('none');
  const [filingStatus, setFilingStatus] = useState<FilingStatus>('single');

  const result = useMemo(() => {
    const buy = parseFloat(buyPrice) || 0;
    const sell = parseFloat(sellPrice) || 0;
    const exp = parseFloat(expenses) || 0;
    const income = parseFloat(annualIncome) || 0;

    if (buy <= 0 || sell <= 0) return null;

    const costBasis = buy + exp;
    const gain = sell - costBasis;
    const isLoss = gain < 0;

    // Federal tax rate
    let federalRate: number;
    if (isLoss) {
      federalRate = 0;
    } else if (holdingPeriod === 'short') {
      // Short-term = ordinary income rate
      federalRate = getFederalBracketRate(income + gain);
    } else {
      // Long-term collectibles = min(28%, ordinary rate)
      const ordinaryRate = getFederalBracketRate(income + gain);
      federalRate = Math.min(COLLECTIBLES_LT_RATE, ordinaryRate);
    }

    // State tax rate
    const stateRate = isLoss ? 0 : (STATE_RATES[state]?.rate || 0);

    // Calculations
    const federalTax = isLoss ? 0 : gain * federalRate;
    const stateTax = isLoss ? 0 : gain * stateRate;
    const totalTax = federalTax + stateTax;
    const netProfit = gain - totalTax;
    const effectiveRate = gain > 0 ? totalTax / gain : 0;
    const roi = costBasis > 0 ? (netProfit / costBasis) * 100 : 0;

    // Loss deduction info
    const lossDeduction = isLoss ? Math.min(Math.abs(gain), 3000) : 0;
    const lossTaxSaved = lossDeduction * getFederalBracketRate(income);

    return {
      buy, sell, costBasis, gain, isLoss,
      federalRate, stateRate, federalTax, stateTax, totalTax,
      netProfit, effectiveRate, roi,
      lossDeduction, lossTaxSaved,
    };
  }, [buyPrice, sellPrice, expenses, holdingPeriod, annualIncome, state, filingStatus]);

  return (
    <div>
      {/* Input Form */}
      <div className="grid sm:grid-cols-2 gap-6 mb-8">
        {/* Left: Transaction */}
        <div className="space-y-4">
          <h3 className="text-white font-semibold text-sm">Transaction Details</h3>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Purchase Price ($)</label>
            <input
              type="number"
              value={buyPrice}
              onChange={e => setBuyPrice(e.target.value)}
              placeholder="100"
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-green-600"
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Sale Price ($)</label>
            <input
              type="number"
              value={sellPrice}
              onChange={e => setSellPrice(e.target.value)}
              placeholder="250"
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-green-600"
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Other Expenses (fees, shipping, grading) ($)</label>
            <input
              type="number"
              value={expenses}
              onChange={e => setExpenses(e.target.value)}
              placeholder="25"
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-green-600"
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Holding Period</label>
            <div className="flex gap-2">
              <button
                onClick={() => setHoldingPeriod('short')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${holdingPeriod === 'short' ? 'bg-red-900/60 border-red-700 text-red-300 border' : 'bg-gray-800 border border-gray-700 text-gray-400 hover:bg-gray-700'}`}
              >
                &lt; 1 Year
              </button>
              <button
                onClick={() => setHoldingPeriod('long')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${holdingPeriod === 'long' ? 'bg-green-900/60 border-green-700 text-green-300 border' : 'bg-gray-800 border border-gray-700 text-gray-400 hover:bg-gray-700'}`}
              >
                1+ Years
              </button>
            </div>
          </div>
        </div>

        {/* Right: Tax Info */}
        <div className="space-y-4">
          <h3 className="text-white font-semibold text-sm">Tax Profile</h3>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Annual Income ($)</label>
            <input
              type="number"
              value={annualIncome}
              onChange={e => setAnnualIncome(e.target.value)}
              placeholder="75000"
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-green-600"
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Filing Status</label>
            <div className="flex gap-2">
              <button
                onClick={() => setFilingStatus('single')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${filingStatus === 'single' ? 'bg-blue-900/60 border-blue-700 text-blue-300 border' : 'bg-gray-800 border border-gray-700 text-gray-400 hover:bg-gray-700'}`}
              >
                Single
              </button>
              <button
                onClick={() => setFilingStatus('married')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${filingStatus === 'married' ? 'bg-blue-900/60 border-blue-700 text-blue-300 border' : 'bg-gray-800 border border-gray-700 text-gray-400 hover:bg-gray-700'}`}
              >
                Married Filing Jointly
              </button>
            </div>
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">State</label>
            <select
              value={state}
              onChange={e => setState(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-green-600"
            >
              {Object.entries(STATE_RATES).sort((a, b) => a[1].name.localeCompare(b[1].name)).map(([code, info]) => (
                <option key={code} value={code}>{info.name}{info.rate > 0 ? ` (${formatPct(info.rate)})` : ''}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className={`p-6 rounded-2xl border ${result.isLoss ? 'bg-red-950/30 border-red-800/40' : 'bg-green-950/30 border-green-800/40'}`}>
          {/* Top stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Capital Gain</div>
              <div className={`text-xl font-bold ${result.isLoss ? 'text-red-400' : 'text-green-400'}`}>
                {result.isLoss ? '-' : ''}{formatUSD(Math.abs(result.gain))}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Total Tax</div>
              <div className="text-xl font-bold text-amber-400">{formatUSD(result.totalTax)}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Net Profit</div>
              <div className={`text-xl font-bold ${result.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {result.netProfit < 0 ? '-' : ''}{formatUSD(Math.abs(result.netProfit))}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">After-Tax ROI</div>
              <div className={`text-xl font-bold ${result.roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {result.roi.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Breakdown */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-700/50">
              <span className="text-gray-400">Sale Price</span>
              <span className="text-white font-medium">{formatUSD(result.sell)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-700/50">
              <span className="text-gray-400">Cost Basis (purchase + expenses)</span>
              <span className="text-white font-medium">-{formatUSD(result.costBasis)}</span>
            </div>
            <div className={`flex justify-between py-2 border-b border-gray-700/50 ${result.isLoss ? 'text-red-400' : 'text-green-400'}`}>
              <span>Capital {result.isLoss ? 'Loss' : 'Gain'}</span>
              <span className="font-medium">{result.isLoss ? '-' : ''}{formatUSD(Math.abs(result.gain))}</span>
            </div>

            {!result.isLoss && (
              <>
                <div className="flex justify-between py-2 border-b border-gray-700/50">
                  <span className="text-gray-400">
                    Federal Tax ({holdingPeriod === 'short' ? 'Short-Term' : 'Collectibles LT'} @ {formatPct(result.federalRate)})
                  </span>
                  <span className="text-amber-400 font-medium">-{formatUSD(result.federalTax)}</span>
                </div>
                {result.stateRate > 0 && (
                  <div className="flex justify-between py-2 border-b border-gray-700/50">
                    <span className="text-gray-400">
                      State Tax ({STATE_RATES[state]?.name} @ {formatPct(result.stateRate)})
                    </span>
                    <span className="text-amber-400 font-medium">-{formatUSD(result.stateTax)}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b border-gray-700/50">
                  <span className="text-gray-400">Effective Tax Rate</span>
                  <span className="text-amber-400 font-medium">{formatPct(result.effectiveRate)}</span>
                </div>
              </>
            )}

            <div className={`flex justify-between py-2 text-base font-bold ${result.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              <span>Net Profit After Tax</span>
              <span>{result.netProfit < 0 ? '-' : ''}{formatUSD(Math.abs(result.netProfit))}</span>
            </div>
          </div>

          {/* Loss info */}
          {result.isLoss && result.lossDeduction > 0 && (
            <div className="mt-4 p-3 bg-blue-950/40 border border-blue-800/40 rounded-xl">
              <div className="text-blue-300 text-sm font-medium mb-1">Tax Loss Deduction</div>
              <p className="text-gray-400 text-xs">
                You can deduct {formatUSD(result.lossDeduction)} of this loss against ordinary income (max $3,000/year).
                At your tax bracket, this saves approximately <span className="text-blue-300 font-medium">{formatUSD(result.lossTaxSaved)}</span> in taxes.
              </p>
            </div>
          )}

          {/* Holding period comparison */}
          {!result.isLoss && (
            <div className="mt-4 p-3 bg-gray-800/40 border border-gray-700/50 rounded-xl">
              <div className="text-gray-300 text-sm font-medium mb-2">
                {holdingPeriod === 'short' ? 'What if you held 1+ year?' : 'What if you sold earlier?'}
              </div>
              <div className="text-xs text-gray-400">
                {holdingPeriod === 'short' ? (
                  <>
                    Long-term collectibles rate: <span className="text-green-400">{formatPct(Math.min(COLLECTIBLES_LT_RATE, getFederalBracketRate(parseFloat(annualIncome) || 0)))}</span> vs your short-term rate: <span className="text-red-400">{formatPct(result.federalRate)}</span>.
                    {' '}You would save <span className="text-green-400 font-medium">{formatUSD(result.gain * (result.federalRate - Math.min(COLLECTIBLES_LT_RATE, getFederalBracketRate(parseFloat(annualIncome) || 0))))}</span> in federal tax by holding longer.
                  </>
                ) : (
                  <>
                    Short-term rate at your bracket: <span className="text-red-400">{formatPct(getFederalBracketRate((parseFloat(annualIncome) || 0) + result.gain))}</span> vs your long-term rate: <span className="text-green-400">{formatPct(result.federalRate)}</span>.
                    {' '}You saved <span className="text-green-400 font-medium">{formatUSD(result.gain * (getFederalBracketRate((parseFloat(annualIncome) || 0) + result.gain) - result.federalRate))}</span> by holding 1+ year.
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!result && (
        <div className="p-8 bg-gray-900/40 border border-gray-800 rounded-2xl text-center">
          <div className="text-4xl mb-3">&#128176;</div>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Enter your purchase and sale prices to calculate capital gains tax on your card flip.
          </p>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-6 p-3 bg-gray-900/40 border border-gray-700/30 rounded-xl">
        <p className="text-gray-600 text-[10px] leading-relaxed">
          <strong>Disclaimer:</strong> This calculator provides estimates for educational purposes only. It uses simplified 2024 federal rates (single filer) and top marginal state rates.
          Actual tax liability depends on your complete financial situation. Consult a qualified tax professional for advice specific to your circumstances.
          CardVault is not a tax advisor.
        </p>
      </div>
    </div>
  );
}
