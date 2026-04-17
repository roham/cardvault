'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { sportsCards } from '@/data/sports-cards';

const WATCHLIST_KEY = 'cv_consignment_drop_watch_v1';
const MAX_EVENTS = 40;

type House = 'pwcc' | 'goldin' | 'heritage' | 'rea' | 'lelands' | 'fanatics-collect';
type SportFilter = 'all' | 'baseball' | 'basketball' | 'football' | 'hockey';
type EstimateFloor = '100' | '500' | '1000' | '5000' | '25000';

interface Card { slug: string; player: string; year: number; set: string; sport: string; fmv: number; }

interface Evt {
  id: string;
  ts: number;
  card: Card;
  house: House;
  lotNumber: string;
  estimateLow: number;
  estimateHigh: number;
  blurb: string;
  daysToOpen: number;
}

const HOUSE_META: Record<House, { label: string; color: string; specialty: string; weightBias: (fmv: number) => number }> = {
  pwcc:              { label: 'PWCC',            color: 'text-blue-300',    specialty: 'Modern-dominant, weekly + premier auctions',
                       weightBias: (v) => v > 5000 ? 1.4 : v > 500 ? 1.0 : 0.6 },
  goldin:            { label: 'Goldin',          color: 'text-yellow-300',  specialty: 'High-end vintage + modern blue-chip',
                       weightBias: (v) => v > 5000 ? 1.8 : v > 1000 ? 1.1 : 0.3 },
  heritage:          { label: 'Heritage',        color: 'text-amber-300',   specialty: 'Vintage-focused, institutional-weight',
                       weightBias: (v) => v > 10000 ? 1.8 : v > 1000 ? 1.3 : 0.4 },
  rea:               { label: 'REA',             color: 'text-red-300',     specialty: 'Pre-war baseball specialist',
                       weightBias: (v) => v > 25000 ? 2.2 : v > 2500 ? 1.4 : 0.2 },
  lelands:           { label: 'Lelands',         color: 'text-orange-300',  specialty: 'Vintage memorabilia focus',
                       weightBias: (v) => v > 5000 ? 1.5 : v > 500 ? 0.9 : 0.4 },
  'fanatics-collect':{ label: 'Fanatics Collect',color: 'text-fuchsia-300', specialty: 'Newest major, Fanatics-integrated',
                       weightBias: (v) => v > 1000 ? 1.2 : v > 100 ? 0.9 : 0.7 },
};

const BLURBS_TEMPLATES: string[] = [
  'Pack-fresh rookie, tight corners with strong eye appeal across all four borders',
  'Vintage centering premium with a clean presentation and untouched surface',
  'Key-card target that has appeared at this house twice in the last five auctions',
  'Population-scarce at this grade tier; recent comps from similar condition trading above catalog',
  'Fresh-to-market consignment from a long-held collection with documented provenance',
  'Colorized parallel with a strong eye-appeal rating from the cataloging team',
  'Rookie card with modern-flip upside given recent player narrative momentum',
  'Estate consignment, single-owner history, original grading labels intact',
  'Case-hit short print rarely encountered at this grade — comps suggest premium over estimate',
  'Cross-grade candidate — holder shows fade/yellowing but image presents strongly',
];

