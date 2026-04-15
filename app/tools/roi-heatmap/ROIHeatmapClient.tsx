'use client';

import { useState, useMemo } from 'react';
import { sportsCards } from '@/data/sports-cards';

/* ───── Types ───── */
type Sport = 'baseball' | 'basketball' | 'football' | 'hockey';

interface CardROI {
  name: string;
  player: string;
  year: number;
  sport: Sport;
  rawMid: number;
  gemMid: number;
  multiplier: number;
}

interface CellData {
  cards: CardROI[];
  avgMultiplier: number;
  count: number;
}

/* ───── Parsing Helpers ───── */
function parseMidpoint(value: string): number | null {
  // Match patterns like "$3-$8", "$3–$8", "$15,000–$80,000", "$12,600,000+"
  // Also handle "$40-$80 (PSA 10)" style with parenthetical suffixes
  const cleaned = value.replace(/\s*\(.*?\)\s*/g, '').trim();

  // Handle "$X+" single-value format
  const singlePlus = cleaned.match(/^\$([0-9,]+)\+?$/);
  if (singlePlus) {
    return parseFloat(singlePlus[1].replace(/,/g, ''));
  }

  // Handle range: "$X-$Y" or "$X–$Y"
  const range = cleaned.match(/^\$([0-9,]+(?:\.\d+)?)\s*[-–]\s*\$([0-9,]+(?:\.\d+)?)$/);
  if (range) {
    const low = parseFloat(range[1].replace(/,/g, ''));
    const high = parseFloat(range[2].replace(/,/g, ''));
    return (low + high) / 2;
  }

  // Handle single "$X" format
  const single = cleaned.match(/^\$([0-9,]+(?:\.\d+)?)$/);
  if (single) {
    return parseFloat(single[1].replace(/,/g, ''));
  }

  return null;
}

function getEra(year: number): string {
  if (year < 1970) return 'Pre-1970';
  if (year < 1990) return '1970-1989';
  if (year < 2000) return '1990-1999';
  if (year < 2010) return '2000-2009';
  if (year < 2020) return '2010-2019';
  return '2020+';
}

function getValueTier(rawMid: number): string {
  if (rawMid < 5) return 'Under $5';
  if (rawMid < 25) return '$5-$25';
  if (rawMid < 100) return '$25-$100';
  if (rawMid < 500) return '$100-$500';
  return '$500+';
}

function getCellColor(multiplier: number): string {
  if (multiplier >= 12) return 'bg-emerald-600/80';
  if (multiplier >= 8) return 'bg-emerald-700/70';
  if (multiplier >= 6) return 'bg-yellow-600/60';
  if (multiplier >= 4) return 'bg-yellow-700/50';
  if (multiplier >= 2) return 'bg-red-700/50';
  return 'bg-red-800/50';
}

function getCellTextColor(multiplier: number): string {
  if (multiplier >= 8) return 'text-emerald-100';
  if (multiplier >= 4) return 'text-yellow-100';
  return 'text-red-100';
}

/* ───── Constants ───── */
const SPORTS: Sport[] = ['baseball', 'basketball', 'football', 'hockey'];
const SPORT_LABELS: Record<Sport, string> = {
  baseball: 'Baseball',
  basketball: 'Basketball',
  football: 'Football',
  hockey: 'Hockey',
};
const ERAS = ['Pre-1970', '1970-1989', '1990-1999', '2000-2009', '2010-2019', '2020+'];
const VALUE_TIERS = ['Under $5', '$5-$25', '$25-$100', '$100-$500', '$500+'];

type ViewMode = 'era' | 'tier';

