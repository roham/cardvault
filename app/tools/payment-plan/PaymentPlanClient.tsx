'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';

/* ── types ─────────────────────────────────────────────── */

interface PlanOption {
  name: string;
  platform: string;
  months: number;
  apr: number; // annual percentage rate
  fee: number; // flat fee %
  minPurchase: number;
  maxPurchase: number;
  color: string;
  bgColor: string;
}

/* ── data ──────────────────────────────────────────────── */

const PLAN_OPTIONS: PlanOption[] = [
  { name: 'eBay 4-Month', platform: 'eBay', months: 4, apr: 0, fee: 0, minPurchase: 99, maxPurchase: 10000, color: 'text-blue-400', bgColor: 'bg-blue-950/30 border-blue-800/40' },
  { name: 'eBay 6-Month', platform: 'eBay', months: 6, apr: 0, fee: 0, minPurchase: 99, maxPurchase: 10000, color: 'text-blue-400', bgColor: 'bg-blue-950/30 border-blue-800/40' },
  { name: 'eBay 12-Month', platform: 'eBay', months: 12, apr: 9.99, fee: 0, minPurchase: 499, maxPurchase: 10000, color: 'text-blue-400', bgColor: 'bg-blue-950/30 border-blue-800/40' },
  { name: 'eBay 24-Month', platform: 'eBay', months: 24, apr: 9.99, fee: 0, minPurchase: 999, maxPurchase: 10000, color: 'text-blue-400', bgColor: 'bg-blue-950/30 border-blue-800/40' },
  { name: 'PWCC Vault Layaway 3-Mo', platform: 'PWCC', months: 3, apr: 0, fee: 5, minPurchase: 500, maxPurchase: 100000, color: 'text-amber-400', bgColor: 'bg-amber-950/30 border-amber-800/40' },
  { name: 'PWCC Vault Layaway 6-Mo', platform: 'PWCC', months: 6, apr: 0, fee: 8, minPurchase: 1000, maxPurchase: 100000, color: 'text-amber-400', bgColor: 'bg-amber-950/30 border-amber-800/40' },
  { name: 'Afterpay (4 Payments)', platform: 'Afterpay', months: 1, apr: 0, fee: 0, minPurchase: 1, maxPurchase: 2000, color: 'text-emerald-400', bgColor: 'bg-emerald-950/30 border-emerald-800/40' },
  { name: 'Klarna (4 Payments)', platform: 'Klarna', months: 1, apr: 0, fee: 0, minPurchase: 1, maxPurchase: 5000, color: 'text-pink-400', bgColor: 'bg-pink-950/30 border-pink-800/40' },
  { name: 'Credit Card (Avg 22% APR)', platform: 'Credit Card', months: 12, apr: 22, fee: 0, minPurchase: 1, maxPurchase: 100000, color: 'text-red-400', bgColor: 'bg-red-950/30 border-red-800/40' },
  { name: 'Save & Buy Cash', platform: 'Cash', months: 0, apr: 0, fee: 0, minPurchase: 0, maxPurchase: 999999, color: 'text-green-400', bgColor: 'bg-green-950/30 border-green-800/40' },
];

/* ── helpers ───────────────────────────────────────────── */

function formatCurrency(n: number): string {
  return n < 0 ? `-$${Math.abs(n).toFixed(2)}` : `$${n.toFixed(2)}`;
}

function calculateMonthlyPayment(principal: number, apr: number, months: number): number {
  if (apr === 0 || months === 0) return principal / Math.max(months, 1);
  const monthlyRate = apr / 100 / 12;
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
}

/* ── component ─────────────────────────────────────────── */

