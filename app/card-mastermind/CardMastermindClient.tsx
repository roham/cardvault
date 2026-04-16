'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

/* ─── Types ─────────────────────────────────────────── */
type GameState = 'menu' | 'playing' | 'won' | 'lost';
type Mode = 'daily' | 'random';
type SportFilter = 'all' | 'baseball' | 'basketball' | 'football' | 'hockey';

type Decade = '1900s' | '1910s' | '1920s' | '1930s' | '1940s' | '1950s' | '1960s' | '1970s' | '1980s' | '1990s' | '2000s' | '2010s' | '2020s';
type Sport = 'baseball' | 'basketball' | 'football' | 'hockey';
type Rookie = 'rookie' | 'veteran';
type ValueTier = 'under-25' | '25-99' | '100-999' | '1k-9.9k' | '10k-plus';

const DECADES: Decade[] = ['1900s', '1910s', '1920s', '1930s', '1940s', '1950s', '1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'];
const SPORTS: Sport[] = ['baseball', 'basketball', 'football', 'hockey'];
const ROOKIES: Rookie[] = ['rookie', 'veteran'];
const VALUE_TIERS: ValueTier[] = ['under-25', '25-99', '100-999', '1k-9.9k', '10k-plus'];

const VALUE_TIER_LABEL: Record<ValueTier, string> = {
  'under-25': 'Under $25',
  '25-99': '$25-$99',
  '100-999': '$100-$999',
  '1k-9.9k': '$1K-$9.9K',
  '10k-plus': '$10K+',
};

const SPORT_EMOJI: Record<Sport, string> = {
  baseball: '\u26be',
  basketball: '\ud83c\udfc0',
  football: '\ud83c\udfc8',
  hockey: '\ud83c\udfd2',
};

interface MCard {
  slug: string;
  name: string;
  player: string;
  sport: Sport;
  year: number;
  value: number;
  rookie: boolean;
  set: string;
  cardNumber: string;
  valueString: string;
}

type Feedback = 'exact' | 'close' | 'wrong';

interface GuessRow {
  decade: Decade;
  sport: Sport;
  rookie: Rookie;
  valueTier: ValueTier;
  feedback: {
    decade: Feedback;
    sport: Feedback;
    rookie: Feedback;
    valueTier: Feedback;
  };
}

interface Stats {
  games: number;
  wins: number;
  bestGuesses: number; // lowest guesses used on a win
  currentStreak: number;
  maxStreak: number;
  bestGrade: string;
}

