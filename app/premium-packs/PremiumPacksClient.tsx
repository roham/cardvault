'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import CardFrame from '@/components/CardFrame';
import { sportsCards, type SportsCard, type Sport } from '@/data/sports-cards';

const BINDER_KEY = 'cardvault-binder';
const PACK_HISTORY_KEY = 'cardvault-premium-packs';

interface PackDef {
  id: string;
  name: string;
  description: string;
  cardsPerPack: number;
  gradient: string;
  borderColor: string;
  icon: string;
  filter: (c: SportsCard) => boolean;
  cooldownHours: number;
}

const PACKS: PackDef[] = [
  {
    id: 'baseball-legends',
    name: 'Baseball Legends',
    description: 'HOF sluggers, aces, and all-time greats from 1909 to today',
    cardsPerPack: 5,
    gradient: 'from-red-700 via-red-600 to-amber-700',
    borderColor: 'border-red-500/40',
    icon: '\u26BE',
    filter: (c) => c.sport === 'baseball',
    cooldownHours: 4,
  },
  {
    id: 'basketball-goat',
    name: 'Basketball GOAT',
    description: 'Legends of the court — from Mikan to Wemby',
    cardsPerPack: 5,
    gradient: 'from-orange-700 via-amber-600 to-yellow-600',
    borderColor: 'border-orange-500/40',
    icon: '\u{1F3C0}',
    filter: (c) => c.sport === 'basketball',
    cooldownHours: 4,
  },
  {
    id: 'football-elite',
    name: 'Football Elite',
    description: 'Gridiron greatness from leather helmets to modern stars',
    cardsPerPack: 5,
    gradient: 'from-blue-800 via-indigo-700 to-blue-600',
    borderColor: 'border-blue-500/40',
    icon: '\u{1F3C8}',
    filter: (c) => c.sport === 'football',
    cooldownHours: 4,
  },
  {
    id: 'hockey-classics',
    name: 'Hockey Classics',
    description: 'Original Six heroes and modern superstars',
    cardsPerPack: 5,
    gradient: 'from-cyan-800 via-teal-700 to-cyan-600',
    borderColor: 'border-cyan-500/40',
    icon: '\u{1F3D2}',
    filter: (c) => c.sport === 'hockey',
    cooldownHours: 4,
  },
  {
    id: 'pre-war-treasures',
    name: 'Pre-War Treasures',
    description: 'Rare cards from before 1941 — T206, Goudey, Play Ball',
    cardsPerPack: 3,
    gradient: 'from-amber-800 via-yellow-700 to-amber-600',
    borderColor: 'border-amber-500/40',
    icon: '\u{1F3C6}',
    filter: (c) => c.year < 1941,
    cooldownHours: 8,
  },
  {
    id: 'rookie-rush',
    name: 'Rookie Rush',
    description: 'Rookie cards only — find the next big thing',
    cardsPerPack: 5,
    gradient: 'from-emerald-700 via-green-600 to-lime-600',
    borderColor: 'border-emerald-500/40',
    icon: '\u{2B50}',
    filter: (c) => c.rookie === true,
    cooldownHours: 4,
  },
  {
    id: 'high-rollers',
    name: 'High Rollers',
    description: 'Premium cards valued $500+ — chase the big hits',
    cardsPerPack: 3,
    gradient: 'from-purple-800 via-violet-700 to-fuchsia-700',
    borderColor: 'border-purple-500/40',
    icon: '\u{1F48E}',
    filter: (c) => {
      const m = c.estimatedValueRaw.match(/\$([\d,]+)/);
      return m ? parseInt(m[1].replace(/,/g, ''), 10) >= 500 : false;
    },
    cooldownHours: 12,
  },
  {
    id: 'mystery-mix',
    name: 'Mystery Mix',
    description: 'Any sport, any era — you never know what you will get',
    cardsPerPack: 7,
    gradient: 'from-pink-700 via-rose-600 to-red-600',
    borderColor: 'border-pink-500/40',
    icon: '\u2753',
    filter: () => true,
    cooldownHours: 2,
  },
];

