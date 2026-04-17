'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { sportsCards } from '@/data/sports-cards';

const WATCHLIST_KEY = 'cv_steal_watch_list_v1';
const MAX_EVENTS = 40;

type SportFilter = 'all' | 'baseball' | 'basketball' | 'football' | 'hockey';
type Venue = 'ebay' | 'whatnot' | 'fb-market' | 'mercari' | 'estate-auction' | 'goldin' | 'fanatics-collect' | 'offerup';
type TierId = 'light' | 'nice' | 'real' | 'heist' | 'blue';

interface Card {
  slug: string;
  player: string;
  year: number;
  set: string;
  sport: string;
  fmv: number;
}

interface Evt {
  id: string;
  ts: number;
  card: Card;
  venue: Venue;
  closePrice: number;
  discount: number; // 0..1
  tier: TierId;
}

const VENUE_META: Record<Venue, { label: string; color: string; pctOfVolume: number; stealBias: number }> = {
  'ebay':             { label: 'eBay',            color: 'text-blue-300',   pctOfVolume: 0.32, stealBias: 1.0 },
  'whatnot':          { label: 'Whatnot',         color: 'text-red-300',    pctOfVolume: 0.14, stealBias: 1.2 },
  'fb-market':        { label: 'FB Marketplace',  color: 'text-sky-300',    pctOfVolume: 0.12, stealBias: 1.8 },
  'mercari':          { label: 'Mercari',         color: 'text-orange-300', pctOfVolume: 0.08, stealBias: 1.3 },
  'estate-auction':   { label: 'Estate Auction',  color: 'text-amber-300',  pctOfVolume: 0.10, stealBias: 2.0 },
  'goldin':           { label: 'Goldin',          color: 'text-yellow-300', pctOfVolume: 0.08, stealBias: 0.3 },
  'fanatics-collect': { label: 'Fanatics',        color: 'text-fuchsia-300',pctOfVolume: 0.10, stealBias: 0.4 },
  'offerup':          { label: 'OfferUp',         color: 'text-emerald-300',pctOfVolume: 0.06, stealBias: 1.6 },
};

const TIERS: { id: TierId; label: string; min: number; max: number; color: string; border: string; emoji: string; flair: string }[] = [
  { id: 'light', label: 'Light Deal',     min: 0.10, max: 0.20, color: 'text-lime-300',   border: 'border-lime-700/40',   emoji: '🟢', flair: '' },
  { id: 'nice',  label: 'Nice Save',      min: 0.20, max: 0.35, color: 'text-emerald-300',border: 'border-emerald-600/50',emoji: '✅', flair: '' },
  { id: 'real',  label: 'Real Steal',     min: 0.35, max: 0.55, color: 'text-teal-300',   border: 'border-teal-500/60',   emoji: '💸', flair: 'STEAL' },
  { id: 'heist', label: 'Heist',          min: 0.55, max: 0.75, color: 'text-yellow-300', border: 'border-yellow-500/60', emoji: '🏴‍☠️', flair: 'HEIST' },
  { id: 'blue',  label: 'Once-in-a-Blue', min: 0.75, max: 0.92, color: 'text-sky-300',    border: 'border-sky-400/70',    emoji: '🌊', flair: 'GRAIL STEAL' },
];

function tierFor(discount: number): TierId {
  for (const t of TIERS) if (discount >= t.min && discount < t.max) return t.id;
  return 'blue';
}
function tierMeta(id: TierId) { return TIERS.find((t) => t.id === id)!; }

// Weight heavier toward smaller deals (realistic distribution)
const TIER_PROB: Record<TierId, number> = { light: 0.58, nice: 0.26, real: 0.11, heist: 0.04, blue: 0.01 };

function parsePrice(v: string): number {
  const cleaned = v.replace(/,/g, '');
  const m = cleaned.match(/\$([0-9]+(?:\.[0-9]+)?)/);
  return m ? parseFloat(m[1]) : 0;
}
function fmtCents(n: number): string {
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
  for (let i = 0; i < arr.length; i++) { r -= weights[i]; if (r <= 0) return arr[i]; }
  return arr[arr.length - 1];
}
function pickTier(): TierId {
  const ids = TIERS.map((t) => t.id);
  const weights = ids.map((id) => TIER_PROB[id]);
  return weightedPick(ids, weights);
}

