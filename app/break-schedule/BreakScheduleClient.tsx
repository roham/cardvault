'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

// ── Types ────────────────────────────────────────────────────
interface ScheduledBreak {
  id: string;
  title: string;
  sport: string;
  sportEmoji: string;
  format: 'hobby' | 'team' | 'random-team' | 'pick-your-pack';
  product: string;
  host: string;
  hostEmoji: string;
  startTime: Date;
  durationMin: number;
  spotsTotal: number;
  spotsFilled: number;
  featured: boolean;
  description: string;
}

type SportFilter = 'all' | 'baseball' | 'basketball' | 'football' | 'hockey';
type FormatFilter = 'all' | 'hobby' | 'team' | 'random-team' | 'pick-your-pack';
type ViewTab = 'upcoming' | 'reminders';

// ── Seeded RNG ───────────────────────────────────────────────
function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function dateHash(date: Date): number {
  const d = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  let h = 0;
  for (let i = 0; i < d.length; i++) { h = ((h << 5) - h + d.charCodeAt(i)) | 0; }
  return Math.abs(h);
}

// ── Data ─────────────────────────────────────────────────────
const HOSTS = [
  { name: 'CardKingMike', emoji: '👑', style: 'Hype Master' },
  { name: 'RipCityBreaks', emoji: '🔥', style: 'Entertainer' },
  { name: 'JaxWax', emoji: '🎯', style: 'Analyst' },
  { name: 'PullParty', emoji: '🎉', style: 'Party Host' },
  { name: 'ChaseThePrizm', emoji: '💎', style: 'Collector' },
  { name: 'BigHitBreakers', emoji: '💥', style: 'Dealer' },
];

const PRODUCTS: Record<string, { name: string; sport: string; emoji: string }[]> = {
  baseball: [
    { name: '2025 Topps Chrome Baseball Hobby', sport: 'baseball', emoji: '⚾' },
    { name: '2025 Bowman Baseball Hobby', sport: 'baseball', emoji: '⚾' },
    { name: '2025 Topps Series 1 Hobby', sport: 'baseball', emoji: '⚾' },
    { name: '2024 Topps Chrome Update Hobby', sport: 'baseball', emoji: '⚾' },
    { name: '2025 Topps Heritage Hobby', sport: 'baseball', emoji: '⚾' },
  ],
  basketball: [
    { name: '2024-25 Panini Prizm Basketball Hobby', sport: 'basketball', emoji: '🏀' },
    { name: '2024-25 Panini Select Basketball Hobby', sport: 'basketball', emoji: '🏀' },
    { name: '2024-25 Panini Optic Basketball Hobby', sport: 'basketball', emoji: '🏀' },
    { name: '2024-25 Panini Contenders Basketball Hobby', sport: 'basketball', emoji: '🏀' },
    { name: '2024-25 Panini National Treasures Basketball', sport: 'basketball', emoji: '🏀' },
  ],
  football: [
    { name: '2025 Panini Prizm Football Hobby', sport: 'football', emoji: '🏈' },
    { name: '2025 Panini Select Football Hobby', sport: 'football', emoji: '🏈' },
    { name: '2025 Panini Optic Football Hobby', sport: 'football', emoji: '🏈' },
    { name: '2025 Panini Contenders Football Hobby', sport: 'football', emoji: '🏈' },
    { name: '2024 Topps Chrome Football Hobby', sport: 'football', emoji: '🏈' },
  ],
  hockey: [
    { name: '2024-25 Upper Deck Series 1 Hobby', sport: 'hockey', emoji: '🏒' },
    { name: '2024-25 Upper Deck Series 2 Hobby', sport: 'hockey', emoji: '🏒' },
    { name: '2024-25 SP Authentic Hockey Hobby', sport: 'hockey', emoji: '🏒' },
    { name: '2024-25 Upper Deck MVP Hockey Hobby', sport: 'hockey', emoji: '🏒' },
    { name: '2024-25 O-Pee-Chee Hockey Hobby', sport: 'hockey', emoji: '🏒' },
  ],
};

const FORMATS: { id: ScheduledBreak['format']; label: string; desc: string }[] = [
  { id: 'hobby', label: 'Hobby Box', desc: 'Full box rip, 24 packs' },
  { id: 'team', label: 'Team Break', desc: 'Buy a team, get all their cards' },
  { id: 'random-team', label: 'Random Teams', desc: 'Teams assigned randomly' },
  { id: 'pick-your-pack', label: 'Pick Your Pack', desc: 'Choose your packs' },
];

