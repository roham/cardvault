'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { sportsCards } from '@/data/sports-cards';

/* ─── Types ────────────────────────────────────────── */
type ContextKey = 'hammer' | 'sale' | 'trade' | 'pull' | 'mailday';
type Sport = 'baseball' | 'basketball' | 'football' | 'hockey';
type SportFilter = 'all' | Sport;
type ValueFloor = 1000 | 5000 | 10000 | 50000;
type Grader = 'PSA' | 'BGS' | 'CGC' | 'SGC' | 'TAG';
type Venue =
  | 'Goldin'
  | 'Heritage'
  | 'PWCC'
  | 'Lelands'
  | 'eBay Live'
  | 'Whatnot'
  | 'Fanatics Live'
  | 'Sotheby\u2019s';

interface CardLite {
  slug: string;
  player: string;
  year: number;
  sport: Sport;
  value: number;
  set: string;
  cardNumber: string;
}

interface Event {
  id: string;
  at: number; // ms timestamp (simulated)
  context: ContextKey;
  card: CardLite;
  price: number; // exact transaction price (may differ from FMV)
  note: string; // short context blurb (e.g., "Buyer premium incl.")
  source: string; // house/venue/persona string
  flair?: 'new-record' | 'grail' | 'bump'; // visual badge
}

