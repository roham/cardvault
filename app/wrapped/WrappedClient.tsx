'use client';

import { useState, useEffect, useCallback } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────
interface WrappedStats {
  packsOpened: number;
  dailyPacksOpened: number;
  gamesPlayed: number;
  toolsUsed: number;
  achievementsEarned: number;
  totalAchievements: number;
  longestStreak: number;
  currentStreak: number;
  binderCards: number;
  triviaHighScore: number;
  flipOrKeepPlayed: number;
  guessTheCardPlayed: number;
  weeklyChallengePlayed: number;
  showcaseCards: number;
  watchlistCards: number;
  favoriteSport: string;
  personalityType: PersonalityType;
  percentile: number;
}

interface PersonalityType {
  name: string;
  icon: string;
  description: string;
  traits: string[];
  color: string;
}

// ── Personality Types ──────────────────────────────────────────────────────
const PERSONALITIES: Record<string, PersonalityType> = {
  ripper: {
    name: 'The Ripper',
    icon: '\u{1F4E6}',
    description: 'You live for the thrill of the rip. The sound of foil, the flash of a hit — nothing beats opening packs.',
    traits: ['Adrenaline seeker', 'Pack-first mentality', 'Loves surprises', 'Always chasing the big hit'],
    color: 'from-red-600 to-orange-500',
  },
  grinder: {
    name: 'The Grinder',
    icon: '\u{1F525}',
    description: 'Every day. Rain or shine. You show up, check in, and keep the streak alive. Consistency is your superpower.',
    traits: ['Discipline focused', 'Streak obsessed', 'Daily ritual', 'Never misses a day'],
    color: 'from-amber-600 to-yellow-500',
  },
  analyst: {
    name: 'The Analyst',
    icon: '\u{1F4CA}',
    description: 'Numbers dont lie and neither do you. Every card is a data point, every tool a weapon in your arsenal.',
    traits: ['Data-driven', 'ROI focused', 'Tool power user', 'Spreadsheet energy'],
    color: 'from-blue-600 to-cyan-500',
  },
  gamer: {
    name: 'The Gamer',
    icon: '\u{1F3AE}',
    description: 'Card collecting is a game and you are here to win. Leaderboards, challenges, battles — you dominate them all.',
    traits: ['Competitive spirit', 'Leaderboard climber', 'Challenge hunter', 'High score chaser'],
    color: 'from-green-600 to-emerald-500',
  },
  completionist: {
    name: 'The Completionist',
    icon: '\u{1F3C6}',
    description: 'Every achievement. Every badge. Every card. You will not rest until the collection is complete.',
    traits: ['Perfectionist', 'Badge collector', 'Set builder', 'Leaves no stone unturned'],
    color: 'from-purple-600 to-pink-500',
  },
  flipper: {
    name: 'The Flipper',
    icon: '\u{1F4B0}',
    description: 'Buy low sell high. You see value where others see cardboard. Every card is a potential flip.',
    traits: ['Market savvy', 'Value hunter', 'Trade master', 'Profit minded'],
    color: 'from-emerald-600 to-teal-500',
  },
  scholar: {
    name: 'The Scholar',
    icon: '\u{1F4DA}',
    description: 'Knowledge is power. You read every guide, study every set, and know the history behind every card.',
    traits: ['Research focused', 'History buff', 'Guide reader', 'Knowledge seeker'],
    color: 'from-indigo-600 to-violet-500',
  },
  legend: {
    name: 'The Legend',
    icon: '\u{1F451}',
    description: 'You do it all. Rip packs, grind streaks, crush games, use every tool. You are the complete collector.',
    traits: ['Well-rounded', 'All features used', 'High engagement', 'True CardVault veteran'],
    color: 'from-yellow-500 to-amber-600',
  },
};

