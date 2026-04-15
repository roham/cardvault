'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Expert';
type Sport = 'baseball' | 'basketball' | 'football' | 'hockey' | 'multi';
type ChallengeStatus = 'active' | 'completed' | 'expired';

interface ChallengeDefinition {
  id: string;
  title: string;
  description: string;
  goal: number;
  xp: number;
  badge: string;
  difficulty: Difficulty;
  sport: Sport;
}

interface ChallengeProgress {
  challengeId: string;
  weekKey: string;
  current: number;
  status: ChallengeStatus;
  completedAt?: string;
}

interface ChallengeHistory {
  challengeId: string;
  title: string;
  weekKey: string;
  completedAt: string;
  xp: number;
  badge: string;
  difficulty: Difficulty;
  sport: Sport;
}

interface Stats {
  totalCompleted: number;
  currentStreak: number;
  totalXP: number;
  completedBySport: Record<Sport, number>;
}

/* ------------------------------------------------------------------ */
/* Challenge Bank (24 challenges)                                      */
/* ------------------------------------------------------------------ */

const CHALLENGE_BANK: ChallengeDefinition[] = [
  { id: 'rookie-rush', title: 'Rookie Rush', description: 'Add 5 rookie cards to your binder this week', goal: 5, xp: 50, badge: 'Rookie Scout', difficulty: 'Easy', sport: 'multi' },
  { id: 'team-builder', title: 'Team Builder', description: 'Collect 3 cards from the same team', goal: 3, xp: 100, badge: 'Team Captain', difficulty: 'Medium', sport: 'multi' },
  { id: 'vintage-hunter', title: 'Vintage Hunter', description: 'Find 2 pre-1980 cards', goal: 2, xp: 200, badge: 'Time Traveler', difficulty: 'Hard', sport: 'multi' },
  { id: 'budget-sniper', title: 'Budget Sniper', description: 'Add 5 cards valued under $5 each', goal: 5, xp: 50, badge: 'Bargain Hunter', difficulty: 'Easy', sport: 'multi' },
  { id: 'cross-sport', title: 'Cross-Sport Collector', description: 'Add cards from 3 different sports', goal: 3, xp: 100, badge: 'Multisport Maven', difficulty: 'Medium', sport: 'multi' },
  { id: 'gem-mint', title: 'Gem Mint Dreamer', description: 'Find 3 cards with PSA 10 potential (gem value > 3x raw)', goal: 3, xp: 200, badge: 'Gem Seeker', difficulty: 'Hard', sport: 'multi' },
  { id: 'hockey-heroes', title: 'Hockey Heroes', description: 'Add 3 hockey cards to your binder', goal: 3, xp: 50, badge: 'Puck Collector', difficulty: 'Easy', sport: 'hockey' },
  { id: 'hof-hunt', title: 'Hall of Fame Hunt', description: 'Collect 2 cards of Hall of Fame players', goal: 2, xp: 200, badge: 'HOF Historian', difficulty: 'Hard', sport: 'multi' },
  { id: 'decade-diver', title: 'Decade Diver', description: 'Collect cards from 3 different decades', goal: 3, xp: 100, badge: 'Era Explorer', difficulty: 'Medium', sport: 'multi' },
  { id: 'diamond-kings', title: 'Diamond Kings', description: 'Add 4 baseball cards to your binder', goal: 4, xp: 50, badge: 'Diamond King', difficulty: 'Easy', sport: 'baseball' },
  { id: 'gridiron-greats', title: 'Gridiron Greats', description: 'Add 3 football cards worth $10+', goal: 3, xp: 200, badge: 'Gridiron Master', difficulty: 'Hard', sport: 'football' },
  { id: 'set-chaser', title: 'Set Chaser', description: 'Find 2 cards from the same set', goal: 2, xp: 50, badge: 'Set Builder', difficulty: 'Easy', sport: 'multi' },
  { id: 'chrome-collector', title: 'Chrome Collector', description: 'Add 3 Chrome or Prizm cards', goal: 3, xp: 100, badge: 'Chrome Addict', difficulty: 'Medium', sport: 'multi' },
  { id: 'basketball-bonanza', title: 'Basketball Bonanza', description: 'Add 4 basketball cards to your binder', goal: 4, xp: 50, badge: 'Court King', difficulty: 'Easy', sport: 'basketball' },
  { id: 'high-roller', title: 'High Roller', description: 'Add a card valued over $50', goal: 1, xp: 300, badge: 'High Roller', difficulty: 'Expert', sport: 'multi' },
  { id: 'prospect-patrol', title: 'Prospect Patrol', description: 'Collect 3 first-year prospect cards', goal: 3, xp: 100, badge: 'Prospect Scout', difficulty: 'Medium', sport: 'multi' },
  { id: 'parallel-universe', title: 'Parallel Universe', description: 'Find 2 numbered parallel or refractor cards', goal: 2, xp: 200, badge: 'Parallel Finder', difficulty: 'Hard', sport: 'multi' },
  { id: 'five-a-day', title: 'Five-a-Day', description: 'Add 5 cards to your binder in a single day', goal: 5, xp: 100, badge: 'Speed Collector', difficulty: 'Medium', sport: 'multi' },
  { id: 'grail-seeker', title: 'Grail Seeker', description: 'Add a card valued over $100', goal: 1, xp: 300, badge: 'Grail Hunter', difficulty: 'Expert', sport: 'multi' },
  { id: 'auto-hunter', title: 'Auto Hunter', description: 'Find 2 autographed cards', goal: 2, xp: 200, badge: 'Autograph Hound', difficulty: 'Hard', sport: 'multi' },
  { id: 'slab-stacker', title: 'Slab Stacker', description: 'Add 3 graded (slabbed) cards to your binder', goal: 3, xp: 100, badge: 'Slab Stacker', difficulty: 'Medium', sport: 'multi' },
  { id: 'binder-blitz', title: 'Binder Blitz', description: 'Add 10 cards to your binder this week', goal: 10, xp: 100, badge: 'Binder Boss', difficulty: 'Medium', sport: 'multi' },
  { id: 'clean-sweep', title: 'Clean Sweep', description: 'Complete all 4 weekly challenges', goal: 4, xp: 300, badge: 'Completionist', difficulty: 'Expert', sport: 'multi' },
  { id: 'junk-wax-hero', title: 'Junk Wax Hero', description: 'Add 4 cards from the 1987-1993 junk wax era', goal: 4, xp: 200, badge: 'Junk Wax Hero', difficulty: 'Hard', sport: 'multi' },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const SPORT_EMOJI: Record<Sport, string> = {
  baseball: '\u26be',
  basketball: '\ud83c\udfc0',
  football: '\ud83c\udfc8',
  hockey: '\ud83c\udfd2',
  multi: '\ud83c\udfc5',
};

const SPORT_LABEL: Record<Sport, string> = {
  baseball: 'Baseball',
  basketball: 'Basketball',
  football: 'Football',
  hockey: 'Hockey',
  multi: 'All Sports',
};

const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  Easy: 'border-l-green-500',
  Medium: 'border-l-yellow-500',
  Hard: 'border-l-orange-500',
  Expert: 'border-l-red-500',
};

