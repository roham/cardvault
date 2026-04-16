'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { sportsCards } from '@/data/sports-cards';

type Platform = 'eBay' | 'COMC' | 'Whatnot' | 'MySlabs';
type Sport = 'baseball' | 'basketball' | 'football' | 'hockey';
type Verdict = 'STEAL' | 'DEAL' | 'FAIR' | 'OVERPRICED';
type SportFilter = 'all' | Sport;

interface Listing {
  id: string;
  card: typeof sportsCards[number];
  platform: Platform;
  askPrice: number;
  estimatedValue: number;
  verdict: Verdict;
  markupPct: number;
  sellerTag: string;
  postedAt: number;
}

const PLATFORM_WEIGHTS: Array<[Platform, number]> = [
  ['eBay', 45],
  ['COMC', 25],
  ['Whatnot', 20],
  ['MySlabs', 10],
];
const TOTAL_PLATFORM_WEIGHT = PLATFORM_WEIGHTS.reduce((s, [, w]) => s + w, 0);

const PLATFORM_ICONS: Record<Platform, string> = {
  eBay: '🛒',
  COMC: '📦',
  Whatnot: '📹',
  MySlabs: '🏷️',
};

const PLATFORM_COLORS: Record<Platform, string> = {
  eBay: 'text-sky-300 bg-sky-500/10 border-sky-500/30',
  COMC: 'text-orange-300 bg-orange-500/10 border-orange-500/30',
  Whatnot: 'text-violet-300 bg-violet-500/10 border-violet-500/30',
  MySlabs: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30',
};

const VERDICT_COLORS: Record<Verdict, string> = {
  STEAL: 'text-emerald-300 bg-emerald-500/20 border-emerald-500/50 ring-emerald-500/40',
  DEAL: 'text-sky-300 bg-sky-500/20 border-sky-500/50 ring-sky-500/40',
  FAIR: 'text-gray-300 bg-gray-500/20 border-gray-500/40 ring-gray-500/30',
  OVERPRICED: 'text-rose-300 bg-rose-500/20 border-rose-500/50 ring-rose-500/40',
};

const SELLER_HANDLES = [
  '@vintagevault', '@rookieready', '@thechroma', '@cornerstone_cards', '@dealerdadDE',
  '@gradedgloss', '@sharpiefresh', '@midwestmike', '@sunbelt_sports', '@thepatchqueen',
  '@dugoutdaily', '@parallelprince', '@slabsncold', '@rookieheat', '@flipsnkisses',
  '@hobbyhunterLA', '@commandercards', '@pawnfinder', '@binderbros', '@buyerxplode',
];

const MAX_LISTINGS = 30;

function parseLow(v: string): number {
  const m = v.replace(/,/g, '').match(/\$([0-9]+(?:\.[0-9]+)?)/);
  return m ? Math.round(parseFloat(m[1])) : 0;
}

function pickWeighted<T>(pairs: Array<[T, number]>, totalWeight: number): T {
  let r = Math.random() * totalWeight;
  for (const [val, w] of pairs) {
    r -= w;
    if (r < 0) return val;
  }
  return pairs[0][0];
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function synthesizeListing(): Listing | null {
  // Pick card with parseable price
  const eligible = sportsCards.filter(c => parseLow(c.estimatedValueRaw) > 0);
  if (eligible.length === 0) return null;
  const card = pick(eligible);
  const estimatedValue = parseLow(card.estimatedValueRaw);

  // Synthesize ask price with realistic variance:
  // ~15% STEAL (-30 to -50%), 30% DEAL (-10 to -30%), 35% FAIR (±10%), 20% OVERPRICED (+10 to +50%)
  const roll = Math.random();
  let markupPct: number;
  let verdict: Verdict;
  if (roll < 0.15) {
    markupPct = -0.30 - Math.random() * 0.20; // -50% to -30%
    verdict = 'STEAL';
  } else if (roll < 0.45) {
    markupPct = -0.10 - Math.random() * 0.20; // -30% to -10%
    verdict = 'DEAL';
  } else if (roll < 0.80) {
    markupPct = -0.10 + Math.random() * 0.20; // -10% to +10%
    verdict = 'FAIR';
  } else {
    markupPct = 0.10 + Math.random() * 0.40; // +10% to +50%
    verdict = 'OVERPRICED';
  }

  const askPrice = Math.max(1, Math.round(estimatedValue * (1 + markupPct)));
  const platform = pickWeighted(PLATFORM_WEIGHTS, TOTAL_PLATFORM_WEIGHT);
  const sellerTag = pick(SELLER_HANDLES);

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    card,
    platform,
    askPrice,
    estimatedValue,
    verdict,
    markupPct: markupPct * 100,
    sellerTag,
    postedAt: Date.now(),
  };
}