/* ─── Constants ────────────────────────────────────── */
const CONTEXT_META: Record<ContextKey, { label: string; emoji: string; bg: string; border: string; text: string }> = {
  hammer: { label: 'Auction Hammer', emoji: '\u{1F528}', bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-900' },
  sale: { label: 'Private Sale', emoji: '\u{1F4B5}', bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-900' },
  trade: { label: 'Trade Package', emoji: '\u{1F504}', bg: 'bg-sky-50', border: 'border-sky-300', text: 'text-sky-900' },
  pull: { label: 'Break Pull', emoji: '\u{1F4E6}', bg: 'bg-rose-50', border: 'border-rose-300', text: 'text-rose-900' },
  mailday: { label: 'Mailday Return', emoji: '\u{1F4EC}', bg: 'bg-violet-50', border: 'border-violet-300', text: 'text-violet-900' },
};

const CONTEXT_KEYS: ContextKey[] = ['hammer', 'sale', 'trade', 'pull', 'mailday'];

const SPORT_EMOJI: Record<Sport, string> = {
  baseball: '\u26BE',
  basketball: '\u{1F3C0}',
  football: '\u{1F3C8}',
  hockey: '\u{1F3D2}',
};

const HOUSES: Venue[] = ['Goldin', 'Heritage', 'PWCC', 'Lelands', 'Sotheby\u2019s'];
const P2P_VENUES: Venue[] = ['eBay Live', 'Whatnot', 'Fanatics Live'];
const BREAK_HOSTS = ['Layton Sports Cards', 'Jaspy\u2019s', 'Huddle Breaks', 'Mojobreak', 'Leighton Sports', 'Backyard Breaks'];
const GRADERS: Grader[] = ['PSA', 'BGS', 'CGC', 'SGC', 'TAG'];
const TRADERS = [
  'Marcus (flipper)',
  'Kai (investor)',
  'Tony (dealer)',
  'Dave (returning dad)',
  'Mia (completionist)',
  'Private collector',
  'East-coast dealer',
  'West-coast dealer',
  'Overseas syndicate',
];

const HAMMER_NOTES = [
  'Buyer premium 20% included',
  'Sniped in last 4 seconds',
  'Bidding war, 22 bids',
  'Reserve met in final minute',
  'Shill review flagged, hammer cleared',
  '12 bidders over $1K',
];
const SALE_NOTES = [
  'Off-market, no fees',
  'Listed and sold in 42 minutes',
  'Dealer-to-collector',
  'Repeat buyer',
  'Instagram DM close',
  'Memo-offer accepted',
];
const TRADE_NOTES = [
  'Part of 6-card package',
  'Straight trade, no boot',
  '3-for-1 swap',
  'Even-up minus $200 boot',
  'Shop-floor walk-in trade',
];
const PULL_NOTES = [
  'Live hit, 80+ viewers',
  'Case break, 2 boxes in',
  'Random team, landed on buyer',
  'PYT slot #3 hit',
  'Hit draft #1 selection',
];
const MAILDAY_NOTES = [
  'Crossed up one grade',
  'Held grade on crossover',
  'Returned from bulk sub',
  'Walk-through 5-day',
  'Express 2-day return',
  'Regrade came back higher',
];

const STORAGE_KEY = 'cv_grail_watch_v1';
const POLL_MS = 5800;
const HIGH_FREQ_POLL_MS = 3500; // when all filters active

/* ─── Helpers ──────────────────────────────────────── */
function parseValue(s: string | undefined): number {
  if (!s) return 0;
  const cleaned = s.replace(/[$,]/g, '').trim();
  if (cleaned.includes('-')) {
    const parts = cleaned.split('-').map((p) => parseFloat(p));
    if (parts.every((p) => !isNaN(p))) return (parts[0] + parts[1]) / 2;
  }
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

function fmtUSD(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return `$${Math.round(n).toLocaleString('en-US')}`;
}

function fmtAgo(tsMs: number): string {
  const secs = Math.max(1, Math.round((Date.now() - tsMs) / 1000));
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  return `${Math.floor(secs / 3600)}h ago`;
}

function choice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function weighted<T>(items: { item: T; weight: number }[]): T {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let r = Math.random() * total;
  for (const { item, weight } of items) {
    r -= weight;
    if (r <= 0) return item;
  }
  return items[items.length - 1].item;
}

function randomPriceForCard(fmv: number, context: ContextKey): { price: number; flair?: 'new-record' | 'grail' | 'bump' } {
  let multiplier = 1;
  switch (context) {
    case 'hammer':
      multiplier = 0.85 + Math.random() * 0.55; // 0.85x - 1.40x FMV (buyer premium included)
      break;
    case 'sale':
      multiplier = 0.82 + Math.random() * 0.28; // 0.82x - 1.10x (no fees → seller can go slightly under)
      break;
    case 'trade':
      multiplier = 0.90 + Math.random() * 0.20; // 0.90x - 1.10x (peer valuation)
      break;
    case 'pull':
      multiplier = 0.95 + Math.random() * 0.20; // 0.95x - 1.15x (book value claim)
      break;
    case 'mailday':
      multiplier = 0.95 + Math.random() * 0.25; // 0.95x - 1.20x (grade updates reflected)
      break;
  }
  const price = Math.max(1000, Math.round(fmv * multiplier));
  let flair: 'new-record' | 'grail' | 'bump' | undefined;
  if (multiplier > 1.3) flair = 'new-record';
  else if (price >= 10_000) flair = 'grail';
  else if (multiplier > 1.1) flair = 'bump';
  return { price, flair };
}

function buildSource(context: ContextKey): string {
  switch (context) {
    case 'hammer': return choice(HOUSES);
    case 'sale': return choice(P2P_VENUES);
    case 'trade': return `${choice(TRADERS)} \u2194 ${choice(TRADERS)}`;
    case 'pull': return choice(BREAK_HOSTS);
    case 'mailday': return `${choice(GRADERS)} return`;
  }
}

function noteFor(context: ContextKey): string {
  switch (context) {
    case 'hammer': return choice(HAMMER_NOTES);
    case 'sale': return choice(SALE_NOTES);
    case 'trade': return choice(TRADE_NOTES);
    case 'pull': return choice(PULL_NOTES);
    case 'mailday': return choice(MAILDAY_NOTES);
  }
}

function contextWeightsByValue(value: number): { item: ContextKey; weight: number }[] {
  if (value >= 50_000) {
    return [
      { item: 'hammer', weight: 55 },
      { item: 'sale', weight: 25 },
      { item: 'trade', weight: 8 },
      { item: 'mailday', weight: 10 },
      { item: 'pull', weight: 2 },
    ];
  }
  if (value >= 10_000) {
    return [
      { item: 'hammer', weight: 38 },
      { item: 'sale', weight: 28 },
      { item: 'trade', weight: 12 },
      { item: 'mailday', weight: 14 },
      { item: 'pull', weight: 8 },
    ];
  }
  return [
    { item: 'hammer', weight: 25 },
    { item: 'sale', weight: 25 },
    { item: 'trade', weight: 15 },
    { item: 'mailday', weight: 20 },
    { item: 'pull', weight: 15 },
  ];
}

/* ─── Component ────────────────────────────────────── */
export default function GrailWatchClient() {
  const [events, setEvents] = useState<Event[]>([]);
  const [valueFloor, setValueFloor] = useState<ValueFloor>(1000);
  const [sportFilter, setSportFilter] = useState<SportFilter>('all');
  const [contexts, setContexts] = useState<Record<ContextKey, boolean>>({
    hammer: true,
    sale: true,
    trade: true,
    pull: true,
    mailday: true,
  });
  const [paused, setPaused] = useState(false);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalDollars: 0,
    biggestSeen: 0,
    sessionStart: Date.now(),
  });
  const filtersRef = useRef({ valueFloor, sportFilter, contexts });
  filtersRef.current = { valueFloor, sportFilter, contexts };

  // Build value-tiered pool from card DB
  const valuedPool = useMemo(() => {
    const pool: CardLite[] = [];
    (sportsCards as unknown as Array<Record<string, unknown>>).forEach((c) => {
      const rawStr = (c.estimatedValueRaw as string) || '';
      const gemStr = (c.estimatedValueGem as string) || '';
      const raw = parseValue(rawStr);
      const gem = parseValue(gemStr);
      const v = Math.max(raw, gem);
      if (v < 1000) return;
      pool.push({
        slug: (c.slug as string) || '',
        player: (c.player as string) || '',
        year: (c.year as number) || 2020,
        sport: (c.sport as Sport) || 'baseball',
        value: v,
        set: (c.set as string) || '',
        cardNumber: (c.cardNumber as string) || '',
      });
    });
    return pool;
  }, []);

  // Load watchlist from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.watchlist)) setWatchlist(parsed.watchlist);
      }
    } catch {
      /* noop */
    }
  }, []);

  // Save watchlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ watchlist }));
    } catch {
      /* noop */
    }
  }, [watchlist]);

  // Generate an event respecting current filters
  const generateEvent = useCallback((): Event | null => {
    const f = filtersRef.current;
    const activeContexts = CONTEXT_KEYS.filter((k) => f.contexts[k]);
    if (activeContexts.length === 0) return null;

    // Build pool filtered by value floor + sport
    const pool = valuedPool.filter((c) => {
      if (c.value < f.valueFloor) return false;
      if (f.sportFilter !== 'all' && c.sport !== f.sportFilter) return false;
      return true;
    });
    if (pool.length === 0) return null;

    // Weighted pick: higher-value cards slightly more likely (log scaling)
    const weights = pool.map((c) => ({
      item: c,
      weight: Math.max(1, Math.log10(c.value + 1) * 10),
    }));
    const card = weighted(weights);

    // Pick context by value tier
    const ctxWeights = contextWeightsByValue(card.value).filter((w) =>
      activeContexts.includes(w.item),
    );
    if (ctxWeights.length === 0) return null;
    const context = weighted(ctxWeights);

    const { price, flair } = randomPriceForCard(card.value, context);

    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      at: Date.now(),
      context,
      card,
      price,
      note: noteFor(context),
      source: buildSource(context),
      flair,
    };
  }, [valuedPool]);

  // Seed initial feed
  useEffect(() => {
    const seed: Event[] = [];
    for (let i = 0; i < 6; i++) {
      const ev = generateEvent();
      if (ev) {
        // backdate seed events so they feel "just happened"
        ev.at = Date.now() - (6 - i) * 7000;
        seed.push(ev);
      }
    }
    setEvents(seed.reverse());
    setStats((s) => ({
      ...s,
      totalEvents: seed.length,
      totalDollars: seed.reduce((t, e) => t + e.price, 0),
      biggestSeen: seed.reduce((m, e) => Math.max(m, e.price), 0),
    }));
  }, [generateEvent]);

  // Live event generator loop
  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      const ev = generateEvent();
      if (!ev) return;
      setEvents((prev) => [ev, ...prev].slice(0, 40));
      setStats((s) => ({
        ...s,
        totalEvents: s.totalEvents + 1,
        totalDollars: s.totalDollars + ev.price,
        biggestSeen: Math.max(s.biggestSeen, ev.price),
      }));
    }, valueFloor >= 10000 ? HIGH_FREQ_POLL_MS : POLL_MS);
    return () => clearInterval(interval);
  }, [paused, valueFloor, generateEvent]);

  const toggleContext = (k: ContextKey) => {
    setContexts((prev) => ({ ...prev, [k]: !prev[k] }));
  };

  const toggleWatch = (slug: string) => {
    setWatchlist((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [slug, ...prev].slice(0, 20),
    );
  };

  const watchedEvents = events.filter((e) => watchlist.includes(e.card.slug));

  const sessionMins = Math.max(1, Math.round((Date.now() - stats.sessionStart) / 60000));

  return (
    <div className="space-y-5">
      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 rounded-lg bg-gradient-to-br from-amber-100 to-yellow-100 border border-amber-300">
          <div className="text-[10px] uppercase tracking-wider text-amber-800 font-semibold">Events</div>
          <div className="text-2xl font-bold text-amber-900">{stats.totalEvents}</div>
          <div className="text-xs text-amber-700">this session</div>
        </div>
        <div className="p-3 rounded-lg bg-gradient-to-br from-emerald-100 to-green-100 border border-emerald-300">
          <div className="text-[10px] uppercase tracking-wider text-emerald-800 font-semibold">Volume</div>
          <div className="text-2xl font-bold text-emerald-900">{fmtUSD(stats.totalDollars)}</div>
          <div className="text-xs text-emerald-700">grail $ moved</div>
        </div>
        <div className="p-3 rounded-lg bg-gradient-to-br from-rose-100 to-pink-100 border border-rose-300">
          <div className="text-[10px] uppercase tracking-wider text-rose-800 font-semibold">Biggest</div>
          <div className="text-2xl font-bold text-rose-900">{fmtUSD(stats.biggestSeen)}</div>
          <div className="text-xs text-rose-700">top hammer</div>
        </div>
        <div className="p-3 rounded-lg bg-gradient-to-br from-violet-100 to-purple-100 border border-violet-300">
          <div className="text-[10px] uppercase tracking-wider text-violet-800 font-semibold">Session</div>
          <div className="text-2xl font-bold text-violet-900">{sessionMins}m</div>
          <div className="text-xs text-violet-700">{Math.round(stats.totalEvents / sessionMins)} ev/min</div>
        </div>
      </div>

      {/* Filters rail */}
      <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm space-y-3">
        <div>
          <div className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Value floor</div>
          <div className="flex flex-wrap gap-1.5">
            {[1000, 5000, 10000, 50000].map((v) => (
              <button
                key={v}
                onClick={() => setValueFloor(v as ValueFloor)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition ${
                  valueFloor === v
                    ? 'border-amber-500 bg-amber-100 text-amber-900'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-amber-300'
                }`}
              >
                {v === 1000 ? '$1K+' : v === 5000 ? '$5K+' : v === 10000 ? '$10K+' : '$50K+'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Contexts</div>
          <div className="flex flex-wrap gap-1.5">
            {CONTEXT_KEYS.map((k) => (
              <button
                key={k}
                onClick={() => toggleContext(k)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition inline-flex items-center gap-1 ${
                  contexts[k]
                    ? `${CONTEXT_META[k].border} ${CONTEXT_META[k].bg} ${CONTEXT_META[k].text}`
                    : 'border-gray-200 bg-gray-50 text-gray-400 line-through'
                }`}
              >
                <span>{CONTEXT_META[k].emoji}</span>
                <span>{CONTEXT_META[k].label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Sport</div>
            <div className="flex flex-wrap gap-1.5">
              {(['all', 'baseball', 'basketball', 'football', 'hockey'] as SportFilter[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSportFilter(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition ${
                    sportFilter === s
                      ? 'border-amber-500 bg-amber-100 text-amber-900'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-amber-300'
                  }`}
                >
                  {s === 'all' ? 'All' : `${SPORT_EMOJI[s]} ${s}`}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => setPaused((p) => !p)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold border-2 transition ${
              paused
                ? 'border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'border-emerald-500 bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
            }`}
          >
            {paused ? '\u25B6 Resume' : '\u23F8 Pause'}
          </button>
        </div>
      </div>

      {/* Watchlist panel */}
      {watchlist.length > 0 && (
        <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-amber-300">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-amber-900">
              ⭐ Watchlist ({watchlist.length}) — {watchedEvents.length} recent event
              {watchedEvents.length === 1 ? '' : 's'}
            </h3>
            <button
              onClick={() => setWatchlist([])}
              className="text-xs text-amber-700 hover:text-amber-900 underline"
            >
              Clear
            </button>
          </div>
          {watchedEvents.length === 0 ? (
            <p className="text-xs text-amber-800 italic">
              No events from your watchlist yet. Events with starred slugs will appear here.
            </p>
          ) : (
            <div className="space-y-1.5">
              {watchedEvents.slice(0, 5).map((e) => (
                <div key={e.id} className="text-xs p-2 rounded bg-white border border-amber-200">
                  <span className="font-semibold">{e.card.player}</span> —{' '}
                  {CONTEXT_META[e.context].label} — <strong>{fmtUSD(e.price)}</strong>{' '}
                  <span className="text-gray-500">({fmtAgo(e.at)})</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Live feed */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-800">Live Feed</h2>
          {!paused && (
            <div className="inline-flex items-center gap-1.5 text-xs text-amber-600">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span className="font-semibold">LIVE</span>
            </div>
          )}
        </div>
        {events.length === 0 ? (
          <div className="p-8 rounded-xl bg-gray-50 border border-gray-200 text-center text-gray-500 text-sm">
            No events matching your filters. Try lowering the value floor or enabling more contexts.
          </div>
        ) : (
          <ol className="space-y-2">
            {events.map((e) => {
              const meta = CONTEXT_META[e.context];
              const isWatched = watchlist.includes(e.card.slug);
              return (
                <li
                  key={e.id}
                  className={`p-3 rounded-lg border-l-4 ${meta.border} ${meta.bg} shadow-sm`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${meta.text} px-1.5 py-0.5 rounded bg-white/60`}>
                          {meta.emoji} {meta.label}
                        </span>
                        {e.flair === 'new-record' && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-red-900 px-1.5 py-0.5 rounded bg-red-200 animate-pulse">
                            🔥 over FMV
                          </span>
                        )}
                        {e.flair === 'grail' && e.price >= 10_000 && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 px-1.5 py-0.5 rounded bg-amber-200">
                            ✨ Grail
                          </span>
                        )}
                        <span className="text-[10px] text-gray-500">{fmtAgo(e.at)}</span>
                      </div>
                      <div className="font-semibold text-gray-900 text-sm truncate">
                        {SPORT_EMOJI[e.card.sport]} {e.card.year} {e.card.set} {e.card.player}
                        {e.card.cardNumber ? ` #${e.card.cardNumber}` : ''}
                      </div>
                      <div className="text-xs text-gray-600 mt-0.5">
                        <strong>{e.source}</strong> • {e.note}
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end shrink-0">
                      <div className="text-xl font-bold text-gray-900 leading-tight">
                        {fmtUSD(e.price)}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        FMV {fmtUSD(e.card.value)}
                      </div>
                      <button
                        onClick={() => toggleWatch(e.card.slug)}
                        className={`mt-1 text-xs px-2 py-0.5 rounded border transition ${
                          isWatched
                            ? 'border-amber-400 bg-amber-100 text-amber-900'
                            : 'border-gray-300 bg-white text-gray-500 hover:border-amber-300 hover:text-amber-700'
                        }`}
                        title={isWatched ? 'Remove from watchlist' : 'Add to watchlist'}
                      >
                        {isWatched ? '\u2605 Watching' : '\u2606 Watch'}
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      <p className="text-[11px] text-gray-400 italic text-center">
        Simulation — events generated from the 10,000-card database using value-tier-weighted sampling. Not a record of actual sales.
      </p>
    </div>
  );
}