const DIFFICULTY_BADGE: Record<Difficulty, string> = {
  Easy: 'bg-green-900/40 text-green-400 border-green-700/50',
  Medium: 'bg-yellow-900/40 text-yellow-400 border-yellow-700/50',
  Hard: 'bg-orange-900/40 text-orange-400 border-orange-700/50',
  Expert: 'bg-red-900/40 text-red-400 border-red-700/50',
};

/** Deterministic week key: YYYY-WW */
function getWeekKey(date: Date = new Date()): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  // ISO week: Monday = start. Shift to Sunday-start for our rotation.
  const dayOfWeek = d.getDay(); // 0=Sun
  const startOfYear = new Date(d.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((d.getTime() - startOfYear.getTime()) / 86400000);
  const weekNum = Math.floor((dayOfYear + startOfYear.getDay()) / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

/** Simple hash from string to number */
function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** Pick 4 challenges for a given week deterministically */
function getChallengesForWeek(weekKey: string): ChallengeDefinition[] {
  const seed = hashStr(weekKey);
  // Shuffle indices deterministically
  const indices = CHALLENGE_BANK.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = (seed * (i + 1) + i * 31) % (i + 1);
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices.slice(0, 4).map(i => CHALLENGE_BANK[i]);
}

/** Time until next Sunday midnight */
function getTimeUntilReset(): { days: number; hours: number; minutes: number; seconds: number } {
  const now = new Date();
  const nextSunday = new Date(now);
  const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
  nextSunday.setDate(now.getDate() + daysUntilSunday);
  nextSunday.setHours(0, 0, 0, 0);
  const diff = nextSunday.getTime() - now.getTime();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

/* ------------------------------------------------------------------ */
/* Storage Keys                                                        */
/* ------------------------------------------------------------------ */

const STORAGE_PROGRESS = 'cv-challenge-progress';
const STORAGE_HISTORY = 'cv-challenge-history';
const STORAGE_STATS = 'cv-challenge-stats';

function loadJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function saveJSON(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota */ }
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

type Tab = 'active' | 'history';

export default function ChallengeClient() {
  const [tab, setTab] = useState<Tab>('active');
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'All'>('All');
  const [progress, setProgress] = useState<ChallengeProgress[]>([]);
  const [history, setHistory] = useState<ChallengeHistory[]>([]);
  const [stats, setStats] = useState<Stats>({ totalCompleted: 0, currentStreak: 0, totalXP: 0, completedBySport: { baseball: 0, basketball: 0, football: 0, hockey: 0, multi: 0 } });
  const [countdown, setCountdown] = useState(getTimeUntilReset());
  const [mounted, setMounted] = useState(false);

  const weekKey = useMemo(() => getWeekKey(), []);
  const weeklyChallenges = useMemo(() => getChallengesForWeek(weekKey), [weekKey]);

  // Load from localStorage on mount
  useEffect(() => {
    setProgress(loadJSON<ChallengeProgress[]>(STORAGE_PROGRESS, []));
    setHistory(loadJSON<ChallengeHistory[]>(STORAGE_HISTORY, []));
    setStats(loadJSON<Stats>(STORAGE_STATS, { totalCompleted: 0, currentStreak: 0, totalXP: 0, completedBySport: { baseball: 0, basketball: 0, football: 0, hockey: 0, multi: 0 } }));
    setMounted(true);
  }, []);

  // Countdown timer
  useEffect(() => {
    const t = setInterval(() => setCountdown(getTimeUntilReset()), 1000);
    return () => clearInterval(t);
  }, []);

  // Persist helpers
  const persistProgress = useCallback((next: ChallengeProgress[]) => { setProgress(next); saveJSON(STORAGE_PROGRESS, next); }, []);
  const persistHistory = useCallback((next: ChallengeHistory[]) => { setHistory(next); saveJSON(STORAGE_HISTORY, next); }, []);
  const persistStats = useCallback((next: Stats) => { setStats(next); saveJSON(STORAGE_STATS, next); }, []);

  // Get or init progress for a challenge in the current week
  const getProgress = useCallback((id: string): ChallengeProgress => {
    return progress.find(p => p.challengeId === id && p.weekKey === weekKey) ?? { challengeId: id, weekKey, current: 0, status: 'active' };
  }, [progress, weekKey]);

  // Increment progress by 1
  const incrementProgress = useCallback((challenge: ChallengeDefinition) => {
    const existing = getProgress(challenge.id);
    if (existing.status === 'completed') return;
    const newCurrent = Math.min(existing.current + 1, challenge.goal);
    const isComplete = newCurrent >= challenge.goal;
    const updated: ChallengeProgress = {
      ...existing,
      current: newCurrent,
      status: isComplete ? 'completed' : 'active',
      completedAt: isComplete ? new Date().toISOString() : undefined,
    };
    const next = progress.filter(p => !(p.challengeId === challenge.id && p.weekKey === weekKey));
    next.push(updated);
    persistProgress(next);

    if (isComplete) {
      // Add to history
      const hEntry: ChallengeHistory = {
        challengeId: challenge.id,
        title: challenge.title,
        weekKey,
        completedAt: new Date().toISOString(),
        xp: challenge.xp,
        badge: challenge.badge,
        difficulty: challenge.difficulty,
        sport: challenge.sport,
      };
      const newHist = [...history, hEntry];
      persistHistory(newHist);

      // Update stats
      const newStats = { ...stats };
      newStats.totalCompleted += 1;
      newStats.totalXP += challenge.xp;
      newStats.completedBySport = { ...newStats.completedBySport };
      newStats.completedBySport[challenge.sport] = (newStats.completedBySport[challenge.sport] || 0) + 1;
      // Streak: check if this is first completion this week
      const thisWeekCompletions = newHist.filter(h => h.weekKey === weekKey);
      if (thisWeekCompletions.length === 1) {
        // First completion this week — increment streak
        newStats.currentStreak += 1;
      }
      persistStats(newStats);
    }
  }, [getProgress, progress, history, stats, weekKey, persistProgress, persistHistory, persistStats]);

  // Mark a challenge as fully complete manually
  const markComplete = useCallback((challenge: ChallengeDefinition) => {
    const existing = getProgress(challenge.id);
    if (existing.status === 'completed') return;
    const updated: ChallengeProgress = {
      ...existing,
      current: challenge.goal,
      status: 'completed',
      completedAt: new Date().toISOString(),
    };
    const next = progress.filter(p => !(p.challengeId === challenge.id && p.weekKey === weekKey));
    next.push(updated);
    persistProgress(next);

    const hEntry: ChallengeHistory = {
      challengeId: challenge.id,
      title: challenge.title,
      weekKey,
      completedAt: new Date().toISOString(),
      xp: challenge.xp,
      badge: challenge.badge,
      difficulty: challenge.difficulty,
      sport: challenge.sport,
    };
    const newHist = [...history, hEntry];
    persistHistory(newHist);

    const newStats = { ...stats };
    newStats.totalCompleted += 1;
    newStats.totalXP += challenge.xp;
    newStats.completedBySport = { ...newStats.completedBySport };
    newStats.completedBySport[challenge.sport] = (newStats.completedBySport[challenge.sport] || 0) + 1;
    const thisWeekCompletions = newHist.filter(h => h.weekKey === weekKey);
    if (thisWeekCompletions.length === 1) {
      newStats.currentStreak += 1;
    }
    persistStats(newStats);
  }, [getProgress, progress, history, stats, weekKey, persistProgress, persistHistory, persistStats]);

  // Check binder for auto-detection (simulated: counts binder items)
  const checkBinder = useCallback((challenge: ChallengeDefinition) => {
    try {
      const binderRaw = localStorage.getItem('cv-binder') || localStorage.getItem('binder-cards');
      if (!binderRaw) return;
      const binderCards = JSON.parse(binderRaw);
      const count = Array.isArray(binderCards) ? binderCards.length : 0;
      if (count > 0) {
        // Auto-detect: give partial credit based on binder size relative to goal
        const credit = Math.min(count, challenge.goal);
        const existing = getProgress(challenge.id);
        if (existing.status === 'completed') return;
        const newCurrent = Math.max(existing.current, credit);
        const isComplete = newCurrent >= challenge.goal;
        const updated: ChallengeProgress = {
          ...existing,
          current: newCurrent,
          status: isComplete ? 'completed' : 'active',
          completedAt: isComplete ? new Date().toISOString() : undefined,
        };
        const next = progress.filter(p => !(p.challengeId === challenge.id && p.weekKey === weekKey));
        next.push(updated);
        persistProgress(next);

        if (isComplete) {
          const hEntry: ChallengeHistory = {
            challengeId: challenge.id,
            title: challenge.title,
            weekKey,
            completedAt: new Date().toISOString(),
            xp: challenge.xp,
            badge: challenge.badge,
            difficulty: challenge.difficulty,
            sport: challenge.sport,
          };
          const newHist = [...history, hEntry];
          persistHistory(newHist);
          const newStats = { ...stats };
          newStats.totalCompleted += 1;
          newStats.totalXP += challenge.xp;
          newStats.completedBySport = { ...newStats.completedBySport };
          newStats.completedBySport[challenge.sport] = (newStats.completedBySport[challenge.sport] || 0) + 1;
          const thisWeekCompletions = newHist.filter(h => h.weekKey === weekKey);
          if (thisWeekCompletions.length === 1) newStats.currentStreak += 1;
          persistStats(newStats);
        }
      }
    } catch { /* ignore parse errors */ }
  }, [getProgress, progress, history, stats, weekKey, persistProgress, persistHistory, persistStats]);

  // Filtered challenges
  const filteredChallenges = difficultyFilter === 'All'
    ? weeklyChallenges
    : weeklyChallenges.filter(c => c.difficulty === difficultyFilter);

  // Favorite sport
  const favoriteSport = useMemo(() => {
    const entries = Object.entries(stats.completedBySport) as [Sport, number][];
    const sorted = entries.sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[1] > 0 ? sorted[0][0] : null;
  }, [stats]);

  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-800/50 rounded-xl" />)}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[1,2,3,4].map(i => <div key={i} className="h-48 bg-gray-800/50 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-white">{stats.totalCompleted}</p>
          <p className="text-gray-400 text-xs mt-1">Challenges Done</p>
        </div>
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-emerald-400">{stats.currentStreak}</p>
          <p className="text-gray-400 text-xs mt-1">Week Streak</p>
        </div>
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-yellow-400">{stats.totalXP.toLocaleString()}</p>
          <p className="text-gray-400 text-xs mt-1">Total XP</p>
        </div>
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-white">
            {favoriteSport ? SPORT_EMOJI[favoriteSport] : '--'}
          </p>
          <p className="text-gray-400 text-xs mt-1">
            {favoriteSport ? SPORT_LABEL[favoriteSport] : 'No Fav Yet'}
          </p>
        </div>
      </div>

      {/* Weekly Timer */}
      <div className="bg-gray-800/40 border border-gray-700/40 rounded-xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Next rotation in</span>
        </div>
        <div className="flex gap-3 text-sm font-mono">
          <span className="text-white">{countdown.days}<span className="text-gray-500">d</span></span>
          <span className="text-white">{String(countdown.hours).padStart(2, '0')}<span className="text-gray-500">h</span></span>
          <span className="text-white">{String(countdown.minutes).padStart(2, '0')}<span className="text-gray-500">m</span></span>
          <span className="text-white">{String(countdown.seconds).padStart(2, '0')}<span className="text-gray-500">s</span></span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-800 pb-0">
        {(['active', 'history'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              tab === t
                ? 'bg-gray-800 text-white border-b-2 border-emerald-500'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {t === 'active' ? 'Active Challenges' : 'History'}
          </button>
        ))}
      </div>

      {/* Active Tab */}
      {tab === 'active' && (
        <div className="space-y-6">
          {/* Difficulty Filter */}
          <div className="flex flex-wrap gap-2">
            {(['All', 'Easy', 'Medium', 'Hard', 'Expert'] as const).map(d => (
              <button
                key={d}
                onClick={() => setDifficultyFilter(d)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                  difficultyFilter === d
                    ? 'bg-emerald-900/60 border-emerald-600 text-emerald-300'
                    : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Challenge Cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredChallenges.map(challenge => {
              const prog = getProgress(challenge.id);
              const pct = Math.round((prog.current / challenge.goal) * 100);
              const isComplete = prog.status === 'completed';
              return (
                <div
                  key={challenge.id}
                  className={`bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 border-l-4 ${DIFFICULTY_COLOR[challenge.difficulty]} ${
                    isComplete ? 'opacity-75' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{SPORT_EMOJI[challenge.sport]}</span>
                        <h3 className="text-white font-semibold text-sm">{challenge.title}</h3>
                      </div>
                      <p className="text-gray-400 text-xs leading-relaxed">{challenge.description}</p>
                    </div>
                    <span className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full border ${DIFFICULTY_BADGE[challenge.difficulty]}`}>
                      {challenge.difficulty}
                    </span>
                  </div>

                  {/* Reward */}
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-3 mb-3">
                    <span>+{challenge.xp} XP</span>
                    <span className="text-gray-700">|</span>
                    <span>{challenge.badge}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">{prog.current}/{challenge.goal}</span>
                      <span className={isComplete ? 'text-emerald-400 font-medium' : 'text-gray-500'}>{isComplete ? 'Completed!' : `${pct}%`}</span>
                    </div>
                    <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-emerald-500' : 'bg-emerald-600/70'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  {!isComplete && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => incrementProgress(challenge)}
                        className="flex-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition-colors"
                      >
                        +1 Progress
                      </button>
                      <button
                        onClick={() => checkBinder(challenge)}
                        className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-medium rounded-lg transition-colors"
                      >
                        Check Binder
                      </button>
                      <button
                        onClick={() => markComplete(challenge)}
                        className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-medium rounded-lg transition-colors"
                        title="Mark as complete"
                      >
                        Done
                      </button>
                    </div>
                  )}
                  {isComplete && (
                    <div className="text-center text-xs text-emerald-400 font-medium py-1.5">
                      Completed {prog.completedAt ? new Date(prog.completedAt).toLocaleDateString() : ''}
                    </div>
                  )}
                </div>
              );
            })}

            {filteredChallenges.length === 0 && (
              <div className="sm:col-span-2 text-center py-12 text-gray-500 text-sm">
                No challenges match that filter this week.
              </div>
            )}
          </div>
        </div>
      )}

      {/* History Tab */}
      {tab === 'history' && (
        <div className="space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-16 text-gray-500 text-sm">
              No completed challenges yet. Finish your first challenge to start your history!
            </div>
          ) : (
            [...history].reverse().map((h, i) => (
              <div key={`${h.challengeId}-${h.weekKey}-${i}`} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-lg">{SPORT_EMOJI[h.sport]}</span>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">{h.title}</p>
                    <p className="text-gray-500 text-xs">Week {h.weekKey} &middot; {new Date(h.completedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${DIFFICULTY_BADGE[h.difficulty]}`}>
                    {h.difficulty}
                  </span>
                  <span className="text-yellow-400 text-xs font-medium">+{h.xp} XP</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Related Links */}
      <div className="border-t border-gray-800 pt-8">
        <h3 className="text-white font-semibold mb-4">Related Features</h3>
        <div className="flex flex-wrap gap-3">
          {[
            { href: '/weekly-challenge', label: 'Weekly Challenge', icon: '\ud83c\udfc6' },
            { href: '/achievements', label: 'Achievements', icon: '\ud83c\udf1f' },
            { href: '/binder', label: 'Digital Binder', icon: '\ud83d\udcda' },
            { href: '/streak', label: 'Daily Streak', icon: '\ud83d\udd25' },
            { href: '/my-hub', label: 'My Hub', icon: '\ud83c\udfe0' },
          ].map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 rounded-xl text-sm font-medium transition-colors"
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
