'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { sportsCards } from '@/data/sports-cards';

/* ─── Types ────────────────────────────────────────── */
type ContextKey = 'hammer' | 'private' | 'show' | 'registry' | 'institutional';
type Sport = 'baseball' | 'basketball' | 'football' | 'hockey';
type SportFilter = 'all' | Sport;
type EraBand = 'all' | 'prewar' | 'golden' | 'seventies';
type ValueFloor = 1000 | 5000 | 25000 | 100000;

interface CardLite {
  slug: string;
  player: string;
  year: number;
  sport: Sport;
  value: number;
  set: string;
  cardNumber: string;
  era: Exclude<EraBand, 'all'>;
}

interface VintageEvent {
  id: string;
  at: number;
  context: ContextKey;
  card: CardLite;
  price: number;
  grade?: string; // "PSA 7", "SGC 6.5", or "Raw"
  note: string;
  source: string;
  flair?: 'record' | 'museum' | 'premium';
}

/* ─── Constants ────────────────────────────────────── */
const CONTEXT_META: Record<ContextKey, { label: string; emoji: string; bg: string; border: string; text: string }> = {
  hammer: { label: 'Auction Hammer', emoji: '\u{1F528}', bg: 'bg-amber-50', border: 'border-amber-700', text: 'text-amber-900' },
  private: { label: 'Private Sale', emoji: '\u{1F91D}', bg: 'bg-stone-50', border: 'border-stone-600', text: 'text-stone-900' },
  show: { label: 'Show Deal', emoji: '\u{1F3EA}', bg: 'bg-orange-50', border: 'border-orange-700', text: 'text-orange-900' },
  registry: { label: 'Registry Move', emoji: '\u{1F4CB}', bg: 'bg-yellow-50', border: 'border-yellow-700', text: 'text-yellow-900' },
  institutional: { label: 'Institutional', emoji: '\u{1F3DB}', bg: 'bg-neutral-50', border: 'border-neutral-600', text: 'text-neutral-900' },
};

const CONTEXT_KEYS: ContextKey[] = ['hammer', 'private', 'show', 'registry', 'institutional'];

const ERA_META: Record<Exclude<EraBand, 'all'>, { label: string; range: string; color: string }> = {
  prewar: { label: 'Pre-war', range: 'before 1946', color: 'amber-900' },
  golden: { label: 'Golden Age', range: '1946–1970', color: 'amber-700' },
  seventies: { label: '70s Vintage', range: '1971–1979', color: 'stone-600' },
};

const SPORT_EMOJI: Record<Sport, string> = {
  baseball: '\u26BE',
  basketball: '\u{1F3C0}',
  football: '\u{1F3C8}',
  hockey: '\u{1F3D2}',
};

const VINTAGE_HOUSES = [
  'Heritage Sports',
  'Robert Edward Auctions',
  'Goldin Vintage',
  'Memory Lane Inc.',
  'Huggins & Scott',
  'Mile High Card Co.',
  'Sterling Sports',
  'Love of the Game',
];

const PRIVATE_VENUES = [
  'Private dealer network',
  'Collector-to-collector',
  'eBay Live (BIN)',
  'Estate liquidation',
  'Advisor-brokered deal',
];

const SHOW_VENUES = [
  'The National (Chicago)',
  'Chantilly Show',
  'Dallas Card Show',
  'White Plains',
  'Hunt Auctions Live',
  'Philly Show',
  'Cincinnati',
  'Cleveland Sports Collectors',
];

const REGISTRY_SOURCES = [
  'PSA Set Registry',
  'SGC Registry',
  'PSA Master Set',
  'All-Time Greats Registry',
];

const INSTITUTIONAL_SOURCES = [
  'Cooperstown (Baseball HoF)',
  'Naismith HoF',
  'Pro Football HoF',
  'University archives',
  'Smithsonian Americana collection',
  'Private museum',
];

const VINTAGE_GRADERS = ['PSA', 'SGC', 'BVG'];

