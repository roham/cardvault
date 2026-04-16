'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

function parseValue(raw: string): number {
  const m = raw.match(/\$[\d,]+/);
  if (!m) return 0;
  return parseInt(m[0].replace(/[$,]/g, ''), 10);
}

function seededRng(seed: number) {
  let s = seed || 42;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s & 0x7fffffff) / 0x7fffffff;
  };
}

function dateHash(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

const SPORT_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  baseball: { text: 'text-red-400', bg: 'bg-red-950/40', border: 'border-red-800/40' },
  basketball: { text: 'text-orange-400', bg: 'bg-orange-950/40', border: 'border-orange-800/40' },
  football: { text: 'text-blue-400', bg: 'bg-blue-950/40', border: 'border-blue-800/40' },
  hockey: { text: 'text-cyan-400', bg: 'bg-cyan-950/40', border: 'border-cyan-800/40' },
};

const TRADE_TYPES = ['OFFER', 'MATCH', 'COMPLETED', 'WANTED', 'HOT TRADE'] as const;
type TradeType = (typeof TRADE_TYPES)[number];

const TRADE_TYPE_STYLES: Record<TradeType, { text: string; bg: string; icon: string }> = {
  OFFER: { text: 'text-blue-400', bg: 'bg-blue-950/50', icon: '>' },
  MATCH: { text: 'text-emerald-400', bg: 'bg-emerald-950/50', icon: '=' },
  COMPLETED: { text: 'text-green-400', bg: 'bg-green-950/50', icon: '+' },
  WANTED: { text: 'text-amber-400', bg: 'bg-amber-950/50', icon: '?' },
  'HOT TRADE': { text: 'text-rose-400', bg: 'bg-rose-950/50', icon: '!' },
};

const COLLECTOR_NAMES = [
  'CardFlipKing', 'WaxRipper22', 'GemMintGal', 'PSA10Hunter', 'VintageVault',
  'ChromeChaser', 'PatchCollector', 'RookieHunter', 'SlabDaddy', 'TheGradingGuru',
  'BaseBreaker', 'HobbyBoxHero', 'MintCondition', 'SetBuilder99', 'CardShowCash',
  'ToppsTime', 'PrizmPro', 'SelectSniper', 'FleerFanatic', 'BowmanBeast',
  'UpperDeckUltra', 'DonrussDaily', 'MosaicMaster', 'OpticOracle', 'SilverStar',
];

const VALUE_TIERS = ['All', 'Budget (<$50)', 'Mid ($50-200)', 'Premium ($200+)'] as const;

interface Trade {
  id: number;
  type: TradeType;
  from: string;
  to: string;
  offerCards: { name: string; sport: string; value: number; player: string; slug: string }[];
  wantCards: { name: string; sport: string; value: number; player: string; slug: string }[];
  fairness: number; // -100 to 100, 0 = perfectly fair
  timestamp: number;
}

