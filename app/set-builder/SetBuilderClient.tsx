'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

/* ---------- Utility ---------- */

function dateHash(): number {
  const d = new Date();
  const str = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  let h = 0;
  for (let i = 0; i < str.length; i++) { h = ((h << 5) - h + str.charCodeAt(i)) | 0; }
  return Math.abs(h);
}

function seededRng(seed: number) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function todayStr(): string {
  const d = new Date();
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
}

function formatTime(ms: number): string {
  const totalSecs = Math.floor(ms / 1000);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  const tenths = Math.floor((ms % 1000) / 100);
  if (mins > 0) {
    return `${mins}:${String(secs).padStart(2, '0')}.${tenths}`;
  }
  return `${secs}.${tenths}`;
}

function getGrade(ms: number): string {
  const secs = ms / 1000;
  if (secs < 30) return 'S';
  if (secs < 45) return 'A';
  if (secs < 60) return 'B';
  if (secs < 90) return 'C';
  if (secs < 120) return 'D';
  return 'F';
}

function gradeColor(grade: string): string {
  if (grade === 'S') return 'text-yellow-400';
  if (grade === 'A') return 'text-emerald-400';
  if (grade === 'B') return 'text-blue-400';
  if (grade === 'C') return 'text-orange-400';
  return 'text-red-400';
}

/* ---------- Sport Colors ---------- */

const SPORT_COLORS: Record<string, { border: string; bg: string; text: string }> = {
  baseball: { border: 'border-l-red-500', bg: 'bg-red-500/10', text: 'text-red-400' },
  basketball: { border: 'border-l-orange-500', bg: 'bg-orange-500/10', text: 'text-orange-400' },
  football: { border: 'border-l-blue-500', bg: 'bg-blue-500/10', text: 'text-blue-400' },
  hockey: { border: 'border-l-cyan-500', bg: 'bg-cyan-500/10', text: 'text-cyan-400' },
};

/* ---------- Set Theme Types ---------- */

type SetTheme = 'all-rookie' | 'decade' | 'value' | 'sport-collection';

const THEME_LABELS: Record<SetTheme, string> = {
  'all-rookie': 'All-Rookie Set',
  'decade': 'Decade Set',
  'value': 'Value Set',
  'sport-collection': 'Sport Collection',
};

const THEME_DESCRIPTIONS: Record<SetTheme, string> = {
  'all-rookie': 'Find 8 rookie cards from the same sport',
  'decade': 'Find 8 cards from the same decade',
  'value': 'Find 8 cards with mixed values from one sport',
  'sport-collection': 'Find 8 cards from the same sport',
};

/* ---------- Card type for game ---------- */

interface GameCard {
  slug: string;
  name: string;
  year: number;
  set: string;
  sport: string;
  player: string;
  rookie: boolean;
}

/* ---------- Set Builder ---------- */

interface GameSet {
  theme: SetTheme;
  themeDetail: string;
  targetCards: GameCard[];
  poolCards: GameCard[];
  targetSlugs: Set<string>;
}

