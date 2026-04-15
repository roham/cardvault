'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

type Sport = 'baseball' | 'basketball' | 'football' | 'hockey';
type BinKey = string;

interface CollectionItem {
  slug: string;
  sport: Sport;
  year: number;
  estimatedValue: number;
  player: string;
  name: string;
}

function parseEstValue(raw: string): number {
  const m = raw.match(/\$([0-9,]+)/);
  if (!m) return 0;
  return parseInt(m[1].replace(/,/g, ''), 10);
}

const DECADES = ['Pre-1970', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'];
const SPORTS: Sport[] = ['baseball', 'basketball', 'football', 'hockey'];
const VALUE_TIERS = ['<$5', '$5-$24', '$25-$99', '$100-$499', '$500+'];

function getDecade(year: number): string {
  if (year < 1970) return 'Pre-1970';
  if (year < 1980) return '1970s';
  if (year < 1990) return '1980s';
  if (year < 2000) return '1990s';
  if (year < 2010) return '2000s';
  if (year < 2020) return '2010s';
  return '2020s';
}

function getValueTier(val: number): string {
  if (val < 5) return '<$5';
  if (val < 25) return '$5-$24';
  if (val < 100) return '$25-$99';
  if (val < 500) return '$100-$499';
  return '$500+';
}

function getCellColor(count: number, max: number): string {
  if (count === 0) return 'bg-gray-900';
  const intensity = count / Math.max(max, 1);
  if (intensity > 0.7) return 'bg-emerald-500';
  if (intensity > 0.4) return 'bg-emerald-600';
  if (intensity > 0.2) return 'bg-emerald-700';
  if (intensity > 0.1) return 'bg-emerald-800';
  return 'bg-emerald-900';
}

export default function CollectionHeatmap() {
  const [source, setSource] = useState<'all' | 'binder' | 'vault'>('all');
  const [heatmapType, setHeatmapType] = useState<'sport-decade' | 'sport-value' | 'decade-value'>('sport-decade');
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const collection = useMemo<CollectionItem[]>(() => {
    if (source === 'all') {
      return sportsCards.map(c => ({
        slug: c.slug,
        sport: c.sport,
        year: c.year,
        estimatedValue: parseEstValue(c.estimatedValueRaw),
        player: c.player,
        name: c.name,
      }));
    }

    if (!mounted) return [];

    try {
      if (source === 'binder') {
        const data = localStorage.getItem('cardvault_binder');
        if (!data) return [];
        const binder = JSON.parse(data);
        const slugs = new Set([
          ...(binder.collected || []),
          ...(binder.want || []),
          ...(binder.trade || []),
        ]);
        return sportsCards
          .filter(c => slugs.has(c.slug))
          .map(c => ({
            slug: c.slug,
            sport: c.sport,
            year: c.year,
            estimatedValue: parseEstValue(c.estimatedValueRaw),
            player: c.player,
            name: c.name,
          }));
      }
      if (source === 'vault') {
        const data = localStorage.getItem('cardvault_vault_cards');
        if (!data) return [];
        const vCards = JSON.parse(data);
        return vCards.map((vc: { slug: string; sport: Sport; year: number; name: string; player: string; estimatedValue: number }) => ({
          slug: vc.slug,
          sport: vc.sport || 'baseball',
          year: vc.year || 2024,
          estimatedValue: vc.estimatedValue || 0,
          player: vc.player || 'Unknown',
          name: vc.name || 'Unknown Card',
        }));
      }
    } catch {
      return [];
    }
    return [];
  }, [source, mounted]);

  const heatmapData = useMemo(() => {
    const grid: Record<BinKey, CollectionItem[]> = {};

    let rows: string[] = [];
    let cols: string[] = [];

    if (heatmapType === 'sport-decade') {
      rows = SPORTS;
      cols = DECADES;
      for (const item of collection) {
        const key = `${item.sport}|${getDecade(item.year)}`;
        (grid[key] ??= []).push(item);
      }
    } else if (heatmapType === 'sport-value') {
      rows = SPORTS;
      cols = VALUE_TIERS;
      for (const item of collection) {
        const key = `${item.sport}|${getValueTier(item.estimatedValue)}`;
        (grid[key] ??= []).push(item);
      }
    } else {
      rows = DECADES;
      cols = VALUE_TIERS;
      for (const item of collection) {
        const key = `${getDecade(item.year)}|${getValueTier(item.estimatedValue)}`;
        (grid[key] ??= []).push(item);
      }
    }

    let maxCount = 0;
    for (const r of rows) {
      for (const c of cols) {
        const count = (grid[`${r}|${c}`] || []).length;
        if (count > maxCount) maxCount = count;
      }
    }

    return { grid, rows, cols, maxCount };
  }, [collection, heatmapType]);

  const stats = useMemo(() => {
    const totalValue = collection.reduce((s, c) => s + c.estimatedValue, 0);
    const sportCounts = new Map<string, number>();
    const decadeCounts = new Map<string, number>();
    const uniquePlayers = new Set(collection.map(c => c.player));

    for (const c of collection) {
      sportCounts.set(c.sport, (sportCounts.get(c.sport) || 0) + 1);
      decadeCounts.set(getDecade(c.year), (decadeCounts.get(getDecade(c.year)) || 0) + 1);
    }

    const topSport = [...sportCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || 'none';
    const topDecade = [...decadeCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || 'none';

    // Diversity score: how evenly spread across sports and decades
    const sportEntropy = SPORTS.reduce((s, sp) => {
      const p = (sportCounts.get(sp) || 0) / Math.max(collection.length, 1);
      return p > 0 ? s - p * Math.log2(p) : s;
    }, 0);
    const maxSportEntropy = Math.log2(4);
    const diversityScore = collection.length > 0 ? Math.round((sportEntropy / maxSportEntropy) * 100) : 0;

    return { totalCards: collection.length, totalValue, uniquePlayers: uniquePlayers.size, topSport, topDecade, diversityScore };
  }, [collection]);

  const gaps = useMemo(() => {
    const sportCounts = new Map<string, number>();
    const decadeCounts = new Map<string, number>();
    for (const c of collection) {
      sportCounts.set(c.sport, (sportCounts.get(c.sport) || 0) + 1);
      decadeCounts.set(getDecade(c.year), (decadeCounts.get(getDecade(c.year)) || 0) + 1);
    }

    const suggestions: string[] = [];
    const minSport = [...sportCounts.entries()].sort((a, b) => a[1] - b[1])[0];
    if (minSport && collection.length > 10) {
      suggestions.push(`Add more ${minSport[0]} cards — only ${minSport[1]} in your collection`);
    }

    for (const d of DECADES) {
      if (!decadeCounts.has(d) && collection.length > 20) {
        suggestions.push(`No ${d} cards — explore vintage or modern eras`);
      }
    }

    if (stats.diversityScore < 50 && collection.length > 10) {
      suggestions.push('Low diversity — try collecting across more sports for a balanced portfolio');
    }

    return suggestions.slice(0, 4);
  }, [collection, stats.diversityScore]);

  return (
    <div className="space-y-8">
      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-gray-900 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-white">{stats.totalCards.toLocaleString()}</div>
          <div className="text-xs text-gray-400">Total Cards</div>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400">${stats.totalValue.toLocaleString()}</div>
          <div className="text-xs text-gray-400">Total Value</div>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{stats.uniquePlayers.toLocaleString()}</div>
          <div className="text-xs text-gray-400">Players</div>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-amber-400 capitalize">{stats.topSport}</div>
          <div className="text-xs text-gray-400">Top Sport</div>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">{stats.topDecade}</div>
          <div className="text-xs text-gray-400">Top Era</div>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 text-center">
          <div className={`text-2xl font-bold ${stats.diversityScore >= 70 ? 'text-emerald-400' : stats.diversityScore >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
            {stats.diversityScore}%
          </div>
          <div className="text-xs text-gray-400">Diversity</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4">
        <div className="flex gap-2">
          <span className="text-sm text-gray-400 self-center">Source:</span>
          {[
            { value: 'all', label: 'All Cards' },
            { value: 'binder', label: 'My Binder' },
            { value: 'vault', label: 'My Vault' },
          ].map(s => (
            <button
              key={s.value}
              onClick={() => setSource(s.value as 'all' | 'binder' | 'vault')}
              className={`px-3 py-1.5 rounded text-sm ${source === s.value ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
            >{s.label}</button>
          ))}
        </div>
        <div className="flex gap-2">
          <span className="text-sm text-gray-400 self-center">View:</span>
          {[
            { value: 'sport-decade', label: 'Sport x Era' },
            { value: 'sport-value', label: 'Sport x Value' },
            { value: 'decade-value', label: 'Era x Value' },
          ].map(v => (
            <button
              key={v.value}
              onClick={() => setHeatmapType(v.value as typeof heatmapType)}
              className={`px-3 py-1.5 rounded text-sm ${heatmapType === v.value ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
            >{v.label}</button>
          ))}
        </div>
      </div>

      {/* Heatmap grid */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6 overflow-x-auto">
        <h2 className="text-lg font-semibold text-white mb-4">Collection Heatmap</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left text-xs text-gray-500 pb-2 pr-3" />
              {heatmapData.cols.map(col => (
                <th key={col} className="text-center text-xs text-gray-400 pb-2 px-1">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {heatmapData.rows.map(row => (
              <tr key={row}>
                <td className="text-xs text-gray-400 pr-3 py-1 capitalize whitespace-nowrap">{row}</td>
                {heatmapData.cols.map(col => {
                  const items = heatmapData.grid[`${row}|${col}`] || [];
                  const count = items.length;
                  return (
                    <td key={col} className="px-1 py-1">
                      <div
                        className={`${getCellColor(count, heatmapData.maxCount)} rounded h-10 sm:h-12 flex items-center justify-center text-xs font-medium transition-colors cursor-default ${count > 0 ? 'text-white' : 'text-gray-700'}`}
                        title={`${row} / ${col}: ${count} cards`}
                      >
                        {count > 0 ? count : ''}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-4 text-xs text-gray-400">
          <span>Less</span>
          <div className="w-4 h-4 bg-gray-900 rounded" />
          <div className="w-4 h-4 bg-emerald-900 rounded" />
          <div className="w-4 h-4 bg-emerald-800 rounded" />
          <div className="w-4 h-4 bg-emerald-700 rounded" />
          <div className="w-4 h-4 bg-emerald-600 rounded" />
          <div className="w-4 h-4 bg-emerald-500 rounded" />
          <span>More</span>
        </div>
      </div>

      {/* Diversity meter */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-3">Collection Diversity Score</h2>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="w-full bg-gray-800 rounded-full h-4">
              <div
                className={`h-4 rounded-full transition-all ${stats.diversityScore >= 70 ? 'bg-emerald-500' : stats.diversityScore >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${stats.diversityScore}%` }}
              />
            </div>
          </div>
          <span className={`text-lg font-bold ${stats.diversityScore >= 70 ? 'text-emerald-400' : stats.diversityScore >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
            {stats.diversityScore}%
          </span>
        </div>
        <p className="text-sm text-gray-400 mt-2">
          {stats.diversityScore >= 70
            ? 'Excellent diversity — your collection spans sports and eras well.'
            : stats.diversityScore >= 40
              ? 'Decent spread — but some gaps remain. Try exploring underrepresented areas.'
              : 'Heavily concentrated — consider diversifying across sports for a more resilient collection.'}
        </p>
      </div>

      {/* Gap suggestions */}
      {gaps.length > 0 && (
        <div className="bg-amber-950/30 border border-amber-800/50 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-amber-400 mb-3">Collection Gaps</h2>
          <div className="space-y-2">
            {gaps.map((g, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                <span className="text-amber-400">!</span>
                {g}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related links */}
      <div className="flex flex-wrap gap-3">
        {[
          { href: '/binder', label: 'My Binder', icon: '📖' },
          { href: '/vault', label: 'My Vault', icon: '🏦' },
          { href: '/tools/collection-value', label: 'Collection Value', icon: '💎' },
          { href: '/tools/investment-calc', label: 'Investment Calc', icon: '📊' },
          { href: '/tools/budget-planner', label: 'Budget Planner', icon: '💰' },
          { href: '/showcase', label: 'Trophy Case', icon: '🏆' },
        ].map(t => (
          <Link key={t.href} href={t.href} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition-colors">
            <span>{t.icon}</span> {t.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
