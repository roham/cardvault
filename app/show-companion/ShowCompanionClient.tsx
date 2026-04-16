'use client';

import { useState, useEffect, useMemo } from 'react';

type Tab = 'buy' | 'sell' | 'log' | 'summary';

interface BuyItem {
  id: string;
  cardName: string;
  maxPrice: number;
  notes: string;
  found: boolean;
  actualPrice: number | null;
}

interface SellItem {
  id: string;
  cardName: string;
  minPrice: number;
  askingPrice: number;
  notes: string;
  sold: boolean;
  soldPrice: number | null;
}

interface PurchaseLog {
  id: string;
  cardName: string;
  price: number;
  booth: string;
  time: string;
}

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export default function ShowCompanionClient() {
  const [tab, setTab] = useState<Tab>('buy');
  const [buyList, setBuyList] = useState<BuyItem[]>([]);
  const [sellList, setSellList] = useState<SellItem[]>([]);
  const [purchases, setPurchases] = useState<PurchaseLog[]>([]);
  const [budget, setBudget] = useState<number>(200);
  const [showName, setShowName] = useState('');

  // Form states
  const [buyForm, setBuyForm] = useState({ cardName: '', maxPrice: '', notes: '' });
  const [sellForm, setSellForm] = useState({ cardName: '', minPrice: '', askingPrice: '', notes: '' });
  const [logForm, setLogForm] = useState({ cardName: '', price: '', booth: '' });

  useEffect(() => {
    const saved = localStorage.getItem('cardvault-show-companion');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.buyList) setBuyList(data.buyList);
        if (data.sellList) setSellList(data.sellList);
        if (data.purchases) setPurchases(data.purchases);
        if (data.budget) setBudget(data.budget);
        if (data.showName) setShowName(data.showName);
      } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    const data = { buyList, sellList, purchases, budget, showName };
    localStorage.setItem('cardvault-show-companion', JSON.stringify(data));
  }, [buyList, sellList, purchases, budget, showName]);

  const totalSpent = useMemo(() => purchases.reduce((s, p) => s + p.price, 0), [purchases]);
  const totalSold = useMemo(() => sellList.filter(s => s.sold).reduce((s, i) => s + (i.soldPrice ?? 0), 0), [sellList]);
  const remaining = budget - totalSpent + totalSold;
  const buyListFound = buyList.filter(b => b.found).length;
  const sellListSold = sellList.filter(s => s.sold).length;

  const addBuyItem = () => {
    if (!buyForm.cardName) return;
    setBuyList(prev => [...prev, {
      id: genId(), cardName: buyForm.cardName,
      maxPrice: parseFloat(buyForm.maxPrice) || 0, notes: buyForm.notes,
      found: false, actualPrice: null,
    }]);
    setBuyForm({ cardName: '', maxPrice: '', notes: '' });
  };

  const addSellItem = () => {
    if (!sellForm.cardName) return;
    setSellList(prev => [...prev, {
      id: genId(), cardName: sellForm.cardName,
      minPrice: parseFloat(sellForm.minPrice) || 0,
      askingPrice: parseFloat(sellForm.askingPrice) || 0,
      notes: sellForm.notes, sold: false, soldPrice: null,
    }]);
    setSellForm({ cardName: '', minPrice: '', askingPrice: '', notes: '' });
  };

  const logPurchase = () => {
    if (!logForm.cardName || !logForm.price) return;
    setPurchases(prev => [...prev, {
      id: genId(), cardName: logForm.cardName,
      price: parseFloat(logForm.price) || 0, booth: logForm.booth,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
    setLogForm({ cardName: '', price: '', booth: '' });
  };

  const markFound = (id: string, price: number) => {
    setBuyList(prev => prev.map(b => b.id === id ? { ...b, found: true, actualPrice: price } : b));
  };

  const markSold = (id: string, price: number) => {
    setSellList(prev => prev.map(s => s.id === id ? { ...s, sold: true, soldPrice: price } : s));
  };

  const removeBuy = (id: string) => setBuyList(prev => prev.filter(b => b.id !== id));
  const removeSell = (id: string) => setSellList(prev => prev.filter(s => s.id !== id));
  const removePurchase = (id: string) => setPurchases(prev => prev.filter(p => p.id !== id));

  const clearAll = () => {
    setBuyList([]); setSellList([]); setPurchases([]);
    setBudget(200); setShowName('');
  };

  const copySummary = () => {
    const lines = [
      `Card Show Companion — ${showName || 'Show'} | ${new Date().toLocaleDateString()}`,
      `Budget: $${budget} | Spent: $${totalSpent.toFixed(2)} | Sold: $${totalSold.toFixed(2)} | Net: $${(totalSold - totalSpent).toFixed(2)}`,
      '',
      `Purchases (${purchases.length}):`,
      ...purchases.map(p => `  ${p.cardName} — $${p.price.toFixed(2)}${p.booth ? ` @ ${p.booth}` : ''}`),
      '',
      `Sold (${sellListSold}/${sellList.length}):`,
      ...sellList.filter(s => s.sold).map(s => `  ${s.cardName} — $${s.soldPrice?.toFixed(2)}`),
    ];
    navigator.clipboard.writeText(lines.join('\n'));
  };

  const loadSample = () => {
    setBuyList([
      { id: 'sb1', cardName: '2024 Bowman Chrome Paul Skenes RC', maxPrice: 50, notes: 'Any condition, need for PC', found: false, actualPrice: null },
      { id: 'sb2', cardName: '2023 Topps Chrome Wemby RC Base', maxPrice: 25, notes: 'PSA 9+ only', found: false, actualPrice: null },
      { id: 'sb3', cardName: '1989 Upper Deck Ken Griffey Jr. RC', maxPrice: 40, notes: 'Centered, no creases', found: false, actualPrice: null },
    ]);
    setSellList([
      { id: 'ss1', cardName: '2022 Prizm Caleb Williams RC Silver', minPrice: 30, askingPrice: 45, notes: 'Willing to trade for Skenes', sold: false, soldPrice: null },
      { id: 'ss2', cardName: '2020 Prizm Ja Morant RC', minPrice: 15, askingPrice: 25, notes: 'Raw, clean corners', sold: false, soldPrice: null },
    ]);
    setBudget(200);
    setShowName('Local Card Show');
  };

  return (
    <div>
      {/* Budget & Show Header */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 mb-6">
        <div className="flex flex-wrap gap-3 items-center mb-3">
          <input value={showName} onChange={e => setShowName(e.target.value)}
            placeholder="Show name (optional)"
            className="flex-1 min-w-[140px] bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-emerald-500 focus:outline-none" />
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">Budget:</label>
            <input type="number" value={budget} onChange={e => setBudget(parseFloat(e.target.value) || 0)}
              className="w-24 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="text-center">
            <div className={`text-xl font-bold ${remaining >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>${remaining.toFixed(2)}</div>
            <div className="text-xs text-gray-500">Remaining</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-red-400">${totalSpent.toFixed(2)}</div>
            <div className="text-xs text-gray-500">Spent</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-emerald-400">${totalSold.toFixed(2)}</div>
            <div className="text-xs text-gray-500">Sold</div>
          </div>
          <div className="text-center">
            <div className={`text-xl font-bold ${(totalSold - totalSpent) >= 0 ? 'text-blue-400' : 'text-amber-400'}`}>
              {(totalSold - totalSpent) >= 0 ? '+' : ''}${(totalSold - totalSpent).toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">Net P&L</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto">
        {([
          { key: 'buy' as const, label: `Buy List (${buyListFound}/${buyList.length})` },
          { key: 'sell' as const, label: `Sell List (${sellListSold}/${sellList.length})` },
          { key: 'log' as const, label: `Purchases (${purchases.length})` },
          { key: 'summary' as const, label: 'Summary' },
        ]).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              tab === t.key ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* BUY LIST */}
      {tab === 'buy' && (
        <div className="space-y-4">
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
            <h3 className="text-sm font-bold text-white mb-3">Add to Buy List</h3>
            <div className="flex flex-wrap gap-2">
              <input value={buyForm.cardName} onChange={e => setBuyForm(f => ({ ...f, cardName: e.target.value }))}
                placeholder="Card name" className="flex-1 min-w-[180px] bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-emerald-500 focus:outline-none" />
              <input type="number" step="0.01" value={buyForm.maxPrice} onChange={e => setBuyForm(f => ({ ...f, maxPrice: e.target.value }))}
                placeholder="Max $" className="w-24 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-emerald-500 focus:outline-none" />
              <input value={buyForm.notes} onChange={e => setBuyForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Notes" className="w-32 sm:w-40 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-emerald-500 focus:outline-none" />
              <button onClick={addBuyItem} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors">Add</button>
            </div>
          </div>

          {buyList.length === 0 ? (
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-8 text-center">
              <div className="text-3xl mb-2">🛒</div>
              <p className="text-gray-500 text-sm mb-3">No cards on your buy list yet.</p>
              <button onClick={loadSample} className="text-sm text-yellow-400 hover:text-yellow-300">Load Sample Data</button>
            </div>
          ) : (
            <div className="space-y-2">
              {buyList.map(item => (
                <div key={item.id} className={`bg-gray-900/60 border rounded-xl p-4 ${item.found ? 'border-emerald-800/50' : 'border-gray-800'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {item.found && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">Found</span>}
                        <span className="text-white font-medium text-sm truncate">{item.cardName}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Max: ${item.maxPrice.toFixed(2)}
                        {item.actualPrice !== null && <span className={`ml-2 ${item.actualPrice <= item.maxPrice ? 'text-emerald-400' : 'text-red-400'}`}>Paid: ${item.actualPrice.toFixed(2)}</span>}
                        {item.notes && <span className="ml-2 italic">{item.notes}</span>}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {!item.found && (
                        <button onClick={() => {
                          const price = prompt('What did you pay?');
                          if (price) markFound(item.id, parseFloat(price) || 0);
                        }} className="text-xs px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors">Found</button>
                      )}
                      <button onClick={() => removeBuy(item.id)} className="text-xs px-2 py-1 text-red-400 hover:text-red-300 transition-colors">X</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SELL LIST */}
      {tab === 'sell' && (
        <div className="space-y-4">
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
            <h3 className="text-sm font-bold text-white mb-3">Add to Sell List</h3>
            <div className="flex flex-wrap gap-2">
              <input value={sellForm.cardName} onChange={e => setSellForm(f => ({ ...f, cardName: e.target.value }))}
                placeholder="Card name" className="flex-1 min-w-[160px] bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-emerald-500 focus:outline-none" />
              <input type="number" step="0.01" value={sellForm.askingPrice} onChange={e => setSellForm(f => ({ ...f, askingPrice: e.target.value }))}
                placeholder="Ask $" className="w-20 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-emerald-500 focus:outline-none" />
              <input type="number" step="0.01" value={sellForm.minPrice} onChange={e => setSellForm(f => ({ ...f, minPrice: e.target.value }))}
                placeholder="Min $" className="w-20 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-emerald-500 focus:outline-none" />
              <button onClick={addSellItem} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors">Add</button>
            </div>
          </div>

          {sellList.length === 0 ? (
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-8 text-center">
              <div className="text-3xl mb-2">💰</div>
              <p className="text-gray-500 text-sm">No cards on your sell list yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sellList.map(item => (
                <div key={item.id} className={`bg-gray-900/60 border rounded-xl p-4 ${item.sold ? 'border-blue-800/50' : 'border-gray-800'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {item.sold && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-950/60 text-blue-400 border border-blue-800/50">Sold</span>}
                        <span className="text-white font-medium text-sm truncate">{item.cardName}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Ask: ${item.askingPrice.toFixed(2)} | Min: ${item.minPrice.toFixed(2)}
                        {item.soldPrice !== null && <span className={`ml-2 font-medium ${item.soldPrice >= item.minPrice ? 'text-emerald-400' : 'text-red-400'}`}>Sold: ${item.soldPrice.toFixed(2)}</span>}
                        {item.notes && <span className="ml-2 italic">{item.notes}</span>}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {!item.sold && (
                        <button onClick={() => {
                          const price = prompt(`Sold for? (asking: $${item.askingPrice})`);
                          if (price) markSold(item.id, parseFloat(price) || 0);
                        }} className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors">Sold</button>
                      )}
                      <button onClick={() => removeSell(item.id)} className="text-xs px-2 py-1 text-red-400 hover:text-red-300 transition-colors">X</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PURCHASE LOG */}
      {tab === 'log' && (
        <div className="space-y-4">
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
            <h3 className="text-sm font-bold text-white mb-3">Quick Log Purchase</h3>
            <div className="flex flex-wrap gap-2">
              <input value={logForm.cardName} onChange={e => setLogForm(f => ({ ...f, cardName: e.target.value }))}
                placeholder="Card name" className="flex-1 min-w-[160px] bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-emerald-500 focus:outline-none" />
              <input type="number" step="0.01" value={logForm.price} onChange={e => setLogForm(f => ({ ...f, price: e.target.value }))}
                placeholder="Price $" className="w-24 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-emerald-500 focus:outline-none" />
              <input value={logForm.booth} onChange={e => setLogForm(f => ({ ...f, booth: e.target.value }))}
                placeholder="Booth #" className="w-24 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-emerald-500 focus:outline-none" />
              <button onClick={logPurchase} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-lg transition-colors">Log</button>
            </div>
          </div>

          {/* Running total bar */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 flex items-center justify-between">
            <span className="text-sm text-gray-400">Running total: <span className="text-white font-bold">${totalSpent.toFixed(2)}</span> of ${budget.toFixed(2)}</span>
            <div className="w-32 bg-gray-800 rounded-full h-2.5 overflow-hidden">
              <div className={`h-full rounded-full transition-all ${totalSpent > budget ? 'bg-red-500' : totalSpent > budget * 0.8 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min(100, (totalSpent / budget) * 100)}%` }} />
            </div>
          </div>

          {purchases.length === 0 ? (
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-8 text-center">
              <div className="text-3xl mb-2">📋</div>
              <p className="text-gray-500 text-sm">No purchases logged yet. Start shopping!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {[...purchases].reverse().map(p => (
                <div key={p.id} className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <span className="text-white text-sm font-medium truncate block">{p.cardName}</span>
                    <span className="text-xs text-gray-500">{p.time}{p.booth && ` · Booth ${p.booth}`}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-amber-400 font-bold text-sm">${p.price.toFixed(2)}</span>
                    <button onClick={() => removePurchase(p.id)} className="text-xs text-red-400 hover:text-red-300">X</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUMMARY */}
      {tab === 'summary' && (
        <div className="space-y-4">
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Show Summary</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div>
                <div className="text-xs text-gray-500">Budget</div>
                <div className="text-lg font-bold text-white">${budget.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Total Spent</div>
                <div className="text-lg font-bold text-red-400">${totalSpent.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Total Sold</div>
                <div className="text-lg font-bold text-emerald-400">${totalSold.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Net P&L</div>
                <div className={`text-lg font-bold ${(totalSold - totalSpent) >= 0 ? 'text-blue-400' : 'text-amber-400'}`}>
                  {(totalSold - totalSpent) >= 0 ? '+' : ''}${(totalSold - totalSpent).toFixed(2)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-800/60 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Buy List Progress</div>
                <div className="text-white font-bold">{buyListFound}/{buyList.length} found</div>
                {buyList.length > 0 && (
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(buyListFound / buyList.length) * 100}%` }} />
                  </div>
                )}
              </div>
              <div className="bg-gray-800/60 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Sell List Progress</div>
                <div className="text-white font-bold">{sellListSold}/{sellList.length} sold</div>
                {sellList.length > 0 && (
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(sellListSold / sellList.length) * 100}%` }} />
                  </div>
                )}
              </div>
            </div>

            {purchases.length > 0 && (
              <div className="mb-4">
                <div className="text-xs text-gray-500 mb-2">Avg per card: ${(totalSpent / purchases.length).toFixed(2)} | {purchases.length} cards purchased</div>
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={copySummary} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors">
                Copy Summary
              </button>
              <button onClick={clearAll} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-red-400 text-sm font-medium rounded-lg transition-colors">
                Reset All
              </button>
            </div>
          </div>

          {/* Negotiation Tips */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
            <h3 className="text-sm font-bold text-white mb-3">Card Show Tips</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {[
                { tip: 'Walk the whole show first', detail: 'Prices vary 20-40% between booths for the same card. Do a full lap before buying.' },
                { tip: 'Ask for bundle deals', detail: 'Buying 3+ cards from one dealer? Ask for 10-15% off. Most will negotiate.' },
                { tip: 'Check eBay sold prices live', detail: 'Use the eBay app to verify fair market value before negotiating.' },
                { tip: 'Bring cash for discounts', detail: 'Many dealers offer 5-10% cash discounts to avoid payment processing fees.' },
                { tip: 'Hit the dollar boxes', detail: 'The best ROI at card shows is in dollar boxes. You can find overlooked gems.' },
                { tip: 'End-of-day deals', detail: 'Dealers don\'t want to pack unsold inventory. Last hour = best negotiation leverage.' },
              ].map((item, i) => (
                <div key={i} className="bg-gray-800/40 rounded-lg p-3">
                  <div className="text-emerald-400 font-medium text-xs mb-1">{item.tip}</div>
                  <div className="text-gray-400 text-xs">{item.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
