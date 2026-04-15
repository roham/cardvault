'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';

/* ── types ──────────────────────────────────────────────────── */

interface WantListItem {
  id: string;
  card: string;
  targetPrice: number;
  maxPrice: number;
  sport: string;
  priority: 'must-have' | 'nice-to-have' | 'if-cheap';
  found: boolean;
}

interface TradeBinder {
  id: string;
  card: string;
  estimatedValue: number;
  sport: string;
  condition: string;
  notes: string;
}

interface BudgetAllocation {
  singles: number;
  sealed: number;
  grading: number;
  supplies: number;
  food: number;
}

interface Purchase {
  id: string;
  card: string;
  price: number;
  estimatedValue: number;
  sport: string;
  category: 'singles' | 'sealed' | 'grading' | 'supplies' | 'food';
  fromWantList: boolean;
}

interface PrepData {
  showName: string;
  showDate: string;
  totalBudget: number;
  allocation: BudgetAllocation;
  wantList: WantListItem[];
  tradeBinder: TradeBinder[];
  purchases: Purchase[];
  checklist: Record<string, boolean>;
}

/* ── storage ────────────────────────────────────────────────── */

const STORAGE_KEY = 'cardvault_show_prep';

const DEFAULT_CHECKLIST: Record<string, boolean> = {
  'Cash (small bills: $1s, $5s, $10s, $20s)': false,
  'Phone charger / power bank': false,
  'Penny sleeves (pack of 100)': false,
  'Top loaders (pack of 25)': false,
  'Team bags for bulk purchases': false,
  'One-touch magnetic holders': false,
  'Comfortable shoes': false,
  'Backpack or messenger bag': false,
  'Water bottle': false,
  'Snacks': false,
  'Want list (printed or on phone)': false,
  'Trade binder': false,
  'Price checking app ready': false,
  'Business cards (if dealer/trader)': false,
  'Loupe or magnifying glass': false,
};

function defaultPrep(): PrepData {
  return {
    showName: '',
    showDate: '',
    totalBudget: 500,
    allocation: { singles: 60, sealed: 20, grading: 10, supplies: 5, food: 5 },
    wantList: [],
    tradeBinder: [],
    purchases: [],
    checklist: { ...DEFAULT_CHECKLIST },
  };
}

function loadPrep(): PrepData {
  if (typeof window === 'undefined') return defaultPrep();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultPrep();
    const d = JSON.parse(raw);
    return { ...defaultPrep(), ...d, checklist: { ...DEFAULT_CHECKLIST, ...(d.checklist || {}) } };
  } catch { return defaultPrep(); }
}

function savePrep(data: PrepData) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

/* ── helpers ─────────────────────────────────────────────────── */

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

function fmt(n: number) { return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }); }

const SPORTS = ['baseball', 'basketball', 'football', 'hockey', 'pokemon', 'other'] as const;
const SPORT_ICONS: Record<string, string> = { baseball: '\u26be', basketball: '\ud83c\udfc0', football: '\ud83c\udfc8', hockey: '\ud83c\udfd2', pokemon: '\u26a1', other: '\ud83c\udccf' };
const PRIORITY_COLORS: Record<string, string> = { 'must-have': 'bg-red-500/20 text-red-400 border-red-500/30', 'nice-to-have': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', 'if-cheap': 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
const CATEGORIES = ['singles', 'sealed', 'grading', 'supplies', 'food'] as const;
const CAT_ICONS: Record<string, string> = { singles: '\ud83c\udccf', sealed: '\ud83d\udce6', grading: '\ud83c\udfc5', supplies: '\ud83d\udee0\ufe0f', food: '\ud83c\udf54' };

/* ── component ──────────────────────────────────────────────── */

type Tab = 'budget' | 'want-list' | 'trade-binder' | 'checklist' | 'post-show';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'budget', label: 'Budget', icon: '\ud83d\udcb0' },
  { key: 'want-list', label: 'Want List', icon: '\ud83d\udcdd' },
  { key: 'trade-binder', label: 'Trade Binder', icon: '\ud83d\udd04' },
  { key: 'checklist', label: 'Checklist', icon: '\u2705' },
  { key: 'post-show', label: 'Post-Show', icon: '\ud83d\udcca' },
];

