'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { sportsCards, type SportsCard } from '@/data/sports-cards';

// ── Helpers ──────────────────────────────────────────────────────

function parsePrice(raw: string): number {
  const m = raw.match(/\$(\d[\d,]*)/);
  return m ? parseInt(m[1].replace(',', ''), 10) : 0;
}

function formatCurrency(n: number): string {
  return '$' + n.toLocaleString();
}

type Sport = 'baseball' | 'basketball' | 'football' | 'hockey';

interface SetInfo {
  name: string;
  sport: Sport;
  cards: SportsCard[];
  totalValue: number;
}

type Tab = 'dashboard' | 'set' | 'wantlist';
type DashSort = 'completion' | 'most-cards' | 'cheapest' | 'closest' | 'sport';

const STORAGE_KEY = 'cardvault-set-completion-v2';

const SPORT_COLORS: Record<Sport, { text: string; bg: string; border: string; bar: string }> = {
  baseball: { text: 'text-red-400', bg: 'bg-red-950/30', border: 'border-red-800/50', bar: 'bg-red-500' },
  basketball: { text: 'text-orange-400', bg: 'bg-orange-950/30', border: 'border-orange-800/50', bar: 'bg-orange-500' },
  football: { text: 'text-green-400', bg: 'bg-green-950/30', border: 'border-green-800/50', bar: 'bg-green-500' },
  hockey: { text: 'text-blue-400', bg: 'bg-blue-950/30', border: 'border-blue-800/50', bar: 'bg-blue-500' },
};

const SPORT_EMOJI: Record<Sport, string> = { baseball: '⚾', basketball: '🏀', football: '🏈', hockey: '🏒' };

// ── Build set index ──────────────────────────────────────────────

function buildSetIndex(): SetInfo[] {
  const setMap = new Map<string, SetInfo>();
  for (const card of sportsCards) {
    const existing = setMap.get(card.set);
    if (existing) {
      existing.cards.push(card);
      existing.totalValue += parsePrice(card.estimatedValueRaw);
    } else {
      setMap.set(card.set, { name: card.set, sport: card.sport, cards: [card], totalValue: parsePrice(card.estimatedValueRaw) });
    }
  }
  return Array.from(setMap.values()).filter(s => s.cards.length >= 3).sort((a, b) => b.cards.length - a.cards.length);
}

// ── Component ────────────────────────────────────────────────────

