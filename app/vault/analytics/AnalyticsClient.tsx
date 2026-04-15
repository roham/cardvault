'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { sportsCards, type SportsCard } from '@/data/sports-cards';
import {
  getWallet,
  getVaultCards,
  getTransactions,
  type VaultCard,
  type MockWallet,
  type Transaction,
} from '@/lib/vault';

function parseValue(v: string): number {
  const m = v.match(/\$([\d,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
}

function formatCurrency(n: number): string {
  return '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function formatPct(n: number): string {
  return (n >= 0 ? '+' : '') + n.toFixed(1) + '%';
}

interface EnrichedVaultCard {
  vault: VaultCard;
  card: SportsCard;
  value: number;
}

type AnalyticsTab = 'overview' | 'allocation' | 'performance' | 'history';

// Simple bar component
function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${Math.max(pct, 1)}%` }} />
    </div>
  );
}

// Ring chart (SVG donut)
function DonutChart({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  let cumulative = 0;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col items-center gap-4">
      <svg viewBox="0 0 100 100" className="w-40 h-40 -rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#1f2937" strokeWidth="16" />
        {segments.map((seg, i) => {
          const pct = seg.value / total;
          const offset = cumulative;
          cumulative += pct;
          return (
            <circle
              key={i}
              cx="50" cy="50" r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth="16"
              strokeDasharray={`${pct * circumference} ${circumference}`}
              strokeDashoffset={-offset * circumference}
              className="transition-all duration-700"
            />
          );
        })}
      </svg>
      <div className="flex flex-wrap gap-3 justify-center">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
            <span className="text-gray-400">{seg.label}</span>
            <span className="text-white font-medium">{Math.round((seg.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Mini sparkline bar chart
function MiniBarChart({ data, maxBars }: { data: { label: string; value: number }[]; maxBars?: number }) {
  const items = maxBars ? data.slice(0, maxBars) : data;
  const maxVal = Math.max(...items.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 h-24">
      {items.map((d, i) => (
        <div key={i} className="flex flex-col items-center flex-1 gap-1">
          <div
            className="w-full bg-emerald-600 rounded-t transition-all duration-500 min-h-[2px]"
            style={{ height: `${(d.value / maxVal) * 80}px` }}
          />
          <span className="text-[9px] text-gray-500 truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsClient() {
  const [mounted, setMounted] = useState(false);
  const [wallet, setWallet] = useState<MockWallet | null>(null);
  const [vaultCards, setVaultCards] = useState<VaultCard[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tab, setTab] = useState<AnalyticsTab>('overview');

  useEffect(() => {
    setMounted(true);
    setWallet(getWallet());
    setVaultCards(getVaultCards());
    setTransactions(getTransactions());
  }, []);

  const enriched = useMemo(() => {
    const cardMap = new Map(sportsCards.map(c => [c.slug, c]));
    return vaultCards
      .map(vc => {
        const card = cardMap.get(vc.slug);
        if (!card) return null;
        return { vault: vc, card, value: parseValue(card.estimatedValueRaw) } as EnrichedVaultCard;
      })
      .filter((c): c is EnrichedVaultCard => c !== null);
  }, [vaultCards]);

  // ── Computed Analytics ──────────────────────────────────────────
  const analytics = useMemo(() => {
    const totalValue = enriched.reduce((s, e) => s + e.value, 0);
    const totalPaid = enriched.reduce((s, e) => s + e.vault.pricePaid, 0);
    const pnl = totalValue - totalPaid;
    const roi = totalPaid > 0 ? ((totalValue - totalPaid) / totalPaid) * 100 : 0;

    // Sport allocation
    const bySport: Record<string, { count: number; value: number }> = {};
    enriched.forEach(e => {
      const s = e.card.sport;
      if (!bySport[s]) bySport[s] = { count: 0, value: 0 };
      bySport[s].count++;
      bySport[s].value += e.value;
    });

    // Rarity distribution
    const rarityBuckets = [
      { label: 'Legendary ($5,000+)', min: 5000, color: 'bg-yellow-500', hex: '#eab308' },
      { label: 'Ultra Rare ($1,000–$4,999)', min: 1000, color: 'bg-red-500', hex: '#ef4444' },
      { label: 'Rare ($200–$999)', min: 200, color: 'bg-purple-500', hex: '#a855f7' },
      { label: 'Uncommon ($50–$199)', min: 50, color: 'bg-blue-500', hex: '#3b82f6' },
      { label: 'Common (under $50)', min: 0, color: 'bg-gray-500', hex: '#6b7280' },
    ];
    const byRarity = rarityBuckets.map(b => ({
      ...b,
      count: enriched.filter(e => {
        if (b.min === 5000) return e.value >= 5000;
        if (b.min === 1000) return e.value >= 1000 && e.value < 5000;
        if (b.min === 200) return e.value >= 200 && e.value < 1000;
        if (b.min === 50) return e.value >= 50 && e.value < 200;
        return e.value < 50;
      }).length,
      value: enriched.filter(e => {
        if (b.min === 5000) return e.value >= 5000;
        if (b.min === 1000) return e.value >= 1000 && e.value < 5000;
        if (b.min === 200) return e.value >= 200 && e.value < 1000;
        if (b.min === 50) return e.value >= 50 && e.value < 200;
        return e.value < 50;
      }).reduce((s, e) => s + e.value, 0),
    }));

    // Era breakdown
    const eras = [
      { label: 'Pre-War (before 1945)', test: (y: number) => y < 1945, color: '#92400e' },
      { label: 'Vintage (1945–1974)', test: (y: number) => y >= 1945 && y < 1975, color: '#b45309' },
      { label: 'Junk Wax (1975–1994)', test: (y: number) => y >= 1975 && y < 1995, color: '#ca8a04' },
      { label: 'Modern (1995–2014)', test: (y: number) => y >= 1995 && y < 2015, color: '#16a34a' },
      { label: 'Ultra-Modern (2015+)', test: (y: number) => y >= 2015, color: '#0ea5e9' },
    ];
    const byEra = eras.map(era => ({
      ...era,
      count: enriched.filter(e => era.test(e.card.year)).length,
      value: enriched.filter(e => era.test(e.card.year)).reduce((s, e) => s + e.value, 0),
    }));

    // Decade breakdown for bar chart
    const decades: Record<string, number> = {};
    enriched.forEach(e => {
      const d = Math.floor(e.card.year / 10) * 10;
      const label = `${d}s`;
      decades[label] = (decades[label] || 0) + 1;
    });
    const decadeData = Object.entries(decades)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([label, value]) => ({ label, value }));

    // Top holdings
    const topCards = [...enriched].sort((a, b) => b.value - a.value).slice(0, 10);

    // Rookie count and value
    const rookies = enriched.filter(e => e.card.rookie);
    const rookieCount = rookies.length;
    const rookieValue = rookies.reduce((s, e) => s + e.value, 0);

    // Pack ROI analysis
    const packPerformance: Record<string, { spent: number; value: number; cards: number }> = {};
    enriched.forEach(e => {
      const source = e.vault.acquiredFrom;
      if (!packPerformance[source]) packPerformance[source] = { spent: 0, value: 0, cards: 0 };
      packPerformance[source].spent += e.vault.pricePaid;
      packPerformance[source].value += e.value;
      packPerformance[source].cards++;
    });

    // Monthly acquisition timeline
    const monthly: Record<string, number> = {};
    enriched.forEach(e => {
      const d = new Date(e.vault.acquiredAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthly[key] = (monthly[key] || 0) + 1;
    });
    const monthlyData = Object.entries(monthly)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([label, value]) => ({ label: label.slice(5), value }));

    // Daily acquisition (last 14 days)
    const daily: Record<string, number> = {};
    enriched.forEach(e => {
      const d = new Date(e.vault.acquiredAt);
      const key = `${d.getMonth() + 1}/${d.getDate()}`;
      daily[key] = (daily[key] || 0) + 1;
    });
    const dailyData = Object.entries(daily)
      .slice(-14)
      .map(([label, value]) => ({ label, value }));

    // Average card value
    const avgValue = enriched.length > 0 ? totalValue / enriched.length : 0;

    // Unique players
    const uniquePlayers = new Set(enriched.map(e => e.card.player)).size;

    // Most collected player
    const playerCounts: Record<string, number> = {};
    enriched.forEach(e => {
      playerCounts[e.card.player] = (playerCounts[e.card.player] || 0) + 1;
    });
    const topPlayer = Object.entries(playerCounts).sort(([, a], [, b]) => b - a)[0];

    return {
      totalValue, totalPaid, pnl, roi,
      bySport, byRarity, byEra, decadeData,
      topCards, rookieCount, rookieValue,
      packPerformance, monthlyData, dailyData,
      avgValue, uniquePlayers, topPlayer,
      totalCards: enriched.length,
    };
  }, [enriched]);

  // Sport colors
  const sportColors: Record<string, string> = {
    baseball: '#ef4444',
    basketball: '#f97316',
    football: '#3b82f6',
    hockey: '#06b6d4',
  };

  if (!mounted) {
    return <div className="text-center py-20 text-gray-500">Loading analytics...</div>;
  }

  if (enriched.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-900/50 border border-gray-800 rounded-2xl">
        <p className="text-4xl mb-3">📊</p>
        <p className="text-gray-400 text-lg mb-2">No cards in your vault yet</p>
        <p className="text-gray-500 text-sm mb-6">Open packs to start building your collection, then come back here for detailed analytics.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/packs" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-medium transition-colors">
            Open Pack Store
          </Link>
          <Link href="/vault" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-6 py-3 rounded-xl font-medium transition-colors">
            Back to Vault
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Tab navigation */}
      <div className="flex gap-2 border-b border-gray-800 pb-1 overflow-x-auto">
        {([
          { key: 'overview' as const, label: 'Overview' },
          { key: 'allocation' as const, label: 'Allocation' },
          { key: 'performance' as const, label: 'Performance' },
          { key: 'history' as const, label: 'Timeline' },
        ]).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${tab === t.key ? 'bg-gray-800 text-white border-b-2 border-emerald-500' : 'text-gray-500 hover:text-gray-300'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══ OVERVIEW TAB ═══ */}
      {tab === 'overview' && (
        <div className="space-y-6">
          {/* Key metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Portfolio Value</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(analytics.totalValue)}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total ROI</p>
              <p className={`text-2xl font-bold ${analytics.roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {formatPct(analytics.roi)}
              </p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Avg Card Value</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(analytics.avgValue)}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Wallet Balance</p>
              <p className="text-2xl font-bold text-emerald-400">{formatCurrency(wallet?.balance || 0)}</p>
            </div>
          </div>

          {/* Secondary metrics */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {[
              { label: 'Cards', value: analytics.totalCards.toString() },
              { label: 'Players', value: analytics.uniquePlayers.toString() },
              { label: 'Rookies', value: analytics.rookieCount.toString() },
              { label: 'Rookie Value', value: formatCurrency(analytics.rookieValue) },
              { label: 'Total Spent', value: formatCurrency(analytics.totalPaid) },
              { label: 'Net P&L', value: formatCurrency(analytics.pnl) },
            ].map(m => (
              <div key={m.label} className="bg-gray-900/50 border border-gray-800/50 rounded-lg p-3 text-center">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">{m.label}</p>
                <p className="text-white font-semibold text-sm">{m.value}</p>
              </div>
            ))}
          </div>

          {/* Sport donut + Top holdings side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sport allocation donut */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-4">Sport Allocation (by Value)</h3>
              <DonutChart
                segments={Object.entries(analytics.bySport).map(([sport, data]) => ({
                  label: sport.charAt(0).toUpperCase() + sport.slice(1),
                  value: data.value,
                  color: sportColors[sport] || '#6b7280',
                }))}
              />
            </div>

            {/* Top 5 holdings */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-4">Top Holdings</h3>
              <div className="space-y-3">
                {analytics.topCards.slice(0, 5).map((e, i) => (
                  <div key={e.card.slug} className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 font-mono w-5">#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <Link href={`/sports/${e.card.slug}`} className="text-white text-sm font-medium hover:text-emerald-400 transition-colors truncate block">
                        {e.card.name}
                      </Link>
                      <p className="text-gray-500 text-xs truncate">{e.card.player} &middot; {e.card.year}</p>
                    </div>
                    <span className="text-emerald-400 font-bold text-sm whitespace-nowrap">{e.card.estimatedValueRaw}</span>
                  </div>
                ))}
              </div>
              {analytics.topCards.length === 0 && (
                <p className="text-gray-500 text-sm">No cards yet</p>
              )}
            </div>
          </div>

          {/* Most collected player */}
          {analytics.topPlayer && (
            <div className="bg-gradient-to-r from-emerald-950/40 to-gray-900 border border-emerald-900/30 rounded-xl p-5">
              <p className="text-xs text-emerald-500 uppercase tracking-wider mb-1">Most Collected Player</p>
              <p className="text-white font-bold text-lg">{analytics.topPlayer[0]}</p>
              <p className="text-gray-400 text-sm">{analytics.topPlayer[1]} card{analytics.topPlayer[1] !== 1 ? 's' : ''} in your vault</p>
            </div>
          )}
        </div>
      )}

      {/* ═══ ALLOCATION TAB ═══ */}
      {tab === 'allocation' && (
        <div className="space-y-6">
          {/* Sport breakdown */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4">By Sport</h3>
            <div className="space-y-4">
              {Object.entries(analytics.bySport)
                .sort(([, a], [, b]) => b.value - a.value)
                .map(([sport, data]) => {
                  const pct = analytics.totalValue > 0 ? (data.value / analytics.totalValue) * 100 : 0;
                  return (
                    <div key={sport}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-300 capitalize">{sport}</span>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-gray-500">{data.count} cards</span>
                          <span className="text-white font-medium">{formatCurrency(data.value)}</span>
                          <span className="text-gray-400 w-12 text-right">{pct.toFixed(0)}%</span>
                        </div>
                      </div>
                      <Bar pct={pct} color="bg-emerald-600" />
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Rarity distribution */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4">Rarity Distribution</h3>
            <div className="space-y-3">
              {analytics.byRarity.map(r => {
                const pct = analytics.totalCards > 0 ? (r.count / analytics.totalCards) * 100 : 0;
                return (
                  <div key={r.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-300">{r.label}</span>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-gray-500">{r.count}</span>
                        <span className="text-white font-medium w-20 text-right">{formatCurrency(r.value)}</span>
                      </div>
                    </div>
                    <Bar pct={pct} color={r.color} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Era breakdown */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4">By Era</h3>
            <div className="space-y-3">
              {analytics.byEra.filter(e => e.count > 0).map(era => {
                const pct = analytics.totalCards > 0 ? (era.count / analytics.totalCards) * 100 : 0;
                return (
                  <div key={era.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-300">{era.label}</span>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-gray-500">{era.count} cards</span>
                        <span className="text-white font-medium w-20 text-right">{formatCurrency(era.value)}</span>
                        <span className="text-gray-400 w-10 text-right">{pct.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.max(pct, 1)}%`, backgroundColor: era.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Decade bar chart */}
          {analytics.decadeData.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-4">Cards by Decade</h3>
              <MiniBarChart data={analytics.decadeData} />
            </div>
          )}
        </div>
      )}

      {/* ═══ PERFORMANCE TAB ═══ */}
      {tab === 'performance' && (
        <div className="space-y-6">
          {/* P&L summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Total Invested</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(analytics.totalPaid)}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Current Value</p>
              <p className="text-2xl font-bold text-emerald-400">{formatCurrency(analytics.totalValue)}</p>
            </div>
            <div className={`bg-gray-900 border rounded-xl p-5 text-center ${analytics.pnl >= 0 ? 'border-emerald-800/50' : 'border-red-800/50'}`}>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Net Profit / Loss</p>
              <p className={`text-2xl font-bold ${analytics.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {analytics.pnl >= 0 ? '+' : ''}{formatCurrency(analytics.pnl)}
              </p>
              <p className={`text-sm mt-1 ${analytics.roi >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {formatPct(analytics.roi)} ROI
              </p>
            </div>
          </div>

          {/* Acquisition source ROI */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4">Returns by Source</h3>
            <div className="space-y-3">
              {Object.entries(analytics.packPerformance)
                .sort(([, a], [, b]) => (b.value - b.spent) - (a.value - a.spent))
                .map(([source, data]) => {
                  const sourceRoi = data.spent > 0 ? ((data.value - data.spent) / data.spent) * 100 : 0;
                  const sourcePnl = data.value - data.spent;
                  return (
                    <div key={source} className="flex items-center justify-between bg-gray-800/50 rounded-lg px-4 py-3">
                      <div>
                        <p className="text-white text-sm font-medium capitalize">{source}</p>
                        <p className="text-gray-500 text-xs">{data.cards} card{data.cards !== 1 ? 's' : ''} &middot; Spent {formatCurrency(data.spent)}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-sm ${sourcePnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {sourcePnl >= 0 ? '+' : ''}{formatCurrency(sourcePnl)}
                        </p>
                        <p className={`text-xs ${sourceRoi >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {formatPct(sourceRoi)}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Top gainers & losers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top gainers */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-emerald-400 font-semibold mb-4">Best Performers</h3>
              <div className="space-y-2">
                {[...enriched]
                  .map(e => ({ ...e, gain: e.value - e.vault.pricePaid }))
                  .sort((a, b) => b.gain - a.gain)
                  .slice(0, 5)
                  .map((e, i) => (
                    <div key={e.card.slug + i} className="flex items-center justify-between">
                      <Link href={`/sports/${e.card.slug}`} className="text-white text-sm hover:text-emerald-400 transition-colors truncate flex-1 mr-3">
                        {e.card.player}
                      </Link>
                      <span className="text-emerald-400 text-sm font-medium whitespace-nowrap">+{formatCurrency(e.gain)}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Worst performers */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-red-400 font-semibold mb-4">Underperformers</h3>
              <div className="space-y-2">
                {[...enriched]
                  .map(e => ({ ...e, gain: e.value - e.vault.pricePaid }))
                  .sort((a, b) => a.gain - b.gain)
                  .slice(0, 5)
                  .map((e, i) => (
                    <div key={e.card.slug + i} className="flex items-center justify-between">
                      <Link href={`/sports/${e.card.slug}`} className="text-white text-sm hover:text-red-400 transition-colors truncate flex-1 mr-3">
                        {e.card.player}
                      </Link>
                      <span className={`text-sm font-medium whitespace-nowrap ${e.gain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {e.gain >= 0 ? '+' : ''}{formatCurrency(e.gain)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ TIMELINE TAB ═══ */}
      {tab === 'history' && (
        <div className="space-y-6">
          {/* Acquisition timeline */}
          {analytics.monthlyData.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-4">Monthly Acquisitions</h3>
              <MiniBarChart data={analytics.monthlyData} />
            </div>
          )}

          {analytics.dailyData.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-4">Recent Activity (Last 14 Days)</h3>
              <MiniBarChart data={analytics.dailyData} maxBars={14} />
            </div>
          )}

          {/* Transaction feed */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4">Recent Transactions</h3>
            <div className="space-y-2">
              {transactions.length === 0 ? (
                <p className="text-gray-500 text-sm">No transactions yet</p>
              ) : (
                transactions.slice(0, 20).map(tx => (
                  <div key={tx.id} className="flex items-center justify-between border-b border-gray-800/50 pb-2 last:border-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 ${
                        tx.amount > 0 ? 'bg-emerald-950/60 text-emerald-400' : 'bg-red-950/60 text-red-400'
                      }`}>
                        {tx.type === 'purchase' ? '📦' : tx.type === 'buyback' ? '💰' : tx.type === 'starter-bonus' ? '🎁' : '💳'}
                      </span>
                      <div className="min-w-0">
                        <p className="text-white text-sm truncate">{tx.description}</p>
                        <p className="text-gray-600 text-xs">{new Date(tx.timestamp).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className={`font-bold text-sm whitespace-nowrap ml-3 ${tx.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-800">
        <Link href="/vault" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-5 py-2.5 rounded-xl text-sm font-medium border border-gray-700 transition-colors">
          Back to Vault
        </Link>
        <Link href="/packs" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
          Open Packs
        </Link>
        <Link href="/collection-insights" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-5 py-2.5 rounded-xl text-sm font-medium border border-gray-700 transition-colors">
          Collection Insights
        </Link>
        <Link href="/tools/collection-value" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-5 py-2.5 rounded-xl text-sm font-medium border border-gray-700 transition-colors">
          Value Calculator
        </Link>
      </div>
    </div>
  );
}
