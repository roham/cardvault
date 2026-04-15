'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';

// ── Types ──────────────────────────────────────────────────────
interface Flip {
  id: string;
  cardName: string;
  sport: string;
  buyPrice: number;
  buyDate: string;
  buySource: string;
  sellPrice: number;
  sellDate: string;
  sellPlatform: string;
  fees: number;
  shippingCost: number;
  gradingCost: number;
  notes: string;
  status: 'sold' | 'listed' | 'holding';
}

type SortField = 'sellDate' | 'profit' | 'roi' | 'buyPrice' | 'sellPrice';
type TimeFilter = 'all' | '7d' | '30d' | '90d' | 'ytd';

const PLATFORMS = ['eBay', 'Mercari', 'COMC', 'MySlabs', 'Card Show', 'Facebook', 'Instagram', 'Direct Sale', 'Other'];
const BUY_SOURCES = ['eBay', 'Card Show', 'LCS', 'Facebook', 'Mercari', 'COMC', 'Break', 'Pack Pull', 'Trade', 'Other'];
const SPORTS = ['Baseball', 'Basketball', 'Football', 'Hockey', 'Pokemon', 'Other'];

const PLATFORM_FEES: Record<string, number> = {
  'eBay': 0.1313,
  'Mercari': 0.10,
  'COMC': 0.05,
  'MySlabs': 0.08,
  'Card Show': 0,
  'Facebook': 0,
  'Instagram': 0,
  'Direct Sale': 0,
  'Other': 0,
};