const HAMMER_NOTES = [
  'Buyer premium 20% included',
  '11 bidders crossed $10K',
  'Last-minute bidding war',
  'Reserve met with 4 minutes left',
  'Fresh-to-market consignment',
  'Centered example, premium paid',
  'Vintage lot of the night',
];
const PRIVATE_NOTES = [
  'Off-market, no premium',
  'Estate-to-collector, direct',
  'Network referral deal',
  'Repeat vintage buyer',
  'Dealer-to-dealer wholesale',
  'High-grade registry chaser',
];
const SHOW_NOTES = [
  'Saturday show-floor sale',
  'Dealer case sold to walk-in',
  'Cash deal, no paperwork',
  'Trade-plus-boot, VIP hour',
  'Showcase-to-sold in 45 minutes',
  'Table-3, Sunday afternoon',
];
const REGISTRY_NOTES = [
  'New #1 all-time slot',
  'Registry upgrade, crossed out lower grade',
  'Completed 100% set badge',
  'Top-5 set move, refreshed pops',
  'Vintage player registry leader',
];
const INSTITUTIONAL_NOTES = [
  'Accessioned for permanent display',
  'Long-term loan, 5-year rotation',
  'Archival preservation, non-display',
  'Named-collection gift',
  'Research-program acquisition',
];

const STORAGE_KEY = 'cv_vintage_wire_v1';
const POLL_MS = 6200;
const HIGH_FREQ_POLL_MS = 4000;

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

function eraOf(year: number): Exclude<EraBand, 'all'> {
  if (year <= 1945) return 'prewar';
  if (year <= 1970) return 'golden';
  return 'seventies';
}

function vintageGradeForCard(card: CardLite): string {
  // Pre-war and Golden Age rarely grade above PSA 8; 70s more common PSA 9
  const grader = choice(VINTAGE_GRADERS);
  if (card.era === 'prewar') {
    const pool = ['3', '4', '5', '6', '6.5', '7', '7.5', '8'];
    return `${grader} ${choice(pool)}`;
  }
  if (card.era === 'golden') {
    const pool = ['5', '6', '6.5', '7', '7.5', '8', '8.5', '9'];
    return `${grader} ${choice(pool)}`;
  }
  // seventies
  const pool = ['6', '7', '7.5', '8', '8.5', '9', '9.5', '10'];
  return `${grader} ${choice(pool)}`;
}

function priceMultiplierFor(context: ContextKey): { min: number; spread: number } {
  switch (context) {
    case 'hammer':      return { min: 0.90, spread: 0.60 }; // 0.90-1.50x (buyer premium included)
    case 'private':     return { min: 0.80, spread: 0.30 }; // 0.80-1.10x (no fees, dealer-discounted)
    case 'show':        return { min: 0.75, spread: 0.35 }; // 0.75-1.10x (cash-deal discount)
    case 'registry':    return { min: 1.00, spread: 0.35 }; // 1.00-1.35x (registry chaser premium)
    case 'institutional': return { min: 0.70, spread: 0.25 }; // 0.70-0.95x (donation-appraised)
  }
}

function buildSource(context: ContextKey): string {
  switch (context) {
    case 'hammer': return choice(VINTAGE_HOUSES);
    case 'private': return choice(PRIVATE_VENUES);
    case 'show': return choice(SHOW_VENUES);
    case 'registry': return choice(REGISTRY_SOURCES);
    case 'institutional': return choice(INSTITUTIONAL_SOURCES);
  }
}

function noteFor(context: ContextKey): string {
  switch (context) {
    case 'hammer': return choice(HAMMER_NOTES);
    case 'private': return choice(PRIVATE_NOTES);
    case 'show': return choice(SHOW_NOTES);
    case 'registry': return choice(REGISTRY_NOTES);
    case 'institutional': return choice(INSTITUTIONAL_NOTES);
  }
}

