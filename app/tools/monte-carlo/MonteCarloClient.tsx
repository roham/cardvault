'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { sportsCards, type SportsCard } from '@/data/sports-cards';

interface Preset {
  key: string;
  name: string;
  vol: number; // annualized, decimal
  drift: number; // annualized, decimal
}

const PRESETS: Preset[] = [
  { key: 'blue-chip', name: 'Vintage Blue-Chip', vol: 0.15, drift: 0.06 },
  { key: 'hof-vet', name: 'HoF Veteran', vol: 0.25, drift: 0.08 },
  { key: 'rc-established', name: 'Modern RC — Established', vol: 0.35, drift: 0.1 },
  { key: 'rc-speculative', name: 'Modern RC — Speculative', vol: 0.55, drift: 0.15 },
  { key: 'prospect', name: 'Prospect Lottery', vol: 0.7, drift: 0.2 },
  { key: 'pokemon-sealed', name: 'Pokémon Sealed (stable)', vol: 0.2, drift: 0.07 },
];

const BINS = 40;
const PATHS = 10000;

function parseRawValue(raw: string): number {
  if (!raw) return 0;
  const nums = raw.replace(/,/g, '').match(/\d+(?:\.\d+)?/g);
  if (!nums || nums.length === 0) return 0;
  const parsed = nums.map((n) => parseFloat(n)).filter((n) => !isNaN(n));
  if (parsed.length === 0) return 0;
  // Use midpoint if two numbers (a range), else the single number
  if (parsed.length >= 2) return (parsed[0] + parsed[1]) / 2;
  return parsed[0];
}

// Box-Muller: two standard normals per iteration
function normalPair(rng: () => number): [number, number] {
  let u1 = rng();
  if (u1 < 1e-12) u1 = 1e-12;
  const u2 = rng();
  const mag = Math.sqrt(-2 * Math.log(u1));
  return [mag * Math.cos(2 * Math.PI * u2), mag * Math.sin(2 * Math.PI * u2)];
}

interface SimResult {
  finals: number[];
  median: number;
  mean: number;
  p5: number;
  p95: number;
  p25: number;
  p75: number;
  probGain: number;
  probTarget: number;
  worst: number;
  best: number;
  histogram: { lo: number; hi: number; count: number }[];
}

function runSimulation(params: {
  start: number;
  volAnnual: number;
  driftAnnual: number;
  days: number;
  target: number;
}): SimResult {
  const { start, volAnnual, driftAnnual, days, target } = params;
  const dt = 1 / 252;
  const steps = Math.max(1, Math.round((days / 365) * 252));
  const mu = driftAnnual;
  const sigma = volAnnual;

  const finals = new Array<number>(PATHS);
  let hit = 0;
  let up = 0;
  let best = -Infinity;
  let worst = Infinity;

  // Simple LCG for deterministic-but-fast RNG
  let seedState = 0x9e3779b9;
  const rng = () => {
    seedState = (seedState * 1664525 + 1013904223) | 0;
    return ((seedState >>> 0) % 1_000_000) / 1_000_000;
  };

  for (let p = 0; p < PATHS; p++) {
    let price = start;
    let pathMax = start;
    let i = 0;
    while (i < steps) {
      const [z1, z2] = normalPair(rng);
      const factor1 = Math.exp((mu - 0.5 * sigma * sigma) * dt + sigma * Math.sqrt(dt) * z1);
      price *= factor1;
      if (price > pathMax) pathMax = price;
      i++;
      if (i >= steps) break;
      const factor2 = Math.exp((mu - 0.5 * sigma * sigma) * dt + sigma * Math.sqrt(dt) * z2);
      price *= factor2;
      if (price > pathMax) pathMax = price;
      i++;
    }
    finals[p] = price;
    if (pathMax >= target) hit++;
    if (price > start) up++;
    if (price > best) best = price;
    if (price < worst) worst = price;
  }

  const sorted = [...finals].sort((a, b) => a - b);
  const pct = (q: number) => sorted[Math.max(0, Math.min(PATHS - 1, Math.floor(q * PATHS)))];

  const mean = finals.reduce((a, b) => a + b, 0) / PATHS;
  const median = pct(0.5);
  const p5 = pct(0.05);
  const p25 = pct(0.25);
  const p75 = pct(0.75);
  const p95 = pct(0.95);

  // Histogram with log-scale bins clipped to [p01, p99] so tail outliers don't break the chart
  const lo = pct(0.01);
  const hi = pct(0.99);
  const logLo = Math.log(Math.max(lo, 0.01));
  const logHi = Math.log(Math.max(hi, logLo * 1.01));
  const step = (logHi - logLo) / BINS;
  const buckets = new Array(BINS).fill(0);
  for (const v of finals) {
    const logV = Math.log(Math.max(v, 0.01));
    let idx = Math.floor((logV - logLo) / step);
    if (idx < 0) idx = 0;
    if (idx >= BINS) idx = BINS - 1;
    buckets[idx]++;
  }
  const histogram = buckets.map((count, i) => ({
    lo: Math.exp(logLo + i * step),
    hi: Math.exp(logLo + (i + 1) * step),
    count,
  }));

  return {
    finals,
    median,
    mean,
    p5,
    p95,
    p25,
    p75,
    probGain: up / PATHS,
    probTarget: hit / PATHS,
    worst,
    best,
    histogram,
  };
}

