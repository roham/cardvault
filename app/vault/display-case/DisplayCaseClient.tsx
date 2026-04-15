'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

interface DisplaySlot {
  index: number;
  slug: string | null;
}

interface SavedLayout {
  id: string;
  name: string;
  rows: number;
  cols: number;
  slots: (string | null)[];
  createdAt: number;
}

type CaseSize = '2x2' | '3x3' | '3x4' | '4x4' | '4x5';

const CASE_SIZES: Record<CaseSize, { rows: number; cols: number; label: string }> = {
  '2x2': { rows: 2, cols: 2, label: '2×2 (4 cards)' },
  '3x3': { rows: 3, cols: 3, label: '3×3 (9 cards)' },
  '3x4': { rows: 3, cols: 4, label: '3×4 (12 cards)' },
  '4x4': { rows: 4, cols: 4, label: '4×4 (16 cards)' },
  '4x5': { rows: 4, cols: 5, label: '4×5 (20 cards)' },
};

const SPORT_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  baseball: { bg: 'bg-red-950/60', border: 'border-red-700/60', text: 'text-red-400' },
  basketball: { bg: 'bg-orange-950/60', border: 'border-orange-700/60', text: 'text-orange-400' },
  football: { bg: 'bg-blue-950/60', border: 'border-blue-700/60', text: 'text-blue-400' },
  hockey: { bg: 'bg-cyan-950/60', border: 'border-cyan-700/60', text: 'text-cyan-400' },
};

function parseValue(raw: string): number {
  const m = raw.match(/\$[\d,]+/);
  if (!m) return 0;
  return parseInt(m[0].replace(/[$,]/g, ''), 10);
}

const LS_KEY = 'cardvault-display-cases';

