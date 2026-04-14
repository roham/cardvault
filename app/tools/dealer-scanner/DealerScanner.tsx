'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import { sportsCards, type SportsCard } from '@/data/sports-cards';
import { getGradePricing } from '@/data/grade-pricing';

// Grade multipliers (approximate market premiums over raw)
const GRADE_MULTIPLIERS: Record<number, number> = {
  1: 0.3, 2: 0.4, 3: 0.5, 4: 0.6, 5: 0.7,
  6: 0.85, 7: 1.1, 8: 1.5, 9: 2.5, 10: 5.0,
};

function parsePrice(val: string): number {
  const match = val.replace(/,/g, '').match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
}

function formatPrice(val: number): string {
  if (val >= 1000) return `$${val.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  if (val >= 10) return `$${val.toFixed(0)}`;
  return `$${val.toFixed(2)}`;
}

function getEstimatedGradePrice(card: SportsCard, grade: number): string {
  const pricing = getGradePricing(card.slug);
  if (pricing) {
    const row = pricing.grades.find(g => g.grade === grade);
    if (row) return row.estimatedValue;
  }
  // Fallback: multiply raw price by grade multiplier
  const rawPrice = parsePrice(card.estimatedValueRaw);
  if (!rawPrice) return '—';
  const mult = GRADE_MULTIPLIERS[grade] || 1;
  const estimated = rawPrice * mult;
  return formatPrice(estimated);
}

function getQuickSpread(card: SportsCard): { raw: string; psa8: string; psa9: string; psa10: string } {
  return {
    raw: card.estimatedValueRaw,
    psa8: getEstimatedGradePrice(card, 8),
    psa9: getEstimatedGradePrice(card, 9),
    psa10: card.estimatedValueGem,
  };
}

interface ScanResult {
  card: SportsCard;
  spread: ReturnType<typeof getQuickSpread>;
  addedAt: number;
}

type ViewMode = 'scan' | 'batch';
type SortBy = 'name' | 'value-high' | 'value-low' | 'recent';

export default function DealerScanner() {
  const [query, setQuery] = useState('');
  const [sport, setSport] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('scan');
  const [batchList, setBatchList] = useState<ScanResult[]>([]);
  const [sortBy, setSortBy] = useState<SortBy>('recent');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input on mount (mobile usability)
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  // Instant search results (debounce not needed — filter is fast enough for 3,500 cards)
  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return sportsCards
      .filter(card => {
        const matchesSport = !sport || card.sport === sport;
        if (!matchesSport) return false;
        return (
          card.player.toLowerCase().includes(q) ||
          card.name.toLowerCase().includes(q) ||
          card.set.toLowerCase().includes(q) ||
          card.cardNumber.toLowerCase().includes(q)
        );
      })
      .slice(0, 20); // Cap at 20 for speed
  }, [query, sport]);

  const addToBatch = useCallback((card: SportsCard) => {
    setBatchList(prev => {
      if (prev.some(r => r.card.slug === card.slug)) return prev;
      return [{ card, spread: getQuickSpread(card), addedAt: Date.now() }, ...prev];
    });
  }, []);

  const removeFromBatch = useCallback((slug: string) => {
    setBatchList(prev => prev.filter(r => r.card.slug !== slug));
  }, []);

  const clearBatch = useCallback(() => {
    setBatchList([]);
  }, []);

  const sortedBatch = useMemo(() => {
    const list = [...batchList];
    switch (sortBy) {
      case 'name':
        return list.sort((a, b) => a.card.player.localeCompare(b.card.player));
      case 'value-high':
        return list.sort((a, b) => parsePrice(b.card.estimatedValueRaw) - parsePrice(a.card.estimatedValueRaw));
      case 'value-low':
        return list.sort((a, b) => parsePrice(a.card.estimatedValueRaw) - parsePrice(b.card.estimatedValueRaw));
      case 'recent':
      default:
        return list.sort((a, b) => b.addedAt - a.addedAt);
    }
  }, [batchList, sortBy]);

  const batchTotal = useMemo(() => {
    return batchList.reduce((sum, r) => sum + parsePrice(r.card.estimatedValueRaw), 0);
  }, [batchList]);

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setViewMode('scan')}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
            viewMode === 'scan'
              ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/30'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Quick Scan
        </button>
        <button
          onClick={() => setViewMode('batch')}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all relative ${
            viewMode === 'batch'
              ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/30'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Batch Mode
          {batchList.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {batchList.length}
            </span>
          )}
        </button>
      </div>

      {/* Search Bar — large touch target for mobile */}
      <div className="space-y-3">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type player name, card, or set..."
            className="w-full bg-gray-900 border-2 border-gray-700 focus:border-orange-500 rounded-2xl px-5 py-4 text-white text-lg placeholder:text-gray-500 outline-none transition-colors"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          {query && (
            <button
              onClick={() => { setQuery(''); inputRef.current?.focus(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-full text-gray-400 transition-colors"
              aria-label="Clear search"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          )}
        </div>

        {/* Sport Filter — horizontal scroll for mobile */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {[
            { value: '', label: 'All', emoji: '🃏' },
            { value: 'baseball', label: 'MLB', emoji: '⚾' },
            { value: 'basketball', label: 'NBA', emoji: '🏀' },
            { value: 'football', label: 'NFL', emoji: '🏈' },
            { value: 'hockey', label: 'NHL', emoji: '🏒' },
          ].map(s => (
            <button
              key={s.value}
              onClick={() => setSport(s.value)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                sport === s.value
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <span>{s.emoji}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {query.trim() && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-gray-500 text-xs font-medium">
              {results.length === 0 ? 'No results' : `${results.length}${results.length === 20 ? '+' : ''} results`}
            </span>
            {viewMode === 'scan' && results.length > 0 && (
              <span className="text-gray-600 text-xs">Tap card for full grade breakdown</span>
            )}
          </div>

          <div className="space-y-2">
            {results.map(card => {
              const spread = getQuickSpread(card);
              const isExpanded = expandedCard === card.slug;
              const inBatch = batchList.some(r => r.card.slug === card.slug);

              return (
                <div
                  key={card.slug}
                  className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden transition-all"
                >
                  {/* Main card row — tappable */}
                  <button
                    onClick={() => setExpandedCard(isExpanded ? null : card.slug)}
                    className="w-full text-left p-4 hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-semibold text-sm truncate">{card.player}</span>
                          {card.rookie && (
                            <span className="flex-shrink-0 text-[10px] font-bold bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">RC</span>
                          )}
                        </div>
                        <p className="text-gray-500 text-xs truncate">{card.year} {card.set} #{card.cardNumber}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-orange-400 font-bold text-sm">{spread.raw}</div>
                        <div className="text-gray-500 text-[10px]">RAW</div>
                      </div>
                    </div>

                    {/* Quick spread row */}
                    <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-800/50">
                      <div className="text-center">
                        <div className="text-gray-500 text-[10px] font-medium">PSA 8</div>
                        <div className="text-gray-300 text-xs font-semibold">{spread.psa8}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-500 text-[10px] font-medium">PSA 9</div>
                        <div className="text-gray-300 text-xs font-semibold">{spread.psa9}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-emerald-500 text-[10px] font-medium">PSA 10</div>
                        <div className="text-emerald-400 text-xs font-semibold">{spread.psa10}</div>
                      </div>
                    </div>
                  </button>

                  {/* Expanded: full grade table + actions */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-800">
                      {/* Full grade breakdown */}
                      <div className="grid grid-cols-5 gap-1 mt-3 mb-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(grade => {
                          const price = getEstimatedGradePrice(card, grade);
                          return (
                            <div key={grade} className={`text-center py-2 rounded-lg ${
                              grade >= 9 ? 'bg-emerald-950/40' : grade >= 7 ? 'bg-gray-800/60' : 'bg-gray-800/30'
                            }`}>
                              <div className={`text-[10px] font-medium ${grade >= 9 ? 'text-emerald-500' : 'text-gray-500'}`}>
                                PSA {grade}
                              </div>
                              <div className={`text-[11px] font-semibold ${grade >= 9 ? 'text-emerald-400' : 'text-gray-300'}`}>
                                {price}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        {viewMode === 'batch' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); addToBatch(card); }}
                            disabled={inBatch}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                              inBatch
                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                : 'bg-orange-600 hover:bg-orange-500 text-white'
                            }`}
                          >
                            {inBatch ? 'In Batch' : '+ Add to Batch'}
                          </button>
                        )}
                        <a
                          href={card.ebaySearchUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gray-800 hover:bg-gray-700 text-gray-300 text-center transition-colors"
                        >
                          eBay Comps
                        </a>
                        <Link
                          href={`/sports/${card.slug}`}
                          onClick={e => e.stopPropagation()}
                          className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gray-800 hover:bg-gray-700 text-gray-300 text-center transition-colors"
                        >
                          Full Page
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Batch Summary Panel */}
      {viewMode === 'batch' && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-bold text-sm">Batch Summary</h3>
              <div className="flex items-center gap-3">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as SortBy)}
                  className="bg-gray-800 border border-gray-700 text-gray-300 text-xs rounded-lg px-2 py-1.5 outline-none"
                >
                  <option value="recent">Most Recent</option>
                  <option value="name">By Name</option>
                  <option value="value-high">Value: High to Low</option>
                  <option value="value-low">Value: Low to High</option>
                </select>
                {batchList.length > 0 && (
                  <button
                    onClick={clearBatch}
                    className="text-red-400 hover:text-red-300 text-xs font-medium transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-xs">{batchList.length} card{batchList.length !== 1 ? 's' : ''} scanned</span>
              <span className="text-orange-400 font-bold text-lg">{formatPrice(batchTotal)} <span className="text-gray-500 text-xs font-normal">raw total</span></span>
            </div>
          </div>

          {batchList.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-600 text-4xl mb-3">📦</div>
              <p className="text-gray-500 text-sm">Search for cards above and tap &ldquo;+ Add to Batch&rdquo; to build your pricing list.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800/50">
              {sortedBatch.map(({ card, spread }) => (
                <div key={card.slug} className="flex items-center justify-between px-4 py-3 hover:bg-gray-800/30 transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm font-medium truncate">{card.player}</span>
                      {card.rookie && (
                        <span className="text-[10px] font-bold bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">RC</span>
                      )}
                    </div>
                    <p className="text-gray-500 text-xs truncate">{card.year} {card.set}</p>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-orange-400 font-semibold text-sm">{spread.raw}</div>
                      <div className="text-gray-600 text-[10px]">
                        9: {spread.psa9} &middot; 10: {spread.psa10}
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromBatch(card.slug)}
                      className="w-7 h-7 flex items-center justify-center bg-gray-800 hover:bg-red-900/50 rounded-lg text-gray-500 hover:text-red-400 transition-colors"
                      aria-label={`Remove ${card.player}`}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quick Reference: Grade Multiplier Chart */}
      {!query.trim() && viewMode === 'scan' && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <h3 className="text-white font-bold text-sm mb-4">Quick Reference: Grade Multipliers</h3>
          <p className="text-gray-500 text-xs mb-4">
            Approximate market premiums over raw price. Use for ballpark estimates when exact comps aren&apos;t available.
          </p>
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(GRADE_MULTIPLIERS).map(([grade, mult]) => (
              <div key={grade} className={`text-center py-3 rounded-xl ${
                parseInt(grade) >= 9 ? 'bg-emerald-950/40 border border-emerald-900/30' :
                parseInt(grade) >= 7 ? 'bg-gray-800/60' : 'bg-gray-800/30'
              }`}>
                <div className={`text-xs font-medium mb-1 ${
                  parseInt(grade) >= 9 ? 'text-emerald-500' : 'text-gray-500'
                }`}>
                  PSA {grade}
                </div>
                <div className={`text-sm font-bold ${
                  parseInt(grade) >= 9 ? 'text-emerald-400' : 'text-gray-300'
                }`}>
                  {mult}x
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-amber-950/20 border border-amber-800/30 rounded-xl px-4 py-3">
            <p className="text-amber-300/80 text-xs">
              <strong className="font-semibold">Dealer tip:</strong> At card shows, most buyers expect 10-20% below eBay comps for instant cash purchases. Price your inventory at eBay minus 15% for quick turnover. High-demand rookies hold full comp value.
            </p>
          </div>
        </div>
      )}

      {/* Empty state — dealer tips */}
      {!query.trim() && viewMode === 'scan' && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <h3 className="text-white font-bold text-sm mb-3">Dealer Quick Start</h3>
          <div className="space-y-3 text-sm text-gray-400">
            <div className="flex items-start gap-3">
              <span className="text-orange-400 font-bold text-lg">1</span>
              <div>
                <p className="text-white font-medium">Quick Scan mode</p>
                <p className="text-gray-500 text-xs">Type a player name, instantly see raw + graded pricing. Tap any card for full PSA 1-10 breakdown.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-orange-400 font-bold text-lg">2</span>
              <div>
                <p className="text-white font-medium">Batch Mode</p>
                <p className="text-gray-500 text-xs">Switch to Batch, add cards as you price a stack. See running total and export your pricing list.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-orange-400 font-bold text-lg">3</span>
              <div>
                <p className="text-white font-medium">Verify on eBay</p>
                <p className="text-gray-500 text-xs">Tap &ldquo;eBay Comps&rdquo; on any card to open a pre-filtered sold listings search for real market data.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
