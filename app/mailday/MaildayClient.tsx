'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { sportsCards } from '@/data/sports-cards';

type MailType = 'psa-return' | 'bgs-return' | 'cgc-return' | 'sgc-return' | 'ebay-delivery' | 'card-show-pickup' | 'break-shipment' | 'trade-arrival';
type SportFilter = 'all' | 'baseball' | 'basketball' | 'football' | 'hockey';

interface Collector {
  handle: string;
  avatar: string;
}

const COLLECTORS: Collector[] = [
  { handle: 'RookieHunter99', avatar: '🧢' },
  { handle: 'VaultDaddy', avatar: '🗝️' },
  { handle: 'SlabQueen', avatar: '👑' },
  { handle: 'PenniesToGrails', avatar: '🪙' },
  { handle: 'GradedGoose', avatar: '🪿' },
  { handle: 'CardMomLisa', avatar: '💝' },
  { handle: 'FatStackTony', avatar: '💰' },
  { handle: 'BinderBrent', avatar: '📚' },
  { handle: 'PackRipNick', avatar: '🎁' },
  { handle: 'FlipKing23', avatar: '🔄' },
  { handle: 'SealedSally', avatar: '📦' },
  { handle: 'GemMintGarv', avatar: '💎' },
  { handle: 'VintageVince', avatar: '🧓' },
  { handle: 'ShowFloorSam', avatar: '🎪' },
  { handle: 'MaildayMary', avatar: '📬' },
  { handle: 'SnipeMaster', avatar: '🎯' },
  { handle: 'NightOwlCards', avatar: '🦉' },
  { handle: 'QuietCloser', avatar: '🤫' },
];

interface MailTypeConfig {
  id: MailType;
  label: string;
  icon: string;
  accent: string;
  border: string;
  weight: number;
  verb: string;
  reactions: string[];
}

const MAIL_TYPES: MailTypeConfig[] = [
  {
    id: 'psa-return',
    label: 'PSA Return',
    icon: '🟥',
    accent: 'text-red-300',
    border: 'border-red-700/50 bg-red-950/30',
    weight: 22,
    verb: 'got back from PSA',
    reactions: [
      'Been waiting 8 months for this one.',
      'Sub date checks out — right on time.',
      'Needed the 10 so bad. Lord let it be.',
      'Regrade paid off!',
      'Express tier was worth every penny.',
      'Bulk finally cleared. Six cards deep.',
    ],
  },
  {
    id: 'bgs-return',
    label: 'BGS Return',
    icon: '🟨',
    accent: 'text-amber-300',
    border: 'border-amber-700/50 bg-amber-950/30',
    weight: 9,
    verb: 'back from Beckett',
    reactions: [
      'Subgrades looking clean.',
      'BGS still does autos best, fight me.',
      'That gold label would be nice.',
      'Three subs for the 9.5 — so close.',
      'Pristine 10 chase, wish me luck.',
    ],
  },
  {
    id: 'cgc-return',
    label: 'CGC Return',
    icon: '🟦',
    accent: 'text-sky-300',
    border: 'border-sky-700/50 bg-sky-950/30',
    weight: 7,
    verb: 'back from CGC',
    reactions: [
      'CGC turnaround is unreal lately.',
      'Perfect 10 chaser, fingers crossed.',
      'Switched from PSA for the speed.',
      'CGC slabs hit different.',
    ],
  },
  {
    id: 'sgc-return',
    label: 'SGC Return',
    icon: '🟩',
    accent: 'text-emerald-300',
    border: 'border-emerald-700/50 bg-emerald-950/30',
    weight: 5,
    verb: 'back from SGC',
    reactions: [
      'SGC for vintage, every time.',
      'Black label clean, pure vibes.',
      'Cheapest tier and still gorgeous.',
      'SGC gets the underrated grade.',
    ],
  },
  {
    id: 'ebay-delivery',
    label: 'eBay Delivery',
    icon: '📬',
    accent: 'text-indigo-300',
    border: 'border-indigo-700/50 bg-indigo-950/30',
    weight: 20,
    verb: 'arrived from eBay',
    reactions: [
      'Sniped this one at 2am. Worth the sleep loss.',
      'Seller threw in a top loader. 10/10.',
      'BIN steal, can you believe it?',
      'Auction win finally here.',
      'Shipping took 9 days but vibes intact.',
    ],
  },
  {
    id: 'card-show-pickup',
    label: 'Card Show Pickup',
    icon: '🎪',
    accent: 'text-yellow-300',
    border: 'border-yellow-700/50 bg-yellow-950/30',
    weight: 12,
    verb: 'picked up at the card show',
    reactions: [
      'Dealer threw this in with a bundle.',
      'Bought out of a binder for a song.',
      'Card show bargain of the weekend.',
      'Handshake deal, cash on the barrel.',
      'Drove 90 minutes for this and it was worth it.',
    ],
  },
  {
    id: 'break-shipment',
    label: 'Break Shipment',
    icon: '📦',
    accent: 'text-fuchsia-300',
    border: 'border-fuchsia-700/50 bg-fuchsia-950/30',
    weight: 15,
    verb: 'hit from a group break',
    reactions: [
      'Team on the hottest break of the year.',
      'This is why we chase hobby boxes.',
      'Broker shipped same day, class act.',
      'Spot paid for itself twice over.',
      'Hit-per-spot on this break was elite.',
    ],
  },
  {
    id: 'trade-arrival',
    label: 'Trade Arrival',
    icon: '🤝',
    accent: 'text-cyan-300',
    border: 'border-cyan-700/50 bg-cyan-950/30',
    weight: 10,
    verb: 'from a trade',
    reactions: [
      'Straight-up swap landed today.',
      'Trade partner threw in a surprise.',
      'Was chasing this one for months.',
      'Upgraded a PC slot with this flip.',
      'Twitter trade came through.',
    ],
  },
];

