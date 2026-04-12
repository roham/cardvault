'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';
import type { SportsCard } from '@/data/sports-cards';
import CardFrame from '@/components/CardFrame';

function setSlugFn(setName: string): string {
  return setName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function getStorageKey(slug: string) {
  return `sports-checklist-${slug}`;
}

function parseValue(val: string): number {
  const m = val.match(/\$([\d,]+)/);
  if (!m) return 0;
  return parseInt(m[1].replace(/,/g, ''), 10) || 0;
}

export default function SportsSetChecklistPage() {
  const params = useParams();
  const slug = params.setSlug as string;

  const cards = sportsCards.filter(c => setSlugFn(c.set) === slug);
  const setName = cards[0]?.set ?? slug;

  const [checked, setChecked] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const saved = localStorage.getItem(getStorageKey(slug));
      if (saved) setChecked(new Set(JSON.parse(saved)));
    } catch {}
  }, [slug]);

  const saveChecked = useCallback((next: Set<string>) => {
    try {
      localStorage.setItem(getStorageKey(slug), JSON.stringify(Array.from(next)));
    } catch {}
  }, [slug]);

  const toggle = useCallback((cardSlug: string) => {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(cardSlug)) next.delete(cardSlug);
      else next.add(cardSlug);
      saveChecked(next);
      return next;
    });
  }, [saveChecked]);

  const checkAll = () => {
    const next = new Set(cards.map(c => c.slug));
    setChecked(next);
    saveChecked(next);
  };

  const uncheckAll = () => {
    const next = new Set<string>();
    setChecked(next);
    saveChecked(next);
  };

  if (cards.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p className="text-gray-400 mb-4">Set not found.</p>
        <Link href="/sports/sets" className="text-emerald-400 hover:text-emerald-300 text-sm">Browse sets</Link>
      </div>
    );
  }

  const checkedCount = checked.size;
  const total = cards.length;
  const completionPct = total > 0 ? Math.round((checkedCount / total) * 100) : 0;

  const totalValue = cards
    .filter(c => checked.has(c.slug))
    .reduce((sum, c) => sum + parseValue(c.estimatedValueRaw), 0);

  const sportGroups = cards.reduce<Record<string, SportsCard[]>>((acc, c) => {
    if (!acc[c.sport]) acc[c.sport] = [];
    acc[c.sport].push(c);
    return acc;
  }, {});

  const sportLabels: Record<string, string> = {
    baseball: 'Baseball',
    basketball: 'Basketball',
    football: 'Football',
    hockey: 'Hockey',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/sports" className="hover:text-gray-300">Sports Cards</Link>
        <span>/</span>
        <Link href="/sports/sets" className="hover:text-gray-300">Sets</Link>
        <span>/</span>
        <Link href={`/sports/sets/${slug}`} className="hover:text-gray-300">{setName}</Link>
        <span>/</span>
        <span className="text-gray-300">Checklist</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">{setName} Checklist</h1>
        <p className="text-gray-400 text-sm">{total} cards in CardVault database</p>
      </div>

      {/* Progress */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-8">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-white font-semibold text-lg">
              You have {checkedCount} of {total} cards
            </p>
            <p className="text-gray-400 text-sm">{completionPct}% complete</p>
          </div>
          <div className="text-right">
            <p className="text-emerald-400 font-bold text-xl">
              ~${totalValue.toLocaleString()}+
            </p>
            <p className="text-gray-500 text-xs">mid-grade estimated value</p>
          </div>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
            style={{ width: `${completionPct}%` }}
          />
        </div>
        <p className="text-gray-600 text-xs mt-2">Saved in your browser · No account required</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button
          onClick={checkAll}
          className="text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-900/50 text-emerald-400 border border-emerald-800/50 hover:bg-emerald-900/80 transition-colors"
        >
          Check All
        </button>
        <button
          onClick={uncheckAll}
          className="text-xs font-medium px-3 py-1.5 rounded-lg bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700 transition-colors"
        >
          Uncheck All
        </button>
        <button
          onClick={() => window.print()}
          className="text-xs font-medium px-3 py-1.5 rounded-lg bg-blue-900/50 text-blue-400 border border-blue-800/50 hover:bg-blue-900/80 transition-colors ml-auto"
        >
          Print Checklist
        </button>
        <Link
          href={`/sports/sets/${slug}`}
          className="text-xs font-medium px-3 py-1.5 rounded-lg bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700 transition-colors"
        >
          ← Back to Set
        </Link>
      </div>

      {/* Cards by sport */}
      {Object.entries(sportGroups).map(([sport, sportCards]) => (
        <div key={sport} className="mb-10">
          {Object.keys(sportGroups).length > 1 && (
            <h2 className="text-lg font-semibold text-gray-300 mb-4 capitalize">{sportLabels[sport] ?? sport}</h2>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {sportCards.map(card => {
              const isChecked = checked.has(card.slug);
              return (
                <button
                  key={card.slug}
                  onClick={() => toggle(card.slug)}
                  className={`group relative rounded-xl border transition-all text-left ${
                    isChecked
                      ? 'border-emerald-500/70 bg-emerald-950/20 shadow-emerald-900/20 shadow-md'
                      : 'border-gray-800 bg-gray-900 hover:border-gray-600'
                  }`}
                >
                  {/* Checkbox */}
                  <div className={`absolute top-2 right-2 w-5 h-5 rounded-full border-2 flex items-center justify-center z-10 transition-all ${
                    isChecked
                      ? 'border-emerald-400 bg-emerald-500'
                      : 'border-gray-600 group-hover:border-gray-400'
                  }`}>
                    {isChecked && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>

                  {/* Card */}
                  <div className={`p-2 transition-opacity ${isChecked ? 'opacity-100' : 'opacity-70 group-hover:opacity-90'}`}>
                    <CardFrame card={card} size="small" />
                  </div>

                  {/* Info */}
                  <div className="px-1.5 pb-1.5">
                    <p className={`text-xs font-medium truncate ${isChecked ? 'text-emerald-300' : 'text-gray-300'}`}>
                      {card.player}
                    </p>
                    <p className="text-gray-600 text-xs truncate">{card.year}</p>
                    <Link
                      href={`/sports/${card.slug}`}
                      onClick={e => e.stopPropagation()}
                      className="text-emerald-500 hover:text-emerald-400 text-xs"
                    >
                      Details →
                    </Link>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <p className="text-gray-600 text-xs text-center mt-4">
        Values are mid-grade estimates based on eBay sold data · Checklist saved locally in your browser
      </p>
    </div>
  );
}
