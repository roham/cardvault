'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { sportsCards } from '@/data/sports-cards';

/* ─── Types ─────────────────────────────────────────── */
type Grader = 'PSA' | 'BGS' | 'CGC' | 'SGC';
type GradeTier = 'gem-10' | '9.5' | '9' | '8.5' | '8' | '7-or-less';
type SportFilter = 'all' | 'baseball' | 'basketball' | 'football' | 'hockey';

interface PopCard {
  slug: string;
  name: string;
  player: string;
  sport: string;
  year: number;
  set: string;
  value: number;
  rookie: boolean;
}

interface PopEvent {
  id: string;
  ts: number; // ms timestamp of feed arrival
  grader: Grader;
  grade: GradeTier;
  card: PopCard;
  prevPop: number;       // population before this grade-out
  newPop: number;        // population after
  sessionDelta: number;  // how many grade-outs this card got in the current simulated 10-minute bulk window
  isBulk: boolean;       // indicator: >= 8 pops added in current session = bulk return warning
  isGrail: boolean;      // after update, new pop is <= 3
  isMajorMover: boolean; // this pop just doubled
}

/* ─── Grader config ─────────────────────────────────── */
const GRADERS: Grader[] = ['PSA', 'BGS', 'CGC', 'SGC'];

const GRADER_LABEL: Record<Grader, string> = {
  PSA: 'PSA',
  BGS: 'BGS',
  CGC: 'CGC',
  SGC: 'SGC',
};

const GRADER_WEIGHT: Record<Grader, number> = {
  PSA: 0.55,
  BGS: 0.12,
  CGC: 0.22,
  SGC: 0.11,
};

const GRADER_TONE: Record<Grader, string> = {
  PSA: 'text-red-400 bg-red-950/60 border-red-800/40',
  BGS: 'text-amber-400 bg-amber-950/60 border-amber-800/40',
  CGC: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/40',
  SGC: 'text-sky-400 bg-sky-950/60 border-sky-800/40',
};

/* ─── Grade config ──────────────────────────────────── */
const GRADE_TIERS: GradeTier[] = ['gem-10', '9.5', '9', '8.5', '8', '7-or-less'];

const GRADE_LABEL: Record<GradeTier, string> = {
  'gem-10': 'GEM 10',
  '9.5': '9.5',
  '9': 'MINT 9',
  '8.5': '8.5',
  '8': 'NM-MT 8',
  '7-or-less': '7 or less',
};

// Relative probability of each grade being assigned
const GRADE_WEIGHT: Record<GradeTier, number> = {
  'gem-10': 0.24,
  '9.5': 0.08,
  '9': 0.36,
  '8.5': 0.06,
  '8': 0.16,
  '7-or-less': 0.10,
};

const GRADE_TONE: Record<GradeTier, string> = {
  'gem-10': 'text-emerald-300 bg-emerald-950/50 border-emerald-700',
  '9.5': 'text-emerald-400 bg-emerald-950/40 border-emerald-800',
  '9': 'text-sky-300 bg-sky-950/40 border-sky-800',
  '8.5': 'text-sky-400 bg-sky-950/30 border-sky-800',
  '8': 'text-gray-300 bg-gray-800/60 border-gray-700',
  '7-or-less': 'text-gray-500 bg-gray-900/60 border-gray-800',
};

/* ─── Sport config ──────────────────────────────────── */
const SPORT_EMOJI: Record<string, string> = {
  baseball: '⚾',
  basketball: '🏀',
  football: '🏈',
  hockey: '🏒',
};

