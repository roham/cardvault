'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

function parseValue(raw: string): number {
  const m = raw.match(/\$[\d,]+/);
  if (!m) return 0;
  return parseInt(m[0].replace(/[$,]/g, ''), 10);
}

function dateHash(offset = 0): number {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const str = `flip-${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  let h = 0;
  for (let i = 0; i < str.length; i++) { h = ((h << 5) - h + str.charCodeAt(i)) | 0; }
  return Math.abs(h);
}

function seededRng(seed: number) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
}

const SPORT_COLORS: Record<string, { text: string; bg: string; border: string; accent: string }> = {
  baseball: { text: 'text-red-400', bg: 'bg-red-950/40', border: 'border-red-800/40', accent: 'text-red-300' },
  basketball: { text: 'text-orange-400', bg: 'bg-orange-950/40', border: 'border-orange-800/40', accent: 'text-orange-300' },
  football: { text: 'text-blue-400', bg: 'bg-blue-950/40', border: 'border-blue-800/40', accent: 'text-blue-300' },
  hockey: { text: 'text-cyan-400', bg: 'bg-cyan-950/40', border: 'border-cyan-800/40', accent: 'text-cyan-300' },
};

const SPORT_ICONS: Record<string, string> = {
  baseball: '\u26be', basketball: '\ud83c\udfc0', football: '\ud83c\udfc8', hockey: '\ud83c\udfd2',
};

const DEAL_SCENARIOS = [
  { label: 'Card Show Find', icon: '🏪', desc: 'Found at a local card show', discount: [15, 30] },
  { label: 'Estate Sale', icon: '🏠', desc: 'From a collection estate sale', discount: [20, 40] },
  { label: 'Garage Sale Gem', icon: '🏷️', desc: 'Spotted at a garage sale', discount: [30, 50] },
  { label: 'LCS Clearance', icon: '🏬', desc: 'Local card shop clearance bin', discount: [10, 25] },
  { label: 'Facebook Deal', icon: '📱', desc: 'Listed on Facebook Marketplace', discount: [12, 28] },
  { label: 'Flea Market', icon: '🛒', desc: 'Found at a flea market booth', discount: [25, 45] },
  { label: 'Bulk Lot Bonus', icon: '📦', desc: 'Hidden in a bulk lot purchase', discount: [35, 55] },
  { label: 'Friend Selling', icon: '🤝', desc: 'A buddy is selling their collection', discount: [15, 25] },
];

const SELL_PLATFORMS = [
  { name: 'eBay', fee: 0.13, time: '3-7 days' },
  { name: 'COMC', fee: 0.20, time: '2-4 weeks' },
  { name: 'Mercari', fee: 0.10, time: '3-10 days' },
  { name: 'Card Show', fee: 0.0, time: 'Same day' },
  { name: 'MySlabs', fee: 0.08, time: '1-3 days' },
];

interface FlipHistory {
  date: string;
  player: string;
  sport: string;
  askPrice: number;
  marketValue: number;
  vote: 'flip' | 'skip';
  profit: number;
}

interface FlipStats {
  totalVotes: number;
  flips: number;
  skips: number;
  totalProfit: number;
  bestFlip: number;
  worstFlip: number;
  streak: number;
  bestStreak: number;
}

function getStorageKey(): string {
  return 'cardvault-flip-of-day';
}

function loadStats(): FlipStats {
  if (typeof window === 'undefined') return { totalVotes: 0, flips: 0, skips: 0, totalProfit: 0, bestFlip: 0, worstFlip: 0, streak: 0, bestStreak: 0 };
  try {
    const raw = localStorage.getItem(getStorageKey() + '-stats');
    return raw ? JSON.parse(raw) : { totalVotes: 0, flips: 0, skips: 0, totalProfit: 0, bestFlip: 0, worstFlip: 0, streak: 0, bestStreak: 0 };
  } catch { return { totalVotes: 0, flips: 0, skips: 0, totalProfit: 0, bestFlip: 0, worstFlip: 0, streak: 0, bestStreak: 0 }; }
}

function loadHistory(): FlipHistory[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(getStorageKey() + '-history');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export default function FlipOfTheDayClient() {
  const [voted, setVoted] = useState<'flip' | 'skip' | null>(null);
  const [stats, setStats] = useState<FlipStats>(loadStats);
  const [history, setHistory] = useState<FlipHistory[]>(loadHistory);
  const [showHistory, setShowHistory] = useState(false);
  const [simVotes, setSimVotes] = useState({ flip: 0, skip: 0 });
  const [copied, setCopied] = useState(false);
  const [sportFilter, setSportFilter] = useState<string>('all');

  // Generate today's card deterministically
  const todayData = useMemo(() => {
    const rng = seededRng(dateHash());
    const cardsWithValue = sportsCards
      .map(c => ({ ...c, val: parseValue(c.estimatedValueRaw) }))
      .filter(c => c.val >= 10 && c.val <= 5000);

    // Pick a card
    const idx = Math.floor(rng() * cardsWithValue.length);
    const card = cardsWithValue[idx];

    // Pick a deal scenario
    const scenarioIdx = Math.floor(rng() * DEAL_SCENARIOS.length);
    const scenario = DEAL_SCENARIOS[scenarioIdx];

    // Calculate discount and asking price
    const discountPct = scenario.discount[0] + Math.floor(rng() * (scenario.discount[1] - scenario.discount[0]));
    const askPrice = Math.round(card.val * (1 - discountPct / 100));

    // Simulate community votes (deterministic)
    const totalSim = 200 + Math.floor(rng() * 800);
    const flipPct = discountPct > 25 ? 0.55 + rng() * 0.3 : 0.25 + rng() * 0.35;
    const simFlip = Math.round(totalSim * flipPct);
    const simSkip = totalSim - simFlip;

    // Generate "if you flipped 30 days ago" simulation
    const pastRng = seededRng(dateHash(-30));
    const pastIdx = Math.floor(pastRng() * cardsWithValue.length);
    const pastCard = cardsWithValue[pastIdx];
    const pastScenarioIdx = Math.floor(pastRng() * DEAL_SCENARIOS.length);
    const pastScenario = DEAL_SCENARIOS[pastScenarioIdx];
    const pastDiscount = pastScenario.discount[0] + Math.floor(pastRng() * (pastScenario.discount[1] - pastScenario.discount[0]));
    const pastAsk = Math.round(pastCard.val * (1 - pastDiscount / 100));
    const pastProfit = pastCard.val - pastAsk;

    // Calculate best sell platform
    const bestPlatform = SELL_PLATFORMS.reduce((best: { name: string; fee: number; time: string; net: number }, p) => {
      const net = card.val * (1 - p.fee) - askPrice;
      return net > best.net ? { ...p, net } : best;
    }, { ...SELL_PLATFORMS[0], net: card.val * (1 - SELL_PLATFORMS[0].fee) - askPrice });

    // Grade reasoning
    const profit = card.val - askPrice;
    const roi = ((profit / askPrice) * 100).toFixed(0);
    let verdict: 'STRONG FLIP' | 'DECENT FLIP' | 'MARGINAL' | 'SKIP IT';
    if (Number(roi) >= 40) verdict = 'STRONG FLIP';
    else if (Number(roi) >= 20) verdict = 'DECENT FLIP';
    else if (Number(roi) >= 5) verdict = 'MARGINAL';
    else verdict = 'SKIP IT';

    return {
      card, askPrice, scenario, discountPct, simFlip, simSkip, totalSim,
      pastCard, pastAsk, pastProfit, bestPlatform, profit, roi, verdict,
    };
  }, []);

  // Apply sport filter for the "upcoming" section
  const upcomingCards = useMemo(() => {
    const upcoming: { day: number; player: string; sport: string; value: number; discount: number }[] = [];
    for (let d = 1; d <= 7; d++) {
      const rng = seededRng(dateHash(d));
      const cardsWithValue = sportsCards
        .map(c => ({ ...c, val: parseValue(c.estimatedValueRaw) }))
        .filter(c => c.val >= 10 && c.val <= 5000);
      const idx = Math.floor(rng() * cardsWithValue.length);
      const card = cardsWithValue[idx];
      const scenarioIdx = Math.floor(rng() * DEAL_SCENARIOS.length);
      const sc = DEAL_SCENARIOS[scenarioIdx];
      const disc = sc.discount[0] + Math.floor(rng() * (sc.discount[1] - sc.discount[0]));
      if (sportFilter === 'all' || card.sport === sportFilter) {
        upcoming.push({ day: d, player: card.player, sport: card.sport, value: card.val, discount: disc });
      }
    }
    return upcoming;
  }, [sportFilter]);

  // Check if already voted today
  useEffect(() => {
    try {
      const todayVote = localStorage.getItem(getStorageKey() + '-vote-' + getTodayKey());
      if (todayVote) setVoted(todayVote as 'flip' | 'skip');
    } catch { /* ignore */ }
    setSimVotes({ flip: todayData.simFlip, skip: todayData.simSkip });
  }, [todayData]);

  const handleVote = useCallback((vote: 'flip' | 'skip') => {
    if (voted) return;
    setVoted(vote);

    const profit = vote === 'flip' ? todayData.profit : 0;
    const isProfitable = vote === 'flip' && profit > 0;

    const newStats: FlipStats = {
      totalVotes: stats.totalVotes + 1,
      flips: stats.flips + (vote === 'flip' ? 1 : 0),
      skips: stats.skips + (vote === 'skip' ? 1 : 0),
      totalProfit: stats.totalProfit + profit,
      bestFlip: Math.max(stats.bestFlip, profit),
      worstFlip: Math.min(stats.worstFlip, profit),
      streak: isProfitable ? stats.streak + 1 : (vote === 'skip' ? stats.streak : 0),
      bestStreak: isProfitable ? Math.max(stats.bestStreak, stats.streak + 1) : stats.bestStreak,
    };

    const newHistory: FlipHistory = {
      date: getTodayKey(),
      player: todayData.card.player,
      sport: todayData.card.sport,
      askPrice: todayData.askPrice,
      marketValue: todayData.card.val,
      vote,
      profit,
    };

    setStats(newStats);
    setHistory(prev => [newHistory, ...prev].slice(0, 30));

    // Update simulated votes
    setSimVotes(prev => ({
      flip: prev.flip + (vote === 'flip' ? 1 : 0),
      skip: prev.skip + (vote === 'skip' ? 1 : 0),
    }));

    try {
      localStorage.setItem(getStorageKey() + '-stats', JSON.stringify(newStats));
      localStorage.setItem(getStorageKey() + '-history', JSON.stringify([newHistory, ...history].slice(0, 30)));
      localStorage.setItem(getStorageKey() + '-vote-' + getTodayKey(), vote);
    } catch { /* ignore */ }
  }, [voted, stats, history, todayData]);

  const shareResults = useCallback(() => {
    const { card, askPrice, verdict, roi, discountPct } = todayData;
    const text = `Flip of the Day on CardVault!\n\n${card.player} — ${card.sport}\nAsk: $${askPrice.toLocaleString()} (${discountPct}% below market)\nVerdict: ${verdict} (${roi}% ROI)\n\nI voted: ${voted === 'flip' ? 'FLIP IT 💰' : 'SKIP IT ⏭️'}\n\nhttps://cardvault-two.vercel.app/flip-of-the-day`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [todayData, voted]);

  const { card, askPrice, scenario, discountPct, profit, roi, verdict, bestPlatform, pastCard, pastAsk, pastProfit } = todayData;
  const colors = SPORT_COLORS[card.sport] || SPORT_COLORS.baseball;
  const totalVotes = simVotes.flip + simVotes.skip;
  const flipPct = totalVotes > 0 ? Math.round((simVotes.flip / totalVotes) * 100) : 50;
  const skipPct = 100 - flipPct;

  const verdictColors: Record<string, string> = {
    'STRONG FLIP': 'text-emerald-400 bg-emerald-950/50 border-emerald-700/50',
    'DECENT FLIP': 'text-green-400 bg-green-950/50 border-green-700/50',
    'MARGINAL': 'text-amber-400 bg-amber-950/50 border-amber-700/50',
    'SKIP IT': 'text-red-400 bg-red-950/50 border-red-700/50',
  };

  return (
    <div className="space-y-8">
      {/* Hero Card */}
      <div className={`${colors.bg} border ${colors.border} rounded-xl p-6 sm:p-8`}>
        {/* Scenario badge */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-zinc-400 flex items-center gap-2">
            <span className="text-lg">{scenario.icon}</span> {scenario.label}
          </span>
          <span className={`text-xs px-2 py-1 rounded-full ${verdictColors[verdict]} border font-bold`}>
            {verdict}
          </span>
        </div>

        {/* Card info */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{SPORT_ICONS[card.sport] || '🃏'}</span>
            <span className={`text-sm font-medium ${colors.text} capitalize`}>{card.sport}</span>
            {card.rookie && <span className="text-xs bg-amber-900/50 text-amber-400 px-1.5 py-0.5 rounded-full border border-amber-700/50">RC</span>}
          </div>
          <Link href={`/cards/${card.slug}`} className="block">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white hover:text-zinc-200 transition-colors">
              {card.player}
            </h2>
          </Link>
          <p className="text-zinc-400 text-sm mt-1">{card.name}</p>
          <p className="text-zinc-500 text-xs mt-2 line-clamp-2">{card.description}</p>
        </div>

        {/* Price breakdown */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-xs text-zinc-500 mb-1">Market Value</div>
            <div className="text-xl font-bold text-white">${card.val.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-zinc-500 mb-1">Asking Price</div>
            <div className="text-xl font-bold text-emerald-400">${askPrice.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-zinc-500 mb-1">Potential Profit</div>
            <div className={`text-xl font-bold ${profit > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {profit > 0 ? '+' : ''}${profit.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Discount bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-zinc-500 mb-1">
            <span>{discountPct}% below market</span>
            <span>{roi}% ROI</span>
          </div>
          <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${Number(roi) >= 40 ? 'bg-emerald-500' : Number(roi) >= 20 ? 'bg-green-500' : Number(roi) >= 5 ? 'bg-amber-500' : 'bg-red-500'}`}
              style={{ width: `${Math.min(discountPct, 100)}%` }}
            />
          </div>
        </div>

        {/* Deal context */}
        <div className="bg-zinc-900/60 rounded-lg p-4 mb-6 text-sm">
          <div className="text-zinc-400 mb-2 font-medium">Deal Context</div>
          <p className="text-zinc-500">{scenario.desc}. The seller is asking <span className="text-white font-semibold">${askPrice.toLocaleString()}</span> for this card. Current market comps suggest a value of <span className="text-white font-semibold">${card.val.toLocaleString()}</span>. {profit > 50 ? 'There\'s real profit potential here.' : profit > 0 ? 'A modest margin if you can sell quickly.' : 'Not much meat on the bone.'}</p>
        </div>

        {/* Vote buttons */}
        {!voted ? (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleVote('flip')}
              className="py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg transition-all active:scale-95"
            >
              💰 FLIP IT
            </button>
            <button
              onClick={() => handleVote('skip')}
              className="py-4 rounded-xl bg-zinc-700 hover:bg-zinc-600 text-white font-bold text-lg transition-all active:scale-95"
            >
              ⏭️ SKIP IT
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Your vote */}
            <div className={`text-center py-3 rounded-xl border font-bold text-lg ${voted === 'flip' ? 'bg-emerald-950/50 border-emerald-700/50 text-emerald-400' : 'bg-zinc-800/50 border-zinc-700/50 text-zinc-300'}`}>
              You voted: {voted === 'flip' ? '💰 FLIP IT' : '⏭️ SKIP IT'}
              {voted === 'flip' && <span className="text-sm ml-2">({profit > 0 ? `+$${profit.toLocaleString()} profit` : `$${Math.abs(profit).toLocaleString()} loss`})</span>}
            </div>

            {/* Community vote bars */}
            <div>
              <div className="flex justify-between text-sm text-zinc-400 mb-2">
                <span>Community: {totalVotes.toLocaleString()} votes</span>
              </div>
              <div className="flex h-10 rounded-lg overflow-hidden">
                <div className="bg-emerald-600 flex items-center justify-center text-sm font-bold text-white" style={{ width: `${flipPct}%` }}>
                  {flipPct > 15 && `FLIP ${flipPct}%`}
                </div>
                <div className="bg-zinc-600 flex items-center justify-center text-sm font-bold text-white" style={{ width: `${skipPct}%` }}>
                  {skipPct > 15 && `SKIP ${skipPct}%`}
                </div>
              </div>
            </div>

            {/* Share */}
            <button
              onClick={shareResults}
              className="w-full py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition-colors"
            >
              {copied ? '✓ Copied!' : '📋 Share Your Pick'}
            </button>
          </div>
        )}
      </div>

      {/* Sell Platform Breakdown */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Best Sell Strategy</h3>
        <div className="space-y-2">
          {SELL_PLATFORMS.map(p => {
            const netProfit = Math.round(card.val * (1 - p.fee) - askPrice);
            const isBest = p.name === bestPlatform.name;
            return (
              <div key={p.name} className={`flex items-center justify-between p-3 rounded-lg ${isBest ? 'bg-emerald-950/30 border border-emerald-800/40' : 'bg-zinc-800/40'}`}>
                <div>
                  <span className={`font-medium ${isBest ? 'text-emerald-400' : 'text-zinc-300'}`}>{p.name}</span>
                  <span className="text-xs text-zinc-500 ml-2">{p.fee > 0 ? `${(p.fee * 100).toFixed(0)}% fee` : 'No fee'} · {p.time}</span>
                </div>
                <span className={`font-bold ${netProfit > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {netProfit > 0 ? '+' : ''}${netProfit.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 30 Days Ago Flashback */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-2">30-Day Flashback</h3>
        <p className="text-zinc-500 text-sm mb-4">Here was the flip opportunity 30 days ago:</p>
        <div className="flex items-center justify-between">
          <div>
            <Link href={`/cards/${pastCard.slug}`} className="text-white font-semibold hover:text-zinc-200">{pastCard.player}</Link>
            <span className={`text-xs ml-2 ${SPORT_COLORS[pastCard.sport]?.text || 'text-zinc-400'} capitalize`}>{pastCard.sport}</span>
            <div className="text-xs text-zinc-500 mt-1">Ask: ${pastAsk.toLocaleString()} · Market: ${pastCard.val.toLocaleString()}</div>
          </div>
          <div className={`text-lg font-bold ${pastProfit > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {pastProfit > 0 ? '+' : ''}${pastProfit.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Upcoming Peeks + Sport Filter */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Coming This Week</h3>
          <div className="flex gap-1">
            {['all', 'baseball', 'basketball', 'football', 'hockey'].map(s => (
              <button
                key={s}
                onClick={() => setSportFilter(s)}
                className={`px-2 py-1 text-xs rounded-md transition-colors ${sportFilter === s ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                {s === 'all' ? 'All' : (SPORT_ICONS[s] || s)}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          {upcomingCards.length === 0 && <p className="text-zinc-600 text-sm">No {sportFilter} cards this week</p>}
          {upcomingCards.map((u, i) => (
            <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-zinc-800/50 last:border-0">
              <div className="flex items-center gap-2">
                <span className="text-zinc-600 w-16">Day +{u.day}</span>
                <span className="text-white font-medium">{u.player}</span>
                <span className={`text-xs ${SPORT_COLORS[u.sport]?.text || 'text-zinc-400'} capitalize`}>{u.sport}</span>
              </div>
              <span className="text-emerald-400 text-xs font-medium">-{u.discount}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Your Stats */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Your Flip Stats</h3>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            {showHistory ? 'Hide History' : 'Show History'}
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{stats.totalVotes}</div>
            <div className="text-xs text-zinc-500">Total Votes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400">{stats.flips}</div>
            <div className="text-xs text-zinc-500">Flips</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${stats.totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              ${Math.abs(stats.totalProfit).toLocaleString()}
            </div>
            <div className="text-xs text-zinc-500">Total {stats.totalProfit >= 0 ? 'Profit' : 'Loss'}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-400">{stats.bestStreak}</div>
            <div className="text-xs text-zinc-500">Best Streak</div>
          </div>
        </div>

        {showHistory && history.length > 0 && (
          <div className="border-t border-zinc-800 pt-4 space-y-2">
            {history.map((h, i) => (
              <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-zinc-800/30 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-600 text-xs w-20">{h.date}</span>
                  <span className="text-white">{h.player}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${h.vote === 'flip' ? 'bg-emerald-950/50 text-emerald-400' : 'bg-zinc-800 text-zinc-400'}`}>
                    {h.vote.toUpperCase()}
                  </span>
                </div>
                <span className={`font-medium ${h.profit > 0 ? 'text-emerald-400' : h.profit < 0 ? 'text-red-400' : 'text-zinc-500'}`}>
                  {h.profit > 0 ? '+' : ''}{h.profit === 0 ? '—' : `$${h.profit.toLocaleString()}`}
                </span>
              </div>
            ))}
          </div>
        )}

        {showHistory && history.length === 0 && (
          <p className="text-zinc-600 text-sm text-center py-4">No votes yet. Start voting to build your history!</p>
        )}
      </div>

      {/* Flip Tips */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Flip Tips</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="text-sm">
              <span className="text-emerald-400 font-medium">20%+ discount = Strong buy</span>
              <p className="text-zinc-500 text-xs mt-0.5">Most cards sell within 10% of market on eBay. Getting 20%+ below is a genuine deal.</p>
            </div>
            <div className="text-sm">
              <span className="text-amber-400 font-medium">Factor in fees</span>
              <p className="text-zinc-500 text-xs mt-0.5">eBay charges ~13%, COMC ~20%. A 15% discount might mean zero profit after selling fees.</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="text-sm">
              <span className="text-blue-400 font-medium">Card show = best margins</span>
              <p className="text-zinc-500 text-xs mt-0.5">No selling fees at card shows. If you can sell in person, your margins improve dramatically.</p>
            </div>
            <div className="text-sm">
              <span className="text-purple-400 font-medium">Rookie cards flip fastest</span>
              <p className="text-zinc-500 text-xs mt-0.5">Rookies have the most liquidity. Non-RC vintage may take weeks to find a buyer.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Links */}
      <div className="flex flex-wrap gap-2">
        {[
          { href: '/hot-deals', label: 'Hot Deals' },
          { href: '/market-movers', label: 'Market Movers' },
          { href: '/tools/flip-calc', label: 'Flip Calculator' },
          { href: '/tools/watchlist', label: 'Watchlist' },
          { href: '/rip-or-skip', label: 'Rip or Skip' },
          { href: '/tools/dealer-scanner', label: 'Dealer Scanner' },
        ].map(link => (
          <Link key={link.href} href={link.href} className="text-xs px-3 py-1.5 rounded-full bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors">
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
