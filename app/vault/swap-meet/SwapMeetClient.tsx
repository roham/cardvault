'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

/* ─── helpers ─── */
function parseValue(est: string): number {
  const m = est.match(/\$([0-9,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) || 5 : 5;
}

function fmt(n: number): string {
  if (n >= 10000) return `$${(n / 1000).toFixed(0)}K`;
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${n.toLocaleString()}`;
}

/* Deterministic hash for "other collector" listings — rotates daily */
function dayHash(): number {
  const d = new Date();
  return (d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()) % 2147483647;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

/* Fake collector names */
const COLLECTOR_NAMES = [
  'CardFlipKing', 'VintageVault99', 'RookieHunter23', 'WaxRipperMike',
  'GemMint10Dave', 'TheHobbyShop', 'SlabCollector', 'PackRipJess',
  'DiamondDealer55', 'HallOfFameCards', 'GrailChaser', 'ToppsKing88',
  'PrizmHunter', 'ChromeChaser', 'BoxBreakBoss', 'CardShowTony',
];

/* Trade fairness */
function fairnessRating(yourValue: number, theirValue: number): { label: string; color: string; emoji: string } {
  const ratio = yourValue > 0 ? theirValue / yourValue : 0;
  if (ratio >= 1.15) return { label: 'Great Deal', color: 'text-emerald-400', emoji: '🔥' };
  if (ratio >= 0.95) return { label: 'Fair Trade', color: 'text-blue-400', emoji: '🤝' };
  if (ratio >= 0.80) return { label: 'Slightly Under', color: 'text-yellow-400', emoji: '⚠️' };
  return { label: 'Bad Deal', color: 'text-red-400', emoji: '🚫' };
}

type CardEntry = typeof sportsCards[0] & { _idx: number };

interface Listing {
  card: CardEntry;
  collector: string;
  wantsSport: string;
  wantsEra: string;
  listedAgo: string;
}

interface TradeProposal {
  yourCards: CardEntry[];
  theirListing: Listing;
  status: 'pending' | 'accepted' | 'rejected' | 'countered';
  timestamp: number;
}

export default function SwapMeetClient() {
  const [tab, setTab] = useState<'browse' | 'my-listings' | 'trades'>('browse');
  const [sportFilter, setSportFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [myCards, setMyCards] = useState<CardEntry[]>([]);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [tradeCards, setTradeCards] = useState<CardEntry[]>([]);
  const [tradeHistory, setTradeHistory] = useState<TradeProposal[]>([]);
  const [addSearch, setAddSearch] = useState('');
  const [myListingSearch, setMyListingSearch] = useState('');
  const [myListings, setMyListings] = useState<CardEntry[]>([]);

  /* Load trade history from localStorage */
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cv-swap-history');
      if (saved) setTradeHistory(JSON.parse(saved));
    } catch {}
  }, []);

  /* Save trade history */
  const saveHistory = useCallback((trades: TradeProposal[]) => {
    setTradeHistory(trades);
    try { localStorage.setItem('cv-swap-history', JSON.stringify(trades.slice(-20))); } catch {}
  }, []);

  /* Generate "other collector" listings — deterministic daily rotation */
  const otherListings = useMemo(() => {
    const rand = seededRandom(dayHash());
    const all = sportsCards.map((c, i) => ({ ...c, _idx: i } as CardEntry));
    const shuffled = all.sort(() => rand() - 0.5);
    const selected = shuffled.slice(0, 24);
    const times = ['2m ago', '8m ago', '15m ago', '22m ago', '35m ago', '1h ago', '1h ago', '2h ago', '3h ago', '4h ago', '5h ago', '6h ago', '8h ago', '10h ago', '12h ago', '14h ago', '16h ago', '18h ago', '20h ago', '22h ago', '1d ago', '1d ago', '2d ago', '2d ago'];
    const sports = ['baseball', 'basketball', 'football', 'hockey'];
    const eras = ['Modern (2020+)', 'Recent (2010-2019)', 'Vintage (pre-2000)', 'Any era'];

    return selected.map((card, i): Listing => ({
      card,
      collector: COLLECTOR_NAMES[Math.floor(rand() * COLLECTOR_NAMES.length)],
      wantsSport: sports[Math.floor(rand() * sports.length)],
      wantsEra: eras[Math.floor(rand() * eras.length)],
      listedAgo: times[i] || '1d ago',
    }));
  }, []);

  /* Filtered listings */
  const filteredListings = useMemo(() => {
    return otherListings.filter(l => {
      if (sportFilter !== 'all' && l.card.sport !== sportFilter) return false;
      if (searchTerm.length >= 2) {
        const q = searchTerm.toLowerCase();
        const haystack = `${l.card.player} ${l.card.name} ${l.card.set} ${l.collector}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [otherListings, sportFilter, searchTerm]);

  /* Search for cards to add to my collection/trade */
  const cardSearchResults = useMemo(() => {
    const q = addSearch.toLowerCase();
    if (q.length < 2) return [];
    return sportsCards
      .map((c, i) => ({ ...c, _idx: i } as CardEntry))
      .filter(c => `${c.player} ${c.name} ${c.set}`.toLowerCase().includes(q))
      .slice(0, 10);
  }, [addSearch]);

  /* My listing search */
  const myListingResults = useMemo(() => {
    const q = myListingSearch.toLowerCase();
    if (q.length < 2) return [];
    return sportsCards
      .map((c, i) => ({ ...c, _idx: i } as CardEntry))
      .filter(c => `${c.player} ${c.name} ${c.set}`.toLowerCase().includes(q))
      .filter(c => !myListings.some(ml => ml._idx === c._idx))
      .slice(0, 10);
  }, [myListingSearch, myListings]);

  /* Add card to trade offer */
  const addToTrade = useCallback((card: CardEntry) => {
    setTradeCards(prev => {
      if (prev.length >= 5) return prev;
      if (prev.some(c => c._idx === card._idx)) return prev;
      return [...prev, card];
    });
    setAddSearch('');
  }, []);

  /* Submit trade */
  const submitTrade = useCallback(() => {
    if (!selectedListing || tradeCards.length === 0) return;
    const yourValue = tradeCards.reduce((s, c) => s + parseValue(c.estimatedValueRaw), 0);
    const theirValue = parseValue(selectedListing.card.estimatedValueRaw);
    const fair = fairnessRating(yourValue, theirValue);

    // Simulate response based on fairness
    const rand = seededRandom(Date.now());
    let status: TradeProposal['status'] = 'rejected';
    if (fair.label === 'Great Deal') status = 'accepted';
    else if (fair.label === 'Fair Trade') status = rand() > 0.3 ? 'accepted' : 'countered';
    else if (fair.label === 'Slightly Under') status = rand() > 0.6 ? 'countered' : 'rejected';

    const proposal: TradeProposal = {
      yourCards: [...tradeCards],
      theirListing: selectedListing,
      status,
      timestamp: Date.now(),
    };

    const updated = [...tradeHistory, proposal];
    saveHistory(updated);
    setTradeCards([]);
    setSelectedListing(null);
    setTab('trades');
  }, [selectedListing, tradeCards, tradeHistory, saveHistory]);

  const yourTradeValue = tradeCards.reduce((s, c) => s + parseValue(c.estimatedValueRaw), 0);
  const theirTradeValue = selectedListing ? parseValue(selectedListing.card.estimatedValueRaw) : 0;
  const fairness = selectedListing && tradeCards.length > 0 ? fairnessRating(yourTradeValue, theirTradeValue) : null;

  return (
    <div className="space-y-6">
      {/* Tab nav */}
      <div className="flex gap-2 border-b border-gray-800 pb-3">
        {[
          { key: 'browse' as const, label: 'Browse Listings', count: filteredListings.length },
          { key: 'my-listings' as const, label: 'My Listings', count: myListings.length },
          { key: 'trades' as const, label: 'Trade History', count: tradeHistory.length },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key
                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {t.label} <span className="text-xs opacity-60">({t.count})</span>
          </button>
        ))}
      </div>

      {/* ─── Browse Tab ─── */}
      {tab === 'browse' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search listings..."
              className="flex-1 min-w-[200px] px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-600 text-sm"
            />
            <select
              value={sportFilter}
              onChange={e => setSportFilter(e.target.value)}
              className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-600"
            >
              <option value="all">All Sports</option>
              <option value="baseball">Baseball</option>
              <option value="basketball">Basketball</option>
              <option value="football">Football</option>
              <option value="hockey">Hockey</option>
            </select>
          </div>

          {/* Listings grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredListings.map((listing, i) => (
              <button
                key={i}
                onClick={() => { setSelectedListing(listing); setTradeCards([]); }}
                className={`text-left p-4 rounded-xl border transition-all ${
                  selectedListing === listing
                    ? 'bg-emerald-950/30 border-emerald-600 ring-1 ring-emerald-600/50'
                    : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">{listing.listedAgo}</span>
                  <span className="text-xs px-2 py-0.5 bg-gray-800 border border-gray-700 rounded-full text-gray-400">
                    {listing.card.sport}
                  </span>
                </div>
                <div className="text-white font-semibold text-sm truncate">{listing.card.player}</div>
                <div className="text-gray-500 text-xs truncate mb-2">{listing.card.name}</div>
                <div className="text-emerald-400 font-bold text-sm mb-2">{listing.card.estimatedValueRaw}</div>
                <div className="text-xs text-gray-500">
                  <span className="text-gray-400">{listing.collector}</span> wants: {listing.wantsSport} &middot; {listing.wantsEra}
                </div>
              </button>
            ))}
          </div>

          {filteredListings.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p className="text-4xl mb-2">🔍</p>
              <p>No listings match your filters</p>
            </div>
          )}
        </div>
      )}

      {/* ─── My Listings Tab ─── */}
      {tab === 'my-listings' && (
        <div className="space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-white font-bold mb-3">List Cards for Trade</h3>
            <p className="text-gray-400 text-sm mb-4">Add cards you want to trade. Other collectors will see these in the swap meet.</p>

            <div className="relative mb-4">
              <input
                type="text"
                value={myListingSearch}
                onChange={e => setMyListingSearch(e.target.value)}
                placeholder="Search cards to list..."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-600 text-sm"
              />
              {myListingResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-20 max-h-60 overflow-y-auto">
                  {myListingResults.map(card => (
                    <button
                      key={card._idx}
                      onClick={() => { setMyListings(prev => [...prev, card].slice(0, 12)); setMyListingSearch(''); }}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-700 transition-colors border-b border-gray-700/50 last:border-0"
                    >
                      <span className="text-white text-sm font-medium">{card.player}</span>
                      <span className="text-gray-400 text-xs ml-2">{card.name}</span>
                      <span className="text-emerald-400 text-xs ml-2">{card.estimatedValueRaw}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {myListings.length > 0 ? (
              <div className="space-y-2">
                {myListings.map((card, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-800/80 border border-gray-700/50 rounded-lg px-3 py-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-white text-sm font-medium truncate">{card.player}</div>
                      <div className="text-gray-500 text-xs truncate">{card.name}</div>
                    </div>
                    <div className="flex items-center gap-2 ml-2 shrink-0">
                      <span className="text-emerald-400 text-sm font-medium">{card.estimatedValueRaw}</span>
                      <button
                        onClick={() => setMyListings(prev => prev.filter((_, j) => j !== i))}
                        className="text-gray-600 hover:text-red-400 transition-colors text-lg leading-none"
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                ))}
                <div className="text-gray-500 text-xs mt-2">
                  Total listed value: <span className="text-emerald-400 font-bold">{fmt(myListings.reduce((s, c) => s + parseValue(c.estimatedValueRaw), 0))}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p className="text-3xl mb-1">📋</p>
                <p className="text-sm">Search for cards above to list them for trade</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Trades Tab ─── */}
      {tab === 'trades' && (
        <div className="space-y-4">
          {tradeHistory.length > 0 ? (
            [...tradeHistory].reverse().map((trade, i) => {
              const yourVal = trade.yourCards.reduce((s, c) => s + parseValue(c.estimatedValueRaw), 0);
              const theirVal = parseValue(trade.theirListing.card.estimatedValueRaw);
              const statusColors = {
                accepted: { bg: 'bg-emerald-950/40', text: 'text-emerald-400', border: 'border-emerald-800/50', label: 'Accepted' },
                rejected: { bg: 'bg-red-950/40', text: 'text-red-400', border: 'border-red-800/50', label: 'Rejected' },
                countered: { bg: 'bg-yellow-950/40', text: 'text-yellow-400', border: 'border-yellow-800/50', label: 'Countered' },
                pending: { bg: 'bg-blue-950/40', text: 'text-blue-400', border: 'border-blue-800/50', label: 'Pending' },
              };
              const sc = statusColors[trade.status];
              return (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${sc.bg} ${sc.text} ${sc.border} border font-medium`}>
                      {sc.label}
                    </span>
                    <span className="text-gray-500 text-xs">{new Date(trade.timestamp).toLocaleDateString()}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-gray-500 text-xs mb-1">You offered ({fmt(yourVal)})</div>
                      {trade.yourCards.map((c, j) => (
                        <div key={j} className="text-white text-sm truncate">{c.player} <span className="text-gray-500 text-xs">{c.estimatedValueRaw}</span></div>
                      ))}
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs mb-1">For ({fmt(theirVal)})</div>
                      <div className="text-white text-sm truncate">{trade.theirListing.card.player} <span className="text-gray-500 text-xs">{trade.theirListing.card.estimatedValueRaw}</span></div>
                      <div className="text-gray-500 text-xs">from {trade.theirListing.collector}</div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-10 text-gray-500">
              <p className="text-4xl mb-2">📦</p>
              <p className="text-sm">No trades yet. Browse listings and make an offer!</p>
            </div>
          )}
          {tradeHistory.length > 0 && (
            <button
              onClick={() => { saveHistory([]); }}
              className="text-xs text-gray-600 hover:text-red-400 transition-colors"
            >
              Clear trade history
            </button>
          )}
        </div>
      )}

      {/* ─── Trade Panel (when listing selected) ─── */}
      {selectedListing && tab === 'browse' && (
        <div className="bg-gray-900 border border-emerald-800/50 rounded-2xl p-6">
          <h3 className="text-white font-bold mb-1">Propose a Trade</h3>
          <p className="text-gray-400 text-sm mb-4">
            Trade with <span className="text-emerald-400">{selectedListing.collector}</span> for their <span className="text-white">{selectedListing.card.player}</span> ({selectedListing.card.estimatedValueRaw})
          </p>

          {/* Their card */}
          <div className="bg-gray-800/60 rounded-xl p-4 mb-4">
            <div className="text-gray-500 text-xs mb-1">They&apos;re offering</div>
            <div className="text-white font-semibold">{selectedListing.card.player}</div>
            <div className="text-gray-400 text-xs">{selectedListing.card.name}</div>
            <div className="text-emerald-400 font-bold mt-1">{selectedListing.card.estimatedValueRaw}</div>
            <div className="text-gray-500 text-xs mt-1">Looking for: {selectedListing.wantsSport} &middot; {selectedListing.wantsEra}</div>
          </div>

          {/* Your cards */}
          <div className="mb-4">
            <div className="text-gray-400 text-sm mb-2">Your offer (up to 5 cards):</div>
            <div className="relative mb-2">
              <input
                type="text"
                value={addSearch}
                onChange={e => setAddSearch(e.target.value)}
                placeholder="Search cards to offer..."
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-600 text-sm"
              />
              {cardSearchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-20 max-h-48 overflow-y-auto">
                  {cardSearchResults.map(card => (
                    <button
                      key={card._idx}
                      onClick={() => addToTrade(card)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors border-b border-gray-700/50 last:border-0"
                    >
                      <span className="text-white text-sm">{card.player}</span>
                      <span className="text-gray-400 text-xs ml-2">{card.name}</span>
                      <span className="text-emerald-400 text-xs ml-2">{card.estimatedValueRaw}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {tradeCards.length > 0 && (
              <div className="space-y-1.5">
                {tradeCards.map((card, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-800/60 rounded-lg px-3 py-1.5">
                    <div className="text-white text-sm truncate">{card.player} <span className="text-gray-500 text-xs">{card.name}</span></div>
                    <div className="flex items-center gap-2 ml-2 shrink-0">
                      <span className="text-emerald-400 text-xs">{card.estimatedValueRaw}</span>
                      <button onClick={() => setTradeCards(prev => prev.filter((_, j) => j !== i))} className="text-gray-600 hover:text-red-400 text-sm">&times;</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Trade summary */}
          {tradeCards.length > 0 && (
            <div className="bg-gray-800/40 rounded-xl p-4 mb-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-gray-500 text-xs">Your Offer</div>
                  <div className="text-white font-bold">{fmt(yourTradeValue)}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs">Their Card</div>
                  <div className="text-white font-bold">{fmt(theirTradeValue)}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs">Fairness</div>
                  {fairness && (
                    <div className={`font-bold ${fairness.color}`}>
                      {fairness.emoji} {fairness.label}
                    </div>
                  )}
                </div>
              </div>
              {yourTradeValue !== theirTradeValue && (
                <div className="text-center mt-2 text-xs text-gray-500">
                  Difference: <span className={yourTradeValue > theirTradeValue ? 'text-red-400' : 'text-emerald-400'}>
                    {fmt(Math.abs(yourTradeValue - theirTradeValue))} {yourTradeValue > theirTradeValue ? 'over' : 'under'}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={submitTrade}
              disabled={tradeCards.length === 0}
              className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-xl transition-colors text-sm"
            >
              Send Trade Offer
            </button>
            <button
              onClick={() => { setSelectedListing(null); setTradeCards([]); }}
              className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Stats bar */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-gray-500 text-xs">Active Listings</div>
            <div className="text-white font-bold">{otherListings.length}</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs">Your Listings</div>
            <div className="text-white font-bold">{myListings.length}</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs">Total Trades</div>
            <div className="text-white font-bold">{tradeHistory.length}</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs">Accepted</div>
            <div className="text-emerald-400 font-bold">{tradeHistory.filter(t => t.status === 'accepted').length}</div>
          </div>
        </div>
      </div>

      {/* Related links */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h3 className="text-white font-bold mb-3">Related</h3>
        <div className="flex flex-wrap gap-2">
          {[
            { href: '/tools/trade', label: 'Trade Evaluator' },
            { href: '/vault', label: 'My Vault' },
            { href: '/vault/showcase', label: 'Collection Showcase' },
            { href: '/marketplace', label: 'Marketplace' },
            { href: '/tools/collection-value', label: 'Collection Value' },
            { href: '/trading-sim', label: 'Trading Simulator' },
          ].map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm text-gray-300 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
