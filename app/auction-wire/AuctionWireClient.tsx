'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { sportsCards } from '@/data/sports-cards';

type Platform = 'eBay' | 'PWCC' | 'Goldin' | 'Heritage' | 'Whatnot' | 'MySlabs';
type Tier = 'hammer' | 'closing' | 'warming' | 'active';
type Sport = 'all' | 'baseball' | 'basketball' | 'football' | 'hockey';

interface TierMeta {
  label: string;
  emoji: string;
  minSec: number;
  maxSec: number;
  badge: string;
  strip: string;
  ring: string;
}

const TIERS: Record<Tier, TierMeta> = {
  hammer: {
    label: 'HAMMER TIME',
    emoji: '🔴',
    minSec: 0,
    maxSec: 60,
    badge: 'bg-red-500/25 text-red-300 border-red-500/50',
    strip: 'bg-gradient-to-b from-red-500 to-rose-600',
    ring: 'ring-red-500/60',
  },
  closing: {
    label: 'CLOSING',
    emoji: '🟠',
    minSec: 60,
    maxSec: 300,
    badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    strip: 'bg-gradient-to-b from-orange-500 to-amber-600',
    ring: 'ring-orange-500/50',
  },
  warming: {
    label: 'WARMING UP',
    emoji: '🟡',
    minSec: 300,
    maxSec: 900,
    badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
    strip: 'bg-gradient-to-b from-yellow-500 to-amber-500',
    ring: 'ring-yellow-500/40',
  },
  active: {
    label: 'ACTIVE',
    emoji: '⚪',
    minSec: 900,
    maxSec: 3600,
    badge: 'bg-gray-700/40 text-gray-300 border-gray-600/40',
    strip: 'bg-gradient-to-b from-gray-500 to-gray-600',
    ring: 'ring-gray-500/40',
  },
};

const PLATFORMS: Platform[] = ['eBay', 'PWCC', 'Goldin', 'Heritage', 'Whatnot', 'MySlabs'];

const PLATFORM_META: Record<Platform, { color: string; badge: string; url: (q: string) => string }> = {
  eBay: {
    color: 'text-blue-400',
    badge: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
    url: q => `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(q)}`,
  },
  PWCC: {
    color: 'text-purple-400',
    badge: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
    url: q => `https://www.pwccmarketplace.com/search?query=${encodeURIComponent(q)}`,
  },
  Goldin: {
    color: 'text-amber-400',
    badge: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    url: q => `https://goldin.co/search?q=${encodeURIComponent(q)}`,
  },
  Heritage: {
    color: 'text-rose-400',
    badge: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
    url: q => `https://sports.ha.com/search/?q=${encodeURIComponent(q)}`,
  },
  Whatnot: {
    color: 'text-pink-400',
    badge: 'bg-pink-500/10 text-pink-300 border-pink-500/30',
    url: q => `https://www.whatnot.com/search/${encodeURIComponent(q)}`,
  },
  MySlabs: {
    color: 'text-cyan-400',
    badge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
    url: q => `https://myslabs.com/search?search=${encodeURIComponent(q)}`,
  },
};

// Platform weight for random picks: eBay dominant, Goldin rare-but-elite
const PLATFORM_WEIGHTS: Array<{ p: Platform; w: number }> = [
  { p: 'eBay', w: 38 },
  { p: 'PWCC', w: 20 },
  { p: 'Goldin', w: 6 },
  { p: 'Heritage', w: 10 },
  { p: 'Whatnot', w: 18 },
  { p: 'MySlabs', w: 8 },
];

interface Auction {
  id: string;
  card: string;
  player: string;
  year: number;
  sport: string;
  grade: string | null;
  platform: Platform;
  currentBid: number;
  bidders: number;
  endsAt: number; // ms epoch
  createdAt: number;
  recentBidAt: number;
  justSold: boolean;
}

function parseLowPrice(v: string): number {
  const cleaned = v.replace(/,/g, '');
  const m = cleaned.match(/\$([0-9]+(?:\.[0-9]+)?)/);
  return m ? parseFloat(m[1]) : 0;
}

