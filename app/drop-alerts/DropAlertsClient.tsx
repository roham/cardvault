'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/* ─── Types ──────────────────────────────────────────────── */
type AlertType = 'drop' | 'restock' | 'deal' | 'sold-out' | 'price-cut';

interface DropAlert {
  id: string;
  type: AlertType;
  product: string;
  sport: string;
  retailer: string;
  price: string;
  originalPrice?: string;
  timestamp: number;
  detail: string;
  hot: boolean;
}

/* ─── Data ───────────────────────────────────────────────── */
const SPORTS = ['baseball', 'basketball', 'football', 'hockey', 'pokemon'];

const RETAILERS = [
  'Target', 'Walmart', 'Fanatics', 'Steel City Collectibles', 'Blowout Cards',
  'Dave & Adam\'s', 'GTS Distribution', 'Sports Cards Plus', 'Topps.com',
  'Panini Direct', 'Upper Deck e-Pack', 'Card Titan', 'MVP Sports Cards',
  'Midwest Cards', 'Safari Zone', 'Pokemon Center',
];

const PRODUCTS: { name: string; sport: string; price: string; hot: boolean }[] = [
  { name: '2026 Topps Series 1 Hobby Box', sport: 'baseball', price: '$135', hot: true },
  { name: '2026 Topps Series 1 Blaster', sport: 'baseball', price: '$30', hot: false },
  { name: '2026 Topps Heritage Hobby Box', sport: 'baseball', price: '$105', hot: false },
  { name: '2026 Bowman Chrome Hobby Box', sport: 'baseball', price: '$350', hot: true },
  { name: '2025-26 Panini Prizm Basketball Hobby', sport: 'basketball', price: '$450', hot: true },
  { name: '2025-26 Panini Prizm Basketball Blaster', sport: 'basketball', price: '$35', hot: true },
  { name: '2025-26 Panini Select Basketball Hobby', sport: 'basketball', price: '$700', hot: false },
  { name: '2025-26 Panini Donruss Optic Basketball', sport: 'basketball', price: '$250', hot: false },
  { name: '2025 Panini Prizm Football Hobby', sport: 'football', price: '$500', hot: true },
  { name: '2025 Panini Prizm Football Blaster', sport: 'football', price: '$35', hot: true },
  { name: '2025 Panini Mosaic Football Hobby', sport: 'football', price: '$325', hot: false },
  { name: '2025 Panini Select Football Hobby', sport: 'football', price: '$550', hot: false },
  { name: '2024-25 Upper Deck Series 2 Hockey Hobby', sport: 'hockey', price: '$200', hot: false },
  { name: '2024-25 SP Authentic Hockey Hobby', sport: 'hockey', price: '$300', hot: true },
  { name: '2024-25 Upper Deck Extended Hockey Hobby', sport: 'hockey', price: '$175', hot: false },
  { name: 'Pokemon Prismatic Evolutions ETB', sport: 'pokemon', price: '$55', hot: true },
  { name: 'Pokemon Prismatic Evolutions Booster Bundle', sport: 'pokemon', price: '$30', hot: true },
  { name: 'Pokemon Scarlet & Violet 151 ETB', sport: 'pokemon', price: '$45', hot: true },
  { name: 'Pokemon Journey Together Booster Box', sport: 'pokemon', price: '$140', hot: false },
  { name: 'Pokemon Surging Sparks Booster Box', sport: 'pokemon', price: '$130', hot: false },
  { name: '2026 Topps Chrome Hobby Box', sport: 'baseball', price: '$275', hot: true },
  { name: '2025-26 Panini Prizm Basketball FOTL', sport: 'basketball', price: '$1,200', hot: true },
  { name: '2025 Panini National Treasures Football', sport: 'football', price: '$750', hot: true },
  { name: '2025 Panini Contenders Football Hobby', sport: 'football', price: '$325', hot: false },
];