export default function CardShowPrepKit() {
  const [data, setData] = useState<PrepData>(defaultPrep);
  const [tab, setTab] = useState<Tab>('budget');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setData(loadPrep()); setMounted(true); }, []);

  const update = useCallback((patch: Partial<PrepData>) => {
    setData(prev => {
      const next = { ...prev, ...patch };
      savePrep(next);
      return next;
    });
  }, []);

  /* ── derived stats ─── */
  const stats = useMemo(() => {
    const totalSpent = data.purchases.reduce((s, p) => s + p.price, 0);
    const totalValue = data.purchases.reduce((s, p) => s + p.estimatedValue, 0);
    const wantListFound = data.wantList.filter(w => w.found).length;
    const checklistDone = Object.values(data.checklist).filter(Boolean).length;
    const checklistTotal = Object.keys(data.checklist).length;
    const budgetByCategory: Record<string, number> = {};
    for (const cat of CATEGORIES) {
      budgetByCategory[cat] = data.purchases.filter(p => p.category === cat).reduce((s, p) => s + p.price, 0);
    }
    const tradeBinderValue = data.tradeBinder.reduce((s, t) => s + t.estimatedValue, 0);
    return { totalSpent, totalValue, wantListFound, checklistDone, checklistTotal, budgetByCategory, tradeBinderValue };
  }, [data]);

  if (!mounted) return <div className="text-center py-20 text-gray-500">Loading...</div>;

  return (
    <div>
      {/* Show Info Header */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 sm:p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">Show Name</label>
            <input
              type="text"
              value={data.showName}
              onChange={e => update({ showName: e.target.value })}
              placeholder="e.g. Chicago Card Expo"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">Show Date</label>
            <input
              type="date"
              value={data.showDate}
              onChange={e => update({ showDate: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">Total Budget</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
              <input
                type="number"
                min={0}
                value={data.totalBudget}
                onChange={e => update({ totalBudget: Math.max(0, parseInt(e.target.value) || 0) })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-7 pr-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4 pt-4 border-t border-gray-800">
          <div className="text-center">
            <div className="text-lg font-bold text-white">{fmt(data.totalBudget)}</div>
            <div className="text-xs text-gray-500">Budget</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-emerald-400">{fmt(data.totalBudget - stats.totalSpent)}</div>
            <div className="text-xs text-gray-500">Remaining</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-400">{data.wantList.length}</div>
            <div className="text-xs text-gray-500">Want List</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-400">{data.tradeBinder.length}</div>
            <div className="text-xs text-gray-500">Trade Cards</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-400">{stats.checklistDone}/{stats.checklistTotal}</div>
            <div className="text-xs text-gray-500">Packed</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              tab === t.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'budget' && <BudgetTab data={data} update={update} stats={stats} />}
      {tab === 'want-list' && <WantListTab data={data} update={update} />}
      {tab === 'trade-binder' && <TradeBinderTab data={data} update={update} stats={stats} />}
      {tab === 'checklist' && <ChecklistTab data={data} update={update} stats={stats} />}
      {tab === 'post-show' && <PostShowTab data={data} update={update} stats={stats} />}

      {/* Related Links */}
      <div className="mt-10 pt-6 border-t border-gray-800">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Related Tools</h3>
        <div className="flex flex-wrap gap-2">
          {[
            { href: '/card-show-finder', label: 'Find Shows', icon: '\ud83d\udccd' },
            { href: '/card-show', label: 'Show Companion', icon: '\ud83d\udcf1' },
            { href: '/tools', label: 'Price Check', icon: '\ud83d\udd0e' },
            { href: '/tools/flip-calc', label: 'Flip Calculator', icon: '\ud83d\udcb8' },
            { href: '/vault', label: 'My Vault', icon: '\ud83d\udd12' },
            { href: '/tools/collection-value', label: 'Collection Value', icon: '\ud83d\udc8e' },
          ].map(l => (
            <Link key={l.href} href={l.href} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white border border-gray-700 rounded-lg text-xs font-medium transition-colors">
              <span>{l.icon}</span>
              <span>{l.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Budget Tab ─────────────────────────────────────────────── */

function BudgetTab({ data, update, stats }: { data: PrepData; update: (p: Partial<PrepData>) => void; stats: ReturnType<typeof Object> & { totalSpent: number; budgetByCategory: Record<string, number> } }) {
  const alloc = data.allocation;
  const total = alloc.singles + alloc.sealed + alloc.grading + alloc.supplies + alloc.food;

  const setAlloc = (key: keyof BudgetAllocation, val: number) => {
    update({ allocation: { ...alloc, [key]: Math.max(0, Math.min(100, val)) } });
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
        <h3 className="text-lg font-bold text-white mb-4">Budget Allocation</h3>
        <p className="text-sm text-gray-400 mb-4">Set what percentage of your {fmt(data.totalBudget)} budget goes to each category.</p>

        <div className="space-y-4">
          {CATEGORIES.map(cat => {
            const pct = alloc[cat];
            const amount = Math.round(data.totalBudget * pct / 100);
            const spent = stats.budgetByCategory[cat] || 0;
            const remaining = amount - spent;
            return (
              <div key={cat} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-300 capitalize flex items-center gap-2">
                    <span>{CAT_ICONS[cat]}</span>
                    {cat}
                  </span>
                  <span className="text-gray-400">
                    {fmt(amount)} allocated &middot; {fmt(spent)} spent &middot;{' '}
                    <span className={remaining >= 0 ? 'text-emerald-400' : 'text-red-400'}>{fmt(remaining)} left</span>
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={pct}
                    onChange={e => setAlloc(cat, parseInt(e.target.value))}
                    className="flex-1 accent-blue-500 h-2"
                  />
                  <span className="text-xs text-gray-500 w-10 text-right">{pct}%</span>
                </div>
                {/* Visual bar */}
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500/60 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (spent / Math.max(amount, 1)) * 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {total !== 100 && (
          <div className="mt-3 text-xs text-yellow-400 flex items-center gap-1">
            <span>&#9888;&#65039;</span> Allocations total {total}% (should be 100%)
          </div>
        )}
      </div>

      {/* Budget Tips */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
        <h3 className="text-lg font-bold text-white mb-3">Budget Tips</h3>
        <ul className="space-y-2 text-sm text-gray-400">
          <li className="flex items-start gap-2"><span className="text-blue-400 mt-0.5">&#x2022;</span><span><strong className="text-gray-200">Bring cash in small bills.</strong> Dealers give better prices for cash. $1s, $5s, and $10s are ideal for negotiation — paying exact amounts avoids rounding up.</span></li>
          <li className="flex items-start gap-2"><span className="text-blue-400 mt-0.5">&#x2022;</span><span><strong className="text-gray-200">Reserve 10% as a &quot;discovery fund.&quot;</strong> You will find cards you did not plan for. Having dedicated flex money prevents overspending on your must-haves.</span></li>
          <li className="flex items-start gap-2"><span className="text-blue-400 mt-0.5">&#x2022;</span><span><strong className="text-gray-200">Walk the floor before buying.</strong> Make a first pass to survey prices and inventory. Dealers at the back often have better deals since they get less foot traffic.</span></li>
          <li className="flex items-start gap-2"><span className="text-blue-400 mt-0.5">&#x2022;</span><span><strong className="text-gray-200">Bundle deals save money.</strong> Buying 3-5 cards from one dealer? Ask for a package discount — most dealers will knock 10-20% off a multi-card purchase.</span></li>
          <li className="flex items-start gap-2"><span className="text-blue-400 mt-0.5">&#x2022;</span><span><strong className="text-gray-200">Last hour = best deals.</strong> Dealers want to pack less inventory. Visit in the final hour for the deepest discounts, especially on lower-value singles and sealed product.</span></li>
        </ul>
      </div>
    </div>
  );
}

/* ── Want List Tab ──────────────────────────────────────────── */

function WantListTab({ data, update }: { data: PrepData; update: (p: Partial<PrepData>) => void }) {
  const [showAdd, setShowAdd] = useState(false);
  const [card, setCard] = useState('');
  const [target, setTarget] = useState('');
  const [max, setMax] = useState('');
  const [sport, setSport] = useState<string>('baseball');
  const [priority, setPriority] = useState<WantListItem['priority']>('must-have');

  const addItem = () => {
    if (!card.trim()) return;
    const item: WantListItem = {
      id: uid(),
      card: card.trim(),
      targetPrice: parseFloat(target) || 0,
      maxPrice: parseFloat(max) || 0,
      sport,
      priority,
      found: false,
    };
    update({ wantList: [...data.wantList, item] });
    setCard(''); setTarget(''); setMax('');
    setShowAdd(false);
  };

  const toggleFound = (id: string) => {
    update({ wantList: data.wantList.map(w => w.id === id ? { ...w, found: !w.found } : w) });
  };

  const removeItem = (id: string) => {
    update({ wantList: data.wantList.filter(w => w.id !== id) });
  };

  const sorted = useMemo(() => {
    const order: Record<string, number> = { 'must-have': 0, 'nice-to-have': 1, 'if-cheap': 2 };
    return [...data.wantList].sort((a, b) => {
      if (a.found !== b.found) return a.found ? 1 : -1;
      return (order[a.priority] ?? 9) - (order[b.priority] ?? 9);
    });
  }, [data.wantList]);

  const totalTarget = data.wantList.filter(w => !w.found).reduce((s, w) => s + w.targetPrice, 0);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-6 text-sm">
          <div><span className="text-gray-500">Cards:</span> <span className="text-white font-bold">{data.wantList.length}</span></div>
          <div><span className="text-gray-500">Found:</span> <span className="text-emerald-400 font-bold">{data.wantList.filter(w => w.found).length}</span></div>
          <div><span className="text-gray-500">Target Total:</span> <span className="text-blue-400 font-bold">{fmt(totalTarget)}</span></div>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors">
          + Add Card
        </button>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="bg-gray-900/60 border border-blue-800/50 rounded-xl p-4 space-y-3">
          <input
            type="text"
            value={card}
            onChange={e => setCard(e.target.value)}
            placeholder="Card name (e.g. 2024 Topps Chrome Wembanyama RC)"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:border-blue-500 focus:outline-none"
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Target Price</label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                <input type="number" min={0} value={target} onChange={e => setTarget(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-6 pr-2 py-2 text-white text-sm focus:border-blue-500 focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Max Price</label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                <input type="number" min={0} value={max} onChange={e => setMax(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-6 pr-2 py-2 text-white text-sm focus:border-blue-500 focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Sport</label>
              <select value={sport} onChange={e => setSport(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none">
                {SPORTS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Priority</label>
              <select value={priority} onChange={e => setPriority(e.target.value as WantListItem['priority'])} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none">
                <option value="must-have">Must Have</option>
                <option value="nice-to-have">Nice to Have</option>
                <option value="if-cheap">If Cheap</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={addItem} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors">Add to Want List</button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {/* Want List */}
      {sorted.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <div className="text-3xl mb-2">{'\ud83d\udcdd'}</div>
          <p>Your want list is empty. Add cards you are looking for at the show.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map(w => (
            <div key={w.id} className={`flex items-center gap-3 bg-gray-900/60 border rounded-xl px-4 py-3 transition-all ${w.found ? 'border-emerald-800/50 opacity-60' : 'border-gray-800'}`}>
              <button onClick={() => toggleFound(w.id)} className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${w.found ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-gray-600 hover:border-blue-500'}`}>
                {w.found && <span className="text-xs">{'\u2713'}</span>}
              </button>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium ${w.found ? 'text-gray-500 line-through' : 'text-white'}`}>{w.card}</div>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                  <span>{SPORT_ICONS[w.sport] || ''} {w.sport}</span>
                  <span>&middot;</span>
                  <span>Target: {fmt(w.targetPrice)}</span>
                  {w.maxPrice > 0 && <><span>&middot;</span><span>Max: {fmt(w.maxPrice)}</span></>}
                </div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${PRIORITY_COLORS[w.priority]}`}>
                {w.priority}
              </span>
              <button onClick={() => removeItem(w.id)} className="text-gray-600 hover:text-red-400 transition-colors text-sm">{'\u2715'}</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Trade Binder Tab ───────────────────────────────────────── */

function TradeBinderTab({ data, update, stats }: { data: PrepData; update: (p: Partial<PrepData>) => void; stats: { tradeBinderValue: number } }) {
  const [showAdd, setShowAdd] = useState(false);
  const [card, setCard] = useState('');
  const [value, setValue] = useState('');
  const [sport, setSport] = useState('baseball');
  const [condition, setCondition] = useState('NM');
  const [notes, setNotes] = useState('');

  const addCard = () => {
    if (!card.trim()) return;
    const item: TradeBinder = {
      id: uid(),
      card: card.trim(),
      estimatedValue: parseFloat(value) || 0,
      sport,
      condition,
      notes: notes.trim(),
    };
    update({ tradeBinder: [...data.tradeBinder, item] });
    setCard(''); setValue(''); setNotes('');
    setShowAdd(false);
  };

  const removeCard = (id: string) => {
    update({ tradeBinder: data.tradeBinder.filter(t => t.id !== id) });
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-6 text-sm">
          <div><span className="text-gray-500">Cards:</span> <span className="text-white font-bold">{data.tradeBinder.length}</span></div>
          <div><span className="text-gray-500">Total Value:</span> <span className="text-purple-400 font-bold">{fmt(stats.tradeBinderValue)}</span></div>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition-colors">
          + Add Card
        </button>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="bg-gray-900/60 border border-purple-800/50 rounded-xl p-4 space-y-3">
          <input
            type="text"
            value={card}
            onChange={e => setCard(e.target.value)}
            placeholder="Card name (e.g. 2023 Bowman Chrome Skenes RC Auto)"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:border-purple-500 focus:outline-none"
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Est. Value</label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                <input type="number" min={0} value={value} onChange={e => setValue(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-6 pr-2 py-2 text-white text-sm focus:border-purple-500 focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Sport</label>
              <select value={sport} onChange={e => setSport(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none">
                {SPORTS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Condition</label>
              <select value={condition} onChange={e => setCondition(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none">
                {['Gem Mint', 'Mint', 'NM-MT', 'NM', 'EX-MT', 'EX', 'VG', 'Good', 'Raw'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Notes</label>
              <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Will trade for Wemby" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:border-purple-500 focus:outline-none" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={addCard} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition-colors">Add to Binder</button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {/* Trade Binder */}
      {data.tradeBinder.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <div className="text-3xl mb-2">{'\ud83d\udd04'}</div>
          <p>Your trade binder is empty. Add cards you are bringing to trade at the show.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {data.tradeBinder.map(t => (
            <div key={t.id} className="flex items-center gap-3 bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-3">
              <div className="text-lg">{SPORT_ICONS[t.sport] || '\ud83c\udccf'}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{t.card}</div>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                  <span>{t.condition}</span>
                  <span>&middot;</span>
                  <span className="text-purple-400 font-medium">{fmt(t.estimatedValue)}</span>
                  {t.notes && <><span>&middot;</span><span className="italic">{t.notes}</span></>}
                </div>
              </div>
              <button onClick={() => removeCard(t.id)} className="text-gray-600 hover:text-red-400 transition-colors text-sm">{'\u2715'}</button>
            </div>
          ))}
        </div>
      )}

      {/* Trade Tips */}
      {data.tradeBinder.length > 0 && (
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
          <h4 className="text-sm font-bold text-white mb-2">Trade Tips</h4>
          <ul className="space-y-1 text-xs text-gray-400">
            <li>&#x2022; Know your card values before offering trades. Check recent eBay sold prices.</li>
            <li>&#x2022; Be willing to add cash to even out trades. Small cash additions close more deals.</li>
            <li>&#x2022; Bring cards in top loaders or one-touches for easy display and protection.</li>
            <li>&#x2022; Be upfront about condition issues. Honest traders build repeat relationships.</li>
          </ul>
        </div>
      )}
    </div>
  );
}

/* ── Checklist Tab ──────────────────────────────────────────── */

function ChecklistTab({ data, update, stats }: { data: PrepData; update: (p: Partial<PrepData>) => void; stats: { checklistDone: number; checklistTotal: number } }) {
  const toggleItem = (key: string) => {
    update({ checklist: { ...data.checklist, [key]: !data.checklist[key] } });
  };

  const resetChecklist = () => {
    const reset: Record<string, boolean> = {};
    for (const k of Object.keys(data.checklist)) reset[k] = false;
    update({ checklist: reset });
  };

  const pct = stats.checklistTotal > 0 ? Math.round((stats.checklistDone / stats.checklistTotal) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">{stats.checklistDone} of {stats.checklistTotal} items packed</span>
          <span className={`text-sm font-bold ${pct === 100 ? 'text-emerald-400' : pct >= 50 ? 'text-yellow-400' : 'text-gray-400'}`}>{pct}%</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${pct === 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-blue-500'}`} style={{ width: `${pct}%` }} />
        </div>
        {pct === 100 && <p className="text-xs text-emerald-400 mt-2 font-medium">All packed! You are ready for the show.</p>}
      </div>

      {/* Checklist Items */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl divide-y divide-gray-800">
        {Object.entries(data.checklist).map(([key, checked]) => (
          <button
            key={key}
            onClick={() => toggleItem(key)}
            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-800/50 transition-colors"
          >
            <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${checked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-gray-600'}`}>
              {checked && <span className="text-xs">{'\u2713'}</span>}
            </span>
            <span className={`text-sm ${checked ? 'text-gray-500 line-through' : 'text-gray-200'}`}>{key}</span>
          </button>
        ))}
      </div>

      <button onClick={resetChecklist} className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
        Reset checklist
      </button>
    </div>
  );
}

/* ── Post-Show Tab ──────────────────────────────────────────── */

function PostShowTab({ data, update, stats }: { data: PrepData; update: (p: Partial<PrepData>) => void; stats: { totalSpent: number; totalValue: number; wantListFound: number; budgetByCategory: Record<string, number> } }) {
  const [showAdd, setShowAdd] = useState(false);
  const [card, setCard] = useState('');
  const [price, setPrice] = useState('');
  const [estValue, setEstValue] = useState('');
  const [sport, setSport] = useState('baseball');
  const [category, setCategory] = useState<Purchase['category']>('singles');

  const addPurchase = () => {
    if (!card.trim() || !price) return;
    const item: Purchase = {
      id: uid(),
      card: card.trim(),
      price: parseFloat(price) || 0,
      estimatedValue: parseFloat(estValue) || 0,
      sport,
      category,
      fromWantList: data.wantList.some(w => w.card.toLowerCase().includes(card.trim().toLowerCase())),
    };
    update({ purchases: [item, ...data.purchases] });
    setCard(''); setPrice(''); setEstValue('');
    setShowAdd(false);
  };

  const removePurchase = (id: string) => {
    update({ purchases: data.purchases.filter(p => p.id !== id) });
  };

  const profit = stats.totalValue - stats.totalSpent;
  const roi = stats.totalSpent > 0 ? Math.round((profit / stats.totalSpent) * 100) : 0;
  const budgetUsed = stats.totalSpent > 0 ? Math.round((stats.totalSpent / data.totalBudget) * 100) : 0;

  const shareResults = () => {
    const text = [
      `Card Show Recap${data.showName ? ` - ${data.showName}` : ''}`,
      `Budget: ${fmt(data.totalBudget)}`,
      `Spent: ${fmt(stats.totalSpent)} (${budgetUsed}%)`,
      `Est. Value: ${fmt(stats.totalValue)}`,
      `${profit >= 0 ? 'Profit' : 'Loss'}: ${fmt(Math.abs(profit))} (${roi >= 0 ? '+' : ''}${roi}% ROI)`,
      `Cards: ${data.purchases.length}`,
      `Want List Hits: ${stats.wantListFound}/${data.wantList.length}`,
      '',
      'cardvault-two.vercel.app/card-show-prep',
    ].join('\n');
    navigator.clipboard.writeText(text).catch(() => {});
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{fmt(stats.totalSpent)}</div>
          <div className="text-xs text-gray-500 mt-1">Total Spent</div>
          <div className="text-xs text-gray-600 mt-0.5">{budgetUsed}% of budget</div>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{fmt(stats.totalValue)}</div>
          <div className="text-xs text-gray-500 mt-1">Est. Value</div>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 text-center">
          <div className={`text-2xl font-bold ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{profit >= 0 ? '+' : ''}{fmt(profit)}</div>
          <div className="text-xs text-gray-500 mt-1">P&L</div>
          <div className={`text-xs mt-0.5 ${roi >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{roi >= 0 ? '+' : ''}{roi}% ROI</div>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{data.purchases.length}</div>
          <div className="text-xs text-gray-500 mt-1">Cards Bought</div>
          <div className="text-xs text-gray-600 mt-0.5">{stats.wantListFound} from want list</div>
        </div>
      </div>

      {/* Category Breakdown */}
      {data.purchases.length > 0 && (
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
          <h4 className="text-sm font-bold text-white mb-3">Spending by Category</h4>
          <div className="space-y-2">
            {CATEGORIES.map(cat => {
              const spent = stats.budgetByCategory[cat] || 0;
              const allocated = Math.round(data.totalBudget * data.allocation[cat] / 100);
              if (spent === 0 && allocated === 0) return null;
              const overBudget = spent > allocated;
              return (
                <div key={cat} className="flex items-center gap-3 text-sm">
                  <span className="w-20 text-gray-400 capitalize flex items-center gap-1"><span>{CAT_ICONS[cat]}</span> {cat}</span>
                  <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${overBudget ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(100, (spent / Math.max(allocated, 1)) * 100)}%` }} />
                  </div>
                  <span className={`text-xs w-24 text-right ${overBudget ? 'text-red-400' : 'text-gray-400'}`}>{fmt(spent)} / {fmt(allocated)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Purchase */}
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-bold text-white">Purchases</h4>
        <div className="flex gap-2">
          {data.purchases.length > 0 && (
            <button onClick={shareResults} className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg transition-colors">
              Share Results
            </button>
          )}
          <button onClick={() => setShowAdd(!showAdd)} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors">
            + Log Purchase
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="bg-gray-900/60 border border-emerald-800/50 rounded-xl p-4 space-y-3">
          <input
            type="text"
            value={card}
            onChange={e => setCard(e.target.value)}
            placeholder="What did you buy?"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:border-emerald-500 focus:outline-none"
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Price Paid</label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                <input type="number" min={0} value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-6 pr-2 py-2 text-white text-sm focus:border-emerald-500 focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Est. Value</label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                <input type="number" min={0} value={estValue} onChange={e => setEstValue(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-6 pr-2 py-2 text-white text-sm focus:border-emerald-500 focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Sport</label>
              <select value={sport} onChange={e => setSport(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 focus:outline-none">
                {SPORTS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value as Purchase['category'])} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 focus:outline-none">
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={addPurchase} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors">Log Purchase</button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {/* Purchase History */}
      {data.purchases.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-3xl mb-2">{'\ud83d\udcca'}</div>
          <p>No purchases logged yet. Use this tab after the show to track what you bought.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {data.purchases.map(p => (
            <div key={p.id} className="flex items-center gap-3 bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-3">
              <div className="text-lg">{CAT_ICONS[p.category] || '\ud83c\udccf'}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{p.card}</div>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                  <span>Paid: <span className="text-white">{fmt(p.price)}</span></span>
                  <span>&middot;</span>
                  <span>Value: <span className="text-blue-400">{fmt(p.estimatedValue)}</span></span>
                  <span>&middot;</span>
                  <span className={p.estimatedValue >= p.price ? 'text-emerald-400' : 'text-red-400'}>
                    {p.estimatedValue >= p.price ? '+' : ''}{fmt(p.estimatedValue - p.price)}
                  </span>
                </div>
              </div>
              <button onClick={() => removePurchase(p.id)} className="text-gray-600 hover:text-red-400 transition-colors text-sm">{'\u2715'}</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
