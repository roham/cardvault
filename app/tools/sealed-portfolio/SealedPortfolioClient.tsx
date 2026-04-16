'use client';

import { useState, useEffect, useMemo } from 'react';

/* ---------- Types ---------- */

interface SealedProduct {
  name: string;
  sport: string;
  year: number;
  type: 'hobby' | 'retail' | 'blaster' | 'etb' | 'mega' | 'case' | 'jumbo' | 'other';
  currentValue: number; // estimated current market value
}

interface PortfolioItem {
  id: string;
  product: SealedProduct;
  quantity: number;
  purchasePrice: number; // per unit
  purchaseDate: string; // YYYY-MM-DD
  notes: string;
}

interface PortfolioStats {
  totalItems: number;
  totalUnits: number;
  totalCost: number;
  totalValue: number;
  totalProfit: number;
  roi: number;
  bestPerformer: PortfolioItem | null;
  worstPerformer: PortfolioItem | null;
  bySport: Record<string, { cost: number; value: number; units: number }>;
  byType: Record<string, { cost: number; value: number; units: number }>;
}

/* ---------- Product Database ---------- */

const SEALED_PRODUCTS: SealedProduct[] = [
  // MLB
  { name: '2024 Topps Chrome Hobby Box', sport: 'MLB', year: 2024, type: 'hobby', currentValue: 250 },
  { name: '2024 Topps Series 1 Hobby Box', sport: 'MLB', year: 2024, type: 'hobby', currentValue: 150 },
  { name: '2024 Topps Series 2 Hobby Box', sport: 'MLB', year: 2024, type: 'hobby', currentValue: 140 },
  { name: '2024 Bowman Chrome Hobby Box', sport: 'MLB', year: 2024, type: 'hobby', currentValue: 300 },
  { name: '2024 Bowman Hobby Box', sport: 'MLB', year: 2024, type: 'hobby', currentValue: 200 },
  { name: '2024 Topps Chrome Blaster', sport: 'MLB', year: 2024, type: 'blaster', currentValue: 35 },
  { name: '2024 Topps Chrome Mega Box', sport: 'MLB', year: 2024, type: 'mega', currentValue: 55 },
  { name: '2023 Topps Chrome Hobby Box', sport: 'MLB', year: 2023, type: 'hobby', currentValue: 320 },
  { name: '2023 Bowman Chrome Hobby Box', sport: 'MLB', year: 2023, type: 'hobby', currentValue: 380 },
  { name: '2022 Topps Chrome Hobby Box', sport: 'MLB', year: 2022, type: 'hobby', currentValue: 280 },
  { name: '2021 Topps Chrome Hobby Box', sport: 'MLB', year: 2021, type: 'hobby', currentValue: 450 },
  { name: '2020 Bowman Chrome Hobby Box', sport: 'MLB', year: 2020, type: 'hobby', currentValue: 500 },
  { name: '2019 Topps Chrome Hobby Box', sport: 'MLB', year: 2019, type: 'hobby', currentValue: 650 },
  { name: '2018 Topps Chrome Hobby Box', sport: 'MLB', year: 2018, type: 'hobby', currentValue: 850 },
  { name: '2017 Topps Chrome Hobby Box', sport: 'MLB', year: 2017, type: 'hobby', currentValue: 700 },
  // NBA
  { name: '2024-25 Panini Prizm Hobby Box', sport: 'NBA', year: 2024, type: 'hobby', currentValue: 600 },
  { name: '2024-25 Panini Prizm Blaster', sport: 'NBA', year: 2024, type: 'blaster', currentValue: 40 },
  { name: '2024-25 Donruss Optic Hobby Box', sport: 'NBA', year: 2024, type: 'hobby', currentValue: 350 },
  { name: '2024-25 Panini Select Hobby Box', sport: 'NBA', year: 2024, type: 'hobby', currentValue: 400 },
  { name: '2023-24 Panini Prizm Hobby Box', sport: 'NBA', year: 2023, type: 'hobby', currentValue: 750 },
  { name: '2022-23 Panini Prizm Hobby Box', sport: 'NBA', year: 2022, type: 'hobby', currentValue: 550 },
  { name: '2021-22 Panini Prizm Hobby Box', sport: 'NBA', year: 2021, type: 'hobby', currentValue: 500 },
  { name: '2020-21 Panini Prizm Hobby Box', sport: 'NBA', year: 2020, type: 'hobby', currentValue: 700 },
  { name: '2019-20 Panini Prizm Hobby Box', sport: 'NBA', year: 2019, type: 'hobby', currentValue: 1800 },
  { name: '2018-19 Panini Prizm Hobby Box', sport: 'NBA', year: 2018, type: 'hobby', currentValue: 3200 },
  // NFL
  { name: '2024 Panini Prizm Football Hobby Box', sport: 'NFL', year: 2024, type: 'hobby', currentValue: 500 },
  { name: '2024 Panini Prizm Football Blaster', sport: 'NFL', year: 2024, type: 'blaster', currentValue: 35 },
  { name: '2024 Panini Select Football Hobby Box', sport: 'NFL', year: 2024, type: 'hobby', currentValue: 400 },
  { name: '2024 Panini Donruss Football Hobby Box', sport: 'NFL', year: 2024, type: 'hobby', currentValue: 200 },
  { name: '2023 Panini Prizm Football Hobby Box', sport: 'NFL', year: 2023, type: 'hobby', currentValue: 650 },
  { name: '2022 Panini Prizm Football Hobby Box', sport: 'NFL', year: 2022, type: 'hobby', currentValue: 500 },
  { name: '2021 Panini Prizm Football Hobby Box', sport: 'NFL', year: 2021, type: 'hobby', currentValue: 600 },
  { name: '2020 Panini Prizm Football Hobby Box', sport: 'NFL', year: 2020, type: 'hobby', currentValue: 1500 },
  // NHL
  { name: '2024-25 Upper Deck Series 1 Hobby Box', sport: 'NHL', year: 2024, type: 'hobby', currentValue: 120 },
  { name: '2024-25 Upper Deck Young Guns Hobby', sport: 'NHL', year: 2024, type: 'hobby', currentValue: 150 },
  { name: '2023-24 Upper Deck Series 1 Hobby Box', sport: 'NHL', year: 2023, type: 'hobby', currentValue: 180 },
  { name: '2023-24 Upper Deck Series 2 Hobby Box', sport: 'NHL', year: 2023, type: 'hobby', currentValue: 140 },
  { name: '2022-23 Upper Deck Series 1 Hobby Box', sport: 'NHL', year: 2022, type: 'hobby', currentValue: 250 },
  { name: '2021-22 Upper Deck Series 1 Hobby Box', sport: 'NHL', year: 2021, type: 'hobby', currentValue: 300 },
  // Pokemon
  { name: '2024 Pokemon Prismatic Evolutions ETB', sport: 'Pokemon', year: 2024, type: 'etb', currentValue: 85 },
  { name: '2024 Pokemon Surging Sparks Booster Box', sport: 'Pokemon', year: 2024, type: 'hobby', currentValue: 120 },
  { name: '2024 Pokemon Shrouded Fable Booster Box', sport: 'Pokemon', year: 2024, type: 'hobby', currentValue: 130 },
  { name: '2023 Pokemon 151 Booster Box (JP)', sport: 'Pokemon', year: 2023, type: 'hobby', currentValue: 200 },
  { name: '2023 Pokemon 151 ETB', sport: 'Pokemon', year: 2023, type: 'etb', currentValue: 80 },
  { name: '2023 Pokemon Obsidian Flames Booster Box', sport: 'Pokemon', year: 2023, type: 'hobby', currentValue: 150 },
  { name: '2022 Pokemon Crown Zenith ETB', sport: 'Pokemon', year: 2022, type: 'etb', currentValue: 90 },
  { name: '2021 Pokemon Evolving Skies Booster Box', sport: 'Pokemon', year: 2021, type: 'hobby', currentValue: 400 },
  { name: '2020 Pokemon Champions Path ETB', sport: 'Pokemon', year: 2020, type: 'etb', currentValue: 200 },
  { name: '2019 Pokemon Hidden Fates ETB', sport: 'Pokemon', year: 2019, type: 'etb', currentValue: 350 },
  { name: '2016 Pokemon Evolutions Booster Box', sport: 'Pokemon', year: 2016, type: 'hobby', currentValue: 1200 },
];