// ── Stats Reader ───────────────────────────────────────────────────────────
function readStats(): WrappedStats {
  if (typeof window === 'undefined') {
    return getEmptyStats();
  }

  // Pack simulator
  const packHistory = safeJsonParse(localStorage.getItem('cardvault-pack-history'), []);
  const packsOpened = Array.isArray(packHistory) ? packHistory.length : 0;

  // Daily packs
  const dailyPackData = safeJsonParse(localStorage.getItem('cardvault-daily-pack'), null) as Record<string, unknown> | null;
  const dailyPacksOpened = typeof dailyPackData?.totalOpened === 'number' ? dailyPackData.totalOpened : 0;

  // Achievements
  const achievements = safeJsonParse(localStorage.getItem('cardvault-achievements'), {});
  const achievementsEarned = typeof achievements === 'object' && achievements
    ? Object.values(achievements).filter(Boolean).length
    : 0;

  // Streak
  const streakData = safeJsonParse(localStorage.getItem('cardvault-streak'), null) as Record<string, unknown> | null;
  const longestStreak = (typeof streakData?.longestStreak === 'number' ? streakData.longestStreak : typeof streakData?.longest === 'number' ? streakData.longest : 0);
  const currentStreak = (typeof streakData?.currentStreak === 'number' ? streakData.currentStreak : typeof streakData?.current === 'number' ? streakData.current : 0);

  // Binder
  const binderData = safeJsonParse(localStorage.getItem('cardvault-binder'), null) as Record<string, unknown> | null;
  const binderCards = Array.isArray(binderData?.collected) ? (binderData.collected as unknown[]).length : 0;

  // Trivia
  const triviaData = safeJsonParse(localStorage.getItem('cardvault-trivia'), null) as Record<string, unknown> | null;
  const triviaHighScore = (typeof triviaData?.bestScore === 'number' ? triviaData.bestScore : typeof triviaData?.highScore === 'number' ? triviaData.highScore : 0);

  // Flip or Keep
  const flipData = safeJsonParse(localStorage.getItem('cardvault-flip-or-keep'), null) as Record<string, unknown> | null;
  const flipOrKeepPlayed = (typeof flipData?.gamesPlayed === 'number' ? flipData.gamesPlayed : typeof flipData?.totalGames === 'number' ? flipData.totalGames : 0);

  // Guess the Card
  const guessData = safeJsonParse(localStorage.getItem('cardvault-guess'), null) as Record<string, unknown> | null;
  const guessTheCardPlayed = (typeof guessData?.gamesPlayed === 'number' ? guessData.gamesPlayed : typeof guessData?.totalPlayed === 'number' ? guessData.totalPlayed : 0);

  // Weekly challenge
  const weeklyData = safeJsonParse(localStorage.getItem('cardvault-weekly-challenge'), null) as Record<string, unknown> | null;
  const weeklyChallengePlayed = (typeof weeklyData?.totalEntries === 'number' ? weeklyData.totalEntries : typeof weeklyData?.played === 'number' ? weeklyData.played : 0);

  // Showcase
  const showcaseData = safeJsonParse(localStorage.getItem('cardvault-showcase'), null) as Record<string, unknown> | null;
  const showcaseCards = Array.isArray(showcaseData?.cards) ? (showcaseData.cards as unknown[]).length : 0;

  // Watchlist
  const watchlistRaw = safeJsonParse(localStorage.getItem('cardvault-watchlist'), null);
  const watchlistCards = Array.isArray(watchlistRaw) ? watchlistRaw.length
    : (typeof watchlistRaw === 'object' && watchlistRaw !== null && Array.isArray((watchlistRaw as Record<string, unknown>).cards))
      ? ((watchlistRaw as Record<string, unknown>).cards as unknown[]).length : 0;

  // Compute derived stats
  const gamesPlayed = flipOrKeepPlayed + guessTheCardPlayed + weeklyChallengePlayed + packsOpened;
  const toolsUsed = countToolsUsed();

  // Determine favorite sport from various sources
  const favoriteSport = determineFavoriteSport();

  // Determine personality
  const personalityType = determinePersonality({
    packsOpened, dailyPacksOpened, gamesPlayed, toolsUsed,
    achievementsEarned, longestStreak, binderCards,
    flipOrKeepPlayed, guessTheCardPlayed,
  });

  // Compute percentile (engagement score)
  const totalEngagement = packsOpened + dailyPacksOpened + gamesPlayed + toolsUsed
    + achievementsEarned + longestStreak + binderCards;
  const percentile = Math.min(99, Math.max(1, Math.round(
    (1 - Math.exp(-totalEngagement / 20)) * 100
  )));

  return {
    packsOpened, dailyPacksOpened, gamesPlayed, toolsUsed,
    achievementsEarned, totalAchievements: 24, longestStreak, currentStreak,
    binderCards, triviaHighScore, flipOrKeepPlayed, guessTheCardPlayed,
    weeklyChallengePlayed, showcaseCards, watchlistCards,
    favoriteSport, personalityType, percentile,
  };
}