export default function DisplayCaseClient() {
  const [mounted, setMounted] = useState(false);
  const [caseSize, setCaseSize] = useState<CaseSize>('3x3');
  const [slots, setSlots] = useState<(string | null)[]>(Array(9).fill(null));
  const [savedLayouts, setSavedLayouts] = useState<SavedLayout[]>([]);
  const [layoutName, setLayoutName] = useState('My Display Case');
  const [query, setQuery] = useState('');
  const [sportFilter, setSportFilter] = useState<string>('all');
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) setSavedLayouts(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(LS_KEY, JSON.stringify(savedLayouts));
  }, [savedLayouts, mounted]);

  const { rows, cols } = CASE_SIZES[caseSize];

  const changeSize = useCallback((newSize: CaseSize) => {
    const { rows: r, cols: c } = CASE_SIZES[newSize];
    const total = r * c;
    const newSlots = Array(total).fill(null);
    // Preserve existing cards that fit
    for (let i = 0; i < Math.min(slots.length, total); i++) {
      newSlots[i] = slots[i];
    }
    setCaseSize(newSize);
    setSlots(newSlots);
    setSelectedSlot(null);
  }, [slots]);

  const searchResults = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    const usedSlugs = new Set(slots.filter(Boolean));
    return sportsCards
      .filter(c => {
        if (sportFilter !== 'all' && c.sport !== sportFilter) return false;
        if (usedSlugs.has(c.slug)) return false;
        return c.name.toLowerCase().includes(q) || c.player.toLowerCase().includes(q);
      })
      .slice(0, 10);
  }, [query, sportFilter, slots]);

  const placeCard = useCallback((slug: string) => {
    if (selectedSlot === null) {
      // Find first empty slot
      const emptyIdx = slots.findIndex(s => s === null);
      if (emptyIdx === -1) return;
      setSlots(prev => {
        const next = [...prev];
        next[emptyIdx] = slug;
        return next;
      });
    } else {
      setSlots(prev => {
        const next = [...prev];
        next[selectedSlot] = slug;
        return next;
      });
      setSelectedSlot(null);
    }
    setQuery('');
  }, [selectedSlot, slots]);

  const removeCard = useCallback((index: number) => {
    setSlots(prev => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setSlots(Array(rows * cols).fill(null));
    setSelectedSlot(null);
  }, [rows, cols]);

  const autoArrange = useCallback((mode: 'value' | 'sport' | 'year' | 'rookie') => {
    const filled = slots.filter(Boolean) as string[];
    const cards = filled.map(slug => sportsCards.find(c => c.slug === slug)).filter(Boolean);

    switch (mode) {
      case 'value':
        cards.sort((a, b) => parseValue(b!.estimatedValueRaw) - parseValue(a!.estimatedValueRaw));
        break;
      case 'sport':
        cards.sort((a, b) => a!.sport.localeCompare(b!.sport));
        break;
      case 'year':
        cards.sort((a, b) => a!.year - b!.year);
        break;
      case 'rookie':
        cards.sort((a, b) => (b!.rookie ? 1 : 0) - (a!.rookie ? 1 : 0));
        break;
    }

    const newSlots: (string | null)[] = Array(rows * cols).fill(null);
    cards.forEach((card, i) => {
      if (i < newSlots.length) newSlots[i] = card!.slug;
    });
    setSlots(newSlots);
  }, [slots, rows, cols]);

  const saveLayout = useCallback(() => {
    const layout: SavedLayout = {
      id: Date.now().toString(36),
      name: layoutName || 'Untitled',
      rows,
      cols,
      slots: [...slots],
      createdAt: Date.now(),
    };
    setSavedLayouts(prev => [...prev, layout]);
  }, [layoutName, rows, cols, slots]);

  const loadLayout = useCallback((layout: SavedLayout) => {
    const sizeKey = `${layout.rows}x${layout.cols}` as CaseSize;
    if (CASE_SIZES[sizeKey]) {
      setCaseSize(sizeKey);
    }
    setSlots([...layout.slots]);
    setLayoutName(layout.name);
    setShowSaved(false);
  }, []);

  const deleteLayout = useCallback((id: string) => {
    setSavedLayouts(prev => prev.filter(l => l.id !== id));
  }, []);

  const filledCount = slots.filter(Boolean).length;
  const totalSlots = rows * cols;
  const totalValue = useMemo(() => {
    return slots.reduce((sum, slug) => {
      if (!slug) return sum;
      const card = sportsCards.find(c => c.slug === slug);
      return sum + (card ? parseValue(card.estimatedValueRaw) : 0);
    }, 0);
  }, [slots]);

  const sportCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const slug of slots) {
      if (!slug) continue;
      const card = sportsCards.find(c => c.slug === slug);
      if (card) counts[card.sport] = (counts[card.sport] || 0) + 1;
    }
    return counts;
  }, [slots]);

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="h-24 bg-gray-800/50 rounded-xl animate-pulse" />
        <div className="h-64 bg-gray-800/50 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex-1">
            <label className="text-sm text-gray-400 mb-1 block">Layout Name</label>
            <input
              type="text"
              value={layoutName}
              onChange={e => setLayoutName(e.target.value)}
              className="bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 w-full sm:w-64"
              placeholder="My Display Case"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Case Size</label>
            <select
              value={caseSize}
              onChange={e => changeSize(e.target.value as CaseSize)}
              className="bg-gray-900 border border-gray-700 text-gray-300 rounded-lg px-3 py-2"
            >
              {Object.entries(CASE_SIZES).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 pt-5">
            <button
              onClick={saveLayout}
              className="px-4 py-2 bg-emerald-900/60 border border-emerald-800/50 text-emerald-400 rounded-lg text-sm font-medium hover:bg-emerald-900/80 transition-colors"
            >
              Save Layout
            </button>
            <button
              onClick={() => setShowSaved(!showSaved)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              Saved ({savedLayouts.length})
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex gap-6 mt-4 pt-4 border-t border-gray-700/50">
          <div className="text-center">
            <div className="text-lg font-bold text-white">{filledCount}/{totalSlots}</div>
            <div className="text-xs text-gray-500">Filled</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-emerald-400">${totalValue.toLocaleString()}</div>
            <div className="text-xs text-gray-500">Total Value</div>
          </div>
          {Object.entries(sportCounts).map(([sport, count]) => (
            <div key={sport} className="text-center">
              <div className={`text-lg font-bold ${SPORT_COLORS[sport]?.text || 'text-gray-400'}`}>{count}</div>
              <div className="text-xs text-gray-500 capitalize">{sport}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Saved Layouts */}
      {showSaved && savedLayouts.length > 0 && (
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Saved Layouts</h3>
          <div className="space-y-2">
            {savedLayouts.map(layout => (
              <div key={layout.id} className="flex items-center gap-3 bg-gray-900/50 rounded-lg p-3">
                <div className="flex-1">
                  <div className="text-sm text-white font-medium">{layout.name}</div>
                  <div className="text-xs text-gray-500">
                    {layout.rows}×{layout.cols} &middot; {layout.slots.filter(Boolean).length} cards &middot;
                    {new Date(layout.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <button onClick={() => loadLayout(layout)} className="text-xs text-emerald-400 hover:text-emerald-300">Load</button>
                <button onClick={() => deleteLayout(layout.id)} className="text-xs text-red-400 hover:text-red-300">Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Display Case Grid */}
      <div className="bg-gray-900/80 border-2 border-amber-800/40 rounded-2xl p-4 sm:p-6">
        <div
          className="grid gap-2 sm:gap-3"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {slots.map((slug, i) => {
            const card = slug ? sportsCards.find(c => c.slug === slug) : null;
            const colors = card ? SPORT_COLORS[card.sport] : null;
            const isSelected = selectedSlot === i;

            return (
              <div
                key={i}
                onClick={() => {
                  if (slug) {
                    // Click filled slot to select for replacement or removal
                    setSelectedSlot(isSelected ? null : i);
                  } else {
                    setSelectedSlot(isSelected ? null : i);
                  }
                }}
                className={`aspect-[2.5/3.5] rounded-lg border-2 flex flex-col items-center justify-center p-1.5 sm:p-2 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-emerald-400 ring-2 ring-emerald-400/30 bg-emerald-950/20'
                    : slug && colors
                    ? `${colors.bg} ${colors.border} hover:brightness-110`
                    : 'border-gray-700/50 border-dashed bg-gray-800/20 hover:border-gray-600'
                }`}
              >
                {card ? (
                  <>
                    <div className={`text-[10px] sm:text-xs font-bold ${colors?.text || 'text-white'} text-center leading-tight`}>
                      {card.player}
                    </div>
                    <div className="text-[8px] sm:text-[10px] text-gray-400 text-center leading-tight mt-0.5">
                      {card.year} {card.set.replace(/^\d{4}(-\d{2})?\s+/, '')}
                    </div>
                    <div className="text-[9px] sm:text-xs font-medium text-white mt-1">
                      {card.estimatedValueRaw.split('(')[0].trim()}
                    </div>
                    {card.rookie && (
                      <span className="text-[7px] sm:text-[8px] bg-amber-500/20 text-amber-400 px-1 rounded mt-0.5">RC</span>
                    )}
                    <button
                      onClick={e => { e.stopPropagation(); removeCard(i); }}
                      className="text-[10px] text-gray-600 hover:text-red-400 mt-1 transition-colors"
                    >
                      remove
                    </button>
                  </>
                ) : (
                  <div className="text-gray-600 text-xs text-center">
                    {isSelected ? 'Selected' : `Slot ${i + 1}`}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Auto-Arrange */}
      {filledCount > 1 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-500 py-1.5">Arrange by:</span>
          {[
            { mode: 'value' as const, label: 'Value (High→Low)' },
            { mode: 'sport' as const, label: 'Sport' },
            { mode: 'year' as const, label: 'Year (Old→New)' },
            { mode: 'rookie' as const, label: 'Rookies First' },
          ].map(btn => (
            <button
              key={btn.mode}
              onClick={() => autoArrange(btn.mode)}
              className="px-3 py-1.5 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg text-xs hover:bg-gray-700 hover:text-white transition-colors"
            >
              {btn.label}
            </button>
          ))}
          <button
            onClick={clearAll}
            className="px-3 py-1.5 bg-red-900/30 border border-red-800/30 text-red-400 rounded-lg text-xs hover:bg-red-900/50 transition-colors ml-auto"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Add Cards */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-white mb-3">
          Add Cards {selectedSlot !== null && <span className="text-emerald-400 text-sm font-normal">→ Slot {selectedSlot + 1}</span>}
        </h3>
        <div className="flex gap-2 mb-3">
          <select
            value={sportFilter}
            onChange={e => setSportFilter(e.target.value)}
            className="bg-gray-900 border border-gray-700 text-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">All Sports</option>
            <option value="baseball">Baseball</option>
            <option value="basketball">Basketball</option>
            <option value="football">Football</option>
            <option value="hockey">Hockey</option>
          </select>
          <input
            type="text"
            placeholder="Search cards by name or player..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2 placeholder-gray-500"
          />
        </div>

        {searchResults.length > 0 && (
          <div className="bg-gray-900 border border-gray-700 rounded-lg max-h-48 overflow-y-auto">
            {searchResults.map(card => (
              <button
                key={card.slug}
                onClick={() => placeCard(card.slug)}
                className="w-full text-left px-4 py-2 border-b border-gray-800 last:border-0 flex items-center gap-3 hover:bg-gray-800 transition-colors"
              >
                <span className={`w-2 h-2 rounded-full ${
                  card.sport === 'baseball' ? 'bg-red-500' :
                  card.sport === 'basketball' ? 'bg-orange-500' :
                  card.sport === 'football' ? 'bg-blue-500' : 'bg-cyan-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white truncate">{card.name}</div>
                  <div className="text-xs text-gray-500">{card.player} &middot; {card.sport}</div>
                </div>
                <div className="text-sm text-gray-400 shrink-0">{card.estimatedValueRaw.split('(')[0].trim()}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Display Tips */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-white mb-4">Display Case Tips</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { title: 'Anchor with your best card', tip: 'Place your highest-value slab in the center position. It draws the eye first and anchors the entire display.' },
            { title: 'Group by theme', tip: 'Sport-specific displays look cleaner than mixed. If mixing, alternate sports in a checkerboard pattern.' },
            { title: 'Consider the gradient', tip: 'Arrange by value from center outward, or by era from top-left to bottom-right. Avoid random placement.' },
            { title: 'Avoid direct sunlight', tip: 'UV exposure fades card colors and degrades holders over time. Place display cases away from windows.' },
            { title: 'Leave room for growth', tip: 'A 3×4 case with 9 cards and 3 empty slots looks intentional. Overcrowding diminishes each card.' },
            { title: 'Rotate seasonally', tip: 'Swap cards based on the sports calendar. Football slabs during NFL season, baseball during summer.' },
          ].map((t, i) => (
            <div key={i} className="bg-gray-900/50 rounded-lg p-3">
              <div className="text-sm font-medium text-amber-400 mb-1">{t.title}</div>
              <div className="text-xs text-gray-400">{t.tip}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Related */}
      <div className="flex flex-wrap gap-2">
        {[
          { href: '/vault', label: 'My Vault' },
          { href: '/vault/showcase', label: 'Collection Showcase' },
          { href: '/tools/slab-weight', label: 'Slab Weight Verifier' },
          { href: '/tools/centering-check', label: 'Centering Checker' },
          { href: '/tools/holder-guide', label: 'Holder Size Guide' },
          { href: '/tools/condition-grader', label: 'Condition Grader' },
        ].map(link => (
          <Link
            key={link.href}
            href={link.href}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white border border-gray-700 rounded-lg text-xs transition-colors"
          >
            {link.label} &rarr;
          </Link>
        ))}
      </div>
    </div>
  );
}
