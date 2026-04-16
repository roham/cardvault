'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

const SPORT_ICONS: Record<string, string> = {
  baseball: '⚾', basketball: '🏀', football: '🏈', hockey: '🏒',
};
const SPORT_COLORS: Record<string, string> = {
  baseball: 'text-red-400', basketball: 'text-orange-400', football: 'text-blue-400', hockey: 'text-cyan-400',
};
const SPORT_BG: Record<string, string> = {
  baseball: 'border-red-800/30', basketball: 'border-orange-800/30', football: 'border-blue-800/30', hockey: 'border-cyan-800/30',
};

type DealType = 'price-drop' | 'undervalued' | 'hot-buy' | 'flash-sale' | 'buy-the-dip';

const DEAL_LABELS: Record<DealType, { label: string; color: string; bg: string }> = {
  'price-drop': { label: 'PRICE DROP', color: 'text-red-400', bg: 'bg-red-950/50 border-red-700/40' },
  'undervalued': { label: 'UNDERVALUED', color: 'text-emerald-400', bg: 'bg-emerald-950/50 border-emerald-700/40' },
  'hot-buy': { label: 'HOT BUY', color: 'text-orange-400', bg: 'bg-orange-950/50 border-orange-700/40' },
  'flash-sale': { label: 'FLASH SALE', color: 'text-yellow-400', bg: 'bg-yellow-950/50 border-yellow-700/40' },
  'buy-the-dip': { label: 'BUY THE DIP', color: 'text-purple-400', bg: 'bg-purple-950/50 border-purple-700/40' },
};

const PLATFORMS = ['eBay', 'COMC', 'MySlabs', 'Card Show', 'Facebook Group', 'Mercari'];
const REASONS = [
  'Seller needs quick sale', 'Listed late at night', 'Misspelled title — low visibility',
  'Ending soon, no watchers', 'Below recent comps by 20%+', 'Freshly listed below market',
  'Estate sale pricing', 'New seller — no reputation premium', 'Buy-it-now below auction avg',
  'Seasonal low — will rise in playoffs', 'Injury news already priced in',
  'Post-hype correction — value stabilizing', 'Off-season dip on in-season star',
];

interface Deal {
  card: typeof sportsCards[0];
  dealType: DealType;
  discount: number;
  listPrice: number;
  marketPrice: number;
  platform: string;
  reason: string;
  timeAgo: string;
  id: string;
}

function seededRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xFFFFFFFF;
    return (s >>> 0) / 0xFFFFFFFF;
  };
}

