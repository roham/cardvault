'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { sportsCards, type SportsCard } from '@/data/sports-cards';

const STATS_KEY = 'cv_card_beat_stats_v1';
const DAILY_KEY = 'cv_card_beat_daily_v1';
const LANE_COUNT = 4;

type Difficulty = 'easy' | 'normal' | 'hard';
type Mode = 'daily' | 'free';
type Phase = 'idle' | 'countdown' | 'playing' | 'done';
type HitQuality = 'perfect' | 'great' | 'good' | 'miss';

type DifficultyMeta = {
  bpm: number;
  durationSec: number;
  perfectMs: number;
  greatMs: number;
  goodMs: number;
  restProbability: number;
  label: string;
};

const DIFFICULTY: Record<Difficulty, DifficultyMeta> = {
  easy:   { bpm: 60,  durationSec: 30, perfectMs: 180, greatMs: 280, goodMs: 360, restProbability: 0.30, label: 'Easy (60 BPM)' },
  normal: { bpm: 100, durationSec: 45, perfectMs: 120, greatMs: 200, goodMs: 280, restProbability: 0.20, label: 'Normal (100 BPM)' },
  hard:   { bpm: 140, durationSec: 60, perfectMs: 80,  greatMs: 140, goodMs: 200, restProbability: 0.10, label: 'Hard (140 BPM)' },
};

const QUALITY_SCORE: Record<HitQuality, number> = {
  perfect: 100,
  great: 50,
  good: 25,
  miss: 0,
};

const QUALITY_COLOR: Record<HitQuality, string> = {
  perfect: 'text-pink-300',
  great: 'text-violet-300',
  good: 'text-sky-300',
  miss: 'text-red-400',
};

const SPORT_LANE_COLOR: Record<SportsCard['sport'], string> = {
  baseball: 'bg-sky-500',
  basketball: 'bg-orange-500',
  football: 'bg-emerald-500',
  hockey: 'bg-cyan-500',
};

type Stats = {
  games: number;
  bestScoreEasy: number;
  bestScoreNormal: number;
  bestScoreHard: number;
  lifetimePerfects: number;
  bestGrade: string;
  bestCombo: number;
  dailyStreak: number;
  lastDaily: string;
};