export default function PaymentPlanClient() {
  const [cardValue, setCardValue] = useState<string>('');
  const [expectedAppreciation, setExpectedAppreciation] = useState<number>(5);
  const [showResults, setShowResults] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);

  const price = parseFloat(cardValue) || 0;

  const analysis = useMemo(() => {
    if (price <= 0) return null;

    const plans = PLAN_OPTIONS
      .filter(p => price >= p.minPurchase && price <= p.maxPurchase)
      .map(plan => {
        const flatFee = price * (plan.fee / 100);
        const totalWithFee = price + flatFee;

        if (plan.platform === 'Cash') {
          return {
            ...plan,
            monthly: 0,
            totalCost: price,
            totalInterest: 0,
            flatFee: 0,
            totalExtra: 0,
            extraPercent: 0,
            appreciationOffset: 0,
            netCost: price,
            verdict: 'BEST PRICE' as const,
          };
        }

        if (plan.platform === 'Afterpay' || plan.platform === 'Klarna') {
          const monthly = price / 4;
          return {
            ...plan,
            monthly,
            totalCost: price,
            totalInterest: 0,
            flatFee: 0,
            totalExtra: 0,
            extraPercent: 0,
            appreciationOffset: 0,
            netCost: price,
            verdict: 'NO EXTRA COST' as const,
          };
        }

        const monthly = calculateMonthlyPayment(totalWithFee, plan.apr, plan.months);
        const totalPaid = monthly * plan.months;
        const totalInterest = totalPaid - totalWithFee;
        const totalExtra = totalInterest + flatFee;
        const extraPercent = (totalExtra / price) * 100;

        // Does appreciation cover financing cost?
        const monthlyAppreciation = expectedAppreciation / 100 / 12;
        const futureValue = price * Math.pow(1 + monthlyAppreciation, plan.months);
        const appreciationGain = futureValue - price;
        const netCost = price + totalExtra - appreciationGain;

        let verdict: 'GOOD DEAL' | 'FAIR' | 'EXPENSIVE' | 'AVOID' | 'BEST PRICE' | 'NO EXTRA COST';
        if (totalExtra === 0) verdict = 'NO EXTRA COST';
        else if (appreciationGain > totalExtra) verdict = 'GOOD DEAL';
        else if (extraPercent < 5) verdict = 'FAIR';
        else if (extraPercent < 15) verdict = 'EXPENSIVE';
        else verdict = 'AVOID';

        return {
          ...plan,
          monthly,
          totalCost: totalPaid,
          totalInterest,
          flatFee,
          totalExtra,
          extraPercent,
          appreciationOffset: appreciationGain,
          netCost,
          verdict,
        };
      });

    // Sort by total extra cost
    plans.sort((a, b) => a.totalExtra - b.totalExtra);

    // Monthly savings plan
    const savingsMonths = [3, 6, 9, 12];
    const savingsPlans = savingsMonths.map(m => ({
      months: m,
      monthly: price / m,
    }));

    return { plans, savingsPlans, price };
  }, [price, expectedAppreciation]);

  const verdictColor: Record<string, string> = {
    'BEST PRICE': 'text-green-400 bg-green-950/40 border-green-800/50',
    'NO EXTRA COST': 'text-emerald-400 bg-emerald-950/40 border-emerald-800/50',
    'GOOD DEAL': 'text-blue-400 bg-blue-950/40 border-blue-800/50',
    'FAIR': 'text-amber-400 bg-amber-950/40 border-amber-800/50',
    'EXPENSIVE': 'text-orange-400 bg-orange-950/40 border-orange-800/50',
    'AVOID': 'text-red-400 bg-red-950/40 border-red-800/50',
  };

  const copyResults = useCallback(() => {
    if (!analysis) return;
    const lines = [
      `Card Payment Plan Analysis`,
      `Card Price: ${formatCurrency(analysis.price)}`,
      `Expected Annual Appreciation: ${expectedAppreciation}%`,
      '',
      ...analysis.plans.map(p =>
        `${p.name}: ${p.monthly > 0 ? `${formatCurrency(p.monthly)}/mo` : 'Cash'} | Total: ${formatCurrency(p.totalCost)} | Extra: ${formatCurrency(p.totalExtra)} (${p.extraPercent.toFixed(1)}%) | ${p.verdict}`
      ),
      '',
      'Generated by CardVault Payment Plan Calculator — cardvault-two.vercel.app/tools/payment-plan',
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [analysis, expectedAppreciation]);

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <section className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-1">Card Purchase Details</h2>
        <p className="text-gray-400 text-sm mb-4">Enter the card price and your expected appreciation rate.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-gray-400 text-xs font-medium mb-1 block">Card Price ($)</label>
            <input
              type="number"
              value={cardValue}
              onChange={e => setCardValue(e.target.value)}
              placeholder="e.g. 2500"
              min="0"
              step="1"
              className="w-full bg-gray-800/80 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs font-medium mb-1 block">
              Expected Annual Appreciation: <span className="text-white">{expectedAppreciation}%</span>
            </label>
            <input
              type="range"
              min="-20"
              max="30"
              value={expectedAppreciation}
              onChange={e => setExpectedAppreciation(parseInt(e.target.value))}
              className="w-full mt-2 accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>-20% (Declining)</span>
              <span>0%</span>
              <span>+30% (Hot)</span>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-4">
          <button
            onClick={() => setShowResults(true)}
            disabled={price <= 0}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 text-white font-bold rounded-xl text-lg transition-all shadow-lg shadow-blue-900/30"
          >
            Calculate Payment Plans
          </button>
        </div>
      </section>

      {/* Results */}
      {showResults && analysis && (
        <>
          {/* Summary */}
          <section className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Payment Options for {formatCurrency(price)}</h2>
              <button onClick={copyResults} className="text-sm text-blue-400 hover:text-blue-300 font-medium">
                {copied ? 'Copied!' : 'Copy Results'}
              </button>
            </div>

            <div className="space-y-3">
              {analysis.plans.map(plan => (
                <div
                  key={plan.name}
                  className={`border rounded-xl overflow-hidden transition-all ${plan.bgColor}`}
                >
                  <button
                    onClick={() => setExpandedPlan(expandedPlan === plan.name ? null : plan.name)}
                    className="w-full text-left p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-bold ${plan.color}`}>{plan.platform}</span>
                        <span className="text-white font-medium text-sm">{plan.name}</span>
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded border ${verdictColor[plan.verdict]}`}>
                        {plan.verdict}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-gray-500 block">Monthly</span>
                        <span className="text-white font-bold">
                          {plan.monthly > 0 ? `${formatCurrency(plan.monthly)}/mo` : 'One-time'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Total Paid</span>
                        <span className="text-white font-bold">{formatCurrency(plan.totalCost)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Extra Cost</span>
                        <span className={plan.totalExtra > 0 ? 'text-red-400 font-bold' : 'text-green-400 font-bold'}>
                          {plan.totalExtra > 0 ? `+${formatCurrency(plan.totalExtra)}` : '$0.00'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Extra %</span>
                        <span className={plan.extraPercent > 0 ? 'text-red-400 font-bold' : 'text-green-400 font-bold'}>
                          {plan.extraPercent > 0 ? `+${plan.extraPercent.toFixed(1)}%` : '0%'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                      <span>{expandedPlan === plan.name ? '▲' : '▼'}</span>
                      <span>Click for details</span>
                    </div>
                  </button>

                  {expandedPlan === plan.name && (
                    <div className="px-4 pb-4 border-t border-gray-700/30 pt-3 space-y-2 text-xs">
                      {plan.platform !== 'Cash' && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Card price</span>
                            <span className="text-white">{formatCurrency(price)}</span>
                          </div>
                          {plan.flatFee > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-400">Platform fee ({plan.fee}%)</span>
                              <span className="text-amber-400">+{formatCurrency(plan.flatFee)}</span>
                            </div>
                          )}
                          {plan.totalInterest > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-400">Interest ({plan.apr}% APR × {plan.months} months)</span>
                              <span className="text-red-400">+{formatCurrency(plan.totalInterest)}</span>
                            </div>
                          )}
                          <div className="flex justify-between border-t border-gray-700/30 pt-2">
                            <span className="text-gray-300 font-medium">Total you pay</span>
                            <span className="text-white font-bold">{formatCurrency(plan.totalCost)}</span>
                          </div>
                          {plan.months > 1 && (
                            <div className="flex justify-between">
                              <span className="text-gray-400">Card value after {plan.months} months ({expectedAppreciation > 0 ? '+' : ''}{expectedAppreciation}%/yr)</span>
                              <span className={plan.appreciationOffset >= 0 ? 'text-green-400' : 'text-red-400'}>
                                {formatCurrency(price + plan.appreciationOffset)}
                              </span>
                            </div>
                          )}
                          {plan.months > 1 && (
                            <div className="flex justify-between">
                              <span className="text-gray-400">Appreciation vs financing cost</span>
                              <span className={plan.appreciationOffset >= plan.totalExtra ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                                {plan.appreciationOffset >= plan.totalExtra
                                  ? `Card gains cover financing (+${formatCurrency(plan.appreciationOffset - plan.totalExtra)})`
                                  : `Financing costs more than gains (-${formatCurrency(plan.totalExtra - plan.appreciationOffset)})`
                                }
                              </span>
                            </div>
                          )}
                        </>
                      )}
                      {plan.platform === 'Cash' && (
                        <div className="text-gray-400">
                          Paying cash means no interest, no fees, and the lowest total cost. The tradeoff: you need the full amount upfront, and you might miss a buying window while saving.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Savings Plan */}
          <section className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-1">Save-Up Alternative</h2>
            <p className="text-gray-400 text-sm mb-4">
              How much do you need to save per month to buy with cash instead?
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {analysis.savingsPlans.map(sp => (
                <div key={sp.months} className="bg-green-950/20 border border-green-800/30 rounded-xl p-3 text-center">
                  <div className="text-green-400 text-lg font-bold">{formatCurrency(sp.monthly)}</div>
                  <div className="text-gray-400 text-xs">per month for {sp.months} months</div>
                  <div className="text-green-500 text-xs mt-1 font-medium">$0 in fees</div>
                </div>
              ))}
            </div>
          </section>

          {/* Key Insight */}
          <section className="bg-amber-950/20 border border-amber-800/30 rounded-2xl p-6">
            <h2 className="text-amber-400 font-bold text-sm mb-2">Key Insight</h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              {price >= 1000 ? (
                <>For a {formatCurrency(price)} card, even a 5% financing cost means an extra {formatCurrency(price * 0.05)} — that could buy another card for your collection. Payment plans make sense when: (1) the card is likely to appreciate faster than the financing cost, (2) you cannot find the card again later, or (3) the seller offers 0% financing. Otherwise, saving up and buying with cash is almost always the better financial move.</>
              ) : price >= 100 ? (
                <>For a {formatCurrency(price)} card, financing costs are relatively small in absolute dollars but can add up over multiple purchases. Consider using Afterpay or Klarna for 0% interest split payments, or simply save for 1-2 months. Avoid credit card financing for hobby purchases — the 20%+ APR turns a good deal into a bad one fast.</>
              ) : (
                <>Cards under $100 should almost never be financed. The interest and fees on a small purchase often exceed 10-20% of the card value. Save up, buy with cash, and put the money you would have spent on interest toward another card.</>
              )}
            </p>
          </section>
        </>
      )}

      {/* How It Works */}
      <section className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { step: '1', title: 'Enter Card Price', desc: 'Type the purchase price of the card you want to buy.', color: 'bg-blue-500' },
            { step: '2', title: 'Set Appreciation', desc: 'Estimate how much the card will gain (or lose) per year.', color: 'bg-emerald-500' },
            { step: '3', title: 'Compare Plans', desc: 'See monthly payments, total cost, extra fees, and verdicts for each option.', color: 'bg-purple-500' },
          ].map(s => (
            <div key={s.step} className="flex gap-3">
              <div className={`w-8 h-8 ${s.color} rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                {s.step}
              </div>
              <div>
                <div className="text-white font-medium text-sm">{s.title}</div>
                <div className="text-gray-400 text-xs mt-0.5">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Platform Guide */}
      <section className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Payment Platform Guide</h2>
        <div className="space-y-3">
          {[
            { name: 'eBay Pay Later', desc: '0% for 4-6 months on $99+, 9.99% APR for 12-24 months on $499+. Requires eBay account with good standing. Most card purchases happen on eBay, making this the most accessible option.', color: 'border-blue-800/40' },
            { name: 'PWCC Vault', desc: 'Layaway plans with flat fees (5-8%) instead of interest. Available for $500+ purchases. Cards are held in PWCC\'s vault during the payment period. Best for high-value auction purchases.', color: 'border-amber-800/40' },
            { name: 'Afterpay / Klarna', desc: '4 equal payments over 6 weeks, 0% interest. Available at select card shops and online retailers. Best for purchases under $2,000. No credit check for small amounts.', color: 'border-emerald-800/40' },
            { name: 'Credit Card', desc: 'The most expensive option at 20-25% APR. Only use if you can pay off within the 0% introductory period (usually 12-18 months on new cards). Never carry a balance on card hobby purchases.', color: 'border-red-800/40' },
          ].map(p => (
            <div key={p.name} className={`border rounded-xl p-4 ${p.color} bg-gray-800/20`}>
              <div className="text-white font-medium text-sm mb-1">{p.name}</div>
              <div className="text-gray-400 text-xs leading-relaxed">{p.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Related Tools */}
      <section>
        <h2 className="text-lg font-bold text-white mb-4">Related Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { href: '/tools/investment-return', title: 'Investment Return Calculator', desc: 'Compare card ROI vs stocks and bonds' },
            { href: '/tools/dca-calculator', title: 'DCA Calculator', desc: 'Dollar-cost average into expensive cards' },
            { href: '/tools/ebay-fee-calc', title: 'eBay Fee Calculator', desc: 'See what sellers actually net after fees' },
            { href: '/tools/budget-planner', title: 'Hobby Budget Planner', desc: 'Plan your monthly card spending' },
            { href: '/tools/flip-calc', title: 'Flip Profit Calculator', desc: 'Calculate profit margins on card flips' },
            { href: '/tools/auction-bid', title: 'Auction Bid Calculator', desc: 'Factor in buyer premiums and fees' },
          ].map(t => (
            <Link
              key={t.href}
              href={t.href}
              className="bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 hover:border-gray-600 rounded-xl p-3 transition-colors group"
            >
              <div className="text-white text-sm font-medium group-hover:text-blue-400 transition-colors">{t.title}</div>
              <div className="text-gray-400 text-xs mt-0.5">{t.desc}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
