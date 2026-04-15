'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';

// ── Types ──────────────────────────────────────────────────────
type ChallengeCategory = 'browse' | 'tools' | 'market' | 'collection' | 'games' | 'social';

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: ChallengeCategory;
  xp: number;
  href: string;
  actionLabel: string;
}

interface DailyState {
  date: string;
  completed: string[];
  streak: number;
  longestStreak: number;
  totalCompleted: number;
  totalXP: number;
  lastCompletedDate: string;
}

// ── Config ──────────────────────────────────────────────────────
const CATEGORY_CONFIG: Record<ChallengeCategory, { label: string; icon: string; color: string; bgColor: string }> = {
  browse: { label: 'Browse', icon: '🔍', color: 'text-blue-400', bgColor: 'bg-blue-500/10 border-blue-500/20' },
  tools: { label: 'Tools', icon: '🔧', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10 border-emerald-500/20' },
  market: { label: 'Market', icon: '📊', color: 'text-purple-400', bgColor: 'bg-purple-500/10 border-purple-500/20' },
  collection: { label: 'Collection', icon: '📦', color: 'text-amber-400', bgColor: 'bg-amber-500/10 border-amber-500/20' },
  games: { label: 'Games', icon: '🎮', color: 'text-red-400', bgColor: 'bg-red-500/10 border-red-500/20' },
  social: { label: 'Social', icon: '👥', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10 border-cyan-500/20' },
};

const STREAK_TIERS = [
  { days: 3, multiplier: 1.5, label: 'Hot Streak', color: 'text-yellow-400' },
  { days: 7, multiplier: 2.0, label: 'Weekly Warrior', color: 'text-orange-400' },
  { days: 14, multiplier: 2.5, label: 'Dedicated', color: 'text-red-400' },
  { days: 30, multiplier: 3.0, label: 'Unstoppable', color: 'text-purple-400' },
];

// ── Challenge Pool ──────────────────────────────────────────────
const CHALLENGE_POOL: Challenge[] = [
  // Browse challenges
  { id: 'browse-baseball', title: 'Scout the Diamond', description: 'Visit 3 baseball card pages', category: 'browse', xp: 15, href: '/sports/sport/baseball', actionLabel: 'Browse Baseball' },
  { id: 'browse-basketball', title: 'Court Vision', description: 'Visit 3 basketball card pages', category: 'browse', xp: 15, href: '/sports/sport/basketball', actionLabel: 'Browse Basketball' },
  { id: 'browse-football', title: 'Gridiron Scout', description: 'Visit 3 football card pages', category: 'browse', xp: 15, href: '/sports/sport/football', actionLabel: 'Browse Football' },
  { id: 'browse-hockey', title: 'Ice Time', description: 'Visit 3 hockey card pages', category: 'browse', xp: 15, href: '/sports/sport/hockey', actionLabel: 'Browse Hockey' },
  { id: 'browse-pokemon', title: 'Gotta Catch Em All', description: 'Explore the Pokemon card section', category: 'browse', xp: 15, href: '/pokemon', actionLabel: 'Browse Pokemon' },
  { id: 'browse-player', title: 'Player Profile', description: 'Visit any player hub page', category: 'browse', xp: 10, href: '/players', actionLabel: 'Browse Players' },
  { id: 'browse-compare', title: 'Head to Head', description: 'Check out a card comparison page', category: 'browse', xp: 15, href: '/sports/compare', actionLabel: 'Compare Cards' },
  { id: 'browse-guides', title: 'Study Session', description: 'Read a collector guide', category: 'browse', xp: 20, href: '/guides', actionLabel: 'Read Guides' },

  // Tool challenges
  { id: 'tools-grade', title: 'Grade Check', description: 'Use the Grading ROI Calculator', category: 'tools', xp: 20, href: '/tools/grading-roi', actionLabel: 'Open Tool' },
  { id: 'tools-flip', title: 'Flip Math', description: 'Calculate a flip with the Flip Calculator', category: 'tools', xp: 20, href: '/tools/flip-calc', actionLabel: 'Open Tool' },
  { id: 'tools-quiz', title: 'Know Yourself', description: 'Take the Collector Quiz', category: 'tools', xp: 25, href: '/tools/quiz', actionLabel: 'Take Quiz' },
  { id: 'tools-condition', title: 'Condition Report', description: 'Grade a card with the Condition Grader', category: 'tools', xp: 20, href: '/tools/condition-grader', actionLabel: 'Open Tool' },
  { id: 'tools-shipping', title: 'Ship It', description: 'Calculate shipping costs', category: 'tools', xp: 15, href: '/tools/shipping-calc', actionLabel: 'Open Tool' },
  { id: 'tools-budget', title: 'Budget Check', description: 'Plan your hobby budget', category: 'tools', xp: 20, href: '/tools/budget-planner', actionLabel: 'Open Tool' },
  { id: 'tools-break-even', title: 'Break Even', description: 'Find your break-even price', category: 'tools', xp: 20, href: '/tools/break-even', actionLabel: 'Open Tool' },
  { id: 'tools-photo', title: 'Picture Perfect', description: 'Check the Photo Grade Estimator', category: 'tools', xp: 20, href: '/tools/photo-grade-estimator', actionLabel: 'Open Tool' },

  // Market challenges
  { id: 'market-analysis', title: 'Market Watch', description: 'Check today\'s market analysis', category: 'market', xp: 15, href: '/market-analysis', actionLabel: 'View Market' },
  { id: 'market-movers', title: 'Top Movers', description: 'See what cards are moving today', category: 'market', xp: 15, href: '/market-movers', actionLabel: 'View Movers' },
  { id: 'market-sentiment', title: 'Mood Check', description: 'Check the market sentiment index', category: 'market', xp: 15, href: '/market-sentiment', actionLabel: 'View Sentiment' },
  { id: 'market-news', title: 'Stay Informed', description: 'Read the latest card news', category: 'market', xp: 15, href: '/news', actionLabel: 'Read News' },
  { id: 'market-catalysts', title: 'Catalyst Alert', description: 'Check upcoming price catalysts', category: 'market', xp: 20, href: '/card-catalysts', actionLabel: 'View Catalysts' },
  { id: 'market-report', title: 'Weekly Review', description: 'Read the weekly market report', category: 'market', xp: 20, href: '/market-report', actionLabel: 'Read Report' },

  // Collection challenges
  { id: 'collection-vault', title: 'Vault Visit', description: 'Check your vault', category: 'collection', xp: 15, href: '/vault', actionLabel: 'Open Vault' },
  { id: 'collection-binder', title: 'Binder Check', description: 'Visit your card binder', category: 'collection', xp: 15, href: '/binder', actionLabel: 'Open Binder' },
  { id: 'collection-wishlist', title: 'Wish List', description: 'Review your vault wishlist', category: 'collection', xp: 15, href: '/vault/wishlist', actionLabel: 'View Wishlist' },
  { id: 'collection-heatmap', title: 'Heat Map', description: 'Explore your collection heatmap', category: 'collection', xp: 20, href: '/collection-heatmap', actionLabel: 'View Heatmap' },
  { id: 'collection-analytics', title: 'Portfolio Review', description: 'Check your vault analytics', category: 'collection', xp: 20, href: '/vault/analytics', actionLabel: 'View Analytics' },

  // Game challenges
  { id: 'games-trivia', title: 'Card Brain', description: 'Play a round of card trivia', category: 'games', xp: 25, href: '/trivia', actionLabel: 'Play Trivia' },
  { id: 'games-battle', title: 'Battle Time', description: 'Fight a card battle', category: 'games', xp: 25, href: '/card-battle', actionLabel: 'Start Battle' },
  { id: 'games-price', title: 'Price Master', description: 'Play The Price is Right', category: 'games', xp: 25, href: '/price-is-right', actionLabel: 'Play Game' },
  { id: 'games-pack', title: 'Rip It', description: 'Open a digital pack', category: 'games', xp: 20, href: '/digital-pack', actionLabel: 'Open Pack' },
  { id: 'games-matchmaker', title: 'Swipe Session', description: 'Swipe 10 cards in Card Matchmaker', category: 'games', xp: 20, href: '/matchmaker', actionLabel: 'Start Swiping' },
  { id: 'games-memory', title: 'Memory Test', description: 'Play Memory Match', category: 'games', xp: 25, href: '/memory-match', actionLabel: 'Play Game' },
  { id: 'games-guess', title: 'Name That Card', description: 'Play Guess the Card', category: 'games', xp: 25, href: '/guess-the-card', actionLabel: 'Play Game' },

  // Social challenges
  { id: 'social-spotlight', title: 'Collector Stories', description: 'Read the Collector Spotlight', category: 'social', xp: 15, href: '/collector-spotlight', actionLabel: 'Read Stories' },
  { id: 'social-showcase', title: 'Show Off', description: 'Visit the Showcase', category: 'social', xp: 15, href: '/showcase', actionLabel: 'View Showcase' },
  { id: 'social-league', title: 'Chat Time', description: 'Visit a League Chat room', category: 'social', xp: 15, href: '/league-chat', actionLabel: 'Join Chat' },
  { id: 'social-media', title: 'Media Hub', description: 'Discover new card content creators', category: 'social', xp: 15, href: '/media-hub', actionLabel: 'Browse Creators' },
  { id: 'social-calendar', title: 'Content Check', description: 'See what is coming on the Content Calendar', category: 'social', xp: 15, href: '/content-calendar', actionLabel: 'View Calendar' },
];

// ── Helpers ──────────────────────────────────────────────────────
function getDateKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function dateToSeed(dateKey: string): number {
  let hash = 0;
  for (let i = 0; i < dateKey.length; i++) {
    hash = ((hash << 5) - hash + dateKey.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function getDailyChallenges(dateKey: string): Challenge[] {
  const rng = seededRandom(dateToSeed(dateKey));
  const categories: ChallengeCategory[] = ['browse', 'tools', 'market', 'collection', 'games', 'social'];

  // Pick 3 different categories
  const shuffledCats = [...categories].sort(() => rng() - 0.5);
  const selectedCats = shuffledCats.slice(0, 3);

  // From each category, pick one challenge
  return selectedCats.map(cat => {
    const pool = CHALLENGE_POOL.filter(c => c.category === cat);
    const idx = Math.floor(rng() * pool.length);
    return pool[idx];
  });
}

function getStreakMultiplier(streak: number): number {
  let multiplier = 1.0;
  for (const tier of STREAK_TIERS) {
    if (streak >= tier.days) multiplier = tier.multiplier;
  }
  return multiplier;
}

function getStreakTier(streak: number): typeof STREAK_TIERS[number] | null {
  let current: typeof STREAK_TIERS[number] | null = null;
  for (const tier of STREAK_TIERS) {
    if (streak >= tier.days) current = tier;
  }
  return current;
}

function getNextStreakTier(streak: number): typeof STREAK_TIERS[number] | null {
  for (const tier of STREAK_TIERS) {
    if (streak < tier.days) return tier;
  }
  return null;
}

const DEFAULT_STATE: DailyState = {
  date: '',
  completed: [],
  streak: 0,
  longestStreak: 0,
  totalCompleted: 0,
  totalXP: 0,
  lastCompletedDate: '',
};

// ── Component ──────────────────────────────────────────────────
export default function DailyChallengesClient() {
  const [state, setState] = useState<DailyState>(DEFAULT_STATE);
  const [mounted, setMounted] = useState(false);

  const dateKey = getDateKey();
  const challenges = useMemo(() => getDailyChallenges(dateKey), [dateKey]);

  // Load state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('cardvault-daily-challenges');
    if (stored) {
      const parsed: DailyState = JSON.parse(stored);
      // Check if it's a new day
      if (parsed.date !== dateKey) {
        // Check if streak continues (yesterday)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

        const streakContinues = parsed.lastCompletedDate === yKey && parsed.completed.length === 3;
        setState({
          ...parsed,
          date: dateKey,
          completed: [],
          streak: streakContinues ? parsed.streak : 0,
        });
      } else {
        setState(parsed);
      }
    } else {
      setState({ ...DEFAULT_STATE, date: dateKey });
    }
    setMounted(true);
  }, [dateKey]);

  // Save state
  useEffect(() => {
    if (mounted && state.date) {
      localStorage.setItem('cardvault-daily-challenges', JSON.stringify(state));
    }
  }, [state, mounted]);

  const completeChallenge = useCallback((challengeId: string) => {
    setState(prev => {
      if (prev.completed.includes(challengeId)) return prev;
      const challenge = challenges.find(c => c.id === challengeId);
      if (!challenge) return prev;

      const newCompleted = [...prev.completed, challengeId];
      const multiplier = getStreakMultiplier(prev.streak);
      const xpEarned = Math.round(challenge.xp * multiplier);

      // Check if all 3 completed
      const allDone = newCompleted.length === 3;
      const bonusXP = allDone ? Math.round(50 * multiplier) : 0;
      const newStreak = allDone ? prev.streak + 1 : prev.streak;
      const newLongest = Math.max(prev.longestStreak, newStreak);

      return {
        ...prev,
        completed: newCompleted,
        totalXP: prev.totalXP + xpEarned + bonusXP,
        totalCompleted: prev.totalCompleted + 1,
        streak: newStreak,
        longestStreak: newLongest,
        lastCompletedDate: allDone ? dateKey : prev.lastCompletedDate,
      };
    });
  }, [challenges, dateKey]);

  const multiplier = getStreakMultiplier(state.streak);
  const currentTier = getStreakTier(state.streak);
  const nextTier = getNextStreakTier(state.streak);
  const allCompleted = state.completed.length === 3;

  // Time until reset
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      const hrs = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(`${hrs}h ${mins}m`);
    };
    tick();
    const interval = setInterval(tick, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return <div className="animate-pulse bg-gray-900/50 rounded-xl h-96" />;
  }

  return (
    <div>
      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-amber-400">{state.streak}</div>
          <div className="text-xs text-gray-500">Day Streak</div>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400">{multiplier}x</div>
          <div className="text-xs text-gray-500">XP Multiplier</div>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{state.totalXP.toLocaleString()}</div>
          <div className="text-xs text-gray-500">Total XP Earned</div>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">{state.longestStreak}</div>
          <div className="text-xs text-gray-500">Longest Streak</div>
        </div>
      </div>

      {/* Progress & Streak */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-white">Today&apos;s Progress</h2>
            <span className="text-sm text-gray-500">{state.completed.length}/3 complete</span>
          </div>
          <div className="text-sm text-gray-500">Resets in {timeLeft}</div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-800 rounded-full h-3 mb-4">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${allCompleted ? 'bg-gradient-to-r from-amber-500 to-yellow-400' : 'bg-amber-600'}`}
            style={{ width: `${(state.completed.length / 3) * 100}%` }}
          />
        </div>

        {/* Streak info */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          {currentTier && (
            <div className={`font-medium ${currentTier.color}`}>
              {currentTier.label} ({currentTier.multiplier}x XP)
            </div>
          )}
          {nextTier && (
            <div className="text-gray-500">
              Next: {nextTier.label} in {nextTier.days - state.streak} day{nextTier.days - state.streak !== 1 ? 's' : ''}
            </div>
          )}
          {allCompleted && (
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-xs font-medium">
              +{Math.round(50 * multiplier)} bonus XP earned!
            </div>
          )}
        </div>
      </div>

      {/* Challenge Cards */}
      <div className="space-y-4 mb-8">
        {challenges.map((challenge, idx) => {
          const completed = state.completed.includes(challenge.id);
          const catCfg = CATEGORY_CONFIG[challenge.category];
          const xpWithMultiplier = Math.round(challenge.xp * multiplier);

          return (
            <div
              key={challenge.id}
              className={`bg-gray-900/60 border rounded-xl p-5 transition-all ${
                completed
                  ? 'border-emerald-800/50 bg-emerald-950/20'
                  : 'border-gray-800 hover:border-gray-700'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Number / Check */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                  completed
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-gray-800 text-gray-500'
                }`}>
                  {completed ? '✓' : idx + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className={`text-lg font-bold ${completed ? 'text-emerald-400' : 'text-white'}`}>
                      {challenge.title}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${catCfg.bgColor} ${catCfg.color}`}>
                      {catCfg.icon} {catCfg.label}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      completed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {completed ? `+${xpWithMultiplier} XP` : `${xpWithMultiplier} XP`}
                      {multiplier > 1 && !completed && (
                        <span className="ml-1 text-amber-500/60">({multiplier}x)</span>
                      )}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">{challenge.description}</p>

                  <div className="flex items-center gap-3">
                    <Link
                      href={challenge.href}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        completed
                          ? 'bg-gray-800 text-gray-500 cursor-default'
                          : 'bg-amber-600 text-white hover:bg-amber-500'
                      }`}
                    >
                      {completed ? 'Completed' : challenge.actionLabel}
                    </Link>
                    {!completed && (
                      <button
                        onClick={() => completeChallenge(challenge.id)}
                        className="text-xs text-gray-500 hover:text-amber-400 transition-colors underline underline-offset-2"
                      >
                        Mark as done
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* All Complete Banner */}
      {allCompleted && (
        <div className="bg-gradient-to-r from-amber-950/40 to-yellow-950/40 border border-amber-800/40 rounded-xl p-6 mb-8 text-center">
          <div className="text-3xl mb-2">🏆</div>
          <h3 className="text-xl font-bold text-amber-400 mb-1">All Challenges Complete!</h3>
          <p className="text-gray-400 text-sm">
            Come back tomorrow for 3 new challenges. Your {state.streak}-day streak continues!
          </p>
        </div>
      )}

      {/* Streak Milestones */}
      <section className="bg-gray-900/40 border border-gray-800 rounded-xl p-6 mb-8">
        <h2 className="text-lg font-bold text-white mb-4">Streak Milestones</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {STREAK_TIERS.map(tier => {
            const reached = state.streak >= tier.days;
            return (
              <div
                key={tier.days}
                className={`border rounded-lg p-4 text-center transition-all ${
                  reached
                    ? 'border-amber-700/50 bg-amber-950/20'
                    : 'border-gray-800 bg-gray-900/30'
                }`}
              >
                <div className={`text-2xl font-bold ${reached ? tier.color : 'text-gray-600'}`}>
                  {tier.days}
                </div>
                <div className={`text-xs font-medium mb-1 ${reached ? 'text-white' : 'text-gray-500'}`}>
                  {tier.label}
                </div>
                <div className={`text-xs ${reached ? tier.color : 'text-gray-600'}`}>
                  {tier.multiplier}x XP
                </div>
                {reached && <div className="text-xs text-emerald-400 mt-1">Unlocked!</div>}
              </div>
            );
          })}
        </div>
      </section>

      {/* Lifetime Stats */}
      <section className="bg-gray-900/40 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Lifetime Stats</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-xl font-bold text-white">{state.totalCompleted}</div>
            <div className="text-xs text-gray-500">Challenges Done</div>
          </div>
          <div>
            <div className="text-xl font-bold text-amber-400">{state.totalXP.toLocaleString()}</div>
            <div className="text-xs text-gray-500">Total XP Earned</div>
          </div>
          <div>
            <div className="text-xl font-bold text-purple-400">{state.longestStreak}</div>
            <div className="text-xs text-gray-500">Best Streak</div>
          </div>
          <div>
            <div className="text-xl font-bold text-emerald-400">{Math.floor(state.totalCompleted / 3)}</div>
            <div className="text-xs text-gray-500">Perfect Days</div>
          </div>
        </div>
      </section>
    </div>
  );
}
