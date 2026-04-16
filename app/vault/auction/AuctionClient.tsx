'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { sportsCards } from '@/data/sports-cards';

interface AuctionCard {
  slug: string;
  name: string;
  player: string;
  sport: string;
  year: number;
  value: number;
  rookie: boolean;
}

interface Bidder {
  name: string;
  emoji: string;
  style: 'aggressive' | 'conservative' | 'sniper' | 'emotional';
  maxMultiplier: number;
}

type GameState = 'lobby' | 'bidding' | 'sold' | 'results';
type AuctionResult = { card: AuctionCard; winner: string; price: number; yourBid: number; won: boolean };

function parseValue(val: string): number {
  const m = val.match(/\$([0-9,.]+)/);
  return m ? parseFloat(m[1].replace(',', '')) : 5;
}

function seededRng(seed: number): () => number {
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

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const SPORT_LABELS: Record<string, string> = { baseball: 'MLB', basketball: 'NBA', football: 'NFL', hockey: 'NHL' };

const AI_BIDDERS: Bidder[] = [
  { name: 'Big Mike', emoji: '💪', style: 'aggressive', maxMultiplier: 1.8 },
  { name: 'Penny', emoji: '🧮', style: 'conservative', maxMultiplier: 1.2 },
  { name: 'The Sniper', emoji: '🎯', style: 'sniper', maxMultiplier: 1.5 },
  { name: 'CardFan99', emoji: '❤️', style: 'emotional', maxMultiplier: 2.0 },
];

const STATS_KEY = 'cv_auction_stats';

interface Stats {
  auctions: number;
  won: number;
  spent: number;
  saved: number;
  bestDeal: number;
}

function loadStats(): Stats {
  if (typeof window === 'undefined') return { auctions: 0, won: 0, spent: 0, saved: 0, bestDeal: 0 };
  try {
    const r = localStorage.getItem(STATS_KEY);
    return r ? JSON.parse(r) : { auctions: 0, won: 0, spent: 0, saved: 0, bestDeal: 0 };
  } catch { return { auctions: 0, won: 0, spent: 0, saved: 0, bestDeal: 0 }; }
}

function saveStats(s: Stats) {
  try { localStorage.setItem(STATS_KEY, JSON.stringify(s)); } catch {}
}

function getGrade(won: number, total: number): { grade: string; color: string } {
  const pct = total > 0 ? won / total : 0;
  if (pct >= 0.8) return { grade: 'S', color: 'text-yellow-400' };
  if (pct >= 0.6) return { grade: 'A', color: 'text-green-400' };
  if (pct >= 0.4) return { grade: 'B', color: 'text-blue-400' };
  if (pct >= 0.2) return { grade: 'C', color: 'text-gray-400' };
  return { grade: 'D', color: 'text-orange-400' };
}

export default function AuctionClient() {
  const [gameState, setGameState] = useState<GameState>('lobby');
  const [mode, setMode] = useState<'daily' | 'random'>('daily');
  const [sportFilter, setSportFilter] = useState('all');
  const [budget, setBudget] = useState(500);
  const [remaining, setRemaining] = useState(500);
  const [lots, setLots] = useState<AuctionCard[]>([]);
  const [currentLot, setCurrentLot] = useState(0);
  const [currentBid, setCurrentBid] = useState(0);
  const [yourBid, setYourBid] = useState(0);
  const [aiBids, setAiBids] = useState<{ bidder: Bidder; amount: number }[]>([]);
  const [bidHistory, setBidHistory] = useState<string[]>([]);
  const [results, setResults] = useState<AuctionResult[]>([]);
  const [stats, setStats] = useState<Stats>(loadStats);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const rngRef = useRef<() => number>(() => Math.random());
  const totalLots = 5;

  const startAuction = useCallback((m: 'daily' | 'random') => {
    const seed = m === 'daily' ? dateHash() + 999 : Math.floor(Math.random() * 999999);
    const rng = seededRng(seed);
    rngRef.current = rng;

    const pool = sportsCards
      .filter(c => sportFilter === 'all' || c.sport === sportFilter)
      .map(c => ({ slug: c.slug, name: c.name, player: c.player, sport: c.sport, year: c.year, value: parseValue(c.estimatedValueRaw), rookie: c.rookie }));

    const shuffled = shuffle(pool, rng);
    // Pick 5 lots with varied values
    const selected = shuffled.filter(c => c.value >= 3).slice(0, totalLots);
    if (selected.length < totalLots) return;

    setLots(selected);
    setMode(m);
    setBudget(500);
    setRemaining(500);
    setCurrentLot(0);
    setResults([]);
    setYourBid(0);
    setCurrentBid(0);
    setAiBids([]);
    setBidHistory([]);
    setGameState('bidding');
    setCountdown(15);
  }, [sportFilter]);

  // Countdown timer
  useEffect(() => {
    if (gameState !== 'bidding' || countdown <= 0) return;
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        // AI bids happen at random intervals
        if (prev > 3 && Math.random() < 0.35) {
          const card = lots[currentLot];
          if (card) {
            const bidder = AI_BIDDERS[Math.floor(Math.random() * AI_BIDDERS.length)];
            const maxBid = Math.floor(card.value * bidder.maxMultiplier);
            setCurrentBid(cb => {
              const minNext = cb + Math.max(1, Math.floor(cb * 0.1));
              if (minNext > maxBid) return cb; // AI won't bid higher
              const newBid = minNext + Math.floor(Math.random() * Math.max(1, Math.floor((maxBid - minNext) * 0.3)));
              const finalBid = Math.min(newBid, maxBid);
              setAiBids(ab => [...ab, { bidder, amount: finalBid }]);
              setBidHistory(bh => [...bh, `${bidder.emoji} ${bidder.name} bids $${finalBid}`]);
              return finalBid;
            });
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [gameState, countdown, currentLot, lots]);

  // When countdown hits 0, resolve the lot
  useEffect(() => {
    if (gameState !== 'bidding' || countdown !== 0) return;
    const card = lots[currentLot];
    if (!card) return;

    const highestAi = aiBids.length > 0 ? Math.max(...aiBids.map(b => b.amount)) : 0;
    const won = yourBid > 0 && yourBid >= highestAi;
    const winnerName = won ? 'You' : (aiBids.length > 0 ? aiBids.reduce((a, b) => a.amount > b.amount ? a : b).bidder.name : 'No bids');
    const winPrice = won ? yourBid : highestAi;

    const result: AuctionResult = { card, winner: winnerName, price: winPrice, yourBid, won };
    const newResults = [...results, result];
    setResults(newResults);

    if (won) {
      setRemaining(r => r - yourBid);
    }

    setGameState('sold');
  }, [countdown, gameState, aiBids, yourBid, currentLot, lots, results]);

  const placeBid = useCallback((amount: number) => {
    if (gameState !== 'bidding' || amount > remaining) return;
    const newBid = Math.max(currentBid + 1, amount);
    if (newBid > remaining) return;
    setYourBid(newBid);
    setCurrentBid(newBid);
    setBidHistory(bh => [...bh, `🙋 You bid $${newBid}`]);
  }, [gameState, currentBid, remaining]);

  const nextLot = useCallback(() => {
    const next = currentLot + 1;
    if (next >= totalLots) {
      // Auction over
      const wonCount = results.filter(r => r.won).length;
      const totalSpent = results.filter(r => r.won).reduce((s, r) => s + r.price, 0);
      const totalValue = results.filter(r => r.won).reduce((s, r) => s + r.card.value, 0);
      const ns = { ...stats };
      ns.auctions++;
      ns.won += wonCount;
      ns.spent += totalSpent;
      ns.saved += Math.max(0, totalValue - totalSpent);
      ns.bestDeal = Math.max(ns.bestDeal, totalValue - totalSpent);
      setStats(ns);
      saveStats(ns);
      setGameState('results');
      return;
    }
    setCurrentLot(next);
    setCurrentBid(0);
    setYourBid(0);
    setAiBids([]);
    setBidHistory([]);
    setCountdown(15);
    setGameState('bidding');
  }, [currentLot, results, stats]);

  const shareResults = useCallback(() => {
    const wonCount = results.filter(r => r.won).length;
    const spent = results.filter(r => r.won).reduce((s, r) => s + r.price, 0);
    const grade = getGrade(wonCount, totalLots);
    const text = `Card Auction House ${mode === 'daily' ? 'Daily' : 'Random'}\nWon ${wonCount}/${totalLots} lots | Spent $${spent}/$500\nGrade: ${grade.grade}\nhttps://cardvault-two.vercel.app/vault/auction`;
    navigator.clipboard.writeText(text).catch(() => {});
  }, [results, mode]);

  if (gameState === 'lobby') {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2 justify-center">
          {['all', 'baseball', 'basketball', 'football', 'hockey'].map(s => (
            <button key={s} onClick={() => setSportFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${sportFilter === s ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
              {s === 'all' ? 'All Sports' : SPORT_LABELS[s] || s}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => startAuction('daily')} className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition text-lg">
            Daily Auction
          </button>
          <button onClick={() => startAuction('random')} className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl transition text-lg">
            Random Auction
          </button>
        </div>

        <div className="bg-gray-900/60 border border-gray-700/50 rounded-xl p-5">
          <h3 className="text-lg font-bold text-white mb-3">How It Works</h3>
          <ol className="space-y-2 text-gray-300 text-sm list-decimal list-inside">
            <li>5 sports cards go up for auction, one at a time</li>
            <li>You start with a <strong>$500 budget</strong> to bid across all 5 lots</li>
            <li>4 AI bidders compete against you with different strategies</li>
            <li>Each lot has a 15-second bidding window</li>
            <li>Highest bid when time runs out wins the card</li>
            <li>Win cards below market value to get the best grade</li>
          </ol>
        </div>

        <div className="bg-gray-900/60 border border-gray-700/50 rounded-xl p-5">
          <h3 className="text-lg font-bold text-white mb-3">The Bidders</h3>
          <div className="grid grid-cols-2 gap-3">
            {AI_BIDDERS.map(b => (
              <div key={b.name} className="bg-gray-800/50 rounded-lg p-3">
                <p className="font-bold text-white">{b.emoji} {b.name}</p>
                <p className="text-xs text-gray-400 capitalize">{b.style} — {b.style === 'aggressive' ? 'bids hard and fast' : b.style === 'conservative' ? 'sticks to fair prices' : b.style === 'sniper' ? 'waits then strikes late' : 'overpays for favorites'}</p>
              </div>
            ))}
          </div>
        </div>

        {stats.auctions > 0 && (
          <div className="bg-gray-900/60 border border-gray-700/50 rounded-xl p-5">
            <h3 className="text-lg font-bold text-white mb-3">Your Stats</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div><p className="text-2xl font-bold text-amber-400">{stats.auctions}</p><p className="text-xs text-gray-400">Auctions</p></div>
              <div><p className="text-2xl font-bold text-green-400">{stats.won}</p><p className="text-xs text-gray-400">Cards Won</p></div>
              <div><p className="text-2xl font-bold text-yellow-400">${stats.saved}</p><p className="text-xs text-gray-400">Total Saved</p></div>
              <div><p className="text-2xl font-bold text-blue-400">${stats.bestDeal}</p><p className="text-xs text-gray-400">Best Deal</p></div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (gameState === 'results') {
    const wonCount = results.filter(r => r.won).length;
    const totalSpent = results.filter(r => r.won).reduce((s, r) => s + r.price, 0);
    const totalValue = results.filter(r => r.won).reduce((s, r) => s + r.card.value, 0);
    const grade = getGrade(wonCount, totalLots);

    return (
      <div className="space-y-6">
        <div className="text-center space-y-3">
          <p className="text-3xl font-black text-white">Auction Complete</p>
          <p className={`text-6xl font-black ${grade.color}`}>{grade.grade}</p>
          <div className="flex justify-center gap-6">
            <div><p className="text-2xl font-bold text-green-400">{wonCount}</p><p className="text-xs text-gray-400">Won</p></div>
            <div><p className="text-2xl font-bold text-amber-400">${totalSpent}</p><p className="text-xs text-gray-400">Spent</p></div>
            <div><p className="text-2xl font-bold text-blue-400">${totalValue}</p><p className="text-xs text-gray-400">Value Won</p></div>
            <div><p className={`text-2xl font-bold ${totalValue - totalSpent >= 0 ? 'text-green-400' : 'text-red-400'}`}>${totalValue - totalSpent}</p><p className="text-xs text-gray-400">Savings</p></div>
          </div>
        </div>

        <div className="space-y-2">
          {results.map((r, i) => (
            <div key={i} className={`flex items-center justify-between p-3 rounded-lg ${r.won ? 'bg-green-900/30 border border-green-800/40' : 'bg-gray-900/50 border border-gray-800/40'}`}>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{r.card.player}</p>
                <p className="text-xs text-gray-400">{SPORT_LABELS[r.card.sport]} &middot; {r.card.year}{r.card.rookie ? ' · RC' : ''} &middot; FMV ${r.card.value}</p>
              </div>
              <div className="text-right ml-3">
                <p className={`text-sm font-bold ${r.won ? 'text-green-400' : 'text-gray-500'}`}>{r.won ? `WON $${r.price}` : `Lost to ${r.winner}`}</p>
                {r.won && <p className="text-xs text-gray-400">Saved ${Math.max(0, r.card.value - r.price)}</p>}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 justify-center">
          <button onClick={shareResults} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-bold transition">Share Results</button>
          <button onClick={() => setGameState('lobby')} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition">New Auction</button>
        </div>
      </div>
    );
  }

  // Bidding or Sold state
  const card = lots[currentLot];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">Lot {currentLot + 1}/{totalLots}</span>
        <span className="text-amber-400 font-bold">Budget: ${remaining}</span>
      </div>

      {/* Card display */}
      <div className="bg-gray-900/80 border-2 border-amber-600/60 rounded-xl p-5 text-center">
        <p className="text-xs text-amber-400 font-bold uppercase tracking-wider mb-2">Now Selling</p>
        <p className="text-lg font-black text-white mb-1">{card.player}</p>
        <p className="text-sm text-gray-400 mb-2">{card.year} &middot; {SPORT_LABELS[card.sport]}{card.rookie ? ' · Rookie Card' : ''}</p>
        <p className="text-xs text-gray-500 mb-3 line-clamp-1">{card.name}</p>
        <p className="text-xs text-gray-500">Est. Market Value: <span className="text-white font-bold">${card.value}</span></p>
      </div>

      {/* Current bid + timer */}
      <div className="flex items-center justify-between bg-gray-800/80 rounded-xl p-4">
        <div>
          <p className="text-xs text-gray-400">Current Bid</p>
          <p className="text-2xl font-black text-white">${currentBid}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Time Left</p>
          <p className={`text-2xl font-black ${countdown <= 3 ? 'text-red-400 animate-pulse' : countdown <= 7 ? 'text-amber-400' : 'text-green-400'}`}>{countdown}s</p>
        </div>
      </div>

      {/* Sold overlay */}
      {gameState === 'sold' && (
        <div className="bg-gray-900/90 border border-amber-700/50 rounded-xl p-5 text-center space-y-3">
          {results[results.length - 1]?.won ? (
            <>
              <p className="text-2xl font-black text-green-400">You Won!</p>
              <p className="text-gray-400">Purchased for <span className="text-white font-bold">${results[results.length - 1].price}</span> (market: ${card.value})</p>
            </>
          ) : (
            <>
              <p className="text-2xl font-black text-red-400">Outbid!</p>
              <p className="text-gray-400">{results[results.length - 1]?.winner} won at ${results[results.length - 1]?.price}</p>
            </>
          )}
          <button onClick={nextLot} className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold transition">
            {currentLot + 1 >= totalLots ? 'See Results' : 'Next Lot →'}
          </button>
        </div>
      )}

      {/* Bid buttons */}
      {gameState === 'bidding' && countdown > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: '+$1', amount: currentBid + 1 },
            { label: '+$5', amount: currentBid + 5 },
            { label: '+$10', amount: currentBid + 10 },
            { label: '+$25', amount: currentBid + 25 },
            { label: '+$50', amount: currentBid + 50 },
            { label: 'Max', amount: remaining },
          ].map(btn => (
            <button key={btn.label} onClick={() => placeBid(btn.amount)} disabled={btn.amount > remaining}
              className={`py-2 rounded-lg text-sm font-bold transition ${btn.amount <= remaining ? 'bg-amber-700 hover:bg-amber-600 text-white' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}>
              {btn.label} (${Math.min(btn.amount, remaining)})
            </button>
          ))}
        </div>
      )}

      {/* Your bid indicator */}
      {yourBid > 0 && gameState === 'bidding' && (
        <p className="text-center text-sm text-green-400">Your bid: <span className="font-bold">${yourBid}</span> {yourBid >= currentBid ? '(leading)' : '(outbid!)'}</p>
      )}

      {/* Bid history */}
      {bidHistory.length > 0 && (
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-3 max-h-32 overflow-y-auto">
          <p className="text-xs text-gray-500 mb-1 font-bold">Bid History</p>
          {bidHistory.slice(-6).map((b, i) => (
            <p key={i} className="text-xs text-gray-400">{b}</p>
          ))}
        </div>
      )}

      {/* Lot progress */}
      <div className="flex gap-1 justify-center">
        {lots.map((_, i) => {
          const r = results[i];
          return (
            <div key={i} className={`w-8 h-2 rounded-full ${i === currentLot ? 'bg-amber-500' : r?.won ? 'bg-green-500' : r ? 'bg-red-500' : 'bg-gray-700'}`} />
          );
        })}
      </div>
    </div>
  );
}
