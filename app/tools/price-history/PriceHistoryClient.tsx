'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { sportsCards, SportsCard } from '@/data/sports-cards';

// ─── Constants ──────────────────────────────────────────────────────

const STORAGE_KEY = 'cardvault-price-history';

const QUICK_PICK_PLAYERS = ['Michael Jordan', 'Mike Trout', 'Victor Wembanyama', 'Tom Brady', 'Wayne Gretzky'];

const sportIcons: Record<string, string> = {
  baseball: '⚾',
  basketball: '🏀',
  football: '🏈',
  hockey: '🏒',
};

type TimeRange = '7D' | '30D' | '90D';
type GradeMode = 'raw' | 'psa10';

// ─── Price Parsing ──────────────────────────────────────────────────

function parsePrice(str: string): number {
  const cleaned = str.replace(/,/g, '');
  // Match dollar amounts — take the first one as the low estimate
  const match = cleaned.match(/\$?([\d.]+)/);
  if (!match) return 0;
  let val = parseFloat(match[1]);
  // Handle M/K suffixes that may appear
  if (cleaned.includes('M')) val *= 1000000;
  return val;
}

function formatCurrency(n: number): string {
  if (n >= 1000000) return '$' + (n / 1000000).toFixed(2) + 'M';
  if (n >= 10000) return '$' + (n / 1000).toFixed(1) + 'K';
  if (n >= 1000) return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });
  if (n >= 1) return '$' + n.toFixed(2);
  return '$' + n.toFixed(2);
}

function formatChange(n: number): string {
  const prefix = n >= 0 ? '+' : '';
  return prefix + formatCurrency(Math.abs(n));
}

function formatPercent(n: number): string {
  const prefix = n >= 0 ? '+' : '';
  return prefix + n.toFixed(1) + '%';
}

// ─── Deterministic Hash ─────────────────────────────────────────────

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

// ─── Price Simulation ───────────────────────────────────────────────

function generatePriceHistory(slug: string, basePrice: number): number[] {
  const prices: number[] = [];
  const slugHash = simpleHash(slug);
  // Slight long-term trend bias per card: range roughly -0.06 to +0.06 per day
  const trendBias = ((slugHash % 100) - 40) / 1000;
  let cumulative = 0;

  for (let day = 0; day < 90; day++) {
    const dayStr = slug + ':' + day;
    const dayHash = simpleHash(dayStr);
    // Daily variation: -10% to +10% but divided by 100 for smoothness
    const dailyVariation = ((dayHash % 200) - 100) / 1000;
    // Combine trend + daily noise, with momentum dampening
    cumulative += dailyVariation * 0.3 + trendBias * 0.05;
    // Clamp cumulative to prevent extreme drift
    cumulative = Math.max(-0.4, Math.min(0.6, cumulative));
    const price = basePrice * (1 + cumulative);
    prices.push(Math.round(price * 100) / 100);
  }

  return prices;
}

// ─── SVG Chart ──────────────────────────────────────────────────────

interface ChartProps {
  prices: number[];
  timeRange: TimeRange;
}

