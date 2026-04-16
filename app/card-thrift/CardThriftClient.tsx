'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { sportsCards } from '@/data/sports-cards';

type Sport = 'all' | 'baseball' | 'basketball' | 'football' | 'hockey';
type Mode = 'daily' | 'random';
type Phase = 'setup' | 'picking' | 'revealed';

interface BinCard {
  slug: string;
  name: string;
  player: string;
  sport: string;
  year: number;
  value: number;
  rookie: boolean;
}

interface ThriftStats {
  runs: number;
  totalProfit: number;
  bestRun: number;
  gemsFound: number;
  totalValuePicked: number;
}

const BIN_SIZE = 20;
const PICK_COUNT = 10;
const BUDGET = 50;
const CARD_COST = 5;

function parseValue(val: string): number {
  const m = val.match(/\$([0-9,.]+)/);
  return m ? parseFloat(m[1].replace(',', '')) : 5;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function dateHash(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

const SPORT_EMOJI: Record<string, string> = {
  baseball: '⚾',
  basketball: '🏀',
  football: '🏈',
  hockey: '🏒',
};

function gradeFromProfit(p: number): { letter: string; color: string; label: string } {
  if (p >= 500) return { letter: 'S', color: 'text-yellow-400', label: 'Legendary Dig' };
  if (p >= 200) return { letter: 'A', color: 'text-emerald-400', label: 'Huge Score' };
  if (p >= 100) return { letter: 'B', color: 'text-blue-400', label: 'Solid Run' };
  if (p >= 25) return { letter: 'C', color: 'text-purple-400', label: 'Decent Dig' };
  if (p >= 0) return { letter: 'D', color: 'text-orange-400', label: 'Broke Even' };
  return { letter: 'F', color: 'text-red-400', label: 'Lost Money' };
}

export default function CardThriftClient() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [sportFilter, setSportFilter] = useState<Sport>('all');
  const [mode, setMode] = useState<Mode>('daily');
  const [runSeed, setRunSeed] = useState<number>(0);
  const [bin, setBin] = useState<BinCard[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [stats, setStats] = useState<ThriftStats>({ runs: 0, totalProfit: 0, bestRun: -999999, gemsFound: 0, totalValuePicked: 0 });

  useEffect(() => {
    try {
      const raw = localStorage.getItem('thrift-stats-v1');
      if (raw) setStats(JSON.parse(raw));
    } catch {}
  }, []);

  const saveStats = useCallback((s: ThriftStats) => {
    setStats(s);
    try { localStorage.setItem('thrift-stats-v1', JSON.stringify(s)); } catch {}
  }, []);

  const pool = useMemo(() => {
    return sportFilter === 'all' ? sportsCards : sportsCards.filter(c => c.sport === sportFilter);
  }, [sportFilter]);

  const startRun = () => {
    const seed = mode === 'daily' ? dateHash() + (sportFilter === 'all' ? 0 : sportFilter.charCodeAt(0)) : Math.floor(Math.random() * 2147483646);
    const rng = seededRandom(seed + 1);
    const picks: BinCard[] = [];
    const used = new Set<string>();
    let attempts = 0;
    while (picks.length < BIN_SIZE && attempts < 2000) {
      attempts++;
      const c = pool[Math.floor(rng() * pool.length)];
      if (!c || used.has(c.slug)) continue;
      used.add(c.slug);
      picks.push({
        slug: c.slug,
        name: c.name,
        player: c.player,
        sport: c.sport,
        year: c.year,
        value: parseValue(c.estimatedValueRaw),
        rookie: c.rookie,
      });
    }
    setBin(picks);
    setSelected(new Set());
    setRunSeed(seed);
    setPhase('picking');
  };

  const togglePick = (i: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else if (next.size < PICK_COUNT) next.add(i);
      return next;
    });
  };

  const checkout = () => {
    if (selected.size !== PICK_COUNT) return;
    const picked = Array.from(selected).map(i => bin[i]);
    const totalValue = picked.reduce((s, c) => s + c.value, 0);
    const profit = totalValue - BUDGET;
    const gems = picked.filter(c => c.value >= 100).length;
    saveStats({
      runs: stats.runs + 1,
      totalProfit: stats.totalProfit + profit,
      bestRun: Math.max(stats.bestRun, profit),
      gemsFound: stats.gemsFound + gems,
      totalValuePicked: stats.totalValuePicked + totalValue,
    });
    setPhase('revealed');
  };

  const reset = () => {
    setPhase('setup');
    setBin([]);
    setSelected(new Set());
  };

  const pickedCards = useMemo(() => Array.from(selected).map(i => bin[i]).filter(Boolean), [selected, bin]);
  const totalValue = pickedCards.reduce((s, c) => s + c.value, 0);
  const profit = totalValue - BUDGET;
  const grade = gradeFromProfit(profit);
  const gemCount = pickedCards.filter(c => c.value >= 100).length;

  const share = async () => {
    const g = gradeFromProfit(profit);
    const emojis = pickedCards
      .sort((a, b) => b.value - a.value)
      .map(c => (c.value >= 100 ? '💎' : c.value >= 25 ? '🟢' : c.value >= 5 ? '🟡' : '⬜'))
      .join('');
    const text = `Card Thrift Store ${mode === 'daily' ? '(Daily)' : ''}
Grade: ${g.letter} — ${g.label}
Spent $${BUDGET} · Got $${totalValue.toFixed(0)} · ${profit >= 0 ? '+' : ''}$${profit.toFixed(0)} profit
${emojis}
cardvault-two.vercel.app/card-thrift`;
    try { await navigator.clipboard.writeText(text); alert('Copied!'); } catch { alert(text); }
  };

  if (phase === 'setup') {
    return (
      <div className="space-y-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Ready to Dig?</h2>
          <p className="text-gray-400 text-sm mb-6">
            You have <span className="text-orange-400 font-semibold">$50</span> to spend in the bin.
            Each card costs <span className="text-orange-400 font-semibold">$5</span>. Pick exactly <span className="text-orange-400 font-semibold">10 of 20</span> cards.
            You only see year and sport before you buy.
          </p>

          <div className="mb-5">
            <div className="text-sm text-gray-400 mb-2">Sport filter</div>
            <div className="grid grid-cols-5 gap-2">
              {(['all', 'baseball', 'basketball', 'football', 'hockey'] as Sport[]).map(s => (
                <button
                  key={s}
                  onClick={() => setSportFilter(s)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${sportFilter === s ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                >
                  {s === 'all' ? 'All' : SPORT_EMOJI[s] + ' ' + s[0].toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <div className="text-sm text-gray-400 mb-2">Mode</div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setMode('daily')} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'daily' ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                📅 Daily Bin
              </button>
              <button onClick={() => setMode('random')} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'random' ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                🎲 Random Bin
              </button>
            </div>
          </div>

          <button onClick={startRun} className="w-full px-4 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-lg transition-colors">
            Open the Bin
          </button>
        </div>

        {stats.runs > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-3">Your Stats</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-gray-800/50 rounded-lg p-3">
                <div className="text-xs text-gray-500 uppercase">Runs</div>
                <div className="text-xl font-bold text-white">{stats.runs}</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3">
                <div className="text-xs text-gray-500 uppercase">Total Profit</div>
                <div className={`text-xl font-bold ${stats.totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {stats.totalProfit >= 0 ? '+' : ''}${stats.totalProfit.toFixed(0)}
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3">
                <div className="text-xs text-gray-500 uppercase">Best Run</div>
                <div className="text-xl font-bold text-yellow-400">${stats.bestRun > -999999 ? stats.bestRun.toFixed(0) : 0}</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3">
                <div className="text-xs text-gray-500 uppercase">Gems Found</div>
                <div className="text-xl font-bold text-cyan-400">{stats.gemsFound}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (phase === 'picking') {
    return (
      <div className="space-y-5">
        <div className="bg-gradient-to-br from-orange-950/60 to-amber-950/40 border border-orange-800/50 rounded-xl p-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="text-orange-300 text-xs uppercase font-semibold">Bargain Bin</div>
              <div className="text-white text-2xl font-bold">Pick {PICK_COUNT} of {BIN_SIZE}</div>
            </div>
            <div className="text-right">
              <div className="text-gray-400 text-xs">Selected</div>
              <div className="text-3xl font-bold text-orange-400">{selected.size}/{PICK_COUNT}</div>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-4 text-sm">
            <div className="text-gray-400">Budget: <span className="text-white font-semibold">${BUDGET}</span></div>
            <div className="text-gray-400">Spent: <span className="text-orange-400 font-semibold">${selected.size * CARD_COST}</span></div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
          {bin.map((c, i) => {
            const isSelected = selected.has(i);
            return (
              <button
                key={i}
                onClick={() => togglePick(i)}
                className={`relative aspect-[3/4] rounded-lg border-2 p-3 flex flex-col items-center justify-center transition-all ${isSelected ? 'bg-orange-600/30 border-orange-400 ring-2 ring-orange-500/50' : 'bg-gray-800/60 border-gray-700 hover:border-orange-600/50 hover:bg-gray-800'}`}
              >
                <div className="text-3xl mb-1">{SPORT_EMOJI[c.sport]}</div>
                <div className="text-white font-bold text-lg">{c.year}</div>
                <div className="text-gray-400 text-[10px] uppercase mt-1">#{i + 1}</div>
                <div className="text-xs text-gray-500 mt-2">$5</div>
                {isSelected && (
                  <div className="absolute top-1 right-1 w-6 h-6 rounded-full bg-orange-500 text-white text-sm font-bold flex items-center justify-center">
                    ✓
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex gap-3">
          <button onClick={reset} className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-lg transition-colors">
            Leave Bin
          </button>
          <button
            onClick={checkout}
            disabled={selected.size !== PICK_COUNT}
            className="flex-[2] px-4 py-3 bg-orange-600 hover:bg-orange-500 disabled:bg-gray-800 disabled:text-gray-600 text-white font-bold rounded-lg transition-colors"
          >
            {selected.size === PICK_COUNT ? `Check Out ($${BUDGET}) — Flip Cards` : `Pick ${PICK_COUNT - selected.size} More`}
          </button>
        </div>
      </div>
    );
  }

  // revealed
  const sorted = [...pickedCards].sort((a, b) => b.value - a.value);
  const unselected = bin.filter((_, i) => !selected.has(i)).sort((a, b) => b.value - a.value);
  const bestMissed = unselected[0];

  return (
    <div className="space-y-5">
      <div className={`bg-gradient-to-br border rounded-xl p-6 text-center ${profit >= 100 ? 'from-emerald-950/60 to-green-950/40 border-emerald-700/50' : profit >= 0 ? 'from-orange-950/60 to-amber-950/40 border-orange-700/50' : 'from-red-950/60 to-rose-950/40 border-red-800/50'}`}>
        <div className={`text-7xl font-bold ${grade.color} mb-2`}>{grade.letter}</div>
        <div className="text-white text-xl font-bold mb-1">{grade.label}</div>
        <div className="text-gray-300 text-sm mb-4">
          Paid <span className="text-white font-semibold">${BUDGET}</span> · Got <span className="text-white font-semibold">${totalValue.toFixed(0)}</span>
        </div>
        <div className={`text-3xl font-bold ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {profit >= 0 ? '+' : ''}${profit.toFixed(0)} profit
        </div>
        {gemCount > 0 && (
          <div className="mt-3 inline-flex items-center gap-1.5 bg-yellow-950/60 border border-yellow-700/50 text-yellow-400 text-xs font-semibold px-3 py-1 rounded-full">
            💎 {gemCount} Gem{gemCount > 1 ? 's' : ''} Found
          </div>
        )}
      </div>

      <div>
        <h3 className="text-white font-semibold mb-3">Your 10 Picks (revealed)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {sorted.map(c => (
            <div key={c.slug} className={`flex items-center gap-3 p-3 rounded-lg border ${c.value >= 100 ? 'bg-yellow-950/40 border-yellow-700/50' : c.value >= 25 ? 'bg-emerald-950/40 border-emerald-700/40' : c.value >= 5 ? 'bg-gray-800/60 border-gray-700' : 'bg-red-950/30 border-red-900/40'}`}>
              <div className="text-2xl">{SPORT_EMOJI[c.sport]}</div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-medium truncate">{c.player}</div>
                <div className="text-gray-500 text-xs truncate">{c.name}{c.rookie ? ' · RC' : ''}</div>
              </div>
              <div className={`text-sm font-bold ${c.value >= 100 ? 'text-yellow-400' : c.value >= 25 ? 'text-emerald-400' : c.value >= 5 ? 'text-gray-300' : 'text-red-400'}`}>
                ${c.value.toFixed(0)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {bestMissed && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-xs text-gray-500 uppercase mb-1">Best card you skipped</div>
          <div className="flex items-center gap-3">
            <div className="text-2xl">{SPORT_EMOJI[bestMissed.sport]}</div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">{bestMissed.player}</div>
              <div className="text-gray-500 text-xs truncate">{bestMissed.name}</div>
            </div>
            <div className="text-red-400 text-sm font-bold">${bestMissed.value.toFixed(0)}</div>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={share} className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors">
          📋 Copy Results
        </button>
        <button onClick={reset} className="flex-[2] px-4 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-lg transition-colors">
          Dig Another Bin
        </button>
      </div>
    </div>
  );
}
