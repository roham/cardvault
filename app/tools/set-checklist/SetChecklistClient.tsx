'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

/* ── helpers ────────────────────────────────────────────────────── */

function parsePrice(raw: string): number {
  const match = raw.match(/\$(\d[\d,]*)/);
  return match ? parseInt(match[1].replace(',', ''), 10) : 0;
}

type Sport = 'baseball' | 'basketball' | 'football' | 'hockey';

interface SetInfo {
  name: string;
  sport: Sport;
  cards: typeof sportsCards;
  totalValue: number;
}

/* ── build set index ────────────────────────────────────────────── */

function buildSetIndex(): SetInfo[] {
  const setMap = new Map<string, SetInfo>();

  for (const card of sportsCards) {
    const existing = setMap.get(card.set);
    if (existing) {
      existing.cards = [...existing.cards, card];
      existing.totalValue += parsePrice(card.estimatedValueRaw);
    } else {
      setMap.set(card.set, {
        name: card.set,
        sport: card.sport,
        cards: [card],
        totalValue: parsePrice(card.estimatedValueRaw),
      });
    }
  }

  // Only show sets with 3+ cards
  return Array.from(setMap.values())
    .filter(s => s.cards.length >= 3)
    .sort((a, b) => b.cards.length - a.cards.length);
}

const SPORT_LABELS: Record<Sport, string> = {
  baseball: 'Baseball',
  basketball: 'Basketball',
  football: 'Football',
  hockey: 'Hockey',
};

const SPORT_COLORS: Record<Sport, string> = {
  baseball: 'text-red-400',
  basketball: 'text-orange-400',
  football: 'text-green-400',
  hockey: 'text-blue-400',
};

/* ── component ──────────────────────────────────────────────────── */

