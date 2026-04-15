'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

/* ───── Deterministic RNG ───── */
function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function minuteHash(): number {
  const now = new Date();
  const str = `pulse-${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}-${now.getMinutes()}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function hourHash(): number {
  const now = new Date();
  const str = `pulse-hr-${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function parseValue(v: string): number {
  const match = v.match(/\$([\d,]+)/);
  if (!match) return 0;
  return parseInt(match[1].replace(/,/g, ''), 10);
}

function formatPrice(n: number): string {
  if (n >= 1000000) return '$' + (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return '$' + (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'K';
  return '$' + n.toLocaleString();
}

function slugifyPlayer(name: string): string {
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const sportIcons: Record<string, string> = { baseball: '\u26be', basketball: '\ud83c\udfc0', football: '\ud83c\udfc8', hockey: '\ud83c\udfd2' };

/* ───── Simulated activity types ───── */
const activityVerbs = [
  'just looked up', 'searched for', 'checked the price of', 'added to watchlist',
  'viewed the card page for', 'ran grading ROI on', 'compared prices for',
];
const usernames = [
  'CardFlipKing', 'WaxRipper99', 'PrizmHunter', 'VintageVault', 'RookieChaser',
  'SlabMaster', 'BaseBreaker', 'PCCollector', 'CaseBuster', 'GradedGems',
  'HobbyShark', 'ChromeJunkie', 'SetBuilder', 'PatchDaddy', 'SilverSniper',
  'BoxBusters', 'Cardboard_Gold', 'MintCondition', 'PackRipper', 'DiamondDealer',
];

export default function MarketPulseClient() {
  const [tick, setTick] = useState(0);

  /* Auto-refresh every 60 seconds */
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  /* ───── Derived data (recalculates every minute) ───── */
  const seed = useMemo(() => minuteHash(), [tick]);
  const hourSeed = useMemo(() => hourHash(), [tick]);
  const rng = useMemo(() => seededRng(seed), [seed]);
  const hourRng = useMemo(() => seededRng(hourSeed), [hourSeed]);

  /* Simulated platform metrics */
  const metrics = useMemo(() => {
    const baseSearches = 12000 + Math.floor(rng() * 8000);
    const baseViewers = 450 + Math.floor(rng() * 300);
    const basePacks = 80 + Math.floor(rng() * 120);
    const baseAuctions = 15 + Math.floor(rng() * 25);
    return {
      searches: baseSearches,
      activeCollectors: baseViewers,
      packsOpened: basePacks,
      liveAuctions: baseAuctions,
      toolsUsed: 200 + Math.floor(rng() * 300),
      cardsWatched: 800 + Math.floor(rng() * 600),
    };
  }, [rng]);

  /* Trending players (hourly) */
  const trendingPlayers = useMemo(() => {
    const players = [...new Set(sportsCards.map(c => c.player))];
    const shuffled = [...players];
    const r = seededRng(hourSeed);
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, 8).map(name => {
      const cards = sportsCards.filter(c => c.player === name);
      const sport = cards[0]?.sport || 'baseball';
      const topCard = cards.reduce((best, c) => parseValue(c.estimatedValueRaw) > parseValue(best.estimatedValueRaw) ? c : best, cards[0]);
      const searchVolume = 50 + Math.floor(r() * 450);
      const change = Math.floor(r() * 40) - 10;
      return { name, sport, cardCount: cards.length, topValue: formatPrice(parseValue(topCard.estimatedValueRaw)), searchVolume, change };
    });
  }, [hourSeed]);

  /* Hot cards (minute-level) */
  const hotCards = useMemo(() => {
    const valuable = sportsCards.filter(c => parseValue(c.estimatedValueRaw) >= 10);
    const shuffled = [...valuable];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, 6).map(c => ({
      ...c,
      value: parseValue(c.estimatedValueRaw),
      activity: ['Price check', 'Watchlist add', 'Grading lookup', 'Comparison view', 'eBay search'][Math.floor(rng() * 5)],
      count: 3 + Math.floor(rng() * 30),
    }));
  }, [rng]);

  /* Live activity feed (minute-level) */
  const activityFeed = useMemo(() => {
    const items = [];
    for (let i = 0; i < 10; i++) {
      const card = sportsCards[Math.floor(rng() * sportsCards.length)];
      const verb = activityVerbs[Math.floor(rng() * activityVerbs.length)];
      const user = usernames[Math.floor(rng() * usernames.length)];
      const minsAgo = Math.floor(rng() * 10);
      items.push({ user, verb, cardName: card.name, player: card.player, sport: card.sport, minsAgo });
    }
    return items.sort((a, b) => a.minsAgo - b.minsAgo);
  }, [rng]);

  /* Sport breakdown */
  const sportBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    sportsCards.forEach(c => { counts[c.sport] = (counts[c.sport] || 0) + 1; });
    const total = sportsCards.length;
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([sport, count]) => ({
      sport,
      count,
      pct: ((count / total) * 100).toFixed(1),
      searchPct: (15 + Math.floor(hourRng() * 30)),
    }));
  }, [hourRng]);

  return (
    <div className="space-y-8">
      {/* Hero metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'Price Lookups Today', value: metrics.searches.toLocaleString(), icon: '🔍', color: 'text-emerald-400' },
          { label: 'Active Collectors', value: metrics.activeCollectors.toLocaleString(), icon: '👥', color: 'text-blue-400' },
          { label: 'Packs Opened', value: metrics.packsOpened.toLocaleString(), icon: '📦', color: 'text-amber-400' },
          { label: 'Live Auctions', value: metrics.liveAuctions.toLocaleString(), icon: '🔨', color: 'text-red-400' },
          { label: 'Tools Used', value: metrics.toolsUsed.toLocaleString(), icon: '🔧', color: 'text-purple-400' },
          { label: 'Cards Watched', value: metrics.cardsWatched.toLocaleString(), icon: '👀', color: 'text-cyan-400' },
        ].map(m => (
          <div key={m.label} className="bg-gray-900/60 border border-gray-800/50 rounded-xl p-4 text-center">
            <div className="text-xl mb-1">{m.icon}</div>
            <div className={`text-2xl font-bold ${m.color}`}>{m.value}</div>
            <div className="text-xs text-gray-400 mt-1">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Auto-refresh indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-xs text-gray-400">Live — updates every minute</span>
        </div>
        <button onClick={() => setTick(t => t + 1)} className="text-xs text-gray-500 hover:text-white transition-colors px-2 py-1 rounded bg-gray-800/60">
          Refresh
        </button>
      </div>

      {/* Trending Players */}
      <div>
        <h2 className="text-lg font-bold text-white mb-3">Trending Players</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {trendingPlayers.map((p, i) => (
            <Link key={i} href={`/players/${slugifyPlayer(p.name)}`} className="flex items-center gap-3 bg-gray-900/40 border border-gray-800/50 rounded-lg p-3 hover:border-gray-700/60 transition-all group">
              <span className="text-lg">{sportIcons[p.sport] || '🃏'}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors truncate">{p.name}</div>
                <div className="text-xs text-gray-500">{p.cardCount} cards &middot; Top: {p.topValue}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-bold text-white">{p.searchVolume}</div>
                <div className={`text-xs ${p.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {p.change >= 0 ? '+' : ''}{p.change}%
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Hot Cards Right Now */}
      <div>
        <h2 className="text-lg font-bold text-white mb-3">Most Active Cards</h2>
        <div className="space-y-2">
          {hotCards.map((c, i) => (
            <div key={i} className="flex items-center gap-3 bg-gray-900/40 border border-gray-800/50 rounded-lg p-3">
              <div className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center text-sm font-bold text-gray-400">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{c.name}</div>
                <div className="text-xs text-gray-500">{c.activity} &middot; {c.count} actions this hour</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-bold text-white">{formatPrice(c.value)}</div>
                <div className="text-xs text-gray-500">{sportIcons[c.sport]}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sport Search Volume */}
      <div>
        <h2 className="text-lg font-bold text-white mb-3">Search Volume by Sport</h2>
        <div className="space-y-3">
          {sportBreakdown.map(s => (
            <div key={s.sport} className="bg-gray-900/40 border border-gray-800/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span>{sportIcons[s.sport]}</span>
                  <span className="text-sm font-medium text-white capitalize">{s.sport}</span>
                  <span className="text-xs text-gray-500">{s.count.toLocaleString()} cards</span>
                </div>
                <span className="text-sm font-bold text-emerald-400">{s.searchPct}%</span>
              </div>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all"
                  style={{ width: `${s.searchPct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Activity Feed */}
      <div>
        <h2 className="text-lg font-bold text-white mb-3">Live Activity</h2>
        <div className="space-y-1.5">
          {activityFeed.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm py-1.5 border-b border-gray-800/30 last:border-0">
              <span className="text-xs">{sportIcons[item.sport]}</span>
              <span className="text-emerald-400 font-medium shrink-0">{item.user}</span>
              <span className="text-gray-500">{item.verb}</span>
              <span className="text-white truncate">{item.player}</span>
              <span className="text-gray-600 text-xs ml-auto shrink-0">{item.minsAgo === 0 ? 'just now' : `${item.minsAgo}m ago`}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { href: '/hot-right-now', label: 'Hot Right Now', icon: '🔥' },
          { href: '/market-movers', label: 'Market Movers', icon: '📈' },
          { href: '/tools/market-dashboard', label: 'Market Dashboard', icon: '📊' },
          { href: '/market-sentiment', label: 'Sentiment Index', icon: '🌡️' },
        ].map(link => (
          <Link key={link.href} href={link.href} className="bg-gray-900/40 border border-gray-800/50 rounded-lg p-3 text-center hover:border-gray-700/60 transition-all">
            <div className="text-lg mb-1">{link.icon}</div>
            <div className="text-xs text-gray-400">{link.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
