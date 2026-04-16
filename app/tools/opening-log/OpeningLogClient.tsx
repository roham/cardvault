'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';

/* ─── Types ──────────────────────────────────────────────── */
interface Pull {
  name: string;
  value: string;
}

interface Opening {
  id: string;
  date: string;
  product: string;
  cost: string;
  pulls: Pull[];
  notes: string;
}

const POPULAR_PRODUCTS = [
  '2024 Topps Chrome Hobby Box',
  '2024 Topps Chrome Blaster',
  '2024 Panini Prizm Football Hobby',
  '2024 Panini Prizm Football Blaster',
  '2024-25 Panini Prizm Basketball Hobby',
  '2024-25 Panini Prizm Basketball Blaster',
  '2024-25 Upper Deck Hockey Hobby',
  '2025 Topps Series 1 Hobby Box',
  '2025 Topps Series 1 Blaster',
  'Pokemon Prismatic Evolutions ETB',
  'Pokemon Prismatic Evolutions Booster Bundle',
  'Pokemon Scarlet & Violet 151 ETB',
  'Pokemon Surging Sparks Booster Box',
  'Pokemon Journey Together ETB',
];

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export default function OpeningLogClient() {
  const [openings, setOpenings] = useState<Opening[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  /* Form state */
  const [fProduct, setFProduct] = useState('');
  const [fCost, setFCost] = useState('');
  const [fPulls, setFPulls] = useState<Pull[]>([{ name: '', value: '' }]);
  const [fNotes, setFNotes] = useState('');
  const [fDate, setFDate] = useState(() => new Date().toISOString().slice(0, 10));

  /* Load from localStorage */
  useEffect(() => {
    const saved = localStorage.getItem('cv-opening-log');
    if (saved) {
      try { setOpenings(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cv-opening-log', JSON.stringify(openings));
  }, [openings]);

  const addPullRow = useCallback(() => {
    setFPulls(prev => [...prev, { name: '', value: '' }]);
  }, []);

  const updatePull = useCallback((idx: number, field: 'name' | 'value', val: string) => {
    setFPulls(prev => prev.map((p, i) => i === idx ? { ...p, [field]: val } : p));
  }, []);

  const removePull = useCallback((idx: number) => {
    setFPulls(prev => prev.filter((_, i) => i !== idx));
  }, []);

  const resetForm = useCallback(() => {
    setFProduct(''); setFCost(''); setFPulls([{ name: '', value: '' }]);
    setFNotes(''); setFDate(new Date().toISOString().slice(0, 10));
    setEditId(null); setShowForm(false);
  }, []);

  const saveOpening = useCallback(() => {
    if (!fProduct.trim() || !fCost.trim()) return;
    const pulls = fPulls.filter(p => p.name.trim());
    const entry: Opening = {
      id: editId || genId(),
      date: fDate,
      product: fProduct.trim(),
      cost: fCost.trim(),
      pulls,
      notes: fNotes.trim(),
    };
    if (editId) {
      setOpenings(prev => prev.map(o => o.id === editId ? entry : o));
    } else {
      setOpenings(prev => [entry, ...prev]);
    }
    resetForm();
  }, [fProduct, fCost, fPulls, fNotes, fDate, editId, resetForm]);

  const editOpening = useCallback((o: Opening) => {
    setFProduct(o.product); setFCost(o.cost);
    setFPulls(o.pulls.length ? o.pulls : [{ name: '', value: '' }]);
    setFNotes(o.notes); setFDate(o.date); setEditId(o.id); setShowForm(true);
  }, []);

  const deleteOpening = useCallback((id: string) => {
    setOpenings(prev => prev.filter(o => o.id !== id));
  }, []);

  /* Analytics */
  const analytics = useMemo(() => {
    const totalCost = openings.reduce((s, o) => s + (parseFloat(o.cost) || 0), 0);
    const totalValue = openings.reduce((s, o) =>
      s + o.pulls.reduce((ps, p) => ps + (parseFloat(p.value) || 0), 0), 0);
    const totalPulls = openings.reduce((s, o) => s + o.pulls.filter(p => p.name.trim()).length, 0);
    const ratio = totalCost > 0 ? (totalValue / totalCost) * 100 : 0;
    const net = totalValue - totalCost;

    let luck: string;
    let luckColor: string;
    if (ratio >= 150) { luck = 'On Fire'; luckColor = 'text-yellow-400'; }
    else if (ratio >= 120) { luck = 'Running Hot'; luckColor = 'text-green-400'; }
    else if (ratio >= 80) { luck = 'Normal'; luckColor = 'text-blue-400'; }
    else if (ratio >= 50) { luck = 'Running Cold'; luckColor = 'text-orange-400'; }
    else if (openings.length > 0) { luck = 'Ice Cold'; luckColor = 'text-red-400'; }
    else { luck = '—'; luckColor = 'text-slate-500'; }

    return { totalCost, totalValue, totalPulls, ratio, net, luck, luckColor, count: openings.length };
  }, [openings]);

  /* CSV Export */
  const exportCsv = useCallback(() => {
    const rows = [['Date', 'Product', 'Cost', 'Pull', 'Pull Value', 'Notes']];
    openings.forEach(o => {
      if (o.pulls.length === 0) {
        rows.push([o.date, o.product, o.cost, '', '', o.notes]);
      } else {
        o.pulls.forEach((p, i) => {
          rows.push([i === 0 ? o.date : '', i === 0 ? o.product : '', i === 0 ? o.cost : '', p.name, p.value, i === 0 ? o.notes : '']);
        });
      }
    });
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'cardvault-opening-log.csv'; a.click();
    URL.revokeObjectURL(url);
  }, [openings]);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-white">{analytics.count}</div>
            <div className="text-xs text-slate-500">Openings</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-400">${analytics.totalCost.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
            <div className="text-xs text-slate-500">Total Spent</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">${analytics.totalValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
            <div className="text-xs text-slate-500">Total Pulled</div>
          </div>
          <div>
            <div className={`text-2xl font-bold ${analytics.luckColor}`}>{analytics.luck}</div>
            <div className="text-xs text-slate-500">{analytics.ratio > 0 ? `${Math.round(analytics.ratio)}% return` : 'Luck Rating'}</div>
          </div>
        </div>
        {analytics.count > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center justify-between text-sm">
            <span className="text-slate-400">Net: <span className={analytics.net >= 0 ? 'text-green-400' : 'text-red-400'}>{analytics.net >= 0 ? '+' : ''}${analytics.net.toFixed(0)}</span></span>
            <span className="text-slate-500">{analytics.totalPulls} notable pulls logged</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white text-sm font-medium rounded-lg transition-colors">
          + Log Opening
        </button>
        {openings.length > 0 && (
          <button onClick={exportCsv}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded-lg transition-colors">
            Export CSV
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-slate-800/40 border border-pink-800/30 rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-semibold text-white">{editId ? 'Edit Opening' : 'Log New Opening'}</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 block mb-1">Product *</label>
              <input value={fProduct} onChange={e => setFProduct(e.target.value)} placeholder="What did you open?"
                list="products-list"
                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:border-pink-600/50 focus:outline-none" />
              <datalist id="products-list">
                {POPULAR_PRODUCTS.map(p => <option key={p} value={p} />)}
              </datalist>
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-slate-500 block mb-1">Cost ($) *</label>
                <input value={fCost} onChange={e => setFCost(e.target.value)} placeholder="0.00" type="number" step="0.01"
                  className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:border-pink-600/50 focus:outline-none" />
              </div>
              <div className="flex-1">
                <label className="text-xs text-slate-500 block mb-1">Date</label>
                <input value={fDate} onChange={e => setFDate(e.target.value)} type="date"
                  className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-white text-sm focus:border-pink-600/50 focus:outline-none" />
              </div>
            </div>
          </div>

          {/* Pulls */}
          <div>
            <label className="text-xs text-slate-500 block mb-1">Notable Pulls</label>
            <div className="space-y-2">
              {fPulls.map((p, i) => (
                <div key={i} className="flex gap-2">
                  <input value={p.name} onChange={e => updatePull(i, 'name', e.target.value)} placeholder="Card name"
                    className="flex-1 bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:border-pink-600/50 focus:outline-none" />
                  <input value={p.value} onChange={e => updatePull(i, 'value', e.target.value)} placeholder="$ value" type="number" step="0.01"
                    className="w-24 bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:border-pink-600/50 focus:outline-none" />
                  {fPulls.length > 1 && (
                    <button onClick={() => removePull(i)} className="text-slate-600 hover:text-red-400 text-sm px-1">&#10005;</button>
                  )}
                </div>
              ))}
              <button onClick={addPullRow} className="text-xs text-pink-400 hover:text-pink-300">+ Add pull</button>
            </div>
          </div>

          <input value={fNotes} onChange={e => setFNotes(e.target.value)} placeholder="Notes (optional)"
            className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:border-pink-600/50 focus:outline-none" />

          <div className="flex gap-2">
            <button onClick={saveOpening} disabled={!fProduct.trim() || !fCost.trim()}
              className="px-4 py-2 bg-pink-600 hover:bg-pink-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-medium rounded-lg transition-colors">
              {editId ? 'Update' : 'Save Opening'}
            </button>
            <button onClick={resetForm}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded-lg transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Opening List */}
      {openings.length === 0 && !showForm && (
        <div className="text-center py-12 bg-slate-800/20 border border-slate-700/30 rounded-xl">
          <div className="text-4xl mb-3">📦</div>
          <p className="text-slate-400">No openings logged yet</p>
          <p className="text-slate-500 text-sm mt-1">Click &ldquo;Log Opening&rdquo; to track your first pack or box</p>
        </div>
      )}

      <div className="space-y-3">
        {openings.map(o => {
          const pullTotal = o.pulls.reduce((s, p) => s + (parseFloat(p.value) || 0), 0);
          const cost = parseFloat(o.cost) || 0;
          const net = pullTotal - cost;
          return (
            <div key={o.id} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold text-sm">{o.product}</span>
                    <span className="text-slate-500 text-xs">{o.date}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs">
                    <span className="text-red-400">Cost: ${cost.toFixed(2)}</span>
                    <span className="text-green-400">Pulled: ${pullTotal.toFixed(2)}</span>
                    <span className={net >= 0 ? 'text-green-400 font-semibold' : 'text-red-400 font-semibold'}>
                      {net >= 0 ? '+' : ''}{net.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => editOpening(o)} className="text-slate-500 hover:text-white text-xs px-1.5 py-0.5 rounded hover:bg-slate-700/50 transition-colors">Edit</button>
                  <button onClick={() => deleteOpening(o.id)} className="text-slate-500 hover:text-red-400 text-xs px-1.5 py-0.5 rounded hover:bg-slate-700/50 transition-colors">Del</button>
                </div>
              </div>
              {o.pulls.length > 0 && (
                <div className="mt-2 space-y-1">
                  {o.pulls.map((p, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="text-slate-500">&bull;</span>
                      <span className="text-slate-300">{p.name}</span>
                      {p.value && <span className="text-emerald-400 ml-auto">${parseFloat(p.value).toFixed(2)}</span>}
                    </div>
                  ))}
                </div>
              )}
              {o.notes && <p className="text-slate-500 text-xs mt-2 italic">{o.notes}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
