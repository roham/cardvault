'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';

// ── Types ──────────────────────────────────────────────────────────────────
type Sport = 'all' | 'baseball' | 'basketball' | 'football' | 'hockey';
type AuctionHouse = 'eBay' | 'Goldin' | 'Heritage' | 'PWCC' | 'MySlabs' | 'Whatnot';
type BuyerType = 'Collector' | 'Flipper' | 'Investor' | 'Dealer' | 'Museum' | 'First-Timer';

interface AuctionResult {
  id: number;
  player: string;
  card: string;
  sport: 'baseball' | 'basketball' | 'football' | 'hockey';
  auctionHouse: AuctionHouse;
  hammerPrice: number;
  bids: number;
  buyerType: BuyerType;
  timeAgo: string;
  isHot: boolean;
  grade: string;
  slug: string;
}

// ── Deterministic seed ─────────────────────────────────────────────────────
function getDaySeed(): number {
  const now = new Date();
  return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ── Auction Data Pool ─────────────────────────────────────────────────────
const PLAYERS_POOL: { player: string; card: string; sport: 'baseball' | 'basketball' | 'football' | 'hockey'; slug: string; basePrice: number }[] = [
  { player: 'Shohei Ohtani', card: '2018 Topps Update RC #US1', sport: 'baseball', slug: 'shohei-ohtani', basePrice: 350 },
  { player: 'Mike Trout', card: '2011 Topps Update RC #US175', sport: 'baseball', slug: 'mike-trout', basePrice: 400 },
  { player: 'Paul Skenes', card: '2024 Bowman Chrome 1st', sport: 'baseball', slug: 'paul-skenes', basePrice: 120 },
  { player: 'Jackson Chourio', card: '2024 Topps Chrome RC', sport: 'baseball', slug: 'jackson-chourio', basePrice: 75 },
  { player: 'Gunnar Henderson', card: '2023 Topps Chrome RC', sport: 'baseball', slug: 'gunnar-henderson', basePrice: 45 },
  { player: 'Bobby Witt Jr.', card: '2022 Topps Chrome RC', sport: 'baseball', slug: 'bobby-witt-jr', basePrice: 55 },
  { player: 'Elly De La Cruz', card: '2023 Topps Chrome RC', sport: 'baseball', slug: 'elly-de-la-cruz', basePrice: 20 },
  { player: 'Corbin Carroll', card: '2023 Topps Chrome RC', sport: 'baseball', slug: 'corbin-carroll', basePrice: 18 },
  { player: 'Ken Griffey Jr.', card: '1989 Upper Deck RC #1', sport: 'baseball', slug: 'ken-griffey-jr', basePrice: 150 },
  { player: 'Derek Jeter', card: '1993 SP Foil #279', sport: 'baseball', slug: 'derek-jeter', basePrice: 250 },
  { player: 'Victor Wembanyama', card: '2023 Panini Prizm RC', sport: 'basketball', slug: 'victor-wembanyama', basePrice: 300 },
  { player: 'Luka Doncic', card: '2018 Panini Prizm RC #280', sport: 'basketball', slug: 'luka-doncic', basePrice: 500 },
  { player: 'Anthony Edwards', card: '2020 Panini Prizm RC', sport: 'basketball', slug: 'anthony-edwards', basePrice: 150 },
  { player: 'Caitlin Clark', card: '2024 Panini Prizm RC', sport: 'basketball', slug: 'caitlin-clark', basePrice: 200 },
  { player: 'Jayson Tatum', card: '2017 Panini Prizm RC', sport: 'basketball', slug: 'jayson-tatum', basePrice: 130 },
  { player: 'Nikola Jokic', card: '2015 Panini Prizm RC', sport: 'basketball', slug: 'nikola-jokic', basePrice: 380 },
  { player: 'LeBron James', card: '2003 Topps Chrome RC #111', sport: 'basketball', slug: 'lebron-james', basePrice: 7500 },
  { player: 'Shai Gilgeous-Alexander', card: '2018 Panini Prizm RC', sport: 'basketball', slug: 'shai-gilgeous-alexander', basePrice: 140 },
  { player: 'Cooper Flagg', card: '2025 Panini Prizm Draft Picks', sport: 'basketball', slug: 'cooper-flagg', basePrice: 70 },
  { player: 'Paolo Banchero', card: '2022 Panini Prizm RC', sport: 'basketball', slug: 'paolo-banchero', basePrice: 20 },
  { player: 'Patrick Mahomes', card: '2017 Panini Prizm RC', sport: 'football', slug: 'patrick-mahomes', basePrice: 600 },
  { player: 'Josh Allen', card: '2018 Panini Prizm RC', sport: 'football', slug: 'josh-allen', basePrice: 280 },
  { player: 'Caleb Williams', card: '2024 Panini Prizm RC', sport: 'football', slug: 'caleb-williams', basePrice: 80 },
  { player: 'CJ Stroud', card: '2023 Panini Prizm RC', sport: 'football', slug: 'cj-stroud', basePrice: 100 },
  { player: 'Joe Burrow', card: '2020 Panini Prizm RC', sport: 'football', slug: 'joe-burrow', basePrice: 150 },
  { player: 'Jayden Daniels', card: '2024 Panini Prizm RC', sport: 'football', slug: 'jayden-daniels', basePrice: 55 },
  { player: 'Lamar Jackson', card: '2018 Panini Prizm RC', sport: 'football', slug: 'lamar-jackson', basePrice: 160 },
  { player: 'Cam Ward', card: '2025 Bowman University', sport: 'football', slug: 'cam-ward', basePrice: 40 },
  { player: 'Marvin Harrison Jr.', card: '2024 Panini Prizm RC', sport: 'football', slug: 'marvin-harrison-jr', basePrice: 65 },
  { player: 'Drake Maye', card: '2024 Panini Prizm RC', sport: 'football', slug: 'drake-maye', basePrice: 25 },
  { player: 'Connor McDavid', card: '2015 Upper Deck Young Guns RC', sport: 'hockey', slug: 'connor-mcdavid', basePrice: 600 },
  { player: 'Connor Bedard', card: '2023 Upper Deck Young Guns RC', sport: 'hockey', slug: 'connor-bedard', basePrice: 200 },
  { player: 'Macklin Celebrini', card: '2024 Upper Deck Young Guns RC', sport: 'hockey', slug: 'macklin-celebrini', basePrice: 100 },
  { player: 'Cale Makar', card: '2019 Upper Deck Young Guns RC', sport: 'hockey', slug: 'cale-makar', basePrice: 140 },
  { player: 'Auston Matthews', card: '2016 Upper Deck Young Guns RC', sport: 'hockey', slug: 'auston-matthews', basePrice: 150 },
  { player: 'Nathan MacKinnon', card: '2013 Upper Deck Young Guns RC', sport: 'hockey', slug: 'nathan-mackinnon', basePrice: 280 },
  { player: 'Leon Draisaitl', card: '2014 Upper Deck Young Guns RC', sport: 'hockey', slug: 'leon-draisaitl', basePrice: 140 },
  { player: 'Matvei Michkov', card: '2024 Upper Deck Young Guns RC', sport: 'hockey', slug: 'matvei-michkov', basePrice: 80 },
];

const AUCTION_HOUSES: AuctionHouse[] = ['eBay', 'Goldin', 'Heritage', 'PWCC', 'MySlabs', 'Whatnot'];
const BUYER_TYPES: BuyerType[] = ['Collector', 'Flipper', 'Investor', 'Dealer', 'Museum', 'First-Timer'];
const GRADES = ['Raw', 'PSA 7', 'PSA 8', 'PSA 9', 'PSA 10', 'BGS 9', 'BGS 9.5', 'BGS 10', 'CGC 9', 'CGC 9.5', 'SGC 10'];
const TIME_AGOS = ['Just now', '1m ago', '2m ago', '3m ago', '5m ago', '8m ago', '12m ago', '15m ago', '20m ago', '25m ago', '30m ago', '45m ago', '1h ago', '2h ago'];

function generateAuctions(seed: number, count: number): AuctionResult[] {
  const rand = seededRandom(seed);
  const results: AuctionResult[] = [];

  for (let i = 0; i < count; i++) {
    const pool = PLAYERS_POOL[Math.floor(rand() * PLAYERS_POOL.length)];
    const grade = GRADES[Math.floor(rand() * GRADES.length)];
    const gradeMultiplier = grade === 'Raw' ? 0.3 : grade.includes('10') ? 3.5 : grade.includes('9.5') ? 2.2 : grade.includes('9') ? 1.5 : grade.includes('8') ? 0.8 : 0.5;
    const variance = 0.7 + rand() * 0.6;
    const hammerPrice = Math.round(pool.basePrice * gradeMultiplier * variance);
    const bids = Math.floor(rand() * 40) + 1;
    const isHot = bids > 25 || hammerPrice > 1000;

    results.push({
      id: i,
      player: pool.player,
      card: pool.card,
      sport: pool.sport,
      auctionHouse: AUCTION_HOUSES[Math.floor(rand() * AUCTION_HOUSES.length)],
      hammerPrice,
      bids,
      buyerType: BUYER_TYPES[Math.floor(rand() * BUYER_TYPES.length)],
      timeAgo: TIME_AGOS[Math.min(i, TIME_AGOS.length - 1)],
      isHot,
      grade,
      slug: pool.slug,
    });
  }

  return results;
}

// ── Component ──────────────────────────────────────────────────────────────
export default function AuctionTickerClient() {
  const [sportFilter, setSportFilter] = useState<Sport>('all');
  const [houseFilter, setHouseFilter] = useState<AuctionHouse | 'all'>('all');
  const [showHotOnly, setShowHotOnly] = useState(false);
  const [tickerPaused, setTickerPaused] = useState(false);
  const [visibleCount, setVisibleCount] = useState(20);

  const allAuctions = useMemo(() => generateAuctions(getDaySeed(), 60), []);

  const filteredAuctions = useMemo(() => {
    let results = allAuctions;
    if (sportFilter !== 'all') results = results.filter(a => a.sport === sportFilter);
    if (houseFilter !== 'all') results = results.filter(a => a.auctionHouse === houseFilter);
    if (showHotOnly) results = results.filter(a => a.isHot);
    return results;
  }, [allAuctions, sportFilter, houseFilter, showHotOnly]);

  // Auto-increment visible count to simulate live feed
  useEffect(() => {
    if (tickerPaused) return;
    const timer = setInterval(() => {
      setVisibleCount(prev => Math.min(prev + 1, filteredAuctions.length));
    }, 3000);
    return () => clearInterval(timer);
  }, [tickerPaused, filteredAuctions.length]);

  // Stats
  const stats = useMemo(() => {
    const totalVolume = allAuctions.reduce((a, b) => a + b.hammerPrice, 0);
    const avgPrice = Math.round(totalVolume / allAuctions.length);
    const hotCount = allAuctions.filter(a => a.isHot).length;
    const totalBids = allAuctions.reduce((a, b) => a + b.bids, 0);
    const heatIndex = Math.min(100, Math.round((hotCount / allAuctions.length) * 100 * 2.5));

    return { totalVolume, avgPrice, hotCount, totalBids, heatIndex };
  }, [allAuctions]);

  // Highest sale
  const topSale = useMemo(() => {
    return [...allAuctions].sort((a, b) => b.hammerPrice - a.hammerPrice)[0];
  }, [allAuctions]);

  // Most active sport
  const sportBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    allAuctions.forEach(a => { counts[a.sport] = (counts[a.sport] || 0) + 1; });
    return counts;
  }, [allAuctions]);

  const formatPrice = useCallback((p: number) => {
    return p >= 1000 ? `$${(p / 1000).toFixed(1)}K` : `$${p}`;
  }, []);

  const sportColors: Record<string, string> = {
    baseball: 'text-red-400',
    basketball: 'text-orange-400',
    football: 'text-green-400',
    hockey: 'text-blue-400',
  };

  const houseColors: Record<string, string> = {
    eBay: 'bg-blue-500/20 text-blue-400',
    Goldin: 'bg-amber-500/20 text-amber-400',
    Heritage: 'bg-emerald-500/20 text-emerald-400',
    PWCC: 'bg-purple-500/20 text-purple-400',
    MySlabs: 'bg-pink-500/20 text-pink-400',
    Whatnot: 'bg-cyan-500/20 text-cyan-400',
  };

  const heatColor = stats.heatIndex > 70 ? 'text-red-400' : stats.heatIndex > 40 ? 'text-amber-400' : 'text-blue-400';

  return (
    <div className="space-y-6">
      {/* Live Indicator + Heat Index */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${tickerPaused ? 'bg-zinc-500' : 'bg-red-500 animate-pulse'}`} />
            <span className="text-xs font-medium text-zinc-400">{tickerPaused ? 'PAUSED' : 'LIVE'}</span>
          </div>
          <button
            onClick={() => setTickerPaused(!tickerPaused)}
            className="px-2 py-1 bg-zinc-800 rounded text-xs text-zinc-400 hover:text-white transition-colors"
          >
            {tickerPaused ? 'Resume' : 'Pause'}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">Auction Heat:</span>
          <div className="w-24 bg-zinc-800 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${stats.heatIndex > 70 ? 'bg-red-500' : stats.heatIndex > 40 ? 'bg-amber-500' : 'bg-blue-500'}`}
              style={{ width: `${stats.heatIndex}%` }}
            />
          </div>
          <span className={`text-xs font-bold ${heatColor}`}>{stats.heatIndex}/100</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-emerald-400">${(stats.totalVolume / 1000).toFixed(0)}K</div>
          <div className="text-[10px] text-zinc-500">24h Volume</div>
        </div>
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-white">{allAuctions.length}</div>
          <div className="text-[10px] text-zinc-500">Sales Today</div>
        </div>
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-amber-400">${stats.avgPrice}</div>
          <div className="text-[10px] text-zinc-500">Avg Price</div>
        </div>
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-purple-400">{stats.totalBids}</div>
          <div className="text-[10px] text-zinc-500">Total Bids</div>
        </div>
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-red-400">{stats.hotCount}</div>
          <div className="text-[10px] text-zinc-500">Hot Auctions</div>
        </div>
      </div>

      {/* Top Sale Banner */}
      {topSale && (
        <div className="bg-gradient-to-r from-amber-950/40 to-zinc-900/50 border border-amber-800/30 rounded-lg p-4">
          <div className="text-[10px] uppercase tracking-wider text-amber-500 mb-1">Top Sale Today</div>
          <div className="flex items-center justify-between">
            <div>
              <Link href={`/players/${topSale.slug}`} className="font-bold text-white hover:text-amber-400 transition-colors">
                {topSale.player}
              </Link>
              <span className="text-sm text-zinc-400 ml-2">{topSale.card} &middot; {topSale.grade}</span>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-emerald-400">{formatPrice(topSale.hammerPrice)}</div>
              <div className="text-xs text-zinc-500">{topSale.bids} bids &middot; {topSale.auctionHouse}</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex gap-1">
          {(['all', 'baseball', 'basketball', 'football', 'hockey'] as Sport[]).map(s => (
            <button
              key={s}
              onClick={() => setSportFilter(s)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                sportFilter === s ? 'bg-amber-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-300'
              }`}
            >
              {s === 'all' ? 'All Sports' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {(['all', ...AUCTION_HOUSES] as (AuctionHouse | 'all')[]).map(h => (
            <button
              key={h}
              onClick={() => setHouseFilter(h)}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                houseFilter === h ? 'bg-amber-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-300'
              }`}
            >
              {h === 'all' ? 'All Houses' : h}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowHotOnly(!showHotOnly)}
          className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
            showHotOnly ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-300'
          }`}
        >
          Hot Only
        </button>
      </div>

      {/* Sport Breakdown */}
      <div className="flex gap-4">
        {(['baseball', 'basketball', 'football', 'hockey'] as const).map(s => (
          <div key={s} className="flex items-center gap-1.5 text-xs">
            <span className={`w-2 h-2 rounded-full ${s === 'baseball' ? 'bg-red-500' : s === 'basketball' ? 'bg-orange-500' : s === 'football' ? 'bg-green-500' : 'bg-blue-500'}`} />
            <span className="text-zinc-400 capitalize">{s}</span>
            <span className="text-zinc-600">{sportBreakdown[s] || 0}</span>
          </div>
        ))}
      </div>

      {/* Auction Feed */}
      <div className="space-y-2">
        {filteredAuctions.slice(0, visibleCount).map((auction) => (
          <div
            key={auction.id}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
              auction.isHot
                ? 'bg-amber-950/20 border-amber-800/30'
                : 'bg-zinc-900/40 border-zinc-800'
            }`}
          >
            {/* Time */}
            <div className="text-[10px] text-zinc-600 w-14 flex-shrink-0 text-right">
              {auction.timeAgo}
            </div>

            {/* Sport dot */}
            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
              auction.sport === 'baseball' ? 'bg-red-500' :
              auction.sport === 'basketball' ? 'bg-orange-500' :
              auction.sport === 'football' ? 'bg-green-500' : 'bg-blue-500'
            }`} />

            {/* Card Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Link
                  href={`/players/${auction.slug}`}
                  className={`font-medium text-sm hover:text-amber-400 transition-colors ${sportColors[auction.sport]}`}
                >
                  {auction.player}
                </Link>
                {auction.isHot && <span className="text-[10px] text-red-400 font-bold">HOT</span>}
              </div>
              <div className="text-xs text-zinc-500 truncate">
                {auction.card} &middot; {auction.grade}
              </div>
            </div>

            {/* Auction House */}
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded flex-shrink-0 ${houseColors[auction.auctionHouse]}`}>
              {auction.auctionHouse}
            </span>

            {/* Price + Bids */}
            <div className="text-right flex-shrink-0 w-20">
              <div className="font-bold text-sm text-emerald-400">{formatPrice(auction.hammerPrice)}</div>
              <div className="text-[10px] text-zinc-600">{auction.bids} bids</div>
            </div>

            {/* Buyer Type */}
            <div className="text-[10px] text-zinc-600 w-16 flex-shrink-0 hidden sm:block">
              {auction.buyerType}
            </div>
          </div>
        ))}
      </div>

      {visibleCount < filteredAuctions.length && (
        <div className="text-center">
          <button
            onClick={() => setVisibleCount(prev => Math.min(prev + 10, filteredAuctions.length))}
            className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Load More ({filteredAuctions.length - visibleCount} remaining)
          </button>
        </div>
      )}

      {filteredAuctions.length === 0 && (
        <div className="text-center py-12 text-zinc-500 text-sm">
          No auctions match your filters. Try adjusting sport or house filters.
        </div>
      )}

      {/* Internal Links */}
      <div className="border-t border-zinc-800 pt-10">
        <h2 className="text-xl font-bold text-white mb-4">More Live Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/market-movers" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-amber-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">Market Movers</h3>
            <p className="text-xs text-zinc-500">Daily gainers and decliners</p>
          </Link>
          <Link href="/price-ticker" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-amber-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">Price Ticker</h3>
            <p className="text-xs text-zinc-500">Live scrolling card price feed</p>
          </Link>
          <Link href="/market-alerts" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-amber-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">Market Alerts</h3>
            <p className="text-xs text-zinc-500">Real-time market notifications</p>
          </Link>
          <Link href="/auction" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-amber-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">Auction House</h3>
            <p className="text-xs text-zinc-500">Browse and bid on cards</p>
          </Link>
          <Link href="/hobby-awards" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-amber-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">2025 Hobby Awards</h3>
            <p className="text-xs text-zinc-500">Vote for the best cards of the year</p>
          </Link>
          <Link href="/tools" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-amber-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">All Tools</h3>
            <p className="text-xs text-zinc-500">81+ free collector tools</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
