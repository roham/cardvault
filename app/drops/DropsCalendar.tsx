'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';

// ─── Types ─────────────────────────────────────────────────────────
interface DropEvent {
  id: string;
  name: string;
  tagline: string;
  sport: string;
  date: string;       // ISO date
  time: string;       // e.g. "7:00 PM ET"
  duration: string;   // e.g. "2 hours"
  packType: string;
  packCount: number;  // how many packs available
  cardsPer: number;
  theme: string;      // gradient classes
  emoji: string;
  features: string[];
  status: 'live' | 'upcoming' | 'completed';
}

// ─── Drop Events Data ──────────────────────────────────────────────
const dropEvents: DropEvent[] = [
  // COMPLETED
  {
    id: 'opening-day-2026',
    name: 'Opening Day Drop',
    tagline: 'First pitch, first pulls. Baseball legends kick off the season.',
    sport: 'baseball',
    date: '2026-03-27',
    time: '1:00 PM ET',
    duration: '4 hours',
    packType: 'Opening Day Legends',
    packCount: 500,
    cardsPer: 5,
    theme: 'from-red-900/60 to-red-800/30',
    emoji: '\u26BE',
    features: ['Guaranteed rookie card', 'Pre-war bonus card chance', 'Opening Day badge'],
    status: 'completed',
  },
  {
    id: 'march-madness-finale',
    name: 'March Madness Finale',
    tagline: 'Championship Monday — college stars turned NBA legends.',
    sport: 'basketball',
    date: '2026-04-06',
    time: '9:00 PM ET',
    duration: '3 hours',
    packType: 'Championship Court',
    packCount: 300,
    cardsPer: 5,
    theme: 'from-orange-900/60 to-orange-800/30',
    emoji: '\uD83C\uDFC0',
    features: ['All-Time March Madness pool', 'College-to-pro matchups', 'Final Four badge'],
    status: 'completed',
  },
  // UPCOMING
  {
    id: 'nba-playoffs-2026',
    name: 'NBA Playoff Heat Drop',
    tagline: 'Postseason legends. Cards that spike when the stakes are highest.',
    sport: 'basketball',
    date: '2026-04-19',
    time: '8:00 PM ET',
    duration: '4 hours',
    packType: 'Playoff Legends',
    packCount: 750,
    cardsPer: 5,
    theme: 'from-orange-900/60 to-amber-800/30',
    emoji: '\uD83D\uDD25',
    features: ['Playoff performers only', 'Championship ring bonus card', 'Playoff Heat badge'],
    status: 'upcoming',
  },
  {
    id: 'nfl-draft-2026',
    name: '2026 NFL Draft Night Drop',
    tagline: 'The picks are in. Rookie cards before the hype.',
    sport: 'football',
    date: '2026-04-23',
    time: '7:00 PM ET',
    duration: '6 hours',
    packType: 'Draft Class Special',
    packCount: 1000,
    cardsPer: 7,
    theme: 'from-blue-900/60 to-indigo-800/30',
    emoji: '\uD83C\uDFC8',
    features: ['Past draft legends pool', 'Guaranteed 1st-round rookie', 'Draft Night badge', 'Live pick tracker integration'],
    status: 'upcoming',
  },
  {
    id: 'vintage-weekend-may',
    name: 'Vintage Weekend',
    tagline: 'Pre-war treasures. The rarest cards in the vault.',
    sport: 'all',
    date: '2026-05-02',
    time: '12:00 PM ET',
    duration: '48 hours',
    packType: 'Vintage Vault',
    packCount: 200,
    cardsPer: 3,
    theme: 'from-amber-900/60 to-yellow-800/30',
    emoji: '\uD83C\uDFDB\uFE0F',
    features: ['Pre-1960 cards only', 'T206 era included', 'Goudey & Play Ball sets', 'Vintage Collector badge'],
    status: 'upcoming',
  },
  {
    id: 'stanley-cup-2026',
    name: 'Stanley Cup Playoff Drop',
    tagline: 'Raise the Cup. Hockey legends who defined playoff hockey.',
    sport: 'hockey',
    date: '2026-05-10',
    time: '7:30 PM ET',
    duration: '4 hours',
    packType: 'Cup Contenders',
    packCount: 400,
    cardsPer: 5,
    theme: 'from-cyan-900/60 to-blue-800/30',
    emoji: '\uD83C\uDFD2',
    features: ['Cup winners only', 'Dynasty team bonus', 'Conn Smythe legends', 'Playoff Beard badge'],
    status: 'upcoming',
  },
  {
    id: 'memorial-day-legends',
    name: 'Memorial Day Legends',
    tagline: 'Honoring the all-time greats across every sport.',
    sport: 'all',
    date: '2026-05-25',
    time: '10:00 AM ET',
    duration: '24 hours',
    packType: 'All-Time Legends',
    packCount: 1500,
    cardsPer: 5,
    theme: 'from-red-900/60 to-blue-800/30',
    emoji: '\uD83C\uDDFA\uD83C\uDDF8',
    features: ['Cross-sport legends', 'HOF class specials', 'Jersey retirement cards', 'Legends badge'],
    status: 'upcoming',
  },
  {
    id: 'nba-finals-2026',
    name: 'NBA Finals Drop',
    tagline: 'Championship Saturday. The biggest cards on the biggest stage.',
    sport: 'basketball',
    date: '2026-06-06',
    time: '8:00 PM ET',
    duration: '4 hours',
    packType: 'Finals Showdown',
    packCount: 500,
    cardsPer: 5,
    theme: 'from-yellow-900/60 to-amber-800/30',
    emoji: '\uD83C\uDFC6',
    features: ['Finals MVPs only', 'Dynasty team bonus', 'Ring count multiplier', 'Champion badge'],
    status: 'upcoming',
  },
  {
    id: 'mlb-all-star-2026',
    name: 'MLB All-Star Break Drop',
    tagline: 'Midsummer Classic. The best of the best.',
    sport: 'baseball',
    date: '2026-07-14',
    time: '7:00 PM ET',
    duration: '6 hours',
    packType: 'All-Star Showcase',
    packCount: 800,
    cardsPer: 5,
    theme: 'from-red-900/60 to-blue-800/30',
    emoji: '\u2B50',
    features: ['All-Star appearances ranked', 'MVP candidates', 'Home Run Derby stars', 'All-Star badge'],
    status: 'upcoming',
  },
];

