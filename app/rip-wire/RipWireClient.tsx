'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { sportsCards } from '@/data/sports-cards';

type Tier = 'SUPERFRACTOR' | 'AUTO' | 'REFRACTOR' | 'RC' | 'DUD';

type Pull = {
  id: string;
  tier: Tier;
  ripper: string;
  city: string;
  product: string;
  player: string;
  year: number;
  sport: string;
  estValue: number;
  postedAt: number;
};

type SportFilter = 'all' | 'baseball' | 'basketball' | 'football' | 'hockey';
type TierFilter = 'all' | Tier;

const TIER_META: Record<Tier, { label: string; weight: number; gradient: string; textColor: string; badgeBg: string; badge: string; valueMultiplier: [number, number] }> = {
  SUPERFRACTOR: { label: '1/1 SUPERFRACTOR', weight: 2, gradient: 'from-pink-500 to-fuchsia-600', textColor: 'text-pink-100', badgeBg: 'bg-pink-500/20 border-pink-400/50 text-pink-200', badge: '🌈 1/1', valueMultiplier: [8, 25] },
  AUTO:         { label: 'AUTO',              weight: 12, gradient: 'from-amber-500 to-orange-600', textColor: 'text-amber-100', badgeBg: 'bg-amber-500/20 border-amber-400/50 text-amber-200', badge: '✒️ AUTO', valueMultiplier: [1.5, 4] },
  REFRACTOR:    { label: 'REFRACTOR',         weight: 22, gradient: 'from-cyan-500 to-sky-600', textColor: 'text-cyan-100', badgeBg: 'bg-cyan-500/20 border-cyan-400/50 text-cyan-200', badge: '💎 RFX', valueMultiplier: [1.2, 2.5] },
  RC:           { label: 'ROOKIE',            weight: 36, gradient: 'from-emerald-500 to-teal-600', textColor: 'text-emerald-100', badgeBg: 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200', badge: '⭐ RC', valueMultiplier: [0.6, 1.2] },
  DUD:          { label: 'DUD',               weight: 28, gradient: 'from-zinc-600 to-zinc-700', textColor: 'text-zinc-400', badgeBg: 'bg-zinc-600/30 border-zinc-500/50 text-zinc-400', badge: '— base', valueMultiplier: [0, 0.1] },
};

const PRODUCTS_BY_SPORT: Record<string, string[]> = {
  baseball: ['2025 Topps Chrome', '2024 Bowman Chrome', '2025 Topps Update', '2024 Bowman Draft', '2025 Panini Chronicles', '2024 Topps Finest'],
  basketball: ['2024-25 Panini Prizm', '2024-25 Panini Select', '2024-25 Panini Optic', '2024-25 Panini Contenders', '2024-25 Panini Mosaic'],
  football: ['2025 Panini Prizm', '2025 Panini Select', '2025 Panini Optic', '2025 Panini Mosaic', '2025 Panini Obsidian', '2025 Panini National Treasures'],
  hockey: ['2024-25 Upper Deck Series 1', '2024-25 SP Authentic', '2024-25 SPx', '2024-25 Upper Deck Young Guns'],
};

const RIPPER_HANDLES = [
  '@BluesPackAddict', '@VintageDave', '@RookieHoarder', '@MintQueen', '@BreakerKid', '@NSCCNomad', '@SlabSammy', '@PrizmPapi',
  '@WaxOracle', '@JerseyCollector', '@HitChaser', '@RefractorRob', '@AutoAnna', '@LateNightRips', '@TheHobbyNerd', '@CardShark47',
  '@GemMintGrandma', '@FlipperMike', '@RookieRoulette', '@OnTheHunt', '@HotBoxJim', '@CommonsCurator', '@PulpMaster', '@ScribbleTheGrader',
];

const CITIES = [
  'Chicago, IL', 'Austin, TX', 'Atlanta, GA', 'Seattle, WA', 'Boston, MA', 'Miami, FL', 'Denver, CO', 'Philadelphia, PA',
  'Phoenix, AZ', 'Nashville, TN', 'Portland, OR', 'San Diego, CA', 'Minneapolis, MN', 'Detroit, MI', 'Orlando, FL', 'Kansas City, MO',
  'Columbus, OH', 'Raleigh, NC', 'St Louis, MO', 'Salt Lake City, UT', 'Charlotte, NC', 'Las Vegas, NV', 'Houston, TX', 'Cleveland, OH',
];

function parseLowPrice(v: string): number {
  const cleaned = v.replace(/,/g, '');
  const m = cleaned.match(/\$([0-9]+(?:\.[0-9]+)?)/);
  return m ? parseFloat(m[1]) : 0;
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  if (n < 1) return '< $1';
  return `$${Math.round(n).toLocaleString('en-US')}`;
}

function timeAgo(ms: number): string {
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  return `${min}m ago`;
}

function pickWeightedTier(): Tier {
  const total = Object.values(TIER_META).reduce((a, b) => a + b.weight, 0);
  let roll = Math.random() * total;
  for (const [tier, meta] of Object.entries(TIER_META)) {
    roll -= meta.weight;
    if (roll <= 0) return tier as Tier;
  }
  return 'RC';
}

function pickFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function synthesizePull(): Pull {
  const tier = pickWeightedTier();
  const meta = TIER_META[tier];
  const card = pickFrom(sportsCards);
  const product = pickFrom(PRODUCTS_BY_SPORT[card.sport] || PRODUCTS_BY_SPORT.baseball);
  const basePrice = parseLowPrice(card.estimatedValueRaw) || 20;
  const multRange = meta.valueMultiplier;
  const mult = multRange[0] + Math.random() * (multRange[1] - multRange[0]);
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    tier,
    ripper: pickFrom(RIPPER_HANDLES),
    city: pickFrom(CITIES),
    product,
    player: card.player,
    year: card.year,
    sport: card.sport,
    estValue: Math.max(1, Math.round(basePrice * mult)),
    postedAt: Date.now(),
  };
}

