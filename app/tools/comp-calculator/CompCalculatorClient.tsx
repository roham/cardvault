'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

/* ─── Types ────────────────────────────────────────── */
interface CardLite {
  slug: string;
  name: string;
  year: number;
  set: string;
  sport: string;
  player: string;
  valueRaw: number;
  valueGem: number;
  rawLabel: string;
  gemLabel: string;
  rookie: boolean;
}

interface CompStats {
  count: number;
  min: number;
  max: number;
  median: number;
  avg: number;
  p25: number;
  p75: number;
  fairLow: number;
  fairHigh: number;
  confidence: 'High' | 'Medium' | 'Low';
}

type FilterMode = 'same-sport' | 'same-decade' | 'same-tier' | 'rookies-only';

/* ─── Helpers ──────────────────────────────────────── */
function parseValue(v: string): number {
  const m = v.match(/\$([0-9,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
}

function formatMoney(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 10_000) return `$${(n / 1000).toFixed(1)}K`;
  if (n >= 1000) return `$${Math.round(n).toLocaleString()}`;
  return `$${Math.round(n)}`;
}

function median(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function percentile(arr: number[], p: number): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.floor((p / 100) * (sorted.length - 1));
  return sorted[idx];
}

function tierBucket(v: number): number {
  if (v < 5) return 0;
  if (v < 25) return 1;
  if (v < 100) return 2;
  if (v < 500) return 3;
  if (v < 2500) return 4;
  if (v < 10000) return 5;
  return 6;
}

const sportEmoji: Record<string, string> = {
  baseball: '\u26be', basketball: '\ud83c\udfc0', football: '\ud83c\udfc8', hockey: '\ud83c\udfd2',
};

const sportColor: Record<string, string> = {
  baseball: 'text-red-400',
  basketball: 'text-orange-400',
  football: 'text-blue-400',
  hockey: 'text-cyan-400',
};

/* ─── Component ────────────────────────────────────── */
export default function CompCalculatorClient() {
  const [query, setQuery] = useState('');
  const [targetSlug, setTargetSlug] = useState<string | null>(null);
  const [filters, setFilters] = useState<Record<FilterMode, boolean>>({
    'same-sport': true,
    'same-decade': true,
    'same-tier': false,
    'rookies-only': false,
  });
  const [userPrice, setUserPrice] = useState<string>('');
  const [gemMode, setGemMode] = useState<boolean>(false);

  // Build searchable index
  const allCards = useMemo<CardLite[]>(() => {
    return sportsCards.map((c: typeof sportsCards[number]) => ({
      slug: c.slug,
      name: c.name,
      year: c.year,
      set: c.set,
      sport: c.sport,
      player: c.player,
      valueRaw: parseValue(c.estimatedValueRaw),
      valueGem: parseValue(c.estimatedValueGem),
      rawLabel: c.estimatedValueRaw,
      gemLabel: c.estimatedValueGem,
      rookie: c.rookie,
    }));
  }, []);

  // Search suggestions
  const suggestions = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    return allCards
      .filter(c => c.name.toLowerCase().includes(q) || c.player.toLowerCase().includes(q))
      .slice(0, 12);
  }, [query, allCards]);

  const target = useMemo(() => {
    if (!targetSlug) return null;
    return allCards.find(c => c.slug === targetSlug) || null;
  }, [targetSlug, allCards]);

  // Build comp list
  const comps = useMemo<CardLite[]>(() => {
    if (!target) return [];
    const targetValue = gemMode ? target.valueGem : target.valueRaw;
    const targetDecade = Math.floor(target.year / 10) * 10;
    const targetTier = tierBucket(targetValue);

    return allCards.filter(c => {
      if (c.slug === target.slug) return false;
      const value = gemMode ? c.valueGem : c.valueRaw;
      if (value <= 0) return false;
      if (filters['same-sport'] && c.sport !== target.sport) return false;
      if (filters['same-decade']) {
        const decade = Math.floor(c.year / 10) * 10;
        if (decade !== targetDecade) return false;
      }
      if (filters['same-tier']) {
        if (tierBucket(value) !== targetTier) return false;
      }
      if (filters['rookies-only'] && !c.rookie) return false;
      return true;
    });
  }, [target, allCards, filters, gemMode]);

  const stats = useMemo<CompStats | null>(() => {
    if (!target || comps.length === 0) return null;
    const values = comps.map(c => (gemMode ? c.valueGem : c.valueRaw)).filter(v => v > 0);
    if (values.length === 0) return null;
    const med = median(values);
    const avg = values.reduce((s, v) => s + v, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const p25 = percentile(values, 25);
    const p75 = percentile(values, 75);
    const conf: CompStats['confidence'] =
      values.length >= 20 ? 'High' : values.length >= 8 ? 'Medium' : 'Low';
    return {
      count: values.length,
      min,
      max,
      median: med,
      avg,
      p25,
      p75,
      fairLow: med * 0.75,
      fairHigh: med * 1.25,
      confidence: conf,
    };
  }, [target, comps, gemMode]);

  const verdict = useMemo(() => {
    const price = parseFloat(userPrice);
    if (!stats || !userPrice || isNaN(price) || price <= 0) return null;
    const pct = (price / stats.median) * 100;
    if (pct < 75) return { label: 'UNDERPRICED', color: 'text-emerald-400', bg: 'bg-emerald-950/40 border-emerald-800/50', tip: 'Below the fair range — strong buy if condition checks out.' };
    if (pct <= 125) return { label: 'FAIR', color: 'text-sky-400', bg: 'bg-sky-950/40 border-sky-800/50', tip: 'Within 25% of median — reasonable price either way.' };
    if (pct <= 175) return { label: 'OVERPRICED', color: 'text-amber-400', bg: 'bg-amber-950/40 border-amber-800/50', tip: 'Above the fair range — negotiate down or wait for a better deal.' };
    return { label: 'WELL ABOVE MARKET', color: 'text-red-400', bg: 'bg-red-950/40 border-red-800/50', tip: 'More than 75% above median — avoid unless you know something the market doesn\u2019t.' };
  }, [userPrice, stats]);

  const sortedComps = useMemo(() => {
    if (!target) return [];
    const targetValue = gemMode ? target.valueGem : target.valueRaw;
    return [...comps]
      .map(c => ({ c, diff: Math.abs((gemMode ? c.valueGem : c.valueRaw) - targetValue) }))
      .sort((a, b) => a.diff - b.diff)
      .slice(0, 50)
      .map(x => x.c);
  }, [comps, target, gemMode]);

  const handleSelect = useCallback((slug: string) => {
    setTargetSlug(slug);
    setQuery('');
    setUserPrice('');
  }, []);

  const toggleFilter = useCallback((key: FilterMode) => {
    setFilters(f => ({ ...f, [key]: !f[key] }));
  }, []);

  const reset = useCallback(() => {
    setTargetSlug(null);
    setQuery('');
    setUserPrice('');
  }, []);

  const popular = [
    { slug: allCards.find(c => c.player === 'Mike Trout' && c.rookie)?.slug, label: 'Mike Trout RC' },
    { slug: allCards.find(c => c.player === 'LeBron James' && c.rookie)?.slug, label: 'LeBron James RC' },
    { slug: allCards.find(c => c.player === 'Patrick Mahomes' && c.rookie)?.slug, label: 'Patrick Mahomes RC' },
    { slug: allCards.find(c => c.player === 'Connor McDavid' && c.rookie)?.slug, label: 'Connor McDavid RC' },
    { slug: allCards.find(c => c.player === 'Shohei Ohtani' && c.rookie)?.slug, label: 'Shohei Ohtani RC' },
  ].filter(p => p.slug) as { slug: string; label: string }[];

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search any card (e.g., Trout, Mahomes, 2018 Prizm Luka)..."
          className="w-full bg-gray-800/60 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-sky-500 focus:outline-none text-sm"
        />
        {suggestions.length > 0 && !targetSlug && (
          <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 rounded-xl shadow-lg max-h-80 overflow-y-auto">
            {suggestions.map(c => (
              <button key={c.slug} onClick={() => handleSelect(c.slug)}
                className="w-full text-left px-4 py-2.5 hover:bg-gray-700/60 transition-colors flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="text-white font-medium truncate">{c.name}</div>
                  <div className="text-xs text-gray-500 truncate">
                    <span className={sportColor[c.sport] || 'text-gray-400'}>{sportEmoji[c.sport] || ''} {c.player}</span>
                    {c.rookie && <span className="ml-2 text-yellow-400">RC</span>}
                  </div>
                </div>
                <div className="text-right ml-4 shrink-0">
                  <div className="text-sm font-bold text-white">{formatMoney(c.valueRaw)}</div>
                  <div className="text-xs text-gray-500">raw</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Popular cards */}
      {!target && popular.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Try a popular rookie</h3>
          <div className="flex flex-wrap gap-2">
            {popular.map(p => (
              <button key={p.slug} onClick={() => handleSelect(p.slug)}
                className="px-3 py-1.5 bg-gray-800/60 border border-gray-700/40 rounded-lg text-sm text-gray-300 hover:text-white hover:border-sky-500/50 transition-colors">
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Target + analysis */}
      {target && (
        <>
          {/* Target card header */}
          <div className="bg-gradient-to-r from-sky-950/50 to-indigo-950/30 border border-sky-800/40 rounded-xl p-5">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{sportEmoji[target.sport] || ''}</span>
                  <span className={`text-xs uppercase tracking-wide ${sportColor[target.sport] || 'text-gray-400'}`}>
                    {target.sport} &middot; {target.year}
                  </span>
                  {target.rookie && <span className="text-[10px] bg-yellow-600/30 text-yellow-400 px-1.5 py-0.5 rounded">RC</span>}
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white truncate">{target.name}</h2>
                <p className="text-sm text-gray-400 mt-1">{target.player} &middot; {target.set}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-white">{formatMoney(gemMode ? target.valueGem : target.valueRaw)}</div>
                <div className="text-xs text-gray-500">{gemMode ? 'PSA 10 estimate' : 'raw estimate'}</div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={`/sports/${target.slug}`} className="text-xs px-3 py-1.5 bg-gray-800/60 border border-gray-700/40 rounded-lg text-sky-400 hover:text-sky-300">
                View full card page &rarr;
              </Link>
              <button onClick={reset}
                className="text-xs px-3 py-1.5 bg-gray-800/60 border border-gray-700/40 rounded-lg text-gray-400 hover:text-white">
                Pick a different card
              </button>
            </div>
          </div>

          {/* Filter controls */}
          <div className="bg-gray-800/40 border border-gray-700/40 rounded-xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <h3 className="text-sm font-bold text-white">Comp Filters</h3>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-400">Price basis:</span>
                <button onClick={() => setGemMode(false)}
                  className={`px-2 py-1 rounded ${!gemMode ? 'bg-sky-600 text-white' : 'bg-gray-700/50 text-gray-400 hover:text-white'}`}>Raw</button>
                <button onClick={() => setGemMode(true)}
                  className={`px-2 py-1 rounded ${gemMode ? 'bg-sky-600 text-white' : 'bg-gray-700/50 text-gray-400 hover:text-white'}`}>PSA 10</button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {([
                { k: 'same-sport' as FilterMode, label: `Same sport (${target.sport})` },
                { k: 'same-decade' as FilterMode, label: `Same decade (${Math.floor(target.year / 10) * 10}s)` },
                { k: 'same-tier' as FilterMode, label: 'Same value tier' },
                { k: 'rookies-only' as FilterMode, label: 'Rookies only' },
              ]).map(f => (
                <button key={f.k} onClick={() => toggleFilter(f.k)}
                  className={`text-xs px-3 py-2 rounded-lg border transition-colors text-left ${
                    filters[f.k]
                      ? 'bg-sky-600/20 border-sky-500/50 text-sky-300'
                      : 'bg-gray-900/40 border-gray-700/40 text-gray-400 hover:text-white'
                  }`}>
                  <span className="mr-1">{filters[f.k] ? '\u2713' : ''}</span>{f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          {stats ? (
            <>
              <div className="bg-gray-800/40 border border-gray-700/40 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white">Comp Stats &middot; {stats.count} comparable cards</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    stats.confidence === 'High' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50' :
                    stats.confidence === 'Medium' ? 'bg-sky-950/60 text-sky-400 border border-sky-800/50' :
                    'bg-amber-950/60 text-amber-400 border border-amber-800/50'
                  }`}>{stats.confidence} confidence</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="bg-gray-900/40 border border-gray-700/30 rounded-lg p-3 text-center">
                    <div className="text-lg font-black text-white">{formatMoney(stats.min)}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wide">Min</div>
                  </div>
                  <div className="bg-gray-900/40 border border-gray-700/30 rounded-lg p-3 text-center">
                    <div className="text-lg font-black text-sky-400">{formatMoney(stats.p25)}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wide">25th %ile</div>
                  </div>
                  <div className="bg-sky-950/40 border border-sky-800/50 rounded-lg p-3 text-center">
                    <div className="text-xl font-black text-sky-300">{formatMoney(stats.median)}</div>
                    <div className="text-[10px] text-sky-400 uppercase tracking-wide">Median</div>
                  </div>
                  <div className="bg-gray-900/40 border border-gray-700/30 rounded-lg p-3 text-center">
                    <div className="text-lg font-black text-sky-400">{formatMoney(stats.p75)}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wide">75th %ile</div>
                  </div>
                  <div className="bg-gray-900/40 border border-gray-700/30 rounded-lg p-3 text-center">
                    <div className="text-lg font-black text-white">{formatMoney(stats.max)}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wide">Max</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-700/40 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-gray-500">Fair range (median &plusmn;25%)</div>
                    <div className="text-white font-bold">{formatMoney(stats.fairLow)} &ndash; {formatMoney(stats.fairHigh)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Average</div>
                    <div className="text-white font-bold">{formatMoney(stats.avg)}</div>
                  </div>
                </div>
              </div>

              {/* Price verdict */}
              <div className="bg-gray-800/40 border border-gray-700/40 rounded-xl p-5">
                <h3 className="text-sm font-bold text-white mb-3">Check a price</h3>
                <div className="flex flex-wrap gap-3 items-center">
                  <div className="flex-1 min-w-[200px]">
                    <label className="text-xs text-gray-500 block mb-1">Your ask or offer (USD)</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      value={userPrice}
                      onChange={e => setUserPrice(e.target.value)}
                      placeholder="e.g. 150"
                      className="w-full bg-gray-900/60 border border-gray-700/50 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-sky-500 focus:outline-none text-sm"
                    />
                  </div>
                  {verdict && (
                    <div className={`flex-1 min-w-[240px] rounded-lg border p-3 ${verdict.bg}`}>
                      <div className={`text-base font-black ${verdict.color}`}>{verdict.label}</div>
                      <div className="text-xs text-gray-400 mt-1">{verdict.tip}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        vs median {formatMoney(stats.median)} &middot; {((parseFloat(userPrice) / stats.median) * 100).toFixed(0)}% of market
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Comp list */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-white">Closest Comps</h3>
                  <span className="text-xs text-gray-500">Showing {Math.min(sortedComps.length, 50)} of {stats.count}</span>
                </div>
                <div className="space-y-2">
                  {sortedComps.map((card, i) => {
                    const value = gemMode ? card.valueGem : card.valueRaw;
                    return (
                      <Link key={card.slug} href={`/sports/${card.slug}`}
                        className="flex items-center justify-between bg-gray-800/40 border border-gray-700/30 rounded-lg px-4 py-3 hover:border-sky-500/50 transition-colors group">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 w-6 shrink-0">{i + 1}.</span>
                            <span className="text-white text-sm font-medium group-hover:text-sky-400 truncate">{card.name}</span>
                            {card.rookie && <span className="text-[10px] bg-yellow-600/30 text-yellow-400 px-1.5 py-0.5 rounded shrink-0">RC</span>}
                          </div>
                          <div className="text-xs text-gray-500 ml-8 truncate">
                            <span className={sportColor[card.sport] || 'text-gray-400'}>{sportEmoji[card.sport] || ''}</span>
                            <span className="ml-1">{card.player} &middot; {card.year} {card.set}</span>
                          </div>
                        </div>
                        <div className="text-right ml-4 shrink-0">
                          <div className="text-sm font-bold text-white">{formatMoney(value)}</div>
                          <div className="text-xs text-gray-500">{gemMode ? 'PSA 10' : 'raw'}</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-5 text-center">
              <div className="text-base font-bold text-amber-400 mb-1">No comps match these filters</div>
              <div className="text-sm text-gray-400">Loosen your filters &mdash; try turning off &quot;Same value tier&quot; or &quot;Rookies only&quot;.</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
