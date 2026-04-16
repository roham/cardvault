'use client';

import { useState, useEffect, useMemo } from 'react';

type Platform = 'ebay' | 'mercari' | 'comc' | 'myslabs' | 'facebook' | 'card-show' | 'direct' | 'whatnot' | 'other';
type Sport = 'baseball' | 'basketball' | 'football' | 'hockey' | 'pokemon' | 'other';
type EntryStatus = 'bought' | 'sold' | 'complete';

interface FlipEntry {
  id: string;
  cardName: string;
  sport: Sport;
  buyPrice: number;
  buyDate: string;
  buyPlatform: Platform;
  sellPrice: number | null;
  sellDate: string | null;
  sellPlatform: Platform | null;
  shippingCost: number;
  gradingCost: number;
  otherCosts: number;
  notes: string;
  status: EntryStatus;
}

const PLATFORMS: { value: Platform; label: string; fee: number }[] = [
  { value: 'ebay', label: 'eBay', fee: 0.1312 },
  { value: 'mercari', label: 'Mercari', fee: 0.10 },
  { value: 'comc', label: 'COMC', fee: 0.20 },
  { value: 'myslabs', label: 'MySlabs', fee: 0.08 },
  { value: 'facebook', label: 'Facebook', fee: 0.05 },
  { value: 'card-show', label: 'Card Show', fee: 0 },
  { value: 'whatnot', label: 'Whatnot', fee: 0.089 },
  { value: 'direct', label: 'Direct/Trade', fee: 0 },
  { value: 'other', label: 'Other', fee: 0 },
];

const SPORTS: { value: Sport; label: string; color: string }[] = [
  { value: 'baseball', label: 'Baseball', color: 'text-red-400' },
  { value: 'basketball', label: 'Basketball', color: 'text-orange-400' },
  { value: 'football', label: 'Football', color: 'text-green-400' },
  { value: 'hockey', label: 'Hockey', color: 'text-blue-400' },
  { value: 'pokemon', label: 'Pokemon', color: 'text-yellow-400' },
  { value: 'other', label: 'Other', color: 'text-gray-400' },
];

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function getPlatformFee(platform: Platform): number {
  return PLATFORMS.find(p => p.value === platform)?.fee ?? 0;
}

function calcProfit(entry: FlipEntry): number | null {
  if (entry.sellPrice === null) return null;
  const fee = entry.sellPrice * getPlatformFee(entry.sellPlatform ?? 'other');
  return entry.sellPrice - fee - entry.buyPrice - entry.shippingCost - entry.gradingCost - entry.otherCosts;
}

function calcROI(entry: FlipEntry): number | null {
  const profit = calcProfit(entry);
  if (profit === null) return null;
  const totalCost = entry.buyPrice + entry.shippingCost + entry.gradingCost + entry.otherCosts;
  if (totalCost === 0) return 0;
  return (profit / totalCost) * 100;
}

