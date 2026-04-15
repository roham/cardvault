'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';

interface WantItem {
  id: string;
  name: string;
  fairPrice: number;
  maxPrice: number;
  priority: 'must-have' | 'want' | 'nice-to-have';
  notes: string;
  purchased: boolean;
  purchasePrice?: number;
}

interface PurchaseItem {
  id: string;
  name: string;
  price: number;
  dealer: string;
  notes: string;
  fromWantList: boolean;
}

type Tab = 'plan' | 'at-show' | 'recap';

const STORAGE_KEY = 'cardvault-show-prep';

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function fmt(n: number): string {
  return n < 0 ? `-$${Math.abs(n).toFixed(2)}` : `$${n.toFixed(2)}`;
}

const PRIORITY_COLORS: Record<string, string> = {
  'must-have': 'bg-red-500/20 text-red-400 border-red-500/30',
  'want': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'nice-to-have': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

const PRIORITY_LABELS: Record<string, string> = {
  'must-have': 'Must-Have',
  'want': 'Want',
  'nice-to-have': 'Nice to Have',
};

const SHOW_ESSENTIALS = [
  { item: 'Cash (dealers give 5-10% discounts)', category: 'money' },
  { item: 'Phone charger / portable battery', category: 'tech' },
  { item: 'Penny sleeves (50+)', category: 'supplies' },
  { item: 'Top loaders (20+)', category: 'supplies' },
  { item: 'Team bags for multi-card purchases', category: 'supplies' },
  { item: 'Small backpack or tote bag', category: 'gear' },
  { item: 'This want list (loaded on phone)', category: 'planning' },
  { item: 'Magnifying glass / loupe', category: 'gear' },
  { item: 'Business cards (if you deal)', category: 'optional' },
  { item: 'Trade binder (if trading)', category: 'optional' },
];

interface ShowState {
  showName: string;
  showDate: string;
  budget: number;
  wantList: WantItem[];
  purchases: PurchaseItem[];
  checkedEssentials: string[];
}

const DEFAULT_STATE: ShowState = {
  showName: '',
  showDate: '',
  budget: 500,
  wantList: [],
  purchases: [],
  checkedEssentials: [],
};

export default function ShowPrepClient() {
  const [tab, setTab] = useState<Tab>('plan');
  const [state, setState] = useState<ShowState>(DEFAULT_STATE);
  const [loaded, setLoaded] = useState(false);

  // Form state for adding want items
  const [wantName, setWantName] = useState('');
  const [wantFairPrice, setWantFairPrice] = useState('');
  const [wantMaxPrice, setWantMaxPrice] = useState('');
  const [wantPriority, setWantPriority] = useState<WantItem['priority']>('want');
  const [wantNotes, setWantNotes] = useState('');

  // Form state for logging purchases
  const [purchName, setPurchName] = useState('');
  const [purchPrice, setPurchPrice] = useState('');
  const [purchDealer, setPurchDealer] = useState('');
  const [purchNotes, setPurchNotes] = useState('');

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setState(JSON.parse(saved));
    } catch {}
    setLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, loaded]);

  const totalSpent = useMemo(() => state.purchases.reduce((s, p) => s + p.price, 0), [state.purchases]);
  const remaining = useMemo(() => state.budget - totalSpent, [state.budget, totalSpent]);
  const wantListTotal = useMemo(() => state.wantList.reduce((s, w) => s + w.fairPrice, 0), [state.wantList]);
  const mustHaveTotal = useMemo(() => state.wantList.filter(w => w.priority === 'must-have').reduce((s, w) => s + w.fairPrice, 0), [state.wantList]);

  const addWantItem = useCallback(() => {
    const fair = parseFloat(wantFairPrice);
    const max = parseFloat(wantMaxPrice) || fair * 1.15;
    if (!wantName.trim() || isNaN(fair) || fair <= 0) return;
    const item: WantItem = {
      id: genId(),
      name: wantName.trim(),
      fairPrice: fair,
      maxPrice: max,
      priority: wantPriority,
      notes: wantNotes.trim(),
      purchased: false,
    };
    setState(prev => ({ ...prev, wantList: [...prev.wantList, item] }));
    setWantName('');
    setWantFairPrice('');
    setWantMaxPrice('');
    setWantNotes('');
  }, [wantName, wantFairPrice, wantMaxPrice, wantPriority, wantNotes]);

  const removeWantItem = useCallback((id: string) => {
    setState(prev => ({ ...prev, wantList: prev.wantList.filter(w => w.id !== id) }));
  }, []);

  const markPurchased = useCallback((id: string, price: number) => {
    setState(prev => ({
      ...prev,
      wantList: prev.wantList.map(w => w.id === id ? { ...w, purchased: true, purchasePrice: price } : w),
      purchases: [...prev.purchases, {
        id: genId(),
        name: prev.wantList.find(w => w.id === id)?.name || '',
        price,
        dealer: '',
        notes: 'From want list',
        fromWantList: true,
      }],
    }));
  }, []);

  const addPurchase = useCallback(() => {
    const price = parseFloat(purchPrice);
    if (!purchName.trim() || isNaN(price) || price <= 0) return;
    const item: PurchaseItem = {
      id: genId(),
      name: purchName.trim(),
      price,
      dealer: purchDealer.trim(),
      notes: purchNotes.trim(),
      fromWantList: false,
    };
    setState(prev => ({ ...prev, purchases: [...prev.purchases, item] }));
    setPurchName('');
    setPurchPrice('');
    setPurchDealer('');
    setPurchNotes('');
  }, [purchName, purchPrice, purchDealer, purchNotes]);

  const removePurchase = useCallback((id: string) => {
    setState(prev => ({ ...prev, purchases: prev.purchases.filter(p => p.id !== id) }));
  }, []);

  const toggleEssential = useCallback((item: string) => {
    setState(prev => ({
      ...prev,
      checkedEssentials: prev.checkedEssentials.includes(item)
        ? prev.checkedEssentials.filter(e => e !== item)
        : [...prev.checkedEssentials, item],
    }));
  }, []);

  const resetAll = useCallback(() => {
    setState(DEFAULT_STATE);
  }, []);

  if (!loaded) return <div className="text-gray-500 py-8 text-center">Loading...</div>;

  const budgetPct = state.budget > 0 ? Math.min((totalSpent / state.budget) * 100, 100) : 0;
  const budgetColor = budgetPct > 90 ? 'bg-red-500' : budgetPct > 70 ? 'bg-yellow-500' : 'bg-emerald-500';

  return (
    <div className="space-y-6">
      {/* Show Info Bar */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Show Name</label>
            <input
              type="text"
              value={state.showName}
              onChange={e => setState(prev => ({ ...prev, showName: e.target.value }))}
              placeholder="e.g. National Card Show 2026"
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Show Date</label>
            <input
              type="date"
              value={state.showDate}
              onChange={e => setState(prev => ({ ...prev, showDate: e.target.value }))}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Total Budget</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500 text-sm">$</span>
              <input
                type="number"
                value={state.budget || ''}
                onChange={e => setState(prev => ({ ...prev, budget: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg pl-7 pr-3 py-2 text-white text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Budget Progress Bar */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Budget: {fmt(totalSpent)} / {fmt(state.budget)}</span>
          <span className={`text-sm font-bold ${remaining < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {remaining >= 0 ? `${fmt(remaining)} left` : `${fmt(Math.abs(remaining))} over budget`}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${budgetColor}`}
            style={{ width: `${Math.min(budgetPct, 100)}%` }}
          />
        </div>
        <div className="flex gap-4 mt-3 text-xs text-gray-500">
          <span>Want List Total: {fmt(wantListTotal)}</span>
          <span>Must-Haves: {fmt(mustHaveTotal)}</span>
          <span>Purchases: {state.purchases.length}</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-gray-800/50 p-1 rounded-xl border border-gray-700">
        {([
          { key: 'plan' as Tab, label: 'Pre-Show Plan', icon: '📋' },
          { key: 'at-show' as Tab, label: 'At the Show', icon: '🏟️' },
          { key: 'recap' as Tab, label: 'Post-Show Recap', icon: '📊' },
        ]).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key
                ? 'bg-emerald-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <span>{t.icon}</span>
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'plan' && (
        <div className="space-y-6">
          {/* Add Want Item Form */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
            <h3 className="text-lg font-bold text-white mb-4">Build Your Want List</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={wantName}
                  onChange={e => setWantName(e.target.value)}
                  placeholder="Card name (e.g. 2025 Topps Chrome Wemby RC PSA 10)"
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Fair Market Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500 text-sm">$</span>
                  <input
                    type="number"
                    value={wantFairPrice}
                    onChange={e => setWantFairPrice(e.target.value)}
                    placeholder="Based on eBay sold comps"
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg pl-7 pr-3 py-2 text-white text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Max You&apos;d Pay</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500 text-sm">$</span>
                  <input
                    type="number"
                    value={wantMaxPrice}
                    onChange={e => setWantMaxPrice(e.target.value)}
                    placeholder="Auto: fair price + 15%"
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg pl-7 pr-3 py-2 text-white text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Priority</label>
                <select
                  value={wantPriority}
                  onChange={e => setWantPriority(e.target.value as WantItem['priority'])}
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 focus:outline-none"
                >
                  <option value="must-have">Must-Have</option>
                  <option value="want">Want</option>
                  <option value="nice-to-have">Nice to Have</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Notes</label>
                <input
                  type="text"
                  value={wantNotes}
                  onChange={e => setWantNotes(e.target.value)}
                  placeholder="Condition notes, set details..."
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
            <button
              onClick={addWantItem}
              className="mt-4 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-lg transition-colors"
            >
              + Add to Want List
            </button>
          </div>

          {/* Want List */}
          {state.wantList.length > 0 && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Want List ({state.wantList.length} cards)</h3>
                <span className="text-sm text-gray-400">Total: {fmt(wantListTotal)}</span>
              </div>
              <div className="space-y-3">
                {['must-have', 'want', 'nice-to-have'].map(priority => {
                  const items = state.wantList.filter(w => w.priority === priority);
                  if (items.length === 0) return null;
                  return (
                    <div key={priority}>
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        {PRIORITY_LABELS[priority]} ({items.length})
                      </div>
                      {items.map(item => (
                        <div
                          key={item.id}
                          className={`flex items-start gap-3 p-3 rounded-lg mb-2 border ${
                            item.purchased ? 'bg-emerald-900/20 border-emerald-700/30' : 'bg-gray-900/50 border-gray-700/50'
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-sm font-medium ${item.purchased ? 'text-emerald-400 line-through' : 'text-white'}`}>
                                {item.name}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full border ${PRIORITY_COLORS[item.priority]}`}>
                                {PRIORITY_LABELS[item.priority]}
                              </span>
                              {item.purchased && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                  Purchased
                                </span>
                              )}
                            </div>
                            <div className="flex gap-3 mt-1 text-xs text-gray-500">
                              <span>Fair: {fmt(item.fairPrice)}</span>
                              <span>Max: {fmt(item.maxPrice)}</span>
                              {item.purchasePrice !== undefined && (
                                <span className="text-emerald-400">Paid: {fmt(item.purchasePrice)}</span>
                              )}
                              {item.notes && <span className="text-gray-600">| {item.notes}</span>}
                            </div>
                          </div>
                          {!item.purchased && (
                            <button
                              onClick={() => removeWantItem(item.id)}
                              className="text-gray-600 hover:text-red-400 text-sm transition-colors"
                              title="Remove"
                            >
                              &times;
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Show Essentials Checklist */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
            <h3 className="text-lg font-bold text-white mb-4">Show Day Essentials</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SHOW_ESSENTIALS.map(essential => (
                <label
                  key={essential.item}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700/30 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={state.checkedEssentials.includes(essential.item)}
                    onChange={() => toggleEssential(essential.item)}
                    className="w-4 h-4 rounded border-gray-600 text-emerald-500 focus:ring-emerald-500 bg-gray-900"
                  />
                  <span className={`text-sm ${
                    state.checkedEssentials.includes(essential.item) ? 'text-gray-500 line-through' : 'text-gray-300'
                  }`}>
                    {essential.item}
                  </span>
                </label>
              ))}
            </div>
            <div className="mt-3 text-xs text-gray-600">
              {state.checkedEssentials.length}/{SHOW_ESSENTIALS.length} packed
            </div>
          </div>

          {/* Pro Tips */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
            <h3 className="text-lg font-bold text-white mb-4">Pre-Show Strategy Tips</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-400">
              <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                <span className="text-yellow-400 font-bold">Cash is King</span> — Bring cash. Most dealers give 5-10% off for cash. ATM fees at venues are typically $5+.
              </div>
              <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                <span className="text-yellow-400 font-bold">Two-Visit Strategy</span> — Go early for must-haves (best selection), return late for deals (dealers want to sell, not pack).
              </div>
              <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                <span className="text-yellow-400 font-bold">Bundle for Discounts</span> — Buy 3+ cards from one dealer and ask for a package price. Most will cut 10-15%.
              </div>
              <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                <span className="text-yellow-400 font-bold">Check Dollar Boxes</span> — Many dealers have $1-5 boxes with hidden gems. Budget $20-50 just for bargain hunting.
              </div>
              <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                <span className="text-yellow-400 font-bold">Inspect Everything</span> — Use your phone flashlight to check corners and edges. Ask to remove from sleeve/top loader for expensive cards.
              </div>
              <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                <span className="text-yellow-400 font-bold">Know Your Comps</span> — Have eBay sold data ready on your phone. Fair show price = eBay sold minus 10-15% (no fees/shipping).
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'at-show' && (
        <div className="space-y-6">
          {/* Quick Purchase Log */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
            <h3 className="text-lg font-bold text-white mb-4">Log a Purchase</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={purchName}
                  onChange={e => setPurchName(e.target.value)}
                  placeholder="What did you buy?"
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500 text-sm">$</span>
                  <input
                    type="number"
                    value={purchPrice}
                    onChange={e => setPurchPrice(e.target.value)}
                    placeholder="Price paid"
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg pl-7 pr-3 py-2 text-white text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <input
                  type="text"
                  value={purchDealer}
                  onChange={e => setPurchDealer(e.target.value)}
                  placeholder="Dealer/booth (optional)"
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={purchNotes}
                  onChange={e => setPurchNotes(e.target.value)}
                  placeholder="Notes (condition, deal details...)"
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
            <button
              onClick={addPurchase}
              className="mt-4 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-lg transition-colors"
            >
              + Log Purchase
            </button>
          </div>

          {/* Want List Quick Mark */}
          {state.wantList.filter(w => !w.purchased).length > 0 && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
              <h3 className="text-lg font-bold text-white mb-4">Want List — Mark as Found</h3>
              <p className="text-xs text-gray-500 mb-3">Tap a card to mark it purchased. Enter the price you actually paid.</p>
              <div className="space-y-2">
                {state.wantList.filter(w => !w.purchased).map(item => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white font-medium truncate">{item.name}</div>
                      <div className="text-xs text-gray-500">
                        Fair: {fmt(item.fairPrice)} | Max: {fmt(item.maxPrice)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="$"
                        className="w-20 bg-gray-900 border border-gray-600 rounded px-2 py-1.5 text-white text-sm text-right focus:border-emerald-500 focus:outline-none"
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            const val = parseFloat((e.target as HTMLInputElement).value);
                            if (!isNaN(val) && val > 0) markPurchased(item.id, val);
                          }
                        }}
                      />
                      <button
                        onClick={(e) => {
                          const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                          const val = parseFloat(input?.value);
                          if (!isNaN(val) && val > 0) markPurchased(item.id, val);
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded transition-colors"
                      >
                        Got It
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Purchase Log */}
          {state.purchases.length > 0 && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Purchase Log ({state.purchases.length})</h3>
                <span className="text-sm font-bold text-emerald-400">Total: {fmt(totalSpent)}</span>
              </div>
              <div className="space-y-2">
                {state.purchases.map(p => (
                  <div key={p.id} className="flex items-center gap-3 p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white font-medium truncate">{p.name}</span>
                        {p.fromWantList && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">want list</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {p.dealer && <span>{p.dealer} &middot; </span>}
                        {p.notes && <span>{p.notes}</span>}
                      </div>
                    </div>
                    <span className="text-sm font-bold text-white">{fmt(p.price)}</span>
                    <button
                      onClick={() => removePurchase(p.id)}
                      className="text-gray-600 hover:text-red-400 transition-colors"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'recap' && (
        <div className="space-y-6">
          {/* Show Summary */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
            <h3 className="text-lg font-bold text-white mb-4">
              {state.showName || 'Card Show'} Recap
              {state.showDate && <span className="text-sm text-gray-500 font-normal ml-2">{state.showDate}</span>}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-white">{fmt(state.budget)}</div>
                <div className="text-xs text-gray-500">Budget</div>
              </div>
              <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-emerald-400">{fmt(totalSpent)}</div>
                <div className="text-xs text-gray-500">Total Spent</div>
              </div>
              <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-3 text-center">
                <div className={`text-2xl font-bold ${remaining >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {fmt(remaining)}
                </div>
                <div className="text-xs text-gray-500">{remaining >= 0 ? 'Under Budget' : 'Over Budget'}</div>
              </div>
              <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-white">{state.purchases.length}</div>
                <div className="text-xs text-gray-500">Cards Bought</div>
              </div>
            </div>
          </div>

          {/* Want List Completion */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
            <h3 className="text-lg font-bold text-white mb-4">Want List Completion</h3>
            {state.wantList.length === 0 ? (
              <p className="text-gray-500 text-sm">No items on want list. Add items in the Pre-Show Plan tab.</p>
            ) : (
              <>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1 bg-gray-700 rounded-full h-3">
                    <div
                      className="h-3 rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${(state.wantList.filter(w => w.purchased).length / state.wantList.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-400">
                    {state.wantList.filter(w => w.purchased).length}/{state.wantList.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {state.wantList.map(item => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 p-2 rounded-lg text-sm ${
                        item.purchased ? 'text-emerald-400' : 'text-gray-500'
                      }`}
                    >
                      <span className="text-lg">{item.purchased ? '\u2705' : '\u2B1C'}</span>
                      <span className={item.purchased ? 'line-through' : ''}>{item.name}</span>
                      <span className="ml-auto text-xs">
                        {item.purchased && item.purchasePrice !== undefined
                          ? `Paid ${fmt(item.purchasePrice)} (fair: ${fmt(item.fairPrice)})`
                          : `Target: ${fmt(item.fairPrice)}`}
                      </span>
                      {item.purchased && item.purchasePrice !== undefined && (
                        <span className={`text-xs font-bold ${
                          item.purchasePrice <= item.fairPrice ? 'text-emerald-400' : 'text-yellow-400'
                        }`}>
                          {item.purchasePrice <= item.fairPrice ? 'DEAL' : 'OVERPAID'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Savings Analysis */}
          {state.wantList.filter(w => w.purchased).length > 0 && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
              <h3 className="text-lg font-bold text-white mb-4">Deal Analysis</h3>
              {(() => {
                const purchased = state.wantList.filter(w => w.purchased && w.purchasePrice !== undefined);
                const totalFair = purchased.reduce((s, w) => s + w.fairPrice, 0);
                const totalPaid = purchased.reduce((s, w) => s + (w.purchasePrice || 0), 0);
                const savings = totalFair - totalPaid;
                const deals = purchased.filter(w => (w.purchasePrice || 0) <= w.fairPrice).length;
                return (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-3 text-center">
                      <div className={`text-xl font-bold ${savings >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {savings >= 0 ? `+${fmt(savings)}` : fmt(savings)}
                      </div>
                      <div className="text-xs text-gray-500">{savings >= 0 ? 'Saved vs Fair Market' : 'Over Fair Market'}</div>
                    </div>
                    <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-white">
                        {deals}/{purchased.length}
                      </div>
                      <div className="text-xs text-gray-500">Below Fair Price</div>
                    </div>
                    <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-white">
                        {state.purchases.length > 0 ? fmt(totalSpent / state.purchases.length) : '$0.00'}
                      </div>
                      <div className="text-xs text-gray-500">Avg per Card</div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Full Purchase History */}
          {state.purchases.length > 0 && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
              <h3 className="text-lg font-bold text-white mb-4">All Purchases</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-700">
                      <th className="pb-2 font-medium">#</th>
                      <th className="pb-2 font-medium">Card</th>
                      <th className="pb-2 font-medium">Dealer</th>
                      <th className="pb-2 font-medium text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.purchases.map((p, i) => (
                      <tr key={p.id} className="border-b border-gray-800">
                        <td className="py-2 text-gray-600">{i + 1}</td>
                        <td className="py-2 text-white">{p.name}</td>
                        <td className="py-2 text-gray-400">{p.dealer || '—'}</td>
                        <td className="py-2 text-right text-white font-medium">{fmt(p.price)}</td>
                      </tr>
                    ))}
                    <tr className="font-bold">
                      <td className="pt-3" />
                      <td className="pt-3 text-white" colSpan={2}>Total</td>
                      <td className="pt-3 text-right text-emerald-400">{fmt(totalSpent)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reset Button */}
      <div className="flex justify-end pt-4">
        <button
          onClick={resetAll}
          className="px-4 py-2 text-xs text-gray-600 hover:text-red-400 border border-gray-700 hover:border-red-500/30 rounded-lg transition-colors"
        >
          Reset All Data
        </button>
      </div>
    </div>
  );
}
