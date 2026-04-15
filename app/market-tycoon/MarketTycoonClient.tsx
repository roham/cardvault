'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';

interface MarketCard {
  id: number;
  player: string;
  sport: string;
  year: string;
  set: string;
  basePrice: number;
  currentPrice: number;
  priceHistory: number[];
  trend: 'up' | 'down' | 'stable';
  hype: number; // 0-100, affects volatility
}

interface Holding {
  cardId: number;
  quantity: number;
  avgCost: number;
}

interface MarketEvent {
  day: number;
  title: string;
  description: string;
  affectedCards: number[];
  priceImpact: number; // multiplier, e.g. 1.3 = +30%
  type: 'positive' | 'negative' | 'neutral';
}

const MARKET_CARDS: Omit<MarketCard, 'currentPrice' | 'priceHistory' | 'trend'>[] = [
  { id: 1, player: 'Victor Wembanyama', sport: 'Basketball', year: '2023', set: 'Prizm RC', basePrice: 650, hype: 90 },
  { id: 2, player: 'Gunnar Henderson', sport: 'Baseball', year: '2023', set: 'Topps Chrome RC', basePrice: 120, hype: 70 },
  { id: 3, player: 'Caleb Williams', sport: 'Football', year: '2024', set: 'Prizm RC', basePrice: 200, hype: 80 },
  { id: 4, player: 'Connor Bedard', sport: 'Hockey', year: '2023', set: 'Upper Deck YG RC', basePrice: 350, hype: 75 },
  { id: 5, player: 'Jayson Tatum', sport: 'Basketball', year: '2017', set: 'Prizm RC PSA 10', basePrice: 1200, hype: 60 },
  { id: 6, player: 'Paul Skenes', sport: 'Baseball', year: '2024', set: 'Bowman Chrome', basePrice: 180, hype: 85 },
  { id: 7, player: 'Caitlin Clark', sport: 'Basketball', year: '2024', set: 'Prizm RC', basePrice: 90, hype: 95 },
  { id: 8, player: 'Travis Hunter', sport: 'Football', year: '2025', set: 'Bowman University', basePrice: 150, hype: 88 },
];

const EVENTS: Omit<MarketEvent, 'day'>[] = [
  { title: 'MVP Award Announcement', description: 'A major award drives collector demand sky-high', affectedCards: [1, 5], priceImpact: 1.25, type: 'positive' },
  { title: 'Season-Ending Injury', description: 'A star player goes down for the season', affectedCards: [3, 4], priceImpact: 0.75, type: 'negative' },
  { title: 'Viral Social Media Moment', description: 'A highlight clip gets 50M views overnight', affectedCards: [7, 1], priceImpact: 1.35, type: 'positive' },
  { title: 'PSA 10 Pop Explosion', description: 'Massive grading submissions flood the market', affectedCards: [2, 6], priceImpact: 0.82, type: 'negative' },
  { title: 'Championship Ring', description: 'A player wins it all — cards surge', affectedCards: [5, 4], priceImpact: 1.40, type: 'positive' },
  { title: 'Trade Deadline Blockbuster', description: 'Star moves to a major market team', affectedCards: [2, 8], priceImpact: 1.20, type: 'positive' },
  { title: 'Rookie of the Year Buzz', description: 'Award front-runner hype lifts all rookies', affectedCards: [1, 3, 6, 8], priceImpact: 1.15, type: 'positive' },
  { title: 'Market Correction', description: 'Broad sell-off hits all cards', affectedCards: [1, 2, 3, 4, 5, 6, 7, 8], priceImpact: 0.90, type: 'negative' },
  { title: 'Heritage Auction Record', description: 'Record sale creates FOMO buying', affectedCards: [5, 7], priceImpact: 1.30, type: 'positive' },
  { title: 'Off-Field Controversy', description: 'Bad press tanks a player\'s card values', affectedCards: [3, 8], priceImpact: 0.70, type: 'negative' },
  { title: 'All-Star Selection', description: 'All-Star nods boost mainstream attention', affectedCards: [2, 6, 7], priceImpact: 1.18, type: 'positive' },
  { title: 'Hobby Bull Run', description: 'Overall market sentiment turns bullish', affectedCards: [1, 2, 3, 4, 5, 6, 7, 8], priceImpact: 1.10, type: 'positive' },
];

function hashDay(seed: number, day: number, cardId: number): number {
  let h = seed * 31 + day * 17 + cardId * 7;
  h = ((h << 13) ^ h) >>> 0;
  h = (h * 1597 + 51749) >>> 0;
  return (h % 1000) / 1000; // 0-1
}