export default function SetCompletionClient() {
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<Tab>('dashboard');
  const [owned, setOwned] = useState<Record<string, boolean>>({});
  const [sportFilter, setSportFilter] = useState<Sport | 'all'>('all');
  const [dashSort, setDashSort] = useState<DashSort>('closest');
  const [activeSet, setActiveSet] = useState<string>('');
  const [setSearch, setSetSearch] = useState('');
  const [cardSearch, setCardSearch] = useState('');

  const sets = useMemo(() => buildSetIndex(), []);

  // Load from localStorage
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setOwned(JSON.parse(saved));
    } catch { /* fresh */ }
  }, []);

  // Save on change
  useEffect(() => {
    if (mounted) localStorage.setItem(STORAGE_KEY, JSON.stringify(owned));
  }, [owned, mounted]);

  const toggleCard = useCallback((slug: string) => {
    setOwned(prev => {
      const next = { ...prev };
      if (next[slug]) delete next[slug];
      else next[slug] = true;
      return next;
    });
  }, []);

  // Per-set completion data
  const setStats = useMemo(() => {
    return sets.map(s => {
      const ownedCount = s.cards.filter(c => owned[c.slug]).length;
      const missingCards = s.cards.filter(c => !owned[c.slug]);
      const missingValue = missingCards.reduce((sum, c) => sum + parsePrice(c.estimatedValueRaw), 0);
      const pct = Math.round((ownedCount / s.cards.length) * 100);
      return { ...s, ownedCount, missingCount: missingCards.length, missingCards, missingValue, pct };
    });
  }, [sets, owned]);

  // Global stats
  const globalStats = useMemo(() => {
    const tracked = setStats.filter(s => s.ownedCount > 0);
    const totalOwned = tracked.reduce((sum, s) => sum + s.ownedCount, 0);
    const totalCards = tracked.reduce((sum, s) => sum + s.cards.length, 0);
    const totalMissing = tracked.reduce((sum, s) => sum + s.missingCount, 0);
    const totalMissingValue = tracked.reduce((sum, s) => sum + s.missingValue, 0);
    const completed = tracked.filter(s => s.pct === 100).length;
    return { tracked: tracked.length, totalOwned, totalCards, totalMissing, totalMissingValue, completed };
  }, [setStats]);

  // Filtered and sorted dashboard
  const dashFiltered = useMemo(() => {
    let result = [...setStats];
    if (sportFilter !== 'all') result = result.filter(s => s.sport === sportFilter);
    if (setSearch) {
      const q = setSearch.toLowerCase();
      result = result.filter(s => s.name.toLowerCase().includes(q));
    }
    switch (dashSort) {
      case 'completion': result.sort((a, b) => b.pct - a.pct || b.ownedCount - a.ownedCount); break;
      case 'most-cards': result.sort((a, b) => b.cards.length - a.cards.length); break;
      case 'cheapest': result.sort((a, b) => a.missingValue - b.missingValue || a.missingCount - b.missingCount); break;
      case 'closest': result.sort((a, b) => {
        // Sort by fewest missing cards (but exclude sets with 0 owned)
        const aScore = a.ownedCount > 0 ? a.missingCount : 999999;
        const bScore = b.ownedCount > 0 ? b.missingCount : 999999;
        return aScore - bScore;
      }); break;
      case 'sport': result.sort((a, b) => a.sport.localeCompare(b.sport) || b.pct - a.pct); break;
    }
    return result;
  }, [setStats, sportFilter, setSearch, dashSort]);

  // Want list (all missing cards across all tracked sets)
  const wantList = useMemo(() => {
    return setStats
      .filter(s => s.ownedCount > 0)
      .flatMap(s => s.missingCards.map(c => ({ card: c, setName: s.name, sport: s.sport })))
      .sort((a, b) => parsePrice(a.card.estimatedValueRaw) - parsePrice(b.card.estimatedValueRaw));
  }, [setStats]);

  // Active set detail
  const activeSetData = useMemo(() => {
    return setStats.find(s => s.name === activeSet);
  }, [setStats, activeSet]);

  const openSet = useCallback((name: string) => {
    setActiveSet(name);
    setTab('set');
    setCardSearch('');
  }, []);

  function getMilestoneLabel(pct: number): { label: string; color: string } {
    if (pct === 100) return { label: 'COMPLETE', color: 'text-yellow-300' };
    if (pct >= 75) return { label: '75%+', color: 'text-emerald-400' };
    if (pct >= 50) return { label: '50%+', color: 'text-blue-400' };
    if (pct >= 25) return { label: '25%+', color: 'text-purple-400' };
    if (pct > 0) return { label: 'STARTED', color: 'text-gray-400' };
    return { label: '', color: '' };
  }

  // Share
  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const ownedSlugs = Object.keys(owned);
    if (ownedSlugs.length === 0) return '';
    try {
      const data = btoa(JSON.stringify(ownedSlugs));
      return `${window.location.origin}/tools/set-completion?c=${data}`;
    } catch { return ''; }
  }, [owned]);

  if (!mounted) {
    return <div className="text-center py-20 text-gray-500">Loading tracker...</div>;
  }

  // ── SET DETAIL VIEW ────────────────────────────────────────────
  if (tab === 'set' && activeSetData) {
    const sc = SPORT_COLORS[activeSetData.sport];
    const milestone = getMilestoneLabel(activeSetData.pct);
    const filteredCards = cardSearch
      ? activeSetData.cards.filter(c => c.name.toLowerCase().includes(cardSearch.toLowerCase()) || c.player.toLowerCase().includes(cardSearch.toLowerCase()))
      : activeSetData.cards;

    return (
      <div className="space-y-6">
        <button onClick={() => setTab('dashboard')} className="text-sm text-gray-400 hover:text-white transition-colors">&larr; Back to Dashboard</button>

        {/* Set header */}
        <div className={`${sc.bg} border ${sc.border} rounded-2xl p-5`}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{SPORT_EMOJI[activeSetData.sport]} {activeSetData.sport}</p>
              <h2 className="text-xl font-bold text-white">{activeSetData.name}</h2>
            </div>
            {milestone.label && <span className={`text-xs font-bold ${milestone.color}`}>{milestone.label}</span>}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <div><p className="text-xs text-gray-500">Owned</p><p className="text-white font-bold text-lg">{activeSetData.ownedCount}/{activeSetData.cards.length}</p></div>
            <div><p className="text-xs text-gray-500">Completion</p><p className={`font-bold text-lg ${sc.text}`}>{activeSetData.pct}%</p></div>
            <div><p className="text-xs text-gray-500">Missing</p><p className="text-gray-300 font-bold text-lg">{activeSetData.missingCount}</p></div>
            <div><p className="text-xs text-gray-500">Cost to Complete</p><p className="text-amber-400 font-bold text-lg">{formatCurrency(activeSetData.missingValue)}</p></div>
          </div>
          <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
            <div className={`h-full ${sc.bar} rounded-full transition-all duration-500`} style={{ width: `${activeSetData.pct}%` }} />
          </div>
        </div>

        {/* Search + bulk actions */}
        <div className="flex flex-wrap items-center gap-3">
          <input type="text" placeholder="Search cards..." value={cardSearch} onChange={e => setCardSearch(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 w-48 focus:outline-none focus:border-emerald-600" />
          <span className="text-xs text-gray-500">Tap cards to toggle owned</span>
        </div>

        {/* Card grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {filteredCards.map(card => {
            const isOwned = owned[card.slug];
            const val = parsePrice(card.estimatedValueRaw);
            return (
              <button key={card.slug} onClick={() => toggleCard(card.slug)}
                className={`text-left rounded-lg border px-3 py-2.5 transition-all ${
                  isOwned
                    ? `${sc.bg} ${sc.border} ring-1 ring-emerald-500/30`
                    : 'bg-gray-900/50 border-gray-800 opacity-60 hover:opacity-80'
                }`}>
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${isOwned ? 'bg-emerald-600 border-emerald-500' : 'border-gray-600'}`}>
                    {isOwned && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium truncate ${isOwned ? 'text-white' : 'text-gray-500'}`}>{card.name}</p>
                    <p className="text-xs text-gray-600">{card.player} &middot; {card.estimatedValueRaw}</p>
                  </div>
                  {card.rookie && <span className="text-[9px] font-bold text-amber-400 bg-amber-950/50 border border-amber-800/50 px-1.5 py-0.5 rounded shrink-0">RC</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── WANT LIST VIEW ─────────────────────────────────────────────
  if (tab === 'wantlist') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setTab('dashboard')} className="text-sm text-gray-400 hover:text-white transition-colors">&larr; Back</button>
          <h2 className="text-xl font-bold text-white">Want List</h2>
          <span className="text-xs text-gray-500">({wantList.length} cards needed)</span>
        </div>

        {wantList.length === 0 ? (
          <div className="text-center py-12 bg-gray-900/50 border border-gray-800 rounded-2xl">
            <p className="text-3xl mb-3">&#x2705;</p>
            <p className="text-gray-400">No missing cards! Start tracking sets to build your want list.</p>
          </div>
        ) : (
          <>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div><p className="text-xs text-gray-500">Cards Needed</p><p className="text-white font-bold text-lg">{wantList.length}</p></div>
                <div><p className="text-xs text-gray-500">Total Cost</p><p className="text-amber-400 font-bold text-lg">{formatCurrency(globalStats.totalMissingValue)}</p></div>
                <div><p className="text-xs text-gray-500">Avg Per Card</p><p className="text-gray-300 font-bold text-lg">{formatCurrency(Math.round(globalStats.totalMissingValue / (wantList.length || 1)))}</p></div>
              </div>
            </div>

            <div className="space-y-1.5 max-h-[60vh] overflow-y-auto">
              {wantList.map(({ card, setName, sport }) => (
                <div key={card.slug + setName} className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-lg px-4 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-sm font-medium truncate">{card.name}</p>
                    <p className="text-gray-500 text-xs truncate">{setName} &middot; {card.player}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-xs ${SPORT_COLORS[sport as Sport].text}`}>{SPORT_EMOJI[sport as Sport]}</span>
                    <span className="text-amber-400 text-sm font-medium">{card.estimatedValueRaw}</span>
                    <Link href={`/sports/${card.slug}`} className="text-xs text-gray-500 hover:text-emerald-400">View</Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // ── DASHBOARD VIEW (main) ──────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Global stats */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div><p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Sets Tracked</p><p className="text-xl font-bold text-white">{globalStats.tracked}</p></div>
          <div><p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Cards Owned</p><p className="text-xl font-bold text-emerald-400">{globalStats.totalOwned}</p></div>
          <div><p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Cards Needed</p><p className="text-xl font-bold text-amber-400">{globalStats.totalMissing}</p></div>
          <div><p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Cost to Complete</p><p className="text-xl font-bold text-red-400">{formatCurrency(globalStats.totalMissingValue)}</p></div>
          <div><p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Completed</p><p className="text-xl font-bold text-yellow-400">{globalStats.completed}</p></div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <input type="text" placeholder="Search sets..." value={setSearch} onChange={e => setSetSearch(e.target.value)}
          className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 w-44 focus:outline-none focus:border-emerald-600" />
        <select value={sportFilter} onChange={e => setSportFilter(e.target.value as Sport | 'all')}
          className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white">
          <option value="all">All Sports</option>
          <option value="baseball">Baseball</option>
          <option value="basketball">Basketball</option>
          <option value="football">Football</option>
          <option value="hockey">Hockey</option>
        </select>
        <select value={dashSort} onChange={e => setDashSort(e.target.value as DashSort)}
          className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white">
          <option value="closest">Closest to Complete</option>
          <option value="completion">Highest Completion</option>
          <option value="cheapest">Cheapest to Complete</option>
          <option value="most-cards">Most Cards</option>
          <option value="sport">By Sport</option>
        </select>
        <button onClick={() => setTab('wantlist')}
          className="ml-auto text-xs bg-amber-950/40 hover:bg-amber-900/40 text-amber-400 px-3 py-2 rounded-lg border border-amber-800/50 transition-colors">
          Want List ({globalStats.totalMissing})
        </button>
      </div>

      {/* Set grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {dashFiltered.map(s => {
          const sc = SPORT_COLORS[s.sport];
          const milestone = getMilestoneLabel(s.pct);
          return (
            <button key={s.name} onClick={() => openSet(s.name)}
              className={`text-left rounded-xl border p-4 transition-all hover:border-gray-600 ${s.ownedCount > 0 ? `${sc.bg} ${sc.border}` : 'bg-gray-900/50 border-gray-800'}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="min-w-0 flex-1">
                  <p className="text-white font-semibold text-sm truncate">{s.name}</p>
                  <p className="text-gray-500 text-xs">{SPORT_EMOJI[s.sport]} {s.cards.length} cards &middot; {formatCurrency(s.totalValue)} total value</p>
                </div>
                {milestone.label && <span className={`text-[10px] font-bold ${milestone.color} shrink-0 ml-2`}>{milestone.label}</span>}
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden mb-2">
                <div className={`h-full ${sc.bar} rounded-full transition-all duration-300`} style={{ width: `${s.pct}%` }} />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className={s.ownedCount > 0 ? sc.text : 'text-gray-600'}>{s.ownedCount}/{s.cards.length} owned ({s.pct}%)</span>
                {s.missingCount > 0 && s.ownedCount > 0 && (
                  <span className="text-amber-400/70">{formatCurrency(s.missingValue)} to complete</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