function parseValue(raw: string): number {
  const m = raw.match(/\$(\d[\d,]*)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 5;
}

function generateDeal(card: typeof sportsCards[0], rng: () => number, index: number): Deal {
  const dealTypes: DealType[] = ['price-drop', 'undervalued', 'hot-buy', 'flash-sale', 'buy-the-dip'];
  const dealType = dealTypes[Math.floor(rng() * dealTypes.length)];
  const marketPrice = parseValue(card.estimatedValueRaw);
  const discount = Math.floor(15 + rng() * 35); // 15-50% off
  const listPrice = Math.round(marketPrice * (1 - discount / 100));
  const platform = PLATFORMS[Math.floor(rng() * PLATFORMS.length)];
  const reason = REASONS[Math.floor(rng() * REASONS.length)];
  const minutes = Math.floor(1 + rng() * 120);
  const timeAgo = minutes < 60 ? `${minutes}m ago` : `${Math.floor(minutes / 60)}h ago`;
  return { card, dealType, discount, listPrice: Math.max(listPrice, 1), marketPrice, platform, reason, timeAgo, id: `deal-${index}-${card.slug}` };
}

export default function HotDealsClient() {
  const [sportFilter, setSportFilter] = useState<string>('all');
  const [dealTypeFilter, setDealTypeFilter] = useState<DealType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'discount' | 'value'>('newest');
  const [page, setPage] = useState(0);

  const allDeals = useMemo(() => {
    const now = new Date();
    const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
    const rng = seededRng(seed);

    // Generate 60 deals from random cards
    const eligible = sportsCards.filter(c => parseValue(c.estimatedValueRaw) >= 5);
    const deals: Deal[] = [];
    const used = new Set<string>();

    for (let i = 0; i < 60 && deals.length < 60; i++) {
      const idx = Math.floor(rng() * eligible.length);
      const card = eligible[idx];
      if (used.has(card.slug)) continue;
      used.add(card.slug);
      deals.push(generateDeal(card, rng, i));
    }

    return deals;
  }, []);

  const filtered = useMemo(() => {
    let list = [...allDeals];
    if (sportFilter !== 'all') list = list.filter(d => d.card.sport === sportFilter);
    if (dealTypeFilter !== 'all') list = list.filter(d => d.dealType === dealTypeFilter);
    if (sortBy === 'discount') list.sort((a, b) => b.discount - a.discount);
    else if (sortBy === 'value') list.sort((a, b) => b.marketPrice - a.marketPrice);
    return list;
  }, [allDeals, sportFilter, dealTypeFilter, sortBy]);

  const pageSize = 15;
  const pageDeals = filtered.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  // Stats
  const avgDiscount = Math.round(allDeals.reduce((s, d) => s + d.discount, 0) / allDeals.length);
  const totalSavings = allDeals.reduce((s, d) => s + (d.marketPrice - d.listPrice), 0);

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-white">{allDeals.length}</p>
          <p className="text-xs text-gray-400">Deals Today</p>
        </div>
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-emerald-400">{avgDiscount}%</p>
          <p className="text-xs text-gray-400">Avg Discount</p>
        </div>
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-yellow-400">${totalSavings.toLocaleString()}</p>
          <p className="text-xs text-gray-400">Total Savings</p>
        </div>
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-red-400">{allDeals.filter(d => d.discount >= 30).length}</p>
          <p className="text-xs text-gray-400">30%+ Deals</p>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex gap-2 flex-wrap">
          {['all', 'baseball', 'basketball', 'football', 'hockey'].map(s => (
            <button key={s} onClick={() => { setSportFilter(s); setPage(0); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${sportFilter === s ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
              {s === 'all' ? 'All Sports' : `${SPORT_ICONS[s] ?? ''} ${s.charAt(0).toUpperCase() + s.slice(1)}`}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => { setDealTypeFilter('all'); setPage(0); }}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${dealTypeFilter === 'all' ? 'bg-gray-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
            All Types
          </button>
          {(Object.keys(DEAL_LABELS) as DealType[]).map(dt => (
            <button key={dt} onClick={() => { setDealTypeFilter(dealTypeFilter === dt ? 'all' : dt); setPage(0); }}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${dealTypeFilter === dt ? DEAL_LABELS[dt].bg + ' ' + DEAL_LABELS[dt].color : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
              {DEAL_LABELS[dt].label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <span className="text-xs text-gray-500 self-center">Sort:</span>
          {([['newest', 'Newest'], ['discount', 'Best Discount'], ['value', 'Highest Value']] as const).map(([val, lbl]) => (
            <button key={val} onClick={() => setSortBy(val)}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${sortBy === val ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-white'}`}>
              {lbl}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-gray-500">{filtered.length} deal{filtered.length !== 1 ? 's' : ''} found</p>

      {/* Deal Cards */}
      <div className="space-y-3">
        {pageDeals.map(deal => {
          const info = DEAL_LABELS[deal.dealType];
          return (
            <div key={deal.id} className={`bg-gray-800/30 border ${SPORT_BG[deal.card.sport] ?? 'border-gray-700/50'} rounded-xl p-4 hover:border-gray-500/50 transition-colors`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${info.bg} ${info.color}`}>{info.label}</span>
                    <span className="text-xs text-gray-500">{deal.timeAgo}</span>
                    <span className="text-xs text-gray-600">{deal.platform}</span>
                  </div>
                  <Link href={`/sports/${deal.card.slug}`} className="text-white font-medium hover:text-blue-400 transition-colors text-sm">
                    {deal.card.name}
                  </Link>
                  <p className="text-xs text-gray-400 mt-0.5">
                    <span className={SPORT_COLORS[deal.card.sport] ?? ''}>{SPORT_ICONS[deal.card.sport] ?? ''} {deal.card.player}</span>
                    {' '}&middot; {deal.card.year} &middot; {deal.card.set}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 italic">{deal.reason}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-bold text-emerald-400">${deal.listPrice}</p>
                  <p className="text-xs text-gray-500 line-through">${deal.marketPrice}</p>
                  <p className="text-xs font-bold text-red-400">-{deal.discount}%</p>
                </div>
              </div>
              <div className="mt-2 flex gap-2">
                <Link href={deal.card.ebaySearchUrl} target="_blank" className="text-xs text-blue-400 hover:text-blue-300">
                  Search eBay
                </Link>
                <span className="text-gray-700">|</span>
                <Link href={`/sports/${deal.card.slug}`} className="text-xs text-blue-400 hover:text-blue-300">
                  Card Details
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}
            className="px-3 py-1.5 rounded text-sm bg-gray-800 text-gray-400 hover:text-white disabled:opacity-40">
            Prev
          </button>
          <span className="px-3 py-1.5 text-sm text-gray-400">
            {page + 1} / {totalPages}
          </span>
          <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1}
            className="px-3 py-1.5 rounded text-sm bg-gray-800 text-gray-400 hover:text-white disabled:opacity-40">
            Next
          </button>
        </div>
      )}

      {/* Tips Section */}
      <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-5">
        <h2 className="text-lg font-bold text-white mb-3">Deal Hunting Tips</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium text-white mb-1">Check Sold Comps First</p>
            <p className="text-gray-400">Always verify the market price with recent eBay sold listings before buying. A deal is only a deal if the discount is real.</p>
          </div>
          <div>
            <p className="font-medium text-white mb-1">Buy the Dip on Injuries</p>
            <p className="text-gray-400">Player injuries temporarily crash card prices. If the player will recover, buying during the dip and holding through recovery is a proven strategy.</p>
          </div>
          <div>
            <p className="font-medium text-white mb-1">Off-Season Buying</p>
            <p className="text-gray-400">Football cards are cheapest in summer, basketball in fall, baseball in winter. Buy when nobody is looking and sell when demand peaks.</p>
          </div>
          <div>
            <p className="font-medium text-white mb-1">Misspellings = Hidden Deals</p>
            <p className="text-gray-400">Search for common misspellings of player names on eBay. Listings with typos get fewer views, which means lower prices for you.</p>
          </div>
        </div>
      </div>

      {/* Related Links */}
      <div className="border-t border-gray-800 pt-6">
        <h2 className="text-lg font-bold text-white mb-3">More Market Tools</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <Link href="/market-movers" className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-3 hover:border-gray-500/50 transition-colors">
            <p className="text-sm font-medium text-white">Market Movers</p>
            <p className="text-xs text-gray-400">Today's biggest price changes</p>
          </Link>
          <Link href="/tools/flip-calc" className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-3 hover:border-gray-500/50 transition-colors">
            <p className="text-sm font-medium text-white">Flip Calculator</p>
            <p className="text-xs text-gray-400">Calculate profit after fees</p>
          </Link>
          <Link href="/tools/watchlist" className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-3 hover:border-gray-500/50 transition-colors">
            <p className="text-sm font-medium text-white">Price Watchlist</p>
            <p className="text-xs text-gray-400">Track cards and get price alerts</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
