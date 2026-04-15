'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

interface CardResult {
  name: string;
  player: string;
  year: number;
  estimatedValue: string;
  sport: string;
}

// Simulated card database search (in production, would search sportsCards)
// For now, use a representative set of popular cards with values
const SAMPLE_CARDS: CardResult[] = [
  { name: '2018 Panini Prizm Luka Doncic RC #280', player: 'Luka Doncic', year: 2018, estimatedValue: '$400-$600', sport: 'basketball' },
  { name: '2020 Panini Prizm Justin Herbert RC', player: 'Justin Herbert', year: 2020, estimatedValue: '$150-$250', sport: 'football' },
  { name: '2011 Topps Update Mike Trout RC #US175', player: 'Mike Trout', year: 2011, estimatedValue: '$300-$500', sport: 'baseball' },
  { name: '2019 Panini Prizm Ja Morant RC', player: 'Ja Morant', year: 2019, estimatedValue: '$80-$150', sport: 'basketball' },
  { name: '2023 Panini Prizm Victor Wembanyama RC', player: 'Victor Wembanyama', year: 2023, estimatedValue: '$200-$400', sport: 'basketball' },
  { name: '2020 Panini Prizm Joe Burrow RC', player: 'Joe Burrow', year: 2020, estimatedValue: '$100-$200', sport: 'football' },
  { name: '1986 Fleer Michael Jordan RC #57', player: 'Michael Jordan', year: 1986, estimatedValue: '$15,000-$25,000', sport: 'basketball' },
  { name: '1952 Topps Mickey Mantle #311', player: 'Mickey Mantle', year: 1952, estimatedValue: '$50,000-$100,000', sport: 'baseball' },
  { name: '2018 Topps Update Shohei Ohtani RC', player: 'Shohei Ohtani', year: 2018, estimatedValue: '$200-$400', sport: 'baseball' },
  { name: '2017 Panini Prizm Patrick Mahomes RC', player: 'Patrick Mahomes', year: 2017, estimatedValue: '$500-$800', sport: 'football' },
  { name: '1979 O-Pee-Chee Wayne Gretzky RC #18', player: 'Wayne Gretzky', year: 1979, estimatedValue: '$8,000-$15,000', sport: 'hockey' },
  { name: '2015 Panini Prizm Nikola Jokic RC', player: 'Nikola Jokic', year: 2015, estimatedValue: '$300-$500', sport: 'basketball' },
  { name: '2000 Topps Traded Albert Pujols RC', player: 'Albert Pujols', year: 2000, estimatedValue: '$200-$400', sport: 'baseball' },
  { name: '2020 Panini Prizm Tua Tagovailoa RC', player: 'Tua Tagovailoa', year: 2020, estimatedValue: '$30-$60', sport: 'football' },
  { name: '2019 Topps Chrome Fernando Tatis Jr. RC', player: 'Fernando Tatis Jr.', year: 2019, estimatedValue: '$80-$150', sport: 'baseball' },
];

// Benchmark annual returns (approximate historical averages)
const BENCHMARKS = {
  sp500: { label: 'S&P 500', rate: 0.10, color: 'text-blue-400', bg: 'bg-blue-950/40 border-blue-800/40' },
  gold: { label: 'Gold', rate: 0.07, color: 'text-amber-400', bg: 'bg-amber-950/40 border-amber-800/40' },
  bonds: { label: 'US Bonds', rate: 0.04, color: 'text-emerald-400', bg: 'bg-emerald-950/40 border-emerald-800/40' },
  inflation: { label: 'Inflation', rate: 0.03, color: 'text-red-400', bg: 'bg-red-950/40 border-red-800/40' },
};

function parsePrice(val: string): number {
  const match = val.match(/\$([\d,]+)/);
  if (!match) return 0;
  return parseInt(match[1].replace(/,/g, ''), 10);
}

