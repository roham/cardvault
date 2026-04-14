'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import CardFrame from '@/components/CardFrame';
import { sportsCards, type Sport } from '@/data/sports-cards';

type Tab = 'collected' | 'want' | 'trade';

interface BinderState {
  collected: string[];
  want: string[];
  trade: string[];
  name: string;
}

const STORAGE_KEY = 'cardvault-binder';
const TABS: { key: Tab; label: string; icon: string; desc: string }[] = [
  { key: 'collected', label: 'Collected', icon: '\u{1F4DA}', desc: 'Cards you own' },
  { key: 'want', label: 'Want List', icon: '\u{2B50}', desc: 'Cards you want' },
  { key: 'trade', label: 'For Trade', icon: '\u{1F501}', desc: 'Open to trade' },
];

const SPORT_ICONS: Record<string, string> = {
  baseball: '\u26BE', basketball: '\u{1F3C0}', football: '\u{1F3C8}', hockey: '\u{1F3D2}',
};

type SortKey = 'recent' | 'value-high' | 'value-low' | 'year-new' | 'year-old' | 'name';

function parseValue(v: string): number {
  const m = v.match(/\$([\d,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
}

function encodeBinder(state: BinderState): string {
  return btoa(JSON.stringify({
    c: state.collected,
    w: state.want,
    t: state.trade,
    n: state.name,
  }));
}

function decodeBinder(hash: string): BinderState | null {
  try {
    const d = JSON.parse(atob(hash));
    return {
      collected: d.c || [],
      want: d.w || [],
      trade: d.t || [],
      name: d.n || '',
    };
  } catch { return null; }
}

export default function BinderClient() {
  const [mounted, setMounted] = useState(false);
  const [binder, setBinder] = useState<BinderState>({ collected: [], want: [], trade: [], name: '' });
  const [activeTab, setActiveTab] = useState<Tab>('collected');
  const [searchQuery, setSearchQuery] = useState('');
  const [sportFilter, setSportFilter] = useState<Sport | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortKey>('recent');
  const [copied, setCopied] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [viewName, setViewName] = useState('');
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hash = window.location.hash;
    if (hash.startsWith('#binder=')) {
      const data = decodeBinder(hash.slice('#binder='.length));
      if (data) {
        setBinder(data);
        setViewName(data.name);
        setIsViewing(true);
        return;
      }
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setBinder(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    if (!mounted || isViewing) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(binder)); } catch {}
  }, [binder, mounted, isViewing]);

  const addCard = useCallback((slug: string, tab: Tab) => {
    setBinder(prev => {
      // Remove from other tabs if present, then add to target
      const cleaned = {
        ...prev,
        collected: prev.collected.filter(s => s !== slug),
        want: prev.want.filter(s => s !== slug),
        trade: prev.trade.filter(s => s !== slug),
      };
      return { ...cleaned, [tab]: [...cleaned[tab], slug] };
    });
    setSearchQuery('');
    setShowQuickAdd(false);
  }, []);

  const removeCard = useCallback((slug: string, tab: Tab) => {
    setBinder(prev => ({ ...prev, [tab]: prev[tab].filter(s => s !== slug) }));
  }, []);

  const moveCard = useCallback((slug: string, from: Tab, to: Tab) => {
    setBinder(prev => ({
      ...prev,
      [from]: prev[from].filter(s => s !== slug),
      [to]: [...prev[to].filter(s => s !== slug), slug],
    }));
  }, []);

  const activeCards = useMemo(() => {
    const slugs = binder[activeTab];
    let cards = slugs
      .map(slug => sportsCards.find(c => c.slug === slug))
      .filter(Boolean) as typeof sportsCards;

    if (sportFilter !== 'all') {
      cards = cards.filter(c => c.sport === sportFilter);
    }

    switch (sortBy) {
      case 'value-high': return [...cards].sort((a, b) => parseValue(b.estimatedValueRaw) - parseValue(a.estimatedValueRaw));
      case 'value-low': return [...cards].sort((a, b) => parseValue(a.estimatedValueRaw) - parseValue(b.estimatedValueRaw));
      case 'year-new': return [...cards].sort((a, b) => b.year - a.year);
      case 'year-old': return [...cards].sort((a, b) => a.year - b.year);
      case 'name': return [...cards].sort((a, b) => a.player.localeCompare(b.player));
      default: return cards; // 'recent' = insertion order
    }
  }, [binder, activeTab, sportFilter, sortBy]);

  const allBinderSlugs = useMemo(() =>
    new Set([...binder.collected, ...binder.want, ...binder.trade]),
  [binder]);

  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase();
    return sportsCards
      .filter(c =>
        c.player.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.set.toLowerCase().includes(q)
      )
      .slice(0, 10);
  }, [searchQuery]);

  const stats = useMemo(() => {
    const all = [...binder.collected, ...binder.want, ...binder.trade];
    const allCards = all.map(s => sportsCards.find(c => c.slug === s)).filter(Boolean) as typeof sportsCards;
    const collectedCards = binder.collected.map(s => sportsCards.find(c => c.slug === s)).filter(Boolean) as typeof sportsCards;
    const totalValue = collectedCards.reduce((sum, c) => sum + parseValue(c.estimatedValueRaw), 0);
    const sports = [...new Set(allCards.map(c => c.sport))];
    const yearMin = allCards.length ? Math.min(...allCards.map(c => c.year)) : 0;
    const yearMax = allCards.length ? Math.max(...allCards.map(c => c.year)) : 0;
    return {
      total: all.length,
      collected: binder.collected.length,
      want: binder.want.length,
      trade: binder.trade.length,
      totalValue,
      sports,
      yearRange: allCards.length ? `${yearMin}\u2013${yearMax}` : '\u2014',
    };
  }, [binder]);

  function shareBinder() {
    const encoded = encodeBinder(binder);
    const url = `${window.location.origin}/binder#binder=${encoded}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function shareToX() {
    const text = `Check out my CardVault digital binder! ${stats.collected} collected, ${stats.want} on want list. $${stats.totalValue.toLocaleString()} estimated collection value.`;
    const encoded = encodeBinder(binder);
    const url = `${window.location.origin}/binder#binder=${encoded}`;
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  }

  function buildMyOwn() {
    window.location.hash = '';
    setIsViewing(false);
    setBinder({ collected: [], want: [], trade: [], name: '' });
    setViewName('');
  }

  function getTabForSlug(slug: string): Tab | null {
    if (binder.collected.includes(slug)) return 'collected';
    if (binder.want.includes(slug)) return 'want';
    if (binder.trade.includes(slug)) return 'trade';
    return null;
  }

  if (!mounted) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-12 bg-gray-800 rounded-xl animate-pulse mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-52 bg-gray-900 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-indigo-950/60 border border-indigo-800/50 text-indigo-400 text-xs font-medium px-3 py-1.5 rounded-full mb-3">
            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
            Phase 3: Digital Collectibles
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            {isViewing ? `${viewName || 'A Collector'}'s Binder` : 'My Digital Binder'}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {isViewing
              ? `Viewing a shared binder with ${stats.total} cards`
              : 'Collect, organize, and trade cards. Your personal digital collection.'}
          </p>
        </div>
        {isViewing ? (
          <button onClick={buildMyOwn} className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm">
            Build My Own
          </button>
        ) : !isViewing && binder.name === '' ? (
          <input
            type="text"
            value={binder.name}
            onChange={e => setBinder(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Name your binder"
            className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm w-full sm:w-64 focus:border-indigo-500 focus:outline-none transition-colors placeholder:text-gray-600"
          />
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold">{binder.name}</span>
            <button onClick={() => setBinder(prev => ({ ...prev, name: '' }))} className="text-gray-500 hover:text-gray-400 text-xs">edit</button>
          </div>
        )}
      </div>

      {/* Stats bar */}
      {stats.total > 0 && (
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 bg-gray-900/80 border border-gray-800 rounded-xl px-4 sm:px-5 py-3 mb-6">
          <div>
            <p className="text-gray-500 text-xs">Collected</p>
            <p className="text-white font-bold">{stats.collected}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Want List</p>
            <p className="text-amber-400 font-bold">{stats.want}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">For Trade</p>
            <p className="text-sky-400 font-bold">{stats.trade}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Est. Value</p>
            <p className="text-emerald-400 font-bold">${stats.totalValue.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Sports</p>
            <p className="text-white font-bold">{stats.sports.map(s => SPORT_ICONS[s] || s).join(' ')}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Years</p>
            <p className="text-white font-bold">{stats.yearRange}</p>
          </div>
          {!isViewing && stats.total > 0 && (
            <div className="ml-auto flex items-center gap-2">
              <button onClick={shareBinder} className="inline-flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-white text-xs sm:text-sm font-medium px-3 sm:px-4 py-2 rounded-lg border border-gray-700 transition-colors">
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
              <button onClick={shareToX} className="inline-flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-white text-xs sm:text-sm font-medium px-3 sm:px-4 py-2 rounded-lg border border-gray-700 transition-colors">
                Share to X
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {TABS.map(tab => {
          const count = binder[tab.key].length;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-indigo-600/20 border border-indigo-600/50 text-indigo-300'
                  : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.key ? 'bg-indigo-600/30 text-indigo-300' : 'bg-gray-800 text-gray-500'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Filter & Sort bar */}
      {activeCards.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <select
            value={sportFilter}
            onChange={e => setSportFilter(e.target.value as Sport | 'all')}
            className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
          >
            <option value="all">All Sports</option>
            <option value="baseball">{SPORT_ICONS.baseball} Baseball</option>
            <option value="basketball">{SPORT_ICONS.basketball} Basketball</option>
            <option value="football">{SPORT_ICONS.football} Football</option>
            <option value="hockey">{SPORT_ICONS.hockey} Hockey</option>
          </select>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortKey)}
            className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
          >
            <option value="recent">Recently Added</option>
            <option value="value-high">Value: High to Low</option>
            <option value="value-low">Value: Low to High</option>
            <option value="year-new">Year: Newest</option>
            <option value="year-old">Year: Oldest</option>
            <option value="name">Name: A-Z</option>
          </select>
          <span className="text-gray-500 text-xs ml-auto">{activeCards.length} card{activeCards.length !== 1 ? 's' : ''}</span>
        </div>
      )}

      {/* Card Grid */}
      {activeCards.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
          {activeCards.map(card => {
            const currentTab = getTabForSlug(card.slug);
            return (
              <div key={card.slug} className="group relative bg-gray-900/60 border border-gray-800 rounded-xl p-3 hover:border-indigo-700/40 transition-all">
                <Link href={`/sports/${card.slug}`}>
                  <div className="flex justify-center mb-2">
                    <div className="w-24 sm:w-28">
                      <CardFrame card={card} size="large" />
                    </div>
                  </div>
                  <p className="text-white text-xs font-semibold text-center truncate">{card.player}</p>
                  <p className="text-gray-500 text-[10px] text-center truncate">{card.year} {card.set.split(' ').slice(1, 3).join(' ')}</p>
                  <p className="text-emerald-400 text-xs font-bold text-center mt-0.5">{card.estimatedValueRaw}</p>
                </Link>
                {/* Actions overlay */}
                {!isViewing && (
                  <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => removeCard(card.slug, activeTab)}
                      className="w-6 h-6 bg-red-900/80 hover:bg-red-800 border border-red-700 rounded-full flex items-center justify-center text-red-300 text-xs"
                      title="Remove"
                    >
                      x
                    </button>
                    {activeTab !== 'collected' && (
                      <button
                        onClick={() => moveCard(card.slug, activeTab, 'collected')}
                        className="w-6 h-6 bg-emerald-900/80 hover:bg-emerald-800 border border-emerald-700 rounded-full flex items-center justify-center text-emerald-300 text-[9px]"
                        title="Move to Collected"
                      >
                        C
                      </button>
                    )}
                    {activeTab !== 'want' && (
                      <button
                        onClick={() => moveCard(card.slug, activeTab, 'want')}
                        className="w-6 h-6 bg-amber-900/80 hover:bg-amber-800 border border-amber-700 rounded-full flex items-center justify-center text-amber-300 text-[9px]"
                        title="Move to Want List"
                      >
                        W
                      </button>
                    )}
                    {activeTab !== 'trade' && (
                      <button
                        onClick={() => moveCard(card.slug, activeTab, 'trade')}
                        className="w-6 h-6 bg-sky-900/80 hover:bg-sky-800 border border-sky-700 rounded-full flex items-center justify-center text-sky-300 text-[9px]"
                        title="Move to For Trade"
                      >
                        T
                      </button>
                    )}
                  </div>
                )}
                {/* Tab indicator */}
                {currentTab && currentTab !== activeTab && (
                  <div className="absolute top-1 left-1">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                      currentTab === 'collected' ? 'bg-emerald-900/60 text-emerald-400' :
                      currentTab === 'want' ? 'bg-amber-900/60 text-amber-400' :
                      'bg-sky-900/60 text-sky-400'
                    }`}>
                      {currentTab === 'collected' ? 'Own' : currentTab === 'want' ? 'Want' : 'Trade'}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 mb-8">
          <div className="text-4xl mb-3">{TABS.find(t => t.key === activeTab)?.icon}</div>
          <p className="text-gray-400 text-lg font-medium mb-1">
            {activeTab === 'collected' ? 'No cards collected yet' :
             activeTab === 'want' ? 'Want list is empty' :
             'No cards listed for trade'}
          </p>
          <p className="text-gray-600 text-sm mb-4">
            {activeTab === 'collected' ? 'Search below to add cards you own' :
             activeTab === 'want' ? 'Add cards you are looking for' :
             'Mark cards you are open to trading'}
          </p>
          {!isViewing && (
            <button
              onClick={() => setShowQuickAdd(true)}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
            >
              + Add Cards
            </button>
          )}
        </div>
      )}

      {/* Search / Quick Add */}
      {!isViewing && (showQuickAdd || stats.total > 0) && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-white mb-3">Add cards to your binder</h2>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by player, card name, or set..."
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:border-indigo-500 focus:outline-none transition-colors placeholder:text-gray-600"
            />
          </div>
          {searchResults.length > 0 && (
            <div className="mt-2 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              {searchResults.map(card => {
                const existingTab = getTabForSlug(card.slug);
                return (
                  <div
                    key={card.slug}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800/50 transition-colors border-b border-gray-800 last:border-0"
                  >
                    <span className="text-lg shrink-0">{SPORT_ICONS[card.sport] || ''}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-sm font-medium truncate">{card.name}</p>
                      <p className="text-gray-500 text-xs">{card.player} &middot; {card.year}</p>
                    </div>
                    <div className="text-right shrink-0 mr-2">
                      <p className="text-emerald-400 text-xs font-bold">{card.estimatedValueRaw}</p>
                    </div>
                    {existingTab ? (
                      <span className={`text-xs px-2 py-1 rounded-lg ${
                        existingTab === 'collected' ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-800/50' :
                        existingTab === 'want' ? 'bg-amber-900/40 text-amber-400 border border-amber-800/50' :
                        'bg-sky-900/40 text-sky-400 border border-sky-800/50'
                      }`}>
                        {existingTab === 'collected' ? 'Owned' : existingTab === 'want' ? 'Wanted' : 'Trading'}
                      </span>
                    ) : (
                      <div className="flex gap-1">
                        <button onClick={() => addCard(card.slug, 'collected')} className="text-[10px] px-2 py-1 bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-400 border border-emerald-800/50 rounded-lg transition-colors" title="Add to Collected">
                          + Own
                        </button>
                        <button onClick={() => addCard(card.slug, 'want')} className="text-[10px] px-2 py-1 bg-amber-900/40 hover:bg-amber-800/60 text-amber-400 border border-amber-800/50 rounded-lg transition-colors" title="Add to Want List">
                          + Want
                        </button>
                        <button onClick={() => addCard(card.slug, 'trade')} className="text-[10px] px-2 py-1 bg-sky-900/40 hover:bg-sky-800/60 text-sky-400 border border-sky-800/50 rounded-lg transition-colors" title="Add to Trade List">
                          + Trade
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Starter Packs (empty state) */}
      {!isViewing && stats.total === 0 && mounted && !showQuickAdd && (
        <div className="mb-8">
          <h3 className="text-sm font-bold text-gray-400 mb-3">Quick start: add a starter collection</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              {
                title: 'Classic Baseball',
                desc: 'Mantle, Mays, Aaron, Griffey, Trout',
                slugs: ['1952-topps-mickey-mantle-311', '1952-topps-willie-mays-261', '1954-topps-hank-aaron-128', '1989-upper-deck-ken-griffey-jr-1', '2011-topps-update-mike-trout-us175'],
              },
              {
                title: 'Basketball Legends',
                desc: 'Jordan, LeBron, Kobe, Wemby, Bird',
                slugs: ['1986-87-fleer-michael-jordan-57', '2003-04-topps-chrome-lebron-james-111', '1996-97-topps-chrome-kobe-bryant-138', '2022-23-panini-prizm-victor-wembanyama-258', '1980-81-topps-larry-bird-34'],
              },
              {
                title: 'Football GOATs',
                desc: 'Brady, Mahomes, Manning, Montana, Rice',
                slugs: ['2000-playoff-contenders-tom-brady-144', '2017-panini-prizm-patrick-mahomes-269', '1998-playoff-contenders-peyton-manning-87', '1981-topps-joe-montana-216', '1986-topps-jerry-rice-161'],
              },
            ].map(pack => (
              <button
                key={pack.title}
                onClick={() => {
                  const valid = pack.slugs.filter(s => sportsCards.some(c => c.slug === s));
                  setBinder(prev => ({ ...prev, collected: [...new Set([...prev.collected, ...valid])] }));
                }}
                className="text-left bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-indigo-700/50 transition-all"
              >
                <p className="text-white text-sm font-bold">{pack.title}</p>
                <p className="text-gray-500 text-xs mt-1">{pack.desc}</p>
                <p className="text-indigo-400 text-xs mt-2">+ Add 5 cards</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Binder Summary (when has cards) */}
      {stats.total > 0 && !isViewing && (
        <div className="bg-gradient-to-r from-indigo-950/30 to-gray-900/50 border border-indigo-800/30 rounded-2xl p-5 sm:p-6 mb-8">
          <h3 className="text-white font-bold text-sm mb-3">Binder Overview</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gray-900/60 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-white">{stats.collected}</p>
              <p className="text-emerald-400 text-xs">Collected</p>
            </div>
            <div className="bg-gray-900/60 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-white">{stats.want}</p>
              <p className="text-amber-400 text-xs">Want List</p>
            </div>
            <div className="bg-gray-900/60 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-white">{stats.trade}</p>
              <p className="text-sky-400 text-xs">For Trade</p>
            </div>
            <div className="bg-gray-900/60 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-emerald-400">${stats.totalValue.toLocaleString()}</p>
              <p className="text-gray-500 text-xs">Est. Value</p>
            </div>
          </div>
        </div>
      )}

      {/* Related features */}
      <div className="border-t border-gray-800 pt-8">
        <h3 className="text-sm font-bold text-gray-400 mb-3">Related</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/showcase', label: 'Trophy Case', desc: 'Curate your top 9' },
            { href: '/tools/collection-value', label: 'Collection Value', desc: 'Calculate total worth' },
            { href: '/digital-pack', label: 'Digital Pack', desc: '5 free cards daily' },
            { href: '/tools/daily-pack', label: 'Daily Pack Sim', desc: 'Simulate sealed products' },
            { href: '/tools/trade', label: 'Trade Evaluator', desc: 'Check trade fairness' },
            { href: '/tools/watchlist', label: 'Price Watchlist', desc: 'Track price changes' },
            { href: '/collection', label: 'Set Tracker', desc: 'Track sets you complete' },
            { href: '/my-hub', label: 'Collector Hub', desc: 'Your daily dashboard' },
            { href: '/tools/head-to-head', label: 'Head-to-Head', desc: 'Compare any two cards' },
          ].map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="bg-gray-900 border border-gray-800 rounded-xl p-3 hover:border-indigo-700/40 transition-all"
            >
              <p className="text-white text-sm font-medium">{link.label}</p>
              <p className="text-gray-500 text-xs">{link.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
