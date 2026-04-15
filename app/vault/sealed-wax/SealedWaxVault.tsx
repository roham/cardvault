'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { sealedProducts, type SealedProduct } from '@/data/sealed-products';

/* ── helpers ────────────────────────────────────────────────── */

interface VaultEntry {
  slug: string;
  purchasePrice: number;
  quantity: number;
  addedAt: string;
}

const STORAGE_KEY = 'cardvault_sealed_wax';

function loadVault(): VaultEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveVault(entries: VaultEntry[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)); } catch {}
}

/** Deterministic market multiplier based on product age, type, and sport */
function marketMultiplier(p: SealedProduct): number {
  const now = new Date();
  const released = new Date(p.releaseDate);
  const ageYears = Math.max(0, (now.getTime() - released.getTime()) / (365.25 * 86400000));

  // Base appreciation curve by age
  let base = 1.0;
  if (ageYears < 0.5) base = 0.95 + ageYears * 0.2; // new releases can dip first
  else if (ageYears < 1) base = 1.0 + (ageYears - 0.5) * 0.16;
  else if (ageYears < 2) base = 1.08 + (ageYears - 1) * 0.22;
  else if (ageYears < 5) base = 1.30 + (ageYears - 2) * 0.15;
  else base = 1.75 + (ageYears - 5) * 0.10;

  // Product-type multiplier (hobby appreciates more)
  const typeBonus: Record<string, number> = {
    'hobby-box': 1.15,
    'mega-box': 1.05,
    'blaster': 1.0,
    'etb': 1.08,
    'hanger': 0.95,
    'fat-pack': 0.92,
  };

  // Sport multiplier (Pokemon sealed has strongest premium)
  const sportBonus: Record<string, number> = {
    pokemon: 1.25,
    baseball: 1.05,
    basketball: 1.10,
    football: 1.08,
    hockey: 0.98,
  };

  // High-end products appreciate faster
  const priceBonus = p.retailPrice >= 500 ? 1.20 : p.retailPrice >= 200 ? 1.10 : 1.0;

  return Math.round(base * (typeBonus[p.type] ?? 1.0) * (sportBonus[p.sport] ?? 1.0) * priceBonus * 100) / 100;
}

/** Expected value from ripping the product */
function calculateEV(p: SealedProduct): number {
  let ev = p.baseCardValue;
  for (const hit of p.hitRates) {
    const parts = hit.odds.match(/1:(\d+)/);
    if (parts) {
      const oddsPerPack = 1 / parseInt(parts[1], 10);
      const hitsPerBox = oddsPerPack * p.packsPerBox;
      ev += hitsPerBox * hit.avgValue;
    }
  }
  return Math.round(ev * 100) / 100;
}

type Signal = 'HOLD' | 'RIP IT' | 'NEUTRAL';

function ripOrHold(p: SealedProduct): { signal: Signal; sealedValue: number; ev: number; premium: number } {
  const mult = marketMultiplier(p);
  const sealedValue = Math.round(p.retailPrice * mult * 100) / 100;
  const ev = calculateEV(p);
  const premium = ev > 0 ? Math.round((sealedValue / ev - 1) * 100) : 0;

  let signal: Signal = 'NEUTRAL';
  if (premium > 40) signal = 'HOLD';
  else if (premium < -5) signal = 'RIP IT';

  return { signal, sealedValue, ev, premium };
}

const SPORT_COLORS: Record<string, string> = {
  baseball: 'text-red-400',
  basketball: 'text-orange-400',
  football: 'text-green-400',
  hockey: 'text-blue-400',
  pokemon: 'text-yellow-400',
};

const SPORT_BG: Record<string, string> = {
  baseball: 'bg-red-900/30 border-red-800/50',
  basketball: 'bg-orange-900/30 border-orange-800/50',
  football: 'bg-green-900/30 border-green-800/50',
  hockey: 'bg-blue-900/30 border-blue-800/50',
  pokemon: 'bg-yellow-900/30 border-yellow-800/50',
};

const SIGNAL_STYLES: Record<Signal, string> = {
  'HOLD': 'bg-emerald-900/60 text-emerald-300 border-emerald-700/50',
  'RIP IT': 'bg-red-900/60 text-red-300 border-red-700/50',
  'NEUTRAL': 'bg-gray-800/60 text-gray-300 border-gray-700/50',
};

const TYPE_LABELS: Record<string, string> = {
  'hobby-box': 'Hobby Box',
  'blaster': 'Blaster',
  'mega-box': 'Mega Box',
  'hanger': 'Hanger',
  'fat-pack': 'Fat Pack',
  'etb': 'ETB',
};