// ─── Countdown ─────────────────────────────────────────────────────
function useCountdown(targetDate: string, targetTime: string) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    function calc() {
      // Parse "7:00 PM ET" to approximate hour
      const timeParts = targetTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
      let hours = timeParts ? parseInt(timeParts[1]) : 12;
      const mins = timeParts ? parseInt(timeParts[2]) : 0;
      if (timeParts && timeParts[3].toUpperCase() === 'PM' && hours < 12) hours += 12;
      if (timeParts && timeParts[3].toUpperCase() === 'AM' && hours === 12) hours = 0;

      const target = new Date(`${targetDate}T${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00-04:00`);
      const now = new Date();
      const diff = target.getTime() - now.getTime();

      if (diff <= 0) return 'NOW';

      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);

      if (d > 0) return `${d}d ${h}h`;
      if (h > 0) return `${h}h ${m}m`;
      return `${m}m`;
    }

    setTimeLeft(calc());
    const interval = setInterval(() => setTimeLeft(calc()), 60000);
    return () => clearInterval(interval);
  }, [targetDate, targetTime]);

  return timeLeft;
}

// ─── Drop Card Component ───────────────────────────────────────────
function DropCard({ drop }: { drop: DropEvent }) {
  const countdown = useCountdown(drop.date, drop.time);
  const dateObj = new Date(drop.date + 'T12:00:00');
  const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  const isLive = drop.status === 'live' || countdown === 'NOW';
  const isCompleted = drop.status === 'completed';

  return (
    <div className={`relative border rounded-2xl overflow-hidden transition-all ${
      isLive ? 'border-emerald-500/60 ring-1 ring-emerald-500/30' :
      isCompleted ? 'border-gray-800 opacity-60' :
      'border-gray-800 hover:border-gray-600'
    }`}>
      {/* Header */}
      <div className={`bg-gradient-to-r ${drop.theme} p-4 sm:p-5`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{drop.emoji}</span>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                isLive ? 'bg-emerald-500 text-black' :
                isCompleted ? 'bg-gray-700 text-gray-400' :
                'bg-white/10 text-white/80'
              }`}>
                {isLive ? 'LIVE NOW' : isCompleted ? 'ENDED' : dateStr}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white">{drop.name}</h3>
            <p className="text-sm text-gray-300 mt-1">{drop.tagline}</p>
          </div>
          {!isCompleted && (
            <div className="text-right shrink-0">
              <p className={`text-lg font-bold ${isLive ? 'text-emerald-400' : 'text-white'}`}>{countdown || '...'}</p>
              <p className="text-[10px] text-gray-400">{isLive ? 'remaining' : 'until drop'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="p-4 bg-gray-950/80">
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div>
            <p className="text-[10px] text-gray-500 uppercase">Packs</p>
            <p className="text-sm font-semibold text-white">{drop.packCount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase">Cards/Pack</p>
            <p className="text-sm font-semibold text-white">{drop.cardsPer}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase">Duration</p>
            <p className="text-sm font-semibold text-white">{drop.duration}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {drop.features.map((f, i) => (
            <span key={i} className="text-[10px] bg-gray-800 text-gray-300 px-2 py-1 rounded-full">
              {f}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-[10px] text-gray-500">{drop.time} &middot; {drop.packType}</p>
          {!isCompleted && (
            <Link
              href="/premium-packs"
              className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                isLive
                  ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {isLive ? 'Open Packs' : 'Notify Me'}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────
export default function DropsCalendar() {
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [view, setView] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => setMounted(true), []);

  const upcoming = useMemo(() => dropEvents.filter(d => d.status !== 'completed'), []);
  const past = useMemo(() => dropEvents.filter(d => d.status === 'completed').reverse(), []);
  const nextDrop = upcoming[0];

  const filtered = useMemo(() => {
    const list = view === 'upcoming' ? upcoming : past;
    if (filter === 'all') return list;
    return list.filter(d => d.sport === filter);
  }, [view, filter, upcoming, past]);

  if (!mounted) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-48 bg-gray-800 rounded-2xl" />
        <div className="h-32 bg-gray-800 rounded-2xl" />
        <div className="h-32 bg-gray-800 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Next Drop Hero */}
      {nextDrop && (
        <div className={`relative border rounded-2xl overflow-hidden border-emerald-800/40 bg-gradient-to-r ${nextDrop.theme}`}>
          <div className="p-5 sm:p-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xs text-emerald-400 font-medium uppercase tracking-wider">Next Drop</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">{nextDrop.emoji} {nextDrop.name}</h2>
            <p className="text-gray-300 max-w-xl mb-4">{nextDrop.tagline}</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="text-white font-semibold">{new Date(nextDrop.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
              <span className="text-gray-400">{nextDrop.time}</span>
              <span className="text-gray-400">{nextDrop.packCount.toLocaleString()} packs</span>
              <span className="text-gray-400">{nextDrop.cardsPer} cards/pack</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-4">
              {nextDrop.features.map((f, i) => (
                <span key={i} className="text-xs bg-black/30 text-gray-200 px-2.5 py-1 rounded-full border border-white/10">
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex gap-2 mr-4">
          {(['upcoming', 'past'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                view === v ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {v === 'upcoming' ? 'Upcoming' : 'Past Drops'}
            </button>
          ))}
        </div>
        {['all', 'baseball', 'basketball', 'football', 'hockey'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === s ? 'bg-white text-black' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {s === 'all' ? 'All Sports' :
             s === 'baseball' ? '\u26BE Baseball' :
             s === 'basketball' ? '\uD83C\uDFC0 Basketball' :
             s === 'football' ? '\uD83C\uDFC8 Football' :
             '\uD83C\uDFD2 Hockey'}
          </button>
        ))}
      </div>

      {/* Drop Cards */}
      <div className="space-y-4">
        {filtered.map(drop => (
          <DropCard key={drop.id} drop={drop} />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No {view === 'upcoming' ? 'upcoming' : 'past'} drops for this sport.</p>
          </div>
        )}
      </div>

      {/* How Drops Work */}
      <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3">How Drops Work</h3>
        <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-400">
          <div>
            <p className="font-medium text-gray-300 mb-1">Limited Packs</p>
            <p>Each drop has a set number of packs. When they are gone, they are gone until the next event.</p>
          </div>
          <div>
            <p className="font-medium text-gray-300 mb-1">Themed Pools</p>
            <p>Drop packs pull from curated card pools — Playoff Legends, Vintage Vault, Draft Class, and more.</p>
          </div>
          <div>
            <p className="font-medium text-gray-300 mb-1">Event Badges</p>
            <p>Open packs during a drop to earn exclusive event badges for your collector profile.</p>
          </div>
          <div>
            <p className="font-medium text-gray-300 mb-1">Add to Binder</p>
            <p>Every card you pull goes straight to your digital binder. Build your collection event by event.</p>
          </div>
        </div>
      </div>

      {/* Related */}
      <div className="grid sm:grid-cols-3 gap-3">
        <Link href="/premium-packs" className="p-4 bg-gray-900/40 border border-gray-800 rounded-xl hover:border-gray-600 transition-colors">
          <h3 className="text-sm font-semibold text-white">Premium Packs</h3>
          <p className="text-xs text-gray-400 mt-1">Open themed packs anytime — no drop required.</p>
        </Link>
        <Link href="/binder" className="p-4 bg-gray-900/40 border border-gray-800 rounded-xl hover:border-gray-600 transition-colors">
          <h3 className="text-sm font-semibold text-white">Digital Binder</h3>
          <p className="text-xs text-gray-400 mt-1">View your collection and manage trades.</p>
        </Link>
        <Link href="/calendar" className="p-4 bg-gray-900/40 border border-gray-800 rounded-xl hover:border-gray-600 transition-colors">
          <h3 className="text-sm font-semibold text-white">Release Calendar</h3>
          <p className="text-xs text-gray-400 mt-1">Real-world card product release dates.</p>
        </Link>
      </div>
    </div>
  );
}