/* ───── Component ───── */
export default function ROIHeatmapClient() {
  const [view, setView] = useState<ViewMode>('era');
  const [selectedCell, setSelectedCell] = useState<{ row: string; col: string } | null>(null);

  // Parse all cards into ROI data
  const cardROIs = useMemo<CardROI[]>(() => {
    const results: CardROI[] = [];
    for (const card of sportsCards) {
      const rawMid = parseMidpoint(card.estimatedValueRaw);
      const gemMid = parseMidpoint(card.estimatedValueGem);
      if (rawMid && gemMid && rawMid > 0) {
        results.push({
          name: card.name,
          player: card.player,
          year: card.year,
          sport: card.sport as Sport,
          rawMid,
          gemMid,
          multiplier: gemMid / rawMid,
        });
      }
    }
    return results;
  }, []);

  // Build heatmap data for Sport x Era
  const eraGrid = useMemo(() => {
    const grid: Record<string, Record<string, CellData>> = {};
    for (const sport of SPORTS) {
      grid[sport] = {};
      for (const era of ERAS) {
        grid[sport][era] = { cards: [], avgMultiplier: 0, count: 0 };
      }
    }
    for (const c of cardROIs) {
      const era = getEra(c.year);
      grid[c.sport][era].cards.push(c);
    }
    for (const sport of SPORTS) {
      for (const era of ERAS) {
        const cell = grid[sport][era];
        cell.count = cell.cards.length;
        if (cell.count > 0) {
          cell.avgMultiplier = cell.cards.reduce((s, c) => s + c.multiplier, 0) / cell.count;
        }
      }
    }
    return grid;
  }, [cardROIs]);

  // Build heatmap data for Sport x Value Tier
  const tierGrid = useMemo(() => {
    const grid: Record<string, Record<string, CellData>> = {};
    for (const sport of SPORTS) {
      grid[sport] = {};
      for (const tier of VALUE_TIERS) {
        grid[sport][tier] = { cards: [], avgMultiplier: 0, count: 0 };
      }
    }
    for (const c of cardROIs) {
      const tier = getValueTier(c.rawMid);
      grid[c.sport][tier].cards.push(c);
    }
    for (const sport of SPORTS) {
      for (const tier of VALUE_TIERS) {
        const cell = grid[sport][tier];
        cell.count = cell.cards.length;
        if (cell.count > 0) {
          cell.avgMultiplier = cell.cards.reduce((s, c) => s + c.multiplier, 0) / cell.count;
        }
      }
    }
    return grid;
  }, [cardROIs]);

  // Top 10 best ROI
  const topBest = useMemo(() => {
    return [...cardROIs].sort((a, b) => b.multiplier - a.multiplier).slice(0, 10);
  }, [cardROIs]);

  // Top 10 worst ROI
  const topWorst = useMemo(() => {
    return [...cardROIs].sort((a, b) => a.multiplier - b.multiplier).slice(0, 10);
  }, [cardROIs]);

  // Stats
  const stats = useMemo(() => {
    const total = cardROIs.length;
    const avgROI = total > 0 ? cardROIs.reduce((s, c) => s + c.multiplier, 0) / total : 0;

    // Best sport
    const sportAvgs: { sport: Sport; avg: number }[] = SPORTS.map(sport => {
      const cards = cardROIs.filter(c => c.sport === sport);
      return { sport, avg: cards.length > 0 ? cards.reduce((s, c) => s + c.multiplier, 0) / cards.length : 0 };
    });
    const bestSport = sportAvgs.sort((a, b) => b.avg - a.avg)[0];

    // Best era
    const eraAvgs = ERAS.map(era => {
      const cards = cardROIs.filter(c => getEra(c.year) === era);
      return { era, avg: cards.length > 0 ? cards.reduce((s, c) => s + c.multiplier, 0) / cards.length : 0 };
    });
    const bestEra = eraAvgs.sort((a, b) => b.avg - a.avg)[0];

    return { total, avgROI, bestSport, bestEra };
  }, [cardROIs]);

  // Get selected cell details
  const selectedCellData = useMemo(() => {
    if (!selectedCell) return null;
    const grid = view === 'era' ? eraGrid : tierGrid;
    const data = grid[selectedCell.row]?.[selectedCell.col];
    if (!data || data.count === 0) return null;
    const sorted = [...data.cards].sort((a, b) => b.multiplier - a.multiplier);
    return { ...data, topCards: sorted.slice(0, 5) };
  }, [selectedCell, view, eraGrid, tierGrid]);

  const columns = view === 'era' ? ERAS : VALUE_TIERS;
  const grid = view === 'era' ? eraGrid : tierGrid;

  return (
    <div className="space-y-8">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-gray-400 text-xs font-medium mb-1">Cards Analyzed</div>
          <div className="text-white text-2xl font-bold">{stats.total.toLocaleString()}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-gray-400 text-xs font-medium mb-1">Avg ROI Multiplier</div>
          <div className="text-emerald-400 text-2xl font-bold">{stats.avgROI.toFixed(1)}x</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-gray-400 text-xs font-medium mb-1">Best Sport</div>
          <div className="text-white text-2xl font-bold">{stats.bestSport ? SPORT_LABELS[stats.bestSport.sport] : '—'}</div>
          <div className="text-emerald-400 text-xs">{stats.bestSport ? `${stats.bestSport.avg.toFixed(1)}x avg` : ''}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-gray-400 text-xs font-medium mb-1">Best Era</div>
          <div className="text-white text-2xl font-bold">{stats.bestEra ? stats.bestEra.era : '—'}</div>
          <div className="text-emerald-400 text-xs">{stats.bestEra ? `${stats.bestEra.avg.toFixed(1)}x avg` : ''}</div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => { setView('era'); setSelectedCell(null); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            view === 'era'
              ? 'bg-emerald-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
          }`}
        >
          Sport x Era
        </button>
        <button
          onClick={() => { setView('tier'); setSelectedCell(null); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            view === 'tier'
              ? 'bg-emerald-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
          }`}
        >
          Sport x Value Tier
        </button>
      </div>

      {/* Color Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-400">
        <span className="font-medium">ROI Scale:</span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-red-800/50 border border-gray-700" /> &lt;2x
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-red-700/50 border border-gray-700" /> 2-4x
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-yellow-700/50 border border-gray-700" /> 4-6x
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-yellow-600/60 border border-gray-700" /> 6-8x
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-700/70 border border-gray-700" /> 8-12x
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-600/80 border border-gray-700" /> 12x+
        </span>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto -mx-4 px-4">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr>
              <th className="text-left text-gray-400 text-xs font-medium py-3 px-3 w-28">Sport</th>
              {columns.map(col => (
                <th key={col} className="text-center text-gray-400 text-xs font-medium py-3 px-2">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SPORTS.map(sport => (
              <tr key={sport}>
                <td className="py-1.5 px-3">
                  <span className="text-white text-sm font-semibold">{SPORT_LABELS[sport]}</span>
                </td>
                {columns.map(col => {
                  const cell = grid[sport][col];
                  const isSelected = selectedCell?.row === sport && selectedCell?.col === col;
                  if (cell.count === 0) {
                    return (
                      <td key={col} className="py-1.5 px-2">
                        <div className="bg-gray-900/50 border border-gray-800/50 rounded-lg px-3 py-4 text-center">
                          <span className="text-gray-600 text-xs">No data</span>
                        </div>
                      </td>
                    );
                  }
                  return (
                    <td key={col} className="py-1.5 px-2">
                      <button
                        onClick={() => setSelectedCell(isSelected ? null : { row: sport, col })}
                        className={`w-full rounded-lg px-3 py-3 text-center transition-all cursor-pointer ${getCellColor(cell.avgMultiplier)} ${
                          isSelected ? 'ring-2 ring-emerald-400 ring-offset-1 ring-offset-gray-950' : 'hover:ring-1 hover:ring-gray-500'
                        }`}
                      >
                        <div className={`text-lg font-bold ${getCellTextColor(cell.avgMultiplier)}`}>
                          {cell.avgMultiplier.toFixed(1)}x
                        </div>
                        <div className="text-white/60 text-xs mt-0.5">
                          {cell.count} card{cell.count !== 1 ? 's' : ''}
                        </div>
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Selected Cell Detail */}
      {selectedCellData && selectedCell && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">
              {SPORT_LABELS[selectedCell.row as Sport]} &middot; {selectedCell.col}
            </h3>
            <button
              onClick={() => setSelectedCell(null)}
              className="text-gray-500 hover:text-white text-sm transition-colors"
            >
              Close
            </button>
          </div>
          <div className="flex items-center gap-4 mb-4 text-sm">
            <span className="text-gray-400">
              {selectedCellData.count} card{selectedCellData.count !== 1 ? 's' : ''}
            </span>
            <span className="text-emerald-400 font-semibold">
              Avg {selectedCellData.avgMultiplier.toFixed(1)}x multiplier
            </span>
          </div>
          <div className="text-xs text-gray-400 font-medium mb-2">Top 5 Cards by ROI</div>
          <div className="space-y-2">
            {selectedCellData.topCards.map((card, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="text-white text-sm font-medium truncate">{card.name}</div>
                  <div className="text-gray-500 text-xs mt-0.5">
                    Raw: ${card.rawMid.toLocaleString()} &rarr; Gem: ${card.gemMid.toLocaleString()}
                  </div>
                </div>
                <div className={`text-sm font-bold ml-3 shrink-0 ${card.multiplier >= 8 ? 'text-emerald-400' : card.multiplier >= 4 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {card.multiplier.toFixed(1)}x
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top 10 Best ROI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-1">Top 10 Best ROI Cards</h3>
          <p className="text-gray-500 text-xs mb-4">Highest gem/raw multiplier in the database</p>
          <div className="space-y-2">
            {topBest.map((card, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <span className="text-gray-600 font-mono text-xs w-5 text-right shrink-0">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-white truncate">{card.name}</div>
                  <div className="text-gray-500 text-xs">
                    ${card.rawMid.toLocaleString()} &rarr; ${card.gemMid.toLocaleString()}
                  </div>
                </div>
                <span className="text-emerald-400 font-bold shrink-0">{card.multiplier.toFixed(1)}x</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-1">Top 10 Worst ROI Cards</h3>
          <p className="text-gray-500 text-xs mb-4">Grading adds the least value to these cards</p>
          <div className="space-y-2">
            {topWorst.map((card, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <span className="text-gray-600 font-mono text-xs w-5 text-right shrink-0">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-white truncate">{card.name}</div>
                  <div className="text-gray-500 text-xs">
                    ${card.rawMid.toLocaleString()} &rarr; ${card.gemMid.toLocaleString()}
                  </div>
                </div>
                <span className="text-red-400 font-bold shrink-0">{card.multiplier.toFixed(1)}x</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Methodology Note */}
      <div className="bg-amber-950/20 border border-amber-800/30 rounded-xl px-5 py-4">
        <p className="text-amber-300/80 text-sm">
          <strong className="font-semibold">Methodology:</strong> ROI multipliers are calculated from estimated raw and gem mint values in our database. The raw value is the midpoint of the estimated range (e.g., &ldquo;$3-$8&rdquo; = $5.50) and the gem value is the midpoint of the gem mint range. Actual returns depend on the specific grade received, grading company, and current market conditions.
        </p>
      </div>
    </div>
  );
}
