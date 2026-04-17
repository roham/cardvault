'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { sportsCards } from '@/data/sports-cards';

type Grader = 'PSA' | 'BGS' | 'CGC' | 'SGC';
type Grade = 10 | 9.5 | 9 | 8.5 | 8 | 7 | 6;
type Action = 'crossover' | 'crack-resub' | 'bump-attempt';
type Tier = 'grail-upgrade' | 'upgrade' | 'wash' | 'downgrade' | 'disaster';
type SportFilter = 'all' | 'baseball' | 'basketball' | 'football' | 'hockey';

interface ReelCard {
  slug: string;
  player: string;
  sport: string;
  year: number;
  set: string;
  baseValue: number; // raw or best-represented value
  rookie: boolean;
}

interface ReelEvent {
  id: string;
  ts: number;
  card: ReelCard;
  action: Action;
  fromGrader: Grader;
  fromGrade: Grade;
  toGrader: Grader;
  toGrade: Grade;
  fromValue: number;
  toValue: number;
  tier: Tier;
  deltaPct: number; // (toValue - fromValue) / fromValue
}

const GRADERS: Grader[] = ['PSA', 'BGS', 'CGC', 'SGC'];

const GRADER_TONE: Record<Grader, string> = {
  PSA: 'text-red-400 bg-red-950/60 border-red-800/40',
  BGS: 'text-amber-400 bg-amber-950/60 border-amber-800/40',
  CGC: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/40',
  SGC: 'text-sky-400 bg-sky-950/60 border-sky-800/40',
};

// Value multipliers per grade relative to raw (raw = 1.0 baseline, but tool tracks graded→graded mostly).
const GRADE_MULT: Record<Grader, Record<Grade, number>> = {
  PSA: { 10: 5.5, 9.5: 3.2, 9: 1.9, 8.5: 1.3, 8: 1.0, 7: 0.65, 6: 0.45 },
  BGS: { 10: 7.5, 9.5: 3.5, 9: 1.9, 8.5: 1.3, 8: 1.0, 7: 0.65, 6: 0.45 },
  CGC: { 10: 3.8, 9.5: 2.6, 9: 1.6, 8.5: 1.2, 8: 0.9, 7: 0.6, 6: 0.4 },
  SGC: { 10: 4.2, 9.5: 2.7, 9: 1.7, 8.5: 1.2, 8: 0.9, 7: 0.6, 6: 0.42 },
};

const TIER_META: Record<Tier, { label: string; icon: string; color: string; ring: string; bg: string; description: string }> = {
  'grail-upgrade': {
    label: 'GRAIL UPGRADE', icon: '🟢', color: 'text-emerald-300', ring: 'ring-emerald-500/50', bg: 'bg-emerald-950/50',
    description: '+100% or more. Crossover jackpot — the hobby\u2019s rarest regrade outcome.',
  },
  'upgrade': {
    label: 'UPGRADE', icon: '✅', color: 'text-lime-300', ring: 'ring-lime-500/40', bg: 'bg-lime-950/40',
    description: '+20-99%. Solid win on the regrade gamble.',
  },
  'wash': {
    label: 'WASH', icon: '⚪', color: 'text-amber-300', ring: 'ring-amber-500/40', bg: 'bg-amber-950/40',
    description: '-19 to +19%. Money sideways after fees. You bought time, not value.',
  },
  'downgrade': {
    label: 'DOWNGRADE', icon: '🔻', color: 'text-orange-300', ring: 'ring-orange-500/40', bg: 'bg-orange-950/40',
    description: '-20 to -49%. Meaningful loss. Regret territory.',
  },
  'disaster': {
    label: 'DISASTER', icon: '💀', color: 'text-rose-400', ring: 'ring-rose-500/50', bg: 'bg-rose-950/50',
    description: '-50% or worse. Someone cracked a 10 and got back an 8. Cautionary tale.',
  },
};

const TIER_ORDER: Tier[] = ['grail-upgrade', 'upgrade', 'wash', 'downgrade', 'disaster'];

function pickWeighted<T>(pairs: [T, number][]): T {
  const total = pairs.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [v, w] of pairs) {
    r -= w;
    if (r <= 0) return v;
  }
  return pairs[pairs.length - 1][0];
}

function parsePrice(s: string): number {
  const cleaned = s.replace(/,/g, '');
  const m = cleaned.match(/\$([0-9]+(?:\.[0-9]+)?)/);
  return m ? parseFloat(m[1]) : 0;
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return `$${Math.round(n).toLocaleString('en-US')}`;
}