const ALERT_TEMPLATES: { type: AlertType; templates: string[] }[] = [
  { type: 'drop', templates: [
    'Just went live! First come, first served.',
    'Release day drop. Limited allocation per store.',
    'Online exclusive release. Expected to sell fast.',
    'Pre-orders now open. Ships within 2 weeks.',
  ]},
  { type: 'restock', templates: [
    'Back in stock after 3-week drought. Limit 2 per customer.',
    'Restocked! Previous batch sold out in 12 minutes.',
    'Limited restock — online only. No rain checks.',
    'Small restock detected. Quantities extremely limited.',
  ]},
  { type: 'deal', templates: [
    'Below retail price detected. Buy-it-now deal.',
    'Bundle deal: buy 2 get 15% off.',
    'Clearance pricing — possible production overrun.',
    'Flash sale: 20% off for the next 4 hours.',
  ]},
  { type: 'sold-out', templates: [
    'Officially sold out at this retailer. Check secondary market.',
    'Gone in 8 minutes. Fastest sellout this month.',
    'Sold out online. Some in-store inventory may remain.',
    'Allocation exhausted. Next restock date TBD.',
  ]},
  { type: 'price-cut', templates: [
    'Price reduced from original retail. May indicate slow sales.',
    'Marked down 15%. Good entry point if you were on the fence.',
    'Price drop across multiple retailers. Market correction.',
    'New lower MSRP announced by manufacturer.',
  ]},
];

const TYPE_CONFIG: Record<AlertType, { label: string; color: string; border: string; bg: string; icon: string }> = {
  'drop': { label: 'NEW DROP', color: 'text-emerald-400', border: 'border-emerald-800/40', bg: 'bg-emerald-950/30', icon: '🟢' },
  'restock': { label: 'RESTOCK', color: 'text-blue-400', border: 'border-blue-800/40', bg: 'bg-blue-950/30', icon: '🔵' },
  'deal': { label: 'DEAL', color: 'text-amber-400', border: 'border-amber-800/40', bg: 'bg-amber-950/30', icon: '🟡' },
  'sold-out': { label: 'SOLD OUT', color: 'text-red-400', border: 'border-red-800/40', bg: 'bg-red-950/30', icon: '🔴' },
  'price-cut': { label: 'PRICE CUT', color: 'text-purple-400', border: 'border-purple-800/40', bg: 'bg-purple-950/30', icon: '🟣' },
};

const SPORT_ICONS: Record<string, string> = {
  baseball: '⚾', basketball: '🏀', football: '🏈', hockey: '🏒', pokemon: '⚡',
};

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateAlert(): DropAlert {
  const product = pickRandom(PRODUCTS);
  const types: AlertType[] = ['drop', 'restock', 'deal', 'sold-out', 'price-cut'];
  const type = pickRandom(types);
  const template = pickRandom(ALERT_TEMPLATES.find(t => t.type === type)!.templates);
  const retailer = pickRandom(RETAILERS);

  let price = product.price;
  let originalPrice: string | undefined;
  if (type === 'deal' || type === 'price-cut') {
    originalPrice = product.price;
    const numPrice = parseInt(product.price.replace(/[$,]/g, ''));
    const discount = Math.floor(numPrice * (0.1 + Math.random() * 0.2));
    price = `$${(numPrice - discount).toLocaleString()}`;
  }

  return {
    id: genId(),
    type,
    product: product.name,
    sport: product.sport,
    retailer,
    price,
    originalPrice,
    timestamp: Date.now() - Math.floor(Math.random() * 3600000),
    detail: template,
    hot: product.hot && (type === 'drop' || type === 'restock'),
  };
}