interface Arrival {
  id: string;
  ts: number;
  collector: Collector;
  mailType: MailTypeConfig;
  card: { name: string; value: string; sport: string };
  reaction: string;
  isGrail: boolean;
  grade?: string;
}

const TOTAL_WEIGHT = MAIL_TYPES.reduce((s, m) => s + m.weight, 0);

function pickMailType(): MailTypeConfig {
  const r = Math.random() * TOTAL_WEIGHT;
  let acc = 0;
  for (const mt of MAIL_TYPES) {
    acc += mt.weight;
    if (r < acc) return mt;
  }
  return MAIL_TYPES[0];
}

function parseValue(raw: string): number {
  const m = raw.match(/\$([\d,]+)/);
  if (!m) return 0;
  return parseInt(m[1].replace(/,/g, ''), 10);
}

function pickCard(sportFilter: SportFilter, biasHigh: boolean) {
  let pool = sportsCards;
  if (sportFilter !== 'all') pool = pool.filter(c => c.sport === sportFilter);
  if (biasHigh) {
    const highPool = pool.filter(c => parseValue(c.estimatedValueRaw) > 50);
    if (highPool.length > 0) pool = highPool;
  }
  const pick = pool[Math.floor(Math.random() * pool.length)];
  const val = parseValue(pick.estimatedValueRaw);
  const valueStr = val > 0 ? `$${val.toLocaleString()}` : pick.estimatedValueRaw.split('(')[0].trim();
  return { name: pick.name, value: valueStr, sport: pick.sport, rawValue: val };
}

function rollGrade(mailType: MailType): string | undefined {
  if (!mailType.endsWith('-return')) return undefined;
  const r = Math.random();
  if (r < 0.35) return '10';
  if (r < 0.65) return '9';
  if (r < 0.85) return '8.5';
  if (r < 0.95) return '8';
  return '7';
}