export default function StealWatchClient() {
  const [events, setEvents] = useState<Evt[]>([]);
  const [paused, setPaused] = useState(false);
  const [sport, setSport] = useState<SportFilter>('all');
  const [minTier, setMinTier] = useState<TierId>('light');
  const [venueSet, setVenueSet] = useState<Set<Venue>>(() => new Set(Object.keys(VENUE_META) as Venue[]));
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);
  const [startTs] = useState<number>(Date.now());
  const intervalRef = useRef<number | null>(null);

  const pool = useMemo(() => {
    return sportsCards.reduce<Card[]>((acc, c) => {
      const fmv = parsePrice(c.estimatedValueRaw);
      if (fmv < 25) return acc;
      acc.push({ slug: c.slug, player: c.player, year: c.year, set: c.set, sport: c.sport, fmv });
      return acc;
    }, []);
  }, []);

  useEffect(() => {
    try { const raw = localStorage.getItem(WATCHLIST_KEY); if (raw) setWatchlist(new Set(JSON.parse(raw))); } catch {}
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(WATCHLIST_KEY, JSON.stringify(Array.from(watchlist))); } catch {}
  }, [watchlist, hydrated]);

  const filteredPool = useMemo(() => {
    return sport === 'all' ? pool : pool.filter((c) => c.sport === sport);
  }, [pool, sport]);

  function createEvent(): Evt | null {
    if (filteredPool.length === 0) return null;
    const card = filteredPool[Math.floor(Math.random() * filteredPool.length)];

    // Pick venue weighted by volume × steal bias toward visible tiers
    const venues = Object.keys(VENUE_META).filter((v) => venueSet.has(v as Venue)) as Venue[];
    if (!venues.length) return null;
    const venueWeights = venues.map((v) => VENUE_META[v].pctOfVolume * VENUE_META[v].stealBias);
    const venue = weightedPick(venues, venueWeights);

    const tier = pickTier();
    const tm = tierMeta(tier);
    const discount = tm.min + Math.random() * (tm.max - tm.min);
    // Perturb FMV slightly (real market noise)
    const noisyFmv = card.fmv * (0.9 + Math.random() * 0.2);
    const closePrice = Math.max(10, noisyFmv * (1 - discount));

    return {
      id: Math.random().toString(36).slice(2, 10),
      ts: Date.now(),
      card,
      venue,
      closePrice: Math.round(closePrice),
      discount,
      tier,
    };
  }

  useEffect(() => {
    if (paused) return;
    if (!hydrated) return;

    // Seed with 3 initial events
    if (events.length === 0) {
      const seed: Evt[] = [];
      for (let i = 0; i < 3; i++) {
        const e = createEvent();
        if (e) seed.push({ ...e, ts: Date.now() - i * 8000 });
      }
      setEvents(seed);
    }

    intervalRef.current = window.setInterval(() => {
      const e = createEvent();
      if (!e) return;
      setEvents((prev) => {
        const next = [e, ...prev];
        return next.slice(0, MAX_EVENTS);
      });
    }, 4200);

    return () => { if (intervalRef.current) window.clearInterval(intervalRef.current); };
  }, [paused, hydrated, sport, venueSet]);

  const minTierRank = TIERS.findIndex((t) => t.id === minTier);
  const visible = useMemo(() => {
    return events.filter((e) => {
      if (!venueSet.has(e.venue)) return false;
      const rank = TIERS.findIndex((t) => t.id === e.tier);
      return rank >= minTierRank;
    });
  }, [events, venueSet, minTierRank]);

  function toggleVenue(v: Venue) {
    setVenueSet((prev) => { const n = new Set(prev); if (n.has(v)) n.delete(v); else n.add(v); return n; });
  }
  function toggleWatch(slug: string) {
    setWatchlist((prev) => { const n = new Set(prev); if (n.has(slug)) n.delete(slug); else { if (n.size >= 20) return prev; n.add(slug); } return n; });
  }
  function clearAll() { setEvents([]); }

  const totalVol = events.reduce((s, e) => s + e.closePrice, 0);
  const bigDeal = events.reduce<Evt | null>((best, e) => (!best || e.discount > best.discount ? e : best), null);
  const duration = Math.floor((Date.now() - startTs) / 1000);

  if (!hydrated) {
    return <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center text-gray-500 text-sm">Spinning up the feed&hellip;</div>;
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="rounded-2xl border border-lime-900/40 bg-lime-950/20 p-4 space-y-3">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[11px] text-lime-300 font-semibold uppercase tracking-wider">Min severity</span>
          {TIERS.map((t) => (
            <button
              key={t.id}
              onClick={() => setMinTier(t.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${minTier === t.id ? 'bg-lime-500 text-slate-900' : 'bg-slate-800 text-gray-400 hover:text-white'}`}
              title={`${(t.min * 100).toFixed(0)}-${(t.max * 100).toFixed(0)}% under FMV`}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[11px] text-lime-300 font-semibold uppercase tracking-wider">Sport</span>
          {(['all', 'baseball', 'basketball', 'football', 'hockey'] as SportFilter[]).map((s) => (
            <button key={s} onClick={() => setSport(s)} className={`px-2.5 py-1 rounded-md text-xs font-semibold capitalize ${sport === s ? 'bg-lime-500 text-slate-900' : 'bg-slate-800 text-gray-400 hover:text-white'}`}>
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[11px] text-lime-300 font-semibold uppercase tracking-wider">Venue</span>
          {(Object.keys(VENUE_META) as Venue[]).map((v) => (
            <button
              key={v}
              onClick={() => toggleVenue(v)}
              className={`px-2 py-1 rounded-md text-[11px] font-semibold ${venueSet.has(v) ? `bg-slate-700 ${VENUE_META[v].color}` : 'bg-slate-900 text-gray-600'}`}
            >
              {VENUE_META[v].label}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button onClick={() => setPaused((p) => !p)} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${paused ? 'bg-lime-500 text-slate-900' : 'bg-slate-800 text-lime-300'}`}>
              {paused ? '▶ Resume' : '⏸ Pause'}
            </button>
            <button onClick={clearAll} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-gray-400 hover:text-white">Clear</button>
          </div>
          <div className="flex gap-3 text-[11px] text-gray-400">
            <span>Events <span className="text-white font-semibold">{events.length}</span></span>
            <span>Volume <span className="text-lime-300 font-semibold">{fmtCents(totalVol)}</span></span>
            <span>Best <span className="text-yellow-300 font-semibold">{bigDeal ? `-${(bigDeal.discount * 100).toFixed(0)}%` : '—'}</span></span>
            <span>Up <span className="text-white font-semibold">{Math.floor(duration / 60)}m{duration % 60}s</span></span>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-2">
        {visible.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-8 text-center text-gray-500 text-sm">
            {paused ? 'Feed paused.' : 'Waiting for the next steal to close...'}
          </div>
        ) : (
          visible.map((e, i) => {
            const tm = tierMeta(e.tier);
            const v = VENUE_META[e.venue];
            const watched = watchlist.has(e.card.slug);
            const fmv = e.card.fmv;
            const savings = Math.max(0, fmv - e.closePrice);
            return (
              <div
                key={e.id}
                className={`rounded-xl border bg-slate-900/50 p-3 sm:p-4 flex items-start gap-3 ${tm.border} ${i === 0 && !paused ? 'animate-[pulse_2s_ease-in-out_1]' : ''}`}
              >
                <div className="shrink-0 w-12 sm:w-16 text-center">
                  <div className={`text-2xl sm:text-3xl ${tm.color}`}>{tm.emoji}</div>
                  <div className={`text-[10px] font-black mt-0.5 ${tm.color}`}>-{(e.discount * 100).toFixed(0)}%</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white font-bold text-sm sm:text-base truncate">
                      {e.card.year} {e.card.set} {e.card.player.split(' ').slice(-1)[0]}
                    </span>
                    {tm.flair && <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${tm.color} border ${tm.border} bg-slate-950/60`}>{tm.flair}</span>}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-2 flex-wrap">
                    <span>closed on <span className={`font-semibold ${v.color}`}>{v.label}</span></span>
                    <span>&middot;</span>
                    <span>FMV {fmtCents(fmv)}</span>
                    <span>&middot;</span>
                    <span className="text-white">sold {fmtCents(e.closePrice)}</span>
                    <span>&middot;</span>
                    <span className={tm.color}>save {fmtCents(savings)}</span>
                  </div>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-1">
                  <span className="text-[10px] text-gray-500">{sinceStr(e.ts)}</span>
                  <button
                    onClick={() => toggleWatch(e.card.slug)}
                    className={`text-[11px] px-2 py-0.5 rounded ${watched ? 'bg-lime-500 text-slate-900 font-bold' : 'bg-slate-800 text-gray-400 hover:text-lime-300'}`}
                    title={watched ? 'Remove from watchlist' : 'Add to watchlist'}
                  >
                    {watched ? '✓ Watched' : '+ Watch'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="text-[11px] text-gray-500 text-center">
        Simulated feed calibrated to documented hobby patterns. Event frequency: Light ~58%, Nice ~26%, Real ~11%, Heist ~4%, Once-in-a-Blue ~1%. Watchlist stores up to 20 card slugs locally. New event every 4.2s while active.
      </div>
    </div>
  );
}