interface PackHistoryEntry {
  packId: string;
  lastOpened: string; // ISO timestamp
  timesOpened: number;
  totalCards: number;
}

function parseValue(v: string): number {
  const m = v.match(/\$([\d,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
}

function getRarityLabel(value: number): { label: string; color: string; bg: string } {
  if (value >= 5000) return { label: 'ULTRA RARE', color: 'text-yellow-300', bg: 'bg-yellow-500/20 border-yellow-500/50' };
  if (value >= 500) return { label: 'RARE', color: 'text-purple-300', bg: 'bg-purple-500/20 border-purple-500/50' };
  if (value >= 50) return { label: 'UNCOMMON', color: 'text-blue-300', bg: 'bg-blue-500/20 border-blue-500/50' };
  return { label: 'COMMON', color: 'text-gray-400', bg: 'bg-gray-700/30 border-gray-600/50' };
}

function seedRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

export default function PremiumPacksClient() {
  const [mounted, setMounted] = useState(false);
  const [history, setHistory] = useState<Record<string, PackHistoryEntry>>({});
  const [activePack, setActivePack] = useState<string | null>(null);
  const [pulledCards, setPulledCards] = useState<SportsCard[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [phase, setPhase] = useState<'browse' | 'revealing' | 'done'>('browse');
  const [addedToBinder, setAddedToBinder] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(PACK_HISTORY_KEY);
      if (saved) setHistory(JSON.parse(saved));
    } catch {}
  }, []);

  function isOnCooldown(packId: string): { onCooldown: boolean; timeLeft: string } {
    const entry = history[packId];
    if (!entry) return { onCooldown: false, timeLeft: '' };
    const pack = PACKS.find(p => p.id === packId);
    if (!pack) return { onCooldown: false, timeLeft: '' };
    const elapsed = Date.now() - new Date(entry.lastOpened).getTime();
    const cooldownMs = pack.cooldownHours * 60 * 60 * 1000;
    if (elapsed >= cooldownMs) return { onCooldown: false, timeLeft: '' };
    const remaining = cooldownMs - elapsed;
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    return { onCooldown: true, timeLeft: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m` };
  }

  const openPack = useCallback((packId: string) => {
    const pack = PACKS.find(p => p.id === packId);
    if (!pack) return;
    const { onCooldown } = isOnCooldown(packId);
    if (onCooldown) return;

    const pool = sportsCards.filter(pack.filter);
    if (pool.length < pack.cardsPerPack) return;

    // Deterministic random based on packId + current timestamp (minute resolution)
    const now = Date.now();
    const seed = packId.split('').reduce((h, c) => ((h << 5) - h) + c.charCodeAt(0), 0) ^ (now / 60000 | 0);
    const rng = seedRandom(Math.abs(seed));

    const selected: SportsCard[] = [];
    const usedIndices = new Set<number>();
    for (let i = 0; i < pack.cardsPerPack; i++) {
      let idx = Math.floor(rng() * pool.length);
      let attempts = 0;
      while (usedIndices.has(idx) && attempts < pool.length) {
        idx = (idx + 1) % pool.length;
        attempts++;
      }
      usedIndices.add(idx);
      selected.push(pool[idx]);
    }

    // Sort by value (best card last for drama)
    selected.sort((a, b) => parseValue(a.estimatedValueRaw) - parseValue(b.estimatedValueRaw));

    setPulledCards(selected);
    setActivePack(packId);
    setPhase('revealing');
    setRevealedCount(0);
    setAddedToBinder(false);

    let count = 0;
    const interval = setInterval(() => {
      count++;
      setRevealedCount(count);
      if (count >= selected.length) {
        clearInterval(interval);
        setTimeout(() => {
          setPhase('done');
          // Save to history
          setHistory(prev => {
            const entry = prev[packId] || { packId, lastOpened: '', timesOpened: 0, totalCards: 0 };
            const newHistory = {
              ...prev,
              [packId]: {
                ...entry,
                lastOpened: new Date().toISOString(),
                timesOpened: entry.timesOpened + 1,
                totalCards: entry.totalCards + selected.length,
              },
            };
            try { localStorage.setItem(PACK_HISTORY_KEY, JSON.stringify(newHistory)); } catch {}
            return newHistory;
          });
        }, 400);
      }
    }, 600);
  }, [history]);

  const addToBinder = useCallback(() => {
    if (addedToBinder || pulledCards.length === 0) return;
    try {
      const saved = localStorage.getItem(BINDER_KEY);
      const binder = saved ? JSON.parse(saved) : { collected: [], want: [], trade: [], name: '' };
      const newSlugs = pulledCards.map(c => c.slug).filter(s => !binder.collected.includes(s));
      binder.collected = [...binder.collected, ...newSlugs];
      localStorage.setItem(BINDER_KEY, JSON.stringify(binder));
      setAddedToBinder(true);
    } catch {}
  }, [pulledCards, addedToBinder]);

  function backToBrowse() {
    setPhase('browse');
    setActivePack(null);
    setPulledCards([]);
    setRevealedCount(0);
    setAddedToBinder(false);
  }

  const totalStats = useMemo(() => {
    let totalPacks = 0;
    let totalCards = 0;
    for (const entry of Object.values(history)) {
      totalPacks += entry.timesOpened;
      totalCards += entry.totalCards;
    }
    return { totalPacks, totalCards };
  }, [history]);

  if (!mounted) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-48 bg-gray-900 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-fuchsia-950/60 border border-fuchsia-800/50 text-fuchsia-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-fuchsia-400 rounded-full animate-pulse" />
          Phase 3: Digital Collectibles
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Premium Packs</h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Themed digital card packs. Pick your collection, open packs, build your binder.
        </p>
      </div>

      {/* Stats */}
      {totalStats.totalPacks > 0 && (
        <div className="flex items-center justify-center gap-6 bg-gray-900/80 border border-gray-800 rounded-xl px-5 py-3 mb-8">
          <div className="text-center">
            <p className="text-gray-500 text-xs">Packs Opened</p>
            <p className="text-white font-bold">{totalStats.totalPacks}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-xs">Cards Collected</p>
            <p className="text-emerald-400 font-bold">{totalStats.totalCards}</p>
          </div>
        </div>
      )}

      {/* Pack browser */}
      {phase === 'browse' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {PACKS.map(pack => {
            const { onCooldown, timeLeft } = isOnCooldown(pack.id);
            const pool = sportsCards.filter(pack.filter);
            const entry = history[pack.id];
            return (
              <button
                key={pack.id}
                onClick={() => !onCooldown && openPack(pack.id)}
                disabled={onCooldown}
                className={`relative text-left rounded-2xl overflow-hidden transition-all ${
                  onCooldown ? 'opacity-60 cursor-not-allowed' : 'hover:scale-[1.02] hover:shadow-xl cursor-pointer'
                }`}
              >
                <div className={`bg-gradient-to-br ${pack.gradient} p-5 h-full border ${pack.borderColor}`} style={{ borderRadius: 'inherit' }}>
                  <div className="text-3xl mb-3">{pack.icon}</div>
                  <h3 className="text-white font-bold text-lg mb-1">{pack.name}</h3>
                  <p className="text-white/70 text-xs mb-3 leading-relaxed">{pack.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-xs">{pack.cardsPerPack} cards</span>
                    <span className="text-white/60 text-xs">{pool.length} in pool</span>
                  </div>
                  {entry && (
                    <p className="text-white/50 text-[10px] mt-2">Opened {entry.timesOpened}x</p>
                  )}
                  {onCooldown && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center" style={{ borderRadius: 'inherit' }}>
                      <div className="text-center">
                        <p className="text-white/80 text-sm font-medium">Cooling down</p>
                        <p className="text-white/60 text-xs">{timeLeft}</p>
                      </div>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Revealing / Done */}
      {(phase === 'revealing' || phase === 'done') && activePack && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-white">
                {PACKS.find(p => p.id === activePack)?.name}
              </h2>
              <p className="text-gray-500 text-xs">
                {phase === 'revealing' ? `Revealing... ${revealedCount}/${pulledCards.length}` : `${pulledCards.length} cards pulled`}
              </p>
            </div>
            {phase === 'done' && (
              <button
                onClick={backToBrowse}
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                &larr; Back to packs
              </button>
            )}
          </div>

          <div className={`grid gap-3 ${
            pulledCards.length <= 3 ? 'grid-cols-3' :
            pulledCards.length <= 5 ? 'grid-cols-2 sm:grid-cols-5' :
            'grid-cols-2 sm:grid-cols-4 lg:grid-cols-7'
          } mb-6`}>
            {pulledCards.map((card, i) => {
              const isRevealed = i < revealedCount;
              const value = parseValue(card.estimatedValueRaw);
              const rarity = getRarityLabel(value);
              return (
                <div
                  key={card.slug}
                  className={`transition-all duration-500 ${isRevealed ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
                >
                  {isRevealed ? (
                    <Link href={`/sports/${card.slug}`}>
                      <div className={`bg-gray-900/80 border rounded-xl p-3 hover:border-fuchsia-600/50 transition-all ${rarity.bg}`}>
                        <div className="flex justify-center mb-2">
                          <div className="w-20 sm:w-24">
                            <CardFrame card={card} size="large" />
                          </div>
                        </div>
                        <p className="text-white text-[11px] font-semibold text-center truncate">{card.player}</p>
                        <p className="text-gray-500 text-[10px] text-center truncate">{card.year}</p>
                        <p className="text-emerald-400 text-xs font-bold text-center mt-0.5">{card.estimatedValueRaw}</p>
                        <div className="mt-1 text-center">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${rarity.color} ${rarity.bg}`}>
                            {rarity.label}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-3 min-h-[180px] flex items-center justify-center">
                      <div className="text-2xl animate-pulse">?</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {phase === 'done' && (
            <div className="bg-gradient-to-r from-fuchsia-950/40 to-purple-950/40 border border-fuchsia-800/30 rounded-2xl p-5 text-center">
              <p className="text-fuchsia-300 text-sm font-medium mb-1">Pack Value</p>
              <p className="text-3xl font-bold text-white mb-3">
                ${pulledCards.reduce((s, c) => s + parseValue(c.estimatedValueRaw), 0).toLocaleString()}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={addToBinder}
                  disabled={addedToBinder}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    addedToBinder
                      ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-800/50 cursor-default'
                      : 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white'
                  }`}
                >
                  {addedToBinder ? 'Added to Binder!' : 'Add All to Binder'}
                </button>
                <Link
                  href="/binder"
                  className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl border border-gray-700 transition-colors"
                >
                  View Binder
                </Link>
                <button
                  onClick={backToBrowse}
                  className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl border border-gray-700 transition-colors"
                >
                  Open Another
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Related */}
      <div className="border-t border-gray-800 pt-8">
        <h3 className="text-sm font-bold text-gray-400 mb-3">Related</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/digital-pack', label: 'Daily Digital Pack', desc: '5 free cards daily' },
            { href: '/binder', label: 'Digital Binder', desc: 'View your collection' },
            { href: '/tools/pack-sim', label: 'Pack Simulator', desc: 'Simulate sealed products' },
            { href: '/showcase', label: 'Trophy Case', desc: 'Show off your best' },
          ].map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="bg-gray-900 border border-gray-800 rounded-xl p-3 hover:border-fuchsia-700/40 transition-all"
            >
              <p className="text-white text-sm font-medium">{link.label}</p>
              <p className="text-gray-500 text-xs">{link.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
