'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

/* ------------------------------------------------------------------ */
/*  Gather data from all localStorage features                        */
/* ------------------------------------------------------------------ */

interface InsightsData {
  // Engagement
  streak: number;
  achievementCount: number;
  totalAchievements: number;
  packHistory: number;
  mysteryBoxes: number;
  triviaHighScore: number;
  flipOrKeepBest: number;
  battleWins: number;
  battleLosses: number;
  bingoCompleted: number;
  // Collection
  vaultCards: number;
  vaultValue: number;
  binderCards: number;
  watchlistCards: number;
  // Investment
  haulItems: number;
  haulSpent: number;
  haulValue: number;
  rookieInvestments: number;
  rookieInvested: number;
  rookieValue: number;
  // Challenge
  weeklyPlayed: number;
  portfolioPlayed: number;
}

function gatherInsights(): InsightsData {
  const data: InsightsData = {
    streak: 0, achievementCount: 0, totalAchievements: 24, packHistory: 0,
    mysteryBoxes: 0, triviaHighScore: 0, flipOrKeepBest: 0, battleWins: 0,
    battleLosses: 0, bingoCompleted: 0, vaultCards: 0, vaultValue: 0,
    binderCards: 0, watchlistCards: 0, haulItems: 0, haulSpent: 0, haulValue: 0,
    rookieInvestments: 0, rookieInvested: 0, rookieValue: 0, weeklyPlayed: 0,
    portfolioPlayed: 0,
  };

  if (typeof window === 'undefined') return data;

  try {
    // Streak
    const streakData = localStorage.getItem('cardvault-streak');
    if (streakData) { const s = JSON.parse(streakData); data.streak = s.currentStreak || 0; }

    // Achievements
    const achData = localStorage.getItem('cardvault-achievements');
    if (achData) { const a = JSON.parse(achData); data.achievementCount = Object.keys(a).length; }

    // Pack history
    const packData = localStorage.getItem('cardvault-pack-sim-history');
    if (packData) { const p = JSON.parse(packData); data.packHistory = Array.isArray(p) ? p.length : 0; }

    // Mystery boxes
    const mysteryData = localStorage.getItem('cardvault-mystery-pack-history');
    if (mysteryData) { const m = JSON.parse(mysteryData); data.mysteryBoxes = Array.isArray(m) ? m.length : 0; }

    // Battle record
    const battleData = localStorage.getItem('cardvault-card-battle');
    if (battleData) { const b = JSON.parse(battleData); data.battleWins = b.wins || 0; data.battleLosses = b.losses || 0; }

    // Vault
    const vaultData = localStorage.getItem('cardvault-vault-cards');
    if (vaultData) {
      const v = JSON.parse(vaultData);
      if (Array.isArray(v)) { data.vaultCards = v.length; data.vaultValue = v.reduce((s: number, c: { value?: number }) => s + (c.value || 0), 0); }
    }

    // Binder
    const binderData = localStorage.getItem('cardvault-binder');
    if (binderData) {
      const b = JSON.parse(binderData);
      if (b.collected) data.binderCards = Array.isArray(b.collected) ? b.collected.length : 0;
    }

    // Watchlist
    const watchData = localStorage.getItem('cardvault-watchlist');
    if (watchData) { const w = JSON.parse(watchData); data.watchlistCards = Array.isArray(w) ? w.length : 0; }

    // Haul tracker
    const haulData = localStorage.getItem('cardvault-card-show-haul');
    if (haulData) {
      const h = JSON.parse(haulData);
      if (Array.isArray(h)) {
        data.haulItems = h.length;
        data.haulSpent = h.reduce((s: number, i: { price?: number }) => s + (i.price || 0), 0);
        data.haulValue = h.reduce((s: number, i: { estimatedValue?: number }) => s + (i.estimatedValue || 0), 0);
      }
    }

    // Rookie investments
    const rookieData = localStorage.getItem('cardvault-rookie-tracker');
    if (rookieData) {
      const r = JSON.parse(rookieData);
      if (Array.isArray(r)) {
        data.rookieInvestments = r.length;
        data.rookieInvested = r.reduce((s: number, i: { purchasePrice?: number }) => s + (i.purchasePrice || 0), 0);
        data.rookieValue = r.reduce((s: number, i: { currentValue?: number }) => s + (i.currentValue || 0), 0);
      }
    }

    // Weekly challenge
    const weekData = localStorage.getItem('cardvault-weekly-challenge');
    if (weekData) { const w = JSON.parse(weekData); data.weeklyPlayed = w.history?.length || 0; }

    // Portfolio
    const portData = localStorage.getItem('cardvault-portfolio');
    if (portData) { const p = JSON.parse(portData); data.portfolioPlayed = p.history?.length || 0; }
  } catch { /* parsing errors are fine */ }

  return data;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function InsightsClient() {
  const [data, setData] = useState<InsightsData | null>(null);

  useEffect(() => { setData(gatherInsights()); }, []);

  if (!data) return <div className="text-center py-12 text-gray-500">Loading insights...</div>;

  const totalInvested = data.haulSpent + data.rookieInvested;
  const totalValue = data.haulValue + data.rookieValue + data.vaultValue;
  const engagementScore = Math.min(100,
    (data.streak > 0 ? 10 : 0) +
    (data.achievementCount / data.totalAchievements * 20) +
    (data.packHistory > 0 ? 10 : 0) +
    (data.mysteryBoxes > 0 ? 10 : 0) +
    (data.battleWins > 0 ? 10 : 0) +
    (data.vaultCards > 0 ? 10 : 0) +
    (data.binderCards > 0 ? 10 : 0) +
    (data.weeklyPlayed > 0 ? 10 : 0) +
    (data.rookieInvestments > 0 ? 10 : 0)
  );

  const hasActivity = data.streak > 0 || data.achievementCount > 0 || data.packHistory > 0 || data.vaultCards > 0;

  const collectorType = engagementScore >= 80 ? 'Power Collector'
    : engagementScore >= 50 ? 'Active Collector'
    : engagementScore >= 20 ? 'Casual Collector'
    : 'Getting Started';

  return (
    <div className="space-y-8">
      {/* Collector Profile */}
      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700 rounded-2xl p-6 text-center">
        <div className="text-5xl mb-3">
          {engagementScore >= 80 ? '🏆' : engagementScore >= 50 ? '⭐' : engagementScore >= 20 ? '📊' : '🌱'}
        </div>
        <h2 className="text-2xl font-bold text-white mb-1">{collectorType}</h2>
        <p className="text-sm text-gray-400">Engagement Score: {engagementScore}/100</p>
        <div className="w-full max-w-xs mx-auto bg-gray-700 rounded-full h-3 mt-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000"
            style={{ width: `${engagementScore}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {[
          { label: 'Day Streak', value: data.streak.toString(), icon: '🔥', color: 'text-orange-400' },
          { label: 'Achievements', value: `${data.achievementCount}/${data.totalAchievements}`, icon: '🏅', color: 'text-yellow-400' },
          { label: 'Packs Opened', value: data.packHistory.toString(), icon: '🎰', color: 'text-purple-400' },
          { label: 'Mystery Boxes', value: data.mysteryBoxes.toString(), icon: '🎲', color: 'text-pink-400' },
          { label: 'Battle Record', value: `${data.battleWins}W-${data.battleLosses}L`, icon: '⚔️', color: 'text-red-400' },
          { label: 'Vault Cards', value: data.vaultCards.toString(), icon: '🔒', color: 'text-blue-400' },
          { label: 'Binder Cards', value: data.binderCards.toString(), icon: '📖', color: 'text-green-400' },
          { label: 'Watchlist', value: data.watchlistCards.toString(), icon: '👀', color: 'text-cyan-400' },
        ].map(s => (
          <div key={s.label} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-3 text-center">
            <div className="text-xl mb-1">{s.icon}</div>
            <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Investment Summary */}
      {(data.haulItems > 0 || data.rookieInvestments > 0) && (
        <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-5">
          <h3 className="font-bold text-white mb-4">Investment Summary</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xs text-gray-500 uppercase">Total Invested</div>
              <div className="text-lg font-bold text-white">${totalInvested.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase">Current Value</div>
              <div className="text-lg font-bold text-blue-400">${totalValue.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase">P&L</div>
              <div className={`text-lg font-bold ${totalValue - totalInvested >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {totalValue - totalInvested >= 0 ? '+' : ''}{(totalValue - totalInvested).toFixed(2)}
              </div>
            </div>
          </div>
          {data.haulItems > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-700 text-sm text-gray-400">
              Card Show: {data.haulItems} purchases · ${data.haulSpent.toFixed(2)} spent
            </div>
          )}
          {data.rookieInvestments > 0 && (
            <div className="mt-1 text-sm text-gray-400">
              Rookie Tracker: {data.rookieInvestments} investments · ${data.rookieInvested.toFixed(2)} invested
            </div>
          )}
        </div>
      )}

      {/* Recommendations */}
      <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-5">
        <h3 className="font-bold text-white mb-3">Recommendations</h3>
        <div className="space-y-3">
          {!hasActivity && (
            <div className="text-sm text-gray-400">
              Start exploring CardVault to build your collector profile! Open a pack, start a streak, or add cards to your binder.
            </div>
          )}
          {data.streak === 0 && (
            <Link href="/streak" className="flex items-center gap-3 p-3 bg-gray-800/60 border border-gray-700/30 rounded-lg hover:border-blue-600 transition-all">
              <span className="text-xl">🔥</span>
              <div><div className="text-sm font-medium text-white">Start a Daily Streak</div><div className="text-xs text-gray-500">Visit daily to build your streak</div></div>
            </Link>
          )}
          {data.packHistory === 0 && (
            <Link href="/tools/pack-sim" className="flex items-center gap-3 p-3 bg-gray-800/60 border border-gray-700/30 rounded-lg hover:border-blue-600 transition-all">
              <span className="text-xl">🎰</span>
              <div><div className="text-sm font-medium text-white">Open Your First Pack</div><div className="text-xs text-gray-500">Try the pack simulator</div></div>
            </Link>
          )}
          {data.vaultCards === 0 && (
            <Link href="/vault" className="flex items-center gap-3 p-3 bg-gray-800/60 border border-gray-700/30 rounded-lg hover:border-blue-600 transition-all">
              <span className="text-xl">🔒</span>
              <div><div className="text-sm font-medium text-white">Start Your Vault</div><div className="text-xs text-gray-500">Collect and manage your digital cards</div></div>
            </Link>
          )}
          {data.rookieInvestments === 0 && (
            <Link href="/rookie-tracker" className="flex items-center gap-3 p-3 bg-gray-800/60 border border-gray-700/30 rounded-lg hover:border-blue-600 transition-all">
              <span className="text-xl">📈</span>
              <div><div className="text-sm font-medium text-white">Track Rookie Investments</div><div className="text-xs text-gray-500">Log and monitor your card investments</div></div>
            </Link>
          )}
          {data.achievementCount < 5 && (
            <Link href="/achievements" className="flex items-center gap-3 p-3 bg-gray-800/60 border border-gray-700/30 rounded-lg hover:border-blue-600 transition-all">
              <span className="text-xl">🏅</span>
              <div><div className="text-sm font-medium text-white">Unlock More Achievements</div><div className="text-xs text-gray-500">{data.achievementCount}/{data.totalAchievements} unlocked — explore more features</div></div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
