'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { sportsCards } from '@/data/sports-cards';

/* ── types ───────────────────────────────────────────────────────── */

type SignalType = 'hot' | 'cold' | 'new' | 'sale';
type Sport = 'all' | 'baseball' | 'basketball' | 'football' | 'hockey';

interface Signal {
  id: string;
  player: string;
  card: string;
  sport: string;
  type: SignalType;
  price: string;
  change?: string;
  detail: string;
  angle: number;   // 0-360 position on radar
  distance: number; // 0-1 distance from center (0 = center, 1 = edge)
  timestamp: number;
}

/* ── constants ───────────────────────────────────────────────────── */

const SIGNAL_CONFIG: Record<SignalType, { label: string; color: string; bgColor: string; borderColor: string; dotColor: string }> = {
  hot:  { label: 'HOT',  color: 'text-red-400',   bgColor: 'bg-red-900/30',   borderColor: 'border-red-800/50',   dotColor: '#ef4444' },
  cold: { label: 'COLD', color: 'text-blue-400',  bgColor: 'bg-blue-900/30',  borderColor: 'border-blue-800/50',  dotColor: '#3b82f6' },
  new:  { label: 'NEW',  color: 'text-green-400', bgColor: 'bg-green-900/30', borderColor: 'border-green-800/50', dotColor: '#22c55e' },
  sale: { label: 'SALE', color: 'text-amber-400', bgColor: 'bg-amber-900/30', borderColor: 'border-amber-800/50', dotColor: '#f59e0b' },
};

const SPORT_COLORS: Record<string, string> = {
  baseball: '#ef4444',
  basketball: '#f97316',
  football: '#22c55e',
  hockey: '#3b82f6',
};

const HOT_DETAILS = [
  'Price spike detected — up {pct}% in 24h',
  'Trending on social media — demand surge',
  'Breakout game triggered buying frenzy',
  'Award announcement driving prices up',
  'Recent trade boosted card values',
  'Playoff performance spike',
  'Grading pop report low — scarcity premium',
];

const COLD_DETAILS = [
  'Price cooling — down {pct}% this week',
  'Post-hype correction underway',
  'Injury report affecting card values',
  'Increased supply from PSA returns',
  'Off-season dip in progress',
  'Market correction — buy opportunity?',
];

const NEW_DETAILS = [
  'New listing spotted on eBay',
  'Fresh submission returned from PSA',
  'New product release featuring this player',
  'First listing of this parallel seen',
  'Newly graded — just hit the market',
];

const SALE_DETAILS = [
  'Sold on eBay for {price}',
  'Auction closed at {price}',
  'Buy It Now accepted — {price}',
  'Whatnot auction ended at {price}',
  'Card show sale reported — {price}',
];

/* ── helpers ──────────────────────────────────────────────────────── */

