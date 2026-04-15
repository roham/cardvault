'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

/* ─── types ─── */
type AlertType = 'spike' | 'drop' | 'release' | 'auction' | 'grading';
type Sport = 'baseball' | 'basketball' | 'football' | 'hockey';

interface MarketAlert {
  id: string;
  type: AlertType;
  sport: Sport;
  title: string;
  body: string;
  cardSlug?: string;
  player?: string;
  magnitude: number; // 1-5 severity
  timestamp: number;
  read: boolean;
}

/* ─── helpers ─── */
function hashSeed(str: string, n: number): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return Math.abs(h + n);
}

function parseValue(est: string): number {
  const m = est.match(/\$([0-9,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) || 5 : 5;
}

function timeAgo(ts: number): string {
  const diff = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function fmt(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${n.toLocaleString()}`;
}

/* ─── alert generation ─── */
const ALERT_CONFIGS: Record<AlertType, { label: string; color: string; bg: string; border: string; icon: string }> = {
  spike:   { label: 'Price Spike',     color: 'text-emerald-400', bg: 'bg-emerald-950/40', border: 'border-emerald-800/40', icon: '📈' },
  drop:    { label: 'Price Drop',      color: 'text-red-400',     bg: 'bg-red-950/40',     border: 'border-red-800/40',     icon: '📉' },
  release: { label: 'New Release',     color: 'text-blue-400',    bg: 'bg-blue-950/40',    border: 'border-blue-800/40',    icon: '📦' },
  auction: { label: 'Auction Ending',  color: 'text-purple-400',  bg: 'bg-purple-950/40',  border: 'border-purple-800/40',  icon: '🔨' },
  grading: { label: 'Grading Result',  color: 'text-amber-400',   bg: 'bg-amber-950/40',   border: 'border-amber-800/40',   icon: '🏅' },
};

const SPIKE_REASONS = [
  'Strong game performance last night',
  'Trending on social media',
  'Named to All-Star roster',
  'Breakout playoff performance',
  'Award nomination announced',
  'Trade rumors heating up',
  'Return from injury confirmed',
  'Record-breaking stat line',
  'Viral highlight reel',
  'National TV appearance boost',
];

const DROP_REASONS = [
  'Injury report published',
  'Disappointing performance',
  'Off-field controversy',
  'Team eliminated from playoffs',
  'Seasonal demand decline',
  'Overproduction concerns',
  'Market correction after spike',
  'Trade to small-market team',
  'Prospect ranking downgrade',
  'Competing product release',
];

const RELEASE_PRODUCTS = [
  '2025 Topps Series 1',
  '2025 Panini Prizm',
  '2024-25 Upper Deck Series 2',
  '2025 Bowman Chrome',
  '2025 Panini Mosaic',
  '2025 Topps Chrome',
  '2025 Panini Select',
  '2025 Donruss Optic',
  '2024-25 Panini NBA Hoops',
  '2025 Topps Heritage',
];

const AUCTION_HOUSES = ['Heritage', 'Goldin', 'PWCC', 'eBay', 'Lelands', 'REA'];

const GRADES = ['PSA 10', 'PSA 9', 'BGS 9.5', 'BGS 10', 'CGC 9.5', 'SGC 10'];

function generateAlert(alertIdx: number, baseSeed: number): MarketAlert {
  const seed = hashSeed(String(baseSeed), alertIdx * 137 + 42);
  const types: AlertType[] = ['spike', 'drop', 'release', 'auction', 'grading'];
  const type = types[seed % types.length];

  const cardIdx = hashSeed(String(seed), 77) % sportsCards.length;
  const card = sportsCards[cardIdx];
  const sport = card.sport as Sport;
  const basePrice = parseValue(card.estimatedValueRaw || '$5');

  const ts = Date.now() - (alertIdx * 18000 + (seed % 12000)); // staggered timestamps

  let title = '';
  let body = '';
  let magnitude = 1;

  switch (type) {
    case 'spike': {
      const pct = 10 + (seed % 35);
      const dollarUp = Math.round(basePrice * pct / 100);
      const reason = SPIKE_REASONS[seed % SPIKE_REASONS.length];
      magnitude = pct > 30 ? 5 : pct > 20 ? 3 : 2;
      title = `${card.player} +${pct}%`;
      body = `${card.name} up ${fmt(dollarUp)} to ${fmt(basePrice + dollarUp)}. ${reason}.`;
      break;
    }
    case 'drop': {
      const pct = 8 + (seed % 25);
      const dollarDown = Math.round(basePrice * pct / 100);
      const reason = DROP_REASONS[seed % DROP_REASONS.length];
      magnitude = pct > 20 ? 4 : pct > 12 ? 2 : 1;
      title = `${card.player} -${pct}%`;
      body = `${card.name} down ${fmt(dollarDown)} to ${fmt(Math.max(1, basePrice - dollarDown))}. ${reason}. Buying opportunity?`;
      break;
    }
    case 'release': {
      const product = RELEASE_PRODUCTS[seed % RELEASE_PRODUCTS.length];
      magnitude = 3;
      title = `${product} — Now Available`;
      body = `${product} is hitting shelves. First pulls reported for ${card.player} cards. Early pricing: hobby box ${fmt(100 + (seed % 400))}.`;
      break;
    }
    case 'auction': {
      const house = AUCTION_HOUSES[seed % AUCTION_HOUSES.length];
      const grade = GRADES[seed % GRADES.length];
      const mins = 5 + (seed % 55);
      const currentBid = Math.round(basePrice * (1.2 + (seed % 30) / 10));
      magnitude = currentBid > 5000 ? 5 : currentBid > 1000 ? 3 : 2;
      title = `${card.player} — ${mins}min left`;
      body = `${card.name} ${grade} on ${house}. Current bid: ${fmt(currentBid)}. ${mins < 15 ? 'Final minutes!' : 'Active bidding.'}`;
      break;
    }
    case 'grading': {
      const grade = GRADES[seed % GRADES.length];
      const isGem = grade.includes('10');
      const popCount = 5 + (seed % 200);
      magnitude = isGem ? 4 : 2;
      title = `${card.player} — ${grade}`;
      body = `${card.name} returned as ${grade}. Pop ${popCount}. ${isGem ? 'Gem mint! Premium pricing applies.' : 'Solid grade. Fair market value: ' + fmt(basePrice) + '.'}`;
      break;
    }
  }

  return {
    id: `alert-${baseSeed}-${alertIdx}`,
    type,
    sport,
    title,
    body,
    cardSlug: card.slug,
    player: card.player,
    magnitude,
    timestamp: ts,
    read: false,
  };
}

/* ─── component ─── */
export default function MarketAlertsClient() {
  const [alerts, setAlerts] = useState<MarketAlert[]>([]);
  const [paused, setPaused] = useState(false);
  const [typeFilter, setTypeFilter] = useState<AlertType | 'all'>('all');
  const [sportFilter, setSportFilter] = useState<Sport | 'all'>('all');
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const alertCounterRef = useRef(0);
  const baseSeedRef = useRef(0);

  // Initialize with seed + historical alerts
  useEffect(() => {
    const now = new Date();
    const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
    baseSeedRef.current = seed;

    // Generate initial batch of 20 historical alerts
    const initial: MarketAlert[] = [];
    for (let i = 0; i < 20; i++) {
      initial.push(generateAlert(i, seed));
    }
    alertCounterRef.current = 20;
    setAlerts(initial.sort((a, b) => b.timestamp - a.timestamp));
    setUnreadCount(20);
  }, []);

  // New alert every 15-25 seconds when not paused
  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      const newAlert = generateAlert(alertCounterRef.current, baseSeedRef.current + alertCounterRef.current);
      newAlert.timestamp = Date.now();
      alertCounterRef.current += 1;
      setAlerts(prev => [newAlert, ...prev].slice(0, 100)); // keep max 100
      setUnreadCount(prev => prev + 1);
    }, 18000); // every 18 seconds
    return () => clearInterval(interval);
  }, [paused]);

  const filteredAlerts = useMemo(() => {
    return alerts.filter(a => {
      if (typeFilter !== 'all' && a.type !== typeFilter) return false;
      if (sportFilter !== 'all' && a.sport !== sportFilter) return false;
      return true;
    });
  }, [alerts, typeFilter, sportFilter]);

  const markAllRead = useCallback(() => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
    setUnreadCount(0);
  }, []);

  const alertStats = useMemo(() => {
    const counts: Record<AlertType, number> = { spike: 0, drop: 0, release: 0, auction: 0, grading: 0 };
    alerts.forEach(a => { counts[a.type]++; });
    return counts;
  }, [alerts]);

  return (
    <div className="space-y-6">
      {/* Status bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-800/50 border border-gray-700 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${paused ? 'bg-gray-500' : 'bg-emerald-400 animate-pulse'}`} />
          <span className="text-sm text-white font-medium">
            {paused ? 'Feed Paused' : 'Live Feed Active'}
          </span>
          {unreadCount > 0 && (
            <span className="bg-amber-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              soundEnabled
                ? 'bg-amber-900/50 border border-amber-700/50 text-amber-400'
                : 'bg-gray-700/50 border border-gray-600 text-gray-400'
            }`}
          >
            {soundEnabled ? '🔔 Sound On' : '🔕 Sound Off'}
          </button>
          <button
            onClick={() => setPaused(!paused)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              paused
                ? 'bg-emerald-900/50 border border-emerald-700/50 text-emerald-400'
                : 'bg-red-900/50 border border-red-700/50 text-red-400'
            }`}
          >
            {paused ? '▶ Resume' : '⏸ Pause'}
          </button>
          <button
            onClick={markAllRead}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-700/50 border border-gray-600 text-gray-400 hover:text-white transition-colors"
          >
            Mark All Read
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-5 gap-2">
        {(Object.entries(ALERT_CONFIGS) as [AlertType, typeof ALERT_CONFIGS[AlertType]][]).map(([type, config]) => (
          <button
            key={type}
            onClick={() => setTypeFilter(typeFilter === type ? 'all' : type)}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-center transition-all ${
              typeFilter === type
                ? `${config.bg} ${config.border} ring-1 ring-current ${config.color}`
                : 'bg-gray-800/30 border-gray-700/50 text-gray-500 hover:text-gray-300'
            }`}
          >
            <span className="text-lg">{config.icon}</span>
            <span className="text-xs font-medium truncate w-full">{config.label}</span>
            <span className="text-lg font-bold">{alertStats[type]}</span>
          </button>
        ))}
      </div>

      {/* Sport filter */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 mr-1">Sport:</span>
        {(['all', 'baseball', 'basketball', 'football', 'hockey'] as const).map(s => (
          <button
            key={s}
            onClick={() => setSportFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              sportFilter === s
                ? 'bg-white/10 text-white border border-white/20'
                : 'bg-gray-800/30 text-gray-500 border border-gray-700/50 hover:text-gray-300'
            }`}
          >
            {s === 'all' ? 'All Sports' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Alert feed */}
      <div className="space-y-2">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <div className="text-4xl mb-3">📭</div>
            <p className="font-medium">No alerts match your filters</p>
            <p className="text-sm mt-1">Try adjusting your type or sport filter</p>
          </div>
        ) : (
          filteredAlerts.map((alert, i) => {
            const config = ALERT_CONFIGS[alert.type];
            return (
              <div
                key={alert.id}
                className={`${config.bg} border ${config.border} rounded-xl p-4 transition-all ${
                  !alert.read ? 'ring-1 ring-white/10' : 'opacity-80'
                } ${i === 0 && !paused ? 'animate-[fadeIn_0.3s_ease-out]' : ''}`}
                style={i === 0 && !paused ? { animation: 'fadeIn 0.3s ease-out' } : undefined}
              >
                <div className="flex items-start gap-3">
                  {/* Icon + magnitude */}
                  <div className="flex flex-col items-center gap-1 min-w-[40px]">
                    <span className="text-2xl">{config.icon}</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <div
                          key={j}
                          className={`w-1 h-1 rounded-full ${
                            j < alert.magnitude ? config.color.replace('text-', 'bg-') : 'bg-gray-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
                      <span className="text-xs text-gray-600">|</span>
                      <span className="text-xs text-gray-500 capitalize">{alert.sport}</span>
                      <span className="text-xs text-gray-600">|</span>
                      <span className="text-xs text-gray-600">{timeAgo(alert.timestamp)}</span>
                      {!alert.read && (
                        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                      )}
                    </div>
                    <h3 className="text-white font-semibold text-sm mb-1 truncate">{alert.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{alert.body}</p>
                  </div>

                  {/* Action */}
                  {alert.cardSlug && (
                    <Link
                      href={`/cards/${alert.cardSlug}`}
                      className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium ${config.bg} border ${config.border} ${config.color} hover:brightness-125 transition-all`}
                    >
                      View
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Alert count footer */}
      {filteredAlerts.length > 0 && (
        <div className="text-center text-xs text-gray-600 py-2">
          Showing {filteredAlerts.length} of {alerts.length} alerts
          {typeFilter !== 'all' && ` (filtered: ${ALERT_CONFIGS[typeFilter].label})`}
          {sportFilter !== 'all' && ` (${sportFilter})`}
        </div>
      )}

      {/* How it works */}
      <section className="mt-10 bg-gray-800/30 border border-gray-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">How Market Alerts Work</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              icon: '📈',
              title: 'Price Spikes',
              desc: 'Cards up 10-45% in a day. Driven by player performance, news, or demand surges. Selling opportunity for holders.',
            },
            {
              icon: '📉',
              title: 'Price Drops',
              desc: 'Cards down 8-30%. Caused by injuries, off-field issues, or market corrections. Potential buying opportunity.',
            },
            {
              icon: '📦',
              title: 'New Releases',
              desc: 'Product drops hitting shelves. First pull reports, early pricing, and key cards to watch.',
            },
            {
              icon: '🔨',
              title: 'Auction Endings',
              desc: 'High-value auctions closing on Heritage, Goldin, PWCC, eBay. Final bid alerts and time warnings.',
            },
            {
              icon: '🏅',
              title: 'Grading Results',
              desc: 'Cards returning from PSA, BGS, CGC, SGC. Grade reveals, pop counts, and value implications.',
            },
            {
              icon: '⚡',
              title: 'Magnitude Scale',
              desc: '1-5 dot severity rating. Higher magnitude = bigger market impact. Filter by importance to see only major events.',
            },
          ].map(item => (
            <div key={item.title} className="bg-gray-900/50 rounded-lg p-4">
              <div className="text-xl mb-2">{item.icon}</div>
              <h3 className="text-sm font-semibold text-white mb-1">{item.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
