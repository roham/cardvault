'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

interface MarketCard {
  slug: string;
  name: string;
  player: string;
  sport: string;
  basePrice: number;
  prices: number[];  // price per day (7 days)
}

interface Holding {
  slug: string;
  qty: number;
  avgCost: number;
}

interface TradeLog {
  day: number;
  action: 'BUY' | 'SELL';
  name: string;
  price: number;
  qty: number;
}

/* ------------------------------------------------------------------ */
/*  Deterministic market generation                                   */
/* ------------------------------------------------------------------ */

function dateHash(): number {
  const d = new Date();
  const str = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function generateMarket(): MarketCard[] {
  const seed = dateHash();
  const rng = seededRandom(seed);

  // Pick 20 cards deterministically
  const pool = sportsCards.filter(c => {
    const v = parseFloat(c.estimatedValueRaw.replace(/[$,]/g, ''));
    return v >= 5 && v <= 5000 && !isNaN(v);
  });

  const indices = new Set<number>();
  while (indices.size < Math.min(20, pool.length)) {
    indices.add(Math.floor(rng() * pool.length));
  }

  return [...indices].map(idx => {
    const card = pool[idx];
    const basePrice = parseFloat(card.estimatedValueRaw.replace(/[$,]/g, ''));

    // Generate 7 days of price movement
    const prices: number[] = [basePrice];
    for (let day = 1; day <= 6; day++) {
      const volatility = 0.04 + rng() * 0.08; // 4-12% daily swing
      const direction = rng() > 0.45 ? 1 : -1; // slight upward bias
      const change = 1 + direction * volatility * rng();
      prices.push(Math.round(prices[day - 1] * change * 100) / 100);
    }

    return {
      slug: card.slug,
      name: card.name,
      player: card.player,
      sport: card.sport,
      basePrice,
      prices,
    };
  });
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function formatPrice(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

function pctChange(from: number, to: number): string {
  const pct = ((to - from) / from) * 100;
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(1)}%`;
}

const sportEmoji: Record<string, string> = {
  baseball: '\u26BE',
  basketball: '\uD83C\uDFC0',
  football: '\uD83C\uDFC8',
  hockey: '\uD83C\uDFD2',
};

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

type Phase = 'intro' | 'trading' | 'results';

const STARTING_CASH = 500;

export default function TradingSimClient() {
  const market = useMemo(generateMarket, []);

  const [phase, setPhase] = useState<Phase>('intro');
  const [day, setDay] = useState(0);
  const [cash, setCash] = useState(STARTING_CASH);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [tradeLog, setTradeLog] = useState<TradeLog[]>([]);
  const [filter, setFilter] = useState<string>('all');

  const currentPrice = useCallback(
    (card: MarketCard) => card.prices[day],
    [day]
  );

  const portfolioValue = useMemo(() => {
    return holdings.reduce((sum, h) => {
      const card = market.find(c => c.slug === h.slug);
      if (!card) return sum;
      return sum + currentPrice(card) * h.qty;
    }, 0);
  }, [holdings, market, currentPrice]);

  const totalValue = cash + portfolioValue;
  const totalReturn = ((totalValue - STARTING_CASH) / STARTING_CASH) * 100;

  const filteredMarket = filter === 'all' ? market : market.filter(c => c.sport === filter);

  function buyCard(card: MarketCard) {
    const price = currentPrice(card);
    if (cash < price) return;

    setCash(prev => Math.round((prev - price) * 100) / 100);
    setHoldings(prev => {
      const existing = prev.find(h => h.slug === card.slug);
      if (existing) {
        const newQty = existing.qty + 1;
        const newAvg = (existing.avgCost * existing.qty + price) / newQty;
        return prev.map(h =>
          h.slug === card.slug ? { ...h, qty: newQty, avgCost: Math.round(newAvg * 100) / 100 } : h
        );
      }
      return [...prev, { slug: card.slug, qty: 1, avgCost: price }];
    });
    setTradeLog(prev => [...prev, { day, action: 'BUY', name: card.player, price, qty: 1 }]);
  }

  function sellCard(card: MarketCard) {
    const holding = holdings.find(h => h.slug === card.slug);
    if (!holding || holding.qty <= 0) return;
    const price = currentPrice(card);

    setCash(prev => Math.round((prev + price) * 100) / 100);
    setHoldings(prev => {
      if (holding.qty === 1) return prev.filter(h => h.slug !== card.slug);
      return prev.map(h =>
        h.slug === card.slug ? { ...h, qty: h.qty - 1 } : h
      );
    });
    setTradeLog(prev => [...prev, { day, action: 'SELL', name: card.player, price, qty: 1 }]);
  }

  function advanceDay() {
    if (day >= 6) {
      setPhase('results');
    } else {
      setDay(prev => prev + 1);
    }
  }

  function reset() {
    setPhase('intro');
    setDay(0);
    setCash(STARTING_CASH);
    setHoldings([]);
    setTradeLog([]);
    setFilter('all');
  }

  /* ---- Intro screen ---- */
  if (phase === 'intro') {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-6">📈</div>
        <h2 className="text-2xl font-bold text-white mb-3">Card Trading Simulator</h2>
        <p className="text-gray-400 max-w-md mx-auto mb-6 leading-relaxed">
          Start with <span className="text-emerald-400 font-bold">$500</span>. Buy and sell from a market of 20 real cards over 7 simulated days. Prices change daily. Maximize your portfolio value.
        </p>
        <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mb-8">
          <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-3">
            <div className="text-lg font-bold text-emerald-400">$500</div>
            <div className="text-xs text-gray-500">Starting Cash</div>
          </div>
          <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-3">
            <div className="text-lg font-bold text-white">20</div>
            <div className="text-xs text-gray-500">Cards</div>
          </div>
          <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-3">
            <div className="text-lg font-bold text-white">7</div>
            <div className="text-xs text-gray-500">Days</div>
          </div>
        </div>
        <button
          onClick={() => setPhase('trading')}
          className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors text-lg"
        >
          Start Trading
        </button>
        <p className="text-xs text-gray-600 mt-4">Market resets daily. Same cards and prices for all players today.</p>
      </div>
    );
  }

  /* ---- Results screen ---- */
  if (phase === 'results') {
    const grade = totalReturn >= 20 ? 'S' : totalReturn >= 10 ? 'A' : totalReturn >= 5 ? 'B' : totalReturn >= 0 ? 'C' : totalReturn >= -10 ? 'D' : 'F';
    const gradeColors: Record<string, string> = {
      S: 'text-yellow-400', A: 'text-emerald-400', B: 'text-blue-400', C: 'text-gray-300', D: 'text-orange-400', F: 'text-red-400',
    };
    const gradeLabels: Record<string, string> = {
      S: 'Wall Street Wolf', A: 'Savvy Flipper', B: 'Smart Collector', C: 'Break Even', D: 'Learning Curve', F: 'Market Tuition',
    };

    // Save best score
    if (typeof window !== 'undefined') {
      const prev = localStorage.getItem('cv-trading-sim-best');
      if (!prev || totalReturn > parseFloat(prev)) {
        localStorage.setItem('cv-trading-sim-best', totalReturn.toFixed(1));
      }
    }

    return (
      <div className="py-8">
        <div className="text-center mb-8">
          <div className={`text-7xl font-black ${gradeColors[grade]} mb-2`}>{grade}</div>
          <div className="text-lg text-gray-300 font-medium">{gradeLabels[grade]}</div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-xl font-bold text-white">{formatPrice(totalValue)}</div>
            <div className="text-xs text-gray-400 mt-1">Final Value</div>
          </div>
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 text-center">
            <div className={`text-xl font-bold ${totalReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-400 mt-1">Return</div>
          </div>
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-xl font-bold text-white">{tradeLog.length}</div>
            <div className="text-xs text-gray-400 mt-1">Trades Made</div>
          </div>
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-xl font-bold text-white">{formatPrice(cash)}</div>
            <div className="text-xs text-gray-400 mt-1">Cash Left</div>
          </div>
        </div>

        {/* Trade Log */}
        {tradeLog.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Trade History</h3>
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {tradeLog.map((t, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-gray-800/30 rounded-lg text-sm">
                  <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                    t.action === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {t.action}
                  </span>
                  <span className="text-gray-300 flex-1 truncate">{t.name}</span>
                  <span className="text-gray-500 text-xs">Day {t.day + 1}</span>
                  <span className="text-white font-medium">{formatPrice(t.price)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Final Holdings */}
        {holdings.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Final Holdings</h3>
            <div className="space-y-1.5">
              {holdings.map(h => {
                const card = market.find(c => c.slug === h.slug);
                if (!card) return null;
                const finalPrice = card.prices[6];
                const pnl = (finalPrice - h.avgCost) * h.qty;
                return (
                  <div key={h.slug} className="flex items-center gap-2 p-2 bg-gray-800/30 rounded-lg text-sm">
                    <span>{sportEmoji[card.sport] || ''}</span>
                    <span className="text-white flex-1 truncate">{card.player}</span>
                    <span className="text-gray-500 text-xs">{h.qty}x @ {formatPrice(h.avgCost)}</span>
                    <span className={`font-medium ${pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {pnl >= 0 ? '+' : ''}{formatPrice(pnl)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors"
          >
            Play Again
          </button>
          <Link
            href="/tools/portfolio"
            className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-xl transition-colors border border-gray-700"
          >
            Try Fantasy Portfolio
          </Link>
        </div>
      </div>
    );
  }

  /* ---- Trading screen ---- */
  return (
    <div>
      {/* Status Bar */}
      <div className="sticky top-0 z-10 bg-gray-950/95 backdrop-blur-sm border-b border-gray-800 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <div>
              <div className="text-xs text-gray-500">Day</div>
              <div className="text-lg font-bold text-white">{day + 1}/7</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Cash</div>
              <div className="text-lg font-bold text-emerald-400">{formatPrice(cash)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Portfolio</div>
              <div className="text-lg font-bold text-white">{formatPrice(portfolioValue)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Total</div>
              <div className={`text-lg font-bold ${totalReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {formatPrice(totalValue)} ({totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(1)}%)
              </div>
            </div>
          </div>
          <button
            onClick={advanceDay}
            className={`px-5 py-2 font-bold rounded-xl transition-colors text-sm ${
              day >= 6
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            {day >= 6 ? 'End Sim' : `Next Day \u2192`}
          </button>
        </div>
        {/* Day progress bar */}
        <div className="flex gap-1 mt-2">
          {Array.from({ length: 7 }, (_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${
                i < day ? 'bg-emerald-500' : i === day ? 'bg-blue-500' : 'bg-gray-800'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Holdings Summary */}
      {holdings.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">Your Holdings ({holdings.length})</h3>
          <div className="flex flex-wrap gap-2">
            {holdings.map(h => {
              const card = market.find(c => c.slug === h.slug);
              if (!card) return null;
              const price = currentPrice(card);
              const pnl = ((price - h.avgCost) / h.avgCost) * 100;
              return (
                <div key={h.slug} className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/60 border border-gray-700 rounded-lg text-xs">
                  <span>{sportEmoji[card.sport]}</span>
                  <span className="text-white font-medium">{card.player}</span>
                  <span className="text-gray-500">{h.qty}x</span>
                  <span className={pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                    {pnl >= 0 ? '+' : ''}{pnl.toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sport Filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { value: 'all', label: 'All', emoji: '\uD83C\uDFAF' },
          { value: 'baseball', label: 'Baseball', emoji: '\u26BE' },
          { value: 'basketball', label: 'Basketball', emoji: '\uD83C\uDFC0' },
          { value: 'football', label: 'Football', emoji: '\uD83C\uDFC8' },
          { value: 'hockey', label: 'Hockey', emoji: '\uD83C\uDFD2' },
        ].map(sf => (
          <button
            key={sf.value}
            onClick={() => setFilter(sf.value)}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              filter === sf.value
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-gray-900/60 text-gray-400 border-gray-800 hover:border-gray-600'
            }`}
          >
            <span>{sf.emoji}</span> {sf.label}
          </button>
        ))}
      </div>

      {/* Market Cards */}
      <div className="space-y-2">
        {filteredMarket.map(card => {
          const price = currentPrice(card);
          const prevPrice = day > 0 ? card.prices[day - 1] : card.basePrice;
          const dayChange = ((price - prevPrice) / prevPrice) * 100;
          const holding = holdings.find(h => h.slug === card.slug);
          const canBuy = cash >= price;

          return (
            <div
              key={card.slug}
              className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 bg-gray-900/40 border border-gray-800 rounded-xl hover:border-gray-700 transition-colors"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-lg shrink-0">{sportEmoji[card.sport] || ''}</span>
                <div className="min-w-0">
                  <Link href={`/sports/${card.slug}`} className="text-sm font-medium text-white hover:text-emerald-400 transition-colors truncate block">
                    {card.player}
                  </Link>
                  <p className="text-xs text-gray-500 truncate">{card.name}</p>
                </div>
              </div>

              {/* Price + Change */}
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="text-right">
                  <div className="text-sm font-bold text-white">{formatPrice(price)}</div>
                  <div className={`text-xs font-medium ${dayChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {dayChange >= 0 ? '+' : ''}{dayChange.toFixed(1)}%
                  </div>
                </div>

                {/* Mini sparkline */}
                <div className="flex items-end gap-px h-6 w-16 shrink-0">
                  {card.prices.slice(0, day + 1).map((p, i) => {
                    const min = Math.min(...card.prices);
                    const max = Math.max(...card.prices);
                    const range = max - min || 1;
                    const height = Math.max(4, ((p - min) / range) * 24);
                    return (
                      <div
                        key={i}
                        className={`flex-1 rounded-sm ${
                          i === day ? 'bg-blue-400' : p >= card.basePrice ? 'bg-emerald-500/50' : 'bg-red-500/50'
                        }`}
                        style={{ height: `${height}px` }}
                      />
                    );
                  })}
                </div>

                {/* Action buttons */}
                <div className="flex gap-1.5 shrink-0">
                  <button
                    onClick={() => buyCard(card)}
                    disabled={!canBuy}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      canBuy
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    BUY
                  </button>
                  <button
                    onClick={() => sellCard(card)}
                    disabled={!holding}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      holding
                        ? 'bg-red-600 hover:bg-red-500 text-white'
                        : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    SELL
                    {holding && <span className="ml-1 opacity-75">({holding.qty})</span>}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Trades */}
      {tradeLog.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">Recent Trades</h3>
          <div className="flex flex-wrap gap-1.5">
            {tradeLog.slice(-8).reverse().map((t, i) => (
              <span
                key={i}
                className={`text-xs px-2 py-1 rounded-lg border ${
                  t.action === 'BUY' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
                }`}
              >
                {t.action} {t.name} @ {formatPrice(t.price)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
