'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

/* ── helpers ──────────────────────────────────────────────────────── */

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

const CARDS_PER_PAGE = 9;

const SPORT_COLORS: Record<Sport, { bg: string; border: string; text: string; accent: string; slot: string }> = {
  baseball: { bg: 'bg-red-950/40', border: 'border-red-800/60', text: 'text-red-400', accent: 'bg-red-600', slot: 'border-red-900/40' },
  basketball: { bg: 'bg-orange-950/40', border: 'border-orange-800/60', text: 'text-orange-400', accent: 'bg-orange-600', slot: 'border-orange-900/40' },
  football: { bg: 'bg-green-950/40', border: 'border-green-800/60', text: 'text-green-400', accent: 'bg-green-600', slot: 'border-green-900/40' },
  hockey: { bg: 'bg-blue-950/40', border: 'border-blue-800/60', text: 'text-blue-400', accent: 'bg-blue-600', slot: 'border-blue-900/40' },
};

const SPORT_EMOJI: Record<Sport, string> = {
  baseball: '⚾',
  basketball: '🏀',
  football: '🏈',
  hockey: '🏒',
};

/* ── build set index ──────────────────────────────────────────────── */

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

  return Array.from(setMap.values())
    .filter(s => s.cards.length >= 3)
    .sort((a, b) => b.cards.length - a.cards.length);
}

/* ── share/import via URL hash ────────────────────────────────────── */

function encodeBinderToHash(setName: string, ownedSlugs: string[]): string {
  try {
    const data = JSON.stringify({ s: setName, o: ownedSlugs });
    return btoa(data);
  } catch { return ''; }
}

function decodeHashToBinder(hash: string): { setName: string; ownedSlugs: string[] } | null {
  try {
    const data = JSON.parse(atob(hash));
    if (data.s && Array.isArray(data.o)) return { setName: data.s, ownedSlugs: data.o };
  } catch { /* invalid hash */ }
  return null;
}

/* ── component ────────────────────────────────────────────────────── */