/* ─── Helpers ───────────────────────────────────────── */
function seededRng(seed: number): () => number {
  let s = seed || 1;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function dateHash(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function parseValue(v: string): number {
  const m = v.match(/\$([0-9,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 5;
}

function yearToDecade(year: number): Decade {
  const d = Math.floor(year / 10) * 10;
  if (d < 1900) return '1900s';
  if (d > 2020) return '2020s';
  return (`${d}s` as Decade);
}

function valueToTier(v: number): ValueTier {
  if (v < 25) return 'under-25';
  if (v < 100) return '25-99';
  if (v < 1000) return '100-999';
  if (v < 10000) return '1k-9.9k';
  return '10k-plus';
}

function decadeDistance(a: Decade, b: Decade): number {
  return Math.abs(DECADES.indexOf(a) - DECADES.indexOf(b));
}

function tierDistance(a: ValueTier, b: ValueTier): number {
  return Math.abs(VALUE_TIERS.indexOf(a) - VALUE_TIERS.indexOf(b));
}

function scoreToGrade(guesses: number, won: boolean): string {
  if (!won) return 'F';
  if (guesses <= 2) return 'S';
  if (guesses <= 3) return 'A';
  if (guesses <= 5) return 'B';
  if (guesses <= 7) return 'C';
  return 'D';
}

function gradeToClass(g: string): string {
  switch (g) {
    case 'S': return 'text-amber-300';
    case 'A': return 'text-emerald-400';
    case 'B': return 'text-sky-400';
    case 'C': return 'text-yellow-400';
    case 'D': return 'text-orange-400';
    case 'F': return 'text-rose-400';
    default: return 'text-gray-400';
  }
}

function feedbackEmoji(f: Feedback): string {
  if (f === 'exact') return '\ud83d\udfe2'; // 🟢
  if (f === 'close') return '\ud83d\udfe1'; // 🟡
  return '\u26aa'; // ⚪
}

function feedbackClass(f: Feedback): string {
  if (f === 'exact') return 'bg-emerald-950/60 border-emerald-700 text-emerald-300';
  if (f === 'close') return 'bg-yellow-950/60 border-yellow-700 text-yellow-300';
  return 'bg-gray-800/60 border-gray-700 text-gray-400';
}

const INIT_STATS: Stats = { games: 0, wins: 0, bestGuesses: 0, currentStreak: 0, maxStreak: 0, bestGrade: '-' };
const STATS_KEY = 'cv_card_mastermind_stats';
const MAX_GUESSES = 10;

/* ─── Card Pool ─────────────────────────────────────── */
function buildPool(sportFilter: SportFilter): MCard[] {
  const pool: MCard[] = [];
  for (const c of sportsCards) {
    if (sportFilter !== 'all' && c.sport !== sportFilter) continue;
    const v = parseValue(c.estimatedValueRaw);
    pool.push({
      slug: c.slug,
      name: c.name,
      player: c.player,
      sport: c.sport as Sport,
      year: c.year,
      value: v,
      rookie: !!c.rookie,
      set: c.set,
      cardNumber: c.cardNumber,
      valueString: c.estimatedValueRaw,
    });
  }
  return pool;
}

function pickMystery(pool: MCard[], rng: () => number): MCard {
  return pool[Math.floor(rng() * pool.length)];
}

/* ─── Feedback Engine ───────────────────────────────── */
function computeFeedback(guess: Omit<GuessRow, 'feedback'>, mystery: MCard): GuessRow['feedback'] {
  const mysteryDecade = yearToDecade(mystery.year);
  const mysteryTier = valueToTier(mystery.value);
  const mysteryRookie: Rookie = mystery.rookie ? 'rookie' : 'veteran';

  const decadeDist = decadeDistance(guess.decade, mysteryDecade);
  const tierDist = tierDistance(guess.valueTier, mysteryTier);

  return {
    decade: decadeDist === 0 ? 'exact' : decadeDist === 1 ? 'close' : 'wrong',
    sport: guess.sport === mystery.sport ? 'exact' : 'wrong',
    rookie: guess.rookie === mysteryRookie ? 'exact' : 'wrong',
    valueTier: tierDist === 0 ? 'exact' : tierDist === 1 ? 'close' : 'wrong',
  };
}

function isWin(fb: GuessRow['feedback']): boolean {
  return fb.decade === 'exact' && fb.sport === 'exact' && fb.rookie === 'exact' && fb.valueTier === 'exact';
}

/* ─── UI ────────────────────────────────────────────── */
export default function CardMastermindClient() {
  const [state, setState] = useState<GameState>('menu');
  const [mode, setMode] = useState<Mode>('daily');
  const [sportFilter, setSportFilter] = useState<SportFilter>('all');

  const [mystery, setMystery] = useState<MCard | null>(null);
  const [guesses, setGuesses] = useState<GuessRow[]>([]);

  // Current working guess
  const [decade, setDecade] = useState<Decade>('2020s');
  const [sport, setSport] = useState<Sport>('baseball');
  const [rookie, setRookie] = useState<Rookie>('rookie');
  const [valueTier, setValueTier] = useState<ValueTier>('100-999');

  const [stats, setStats] = useState<Stats>(INIT_STATS);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(STATS_KEY);
      if (raw) setStats({ ...INIT_STATS, ...JSON.parse(raw) });
    } catch {}
  }, []);

  const pool = useMemo(() => buildPool(sportFilter), [sportFilter]);

  const startGame = useCallback(() => {
    if (pool.length === 0) return;
    const seed = mode === 'daily' ? dateHash() + sportFilter.charCodeAt(0) : Math.floor(Math.random() * 1_000_000);
    const rng = seededRng(seed);
    const m = pickMystery(pool, rng);
    setMystery(m);
    setGuesses([]);
    setState('playing');
    setDecade(yearToDecade(m.year)); // default not useful; player sets
    // Don't leak info via defaults — reset to neutral defaults:
    setDecade('2020s');
    setSport(sportFilter !== 'all' ? (sportFilter as Sport) : 'baseball');
    setRookie('rookie');
    setValueTier('100-999');
    setCopied(false);
  }, [pool, mode, sportFilter]);

  const submitGuess = useCallback(() => {
    if (state !== 'playing' || !mystery) return;
    const guess: Omit<GuessRow, 'feedback'> = { decade, sport, rookie, valueTier };
    const fb = computeFeedback(guess, mystery);
    const row: GuessRow = { ...guess, feedback: fb };
    const newGuesses = [...guesses, row];
    setGuesses(newGuesses);
    const won = isWin(fb);

    if (won || newGuesses.length >= MAX_GUESSES) {
      const finalState: GameState = won ? 'won' : 'lost';
      setState(finalState);
      // Update stats
      setStats(prev => {
        const next: Stats = {
          games: prev.games + 1,
          wins: prev.wins + (won ? 1 : 0),
          bestGuesses: won ? (prev.bestGuesses === 0 ? newGuesses.length : Math.min(prev.bestGuesses, newGuesses.length)) : prev.bestGuesses,
          currentStreak: won ? prev.currentStreak + 1 : 0,
          maxStreak: won ? Math.max(prev.maxStreak, prev.currentStreak + 1) : prev.maxStreak,
          bestGrade: prev.bestGrade,
        };
        const grade = scoreToGrade(newGuesses.length, won);
        const gradeOrder = ['F', 'D', 'C', 'B', 'A', 'S'];
        if (gradeOrder.indexOf(grade) > gradeOrder.indexOf(prev.bestGrade === '-' ? 'F' : prev.bestGrade)) {
          next.bestGrade = grade;
        }
        try { window.localStorage.setItem(STATS_KEY, JSON.stringify(next)); } catch {}
        return next;
      });
    }
  }, [state, mystery, decade, sport, rookie, valueTier, guesses]);

  const resetToMenu = useCallback(() => {
    setState('menu');
    setMystery(null);
    setGuesses([]);
  }, []);

  const shareText = useMemo(() => {
    if (!mystery || (state !== 'won' && state !== 'lost')) return '';
    const grade = scoreToGrade(guesses.length, state === 'won');
    const lines: string[] = [];
    lines.push(`CardVault Mastermind ${mode === 'daily' ? `— Daily ${new Date().toISOString().slice(0, 10)}` : '(Random)'}`);
    lines.push(`${state === 'won' ? `Cracked in ${guesses.length}/${MAX_GUESSES}` : `Failed — mystery was ${mystery.player} (${mystery.year})`} · Grade ${grade}`);
    lines.push('');
    for (const g of guesses) {
      lines.push(
        `${feedbackEmoji(g.feedback.decade)}${feedbackEmoji(g.feedback.sport)}${feedbackEmoji(g.feedback.rookie)}${feedbackEmoji(g.feedback.valueTier)}`
      );
    }
    lines.push('');
    lines.push('cardvault-two.vercel.app/card-mastermind');
    return lines.join('\n');
  }, [mystery, state, guesses, mode]);

  function copyShare() {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  }

  const guessesUsed = guesses.length;
  const guessesLeft = MAX_GUESSES - guessesUsed;
  const finalGrade = state === 'won' || state === 'lost' ? scoreToGrade(guessesUsed, state === 'won') : null;
  const winRate = stats.games > 0 ? Math.round((stats.wins / stats.games) * 100) : 0;

  /* ─── Render Menu ─────────────────────────────────── */
  if (state === 'menu') {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-violet-950/40 to-indigo-950/20 border border-violet-800/40 rounded-2xl p-6">
          <h2 className="text-2xl font-black text-white mb-2">How to play</h2>
          <p className="text-gray-300 text-sm mb-4">
            The board has a mystery card hidden from you. You have <strong className="text-violet-300">{MAX_GUESSES} guesses</strong> to identify it by picking
            four attributes per row.
          </p>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><span className="inline-block w-4">{'\ud83d\udfe2'}</span> <strong className="text-emerald-300">Green</strong> — exact match on that attribute</li>
            <li><span className="inline-block w-4">{'\ud83d\udfe1'}</span> <strong className="text-yellow-300">Yellow</strong> — close (decade or value tier is one step off)</li>
            <li><span className="inline-block w-4">{'\u26aa'}</span> <strong className="text-gray-400">White</strong> — wrong</li>
          </ul>
        </div>

        {/* Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Mode</label>
            <div className="grid grid-cols-2 gap-2">
              {(['daily', 'random'] as Mode[]).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-4 py-3 rounded-lg text-sm font-semibold transition-colors border ${
                    mode === m ? 'bg-violet-900/60 border-violet-600 text-white' : 'bg-gray-900 border-gray-800 text-gray-400 hover:bg-gray-800'
                  }`}
                >
                  {m === 'daily' ? '\ud83d\udcc6 Daily' : '\ud83c\udfb2 Random'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Sport</label>
            <div className="grid grid-cols-5 gap-1.5">
              {(['all', 'baseball', 'basketball', 'football', 'hockey'] as SportFilter[]).map(s => (
                <button
                  key={s}
                  onClick={() => setSportFilter(s)}
                  className={`px-2 py-3 rounded-lg text-xs font-semibold transition-colors border ${
                    sportFilter === s ? 'bg-violet-900/60 border-violet-600 text-white' : 'bg-gray-900 border-gray-800 text-gray-400 hover:bg-gray-800'
                  }`}
                >
                  {s === 'all' ? 'ALL' : SPORT_EMOJI[s as Sport]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={startGame}
          disabled={pool.length === 0}
          className="w-full py-4 bg-violet-600 hover:bg-violet-500 disabled:bg-gray-800 disabled:text-gray-500 text-white font-bold rounded-xl text-lg transition-colors"
        >
          {pool.length === 0 ? 'No cards match filter' : `Begin Mastermind (${pool.length.toLocaleString()} cards in pool)`}
        </button>

        {/* Stats */}
        {stats.games > 0 && (
          <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">Your stats</h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <StatBox label="Games" value={stats.games.toString()} />
              <StatBox label="Win rate" value={`${winRate}%`} />
              <StatBox label="Best grade" value={stats.bestGrade} tone={gradeToClass(stats.bestGrade)} />
              <StatBox label="Best guesses" value={stats.bestGuesses > 0 ? stats.bestGuesses.toString() : '-'} />
              <StatBox label="Streak" value={stats.currentStreak.toString()} />
              <StatBox label="Max streak" value={stats.maxStreak.toString()} />
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ─── Render Playing / Result ─────────────────────── */
  return (
    <div className="space-y-6">
      {/* Status bar */}
      <div className="flex items-center justify-between gap-4 bg-gray-900/40 border border-gray-800 rounded-xl px-4 py-3 text-sm">
        <div className="flex items-center gap-4">
          <span className="text-gray-400">Mode: <strong className="text-white">{mode === 'daily' ? 'Daily' : 'Random'}</strong></span>
          <span className="text-gray-400">Sport: <strong className="text-white">{sportFilter === 'all' ? 'All' : sportFilter}</strong></span>
        </div>
        <div className="text-gray-400">
          Guesses: <strong className={guessesLeft <= 2 ? 'text-rose-400' : 'text-white'}>{guessesUsed}/{MAX_GUESSES}</strong>
        </div>
      </div>

      {/* Past guesses */}
      {guesses.length > 0 && (
        <div className="space-y-2">
          {guesses.map((g, i) => (
            <div key={i} className="grid grid-cols-4 gap-2 text-xs">
              <FeedbackChip feedback={g.feedback.decade} label={g.decade} sub="Decade" />
              <FeedbackChip feedback={g.feedback.sport} label={`${SPORT_EMOJI[g.sport]} ${g.sport}`} sub="Sport" />
              <FeedbackChip feedback={g.feedback.rookie} label={g.rookie === 'rookie' ? 'Rookie' : 'Veteran'} sub="Status" />
              <FeedbackChip feedback={g.feedback.valueTier} label={VALUE_TIER_LABEL[g.valueTier]} sub="Value" />
            </div>
          ))}
        </div>
      )}

      {/* Active input */}
      {state === 'playing' && (
        <div className="bg-gradient-to-br from-violet-950/40 to-indigo-950/20 border border-violet-800/40 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-violet-300 uppercase tracking-wide">Guess #{guessesUsed + 1}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Decade">
              <select value={decade} onChange={e => setDecade(e.target.value as Decade)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm">
                {DECADES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Sport">
              <select value={sport} onChange={e => setSport(e.target.value as Sport)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" disabled={sportFilter !== 'all'}>
                {SPORTS.map(s => <option key={s} value={s}>{SPORT_EMOJI[s]} {s}</option>)}
              </select>
            </Field>
            <Field label="Rookie or veteran?">
              <select value={rookie} onChange={e => setRookie(e.target.value as Rookie)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm">
                {ROOKIES.map(r => <option key={r} value={r}>{r === 'rookie' ? 'Rookie card' : 'Veteran (non-rookie)'}</option>)}
              </select>
            </Field>
            <Field label="Value tier (raw)">
              <select value={valueTier} onChange={e => setValueTier(e.target.value as ValueTier)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm">
                {VALUE_TIERS.map(v => <option key={v} value={v}>{VALUE_TIER_LABEL[v]}</option>)}
              </select>
            </Field>
          </div>
          <button
            onClick={submitGuess}
            className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl transition-colors"
          >
            Lock guess
          </button>
        </div>
      )}

      {/* Result */}
      {(state === 'won' || state === 'lost') && mystery && (
        <div className={`border rounded-2xl p-5 space-y-4 ${state === 'won' ? 'bg-emerald-950/40 border-emerald-800/40' : 'bg-rose-950/40 border-rose-800/40'}`}>
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className={`text-xs font-semibold uppercase tracking-wider ${state === 'won' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {state === 'won' ? 'Cracked it' : 'Out of guesses'}
              </div>
              <div className="text-2xl font-black text-white mt-1">
                Grade: <span className={finalGrade ? gradeToClass(finalGrade) : ''}>{finalGrade}</span>
              </div>
              <div className="text-sm text-gray-300 mt-1">
                {state === 'won' ? `Solved in ${guessesUsed} guesses` : 'Better luck tomorrow'}
              </div>
            </div>
            <button
              onClick={copyShare}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              {copied ? 'Copied!' : 'Copy result'}
            </button>
          </div>

          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Mystery card revealed</div>
            <div className="text-white font-bold text-lg">{mystery.name}</div>
            <div className="text-sm text-gray-400 mt-1">
              <span>{SPORT_EMOJI[mystery.sport]} {mystery.sport}</span>
              <span className="mx-2">·</span>
              <span>{mystery.year} ({yearToDecade(mystery.year)})</span>
              <span className="mx-2">·</span>
              <span>{mystery.rookie ? 'Rookie' : 'Veteran'}</span>
              <span className="mx-2">·</span>
              <span>{VALUE_TIER_LABEL[valueToTier(mystery.value)]}</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">{mystery.set} · #{mystery.cardNumber} · Raw value {mystery.valueString}</div>
            <Link href={`/cards/${mystery.slug}`} className="inline-block mt-3 text-sm text-violet-400 hover:text-violet-300">
              View full card page &rarr;
            </Link>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={startGame}
              className="flex-1 min-w-[140px] py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl transition-colors"
            >
              Play again
            </button>
            <button
              onClick={resetToMenu}
              className="flex-1 min-w-[140px] py-3 bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold rounded-xl transition-colors"
            >
              Change mode
            </button>
          </div>
        </div>
      )}

      {state === 'playing' && (
        <button
          onClick={resetToMenu}
          className="text-sm text-gray-500 hover:text-gray-300 underline"
        >
          Quit game
        </button>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function StatBox({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="bg-gray-950/60 border border-gray-800 rounded-lg p-3">
      <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{label}</div>
      <div className={`text-xl font-black mt-0.5 ${tone ?? 'text-white'}`}>{value}</div>
    </div>
  );
}

function FeedbackChip({ feedback, label, sub }: { feedback: Feedback; label: string; sub: string }) {
  return (
    <div className={`border rounded-lg px-2 py-2 ${feedbackClass(feedback)}`}>
      <div className="text-[9px] font-semibold uppercase tracking-wider opacity-70">{sub}</div>
      <div className="font-semibold text-xs mt-0.5 truncate">{label}</div>
    </div>
  );
}
