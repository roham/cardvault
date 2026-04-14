'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

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

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ── Types ─────────────────────────────────────────────────────────────

type ActivityType = 'pack_open' | 'card_pull' | 'trivia_score' | 'battle_win' | 'streak' | 'achievement' | 'flip_keep' | 'prediction' | 'auction_bid' | 'watchlist_add' | 'trade_propose' | 'collection_share';

interface ActivityItem {
  id: string;
  user: string;
  avatar: string;
  type: ActivityType;
  message: string;
  detail?: string;
  cardSlug?: string;
  timestamp: number;
  isYou?: boolean;
}

const ACTIVITY_KEY = 'cardvault-activity-feed';
const NPC_AVATARS = ['🎴', '🃏', '🎰', '🎲', '🏆', '💎', '🔥', '⭐', '🎯', '👑'];
const NPC_NAMES = [
  'CardShark42', 'VintageKing', 'RookieHunter', 'GrailChaser', 'WaxBreaker',
  'ToppsCollector', 'PrizmPuller', 'GradedGems', 'SetBuilder99', 'TheFlipKing',
  'ChromeChaser', 'HobbyLegend', 'MintCondition', 'PackRipper', 'SilverSlugger',
];

const TYPE_ICONS: Record<ActivityType, string> = {
  pack_open: '\uD83C\uDCCF',
  card_pull: '\u2728',
  trivia_score: '\uD83E\uDDE0',
  battle_win: '\u2694\uFE0F',
  streak: '\uD83D\uDD25',
  achievement: '\uD83C\uDFC5',
  flip_keep: '\uD83D\uDCB0',
  prediction: '\uD83D\uDD2E',
  auction_bid: '\uD83D\uDD28',
  watchlist_add: '\uD83D\uDC40',
  trade_propose: '\uD83E\uDD1D',
  collection_share: '\uD83D\uDCF8',
};

const TYPE_COLORS: Record<ActivityType, string> = {
  pack_open: 'bg-purple-900/30 border-purple-800/40',
  card_pull: 'bg-amber-900/30 border-amber-800/40',
  trivia_score: 'bg-blue-900/30 border-blue-800/40',
  battle_win: 'bg-red-900/30 border-red-800/40',
  streak: 'bg-orange-900/30 border-orange-800/40',
  achievement: 'bg-emerald-900/30 border-emerald-800/40',
  flip_keep: 'bg-green-900/30 border-green-800/40',
  prediction: 'bg-indigo-900/30 border-indigo-800/40',
  auction_bid: 'bg-rose-900/30 border-rose-800/40',
  watchlist_add: 'bg-cyan-900/30 border-cyan-800/40',
  trade_propose: 'bg-violet-900/30 border-violet-800/40',
  collection_share: 'bg-pink-900/30 border-pink-800/40',
};

// ── Generate NPC activities ───────────────────────────────────────────

function generateNpcActivities(dateStr: string): ActivityItem[] {
  const seed = dateHash(`activity-${dateStr}`);
  const rng = seededRng(seed);
  const now = Date.now();
  const items: ActivityItem[] = [];
  const cards = [...sportsCards].sort(() => rng() - 0.5);

  // Generate 30 NPC activities spread over the last 24h
  for (let i = 0; i < 30; i++) {
    const name = NPC_NAMES[Math.floor(rng() * NPC_NAMES.length)];
    const avatar = NPC_AVATARS[Math.floor(rng() * NPC_AVATARS.length)];
    const card = cards[i % cards.length];
    const timestamp = now - Math.floor(rng() * 86_400_000); // within 24h
    const typeRng = rng();

    let type: ActivityType;
    let message: string;
    let detail: string | undefined;
    let cardSlug: string | undefined;

    if (typeRng < 0.2) {
      type = 'pack_open';
      const packs = ['Baseball Basics', 'Basketball Ballers', 'Football Franchise', 'Vintage Vault', 'Hall of Fame'];
      message = `opened a ${packs[Math.floor(rng() * packs.length)]} pack`;
      detail = `${Math.floor(rng() * 5) + 3} cards pulled`;
    } else if (typeRng < 0.35) {
      type = 'card_pull';
      message = `pulled ${card.name}`;
      cardSlug = card.slug;
      detail = card.estimatedValueRaw;
    } else if (typeRng < 0.45) {
      type = 'trivia_score';
      const score = Math.floor(rng() * 3) + 3;
      message = `scored ${score}/5 on Daily Trivia`;
      detail = score === 5 ? 'Perfect score!' : undefined;
    } else if (typeRng < 0.55) {
      type = 'battle_win';
      message = `won a card battle with ${card.player}`;
      cardSlug = card.slug;
    } else if (typeRng < 0.65) {
      type = 'streak';
      const streakDays = Math.floor(rng() * 20) + 3;
      message = `reached a ${streakDays}-day streak`;
      detail = streakDays >= 14 ? 'On fire!' : undefined;
    } else if (typeRng < 0.72) {
      type = 'achievement';
      const achievements = ['First Pack', 'Card Scholar', 'Streak Master', 'Battle Veteran', 'Market Watcher'];
      message = `earned "${achievements[Math.floor(rng() * achievements.length)]}" badge`;
    } else if (typeRng < 0.8) {
      type = 'flip_keep';
      message = `kept ${card.player} in Flip or Keep`;
      cardSlug = card.slug;
      detail = card.estimatedValueRaw;
    } else if (typeRng < 0.87) {
      type = 'prediction';
      message = `predicted OVER on ${card.player} cards`;
    } else if (typeRng < 0.93) {
      type = 'auction_bid';
      message = `placed a bid on ${card.name}`;
      cardSlug = card.slug;
    } else {
      type = 'watchlist_add';
      message = `added ${card.player} to their watchlist`;
      cardSlug = card.slug;
    }

    items.push({ id: `npc-${i}`, user: name, avatar, type, message, detail, cardSlug, timestamp });
  }

  return items.sort((a, b) => b.timestamp - a.timestamp);
}

