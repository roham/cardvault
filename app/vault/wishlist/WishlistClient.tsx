'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { sportsCards, type SportsCard } from '@/data/sports-cards';

// ── Types ──────────────────────────────────────────────────────
interface WishlistItem {
  id: string;
  cardSlug: string;
  player: string;
  set: string;
  year: number;
  sport: string;
  marketPrice: number;
  targetPrice: number;
  priority: 'must-have' | 'want' | 'nice-to-have';
  reason: string;
  addedDate: string;
  status: 'searching' | 'found' | 'purchased';
}

type SortField = 'addedDate' | 'priority' | 'savings' | 'marketPrice';

function generateId(): string {
  return `wish-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function parseValue(v: string): number {
  const match = v.replace(/[$,]/g, '').match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
}

const PRIORITY_ORDER = { 'must-have': 0, 'want': 1, 'nice-to-have': 2 };
const PRIORITY_COLORS = {
  'must-have': 'bg-red-500/10 text-red-400 border-red-500/20',
  'want': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'nice-to-have': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};
const STATUS_COLORS = {
  searching: 'bg-gray-500/10 text-gray-400',
  found: 'bg-emerald-500/10 text-emerald-400',
  purchased: 'bg-indigo-500/10 text-indigo-400',
};

export default function WishlistClient() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SportsCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<SportsCard | null>(null);
  const [sortField, setSortField] = useState<SortField>('priority');
  const [sportFilter, setSportFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | WishlistItem['status']>('all');

  // Form state
  const [form, setForm] = useState({
    targetPrice: 0,
    priority: 'want' as WishlistItem['priority'],
    reason: '',
  });

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cardvault-wishlist');
      if (saved) setItems(JSON.parse(saved));
    } catch {}
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (items.length > 0) localStorage.setItem('cardvault-wishlist', JSON.stringify(items));
  }, [items]);

  // Search cards
  useEffect(() => {
    if (searchQuery.length < 2) { setSearchResults([]); return; }
    const q = searchQuery.toLowerCase();
    const results = sportsCards
      .filter(c => c.player.toLowerCase().includes(q) || c.set.toLowerCase().includes(q))
      .slice(0, 8);
    setSearchResults(results);
  }, [searchQuery]);

  const resetForm = useCallback(() => {
    setForm({ targetPrice: 0, priority: 'want', reason: '' });
    setSelectedCard(null);
    setSearchQuery('');
    setSearchResults([]);
    setEditId(null);
    setShowForm(false);
  }, []);

  const handleSelectCard = useCallback((card: SportsCard) => {
    setSelectedCard(card);
    setSearchQuery('');
    setSearchResults([]);
    const marketPrice = parseValue(card.estimatedValueRaw);
    setForm(prev => ({ ...prev, targetPrice: Math.round(marketPrice * 0.85 * 100) / 100 }));
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCard && !editId) return;

    if (editId) {
      setItems(prev => prev.map(item => item.id === editId ? {
        ...item,
        targetPrice: form.targetPrice,
        priority: form.priority,
        reason: form.reason,
      } : item));
    } else if (selectedCard) {
      const existing = items.find(i => i.cardSlug === selectedCard.slug);
      if (existing) { resetForm(); return; }

      setItems(prev => [{
        id: generateId(),
        cardSlug: selectedCard.slug,
        player: selectedCard.player,
        set: selectedCard.set,
        year: selectedCard.year,
        sport: selectedCard.sport,
        marketPrice: parseValue(selectedCard.estimatedValueRaw),
        targetPrice: form.targetPrice,
        priority: form.priority,
        reason: form.reason,
        addedDate: new Date().toISOString().slice(0, 10),
        status: 'searching',
      }, ...prev]);
    }
    resetForm();
  }, [selectedCard, editId, form, items, resetForm]);

  const handleEdit = useCallback((item: WishlistItem) => {
    setForm({
      targetPrice: item.targetPrice,
      priority: item.priority,
      reason: item.reason,
    });
    setEditId(item.id);
    setShowForm(true);
  }, []);

  const handleStatusChange = useCallback((id: string, status: WishlistItem['status']) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status } : i));
  }, []);

  const handleDelete = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  // Filtered & sorted items
  const filteredItems = useMemo(() => {
    let result = [...items];
    if (sportFilter !== 'all') result = result.filter(i => i.sport === sportFilter);
    if (statusFilter !== 'all') result = result.filter(i => i.status === statusFilter);

    result.sort((a, b) => {
      switch (sortField) {
        case 'priority': return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        case 'savings': return (b.marketPrice - b.targetPrice) - (a.marketPrice - a.targetPrice);
        case 'marketPrice': return b.marketPrice - a.marketPrice;
        default: return new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime();
      }
    });
    return result;
  }, [items, sportFilter, statusFilter, sortField]);

  // Stats
  const stats = useMemo(() => {
    const totalMarket = items.reduce((s, i) => s + i.marketPrice, 0);
    const totalTarget = items.reduce((s, i) => s + i.targetPrice, 0);
    const potentialSavings = totalMarket - totalTarget;
    const purchased = items.filter(i => i.status === 'purchased').length;
    const searching = items.filter(i => i.status === 'searching').length;
    const mustHaves = items.filter(i => i.priority === 'must-have' && i.status === 'searching').length;
    return { totalMarket, totalTarget, potentialSavings, purchased, searching, mustHaves, total: items.length };
  }, [items]);

  const uniqueSports = useMemo(() => [...new Set(items.map(i => i.sport))], [items]);

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
          <p className="text-[10px] uppercase text-gray-500 font-medium">Want List</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
          <p className="text-[10px] text-gray-500">{stats.mustHaves} must-have{stats.mustHaves !== 1 ? 's' : ''}</p>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
          <p className="text-[10px] uppercase text-gray-500 font-medium">Market Value</p>
          <p className="text-2xl font-bold text-white">${stats.totalMarket.toFixed(0)}</p>
          <p className="text-[10px] text-gray-500">at current prices</p>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
          <p className="text-[10px] uppercase text-gray-500 font-medium">Target Spend</p>
          <p className="text-2xl font-bold text-emerald-400">${stats.totalTarget.toFixed(0)}</p>
          <p className="text-[10px] text-gray-500">your buy targets</p>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
          <p className="text-[10px] uppercase text-gray-500 font-medium">Potential Savings</p>
          <p className="text-2xl font-bold text-amber-400">${stats.potentialSavings.toFixed(0)}</p>
          <p className="text-[10px] text-gray-500">{stats.purchased} acquired</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Add to Wishlist
        </button>
        <select
          value={sortField}
          onChange={e => setSortField(e.target.value as SortField)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
        >
          <option value="priority">Sort: Priority</option>
          <option value="savings">Sort: Savings</option>
          <option value="marketPrice">Sort: Price</option>
          <option value="addedDate">Sort: Date Added</option>
        </select>
        {uniqueSports.length > 1 && (
          <select
            value={sportFilter}
            onChange={e => setSportFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
          >
            <option value="all">All Sports</option>
            {uniqueSports.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        )}
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
        >
          <option value="all">All Status</option>
          <option value="searching">Searching</option>
          <option value="found">Found</option>
          <option value="purchased">Purchased</option>
        </select>
      </div>

      {/* Add Form */}
      {showForm && !editId && (
        <div className="bg-gray-900/80 border border-gray-700 rounded-2xl p-5 mb-6">
          <h3 className="text-white font-bold text-sm mb-4">Add Card to Wishlist</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!selectedCard ? (
              <div>
                <label className="block text-gray-400 text-xs mb-1">Search for a card *</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search by player name or set..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50"
                  autoFocus
                />
                {searchResults.length > 0 && (
                  <div className="mt-2 bg-gray-800 border border-gray-700 rounded-lg max-h-60 overflow-y-auto">
                    {searchResults.map(card => (
                      <button
                        key={card.slug}
                        type="button"
                        onClick={() => handleSelectCard(card)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-700 transition-colors border-b border-gray-700/50 last:border-0"
                      >
                        <div className="text-white text-sm font-medium">{card.player}</div>
                        <div className="text-gray-500 text-xs">{card.year} {card.set} — {card.estimatedValueRaw} raw</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-medium">{selectedCard.player}</p>
                    <p className="text-gray-500 text-xs">{selectedCard.year} {selectedCard.set} — Market: {selectedCard.estimatedValueRaw}</p>
                  </div>
                  <button type="button" onClick={() => setSelectedCard(null)} className="text-gray-500 hover:text-white text-xs">Change</button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Target Buy Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.targetPrice || ''}
                      onChange={e => setForm(prev => ({ ...prev, targetPrice: parseFloat(e.target.value) || 0 }))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
                    />
                    <p className="text-[10px] text-gray-600 mt-0.5">
                      {form.targetPrice > 0 && parseValue(selectedCard.estimatedValueRaw) > 0
                        ? `${((1 - form.targetPrice / parseValue(selectedCard.estimatedValueRaw)) * 100).toFixed(0)}% below market`
                        : ''}
                    </p>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Priority</label>
                    <select
                      value={form.priority}
                      onChange={e => setForm(prev => ({ ...prev, priority: e.target.value as WishlistItem['priority'] }))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
                    >
                      <option value="must-have">Must Have</option>
                      <option value="want">Want</option>
                      <option value="nice-to-have">Nice to Have</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Reason (optional)</label>
                    <input
                      type="text"
                      value={form.reason}
                      onChange={e => setForm(prev => ({ ...prev, reason: e.target.value }))}
                      placeholder="Set completion, PC, investment..."
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
                    Add to Wishlist
                  </button>
                  <button type="button" onClick={resetForm} className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-5 py-2 rounded-lg text-sm font-medium transition-colors">
                    Cancel
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      )}

      {/* Edit Form */}
      {showForm && editId && (
        <div className="bg-gray-900/80 border border-gray-700 rounded-2xl p-5 mb-6">
          <h3 className="text-white font-bold text-sm mb-4">Edit Wishlist Item</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-400 text-xs mb-1">Target Buy Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.targetPrice || ''}
                  onChange={e => setForm(prev => ({ ...prev, targetPrice: parseFloat(e.target.value) || 0 }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1">Priority</label>
                <select
                  value={form.priority}
                  onChange={e => setForm(prev => ({ ...prev, priority: e.target.value as WishlistItem['priority'] }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
                >
                  <option value="must-have">Must Have</option>
                  <option value="want">Want</option>
                  <option value="nice-to-have">Nice to Have</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1">Reason</label>
                <input
                  type="text"
                  value={form.reason}
                  onChange={e => setForm(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
                Save Changes
              </button>
              <button type="button" onClick={resetForm} className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-5 py-2 rounded-lg text-sm font-medium transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Wishlist Items */}
      {filteredItems.length === 0 ? (
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-8 text-center">
          <span className="text-4xl block mb-3">🎯</span>
          <h3 className="text-white font-bold text-lg mb-2">Your wishlist is empty</h3>
          <p className="text-gray-400 text-sm mb-4">Add cards you want to buy. Set target prices and track your progress toward building your collection.</p>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Add Your First Card
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredItems.map(item => {
            const savings = item.marketPrice - item.targetPrice;
            const savingsPct = item.marketPrice > 0 ? (savings / item.marketPrice) * 100 : 0;
            return (
              <div key={item.id} className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link href={`/cards/${item.cardSlug}`} className="text-white font-medium text-sm hover:text-indigo-400 transition-colors truncate">
                        {item.player}
                      </Link>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${PRIORITY_COLORS[item.priority]}`}>
                        {item.priority === 'must-have' ? 'MUST HAVE' : item.priority === 'want' ? 'WANT' : 'NICE TO HAVE'}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${STATUS_COLORS[item.status]}`}>
                        {item.status === 'searching' ? 'SEARCHING' : item.status === 'found' ? 'FOUND' : 'PURCHASED'}
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs mt-0.5">{item.year} {item.set}</p>
                    {item.reason && <p className="text-gray-600 text-[10px] mt-0.5">{item.reason}</p>}
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-gray-500 text-[10px]">Market</p>
                        <p className="text-gray-300 text-sm">${item.marketPrice.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-[10px]">Target</p>
                        <p className="text-emerald-400 text-sm font-medium">${item.targetPrice.toFixed(2)}</p>
                      </div>
                      {savings > 0 && (
                        <div>
                          <p className="text-gray-500 text-[10px]">Save</p>
                          <p className="text-amber-400 text-sm font-medium">{savingsPct.toFixed(0)}%</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions Row */}
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-800/50">
                  <a
                    href={`https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(`${item.player} ${item.year} ${item.set}`)}&LH_BIN=1&_sop=15`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 text-xs transition-colors"
                  >
                    Search eBay
                  </a>
                  <span className="text-gray-700">|</span>
                  {item.status === 'searching' && (
                    <button onClick={() => handleStatusChange(item.id, 'found')} className="text-emerald-400 hover:text-emerald-300 text-xs transition-colors">
                      Mark Found
                    </button>
                  )}
                  {item.status === 'found' && (
                    <button onClick={() => handleStatusChange(item.id, 'purchased')} className="text-indigo-400 hover:text-indigo-300 text-xs transition-colors">
                      Mark Purchased
                    </button>
                  )}
                  {item.status === 'purchased' && (
                    <button onClick={() => handleStatusChange(item.id, 'searching')} className="text-gray-400 hover:text-white text-xs transition-colors">
                      Re-open
                    </button>
                  )}
                  <span className="text-gray-700">|</span>
                  <button onClick={() => handleEdit(item)} className="text-gray-500 hover:text-white text-xs transition-colors">
                    Edit
                  </button>
                  <span className="text-gray-700">|</span>
                  <button onClick={() => handleDelete(item.id)} className="text-gray-500 hover:text-red-400 text-xs transition-colors">
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Share Wishlist */}
      {items.length > 0 && (
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={() => {
              const text = items.filter(i => i.status === 'searching').map(i =>
                `${i.player} — ${i.year} ${i.set} (Target: $${i.targetPrice})`
              ).join('\n');
              navigator.clipboard?.writeText(`My CardVault Wishlist:\n${text}\n\nTrack yours at cardvault-two.vercel.app/vault/wishlist`);
            }}
            className="text-gray-400 hover:text-white text-xs transition-colors"
          >
            Copy Wishlist
          </button>
          <button
            onClick={() => { if (confirm('Clear entire wishlist?')) { setItems([]); localStorage.removeItem('cardvault-wishlist'); } }}
            className="text-gray-600 hover:text-red-400 text-xs transition-colors"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Related */}
      <div className="mt-8 bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Related Features</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link href="/vault" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">🏦</span>
            <div>
              <div className="text-white text-sm font-medium">My Vault</div>
              <div className="text-gray-500 text-xs">View your card collection</div>
            </div>
          </Link>
          <Link href="/marketplace" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">🏪</span>
            <div>
              <div className="text-white text-sm font-medium">Marketplace</div>
              <div className="text-gray-500 text-xs">Browse cards for sale</div>
            </div>
          </Link>
          <Link href="/tools/flip-tracker" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">📒</span>
            <div>
              <div className="text-white text-sm font-medium">Flip Tracker</div>
              <div className="text-gray-500 text-xs">Track your buy/sell P&L</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