function formatMoney(n: number): string {
  if (!isFinite(n)) return '—';
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 10_000) return `$${(n / 1000).toFixed(1)}k`;
  if (n >= 1000) return `$${n.toFixed(0)}`;
  if (n >= 10) return `$${n.toFixed(0)}`;
  return `$${n.toFixed(2)}`;
}

function formatPct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

export default function MonteCarloClient() {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<SportsCard | null>(null);
  const [start, setStart] = useState(500);
  const [preset, setPreset] = useState<string>('rc-established');
  const [vol, setVol] = useState(0.35);
  const [drift, setDrift] = useState(0.1);
  const [days, setDays] = useState(365);
  const [target, setTarget] = useState(1000);
  const [result, setResult] = useState<SimResult | null>(null);
  const [running, setRunning] = useState(false);

  const searchResults = useMemo(() => {
    if (!query.trim() || query.length < 2) return [] as SportsCard[];
    const q = query.toLowerCase();
    const out: SportsCard[] = [];
    for (const c of sportsCards) {
      if (c.name.toLowerCase().includes(q) || c.player.toLowerCase().includes(q)) {
        out.push(c);
        if (out.length >= 8) break;
      }
    }
    return out;
  }, [query]);

  function pickCard(c: SportsCard) {
    setSelected(c);
    setQuery('');
    const v = parseRawValue(c.estimatedValueRaw);
    if (v > 0) {
      setStart(Math.round(v));
      setTarget(Math.round(v * 2));
    }
  }

  function applyPreset(key: string) {
    const p = PRESETS.find((x) => x.key === key);
    if (!p) return;
    setPreset(key);
    setVol(p.vol);
    setDrift(p.drift);
  }

  function run() {
    if (start <= 0) return;
    setRunning(true);
    // Defer so UI can show "running" state
    setTimeout(() => {
      const r = runSimulation({
        start,
        volAnnual: vol,
        driftAnnual: drift,
        days,
        target: target > 0 ? target : start * 2,
      });
      setResult(r);
      setRunning(false);
    }, 50);
  }

  const maxBinCount = result ? Math.max(...result.histogram.map((b) => b.count)) : 1;

  return (
    <div className="space-y-6">
      {/* Card picker */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-cyan-300">
          1. Pick a card (optional)
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by player or card name…"
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none"
        />
        {searchResults.length > 0 && (
          <ul className="mt-2 divide-y divide-slate-800 rounded-lg border border-slate-800 bg-slate-950/60">
            {searchResults.map((c) => (
              <li key={c.slug}>
                <button
                  onClick={() => pickCard(c)}
                  className="block w-full px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800"
                >
                  <div className="font-medium">{c.name}</div>
                  <div className="text-[11px] text-slate-500">{c.estimatedValueRaw}</div>
                </button>
              </li>
            ))}
          </ul>
        )}
        {selected && (
          <div className="mt-3 flex items-center justify-between rounded-lg border border-cyan-500/40 bg-cyan-500/5 px-3 py-2 text-sm">
            <div>
              <div className="font-semibold text-slate-200">{selected.name}</div>
              <div className="text-[11px] text-slate-500">{selected.estimatedValueRaw}</div>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="text-xs text-slate-500 hover:text-slate-300"
            >
              clear
            </button>
          </div>
        )}
      </div>

      {/* Parameters */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
        <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-cyan-300">
          2. Set parameters
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs text-slate-400">Starting price ($)</span>
            <input
              type="number"
              min={1}
              step={1}
              value={start}
              onChange={(e) => setStart(Math.max(1, parseFloat(e.target.value) || 0))}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs text-slate-400">Target price ($) — path hit probability</span>
            <input
              type="number"
              min={0}
              step={1}
              value={target}
              onChange={(e) => setTarget(Math.max(0, parseFloat(e.target.value) || 0))}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            />
          </label>
        </div>

        <div className="mt-3">
          <div className="mb-1 text-xs text-slate-400">Volatility profile</div>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.key}
                onClick={() => applyPreset(p.key)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                  preset === p.key
                    ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200'
                    : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <label className="block">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Volatility (annualized)</span>
              <span className="font-mono text-cyan-300">{formatPct(vol)}</span>
            </div>
            <input
              type="range"
              min={5}
              max={90}
              value={Math.round(vol * 100)}
              onChange={(e) => {
                setVol(parseInt(e.target.value) / 100);
                setPreset('');
              }}
              className="mt-1 w-full"
            />
          </label>
          <label className="block">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Drift (expected annual return)</span>
              <span className="font-mono text-cyan-300">{formatPct(drift)}</span>
            </div>
            <input
              type="range"
              min={-20}
              max={40}
              value={Math.round(drift * 100)}
              onChange={(e) => {
                setDrift(parseInt(e.target.value) / 100);
                setPreset('');
              }}
              className="mt-1 w-full"
            />
          </label>
          <label className="block">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Time horizon (days)</span>
              <span className="font-mono text-cyan-300">{days}d</span>
            </div>
            <input
              type="range"
              min={30}
              max={730}
              step={5}
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="mt-1 w-full"
            />
          </label>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={run}
          disabled={running || start <= 0}
          className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500 disabled:opacity-60"
        >
          {running ? 'Running 10,000 paths…' : 'Run Simulation'}
        </button>
        {result && (
          <button
            onClick={() => {
              if (!result) return;
              const text = `Card Monte Carlo · Start ${formatMoney(start)} · ${days}d · Vol ${formatPct(vol)} Drift ${formatPct(drift)}\nMedian ${formatMoney(result.median)} · P5 ${formatMoney(result.p5)} · P95 ${formatMoney(result.p95)}\nProb gain ${formatPct(result.probGain)} · Hit ${formatMoney(target)}: ${formatPct(result.probTarget)}\nhttps://cardvault-two.vercel.app/tools/monte-carlo`;
              if (navigator.clipboard) navigator.clipboard.writeText(text).catch(() => {});
            }}
            className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-2 text-sm font-semibold text-cyan-300 hover:bg-cyan-500/20"
          >
            Copy Result
          </button>
        )}
        <span className="text-xs text-slate-500">
          10,000 paths, daily steps, geometric Brownian motion.
        </span>
      </div>

      {/* Results */}
      {result && (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <ResultCard label="Median (P50)" value={formatMoney(result.median)} tone="cyan" />
            <ResultCard label="Mean" value={formatMoney(result.mean)} tone="slate" />
            <ResultCard label="5th pct" value={formatMoney(result.p5)} tone="red" />
            <ResultCard label="95th pct" value={formatMoney(result.p95)} tone="emerald" />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <ResultCard label="Prob of gain" value={formatPct(result.probGain)} tone="emerald" />
            <ResultCard
              label={`Hit ${formatMoney(target)}`}
              value={formatPct(result.probTarget)}
              tone="amber"
            />
            <ResultCard label="Worst sim" value={formatMoney(result.worst)} tone="red" />
            <ResultCard label="Best sim" value={formatMoney(result.best)} tone="emerald" />
          </div>

          {/* Histogram */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Final price distribution (log scale, 1st–99th percentile)
              </div>
              <div className="text-[11px] text-slate-500">{PATHS.toLocaleString()} paths</div>
            </div>
            <svg viewBox={`0 0 ${BINS * 10} 160`} className="w-full">
              {/* Start price guide */}
              {(() => {
                const histMin = result.histogram[0]?.lo ?? 0;
                const histMax = result.histogram[BINS - 1]?.hi ?? 1;
                if (start < histMin || start > histMax) return null;
                const logStart = Math.log(start);
                const logLo = Math.log(histMin);
                const logHi = Math.log(histMax);
                const x = ((logStart - logLo) / (logHi - logLo)) * (BINS * 10);
                return (
                  <line
                    x1={x}
                    x2={x}
                    y1={0}
                    y2={140}
                    stroke="#64748b"
                    strokeDasharray="4 2"
                    strokeWidth="1"
                  />
                );
              })()}
              {/* Target guide */}
              {(() => {
                const histMin = result.histogram[0]?.lo ?? 0;
                const histMax = result.histogram[BINS - 1]?.hi ?? 1;
                if (target <= 0 || target < histMin || target > histMax) return null;
                const logT = Math.log(target);
                const logLo = Math.log(histMin);
                const logHi = Math.log(histMax);
                const x = ((logT - logLo) / (logHi - logLo)) * (BINS * 10);
                return (
                  <line
                    x1={x}
                    x2={x}
                    y1={0}
                    y2={140}
                    stroke="#f59e0b"
                    strokeDasharray="4 2"
                    strokeWidth="1"
                  />
                );
              })()}
              {result.histogram.map((b, i) => {
                const h = (b.count / maxBinCount) * 135;
                const isGain = b.lo >= start;
                const color = isGain ? '#34d399' : '#fb7185';
                return (
                  <rect
                    key={i}
                    x={i * 10 + 1}
                    y={140 - h}
                    width={8}
                    height={h}
                    fill={color}
                    opacity={0.85}
                  >
                    <title>
                      {`${formatMoney(b.lo)}–${formatMoney(b.hi)} · ${b.count.toLocaleString()} paths`}
                    </title>
                  </rect>
                );
              })}
              {/* x-axis labels */}
              <text x={2} y={156} fill="#64748b" fontSize="9">
                {formatMoney(result.histogram[0]?.lo ?? 0)}
              </text>
              <text x={BINS * 10 - 40} y={156} fill="#64748b" fontSize="9">
                {formatMoney(result.histogram[BINS - 1]?.hi ?? 0)}
              </text>
            </svg>
            <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-sm bg-emerald-400" /> Above start
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-sm bg-rose-400" /> Below start
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="inline-block h-px w-3 bg-slate-400" /> Start {formatMoney(start)}
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="inline-block h-px w-3 bg-amber-400" /> Target {formatMoney(target)}
              </span>
            </div>
          </div>

          {/* Interpretation */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 text-sm text-slate-300">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-cyan-300">
              Interpretation
            </div>
            <p>
              Starting at <span className="font-semibold">{formatMoney(start)}</span> over{' '}
              <span className="font-semibold">{days}</span> days with{' '}
              <span className="font-semibold">{formatPct(vol)}</span> volatility and{' '}
              <span className="font-semibold">{formatPct(drift)}</span> drift, the typical outcome
              is <span className="font-semibold text-cyan-300">{formatMoney(result.median)}</span>.
              There is a <span className="font-semibold">{formatPct(result.probGain)}</span> chance
              of ending above the start, and a{' '}
              <span className="font-semibold">{formatPct(result.probTarget)}</span> chance the price
              touches <span className="font-semibold">{formatMoney(target)}</span> at any point in
              the horizon.
            </p>
            <p className="mt-2 text-xs text-slate-500">
              P5 = {formatMoney(result.p5)} means there is a 5% chance the final price is below
              this level. P95 = {formatMoney(result.p95)} means a 5% chance it lands above.
            </p>
          </div>
        </>
      )}

      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-[11px] text-amber-200">
        <span className="font-semibold">Not investment advice.</span> This tool is a probability
        sketch based on user-supplied volatility and drift assumptions. It is not a prediction and
        does not account for fat-tail events (crashes, injuries, controversies) or liquidity
        constraints. Real hobby price movements may be wider than what GBM models imply.
      </div>

      {!result && (
        <div className="rounded-xl border border-dashed border-slate-800 p-6 text-center text-sm text-slate-500">
          Pick a card or set a starting price, choose a preset, then click{' '}
          <span className="font-semibold">Run Simulation</span> to see the outcome distribution.
          Link back to any card page at{' '}
          <Link href="/tools/grading-roi" className="text-cyan-300 hover:underline">
            related tools
          </Link>
          .
        </div>
      )}
    </div>
  );
}

function ResultCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'cyan' | 'slate' | 'red' | 'emerald' | 'amber';
}) {
  const colors = {
    cyan: 'border-cyan-500/40 bg-cyan-500/5 text-cyan-200',
    slate: 'border-slate-700 bg-slate-900/60 text-slate-200',
    red: 'border-red-500/40 bg-red-500/5 text-red-200',
    emerald: 'border-emerald-500/40 bg-emerald-500/5 text-emerald-200',
    amber: 'border-amber-500/40 bg-amber-500/5 text-amber-200',
  };
  return (
    <div className={`rounded-xl border p-3 ${colors[tone]}`}>
      <div className="text-[10px] uppercase tracking-wide opacity-80">{label}</div>
      <div className="mt-0.5 text-xl font-bold">{value}</div>
    </div>
  );
}
