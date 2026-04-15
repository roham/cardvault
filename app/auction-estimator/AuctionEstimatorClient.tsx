'use client';

import { useState, useMemo } from 'react';
import { sportsCards } from '@/data/sports-cards';
import type { SportsCard } from '@/data/sports-cards';

interface AuctionHouse {
  name: string;
  slug: string;
  sellerCommission: number; // percentage taken from seller
  buyersPremium: number; // percentage added to buyer (affects hammer price)
  minimumLot: number;
  specialty: string;
  turnaround: string;
  color: string;
  bestFor: string;
}

const auctionHouses: AuctionHouse[] = [
  {
    name: 'Heritage Auctions',
    slug: 'heritage',
    sellerCommission: 0.10,
    buyersPremium: 0.20,
    minimumLot: 200,
    specialty: 'Vintage & high-value cards, established since 1976',
    turnaround: '60-90 days',
    color: 'text-amber-400',
    bestFor: 'Vintage cards over $500, PSA graded, iconic sets',
  },
  {
    name: 'Goldin',
    slug: 'goldin',
    sellerCommission: 0.08,
    buyersPremium: 0.20,
    minimumLot: 250,
    specialty: 'Modern high-end cards, celebrity-driven auctions',
    turnaround: '30-60 days',
    color: 'text-emerald-400',
    bestFor: 'Modern stars $1K+, autographs, premium parallels',
  },
  {
    name: 'PWCC',
    slug: 'pwcc',
    sellerCommission: 0.085,
    buyersPremium: 0.18,
    minimumLot: 100,
    specialty: 'Largest dedicated card auction, weekly auctions',
    turnaround: '14-30 days',
    color: 'text-blue-400',
    bestFor: 'Volume sellers, mid-range cards $100-$2K, quick turnaround',
  },
  {
    name: 'Local Card Shop (LCS)',
    slug: 'lcs',
    sellerCommission: 0.15,
    buyersPremium: 0,
    minimumLot: 0,
    specialty: 'Instant cash, no shipping, relationship-based',
    turnaround: 'Same day',
    color: 'text-purple-400',
    bestFor: 'Quick cash, low-value cards, bulk deals',
  },
  {
    name: 'eBay Auction',
    slug: 'ebay',
    sellerCommission: 0.1325,
    buyersPremium: 0,
    minimumLot: 0,
    specialty: 'Largest marketplace, widest audience, most comparable data',
    turnaround: '7-10 days',
    color: 'text-red-400',
    bestFor: 'All price points, immediate comparable data, DIY sellers',
  },
];

function parseValueRange(valueStr: string): { low: number; high: number; mid: number } {
  const numbers = valueStr.match(/[\d,]+/g);
  if (!numbers || numbers.length === 0) return { low: 0, high: 0, mid: 0 };
  const parsed = numbers.map(n => parseInt(n.replace(/,/g, ''), 10)).filter(n => !isNaN(n));
  if (parsed.length === 0) return { low: 0, high: 0, mid: 0 };
  const low = Math.min(...parsed);
  const high = Math.max(...parsed);
  return { low, high, mid: Math.round((low + high) / 2) };
}

function formatCurrency(value: number): string {
  if (Math.abs(value) >= 10000) return `$${(value / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${Math.round(value).toLocaleString()}`;
}

function estimateAuctionValue(card: SportsCard, house: AuctionHouse): {
  estimatedHammer: number;
  sellerFee: number;
  netToSeller: number;
  meetsMinimum: boolean;
} {
  const gemValue = parseValueRange(card.estimatedValueGem);
  const rawValue = parseValueRange(card.estimatedValueRaw);

  // Auction prices tend to be between raw mid and gem mid depending on house
  let estimatedHammer = Math.round((rawValue.mid + gemValue.mid) / 2);

  // Heritage gets premium on vintage (pre-1980)
  if (house.slug === 'heritage' && card.year < 1980) estimatedHammer = Math.round(estimatedHammer * 1.15);
  // Goldin gets premium on modern high-value
  if (house.slug === 'goldin' && card.year >= 2015 && estimatedHammer > 500) estimatedHammer = Math.round(estimatedHammer * 1.10);
  // PWCC is efficient for mid-range
  if (house.slug === 'pwcc' && estimatedHammer >= 100 && estimatedHammer <= 2000) estimatedHammer = Math.round(estimatedHammer * 1.05);
  // LCS pays less — they need margin to resell
  if (house.slug === 'lcs') estimatedHammer = Math.round(estimatedHammer * 0.65);

  const sellerFee = Math.round(estimatedHammer * house.sellerCommission);
  const netToSeller = estimatedHammer - sellerFee;
  const meetsMinimum = estimatedHammer >= house.minimumLot;

  return { estimatedHammer, sellerFee, netToSeller, meetsMinimum };
}