function fmtPct(p: number): string {
  const sign = p > 0 ? '+' : '';
  return `${sign}${(p * 100).toFixed(0)}%`;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 1000) return 'just now';
  if (diff < 60_000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  return `${Math.floor(diff / 3_600_000)}h ago`;
}

// Build reel card pool: weight by value × rookie × modern
const REEL_POOL: ReelCard[] = (() => {
  const cards = sportsCards.filter((c) => parsePrice(c.estimatedValueRaw) > 20);
  return cards.map((c) => ({
    slug: c.slug,
    player: c.player,
    sport: c.sport,
    year: c.year,
    set: c.set,
    baseValue: parsePrice(c.estimatedValueRaw),
    rookie: c.rookie,
  }));
})();

function pickCard(): ReelCard {
  // bias toward value + rookie
  const weighted: [ReelCard, number][] = REEL_POOL.map((c) => {
    const valW = Math.max(1, Math.log10(c.baseValue + 1));
    const rcW = c.rookie ? 1.3 : 1;
    const ageW = c.year >= 2015 ? 1.2 : c.year >= 2000 ? 1 : 0.8;
    return [c, valW * rcW * ageW];
  });
  return pickWeighted(weighted);
}

function pickAction(): Action {
  return pickWeighted<Action>([
    ['crossover', 0.55],
    ['crack-resub', 0.30],
    ['bump-attempt', 0.15],
  ]);
}

function pickGrader(exclude?: Grader): Grader {
  const pool = exclude ? GRADERS.filter((g) => g !== exclude) : GRADERS;
  return pool[Math.floor(Math.random() * pool.length)];
}

function pickFromGrade(): Grade {
  return pickWeighted<Grade>([
    [10, 0.12],
    [9.5, 0.08],
    [9, 0.38],
    [8.5, 0.12],
    [8, 0.22],
    [7, 0.06],
    [6, 0.02],
  ]);
}

function simulateToGrade(from: Grade, action: Action): Grade {
  // bias skew by action: crossover mostly same or ±0.5, crack-resub more variance, bump-attempt biased up
  const offsets: [number, number][] = (() => {
    if (action === 'bump-attempt') return [[-1, 0.12], [-0.5, 0.20], [0, 0.38], [0.5, 0.22], [1, 0.08]];
    if (action === 'crack-resub') return [[-2, 0.08], [-1, 0.18], [-0.5, 0.15], [0, 0.30], [0.5, 0.18], [1, 0.08], [1.5, 0.03]];
    return [[-1, 0.10], [-0.5, 0.18], [0, 0.48], [0.5, 0.18], [1, 0.06]]; // crossover
  })();
  const offset = pickWeighted(offsets);
  const all: Grade[] = [6, 7, 8, 8.5, 9, 9.5, 10];
  const idxFrom = all.indexOf(from);
  // translate half-step offsets in index space (0.5 step = 1 idx generally)
  const targetIdx = Math.max(0, Math.min(all.length - 1, idxFrom + Math.round(offset * 2)));
  return all[targetIdx];
}

function classify(deltaPct: number): Tier {
  if (deltaPct >= 1.0) return 'grail-upgrade';
  if (deltaPct >= 0.2) return 'upgrade';
  if (deltaPct > -0.2) return 'wash';
  if (deltaPct > -0.5) return 'downgrade';
  return 'disaster';
}