function formatMoney(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `$${Math.round(n / 1000)}K`;
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${n.toLocaleString()}`;
}

function formatAgo(now: number, then: number): string {
  const s = Math.floor((now - then) / 1000);
  if (s < 5) return 'just now';
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

export default function ListingWireClient() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [totalScanned, setTotalScanned] = useState(0);
  const [sportFilter, setSportFilter] = useState<SportFilter>('all');
  const [paused, setPaused] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [verdictBreakdown, setVerdictBreakdown] = useState({ STEAL: 0, DEAL: 0, FAIR: 0, OVERPRICED: 0 });

  const filterRef = useRef(sportFilter);
  filterRef.current = sportFilter;
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  // Initial seed: 8 listings so it's not empty on load
  useEffect(() => {
    const seeded: Listing[] = [];
    for (let i = 0; i < 8; i++) {
      const l = synthesizeListing();
      if (l) {
        // Stagger postedAt so ages look natural (most recent first)
        l.postedAt = Date.now() - (i * 1000 * (8 + Math.floor(Math.random() * 12)));
        seeded.unshift(l);
      }
    }
    setListings(seeded);
    setTotalScanned(150 + Math.floor(Math.random() * 250));
    const breakdown = { STEAL: 0, DEAL: 0, FAIR: 0, OVERPRICED: 0 };
    seeded.forEach(l => { breakdown[l.verdict]++; });
    setVerdictBreakdown(breakdown);
  }, []);

  // Incoming listing interval: 7-14s
  useEffect(() => {
    const scheduleNext = () => {
      const delay = 7000 + Math.random() * 7000;
      return setTimeout(() => {
        if (!pausedRef.current) {
          const next = synthesizeListing();
          if (next) {
            const filter = filterRef.current;
            // Only add to visible list if passes filter (but always count)
            if (filter === 'all' || next.card.sport === filter) {
              setListings(prev => [next, ...prev].slice(0, MAX_LISTINGS));
              setVerdictBreakdown(prev => ({ ...prev, [next.verdict]: prev[next.verdict] + 1 }));
            }
            setTotalScanned(n => n + 1);
          }
        }
        timerRef.current = scheduleNext();
      }, delay);
    };
    const timerRef = { current: scheduleNext() };
    return () => clearTimeout(timerRef.current);
  }, []);

  // Timestamp tick
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 2500);
    return () => clearInterval(t);
  }, []);

  const visibleListings = useMemo(() => {
    if (sportFilter === 'all') return listings;
    return listings.filter(l => l.card.sport === sportFilter);
  }, [listings, sportFilter]);

  const SPORT_FILTERS: Array<{ value: SportFilter; label: string }> = [
    { value: 'all', label: 'All Sports' },
    { value: 'baseball', label: '⚾ Baseball' },
    { value: 'basketball', label: '🏀 Basketball' },
    { value: 'football', label: '🏈 Football' },
    { value: 'hockey', label: '🏒 Hockey' },
  ];

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex flex-wrap gap-2 flex-1">
          {SPORT_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setSportFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                sportFilter === f.value
                  ? 'bg-lime-500/20 text-lime-300 border-lime-500/40'
                  : 'bg-gray-900/60 text-gray-400 border-gray-800 hover:border-gray-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setPaused(p => !p)}
          className={`px-4 py-1.5 rounded-lg text-xs font-black border transition-colors ${
            paused
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
              : 'bg-lime-500/20 text-lime-300 border-lime-500/40 hover:bg-lime-500/30'
          }`}
        >
          {paused ? '▶ RESUME' : '⏸ PAUSE'}
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-5">
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Scanned Today</div>
          <div className="text-lg font-black text-white">{totalScanned.toLocaleString()}</div>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Steals</div>
          <div className="text-lg font-black text-emerald-300">{verdictBreakdown.STEAL}</div>
        </div>
        <div className="bg-sky-500/10 border border-sky-500/30 rounded-xl p-3 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-sky-400">Deals</div>
          <div className="text-lg font-black text-sky-300">{verdictBreakdown.DEAL}</div>
        </div>
        <div className="bg-gray-500/10 border border-gray-500/30 rounded-xl p-3 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Fair</div>
          <div className="text-lg font-black text-gray-300">{verdictBreakdown.FAIR}</div>
        </div>
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Overpriced</div>
          <div className="text-lg font-black text-rose-300">{verdictBreakdown.OVERPRICED}</div>
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-2">
        {visibleListings.length === 0 ? (
          <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-8 text-center text-gray-500 text-sm">
            Waiting for {sportFilter === 'all' ? 'listings' : sportFilter + ' listings'}...
          </div>
        ) : (
          visibleListings.map(l => {
            const platformColor = PLATFORM_COLORS[l.platform];
            const verdictColor = VERDICT_COLORS[l.verdict];
            const markupLabel = l.markupPct < 0 ? `${l.markupPct.toFixed(0)}%` : `+${l.markupPct.toFixed(0)}%`;

            return (
              <div key={l.id} className="bg-gray-900/40 border border-gray-800 hover:border-lime-500/30 rounded-xl p-3 sm:p-4 transition-colors">
                <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                  {/* Platform */}
                  <div className={`flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${platformColor}`}>
                    <span className="text-sm">{PLATFORM_ICONS[l.platform]}</span>
                    {l.platform}
                  </div>

                  {/* Card info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-gray-500">{l.card.year}</span>
                      {l.card.rookie && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">⭐ RC</span>
                      )}
                    </div>
                    <div className="font-bold text-white text-sm leading-snug truncate">{l.card.player}</div>
                    <div className="text-xs text-gray-500 truncate">{l.card.set} · #{l.card.cardNumber} · {l.sellerTag}</div>
                  </div>

                  {/* Price + Verdict */}
                  <div className="flex-shrink-0 flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs text-gray-500">{formatMoney(l.estimatedValue)} est</div>
                      <div className="text-lg font-black text-white">{formatMoney(l.askPrice)}</div>
                    </div>
                    <div className={`flex-shrink-0 flex flex-col items-center px-2 py-1.5 rounded-lg border ${verdictColor}`}>
                      <span className="text-[10px] font-black uppercase tracking-wider leading-none">{l.verdict}</span>
                      <span className="text-[10px] font-mono opacity-70 mt-0.5">{markupLabel}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-800/60">
                  <span className="text-[10px] text-gray-600">{formatAgo(now, l.postedAt)}</span>
                  <a
                    href={l.card.ebaySearchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-semibold text-lime-400 hover:text-lime-300 transition-colors"
                  >
                    search eBay →
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>

      {paused && (
        <div className="mt-4 bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 text-center text-xs text-rose-300">
          ⏸ Feed paused. New listings are on hold. Tap RESUME to continue.
        </div>
      )}

      <div className="mt-6 text-center text-xs text-gray-600">
        Listings are synthesized from real card data. For actual marketplace listings, click &quot;search eBay&quot;.
      </div>
    </div>
  );
}
