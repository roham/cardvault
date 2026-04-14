'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface DailyStatus {
  dailyPackOpened: boolean;
  streak: number;
  triviaScore: number | null;
  flipOrKeepPlayed: boolean;
  ripOrSkipVoted: boolean;
  achievementCount: number;
  watchlistCount: number;
}

function getTodayKey() {
  return new Date().toISOString().split('T')[0];
}

function getDailyStatus(): DailyStatus {
  const today = getTodayKey();

  // Daily pack
  let dailyPackOpened = false;
  try {
    const dp = localStorage.getItem('cardvault-daily-pack');
    if (dp) {
      const parsed = JSON.parse(dp);
      dailyPackOpened = parsed.lastOpenDate === today;
    }
  } catch {}

  // Streak
  let streak = 0;
  try {
    const s = localStorage.getItem('cardvault-streak');
    if (s) {
      const parsed = JSON.parse(s);
      streak = parsed.currentStreak || 0;
    }
  } catch {}

  // Trivia
  let triviaScore: number | null = null;
  try {
    const t = localStorage.getItem('cardvault-trivia');
    if (t) {
      const parsed = JSON.parse(t);
      if (parsed.lastPlayDate === today) {
        triviaScore = parsed.todayScore ?? null;
      }
    }
  } catch {}

  // Flip or Keep
  let flipOrKeepPlayed = false;
  try {
    const fk = localStorage.getItem('cardvault-flip-or-keep');
    if (fk) {
      const parsed = JSON.parse(fk);
      flipOrKeepPlayed = parsed.lastPlayDate === today;
    }
  } catch {}

  // Rip or Skip
  let ripOrSkipVoted = false;
  try {
    const rs = localStorage.getItem('cardvault-rip-or-skip');
    if (rs) {
      const parsed = JSON.parse(rs);
      ripOrSkipVoted = parsed.lastVoteDate === today;
    }
  } catch {}

  // Achievements
  let achievementCount = 0;
  try {
    const a = localStorage.getItem('cardvault-achievements');
    if (a) {
      const parsed = JSON.parse(a);
      achievementCount = Object.values(parsed).filter(Boolean).length;
    }
  } catch {}

  // Watchlist
  let watchlistCount = 0;
  try {
    const w = localStorage.getItem('cardvault-watchlist');
    if (w) {
      const parsed = JSON.parse(w);
      watchlistCount = Array.isArray(parsed) ? parsed.length : 0;
    }
  } catch {}

  return { dailyPackOpened, streak, triviaScore, flipOrKeepPlayed, ripOrSkipVoted, achievementCount, watchlistCount };
}

export default function TodayDashboard() {
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<DailyStatus>({
    dailyPackOpened: false,
    streak: 0,
    triviaScore: null,
    flipOrKeepPlayed: false,
    ripOrSkipVoted: false,
    achievementCount: 0,
    watchlistCount: 0,
  });

  useEffect(() => {
    setMounted(true);
    setStatus(getDailyStatus());
  }, []);

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const completedCount = [
    status.dailyPackOpened,
    status.triviaScore !== null,
    status.flipOrKeepPlayed,
    status.ripOrSkipVoted,
  ].filter(Boolean).length;

  const dailyItems = [
    {
      href: '/tools/daily-pack',
      icon: '🎁',
      label: 'Daily Pack',
      done: status.dailyPackOpened,
      doneText: 'Opened',
      todoText: 'Open now',
      color: 'text-orange-400',
    },
    {
      href: '/trivia',
      icon: '🧠',
      label: 'Trivia',
      done: status.triviaScore !== null,
      doneText: status.triviaScore !== null ? `${status.triviaScore}/5` : '',
      todoText: 'Play now',
      color: 'text-violet-400',
    },
    {
      href: '/flip-or-keep',
      icon: '🃏',
      label: 'Flip or Keep',
      done: status.flipOrKeepPlayed,
      doneText: 'Played',
      todoText: 'Play now',
      color: 'text-purple-400',
    },
    {
      href: '/rip-or-skip',
      icon: '🔥',
      label: 'Rip or Skip',
      done: status.ripOrSkipVoted,
      doneText: 'Voted',
      todoText: 'Vote now',
      color: 'text-red-400',
    },
  ];

  return (
    <section className="border-b border-gray-800 bg-gray-900/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Date + streak + progress */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <h2 className="text-white font-bold text-sm sm:text-base">{dateStr}</h2>
            {mounted && status.streak > 0 && (
              <Link href="/streak" className="inline-flex items-center gap-1.5 bg-amber-950/60 border border-amber-800/40 text-amber-400 text-xs font-medium px-2.5 py-1 rounded-full hover:border-amber-700 transition-colors">
                <span className="text-amber-400">🔥</span>
                {status.streak} day streak
              </Link>
            )}
          </div>
          <div className="flex items-center gap-2">
            {mounted && (
              <span className="text-gray-500 text-xs">
                {completedCount}/4 daily tasks
              </span>
            )}
            <div className="flex gap-1">
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    mounted && i < completedCount ? 'bg-emerald-400' : 'bg-gray-700'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Daily action cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {dailyItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-2.5 rounded-xl px-3 py-2.5 border transition-all ${
                mounted && item.done
                  ? 'bg-gray-800/50 border-gray-700/50'
                  : 'bg-gray-800/80 border-gray-700 hover:border-emerald-700/60 hover:bg-gray-800'
              }`}
            >
              <span className="text-lg shrink-0">{item.icon}</span>
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-semibold truncate ${mounted && item.done ? 'text-gray-500' : 'text-white group-hover:text-emerald-400 transition-colors'}`}>
                  {item.label}
                </p>
                <p className={`text-xs ${mounted && item.done ? 'text-emerald-500' : item.color}`}>
                  {mounted ? (item.done ? item.doneText : item.todoText) : '...'}
                </p>
              </div>
              {mounted && item.done && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500 shrink-0">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </Link>
          ))}
        </div>

        {/* Quick links row */}
        <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-gray-800/60">
          <Link href="/my-hub" className="text-xs text-gray-400 hover:text-emerald-400 transition-colors">
            My Hub
          </Link>
          <span className="text-gray-700">·</span>
          <Link href="/market-movers" className="text-xs text-gray-400 hover:text-emerald-400 transition-colors">
            Market Movers
          </Link>
          <span className="text-gray-700">·</span>
          <Link href="/weekly-challenge" className="text-xs text-gray-400 hover:text-emerald-400 transition-colors">
            Weekly Challenge
          </Link>
          <span className="text-gray-700">·</span>
          <Link href="/card-of-the-day" className="text-xs text-gray-400 hover:text-emerald-400 transition-colors">
            Card of the Day
          </Link>
          <span className="text-gray-700">·</span>
          <Link href="/news" className="text-xs text-gray-400 hover:text-emerald-400 transition-colors">
            News
          </Link>
          {mounted && status.watchlistCount > 0 && (
            <>
              <span className="text-gray-700">·</span>
              <Link href="/tools/watchlist" className="text-xs text-gray-400 hover:text-emerald-400 transition-colors">
                Watchlist ({status.watchlistCount})
              </Link>
            </>
          )}
          {mounted && status.achievementCount > 0 && (
            <>
              <span className="text-gray-700">·</span>
              <Link href="/achievements" className="text-xs text-gray-400 hover:text-emerald-400 transition-colors">
                {status.achievementCount} badges
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
