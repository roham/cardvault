'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import CardFrame from '@/components/CardFrame';
import { sportsCards, type SportsCard } from '@/data/sports-cards';

const STORAGE_KEY = 'cardvault-digital-pack';
const BINDER_KEY = 'cardvault-binder';
const CARDS_PER_PACK = 5;

interface PackHistory {
  lastOpenDate: string;
  streak: number;
  totalPacks: number;
  totalCards: number;
  bestPull: { slug: string; value: number } | null;
  history: Array<{
    date: string;
    slugs: string[];
    totalValue: number;
  }>;
}

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

function dateHash(dateStr: string): number {
  let hash = 0;
  const str = 'cardvault-digital-' + dateStr;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function parseValue(v: string): number {
  const m = v.match(/\$([\d,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
}

// Weighted selection: higher-value cards are rarer
function selectDailyCards(dateStr: string): SportsCard[] {
  const seed = dateHash(dateStr);
  const pool = sportsCards.filter(c => c.sport !== 'baseball' || c.player !== 'Pokemon');

  // Create weighted pools
  const tiers = {
    common: pool.filter(c => parseValue(c.estimatedValueRaw) < 50),
    uncommon: pool.filter(c => { const v = parseValue(c.estimatedValueRaw); return v >= 50 && v < 500; }),
    rare: pool.filter(c => { const v = parseValue(c.estimatedValueRaw); return v >= 500 && v < 5000; }),
    ultra: pool.filter(c => parseValue(c.estimatedValueRaw) >= 5000),
  };

  const selected: SportsCard[] = [];
  const usedIndices = new Set<number>();

  function pick(tierPool: SportsCard[], s: number): SportsCard {
    let idx = s % tierPool.length;
    let attempts = 0;
    while (usedIndices.has(idx) && attempts < tierPool.length) {
      idx = (idx + 1) % tierPool.length;
      attempts++;
    }
    usedIndices.add(idx);
    return tierPool[idx];
  }

  // Pack composition: 2 common, 1-2 uncommon, 0-1 rare, small chance of ultra
  // Deterministic based on date seed
  const rarityRoll = (seed >> 3) % 100;

  if (rarityRoll < 5 && tiers.ultra.length > 0) {
    // 5% chance: 2 common, 1 uncommon, 1 rare, 1 ultra rare
    selected.push(pick(tiers.common, seed));
    selected.push(pick(tiers.common, seed * 7));
    selected.push(pick(tiers.uncommon.length > 0 ? tiers.uncommon : tiers.common, seed * 13));
    selected.push(pick(tiers.rare.length > 0 ? tiers.rare : tiers.uncommon, seed * 19));
    selected.push(pick(tiers.ultra, seed * 31));
  } else if (rarityRoll < 25 && tiers.rare.length > 0) {
    // 20% chance: 2 common, 2 uncommon, 1 rare
    selected.push(pick(tiers.common, seed));
    selected.push(pick(tiers.common, seed * 7));
    selected.push(pick(tiers.uncommon.length > 0 ? tiers.uncommon : tiers.common, seed * 13));
    selected.push(pick(tiers.uncommon.length > 0 ? tiers.uncommon : tiers.common, seed * 19));
    selected.push(pick(tiers.rare, seed * 31));
  } else {
    // 75% chance: 2 common, 2 uncommon, 1 common/uncommon
    selected.push(pick(tiers.common, seed));
    selected.push(pick(tiers.common, seed * 7));
    selected.push(pick(tiers.uncommon.length > 0 ? tiers.uncommon : tiers.common, seed * 13));
    selected.push(pick(tiers.uncommon.length > 0 ? tiers.uncommon : tiers.common, seed * 19));
    selected.push(pick(tiers.common, seed * 31));
  }

  return selected;
}

function getRarityLabel(value: number): { label: string; color: string; bg: string } {
  if (value >= 5000) return { label: 'ULTRA RARE', color: 'text-yellow-300', bg: 'bg-yellow-500/20 border-yellow-500/50' };
  if (value >= 500) return { label: 'RARE', color: 'text-purple-300', bg: 'bg-purple-500/20 border-purple-500/50' };
  if (value >= 50) return { label: 'UNCOMMON', color: 'text-blue-300', bg: 'bg-blue-500/20 border-blue-500/50' };
  return { label: 'COMMON', color: 'text-gray-400', bg: 'bg-gray-700/30 border-gray-600/50' };
}

function getTimeUntilReset(): string {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const diff = tomorrow.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

export default function DigitalPackClient() {
  const [mounted, setMounted] = useState(false);
  const [packState, setPackState] = useState<PackHistory>({
    lastOpenDate: '',
    streak: 0,
    totalPacks: 0,
    totalCards: 0,
    bestPull: null,
    history: [],
  });
  const [phase, setPhase] = useState<'ready' | 'revealing' | 'done'>('ready');
  const [revealedCount, setRevealedCount] = useState(0);
  const [alreadyOpened, setAlreadyOpened] = useState(false);
  const [countdown, setCountdown] = useState('');
  const [addedToBinder, setAddedToBinder] = useState(false);

  const today = getTodayKey();
  const todayCards = useMemo(() => selectDailyCards(today), [today]);
  const packValue = useMemo(() => todayCards.reduce((sum, c) => sum + parseValue(c.estimatedValueRaw), 0), [todayCards]);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: PackHistory = JSON.parse(saved);
        setPackState(parsed);
        if (parsed.lastOpenDate === today) {
          setAlreadyOpened(true);
          setPhase('done');
          setRevealedCount(CARDS_PER_PACK);
        }
      }
    } catch {}
  }, [today]);

  // Countdown timer
  useEffect(() => {
    if (!alreadyOpened && phase !== 'done') return;
    const update = () => setCountdown(getTimeUntilReset());
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [alreadyOpened, phase]);

  const openPack = useCallback(() => {
    if (alreadyOpened || phase !== 'ready') return;
    setPhase('revealing');

    // Reveal cards one at a time with delay
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setRevealedCount(count);
      if (count >= CARDS_PER_PACK) {
        clearInterval(interval);
        setTimeout(() => {
          setPhase('done');

          // Update streak
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayKey = yesterday.toISOString().split('T')[0];

          setPackState(prev => {
            const isConsecutive = prev.lastOpenDate === yesterdayKey;
            const newStreak = isConsecutive ? prev.streak + 1 : 1;
            const bestValue = Math.max(...todayCards.map(c => parseValue(c.estimatedValueRaw)));
            const bestCard = todayCards.find(c => parseValue(c.estimatedValueRaw) === bestValue);
            const newBest = !prev.bestPull || bestValue > prev.bestPull.value
              ? { slug: bestCard?.slug || '', value: bestValue }
              : prev.bestPull;

            const newState: PackHistory = {
              lastOpenDate: today,
              streak: newStreak,
              totalPacks: prev.totalPacks + 1,
              totalCards: prev.totalCards + CARDS_PER_PACK,
              bestPull: newBest,
              history: [
                { date: today, slugs: todayCards.map(c => c.slug), totalValue: packValue },
                ...prev.history.slice(0, 29), // Keep last 30 days
              ],
            };

            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(newState)); } catch {}
            return newState;
          });

          setAlreadyOpened(true);
        }, 400);
      }
    }, 600);
  }, [alreadyOpened, phase, today, todayCards, packValue]);

  const addAllToBinder = useCallback(() => {
    if (addedToBinder) return;
    try {
      const saved = localStorage.getItem(BINDER_KEY);
      const binder = saved ? JSON.parse(saved) : { collected: [], want: [], trade: [], name: '' };
      const newSlugs = todayCards.map(c => c.slug).filter(s => !binder.collected.includes(s));
      binder.collected = [...binder.collected, ...newSlugs];
      localStorage.setItem(BINDER_KEY, JSON.stringify(binder));
      setAddedToBinder(true);
    } catch {}
  }, [todayCards, addedToBinder]);

  if (!mounted) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-64 bg-gray-900 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-violet-950/60 border border-violet-800/50 text-violet-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
          Phase 3: Digital Collectibles
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Daily Digital Pack</h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          5 free cards for your binder every day. Collect them all.
        </p>
      </div>

      {/* Stats bar */}
      <div className="flex flex-wrap items-center justify-center gap-6 bg-gray-900/80 border border-gray-800 rounded-xl px-5 py-3 mb-8">
        <div className="text-center">
          <p className="text-gray-500 text-xs">Streak</p>
          <p className="text-orange-400 font-bold">{packState.streak} day{packState.streak !== 1 ? 's' : ''}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-500 text-xs">Packs Opened</p>
          <p className="text-white font-bold">{packState.totalPacks}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-500 text-xs">Cards Collected</p>
          <p className="text-emerald-400 font-bold">{packState.totalCards}</p>
        </div>
        {packState.bestPull && (
          <div className="text-center">
            <p className="text-gray-500 text-xs">Best Pull</p>
            <p className="text-yellow-400 font-bold">${packState.bestPull.value.toLocaleString()}</p>
          </div>
        )}
      </div>

      {/* Pack area */}
      {phase === 'ready' && !alreadyOpened && (
        <div className="text-center mb-8">
          <button
            onClick={openPack}
            className="group relative inline-flex items-center justify-center"
          >
            <div className="w-48 h-64 bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 rounded-2xl shadow-2xl shadow-violet-900/50 flex flex-col items-center justify-center gap-3 group-hover:scale-105 group-hover:shadow-violet-700/50 transition-all cursor-pointer border-2 border-violet-500/30">
              <div className="text-5xl">&#127183;</div>
              <p className="text-white font-bold text-lg">Open Pack</p>
              <p className="text-violet-200 text-xs">{CARDS_PER_PACK} cards inside</p>
            </div>
            <div className="absolute inset-0 rounded-2xl bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          <p className="text-gray-500 text-xs mt-4">Tap to reveal your daily cards</p>
        </div>
      )}

      {/* Revealing / Done state */}
      {(phase === 'revealing' || phase === 'done') && (
        <div className="mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 mb-6">
            {todayCards.map((card, i) => {
              const isRevealed = i < revealedCount;
              const value = parseValue(card.estimatedValueRaw);
              const rarity = getRarityLabel(value);

              return (
                <div
                  key={card.slug}
                  className={`relative transition-all duration-500 ${
                    isRevealed ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                  }`}
                >
                  {isRevealed ? (
                    <Link href={`/sports/${card.slug}`}>
                      <div className={`bg-gray-900/80 border rounded-xl p-3 hover:border-violet-600/50 transition-all ${rarity.bg}`}>
                        <div className="flex justify-center mb-2">
                          <div className="w-20 sm:w-24">
                            <CardFrame card={card} size="large" />
                          </div>
                        </div>
                        <p className="text-white text-[11px] font-semibold text-center truncate">{card.player}</p>
                        <p className="text-gray-500 text-[10px] text-center truncate">{card.year} {card.set.split(' ').slice(1, 2).join(' ')}</p>
                        <p className="text-emerald-400 text-xs font-bold text-center mt-0.5">{card.estimatedValueRaw}</p>
                        <div className="mt-1.5 text-center">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${rarity.color} ${rarity.bg}`}>
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

          {/* Pack summary */}
          {phase === 'done' && (
            <div className="bg-gradient-to-r from-violet-950/40 to-indigo-950/40 border border-violet-800/30 rounded-2xl p-5 text-center">
              <p className="text-violet-300 text-sm font-medium mb-1">Pack Value</p>
              <p className="text-3xl font-bold text-white mb-3">${packValue.toLocaleString()}</p>

              <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
                <button
                  onClick={addAllToBinder}
                  disabled={addedToBinder}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    addedToBinder
                      ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-800/50 cursor-default'
                      : 'bg-violet-600 hover:bg-violet-500 text-white'
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
              </div>

              {countdown && (
                <p className="text-gray-500 text-xs">
                  Next pack in <span className="text-violet-400 font-medium">{countdown}</span>
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Already opened today */}
      {alreadyOpened && phase === 'done' && (
        <div className="text-center text-gray-500 text-sm mb-8">
          {!addedToBinder && (
            <button
              onClick={addAllToBinder}
              className="text-violet-400 hover:text-violet-300 transition-colors underline underline-offset-2 mr-3"
            >
              Add today&apos;s cards to binder
            </button>
          )}
        </div>
      )}

      {/* Recent history */}
      {packState.history.length > 1 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-white mb-3">Recent Packs</h2>
          <div className="space-y-2">
            {packState.history.slice(1, 8).map(entry => (
              <div key={entry.date} className="flex items-center justify-between bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-3">
                <div>
                  <p className="text-white text-sm font-medium">{new Date(entry.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                  <p className="text-gray-500 text-xs">{entry.slugs.length} cards</p>
                </div>
                <p className="text-emerald-400 text-sm font-bold">${entry.totalValue.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related */}
      <div className="border-t border-gray-800 pt-8">
        <h3 className="text-sm font-bold text-gray-400 mb-3">Related</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/binder', label: 'Digital Binder', desc: 'View your collection' },
            { href: '/tools/daily-pack', label: 'Daily Pack Sim', desc: 'Simulate sealed products' },
            { href: '/tools/pack-sim', label: 'Pack Simulator', desc: 'Unlimited pack opens' },
            { href: '/my-hub', label: 'Collector Hub', desc: 'Your daily dashboard' },
          ].map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="bg-gray-900 border border-gray-800 rounded-xl p-3 hover:border-violet-700/40 transition-all"
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
