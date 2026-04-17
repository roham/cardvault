'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

/* ─── Types ────────────────────────────────────────── */
type GameState = 'menu' | 'playing' | 'won' | 'lost';
type Difficulty = 'easy' | 'medium' | 'expert';
type SportFilter = 'all' | 'baseball' | 'basketball' | 'football' | 'hockey';
type Turn = 'ai' | 'user';

interface NimCard {
  slug: string;
  name: string;
  player: string;
  sport: string;
  year: number;
  value: number;
  valueStr: string;
  set: string;
}

interface Move {
  by: Turn;
  amount: number;
  cards: NimCard[];
  pileBefore: number;
  pileAfter: number;
}

interface Stats {
  games: number;
  wins: number;
  winsEasy: number;
  winsMedium: number;
  winsExpert: number;
  currentStreak: number;
  maxStreak: number;
  lifetimeValueCollected: number;
  shortestWin: number; // fewest user turns on a win
}

const INITIAL_STATS: Stats = {
  games: 0,
  wins: 0,
  winsEasy: 0,
  winsMedium: 0,
  winsExpert: 0,
  currentStreak: 0,
  maxStreak: 0,
  lifetimeValueCollected: 0,
  shortestWin: 0,
};

const PILE_SIZE = 21;
const STORAGE_KEY = 'cv_card_nim_stats_v1';

const SPORT_EMOJI: Record<string, string> = {
  baseball: '\u26BE',
  basketball: '\u{1F3C0}',
  football: '\u{1F3C8}',
  hockey: '\u{1F3D2}',
};

/* ─── Helpers ──────────────────────────────────────── */
function parseValue(s: string | undefined): number {
  if (!s) return 5;
  const cleaned = s.replace(/[$,]/g, '').trim();
  if (cleaned.includes('-')) {
    const parts = cleaned.split('-').map((p) => parseFloat(p));
    if (parts.every((p) => !isNaN(p))) return (parts[0] + parts[1]) / 2;
  }
  const n = parseFloat(cleaned);
  return isNaN(n) ? 5 : n;
}