function formatCurrency(n: number): string {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${n.toLocaleString()}`;
}

function formatPercent(n: number): string {
  const sign = n >= 0 ? '+' : '';
  return `${sign}${n.toFixed(1)}%`;
}

export default function InvestmentReturnClient() {
  const [purchasePrice, setPurchasePrice] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [purchaseYear, setPurchaseYear] = useState('');
  const [cardName, setCardName] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CardResult | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredCards = useMemo(() => {
    if (!cardName || cardName.length < 2) return [];
    const q = cardName.toLowerCase();
    return SAMPLE_CARDS.filter(c =>
      c.name.toLowerCase().includes(q) || c.player.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [cardName]);

  const currentYear = 2026;

  function calculate() {
    const pp = parseFloat(purchasePrice);
    const cv = parseFloat(currentValue);
    const py = parseInt(purchaseYear, 10);

    if (!pp || !cv || !py || py >= currentYear || py < 1900) return null;

    const years = currentYear - py;
    const totalReturn = ((cv - pp) / pp) * 100;
    const annualizedReturn = (Math.pow(cv / pp, 1 / years) - 1) * 100;

    // Benchmark comparisons
    const benchmarkResults = Object.entries(BENCHMARKS).map(([key, bench]) => {
      const benchValue = pp * Math.pow(1 + bench.rate, years);
      const benchReturn = ((benchValue - pp) / pp) * 100;
      return {
        key,
        label: bench.label,
        rate: bench.rate,
        color: bench.color,
        bg: bench.bg,
        endValue: benchValue,
        totalReturn: benchReturn,
        outperformed: cv > benchValue,
      };
    });

    const bestBenchmark = benchmarkResults.reduce((best, b) => b.endValue > best.endValue ? b : best, benchmarkResults[0]);
    const beatsMarket = cv > benchmarkResults[0].endValue;

    let verdict: string;
    let verdictColor: string;
    if (totalReturn > 200) {
      verdict = 'Exceptional Investment';
      verdictColor = 'text-emerald-400';
    } else if (beatsMarket) {
      verdict = 'Beat the Stock Market';
      verdictColor = 'text-emerald-400';
    } else if (totalReturn > 0) {
      verdict = 'Positive Return (Below Market)';
      verdictColor = 'text-amber-400';
    } else if (totalReturn > -20) {
      verdict = 'Minor Loss';
      verdictColor = 'text-orange-400';
    } else {
      verdict = 'Significant Loss';
      verdictColor = 'text-red-400';
    }

    return {
      purchasePrice: pp,
      currentValue: cv,
      years,
      totalReturn,
      annualizedReturn,
      dollarGain: cv - pp,
      benchmarks: benchmarkResults,
      beatsMarket,
      verdict,
      verdictColor,
    };
  }

  function handleSelectCard(card: CardResult) {
    setSelectedCard(card);
    setCardName(card.name);
    setPurchaseYear(card.year.toString());
    // Set current value from card's estimated value (use midpoint)
    const low = parsePrice(card.estimatedValue);
    const highMatch = card.estimatedValue.match(/\$([\d,]+).*\$([\d,]+)/);
    if (highMatch) {
      const high = parseInt(highMatch[2].replace(/,/g, ''), 10);
      setCurrentValue(Math.round((low + high) / 2).toString());
    } else {
      setCurrentValue(low.toString());
    }
    setShowSuggestions(false);
  }

  function handleCalculate() {
    setShowResults(true);
  }

  const results = showResults ? calculate() : null;

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Enter Your Investment Details</h2>
        <div className="space-y-4">
          {/* Card Name */}
          <div className="relative">
            <label className="block text-sm font-medium text-white/60 mb-1">Card Name (optional)</label>
            <input
              type="text"
              value={cardName}
              onChange={(e) => { setCardName(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="e.g., 2018 Prizm Luka Doncic RC"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:border-white/30 focus:outline-none"
            />
            {showSuggestions && filteredCards.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-slate-900 border border-white/20 rounded-lg overflow-hidden shadow-xl">
                {filteredCards.map((card, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectCard(card)}
                    className="w-full text-left px-4 py-2.5 hover:bg-white/10 transition-colors border-b border-white/5 last:border-0"
                  >
                    <div className="text-sm text-white/90">{card.name}</div>
                    <div className="text-xs text-white/50">Est. Value: {card.estimatedValue}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Purchase Year */}
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1">Purchase Year</label>
              <input
                type="number"
                value={purchaseYear}
                onChange={(e) => setPurchaseYear(e.target.value)}
                placeholder="e.g., 2018"
                min={1900}
                max={2025}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:border-white/30 focus:outline-none"
              />
            </div>

            {/* Purchase Price */}
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1">Purchase Price ($)</label>
              <input
                type="number"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                placeholder="e.g., 50"
                min={0}
                step={0.01}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:border-white/30 focus:outline-none"
              />
            </div>

            {/* Current Value */}
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1">Current Value ($)</label>
              <input
                type="number"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                placeholder="e.g., 400"
                min={0}
                step={0.01}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:border-white/30 focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleCalculate}
            disabled={!purchasePrice || !currentValue || !purchaseYear}
            className="w-full sm:w-auto px-8 py-3 bg-white/10 border border-white/20 rounded-lg text-white font-semibold hover:bg-white/15 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Calculate Return
          </button>
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="space-y-6">
          {/* Verdict Banner */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 text-center">
            <div className={`text-3xl font-bold ${results.verdictColor} mb-2`}>{results.verdict}</div>
            <div className="text-white/50 text-sm">
              {cardName || 'Your card'} over {results.years} year{results.years !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 text-center">
              <div className="text-xs text-white/50 mb-1">Purchase Price</div>
              <div className="text-xl font-bold text-white">{formatCurrency(results.purchasePrice)}</div>
            </div>
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 text-center">
              <div className="text-xs text-white/50 mb-1">Current Value</div>
              <div className="text-xl font-bold text-white">{formatCurrency(results.currentValue)}</div>
            </div>
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 text-center">
              <div className="text-xs text-white/50 mb-1">Total Return</div>
              <div className={`text-xl font-bold ${results.totalReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {formatPercent(results.totalReturn)}
              </div>
            </div>
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 text-center">
              <div className="text-xs text-white/50 mb-1">Annual Return</div>
              <div className={`text-xl font-bold ${results.annualizedReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {formatPercent(results.annualizedReturn)}/yr
              </div>
            </div>
          </div>

          {/* Dollar Gain/Loss */}
          <div className={`p-4 rounded-xl border ${results.dollarGain >= 0 ? 'bg-emerald-950/30 border-emerald-800/40' : 'bg-red-950/30 border-red-800/40'}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Dollar {results.dollarGain >= 0 ? 'Gain' : 'Loss'}</span>
              <span className={`text-2xl font-bold ${results.dollarGain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {results.dollarGain >= 0 ? '+' : ''}{formatCurrency(Math.abs(results.dollarGain))}
              </span>
            </div>
          </div>

          {/* Benchmark Comparison */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">
              Benchmark Comparison ({results.years} year{results.years !== 1 ? 's' : ''})
            </h3>
            <p className="text-sm text-white/50 mb-4">
              If you had invested {formatCurrency(results.purchasePrice)} in these alternatives instead:
            </p>
            <div className="space-y-3">
              {/* Your Card */}
              <div className="flex items-center justify-between p-3 bg-white/[0.04] border border-white/10 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-lg">🃏</span>
                  <div>
                    <div className="text-sm font-semibold text-white">Your Card</div>
                    <div className={`text-xs ${results.totalReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {formatPercent(results.totalReturn)} total
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-white">{formatCurrency(results.currentValue)}</div>
                  <div className={`text-xs ${results.dollarGain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {results.dollarGain >= 0 ? '+' : ''}{formatCurrency(Math.abs(results.dollarGain))}
                  </div>
                </div>
              </div>

              {results.benchmarks.map(b => (
                <div key={b.key} className={`flex items-center justify-between p-3 rounded-lg border ${b.bg}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-lg">
                      {b.key === 'sp500' && '📈'}
                      {b.key === 'gold' && '🥇'}
                      {b.key === 'bonds' && '🏛️'}
                      {b.key === 'inflation' && '📊'}
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-white">{b.label}</div>
                      <div className={`text-xs ${b.color}`}>
                        {(b.rate * 100).toFixed(0)}% avg/year | {formatPercent(b.totalReturn)} total
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">{formatCurrency(Math.round(b.endValue))}</div>
                    <div className={`text-xs font-semibold ${b.outperformed ? 'text-red-400' : 'text-emerald-400'}`}>
                      {b.outperformed ? 'Card wins' : 'Benchmark wins'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Visual Comparison Bar */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-4">Value Growth Comparison</h3>
            {(() => {
              const allValues = [results.currentValue, ...results.benchmarks.map(b => b.endValue)];
              const maxVal = Math.max(...allValues);

              return (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-white/60 w-20 text-right">Your Card</span>
                    <div className="flex-1 h-6 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${results.totalReturn >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
                        style={{ width: `${(results.currentValue / maxVal) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-white/80 w-16 text-right">{formatCurrency(results.currentValue)}</span>
                  </div>
                  {results.benchmarks.map(b => (
                    <div key={b.key} className="flex items-center gap-3">
                      <span className="text-xs text-white/60 w-20 text-right">{b.label}</span>
                      <div className="flex-1 h-6 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${b.key === 'sp500' ? 'bg-blue-500' : b.key === 'gold' ? 'bg-amber-500' : b.key === 'bonds' ? 'bg-emerald-600' : 'bg-red-500/60'}`}
                          style={{ width: `${(b.endValue / maxVal) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-white/80 w-16 text-right">{formatCurrency(Math.round(b.endValue))}</span>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* Insight */}
          <div className="p-4 bg-white/[0.03] border border-white/10 rounded-xl">
            <div className="flex gap-3">
              <span className="text-xl flex-shrink-0">💡</span>
              <div className="text-sm text-white/70 leading-relaxed">
                {results.beatsMarket
                  ? `Your card investment outperformed the S&P 500 by ${formatPercent(results.totalReturn - results.benchmarks[0].totalReturn)} over ${results.years} years. Only about 15-20% of individual stock investments beat the market over this period — and even fewer collectibles do. Strong pick.`
                  : `Your card investment underperformed the S&P 500 by ${formatPercent(results.benchmarks[0].totalReturn - results.totalReturn)} over ${results.years} years. This is common — most collectibles don't outperform broad market indices. Cards are best viewed as a passion investment where enjoyment and market returns combine.`
                }
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Examples */}
      {!showResults && (
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Try These Examples</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { card: '1986 Fleer Jordan RC (raw)', year: '1990', paid: '50', current: '15000', desc: 'Bought for $50 in 1990' },
              { card: '2018 Prizm Luka Doncic RC', year: '2019', paid: '20', current: '400', desc: 'Bought for $20 at release' },
              { card: '2020 Prizm Justin Herbert RC', year: '2021', paid: '300', current: '180', desc: 'Bought at 2021 peak for $300' },
              { card: '2017 Prizm Mahomes RC', year: '2018', paid: '15', current: '600', desc: 'Bought for $15 before breakout' },
            ].map((ex, i) => (
              <button
                key={i}
                onClick={() => {
                  setCardName(ex.card);
                  setPurchaseYear(ex.year);
                  setPurchasePrice(ex.paid);
                  setCurrentValue(ex.current);
                  setShowResults(true);
                }}
                className="text-left p-4 bg-white/[0.02] border border-white/5 rounded-lg hover:bg-white/[0.05] transition-colors"
              >
                <div className="text-sm font-medium text-white/90">{ex.card}</div>
                <div className="text-xs text-white/50 mt-1">{ex.desc} — now worth ${parseInt(ex.current).toLocaleString()}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Related Links */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Related Tools</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { href: '/tools/portfolio', title: 'Fantasy Portfolio', desc: 'Build a card portfolio and track performance' },
            { href: '/tools/portfolio-rebalancer', title: 'Portfolio Rebalancer', desc: 'Optimize your card portfolio allocation' },
            { href: '/investment-thesis', title: 'Investment Thesis', desc: 'Bull/bear case for any card' },
            { href: '/tools/grading-roi', title: 'Grading ROI', desc: 'Is grading this card worth it?' },
            { href: '/tools/flip-tracker', title: 'Flip Tracker', desc: 'Track your card flipping P&L' },
            { href: '/seasonal-calendar', title: 'Seasonal Calendar', desc: 'Best times to buy and sell by sport' },
          ].map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-start gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-lg hover:bg-white/[0.05] transition-colors"
            >
              <div className="min-w-0">
                <div className="text-sm font-medium text-white/90">{link.title}</div>
                <div className="text-xs text-white/50">{link.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
