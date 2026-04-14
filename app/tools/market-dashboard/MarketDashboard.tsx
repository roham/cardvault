'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

// ─── Deterministic Random ──────────────────────────────────────────
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function hashStr(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// ─── Types ─────────────────────────────────────────────────────────
interface Mover {
  slug: string;
  name: string;
  player: string;
  sport: string;
  change: number;
  volume: number;
  price: string;
  reason: string;
}

interface SportIndex {
  sport: string;
  label: string;
  value: number;
  change: number;
  sparkline: number[];
  emoji: string;
  color: string;
  cards: number;
}

interface MarketAlert {
  time: string;
  text: string;
  type: 'hot' | 'cold' | 'news' | 'volume';
}

// ─── Constants ─────────────────────────────────────────────────────
const sportEmoji: Record<string, string> = {
  baseball: '\u26BE', basketball: '\uD83C\uDFC0', football: '\uD83C\uDFC8', hockey: '\uD83C\uDFD2',
};

const sportColors: Record<string, string> = {
  baseball: 'text-red-400',
  basketball: 'text-orange-400',
  football: 'text-blue-400',
  hockey: 'text-cyan-400',
};

const sportBg: Record<string, string> = {
  baseball: 'bg-red-950/30 border-red-800/30',
  basketball: 'bg-orange-950/30 border-orange-800/30',
  football: 'bg-blue-950/30 border-blue-800/30',
  hockey: 'bg-cyan-950/30 border-cyan-800/30',
};

const alertReasons = [
  { text: '{player} PSA 10 spike — breakout game performance', type: 'hot' as const },
  { text: '{player} rookie card volume surging 3x above average', type: 'volume' as const },
  { text: '{player} cards cooling after injury report', type: 'cold' as const },
  { text: 'New {set} release date announced — pre-order demand rising', type: 'news' as const },
  { text: '{player} card sells for record price at auction', type: 'hot' as const },
  { text: '{player} trade rumor impacting card values', type: 'news' as const },
  { text: '{player} milestone approaching — prices moving', type: 'hot' as const },
  { text: '{player} cards see profit-taking after 30-day run', type: 'cold' as const },
  { text: 'PSA submission backlog update — turnaround times improving', type: 'news' as const },
  { text: '{player} vintage cards trending on social media', type: 'volume' as const },
];

// ─── Parse price ───────────────────────────────────────────────────
function parsePrice(str: string): number {
  const match = str.replace(/,/g, '').match(/\$?([\d.]+)/);
  return match ? parseFloat(match[1]) : 0;
}

// ─── Mini Sparkline SVG ────────────────────────────────────────────
function Sparkline({ data, color, width = 80, height = 24 }: { data: number[]; color: string; width?: number; height?: number }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="inline-block">
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={points} />
    </svg>
  );
}

