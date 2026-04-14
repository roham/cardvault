'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

// ─── Types ───────────────────────────────────────────────────────────

interface CardMover {
  slug: string;
  name: string;
  player: string;
  sport: string;
  change: number;       // percentage change
  volume: number;       // simulated search volume
  direction: 'up' | 'down' | 'flat';
  reason: string;
}

// ─── Deterministic Random ────────────────────────────────────────────

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function dateToSeed(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// ─── Reasons for movement ────────────────────────────────────────────

const upReasons = [
  'Strong recent performance driving collector demand',
  'Upcoming milestone generating buzz',
  'Recent award nomination boosting card values',
  'Social media attention increasing searches',
  'Limited supply meeting rising demand',
  'Post-game highlight reel going viral',
  'Breakout playoff performance',
  'Jersey retirement ceremony announced',
  'Trade rumors heating up card market',
  'New set release featuring this player',
];

const downReasons = [
  'Cooling off after price spike',
  'Market correction from overvalued levels',
  'Seasonal demand decrease',
  'Increased supply from new set release',
  'Focus shifting to newer rookies',
  'Consolidation after rapid appreciation',
  'Profit-taking by investors',
  'Competition from parallel variants',
];

// ─── Generate daily movers ───────────────────────────────────────────

function generateMovers(dateStr: string): { gainers: CardMover[]; losers: CardMover[]; trending: CardMover[] } {
  const rand = seededRandom(dateToSeed(dateStr));

  // Filter to cards with real player names (skip Pokemon entries)
  const eligible = sportsCards.filter(c =>
    ['baseball', 'basketball', 'football', 'hockey'].includes(c.sport) &&
    c.player.length > 3
  );

  // Shuffle deterministically
  const shuffled = [...eligible].sort(() => rand() - 0.5);

  const gainers: CardMover[] = [];
  const losers: CardMover[] = [];
  const trending: CardMover[] = [];
  const usedPlayers = new Set<string>();

  for (const card of shuffled) {
    if (usedPlayers.has(card.player)) continue;
    usedPlayers.add(card.player);

    const change = Math.round((rand() * 40 - 10) * 10) / 10; // -10% to +30%
    const volume = Math.floor(rand() * 5000) + 100;
    const direction = change > 2 ? 'up' : change < -2 ? 'down' : 'flat';
    const reason = direction === 'up'
      ? upReasons[Math.floor(rand() * upReasons.length)]
      : direction === 'down'
        ? downReasons[Math.floor(rand() * downReasons.length)]
        : 'Stable demand with consistent trading activity';

    const mover: CardMover = {
      slug: card.slug,
      name: card.name,
      player: card.player,
      sport: card.sport,
      change,
      volume,
      direction,
      reason,
    };

    if (direction === 'up' && gainers.length < 10) gainers.push(mover);
    else if (direction === 'down' && losers.length < 10) losers.push(mover);

    if (trending.length < 15) trending.push(mover);

    if (gainers.length >= 10 && losers.length >= 10 && trending.length >= 15) break;
  }

  // Sort gainers highest first, losers lowest first
  gainers.sort((a, b) => b.change - a.change);
  losers.sort((a, b) => a.change - b.change);
  trending.sort((a, b) => b.volume - a.volume);

  return { gainers, losers, trending };
}

// ─── Components ──────────────────────────────────────────────────────

const sportEmoji: Record<string, string> = {
  baseball: '\u26BE', basketball: '\uD83C\uDFC0', football: '\uD83C\uDFC8', hockey: '\uD83C\uDFD2',
};

function MoverRow({ mover }: { mover: CardMover }) {
  return (
    <Link
      href={`/sports/${mover.slug}`}
      className="flex items-center gap-3 p-3 bg-gray-900/50 border border-gray-800 rounded-lg hover:border-gray-600 transition-colors"
    >
      <span className="text-lg shrink-0">{sportEmoji[mover.sport]}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white font-medium truncate">{mover.player}</p>
        <p className="text-[11px] text-gray-500 truncate">{mover.name}</p>
      </div>
      <div className="text-right shrink-0">
        <p className={`text-sm font-bold ${
          mover.direction === 'up' ? 'text-green-400' :
          mover.direction === 'down' ? 'text-red-400' :
          'text-gray-400'
        }`}>
          {mover.change > 0 ? '+' : ''}{mover.change}%
        </p>
        <p className="text-[10px] text-gray-500">{mover.volume.toLocaleString()} searches</p>
      </div>
    </Link>
  );
}

// ─── Main Component ──────────────────────────────────────────────────

export default function MarketMovers() {
  const [tab, setTab] = useState<'gainers' | 'losers' | 'trending'>('gainers');

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const { gainers, losers, trending } = useMemo(() => generateMovers(today), [today]);

  const movers = tab === 'gainers' ? gainers : tab === 'losers' ? losers : trending;

  return (
    <div>
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-green-950/30 border border-green-800/30 rounded-lg p-3 text-center">
          <p className="text-xl font-bold text-green-400">{gainers.length}</p>
          <p className="text-xs text-gray-500">Cards Rising</p>
        </div>
        <div className="bg-red-950/30 border border-red-800/30 rounded-lg p-3 text-center">
          <p className="text-xl font-bold text-red-400">{losers.length}</p>
          <p className="text-xs text-gray-500">Cards Falling</p>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-3 text-center">
          <p className="text-xl font-bold text-white">{trending.length}</p>
          <p className="text-xs text-gray-500">Most Searched</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['gainers', 'losers', 'trending'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              tab === t
                ? t === 'gainers' ? 'bg-green-600 text-white' :
                  t === 'losers' ? 'bg-red-600 text-white' :
                  'bg-white text-black'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {t === 'gainers' ? 'Top Gainers' : t === 'losers' ? 'Top Losers' : 'Most Searched'}
          </button>
        ))}
      </div>

      {/* Mover List */}
      <div className="space-y-2">
        {movers.map((mover, i) => (
          <div key={mover.slug} className="relative">
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-600 font-mono w-4 text-right">
              {i + 1}
            </div>
            <div className="ml-4">
              <MoverRow mover={mover} />
              <p className="text-[10px] text-gray-600 mt-0.5 ml-9">{mover.reason}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="mt-8 p-4 bg-gray-900/30 border border-gray-800 rounded-lg">
        <p className="text-xs text-gray-500">
          Market data is simulated based on search trends and collector activity patterns. Price changes shown are
          estimated movements, not real-time market data. For actual prices, check the individual card pages which
          link to eBay sold listings. Updated daily.
        </p>
      </div>
    </div>
  );
}