function buildGameSet(rng: () => number): GameSet {
  const sports = ['baseball', 'basketball', 'football', 'hockey'] as const;
  const themes: SetTheme[] = ['all-rookie', 'decade', 'value', 'sport-collection'];
  const theme = themes[Math.floor(rng() * themes.length)];
  const sport = sports[Math.floor(rng() * sports.length)];

  const sportCards = sportsCards.filter(c => c.sport === sport);
  let targetCards: GameCard[] = [];
  let themeDetail = '';

  if (theme === 'all-rookie') {
    const rookieCards = sportCards.filter(c => c.rookie);
    if (rookieCards.length >= 8) {
      const shuffled = shuffle(rookieCards, rng);
      targetCards = shuffled.slice(0, 8).map(c => ({
        slug: c.slug, name: c.name, year: c.year, set: c.set,
        sport: c.sport, player: c.player, rookie: c.rookie,
      }));
      themeDetail = `${sport.charAt(0).toUpperCase() + sport.slice(1)} Rookies`;
    }
  }

  if (theme === 'decade' || targetCards.length < 8) {
    const decades = [1990, 2000, 2010, 2020];
    const shuffledDecades = shuffle(decades, rng);
    for (const decade of shuffledDecades) {
      const decadeCards = sportCards.filter(c => c.year >= decade && c.year < decade + 10);
      if (decadeCards.length >= 8) {
        const shuffled = shuffle(decadeCards, rng);
        targetCards = shuffled.slice(0, 8).map(c => ({
          slug: c.slug, name: c.name, year: c.year, set: c.set,
          sport: c.sport, player: c.player, rookie: c.rookie,
        }));
        themeDetail = `${decade}s ${sport.charAt(0).toUpperCase() + sport.slice(1)}`;
        break;
      }
    }
  }

  if (theme === 'value' && targetCards.length < 8) {
    if (sportCards.length >= 8) {
      const shuffled = shuffle(sportCards, rng);
      targetCards = shuffled.slice(0, 8).map(c => ({
        slug: c.slug, name: c.name, year: c.year, set: c.set,
        sport: c.sport, player: c.player, rookie: c.rookie,
      }));
      themeDetail = `${sport.charAt(0).toUpperCase() + sport.slice(1)} Value Mix`;
    }
  }

  if (theme === 'sport-collection' && targetCards.length < 8) {
    if (sportCards.length >= 8) {
      const shuffled = shuffle(sportCards, rng);
      targetCards = shuffled.slice(0, 8).map(c => ({
        slug: c.slug, name: c.name, year: c.year, set: c.set,
        sport: c.sport, player: c.player, rookie: c.rookie,
      }));
      themeDetail = `${sport.charAt(0).toUpperCase() + sport.slice(1)} Collection`;
    }
  }

  // Fallback: just pick any 8 from the sport
  if (targetCards.length < 8) {
    const shuffled = shuffle(sportCards, rng);
    targetCards = shuffled.slice(0, 8).map(c => ({
      slug: c.slug, name: c.name, year: c.year, set: c.set,
      sport: c.sport, player: c.player, rookie: c.rookie,
    }));
    themeDetail = `${sport.charAt(0).toUpperCase() + sport.slice(1)} Mix`;
  }

  // Build decoys: 16 cards from the same sport that are NOT in the target set
  const targetSlugs = new Set(targetCards.map(c => c.slug));
  const decoyPool = sportCards.filter(c => !targetSlugs.has(c.slug));
  const shuffledDecoys = shuffle(decoyPool, rng);
  const decoys = shuffledDecoys.slice(0, 16).map(c => ({
    slug: c.slug, name: c.name, year: c.year, set: c.set,
    sport: c.sport, player: c.player, rookie: c.rookie,
  }));

  // Combine and shuffle for the card pool
  const poolCards = shuffle([...targetCards, ...decoys], rng);

  return {
    theme: targetCards.length === 8 ? theme : 'sport-collection',
    themeDetail,
    targetCards,
    poolCards,
    targetSlugs,
  };
}

/* ---------- LocalStorage Stats ---------- */

interface Stats {
  gamesPlayed: number;
  bestTime: number;      // ms, 0 = no record
  perfectGames: number;
  totalPenalties: number;
  currentStreak: number; // consecutive S/A grades
  bestStreak: number;
  lastPlayedDate: string;
  blitzBest: number;     // best blitz score (sets completed)
}

const STORAGE_KEY = 'cardvault-set-builder-stats';
const DAILY_KEY = 'cardvault-set-builder-daily';

function loadStats(): Stats {
  if (typeof window === 'undefined') return { gamesPlayed: 0, bestTime: 0, perfectGames: 0, totalPenalties: 0, currentStreak: 0, bestStreak: 0, lastPlayedDate: '', blitzBest: 0 };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { gamesPlayed: 0, bestTime: 0, perfectGames: 0, totalPenalties: 0, currentStreak: 0, bestStreak: 0, lastPlayedDate: '', blitzBest: 0 };
}

function saveStats(stats: Stats) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(stats)); } catch {}
}

function isDailyPlayed(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(DAILY_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      return data.date === todayStr();
    }
  } catch {}
  return false;
}

function saveDailyPlayed(time: number, penalties: number, grade: string) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DAILY_KEY, JSON.stringify({ date: todayStr(), time, penalties, grade }));
  } catch {}
}

/* ---------- Component ---------- */

type GameMode = 'daily' | 'practice' | 'blitz';
type GamePhase = 'menu' | 'playing' | 'results';

