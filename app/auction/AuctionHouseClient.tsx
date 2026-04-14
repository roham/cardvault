'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { sportsCards, type SportsCard } from '@/data/sports-cards';
import { getWallet, saveWallet, addToVault, addTransaction, type VaultCard } from '@/lib/vault';

// ── Helpers ───────────────────────────────────────────────────────────

function dateHash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function parseValue(v: string): number {
  const m = v.match(/\$([\d,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
}

function formatMoney(n: number): string {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatTimeLeft(ms: number): string {
  if (ms <= 0) return 'ENDED';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

// ── Types ─────────────────────────────────────────────────────────────

interface AuctionItem {
  id: string;
  card: SportsCard;
  startPrice: number;
  currentBid: number;
  bidCount: number;
  endsAt: number;        // timestamp ms
  snipeExtended: boolean;
  bidHistory: { amount: number; bidder: string; time: number }[];
  featured: boolean;
}

interface AuctionBid {
  auctionId: string;
  cardSlug: string;
  amount: number;
  time: number;
  won: boolean;
}

const AUCTION_BIDS_KEY = 'cardvault-auction-bids';
const AUCTION_STATE_KEY = 'cardvault-auction-state';
const SNIPE_WINDOW = 60_000;       // 60 seconds
const SNIPE_EXTENSION = 30_000;    // extend 30 seconds

const SPORT_ICONS: Record<string, string> = {
  baseball: '\u26BE',
  basketball: '\uD83C\uDFC0',
  football: '\uD83C\uDFC8',
  hockey: '\uD83C\uDFD2',
};

const SPORT_COLORS: Record<string, string> = {
  baseball: 'text-red-400',
  basketball: 'text-orange-400',
  football: 'text-blue-400',
  hockey: 'text-cyan-400',
};

const BIDDER_NAMES = [
  'CardShark42', 'VintageKing', 'RookieHunter', 'GrailChaser', 'WaxBreaker',
  'ToppsCollector', 'PrizmPuller', 'GradedGems', 'SetBuilder99', 'TheFlipKing',
  'ChromeChaser', 'HobbyLegend', 'MintCondition', 'PackRipper', 'SilverSlugger',
];

// ── Generate daily auctions from card data ────────────────────────────

function generateDailyAuctions(dateStr: string): AuctionItem[] {
  const seed = dateHash(`auction-${dateStr}`);
  const rng = seededRng(seed);

  // Filter cards with reasonable value ($20+) for auctions
  const eligible = sportsCards.filter(c => parseValue(c.estimatedValueRaw) >= 20);
  if (eligible.length === 0) return [];

  // Pick 12 unique cards
  const shuffled = [...eligible].sort(() => rng() - 0.5);
  const picked = shuffled.slice(0, 12);

  // Create auctions staggered through the day
  const now = new Date(dateStr);
  now.setHours(0, 0, 0, 0);
  const dayStart = now.getTime();

  return picked.map((card, i) => {
    const value = parseValue(card.estimatedValueRaw);
    // Start price: 30-60% of estimated value
    const startPct = 0.3 + rng() * 0.3;
    const startPrice = Math.max(5, Math.round(value * startPct));
    // Duration: 4-12 hours staggered
    const durationHrs = 4 + Math.floor(rng() * 9);
    const startHour = Math.floor(rng() * 14); // start between 0:00-14:00
    const endsAt = dayStart + (startHour + durationHrs) * 3600_000;
    // Simulated bids (0-8 bids from NPC bidders)
    const npcBidCount = Math.floor(rng() * 9);
    const bidHistory: AuctionItem['bidHistory'] = [];
    let currentBid = startPrice;
    for (let b = 0; b < npcBidCount; b++) {
      const increment = Math.max(1, Math.round(currentBid * (0.05 + rng() * 0.15)));
      currentBid += increment;
      const bidderIdx = Math.floor(rng() * BIDDER_NAMES.length);
      bidHistory.push({
        amount: currentBid,
        bidder: BIDDER_NAMES[bidderIdx],
        time: endsAt - Math.floor(rng() * durationHrs * 3600_000),
      });
    }
    bidHistory.sort((a, b) => a.time - b.time);

    return {
      id: `auction-${dateStr}-${i}`,
      card,
      startPrice,
      currentBid: bidHistory.length > 0 ? bidHistory[bidHistory.length - 1].amount : startPrice,
      bidCount: bidHistory.length,
      endsAt,
      snipeExtended: false,
      bidHistory,
      featured: i < 3,
    };
  });
}

// ── Persistence ───────────────────────────────────────────────────────

function getSavedBids(): AuctionBid[] {
  try {
    const raw = localStorage.getItem(AUCTION_BIDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveBids(bids: AuctionBid[]): void {
  localStorage.setItem(AUCTION_BIDS_KEY, JSON.stringify(bids.slice(0, 100)));
}

function getSavedAuctionState(): Record<string, { currentBid: number; bidCount: number; endsAt: number; bidHistory: AuctionItem['bidHistory'] }> {
  try {
    const raw = localStorage.getItem(AUCTION_STATE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveAuctionState(state: Record<string, { currentBid: number; bidCount: number; endsAt: number; bidHistory: AuctionItem['bidHistory'] }>): void {
  localStorage.setItem(AUCTION_STATE_KEY, JSON.stringify(state));
}

// ── Component ─────────────────────────────────────────────────────────

export default function AuctionHouseClient() {
  const [mounted, setMounted] = useState(false);
  const [auctions, setAuctions] = useState<AuctionItem[]>([]);
  const [myBids, setMyBids] = useState<AuctionBid[]>([]);
  const [balance, setBalance] = useState(0);
  const [filter, setFilter] = useState<string>('all');
  const [tab, setTab] = useState<'active' | 'mybids' | 'won'>('active');
  const [bidAmount, setBidAmount] = useState<Record<string, string>>({});
  const [bidMessage, setBidMessage] = useState<Record<string, { text: string; type: 'success' | 'error' }>>({});
  const [now, setNow] = useState(Date.now());

  // Initialize
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const base = generateDailyAuctions(today);

    // Merge saved state (user bids, snipe extensions)
    const savedState = getSavedAuctionState();
    const merged = base.map(a => {
      const saved = savedState[a.id];
      if (saved) {
        return {
          ...a,
          currentBid: Math.max(a.currentBid, saved.currentBid),
          bidCount: Math.max(a.bidCount, saved.bidCount),
          endsAt: Math.max(a.endsAt, saved.endsAt),
          bidHistory: saved.bidHistory.length > a.bidHistory.length ? saved.bidHistory : a.bidHistory,
        };
      }
      return a;
    });

    setAuctions(merged);
    setMyBids(getSavedBids());
    setBalance(getWallet().balance);
    setMounted(true);
  }, []);

  // Tick timer
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Check for won auctions
  useEffect(() => {
    if (!mounted) return;
    const bids = getSavedBids();
    let updated = false;
    auctions.forEach(auction => {
      if (now < auction.endsAt) return;
      const myBid = bids.find(b => b.auctionId === auction.id && !b.won);
      if (!myBid) return;
      // Check if user is highest bidder
      const isHighest = auction.bidHistory.length > 0
        ? auction.bidHistory[auction.bidHistory.length - 1].bidder === 'You'
        : false;
      if (isHighest) {
        myBid.won = true;
        updated = true;
        // Add to vault
        const vc: VaultCard = {
          slug: auction.card.slug,
          acquiredAt: new Date().toISOString(),
          acquiredFrom: 'marketplace',
          pricePaid: myBid.amount,
        };
        addToVault([vc]);
        addTransaction({
          type: 'marketplace-buy',
          amount: -myBid.amount,
          description: `Won auction: ${auction.card.name}`,
          cardSlugs: [auction.card.slug],
        });
      }
    });
    if (updated) {
      saveBids(bids);
      setMyBids([...bids]);
    }
  }, [mounted, now, auctions]);

  const placeBid = useCallback((auctionId: string) => {
    const auction = auctions.find(a => a.id === auctionId);
    if (!auction) return;

    const inputVal = bidAmount[auctionId];
    const amount = inputVal ? Math.round(parseFloat(inputVal) * 100) / 100 : 0;
    const minBid = auction.currentBid + Math.max(1, Math.round(auction.currentBid * 0.05));

    if (amount < minBid) {
      setBidMessage(prev => ({ ...prev, [auctionId]: { text: `Minimum bid: ${formatMoney(minBid)}`, type: 'error' } }));
      return;
    }
    if (amount > balance) {
      setBidMessage(prev => ({ ...prev, [auctionId]: { text: 'Insufficient balance', type: 'error' } }));
      return;
    }
    if (now >= auction.endsAt) {
      setBidMessage(prev => ({ ...prev, [auctionId]: { text: 'Auction has ended', type: 'error' } }));
      return;
    }

    // Place bid
    const newHistory = [...auction.bidHistory, { amount, bidder: 'You', time: Date.now() }];
    let newEndsAt = auction.endsAt;

    // Snipe protection
    const timeLeft = auction.endsAt - Date.now();
    if (timeLeft <= SNIPE_WINDOW) {
      newEndsAt = auction.endsAt + SNIPE_EXTENSION;
    }

    const updatedAuction: AuctionItem = {
      ...auction,
      currentBid: amount,
      bidCount: auction.bidCount + 1,
      endsAt: newEndsAt,
      bidHistory: newHistory,
      snipeExtended: timeLeft <= SNIPE_WINDOW,
    };

    // Deduct from wallet (hold — refunded if outbid)
    const wallet = getWallet();
    wallet.balance -= amount;
    wallet.totalSpent += amount;
    saveWallet(wallet);
    setBalance(wallet.balance);

    // Save bid
    const newBid: AuctionBid = {
      auctionId,
      cardSlug: auction.card.slug,
      amount,
      time: Date.now(),
      won: false,
    };
    const bids = [...getSavedBids(), newBid];
    saveBids(bids);
    setMyBids(bids);

    // Update auction state
    const savedState = getSavedAuctionState();
    savedState[auctionId] = {
      currentBid: amount,
      bidCount: updatedAuction.bidCount,
      endsAt: newEndsAt,
      bidHistory: newHistory,
    };
    saveAuctionState(savedState);

    setAuctions(prev => prev.map(a => a.id === auctionId ? updatedAuction : a));
    setBidAmount(prev => ({ ...prev, [auctionId]: '' }));
    setBidMessage(prev => ({ ...prev, [auctionId]: { text: `Bid placed: ${formatMoney(amount)}`, type: 'success' } }));

    // NPC counter-bid after 3-8 seconds (if auction still has time)
    const counterDelay = 3000 + Math.random() * 5000;
    if (newEndsAt - Date.now() > 60_000 && Math.random() < 0.4) {
      setTimeout(() => {
        setAuctions(prev => {
          const current = prev.find(a => a.id === auctionId);
          if (!current || current.bidHistory[current.bidHistory.length - 1]?.bidder !== 'You') return prev;
          if (Date.now() >= current.endsAt) return prev;
          const npcIncrement = Math.max(1, Math.round(current.currentBid * (0.05 + Math.random() * 0.1)));
          const npcBid = current.currentBid + npcIncrement;
          const npcBidder = BIDDER_NAMES[Math.floor(Math.random() * BIDDER_NAMES.length)];
          const npcHistory = [...current.bidHistory, { amount: npcBid, bidder: npcBidder, time: Date.now() }];
          // Refund user
          const w = getWallet();
          w.balance += amount;
          w.totalSpent -= amount;
          saveWallet(w);
          setBalance(w.balance);

          const npcState = getSavedAuctionState();
          npcState[auctionId] = { currentBid: npcBid, bidCount: current.bidCount + 1, endsAt: current.endsAt, bidHistory: npcHistory };
          saveAuctionState(npcState);
          setBidMessage(p => ({ ...p, [auctionId]: { text: `Outbid by ${npcBidder}!`, type: 'error' } }));
          return prev.map(a => a.id === auctionId ? { ...a, currentBid: npcBid, bidCount: a.bidCount + 1, bidHistory: npcHistory } : a);
        });
      }, counterDelay);
    }
  }, [auctions, balance, bidAmount, now]);

  // Filtered auctions
  const filteredAuctions = useMemo(() => {
    let list = auctions;
    if (filter !== 'all') list = list.filter(a => a.card.sport === filter);
    return list.sort((a, b) => a.endsAt - b.endsAt);
  }, [auctions, filter]);

  const activeAuctions = useMemo(() => filteredAuctions.filter(a => now < a.endsAt), [filteredAuctions, now]);
  const endedAuctions = useMemo(() => filteredAuctions.filter(a => now >= a.endsAt), [filteredAuctions, now]);
  const wonAuctions = useMemo(() => myBids.filter(b => b.won), [myBids]);
  const myActiveBids = useMemo(() => {
    return myBids.filter(b => {
      const auction = auctions.find(a => a.id === b.auctionId);
      return auction && !b.won;
    });
  }, [myBids, auctions]);

  const sports = useMemo(() => {
    const s = new Set(auctions.map(a => a.card.sport));
    return Array.from(s).sort();
  }, [auctions]);

  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-gray-800/50 rounded-lg w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-64 bg-gray-800/30 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wallet Bar */}
      <div className="flex flex-wrap items-center gap-4 bg-gray-900/60 border border-gray-800/50 rounded-xl px-4 py-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Balance:</span>
          <span className="font-bold text-emerald-400">{formatMoney(balance)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Active Bids:</span>
          <span className="font-semibold text-amber-400">{myActiveBids.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Won:</span>
          <span className="font-semibold text-green-400">{wonAuctions.length}</span>
        </div>
        <Link href="/vault" className="ml-auto text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
          View Vault &rarr;
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900/40 rounded-lg p-1 w-fit">
        {(['active', 'mybids', 'won'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === t ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            {t === 'active' ? `Active (${activeAuctions.length})` : t === 'mybids' ? `My Bids (${myActiveBids.length})` : `Won (${wonAuctions.length})`}
          </button>
        ))}
      </div>

      {/* Sport Filter (active tab only) */}
      {tab === 'active' && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-800/50 text-gray-400 hover:text-white'
            }`}
          >
            All Sports
          </button>
          {sports.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === s ? 'bg-indigo-600 text-white' : 'bg-gray-800/50 text-gray-400 hover:text-white'
              }`}
            >
              {SPORT_ICONS[s] || ''} {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* ACTIVE TAB */}
      {tab === 'active' && (
        <>
          {activeAuctions.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-4xl mb-3">&#128276;</p>
              <p className="text-lg font-medium">No active auctions right now</p>
              <p className="text-sm mt-1">New auctions drop every day. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeAuctions.map(auction => {
                const timeLeft = auction.endsAt - now;
                const isUrgent = timeLeft < 300_000; // < 5 min
                const isSniped = auction.snipeExtended;
                const value = parseValue(auction.card.estimatedValueRaw);
                const deal = value > 0 ? Math.round((auction.currentBid / value) * 100) : 0;
                const minBid = auction.currentBid + Math.max(1, Math.round(auction.currentBid * 0.05));
                const isLeading = auction.bidHistory.length > 0 && auction.bidHistory[auction.bidHistory.length - 1].bidder === 'You';
                const msg = bidMessage[auction.id];

                return (
                  <div
                    key={auction.id}
                    className={`relative bg-gray-900/60 border rounded-xl overflow-hidden transition-all ${
                      isLeading ? 'border-emerald-700/60 ring-1 ring-emerald-800/30' :
                      isUrgent ? 'border-red-700/60 ring-1 ring-red-800/30' :
                      auction.featured ? 'border-amber-700/60' : 'border-gray-800/50'
                    }`}
                  >
                    {/* Header */}
                    <div className="px-4 pt-4 pb-2">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{SPORT_ICONS[auction.card.sport] || ''}</span>
                          <span className={`text-xs font-medium ${SPORT_COLORS[auction.card.sport] || 'text-gray-400'}`}>
                            {auction.card.sport.toUpperCase()}
                          </span>
                        </div>
                        {auction.featured && (
                          <span className="text-xs bg-amber-900/40 text-amber-400 border border-amber-800/50 px-2 py-0.5 rounded-full">
                            Featured
                          </span>
                        )}
                        {isLeading && (
                          <span className="text-xs bg-emerald-900/40 text-emerald-400 border border-emerald-800/50 px-2 py-0.5 rounded-full">
                            Leading
                          </span>
                        )}
                      </div>

                      <Link href={`/sports/${auction.card.slug}`} className="hover:underline">
                        <h3 className="font-semibold text-white text-sm leading-tight">{auction.card.name}</h3>
                      </Link>
                      <p className="text-xs text-gray-500 mt-0.5">{auction.card.year} {auction.card.set}</p>
                      <p className="text-xs text-gray-600 mt-0.5">Est. value: {auction.card.estimatedValueRaw}</p>
                    </div>

                    {/* Bid Info */}
                    <div className="px-4 py-3 border-t border-gray-800/30">
                      <div className="flex items-baseline justify-between mb-1">
                        <span className="text-xs text-gray-500">Current bid</span>
                        <span className="text-xs text-gray-500">{auction.bidCount} bid{auction.bidCount !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-xl font-bold text-white">{formatMoney(auction.currentBid)}</span>
                        {deal > 0 && deal < 100 && (
                          <span className="text-xs text-emerald-400 font-medium">{100 - deal}% below est.</span>
                        )}
                      </div>
                    </div>

                    {/* Timer */}
                    <div className={`px-4 py-2 border-t border-gray-800/30 flex items-center justify-between ${
                      isUrgent ? 'bg-red-950/20' : 'bg-gray-800/10'
                    }`}>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${isUrgent ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                        <span className={`text-sm font-mono font-semibold ${isUrgent ? 'text-red-400' : 'text-gray-300'}`}>
                          {formatTimeLeft(timeLeft)}
                        </span>
                      </div>
                      {isSniped && (
                        <span className="text-[10px] text-amber-400 flex items-center gap-1">
                          &#9889; Snipe protected +30s
                        </span>
                      )}
                    </div>

                    {/* Bid Input */}
                    <div className="px-4 py-3 border-t border-gray-800/30 space-y-2">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                          <input
                            type="number"
                            step="0.01"
                            min={minBid}
                            placeholder={minBid.toString()}
                            value={bidAmount[auction.id] || ''}
                            onChange={e => setBidAmount(prev => ({ ...prev, [auction.id]: e.target.value }))}
                            className="w-full bg-gray-800/60 border border-gray-700/50 rounded-lg pl-6 pr-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <button
                          onClick={() => placeBid(auction.id)}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
                        >
                          Bid
                        </button>
                      </div>
                      <p className="text-[10px] text-gray-600">Min: {formatMoney(minBid)} &middot; Snipe protect: last 60s</p>
                      {msg && (
                        <p className={`text-xs font-medium ${msg.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                          {msg.text}
                        </p>
                      )}
                    </div>

                    {/* Recent bids */}
                    {auction.bidHistory.length > 0 && (
                      <div className="px-4 py-2 border-t border-gray-800/30 bg-gray-800/10">
                        <p className="text-[10px] text-gray-600 mb-1">Recent bids:</p>
                        <div className="space-y-0.5">
                          {auction.bidHistory.slice(-3).reverse().map((bh, idx) => (
                            <div key={idx} className="flex items-center justify-between text-[10px]">
                              <span className={bh.bidder === 'You' ? 'text-emerald-400 font-medium' : 'text-gray-500'}>{bh.bidder}</span>
                              <span className="text-gray-400">{formatMoney(bh.amount)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Ended section */}
          {endedAuctions.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-gray-400 mb-3">Recently Ended</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {endedAuctions.slice(0, 4).map(auction => {
                  const winner = auction.bidHistory.length > 0 ? auction.bidHistory[auction.bidHistory.length - 1].bidder : 'No bids';
                  return (
                    <div key={auction.id} className="bg-gray-900/30 border border-gray-800/30 rounded-lg p-3 opacity-70">
                      <p className="text-xs text-gray-500">{SPORT_ICONS[auction.card.sport]} {auction.card.sport}</p>
                      <p className="text-sm font-medium text-gray-300 truncate">{auction.card.name}</p>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-500">Final: {formatMoney(auction.currentBid)}</span>
                        <span className={`text-xs ${winner === 'You' ? 'text-emerald-400 font-medium' : 'text-gray-500'}`}>
                          {winner === 'You' ? 'You won!' : winner}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* MY BIDS TAB */}
      {tab === 'mybids' && (
        <div className="space-y-3">
          {myActiveBids.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-4xl mb-3">&#128073;</p>
              <p className="text-lg font-medium">No active bids</p>
              <p className="text-sm mt-1">Browse auctions and place your first bid!</p>
            </div>
          ) : (
            myActiveBids.map(bid => {
              const auction = auctions.find(a => a.id === bid.auctionId);
              if (!auction) return null;
              const isLeading = auction.bidHistory.length > 0 && auction.bidHistory[auction.bidHistory.length - 1].bidder === 'You';
              const timeLeft = auction.endsAt - now;
              return (
                <div key={`${bid.auctionId}-${bid.time}`} className={`flex items-center gap-4 p-4 rounded-xl border ${
                  isLeading ? 'bg-emerald-950/10 border-emerald-800/40' : 'bg-red-950/10 border-red-800/40'
                }`}>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-white truncate">{auction.card.name}</p>
                    <p className="text-xs text-gray-500">{auction.card.year} {auction.card.set}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">{formatMoney(bid.amount)}</p>
                    <p className={`text-xs font-medium ${isLeading ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isLeading ? 'Leading' : 'Outbid'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-mono ${timeLeft < 300_000 ? 'text-red-400' : 'text-gray-400'}`}>
                      {formatTimeLeft(timeLeft)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* WON TAB */}
      {tab === 'won' && (
        <div className="space-y-3">
          {wonAuctions.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-4xl mb-3">&#127942;</p>
              <p className="text-lg font-medium">No wins yet</p>
              <p className="text-sm mt-1">Keep bidding! Won cards are added to your vault automatically.</p>
            </div>
          ) : (
            wonAuctions.map((bid, i) => {
              const card = sportsCards.find(c => c.slug === bid.cardSlug);
              return (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-emerald-950/10 border border-emerald-800/40">
                  <div className="w-10 h-10 rounded-lg bg-emerald-900/30 flex items-center justify-center text-lg">
                    {SPORT_ICONS[card?.sport || ''] || '&#127183;'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/sports/${bid.cardSlug}`} className="font-medium text-sm text-white hover:underline truncate block">
                      {card?.name || bid.cardSlug}
                    </Link>
                    <p className="text-xs text-gray-500">{card?.year} {card?.set}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-400">{formatMoney(bid.amount)}</p>
                    <p className="text-[10px] text-gray-500">Won</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* How It Works */}
      <div className="mt-8 bg-gray-900/40 border border-gray-800/40 rounded-xl p-6">
        <h3 className="font-semibold text-white mb-4">How the Auction House Works</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="space-y-1">
            <div className="text-2xl">&#128269;</div>
            <p className="font-medium text-gray-200">1. Browse Auctions</p>
            <p className="text-gray-500 text-xs">12 new auctions every day featuring cards from all sports. Filter by sport to find what you collect.</p>
          </div>
          <div className="space-y-1">
            <div className="text-2xl">&#128176;</div>
            <p className="font-medium text-gray-200">2. Place Bids</p>
            <p className="text-gray-500 text-xs">Bid with your wallet balance. Minimum bid is 5% above current price. Outbid? Your funds return instantly.</p>
          </div>
          <div className="space-y-1">
            <div className="text-2xl">&#9889;</div>
            <p className="font-medium text-gray-200">3. Snipe Protection</p>
            <p className="text-gray-500 text-xs">Bids in the last 60 seconds extend the auction by 30 seconds. No more last-second steals.</p>
          </div>
          <div className="space-y-1">
            <div className="text-2xl">&#127942;</div>
            <p className="font-medium text-gray-200">4. Win & Collect</p>
            <p className="text-gray-500 text-xs">Won cards are automatically added to your vault. Build your collection at auction prices.</p>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="flex flex-wrap gap-3 text-sm">
        <Link href="/packs" className="text-indigo-400 hover:text-indigo-300 transition-colors">Pack Store &rarr;</Link>
        <Link href="/vault" className="text-indigo-400 hover:text-indigo-300 transition-colors">My Vault &rarr;</Link>
        <Link href="/trade-hub" className="text-indigo-400 hover:text-indigo-300 transition-colors">Trade Hub &rarr;</Link>
        <Link href="/tools/watchlist" className="text-indigo-400 hover:text-indigo-300 transition-colors">Price Watchlist &rarr;</Link>
        <Link href="/drops" className="text-indigo-400 hover:text-indigo-300 transition-colors">Drop Calendar &rarr;</Link>
      </div>
    </div>
  );
}