function seedPulls(n: number): Pull[] {
  const now = Date.now();
  const pulls: Pull[] = [];
  for (let i = 0; i < n; i++) {
    const p = synthesizePull();
    p.postedAt = now - i * (5000 + Math.random() * 15000);
    pulls.push(p);
  }
  return pulls.sort((a, b) => b.postedAt - a.postedAt);
}

const MAX_PULLS = 30;

export default function RipWireClient() {
  const [pulls, setPulls] = useState<Pull[]>([]);
  const [sport, setSport] = useState<SportFilter>('all');
  const [tierFilter, setTierFilter] = useState<TierFilter>('all');
  const [paused, setPaused] = useState(false);
  const [, forceRender] = useState(0);
  const [mounted, setMounted] = useState(false);

  const pausedRef = useRef(paused);
  useEffect(() => { pausedRef.current = paused; }, [paused]);

  useEffect(() => {
    setMounted(true);
    setPulls(seedPulls(8));
  }, []);

  useEffect(() => {
    if (!mounted) return;
    let timeoutId: ReturnType<typeof setTimeout>;
    const scheduleNext = () => {
      const jitter = 4000 + Math.random() * 8000;
      timeoutId = setTimeout(() => {
        if (!pausedRef.current) {
          setPulls(prev => [synthesizePull(), ...prev].slice(0, MAX_PULLS));
        }
        scheduleNext();
      }, jitter);
    };
    scheduleNext();
    return () => clearTimeout(timeoutId);
  }, [mounted]);

  useEffect(() => {
    const tick = setInterval(() => forceRender(x => x + 1), 2000);
    return () => clearInterval(tick);
  }, []);

  const filtered = useMemo(() => {
    return pulls.filter(p => {
      if (sport !== 'all' && p.sport !== sport) return false;
      if (tierFilter !== 'all' && p.tier !== tierFilter) return false;
      return true;
    });
  }, [pulls, sport, tierFilter]);

  const tierCounts = useMemo(() => {
    const c: Record<Tier, number> = { SUPERFRACTOR: 0, AUTO: 0, REFRACTOR: 0, RC: 0, DUD: 0 };
    pulls.forEach(p => { c[p.tier]++; });
    return c;
  }, [pulls]);

  if (!mounted) return <div className="text-gray-400 text-sm">Initializing Rip Wire...</div>;

  return (
    <div className="space-y-5">
      {/* Header controls */}
      <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${paused ? 'bg-amber-500' : 'bg-pink-500 animate-pulse'}`} />
          <span className="text-sm font-mono text-gray-300">
            {paused ? 'PAUSED' : 'LIVE'} · {filtered.length} pulls
          </span>
        </div>
        <button
          onClick={() => setPaused(p => !p)}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
            paused
              ? 'bg-pink-500 hover:bg-pink-400 text-white'
              : 'bg-gray-900 hover:bg-gray-700 text-gray-300 border border-gray-700'
          }`}
        >
          {paused ? '▶ Resume' : '❚❚ Pause'}
        </button>
      </div>

      {/* Tier counts strip */}
      <div className="grid grid-cols-5 gap-2 sm:gap-3">
        {(Object.keys(TIER_META) as Tier[]).map(t => (
          <div
            key={t}
            className={`rounded-lg border p-2.5 text-center ${TIER_META[t].badgeBg}`}
          >
            <div className="text-[9px] font-bold tracking-widest uppercase opacity-80 leading-none mb-1">{TIER_META[t].label}</div>
            <div className="text-xl font-black leading-none">{tierCounts[t]}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-4">
        <div className="mb-3">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Sport</div>
          <div className="flex flex-wrap gap-2">
            {(['all', 'baseball', 'basketball', 'football', 'hockey'] as SportFilter[]).map(s => (
              <button
                key={s}
                onClick={() => setSport(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  sport === s
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-700'
                }`}
              >
                {s === 'all' ? 'All Sports' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Hit Tier</div>
          <div className="flex flex-wrap gap-2">
            {(['all', 'SUPERFRACTOR', 'AUTO', 'REFRACTOR', 'RC', 'DUD'] as TierFilter[]).map(t => (
              <button
                key={t}
                onClick={() => setTierFilter(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  tierFilter === t
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-700'
                }`}
              >
                {t === 'all' ? 'All Tiers' : TIER_META[t as Tier].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-2.5">
        {filtered.length === 0 && (
          <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-8 text-center text-gray-500">
            No pulls match your filter. Waiting for a {tierFilter !== 'all' ? tierFilter : ''} {sport !== 'all' ? sport : ''} pull...
          </div>
        )}
        {filtered.map(p => {
          const meta = TIER_META[p.tier];
          const isHit = p.tier !== 'DUD';
          return (
            <div
              key={p.id}
              className={`rounded-xl border overflow-hidden ${
                isHit ? 'bg-gray-900/80 border-gray-700' : 'bg-gray-950/40 border-gray-800'
              }`}
            >
              <div className="flex">
                <div className={`shrink-0 w-1.5 bg-gradient-to-b ${meta.gradient}`} />
                <div className="flex-1 p-3 sm:p-4">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full border ${meta.badgeBg}`}>
                      {meta.badge}
                    </span>
                    <span className="text-[10px] font-semibold text-gray-500">{p.product}</span>
                    <span className="text-[10px] text-gray-600">·</span>
                    <span className="text-[10px] font-mono text-gray-500">{timeAgo(Date.now() - p.postedAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm sm:text-base font-bold ${isHit ? 'text-white' : 'text-gray-400'}`}>
                      {p.player}
                    </span>
                    <span className={`text-xs font-mono ${isHit ? 'text-pink-300' : 'text-gray-500'}`}>
                      {fmt(p.estValue)}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1 truncate">
                    <span className="text-gray-400 font-medium">{p.ripper}</span> from {p.city}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center text-xs text-gray-500 pt-2">
        Showing {filtered.length} of max {MAX_PULLS} recent pulls · oldest scroll off
      </div>
    </div>
  );
}
