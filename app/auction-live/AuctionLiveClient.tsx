'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

/* ------------------------------------------------------------------ */
/*  Types & helpers                                                   */
/* ------------------------------------------------------------------ */

interface AiBidder {
  name: string;
  emoji: string;
  aggressiveness: number; // 0-1, how likely to bid
  maxMultiplier: number;  // max bid as multiplier of estimated value
}

interface BidEntry {
  bidder: string;
  amount: number;
  timestamp: number;
}

const AI_BIDDERS: AiBidder[] = [
  { name: 'FlipKing_99', emoji: '\uD83D\uDC51', aggressiveness: 0.7, maxMultiplier: 1.2 },
  { name: 'VintageVault', emoji: '\uD83C\uDFDB\uFE0F', aggressiveness: 0.5, maxMultiplier: 1.4 },
  { name: 'RookieHunter', emoji: '\uD83C\uDFAF', aggressiveness: 0.8, maxMultiplier: 1.1 },
  { name: 'CardShark42', emoji: '\uD83E\uDD88', aggressiveness: 0.6, maxMultiplier: 1.3 },
];

function parseValue(v: string): number {
  const m = v.match(/\$([\d,.]+)/);
  if (!m) return 0;
  return parseFloat(m[1].replace(/,/g, ''));
}