const ZERO_STATS: Stats = {
  games: 0,
  bestScoreEasy: 0,
  bestScoreNormal: 0,
  bestScoreHard: 0,
  lifetimePerfects: 0,
  bestGrade: '—',
  bestCombo: 0,
  dailyStreak: 0,
  lastDaily: '',
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

function dailyKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function pickLaneCards(seed: number): SportsCard[] {
  const rand = mulberry32(seed);
  const pool = sportsCards.filter(c => c.estimatedValueGem && c.player);
  const picked: SportsCard[] = [];
  const seenPlayers = new Set<string>();
  // Try to include variety of sports
  const bySport: Record<SportsCard['sport'], SportsCard[]> = {
    baseball: [], basketball: [], football: [], hockey: [],
  };
  for (const c of pool) bySport[c.sport].push(c);
  const sports: SportsCard['sport'][] = ['baseball', 'basketball', 'football', 'hockey'];
  for (const sport of sports) {
    const lane = bySport[sport];
    if (lane.length === 0) continue;
    let attempts = 0;
    while (attempts++ < 30 && picked.length < LANE_COUNT) {
      const c = lane[Math.floor(rand() * lane.length)];
      if (!seenPlayers.has(c.player)) {
        picked.push(c);
        seenPlayers.add(c.player);
        break;
      }
    }
  }
  // Fill if needed
  while (picked.length < LANE_COUNT) {
    const c = pool[Math.floor(rand() * pool.length)];
    if (!seenPlayers.has(c.player)) {
      picked.push(c);
      seenPlayers.add(c.player);
    }
  }
  return picked.slice(0, LANE_COUNT);
}

type Beat = {
  id: number;
  lane: number;  // 0-3 or -1 for rest
  timeMs: number;
  hit?: HitQuality;
};

function generateBeatPattern(seed: number, diff: DifficultyMeta): Beat[] {
  const rand = mulberry32(seed ^ 0xdeadbeef);
  const beatInterval = 60_000 / diff.bpm; // ms per beat
  const totalBeats = Math.floor((diff.durationSec * 1000) / beatInterval);
  const beats: Beat[] = [];
  let lastLane = -2;
  let consecutiveSameLane = 0;
  for (let i = 0; i < totalBeats; i++) {
    // Skip first 2 beats for player preparation
    if (i < 2) {
      beats.push({ id: i, lane: -1, timeMs: Math.round(i * beatInterval) });
      continue;
    }
    // Rest beat probability
    if (rand() < diff.restProbability) {
      beats.push({ id: i, lane: -1, timeMs: Math.round(i * beatInterval) });
      consecutiveSameLane = 0;
      continue;
    }
    // Pick a lane, avoiding 4+ in a row on same lane
    let lane = Math.floor(rand() * LANE_COUNT);
    if (lane === lastLane && consecutiveSameLane >= 3) {
      lane = (lane + 1 + Math.floor(rand() * (LANE_COUNT - 1))) % LANE_COUNT;
    }
    if (lane === lastLane) consecutiveSameLane++;
    else { consecutiveSameLane = 1; lastLane = lane; }
    beats.push({ id: i, lane, timeMs: Math.round(i * beatInterval) });
  }
  return beats;
}

function gradeScore(score: number): string {
  if (score >= 7500) return 'S';
  if (score >= 5500) return 'A';
  if (score >= 3500) return 'B';
  if (score >= 2000) return 'C';
  if (score >= 800) return 'D';
  return 'F';
}

function fmtCardName(c: SportsCard): string {
  return c.player;
}

export default function CardBeatClient() {
  const [stats, setStats] = useState<Stats>(ZERO_STATS);
  const [statsLoaded, setStatsLoaded] = useState(false);
  const [mode, setMode] = useState<Mode>('daily');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [phase, setPhase] = useState<Phase>('idle');
  const [countdownNum, setCountdownNum] = useState(3);
  const [lanes, setLanes] = useState<SportsCard[]>([]);
  const [beats, setBeats] = useState<Beat[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [perfects, setPerfects] = useState(0);
  const [lastHit, setLastHit] = useState<{ quality: HitQuality; at: number } | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [dailyLocked, setDailyLocked] = useState(false);
  const startTimeRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const beatsRef = useRef<Beat[]>([]);
  const beatStateRef = useRef<Record<number, HitQuality>>({});
  const comboRef = useRef(0);

  // Load stats
  useEffect(() => {
    try {
      const s = localStorage.getItem(STATS_KEY);
      if (s) setStats({ ...ZERO_STATS, ...JSON.parse(s) });
      const dKey = `${DAILY_KEY}::${dailyKey()}`;
      const d = localStorage.getItem(dKey);
      if (d) setDailyLocked(true);
    } catch {}
    setStatsLoaded(true);
  }, []);

  useEffect(() => {
    if (!statsLoaded) return;
    try { localStorage.setItem(STATS_KEY, JSON.stringify(stats)); } catch {}
  }, [stats, statsLoaded]);

  const diffMeta = DIFFICULTY[difficulty];

  const setupTrack = useCallback(() => {
    const seed = mode === 'daily'
      ? fnv1a(`card-beat::${dailyKey()}::${difficulty}`)
      : fnv1a(`card-beat::free::${Date.now()}::${Math.random()}`);
    const cardsPicked = pickLaneCards(seed);
    const pattern = generateBeatPattern(seed, diffMeta);
    setLanes(cardsPicked);
    setBeats(pattern);
    beatsRef.current = pattern;
    beatStateRef.current = {};
  }, [mode, difficulty, diffMeta]);

  useEffect(() => {
    setupTrack();
  }, [setupTrack]);

  const currentBeatIdx = useMemo(() => {
    if (phase !== 'playing') return -1;
    // Find the nearest unresolved beat to current time
    const beats = beatsRef.current;
    for (let i = 0; i < beats.length; i++) {
      if (beats[i].lane < 0) continue;
      if (beatStateRef.current[beats[i].id]) continue;
      const delta = beats[i].timeMs - elapsedMs;
      if (delta < -diffMeta.goodMs) continue; // already missed
      return i;
    }
    return -1;
  }, [elapsedMs, phase, diffMeta]);

  // Animation loop for timing
  useEffect(() => {
    if (phase !== 'playing') return;
    let running = true;
    const tick = () => {
      if (!running) return;
      const now = performance.now();
      const elapsed = now - startTimeRef.current;
      setElapsedMs(elapsed);

      // Detect misses (beats past goodMs window)
      const beats = beatsRef.current;
      let missesApplied = false;
      for (const b of beats) {
        if (b.lane < 0) continue;
        if (beatStateRef.current[b.id]) continue;
        if (elapsed - b.timeMs > diffMeta.goodMs) {
          beatStateRef.current[b.id] = 'miss';
          missesApplied = true;
          comboRef.current = 0;
        }
      }
      if (missesApplied) {
        setCombo(0);
        setLastHit({ quality: 'miss', at: now });
      }

      // End check
      const trackDurationMs = diffMeta.durationSec * 1000;
      if (elapsed >= trackDurationMs + 500) {
        finishTrack();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { running = false; if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [phase, diffMeta]);

  const finishTrack = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setPhase('done');
    setStats(s => {
      const nextBest = Math.max(s[`bestScore${difficulty[0].toUpperCase()}${difficulty.slice(1)}` as keyof Stats] as number, score);
      const grade = gradeScore(score);
      return {
        ...s,
        games: s.games + 1,
        lifetimePerfects: s.lifetimePerfects + perfects,
        bestCombo: Math.max(s.bestCombo, bestCombo),
        bestGrade: ['S', 'A', 'B', 'C', 'D', 'F'].indexOf(grade) < ['S', 'A', 'B', 'C', 'D', 'F'].indexOf(s.bestGrade || 'F')
          ? grade : (s.bestGrade || grade),
        ...(difficulty === 'easy' ? { bestScoreEasy: nextBest } : {}),
        ...(difficulty === 'normal' ? { bestScoreNormal: nextBest } : {}),
        ...(difficulty === 'hard' ? { bestScoreHard: nextBest } : {}),
      };
    });
    if (mode === 'daily') {
      try {
        const dKey = `${DAILY_KEY}::${dailyKey()}`;
        localStorage.setItem(dKey, JSON.stringify({ score, perfects, bestCombo, grade: gradeScore(score) }));
      } catch {}
      setDailyLocked(true);
    }
  }, [score, perfects, bestCombo, difficulty, mode]);

  const startCountdown = useCallback(() => {
    setupTrack();
    setScore(0);
    setCombo(0);
    setBestCombo(0);
    setPerfects(0);
    setLastHit(null);
    setElapsedMs(0);
    beatStateRef.current = {};
    comboRef.current = 0;
    setPhase('countdown');
    setCountdownNum(3);
    let c = 3;
    const countdownInterval = setInterval(() => {
      c--;
      if (c > 0) {
        setCountdownNum(c);
      } else {
        clearInterval(countdownInterval);
        startTimeRef.current = performance.now();
        setPhase('playing');
      }
    }, 1000);
  }, [setupTrack]);

  const handleTap = useCallback((lane: number) => {
    if (phase !== 'playing') return;
    const now = performance.now();
    const elapsed = now - startTimeRef.current;
    // Find nearest beat on this lane within goodMs window
    const beats = beatsRef.current;
    let bestBeat: Beat | null = null;
    let bestDelta = Infinity;
    for (const b of beats) {
      if (b.lane !== lane) continue;
      if (beatStateRef.current[b.id]) continue;
      const delta = Math.abs(b.timeMs - elapsed);
      if (delta <= diffMeta.goodMs && delta < bestDelta) {
        bestDelta = delta;
        bestBeat = b;
      }
    }
    if (!bestBeat) {
      // No beat in window — treat as off-tap, no score
      setLastHit({ quality: 'miss', at: now });
      setCombo(0);
      comboRef.current = 0;
      return;
    }
    let quality: HitQuality;
    if (bestDelta <= diffMeta.perfectMs) quality = 'perfect';
    else if (bestDelta <= diffMeta.greatMs) quality = 'great';
    else quality = 'good';
    beatStateRef.current[bestBeat.id] = quality;
    const multiplier = Math.min(3, 1 + Math.floor(comboRef.current / 10) * 0.1);
    const pts = Math.round(QUALITY_SCORE[quality] * multiplier);
    setScore(s => s + pts);
    if (quality === 'perfect') setPerfects(p => p + 1);
    comboRef.current++;
    setCombo(comboRef.current);
    setBestCombo(b => Math.max(b, comboRef.current));
    setLastHit({ quality, at: now });
  }, [phase, diffMeta]);

  const finalGrade = useMemo(() => gradeScore(score), [score]);
  const multiplier = Math.min(3, 1 + Math.floor(combo / 10) * 0.1);

  const upcomingBeat = currentBeatIdx >= 0 ? beatsRef.current[currentBeatIdx] : null;
  const upcomingDelta = upcomingBeat ? upcomingBeat.timeMs - elapsedMs : Infinity;

  // Render
  return (
    <div className="space-y-5">
      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 text-center">
          <div className="text-[10px] uppercase tracking-wider text-slate-500">Games</div>
          <div className="text-xl font-bold text-white">{stats.games}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 text-center">
          <div className="text-[10px] uppercase tracking-wider text-slate-500">Best ({difficulty})</div>
          <div className="text-xl font-bold text-pink-300">{(difficulty === 'easy' ? stats.bestScoreEasy : difficulty === 'normal' ? stats.bestScoreNormal : stats.bestScoreHard).toLocaleString()}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 text-center">
          <div className="text-[10px] uppercase tracking-wider text-slate-500">Best combo</div>
          <div className="text-xl font-bold text-white">{stats.bestCombo}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 text-center">
          <div className="text-[10px] uppercase tracking-wider text-slate-500">Best grade</div>
          <div className="text-xl font-bold text-pink-300">{stats.bestGrade}</div>
        </div>
      </div>

      {/* Mode + difficulty */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
        <div>
          <div className="text-xs uppercase tracking-wider text-slate-500 mb-2">Mode</div>
          <div className="flex gap-2">
            <button
              disabled={phase === 'playing' || phase === 'countdown'}
              onClick={() => setMode('daily')}
              className={`text-xs px-3 py-1.5 rounded-md border transition disabled:opacity-50 ${mode === 'daily' ? 'bg-pink-600 border-pink-500 text-white' : 'bg-slate-950 border-slate-700 text-slate-300 hover:border-slate-500'}`}
            >
              🗓 Daily {dailyLocked ? '(played today)' : ''}
            </button>
            <button
              disabled={phase === 'playing' || phase === 'countdown'}
              onClick={() => setMode('free')}
              className={`text-xs px-3 py-1.5 rounded-md border transition disabled:opacity-50 ${mode === 'free' ? 'bg-pink-600 border-pink-500 text-white' : 'bg-slate-950 border-slate-700 text-slate-300 hover:border-slate-500'}`}
            >
              ♾ Free play
            </button>
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-slate-500 mb-2">Difficulty</div>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(DIFFICULTY) as Difficulty[]).map(d => (
              <button
                key={d}
                disabled={phase === 'playing' || phase === 'countdown'}
                onClick={() => setDifficulty(d)}
                className={`text-xs px-3 py-1.5 rounded-md border transition disabled:opacity-50 ${difficulty === d ? 'bg-pink-600 border-pink-500 text-white' : 'bg-slate-950 border-slate-700 text-slate-300 hover:border-slate-500'}`}
              >
                {DIFFICULTY[d].label}
              </button>
            ))}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            {diffMeta.bpm} BPM · {diffMeta.durationSec}s · PERFECT ±{diffMeta.perfectMs}ms · GREAT ±{diffMeta.greatMs}ms
          </div>
        </div>
      </div>

      {/* Lanes */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
        <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-3">
          {lanes.map((card, i) => {
            const isLaneActive = upcomingBeat?.lane === i && Math.abs(upcomingDelta) <= diffMeta.goodMs;
            const pulseStrength = isLaneActive
              ? Math.abs(upcomingDelta) <= diffMeta.perfectMs ? 'ring-4 ring-pink-400 scale-105'
              : Math.abs(upcomingDelta) <= diffMeta.greatMs ? 'ring-2 ring-violet-400'
              : 'ring-2 ring-sky-400'
              : '';
            const laneColor = SPORT_LANE_COLOR[card?.sport || 'baseball'];
            return (
              <button
                key={i}
                onClick={() => handleTap(i)}
                disabled={phase !== 'playing'}
                className={`aspect-[3/4] rounded-lg border-2 border-slate-700 p-2 transition-all ${pulseStrength} ${phase === 'playing' ? 'hover:border-pink-500 cursor-pointer' : 'cursor-not-allowed opacity-80'}`}
              >
                <div className={`h-1 ${laneColor} rounded-full mb-2`} />
                <div className="text-xs font-semibold text-white line-clamp-2 mb-1">
                  {card ? fmtCardName(card) : '—'}
                </div>
                <div className="text-[10px] text-slate-500">
                  {card ? `${card.year} ${card.set.slice(0, 18)}` : ''}
                </div>
                <div className="mt-1 text-[10px] text-slate-600">Lane {i + 1}</div>
              </button>
            );
          })}
        </div>

        {/* Beat indicator bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Progress</span>
            <span>{(elapsedMs / 1000).toFixed(1)}s / {diffMeta.durationSec}s</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-violet-500 transition-all"
              style={{ width: phase === 'playing' ? `${Math.min(100, (elapsedMs / (diffMeta.durationSec * 1000)) * 100)}%` : '0%' }}
            />
          </div>
        </div>

        {/* Status pane */}
        {phase === 'idle' && (
          <div className="mt-4 text-center">
            <button
              onClick={startCountdown}
              disabled={mode === 'daily' && dailyLocked}
              className="bg-pink-600 hover:bg-pink-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-lg transition"
            >
              {mode === 'daily' && dailyLocked ? 'Daily already played — try Free Play' : `▶ Start ${DIFFICULTY[difficulty].label}`}
            </button>
          </div>
        )}

        {phase === 'countdown' && (
          <div className="mt-4 text-center">
            <div className="text-6xl font-bold text-pink-400">{countdownNum}</div>
            <div className="text-xs text-slate-400 mt-2">Get ready…</div>
          </div>
        )}

        {phase === 'playing' && (
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-900/80 rounded-md py-2">
              <div className="text-[10px] uppercase tracking-wider text-slate-500">Score</div>
              <div className="text-xl font-bold text-white">{score.toLocaleString()}</div>
            </div>
            <div className="bg-slate-900/80 rounded-md py-2">
              <div className="text-[10px] uppercase tracking-wider text-slate-500">Combo</div>
              <div className="text-xl font-bold text-pink-300">{combo}×</div>
              <div className="text-[10px] text-slate-500">mult ×{multiplier.toFixed(1)}</div>
            </div>
            <div className="bg-slate-900/80 rounded-md py-2">
              <div className="text-[10px] uppercase tracking-wider text-slate-500">Last hit</div>
              <div className={`text-xl font-bold ${lastHit ? QUALITY_COLOR[lastHit.quality] : 'text-slate-500'}`}>
                {lastHit ? lastHit.quality.toUpperCase() : '—'}
              </div>
            </div>
          </div>
        )}

        {phase === 'done' && (
          <div className="mt-4 bg-gradient-to-br from-pink-950/60 to-violet-950/40 border border-pink-700/60 rounded-lg p-5 text-center">
            <div className="text-xs uppercase tracking-wider text-pink-300 mb-2">Track complete</div>
            <div className="text-5xl font-bold text-white mb-3">{finalGrade}</div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400">Score</div>
                <div className="text-lg font-bold text-white">{score.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400">Perfects</div>
                <div className="text-lg font-bold text-pink-300">{perfects}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400">Best combo</div>
                <div className="text-lg font-bold text-white">{bestCombo}×</div>
              </div>
            </div>
            <button
              onClick={() => { setPhase('idle'); }}
              className="bg-pink-600 hover:bg-pink-500 text-white font-semibold px-6 py-2 rounded-lg transition"
            >
              {mode === 'daily' ? 'Back to menu' : 'Play again'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
