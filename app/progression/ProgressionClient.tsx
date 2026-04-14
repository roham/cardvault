'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

// ─── XP & Level Config ─────────────────────────────────────────────

const XP_ACTIONS: Record<string, { label: string; xp: number }> = {
  'cv-cards-viewed':    { label: 'Cards Viewed',        xp: 5 },
  'cv-packs-opened':    { label: 'Packs Opened',        xp: 25 },
  'cv-guides-read':     { label: 'Guides Read',         xp: 15 },
  'cv-tools-used':      { label: 'Tools Used',          xp: 10 },
  'cv-shares':          { label: 'Shares',              xp: 15 },
  'cv-trade-used':      { label: 'Trades Evaluated',    xp: 20 },
  'cv-grading-used':    { label: 'Grading Checks',      xp: 20 },
  'cv-battles-won':     { label: 'Battles Won',         xp: 30 },
  'cv-trivia-played':   { label: 'Trivia Rounds',       xp: 20 },
  'cv-portfolio-created': { label: 'Portfolios Created', xp: 40 },
  'cv-collection-size': { label: 'Cards Collected',     xp: 8 },
};

const STREAK_XP_PER_DAY = 10;
const ACHIEVEMENT_XP = 100;

interface LevelTier {
  name: string;
  minLevel: number;
  maxLevel: number;
  color: string;
  bg: string;
  border: string;
  accent: string;
}

const LEVEL_TIERS: LevelTier[] = [
  { name: 'Rookie Collector',    minLevel: 1,  maxLevel: 10, color: 'text-gray-400',   bg: 'bg-gray-800',        border: 'border-gray-700',   accent: 'from-gray-600 to-gray-400' },
  { name: 'Card Enthusiast',     minLevel: 11, maxLevel: 20, color: 'text-emerald-400', bg: 'bg-emerald-950/40',  border: 'border-emerald-800/50', accent: 'from-emerald-600 to-emerald-400' },
  { name: 'Seasoned Trader',     minLevel: 21, maxLevel: 30, color: 'text-blue-400',    bg: 'bg-blue-950/40',     border: 'border-blue-800/50',  accent: 'from-blue-600 to-blue-400' },
  { name: 'Expert Collector',    minLevel: 31, maxLevel: 40, color: 'text-purple-400',  bg: 'bg-purple-950/40',   border: 'border-purple-800/50', accent: 'from-purple-600 to-purple-400' },
  { name: 'Card Master',         minLevel: 41, maxLevel: 50, color: 'text-amber-400',   bg: 'bg-amber-950/40',    border: 'border-amber-700/50', accent: 'from-amber-500 to-yellow-400' },
];

// XP needed to reach level N (cumulative). Level 1 = 0 XP.
// Formula: sum of (level * 100) for each level step
function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  // XP to go from level (n-1) to n = n * 100
  // Cumulative: sum from 2..level of (i * 100) = 100 * (sum 2..level of i)
  // = 100 * ((level*(level+1)/2) - 1)
  return 100 * ((level * (level + 1)) / 2 - 1);
}

function getLevelFromXP(totalXP: number): { level: number; currentLevelXP: number; nextLevelXP: number; xpIntoLevel: number } {
  let level = 1;
  while (level < 50 && totalXP >= xpForLevel(level + 1)) {
    level++;
  }
  const currentLevelXP = xpForLevel(level);
  const nextLevelXP = level < 50 ? xpForLevel(level + 1) : xpForLevel(level);
  const xpIntoLevel = totalXP - currentLevelXP;
  return { level, currentLevelXP, nextLevelXP, xpIntoLevel };
}

function getTierForLevel(level: number): LevelTier {
  return LEVEL_TIERS.find(t => level >= t.minLevel && level <= t.maxLevel) || LEVEL_TIERS[0];
}

// ─── Perks ──────────────────────────────────────────────────────────

interface Perk {
  level: number;
  title: string;
  description: string;
  icon: string;
}

