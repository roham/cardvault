'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

type Priority = 'must-buy' | 'want' | 'maybe';

interface BuyListItem {
  slug: string;
  name: string;
  player: string;
  sport: string;
  targetPrice: number;
  priority: Priority;
  notes: string;
}

function parseValue(raw: string): number {
  const m = raw.match(/\$[\d,]+/);
  if (!m) return 0;
  return parseInt(m[0].replace(/[$,]/g, ''), 10);
}

const PRIORITY_LABELS: Record<Priority, { label: string; color: string; bg: string; sort: number }> = {
  'must-buy': { label: 'Must Buy', color: 'text-red-400', bg: 'bg-red-950/60 border-red-800/50', sort: 0 },
  'want': { label: 'Want', color: 'text-amber-400', bg: 'bg-amber-950/60 border-amber-800/50', sort: 1 },
  'maybe': { label: 'Maybe', color: 'text-blue-400', bg: 'bg-blue-950/60 border-blue-800/50', sort: 2 },
};

const SPORT_COLORS: Record<string, string> = {
  baseball: 'bg-red-500',
  basketball: 'bg-orange-500',
  football: 'bg-blue-500',
  hockey: 'bg-cyan-500',
};

const LS_KEY = 'cardvault-smart-buy-list';
const LS_BUDGET_KEY = 'cardvault-smart-buy-budget';

