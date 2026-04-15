'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { sportsCards, type SportsCard } from '@/data/sports-cards';
import { getVaultCards, type VaultCard } from '@/lib/vault';

function parseValue(v: string): number {
  const m = v.match(/\$([\d,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
}

function formatCurrency(n: number): string {
  if (n >= 1000000) return '$' + (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return '$' + (n / 1000).toFixed(1) + 'K';
  return '$' + n.toLocaleString();
}

const SPORT_COLORS: Record<string, { bg: string; border: string; text: string; accent: string }> = {
  baseball: { bg: 'bg-red-950/40', border: 'border-red-700/50', text: 'text-red-400', accent: 'from-red-900/60 to-red-800/30' },
  basketball: { bg: 'bg-orange-950/40', border: 'border-orange-700/50', text: 'text-orange-400', accent: 'from-orange-900/60 to-orange-800/30' },
  football: { bg: 'bg-blue-950/40', border: 'border-blue-700/50', text: 'text-blue-400', accent: 'from-blue-900/60 to-blue-800/30' },
  hockey: { bg: 'bg-cyan-950/40', border: 'border-cyan-700/50', text: 'text-cyan-400', accent: 'from-cyan-900/60 to-cyan-800/30' },
};

const SPORT_ICONS: Record<string, string> = { baseball: '\u26be', basketball: '\ud83c\udfc0', football: '\ud83c\udfc8', hockey: '\ud83c\udfd2' };

type Theme = 'midnight' | 'classic' | 'emerald' | 'sport';
const THEMES: { id: Theme; label: string; description: string }[] = [
  { id: 'midnight', label: 'Midnight', description: 'Dark navy with gold accents' },
  { id: 'classic', label: 'Classic', description: 'Clean dark with white borders' },
  { id: 'emerald', label: 'Emerald', description: 'Green gradient, premium feel' },
  { id: 'sport', label: 'Sport Colors', description: 'Cards styled by sport' },
];

type Layout = '3x3' | '2x2' | '1x3' | 'featured';
const LAYOUTS: { id: Layout; label: string; slots: number; description: string }[] = [
  { id: '3x3', label: '3x3 Grid', slots: 9, description: 'The full nine' },
  { id: '2x2', label: '2x2 Grid', slots: 4, description: 'Top four picks' },
  { id: '1x3', label: 'Top 3', slots: 3, description: 'Your podium' },
  { id: 'featured', label: 'Featured', slots: 5, description: '1 hero + 4 supporting' },
];

interface ShowcaseData {
  title: string;
  description: string;
  theme: Theme;
  layout: Layout;
  cardSlugs: string[];
  createdAt: string;
}

const STORAGE_KEY = 'cardvault-showcase';
const SAVED_SHOWCASES_KEY = 'cardvault-saved-showcases';

function encodeShowcase(data: ShowcaseData): string {
  try {
    const compact = {
      t: data.title,
      d: data.description,
      th: data.theme,
      l: data.layout,
      c: data.cardSlugs,
    };
    return btoa(encodeURIComponent(JSON.stringify(compact)));
  } catch {
    return '';
  }
}

function decodeShowcase(hash: string): Partial<ShowcaseData> | null {
  try {
    const json = decodeURIComponent(atob(hash));
    const compact = JSON.parse(json);
    return {
      title: compact.t || '',
      description: compact.d || '',
      theme: compact.th || 'midnight',
      layout: compact.l || '3x3',
      cardSlugs: compact.c || [],
    };
  } catch {
    return null;
  }
}

export default function ShowcaseClient() {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<'build' | 'preview'>('build');
  const [title, setTitle] = useState('My Card Showcase');
  const [description, setDescription] = useState('');
  const [theme, setTheme] = useState<Theme>('midnight');
  const [layout, setLayout] = useState<Layout>('3x3');
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'vault'>('all');
  const [sportFilter, setSportFilter] = useState<'all' | string>('all');
  const [copied, setCopied] = useState(false);
  const [vaultSlugs, setVaultSlugs] = useState<Set<string>>(new Set());
  const [savedShowcases, setSavedShowcases] = useState<ShowcaseData[]>([]);

  const maxSlots = LAYOUTS.find(l => l.id === layout)?.slots || 9;

  useEffect(() => {
    setMounted(true);
    const vc = getVaultCards();
    setVaultSlugs(new Set(vc.map(c => c.slug)));

    // Load saved showcases
    try {
      const saved = localStorage.getItem(SAVED_SHOWCASES_KEY);
      if (saved) setSavedShowcases(JSON.parse(saved));
    } catch { /* ignore */ }

    // Check URL hash for shared showcase
    const hash = window.location.hash.slice(1);
    if (hash) {
      const decoded = decodeShowcase(hash);
      if (decoded && decoded.cardSlugs && decoded.cardSlugs.length > 0) {
        setTitle(decoded.title || 'Shared Showcase');
        setDescription(decoded.description || '');
        setTheme(decoded.theme as Theme || 'midnight');
        setLayout(decoded.layout as Layout || '3x3');
        setSelectedSlugs(decoded.cardSlugs);
        setStep('preview');
      }
    }
  }, []);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim() && sportFilter === 'all' && sourceFilter === 'all') return [];
    const q = searchQuery.toLowerCase().trim();
    let pool = sportsCards;
    if (sourceFilter === 'vault') pool = pool.filter(c => vaultSlugs.has(c.slug));
    if (sportFilter !== 'all') pool = pool.filter(c => c.sport === sportFilter);
    if (q) {
      pool = pool.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.player.toLowerCase().includes(q) ||
        c.set.toLowerCase().includes(q)
      );
    }
    return pool.slice(0, 50);
  }, [searchQuery, sourceFilter, sportFilter, vaultSlugs]);

  const selectedCards = useMemo(() => {
    return selectedSlugs
      .map(slug => sportsCards.find(c => c.slug === slug))
      .filter((c): c is SportsCard => !!c);
  }, [selectedSlugs]);

  const totalValue = useMemo(() => {
    return selectedCards.reduce((sum, c) => sum + parseValue(c.estimatedValueRaw), 0);
  }, [selectedCards]);

  const addCard = useCallback((slug: string) => {
    if (selectedSlugs.length >= maxSlots) return;
    if (selectedSlugs.includes(slug)) return;
    setSelectedSlugs(prev => [...prev, slug]);
  }, [selectedSlugs, maxSlots]);

  const removeCard = useCallback((slug: string) => {
    setSelectedSlugs(prev => prev.filter(s => s !== slug));
  }, []);

  const moveCard = useCallback((fromIdx: number, direction: 'up' | 'down') => {
    setSelectedSlugs(prev => {
      const next = [...prev];
      const toIdx = direction === 'up' ? fromIdx - 1 : fromIdx + 1;
      if (toIdx < 0 || toIdx >= next.length) return prev;
      [next[fromIdx], next[toIdx]] = [next[toIdx], next[fromIdx]];
      return next;
    });
  }, []);

  const handleSave = useCallback(() => {
    const showcase: ShowcaseData = {
      title,
      description,
      theme,
      layout,
      cardSlugs: selectedSlugs,
      createdAt: new Date().toISOString(),
    };
    const existing = savedShowcases.filter(s => s.title !== title);
    const updated = [showcase, ...existing].slice(0, 10);
    setSavedShowcases(updated);
    localStorage.setItem(SAVED_SHOWCASES_KEY, JSON.stringify(updated));
  }, [title, description, theme, layout, selectedSlugs, savedShowcases]);

  const handleShare = useCallback(() => {
    const data: ShowcaseData = { title, description, theme, layout, cardSlugs: selectedSlugs, createdAt: new Date().toISOString() };
    const hash = encodeShowcase(data);
    const url = `${window.location.origin}/vault/showcase#${hash}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [title, description, theme, layout, selectedSlugs]);

  const loadShowcase = useCallback((s: ShowcaseData) => {
    setTitle(s.title);
    setDescription(s.description);
    setTheme(s.theme);
    setLayout(s.layout);
    setSelectedSlugs(s.cardSlugs);
  }, []);

  if (!mounted) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-900/60 border border-gray-800 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  // Theme styling helpers
  function getThemeStyles() {
    switch (theme) {
      case 'midnight': return { cardBg: 'bg-slate-900/80', cardBorder: 'border-amber-700/40', titleColor: 'text-amber-400', gridBg: 'bg-gradient-to-br from-slate-950 to-slate-900' };
      case 'classic': return { cardBg: 'bg-gray-900/80', cardBorder: 'border-gray-500/40', titleColor: 'text-white', gridBg: 'bg-gradient-to-br from-gray-950 to-gray-900' };
      case 'emerald': return { cardBg: 'bg-emerald-950/60', cardBorder: 'border-emerald-600/40', titleColor: 'text-emerald-400', gridBg: 'bg-gradient-to-br from-emerald-950 to-teal-950' };
      case 'sport': return { cardBg: '', cardBorder: '', titleColor: 'text-white', gridBg: 'bg-gradient-to-br from-gray-950 to-gray-900' };
    }
  }

  function getCardTheme(card: SportsCard) {
    if (theme === 'sport') {
      const sc = SPORT_COLORS[card.sport] || SPORT_COLORS.baseball;
      return { bg: sc.bg, border: sc.border };
    }
    const t = getThemeStyles();
    return { bg: t.cardBg, border: t.cardBorder };
  }

  const themeStyles = getThemeStyles();

  function getGridClass() {
    switch (layout) {
      case '3x3': return 'grid-cols-3';
      case '2x2': return 'grid-cols-2';
      case '1x3': return 'grid-cols-3';
      case 'featured': return 'grid-cols-2';
    }
  }

  // ── Preview Mode ──
  if (step === 'preview') {
    return (
      <div className="space-y-6">
        {/* Controls bar */}
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => setStep('build')} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors">
            Edit Showcase
          </button>
          <button onClick={handleShare} className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-sm rounded-lg transition-colors">
            {copied ? 'Link Copied!' : 'Share Link'}
          </button>
          <button onClick={handleSave} className="px-4 py-2 bg-indigo-700 hover:bg-indigo-600 text-white text-sm rounded-lg transition-colors">
            Save Showcase
          </button>
          <span className="text-gray-500 text-xs ml-auto">{selectedCards.length} cards | {formatCurrency(totalValue)} total value</span>
        </div>

        {/* Showcase Display */}
        <div className={`${themeStyles.gridBg} border border-gray-800 rounded-2xl p-6 sm:p-8`}>
          <div className="text-center mb-6">
            <h2 className={`text-2xl sm:text-3xl font-bold ${themeStyles.titleColor}`}>{title}</h2>
            {description && <p className="text-gray-400 mt-2 text-sm max-w-lg mx-auto">{description}</p>}
          </div>

          {layout === 'featured' && selectedCards.length > 0 ? (
            <div className="space-y-4">
              {/* Hero card */}
              <div className="flex justify-center">
                <ShowcaseCard card={selectedCards[0]} getCardTheme={getCardTheme} size="large" />
              </div>
              {/* Supporting cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {selectedCards.slice(1, 5).map(card => (
                  <ShowcaseCard key={card.slug} card={card} getCardTheme={getCardTheme} size="small" />
                ))}
              </div>
            </div>
          ) : (
            <div className={`grid ${getGridClass()} gap-3 sm:gap-4`}>
              {selectedCards.slice(0, maxSlots).map(card => (
                <ShowcaseCard key={card.slug} card={card} getCardTheme={getCardTheme} size="medium" />
              ))}
              {selectedCards.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-600">
                  No cards selected. Go back to edit and add cards.
                </div>
              )}
            </div>
          )}

          <div className="text-center mt-6 text-gray-600 text-xs">
            Created with CardVault | {formatCurrency(totalValue)} showcase value
          </div>
        </div>
      </div>
    );
  }

  // ── Build Mode ──
  return (
    <div className="space-y-6">
      {/* Saved Showcases */}
      {savedShowcases.length > 0 && (
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Your Saved Showcases</h3>
          <div className="flex flex-wrap gap-2">
            {savedShowcases.map((s, i) => (
              <button
                key={i}
                onClick={() => loadShowcase(s)}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded-lg border border-gray-700 transition-colors"
              >
                {s.title} ({s.cardSlugs.length} cards)
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Title & Description */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Showcase Details</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="My Card Showcase"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg text-sm focus:outline-none focus:border-emerald-600"
              maxLength={60}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Description (optional)</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="My best pulls from 2024..."
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg text-sm focus:outline-none focus:border-emerald-600"
              maxLength={120}
            />
          </div>
        </div>
      </div>

      {/* Theme & Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Theme</h3>
          <div className="grid grid-cols-2 gap-2">
            {THEMES.map(t => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`px-3 py-2 rounded-lg text-xs text-left transition-colors border ${
                  theme === t.id
                    ? 'bg-emerald-950/60 border-emerald-600/60 text-emerald-400'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
              >
                <div className="font-medium">{t.label}</div>
                <div className="text-gray-500 text-[10px] mt-0.5">{t.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Layout</h3>
          <div className="grid grid-cols-2 gap-2">
            {LAYOUTS.map(l => (
              <button
                key={l.id}
                onClick={() => {
                  setLayout(l.id);
                  if (selectedSlugs.length > l.slots) {
                    setSelectedSlugs(prev => prev.slice(0, l.slots));
                  }
                }}
                className={`px-3 py-2 rounded-lg text-xs text-left transition-colors border ${
                  layout === l.id
                    ? 'bg-emerald-950/60 border-emerald-600/60 text-emerald-400'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
              >
                <div className="font-medium">{l.label} <span className="text-gray-500">({l.slots})</span></div>
                <div className="text-gray-500 text-[10px] mt-0.5">{l.description}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Cards (sortable list) */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-300">
            Selected Cards <span className="text-gray-500 font-normal">({selectedSlugs.length}/{maxSlots})</span>
          </h3>
          {selectedSlugs.length > 0 && (
            <span className="text-xs text-emerald-400">{formatCurrency(totalValue)} total</span>
          )}
        </div>

        {selectedCards.length === 0 ? (
          <div className="text-center py-8 text-gray-600 text-sm">
            Search below to add cards to your showcase.
          </div>
        ) : (
          <div className="space-y-2">
            {selectedCards.map((card, idx) => (
              <div key={card.slug} className="flex items-center gap-2 bg-gray-800/60 border border-gray-700/50 rounded-lg px-3 py-2">
                <span className="text-gray-600 text-xs w-5 text-center">{idx + 1}</span>
                <span className="text-lg">{SPORT_ICONS[card.sport] || ''}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm truncate">{card.player}</div>
                  <div className="text-gray-500 text-xs truncate">{card.name}</div>
                </div>
                <span className="text-emerald-400 text-xs whitespace-nowrap">{formatCurrency(parseValue(card.estimatedValueRaw))}</span>
                <div className="flex gap-1">
                  <button onClick={() => moveCard(idx, 'up')} disabled={idx === 0} className="text-gray-500 hover:text-white disabled:opacity-20 text-xs p-1">
                    &uarr;
                  </button>
                  <button onClick={() => moveCard(idx, 'down')} disabled={idx === selectedCards.length - 1} className="text-gray-500 hover:text-white disabled:opacity-20 text-xs p-1">
                    &darr;
                  </button>
                  <button onClick={() => removeCard(card.slug)} className="text-red-500/60 hover:text-red-400 text-xs p-1">
                    &times;
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Card Search */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Add Cards</h3>

        <div className="flex flex-wrap gap-2 mb-3">
          <div className="flex gap-1">
            <button onClick={() => setSourceFilter('all')} className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${sourceFilter === 'all' ? 'bg-emerald-950/60 border-emerald-600/60 text-emerald-400' : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'}`}>
              All Cards
            </button>
            <button onClick={() => setSourceFilter('vault')} className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${sourceFilter === 'vault' ? 'bg-emerald-950/60 border-emerald-600/60 text-emerald-400' : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'}`}>
              My Vault
            </button>
          </div>
          <div className="flex gap-1">
            {['all', 'baseball', 'basketball', 'football', 'hockey'].map(s => (
              <button key={s} onClick={() => setSportFilter(s)} className={`px-2.5 py-1.5 rounded-lg text-xs border transition-colors ${sportFilter === s ? 'bg-emerald-950/60 border-emerald-600/60 text-emerald-400' : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'}`}>
                {s === 'all' ? 'All' : SPORT_ICONS[s]}
              </button>
            ))}
          </div>
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search by player, card name, or set..."
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg text-sm focus:outline-none focus:border-emerald-600 mb-3"
        />

        {searchResults.length > 0 && (
          <div className="max-h-64 overflow-y-auto space-y-1">
            {searchResults.map(card => {
              const isSelected = selectedSlugs.includes(card.slug);
              const isFull = selectedSlugs.length >= maxSlots;
              return (
                <button
                  key={card.slug}
                  onClick={() => addCard(card.slug)}
                  disabled={isSelected || isFull}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                    isSelected
                      ? 'bg-emerald-950/40 border border-emerald-700/40 text-emerald-400 cursor-default'
                      : isFull
                      ? 'bg-gray-800/40 text-gray-600 cursor-not-allowed'
                      : 'bg-gray-800/40 hover:bg-gray-700/60 text-white border border-transparent'
                  }`}
                >
                  <span className="text-base">{SPORT_ICONS[card.sport] || ''}</span>
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{card.player}</div>
                    <div className="text-gray-500 text-xs truncate">{card.name}</div>
                  </div>
                  <span className="text-emerald-400 text-xs whitespace-nowrap">{formatCurrency(parseValue(card.estimatedValueRaw))}</span>
                  {isSelected && <span className="text-emerald-500 text-xs">Added</span>}
                  {vaultSlugs.has(card.slug) && !isSelected && <span className="text-indigo-400 text-[10px]">VAULT</span>}
                </button>
              );
            })}
          </div>
        )}

        {searchQuery && searchResults.length === 0 && (
          <div className="text-center py-4 text-gray-600 text-sm">No cards found matching &ldquo;{searchQuery}&rdquo;</div>
        )}
      </div>

      {/* Preview Button */}
      <div className="flex gap-3">
        <button
          onClick={() => { handleSave(); setStep('preview'); }}
          disabled={selectedSlugs.length === 0}
          className="flex-1 py-3 bg-emerald-700 hover:bg-emerald-600 disabled:bg-gray-800 disabled:text-gray-600 text-white font-semibold rounded-xl transition-colors text-sm"
        >
          Preview Showcase ({selectedSlugs.length} cards)
        </button>
      </div>

      {/* Quick-add suggestions */}
      {selectedSlugs.length === 0 && (
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Popular Showcase Starters</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { label: 'Most Valuable Cards', filter: () => [...sportsCards].sort((a, b) => parseValue(b.estimatedValueRaw) - parseValue(a.estimatedValueRaw)).slice(0, maxSlots) },
              { label: 'Best Rookie Cards', filter: () => sportsCards.filter(c => c.rookie).sort((a, b) => parseValue(b.estimatedValueRaw) - parseValue(a.estimatedValueRaw)).slice(0, maxSlots) },
              { label: 'Vintage Legends (Pre-1980)', filter: () => sportsCards.filter(c => c.year < 1980).sort((a, b) => parseValue(b.estimatedValueRaw) - parseValue(a.estimatedValueRaw)).slice(0, maxSlots) },
              { label: 'Modern Stars (2020+)', filter: () => sportsCards.filter(c => c.year >= 2020).sort((a, b) => parseValue(b.estimatedValueRaw) - parseValue(a.estimatedValueRaw)).slice(0, maxSlots) },
            ].map(preset => (
              <button
                key={preset.label}
                onClick={() => setSelectedSlugs(preset.filter().map(c => c.slug))}
                className="px-4 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-left transition-colors"
              >
                <div className="text-white text-sm font-medium">{preset.label}</div>
                <div className="text-gray-500 text-xs">Auto-select top {maxSlots} cards</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Showcase Card Component ──
function ShowcaseCard({ card, getCardTheme, size }: { card: SportsCard; getCardTheme: (c: SportsCard) => { bg: string; border: string }; size: 'small' | 'medium' | 'large' }) {
  const ct = getCardTheme(card);
  const value = parseValue(card.estimatedValueRaw);

  const sizeClasses = {
    small: 'p-2 sm:p-3',
    medium: 'p-3 sm:p-4',
    large: 'p-4 sm:p-6 max-w-sm mx-auto w-full',
  };

  return (
    <Link href={`/cards/${card.slug}`} className={`block ${ct.bg} border ${ct.border} rounded-xl ${sizeClasses[size]} hover:scale-[1.02] transition-transform`}>
      <div className="text-center">
        <div className={`${size === 'large' ? 'text-3xl' : size === 'medium' ? 'text-2xl' : 'text-xl'} mb-1`}>
          {SPORT_ICONS[card.sport] || ''}
        </div>
        <div className={`text-white font-bold ${size === 'large' ? 'text-lg' : size === 'medium' ? 'text-sm' : 'text-xs'} truncate`}>
          {card.player}
        </div>
        <div className={`text-gray-400 ${size === 'large' ? 'text-sm' : 'text-[10px]'} truncate mt-0.5`}>
          {card.set}
        </div>
        {card.rookie && (
          <span className={`inline-block mt-1 px-1.5 py-0.5 bg-amber-950/60 border border-amber-700/40 text-amber-400 rounded ${size === 'large' ? 'text-xs' : 'text-[9px]'}`}>
            RC
          </span>
        )}
        <div className={`text-emerald-400 font-semibold mt-1 ${size === 'large' ? 'text-base' : size === 'medium' ? 'text-xs' : 'text-[10px]'}`}>
          {formatCurrency(value)}
        </div>
      </div>
    </Link>
  );
}
