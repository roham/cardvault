'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

function parseValue(v: string): number {
  const m = v.match(/\$([0-9,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
}

function dateHash(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

type ViewMode = 'sport-era' | 'sport-tier' | 'era-type';

interface HeatCell {
  label: string;
  rowLabel: string;
  colLabel: string;
  count: number;
  avgValue: number;
  totalValue: number;
  temperature: number; // -100 to +100
  trend: 'hot' | 'warm' | 'neutral' | 'cool' | 'cold';
  rookiePercent: number;
}

const SPORTS = ['baseball', 'basketball', 'football', 'hockey'] as const;
const ERAS = ['Pre-War (1900-1945)', 'Vintage (1946-1979)', 'Junk Wax (1980-1994)', 'Modern (1995-2014)', 'Ultra-Modern (2015+)'] as const;
const VALUE_TIERS = ['Under $10', '$10-$49', '$50-$249', '$250-$999', '$1,000+'] as const;
const CARD_TYPES = ['Rookie Cards', 'Base Cards', 'All Cards'] as const;

function getEra(year: number): string {
  if (year < 1946) return 'Pre-War (1900-1945)';
  if (year < 1980) return 'Vintage (1946-1979)';
  if (year < 1995) return 'Junk Wax (1980-1994)';
  if (year < 2015) return 'Modern (1995-2014)';
  return 'Ultra-Modern (2015+)';
}

function getValueTier(val: number): string {
  if (val < 10) return 'Under $10';
  if (val < 50) return '$10-$49';
  if (val < 250) return '$50-$249';
  if (val < 1000) return '$250-$999';
  return '$1,000+';
}

function computeTemperature(count: number, avgValue: number, rookiePercent: number, seed: number): number {
  // Base temp from demand signals
  let temp = 0;

  // Higher card count = more interest
  if (count > 100) temp += 15;
  else if (count > 50) temp += 10;
  else if (count > 20) temp += 5;
  else if (count < 5) temp -= 15;

  // Higher avg value = premium segment
  if (avgValue > 1000) temp += 25;
  else if (avgValue > 200) temp += 15;
  else if (avgValue > 50) temp += 5;
  else if (avgValue < 5) temp -= 10;

  // Rookie heavy = trending
  if (rookiePercent > 40) temp += 20;
  else if (rookiePercent > 20) temp += 10;

  // Add seasonal variance (deterministic per day)
  const seasonal = pseudoRandom(seed) * 30 - 15;
  temp += seasonal;

  return Math.max(-100, Math.min(100, Math.round(temp)));
}

function getTrend(temp: number): 'hot' | 'warm' | 'neutral' | 'cool' | 'cold' {
  if (temp >= 40) return 'hot';
  if (temp >= 15) return 'warm';
  if (temp >= -15) return 'neutral';
  if (temp >= -40) return 'cool';
  return 'cold';
}

const trendColors: Record<string, string> = {
  hot: 'bg-red-600/80 text-white',
  warm: 'bg-orange-600/60 text-orange-100',
  neutral: 'bg-gray-700/60 text-gray-300',
  cool: 'bg-blue-700/50 text-blue-200',
  cold: 'bg-blue-900/60 text-blue-300',
};

const trendBorders: Record<string, string> = {
  hot: 'border-red-500/50',
  warm: 'border-orange-500/40',
  neutral: 'border-gray-600/40',
  cool: 'border-blue-600/40',
  cold: 'border-blue-800/40',
};

const trendArrows: Record<string, string> = {
  hot: '^^ ',
  warm: '^ ',
  neutral: '- ',
  cool: 'v ',
  cold: 'vv ',
};

export default function MarketHeatmapClient() {
  const [view, setView] = useState<ViewMode>('sport-era');
  const seed = dateHash();

  const grid = useMemo(() => {
    const cells: HeatCell[][] = [];

    if (view === 'sport-era') {
      for (const sport of SPORTS) {
        const row: HeatCell[] = [];
        for (const era of ERAS) {
          const matching = sportsCards.filter(c =>
            c.sport === sport && getEra(c.year) === era
          );
          const count = matching.length;
          const values = matching.map(c => parseValue(c.estimatedValueRaw));
          const totalValue = values.reduce((a, b) => a + b, 0);
          const avgValue = count > 0 ? totalValue / count : 0;
          const rookieCount = matching.filter(c => c.rookie).length;
          const rookiePercent = count > 0 ? (rookieCount / count) * 100 : 0;
          const cellSeed = seed + sport.length * 100 + era.length * 10;
          const temperature = computeTemperature(count, avgValue, rookiePercent, cellSeed);

          row.push({
            label: `${sport} / ${era}`,
            rowLabel: sport.charAt(0).toUpperCase() + sport.slice(1),
            colLabel: era,
            count,
            avgValue,
            totalValue,
            temperature,
            trend: getTrend(temperature),
            rookiePercent,
          });
        }
        cells.push(row);
      }
    } else if (view === 'sport-tier') {
      for (const sport of SPORTS) {
        const row: HeatCell[] = [];
        for (const tier of VALUE_TIERS) {
          const matching = sportsCards.filter(c =>
            c.sport === sport && getValueTier(parseValue(c.estimatedValueRaw)) === tier
          );
          const count = matching.length;
          const values = matching.map(c => parseValue(c.estimatedValueRaw));
          const totalValue = values.reduce((a, b) => a + b, 0);
          const avgValue = count > 0 ? totalValue / count : 0;
          const rookieCount = matching.filter(c => c.rookie).length;
          const rookiePercent = count > 0 ? (rookieCount / count) * 100 : 0;
          const cellSeed = seed + sport.length * 200 + tier.length * 20;
          const temperature = computeTemperature(count, avgValue, rookiePercent, cellSeed);

          row.push({
            label: `${sport} / ${tier}`,
            rowLabel: sport.charAt(0).toUpperCase() + sport.slice(1),
            colLabel: tier,
            count,
            avgValue,
            totalValue,
            temperature,
            trend: getTrend(temperature),
            rookiePercent,
          });
        }
        cells.push(row);
      }
    } else {
      for (const era of ERAS) {
        const row: HeatCell[] = [];
        for (const type of CARD_TYPES) {
          const eraCards = sportsCards.filter(c => getEra(c.year) === era);
          const matching = type === 'Rookie Cards' ? eraCards.filter(c => c.rookie)
            : type === 'Base Cards' ? eraCards.filter(c => !c.rookie)
            : eraCards;
          const count = matching.length;
          const values = matching.map(c => parseValue(c.estimatedValueRaw));
          const totalValue = values.reduce((a, b) => a + b, 0);
          const avgValue = count > 0 ? totalValue / count : 0;
          const rookieCount = matching.filter(c => c.rookie).length;
          const rookiePercent = count > 0 ? (rookieCount / count) * 100 : 0;
          const cellSeed = seed + era.length * 300 + type.length * 30;
          const temperature = computeTemperature(count, avgValue, rookiePercent, cellSeed);

          row.push({
            label: `${era} / ${type}`,
            rowLabel: era.replace(/ \(.*\)/, ''),
            colLabel: type,
            count,
            avgValue,
            totalValue,
            temperature,
            trend: getTrend(temperature),
            rookiePercent,
          });
        }
        cells.push(row);
      }
    }

    return cells;
  }, [view, seed]);

  const colHeaders = view === 'sport-era' ? ERAS.map(e => e.replace(/ \(.*\)/, ''))
    : view === 'sport-tier' ? VALUE_TIERS
    : CARD_TYPES;

  // Summary stats
  const allCells = grid.flat();
  const hottest = allCells.reduce((best, c) => c.temperature > best.temperature ? c : best, allCells[0]);
  const coldest = allCells.reduce((best, c) => c.temperature < best.temperature ? c : best, allCells[0]);
  const hotCount = allCells.filter(c => c.trend === 'hot').length;

  return (
    <div className="space-y-8">
      {/* Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-red-800/40 rounded-xl p-5 text-center">
          <div className="text-gray-400 text-sm mb-1">Hottest Segment</div>
          <div className="text-lg font-bold text-red-400">{hottest?.label}</div>
          <div className="text-gray-500 text-xs mt-1">Temp: +{hottest?.temperature}</div>
        </div>
        <div className="bg-gray-900 border border-blue-800/40 rounded-xl p-5 text-center">
          <div className="text-gray-400 text-sm mb-1">Coldest Segment</div>
          <div className="text-lg font-bold text-blue-400">{coldest?.label}</div>
          <div className="text-gray-500 text-xs mt-1">Temp: {coldest?.temperature}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-center">
          <div className="text-gray-400 text-sm mb-1">Hot Segments Today</div>
          <div className="text-lg font-bold text-white">{hotCount} of {allCells.length}</div>
          <div className="text-gray-500 text-xs mt-1">{Math.round((hotCount / allCells.length) * 100)}% of market</div>
        </div>
      </div>

      {/* View Selector */}
      <div className="flex flex-wrap gap-2">
        {[
          { value: 'sport-era' as ViewMode, label: 'Sport x Era' },
          { value: 'sport-tier' as ViewMode, label: 'Sport x Value Tier' },
          { value: 'era-type' as ViewMode, label: 'Era x Card Type' },
        ].map(opt => (
          <button
            key={opt.value}
            onClick={() => setView(opt.value)}
            className={`text-sm px-4 py-2 rounded-lg border transition-colors ${
              view === opt.value
                ? 'bg-emerald-950/60 border-emerald-700 text-emerald-400'
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Heat Map Grid */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left text-gray-500 text-xs font-normal p-2 min-w-[100px]" />
              {colHeaders.map(h => (
                <th key={h as string} className="text-center text-gray-400 text-xs font-medium p-2 min-w-[120px]">
                  {h as string}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.map((row, ri) => (
              <tr key={ri}>
                <td className="text-gray-300 text-sm font-medium p-2 whitespace-nowrap">{row[0]?.rowLabel}</td>
                {row.map((cell, ci) => (
                  <td key={ci} className="p-1.5">
                    <div className={`${trendColors[cell.trend]} border ${trendBorders[cell.trend]} rounded-lg p-3 text-center min-h-[80px] flex flex-col justify-center`}>
                      <div className="text-lg font-bold">
                        {trendArrows[cell.trend]}{cell.temperature > 0 ? '+' : ''}{cell.temperature}
                      </div>
                      <div className="text-xs opacity-80 mt-1">
                        {cell.count} cards
                      </div>
                      <div className="text-xs opacity-60">
                        avg ${cell.avgValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </div>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 justify-center">
        {[
          { trend: 'hot', label: 'Hot (40+)' },
          { trend: 'warm', label: 'Warm (15-39)' },
          { trend: 'neutral', label: 'Neutral (-14 to 14)' },
          { trend: 'cool', label: 'Cool (-15 to -39)' },
          { trend: 'cold', label: 'Cold (-40+)' },
        ].map(l => (
          <div key={l.trend} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded ${trendColors[l.trend]} border ${trendBorders[l.trend]}`} />
            <span className="text-gray-400 text-xs">{l.label}</span>
          </div>
        ))}
      </div>

      {/* Market Context */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-3">What Drives the Heat Map</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-400">
          <div>
            <h4 className="text-white font-medium mb-1">Positive Signals (Hot)</h4>
            <ul className="space-y-1">
              <li>+ High card count = active collecting segment</li>
              <li>+ High average value = premium demand</li>
              <li>+ High rookie % = new talent driving interest</li>
              <li>+ Seasonal events (draft, playoffs, HOF)</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-1">Negative Signals (Cold)</h4>
            <ul className="space-y-1">
              <li>- Low card count = niche or dead segment</li>
              <li>- Low average value = oversupply</li>
              <li>- No rookies = stagnant market</li>
              <li>- Off-season for the sport</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Cross-links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: '/market-movers', label: 'Market Movers', desc: 'Daily gainers and losers' },
          { href: '/market-pulse', label: 'Market Pulse', desc: 'Live activity dashboard' },
          { href: '/tools/seasonality', label: 'Seasonality Guide', desc: 'When to buy and sell' },
          { href: '/data-room', label: 'Data Room', desc: 'Full market statistics' },
        ].map(link => (
          <Link key={link.href} href={link.href} className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-emerald-700 transition-colors group">
            <div className="text-white text-sm font-medium group-hover:text-emerald-400 transition-colors">{link.label}</div>
            <div className="text-gray-500 text-xs mt-1">{link.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
