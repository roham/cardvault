'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { sportsCards, SportsCard } from '@/data/sports-cards';

function parsePrice(str: string): number {
  // Extract the first dollar amount from strings like "$500–$2,000 (PSA 8)"
  const match = str.replace(/,/g, '').match(/\$?([\d.]+)/);
  return match ? parseFloat(match[1]) : 0;
}

function parsePriceHigh(str: string): number {
  // Extract the highest dollar amount
  const matches = [...str.replace(/,/g, '').matchAll(/\$?([\d.]+)/g)];
  if (matches.length === 0) return 0;
  return Math.max(...matches.map(m => parseFloat(m[1])));
}

function formatCurrency(n: number): string {
  if (n >= 1000000) return '$' + (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return '$' + (n / 1000).toFixed(1) + 'K';
  return '$' + n.toLocaleString();
}

interface CollectionCard {
  slug: string;
  quantity: number;
  condition: 'raw' | 'graded';
}

const STORAGE_KEY = 'cardvault-collection-value';

export default function CollectionValueClient() {
  const [collection, setCollection] = useState<CollectionCard[]>([]);
  const [search, setSearch] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setCollection(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(collection));
    }
  }, [collection, mounted]);

  const searchResults = useMemo(() => {
    if (search.length < 2) return [];
    const q = search.toLowerCase();
    return sportsCards
      .filter(c => c.name.toLowerCase().includes(q) || c.player.toLowerCase().includes(q))
      .slice(0, 8);
  }, [search]);

  const cardMap = useMemo(() => {
    const map = new Map<string, SportsCard>();
    for (const c of sportsCards) map.set(c.slug, c);
    return map;
  }, []);

  const addCard = (slug: string) => {
    setCollection(prev => {
      const existing = prev.find(c => c.slug === slug);
      if (existing) {
        return prev.map(c => c.slug === slug ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { slug, quantity: 1, condition: 'raw' }];
    });
    setSearch('');
  };

  const removeCard = (slug: string) => {
    setCollection(prev => prev.filter(c => c.slug !== slug));
  };

  const updateQuantity = (slug: string, qty: number) => {
    if (qty <= 0) { removeCard(slug); return; }
    setCollection(prev => prev.map(c => c.slug === slug ? { ...c, quantity: qty } : c));
  };

  const toggleCondition = (slug: string) => {
    setCollection(prev => prev.map(c =>
      c.slug === slug ? { ...c, condition: c.condition === 'raw' ? 'graded' : 'raw' } : c
    ));
  };

  const clearAll = () => setCollection([]);

  // Calculate totals
  const totals = useMemo(() => {
    let rawLow = 0, rawHigh = 0, gradedLow = 0, gradedHigh = 0;
    for (const item of collection) {
      const card = cardMap.get(item.slug);
      if (!card) continue;
      const rl = parsePrice(card.estimatedValueRaw);
      const rh = parsePriceHigh(card.estimatedValueRaw);
      const gl = parsePrice(card.estimatedValueGem);
      const gh = parsePriceHigh(card.estimatedValueGem);
      if (item.condition === 'raw') {
        rawLow += rl * item.quantity;
        rawHigh += rh * item.quantity;
      } else {
        gradedLow += gl * item.quantity;
        gradedHigh += gh * item.quantity;
      }
    }
    return {
      rawLow, rawHigh, gradedLow, gradedHigh,
      totalLow: rawLow + gradedLow,
      totalHigh: rawHigh + gradedHigh,
      cardCount: collection.reduce((s, c) => s + c.quantity, 0),
      uniqueCards: collection.length,
    };
  }, [collection, cardMap]);

  // Share URL
  const shareCollection = () => {
    const data = collection.map(c => `${c.slug}:${c.quantity}:${c.condition}`).join(',');
    const encoded = btoa(data);
    const url = `${window.location.origin}/tools/collection-value?c=${encoded}`;
    navigator.clipboard.writeText(url);
    alert('Collection link copied to clipboard!');
  };

  // Load from URL on mount
  useEffect(() => {
    if (!mounted) return;
    const params = new URLSearchParams(window.location.search);
    const c = params.get('c');
    if (c) {
      try {
        const decoded = atob(c);
        const items = decoded.split(',').map(entry => {
          const [slug, qty, cond] = entry.split(':');
          return { slug, quantity: parseInt(qty) || 1, condition: (cond === 'graded' ? 'graded' : 'raw') as 'raw' | 'graded' };
        }).filter(item => cardMap.has(item.slug));
        if (items.length > 0) setCollection(items);
      } catch { /* ignore invalid URL data */ }
    }
  }, [mounted, cardMap]);

  const sportColors: Record<string, string> = {
    baseball: 'bg-red-900/40 text-red-400',
    basketball: 'bg-orange-900/40 text-orange-400',
    football: 'bg-blue-900/40 text-blue-400',
    hockey: 'bg-cyan-900/40 text-cyan-400',
  };

  if (!mounted) {
    return <div className="animate-pulse"><div className="h-64 bg-gray-800 rounded-2xl" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Value Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-gray-500 text-xs mb-1">Unique Cards</div>
          <div className="text-white text-2xl font-bold">{totals.uniqueCards}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-gray-500 text-xs mb-1">Total Cards</div>
          <div className="text-white text-2xl font-bold">{totals.cardCount}</div>
        </div>
        <div className="bg-gray-900 border border-emerald-800/30 rounded-xl p-4">
          <div className="text-gray-500 text-xs mb-1">Est. Value (Low)</div>
          <div className="text-emerald-400 text-2xl font-bold">{formatCurrency(totals.totalLow)}</div>
        </div>
        <div className="bg-gray-900 border border-amber-800/30 rounded-xl p-4">
          <div className="text-gray-500 text-xs mb-1">Est. Value (High)</div>
          <div className="text-amber-400 text-2xl font-bold">{formatCurrency(totals.totalHigh)}</div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search for a card to add (e.g. 'Griffey', '1986 Topps Jordan')"
          className="w-full bg-gray-900 border border-gray-700 focus:border-emerald-500 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 outline-none transition-colors"
        />
        {searchResults.length > 0 && (
          <div className="absolute z-10 top-full mt-1 w-full bg-gray-900 border border-gray-700 rounded-xl shadow-xl max-h-80 overflow-y-auto">
            {searchResults.map(card => (
              <button
                key={card.slug}
                onClick={() => addCard(card.slug)}
                className="w-full text-left px-4 py-3 hover:bg-gray-800 transition-colors border-b border-gray-800 last:border-0"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white text-sm font-medium">{card.name}</div>
                    <div className="text-gray-500 text-xs">{card.player} &middot; {card.set}</div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <div className="text-emerald-400 text-xs">{card.estimatedValueRaw}</div>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${sportColors[card.sport] || 'bg-gray-800 text-gray-400'}`}>
                      {card.sport}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Collection */}
      {collection.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 border-dashed rounded-xl p-10 text-center">
          <p className="text-gray-500 text-sm mb-2">Your collection is empty</p>
          <p className="text-gray-600 text-xs">Search for cards above to add them to your collection and see the total value.</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-white font-bold">Your Collection</h2>
            <div className="flex gap-2">
              <button
                onClick={shareCollection}
                className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg transition-colors"
              >
                Share
              </button>
              <button
                onClick={clearAll}
                className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-400 px-3 py-1.5 rounded-lg transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {collection.map(item => {
              const card = cardMap.get(item.slug);
              if (!card) return null;
              const val = item.condition === 'raw'
                ? { low: parsePrice(card.estimatedValueRaw), high: parsePriceHigh(card.estimatedValueRaw) }
                : { low: parsePrice(card.estimatedValueGem), high: parsePriceHigh(card.estimatedValueGem) };
              return (
                <div key={item.slug} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <Link href={`/sports/${card.slug}`} className="text-white text-sm font-medium hover:text-emerald-400 transition-colors line-clamp-1">
                      {card.name}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${sportColors[card.sport]}`}>{card.sport}</span>
                      <span className="text-gray-600 text-xs">{card.player}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleCondition(item.slug)}
                    className={`text-xs px-2 py-1 rounded-lg border transition-colors shrink-0 ${
                      item.condition === 'graded'
                        ? 'bg-amber-900/40 text-amber-400 border-amber-700/40'
                        : 'bg-gray-800 text-gray-400 border-gray-700'
                    }`}
                  >
                    {item.condition === 'graded' ? 'Graded' : 'Raw'}
                  </button>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => updateQuantity(item.slug, item.quantity - 1)}
                      className="w-6 h-6 rounded bg-gray-800 text-gray-400 hover:bg-gray-700 flex items-center justify-center text-sm"
                    >
                      -
                    </button>
                    <span className="text-white text-sm w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.slug, item.quantity + 1)}
                      className="w-6 h-6 rounded bg-gray-800 text-gray-400 hover:bg-gray-700 flex items-center justify-center text-sm"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right shrink-0 w-24">
                    <div className="text-emerald-400 text-sm font-medium">
                      {formatCurrency(val.low * item.quantity)}
                    </div>
                    <div className="text-gray-600 text-xs">
                      to {formatCurrency(val.high * item.quantity)}
                    </div>
                  </div>

                  <button
                    onClick={() => removeCard(item.slug)}
                    className="text-gray-600 hover:text-red-400 transition-colors shrink-0"
                    aria-label="Remove card"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Value Breakdown */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mt-4">
            <h3 className="text-white font-bold mb-3">Value Breakdown</h3>
            <div className="space-y-2 text-sm">
              {totals.rawLow > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Raw cards ({collection.filter(c => c.condition === 'raw').reduce((s, c) => s + c.quantity, 0)} cards)</span>
                  <span className="text-emerald-400">{formatCurrency(totals.rawLow)} – {formatCurrency(totals.rawHigh)}</span>
                </div>
              )}
              {totals.gradedLow > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Graded cards ({collection.filter(c => c.condition === 'graded').reduce((s, c) => s + c.quantity, 0)} cards)</span>
                  <span className="text-amber-400">{formatCurrency(totals.gradedLow)} – {formatCurrency(totals.gradedHigh)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-gray-800">
                <span className="text-white font-semibold">Total Estimated Value</span>
                <span className="text-white font-bold">{formatCurrency(totals.totalLow)} – {formatCurrency(totals.totalHigh)}</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Related Tools */}
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link href="/tools/grading-roi" className="bg-gray-900 border border-gray-800 hover:border-emerald-500/50 rounded-xl p-4 transition-colors">
          <h3 className="text-white font-semibold text-sm mb-1">Grading ROI Calculator</h3>
          <p className="text-gray-500 text-xs">Is it worth grading your cards?</p>
        </Link>
        <Link href="/tools/trade" className="bg-gray-900 border border-gray-800 hover:border-emerald-500/50 rounded-xl p-4 transition-colors">
          <h3 className="text-white font-semibold text-sm mb-1">Trade Evaluator</h3>
          <p className="text-gray-500 text-xs">Compare two sides of a trade.</p>
        </Link>
        <Link href="/tools/portfolio" className="bg-gray-900 border border-gray-800 hover:border-emerald-500/50 rounded-xl p-4 transition-colors">
          <h3 className="text-white font-semibold text-sm mb-1">Fantasy Portfolio</h3>
          <p className="text-gray-500 text-xs">Draft 5 cards, track performance.</p>
        </Link>
      </div>
    </div>
  );
}
