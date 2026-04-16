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
  description: string;
}

type StorageTier = 'casual' | 'premium' | 'vault';
type HorizonYear = 1 | 2 | 3 | 5 | 7 | 10 | 15 | 20;

interface YearProjection {
  year: HorizonYear;
  projected: number;
  cumulativeCost: number;
  totalBasis: number;
  netPosition: number;
  roi: number;
  annualizedReturn: number;
}

interface Verdict {
  label: string;
  tagline: string;
  classes: string;
  emoji: string;
}

/* ─── Helpers ──────────────────────────────────────── */
function parseValue(v: string): number {
  const m = v.match(/\$([0-9,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
}

function formatMoney(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 100_000) return `$${(n / 1000).toFixed(0)}K`;
  if (n >= 10_000) return `$${(n / 1000).toFixed(1)}K`;
  if (n >= 1000) return `$${Math.round(n).toLocaleString()}`;
  return `$${Math.round(n).toLocaleString()}`;
}

function signedMoney(n: number): string {
  const s = formatMoney(Math.abs(n));
  return n >= 0 ? `+${s}` : `-${s}`;
}

function pct(n: number, decimals = 1): string {
  return `${n >= 0 ? '+' : ''}${n.toFixed(decimals)}%`;
}

/* ─── Appreciation model ──────────────────────────── */
// Blends sport prestige, rookie scarcity, era (vintage premium), and value tier.
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
  if (age >= 36) rate += 0.03; // vintage pre-1990
  else if (age >= 15) rate += 0.015; // semi-vintage
  // Value tier: small cards have headroom, grails are sticky
  if (card.rawValue < 25) rate += 0.015;
  else if (card.rawValue < 250) rate += 0.005;
  else if (card.rawValue >= 5000) rate -= 0.005; // law of large numbers
  return rate;
}

const STORAGE_ANNUAL: Record<StorageTier, number> = {
  casual: 5,
  premium: 18,
  vault: 55,
};

const INSURANCE_RATE = 0.012; // 1.2% of insured value annually
const OPPORTUNITY_RATE = 0.07; // S&P long-term benchmark

/* ─── Projection engine ───────────────────────────── */
function projectYears(
  card: CardLite,
  purchasePrice: number,
  storageTier: StorageTier,
  includeInsurance: boolean,
  includeOpportunity: boolean,
  horizons: HorizonYear[]
): { rate: number; projections: YearProjection[]; breakevenYear: number | null } {
  const rate = appreciationRate(card);
  const storage = STORAGE_ANNUAL[storageTier];
  const insurance = includeInsurance ? INSURANCE_RATE : 0;
  const opp = includeOpportunity ? OPPORTUNITY_RATE : 0;
  const projections: YearProjection[] = [];
  let breakevenYear: number | null = null;

  // Year-by-year cumulative cost (insurance recalculated against current value annually)
  // For stability, we compute cumulative cost year-by-year up to max horizon
  const maxYear = Math.max(...horizons);
  const costByYear: number[] = [0];
  let running = 0;
  for (let y = 1; y <= maxYear; y++) {
    const valueThisYear = purchasePrice * Math.pow(1 + rate, y);
    const annualStorage = storage;
    const annualInsurance = valueThisYear * insurance;
    // Opportunity cost: compounding drag on purchase price (what the S&P would've done)
    const spPath = purchasePrice * (Math.pow(1 + opp, y) - Math.pow(1 + opp, y - 1));
    running += annualStorage + annualInsurance + spPath;
    costByYear[y] = running;
  }

  for (const year of horizons) {
    const projected = purchasePrice * Math.pow(1 + rate, year);
    const cumulativeCost = costByYear[year];
    const totalBasis = purchasePrice + cumulativeCost;
    const netPosition = projected - totalBasis;
    const roi = totalBasis > 0 ? ((projected - totalBasis) / totalBasis) * 100 : 0;
    const annualizedReturn = (Math.pow(projected / Math.max(totalBasis, 0.01), 1 / year) - 1) * 100;
    projections.push({ year, projected, cumulativeCost, totalBasis, netPosition, roi, annualizedReturn });

    if (breakevenYear === null && netPosition > 0) {
      breakevenYear = year;
    }
  }

  return { rate, projections, breakevenYear };
}

function verdictFromOptimal(optimalYear: number, peakNet: number): Verdict {
  if (peakNet <= 0) {
    return {
      label: 'COST SINK',
      tagline: 'Carrying costs swamp the appreciation. Flip it or cut the insurance.',
      classes: 'bg-rose-950/50 border-rose-800/50 text-rose-300',
      emoji: '🟥',
    };
  }
  if (optimalYear <= 1) {
    return {
      label: 'FLIP NOW',
      tagline: 'Maximum net is today. Appreciation will not outrun carrying costs.',
      classes: 'bg-amber-950/50 border-amber-800/50 text-amber-300',
      emoji: '⚡',
    };
  }
  if (optimalYear <= 4) {
    return {
      label: 'SHORT HOLD',
      tagline: 'Best return in the 2-4 year window. Plan your exit window.',
      classes: 'bg-sky-950/50 border-sky-800/50 text-sky-300',
      emoji: '🟦',
    };
  }
  if (optimalYear <= 10) {
    return {
      label: 'LONG HOLD',
      tagline: 'Patience pays. Net position keeps growing through year 10.',
      classes: 'bg-emerald-950/50 border-emerald-800/50 text-emerald-300',
      emoji: '🟩',
    };
  }
  return {
    label: 'GRAIL HOLD',
    tagline: 'Projection keeps climbing past year 10. This is a lifer.',
    classes: 'bg-violet-950/50 border-violet-800/50 text-violet-300',
    emoji: '💎',
  };
}

/* ─── Component ───────────────────────────────────── */
const HORIZONS: HorizonYear[] = [1, 2, 3, 5, 7, 10, 15, 20];

export default function HoldOptimizerClient() {
  // Pre-index card pool for picker
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
        description: c.description,
      }))
      .filter(c => c.rawValue > 0);
  }, []);

  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<CardLite | null>(null);
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [storageTier, setStorageTier] = useState<StorageTier>('premium');
  const [includeInsurance, setIncludeInsurance] = useState(true);
  const [includeOpportunity, setIncludeOpportunity] = useState(true);
  const [copied, setCopied] = useState(false);

  // Autocomplete suggestions
  const suggestions = useMemo(() => {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    return cardPool
      .filter(c =>
        c.player.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.set.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [query, cardPool]);

  const selectCard = useCallback((c: CardLite) => {
    setSelected(c);
    setQuery(c.name);
    setPurchasePrice(c.rawValue);
  }, []);

  // Run projection when selection + price set
  const result = useMemo(() => {
    if (!selected || purchasePrice <= 0) return null;
    return projectYears(
      selected,
      purchasePrice,
      storageTier,
      includeInsurance,
      includeOpportunity,
      HORIZONS
    );
  }, [selected, purchasePrice, storageTier, includeInsurance, includeOpportunity]);

  const optimal = useMemo(() => {
    if (!result) return null;
    // Include year 0 as baseline (sell today = 0 net)
    let bestYear = 0;
    let bestNet = 0;
    for (const p of result.projections) {
      if (p.netPosition > bestNet) {
        bestNet = p.netPosition;
        bestYear = p.year;
      }
    }
    return { year: bestYear, net: bestNet };
  }, [result]);

  const verdict = useMemo(() => {
    if (!optimal) return null;
    return verdictFromOptimal(optimal.year, optimal.net);
  }, [optimal]);

  const chartData = useMemo(() => {
    if (!result) return null;
    const maxVal = Math.max(
      ...result.projections.map(p => Math.max(p.projected, p.totalBasis))
    );
    return { maxVal };
  }, [result]);

  const handleCopy = useCallback(async () => {
    if (!selected || !result || !optimal || !verdict) return;
    const lines = [
      `Card Holding Period Optimizer`,
      `${selected.name}`,
      `Buy-in: ${formatMoney(purchasePrice)}`,
      `Annual appreciation: ${(result.rate * 100).toFixed(1)}%`,
      `Verdict: ${verdict.emoji} ${verdict.label}`,
      `Optimal hold: ${optimal.year}yr · Net ${signedMoney(optimal.net)}`,
      `Break-even: ${result.breakevenYear ? `year ${result.breakevenYear}` : 'never'}`,
      `cardvault-two.vercel.app/tools/hold-optimizer`,
    ];
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, [selected, result, optimal, verdict, purchasePrice]);

  useEffect(() => {
    if (!query) setSelected(null);
  }, [query]);

  /* ─── Render ──────────────────────────────────── */
  return (
    <div className="space-y-6">
      {/* Step 1: pick card */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">1</span>
          <h2 className="text-lg font-bold text-white">Pick a card</h2>
        </div>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by player, set, or card name..."
          className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
        />
        {suggestions.length > 0 && !selected && (
          <div className="mt-2 bg-gray-950 border border-gray-800 rounded-lg max-h-64 overflow-y-auto">
            {suggestions.map(s => (
              <button
                key={s.slug}
                onClick={() => selectCard(s)}
                className="w-full text-left px-4 py-2 hover:bg-gray-800 border-b border-gray-800 last:border-b-0"
              >
                <div className="text-sm text-white font-medium">{s.name}</div>
                <div className="text-xs text-gray-500">
                  {s.sport} &middot; {s.year} &middot; {formatMoney(s.rawValue)} raw
                  {s.rookie && <span className="ml-2 text-emerald-400">RC</span>}
                </div>
              </button>
            ))}
          </div>
        )}
        {selected && (
          <div className="mt-3 p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-lg">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-white">{selected.name}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {selected.sport} &middot; {selected.year} &middot; {formatMoney(selected.rawValue)} raw
                  {selected.rookie && <span className="ml-2 text-emerald-400 font-medium">ROOKIE</span>}
                </div>
              </div>
              <button
                onClick={() => { setSelected(null); setQuery(''); setPurchasePrice(0); }}
                className="text-xs text-gray-500 hover:text-white"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Step 2: inputs */}
      {selected && (
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">2</span>
            <h2 className="text-lg font-bold text-white">Set your cost basis</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Purchase price</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  min={1}
                  value={purchasePrice || ''}
                  onChange={e => setPurchasePrice(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg pl-7 pr-3 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Raw reference: {formatMoney(selected.rawValue)}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Storage tier</label>
              <div className="grid grid-cols-3 gap-2">
                {(['casual', 'premium', 'vault'] as StorageTier[]).map(t => (
                  <button
                    key={t}
                    onClick={() => setStorageTier(t)}
                    className={`px-2 py-2 rounded-lg border text-xs font-medium ${
                      storageTier === t
                        ? 'bg-emerald-600 border-emerald-500 text-white'
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
                className="accent-emerald-500"
              />
              <span className="text-sm text-gray-300">Insurance (1.2%/yr of value)</span>
            </label>
            <label className="flex items-center gap-2 px-3 py-2 bg-gray-950 border border-gray-700 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={includeOpportunity}
                onChange={e => setIncludeOpportunity(e.target.checked)}
                className="accent-emerald-500"
              />
              <span className="text-sm text-gray-300">Opportunity cost (7% S&amp;P)</span>
            </label>
          </div>
        </div>
      )}

      {/* Step 3: results */}
      {result && optimal && verdict && selected && (
        <>
          <div className={`border rounded-xl p-5 ${verdict.classes}`}>
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <div className="text-xs uppercase tracking-wider opacity-70 mb-1">Verdict</div>
                <div className="text-3xl font-black">{verdict.emoji} {verdict.label}</div>
              </div>
              <div className="text-right">
                <div className="text-xs uppercase tracking-wider opacity-70 mb-1">Optimal Hold</div>
                <div className="text-2xl font-black">
                  {optimal.year === 0 ? 'Sell now' : `${optimal.year} yr`}
                </div>
              </div>
            </div>
            <p className="text-sm opacity-90">{verdict.tagline}</p>
            <div className="mt-3 grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-xs opacity-70">Annual appreciation</div>
                <div className="text-lg font-bold">{(result.rate * 100).toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-xs opacity-70">Peak net position</div>
                <div className="text-lg font-bold">{signedMoney(optimal.net)}</div>
              </div>
              <div>
                <div className="text-xs opacity-70">Break-even</div>
                <div className="text-lg font-bold">{result.breakevenYear ? `Year ${result.breakevenYear}` : 'Never'}</div>
              </div>
            </div>
          </div>

          {/* Projection table */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
            <h3 className="text-lg font-bold text-white mb-4">Year-by-year projection</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-800">
                    <th className="py-2 pr-3">Year</th>
                    <th className="py-2 pr-3 text-right">Projected</th>
                    <th className="py-2 pr-3 text-right">Total basis</th>
                    <th className="py-2 pr-3 text-right">Net</th>
                    <th className="py-2 pr-3 text-right">ROI</th>
                    <th className="py-2 pl-3 text-right">Annualized</th>
                  </tr>
                </thead>
                <tbody>
                  {result.projections.map(p => {
                    const isOptimal = p.year === optimal.year;
                    const positive = p.netPosition >= 0;
                    return (
                      <tr
                        key={p.year}
                        className={`border-b border-gray-800/50 last:border-b-0 ${
                          isOptimal ? 'bg-emerald-950/30' : ''
                        }`}
                      >
                        <td className="py-2.5 pr-3 font-medium text-white">
                          {p.year}yr {isOptimal && <span className="text-emerald-400 text-xs">← peak</span>}
                        </td>
                        <td className="py-2.5 pr-3 text-right text-white">{formatMoney(p.projected)}</td>
                        <td className="py-2.5 pr-3 text-right text-gray-400">{formatMoney(p.totalBasis)}</td>
                        <td className={`py-2.5 pr-3 text-right font-semibold ${positive ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {signedMoney(p.netPosition)}
                        </td>
                        <td className={`py-2.5 pr-3 text-right ${positive ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {pct(p.roi)}
                        </td>
                        <td className={`py-2.5 pl-3 text-right ${positive ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {pct(p.annualizedReturn)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Visual bar chart */}
            {chartData && (
              <div className="mt-5 space-y-1.5">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Projected value vs. total basis</div>
                {result.projections.map(p => {
                  const projectedWidth = (p.projected / chartData.maxVal) * 100;
                  const basisWidth = (p.totalBasis / chartData.maxVal) * 100;
                  return (
                    <div key={p.year} className="flex items-center gap-2 text-xs">
                      <div className="w-10 text-gray-500">{p.year}yr</div>
                      <div className="flex-1 relative h-6 bg-gray-950 rounded">
                        <div
                          className="absolute top-0 left-0 h-full bg-emerald-600/60 rounded-l"
                          style={{ width: `${projectedWidth}%` }}
                        />
                        <div
                          className="absolute top-0 left-0 h-1.5 bg-rose-500/80"
                          style={{ width: `${basisWidth}%` }}
                        />
                        <div className="absolute inset-0 flex items-center px-2 text-[10px] text-white font-medium">
                          {formatMoney(p.projected)}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-emerald-600/60 rounded" /> Projected value</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-1 bg-rose-500/80 rounded" /> Total basis (cost + carry)</span>
                </div>
              </div>
            )}
          </div>

          {/* Cost breakdown */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
            <h3 className="text-lg font-bold text-white mb-3">Why this answer?</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <span className="text-emerald-400 font-medium">Appreciation model:</span> {(result.rate * 100).toFixed(1)}%/yr
                &middot; base {selected.sport} rate + {selected.rookie ? 'rookie bonus' : 'no rookie bonus'}
                {2026 - selected.year >= 36 && ' + vintage premium'}
                {2026 - selected.year >= 15 && 2026 - selected.year < 36 && ' + semi-vintage premium'}
                {selected.rawValue < 25 && ' + small-card headroom'}
                {selected.rawValue >= 5000 && ' − grail ceiling'}
              </li>
              <li>
                <span className="text-emerald-400 font-medium">Storage:</span> ${STORAGE_ANNUAL[storageTier]}/yr ({storageTier} tier)
              </li>
              <li>
                <span className="text-emerald-400 font-medium">Insurance:</span> {includeInsurance ? '1.2% of value/yr (recalculated each year)' : 'Excluded'}
              </li>
              <li>
                <span className="text-emerald-400 font-medium">Opportunity cost:</span> {includeOpportunity ? '7% annually vs. S&P 500 benchmark' : 'Excluded'}
              </li>
              <li className="text-gray-500 text-xs pt-2 border-t border-gray-800">
                Projections are directional. Real markets cycle — hedge with the Stress Test or see the Value Projector for bear/bull scenarios.
              </li>
            </ul>
          </div>

          {/* Share */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleCopy}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-sm"
            >
              {copied ? 'Copied!' : 'Copy verdict'}
            </button>
            <Link
              href={`/cards/${selected.slug}`}
              className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg text-sm"
            >
              View card page &rarr;
            </Link>
          </div>
        </>
      )}

      {!selected && (
        <div className="bg-gray-900/40 border border-dashed border-gray-800 rounded-xl p-8 text-center">
          <div className="text-4xl mb-2">⏳</div>
          <div className="text-gray-400 text-sm">Pick a card to see its optimal hold period.</div>
        </div>
      )}
    </div>
  );
}
