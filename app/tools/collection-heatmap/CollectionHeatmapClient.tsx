'use client';

import { useState, useMemo } from 'react';
import { sportsCards } from '@/data/sports-cards';

type ViewMode = 'sport-decade' | 'sport-value' | 'decade-value' | 'rookie-sport';
type Metric = 'count' | 'value';

function parseValue(val: string): number {
  const m = val.match(/\$([0-9,.]+)/);
  return m ? parseFloat(m[1].replace(',', '')) : 5;
}

const SPORTS = ['baseball', 'basketball', 'football', 'hockey'] as const;
const SPORT_LABELS: Record<string, string> = { baseball: 'Baseball', basketball: 'Basketball', football: 'Football', hockey: 'Hockey' };

const DECADES = ['Pre-1950', '1950s', '1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'];
function getDecade(year: number): string {
  if (year < 1950) return 'Pre-1950';
  const d = Math.floor(year / 10) * 10;
  return `${d}s`;
}

const VALUE_TIERS = ['Under $5', '$5-$24', '$25-$99', '$100-$499', '$500-$999', '$1,000+'];
function getValueTier(val: number): string {
  if (val < 5) return 'Under $5';
  if (val < 25) return '$5-$24';
  if (val < 100) return '$25-$99';
  if (val < 500) return '$100-$499';
  if (val < 1000) return '$500-$999';
  return '$1,000+';
}

const ROOKIE_LABELS = ['Rookies', 'Veterans'];

interface CellData {
  count: number;
  totalValue: number;
  avgValue: number;
  topPlayer: string;
  pct: number;
}

function getHeatColor(intensity: number): string {
  if (intensity === 0) return 'bg-gray-800/30';
  if (intensity < 0.1) return 'bg-blue-950/60';
  if (intensity < 0.2) return 'bg-blue-900/60';
  if (intensity < 0.3) return 'bg-teal-900/60';
  if (intensity < 0.4) return 'bg-teal-800/60';
  if (intensity < 0.5) return 'bg-emerald-900/60';
  if (intensity < 0.6) return 'bg-yellow-900/60';
  if (intensity < 0.7) return 'bg-amber-900/60';
  if (intensity < 0.8) return 'bg-orange-900/60';
  if (intensity < 0.9) return 'bg-red-900/60';
  return 'bg-red-800/60';
}

function getTextColor(intensity: number): string {
  if (intensity === 0) return 'text-gray-600';
  if (intensity < 0.3) return 'text-blue-300';
  if (intensity < 0.5) return 'text-teal-300';
  if (intensity < 0.7) return 'text-amber-300';
  return 'text-red-300';
}

function formatMoney(n: number): string {
  if (n >= 1000) return '$' + (n / 1000).toFixed(1) + 'K';
  return '$' + n.toFixed(0);
}

