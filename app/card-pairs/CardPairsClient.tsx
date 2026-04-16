'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { sportsCards } from '@/data/sports-cards';

type Mode = 'daily' | 'random';
type Phase = 'menu' | 'round' | 'reveal' | 'summary';

interface Round {
  cards: typeof sportsCards[number][];
  values: number[];
  target: number;
}

interface RoundResult {
  pickedIdx: [number, number] | null;
  pickedSum: number;
  bestIdx: [number, number];
  bestSum: number;
  diff: number;             // |pickedSum - target|
  diffPct: number;          // diff / target
  points: number;           // 0-100
  bucket: 'bullseye' | 'close' | 'medium' | 'far' | 'miss';
}

interface Stats {
  gamesPlayed: number;
  bestScore: number;
  bullseyes: number;
  totalRounds: number;
  totalPoints: number;
}

const STORAGE_KEY = 'cv-card-pairs-v1';

function parseValue(v: string): number {
  const m = v.match(/\$([0-9,.]+)/);
  return m ? parseFloat(m[1].replace(/,/g, '')) : 5;
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

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function generateRounds(rng: () => number, count: number): Round[] {
  const eligible = sportsCards.filter(c => {
    const v = parseValue(c.estimatedValueRaw);
    return v >= 5;
  });
  const rounds: Round[] = [];
  for (let i = 0; i < count; i++) {
    const sample: typeof sportsCards[number][] = [];
    const usedSlugs = new Set<string>();
    while (sample.length < 4) {
      const c = eligible[Math.floor(rng() * eligible.length)];
      if (!usedSlugs.has(c.slug)) {
        usedSlugs.add(c.slug);
        sample.push(c);
      }
    }
    const values = sample.map(c => parseValue(c.estimatedValueRaw));
    // Find all pair sums, pick target in range
    const pairSums: number[] = [];
    for (let a = 0; a < 4; a++) {
      for (let b = a + 1; b < 4; b++) {
        pairSums.push(values[a] + values[b]);
      }
    }
    pairSums.sort((a, b) => a - b);
    const minSum = pairSums[0];
    const maxSum = pairSums[pairSums.length - 1];
    // Target inside the achievable range; lean toward middle
    const target = Math.round(minSum + (maxSum - minSum) * (0.25 + rng() * 0.5));
    rounds.push({ cards: sample, values, target });
  }
  return rounds;
}

function bestPair(values: number[], target: number): [number, number, number] {
  let bestI = 0, bestJ = 1, bestDiff = Infinity, bestSum = 0;
  for (let i = 0; i < values.length; i++) {
    for (let j = i + 1; j < values.length; j++) {
      const s = values[i] + values[j];
      const d = Math.abs(s - target);
      if (d < bestDiff) {
        bestDiff = d;
        bestSum = s;
        bestI = i;
        bestJ = j;
      }
    }
  }
  return [bestI, bestJ, bestSum];
}

function scorePair(diffPct: number): { points: number; bucket: RoundResult['bucket'] } {
  if (diffPct <= 0.05) return { points: 100, bucket: 'bullseye' };
  if (diffPct <= 0.15) return { points: 75, bucket: 'close' };
  if (diffPct <= 0.30) return { points: 50, bucket: 'medium' };
  if (diffPct <= 0.50) return { points: 25, bucket: 'far' };
  return { points: 0, bucket: 'miss' };
}

function bucketEmoji(b: RoundResult['bucket']): string {
  return b === 'bullseye' ? '🎯' : b === 'close' ? '🟢' : b === 'medium' ? '🟡' : b === 'far' ? '🟠' : '⬜';
}

function loadStats(): Stats {
  if (typeof window === 'undefined') return { gamesPlayed: 0, bestScore: 0, bullseyes: 0, totalRounds: 0, totalPoints: 0 };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { gamesPlayed: 0, bestScore: 0, bullseyes: 0, totalRounds: 0, totalPoints: 0 };
    return JSON.parse(raw);
  } catch {
    return { gamesPlayed: 0, bestScore: 0, bullseyes: 0, totalRounds: 0, totalPoints: 0 };
  }
}

function saveStats(s: Stats) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch { /* noop */ }
}

