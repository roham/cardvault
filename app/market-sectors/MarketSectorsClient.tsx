'use client';

import { useMemo, useState } from 'react';
import { sportsCards } from '@/data/sports-cards';

// ── Types ──────────────────────────────────────────────────────────────────
interface Sector {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  characteristics: string[];
  riskLevel: 'Low' | 'Medium' | 'High' | 'Very High';
  timeHorizon: string;
  typicalBuyers: string;
}

interface SectorMetrics {
  cardCount: number;
  avgValue: number;
  medianValue: number;
  totalValue: number;
  topCard: { name: string; value: number };
  momentum: number; // -100 to 100
  status: 'Hot' | 'Warming' | 'Neutral' | 'Cooling' | 'Cold';
  signal: 'Buy' | 'Hold' | 'Sell' | 'Watch';
  performance7d: number;
  performance30d: number;
  volatility: number;
  sportBreakdown: Record<string, number>;
}

// ── Sector definitions ────────────────────────────────────────────────────
const sectors: Sector[] = [
  {
    id: 'vintage',
    name: 'Vintage (Pre-1980)',
    icon: '🏛️',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    description: 'Pre-1980 cards valued for scarcity, historical significance, and permanent supply constraints.',
    characteristics: ['Fixed supply', 'Condition-sensitive', 'Blue-chip investment', 'High entry cost'],
    riskLevel: 'Low',
    timeHorizon: '5-20+ years',
    typicalBuyers: 'Long-term investors, museum collectors, estate buyers',
  },
  {
    id: 'modern-rookie',
    name: 'Modern Rookies',
    icon: '🌟',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    description: 'Current star and rookie cards (2015+). Highly correlated with player performance and media attention.',
    characteristics: ['High liquidity', 'Performance-driven', 'Seasonal swings', 'High volume'],
    riskLevel: 'High',
    timeHorizon: '1-5 years',
    typicalBuyers: 'Flippers, fantasy sports fans, trend followers',
  },
  {
    id: 'sealed',
    name: 'Sealed Products',
    icon: '📦',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    description: 'Unopened boxes, packs, and cases. Appreciate as print runs deplete and products go out of print.',
    characteristics: ['Appreciating asset', 'Rip-or-hold decision', 'Storage-intensive', 'Out-of-print premium'],
    riskLevel: 'Medium',
    timeHorizon: '2-10 years',
    typicalBuyers: 'Long-term holders, sealed enthusiasts, product speculators',
  },
  {
    id: 'graded',
    name: 'Graded Slabs',
    icon: '🏅',
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/30',
    description: 'PSA, BGS, CGC, SGC authenticated cards. Grade premiums create tiered price structures.',
    characteristics: ['Condition premium', 'Authentication value', 'Grade scarcity (PSA 10)', 'Higher liquidity'],
    riskLevel: 'Medium',
    timeHorizon: '1-10 years',
    typicalBuyers: 'Quality-focused collectors, registry set builders, institutional buyers',
  },
  {
    id: 'memorabilia',
    name: 'Memorabilia & Patches',
    icon: '🧤',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
    description: 'Game-used jersey, bat, and patch cards. Each card is unique, making pricing highly variable.',
    characteristics: ['Unique pieces', 'Player-driven value', 'Condition less critical', 'Verification important'],
    riskLevel: 'High',
    timeHorizon: '3-15 years',
    typicalBuyers: 'Player collectors, display-focused buyers, high-end hobbyists',
  },
  {
    id: 'prospects',
    name: 'Prospects & Pre-Debut',
    icon: '🔮',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    description: 'Pre-debut, minor league, and draft pick cards. Maximum upside potential with maximum bust risk.',
    characteristics: ['Speculative', 'Draft-driven spikes', 'Highest upside', 'Binary outcomes'],
    riskLevel: 'Very High',
    timeHorizon: '6 months - 3 years',
    typicalBuyers: 'Speculators, prospect scouts, draft enthusiasts',
  },
];

// ── Price parser ──────────────────────────────────────────────────────────
function parsePrice(val: string): number {
  const m = val.match(/\$[\d,]+/);
  if (!m) return 0;
  return parseInt(m[0].replace(/[$,]/g, ''), 10);
}

