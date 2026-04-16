'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { sportsCards } from '@/data/sports-cards';

type Sport = 'all' | 'baseball' | 'basketball' | 'football' | 'hockey';
type SaleStatus = 'setup' | 'active' | 'complete';

interface ListedCard {
  slug: string;
  name: string;
  player: string;
  sport: string;
  marketValue: number;
  askPrice: number;
  status: 'listed' | 'sold' | 'passed';
  soldAt?: number;
  buyerName?: string;
  viewCount: number;
}

function parseValue(val: string): number {
  const m = val.match(/\$([0-9,.]+)/);
  return m ? parseFloat(m[1].replace(',', '')) : 5;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const BUYER_NAMES = [
  'Bargain Bill', 'Flipper Frank', 'Collector Chris', 'Set Builder Sam',
  'New Dad Dave', 'Vintage Vic', 'Rookie Hunter Roxy', 'LCS Larry',
  'Show Mom Maria', 'PC Paul', 'Investor Irene', 'Budget Ben',
  'TikTok Tina', 'Grading Gary', 'Bundle Bob', 'Team Collector Tara',
];

const BUYER_TYPES: { name: string; maxDiscount: number; description: string }[] = [
  { name: 'Bargain Hunter', maxDiscount: 0.5, description: 'Only buys at 50%+ off market' },
  { name: 'Fair Dealer', maxDiscount: 0.15, description: 'Pays near market value' },
  { name: 'Impulse Buyer', maxDiscount: 0.05, description: 'Buys almost anything priced right' },
  { name: 'Flipper', maxDiscount: 0.3, description: 'Needs margin — buys at 70% or less' },
  { name: 'PC Collector', maxDiscount: 0.0, description: 'Pays full price for the right card' },
];

export default function GarageSaleClient() {
  const [saleStatus, setSaleStatus] = useState<SaleStatus>('setup');
  const [searchQuery, setSearchQuery] = useState('');
  const [sportFilter, setSportFilter] = useState<Sport>('all');
  const [listings, setListings] = useState<ListedCard[]>([]);
  const [timer, setTimer] = useState(120); // 2 minute sale
  const [buyerLog, setBuyerLog] = useState<string[]>([]);
  const [totalEarned, setTotalEarned] = useState(0);

  // Search cards to list
  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase();
    return sportsCards
      .filter(c => {
        if (sportFilter !== 'all' && c.sport !== sportFilter) return false;
        return c.player.toLowerCase().includes(q) || c.name.toLowerCase().includes(q);
      })
      .slice(0, 12);
  }, [searchQuery, sportFilter]);

  const addListing = useCallback((card: typeof sportsCards[0]) => {
    if (listings.some(l => l.slug === card.slug)) return;
    const mv = parseValue(card.estimatedValueRaw);
    setListings(prev => [...prev, {
      slug: card.slug,
      name: card.name,
      player: card.player,
      sport: card.sport,
      marketValue: mv,
      askPrice: Math.round(mv * 0.8 * 100) / 100, // Default 80% of market
      status: 'listed',
      viewCount: 0,
    }]);
  }, [listings]);

  const updatePrice = useCallback((slug: string, price: number) => {
    setListings(prev => prev.map(l => l.slug === slug ? { ...l, askPrice: Math.max(0.25, price) } : l));
  }, []);

  const removeListing = useCallback((slug: string) => {
    setListings(prev => prev.filter(l => l.slug !== slug));
  }, []);

  // Start the garage sale
  const startSale = useCallback(() => {
    if (listings.length === 0) return;
    setSaleStatus('active');
    setTimer(120);
    setBuyerLog([]);
    setTotalEarned(0);
    // Reset all statuses
    setListings(prev => prev.map(l => ({ ...l, status: 'listed' as const, viewCount: 0 })));
  }, [listings.length]);

  // Sale timer + buyer simulation
  useEffect(() => {
    if (saleStatus !== 'active') return;

    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          setSaleStatus('complete');
          return 0;
        }
        return prev - 1;
      });

      // Every 3 seconds, simulate a buyer visit
      setListings(prev => {
        const available = prev.filter(l => l.status === 'listed');
        if (available.length === 0) return prev;

        const rng = seededRandom(Date.now());
        const card = available[Math.floor(rng() * available.length)];
        const buyerType = BUYER_TYPES[Math.floor(rng() * BUYER_TYPES.length)];
        const buyerName = BUYER_NAMES[Math.floor(rng() * BUYER_NAMES.length)];
        const discount = card.marketValue > 0 ? (card.marketValue - card.askPrice) / card.marketValue : 0;

        // Buyer decides
        const willBuy = discount >= buyerType.maxDiscount || (buyerType.name === 'PC Collector' && card.askPrice <= card.marketValue * 1.1);

        if (willBuy && rng() > 0.3) { // 70% chance they complete the purchase if willing
          const soldPrice = card.askPrice;
          setTotalEarned(e => e + soldPrice);
          setBuyerLog(log => [`${buyerName} (${buyerType.name}) bought ${card.player} for $${soldPrice.toFixed(2)}!`, ...log].slice(0, 20));
          return prev.map(l => l.slug === card.slug ? { ...l, status: 'sold' as const, soldAt: soldPrice, buyerName, viewCount: l.viewCount + 1 } : l);
        } else {
          // Just browsed
          const reason = card.askPrice > card.marketValue * 1.2 ? 'Too expensive' :
            card.askPrice > card.marketValue ? 'Slightly overpriced' : 'Not what they need';
          setBuyerLog(log => [`${buyerName} looked at ${card.player} — ${reason}`, ...log].slice(0, 20));
          return prev.map(l => l.slug === card.slug ? { ...l, viewCount: l.viewCount + 1 } : l);
        }
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [saleStatus]);

  // Auto-complete when all sold
  useEffect(() => {
    if (saleStatus === 'active' && listings.length > 0 && listings.every(l => l.status !== 'listed')) {
      setSaleStatus('complete');
    }
  }, [listings, saleStatus]);

  const totalMarketValue = listings.reduce((s, l) => s + l.marketValue, 0);
  const totalAsked = listings.filter(l => l.status !== 'passed').reduce((s, l) => s + l.askPrice, 0);
  const soldCount = listings.filter(l => l.status === 'sold').length;
  const totalSoldValue = listings.filter(l => l.status === 'sold').reduce((s, l) => s + (l.soldAt || 0), 0);
  const recovery = totalMarketValue > 0 ? Math.round((totalSoldValue / totalMarketValue) * 100) : 0;

  const saleGrade = recovery >= 90 ? 'A+' : recovery >= 80 ? 'A' : recovery >= 70 ? 'B' : recovery >= 60 ? 'C' : recovery >= 50 ? 'D' : 'F';
  const gradeColor = saleGrade.startsWith('A') ? 'text-emerald-400' : saleGrade === 'B' ? 'text-yellow-400' : saleGrade === 'C' ? 'text-orange-400' : 'text-red-400';

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-zinc-800/60 border border-zinc-700/50 rounded-lg p-3 text-center">
          <div className="text-xs text-zinc-400">Listed</div>
          <div className="text-lg font-bold text-white">{listings.length}</div>
        </div>
        <div className="bg-zinc-800/60 border border-zinc-700/50 rounded-lg p-3 text-center">
          <div className="text-xs text-zinc-400">Sold</div>
          <div className="text-lg font-bold text-emerald-400">{soldCount}</div>
        </div>
        <div className="bg-zinc-800/60 border border-zinc-700/50 rounded-lg p-3 text-center">
          <div className="text-xs text-zinc-400">Earned</div>
          <div className="text-lg font-bold text-yellow-400">${totalEarned.toFixed(2)}</div>
        </div>
        <div className="bg-zinc-800/60 border border-zinc-700/50 rounded-lg p-3 text-center">
          <div className="text-xs text-zinc-400">{saleStatus === 'active' ? 'Time Left' : 'Market Value'}</div>
          <div className="text-lg font-bold text-sky-400">
            {saleStatus === 'active' ? `${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')}` : `$${totalMarketValue.toFixed(2)}`}
          </div>
        </div>
      </div>

      {/* SETUP PHASE */}
      {saleStatus === 'setup' && (
        <div className="space-y-4">
          <div className="bg-zinc-900/80 border border-zinc-700/50 rounded-lg p-5">
            <h2 className="text-lg font-bold text-white mb-3">Set Up Your Garage Sale</h2>
            <p className="text-sm text-zinc-400 mb-4">
              Search for cards, add them to your sale table, and set your prices. The lower your price compared to market value, the faster it sells. Price too high and buyers walk away.
            </p>

            {/* Sport Filter */}
            <div className="flex flex-wrap gap-2 mb-3">
              {(['all', 'baseball', 'basketball', 'football', 'hockey'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setSportFilter(s)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    sportFilter === s ? 'bg-yellow-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  {s === 'all' ? 'All Sports' : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>

            {/* Search */}
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search cards to list for sale..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-600"
            />

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-2 bg-zinc-800/80 border border-zinc-700/50 rounded-lg divide-y divide-zinc-700/30 max-h-[300px] overflow-y-auto">
                {searchResults.map(card => {
                  const alreadyListed = listings.some(l => l.slug === card.slug);
                  return (
                    <button
                      key={card.slug}
                      onClick={() => !alreadyListed && addListing(card)}
                      disabled={alreadyListed}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between transition-colors ${
                        alreadyListed ? 'opacity-50 cursor-not-allowed' : 'hover:bg-zinc-700/50'
                      }`}
                    >
                      <div>
                        <div className="text-xs text-zinc-300 font-medium">{card.player}</div>
                        <div className="text-xs text-zinc-500">{card.name}</div>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <div className="text-xs text-zinc-400">{card.estimatedValueRaw}</div>
                        <div className="text-xs text-emerald-400">{alreadyListed ? 'Listed' : '+ Add'}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Current Listings */}
          {listings.length > 0 && (
            <div className="bg-zinc-900/80 border border-zinc-700/50 rounded-lg p-5">
              <h3 className="text-sm font-bold text-white mb-3">Your Sale Table ({listings.length} cards)</h3>
              <div className="space-y-2">
                {listings.map(l => {
                  const pctOfMarket = l.marketValue > 0 ? Math.round((l.askPrice / l.marketValue) * 100) : 100;
                  const pctColor = pctOfMarket <= 60 ? 'text-emerald-400' : pctOfMarket <= 80 ? 'text-yellow-400' : pctOfMarket <= 100 ? 'text-orange-400' : 'text-red-400';
                  const speedLabel = pctOfMarket <= 50 ? 'Instant sell' : pctOfMarket <= 70 ? 'Fast' : pctOfMarket <= 90 ? 'Normal' : pctOfMarket <= 110 ? 'Slow' : 'Very slow';
                  return (
                    <div key={l.slug} className="bg-zinc-800/60 border border-zinc-700/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="text-sm text-white font-medium">{l.player}</div>
                          <div className="text-xs text-zinc-500">{l.name}</div>
                        </div>
                        <button onClick={() => removeListing(l.slug)} className="text-xs text-red-400 hover:text-red-300 px-2">Remove</button>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-xs text-zinc-400">Market: ${l.marketValue.toFixed(2)}</div>
                        <div className="flex items-center gap-1.5 flex-1">
                          <span className="text-xs text-zinc-400">Ask: $</span>
                          <input
                            type="number"
                            value={l.askPrice}
                            onChange={e => updatePrice(l.slug, parseFloat(e.target.value) || 0)}
                            step="0.5"
                            min="0.25"
                            className="w-20 bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-yellow-600"
                          />
                        </div>
                        <span className={`text-xs font-bold ${pctColor}`}>{pctOfMarket}%</span>
                        <span className="text-xs text-zinc-500">{speedLabel}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-zinc-400">
                  Total asking: <span className="text-white font-bold">${totalAsked.toFixed(2)}</span>
                  <span className="text-zinc-600 mx-1">|</span>
                  Market value: <span className="text-zinc-300">${totalMarketValue.toFixed(2)}</span>
                </div>
                <button
                  onClick={startSale}
                  className="px-5 py-2 bg-yellow-600 hover:bg-yellow-500 text-white text-sm font-bold rounded-lg transition-colors"
                >
                  Open for Business!
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ACTIVE SALE PHASE */}
      {saleStatus === 'active' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Sale Table */}
          <div className="bg-zinc-900/80 border border-zinc-700/50 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-700/50 bg-zinc-800/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-sm font-bold text-white">Your Table</span>
              </div>
              <span className="text-xs text-zinc-400">{listings.filter(l => l.status === 'listed').length} remaining</span>
            </div>
            <div className="max-h-[400px] overflow-y-auto divide-y divide-zinc-800/50">
              {listings.map(l => (
                <div key={l.slug} className={`px-4 py-2.5 ${l.status === 'sold' ? 'bg-emerald-950/20' : l.status === 'passed' ? 'bg-red-950/20' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-zinc-300 font-medium">{l.player}</div>
                      <div className="text-xs text-zinc-500">{l.name}</div>
                    </div>
                    <div className="text-right">
                      {l.status === 'sold' ? (
                        <div className="text-xs text-emerald-400 font-bold">SOLD ${l.soldAt?.toFixed(2)}</div>
                      ) : (
                        <div className="text-xs text-yellow-400">${l.askPrice.toFixed(2)}</div>
                      )}
                      <div className="text-xs text-zinc-600">{l.viewCount} views</div>
                    </div>
                  </div>
                  {l.status === 'sold' && l.buyerName && (
                    <div className="text-xs text-emerald-500 mt-0.5">Sold to {l.buyerName}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Buyer Activity Log */}
          <div className="bg-zinc-900/80 border border-zinc-700/50 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-700/50 bg-zinc-800/60">
              <span className="text-sm font-bold text-white">Buyer Activity</span>
            </div>
            <div className="max-h-[400px] overflow-y-auto p-3 space-y-1.5">
              {buyerLog.length === 0 ? (
                <div className="text-xs text-zinc-500 text-center py-8">Waiting for buyers to arrive...</div>
              ) : (
                buyerLog.map((msg, i) => (
                  <div key={i} className={`text-xs ${msg.includes('bought') ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    {msg}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* COMPLETE PHASE */}
      {saleStatus === 'complete' && (
        <div className="space-y-4">
          <div className="bg-zinc-900/80 border border-zinc-700/50 rounded-lg p-6 text-center">
            <div className="text-4xl mb-2">🏷️</div>
            <h2 className="text-xl font-bold text-white mb-1">Sale Complete!</h2>
            <div className={`text-3xl font-black ${gradeColor} mb-2`}>Grade: {saleGrade}</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-sm">
              <div>
                <div className="text-zinc-400">Listed</div>
                <div className="text-white font-bold">{listings.length}</div>
              </div>
              <div>
                <div className="text-zinc-400">Sold</div>
                <div className="text-emerald-400 font-bold">{soldCount}/{listings.length}</div>
              </div>
              <div>
                <div className="text-zinc-400">Earned</div>
                <div className="text-yellow-400 font-bold">${totalSoldValue.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-zinc-400">Recovery</div>
                <div className={`font-bold ${gradeColor}`}>{recovery}%</div>
              </div>
            </div>
            <div className="mt-4 text-xs text-zinc-500">
              Market value: ${totalMarketValue.toFixed(2)} | You recovered {recovery}% through the garage sale
            </div>
            <div className="mt-4 p-3 bg-zinc-800/60 rounded-lg text-xs text-zinc-400">
              {recovery >= 80 ? 'Excellent pricing! You sold at near-market rates — better than most card shows.' :
               recovery >= 60 ? 'Good sale. You priced competitively and moved inventory. Most dealers aim for this range.' :
               recovery >= 40 ? 'Aggressive pricing moved cards fast, but you left money on the table. Consider adjusting prices mid-sale.' :
               'Fire sale pricing! Great for clearing inventory fast, but try pricing at 70-80% for better returns.'}
            </div>
            <div className="mt-4 flex gap-3 justify-center">
              <button
                onClick={() => { setSaleStatus('setup'); setListings([]); setBuyerLog([]); setTotalEarned(0); }}
                className="px-5 py-2 bg-yellow-600 hover:bg-yellow-500 text-white text-sm font-bold rounded-lg transition-colors"
              >
                New Sale
              </button>
            </div>
          </div>

          {/* Sold items detail */}
          <div className="bg-zinc-900/80 border border-zinc-700/50 rounded-lg p-4">
            <h3 className="text-sm font-bold text-white mb-3">Sale Results</h3>
            <div className="space-y-1.5">
              {listings.map(l => (
                <div key={l.slug} className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300">{l.player}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-500">Market: ${l.marketValue.toFixed(2)}</span>
                    {l.status === 'sold' ? (
                      <span className="text-emerald-400 font-bold">SOLD ${l.soldAt?.toFixed(2)}</span>
                    ) : (
                      <span className="text-red-400">Unsold (${l.askPrice.toFixed(2)})</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comparison to other methods */}
          <div className="bg-zinc-800/40 border border-zinc-700/30 rounded-lg p-4">
            <h3 className="text-sm font-bold text-white mb-3">How Would You Do Elsewhere?</h3>
            <div className="space-y-2">
              {[
                { method: 'eBay (after fees)', pct: 85, icon: '🛒' },
                { method: 'Card Show Dealer', pct: 55, icon: '🎪' },
                { method: 'Facebook Groups', pct: 90, icon: '👥' },
                { method: 'COMC', pct: 80, icon: '📦' },
                { method: 'LCS Buylist', pct: 50, icon: '🏪' },
                { method: 'Bulk Lot (eBay)', pct: 40, icon: '📦' },
              ].map(m => {
                const est = Math.round(totalMarketValue * m.pct / 100 * 100) / 100;
                const diff = totalSoldValue - est;
                return (
                  <div key={m.method} className="flex items-center justify-between">
                    <span className="text-xs text-zinc-400">{m.icon} {m.method} (~{m.pct}%)</span>
                    <div className="text-right">
                      <span className="text-xs text-zinc-300">${est.toFixed(2)}</span>
                      <span className={`text-xs ml-2 ${diff >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {diff >= 0 ? '+' : ''}{diff.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* How It Works */}
      <div className="bg-zinc-800/40 border border-zinc-700/30 rounded-lg p-5">
        <h2 className="text-lg font-bold text-white mb-3">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-zinc-300">
          <div>
            <p className="font-medium text-yellow-400">1. List Your Cards</p>
            <p className="text-zinc-400 mt-1">Search the database of 9,000+ cards and add them to your sale table. Each card shows its estimated market value.</p>
          </div>
          <div>
            <p className="font-medium text-yellow-400">2. Set Your Prices</p>
            <p className="text-zinc-400 mt-1">Price each card. Lower prices sell faster — 50% of market is instant, 80% is normal speed, over 100% is very slow.</p>
          </div>
          <div>
            <p className="font-medium text-yellow-400">3. Open for Business</p>
            <p className="text-zinc-400 mt-1">Simulated buyers browse your table for 2 minutes. Different buyer types (bargain hunters, fair dealers, PC collectors) have different price thresholds.</p>
          </div>
          <div>
            <p className="font-medium text-yellow-400">4. See Your Results</p>
            <p className="text-zinc-400 mt-1">After the sale, see how much you earned, your recovery percentage, and how it compares to selling on eBay, Facebook, COMC, and more.</p>
          </div>
        </div>
      </div>

      {/* Pricing Tips */}
      <div className="bg-zinc-800/40 border border-zinc-700/30 rounded-lg p-5">
        <h2 className="text-lg font-bold text-white mb-3">Garage Sale Pricing Tips</h2>
        <div className="space-y-3">
          {[
            { title: 'The 70% Rule', desc: 'Price at 70% of market value for a healthy balance between speed and profit. Most show dealers use this range.' },
            { title: 'Star Cards Hold Value', desc: 'Don\'t discount star player cards as heavily. Buyers will pay closer to market for big names like Wembanyama or Ohtani.' },
            { title: 'Volume Moves Fast', desc: 'Lower-value cards ($1-$5) sell quickest at steep discounts. Consider bundling them at $0.50-$1 each to clear inventory.' },
            { title: 'Compare to eBay', desc: 'After fees (~15%), eBay nets you about 85% of market value. Your garage sale should aim to beat that for speed.' },
            { title: 'Know Your Buyers', desc: 'Bargain hunters want 50%+ off. Flippers need 30% margin. PC collectors pay full price for the right card.' },
          ].map((tip, i) => (
            <div key={i} className="flex gap-3">
              <span className="text-yellow-500 font-bold text-sm mt-0.5">{i + 1}.</span>
              <div>
                <span className="text-sm text-white font-medium">{tip.title}</span>
                <p className="text-xs text-zinc-400 mt-0.5">{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