const PERKS: Perk[] = [
  { level: 2,  title: 'Daily Pack Access',         description: 'Open a free pack every day',              icon: '1' },
  { level: 5,  title: 'Market Insights',            description: 'View daily market mover alerts',          icon: '2' },
  { level: 8,  title: 'Collection Badges',          description: 'Display tier badges on your profile',     icon: '3' },
  { level: 10, title: 'Enthusiast Title',           description: 'Unlock the Card Enthusiast rank',         icon: '4' },
  { level: 15, title: 'Pack Bonus',                 description: 'Extra card in daily pack simulations',    icon: '5' },
  { level: 20, title: 'Trader Title',               description: 'Unlock the Seasoned Trader rank',         icon: '6' },
  { level: 25, title: 'Showcase Spotlight',         description: 'Featured spot in community showcase',     icon: '7' },
  { level: 30, title: 'Expert Title',               description: 'Unlock the Expert Collector rank',        icon: '8' },
  { level: 35, title: 'Custom Card Frame',          description: 'Exclusive card frame for your profile',   icon: '9' },
  { level: 40, title: 'Master Title',               description: 'Unlock the Card Master rank',             icon: '10' },
  { level: 45, title: 'Legendary Badge',            description: 'Display the legendary collector badge',   icon: '11' },
  { level: 50, title: 'Hall of Fame',               description: 'Permanent spot on the Hall of Fame',      icon: '12' },
];

// ─── XP Calculation ─────────────────────────────────────────────────

interface XPBreakdown {
  source: string;
  label: string;
  count: number;
  xpPerAction: number;
  totalXP: number;
}

function calculateTotalXP(): { totalXP: number; breakdown: XPBreakdown[] } {
  const breakdown: XPBreakdown[] = [];
  let totalXP = 0;

  // Action-based XP
  for (const [key, config] of Object.entries(XP_ACTIONS)) {
    const count = parseInt(localStorage.getItem(key) || '0') || 0;
    if (count > 0) {
      const xp = count * config.xp;
      breakdown.push({ source: key, label: config.label, count, xpPerAction: config.xp, totalXP: xp });
      totalXP += xp;
    }
  }

  // Streak XP
  const streakDays = parseInt(localStorage.getItem('cv-visit-streak') || '0') || 0;
  if (streakDays > 0) {
    const streakXP = streakDays * STREAK_XP_PER_DAY;
    breakdown.push({ source: 'streak', label: 'Streak Days', count: streakDays, xpPerAction: STREAK_XP_PER_DAY, totalXP: streakXP });
    totalXP += streakXP;
  }

  // Achievement XP
  const achievementIds: string[] = (() => {
    try {
      const raw = localStorage.getItem('cv-achievements');
      if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }
    return [];
  })();
  if (achievementIds.length > 0) {
    const achXP = achievementIds.length * ACHIEVEMENT_XP;
    breakdown.push({ source: 'achievements', label: 'Achievements', count: achievementIds.length, xpPerAction: ACHIEVEMENT_XP, totalXP: achXP });
    totalXP += achXP;
  }

  // Sort by XP contribution descending
  breakdown.sort((a, b) => b.totalXP - a.totalXP);

  return { totalXP, breakdown };
}

// ─── Components ─────────────────────────────────────────────────────

function LevelBadge({ level, size = 'lg' }: { level: number; size?: 'sm' | 'md' | 'lg' }) {
  const tier = getTierForLevel(level);
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-base',
    lg: 'w-20 h-20 text-2xl',
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${tier.accent} flex items-center justify-center font-bold text-white shadow-lg`}>
      {level}
    </div>
  );
}

function LevelProgress({ level, xpIntoLevel, currentLevelXP, nextLevelXP, totalXP }: {
  level: number; xpIntoLevel: number; currentLevelXP: number; nextLevelXP: number; totalXP: number;
}) {
  const tier = getTierForLevel(level);
  const xpNeeded = nextLevelXP - currentLevelXP;
  const pct = level >= 50 ? 100 : Math.min(100, Math.round((xpIntoLevel / xpNeeded) * 100));

  return (
    <div className={`${tier.bg} border ${tier.border} rounded-2xl p-6 sm:p-8`}>
      <div className="flex items-center gap-5 sm:gap-6 mb-5">
        <LevelBadge level={level} />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1">
            <h2 className={`text-xl sm:text-2xl font-bold ${tier.color}`}>Level {level}</h2>
            {level < 50 && <span className="text-gray-500 text-sm">/ 50</span>}
          </div>
          <p className={`text-sm font-medium ${tier.color}`}>{tier.name}</p>
          <p className="text-xs text-gray-500 mt-0.5">{totalXP.toLocaleString()} total XP</p>
        </div>
      </div>

      {level < 50 ? (
        <div>
          <div className="flex items-center justify-between mb-2 text-xs">
            <span className="text-gray-400">Level {level}</span>
            <span className="text-gray-400">{xpIntoLevel.toLocaleString()} / {xpNeeded.toLocaleString()} XP</span>
            <span className="text-gray-400">Level {level + 1}</span>
          </div>
          <div className="w-full bg-gray-800/80 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${tier.accent} rounded-full transition-all duration-700 ease-out`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            {(xpNeeded - xpIntoLevel).toLocaleString()} XP to next level
          </p>
        </div>
      ) : (
        <div className="text-center">
          <p className={`text-sm font-medium ${tier.color}`}>MAX LEVEL REACHED</p>
          <p className="text-xs text-gray-500 mt-1">You are a CardVault legend.</p>
        </div>
      )}
    </div>
  );
}

