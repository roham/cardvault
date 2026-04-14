'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastVisitDate: string; // YYYY-MM-DD
  totalVisits: number;
  startDate: string; // YYYY-MM-DD
  streakHistory: number[]; // last 30 days, 1 = visited, 0 = not
}

const STORAGE_KEY = 'cardvault-streak';

const milestones = [
  { days: 3, title: 'Getting Started', emoji: '🌱', description: '3-day streak' },
  { days: 7, title: 'Week Warrior', emoji: '🔥', description: '7-day streak' },
  { days: 14, title: 'Dedicated', emoji: '⚡', description: '14-day streak' },
  { days: 30, title: 'Monthly Master', emoji: '🏆', description: '30-day streak' },
  { days: 60, title: 'Iron Collector', emoji: '💎', description: '60-day streak' },
  { days: 100, title: 'Centurion', emoji: '👑', description: '100-day streak' },
  { days: 365, title: 'Yearly Legend', emoji: '🌟', description: '365-day streak' },
];

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

function daysSince(dateStr: string): number {
  const now = new Date(getToday());
  const then = new Date(dateStr);
  return Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24));
}

function loadStreak(): StreakData {
  if (typeof window === 'undefined') {
    return { currentStreak: 0, longestStreak: 0, lastVisitDate: '', totalVisits: 0, startDate: '', streakHistory: [] };
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { currentStreak: 0, longestStreak: 0, lastVisitDate: '', totalVisits: 0, startDate: '', streakHistory: [] };
}

function saveStreak(data: StreakData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export default function StreakClient() {
  const [streak, setStreak] = useState<StreakData>({ currentStreak: 0, longestStreak: 0, lastVisitDate: '', totalVisits: 0, startDate: '', streakHistory: [] });
  const [justExtended, setJustExtended] = useState(false);
  const [newMilestone, setNewMilestone] = useState<typeof milestones[0] | null>(null);

  useEffect(() => {
    const today = getToday();
    const yesterday = getYesterday();
    const data = loadStreak();

    if (data.lastVisitDate === today) {
      // Already visited today — no change
      setStreak(data);
      return;
    }

    // Update streak
    const isConsecutive = data.lastVisitDate === yesterday;
    const oldStreak = data.currentStreak;

    if (isConsecutive) {
      data.currentStreak += 1;
    } else if (data.lastVisitDate === '') {
      // First visit ever
      data.currentStreak = 1;
      data.startDate = today;
    } else {
      // Streak broken
      data.currentStreak = 1;
    }

    data.lastVisitDate = today;
    data.totalVisits += 1;
    if (data.currentStreak > data.longestStreak) {
      data.longestStreak = data.currentStreak;
    }

    // Update 30-day history
    if (isConsecutive) {
      data.streakHistory = [...data.streakHistory.slice(-29), 1];
    } else {
      // Gap — fill missing days with 0s
      const gap = data.lastVisitDate ? daysSince(data.lastVisitDate) : 0;
      const zeros = new Array(Math.min(gap - 1, 29)).fill(0);
      data.streakHistory = [...data.streakHistory, ...zeros, 1].slice(-30);
    }

    saveStreak(data);
    setStreak(data);

    if (data.currentStreak > oldStreak && data.currentStreak > 1) {
      setJustExtended(true);
    }

    // Check for new milestone
    const reached = milestones.find(m => m.days === data.currentStreak);
    if (reached) setNewMilestone(reached);
  }, []);

  const nextMilestone = milestones.find(m => m.days > streak.currentStreak);
  const daysToNext = nextMilestone ? nextMilestone.days - streak.currentStreak : null;
  const currentMilestone = [...milestones].reverse().find(m => m.days <= streak.currentStreak);

  return (
    <div>
      <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-center">Daily Streak</h1>
      <p className="text-gray-400 text-center mb-8">Come back every day to build your streak</p>

      {/* Milestone Celebration */}
      {newMilestone && (
        <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-xl p-6 mb-8 text-center animate-pulse">
          <span className="text-5xl block mb-2">{newMilestone.emoji}</span>
          <h2 className="text-xl font-bold text-yellow-300">Milestone Unlocked!</h2>
          <p className="text-yellow-200 text-lg font-semibold">{newMilestone.title} — {newMilestone.description}</p>
        </div>
      )}

      {/* Main Streak Display */}
      <div className="bg-gray-900/60 border border-gray-800/60 rounded-2xl p-8 text-center mb-8">
        <div className={`text-7xl sm:text-8xl font-black mb-2 ${justExtended ? 'text-orange-400' : 'text-white'}`}>
          {streak.currentStreak}
        </div>
        <p className="text-lg text-gray-400 mb-1">
          {streak.currentStreak === 1 ? 'day' : 'consecutive days'}
        </p>
        {justExtended && streak.currentStreak > 1 && (
          <p className="text-orange-400 font-semibold text-sm">Streak extended! Keep it going!</p>
        )}
        {streak.currentStreak === 0 && (
          <p className="text-gray-500 text-sm">Visit tomorrow to start your streak</p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-900/60 border border-gray-800/60 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{streak.longestStreak}</div>
          <div className="text-xs text-gray-500 mt-1">Longest Streak</div>
        </div>
        <div className="bg-gray-900/60 border border-gray-800/60 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{streak.totalVisits}</div>
          <div className="text-xs text-gray-500 mt-1">Total Visits</div>
        </div>
        <div className="bg-gray-900/60 border border-gray-800/60 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">{currentMilestone?.emoji || '🌱'}</div>
          <div className="text-xs text-gray-500 mt-1">{currentMilestone?.title || 'No Rank Yet'}</div>
        </div>
      </div>

      {/* 30-Day Activity Grid */}
      {streak.streakHistory.length > 0 && (
        <div className="bg-gray-900/60 border border-gray-800/60 rounded-xl p-5 mb-8">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Last 30 Days</h3>
          <div className="grid grid-cols-10 gap-1.5">
            {Array.from({ length: 30 }, (_, i) => {
              const historyIdx = streak.streakHistory.length - 30 + i;
              const visited = historyIdx >= 0 ? streak.streakHistory[historyIdx] : 0;
              return (
                <div
                  key={i}
                  className={`aspect-square rounded-sm ${
                    visited ? 'bg-green-500/70' : 'bg-gray-800/60'
                  }`}
                  title={visited ? 'Visited' : 'Missed'}
                />
              );
            })}
          </div>
          <p className="text-xs text-gray-500 mt-2">Green = visited | Gray = missed</p>
        </div>
      )}

      {/* Next Milestone */}
      {nextMilestone && (
        <div className="bg-gray-900/60 border border-gray-800/60 rounded-xl p-5 mb-8">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Next Milestone</h3>
          <div className="flex items-center gap-4">
            <span className="text-3xl">{nextMilestone.emoji}</span>
            <div className="flex-1">
              <p className="font-semibold text-white">{nextMilestone.title}</p>
              <p className="text-sm text-gray-400">{nextMilestone.description}</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-blue-400">{daysToNext}</div>
              <div className="text-xs text-gray-500">days away</div>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-3 bg-gray-800 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (streak.currentStreak / nextMilestone.days) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Milestones List */}
      <div className="bg-gray-900/60 border border-gray-800/60 rounded-xl p-5 mb-8">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">All Milestones</h3>
        <div className="space-y-3">
          {milestones.map((m) => {
            const reached = streak.longestStreak >= m.days;
            return (
              <div key={m.days} className={`flex items-center gap-3 ${reached ? '' : 'opacity-40'}`}>
                <span className="text-2xl">{m.emoji}</span>
                <div className="flex-1">
                  <span className="font-semibold">{m.title}</span>
                  <span className="text-sm text-gray-500 ml-2">{m.description}</span>
                </div>
                {reached && <span className="text-green-400 text-sm font-semibold">Unlocked</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Activities CTA */}
      <div className="bg-gray-900/60 border border-gray-800/60 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">While You&apos;re Here</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href="/card-of-the-day" className="block bg-gray-800/60 rounded-lg p-3 hover:bg-gray-700/60 transition-colors">
            <span className="text-lg">🃏</span>
            <span className="ml-2 text-sm font-medium">Card of the Day</span>
          </Link>
          <Link href="/tools/pack-sim" className="block bg-gray-800/60 rounded-lg p-3 hover:bg-gray-700/60 transition-colors">
            <span className="text-lg">📦</span>
            <span className="ml-2 text-sm font-medium">Open a Pack</span>
          </Link>
          <Link href="/tools/portfolio" className="block bg-gray-800/60 rounded-lg p-3 hover:bg-gray-700/60 transition-colors">
            <span className="text-lg">📊</span>
            <span className="ml-2 text-sm font-medium">Fantasy Portfolio</span>
          </Link>
          <Link href="/achievements" className="block bg-gray-800/60 rounded-lg p-3 hover:bg-gray-700/60 transition-colors">
            <span className="text-lg">🏅</span>
            <span className="ml-2 text-sm font-medium">Achievements</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