const PRODUCT_TYPES = ['hobby', 'retail', 'blaster', 'etb', 'mega', 'case', 'jumbo', 'other'] as const;
const TYPE_LABELS: Record<string, string> = {
  hobby: 'Hobby Box', retail: 'Retail Box', blaster: 'Blaster', etb: 'ETB',
  mega: 'Mega Box', case: 'Case', jumbo: 'Jumbo Box', other: 'Other',
};
const SPORTS = ['All', 'MLB', 'NBA', 'NFL', 'NHL', 'Pokemon'];
const SPORT_COLORS: Record<string, string> = {
  MLB: 'bg-red-600', NBA: 'bg-orange-600', NFL: 'bg-green-600', NHL: 'bg-blue-600', Pokemon: 'bg-yellow-600',
};

/* ---------- Helpers ---------- */

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function formatCurrency(n: number): string {
  return n < 0 ? `-$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatPercent(n: number): string {
  const sign = n >= 0 ? '+' : '';
  return `${sign}${n.toFixed(1)}%`;
}

function calcStats(items: PortfolioItem[]): PortfolioStats {
  const totalItems = items.length;
  const totalUnits = items.reduce((s, i) => s + i.quantity, 0);
  const totalCost = items.reduce((s, i) => s + i.purchasePrice * i.quantity, 0);
  const totalValue = items.reduce((s, i) => s + i.product.currentValue * i.quantity, 0);
  const totalProfit = totalValue - totalCost;
  const roi = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;

  const bySport: Record<string, { cost: number; value: number; units: number }> = {};
  const byType: Record<string, { cost: number; value: number; units: number }> = {};

  let bestPerformer: PortfolioItem | null = null;
  let bestRoi = -Infinity;
  let worstPerformer: PortfolioItem | null = null;
  let worstRoi = Infinity;

  for (const item of items) {
    const cost = item.purchasePrice * item.quantity;
    const value = item.product.currentValue * item.quantity;
    const itemRoi = item.purchasePrice > 0 ? ((item.product.currentValue - item.purchasePrice) / item.purchasePrice) * 100 : 0;

    if (itemRoi > bestRoi) { bestRoi = itemRoi; bestPerformer = item; }
    if (itemRoi < worstRoi) { worstRoi = itemRoi; worstPerformer = item; }

    const sport = item.product.sport;
    if (!bySport[sport]) bySport[sport] = { cost: 0, value: 0, units: 0 };
    bySport[sport].cost += cost;
    bySport[sport].value += value;
    bySport[sport].units += item.quantity;

    const type = TYPE_LABELS[item.product.type] || item.product.type;
    if (!byType[type]) byType[type] = { cost: 0, value: 0, units: 0 };
    byType[type].cost += cost;
    byType[type].value += value;
    byType[type].units += item.quantity;
  }

  return { totalItems, totalUnits, totalCost, totalValue, totalProfit, roi, bestPerformer, worstPerformer, bySport, byType };
}

/* ---------- Component ---------- */

type View = 'portfolio' | 'add' | 'stats';

export default function SealedPortfolioClient() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [view, setView] = useState<View>('portfolio');
  const [sportFilter, setSportFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'name' | 'profit' | 'roi' | 'value' | 'date'>('date');
  const [loaded, setLoaded] = useState(false);

  // Add form state
  const [searchQ, setSearchQ] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<SealedProduct | null>(null);
  const [customMode, setCustomMode] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customSport, setCustomSport] = useState('MLB');
  const [customYear, setCustomYear] = useState(2024);
  const [customType, setCustomType] = useState<SealedProduct['type']>('hobby');
  const [customValue, setCustomValue] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cv-sealed-portfolio');
      if (saved) setItems(JSON.parse(saved));
    } catch {}
    setLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (loaded) {
      localStorage.setItem('cv-sealed-portfolio', JSON.stringify(items));
    }
  }, [items, loaded]);

  const filteredProducts = useMemo(() => {
    if (!searchQ.trim()) return SEALED_PRODUCTS.slice(0, 10);
    const q = searchQ.toLowerCase();
    return SEALED_PRODUCTS.filter(p => p.name.toLowerCase().includes(q) || p.sport.toLowerCase().includes(q));
  }, [searchQ]);

  const filteredItems = useMemo(() => {
    let filtered = sportFilter === 'All' ? items : items.filter(i => i.product.sport === sportFilter);
    switch (sortBy) {
      case 'name': return [...filtered].sort((a, b) => a.product.name.localeCompare(b.product.name));
      case 'profit': return [...filtered].sort((a, b) => (b.product.currentValue - b.purchasePrice) * b.quantity - (a.product.currentValue - a.purchasePrice) * a.quantity);
      case 'roi': {
        const roiOf = (i: PortfolioItem) => i.purchasePrice > 0 ? (i.product.currentValue - i.purchasePrice) / i.purchasePrice : 0;
        return [...filtered].sort((a, b) => roiOf(b) - roiOf(a));
      }
      case 'value': return [...filtered].sort((a, b) => b.product.currentValue * b.quantity - a.product.currentValue * a.quantity);
      case 'date': return [...filtered].sort((a, b) => b.purchaseDate.localeCompare(a.purchaseDate));
      default: return filtered;
    }
  }, [items, sportFilter, sortBy]);

  const stats = useMemo(() => calcStats(items), [items]);

  function addItem() {
    const product = customMode
      ? { name: customName.trim() || 'Custom Product', sport: customSport, year: customYear, type: customType, currentValue: parseFloat(customValue) || 0 }
      : selectedProduct;
    if (!product) return;
    const newItem: PortfolioItem = {
      id: generateId(),
      product,
      quantity,
      purchasePrice: parseFloat(purchasePrice) || 0,
      purchaseDate,
      notes,
    };
    setItems(prev => [...prev, newItem]);
    // Reset form
    setSelectedProduct(null);
    setSearchQ('');
    setCustomMode(false);
    setCustomName('');
    setCustomValue('');
    setQuantity(1);
    setPurchasePrice('');
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setView('portfolio');
  }

  function removeItem(id: string) {
    setItems(prev => prev.filter(i => i.id !== id));
  }

  function clearAll() {
    if (confirm('Remove all items from your sealed portfolio?')) {
      setItems([]);
    }
  }

  if (!loaded) return <div className="text-gray-500 text-center py-20">Loading portfolio...</div>;

  return (
    <div>
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        {(['portfolio', 'add', 'stats'] as View[]).map(v => (
          <button key={v} onClick={() => setView(v)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === v ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'}`}>
            {v === 'portfolio' ? `Portfolio (${items.length})` : v === 'add' ? '+ Add Product' : 'Analytics'}
          </button>
        ))}
      </div>

      {/* Summary Bar */}
      {items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
            <div className="text-gray-500 text-xs mb-1">Total Cost</div>
            <div className="text-white font-bold text-lg">{formatCurrency(stats.totalCost)}</div>
          </div>
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
            <div className="text-gray-500 text-xs mb-1">Current Value</div>
            <div className="text-white font-bold text-lg">{formatCurrency(stats.totalValue)}</div>
          </div>
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
            <div className="text-gray-500 text-xs mb-1">Total P&L</div>
            <div className={`font-bold text-lg ${stats.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(stats.totalProfit)}
            </div>
          </div>
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
            <div className="text-gray-500 text-xs mb-1">ROI</div>
            <div className={`font-bold text-lg ${stats.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatPercent(stats.roi)}
            </div>
          </div>
        </div>
      )}

      {/* ---------- PORTFOLIO VIEW ---------- */}
      {view === 'portfolio' && (
        <div>
          {items.length === 0 ? (
            <div className="text-center py-16 bg-gray-900/30 border border-gray-800 rounded-2xl">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-white font-semibold text-lg mb-2">No Sealed Products Yet</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Track your sealed wax investments. Add hobby boxes, blasters, ETBs, and cases to see your portfolio performance.
              </p>
              <button onClick={() => setView('add')} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-500 transition-colors">
                Add Your First Product
              </button>
            </div>
          ) : (
            <>
              {/* Filters */}
              <div className="flex flex-wrap gap-3 mb-4">
                <div className="flex gap-1 bg-gray-900/60 border border-gray-800 rounded-lg p-1">
                  {SPORTS.map(s => (
                    <button key={s} onClick={() => setSportFilter(s)}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${sportFilter === s ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                      {s}
                    </button>
                  ))}
                </div>
                <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
                  className="bg-gray-900/60 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-300">
                  <option value="date">Sort: Date Added</option>
                  <option value="profit">Sort: P&L</option>
                  <option value="roi">Sort: ROI</option>
                  <option value="value">Sort: Value</option>
                  <option value="name">Sort: Name</option>
                </select>
                <button onClick={clearAll} className="ml-auto text-xs text-red-400 hover:text-red-300 transition-colors">
                  Clear All
                </button>
              </div>

              {/* Items */}
              <div className="space-y-3">
                {filteredItems.map(item => {
                  const totalCost = item.purchasePrice * item.quantity;
                  const totalValue = item.product.currentValue * item.quantity;
                  const profit = totalValue - totalCost;
                  const roi = item.purchasePrice > 0 ? ((item.product.currentValue - item.purchasePrice) / item.purchasePrice) * 100 : 0;
                  return (
                    <div key={item.id} className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold text-white ${SPORT_COLORS[item.product.sport] || 'bg-gray-600'}`}>
                              {item.product.sport}
                            </span>
                            <span className="text-gray-500 text-xs">{TYPE_LABELS[item.product.type]}</span>
                            {item.quantity > 1 && <span className="text-blue-400 text-xs font-medium">x{item.quantity}</span>}
                          </div>
                          <h3 className="text-white font-medium text-sm truncate">{item.product.name}</h3>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
                            <span>Bought: {formatCurrency(item.purchasePrice)}/ea</span>
                            <span>Now: {formatCurrency(item.product.currentValue)}/ea</span>
                            <span>{item.purchaseDate}</span>
                          </div>
                          {item.notes && <div className="text-xs text-gray-600 mt-1 italic">{item.notes}</div>}
                        </div>
                        <div className="flex items-center gap-4 sm:text-right">
                          <div>
                            <div className="text-white font-semibold text-sm">{formatCurrency(totalValue)}</div>
                            <div className={`text-xs font-medium ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {formatCurrency(profit)} ({formatPercent(roi)})
                            </div>
                          </div>
                          <button onClick={() => removeItem(item.id)} className="text-gray-600 hover:text-red-400 transition-colors text-lg" title="Remove">
                            &times;
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="text-center text-gray-600 text-xs mt-4">
                {filteredItems.length} of {items.length} products shown &middot; {stats.totalUnits} total units
              </div>
            </>
          )}
        </div>
      )}

      {/* ---------- ADD VIEW ---------- */}
      {view === 'add' && (
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-white font-bold text-lg mb-4">Add Sealed Product</h2>

          {/* Toggle */}
          <div className="flex gap-2 mb-6">
            <button onClick={() => { setCustomMode(false); setSelectedProduct(null); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!customMode ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
              Search Database
            </button>
            <button onClick={() => { setCustomMode(true); setSelectedProduct(null); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${customMode ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
              Custom Entry
            </button>
          </div>

          {!customMode ? (
            <div className="mb-6">
              <label className="block text-gray-400 text-sm mb-1">Search sealed products</label>
              <input type="text" value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="e.g. 2024 Topps Chrome Hobby..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder:text-gray-600 focus:border-blue-600 focus:outline-none" />
              {filteredProducts.length > 0 && (
                <div className="mt-2 max-h-60 overflow-y-auto space-y-1">
                  {filteredProducts.map((p, i) => (
                    <button key={i} onClick={() => { setSelectedProduct(p); setPurchasePrice(p.currentValue.toString()); }}
                      className={`w-full text-left p-3 rounded-lg text-sm transition-colors ${selectedProduct?.name === p.name ? 'bg-blue-600/20 border border-blue-600/50' : 'bg-gray-800/60 hover:bg-gray-800 border border-transparent'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold text-white mr-2 ${SPORT_COLORS[p.sport] || 'bg-gray-600'}`}>{p.sport}</span>
                          <span className="text-white">{p.name}</span>
                        </div>
                        <span className="text-gray-400 text-xs">{formatCurrency(p.currentValue)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {selectedProduct && (
                <div className="mt-3 bg-blue-950/30 border border-blue-800/30 rounded-lg p-3 text-sm">
                  <span className="text-blue-400 font-medium">Selected:</span> <span className="text-white">{selectedProduct.name}</span>
                  <span className="text-gray-500 ml-2">Est. value: {formatCurrency(selectedProduct.currentValue)}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="mb-6 space-y-3">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Product Name</label>
                <input type="text" value={customName} onChange={e => setCustomName(e.target.value)} placeholder="e.g. 2024 Topps Chrome Hobby Box"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder:text-gray-600 focus:border-blue-600 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Sport</label>
                  <select value={customSport} onChange={e => setCustomSport(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white">
                    {SPORTS.filter(s => s !== 'All').map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Year</label>
                  <input type="number" value={customYear} onChange={e => setCustomYear(parseInt(e.target.value) || 2024)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white" />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Type</label>
                  <select value={customType} onChange={e => setCustomType(e.target.value as SealedProduct['type'])}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white">
                    {PRODUCT_TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Current Value ($)</label>
                  <input type="number" value={customValue} onChange={e => setCustomValue(e.target.value)} placeholder="250"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder:text-gray-600" />
                </div>
              </div>
            </div>
          )}

          {/* Common fields */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Qty</label>
              <input type="number" min={1} value={quantity} onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white" />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Price Paid ($/unit)</label>
              <input type="number" value={purchasePrice} onChange={e => setPurchasePrice(e.target.value)} placeholder="0"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder:text-gray-600" />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Purchase Date</label>
              <input type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white" />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Notes</label>
              <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder:text-gray-600" />
            </div>
          </div>

          <button onClick={addItem} disabled={!customMode && !selectedProduct}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            Add to Portfolio
          </button>
        </div>
      )}

      {/* ---------- STATS VIEW ---------- */}
      {view === 'stats' && (
        <div>
          {items.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              Add sealed products to see analytics.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Top performers */}
              <div className="grid sm:grid-cols-2 gap-4">
                {stats.bestPerformer && (
                  <div className="bg-green-950/30 border border-green-800/40 rounded-xl p-4">
                    <div className="text-green-400 text-xs font-medium mb-2">Best Performer</div>
                    <div className="text-white font-semibold text-sm">{stats.bestPerformer.product.name}</div>
                    <div className="text-green-400 text-sm mt-1">
                      {formatPercent(stats.bestPerformer.purchasePrice > 0 ? ((stats.bestPerformer.product.currentValue - stats.bestPerformer.purchasePrice) / stats.bestPerformer.purchasePrice) * 100 : 0)} ROI
                    </div>
                    <div className="text-gray-500 text-xs mt-1">
                      Bought {formatCurrency(stats.bestPerformer.purchasePrice)} &rarr; Now {formatCurrency(stats.bestPerformer.product.currentValue)}
                    </div>
                  </div>
                )}
                {stats.worstPerformer && stats.totalItems > 1 && (
                  <div className="bg-red-950/30 border border-red-800/40 rounded-xl p-4">
                    <div className="text-red-400 text-xs font-medium mb-2">Worst Performer</div>
                    <div className="text-white font-semibold text-sm">{stats.worstPerformer.product.name}</div>
                    <div className="text-red-400 text-sm mt-1">
                      {formatPercent(stats.worstPerformer.purchasePrice > 0 ? ((stats.worstPerformer.product.currentValue - stats.worstPerformer.purchasePrice) / stats.worstPerformer.purchasePrice) * 100 : 0)} ROI
                    </div>
                    <div className="text-gray-500 text-xs mt-1">
                      Bought {formatCurrency(stats.worstPerformer.purchasePrice)} &rarr; Now {formatCurrency(stats.worstPerformer.product.currentValue)}
                    </div>
                  </div>
                )}
              </div>

              {/* Allocation by Sport */}
              <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
                <h3 className="text-white font-bold mb-4">Allocation by Sport</h3>
                {stats.totalValue > 0 && (
                  <div className="flex h-6 rounded-full overflow-hidden mb-4">
                    {Object.entries(stats.bySport).map(([sport, data]) => {
                      const pct = (data.value / stats.totalValue) * 100;
                      if (pct < 1) return null;
                      return (
                        <div key={sport} className={`${SPORT_COLORS[sport] || 'bg-gray-600'} relative group`} style={{ width: `${pct}%` }}
                          title={`${sport}: ${pct.toFixed(1)}%`}>
                          {pct > 8 && <span className="absolute inset-0 flex items-center justify-center text-white text-[10px] font-bold">{sport}</span>}
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(stats.bySport).sort((a, b) => b[1].value - a[1].value).map(([sport, data]) => {
                    const profit = data.value - data.cost;
                    const roi = data.cost > 0 ? ((data.value - data.cost) / data.cost) * 100 : 0;
                    return (
                      <div key={sport} className="bg-gray-800/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-2.5 h-2.5 rounded-full ${SPORT_COLORS[sport] || 'bg-gray-600'}`} />
                          <span className="text-white text-sm font-medium">{sport}</span>
                        </div>
                        <div className="text-gray-400 text-xs">{data.units} units &middot; {formatCurrency(data.value)}</div>
                        <div className={`text-xs font-medium ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatCurrency(profit)} ({formatPercent(roi)})
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Allocation by Type */}
              <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
                <h3 className="text-white font-bold mb-4">Allocation by Product Type</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(stats.byType).sort((a, b) => b[1].value - a[1].value).map(([type, data]) => {
                    const profit = data.value - data.cost;
                    const roi = data.cost > 0 ? ((data.value - data.cost) / data.cost) * 100 : 0;
                    const pct = stats.totalValue > 0 ? (data.value / stats.totalValue) * 100 : 0;
                    return (
                      <div key={type} className="bg-gray-800/50 rounded-lg p-3">
                        <div className="text-white text-sm font-medium mb-1">{type}</div>
                        <div className="text-gray-400 text-xs">{data.units} units &middot; {pct.toFixed(0)}% of portfolio</div>
                        <div className="text-gray-400 text-xs">Cost: {formatCurrency(data.cost)} &middot; Value: {formatCurrency(data.value)}</div>
                        <div className={`text-xs font-medium mt-1 ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatCurrency(profit)} ({formatPercent(roi)})
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tips */}
              <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
                <h3 className="text-white font-bold mb-3">Sealed Investment Tips</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex gap-2"><span className="text-blue-400 shrink-0">1.</span>Hobby boxes historically outperform retail/blaster for long-term appreciation</li>
                  <li className="flex gap-2"><span className="text-blue-400 shrink-0">2.</span>Products 3-5 years old with strong rookie classes see the steepest appreciation curves</li>
                  <li className="flex gap-2"><span className="text-blue-400 shrink-0">3.</span>Store sealed products in a cool, dry environment — heat and humidity degrade packaging and card quality</li>
                  <li className="flex gap-2"><span className="text-blue-400 shrink-0">4.</span>Diversify across sports and years — a single sport downturn shouldn&apos;t sink your entire portfolio</li>
                  <li className="flex gap-2"><span className="text-blue-400 shrink-0">5.</span>Track your purchase prices accurately — many collectors forget what they paid and miscalculate ROI</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
