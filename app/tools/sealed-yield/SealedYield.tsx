'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  purchasePrice: number;
  currentValue: number;
  purchaseDate: string; // YYYY-MM-DD
  monthlyStorage: number;
}

interface Benchmark {
  name: string;
  annualReturn: number;
  color: string;
  desc: string;
}

const BENCHMARKS: Benchmark[] = [
  { name: 'S&P 500', annualReturn: 0.105, color: 'text-blue-400', desc: '~10.5% historical average' },
  { name: 'Gold', annualReturn: 0.081, color: 'text-yellow-400', desc: '~8.1% 10-year average' },
  { name: 'US Bonds', annualReturn: 0.042, color: 'text-cyan-400', desc: '~4.2% 10-year yield' },
  { name: 'Inflation (CPI)', annualReturn: 0.032, color: 'text-red-400', desc: '~3.2% recent average' },
];

const PRESETS = [
  { name: '2024 Topps Chrome Hobby Box', purchasePrice: 225, currentValue: 280 },
  { name: '2023 Panini Prizm Football Hobby', purchasePrice: 750, currentValue: 620 },
  { name: '2023 Topps Series 1 Hobby Box', purchasePrice: 100, currentValue: 135 },
  { name: '2024 Panini Prizm Basketball Hobby', purchasePrice: 600, currentValue: 550 },
  { name: '2022 Bowman Chrome Hobby Box', purchasePrice: 250, currentValue: 310 },
  { name: '2021 Topps Chrome Hobby Box', purchasePrice: 200, currentValue: 320 },
  { name: '2020 Panini Prizm Football Hobby', purchasePrice: 400, currentValue: 850 },
  { name: '2019 Topps Chrome Hobby Box', purchasePrice: 120, currentValue: 380 },
  { name: '2018 Panini Prizm Basketball Hobby', purchasePrice: 280, currentValue: 1200 },
  { name: '2016 Bowman Chrome Hobby Box', purchasePrice: 110, currentValue: 550 },
  { name: '2013 Topps Chrome Football Hobby', purchasePrice: 90, currentValue: 310 },
  { name: '2003-04 Topps Chrome Basketball', purchasePrice: 60, currentValue: 4500 },
  { name: '1986-87 Fleer Basketball Wax Box', purchasePrice: 15000, currentValue: 120000 },
  { name: '2024 Pokemon 151 ETB', purchasePrice: 50, currentValue: 65 },
  { name: '2023 Pokemon Obsidian Flames Booster', purchasePrice: 140, currentValue: 170 },
];

function yearsBetween(dateStr: string, now: Date): number {
  const d = new Date(dateStr);
  const ms = now.getTime() - d.getTime();
  return Math.max(ms / (365.25 * 24 * 60 * 60 * 1000), 1 / 365);
}

function cagr(initial: number, final: number, years: number): number {
  if (initial <= 0 || years <= 0) return 0;
  return Math.pow(final / initial, 1 / years) - 1;
}