function generateId(): string {
  return `flip-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function calcProfit(flip: Flip): number {
  if (flip.status !== 'sold') return 0;
  return flip.sellPrice - flip.buyPrice - flip.fees - flip.shippingCost - flip.gradingCost;
}

function calcROI(flip: Flip): number {
  const totalCost = flip.buyPrice + flip.gradingCost;
  if (totalCost === 0) return 0;
  return (calcProfit(flip) / totalCost) * 100;
}

function daysHeld(flip: Flip): number {
  const buy = new Date(flip.buyDate).getTime();
  const sell = flip.status === 'sold' ? new Date(flip.sellDate).getTime() : Date.now();
  return Math.max(1, Math.round((sell - buy) / (1000 * 60 * 60 * 24)));
}

// ── Main Component ────────────────────────────────────────────
export default function FlipTrackerClient() {
  const [flips, setFlips] = useState<Flip[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('sellDate');
  const [sortAsc, setSortAsc] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [sportFilter, setSportFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'sold' | 'listed' | 'holding'>('all');

  // Form state
  const [form, setForm] = useState<Omit<Flip, 'id'>>({
    cardName: '', sport: 'Baseball', buyPrice: 0, buyDate: new Date().toISOString().slice(0, 10),
    buySource: 'eBay', sellPrice: 0, sellDate: new Date().toISOString().slice(0, 10),
    sellPlatform: 'eBay', fees: 0, shippingCost: 0, gradingCost: 0, notes: '', status: 'sold',
  });

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cardvault-flip-tracker');
      if (saved) setFlips(JSON.parse(saved));
    } catch {}
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (flips.length > 0) localStorage.setItem('cardvault-flip-tracker', JSON.stringify(flips));
  }, [flips]);

  // Auto-calculate fees when sell platform/price changes
  useEffect(() => {
    if (form.status === 'sold' && form.sellPrice > 0) {
      const feeRate = PLATFORM_FEES[form.sellPlatform] || 0;
      setForm(prev => ({ ...prev, fees: Math.round(prev.sellPrice * feeRate * 100) / 100 }));
    }
  }, [form.sellPlatform, form.sellPrice, form.status]);

  const resetForm = useCallback(() => {
    setForm({
      cardName: '', sport: 'Baseball', buyPrice: 0, buyDate: new Date().toISOString().slice(0, 10),
      buySource: 'eBay', sellPrice: 0, sellDate: new Date().toISOString().slice(0, 10),
      sellPlatform: 'eBay', fees: 0, shippingCost: 0, gradingCost: 0, notes: '', status: 'sold',
    });
    setEditId(null);
    setShowForm(false);
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!form.cardName.trim()) return;
    if (editId) {
      setFlips(prev => prev.map(f => f.id === editId ? { ...form, id: editId } : f));
    } else {
      setFlips(prev => [{ ...form, id: generateId() }, ...prev]);
    }
    resetForm();
  }, [form, editId, resetForm]);

  const handleEdit = useCallback((flip: Flip) => {
    const { id, ...rest } = flip;
    setForm(rest);
    setEditId(id);
    setShowForm(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setFlips(prev => prev.filter(f => f.id !== id));
  }, []);

  // Filtered & sorted flips
  const filteredFlips = useMemo(() => {
    let result = [...flips];

    // Time filter
    if (timeFilter !== 'all') {
      const now = Date.now();
      const cutoff = timeFilter === '7d' ? now - 7 * 86400000
        : timeFilter === '30d' ? now - 30 * 86400000
        : timeFilter === '90d' ? now - 90 * 86400000
        : new Date(new Date().getFullYear(), 0, 1).getTime(); // ytd
      result = result.filter(f => new Date(f.status === 'sold' ? f.sellDate : f.buyDate).getTime() >= cutoff);
    }

    // Sport filter
    if (sportFilter !== 'all') result = result.filter(f => f.sport === sportFilter);

    // Status filter
    if (statusFilter !== 'all') result = result.filter(f => f.status === statusFilter);

    // Sort
    result.sort((a, b) => {
      let aVal: number, bVal: number;
      switch (sortField) {
        case 'profit': aVal = calcProfit(a); bVal = calcProfit(b); break;
        case 'roi': aVal = calcROI(a); bVal = calcROI(b); break;
        case 'buyPrice': aVal = a.buyPrice; bVal = b.buyPrice; break;
        case 'sellPrice': aVal = a.sellPrice; bVal = b.sellPrice; break;
        default: aVal = new Date(a.sellDate).getTime(); bVal = new Date(b.sellDate).getTime();
      }
      return sortAsc ? aVal - bVal : bVal - aVal;
    });

    return result;
  }, [flips, timeFilter, sportFilter, statusFilter, sortField, sortAsc]);

  // Stats
  const stats = useMemo(() => {
    const sold = filteredFlips.filter(f => f.status === 'sold');
    const totalRevenue = sold.reduce((s, f) => s + f.sellPrice, 0);
    const totalCost = sold.reduce((s, f) => s + f.buyPrice + f.gradingCost, 0);
    const totalFees = sold.reduce((s, f) => s + f.fees + f.shippingCost, 0);
    const totalProfit = sold.reduce((s, f) => s + calcProfit(f), 0);
    const wins = sold.filter(f => calcProfit(f) > 0).length;
    const losses = sold.filter(f => calcProfit(f) < 0).length;
    const avgROI = sold.length > 0 ? sold.reduce((s, f) => s + calcROI(f), 0) / sold.length : 0;
    const avgDays = sold.length > 0 ? sold.reduce((s, f) => s + daysHeld(f), 0) / sold.length : 0;
    const bestFlip = sold.length > 0 ? sold.reduce((best, f) => calcProfit(f) > calcProfit(best) ? f : best, sold[0]) : null;
    const worstFlip = sold.length > 0 ? sold.reduce((worst, f) => calcProfit(f) < calcProfit(worst) ? f : worst, sold[0]) : null;
    const holdingValue = flips.filter(f => f.status === 'holding').reduce((s, f) => s + f.buyPrice, 0);
    const listedValue = flips.filter(f => f.status === 'listed').reduce((s, f) => s + f.sellPrice, 0);

    return { totalRevenue, totalCost, totalFees, totalProfit, wins, losses, avgROI, avgDays, bestFlip, worstFlip, holdingValue, listedValue, soldCount: sold.length };
  }, [filteredFlips, flips]);

  // ── Render ────────────────────────────────────────────────────
  return (
    <div>
      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
          <p className="text-[10px] uppercase text-gray-500 font-medium">Total Profit</p>
          <p className={`text-2xl font-bold ${stats.totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {stats.totalProfit >= 0 ? '+' : ''}{stats.totalProfit < 0 ? '-' : ''}${Math.abs(stats.totalProfit).toFixed(2)}
          </p>
          <p className="text-[10px] text-gray-500">{stats.soldCount} flips completed</p>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
          <p className="text-[10px] uppercase text-gray-500 font-medium">Win Rate</p>
          <p className="text-2xl font-bold text-white">
            {stats.soldCount > 0 ? ((stats.wins / stats.soldCount) * 100).toFixed(0) : 0}%
          </p>
          <p className="text-[10px] text-gray-500">
            <span className="text-emerald-400">{stats.wins}W</span> / <span className="text-red-400">{stats.losses}L</span>
          </p>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
          <p className="text-[10px] uppercase text-gray-500 font-medium">Avg ROI</p>
          <p className={`text-2xl font-bold ${stats.avgROI >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {stats.avgROI >= 0 ? '+' : ''}{stats.avgROI.toFixed(1)}%
          </p>
          <p className="text-[10px] text-gray-500">Avg hold: {Math.round(stats.avgDays)} days</p>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
          <p className="text-[10px] uppercase text-gray-500 font-medium">Pipeline</p>
          <p className="text-2xl font-bold text-white">${(stats.holdingValue + stats.listedValue).toFixed(0)}</p>
          <p className="text-[10px] text-gray-500">
            Holding: ${stats.holdingValue.toFixed(0)} · Listed: ${stats.listedValue.toFixed(0)}
          </p>
        </div>
      </div>

      {/* Best/Worst Flips */}
      {stats.bestFlip && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase text-emerald-500 font-medium">Best Flip</p>
              <p className="text-white text-sm font-medium truncate">{stats.bestFlip.cardName}</p>
            </div>
            <span className="text-emerald-400 font-bold text-sm">+${calcProfit(stats.bestFlip).toFixed(2)}</span>
          </div>
          {stats.worstFlip && (
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase text-red-500 font-medium">Worst Flip</p>
                <p className="text-white text-sm font-medium truncate">{stats.worstFlip.cardName}</p>
              </div>
              <span className="text-red-400 font-bold text-sm">{calcProfit(stats.worstFlip) >= 0 ? '+' : '-'}${Math.abs(calcProfit(stats.worstFlip)).toFixed(2)}</span>
            </div>
          )}
        </div>
      )}

      {/* Filters + Add Button */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Log Flip
        </button>
        <select
          value={timeFilter}
          onChange={e => setTimeFilter(e.target.value as TimeFilter)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
        >
          <option value="all">All Time</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
          <option value="ytd">Year to Date</option>
        </select>
        <select
          value={sportFilter}
          onChange={e => setSportFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
        >
          <option value="all">All Sports</option>
          {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
        >
          <option value="all">All Status</option>
          <option value="sold">Sold</option>
          <option value="listed">Listed</option>
          <option value="holding">Holding</option>
        </select>
        <div className="ml-auto text-gray-500 text-xs hidden sm:block">
          {filteredFlips.length} flip{filteredFlips.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-gray-900/80 border border-gray-700 rounded-2xl p-5 mb-6">
          <h3 className="text-white font-bold text-sm mb-4">{editId ? 'Edit Flip' : 'Log a Flip'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-xs mb-1">Card Name *</label>
                <input
                  type="text"
                  value={form.cardName}
                  onChange={e => setForm(prev => ({ ...prev, cardName: e.target.value }))}
                  placeholder="e.g. 2024 Topps Chrome Elly De La Cruz RC #150"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1">Sport</label>
                <select
                  value={form.sport}
                  onChange={e => setForm(prev => ({ ...prev, sport: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
                >
                  {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-400 text-xs mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm(prev => ({ ...prev, status: e.target.value as Flip['status'] }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
                >
                  <option value="sold">Sold</option>
                  <option value="listed">Listed</option>
                  <option value="holding">Holding</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1">Buy Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.buyPrice || ''}
                  onChange={e => setForm(prev => ({ ...prev, buyPrice: parseFloat(e.target.value) || 0 }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1">Buy Date</label>
                <input
                  type="date"
                  value={form.buyDate}
                  onChange={e => setForm(prev => ({ ...prev, buyDate: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-400 text-xs mb-1">Buy Source</label>
                <select
                  value={form.buySource}
                  onChange={e => setForm(prev => ({ ...prev, buySource: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
                >
                  {BUY_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {form.status === 'sold' && (
                <>
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Sell Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.sellPrice || ''}
                      onChange={e => setForm(prev => ({ ...prev, sellPrice: parseFloat(e.target.value) || 0 }))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Sell Date</label>
                    <input
                      type="date"
                      value={form.sellDate}
                      onChange={e => setForm(prev => ({ ...prev, sellDate: e.target.value }))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
                    />
                  </div>
                </>
              )}
              {form.status === 'listed' && (
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Listed Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.sellPrice || ''}
                    onChange={e => setForm(prev => ({ ...prev, sellPrice: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-gray-400 text-xs mb-1">Sell Platform</label>
                <select
                  value={form.sellPlatform}
                  onChange={e => setForm(prev => ({ ...prev, sellPlatform: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
                >
                  {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1">Fees ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.fees || ''}
                  onChange={e => setForm(prev => ({ ...prev, fees: parseFloat(e.target.value) || 0 }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1">Shipping ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.shippingCost || ''}
                  onChange={e => setForm(prev => ({ ...prev, shippingCost: parseFloat(e.target.value) || 0 }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1">Grading ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.gradingCost || ''}
                  onChange={e => setForm(prev => ({ ...prev, gradingCost: parseFloat(e.target.value) || 0 }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-xs mb-1">Notes</label>
              <input
                type="text"
                value={form.notes}
                onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any notes about this flip..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50"
              />
            </div>

            <div className="flex gap-3">
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
                {editId ? 'Update Flip' : 'Log Flip'}
              </button>
              <button type="button" onClick={resetForm} className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-5 py-2 rounded-lg text-sm font-medium transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Flip Table */}
      {filteredFlips.length === 0 ? (
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-8 text-center">
          <span className="text-4xl block mb-3">💸</span>
          <h3 className="text-white font-bold text-lg mb-2">No flips logged yet</h3>
          <p className="text-gray-400 text-sm mb-4">Start tracking your card flips to see your P&L, win rate, and ROI over time.</p>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Log Your First Flip
          </button>
        </div>
      ) : (
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden">
          {/* Sort Header */}
          <div className="hidden sm:grid sm:grid-cols-8 gap-2 px-4 py-2.5 border-b border-gray-800 text-[10px] uppercase text-gray-500 font-medium">
            <div className="col-span-2">Card</div>
            <button onClick={() => { setSortField('buyPrice'); setSortAsc(prev => sortField === 'buyPrice' ? !prev : false); }} className="text-left hover:text-gray-300">
              Buy {sortField === 'buyPrice' ? (sortAsc ? '↑' : '↓') : ''}
            </button>
            <button onClick={() => { setSortField('sellPrice'); setSortAsc(prev => sortField === 'sellPrice' ? !prev : false); }} className="text-left hover:text-gray-300">
              Sell {sortField === 'sellPrice' ? (sortAsc ? '↑' : '↓') : ''}
            </button>
            <button onClick={() => { setSortField('profit'); setSortAsc(prev => sortField === 'profit' ? !prev : false); }} className="text-left hover:text-gray-300">
              Profit {sortField === 'profit' ? (sortAsc ? '↑' : '↓') : ''}
            </button>
            <button onClick={() => { setSortField('roi'); setSortAsc(prev => sortField === 'roi' ? !prev : false); }} className="text-left hover:text-gray-300">
              ROI {sortField === 'roi' ? (sortAsc ? '↑' : '↓') : ''}
            </button>
            <div>Days</div>
            <div>Actions</div>
          </div>

          {/* Flip Rows */}
          {filteredFlips.map(flip => {
            const profit = calcProfit(flip);
            const roi = calcROI(flip);
            const days = daysHeld(flip);
            return (
              <div key={flip.id} className="grid grid-cols-2 sm:grid-cols-8 gap-2 px-4 py-3 border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors items-center">
                <div className="col-span-2">
                  <p className="text-white text-sm font-medium truncate">{flip.cardName}</p>
                  <div className="flex items-center gap-2 text-[10px] text-gray-500">
                    <span>{flip.sport}</span>
                    <span>·</span>
                    <span>{flip.buySource} → {flip.sellPlatform}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      flip.status === 'sold' ? 'bg-emerald-500/10 text-emerald-400' :
                      flip.status === 'listed' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-blue-500/10 text-blue-400'
                    }`}>
                      {flip.status.toUpperCase()}
                    </span>
                  </div>
                  {flip.notes && <p className="text-[10px] text-gray-600 mt-0.5 truncate">{flip.notes}</p>}
                </div>
                <div>
                  <span className="text-gray-300 text-sm">${flip.buyPrice.toFixed(2)}</span>
                  <span className="text-[10px] text-gray-600 block sm:hidden">Buy</span>
                </div>
                <div>
                  <span className="text-gray-300 text-sm">
                    {flip.status === 'sold' ? `$${flip.sellPrice.toFixed(2)}` : flip.status === 'listed' ? `$${flip.sellPrice.toFixed(2)}` : '—'}
                  </span>
                  <span className="text-[10px] text-gray-600 block sm:hidden">Sell</span>
                </div>
                <div>
                  {flip.status === 'sold' ? (
                    <span className={`text-sm font-medium ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {profit >= 0 ? '+' : '-'}${Math.abs(profit).toFixed(2)}
                    </span>
                  ) : <span className="text-gray-600 text-sm">—</span>}
                </div>
                <div>
                  {flip.status === 'sold' ? (
                    <span className={`text-sm ${roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
                    </span>
                  ) : <span className="text-gray-600 text-sm">—</span>}
                </div>
                <div className="text-gray-400 text-sm">{days}d</div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => handleEdit(flip)} className="text-gray-500 hover:text-white text-xs transition-colors">Edit</button>
                  <button onClick={() => handleDelete(flip.id)} className="text-gray-500 hover:text-red-400 text-xs transition-colors">Del</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Export */}
      {flips.length > 0 && (
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={() => {
              const csv = ['Card,Sport,Status,Buy Price,Buy Date,Buy Source,Sell Price,Sell Date,Sell Platform,Fees,Shipping,Grading,Profit,ROI,Notes'];
              flips.forEach(f => {
                csv.push(`"${f.cardName}",${f.sport},${f.status},${f.buyPrice},${f.buyDate},${f.buySource},${f.sellPrice},${f.sellDate},${f.sellPlatform},${f.fees},${f.shippingCost},${f.gradingCost},${calcProfit(f).toFixed(2)},${calcROI(f).toFixed(1)}%,"${f.notes}"`);
              });
              const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url; a.download = `cardvault-flips-${new Date().toISOString().slice(0, 10)}.csv`;
              a.click(); URL.revokeObjectURL(url);
            }}
            className="text-gray-400 hover:text-white text-xs transition-colors"
          >
            Export CSV
          </button>
          <button
            onClick={() => { if (confirm('Clear all flip data? This cannot be undone.')) { setFlips([]); localStorage.removeItem('cardvault-flip-tracker'); } }}
            className="text-gray-600 hover:text-red-400 text-xs transition-colors"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Related Tools */}
      <div className="mt-8 bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Related Tools</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link href="/tools/flip-calc" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">💸</span>
            <div>
              <div className="text-white text-sm font-medium">Flip Calculator</div>
              <div className="text-gray-500 text-xs">Calculate profit on a single flip</div>
            </div>
          </Link>
          <Link href="/tools/tax-calc" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">🧾</span>
            <div>
              <div className="text-white text-sm font-medium">Tax Calculator</div>
              <div className="text-gray-500 text-xs">Estimate taxes on card sales</div>
            </div>
          </Link>
          <Link href="/tools/grading-roi" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">💰</span>
            <div>
              <div className="text-white text-sm font-medium">Grading ROI</div>
              <div className="text-gray-500 text-xs">Is grading worth it?</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