function contextWeightsByEra(era: Exclude<EraBand, 'all'>, value: number): { item: ContextKey; weight: number }[] {
  // Pre-war leans more auction-house / institutional (scarcity, provenance-driven)
  // Golden Age is more balanced
  // 70s skews toward show / private (dealer network still dominates sub-$10K)
  const baseline = {
    hammer: 30,
    private: 28,
    show: 22,
    registry: 12,
    institutional: 8,
  };
  const mult = (hammer: number, priv: number, show: number, reg: number, inst: number) => ({
    hammer: baseline.hammer * hammer,
    private: baseline.private * priv,
    show: baseline.show * show,
    registry: baseline.registry * reg,
    institutional: baseline.institutional * inst,
  });
  let w;
  if (era === 'prewar') w = mult(1.4, 0.9, 0.6, 0.9, 2.2);
  else if (era === 'golden') w = mult(1.1, 1.0, 1.0, 1.1, 0.9);
  else w = mult(0.8, 1.2, 1.5, 0.8, 0.4); // seventies
  // Institutional skews higher for $50K+ cards (museum-grade provenance)
  if (value >= 50_000) w.institutional *= 1.8;
  if (value >= 100_000) w.registry *= 1.4;
  return [
    { item: 'hammer', weight: w.hammer },
    { item: 'private', weight: w.private },
    { item: 'show', weight: w.show },
    { item: 'registry', weight: w.registry },
    { item: 'institutional', weight: w.institutional },
  ];
}