function XPBreakdownSection({ breakdown }: { breakdown: XPBreakdown[] }) {
  if (breakdown.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
        <p className="text-gray-500 text-sm mb-3">No XP earned yet. Start exploring CardVault!</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link href="/sports" className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition-colors">Browse Cards</Link>
          <Link href="/tools/daily-pack" className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition-colors">Open a Pack</Link>
          <Link href="/guides" className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition-colors">Read Guides</Link>
        </div>
      </div>
    );
  }

  const totalXP = breakdown.reduce((s, b) => s + b.totalXP, 0);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-800">
        <h3 className="text-white font-semibold">XP Breakdown</h3>
        <p className="text-xs text-gray-500 mt-0.5">How you earned your {totalXP.toLocaleString()} XP</p>
      </div>
      <div className="divide-y divide-gray-800/60">
        {breakdown.map(b => {
          const pct = Math.round((b.totalXP / totalXP) * 100);
          return (
            <div key={b.source} className="px-5 py-3 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-white font-medium">{b.label}</span>
                  <span className="text-sm text-gray-300 font-mono">{b.totalXP.toLocaleString()} XP</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-800 rounded-full h-1.5 overflow-hidden">
                    <div className="h-full bg-emerald-500/70 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-gray-500 w-14 text-right">{b.count} x {b.xpPerAction}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TierRoadmap({ currentLevel }: { currentLevel: number }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-800">
        <h3 className="text-white font-semibold">Rank Progression</h3>
        <p className="text-xs text-gray-500 mt-0.5">5 ranks from Rookie to Card Master</p>
      </div>
      <div className="divide-y divide-gray-800/60">
        {LEVEL_TIERS.map(tier => {
          const isActive = currentLevel >= tier.minLevel && currentLevel <= tier.maxLevel;
          const isCompleted = currentLevel > tier.maxLevel;
          const rangeLabel = `Level ${tier.minLevel}${tier.maxLevel < 50 ? `-${tier.maxLevel}` : '+'}`;

          return (
            <div
              key={tier.name}
              className={`px-5 py-3.5 flex items-center gap-4 ${isActive ? tier.bg : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                isCompleted
                  ? 'bg-emerald-900/40 text-emerald-400'
                  : isActive
                    ? `bg-gradient-to-br ${tier.accent} text-white`
                    : 'bg-gray-800 text-gray-600'
              }`}>
                {isCompleted ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                ) : (
                  tier.minLevel
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${isActive ? tier.color : isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
                    {tier.name}
                  </span>
                  {isActive && (
                    <span className={`text-xs px-1.5 py-0.5 rounded ${tier.bg} ${tier.color} border ${tier.border}`}>
                      Current
                    </span>
                  )}
                </div>
                <span className={`text-xs ${isActive ? 'text-gray-400' : 'text-gray-600'}`}>{rangeLabel}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PerksSection({ currentLevel }: { currentLevel: number }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-800">
        <h3 className="text-white font-semibold">Level Perks</h3>
        <p className="text-xs text-gray-500 mt-0.5">{PERKS.filter(p => currentLevel >= p.level).length} / {PERKS.length} unlocked</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 divide-gray-800/60">
        {PERKS.map((perk, i) => {
          const unlocked = currentLevel >= perk.level;
          return (
            <div
              key={perk.level}
              className={`px-5 py-3.5 flex items-center gap-3 ${
                i % 2 === 0 ? 'sm:border-r sm:border-gray-800/60' : ''
              } ${i >= 2 ? 'sm:border-t sm:border-gray-800/60' : ''}`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                unlocked ? 'bg-emerald-900/30 text-emerald-400' : 'bg-gray-800 text-gray-600'
              }`}>
                {unlocked ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${unlocked ? 'text-white' : 'text-gray-500'}`}>
                  {perk.title}
                </p>
                <p className={`text-xs ${unlocked ? 'text-gray-400' : 'text-gray-600'}`}>
                  {unlocked ? perk.description : `Unlocks at Level ${perk.level}`}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HowToEarnXP() {
  const actionEntries = Object.entries(XP_ACTIONS);
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-800">
        <h3 className="text-white font-semibold">How to Earn XP</h3>
        <p className="text-xs text-gray-500 mt-0.5">Every action on CardVault earns experience</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
        {actionEntries.map(([key, config], i) => (
          <div
            key={key}
            className={`px-5 py-3 flex items-center justify-between ${
              i % 2 === 0 ? 'sm:border-r border-gray-800/40' : ''
            } ${i >= 2 ? 'border-t border-gray-800/40' : ''} ${i < 2 ? 'sm:border-b-0 border-b border-gray-800/40' : ''}`}
          >
            <span className="text-sm text-gray-300">{config.label}</span>
            <span className="text-sm font-mono text-emerald-400">+{config.xp} XP</span>
          </div>
        ))}
        <div className="px-5 py-3 flex items-center justify-between border-t border-gray-800/40 sm:border-r border-gray-800/40">
          <span className="text-sm text-gray-300">Daily Streak</span>
          <span className="text-sm font-mono text-emerald-400">+{STREAK_XP_PER_DAY} XP/day</span>
        </div>
        <div className="px-5 py-3 flex items-center justify-between border-t border-gray-800/40">
          <span className="text-sm text-gray-300">Achievement Unlock</span>
          <span className="text-sm font-mono text-emerald-400">+{ACHIEVEMENT_XP} XP each</span>
        </div>
      </div>
      <div className="px-5 py-4 border-t border-gray-800 bg-gray-900/80">
        <div className="flex flex-wrap gap-2">
          <Link href="/tools/daily-pack" className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition-colors">Open Packs</Link>
          <Link href="/sports" className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition-colors">Browse Cards</Link>
          <Link href="/card-battle" className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition-colors">Card Battles</Link>
          <Link href="/trivia" className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition-colors">Play Trivia</Link>
          <Link href="/achievements" className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition-colors">Achievements</Link>
          <Link href="/streak" className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition-colors">Streak</Link>
        </div>
      </div>
    </div>
  );
}

// ─── Main ───────────────────────────────────────────────────────────

export default function ProgressionClient() {
  const [mounted, setMounted] = useState(false);
  const [totalXP, setTotalXP] = useState(0);
  const [breakdown, setBreakdown] = useState<XPBreakdown[]>([]);
  const [tab, setTab] = useState<'overview' | 'perks' | 'how'>('overview');

  const loadData = useCallback(() => {
    const result = calculateTotalXP();
    setTotalXP(result.totalXP);
    setBreakdown(result.breakdown);
  }, []);

  useEffect(() => {
    loadData();
    setMounted(true);
  }, [loadData]);

  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-40 bg-gray-900 rounded-2xl" />
        <div className="h-64 bg-gray-900 rounded-xl" />
      </div>
    );
  }

  const { level, currentLevelXP, nextLevelXP, xpIntoLevel } = getLevelFromXP(totalXP);

  const tabs = [
    { key: 'overview' as const, label: 'Overview' },
    { key: 'perks' as const, label: 'Perks' },
    { key: 'how' as const, label: 'How to Earn' },
  ];

  return (
    <div className="space-y-6">
      {/* Level & Progress */}
      <LevelProgress
        level={level}
        xpIntoLevel={xpIntoLevel}
        currentLevelXP={currentLevelXP}
        nextLevelXP={nextLevelXP}
        totalXP={totalXP}
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Level</p>
          <p className="text-2xl font-bold text-white">{level}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Total XP</p>
          <p className="text-2xl font-bold text-emerald-400">{totalXP.toLocaleString()}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Perks</p>
          <p className="text-2xl font-bold text-purple-400">{PERKS.filter(p => level >= p.level).length}/{PERKS.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-800 pb-0">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`text-sm px-4 py-2.5 border-b-2 transition-colors ${
              tab === t.key
                ? 'border-emerald-500 text-white'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'overview' && (
        <div className="space-y-6">
          <XPBreakdownSection breakdown={breakdown} />
          <TierRoadmap currentLevel={level} />
        </div>
      )}

      {tab === 'perks' && <PerksSection currentLevel={level} />}

      {tab === 'how' && <HowToEarnXP />}

      {/* Related Links */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-3">Related</h3>
        <div className="flex flex-wrap gap-2">
          <Link href="/achievements" className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition-colors">Achievements</Link>
          <Link href="/streak" className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition-colors">Daily Streak</Link>
          <Link href="/my-hub" className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition-colors">Collector Hub</Link>
          <Link href="/leaderboard" className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition-colors">Leaderboard</Link>
          <Link href="/activity" className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition-colors">Activity Feed</Link>
          <Link href="/card-battle" className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition-colors">Card Battles</Link>
        </div>
      </div>
    </div>
  );
}
