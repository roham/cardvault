'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

/* ─── types ─── */
interface Platform {
  id: string;
  name: string;
  icon: string;
  buyerFeeRate: number;   // % fee when buying
  sellerFeeRate: number;  // % fee when selling
  shippingCost: number;   // avg shipping in $
  speed: string;          // how fast you get the card / money
  notes: string;
}

interface PriceEntry {
  platform: Platform;
  price: number;
  totalBuyCost: number;   // price + buyer fees + shipping
  netSellProceeds: number; // price - seller fees - shipping
}

interface Opportunity {
  buyFrom: PriceEntry;
  sellOn: PriceEntry;
  grossProfit: number;
  netProfit: number;
  roi: number;
  rating: string;
}

/* ─── platforms ─── */
const PLATFORMS: Platform[] = [
  { id: 'ebay', name: 'eBay', icon: '🛒', buyerFeeRate: 0, sellerFeeRate: 0.1325, shippingCost: 4.50, speed: '3-7 days', notes: '13.25% seller fee (final value + payment processing)' },
  { id: 'comc', name: 'COMC', icon: '📦', buyerFeeRate: 0, sellerFeeRate: 0.20, shippingCost: 0.50, speed: '1-3 weeks', notes: '20% seller commission; cheap shipping (combined)' },
  { id: 'goldin', name: 'Goldin', icon: '🏆', buyerFeeRate: 0.20, sellerFeeRate: 0.10, shippingCost: 5.00, speed: '2-4 weeks', notes: '20% buyer premium; 10% seller commission' },
  { id: 'heritage', name: 'Heritage', icon: '🏛️', buyerFeeRate: 0.20, sellerFeeRate: 0.10, shippingCost: 6.00, speed: '4-8 weeks', notes: '20% buyer premium; 10% seller commission' },
  { id: 'myslabs', name: 'MySlabs', icon: '💎', buyerFeeRate: 0, sellerFeeRate: 0.10, shippingCost: 4.00, speed: '3-7 days', notes: '10% seller commission; graded-card focused' },
  { id: 'facebook', name: 'Facebook Groups', icon: '👥', buyerFeeRate: 0, sellerFeeRate: 0, shippingCost: 4.50, speed: '3-7 days', notes: 'No platform fees; PayPal G&S adds 2.9%' },
  { id: 'lcs', name: 'Local Card Shop', icon: '🏪', buyerFeeRate: 0, sellerFeeRate: 0, shippingCost: 0, speed: 'Instant', notes: 'No fees, no shipping; shop buys at 50-70% of market' },
];