/* ─── Component ────────────────────────────────────── */
export default function VintageWireClient() {
  const [events, setEvents] = useState<VintageEvent[]>([]);
  const [valueFloor, setValueFloor] = useState<ValueFloor>(1000);
  const [sportFilter, setSportFilter] = useState<SportFilter>('all');
  const [eraFilter, setEraFilter] = useState<EraBand>('all');
  const [contexts, setContexts] = useState<Record<ContextKey, boolean>>({
    hammer: true,
    private: true,
    show: true,
    registry: true,
    institutional: true,
  });
  const [paused, setPaused] = useState(false);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalDollars: 0,
    biggestSeen: 0,
    sessionStart: Date.now(),
  });
  const filtersRef = useRef({ valueFloor, sportFilter, eraFilter, contexts });
  filtersRef.current = { valueFloor, sportFilter, eraFilter, contexts };

  // Build vintage pool: pre-1980, $1K+
  const vintagePool = useMemo(() => {
    const pool: CardLite[] = [];
    (sportsCards as unknown as Array<Record<string, unknown>>).forEach((c) => {
      const year = (c.year as number) || 0;
      if (year < 1900 || year >= 1980) return;
      const rawStr = (c.estimatedValueRaw as string) || '';
      const gemStr = (c.estimatedValueGem as string) || '';
      const raw = parseValue(rawStr);
      const gem = parseValue(gemStr);
      const v = Math.max(raw, gem);
      if (v < 1000) return;
      const sport = (c.sport as Sport) || 'baseball';
      pool.push({
        slug: (c.slug as string) || '',
        player: (c.player as string) || '',
        year,
        sport,
        value: v,
        set: (c.set as string) || '',
        cardNumber: (c.cardNumber as string) || '',
        era: eraOf(year),
      });
    });
    return pool;
  }, []);

  // Load watchlist
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

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ watchlist }));
    } catch {
      /* noop */
    }
  }, [watchlist]);

  const generateEvent = useCallback((): VintageEvent | null => {
    const f = filtersRef.current;
    const activeContexts = CONTEXT_KEYS.filter((k) => f.contexts[k]);
    if (activeContexts.length === 0) return null;

    const pool = vintagePool.filter((c) => {
      if (c.value < f.valueFloor) return false;
      if (f.sportFilter !== 'all' && c.sport !== f.sportFilter) return false;
      if (f.eraFilter !== 'all' && c.era !== f.eraFilter) return false;
      return true;
    });
    if (pool.length === 0) return null;

    // Log-weighted card pick (value bias)
    const weights = pool.map((c) => ({
      item: c,
      weight: Math.max(1, Math.log10(c.value + 1) * 10),
    }));
    const card = weighted(weights);

    const ctxWeights = contextWeightsByEra(card.era, card.value).filter((w) =>
      activeContexts.includes(w.item),
    );
    if (ctxWeights.length === 0) return null;
    const context = weighted(ctxWeights);

    const { min, spread } = priceMultiplierFor(context);
    const multiplier = min + Math.random() * spread;
    const price = Math.max(500, Math.round(card.value * multiplier));

    let flair: 'record' | 'museum' | 'premium' | undefined;
    if (multiplier > 1.35 && price >= 25_000) flair = 'record';
    else if (context === 'institutional') flair = 'museum';
    else if (multiplier > 1.15) flair = 'premium';

    const grade = context === 'institutional' || context === 'registry' || Math.random() > 0.25
      ? vintageGradeForCard(card)
      : 'Raw';

    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      at: Date.now(),
      context,
      card,
      price,
      grade,
      note: noteFor(context),
      source: buildSource(context),
      flair,
    };
  }, [vintagePool]);

  // Seed initial feed
  useEffect(() => {
    const seed: VintageEvent[] = [];
    for (let i = 0; i < 6; i++) {
      const ev = generateEvent();
      if (ev) {
        ev.at = Date.now() - (6 - i) * 9000;
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

  // Live loop
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
    }, valueFloor >= 25000 ? HIGH_FREQ_POLL_MS : POLL_MS);
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
        <div className="p-3 rounded-lg bg-gradient-to-br from-stone-100 to-amber-100 border border-stone-300">
          <div className="text-[10px] uppercase tracking-wider text-stone-800 font-semibold">Events</div>
          <div className="text-2xl font-bold text-stone-900">{stats.totalEvents}</div>
          <div className="text-xs text-stone-700">this session</div>
        </div>
        <div className="p-3 rounded-lg bg-gradient-to-br from-amber-100 to-yellow-100 border border-amber-300">
          <div className="text-[10px] uppercase tracking-wider text-amber-800 font-semibold">Volume</div>
          <div className="text-2xl font-bold text-amber-900">{fmtUSD(stats.totalDollars)}</div>
          <div className="text-xs text-amber-700">vintage $ moved</div>
        </div>
        <div className="p-3 rounded-lg bg-gradient-to-br from-orange-100 to-red-100 border border-orange-300">
          <div className="text-[10px] uppercase tracking-wider text-orange-800 font-semibold">Biggest</div>
          <div className="text-2xl font-bold text-orange-900">{fmtUSD(stats.biggestSeen)}</div>
          <div className="text-xs text-orange-700">top hammer</div>
        </div>
        <div className="p-3 rounded-lg bg-gradient-to-br from-neutral-100 to-stone-100 border border-neutral-300">
          <div className="text-[10px] uppercase tracking-wider text-neutral-800 font-semibold">Session</div>
          <div className="text-2xl font-bold text-neutral-900">{sessionMins}m</div>
          <div className="text-xs text-neutral-700">{Math.round(stats.totalEvents / sessionMins)} ev/min</div>
        </div>
      </div>

      {/* Filters rail */}
      <div className="p-4 rounded-xl bg-white border border-stone-300 shadow-sm space-y-3">
        <div>
          <div className="text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1.5">Era</div>
          <div className="flex flex-wrap gap-1.5">
            {(['all', 'prewar', 'golden', 'seventies'] as EraBand[]).map((e) => (
              <button
                key={e}
                onClick={() => setEraFilter(e)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition ${
                  eraFilter === e
                    ? 'border-stone-700 bg-stone-200 text-stone-900'
                    : 'border-stone-200 bg-white text-stone-600 hover:border-stone-400'
                }`}
              >
                {e === 'all' ? 'All eras' : `${ERA_META[e].label} (${ERA_META[e].range})`}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1.5">Value floor</div>
          <div className="flex flex-wrap gap-1.5">
            {[1000, 5000, 25000, 100000].map((v) => (
              <button
                key={v}
                onClick={() => setValueFloor(v as ValueFloor)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition ${
                  valueFloor === v
                    ? 'border-amber-700 bg-amber-100 text-amber-900'
                    : 'border-stone-200 bg-white text-stone-600 hover:border-amber-400'
                }`}
              >
                {v === 1000 ? '$1K+' : v === 5000 ? '$5K+' : v === 25000 ? '$25K+' : '$100K+'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1.5">Contexts</div>
          <div className="flex flex-wrap gap-1.5">
            {CONTEXT_KEYS.map((k) => (
              <button
                key={k}
                onClick={() => toggleContext(k)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition inline-flex items-center gap-1 ${
                  contexts[k]
                    ? `${CONTEXT_META[k].border} ${CONTEXT_META[k].bg} ${CONTEXT_META[k].text}`
                    : 'border-stone-200 bg-stone-50 text-stone-400 line-through'
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
            <div className="text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1.5">Sport</div>
            <div className="flex flex-wrap gap-1.5">
              {(['all', 'baseball', 'basketball', 'football', 'hockey'] as SportFilter[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSportFilter(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition ${
                    sportFilter === s
                      ? 'border-stone-700 bg-stone-200 text-stone-900'
                      : 'border-stone-200 bg-white text-stone-600 hover:border-stone-400'
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
                ? 'border-stone-300 bg-stone-100 text-stone-700 hover:bg-stone-200'
                : 'border-emerald-600 bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
            }`}
          >
            {paused ? '\u25B6 Resume' : '\u23F8 Pause'}
          </button>
        </div>
      </div>

      {/* Watchlist panel */}
      {watchlist.length > 0 && (
        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-stone-50 border-2 border-amber-400">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-amber-900">
              ⭐ Vintage Watchlist ({watchlist.length}) — {watchedEvents.length} recent event
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
              Starred cards appear here when their events hit the feed. Vintage cards move more slowly than modern — give it a few minutes.
            </p>
          ) : (
            <div className="space-y-1.5">
              {watchedEvents.slice(0, 5).map((e) => (
                <div key={e.id} className="text-xs p-2 rounded bg-white border border-amber-200">
                  <span className="font-semibold">{e.card.year} {e.card.player}</span> —{' '}
                  {CONTEXT_META[e.context].label} — <strong>{fmtUSD(e.price)}</strong>{' '}
                  {e.grade && e.grade !== 'Raw' ? <span className="text-stone-600">({e.grade})</span> : null}{' '}
                  <span className="text-stone-500">({fmtAgo(e.at)})</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Live feed */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-stone-800">Live Vintage Feed</h2>
          {!paused && (
            <div className="inline-flex items-center gap-1.5 text-xs text-amber-700">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span className="font-semibold">LIVE</span>
            </div>
          )}
        </div>
        {events.length === 0 ? (
          <div className="p-8 rounded-xl bg-stone-50 border border-stone-200 text-center text-stone-500 text-sm">
            No vintage events matching your filters. Try lowering the value floor, changing era, or enabling more contexts.
          </div>
        ) : (
          <ol className="space-y-2">
            {events.map((e) => {
              const meta = CONTEXT_META[e.context];
              const isWatched = watchlist.includes(e.card.slug);
              const eraMeta = ERA_META[e.card.era];
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
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-700 px-1.5 py-0.5 rounded bg-stone-200">
                          {eraMeta.label}
                        </span>
                        {e.flair === 'record' && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-red-900 px-1.5 py-0.5 rounded bg-red-200 animate-pulse">
                            🔥 big money
                          </span>
                        )}
                        {e.flair === 'museum' && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-900 px-1.5 py-0.5 rounded bg-neutral-200">
                            🏛️ museum
                          </span>
                        )}
                        {e.flair === 'premium' && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 px-1.5 py-0.5 rounded bg-amber-200">
                            ✨ premium
                          </span>
                        )}
                        <span className="text-[10px] text-stone-500">{fmtAgo(e.at)}</span>
                      </div>
                      <div className="font-semibold text-stone-900 text-sm truncate">
                        {SPORT_EMOJI[e.card.sport]} {e.card.year} {e.card.set} {e.card.player}
                        {e.card.cardNumber ? ` #${e.card.cardNumber}` : ''}
                        {e.grade ? <span className="ml-2 text-xs font-normal text-stone-600">[{e.grade}]</span> : null}
                      </div>
                      <div className="text-xs text-stone-600 mt-0.5">
                        <strong>{e.source}</strong> • {e.note}
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end shrink-0">
                      <div className="text-xl font-bold text-stone-900 leading-tight">
                        {fmtUSD(e.price)}
                      </div>
                      <div className="text-[10px] text-stone-500">
                        FMV {fmtUSD(e.card.value)}
                      </div>
                      <button
                        onClick={() => toggleWatch(e.card.slug)}
                        className={`mt-1 text-xs px-2 py-0.5 rounded border transition ${
                          isWatched
                            ? 'border-amber-500 bg-amber-100 text-amber-900'
                            : 'border-stone-300 bg-white text-stone-500 hover:border-amber-400 hover:text-amber-700'
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

      <p className="text-[11px] text-stone-500 italic text-center">
        Simulation — vintage events generated from the pre-1980 cohort of CardVault&apos;s card database with era-weighted context sampling. Not a record of actual historical sales.
      </p>
    </div>
  );
}
