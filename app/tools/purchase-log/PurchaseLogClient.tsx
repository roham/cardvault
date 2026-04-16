'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';

interface Purchase {
  id: string;
  date: string;
  cardName: string;
  sport: string;
  price: number;
  platform: string;
  condition: string;
  notes: string;
}

const PLATFORMS = ['eBay', 'Card Show', 'LCS', 'Facebook', 'COMC', 'Whatnot', 'MySlabs', 'TCGPlayer', 'Trade', 'Gift', 'Other'];
const CONDITIONS = ['Raw', 'PSA 10', 'PSA 9', 'PSA 8', 'BGS 9.5', 'BGS 9', 'CGC 10', 'CGC 9.5', 'Other Graded', 'Sealed'];
const SPORTS = ['baseball', 'basketball', 'football', 'hockey', 'pokemon', 'other'];

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n);
}

export default function PurchaseLogClient() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [filterSport, setFilterSport] = useState('all');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterMonth, setFilterMonth] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'name'>('date');
  const [view, setView] = useState<'list' | 'analytics'>('list');

  // Form state
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newCard, setNewCard] = useState('');
  const [newSport, setNewSport] = useState('baseball');
  const [newPrice, setNewPrice] = useState('');
  const [newPlatform, setNewPlatform] = useState('eBay');
  const [newCondition, setNewCondition] = useState('Raw');
  const [newNotes, setNewNotes] = useState('');

  // Load from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cardvault-purchase-log');
      if (saved) {
        try { setPurchases(JSON.parse(saved)); } catch { /* ignore */ }
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cardvault-purchase-log', JSON.stringify(purchases));
    }
  }, [purchases]);

  const addPurchase = useCallback(() => {
    if (!newCard.trim() || !newPrice) return;
    setPurchases(prev => [{
      id: generateId(),
      date: newDate,
      cardName: newCard.trim(),
      sport: newSport,
      price: parseFloat(newPrice) || 0,
      platform: newPlatform,
      condition: newCondition,
      notes: newNotes.trim(),
    }, ...prev]);
    setNewCard(''); setNewPrice(''); setNewNotes('');
    setShowAdd(false);
  }, [newDate, newCard, newSport, newPrice, newPlatform, newCondition, newNotes]);

  const removePurchase = useCallback((id: string) => {
    setPurchases(prev => prev.filter(p => p.id !== id));
  }, []);

  // Get unique months for filter
  const months = useMemo(() => {
    const set = new Set(purchases.map(p => p.date.slice(0, 7)));
    return Array.from(set).sort().reverse();
  }, [purchases]);

  // Filtered + sorted
  const filtered = useMemo(() => {
    let result = [...purchases];
    if (filterSport !== 'all') result = result.filter(p => p.sport === filterSport);
    if (filterPlatform !== 'all') result = result.filter(p => p.platform === filterPlatform);
    if (filterMonth !== 'all') result = result.filter(p => p.date.startsWith(filterMonth));
    if (sortBy === 'date') result.sort((a, b) => b.date.localeCompare(a.date));
    else if (sortBy === 'price') result.sort((a, b) => b.price - a.price);
    else if (sortBy === 'name') result.sort((a, b) => a.cardName.localeCompare(b.cardName));
    return result;
  }, [purchases, filterSport, filterPlatform, filterMonth, sortBy]);

  // Analytics
  const analytics = useMemo(() => {
    const total = purchases.reduce((sum, p) => sum + p.price, 0);
    const count = purchases.length;
    const avg = count > 0 ? total / count : 0;
    const max = count > 0 ? Math.max(...purchases.map(p => p.price)) : 0;
    const maxCard = purchases.find(p => p.price === max);

    // By sport
    const bySport: Record<string, { count: number; total: number }> = {};
    for (const p of purchases) {
      if (!bySport[p.sport]) bySport[p.sport] = { count: 0, total: 0 };
      bySport[p.sport].count++;
      bySport[p.sport].total += p.price;
    }

    // By platform
    const byPlatform: Record<string, { count: number; total: number }> = {};
    for (const p of purchases) {
      if (!byPlatform[p.platform]) byPlatform[p.platform] = { count: 0, total: 0 };
      byPlatform[p.platform].count++;
      byPlatform[p.platform].total += p.price;
    }

    // By month
    const byMonth: Record<string, { count: number; total: number }> = {};
    for (const p of purchases) {
      const month = p.date.slice(0, 7);
      if (!byMonth[month]) byMonth[month] = { count: 0, total: 0 };
      byMonth[month].count++;
      byMonth[month].total += p.price;
    }

    // By condition
    const byCondition: Record<string, { count: number; total: number }> = {};
    for (const p of purchases) {
      if (!byCondition[p.condition]) byCondition[p.condition] = { count: 0, total: 0 };
      byCondition[p.condition].count++;
      byCondition[p.condition].total += p.price;
    }

    // This month
    const thisMonth = new Date().toISOString().slice(0, 7);
    const thisMonthTotal = byMonth[thisMonth]?.total || 0;
    const thisMonthCount = byMonth[thisMonth]?.count || 0;

    return { total, count, avg, max, maxCard, bySport, byPlatform, byMonth, byCondition, thisMonthTotal, thisMonthCount };
  }, [purchases]);

  const handleExport = useCallback(() => {
    const header = 'Date,Card,Sport,Price,Platform,Condition,Notes';
    const rows = purchases.map(p => `${p.date},"${p.cardName}",${p.sport},${p.price},${p.platform},${p.condition},"${p.notes}"`);
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'cardvault-purchases.csv'; a.click();
    URL.revokeObjectURL(url);
  }, [purchases]);

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Spent', value: formatCurrency(analytics.total), color: 'text-white' },
          { label: 'Cards Bought', value: String(analytics.count), color: 'text-indigo-400' },
          { label: 'Avg Per Card', value: formatCurrency(analytics.avg), color: 'text-emerald-400' },
          { label: 'This Month', value: formatCurrency(analytics.thisMonthTotal), color: 'text-amber-400' },
        ].map(s => (
          <div key={s.label} className="bg-slate-800/60 border border-slate-700 rounded-lg p-3 text-center">
            <p className={`text-lg font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        {(['list', 'analytics'] as const).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
              view === v ? 'bg-indigo-600/30 border-indigo-500 text-indigo-400' : 'bg-slate-800/50 border-slate-700 text-slate-400'
            }`}
          >
            {v === 'list' ? '📋 Purchases' : '📊 Analytics'}
          </button>
        ))}
      </div>

      {view === 'list' && (
        <>
          {/* Add Purchase Button */}
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="w-full bg-indigo-600/20 border border-indigo-500/40 rounded-lg py-2.5 text-sm font-medium text-indigo-400 hover:bg-indigo-600/30 transition-colors"
          >
            {showAdd ? '− Close' : '+ Log Purchase'}
          </button>

          {/* Add Form */}
          {showAdd && (
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 space-y-3">
              <input type="text" value={newCard} onChange={e => setNewCard(e.target.value)} placeholder="Card name (e.g., 2024 Topps Chrome Soto RC)" className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <div className="grid grid-cols-2 gap-3">
                <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <input type="number" step="0.01" value={newPrice} onChange={e => setNewPrice(e.target.value)} placeholder="Price paid ($)" className="bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <select value={newSport} onChange={e => setNewSport(e.target.value)} className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {SPORTS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
                <select value={newPlatform} onChange={e => setNewPlatform(e.target.value)} className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <select value={newCondition} onChange={e => setNewCondition(e.target.value)} className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <input type="text" value={newNotes} onChange={e => setNewNotes(e.target.value)} placeholder="Notes (optional)" className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <button onClick={addPurchase} disabled={!newCard.trim() || !newPrice} className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-2.5 rounded-lg transition-colors">
                Log Purchase
              </button>
            </div>
          )}

          {/* Filters */}
          {purchases.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <select value={filterSport} onChange={e => setFilterSport(e.target.value)} className="bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none">
                <option value="all">All Sports</option>
                {SPORTS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
              <select value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)} className="bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none">
                <option value="all">All Platforms</option>
                {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none">
                <option value="all">All Months</option>
                {months.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <select value={sortBy} onChange={e => setSortBy(e.target.value as 'date' | 'price' | 'name')} className="bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none">
                <option value="date">Sort: Date</option>
                <option value="price">Sort: Price</option>
                <option value="name">Sort: Name</option>
              </select>
              <button onClick={handleExport} className="bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors">
                Export CSV
              </button>
            </div>
          )}

          {/* Purchase List */}
          {filtered.length === 0 && purchases.length === 0 && (
            <div className="bg-slate-800/40 border border-slate-700 border-dashed rounded-xl p-8 text-center">
              <p className="text-3xl mb-3">🧾</p>
              <p className="text-white font-bold mb-1">No Purchases Logged Yet</p>
              <p className="text-sm text-slate-400">Start logging your card purchases to track spending, see analytics, and identify patterns.</p>
            </div>
          )}

          <div className="space-y-2">
            {filtered.map(p => (
              <div key={p.id} className="bg-slate-800/60 border border-slate-700 rounded-lg p-3 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-medium text-white truncate">{p.cardName}</p>
                    <span className="text-sm font-bold text-emerald-400 shrink-0">{formatCurrency(p.price)}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                    <span>{p.date}</span>
                    <span>{p.platform}</span>
                    <span>{p.condition}</span>
                    <span>{p.sport}</span>
                    {p.notes && <span className="italic">{p.notes}</span>}
                  </div>
                </div>
                <button onClick={() => removePurchase(p.id)} className="text-slate-600 hover:text-red-400 text-xs transition-colors shrink-0" title="Remove">✕</button>
              </div>
            ))}
          </div>
        </>
      )}

      {view === 'analytics' && purchases.length > 0 && (
        <div className="space-y-6">
          {/* Top Purchase */}
          {analytics.maxCard && (
            <div className="bg-amber-900/20 border border-amber-800/40 rounded-xl p-4 text-center">
              <p className="text-xs text-amber-400 uppercase tracking-wider mb-1">Biggest Purchase</p>
              <p className="text-lg font-bold text-white">{analytics.maxCard.cardName}</p>
              <p className="text-2xl font-black text-amber-400">{formatCurrency(analytics.max)}</p>
              <p className="text-xs text-slate-500">{analytics.maxCard.date} via {analytics.maxCard.platform}</p>
            </div>
          )}

          {/* By Sport */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
            <h3 className="text-sm font-bold text-white mb-3">Spending by Sport</h3>
            <div className="space-y-2">
              {Object.entries(analytics.bySport)
                .sort(([,a], [,b]) => b.total - a.total)
                .map(([sport, data]) => (
                  <div key={sport} className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 w-20 capitalize">{sport}</span>
                    <div className="flex-1 bg-slate-700/50 rounded-full h-4 overflow-hidden">
                      <div className="bg-indigo-500/60 h-full rounded-full" style={{ width: `${(data.total / analytics.total) * 100}%` }} />
                    </div>
                    <span className="text-xs text-white font-medium w-16 text-right">{formatCurrency(data.total)}</span>
                    <span className="text-xs text-slate-500 w-8 text-right">{data.count}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* By Platform */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
            <h3 className="text-sm font-bold text-white mb-3">Spending by Platform</h3>
            <div className="space-y-2">
              {Object.entries(analytics.byPlatform)
                .sort(([,a], [,b]) => b.total - a.total)
                .map(([platform, data]) => (
                  <div key={platform} className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 w-20">{platform}</span>
                    <div className="flex-1 bg-slate-700/50 rounded-full h-4 overflow-hidden">
                      <div className="bg-emerald-500/60 h-full rounded-full" style={{ width: `${(data.total / analytics.total) * 100}%` }} />
                    </div>
                    <span className="text-xs text-white font-medium w-16 text-right">{formatCurrency(data.total)}</span>
                    <span className="text-xs text-slate-500 w-8 text-right">{data.count}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* By Month */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
            <h3 className="text-sm font-bold text-white mb-3">Monthly Spending</h3>
            <div className="space-y-2">
              {Object.entries(analytics.byMonth)
                .sort(([a], [b]) => b.localeCompare(a))
                .slice(0, 12)
                .map(([month, data]) => {
                  const maxMonthTotal = Math.max(...Object.values(analytics.byMonth).map(m => m.total));
                  return (
                    <div key={month} className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 w-20">{month}</span>
                      <div className="flex-1 bg-slate-700/50 rounded-full h-4 overflow-hidden">
                        <div className="bg-amber-500/60 h-full rounded-full" style={{ width: `${(data.total / maxMonthTotal) * 100}%` }} />
                      </div>
                      <span className="text-xs text-white font-medium w-16 text-right">{formatCurrency(data.total)}</span>
                      <span className="text-xs text-slate-500 w-8 text-right">{data.count}</span>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* By Condition */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
            <h3 className="text-sm font-bold text-white mb-3">Spending by Condition</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(analytics.byCondition)
                .sort(([,a], [,b]) => b.total - a.total)
                .map(([condition, data]) => (
                  <div key={condition} className="bg-slate-700/30 border border-slate-700 rounded-lg p-3 text-center">
                    <p className="text-xs text-slate-500">{condition}</p>
                    <p className="text-sm font-bold text-white">{formatCurrency(data.total)}</p>
                    <p className="text-xs text-slate-500">{data.count} cards</p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {view === 'analytics' && purchases.length === 0 && (
        <div className="bg-slate-800/40 border border-slate-700 border-dashed rounded-xl p-8 text-center">
          <p className="text-3xl mb-3">📊</p>
          <p className="text-white font-bold mb-1">No Data Yet</p>
          <p className="text-sm text-slate-400">Log some purchases to see spending analytics.</p>
        </div>
      )}

      {/* Tips */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Purchase Tracking Tips</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { title: 'Log Everything', tip: 'Even small purchases add up. Tracking $5 pickups helps you see where your money actually goes. Most collectors underestimate spending by 30-50%.', icon: '📝' },
            { title: 'Review Monthly', tip: 'Check your analytics tab at the end of each month. Are you overspending on one sport? One platform? Monthly reviews prevent budget creep.', icon: '📅' },
            { title: 'Export for Taxes', tip: 'If you sell cards, your purchase log is your cost basis documentation. The CSV export creates a tax-ready record of acquisition costs.', icon: '📊' },
            { title: 'Track Platform Costs', tip: 'eBay has fees, card shows have travel costs. Your per-platform spending reveals true costs. Factor in shipping and platform fees for accurate P&L.', icon: '💳' },
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