const THEMED_EVENTS = [
  { title: 'NBA Playoff Madness', sport: 'basketball', description: 'Premium basketball breaks all day during the NBA Playoffs. Prizm, Select, and National Treasures.' },
  { title: 'NFL Draft Night Spectacular', sport: 'football', description: 'Back-to-back football breaks as picks are announced. Chase the next rookie sensation.' },
  { title: 'Vintage Sunday', sport: 'baseball', description: 'Pre-1980 products and vintage-era collections. Topps, Bowman, and Fleer classics.' },
  { title: 'Stanley Cup Frenzy', sport: 'hockey', description: 'Hockey breaks through the Stanley Cup Playoffs. Upper Deck, SP Authentic, and OPC.' },
  { title: 'Rookie Rush Hour', sport: 'baseball', description: 'Bowman and Chrome products loaded with top prospect rookie cards.' },
  { title: 'High Roller Night', sport: 'basketball', description: 'National Treasures, Flawless, and other ultra-premium products. Big money, bigger hits.' },
];

// ── Generate Schedule ────────────────────────────────────────
function generateSchedule(baseDate: Date): ScheduledBreak[] {
  const breaks: ScheduledBreak[] = [];
  const sports: (keyof typeof PRODUCTS)[] = ['baseball', 'basketball', 'football', 'hockey'];

  // Generate 7 days of breaks (6 per day = 42 total)
  for (let day = 0; day < 7; day++) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + day);
    const seed = dateHash(d) + day * 1000;
    const rng = seededRng(seed);

    // 6 breaks per day, staggered every 2 hours starting at 10am ET
    for (let slot = 0; slot < 6; slot++) {
      const startTime = new Date(d);
      startTime.setHours(10 + slot * 2, 0, 0, 0);

      const sportIdx = Math.floor(rng() * sports.length);
      const sport = sports[sportIdx];
      const productList = PRODUCTS[sport];
      const product = productList[Math.floor(rng() * productList.length)];
      const host = HOSTS[Math.floor(rng() * HOSTS.length)];
      const format = FORMATS[Math.floor(rng() * FORMATS.length)];
      const spotsTotal = format.id === 'team' ? 30 : format.id === 'random-team' ? 32 : format.id === 'pick-your-pack' ? 24 : 1;
      const fillPct = 0.4 + rng() * 0.55;
      const spotsFilled = Math.min(spotsTotal, Math.floor(spotsTotal * fillPct));

      // Check if this day has a themed event
      const isThemed = day === 2 || day === 5;
      const themed = isThemed && slot === 3 ? THEMED_EVENTS[Math.floor(rng() * THEMED_EVENTS.length)] : null;

      breaks.push({
        id: `break-${day}-${slot}`,
        title: themed ? themed.title : `${product.name} ${format.label}`,
        sport: themed ? themed.sport : sport,
        sportEmoji: product.emoji,
        format: format.id,
        product: product.name,
        host: host.name,
        hostEmoji: host.emoji,
        startTime,
        durationMin: 45 + Math.floor(rng() * 30),
        spotsTotal,
        spotsFilled,
        featured: !!themed || (slot === 0 && day === 0),
        description: themed ? themed.description : `${format.desc}. ${product.name} with ${host.name}.`,
      });
    }
  }

  return breaks;
}

