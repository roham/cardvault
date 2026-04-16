'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { sportsCards } from '@/data/sports-cards';

type Tier = 'bullseye' | 'elite' | 'high' | 'mid' | 'common' | 'miss';

interface DartResult {
  tier: Tier;
  meterPos: number;
  points: number;
  card: { name: string; sport: string; value: string; player: string } | null;
}

interface TierConfig {
  label: string;
  color: string;
  ringColor: string;
  bgColor: string;
  valueRange: [number, number];
  points: number;
  emoji: string;
}

const TIER_CONFIG: Record<Tier, TierConfig> = {
  bullseye: {
    label: 'BULLSEYE · Grail Tier',
    color: 'text-amber-300',
    ringColor: 'bg-amber-500',
    bgColor: 'bg-amber-950/40 border-amber-600/50',
    valueRange: [5000, 1_000_000],
    points: 2500,
    emoji: '🎯',
  },
  elite: {
    label: 'Elite Tier',
    color: 'text-rose-300',
    ringColor: 'bg-rose-600',
    bgColor: 'bg-rose-950/40 border-rose-700/50',
    valueRange: [1000, 5000],
    points: 1000,
    emoji: '💎',
  },
  high: {
    label: 'High Tier',
    color: 'text-emerald-300',
    ringColor: 'bg-emerald-600',
    bgColor: 'bg-emerald-950/40 border-emerald-700/50',
    valueRange: [100, 1000],
    points: 500,
    emoji: '🟢',
  },
  mid: {
    label: 'Mid Tier',
    color: 'text-sky-300',
    ringColor: 'bg-sky-600',
    bgColor: 'bg-sky-950/40 border-sky-700/50',
    valueRange: [25, 100],
    points: 250,
    emoji: '🔵',
  },
  common: {
    label: 'Common Tier',
    color: 'text-gray-400',
    ringColor: 'bg-gray-500',
    bgColor: 'bg-gray-800/40 border-gray-600/50',
    valueRange: [0, 25],
    points: 100,
    emoji: '⚪',
  },
  miss: {
    label: 'MISS',
    color: 'text-red-500',
    ringColor: 'bg-red-900',
    bgColor: 'bg-red-950/60 border-red-800/70',
    valueRange: [0, 0],
    points: 0,
    emoji: '💥',
  },
};

// Value-filtered card pools for each tier
function parseCardValue(raw: string): number {
  const m = raw.match(/\$([\d,]+)/);
  if (!m) return 0;
  return parseInt(m[1].replace(/,/g, ''), 10);
}

