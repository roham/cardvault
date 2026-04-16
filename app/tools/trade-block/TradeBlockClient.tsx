'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';

/* ─── Types ──────────────────────────────────────────────── */
interface TradeItem {
  id: string;
  name: string;
  set?: string;
  year?: string;
  sport: string;
  condition: string;
  askingPrice: string;
  openToOffers: boolean;
  notes: string;
  traded: boolean;
}

interface CardOption {
  name: string;
  slug: string;
  sport: string;
  year: number;
  set: string;
}

const CONDITIONS = [
  'Raw - Mint',
  'Raw - Near Mint',
  'Raw - Excellent',
  'Raw - Good',
  'Raw - Fair',
  'PSA 10',
  'PSA 9',
  'PSA 8',
  'PSA 7',
  'PSA 6 or lower',
  'BGS 10 Black Label',
  'BGS 9.5 Gem Mint',
  'BGS 9',
  'BGS 8.5 or lower',
  'CGC 10 Pristine',
  'CGC 9.5',
  'CGC 9',
  'CGC 8.5 or lower',
  'SGC 10',
  'SGC 9.5',
  'SGC 9',
  'SGC 8 or lower',
] as const;

const SPORT_FILTERS = ['all', 'baseball', 'basketball', 'football', 'hockey', 'pokemon', 'other'] as const;

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/* ─── Sharing via URL hash ───────────────────────────────── */
function encodeBlock(items: TradeItem[]): string {
  const compressed = items.map(i => ({
    n: i.name,
    s: i.set || '',
    y: i.year || '',
    sp: i.sport,
    c: i.condition,
    a: i.askingPrice,
    o: i.openToOffers ? 1 : 0,
    t: i.traded ? 1 : 0,
  }));
  return btoa(JSON.stringify(compressed));
}

function decodeBlock(hash: string): TradeItem[] | null {
  try {
    const data = JSON.parse(atob(hash));
    return data.map((d: { n: string; s: string; y: string; sp: string; c: string; a: string; o: number; t: number }) => ({
      id: genId(),
      name: d.n,
      set: d.s || undefined,
      year: d.y || undefined,
      sport: d.sp,
      condition: d.c || 'Raw - Near Mint',
      askingPrice: d.a || '',
      openToOffers: d.o === 1,
      notes: '',
      traded: d.t === 1,
    }));
  } catch {
    return null;
  }
}

