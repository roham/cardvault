'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

// Simulated global leaderboard entries — deterministic NPCs that feel real
const NPC_LEADERBOARD = [
  { name: 'CardKing_Marcus', score: 42.8, game: 'weekly', week: '2026-W14', avatar: '🏆' },
  { name: 'WaxBreaker_Dave', score: 38.2, game: 'weekly', week: '2026-W12', avatar: '🃏' },
  { name: 'GemMintKai', score: 35.6, game: 'weekly', week: '2026-W15', avatar: '💎' },
  { name: 'PackRipper_Jess', score: 34.1, game: 'weekly', week: '2026-W13', avatar: '🎰' },
  { name: 'SetBuilder_Mia', score: 32.7, game: 'weekly', week: '2026-W11', avatar: '📦' },
  { name: 'FlipMaster99', score: 31.4, game: 'weekly', week: '2026-W14', avatar: '💰' },
  { name: 'VintageVibes_Tony', score: 29.9, game: 'weekly', week: '2026-W10', avatar: '🎩' },
  { name: 'RookieHunter_X', score: 28.3, game: 'weekly', week: '2026-W15', avatar: '🔥' },
  { name: 'ChromeChaser', score: 27.1, game: 'weekly', week: '2026-W09', avatar: '✨' },
  { name: 'HobbyDad42', score: 25.8, game: 'weekly', week: '2026-W13', avatar: '⚾' },
  { name: 'PSA10Life', score: 24.5, game: 'weekly', week: '2026-W12', avatar: '🏅' },
  { name: 'BoxBreaker_OG', score: 23.2, game: 'weekly', week: '2026-W11', avatar: '📈' },
  { name: 'CardShowKing', score: 22.0, game: 'weekly', week: '2026-W14', avatar: '👑' },
  { name: 'PrizmPrincess', score: 20.8, game: 'weekly', week: '2026-W10', avatar: '🌈' },
  { name: 'SlabCollector', score: 19.6, game: 'weekly', week: '2026-W15', avatar: '📊' },
];

const NPC_PORTFOLIO = [
  { name: 'InvestorKai_26', score: 48200, game: 'portfolio', avatar: '📈' },
  { name: 'LongHold_Marcus', score: 41500, game: 'portfolio', avatar: '💎' },
  { name: 'FlipMaster99', score: 38900, game: 'portfolio', avatar: '💰' },
  { name: 'VintageVibes_Tony', score: 35100, game: 'portfolio', avatar: '🎩' },
  { name: 'RookieHunter_X', score: 32400, game: 'portfolio', avatar: '🔥' },
  { name: 'ChromeChaser', score: 29800, game: 'portfolio', avatar: '✨' },
  { name: 'GemMintKai', score: 27200, game: 'portfolio', avatar: '🏆' },
  { name: 'SetBuilder_Mia', score: 24900, game: 'portfolio', avatar: '📦' },
  { name: 'CardKing_Marcus', score: 22300, game: 'portfolio', avatar: '🃏' },
  { name: 'PackRipper_Jess', score: 19700, game: 'portfolio', avatar: '🎰' },
];

type Tab = 'weekly' | 'portfolio' | 'personal';

function formatScore(score: number, game: string): string {
  if (game === 'portfolio') {
    if (score >= 1000) return '$' + (score / 1000).toFixed(1) + 'K';
    return '$' + score.toLocaleString();
  }
  return score.toFixed(1) + '%';
}

