'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { sportsCards, type SportsCard } from '@/data/sports-cards';

const STATS_KEY = 'cv_card_echo_stats_v1';
const DAILY_KEY = 'cv_card_echo_daily_v1';
const TILE_COUNT = 6;

type Speed = 'slow' | 'normal' | 'fast';
type Mode = 'daily' | 'free';
type Phase = 'idle' | 'showing' | 'input' | 'success' | 'fail';

type Stats = {
  games: number;
  bestChainSlow: number;
  bestChainNormal: number;
  bestChainFast: number;
  lifetimeRounds: number;
  bestGrade: string;
  dailyStreak: number;
  lastDaily: string;
};

const ZERO_STATS: Stats = {
  games: 0,
  bestChainSlow: 0,
  bestChainNormal: 0,
  bestChainFast: 0,
  lifetimeRounds: 0,
  bestGrade: '—',
  dailyStreak: 0,
  lastDaily: '',
};

const SPEED_FLASH_MS: Record<Speed, number> = {
  slow: 800,
  normal: 500,
  fast: 300,
};

const SPEED_GAP_MS: Record<Speed, number> = {
  slow: 220,
  normal: 160,
  fast: 110,
};

const SPORT_COLORS: Record<SportsCard['sport'], string> = {
  baseball: 'bg-sky-500',
  basketball: 'bg-orange-500',
  football: 'bg-emerald-500',
  hockey: 'bg-cyan-500',
};

const SPORT_LABELS: Record<SportsCard['sport'], string> = {
  baseball: 'MLB',
  basketball: 'NBA',
  football: 'NFL',
  hockey: 'NHL',
};