function parseEstValue(v: string): number {
  const m = v.match(/\$([0-9,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 5;
}

function generateSignal(filter: Sport): Signal {
  const pool = filter === 'all'
    ? sportsCards
    : sportsCards.filter(c => c.sport === filter);
  const card = pool[Math.floor(Math.random() * pool.length)];
  const types: SignalType[] = ['hot', 'cold', 'new', 'sale'];
  const weights = [0.3, 0.2, 0.25, 0.25]; // hot signals slightly more common
  let r = Math.random();
  let type: SignalType = 'new';
  for (let i = 0; i < types.length; i++) {
    r -= weights[i];
    if (r <= 0) { type = types[i]; break; }
  }

  const baseVal = parseEstValue(card.estimatedValueGem);
  const pct = Math.floor(Math.random() * 35) + 5;
  const price = `$${baseVal}`;

  let detailPool: string[];
  let change: string | undefined;
  switch (type) {
    case 'hot':
      detailPool = HOT_DETAILS;
      change = `+${pct}%`;
      break;
    case 'cold':
      detailPool = COLD_DETAILS;
      change = `-${pct}%`;
      break;
    case 'new':
      detailPool = NEW_DETAILS;
      break;
    case 'sale':
      detailPool = SALE_DETAILS;
      break;
  }

  const detail = detailPool[Math.floor(Math.random() * detailPool.length)]
    .replace('{pct}', String(pct))
    .replace('{price}', price);

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    player: card.player,
    card: card.name,
    sport: card.sport,
    type,
    price,
    change,
    detail,
    angle: Math.random() * 360,
    distance: 0.2 + Math.random() * 0.7,
    timestamp: Date.now(),
  };
}

/* ── radar SVG ───────────────────────────────────────────────────── */

function RadarSVG({ signals, sweepAngle }: { signals: Signal[]; sweepAngle: number }) {
  const size = 300;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 10;

  // Sweep line
  const sweepRad = (sweepAngle * Math.PI) / 180;
  const sx = cx + r * Math.cos(sweepRad);
  const sy = cy + r * Math.sin(sweepRad);

  // Sweep gradient arc (trailing)
  const trailAngle = 60;
  const startAngle = sweepAngle - trailAngle;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[300px] mx-auto">
      {/* Background rings */}
      {[0.25, 0.5, 0.75, 1].map(s => (
        <circle key={s} cx={cx} cy={cy} r={r * s} fill="none" stroke="#1f2937" strokeWidth="0.5" opacity="0.5" />
      ))}

      {/* Cross hairs */}
      <line x1={cx} y1={10} x2={cx} y2={size - 10} stroke="#1f2937" strokeWidth="0.5" opacity="0.5" />
      <line x1={10} y1={cy} x2={size - 10} y2={cy} stroke="#1f2937" strokeWidth="0.5" opacity="0.5" />

      {/* Sweep trail gradient */}
      <defs>
        <radialGradient id="sweepGlow">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Sweep trail */}
      {(() => {
        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (sweepAngle * Math.PI) / 180;
        const x1 = cx + r * Math.cos(startRad);
        const y1 = cy + r * Math.sin(startRad);
        const x2 = cx + r * Math.cos(endRad);
        const y2 = cy + r * Math.sin(endRad);
        return (
          <path
            d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 0,1 ${x2},${y2} Z`}
            fill="#22c55e"
            opacity="0.08"
          />
        );
      })()}

      {/* Sweep line */}
      <line x1={cx} y1={cy} x2={sx} y2={sy} stroke="#22c55e" strokeWidth="1.5" opacity="0.6" />

      {/* Signal dots */}
      {signals.slice(-20).map(sig => {
        const age = (Date.now() - sig.timestamp) / 1000;
        const opacity = Math.max(0.2, 1 - age / 30);
        const rad = (sig.angle * Math.PI) / 180;
        const dist = sig.distance * r;
        const px = cx + dist * Math.cos(rad);
        const py = cy + dist * Math.sin(rad);
        const color = SIGNAL_CONFIG[sig.type].dotColor;
        const pulseR = 3 + (age < 5 ? Math.sin(age * 3) * 2 : 0);
        return (
          <g key={sig.id}>
            {age < 5 && (
              <circle cx={px} cy={py} r={pulseR + 3} fill={color} opacity={opacity * 0.2} />
            )}
            <circle cx={px} cy={py} r={pulseR} fill={color} opacity={opacity} />
          </g>
        );
      })}

      {/* Center dot */}
      <circle cx={cx} cy={cy} r="3" fill="#22c55e" opacity="0.8" />

      {/* Labels */}
      <text x={cx} y="8" textAnchor="middle" fill="#6b7280" fontSize="8" fontFamily="monospace">N</text>
      <text x={size - 6} y={cy + 3} textAnchor="middle" fill="#6b7280" fontSize="8" fontFamily="monospace">E</text>
      <text x={cx} y={size - 2} textAnchor="middle" fill="#6b7280" fontSize="8" fontFamily="monospace">S</text>
      <text x={6} y={cy + 3} textAnchor="middle" fill="#6b7280" fontSize="8" fontFamily="monospace">W</text>
    </svg>
  );
}

/* ── component ───────────────────────────────────────────────────── */

export default function MarketRadarClient() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [sport, setSport] = useState<Sport>('all');
  const [paused, setPaused] = useState(false);
  const [sweepAngle, setSweepAngle] = useState(0);
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
  const animRef = useRef<number>(0);

  // Counts
  const hotCount = signals.filter(s => s.type === 'hot').length;
  const coldCount = signals.filter(s => s.type === 'cold').length;
  const newCount = signals.filter(s => s.type === 'new').length;
  const saleCount = signals.filter(s => s.type === 'sale').length;

  // Sweep animation
  useEffect(() => {
    let lastTime = 0;
    const animate = (time: number) => {
      if (lastTime) {
        const delta = time - lastTime;
        setSweepAngle(prev => (prev + delta * 0.09) % 360);
      }
      lastTime = time;
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  // Signal generation
  const addSignal = useCallback(() => {
    if (paused) return;
    const sig = generateSignal(sport);
    setSignals(prev => [...prev.slice(-49), sig]);
  }, [sport, paused]);

  useEffect(() => {
    // Add initial batch
    const initial = Array.from({ length: 8 }, () => generateSignal(sport));
    setSignals(initial);
  }, [sport]);

  useEffect(() => {
    const interval = setInterval(addSignal, 3000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, [addSignal]);

  return (
    <div>
      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Hot Signals', value: hotCount, color: 'text-red-400' },
          { label: 'Cold Signals', value: coldCount, color: 'text-blue-400' },
          { label: 'New Listings', value: newCount, color: 'text-green-400' },
          { label: 'Sales', value: saleCount, color: 'text-amber-400' },
        ].map(s => (
          <div key={s.label} className="bg-gray-900/60 border border-gray-800 rounded-lg p-3 text-center">
            <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
            <div className="text-gray-500 text-xs">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex flex-wrap gap-2">
          {(['all', 'baseball', 'basketball', 'football', 'hockey'] as Sport[]).map(s => (
            <button
              key={s}
              onClick={() => { setSport(s); setSignals([]); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                sport === s
                  ? 'bg-green-900/50 text-green-300 border border-green-700/50'
                  : 'bg-gray-900/50 text-gray-500 border border-gray-800 hover:border-gray-700'
              }`}
            >
              {s === 'all' ? 'All Sports' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <button
          onClick={() => setPaused(!paused)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            paused
              ? 'bg-amber-900/50 text-amber-300 border border-amber-700/50'
              : 'bg-gray-900/50 text-gray-500 border border-gray-800 hover:border-gray-700'
          }`}
        >
          {paused ? 'Resume' : 'Pause'}
        </button>
      </div>

      {/* Radar + Feed Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Radar */}
        <div className="bg-gray-950/80 border border-gray-800 rounded-xl p-6">
          <div className="text-center mb-3">
            <div className="text-gray-400 text-xs font-medium tracking-wider uppercase">Market Radar</div>
            <div className="text-gray-600 text-[10px]">{signals.length} signals detected</div>
          </div>
          <RadarSVG signals={signals} sweepAngle={sweepAngle} />
          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {(['hot', 'cold', 'new', 'sale'] as SignalType[]).map(t => (
              <div key={t} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: SIGNAL_CONFIG[t].dotColor }} />
                <span className="text-gray-500 text-xs">{SIGNAL_CONFIG[t].label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-gray-950/80 border border-gray-800 rounded-xl p-4 max-h-[420px] overflow-y-auto">
          <div className="text-gray-400 text-xs font-medium tracking-wider uppercase mb-3">Live Activity Feed</div>
          <div className="space-y-2">
            {[...signals].reverse().slice(0, 20).map(sig => (
              <button
                key={sig.id}
                onClick={() => setSelectedSignal(selectedSignal?.id === sig.id ? null : sig)}
                className={`w-full text-left border rounded-lg p-3 transition-colors ${SIGNAL_CONFIG[sig.type].bgColor} ${SIGNAL_CONFIG[sig.type].borderColor} hover:brightness-125`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${SIGNAL_CONFIG[sig.type].color} bg-gray-950/50`}>
                      {SIGNAL_CONFIG[sig.type].label}
                    </span>
                    <span className="text-white text-sm font-medium truncate max-w-[140px]">{sig.player}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {sig.change && (
                      <span className={`text-xs font-bold ${sig.type === 'hot' ? 'text-red-400' : 'text-blue-400'}`}>
                        {sig.change}
                      </span>
                    )}
                    <span className="text-gray-400 text-xs">{sig.price}</span>
                  </div>
                </div>
                <div className="text-gray-500 text-xs">{sig.detail}</div>
                {selectedSignal?.id === sig.id && (
                  <div className="mt-2 pt-2 border-t border-gray-800/50">
                    <div className="text-gray-400 text-xs">{sig.card}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: SPORT_COLORS[sig.sport] }} />
                      <span className="text-gray-500 text-xs capitalize">{sig.sport}</span>
                    </div>
                  </div>
                )}
              </button>
            ))}
            {signals.length === 0 && (
              <div className="text-center py-8 text-gray-600 text-sm">
                Scanning for signals...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Signal Summary */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4 mb-6">
        <h3 className="text-white font-medium text-sm mb-3">How to Read the Radar</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { type: 'hot' as const, desc: 'Price spikes, trending demand, breakout performances. Cards moving UP fast.' },
            { type: 'cold' as const, desc: 'Price corrections, cooling interest, post-hype dips. Potential buying opportunities.' },
            { type: 'new' as const, desc: 'Fresh listings, new grading returns, product releases. First-mover alerts.' },
            { type: 'sale' as const, desc: 'Completed transactions, auction results, confirmed sales. Market price confirmations.' },
          ].map(item => (
            <div key={item.type} className="flex gap-3">
              <span className="w-3 h-3 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: SIGNAL_CONFIG[item.type].dotColor }} />
              <div>
                <div className={`text-xs font-bold ${SIGNAL_CONFIG[item.type].color}`}>{SIGNAL_CONFIG[item.type].label}</div>
                <div className="text-gray-500 text-xs">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pro Tips */}
      <div className="bg-green-950/20 border border-green-800/30 rounded-lg p-4">
        <h3 className="text-green-400 font-medium text-sm mb-2">Radar Pro Tips</h3>
        <ul className="space-y-1.5">
          {[
            'Watch for clusters of HOT signals on the same player — indicates strong momentum',
            'COLD signals often precede buying opportunities — contrarian collectors buy the dip',
            'NEW signals in the morning often mean overnight grading returns or listing drops',
            'SALE signals confirm true market prices — more reliable than asking prices',
            'Use sport filters during game seasons to focus on active markets',
          ].map((tip, i) => (
            <li key={i} className="text-gray-400 text-xs flex items-start gap-2">
              <span className="text-green-500 mt-0.5">&#8226;</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
