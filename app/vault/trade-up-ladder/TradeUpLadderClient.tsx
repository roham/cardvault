'use client';

import { useEffect, useMemo, useState } from 'react';

type Pace = 'patient' | 'balanced' | 'aggressive';

interface PaceProfile {
  multiplier: number;
  daysPerStep: number;
  slippage: number;
  successRate: number;
  label: string;
  blurb: string;
}

const PACE_PROFILES: Record<Pace, PaceProfile> = {
  patient: {
    multiplier: 1.6,
    daysPerStep: 45,
    slippage: 0.05,
    successRate: 0.92,
    label: 'Patient',
    blurb: '1.6× per step · 45 days · 5% slippage · 92% success rate',
  },
  balanced: {
    multiplier: 2.2,
    daysPerStep: 28,
    slippage: 0.08,
    successRate: 0.85,
    label: 'Balanced',
    blurb: '2.2× per step · 28 days · 8% slippage · 85% success rate',
  },
  aggressive: {
    multiplier: 3.0,
    daysPerStep: 18,
    slippage: 0.12,
    successRate: 0.72,
    label: 'Aggressive',
    blurb: '3.0× per step · 18 days · 12% slippage · 72% success rate',
  },
};

interface TierBand {
  min: number;
  max: number;
  name: string;
  emoji: string;
  examples: string[];
  partnerPool: string;
}

const TIER_BANDS: TierBand[] = [
  {
    min: 0,
    max: 25,
    name: 'Entry tier',
    emoji: '🟢',
    examples: ['Modern base commons', 'Single-card lots', 'Pokémon retail commons', 'Box-break remainders'],
    partnerPool: 'Massive — any Reddit trade thread, any card show',
  },
  {
    min: 25,
    max: 100,
    name: 'Rookie base',
    emoji: '🟢',
    examples: ['Base RCs of star players', 'Mid-Pokémon holo rares', 'PSA 9 modern commons', 'Low-end prospect refractors'],
    partnerPool: 'Very wide — social media DMs, card shows, Discord',
  },
  {
    min: 100,
    max: 500,
    name: 'Mid-range',
    emoji: '🟡',
    examples: ['PSA 10 rookies of stars', 'Silver Prizm RCs', 'Bowman Chrome 1st prospects', 'Pokémon Alt Art holos'],
    partnerPool: 'Wide — r/sportscards weekly threads, LCS, Whatnot',
  },
  {
    min: 500,
    max: 2000,
    name: 'Upper-mid',
    emoji: '🟡',
    examples: ['PSA 10 Silver Prizm stars', 'Graded vintage commons', 'Numbered /99 parallels', 'Sealed modern boxes'],
    partnerPool: 'Narrower — established Instagram collectors, LCS owners, dedicated trade groups',
  },
  {
    min: 2000,
    max: 10000,
    name: 'Enthusiast',
    emoji: '🟠',
    examples: ['/25 Gold parallels of stars', 'PSA 9 vintage HoFers', 'Graded Jordan/Griffey/Gretzky commons', 'Low-pop modern'],
    partnerPool: 'Narrow — known collectors, auction house consignments, dealer networks',
  },
  {
    min: 10000,
    max: 50000,
    name: 'High-end',
    emoji: '🟠',
    examples: ['PSA 10 modern GOATs', '/10 numbered rookies', 'Pre-war HoFer PSA 5-7', 'Low-pop pre-2000 stars'],
    partnerPool: 'Very narrow — top collectors, brokered trades, auction house channels',
  },
  {
    min: 50000,
    max: 250000,
    name: 'Near-grail',
    emoji: '🔴',
    examples: ['52 Topps HoFer PSA 7-8', 'Iconic modern 1/1s', 'RPA autos of generational players', 'T206 non-Wagner stars'],
    partnerPool: 'Tiny — five-figure dealer network, major auction houses',
  },
  {
    min: 250000,
    max: 10000000,
    name: 'Grail tier',
    emoji: '🏆',
    examples: ['52 Mantle PSA 8+', 'T206 Wagner', 'Jordan 86 Fleer PSA 10', 'SuperFractor 1/1 of a GOAT', 'Pikachu Illustrator'],
    partnerPool: 'Auction houses, private-sale brokers, vault-to-vault transfers',
  },
];

function tierFor(value: number): TierBand {
  return TIER_BANDS.find((t) => value >= t.min && value < t.max) ?? TIER_BANDS[TIER_BANDS.length - 1];
}

function fmtUSD(v: number): string {
  if (v >= 1_000_000) return '$' + (v / 1_000_000).toFixed(2) + 'M';
  if (v >= 1_000) return '$' + (v / 1_000).toFixed(v < 10_000 ? 2 : 1) + 'K';
  if (v >= 100) return '$' + Math.round(v).toLocaleString();
  return '$' + v.toFixed(v < 10 ? 2 : 0);
}