function fmtMoney(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 10_000) return `$${(n / 1000).toFixed(0)}K`;
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${Math.round(n).toLocaleString('en-US')}`;
}

function pickPlatform(): Platform {
  const total = PLATFORM_WEIGHTS.reduce((s, x) => s + x.w, 0);
  let r = Math.random() * total;
  for (const { p, w } of PLATFORM_WEIGHTS) {
    r -= w;
    if (r <= 0) return p;
  }
  return 'eBay';
}

function buildAuction(): Auction {
  const pool = sportsCards.filter(c => parseLowPrice(c.estimatedValueRaw) > 5);
  const card = pool[Math.floor(Math.random() * pool.length)];
  const basePrice = parseLowPrice(card.estimatedValueRaw);
  const activityFactor = 0.3 + Math.random() * 1.1; // 0.3x-1.4x of base
  const currentBid = Math.max(1, Math.round(basePrice * activityFactor));
  const platform = pickPlatform();
  const secondsLeft = Math.random() < 0.3 ? Math.floor(Math.random() * 60) + 15 // 30% in hammer/closing/warming (0-15 min)
    : Math.random() < 0.5 ? Math.floor(Math.random() * 600) + 60 // some closing (1-11 min)
      : Math.floor(Math.random() * 2700) + 900; // most in active (15-60 min)
  const endsAt = Date.now() + secondsLeft * 1000;
  // Graded prob ~50% on high-value, ~15% on low
  const gradeProb = basePrice > 200 ? 0.5 : 0.15;
  let grade: string | null = null;
  if (Math.random() < gradeProb) {
    const grades = ['PSA 10', 'PSA 9', 'PSA 8', 'BGS 9.5', 'BGS 9', 'CGC 10', 'CGC 9', 'SGC 9'];
    grade = grades[Math.floor(Math.random() * grades.length)];
  }
  const bidders = Math.max(1, Math.floor(Math.log10(currentBid + 1) * 2 + Math.random() * 5));
  return {
    id: `${card.slug}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    card: card.name,
    player: card.player,
    year: card.year,
    sport: card.sport,
    grade,
    platform,
    currentBid,
    bidders,
    endsAt,
    createdAt: Date.now(),
    recentBidAt: Date.now(),
    justSold: false,
  };
}

function tierFor(secondsLeft: number): Tier {
  if (secondsLeft <= 60) return 'hammer';
  if (secondsLeft <= 300) return 'closing';
  if (secondsLeft <= 900) return 'warming';
  return 'active';
}

function fmtCountdown(secondsLeft: number): string {
  if (secondsLeft <= 0) return 'SOLD';
  if (secondsLeft < 60) return `${secondsLeft}s`;
  const m = Math.floor(secondsLeft / 60);
  const s = secondsLeft % 60;
  if (m < 10) return `${m}m ${s}s`;
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  return `${m}m`;
}