function getEmptyStats(): WrappedStats {
  return {
    packsOpened: 0, dailyPacksOpened: 0, gamesPlayed: 0, toolsUsed: 0,
    achievementsEarned: 0, totalAchievements: 24, longestStreak: 0, currentStreak: 0,
    binderCards: 0, triviaHighScore: 0, flipOrKeepPlayed: 0, guessTheCardPlayed: 0,
    weeklyChallengePlayed: 0, showcaseCards: 0, watchlistCards: 0,
    favoriteSport: 'Baseball', personalityType: PERSONALITIES.ripper,
    percentile: 1,
  };
}

function safeJsonParse(val: string | null, fallback: unknown): unknown {
  if (!val) return fallback;
  try { return JSON.parse(val); } catch { return fallback; }
}

function countToolsUsed(): number {
  if (typeof window === 'undefined') return 0;
  let count = 0;
  const toolKeys = [
    'cardvault-pack-history', 'cardvault-daily-pack', 'cardvault-grading-roi',
    'cardvault-trade', 'cardvault-quiz-result', 'cardvault-collection',
    'cardvault-watchlist', 'cardvault-binder', 'cardvault-showcase',
    'cardvault-flip-or-keep', 'cardvault-trivia', 'cardvault-guess',
    'cardvault-weekly-challenge', 'cardvault-portfolio',
    'cardvault-achievements', 'cardvault-streak',
  ];
  for (const key of toolKeys) {
    if (localStorage.getItem(key)) count++;
  }
  return count;
}

function determineFavoriteSport(): string {
  if (typeof window === 'undefined') return 'Baseball';
  // Check various localStorage entries for sport preferences
  const sports: Record<string, number> = { Baseball: 0, Basketball: 0, Football: 0, Hockey: 0 };
  const quizResult = safeJsonParse(localStorage.getItem('cardvault-quiz-result'), null) as Record<string, unknown> | null;
  if (quizResult?.sport) {
    const s = String(quizResult.sport);
    if (s.toLowerCase().includes('baseball')) sports.Baseball += 3;
    if (s.toLowerCase().includes('basketball')) sports.Basketball += 3;
    if (s.toLowerCase().includes('football')) sports.Football += 3;
    if (s.toLowerCase().includes('hockey')) sports.Hockey += 3;
  }
  // Default to baseball if no signal
  const max = Math.max(...Object.values(sports));
  if (max === 0) return 'Baseball';
  return Object.entries(sports).find(([, v]) => v === max)?.[0] ?? 'Baseball';
}

