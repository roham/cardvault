'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';
import type { SportsCard } from '@/data/sports-cards';

const sportIcons: Record<string, string> = {
  baseball: '⚾', basketball: '🏀', football: '🏈', hockey: '🏒',
};

function parseValue(v: string): number {
  const m = v.match(/\$([\d,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
}

interface LotCard {
  id: string;
  card: SportsCard | null;
  customName: string;
  customValue: number;
  quantity: number;
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export default function LotEvaluatorClient() {
  const [lotCards, setLotCards] = useState<LotCard[]>([]);
  const [askingPrice, setAskingPrice] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sportFilter, setSportFilter] = useState<string>('all');
  const [showSearch, setShowSearch] = useState(false);
  const [mode, setMode] = useState<'search' | 'manual'>('search');

  // Manual entry fields
  const [manualName, setManualName] = useState('');
  const [manualValue, setManualValue] = useState('');
  const [manualQty, setManualQty] = useState('1');

  const filteredCards = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase();
    return sportsCards
      .filter(c => {
        if (sportFilter !== 'all' && c.sport !== sportFilter) return false;
        return c.name.toLowerCase().includes(q) ||
          c.player.toLowerCase().includes(q) ||
          c.set.toLowerCase().includes(q);
      })
      .slice(0, 20);
  }, [searchQuery, sportFilter]);

  const addCardFromSearch = (card: SportsCard) => {
    setLotCards(prev => [...prev, {
      id: generateId(),
      card,
      customName: card.name,
      customValue: parseValue(card.estimatedValueRaw),
      quantity: 1,
    }]);
    setSearchQuery('');
    setShowSearch(false);
  };

  const addManualCard = () => {
    if (!manualName.trim()) return;
    const val = parseFloat(manualValue) || 0;
    const qty = parseInt(manualQty) || 1;
    setLotCards(prev => [...prev, {
      id: generateId(),
      card: null,
      customName: manualName.trim(),
      customValue: val,
      quantity: qty,
    }]);
    setManualName('');
    setManualValue('');
    setManualQty('1');
  };

  const removeCard = (id: string) => {
    setLotCards(prev => prev.filter(c => c.id !== id));
  };

  const updateQuantity = (id: string, qty: number) => {
    setLotCards(prev => prev.map(c => c.id === id ? { ...c, quantity: Math.max(1, qty) } : c));
  };

  const updateValue = (id: string, val: number) => {
    setLotCards(prev => prev.map(c => c.id === id ? { ...c, customValue: val } : c));
  };

  const clearAll = () => {
    setLotCards([]);
    setAskingPrice('');
  };

  // Analysis
  const totalCards = lotCards.reduce((s, c) => s + c.quantity, 0);
  const totalEstimatedValue = lotCards.reduce((s, c) => s + c.customValue * c.quantity, 0);
  const asking = parseFloat(askingPrice) || 0;
  const savings = asking > 0 ? totalEstimatedValue - asking : 0;
  const savingsPct = asking > 0 && totalEstimatedValue > 0 ? ((savings / totalEstimatedValue) * 100) : 0;
  const pricePerCard = totalCards > 0 ? (asking > 0 ? asking / totalCards : totalEstimatedValue / totalCards) : 0;

  let verdict: { label: string; color: string; description: string } = { label: '', color: '', description: '' };
  if (asking > 0 && totalEstimatedValue > 0) {
    const ratio = asking / totalEstimatedValue;
    if (ratio <= 0.5) verdict = { label: 'Great Deal', color: 'text-emerald-400', description: `You\'re paying ${Math.round((1 - ratio) * 100)}% below estimated value. This lot is significantly underpriced.` };
    else if (ratio <= 0.7) verdict = { label: 'Good Value', color: 'text-green-400', description: `You\'re paying ${Math.round((1 - ratio) * 100)}% below estimated value. Solid deal for this lot.` };
    else if (ratio <= 0.9) verdict = { label: 'Fair Price', color: 'text-yellow-400', description: `Asking price is close to estimated value. Normal market pricing.` };
    else if (ratio <= 1.1) verdict = { label: 'At Market', color: 'text-amber-400', description: `The lot is priced right at market value. No significant discount.` };
    else if (ratio <= 1.3) verdict = { label: 'Overpaying', color: 'text-orange-400', description: `You\'d be paying ${Math.round((ratio - 1) * 100)}% above estimated value. Try negotiating down.` };
    else verdict = { label: 'Bad Deal', color: 'text-red-400', description: `The lot is priced ${Math.round((ratio - 1) * 100)}% above estimated value. Walk away or negotiate hard.` };
  }

  // Breakdown by sport
  const sportBreakdown = useMemo(() => {
    const breakdown: Record<string, { count: number; value: number }> = {};
    lotCards.forEach(lc => {
      const sport = lc.card?.sport || 'other';
      if (!breakdown[sport]) breakdown[sport] = { count: 0, value: 0 };
      breakdown[sport].count += lc.quantity;
      breakdown[sport].value += lc.customValue * lc.quantity;
    });
    return Object.entries(breakdown).sort((a, b) => b[1].value - a[1].value);
  }, [lotCards]);

  // Top value cards
  const sortedByValue = useMemo(() => {
    return [...lotCards].sort((a, b) => (b.customValue * b.quantity) - (a.customValue * a.quantity));
  }, [lotCards]);

  return (
    <div className="space-y-6">
      {/* Add Cards */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Add Cards to Lot</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setMode('search')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${mode === 'search' ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
            >
              🔍 Search Database
            </button>
            <button
              onClick={() => setMode('manual')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${mode === 'manual' ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
            >
              ✏️ Manual Entry
            </button>
          </div>
        </div>

        {mode === 'search' ? (
          <div className="space-y-3">
            <div className="flex gap-2">
              <select
                value={sportFilter}
                onChange={e => setSportFilter(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">All Sports</option>
                <option value="baseball">⚾ Baseball</option>
                <option value="basketball">🏀 Basketball</option>
                <option value="football">🏈 Football</option>
                <option value="hockey">🏒 Hockey</option>
              </select>
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setShowSearch(true); }}
                  onFocus={() => setShowSearch(true)}
                  placeholder="Search by player, card name, or set..."
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 text-sm placeholder-gray-500"
                />
                {showSearch && filteredCards.length > 0 && (
                  <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg max-h-60 overflow-y-auto shadow-xl">
                    {filteredCards.map(card => (
                      <button
                        key={card.slug}
                        onClick={() => addCardFromSearch(card)}
                        className="w-full text-left px-4 py-2.5 hover:bg-gray-700 transition text-sm border-b border-gray-700/50 last:border-0"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-white font-medium">{sportIcons[card.sport] || ''} {card.player}</span>
                          <span className="text-emerald-400 font-medium">{card.estimatedValueRaw}</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">{card.year} {card.set} #{card.cardNumber}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500">Search our database of {sportsCards.length.toLocaleString()}+ cards to auto-fill values</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={manualName}
                  onChange={e => setManualName(e.target.value)}
                  placeholder="Card description (e.g. 2023 Topps Chrome Ohtani RC)"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 text-sm placeholder-gray-500"
                />
              </div>
              <input
                type="number"
                value={manualValue}
                onChange={e => setManualValue(e.target.value)}
                placeholder="Est. value ($)"
                min="0"
                step="0.01"
                className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 text-sm placeholder-gray-500"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  value={manualQty}
                  onChange={e => setManualQty(e.target.value)}
                  placeholder="Qty"
                  min="1"
                  className="w-20 bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm placeholder-gray-500"
                />
                <button
                  onClick={addManualCard}
                  disabled={!manualName.trim()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-lg text-sm transition"
                >
                  Add
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500">Manually enter cards not in our database, like bulk commons or unlisted variants</p>
          </div>
        )}
      </div>

      {/* Card List */}
      {lotCards.length > 0 && (
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">
              Lot Contents ({totalCards} card{totalCards !== 1 ? 's' : ''})
            </h2>
            <button onClick={clearAll} className="text-xs text-red-400 hover:text-red-300 transition">
              Clear All
            </button>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {lotCards.map(lc => (
              <div key={lc.id} className="flex items-center gap-3 bg-gray-800/60 rounded-lg px-4 py-2.5 group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {lc.card && <span className="text-sm">{sportIcons[lc.card.sport] || ''}</span>}
                    <span className="text-sm text-white font-medium truncate">
                      {lc.card ? `${lc.card.player} — ${lc.card.year} ${lc.card.set}` : lc.customName}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-gray-500">$</span>
                  <input
                    type="number"
                    value={lc.customValue}
                    onChange={e => updateValue(lc.id, parseFloat(e.target.value) || 0)}
                    className="w-20 bg-gray-700 border border-gray-600 text-white rounded px-2 py-1 text-sm text-right"
                    min="0"
                    step="0.01"
                  />
                  <span className="text-xs text-gray-500">×</span>
                  <input
                    type="number"
                    value={lc.quantity}
                    onChange={e => updateQuantity(lc.id, parseInt(e.target.value) || 1)}
                    className="w-14 bg-gray-700 border border-gray-600 text-white rounded px-2 py-1 text-sm text-center"
                    min="1"
                  />
                  <button
                    onClick={() => removeCard(lc.id)}
                    className="text-gray-600 hover:text-red-400 transition opacity-0 group-hover:opacity-100"
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Quick add bulk commons */}
          <div className="mt-3 pt-3 border-t border-gray-700/50">
            <button
              onClick={() => {
                setLotCards(prev => [...prev, {
                  id: generateId(),
                  card: null,
                  customName: 'Bulk commons / base cards',
                  customValue: 0.10,
                  quantity: 50,
                }]);
              }}
              className="text-xs text-gray-400 hover:text-emerald-400 transition"
            >
              + Add 50 bulk commons ($0.10 each)
            </button>
          </div>
        </div>
      )}

      {/* Asking Price */}
      {lotCards.length > 0 && (
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
          <h2 className="text-lg font-bold text-white mb-3">Asking Price</h2>
          <div className="flex items-center gap-3">
            <span className="text-2xl text-gray-400">$</span>
            <input
              type="number"
              value={askingPrice}
              onChange={e => setAskingPrice(e.target.value)}
              placeholder="What is the seller asking?"
              min="0"
              step="0.01"
              className="flex-1 bg-gray-800 border border-gray-700 text-white text-xl font-bold rounded-lg px-4 py-3 placeholder-gray-600"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">Enter the total price the seller is asking for the lot</p>
        </div>
      )}

      {/* Results */}
      {lotCards.length > 0 && (
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
          <h2 className="text-lg font-bold text-white mb-4">Lot Analysis</h2>

          {/* Value Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-gray-800/60 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-500 mb-1">Total Cards</div>
              <div className="text-xl font-bold text-white">{totalCards}</div>
            </div>
            <div className="bg-gray-800/60 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-500 mb-1">Est. Total Value</div>
              <div className="text-xl font-bold text-emerald-400">${totalEstimatedValue.toLocaleString()}</div>
            </div>
            <div className="bg-gray-800/60 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-500 mb-1">Avg. Per Card</div>
              <div className="text-xl font-bold text-white">${pricePerCard.toFixed(2)}</div>
            </div>
            <div className="bg-gray-800/60 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-500 mb-1">{asking > 0 ? 'Savings' : 'Unique Cards'}</div>
              <div className={`text-xl font-bold ${asking > 0 ? (savings >= 0 ? 'text-emerald-400' : 'text-red-400') : 'text-white'}`}>
                {asking > 0 ? `${savings >= 0 ? '+' : ''}$${Math.abs(savings).toLocaleString()}` : lotCards.length}
              </div>
            </div>
          </div>

          {/* Verdict */}
          {asking > 0 && verdict.label && (
            <div className="bg-gray-800/80 border border-gray-700 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3 mb-2">
                <span className={`text-xl font-bold ${verdict.color}`}>{verdict.label}</span>
                {savingsPct !== 0 && (
                  <span className={`text-sm ${savingsPct > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    ({savingsPct > 0 ? '+' : ''}{savingsPct.toFixed(1)}% vs market)
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400">{verdict.description}</p>

              {/* Value bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Asking: ${asking.toLocaleString()}</span>
                  <span>Est. Value: ${totalEstimatedValue.toLocaleString()}</span>
                </div>
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${asking <= totalEstimatedValue ? 'bg-emerald-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min(100, (asking / Math.max(1, totalEstimatedValue)) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Sport Breakdown */}
          {sportBreakdown.length > 1 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Sport Breakdown</h3>
              <div className="space-y-2">
                {sportBreakdown.map(([sport, data]) => (
                  <div key={sport} className="flex items-center gap-3">
                    <span className="w-6 text-center">{sportIcons[sport] || '📦'}</span>
                    <span className="text-sm text-white capitalize w-24">{sport}</span>
                    <div className="flex-1 h-2.5 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${(data.value / Math.max(1, totalEstimatedValue)) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-28 text-right">
                      {data.count} cards &middot; ${data.value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Value Cards */}
          {sortedByValue.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Top Value Cards</h3>
              <div className="space-y-1.5">
                {sortedByValue.slice(0, 5).map((lc, i) => (
                  <div key={lc.id} className="flex items-center gap-3 text-sm">
                    <span className="text-gray-600 w-5 text-right">{i + 1}.</span>
                    <span className="text-white flex-1 truncate">
                      {lc.card ? (
                        <Link href={`/sports/${lc.card.slug}`} className="hover:text-emerald-400 transition">
                          {lc.card.player} — {lc.card.year} {lc.card.set}
                        </Link>
                      ) : lc.customName}
                    </span>
                    <span className="text-emerald-400 font-medium">
                      ${(lc.customValue * lc.quantity).toLocaleString()}
                      {lc.quantity > 1 && <span className="text-gray-500"> ({lc.quantity}×)</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="mt-6 pt-4 border-t border-gray-700/50">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Lot Buying Tips</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-400">
              <div className="flex gap-2"><span className="text-emerald-400">1.</span>Target lots where 1-2 key cards cover 50%+ of the asking price</div>
              <div className="flex gap-2"><span className="text-emerald-400">2.</span>Check eBay sold listings to verify values before buying</div>
              <div className="flex gap-2"><span className="text-emerald-400">3.</span>Factor in shipping costs for online lots — add $5-$15</div>
              <div className="flex gap-2"><span className="text-emerald-400">4.</span>Condition matters — assume raw lot cards are EX or lower</div>
              <div className="flex gap-2"><span className="text-emerald-400">5.</span>Bulk commons are worth $0.05-$0.10 each, not face value</div>
              <div className="flex gap-2"><span className="text-emerald-400">6.</span>At card shows, offer 60-70% of asking — most sellers expect negotiation</div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {lotCards.length === 0 && (
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-8 text-center">
          <div className="text-4xl mb-3">📦</div>
          <h3 className="text-lg font-bold text-white mb-2">No Cards in Lot</h3>
          <p className="text-gray-400 text-sm mb-4">
            Search our database or manually enter cards to evaluate a bulk lot.
            Add the asking price to see if it&apos;s a good deal.
          </p>
          <div className="flex flex-wrap gap-3 justify-center text-xs text-gray-500">
            <span>Works for card show lots</span>
            <span>&middot;</span>
            <span>eBay bulk listings</span>
            <span>&middot;</span>
            <span>LCS grab bags</span>
            <span>&middot;</span>
            <span>Estate sale collections</span>
          </div>
        </div>
      )}
    </div>
  );
}
