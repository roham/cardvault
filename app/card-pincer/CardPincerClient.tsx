'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { sportsCards, type SportsCard } from '@/data/sports-cards';

type Phase = 'intro' | 'playing' | 'done';
type Mode = 'daily' | 'free';
type Criterion = 'year' | 'sport' | 'set-family' | 'player';

type PincerCard = {
  slug: string;
  player: string;
  year: number;
  sport: SportsCard['sport'];
  set: string;
  rookie: boolean;
};

type Round = {
  cards: PincerCard[];
  criterion: Criterion;
  // the "pair" cards (more than 2 may satisfy criterion, any valid pair wins)
  valid: (a: PincerCard, b: PincerCard) => boolean;
  label: string;
};

const STORAGE_KEY = 'cv_card_pincer_stats_v1';
const DAILY_KEY = 'cv_card_pincer_daily_v1';
const TOTAL_ROUNDS = 10;
const ROUND_SECONDS = 60;

const SPORT: Record<SportsCard['sport'], { label: string; color: string }> = {
  baseball: { label: 'MLB', color: 'bg-sky-500/20 text-sky-300 border-sky-500/40' },
  basketball: { label: 'NBA', color: 'bg-orange-500/20 text-orange-300 border-orange-500/40' },
  football: { label: 'NFL', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  hockey: { label: 'NHL', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
};

function fnv1a(s: string): number { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); } return h >>> 0; }
function mulberry32(seed: number): () => number { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function shuffle<T>(arr: T[], rng: () => number): T[] { const c = [...arr]; for (let i = c.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [c[i], c[j]] = [c[j], c[i]]; } return c; }
function todayKey(): string { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }

function setFamily(s: string): string {
  // reduce "2020 Topps Chrome Update" → "Topps Chrome"
  const lower = s.toLowerCase();
  const families = ['topps chrome', 'topps heritage', 'bowman chrome', 'bowman university', 'bowman draft', 'panini prizm', 'panini contenders', 'panini donruss', 'upper deck', 'topps', 'bowman', 'panini', 'ud'];
  for (const f of families) if (lower.includes(f)) return f;
  return lower;
}

function pickCriterion(rng: () => number): Criterion {
  const r = rng();
  if (r < 0.35) return 'year';
  if (r < 0.6) return 'sport';
  if (r < 0.85) return 'set-family';
  return 'player';
}

function criterionLabel(c: Criterion): string {
  return c === 'year' ? 'SAME YEAR' : c === 'sport' ? 'SAME SPORT' : c === 'set-family' ? 'SAME SET FAMILY' : 'SAME PLAYER';
}

function isValidPair(c: Criterion, a: PincerCard, b: PincerCard): boolean {
  if (a.slug === b.slug) return false;
  if (c === 'year') return a.year === b.year;
  if (c === 'sport') return a.sport === b.sport;
  if (c === 'set-family') return setFamily(a.set) === setFamily(b.set);
  return a.player === b.player;
}

function buildRound(rng: () => number): Round {
  const criterion = pickCriterion(rng);
  // sample 12 cards with guaranteed at least one valid pair
  const all = sportsCards.map((c) => ({ slug: c.slug, player: c.player, year: c.year, sport: c.sport, set: c.set, rookie: c.rookie }));
  let picks: PincerCard[] = [];
  let attempts = 0;
  while (attempts < 20) {
    attempts++;
    picks = shuffle(all, rng).slice(0, 12);
    // check at least one valid pair exists
    let found = false;
    for (let i = 0; i < picks.length && !found; i++) {
      for (let j = i + 1; j < picks.length && !found; j++) {
        if (isValidPair(criterion, picks[i], picks[j])) found = true;
      }
    }
    if (found) break;
  }
  return {
    cards: picks,
    criterion,
    valid: (a, b) => isValidPair(criterion, a, b),
    label: criterionLabel(criterion),
  };
}

type Stats = { games: number; best: number; dailyStreak: number; bestStreak: number; lastDaily: string };
const EMPTY: Stats = { games: 0, best: 0, dailyStreak: 0, bestStreak: 0, lastDaily: '' };
function loadStats(): Stats { if (typeof window === 'undefined') return EMPTY; try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY; } catch { return EMPTY; } }
function saveStats(s: Stats) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {} }