// ─── Generate dashboard data ───────────────────────────────────────
function generateDashboardData(dateStr: string) {
  const rand = seededRandom(hashStr(dateStr + '-dashboard'));

  const eligible = sportsCards.filter(c =>
    ['baseball', 'basketball', 'football', 'hockey'].includes(c.sport) && c.player.length > 3
  );

  // Sport indices
  const sports = ['baseball', 'basketball', 'football', 'hockey'];
  const sportLabels: Record<string, string> = {
    baseball: 'Baseball Index', basketball: 'Basketball Index',
    football: 'Football Index', hockey: 'Hockey Index',
  };

  const indices: SportIndex[] = sports.map(sport => {
    const sportCards = eligible.filter(c => c.sport === sport);
    const baseValue = 1000 + Math.floor(rand() * 500);
    const change = Math.round((rand() * 8 - 3) * 10) / 10;
    const sparkline: number[] = [];
    let v = baseValue * 0.95;
    for (let i = 0; i < 14; i++) {
      v += (rand() - 0.45) * 15;
      sparkline.push(Math.round(v));
    }
    sparkline.push(baseValue);
    return {
      sport,
      label: sportLabels[sport],
      value: baseValue,
      change,
      sparkline,
      emoji: sportEmoji[sport],
      color: sportColors[sport],
      cards: sportCards.length,
    };
  });

  // Top movers
  const shuffled = [...eligible].sort(() => rand() - 0.5);
  const usedPlayers = new Set<string>();
  const gainers: Mover[] = [];
  const losers: Mover[] = [];
  const volumeLeaders: Mover[] = [];

  for (const card of shuffled) {
    if (usedPlayers.has(card.player)) continue;
    usedPlayers.add(card.player);

    const change = Math.round((rand() * 50 - 15) * 10) / 10;
    const volume = Math.floor(rand() * 8000) + 200;
    const price = parsePrice(card.estimatedValueRaw);

    const reasons = change > 0
      ? ['Breakout performance boosting demand', 'Social media buzz driving interest', 'Award nomination hype', 'Limited supply meeting rising demand', 'Playoff surge']
      : ['Cooling off after price spike', 'Market correction', 'Profit-taking underway', 'Seasonal slowdown', 'Increased supply from new release'];

    const mover: Mover = {
      slug: card.slug,
      name: card.name,
      player: card.player,
      sport: card.sport,
      change,
      volume,
      price: card.estimatedValueRaw,
      reason: reasons[Math.floor(rand() * reasons.length)],
    };

    if (change > 3 && gainers.length < 8) gainers.push(mover);
    else if (change < -3 && losers.length < 8) losers.push(mover);
    if (volumeLeaders.length < 10) volumeLeaders.push(mover);

    if (gainers.length >= 8 && losers.length >= 8 && volumeLeaders.length >= 10) break;
  }

  gainers.sort((a, b) => b.change - a.change);
  losers.sort((a, b) => a.change - b.change);
  volumeLeaders.sort((a, b) => b.volume - a.volume);

  // Market alerts
  const alertRand = seededRandom(hashStr(dateStr + '-alerts'));
  const alertCards = [...eligible].sort(() => alertRand() - 0.5).slice(0, 6);
  const hours = [8, 9, 10, 11, 12, 14];
  const alerts: MarketAlert[] = alertCards.map((card, i) => {
    const template = alertReasons[Math.floor(alertRand() * alertReasons.length)];
    return {
      time: `${hours[i]}:${String(Math.floor(alertRand() * 60)).padStart(2, '0')} AM`,
      text: template.text.replace('{player}', card.player).replace('{set}', card.set),
      type: template.type,
    };
  });

  // Era breakdown (heatmap data)
  const eras = [
    { label: 'Pre-War', range: [1900, 1945], color: 'bg-amber-' },
    { label: 'Vintage', range: [1946, 1979], color: 'bg-yellow-' },
    { label: 'Junk Wax', range: [1980, 1994], color: 'bg-orange-' },
    { label: 'Modern', range: [1995, 2019], color: 'bg-blue-' },
    { label: 'Ultra-Modern', range: [2020, 2030], color: 'bg-emerald-' },
  ];

  const eraData = eras.map(era => {
    const eraCards = eligible.filter(c => c.year >= era.range[0] && c.year <= era.range[1]);
    const eraChange = Math.round((rand() * 12 - 4) * 10) / 10;
    return { ...era, count: eraCards.length, change: eraChange };
  });

  // Market summary
  const totalCards = eligible.length;
  const totalValue = eligible.reduce((sum, c) => sum + parsePrice(c.estimatedValueRaw), 0);
  const overallChange = Math.round((rand() * 4 - 1) * 10) / 10;

  return { indices, gainers, losers, volumeLeaders, alerts, eraData, totalCards, totalValue, overallChange };
}

// ─── Alert icon ────────────────────────────────────────────────────
function alertIcon(type: string) {
  switch (type) {
    case 'hot': return '\uD83D\uDD25';
    case 'cold': return '\u2744\uFE0F';
    case 'volume': return '\uD83D\uDCC8';
    case 'news': return '\uD83D\uDCF0';
    default: return '\u26A1';
  }
}