function fmtDays(d: number): string {
  if (d < 30) return d + 'd';
  if (d < 365) return Math.round(d / 30) + 'mo';
  const years = d / 365;
  return years.toFixed(1) + 'y';
}

interface LadderStep {
  index: number;
  fromValue: number;
  toValue: number;
  nominalTo: number;
  daysFromStart: number;
  cumulativeSuccessRate: number;
  tier: TierBand;
  fromTier: TierBand;
}

interface LadderPlan {
  steps: LadderStep[];
  targetValue: number;
  totalDays: number;
  finalSuccessRate: number;
  slippageDrag: number;
  stepsCount: number;
  realisticFinal: number;
}

function buildLadder(start: number, target: number, pace: Pace): LadderPlan {
  const prof = PACE_PROFILES[pace];
  const clampedStart = Math.max(1, start);
  const clampedTarget = Math.max(clampedStart * 1.5, target);
  const netMultPerStep = prof.multiplier * (1 - prof.slippage);
  const rawSteps = Math.log(clampedTarget / clampedStart) / Math.log(netMultPerStep);
  const stepsCount = Math.max(2, Math.min(12, Math.ceil(rawSteps)));
  const effectiveMult = Math.pow(clampedTarget / clampedStart, 1 / stepsCount) / (1 - prof.slippage);

  const steps: LadderStep[] = [];
  let current = clampedStart;
  let cumSuccess = 1;
  for (let i = 0; i < stepsCount; i++) {
    const fromValue = current;
    const nominalTo = fromValue * effectiveMult;
    const toValue = nominalTo * (1 - prof.slippage);
    cumSuccess *= prof.successRate;
    steps.push({
      index: i + 1,
      fromValue,
      toValue,
      nominalTo,
      daysFromStart: (i + 1) * prof.daysPerStep,
      cumulativeSuccessRate: cumSuccess,
      tier: tierFor(toValue),
      fromTier: tierFor(fromValue),
    });
    current = toValue;
  }

  const realisticFinal = current;
  const slippageDrag = 1 - realisticFinal / (clampedStart * Math.pow(effectiveMult, stepsCount));
  return {
    steps,
    targetValue: clampedTarget,
    totalDays: stepsCount * prof.daysPerStep,
    finalSuccessRate: cumSuccess,
    slippageDrag,
    stepsCount,
    realisticFinal,
  };
}

const STORAGE_KEY = 'cv_trade_up_ladder_v1';

interface SavedState {
  start: number;
  target: number;
  pace: Pace;
}

const PRESETS: Array<{ label: string; start: number; target: number; pace: Pace }> = [
  { label: '$5 → $5,000', start: 5, target: 5000, pace: 'balanced' },
  { label: '$25 → $500', start: 25, target: 500, pace: 'balanced' },
  { label: '$100 → $10K', start: 100, target: 10000, pace: 'balanced' },
  { label: '$50 → $50K', start: 50, target: 50000, pace: 'aggressive' },
  { label: '$10 → $1K (safe)', start: 10, target: 1000, pace: 'patient' },
  { label: '$1K → $100K', start: 1000, target: 100000, pace: 'balanced' },
];