export default function SetBuilderClient() {
  const [phase, setPhase] = useState<GamePhase>('menu');
  const [mode, setMode] = useState<GameMode>('daily');
  const [gameSet, setGameSet] = useState<GameSet | null>(null);
  const [foundSlugs, setFoundSlugs] = useState<Set<string>>(new Set());
  const [wrongPicks, setWrongPicks] = useState(0);
  const [penaltyMs, setPenaltyMs] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [flashSlug, setFlashSlug] = useState<string | null>(null);
  const [flashWrong, setFlashWrong] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [dailyDone, setDailyDone] = useState(false);

  // Blitz state
  const [blitzTimeLeft, setBlitzTimeLeft] = useState(60000);
  const [blitzSetsCompleted, setBlitzSetsCompleted] = useState(0);
  const [blitzTotalPenalties, setBlitzTotalPenalties] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);
  const penaltyRef = useRef(0);

  // Check daily status on mount
  useEffect(() => {
    setDailyDone(isDailyPlayed());
  }, []);

  // Timer effect
  useEffect(() => {
    if (phase !== 'playing') {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      return;
    }

    timerRef.current = setInterval(() => {
      const now = Date.now();
      const raw = now - startTimeRef.current;

      if (mode === 'blitz') {
        const remaining = 60000 - raw - penaltyRef.current;
        if (remaining <= 0) {
          setBlitzTimeLeft(0);
          setPhase('results');
          return;
        }
        setBlitzTimeLeft(remaining);
      } else {
        setElapsedMs(raw + penaltyRef.current);
      }
    }, 50);

    return () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };
  }, [phase, mode]);

  const startGame = useCallback((selectedMode: GameMode) => {
    if (selectedMode === 'daily' && isDailyPlayed()) return;

    const seed = selectedMode === 'daily' ? dateHash() : Date.now();
    const rng = seededRng(seed);
    const newSet = buildGameSet(rng);

    setGameSet(newSet);
    setMode(selectedMode);
    setFoundSlugs(new Set());
    setWrongPicks(0);
    setPenaltyMs(0);
    penaltyRef.current = 0;
    setElapsedMs(0);
    setFlashSlug(null);
    setFlashWrong(null);
    setCopied(false);

    if (selectedMode === 'blitz') {
      setBlitzTimeLeft(60000);
      setBlitzSetsCompleted(0);
      setBlitzTotalPenalties(0);
    }

    startTimeRef.current = Date.now();
    setPhase('playing');
  }, []);

  const handleCardClick = useCallback((slug: string) => {
    if (phase !== 'playing' || !gameSet) return;
    if (foundSlugs.has(slug)) return;

    if (gameSet.targetSlugs.has(slug)) {
      // Correct pick
      const newFound = new Set(foundSlugs);
      newFound.add(slug);
      setFoundSlugs(newFound);
      setFlashSlug(slug);
      setTimeout(() => setFlashSlug(null), 500);

      // Check completion
      if (newFound.size === 8) {
        if (mode === 'blitz') {
          // In blitz, load next set immediately
          const completed = blitzSetsCompleted + 1;
          setBlitzSetsCompleted(completed);
          const rng = seededRng(Date.now() + completed);
          const nextSet = buildGameSet(rng);
          setGameSet(nextSet);
          setFoundSlugs(new Set());
        } else {
          // Standard modes: stop timer, go to results
          const finalTime = Date.now() - startTimeRef.current + penaltyRef.current;
          setElapsedMs(finalTime);
          setPhase('results');

          // Save stats
          const grade = getGrade(finalTime);
          const s = loadStats();
          s.gamesPlayed += 1;
          s.totalPenalties += wrongPicks;
          if (s.bestTime === 0 || finalTime < s.bestTime) s.bestTime = finalTime;
          if (wrongPicks === 0 && finalTime / 1000 < 30) s.perfectGames += 1;

          if (grade === 'S' || grade === 'A') {
            s.currentStreak += 1;
            if (s.currentStreak > s.bestStreak) s.bestStreak = s.currentStreak;
          } else {
            s.currentStreak = 0;
          }
          s.lastPlayedDate = todayStr();
          saveStats(s);

          if (mode === 'daily') {
            saveDailyPlayed(finalTime, wrongPicks, grade);
            setDailyDone(true);
          }
        }
      }
    } else {
      // Wrong pick
      const newPenalties = wrongPicks + 1;
      setWrongPicks(newPenalties);
      const newPenaltyMs = newPenalties * 3000;
      setPenaltyMs(newPenaltyMs);
      penaltyRef.current = newPenaltyMs;

      if (mode === 'blitz') {
        setBlitzTotalPenalties(prev => prev + 1);
      }

      setFlashWrong(slug);
      setTimeout(() => setFlashWrong(null), 600);
    }
  }, [phase, gameSet, foundSlugs, wrongPicks, mode, blitzSetsCompleted]);

  // Blitz results
  useEffect(() => {
    if (mode === 'blitz' && blitzTimeLeft <= 0 && phase === 'results') {
      const s = loadStats();
      s.gamesPlayed += 1;
      if (blitzSetsCompleted > s.blitzBest) s.blitzBest = blitzSetsCompleted;
      s.totalPenalties += blitzTotalPenalties;
      s.lastPlayedDate = todayStr();
      saveStats(s);
    }
  }, [phase, mode, blitzTimeLeft, blitzSetsCompleted, blitzTotalPenalties]);

  const shareResults = useCallback(async () => {
    const dayLabel = mode === 'daily' ? `Daily ${todayStr()}` : mode === 'blitz' ? 'Blitz' : 'Practice';
    let text: string;
    if (mode === 'blitz') {
      text = `Set Builder Blitz: ${blitzSetsCompleted} sets | ${blitzTotalPenalties} penalties | ${dayLabel}\nhttps://cardvault-two.vercel.app/set-builder`;
    } else {
      const grade = getGrade(elapsedMs);
      text = `Set Builder: ${formatTime(elapsedMs)} (${grade}) | ${wrongPicks} penalties | ${dayLabel}\nhttps://cardvault-two.vercel.app/set-builder`;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, [mode, elapsedMs, wrongPicks, blitzSetsCompleted, blitzTotalPenalties]);

  const stats = useMemo(() => loadStats(), []);

  /* ---------- Render ---------- */

  // Menu
  if (phase === 'menu') {
    return (
      <div className="space-y-6">
        {/* Mode selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => startGame('daily')}
            disabled={dailyDone}
            className={`font-bold py-4 px-6 rounded-xl transition-colors text-left ${
              dailyDone
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : 'bg-amber-600 hover:bg-amber-500 text-white'
            }`}
          >
            <div className="text-lg">Daily Challenge</div>
            <div className={`text-sm mt-1 ${dailyDone ? 'text-zinc-600' : 'text-amber-200'}`}>
              {dailyDone ? 'Completed today' : 'Same set for everyone'}
            </div>
          </button>
          <button
            onClick={() => startGame('practice')}
            className="bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-4 px-6 rounded-xl transition-colors text-left"
          >
            <div className="text-lg">Practice</div>
            <div className="text-zinc-300 text-sm mt-1">Random set, unlimited</div>
          </button>
          <button
            onClick={() => startGame('blitz')}
            className="bg-red-700 hover:bg-red-600 text-white font-bold py-4 px-6 rounded-xl transition-colors text-left"
          >
            <div className="text-lg">Blitz Mode</div>
            <div className="text-red-200 text-sm mt-1">60s — how many sets?</div>
          </button>
        </div>

        {/* Stats */}
        {stats.gamesPlayed > 0 && (
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Your Stats</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <div className="text-2xl font-bold text-white">{stats.gamesPlayed}</div>
                <div className="text-xs text-zinc-500">Games Played</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-400">
                  {stats.bestTime > 0 ? formatTime(stats.bestTime) : '--'}
                </div>
                <div className="text-xs text-zinc-500">Best Time</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-400">{stats.perfectGames}</div>
                <div className="text-xs text-zinc-500">Perfect Games</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">{stats.bestStreak}</div>
                <div className="text-xs text-zinc-500">Best S/A Streak</div>
              </div>
            </div>
            {stats.blitzBest > 0 && (
              <div className="mt-3 pt-3 border-t border-zinc-800">
                <span className="text-sm text-zinc-500">Blitz Record: </span>
                <span className="text-sm font-bold text-red-400">{stats.blitzBest} sets</span>
              </div>
            )}
          </div>
        )}

        {/* How to Play */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">How to Play</h3>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li className="flex items-start gap-2"><span className="text-amber-400 font-bold">1.</span> You see 8 target cards to find at the top</li>
            <li className="flex items-start gap-2"><span className="text-amber-400 font-bold">2.</span> Click matching cards from the shuffled pool of 24 below</li>
            <li className="flex items-start gap-2"><span className="text-red-400 font-bold">!</span> Wrong picks add a 3-second time penalty</li>
            <li className="flex items-start gap-2"><span className="text-amber-400 font-bold">3.</span> Complete the set as fast as you can for the best grade</li>
          </ul>
        </div>
      </div>
    );
  }

  // Playing
  if (phase === 'playing' && gameSet) {
    const timerDisplay = mode === 'blitz' ? formatTime(Math.max(0, blitzTimeLeft)) : formatTime(elapsedMs);
    const sportColor = SPORT_COLORS[gameSet.targetCards[0]?.sport] || SPORT_COLORS.baseball;

    return (
      <div className="space-y-4">
        {/* Top bar: timer + info */}
        <div className="flex items-center justify-between bg-zinc-900/80 border border-zinc-800 rounded-xl px-4 py-3">
          <div className="flex items-center gap-4">
            <div>
              <div className="text-xs text-zinc-500">
                {mode === 'blitz' ? 'Time Left' : 'Time'}
              </div>
              <div className={`text-2xl font-mono font-bold ${
                mode === 'blitz' && blitzTimeLeft < 10000 ? 'text-red-400 animate-pulse' : 'text-amber-400'
              }`}>
                {timerDisplay}
              </div>
            </div>
            <div className="border-l border-zinc-700 pl-4">
              <div className="text-xs text-zinc-500">Found</div>
              <div className="text-lg font-bold text-white">{foundSlugs.size}/8</div>
            </div>
            {wrongPicks > 0 && (
              <div className="border-l border-zinc-700 pl-4">
                <div className="text-xs text-zinc-500">Penalties</div>
                <div className="text-lg font-bold text-red-400">{wrongPicks} (+{wrongPicks * 3}s)</div>
              </div>
            )}
          </div>
          <div className="text-right">
            {mode === 'blitz' && (
              <div>
                <div className="text-xs text-zinc-500">Sets</div>
                <div className="text-lg font-bold text-emerald-400">{blitzSetsCompleted}</div>
              </div>
            )}
            <div className="text-xs text-zinc-500 mt-1">{gameSet.themeDetail}</div>
          </div>
        </div>

        {/* Target set slots */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
          <div className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-3">
            Target Set: {THEME_LABELS[gameSet.theme]} — {THEME_DESCRIPTIONS[gameSet.theme]}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {gameSet.targetCards.map((card) => {
              const isFound = foundSlugs.has(card.slug);
              const justFound = flashSlug === card.slug;
              return (
                <div
                  key={card.slug}
                  className={`rounded-lg p-2.5 border-l-4 transition-all duration-300 ${
                    isFound
                      ? justFound
                        ? `${sportColor.border} bg-emerald-900/40 border border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.3)] scale-105`
                        : `${sportColor.border} bg-emerald-900/20 border border-emerald-700/40`
                      : 'border-l-zinc-700 bg-zinc-800/40 border border-zinc-700/40'
                  }`}
                >
                  {isFound ? (
                    <div>
                      <p className="text-emerald-300 text-xs font-medium truncate">{card.player}</p>
                      <p className="text-emerald-500/60 text-[10px] truncate">{card.year} {card.set}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-zinc-500 text-xs font-medium">{card.player}</p>
                      <p className="text-zinc-600 text-[10px]">{card.year} {card.set}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Card pool */}
        <div>
          <div className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-2">
            Card Pool — click to pick
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {gameSet.poolCards.map((card) => {
              const isFound = foundSlugs.has(card.slug);
              const isWrongFlash = flashWrong === card.slug;
              const sc = SPORT_COLORS[card.sport] || SPORT_COLORS.baseball;

              if (isFound) {
                return (
                  <div
                    key={card.slug}
                    className={`rounded-lg p-3 border-l-4 border-l-emerald-500 bg-emerald-900/20 border border-emerald-700/30 opacity-40`}
                  >
                    <p className="text-emerald-400 text-xs font-medium truncate">{card.player}</p>
                    <p className="text-emerald-600 text-[10px] truncate">{card.year} {card.set}</p>
                    {card.rookie && <span className="text-[9px] text-emerald-500 font-semibold">RC</span>}
                  </div>
                );
              }

              return (
                <button
                  key={card.slug}
                  onClick={() => handleCardClick(card.slug)}
                  className={`rounded-lg p-3 border-l-4 text-left transition-all duration-150 cursor-pointer ${
                    isWrongFlash
                      ? 'border-l-red-500 bg-red-900/40 border border-red-500/60 shake'
                      : `${sc.border} ${sc.bg} border border-zinc-700/40 hover:border-zinc-500/60 hover:bg-zinc-800/80`
                  }`}
                >
                  <p className="text-zinc-200 text-xs font-medium truncate">{card.player}</p>
                  <p className="text-zinc-500 text-[10px] truncate">{card.year} {card.set}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`text-[9px] ${sc.text} capitalize`}>{card.sport}</span>
                    {card.rookie && <span className="text-[9px] text-yellow-400 font-semibold">RC</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Back button */}
        <div className="flex justify-center">
          <button
            onClick={() => setPhase('menu')}
            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Quit Game
          </button>
        </div>

        {/* Shake animation for wrong picks */}
        <style>{`
          .shake {
            animation: shake 0.4s ease-in-out;
          }
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-4px); }
            40% { transform: translateX(4px); }
            60% { transform: translateX(-4px); }
            80% { transform: translateX(4px); }
          }
        `}</style>
      </div>
    );
  }

  // Results
  if (phase === 'results') {
    if (mode === 'blitz') {
      const blitzGrade = blitzSetsCompleted >= 5 ? 'S' : blitzSetsCompleted >= 4 ? 'A' : blitzSetsCompleted >= 3 ? 'B' : blitzSetsCompleted >= 2 ? 'C' : blitzSetsCompleted >= 1 ? 'D' : 'F';

      return (
        <div className="space-y-6">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 text-center space-y-4">
            <div className="text-sm text-zinc-500 uppercase tracking-wider font-medium">Blitz Results</div>
            <div className="text-5xl font-black text-amber-400">
              {blitzSetsCompleted} {blitzSetsCompleted === 1 ? 'Set' : 'Sets'}
            </div>
            <div className={`text-4xl font-black ${gradeColor(blitzGrade)}`}>
              Grade: {blitzGrade}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white">{blitzSetsCompleted}</div>
              <div className="text-xs text-zinc-500">Sets Completed</div>
            </div>
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-red-400">{blitzTotalPenalties}</div>
              <div className="text-xs text-zinc-500">Total Penalties</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={shareResults}
              className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 px-6 rounded-xl transition-colors"
            >
              {copied ? 'Copied!' : 'Share Results'}
            </button>
            <button
              onClick={() => setPhase('menu')}
              className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
            >
              Play Again
            </button>
          </div>
        </div>
      );
    }

    // Standard results (daily / practice)
    const grade = getGrade(elapsedMs);
    const isPerfect = wrongPicks === 0 && elapsedMs / 1000 < 30;

    return (
      <div className="space-y-6">
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 text-center space-y-4">
          <div className="text-sm text-zinc-500 uppercase tracking-wider font-medium">
            {isPerfect ? 'PERFECT GAME!' : 'Set Complete!'}
          </div>
          <div className="text-5xl font-mono font-black text-amber-400">
            {formatTime(elapsedMs)}
          </div>
          <div className={`text-4xl font-black ${gradeColor(grade)}`}>
            Grade: {grade}
          </div>
          {isPerfect && (
            <div className="text-yellow-400 text-sm font-medium animate-pulse">
              No mistakes, under 30 seconds!
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-mono font-bold text-white">{formatTime(elapsedMs)}</div>
            <div className="text-xs text-zinc-500">Total Time</div>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{wrongPicks}</div>
            <div className="text-xs text-zinc-500">Wrong Picks</div>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{wrongPicks > 0 ? `+${wrongPicks * 3}s` : '0s'}</div>
            <div className="text-xs text-zinc-500">Penalty Time</div>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-amber-400">{mode === 'daily' ? 'Daily' : 'Practice'}</div>
            <div className="text-xs text-zinc-500">Mode</div>
          </div>
        </div>

        {/* Card breakdown */}
        {gameSet && (
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              {gameSet.themeDetail} — Completed Set
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {gameSet.targetCards.map((card) => {
                const sc = SPORT_COLORS[card.sport] || SPORT_COLORS.baseball;
                return (
                  <div key={card.slug} className={`rounded-lg p-2.5 border-l-4 ${sc.border} bg-emerald-900/20 border border-emerald-700/30`}>
                    <p className="text-emerald-300 text-xs font-medium truncate">{card.player}</p>
                    <p className="text-emerald-500/60 text-[10px] truncate">{card.year} {card.set}</p>
                    {card.rookie && <span className="text-[9px] text-yellow-400 font-semibold">RC</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={shareResults}
            className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 px-6 rounded-xl transition-colors"
          >
            {copied ? 'Copied!' : 'Share Results'}
          </button>
          <button
            onClick={() => setPhase('menu')}
            className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }

  // Fallback
  return null;
}
