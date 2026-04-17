'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { sportsCards, type SportsCard } from '@/data/sports-cards';

const WATCHLIST_KEY = 'cv_ceiling_breaks_watch_v1';
const MAX_EVENTS = 50;
const TICK_MS = 5400;

type SportFilter = 'all' | 'baseball' | 'basketball' | 'football' | 'hockey';
type MilestoneType = 'ath' | '12mo' | '7d' | 'recovery';
type TierId = 't100' | 't500' | 't1k' | 't5k' | 't10k' | 't50k' | 't100k';

const TIERS: {
  id: TierId;
  threshold: number;
  label: string;
  color: string;
  border: string;
  emoji: string;
}[] = [
  { id: 't100', threshold: 100, label: '$100 ceiling', color: 'text-lime-600', border: 'border-lime-300', emoji: '🟢' },
  { id: 't500', threshold: 500, label: '$500 ceiling', color: 'text-emerald-600', border: 'border-emerald-300', emoji: '💚' },
  { id: 't1k', threshold: 1000, label: '$1K ceiling', color: 'text-sky-600', border: 'border-sky-300', emoji: '💙' },
  { id: 't5k', threshold: 5000, label: '$5K ceiling', color: 'text-violet-600', border: 'border-violet-300', emoji: '💜' },
  { id: 't10k', threshold: 10000, label: '$10K ceiling', color: 'text-fuchsia-600', border: 'border-fuchsia-300', emoji: '💖' },
  { id: 't50k', threshold: 50000, label: '$50K ceiling', color: 'text-rose-600', border: 'border-rose-300', emoji: '❤️' },
  { id: 't100k', threshold: 100000, label: '$100K ceiling', color: 'text-amber-600', border: 'border-amber-300', emoji: '🏆' },
];

const MILESTONES: Record<
  MilestoneType,
  { label: string; short: string; badge: string; color: string; weight: number; narrative: (cross: string, extra: string) => string }
> = {
  ath: {
    label: 'ALL-TIME HIGH',
    short: 'ATH',
    badge: 'bg-amber-500 text-white',
    color: 'text-amber-700',
    weight: 8,
    narrative: (cross, extra) => `First-ever cross over ${cross} — prior ATH: ${extra}`,
  },
  '12mo': {
    label: '12-MONTH HIGH',
    short: '12M HIGH',
    badge: 'bg-violet-500 text-white',
    color: 'text-violet-700',
    weight: 22,
    narrative: (cross, extra) => `Back above ${cross} for the first time in 12 months — last cross: ${extra}`,
  },
  '7d': {
    label: '7-DAY BREAKOUT',
    short: '7D BREAKOUT',
    badge: 'bg-sky-500 text-white',
    color: 'text-sky-700',
    weight: 50,
    narrative: (cross, extra) => `7-day high extended past ${cross} — prior week\u2019s peak: ${extra}`,
  },
  recovery: {
    label: 'RECOVERY CROSS',
    short: 'RECOVERY',
    badge: 'bg-emerald-500 text-white',
    color: 'text-emerald-700',
    weight: 20,
    narrative: (cross, extra) => `Back above ${cross} after a drawdown — trough reached ${extra}`,
  },
};

const SPORT_COLORS: Record<SportsCard['sport'], string> = {
  baseball: 'text-sky-600',
  basketball: 'text-orange-600',
  football: 'text-emerald-600',
  hockey: 'text-cyan-600',
};

const SPORT_LABELS: Record<SportsCard['sport'], string> = {
  baseball: 'MLB',
  basketball: 'NBA',
  football: 'NFL',
  hockey: 'NHL',
};

interface Evt {
  id: string;
  ts: number;
  card: SportsCard;
  tier: TierId;
  milestone: MilestoneType;
  crossPrice: number;
  narrative: string;
  valueFmv: number;
}

function parseValue(raw: string): number {
  if (!raw) return 0;
  const m = raw.replace(/,/g, '').match(/\$([0-9]+(?:\.[0-9]+)?)/);
  return m ? parseFloat(m[1]) : 0;
}

function fmt(n: number): string {
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 10_000) return '$' + (n / 1000).toFixed(0) + 'K';
  if (n >= 1000) return '$' + (n / 1000).toFixed(1) + 'K';
  return '$' + Math.round(n).toLocaleString('en-US');
}