function dateToSeed(d: Date): number {
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function meterPosToTier(pos: number, missRoll: number): Tier {
  if (missRoll < 0.03) return 'miss';
  const d = Math.abs(pos - 0.5);
  if (d < 0.02) return 'bullseye';
  if (d < 0.12) return 'elite';
  if (d < 0.26) return 'high';
  if (d < 0.38) return 'mid';
  return 'common';
}

function pickCardForTier(tier: Tier, rng: () => number) {
  if (tier === 'miss') return null;
  const [lo, hi] = TIER_CONFIG[tier].valueRange;
  const pool = sportsCards.filter(c => {
    const v = parseCardValue(c.estimatedValueRaw);
    return v >= lo && v < hi;
  });
  if (pool.length === 0) return null;
  const c = pool[Math.floor(rng() * pool.length)];
  const valMatch = c.estimatedValueRaw.match(/\$([\d,]+(?:\.\d+)?(?:[–-]\$?[\d,]+)?)/);
  return {
    name: c.name,
    sport: c.sport,
    value: valMatch ? `$${valMatch[1]}` : c.estimatedValueRaw.split('(')[0].trim(),
    player: c.player,
  };
}

function gradeFromScore(score: number): { letter: string; color: string; description: string } {
  if (score >= 5000) return { letter: 'S', color: 'text-amber-300', description: 'Grail hunter supreme' };
  if (score >= 3000) return { letter: 'A', color: 'text-rose-300', description: 'Elite arm' };
  if (score >= 1500) return { letter: 'B', color: 'text-emerald-300', description: 'Reliable thrower' };
  if (score >= 750) return { letter: 'C', color: 'text-sky-300', description: 'Consistent mid-ring' };
  if (score >= 300) return { letter: 'D', color: 'text-gray-400', description: 'Common-tier specialist' };
  return { letter: 'F', color: 'text-red-400', description: 'Needs practice' };
}

interface Stats {
  gamesPlayed: number;
  bestScore: number;
  bestGrade: string;
  lifetimeBullseyes: number;
  lifetimeMisses: number;
}

const INITIAL_STATS: Stats = { gamesPlayed: 0, bestScore: 0, bestGrade: '-', lifetimeBullseyes: 0, lifetimeMisses: 0 };

export default function CardDartsClient() {
  const [mode, setMode] = useState<'daily' | 'random'>('daily');
  const [meterPos, setMeterPos] = useState(0);
  const [meterDir, setMeterDir] = useState(1);
  const [throwing, setThrowing] = useState(false);
  const [paused, setPaused] = useState(true); // start paused until game begins
  const [darts, setDarts] = useState<DartResult[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [stats, setStats] = useState<Stats>(INITIAL_STATS);
  const [hydrated, setHydrated] = useState(false);
  const [shareMsg, setShareMsg] = useState<string | null>(null);

  const rngRef = useRef<() => number>(() => Math.random());
  const seedRef = useRef<number>(0);

  // Init RNG seed based on mode
  useEffect(() => {
    const seed = mode === 'daily'
      ? dateToSeed(new Date())
      : Math.floor(Math.random() * 1_000_000);
    seedRef.current = seed;
    rngRef.current = seededRandom(seed);
  }, [mode]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('cardvault_card_darts_stats');
      if (stored) setStats(JSON.parse(stored));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem('cardvault_card_darts_stats', JSON.stringify(stats));
    } catch {}
  }, [stats, hydrated]);

  // Meter sweep
  useEffect(() => {
    if (paused || gameOver) return;
    const interval = setInterval(() => {
      setMeterPos(p => {
        let next = p + meterDir * 0.022;
        if (next >= 1) { next = 1; setMeterDir(-1); }
        else if (next <= 0) { next = 0; setMeterDir(1); }
        return next;
      });
    }, 25);
    return () => clearInterval(interval);
  }, [paused, meterDir, gameOver]);

  const startGame = () => {
    const seed = mode === 'daily'
      ? dateToSeed(new Date())
      : Math.floor(Math.random() * 1_000_000);
    seedRef.current = seed;
    rngRef.current = seededRandom(seed);
    setDarts([]);
    setGameOver(false);
    setPaused(false);
    setShareMsg(null);
    setMeterPos(0);
    setMeterDir(1);
  };

  const throwDart = () => {
    if (paused || throwing || gameOver || darts.length >= 3) return;
    setThrowing(true);
    const pos = meterPos;
    const missRoll = rngRef.current();
    const tier = meterPosToTier(pos, missRoll);
    const card = pickCardForTier(tier, rngRef.current);
    const dart: DartResult = {
      tier,
      meterPos: pos,
      points: TIER_CONFIG[tier].points,
      card,
    };
    setPaused(true);
    setTimeout(() => {
      setDarts(prev => {
        const next = [...prev, dart];
        if (next.length >= 3) {
          setGameOver(true);
        }
        return next;
      });
      setThrowing(false);
      if (darts.length + 1 < 3) {
        setTimeout(() => setPaused(false), 600);
      }
    }, 400);
  };

  // Finalize stats on game over
  useEffect(() => {
    if (!gameOver || darts.length !== 3) return;
    const total = darts.reduce((s, d) => s + d.points, 0);
    const grade = gradeFromScore(total).letter;
    const bullseyeCount = darts.filter(d => d.tier === 'bullseye').length;
    const missCount = darts.filter(d => d.tier === 'miss').length;
    setStats(prev => {
      const gradeOrder = ['F', 'D', 'C', 'B', 'A', 'S'];
      const prevGradeIdx = gradeOrder.indexOf(prev.bestGrade);
      const newGradeIdx = gradeOrder.indexOf(grade);
      return {
        gamesPlayed: prev.gamesPlayed + 1,
        bestScore: Math.max(prev.bestScore, total),
        bestGrade: newGradeIdx > prevGradeIdx ? grade : prev.bestGrade,
        lifetimeBullseyes: prev.lifetimeBullseyes + bullseyeCount,
        lifetimeMisses: prev.lifetimeMisses + missCount,
      };
    });
  }, [gameOver, darts]);

  const totalScore = useMemo(() => darts.reduce((s, d) => s + d.points, 0), [darts]);
  const grade = useMemo(() => gradeFromScore(totalScore), [totalScore]);

  const shareResult = () => {
    const emoji = darts.map(d => {
      if (d.tier === 'bullseye') return '🎯';
      if (d.tier === 'elite') return '💎';
      if (d.tier === 'high') return '🟢';
      if (d.tier === 'mid') return '🔵';
      if (d.tier === 'common') return '⚪';
      return '💥';
    }).join(' ');
    const dateStr = new Date().toISOString().split('T')[0];
    const modeStr = mode === 'daily' ? `Daily ${dateStr}` : 'Random';
    const txt = `Card Darts (${modeStr}) ${emoji}\nGrade ${grade.letter} · ${totalScore} pts\ncardvault-two.vercel.app/card-darts`;
    navigator.clipboard?.writeText(txt).then(
      () => setShareMsg('Copied to clipboard!'),
      () => setShareMsg('Copy failed — select text manually'),
    );
  };

  const meterPct = meterPos * 100;

  return (
    <div className="space-y-6">
      {/* Mode toggle + stats */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="inline-flex rounded-lg border border-gray-700 overflow-hidden">
          <button
            onClick={() => setMode('daily')}
            className={`px-3 py-1.5 text-sm transition-colors ${mode === 'daily' ? 'bg-red-900/50 text-red-300' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
          >
            Daily
          </button>
          <button
            onClick={() => setMode('random')}
            className={`px-3 py-1.5 text-sm transition-colors ${mode === 'random' ? 'bg-red-900/50 text-red-300' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
          >
            Random
          </button>
        </div>
        <div className="ml-auto flex gap-3 text-xs text-gray-400">
          <span>Games: <span className="text-white font-semibold">{stats.gamesPlayed}</span></span>
          <span>Best: <span className={grade.color + ' font-semibold'}>{stats.bestGrade}</span> / <span className="text-white font-semibold">{stats.bestScore}</span></span>
          <span>🎯 {stats.lifetimeBullseyes}</span>
        </div>
      </div>

      {/* Dart board visualization */}
      <div className="bg-gradient-to-br from-gray-900 via-red-950/30 to-gray-900 border border-red-800/50 rounded-xl p-6">
        <div className="flex items-center justify-center mb-4">
          <div className="relative w-full max-w-md aspect-square">
            {/* Concentric rings */}
            <div className="absolute inset-0 rounded-full bg-gray-700/30 border-2 border-gray-600/40" />
            <div className="absolute inset-[12%] rounded-full bg-sky-900/30 border-2 border-sky-700/40" />
            <div className="absolute inset-[26%] rounded-full bg-emerald-900/30 border-2 border-emerald-700/40" />
            <div className="absolute inset-[38%] rounded-full bg-rose-900/40 border-2 border-rose-700/50" />
            <div className="absolute inset-[48%] rounded-full bg-amber-500/80 border-2 border-amber-300 shadow-lg shadow-amber-500/40" />
            {/* Dart markers */}
            {darts.map((d, idx) => {
              if (d.tier === 'miss') return null;
              const cfg = TIER_CONFIG[d.tier];
              const angle = (idx * 120 + 45) * (Math.PI / 180);
              const radiusPct = d.tier === 'bullseye' ? 0 :
                d.tier === 'elite' ? 22 :
                d.tier === 'high' ? 36 :
                d.tier === 'mid' ? 50 : 64;
              const x = 50 + Math.cos(angle) * radiusPct;
              const y = 50 + Math.sin(angle) * radiusPct;
              return (
                <div
                  key={idx}
                  className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 animate-[fadeIn_0.4s_ease-out]"
                  style={{ left: `${x}%`, top: `${y}%` }}
                  aria-label={`Dart ${idx + 1}: ${cfg.label}`}
                >
                  <div className={`w-4 h-4 rounded-full ${cfg.ringColor} border-2 border-white shadow-lg`} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Aim meter */}
        <div className="max-w-lg mx-auto">
          <div className="text-xs text-gray-400 mb-1 flex justify-between">
            <span>Common</span>
            <span>Mid</span>
            <span className="text-amber-300 font-semibold">🎯 Bullseye</span>
            <span>Mid</span>
            <span>Common</span>
          </div>
          <div className="relative h-6 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
            {/* Ring zones visualization */}
            <div className="absolute inset-0 flex">
              <div className="w-[12%] bg-gray-700/70" />
              <div className="w-[12%] bg-sky-900/70" />
              <div className="w-[12%] bg-emerald-900/70" />
              <div className="w-[10%] bg-rose-900/70" />
              <div className="w-[4%] bg-amber-500/80" />
              <div className="w-[10%] bg-rose-900/70" />
              <div className="w-[12%] bg-emerald-900/70" />
              <div className="w-[12%] bg-sky-900/70" />
              <div className="w-[16%] bg-gray-700/70" />
            </div>
            {/* Moving indicator */}
            <div
              className={`absolute top-0 w-1.5 h-full bg-white shadow-[0_0_8px_2px_rgba(255,255,255,0.8)] ${throwing ? 'animate-pulse' : ''}`}
              style={{ left: `${meterPct}%`, transform: 'translateX(-50%)' }}
            />
          </div>

          <div className="flex justify-center gap-3 mt-5">
            {darts.length === 0 && !gameOver ? (
              <button
                onClick={startGame}
                disabled={!paused && darts.length > 0}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-md transition-colors"
              >
                Start Game
              </button>
            ) : !gameOver ? (
              <button
                onClick={throwDart}
                disabled={paused || throwing || gameOver || darts.length >= 3}
                className="px-8 py-2.5 bg-red-600 hover:bg-red-500 disabled:bg-gray-700 disabled:text-gray-400 text-white font-bold rounded-md transition-colors"
              >
                {throwing ? 'Throwing…' : `Throw Dart ${darts.length + 1}`}
              </button>
            ) : (
              <button
                onClick={startGame}
                className="px-8 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-md transition-colors"
              >
                Throw Again
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Dart results list */}
      {darts.length > 0 && (
        <div className="space-y-3">
          {darts.map((d, idx) => {
            const cfg = TIER_CONFIG[d.tier];
            return (
              <div key={idx} className={`rounded-xl border p-4 ${cfg.bgColor}`}>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{cfg.emoji}</div>
                    <div>
                      <div className={`text-xs uppercase tracking-wide font-semibold ${cfg.color}`}>
                        Dart {idx + 1} &middot; {cfg.label}
                      </div>
                      {d.card ? (
                        <>
                          <div className="text-white font-medium mt-1">{d.card.name}</div>
                          <div className="text-xs text-gray-400">{d.card.player} &middot; {d.card.sport} &middot; {d.card.value}</div>
                        </>
                      ) : (
                        <div className="text-sm text-gray-500 italic mt-1">No card pulled.</div>
                      )}
                    </div>
                  </div>
                  <div className={`text-xl font-bold ${cfg.color}`}>+{d.points}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Game-over summary */}
      {gameOver && (
        <div className="bg-gradient-to-br from-gray-900 to-red-950/50 border border-red-700/50 rounded-xl p-6 text-center">
          <div className={`text-7xl font-black ${grade.color} mb-2`}>{grade.letter}</div>
          <div className="text-gray-400 text-sm mb-3">{grade.description}</div>
          <div className="text-3xl font-bold text-white mb-2">{totalScore} <span className="text-base text-gray-500 font-normal">total points</span></div>
          <div className="text-xs text-gray-500 mb-5">
            {darts.filter(d => d.tier === 'bullseye').length} bullseye{darts.filter(d => d.tier === 'bullseye').length !== 1 ? 's' : ''}
            {' · '}
            {darts.filter(d => d.tier === 'miss').length} miss{darts.filter(d => d.tier === 'miss').length !== 1 ? 'es' : ''}
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={shareResult}
              className="px-5 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white text-sm rounded-md transition-colors"
            >
              Copy Result
            </button>
            <button
              onClick={startGame}
              className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-sm rounded-md transition-colors"
            >
              Throw Again
            </button>
          </div>
          {shareMsg && <p className="text-xs text-emerald-400 mt-3">{shareMsg}</p>}
        </div>
      )}

      {/* Ring legend */}
      <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-5">
        <h2 className="font-bold text-white text-sm mb-3">Ring Tiers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {(['bullseye', 'elite', 'high', 'mid', 'common'] as Tier[]).map(t => {
            const cfg = TIER_CONFIG[t];
            return (
              <div key={t} className="flex items-center gap-2">
                <span className={`inline-block w-3 h-3 rounded-full ${cfg.ringColor}`} />
                <span className={`font-semibold ${cfg.color}`}>{cfg.label}</span>
                <span className="text-gray-500">&middot; {cfg.points} pts</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
