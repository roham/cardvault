'use client';

import { useState, useEffect, useMemo } from 'react';

type Sport = 'baseball' | 'basketball' | 'football' | 'hockey';
type ProductType = 'hobby' | 'retail' | 'premium';
type Signal = 'BUY' | 'HOLD' | 'SELL';

interface Product {
  id: string;
  name: string;
  sport: Sport;
  type: ProductType;
  year: number;
  retailPrice: number;
  baseMarketPrice: number;
  volatility: number; // 0.01-0.10
  hot: boolean;
}

const PRODUCTS: Product[] = [
  // Baseball
  { id: 'topps-s1-hobby', name: '2024 Topps Series 1 Hobby Box', sport: 'baseball', type: 'hobby', year: 2024, retailPrice: 90, baseMarketPrice: 105, volatility: 0.03, hot: false },
  { id: 'topps-chrome-hobby', name: '2024 Topps Chrome Hobby Box', sport: 'baseball', type: 'hobby', year: 2024, retailPrice: 200, baseMarketPrice: 240, volatility: 0.05, hot: true },
  { id: 'bowman-chrome-hobby', name: '2024 Bowman Chrome Hobby Box', sport: 'baseball', type: 'premium', year: 2024, retailPrice: 275, baseMarketPrice: 350, volatility: 0.06, hot: true },
  { id: 'topps-s1-blaster', name: '2024 Topps Series 1 Blaster', sport: 'baseball', type: 'retail', year: 2024, retailPrice: 30, baseMarketPrice: 28, volatility: 0.02, hot: false },
  { id: 'bowman-hobby', name: '2024 Bowman Hobby Box', sport: 'baseball', type: 'hobby', year: 2024, retailPrice: 200, baseMarketPrice: 225, volatility: 0.04, hot: false },
  { id: 'topps-heritage-hobby', name: '2024 Topps Heritage Hobby', sport: 'baseball', type: 'hobby', year: 2024, retailPrice: 105, baseMarketPrice: 95, volatility: 0.03, hot: false },
  // Basketball
  { id: 'prizm-hobby', name: '2024-25 Prizm Hobby Box', sport: 'basketball', type: 'premium', year: 2024, retailPrice: 600, baseMarketPrice: 750, volatility: 0.07, hot: true },
  { id: 'donruss-optic-hobby', name: '2024-25 Donruss Optic Hobby', sport: 'basketball', type: 'hobby', year: 2024, retailPrice: 250, baseMarketPrice: 280, volatility: 0.05, hot: false },
  { id: 'select-hobby', name: '2024-25 Select Hobby Box', sport: 'basketball', type: 'hobby', year: 2024, retailPrice: 350, baseMarketPrice: 400, volatility: 0.06, hot: false },
  { id: 'prizm-blaster', name: '2024-25 Prizm Blaster', sport: 'basketball', type: 'retail', year: 2024, retailPrice: 40, baseMarketPrice: 55, volatility: 0.04, hot: true },
  { id: 'nba-hoops-hobby', name: '2024-25 NBA Hoops Hobby', sport: 'basketball', type: 'hobby', year: 2024, retailPrice: 150, baseMarketPrice: 140, volatility: 0.03, hot: false },
  { id: 'court-kings-hobby', name: '2024-25 Court Kings Hobby', sport: 'basketball', type: 'premium', year: 2024, retailPrice: 300, baseMarketPrice: 320, volatility: 0.05, hot: false },
  // Football
  { id: 'prizm-fb-hobby', name: '2024 Prizm Football Hobby Box', sport: 'football', type: 'premium', year: 2024, retailPrice: 500, baseMarketPrice: 600, volatility: 0.06, hot: true },
  { id: 'donruss-fb-hobby', name: '2024 Donruss Football Hobby', sport: 'football', type: 'hobby', year: 2024, retailPrice: 200, baseMarketPrice: 190, volatility: 0.04, hot: false },
  { id: 'select-fb-hobby', name: '2024 Select Football Hobby', sport: 'football', type: 'hobby', year: 2024, retailPrice: 350, baseMarketPrice: 380, volatility: 0.05, hot: false },
  { id: 'optic-fb-hobby', name: '2024 Donruss Optic Football', sport: 'football', type: 'hobby', year: 2024, retailPrice: 250, baseMarketPrice: 270, volatility: 0.04, hot: false },
  { id: 'prizm-fb-blaster', name: '2024 Prizm Football Blaster', sport: 'football', type: 'retail', year: 2024, retailPrice: 40, baseMarketPrice: 48, volatility: 0.03, hot: false },
  { id: 'mosaic-fb-hobby', name: '2024 Mosaic Football Hobby', sport: 'football', type: 'hobby', year: 2024, retailPrice: 300, baseMarketPrice: 280, volatility: 0.04, hot: false },
  // Hockey
  { id: 'ud-series1-hobby', name: '2024-25 Upper Deck Series 1 Hobby', sport: 'hockey', type: 'hobby', year: 2024, retailPrice: 120, baseMarketPrice: 140, volatility: 0.04, hot: false },
  { id: 'ud-series2-hobby', name: '2024-25 Upper Deck Series 2 Hobby', sport: 'hockey', type: 'hobby', year: 2024, retailPrice: 120, baseMarketPrice: 130, volatility: 0.03, hot: false },
  { id: 'spx-hockey', name: '2024-25 SPx Hockey Hobby', sport: 'hockey', type: 'premium', year: 2024, retailPrice: 200, baseMarketPrice: 185, volatility: 0.05, hot: false },
  { id: 'ud-mvp-hobby', name: '2024-25 Upper Deck MVP Hobby', sport: 'hockey', type: 'retail', year: 2024, retailPrice: 60, baseMarketPrice: 55, volatility: 0.02, hot: false },
  { id: 'ud-artifacts', name: '2024-25 UD Artifacts Hobby', sport: 'hockey', type: 'hobby', year: 2024, retailPrice: 150, baseMarketPrice: 160, volatility: 0.04, hot: false },
  { id: 'young-guns-tin', name: '2024-25 Upper Deck Mega Tin', sport: 'hockey', type: 'retail', year: 2024, retailPrice: 35, baseMarketPrice: 42, volatility: 0.03, hot: true },
];