function PriceChart({ prices, timeRange }: ChartProps) {
  const rangeMap: Record<TimeRange, number> = { '7D': 7, '30D': 30, '90D': 90 };
  const days = rangeMap[timeRange];
  const sliced = prices.slice(prices.length - days);

  const min = Math.min(...sliced);
  const max = Math.max(...sliced);
  const range = max - min || max * 0.01 || 1;

  const isUp = sliced[sliced.length - 1] >= sliced[0];

  // Chart dimensions
  const chartW = 400;
  const chartH = 200;
  const padL = 60;
  const padR = 16;
  const padT = 16;
  const padB = 32;
  const innerW = chartW - padL - padR;
  const innerH = chartH - padT - padB;

  // Generate points
  const points = sliced.map((p, i) => {
    const x = padL + (i / (sliced.length - 1)) * innerW;
    const y = padT + innerH - ((p - min) / range) * innerH;
    return { x, y, price: p };
  });

  const linePoints = points.map(p => `${p.x},${p.y}`).join(' ');

  // Fill polygon — close at the bottom
  const fillPoints = [
    ...points.map(p => `${p.x},${p.y}`),
    `${points[points.length - 1].x},${padT + innerH}`,
    `${points[0].x},${padT + innerH}`,
  ].join(' ');

  // Y-axis labels (5 ticks)
  const yTicks = Array.from({ length: 5 }, (_, i) => {
    const val = min + (range * i) / 4;
    const y = padT + innerH - (i / 4) * innerH;
    return { val, y };
  });

  // X-axis labels
  const now = new Date();
  const xLabels: { label: string; x: number }[] = [];
  if (timeRange === '90D') {
    for (let m = 2; m >= 0; m--) {
      const d = new Date(now);
      d.setMonth(d.getMonth() - m);
      const label = d.toLocaleString('en-US', { month: 'short' });
      const dayOffset = 90 - m * 30;
      const x = padL + ((dayOffset - 1) / 89) * innerW;
      xLabels.push({ label, x: Math.min(x, padL + innerW) });
    }
  } else if (timeRange === '30D') {
    for (let w = 4; w >= 0; w--) {
      const d = new Date(now);
      d.setDate(d.getDate() - w * 7);
      const label = `${d.getMonth() + 1}/${d.getDate()}`;
      const x = padL + ((30 - w * 7) / 29) * innerW;
      xLabels.push({ label, x: Math.max(padL, Math.min(x, padL + innerW)) });
    }
  } else {
    for (let i = 0; i < 7; i += 2) {
      const d = new Date(now);
      d.setDate(d.getDate() - (6 - i));
      const label = `${d.getMonth() + 1}/${d.getDate()}`;
      const x = padL + (i / 6) * innerW;
      xLabels.push({ label, x });
    }
  }

  const strokeColor = isUp ? '#34d399' : '#f87171';
  const gradientId = isUp ? 'gradUp' : 'gradDown';
  const gradientStart = isUp ? '#34d39940' : '#f8717140';

  return (
    <svg
      viewBox={`0 0 ${chartW} ${chartH}`}
      className="w-full max-w-[500px] h-auto"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={gradientStart} />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {yTicks.map((tick, i) => (
        <line
          key={i}
          x1={padL}
          y1={tick.y}
          x2={padL + innerW}
          y2={tick.y}
          stroke="#374151"
          strokeWidth={0.5}
          strokeDasharray="4 4"
        />
      ))}

      {/* Fill area */}
      <polygon points={fillPoints} fill={`url(#${gradientId})`} />

      {/* Line */}
      <polyline
        points={linePoints}
        fill="none"
        stroke={strokeColor}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Start and end dots */}
      <circle cx={points[0].x} cy={points[0].y} r={3} fill={strokeColor} />
      <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r={3} fill={strokeColor} />

      {/* Y-axis labels */}
      {yTicks.map((tick, i) => (
        <text
          key={i}
          x={padL - 6}
          y={tick.y + 4}
          textAnchor="end"
          fill="#9ca3af"
          fontSize={10}
        >
          {formatCurrency(tick.val)}
        </text>
      ))}

      {/* X-axis labels */}
      {xLabels.map((label, i) => (
        <text
          key={i}
          x={label.x}
          y={chartH - 6}
          textAnchor="middle"
          fill="#9ca3af"
          fontSize={10}
        >
          {label.label}
        </text>
      ))}
    </svg>
  );
}

// ─── Stats Panel ────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  positive?: boolean | null;
}