function formatUSD(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`;
  return `$${n.toFixed(0)}`;
}

function seededRng(seed: number): () => number {
  let s = seed || 1;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function drawPile(sportFilter: SportFilter, seed: number): NimCard[] {
  const rng = seededRng(seed);
  const pool = (sportsCards as unknown as Array<Record<string, unknown>>).filter((c) => {
    if (sportFilter === 'all') return true;
    return c.sport === sportFilter;
  });
  const shuffled = shuffle(pool, rng);
  return shuffled.slice(0, PILE_SIZE).map((c) => {
    const valueRaw = (c.estimatedValueRaw as string) || (c.estimatedValueGem as string) || '$5';
    return {
      slug: (c.slug as string) || '',
      name: (c.name as string) || '',
      player: (c.player as string) || '',
      sport: (c.sport as string) || 'baseball',
      year: (c.year as number) || 2020,
      value: parseValue(valueRaw),
      valueStr: valueRaw,
      set: (c.set as string) || '',
    };
  });
}

/** Optimal misère Nim move: return take amount (1-3) from pile n. */
function optimalMove(n: number): number {
  if (n <= 1) return 1; // forced
  const t = (n - 1) % 4;
  if (t === 0) return 1; // losing position, delay
  return t;
}

function randomMove(n: number, rng: () => number): number {
  const max = Math.min(3, n);
  return Math.floor(rng() * max) + 1;
}

function computeAiMove(n: number, difficulty: Difficulty, rng: () => number): number {
  if (difficulty === 'expert') return optimalMove(n);
  if (difficulty === 'medium') {
    return rng() < 0.7 ? optimalMove(n) : randomMove(n, rng);
  }
  return randomMove(n, rng);
}

function loadStats(): Stats {
  if (typeof window === 'undefined') return INITIAL_STATS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATS;
    const parsed = JSON.parse(raw);
    return { ...INITIAL_STATS, ...parsed };
  } catch {
    return INITIAL_STATS;
  }
}

function saveStats(s: Stats) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* noop */
  }
}

/* ─── Component ────────────────────────────────────── */
export default function CardNimClient() {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [sportFilter, setSportFilter] = useState<SportFilter>('all');
  const [pile, setPile] = useState<NimCard[]>([]);
  const [userTaken, setUserTaken] = useState<NimCard[]>([]);
  const [aiTaken, setAiTaken] = useState<NimCard[]>([]);
  const [history, setHistory] = useState<Move[]>([]);
  const [turn, setTurn] = useState<Turn>('ai');
  const [busy, setBusy] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [stats, setStats] = useState<Stats>(INITIAL_STATS);
  const [shareText, setShareText] = useState<string | null>(null);
  const rngRef = useRef<() => number>(() => Math.random());
  const seedRef = useRef<number>(0);

  useEffect(() => {
    setStats(loadStats());
  }, []);

  const startGame = useCallback(() => {
    const seed = Math.floor(Math.random() * 1_000_000_000) + 1;
    seedRef.current = seed;
    rngRef.current = seededRng(seed + 7919);
    const drawn = drawPile(sportFilter, seed);
    setPile(drawn);
    setUserTaken([]);
    setAiTaken([]);
    setHistory([]);
    setShareText(null);
    setShowHint(false);
    setTurn('ai');
    setGameState('playing');
    setBusy(true);
    // AI moves first after a short beat
    setTimeout(() => aiMoveOnce(drawn), 700);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sportFilter, difficulty]);

  const endGame = useCallback(
    (result: 'won' | 'lost', userCards: NimCard[]) => {
      setGameState(result);
      setTurn('user');
      setBusy(false);
      const userTurns = history.filter((m) => m.by === 'user').length + (result === 'lost' ? 1 : 0);
      setStats((prev) => {
        const collected = userCards.reduce((s, c) => s + c.value, 0);
        const next: Stats = {
          ...prev,
          games: prev.games + 1,
          wins: prev.wins + (result === 'won' ? 1 : 0),
          winsEasy:
            prev.winsEasy + (result === 'won' && difficulty === 'easy' ? 1 : 0),
          winsMedium:
            prev.winsMedium + (result === 'won' && difficulty === 'medium' ? 1 : 0),
          winsExpert:
            prev.winsExpert + (result === 'won' && difficulty === 'expert' ? 1 : 0),
          currentStreak: result === 'won' ? prev.currentStreak + 1 : 0,
          maxStreak:
            result === 'won' && prev.currentStreak + 1 > prev.maxStreak
              ? prev.currentStreak + 1
              : prev.maxStreak,
          lifetimeValueCollected: prev.lifetimeValueCollected + collected,
          shortestWin:
            result === 'won' && (prev.shortestWin === 0 || userTurns < prev.shortestWin)
              ? userTurns
              : prev.shortestWin,
        };
        saveStats(next);
        return next;
      });
      const diffLabel =
        difficulty === 'expert' ? 'Expert' : difficulty === 'medium' ? 'Medium' : 'Easy';
      const verdict = result === 'won' ? 'WON' : 'LOST';
      const take = userCards.reduce((s, c) => s + c.value, 0);
      setShareText(
        `Card Nim vs ${diffLabel}: ${verdict} \u2022 ${userCards.length} cards / ${formatUSD(take)} take \u2022 ${userTurns} turns\nhttps://cardvault-two.vercel.app/card-nim`,
      );
    },
    [difficulty, history],
  );

  const aiMoveOnce = useCallback(
    (currentPile: NimCard[]) => {
      if (currentPile.length === 0) return;
      const amount = Math.min(
        computeAiMove(currentPile.length, difficulty, rngRef.current),
        currentPile.length,
      );
      const taken = currentPile.slice(0, amount);
      const remaining = currentPile.slice(amount);
      setAiTaken((prev) => [...prev, ...taken]);
      setPile(remaining);
      setHistory((prev) => [
        ...prev,
        {
          by: 'ai',
          amount,
          cards: taken,
          pileBefore: currentPile.length,
          pileAfter: remaining.length,
        },
      ]);
      if (remaining.length === 0) {
        // AI took last → user WINS
        endGame('won', userTaken);
        return;
      }
      setTurn('user');
      setBusy(false);
    },
    [difficulty, endGame, userTaken],
  );

  const userTake = useCallback(
    (amount: 1 | 2 | 3) => {
      if (gameState !== 'playing' || turn !== 'user' || busy) return;
      if (amount > pile.length) return;
      setBusy(true);
      const taken = pile.slice(0, amount);
      const remaining = pile.slice(amount);
      const newUserTaken = [...userTaken, ...taken];
      setUserTaken(newUserTaken);
      setPile(remaining);
      setHistory((prev) => [
        ...prev,
        {
          by: 'user',
          amount,
          cards: taken,
          pileBefore: pile.length,
          pileAfter: remaining.length,
        },
      ]);
      if (remaining.length === 0) {
        // User took last → user LOSES
        endGame('lost', newUserTaken);
        return;
      }
      setTurn('ai');
      setTimeout(() => aiMoveOnce(remaining), 900);
    },
    [gameState, turn, busy, pile, userTaken, aiMoveOnce, endGame],
  );

  const hintAmount = useMemo(() => {
    if (gameState !== 'playing' || turn !== 'user' || pile.length === 0) return null;
    return optimalMove(pile.length);
  }, [gameState, turn, pile.length]);

  const backToMenu = useCallback(() => {
    setGameState('menu');
    setShareText(null);
  }, []);

  const copyShare = useCallback(() => {
    if (!shareText) return;
    try {
      navigator.clipboard.writeText(shareText);
    } catch {
      /* noop */
    }
  }, [shareText]);

  const userValue = userTaken.reduce((s, c) => s + c.value, 0);
  const aiValue = aiTaken.reduce((s, c) => s + c.value, 0);
  const pileValueRemaining = pile.reduce((s, c) => s + c.value, 0);

  /* ─── MENU ──────────────────────────────────────── */
  if (gameState === 'menu') {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl border-2 border-amber-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4 text-amber-900">New Game Setup</h2>

          <div className="mb-5">
            <div className="text-sm font-semibold text-gray-700 mb-2">Difficulty</div>
            <div className="grid grid-cols-3 gap-2">
              {(['easy', 'medium', 'expert'] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`px-3 py-3 rounded-lg border-2 text-sm font-semibold transition ${
                    difficulty === d
                      ? 'border-amber-500 bg-amber-50 text-amber-900 ring-2 ring-amber-300'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-amber-300'
                  }`}
                >
                  <div className="capitalize">{d}</div>
                  <div className="text-xs font-normal text-gray-500 mt-0.5">
                    {d === 'easy'
                      ? 'Random AI'
                      : d === 'medium'
                        ? '70% optimal'
                        : 'Fully optimal'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-5">
            <div className="text-sm font-semibold text-gray-700 mb-2">Sport Pool</div>
            <div className="grid grid-cols-5 gap-2">
              {(['all', 'baseball', 'basketball', 'football', 'hockey'] as SportFilter[]).map(
                (s) => (
                  <button
                    key={s}
                    onClick={() => setSportFilter(s)}
                    className={`px-2 py-2 rounded-lg border-2 text-xs font-semibold transition ${
                      sportFilter === s
                        ? 'border-amber-500 bg-amber-50 text-amber-900'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-amber-300'
                    }`}
                  >
                    <div>{s === 'all' ? 'All' : SPORT_EMOJI[s] || ''}</div>
                    <div className="text-[10px] font-normal capitalize text-gray-500">
                      {s === 'all' ? '\u00A0' : s}
                    </div>
                  </button>
                ),
              )}
            </div>
          </div>

          <div className="mb-5 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
            <strong>How it works:</strong> 21 real cards in the pile. AI goes first. You each take 1, 2, or 3 per turn. Whoever takes the LAST card loses. On Expert, the AI plays perfectly but starts in a losing position — if you play optimally, you should always win.
          </div>

          <button
            onClick={startGame}
            className="w-full py-4 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg shadow-md hover:from-amber-600 hover:to-orange-600 transition"
          >
            Start Game
          </button>
        </div>

        {stats.games > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-base font-bold mb-3 text-gray-800">Lifetime Stats</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-lg bg-gray-50">
                <div className="text-2xl font-bold text-gray-900">{stats.games}</div>
                <div className="text-xs text-gray-500">Games</div>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50">
                <div className="text-2xl font-bold text-emerald-700">
                  {stats.games > 0 ? Math.round((stats.wins / stats.games) * 100) : 0}%
                </div>
                <div className="text-xs text-gray-500">Win rate</div>
              </div>
              <div className="p-3 rounded-lg bg-amber-50">
                <div className="text-2xl font-bold text-amber-700">{stats.maxStreak}</div>
                <div className="text-xs text-gray-500">Best streak</div>
              </div>
              <div className="p-3 rounded-lg bg-orange-50">
                <div className="text-2xl font-bold text-orange-700">
                  {formatUSD(stats.lifetimeValueCollected)}
                </div>
                <div className="text-xs text-gray-500">Lifetime take</div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded bg-green-50 text-green-700">
                Easy: <strong>{stats.winsEasy}</strong>
              </div>
              <div className="p-2 rounded bg-blue-50 text-blue-700">
                Medium: <strong>{stats.winsMedium}</strong>
              </div>
              <div className="p-2 rounded bg-rose-50 text-rose-700">
                Expert: <strong>{stats.winsExpert}</strong>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ─── PLAYING / RESULT ──────────────────────────── */
  return (
    <div className="space-y-5">
      {/* Top status bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 text-center">
          <div className="text-[10px] uppercase tracking-wide text-amber-800 font-semibold">
            Pile
          </div>
          <div className="text-3xl font-bold text-amber-900">{pile.length}</div>
          <div className="text-xs text-gray-600">{formatUSD(pileValueRemaining)} left</div>
        </div>
        <div
          className={`p-3 rounded-lg border-2 text-center ${
            turn === 'user' && gameState === 'playing'
              ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-300'
              : 'border-gray-200 bg-white'
          }`}
        >
          <div className="text-[10px] uppercase tracking-wide text-emerald-800 font-semibold">
            You
          </div>
          <div className="text-2xl font-bold text-emerald-900">{userTaken.length}</div>
          <div className="text-xs text-gray-600">{formatUSD(userValue)}</div>
        </div>
        <div
          className={`p-3 rounded-lg border-2 text-center ${
            turn === 'ai' && gameState === 'playing'
              ? 'border-rose-500 bg-rose-50 ring-2 ring-rose-300'
              : 'border-gray-200 bg-white'
          }`}
        >
          <div className="text-[10px] uppercase tracking-wide text-rose-800 font-semibold">
            AI ({difficulty})
          </div>
          <div className="text-2xl font-bold text-rose-900">{aiTaken.length}</div>
          <div className="text-xs text-gray-600">{formatUSD(aiValue)}</div>
        </div>
      </div>

      {/* Pile visualization */}
      <div className="p-5 rounded-xl bg-gradient-to-br from-stone-100 to-stone-200 border border-stone-300">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold text-stone-700">
            Top of Pile {pile.length > 0 && <span className="text-stone-500 font-normal">(next cards are taken from the top)</span>}
          </div>
          {gameState === 'playing' && (
            <button
              onClick={() => setShowHint((p) => !p)}
              className="text-xs px-2 py-1 rounded bg-white border border-stone-300 text-stone-700 hover:bg-stone-50"
            >
              {showHint ? 'Hide hint' : 'Show hint'}
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {pile.slice(0, 7).map((c, i) => (
            <div
              key={c.slug + i}
              className="w-20 rounded-md bg-white border border-stone-300 shadow-sm p-2 text-[10px]"
            >
              <div className="text-lg text-center">{SPORT_EMOJI[c.sport] || '\u{1F3AE}'}</div>
              <div className="font-semibold text-gray-800 line-clamp-2 leading-tight">
                {c.player}
              </div>
              <div className="text-gray-500">{c.year}</div>
              <div className="text-amber-700 font-semibold">{formatUSD(c.value)}</div>
            </div>
          ))}
          {pile.length > 7 && (
            <div className="w-20 rounded-md bg-stone-200 border-2 border-dashed border-stone-400 flex items-center justify-center text-xs text-stone-600 font-semibold">
              +{pile.length - 7} more
            </div>
          )}
          {pile.length === 0 && (
            <div className="w-full text-center text-stone-500 italic py-6">
              Pile is empty
            </div>
          )}
        </div>
        {showHint && hintAmount !== null && (
          <div className="mt-3 p-2 rounded bg-amber-50 border border-amber-200 text-xs text-amber-900">
            <strong>Hint:</strong> optimal take is <strong>{hintAmount}</strong>. Leaving
            the AI with {pile.length - hintAmount} card{pile.length - hintAmount === 1 ? '' : 's'} (mod 4 ={' '}
            {(pile.length - hintAmount - 1) % 4 === 0 ? '1 \u2022 losing for AI' : 'non-optimal'}).
          </div>
        )}
      </div>

      {/* Action buttons */}
      {gameState === 'playing' && (
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              onClick={() => userTake(n as 1 | 2 | 3)}
              disabled={turn !== 'user' || busy || pile.length < n}
              className="px-4 py-4 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg shadow-sm hover:from-amber-600 hover:to-orange-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition"
            >
              Take {n}
            </button>
          ))}
        </div>
      )}
      {gameState === 'playing' && turn === 'ai' && (
        <div className="text-center text-sm text-gray-500 italic animate-pulse">
          AI is thinking...
        </div>
      )}

      {/* Result banner */}
      {gameState !== 'playing' && (
        <div
          className={`p-5 rounded-xl border-2 ${
            gameState === 'won'
              ? 'bg-gradient-to-br from-emerald-50 to-green-100 border-emerald-400'
              : 'bg-gradient-to-br from-rose-50 to-red-100 border-rose-400'
          }`}
        >
          <div
            className={`text-3xl font-bold mb-1 ${
              gameState === 'won' ? 'text-emerald-800' : 'text-rose-800'
            }`}
          >
            {gameState === 'won' ? '\u{1F3C6} You won!' : '\u{1F494} AI wins'}
          </div>
          <div className="text-sm text-gray-700 mb-3">
            {gameState === 'won'
              ? 'The AI was forced to take the last card.'
              : 'You were forced to take the last card.'}{' '}
            Your take: <strong>{formatUSD(userValue)}</strong> across{' '}
            <strong>{userTaken.length}</strong> cards.
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={startGame}
              className="px-4 py-2 rounded bg-amber-600 text-white font-semibold hover:bg-amber-700 text-sm"
            >
              Play again
            </button>
            <button
              onClick={backToMenu}
              className="px-4 py-2 rounded bg-white border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 text-sm"
            >
              Change settings
            </button>
            {shareText && (
              <button
                onClick={copyShare}
                className="px-4 py-2 rounded bg-stone-700 text-white font-semibold hover:bg-stone-800 text-sm"
              >
                Copy result
              </button>
            )}
          </div>
          {shareText && (
            <pre className="mt-3 p-2 rounded bg-white/70 border border-gray-200 text-xs whitespace-pre-wrap text-gray-700 font-mono">
              {shareText}
            </pre>
          )}
        </div>
      )}

      {/* Move log + collected cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-white border border-gray-200">
          <h3 className="text-sm font-bold text-gray-800 mb-2">Move Log</h3>
          {history.length === 0 ? (
            <p className="text-xs text-gray-500 italic">No moves yet.</p>
          ) : (
            <ol className="space-y-1.5 text-xs max-h-64 overflow-y-auto">
              {history.map((m, i) => (
                <li
                  key={i}
                  className={`flex items-start gap-2 p-1.5 rounded ${
                    m.by === 'user' ? 'bg-emerald-50' : 'bg-rose-50'
                  }`}
                >
                  <span
                    className={`font-bold ${
                      m.by === 'user' ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {m.by === 'user' ? 'YOU' : 'AI'}
                  </span>
                  <span>
                    took {m.amount} • pile {m.pileBefore} → {m.pileAfter}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
        <div className="p-4 rounded-lg bg-white border border-gray-200">
          <h3 className="text-sm font-bold text-gray-800 mb-2">Your Stack ({userTaken.length})</h3>
          {userTaken.length === 0 ? (
            <p className="text-xs text-gray-500 italic">Cards you take appear here.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5 max-h-64 overflow-y-auto">
              {userTaken.map((c, i) => (
                <div
                  key={c.slug + i}
                  className="px-2 py-1 rounded bg-emerald-50 border border-emerald-200 text-[10px]"
                  title={c.name}
                >
                  <span>{SPORT_EMOJI[c.sport] || '\u{1F3AE}'}</span>{' '}
                  <span className="font-semibold">{c.player.split(' ').slice(-1)[0]}</span>{' '}
                  <span className="text-emerald-700">{formatUSD(c.value)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI stack */}
      <div className="p-4 rounded-lg bg-white border border-gray-200">
        <h3 className="text-sm font-bold text-gray-800 mb-2">AI Stack ({aiTaken.length})</h3>
        {aiTaken.length === 0 ? (
          <p className="text-xs text-gray-500 italic">AI hasn't taken any cards yet.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
            {aiTaken.map((c, i) => (
              <div
                key={c.slug + i}
                className="px-2 py-1 rounded bg-rose-50 border border-rose-200 text-[10px]"
                title={c.name}
              >
                <span>{SPORT_EMOJI[c.sport] || '\u{1F3AE}'}</span>{' '}
                <span className="font-semibold">{c.player.split(' ').slice(-1)[0]}</span>{' '}
                <span className="text-rose-700">{formatUSD(c.value)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-center">
        <Link href="/games" className="text-xs text-gray-500 hover:text-amber-600">
          ← Back to all games
        </Link>
      </div>
    </div>
  );
}