function makeEvent(): ReelEvent {
  const card = pickCard();
  const action = pickAction();
  const fromGrader = pickGrader();
  const fromGrade = pickFromGrade();
  const toGrader: Grader = action === 'crossover' ? pickGrader(fromGrader) : action === 'crack-resub' ? pickGrader() : fromGrader;
  const toGrade = simulateToGrade(fromGrade, action);
  const fromValue = card.baseValue * (GRADE_MULT[fromGrader]?.[fromGrade] ?? 1);
  const toValue = card.baseValue * (GRADE_MULT[toGrader]?.[toGrade] ?? 1);
  // fees reduce delta slightly — simulate $40 grading + $15 shipping lumped as ~$55 flat
  const netToValue = Math.max(0, toValue - 55);
  const deltaPct = fromValue === 0 ? 0 : (netToValue - fromValue) / fromValue;
  return {
    id: `${card.slug}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    ts: Date.now(),
    card,
    action,
    fromGrader,
    fromGrade,
    toGrader,
    toGrade,
    fromValue,
    toValue: netToValue,
    tier: classify(deltaPct),
    deltaPct,
  };
}

const WATCHLIST_KEY = 'cv_regrade_reel_watch_v1';
const REFRESH_MS = 3800;
const MAX_EVENTS = 60;
const SEED_EVENTS = 8;

export default function RegradeReelClient() {
  const [events, setEvents] = useState<ReelEvent[]>([]);
  const [paused, setPaused] = useState(false);
  const [tierFilter, setTierFilter] = useState<Tier | 'all'>('all');
  const [sportFilter, setSportFilter] = useState<SportFilter>('all');
  const [graderFilter, setGraderFilter] = useState<Grader | 'all'>('all');
  const [watch, setWatch] = useState<Set<string>>(new Set());
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(WATCHLIST_KEY);
      if (raw) setWatch(new Set(JSON.parse(raw)));
    } catch {}
    const seed: ReelEvent[] = [];
    for (let i = 0; i < SEED_EVENTS; i++) {
      const e = makeEvent();
      e.ts = Date.now() - (SEED_EVENTS - i) * 20_000;
      seed.push(e);
    }
    setEvents(seed);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (pausedRef.current) return;
      setEvents((prev) => {
        const next = [makeEvent(), ...prev];
        return next.slice(0, MAX_EVENTS);
      });
    }, REFRESH_MS);
    return () => window.clearInterval(id);
  }, []);

  function toggleWatch(slug: string) {
    setWatch((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug); else next.add(slug);
      try { window.localStorage.setItem(WATCHLIST_KEY, JSON.stringify([...next])); } catch {}
      return next;
    });
  }

  const filtered = useMemo(() => events.filter((e) => {
    if (tierFilter !== 'all' && e.tier !== tierFilter) return false;
    if (sportFilter !== 'all' && e.card.sport !== sportFilter) return false;
    if (graderFilter !== 'all' && e.toGrader !== graderFilter && e.fromGrader !== graderFilter) return false;
    return true;
  }), [events, tierFilter, sportFilter, graderFilter]);

  const watchedEvents = useMemo(() => events.filter((e) => watch.has(e.card.slug)).slice(0, 8), [events, watch]);

  const stats = useMemo(() => {
    const total = events.length;
    const upgrades = events.filter((e) => e.tier === 'grail-upgrade' || e.tier === 'upgrade').length;
    const downgrades = events.filter((e) => e.tier === 'downgrade' || e.tier === 'disaster').length;
    const biggestWin = events.reduce((max, e) => (e.deltaPct > max.deltaPct ? e : max), events[0] || { deltaPct: 0 } as ReelEvent);
    const biggestLoss = events.reduce((min, e) => (e.deltaPct < min.deltaPct ? e : min), events[0] || { deltaPct: 0 } as ReelEvent);
    return { total, upgrades, downgrades, biggestWin, biggestLoss };
  }, [events]);

  return (
    <div className="space-y-6">
      {/* Stat strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Feed events" value={stats.total} tone="neutral" />
        <Stat label="Upgrades" value={stats.upgrades} tone="up" />
        <Stat label="Downgrades" value={stats.downgrades} tone="down" />
        <Stat
          label="Biggest swing"
          value={stats.total ? `${fmtPct(stats.biggestWin?.deltaPct ?? 0)} / ${fmtPct(stats.biggestLoss?.deltaPct ?? 0)}` : '—'}
          tone="neutral"
          small
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-1 text-xs uppercase tracking-wider text-orange-300 font-semibold mr-1">Tier</div>
        {(['all', ...TIER_ORDER] as (Tier | 'all')[]).map((t) => (
          <button key={t} onClick={() => setTierFilter(t)} className={pillCls(tierFilter === t)}>
            {t === 'all' ? 'All' : TIER_META[t].label}
          </button>
        ))}
        <div className="w-full sm:w-auto sm:ml-4 flex flex-wrap gap-2 items-center">
          <div className="text-xs uppercase tracking-wider text-orange-300 font-semibold">Sport</div>
          {(['all', 'baseball', 'basketball', 'football', 'hockey'] as SportFilter[]).map((s) => (
            <button key={s} onClick={() => setSportFilter(s)} className={pillCls(sportFilter === s)}>{s === 'all' ? 'All' : s}</button>
          ))}
        </div>
        <div className="w-full sm:w-auto sm:ml-4 flex flex-wrap gap-2 items-center">
          <div className="text-xs uppercase tracking-wider text-orange-300 font-semibold">Grader</div>
          {(['all', ...GRADERS] as (Grader | 'all')[]).map((g) => (
            <button key={g} onClick={() => setGraderFilter(g)} className={pillCls(graderFilter === g)}>{g === 'all' ? 'All' : g}</button>
          ))}
        </div>
        <button onClick={() => setPaused((p) => !p)} className={`ml-auto px-3 py-1.5 rounded-full text-xs font-semibold ${paused ? 'bg-orange-500 text-black hover:bg-orange-400' : 'bg-gray-800 text-gray-200 hover:bg-gray-700'}`}>
          {paused ? 'Resume feed' : 'Pause feed'}
        </button>
      </div>

      {/* Watchlist */}
      {watch.size > 0 && (
        <div className="rounded-xl bg-orange-950/30 border border-orange-900/40 p-4">
          <div className="text-xs uppercase tracking-wider text-orange-300 font-semibold mb-2">Your watchlist ({watch.size})</div>
          {watchedEvents.length === 0 ? (
            <div className="text-xs text-gray-500">No watchlisted cards have fired in this session yet. Wait for events or star more cards below.</div>
          ) : (
            <div className="space-y-2">
              {watchedEvents.map((e) => <EventRow key={e.id} event={e} watched onToggle={() => toggleWatch(e.card.slug)} compact />)}
            </div>
          )}
        </div>
      )}

      {/* Main feed */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="rounded-xl bg-gray-900/60 border border-gray-800 p-6 text-center text-gray-500 text-sm">No events match your filters. Loosen a filter or wait a few seconds.</div>
        ) : (
          filtered.map((e) => <EventRow key={e.id} event={e} watched={watch.has(e.card.slug)} onToggle={() => toggleWatch(e.card.slug)} />)
        )}
      </div>

      <div className="text-xs text-gray-500 leading-relaxed">
        Simulated feed. Regrade outcomes are modeled from published crossover success rates and hobby community reports; no individual event represents a real submission. Value deltas account for an estimated $55 round-trip grading + shipping cost. Not investment advice.
      </div>
    </div>
  );
}

function EventRow({ event, watched, onToggle, compact }: { event: ReelEvent; watched: boolean; onToggle: () => void; compact?: boolean }) {
  const meta = TIER_META[event.tier];
  const actionLabel = event.action === 'crossover' ? 'Crossover' : event.action === 'crack-resub' ? 'Crack & Resub' : 'Bump Attempt';
  return (
    <div className={`rounded-xl border ring-1 ${meta.ring} ${meta.bg} ${compact ? 'p-2.5' : 'p-3'} flex items-start gap-3`}>
      <div className="text-xl leading-none pt-0.5">{meta.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center flex-wrap gap-2 mb-1">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${meta.color} border ${meta.ring}`}>{meta.label}</span>
          <span className="text-[10px] uppercase tracking-wider text-gray-400">{actionLabel}</span>
          <span className="text-[10px] text-gray-500">&middot; {timeAgo(event.ts)}</span>
        </div>
        <div className="text-white text-sm font-semibold leading-tight">
          {event.card.year} {event.card.set} {event.card.player}{event.card.rookie ? ' RC' : ''}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border ${GRADER_TONE[event.fromGrader]}`}>
            <span className="font-bold">{event.fromGrader}</span> <span>{event.fromGrade}</span>
          </span>
          <span className="text-gray-500">&rarr;</span>
          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border ${GRADER_TONE[event.toGrader]}`}>
            <span className="font-bold">{event.toGrader}</span> <span>{event.toGrade}</span>
          </span>
          <span className="text-gray-400 ml-2">{fmt(event.fromValue)} <span className="text-gray-600">&rarr;</span> {fmt(event.toValue)}</span>
          <span className={`font-mono font-bold ${event.deltaPct > 0 ? 'text-emerald-400' : event.deltaPct < 0 ? 'text-rose-400' : 'text-gray-400'}`}>{fmtPct(event.deltaPct)}</span>
        </div>
      </div>
      <button onClick={onToggle} className={`text-lg leading-none self-start pt-0.5 ${watched ? 'text-orange-400' : 'text-gray-600 hover:text-orange-400'}`} aria-label={watched ? 'Unwatch' : 'Watch'}>
        {watched ? '\u2605' : '\u2606'}
      </button>
    </div>
  );
}

function Stat({ label, value, tone, small }: { label: string; value: string | number; tone: 'up' | 'down' | 'neutral'; small?: boolean }) {
  const color = tone === 'up' ? 'text-emerald-300' : tone === 'down' ? 'text-rose-400' : 'text-orange-300';
  return (
    <div className="rounded-xl bg-gray-900/60 border border-gray-800 p-3">
      <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">{label}</div>
      <div className={`${small ? 'text-sm font-mono' : 'text-2xl'} font-black ${color}`}>{value}</div>
    </div>
  );
}

function pillCls(active: boolean): string {
  return active
    ? 'px-3 py-1 rounded-full text-xs font-semibold bg-orange-500 text-black'
    : 'px-3 py-1 rounded-full text-xs font-semibold bg-gray-800 text-gray-300 hover:bg-gray-700';
}
