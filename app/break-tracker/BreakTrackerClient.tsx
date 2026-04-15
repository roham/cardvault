'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import Link from 'next/link';

/* ─── Types ─── */
type RarityTier = 'base' | 'parallel' | 'numbered' | 'auto' | 'patch' | 'mega';
type BreakPhase = 'setup' | 'breaking' | 'summary';

interface Pull {
  id: number;
  tier: RarityTier;
  player: string;
  value: number;
  timestamp: number;
}

interface BreakSession {
  id: string;
  product: string;
  sport: string;
  cost: number;
  pulls: Pull[];
  startTime: number;
  endTime: number | null;
}

interface SavedBreak {
  id: string;
  product: string;
  sport: string;
  cost: number;
  pullCount: number;
  hitCount: number;
  totalValue: number;
  roi: number;
  date: string;
}

/* ─── Constants ─── */
const PRODUCTS = [
  { id: 'topps-chrome-2024', name: '2024 Topps Chrome Hobby', sport: 'Baseball', avgCost: 250 },
  { id: 'bowman-chrome-2024', name: '2024 Bowman Chrome Hobby', sport: 'Baseball', avgCost: 300 },
  { id: 'topps-series1-2025', name: '2025 Topps Series 1 Hobby', sport: 'Baseball', avgCost: 200 },
  { id: 'prizm-bball-2025', name: '2024-25 Prizm Basketball Hobby', sport: 'Basketball', avgCost: 500 },
  { id: 'select-bball-2025', name: '2024-25 Select Basketball Hobby', sport: 'Basketball', avgCost: 400 },
  { id: 'prizm-fb-2024', name: '2024 Prizm Football Hobby', sport: 'Football', avgCost: 400 },
  { id: 'optic-fb-2024', name: '2024 Donruss Optic Football Hobby', sport: 'Football', avgCost: 350 },
  { id: 'upper-deck-2025', name: '2024-25 Upper Deck Series 1 Hobby', sport: 'Hockey', avgCost: 150 },
  { id: 'custom', name: 'Custom Product', sport: 'Other', avgCost: 0 },
];

const TIERS: { tier: RarityTier; label: string; color: string; bg: string; defaultValue: number }[] = [
  { tier: 'base', label: 'Base', color: 'text-zinc-400', bg: 'bg-zinc-800 border-zinc-700', defaultValue: 1 },
  { tier: 'parallel', label: 'Parallel', color: 'text-blue-400', bg: 'bg-blue-950/60 border-blue-800/50', defaultValue: 5 },
  { tier: 'numbered', label: 'Numbered', color: 'text-purple-400', bg: 'bg-purple-950/60 border-purple-800/50', defaultValue: 15 },
  { tier: 'auto', label: 'Auto', color: 'text-amber-400', bg: 'bg-amber-950/60 border-amber-800/50', defaultValue: 40 },
  { tier: 'patch', label: 'Patch/Relic', color: 'text-emerald-400', bg: 'bg-emerald-950/60 border-emerald-800/50', defaultValue: 25 },
  { tier: 'mega', label: 'Mega Hit', color: 'text-red-400', bg: 'bg-red-950/60 border-red-800/50', defaultValue: 150 },
];

const HIT_TIERS: RarityTier[] = ['numbered', 'auto', 'patch', 'mega'];

function formatCurrency(n: number): string {
  return n >= 1000 ? `$${(n / 1000).toFixed(1)}K` : `$${n.toFixed(0)}`;
}