export default function TradeWallClient() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [paused, setPaused] = useState(false);
  const [sportFilter, setSportFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [valueTier, setValueTier] = useState<string>('All');
  const [stats, setStats] = useState({ total: 0, offers: 0, matched: 0, completed: 0, volume: 0 });
  const tradeCounter = useRef(0);
  const rng = useRef(seededRng(dateHash()));

  const cardsWithValue = useMemo(() =>
    sportsCards
      .map(c => ({ ...c, val: parseValue(c.estimatedValueRaw) }))
      .filter(c => c.val > 0),
    []
  );

  const generateTrade = useCallback((): Trade => {
    const r = rng.current;
    const id = tradeCounter.current++;

    // Pick trade type
    const typeRoll = r();
    const type: TradeType = typeRoll < 0.30 ? 'OFFER'
      : typeRoll < 0.50 ? 'MATCH'
      : typeRoll < 0.72 ? 'COMPLETED'
      : typeRoll < 0.88 ? 'WANTED'
      : 'HOT TRADE';

    // Pick collectors
    const fromIdx = Math.floor(r() * COLLECTOR_NAMES.length);
    let toIdx = Math.floor(r() * COLLECTOR_NAMES.length);
    if (toIdx === fromIdx) toIdx = (toIdx + 1) % COLLECTOR_NAMES.length;

    // Pick cards
    const numOffer = type === 'WANTED' ? 0 : Math.floor(r() * 3) + 1;
    const numWant = type === 'OFFER' || type === 'WANTED' ? Math.floor(r() * 3) + 1 : numOffer;

    const pickCards = (count: number) => {
      const result: Trade['offerCards'] = [];
      for (let i = 0; i < count; i++) {
        const card = cardsWithValue[Math.floor(r() * cardsWithValue.length)];
        result.push({
          name: card.name,
          sport: card.sport,
          value: card.val,
          player: card.player,
          slug: card.slug,
        });
      }
      return result;
    };

    const offerCards = pickCards(numOffer);
    const wantCards = pickCards(numWant);

    const offerTotal = offerCards.reduce((s, c) => s + c.value, 0);
    const wantTotal = wantCards.reduce((s, c) => s + c.value, 0);
    const avg = (offerTotal + wantTotal) / 2 || 1;
    const fairness = Math.round(((offerTotal - wantTotal) / avg) * 100);

    return {
      id,
      type,
      from: COLLECTOR_NAMES[fromIdx],
      to: COLLECTOR_NAMES[toIdx],
      offerCards,
      wantCards,
      fairness,
      timestamp: Date.now() - Math.floor(r() * 60000),
    };
  }, [cardsWithValue]);

  useEffect(() => {
    // Generate initial batch
    const initial: Trade[] = [];
    for (let i = 0; i < 15; i++) {
      initial.push(generateTrade());
    }
    setTrades(initial);

    const vol = initial.reduce((s, t) => s + t.offerCards.reduce((a, c) => a + c.value, 0) + t.wantCards.reduce((a, c) => a + c.value, 0), 0);
    setStats({
      total: initial.length,
      offers: initial.filter(t => t.type === 'OFFER').length,
      matched: initial.filter(t => t.type === 'MATCH').length,
      completed: initial.filter(t => t.type === 'COMPLETED').length,
      volume: vol,
    });
  }, [generateTrade]);

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      const newTrade = generateTrade();
      newTrade.timestamp = Date.now();
      setTrades(prev => [newTrade, ...prev].slice(0, 50));
      setStats(prev => ({
        total: prev.total + 1,
        offers: prev.offers + (newTrade.type === 'OFFER' ? 1 : 0),
        matched: prev.matched + (newTrade.type === 'MATCH' ? 1 : 0),
        completed: prev.completed + (newTrade.type === 'COMPLETED' ? 1 : 0),
        volume: prev.volume + newTrade.offerCards.reduce((s, c) => s + c.value, 0) + newTrade.wantCards.reduce((s, c) => s + c.value, 0),
      }));
    }, 3500);
    return () => clearInterval(interval);
  }, [paused, generateTrade]);

  const filteredTrades = useMemo(() => {
    return trades.filter(t => {
      if (sportFilter !== 'all') {
        const allSports = [...t.offerCards, ...t.wantCards].map(c => c.sport);
        if (!allSports.includes(sportFilter)) return false;
      }
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;
      if (valueTier !== 'All') {
        const total = t.offerCards.reduce((s, c) => s + c.value, 0) + t.wantCards.reduce((s, c) => s + c.value, 0);
        if (valueTier === 'Budget (<$50)' && total >= 50) return false;
        if (valueTier === 'Mid ($50-200)' && (total < 50 || total > 200)) return false;
        if (valueTier === 'Premium ($200+)' && total < 200) return false;
      }
      return true;
    });
  }, [trades, sportFilter, typeFilter, valueTier]);

  const timeAgo = (ts: number) => {
    const sec = Math.floor((Date.now() - ts) / 1000);
    if (sec < 5) return 'just now';
    if (sec < 60) return `${sec}s ago`;
    return `${Math.floor(sec / 60)}m ago`;
  };

  const fairnessLabel = (f: number) => {
    const abs = Math.abs(f);
    if (abs <= 10) return { text: 'Fair Trade', color: 'text-emerald-400' };
    if (abs <= 25) return { text: 'Slight Edge', color: 'text-amber-400' };
    return { text: `${abs}% Overpay`, color: 'text-rose-400' };
  };

  return (
    <div className="space-y-5">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gray-900/60 border border-gray-800/50 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-white">{stats.total}</div>
          <div className="text-xs text-gray-500">Total Trades</div>
        </div>
        <div className="bg-gray-900/60 border border-gray-800/50 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-emerald-400">{stats.completed}</div>
          <div className="text-xs text-gray-500">Completed</div>
        </div>
        <div className="bg-gray-900/60 border border-gray-800/50 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-blue-400">{stats.offers + stats.matched}</div>
          <div className="text-xs text-gray-500">Active Offers</div>
        </div>
        <div className="bg-gray-900/60 border border-gray-800/50 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-amber-400">${(stats.volume / 1000).toFixed(1)}K</div>
          <div className="text-xs text-gray-500">Trade Volume</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Sport Filter */}
        <div className="flex gap-1">
          {['all', 'baseball', 'basketball', 'football', 'hockey'].map(s => (
            <button
              key={s}
              onClick={() => setSportFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                sportFilter === s
                  ? s === 'all' ? 'bg-gray-700 border-gray-600 text-white' : `${SPORT_COLORS[s]?.bg} ${SPORT_COLORS[s]?.border} ${SPORT_COLORS[s]?.text}`
                  : 'bg-gray-900 border-gray-800 text-gray-500 hover:text-gray-300'
              }`}
            >
              {s === 'all' ? 'All Sports' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="bg-gray-900 border border-gray-800 rounded-lg px-2 py-1.5 text-xs text-gray-300 outline-none"
        >
          <option value="all">All Types</option>
          {TRADE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        {/* Value Tier */}
        <select
          value={valueTier}
          onChange={e => setValueTier(e.target.value)}
          className="bg-gray-900 border border-gray-800 rounded-lg px-2 py-1.5 text-xs text-gray-300 outline-none"
        >
          {VALUE_TIERS.map(v => <option key={v} value={v}>{v}</option>)}
        </select>

        {/* Pause/Resume */}
        <button
          onClick={() => setPaused(!paused)}
          className={`ml-auto px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            paused
              ? 'bg-emerald-950/50 border-emerald-800/50 text-emerald-400'
              : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          {paused ? 'Resume' : 'Pause'}
        </button>
      </div>

      {/* Trade Feed */}
      <div className="space-y-2">
        {filteredTrades.length === 0 && (
          <div className="text-center py-10 text-gray-500 text-sm">No trades match your filters. Try broadening your search.</div>
        )}
        {filteredTrades.map((trade) => {
          const style = TRADE_TYPE_STYLES[trade.type];
          const fair = fairnessLabel(trade.fairness);
          return (
            <div
              key={trade.id}
              className={`border rounded-lg p-4 transition-all animate-in fade-in slide-in-from-top-2 duration-300 ${style.bg} border-gray-800/50`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${style.text} bg-gray-900/60`}>
                    {style.icon} {trade.type}
                  </span>
                  <span className="text-xs text-gray-500">{trade.from}</span>
                  {trade.type !== 'WANTED' && (
                    <>
                      <span className="text-gray-600 text-xs">&rarr;</span>
                      <span className="text-xs text-gray-500">{trade.to}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${fair.color}`}>{fair.text}</span>
                  <span className="text-xs text-gray-600">{timeAgo(trade.timestamp)}</span>
                </div>
              </div>

              {/* Trade Content */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Offer Side */}
                {trade.offerCards.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase text-gray-500 mb-1 font-medium">
                      {trade.type === 'COMPLETED' ? 'Sent' : 'Offering'}
                    </div>
                    <div className="space-y-1">
                      {trade.offerCards.map((c, i) => (
                        <Link
                          key={i}
                          href={`/sports/${c.slug}`}
                          className="flex items-center justify-between bg-gray-900/40 rounded px-2 py-1.5 hover:bg-gray-800/60 transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`text-[10px] ${SPORT_COLORS[c.sport]?.text || 'text-gray-400'}`}>
                              {c.sport.slice(0, 3).toUpperCase()}
                            </span>
                            <span className="text-xs text-gray-300 truncate">{c.player}</span>
                          </div>
                          <span className="text-xs text-gray-500 whitespace-nowrap ml-2">${c.value}</span>
                        </Link>
                      ))}
                    </div>
                    <div className="text-right text-xs text-gray-500 mt-1">
                      ${trade.offerCards.reduce((s, c) => s + c.value, 0)} total
                    </div>
                  </div>
                )}

                {/* Want Side */}
                {trade.wantCards.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase text-gray-500 mb-1 font-medium">
                      {trade.type === 'COMPLETED' ? 'Received' : trade.type === 'WANTED' ? 'Looking For' : 'Wants'}
                    </div>
                    <div className="space-y-1">
                      {trade.wantCards.map((c, i) => (
                        <Link
                          key={i}
                          href={`/sports/${c.slug}`}
                          className="flex items-center justify-between bg-gray-900/40 rounded px-2 py-1.5 hover:bg-gray-800/60 transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`text-[10px] ${SPORT_COLORS[c.sport]?.text || 'text-gray-400'}`}>
                              {c.sport.slice(0, 3).toUpperCase()}
                            </span>
                            <span className="text-xs text-gray-300 truncate">{c.player}</span>
                          </div>
                          <span className="text-xs text-gray-500 whitespace-nowrap ml-2">${c.value}</span>
                        </Link>
                      ))}
                    </div>
                    <div className="text-right text-xs text-gray-500 mt-1">
                      ${trade.wantCards.reduce((s, c) => s + c.value, 0)} total
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* How It Works */}
      <div className="bg-gray-900/40 border border-gray-800/40 rounded-xl p-5 mt-8">
        <h3 className="text-sm font-semibold text-white mb-3">How to Read the Trade Wall</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-400">
          <div className="flex gap-2">
            <span className="text-blue-400 font-bold">&gt;</span>
            <span><strong className="text-blue-400">OFFER</strong> — A collector is proposing a trade</span>
          </div>
          <div className="flex gap-2">
            <span className="text-emerald-400 font-bold">=</span>
            <span><strong className="text-emerald-400">MATCH</strong> — Two offers have been paired</span>
          </div>
          <div className="flex gap-2">
            <span className="text-green-400 font-bold">+</span>
            <span><strong className="text-green-400">COMPLETED</strong> — Trade executed successfully</span>
          </div>
          <div className="flex gap-2">
            <span className="text-amber-400 font-bold">?</span>
            <span><strong className="text-amber-400">WANTED</strong> — Someone is looking for a card</span>
          </div>
          <div className="flex gap-2">
            <span className="text-rose-400 font-bold">!</span>
            <span><strong className="text-rose-400">HOT TRADE</strong> — Trending or high-value trade</span>
          </div>
          <div className="flex gap-2">
            <span className="text-emerald-400">Fair</span>
            <span>Trade is within 10% of equal value</span>
          </div>
        </div>
      </div>
    </div>
  );
}