export default function VisualBinderClient() {
  const [mounted, setMounted] = useState(false);
  const [selectedSet, setSelectedSet] = useState<string>('');
  const [sportFilter, setSportFilter] = useState<Sport | 'all'>('all');
  const [owned, setOwned] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [justCompleted, setJustCompleted] = useState<string | null>(null);

  const sets = useMemo(() => buildSetIndex(), []);

  const filteredSets = useMemo(() => {
    let result = sets;
    if (sportFilter !== 'all') result = result.filter(s => s.sport === sportFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(s => s.name.toLowerCase().includes(q));
    }
    return result;
  }, [sets, sportFilter, search]);

  const currentSet = useMemo(() => sets.find(s => s.name === selectedSet), [sets, selectedSet]);

  const sortedCards = useMemo(() => {
    if (!currentSet) return [];
    return [...currentSet.cards].sort((a, b) => {
      const aNum = parseInt(a.cardNumber) || 0;
      const bNum = parseInt(b.cardNumber) || 0;
      return aNum - bNum;
    });
  }, [currentSet]);

  const totalPages = Math.ceil(sortedCards.length / CARDS_PER_PAGE);

  const pageCards = useMemo(() => {
    const start = currentPage * CARDS_PER_PAGE;
    return sortedCards.slice(start, start + CARDS_PER_PAGE);
  }, [sortedCards, currentPage]);

  // Load owned state
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('cardvault-visual-binder');
      if (saved) setOwned(JSON.parse(saved));
    } catch { /* noop */ }

    // Check URL hash for shared binder
    const hash = window.location.hash.slice(1);
    if (hash) {
      const decoded = decodeHashToBinder(hash);
      if (decoded) {
        setSelectedSet(decoded.setName);
        const merged: Record<string, boolean> = {};
        decoded.ownedSlugs.forEach(s => { merged[s] = true; });
        setOwned(prev => ({ ...prev, ...merged }));
      }
    }
  }, []);

  const saveOwned = useCallback((next: Record<string, boolean>) => {
    setOwned(next);
    try { localStorage.setItem('cardvault-visual-binder', JSON.stringify(next)); } catch { /* noop */ }
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

  // Stats for current set
  const ownedInSet = currentSet ? currentSet.cards.filter(c => owned[c.slug]).length : 0;
  const totalInSet = currentSet ? currentSet.cards.length : 0;
  const completionPct = totalInSet > 0 ? Math.round((ownedInSet / totalInSet) * 100) : 0;
  const missingCards = currentSet ? currentSet.cards.filter(c => !owned[c.slug]) : [];
  const costToComplete = missingCards.reduce((sum, c) => sum + parsePrice(c.estimatedValueRaw), 0);

  // Page completion check
  const pageOwned = pageCards.filter(c => owned[c.slug]).length;
  const pageComplete = pageCards.length > 0 && pageOwned === pageCards.length;

  // Detect set completion
  useEffect(() => {
    if (currentSet && ownedInSet === totalInSet && totalInSet > 0) {
      setJustCompleted(currentSet.name);
      const timer = setTimeout(() => setJustCompleted(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [currentSet, ownedInSet, totalInSet]);

  // Global stats
  const totalOwned = Object.keys(owned).length;
  const completedSets = sets.filter(s => {
    const count = s.cards.filter(c => owned[c.slug]).length;
    return count === s.cards.length;
  }).length;

  const shareBinder = useCallback(() => {
    if (!currentSet) return;
    const ownedSlugs = currentSet.cards.filter(c => owned[c.slug]).map(c => c.slug);
    const hash = encodeBinderToHash(currentSet.name, ownedSlugs);
    const url = `${window.location.origin}${window.location.pathname}#${hash}`;
    navigator.clipboard.writeText(url);
  }, [currentSet, owned]);

  if (!mounted) {
    return <div className="text-center py-20 text-gray-500">Loading binder...</div>;
  }

  /* ── Set Selection View ──────────────────────────────────────── */
  if (!selectedSet || !currentSet) {
    return (
      <div>
        {/* Global stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-violet-400">{sets.length}</div>
            <div className="text-xs text-gray-500">Sets Available</div>
          </div>
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{totalOwned}</div>
            <div className="text-xs text-gray-500">Cards Tracked</div>
          </div>
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{completedSets}</div>
            <div className="text-xs text-gray-500">Sets Complete</div>
          </div>
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-emerald-400">
              {sets.reduce((max, s) => {
                const pct = Math.round((s.cards.filter(c => owned[c.slug]).length / s.cards.length) * 100);
                return pct > max && pct < 100 ? pct : max;
              }, 0)}%
            </div>
            <div className="text-xs text-gray-500">Best In-Progress</div>
          </div>
        </div>

        {/* Sport filter */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(['all', 'baseball', 'basketball', 'football', 'hockey'] as const).map(sport => (
            <button
              key={sport}
              onClick={() => setSportFilter(sport)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors capitalize ${
                sportFilter === sport
                  ? 'bg-violet-900/40 border-violet-700/50 text-violet-300'
                  : 'bg-gray-900/60 border-gray-800 text-gray-400 hover:text-white hover:border-gray-600'
              }`}
            >
              {sport === 'all' ? `All (${sets.length})` : `${SPORT_EMOJI[sport]} ${sport} (${sets.filter(s => s.sport === sport).length})`}
            </button>
          ))}
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search sets..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 mb-6 focus:border-violet-500 focus:outline-none"
        />

        {/* Set grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredSets.slice(0, 60).map(set => {
            const ownedCount = set.cards.filter(c => owned[c.slug]).length;
            const pct = Math.round((ownedCount / set.cards.length) * 100);
            const colors = SPORT_COLORS[set.sport];
            const isComplete = pct === 100;
            return (
              <button
                key={set.name}
                onClick={() => { setSelectedSet(set.name); setCurrentPage(0); }}
                className={`text-left p-4 rounded-xl border transition-all hover:scale-[1.01] ${
                  isComplete
                    ? 'bg-yellow-950/30 border-yellow-700/50'
                    : `${colors.bg} ${colors.border}`
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {isComplete && <span className="text-sm">🏆</span>}
                      <span className="text-white font-semibold text-sm truncate">{set.name}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs capitalize ${colors.text}`}>
                        {SPORT_EMOJI[set.sport]} {set.sport}
                      </span>
                      <span className="text-xs text-gray-500">{set.cards.length} cards</span>
                      <span className="text-xs text-gray-500">{Math.ceil(set.cards.length / CARDS_PER_PAGE)} pages</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`text-sm font-bold ${isComplete ? 'text-yellow-400' : pct > 0 ? colors.text : 'text-gray-600'}`}>
                      {ownedCount}/{set.cards.length}
                    </div>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="mt-3">
                  <div className="h-2 bg-gray-800/80 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${isComplete ? 'bg-yellow-500' : colors.accent}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-gray-600">{pct}% complete</span>
                    {!isComplete && ownedCount > 0 && (
                      <span className="text-[10px] text-gray-600">${costToComplete} to finish</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        {filteredSets.length > 60 && (
          <p className="text-center text-sm text-gray-500 py-4">
            Showing 60 of {filteredSets.length} sets. Use search to narrow down.
          </p>
        )}
      </div>
    );
  }

  /* ── Binder View ─────────────────────────────────────────────── */
  const colors = SPORT_COLORS[currentSet.sport];

  return (
    <div>
      {/* Set completion celebration */}
      {justCompleted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-pulse">
          <div className="bg-yellow-950/90 border-2 border-yellow-500 rounded-2xl p-8 text-center max-w-sm mx-4">
            <div className="text-5xl mb-3">🏆</div>
            <h3 className="text-2xl font-bold text-yellow-400 mb-2">Set Complete!</h3>
            <p className="text-gray-300 text-sm">{justCompleted}</p>
            <p className="text-yellow-500/70 text-xs mt-2">All {totalInSet} cards collected</p>
          </div>
        </div>
      )}

      {/* Header bar */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => { setSelectedSet(''); setCurrentPage(0); }}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          All Sets
        </button>
        <button
          onClick={shareBinder}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-900/40 border border-violet-800/50 text-violet-400 rounded-lg text-xs hover:bg-violet-800/40 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share
        </button>
      </div>

      {/* Set info card */}
      <div className={`${colors.bg} border ${colors.border} rounded-xl p-5 mb-6`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white">{currentSet.name}</h2>
            <div className="flex items-center gap-2 mt-1 text-sm">
              <span className={`capitalize ${colors.text}`}>{SPORT_EMOJI[currentSet.sport]} {currentSet.sport}</span>
              <span className="text-gray-500">{totalInSet} cards</span>
              <span className="text-gray-500">{totalPages} pages</span>
            </div>
          </div>
          {completionPct === 100 && <span className="text-3xl">🏆</span>}
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-gray-400">{ownedInSet} of {totalInSet} collected</span>
            <span className={`font-bold ${completionPct === 100 ? 'text-yellow-400' : colors.text}`}>{completionPct}%</span>
          </div>
          <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${completionPct === 100 ? 'bg-yellow-500' : colors.accent}`}
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="text-center">
            <div className="text-lg font-bold text-emerald-400">{ownedInSet}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider">Owned</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-400">{missingCards.length}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider">Missing</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-amber-400">${costToComplete.toLocaleString()}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider">To Complete</div>
          </div>
        </div>
      </div>

      {/* Page navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
          disabled={currentPage === 0}
          className="flex items-center gap-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Prev
        </button>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${pageComplete ? 'text-yellow-400' : 'text-white'}`}>
            {pageComplete && '★ '}Page {currentPage + 1} of {totalPages}{pageComplete && ' ★'}
          </span>
          <span className="text-xs text-gray-500">
            ({pageOwned}/{pageCards.length} on page)
          </span>
        </div>
        <button
          onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
          disabled={currentPage >= totalPages - 1}
          className="flex items-center gap-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Next
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Page dots */}
      {totalPages <= 30 && (
        <div className="flex flex-wrap justify-center gap-1 mb-5">
          {Array.from({ length: totalPages }, (_, i) => {
            const pageStart = i * CARDS_PER_PAGE;
            const pageSlice = sortedCards.slice(pageStart, pageStart + CARDS_PER_PAGE);
            const allOwned = pageSlice.length > 0 && pageSlice.every(c => owned[c.slug]);
            const someOwned = pageSlice.some(c => owned[c.slug]);
            return (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                className={`w-5 h-5 rounded text-[9px] font-medium transition-all ${
                  i === currentPage
                    ? 'bg-violet-600 text-white scale-110'
                    : allOwned
                      ? 'bg-yellow-600/60 text-yellow-200'
                      : someOwned
                        ? 'bg-gray-700 text-gray-300'
                        : 'bg-gray-800/60 text-gray-600'
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      )}

      {/* ── BINDER PAGE ── */}
      <div className={`rounded-2xl border-2 p-3 sm:p-5 transition-all duration-500 ${
        pageComplete
          ? 'border-yellow-600/70 bg-yellow-950/20 shadow-[0_0_30px_rgba(234,179,8,0.1)]'
          : 'border-gray-700/50 bg-gray-900/40'
      }`}>
        {/* Binder rings decoration */}
        <div className="flex justify-center gap-16 mb-3">
          <div className="w-4 h-4 rounded-full bg-gray-700/50 border-2 border-gray-600/50" />
          <div className="w-4 h-4 rounded-full bg-gray-700/50 border-2 border-gray-600/50" />
          <div className="w-4 h-4 rounded-full bg-gray-700/50 border-2 border-gray-600/50" />
        </div>

        {/* 3x3 card grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {Array.from({ length: CARDS_PER_PAGE }, (_, i) => {
            const card = pageCards[i];
            if (!card) {
              // Empty slot (last page may have fewer than 9)
              return (
                <div
                  key={`empty-${i}`}
                  className="aspect-[2.5/3.5] rounded-lg border border-dashed border-gray-800/40 bg-gray-900/20"
                />
              );
            }

            const isOwned = !!owned[card.slug];
            const value = parsePrice(card.estimatedValueRaw);

            return (
              <div
                key={card.slug}
                onClick={() => toggleCard(card.slug)}
                className={`relative aspect-[2.5/3.5] rounded-lg border-2 cursor-pointer transition-all duration-200 overflow-hidden group ${
                  isOwned
                    ? `${colors.border} ${colors.bg} shadow-lg`
                    : 'border-gray-800/60 bg-gray-900/30 hover:border-gray-700'
                }`}
              >
                {isOwned ? (
                  /* ── Owned card ── */
                  <div className="absolute inset-0 p-2 sm:p-3 flex flex-col justify-between">
                    {/* Top: card number + rookie badge */}
                    <div className="flex items-start justify-between">
                      <span className="text-[10px] font-mono text-gray-500">#{card.cardNumber}</span>
                      {card.rookie && (
                        <span className="text-[8px] bg-yellow-600 text-white px-1 py-0.5 rounded font-bold">RC</span>
                      )}
                    </div>

                    {/* Center: player name */}
                    <div className="text-center">
                      <div className={`text-xs sm:text-sm font-bold ${colors.text} leading-tight`}>
                        {card.player.split(' ').map((word, wi) => (
                          <span key={wi}>{wi > 0 && <br />}{word}</span>
                        ))}
                      </div>
                      <div className="text-[10px] text-gray-500 mt-0.5">{card.year}</div>
                    </div>

                    {/* Bottom: value + check */}
                    <div className="flex items-end justify-between">
                      <span className="text-[10px] text-gray-500">{card.estimatedValueRaw}</span>
                      <div className="w-4 h-4 rounded-full bg-emerald-600 flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>

                    {/* Hover: link to card page */}
                    <Link
                      href={`/sports/${card.slug}`}
                      onClick={e => e.stopPropagation()}
                      className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <span className="text-xs text-white bg-gray-800 px-2 py-1 rounded">View Card</span>
                    </Link>
                  </div>
                ) : (
                  /* ── Empty slot (not owned) ── */
                  <div className="absolute inset-0 p-2 sm:p-3 flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                      <span className="text-[10px] font-mono text-gray-700">#{card.cardNumber}</span>
                      {card.rookie && (
                        <span className="text-[8px] bg-gray-700 text-gray-500 px-1 py-0.5 rounded font-bold">RC</span>
                      )}
                    </div>

                    <div className="text-center">
                      <div className="text-xs sm:text-sm font-medium text-gray-600 leading-tight">
                        {card.player.split(' ').map((word, wi) => (
                          <span key={wi}>{wi > 0 && <br />}{word}</span>
                        ))}
                      </div>
                      <div className="text-[10px] text-gray-700 mt-0.5">{card.year}</div>
                    </div>

                    <div className="flex items-end justify-between">
                      <span className="text-[10px] text-gray-700">{value > 0 ? card.estimatedValueRaw : ''}</span>
                      <div className="w-4 h-4 rounded-full border border-dashed border-gray-700 group-hover:border-gray-500 transition-colors" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Binder spine marker */}
        <div className="flex justify-center mt-3">
          <span className="text-[10px] text-gray-600">
            {SPORT_EMOJI[currentSet.sport]} {currentSet.name} — Page {currentPage + 1}
          </span>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2 mt-5">
        <button
          onClick={() => {
            const next = { ...owned };
            pageCards.forEach(c => { next[c.slug] = true; });
            saveOwned(next);
          }}
          className="px-3 py-2 bg-emerald-900/40 border border-emerald-800/40 text-emerald-400 rounded-lg text-xs hover:bg-emerald-800/40 transition-colors"
        >
          Own This Page
        </button>
        <button
          onClick={() => {
            const next = { ...owned };
            currentSet.cards.forEach(c => { next[c.slug] = true; });
            saveOwned(next);
          }}
          className="px-3 py-2 bg-violet-900/40 border border-violet-800/40 text-violet-400 rounded-lg text-xs hover:bg-violet-800/40 transition-colors"
        >
          Own Entire Set
        </button>
        <button
          onClick={() => {
            const next = { ...owned };
            currentSet.cards.forEach(c => { delete next[c.slug]; });
            saveOwned(next);
          }}
          className="px-3 py-2 bg-gray-800 border border-gray-700 text-gray-400 rounded-lg text-xs hover:bg-gray-700 transition-colors"
        >
          Clear Set
        </button>
      </div>

      {/* Missing cards summary */}
      {missingCards.length > 0 && missingCards.length <= 20 && (
        <div className="mt-6 bg-gray-900/60 border border-gray-800 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-3">
            Missing Cards ({missingCards.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {missingCards.sort((a, b) => (parseInt(a.cardNumber) || 0) - (parseInt(b.cardNumber) || 0)).map(card => (
              <button
                key={card.slug}
                onClick={() => toggleCard(card.slug)}
                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
              >
                <span className="font-mono text-gray-600">#{card.cardNumber}</span>
                <span>{card.player}</span>
                <span className="text-gray-600">{card.estimatedValueRaw}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