function fmt(n: number): string {
  if (Math.abs(n) >= 10000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function pct(n: number): string {
  const p = (n * 100).toFixed(1);
  return `${Number(p) >= 0 ? '+' : ''}${p}%`;
}

let nextId = 1;
function genId(): string { return `p-${nextId++}-${Date.now()}`; }

export default function SealedYield() {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('2023-01-01');
  const [monthlyStorage, setMonthlyStorage] = useState('0');
  const [showPresets, setShowPresets] = useState(false);

  const now = useMemo(() => new Date(), []);

  const addProduct = () => {
    const pp = parseFloat(purchasePrice);
    const cv = parseFloat(currentValue);
    const ms = parseFloat(monthlyStorage) || 0;
    if (!name.trim() || isNaN(pp) || isNaN(cv) || pp <= 0 || cv <= 0) return;
    setProducts([...products, { id: genId(), name: name.trim(), purchasePrice: pp, currentValue: cv, purchaseDate, monthlyStorage: ms }]);
    setName('');
    setPurchasePrice('');
    setCurrentValue('');
    setMonthlyStorage('0');
  };

  const loadPreset = (p: typeof PRESETS[0]) => {
    setName(p.name);
    setPurchasePrice(String(p.purchasePrice));
    setCurrentValue(String(p.currentValue));
    // Guess purchase date from product name year
    const yearMatch = p.name.match(/(20\d{2})/);
    if (yearMatch) {
      const year = parseInt(yearMatch[1]);
      setPurchaseDate(`${year}-06-01`);
    }
    setShowPresets(false);
  };

  const removeProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const analysis = useMemo(() => {
    return products.map(p => {
      const years = yearsBetween(p.purchaseDate, now);
      const totalStorageCost = p.monthlyStorage * years * 12;
      const netValue = p.currentValue - totalStorageCost;
      const grossReturn = cagr(p.purchasePrice, p.currentValue, years);
      const netReturn = cagr(p.purchasePrice, Math.max(netValue, 0), years);
      const totalGainLoss = p.currentValue - p.purchasePrice;
      const netGainLoss = netValue - p.purchasePrice;
      const totalReturnPct = (p.currentValue - p.purchasePrice) / p.purchasePrice;

      const benchmarks = BENCHMARKS.map(b => {
        const benchmarkValue = p.purchasePrice * Math.pow(1 + b.annualReturn, years);
        const beating = netValue >= benchmarkValue;
        return { ...b, benchmarkValue, beating, delta: netReturn - b.annualReturn };
      });

      const beatsMarket = benchmarks[0].beating; // S&P 500
      const verdict = netReturn >= 0.15 ? 'EXCELLENT' : netReturn >= 0.08 ? 'STRONG' : netReturn >= 0.03 ? 'MODERATE' : netReturn >= 0 ? 'MARGINAL' : 'LOSING';
      const verdictColor = netReturn >= 0.15 ? 'text-emerald-400' : netReturn >= 0.08 ? 'text-green-400' : netReturn >= 0.03 ? 'text-yellow-400' : netReturn >= 0 ? 'text-orange-400' : 'text-red-400';
      const verdictBg = netReturn >= 0.15 ? 'bg-emerald-950/50 border-emerald-800/50' : netReturn >= 0.08 ? 'bg-green-950/50 border-green-800/50' : netReturn >= 0.03 ? 'bg-yellow-950/50 border-yellow-800/50' : netReturn >= 0 ? 'bg-orange-950/50 border-orange-800/50' : 'bg-red-950/50 border-red-800/50';

      return {
        ...p,
        years,
        grossReturn,
        netReturn,
        totalGainLoss,
        netGainLoss,
        totalStorageCost,
        netValue,
        totalReturnPct,
        benchmarks,
        beatsMarket,
        verdict,
        verdictColor,
        verdictBg,
      };
    });
  }, [products, now]);

  // Portfolio aggregate
  const totalInvested = analysis.reduce((s, a) => s + a.purchasePrice, 0);
  const totalCurrent = analysis.reduce((s, a) => s + a.currentValue, 0);
  const totalNet = analysis.reduce((s, a) => s + a.netValue, 0);
  const avgYears = analysis.length > 0 ? analysis.reduce((s, a) => s + a.years, 0) / analysis.length : 0;
  const portfolioCagr = totalInvested > 0 && avgYears > 0 ? cagr(totalInvested, totalNet, avgYears) : 0;
  const bestPerformer = analysis.length > 0 ? analysis.reduce((best, a) => a.netReturn > best.netReturn ? a : best) : null;
  const worstPerformer = analysis.length > 0 ? analysis.reduce((worst, a) => a.netReturn < worst.netReturn ? a : worst) : null;

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-white">Add Sealed Product</h2>
          <button onClick={() => setShowPresets(!showPresets)}
            className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
            {showPresets ? 'Hide Presets' : 'Load Preset'}
          </button>
        </div>

        {showPresets && (
          <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
            {PRESETS.map((p, i) => (
              <button key={i} onClick={() => loadPreset(p)}
                className="text-left p-2 bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 rounded-lg transition-colors text-sm">
                <div className="text-white font-medium truncate">{p.name}</div>
                <div className="text-gray-500 text-xs">Bought: {fmt(p.purchasePrice)} &rarr; Now: {fmt(p.currentValue)}</div>
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm text-gray-400 mb-1">Product Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g., 2024 Topps Chrome Hobby Box"
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Purchase Price ($)</label>
            <input type="number" value={purchasePrice} onChange={e => setPurchasePrice(e.target.value)}
              placeholder="225" min="0" step="1"
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Current Estimated Value ($)</label>
            <input type="number" value={currentValue} onChange={e => setCurrentValue(e.target.value)}
              placeholder="280" min="0" step="1"
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Purchase Date</label>
            <input type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Monthly Storage Cost ($)</label>
            <input type="number" value={monthlyStorage} onChange={e => setMonthlyStorage(e.target.value)}
              placeholder="0" min="0" step="1"
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500" />
          </div>
        </div>
        <button onClick={addProduct}
          className="mt-4 w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors">
          Add Product
        </button>
      </div>

      {/* Portfolio Summary */}
      {analysis.length > 0 && (
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Portfolio Summary</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{fmt(totalInvested)}</div>
              <div className="text-xs text-gray-500">Total Invested</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${totalNet >= totalInvested ? 'text-emerald-400' : 'text-red-400'}`}>{fmt(totalNet)}</div>
              <div className="text-xs text-gray-500">Net Value</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${portfolioCagr >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{pct(portfolioCagr)}</div>
              <div className="text-xs text-gray-500">Portfolio CAGR</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{analysis.length}</div>
              <div className="text-xs text-gray-500">Products Tracked</div>
            </div>
          </div>

          {/* Portfolio vs Benchmarks */}
          <div className="space-y-2 mb-6">
            <div className="text-sm text-gray-400 font-medium mb-2">Portfolio vs Benchmarks</div>
            {BENCHMARKS.map((b, i) => {
              const beating = portfolioCagr >= b.annualReturn;
              return (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className={beating ? 'text-emerald-400' : 'text-red-400'}>{beating ? '\u2713' : '\u2717'}</span>
                    <span className={b.color}>{b.name}</span>
                    <span className="text-gray-600 text-xs">{b.desc}</span>
                  </div>
                  <span className={beating ? 'text-emerald-400' : 'text-red-400'}>
                    {beating ? 'Beating' : 'Losing to'} by {Math.abs((portfolioCagr - b.annualReturn) * 100).toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>

          {/* Best/Worst */}
          {analysis.length > 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {bestPerformer && (
                <div className="bg-emerald-950/30 border border-emerald-800/30 rounded-lg p-3">
                  <div className="text-xs text-emerald-400 font-medium mb-1">Best Performer</div>
                  <div className="text-white text-sm font-medium truncate">{bestPerformer.name}</div>
                  <div className="text-emerald-400 text-lg font-bold">{pct(bestPerformer.netReturn)} CAGR</div>
                </div>
              )}
              {worstPerformer && (
                <div className="bg-red-950/30 border border-red-800/30 rounded-lg p-3">
                  <div className="text-xs text-red-400 font-medium mb-1">Worst Performer</div>
                  <div className="text-white text-sm font-medium truncate">{worstPerformer.name}</div>
                  <div className="text-red-400 text-lg font-bold">{pct(worstPerformer.netReturn)} CAGR</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Individual Product Results */}
      {analysis.map(a => (
        <div key={a.id} className={`border rounded-xl p-6 ${a.verdictBg}`}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-white font-bold text-lg">{a.name}</h3>
              <div className="text-gray-400 text-sm">Held {a.years.toFixed(1)} years &middot; Purchased {a.purchaseDate}</div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`text-sm font-bold px-3 py-1 rounded-full ${a.verdictColor} ${a.verdictBg}`}>
                {a.verdict}
              </div>
              <button onClick={() => removeProduct(a.id)} className="text-gray-600 hover:text-red-400 transition-colors text-lg">&times;</button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div>
              <div className="text-xs text-gray-500 mb-1">Purchase Price</div>
              <div className="text-white font-bold">{fmt(a.purchasePrice)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Current Value</div>
              <div className="text-white font-bold">{fmt(a.currentValue)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Gain/Loss</div>
              <div className={`font-bold ${a.totalGainLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {a.totalGainLoss >= 0 ? '+' : ''}{fmt(a.totalGainLoss)} ({pct(a.totalReturnPct)})
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Annualized (CAGR)</div>
              <div className={`font-bold text-lg ${a.netReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {pct(a.netReturn)}
              </div>
            </div>
          </div>

          {/* Storage Cost Impact */}
          {a.totalStorageCost > 0 && (
            <div className="bg-gray-800/30 rounded-lg p-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Storage cost ({fmt(a.monthlyStorage)}/mo &times; {(a.years * 12).toFixed(0)} months)</span>
                <span className="text-orange-400">-{fmt(a.totalStorageCost)}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-400">Gross CAGR (before storage)</span>
                <span className="text-gray-300">{pct(a.grossReturn)}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-400">Net CAGR (after storage)</span>
                <span className={a.netReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}>{pct(a.netReturn)}</span>
              </div>
            </div>
          )}

          {/* Benchmark Comparison Bars */}
          <div className="space-y-3">
            <div className="text-sm text-gray-400 font-medium">Benchmark Comparison</div>
            {/* Your product bar */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-white font-medium">Your Product</span>
                <span className={a.netReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}>{pct(a.netReturn)}</span>
              </div>
              <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${a.netReturn >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(Math.max(Math.abs(a.netReturn) / 0.25 * 100, 2), 100)}%` }} />
              </div>
            </div>
            {a.benchmarks.map((b, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className={b.color}>{b.name} <span className="text-gray-600">({b.desc})</span></span>
                  <span className={b.beating ? 'text-emerald-400' : 'text-red-400'}>
                    {b.beating ? '\u2713 Beating' : '\u2717 Losing'}
                  </span>
                </div>
                <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gray-600"
                    style={{ width: `${Math.min(b.annualReturn / 0.25 * 100, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Hypothetical: What would your $ be worth in each benchmark */}
          <div className="mt-4 bg-gray-800/30 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-2">If you invested {fmt(a.purchasePrice)} for {a.years.toFixed(1)} years in:</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {a.benchmarks.map((b, i) => (
                <div key={i} className="text-center">
                  <div className={`text-sm font-bold ${b.color}`}>{fmt(b.benchmarkValue)}</div>
                  <div className="text-xs text-gray-500">{b.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* Empty State */}
      {analysis.length === 0 && (
        <div className="bg-gray-900/60 border border-gray-800 border-dashed rounded-xl p-12 text-center">
          <div className="text-4xl mb-3">&#128230;</div>
          <div className="text-gray-400 text-lg mb-2">No products tracked yet</div>
          <div className="text-gray-500 text-sm max-w-md mx-auto">
            Add a sealed product above to see its annualized return compared to S&amp;P 500, gold, bonds, and inflation. Use presets for quick analysis.
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Sealed Product Investment Tips</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { title: 'Buy at release, not after hype', text: 'The best returns come from buying at release price and holding through player breakouts. Chasing hype products at inflated prices rarely works.' },
            { title: 'Hobby boxes outperform retail', text: 'Hobby boxes have historically appreciated faster than retail/blaster formats. The lower print runs and guaranteed hits make them more collectible.' },
            { title: 'Storage matters more than you think', text: 'Climate-controlled storage at $10/month wipes 2-4% off annualized returns on a $300 box. Factor this in before calling it an investment.' },
            { title: 'Diversify across sports and years', text: 'Don\'t go all-in on one sport or era. The best sealed portfolios spread across 3+ sports and multiple release years to smooth volatility.' },
            { title: 'Liquidity is limited', text: 'Unlike stocks, selling sealed product takes time and effort. eBay fees are 13%+, and shipping heavy boxes costs $10-20. Factor in sell costs.' },
            { title: 'Insurance is non-negotiable', text: 'Sealed product over $1,000 total value should be insured. A burst pipe or theft can wipe out years of appreciation in minutes.' },
          ].map((tip, i) => (
            <div key={i} className="bg-gray-800/30 rounded-lg p-4">
              <div className="text-white text-sm font-medium mb-1">{tip.title}</div>
              <div className="text-gray-500 text-xs leading-relaxed">{tip.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
