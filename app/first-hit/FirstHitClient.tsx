'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type Tier = 'LEGENDARY' | 'GRAIL' | 'ELITE' | 'HIGHLIGHT' | 'FIRST';
type SportFilter = 'all' | 'basketball' | 'football' | 'baseball' | 'hockey' | 'multi';

type TierMeta = {
  label: string;
  emoji: string;
  weight: number;
  badge: string;
  strip: string;
  minValue: number;
  maxValue: number;
  descriptors: string[];
};

const TIERS: Record<Tier, TierMeta> = {
  LEGENDARY: {
    label: 'LEGENDARY',
    emoji: '👑',
    weight: 2,
    badge: 'bg-gradient-to-r from-amber-500/30 to-yellow-500/30 text-amber-200 border-amber-400/60',
    strip: 'bg-gradient-to-b from-amber-400 to-yellow-500',
    minValue: 15000,
    maxValue: 80000,
    descriptors: ['First 1/1 pulled', 'First National Treasures shadowbox', 'First printing-plate 1/1', 'First eBay 1/1 exclusive'],
  },
  GRAIL: {
    label: 'GRAIL',
    emoji: '🏆',
    weight: 6,
    badge: 'bg-violet-500/20 text-violet-300 border-violet-500/50',
    strip: 'bg-gradient-to-b from-violet-500 to-purple-600',
    minValue: 4000,
    maxValue: 18000,
    descriptors: ['First SuperFractor 1/1', 'First Atomic Refractor 1/1', 'First Shield Prizm 1/1', 'First RPA /10'],
  },
  ELITE: {
    label: 'ELITE',
    emoji: '💎',
    weight: 12,
    badge: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/50',
    strip: 'bg-gradient-to-b from-fuchsia-500 to-pink-600',
    minValue: 1200,
    maxValue: 5000,
    descriptors: ['First Gold auto /10', 'First Orange Prizm /25', 'First Blue Refractor Auto /50', 'Complete rainbow anchor card'],
  },
  HIGHLIGHT: {
    label: 'HIGHLIGHT',
    emoji: '⭐',
    weight: 25,
    badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50',
    strip: 'bg-gradient-to-b from-indigo-500 to-blue-600',
    minValue: 250,
    maxValue: 1100,
    descriptors: ['First Silver Prizm', 'First Gold SP /50', 'First X-Fractor auto /99', 'First Disco Prizm', 'First White Sparkle'],
  },
  FIRST: {
    label: 'FIRST',
    emoji: '🎯',
    weight: 55,
    badge: 'bg-teal-500/20 text-teal-300 border-teal-500/50',
    strip: 'bg-gradient-to-b from-teal-500 to-emerald-600',
    minValue: 30,
    maxValue: 240,
    descriptors: ['First base auto', 'First named RC', 'First rookie parallel', 'First insert hit', 'First retail exclusive'],
  },
};

const TIER_ORDER: Tier[] = ['LEGENDARY', 'GRAIL', 'ELITE', 'HIGHLIGHT', 'FIRST'];

type Product = {
  id: string;
  name: string;
  sport: 'basketball' | 'football' | 'baseball' | 'hockey';
  weight: number;
  launchHeat: string;
  flagship: string;
};

const PRODUCTS: Product[] = [
  { id: 'prizm-nba-25', name: '2025-26 Panini Prizm Basketball', sport: 'basketball', weight: 18, launchHeat: 'HOT', flagship: '2025-26 rookies (Flagg / Harper / Dylan Harper / Tre Johnson)' },
  { id: 'prizm-nfl-25', name: '2025 Panini Prizm Football', sport: 'football', weight: 15, launchHeat: 'HOT', flagship: 'Cam Ward / Travis Hunter / Shedeur Sanders / Ashton Jeanty' },
  { id: 'topps-chrome-mlb-25', name: '2025 Topps Chrome Baseball', sport: 'baseball', weight: 14, launchHeat: 'HOT', flagship: 'Roki Sasaki / Paul Skenes / James Wood' },
  { id: 'bowman-draft-25', name: '2025 Bowman Chrome Draft', sport: 'baseball', weight: 12, launchHeat: 'HOT', flagship: '2024 MLB Draft class (Bazzana / Smith / Condon / Kurtz)' },
  { id: 'udyg-nhl-25', name: '2025-26 Upper Deck Young Guns', sport: 'hockey', weight: 10, launchHeat: 'WARM', flagship: 'Celebrini / Demidov / Schaefer rookies' },
  { id: 'topps-pristine-24', name: '2024 Topps Pristine Baseball', sport: 'baseball', weight: 8, launchHeat: 'WARM', flagship: 'Encased rookie autos — Skenes / Langford / Holliday' },
  { id: 'topps-definitive-25', name: '2025 Topps Definitive Baseball', sport: 'baseball', weight: 7, launchHeat: 'COOL', flagship: 'Ultra-premium, patch autos, HOF legends' },
  { id: 'contenders-nfl-24', name: '2024 Panini Contenders Football', sport: 'football', weight: 6, launchHeat: 'COOL', flagship: 'Rookie Ticket autos — Maye / Daniels / Williams / Nix' },
];