/* ── component ──────────────────────────────────────────────── */

type Tab = 'browse' | 'vault' | 'analysis';
type SportFilter = 'all' | 'baseball' | 'basketball' | 'football' | 'hockey' | 'pokemon';
type SortBy = 'name' | 'appreciation' | 'price' | 'ev' | 'premium';

export default function SealedWaxVault() {
  const [vault, setVault] = useState<VaultEntry[]>([]);
  const [tab, setTab] = useState<Tab>('browse');
  const [sportFilter, setSportFilter] = useState<SportFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('appreciation');
  const [searchTerm, setSearchTerm] = useState('');
  const [addingSlug, setAddingSlug] = useState<string | null>(null);
  const [addPrice, setAddPrice] = useState('');
  const [addQty, setAddQty] = useState('1');

  useEffect(() => {
    setVault(loadVault());
  }, []);

  const updateVault = useCallback((fn: (prev: VaultEntry[]) => VaultEntry[]) => {
    setVault(prev => {
      const next = fn(prev);
      saveVault(next);
      return next;
    });
  }, []);

  const addToVault = useCallback(() => {
    if (!addingSlug) return;
    const price = parseFloat(addPrice);
    const qty = parseInt(addQty, 10);
    if (isNaN(price) || price <= 0 || isNaN(qty) || qty <= 0) return;
    updateVault(prev => [...prev, { slug: addingSlug, purchasePrice: price, quantity: qty, addedAt: new Date().toISOString() }]);
    setAddingSlug(null);
    setAddPrice('');
    setAddQty('1');
  }, [addingSlug, addPrice, addQty, updateVault]);

  const removeFromVault = useCallback((index: number) => {
    updateVault(prev => prev.filter((_, i) => i !== index));
  }, [updateVault]);

  // Product catalog with computed metrics
  const catalog = useMemo(() => {
    return sealedProducts.map(p => {
      const roh = ripOrHold(p);
      const mult = marketMultiplier(p);
      return { ...p, ...roh, mult, appreciation: Math.round((mult - 1) * 100) };
    });
  }, []);

  // Filtered + sorted catalog
  const filteredCatalog = useMemo(() => {
    let list = catalog;
    if (sportFilter !== 'all') list = list.filter(p => p.sport === sportFilter);
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
    }
    const sorters: Record<SortBy, (a: typeof list[0], b: typeof list[0]) => number> = {
      name: (a, b) => a.name.localeCompare(b.name),
      appreciation: (a, b) => b.appreciation - a.appreciation,
      price: (a, b) => b.retailPrice - a.retailPrice,
      ev: (a, b) => b.ev - a.ev,
      premium: (a, b) => b.premium - a.premium,
    };
    return [...list].sort(sorters[sortBy]);
  }, [catalog, sportFilter, searchTerm, sortBy]);

  // Vault portfolio analysis
  const portfolio = useMemo(() => {
    let totalInvested = 0;
    let totalCurrent = 0;
    const entries = vault.map(v => {
      const product = catalog.find(p => p.slug === v.slug);
      if (!product) return null;
      const invested = v.purchasePrice * v.quantity;
      const current = product.sealedValue * v.quantity;
      const roi = invested > 0 ? Math.round((current / invested - 1) * 100) : 0;
      totalInvested += invested;
      totalCurrent += current;
      return { ...v, product, invested, current, roi };
    }).filter(Boolean) as { slug: string; purchasePrice: number; quantity: number; addedAt: string; product: typeof catalog[0]; invested: number; current: number; roi: number }[];

    const totalROI = totalInvested > 0 ? Math.round((totalCurrent / totalInvested - 1) * 100) : 0;
    const bestPerformer = entries.length > 0 ? entries.reduce((a, b) => a.roi > b.roi ? a : b) : null;
    const worstPerformer = entries.length > 0 ? entries.reduce((a, b) => a.roi < b.roi ? a : b) : null;

    return { entries, totalInvested, totalCurrent, totalROI, bestPerformer, worstPerformer };
  }, [vault, catalog]);

  // Stats
  const stats = useMemo(() => {
    const holdCount = catalog.filter(p => p.signal === 'HOLD').length;
    const ripCount = catalog.filter(p => p.signal === 'RIP IT').length;
    const avgAppreciation = catalog.length > 0 ? Math.round(catalog.reduce((s, p) => s + p.appreciation, 0) / catalog.length) : 0;
    const topAppreciator = catalog.reduce((a, b) => a.appreciation > b.appreciation ? a : b, catalog[0]);
    return { holdCount, ripCount, avgAppreciation, topAppreciator, total: catalog.length };
  }, [catalog]);

  return (
    <div className="space-y-6">
      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{stats.total}</div>
          <div className="text-xs text-gray-400 mt-1">Products Tracked</div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400">+{stats.avgAppreciation}%</div>
          <div className="text-xs text-gray-400 mt-1">Avg Appreciation</div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400">{stats.holdCount}</div>
          <div className="text-xs text-gray-400 mt-1">HOLD Signals</div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-red-400">{stats.ripCount}</div>
          <div className="text-xs text-gray-400 mt-1">RIP IT Signals</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-700/50 pb-1">
        {(['browse', 'vault', 'analysis'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
              tab === t ? 'bg-indigo-900/60 text-indigo-300 border border-b-0 border-indigo-700/50' : 'text-gray-400 hover:text-white'
            }`}
          >
            {t === 'browse' ? `Browse (${stats.total})` : t === 'vault' ? `My Vault (${vault.length})` : 'Analysis'}
          </button>
        ))}
      </div>

      {/* ── BROWSE TAB ─────────────────────────────────── */}
      {tab === 'browse' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-800/60 border border-gray-700/50 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
            <select
              value={sportFilter}
              onChange={e => setSportFilter(e.target.value as SportFilter)}
              className="px-3 py-2 bg-gray-800/60 border border-gray-700/50 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Sports</option>
              <option value="baseball">Baseball</option>
              <option value="basketball">Basketball</option>
              <option value="football">Football</option>
              <option value="hockey">Hockey</option>
              <option value="pokemon">Pokemon</option>
            </select>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortBy)}
              className="px-3 py-2 bg-gray-800/60 border border-gray-700/50 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="appreciation">Appreciation</option>
              <option value="premium">Sealed Premium</option>
              <option value="price">Retail Price</option>
              <option value="ev">Expected Value</option>
              <option value="name">Name</option>
            </select>
          </div>

          {/* Product Grid */}
          <div className="grid gap-3">
            {filteredCatalog.map(p => (
              <div key={p.slug} className={`border rounded-xl p-4 ${SPORT_BG[p.sport] ?? 'bg-gray-800/50 border-gray-700/50'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  {/* Left: Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-medium uppercase ${SPORT_COLORS[p.sport] ?? 'text-gray-400'}`}>
                        {p.sport}
                      </span>
                      <span className="text-xs text-gray-500">{TYPE_LABELS[p.type] ?? p.type}</span>
                      <span className="text-xs text-gray-500">{p.year}</span>
                    </div>
                    <h3 className="text-white font-semibold mt-1 truncate">{p.name}</h3>
                    <p className="text-gray-400 text-xs mt-1 line-clamp-1">{p.description}</p>
                  </div>

                  {/* Middle: Metrics */}
                  <div className="flex gap-4 text-center">
                    <div>
                      <div className="text-xs text-gray-500">Retail</div>
                      <div className="text-white font-medium">${p.retailPrice}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Market Est.</div>
                      <div className="text-emerald-400 font-medium">${p.sealedValue.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Appreciation</div>
                      <div className={`font-medium ${p.appreciation >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {p.appreciation >= 0 ? '+' : ''}{p.appreciation}%
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Rip EV</div>
                      <div className="text-yellow-400 font-medium">${p.ev.toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Right: Signal + Add */}
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${SIGNAL_STYLES[p.signal]}`}>
                      {p.signal}
                    </span>
                    {addingSlug === p.slug ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          placeholder="Price"
                          value={addPrice}
                          onChange={e => setAddPrice(e.target.value)}
                          className="w-20 px-2 py-1 bg-gray-900 border border-gray-600 rounded text-white text-xs focus:outline-none focus:border-indigo-500"
                          autoFocus
                        />
                        <input
                          type="number"
                          placeholder="Qty"
                          value={addQty}
                          onChange={e => setAddQty(e.target.value)}
                          className="w-14 px-2 py-1 bg-gray-900 border border-gray-600 rounded text-white text-xs focus:outline-none focus:border-indigo-500"
                        />
                        <button onClick={addToVault} className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded font-medium transition-colors">Add</button>
                        <button onClick={() => setAddingSlug(null)} className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors">X</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setAddingSlug(p.slug); setAddPrice(String(p.retailPrice)); }}
                        className="px-3 py-1.5 bg-indigo-600/80 hover:bg-indigo-500 text-white text-xs rounded-lg font-medium transition-colors"
                      >
                        + Vault
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── VAULT TAB ──────────────────────────────────── */}
      {tab === 'vault' && (
        <div className="space-y-4">
          {vault.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">&#128230;</div>
              <h3 className="text-white font-semibold text-lg">Your Sealed Wax Vault is Empty</h3>
              <p className="text-gray-400 text-sm mt-2 max-w-md mx-auto">
                Browse the catalog and add sealed products you own. Track appreciation and get rip-or-hold signals for your collection.
              </p>
              <button onClick={() => setTab('browse')} className="mt-4 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors">
                Browse Products
              </button>
            </div>
          ) : (
            <>
              {/* Portfolio Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-indigo-950/40 border border-indigo-800/50 rounded-xl p-4 text-center">
                  <div className="text-xs text-indigo-400 mb-1">Total Invested</div>
                  <div className="text-xl font-bold text-white">${portfolio.totalInvested.toLocaleString()}</div>
                </div>
                <div className="bg-indigo-950/40 border border-indigo-800/50 rounded-xl p-4 text-center">
                  <div className="text-xs text-indigo-400 mb-1">Current Value</div>
                  <div className="text-xl font-bold text-emerald-400">${portfolio.totalCurrent.toLocaleString()}</div>
                </div>
                <div className="bg-indigo-950/40 border border-indigo-800/50 rounded-xl p-4 text-center">
                  <div className="text-xs text-indigo-400 mb-1">Total P&amp;L</div>
                  <div className={`text-xl font-bold ${portfolio.totalCurrent - portfolio.totalInvested >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {portfolio.totalCurrent - portfolio.totalInvested >= 0 ? '+' : ''}${(portfolio.totalCurrent - portfolio.totalInvested).toLocaleString()}
                  </div>
                </div>
                <div className="bg-indigo-950/40 border border-indigo-800/50 rounded-xl p-4 text-center">
                  <div className="text-xs text-indigo-400 mb-1">Portfolio ROI</div>
                  <div className={`text-xl font-bold ${portfolio.totalROI >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {portfolio.totalROI >= 0 ? '+' : ''}{portfolio.totalROI}%
                  </div>
                </div>
              </div>

              {/* Best / Worst */}
              {portfolio.bestPerformer && portfolio.worstPerformer && portfolio.entries.length > 1 && (
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-3">
                    <div className="text-xs text-emerald-400 font-medium mb-1">Best Performer</div>
                    <div className="text-white font-semibold text-sm">{portfolio.bestPerformer.product.name}</div>
                    <div className="text-emerald-400 text-sm font-bold">+{portfolio.bestPerformer.roi}% ROI</div>
                  </div>
                  <div className="bg-red-950/30 border border-red-800/40 rounded-xl p-3">
                    <div className="text-xs text-red-400 font-medium mb-1">Worst Performer</div>
                    <div className="text-white font-semibold text-sm">{portfolio.worstPerformer.product.name}</div>
                    <div className={`text-sm font-bold ${portfolio.worstPerformer.roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {portfolio.worstPerformer.roi >= 0 ? '+' : ''}{portfolio.worstPerformer.roi}% ROI
                    </div>
                  </div>
                </div>
              )}

              {/* Vault Entries */}
              <div className="space-y-3">
                {portfolio.entries.map((entry, idx) => (
                  <div key={`${entry.slug}-${idx}`} className={`border rounded-xl p-4 ${SPORT_BG[entry.product.sport] ?? 'bg-gray-800/50 border-gray-700/50'}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium uppercase ${SPORT_COLORS[entry.product.sport]}`}>{entry.product.sport}</span>
                          <span className="text-xs text-gray-500">{TYPE_LABELS[entry.product.type]}</span>
                          <span className="text-xs text-gray-500">x{entry.quantity}</span>
                        </div>
                        <h3 className="text-white font-semibold mt-1 truncate">{entry.product.name}</h3>
                      </div>

                      <div className="flex gap-4 text-center">
                        <div>
                          <div className="text-xs text-gray-500">Paid</div>
                          <div className="text-white font-medium">${entry.invested.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Value</div>
                          <div className="text-emerald-400 font-medium">${entry.current.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">ROI</div>
                          <div className={`font-medium ${entry.roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {entry.roi >= 0 ? '+' : ''}{entry.roi}%
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Signal</div>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${SIGNAL_STYLES[entry.product.signal]}`}>
                            {entry.product.signal}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => removeFromVault(idx)}
                        className="px-3 py-1.5 bg-red-900/40 hover:bg-red-800/60 text-red-300 text-xs rounded-lg font-medium transition-colors border border-red-800/40"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── ANALYSIS TAB ───────────────────────────────── */}
      {tab === 'analysis' && (
        <div className="space-y-6">
          {/* Top Appreciators */}
          <div>
            <h3 className="text-white font-semibold mb-3">Top 10 Most Appreciated Products</h3>
            <div className="space-y-2">
              {[...catalog].sort((a, b) => b.appreciation - a.appreciation).slice(0, 10).map((p, i) => (
                <div key={p.slug} className="flex items-center gap-3 bg-gray-800/40 border border-gray-700/30 rounded-lg p-3">
                  <span className="text-gray-500 text-sm font-mono w-6 text-right">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium truncate">{p.name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs ${SPORT_COLORS[p.sport]}`}>{p.sport}</span>
                      <span className="text-xs text-gray-500">${p.retailPrice} MSRP &rarr; ${p.sealedValue.toLocaleString()} est.</span>
                    </div>
                  </div>
                  <div className="text-emerald-400 font-bold text-sm">+{p.appreciation}%</div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${SIGNAL_STYLES[p.signal]}`}>{p.signal}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Best Rip Values */}
          <div>
            <h3 className="text-white font-semibold mb-3">Best Products to Rip (EV vs Market)</h3>
            <div className="space-y-2">
              {[...catalog].sort((a, b) => a.premium - b.premium).slice(0, 10).map((p, i) => (
                <div key={p.slug} className="flex items-center gap-3 bg-gray-800/40 border border-gray-700/30 rounded-lg p-3">
                  <span className="text-gray-500 text-sm font-mono w-6 text-right">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium truncate">{p.name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs ${SPORT_COLORS[p.sport]}`}>{p.sport}</span>
                      <span className="text-xs text-gray-500">EV ${p.ev.toLocaleString()} | Market ${p.sealedValue.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className={`font-bold text-sm ${p.premium <= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {p.premium > 0 ? '+' : ''}{p.premium}% premium
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${SIGNAL_STYLES[p.signal]}`}>{p.signal}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sport Breakdown */}
          <div>
            <h3 className="text-white font-semibold mb-3">Average Appreciation by Sport</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {(['baseball', 'basketball', 'football', 'hockey', 'pokemon'] as const).map(sport => {
                const sportProds = catalog.filter(p => p.sport === sport);
                const avgApp = sportProds.length > 0 ? Math.round(sportProds.reduce((s, p) => s + p.appreciation, 0) / sportProds.length) : 0;
                const count = sportProds.length;
                return (
                  <div key={sport} className={`border rounded-xl p-3 text-center ${SPORT_BG[sport]}`}>
                    <div className={`text-xs font-medium uppercase mb-1 ${SPORT_COLORS[sport]}`}>{sport}</div>
                    <div className="text-xl font-bold text-white">+{avgApp}%</div>
                    <div className="text-xs text-gray-400 mt-0.5">{count} products</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Type Breakdown */}
          <div>
            <h3 className="text-white font-semibold mb-3">Average Appreciation by Product Type</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(TYPE_LABELS).map(([type, label]) => {
                const typeProds = catalog.filter(p => p.type === type);
                if (typeProds.length === 0) return null;
                const avgApp = Math.round(typeProds.reduce((s, p) => s + p.appreciation, 0) / typeProds.length);
                return (
                  <div key={type} className="bg-gray-800/40 border border-gray-700/30 rounded-xl p-3 text-center">
                    <div className="text-xs text-gray-400 mb-1">{label}</div>
                    <div className="text-xl font-bold text-emerald-400">+{avgApp}%</div>
                    <div className="text-xs text-gray-400 mt-0.5">{typeProds.length} products</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Internal Links */}
      <div className="border-t border-gray-700/50 pt-6 mt-8">
        <h3 className="text-white font-semibold mb-3">Related Tools</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { href: '/tools/sealed-ev', label: 'Sealed Product EV Calculator' },
            { href: '/tools/rip-or-hold', label: 'Rip or Hold Calculator' },
            { href: '/tools/sealed-yield', label: 'Sealed Yield Tracker' },
            { href: '/vault', label: 'My Card Vault' },
            { href: '/tools/box-break', label: 'Box Break Calculator' },
            { href: '/packs', label: 'Pack Store' },
          ].map(link => (
            <Link key={link.href} href={link.href} className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors">
              {link.label} &rarr;
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