/* ─── Helpers ───────────────────────────────────────── */
function parseValue(v: string): number {
  const m = v.match(/\$([0-9,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 5;
}

function weightedPick<T>(items: T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

function formatMoney(n: number): string {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${Math.round(n).toLocaleString()}`;
}

function timeAgo(ts: number, now: number): string {
  const diff = Math.max(0, Math.floor((now - ts) / 1000));
  if (diff < 5) return 'just now';
  if (diff < 60) return `${diff}s ago`;
  const m = Math.floor(diff / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}

/* ─── Pop-report simulation ─────────────────────────── */
// Each card has a synthetic starting population derived deterministically from its value + rookie + year
function startingPop(card: PopCard, grader: Grader, grade: GradeTier): number {
  // Expensive modern rookies get large pops, vintage gets small pops, gem-10 grades get fewer than 9s
  const valueFactor = Math.log10(Math.max(1, card.value)) * 15; // higher value = higher pop (more people graded it)
  const ageFactor = Math.max(0.2, 1 - (2026 - card.year) / 90);   // pre-war cards have tiny pops
  const rookieBoost = card.rookie ? 1.6 : 1.0;
  const graderShare = GRADER_WEIGHT[grader];
  const gradeShare = GRADE_WEIGHT[grade];

  const base = valueFactor * ageFactor * rookieBoost * graderShare * gradeShare * 180;
  const noise = 0.7 + Math.random() * 0.6; // 0.7 - 1.3x

  let p = Math.max(1, Math.round(base * noise));
  // Cap at realistic range
  if (p > 50000) p = 50000;
  return p;
}

interface CardSessionState {
  slug: string;
  sessionDelta: number;
  lastTick: number;
}

/* ─── UI ────────────────────────────────────────────── */
export default function PopWatchClient() {
  const [events, setEvents] = useState<PopEvent[]>([]);
  const [paused, setPaused] = useState(false);
  const [graderFilter, setGraderFilter] = useState<Grader | 'all'>('all');
  const [sportFilter, setSportFilter] = useState<SportFilter>('all');
  const [gradeFilter, setGradeFilter] = useState<GradeTier | 'all'>('all');
  const [watchlist, setWatchlist] = useState<string[]>([]);

  const graderFilterRef = useRef(graderFilter);
  const sportFilterRef = useRef(sportFilter);
  const gradeFilterRef = useRef(gradeFilter);
  const sessionState = useRef<Map<string, CardSessionState>>(new Map());

  useEffect(() => { graderFilterRef.current = graderFilter; }, [graderFilter]);
  useEffect(() => { sportFilterRef.current = sportFilter; }, [sportFilter]);
  useEffect(() => { gradeFilterRef.current = gradeFilter; }, [gradeFilter]);

  // Load watchlist
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem('cv_pop_watch_list');
      if (raw) setWatchlist(JSON.parse(raw));
    } catch {}
  }, []);

  function toggleWatch(slug: string) {
    setWatchlist(prev => {
      const next = prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug];
      try { window.localStorage.setItem('cv_pop_watch_list', JSON.stringify(next)); } catch {}
      return next;
    });
  }

  // Pool: bias toward cards with meaningful value (>= $25) so the feed feels relevant
  const pool = useMemo<PopCard[]>(() => {
    const arr: PopCard[] = [];
    for (const c of sportsCards) {
      const v = parseValue(c.estimatedValueRaw);
      if (v < 15) continue; // below $15 cards rarely get graded
      arr.push({
        slug: c.slug,
        name: c.name,
        player: c.player,
        sport: c.sport,
        year: c.year,
        set: c.set,
        value: v,
        rookie: !!c.rookie,
      });
    }
    return arr;
  }, []);

  function generateEvent(): PopEvent | null {
    if (pool.length === 0) return null;
    // Bias toward recent + valuable + rookie
    const card = weightedPick(
      pool,
      pool.map(c => {
        const modern = c.year >= 2000 ? 1.5 : c.year >= 1980 ? 1.2 : 0.8;
        const val = Math.log10(Math.max(1, c.value)) * 0.4 + 0.6;
        const rook = c.rookie ? 1.4 : 1.0;
        return modern * val * rook;
      })
    );

    const grader = weightedPick(GRADERS, GRADERS.map(g => GRADER_WEIGHT[g]));
    const grade = weightedPick(GRADE_TIERS, GRADE_TIERS.map(g => GRADE_WEIGHT[g]));

    const key = `${card.slug}|${grader}|${grade}`;
    let sess = sessionState.current.get(key);
    const now = Date.now();
    if (!sess) {
      sess = { slug: key, sessionDelta: 0, lastTick: now };
      sessionState.current.set(key, sess);
    }
    // Decay: if this slug hasn't been seen in 90s, reset session counter
    if (now - sess.lastTick > 90_000) {
      sess.sessionDelta = 0;
    }
    sess.sessionDelta += 1;
    sess.lastTick = now;

    const prevPop = startingPop(card, grader, grade) + Math.max(0, sess.sessionDelta - 1);
    const newPop = prevPop + 1;
    const isBulk = sess.sessionDelta >= 8;
    const isGrail = newPop <= 3;
    const isMajorMover = prevPop <= 2 && sess.sessionDelta >= 2; // tiny pop that just jumped

    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ts: Date.now(),
      grader,
      grade,
      card,
      prevPop,
      newPop,
      sessionDelta: sess.sessionDelta,
      isBulk,
      isGrail,
      isMajorMover,
    };
  }

  // Prime initial feed
  useEffect(() => {
    const seed: PopEvent[] = [];
    for (let i = 0; i < 12; i++) {
      const e = generateEvent();
      if (e) seed.push({ ...e, ts: Date.now() - (12 - i) * 3500 });
    }
    setEvents(seed);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-feed
  useEffect(() => {
    if (paused) return;
    const interval = window.setInterval(() => {
      const e = generateEvent();
      if (!e) return;
      setEvents(prev => {
        // Keep last 60 events
        const next = [e, ...prev];
        if (next.length > 60) next.length = 60;
        return next;
      });
    }, 3800);
    return () => window.clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused]);

  // Re-render periodically for timeAgo updates
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const i = window.setInterval(() => setTick(t => t + 1), 10_000);
    return () => window.clearInterval(i);
  }, []);

  // Filter view
  const filtered = useMemo(() => {
    return events.filter(e => {
      if (graderFilter !== 'all' && e.grader !== graderFilter) return false;
      if (sportFilter !== 'all' && e.card.sport !== sportFilter) return false;
      if (gradeFilter !== 'all' && e.grade !== gradeFilter) return false;
      return true;
    });
  }, [events, graderFilter, sportFilter, gradeFilter]);

  // Watched events (across full feed, not filtered)
  const watchedEvents = useMemo(() =>
    events.filter(e => watchlist.includes(e.card.slug)).slice(0, 15),
    [events, watchlist]
  );

  // Stats
  const stats = useMemo(() => {
    const totalInWindow = events.length;
    const gem10s = events.filter(e => e.grade === 'gem-10').length;
    const bulkAlerts = events.filter(e => e.isBulk).length;
    const grails = events.filter(e => e.isGrail).length;
    const topMover = events.find(e => e.isMajorMover);
    return { totalInWindow, gem10s, bulkAlerts, grails, topMover };
  }, [events]);

  const now = Date.now() + tick * 0; // tick for re-render

  return (
    <div className="space-y-6">
      {/* Filter rail */}
      <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <FilterSelect
            label="Grader"
            value={graderFilter}
            onChange={v => setGraderFilter(v as Grader | 'all')}
            options={[{ v: 'all', label: 'All graders' }, ...GRADERS.map(g => ({ v: g, label: GRADER_LABEL[g] }))]}
          />
          <FilterSelect
            label="Sport"
            value={sportFilter}
            onChange={v => setSportFilter(v as SportFilter)}
            options={[
              { v: 'all', label: 'All sports' },
              { v: 'baseball', label: '⚾ Baseball' },
              { v: 'basketball', label: '🏀 Basketball' },
              { v: 'football', label: '🏈 Football' },
              { v: 'hockey', label: '🏒 Hockey' },
            ]}
          />
          <FilterSelect
            label="Grade"
            value={gradeFilter}
            onChange={v => setGradeFilter(v as GradeTier | 'all')}
            options={[{ v: 'all', label: 'All grades' }, ...GRADE_TIERS.map(g => ({ v: g, label: GRADE_LABEL[g] }))]}
          />
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Feed</label>
            <button
              onClick={() => setPaused(p => !p)}
              className={`w-full px-3 py-2 rounded-lg text-sm font-semibold transition-colors border ${
                paused ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-teal-900/60 border-teal-700 text-teal-200'
              }`}
            >
              {paused ? '▶ Resume' : '⏸ Pause'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <Stat label="In window" value={stats.totalInWindow.toString()} tone="text-white" />
        <Stat label="Gem 10s" value={stats.gem10s.toString()} tone="text-emerald-400" />
        <Stat label="Bulk alerts" value={stats.bulkAlerts.toString()} tone="text-amber-400" />
        <Stat label="Grail pops ≤3" value={stats.grails.toString()} tone="text-rose-400" />
      </div>

      {/* Watchlist */}
      {watchlist.length > 0 && (
        <div className="bg-violet-950/30 border border-violet-800/30 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-violet-400 mb-3 uppercase tracking-wide">
            Your watchlist ({watchlist.length}) {watchedEvents.length === 0 && <span className="font-normal normal-case text-xs text-gray-500">— no activity yet</span>}
          </h3>
          {watchedEvents.length > 0 && (
            <div className="space-y-2">
              {watchedEvents.map(e => <EventRow key={e.id} event={e} now={now} watched onToggle={toggleWatch} />)}
            </div>
          )}
        </div>
      )}

      {/* Feed */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
            Live pop-report feed {paused && <span className="text-amber-400 ml-2">(paused)</span>}
          </h3>
          <span className="text-xs text-gray-500">{filtered.length} / {events.length} visible</span>
        </div>

        {filtered.length === 0 && (
          <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-8 text-center text-sm text-gray-500">
            No events match your filters. Loosen a filter or wait for new data.
          </div>
        )}

        {filtered.map(e => (
          <EventRow
            key={e.id}
            event={e}
            now={now}
            watched={watchlist.includes(e.card.slug)}
            onToggle={toggleWatch}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-4 text-xs text-gray-400 space-y-2">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-2">How to read the feed</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div><span className="text-emerald-400 font-semibold">GRAIL</span> — population of 3 or less after grade-out. Ultra-rare.</div>
          <div><span className="text-amber-400 font-semibold">BULK</span> — 8+ grade-outs for the same card/grade in a short window. Likely a sub return-dump. Expect saturation.</div>
          <div><span className="text-sky-400 font-semibold">MOVER</span> — tiny pop just doubled. Worth watching the secondary market for listing flurry.</div>
        </div>
        <div className="pt-2 border-t border-gray-800">
          Data is a simulation based on real card values + rookie / vintage / grade distribution weighting — not a live feed from PSA / BGS / CGC / SGC. Use actual grader population reports before making a purchase decision.
        </div>
      </div>
    </div>
  );
}

/* ─── Sub-components ────────────────────────────────── */
function FilterSelect<T extends string>({ label, value, onChange, options }: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { v: T; label: string }[];
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value as T)}
        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-teal-500"
      >
        {options.map(o => <option key={o.v} value={o.v}>{o.label}</option>)}
      </select>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="bg-gray-900/40 border border-gray-800 rounded-lg px-3 py-2">
      <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{label}</div>
      <div className={`text-xl font-black ${tone}`}>{value}</div>
    </div>
  );
}

function EventRow({ event, now, watched, onToggle }: {
  event: PopEvent;
  now: number;
  watched: boolean;
  onToggle: (slug: string) => void;
}) {
  const { grader, grade, card, prevPop, newPop, isBulk, isGrail, isMajorMover, ts } = event;

  const borderTone = isGrail
    ? 'border-rose-800/60 bg-rose-950/30'
    : isBulk
      ? 'border-amber-800/50 bg-amber-950/20'
      : isMajorMover
        ? 'border-sky-800/50 bg-sky-950/20'
        : 'border-gray-800 bg-gray-900/40';

  return (
    <div className={`border rounded-xl p-3 ${borderTone}`}>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-2 py-0.5 text-xs font-bold border rounded ${GRADER_TONE[grader]}`}>
            {grader}
          </span>
          <span className={`px-2 py-0.5 text-xs font-bold border rounded ${GRADE_TONE[grade]}`}>
            {GRADE_LABEL[grade]}
          </span>
          <span className="text-xs text-gray-500">{SPORT_EMOJI[card.sport] ?? '🏅'}</span>
          <span className="text-white text-sm font-semibold">{card.name}</span>
        </div>
        <button
          onClick={() => onToggle(card.slug)}
          className={`text-xs font-semibold px-2 py-1 rounded border transition-colors ${
            watched
              ? 'bg-violet-900/60 border-violet-700 text-violet-200'
              : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
          }`}
        >
          {watched ? '★ Watching' : '☆ Watch'}
        </button>
      </div>
      <div className="mt-2 flex items-center gap-4 text-xs text-gray-400 flex-wrap">
        <span>
          Pop <span className="text-gray-500">{prevPop.toLocaleString()}</span>
          <span className="mx-1 text-gray-600">→</span>
          <span className="text-white font-semibold">{newPop.toLocaleString()}</span>
        </span>
        <span>Raw {formatMoney(card.value)}</span>
        <span className="text-gray-500">{timeAgo(ts, now)}</span>
        {isGrail && <span className="text-rose-400 font-semibold">GRAIL POP</span>}
        {isBulk && <span className="text-amber-400 font-semibold">BULK RETURN</span>}
        {isMajorMover && <span className="text-sky-400 font-semibold">MAJOR MOVER</span>}
      </div>
    </div>
  );
}