type SourcePlatform = {
  name: string;
  weight: number;
};

const PLATFORMS: SourcePlatform[] = [
  { name: 'Whatnot Live', weight: 35 },
  { name: 'Fanatics Live', weight: 20 },
  { name: 'Personal rip', weight: 15 },
  { name: 'Group break', weight: 14 },
  { name: 'Retail box (Target)', weight: 6 },
  { name: 'Retail blaster (Walmart)', weight: 5 },
  { name: 'LCS wax', weight: 3 },
  { name: 'Case break', weight: 2 },
];

type HitItem = {
  id: string;
  tier: Tier;
  product: Product;
  descriptor: string;
  player: string;
  platform: string;
  handle: string;
  value: number;
  bornAt: number;
};

// Player pool per sport — real modern flagship rookies likely to surface in launch-window
const PLAYERS: Record<Product['sport'], string[]> = {
  basketball: ['Cooper Flagg', 'Dylan Harper', 'Tre Johnson', 'VJ Edgecombe', 'Ace Bailey', 'Kasparas Jakucionis', 'Khaman Maluach', 'Egor Demin', 'Collin Murray-Boyles', 'Jeremiah Fears'],
  football: ['Cam Ward', 'Travis Hunter', 'Shedeur Sanders', 'Ashton Jeanty', 'Abdul Carter', 'Omarion Hampton', 'Tetairoa McMillan', 'Matthew Golden', 'Colston Loveland', 'Will Johnson'],
  baseball: ['Roki Sasaki', 'Paul Skenes', 'James Wood', 'Dylan Crews', 'Jackson Holliday', 'Jackson Chourio', 'Wyatt Langford', 'Jackson Merrill', 'Jac Caglianone', 'Travis Bazzana'],
  hockey: ['Macklin Celebrini', 'Ivan Demidov', 'Matthew Schaefer', 'Beckett Sennecke', 'Cayden Lindstrom', 'Gavin McKenna', 'Connor Bedard', 'Leo Carlsson', 'Adam Fantilli', 'Matvei Michkov'],
};

function pickWeighted<T extends { weight: number }>(arr: T[], rand: () => number): T {
  const total = arr.reduce((s, x) => s + x.weight, 0);
  let r = rand() * total;
  for (const x of arr) {
    r -= x.weight;
    if (r <= 0) return x;
  }
  return arr[arr.length - 1];
}

function pickTier(rand: () => number): Tier {
  return pickWeighted(TIER_ORDER.map(t => ({ tier: t, weight: TIERS[t].weight })), rand).tier;
}

function genHandle(rand: () => number): string {
  const prefixes = ['collector', 'ripsession', 'rookiehound', 'rainbowchasr', 'pullkingdom', 'caseclub', 'breakbeat', 'slabwire', 'hobbyfix', 'boxhoarder'];
  const p = prefixes[Math.floor(rand() * prefixes.length)];
  const n = Math.floor(rand() * 9000) + 100;
  return `@${p}_${n}`;
}

function genValue(tier: Tier, rand: () => number): number {
  const meta = TIERS[tier];
  const v = meta.minValue + rand() * (meta.maxValue - meta.minValue);
  // Round to hobby-friendly denominations
  if (v < 100) return Math.round(v / 5) * 5;
  if (v < 1000) return Math.round(v / 25) * 25;
  if (v < 10000) return Math.round(v / 100) * 100;
  return Math.round(v / 500) * 500;
}