export default function LeaderboardClient() {
  const [tab, setTab] = useState<Tab>('weekly');
  const [mounted, setMounted] = useState(false);
  const [userWeeklyScores, setUserWeeklyScores] = useState<Array<{ weekId: string; score: number; theme: string }>>([]);
  const [userPortfolioScore, setUserPortfolioScore] = useState<number>(0);

  useEffect(() => {
    setMounted(true);
    // Load weekly challenge history
    try {
      const raw = localStorage.getItem('cardvault-weekly-challenge');
      if (raw) {
        const data = JSON.parse(raw);
        if (data.entries) {
          setUserWeeklyScores(data.entries.map((e: { weekId: string; score: number; theme: string }) => ({
            weekId: e.weekId,
            score: e.score,
            theme: e.theme || 'Challenge',
          })));
        }
      }
    } catch { /* ignore */ }

    // Load portfolio score
    try {
      const raw = localStorage.getItem('cardvault-portfolio');
      if (raw) {
        const data = JSON.parse(raw);
        if (data.bestReturn) setUserPortfolioScore(data.bestReturn);
      }
    } catch { /* ignore */ }
  }, []);

  // Merge user into weekly leaderboard
  const weeklyLeaderboard = useMemo(() => {
    const best = userWeeklyScores.length > 0
      ? Math.max(...userWeeklyScores.map(s => s.score))
      : 0;
    const entries = [...NPC_LEADERBOARD];
    if (best > 0) {
      entries.push({ name: 'You', score: best, game: 'weekly', week: 'Best', avatar: '⭐' });
    }
    return entries.sort((a, b) => b.score - a.score);
  }, [userWeeklyScores]);

  // Merge user into portfolio leaderboard
  const portfolioLeaderboard = useMemo(() => {
    const entries = [...NPC_PORTFOLIO];
    if (userPortfolioScore > 0) {
      entries.push({ name: 'You', score: userPortfolioScore, game: 'portfolio', avatar: '⭐' });
    }
    return entries.sort((a, b) => b.score - a.score);
  }, [userPortfolioScore]);

  // Personal bests
  const personalBests = useMemo(() => {
    return [...userWeeklyScores].sort((a, b) => b.score - a.score).slice(0, 10);
  }, [userWeeklyScores]);

  const userBestWeekly = userWeeklyScores.length > 0 ? Math.max(...userWeeklyScores.map(s => s.score)) : 0;
  const userWeeklyRank = weeklyLeaderboard.findIndex(e => e.name === 'You') + 1;
  const userPortfolioRank = portfolioLeaderboard.findIndex(e => e.name === 'You') + 1;

  if (!mounted) {
    return <div className="text-center py-20 text-gray-500">Loading leaderboards...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Your Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Weekly Best</p>
          <p className="text-white text-2xl font-bold">{userBestWeekly > 0 ? userBestWeekly.toFixed(1) + '%' : '—'}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Weekly Rank</p>
          <p className="text-white text-2xl font-bold">{userWeeklyRank > 0 ? `#${userWeeklyRank}` : '—'}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Challenges</p>
          <p className="text-white text-2xl font-bold">{userWeeklyScores.length}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Portfolio Rank</p>
          <p className="text-white text-2xl font-bold">{userPortfolioRank > 0 ? `#${userPortfolioRank}` : '—'}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 bg-gray-900 border border-gray-800 rounded-xl p-1.5">
        {([
          { key: 'weekly' as Tab, label: 'Weekly Challenge' },
          { key: 'portfolio' as Tab, label: 'Fantasy Portfolio' },
          { key: 'personal' as Tab, label: 'My History' },
        ]).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key
                ? 'bg-emerald-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Weekly Leaderboard */}
      {tab === 'weekly' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Top Weekly Scores</h3>
            <Link href="/weekly-challenge" className="text-emerald-400 text-sm hover:text-emerald-300 transition-colors">
              Play This Week
            </Link>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            {weeklyLeaderboard.map((entry, i) => {
              const isUser = entry.name === 'You';
              return (
                <div
                  key={`${entry.name}-${i}`}
                  className={`flex items-center gap-4 px-4 py-3 ${
                    i < weeklyLeaderboard.length - 1 ? 'border-b border-gray-800' : ''
                  } ${isUser ? 'bg-emerald-950/30' : ''}`}
                >
                  <span className={`w-8 text-center font-bold text-sm ${
                    i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-gray-500'
                  }`}>
                    {i + 1}
                  </span>
                  <span className="text-lg">{entry.avatar}</span>
                  <span className={`flex-1 font-medium text-sm ${isUser ? 'text-emerald-400' : 'text-white'}`}>
                    {entry.name}
                  </span>
                  <span className="text-gray-500 text-xs">{entry.week}</span>
                  <span className={`font-bold text-sm ${entry.score > 30 ? 'text-emerald-400' : entry.score > 20 ? 'text-white' : 'text-gray-400'}`}>
                    +{entry.score.toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
          {userWeeklyScores.length === 0 && (
            <div className="mt-4 text-center">
              <p className="text-gray-500 text-sm mb-3">Complete a weekly challenge to appear on the leaderboard</p>
              <Link href="/weekly-challenge" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl transition-colors">
                Start This Week&apos;s Challenge
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Portfolio Leaderboard */}
      {tab === 'portfolio' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Top Portfolio Returns</h3>
            <Link href="/tools/portfolio" className="text-emerald-400 text-sm hover:text-emerald-300 transition-colors">
              Play Portfolio Game
            </Link>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            {portfolioLeaderboard.map((entry, i) => {
              const isUser = entry.name === 'You';
              return (
                <div
                  key={`${entry.name}-${i}`}
                  className={`flex items-center gap-4 px-4 py-3 ${
                    i < portfolioLeaderboard.length - 1 ? 'border-b border-gray-800' : ''
                  } ${isUser ? 'bg-emerald-950/30' : ''}`}
                >
                  <span className={`w-8 text-center font-bold text-sm ${
                    i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-gray-500'
                  }`}>
                    {i + 1}
                  </span>
                  <span className="text-lg">{entry.avatar}</span>
                  <span className={`flex-1 font-medium text-sm ${isUser ? 'text-emerald-400' : 'text-white'}`}>
                    {entry.name}
                  </span>
                  <span className={`font-bold text-sm text-emerald-400`}>
                    {formatScore(entry.score, 'portfolio')}
                  </span>
                </div>
              );
            })}
          </div>
          {userPortfolioScore === 0 && (
            <div className="mt-4 text-center">
              <p className="text-gray-500 text-sm mb-3">Draft a fantasy portfolio to appear on the leaderboard</p>
              <Link href="/tools/portfolio" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl transition-colors">
                Draft Your Portfolio
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Personal History */}
      {tab === 'personal' && (
        <div>
          <h3 className="text-lg font-bold text-white mb-4">Your Challenge History</h3>
          {personalBests.length > 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              {personalBests.map((entry, i) => (
                <div
                  key={entry.weekId}
                  className={`flex items-center gap-4 px-4 py-3 ${i < personalBests.length - 1 ? 'border-b border-gray-800' : ''}`}
                >
                  <span className={`w-8 text-center font-bold text-sm ${
                    i === 0 ? 'text-yellow-400' : 'text-gray-500'
                  }`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium">{entry.theme}</p>
                    <p className="text-gray-500 text-xs">{entry.weekId}</p>
                  </div>
                  <span className={`font-bold text-sm ${entry.score > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {entry.score > 0 ? '+' : ''}{entry.score.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-gray-800 rounded-2xl">
              <p className="text-4xl mb-4">📊</p>
              <h3 className="text-white text-lg font-semibold mb-2">No history yet</h3>
              <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
                Complete weekly challenges to build your history. Your best scores will appear on the global leaderboard.
              </p>
              <Link href="/weekly-challenge" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl transition-colors">
                Start Your First Challenge
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
