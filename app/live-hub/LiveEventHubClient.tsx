'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

type EventCategory = 'all' | 'breaks' | 'auctions' | 'shows' | 'drops' | 'community';

interface LiveEvent {
  id: string;
  title: string;
  category: EventCategory;
  status: 'live' | 'upcoming' | 'ended';
  time: Date;
  description: string;
  href: string;
  sport?: string;
  spots?: number;
  spotsTotal?: number;
  currentBid?: string;
  icon: string;
  color: string;
}

function dateHash(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function getTimeLabel(d: Date): string {
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  if (diff < 0) return 'Ended';
  if (diff < 60_000) return 'Starting now';
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}h ${Math.floor((diff % 3600_000) / 60_000)}m`;
  return `${Math.floor(diff / 86400_000)}d`;
}

const CATEGORY_META: Record<string, { label: string; color: string; icon: string }> = {
  breaks: { label: 'Breaks', color: 'text-red-400 bg-red-950/50 border-red-800/40', icon: '\ud83d\udce6' },
  auctions: { label: 'Auctions', color: 'text-amber-400 bg-amber-950/50 border-amber-800/40', icon: '\ud83d\udd28' },
  shows: { label: 'Card Shows', color: 'text-blue-400 bg-blue-950/50 border-blue-800/40', icon: '\ud83c\udfa4' },
  drops: { label: 'Product Drops', color: 'text-emerald-400 bg-emerald-950/50 border-emerald-800/40', icon: '\ud83d\udce5' },
  community: { label: 'Community', color: 'text-purple-400 bg-purple-950/50 border-purple-800/40', icon: '\ud83c\udf89' },
};

const FILTERS: { key: EventCategory; label: string }[] = [
  { key: 'all', label: 'All Events' },
  { key: 'breaks', label: 'Breaks' },
  { key: 'auctions', label: 'Auctions' },
  { key: 'shows', label: 'Card Shows' },
  { key: 'drops', label: 'Drops' },
  { key: 'community', label: 'Community' },
];

function generateEvents(): LiveEvent[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const h = dateHash(today.toISOString().slice(0, 10));

  const events: LiveEvent[] = [
    // LIVE NOW
    {
      id: 'break-1',
      title: '2024 Topps Chrome Baseball Hobby Box Break',
      category: 'breaks',
      status: 'live',
      time: new Date(now.getTime() - 15 * 60_000),
      description: '12-spot random team break. 6 spots remaining. Chrome autos and refractors galore.',
      href: '/break-room',
      sport: 'baseball',
      spots: 6,
      spotsTotal: 12,
      icon: '\u26be',
      color: 'border-red-500/50 bg-red-950/30',
    },
    {
      id: 'auction-1',
      title: 'PSA 10 Victor Wembanyama Prizm RC',
      category: 'auctions',
      status: 'live',
      time: new Date(now.getTime() + ((h % 45) + 15) * 60_000),
      description: 'Snipe protection active. 23 bids placed. Reserve met.',
      href: '/auction',
      sport: 'basketball',
      currentBid: '$3,450',
      icon: '\ud83c\udfc0',
      color: 'border-amber-500/50 bg-amber-950/30',
    },
    {
      id: 'break-2',
      title: '2024 Panini Prizm Football Mega Box',
      category: 'breaks',
      status: 'live',
      time: new Date(now.getTime() - 8 * 60_000),
      description: 'Solo break — pulling live now. Silver and color Prizms!',
      href: '/break-room',
      sport: 'football',
      icon: '\ud83c\udfc8',
      color: 'border-red-500/50 bg-red-950/30',
    },

    // UPCOMING TODAY
    {
      id: 'break-3',
      title: '2024-25 Upper Deck Series 1 Hockey Case Break',
      category: 'breaks',
      status: 'upcoming',
      time: new Date(today.getTime() + 18 * 3600_000 + ((h % 3) * 3600_000)),
      description: '8-spot PYT break. Young Guns chase — Celebrini, Michkov, Demidov.',
      href: '/break-schedule',
      sport: 'hockey',
      spots: 3,
      spotsTotal: 8,
      icon: '\ud83c\udfd2',
      color: 'border-zinc-700 bg-zinc-900/50',
    },
    {
      id: 'auction-2',
      title: '1986 Fleer Michael Jordan #57 PSA 8',
      category: 'auctions',
      status: 'upcoming',
      time: new Date(today.getTime() + 20 * 3600_000),
      description: 'Opening bid: $5,000. The most iconic basketball card ever made.',
      href: '/auction',
      sport: 'basketball',
      currentBid: '$5,000',
      icon: '\ud83c\udfc0',
      color: 'border-zinc-700 bg-zinc-900/50',
    },
    {
      id: 'drop-1',
      title: '2026 Topps Series 1 Baseball — Release Day',
      category: 'drops',
      status: 'upcoming',
      time: new Date(today.getTime() + ((h % 5) + 1) * 86400_000),
      description: 'Flagship baseball product. New rookie class. Hobby, Jumbo, Blaster available.',
      href: '/drops',
      sport: 'baseball',
      icon: '\u26be',
      color: 'border-zinc-700 bg-zinc-900/50',
    },
    {
      id: 'show-1',
      title: 'National Sports Collectors Convention',
      category: 'shows',
      status: 'upcoming',
      time: new Date(today.getTime() + ((h % 30) + 10) * 86400_000),
      description: 'Chicago, IL. The biggest card show of the year. 500+ dealers, autograph guests, and exclusive products.',
      href: '/card-show-feed',
      icon: '\ud83c\udfa4',
      color: 'border-zinc-700 bg-zinc-900/50',
    },
    {
      id: 'community-1',
      title: 'Weekly Card Battle Tournament',
      category: 'community',
      status: 'upcoming',
      time: new Date(today.getTime() + 19 * 3600_000),
      description: '32-player single elimination. Enter your best 5-card lineup. Winner takes the crown.',
      href: '/tournament',
      icon: '\u2694\ufe0f',
      color: 'border-zinc-700 bg-zinc-900/50',
    },

    // UPCOMING THIS WEEK
    {
      id: 'break-4',
      title: 'Vintage Baseball Pack Break — 1987 Topps Wax Box',
      category: 'breaks',
      status: 'upcoming',
      time: new Date(today.getTime() + 2 * 86400_000 + 18 * 3600_000),
      description: '36 packs of vintage wax. Bo Jackson, Bonds RCs possible.',
      href: '/break-schedule',
      sport: 'baseball',
      spots: 10,
      spotsTotal: 12,
      icon: '\u26be',
      color: 'border-zinc-700 bg-zinc-900/50',
    },
    {
      id: 'auction-3',
      title: '2000 Playoff Contenders Tom Brady Auto RC',
      category: 'auctions',
      status: 'upcoming',
      time: new Date(today.getTime() + 3 * 86400_000 + 20 * 3600_000),
      description: 'The GOAT. Opening bid: $15,000. BGS 9 with 10 auto.',
      href: '/auction',
      sport: 'football',
      currentBid: '$15,000',
      icon: '\ud83c\udfc8',
      color: 'border-zinc-700 bg-zinc-900/50',
    },
    {
      id: 'drop-2',
      title: '2025 Panini Prizm Basketball — Hobby Release',
      category: 'drops',
      status: 'upcoming',
      time: new Date(today.getTime() + ((h % 7) + 3) * 86400_000),
      description: 'Wemby Year 2, new rookie class. Hobby and retail available. Silver Prizm chase.',
      href: '/drops',
      sport: 'basketball',
      icon: '\ud83c\udfc0',
      color: 'border-zinc-700 bg-zinc-900/50',
    },
    {
      id: 'show-2',
      title: 'Dallas Card Show',
      category: 'shows',
      status: 'upcoming',
      time: new Date(today.getTime() + 5 * 86400_000),
      description: 'Dallas Market Hall. 200+ tables. Free admission. Autograph signers TBA.',
      href: '/card-show-feed',
      icon: '\ud83c\udfa4',
      color: 'border-zinc-700 bg-zinc-900/50',
    },
    {
      id: 'community-2',
      title: 'Fantasy Card Portfolio Draft Night',
      category: 'community',
      status: 'upcoming',
      time: new Date(today.getTime() + 4 * 86400_000 + 20 * 3600_000),
      description: 'Snake draft. Pick 5 cards. Track value for 7 days. Winner gets bragging rights.',
      href: '/tools/portfolio',
      icon: '\ud83d\udcc8',
      color: 'border-zinc-700 bg-zinc-900/50',
    },
    {
      id: 'community-3',
      title: 'Daily Collector Challenge: Complete the Set',
      category: 'community',
      status: 'upcoming',
      time: new Date(today.getTime() + 86400_000),
      description: 'Today\'s challenge: Find 5 cards from the same set in our database. Speed matters.',
      href: '/daily-challenges',
      icon: '\ud83c\udfaf',
      color: 'border-zinc-700 bg-zinc-900/50',
    },
    {
      id: 'drop-3',
      title: '2025 Bowman Chrome Baseball',
      category: 'drops',
      status: 'upcoming',
      time: new Date(today.getTime() + ((h % 14) + 7) * 86400_000),
      description: 'THE prospect product. First Bowman Chrome cards for the 2025 draft class.',
      href: '/drops',
      sport: 'baseball',
      icon: '\u26be',
      color: 'border-zinc-700 bg-zinc-900/50',
    },
  ];

  return events.sort((a, b) => {
    if (a.status === 'live' && b.status !== 'live') return -1;
    if (b.status === 'live' && a.status !== 'live') return 1;
    return a.time.getTime() - b.time.getTime();
  });
}

export default function LiveEventHubClient() {
  const [filter, setFilter] = useState<EventCategory>('all');
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [, setTick] = useState(0);

  const events = useMemo(() => generateEvents(), []);

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem('cv-live-saved') || '[]');
      setSaved(new Set(s));
    } catch {}
  }, []);

  // Tick every 30 seconds for countdown updates
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 30_000);
    return () => clearInterval(interval);
  }, []);

  const toggleSave = (id: string) => {
    setSaved(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem('cv-live-saved', JSON.stringify([...next]));
      return next;
    });
  };

  const filtered = filter === 'all' ? events : events.filter(e => e.category === filter);
  const liveCount = events.filter(e => e.status === 'live').length;
  const upcomingToday = events.filter(e => {
    if (e.status !== 'upcoming') return false;
    const today = new Date();
    return e.time.getDate() === today.getDate() && e.time.getMonth() === today.getMonth();
  }).length;

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of events) {
      counts[e.category] = (counts[e.category] || 0) + 1;
    }
    return counts;
  }, [events]);

  return (
    <div>
      {/* Status bar */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-red-950/30 border border-red-800/40 rounded-xl p-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
            <span className="text-red-400 text-2xl font-bold">{liveCount}</span>
          </div>
          <div className="text-zinc-400 text-xs mt-1">Live Now</div>
        </div>
        <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-4 text-center">
          <div className="text-amber-400 text-2xl font-bold">{upcomingToday}</div>
          <div className="text-zinc-400 text-xs mt-1">Today</div>
        </div>
        <div className="bg-purple-950/30 border border-purple-800/40 rounded-xl p-4 text-center">
          <div className="text-purple-400 text-2xl font-bold">{saved.size}</div>
          <div className="text-zinc-400 text-xs mt-1">Saved</div>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-1 mb-6 bg-zinc-900/50 p-1 rounded-xl border border-zinc-800">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 ${
              filter === f.key ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            {f.label}
            {f.key !== 'all' && categoryCounts[f.key] ? (
              <span className="text-[10px] opacity-70">({categoryCounts[f.key]})</span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Event list */}
      <div className="space-y-3">
        {filtered.map(event => {
          const catMeta = CATEGORY_META[event.category] || CATEGORY_META.community;
          const isLive = event.status === 'live';
          const isSaved = saved.has(event.id);

          return (
            <div
              key={event.id}
              className={`border rounded-xl p-4 transition-all ${
                isLive ? event.color : 'border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl flex-shrink-0 mt-0.5">{event.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {isLive && (
                      <span className="inline-flex items-center gap-1 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        Live
                      </span>
                    )}
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${catMeta.color}`}>
                      {catMeta.label}
                    </span>
                    {event.sport && (
                      <span className="text-zinc-500 text-xs capitalize">{event.sport}</span>
                    )}
                  </div>
                  <Link href={event.href} className="text-white font-semibold text-sm hover:text-red-400 transition-colors">
                    {event.title}
                  </Link>
                  <p className="text-zinc-400 text-xs mt-1 leading-relaxed">{event.description}</p>

                  {/* Metadata row */}
                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    {event.spots !== undefined && (
                      <div className="text-xs">
                        <span className="text-emerald-400 font-medium">{event.spots}</span>
                        <span className="text-zinc-500">/{event.spotsTotal} spots left</span>
                      </div>
                    )}
                    {event.currentBid && (
                      <div className="text-xs">
                        <span className="text-zinc-500">Current bid: </span>
                        <span className="text-amber-400 font-medium">{event.currentBid}</span>
                      </div>
                    )}
                    <div className="text-xs text-zinc-500">
                      {isLive ? (
                        <span className="text-red-400">In progress</span>
                      ) : (
                        <span>Starts in {getTimeLabel(event.time)}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleSave(event.id)}
                    className={`p-2 rounded-lg transition-all ${
                      isSaved ? 'bg-red-600/20 text-red-400' : 'bg-zinc-800 text-zinc-500 hover:text-white'
                    }`}
                    title={isSaved ? 'Remove from saved' : 'Save event'}
                  >
                    {isSaved ? '\u2764\ufe0f' : '\ud83d\udd16'}
                  </button>
                  <Link
                    href={event.href}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                      isLive
                        ? 'bg-red-600 text-white hover:bg-red-500'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    {isLive ? 'Join' : 'View'}
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick links */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { href: '/break-room', label: 'Join a Break', icon: '\ud83d\udce6', color: 'bg-red-950/30 border-red-800/40 hover:border-red-600/60' },
          { href: '/auction', label: 'Place a Bid', icon: '\ud83d\udd28', color: 'bg-amber-950/30 border-amber-800/40 hover:border-amber-600/60' },
          { href: '/card-show-feed', label: 'Show Feed', icon: '\ud83c\udfa4', color: 'bg-blue-950/30 border-blue-800/40 hover:border-blue-600/60' },
          { href: '/drops', label: 'Next Drop', icon: '\ud83d\udce5', color: 'bg-emerald-950/30 border-emerald-800/40 hover:border-emerald-600/60' },
          { href: '/daily-challenges', label: 'Daily Quest', icon: '\ud83c\udfaf', color: 'bg-purple-950/30 border-purple-800/40 hover:border-purple-600/60' },
        ].map(link => (
          <Link key={link.href} href={link.href} className={`border rounded-xl p-4 text-center transition-all ${link.color}`}>
            <div className="text-2xl mb-1">{link.icon}</div>
            <div className="text-white text-sm font-medium">{link.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
