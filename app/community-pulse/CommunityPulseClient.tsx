'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { sportsCards } from '@/data/sports-cards';

// ── Types ──────────────────────────────────────────────────────────────────
type ActivityType = 'purchase' | 'grading' | 'search' | 'break' | 'listing';
type SportFilter = 'all' | 'baseball' | 'basketball' | 'football' | 'hockey';

interface ActivityEvent {
  id: number;
  type: ActivityType;
  username: string;
  cardName: string;
  player: string;
  sport: string;
  detail: string;
  value?: string;
  timestamp: Date;
  icon: string;
}

interface TrendingCard {
  name: string;
  player: string;
  sport: string;
  searches: number;
  change: number;
}

// ── Fake usernames ────────────────────────────────────────────────────────
const usernames = [
  'CardKing23', 'WaxRipper', 'GemMint10', 'VintageVault', 'RookieHunter',
  'SlabCollector', 'PackAttack', 'GrailChaser', 'SetBuilder99', 'FlipMaster',
  'HobbyDad42', 'CardCrusher', 'MintCondition', 'BoxBreaker', 'ProspectPro',
  'PatchHunter', 'GradeHero', 'CardSharks', 'WaxAddict', 'ToppsKing',
  'PrizmPulls', 'ChromeChaser', 'BreakBandit', 'DraftDayDeals', 'CardVaultFan',
  'SealedOnly', 'PSA10Club', 'RefractorRick', 'JerseyCollector', 'AutoHunter',
  'CardShowKing', 'VintageVibes', 'ModernMasters', 'RCHunter2025', 'HoopsCards',
];

const gradeResults = ['PSA 10', 'PSA 9', 'PSA 8', 'PSA 7', 'BGS 9.5', 'BGS 10', 'CGC 9.5', 'SGC 10'];
const gradingCompanies = ['PSA', 'BGS', 'CGC', 'SGC'];
const searchTerms = ['rookie card', 'PSA 10', 'auto', 'parallel', 'refractor', 'numbered', 'first Bowman', 'base set', 'hobby box', 'blaster'];

// ── Seeded random ─────────────────────────────────────────────────────────
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function parsePrice(val: string): number {
  const m = val.match(/\$[\d,]+/);
  return m ? parseInt(m[0].replace(/[$,]/g, ''), 10) : 0;
}

// ── Generate activity event ───────────────────────────────────────────────
let eventCounter = 0;

function generateEvent(rand: () => number): ActivityEvent {
  const card = sportsCards[Math.floor(rand() * sportsCards.length)];
  const username = usernames[Math.floor(rand() * usernames.length)];
  const price = parsePrice(card.estimatedValueRaw);
  const types: ActivityType[] = ['purchase', 'purchase', 'grading', 'search', 'search', 'break', 'listing'];
  const type = types[Math.floor(rand() * types.length)];

  let detail = '';
  let icon = '';
  let value: string | undefined;

  switch (type) {
    case 'purchase':
      icon = '💰';
      value = `$${Math.round(price * (0.8 + rand() * 0.4))}`;
      detail = `purchased ${card.rookie ? 'RC ' : ''}for ${value}`;
      break;
    case 'grading':
      icon = '🏅';
      const grade = gradeResults[Math.floor(rand() * gradeResults.length)];
      detail = `submitted to ${gradingCompanies[Math.floor(rand() * gradingCompanies.length)]} — received ${grade}`;
      break;
    case 'search':
      icon = '🔍';
      const term = searchTerms[Math.floor(rand() * searchTerms.length)];
      detail = `searching for "${card.player} ${term}"`;
      break;
    case 'break':
      icon = '📺';
      detail = `pulled from a ${card.sport} hobby box break`;
      value = card.estimatedValueRaw;
      break;
    case 'listing':
      icon = '📝';
      value = `$${Math.round(price * (0.9 + rand() * 0.3))}`;
      detail = `listed for sale at ${value}`;
      break;
  }

  return {
    id: ++eventCounter,
    type,
    username,
    cardName: card.name,
    player: card.player,
    sport: card.sport,
    detail,
    value,
    timestamp: new Date(),
    icon,
  };
}

