'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { sportsCards } from '@/data/sports-cards';

interface MarketCard {
  slug: string;
  name: string;
  player: string;
  sport: string;
  year: number;
  basePrice: number;
  currentPrice: number;
  priceHistory: number[];
  rookie: boolean;
}

interface Holding {
  slug: string;
  qty: number;
  avgCost: number;
}

interface NewsEvent {
  headline: string;
  impact: Record<string, number>; // slug -> multiplier
  type: 'positive' | 'negative' | 'neutral';
}

const SPORT_EMOJI: Record<string, string> = {
  baseball: '\u26BE',
  basketball: '\uD83C\uDFC0',
  football: '\uD83C\uDFC8',
  hockey: '\uD83C\uDFD2',
};

const STARTING_CASH = 10000;
const TOTAL_ROUNDS = 10;
const MARKET_SIZE = 20;

function parseGem(raw: string): number {
  const match = raw.match(/\$[\d,]+/g);
  if (!match) return 50;
  const vals = match.map(v => parseInt(v.replace(/[$,]/g, '')));
  return vals[vals.length - 1] || 50;
}

function fmt(n: number): string {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(2)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`;
  return `$${n.toFixed(0)}`;
}

function fmtPct(n: number): string {
  const p = ((n - 1) * 100).toFixed(1);
  return n >= 1 ? `+${p}%` : `${p}%`;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const NEWS_TEMPLATES = [
  { text: '{player} named to All-Star team!', type: 'positive' as const, mult: 1.15 },
  { text: '{player} wins MVP award!', type: 'positive' as const, mult: 1.35 },
  { text: '{player} hits walk-off home run in playoffs!', type: 'positive' as const, mult: 1.20 },
  { text: '{player} signs record contract extension', type: 'positive' as const, mult: 1.12 },
  { text: '{player} named Rookie of the Year!', type: 'positive' as const, mult: 1.40 },
  { text: 'PSA announces backlog cleared — {player} slabs flooding market', type: 'negative' as const, mult: 0.90 },
  { text: '{player} suffers season-ending injury', type: 'negative' as const, mult: 0.75 },
  { text: '{player} traded to small-market team', type: 'negative' as const, mult: 0.88 },
  { text: '{player} suspended for PED violation', type: 'negative' as const, mult: 0.65 },
  { text: '{player} has breakout performance — 40-point game!', type: 'positive' as const, mult: 1.25 },
  { text: 'Hobby market cools — collectors taking profits on {player}', type: 'negative' as const, mult: 0.92 },
  { text: 'New {player} parallel discovered — population count drops!', type: 'positive' as const, mult: 1.18 },
  { text: '{player} declines — aging concerns mount', type: 'negative' as const, mult: 0.85 },
  { text: 'Draft week hype: {player} cards surge in demand', type: 'positive' as const, mult: 1.22 },
  { text: 'Market-wide dip: all cards down slightly', type: 'neutral' as const, mult: 0.95 },
  { text: 'Market rally: collector confidence up across the board', type: 'neutral' as const, mult: 1.05 },
];

function buildMarket(seed: number): MarketCard[] {
  const rng = seededRandom(seed);
  const allCards = sportsCards.filter(c => {
    const val = parseGem(c.estimatedValueGem);
    return val >= 30 && val <= 50000;
  });

  const selected: MarketCard[] = [];
  const usedPlayers = new Set<string>();

  while (selected.length < MARKET_SIZE && allCards.length > 0) {
    const idx = Math.floor(rng() * allCards.length);
    const card = allCards[idx];
    if (!usedPlayers.has(card.player)) {
      usedPlayers.add(card.player);
      const price = parseGem(card.estimatedValueGem);
      selected.push({
        slug: card.slug,
        name: card.name,
        player: card.player,
        sport: card.sport,
        year: card.year,
        basePrice: price,
        currentPrice: price,
        priceHistory: [price],
        rookie: card.rookie,
      });
    }
    allCards.splice(idx, 1);
  }

  return selected.sort((a, b) => b.currentPrice - a.currentPrice);
}

function generateNews(market: MarketCard[], round: number, seed: number): NewsEvent[] {
  const rng = seededRandom(seed + round * 7919);
  const events: NewsEvent[] = [];
  const numEvents = 2 + Math.floor(rng() * 2); // 2-3 events per round

  for (let i = 0; i < numEvents; i++) {
    const template = NEWS_TEMPLATES[Math.floor(rng() * NEWS_TEMPLATES.length)];
    const card = market[Math.floor(rng() * market.length)];
    const impact: Record<string, number> = {};

    if (template.type === 'neutral') {
      // Market-wide event
      market.forEach(c => {
        impact[c.slug] = template.mult + (rng() - 0.5) * 0.04;
      });
    } else {
      // Single-player event
      impact[card.slug] = template.mult;
      // Small spillover to same-sport cards
      market.filter(c => c.sport === card.sport && c.slug !== card.slug).forEach(c => {
        impact[c.slug] = 1 + (template.mult - 1) * 0.1 * (rng() * 0.5 + 0.5);
      });
    }

    events.push({
      headline: template.text.replace('{player}', card.player),
      impact,
      type: template.type,
    });
  }

  return events;
}

type Phase = 'playing' | 'news' | 'gameover';

export default function MarketSimClient() {
  const [seed] = useState(() => Date.now());
  const [market, setMarket] = useState<MarketCard[]>(() => buildMarket(Date.now()));
  const [cash, setCash] = useState(STARTING_CASH);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState<Phase>('playing');
  const [news, setNews] = useState<NewsEvent[]>([]);
  const [highScore, setHighScore] = useState(0);
  const [sortBy, setSortBy] = useState<'price' | 'change'>('price');

  useEffect(() => {
    const stored = localStorage.getItem('cardvault-market-sim-high');
    if (stored) setHighScore(parseInt(stored));
  }, []);

  const holdingsValue = useMemo(() => {
    return holdings.reduce((sum, h) => {
      const card = market.find(c => c.slug === h.slug);
      return sum + (card ? card.currentPrice * h.qty : 0);
    }, 0);
  }, [holdings, market]);

  const totalValue = cash + holdingsValue;
  const marketReturn = useMemo(() => {
    const avgReturn = market.reduce((s, c) => s + c.currentPrice / c.basePrice, 0) / market.length;
    return avgReturn;
  }, [market]);

  const buy = useCallback((slug: string) => {
    const card = market.find(c => c.slug === slug);
    if (!card || cash < card.currentPrice) return;
    setCash(c => c - card.currentPrice);
    setHoldings(prev => {
      const existing = prev.find(h => h.slug === slug);
      if (existing) {
        return prev.map(h => h.slug === slug
          ? { ...h, qty: h.qty + 1, avgCost: (h.avgCost * h.qty + card.currentPrice) / (h.qty + 1) }
          : h
        );
      }
      return [...prev, { slug, qty: 1, avgCost: card.currentPrice }];
    });
  }, [market, cash]);

  const sell = useCallback((slug: string) => {
    const card = market.find(c => c.slug === slug);
    const holding = holdings.find(h => h.slug === slug);
    if (!card || !holding || holding.qty <= 0) return;
    setCash(c => c + card.currentPrice);
    setHoldings(prev => {
      if (holding.qty === 1) return prev.filter(h => h.slug !== slug);
      return prev.map(h => h.slug === slug ? { ...h, qty: h.qty - 1 } : h);
    });
  }, [market, holdings]);

  const advanceRound = useCallback(() => {
    if (round >= TOTAL_ROUNDS) {
      setPhase('gameover');
      if (totalValue > highScore) {
        setHighScore(Math.round(totalValue));
        localStorage.setItem('cardvault-market-sim-high', Math.round(totalValue).toString());
      }
      return;
    }

    const events = generateNews(market, round, seed);
    setNews(events);
    setPhase('news');

    // Apply price changes
    setMarket(prev => prev.map(card => {
      let multiplier = 1;
      // Random walk
      multiplier += (Math.random() - 0.5) * 0.06;
      // Apply news events
      events.forEach(event => {
        if (event.impact[card.slug]) {
          multiplier *= event.impact[card.slug];
        }
      });
      const newPrice = Math.max(5, Math.round(card.currentPrice * multiplier));
      return {
        ...card,
        currentPrice: newPrice,
        priceHistory: [...card.priceHistory, newPrice],
      };
    }));

    setRound(r => r + 1);
  }, [round, market, seed, totalValue, highScore]);

  const continueFromNews = useCallback(() => {
    setPhase('playing');
  }, []);

  const restart = useCallback(() => {
    const newMarket = buildMarket(Date.now());
    setMarket(newMarket);
    setCash(STARTING_CASH);
    setHoldings([]);
    setRound(1);
    setPhase('playing');
    setNews([]);
  }, []);

  const sortedMarket = useMemo(() => {
    if (sortBy === 'change') {
      return [...market].sort((a, b) => (b.currentPrice / b.basePrice) - (a.currentPrice / a.basePrice));
    }
    return [...market].sort((a, b) => b.currentPrice - a.currentPrice);
  }, [market, sortBy]);

  // Game Over
  if (phase === 'gameover') {
    const roi = ((totalValue - STARTING_CASH) / STARTING_CASH * 100);
    const marketRoi = ((marketReturn - 1) * 100);
    const beat = roi > marketRoi;

    return (
      <div className="space-y-6">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 text-center">
          <div className="text-xs text-gray-500 uppercase mb-2">Final Portfolio Value</div>
          <div className={`text-5xl font-bold mb-2 ${totalValue >= STARTING_CASH ? 'text-emerald-400' : 'text-red-400'}`}>
            {fmt(totalValue)}
          </div>
          <div className={`text-lg ${roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {roi >= 0 ? '+' : ''}{roi.toFixed(1)}% return
          </div>
          <div className="mt-4 text-sm text-gray-400">
            Market benchmark: <span className={marketRoi >= 0 ? 'text-emerald-400' : 'text-red-400'}>{marketRoi >= 0 ? '+' : ''}{marketRoi.toFixed(1)}%</span>
          </div>
          <div className={`mt-2 text-lg font-bold ${beat ? 'text-yellow-400' : 'text-gray-500'}`}>
            {beat ? 'YOU BEAT THE MARKET!' : 'Market wins this time.'}
          </div>
          {totalValue > highScore && totalValue > STARTING_CASH && (
            <div className="mt-2 text-yellow-400 font-bold text-sm">NEW HIGH SCORE!</div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-white">{fmt(cash)}</div>
            <div className="text-xs text-gray-500">Cash</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-white">{fmt(holdingsValue)}</div>
            <div className="text-xs text-gray-500">Holdings</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-white">{holdings.reduce((s, h) => s + h.qty, 0)}</div>
            <div className="text-xs text-gray-500">Cards Held</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-white">{TOTAL_ROUNDS}</div>
            <div className="text-xs text-gray-500">Rounds Played</div>
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <button onClick={restart} className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors">
            Play Again
          </button>
          <button
            onClick={() => {
              const text = `I turned $10,000 into ${fmt(totalValue)} (${roi >= 0 ? '+' : ''}${roi.toFixed(1)}%) in CardVault's Card Market Simulator!\n\n${beat ? 'Beat the market!' : 'Market won this time.'}\n\nPlay: cardvault-two.vercel.app/card-market-simulator`;
              navigator.clipboard?.writeText(text);
            }}
            className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl transition-colors"
          >
            Share
          </button>
        </div>
      </div>
    );
  }

  // News Phase
  if (phase === 'news') {
    return (
      <div className="space-y-6">
        <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-yellow-400 mb-4">Market News — Week {round}</h3>
          <div className="space-y-3">
            {news.map((event, i) => (
              <div key={i} className={`p-3 rounded-lg border ${
                event.type === 'positive' ? 'bg-emerald-900/20 border-emerald-700/50' :
                event.type === 'negative' ? 'bg-red-900/20 border-red-700/50' :
                'bg-gray-900/20 border-gray-700/50'
              }`}>
                <span className={`text-sm font-medium ${
                  event.type === 'positive' ? 'text-emerald-400' :
                  event.type === 'negative' ? 'text-red-400' :
                  'text-gray-400'
                }`}>
                  {event.type === 'positive' ? '\u2191' : event.type === 'negative' ? '\u2193' : '\u2194'} {event.headline}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="text-center">
          <button
            onClick={continueFromNews}
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors"
          >
            Continue Trading
          </button>
        </div>
      </div>
    );
  }

  // Playing Phase
  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-gray-500">Cash</div>
            <div className="text-lg font-bold text-white">{fmt(cash)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Holdings</div>
            <div className="text-lg font-bold text-white">{fmt(holdingsValue)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Total Value</div>
            <div className={`text-lg font-bold ${totalValue >= STARTING_CASH ? 'text-emerald-400' : 'text-red-400'}`}>
              {fmt(totalValue)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Week {round}/{TOTAL_ROUNDS}</div>
            <div className={`text-lg font-bold ${totalValue >= STARTING_CASH ? 'text-emerald-400' : 'text-red-400'}`}>
              {((totalValue - STARTING_CASH) / STARTING_CASH * 100) >= 0 ? '+' : ''}
              {((totalValue - STARTING_CASH) / STARTING_CASH * 100).toFixed(1)}%
            </div>
          </div>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-1.5 mt-3">
          <div className="h-1.5 rounded-full bg-emerald-500 transition-all" style={{ width: `${(round / TOTAL_ROUNDS) * 100}%` }} />
        </div>
      </div>

      {/* Market Table */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <h3 className="text-sm font-bold text-white">Market ({MARKET_SIZE} cards)</h3>
          <div className="flex gap-2">
            <button onClick={() => setSortBy('price')} className={`text-xs px-2 py-1 rounded ${sortBy === 'price' ? 'bg-emerald-600 text-white' : 'text-gray-500'}`}>Price</button>
            <button onClick={() => setSortBy('change')} className={`text-xs px-2 py-1 rounded ${sortBy === 'change' ? 'bg-emerald-600 text-white' : 'text-gray-500'}`}>Change</button>
          </div>
        </div>
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-900">
              <tr className="text-left text-gray-500 border-b border-gray-700">
                <th className="px-4 py-2 font-medium">Card</th>
                <th className="px-4 py-2 font-medium text-right">Price</th>
                <th className="px-4 py-2 font-medium text-right">Chg</th>
                <th className="px-4 py-2 font-medium text-right">Held</th>
                <th className="px-4 py-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedMarket.map(card => {
                const holding = holdings.find(h => h.slug === card.slug);
                const change = card.currentPrice / card.basePrice;
                const canBuy = cash >= card.currentPrice;
                const canSell = holding && holding.qty > 0;

                return (
                  <tr key={card.slug} className="border-b border-gray-800 hover:bg-gray-700/30">
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{SPORT_EMOJI[card.sport] || '🃏'}</span>
                        <div className="min-w-0">
                          <div className="text-xs font-medium text-white truncate max-w-[200px]">{card.player}</div>
                          <div className="text-[10px] text-gray-600 truncate max-w-[200px]">{card.name}</div>
                        </div>
                        {card.rookie && <span className="text-[9px] px-1 py-0.5 bg-yellow-500/20 text-yellow-400 rounded">RC</span>}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-right font-medium text-white">{fmt(card.currentPrice)}</td>
                    <td className={`px-4 py-2 text-right text-xs font-bold ${change >= 1 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {fmtPct(change)}
                    </td>
                    <td className="px-4 py-2 text-right text-gray-400">
                      {holding ? holding.qty : '—'}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex gap-1 justify-end">
                        <button
                          onClick={() => buy(card.slug)}
                          disabled={!canBuy}
                          className={`px-2 py-1 text-xs rounded font-bold ${canBuy ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-gray-700 text-gray-600 cursor-not-allowed'}`}
                        >
                          Buy
                        </button>
                        {canSell && (
                          <button
                            onClick={() => sell(card.slug)}
                            className="px-2 py-1 text-xs rounded font-bold bg-red-600 hover:bg-red-500 text-white"
                          >
                            Sell
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Advance Round */}
      <div className="text-center">
        <button
          onClick={advanceRound}
          className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors"
        >
          {round >= TOTAL_ROUNDS ? 'End Game' : `Advance to Week ${round + 1}`}
        </button>
      </div>
    </div>
  );
}