function parsePrice(v: string): number {
  const cleaned = v.replace(/,/g, '');
  const m = cleaned.match(/\$([0-9]+(?:\.[0-9]+)?)/);
  return m ? parseFloat(m[1]) : 0;
}
function fmtMoney(n: number): string {
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
function randInt(min: number, max: number): number { return Math.floor(min + Math.random() * (max - min + 1)); }

export default function ConsignmentDropClient() {
  const [events, setEvents] = useState<Evt[]>([]);
  const [paused, setPaused] = useState(false);
  const [sport, setSport] = useState<SportFilter>('all');
  const [minEst, setMinEst] = useState<EstimateFloor>('100');
  const [houseSet, setHouseSet] = useState<Set<House>>(() => new Set(Object.keys(HOUSE_META) as House[]));
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);
  const [startTs] = useState(Date.now());
  const intervalRef = useRef<number | null>(null);

  const pool = useMemo<Card[]>(() => {
    return sportsCards.reduce<Card[]>((acc, c) => {
      const fmv = parsePrice(c.estimatedValueRaw);
      if (fmv < 50) return acc;
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

  const filteredPool = useMemo(() => sport === 'all' ? pool : pool.filter((c) => c.sport === sport), [pool, sport]);

  function createEvent(): Evt | null {
    if (!filteredPool.length) return null;
    const card = filteredPool[Math.floor(Math.random() * filteredPool.length)];
    const houses = (Object.keys(HOUSE_META) as House[]).filter((h) => houseSet.has(h));
    if (!houses.length) return null;
    const weights = houses.map((h) => HOUSE_META[h].weightBias(card.fmv));
    const house = weightedPick(houses, weights);
    const estimateLow = Math.round(card.fmv * (0.7 + Math.random() * 0.5));
    const estimateHigh = Math.round(estimateLow * (1.3 + Math.random() * 0.5));
    const lotNumber = house === 'rea' ? `Lot ${randInt(100, 999)}` : house === 'heritage' ? `${randInt(40000, 89999)}` : `#${randInt(1001, 9999)}`;
    const blurb = BLURBS_TEMPLATES[Math.floor(Math.random() * BLURBS_TEMPLATES.length)];
    const daysToOpen = randInt(2, 28);
    return {
      id: Math.random().toString(36).slice(2, 10),
      ts: Date.now(),
      card,
      house,
      lotNumber,
      estimateLow,
      estimateHigh,
      blurb,
      daysToOpen,
    };
  }

  useEffect(() => {
    if (paused) return;
    if (!hydrated) return;
    if (events.length === 0) {
      const seed: Evt[] = [];
      for (let i = 0; i < 3; i++) {
        const e = createEvent();
        if (e) seed.push({ ...e, ts: Date.now() - i * 15000 });
      }
      setEvents(seed);
    }
    intervalRef.current = window.setInterval(() => {
      const e = createEvent();
      if (!e) return;
      setEvents((prev) => [e, ...prev].slice(0, MAX_EVENTS));
    }, 6400);
    return () => { if (intervalRef.current) window.clearInterval(intervalRef.current); };
  }, [paused, hydrated, sport, houseSet]);

  const minEstN = parseInt(minEst, 10);
  const visible = useMemo(() => events.filter((e) => houseSet.has(e.house) && e.estimateHigh >= minEstN), [events, houseSet, minEstN]);

  function toggleHouse(h: House) { setHouseSet((prev) => { const n = new Set(prev); if (n.has(h)) n.delete(h); else n.add(h); return n; }); }
  function toggleWatch(slug: string) {
    setWatchlist((prev) => {
      const n = new Set(prev);
      if (n.has(slug)) n.delete(slug); else { if (n.size >= 20) return prev; n.add(slug); }
      return n;
    });
  }
  function clearAll() { setEvents([]); }

  const totalHighEst = events.reduce((s, e) => s + e.estimateHigh, 0);
  const biggestEst = events.reduce<Evt | null>((best, e) => (!best || e.estimateHigh > best.estimateHigh ? e : best), null);
  const upSec = Math.floor((Date.now() - startTs) / 1000);

  if (!hydrated) {
    return <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center text-gray-500 text-sm">Loading catalog feed&hellip;</div>;
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="rounded-2xl border border-indigo-900/40 bg-indigo-950/20 p-4 space-y-3">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[11px] text-indigo-300 font-semibold uppercase tracking-wider">House</span>
          {(Object.keys(HOUSE_META) as House[]).map((h) => (
            <button
              key={h}
              onClick={() => toggleHouse(h)}
              className={`px-2 py-1 rounded-md text-[11px] font-semibold ${houseSet.has(h) ? `bg-slate-700 ${HOUSE_META[h].color}` : 'bg-slate-900 text-gray-600'}`}
              title={HOUSE_META[h].specialty}
            >
              {HOUSE_META[h].label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[11px] text-indigo-300 font-semibold uppercase tracking-wider">Min est.</span>
          {(['100', '500', '1000', '5000', '25000'] as EstimateFloor[]).map((v) => (
            <button key={v} onClick={() => setMinEst(v)} className={`px-2 py-1 rounded-md text-[11px] font-semibold ${minEst === v ? 'bg-indigo-500 text-slate-900' : 'bg-slate-800 text-gray-400 hover:text-white'}`}>
              ${parseInt(v, 10) >= 1000 ? parseInt(v, 10) / 1000 + 'K' : v}+
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[11px] text-indigo-300 font-semibold uppercase tracking-wider">Sport</span>
          {(['all', 'baseball', 'basketball', 'football', 'hockey'] as SportFilter[]).map((s) => (
            <button key={s} onClick={() => setSport(s)} className={`px-2 py-1 rounded-md text-[11px] font-semibold capitalize ${sport === s ? 'bg-indigo-500 text-slate-900' : 'bg-slate-800 text-gray-400 hover:text-white'}`}>
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button onClick={() => setPaused((p) => !p)} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${paused ? 'bg-indigo-500 text-slate-900' : 'bg-slate-800 text-indigo-300'}`}>
              {paused ? '▶ Resume' : '⏸ Pause'}
            </button>
            <button onClick={clearAll} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-gray-400 hover:text-white">Clear</button>
          </div>
          <div className="flex gap-3 text-[11px] text-gray-400">
            <span>Listings <span className="text-white font-semibold">{events.length}</span></span>
            <span>Est. volume <span className="text-indigo-300 font-semibold">{fmtMoney(totalHighEst)}</span></span>
            <span>Biggest <span className="text-yellow-300 font-semibold">{biggestEst ? fmtMoney(biggestEst.estimateHigh) : '—'}</span></span>
            <span>Up <span className="text-white font-semibold">{Math.floor(upSec / 60)}m{upSec % 60}s</span></span>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-2">
        {visible.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-8 text-center text-gray-500 text-sm">
            {paused ? 'Feed paused.' : 'Waiting for the next catalog drop...'}
          </div>
        ) : (
          visible.map((e, i) => {
            const house = HOUSE_META[e.house];
            const watched = watchlist.has(e.card.slug);
            return (
              <div
                key={e.id}
                className={`rounded-xl border border-slate-800 bg-slate-900/50 p-3 sm:p-4 ${i === 0 && !paused ? 'animate-[pulse_2s_ease-in-out_1]' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 flex flex-col items-center text-center w-16 sm:w-20">
                    <div className={`text-[10px] font-mono font-bold uppercase ${house.color}`}>{house.label}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">{e.lotNumber}</div>
                    <div className="mt-1 px-1.5 py-0.5 rounded bg-indigo-950/60 border border-indigo-900/40 text-[9px] text-indigo-300 font-semibold">
                      {e.daysToOpen}d to open
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-bold text-sm sm:text-base truncate">
                        {e.card.year} {e.card.set} {e.card.player.split(' ').slice(-1)[0]}
                      </span>
                      <span className="text-[10px] font-mono uppercase text-gray-500">{e.card.sport}</span>
                    </div>
                    <div className="text-xs text-gray-300 mt-1 italic leading-relaxed">&ldquo;{e.blurb}&rdquo;</div>
                    <div className="mt-2 flex items-center gap-3 text-xs">
                      <span className="text-gray-400">Est. <span className="text-white font-semibold">{fmtMoney(e.estimateLow)}</span> – <span className="text-white font-semibold">{fmtMoney(e.estimateHigh)}</span></span>
                      <span className="text-[10px] text-gray-500 ml-auto">{sinceStr(e.ts)}</span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <button
                      onClick={() => toggleWatch(e.card.slug)}
                      className={`text-[11px] px-2 py-1 rounded ${watched ? 'bg-indigo-500 text-slate-900 font-bold' : 'bg-slate-800 text-gray-400 hover:text-indigo-300'}`}
                      title={watched ? 'Remove from watchlist' : 'Add to watchlist'}
                    >
                      {watched ? '✓ Watched' : '+ Watch'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="text-[11px] text-gray-500 text-center">
        Simulated feed calibrated to realistic auction-catalog drop cadence (~6.4s per event across 6 houses). Each event reflects how a real consignment would appear in a catalog before bidding opens. Watchlist stores up to 20 card slugs locally.
      </div>
    </div>
  );
}