function timeAgo(ts: number): string {
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

/* ─── Component ──────────────────────────────────────────── */
export default function DropAlertsClient() {
  const [alerts, setAlerts] = useState<DropAlert[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [paused, setPaused] = useState(false);
  const [alertCount, setAlertCount] = useState(0);
  const pausedRef = useRef(paused);

  useEffect(() => { pausedRef.current = paused; }, [paused]);

  /* Initialize with alerts */
  useEffect(() => {
    const initial = Array.from({ length: 15 }, () => generateAlert())
      .sort((a, b) => b.timestamp - a.timestamp);
    setAlerts(initial);
    setAlertCount(15);
  }, []);

  /* Auto-generate new alerts */
  useEffect(() => {
    const interval = setInterval(() => {
      if (pausedRef.current) return;
      const newAlert = generateAlert();
      newAlert.timestamp = Date.now();
      setAlerts(prev => [newAlert, ...prev].slice(0, 50));
      setAlertCount(prev => prev + 1);
    }, 5000 + Math.random() * 8000);
    return () => clearInterval(interval);
  }, []);

  /* Filtered alerts */
  const filtered = alerts.filter(a => {
    if (filter !== 'all' && a.sport !== filter) return false;
    if (typeFilter !== 'all' && a.type !== typeFilter) return false;
    return true;
  });

  /* Stats */
  const stats = {
    total: alerts.length,
    drops: alerts.filter(a => a.type === 'drop').length,
    restocks: alerts.filter(a => a.type === 'restock').length,
    deals: alerts.filter(a => a.type === 'deal').length,
    soldOut: alerts.filter(a => a.type === 'sold-out').length,
  };

  return (
    <div className="space-y-6">
      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total Alerts', value: stats.total, color: 'text-white' },
          { label: 'New Drops', value: stats.drops, color: 'text-emerald-400' },
          { label: 'Restocks', value: stats.restocks, color: 'text-blue-400' },
          { label: 'Deals', value: stats.deals, color: 'text-amber-400' },
          { label: 'Sold Out', value: stats.soldOut, color: 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-3 text-center">
            <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
            <div className="text-slate-500 text-xs">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex flex-wrap gap-1.5">
          {['all', ...SPORTS].map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${filter === s ? 'bg-emerald-900/40 border-emerald-700/50 text-emerald-300' : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'}`}>
              {s === 'all' ? 'All Sports' : `${SPORT_ICONS[s] || ''} ${s.charAt(0).toUpperCase() + s.slice(1)}`}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {['all', 'drop', 'restock', 'deal', 'sold-out', 'price-cut'].map(t => {
            const cfg = t !== 'all' ? TYPE_CONFIG[t as AlertType] : null;
            return (
              <button key={t} onClick={() => setTypeFilter(t)} className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${typeFilter === t ? (cfg ? `${cfg.bg} ${cfg.border} ${cfg.color}` : 'bg-slate-700 border-slate-600 text-white') : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'}`}>
                {t === 'all' ? 'All Types' : cfg!.label}
              </button>
            );
          })}
        </div>
        <button onClick={() => setPaused(!paused)} className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ml-auto ${paused ? 'bg-amber-900/40 border-amber-700/50 text-amber-300' : 'bg-slate-800/60 border-slate-700 text-slate-400'}`}>
          {paused ? '▶ Resume' : '⏸ Pause'}
        </button>
      </div>

      {/* Alert feed */}
      <div className="space-y-2">
        {filtered.map(alert => {
          const cfg = TYPE_CONFIG[alert.type];
          return (
            <div key={alert.id} className={`${cfg.bg} border ${cfg.border} rounded-lg p-4 transition-all`}>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 text-lg">{cfg.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-xs font-bold ${cfg.color}`}>{cfg.label}</span>
                    {alert.hot && <span className="text-xs bg-red-900/60 text-red-400 px-1.5 py-0.5 rounded font-bold">HOT</span>}
                    <span className="text-slate-600 text-xs">{SPORT_ICONS[alert.sport]}</span>
                    <span className="text-slate-500 text-xs ml-auto flex-shrink-0">{timeAgo(alert.timestamp)}</span>
                  </div>
                  <h3 className="text-white font-medium text-sm mb-1">{alert.product}</h3>
                  <p className="text-slate-400 text-xs mb-2">{alert.detail}</p>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-500">{alert.retailer}</span>
                    <span className={`font-bold ${alert.type === 'sold-out' ? 'text-red-400 line-through' : cfg.color}`}>{alert.price}</span>
                    {alert.originalPrice && <span className="text-slate-600 line-through">{alert.originalPrice}</span>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-8 text-center">
          <div className="text-4xl mb-3">🔔</div>
          <h3 className="text-white font-bold text-lg mb-2">No Alerts Match</h3>
          <p className="text-slate-400 text-sm">Try adjusting your filters to see more alerts.</p>
        </div>
      )}
    </div>
  );
}