function determinePersonality(stats: {
  packsOpened: number; dailyPacksOpened: number; gamesPlayed: number;
  toolsUsed: number; achievementsEarned: number; longestStreak: number;
  binderCards: number; flipOrKeepPlayed: number; guessTheCardPlayed: number;
}): PersonalityType {
  const scores: Record<string, number> = {
    ripper: (stats.packsOpened + stats.dailyPacksOpened) * 2,
    grinder: stats.longestStreak * 3 + stats.dailyPacksOpened,
    analyst: stats.toolsUsed * 4,
    gamer: (stats.gamesPlayed + stats.flipOrKeepPlayed + stats.guessTheCardPlayed) * 2,
    completionist: stats.achievementsEarned * 3 + stats.binderCards,
    flipper: stats.flipOrKeepPlayed * 3 + stats.toolsUsed,
    scholar: stats.toolsUsed * 2 + stats.achievementsEarned,
  };

  // Legend if total engagement is very high
  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  if (total > 100) scores.legend = total * 0.8;

  const top = Object.entries(scores).sort(([, a], [, b]) => b - a)[0];
  return PERSONALITIES[top[0]] ?? PERSONALITIES.ripper;
}

// ── Slide Definitions ──────────────────────────────────────────────────────
interface Slide {
  id: string;
  bg: string;
  render: (stats: WrappedStats) => React.ReactNode;
}