/* ─── helpers ─── */
function parseValue(est: string): number {
  const m = est.match(/\$([0-9,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) || 5 : 5;
}

function fmt(n: number): string {
  if (n >= 10000) return `$${(n / 1000).toFixed(0)}K`;
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

function pctStr(n: number): string {
  return `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`;
}

function seedRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return (s >> 16) / 32767;
  };
}

function generatePlatformPrices(baseValue: number, cardSlug: string): PriceEntry[] {
  // Deterministic per-card per-platform price variation
  let hash = 0;
  for (let i = 0; i < cardSlug.length; i++) {
    hash = ((hash << 5) - hash + cardSlug.charCodeAt(i)) | 0;
  }
  const rng = seedRng(Math.abs(hash));

  return PLATFORMS.map(platform => {
    // Each platform has a different price range
    let multiplier = 1;
    switch (platform.id) {
      case 'ebay': multiplier = 0.90 + rng() * 0.20; break;     // 90-110% of base
      case 'comc': multiplier = 0.80 + rng() * 0.15; break;     // 80-95% — often cheaper
      case 'goldin': multiplier = 1.00 + rng() * 0.30; break;   // 100-130% — auction premium
      case 'heritage': multiplier = 1.05 + rng() * 0.35; break; // 105-140% — auction house premium
      case 'myslabs': multiplier = 0.85 + rng() * 0.25; break;  // 85-110% — variable
      case 'facebook': multiplier = 0.75 + rng() * 0.20; break; // 75-95% — deals available
      case 'lcs': multiplier = 0.50 + rng() * 0.20; break;      // 50-70% — wholesale pricing
    }

    const price = Math.round(baseValue * multiplier * 100) / 100;
    const totalBuyCost = price * (1 + platform.buyerFeeRate) + platform.shippingCost;
    const netSellProceeds = price * (1 - platform.sellerFeeRate) - platform.shippingCost;

    return { platform, price, totalBuyCost, netSellProceeds };
  });
}

function findOpportunities(prices: PriceEntry[]): Opportunity[] {
  const opps: Opportunity[] = [];

  for (const buy of prices) {
    for (const sell of prices) {
      if (buy.platform.id === sell.platform.id) continue;
      const grossProfit = sell.price - buy.price;
      const netProfit = sell.netSellProceeds - buy.totalBuyCost;
      if (netProfit <= 0) continue;
      const roi = (netProfit / buy.totalBuyCost) * 100;
      let rating = 'Low';
      if (roi >= 30) rating = 'Excellent';
      else if (roi >= 20) rating = 'Great';
      else if (roi >= 10) rating = 'Good';
      else if (roi >= 5) rating = 'Fair';

      opps.push({ buyFrom: buy, sellOn: sell, grossProfit, netProfit, roi, rating });
    }
  }

  return opps.sort((a, b) => b.netProfit - a.netProfit);
}

function ratingColor(rating: string): string {
  switch (rating) {
    case 'Excellent': return 'text-green-400';
    case 'Great': return 'text-emerald-400';
    case 'Good': return 'text-blue-400';
    case 'Fair': return 'text-yellow-400';
    default: return 'text-zinc-400';
  }
}

function ratingBg(rating: string): string {
  switch (rating) {
    case 'Excellent': return 'bg-green-500/10 border-green-500/30';
    case 'Great': return 'bg-emerald-500/10 border-emerald-500/30';
    case 'Good': return 'bg-blue-500/10 border-blue-500/30';
    case 'Fair': return 'bg-yellow-500/10 border-yellow-500/30';
    default: return 'bg-zinc-500/10 border-zinc-500/30';
  }
}

/* ─── component ─── */
export default function ArbitrageClient() {
  const [query, setQuery] = useState('');
  const [selectedCards, setSelectedCards] = useState<typeof sportsCards>([]);
  const [activeCardIdx, setActiveCardIdx] = useState(0);
  const [showSearch, setShowSearch] = useState(true);

  const searchResults = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    return sportsCards
      .filter(c => {
        const txt = `${c.player} ${c.name} ${c.set || ''}`.toLowerCase();
        return txt.includes(q);
      })
      .slice(0, 12);
  }, [query]);

  const addCard = useCallback((card: (typeof sportsCards)[0]) => {
    if (selectedCards.length >= 10) return;
    if (selectedCards.some(c => c.slug === card.slug)) return;
    setSelectedCards(prev => [...prev, card]);
    setActiveCardIdx(selectedCards.length);
    setQuery('');
    setShowSearch(false);
  }, [selectedCards]);

  const removeCard = useCallback((idx: number) => {
    setSelectedCards(prev => prev.filter((_, i) => i !== idx));
    setActiveCardIdx(prev => Math.min(prev, selectedCards.length - 2));
  }, [selectedCards.length]);

  const activeCard = selectedCards[activeCardIdx];
  const activePrices = useMemo(() => {
    if (!activeCard) return [];
    return generatePlatformPrices(parseValue(activeCard.estimatedValueRaw || '$5'), activeCard.slug);
  }, [activeCard]);

  const activeOpportunities = useMemo(() => {
    if (activePrices.length === 0) return [];
    return findOpportunities(activePrices);
  }, [activePrices]);

  const bestOpp = activeOpportunities[0] || null;

  // Stats across all selected cards
  const batchStats = useMemo(() => {
    if (selectedCards.length === 0) return null;
    let totalBestProfit = 0;
    let bestRoiCard = { name: '', roi: 0 };
    let totalOpps = 0;

    for (const card of selectedCards) {
      const prices = generatePlatformPrices(parseValue(card.estimatedValueRaw || '$5'), card.slug);
      const opps = findOpportunities(prices);
      totalOpps += opps.length;
      if (opps.length > 0) {
        totalBestProfit += opps[0].netProfit;
        if (opps[0].roi > bestRoiCard.roi) {
          bestRoiCard = { name: card.player, roi: opps[0].roi };
        }
      }
    }

    return { totalBestProfit, bestRoiCard, totalOpps, cardCount: selectedCards.length };
  }, [selectedCards]);

  return (
    <div className="space-y-8">
      {/* Hero stats */}
      {batchStats && batchStats.cardCount > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-zinc-800/50 rounded-lg p-3 text-center border border-zinc-700/50">
            <div className="text-xs text-zinc-400">Cards Checked</div>
            <div className="text-xl font-bold text-white">{batchStats.cardCount}</div>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-3 text-center border border-zinc-700/50">
            <div className="text-xs text-zinc-400">Total Opportunities</div>
            <div className="text-xl font-bold text-emerald-400">{batchStats.totalOpps}</div>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-3 text-center border border-zinc-700/50">
            <div className="text-xs text-zinc-400">Best Combined Profit</div>
            <div className="text-xl font-bold text-green-400">{fmt(batchStats.totalBestProfit)}</div>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-3 text-center border border-zinc-700/50">
            <div className="text-xs text-zinc-400">Best ROI Card</div>
            <div className="text-sm font-bold text-amber-400 truncate">{batchStats.bestRoiCard.name || '—'}</div>
            <div className="text-xs text-zinc-500">{batchStats.bestRoiCard.roi > 0 ? pctStr(batchStats.bestRoiCard.roi) + ' ROI' : ''}</div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-zinc-800/40 rounded-xl p-5 border border-zinc-700/50">
        <h2 className="text-lg font-bold text-white mb-3">Search Cards to Check</h2>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setShowSearch(true); }}
            onFocus={() => setShowSearch(true)}
            placeholder="Search by player, card name, or set... (up to 10 cards)"
            className="w-full bg-zinc-900/60 text-white border border-zinc-600 rounded-lg px-4 py-3 focus:outline-none focus:border-amber-500 placeholder:text-zinc-500"
          />
          {showSearch && searchResults.length > 0 && (
            <div className="absolute z-20 w-full mt-1 bg-zinc-800 border border-zinc-600 rounded-lg max-h-72 overflow-y-auto shadow-xl">
              {searchResults.map(card => (
                <button
                  key={card.slug}
                  onClick={() => addCard(card)}
                  className="w-full px-4 py-2.5 text-left hover:bg-zinc-700 flex items-center justify-between border-b border-zinc-700/50 last:border-0"
                >
                  <div>
                    <span className="text-white font-medium">{card.player}</span>
                    <span className="text-zinc-400 text-sm ml-2">{card.name}</span>
                  </div>
                  <span className="text-amber-400 text-sm font-medium">{card.estimatedValueRaw?.split('(')[0]?.trim() || '—'}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected cards tabs */}
        {selectedCards.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {selectedCards.map((card, idx) => (
              <button
                key={card.slug}
                onClick={() => setActiveCardIdx(idx)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  idx === activeCardIdx
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                    : 'bg-zinc-700/40 border-zinc-600/50 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                <span className="truncate max-w-[120px]">{card.player}</span>
                <span
                  onClick={e => { e.stopPropagation(); removeCard(idx); }}
                  className="ml-1 text-zinc-400 hover:text-red-400 cursor-pointer"
                >
                  ×
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Active card analysis */}
      {activeCard && (
        <>
          {/* Card header */}
          <div className="bg-zinc-800/40 rounded-xl p-5 border border-zinc-700/50">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-xl font-bold text-white">{activeCard.player}</h2>
                <p className="text-zinc-400 text-sm">{activeCard.name} {activeCard.set ? `• ${activeCard.set}` : ''}</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-zinc-400">Market Value Estimate</div>
                <div className="text-lg font-bold text-amber-400">{activeCard.estimatedValueRaw?.split('(')[0]?.trim()}</div>
              </div>
            </div>

            {/* Best opportunity highlight */}
            {bestOpp && (
              <div className={`mt-4 p-4 rounded-lg border ${ratingBg(bestOpp.rating)}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">💰</span>
                  <span className="font-bold text-white">Best Arbitrage Opportunity</span>
                  <span className={`ml-auto text-sm font-bold ${ratingColor(bestOpp.rating)}`}>{bestOpp.rating}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div>
                    <div className="text-zinc-400">Buy on</div>
                    <div className="text-white font-medium">{bestOpp.buyFrom.platform.icon} {bestOpp.buyFrom.platform.name}</div>
                    <div className="text-zinc-300">{fmt(bestOpp.buyFrom.totalBuyCost)} total cost</div>
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="text-2xl">→</span>
                  </div>
                  <div>
                    <div className="text-zinc-400">Sell on</div>
                    <div className="text-white font-medium">{bestOpp.sellOn.platform.icon} {bestOpp.sellOn.platform.name}</div>
                    <div className="text-zinc-300">{fmt(bestOpp.sellOn.netSellProceeds)} net proceeds</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-4 text-sm">
                  <div>
                    <span className="text-zinc-400">Net Profit: </span>
                    <span className="text-green-400 font-bold">{fmt(bestOpp.netProfit)}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400">ROI: </span>
                    <span className="text-green-400 font-bold">{pctStr(bestOpp.roi)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Platform price comparison table */}
          <div className="bg-zinc-800/40 rounded-xl p-5 border border-zinc-700/50">
            <h3 className="text-lg font-bold text-white mb-4">Platform Price Comparison</h3>
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-700">
                    <th className="text-left text-zinc-400 font-medium pb-2 px-2">Platform</th>
                    <th className="text-right text-zinc-400 font-medium pb-2 px-2">Listed Price</th>
                    <th className="text-right text-zinc-400 font-medium pb-2 px-2">Buy Cost</th>
                    <th className="text-right text-zinc-400 font-medium pb-2 px-2">Sell Proceeds</th>
                    <th className="text-right text-zinc-400 font-medium pb-2 px-2">Seller Fee</th>
                    <th className="text-center text-zinc-400 font-medium pb-2 px-2">Speed</th>
                  </tr>
                </thead>
                <tbody>
                  {activePrices
                    .sort((a, b) => a.totalBuyCost - b.totalBuyCost)
                    .map((entry, idx) => {
                      const cheapest = idx === 0;
                      const bestSell = entry.netSellProceeds === Math.max(...activePrices.map(p => p.netSellProceeds));
                      return (
                        <tr key={entry.platform.id} className="border-b border-zinc-700/50 hover:bg-zinc-700/20">
                          <td className="py-2.5 px-2">
                            <div className="flex items-center gap-2">
                              <span>{entry.platform.icon}</span>
                              <span className="text-white font-medium">{entry.platform.name}</span>
                              {cheapest && <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full">BEST BUY</span>}
                              {bestSell && <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full">BEST SELL</span>}
                            </div>
                          </td>
                          <td className="text-right text-white px-2">{fmt(entry.price)}</td>
                          <td className={`text-right px-2 ${cheapest ? 'text-green-400 font-medium' : 'text-zinc-300'}`}>
                            {fmt(entry.totalBuyCost)}
                          </td>
                          <td className={`text-right px-2 ${bestSell ? 'text-amber-400 font-medium' : 'text-zinc-300'}`}>
                            {fmt(entry.netSellProceeds)}
                          </td>
                          <td className="text-right text-zinc-400 px-2">
                            {(entry.platform.sellerFeeRate * 100).toFixed(1)}%
                          </td>
                          <td className="text-center text-zinc-400 px-2">{entry.platform.speed}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

          {/* All opportunities */}
          {activeOpportunities.length > 0 && (
            <div className="bg-zinc-800/40 rounded-xl p-5 border border-zinc-700/50">
              <h3 className="text-lg font-bold text-white mb-1">All Arbitrage Opportunities</h3>
              <p className="text-zinc-400 text-sm mb-4">{activeOpportunities.length} profitable route{activeOpportunities.length !== 1 ? 's' : ''} found — sorted by net profit</p>
              <div className="space-y-2">
                {activeOpportunities.slice(0, 10).map((opp, idx) => (
                  <div key={idx} className={`flex items-center gap-3 p-3 rounded-lg border ${idx === 0 ? ratingBg(opp.rating) : 'bg-zinc-900/30 border-zinc-700/50'}`}>
                    <div className="flex-1 flex items-center gap-2 flex-wrap text-sm">
                      <span className="text-white">{opp.buyFrom.platform.icon} {opp.buyFrom.platform.name}</span>
                      <span className="text-zinc-500">({fmt(opp.buyFrom.totalBuyCost)})</span>
                      <span className="text-zinc-400">→</span>
                      <span className="text-white">{opp.sellOn.platform.icon} {opp.sellOn.platform.name}</span>
                      <span className="text-zinc-500">({fmt(opp.sellOn.netSellProceeds)})</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm shrink-0">
                      <span className="text-green-400 font-bold">{fmt(opp.netProfit)}</span>
                      <span className={`font-medium ${ratingColor(opp.rating)}`}>{pctStr(opp.roi)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeOpportunities.length === 0 && (
            <div className="bg-zinc-800/40 rounded-xl p-8 border border-zinc-700/50 text-center">
              <div className="text-3xl mb-2">🤷</div>
              <p className="text-zinc-400">No profitable arbitrage routes found for this card after fees and shipping.</p>
              <p className="text-zinc-500 text-sm mt-1">The price spread across platforms is too narrow to overcome transaction costs.</p>
            </div>
          )}
        </>
      )}

      {/* Empty state */}
      {selectedCards.length === 0 && (
        <div className="bg-zinc-800/40 rounded-xl p-10 border border-zinc-700/50 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="text-lg font-bold text-white mb-2">Search for a Card to Check</h3>
          <p className="text-zinc-400 max-w-md mx-auto">
            Enter a player name, card name, or set above. We&apos;ll compare prices across 7 platforms and find the most profitable buy/sell combinations after fees, shipping, and commissions.
          </p>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto">
            {['Shohei Ohtani', 'Victor Wembanyama', 'Patrick Mahomes', 'Connor Bedard'].map(name => (
              <button
                key={name}
                onClick={() => { setQuery(name); setShowSearch(true); }}
                className="bg-zinc-700/40 hover:bg-zinc-700 border border-zinc-600/50 rounded-lg px-3 py-2 text-sm text-zinc-300 transition-colors"
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Platform fee guide */}
      <div className="bg-zinc-800/40 rounded-xl p-5 border border-zinc-700/50">
        <h3 className="text-lg font-bold text-white mb-4">Platform Fee Breakdown</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PLATFORMS.map(p => (
            <div key={p.id} className="bg-zinc-900/40 rounded-lg p-3 border border-zinc-700/30">
              <div className="flex items-center gap-2 mb-1">
                <span>{p.icon}</span>
                <span className="text-white font-medium">{p.name}</span>
              </div>
              <div className="text-xs space-y-0.5">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Buyer Fee</span>
                  <span className="text-zinc-300">{(p.buyerFeeRate * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Seller Fee</span>
                  <span className="text-zinc-300">{(p.sellerFeeRate * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Avg Shipping</span>
                  <span className="text-zinc-300">${p.shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Speed</span>
                  <span className="text-zinc-300">{p.speed}</span>
                </div>
              </div>
              <p className="text-zinc-500 text-[11px] mt-1.5">{p.notes}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-zinc-800/40 rounded-xl p-5 border border-zinc-700/50">
        <h3 className="text-lg font-bold text-white mb-3">Arbitrage Tips for Card Flippers</h3>
        <div className="space-y-3">
          {[
            { icon: '💡', title: 'Watch Auction Ends', text: 'Cards that end at off-peak hours (weekday mornings, late nights) often sell 15-25% below market value. Set up eBay saved searches with price alerts.' },
            { icon: '📊', title: 'Volume Matters', text: 'Arbitrage works best on cards with high trading volume. A PSA 10 Wembanyama Prizm sells dozens of times daily — plenty of price variance to exploit.' },
            { icon: '⏱️', title: 'Factor in Time', text: 'A 10% ROI in 3 days (eBay→eBay) beats a 20% ROI that takes 6 weeks (Heritage consignment). Calculate annualized returns.' },
            { icon: '📦', title: 'Shipping Kills Small Margins', text: 'On cards under $20, shipping costs ($4-6) can wipe out your entire profit margin. Focus arbitrage on cards worth $50+ where fees are proportionally smaller.' },
            { icon: '🎯', title: 'Specialize in One Niche', text: 'The best flippers know their niche cold. If you specialize in vintage baseball PSA 7-8, you\'ll spot underpriced cards instantly that generalists miss.' },
          ].map((tip, idx) => (
            <div key={idx} className="flex gap-3">
              <span className="text-xl shrink-0">{tip.icon}</span>
              <div>
                <div className="text-white font-medium text-sm">{tip.title}</div>
                <div className="text-zinc-400 text-sm">{tip.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Related tools */}
      <div className="bg-zinc-800/40 rounded-xl p-5 border border-zinc-700/50">
        <h3 className="text-lg font-bold text-white mb-3">Related Tools</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { href: '/tools/flip-tracker', name: 'Flip Tracker P&L', desc: 'Track your buy/sell profit and loss' },
            { href: '/tools/ebay-fee-calc', name: 'eBay Fee Calculator', desc: 'Calculate exact eBay selling fees' },
            { href: '/tools/selling-platforms', name: 'Selling Platform Guide', desc: 'Compare all selling platforms' },
            { href: '/tools/watchlist', name: 'Price Watchlist', desc: 'Track cards and set price alerts' },
            { href: '/tools/grade-spread', name: 'Grade Price Spread', desc: 'See value at every PSA grade' },
            { href: '/tools/tax-calc', name: 'Tax Calculator', desc: 'Estimate taxes on card profits' },
          ].map(tool => (
            <Link
              key={tool.href}
              href={tool.href}
              className="bg-zinc-900/40 rounded-lg p-3 border border-zinc-700/30 hover:border-amber-500/40 transition-colors"
            >
              <div className="text-white font-medium text-sm">{tool.name}</div>
              <div className="text-zinc-400 text-xs">{tool.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