function gradeFromScore(total: number): string {
  if (total >= 900) return 'S';
  if (total >= 750) return 'A';
  if (total >= 600) return 'B';
  if (total >= 400) return 'C';
  if (total >= 200) return 'D';
  return 'F';
}

function currency(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`;
  return `$${Math.round(n).toLocaleString()}`;
}

const ROUND_COUNT = 10;

export default function CardPairsClient() {
  const [phase, setPhase] = useState<Phase>('menu');
  const [mode, setMode] = useState<Mode>('daily');
  const [rounds, setRounds] = useState<Round[]>([]);
  const [roundIdx, setRoundIdx] = useState(0);
  const [selected, setSelected] = useState<number[]>([]);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [stats, setStats] = useState<Stats>({ gamesPlayed: 0, bestScore: 0, bullseyes: 0, totalRounds: 0, totalPoints: 0 });

  useEffect(() => { setStats(loadStats()); }, []);

  const startGame = useCallback((m: Mode) => {
    const seed = m === 'daily' ? dateHash() : Math.floor(Math.random() * 1e9);
    const rng = seededRandom(seed);
    const newRounds = generateRounds(rng, ROUND_COUNT);
    setMode(m);
    setRounds(newRounds);
    setRoundIdx(0);
    setSelected([]);
    setResults([]);
    setPhase('round');
  }, []);

  const submitRound = useCallback(() => {
    if (selected.length !== 2) return;
    const round = rounds[roundIdx];
    const pickedSum = selected.reduce((sum, i) => sum + round.values[i], 0);
    const [bi, bj, bs] = bestPair(round.values, round.target);
    const diff = Math.abs(pickedSum - round.target);
    const diffPct = diff / round.target;
    const { points, bucket } = scorePair(diffPct);
    const result: RoundResult = {
      pickedIdx: [selected[0], selected[1]],
      pickedSum,
      bestIdx: [bi, bj],
      bestSum: bs,
      diff,
      diffPct,
      points,
      bucket,
    };
    setResults(r => [...r, result]);
    setPhase('reveal');
  }, [selected, rounds, roundIdx]);

  const nextRound = useCallback(() => {
    if (roundIdx + 1 >= ROUND_COUNT) {
      // End of game — save stats
      const totalPoints = results.reduce((sum, r) => sum + r.points, 0);
      const bullseyes = results.filter(r => r.bucket === 'bullseye').length;
      const newStats: Stats = {
        gamesPlayed: stats.gamesPlayed + 1,
        bestScore: Math.max(stats.bestScore, totalPoints),
        bullseyes: stats.bullseyes + bullseyes,
        totalRounds: stats.totalRounds + ROUND_COUNT,
        totalPoints: stats.totalPoints + totalPoints,
      };
      setStats(newStats);
      saveStats(newStats);
      setPhase('summary');
    } else {
      setRoundIdx(i => i + 1);
      setSelected([]);
      setPhase('round');
    }
  }, [roundIdx, results, stats]);

  const toggleSelect = (i: number) => {
    setSelected(prev => {
      if (prev.includes(i)) return prev.filter(x => x !== i);
      if (prev.length >= 2) return [prev[1], i];
      return [...prev, i];
    });
  };

  const reset = () => {
    setPhase('menu');
    setRounds([]);
    setRoundIdx(0);
    setSelected([]);
    setResults([]);
  };

  const copyResults = () => {
    const totalPoints = results.reduce((sum, r) => sum + r.points, 0);
    const grade = gradeFromScore(totalPoints);
    const grid = results.map(r => bucketEmoji(r.bucket)).join('');
    const header = mode === 'daily' ? `Card Pair Trader · Daily ${new Date().toISOString().slice(0, 10)}` : 'Card Pair Trader · Random';
    const text = `${header}\nScore: ${totalPoints}/1000 · Grade ${grade}\n${grid}\nhttps://cardvault-two.vercel.app/card-pairs`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => alert('Results copied'));
    }
  };

  if (phase === 'menu') {
    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-indigo-950/50 to-gray-900 border border-indigo-900/40 rounded-2xl p-5 sm:p-6">
          <h2 className="text-xl font-bold text-white mb-2">Choose a mode</h2>
          <p className="text-gray-400 text-sm mb-4">10 rounds. Pick the best pair each round. Every pair picker sees the same daily board.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => startGame('daily')}
              className="text-left p-4 rounded-xl border border-indigo-700 bg-indigo-950/60 hover:bg-indigo-950 transition-colors"
            >
              <div className="text-2xl mb-1">🗓️</div>
              <div className="text-white font-semibold">Daily Challenge</div>
              <div className="text-gray-400 text-xs mt-1">Same 10 rounds for every collector today. Share your score.</div>
            </button>
            <button
              onClick={() => startGame('random')}
              className="text-left p-4 rounded-xl border border-gray-700 bg-gray-900 hover:bg-gray-800 transition-colors"
            >
              <div className="text-2xl mb-1">🎲</div>
              <div className="text-white font-semibold">Random Practice</div>
              <div className="text-gray-400 text-xs mt-1">Fresh 10-round gauntlet every time. Unlimited plays.</div>
            </button>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 sm:p-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-3">Your Stats</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <MiniStat label="Games" value={stats.gamesPlayed.toString()} />
            <MiniStat label="Best Score" value={stats.bestScore.toString()} />
            <MiniStat label="Bullseyes" value={stats.bullseyes.toString()} />
            <MiniStat label="Rounds" value={stats.totalRounds.toString()} />
            <MiniStat
              label="Avg/round"
              value={stats.totalRounds > 0 ? Math.round(stats.totalPoints / stats.totalRounds).toString() : '—'}
            />
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 sm:p-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-2">How scoring works</h3>
          <div className="grid grid-cols-5 gap-2 text-[11px] sm:text-xs">
            <ScoreBucket emoji="🎯" label="Bullseye" sub="within 5%" pts="100" tone="emerald" />
            <ScoreBucket emoji="🟢" label="Close" sub="within 15%" pts="75" tone="lime" />
            <ScoreBucket emoji="🟡" label="Medium" sub="within 30%" pts="50" tone="amber" />
            <ScoreBucket emoji="🟠" label="Far" sub="within 50%" pts="25" tone="orange" />
            <ScoreBucket emoji="⬜" label="Miss" sub="over 50%" pts="0" tone="rose" />
          </div>
        </div>
      </div>
    );
  }

  const round = rounds[roundIdx];
  const lastResult = results[results.length - 1];

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="flex items-center gap-1">
        {Array.from({ length: ROUND_COUNT }).map((_, i) => {
          const r = results[i];
          const isCurrent = i === roundIdx && phase !== 'summary';
          return (
            <div
              key={i}
              className={`flex-1 h-1.5 rounded-full ${
                r
                  ? r.bucket === 'bullseye' ? 'bg-emerald-500' :
                    r.bucket === 'close' ? 'bg-lime-500' :
                    r.bucket === 'medium' ? 'bg-amber-500' :
                    r.bucket === 'far' ? 'bg-orange-500' : 'bg-rose-600'
                  : isCurrent ? 'bg-indigo-500' : 'bg-gray-800'
              }`}
            />
          );
        })}
      </div>

      {phase === 'round' && round && (
        <>
          <div className="bg-gradient-to-br from-indigo-950/40 to-gray-900 border border-indigo-900/40 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-gray-400 uppercase tracking-wide">Round {roundIdx + 1} of {ROUND_COUNT}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">{mode === 'daily' ? '🗓️ Daily' : '🎲 Random'}</div>
            </div>
            <div className="text-center py-3">
              <div className="text-[10px] text-gray-400 uppercase tracking-wide">Target combined value</div>
              <div className="text-4xl sm:text-5xl font-bold text-indigo-300 tabular-nums">{currency(round.target)}</div>
              <div className="text-xs text-gray-500 mt-1">Pick 2 cards whose values sum closest to this.</div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {round.cards.map((c, i) => {
              const isSelected = selected.includes(i);
              return (
                <button
                  key={c.slug}
                  onClick={() => toggleSelect(i)}
                  className={`text-left p-3 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'bg-indigo-950/70 border-indigo-500 shadow-lg shadow-indigo-900/30'
                      : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-[10px] text-gray-400 uppercase tracking-wide">Card {String.fromCharCode(65 + i)}</div>
                    {isSelected && <div className="text-[10px] font-bold text-indigo-300 bg-indigo-900/60 px-1.5 rounded">PICKED</div>}
                  </div>
                  <div className="text-white text-sm font-semibold leading-tight line-clamp-2">{c.name}</div>
                  <div className="text-gray-500 text-[11px] mt-1 capitalize">{c.sport} · {c.year}</div>
                  {c.rookie && <div className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded mt-1 inline-block">ROOKIE</div>}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="text-xs text-gray-500">
              {selected.length}/2 picked
              {selected.length === 2 && (
                <span className="ml-2 text-indigo-300 tabular-nums">
                  (combined {currency(selected.reduce((s, i) => s + round.values[i], 0))})
                </span>
              )}
            </div>
            <button
              onClick={submitRound}
              disabled={selected.length !== 2}
              className="px-4 py-2.5 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Submit Pair →
            </button>
          </div>
        </>
      )}

      {phase === 'reveal' && round && lastResult && (
        <div className="space-y-4">
          <div className={`rounded-2xl p-5 border-2 ${
            lastResult.bucket === 'bullseye' ? 'border-emerald-600 bg-gradient-to-br from-emerald-950/40 to-gray-900' :
            lastResult.bucket === 'close' ? 'border-lime-600 bg-gradient-to-br from-lime-950/40 to-gray-900' :
            lastResult.bucket === 'medium' ? 'border-amber-600 bg-gradient-to-br from-amber-950/40 to-gray-900' :
            lastResult.bucket === 'far' ? 'border-orange-600 bg-gradient-to-br from-orange-950/40 to-gray-900' :
            'border-rose-600 bg-gradient-to-br from-rose-950/40 to-gray-900'
          }`}>
            <div className="text-center mb-4">
              <div className="text-5xl mb-2">{bucketEmoji(lastResult.bucket)}</div>
              <div className="text-2xl font-bold text-white uppercase tracking-wide">{lastResult.bucket}</div>
              <div className="text-gray-400 text-sm mt-1">+{lastResult.points} points</div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-black/40 border border-gray-800 rounded-lg p-2">
                <div className="text-[10px] text-gray-400 uppercase">Target</div>
                <div className="text-white font-bold tabular-nums">{currency(round.target)}</div>
              </div>
              <div className="bg-black/40 border border-gray-800 rounded-lg p-2">
                <div className="text-[10px] text-gray-400 uppercase">Your pair</div>
                <div className="text-white font-bold tabular-nums">{currency(lastResult.pickedSum)}</div>
              </div>
              <div className="bg-black/40 border border-gray-800 rounded-lg p-2">
                <div className="text-[10px] text-gray-400 uppercase">Off by</div>
                <div className="text-white font-bold tabular-nums">{(lastResult.diffPct * 100).toFixed(1)}%</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <h3 className="text-xs text-gray-400 uppercase tracking-wide mb-3">All 4 cards revealed</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {round.cards.map((c, i) => {
                const wasPicked = lastResult.pickedIdx?.includes(i);
                const wasBest = lastResult.bestIdx.includes(i);
                return (
                  <div
                    key={c.slug}
                    className={`p-2 rounded-lg border ${
                      wasBest ? 'border-emerald-700 bg-emerald-950/30' :
                      wasPicked ? 'border-indigo-700 bg-indigo-950/30' :
                      'border-gray-800 bg-gray-950'
                    }`}
                  >
                    <div className="text-white text-xs font-semibold leading-tight line-clamp-2">{c.name}</div>
                    <div className="text-gray-500 text-[10px] mt-1 capitalize">{c.sport} · {c.year}</div>
                    <div className="text-indigo-300 text-sm font-bold tabular-nums mt-1">{currency(round.values[i])}</div>
                    <div className="mt-1 flex gap-1 flex-wrap">
                      {wasPicked && <span className="text-[9px] font-bold text-indigo-300 bg-indigo-900/60 px-1 rounded">PICKED</span>}
                      {wasBest && !wasPicked && <span className="text-[9px] font-bold text-emerald-300 bg-emerald-900/60 px-1 rounded">OPTIMAL</span>}
                      {wasBest && wasPicked && <span className="text-[9px] font-bold text-emerald-300 bg-emerald-900/60 px-1 rounded">NAILED IT</span>}
                    </div>
                  </div>
                );
              })}
            </div>
            {lastResult.pickedSum !== lastResult.bestSum && (
              <div className="mt-3 text-xs text-gray-400 bg-black/30 rounded-lg p-2">
                Best possible pair summed to {currency(lastResult.bestSum)} ({((Math.abs(lastResult.bestSum - round.target) / round.target) * 100).toFixed(1)}% off target).
              </div>
            )}
          </div>

          <button
            onClick={nextRound}
            className="w-full py-3 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
          >
            {roundIdx + 1 >= ROUND_COUNT ? 'See Final Score →' : 'Next Round →'}
          </button>
        </div>
      )}

      {phase === 'summary' && (
        <div className="space-y-4">
          {(() => {
            const totalPoints = results.reduce((s, r) => s + r.points, 0);
            const bullseyes = results.filter(r => r.bucket === 'bullseye').length;
            const grade = gradeFromScore(totalPoints);
            const grid = results.map(r => bucketEmoji(r.bucket)).join('');
            return (
              <div className="bg-gradient-to-br from-indigo-950/50 to-gray-900 border-2 border-indigo-700 rounded-2xl p-5 sm:p-6 text-center">
                <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Game Complete</div>
                <div className="text-6xl sm:text-7xl font-bold text-white mb-1">{grade}</div>
                <div className="text-indigo-300 text-2xl font-semibold tabular-nums">{totalPoints}<span className="text-gray-500 text-base">/1000</span></div>
                <div className="text-gray-400 text-sm mt-2">
                  {bullseyes} bullseye{bullseyes === 1 ? '' : 's'} · {results.filter(r => r.bucket === 'close').length} close · {results.filter(r => r.points === 0).length} miss{results.filter(r => r.points === 0).length === 1 ? '' : 'es'}
                </div>
                <div className="text-3xl tracking-wider my-4">{grid}</div>
                <div className="flex flex-col sm:flex-row gap-2 mt-4">
                  <button
                    onClick={copyResults}
                    className="flex-1 py-2.5 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                  >
                    📋 Copy Results
                  </button>
                  <button
                    onClick={reset}
                    className="flex-1 py-2.5 rounded-xl font-semibold bg-gray-800 border border-gray-700 hover:border-gray-600 text-white transition-colors"
                  >
                    Play Again
                  </button>
                </div>
              </div>
            );
          })()}

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <h3 className="text-xs text-gray-400 uppercase tracking-wide mb-3">Round-by-round</h3>
            <div className="space-y-2">
              {results.map((r, i) => (
                <div key={i} className="flex items-center gap-3 p-2 bg-black/30 border border-gray-800 rounded-lg">
                  <div className="text-2xl">{bucketEmoji(r.bucket)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm">Round {i + 1}</div>
                    <div className="text-gray-500 text-[11px] tabular-nums">
                      picked {currency(r.pickedSum)} vs target {currency(rounds[i].target)} · {(r.diffPct * 100).toFixed(1)}% off
                    </div>
                  </div>
                  <div className={`text-sm font-bold ${r.points === 100 ? 'text-emerald-300' : r.points >= 50 ? 'text-amber-300' : 'text-gray-500'}`}>
                    +{r.points}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-black/30 border border-gray-800 rounded-lg p-2 text-center">
      <div className="text-[10px] text-gray-500 uppercase tracking-wide">{label}</div>
      <div className="text-base font-bold text-white tabular-nums">{value}</div>
    </div>
  );
}

function ScoreBucket({ emoji, label, sub, pts, tone }: { emoji: string; label: string; sub: string; pts: string; tone: string }) {
  const ringClass = {
    emerald: 'border-emerald-700 bg-emerald-950/30',
    lime: 'border-lime-700 bg-lime-950/30',
    amber: 'border-amber-700 bg-amber-950/30',
    orange: 'border-orange-700 bg-orange-950/30',
    rose: 'border-rose-700 bg-rose-950/30',
  }[tone] ?? 'border-gray-700 bg-gray-900';
  return (
    <div className={`text-center border rounded-lg p-2 ${ringClass}`}>
      <div className="text-lg">{emoji}</div>
      <div className="text-white font-semibold text-[11px]">{label}</div>
      <div className="text-gray-400 text-[10px]">{sub}</div>
      <div className="text-white text-sm font-bold mt-0.5">+{pts}</div>
    </div>
  );
}
