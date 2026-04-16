'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

// --- Types ---
type Phase = 'setup' | 'trading' | 'results';
type SportFilter = 'all' | 'baseball' | 'basketball' | 'football' | 'hockey';

interface MarketCard {
  slug: string;
  player: string;
  set: string;
  year: number;
  sport: string;
  fairValue: number;
  bidPrice: number;
  askPrice: number;
  inventory: number;
}

interface TradeEvent {
  id: number;
  type: 'buy' | 'sell';
  cardSlug: string;
  player: string;
  price: number;
  trader: string;
  filled: boolean;
  reason?: string;
  timestamp: Date;
}

interface MakerStats {
  gamesPlayed: number;
  totalProfit: number;
  bestProfit: number;
  totalTrades: number;
  bestGrade: string;
}

// --- Helpers ---
function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function dateHash(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function parseValue(v: string): number {
  const m = v.match(/\$([0-9,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 5;
}

function formatMoney(n: number): string {
  return n < 0 ? `-$${Math.abs(n).toLocaleString()}` : `$${n.toLocaleString()}`;
}

function getGrade(profit: number): { grade: string; color: string } {
  if (profit >= 500) return { grade: 'S', color: 'text-yellow-400' };
  if (profit >= 300) return { grade: 'A', color: 'text-emerald-400' };
  if (profit >= 150) return { grade: 'B', color: 'text-sky-400' };
  if (profit >= 50) return { grade: 'C', color: 'text-orange-400' };
  if (profit >= 0) return { grade: 'D', color: 'text-red-400' };
  return { grade: 'F', color: 'text-red-600' };
}

const sportLabels: Record<string, string> = { baseball: 'MLB', basketball: 'NBA', football: 'NFL', hockey: 'NHL' };

const traderNames = [
  'FlipKing', 'VintageVault', 'RookieHunter', 'GradeChaser', 'PackRipper',
  'CardMom_Lisa', 'InvestorKai', 'DealFinder_Jess', 'SlabDaddy', 'BudgetBob',
  'ShowFloorPete', 'eBay_Sniper', 'NightFlip', 'SetBuilder_Dan', 'ProspectWatch',
];

const STATS_KEY = 'cardvault_market_maker_stats';

function loadStats(): MakerStats {
  if (typeof window === 'undefined') return { gamesPlayed: 0, totalProfit: 0, bestProfit: 0, totalTrades: 0, bestGrade: '—' };
  try {
    const raw = localStorage.getItem(STATS_KEY);
    return raw ? JSON.parse(raw) : { gamesPlayed: 0, totalProfit: 0, bestProfit: 0, totalTrades: 0, bestGrade: '—' };
  } catch { return { gamesPlayed: 0, totalProfit: 0, bestProfit: 0, totalTrades: 0, bestGrade: '—' }; }
}

function saveStats(stats: MakerStats) {
  try { localStorage.setItem(STATS_KEY, JSON.stringify(stats)); } catch {}
}

export default function MarketMakerClient() {
  const [mode, setMode] = useState<'daily' | 'random'>('daily');
  const [sport, setSport] = useState<SportFilter>('all');
  const [randomSeed, setRandomSeed] = useState(0);
  const [phase, setPhase] = useState<Phase>('setup');
  const [marketCards, setMarketCards] = useState<MarketCard[]>([]);
  const [trades, setTrades] = useState<TradeEvent[]>([]);
  const [realizedPnL, setRealizedPnL] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [tradeCount, setTradeCount] = useState(0);
  const [stats, setStats] = useState<MakerStats>({ gamesPlayed: 0, totalProfit: 0, bestProfit: 0, totalTrades: 0, bestGrade: '—' });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tradeRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const seed = mode === 'daily' ? dateHash() : randomSeed;

  useEffect(() => { setStats(loadStats()); }, []);

  // Select 5 cards for market making
  const selectedCards = useMemo(() => {
    const rng = seededRng(seed + 42);
    let pool = sportsCards.filter(c => parseValue(c.estimatedValueRaw) >= 10 && parseValue(c.estimatedValueRaw) <= 2000);
    if (sport !== 'all') pool = pool.filter(c => c.sport === sport);
    if (pool.length < 5) pool = sportsCards.filter(c => parseValue(c.estimatedValueRaw) >= 10);

    const shuffled = [...pool].sort(() => rng() - 0.5);
    return shuffled.slice(0, 5).map(card => {
      const fv = parseValue(card.estimatedValueRaw);
      return {
        slug: card.slug,
        player: card.player,
        set: card.set,
        year: Number(card.year),
        sport: card.sport,
        fairValue: fv,
        bidPrice: Math.round(fv * 0.75),
        askPrice: Math.round(fv * 1.25),
        inventory: 0,
      };
    });
  }, [seed, sport]);

  // Initialize market cards on setup
  useEffect(() => {
    if (phase === 'setup') {
      setMarketCards(selectedCards);
      setTrades([]);
      setRealizedPnL(0);
      setTimeLeft(120);
      setTradeCount(0);
    }
  }, [phase, selectedCards]);

  // Timer
  useEffect(() => {
    if (phase !== 'trading') return;
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setPhase('results');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [phase]);

  // AI Trader simulation
  useEffect(() => {
    if (phase !== 'trading') return;
    const rng = seededRng(seed + Date.now());

    tradeRef.current = setInterval(() => {
      setMarketCards(prev => {
        const cards = [...prev];
        const idx = Math.floor(rng() * cards.length);
        const card = { ...cards[idx] };
        const isBuy = rng() > 0.45; // slightly more buyers
        const traderName = traderNames[Math.floor(rng() * traderNames.length)];

        // Trader's willingness to trade depends on price vs fair value
        const spreadPct = (card.askPrice - card.bidPrice) / card.fairValue;

        if (isBuy) {
          // Buyer wants to buy from you (you sell at ask price)
          // Buyer checks if your ask is reasonable (within 30% of fair value)
          const willBuy = card.askPrice <= card.fairValue * 1.3 && rng() > spreadPct;
          if (willBuy && card.inventory > 0) {
            card.inventory--;
            const profit = card.askPrice - card.fairValue; // simplified: profit vs fair value
            setRealizedPnL(p => p + (card.askPrice - card.bidPrice) * 0.5); // approximate half-spread profit
            setTradeCount(c => {
              const newCount = c + 1;
              if (newCount >= 20) setTimeout(() => setPhase('results'), 100);
              return newCount;
            });
            setTrades(t => [...t, {
              id: Date.now() + rng() * 1000,
              type: 'sell',
              cardSlug: card.slug,
              player: card.player,
              price: card.askPrice,
              trader: traderName,
              filled: true,
              timestamp: new Date(),
            }]);
          } else if (!willBuy) {
            setTrades(t => [...t, {
              id: Date.now() + rng() * 1000,
              type: 'sell',
              cardSlug: card.slug,
              player: card.player,
              price: card.askPrice,
              trader: traderName,
              filled: false,
              reason: card.askPrice > card.fairValue * 1.3 ? 'Ask too high' : 'Spread too wide',
              timestamp: new Date(),
            }]);
          } else {
            setTrades(t => [...t, {
              id: Date.now() + rng() * 1000,
              type: 'sell',
              cardSlug: card.slug,
              player: card.player,
              price: card.askPrice,
              trader: traderName,
              filled: false,
              reason: 'No inventory',
              timestamp: new Date(),
            }]);
          }
        } else {
          // Seller wants to sell to you (you buy at bid price)
          const willSell = card.bidPrice >= card.fairValue * 0.7 && rng() > spreadPct;
          if (willSell && card.inventory < 5) {
            card.inventory++;
            setRealizedPnL(p => p + (card.fairValue - card.bidPrice) * 0.3); // buying below fair value
            setTradeCount(c => {
              const newCount = c + 1;
              if (newCount >= 20) setTimeout(() => setPhase('results'), 100);
              return newCount;
            });
            setTrades(t => [...t, {
              id: Date.now() + rng() * 1000,
              type: 'buy',
              cardSlug: card.slug,
              player: card.player,
              price: card.bidPrice,
              trader: traderName,
              filled: true,
              timestamp: new Date(),
            }]);
          } else if (!willSell) {
            setTrades(t => [...t, {
              id: Date.now() + rng() * 1000,
              type: 'buy',
              cardSlug: card.slug,
              player: card.player,
              price: card.bidPrice,
              trader: traderName,
              filled: false,
              reason: card.bidPrice < card.fairValue * 0.7 ? 'Bid too low' : 'Spread too wide',
              timestamp: new Date(),
            }]);
          } else {
            setTrades(t => [...t, {
              id: Date.now() + rng() * 1000,
              type: 'buy',
              cardSlug: card.slug,
              player: card.player,
              price: card.bidPrice,
              trader: traderName,
              filled: false,
              reason: 'Inventory full',
              timestamp: new Date(),
            }]);
          }
        }
        cards[idx] = card;
        return cards;
      });
    }, 3000 + Math.floor(Math.random() * 2000));

    return () => { if (tradeRef.current) clearInterval(tradeRef.current); };
  }, [phase, seed]);

  // Clean up on results
  useEffect(() => {
    if (phase === 'results') {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (tradeRef.current) clearInterval(tradeRef.current);
    }
  }, [phase]);

  const inventoryValue = marketCards.reduce((sum, c) => sum + c.inventory * c.fairValue, 0);
  const totalProfit = Math.round(realizedPnL);
  const filledTrades = trades.filter(t => t.filled).length;
  const { grade, color: gradeColor } = getGrade(totalProfit);

  const updateBid = useCallback((idx: number, val: number) => {
    setMarketCards(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], bidPrice: Math.max(1, Math.min(val, next[idx].askPrice - 1)) };
      return next;
    });
  }, []);

  const updateAsk = useCallback((idx: number, val: number) => {
    setMarketCards(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], askPrice: Math.max(next[idx].bidPrice + 1, val) };
      return next;
    });
  }, []);

  const startTrading = useCallback(() => {
    setPhase('trading');
  }, []);

  const endSession = useCallback(() => {
    setPhase('results');
    const newStats = { ...stats };
    newStats.gamesPlayed++;
    newStats.totalProfit += totalProfit;
    newStats.totalTrades += filledTrades;
    if (totalProfit > newStats.bestProfit) {
      newStats.bestProfit = totalProfit;
      newStats.bestGrade = grade;
    }
    setStats(newStats);
    saveStats(newStats);
  }, [stats, totalProfit, filledTrades, grade]);

  const reset = useCallback((newMode?: 'daily' | 'random') => {
    if (newMode === 'random') {
      setMode('random');
      setRandomSeed(Date.now());
    } else if (newMode === 'daily') {
      setMode('daily');
    }
    setPhase('setup');
  }, []);

  const formatTimer = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 bg-gray-900/80 rounded-lg p-1">
          <button onClick={() => reset('daily')} className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${mode === 'daily' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'}`}>
            Daily
          </button>
          <button onClick={() => reset('random')} className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${mode === 'random' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'}`}>
            Random
          </button>
        </div>
        {phase === 'setup' && (
          <div className="flex gap-1 bg-gray-900/80 rounded-lg p-1">
            {(['all', 'baseball', 'basketball', 'football', 'hockey'] as const).map(s => (
              <button key={s} onClick={() => setSport(s)} className={`px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${sport === s ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                {s === 'all' ? 'All' : sportLabels[s]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-3 bg-gray-900/60 border border-gray-800 rounded-xl p-4 text-center">
        <div>
          <div className="text-lg font-bold text-emerald-400">{formatMoney(totalProfit)}</div>
          <div className="text-xs text-gray-500">P&L</div>
        </div>
        <div>
          <div className="text-lg font-bold text-sky-400">{filledTrades}/{tradeCount > filledTrades ? tradeCount : trades.length}</div>
          <div className="text-xs text-gray-500">Filled</div>
        </div>
        <div>
          <div className="text-lg font-bold text-amber-400">{formatMoney(inventoryValue)}</div>
          <div className="text-xs text-gray-500">Inventory</div>
        </div>
        <div>
          <div className="text-lg font-bold text-white">
            {phase === 'trading' ? formatTimer(timeLeft) : phase === 'results' ? 'CLOSED' : 'SETUP'}
          </div>
          <div className="text-xs text-gray-500">{phase === 'trading' ? 'Time Left' : 'Status'}</div>
        </div>
      </div>

      {/* SETUP PHASE */}
      {phase === 'setup' && (
        <>
          <div className="text-sm text-gray-400 mb-2">
            Set your bid (buy) and ask (sell) prices for each card. The fair market value is shown for reference. You start with 0 inventory.
          </div>
          <div className="space-y-3">
            {marketCards.map((card, i) => {
              const spread = card.askPrice - card.bidPrice;
              const spreadPct = ((spread / card.fairValue) * 100).toFixed(0);
              return (
                <div key={card.slug} className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <Link href={`/cards/${card.slug}`} className="font-medium text-white hover:text-emerald-400 transition-colors text-sm">
                        {card.player}
                      </Link>
                      <div className="text-xs text-gray-500">{card.year} {card.set} &middot; {sportLabels[card.sport] || card.sport}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Fair Value</div>
                      <div className="text-sm font-bold text-gray-300">{formatMoney(card.fairValue)}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-red-400 font-medium block mb-1">Bid (Buy At)</label>
                      <input
                        type="number"
                        value={card.bidPrice}
                        onChange={e => updateBid(i, parseInt(e.target.value) || 1)}
                        className="w-full bg-gray-800 border border-red-900/50 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-red-600"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-emerald-400 font-medium block mb-1">Ask (Sell At)</label>
                      <input
                        type="number"
                        value={card.askPrice}
                        onChange={e => updateAsk(i, parseInt(e.target.value) || card.bidPrice + 1)}
                        className="w-full bg-gray-800 border border-emerald-900/50 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div className="flex flex-col justify-end">
                      <div className="text-xs text-gray-500">Spread</div>
                      <div className={`text-sm font-bold ${Number(spreadPct) > 40 ? 'text-amber-400' : Number(spreadPct) > 20 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {formatMoney(spread)} ({spreadPct}%)
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <button onClick={startTrading} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors text-sm">
            Open Market — Start Trading
          </button>
        </>
      )}

      {/* TRADING PHASE */}
      {phase === 'trading' && (
        <>
          {/* Cards with live inventory */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {marketCards.map((card, i) => (
              <div key={card.slug} className="bg-gray-900/60 border border-gray-800 rounded-lg p-3">
                <div className="text-sm font-medium text-white truncate">{card.player}</div>
                <div className="text-xs text-gray-500">{sportLabels[card.sport] || card.sport} &middot; FV: {formatMoney(card.fairValue)}</div>
                <div className="flex items-center justify-between mt-2 text-xs">
                  <span className="text-red-400">Bid: {formatMoney(card.bidPrice)}</span>
                  <span className="text-emerald-400">Ask: {formatMoney(card.askPrice)}</span>
                </div>
                <div className="mt-2 flex items-center gap-1">
                  <span className="text-xs text-gray-500">Inv:</span>
                  {[...Array(5)].map((_, j) => (
                    <span key={j} className={`w-3 h-3 rounded-sm ${j < card.inventory ? 'bg-emerald-500' : 'bg-gray-800'}`} />
                  ))}
                  <span className="text-xs text-gray-400 ml-1">{card.inventory}/5</span>
                </div>
                {/* Adjust prices during trading */}
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateBid(i, card.bidPrice - 5)} className="text-xs bg-gray-800 px-1.5 py-0.5 rounded text-gray-400 hover:text-white">-5</button>
                    <button onClick={() => updateBid(i, card.bidPrice + 5)} className="text-xs bg-gray-800 px-1.5 py-0.5 rounded text-gray-400 hover:text-white">+5</button>
                  </div>
                  <div className="flex items-center gap-1 justify-end">
                    <button onClick={() => updateAsk(i, card.askPrice - 5)} className="text-xs bg-gray-800 px-1.5 py-0.5 rounded text-gray-400 hover:text-white">-5</button>
                    <button onClick={() => updateAsk(i, card.askPrice + 5)} className="text-xs bg-gray-800 px-1.5 py-0.5 rounded text-gray-400 hover:text-white">+5</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Trade Feed */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 max-h-64 overflow-y-auto">
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Trade Activity</h3>
            {trades.length === 0 && <p className="text-xs text-gray-600">Waiting for traders...</p>}
            <div className="space-y-1.5">
              {[...trades].reverse().slice(0, 15).map(t => (
                <div key={t.id} className={`flex items-center gap-2 text-xs ${t.filled ? 'text-gray-300' : 'text-gray-600'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${t.filled ? (t.type === 'sell' ? 'bg-emerald-500' : 'bg-red-500') : 'bg-gray-700'}`} />
                  <span className="font-medium">{t.trader}</span>
                  <span className="text-gray-500">wants to</span>
                  <span className={t.type === 'sell' ? 'text-emerald-400' : 'text-red-400'}>
                    {t.type === 'sell' ? 'buy' : 'sell'}
                  </span>
                  <span className="truncate flex-1">{t.player}</span>
                  <span className="font-medium">{formatMoney(t.price)}</span>
                  {t.filled ? (
                    <span className="text-emerald-400 text-[10px] font-bold">FILLED</span>
                  ) : (
                    <span className="text-red-400 text-[10px]">{t.reason}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button onClick={endSession} className="w-full py-2 bg-red-900/50 border border-red-800/50 text-red-400 font-medium rounded-lg hover:bg-red-900/70 transition-colors text-sm">
            Close Market Early
          </button>
        </>
      )}

      {/* RESULTS PHASE */}
      {phase === 'results' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-gray-900 to-emerald-950/30 border border-emerald-800/30 rounded-xl p-6 text-center">
            <div className="text-xs text-gray-500 uppercase mb-1">Market Session Complete</div>
            <div className={`text-6xl font-black ${gradeColor} mb-2`}>{grade}</div>
            <div className="text-2xl font-bold text-white">{formatMoney(totalProfit)} Profit</div>
            <div className="text-sm text-gray-400 mt-1">
              {filledTrades} trades filled &middot; {formatMoney(inventoryValue)} in remaining inventory
            </div>
          </div>

          {/* Per-card breakdown */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white">Position Summary</h3>
            {marketCards.map(card => (
              <div key={card.slug} className="flex items-center justify-between bg-gray-900/60 border border-gray-800 rounded-lg px-4 py-3">
                <div>
                  <div className="text-sm font-medium text-white">{card.player}</div>
                  <div className="text-xs text-gray-500">Bid: {formatMoney(card.bidPrice)} / Ask: {formatMoney(card.askPrice)}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Inventory</div>
                  <div className={`text-sm font-bold ${card.inventory > 0 ? 'text-amber-400' : 'text-gray-600'}`}>
                    {card.inventory > 0 ? `${card.inventory} @ ${formatMoney(card.fairValue)} ea` : 'Clear'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Lifetime stats */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-white mb-3">Lifetime Stats</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-xl font-bold text-emerald-400">{stats.gamesPlayed}</div>
                <div className="text-xs text-gray-500">Sessions</div>
              </div>
              <div>
                <div className="text-xl font-bold text-sky-400">{stats.totalTrades}</div>
                <div className="text-xs text-gray-500">Total Trades</div>
              </div>
              <div>
                <div className="text-xl font-bold text-amber-400">{formatMoney(stats.bestProfit)}</div>
                <div className="text-xs text-gray-500">Best Session</div>
              </div>
              <div>
                <div className="text-xl font-bold text-violet-400">{stats.bestGrade}</div>
                <div className="text-xs text-gray-500">Best Grade</div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => reset('daily')} className="flex-1 py-2 bg-emerald-900/50 border border-emerald-800/50 text-emerald-400 font-medium rounded-lg hover:bg-emerald-900/70 transition-colors text-sm">
              Daily Session
            </button>
            <button onClick={() => reset('random')} className="flex-1 py-2 bg-sky-900/50 border border-sky-800/50 text-sky-400 font-medium rounded-lg hover:bg-sky-900/70 transition-colors text-sm">
              Random Session
            </button>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-600 text-center">
        Cards from {sportsCards.length.toLocaleString()} sports cards in the CardVault database. AI trader behavior is simulated.
      </p>
    </div>
  );
}