// ── Generate trending cards ───────────────────────────────────────────────
function generateTrending(): TrendingCard[] {
  const d = new Date();
  const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  const rand = seededRandom(seed);

  // Pick 10 trending cards
  const shuffled = [...sportsCards]
    .filter(c => parsePrice(c.estimatedValueRaw) > 5)
    .sort(() => rand() - 0.5);

  return shuffled.slice(0, 10).map(c => ({
    name: c.name,
    player: c.player,
    sport: c.sport,
    searches: Math.floor(50 + rand() * 450),
    change: Math.round((rand() - 0.3) * 40),
  }));
}

// ── Sport colors ──────────────────────────────────────────────────────────
function sportColor(sport: string): string {
  switch (sport) {
    case 'baseball': return 'text-rose-400';
    case 'basketball': return 'text-orange-400';
    case 'football': return 'text-emerald-400';
    case 'hockey': return 'text-sky-400';
    default: return 'text-gray-400';
  }
}

function sportEmoji(sport: string): string {
  switch (sport) {
    case 'baseball': return '⚾';
    case 'basketball': return '🏀';
    case 'football': return '🏈';
    case 'hockey': return '🏒';
    default: return '🃏';
  }
}

function typeColor(type: ActivityType): string {
  switch (type) {
    case 'purchase': return 'bg-emerald-500/10 border-emerald-500/30';
    case 'grading': return 'bg-violet-500/10 border-violet-500/30';
    case 'search': return 'bg-blue-500/10 border-blue-500/30';
    case 'break': return 'bg-orange-500/10 border-orange-500/30';
    case 'listing': return 'bg-yellow-500/10 border-yellow-500/30';
  }
}