function getSlides(): Slide[] {
  return [
    {
      id: 'intro',
      bg: 'from-purple-900 via-indigo-900 to-black',
      render: () => (
        <div className="text-center">
          <p className="text-purple-300 text-sm uppercase tracking-widest mb-4">CardVault Presents</p>
          <h2 className="text-5xl sm:text-6xl font-black text-white mb-4">Your 2025</h2>
          <h2 className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Collecting Wrapped
          </h2>
          <p className="text-zinc-400 mt-6 text-lg">Tap to begin your recap</p>
        </div>
      ),
    },
    {
      id: 'packs',
      bg: 'from-red-900 via-orange-900 to-black',
      render: (stats) => (
        <div className="text-center">
          <p className="text-orange-300 text-sm uppercase tracking-widest mb-6">Packs Ripped</p>
          <div className="text-7xl sm:text-8xl font-black text-white mb-2">
            {stats.packsOpened + stats.dailyPacksOpened}
          </div>
          <p className="text-zinc-400 text-lg mb-8">
            packs torn open this season
          </p>
          <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-2xl font-bold text-orange-400">{stats.packsOpened}</div>
              <div className="text-xs text-zinc-500">Simulator</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-2xl font-bold text-orange-400">{stats.dailyPacksOpened}</div>
              <div className="text-xs text-zinc-500">Daily Packs</div>
            </div>
          </div>
          {stats.packsOpened + stats.dailyPacksOpened > 20 && (
            <p className="text-orange-400/80 text-sm mt-6 italic">
              Thats more packs than most hobby shops sell in a week
            </p>
          )}
        </div>
      ),
    },
    {
      id: 'streak',
      bg: 'from-amber-900 via-yellow-900 to-black',
      render: (stats) => (
        <div className="text-center">
          <p className="text-amber-300 text-sm uppercase tracking-widest mb-6">Longest Streak</p>
          <div className="text-7xl sm:text-8xl font-black text-white mb-2">
            {stats.longestStreak}
          </div>
          <p className="text-zinc-400 text-lg mb-4">
            consecutive days collecting
          </p>
          {stats.currentStreak > 0 && (
            <div className="bg-white/5 rounded-xl p-4 max-w-xs mx-auto mb-6">
              <div className="text-2xl font-bold text-amber-400">{stats.currentStreak}</div>
              <div className="text-xs text-zinc-500">Current streak (still going)</div>
            </div>
          )}
          {stats.longestStreak >= 7 && (
            <p className="text-amber-400/80 text-sm italic">
              A full week without missing a day? Dedication.
            </p>
          )}
          {stats.longestStreak >= 30 && (
            <p className="text-amber-400/80 text-sm italic">
              30+ days? You are built different.
            </p>
          )}
        </div>
      ),
    },
    {
      id: 'games',
      bg: 'from-green-900 via-emerald-900 to-black',
      render: (stats) => (
        <div className="text-center">
          <p className="text-emerald-300 text-sm uppercase tracking-widest mb-6">Games Played</p>
          <div className="text-7xl sm:text-8xl font-black text-white mb-2">
            {stats.gamesPlayed}
          </div>
          <p className="text-zinc-400 text-lg mb-8">
            total game sessions
          </p>
          <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
            <div className="bg-white/5 rounded-xl p-3">
              <div className="text-xl font-bold text-emerald-400">{stats.flipOrKeepPlayed}</div>
              <div className="text-[10px] text-zinc-500">Flip or Keep</div>
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <div className="text-xl font-bold text-emerald-400">{stats.guessTheCardPlayed}</div>
              <div className="text-[10px] text-zinc-500">Guess the Card</div>
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <div className="text-xl font-bold text-emerald-400">{stats.weeklyChallengePlayed}</div>
              <div className="text-[10px] text-zinc-500">Weekly Challenge</div>
            </div>
          </div>
          {stats.triviaHighScore > 0 && (
            <p className="text-emerald-400/80 text-sm mt-6 italic">
              Trivia high score: {stats.triviaHighScore}/5
            </p>
          )}
        </div>
      ),
    },
    {
      id: 'collection',
      bg: 'from-blue-900 via-cyan-900 to-black',
      render: (stats) => (
        <div className="text-center">
          <p className="text-cyan-300 text-sm uppercase tracking-widest mb-6">Your Collection</p>
          <div className="text-7xl sm:text-8xl font-black text-white mb-2">
            {stats.binderCards}
          </div>
          <p className="text-zinc-400 text-lg mb-8">
            cards in your digital binder
          </p>
          <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-2xl font-bold text-cyan-400">{stats.showcaseCards}</div>
              <div className="text-xs text-zinc-500">In Showcase</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-2xl font-bold text-cyan-400">{stats.watchlistCards}</div>
              <div className="text-xs text-zinc-500">On Watchlist</div>
            </div>
          </div>
          {stats.binderCards > 50 && (
            <p className="text-cyan-400/80 text-sm mt-6 italic">
              50+ cards? Your binder is stacked.
            </p>
          )}
        </div>
      ),
    },
    {
      id: 'achievements',
      bg: 'from-purple-900 via-pink-900 to-black',
      render: (stats) => (
        <div className="text-center">
          <p className="text-pink-300 text-sm uppercase tracking-widest mb-6">Achievements</p>
          <div className="text-7xl sm:text-8xl font-black text-white mb-2">
            {stats.achievementsEarned}
          </div>
          <p className="text-zinc-400 text-lg mb-4">
            of {stats.totalAchievements} badges unlocked
          </p>
          {/* Progress bar */}
          <div className="max-w-xs mx-auto mb-6">
            <div className="h-4 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all duration-1000"
                style={{ width: `${(stats.achievementsEarned / stats.totalAchievements) * 100}%` }}
              />
            </div>
            <p className="text-xs text-zinc-500 mt-2">
              {Math.round((stats.achievementsEarned / stats.totalAchievements) * 100)}% complete
            </p>
          </div>
          {stats.achievementsEarned >= stats.totalAchievements && (
            <p className="text-pink-400/80 text-sm italic">
              100%? You are a completionist legend.
            </p>
          )}
          {stats.achievementsEarned > 0 && stats.achievementsEarned < stats.totalAchievements && (
            <p className="text-pink-400/80 text-sm italic">
              {stats.totalAchievements - stats.achievementsEarned} more to go. You got this.
            </p>
          )}
        </div>
      ),
    },
    {
      id: 'tools',
      bg: 'from-indigo-900 via-blue-900 to-black',
      render: (stats) => (
        <div className="text-center">
          <p className="text-blue-300 text-sm uppercase tracking-widest mb-6">Tools Explored</p>
          <div className="text-7xl sm:text-8xl font-black text-white mb-2">
            {stats.toolsUsed}
          </div>
          <p className="text-zinc-400 text-lg mb-4">
            of 76 CardVault tools used
          </p>
          <div className="max-w-xs mx-auto mb-6">
            <div className="h-4 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(100, (stats.toolsUsed / 16) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-zinc-500 mt-2">
              {stats.toolsUsed >= 16 ? 'Power user status' : `${16 - stats.toolsUsed} more for power user status`}
            </p>
          </div>
          <p className="text-blue-400/80 text-sm italic">
            CardVault has 76 tools. How many can you master?
          </p>
        </div>
      ),
    },
    {
      id: 'personality',
      bg: 'from-black via-zinc-900 to-black',
      render: (stats) => (
        <div className="text-center">
          <p className="text-zinc-400 text-sm uppercase tracking-widest mb-4">Your Collector Type</p>
          <div className="text-6xl mb-4">{stats.personalityType.icon}</div>
          <h2 className={`text-4xl sm:text-5xl font-black bg-gradient-to-r ${stats.personalityType.color} bg-clip-text text-transparent mb-4`}>
            {stats.personalityType.name}
          </h2>
          <p className="text-zinc-400 text-lg max-w-md mx-auto mb-8">
            {stats.personalityType.description}
          </p>
          <div className="flex flex-wrap gap-2 justify-center max-w-sm mx-auto">
            {stats.personalityType.traits.map((trait) => (
              <span key={trait} className="bg-white/10 text-zinc-300 text-xs px-3 py-1.5 rounded-full">
                {trait}
              </span>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'summary',
      bg: 'from-purple-900 via-indigo-900 to-black',
      render: (stats) => (
        <div className="text-center">
          <p className="text-purple-300 text-sm uppercase tracking-widest mb-6">Your Season Summary</p>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 max-w-sm mx-auto mb-6">
            <div className="text-4xl mb-2">{stats.personalityType.icon}</div>
            <h3 className={`text-2xl font-black bg-gradient-to-r ${stats.personalityType.color} bg-clip-text text-transparent mb-4`}>
              {stats.personalityType.name}
            </h3>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div>
                <div className="text-xl font-bold text-white">{stats.packsOpened + stats.dailyPacksOpened}</div>
                <div className="text-[10px] text-zinc-500">Packs</div>
              </div>
              <div>
                <div className="text-xl font-bold text-white">{stats.longestStreak}</div>
                <div className="text-[10px] text-zinc-500">Best Streak</div>
              </div>
              <div>
                <div className="text-xl font-bold text-white">{stats.gamesPlayed}</div>
                <div className="text-[10px] text-zinc-500">Games</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div>
                <div className="text-xl font-bold text-white">{stats.binderCards}</div>
                <div className="text-[10px] text-zinc-500">Cards</div>
              </div>
              <div>
                <div className="text-xl font-bold text-white">{stats.achievementsEarned}</div>
                <div className="text-[10px] text-zinc-500">Badges</div>
              </div>
              <div>
                <div className="text-xl font-bold text-white">{stats.toolsUsed}</div>
                <div className="text-[10px] text-zinc-500">Tools</div>
              </div>
            </div>
            <div className="border-t border-white/10 pt-3">
              <p className="text-zinc-500 text-xs">Favorite Sport: {stats.favoriteSport}</p>
              <p className="text-zinc-500 text-xs">Top {100 - stats.percentile}% of collectors</p>
            </div>
          </div>
          <p className="text-purple-300 text-sm font-medium">cardvault-two.vercel.app/wrapped</p>
        </div>
      ),
    },
  ];
}

// ── Component ──────────────────────────────────────────────────────────────
export default function WrappedClient() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [stats, setStats] = useState<WrappedStats | null>(null);
  const [animating, setAnimating] = useState(false);
  const [shareText, setShareText] = useState('');

  useEffect(() => {
    setStats(readStats());
  }, []);

  const slides = getSlides();

  const goNext = useCallback(() => {
    if (animating || currentSlide >= slides.length - 1) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrentSlide(prev => prev + 1);
      setAnimating(false);
    }, 300);
  }, [animating, currentSlide, slides.length]);

  const goPrev = useCallback(() => {
    if (animating || currentSlide <= 0) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrentSlide(prev => prev - 1);
      setAnimating(false);
    }, 300);
  }, [animating, currentSlide]);

  const handleShare = useCallback(() => {
    if (!stats) return;
    const text = [
      `My 2025 Collecting Wrapped`,
      ``,
      `${stats.personalityType.icon} ${stats.personalityType.name}`,
      `${stats.packsOpened + stats.dailyPacksOpened} packs ripped`,
      `${stats.longestStreak}-day streak`,
      `${stats.gamesPlayed} games played`,
      `${stats.binderCards} cards collected`,
      `${stats.achievementsEarned}/${stats.totalAchievements} badges`,
      `Top ${100 - stats.percentile}% collector`,
      ``,
      `Get yours: cardvault-two.vercel.app/wrapped`,
    ].join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setShareText('Copied!');
      setTimeout(() => setShareText(''), 2000);
    }).catch(() => {
      setShareText('Could not copy');
      setTimeout(() => setShareText(''), 2000);
    });
  }, [stats]);

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const slide = slides[currentSlide];
  const isLast = currentSlide === slides.length - 1;
  const isFirst = currentSlide === 0;

  return (
    <div className="space-y-6">
      {/* Main Slide */}
      <div
        className={`relative bg-gradient-to-br ${slide.bg} rounded-2xl overflow-hidden cursor-pointer select-none`}
        onClick={isLast ? undefined : goNext}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight' || e.key === ' ') goNext();
          if (e.key === 'ArrowLeft') goPrev();
        }}
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-60 h-60 bg-white/5 rounded-full blur-3xl" />
        </div>

        <div className={`relative z-10 flex items-center justify-center min-h-[480px] sm:min-h-[520px] px-6 py-12 transition-opacity duration-300 ${animating ? 'opacity-0' : 'opacity-100'}`}>
          {slide.render(stats)}
        </div>

        {/* Progress dots */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-20">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={(e) => {
                e.stopPropagation();
                if (!animating) {
                  setAnimating(true);
                  setTimeout(() => {
                    setCurrentSlide(i);
                    setAnimating(false);
                  }, 300);
                }
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentSlide ? 'bg-white w-6' : 'bg-white/30 hover:bg-white/50'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={goPrev}
          disabled={isFirst}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            isFirst
              ? 'bg-zinc-800/50 text-zinc-600 cursor-not-allowed'
              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
          }`}
        >
          Previous
        </button>

        <span className="text-xs text-zinc-500">
          {currentSlide + 1} / {slides.length}
        </span>

        {isLast ? (
          <div className="flex gap-2">
            <button
              onClick={handleShare}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {shareText || 'Copy to Share'}
            </button>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                `My 2025 Collecting Wrapped: ${stats.personalityType.icon} ${stats.personalityType.name} | ${stats.packsOpened + stats.dailyPacksOpened} packs, ${stats.longestStreak}-day streak, ${stats.gamesPlayed} games\n\nGet yours: cardvault-two.vercel.app/wrapped`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Share to X
            </a>
          </div>
        ) : (
          <button
            onClick={goNext}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Next
          </button>
        )}
      </div>

      {/* Quick Stats Grid (always visible) */}
      <div className="border-t border-zinc-800 pt-8">
        <h2 className="text-lg font-bold text-white mb-4">All Your Stats</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Packs Ripped', value: stats.packsOpened + stats.dailyPacksOpened },
            { label: 'Best Streak', value: `${stats.longestStreak}d` },
            { label: 'Games Played', value: stats.gamesPlayed },
            { label: 'Tools Used', value: `${stats.toolsUsed}/16` },
            { label: 'Binder Cards', value: stats.binderCards },
            { label: 'Achievements', value: `${stats.achievementsEarned}/${stats.totalAchievements}` },
            { label: 'Watchlist', value: stats.watchlistCards },
            { label: 'Showcase', value: stats.showcaseCards },
          ].map((stat) => (
            <div key={stat.label} className="bg-zinc-900/70 border border-zinc-800 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-zinc-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
