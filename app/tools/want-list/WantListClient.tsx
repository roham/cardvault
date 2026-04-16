'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';

/* ─── Types ──────────────────────────────────────────────── */
interface WantItem {
  id: string;
  name: string;
  set?: string;
  year?: string;
  sport: string;
  priority: 'high' | 'medium' | 'low';
  maxPrice: string;
  notes: string;
  found: boolean;
}

interface CardOption {
  name: string;
  slug: string;
  sport: string;
  year: number;
  set: string;
}

const PRIORITY_CONFIG = {
  high: { label: 'Need Now', color: 'text-red-400', bg: 'bg-red-900/30 border-red-800/50', icon: '🔴' },
  medium: { label: 'Want', color: 'text-yellow-400', bg: 'bg-yellow-900/30 border-yellow-800/50', icon: '🟡' },
  low: { label: 'Eventually', color: 'text-slate-400', bg: 'bg-slate-800/30 border-slate-700/50', icon: '⚪' },
};

const SPORT_FILTERS = ['all', 'baseball', 'basketball', 'football', 'hockey', 'pokemon', 'other'] as const;

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/* ─── Sharing via URL hash ───────────────────────────────── */
function encodeList(items: WantItem[]): string {
  const compressed = items.map(i => ({
    n: i.name,
    s: i.set || '',
    y: i.year || '',
    sp: i.sport,
    p: i.priority[0], // h/m/l
    m: i.maxPrice,
    f: i.found ? 1 : 0,
  }));
  return btoa(JSON.stringify(compressed));
}

function decodeList(hash: string): WantItem[] | null {
  try {
    const data = JSON.parse(atob(hash));
    return data.map((d: { n: string; s: string; y: string; sp: string; p: string; m: string; f: number }) => ({
      id: generateId(),
      name: d.n,
      set: d.s || undefined,
      year: d.y || undefined,
      sport: d.sp,
      priority: d.p === 'h' ? 'high' : d.p === 'm' ? 'medium' : 'low',
      maxPrice: d.m || '',
      notes: '',
      found: d.f === 1,
    }));
  } catch {
    return null;
  }
}

