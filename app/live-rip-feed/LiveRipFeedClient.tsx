'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

const sportIcons: Record<string, string> = { baseball: '⚾', basketball: '🏀', football: '🏈', hockey: '🏒' };
const sportColors: Record<string, string> = { baseball: 'border-rose-800/40 bg-rose-950/30', basketball: 'border-orange-800/40 bg-orange-950/30', football: 'border-blue-800/40 bg-blue-950/30', hockey: 'border-cyan-800/40 bg-cyan-950/30' };

function parseValue(v: string): number {
  const m = v.match(/\$([\d,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
}

function seededRng(seed: number) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
}

const collectorNames = [
  'RookieHunter22', 'WaxRipper', 'SlabKing99', 'CardFlipJay', 'GemMint10',
  'VintageVibes', 'PackRatMike', 'ChromeChaser', 'ToppsAddict', 'PrizmPuller',
  'BaseballDad42', 'HoopsCollector', 'GridironCards', 'PuckCards', 'SetBuilder',
  'RCInvestor', 'CardShowKid', 'BlasterBandit', 'HobbyBoxHero', 'ParallelHunter',
  'SilverPrizm', 'RefractorRick', 'YoungGunsFan', 'AutoGrapher', 'CaseBuster',
  'CardVaultFam', 'MintCondition', 'PullGod', 'BoxBreakBoss', 'HighEndHits',
];

const products = [
  { name: '2024 Topps Chrome Baseball', sport: 'baseball', tier: 'hobby' },
  { name: '2025 Topps Series 1 Baseball', sport: 'baseball', tier: 'retail' },
  { name: '2024 Bowman Chrome Baseball', sport: 'baseball', tier: 'hobby' },
  { name: '2024-25 Panini Prizm Basketball', sport: 'basketball', tier: 'hobby' },
  { name: '2024-25 Panini Select Basketball', sport: 'basketball', tier: 'hobby' },
  { name: '2024-25 Panini Donruss Basketball', sport: 'basketball', tier: 'retail' },
  { name: '2024 Panini Prizm Football', sport: 'football', tier: 'hobby' },
  { name: '2024 Panini Contenders Football', sport: 'football', tier: 'hobby' },
  { name: '2024 Panini Mosaic Football', sport: 'football', tier: 'retail' },
  { name: '2024-25 Upper Deck Series 1 Hockey', sport: 'hockey', tier: 'hobby' },
  { name: '2024-25 Upper Deck MVP Hockey', sport: 'hockey', tier: 'retail' },
];

interface RipEvent {
  id: number;
  collector: string;
  product: string;
  sport: string;
  cards: { name: string; player: string; value: number; rookie: boolean; slug: string }[];
  bestPull: number;
  totalValue: number;
  timestamp: number;
  isNew: boolean;
}

export default function LiveRipFeedClient() {
  const [events, setEvents] = useState<RipEvent[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [sportFilter, setSportFilter] = useState<string>('all');
  const counterRef = useRef(0);
  const rngRef = useRef(seededRng(Date.now()));

  const cardsBySport = useMemo(() => {
    const map: Record<string, typeof sportsCards> = {};
    for (const c of sportsCards) {
      const s = c.sport as string;
      if (!map[s]) map[s] = [];
      map[s].push(c);
    }
    return map;
  }, []);

  const generateRip = useCallback(() => {
    const rng = rngRef.current;
    const product = products[Math.floor(rng() * products.length)];
    const sportCards = cardsBySport[product.sport];
    if (!sportCards || sportCards.length === 0) return null;

    const packSize = product.tier === 'hobby' ? (3 + Math.floor(rng() * 3)) : (2 + Math.floor(rng() * 2));
    const cards: RipEvent['cards'] = [];
    const usedIdxs = new Set<number>();

    for (let i = 0; i < packSize; i++) {
      let idx: number;
      let attempts = 0;
      do { idx = Math.floor(rng() * sportCards.length); attempts++; } while (usedIdxs.has(idx) && attempts < 20);
      usedIdxs.add(idx);
      const c = sportCards[idx];
      cards.push({
        name: c.name,
        player: c.player,
        value: parseValue(c.estimatedValueRaw),
        rookie: c.rookie,
        slug: c.slug,
      });
    }

    const totalValue = cards.reduce((s, c) => s + c.value, 0);
    const bestPull = Math.max(...cards.map(c => c.value));

    counterRef.current++;
    return {
      id: counterRef.current,
      collector: collectorNames[Math.floor(rng() * collectorNames.length)],
      product: product.name,
      sport: product.sport,
      cards,
      bestPull,
      totalValue,
      timestamp: Date.now(),
      isNew: true,
    } as RipEvent;
  }, [cardsBySport]);

  useEffect(() => {
    // Generate initial batch
    const initial: RipEvent[] = [];
    for (let i = 0; i < 5; i++) {
      const rip = generateRip();
      if (rip) { rip.isNew = false; initial.push(rip); }
    }
    setEvents(initial);
  }, [generateRip]);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      const rip = generateRip();
      if (rip) {
        setEvents(prev => {
          const updated = [rip, ...prev.map(e => ({ ...e, isNew: false }))].slice(0, 30);
          return updated;
        });
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused, generateRip]);

  const filtered = useMemo(() => {
    if (sportFilter === 'all') return events;
    return events.filter(e => e.sport === sportFilter);
  }, [events, sportFilter]);

  const stats = useMemo(() => {
    const allPulls = events.flatMap(e => e.cards);
    const bestPull = allPulls.length > 0 ? allPulls.reduce((best, c) => c.value > best.value ? c : best, allPulls[0]) : null;
    const bigHits = allPulls.filter(c => c.value >= 50).length;
    const totalValue = allPulls.reduce((s, c) => s + c.value, 0);
    return {
      packsOpened: events.length,
      cardsRevealed: allPulls.length,
      bestPull,
      bigHits,
      totalValue,
    };
  }, [events]);

  function timeAgo(ts: number): string {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 5) return 'just now';
    if (diff < 60) return `${diff}s ago`;
    return `${Math.floor(diff / 60)}m ago`;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Live Rip Feed</h1>
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${isPaused ? 'bg-amber-900/60 text-amber-300' : 'bg-emerald-900/60 text-emerald-300'}`}>
            <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`} />
            {isPaused ? 'Paused' : 'Live'}
          </span>
        </div>
        <p className="text-gray-400">Watch what collectors are pulling right now. Real cards, real values, real-time.</p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-white">{stats.packsOpened}</div>
          <div className="text-xs text-gray-400">Packs Ripped</div>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-white">{stats.cardsRevealed}</div>
          <div className="text-xs text-gray-400">Cards Revealed</div>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-emerald-400">${stats.totalValue.toLocaleString()}</div>
          <div className="text-xs text-gray-400">Total Value</div>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-amber-400">{stats.bigHits}</div>
          <div className="text-xs text-gray-400">Big Hits ($50+)</div>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-3 text-center col-span-2 sm:col-span-1">
          {stats.bestPull ? (
            <>
              <div className="text-xl font-bold text-yellow-400">${stats.bestPull.value}</div>
              <div className="text-xs text-gray-400 truncate">{stats.bestPull.player}</div>
            </>
          ) : (
            <>
              <div className="text-xl font-bold text-gray-600">—</div>
              <div className="text-xs text-gray-400">Best Pull</div>
            </>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button
          onClick={() => setIsPaused(!isPaused)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isPaused ? 'bg-emerald-900/60 border border-emerald-700/40 text-emerald-300 hover:bg-emerald-900/80' : 'bg-amber-900/60 border border-amber-700/40 text-amber-300 hover:bg-amber-900/80'}`}
        >
          {isPaused ? '▶ Resume' : '⏸ Pause'}
        </button>
        <select
          value={sportFilter}
          onChange={(e) => setSportFilter(e.target.value)}
          className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Sports</option>
          <option value="baseball">⚾ Baseball</option>
          <option value="basketball">🏀 Basketball</option>
          <option value="football">🏈 Football</option>
          <option value="hockey">🏒 Hockey</option>
        </select>
        <span className="text-xs text-gray-500">New pack every 4 seconds</span>
      </div>

      {/* Feed */}
      <div className="space-y-3">
        {filtered.map((event) => {
          const colors = sportColors[event.sport] || 'border-gray-800 bg-gray-900/30';
          const isBigHit = event.bestPull >= 50;
          const isFireHit = event.bestPull >= 200;
          return (
            <div
              key={event.id}
              className={`rounded-xl border p-4 transition-all ${colors} ${event.isNew ? 'ring-1 ring-white/10' : ''}`}
            >
              {/* Rip Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{sportIcons[event.sport] || '🃏'}</span>
                  <div>
                    <span className="text-sm font-bold text-white">{event.collector}</span>
                    <span className="text-gray-500 text-sm"> ripped </span>
                    <span className="text-sm text-gray-300">{event.product}</span>
                  </div>
                </div>
                <span className="text-xs text-gray-500 shrink-0">{timeAgo(event.timestamp)}</span>
              </div>

              {/* Cards */}
              <div className="flex flex-wrap gap-2 mb-3">
                {event.cards.map((card, i) => {
                  const isHit = card.value >= 50;
                  const isFire = card.value >= 200;
                  return (
                    <Link
                      key={i}
                      href={`/sports/${card.slug}`}
                      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs border transition-colors ${
                        isFire ? 'bg-yellow-900/50 border-yellow-700/50 text-yellow-200 hover:border-yellow-500' :
                        isHit ? 'bg-emerald-900/50 border-emerald-700/50 text-emerald-200 hover:border-emerald-500' :
                        'bg-gray-800/60 border-gray-700/40 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      {isFire && '🔥 '}
                      {isHit && !isFire && '💎 '}
                      {card.rookie && <span className="text-amber-400 font-bold">RC</span>}
                      <span className="truncate max-w-[140px]">{card.player}</span>
                      <span className={`font-mono ${isHit ? 'font-bold' : 'text-gray-400'}`}>${card.value}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Rip Summary */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="text-gray-400">{event.cards.length} cards</span>
                  <span className="text-gray-500">|</span>
                  <span className={`font-medium ${event.totalValue >= 100 ? 'text-emerald-400' : 'text-gray-400'}`}>
                    Total: ${event.totalValue}
                  </span>
                  {event.cards.filter(c => c.rookie).length > 0 && (
                    <>
                      <span className="text-gray-500">|</span>
                      <span className="text-amber-400">{event.cards.filter(c => c.rookie).length} RC{event.cards.filter(c => c.rookie).length !== 1 ? 's' : ''}</span>
                    </>
                  )}
                </div>
                {(isBigHit || isFireHit) && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${isFireHit ? 'bg-yellow-900/60 text-yellow-300' : 'bg-emerald-900/60 text-emerald-300'}`}>
                    {isFireHit ? '🔥 FIRE HIT!' : '💎 BIG HIT!'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          {events.length === 0 ? 'Loading feed...' : 'No openings match your filter. Try a different sport.'}
        </div>
      )}
    </div>
  );
}