// ── Get user's own activities from localStorage ───────────────────────

function getUserActivities(): ActivityItem[] {
  const activities: ActivityItem[] = [];
  const now = Date.now();

  // Check streak
  try {
    const streak = localStorage.getItem('cardvault-streak');
    if (streak) {
      const data = JSON.parse(streak);
      if (data.current > 0) {
        activities.push({
          id: 'you-streak', user: 'You', avatar: '🌟', type: 'streak',
          message: `have a ${data.current}-day streak going`,
          timestamp: now - 3600_000,
          isYou: true,
        });
      }
    }
  } catch { /* skip */ }

  // Check achievements
  try {
    const achievements = localStorage.getItem('cardvault-achievements');
    if (achievements) {
      const data = JSON.parse(achievements);
      const unlocked = Object.values(data).filter(Boolean).length;
      if (unlocked > 0) {
        activities.push({
          id: 'you-achievements', user: 'You', avatar: '🌟', type: 'achievement',
          message: `have ${unlocked} achievement${unlocked > 1 ? 's' : ''} unlocked`,
          timestamp: now - 7200_000,
          isYou: true,
        });
      }
    }
  } catch { /* skip */ }

  // Check daily pack
  try {
    const daily = localStorage.getItem('cardvault-daily-pack-last');
    if (daily) {
      const lastDate = daily.replace(/"/g, '');
      const today = new Date().toISOString().slice(0, 10);
      if (lastDate === today) {
        activities.push({
          id: 'you-daily-pack', user: 'You', avatar: '🌟', type: 'pack_open',
          message: 'opened today\'s free daily pack',
          timestamp: now - 1800_000,
          isYou: true,
        });
      }
    }
  } catch { /* skip */ }

  return activities;
}

// ── Component ─────────────────────────────────────────────────────────

export default function ActivityFeedClient() {
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<'all' | 'you' | ActivityType>('all');

  useEffect(() => setMounted(true), []);

  const today = new Date().toISOString().slice(0, 10);

  const allActivities = useMemo(() => {
    if (!mounted) return [];
    const npc = generateNpcActivities(today);
    const user = getUserActivities();
    return [...user, ...npc].sort((a, b) => b.timestamp - a.timestamp);
  }, [mounted, today]);

  const filtered = useMemo(() => {
    if (filter === 'all') return allActivities;
    if (filter === 'you') return allActivities.filter(a => a.isYou);
    return allActivities.filter(a => a.type === filter);
  }, [allActivities, filter]);

  const stats = useMemo(() => {
    const yourCount = allActivities.filter(a => a.isYou).length;
    const communityCount = allActivities.filter(a => !a.isYou).length;
    const uniqueUsers = new Set(allActivities.map(a => a.user)).size;
    return { yourCount, communityCount, uniqueUsers };
  }, [allActivities]);

  if (!mounted) {
    return <div className="space-y-4 animate-pulse">{[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 bg-gray-800/30 rounded-lg" />)}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="flex flex-wrap items-center gap-4 bg-gray-900/60 border border-gray-800/50 rounded-xl px-4 py-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Collectors Active:</span>
          <span className="font-bold text-emerald-400">{stats.uniqueUsers}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Activities Today:</span>
          <span className="font-semibold text-amber-400">{allActivities.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Your Activity:</span>
          <span className="font-semibold text-indigo-400">{stats.yourCount}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'All' },
          { key: 'you', label: 'My Activity' },
          { key: 'pack_open', label: '\uD83C\uDCCF Packs' },
          { key: 'card_pull', label: '\u2728 Pulls' },
          { key: 'battle_win', label: '\u2694\uFE0F Battles' },
          { key: 'trivia_score', label: '\uD83E\uDDE0 Trivia' },
          { key: 'streak', label: '\uD83D\uDD25 Streaks' },
          { key: 'achievement', label: '\uD83C\uDFC5 Badges' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as typeof filter)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === f.key ? 'bg-indigo-600 text-white' : 'bg-gray-800/50 text-gray-400 hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Feed */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-4xl mb-3">&#128247;</p>
            <p className="text-lg font-medium">No activity yet</p>
            <p className="text-sm mt-1">Start collecting to see your activity here!</p>
          </div>
        ) : (
          filtered.slice(0, 50).map(item => (
            <div
              key={item.id}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                item.isYou ? 'bg-indigo-950/20 border-indigo-800/40' : TYPE_COLORS[item.type]
              }`}
            >
              {/* Avatar */}
              <div className="text-xl flex-shrink-0 w-8 h-8 flex items-center justify-center">
                {item.avatar}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className={`font-medium ${item.isYou ? 'text-indigo-400' : 'text-gray-300'}`}>
                    {item.user}
                  </span>
                  {' '}
                  <span className="text-gray-400">{item.message}</span>
                </p>
                {item.detail && (
                  <p className="text-xs text-gray-500 mt-0.5">{item.detail}</p>
                )}
                {item.cardSlug && (
                  <Link href={`/sports/${item.cardSlug}`} className="text-xs text-indigo-400 hover:text-indigo-300 mt-0.5 inline-block">
                    View card &rarr;
                  </Link>
                )}
              </div>

              {/* Icon + Time */}
              <div className="flex flex-col items-end flex-shrink-0">
                <span className="text-sm">{TYPE_ICONS[item.type]}</span>
                <span className="text-[10px] text-gray-600 mt-0.5">{timeAgo(item.timestamp)}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* How It Works */}
      <div className="bg-gray-900/40 border border-gray-800/40 rounded-xl p-6">
        <h3 className="font-semibold text-white mb-4">Your Activity Shows Up Here</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="space-y-1">
            <div className="text-2xl">{TYPE_ICONS.pack_open}</div>
            <p className="font-medium text-gray-200">Open Packs</p>
            <p className="text-gray-500 text-xs">Pack Store, Daily Pack, and Premium Packs all appear in the feed.</p>
          </div>
          <div className="space-y-1">
            <div className="text-2xl">{TYPE_ICONS.battle_win}</div>
            <p className="font-medium text-gray-200">Win Battles</p>
            <p className="text-gray-500 text-xs">Card Battle victories and your win streaks show up here.</p>
          </div>
          <div className="space-y-1">
            <div className="text-2xl">{TYPE_ICONS.streak}</div>
            <p className="font-medium text-gray-200">Build Streaks</p>
            <p className="text-gray-500 text-xs">Daily visits, trivia scores, and engagement streaks are tracked.</p>
          </div>
          <div className="space-y-1">
            <div className="text-2xl">{TYPE_ICONS.achievement}</div>
            <p className="font-medium text-gray-200">Earn Badges</p>
            <p className="text-gray-500 text-xs">Achievement unlocks appear in the feed for all to see.</p>
          </div>
        </div>
      </div>

      {/* Related */}
      <div className="flex flex-wrap gap-3 text-sm">
        <Link href="/my-hub" className="text-indigo-400 hover:text-indigo-300 transition-colors">My Hub &rarr;</Link>
        <Link href="/achievements" className="text-indigo-400 hover:text-indigo-300 transition-colors">Achievements &rarr;</Link>
        <Link href="/streak" className="text-indigo-400 hover:text-indigo-300 transition-colors">Streak Tracker &rarr;</Link>
        <Link href="/leaderboard" className="text-indigo-400 hover:text-indigo-300 transition-colors">Leaderboards &rarr;</Link>
        <Link href="/card-battle" className="text-indigo-400 hover:text-indigo-300 transition-colors">Card Battles &rarr;</Link>
      </div>
    </div>
  );
}