/* ─── Component ──────────────────────────────────────────── */
export default function WantListClient({ cards }: { cards: CardOption[] }) {
  const [items, setItems] = useState<WantItem[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState<typeof SPORT_FILTERS[number]>('all');
  const [showFound, setShowFound] = useState(false);
  const [search, setSearch] = useState('');
  const [cardSearch, setCardSearch] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [sortBy, setSortBy] = useState<'priority' | 'name' | 'sport'>('priority');

  // New item form
  const [newName, setNewName] = useState('');
  const [newSet, setNewSet] = useState('');
  const [newYear, setNewYear] = useState('');
  const [newSport, setNewSport] = useState('baseball');
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [newMaxPrice, setNewMaxPrice] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Load from localStorage or URL hash
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.slice(1);
      if (hash) {
        const decoded = decodeList(hash);
        if (decoded) {
          setItems(decoded);
          return;
        }
      }
      const saved = localStorage.getItem('cardvault-want-list');
      if (saved) {
        try { setItems(JSON.parse(saved)); } catch { /* ignore */ }
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && items.length > 0) {
      localStorage.setItem('cardvault-want-list', JSON.stringify(items));
    }
  }, [items]);

  // Card search suggestions
  const cardSuggestions = useMemo(() => {
    if (cardSearch.length < 2) return [];
    const q = cardSearch.toLowerCase();
    return cards.filter(c => c.name.toLowerCase().includes(q)).slice(0, 8);
  }, [cardSearch, cards]);

  const addItem = useCallback(() => {
    if (!newName.trim()) return;
    setItems(prev => [...prev, {
      id: generateId(),
      name: newName.trim(),
      set: newSet.trim() || undefined,
      year: newYear.trim() || undefined,
      sport: newSport,
      priority: newPriority,
      maxPrice: newMaxPrice.trim(),
      notes: newNotes.trim(),
      found: false,
    }]);
    setNewName(''); setNewSet(''); setNewYear(''); setNewMaxPrice(''); setNewNotes('');
    setCardSearch('');
    setShowAdd(false);
  }, [newName, newSet, newYear, newSport, newPriority, newMaxPrice, newNotes]);

  const addFromCard = useCallback((card: CardOption) => {
    setItems(prev => [...prev, {
      id: generateId(),
      name: card.name,
      set: card.set,
      year: String(card.year),
      sport: card.sport,
      priority: 'medium',
      maxPrice: '',
      notes: '',
      found: false,
    }]);
    setCardSearch('');
  }, []);

  const toggleFound = useCallback((id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, found: !i.found } : i));
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const updatePriority = useCallback((id: string, priority: 'high' | 'medium' | 'low') => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, priority } : i));
  }, []);

  const handleShare = useCallback(() => {
    const encoded = encodeList(items);
    const url = `${window.location.origin}${window.location.pathname}#${encoded}`;
    setShareUrl(url);
    navigator.clipboard?.writeText(url);
  }, [items]);

  const handleCopyText = useCallback(() => {
    const lines = items.filter(i => !i.found).map(i => {
      const parts = [i.name];
      if (i.set) parts.push(`(${i.set})`);
      if (i.maxPrice) parts.push(`- Max: $${i.maxPrice}`);
      parts.push(`[${PRIORITY_CONFIG[i.priority].label}]`);
      return parts.join(' ');
    });
    const text = `My CardVault Want List (${lines.length} cards)\n${'—'.repeat(40)}\n${lines.join('\n')}`;
    navigator.clipboard?.writeText(text);
  }, [items]);

  const clearFound = useCallback(() => {
    setItems(prev => prev.filter(i => !i.found));
  }, []);

  // Filtered + sorted items
  const filtered = useMemo(() => {
    let result = items;
    if (filter !== 'all') result = result.filter(i => i.sport === filter);
    if (!showFound) result = result.filter(i => !i.found);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(i => i.name.toLowerCase().includes(q) || (i.set && i.set.toLowerCase().includes(q)));
    }
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (sortBy === 'priority') result.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    else if (sortBy === 'name') result.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === 'sport') result.sort((a, b) => a.sport.localeCompare(b.sport));
    return result;
  }, [items, filter, showFound, search, sortBy]);

  const stats = useMemo(() => ({
    total: items.length,
    found: items.filter(i => i.found).length,
    remaining: items.filter(i => !i.found).length,
    highPriority: items.filter(i => i.priority === 'high' && !i.found).length,
  }), [items]);

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'text-white' },
          { label: 'Found', value: stats.found, color: 'text-green-400' },
          { label: 'Remaining', value: stats.remaining, color: 'text-amber-400' },
          { label: 'Urgent', value: stats.highPriority, color: 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="bg-slate-800/60 border border-slate-700 rounded-lg p-3 text-center">
            <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Add from Database */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
        <h3 className="text-sm font-bold text-white mb-3">Quick Add from Database</h3>
        <input
          type="text"
          value={cardSearch}
          onChange={e => setCardSearch(e.target.value)}
          placeholder="Search 9,000+ cards to add..."
          className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {cardSuggestions.length > 0 && (
          <div className="mt-2 border border-slate-700 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
            {cardSuggestions.map(c => (
              <button
                key={c.slug}
                onClick={() => addFromCard(c)}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-700/50 border-b border-slate-800 transition-colors"
              >
                <span className="text-white">{c.name}</span>
                <span className="text-xs text-slate-500 ml-2">({c.sport})</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Add Custom Card */}
      <button
        onClick={() => setShowAdd(!showAdd)}
        className="w-full bg-indigo-600/20 border border-indigo-500/40 rounded-lg py-2.5 text-sm font-medium text-indigo-400 hover:bg-indigo-600/30 transition-colors"
      >
        {showAdd ? '− Close' : '+ Add Custom Card'}
      </button>

      {showAdd && (
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 space-y-3">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Card name (e.g., 2024 Topps Chrome Soto RC)"
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="grid grid-cols-2 gap-3">
            <input type="text" value={newSet} onChange={e => setNewSet(e.target.value)} placeholder="Set (optional)" className="bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <input type="text" value={newYear} onChange={e => setNewYear(e.target.value)} placeholder="Year (optional)" className="bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select value={newSport} onChange={e => setNewSport(e.target.value)} className="bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="baseball">Baseball</option>
              <option value="basketball">Basketball</option>
              <option value="football">Football</option>
              <option value="hockey">Hockey</option>
              <option value="pokemon">Pokemon</option>
              <option value="other">Other</option>
            </select>
            <select value={newPriority} onChange={e => setNewPriority(e.target.value as 'high' | 'medium' | 'low')} className="bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="high">🔴 Need Now</option>
              <option value="medium">🟡 Want</option>
              <option value="low">⚪ Eventually</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input type="text" value={newMaxPrice} onChange={e => setNewMaxPrice(e.target.value)} placeholder="Max price ($)" className="bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <input type="text" value={newNotes} onChange={e => setNewNotes(e.target.value)} placeholder="Notes" className="bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <button onClick={addItem} disabled={!newName.trim()} className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-2.5 rounded-lg transition-colors">
            Add to Want List
          </button>
        </div>
      )}

      {/* Filters & Actions */}
      {items.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {SPORT_FILTERS.map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 text-xs rounded-full font-medium border transition-colors ${
                  filter === s
                    ? 'bg-indigo-600/30 border-indigo-500 text-indigo-400'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter list..."
              className="flex-1 bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <select value={sortBy} onChange={e => setSortBy(e.target.value as 'priority' | 'name' | 'sport')} className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="priority">Sort: Priority</option>
              <option value="name">Sort: Name</option>
              <option value="sport">Sort: Sport</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={() => setShowFound(!showFound)} className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${showFound ? 'bg-green-900/30 border-green-700 text-green-400' : 'bg-slate-800/50 border-slate-700 text-slate-400'}`}>
              {showFound ? 'Hide Found' : `Show Found (${stats.found})`}
            </button>
            <button onClick={handleShare} className="px-3 py-1.5 text-xs rounded-full border bg-slate-800/50 border-slate-700 text-slate-400 hover:text-white transition-colors">
              Share Link
            </button>
            <button onClick={handleCopyText} className="px-3 py-1.5 text-xs rounded-full border bg-slate-800/50 border-slate-700 text-slate-400 hover:text-white transition-colors">
              Copy as Text
            </button>
            {stats.found > 0 && (
              <button onClick={clearFound} className="px-3 py-1.5 text-xs rounded-full border bg-red-900/20 border-red-800/40 text-red-400 hover:text-red-300 transition-colors">
                Clear Found ({stats.found})
              </button>
            )}
          </div>

          {shareUrl && (
            <div className="bg-green-900/20 border border-green-700/40 rounded-lg p-3">
              <p className="text-xs text-green-400 mb-1">Link copied to clipboard!</p>
              <p className="text-xs text-slate-400 break-all">{shareUrl}</p>
            </div>
          )}
        </div>
      )}

      {/* Want List Items */}
      {filtered.length === 0 && items.length === 0 && (
        <div className="bg-slate-800/40 border border-slate-700 border-dashed rounded-xl p-8 text-center">
          <p className="text-3xl mb-3">📋</p>
          <p className="text-white font-bold mb-1">Your Want List is Empty</p>
          <p className="text-sm text-slate-400">Search the database above or add custom cards to start building your want list.</p>
        </div>
      )}

      {filtered.length === 0 && items.length > 0 && (
        <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-6 text-center">
          <p className="text-sm text-slate-400">No cards match your current filters.</p>
        </div>
      )}

      <div className="space-y-2">
        {filtered.map(item => (
          <div
            key={item.id}
            className={`border rounded-lg p-3 transition-all ${
              item.found
                ? 'bg-green-900/10 border-green-800/30 opacity-60'
                : PRIORITY_CONFIG[item.priority].bg
            }`}
          >
            <div className="flex items-start gap-3">
              <button
                onClick={() => toggleFound(item.id)}
                className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                  item.found
                    ? 'bg-green-600 border-green-600 text-white'
                    : 'border-slate-600 hover:border-slate-400'
                }`}
              >
                {item.found && <span className="text-xs">✓</span>}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className={`text-sm font-medium ${item.found ? 'line-through text-slate-500' : 'text-white'}`}>
                    {item.name}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {item.set && <span className="text-slate-500">{item.set}</span>}
                  {item.year && <span className="text-slate-500">{item.year}</span>}
                  <span className="text-slate-600">{item.sport}</span>
                  {item.maxPrice && (
                    <span className="text-emerald-400">Max: ${item.maxPrice}</span>
                  )}
                  {item.notes && <span className="text-slate-500 italic">{item.notes}</span>}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {(['high', 'medium', 'low'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => updatePriority(item.id, p)}
                    className={`text-xs px-1.5 py-0.5 rounded transition-colors ${
                      item.priority === p ? PRIORITY_CONFIG[p].color + ' font-bold' : 'text-slate-600 hover:text-slate-400'
                    }`}
                    title={PRIORITY_CONFIG[p].label}
                  >
                    {PRIORITY_CONFIG[p].icon}
                  </button>
                ))}
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-slate-600 hover:text-red-400 text-xs ml-1 transition-colors"
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tips */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Want List Tips</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { title: 'Print for Card Shows', tip: 'Copy your list as text and print it before heading to a card show. Dealers love when buyers know exactly what they want — you will get better prices.', icon: '🖨️' },
            { title: 'Set Max Prices', tip: 'Adding max prices prevents impulse buying. At card shows, the excitement can make you overpay. Your want list price keeps you disciplined.', icon: '💰' },
            { title: 'Share with Dealers', tip: 'Share your want list URL with dealers and card shop owners. Many will reach out when they get your cards in stock. It is free networking.', icon: '🤝' },
            { title: 'Use Priority Wisely', tip: 'Mark cards as "Need Now" only for true needs (set completion, time-sensitive buys). "Want" for most cards. "Eventually" for wish list items with no urgency.', icon: '🎯' },
          ].map(item => (
            <div key={item.title} className="bg-slate-700/30 border border-slate-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{item.icon}</span>
                <h3 className="text-sm font-bold text-white">{item.title}</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{item.tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