function makeArrival(sportFilter: SportFilter): Arrival {
  const mt = pickMailType();
  const biasHigh = Math.random() < 0.35;
  const card = pickCard(sportFilter, biasHigh);
  const grade = rollGrade(mt.id);
  const isGrail = card.rawValue >= 1000 || (grade === '10' && card.rawValue >= 300);
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    ts: Date.now(),
    collector: COLLECTORS[Math.floor(Math.random() * COLLECTORS.length)],
    mailType: mt,
    card: { name: card.name, value: card.value, sport: card.sport },
    reaction: mt.reactions[Math.floor(Math.random() * mt.reactions.length)],
    isGrail,
    grade,
  };
}

function formatAgo(ts: number, now: number): string {
  const s = Math.floor((now - ts) / 1000);
  if (s < 5) return 'just now';
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

export default function MaildayClient() {
  const [arrivals, setArrivals] = useState<Arrival[]>([]);
  const [paused, setPaused] = useState(false);
  const [mailFilter, setMailFilter] = useState<MailType | 'all'>('all');
  const [sportFilter, setSportFilter] = useState<SportFilter>('all');
  const [hydrated, setHydrated] = useState(false);
  const [now, setNow] = useState(Date.now());
  const sportFilterRef = useRef<SportFilter>('all');
  sportFilterRef.current = sportFilter;

  useEffect(() => {
    setHydrated(true);
    const seed: Arrival[] = [];
    for (let i = 0; i < 10; i++) {
      const a = makeArrival('all');
      a.ts = Date.now() - (i + 1) * (3000 + Math.random() * 5000);
      seed.push(a);
    }
    setArrivals(seed);
  }, []);

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      setArrivals(prev => [makeArrival(sportFilterRef.current), ...prev].slice(0, 60));
    }, 5200);
    return () => clearInterval(interval);
  }, [paused]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 3000);
    return () => clearInterval(t);
  }, []);

  const filtered = useMemo(() => {
    return arrivals.filter(a => {
      if (mailFilter !== 'all' && a.mailType.id !== mailFilter) return false;
      if (sportFilter !== 'all' && a.card.sport !== sportFilter) return false;
      return true;
    });
  }, [arrivals, mailFilter, sportFilter]);

  const stats = useMemo(() => {
    const total = arrivals.length;
    const grades = arrivals.filter(a => a.grade).length;
    const gem10s = arrivals.filter(a => a.grade === '10').length;
    const grails = arrivals.filter(a => a.isGrail).length;
    let topArrival: Arrival | null = null;
    let topValue = 0;
    arrivals.forEach(a => {
      const v = parseInt(a.card.value.replace(/[^0-9]/g, ''), 10) || 0;
      if (v > topValue) { topValue = v; topArrival = a; }
    });
    return { total, grades, gem10s, grails, topArrival, topValue };
  }, [arrivals]);

  const copyArrival = (a: Arrival) => {
    const text = `${a.collector.handle} ${a.mailType.verb}: ${a.card.name}${a.grade ? ` (PSA ${a.grade})` : ''} — ${a.card.value}\n"${a.reaction}"\nVia CardVault Mailday`;
    navigator.clipboard?.writeText(text).catch(() => {});
  };

  if (!hydrated) return <div className="text-gray-500 text-sm">Loading mailday feed…</div>;

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2.5">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Total Arrivals</div>
          <div className="text-lg font-bold text-white">{stats.total}</div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2.5">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Graded Returns</div>
          <div className="text-lg font-bold text-emerald-300">{stats.grades}</div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2.5">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Gem 10s</div>
          <div className="text-lg font-bold text-amber-300">{stats.gem10s}</div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2.5">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Grail Arrivals</div>
          <div className="text-lg font-bold text-fuchsia-300">{stats.grails}</div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2.5">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Highest Arrival</div>
          <div className="text-sm font-bold text-cyan-300 truncate">{stats.topValue > 0 ? `$${stats.topValue.toLocaleString()}` : '—'}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setPaused(p => !p)}
          className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${paused ? 'bg-amber-900/40 border-amber-700/50 text-amber-300 hover:bg-amber-900/60' : 'bg-emerald-900/40 border-emerald-700/50 text-emerald-300 hover:bg-emerald-900/60'}`}
        >
          {paused ? '▶ Resume Feed' : '⏸ Pause Feed'}
        </button>
        <span className="text-xs text-gray-500">auto-updates every 5.2s</span>
      </div>

      {/* Filters */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs text-gray-500 uppercase tracking-wide self-center mr-1">Mail:</span>
          <button onClick={() => setMailFilter('all')} className={`text-xs px-2.5 py-1 rounded-md border ${mailFilter === 'all' ? 'bg-gray-700 border-gray-500 text-white' : 'bg-gray-900/50 border-gray-800 text-gray-400 hover:text-gray-200'}`}>All</button>
          {MAIL_TYPES.map(mt => (
            <button key={mt.id} onClick={() => setMailFilter(mt.id)} className={`text-xs px-2.5 py-1 rounded-md border ${mailFilter === mt.id ? `${mt.border} ${mt.accent}` : 'bg-gray-900/50 border-gray-800 text-gray-400 hover:text-gray-200'}`}>
              {mt.icon} {mt.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs text-gray-500 uppercase tracking-wide self-center mr-1">Sport:</span>
          {(['all', 'baseball', 'basketball', 'football', 'hockey'] as SportFilter[]).map(s => (
            <button key={s} onClick={() => setSportFilter(s)} className={`text-xs px-2.5 py-1 rounded-md border capitalize ${sportFilter === s ? 'bg-gray-700 border-gray-500 text-white' : 'bg-gray-900/50 border-gray-800 text-gray-400 hover:text-gray-200'}`}>
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center text-gray-500 text-sm py-10 border border-dashed border-gray-800 rounded-lg">
            No arrivals match this filter yet. Wait for the next mail drop.
          </div>
        )}
        {filtered.map(a => (
          <div key={a.id} className={`rounded-lg border px-4 py-3 transition-all ${a.mailType.border} ${a.isGrail ? 'ring-1 ring-fuchsia-500/40' : ''}`}>
            <div className="flex items-start gap-3">
              <div className="text-2xl shrink-0 pt-0.5" aria-hidden>{a.collector.avatar}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap text-sm">
                  <span className="font-semibold text-white">{a.collector.handle}</span>
                  <span className="text-gray-500">{a.mailType.verb}</span>
                  {a.grade && (
                    <span className={`text-xs font-mono px-1.5 py-0.5 rounded border ${a.grade === '10' ? 'bg-amber-900/40 border-amber-700/60 text-amber-300' : 'bg-gray-800 border-gray-700 text-gray-300'}`}>
                      PSA {a.grade}
                    </span>
                  )}
                  {a.isGrail && <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-fuchsia-900/40 border border-fuchsia-700/60 text-fuchsia-300">GRAIL</span>}
                </div>
                <div className="mt-1 text-sm text-gray-200 font-medium">
                  <span className="mr-2" aria-hidden>{a.mailType.icon}</span>
                  {a.card.name} <span className="text-gray-500">—</span> <span className="text-emerald-300">{a.card.value}</span>
                </div>
                <div className={`mt-1 text-xs italic ${a.mailType.accent}`}>&ldquo;{a.reaction}&rdquo;</div>
                <div className="mt-1.5 flex items-center gap-3 text-xs text-gray-500">
                  <span>{formatAgo(a.ts, now)}</span>
                  <span className="capitalize">{a.card.sport}</span>
                  <button onClick={() => copyArrival(a)} className="text-gray-400 hover:text-white underline underline-offset-2">Copy</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="bg-gray-900/40 border border-gray-800 rounded-lg p-4">
        <div className="text-xs text-gray-500 uppercase tracking-wide mb-3">What Each Mail Type Means</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {MAIL_TYPES.map(mt => (
            <div key={mt.id} className={`px-2.5 py-2 rounded border ${mt.border}`}>
              <span className={`font-semibold ${mt.accent}`}>{mt.icon} {mt.label}</span>
              <span className="text-gray-400"> · {mt.verb}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