function fnv1a(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function todayStamp(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function parseValue(raw: string): number {
  if (!raw) return 0;
  const digits = raw.replace(/[^0-9.]/g, '');
  const n = parseFloat(digits);
  return isNaN(n) ? 0 : n;
}

function gradeFor(rounds: number): string {
  if (rounds >= 20) return 'S';
  if (rounds >= 15) return 'A';
  if (rounds >= 10) return 'B';
  if (rounds >= 7) return 'C';
  if (rounds >= 4) return 'D';
  return 'F';
}

function gradeColor(g: string): string {
  if (g === 'S') return 'text-fuchsia-600';
  if (g === 'A') return 'text-emerald-600';
  if (g === 'B') return 'text-sky-600';
  if (g === 'C') return 'text-amber-600';
  if (g === 'D') return 'text-orange-600';
  return 'text-rose-600';
}

function pickPool(mode: Mode, speed: Speed, seedExtra: number): SportsCard[] {
  const pool = (sportsCards as SportsCard[]).filter((c) => parseValue(c.estimatedValueRaw) >= 1);
  const seedBase =
    mode === 'daily'
      ? fnv1a(`echo-daily-${todayStamp()}`)
      : fnv1a(`echo-free-${seedExtra}-${Math.random()}`);
  const rand = mulberry32(seedBase);
  const shuffled = shuffle(pool, rand);
  const picked: SportsCard[] = [];
  const seenPlayers = new Set<string>();
  for (const c of shuffled) {
    if (seenPlayers.has(c.player)) continue;
    seenPlayers.add(c.player);
    picked.push(c);
    if (picked.length === TILE_COUNT) break;
  }
  return picked;
}

function buildSequence(pool: SportsCard[], seedBase: number, length: number): number[] {
  // Determine sequence of tile indices using a per-round deterministic RNG.
  // Works for both daily and free since caller passes appropriate seedBase.
  const rand = mulberry32(seedBase ^ (length * 0x9e3779b9));
  const seq: number[] = [];
  for (let i = 0; i < length; i++) {
    seq.push(Math.floor(rand() * pool.length));
  }
  return seq;
}

export default function CardEchoClient() {
  const [mode, setMode] = useState<Mode>('daily');
  const [speed, setSpeed] = useState<Speed>('normal');
  const [seedExtra, setSeedExtra] = useState(0);
  const [pool, setPool] = useState<SportsCard[]>([]);
  const [phase, setPhase] = useState<Phase>('idle');
  const [sequence, setSequence] = useState<number[]>([]);
  const [inputIdx, setInputIdx] = useState(0);
  const [litTile, setLitTile] = useState<number | null>(null);
  const [wrongTile, setWrongTile] = useState<number | null>(null);
  const [stats, setStats] = useState<Stats>(ZERO_STATS);
  const [round, setRound] = useState(0);
  const [highestCompleted, setHighestCompleted] = useState(0);
  const [flashPulse, setFlashPulse] = useState(0);
  const timersRef = useRef<number[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate stats
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STATS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Stats>;
        setStats({ ...ZERO_STATS, ...parsed });
      }
    } catch {
      /* noop */
    }
    setHydrated(true);
  }, []);

  // Build card pool when mode / seed changes
  useEffect(() => {
    setPool(pickPool(mode, speed, seedExtra));
    setPhase('idle');
    setSequence([]);
    setInputIdx(0);
    setRound(0);
    setHighestCompleted(0);
    setWrongTile(null);
    setLitTile(null);
  }, [mode, seedExtra, speed]);

  const clearTimers = useCallback(() => {
    for (const t of timersRef.current) window.clearTimeout(t);
    timersRef.current = [];
  }, []);

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  const seedBase = useMemo(() => {
    return mode === 'daily'
      ? fnv1a(`echo-daily-seq-${todayStamp()}`)
      : fnv1a(`echo-free-seq-${seedExtra}-${pool.map((c) => c.slug).join('|')}`);
  }, [mode, seedExtra, pool]);

  const playSequence = useCallback(
    (seq: number[]) => {
      clearTimers();
      setPhase('showing');
      setLitTile(null);
      const flashMs = SPEED_FLASH_MS[speed];
      const gapMs = SPEED_GAP_MS[speed];
      const leadDelay = 450;
      let t = leadDelay;
      for (let i = 0; i < seq.length; i++) {
        const idx = seq[i];
        const onHandle = window.setTimeout(() => setLitTile(idx), t);
        const offHandle = window.setTimeout(() => setLitTile(null), t + flashMs);
        timersRef.current.push(onHandle, offHandle);
        t += flashMs + gapMs;
      }
      const doneHandle = window.setTimeout(() => {
        setPhase('input');
        setInputIdx(0);
      }, t + 120);
      timersRef.current.push(doneHandle);
    },
    [speed, clearTimers],
  );

  const startRun = useCallback(() => {
    if (pool.length < TILE_COUNT) return;
    const seq = buildSequence(pool, seedBase, 1);
    setSequence(seq);
    setRound(1);
    setHighestCompleted(0);
    setInputIdx(0);
    setWrongTile(null);
    playSequence(seq);
  }, [pool, seedBase, playSequence]);

  const advanceRound = useCallback(() => {
    const nextLen = round + 1;
    const seq = buildSequence(pool, seedBase, nextLen);
    setSequence(seq);
    setRound(nextLen);
    setInputIdx(0);
    setWrongTile(null);
    setPhase('showing');
    setFlashPulse((p) => p + 1);
    playSequence(seq);
  }, [round, pool, seedBase, playSequence]);

  const finishRun = useCallback(
    (reachedRound: number) => {
      clearTimers();
      setPhase('fail');
      setHighestCompleted(reachedRound);
      setStats((prev) => {
        const isDaily = mode === 'daily';
        const stamp = todayStamp();
        const newDailyStreak =
          isDaily && prev.lastDaily !== stamp ? prev.dailyStreak + 1 : prev.dailyStreak;
        const newLastDaily = isDaily ? stamp : prev.lastDaily;
        const grade = gradeFor(reachedRound);
        const currentGrade = prev.bestGrade;
        const gradeRank = (g: string) =>
          g === 'S' ? 6 : g === 'A' ? 5 : g === 'B' ? 4 : g === 'C' ? 3 : g === 'D' ? 2 : g === 'F' ? 1 : 0;
        const bestGrade = gradeRank(grade) > gradeRank(currentGrade) ? grade : currentGrade;
        const next: Stats = {
          ...prev,
          games: prev.games + 1,
          bestChainSlow:
            speed === 'slow' ? Math.max(prev.bestChainSlow, reachedRound) : prev.bestChainSlow,
          bestChainNormal:
            speed === 'normal' ? Math.max(prev.bestChainNormal, reachedRound) : prev.bestChainNormal,
          bestChainFast:
            speed === 'fast' ? Math.max(prev.bestChainFast, reachedRound) : prev.bestChainFast,
          lifetimeRounds: prev.lifetimeRounds + reachedRound,
          bestGrade,
          dailyStreak: newDailyStreak,
          lastDaily: newLastDaily,
        };
        try {
          localStorage.setItem(STATS_KEY, JSON.stringify(next));
        } catch {
          /* noop */
        }
        if (isDaily) {
          try {
            localStorage.setItem(DAILY_KEY, JSON.stringify({ stamp, speed, reached: reachedRound }));
          } catch {
            /* noop */
          }
        }
        return next;
      });
    },
    [mode, speed, clearTimers],
  );

  const handleTileClick = useCallback(
    (idx: number) => {
      if (phase !== 'input') return;
      const expected = sequence[inputIdx];
      if (idx !== expected) {
        setWrongTile(idx);
        setHighestCompleted(round - 1 >= 0 ? round - 1 : 0);
        // Brief shake, then fail screen
        const t = window.setTimeout(() => finishRun(round - 1 >= 0 ? round - 1 : 0), 450);
        timersRef.current.push(t);
        return;
      }
      // Correct tap — light tile briefly
      setLitTile(idx);
      const clearLit = window.setTimeout(() => setLitTile(null), 180);
      timersRef.current.push(clearLit);
      const nextInput = inputIdx + 1;
      if (nextInput >= sequence.length) {
        // Round cleared
        setPhase('success');
        setHighestCompleted(round);
        const advance = window.setTimeout(() => {
          advanceRound();
        }, 650);
        timersRef.current.push(advance);
      } else {
        setInputIdx(nextInput);
      }
    },
    [phase, sequence, inputIdx, round, advanceRound, finishRun],
  );

  const reset = useCallback(() => {
    clearTimers();
    setPhase('idle');
    setSequence([]);
    setInputIdx(0);
    setRound(0);
    setHighestCompleted(0);
    setWrongTile(null);
    setLitTile(null);
  }, [clearTimers]);

  const reroll = useCallback(() => {
    setMode('free');
    setSeedExtra((s) => s + 1);
  }, []);

  const shareText = useMemo(() => {
    if (phase !== 'fail') return '';
    const grade = gradeFor(highestCompleted);
    const speedLabel = speed === 'slow' ? 'Slow' : speed === 'normal' ? 'Normal' : 'Fast';
    const modeLabel = mode === 'daily' ? `Daily ${todayStamp()}` : 'Free Play';
    const lights = highestCompleted > 0 ? '🟦'.repeat(Math.min(highestCompleted, 20)) : '⬜';
    return `Card Echo — ${modeLabel}\nSpeed: ${speedLabel}\nChain: ${highestCompleted} (${grade})\n${lights}\ncardvault-two.vercel.app/card-echo`;
  }, [phase, highestCompleted, speed, mode]);

  const copyShare = useCallback(async () => {
    if (!shareText) return;
    try {
      await navigator.clipboard.writeText(shareText);
    } catch {
      /* noop */
    }
  }, [shareText]);

  const bestForCurrentSpeed =
    speed === 'slow' ? stats.bestChainSlow : speed === 'normal' ? stats.bestChainNormal : stats.bestChainFast;

  return (
    <section className="space-y-4">
      {/* Mode / speed controls */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-lg border border-cyan-300 overflow-hidden text-sm">
          <button
            type="button"
            onClick={() => setMode('daily')}
            disabled={phase === 'showing' || phase === 'input'}
            className={`px-3 py-1.5 ${mode === 'daily' ? 'bg-cyan-600 text-white' : 'bg-white text-cyan-700 hover:bg-cyan-50'} disabled:opacity-50`}
          >
            Daily
          </button>
          <button
            type="button"
            onClick={() => setMode('free')}
            disabled={phase === 'showing' || phase === 'input'}
            className={`px-3 py-1.5 ${mode === 'free' ? 'bg-cyan-600 text-white' : 'bg-white text-cyan-700 hover:bg-cyan-50'} disabled:opacity-50`}
          >
            Free Play
          </button>
        </div>

        <div className="inline-flex rounded-lg border border-sky-300 overflow-hidden text-sm">
          {(['slow', 'normal', 'fast'] as Speed[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSpeed(s)}
              disabled={phase === 'showing' || phase === 'input'}
              className={`px-3 py-1.5 capitalize ${
                speed === s ? 'bg-sky-600 text-white' : 'bg-white text-sky-700 hover:bg-sky-50'
              } disabled:opacity-50`}
            >
              {s}
            </button>
          ))}
        </div>

        {mode === 'free' && phase === 'idle' && (
          <button
            type="button"
            onClick={reroll}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white hover:bg-gray-50"
          >
            🔄 Reroll cards
          </button>
        )}
      </div>

      {/* Status strip */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-white rounded-lg border border-cyan-200 p-3">
          <div className="text-xs text-gray-500 uppercase tracking-wider">Round</div>
          <div className="text-2xl font-bold text-cyan-700">{round > 0 ? round : '—'}</div>
        </div>
        <div className="bg-white rounded-lg border border-sky-200 p-3">
          <div className="text-xs text-gray-500 uppercase tracking-wider">Phase</div>
          <div className="text-sm font-semibold text-sky-700 capitalize">
            {phase === 'showing' ? 'Watch…' : phase === 'input' ? 'Your turn' : phase === 'success' ? 'Correct' : phase === 'fail' ? 'Game over' : 'Press Start'}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-indigo-200 p-3">
          <div className="text-xs text-gray-500 uppercase tracking-wider">Best ({speed})</div>
          <div className="text-2xl font-bold text-indigo-700">{hydrated ? bestForCurrentSpeed : '—'}</div>
        </div>
      </div>

      {/* Board */}
      <div key={flashPulse} className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
        {pool.map((card, idx) => {
          const lit = litTile === idx;
          const wrong = wrongTile === idx;
          const clickable = phase === 'input';
          return (
            <button
              key={card.slug}
              type="button"
              onClick={() => handleTileClick(idx)}
              disabled={!clickable}
              className={`relative overflow-hidden rounded-xl border-2 p-3 text-left transition-all duration-150 ${
                wrong
                  ? 'border-rose-500 bg-rose-100 animate-pulse'
                  : lit
                    ? 'border-cyan-400 bg-gradient-to-br from-cyan-200 to-sky-200 shadow-lg scale-[1.03] ring-4 ring-cyan-300/70'
                    : clickable
                      ? 'border-gray-300 bg-white hover:border-cyan-400 hover:bg-cyan-50 active:scale-95'
                      : 'border-gray-200 bg-gray-50'
              } ${!clickable && !lit && !wrong ? 'opacity-80' : ''}`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`inline-block w-2.5 h-2.5 rounded-full ${SPORT_COLORS[card.sport]}`} />
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {SPORT_LABELS[card.sport]} · {card.year}
                </span>
              </div>
              <div className="font-semibold text-sm text-gray-900 leading-tight mb-0.5 line-clamp-1">
                {card.player}
              </div>
              <div className="text-xs text-gray-600 leading-tight line-clamp-1">{card.set}</div>
              {card.cardNumber && (
                <div className="text-[11px] text-gray-500 mt-0.5">#{card.cardNumber}</div>
              )}
            </button>
          );
        })}
      </div>

      {/* Input progress */}
      {phase === 'input' && (
        <div className="flex items-center justify-center gap-1.5 py-2">
          {sequence.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i < inputIdx ? 'w-8 bg-cyan-500' : i === inputIdx ? 'w-10 bg-sky-400 animate-pulse' : 'w-6 bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {phase === 'idle' && (
          <button
            type="button"
            onClick={startRun}
            className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-sky-600 text-white font-semibold rounded-lg shadow hover:shadow-md active:scale-95"
          >
            ▶ Start run
          </button>
        )}
        {(phase === 'showing' || phase === 'input') && (
          <button
            type="button"
            onClick={reset}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 bg-white hover:bg-gray-50"
          >
            End run
          </button>
        )}
        {phase === 'fail' && (
          <>
            <button
              type="button"
              onClick={reset}
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-sky-600 text-white font-semibold rounded-lg hover:shadow-md"
            >
              Play again
            </button>
            {shareText && (
              <button
                type="button"
                onClick={copyShare}
                className="px-4 py-2 rounded-lg border border-cyan-400 bg-white text-cyan-700 text-sm hover:bg-cyan-50"
              >
                📋 Copy share
              </button>
            )}
          </>
        )}
      </div>

      {/* Result */}
      {phase === 'fail' && (
        <div className="bg-gradient-to-br from-cyan-50 via-sky-50 to-indigo-50 border border-cyan-200 rounded-xl p-5 text-center">
          <div className="text-sm uppercase tracking-wider text-gray-500">Chain length</div>
          <div className="text-5xl font-bold text-gray-900 mt-1 mb-2">{highestCompleted}</div>
          <div className={`text-4xl font-bold ${gradeColor(gradeFor(highestCompleted))}`}>
            {gradeFor(highestCompleted)}
          </div>
          <div className="text-xs text-gray-600 mt-2">
            Speed: <span className="font-semibold capitalize">{speed}</span> · Mode:{' '}
            <span className="font-semibold capitalize">{mode === 'daily' ? 'Daily' : 'Free Play'}</span>
          </div>
          {highestCompleted >= 7 && (
            <div className="mt-3 text-sm text-emerald-700">
              {highestCompleted >= 20
                ? '🏆 S-tier chain — you cleared 20+ rounds. Exceptional working memory.'
                : highestCompleted >= 15
                  ? '🌟 A-tier — top 5% territory. Strong chunking discipline.'
                  : highestCompleted >= 10
                    ? '✨ B-tier — at or above the median adult digit-span baseline.'
                    : '👍 C-tier — you crossed the 7 ± 2 threshold.'}
            </div>
          )}
        </div>
      )}

      {/* Lifetime stats */}
      {hydrated && stats.games > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-sm">
          <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">Lifetime</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            <div>
              <div className="text-xs text-gray-500">Games</div>
              <div className="text-lg font-semibold text-gray-900">{stats.games}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Total rounds</div>
              <div className="text-lg font-semibold text-gray-900">{stats.lifetimeRounds}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Best grade</div>
              <div className={`text-lg font-semibold ${gradeColor(stats.bestGrade)}`}>{stats.bestGrade}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Daily streak</div>
              <div className="text-lg font-semibold text-gray-900">{stats.dailyStreak}</div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3 text-center text-xs text-gray-600">
            <div>
              Slow best:{' '}
              <span className="font-semibold text-gray-900">{stats.bestChainSlow}</span>
            </div>
            <div>
              Normal best:{' '}
              <span className="font-semibold text-gray-900">{stats.bestChainNormal}</span>
            </div>
            <div>
              Fast best: <span className="font-semibold text-gray-900">{stats.bestChainFast}</span>
            </div>
          </div>
        </div>
      )}

      {/* Instructions (only visible before first run) */}
      {phase === 'idle' && stats.games === 0 && (
        <div className="bg-sky-50 border border-sky-200 rounded-lg p-4 text-sm text-sky-900">
          <div className="font-semibold mb-1">How to play</div>
          <ol className="list-decimal list-inside space-y-0.5">
            <li>Press <strong>Start run</strong>. One card will briefly light up.</li>
            <li>Tap that card.</li>
            <li>Next round, two cards flash in order — tap them in the same order.</li>
            <li>The pattern grows by one each round. One wrong tap ends the run.</li>
          </ol>
        </div>
      )}
    </section>
  );
}