function sinceStr(ts: number): string {
  const sec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (sec < 60) return `${sec}s ago`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  return `${Math.floor(sec / 3600)}h ago`;
}

function weightedPick<T>(arr: T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < arr.length; i++) {
    r -= weights[i];
    if (r <= 0) return arr[i];
  }
  return arr[arr.length - 1];
}

function pickMilestone(): MilestoneType {
  const keys = Object.keys(MILESTONES) as MilestoneType[];
  const weights = keys.map((k) => MILESTONES[k].weight);
  return weightedPick(keys, weights);
}

function pickTier(cardFmv: number): TierId {
  // Card can only break a ceiling it's near. Eligible = thresholds within [0.6, 1.4]x FMV.
  const eligible = TIERS.filter((t) => t.threshold >= cardFmv * 0.6 && t.threshold <= cardFmv * 1.4);
  if (eligible.length === 0) {
    // Clamp to the closest tier by absolute log-distance
    let closest = TIERS[0];
    let bestD = Infinity;
    for (const t of TIERS) {
      const d = Math.abs(Math.log(t.threshold) - Math.log(Math.max(cardFmv, 1)));
      if (d < bestD) {
        bestD = d;
        closest = t;
      }
    }
    return closest.id;
  }
  const weights = eligible.map((t) => 1 / Math.abs(Math.log(t.threshold) - Math.log(Math.max(cardFmv, 1)) + 0.1));
  return weightedPick(eligible, weights).id;
}

function buildEvent(pool: SportsCard[], tick: number): Evt | null {
  if (pool.length === 0) return null;
  // Log-weight card selection toward higher values
  const weights = pool.map((c) => Math.log(Math.max(parseValue(c.estimatedValueGem || c.estimatedValueRaw), 5)));
  const card = weightedPick(pool, weights);
  const fmv = parseValue(card.estimatedValueGem || card.estimatedValueRaw);
  if (fmv < 50) return null;
  const tier = pickTier(fmv);
  const tierMeta = TIERS.find((t) => t.id === tier)!;
  const milestone = pickMilestone();
  // Actual cross price: small premium above threshold, scaled by tier
  const premium = (tierMeta.threshold * (0.01 + Math.random() * 0.05)).toFixed(tierMeta.threshold >= 1000 ? 0 : 2);
  const crossPrice = tierMeta.threshold + parseFloat(premium);
  // Build the narrative extra
  let extra = '';
  if (milestone === 'ath') {
    extra = fmt(tierMeta.threshold * (0.88 + Math.random() * 0.08));
  } else if (milestone === '12mo') {
    const monthsBack = 3 + Math.floor(Math.random() * 10);
    extra = `${fmt(tierMeta.threshold * (1.01 + Math.random() * 0.05))} ~${monthsBack}mo ago`;
  } else if (milestone === '7d') {
    extra = fmt(tierMeta.threshold * (0.94 + Math.random() * 0.04));
  } else {
    const depth = 1 - (0.5 + Math.random() * 0.3);
    extra = `${fmt(tierMeta.threshold * depth)} (${Math.round((1 - depth) * 100)}% drawdown)`;
  }
  const narrative = MILESTONES[milestone].narrative(fmt(tierMeta.threshold), extra);
  return {
    id: `${card.slug}-${tier}-${tick}-${Math.random().toString(36).slice(2, 7)}`,
    ts: Date.now(),
    card,
    tier,
    milestone,
    crossPrice,
    narrative,
    valueFmv: fmv,
  };
}