const SPORT_COLORS: Record<Sport, string> = {
  baseball: 'text-red-400',
  basketball: 'text-orange-400',
  football: 'text-green-400',
  hockey: 'text-blue-400',
};

const SPORT_BG: Record<Sport, string> = {
  baseball: 'bg-red-900/20 border-red-800/30',
  basketball: 'bg-orange-900/20 border-orange-800/30',
  football: 'bg-green-900/20 border-green-800/30',
  hockey: 'bg-blue-900/20 border-blue-800/30',
};

function hashSeed(str: string, day: number): number {
  let hash = 0;
  const s = str + day.toString();
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash) + s.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getPrice(product: Product, day: number): number {
  const seed = hashSeed(product.id, day);
  const rand = ((seed % 10000) / 10000) - 0.5; // -0.5 to 0.5
  const change = rand * product.volatility * product.baseMarketPrice;
  const drift = Math.sin(day * 0.1 + hashSeed(product.id, 0) * 0.01) * product.baseMarketPrice * 0.03;
  return Math.max(product.baseMarketPrice * 0.7, product.baseMarketPrice + change + drift);
}

function getSignal(currentPrice: number, prevPrice: number, retailPrice: number): Signal {
  const changeP = (currentPrice - prevPrice) / prevPrice;
  const vsRetail = (currentPrice - retailPrice) / retailPrice;

  if (vsRetail < -0.05 && changeP > -0.02) return 'BUY';
  if (vsRetail < 0.05 && changeP > 0.02) return 'BUY';
  if (vsRetail > 0.30 && changeP < 0) return 'SELL';
  if (changeP < -0.03) return 'SELL';
  return 'HOLD';
}

function signalStyle(s: Signal) {
  if (s === 'BUY') return 'bg-emerald-900/50 text-emerald-400 border-emerald-800/50';
  if (s === 'SELL') return 'bg-red-900/50 text-red-400 border-red-800/50';
  return 'bg-gray-800/50 text-gray-400 border-gray-700/50';
}

function fmt(n: number): string {
  return `$${n.toFixed(0)}`;
}

function fmtChange(n: number): string {
  const prefix = n >= 0 ? '+' : '';
  return `${prefix}${n.toFixed(1)}%`;
}