export default function FlipJournalClient() {
  const [entries, setEntries] = useState<FlipEntry[]>([]);
  const [view, setView] = useState<'journal' | 'add' | 'stats'>('journal');
  const [filterSport, setFilterSport] = useState<Sport | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<EntryStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'profit' | 'roi'>('date');
  const [editId, setEditId] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    cardName: '',
    sport: 'baseball' as Sport,
    buyPrice: '',
    buyDate: new Date().toISOString().split('T')[0],
    buyPlatform: 'ebay' as Platform,
    sellPrice: '',
    sellDate: '',
    sellPlatform: 'ebay' as Platform,
    shippingCost: '',
    gradingCost: '',
    otherCosts: '',
    notes: '',
    markSold: false,
  });

  useEffect(() => {
    const saved = localStorage.getItem('cardvault-flip-journal');
    if (saved) {
      try { setEntries(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    if (entries.length > 0) {
      localStorage.setItem('cardvault-flip-journal', JSON.stringify(entries));
    }
  }, [entries]);

  const resetForm = () => {
    setForm({
      cardName: '', sport: 'baseball', buyPrice: '', buyDate: new Date().toISOString().split('T')[0],
      buyPlatform: 'ebay', sellPrice: '', sellDate: '', sellPlatform: 'ebay',
      shippingCost: '', gradingCost: '', otherCosts: '', notes: '', markSold: false,
    });
    setEditId(null);
  };

  const handleSave = () => {
    if (!form.cardName || !form.buyPrice) return;
    const isSold = form.markSold && form.sellPrice;
    const entry: FlipEntry = {
      id: editId || generateId(),
      cardName: form.cardName,
      sport: form.sport,
      buyPrice: parseFloat(form.buyPrice) || 0,
      buyDate: form.buyDate,
      buyPlatform: form.buyPlatform,
      sellPrice: isSold ? (parseFloat(form.sellPrice) || 0) : null,
      sellDate: isSold ? (form.sellDate || new Date().toISOString().split('T')[0]) : null,
      sellPlatform: isSold ? form.sellPlatform : null,
      shippingCost: parseFloat(form.shippingCost) || 0,
      gradingCost: parseFloat(form.gradingCost) || 0,
      otherCosts: parseFloat(form.otherCosts) || 0,
      notes: form.notes,
      status: isSold ? 'complete' : 'bought',
    };
    if (editId) {
      setEntries(prev => prev.map(e => e.id === editId ? entry : e));
    } else {
      setEntries(prev => [entry, ...prev]);
    }
    resetForm();
    setView('journal');
  };

  const handleEdit = (entry: FlipEntry) => {
    setForm({
      cardName: entry.cardName,
      sport: entry.sport,
      buyPrice: entry.buyPrice.toString(),
      buyDate: entry.buyDate,
      buyPlatform: entry.buyPlatform,
      sellPrice: entry.sellPrice?.toString() ?? '',
      sellDate: entry.sellDate ?? '',
      sellPlatform: entry.sellPlatform ?? 'ebay',
      shippingCost: entry.shippingCost ? entry.shippingCost.toString() : '',
      gradingCost: entry.gradingCost ? entry.gradingCost.toString() : '',
      otherCosts: entry.otherCosts ? entry.otherCosts.toString() : '',
      notes: entry.notes,
      markSold: entry.status === 'complete',
    });
    setEditId(entry.id);
    setView('add');
  };

  const handleMarkSold = (id: string) => {
    const entry = entries.find(e => e.id === id);
    if (entry) handleEdit(entry);
  };

  const handleDelete = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const filtered = useMemo(() => {
    let list = [...entries];
    if (filterSport !== 'all') list = list.filter(e => e.sport === filterSport);
    if (filterStatus !== 'all') list = list.filter(e => e.status === filterStatus);
    if (sortBy === 'profit') {
      list.sort((a, b) => (calcProfit(b) ?? -Infinity) - (calcProfit(a) ?? -Infinity));
    } else if (sortBy === 'roi') {
      list.sort((a, b) => (calcROI(b) ?? -Infinity) - (calcROI(a) ?? -Infinity));
    } else {
      list.sort((a, b) => new Date(b.buyDate).getTime() - new Date(a.buyDate).getTime());
    }
    return list;
  }, [entries, filterSport, filterStatus, sortBy]);

  // Stats calculations
  const stats = useMemo(() => {
    const completed = entries.filter(e => e.status === 'complete');
    const totalBuys = entries.reduce((s, e) => s + e.buyPrice, 0);
    const totalSells = completed.reduce((s, e) => s + (e.sellPrice ?? 0), 0);
    const totalFees = completed.reduce((s, e) => {
      const fee = (e.sellPrice ?? 0) * getPlatformFee(e.sellPlatform ?? 'other');
      return s + fee;
    }, 0);
    const totalCosts = entries.reduce((s, e) => s + e.shippingCost + e.gradingCost + e.otherCosts, 0);
    const totalProfit = completed.reduce((s, e) => s + (calcProfit(e) ?? 0), 0);
    const avgROI = completed.length > 0
      ? completed.reduce((s, e) => s + (calcROI(e) ?? 0), 0) / completed.length
      : 0;

    const best = completed.reduce<FlipEntry | null>((best, e) => {
      const p = calcProfit(e) ?? -Infinity;
      return (best === null || p > (calcProfit(best) ?? -Infinity)) ? e : best;
    }, null);
    const worst = completed.reduce<FlipEntry | null>((worst, e) => {
      const p = calcProfit(e) ?? Infinity;
      return (worst === null || p < (calcProfit(worst) ?? Infinity)) ? e : worst;
    }, null);

    const bySport: Record<string, { count: number; profit: number }> = {};
    completed.forEach(e => {
      if (!bySport[e.sport]) bySport[e.sport] = { count: 0, profit: 0 };
      bySport[e.sport].count++;
      bySport[e.sport].profit += calcProfit(e) ?? 0;
    });

    const byPlatform: Record<string, { count: number; profit: number }> = {};
    completed.forEach(e => {
      const key = e.sellPlatform ?? 'other';
      if (!byPlatform[key]) byPlatform[key] = { count: 0, profit: 0 };
      byPlatform[key].count++;
      byPlatform[key].profit += calcProfit(e) ?? 0;
    });

    // Monthly P&L
    const byMonth: Record<string, { revenue: number; cost: number; profit: number; count: number }> = {};
    completed.forEach(e => {
      const month = (e.sellDate ?? e.buyDate).slice(0, 7);
      if (!byMonth[month]) byMonth[month] = { revenue: 0, cost: 0, profit: 0, count: 0 };
      byMonth[month].revenue += e.sellPrice ?? 0;
      byMonth[month].cost += e.buyPrice + e.shippingCost + e.gradingCost + e.otherCosts;
      byMonth[month].profit += calcProfit(e) ?? 0;
      byMonth[month].count++;
    });

    const unsoldValue = entries.filter(e => e.status === 'bought')
      .reduce((s, e) => s + e.buyPrice + e.shippingCost + e.gradingCost + e.otherCosts, 0);

    return {
      totalEntries: entries.length, completed: completed.length,
      pending: entries.length - completed.length,
      totalBuys, totalSells, totalFees, totalCosts, totalProfit, avgROI,
      best, worst, bySport, byPlatform, byMonth, unsoldValue,
      winRate: completed.length > 0
        ? (completed.filter(e => (calcProfit(e) ?? 0) > 0).length / completed.length * 100)
        : 0,
    };
  }, [entries]);

  const handleExport = () => {
    const lines = [
      `CardVault Flip Journal — ${new Date().toLocaleDateString()}`,
      `Total Flips: ${stats.completed} | Win Rate: ${stats.winRate.toFixed(0)}% | Net P&L: $${stats.totalProfit.toFixed(2)}`,
      '',
      'Card | Buy $ | Sell $ | Profit | ROI',
      ...entries.filter(e => e.status === 'complete').map(e => {
        const p = calcProfit(e);
        const r = calcROI(e);
        return `${e.cardName} | $${e.buyPrice} | $${e.sellPrice} | ${p !== null ? (p >= 0 ? '+' : '') + '$' + p.toFixed(2) : 'N/A'} | ${r !== null ? r.toFixed(0) + '%' : 'N/A'}`;
      }),
    ];
    navigator.clipboard.writeText(lines.join('\n'));
  };

  const handleLoadSample = () => {
    const samples: FlipEntry[] = [
      { id: 'sample1', cardName: '2023 Topps Chrome Victor Wembanyama RC', sport: 'basketball', buyPrice: 25, buyDate: '2024-10-15', buyPlatform: 'ebay', sellPrice: 85, sellDate: '2024-12-01', sellPlatform: 'ebay', shippingCost: 4, gradingCost: 0, otherCosts: 0, notes: 'Bought raw, sold after strong start', status: 'complete' },
      { id: 'sample2', cardName: '2024 Bowman Chrome Paul Skenes RC Auto', sport: 'baseball', buyPrice: 180, buyDate: '2024-11-01', buyPlatform: 'card-show', sellPrice: 310, sellDate: '2025-01-10', sellPlatform: 'ebay', shippingCost: 5, gradingCost: 30, otherCosts: 0, notes: 'Graded PSA 10, sold for premium', status: 'complete' },
      { id: 'sample3', cardName: '2024 Prizm Caleb Williams RC Silver', sport: 'football', buyPrice: 45, buyDate: '2025-02-01', buyPlatform: 'mercari', sellPrice: 38, sellDate: '2025-03-15', sellPlatform: 'mercari', shippingCost: 4, gradingCost: 0, otherCosts: 0, notes: 'Rookie struggled, took a loss', status: 'complete' },
      { id: 'sample4', cardName: '2023-24 Upper Deck Macklin Celebrini YG', sport: 'hockey', buyPrice: 55, buyDate: '2025-03-01', buyPlatform: 'ebay', sellPrice: null, sellDate: null, sellPlatform: null, shippingCost: 4, gradingCost: 0, otherCosts: 0, notes: 'Holding for playoffs', status: 'bought' },
      { id: 'sample5', cardName: '2021 Topps Chrome Julio Rodriguez RC', sport: 'baseball', buyPrice: 12, buyDate: '2024-09-01', buyPlatform: 'card-show', sellPrice: 42, sellDate: '2025-04-01', sellPlatform: 'whatnot', shippingCost: 4, gradingCost: 0, otherCosts: 0, notes: 'Card show find, sold on Whatnot stream', status: 'complete' },
    ];
    setEntries(samples);
  };

  return (
    <div>
      {/* Quick Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-white">{stats.totalEntries}</div>
          <div className="text-xs text-gray-500 mt-1">Total Flips</div>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4 text-center">
          <div className={`text-2xl font-bold ${stats.totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {stats.totalProfit >= 0 ? '+' : ''}${stats.totalProfit.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 mt-1">Net P&L</div>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-amber-400">{stats.winRate.toFixed(0)}%</div>
          <div className="text-xs text-gray-500 mt-1">Win Rate</div>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{stats.avgROI.toFixed(0)}%</div>
          <div className="text-xs text-gray-500 mt-1">Avg ROI</div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex gap-2 mb-6">
        {(['journal', 'add', 'stats'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => { setView(tab); if (tab === 'add' && !editId) resetForm(); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === tab ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {tab === 'journal' ? `Journal (${entries.length})` : tab === 'add' ? (editId ? 'Edit Flip' : '+ Log Flip') : 'Analytics'}
          </button>
        ))}
        {entries.length === 0 && (
          <button onClick={handleLoadSample} className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-800 text-yellow-400 hover:bg-gray-700 transition-colors ml-auto">
            Load Sample Data
          </button>
        )}
      </div>

      {/* ADD / EDIT VIEW */}
      {view === 'add' && (
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6 space-y-5">
          <h3 className="text-lg font-bold text-white">{editId ? 'Edit Flip' : 'Log a New Flip'}</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Card Name *</label>
              <input value={form.cardName} onChange={e => setForm(f => ({ ...f, cardName: e.target.value }))}
                placeholder="e.g. 2024 Topps Chrome Wemby RC #150"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:border-emerald-500 focus:outline-none" />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Sport</label>
              <select value={form.sport} onChange={e => setForm(f => ({ ...f, sport: e.target.value as Sport }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none">
                {SPORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Buy Price ($) *</label>
              <input type="number" step="0.01" value={form.buyPrice} onChange={e => setForm(f => ({ ...f, buyPrice: e.target.value }))}
                placeholder="25.00"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:border-emerald-500 focus:outline-none" />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Buy Date</label>
              <input type="date" value={form.buyDate} onChange={e => setForm(f => ({ ...f, buyDate: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none" />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Buy Platform</label>
              <select value={form.buyPlatform} onChange={e => setForm(f => ({ ...f, buyPlatform: e.target.value as Platform }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none">
                {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Shipping Cost ($)</label>
              <input type="number" step="0.01" value={form.shippingCost} onChange={e => setForm(f => ({ ...f, shippingCost: e.target.value }))}
                placeholder="4.00"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:border-emerald-500 focus:outline-none" />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Grading Cost ($)</label>
              <input type="number" step="0.01" value={form.gradingCost} onChange={e => setForm(f => ({ ...f, gradingCost: e.target.value }))}
                placeholder="0.00"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:border-emerald-500 focus:outline-none" />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Other Costs ($)</label>
              <input type="number" step="0.01" value={form.otherCosts} onChange={e => setForm(f => ({ ...f, otherCosts: e.target.value }))}
                placeholder="0.00"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:border-emerald-500 focus:outline-none" />
            </div>
          </div>

          {/* Mark as Sold toggle */}
          <div className="border-t border-gray-800 pt-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.markSold} onChange={e => setForm(f => ({ ...f, markSold: e.target.checked }))}
                className="w-5 h-5 rounded bg-gray-800 border-gray-700 text-emerald-500 focus:ring-emerald-500" />
              <span className="text-white font-medium">Mark as Sold</span>
            </label>
          </div>

          {form.markSold && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-emerald-950/30 border border-emerald-800/40 rounded-lg p-4">
              <div>
                <label className="block text-xs text-emerald-400 mb-1">Sell Price ($)</label>
                <input type="number" step="0.01" value={form.sellPrice} onChange={e => setForm(f => ({ ...f, sellPrice: e.target.value }))}
                  placeholder="85.00"
                  className="w-full bg-gray-800 border border-emerald-800/50 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:border-emerald-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs text-emerald-400 mb-1">Sell Date</label>
                <input type="date" value={form.sellDate} onChange={e => setForm(f => ({ ...f, sellDate: e.target.value }))}
                  className="w-full bg-gray-800 border border-emerald-800/50 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs text-emerald-400 mb-1">Sell Platform</label>
                <select value={form.sellPlatform} onChange={e => setForm(f => ({ ...f, sellPlatform: e.target.value as Platform }))}
                  className="w-full bg-gray-800 border border-emerald-800/50 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none">
                  {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label} ({(p.fee * 100).toFixed(1)}% fee)</option>)}
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs text-gray-500 mb-1">Notes</label>
            <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Optional notes about this flip..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:border-emerald-500 focus:outline-none" />
          </div>

          <div className="flex gap-3">
            <button onClick={handleSave}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors">
              {editId ? 'Update Flip' : 'Log Flip'}
            </button>
            <button onClick={() => { resetForm(); setView('journal'); }}
              className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-400 font-medium rounded-lg transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* JOURNAL VIEW */}
      {view === 'journal' && (
        <div>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            <select value={filterSport} onChange={e => setFilterSport(e.target.value as Sport | 'all')}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none">
              <option value="all">All Sports</option>
              {SPORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as EntryStatus | 'all')}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none">
              <option value="all">All Status</option>
              <option value="bought">Holding</option>
              <option value="complete">Sold</option>
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value as 'date' | 'profit' | 'roi')}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none">
              <option value="date">Sort: Date</option>
              <option value="profit">Sort: Profit</option>
              <option value="roi">Sort: ROI</option>
            </select>
            {entries.length > 0 && (
              <button onClick={handleExport}
                className="ml-auto bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-emerald-400 hover:text-white hover:bg-gray-700 transition-colors">
                Copy P&L
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-12 text-center">
              <div className="text-4xl mb-3">📓</div>
              <h3 className="text-lg font-bold text-white mb-2">No flips logged yet</h3>
              <p className="text-gray-500 text-sm mb-4">Start tracking your card flips to see profit and loss over time.</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setView('add')} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors text-sm">
                  Log Your First Flip
                </button>
                <button onClick={handleLoadSample} className="px-5 py-2 bg-gray-800 hover:bg-gray-700 text-yellow-400 font-medium rounded-lg transition-colors text-sm">
                  Try Sample Data
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(entry => {
                const profit = calcProfit(entry);
                const roi = calcROI(entry);
                const sportInfo = SPORTS.find(s => s.value === entry.sport);
                return (
                  <div key={entry.id} className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-medium ${sportInfo?.color ?? 'text-gray-400'}`}>
                            {sportInfo?.label ?? entry.sport}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            entry.status === 'complete' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50' : 'bg-amber-950/60 text-amber-400 border border-amber-800/50'
                          }`}>
                            {entry.status === 'complete' ? 'Sold' : 'Holding'}
                          </span>
                        </div>
                        <h4 className="text-white font-medium truncate">{entry.cardName}</h4>
                        <div className="text-xs text-gray-500 mt-1">
                          Bought ${entry.buyPrice.toFixed(2)} on {PLATFORMS.find(p => p.value === entry.buyPlatform)?.label} · {entry.buyDate}
                          {entry.sellPrice !== null && (
                            <> · Sold ${entry.sellPrice.toFixed(2)} on {PLATFORMS.find(p => p.value === entry.sellPlatform)?.label}</>
                          )}
                        </div>
                        {entry.notes && <div className="text-xs text-gray-600 mt-1 italic">{entry.notes}</div>}
                      </div>
                      <div className="text-right shrink-0">
                        {profit !== null ? (
                          <>
                            <div className={`text-lg font-bold ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {profit >= 0 ? '+' : ''}${profit.toFixed(2)}
                            </div>
                            <div className={`text-xs ${roi !== null && roi >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                              {roi !== null ? `${roi >= 0 ? '+' : ''}${roi.toFixed(0)}% ROI` : ''}
                            </div>
                          </>
                        ) : (
                          <div className="text-sm text-amber-400">
                            -${(entry.buyPrice + entry.shippingCost + entry.gradingCost + entry.otherCosts).toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-800/60">
                      {entry.status === 'bought' && (
                        <button onClick={() => handleMarkSold(entry.id)}
                          className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">Mark Sold</button>
                      )}
                      <button onClick={() => handleEdit(entry)}
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Edit</button>
                      <button onClick={() => handleDelete(entry.id)}
                        className="text-xs text-red-400 hover:text-red-300 transition-colors ml-auto">Delete</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* STATS VIEW */}
      {view === 'stats' && (
        <div className="space-y-6">
          {entries.length === 0 ? (
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-12 text-center">
              <p className="text-gray-500">Log some flips first to see your analytics.</p>
            </div>
          ) : (
            <>
              {/* Financial Summary */}
              <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Financial Summary</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs text-gray-500">Total Bought</div>
                    <div className="text-lg font-bold text-white">${stats.totalBuys.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Total Sold</div>
                    <div className="text-lg font-bold text-white">${stats.totalSells.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Platform Fees</div>
                    <div className="text-lg font-bold text-red-400">-${stats.totalFees.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Extra Costs</div>
                    <div className="text-lg font-bold text-red-400">-${stats.totalCosts.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Net P&L</div>
                    <div className={`text-lg font-bold ${stats.totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {stats.totalProfit >= 0 ? '+' : ''}${stats.totalProfit.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Unsold Inventory</div>
                    <div className="text-lg font-bold text-amber-400">${stats.unsoldValue.toFixed(2)}</div>
                  </div>
                </div>
              </div>

              {/* Best & Worst */}
              {(stats.best || stats.worst) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {stats.best && (
                    <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-5">
                      <div className="text-xs text-emerald-400 font-medium mb-2">Best Flip</div>
                      <div className="text-white font-medium text-sm truncate">{stats.best.cardName}</div>
                      <div className="text-emerald-400 font-bold text-xl mt-1">+${calcProfit(stats.best)?.toFixed(2)} ({calcROI(stats.best)?.toFixed(0)}% ROI)</div>
                    </div>
                  )}
                  {stats.worst && calcProfit(stats.worst) !== null && (calcProfit(stats.worst) ?? 0) < 0 && (
                    <div className="bg-red-950/30 border border-red-800/40 rounded-xl p-5">
                      <div className="text-xs text-red-400 font-medium mb-2">Worst Flip</div>
                      <div className="text-white font-medium text-sm truncate">{stats.worst.cardName}</div>
                      <div className="text-red-400 font-bold text-xl mt-1">${calcProfit(stats.worst)?.toFixed(2)} ({calcROI(stats.worst)?.toFixed(0)}% ROI)</div>
                    </div>
                  )}
                </div>
              )}

              {/* By Sport */}
              {Object.keys(stats.bySport).length > 0 && (
                <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">P&L by Sport</h3>
                  <div className="space-y-3">
                    {Object.entries(stats.bySport).sort((a, b) => b[1].profit - a[1].profit).map(([sport, data]) => {
                      const sportInfo = SPORTS.find(s => s.value === sport);
                      const maxProfit = Math.max(...Object.values(stats.bySport).map(d => Math.abs(d.profit)));
                      const barWidth = maxProfit > 0 ? (Math.abs(data.profit) / maxProfit) * 100 : 0;
                      return (
                        <div key={sport} className="flex items-center gap-3">
                          <span className={`text-sm font-medium w-24 ${sportInfo?.color ?? 'text-gray-400'}`}>{sportInfo?.label ?? sport}</span>
                          <div className="flex-1 bg-gray-800 rounded-full h-4 overflow-hidden">
                            <div className={`h-full rounded-full ${data.profit >= 0 ? 'bg-emerald-600' : 'bg-red-600'}`}
                              style={{ width: `${barWidth}%` }} />
                          </div>
                          <span className={`text-sm font-bold w-20 text-right ${data.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {data.profit >= 0 ? '+' : ''}${data.profit.toFixed(0)}
                          </span>
                          <span className="text-xs text-gray-500 w-12 text-right">{data.count} flips</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* By Platform */}
              {Object.keys(stats.byPlatform).length > 0 && (
                <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">P&L by Platform</h3>
                  <div className="space-y-3">
                    {Object.entries(stats.byPlatform).sort((a, b) => b[1].profit - a[1].profit).map(([platform, data]) => {
                      const platInfo = PLATFORMS.find(p => p.value === platform);
                      const maxProfit = Math.max(...Object.values(stats.byPlatform).map(d => Math.abs(d.profit)));
                      const barWidth = maxProfit > 0 ? (Math.abs(data.profit) / maxProfit) * 100 : 0;
                      return (
                        <div key={platform} className="flex items-center gap-3">
                          <span className="text-sm font-medium w-24 text-gray-300">{platInfo?.label ?? platform}</span>
                          <div className="flex-1 bg-gray-800 rounded-full h-4 overflow-hidden">
                            <div className={`h-full rounded-full ${data.profit >= 0 ? 'bg-blue-600' : 'bg-red-600'}`}
                              style={{ width: `${barWidth}%` }} />
                          </div>
                          <span className={`text-sm font-bold w-20 text-right ${data.profit >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                            {data.profit >= 0 ? '+' : ''}${data.profit.toFixed(0)}
                          </span>
                          <span className="text-xs text-gray-500 w-12 text-right">{data.count} flips</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Monthly P&L */}
              {Object.keys(stats.byMonth).length > 0 && (
                <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Monthly P&L</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-gray-500 text-xs border-b border-gray-800">
                          <th className="text-left pb-2">Month</th>
                          <th className="text-right pb-2">Revenue</th>
                          <th className="text-right pb-2">Cost</th>
                          <th className="text-right pb-2">Profit</th>
                          <th className="text-right pb-2">Flips</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(stats.byMonth).sort((a, b) => b[0].localeCompare(a[0])).map(([month, data]) => (
                          <tr key={month} className="border-b border-gray-800/50">
                            <td className="py-2 text-white">{month}</td>
                            <td className="py-2 text-right text-gray-300">${data.revenue.toFixed(2)}</td>
                            <td className="py-2 text-right text-gray-400">${data.cost.toFixed(2)}</td>
                            <td className={`py-2 text-right font-medium ${data.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {data.profit >= 0 ? '+' : ''}${data.profit.toFixed(2)}
                            </td>
                            <td className="py-2 text-right text-gray-500">{data.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* How It Works */}
      <section className="mt-12 bg-gray-900/60 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">How the Flip Journal Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <div className="text-2xl mb-2">1. Log Buys</div>
            <p className="text-gray-400 text-sm">Record every card you purchase with price, platform, date, and shipping costs. Track your inventory of cards waiting to flip.</p>
          </div>
          <div>
            <div className="text-2xl mb-2">2. Mark Sells</div>
            <p className="text-gray-400 text-sm">When you sell a card, mark it sold with the sale price and platform. Fees are automatically calculated per platform.</p>
          </div>
          <div>
            <div className="text-2xl mb-2">3. See P&L</div>
            <p className="text-gray-400 text-sm">Analytics show your net profit, win rate, ROI, best/worst flips, and breakdowns by sport and platform.</p>
          </div>
        </div>

        <div className="mt-6 border-t border-gray-800 pt-4">
          <h3 className="text-sm font-bold text-white mb-3">Platform Fee Reference</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PLATFORMS.filter(p => p.fee > 0).map(p => (
              <div key={p.value} className="bg-gray-800/60 rounded-lg px-3 py-2 text-xs">
                <span className="text-gray-300 font-medium">{p.label}</span>
                <span className="text-gray-500 ml-2">{(p.fee * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
