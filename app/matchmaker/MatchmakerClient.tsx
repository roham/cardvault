'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';

// ─── Card pool type ─────────────────────────────────────────────────
interface MatchCard {
  slug: string;
  name: string;
  player: string;
  sport: 'baseball' | 'basketball' | 'football' | 'hockey';
  year: number;
  set: string;
  estimatedValueRaw: string;
  rookie: boolean;
  description: string;
}

// ─── Seeded RNG for daily consistency ────────────────────────────────
function seededRNG(seed: number) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}
function dateHash(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

// ─── Sport config ───────────────────────────────────────────────────
const SPORT_CONFIG: Record<string, { emoji: string; color: string; bg: string; border: string }> = {
  baseball: { emoji: '⚾', color: 'text-red-400', bg: 'bg-red-950/30', border: 'border-red-800/50' },
  basketball: { emoji: '🏀', color: 'text-orange-400', bg: 'bg-orange-950/30', border: 'border-orange-800/50' },
  football: { emoji: '🏈', color: 'text-green-400', bg: 'bg-green-950/30', border: 'border-green-800/50' },
  hockey: { emoji: '🏒', color: 'text-blue-400', bg: 'bg-blue-950/30', border: 'border-blue-800/50' },
};

const LS_KEY = 'cv_matchmaker';

interface MatchState {
  liked: string[];     // slugs
  passed: string[];    // slugs
  streak: number;
  totalSwipes: number;
  lastDate: string;
  preferences: {
    sportCounts: Record<string, number>;
    eraCounts: Record<string, number>;
    rookieLikes: number;
    veteranLikes: number;
  };
}

function getStoredState(): MatchState {
  if (typeof window === 'undefined') return defaultState();
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return defaultState();
}

function defaultState(): MatchState {
  return {
    liked: [], passed: [], streak: 0, totalSwipes: 0,
    lastDate: new Date().toISOString().split('T')[0],
    preferences: { sportCounts: {}, eraCounts: {}, rookieLikes: 0, veteranLikes: 0 },
  };
}

export default function MatchmakerClient({ cards }: { cards: MatchCard[] }) {
  const [state, setState] = useState<MatchState>(defaultState);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDir, setSwipeDir] = useState<'left' | 'right' | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load state from localStorage
  useEffect(() => {
    const s = getStoredState();
    const today = new Date().toISOString().split('T')[0];
    // Reset daily queue but keep preferences
    if (s.lastDate !== today) {
      s.lastDate = today;
      s.liked = [];
      s.passed = [];
    }
    setState(s);
    setLoaded(true);
  }, []);

  // Save state
  useEffect(() => {
    if (loaded) {
      localStorage.setItem(LS_KEY, JSON.stringify(state));
    }
  }, [state, loaded]);

  // Daily shuffled card pool (20 cards)
  const dailyPool = useMemo(() => {
    const rng = seededRNG(dateHash());
    const shuffled = [...cards].sort(() => rng() - 0.5);
    return shuffled.slice(0, 20);
  }, [cards]);

  // Cards not yet swiped
  const unswiped = useMemo(() => {
    const seen = new Set([...state.liked, ...state.passed]);
    return dailyPool.filter(c => !seen.has(c.slug));
  }, [dailyPool, state.liked, state.passed]);

  const currentCard = unswiped[0];
  const progress = dailyPool.length - unswiped.length;
  const total = dailyPool.length;

  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    if (!currentCard) return;

    setSwipeDir(direction);

    setTimeout(() => {
      setState(prev => {
        const next = { ...prev };
        next.totalSwipes++;

        if (direction === 'right') {
          next.liked = [...prev.liked, currentCard.slug];
          next.streak = prev.streak + 1;
          // Update preferences
          const prefs = { ...prev.preferences };
          prefs.sportCounts = { ...prefs.sportCounts };
          prefs.sportCounts[currentCard.sport] = (prefs.sportCounts[currentCard.sport] || 0) + 1;
          const era = currentCard.year < 1980 ? 'vintage' : currentCard.year < 2000 ? 'junk-era' : currentCard.year < 2020 ? 'modern' : 'ultra-modern';
          prefs.eraCounts = { ...prefs.eraCounts };
          prefs.eraCounts[era] = (prefs.eraCounts[era] || 0) + 1;
          if (currentCard.rookie) prefs.rookieLikes++;
          else prefs.veteranLikes++;
          next.preferences = prefs;
        } else {
          next.passed = [...prev.passed, currentCard.slug];
        }

        return next;
      });

      setSwipeDir(null);

      // Check if done
      if (unswiped.length <= 1) {
        setShowResults(true);
      }
    }, 300);
  }, [currentCard, unswiped.length]);

  // Keyboard support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handleSwipe('left');
      if (e.key === 'ArrowRight') handleSwipe('right');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSwipe]);

  // Derive taste profile from preferences
  const tasteProfile = useMemo(() => {
    const { sportCounts, eraCounts, rookieLikes, veteranLikes } = state.preferences;
    const topSport = Object.entries(sportCounts).sort((a, b) => b[1] - a[1])[0];
    const topEra = Object.entries(eraCounts).sort((a, b) => b[1] - a[1])[0];
    const prefersRookies = rookieLikes > veteranLikes;

    let type = 'Explorer';
    if (topSport && topSport[1] >= 5) {
      type = `${topSport[0].charAt(0).toUpperCase() + topSport[0].slice(1)} Specialist`;
    }
    if (rookieLikes >= 8) type = 'Rookie Hunter';
    if (topEra && topEra[0] === 'vintage' && topEra[1] >= 3) type = 'Vintage Connoisseur';
    if (state.totalSwipes >= 50 && state.liked.length / Math.max(1, state.totalSwipes) > 0.7) type = 'Card Lover';
    if (state.totalSwipes >= 50 && state.liked.length / Math.max(1, state.totalSwipes) < 0.3) type = 'Selective Collector';

    return { topSport, topEra, prefersRookies, type };
  }, [state]);

  if (!loaded) {
    return <div className="text-center py-20 text-gray-500">Loading...</div>;
  }

  // ─── Results view ─────────────────────────────────────────────────
  if (showResults || (!currentCard && progress > 0)) {
    const likedCards = dailyPool.filter(c => state.liked.includes(c.slug));
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="text-5xl mb-3">🎯</div>
          <h2 className="text-2xl font-bold text-white mb-2">Today&apos;s Matches</h2>
          <p className="text-gray-400">You liked {state.liked.length} of {total} cards today</p>
        </div>

        {/* Taste Profile */}
        <div className="bg-gradient-to-r from-emerald-950/30 to-blue-950/30 border border-emerald-800/50 rounded-xl p-6 text-center">
          <div className="text-sm text-gray-400 uppercase tracking-wide mb-1">Your Collector Type</div>
          <div className="text-2xl font-bold text-emerald-400 mb-2">{tasteProfile.type}</div>
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            {tasteProfile.topSport && (
              <span className="bg-gray-800 px-3 py-1 rounded-full text-gray-300">
                {SPORT_CONFIG[tasteProfile.topSport[0]]?.emoji} Loves {tasteProfile.topSport[0]}
              </span>
            )}
            {tasteProfile.topEra && (
              <span className="bg-gray-800 px-3 py-1 rounded-full text-gray-300">
                {tasteProfile.topEra[0] === 'vintage' ? '🏛️' : tasteProfile.topEra[0] === 'ultra-modern' ? '✨' : '📅'} {tasteProfile.topEra[0]} era fan
              </span>
            )}
            <span className="bg-gray-800 px-3 py-1 rounded-full text-gray-300">
              {tasteProfile.prefersRookies ? '🌟 Rookie hunter' : '👑 Veterans preferred'}
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-3">
            {state.totalSwipes} total swipes all time · {state.streak} day streak
          </div>
        </div>

        {/* Liked cards */}
        {likedCards.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Cards You Liked Today</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {likedCards.map(card => {
                const sc = SPORT_CONFIG[card.sport];
                return (
                  <Link key={card.slug} href={`/sports/${card.slug}`}
                    className={`${sc.bg} border ${sc.border} rounded-xl p-4 hover:opacity-80 transition-opacity`}>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{sc.emoji}</span>
                      <div>
                        <div className="font-medium text-white text-sm">{card.player}</div>
                        <div className="text-xs text-gray-400">{card.set}</div>
                        <div className="text-xs text-emerald-400 mt-1">{card.estimatedValueRaw}</div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Come back tomorrow */}
        <div className="text-center py-4">
          <p className="text-gray-400 text-sm mb-4">Come back tomorrow for 20 new cards to swipe!</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/tools" className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm transition-colors">
              Browse All Tools
            </Link>
            <Link href="/daily-pack" className="bg-emerald-700 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm transition-colors">
              Open Daily Pack
            </Link>
            <Link href="/trivia" className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors">
              Play Trivia
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── No cards state ───────────────────────────────────────────────
  if (!currentCard) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">🃏</div>
        <h2 className="text-xl font-bold text-white mb-2">No Cards Available</h2>
        <p className="text-gray-400">Check back tomorrow for a fresh batch of 20 cards!</p>
      </div>
    );
  }

  // ─── Swipe card view ──────────────────────────────────────────────
  const sc = SPORT_CONFIG[currentCard.sport];

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${(progress / total) * 100}%` }} />
        </div>
        <span className="text-sm text-gray-400 font-mono">{progress}/{total}</span>
      </div>

      {/* Card */}
      <div className={`relative transition-all duration-300 ${swipeDir === 'left' ? '-translate-x-full opacity-0 rotate-[-15deg]' : swipeDir === 'right' ? 'translate-x-full opacity-0 rotate-[15deg]' : ''}`}>
        <div className={`${sc.bg} border-2 ${sc.border} rounded-2xl p-6 sm:p-8 min-h-[400px] flex flex-col`}>
          {/* Sport badge */}
          <div className="flex items-center justify-between mb-4">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${sc.bg} ${sc.color} border ${sc.border}`}>
              {sc.emoji} {currentCard.sport.charAt(0).toUpperCase() + currentCard.sport.slice(1)}
            </span>
            <div className="flex items-center gap-2">
              {currentCard.rookie && (
                <span className="bg-amber-950/60 border border-amber-800/50 text-amber-400 text-xs px-2 py-0.5 rounded-full">RC</span>
              )}
              <span className="text-xs text-gray-500">{currentCard.year}</span>
            </div>
          </div>

          {/* Player & card name */}
          <div className="flex-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">{currentCard.player}</h2>
            <p className="text-sm text-gray-400 mb-4">{currentCard.set} #{currentCard.name.split('#')[1] || ''}</p>

            {/* Value */}
            <div className="bg-gray-900/50 rounded-lg p-4 mb-4">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Estimated Value</div>
              <div className="text-lg font-bold text-emerald-400">{currentCard.estimatedValueRaw}</div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-300 leading-relaxed">{currentCard.description}</p>
          </div>

          {/* Card link */}
          <div className="mt-4 text-center">
            <Link href={`/sports/${currentCard.slug}`} className="text-xs text-gray-500 hover:text-gray-300 underline">
              View full card page →
            </Link>
          </div>
        </div>
      </div>

      {/* Swipe buttons */}
      <div className="flex items-center justify-center gap-6">
        <button onClick={() => handleSwipe('left')}
          className="w-16 h-16 rounded-full bg-red-950/50 border-2 border-red-800 text-red-400 text-2xl flex items-center justify-center hover:bg-red-900/60 hover:scale-110 transition-all active:scale-95"
          aria-label="Pass">
          ✕
        </button>
        <div className="text-xs text-gray-500 text-center">
          <div>← or →</div>
          <div>keyboard</div>
        </div>
        <button onClick={() => handleSwipe('right')}
          className="w-16 h-16 rounded-full bg-emerald-950/50 border-2 border-emerald-800 text-emerald-400 text-2xl flex items-center justify-center hover:bg-emerald-900/60 hover:scale-110 transition-all active:scale-95"
          aria-label="Like">
          ♥
        </button>
      </div>

      {/* Stats bar */}
      <div className="flex justify-center gap-6 text-sm text-gray-500">
        <span>♥ {state.liked.length} liked today</span>
        <span>✕ {state.passed.length} passed</span>
        <span>{state.totalSwipes} total all-time</span>
      </div>
    </div>
  );
}