function formatPrice(n: number): string {
  if (n >= 1000) return `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  return `$${n.toFixed(2)}`;
}

function dateHash(): number {
  const d = new Date();
  const str = `auction-${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${d.getHours()}`;
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

const sportEmoji: Record<string, string> = {
  baseball: '\u26BE',
  basketball: '\uD83C\uDFC0',
  football: '\uD83C\uDFC8',
  hockey: '\uD83C\uDFD2',
};

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

type Phase = 'lobby' | 'bidding' | 'won' | 'lost';

export default function AuctionLiveClient() {
  const rng = useMemo(() => seededRandom(dateHash()), []);

  // Pick a card worth $50+
  const auctionCard = useMemo(() => {
    const eligible = sportsCards.filter(c => {
      const v = parseValue(c.estimatedValueRaw);
      return v >= 50 && v <= 10000;
    });
    const idx = Math.floor(rng() * eligible.length);
    return eligible[idx];
  }, [rng]);

  const estimatedValue = parseValue(auctionCard.estimatedValueRaw);
  const startingBid = Math.round(estimatedValue * 0.4);
  const bidIncrement = estimatedValue < 200 ? 5 : estimatedValue < 1000 ? 25 : 50;

  // Pick 2-3 AI bidders
  const activeBidders = useMemo(() => {
    const count = 2 + (rng() > 0.5 ? 1 : 0);
    const shuffled = [...AI_BIDDERS].sort(() => rng() - 0.5);
    return shuffled.slice(0, count);
  }, [rng]);

  const [phase, setPhase] = useState<Phase>('lobby');
  const [timeLeft, setTimeLeft] = useState(45);
  const [currentBid, setCurrentBid] = useState(startingBid);
  const [currentBidder, setCurrentBidder] = useState('Starting bid');
  const [myBids, setMyBids] = useState(0);
  const [bidHistory, setBidHistory] = useState<BidEntry[]>([]);
  const [snipeTimer, setSnipeTimer] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const aiTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load stats
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  useEffect(() => {
    setWins(parseInt(localStorage.getItem('cv-auction-wins') || '0'));
    setLosses(parseInt(localStorage.getItem('cv-auction-losses') || '0'));
  }, []);

  const startAuction = useCallback(() => {
    setPhase('bidding');
    setTimeLeft(45);
    setCurrentBid(startingBid);
    setCurrentBidder('Starting bid');
    setMyBids(0);
    setBidHistory([]);
    setSnipeTimer(false);
  }, [startingBid]);

  // Countdown timer
  useEffect(() => {
    if (phase !== 'bidding') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Auction ends
          clearInterval(timerRef.current!);
          if (aiTimerRef.current) clearInterval(aiTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  // End auction when timer hits 0
  useEffect(() => {
    if (phase === 'bidding' && timeLeft === 0) {
      const didWin = currentBidder === 'You';
      if (didWin) {
        setPhase('won');
        const newWins = wins + 1;
        setWins(newWins);
        localStorage.setItem('cv-auction-wins', String(newWins));
      } else {
        setPhase('lost');
        const newLosses = losses + 1;
        setLosses(newLosses);
        localStorage.setItem('cv-auction-losses', String(newLosses));
      }
    }
  }, [phase, timeLeft, currentBidder, wins, losses]);

  // AI bidding behavior
  useEffect(() => {
    if (phase !== 'bidding') return;
    aiTimerRef.current = setInterval(() => {
      setCurrentBid(prevBid => {
        // Pick a random AI bidder
        const bidder = activeBidders[Math.floor(Math.random() * activeBidders.length)];
        const maxBid = estimatedValue * bidder.maxMultiplier;

        // Should this bidder bid?
        if (Math.random() > bidder.aggressiveness) return prevBid;
        if (prevBid >= maxBid) return prevBid; // Too expensive for this bidder

        const newBid = prevBid + bidIncrement;
        if (newBid > maxBid) return prevBid;

        setCurrentBidder(bidder.name);
        setBidHistory(prev => [...prev, {
          bidder: `${bidder.emoji} ${bidder.name}`,
          amount: newBid,
          timestamp: Date.now(),
        }]);

        return newBid;
      });
    }, 2000 + Math.random() * 3000);

    return () => {
      if (aiTimerRef.current) clearInterval(aiTimerRef.current);
    };
  }, [phase, activeBidders, estimatedValue, bidIncrement]);

  function placeBid() {
    const newBid = currentBid + bidIncrement;
    setCurrentBid(newBid);
    setCurrentBidder('You');
    setMyBids(prev => prev + 1);
    setBidHistory(prev => [...prev, {
      bidder: '\uD83D\uDC64 You',
      amount: newBid,
      timestamp: Date.now(),
    }]);

    // Snipe protection: extend timer if under 10 seconds
    if (timeLeft <= 10) {
      setTimeLeft(prev => Math.min(prev + 5, 15));
      setSnipeTimer(true);
      setTimeout(() => setSnipeTimer(false), 2000);
    }
  }

  const priceVsValue = currentBid > 0
    ? ((currentBid / estimatedValue) * 100).toFixed(0)
    : '0';

  /* ---- Lobby ---- */
  if (phase === 'lobby') {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-6">{sportEmoji[auctionCard.sport] || '\uD83C\uDFAF'}</div>
        <h2 className="text-2xl font-bold text-white mb-2">Next Auction</h2>
        <div className="max-w-md mx-auto bg-gray-900/60 border border-gray-800 rounded-2xl p-6 mb-6">
          <Link href={`/sports/${auctionCard.slug}`} className="text-lg font-bold text-white hover:text-emerald-400 transition-colors">
            {auctionCard.name}
          </Link>
          <p className="text-sm text-gray-400 mt-1">{auctionCard.player} &middot; {auctionCard.year} &middot; {auctionCard.set}</p>
          <div className="flex justify-center gap-6 mt-4">
            <div>
              <p className="text-xs text-gray-500">Estimated Value</p>
              <p className="text-emerald-400 font-bold text-lg">{auctionCard.estimatedValueRaw}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Starting Bid</p>
              <p className="text-white font-bold text-lg">{formatPrice(startingBid)}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-800">
            <p className="text-xs text-gray-500">Competing against</p>
            <div className="flex justify-center gap-3 mt-2">
              {activeBidders.map(b => (
                <span key={b.name} className="text-sm bg-gray-800 px-3 py-1 rounded-lg">
                  {b.emoji} {b.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {(wins > 0 || losses > 0) && (
          <p className="text-sm text-gray-500 mb-4">
            Your record: <span className="text-emerald-400 font-bold">{wins}W</span> / <span className="text-red-400 font-bold">{losses}L</span>
          </p>
        )}

        <button
          onClick={startAuction}
          className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-colors text-lg"
        >
          Enter Auction
        </button>
        <p className="text-xs text-gray-600 mt-3">45-second auction with snipe protection. New card every hour.</p>
      </div>
    );
  }

  /* ---- Won / Lost ---- */
  if (phase === 'won' || phase === 'lost') {
    const isWin = phase === 'won';
    const savings = isWin ? estimatedValue - currentBid : 0;
    return (
      <div className="text-center py-8">
        <div className={`text-7xl mb-4 ${isWin ? 'animate-bounce' : ''}`}>
          {isWin ? '\uD83C\uDFC6' : '\uD83D\uDE14'}
        </div>
        <h2 className={`text-3xl font-black mb-2 ${isWin ? 'text-emerald-400' : 'text-red-400'}`}>
          {isWin ? 'YOU WON!' : 'Outbid!'}
        </h2>
        <p className="text-gray-400 mb-6">
          {isWin
            ? `You won ${auctionCard.player} for ${formatPrice(currentBid)}!`
            : `${currentBidder} won with a bid of ${formatPrice(currentBid)}.`}
        </p>

        <div className="max-w-sm mx-auto grid grid-cols-2 gap-3 mb-6">
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-white">{formatPrice(currentBid)}</div>
            <div className="text-xs text-gray-400">Winning Bid</div>
          </div>
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-white">{auctionCard.estimatedValueRaw}</div>
            <div className="text-xs text-gray-400">Market Value</div>
          </div>
          {isWin && savings > 0 && (
            <div className="col-span-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-emerald-400">{formatPrice(savings)} saved</div>
              <div className="text-xs text-emerald-400/70">You paid {priceVsValue}% of market value</div>
            </div>
          )}
        </div>

        <p className="text-sm text-gray-500 mb-6">
          Record: <span className="text-emerald-400 font-bold">{wins}W</span> / <span className="text-red-400 font-bold">{losses}L</span>
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => { setPhase('lobby'); }}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-colors"
          >
            Next Auction
          </button>
          <Link
            href={`/sports/${auctionCard.slug}`}
            className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-xl transition-colors border border-gray-700"
          >
            View Card
          </Link>
        </div>
      </div>
    );
  }

  /* ---- Bidding ---- */
  return (
    <div>
      {/* Timer + current bid header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-900/60 border border-gray-800 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-black ${
            timeLeft <= 10
              ? 'bg-red-500/20 text-red-400 border-2 border-red-500/50 animate-pulse'
              : timeLeft <= 20
              ? 'bg-yellow-500/20 text-yellow-400 border-2 border-yellow-500/30'
              : 'bg-gray-800 text-white border-2 border-gray-700'
          }`}>
            {timeLeft}s
          </div>
          <div>
            <p className="text-xs text-gray-500">Current Bid</p>
            <p className="text-2xl font-black text-white">{formatPrice(currentBid)}</p>
            <p className="text-xs text-gray-400">
              by <span className={currentBidder === 'You' ? 'text-emerald-400 font-bold' : 'text-gray-300'}>{currentBidder}</span>
              {' '}&middot; {priceVsValue}% of market value
            </p>
          </div>
        </div>

        <button
          onClick={placeBid}
          className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl transition-colors text-lg whitespace-nowrap"
        >
          BID {formatPrice(currentBid + bidIncrement)}
        </button>
      </div>

      {/* Snipe protection notice */}
      {snipeTimer && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-2 mb-4 text-center">
          <p className="text-xs text-amber-400 font-medium">Snipe protection: +5 seconds added</p>
        </div>
      )}

      {/* Card details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{sportEmoji[auctionCard.sport]}</span>
            <div>
              <Link href={`/sports/${auctionCard.slug}`} className="text-sm font-bold text-white hover:text-emerald-400 transition-colors">
                {auctionCard.name}
              </Link>
              <p className="text-xs text-gray-500">{auctionCard.year} &middot; {auctionCard.set}</p>
            </div>
          </div>
          <div className="flex gap-4 mt-3">
            <div>
              <p className="text-xs text-gray-500">Market Value</p>
              <p className="text-emerald-400 font-bold">{auctionCard.estimatedValueRaw}</p>
            </div>
            {auctionCard.estimatedValueGem && (
              <div>
                <p className="text-xs text-gray-500">Gem Mint</p>
                <p className="text-white font-bold">{auctionCard.estimatedValueGem}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-500">Your Bids</p>
              <p className="text-white font-bold">{myBids}</p>
            </div>
          </div>
        </div>

        {/* Active bidders */}
        <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-2">Active Bidders</p>
          <div className="space-y-2">
            <div className={`flex items-center gap-2 text-sm ${currentBidder === 'You' ? 'text-emerald-400 font-bold' : 'text-gray-400'}`}>
              <span>\uD83D\uDC64</span> You {currentBidder === 'You' && <span className="text-xs bg-emerald-500/20 px-1.5 rounded">Leading</span>}
            </div>
            {activeBidders.map(b => (
              <div key={b.name} className={`flex items-center gap-2 text-sm ${currentBidder === b.name ? 'text-red-400 font-bold' : 'text-gray-400'}`}>
                <span>{b.emoji}</span> {b.name} {currentBidder === b.name && <span className="text-xs bg-red-500/20 px-1.5 rounded">Leading</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bid history */}
      {bidHistory.length > 0 && (
        <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-2">Bid History ({bidHistory.length})</p>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {[...bidHistory].reverse().map((b, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className={b.bidder.includes('You') ? 'text-emerald-400' : 'text-gray-400'}>{b.bidder}</span>
                <span className="text-white font-medium">{formatPrice(b.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
