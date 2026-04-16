'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

/* ── helpers ─────────────────────────────────────────────────────── */

function parseValue(raw: string): number {
  const m = raw.match(/\$(\d[\d,]*)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
}

function fmt(n: number): string {
  return n >= 1000 ? `$${(n / 1000).toFixed(1)}K` : `$${n.toFixed(0)}`;
}

function dateHash(d: Date = new Date()): number {
  const str = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  let h = 0;
  for (let i = 0; i < str.length; i++) { h = ((h << 5) - h + str.charCodeAt(i)) | 0; }
  return Math.abs(h);
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
}

/* ── types ───────────────────────────────────────────────────────── */

interface AuctionCard {
  slug: string;
  name: string;
  player: string;
  sport: string;
  year: number;
  marketValue: number;
  rookie: boolean;
}

interface Bid {
  bidder: string;
  amount: number;
  time: number; // seconds remaining when bid placed
}

interface Auction {
  id: number;
  card: AuctionCard;
  startPrice: number;
  currentBid: number;
  bids: Bid[];
  timeRemaining: number; // seconds
  totalTime: number;
  highBidder: string;
  status: 'active' | 'won' | 'lost' | 'ended';
  sniped: boolean;
}

interface AuctionStats {
  won: number;
  lost: number;
  totalSpent: number;
  totalValueWon: number;
  bestDeal: number; // biggest savings %
  streak: number;
}

/* ── AI bidder personalities ─────────────────────────────────────── */

const AI_BIDDERS = [
  { name: 'BidMaster42', style: 'aggressive' as const, emoji: '🔥', desc: 'Bids early and often' },
  { name: 'SilentSniper', style: 'sniper' as const, emoji: '🎯', desc: 'Waits until the last moment' },
  { name: 'BargainHunter', style: 'value' as const, emoji: '💰', desc: 'Only bids on great deals' },
  { name: 'NewCollector99', style: 'emotional' as const, emoji: '🌟', desc: 'Sometimes overbids' },
  { name: 'CardSharkPro', style: 'strategic' as const, emoji: '🦈', desc: 'Calculates every move' },
];

const SPORT_COLORS: Record<string, string> = {
  baseball: 'border-red-800/50 bg-red-950/30 text-red-400',
  basketball: 'border-orange-800/50 bg-orange-950/30 text-orange-400',
  football: 'border-green-800/50 bg-green-950/30 text-green-400',
  hockey: 'border-blue-800/50 bg-blue-950/30 text-blue-400',
};

const SPORT_DOTS: Record<string, string> = {
  baseball: 'bg-red-400',
  basketball: 'bg-orange-400',
  football: 'bg-green-400',
  hockey: 'bg-blue-400',
};

/* ── main component ──────────────────────────────────────────────── */

export default function AuctionSniperClient() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [maxBid, setMaxBid] = useState('');
  const [balance, setBalance] = useState(500);
  const [mode, setMode] = useState<'daily' | 'random'>('daily');
  const [sportFilter, setSportFilter] = useState('all');
  const [stats, setStats] = useState<AuctionStats>({ won: 0, lost: 0, totalSpent: 0, totalValueWon: 0, bestDeal: 0, streak: 0 });
  const [sniperMode, setSniperMode] = useState(false);
  const [sniperBid, setSniperBid] = useState('');
  const [log, setLog] = useState<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Load stats from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cv-auction-stats');
      if (saved) setStats(JSON.parse(saved));
      const savedBal = localStorage.getItem('cv-auction-balance');
      if (savedBal) setBalance(parseFloat(savedBal));
    } catch {}
    setInitialized(true);
  }, []);

  // Save stats
  useEffect(() => {
    if (!initialized) return;
    try {
      localStorage.setItem('cv-auction-stats', JSON.stringify(stats));
      localStorage.setItem('cv-auction-balance', String(balance));
    } catch {}
  }, [stats, balance, initialized]);

  // Generate auctions
  const generateAuctions = useCallback((isDaily: boolean) => {
    const seed = isDaily ? dateHash() : Date.now();
    const rng = seededRandom(seed);

    const eligible = sportsCards.filter(c => parseValue(c.estimatedValueRaw) >= 3);
    const shuffled = [...eligible].sort(() => rng() - 0.5);
    const picked = shuffled.slice(0, 20);

    const newAuctions: Auction[] = picked.map((card, i) => {
      const mv = parseValue(card.estimatedValueRaw);
      const startPct = 0.3 + rng() * 0.4; // 30-70% of market value
      const startPrice = Math.max(1, Math.round(mv * startPct));
      const totalTime = 45 + Math.round(rng() * 45); // 45-90 seconds

      // Pre-generate some AI bids
      const numAiBidders = 1 + Math.floor(rng() * 3); // 1-3 AI bidders per auction
      const aiBidders = [...AI_BIDDERS].sort(() => rng() - 0.5).slice(0, numAiBidders);
      const bids: Bid[] = [];
      let currentBid = startPrice;

      for (const ai of aiBidders) {
        const maxBidPct = ai.style === 'emotional' ? 0.85 + rng() * 0.35 : // 85-120% (may overbid)
                          ai.style === 'aggressive' ? 0.7 + rng() * 0.25 : // 70-95%
                          ai.style === 'value' ? 0.5 + rng() * 0.25 : // 50-75%
                          ai.style === 'sniper' ? 0.75 + rng() * 0.2 : // 75-95%
                          0.65 + rng() * 0.25; // strategic: 65-90%
        const aiBidMax = Math.round(mv * maxBidPct);
        if (aiBidMax > currentBid) {
          const bidAmount = currentBid + Math.max(1, Math.round((aiBidMax - currentBid) * (0.3 + rng() * 0.5)));
          const bidTime = ai.style === 'sniper' ? Math.round(3 + rng() * 12) : // sniper: last 3-15s
                          ai.style === 'aggressive' ? Math.round(totalTime * (0.3 + rng() * 0.5)) : // early
                          Math.round(totalTime * rng() * 0.6); // mid-range
          bids.push({ bidder: ai.name, amount: Math.min(bidAmount, aiBidMax), time: bidTime });
          currentBid = Math.min(bidAmount, aiBidMax);
        }
      }

      bids.sort((a, b) => b.time - a.time); // sort by time descending (highest time = earliest)

      return {
        id: i,
        card: {
          slug: card.slug,
          name: card.name,
          player: card.player,
          sport: card.sport,
          year: card.year,
          marketValue: mv,
          rookie: card.rookie,
        },
        startPrice,
        currentBid: startPrice,
        bids: [],
        timeRemaining: totalTime,
        totalTime,
        highBidder: 'Starting',
        status: 'active' as const,
        sniped: false,
      };
    });

    setAuctions(newAuctions);
    setSelected(null);
    setLog(['Auction house opened! 20 auctions available.']);
  }, []);

  // Initialize
  useEffect(() => {
    if (initialized) generateAuctions(mode === 'daily');
  }, [mode, initialized, generateAuctions]);

  // Timer tick
  useEffect(() => {
    if (auctions.length === 0) return;

    timerRef.current = setInterval(() => {
      setAuctions(prev => {
        const seed = Date.now();
        const rng = seededRandom(seed);
        let newLog: string[] = [];

        const updated = prev.map(auction => {
          if (auction.status !== 'active') return auction;
          if (auction.timeRemaining <= 0) return auction;

          const newTime = auction.timeRemaining - 1;
          let newBid = auction.currentBid;
          let newHighBidder = auction.highBidder;
          const newBids = [...auction.bids];
          let wasSniped = auction.sniped;

          // Check if AI should bid at this time
          const eligible = sportsCards.filter(c => c.slug === auction.card.slug);
          const mv = auction.card.marketValue;

          // AI bidding logic per tick
          for (const ai of AI_BIDDERS) {
            const shouldBid = (
              (ai.style === 'aggressive' && newTime > 20 && rng() < 0.08) ||
              (ai.style === 'sniper' && newTime <= 8 && newTime > 2 && rng() < 0.25) ||
              (ai.style === 'value' && newBid < mv * 0.55 && rng() < 0.06) ||
              (ai.style === 'emotional' && rng() < 0.04) ||
              (ai.style === 'strategic' && newTime <= 20 && newTime > 5 && rng() < 0.07)
            );

            if (shouldBid && newHighBidder !== ai.name) {
              const maxPct = ai.style === 'emotional' ? 1.15 :
                             ai.style === 'aggressive' ? 0.95 :
                             ai.style === 'value' ? 0.7 :
                             ai.style === 'sniper' ? 0.92 :
                             0.88;
              const aiMax = Math.round(mv * maxPct);
              const increment = Math.max(1, Math.round(mv * 0.05));
              const bidAmount = newBid + increment;

              if (bidAmount <= aiMax && bidAmount > newBid) {
                newBid = bidAmount;
                newHighBidder = ai.name;
                newBids.push({ bidder: ai.name, amount: bidAmount, time: newTime });
                const aiData = AI_BIDDERS.find(a => a.name === ai.name);
                newLog.push(`${aiData?.emoji || '🤖'} ${ai.name} bid ${fmt(bidAmount)} on ${auction.card.player}!`);
              }
            }
          }

          // Auto-snipe for user
          if (sniperMode && newTime <= 5 && newTime > 1 && newHighBidder !== 'You') {
            const userSnipeMax = parseInt(sniperBid) || 0;
            if (userSnipeMax > newBid && userSnipeMax <= balance + (auction.highBidder === 'You' ? auction.currentBid : 0)) {
              const snipeBid = newBid + Math.max(1, Math.round(mv * 0.03));
              if (snipeBid <= userSnipeMax) {
                newBid = snipeBid;
                newHighBidder = 'You';
                newBids.push({ bidder: 'You', amount: snipeBid, time: newTime });
                wasSniped = true;
                newLog.push(`🎯 You sniped ${auction.card.player} at ${fmt(snipeBid)}!`);
              }
            }
          }

          // Auction ended
          if (newTime <= 0) {
            const won = newHighBidder === 'You';
            const status: Auction['status'] = newHighBidder === 'Starting' ? 'ended' : won ? 'won' : 'lost';
            if (won) {
              newLog.push(`🏆 You won ${auction.card.player} for ${fmt(newBid)}! Market value: ${fmt(mv)}`);
            } else if (newHighBidder !== 'Starting') {
              newLog.push(`❌ ${newHighBidder} won ${auction.card.player} for ${fmt(newBid)}`);
            }
            return { ...auction, timeRemaining: 0, currentBid: newBid, highBidder: newHighBidder, bids: newBids, status, sniped: wasSniped };
          }

          return { ...auction, timeRemaining: newTime, currentBid: newBid, highBidder: newHighBidder, bids: newBids, sniped: wasSniped };
        });

        if (newLog.length > 0) {
          setLog(prev => [...newLog.reverse(), ...prev].slice(0, 50));
        }

        // Process wins/losses for stats
        const justEnded = updated.filter((a, i) => a.status !== 'active' && prev[i].status === 'active');
        if (justEnded.length > 0) {
          setStats(prevStats => {
            let s = { ...prevStats };
            for (const a of justEnded) {
              if (a.status === 'won') {
                s.won += 1;
                s.totalSpent += a.currentBid;
                s.totalValueWon += a.card.marketValue;
                const savings = Math.round(((a.card.marketValue - a.currentBid) / a.card.marketValue) * 100);
                if (savings > s.bestDeal) s.bestDeal = savings;
                s.streak += 1;
                setBalance(b => b - a.currentBid);
              } else if (a.status === 'lost') {
                s.lost += 1;
                s.streak = 0;
              }
            }
            return s;
          });
        }

        return updated;
      });
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [auctions.length, sniperMode, sniperBid, balance]);

  // Place bid
  const placeBid = (auctionId: number) => {
    const bidAmount = parseInt(maxBid);
    if (!bidAmount || bidAmount <= 0) return;

    setAuctions(prev => prev.map(a => {
      if (a.id !== auctionId || a.status !== 'active') return a;
      if (bidAmount <= a.currentBid) return a;
      if (bidAmount > balance + (a.highBidder === 'You' ? a.currentBid : 0)) return a;

      // Refund previous bid if user was already high bidder
      if (a.highBidder === 'You') {
        setBalance(b => b + a.currentBid);
      }

      const newBids = [...a.bids, { bidder: 'You', amount: bidAmount, time: a.timeRemaining }];
      setLog(prev => [`💪 You bid ${fmt(bidAmount)} on ${a.card.player}!`, ...prev].slice(0, 50));
      return { ...a, currentBid: bidAmount, highBidder: 'You', bids: newBids };
    }));
    setMaxBid('');
  };

  // Quick bid buttons
  const quickBid = (auctionId: number, amount: number) => {
    setMaxBid(String(amount));
    setTimeout(() => {
      setAuctions(prev => prev.map(a => {
        if (a.id !== auctionId || a.status !== 'active') return a;
        if (amount <= a.currentBid) return a;
        if (amount > balance + (a.highBidder === 'You' ? a.currentBid : 0)) return a;
        if (a.highBidder === 'You') setBalance(b => b + a.currentBid);
        const newBids = [...a.bids, { bidder: 'You', amount, time: a.timeRemaining }];
        setLog(prev => [`💪 You bid ${fmt(amount)} on ${a.card.player}!`, ...prev].slice(0, 50));
        return { ...a, currentBid: amount, highBidder: 'You', bids: newBids };
      }));
      setMaxBid('');
    }, 0);
  };

  const filtered = useMemo(() =>
    sportFilter === 'all' ? auctions : auctions.filter(a => a.card.sport === sportFilter),
    [auctions, sportFilter]
  );

  const activeCount = auctions.filter(a => a.status === 'active').length;
  const wonCount = auctions.filter(a => a.status === 'won').length;
  const selectedAuction = selected !== null ? auctions.find(a => a.id === selected) : null;

  const sports = ['all', 'baseball', 'basketball', 'football', 'hockey'];

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-400">{fmt(balance)}</div>
          <div className="text-xs text-gray-500">Balance</div>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-amber-400">{activeCount}</div>
          <div className="text-xs text-gray-500">Active Auctions</div>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-purple-400">{stats.won}/{stats.won + stats.lost}</div>
          <div className="text-xs text-gray-500">Win Rate</div>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-cyan-400">{stats.bestDeal}%</div>
          <div className="text-xs text-gray-500">Best Deal</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-2">
          <button onClick={() => setMode('daily')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'daily' ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            Daily Auctions
          </button>
          <button onClick={() => setMode('random')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'random' ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            Random
          </button>
        </div>
        <div className="flex gap-1">
          {sports.map(s => (
            <button key={s} onClick={() => setSportFilter(s)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${sportFilter === s ? 'bg-amber-900/60 text-amber-400 border border-amber-700/50' : 'bg-gray-800/60 text-gray-500 hover:text-gray-300'}`}>
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 ml-auto text-sm">
          <input type="checkbox" checked={sniperMode} onChange={e => setSniperMode(e.target.checked)}
            className="accent-amber-500" />
          <span className="text-gray-400">Auto-Snipe</span>
          {sniperMode && (
            <input type="number" value={sniperBid} onChange={e => setSniperBid(e.target.value)}
              placeholder="Max $" className="w-20 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm" />
          )}
        </label>
      </div>

      {/* Main Layout */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Auction List */}
        <div className="lg:col-span-2 space-y-3">
          {filtered.map(auction => {
            const pct = (auction.timeRemaining / auction.totalTime) * 100;
            const isHot = auction.timeRemaining <= 15 && auction.status === 'active';
            const savings = auction.card.marketValue > 0 ? Math.round(((auction.card.marketValue - auction.currentBid) / auction.card.marketValue) * 100) : 0;
            const isSelected = selected === auction.id;

            return (
              <div key={auction.id}
                onClick={() => setSelected(auction.id === selected ? null : auction.id)}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  auction.status === 'won' ? 'border-green-700/50 bg-green-950/20' :
                  auction.status === 'lost' ? 'border-red-800/30 bg-gray-900/30 opacity-60' :
                  auction.status === 'ended' ? 'border-gray-800/30 bg-gray-900/30 opacity-40' :
                  isSelected ? 'border-amber-600/60 bg-amber-950/20' :
                  isHot ? 'border-red-600/50 bg-red-950/10 animate-pulse' :
                  'border-gray-800 bg-gray-900/60 hover:border-gray-700'
                }`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2 h-2 rounded-full ${SPORT_DOTS[auction.card.sport] || 'bg-gray-400'}`} />
                      <span className="text-white font-semibold text-sm truncate">{auction.card.player}</span>
                      {auction.card.rookie && <span className="text-[10px] bg-amber-900/60 text-amber-400 px-1.5 py-0.5 rounded">RC</span>}
                      {auction.status === 'won' && <span className="text-[10px] bg-green-900/60 text-green-400 px-1.5 py-0.5 rounded">WON</span>}
                      {auction.status === 'lost' && <span className="text-[10px] bg-red-900/60 text-red-400 px-1.5 py-0.5 rounded">LOST</span>}
                    </div>
                    <div className="text-xs text-gray-500 truncate">{auction.card.name}</div>
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <span className="text-gray-400">Market: <span className="text-white">{fmt(auction.card.marketValue)}</span></span>
                      {savings > 0 && auction.status === 'active' && (
                        <span className="text-green-400">{savings}% below market</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`text-lg font-bold ${auction.highBidder === 'You' ? 'text-green-400' : 'text-white'}`}>
                      {fmt(auction.currentBid)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {auction.highBidder === 'Starting' ? 'No bids' : `by ${auction.highBidder}`}
                    </div>
                    {auction.status === 'active' && (
                      <div className={`text-sm font-mono mt-1 ${isHot ? 'text-red-400 font-bold' : 'text-amber-400'}`}>
                        {auction.timeRemaining}s
                      </div>
                    )}
                  </div>
                </div>

                {/* Time bar */}
                {auction.status === 'active' && (
                  <div className="mt-2 h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${pct > 50 ? 'bg-green-500' : pct > 25 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${pct}%` }} />
                  </div>
                )}

                {/* Bid controls when selected */}
                {isSelected && auction.status === 'active' && (
                  <div className="mt-3 pt-3 border-t border-gray-800 space-y-2" onClick={e => e.stopPropagation()}>
                    <div className="flex gap-2">
                      {[1, 2, 5, 10].map(inc => {
                        const bidAmt = auction.currentBid + Math.max(inc, Math.round(auction.card.marketValue * inc / 100));
                        return (
                          <button key={inc} onClick={() => quickBid(auction.id, bidAmt)}
                            disabled={bidAmt > balance}
                            className="flex-1 px-2 py-1.5 bg-amber-900/40 border border-amber-700/40 rounded text-amber-400 text-xs font-medium hover:bg-amber-800/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                            +{fmt(bidAmt - auction.currentBid)}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex gap-2">
                      <input type="number" value={maxBid} onChange={e => setMaxBid(e.target.value)}
                        placeholder={`Min ${fmt(auction.currentBid + 1)}`}
                        className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm" />
                      <button onClick={() => placeBid(auction.id)}
                        disabled={!maxBid || parseInt(maxBid) <= auction.currentBid || parseInt(maxBid) > balance}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                        BID
                      </button>
                    </div>
                    {auction.bids.length > 0 && (
                      <div className="text-xs text-gray-500">
                        {auction.bids.length} bid{auction.bids.length !== 1 ? 's' : ''} &middot;
                        Started at {fmt(auction.startPrice)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Sidebar: Activity Log + Session Stats */}
        <div className="space-y-4">
          {/* Session Summary */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4">
            <h3 className="text-white font-bold text-sm mb-3">Session Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Auctions Won</span>
                <span className="text-green-400 font-medium">{wonCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Spent</span>
                <span className="text-amber-400 font-medium">{fmt(stats.totalSpent)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Value Acquired</span>
                <span className="text-purple-400 font-medium">{fmt(stats.totalValueWon)}</span>
              </div>
              {stats.totalSpent > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Savings</span>
                  <span className={`font-medium ${stats.totalValueWon > stats.totalSpent ? 'text-green-400' : 'text-red-400'}`}>
                    {Math.round(((stats.totalValueWon - stats.totalSpent) / stats.totalValueWon) * 100)}%
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">Win Streak</span>
                <span className="text-cyan-400 font-medium">{stats.streak}</span>
              </div>
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4">
            <h3 className="text-white font-bold text-sm mb-3">Live Activity</h3>
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {log.length === 0 ? (
                <p className="text-gray-500 text-xs">Waiting for auction activity...</p>
              ) : log.map((entry, i) => (
                <div key={i} className="text-xs text-gray-400 leading-relaxed">{entry}</div>
              ))}
            </div>
          </div>

          {/* AI Bidders */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4">
            <h3 className="text-white font-bold text-sm mb-3">AI Bidders</h3>
            <div className="space-y-2">
              {AI_BIDDERS.map(ai => (
                <div key={ai.name} className="flex items-center gap-2">
                  <span className="text-sm">{ai.emoji}</span>
                  <div>
                    <div className="text-white text-xs font-medium">{ai.name}</div>
                    <div className="text-gray-500 text-[10px]">{ai.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bidding Tips */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4">
            <h3 className="text-white font-bold text-sm mb-3">Auction Tips</h3>
            <ul className="space-y-1.5 text-xs text-gray-400">
              <li>Watch for deals below 50% market value early</li>
              <li>SilentSniper always bids in the last 8 seconds</li>
              <li>Use Auto-Snipe to bid automatically in the last 5s</li>
              <li>NewCollector99 sometimes overbids — let them win those</li>
              <li>Rookie cards (RC) typically hold value better long-term</li>
              <li>Budget wisely — you start with $500 per session</li>
            </ul>
          </div>
        </div>
      </div>

      {/* New Auction Button (when all done) */}
      {activeCount === 0 && auctions.length > 0 && (
        <div className="text-center py-6">
          <p className="text-gray-400 mb-3">All auctions have ended!</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button onClick={() => { generateAuctions(false); setLog([]); }}
              className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg transition-colors">
              New Random Auctions
            </button>
            <button onClick={() => {
              const text = `CardVault Auction Results\nWon: ${wonCount}/20\nSpent: ${fmt(stats.totalSpent)}\nValue: ${fmt(stats.totalValueWon)}\nBest Deal: ${stats.bestDeal}% off\nhttps://cardvault-two.vercel.app/vault/auction-sniper`;
              navigator.clipboard.writeText(text);
            }}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-lg border border-gray-700 transition-colors">
              Share Results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
