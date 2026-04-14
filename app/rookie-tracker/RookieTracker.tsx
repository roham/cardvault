'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface RookieInvestment {
  id: string;
  playerName: string;
  cardDescription: string;
  sport: string;
  purchasePrice: number;
  currentValue: number;
  purchaseDate: string;
  grade?: string;
  notes?: string;
}

/* ------------------------------------------------------------------ */
/*  Storage                                                            */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = 'cardvault-rookie-tracker';

function loadInvestments(): RookieInvestment[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveInvestments(items: RookieInvestment[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* quota */ }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function RookieTracker() {
  const [investments, setInvestments] = useState<RookieInvestment[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'profit' | 'value' | 'name'>('date');

  // Form state
  const [playerName, setPlayerName] = useState('');
  const [cardDescription, setCardDescription] = useState('');
  const [sport, setSport] = useState('football');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [grade, setGrade] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => { setInvestments(loadInvestments()); }, []);

  const totalInvested = investments.reduce((s, i) => s + i.purchasePrice, 0);
  const totalValue = investments.reduce((s, i) => s + i.currentValue, 0);
  const totalPnL = totalValue - totalInvested;
  const totalPnLPct = totalInvested > 0 ? ((totalPnL / totalInvested) * 100) : 0;
  const winners = investments.filter(i => i.currentValue > i.purchasePrice).length;
  const losers = investments.filter(i => i.currentValue < i.purchasePrice).length;

  const resetForm = () => {
    setPlayerName('');
    setCardDescription('');
    setSport('football');
    setPurchasePrice('');
    setCurrentValue('');
    setPurchaseDate('');
    setGrade('');
    setNotes('');
    setEditId(null);
  };

  const addOrUpdate = () => {
    if (!playerName.trim() || !purchasePrice) return;
    const item: RookieInvestment = {
      id: editId || Date.now().toString(36),
      playerName: playerName.trim(),
      cardDescription: cardDescription.trim(),
      sport,
      purchasePrice: parseFloat(purchasePrice) || 0,
      currentValue: parseFloat(currentValue) || 0,
      purchaseDate: purchaseDate || new Date().toISOString().split('T')[0],
      grade: grade || undefined,
      notes: notes || undefined,
    };

    let updated: RookieInvestment[];
    if (editId) {
      updated = investments.map(i => i.id === editId ? item : i);
    } else {
      updated = [item, ...investments];
    }
    setInvestments(updated);
    saveInvestments(updated);
    resetForm();
    setShowAdd(false);
  };

  const startEdit = (inv: RookieInvestment) => {
    setPlayerName(inv.playerName);
    setCardDescription(inv.cardDescription);
    setSport(inv.sport);
    setPurchasePrice(inv.purchasePrice.toString());
    setCurrentValue(inv.currentValue.toString());
    setPurchaseDate(inv.purchaseDate);
    setGrade(inv.grade || '');
    setNotes(inv.notes || '');
    setEditId(inv.id);
    setShowAdd(true);
  };

  const removeItem = (id: string) => {
    const updated = investments.filter(i => i.id !== id);
    setInvestments(updated);
    saveInvestments(updated);
  };

  const sorted = [...investments].sort((a, b) => {
    if (sortBy === 'profit') return (b.currentValue - b.purchasePrice) - (a.currentValue - a.purchasePrice);
    if (sortBy === 'value') return b.currentValue - a.currentValue;
    if (sortBy === 'name') return a.playerName.localeCompare(b.playerName);
    return new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime();
  });

  const sportIcons: Record<string, string> = {
    baseball: '⚾', basketball: '🏀', football: '🏈', hockey: '🏒', pokemon: '⚡',
  };

  return (
    <div className="space-y-8">
      {/* Portfolio Stats */}
      {investments.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-3 text-center">
            <div className="text-xs text-gray-500 uppercase tracking-wide">Invested</div>
            <div className="text-lg font-bold text-white">${totalInvested.toFixed(2)}</div>
          </div>
          <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-3 text-center">
            <div className="text-xs text-gray-500 uppercase tracking-wide">Current Value</div>
            <div className="text-lg font-bold text-blue-400">${totalValue.toFixed(2)}</div>
          </div>
          <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-3 text-center">
            <div className="text-xs text-gray-500 uppercase tracking-wide">P&L</div>
            <div className={`text-lg font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalPnL >= 0 ? '+' : ''}{totalPnL.toFixed(2)} ({totalPnLPct >= 0 ? '+' : ''}{totalPnLPct.toFixed(1)}%)
            </div>
          </div>
          <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-3 text-center">
            <div className="text-xs text-gray-500 uppercase tracking-wide">W / L</div>
            <div className="text-lg font-bold">
              <span className="text-green-400">{winners}</span>
              <span className="text-gray-600"> / </span>
              <span className="text-red-400">{losers}</span>
            </div>
          </div>
        </div>
      )}

      {/* Add / Sort Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => { resetForm(); setShowAdd(!showAdd); }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            + Add Rookie Card
          </button>
          {investments.length > 1 && (
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="date">Sort: Recent</option>
              <option value="profit">Sort: P&L</option>
              <option value="value">Sort: Value</option>
              <option value="name">Sort: Name</option>
            </select>
          )}
        </div>
        <span className="text-sm text-gray-500">{investments.length} card{investments.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Add/Edit Form */}
      {showAdd && (
        <div className="bg-gray-800/80 border border-gray-700 rounded-xl p-5 space-y-4">
          <h3 className="font-bold text-white">{editId ? 'Edit Investment' : 'Add Rookie Card Investment'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="text" value={playerName} onChange={e => setPlayerName(e.target.value)} placeholder="Player Name" className="px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none" />
            <input type="text" value={cardDescription} onChange={e => setCardDescription(e.target.value)} placeholder="Card (e.g. 2024 Prizm Silver)" className="px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Purchase Price</label>
              <input type="number" step="0.01" value={purchasePrice} onChange={e => setPurchasePrice(e.target.value)} placeholder="$0.00" className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Current Value</label>
              <input type="number" step="0.01" value={currentValue} onChange={e => setCurrentValue(e.target.value)} placeholder="$0.00" className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Sport</label>
              <select value={sport} onChange={e => setSport(e.target.value)} className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none">
                <option value="baseball">Baseball</option>
                <option value="basketball">Basketball</option>
                <option value="football">Football</option>
                <option value="hockey">Hockey</option>
                <option value="pokemon">Pokemon</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Grade (optional)</label>
              <input type="text" value={grade} onChange={e => setGrade(e.target.value)} placeholder="PSA 10, Raw" className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Purchase Date</label>
              <input type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Notes (optional)</label>
              <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Draft pick, breakout candidate..." className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={addOrUpdate} disabled={!playerName.trim() || !purchasePrice} className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors">
              {editId ? 'Save Changes' : 'Add Investment'}
            </button>
            <button onClick={() => { setShowAdd(false); resetForm(); }} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Investment List */}
      {sorted.length > 0 ? (
        <div className="space-y-3">
          {sorted.map(inv => {
            const pnl = inv.currentValue - inv.purchasePrice;
            const pnlPct = inv.purchasePrice > 0 ? ((pnl / inv.purchasePrice) * 100) : 0;
            return (
              <div key={inv.id} className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span>{sportIcons[inv.sport] || '🃏'}</span>
                      <span className="font-bold text-white">{inv.playerName}</span>
                      {inv.grade && <span className="text-xs bg-blue-900/40 text-blue-400 border border-blue-700/50 rounded px-1.5 py-0.5">{inv.grade}</span>}
                    </div>
                    {inv.cardDescription && <div className="text-sm text-gray-400">{inv.cardDescription}</div>}
                    {inv.notes && <div className="text-xs text-gray-500 mt-1 italic">{inv.notes}</div>}
                    <div className="text-xs text-gray-600 mt-1">{inv.purchaseDate}</div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-xs text-gray-500">Paid ${inv.purchasePrice.toFixed(2)}</div>
                    <div className="text-sm font-medium text-white">${inv.currentValue.toFixed(2)}</div>
                    <div className={`text-sm font-bold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)} ({pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(0)}%)
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-2 pt-2 border-t border-gray-700/50">
                  <button onClick={() => startEdit(inv)} className="text-xs text-blue-400/70 hover:text-blue-400 transition-colors">Edit</button>
                  <button onClick={() => removeItem(inv.id)} className="text-xs text-red-400/70 hover:text-red-400 transition-colors">Remove</button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-3">📈</div>
          <p className="text-sm">No rookie investments tracked yet.</p>
          <p className="text-xs text-gray-600 mt-1">Tap &quot;Add Rookie Card&quot; to start building your portfolio.</p>
        </div>
      )}

      {/* Tips Section */}
      <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-5">
        <h3 className="font-bold text-white mb-3">Rookie Investing Tips</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-400">
          <div>
            <div className="font-medium text-gray-300 mb-1">When to Buy</div>
            <ul className="space-y-1 list-disc list-inside">
              <li>Buy during the off-season when demand drops</li>
              <li>Target rookies on their 2nd contract (proven, not hype)</li>
              <li>Buy raw and grade if centering + corners are strong</li>
              <li>Watch for injury dips — buy the recovery</li>
            </ul>
          </div>
          <div>
            <div className="font-medium text-gray-300 mb-1">When to Sell</div>
            <ul className="space-y-1 list-disc list-inside">
              <li>Sell into hype (playoff runs, MVP races, awards)</li>
              <li>Sell graded cards at peak — PSA 10s move fast</li>
              <li>Set a target and stick to it (2x, 3x, 5x)</li>
              <li>Take profits — nobody went broke taking gains</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/tools/flip-calc" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Flip Calculator &rarr;</Link>
          <Link href="/tools/grading-roi" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Grading ROI &rarr;</Link>
          <Link href="/prospects" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Prospect Rankings &rarr;</Link>
        </div>
      </div>
    </div>
  );
}
