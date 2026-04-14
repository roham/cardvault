'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { sportsCards, SportsCard } from '@/data/sports-cards';

const STORAGE_KEY = 'cardvault-watchlist';

interface WatchlistEntry {
  slug: string;
  addedAt: string; // ISO date
  targetPrice?: number;
  notes?: string;
}

function parsePrice(str: string): number {
  const match = str.replace(/,/g, '').match(/\$?([\d.]+)/);
  return match ? parseFloat(match[1]) : 0;
}

function parsePriceHigh(str: string): number {
  const matches = [...str.replace(/,/g, '').matchAll(/\$?([\d.]+)/g)];
  if (matches.length === 0) return 0;
  return Math.max(...matches.map(m => parseFloat(m[1])));
}

function formatCurrency(n: number): string {
  if (n >= 1000000) return '$' + (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return '$' + (n / 1000).toFixed(1) + 'K';
  return '$' + Math.round(n).toLocaleString();
}

// Deterministic "price movement" based on card slug + day — purely simulated trend data
function getDailyMovements(slug: string, basePrice: number): { prices: number[]; change: number; changePercent: number } {
  const prices: number[] = [];
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = ((hash << 5) - hash + slug.charCodeAt(i)) | 0;

  const today = Math.floor(Date.now() / 86400000);
  let price = basePrice;

  for (let d = 6; d >= 0; d--) {
    const daySeed = ((today - d) * 2654435761 + hash) >>> 0;
    const pct = ((daySeed % 1000) - 500) / 5000; // -10% to +10%
    price = price * (1 + pct);
    prices.push(Math.round(price * 100) / 100);
  }

  const first = prices[0];
  const last = prices[6];
  const change = last - first;
  const changePercent = first > 0 ? (change / first) * 100 : 0;

  return { prices, change, changePercent };
}

function Sparkline({ prices, positive }: { prices: number[]; positive: boolean }) {
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const h = 28;
  const w = 64;
  const points = prices.map((p, i) => {
    const x = (i / (prices.length - 1)) * w;
    const y = h - ((p - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={w} height={h} className="inline-block">
      <polyline
        points={points}
        fill="none"
        stroke={positive ? '#34d399' : '#f87171'}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const sportIcons: Record<string, string> = {
  baseball: '⚾',
  basketball: '🏀',
  football: '🏈',
  hockey: '🏒',
};

type SortKey = 'added' | 'name' | 'value' | 'change';

export default function WatchlistClient() {
  const [watchlist, setWatchlist] = useState<WatchlistEntry[]>([]);
  const [search, setSearch] = useState('');
  const [mounted, setMounted] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>('added');
  const [filterSport, setFilterSport] = useState<string>('all');
  const [alertsOnly, setAlertsOnly] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setWatchlist(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
    }
  }, [watchlist, mounted]);

  const cardMap = useMemo(() => {
    const map = new Map<string, SportsCard>();
    for (const c of sportsCards) map.set(c.slug, c);
    return map;
  }, []);

  const searchResults = useMemo(() => {
    if (search.length < 2) return [];
    const q = search.toLowerCase();
    const watchedSlugs = new Set(watchlist.map(w => w.slug));
    return sportsCards
      .filter(c => !watchedSlugs.has(c.slug) && (c.name.toLowerCase().includes(q) || c.player.toLowerCase().includes(q)))
      .slice(0, 8);
  }, [search, watchlist]);

  const addToWatchlist = useCallback((slug: string) => {
    setWatchlist(prev => {
      if (prev.some(w => w.slug === slug)) return prev;
      return [...prev, { slug, addedAt: new Date().toISOString() }];
    });
    setSearch('');
  }, []);

  const removeFromWatchlist = useCallback((slug: string) => {
    setWatchlist(prev => prev.filter(w => w.slug !== slug));
  }, []);

  // Compute movement data for all watched cards
  const watchedCards = useMemo(() => {
    return watchlist.map(entry => {
      const card = cardMap.get(entry.slug);
      if (!card) return null;
      const basePrice = parsePrice(card.estimatedValueRaw);
      const movements = getDailyMovements(card.slug, basePrice);
      return { entry, card, movements };
    }).filter(Boolean) as Array<{ entry: WatchlistEntry; card: SportsCard; movements: ReturnType<typeof getDailyMovements> }>;
  }, [watchlist, cardMap]);

  // Alerts: cards with >5% movement
  const alerts = useMemo(() => {
    return watchedCards.filter(wc => Math.abs(wc.movements.changePercent) > 5);
  }, [watchedCards]);

  // Sorted + filtered list
  const displayCards = useMemo(() => {
    let list = alertsOnly ? alerts : watchedCards;
    if (filterSport !== 'all') {
      list = list.filter(wc => wc.card.sport === filterSport);
    }
    const sorted = [...list];
    switch (sortBy) {
      case 'name':
        sorted.sort((a, b) => a.card.player.localeCompare(b.card.player));
        break;
      case 'value':
        sorted.sort((a, b) => parsePriceHigh(b.card.estimatedValueRaw) - parsePriceHigh(a.card.estimatedValueRaw));
        break;
      case 'change':
        sorted.sort((a, b) => Math.abs(b.movements.changePercent) - Math.abs(a.movements.changePercent));
        break;
      default: // 'added' — newest first
        sorted.sort((a, b) => b.entry.addedAt.localeCompare(a.entry.addedAt));
    }
    return sorted;
  }, [watchedCards, alerts, alertsOnly, filterSport, sortBy]);

  // Stats
  const totalValue = useMemo(() => {
    return watchedCards.reduce((sum, wc) => sum + parsePrice(wc.card.estimatedValueRaw), 0);
  }, [watchedCards]);

  const totalChange = useMemo(() => {
    return watchedCards.reduce((sum, wc) => sum + wc.movements.change, 0);
  }, [watchedCards]);

  const totalChangePercent = totalValue > 0 ? (totalChange / totalValue) * 100 : 0;

  // Share via URL hash
  const shareWatchlist = useCallback(() => {
    const slugs = watchlist.map(w => w.slug).join(',');
    const encoded = btoa(slugs);
    const url = `${window.location.origin}/tools/watchlist#${encoded}`;
    navigator.clipboard.writeText(url);
  }, [watchlist]);

  // Import from URL hash on mount
  useEffect(() => {
    if (!mounted) return;
    const hash = window.location.hash.slice(1);
    if (!hash || watchlist.length > 0) return;
    try {
      const decoded = atob(hash);
      const slugs = decoded.split(',').filter(Boolean);
      const entries: WatchlistEntry[] = slugs
        .filter(s => cardMap.has(s))
        .map(s => ({ slug: s, addedAt: new Date().toISOString() }));
      if (entries.length > 0) setWatchlist(entries);
    } catch { /* invalid hash */ }
  }, [mounted, cardMap, watchlist.length]);

  // Sports present in watchlist
  const sportsInWatchlist = useMemo(() => {
    const set = new Set(watchedCards.map(wc => wc.card.sport));
    return Array.from(set).sort();
  }, [watchedCards]);

  if (!mounted) {
    return <div className="text-center py-20 text-gray-500">Loading watchlist...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Alerts Banner */}
      {alerts.length > 0 && (
        <div className="bg-amber-950/40 border border-amber-800/50 rounded-xl p-4">
          <h3 className="text-amber-400 font-semibold text-sm mb-2">
            Price Alerts ({alerts.length})
          </h3>
          <div className="space-y-2">
            {alerts.slice(0, 3).map(({ card, movements }) => (
              <div key={card.slug} className="flex items-center justify-between text-sm">
                <span className="text-white truncate mr-3">{card.name}</span>
                <span className={movements.changePercent > 0 ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>
                  {movements.changePercent > 0 ? '+' : ''}{movements.changePercent.toFixed(1)}%
                </span>
              </div>
            ))}
            {alerts.length > 3 && (
              <button onClick={() => setAlertsOnly(true)} className="text-amber-400 text-xs hover:text-amber-300 transition-colors">
                View all {alerts.length} alerts
              </button>
            )}
          </div>
        </div>
      )}

      {/* Stats Bar */}
      {watchedCards.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Watching</p>
            <p className="text-white text-2xl font-bold">{watchedCards.length}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Total Value</p>
            <p className="text-white text-2xl font-bold">{formatCurrency(totalValue)}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">7-Day Change</p>
            <p className={`text-2xl font-bold ${totalChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {totalChange >= 0 ? '+' : ''}{formatCurrency(Math.abs(totalChange))}
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Alerts</p>
            <p className="text-amber-400 text-2xl font-bold">{alerts.length}</p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search cards to add to watchlist..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
        />
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-gray-900 border border-gray-700 rounded-xl overflow-hidden shadow-xl max-h-80 overflow-y-auto">
            {searchResults.map(card => (
              <button
                key={card.slug}
                onClick={() => addToWatchlist(card.slug)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition-colors text-left border-b border-gray-800 last:border-0"
              >
                <span className="text-lg shrink-0">{sportIcons[card.sport] || '🃏'}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-white text-sm font-medium truncate">{card.name}</p>
                  <p className="text-gray-500 text-xs">{card.player} · {card.estimatedValueRaw}</p>
                </div>
                <span className="text-emerald-400 text-xs font-medium shrink-0">+ Watch</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filters & Sort */}
      {watchedCards.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-1.5">
            {(['all', ...sportsInWatchlist] as string[]).map(sport => (
              <button
                key={sport}
                onClick={() => setFilterSport(sport)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterSport === sport
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {sport === 'all' ? 'All' : `${sportIcons[sport] || ''} ${sport.charAt(0).toUpperCase() + sport.slice(1)}`}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5 ml-auto">
            {([
              { key: 'added' as SortKey, label: 'Recent' },
              { key: 'name' as SortKey, label: 'Name' },
              { key: 'value' as SortKey, label: 'Value' },
              { key: 'change' as SortKey, label: 'Change' },
            ]).map(s => (
              <button
                key={s.key}
                onClick={() => setSortBy(s.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  sortBy === s.key
                    ? 'bg-gray-700 text-white'
                    : 'bg-gray-800/50 text-gray-500 hover:bg-gray-800 hover:text-gray-300'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          {alertsOnly && (
            <button
              onClick={() => setAlertsOnly(false)}
              className="text-amber-400 text-xs hover:text-amber-300 transition-colors"
            >
              Show all cards
            </button>
          )}
        </div>
      )}

      {/* Watchlist Cards */}
      {displayCards.length > 0 ? (
        <div className="space-y-3">
          {displayCards.map(({ entry, card, movements }) => {
            const basePrice = parsePrice(card.estimatedValueRaw);
            const currentPrice = movements.prices[6];
            const isPositive = movements.changePercent >= 0;
            return (
              <div key={card.slug} className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors">
                <div className="flex items-start gap-4">
                  {/* Sport icon */}
                  <div className="text-2xl shrink-0 mt-1">{sportIcons[card.sport] || '🃏'}</div>

                  {/* Card info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link href={`/sports/${card.slug}`} className="text-white font-semibold text-sm hover:text-emerald-400 transition-colors block truncate">
                          {card.name}
                        </Link>
                        <p className="text-gray-500 text-xs mt-0.5">{card.player} · {card.set}</p>
                      </div>
                      {/* Sparkline + change */}
                      <div className="shrink-0 text-right">
                        <Sparkline prices={movements.prices} positive={isPositive} />
                        <p className={`text-xs font-semibold mt-1 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                          {isPositive ? '+' : ''}{movements.changePercent.toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    {/* Price row */}
                    <div className="flex items-center gap-4 mt-3">
                      <div>
                        <p className="text-gray-500 text-xs">Current Est.</p>
                        <p className="text-white font-bold text-sm">{formatCurrency(currentPrice)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">7d Change</p>
                        <p className={`font-bold text-sm ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                          {isPositive ? '+' : ''}{formatCurrency(Math.abs(movements.change))}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Gem Mint</p>
                        <p className="text-gray-300 font-medium text-sm">{card.estimatedValueGem.split('(')[0].trim()}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-3">
                      <a
                        href={card.ebaySearchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:text-blue-300 bg-blue-950/40 border border-blue-800/40 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        Check eBay
                      </a>
                      <Link
                        href={`/sports/${card.slug}`}
                        className="text-xs text-gray-400 hover:text-white bg-gray-800 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        Card Details
                      </Link>
                      <button
                        onClick={() => removeFromWatchlist(card.slug)}
                        className="text-xs text-red-400/60 hover:text-red-400 ml-auto transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : watchedCards.length > 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">No cards match your filters</p>
          <button onClick={() => { setFilterSport('all'); setAlertsOnly(false); }} className="text-emerald-400 text-sm hover:text-emerald-300 transition-colors">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="text-center py-16 border border-dashed border-gray-800 rounded-2xl">
          <p className="text-4xl mb-4">👀</p>
          <h3 className="text-white text-lg font-semibold mb-2">Your watchlist is empty</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
            Search for cards above to start tracking prices. Get alerts when cards move more than 5% in a week.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {['Michael Jordan', 'Mike Trout', 'Patrick Mahomes', 'Wayne Gretzky'].map(name => (
              <button
                key={name}
                onClick={() => setSearch(name)}
                className="text-xs text-gray-400 bg-gray-800 hover:bg-gray-700 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer actions */}
      {watchedCards.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-800">
          <button
            onClick={shareWatchlist}
            className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 border border-emerald-800/40 px-4 py-2 rounded-xl transition-colors"
          >
            Share Watchlist
          </button>
          <Link
            href="/tools/collection-value"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white bg-gray-800 px-4 py-2 rounded-xl transition-colors"
          >
            Collection Value
          </Link>
          <p className="text-gray-600 text-xs ml-auto">
            Simulated 7-day trends. Prices are estimates, not live market data.
          </p>
        </div>
      )}
    </div>
  );
}