/* ─── Main Component ─── */
export default function BreakTrackerClient() {
  const [phase, setPhase] = useState<BreakPhase>('setup');
  const [selectedProductId, setSelectedProductId] = useState(PRODUCTS[0].id);
  const [customName, setCustomName] = useState('');
  const [boxCost, setBoxCost] = useState(PRODUCTS[0].avgCost);
  const [session, setSession] = useState<BreakSession | null>(null);
  const [pullCounter, setPullCounter] = useState(0);
  const [quickPlayer, setQuickPlayer] = useState('');
  const [quickValue, setQuickValue] = useState('');
  const [history, setHistory] = useState<SavedBreak[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showUndoId, setShowUndoId] = useState<number | null>(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cv_break_history');
      if (saved) setHistory(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  const saveHistory = useCallback((breaks: SavedBreak[]) => {
    setHistory(breaks);
    try { localStorage.setItem('cv_break_history', JSON.stringify(breaks)); } catch { /* ignore */ }
  }, []);

  // Product selection handler
  const handleProductChange = useCallback((id: string) => {
    setSelectedProductId(id);
    const p = PRODUCTS.find(p => p.id === id);
    if (p && p.id !== 'custom') setBoxCost(p.avgCost);
  }, []);

  // Start break
  const startBreak = useCallback(() => {
    const product = PRODUCTS.find(p => p.id === selectedProductId);
    const name = selectedProductId === 'custom' ? (customName || 'Custom Box') : (product?.name || 'Box');
    const sport = product?.sport || 'Other';
    setSession({
      id: `break-${Date.now()}`,
      product: name,
      sport,
      cost: boxCost,
      pulls: [],
      startTime: Date.now(),
      endTime: null,
    });
    setPullCounter(0);
    setPhase('breaking');
  }, [selectedProductId, customName, boxCost]);

  // Log a pull
  const logPull = useCallback((tier: RarityTier) => {
    if (!session) return;
    const tierData = TIERS.find(t => t.tier === tier)!;
    const value = quickValue ? parseFloat(quickValue) : tierData.defaultValue;
    const pull: Pull = {
      id: pullCounter,
      tier,
      player: quickPlayer || tierLabel(tier),
      value: isNaN(value) ? tierData.defaultValue : value,
      timestamp: Date.now(),
    };
    setSession(prev => prev ? { ...prev, pulls: [...prev.pulls, pull] } : null);
    setPullCounter(c => c + 1);
    setQuickPlayer('');
    setQuickValue('');
    setShowUndoId(pull.id);
    setTimeout(() => setShowUndoId(prev => prev === pull.id ? null : prev), 3000);
  }, [session, pullCounter, quickPlayer, quickValue]);

  // Undo last pull
  const undoPull = useCallback((id: number) => {
    setSession(prev => prev ? { ...prev, pulls: prev.pulls.filter(p => p.id !== id) } : null);
    setShowUndoId(null);
  }, []);

  // End break
  const endBreak = useCallback(() => {
    if (!session) return;
    const ended = { ...session, endTime: Date.now() };
    setSession(ended);
    // Save to history
    const totalValue = ended.pulls.reduce((s, p) => s + p.value, 0);
    const hitCount = ended.pulls.filter(p => HIT_TIERS.includes(p.tier)).length;
    const saved: SavedBreak = {
      id: ended.id,
      product: ended.product,
      sport: ended.sport,
      cost: ended.cost,
      pullCount: ended.pulls.length,
      hitCount,
      totalValue: Math.round(totalValue),
      roi: ended.cost > 0 ? Math.round(((totalValue - ended.cost) / ended.cost) * 100) : 0,
      date: new Date().toISOString().slice(0, 10),
    };
    saveHistory([saved, ...history].slice(0, 50));
    setPhase('summary');
  }, [session, history, saveHistory]);

  // Copy share text
  const copyShareText = useCallback(() => {
    if (!session) return;
    const totalValue = session.pulls.reduce((s, p) => s + p.value, 0);
    const hits = session.pulls.filter(p => HIT_TIERS.includes(p.tier));
    const roi = session.cost > 0 ? ((totalValue - session.cost) / session.cost * 100).toFixed(0) : '0';
    const lines = [
      `Break Results: ${session.product}`,
      `Cards: ${session.pulls.length} | Hits: ${hits.length} | Hit Rate: ${session.pulls.length > 0 ? (hits.length / session.pulls.length * 100).toFixed(1) : 0}%`,
      `Total Value: $${totalValue.toFixed(0)} | Cost: $${session.cost} | ROI: ${roi}%`,
      hits.length > 0 ? `Top Pulls: ${hits.sort((a, b) => b.value - a.value).slice(0, 3).map(h => `${h.player} ($${h.value})`).join(', ')}` : '',
      '',
      'Tracked with CardVault Break Tracker',
    ].filter(Boolean).join('\n');
    navigator.clipboard.writeText(lines).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [session]);

  // Stats
  const stats = useMemo(() => {
    if (!session) return null;
    const totalValue = session.pulls.reduce((s, p) => s + p.value, 0);
    const hits = session.pulls.filter(p => HIT_TIERS.includes(p.tier));
    const hitRate = session.pulls.length > 0 ? (hits.length / session.pulls.length * 100) : 0;
    const roi = session.cost > 0 ? ((totalValue - session.cost) / session.cost * 100) : 0;
    const byTier = TIERS.map(t => ({
      ...t,
      count: session.pulls.filter(p => p.tier === t.tier).length,
      value: session.pulls.filter(p => p.tier === t.tier).reduce((s, p) => s + p.value, 0),
    }));
    return { totalValue, hitCount: hits.length, hitRate, roi, byTier, total: session.pulls.length };
  }, [session]);

  // History stats
  const historyStats = useMemo(() => {
    if (history.length === 0) return null;
    const totalSpent = history.reduce((s, b) => s + b.cost, 0);
    const totalPulled = history.reduce((s, b) => s + b.totalValue, 0);
    const avgRoi = totalSpent > 0 ? ((totalPulled - totalSpent) / totalSpent * 100) : 0;
    return { breaks: history.length, totalSpent, totalPulled, avgRoi };
  }, [history]);

  /* ─── SETUP PHASE ─── */
  if (phase === 'setup') {
    return (
      <div className="space-y-8">
        {/* Product Select */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Select Product</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {PRODUCTS.map(p => (
              <button
                key={p.id}
                onClick={() => handleProductChange(p.id)}
                className={`text-left p-4 rounded-lg border transition-colors ${
                  selectedProductId === p.id
                    ? 'border-red-500 bg-red-950/30 text-white'
                    : 'border-zinc-700 bg-zinc-800/60 text-zinc-300 hover:border-zinc-600'
                }`}
              >
                <div className="font-medium text-sm">{p.name}</div>
                <div className="text-xs text-zinc-500 mt-1">{p.sport}{p.avgCost > 0 ? ` — ~$${p.avgCost}` : ''}</div>
              </button>
            ))}
          </div>

          {selectedProductId === 'custom' && (
            <input
              type="text"
              placeholder="Product name..."
              value={customName}
              onChange={e => setCustomName(e.target.value)}
              className="w-full mb-4 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
            />
          )}

          <div>
            <label className="text-sm text-zinc-400 mb-2 block">Box Cost ($)</label>
            <input
              type="number"
              min={0}
              step={5}
              value={boxCost}
              onChange={e => setBoxCost(Math.max(0, Number(e.target.value)))}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={startBreak}
          disabled={boxCost <= 0 && selectedProductId !== 'custom'}
          className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold text-lg rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Start Break
        </button>

        {/* History */}
        {history.length > 0 && (
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center justify-between w-full text-left"
            >
              <h2 className="text-lg font-bold text-white">Break History ({history.length})</h2>
              <span className={`text-zinc-500 transition-transform ${showHistory ? 'rotate-180' : ''}`}>&#9660;</span>
            </button>

            {historyStats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                <div className="bg-zinc-800/60 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-white">{historyStats.breaks}</div>
                  <div className="text-xs text-zinc-500">Breaks</div>
                </div>
                <div className="bg-zinc-800/60 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-white">{formatCurrency(historyStats.totalSpent)}</div>
                  <div className="text-xs text-zinc-500">Spent</div>
                </div>
                <div className="bg-zinc-800/60 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-white">{formatCurrency(historyStats.totalPulled)}</div>
                  <div className="text-xs text-zinc-500">Pulled</div>
                </div>
                <div className="bg-zinc-800/60 rounded-lg p-3 text-center">
                  <div className={`text-2xl font-bold ${historyStats.avgRoi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {historyStats.avgRoi >= 0 ? '+' : ''}{historyStats.avgRoi.toFixed(0)}%
                  </div>
                  <div className="text-xs text-zinc-500">Avg ROI</div>
                </div>
              </div>
            )}

            {showHistory && (
              <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                {history.map(b => (
                  <div key={b.id} className="flex items-center justify-between bg-zinc-800/60 rounded-lg px-4 py-3 text-sm">
                    <div>
                      <div className="text-white font-medium">{b.product}</div>
                      <div className="text-xs text-zinc-500">{b.date} &middot; {b.pullCount} cards &middot; {b.hitCount} hits</div>
                    </div>
                    <div className={`font-bold ${b.roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {b.roi >= 0 ? '+' : ''}{b.roi}%
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  /* ─── BREAKING PHASE ─── */
  if (phase === 'breaking' && session && stats) {
    return (
      <div className="space-y-6">
        {/* Live Stats Bar */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-white font-bold">{session.product}</div>
              <div className="text-xs text-zinc-500">Cost: ${session.cost}</div>
            </div>
            <div className="inline-flex items-center gap-2 bg-red-950/60 border border-red-800/50 text-red-400 text-xs font-medium px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
              Breaking
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-zinc-800/60 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-white">{stats.total}</div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-wide">Cards</div>
            </div>
            <div className="bg-zinc-800/60 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-amber-400">{stats.hitCount}</div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-wide">Hits</div>
            </div>
            <div className="bg-zinc-800/60 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-purple-400">{stats.hitRate.toFixed(1)}%</div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-wide">Hit Rate</div>
            </div>
            <div className="bg-zinc-800/60 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-white">${stats.totalValue.toFixed(0)}</div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-wide">Value</div>
            </div>
            <div className="bg-zinc-800/60 rounded-lg p-3 text-center col-span-2 sm:col-span-1">
              <div className={`text-xl font-bold ${stats.roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {stats.roi >= 0 ? '+' : ''}{stats.roi.toFixed(0)}%
              </div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-wide">ROI</div>
            </div>
          </div>
        </div>

        {/* Quick Log Inputs */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
          <h3 className="text-sm font-bold text-white mb-3">Quick Log (optional details)</h3>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="Player name..."
              value={quickPlayer}
              onChange={e => setQuickPlayer(e.target.value)}
              className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-red-500"
            />
            <input
              type="number"
              placeholder="$"
              value={quickValue}
              onChange={e => setQuickValue(e.target.value)}
              className="w-20 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Tier Buttons */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {TIERS.map(t => (
              <button
                key={t.tier}
                onClick={() => logPull(t.tier)}
                className={`p-3 rounded-lg border ${t.bg} ${t.color} font-medium text-sm transition-all hover:scale-105 active:scale-95`}
              >
                <div>{t.label}</div>
                <div className="text-[10px] opacity-60">${t.defaultValue}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Undo Toast */}
        {showUndoId !== null && (
          <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 flex items-center justify-between text-sm animate-in">
            <span className="text-zinc-300">
              Logged: {session.pulls.find(p => p.id === showUndoId)?.player || 'Card'}
            </span>
            <button
              onClick={() => undoPull(showUndoId)}
              className="text-red-400 hover:text-red-300 font-medium ml-4"
            >
              Undo
            </button>
          </div>
        )}

        {/* Tier Breakdown */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
          <h3 className="text-sm font-bold text-white mb-3">Breakdown by Tier</h3>
          <div className="space-y-2">
            {stats.byTier.filter(t => t.count > 0).map(t => (
              <div key={t.tier} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${t.color}`}>{t.label}</span>
                  <span className="text-xs text-zinc-500">x{t.count}</span>
                </div>
                <span className="text-sm text-white font-medium">${t.value.toFixed(0)}</span>
              </div>
            ))}
            {stats.byTier.every(t => t.count === 0) && (
              <div className="text-center text-zinc-500 text-sm py-4">
                Start logging pulls — tap a tier above
              </div>
            )}
          </div>
        </div>

        {/* Pull Log */}
        {session.pulls.length > 0 && (
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
            <h3 className="text-sm font-bold text-white mb-3">Pull Log ({session.pulls.length})</h3>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {[...session.pulls].reverse().map(p => {
                const tierData = TIERS.find(t => t.tier === p.tier)!;
                return (
                  <div key={p.id} className="flex items-center justify-between text-sm py-1.5 border-b border-zinc-800/50 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${tierData.bg} ${tierData.color}`}>
                        {tierData.label}
                      </span>
                      <span className="text-zinc-300 truncate max-w-[150px]">{p.player}</span>
                    </div>
                    <span className="text-white font-medium">${p.value.toFixed(0)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* End Break */}
        <button
          onClick={endBreak}
          className="w-full py-4 bg-zinc-700 hover:bg-zinc-600 text-white font-bold rounded-xl transition-colors"
        >
          End Break &amp; See Results
        </button>
      </div>
    );
  }

  /* ─── SUMMARY PHASE ─── */
  if (phase === 'summary' && session && stats) {
    const topPulls = [...session.pulls].sort((a, b) => b.value - a.value).slice(0, 5);
    const duration = session.endTime && session.startTime
      ? Math.round((session.endTime - session.startTime) / 60000)
      : 0;

    return (
      <div className="space-y-6">
        {/* Result Banner */}
        <div className={`rounded-xl p-6 text-center border ${
          stats.roi >= 0
            ? 'bg-emerald-950/30 border-emerald-800/50'
            : 'bg-red-950/30 border-red-800/50'
        }`}>
          <div className="text-sm text-zinc-400 mb-1">Break Result</div>
          <div className={`text-4xl font-black ${stats.roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {stats.roi >= 0 ? '+' : ''}{stats.roi.toFixed(0)}% ROI
          </div>
          <div className="text-zinc-400 mt-2">{session.product}</div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-xs text-zinc-500">Cards Pulled</div>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-amber-400">{stats.hitCount}</div>
            <div className="text-xs text-zinc-500">Hits</div>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">${stats.totalValue.toFixed(0)}</div>
            <div className="text-xs text-zinc-500">Total Value</div>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">{stats.hitRate.toFixed(1)}%</div>
            <div className="text-xs text-zinc-500">Hit Rate</div>
          </div>
        </div>

        {/* Cost vs Value */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-sm font-bold text-white mb-3">Cost vs Value</h3>
          <div className="flex items-center gap-4 mb-3">
            <div className="flex-1">
              <div className="text-xs text-zinc-500 mb-1">Box Cost</div>
              <div className="h-3 bg-red-500/60 rounded-full" style={{ width: '100%' }} />
              <div className="text-sm text-white mt-1">${session.cost}</div>
            </div>
            <div className="flex-1">
              <div className="text-xs text-zinc-500 mb-1">Value Pulled</div>
              <div
                className={`h-3 rounded-full ${stats.roi >= 0 ? 'bg-emerald-500/60' : 'bg-amber-500/60'}`}
                style={{ width: `${Math.min(100, Math.max(10, (stats.totalValue / session.cost) * 100))}%` }}
              />
              <div className="text-sm text-white mt-1">${stats.totalValue.toFixed(0)}</div>
            </div>
          </div>
          {duration > 0 && (
            <div className="text-xs text-zinc-500">Break duration: {duration} min</div>
          )}
        </div>

        {/* Top Pulls */}
        {topPulls.length > 0 && (
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-white mb-3">Top Pulls</h3>
            <div className="space-y-2">
              {topPulls.map((p, i) => {
                const tierData = TIERS.find(t => t.tier === p.tier)!;
                return (
                  <div key={p.id} className="flex items-center justify-between py-2 border-b border-zinc-800/50 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-zinc-500 text-sm font-mono w-5">#{i + 1}</span>
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${tierData.bg} ${tierData.color}`}>
                        {tierData.label}
                      </span>
                      <span className="text-white">{p.player}</span>
                    </div>
                    <span className="text-white font-bold">${p.value.toFixed(0)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tier Breakdown */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-sm font-bold text-white mb-3">Tier Breakdown</h3>
          <div className="space-y-2">
            {stats.byTier.filter(t => t.count > 0).map(t => (
              <div key={t.tier} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${t.color}`}>{t.label}</span>
                  <span className="text-xs text-zinc-500">x{t.count}</span>
                </div>
                <span className="text-sm text-white font-medium">${t.value.toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={copyShareText}
            className="flex-1 py-3 bg-zinc-700 hover:bg-zinc-600 text-white font-medium rounded-xl transition-colors"
          >
            {copied ? 'Copied!' : 'Share Results'}
          </button>
          <button
            onClick={() => { setSession(null); setPhase('setup'); }}
            className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors"
          >
            New Break
          </button>
        </div>
      </div>
    );
  }

  return null;
}

/* ─── Helpers ─── */
function tierLabel(tier: RarityTier): string {
  const labels: Record<RarityTier, string> = {
    base: 'Base Card',
    parallel: 'Parallel',
    numbered: 'Numbered Card',
    auto: 'Autograph',
    patch: 'Patch/Relic',
    mega: 'Mega Hit',
  };
  return labels[tier];
}