export default function WaxWatchClient() {
  const [sportFilter, setSportFilter] = useState<Sport | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<ProductType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'change' | 'price' | 'signal'>('change');
  const [now, setNow] = useState(0);

  useEffect(() => {
    setNow(Math.floor(Date.now() / 86400000));
  }, []);

  const data = useMemo(() => {
    if (!now) return [];
    return PRODUCTS.map(p => {
      const currentPrice = getPrice(p, now);
      const prevPrice = getPrice(p, now - 1);
      const weekAgoPrice = getPrice(p, now - 7);
      const dailyChange = ((currentPrice - prevPrice) / prevPrice) * 100;
      const weeklyChange = ((currentPrice - weekAgoPrice) / weekAgoPrice) * 100;
      const signal = getSignal(currentPrice, prevPrice, p.retailPrice);
      const vsRetail = ((currentPrice - p.retailPrice) / p.retailPrice) * 100;

      return { ...p, currentPrice, dailyChange, weeklyChange, signal, vsRetail };
    });
  }, [now]);

  const filtered = useMemo(() => {
    let items = data;
    if (sportFilter !== 'all') items = items.filter(p => p.sport === sportFilter);
    if (typeFilter !== 'all') items = items.filter(p => p.type === typeFilter);

    if (sortBy === 'change') items = [...items].sort((a, b) => b.dailyChange - a.dailyChange);
    else if (sortBy === 'price') items = [...items].sort((a, b) => b.currentPrice - a.currentPrice);
    else items = [...items].sort((a, b) => {
      const order = { BUY: 0, HOLD: 1, SELL: 2 };
      return order[a.signal] - order[b.signal];
    });

    return items;
  }, [data, sportFilter, typeFilter, sortBy]);

  const stats = useMemo(() => {
    const buys = data.filter(p => p.signal === 'BUY').length;
    const sells = data.filter(p => p.signal === 'SELL').length;
    const avgChange = data.length > 0 ? data.reduce((s, p) => s + p.dailyChange, 0) / data.length : 0;
    const hottest = [...data].sort((a, b) => b.dailyChange - a.dailyChange)[0];
    return { buys, sells, avgChange, hottest };
  }, [data]);

  if (!now) return null;

  return (
    <div>
      {/* Summary bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-white">{data.length}</div>
          <div className="text-gray-500 text-xs">Products</div>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-emerald-400">{stats.buys} BUY</div>
          <div className="text-gray-500 text-xs">Signals Today</div>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-3 text-center">
          <div className={`text-lg font-bold ${stats.avgChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmtChange(stats.avgChange)}</div>
          <div className="text-gray-500 text-xs">Avg Daily Move</div>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-orange-400">{stats.hottest?.name.split(' ').slice(0, 3).join(' ') || '—'}</div>
          <div className="text-gray-500 text-xs">Hottest Product</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <div className="flex gap-1 bg-gray-900/60 border border-gray-800 rounded-lg p-1">
          {(['all', 'baseball', 'basketball', 'football', 'hockey'] as const).map(s => (
            <button key={s} onClick={() => setSportFilter(s)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${sportFilter === s ? 'bg-orange-900/60 text-orange-300 border border-orange-700/40' : 'text-gray-400 hover:text-white'}`}>
              {s === 'all' ? 'All Sports' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-gray-900/60 border border-gray-800 rounded-lg p-1">
          {(['all', 'hobby', 'premium', 'retail'] as const).map(t => (
            <button key={t} onClick={() => setTypeFilter(t)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${typeFilter === t ? 'bg-orange-900/60 text-orange-300 border border-orange-700/40' : 'text-gray-400 hover:text-white'}`}>
              {t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-gray-900/60 border border-gray-800 rounded-lg p-1">
          {([['change', 'Daily Move'], ['price', 'Price'], ['signal', 'Signal']] as const).map(([v, l]) => (
            <button key={v} onClick={() => setSortBy(v as typeof sortBy)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${sortBy === v ? 'bg-orange-900/60 text-orange-300 border border-orange-700/40' : 'text-gray-400 hover:text-white'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Product list */}
      <div className="space-y-2">
        {filtered.map(p => (
          <div key={p.id} className={`border rounded-lg p-4 transition-colors ${SPORT_BG[p.sport]}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-medium text-sm truncate">{p.name}</span>
                  {p.hot && <span className="text-orange-400 text-xs bg-orange-950/50 border border-orange-800/40 px-1.5 py-0.5 rounded">HOT</span>}
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${signalStyle(p.signal)}`}>{p.signal}</span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
                  <span className={SPORT_COLORS[p.sport]}>{p.sport}</span>
                  <span>{p.type}</span>
                  <span>Retail: {fmt(p.retailPrice)}</span>
                  <span>vs Retail: <span className={p.vsRetail >= 0 ? 'text-emerald-400' : 'text-red-400'}>{fmtChange(p.vsRetail)}</span></span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-white font-bold text-lg">{fmt(p.currentPrice)}</div>
                <div className="flex items-center gap-2 justify-end">
                  <span className={`text-sm font-medium ${p.dailyChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {fmtChange(p.dailyChange)}
                  </span>
                  <span className="text-gray-600 text-xs">|</span>
                  <span className={`text-xs ${p.weeklyChange >= 0 ? 'text-emerald-400/60' : 'text-red-400/60'}`}>
                    7d: {fmtChange(p.weeklyChange)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-8 bg-gray-900/60 border border-gray-800 rounded-lg p-5">
        <h3 className="text-white font-semibold mb-3">Signal Guide</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded-full border bg-emerald-900/50 text-emerald-400 border-emerald-800/50">BUY</span>
            <span className="text-gray-400 text-xs">Price below value, positive momentum</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded-full border bg-gray-800/50 text-gray-400 border-gray-700/50">HOLD</span>
            <span className="text-gray-400 text-xs">Fair price, neutral momentum</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded-full border bg-red-900/50 text-red-400 border-red-800/50">SELL</span>
            <span className="text-gray-400 text-xs">Above value or negative momentum</span>
          </div>
        </div>
      </div>
    </div>
  );
}
