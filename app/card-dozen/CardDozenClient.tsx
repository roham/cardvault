'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { sportsCards, type SportsCard } from '@/data/sports-cards';

type Phase = 'intro' | 'picking' | 'revealed';
type Mode = 'daily' | 'free';

type DozenCard = {
  slug: string;
  player: string;
  year: number;
  sport: SportsCard['sport'];
  set: string;
  rookie: boolean;
  value: number;
  label: string;
};

const STORAGE_KEY = 'cv_card_dozen_stats_v1';
const DAILY_KEY = 'cv_card_dozen_daily_v1';
const ROUND_SECONDS = 30;

type Stats = {
  games: number;
  bestScore: number;
  bestMedal: string;
  golds: number;
  silvers: number;
  bronzes: number;
  busts: number;
  currentStreak: number;
  bestStreak: number;
  lastDaily: string;
};

const EMPTY_STATS: Stats = {
  games: 0,
  bestScore: 0,
  bestMedal: '—',
  golds: 0,
  silvers: 0,
  bronzes: 0,
  busts: 0,
  currentStreak: 0,
  bestStreak: 0,
  lastDaily: '',
};

const SPORT_META: Record<SportsCard['sport'], { label: string; color: string }> = {
  baseball: { label: 'MLB', color: 'bg-sky-500/20 text-sky-300 border-sky-500/40' },
  basketball: { label: 'NBA', color: 'bg-orange-500/20 text-orange-300 border-orange-500/40' },
  football: { label: 'NFL', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  hockey: { label: 'NHL', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
};

function parsePrice(v: string): number {
  const cleaned = v.replace(/,/g, '');
  const m = cleaned.match(/\$([0-9]+(?:\.[0-9]+)?)/);
  return m ? parseFloat(m[1]) : 0;
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return `$${Math.round(n).toLocaleString('en-US')}`;
}

function fnv1a(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Build 12 cards: 3 per sport, value-spread, deduped by player.
function buildDozen(seed: number): DozenCard[] {
  const rng = mulberry32(seed);
  const sports: SportsCard['sport'][] = ['baseball', 'basketball', 'football', 'hockey'];
  const result: DozenCard[] = [];
  const usedPlayers = new Set<string>();

  for (const sport of sports) {
    const pool = sportsCards.filter((c) => c.sport === sport && parsePrice(c.estimatedValueRaw) > 0);
    const shuffled = shuffle(pool, rng);
    let picked = 0;
    for (const card of shuffled) {
      if (picked >= 3) break;
      if (usedPlayers.has(card.player)) continue;
      const price = parsePrice(card.estimatedValueRaw);
      if (price <= 0) continue;
      // ensure value spread within sport: at least one >$500 and one <$50 ideally — enforce via tiered picking below
      result.push({
        slug: card.slug,
        player: card.player,
        year: card.year,
        sport: card.sport,
        set: card.set,
        rookie: card.rookie,
        value: price,
        label: card.estimatedValueRaw,
      });
      usedPlayers.add(card.player);
      picked++;
    }
  }
  return shuffle(result, rng);
}

function scoreFromPicks(picks: DozenCard[], dozen: DozenCard[]): { score: number; topThreeSum: number; userSum: number } {
  const sorted = [...dozen].sort((a, b) => b.value - a.value);
  const topThreeSum = sorted.slice(0, 3).reduce((s, c) => s + c.value, 0);
  const userSum = picks.reduce((s, c) => s + c.value, 0);
  const score = topThreeSum === 0 ? 0 : Math.max(0, Math.min(100, (userSum / topThreeSum) * 100));
  return { score, topThreeSum, userSum };
}

function medalFromScore(score: number): { tier: 'gold' | 'silver' | 'bronze' | 'bust'; label: string; icon: string; color: string } {
  if (score >= 95) return { tier: 'gold', label: 'GOLD — Perfect Eye', icon: '🥇', color: 'from-yellow-400 to-amber-500' };
  if (score >= 80) return { tier: 'silver', label: 'SILVER — Sharp Pick', icon: '🥈', color: 'from-gray-300 to-gray-500' };
  if (score >= 60) return { tier: 'bronze', label: 'BRONZE — Solid Read', icon: '🥉', color: 'from-orange-500 to-amber-700' };
  return { tier: 'bust', label: 'BUST — Back to the Price Guide', icon: '💸', color: 'from-rose-600 to-red-700' };
}

function loadStats(): Stats {
  if (typeof window === 'undefined') return EMPTY_STATS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATS;
    return { ...EMPTY_STATS, ...JSON.parse(raw) };
  } catch { return EMPTY_STATS; }
}

function saveStats(s: Stats) {
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
}

export default function CardDozenClient() {
  const [mode, setMode] = useState<Mode>('daily');
  const [phase, setPhase] = useState<Phase>('intro');
  const [dozen, setDozen] = useState<DozenCard[]>([]);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState<number>(ROUND_SECONDS);
  const [result, setResult] = useState<{ score: number; topThreeSum: number; userSum: number } | null>(null);
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => { setStats(loadStats()); }, []);

  const dailyPlayedToday = useMemo(() => {
    if (typeof window === 'undefined') return false;
    try { return window.localStorage.getItem(DAILY_KEY) === todayKey(); } catch { return false; }
  }, [phase]);

  const startRound = useCallback((m: Mode) => {
    const seed = m === 'daily' ? fnv1a(`cv_dozen_${todayKey()}`) : fnv1a(`cv_dozen_free_${Date.now()}_${Math.random()}`);
    const d = buildDozen(seed);
    setDozen(d);
    setPicked(new Set());
    setTimeLeft(ROUND_SECONDS);
    setResult(null);
    setMode(m);
    setPhase('picking');
  }, []);

  const reveal = useCallback((picksInput?: Set<string>) => {
    const picksArr = Array.from(picksInput ?? picked);
    const pickCards = dozen.filter((c) => picksArr.includes(c.slug));
    const res = scoreFromPicks(pickCards, dozen);
    setResult(res);
    setPhase('revealed');

    const medal = medalFromScore(res.score);
    setStats((prev) => {
      const next: Stats = { ...prev };
      next.games += 1;
      if (res.score > next.bestScore) {
        next.bestScore = res.score;
        next.bestMedal = medal.label.split(' ')[0];
      }
      if (medal.tier === 'gold') next.golds += 1;
      else if (medal.tier === 'silver') next.silvers += 1;
      else if (medal.tier === 'bronze') next.bronzes += 1;
      else next.busts += 1;

      if (mode === 'daily' && medal.tier !== 'bust') {
        const today = todayKey();
        const yesterday = (() => {
          const d = new Date();
          d.setDate(d.getDate() - 1);
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        })();
        if (prev.lastDaily === yesterday) next.currentStreak = prev.currentStreak + 1;
        else if (prev.lastDaily === today) next.currentStreak = prev.currentStreak;
        else next.currentStreak = 1;
        if (next.currentStreak > next.bestStreak) next.bestStreak = next.currentStreak;
        next.lastDaily = today;
        try { window.localStorage.setItem(DAILY_KEY, today); } catch {}
      }
      saveStats(next);
      return next;
    });
  }, [dozen, picked, mode]);

  // Timer
  useEffect(() => {
    if (phase !== 'picking') return;
    if (timeLeft <= 0) {
      reveal();
      return;
    }
    timerRef.current = window.setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [phase, timeLeft, reveal]);

  function togglePick(slug: string) {
    if (phase !== 'picking') return;
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        if (next.size >= 3) return prev;
        next.add(slug);
      }
      if (next.size === 3) {
        // auto-reveal after 500ms to let user see 3rd selected state
        setTimeout(() => reveal(next), 450);
      }
      return next;
    });
  }

  const sortedDozen = useMemo(() => [...dozen].sort((a, b) => b.value - a.value), [dozen]);
  const topThreeSlugs = useMemo(() => new Set(sortedDozen.slice(0, 3).map((c) => c.slug)), [sortedDozen]);

  const shareText = useMemo(() => {
    if (!result) return '';
    const medal = medalFromScore(result.score);
    const grid = dozen.map((c) => {
      const userPicked = picked.has(c.slug);
      const actuallyTop = topThreeSlugs.has(c.slug);
      if (userPicked && actuallyTop) return '🟢';
      if (userPicked && !actuallyTop) return '⚫';
      if (!userPicked && actuallyTop) return '🟡';
      return '⬜';
    });
    const rows: string[] = [];
    for (let i = 0; i < grid.length; i += 4) rows.push(grid.slice(i, i + 4).join(''));

    const lines: string[] = [];
    lines.push(`Card Dozen ${mode === 'daily' ? todayKey() : '(Free Play)'}`);
    lines.push(`${medal.icon} ${medal.label}`);
    lines.push(`Score: ${result.score.toFixed(0)}/100`);
    lines.push(`Picks: ${fmt(result.userSum)} of max ${fmt(result.topThreeSum)}`);
    lines.push('');
    rows.forEach((r) => lines.push(r));
    lines.push('');
    lines.push('Play: https://cardvault-two.vercel.app/card-dozen');
    return lines.join('\n');
  }, [result, dozen, picked, topThreeSlugs, mode]);

  function copyShare() {
    if (typeof navigator === 'undefined') return;
    navigator.clipboard?.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  }

  if (phase === 'intro') {
    return (
      <div className="space-y-8">
        <div className="rounded-2xl bg-gradient-to-br from-lime-950/60 to-emerald-950/40 border border-lime-900/50 p-8">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">Twelve cards. Thirty seconds. Pick the top three.</h2>
          <p className="text-gray-300 mb-6 max-w-2xl">
            Every round drops twelve real sports cards on the table \u2014 three per sport. You pick which three you think are worth the most money. Sum of your picks over sum of the actual top-three is your score. Gold at 95+, silver at 80+, bronze at 60+, bust below.
          </p>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => startRound('daily')} className="px-5 py-2.5 rounded-lg bg-lime-500 hover:bg-lime-400 text-black font-bold transition-colors">
              {dailyPlayedToday ? 'Play today\u2019s round again' : 'Play today\u2019s Daily Dozen'}
            </button>
            <button onClick={() => startRound('free')} className="px-5 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-100 font-bold transition-colors">
              Free Play
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label="Games" value={stats.games} />
          <Stat label="Best Score" value={stats.bestScore.toFixed(0)} />
          <Stat label="Current Streak" value={stats.currentStreak} />
          <Stat label="Best Streak" value={stats.bestStreak} />
          <Stat label="Gold" value={stats.golds} tone="gold" />
          <Stat label="Silver" value={stats.silvers} tone="silver" />
          <Stat label="Bronze" value={stats.bronzes} tone="bronze" />
          <Stat label="Bust" value={stats.busts} tone="bust" />
        </div>
      </div>
    );
  }

  const urgency = timeLeft <= 5 ? 'text-red-400' : timeLeft <= 10 ? 'text-amber-400' : 'text-lime-300';

  return (
    <div className="space-y-6">
      {/* Timer + controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className={`text-4xl font-black font-mono tabular-nums ${urgency} ${phase === 'picking' && timeLeft <= 5 ? 'animate-pulse' : ''}`}>{timeLeft}</div>
          <div className="text-gray-400 text-sm">
            {phase === 'picking' ? `Picked ${picked.size}/3` : 'Round complete'}
          </div>
        </div>
        <div className="text-xs uppercase tracking-wider text-gray-500">
          {mode === 'daily' ? `Daily \u2022 ${todayKey()}` : 'Free Play'}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {dozen.map((c) => {
          const userPicked = picked.has(c.slug);
          const revealed = phase === 'revealed';
          const isTop3 = topThreeSlugs.has(c.slug);
          const cls = revealed
            ? userPicked && isTop3 ? 'ring-2 ring-lime-400 bg-lime-950/40'
            : userPicked && !isTop3 ? 'ring-2 ring-red-500/60 bg-red-950/30'
            : !userPicked && isTop3 ? 'ring-2 ring-yellow-400/70 bg-yellow-950/30'
            : 'ring-1 ring-gray-800 bg-gray-900/40 opacity-70'
            : userPicked ? 'ring-2 ring-lime-400 bg-lime-950/50'
            : 'ring-1 ring-gray-700 bg-gray-900/60 hover:ring-lime-500/60';
          return (
            <button
              key={c.slug}
              onClick={() => togglePick(c.slug)}
              disabled={phase !== 'picking'}
              className={`text-left rounded-xl p-3 transition-all ${cls}`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase tracking-wider ${SPORT_META[c.sport].color}`}>{SPORT_META[c.sport].label}</span>
                {c.rookie && <span className="text-[10px] px-1.5 py-0.5 rounded bg-lime-950/60 text-lime-300 border border-lime-800 font-bold">RC</span>}
              </div>
              <div className="text-white font-semibold text-sm leading-tight line-clamp-2">{c.player}</div>
              <div className="text-gray-400 text-xs mt-0.5">{c.year} {c.set}</div>
              {revealed && (
                <div className="mt-2 pt-2 border-t border-gray-800">
                  <div className={`font-bold text-sm ${isTop3 ? 'text-lime-300' : 'text-gray-400'}`}>{fmt(c.value)}</div>
                  {isTop3 && <div className="text-[10px] text-lime-400 uppercase tracking-wider mt-0.5">Top 3</div>}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Reveal panel */}
      {phase === 'revealed' && result && (
        <div className="space-y-4">
          <ResultCard result={result} />

          <div className="rounded-xl bg-gray-900/60 border border-gray-800 p-4">
            <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">Top 3 by value</div>
            <div className="space-y-1">
              {sortedDozen.slice(0, 3).map((c, i) => (
                <div key={c.slug} className="flex items-center justify-between text-sm py-1 border-b border-gray-800 last:border-0">
                  <span className="text-gray-300"><span className="text-lime-400 font-mono mr-2">#{i + 1}</span>{c.year} {c.player}{c.rookie ? ' RC' : ''}</span>
                  <span className="text-lime-300 font-mono">{fmt(c.value)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button onClick={copyShare} className="px-4 py-2 rounded-lg bg-lime-500 hover:bg-lime-400 text-black font-bold text-sm transition-colors">
              {copied ? 'Copied!' : 'Share result'}
            </button>
            <button onClick={() => startRound('free')} className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-100 font-semibold text-sm transition-colors">
              Play Free Round
            </button>
            <button onClick={() => setPhase('intro')} className="px-4 py-2 rounded-lg bg-transparent hover:bg-gray-800 text-gray-400 hover:text-gray-200 font-medium text-sm">
              Back
            </button>
          </div>
        </div>
      )}

      {phase === 'picking' && (
        <div className="text-xs text-gray-500">
          Tap to pick. The round ends the moment you pick your third card or the clock runs out.
        </div>
      )}
    </div>
  );
}

function ResultCard({ result }: { result: { score: number; topThreeSum: number; userSum: number } }) {
  const medal = medalFromScore(result.score);
  return (
    <div className={`rounded-2xl p-6 bg-gradient-to-br ${medal.color} text-black`}>
      <div className="flex items-center gap-4">
        <div className="text-5xl">{medal.icon}</div>
        <div>
          <div className="text-xs uppercase tracking-wider font-semibold opacity-80">Result</div>
          <div className="text-2xl font-black">{medal.label}</div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-4xl font-black font-mono tabular-nums">{result.score.toFixed(0)}</div>
          <div className="text-xs uppercase tracking-wider opacity-80">/ 100</div>
        </div>
      </div>
      <div className="mt-3 text-sm font-semibold">
        Your picks: {fmt(result.userSum)} \u2022 Max possible: {fmt(result.topThreeSum)}
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number | string; tone?: 'gold' | 'silver' | 'bronze' | 'bust' }) {
  const color = tone === 'gold' ? 'text-yellow-300' : tone === 'silver' ? 'text-gray-300' : tone === 'bronze' ? 'text-amber-500' : tone === 'bust' ? 'text-rose-400' : 'text-lime-300';
  return (
    <div className="rounded-xl bg-gray-900/60 border border-gray-800 p-3">
      <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">{label}</div>
      <div className={`text-2xl font-black ${color}`}>{value}</div>
    </div>
  );
}
