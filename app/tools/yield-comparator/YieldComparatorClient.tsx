'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

/* ─── Types ────────────────────────────────────────── */
interface CardLite {
  slug: string;
  name: string;
  year: number;
  set: string;
  sport: string;
  player: string;
  rawValue: number;
  rookie: boolean;
}

type StorageTier = 'casual' | 'premium' | 'vault';
type Horizon = 1 | 3 | 5 | 10;

interface Slot {
  id: string;
  card: CardLite | null;
  query: string;
  price: number;
}

interface YieldRow {
  slotId: string;
  card: CardLite;
  price: number;
  rate: number;
  projected: number;
  carry: number;
  oppCost: number;
  netPosition: number;
  annualizedYield: number;
  grossYield: number;
  rank: number;
}

/* ─── Helpers ──────────────────────────────────────── */
function parseValue(v: string): number {
  const m = v.match(/\$([0-9,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
}

function formatMoney(n: number): string {
  const sign = n < 0 ? '-' : '';
  const a = Math.abs(n);
  if (a >= 1_000_000) return `${sign}$${(a / 1_000_000).toFixed(2)}M`;
  if (a >= 100_000) return `${sign}$${(a / 1000).toFixed(0)}K`;
  if (a >= 10_000) return `${sign}$${(a / 1000).toFixed(1)}K`;
  return `${sign}$${Math.round(a).toLocaleString()}`;
}

function signedMoney(n: number): string {
  const s = formatMoney(Math.abs(n));
  return n >= 0 ? `+${s}` : `-${s}`;
}

function pct(n: number, decimals = 2): string {
  return `${n >= 0 ? '+' : ''}${n.toFixed(decimals)}%`;
}

function newId(): string {
  return `s_${Math.random().toString(36).slice(2, 9)}`;
}

/* ─── Appreciation model (shared with Hold Optimizer) ─ */
function appreciationRate(card: CardLite): number {
  const sportRate: Record<string, number> = {
    football: 0.08,
    basketball: 0.075,
    baseball: 0.055,
    hockey: 0.045,
  };
  let rate = sportRate[card.sport] ?? 0.06;
  if (card.rookie) rate += 0.02;
  const age = 2026 - card.year;
  if (age >= 36) rate += 0.03;
  else if (age >= 15) rate += 0.015;
  if (card.rawValue < 25) rate += 0.015;
  else if (card.rawValue < 250) rate += 0.005;
  else if (card.rawValue >= 5000) rate -= 0.005;
  return rate;
}

const STORAGE_ANNUAL: Record<StorageTier, number> = {
  casual: 5,
  premium: 18,
  vault: 55,
};

const INSURANCE_RATE = 0.012;
const OPPORTUNITY_RATE = 0.07;
const HORIZONS: Horizon[] = [1, 3, 5, 10];

/* ─── Yield engine ────────────────────────────────── */
function computeYield(
  card: CardLite,
  price: number,
  horizon: number,
  storageTier: StorageTier,
  includeInsurance: boolean,
  includeOpportunity: boolean
) {
  const rate = appreciationRate(card);
  const storage = STORAGE_ANNUAL[storageTier];
  const insurance = includeInsurance ? INSURANCE_RATE : 0;
  const opp = includeOpportunity ? OPPORTUNITY_RATE : 0;

  // Cumulative carry cost, recalculating insurance yearly on projected value
  let carry = 0;
  for (let y = 1; y <= horizon; y++) {
    const v = price * Math.pow(1 + rate, y);
    carry += storage + v * insurance;
  }
  // S&P opportunity cost: what the same dollars would've earned
  const spFuture = price * Math.pow(1 + opp, horizon);
  const oppCost = spFuture - price;

  const projected = price * Math.pow(1 + rate, horizon);
  const totalBasis = price + carry + (includeOpportunity ? oppCost : 0);
  const netPosition = projected - totalBasis;

  // Annualized yield = CAGR of projected vs total basis
  const annualizedYield = totalBasis > 0
    ? (Math.pow(Math.max(projected, 0.01) / totalBasis, 1 / horizon) - 1) * 100
    : 0;

  // Gross yield = raw rate (before carry/opportunity)
  const grossYield = rate * 100;

  return {
    rate,
    projected,
    carry,
    oppCost: includeOpportunity ? oppCost : 0,
    netPosition,
    annualizedYield,
    grossYield,
  };
}

/* ─── Component ───────────────────────────────────── */
const MAX_SLOTS = 6;

export default function YieldComparatorClient() {
  const cardPool = useMemo<CardLite[]>(() => {
    return sportsCards
      .map(c => ({
        slug: c.slug,
        name: c.name,
        year: c.year,
        set: c.set,
        sport: c.sport,
        player: c.player,
        rawValue: parseValue(c.estimatedValueRaw),
        rookie: c.rookie,
      }))
      .filter(c => c.rawValue > 0);
  }, []);

  const [slots, setSlots] = useState<Slot[]>([
    { id: newId(), card: null, query: '', price: 0 },
    { id: newId(), card: null, query: '', price: 0 },
  ]);
  const [horizon, setHorizon] = useState<Horizon>(5);
  const [storageTier, setStorageTier] = useState<StorageTier>('premium');
  const [includeInsurance, setIncludeInsurance] = useState(true);
  const [includeOpportunity, setIncludeOpportunity] = useState(true);
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const addSlot = useCallback(() => {
    setSlots(prev => prev.length >= MAX_SLOTS ? prev : [...prev, { id: newId(), card: null, query: '', price: 0 }]);
  }, []);

  const removeSlot = useCallback((id: string) => {
    setSlots(prev => prev.length <= 2 ? prev : prev.filter(s => s.id !== id));
  }, []);

  const updateSlot = useCallback((id: string, patch: Partial<Slot>) => {
    setSlots(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
  }, []);

  const selectCardForSlot = useCallback((id: string, c: CardLite) => {
    setSlots(prev => prev.map(s => s.id === id ? { ...s, card: c, query: c.name, price: c.rawValue } : s));
    setActiveSlotId(null);
  }, []);

  const clearSlot = useCallback((id: string) => {
    setSlots(prev => prev.map(s => s.id === id ? { ...s, card: null, query: '', price: 0 } : s));
  }, []);

  // Autocomplete suggestions per active slot
  const activeSuggestions = useMemo(() => {
    if (!activeSlotId) return [];
    const slot = slots.find(s => s.id === activeSlotId);
    if (!slot || !slot.query || slot.query.length < 2) return [];
    const q = slot.query.toLowerCase();
    return cardPool
      .filter(c =>
        c.player.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.set.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [activeSlotId, slots, cardPool]);

  /* Compute yields for all filled slots */
  const yieldRows = useMemo<YieldRow[]>(() => {
    const rows = slots
      .filter(s => s.card && s.price > 0)
      .map(s => {
        const r = computeYield(
          s.card!,
          s.price,
          horizon,
          storageTier,
          includeInsurance,
          includeOpportunity
        );
        return {
          slotId: s.id,
          card: s.card!,
          price: s.price,
          rate: r.rate,
          projected: r.projected,
          carry: r.carry,
          oppCost: r.oppCost,
          netPosition: r.netPosition,
          annualizedYield: r.annualizedYield,
          grossYield: r.grossYield,
          rank: 0,
        };
      });
    // Rank by annualized yield descending
    const sorted = [...rows].sort((a, b) => b.annualizedYield - a.annualizedYield);
    sorted.forEach((r, i) => { r.rank = i + 1; });
    // Return in original slot order so UI stays stable; rank is on the row object
    const rankMap = new Map(sorted.map(r => [r.slotId, r.rank]));
    return rows.map(r => ({ ...r, rank: rankMap.get(r.slotId) ?? 0 }));
  }, [slots, horizon, storageTier, includeInsurance, includeOpportunity]);

  const canCompare = yieldRows.length >= 2;
  const bestYield = canCompare ? Math.max(...yieldRows.map(r => r.annualizedYield)) : 0;
  const worstYield = canCompare ? Math.min(...yieldRows.map(r => r.annualizedYield)) : 0;
  const yieldSpread = bestYield - worstYield;

  const handleCopy = useCallback(async () => {
    if (!canCompare) return;
    const sorted = [...yieldRows].sort((a, b) => a.rank - b.rank);
    const lines = [
      `Card Yield Comparator — ${horizon}-year horizon`,
      ``,
      ...sorted.map(r => {
        const badge = r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : r.rank === 3 ? '🥉' : `${r.rank}.`;
        return `${badge} ${r.card.name.slice(0, 50)}`
          + `\n   Buy ${formatMoney(r.price)} → ${formatMoney(r.projected)} | Yield ${pct(r.annualizedYield)} | Net ${signedMoney(r.netPosition)}`;
      }),
      ``,
      `Spread: ${yieldSpread.toFixed(2)} percentage points`,
      `cardvault-two.vercel.app/tools/yield-comparator`,
    ];
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, [canCompare, yieldRows, horizon, yieldSpread]);

  // Clear active slot highlight when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-slot-picker]')) {
        setActiveSlotId(null);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  /* ─── Render ──────────────────────────────────── */
  return (
    <div className="space-y-6">
      {/* Step 1: Horizon + carry settings */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-bold flex items-center justify-center">1</span>
          <h2 className="text-lg font-bold text-white">Set the comparison frame</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Horizon</label>
            <div className="grid grid-cols-4 gap-2">
              {HORIZONS.map(h => (
                <button
                  key={h}
                  onClick={() => setHorizon(h)}
                  className={`px-2 py-2 rounded-lg border text-xs font-medium ${
                    horizon === h
                      ? 'bg-amber-600 border-amber-500 text-white'
                      : 'bg-gray-950 border-gray-700 text-gray-400 hover:text-white'
                  }`}
                >
                  {h} yr
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Storage tier</label>
            <div className="grid grid-cols-3 gap-2">
              {(['casual', 'premium', 'vault'] as StorageTier[]).map(t => (
                <button
                  key={t}
                  onClick={() => setStorageTier(t)}
                  className={`px-2 py-2 rounded-lg border text-xs font-medium ${
                    storageTier === t
                      ? 'bg-amber-600 border-amber-500 text-white'
                      : 'bg-gray-950 border-gray-700 text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="capitalize">{t}</div>
                  <div className="text-[10px] opacity-70">${STORAGE_ANNUAL[t]}/yr</div>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="flex items-center gap-2 px-3 py-2 bg-gray-950 border border-gray-700 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={includeInsurance}
              onChange={e => setIncludeInsurance(e.target.checked)}
              className="accent-amber-500"
            />
            <span className="text-sm text-gray-300">Insurance (1.2%/yr)</span>
          </label>
          <label className="flex items-center gap-2 px-3 py-2 bg-gray-950 border border-gray-700 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={includeOpportunity}
              onChange={e => setIncludeOpportunity(e.target.checked)}
              className="accent-amber-500"
            />
            <span className="text-sm text-gray-300">S&amp;P opportunity cost (7%)</span>
          </label>
        </div>
      </div>

      {/* Step 2: Card slots */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-bold flex items-center justify-center">2</span>
            <h2 className="text-lg font-bold text-white">Add cards to compare ({slots.length}/{MAX_SLOTS})</h2>
          </div>
          {slots.length < MAX_SLOTS && (
            <button
              onClick={addSlot}
              className="text-xs font-medium text-amber-400 hover:text-amber-300 border border-amber-800/60 hover:border-amber-600 px-3 py-1.5 rounded-lg"
            >
              + Add card
            </button>
          )}
        </div>

        <div className="space-y-3">
          {slots.map((slot, idx) => (
            <div key={slot.id} data-slot-picker className="bg-gray-950/60 border border-gray-800 rounded-lg p-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-800 text-gray-300 text-sm font-bold flex items-center justify-center">
                  {String.fromCharCode(65 + idx)}
                </div>
                <div className="flex-1 min-w-0">
                  {!slot.card ? (
                    <>
                      <input
                        type="text"
                        value={slot.query}
                        onChange={e => {
                          updateSlot(slot.id, { query: e.target.value });
                          setActiveSlotId(slot.id);
                        }}
                        onFocus={() => setActiveSlotId(slot.id)}
                        placeholder="Search by player, set, or card..."
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                      />
                      {activeSlotId === slot.id && activeSuggestions.length > 0 && (
                        <div className="mt-2 bg-gray-900 border border-gray-800 rounded-lg max-h-60 overflow-y-auto">
                          {activeSuggestions.map(c => (
                            <button
                              key={c.slug}
                              onClick={() => selectCardForSlot(slot.id, c)}
                              className="w-full text-left px-3 py-2 hover:bg-gray-800 border-b border-gray-800 last:border-b-0"
                            >
                              <div className="text-sm text-white">{c.name}</div>
                              <div className="text-xs text-gray-500">
                                {c.sport} &middot; {c.year} &middot; {formatMoney(c.rawValue)} raw
                                {c.rookie && <span className="ml-2 text-amber-400">RC</span>}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-white truncate">{slot.card.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {slot.card.sport} &middot; {slot.card.year} &middot; raw {formatMoney(slot.card.rawValue)}
                          {slot.card.rookie && <span className="ml-2 text-amber-400">RC</span>}
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-[10px] text-gray-500 uppercase tracking-wider">Buy-in</span>
                          <div className="relative inline-block">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">$</span>
                            <input
                              type="number"
                              min={1}
                              value={slot.price || ''}
                              onChange={e => updateSlot(slot.id, { price: Math.max(0, parseInt(e.target.value) || 0) })}
                              className="bg-gray-900 border border-gray-700 rounded pl-5 pr-2 py-1 text-sm text-white w-28 focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => clearSlot(slot.id)}
                        className="text-xs text-gray-500 hover:text-white"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>
                {slots.length > 2 && (
                  <button
                    onClick={() => removeSlot(slot.id)}
                    className="flex-shrink-0 text-gray-500 hover:text-rose-400 text-lg leading-none"
                    aria-label="Remove slot"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step 3: Results */}
      {canCompare && (
        <>
          {/* Summary */}
          <div className="bg-gradient-to-br from-amber-950/40 to-yellow-950/20 border border-amber-800/40 rounded-xl p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-wider text-amber-400/80 mb-1">
                  {horizon}-year annualized yield ranking
                </div>
                <div className="text-3xl font-black text-white">
                  {yieldRows.length} cards &middot; {yieldSpread.toFixed(2)}pp spread
                </div>
                <p className="text-sm text-amber-200/80 mt-2">
                  The top-ranked card beats the bottom-ranked by{' '}
                  <span className="font-semibold text-amber-300">{yieldSpread.toFixed(2)} percentage points</span>{' '}
                  per year after carry and opportunity cost.
                </p>
              </div>
              <button
                onClick={handleCopy}
                className="flex-shrink-0 text-xs font-medium text-amber-400 hover:text-amber-300 border border-amber-800/60 hover:border-amber-600 px-3 py-1.5 rounded-lg"
              >
                {copied ? '✓ Copied' : 'Copy results'}
              </button>
            </div>
          </div>

          {/* Ranked cards */}
          <div className="space-y-3">
            {[...yieldRows].sort((a, b) => a.rank - b.rank).map(row => {
              const badge = row.rank === 1 ? '🥇' : row.rank === 2 ? '🥈' : row.rank === 3 ? '🥉' : `#${row.rank}`;
              const isWinner = row.rank === 1;
              const yieldWidth = Math.max(0, Math.min(100, ((row.annualizedYield - worstYield) / Math.max(yieldSpread, 0.01)) * 100));
              return (
                <div
                  key={row.slotId}
                  className={`border rounded-xl p-5 ${
                    isWinner
                      ? 'bg-amber-950/30 border-amber-700/60'
                      : 'bg-gray-900/60 border-gray-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg font-black ${
                        isWinner ? 'bg-amber-600/30 text-amber-300' : 'bg-gray-800 text-gray-400'
                      }`}>
                        {badge}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-white truncate">{row.card.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {row.card.sport} &middot; {row.card.year}
                          {row.card.rookie && <span className="ml-2 text-amber-400">RC</span>}
                          &middot; Buy-in {formatMoney(row.price)}
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="text-xs text-gray-500 uppercase tracking-wider">Annual yield</div>
                      <div className={`text-2xl font-black ${
                        row.annualizedYield >= 0 ? 'text-amber-400' : 'text-rose-400'
                      }`}>
                        {pct(row.annualizedYield)}
                      </div>
                    </div>
                  </div>

                  {/* Yield bar */}
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-full rounded-full ${
                        isWinner ? 'bg-gradient-to-r from-amber-500 to-yellow-400' : 'bg-gray-600'
                      }`}
                      style={{ width: `${yieldWidth}%` }}
                    />
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="bg-gray-950/60 rounded-lg p-2">
                      <div className="text-[10px] uppercase tracking-wider text-gray-500">Gross rate</div>
                      <div className="text-sm font-bold text-white">{(row.rate * 100).toFixed(1)}%</div>
                    </div>
                    <div className="bg-gray-950/60 rounded-lg p-2">
                      <div className="text-[10px] uppercase tracking-wider text-gray-500">Projected</div>
                      <div className="text-sm font-bold text-white">{formatMoney(row.projected)}</div>
                    </div>
                    <div className="bg-gray-950/60 rounded-lg p-2">
                      <div className="text-[10px] uppercase tracking-wider text-gray-500">Carry</div>
                      <div className="text-sm font-bold text-gray-400">-{formatMoney(row.carry)}</div>
                    </div>
                    <div className="bg-gray-950/60 rounded-lg p-2">
                      <div className="text-[10px] uppercase tracking-wider text-gray-500">Net position</div>
                      <div className={`text-sm font-bold ${row.netPosition >= 0 ? 'text-amber-400' : 'text-rose-400'}`}>
                        {signedMoney(row.netPosition)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* How yield is calculated */}
          <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-white mb-2">How yield is calculated</h3>
            <ul className="text-xs text-gray-400 space-y-1.5 list-disc pl-5">
              <li><span className="text-gray-300 font-medium">Gross rate</span>: sport baseline + rookie bonus + era premium + value-tier adjustment.</li>
              <li><span className="text-gray-300 font-medium">Projected value</span>: buy-in compounded at gross rate for {horizon} year{horizon !== 1 && 's'}.</li>
              <li><span className="text-gray-300 font-medium">Carry</span>: annual storage + insurance (recalculated on projected value each year), summed over horizon.</li>
              {includeOpportunity && (
                <li><span className="text-gray-300 font-medium">Opportunity cost</span>: what the S&amp;P 500 would have earned on the same buy-in over the horizon.</li>
              )}
              <li><span className="text-gray-300 font-medium">Annualized yield</span>: CAGR of (projected) vs (buy-in + carry{includeOpportunity ? ' + opportunity cost' : ''}).</li>
            </ul>
          </div>
        </>
      )}

      {!canCompare && (
        <div className="bg-gray-900/40 border border-dashed border-gray-700 rounded-xl p-8 text-center">
          <div className="text-gray-500 text-sm">
            Pick at least 2 cards and set their buy-in prices to see the ranking.
          </div>
        </div>
      )}
    </div>
  );
}