// ── Component ─────────────────────────────────────────────────────────────
export default function CommunityPulseClient() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [filter, setFilter] = useState<ActivityType | 'all'>('all');
  const [sportFilter, setSportFilter] = useState<SportFilter>('all');
  const [paused, setPaused] = useState(false);
  const randRef = useRef(seededRandom(Date.now()));

  const trending = useMemo(() => generateTrending(), []);

  // Auto-generate events
  useEffect(() => {
    // Generate initial batch
    const initial: ActivityEvent[] = [];
    for (let i = 0; i < 15; i++) {
      initial.push(generateEvent(randRef.current));
    }
    setEvents(initial);

    // Add new events periodically
    const interval = setInterval(() => {
      if (paused) return;
      setEvents(prev => {
        const newEvent = generateEvent(randRef.current);
        return [newEvent, ...prev].slice(0, 50); // Keep max 50 events
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [paused]);

  // Filter events
  const filteredEvents = events.filter(e => {
    if (filter !== 'all' && e.type !== filter) return false;
    if (sportFilter !== 'all' && e.sport !== sportFilter) return false;
    return true;
  });

  // Live stats
  const stats = useMemo(() => {
    const last5min = events;
    return {
      purchases: last5min.filter(e => e.type === 'purchase').length,
      gradings: last5min.filter(e => e.type === 'grading').length,
      searches: last5min.filter(e => e.type === 'search').length,
      breaks: last5min.filter(e => e.type === 'break').length,
    };
  }, [events]);

  return (
    <div>
      {/* Live stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Purchases', value: stats.purchases, icon: '💰', color: 'text-emerald-400' },
          { label: 'Gradings', value: stats.gradings, icon: '🏅', color: 'text-violet-400' },
          { label: 'Searches', value: stats.searches, icon: '🔍', color: 'text-blue-400' },
          { label: 'Break Pulls', value: stats.breaks, icon: '📺', color: 'text-orange-400' },
        ].map((s, i) => (
          <div key={i} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-3 text-center">
            <span className="text-lg">{s.icon}</span>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-gray-500 text-xs">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main feed (2 cols) */}
        <div className="lg:col-span-2">
          {/* Filters */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex gap-1.5">
              {[
                { id: 'all' as const, label: 'All' },
                { id: 'purchase' as const, label: '💰 Buys' },
                { id: 'grading' as const, label: '🏅 Grades' },
                { id: 'search' as const, label: '🔍 Search' },
                { id: 'break' as const, label: '📺 Breaks' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    filter === f.id
                      ? 'bg-pink-600/30 text-pink-400 border border-pink-500/30'
                      : 'bg-gray-800/50 text-gray-500 border border-gray-700/50 hover:text-gray-300'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <select
                value={sportFilter}
                onChange={e => setSportFilter(e.target.value as SportFilter)}
                className="bg-gray-800 border border-gray-700 text-gray-300 text-xs rounded-lg px-2 py-1 focus:outline-none"
              >
                <option value="all">All Sports</option>
                <option value="baseball">Baseball</option>
                <option value="basketball">Basketball</option>
                <option value="football">Football</option>
                <option value="hockey">Hockey</option>
              </select>
              <button
                onClick={() => setPaused(!paused)}
                className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  paused ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30' : 'bg-gray-800/50 text-gray-500 border-gray-700/50'
                }`}
              >
                {paused ? '▶ Resume' : '⏸ Pause'}
              </button>
            </div>
          </div>

          {/* Activity feed */}
          <div className="space-y-2">
            {filteredEvents.length === 0 ? (
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-8 text-center text-gray-500">
                No activity matching your filters. Try broadening your criteria.
              </div>
            ) : (
              filteredEvents.map(event => (
                <div
                  key={event.id}
                  className={`border rounded-lg px-4 py-3 transition-all animate-in ${typeColor(event.type)}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg flex-shrink-0">{event.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-medium text-sm">{event.username}</span>
                        <span className={`text-xs ${sportColor(event.sport)}`}>
                          {sportEmoji(event.sport)} {event.sport}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm mt-0.5">
                        <span className="text-white font-medium">{event.cardName}</span>
                        {' — '}
                        {event.detail}
                      </p>
                    </div>
                    {event.value && (
                      <span className="text-emerald-400 font-bold text-sm flex-shrink-0">{event.value}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar (1 col) */}
        <div className="space-y-6">
          {/* Trending Cards */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <span>🔥</span> Trending Today
            </h3>
            <div className="space-y-2">
              {trending.map((card, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600 w-5 text-right text-xs">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-300 truncate text-xs">{card.player}</p>
                  </div>
                  <span className="text-gray-500 text-xs">{card.searches}</span>
                  <span className={`text-xs font-medium ${card.change > 0 ? 'text-emerald-400' : card.change < 0 ? 'text-red-400' : 'text-gray-500'}`}>
                    {card.change > 0 ? '+' : ''}{card.change}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity breakdown */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <span>📊</span> Activity Mix
            </h3>
            {[
              { label: 'Purchases', count: stats.purchases, total: events.length, color: 'bg-emerald-500/60' },
              { label: 'Grading', count: stats.gradings, total: events.length, color: 'bg-violet-500/60' },
              { label: 'Searches', count: stats.searches, total: events.length, color: 'bg-blue-500/60' },
              { label: 'Breaks', count: stats.breaks, total: events.length, color: 'bg-orange-500/60' },
            ].map(item => {
              const pct = item.total > 0 ? Math.round(item.count / item.total * 100) : 0;
              return (
                <div key={item.label} className="mb-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">{item.label}</span>
                    <span className="text-gray-500">{pct}%</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${item.color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sport breakdown */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <span>🏟️</span> By Sport
            </h3>
            {(['baseball', 'basketball', 'football', 'hockey'] as const).map(sport => {
              const count = events.filter(e => e.sport === sport).length;
              const pct = events.length > 0 ? Math.round(count / events.length * 100) : 0;
              return (
                <div key={sport} className="flex items-center gap-2 mb-2">
                  <span className="text-sm">{sportEmoji(sport)}</span>
                  <span className={`text-xs capitalize w-20 ${sportColor(sport)}`}>{sport}</span>
                  <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-pink-500/40 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-gray-500 text-xs w-8 text-right">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