export default function SetChecklistClient() {
  const [mounted, setMounted] = useState(false);
  const [selectedSet, setSelectedSet] = useState<string>('');
  const [sportFilter, setSportFilter] = useState<Sport | 'all'>('all');
  const [owned, setOwned] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState('');

  const sets = useMemo(() => buildSetIndex(), []);

  const filteredSets = useMemo(() => {
    let result = sets;
    if (sportFilter !== 'all') {
      result = result.filter(s => s.sport === sportFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(s => s.name.toLowerCase().includes(q));
    }
    return result;
  }, [sets, sportFilter, search]);

  const currentSet = useMemo(() => {
    return sets.find(s => s.name === selectedSet);
  }, [sets, selectedSet]);

  // Load owned state from localStorage
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('cardvault-set-checklist');
      if (saved) setOwned(JSON.parse(saved));
    } catch {}
  }, []);

  // Save owned state
  const saveOwned = useCallback((next: Record<string, boolean>) => {
    setOwned(next);
    try { localStorage.setItem('cardvault-set-checklist', JSON.stringify(next)); } catch {}
  }, []);

  const toggleCard = useCallback((slug: string) => {
    setOwned(prev => {
      const next = { ...prev };
      if (next[slug]) delete next[slug];
      else next[slug] = true;
      saveOwned(next);
      return next;
    });
  }, [saveOwned]);

  const ownedInSet = currentSet ? currentSet.cards.filter(c => owned[c.slug]).length : 0;
  const totalInSet = currentSet ? currentSet.cards.length : 0;
  const completionPct = totalInSet > 0 ? Math.round((ownedInSet / totalInSet) * 100) : 0;
  const missingCards = currentSet ? currentSet.cards.filter(c => !owned[c.slug]) : [];
  const costToComplete = missingCards.reduce((sum, c) => sum + parsePrice(c.estimatedValueRaw), 0);

  if (!mounted) {
    return <div className="text-center py-20 text-gray-500">Loading checklist...</div>;
  }

  // Set selection view
  if (!selectedSet || !currentSet) {
    return (
      <div>
        {/* Sport filter */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(['all', 'baseball', 'basketball', 'football', 'hockey'] as const).map(sport => (
            <button
              key={sport}
              onClick={() => setSportFilter(sport)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors capitalize ${
                sportFilter === sport
                  ? 'bg-white/10 border-white/30 text-white'
                  : 'bg-gray-900/60 border-gray-800 text-gray-400 hover:text-white hover:border-gray-600'
              }`}
            >
              {sport === 'all' ? `All (${sets.length})` : `${sport} (${sets.filter(s => s.sport === sport).length})`}
            </button>
          ))}
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search sets..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 mb-6 focus:border-teal-500 focus:outline-none"
        />

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-gray-900/80 border border-gray-800 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-teal-400">{filteredSets.length}</div>
            <div className="text-xs text-gray-500">Sets Available</div>
          </div>
          <div className="bg-gray-900/80 border border-gray-800 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-white">{Object.keys(owned).length}</div>
            <div className="text-xs text-gray-500">Cards Checked</div>
          </div>
          <div className="bg-gray-900/80 border border-gray-800 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {sets.filter(s => {
                const ownedCount = s.cards.filter(c => owned[c.slug]).length;
                return ownedCount === s.cards.length && s.cards.length >= 3;
              }).length}
            </div>
            <div className="text-xs text-gray-500">Sets Complete</div>
          </div>
        </div>

        {/* Set list */}
        <div className="space-y-2">
          {filteredSets.slice(0, 50).map(set => {
            const ownedCount = set.cards.filter(c => owned[c.slug]).length;
            const pct = Math.round((ownedCount / set.cards.length) * 100);
            return (
              <button
                key={set.name}
                onClick={() => setSelectedSet(set.name)}
                className="w-full text-left p-4 bg-gray-900/60 border border-gray-800 rounded-xl hover:bg-gray-800/60 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">{set.name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs capitalize ${SPORT_COLORS[set.sport]}`}>{set.sport}</span>
                      <span className="text-xs text-gray-500">&middot; {set.cards.length} cards</span>
                      <span className="text-xs text-gray-500">&middot; ~${set.totalValue} total</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold ${pct === 100 ? 'text-green-400' : pct > 0 ? 'text-yellow-400' : 'text-gray-500'}`}>
                      {ownedCount}/{set.cards.length}
                    </div>
                    <div className="w-20 h-1.5 bg-gray-800 rounded-full mt-1 overflow-hidden">
                      <div className={`h-full rounded-full ${pct === 100 ? 'bg-green-500' : 'bg-teal-500'}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
          {filteredSets.length > 50 && (
            <p className="text-center text-sm text-gray-500 py-2">
              Showing 50 of {filteredSets.length} sets. Use search to narrow down.
            </p>
          )}
        </div>
      </div>
    );
  }

  // Checklist view for selected set
  return (
    <div>
      {/* Back button */}
      <button
        onClick={() => setSelectedSet('')}
        className="flex items-center gap-1 text-sm text-gray-400 hover:text-white mb-4 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to sets
      </button>

      {/* Set header */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 mb-6">
        <h2 className="text-xl font-bold text-white mb-1">{currentSet.name}</h2>
        <div className="flex items-center gap-3 text-sm">
          <span className={`capitalize ${SPORT_COLORS[currentSet.sport]}`}>{SPORT_LABELS[currentSet.sport]}</span>
          <span className="text-gray-500">{totalInSet} cards</span>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">{ownedInSet} of {totalInSet} owned</span>
            <span className={`font-bold ${completionPct === 100 ? 'text-green-400' : 'text-teal-400'}`}>{completionPct}%</span>
          </div>
          <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${completionPct === 100 ? 'bg-green-500' : 'bg-teal-500'}`}
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="text-center">
            <div className="text-lg font-bold text-green-400">{ownedInSet}</div>
            <div className="text-xs text-gray-500">Owned</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-400">{missingCards.length}</div>
            <div className="text-xs text-gray-500">Missing</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-400">${costToComplete}</div>
            <div className="text-xs text-gray-500">Est. to Complete</div>
          </div>
        </div>

        {completionPct === 100 && (
          <div className="mt-4 bg-green-950/40 border border-green-800/40 rounded-lg p-3 text-center">
            <span className="text-green-400 font-semibold">Set Complete!</span>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => {
            const next = { ...owned };
            currentSet.cards.forEach(c => { next[c.slug] = true; });
            saveOwned(next);
          }}
          className="px-4 py-2 bg-teal-900/40 border border-teal-800/40 text-teal-400 rounded-lg text-sm hover:bg-teal-800/40 transition-colors"
        >
          Mark All Owned
        </button>
        <button
          onClick={() => {
            const next = { ...owned };
            currentSet.cards.forEach(c => { delete next[c.slug]; });
            saveOwned(next);
          }}
          className="px-4 py-2 bg-gray-800 border border-gray-700 text-gray-400 rounded-lg text-sm hover:bg-gray-700 transition-colors"
        >
          Clear All
        </button>
      </div>

      {/* Card checklist */}
      <div className="space-y-1.5">
        {currentSet.cards
          .sort((a, b) => {
            const aNum = parseInt(a.cardNumber) || 0;
            const bNum = parseInt(b.cardNumber) || 0;
            return aNum - bNum;
          })
          .map(card => {
            const isOwned = !!owned[card.slug];
            return (
              <div
                key={card.slug}
                onClick={() => toggleCard(card.slug)}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  isOwned
                    ? 'bg-green-950/30 border-green-800/40'
                    : 'bg-gray-900/40 border-gray-800 hover:bg-gray-800/40'
                }`}
              >
                {/* Checkbox */}
                <div className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  isOwned ? 'bg-green-600 border-green-600' : 'border-gray-600'
                }`}>
                  {isOwned && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>

                {/* Card number */}
                <span className="flex-shrink-0 w-10 text-xs text-gray-500 font-mono">
                  #{card.cardNumber}
                </span>

                {/* Card info */}
                <div className="flex-1 min-w-0">
                  <div className={`text-sm truncate ${isOwned ? 'text-green-300' : 'text-white'}`}>
                    {card.player}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {card.estimatedValueRaw}
                    {card.rookie && <span className="ml-1 text-yellow-500">RC</span>}
                  </div>
                </div>

                {/* Link to card page */}
                <Link
                  href={`/sports/${card.slug}`}
                  onClick={e => e.stopPropagation()}
                  className="flex-shrink-0 text-xs text-gray-500 hover:text-teal-400 transition-colors"
                >
                  View
                </Link>
              </div>
            );
          })}
      </div>
    </div>
  );
}
