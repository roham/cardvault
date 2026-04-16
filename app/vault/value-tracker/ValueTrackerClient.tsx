'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

function parseValue(raw: string): number {
  const m = raw.match(/\$[\d,]+/);
  if (!m) return 0;
  return parseInt(m[0].replace(/[$,]/g, ''), 10);
}

function seededRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function dateHash(dateStr: string): number {
  let h = 0;
  for (let i = 0; i < dateStr.length; i++) {
    h = ((h << 5) - h + dateStr.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

interface Snapshot {
  date: string;
  totalValue: number;
  cardCount: number;
  bySport: Record<string, number>;
}

interface VaultCard {
  slug: string;
  acquiredAt: string;
  acquiredFrom: string;
  pricePaid: number;
}

const LS_KEY = 'cardvault-value-tracker';
const VAULT_KEY = 'cardvault-vault';

const SPORT_COLORS: Record<string, string> = {
  baseball: '#ef4444',
  basketball: '#f97316',
  football: '#3b82f6',
  hockey: '#06b6d4',
};

const SPORT_LABELS: Record<string, string> = {
  baseball: 'Baseball',
  basketball: 'Basketball',
  football: 'Football',
  hockey: 'Hockey',
};

export default function ValueTrackerClient() {
  const [mounted, setMounted] = useState(false);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [view, setView] = useState<'chart' | 'table' | 'breakdown'>('chart');

  const cardMap = useMemo(() => {
    const map = new Map<string, (typeof sportsCards)[number]>();
    for (const c of sportsCards) map.set(c.slug, c);
    return map;
  }, []);

  const loadSnapshots = useCallback((): Snapshot[] => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) return JSON.parse(saved) as Snapshot[];
    } catch {
      // ignore
    }
    return [];
  }, []);

  const getVaultCards = useCallback((): VaultCard[] => {
    try {
      const saved = localStorage.getItem(VAULT_KEY);
      if (saved) return JSON.parse(saved) as VaultCard[];
    } catch {
      // ignore
    }
    return [];
  }, []);

  useEffect(() => {
    setMounted(true);
    setSnapshots(loadSnapshots());
  }, [loadSnapshots]);

  const takeSnapshot = useCallback(() => {
    const vaultCards = getVaultCards();
    const today = new Date().toISOString().split('T')[0];
    let totalValue = 0;
    const bySport: Record<string, number> = {};
    for (const vc of vaultCards) {
      const card = cardMap.get(vc.slug);
      if (!card) continue;
      const val = parseValue(card.estimatedValueRaw);
      totalValue += val;
      const sport = card.sport || 'other';
      bySport[sport] = (bySport[sport] || 0) + val;
    }
    const snap: Snapshot = { date: today, totalValue, cardCount: vaultCards.length, bySport };
    setSnapshots((prev) => {
      const filtered = prev.filter((s) => s.date !== today);
      const updated = [...filtered, snap].sort((a, b) => a.date.localeCompare(b.date));
      const trimmed = updated.slice(-365);
      localStorage.setItem(LS_KEY, JSON.stringify(trimmed));
      return trimmed;
    });
  }, [getVaultCards, cardMap]);

  const displaySnapshots = useMemo((): Snapshot[] => {
    if (snapshots.length > 0) return snapshots;
    const demo: Snapshot[] = [];
    const today = new Date();
    const rng = seededRng(dateHash('demo-value-tracker'));
    let baseValue = 1200;
    let baseCards = 25;
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const change = (rng() - 0.45) * 150;
      baseValue = Math.max(100, baseValue + change);
      if (rng() > 0.7) baseCards += 1;
      demo.push({
        date: dateStr,
        totalValue: Math.round(baseValue),
        cardCount: baseCards,
        bySport: {
          baseball: Math.round(baseValue * 0.3),
          basketball: Math.round(baseValue * 0.25),
          football: Math.round(baseValue * 0.28),
          hockey: Math.round(baseValue * 0.17),
        },
      });
    }
    return demo;
  }, [snapshots]);

  const stats = useMemo(() => {
    if (displaySnapshots.length === 0) return null;
    const latest = displaySnapshots[displaySnapshots.length - 1];
    const first = displaySnapshots[0];
    const allValues = displaySnapshots.map((s) => s.totalValue);
    const high = Math.max(...allValues);
    const low = Math.min(...allValues);
    const totalChange = latest.totalValue - first.totalValue;
    const totalChangePct = first.totalValue > 0 ? (totalChange / first.totalValue) * 100 : 0;
    const weekAgo = displaySnapshots.length >= 7 ? displaySnapshots[displaySnapshots.length - 7] : first;
    const weekChange = latest.totalValue - weekAgo.totalValue;
    const weekChangePct = weekAgo.totalValue > 0 ? (weekChange / weekAgo.totalValue) * 100 : 0;
    return { currentValue: latest.totalValue, cardCount: latest.cardCount, allTimeHigh: high, allTimeLow: low, totalChange, totalChangePct, weekChange, weekChangePct, dayCount: displaySnapshots.length, bySport: latest.bySport };
  }, [displaySnapshots]);

  const chartSvg = useMemo(() => {
    if (displaySnapshots.length < 2) return null;
    const W = 700, H = 250;
    const pad = { top: 20, right: 20, bottom: 30, left: 60 };
    const cw = W - pad.left - pad.right;
    const ch = H - pad.top - pad.bottom;
    const vals = displaySnapshots.map((s) => s.totalValue);
    const minV = Math.min(...vals) * 0.95;
    const maxV = Math.max(...vals) * 1.05;
    const range = maxV - minV || 1;
    const points = displaySnapshots.map((s, i) => ({
      x: pad.left + (i / (displaySnapshots.length - 1)) * cw,
      y: pad.top + ch - ((s.totalValue - minV) / range) * ch,
    }));
    const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    const area = line + ` L${points[points.length - 1].x.toFixed(1)},${pad.top + ch} L${points[0].x.toFixed(1)},${pad.top + ch} Z`;
    const isUp = vals[vals.length - 1] >= vals[0];
    const color = isUp ? '#10b981' : '#ef4444';
    const yLabels: { val: number; y: number }[] = [];
    for (let i = 0; i <= 4; i++) yLabels.push({ val: Math.round(minV + (range * i) / 4), y: pad.top + ch - (i / 4) * ch });
    const xLabels: { label: string; x: number }[] = [];
    const step = Math.max(1, Math.floor(displaySnapshots.length / 5));
    for (let i = 0; i < displaySnapshots.length; i += step) {
      const parts = displaySnapshots[i].date.split('-');
      xLabels.push({ label: `${parts[1]}/${parts[2]}`, x: points[i].x });
    }
    return { W, H, line, area, color, points, yLabels, xLabels, pad, ch };
  }, [displaySnapshots]);

  if (!mounted) return <div className="space-y-4">{[0, 1, 2].map((i) => <div key={i} className="h-32 bg-gray-800/50 rounded-lg animate-pulse" />)}</div>;

  const isDemo = snapshots.length === 0;

  return (
    <div className="space-y-6">
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Portfolio Value', value: `$${stats.currentValue.toLocaleString()}`, cls: 'text-white' },
            { label: 'Cards', value: String(stats.cardCount), cls: 'text-white' },
            { label: '7-Day Change', value: `${stats.weekChange >= 0 ? '+' : ''}${stats.weekChangePct.toFixed(1)}%`, cls: stats.weekChange >= 0 ? 'text-emerald-400' : 'text-red-400' },
            { label: 'All-Time High', value: `$${stats.allTimeHigh.toLocaleString()}`, cls: 'text-amber-400' },
          ].map((s) => (
            <div key={s.label} className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-400 mb-1">{s.label}</div>
              <div className={`text-xl font-bold ${s.cls}`}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {isDemo && (
        <div className="bg-amber-950/30 border border-amber-800/40 rounded-lg p-4">
          <p className="text-sm text-amber-300"><strong>Demo Mode:</strong> Showing simulated data. Open packs in the <Link href="/packs" className="underline hover:text-amber-200">Pack Store</Link> to build your vault, then take a snapshot to start tracking real values.</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(['chart', 'table', 'breakdown'] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${view === v ? 'bg-emerald-600 text-white' : 'bg-gray-800/60 text-gray-400 hover:text-white'}`}>
              {v === 'chart' ? 'Chart' : v === 'table' ? 'History' : 'Breakdown'}
            </button>
          ))}
        </div>
        <button onClick={takeSnapshot} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors">Take Snapshot</button>
      </div>

      {view === 'chart' && chartSvg && (
        <div className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-white mb-3">Value Over Time</h2>
          <div className="overflow-x-auto">
            <svg viewBox={`0 0 ${chartSvg.W} ${chartSvg.H}`} className="w-full max-w-[700px] mx-auto">
              {chartSvg.yLabels.map((yl, i) => (
                <g key={i}>
                  <line x1={chartSvg.pad.left} y1={yl.y} x2={chartSvg.W - chartSvg.pad.right} y2={yl.y} stroke="#374151" strokeWidth="0.5" />
                  <text x={chartSvg.pad.left - 8} y={yl.y + 4} textAnchor="end" fill="#9ca3af" fontSize="10">${yl.val.toLocaleString()}</text>
                </g>
              ))}
              {chartSvg.xLabels.map((xl, i) => (
                <text key={i} x={xl.x} y={chartSvg.H - 5} textAnchor="middle" fill="#9ca3af" fontSize="10">{xl.label}</text>
              ))}
              <path d={chartSvg.area} fill={chartSvg.color} opacity="0.1" />
              <path d={chartSvg.line} fill="none" stroke={chartSvg.color} strokeWidth="2" />
              {chartSvg.points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={displaySnapshots.length > 60 ? 1.5 : 3} fill={chartSvg.color} />
              ))}
            </svg>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
            <span>{displaySnapshots[0].date}</span>
            <span>{displaySnapshots.length} data points</span>
            <span>{displaySnapshots[displaySnapshots.length - 1].date}</span>
          </div>
        </div>
      )}

      {view === 'table' && (
        <div className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-4 overflow-x-auto">
          <h2 className="text-lg font-semibold text-white mb-3">Snapshot History</h2>
          <table className="w-full text-sm">
            <thead><tr className="text-gray-400 border-b border-gray-700"><th className="text-left py-2 px-2">Date</th><th className="text-right py-2 px-2">Value</th><th className="text-right py-2 px-2">Cards</th><th className="text-right py-2 px-2">Change</th><th className="text-right py-2 px-2">Avg/Card</th></tr></thead>
            <tbody>
              {[...displaySnapshots].reverse().slice(0, 30).map((snap, i, arr) => {
                const prev = i < arr.length - 1 ? arr[i + 1] : null;
                const change = prev ? snap.totalValue - prev.totalValue : 0;
                const avg = snap.cardCount > 0 ? Math.round(snap.totalValue / snap.cardCount) : 0;
                return (
                  <tr key={snap.date} className="border-b border-gray-800/50 hover:bg-gray-700/20">
                    <td className="py-2 px-2 text-gray-300">{snap.date}</td>
                    <td className="py-2 px-2 text-right font-mono text-white">${snap.totalValue.toLocaleString()}</td>
                    <td className="py-2 px-2 text-right text-gray-400">{snap.cardCount}</td>
                    <td className={`py-2 px-2 text-right font-mono ${change > 0 ? 'text-emerald-400' : change < 0 ? 'text-red-400' : 'text-gray-500'}`}>
                      {change !== 0 ? `${change > 0 ? '+' : '-'}$${Math.abs(change).toLocaleString()}` : '\u2014'}
                    </td>
                    <td className="py-2 px-2 text-right text-gray-400">${avg.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {view === 'breakdown' && stats && (
        <div className="space-y-4">
          <div className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-white mb-3">Value by Sport</h2>
            <div className="space-y-3">
              {Object.entries(stats.bySport).sort(([, a], [, b]) => b - a).map(([sport, val]) => {
                const pct = stats.currentValue > 0 ? (val / stats.currentValue) * 100 : 0;
                return (
                  <div key={sport}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">{SPORT_LABELS[sport] || sport}</span>
                      <span className="text-white font-mono">${val.toLocaleString()} ({pct.toFixed(1)}%)</span>
                    </div>
                    <div className="h-3 bg-gray-700/50 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: SPORT_COLORS[sport] || '#6b7280' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-white mb-3">Performance Summary</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><div className="text-gray-400">Total Change</div><div className={`text-lg font-bold ${stats.totalChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{stats.totalChange >= 0 ? '+' : '-'}${Math.abs(stats.totalChange).toLocaleString()} ({stats.totalChangePct.toFixed(1)}%)</div></div>
              <div><div className="text-gray-400">All-Time Low</div><div className="text-lg font-bold text-gray-300">${stats.allTimeLow.toLocaleString()}</div></div>
              <div><div className="text-gray-400">Avg Card Value</div><div className="text-lg font-bold text-white">${stats.cardCount > 0 ? Math.round(stats.currentValue / stats.cardCount).toLocaleString() : '0'}</div></div>
              <div><div className="text-gray-400">Tracking Days</div><div className="text-lg font-bold text-white">{stats.dayCount}</div></div>
            </div>
          </div>
          <div className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-white mb-3">Collection Milestones</h2>
            <div className="space-y-2">
              {[
                { label: 'First Card', threshold: 1, isValue: false },
                { label: '10 Cards', threshold: 10, isValue: false },
                { label: '25 Cards', threshold: 25, isValue: false },
                { label: '50 Cards', threshold: 50, isValue: false },
                { label: '100 Cards', threshold: 100, isValue: false },
                { label: '$1K Portfolio', threshold: 1000, isValue: true },
                { label: '$5K Portfolio', threshold: 5000, isValue: true },
                { label: '$10K Portfolio', threshold: 10000, isValue: true },
              ].map((m) => {
                const current = m.isValue ? stats.currentValue : stats.cardCount;
                const achieved = current >= m.threshold;
                return (
                  <div key={m.label} className={`flex items-center gap-3 p-2 rounded-lg ${achieved ? 'bg-emerald-950/30 border border-emerald-800/30' : 'bg-gray-900/30 border border-gray-800/30'}`}>
                    <div className="flex-1">
                      <div className={`text-sm font-medium ${achieved ? 'text-emerald-300' : 'text-gray-500'}`}>{m.label}</div>
                      {!achieved && <div className="h-1.5 bg-gray-700/50 rounded-full mt-1 overflow-hidden"><div className="h-full bg-gray-500 rounded-full" style={{ width: `${Math.min(100, (current / m.threshold) * 100)}%` }} /></div>}
                    </div>
                    {achieved ? <span className="text-emerald-400 text-sm">Achieved</span> : <span className="text-gray-500 text-xs">{Math.round((current / m.threshold) * 100)}%</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-white mb-3">Portfolio Tracking Tips</h2>
        <ul className="space-y-2 text-sm text-gray-300">
          <li className="flex gap-2"><span className="text-emerald-400 shrink-0">1.</span> Take a snapshot daily or weekly to build a meaningful value history</li>
          <li className="flex gap-2"><span className="text-emerald-400 shrink-0">2.</span> Watch for sudden drops — they may signal market corrections or player news</li>
          <li className="flex gap-2"><span className="text-emerald-400 shrink-0">3.</span> Compare your sport allocation to your target — diversification reduces risk</li>
          <li className="flex gap-2"><span className="text-emerald-400 shrink-0">4.</span> Track average card value — if it drops, you may be accumulating base cards faster than hits</li>
          <li className="flex gap-2"><span className="text-emerald-400 shrink-0">5.</span> Use snapshots before and after card shows to measure buying efficiency</li>
        </ul>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        {[
          { label: 'My Vault', href: '/vault' },
          { label: 'Vault Analytics', href: '/vault/analytics' },
          { label: 'Pack Store', href: '/packs' },
          { label: 'Collection Goals', href: '/vault/goals' },
          { label: 'Insurance Est.', href: '/vault/insurance' },
          { label: 'Tax Reporter', href: '/vault/tax-report' },
          { label: 'Estate Planner', href: '/vault/estate-planner' },
          { label: 'Market Dashboard', href: '/market-dashboard' },
        ].map((l) => (
          <Link key={l.href} href={l.href} className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-3 text-center hover:border-emerald-700/50 hover:bg-emerald-950/20 transition-colors">
            <div className="text-gray-300">{l.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