export default function CardPincerClient() {
  const [mode, setMode] = useState<Mode>('daily');
  const [phase, setPhase] = useState<Phase>('intro');
  const [rng, setRng] = useState<() => number>(() => Math.random);
  const [roundIdx, setRoundIdx] = useState(0);
  const [round, setRound] = useState<Round | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [score, setScore] = useState(0);
  const [resultGrid, setResultGrid] = useState<string[]>([]);
  const [stats, setStats] = useState<Stats>(EMPTY);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => { setStats(loadStats()); }, []);

  const start = useCallback((m: Mode) => {
    const seed = m === 'daily' ? fnv1a(`cv_pincer_${todayKey()}`) : fnv1a(`cv_pincer_free_${Date.now()}_${Math.random()}`);
    const r = mulberry32(seed);
    setRng(() => r);
    setMode(m);
    setRoundIdx(0);
    setRound(buildRound(r));
    setSelected([]);
    setFeedback(null);
    setTimeLeft(ROUND_SECONDS);
    setScore(0);
    setResultGrid([]);
    setPhase('playing');
  }, []);

  const nextRound = useCallback(() => {
    if (roundIdx + 1 >= TOTAL_ROUNDS) {
      setPhase('done');
      setStats((prev) => {
        const next: Stats = { ...prev };
        next.games += 1;
        if (score > next.best) next.best = score;
        if (mode === 'daily' && score >= 6) {
          const today = todayKey();
          const y = new Date(); y.setDate(y.getDate() - 1);
          const yesterday = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, '0')}-${String(y.getDate()).padStart(2, '0')}`;
          if (prev.lastDaily === yesterday) next.dailyStreak = prev.dailyStreak + 1;
          else if (prev.lastDaily === today) next.dailyStreak = prev.dailyStreak;
          else next.dailyStreak = 1;
          if (next.dailyStreak > next.bestStreak) next.bestStreak = next.dailyStreak;
          next.lastDaily = today;
          try { localStorage.setItem(DAILY_KEY, today); } catch {}
        }
        saveStats(next);
        return next;
      });
      return;
    }
    setRoundIdx((i) => i + 1);
    setRound(buildRound(rng));
    setSelected([]);
    setFeedback(null);
  }, [roundIdx, rng, mode, score]);

  // timer (total over all rounds)
  useEffect(() => {
    if (phase !== 'playing') return;
    if (timeLeft <= 0) { setPhase('done'); saveStats({ ...loadStats(), games: stats.games + 1 }); return; }
    timerRef.current = window.setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [phase, timeLeft, stats.games]);

  function togglePick(slug: string) {
    if (phase !== 'playing' || !round || feedback) return;
    setSelected((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= 2) return prev;
      const next = [...prev, slug];
      if (next.length === 2) {
        const a = round.cards.find((c) => c.slug === next[0])!;
        const b = round.cards.find((c) => c.slug === next[1])!;
        const ok = round.valid(a, b);
        setFeedback(ok ? 'correct' : 'wrong');
        if (ok) {
          setScore((s) => s + 1);
          setResultGrid((g) => [...g, '🟢']);
        } else {
          setResultGrid((g) => [...g, '⚫']);
        }
        setTimeout(nextRound, 900);
      }
      return next;
    });
  }

  const shareText = useMemo(() => {
    if (phase !== 'done') return '';
    const grid = resultGrid.length ? resultGrid : new Array(TOTAL_ROUNDS).fill('⬜');
    const rows: string[] = [];
    for (let i = 0; i < grid.length; i += 5) rows.push(grid.slice(i, i + 5).join(''));
    const lines: string[] = [];
    lines.push(`Card Pincer ${mode === 'daily' ? todayKey() : '(Free Play)'}`);
    lines.push(`Score: ${score}/${TOTAL_ROUNDS}`);
    lines.push('');
    rows.forEach(r => lines.push(r));
    lines.push('');
    lines.push('Play: https://cardvault-two.vercel.app/card-pincer');
    return lines.join('\n');
  }, [phase, resultGrid, mode, score]);

  function copy() {
    if (!navigator?.clipboard) return;
    navigator.clipboard.writeText(shareText).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1600); });
  }

  if (phase === 'intro') {
    return (
      <div className="space-y-8">
        <div className="rounded-2xl bg-gradient-to-br from-purple-950/60 to-fuchsia-950/40 border border-purple-900/50 p-8">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">Pinch two cards that share the attribute.</h2>
          <p className="text-gray-300 mb-6 max-w-2xl">Ten rounds. Sixty seconds total. Each round shows twelve cards and a matching rule \u2014 same year, same sport, same set family, or same player. Pick the two that satisfy. Correct = green, wrong = black. Fast.</p>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => start('daily')} className="px-5 py-2.5 rounded-lg bg-purple-500 hover:bg-purple-400 text-white font-bold">Play today\u2019s Daily Pincer</button>
            <button onClick={() => start('free')} className="px-5 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-100 font-bold">Free Play</button>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label="Games" value={stats.games} />
          <Stat label="Best Score" value={`${stats.best}/${TOTAL_ROUNDS}`} />
          <Stat label="Daily Streak" value={stats.dailyStreak} />
          <Stat label="Best Streak" value={stats.bestStreak} />
        </div>
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl p-6 bg-gradient-to-br from-purple-500 to-fuchsia-700 text-white">
          <div className="text-xs uppercase tracking-wider opacity-80">Final</div>
          <div className="text-5xl font-black mt-1">{score}/{TOTAL_ROUNDS}</div>
          <div className="text-sm mt-2 opacity-90">{score === 10 ? 'Perfect pincer. You read the grid.' : score >= 8 ? 'Sharp. Almost untouchable.' : score >= 6 ? 'Solid \u2014 you saw most of them.' : score >= 3 ? 'The clock caught you.' : 'Back to the draft board.'}</div>
        </div>
        <div className="rounded-xl bg-gray-900/60 border border-gray-800 p-4">
          <div className="text-xs uppercase tracking-wider text-purple-300 font-semibold mb-2">Result grid</div>
          <div className="text-2xl font-mono">{resultGrid.join(' ') || '—'}</div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={copy} className="px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-400 text-white font-bold text-sm">{copied ? 'Copied!' : 'Share result'}</button>
          <button onClick={() => start('free')} className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-100 font-semibold text-sm">Free Play</button>
          <button onClick={() => setPhase('intro')} className="px-4 py-2 rounded-lg bg-transparent hover:bg-gray-800 text-gray-400 hover:text-gray-200 font-medium text-sm">Back</button>
        </div>
      </div>
    );
  }

  if (!round) return null;
  const urgency = timeLeft <= 10 ? 'text-red-400' : timeLeft <= 20 ? 'text-amber-400' : 'text-purple-300';

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className={`text-3xl font-black font-mono tabular-nums ${urgency} ${timeLeft <= 10 ? 'animate-pulse' : ''}`}>{timeLeft}s</div>
          <div className="text-gray-400 text-sm">Round <span className="text-white font-bold">{roundIdx + 1}</span> / {TOTAL_ROUNDS}</div>
          <div className="text-gray-400 text-sm">Score <span className="text-purple-300 font-bold">{score}</span></div>
        </div>
        <div className={`text-sm font-black tracking-wider ${feedback === 'correct' ? 'text-emerald-400' : feedback === 'wrong' ? 'text-red-400' : 'text-purple-300'}`}>
          FIND {round.label}
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
        {round.cards.map((c) => {
          const picked = selected.includes(c.slug);
          const cls = feedback
            ? picked ? (feedback === 'correct' ? 'ring-2 ring-emerald-400 bg-emerald-950/40' : 'ring-2 ring-red-500 bg-red-950/40') : 'ring-1 ring-gray-800 bg-gray-900/40 opacity-70'
            : picked ? 'ring-2 ring-purple-400 bg-purple-950/50' : 'ring-1 ring-gray-700 bg-gray-900/60 hover:ring-purple-500/60';
          return (
            <button key={c.slug} onClick={() => togglePick(c.slug)} disabled={!!feedback} className={`text-left rounded-xl p-2.5 transition-all ${cls}`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-semibold uppercase tracking-wider ${SPORT[c.sport].color}`}>{SPORT[c.sport].label}</span>
                {c.rookie && <span className="text-[9px] px-1 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800 font-bold">RC</span>}
              </div>
              <div className="text-white font-semibold text-xs leading-tight line-clamp-2">{c.player}</div>
              <div className="text-gray-500 text-[10px] mt-0.5">{c.year}</div>
            </button>
          );
        })}
      </div>
      <div className="text-xs text-gray-500">Pinch two. Correct = +1 and advance. Wrong = advance. Timer runs through all 10 rounds.</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl bg-gray-900/60 border border-gray-800 p-3">
      <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">{label}</div>
      <div className="text-2xl font-black text-purple-300">{value}</div>
    </div>
  );
}