/* ─── Component ──────────────────────────────────────────── */
export default function TradeBlockClient({ cards }: { cards: CardOption[] }) {
  const [items, setItems] = useState<TradeItem[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState<typeof SPORT_FILTERS[number]>('all');
  const [showTraded, setShowTraded] = useState(false);
  const [search, setSearch] = useState('');
  const [cardSearch, setCardSearch] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'sport' | 'value'>('recent');

  /* Custom entry form */
  const [cName, setCName] = useState('');
  const [cSet, setCSet] = useState('');
  const [cYear, setCYear] = useState('');
  const [cSport, setCSport] = useState('baseball');
  const [cCondition, setCCondition] = useState('Raw - Near Mint');
  const [cPrice, setCPrice] = useState('');
  const [cOffers, setCOffers] = useState(true);
  const [cNotes, setCNotes] = useState('');

  /* Load from localStorage or hash on mount */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash.slice(1);
    if (hash) {
      const decoded = decodeBlock(hash);
      if (decoded) { setItems(decoded); return; }
    }
    const saved = localStorage.getItem('cv-trade-block');
    if (saved) {
      try { setItems(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  /* Auto-save to localStorage */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('cv-trade-block', JSON.stringify(items));
  }, [items]);

  /* Quick-add from database */
  const cardMatches = useMemo(() => {
    if (cardSearch.length < 2) return [];
    const q = cardSearch.toLowerCase();
    return cards.filter(c => c.name.toLowerCase().includes(q)).slice(0, 8);
  }, [cardSearch, cards]);

  const addFromDb = useCallback((c: CardOption) => {
    setItems(prev => [...prev, {
      id: genId(),
      name: c.name,
      set: c.set,
      year: String(c.year),
      sport: c.sport,
      condition: 'Raw - Near Mint',
      askingPrice: '',
      openToOffers: true,
      notes: '',
      traded: false,
    }]);
    setCardSearch('');
  }, []);

  const addCustom = useCallback(() => {
    if (!cName.trim()) return;
    setItems(prev => [...prev, {
      id: genId(),
      name: cName.trim(),
      set: cSet.trim() || undefined,
      year: cYear.trim() || undefined,
      sport: cSport,
      condition: cCondition,
      askingPrice: cPrice.trim(),
      openToOffers: cOffers,
      notes: cNotes.trim(),
      traded: false,
    }]);
    setCName(''); setCSet(''); setCYear(''); setCCondition('Raw - Near Mint');
    setCPrice(''); setCOffers(true); setCNotes('');
    setShowAdd(false);
  }, [cName, cSet, cYear, cSport, cCondition, cPrice, cOffers, cNotes]);

  const removeItem = useCallback((id: string) => setItems(prev => prev.filter(i => i.id !== id)), []);
  const toggleTraded = useCallback((id: string) => setItems(prev => prev.map(i => i.id === id ? { ...i, traded: !i.traded } : i)), []);

  const updateItem = useCallback((id: string, field: keyof TradeItem, value: string | boolean) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
  }, []);

  /* Filtering & sorting */
  const filtered = useMemo(() => {
    let list = items;
    if (!showTraded) list = list.filter(i => !i.traded);
    if (filter !== 'all') list = list.filter(i => i.sport === filter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(i => i.name.toLowerCase().includes(q) || (i.set && i.set.toLowerCase().includes(q)));
    }
    if (sortBy === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === 'sport') list = [...list].sort((a, b) => a.sport.localeCompare(b.sport));
    else if (sortBy === 'value') list = [...list].sort((a, b) => (parseFloat(b.askingPrice) || 0) - (parseFloat(a.askingPrice) || 0));
    return list;
  }, [items, showTraded, filter, search, sortBy]);

  /* Stats */
  const total = items.length;
  const traded = items.filter(i => i.traded).length;
  const active = total - traded;
  const withPrice = items.filter(i => i.askingPrice && !i.traded).reduce((s, i) => s + (parseFloat(i.askingPrice) || 0), 0);

  /* Share */
  const generateShareUrl = useCallback(() => {
    const hash = encodeBlock(items.filter(i => !i.traded));
    const url = `${window.location.origin}${window.location.pathname}#${hash}`;
    setShareUrl(url);
    navigator.clipboard.writeText(url).catch(() => {});
  }, [items]);

  const copyAsText = useCallback(() => {
    const active = items.filter(i => !i.traded);
    const lines = ['=== MY TRADE BLOCK ===', `${active.length} cards available for trade`, ''];
    active.forEach((i, idx) => {
      let line = `${idx + 1}. ${i.name}`;
      if (i.set) line += ` — ${i.set}`;
      if (i.year) line += ` (${i.year})`;
      line += ` [${i.condition}]`;
      if (i.askingPrice) line += ` — $${i.askingPrice}`;
      else if (i.openToOffers) line += ' — Open to Offers';
      lines.push(line);
    });
    lines.push('', 'Built with CardVault — cardvault-two.vercel.app/tools/trade-block');
    navigator.clipboard.writeText(lines.join('\n')).catch(() => {});
  }, [items]);

  const sportLabel = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const sportBadge = (s: string) => {
    const colors: Record<string, string> = {
      baseball: 'bg-red-900/40 text-red-400 border-red-800/40',
      basketball: 'bg-orange-900/40 text-orange-400 border-orange-800/40',
      football: 'bg-green-900/40 text-green-400 border-green-800/40',
      hockey: 'bg-blue-900/40 text-blue-400 border-blue-800/40',
      pokemon: 'bg-yellow-900/40 text-yellow-400 border-yellow-800/40',
      other: 'bg-slate-800/40 text-slate-400 border-slate-700/40',
    };
    return colors[s] || colors.other;
  };

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-white">{total}</div>
            <div className="text-xs text-slate-500">Total Listed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-400">{active}</div>
            <div className="text-xs text-slate-500">Available</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">{traded}</div>
            <div className="text-xs text-slate-500">Traded</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-400">{withPrice > 0 ? `$${withPrice.toLocaleString()}` : '—'}</div>
            <div className="text-xs text-slate-500">Total Ask</div>
          </div>
        </div>
      </div>

      {/* Quick Add from DB */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white mb-2">Quick Add from Database</h3>
        <input
          type="text"
          value={cardSearch}
          onChange={e => setCardSearch(e.target.value)}
          placeholder="Search 9,000+ cards by name..."
          className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:border-orange-600/50 focus:outline-none"
        />
        {cardMatches.length > 0 && (
          <div className="mt-2 space-y-1 max-h-60 overflow-y-auto">
            {cardMatches.map(c => (
              <button key={c.slug} onClick={() => addFromDb(c)}
                className="w-full text-left bg-slate-900/40 border border-slate-700/40 rounded-lg px-3 py-2 hover:border-orange-700/50 transition-colors">
                <span className="text-white text-sm font-medium">{c.name}</span>
                <span className="text-slate-500 text-xs ml-2">{c.set} ({c.year}) &middot; {sportLabel(c.sport)}</span>
              </button>
            ))}
          </div>
        )}
        <button onClick={() => setShowAdd(!showAdd)}
          className="mt-2 text-xs text-orange-400 hover:text-orange-300 transition-colors">
          {showAdd ? '- Hide custom entry' : '+ Add custom card'}
        </button>
      </div>

      {/* Custom Add Form */}
      {showAdd && (
        <div className="bg-slate-800/40 border border-orange-800/30 rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-semibold text-white">Add Custom Card</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <input value={cName} onChange={e => setCName(e.target.value)} placeholder="Card name *"
              className="bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:border-orange-600/50 focus:outline-none" />
            <input value={cSet} onChange={e => setCSet(e.target.value)} placeholder="Set (optional)"
              className="bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:border-orange-600/50 focus:outline-none" />
            <input value={cYear} onChange={e => setCYear(e.target.value)} placeholder="Year (optional)"
              className="bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:border-orange-600/50 focus:outline-none" />
            <select value={cSport} onChange={e => setCSport(e.target.value)}
              className="bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-600/50 focus:outline-none">
              <option value="baseball">Baseball</option>
              <option value="basketball">Basketball</option>
              <option value="football">Football</option>
              <option value="hockey">Hockey</option>
              <option value="pokemon">Pokemon</option>
              <option value="other">Other</option>
            </select>
            <select value={cCondition} onChange={e => setCCondition(e.target.value)}
              className="bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-600/50 focus:outline-none">
              {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="flex gap-2">
              <input value={cPrice} onChange={e => setCPrice(e.target.value)} placeholder="Asking price ($)"
                className="flex-1 bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:border-orange-600/50 focus:outline-none" />
              <label className="flex items-center gap-1.5 text-xs text-slate-400 whitespace-nowrap">
                <input type="checkbox" checked={cOffers} onChange={e => setCOffers(e.target.checked)}
                  className="rounded border-slate-600" />
                Open to offers
              </label>
            </div>
          </div>
          <input value={cNotes} onChange={e => setCNotes(e.target.value)} placeholder="Notes (optional, e.g. 'slight corner ding')"
            className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:border-orange-600/50 focus:outline-none" />
          <div className="flex gap-2">
            <button onClick={addCustom} disabled={!cName.trim()}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-medium rounded-lg transition-colors">
              Add to Trade Block
            </button>
            <button onClick={() => setShowAdd(false)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded-lg transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filters & Actions */}
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex gap-1 flex-wrap">
            {SPORT_FILTERS.map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${filter === s
                  ? 'bg-orange-900/50 border-orange-700/50 text-orange-400'
                  : 'bg-slate-800/40 border-slate-700/40 text-slate-400 hover:border-slate-600'}`}>
                {s === 'all' ? 'All' : sportLabel(s)}
              </button>
            ))}
          </div>
          <div className="flex gap-1 ml-auto">
            <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
              className="bg-slate-800/60 border border-slate-700/50 rounded-lg px-2 py-1 text-xs text-slate-400 focus:outline-none">
              <option value="recent">Recently Added</option>
              <option value="name">Name A-Z</option>
              <option value="sport">By Sport</option>
              <option value="value">By Price</option>
            </select>
            <button onClick={() => setShowTraded(!showTraded)}
              className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${showTraded
                ? 'bg-green-900/40 border-green-700/40 text-green-400'
                : 'bg-slate-800/40 border-slate-700/40 text-slate-500'}`}>
              {showTraded ? 'Hide Traded' : 'Show Traded'}
            </button>
          </div>
        </div>
      )}

      {/* Search within list */}
      {items.length > 5 && (
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Filter your trade block..."
          className="w-full bg-slate-800/40 border border-slate-700/50 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:border-orange-600/50 focus:outline-none" />
      )}

      {/* Trade Block Items */}
      <div className="space-y-2">
        {filtered.length === 0 && items.length === 0 && (
          <div className="text-center py-12 bg-slate-800/20 border border-slate-700/30 rounded-xl">
            <div className="text-4xl mb-3">🔄</div>
            <p className="text-slate-400">Your trade block is empty</p>
            <p className="text-slate-500 text-sm mt-1">Search above to add cards you want to trade</p>
          </div>
        )}
        {filtered.length === 0 && items.length > 0 && (
          <div className="text-center py-8 text-slate-500 text-sm">No cards match your filters</div>
        )}
        {filtered.map(item => (
          <div key={item.id}
            className={`bg-slate-800/40 border rounded-xl p-4 transition-all ${item.traded
              ? 'border-green-800/30 opacity-60'
              : 'border-slate-700/50 hover:border-orange-700/40'}`}>
            <div className="flex items-start gap-3">
              {/* Traded checkbox */}
              <button onClick={() => toggleTraded(item.id)}
                className={`mt-1 w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${item.traded
                  ? 'bg-green-600 border-green-600 text-white'
                  : 'border-slate-600 hover:border-orange-500'}`}>
                {item.traded && <span className="text-xs">&#10003;</span>}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`font-semibold text-sm ${item.traded ? 'line-through text-slate-500' : 'text-white'}`}>
                    {item.name}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${sportBadge(item.sport)}`}>
                    {sportLabel(item.sport)}
                  </span>
                  {item.traded && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-900/40 text-green-400 border border-green-800/40">
                      Traded
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                  {item.set && <span>{item.set}</span>}
                  {item.year && <span>({item.year})</span>}
                  <span className="text-slate-500">&middot;</span>
                  <span>{item.condition}</span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  {item.askingPrice ? (
                    <span className="text-amber-400 text-sm font-semibold">${item.askingPrice}</span>
                  ) : item.openToOffers ? (
                    <span className="text-orange-400 text-xs italic">Open to Offers</span>
                  ) : null}
                  {item.notes && <span className="text-slate-500 text-xs italic">{item.notes}</span>}
                </div>

                {/* Inline edit row */}
                {!item.traded && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    <select value={item.condition}
                      onChange={e => updateItem(item.id, 'condition', e.target.value)}
                      className="bg-slate-900/40 border border-slate-700/40 rounded px-1.5 py-0.5 text-[11px] text-slate-400 focus:outline-none">
                      {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input value={item.askingPrice}
                      onChange={e => updateItem(item.id, 'askingPrice', e.target.value)}
                      placeholder="$ price"
                      className="w-20 bg-slate-900/40 border border-slate-700/40 rounded px-1.5 py-0.5 text-[11px] text-slate-400 focus:outline-none" />
                  </div>
                )}
              </div>

              {/* Remove */}
              <button onClick={() => removeItem(item.id)}
                className="text-slate-600 hover:text-red-400 text-sm transition-colors flex-shrink-0" title="Remove">
                &#10005;
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Share Actions */}
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button onClick={generateShareUrl}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium rounded-lg transition-colors">
            Share Link
          </button>
          <button onClick={copyAsText}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded-lg transition-colors">
            Copy as Text
          </button>
          <button onClick={() => { setItems([]); setShareUrl(''); }}
            className="px-4 py-2 bg-slate-800 hover:bg-red-900/40 text-slate-500 hover:text-red-400 text-sm rounded-lg transition-colors border border-slate-700/50">
            Clear All
          </button>
        </div>
      )}

      {shareUrl && (
        <div className="bg-green-900/20 border border-green-800/40 rounded-lg p-3">
          <p className="text-green-400 text-xs mb-1">Link copied to clipboard!</p>
          <p className="text-slate-400 text-[10px] break-all">{shareUrl.slice(0, 120)}...</p>
        </div>
      )}
    </div>
  );
}