export default function CeilingBreaksClient() {
  const [events, setEvents] = useState<Evt[]>([]);
  const [paused, setPaused] = useState(false);
  const [sport, setSport] = useState<SportFilter>('all');
  const [tierFloor, setTierFloor] = useState<TierId>('t500');
  const [msFilter, setMsFilter] = useState<MilestoneType | 'all'>('all');
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);
  const tickRef = useRef(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(WATCHLIST_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as string[];
        setWatchlist(new Set(parsed));
      }
    } catch {
      /* noop */
    }
    setHydrated(true);
  }, []);

  // Card pool filtered by sport + FMV threshold
  const pool = useMemo(() => {
    return (sportsCards as SportsCard[]).filter((c) => {
      if (sport !== 'all' && c.sport !== sport) return false;
      const v = parseValue(c.estimatedValueGem || c.estimatedValueRaw);
      return v >= 50;
    });
  }, [sport]);

  // Seed with a few initial events on load
  useEffect(() => {
    if (pool.length === 0) {
      setEvents([]);
      return;
    }
    const seed: Evt[] = [];
    for (let i = 0; i < 8; i++) {
      const e = buildEvent(pool, i);
      if (e) {
        e.ts = Date.now() - (8 - i) * 1000 * (20 + Math.random() * 40);
        seed.push(e);
      }
    }
    setEvents(seed.reverse());
  }, [pool]);

  // Live feed
  useEffect(() => {
    if (paused || pool.length === 0) {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    intervalRef.current = window.setInterval(() => {
      tickRef.current += 1;
      const e = buildEvent(pool, tickRef.current);
      if (!e) return;
      setEvents((prev) => [e, ...prev].slice(0, MAX_EVENTS));
    }, TICK_MS);
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [paused, pool]);

  const toggleWatch = useCallback((slug: string) => {
    setWatchlist((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      try {
        localStorage.setItem(WATCHLIST_KEY, JSON.stringify(Array.from(next)));
      } catch {
        /* noop */
      }
      return next;
    });
  }, []);

  const tierFloorIdx = TIERS.findIndex((t) => t.id === tierFloor);

  const visibleEvents = useMemo(() => {
    return events.filter((e) => {
      const eTierIdx = TIERS.findIndex((t) => t.id === e.tier);
      if (eTierIdx < tierFloorIdx) return false;
      if (msFilter !== 'all' && e.milestone !== msFilter) return false;
      return true;
    });
  }, [events, tierFloorIdx, msFilter]);

  const watchedEvents = useMemo(
    () => events.filter((e) => watchlist.has(e.card.slug)).slice(0, 10),
    [events, watchlist],
  );

  const stats = useMemo(() => {
    const total = visibleEvents.length;
    const ath = visibleEvents.filter((e) => e.milestone === 'ath').length;
    const kPlus = visibleEvents.filter((e) => e.valueFmv >= 1000).length;
    const tenKPlus = visibleEvents.filter((e) => e.valueFmv >= 10000).length;
    return { total, ath, kPlus, tenKPlus };
  }, [visibleEvents]);

  return (
    <section className="space-y-4">
      {/* Filter rail */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-lg border border-fuchsia-300 overflow-hidden text-sm">
          {(['all', 'baseball', 'basketball', 'football', 'hockey'] as SportFilter[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSport(s)}
              className={`px-2.5 py-1.5 capitalize ${
                sport === s ? 'bg-fuchsia-600 text-white' : 'bg-white text-fuchsia-700 hover:bg-fuchsia-50'
              }`}
            >
              {s === 'all' ? 'All sports' : s === 'baseball' ? 'MLB' : s === 'basketball' ? 'NBA' : s === 'football' ? 'NFL' : 'NHL'}
            </button>
          ))}
        </div>

        <div className="inline-flex items-center gap-1 flex-wrap">
          <span className="text-xs text-gray-500 uppercase tracking-wider mr-1">Floor</span>
          {TIERS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTierFloor(t.id)}
              className={`px-2 py-1 text-xs rounded border ${
                tierFloor === t.id
                  ? 'bg-pink-600 text-white border-pink-600'
                  : 'bg-white text-pink-700 border-pink-200 hover:bg-pink-50'
              }`}
            >
              {t.threshold >= 1000 ? `$${t.threshold / 1000}K` : `$${t.threshold}`}+
            </button>
          ))}
        </div>

        <div className="inline-flex rounded-lg border border-rose-300 overflow-hidden text-xs">
          {(['all', 'ath', '12mo', '7d', 'recovery'] as (MilestoneType | 'all')[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMsFilter(m)}
              className={`px-2.5 py-1.5 ${
                msFilter === m ? 'bg-rose-600 text-white' : 'bg-white text-rose-700 hover:bg-rose-50'
              }`}
            >
              {m === 'all'
                ? 'All types'
                : m === 'ath'
                  ? 'ATH'
                  : m === '12mo'
                    ? '12M'
                    : m === '7d'
                      ? '7D'
                      : 'Recovery'}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          className={`px-3 py-1.5 text-sm rounded-lg border ${
            paused
              ? 'bg-rose-100 text-rose-800 border-rose-400'
              : 'bg-white text-fuchsia-700 border-fuchsia-200 hover:bg-fuchsia-50'
          }`}
        >
          {paused ? '▶ Resume' : '⏸ Pause'}
        </button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="bg-white rounded-lg border border-fuchsia-200 p-2.5">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider">Events</div>
          <div className="text-xl font-bold text-fuchsia-700">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg border border-amber-200 p-2.5">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider">ATHs</div>
          <div className="text-xl font-bold text-amber-700">{stats.ath}</div>
        </div>
        <div className="bg-white rounded-lg border border-sky-200 p-2.5">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider">$1K+ cards</div>
          <div className="text-xl font-bold text-sky-700">{stats.kPlus}</div>
        </div>
        <div className="bg-white rounded-lg border border-rose-200 p-2.5">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider">$10K+ cards</div>
          <div className="text-xl font-bold text-rose-700">{stats.tenKPlus}</div>
        </div>
      </div>

      {/* Watchlist panel */}
      {hydrated && watchlist.size > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <div className="text-xs uppercase tracking-wider text-amber-800 mb-2 font-semibold">
            ★ Your watchlist ({watchlist.size})
          </div>
          {watchedEvents.length === 0 ? (
            <div className="text-xs text-gray-600 italic">
              Watching {watchlist.size} card{watchlist.size === 1 ? '' : 's'} — no ceiling breaks in the current feed. Events show here when watched cards cross a threshold.
            </div>
          ) : (
            <div className="space-y-1.5">
              {watchedEvents.map((e) => {
                const tierMeta = TIERS.find((t) => t.id === e.tier)!;
                const msMeta = MILESTONES[e.milestone];
                return (
                  <div key={e.id} className="text-xs bg-white rounded px-2.5 py-1.5 flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${msMeta.badge}`}>
                      {msMeta.short}
                    </span>
                    <span className="font-semibold text-gray-800 truncate flex-1">
                      {e.card.player} <span className="text-gray-500 font-normal">{e.card.year} {e.card.set}</span>
                    </span>
                    <span className={`font-bold ${tierMeta.color}`}>{fmt(e.crossPrice)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Main feed */}
      <div className="space-y-2">
        {visibleEvents.length === 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center text-sm text-gray-500">
            No events match the current filters. Lower the tier floor or change the milestone type.
          </div>
        )}
        {visibleEvents.map((e) => {
          const tierMeta = TIERS.find((t) => t.id === e.tier)!;
          const msMeta = MILESTONES[e.milestone];
          const isWatched = watchlist.has(e.card.slug);
          return (
            <div
              key={e.id}
              className={`bg-white border rounded-xl p-3 flex items-center gap-3 transition-all ${tierMeta.border} hover:shadow-sm`}
            >
              <div className={`text-3xl flex-shrink-0`} aria-hidden>
                {tierMeta.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${msMeta.badge}`}>
                    {msMeta.short}
                  </span>
                  <span className={`text-xs font-semibold ${tierMeta.color}`}>{tierMeta.label}</span>
                  <span className={`text-xs font-medium ${SPORT_COLORS[e.card.sport]}`}>
                    {SPORT_LABELS[e.card.sport]}
                  </span>
                  <span className="text-[11px] text-gray-400">· {e.card.year}</span>
                </div>
                <div className="font-semibold text-gray-900 truncate">
                  {e.card.player} <span className="font-normal text-gray-600">— {e.card.set}</span>
                </div>
                <div className="text-xs text-gray-600 truncate">{e.narrative}</div>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <div className={`text-lg font-bold ${tierMeta.color}`}>{fmt(e.crossPrice)}</div>
                <div className="text-[10px] text-gray-400">{sinceStr(e.ts)}</div>
                <button
                  type="button"
                  onClick={() => toggleWatch(e.card.slug)}
                  className={`text-xs px-2 py-0.5 rounded border transition ${
                    isWatched
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-white text-amber-700 border-amber-200 hover:bg-amber-50'
                  }`}
                  aria-label={isWatched ? 'Remove from watchlist' : 'Add to watchlist'}
                >
                  {isWatched ? '★' : '☆'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-gray-500 italic">
        Simulated for educational purposes. Calibrated to realistic hobby patterns — frequency of ceiling breaks scales with value tier. Real-time ceiling detection requires hour-resolution price history across every slug in the database and is a long-term roadmap item.
      </p>
    </section>
  );
}
