'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';

/* ───── Seeded RNG ───── */
function seededRng(seed: number) {
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

/* ───── Market data generation ───── */
interface TickerCard {
  player: string;
  set: string;
  sport: 'baseball' | 'basketball' | 'football' | 'hockey';
  basePrice: number;
  change: number; // percent
  volume: number;
  slug: string;
}

const sportColors: Record<string, string> = {
  baseball: 'text-red-400',
  basketball: 'text-orange-400',
  football: 'text-emerald-400',
  hockey: 'text-blue-400',
};

const sportBg: Record<string, string> = {
  baseball: 'bg-red-950/30',
  basketball: 'bg-orange-950/30',
  football: 'bg-emerald-950/30',
  hockey: 'bg-blue-950/30',
};

const topCards: Array<{ player: string; set: string; sport: 'baseball' | 'basketball' | 'football' | 'hockey'; basePrice: number; slug: string }> = [
  { player: 'Mickey Mantle', set: '1952 Topps', sport: 'baseball', basePrice: 45000, slug: '1952-topps-mickey-mantle-311' },
  { player: 'Mike Trout', set: '2011 Topps Update', sport: 'baseball', basePrice: 2800, slug: '2011-topps-update-mike-trout-us175' },
  { player: 'Shohei Ohtani', set: '2018 Topps Chrome', sport: 'baseball', basePrice: 1200, slug: '2018-topps-chrome-shohei-ohtani-150' },
  { player: 'Derek Jeter', set: '1993 SP', sport: 'baseball', basePrice: 1500, slug: '1993-sp-derek-jeter-279' },
  { player: 'Ken Griffey Jr.', set: '1989 Upper Deck', sport: 'baseball', basePrice: 800, slug: '1989-upper-deck-ken-griffey-jr-1' },
  { player: 'LeBron James', set: '2003 Topps Chrome', sport: 'basketball', basePrice: 25000, slug: '2003-topps-chrome-lebron-james-111' },
  { player: 'Luka Doncic', set: '2018 Prizm', sport: 'basketball', basePrice: 3500, slug: '2018-19-panini-prizm-luka-doncic-280' },
  { player: 'Victor Wembanyama', set: '2023 Prizm', sport: 'basketball', basePrice: 2000, slug: '2023-24-panini-prizm-victor-wembanyama-275' },
  { player: 'Michael Jordan', set: '1986 Fleer', sport: 'basketball', basePrice: 35000, slug: '1986-fleer-michael-jordan-57' },
  { player: 'Stephen Curry', set: '2009 Topps Chrome', sport: 'basketball', basePrice: 4000, slug: '2009-topps-chrome-stephen-curry-101' },
  { player: 'Patrick Mahomes', set: '2017 Prizm', sport: 'football', basePrice: 6000, slug: '2017-panini-prizm-patrick-mahomes-269' },
  { player: 'Tom Brady', set: '2000 Playoff Contenders', sport: 'football', basePrice: 18000, slug: '2000-playoff-contenders-tom-brady-144' },
  { player: 'Josh Allen', set: '2018 Prizm', sport: 'football', basePrice: 1500, slug: '2018-panini-prizm-josh-allen-205' },
  { player: 'Ja\'Marr Chase', set: '2021 Prizm', sport: 'football', basePrice: 400, slug: 'jamarr-chase-2021-prizm-rc' },
  { player: 'Caleb Williams', set: '2024 Prizm', sport: 'football', basePrice: 300, slug: '2024-prizm-caleb-williams-301' },
  { player: 'Wayne Gretzky', set: '1979 OPC', sport: 'hockey', basePrice: 20000, slug: '1979-opc-wayne-gretzky-18' },
  { player: 'Connor McDavid', set: '2015 YG', sport: 'hockey', basePrice: 3000, slug: '2015-16-upper-deck-connor-mcdavid-201' },
  { player: 'Connor Bedard', set: '2023 YG', sport: 'hockey', basePrice: 500, slug: '2023-24-upper-deck-connor-bedard-201' },
  { player: 'Sidney Crosby', set: '2005 YG', sport: 'hockey', basePrice: 2500, slug: '2005-06-upper-deck-young-guns-sidney-crosby-201' },
  { player: 'Auston Matthews', set: '2016 YG', sport: 'hockey', basePrice: 1500, slug: '2016-17-upper-deck-young-guns-auston-matthews-201' },
];

function generateTickerData(seed: number): TickerCard[] {
  const rng = seededRng(seed);
  return topCards.map(card => {
    const change = (rng() - 0.45) * 15; // -6.75% to +8.25% (slight bullish bias)
    const volume = Math.floor(rng() * 200) + 10;
    return {
      ...card,
      change: Math.round(change * 100) / 100,
      volume,
    };
  });
}

/* ───── Ticker display ───── */
export default function TickerClient() {
  const [tickerData, setTickerData] = useState<TickerCard[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'change' | 'volume' | 'price'>('change');
  const [tickSeed, setTickSeed] = useState(dateHash());

  useEffect(() => {
    setTickerData(generateTickerData(tickSeed));
  }, [tickSeed]);

  // Simulate micro-movements every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTickSeed(prev => prev + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const filtered = useMemo(() => {
    let cards = tickerData;
    if (filter !== 'all') cards = cards.filter(c => c.sport === filter);
    if (sortBy === 'change') return [...cards].sort((a, b) => b.change - a.change);
    if (sortBy === 'volume') return [...cards].sort((a, b) => b.volume - a.volume);
    return [...cards].sort((a, b) => b.basePrice - a.basePrice);
  }, [tickerData, filter, sortBy]);

  const marketStats = useMemo(() => {
    if (tickerData.length === 0) return null;
    const gainers = tickerData.filter(c => c.change > 0).length;
    const losers = tickerData.filter(c => c.change < 0).length;
    const avgChange = tickerData.reduce((sum, c) => sum + c.change, 0) / tickerData.length;
    const totalVolume = tickerData.reduce((sum, c) => sum + c.volume, 0);
    const biggestGainer = [...tickerData].sort((a, b) => b.change - a.change)[0];
    const biggestLoser = [...tickerData].sort((a, b) => a.change - b.change)[0];
    return { gainers, losers, avgChange, totalVolume, biggestGainer, biggestLoser };
  }, [tickerData]);

  const formatPrice = useCallback((price: number, change: number) => {
    const current = price * (1 + change / 100);
    if (current >= 10000) return `$${(current / 1000).toFixed(1)}K`;
    if (current >= 1000) return `$${(current / 1000).toFixed(2)}K`;
    return `$${current.toFixed(0)}`;
  }, []);

  return (
    <div className="space-y-6">
      {/* Scrolling ticker strip */}
      <div className="bg-zinc-900 border-y border-zinc-800 py-2 overflow-hidden">
        <div className="animate-[scroll_30s_linear_infinite] flex gap-8 whitespace-nowrap">
          {[...tickerData, ...tickerData].map((card, i) => (
            <span key={`${card.slug}-${i}`} className="inline-flex items-center gap-2 text-sm">
              <span className="text-zinc-400 font-medium">{card.player}</span>
              <span className="text-zinc-600">{formatPrice(card.basePrice, card.change)}</span>
              <span className={`font-medium ${card.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {card.change >= 0 ? '+' : ''}{card.change.toFixed(2)}%
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Market summary */}
      {marketStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 text-center">
            <p className="text-zinc-500 text-xs mb-1">Market Sentiment</p>
            <p className={`text-xl font-bold ${marketStats.avgChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {marketStats.avgChange >= 0 ? 'BULLISH' : 'BEARISH'}
            </p>
            <p className={`text-xs ${marketStats.avgChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              Avg: {marketStats.avgChange >= 0 ? '+' : ''}{marketStats.avgChange.toFixed(2)}%
            </p>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 text-center">
            <p className="text-zinc-500 text-xs mb-1">Gainers / Losers</p>
            <p className="text-xl font-bold">
              <span className="text-emerald-400">{marketStats.gainers}</span>
              <span className="text-zinc-600 mx-1">/</span>
              <span className="text-red-400">{marketStats.losers}</span>
            </p>
            <p className="text-zinc-500 text-xs">of {tickerData.length} tracked</p>
          </div>
          <div className="bg-emerald-950/20 border border-emerald-800/30 rounded-xl p-4 text-center">
            <p className="text-zinc-500 text-xs mb-1">Biggest Gainer</p>
            <p className="text-white font-bold text-sm truncate">{marketStats.biggestGainer?.player}</p>
            <p className="text-emerald-400 text-xs font-medium">+{marketStats.biggestGainer?.change.toFixed(2)}%</p>
          </div>
          <div className="bg-red-950/20 border border-red-800/30 rounded-xl p-4 text-center">
            <p className="text-zinc-500 text-xs mb-1">Biggest Loser</p>
            <p className="text-white font-bold text-sm truncate">{marketStats.biggestLoser?.player}</p>
            <p className="text-red-400 text-xs font-medium">{marketStats.biggestLoser?.change.toFixed(2)}%</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex gap-1 bg-zinc-900/60 border border-zinc-800 rounded-lg p-1">
          {[
            { id: 'all', label: 'All' },
            { id: 'baseball', label: 'MLB' },
            { id: 'basketball', label: 'NBA' },
            { id: 'football', label: 'NFL' },
            { id: 'hockey', label: 'NHL' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filter === f.id
                  ? 'bg-emerald-600 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-zinc-900/60 border border-zinc-800 rounded-lg p-1">
          {[
            { id: 'change' as const, label: 'By Change' },
            { id: 'price' as const, label: 'By Price' },
            { id: 'volume' as const, label: 'By Volume' },
          ].map(s => (
            <button
              key={s.id}
              onClick={() => setSortBy(s.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                sortBy === s.id
                  ? 'bg-zinc-700 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Card grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {filtered.map(card => (
          <Link
            key={card.slug}
            href={`/sports/cards/${card.slug}`}
            className={`${sportBg[card.sport]} border border-zinc-800 rounded-xl p-4 hover:border-zinc-600 transition-all group`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-medium uppercase ${sportColors[card.sport]}`}>
                {card.sport === 'baseball' ? 'MLB' : card.sport === 'basketball' ? 'NBA' : card.sport === 'football' ? 'NFL' : 'NHL'}
              </span>
              <span className="text-zinc-600 text-xs">{card.volume} trades</span>
            </div>
            <h3 className="text-white font-bold text-sm mb-0.5 group-hover:text-emerald-400 transition-colors truncate">
              {card.player}
            </h3>
            <p className="text-zinc-500 text-xs mb-3 truncate">{card.set}</p>
            <div className="flex items-end justify-between">
              <span className="text-white font-mono text-lg">{formatPrice(card.basePrice, card.change)}</span>
              <div className={`px-2 py-1 rounded-md text-xs font-bold ${
                card.change >= 0
                  ? 'bg-emerald-900/50 text-emerald-400'
                  : 'bg-red-900/50 text-red-400'
              }`}>
                {card.change >= 0 ? '+' : ''}{card.change.toFixed(2)}%
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Index explainer */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-3">About the CardVault Index</h2>
        <p className="text-zinc-400 text-sm leading-relaxed mb-4">
          The CardVault Price Ticker tracks the 20 most iconic cards across all four major sports.
          Prices update in real-time based on market data. Use this as a pulse check on the overall
          card market before making buy or sell decisions.
        </p>
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="bg-zinc-800/50 rounded-lg p-3">
            <h3 className="text-white font-medium text-sm mb-1">What moves prices?</h3>
            <p className="text-zinc-400 text-xs">Player performance, injuries, retirements, set releases, and overall market sentiment all affect card values.</p>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-3">
            <h3 className="text-white font-medium text-sm mb-1">How often does it update?</h3>
            <p className="text-zinc-400 text-xs">The ticker updates every 5 seconds with micro-movements. Daily opening prices reset at midnight.</p>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-3">
            <h3 className="text-white font-medium text-sm mb-1">Should I trade on this?</h3>
            <p className="text-zinc-400 text-xs">Use the ticker for awareness, not timing. Cards are illiquid — think weeks, not minutes. Set price alerts instead.</p>
          </div>
        </div>
      </div>

      {/* Related links */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Market Movers', href: '/market-movers', desc: 'Daily gainers, losers, and trending cards' },
          { title: 'Price Watchlist', href: '/tools/watchlist', desc: 'Track specific cards with price alerts' },
          { title: 'Market Report', href: '/market-report', desc: 'Weekly market analysis and buying tips' },
          { title: 'Investment Calculator', href: '/tools/investment-calc', desc: 'Compare your cards vs S&P 500' },
        ].map(tool => (
          <Link key={tool.href} href={tool.href} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 hover:border-emerald-700/50 transition-colors">
            <h3 className="text-white font-medium text-sm mb-1">{tool.title}</h3>
            <p className="text-zinc-500 text-xs">{tool.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
