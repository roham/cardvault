'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// ─── Types ───────────────────────────────────────────────────────────

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastVisitDate: string;
  totalVisits: number;
  startDate: string;
  streakHistory: number[];
}

interface DailyPackState {
  results: Array<{
    date: string;
    productSlug: string;
    productName: string;
    cards: unknown[];
    totalValue: number;
    bestPull: { label: string; value: number } | null;
    hitCount: number;
  }>;
  streak: number;
  lastOpenDate: string;
  totalPacks: number;
  totalHits: number;
  bestEverPull: { label: string; value: number; date: string } | null;
}

interface HubStats {
  currentStreak: number;
  longestStreak: number;
  packsOpened: number;
  cardsViewed: number;
  achievementsUnlocked: number;
  collectionSize: number;
  guidesRead: number;
  toolsUsed: number;
  shares: number;
  dailyPackOpenedToday: boolean;
  dailyPackLastOpen: string;
  bestEverPull: { label: string; value: number; date: string } | null;
  watchlistCount: number;
  totalVisits: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

function safeParseInt(key: string): number {
  try {
    return parseInt(localStorage.getItem(key) || '0') || 0;
  } catch {
    return 0;
  }
}

function safeParseJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return fallback;
}

function getCountdownToMidnight(): string {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diff = midnight.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

function loadHubStats(): HubStats {
  const today = getTodayString();

  // Streak: prefer detailed data, fall back to simple counter
  const streakData = safeParseJSON<StreakData | null>('cardvault-streak', null);
  const simpleStreak = safeParseInt('cv-visit-streak');
  const currentStreak = streakData?.currentStreak || simpleStreak;
  const longestStreak = streakData?.longestStreak || simpleStreak;
  const totalVisits = streakData?.totalVisits || simpleStreak;

  // Daily Pack
  const dailyPack = safeParseJSON<DailyPackState | null>('cardvault-daily-pack', null);
  const dailyPackOpenedToday = dailyPack?.lastOpenDate === today;
  const dailyPackLastOpen = dailyPack?.lastOpenDate || '';
  const bestEverPull = dailyPack?.bestEverPull || null;

  // Simple counters
  const packsOpened = safeParseInt('cv-packs-opened');
  const cardsViewed = safeParseInt('cv-cards-viewed');
  const collectionSize = safeParseInt('cv-collection-size');
  const guidesRead = safeParseInt('cv-guides-read');
  const toolsUsed = safeParseInt('cv-tools-used');
  const shares = safeParseInt('cv-shares');

  // Achievements
  const achievementIds = safeParseJSON<string[]>('cv-achievements', []);
  const achievementsUnlocked = achievementIds.length;

  // Watchlist
  const watchlistData = safeParseJSON<{ items?: unknown[] } | null>('cardvault-watchlist', null);
  const watchlistCount = watchlistData?.items?.length || 0;

  return {
    currentStreak,
    longestStreak,
    packsOpened,
    cardsViewed,
    achievementsUnlocked,
    collectionSize,
    guidesRead,
    toolsUsed,
    shares,
    dailyPackOpenedToday,
    dailyPackLastOpen,
    bestEverPull,
    watchlistCount,
    totalVisits,
  };
}

// ─── Loading Skeleton ───────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="h-10 bg-gray-800 rounded-lg w-64" />
      <div className="h-5 bg-gray-800/60 rounded w-80" />

      {/* Stats bar skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="h-3 bg-gray-800 rounded w-16 mb-3" />
            <div className="h-7 bg-gray-800 rounded w-12" />
          </div>
        ))}
      </div>

      {/* Actions skeleton */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="h-6 bg-gray-800 rounded w-40 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 bg-gray-800/50 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Progress skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="h-4 bg-gray-800 rounded w-24 mb-3" />
            <div className="h-2.5 bg-gray-800 rounded-full w-full" />
          </div>
        ))}
      </div>

      {/* Quick links skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4 h-24" />
        ))}
      </div>
    </div>
  );
}

// ─── Quick Stats Bar ────────────────────────────────────────────────

function QuickStatsBar({ stats }: { stats: HubStats }) {
  const statItems = [
    { label: 'Current Streak', value: stats.currentStreak, suffix: 'd', accent: 'text-amber-400' },
    { label: 'Packs Opened', value: stats.packsOpened, suffix: '', accent: 'text-emerald-400' },
    { label: 'Cards Viewed', value: stats.cardsViewed, suffix: '', accent: 'text-blue-400' },
    { label: 'Achievements', value: `${stats.achievementsUnlocked}/24`, suffix: '', accent: 'text-purple-400' },
    { label: 'Collection', value: stats.collectionSize, suffix: '', accent: 'text-pink-400' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {statItems.map((item) => (
        <div
          key={item.label}
          className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center"
        >
          <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">{item.label}</p>
          <p className={`text-2xl font-bold ${item.accent}`}>
            {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
            {item.suffix}
          </p>
        </div>
      ))}
    </div>
  );
}

// ─── Today's Actions ────────────────────────────────────────────────

function TodaysActions({ stats }: { stats: HubStats }) {
  const [countdown, setCountdown] = useState(getCountdownToMidnight());

  useEffect(() => {
    if (!stats.dailyPackOpenedToday) return;
    const interval = setInterval(() => {
      setCountdown(getCountdownToMidnight());
    }, 60000);
    return () => clearInterval(interval);
  }, [stats.dailyPackOpenedToday]);

  const actions = [
    {
      key: 'daily-pack',
      href: '/tools/daily-pack',
      icon: (
        <span className="text-xl leading-none">{stats.dailyPackOpenedToday ? '\u2705' : '\uD83C\uDCCF'}</span>
      ),
      title: stats.dailyPackOpenedToday ? 'Pack Opened!' : 'Open Today\'s Pack',
      description: stats.dailyPackOpenedToday
        ? `Come back in ${countdown}`
        : 'Your free daily pack is waiting',
      done: stats.dailyPackOpenedToday,
      accent: stats.dailyPackOpenedToday ? 'border-l-emerald-500' : 'border-l-amber-500',
    },
    {
      key: 'weekly-challenge',
      href: '/weekly-challenge',
      icon: <span className="text-xl leading-none">{'\uD83C\uDFC6'}</span>,
      title: 'Weekly Challenge',
      description: 'Pick your cards and compete',
      done: false,
      accent: 'border-l-blue-500',
    },
    {
      key: 'card-of-the-day',
      href: '/card-of-the-day',
      icon: <span className="text-xl leading-none">{'\u2B50'}</span>,
      title: 'Card of the Day',
      description: 'See today\'s featured card',
      done: false,
      accent: 'border-l-yellow-500',
    },
    {
      key: 'flip-or-keep',
      href: '/flip-or-keep',
      icon: <span className="text-xl leading-none">{'\uD83C\uDCCF'}</span>,
      title: 'Flip or Keep',
      description: '10 cards — flip or keep?',
      done: false,
      accent: 'border-l-purple-500',
    },
    {
      key: 'market-movers',
      href: '/market-movers',
      icon: <span className="text-xl leading-none">{'\uD83D\uDCC8'}</span>,
      title: 'Market Movers',
      description: 'See today\'s trends',
      done: false,
      accent: 'border-l-emerald-500',
    },
  ];

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-white mb-4">Today&apos;s Actions</h2>
      <div className="space-y-2.5">
        {actions.map((action) => (
          <Link
            key={action.key}
            href={action.href}
            className={`flex items-center gap-4 p-3.5 rounded-lg border-l-4 ${action.accent} bg-gray-800/40 hover:bg-gray-800/80 transition-colors group`}
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center group-hover:scale-105 transition-transform">
              {action.icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium ${action.done ? 'text-gray-400' : 'text-white'}`}>
                {action.title}
              </p>
              <p className="text-xs text-gray-500">{action.description}</p>
            </div>
            <svg className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─── Your Progress ──────────────────────────────────────────────────

function YourProgress({ stats }: { stats: HubStats }) {
  const achievementPct = Math.round((stats.achievementsUnlocked / 24) * 100);
  const streakPct = stats.longestStreak > 0
    ? Math.min(100, Math.round((stats.currentStreak / stats.longestStreak) * 100))
    : 0;

  const progressItems = [
    {
      label: 'Achievements',
      detail: `${stats.achievementsUnlocked} / 24 unlocked`,
      pct: achievementPct,
      color: 'bg-purple-500',
      trackColor: 'bg-purple-950/50',
      href: '/achievements',
    },
    {
      label: 'Streak',
      detail: stats.longestStreak > 0
        ? `${stats.currentStreak} current / ${stats.longestStreak} longest`
        : 'Start visiting daily!',
      pct: streakPct,
      color: 'bg-amber-500',
      trackColor: 'bg-amber-950/50',
      href: '/streak',
    },
    {
      label: 'Best Pack Pull',
      detail: stats.bestEverPull
        ? `${stats.bestEverPull.label} — $${stats.bestEverPull.value.toLocaleString()}`
        : 'Open packs to find out!',
      pct: stats.bestEverPull ? 100 : 0,
      color: 'bg-yellow-500',
      trackColor: 'bg-yellow-950/50',
      href: '/tools/daily-pack',
    },
    {
      label: 'Watchlist',
      detail: stats.watchlistCount > 0
        ? `${stats.watchlistCount} card${stats.watchlistCount === 1 ? '' : 's'} tracked`
        : 'No cards tracked yet',
      pct: stats.watchlistCount > 0 ? Math.min(100, stats.watchlistCount * 10) : 0,
      color: 'bg-emerald-500',
      trackColor: 'bg-emerald-950/50',
      href: '/tools/watchlist',
    },
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-4">Your Progress</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {progressItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors group"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-white group-hover:text-white/90">{item.label}</p>
              {item.pct > 0 && (
                <span className="text-xs text-gray-500">{item.pct}%</span>
              )}
            </div>
            <div className={`w-full h-2.5 ${item.trackColor} rounded-full overflow-hidden mb-2`}>
              <div
                className={`h-full ${item.color} rounded-full transition-all duration-500`}
                style={{ width: `${item.pct}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">{item.detail}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─── Quick Links ────────────────────────────────────────────────────

const quickLinks = [
  {
    href: '/tools/daily-pack',
    title: 'Daily Pack',
    description: 'Free pack every day',
    accent: 'border-t-amber-500',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-400',
    icon: '\uD83C\uDCCF',
  },
  {
    href: '/tools/pack-sim',
    title: 'Pack Simulator',
    description: 'Rip packs any time',
    accent: 'border-t-red-500',
    iconBg: 'bg-red-500/10',
    iconColor: 'text-red-400',
    icon: '\uD83C\uDFB0',
  },
  {
    href: '/weekly-challenge',
    title: 'Weekly Challenge',
    description: 'Pick winners weekly',
    accent: 'border-t-blue-500',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-400',
    icon: '\uD83C\uDFC6',
  },
  {
    href: '/leaderboard',
    title: 'Leaderboard',
    description: 'See how you rank',
    accent: 'border-t-emerald-500',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400',
    icon: '\uD83C\uDFC5',
  },
  {
    href: '/tools/watchlist',
    title: 'Price Watchlist',
    description: 'Track card prices',
    accent: 'border-t-cyan-500',
    iconBg: 'bg-cyan-500/10',
    iconColor: 'text-cyan-400',
    icon: '\uD83D\uDCCA',
  },
  {
    href: '/achievements',
    title: 'Achievements',
    description: 'Unlock all 24 badges',
    accent: 'border-t-purple-500',
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-400',
    icon: '\uD83C\uDF1F',
  },
  {
    href: '/streak',
    title: 'Streak Tracker',
    description: 'Keep your streak alive',
    accent: 'border-t-orange-500',
    iconBg: 'bg-orange-500/10',
    iconColor: 'text-orange-400',
    icon: '\uD83D\uDD25',
  },
  {
    href: '/collection',
    title: 'Collection',
    description: 'Manage your cards',
    accent: 'border-t-pink-500',
    iconBg: 'bg-pink-500/10',
    iconColor: 'text-pink-400',
    icon: '\uD83D\uDCE6',
  },
  {
    href: '/market-movers',
    title: 'Market Movers',
    description: 'Daily price trends',
    accent: 'border-t-green-500',
    iconBg: 'bg-green-500/10',
    iconColor: 'text-green-400',
    icon: '\uD83D\uDCC8',
  },
  {
    href: '/showcase',
    title: 'Trophy Case',
    description: 'Show off your best cards',
    accent: 'border-t-teal-500',
    iconBg: 'bg-teal-500/10',
    iconColor: 'text-teal-400',
    icon: '\uD83C\uDFC6',
  },
  {
    href: '/market-report',
    title: 'Market Report',
    description: 'Weekly market analysis',
    accent: 'border-t-blue-500',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-400',
    icon: '\uD83D\uDCCA',
  },
  {
    href: '/binder',
    title: 'Digital Binder',
    description: 'Collect & organize cards',
    accent: 'border-t-indigo-500',
    iconBg: 'bg-indigo-500/10',
    iconColor: 'text-indigo-400',
    icon: '\uD83D\uDCDA',
  },
];

function QuickLinks() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-4">Quick Links</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`bg-gray-900 border border-gray-800 border-t-2 ${link.accent} rounded-xl p-4 hover:bg-gray-800/80 hover:border-gray-700 transition-colors group`}
          >
            <div className={`w-9 h-9 rounded-lg ${link.iconBg} flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform`}>
              <span className={`text-base ${link.iconColor}`}>{link.icon}</span>
            </div>
            <p className="text-sm font-medium text-white mb-0.5">{link.title}</p>
            <p className="text-xs text-gray-500">{link.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─── Getting Started ────────────────────────────────────────────────

function GettingStarted() {
  const starterLinks = [
    {
      href: '/tools/daily-pack',
      title: 'Open a Free Pack',
      description: 'Rip a free daily pack and see what you pull. No sign-up needed.',
      accent: 'text-amber-400',
    },
    {
      href: '/card-of-the-day',
      title: 'See Today\'s Featured Card',
      description: 'Learn about a different card every day with pricing and history.',
      accent: 'text-blue-400',
    },
    {
      href: '/achievements',
      title: 'Start Earning Achievements',
      description: 'Browse cards, use tools, and unlock 24 collector achievements.',
      accent: 'text-purple-400',
    },
    {
      href: '/tools/pack-sim',
      title: 'Try the Pack Simulator',
      description: 'Simulate opening any hobby box and see if you beat the odds.',
      accent: 'text-emerald-400',
    },
  ];

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-900/80 border border-gray-800 rounded-xl p-6 sm:p-8">
      <div className="text-center mb-6">
        <p className="text-3xl mb-3">{'\uD83D\uDC4B'}</p>
        <h2 className="text-xl font-bold text-white mb-2">Welcome to Your Collector Hub</h2>
        <p className="text-sm text-gray-400 max-w-md mx-auto">
          This is your personal dashboard. As you explore CardVault, your stats, streaks, and
          achievements will show up here. Start with any of these:
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {starterLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-start gap-3 p-4 rounded-lg bg-gray-800/40 hover:bg-gray-800/80 border border-gray-800 hover:border-gray-700 transition-colors group"
          >
            <div className="mt-0.5">
              <svg className={`w-5 h-5 ${link.accent}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-white group-hover:text-white/90">{link.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{link.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────

export default function MyHubClient() {
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<HubStats | null>(null);

  useEffect(() => {
    const data = loadHubStats();
    setStats(data);
    setMounted(true);
  }, []);

  if (!mounted || !stats) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <LoadingSkeleton />
      </div>
    );
  }

  const isNewUser =
    stats.currentStreak === 0 &&
    stats.packsOpened === 0 &&
    stats.cardsViewed === 0 &&
    stats.achievementsUnlocked === 0 &&
    stats.collectionSize === 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-red-500 bg-clip-text text-transparent mb-2">
            Collector Hub
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Your personal CardVault dashboard — stats, streaks, and quick access to everything.
          </p>
        </div>

        {/* Getting Started (only for brand-new users) */}
        {isNewUser && <GettingStarted />}

        {/* Quick Stats Bar */}
        <QuickStatsBar stats={stats} />

        {/* Today's Actions */}
        <TodaysActions stats={stats} />

        {/* Your Progress */}
        {!isNewUser && <YourProgress stats={stats} />}

        {/* Quick Links */}
        <QuickLinks />
      </div>
    </div>
  );
}