function fmt(n: number): string {
  if (n >= 10000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function pctChange(current: number, prev: number): string {
  const change = ((current - prev) / prev) * 100;
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}%`;
}

function pctColor(current: number, prev: number): string {
  if (current > prev * 1.01) return 'text-emerald-400';
  if (current < prev * 0.99) return 'text-red-400';
  return 'text-gray-400';
}

const TOTAL_DAYS = 20;
const STARTING_CASH = 10000;

export default function MarketTycoonClient() {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentDay, setCurrentDay] = useState(0);
  const [cash, setCash] = useState(STARTING_CASH);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [cards, setCards] = useState<MarketCard[]>([]);
  const [events, setEvents] = useState<MarketEvent[]>([]);
  const [activeEvent, setActiveEvent] = useState<MarketEvent | null>(null);
  const [gameSeed, setGameSeed] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [buyQty, setBuyQty] = useState<Record<number, number>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cv-tycoon-high');
      if (saved) setHighScore(parseInt(saved));
    } catch { /* empty */ }
  }, []);

  const startGame = useCallback(() => {
    const seed = Date.now();
    setGameSeed(seed);
    setCurrentDay(1);
    setCash(STARTING_CASH);
    setHoldings([]);
    setGameOver(false);
    setActiveEvent(null);
    setBuyQty({});

    // Initialize cards with base prices
    const initCards: MarketCard[] = MARKET_CARDS.map(c => ({
      ...c,
      currentPrice: c.basePrice,
      priceHistory: [c.basePrice],
      trend: 'stable' as const,
    }));
    setCards(initCards);

    // Pre-generate events for specific days
    const gameEvents: MarketEvent[] = [];
    const eventDays = [3, 6, 9, 12, 15, 18];
    eventDays.forEach((day, i) => {
      const eventIdx = (seed + i * 13) % EVENTS.length;
      gameEvents.push({ ...EVENTS[eventIdx], day });
    });
    setEvents(gameEvents);
    setGameStarted(true);
  }, []);

  const advanceDay = useCallback(() => {
    if (currentDay >= TOTAL_DAYS) {
      setGameOver(true);
      return;
    }

    const nextDay = currentDay + 1;
    const dayEvent = events.find(e => e.day === nextDay);
    setActiveEvent(dayEvent || null);

    // Update prices
    setCards(prev => prev.map(card => {
      const rand = hashDay(gameSeed, nextDay, card.id);
      const volatility = 0.03 + (card.hype / 1000); // 3-13% daily volatility
      let change = (rand - 0.5) * 2 * volatility; // random movement

      // Apply event impact
      if (dayEvent && dayEvent.affectedCards.includes(card.id)) {
        change += (dayEvent.priceImpact - 1);
      }

      // Mean reversion for extreme moves
      const deviation = (card.currentPrice - card.basePrice) / card.basePrice;
      change -= deviation * 0.02;

      const newPrice = Math.max(card.basePrice * 0.3, card.currentPrice * (1 + change));
      const rounded = Math.round(newPrice);
      const trend: 'up' | 'down' | 'stable' = rounded > card.currentPrice ? 'up' : rounded < card.currentPrice ? 'down' : 'stable';

      return {
        ...card,
        currentPrice: rounded,
        priceHistory: [...card.priceHistory, rounded],
        trend,
      };
    }));

    setCurrentDay(nextDay);
    setBuyQty({});
  }, [currentDay, events, gameSeed]);

  const buyCard = useCallback((cardId: number, qty: number) => {
    const card = cards.find(c => c.id === cardId);
    if (!card || qty <= 0) return;
    const cost = card.currentPrice * qty;
    if (cost > cash) return;

    setCash(prev => prev - cost);
    setHoldings(prev => {
      const existing = prev.find(h => h.cardId === cardId);
      if (existing) {
        const totalCost = existing.avgCost * existing.quantity + cost;
        const totalQty = existing.quantity + qty;
        return prev.map(h => h.cardId === cardId ? { ...h, quantity: totalQty, avgCost: totalCost / totalQty } : h);
      }
      return [...prev, { cardId, quantity: qty, avgCost: card.currentPrice }];
    });
  }, [cards, cash]);

  const sellCard = useCallback((cardId: number, qty: number) => {
    const card = cards.find(c => c.id === cardId);
    const holding = holdings.find(h => h.cardId === cardId);
    if (!card || !holding || qty <= 0 || qty > holding.quantity) return;

    const revenue = card.currentPrice * qty;
    setCash(prev => prev + revenue);
    setHoldings(prev => {
      if (qty >= holding.quantity) return prev.filter(h => h.cardId !== cardId);
      return prev.map(h => h.cardId === cardId ? { ...h, quantity: h.quantity - qty } : h);
    });
  }, [cards, holdings]);

  const portfolioValue = useMemo(() => {
    return holdings.reduce((sum, h) => {
      const card = cards.find(c => c.id === h.cardId);
      return sum + (card ? card.currentPrice * h.quantity : 0);
    }, 0);
  }, [holdings, cards]);

  const totalValue = cash + portfolioValue;

  const totalPnL = totalValue - STARTING_CASH;

  // End game scoring
  useEffect(() => {
    if (gameOver && totalValue > highScore) {
      setHighScore(totalValue);
      try { localStorage.setItem('cv-tycoon-high', totalValue.toString()); } catch { /* empty */ }
    }
  }, [gameOver, totalValue, highScore]);

  if (!gameStarted || gameOver) {
    const returnPct = ((totalValue - STARTING_CASH) / STARTING_CASH * 100);
    const rating = returnPct >= 30 ? 'S' : returnPct >= 20 ? 'A' : returnPct >= 10 ? 'B' : returnPct >= 0 ? 'C' : 'D';
    const ratingColor = rating === 'S' ? 'text-yellow-400' : rating === 'A' ? 'text-emerald-400' : rating === 'B' ? 'text-green-400' : rating === 'C' ? 'text-orange-400' : 'text-red-400';

    return (
      <div className="space-y-6">
        {gameOver && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 text-center">
            <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">Game Over — 20 Market Days</p>
            <div className={`text-6xl font-black mb-2 ${totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {fmt(totalValue)}
            </div>
            <p className="text-gray-300 text-lg">
              {totalPnL >= 0 ? 'Profit' : 'Loss'}: <span className={totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}>{fmt(Math.abs(totalPnL))} ({returnPct >= 0 ? '+' : ''}{returnPct.toFixed(1)}%)</span>
            </p>
            <div className={`text-4xl font-black mt-3 ${ratingColor}`}>Rating: {rating}</div>
            {highScore > 0 && <p className="text-xs text-gray-500 mt-2">High Score: {fmt(highScore)}</p>}

            {holdings.length > 0 && (
              <div className="mt-6 text-left">
                <h3 className="text-sm text-gray-400 mb-2 font-bold">Final Portfolio</h3>
                {holdings.map(h => {
                  const card = cards.find(c => c.id === h.cardId);
                  if (!card) return null;
                  const value = card.currentPrice * h.quantity;
                  const pnl = value - h.avgCost * h.quantity;
                  return (
                    <div key={h.cardId} className="flex items-center justify-between py-1.5 border-b border-gray-800">
                      <span className="text-sm text-white">{card.player} x{h.quantity}</span>
                      <div className="text-right">
                        <span className="text-sm text-white font-bold">{fmt(value)}</span>
                        <span className={`text-xs ml-2 ${pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {pnl >= 0 ? '+' : ''}{fmt(pnl)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">{gameOver ? 'Play Again' : 'Card Market Tycoon'}</h2>
          <p className="text-gray-400 text-sm mb-4">
            Start with $10,000. Buy and sell cards over 20 market days as prices fluctuate
            from events, hype, and market forces. Maximize your total portfolio value.
          </p>
          <div className="grid grid-cols-3 gap-3 mb-6 text-center">
            <div className="bg-gray-900/60 rounded-lg p-3">
              <div className="text-emerald-400 font-bold">$10,000</div>
              <div className="text-xs text-gray-500">Starting Cash</div>
            </div>
            <div className="bg-gray-900/60 rounded-lg p-3">
              <div className="text-white font-bold">20 Days</div>
              <div className="text-xs text-gray-500">Market Days</div>
            </div>
            <div className="bg-gray-900/60 rounded-lg p-3">
              <div className="text-yellow-400 font-bold">8 Cards</div>
              <div className="text-xs text-gray-500">On the Market</div>
            </div>
          </div>
          <button onClick={startGame}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-lg transition-colors">
            {gameOver ? 'New Game' : 'Start Trading'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Bar */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div>
            <div className="text-white text-xs mb-0.5">Day</div>
            <div className="text-emerald-400 font-bold text-lg">{currentDay}/{TOTAL_DAYS}</div>
          </div>
          <div>
            <div className="text-white text-xs mb-0.5">Cash</div>
            <div className="text-white font-bold text-lg">{fmt(cash)}</div>
          </div>
          <div>
            <div className="text-white text-xs mb-0.5">Portfolio</div>
            <div className="text-white font-bold text-lg">{fmt(portfolioValue)}</div>
          </div>
          <div>
            <div className="text-white text-xs mb-0.5">Total P&L</div>
            <div className={`font-bold text-lg ${totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {totalPnL >= 0 ? '+' : ''}{fmt(totalPnL)}
            </div>
          </div>
        </div>
      </div>

      {/* Event Banner */}
      {activeEvent && (
        <div className={`border rounded-xl p-4 ${
          activeEvent.type === 'positive' ? 'bg-emerald-900/20 border-emerald-800/40' :
          activeEvent.type === 'negative' ? 'bg-red-900/20 border-red-800/40' :
          'bg-blue-900/20 border-blue-800/40'
        }`}>
          <div className="flex items-center gap-2 mb-1">
            <span>{activeEvent.type === 'positive' ? '📈' : activeEvent.type === 'negative' ? '📉' : '📰'}</span>
            <span className="text-white font-bold text-sm">{activeEvent.title}</span>
          </div>
          <p className="text-xs text-gray-400">{activeEvent.description}</p>
        </div>
      )}

      {/* Market Cards */}
      <div className="space-y-2">
        {cards.map(card => {
          const holding = holdings.find(h => h.cardId === card.id);
          const prevPrice = card.priceHistory.length > 1 ? card.priceHistory[card.priceHistory.length - 2] : card.basePrice;
          const maxBuy = Math.floor(cash / card.currentPrice);
          const qty = buyQty[card.id] || 1;

          return (
            <div key={card.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-white font-bold">{card.player}</span>
                  <span className="text-gray-500 text-xs ml-2">{card.year} {card.set}</span>
                  <span className="text-gray-600 text-xs ml-1">({card.sport})</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold">{fmt(card.currentPrice)}</div>
                  <div className={`text-xs ${pctColor(card.currentPrice, prevPrice)}`}>
                    {pctChange(card.currentPrice, prevPrice)}
                  </div>
                </div>
              </div>

              {/* Mini sparkline */}
              <div className="flex items-end gap-px h-6 mb-2">
                {card.priceHistory.slice(-10).map((p, i, arr) => {
                  const min = Math.min(...arr);
                  const max = Math.max(...arr);
                  const range = max - min || 1;
                  const h = ((p - min) / range) * 100;
                  const isLast = i === arr.length - 1;
                  return (
                    <div
                      key={i}
                      className={`flex-1 rounded-t ${isLast ? 'bg-emerald-500' : p >= (arr[i - 1] || p) ? 'bg-emerald-900' : 'bg-red-900'}`}
                      style={{ height: `${Math.max(10, h)}%` }}
                    />
                  );
                })}
              </div>

              {/* Holding info */}
              {holding && (
                <div className="text-xs text-gray-400 mb-2">
                  Holding: {holding.quantity}x @ {fmt(holding.avgCost)} avg | Value: {fmt(card.currentPrice * holding.quantity)}
                  <span className={card.currentPrice >= holding.avgCost ? ' text-emerald-400' : ' text-red-400'}>
                    {' '}({pctChange(card.currentPrice, holding.avgCost)})
                  </span>
                </div>
              )}

              {/* Buy/Sell Controls */}
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={maxBuy || 1}
                  value={qty}
                  onChange={e => setBuyQty(prev => ({ ...prev, [card.id]: Math.max(1, parseInt(e.target.value) || 1) }))}
                  className="w-16 bg-gray-900 border border-gray-600 rounded px-2 py-1 text-white text-sm text-center focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={() => buyCard(card.id, qty)}
                  disabled={card.currentPrice * qty > cash}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    card.currentPrice * qty <= cash
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Buy ({fmt(card.currentPrice * qty)})
                </button>
                {holding && holding.quantity > 0 && (
                  <button
                    onClick={() => sellCard(card.id, Math.min(qty, holding.quantity))}
                    className="px-4 py-1.5 bg-red-900/60 hover:bg-red-800/60 border border-red-800/50 text-red-400 rounded-lg text-xs font-bold transition-colors"
                  >
                    Sell {Math.min(qty, holding.quantity)} ({fmt(card.currentPrice * Math.min(qty, holding.quantity))})
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Advance Day Button */}
      <button onClick={advanceDay}
        className={`w-full py-3 rounded-xl font-bold text-lg transition-colors ${
          currentDay >= TOTAL_DAYS
            ? 'bg-yellow-600 hover:bg-yellow-500 text-white'
            : 'bg-blue-600 hover:bg-blue-500 text-white'
        }`}>
        {currentDay >= TOTAL_DAYS ? 'End Game — See Results' : `Advance to Day ${currentDay + 1} →`}
      </button>
    </div>
  );
}
