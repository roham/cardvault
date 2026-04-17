'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type Tier = 'BASE' | 'SILVER' | 'COLOR' | 'ORANGE' | 'RED' | 'GOLD' | 'BLACK';
type Sport = 'basketball' | 'football' | 'baseball' | 'hockey';

type TierMeta = {
  label: string;
  serial: string;
  emoji: string;
  weight: number;
  badge: string;
  strip: string;
  minMult: number;
  maxMult: number;
};

const TIERS: Record<Tier, TierMeta> = {
  BASE:   { label: 'BASE',       serial: 'unnumbered',  emoji: '⚪', weight: 40, badge: 'bg-slate-500/20 text-slate-300 border-slate-500/50', strip: 'bg-slate-500',                       minMult: 1,    maxMult: 1   },
  SILVER: { label: 'SILVER',     serial: '/999+',       emoji: '⬜', weight: 25, badge: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/50',    strip: 'bg-gradient-to-b from-zinc-300 to-zinc-500', minMult: 3,    maxMult: 5   },
  COLOR:  { label: 'COLOR',      serial: '/199-/299',   emoji: '🔵', weight: 12, badge: 'bg-sky-500/20 text-sky-300 border-sky-500/50',       strip: 'bg-gradient-to-b from-sky-400 to-blue-500',  minMult: 5,    maxMult: 8   },
  ORANGE: { label: 'ORANGE',     serial: '/50',         emoji: '🟠', weight: 10, badge: 'bg-orange-500/20 text-orange-300 border-orange-500/50', strip: 'bg-gradient-to-b from-orange-400 to-orange-600', minMult: 10,  maxMult: 20  },
  RED:    { label: 'RED',        serial: '/25',         emoji: '🔴', weight: 6,  badge: 'bg-red-500/20 text-red-300 border-red-500/50',       strip: 'bg-gradient-to-b from-red-400 to-red-600',   minMult: 20,   maxMult: 40  },
  GOLD:   { label: 'GOLD',       serial: '/10',         emoji: '🟡', weight: 4,  badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50', strip: 'bg-gradient-to-b from-yellow-400 to-amber-500', minMult: 30,   maxMult: 80  },
  BLACK:  { label: 'BLACK 1/1',  serial: '1/1',         emoji: '⬛', weight: 3,  badge: 'bg-violet-500/20 text-violet-300 border-violet-500/50', strip: 'bg-gradient-to-b from-violet-500 to-purple-700', minMult: 100,  maxMult: 500 },
};

const TIER_ORDER: Tier[] = ['BLACK', 'GOLD', 'RED', 'ORANGE', 'COLOR', 'SILVER', 'BASE'];

const PRODUCTS: { id: string; name: string; sport: Sport; weight: number }[] = [
  { id: 'prizm-nba-25', name: '2025-26 Panini Prizm Basketball', sport: 'basketball', weight: 18 },
  { id: 'prizm-nfl-25', name: '2025 Panini Prizm Football', sport: 'football', weight: 15 },
  { id: 'chrome-mlb-25', name: '2025 Topps Chrome Baseball', sport: 'baseball', weight: 14 },
  { id: 'optic-nba-24', name: '2024-25 Panini Donruss Optic', sport: 'basketball', weight: 10 },
  { id: 'udyg-nhl-25', name: '2025-26 Upper Deck Young Guns', sport: 'hockey', weight: 10 },
  { id: 'nt-nba-24', name: '2024-25 Panini National Treasures', sport: 'basketball', weight: 8 },
  { id: 'chrome-nfl-25', name: '2025 Topps Chrome Football', sport: 'football', weight: 10 },
  { id: 'bowman-25', name: '2025 Bowman Chrome', sport: 'baseball', weight: 8 },
  { id: 'cup-nhl-24', name: '2024-25 Upper Deck The Cup', sport: 'hockey', weight: 7 },
];

const PLAYER_POOL: Record<Sport, { player: string; baseVal: number }[]> = {
  basketball: [
    { player: 'Cooper Flagg', baseVal: 180 },
    { player: 'Dylan Harper', baseVal: 120 },
    { player: 'Victor Wembanyama', baseVal: 340 },
    { player: 'LeBron James', baseVal: 60 },
    { player: 'Stephen Curry', baseVal: 50 },
    { player: 'Luka Doncic', baseVal: 85 },
    { player: 'Tre Johnson', baseVal: 95 },
    { player: 'Kasparas Jakucionis', baseVal: 55 },
  ],
  football: [
    { player: 'Cam Ward', baseVal: 85 },
    { player: 'Travis Hunter', baseVal: 110 },
    { player: 'Shedeur Sanders', baseVal: 75 },
    { player: 'Patrick Mahomes', baseVal: 45 },
    { player: 'C.J. Stroud', baseVal: 40 },
    { player: 'Ashton Jeanty', baseVal: 60 },
    { player: 'Abdul Carter', baseVal: 35 },
  ],
  baseball: [
    { player: 'Paul Skenes', baseVal: 90 },
    { player: 'Roki Sasaki', baseVal: 120 },
    { player: 'Jackson Holliday', baseVal: 45 },
    { player: 'Jackson Chourio', baseVal: 65 },
    { player: 'James Wood', baseVal: 35 },
    { player: 'Jesus Made', baseVal: 75 },
    { player: 'Dylan Crews', baseVal: 50 },
  ],
  hockey: [
    { player: 'Macklin Celebrini', baseVal: 85 },
    { player: 'Ivan Demidov', baseVal: 60 },
    { player: 'Matthew Schaefer', baseVal: 40 },
    { player: 'Connor Bedard', baseVal: 70 },
    { player: 'Connor McDavid', baseVal: 90 },
    { player: 'Sidney Crosby', baseVal: 55 },
  ],
};

const PLATFORMS = ['eBay', 'Whatnot', 'PWCC', 'Goldin', 'Fanatics Collect', 'MySlabs'];

type VariantItem = {
  id: string;
  tier: Tier;
  product: { name: string; sport: Sport };
  player: string;
  baseVal: number;
  multiplier: number;
  price: number;
  platform: string;
  bornAt: number;
};

function pickWeighted<T extends { weight: number }>(arr: T[], rand: () => number): T {
  const total = arr.reduce((s, x) => s + x.weight, 0);
  let r = rand() * total;
  for (const x of arr) { r -= x.weight; if (r <= 0) return x; }
  return arr[arr.length - 1];
}

function genItem(now: number, idSeed: number): VariantItem {
  const rand = () => Math.random();
  const tier = pickWeighted(TIER_ORDER.map(t => ({ tier: t, weight: TIERS[t].weight })), rand).tier;
  const product = pickWeighted(PRODUCTS, rand);
  const playerPool = PLAYER_POOL[product.sport];
  const playerPick = playerPool[Math.floor(rand() * playerPool.length)];
  const tm = TIERS[tier];
  const multiplier = tm.minMult + rand() * (tm.maxMult - tm.minMult);
  const price = Math.round(playerPick.baseVal * multiplier / 10) * 10;
  const platform = PLATFORMS[Math.floor(rand() * PLATFORMS.length)];
  const ageMs = Math.floor(Math.pow(rand(), 2) * 30 * 60 * 1000);
  return {
    id: `var-${now}-${idSeed}`,
    tier, product: { name: product.name, sport: product.sport },
    player: playerPick.player, baseVal: playerPick.baseVal,
    multiplier, price, platform,
    bornAt: now - ageMs,
  };
}

function timeAgo(ms: number, now: number): string {
  const sec = Math.floor((now - ms) / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  return `${Math.floor(min / 60)}h ago`;
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `$${Math.round(n / 1000)}K`;
  return `$${n}`;
}

const INITIAL = 16;
const REFRESH_MS = 4500;
const MAX_FEED = 26;
const ROLLOFF_MS = 30 * 60 * 1000;

export default function VariantWireClient() {
  const [feed, setFeed] = useState<VariantItem[]>([]);
  const [paused, setPaused] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [tierFilter, setTierFilter] = useState<Set<Tier>>(new Set(TIER_ORDER));
  const [sportFilter, setSportFilter] = useState<Sport | 'all'>('all');
  const idCounter = useRef(0);

  useEffect(() => {
    const initial: VariantItem[] = [];
    for (let i = 0; i < INITIAL; i++) { initial.push(genItem(Date.now(), i)); idCounter.current++; }
    initial.sort((a, b) => b.bornAt - a.bornAt);
    setFeed(initial);
  }, []);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setNow(Date.now());
      setFeed(prev => {
        const t = Date.now();
        const fresh = genItem(t, idCounter.current++);
        return [fresh, ...prev].filter(i => t - i.bornAt < ROLLOFF_MS).slice(0, MAX_FEED);
      });
    }, REFRESH_MS);
    return () => clearInterval(id);
  }, [paused]);

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);

  const filtered = useMemo(() => feed.filter(i => tierFilter.has(i.tier) && (sportFilter === 'all' || i.product.sport === sportFilter)), [feed, tierFilter, sportFilter]);

  const counts = useMemo(() => {
    const c: Record<Tier, number> = { BASE: 0, SILVER: 0, COLOR: 0, ORANGE: 0, RED: 0, GOLD: 0, BLACK: 0 };
    feed.forEach(i => { c[i.tier]++; });
    return c;
  }, [feed]);

  function toggleTier(t: Tier) {
    setTierFilter(prev => { const next = new Set(prev); if (next.has(t)) next.delete(t); else next.add(t); return next; });
  }

  return (
    <div className="space-y-5">
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" />
            <span className="text-slate-300 font-semibold">{filtered.length}</span>
            <span className="text-slate-500">showing / {feed.length} in feed</span>
          </div>
          <button onClick={() => setPaused(p => !p)} className="text-xs px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-white">{paused ? '▶ Resume' : '⏸ Pause'}</button>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wider text-slate-500 mb-2">Tier</div>
          <div className="flex flex-wrap gap-2">
            {TIER_ORDER.map(t => {
              const m = TIERS[t];
              const active = tierFilter.has(t);
              return (
                <button key={t} onClick={() => toggleTier(t)} className={`text-xs px-2.5 py-1 rounded-md border flex items-center gap-1.5 ${active ? m.badge : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                  <span>{m.emoji}</span>
                  <span className="font-semibold">{m.label}</span>
                  <span className="text-[10px] opacity-70">{m.serial}</span>
                  <span className="opacity-60">({counts[t]})</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wider text-slate-500 mb-2">Sport</div>
          <select value={sportFilter} onChange={e => setSportFilter(e.target.value as Sport | 'all')} className="bg-slate-950 border border-slate-700 rounded-md px-2 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500">
            <option value="all">All sports</option>
            <option value="basketball">Basketball</option>
            <option value="football">Football</option>
            <option value="baseball">Baseball</option>
            <option value="hockey">Hockey</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-10 text-center text-slate-500 text-sm">No variants match current filters.</div>
        ) : (
          filtered.map(i => {
            const tm = TIERS[i.tier];
            return (
              <div key={i.id} className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden flex">
                <div className={`w-1.5 ${tm.strip}`} />
                <div className="flex-1 p-3 sm:p-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border ${tm.badge}`}>{tm.emoji} {tm.label} {tm.serial}</span>
                      <span className="text-xs text-slate-400">{i.product.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-500">{timeAgo(i.bornAt, now)}</div>
                  </div>
                  <div className="text-base font-bold text-white mb-1">{i.player}</div>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div><div className="text-slate-500 uppercase tracking-wider text-[10px]">Base</div><div className="font-mono text-slate-300">{fmt(i.baseVal)}</div></div>
                    <div><div className="text-slate-500 uppercase tracking-wider text-[10px]">Multiplier</div><div className="font-mono text-violet-300">×{i.multiplier.toFixed(1)}</div></div>
                    <div><div className="text-slate-500 uppercase tracking-wider text-[10px]">Price</div><div className="font-mono text-white font-bold">{fmt(i.price)}</div></div>
                    <div><div className="text-slate-500 uppercase tracking-wider text-[10px]">Platform</div><div className="font-mono text-slate-300">{i.platform}</div></div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