export default function TradeUpLadderClient() {
  const [start, setStart] = useState<number>(25);
  const [target, setTarget] = useState<number>(500);
  const [pace, setPace] = useState<Pace>('balanced');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw) as SavedState;
        if (typeof s.start === 'number') setStart(s.start);
        if (typeof s.target === 'number') setTarget(s.target);
        if (s.pace === 'patient' || s.pace === 'balanced' || s.pace === 'aggressive') setPace(s.pace);
      }
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ start, target, pace }));
    } catch {
      /* ignore */
    }
  }, [start, target, pace, loaded]);

  const plan = useMemo(() => buildLadder(start, target, pace), [start, target, pace]);
  const profile = PACE_PROFILES[pace];

  const shareText = useMemo(() => {
    const emojiSteps = plan.steps
      .map((s) => s.tier.emoji)
      .join('');
    return `My CardVault Trade-Up Ladder: ${fmtUSD(start)} → ${fmtUSD(plan.realisticFinal)} in ${plan.stepsCount} steps (${fmtDays(plan.totalDays)})\n${emojiSteps}\nSuccess: ${(plan.finalSuccessRate * 100).toFixed(0)}% · ${profile.label} pace\nhttps://cardvault-two.vercel.app/vault/trade-up-ladder`;
  }, [plan, start, profile.label]);

  const [copied, setCopied] = useState(false);
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* ignore */
    }
  }

  const xShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 sm:p-7">
      {/* Presets */}
      <div className="mb-5">
        <div className="text-xs uppercase tracking-wider text-slate-500 mb-2">Quick presets</div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => {
            const active = start === p.start && target === p.target && pace === p.pace;
            return (
              <button
                key={p.label}
                onClick={() => {
                  setStart(p.start);
                  setTarget(p.target);
                  setPace(p.pace);
                }}
                className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                  active
                    ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Inputs */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1.5">Starting value</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
            <input
              type="number"
              min={1}
              max={100000}
              value={start}
              onChange={(e) => setStart(Math.max(1, Number(e.target.value) || 0))}
              className="w-full bg-slate-950/60 border border-slate-800 rounded-lg pl-7 pr-3 py-2.5 text-white focus:outline-none focus:border-emerald-700"
            />
          </div>
          <div className="mt-1.5 text-xs text-slate-500">{tierFor(start).emoji} {tierFor(start).name}</div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1.5">Target value</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
            <input
              type="number"
              min={50}
              max={10000000}
              value={target}
              onChange={(e) => setTarget(Math.max(50, Number(e.target.value) || 0))}
              className="w-full bg-slate-950/60 border border-slate-800 rounded-lg pl-7 pr-3 py-2.5 text-white focus:outline-none focus:border-emerald-700"
            />
          </div>
          <div className="mt-1.5 text-xs text-slate-500">{tierFor(target).emoji} {tierFor(target).name}</div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1.5">Pace</label>
          <div className="flex gap-1.5">
            {(Object.keys(PACE_PROFILES) as Pace[]).map((p) => (
              <button
                key={p}
                onClick={() => setPace(p)}
                className={`flex-1 px-2 py-2.5 text-xs font-semibold rounded-lg border transition-colors ${
                  pace === p
                    ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                {PACE_PROFILES[p].label}
              </button>
            ))}
          </div>
          <div className="mt-1.5 text-xs text-slate-500">{profile.blurb}</div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3.5">
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Steps</div>
          <div className="text-2xl font-bold text-white">{plan.stepsCount}</div>
        </div>
        <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3.5">
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total time</div>
          <div className="text-2xl font-bold text-white">{fmtDays(plan.totalDays)}</div>
        </div>
        <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3.5">
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Realistic final</div>
          <div className="text-2xl font-bold text-emerald-400">{fmtUSD(plan.realisticFinal)}</div>
        </div>
        <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3.5">
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">All-the-way odds</div>
          <div className="text-2xl font-bold text-white">{(plan.finalSuccessRate * 100).toFixed(0)}%</div>
        </div>
      </div>

      {/* Ladder */}
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-semibold text-white">Your ladder</h3>
          <div className="text-xs text-slate-500">{plan.stepsCount} trade{plan.stepsCount === 1 ? '' : 's'}</div>
        </div>

        {/* Starting rung */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-950/80 border border-emerald-800 flex items-center justify-center text-lg shrink-0">
            🧩
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-slate-500 uppercase tracking-wider">Start</div>
            <div className="text-sm text-slate-200 font-medium">{fmtUSD(start)} · {tierFor(start).name}</div>
            <div className="text-xs text-slate-500 mt-0.5 truncate">{tierFor(start).examples.slice(0, 2).join(' · ')}</div>
          </div>
        </div>

        {plan.steps.map((s) => (
          <div key={s.index} className="bg-slate-950/60 border border-slate-800 rounded-lg p-4">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-10 h-10 rounded-full bg-emerald-950/60 border border-emerald-800 flex items-center justify-center text-sm font-bold text-emerald-400 shrink-0">
                {s.index}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-sm text-slate-500">Trade</span>
                  <span className="text-sm font-semibold text-slate-300">{fmtUSD(s.fromValue)}</span>
                  <span className="text-slate-600">→</span>
                  <span className="text-sm font-semibold text-emerald-400">{fmtUSD(s.toValue)}</span>
                  <span className="text-xs text-slate-600 ml-auto">Day {s.daysFromStart}</span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {s.tier.emoji} {s.tier.name} · {(s.cumulativeSuccessRate * 100).toFixed(0)}% cum success
                </div>
              </div>
            </div>
            <div className="pl-14 text-xs text-slate-400">
              <div className="mb-1"><span className="text-slate-500">Category ideas:</span> {s.tier.examples.join(' · ')}</div>
              <div><span className="text-slate-500">Partner pool:</span> {s.tier.partnerPool}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Share */}
      <div className="mt-7 flex flex-wrap gap-3 items-center">
        <button
          onClick={handleCopy}
          className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          {copied ? 'Copied ✓' : 'Copy summary'}
        </button>
        <a
          href={xShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-semibold rounded-lg transition-colors"
        >
          Share on X
        </a>
        <div className="text-xs text-slate-500">
          Auto-saved to this browser · edit values anytime
        </div>
      </div>
    </div>
  );
}