// ── Format Helpers ───────────────────────────────────────────
function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function formatDate(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diff = (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function getCountdown(date: Date): string {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  if (diff <= 0) return 'Live Now';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }
  return `${hours}h ${minutes}m`;
}

const SPORT_COLORS: Record<string, string> = {
  baseball: 'border-red-500/50 bg-red-500/10',
  basketball: 'border-orange-500/50 bg-orange-500/10',
  football: 'border-green-500/50 bg-green-500/10',
  hockey: 'border-blue-500/50 bg-blue-500/10',
};

const FORMAT_BADGES: Record<string, string> = {
  hobby: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  team: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'random-team': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  'pick-your-pack': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
};

// ── Component ────────────────────────────────────────────────
export default function BreakScheduleClient() {
  const [mounted, setMounted] = useState(false);
  const [sportFilter, setSportFilter] = useState<SportFilter>('all');
  const [formatFilter, setFormatFilter] = useState<FormatFilter>('all');
  const [viewTab, setViewTab] = useState<ViewTab>('upcoming');
  const [reminders, setReminders] = useState<Set<string>>(new Set());
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('cv-break-reminders');
    if (saved) {
      try { setReminders(new Set(JSON.parse(saved))); } catch { /* ignore */ }
    }
  }, []);

  // Update countdown every minute
  useEffect(() => {
    if (!mounted) return;
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, [mounted]);

  const schedule = useMemo(() => {
    if (!mounted) return [];
    return generateSchedule(new Date());
  }, [mounted]);

  const filtered = useMemo(() => {
    let items = schedule;
    if (sportFilter !== 'all') items = items.filter(b => b.sport === sportFilter);
    if (formatFilter !== 'all') items = items.filter(b => b.format === formatFilter);
    return items;
  }, [schedule, sportFilter, formatFilter]);

  const reminderBreaks = useMemo(() => {
    return schedule.filter(b => reminders.has(b.id));
  }, [schedule, reminders]);

  function toggleReminder(id: string) {
    setReminders(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      localStorage.setItem('cv-break-reminders', JSON.stringify([...next]));
      return next;
    });
  }

  if (!mounted) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-32 bg-gray-800/50 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  const nextBreak = schedule.find(b => b.startTime > now);
  const liveBreaks = schedule.filter(b => {
    const end = new Date(b.startTime.getTime() + b.durationMin * 60000);
    return b.startTime <= now && end > now;
  });

  // Group upcoming by date
  const grouped = new Map<string, ScheduledBreak[]>();
  for (const b of (viewTab === 'reminders' ? reminderBreaks : filtered)) {
    const key = formatDate(b.startTime);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(b);
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gray-800/50 border border-gray-700/40 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-red-400">{liveBreaks.length}</div>
          <div className="text-xs text-gray-400">Live Now</div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700/40 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{schedule.length}</div>
          <div className="text-xs text-gray-400">This Week</div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700/40 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400">{nextBreak ? getCountdown(nextBreak.startTime) : '—'}</div>
          <div className="text-xs text-gray-400">Next Break</div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700/40 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-amber-400">{reminders.size}</div>
          <div className="text-xs text-gray-400">My Reminders</div>
        </div>
      </div>

      {/* Next Break Hero (if exists) */}
      {nextBreak && (
        <div className={`relative overflow-hidden rounded-2xl border ${SPORT_COLORS[nextBreak.sport]} p-6`}>
          {nextBreak.featured && (
            <span className="absolute top-3 right-3 bg-amber-500/20 text-amber-300 text-xs font-bold px-2 py-0.5 rounded-full border border-amber-500/30">FEATURED</span>
          )}
          <div className="text-xs text-gray-400 mb-1">Next Up &mdash; {formatDate(nextBreak.startTime)} at {formatTime(nextBreak.startTime)}</div>
          <h2 className="text-xl font-bold text-white mb-1">{nextBreak.title}</h2>
          <p className="text-gray-400 text-sm mb-3">{nextBreak.description}</p>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${FORMAT_BADGES[nextBreak.format]}`}>
              {FORMATS.find(f => f.id === nextBreak.format)?.label}
            </span>
            <span className="text-xs text-gray-400">{nextBreak.sportEmoji} {nextBreak.sport}</span>
            <span className="text-xs text-gray-400">{nextBreak.hostEmoji} {nextBreak.host}</span>
            <span className="text-xs text-gray-400">{nextBreak.durationMin} min</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-emerald-400">{getCountdown(nextBreak.startTime)}</span>
            <button
              onClick={() => toggleReminder(nextBreak.id)}
              className={`text-sm px-3 py-1 rounded-lg transition-colors ${
                reminders.has(nextBreak.id)
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-gray-700/50 text-gray-300 border border-gray-600/50 hover:border-amber-500/50'
              }`}
            >
              {reminders.has(nextBreak.id) ? '🔔 Reminded' : '🔔 Remind Me'}
            </button>
            <Link href="/break-room" className="text-sm px-3 py-1 rounded-lg bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 transition-colors">
              Join Break Room →
            </Link>
          </div>
        </div>
      )}

      {/* Tabs + Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex gap-1 bg-gray-800/50 rounded-lg p-1">
          {(['upcoming', 'reminders'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setViewTab(tab)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewTab === tab ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'upcoming' ? 'Upcoming' : `My Reminders (${reminders.size})`}
            </button>
          ))}
        </div>
        {viewTab === 'upcoming' && (
          <>
            <div className="flex gap-1 overflow-x-auto">
              {(['all', 'baseball', 'basketball', 'football', 'hockey'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setSportFilter(s)}
                  className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                    sportFilter === s ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {s === 'all' ? 'All Sports' : { baseball: '⚾ MLB', basketball: '🏀 NBA', football: '🏈 NFL', hockey: '🏒 NHL' }[s]}
                </button>
              ))}
            </div>
            <div className="flex gap-1 overflow-x-auto">
              {(['all', ...FORMATS.map(f => f.id)] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFormatFilter(f as FormatFilter)}
                  className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                    formatFilter === f ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {f === 'all' ? 'All Formats' : FORMATS.find(fmt => fmt.id === f)?.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Schedule Grid */}
      {viewTab === 'reminders' && reminders.size === 0 ? (
        <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700/40">
          <div className="text-4xl mb-3">🔔</div>
          <h3 className="text-white font-bold mb-1">No Reminders Set</h3>
          <p className="text-gray-400 text-sm mb-4">Click the bell icon on any break to save it here.</p>
          <button onClick={() => setViewTab('upcoming')} className="text-emerald-400 text-sm hover:underline">
            Browse upcoming breaks →
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {[...grouped.entries()].map(([dateLabel, breaks]) => (
            <div key={dateLabel}>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">{dateLabel}</h3>
              <div className="space-y-3">
                {breaks.map(b => {
                  const end = new Date(b.startTime.getTime() + b.durationMin * 60000);
                  const isLive = b.startTime <= now && end > now;
                  const isPast = end < now;

                  return (
                    <div
                      key={b.id}
                      className={`relative bg-gray-800/40 border rounded-xl p-4 transition-colors ${
                        isLive ? 'border-red-500/50 bg-red-500/5' : isPast ? 'border-gray-700/30 opacity-50' : 'border-gray-700/40 hover:border-gray-600/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {isLive && (
                              <span className="flex items-center gap-1 text-xs font-bold text-red-400">
                                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> LIVE
                              </span>
                            )}
                            <span className="text-xs text-gray-500">{formatTime(b.startTime)}</span>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${FORMAT_BADGES[b.format]}`}>
                              {FORMATS.find(f => f.id === b.format)?.label}
                            </span>
                            {b.featured && (
                              <span className="text-xs font-bold text-amber-400">★ FEATURED</span>
                            )}
                          </div>
                          <h4 className="text-white font-bold text-sm truncate">{b.title}</h4>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                            <span className="text-xs text-gray-400">{b.sportEmoji} {b.sport}</span>
                            <span className="text-xs text-gray-400">{b.hostEmoji} {b.host}</span>
                            <span className="text-xs text-gray-400">{b.durationMin} min</span>
                            {b.format !== 'hobby' && (
                              <span className="text-xs text-gray-400">{b.spotsFilled}/{b.spotsTotal} spots</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {!isPast && (
                            <button
                              onClick={() => toggleReminder(b.id)}
                              className={`text-lg transition-transform hover:scale-110 ${
                                reminders.has(b.id) ? 'text-amber-400' : 'text-gray-600 hover:text-amber-400'
                              }`}
                              title={reminders.has(b.id) ? 'Remove reminder' : 'Set reminder'}
                            >
                              {reminders.has(b.id) ? '🔔' : '🔕'}
                            </button>
                          )}
                          {isLive ? (
                            <Link href="/break-room" className="text-xs px-3 py-1.5 rounded-lg bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 font-bold">
                              JOIN
                            </Link>
                          ) : !isPast ? (
                            <span className="text-xs text-gray-500 font-mono">{getCountdown(b.startTime)}</span>
                          ) : (
                            <span className="text-xs text-gray-600">Ended</span>
                          )}
                        </div>
                      </div>

                      {/* Spots Progress (for non-hobby) */}
                      {b.format !== 'hobby' && !isPast && (
                        <div className="mt-2">
                          <div className="h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                b.spotsFilled / b.spotsTotal > 0.8 ? 'bg-red-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${(b.spotsFilled / b.spotsTotal) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* How Breaks Work */}
      <div className="mt-10 bg-gray-800/30 border border-gray-700/40 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Break Formats Explained</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FORMATS.map(f => (
            <div key={f.id} className={`border rounded-lg p-4 ${FORMAT_BADGES[f.id]}`}>
              <h3 className="font-bold text-sm mb-1">{f.label}</h3>
              <p className="text-xs opacity-80">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-gray-800/30 border border-gray-700/40 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-3">Break Tips</h2>
        <ul className="space-y-2 text-sm text-gray-400">
          <li>🔔 Set reminders for breaks you want to catch — the bell saves to your browser.</li>
          <li>📱 Breaks are mobile-friendly — watch from your phone at card shows or on the go.</li>
          <li>🎯 Team breaks are best value if you only collect one sport or team.</li>
          <li>💎 Featured breaks often run premium products with higher hit rates.</li>
          <li>🗓️ Check the <Link href="/drops" className="text-emerald-400 hover:underline">Drop Calendar</Link> for special themed break events.</li>
          <li>💬 Use the chat in <Link href="/break-room" className="text-emerald-400 hover:underline">Break Room</Link> to react to pulls in real time.</li>
        </ul>
      </div>
    </div>
  );
}