export default function AuctionWireClient() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [now, setNow] = useState(Date.now());
  const [paused, setPaused] = useState(false);
  const [sportFilter, setSportFilter] = useState<Sport>('all');
  const [platformFilter, setPlatformFilter] = useState<Platform | 'all'>('all');
  const [soldToday, setSoldToday] = useState(0);
  const [mounted, setMounted] = useState(false);
  const pausedRef = useRef(false);

  useEffect(() => { pausedRef.current = paused; }, [paused]);

  useEffect(() => {
    setMounted(true);
    const initial: Auction[] = [];
    for (let i = 0; i < 12; i++) initial.push(buildAuction());
    setAuctions(initial);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const tick = setInterval(() => {
      setNow(Date.now());
    }, 500);
    return () => clearInterval(tick);
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    const bidTick = setInterval(() => {
      if (pausedRef.current) return;
      setAuctions(prev => {
        const expired: Auction[] = [];
        let soldCount = 0;
        const updated = prev.map(a => {
          const secondsLeft = Math.max(0, Math.floor((a.endsAt - Date.now()) / 1000));
          if (secondsLeft === 0 && !a.justSold) {
            expired.push(a);
            soldCount++;
            return { ...a, justSold: true };
          }
          // 25% chance any active auction gets a new bid this tick
          const bidChance = secondsLeft < 60 ? 0.6 : secondsLeft < 300 ? 0.35 : secondsLeft < 900 ? 0.2 : 0.08;
          if (secondsLeft > 0 && Math.random() < bidChance) {
            const jumpFactor = secondsLeft < 60 ? 1.04 + Math.random() * 0.12 : 1.01 + Math.random() * 0.04;
            return {
              ...a,
              currentBid: Math.round(a.currentBid * jumpFactor),
              bidders: a.bidders + (Math.random() < 0.4 ? 1 : 0),
              recentBidAt: Date.now(),
            };
          }
          return a;
        });
        if (soldCount > 0) {
          setSoldToday(s => s + soldCount);
        }
        // Replace justSold auctions after 2 seconds of flash
        const final = updated.map(a => {
          if (a.justSold && Date.now() - (a.endsAt ?? 0) > 2500) {
            return buildAuction();
          }
          return a;
        });
        return final;
      });
    }, 1500);
    return () => clearInterval(bidTick);
  }, [mounted]);

  const visible = useMemo(() => {
    return auctions
      .filter(a => sportFilter === 'all' || a.sport === sportFilter)
      .filter(a => platformFilter === 'all' || a.platform === platformFilter)
      .sort((a, b) => a.endsAt - b.endsAt);
  }, [auctions, sportFilter, platformFilter]);

  const stats = useMemo(() => {
    const active = visible.filter(a => a.endsAt > now && !a.justSold);
    const hammer = active.filter(a => a.endsAt - now <= 300_000).length;
    const closingHour = active.filter(a => a.endsAt - now <= 3_600_000).length;
    const volume = active.reduce((s, a) => s + a.currentBid, 0);
    return { active: active.length, hammer, closingHour, volume, soldToday };
  }, [visible, now, soldToday]);

  if (!mounted) {
    return <div className="h-96 bg-gray-900/40 border border-gray-800 rounded-2xl animate-pulse" />;
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-gray-900/40 border border-gray-800 rounded-2xl p-4">
        <Stat label="In feed" value={String(stats.active)} color="text-white" />
        <Stat label="< 5 min" value={String(stats.hammer)} color="text-red-400" />
        <Stat label="< 1 hour" value={String(stats.closingHour)} color="text-orange-400" />
        <Stat label="Volume" value={fmtMoney(stats.volume)} color="text-emerald-400" />
        <Stat label="Sold today" value={String(stats.soldToday)} color="text-indigo-400" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-900/30 border border-gray-800 rounded-2xl p-3">
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-1">
            {(['all', 'baseball', 'basketball', 'football', 'hockey'] as Sport[]).map(s => (
              <button
                key={s}
                onClick={() => setSportFilter(s)}
                className={`px-2 py-1 rounded-lg text-xs font-semibold border transition-colors capitalize ${sportFilter === s ? 'border-indigo-500 bg-indigo-500/15 text-indigo-300' : 'border-gray-800 bg-black/30 text-gray-500 hover:border-gray-700'}`}
              >
                {s}
              </button>
            ))}
          </div>
          <select
            value={platformFilter}
            onChange={e => setPlatformFilter(e.target.value as Platform | 'all')}
            className="px-2 py-1 rounded-lg text-xs font-semibold border border-gray-800 bg-black/30 text-gray-400"
          >
            <option value="all">All platforms</option>
            {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <button
          onClick={() => setPaused(p => !p)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${paused ? 'bg-amber-500/15 text-amber-300 border-amber-500/40' : 'bg-gray-800/50 text-gray-400 border-gray-700 hover:text-white'}`}
        >
          {paused ? '▶ RESUME' : '⏸ PAUSE'}
        </button>
      </div>

      <div className="space-y-2">
        {visible.map(a => (
          <AuctionRow key={a.id} auction={a} now={now} />
        ))}
      </div>

      <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-5 text-xs text-gray-500">
        <div className="font-bold text-gray-300 mb-2">Tier legend</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(Object.keys(TIERS) as Tier[]).map(t => {
            const m = TIERS[t];
            return (
              <div key={t} className={`px-2 py-1.5 rounded-lg border ${m.badge} flex items-center gap-1.5`}>
                <span>{m.emoji}</span>
                <span className="font-bold">{m.label}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-3 text-gray-500 text-[11px]">
          Auctions are simulated. Platforms and price bands reflect real hobby dynamics. "Bid on Platform" opens a search on the respective site.
        </div>
      </div>
    </div>
  );
}

function AuctionRow({ auction, now }: { auction: Auction; now: number }) {
  const secondsLeft = Math.max(0, Math.floor((auction.endsAt - now) / 1000));
  const tier = tierFor(secondsLeft);
  const tm = TIERS[tier];
  const pm = PLATFORM_META[auction.platform];
  const recentBid = now - auction.recentBidAt < 2000;
  const q = `${auction.year} ${auction.player} ${auction.grade ?? ''}`.trim();

  return (
    <div className={`relative bg-gray-900/40 border border-gray-800 rounded-xl overflow-hidden ${auction.justSold ? 'opacity-60' : ''} ${tier === 'hammer' && !auction.justSold ? 'ring-1 ' + tm.ring : ''}`}>
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${tm.strip}`} />
      <div className="pl-4 pr-3 py-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${tm.badge} whitespace-nowrap`}>
            {auction.justSold ? '💥 SOLD' : `${tm.emoji} ${fmtCountdown(secondsLeft)}`}
          </span>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${pm.badge} whitespace-nowrap`}>
            {auction.platform}
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-white truncate">
              {auction.year} {auction.player}
              {auction.grade && <span className="ml-1.5 text-xs text-gray-400">{auction.grade}</span>}
            </div>
            <div className="text-xs text-gray-500 truncate">{auction.card}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-right">
          <div>
            <div className={`text-base font-black font-mono ${recentBid && !auction.justSold ? 'text-emerald-400' : 'text-white'}`}>
              {fmtMoney(auction.currentBid)}
              {recentBid && !auction.justSold && <span className="ml-1 text-xs text-emerald-300">▲</span>}
            </div>
            <div className="text-[10px] text-gray-500">{auction.bidders} bidder{auction.bidders !== 1 ? 's' : ''}</div>
          </div>
          {!auction.justSold && (
            <a
              href={pm.url(q)}
              target="_blank"
              rel="nofollow noopener"
              className={`px-3 py-1.5 rounded-lg text-xs font-bold bg-black/40 border border-gray-700 hover:border-indigo-500/40 transition-colors ${pm.color}`}
            >
              Bid →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col items-start">
      <span className="text-[10px] uppercase tracking-wider text-gray-500">{label}</span>
      <span className={`font-black text-lg ${color}`}>{value}</span>
    </div>
  );
}