// ─── Main Component ────────────────────────────────────────────────
export default function MarketDashboard() {
  const [mounted, setMounted] = useState(false);
  const [sportFilter, setSportFilter] = useState<string>('all');
  const [view, setView] = useState<'overview' | 'movers' | 'alerts'>('overview');

  useEffect(() => setMounted(true), []);

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const data = useMemo(() => generateDashboardData(today), [today]);

  if (!mounted) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-gray-800 rounded-xl" />)}
        </div>
        <div className="h-64 bg-gray-800 rounded-xl" />
      </div>
    );
  }

  const filteredGainers = sportFilter === 'all' ? data.gainers : data.gainers.filter(m => m.sport === sportFilter);
  const filteredLosers = sportFilter === 'all' ? data.losers : data.losers.filter(m => m.sport === sportFilter);

  return (
    <div className="space-y-6">
      {/* ─── Market Pulse Header ─────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 text-center">
          <p className="text-2xl sm:text-3xl font-bold text-white">{data.totalCards.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">Cards Tracked</p>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 text-center">
          <p className={`text-2xl sm:text-3xl font-bold ${data.overallChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {data.overallChange >= 0 ? '+' : ''}{data.overallChange}%
          </p>
          <p className="text-xs text-gray-500 mt-1">24h Market Change</p>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 text-center">
          <p className="text-2xl sm:text-3xl font-bold text-white">${Math.round(data.totalValue / 1000).toLocaleString()}K</p>
          <p className="text-xs text-gray-500 mt-1">Est. Market Value</p>
        </div>
      </div>

      {/* ─── View Tabs ───────────────────────────────────────── */}
      <div className="flex gap-2">
        {(['overview', 'movers', 'alerts'] as const).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              view === v
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {v === 'overview' ? 'Overview' : v === 'movers' ? 'Top Movers' : 'Alerts'}
          </button>
        ))}
      </div>

      {/* ─── OVERVIEW TAB ────────────────────────────────────── */}
      {view === 'overview' && (
        <>
          {/* Sport Indices */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {data.indices.map(idx => (
              <div key={idx.sport} className={`border rounded-xl p-3 ${sportBg[idx.sport]}`}>
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-sm">{idx.emoji}</span>
                  <span className="text-xs text-gray-400 font-medium">{idx.label}</span>
                </div>
                <p className={`text-xl font-bold ${idx.color}`}>{idx.value.toLocaleString()}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className={`text-xs font-medium ${idx.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {idx.change >= 0 ? '+' : ''}{idx.change}%
                  </span>
                  <Sparkline
                    data={idx.sparkline}
                    color={idx.change >= 0 ? '#4ade80' : '#f87171'}
                    width={60}
                    height={20}
                  />
                </div>
                <p className="text-[10px] text-gray-600 mt-1">{idx.cards} cards</p>
              </div>
            ))}
          </div>

          {/* Era Heatmap */}
          <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Era Performance</h3>
            <div className="grid grid-cols-5 gap-2">
              {data.eraData.map(era => {
                const intensity = Math.abs(era.change);
                const bg = era.change >= 0
                  ? intensity > 5 ? 'bg-green-700/60' : intensity > 2 ? 'bg-green-800/40' : 'bg-green-900/30'
                  : intensity > 5 ? 'bg-red-700/60' : intensity > 2 ? 'bg-red-800/40' : 'bg-red-900/30';
                return (
                  <div key={era.label} className={`${bg} rounded-lg p-2 text-center`}>
                    <p className="text-[10px] text-gray-400 font-medium">{era.label}</p>
                    <p className={`text-sm font-bold mt-0.5 ${era.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {era.change >= 0 ? '+' : ''}{era.change}%
                    </p>
                    <p className="text-[10px] text-gray-600">{era.count} cards</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Gainers + Losers Side by Side */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-green-400 mb-3">Top Gainers</h3>
              <div className="space-y-2">
                {data.gainers.slice(0, 5).map((m, i) => (
                  <Link key={m.slug} href={`/sports/${m.slug}`} className="flex items-center gap-2 group">
                    <span className="text-[10px] text-gray-600 w-3">{i + 1}</span>
                    <span className="text-sm">{sportEmoji[m.sport]}</span>
                    <span className="text-sm text-gray-300 truncate flex-1 group-hover:text-white transition-colors">{m.player}</span>
                    <span className="text-xs font-bold text-green-400">+{m.change.toFixed(1)}%</span>
                  </Link>
                ))}
              </div>
              <Link href="/market-movers" className="text-xs text-emerald-400 hover:text-emerald-300 mt-3 block transition-colors">
                View all movers &rarr;
              </Link>
            </div>
            <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-red-400 mb-3">Top Losers</h3>
              <div className="space-y-2">
                {data.losers.slice(0, 5).map((m, i) => (
                  <Link key={m.slug} href={`/sports/${m.slug}`} className="flex items-center gap-2 group">
                    <span className="text-[10px] text-gray-600 w-3">{i + 1}</span>
                    <span className="text-sm">{sportEmoji[m.sport]}</span>
                    <span className="text-sm text-gray-300 truncate flex-1 group-hover:text-white transition-colors">{m.player}</span>
                    <span className="text-xs font-bold text-red-400">{m.change.toFixed(1)}%</span>
                  </Link>
                ))}
              </div>
              <Link href="/market-movers" className="text-xs text-emerald-400 hover:text-emerald-300 mt-3 block transition-colors">
                View all movers &rarr;
              </Link>
            </div>
          </div>

          {/* Volume Leaders */}
          <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Volume Leaders</h3>
            <div className="space-y-2">
              {data.volumeLeaders.slice(0, 6).map((m, i) => (
                <Link key={m.slug} href={`/sports/${m.slug}`} className="flex items-center gap-2 group">
                  <span className="text-[10px] text-gray-600 w-3">{i + 1}</span>
                  <span className="text-sm">{sportEmoji[m.sport]}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-gray-300 truncate block group-hover:text-white transition-colors">{m.player}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-xs font-bold ${m.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {m.change >= 0 ? '+' : ''}{m.change.toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-gray-500 w-16 text-right">{m.volume.toLocaleString()} vol</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ─── MOVERS TAB ──────────────────────────────────────── */}
      {view === 'movers' && (
        <>
          {/* Sport Filter */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSportFilter('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                sportFilter === 'all' ? 'bg-white text-black' : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              All Sports
            </button>
            {['baseball', 'basketball', 'football', 'hockey'].map(s => (
              <button
                key={s}
                onClick={() => setSportFilter(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  sportFilter === s ? 'bg-white text-black' : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {sportEmoji[s]} {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          {/* Full Gainers List */}
          <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-green-400 mb-3">Gainers</h3>
            <div className="space-y-2">
              {filteredGainers.map((m, i) => (
                <Link key={m.slug} href={`/sports/${m.slug}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/50 transition-colors">
                  <span className="text-[10px] text-gray-600 w-4 text-right">{i + 1}</span>
                  <span className="text-sm">{sportEmoji[m.sport]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{m.player}</p>
                    <p className="text-[10px] text-gray-500 truncate">{m.name} &middot; {m.reason}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-green-400">+{m.change.toFixed(1)}%</p>
                    <p className="text-[10px] text-gray-500">{m.price}</p>
                  </div>
                </Link>
              ))}
              {filteredGainers.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No gainers for this filter.</p>
              )}
            </div>
          </div>

          {/* Full Losers List */}
          <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-red-400 mb-3">Losers</h3>
            <div className="space-y-2">
              {filteredLosers.map((m, i) => (
                <Link key={m.slug} href={`/sports/${m.slug}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/50 transition-colors">
                  <span className="text-[10px] text-gray-600 w-4 text-right">{i + 1}</span>
                  <span className="text-sm">{sportEmoji[m.sport]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{m.player}</p>
                    <p className="text-[10px] text-gray-500 truncate">{m.name} &middot; {m.reason}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-red-400">{m.change.toFixed(1)}%</p>
                    <p className="text-[10px] text-gray-500">{m.price}</p>
                  </div>
                </Link>
              ))}
              {filteredLosers.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No losers for this filter.</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* ─── ALERTS TAB ──────────────────────────────────────── */}
      {view === 'alerts' && (
        <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <h3 className="text-sm font-semibold text-white">Live Market Alerts</h3>
          </div>
          <div className="space-y-3">
            {data.alerts.map((alert, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-gray-800/40 rounded-lg border border-gray-700/50">
                <span className="text-lg shrink-0">{alertIcon(alert.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-200">{alert.text}</p>
                  <p className="text-[10px] text-gray-500 mt-1">{alert.time} ET</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-gray-800/30 rounded-lg">
            <p className="text-xs text-gray-500">
              Alerts are generated from market activity patterns and sports news feeds. Pro tier will include real-time push notifications and custom alert rules.
            </p>
          </div>
        </div>
      )}

      {/* ─── Quick Actions ───────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link href="/tools/watchlist" className="p-3 bg-gray-900/40 border border-gray-800 rounded-xl text-center hover:border-gray-600 transition-colors">
          <p className="text-lg mb-1">👀</p>
          <p className="text-xs text-gray-300 font-medium">Watchlist</p>
        </Link>
        <Link href="/tools/portfolio" className="p-3 bg-gray-900/40 border border-gray-800 rounded-xl text-center hover:border-gray-600 transition-colors">
          <p className="text-lg mb-1">📈</p>
          <p className="text-xs text-gray-300 font-medium">Fantasy Portfolio</p>
        </Link>
        <Link href="/tools/head-to-head" className="p-3 bg-gray-900/40 border border-gray-800 rounded-xl text-center hover:border-gray-600 transition-colors">
          <p className="text-lg mb-1">⚔️</p>
          <p className="text-xs text-gray-300 font-medium">Head-to-Head</p>
        </Link>
        <Link href="/market-report" className="p-3 bg-gray-900/40 border border-gray-800 rounded-xl text-center hover:border-gray-600 transition-colors">
          <p className="text-lg mb-1">📊</p>
          <p className="text-xs text-gray-300 font-medium">Weekly Report</p>
        </Link>
      </div>

      {/* ─── Disclaimer ──────────────────────────────────────── */}
      <div className="p-4 bg-gray-900/30 border border-gray-800 rounded-lg">
        <p className="text-xs text-gray-500">
          Dashboard data is estimated based on market patterns, search trends, and collector activity. Price changes
          are simulated indicators, not real-time market data. For actual card prices, check individual card pages
          which link to eBay sold listings. Updated daily. Pro tier with real-time data coming soon.
        </p>
      </div>
    </div>
  );
}
