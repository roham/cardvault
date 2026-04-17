'use client';

import { useEffect, useMemo, useState } from 'react';
import { sportsCards } from '@/data/sports-cards';

const STORAGE_KEY = 'cv_card_path_v1';
const DAILY_KEY = 'cv_card_path_daily_v1';
const ROUNDS = 5;

type Mode = 'daily' | 'free';

type MiniCard = {
  slug: string;
  name: string;
  year: number;
  sport: string;
  player: string;
  rookie: boolean;
  fmv: number;
  tier: string;
};

type Stats = {
  games: number;
  bestScore: number;
  bestGrade: string;
  lifetimeValue: number;
  dailyStreak: number;
  lastDailyDate: string;
  lastDailyScore: number;
};

const DEFAULT_STATS: Stats = {
  games: 0,
  bestScore: 0,
  bestGrade: '—',
  lifetimeValue: 0,
  dailyStreak: 0,
  lastDailyDate: '',
  lastDailyScore: 0,
};

// FNV-1a 32-bit hash for deterministic seeding
function fnv1a(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

function seededRand(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = Math.imul(s ^ (s >>> 15), 2246822507) >>> 0;
    s = Math.imul(s ^ (s >>> 13), 3266489909) >>> 0;
    return ((s ^= s >>> 16) >>> 0) / 0xffffffff;
  };
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function parseFmv(raw?: string, gem?: string): number {
  const src = raw || gem || '';
  const m = src.match(/\$([0-9,]+)/);
  if (!m) return 5;
  return parseInt(m[1].replace(/,/g, ''), 10) || 5;
}

function tierOf(fmv: number): string {
  if (fmv >= 10000) return 'grail';
  if (fmv >= 1000) return 'premium';
  if (fmv >= 200) return 'mid';
  if (fmv >= 50) return 'budget';
  return 'entry';
}

function sportEmoji(s: string): string {
  if (s === 'baseball') return '⚾';
  if (s === 'basketball') return '🏀';
  if (s === 'football') return '🏈';
  if (s === 'hockey') return '🏒';
  return '🎴';
}

function decadeOf(year: number): string {
  return `${Math.floor(year / 10) * 10}s`;
}

function toMini(c: typeof sportsCards[number]): MiniCard {
  const fmv = parseFmv(c.estimatedValueRaw as string, c.estimatedValueGem as string);
  return {
    slug: c.slug,
    name: c.name,
    year: c.year,
    sport: String(c.sport),
    player: c.player,
    rookie: !!c.rookie,
    fmv,
    tier: tierOf(fmv),
  };
}

// Score + grade
function scoreCollection(picks: MiniCard[]): { base: number; bonuses: { label: string; pct: number }[]; total: number; grade: string; } {
  const base = picks.reduce((s, p) => s + p.fmv, 0);
  const bonuses: { label: string; pct: number }[] = [];
  if (picks.length > 0) {
    const sports = new Set(picks.map(p => p.sport));
    if (sports.size === 1) bonuses.push({ label: `All ${picks[0].sport}`, pct: 0.4 });
    if (picks.every(p => p.rookie)) bonuses.push({ label: 'All rookies', pct: 0.4 });
    const decades = new Set(picks.map(p => decadeOf(p.year)));
    if (decades.size === 1) bonuses.push({ label: `All ${decadeOf(picks[0].year)}`, pct: 0.3 });
    const tiers = new Set(picks.map(p => p.tier));
    if (tiers.size === 1) bonuses.push({ label: `All ${picks[0].tier}`, pct: 0.25 });
  }
  const mult = 1 + bonuses.reduce((s, b) => s + b.pct, 0);
  const total = Math.round(base * mult);
  let grade = 'F';
  if (total >= 5000) grade = 'S';
  else if (total >= 2000) grade = 'A';
  else if (total >= 1000) grade = 'B';
  else if (total >= 500) grade = 'C';
  else if (total >= 200) grade = 'D';
  return { base, bonuses, total, grade };
}

// Weight function — biases next pair toward attributes already picked
function pairFor(pool: MiniCard[], picks: MiniCard[], rnd: () => number): [MiniCard, MiniCard] {
  const sportCounts: Record<string, number> = {};
  picks.forEach(p => { sportCounts[p.sport] = (sportCounts[p.sport] || 0) + 1; });
  const rookieCount = picks.filter(p => p.rookie).length;
  const topSport = Object.entries(sportCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const rookieBias = picks.length > 0 ? rookieCount / picks.length : 0;

  function cardWeight(c: MiniCard): number {
    let w = 1;
    if (topSport && c.sport === topSport && sportCounts[topSport] >= 1) w *= 1 + 0.6 * sportCounts[topSport];
    if (rookieBias >= 0.5 && c.rookie) w *= 1 + rookieBias;
    if (rookieBias < 0.5 && !c.rookie && picks.length > 0) w *= 1 + (1 - rookieBias);
    return w;
  }

  const weighted = pool.map(c => ({ c, w: cardWeight(c) }));
  const pick = (): MiniCard => {
    const total = weighted.reduce((s, x) => s + x.w, 0);
    let r = rnd() * total;
    for (const x of weighted) { r -= x.w; if (r <= 0) return x.c; }
    return weighted[weighted.length - 1].c;
  };
  let a = pick();
  let b = pick();
  // Guarantee non-identical pair
  let guard = 0;
  while (b.slug === a.slug && guard < 20) { b = pick(); guard++; }
  if (b.slug === a.slug) {
    const fallback = pool.find(x => x.slug !== a.slug);
    if (fallback) b = fallback;
  }
  return [a, b];
}

function buildPool(): MiniCard[] {
  return sportsCards
    .filter(c => c.estimatedValueRaw || c.estimatedValueGem)
    .map(toMini)
    .filter(m => m.fmv >= 5 && m.fmv <= 50000);
}

export default function CardPathClient() {
  const [hydrated, setHydrated] = useState(false);
  const [mode, setMode] = useState<Mode>('daily');
  const [picks, setPicks] = useState<MiniCard[]>([]);
  const [pair, setPair] = useState<[MiniCard, MiniCard] | null>(null);
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS);
  const [gameOver, setGameOver] = useState(false);
  const [copied, setCopied] = useState(false);
  const [rndState, setRndState] = useState<{ seed: number; step: number }>({ seed: 0, step: 0 });

  const pool = useMemo(buildPool, []);

  // Hydrate stats
  useEffect(() => {
    try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) setStats({ ...DEFAULT_STATS, ...JSON.parse(raw) }); } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(stats)); } catch {}
  }, [stats, hydrated]);

  // Check daily status
  const dailyDone = useMemo(() => {
    if (!hydrated) return false;
    try { const raw = localStorage.getItem(DAILY_KEY); if (!raw) return false; return JSON.parse(raw).date === todayKey(); } catch { return false; }
  }, [hydrated, picks, gameOver]);

  function seedFor(mode: Mode): number {
    if (mode === 'daily') return fnv1a(`cv-cardpath::${todayKey()}`);
    return fnv1a(`cv-cardpath::free::${Date.now()}::${Math.random()}`);
  }

  function newGame(m: Mode) {
    if (m === 'daily' && dailyDone) return;
    const seed = seedFor(m);
    const rnd = seededRand(seed);
    setMode(m);
    setPicks([]);
    setGameOver(false);
    setCopied(false);
    setRndState({ seed, step: 1 });
    // Round 1 pair
    setPair(pairFor(pool, [], rnd));
  }

  function onPick(card: MiniCard) {
    if (!pair) return;
    const next = [...picks, card];
    if (next.length >= ROUNDS) {
      // Game end
      setPicks(next);
      setPair(null);
      setGameOver(true);
      const result = scoreCollection(next);
      setStats(prev => {
        const updated: Stats = {
          games: prev.games + 1,
          bestScore: Math.max(prev.bestScore, result.total),
          bestGrade: gradeRank(result.grade) > gradeRank(prev.bestGrade) ? result.grade : prev.bestGrade,
          lifetimeValue: prev.lifetimeValue + result.total,
          dailyStreak: prev.dailyStreak,
          lastDailyDate: prev.lastDailyDate,
          lastDailyScore: prev.lastDailyScore,
        };
        if (mode === 'daily') {
          const today = todayKey();
          const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
          updated.dailyStreak = prev.lastDailyDate === yesterday ? prev.dailyStreak + 1 : 1;
          updated.lastDailyDate = today;
          updated.lastDailyScore = result.total;
          try { localStorage.setItem(DAILY_KEY, JSON.stringify({ date: today, score: result.total, grade: result.grade })); } catch {}
        }
        return updated;
      });
      return;
    }
    // Next round
    setPicks(next);
    const rnd = seededRand(rndState.seed + rndState.step * 2654435761);
    setRndState(s => ({ seed: s.seed, step: s.step + 1 }));
    setPair(pairFor(pool, next, rnd));
  }

  function gradeRank(g: string): number {
    return { S: 6, A: 5, B: 4, C: 3, D: 2, F: 1, '—': 0 }[g] ?? 0;
  }

  const result = gameOver && picks.length === ROUNDS ? scoreCollection(picks) : null;

  function shareEmoji() {
    if (!result) return;
    const header = `Card Path ${mode === 'daily' ? todayKey() : 'Free'}`;
    const row = picks.map(p => `${sportEmoji(p.sport)}${p.rookie ? 'R' : ''}`).join(' ');
    const bonusLine = result.bonuses.length > 0 ? result.bonuses.map(b => b.label).join(' / ') : 'No coherence';
    const txt = `${header}\n${row}\n${result.grade} · $${result.total.toLocaleString()} · ${bonusLine}\ncardvault-two.vercel.app/card-path`;
    if (navigator?.clipboard) navigator.clipboard.writeText(txt).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1600); });
  }

  function reset() {
    setPicks([]);
    setPair(null);
    setGameOver(false);
  }

  if (!hydrated) {
    return <div className="rounded-2xl bg-gray-900/60 border border-gray-800 p-8 text-center text-gray-500">Loading&hellip;</div>;
  }

  const round = picks.length + 1;

  return (
    <div className="space-y-6">
      {/* Mode switcher + stats */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-gray-900/60 border border-gray-800 p-4">
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => { reset(); setMode('daily'); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${mode === 'daily' ? 'bg-orange-500 text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >Daily</button>
            <button
              onClick={() => { reset(); setMode('free'); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${mode === 'free' ? 'bg-orange-500 text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >Free Play</button>
          </div>
          {mode === 'daily' && dailyDone && !gameOver && (
            <div className="text-xs text-orange-300">Daily complete. Best: ${stats.lastDailyScore.toLocaleString()} · Streak {stats.dailyStreak}</div>
          )}
          {!pair && !gameOver && (
            <button
              onClick={() => newGame(mode)}
              disabled={mode === 'daily' && dailyDone}
              className="w-full px-4 py-3 rounded-lg bg-orange-500 hover:bg-orange-400 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-black font-semibold text-sm transition-colors"
            >
              {mode === 'daily' && dailyDone ? 'Daily Done · Come Back Tomorrow' : `Start ${mode === 'daily' ? 'Daily' : 'Free'} Run`}
            </button>
          )}
        </div>
        <div className="rounded-xl bg-gray-900/60 border border-gray-800 p-4 text-xs text-gray-400 space-y-1">
          <div className="flex justify-between"><span>Games played</span><span className="text-white font-mono">{stats.games}</span></div>
          <div className="flex justify-between"><span>Best total</span><span className="text-white font-mono">${stats.bestScore.toLocaleString()}</span></div>
          <div className="flex justify-between"><span>Best grade</span><span className="text-white font-mono">{stats.bestGrade}</span></div>
          <div className="flex justify-between"><span>Lifetime value</span><span className="text-white font-mono">${stats.lifetimeValue.toLocaleString()}</span></div>
          <div className="flex justify-between"><span>Daily streak</span><span className="text-white font-mono">{stats.dailyStreak}🔥</span></div>
        </div>
      </div>

      {/* Round indicator */}
      {(pair || gameOver) && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: ROUNDS }).map((_, i) => (
            <div key={i} className={`w-8 h-2 rounded-full ${i < picks.length ? 'bg-orange-500' : i === picks.length && pair ? 'bg-orange-300 animate-pulse' : 'bg-gray-800'}`} />
          ))}
        </div>
      )}

      {/* Active round */}
      {pair && !gameOver && (
        <div className="rounded-2xl bg-gradient-to-br from-orange-950/30 to-amber-950/20 border border-orange-900/50 p-5">
          <div className="text-center mb-4">
            <div className="text-xs text-orange-300 font-semibold uppercase tracking-wider">Round {round} of {ROUNDS}</div>
            <div className="text-sm text-gray-400 mt-1">Pick one card to add to your collection</div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {pair.map((c, i) => (
              <button
                key={`${c.slug}-${i}`}
                onClick={() => onPick(c)}
                className="group text-left p-4 rounded-xl bg-gray-900/70 border border-gray-800 hover:border-orange-500 hover:bg-gray-900 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{sportEmoji(c.sport)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold text-sm group-hover:text-orange-300 transition-colors truncate">{c.name}</div>
                    <div className="text-gray-400 text-xs mt-1">{c.year} · {c.sport}{c.rookie ? ' · Rookie' : ''}</div>
                    <div className="text-orange-300 font-mono text-xs mt-1">${c.fmv.toLocaleString()}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Collection growing */}
      {picks.length > 0 && !gameOver && (
        <div className="rounded-xl bg-gray-900/40 border border-gray-800 p-3">
          <div className="text-xs font-semibold text-gray-400 mb-2">Your collection ({picks.length}/{ROUNDS})</div>
          <div className="flex flex-wrap gap-2">
            {picks.map((p, i) => (
              <div key={`${p.slug}-${i}`} className="px-2 py-1 rounded bg-gray-800/80 text-xs text-gray-200 flex items-center gap-1">
                <span>{sportEmoji(p.sport)}</span>
                <span className="truncate max-w-[140px]">{p.player}</span>
                <span className="text-orange-300 font-mono">${p.fmv.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Game over */}
      {gameOver && result && (
        <div className="rounded-2xl bg-gradient-to-br from-orange-950/40 to-amber-950/30 border border-orange-800/60 p-6">
          <div className="text-center mb-5">
            <div className={`text-6xl font-black ${result.grade === 'S' ? 'text-yellow-300' : result.grade === 'A' ? 'text-orange-300' : result.grade === 'B' ? 'text-lime-300' : result.grade === 'C' ? 'text-sky-300' : result.grade === 'D' ? 'text-rose-300' : 'text-gray-400'}`}>{result.grade}</div>
            <div className="text-2xl text-white font-bold mt-1">${result.total.toLocaleString()}</div>
            <div className="text-xs text-gray-400 mt-1">${result.base.toLocaleString()} base {result.bonuses.length > 0 ? `× ${(1 + result.bonuses.reduce((s, b) => s + b.pct, 0)).toFixed(2)} bonus` : ''}</div>
          </div>

          <div className="mb-4">
            <div className="text-xs font-semibold text-orange-300 mb-2">Coherence bonuses</div>
            <div className="space-y-1">
              {result.bonuses.length === 0 && <div className="text-xs text-gray-500">No theme bonus — collection is diverse.</div>}
              {result.bonuses.map((b, i) => (
                <div key={i} className="flex justify-between text-xs text-gray-200 bg-gray-900/60 rounded px-2 py-1">
                  <span>{b.label}</span>
                  <span className="font-mono text-orange-300">+{Math.round(b.pct * 100)}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <div className="text-xs font-semibold text-orange-300 mb-2">Final collection</div>
            <div className="space-y-1">
              {picks.map((p, i) => (
                <div key={`${p.slug}-${i}`} className="flex items-center justify-between text-xs text-gray-200 bg-gray-900/60 rounded px-2 py-1">
                  <span className="flex items-center gap-2"><span>{sportEmoji(p.sport)}</span><span className="truncate">{p.name}</span></span>
                  <span className="font-mono text-gray-400">${p.fmv.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={shareEmoji} className="flex-1 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-black font-semibold text-sm">{copied ? 'Copied!' : 'Share result'}</button>
            {mode === 'free' && (
              <button onClick={() => newGame('free')} className="flex-1 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-semibold text-sm">Play again</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