function StatCard({ label, value, subValue, positive }: StatCardProps) {
  const color = positive === null ? 'text-white' : positive ? 'text-emerald-400' : 'text-red-400';
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-lg font-bold ${color}`}>{value}</div>
      {subValue && <div className={`text-sm ${color}`}>{subValue}</div>}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────

export default function PriceHistoryClient() {
  const [search, setSearch] = useState('');
  const [selectedCard, setSelectedCard] = useState<SportsCard | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('90D');
  const [gradeMode, setGradeMode] = useState<GradeMode>('raw');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Load recent searches from localStorage
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setRecentSearches(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  // Save recent searches
  const saveRecent = useCallback((slug: string) => {
    setRecentSearches(prev => {
      const updated = [slug, ...prev.filter(s => s !== slug)].slice(0, 5);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
      return updated;
    });
  }, []);

  // Card lookup map
  const cardMap = useMemo(() => {
    const map = new Map<string, SportsCard>();
    for (const c of sportsCards) map.set(c.slug, c);
    return map;
  }, []);

  // Search results
  const searchResults = useMemo(() => {
    if (search.length < 2) return [];
    const q = search.toLowerCase();
    return sportsCards
      .filter(c =>
        c.player.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.set.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [search]);

  // Quick picks
  const quickPicks = useMemo(() => {
    return QUICK_PICK_PLAYERS.map(player =>
      sportsCards.find(c => c.player === player)
    ).filter(Boolean) as SportsCard[];
  }, []);

  // Recent search cards
  const recentCards = useMemo(() => {
    return recentSearches
      .map(slug => cardMap.get(slug))
      .filter(Boolean) as SportsCard[];
  }, [recentSearches, cardMap]);

  // Select a card
  const selectCard = useCallback((card: SportsCard) => {
    setSelectedCard(card);
    setSearch('');
    setDropdownOpen(false);
    saveRecent(card.slug);
  }, [saveRecent]);

  // Price data for selected card
  const priceData = useMemo(() => {
    if (!selectedCard) return null;
    const baseRaw = parsePrice(selectedCard.estimatedValueRaw);
    const basePsa10 = parsePrice(selectedCard.estimatedValueGem);
    const base = gradeMode === 'psa10' ? basePsa10 : baseRaw;
    if (base <= 0) return null;

    const suffix = gradeMode === 'psa10' ? '-psa10' : '-raw';
    const prices = generatePriceHistory(selectedCard.slug + suffix, base);
    const current = prices[89];
    const day7 = prices[82];
    const day30 = prices[59];
    const day90 = prices[0];
    const high90 = Math.max(...prices);
    const low90 = Math.min(...prices);

    return {
      prices,
      current,
      change7: current - day7,
      change7Pct: day7 > 0 ? ((current - day7) / day7) * 100 : 0,
      change30: current - day30,
      change30Pct: day30 > 0 ? ((current - day30) / day30) * 100 : 0,
      change90: current - day90,
      change90Pct: day90 > 0 ? ((current - day90) / day90) * 100 : 0,
      high90,
      low90,
    };
  }, [selectedCard, gradeMode]);

  return (
    <div className="space-y-8">
      {/* ─── Search ──────────────────────────────────────── */}
      <div className="relative">
        <label htmlFor="card-search" className="block text-sm font-medium text-gray-300 mb-2">
          Search for a card
        </label>
        <input
          id="card-search"
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setDropdownOpen(true); }}
          onFocus={() => setDropdownOpen(true)}
          placeholder="Search by player, card name, or set..."
          className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
        {dropdownOpen && searchResults.length > 0 && (
          <div className="absolute z-20 mt-1 w-full bg-gray-900 border border-gray-700 rounded-lg shadow-xl max-h-80 overflow-y-auto">
            {searchResults.map(card => (
              <button
                key={card.slug}
                onClick={() => selectCard(card)}
                className="w-full text-left px-4 py-3 hover:bg-gray-800 transition-colors border-b border-gray-800 last:border-b-0"
              >
                <div className="text-white font-medium text-sm">{card.name}</div>
                <div className="text-gray-400 text-xs mt-0.5">
                  {sportIcons[card.sport]} {card.player} &middot; {card.set} &middot; Raw: {card.estimatedValueRaw}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ─── Quick Picks / Recent ────────────────────────── */}
      {!selectedCard && (
        <div className="space-y-6">
          {/* Quick Picks */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Popular Cards</h3>
            <div className="flex flex-wrap gap-2">
              {quickPicks.map(card => (
                <button
                  key={card.slug}
                  onClick={() => selectCard(card)}
                  className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-full text-sm text-gray-300 hover:border-cyan-500 hover:text-cyan-400 transition-colors"
                >
                  {sportIcons[card.sport]} {card.player}
                </button>
              ))}
            </div>
          </div>

          {/* Recent Searches */}
          {mounted && recentCards.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Recent Searches</h3>
              <div className="space-y-2">
                {recentCards.map(card => (
                  <button
                    key={card.slug}
                    onClick={() => selectCard(card)}
                    className="w-full text-left px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg hover:border-gray-600 transition-colors"
                  >
                    <span className="text-white text-sm font-medium">{card.name}</span>
                    <span className="text-gray-500 text-xs ml-2">{sportIcons[card.sport]} {card.player}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Selected Card + Chart ───────────────────────── */}
      {selectedCard && priceData && (
        <div className="space-y-6">
          {/* Card Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">{selectedCard.name}</h2>
              <p className="text-gray-400 text-sm mt-1">
                {sportIcons[selectedCard.sport]} {selectedCard.player} &middot; {selectedCard.set} &middot; {selectedCard.year}
              </p>
            </div>
            <button
              onClick={() => { setSelectedCard(null); setTimeRange('90D'); setGradeMode('raw'); }}
              className="text-gray-400 hover:text-white text-sm shrink-0 px-3 py-1 border border-gray-700 rounded-md hover:border-gray-500 transition-colors"
            >
              Change Card
            </button>
          </div>

          {/* Current Price Banner */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="text-sm text-gray-500 uppercase tracking-wider mb-1">
              Current {gradeMode === 'psa10' ? 'PSA 10' : 'Raw'} Price
            </div>
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl font-bold text-white">{formatCurrency(priceData.current)}</span>
              <span className={`text-lg font-semibold ${priceData.change90 >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {formatPercent(priceData.change90Pct)} (90d)
              </span>
            </div>
          </div>

          {/* Controls Row */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Time Range */}
            <div className="flex bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
              {(['7D', '30D', '90D'] as TimeRange[]).map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    timeRange === range
                      ? 'bg-cyan-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>

            {/* Grade Toggle */}
            <div className="flex bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
              <button
                onClick={() => setGradeMode('raw')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  gradeMode === 'raw'
                    ? 'bg-cyan-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                Raw
              </button>
              <button
                onClick={() => setGradeMode('psa10')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  gradeMode === 'psa10'
                    ? 'bg-cyan-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                PSA 10
              </button>
            </div>
          </div>

          {/* SVG Chart */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6 flex justify-center">
            <PriceChart prices={priceData.prices} timeRange={timeRange} />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatCard
              label="7-Day Change"
              value={formatPercent(priceData.change7Pct)}
              subValue={formatChange(priceData.change7)}
              positive={priceData.change7 >= 0}
            />
            <StatCard
              label="30-Day Change"
              value={formatPercent(priceData.change30Pct)}
              subValue={formatChange(priceData.change30)}
              positive={priceData.change30 >= 0}
            />
            <StatCard
              label="90-Day Change"
              value={formatPercent(priceData.change90Pct)}
              subValue={formatChange(priceData.change90)}
              positive={priceData.change90 >= 0}
            />
            <StatCard
              label="90-Day High"
              value={formatCurrency(priceData.high90)}
              positive={null}
            />
            <StatCard
              label="90-Day Low"
              value={formatCurrency(priceData.low90)}
              positive={null}
            />
            <StatCard
              label="Current Price"
              value={formatCurrency(priceData.current)}
              subValue={gradeMode === 'psa10' ? 'PSA 10 Grade' : 'Raw / Ungraded'}
              positive={null}
            />
          </div>

          {/* Related Links */}
          <div className="border-t border-gray-800 pt-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Related</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <Link
                href={`/sports/${selectedCard.slug}`}
                className="block p-4 bg-gray-900 border border-gray-800 rounded-lg hover:border-cyan-600 transition-colors"
              >
                <div className="font-semibold text-white text-sm">View Card Details</div>
                <div className="text-gray-400 text-xs mt-1">Full pricing, eBay links, and grading info</div>
              </Link>
              <Link
                href="/tools/grading-roi"
                className="block p-4 bg-gray-900 border border-gray-800 rounded-lg hover:border-cyan-600 transition-colors"
              >
                <div className="font-semibold text-white text-sm">Grading ROI Calculator</div>
                <div className="text-gray-400 text-xs mt-1">Is it worth grading this card?</div>
              </Link>
              <Link
                href="/tools/watchlist"
                className="block p-4 bg-gray-900 border border-gray-800 rounded-lg hover:border-cyan-600 transition-colors"
              >
                <div className="font-semibold text-white text-sm">Add to Watchlist</div>
                <div className="text-gray-400 text-xs mt-1">Track price trends and get alerts</div>
              </Link>
              <Link
                href="/tools/trade-evaluator"
                className="block p-4 bg-gray-900 border border-gray-800 rounded-lg hover:border-cyan-600 transition-colors"
              >
                <div className="font-semibold text-white text-sm">Trade Evaluator</div>
                <div className="text-gray-400 text-xs mt-1">Is this trade fair? Find out instantly</div>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