export default function SmartBuyListClient() {
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<BuyListItem[]>([]);
  const [budget, setBudget] = useState(500);
  const [query, setQuery] = useState('');
  const [sportFilter, setSportFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'price-asc' | 'price-desc' | 'sport'>('priority');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState<Priority>('want');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) setItems(JSON.parse(saved));
      const savedBudget = localStorage.getItem(LS_BUDGET_KEY);
      if (savedBudget) setBudget(parseInt(savedBudget, 10));
    } catch {}
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  }, [items, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(LS_BUDGET_KEY, String(budget));
  }, [budget, mounted]);

  const searchResults = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    return sportsCards
      .filter(c => {
        if (sportFilter !== 'all' && c.sport !== sportFilter) return false;
        return c.name.toLowerCase().includes(q) || c.player.toLowerCase().includes(q);
      })
      .slice(0, 12);
  }, [query, sportFilter]);

  const addItem = useCallback((slug: string) => {
    if (items.some(i => i.slug === slug)) return;
    const card = sportsCards.find(c => c.slug === slug);
    if (!card) return;
    const raw = parseValue(card.estimatedValueRaw);
    setItems(prev => [...prev, {
      slug,
      name: card.name,
      player: card.player,
      sport: card.sport,
      targetPrice: raw || 50,
      priority: selectedPriority,
      notes: '',
    }]);
    setQuery('');
    setShowSearch(false);
  }, [items, selectedPriority]);

  const removeItem = useCallback((slug: string) => {
    setItems(prev => prev.filter(i => i.slug !== slug));
  }, []);

  const updateItem = useCallback((slug: string, updates: Partial<BuyListItem>) => {
    setItems(prev => prev.map(i => i.slug === slug ? { ...i, ...updates } : i));
  }, []);

  const totalCost = useMemo(() => items.reduce((s, i) => s + i.targetPrice, 0), [items]);
  const remaining = budget - totalCost;
  const budgetPct = budget > 0 ? Math.min((totalCost / budget) * 100, 100) : 0;

  const sortedItems = useMemo(() => {
    const sorted = [...items];
    switch (sortBy) {
      case 'priority':
        sorted.sort((a, b) => PRIORITY_LABELS[a.priority].sort - PRIORITY_LABELS[b.priority].sort);
        break;
      case 'price-asc':
        sorted.sort((a, b) => a.targetPrice - b.targetPrice);
        break;
      case 'price-desc':
        sorted.sort((a, b) => b.targetPrice - a.targetPrice);
        break;
      case 'sport':
        sorted.sort((a, b) => a.sport.localeCompare(b.sport));
        break;
    }
    return sorted;
  }, [items, sortBy]);

  const sportBreakdown = useMemo(() => {
    const counts: Record<string, { count: number; total: number }> = {};
    for (const item of items) {
      if (!counts[item.sport]) counts[item.sport] = { count: 0, total: 0 };
      counts[item.sport].count++;
      counts[item.sport].total += item.targetPrice;
    }
    return counts;
  }, [items]);

  const priorityBreakdown = useMemo(() => {
    const counts: Record<Priority, number> = { 'must-buy': 0, want: 0, maybe: 0 };
    for (const item of items) counts[item.priority]++;
    return counts;
  }, [items]);

  const copyToClipboard = useCallback(() => {
    const lines = [
      `Card Show Buy List — Budget: $${budget.toLocaleString()}`,
      `Total: $${totalCost.toLocaleString()} | Remaining: $${remaining.toLocaleString()}`,
      '─'.repeat(50),
      '',
    ];
    const grouped: Record<Priority, BuyListItem[]> = { 'must-buy': [], want: [], maybe: [] };
    for (const item of sortedItems) grouped[item.priority].push(item);

    for (const p of ['must-buy', 'want', 'maybe'] as Priority[]) {
      if (grouped[p].length === 0) continue;
      lines.push(`[${PRIORITY_LABELS[p].label.toUpperCase()}]`);
      for (const item of grouped[p]) {
        lines.push(`  ○ ${item.name} — $${item.targetPrice.toLocaleString()}${item.notes ? ` (${item.notes})` : ''}`);
      }
      lines.push('');
    }
    lines.push('Built with CardVault — cardvault-two.vercel.app/tools/smart-buy-list');

    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [budget, totalCost, remaining, sortedItems]);

  const clearAll = useCallback(() => {
    if (items.length > 0) setItems([]);
  }, [items.length]);

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="h-24 bg-gray-800/50 rounded-xl animate-pulse" />
        <div className="h-48 bg-gray-800/50 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Budget Bar */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
          <div className="flex-1">
            <label className="text-sm text-gray-400 mb-1 block">Budget</label>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">$</span>
              <input
                type="number"
                value={budget}
                onChange={e => setBudget(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 w-32 text-lg font-bold"
              />
            </div>
          </div>
          <div className="flex gap-6 text-center">
            <div>
              <div className="text-xs text-gray-500 mb-1">Total</div>
              <div className="text-lg font-bold text-white">${totalCost.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Remaining</div>
              <div className={`text-lg font-bold ${remaining >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                ${Math.abs(remaining).toLocaleString()}{remaining < 0 ? ' over' : ''}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Cards</div>
              <div className="text-lg font-bold text-white">{items.length}</div>
            </div>
          </div>
        </div>
        <div className="w-full bg-gray-900 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              budgetPct > 100 ? 'bg-red-500' : budgetPct > 80 ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(budgetPct, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{budgetPct.toFixed(0)}% allocated</span>
          <span>${budget.toLocaleString()} budget</span>
        </div>
      </div>

      {/* Add Cards */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Add Cards</h3>
          <div className="flex gap-2">
            {(['must-buy', 'want', 'maybe'] as Priority[]).map(p => (
              <button
                key={p}
                onClick={() => setSelectedPriority(p)}
                className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  selectedPriority === p
                    ? PRIORITY_LABELS[p].bg + ' ' + PRIORITY_LABELS[p].color
                    : 'bg-gray-900 border-gray-700 text-gray-500 hover:text-gray-300'
                }`}
              >
                {PRIORITY_LABELS[p].label}
              </button>
            ))}
          </div>
        </div>

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
            onChange={e => { setQuery(e.target.value); setShowSearch(true); }}
            onFocus={() => setShowSearch(true)}
            className="flex-1 bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2 placeholder-gray-500"
          />
        </div>

        {showSearch && searchResults.length > 0 && (
          <div className="bg-gray-900 border border-gray-700 rounded-lg max-h-64 overflow-y-auto">
            {searchResults.map(card => {
              const alreadyAdded = items.some(i => i.slug === card.slug);
              return (
                <button
                  key={card.slug}
                  onClick={() => !alreadyAdded && addItem(card.slug)}
                  disabled={alreadyAdded}
                  className={`w-full text-left px-4 py-2.5 border-b border-gray-800 last:border-0 flex items-center gap-3 transition-colors ${
                    alreadyAdded ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-800'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${SPORT_COLORS[card.sport] || 'bg-gray-500'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">{card.name}</div>
                    <div className="text-xs text-gray-500">{card.player} &middot; {card.sport}</div>
                  </div>
                  <div className="text-sm text-gray-400 shrink-0">{card.estimatedValueRaw.split('(')[0].trim()}</div>
                  {alreadyAdded && <span className="text-xs text-gray-600">Added</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Controls */}
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="priority">Sort: Priority</option>
            <option value="price-desc">Sort: Price High→Low</option>
            <option value="price-asc">Sort: Price Low→High</option>
            <option value="sport">Sort: Sport</option>
          </select>
          <button
            onClick={copyToClipboard}
            className="px-4 py-2 bg-emerald-900/60 border border-emerald-800/50 text-emerald-400 rounded-lg text-sm font-medium hover:bg-emerald-900/80 transition-colors"
          >
            {copied ? 'Copied!' : 'Copy List'}
          </button>
          <button
            onClick={clearAll}
            className="px-4 py-2 bg-red-900/30 border border-red-800/30 text-red-400 rounded-lg text-sm font-medium hover:bg-red-900/50 transition-colors"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Item List */}
      {sortedItems.length === 0 ? (
        <div className="bg-gray-800/30 border border-gray-700/30 rounded-xl p-10 text-center">
          <div className="text-4xl mb-3">🛒</div>
          <h3 className="text-lg font-semibold text-white mb-2">Your buy list is empty</h3>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Search for cards above to start building your shopping list. Set a budget, prioritize your picks, and bring this list to your next card show or online shopping session.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedItems.map(item => (
            <div
              key={item.slug}
              className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 group"
            >
              <div className="flex items-start gap-3">
                <span className={`w-2 h-2 rounded-full mt-2 shrink-0 ${SPORT_COLORS[item.sport] || 'bg-gray-500'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/sports/${item.slug}`}
                      className="text-sm font-medium text-white hover:text-emerald-400 transition-colors truncate"
                    >
                      {item.name}
                    </Link>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${PRIORITY_LABELS[item.priority].bg} ${PRIORITY_LABELS[item.priority].color}`}>
                      {PRIORITY_LABELS[item.priority].label}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{item.player} &middot; {item.sport}</div>

                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">Target:</span>
                      <span className="text-gray-500">$</span>
                      <input
                        type="number"
                        value={item.targetPrice}
                        onChange={e => updateItem(item.slug, { targetPrice: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                        className="bg-gray-900 border border-gray-700 text-white rounded px-2 py-1 w-24 text-sm"
                      />
                    </div>
                    <select
                      value={item.priority}
                      onChange={e => updateItem(item.slug, { priority: e.target.value as Priority })}
                      className="bg-gray-900 border border-gray-700 text-gray-300 rounded px-2 py-1 text-xs"
                    >
                      <option value="must-buy">Must Buy</option>
                      <option value="want">Want</option>
                      <option value="maybe">Maybe</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Notes..."
                      value={item.notes}
                      onChange={e => updateItem(item.slug, { notes: e.target.value })}
                      className="flex-1 bg-gray-900 border border-gray-700 text-gray-300 rounded px-2 py-1 text-xs placeholder-gray-600 min-w-0"
                    />
                    <button
                      onClick={() => removeItem(item.slug)}
                      className="text-gray-600 hover:text-red-400 transition-colors text-lg shrink-0"
                      title="Remove"
                    >
                      &times;
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* By Sport */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-white mb-3">By Sport</h4>
            <div className="space-y-2">
              {Object.entries(sportBreakdown).sort((a, b) => b[1].total - a[1].total).map(([sport, data]) => (
                <div key={sport} className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${SPORT_COLORS[sport]}`} />
                  <span className="text-sm text-gray-300 capitalize flex-1">{sport}</span>
                  <span className="text-xs text-gray-500">{data.count} cards</span>
                  <span className="text-sm font-medium text-white">${data.total.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* By Priority */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-white mb-3">By Priority</h4>
            <div className="space-y-2">
              {(['must-buy', 'want', 'maybe'] as Priority[]).map(p => {
                const count = priorityBreakdown[p];
                const total = items.filter(i => i.priority === p).reduce((s, i) => s + i.targetPrice, 0);
                return (
                  <div key={p} className="flex items-center gap-2">
                    <span className={`text-sm flex-1 ${PRIORITY_LABELS[p].color}`}>{PRIORITY_LABELS[p].label}</span>
                    <span className="text-xs text-gray-500">{count} cards</span>
                    <span className="text-sm font-medium text-white">${total.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-white mb-4">Card Show Buying Tips</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { title: 'Set a hard budget', tip: 'Decide your maximum spend before you walk in. Bring that amount in cash and leave your card at home.' },
            { title: 'Prioritize must-buys first', tip: 'Hit your must-buy cards early before they sell. Save maybes for your second lap around the show.' },
            { title: 'Check comps on your phone', tip: 'Look up eBay sold listings before negotiating. Knowing the real market price gives you leverage.' },
            { title: 'Bundle for discounts', tip: 'Buying 3+ cards from one dealer? Ask for a package deal. Most dealers will discount 10-20% on bundles.' },
            { title: 'Inspect before paying', tip: 'Check centering, corners, edges, and surface under good light. Card show lighting can hide flaws.' },
            { title: 'Save cash for late deals', tip: 'Dealers often discount 10-20% in the last hour of a show to avoid packing unsold inventory.' },
          ].map((t, i) => (
            <div key={i} className="bg-gray-900/50 rounded-lg p-3">
              <div className="text-sm font-medium text-emerald-400 mb-1">{t.title}</div>
              <div className="text-xs text-gray-400">{t.tip}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Related Tools */}
      <div className="flex flex-wrap gap-2">
        {[
          { href: '/tools/show-finder', label: 'Card Show Finder' },
          { href: '/tools/show-prep', label: 'Show Prep Kit' },
          { href: '/tools/negotiation-calc', label: 'Negotiation Calculator' },
          { href: '/tools/dealer-scanner', label: 'Dealer Scanner' },
          { href: '/tools/flip-calc', label: 'Flip Profit Calculator' },
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