interface CardEntry {
  card: SportsCard;
  id: string;
}

export default function AuctionEstimatorClient() {
  const [query, setQuery] = useState('');
  const [selectedCards, setSelectedCards] = useState<CardEntry[]>([]);
  const [showSearch, setShowSearch] = useState(true);

  const searchResults = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    return sportsCards
      .filter(c => c.name.toLowerCase().includes(q) || c.player.toLowerCase().includes(q))
      .slice(0, 12);
  }, [query]);

  const addCard = (card: SportsCard) => {
    setSelectedCards(prev => [...prev, { card, id: `${card.slug}-${Date.now()}` }]);
    setQuery('');
    setShowSearch(false);
  };

  const removeCard = (id: string) => {
    setSelectedCards(prev => prev.filter(c => c.id !== id));
  };

  const totalsByHouse = useMemo(() => {
    return auctionHouses.map(house => {
      const results = selectedCards.map(entry => estimateAuctionValue(entry.card, house));
      const totalHammer = results.reduce((sum, r) => sum + r.estimatedHammer, 0);
      const totalFees = results.reduce((sum, r) => sum + r.sellerFee, 0);
      const totalNet = results.reduce((sum, r) => sum + r.netToSeller, 0);
      const qualifyingCards = results.filter(r => r.meetsMinimum).length;
      return { house, totalHammer, totalFees, totalNet, qualifyingCards, results };
    });
  }, [selectedCards]);

  const bestHouse = useMemo(() => {
    if (selectedCards.length === 0) return null;
    return totalsByHouse.reduce((best, current) =>
      current.totalNet > best.totalNet ? current : best
    );
  }, [totalsByHouse, selectedCards]);

  return (
    <div className="space-y-8">
      {/* Card Search */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold">Add Cards to Estimate</h3>
          {selectedCards.length > 0 && (
            <span className="text-xs text-gray-500">{selectedCards.length} card{selectedCards.length !== 1 ? 's' : ''} selected</span>
          )}
        </div>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowSearch(true); }}
            placeholder="Search by player name or card name..."
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
          />
          {showSearch && searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-64 overflow-y-auto">
              {searchResults.map(card => (
                <button
                  key={card.slug}
                  onClick={() => addCard(card)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-700 border-b border-gray-700/50 last:border-0 transition-colors"
                >
                  <p className="text-white text-sm font-medium">{card.name}</p>
                  <div className="flex gap-3 mt-1 text-xs text-gray-500">
                    <span className="capitalize">{card.sport}</span>
                    <span>Raw: {card.estimatedValueRaw}</span>
                    <span>Gem: {card.estimatedValueGem}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected cards */}
        {selectedCards.length > 0 && (
          <div className="mt-4 space-y-2">
            {selectedCards.map(entry => (
              <div key={entry.id} className="flex items-center justify-between bg-gray-800/50 rounded-lg px-3 py-2">
                <div className="min-w-0">
                  <p className="text-white text-sm truncate">{entry.card.name}</p>
                  <p className="text-gray-500 text-xs">{entry.card.player} &middot; {entry.card.sport}</p>
                </div>
                <button
                  onClick={() => removeCard(entry.id)}
                  className="ml-3 text-gray-600 hover:text-red-400 transition-colors shrink-0"
                  aria-label="Remove card"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      {selectedCards.length > 0 && (
        <>
          {/* Best recommendation */}
          {bestHouse && (
            <div className="bg-emerald-950/20 border border-emerald-800/50 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">&#9733;</span>
                <h3 className="text-emerald-400 font-bold">Best Option: {bestHouse.house.name}</h3>
              </div>
              <p className="text-gray-300 text-sm">
                For your {selectedCards.length} card{selectedCards.length !== 1 ? 's' : ''}, <span className={bestHouse.house.color}>{bestHouse.house.name}</span> gives you the highest estimated net proceeds of <span className="text-white font-bold">{formatCurrency(bestHouse.totalNet)}</span> after {(bestHouse.house.sellerCommission * 100).toFixed(1)}% commission.
              </p>
            </div>
          )}

          {/* Auction house comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {totalsByHouse.map(({ house, totalHammer, totalFees, totalNet, qualifyingCards }) => {
              const isBest = bestHouse?.house.slug === house.slug;
              return (
                <div
                  key={house.slug}
                  className={`rounded-xl border p-5 ${
                    isBest ? 'border-emerald-500/50 bg-emerald-950/10' : 'border-gray-800 bg-gray-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className={`font-bold ${house.color}`}>{house.name}</h4>
                    {isBest && (
                      <span className="text-xs font-semibold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">BEST</span>
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Est. hammer price</span>
                      <span className="text-white font-medium">{formatCurrency(totalHammer)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Commission ({(house.sellerCommission * 100).toFixed(1)}%)</span>
                      <span className="text-red-400">-{formatCurrency(totalFees)}</span>
                    </div>
                    <div className="border-t border-gray-700 pt-2 flex justify-between text-sm">
                      <span className="text-gray-400 font-medium">Net to you</span>
                      <span className="text-emerald-400 font-bold text-base">{formatCurrency(totalNet)}</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-gray-500">
                    <p>Turnaround: {house.turnaround}</p>
                    <p>Min lot: {house.minimumLot > 0 ? `$${house.minimumLot}` : 'None'}</p>
                    <p>Qualifying cards: {qualifyingCards}/{selectedCards.length}</p>
                  </div>

                  <div className="mt-3 p-2 bg-gray-800/50 rounded-lg">
                    <p className="text-gray-400 text-xs"><strong className="text-gray-300">Best for:</strong> {house.bestFor}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Per-card breakdown */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-800">
              <h3 className="text-white font-semibold">Per-Card Breakdown</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left text-gray-400 font-medium py-3 px-4">Card</th>
                    {auctionHouses.map(h => (
                      <th key={h.slug} className={`text-right font-medium py-3 px-3 ${h.color}`}>{h.name.split(' ')[0]}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  {selectedCards.map(entry => (
                    <tr key={entry.id} className="border-b border-gray-800/50">
                      <td className="py-3 px-4">
                        <p className="text-white font-medium text-xs">{entry.card.player}</p>
                        <p className="text-gray-500 text-xs truncate max-w-[180px]">{entry.card.set}</p>
                      </td>
                      {auctionHouses.map(house => {
                        const result = estimateAuctionValue(entry.card, house);
                        return (
                          <td key={house.slug} className="py-3 px-3 text-right">
                            <span className={`font-medium ${result.meetsMinimum ? 'text-emerald-400' : 'text-gray-600'}`}>
                              {formatCurrency(result.netToSeller)}
                            </span>
                            {!result.meetsMinimum && house.minimumLot > 0 && (
                              <p className="text-red-400/60 text-xs">Below min</p>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Empty state */}
      {selectedCards.length === 0 && (
        <div className="text-center py-16 bg-gray-900 border border-gray-800 rounded-xl">
          <div className="text-4xl mb-4">&#x1F3DB;</div>
          <h3 className="text-white font-semibold text-lg mb-2">Search for cards to estimate auction value</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Add cards from our database of 5,700+ sports cards. See estimated hammer prices, commission fees, and net proceeds across Heritage, Goldin, PWCC, LCS, and eBay.
          </p>
        </div>
      )}

      {/* Methodology */}
      <div className="bg-amber-950/20 border border-amber-800/30 rounded-xl px-4 py-3">
        <p className="text-amber-300/80 text-sm">
          <strong className="font-semibold">How estimates work:</strong> Hammer prices are estimated from our database of raw and gem-mint values, adjusted for each auction house&apos;s typical buyer pool and specialty. Heritage commands vintage premiums, Goldin attracts modern high-end buyers, PWCC excels in mid-range volume. LCS buy prices reflect the 35% margin dealers typically need. Commission rates are based on standard seller agreements — actual rates may vary based on consignment volume and relationship.
        </p>
      </div>
    </div>
  );
}