function genHit(now: number, idSeed: number): HitItem {
  const rand = () => Math.random();
  const tier = pickTier(rand);
  const product = pickWeighted(PRODUCTS, rand);
  const descriptor = TIERS[tier].descriptors[Math.floor(rand() * TIERS[tier].descriptors.length)];
  const playerPool = PLAYERS[product.sport];
  const player = playerPool[Math.floor(rand() * playerPool.length)];
  const platform = pickWeighted(PLATFORMS, rand).name;
  const handle = genHandle(rand);
  const value = genValue(tier, rand);
  // Age: bias toward recent (0-10 min), tail to 30 min
  const ageMs = Math.floor(Math.pow(rand(), 2) * 30 * 60 * 1000);
  return {
    id: `hit-${now}-${idSeed}`,
    tier,
    product,
    descriptor,
    player,
    platform,
    handle,
    value,
    bornAt: now - ageMs,
  };
}

function timeAgo(ms: number, now: number): string {
  const elapsed = now - ms;
  const sec = Math.floor(elapsed / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  return `${Math.floor(min / 60)}h ago`;
}

function fmtMoney(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`;
  return `$${n}`;
}

const INITIAL_FEED_SIZE = 18;
const REFRESH_MS = 5000;
const MAX_FEED = 28;
const ROLLOFF_MS = 30 * 60 * 1000;

export default function FirstHitClient() {
  const [feed, setFeed] = useState<HitItem[]>([]);
  const [paused, setPaused] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [tierFilter, setTierFilter] = useState<Set<Tier>>(new Set(TIER_ORDER));
  const [sportFilter, setSportFilter] = useState<SportFilter>('all');
  const [productFilter, setProductFilter] = useState<string | 'all'>('all');
  const idCounter = useRef(0);

  // Seed initial feed
  useEffect(() => {
    const initial: HitItem[] = [];
    for (let i = 0; i < INITIAL_FEED_SIZE; i++) {
      initial.push(genHit(Date.now(), i));
      idCounter.current++;
    }
    // Sort recent-first
    initial.sort((a, b) => b.bornAt - a.bornAt);
    setFeed(initial);
  }, []);

  // Tick
  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      const currentNow = Date.now();
      setNow(currentNow);
      setFeed(prev => {
        const newItem = genHit(currentNow, idCounter.current++);
        const combined = [newItem, ...prev];
        // Remove expired + cap
        const fresh = combined.filter(h => currentNow - h.bornAt < ROLLOFF_MS).slice(0, MAX_FEED);
        return fresh;
      });
    }, REFRESH_MS);
    return () => clearInterval(interval);
  }, [paused]);

  // Re-render "X min ago" every 10 seconds even when feed doesn't change
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(t);
  }, []);

  function toggleTier(t: Tier) {
    const next = new Set(tierFilter);
    if (next.has(t)) next.delete(t); else next.add(t);
    if (next.size === 0) next.add(t); // Prevent empty
    setTierFilter(next);
  }

  const filteredFeed = useMemo(() => {
    return feed.filter(h => {
      if (!tierFilter.has(h.tier)) return false;
      if (sportFilter !== 'all' && h.product.sport !== sportFilter) return false;
      if (productFilter !== 'all' && h.product.id !== productFilter) return false;
      return true;
    });
  }, [feed, tierFilter, sportFilter, productFilter]);

  const stats = useMemo(() => {
    const visible = filteredFeed.length;
    const legendary = filteredFeed.filter(h => h.tier === 'LEGENDARY').length;
    const grail = filteredFeed.filter(h => h.tier === 'GRAIL').length;
    const totalValue = filteredFeed.reduce((s, h) => s + h.value, 0);
    return { visible, legendary, grail, totalValue };
  }, [filteredFeed]);

  return (
    <div className="space-y-6">
      {/* Control bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-3 flex-wrap justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${paused ? 'bg-amber-500' : 'bg-violet-500 animate-pulse'}`} />
            <span className="text-sm font-semibold text-white">{paused ? 'PAUSED' : 'LIVE'}</span>
            <span className="text-xs text-slate-500">· refresh {REFRESH_MS / 1000}s · {filteredFeed.length} shown</span>
          </div>
          <button
            onClick={() => setPaused(p => !p)}
            className={`text-sm font-semibold px-4 py-1.5 rounded-md transition ${
              paused
                ? 'bg-violet-600 hover:bg-violet-500 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            {paused ? '▶ Resume' : '⏸ Pause'}
          </button>
        </div>

        {/* Tier filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs uppercase tracking-wider text-slate-500">Tiers:</span>
          {TIER_ORDER.map(t => {
            const active = tierFilter.has(t);
            return (
              <button
                key={t}
                onClick={() => toggleTier(t)}
                className={`text-xs font-semibold px-2.5 py-1 rounded border transition ${
                  active ? TIERS[t].badge : 'bg-slate-950 text-slate-500 border-slate-800 hover:border-slate-600'
                }`}
              >
                <span className="mr-1">{TIERS[t].emoji}</span>
                {TIERS[t].label}
              </button>
            );
          })}
        </div>

        {/* Sport + product filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-slate-500">Sport:</span>
            {(['all', 'basketball', 'football', 'baseball', 'hockey'] as SportFilter[]).map(s => (
              <button
                key={s}
                onClick={() => setSportFilter(s)}
                className={`text-xs font-semibold px-2.5 py-1 rounded transition ${
                  sportFilter === s
                    ? 'bg-violet-600 text-white'
                    : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                {s === 'all' ? 'All' : s[0].toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-slate-500">Product:</span>
            <select
              value={productFilter}
              onChange={e => setProductFilter(e.target.value)}
              className="text-xs bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-300"
            >
              <option value="all">All products</option>
              {PRODUCTS.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-white">{stats.visible}</div>
          <div className="text-xs text-slate-500">Feed items</div>
        </div>
        <div className="bg-slate-900/60 border border-amber-700/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-amber-300">{stats.legendary}</div>
          <div className="text-xs text-slate-500">Legendary 👑</div>
        </div>
        <div className="bg-slate-900/60 border border-violet-700/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-violet-300">{stats.grail}</div>
          <div className="text-xs text-slate-500">Grail 🏆</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-white">{fmtMoney(stats.totalValue)}</div>
          <div className="text-xs text-slate-500">Combined value</div>
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-2">
        {filteredFeed.length === 0 && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-8 text-center text-slate-500">
            No hits match your filters. Try enabling more tiers or broadening sport.
          </div>
        )}
        {filteredFeed.map(hit => {
          const tierMeta = TIERS[hit.tier];
          return (
            <div
              key={hit.id}
              className="relative bg-slate-900/60 border border-slate-800 rounded-lg overflow-hidden flex items-stretch hover:bg-slate-800/60 transition"
            >
              <div className={`w-1.5 ${tierMeta.strip}`} />
              <div className="flex-1 p-3.5 sm:p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded border ${tierMeta.badge}`}>
                        {tierMeta.emoji} {tierMeta.label}
                      </span>
                      <span className="text-xs text-slate-500">{timeAgo(hit.bornAt, now)}</span>
                      <span className="text-xs text-slate-500">· {hit.platform}</span>
                    </div>
                    <div className="font-semibold text-white truncate">
                      {hit.descriptor} — <span className="text-violet-300">{hit.player}</span>
                    </div>
                    <div className="text-sm text-slate-400 truncate">
                      {hit.product.name}
                      {hit.product.launchHeat === 'HOT' && <span className="ml-2 text-xs text-red-400">🔥 HOT</span>}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      pulled by {hit.handle}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xl font-bold text-white">{fmtMoney(hit.value)}</div>
                    <div className="text-xs text-slate-500">est. value</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tier distribution explainer */}
      <details className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
        <summary className="font-semibold text-white cursor-pointer text-sm">How the tier distribution works</summary>
        <div className="mt-3 text-sm text-slate-400 space-y-2">
          <p>Hit frequency follows a weighted distribution approximating documented launch-window pull rates:</p>
          <ul className="space-y-1.5 list-disc list-inside text-xs">
            {TIER_ORDER.map(t => {
              const m = TIERS[t];
              const total = TIER_ORDER.reduce((s, x) => s + TIERS[x].weight, 0);
              const pct = (m.weight / total * 100).toFixed(1);
              return (
                <li key={t}>
                  <span className={`inline-block text-xs font-bold px-1.5 py-0.5 rounded ${m.badge} mr-1.5`}>{m.emoji} {m.label}</span>
                  {pct}% of feed · value range {fmtMoney(m.minValue)}–{fmtMoney(m.maxValue)}
                </li>
              );
            })}
          </ul>
          <p className="pt-2 text-xs text-slate-500">Pull-rate math: launch-window pulls cluster more heavily in the FIRST/HIGHLIGHT tiers because the universe of "first of X" is largest for common hits. LEGENDARY 1/1s are by definition one-per-set and pull only when someone in the hobby opens the right box — roughly 1-3 per major launch week.</p>
        </div>
      </details>
    </div>
  );
}
