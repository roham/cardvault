'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';

/* ── types ───────────────────────────────────────────────────────── */

interface PulledCard {
  id: string;
  name: string;
  value: number;
}

interface BreakEntry {
  id: string;
  date: string;
  product: string;
  team: string;
  spotCost: number;
  cards: PulledCard[];
  notes: string;
}

const STORAGE_KEY = 'cardvault-break-roi';

function generateId(): string {
  return `brk-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/* ── component ──────────────────────────────────────────────────── */

export default function BreakRoiClient() {
  const [breaks, setBreaks] = useState<BreakEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form state
  const [formDate, setFormDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [formProduct, setFormProduct] = useState('');
  const [formTeam, setFormTeam] = useState('');
  const [formSpotCost, setFormSpotCost] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formCards, setFormCards] = useState<PulledCard[]>([]);

  // Card sub-form
  const [cardName, setCardName] = useState('');
  const [cardValue, setCardValue] = useState('');

  /* ── localStorage ──────────────────────────────────────────────── */

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setBreaks(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    if (breaks.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(breaks));
    }
  }, [breaks]);

  /* ── stats ─────────────────────────────────────────────────────── */

  const stats = useMemo(() => {
    if (breaks.length === 0) return null;

    let totalSpent = 0;
    let totalPullValue = 0;
    let bestRoi = -Infinity;
    let worstRoi = Infinity;
    let bestBreak: BreakEntry | null = null;
    let worstBreak: BreakEntry | null = null;
    const rois: number[] = [];

    for (const b of breaks) {
      const pullVal = b.cards.reduce((s, c) => s + c.value, 0);
      totalSpent += b.spotCost;
      totalPullValue += pullVal;
      const roi = b.spotCost > 0 ? ((pullVal - b.spotCost) / b.spotCost) * 100 : 0;
      rois.push(roi);
      if (roi > bestRoi) { bestRoi = roi; bestBreak = b; }
      if (roi < worstRoi) { worstRoi = roi; worstBreak = b; }
    }

    const netPL = totalPullValue - totalSpent;
    const overallRoi = totalSpent > 0 ? (netPL / totalSpent) * 100 : 0;
    const avgRoi = rois.length > 0 ? rois.reduce((a, b) => a + b, 0) / rois.length : 0;

    return {
      totalBreaks: breaks.length,
      totalSpent,
      totalPullValue,
      netPL,
      overallRoi,
      avgRoi,
      bestBreak,
      bestRoi: bestRoi === -Infinity ? 0 : bestRoi,
      worstBreak,
      worstRoi: worstRoi === Infinity ? 0 : worstRoi,
    };
  }, [breaks]);

  /* ── handlers ──────────────────────────────────────────────────── */

  const resetForm = useCallback(() => {
    setFormDate(new Date().toISOString().slice(0, 10));
    setFormProduct('');
    setFormTeam('');
    setFormSpotCost('');
    setFormNotes('');
    setFormCards([]);
    setCardName('');
    setCardValue('');
    setShowForm(false);
  }, []);

  const addCard = useCallback(() => {
    if (!cardName.trim()) return;
    const val = parseFloat(cardValue) || 0;
    setFormCards(prev => [...prev, { id: generateId(), name: cardName.trim(), value: val }]);
    setCardName('');
    setCardValue('');
  }, [cardName, cardValue]);

  const removeCard = useCallback((id: string) => {
    setFormCards(prev => prev.filter(c => c.id !== id));
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!formProduct.trim() || !formTeam.trim()) return;
    const cost = parseFloat(formSpotCost) || 0;

    const entry: BreakEntry = {
      id: generateId(),
      date: formDate,
      product: formProduct.trim(),
      team: formTeam.trim(),
      spotCost: cost,
      cards: formCards,
      notes: formNotes.trim(),
    };

    setBreaks(prev => [entry, ...prev]);
    resetForm();
  }, [formDate, formProduct, formTeam, formSpotCost, formCards, formNotes, resetForm]);

  const deleteBreak = useCallback((id: string) => {
    setBreaks(prev => {
      const next = prev.filter(b => b.id !== id);
      if (next.length === 0) localStorage.removeItem(STORAGE_KEY);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    if (!confirm('Clear all break data? This cannot be undone.')) return;
    setBreaks([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const exportToClipboard = useCallback(async () => {
    if (breaks.length === 0) return;
    const lines = ['Date\tProduct\tTeam\tSpot Cost\tPull Value\tNet P/L\tROI %\tCards Pulled'];
    for (const b of breaks) {
      const pullVal = b.cards.reduce((s, c) => s + c.value, 0);
      const net = pullVal - b.spotCost;
      const roi = b.spotCost > 0 ? ((net / b.spotCost) * 100).toFixed(1) : '0.0';
      const cardList = b.cards.map(c => `${c.name} ($${c.value})`).join('; ');
      lines.push(`${b.date}\t${b.product}\t${b.team}\t$${b.spotCost.toFixed(2)}\t$${pullVal.toFixed(2)}\t$${net.toFixed(2)}\t${roi}%\t${cardList}`);
    }
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      alert('Break data copied to clipboard!');
    } catch {
      alert('Failed to copy. Try again.');
    }
  }, [breaks]);

  /* ── helpers ───────────────────────────────────────────────────── */

  function breakPullValue(b: BreakEntry): number {
    return b.cards.reduce((s, c) => s + c.value, 0);
  }

  function breakNet(b: BreakEntry): number {
    return breakPullValue(b) - b.spotCost;
  }

  function breakRoi(b: BreakEntry): number {
    return b.spotCost > 0 ? ((breakNet(b) / b.spotCost) * 100) : 0;
  }

  function fmtMoney(n: number): string {
    const sign = n < 0 ? '-' : n > 0 ? '+' : '';
    return `${sign}$${Math.abs(n).toFixed(2)}`;
  }

  function fmtPct(n: number): string {
    const sign = n > 0 ? '+' : '';
    return `${sign}${n.toFixed(1)}%`;
  }

  function plColor(n: number): string {
    if (n > 0) return 'text-green-400';
    if (n < 0) return 'text-red-400';
    return 'text-gray-400';
  }

  /* ── render ────────────────────────────────────────────────────── */

  return (
    <div className="space-y-6">

      {/* ── Summary Stats ─────────────────────────────────────────── */}
      {stats && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <h2 className="text-white font-bold mb-4">Lifetime Summary</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Total Breaks</div>
              <div className="text-xl font-bold text-white">{stats.totalBreaks}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Total Spent</div>
              <div className="text-xl font-bold text-white">${stats.totalSpent.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Total Pull Value</div>
              <div className="text-xl font-bold text-white">${stats.totalPullValue.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Net P/L</div>
              <div className={`text-xl font-bold ${plColor(stats.netPL)}`}>{fmtMoney(stats.netPL)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Overall ROI</div>
              <div className={`text-xl font-bold ${plColor(stats.overallRoi)}`}>{fmtPct(stats.overallRoi)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Avg ROI / Break</div>
              <div className={`text-xl font-bold ${plColor(stats.avgRoi)}`}>{fmtPct(stats.avgRoi)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Best Break ROI</div>
              <div className="text-xl font-bold text-green-400">{fmtPct(stats.bestRoi)}</div>
              {stats.bestBreak && <div className="text-xs text-gray-500 mt-0.5 truncate">{stats.bestBreak.product} &mdash; {stats.bestBreak.team}</div>}
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Worst Break ROI</div>
              <div className="text-xl font-bold text-red-400">{fmtPct(stats.worstRoi)}</div>
              {stats.worstBreak && <div className="text-xs text-gray-500 mt-0.5 truncate">{stats.worstBreak.product} &mdash; {stats.worstBreak.team}</div>}
            </div>
          </div>

          {/* P/L bar */}
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Spent: ${stats.totalSpent.toFixed(2)}</span>
              <span>Pull Value: ${stats.totalPullValue.toFixed(2)}</span>
            </div>
            <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${stats.netPL >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                style={{ width: `${Math.min(100, stats.totalSpent > 0 ? (stats.totalPullValue / stats.totalSpent) * 100 : 0)}%` }}
              />
            </div>
            <div className="text-center text-xs mt-1">
              <span className={plColor(stats.netPL)}>
                {stats.netPL >= 0 ? 'In the green' : 'In the red'} &mdash; {fmtMoney(stats.netPL)} ({fmtPct(stats.overallRoi)})
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Action buttons ────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {showForm ? 'Cancel' : '+ Log a Break'}
        </button>
        {breaks.length > 0 && (
          <>
            <button
              onClick={exportToClipboard}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Export to Clipboard
            </button>
            <button
              onClick={clearAll}
              className="px-4 py-2 bg-gray-700 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Clear All
            </button>
          </>
        )}
      </div>

      {/* ── New Break Form ────────────────────────────────────────── */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-800 border border-gray-700 rounded-xl p-5 space-y-4">
          <h3 className="text-white font-bold text-lg">Log New Break</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Date</label>
              <input
                type="date"
                value={formDate}
                onChange={e => setFormDate(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Product Name *</label>
              <input
                type="text"
                placeholder="e.g. 2024 Topps Chrome Hobby"
                value={formProduct}
                onChange={e => setFormProduct(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-amber-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Team Bought *</label>
              <input
                type="text"
                placeholder="e.g. Yankees, Lakers, Random"
                value={formTeam}
                onChange={e => setFormTeam(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-amber-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Spot Cost ($) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="25.00"
                value={formSpotCost}
                onChange={e => setFormSpotCost(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-amber-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Notes (optional)</label>
            <input
              type="text"
              placeholder="e.g. Layton Sports, Breakers.tv"
              value={formNotes}
              onChange={e => setFormNotes(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Cards pulled sub-form */}
          <div className="border border-gray-700 rounded-lg p-4">
            <div className="text-sm font-medium text-white mb-3">Cards Pulled</div>

            {formCards.length > 0 && (
              <div className="space-y-2 mb-3">
                {formCards.map(c => (
                  <div key={c.id} className="flex items-center justify-between bg-gray-900 rounded-lg px-3 py-2">
                    <div>
                      <span className="text-white text-sm">{c.name}</span>
                      <span className="text-amber-400 text-sm ml-2">${c.value.toFixed(2)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCard(c.id)}
                      className="text-gray-500 hover:text-red-400 text-sm transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <div className="text-right text-xs text-gray-500">
                  {formCards.length} card{formCards.length !== 1 ? 's' : ''} &mdash; Total: ${formCards.reduce((s, c) => s + c.value, 0).toFixed(2)}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Card name (e.g. Ohtani RC Auto)"
                value={cardName}
                onChange={e => setCardName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCard(); } }}
                className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-amber-500"
              />
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Value"
                value={cardValue}
                onChange={e => setCardValue(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCard(); } }}
                className="w-24 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={addCard}
                className="px-3 py-2 bg-amber-700 hover:bg-amber-600 text-white text-sm rounded-lg transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-sm text-gray-400">
              Spot: ${(parseFloat(formSpotCost) || 0).toFixed(2)} | Pull Value: ${formCards.reduce((s, c) => s + c.value, 0).toFixed(2)} |{' '}
              <span className={plColor(formCards.reduce((s, c) => s + c.value, 0) - (parseFloat(formSpotCost) || 0))}>
                Net: {fmtMoney(formCards.reduce((s, c) => s + c.value, 0) - (parseFloat(formSpotCost) || 0))}
              </span>
            </div>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm rounded-lg transition-colors"
            >
              Save Break
            </button>
          </div>
        </form>
      )}

      {/* ── Break History ─────────────────────────────────────────── */}
      {breaks.length === 0 && !showForm && (
        <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-8 text-center">
          <div className="text-3xl mb-3">&#127183;</div>
          <h3 className="text-white font-bold mb-2">No breaks logged yet</h3>
          <p className="text-gray-400 text-sm mb-4">
            Start tracking your group break purchases to see your running P&L and ROI.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            + Log Your First Break
          </button>
        </div>
      )}

      {breaks.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-white font-bold">Break History ({breaks.length})</h2>
          {breaks.map(b => {
            const pullVal = breakPullValue(b);
            const net = breakNet(b);
            const roi = breakRoi(b);
            const isExpanded = expandedId === b.id;

            return (
              <div key={b.id} className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
                {/* Header - always visible */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : b.id)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-750 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-medium text-sm truncate">{b.product}</span>
                      <span className="text-amber-400 text-xs bg-amber-950/60 border border-amber-800/30 rounded px-1.5 py-0.5">{b.team}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{b.date} &middot; {b.cards.length} card{b.cards.length !== 1 ? 's' : ''} pulled</div>
                  </div>
                  <div className="text-right ml-4 shrink-0">
                    <div className={`text-sm font-bold ${plColor(net)}`}>{fmtMoney(net)}</div>
                    <div className={`text-xs ${plColor(roi)}`}>{fmtPct(roi)} ROI</div>
                  </div>
                  <span className={`ml-3 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>&#9662;</span>
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-gray-700 px-4 py-3 space-y-3">
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <div className="text-xs text-gray-500">Spot Cost</div>
                        <div className="text-white font-medium">${b.spotCost.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Pull Value</div>
                        <div className="text-white font-medium">${pullVal.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Net P/L</div>
                        <div className={`font-medium ${plColor(net)}`}>{fmtMoney(net)}</div>
                      </div>
                    </div>

                    {b.cards.length > 0 && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Cards Pulled:</div>
                        <div className="space-y-1">
                          {b.cards.map(c => (
                            <div key={c.id} className="flex justify-between text-sm bg-gray-900 rounded px-2 py-1">
                              <span className="text-gray-300">{c.name}</span>
                              <span className="text-amber-400">${c.value.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {b.notes && (
                      <div className="text-xs text-gray-500">Notes: {b.notes}</div>
                    )}

                    <div className="flex justify-end">
                      <button
                        onClick={() => deleteBreak(b.id)}
                        className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                      >
                        Delete this break
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