export default function CollectionHeatmapClient() {
  const [view, setView] = useState<ViewMode>('sport-decade');
  const [metric, setMetric] = useState<Metric>('count');
  const [hoveredCell, setHoveredCell] = useState<{ row: string; col: string; data: CellData } | null>(null);

  // Precompute card data
  const cardData = useMemo(() => {
    return sportsCards.map(c => ({
      sport: c.sport,
      year: c.year,
      decade: getDecade(c.year),
      value: parseValue(c.estimatedValueRaw),
      valueTier: getValueTier(parseValue(c.estimatedValueRaw)),
      rookie: c.rookie,
      player: c.player,
    }));
  }, []);

  const totalCards = cardData.length;

  // Build heatmap grid data
  const { rows, cols, grid, maxVal } = useMemo(() => {
    let rowLabels: string[];
    let colLabels: string[];
    let getRowKey: (c: typeof cardData[0]) => string;
    let getColKey: (c: typeof cardData[0]) => string;

    switch (view) {
      case 'sport-decade':
        rowLabels = SPORTS.map(s => SPORT_LABELS[s]);
        colLabels = DECADES;
        getRowKey = c => SPORT_LABELS[c.sport] || c.sport;
        getColKey = c => c.decade;
        break;
      case 'sport-value':
        rowLabels = SPORTS.map(s => SPORT_LABELS[s]);
        colLabels = VALUE_TIERS;
        getRowKey = c => SPORT_LABELS[c.sport] || c.sport;
        getColKey = c => c.valueTier;
        break;
      case 'decade-value':
        rowLabels = DECADES;
        colLabels = VALUE_TIERS;
        getRowKey = c => c.decade;
        getColKey = c => c.valueTier;
        break;
      case 'rookie-sport':
        rowLabels = ROOKIE_LABELS;
        colLabels = SPORTS.map(s => SPORT_LABELS[s]);
        getRowKey = c => c.rookie ? 'Rookies' : 'Veterans';
        getColKey = c => SPORT_LABELS[c.sport] || c.sport;
        break;
    }

    // Build grid
    const g: Record<string, Record<string, CellData>> = {};
    for (const r of rowLabels) {
      g[r] = {};
      for (const c of colLabels) {
        g[r][c] = { count: 0, totalValue: 0, avgValue: 0, topPlayer: '', pct: 0 };
      }
    }

    // Player tracking for top player
    const playerCounts: Record<string, Record<string, Record<string, number>>> = {};

    for (const card of cardData) {
      const rk = getRowKey(card);
      const ck = getColKey(card);
      if (!g[rk]?.[ck]) continue;
      g[rk][ck].count++;
      g[rk][ck].totalValue += card.value;

      if (!playerCounts[rk]) playerCounts[rk] = {};
      if (!playerCounts[rk][ck]) playerCounts[rk][ck] = {};
      playerCounts[rk][ck][card.player] = (playerCounts[rk][ck][card.player] || 0) + 1;
    }

    let mx = 0;
    for (const r of rowLabels) {
      for (const c of colLabels) {
        const cell = g[r][c];
        cell.avgValue = cell.count > 0 ? cell.totalValue / cell.count : 0;
        cell.pct = (cell.count / totalCards) * 100;
        // Find top player
        const pc = playerCounts[r]?.[c] || {};
        let topP = '';
        let topN = 0;
        for (const [pl, n] of Object.entries(pc)) {
          if (n > topN) { topP = pl; topN = n; }
        }
        cell.topPlayer = topP;

        const val = metric === 'count' ? cell.count : cell.totalValue;
        if (val > mx) mx = val;
      }
    }

    return { rows: rowLabels, cols: colLabels, grid: g, maxVal: mx };
  }, [view, metric, cardData, totalCards]);

  // Summary stats
  const summaryStats = useMemo(() => {
    const sportCounts: Record<string, number> = {};
    const decadeCounts: Record<string, number> = {};
    let totalVal = 0;
    let rookieCount = 0;

    for (const c of cardData) {
      const sLabel = SPORT_LABELS[c.sport] || c.sport;
      sportCounts[sLabel] = (sportCounts[sLabel] || 0) + 1;
      decadeCounts[c.decade] = (decadeCounts[c.decade] || 0) + 1;
      totalVal += c.value;
      if (c.rookie) rookieCount++;
    }

    const topSport = Object.entries(sportCounts).sort((a, b) => b[1] - a[1])[0];
    const topDecade = Object.entries(decadeCounts).sort((a, b) => b[1] - a[1])[0];

    return {
      totalCards,
      totalValue: totalVal,
      avgValue: totalVal / totalCards,
      rookiePct: (rookieCount / totalCards) * 100,
      topSport: topSport?.[0] || '',
      topDecade: topDecade?.[0] || '',
    };
  }, [cardData, totalCards]);

  return (
    <div>
      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-gray-800/60 border border-gray-700/50 rounded-lg p-3 text-center">
          <div className="text-violet-400 text-lg font-bold">{totalCards.toLocaleString()}</div>
          <div className="text-gray-500 text-xs">Total Cards</div>
        </div>
        <div className="bg-gray-800/60 border border-gray-700/50 rounded-lg p-3 text-center">
          <div className="text-white text-lg font-bold">{formatMoney(summaryStats.totalValue)}</div>
          <div className="text-gray-500 text-xs">Est. Total Value</div>
        </div>
        <div className="bg-gray-800/60 border border-gray-700/50 rounded-lg p-3 text-center">
          <div className="text-amber-400 text-lg font-bold">{summaryStats.topSport}</div>
          <div className="text-gray-500 text-xs">Most Cards</div>
        </div>
        <div className="bg-gray-800/60 border border-gray-700/50 rounded-lg p-3 text-center">
          <div className="text-emerald-400 text-lg font-bold">{summaryStats.rookiePct.toFixed(0)}%</div>
          <div className="text-gray-500 text-xs">Rookie Cards</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex gap-1 bg-gray-800/40 p-1 rounded-lg">
          {([
            { key: 'sport-decade', label: 'Sport x Decade' },
            { key: 'sport-value', label: 'Sport x Value' },
            { key: 'decade-value', label: 'Decade x Value' },
            { key: 'rookie-sport', label: 'Rookie/Vet' },
          ] as { key: ViewMode; label: string }[]).map(v => (
            <button
              key={v.key}
              onClick={() => { setView(v.key); setHoveredCell(null); }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                view === v.key ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-gray-800/40 p-1 rounded-lg">
          {(['count', 'value'] as Metric[]).map(m => (
            <button
              key={m}
              onClick={() => { setMetric(m); setHoveredCell(null); }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                metric === m ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              {m === 'count' ? 'Card Count' : 'Total Value'}
            </button>
          ))}
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4 overflow-x-auto mb-6">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left text-gray-500 text-xs p-2 w-24" />
              {cols.map(c => (
                <th key={c} className="text-center text-gray-400 text-xs p-2 font-medium whitespace-nowrap">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r}>
                <td className="text-left text-gray-400 text-xs p-2 font-medium whitespace-nowrap">{r}</td>
                {cols.map(c => {
                  const cell = grid[r]?.[c];
                  if (!cell) return <td key={c} className="p-1" />;
                  const val = metric === 'count' ? cell.count : cell.totalValue;
                  const intensity = maxVal > 0 ? val / maxVal : 0;
                  const isHovered = hoveredCell?.row === r && hoveredCell?.col === c;

                  return (
                    <td key={c} className="p-1">
                      <button
                        onMouseEnter={() => setHoveredCell({ row: r, col: c, data: cell })}
                        onMouseLeave={() => setHoveredCell(null)}
                        onClick={() => setHoveredCell(isHovered ? null : { row: r, col: c, data: cell })}
                        className={`w-full aspect-square rounded-md transition-all duration-200 flex items-center justify-center text-xs font-medium border ${
                          getHeatColor(intensity)
                        } ${getTextColor(intensity)} ${
                          isHovered ? 'border-violet-400 scale-110 z-10' : 'border-transparent'
                        }`}
                        style={{ minWidth: '48px', minHeight: '48px' }}
                      >
                        {metric === 'count'
                          ? (cell.count > 0 ? cell.count : '')
                          : (cell.totalValue > 0 ? formatMoney(cell.totalValue) : '')}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Color Legend */}
        <div className="flex items-center gap-2 mt-4 justify-center">
          <span className="text-gray-500 text-xs">Low</span>
          <div className="flex gap-0.5">
            {[0.05, 0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 0.95].map(i => (
              <div key={i} className={`w-6 h-3 rounded-sm ${getHeatColor(i)}`} />
            ))}
          </div>
          <span className="text-gray-500 text-xs">High</span>
        </div>
      </div>

      {/* Hover Detail Panel */}
      {hoveredCell && (
        <div className="bg-gray-800/80 border border-violet-700/50 rounded-xl p-4 mb-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-violet-400 font-bold text-sm">{hoveredCell.row}</span>
            <span className="text-gray-600">x</span>
            <span className="text-violet-400 font-bold text-sm">{hoveredCell.col}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            <div>
              <div className="text-gray-500">Cards</div>
              <div className="text-white font-bold">{hoveredCell.data.count.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-gray-500">Total Value</div>
              <div className="text-emerald-400 font-bold">{formatMoney(hoveredCell.data.totalValue)}</div>
            </div>
            <div>
              <div className="text-gray-500">Avg Value</div>
              <div className="text-white font-bold">{formatMoney(hoveredCell.data.avgValue)}</div>
            </div>
            <div>
              <div className="text-gray-500">% of DB</div>
              <div className="text-amber-400 font-bold">{hoveredCell.data.pct.toFixed(1)}%</div>
            </div>
            <div>
              <div className="text-gray-500">Top Player</div>
              <div className="text-white font-bold truncate">{hoveredCell.data.topPlayer || '—'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6">
        <h3 className="text-white font-bold mb-4">Heatmap Insights</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="text-violet-400 font-medium mb-1">Database Coverage</div>
            <p className="text-gray-400 text-xs">{totalCards.toLocaleString()} cards across 4 sports, spanning from pre-1950 to 2025. Average estimated value: {formatMoney(summaryStats.avgValue)}/card. Most populated sport: {summaryStats.topSport}. Peak decade: {summaryStats.topDecade}.</p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="text-violet-400 font-medium mb-1">Collecting Opportunity</div>
            <p className="text-gray-400 text-xs">Cool cells (blue) in valuable eras may represent underserved collecting areas with less competition. Hot cells (amber/red) show where the market is most liquid — easier to buy and sell, but more competition for deals.</p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="text-violet-400 font-medium mb-1">Value vs Count</div>
            <p className="text-gray-400 text-xs">Toggle between Count and Value to spot segments where few cards command high total value — these are the premium collecting categories. Many cards with low total value may indicate a saturated, low-demand segment.</p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="text-violet-400 font-medium mb-1">Rookie Premium</div>
            <p className="text-gray-400 text-xs">{summaryStats.rookiePct.toFixed(0)}% of our database consists of rookie cards. The Rookie/Vet view shows which sports have the highest rookie concentration — important because rookie cards typically command 2-5x premiums over base cards.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