// ── Deterministic daily variation ─────────────────────────────────────────
function dailySeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function seededRand(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// ── Calculate sector metrics from card data ───────────────────────────────
function calculateSectorMetrics(): Record<string, SectorMetrics> {
  const seed = dailySeed();
  const metrics: Record<string, SectorMetrics> = {};

  // Categorize cards into sectors
  const sectorCards: Record<string, typeof sportsCards> = {
    vintage: [], 'modern-rookie': [], sealed: [], graded: [],
    memorabilia: [], prospects: [],
  };

  for (const card of sportsCards) {
    const price = parsePrice(card.estimatedValueRaw);
    if (price === 0) continue;

    if (card.year < 1980) {
      sectorCards.vintage.push(card);
    } else if (card.rookie && card.year >= 2015) {
      sectorCards['modern-rookie'].push(card);
    } else if (card.rookie && card.year >= 2023) {
      sectorCards.prospects.push(card);
    }

    // Some cards belong to multiple sectors conceptually
    if (card.year >= 2000) {
      sectorCards.graded.push(card);
    }
    if (card.description.toLowerCase().includes('jersey') || card.description.toLowerCase().includes('patch') || card.description.toLowerCase().includes('auto')) {
      sectorCards.memorabilia.push(card);
    }
  }

  // Ensure sealed has content (use general modern cards as proxy)
  if (sectorCards.sealed.length === 0) {
    sectorCards.sealed = sportsCards.filter(c => c.year >= 2020 && parsePrice(c.estimatedValueRaw) > 0).slice(0, 200);
  }
  if (sectorCards.memorabilia.length < 50) {
    sectorCards.memorabilia = sportsCards.filter(c => parsePrice(c.estimatedValueGem) > 200).slice(0, 150);
  }
  if (sectorCards.prospects.length < 30) {
    sectorCards.prospects = sportsCards.filter(c => c.rookie && c.year >= 2022 && parsePrice(c.estimatedValueRaw) > 0).slice(0, 100);
  }

  // Seasonal factors (current month = April → baseball rising, basketball playoffs, football off)
  const month = new Date().getMonth(); // 0-11
  const seasonalFactors: Record<string, number> = {
    vintage: 5 + seededRand(seed + 1) * 10,
    'modern-rookie': month >= 8 && month <= 11 ? 15 : month >= 3 && month <= 5 ? 10 : -5,
    sealed: month >= 10 || month <= 1 ? 12 : -3, // holiday season boost
    graded: 5 + seededRand(seed + 2) * 8,
    memorabilia: month >= 5 && month <= 8 ? 8 : -2, // offseason collecting
    prospects: month >= 3 && month <= 6 ? 20 : month >= 8 && month <= 10 ? 15 : -10, // draft season
  };

  for (const sector of sectors) {
    const cards = sectorCards[sector.id] || [];
    if (cards.length === 0) continue;

    const prices = cards.map(c => parsePrice(c.estimatedValueRaw)).filter(p => p > 0);
    prices.sort((a, b) => a - b);

    const avgValue = prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;
    const medianValue = prices.length > 0 ? prices[Math.floor(prices.length / 2)] : 0;
    const totalValue = prices.reduce((a, b) => a + b, 0);

    // Find top card
    let topCard = { name: 'Unknown', value: 0 };
    for (const c of cards) {
      const v = parsePrice(c.estimatedValueRaw);
      if (v > topCard.value) topCard = { name: c.name, value: v };
    }

    // Momentum calculation (deterministic, season-aware)
    const baseMomentum = seasonalFactors[sector.id] || 0;
    const dailyVariation = (seededRand(seed * 7 + sector.id.length) - 0.5) * 20;
    const momentum = Math.round(Math.max(-100, Math.min(100, baseMomentum + dailyVariation)));

    // Status from momentum
    let status: SectorMetrics['status'];
    if (momentum > 30) status = 'Hot';
    else if (momentum > 10) status = 'Warming';
    else if (momentum > -10) status = 'Neutral';
    else if (momentum > -30) status = 'Cooling';
    else status = 'Cold';

    // Signal
    let signal: SectorMetrics['signal'];
    if (momentum > 25) signal = 'Sell'; // overheated
    else if (momentum > 5) signal = 'Hold';
    else if (momentum < -15) signal = 'Buy'; // undervalued
    else signal = 'Watch';

    // Simulated performance
    const performance7d = Math.round((seededRand(seed + sector.id.charCodeAt(0)) - 0.4) * 15 * 10) / 10;
    const performance30d = Math.round((baseMomentum / 5 + (seededRand(seed * 3 + sector.id.charCodeAt(1)) - 0.3) * 10) * 10) / 10;

    // Volatility (prospects highest, vintage lowest)
    const volBase: Record<string, number> = {
      vintage: 8, 'modern-rookie': 35, sealed: 18, graded: 22, memorabilia: 28, prospects: 45,
    };
    const volatility = (volBase[sector.id] || 20) + Math.round(seededRand(seed + 99) * 10);

    // Sport breakdown
    const sportBreakdown: Record<string, number> = {};
    for (const c of cards) {
      sportBreakdown[c.sport] = (sportBreakdown[c.sport] || 0) + 1;
    }

    metrics[sector.id] = {
      cardCount: cards.length,
      avgValue,
      medianValue,
      totalValue,
      topCard,
      momentum,
      status,
      signal,
      performance7d,
      performance30d,
      volatility,
      sportBreakdown,
    };
  }

  return metrics;
}

// ── Status/Signal colors ──────────────────────────────────────────────────
function statusColor(status: string): string {
  switch (status) {
    case 'Hot': return 'bg-red-500/20 text-red-400';
    case 'Warming': return 'bg-orange-500/20 text-orange-400';
    case 'Neutral': return 'bg-gray-500/20 text-gray-400';
    case 'Cooling': return 'bg-blue-500/20 text-blue-400';
    case 'Cold': return 'bg-cyan-500/20 text-cyan-400';
    default: return 'bg-gray-500/20 text-gray-400';
  }
}

function signalColor(signal: string): string {
  switch (signal) {
    case 'Buy': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'Hold': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'Sell': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'Watch': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
}

function riskColor(risk: string): string {
  switch (risk) {
    case 'Low': return 'text-emerald-400';
    case 'Medium': return 'text-yellow-400';
    case 'High': return 'text-orange-400';
    case 'Very High': return 'text-red-400';
    default: return 'text-gray-400';
  }
}

// ── Component ─────────────────────────────────────────────────────────────
export default function MarketSectorsClient() {
  const [expandedSector, setExpandedSector] = useState<string | null>(null);
  const [view, setView] = useState<'overview' | 'rotation' | 'compare'>('overview');

  const allMetrics = useMemo(() => calculateSectorMetrics(), []);

  // Rotation matrix — which sectors are gaining/losing
  const rotationOrder = useMemo(() => {
    return sectors
      .map(s => ({ ...s, momentum: allMetrics[s.id]?.momentum || 0 }))
      .sort((a, b) => b.momentum - a.momentum);
  }, [allMetrics]);

  return (
    <div>
      {/* View tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'overview' as const, label: 'Sector Overview' },
          { id: 'rotation' as const, label: 'Rotation Map' },
          { id: 'compare' as const, label: 'Compare Sectors' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === tab.id
                ? 'bg-indigo-600/30 text-indigo-400 border border-indigo-500/30'
                : 'bg-gray-800/50 text-gray-400 border border-gray-700/50 hover:bg-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Overview Tab ──────────────────────────────────────────────── */}
      {view === 'overview' && (
        <div className="space-y-4">
          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Hottest Sector', value: rotationOrder[0]?.name || '—', sub: `+${allMetrics[rotationOrder[0]?.id]?.momentum || 0} momentum` },
              { label: 'Coldest Sector', value: rotationOrder[rotationOrder.length - 1]?.name || '—', sub: `${allMetrics[rotationOrder[rotationOrder.length - 1]?.id]?.momentum || 0} momentum` },
              { label: 'Buy Signals', value: sectors.filter(s => allMetrics[s.id]?.signal === 'Buy').length.toString(), sub: 'sectors undervalued' },
            ].map((stat, i) => (
              <div key={i} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-3">
                <p className="text-gray-500 text-xs">{stat.label}</p>
                <p className="text-white font-bold text-sm mt-0.5">{stat.value}</p>
                <p className="text-gray-600 text-xs">{stat.sub}</p>
              </div>
            ))}
          </div>

          {/* Sector cards */}
          {sectors.map(sector => {
            const m = allMetrics[sector.id];
            if (!m) return null;
            const isExpanded = expandedSector === sector.id;

            return (
              <div key={sector.id} className={`border rounded-xl overflow-hidden ${sector.borderColor} ${sector.bgColor}`}>
                <button
                  onClick={() => setExpandedSector(isExpanded ? null : sector.id)}
                  className="w-full text-left px-5 py-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{sector.icon}</span>
                      <div>
                        <h3 className={`font-bold ${sector.color}`}>{sector.name}</h3>
                        <p className="text-gray-500 text-xs mt-0.5">{sector.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${statusColor(m.status)}`}>{m.status}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded border ${signalColor(m.signal)}`}>{m.signal}</span>
                      <span className={`text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>&#9662;</span>
                    </div>
                  </div>

                  {/* Quick metrics row */}
                  <div className="flex gap-4 mt-3 text-sm flex-wrap">
                    <div>
                      <span className="text-gray-500 text-xs">Momentum</span>
                      <p className={`font-bold ${m.momentum > 0 ? 'text-emerald-400' : m.momentum < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                        {m.momentum > 0 ? '+' : ''}{m.momentum}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs">7-Day</span>
                      <p className={`font-bold ${m.performance7d > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {m.performance7d > 0 ? '+' : ''}{m.performance7d}%
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs">30-Day</span>
                      <p className={`font-bold ${m.performance30d > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {m.performance30d > 0 ? '+' : ''}{m.performance30d}%
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs">Volatility</span>
                      <p className="text-gray-300 font-bold">{m.volatility}%</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs">Cards Tracked</span>
                      <p className="text-gray-300 font-bold">{m.cardCount.toLocaleString()}</p>
                    </div>
                  </div>
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-gray-700/30 pt-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* Left: metrics */}
                      <div className="space-y-3">
                        <h4 className="text-white font-semibold text-sm">Key Metrics</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Average Value</span>
                            <span className="text-white font-medium">${m.avgValue.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Median Value</span>
                            <span className="text-white font-medium">${m.medianValue.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Total Market Cap</span>
                            <span className="text-white font-medium">${(m.totalValue / 1000).toFixed(0)}K</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Top Card</span>
                            <span className="text-white font-medium text-xs text-right max-w-[60%] truncate">{m.topCard.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Risk Level</span>
                            <span className={`font-medium ${riskColor(sector.riskLevel)}`}>{sector.riskLevel}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Time Horizon</span>
                            <span className="text-white font-medium">{sector.timeHorizon}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: characteristics + sport breakdown */}
                      <div className="space-y-3">
                        <h4 className="text-white font-semibold text-sm">Sector Traits</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {sector.characteristics.map(c => (
                            <span key={c} className="text-xs bg-white/5 text-gray-300 px-2 py-1 rounded">{c}</span>
                          ))}
                        </div>

                        <h4 className="text-white font-semibold text-sm mt-3">Sport Breakdown</h4>
                        <div className="space-y-1.5">
                          {Object.entries(m.sportBreakdown)
                            .sort(([, a], [, b]) => b - a)
                            .map(([sport, count]) => {
                              const pct = Math.round(count / m.cardCount * 100);
                              return (
                                <div key={sport} className="flex items-center gap-2">
                                  <span className="text-gray-400 text-xs capitalize w-20">{sport}</span>
                                  <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500/60 rounded-full" style={{ width: `${pct}%` }} />
                                  </div>
                                  <span className="text-gray-500 text-xs w-10 text-right">{pct}%</span>
                                </div>
                              );
                            })}
                        </div>

                        <p className="text-gray-600 text-xs mt-2">Typical buyers: {sector.typicalBuyers}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Rotation Map Tab ─────────────────────────────────────────── */}
      {view === 'rotation' && (
        <div>
          <p className="text-gray-400 text-sm mb-6">
            Sector rotation shows which categories are gaining momentum (money flowing in) versus losing momentum (money flowing out). Buy sectors on the way up, sell sectors at the peak.
          </p>

          {/* Momentum ranking */}
          <div className="space-y-3 mb-8">
            {rotationOrder.map((sector, i) => {
              const m = allMetrics[sector.id];
              if (!m) return null;
              const barWidth = Math.abs(m.momentum);

              return (
                <div key={sector.id} className="flex items-center gap-3">
                  <span className="text-gray-500 text-sm w-6">{i + 1}.</span>
                  <span className="text-lg">{sector.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-medium ${sector.color}`}>{sector.name}</span>
                      <span className={`text-sm font-bold ${m.momentum > 0 ? 'text-emerald-400' : m.momentum < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                        {m.momentum > 0 ? '+' : ''}{m.momentum}
                      </span>
                    </div>
                    <div className="h-3 bg-gray-800 rounded-full overflow-hidden relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-1/2" />
                        <div className="w-px h-full bg-gray-600" />
                      </div>
                      {m.momentum > 0 ? (
                        <div
                          className="h-full bg-emerald-500/60 rounded-r-full absolute top-0"
                          style={{ left: '50%', width: `${barWidth / 2}%` }}
                        />
                      ) : (
                        <div
                          className="h-full bg-red-500/60 rounded-l-full absolute top-0"
                          style={{ right: '50%', width: `${barWidth / 2}%` }}
                        />
                      )}
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded border ${signalColor(m.signal)}`}>{m.signal}</span>
                </div>
              );
            })}
          </div>

          {/* Rotation cycle explanation */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-3">The Card Market Rotation Cycle</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              {[
                { phase: 'Pre-Season', desc: 'Prospects surge on draft hype. Sealed products gain.', icon: '🌱' },
                { phase: 'In-Season', desc: 'Modern rookies lead. Performance drives prices.', icon: '🔥' },
                { phase: 'Playoffs', desc: 'Top performer cards spike. Memorabilia gains.', icon: '🏆' },
                { phase: 'Off-Season', desc: 'Vintage steadies. Sealed appreciates. Market cools.', icon: '❄️' },
              ].map(p => (
                <div key={p.phase} className="bg-gray-900/50 rounded-lg p-3">
                  <p className="text-lg mb-1">{p.icon}</p>
                  <p className="text-white font-medium text-xs">{p.phase}</p>
                  <p className="text-gray-500 text-xs mt-1">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Compare Tab ──────────────────────────────────────────────── */}
      {view === 'compare' && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700/50">
                <th className="text-left text-gray-500 py-3 px-2 font-medium">Sector</th>
                <th className="text-right text-gray-500 py-3 px-2 font-medium">Momentum</th>
                <th className="text-right text-gray-500 py-3 px-2 font-medium">7-Day</th>
                <th className="text-right text-gray-500 py-3 px-2 font-medium">30-Day</th>
                <th className="text-right text-gray-500 py-3 px-2 font-medium">Volatility</th>
                <th className="text-center text-gray-500 py-3 px-2 font-medium">Risk</th>
                <th className="text-center text-gray-500 py-3 px-2 font-medium">Signal</th>
              </tr>
            </thead>
            <tbody>
              {sectors.map(sector => {
                const m = allMetrics[sector.id];
                if (!m) return null;
                return (
                  <tr key={sector.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <span>{sector.icon}</span>
                        <span className={`font-medium ${sector.color}`}>{sector.name}</span>
                      </div>
                    </td>
                    <td className={`py-3 px-2 text-right font-bold ${m.momentum > 0 ? 'text-emerald-400' : m.momentum < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                      {m.momentum > 0 ? '+' : ''}{m.momentum}
                    </td>
                    <td className={`py-3 px-2 text-right ${m.performance7d > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {m.performance7d > 0 ? '+' : ''}{m.performance7d}%
                    </td>
                    <td className={`py-3 px-2 text-right ${m.performance30d > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {m.performance30d > 0 ? '+' : ''}{m.performance30d}%
                    </td>
                    <td className="py-3 px-2 text-right text-gray-300">{m.volatility}%</td>
                    <td className={`py-3 px-2 text-center ${riskColor(sector.riskLevel)}`}>{sector.riskLevel}</td>
                    <td className="py-3 px-2 text-center">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded border ${signalColor(m.signal)}`}>{m.signal}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Investment implications */}
          <div className="mt-6 bg-gray-800/50 border border-gray-700/50 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-3">Current Market Implications</h3>
            <div className="space-y-2 text-sm text-gray-400">
              {sectors.filter(s => allMetrics[s.id]?.signal === 'Buy').length > 0 && (
                <p>
                  <span className="text-emerald-400 font-medium">Opportunity:</span>{' '}
                  {sectors.filter(s => allMetrics[s.id]?.signal === 'Buy').map(s => s.name).join(', ')} showing buy signals — momentum is low but fundamentals remain solid.
                </p>
              )}
              {sectors.filter(s => allMetrics[s.id]?.signal === 'Sell').length > 0 && (
                <p>
                  <span className="text-red-400 font-medium">Caution:</span>{' '}
                  {sectors.filter(s => allMetrics[s.id]?.signal === 'Sell').map(s => s.name).join(', ')} may be overheated — consider taking profits if you have significant holdings.
                </p>
              )}
              <p>
                <span className="text-yellow-400 font-medium">Strategy:</span>{' '}
                Rotate from overheated sectors into undervalued ones. Use the seasonality guide for sport-specific timing windows.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
