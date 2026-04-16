'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

/* ─── Types ─────────────────────────────────────────── */
type GameState = 'menu' | 'playing' | 'revealed' | 'complete';
type Mode = 'daily' | 'random';
type SportFilter = 'all' | 'baseball' | 'basketball' | 'football' | 'hockey';

interface PCard {
  slug: string;
  name: string;
  player: string;
  sport: string;
  year: number;
  value: number;
  rookie: boolean;
}

type HandType =
  | 'Royal Flush'
  | 'Straight Flush'
  | 'Four of a Kind'
  | 'Full House'
  | 'Flush'
  | 'Straight'
  | 'Three of a Kind'
  | 'Two Pair'
  | 'One Pair'
  | 'High Card';

interface HandResult {
  type: HandType;
  points: number;
  description: string;
  playerBonus: number;
  emoji: string;
}

interface PokerStats {
  games: number;
  bestScore: number;
  bestGrade: string;
  royalFlushes: number;
  straightFlushes: number;
  fourKinds: number;
}

interface HandRecord {
  type: HandType;
  points: number;
  emoji: string;
  cards: PCard[];
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

function formatMoney(n: number): string {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${Math.round(n).toLocaleString()}`;
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const SPORT_EMOJI: Record<string, string> = {
  baseball: '\u26be',
  basketball: '\ud83c\udfc0',
  football: '\ud83c\udfc8',
  hockey: '\ud83c\udfd2',
};

const SPORT_BORDER: Record<string, string> = {
  baseball: 'border-red-500/50',
  basketball: 'border-orange-500/50',
  football: 'border-blue-500/50',
  hockey: 'border-cyan-500/50',
};

const HAND_EMOJI: Record<HandType, string> = {
  'Royal Flush': '\ud83c\udfb0',
  'Straight Flush': '\ud83d\udc8e',
  'Four of a Kind': '\ud83d\udc51',
  'Full House': '\ud83c\udfe0',
  'Flush': '\ud83d\udfe2',
  'Straight': '\u27a1\ufe0f',
  'Three of a Kind': '\ud83d\udfe6',
  'Two Pair': '\ud83d\udfe8',
  'One Pair': '\ud83d\udfeb',
  'High Card': '\u2b1c',
};

const HAND_POINTS: Record<HandType, number> = {
  'Royal Flush': 10000,
  'Straight Flush': 5000,
  'Four of a Kind': 2500,
  'Full House': 1500,
  'Flush': 1000,
  'Straight': 750,
  'Three of a Kind': 400,
  'Two Pair': 200,
  'One Pair': 100,
  'High Card': 0,
};

const HANDS_PER_GAME = 5;
const STATS_KEY = 'cv-card-poker-stats';

/* ─── Hand evaluation ───────────────────────────────── */
function evaluateHand(cards: PCard[]): HandResult {
  if (cards.length !== 5) {
    return { type: 'High Card', points: 0, description: 'Need 5 cards', playerBonus: 0, emoji: HAND_EMOJI['High Card'] };
  }

  const yearCounts: Record<number, number> = {};
  for (const c of cards) yearCounts[c.year] = (yearCounts[c.year] || 0) + 1;
  const yearGroupSizes = Object.values(yearCounts).sort((a, b) => b - a);
  const maxYearCount = yearGroupSizes[0] || 1;
  const pairCount = yearGroupSizes.filter((n) => n === 2).length;

  const sportCounts: Record<string, number> = {};
  for (const c of cards) sportCounts[c.sport] = (sportCounts[c.sport] || 0) + 1;
  const allSameSport = Math.max(...Object.values(sportCounts)) === 5;

  const decades = Array.from(new Set(cards.map((c) => Math.floor(c.year / 10) * 10))).sort((a, b) => a - b);
  const isStraight = decades.length === 5 && decades[4] - decades[0] === 40;

  const allRookies = cards.every((c) => c.rookie);

  const playerCounts: Record<string, number> = {};
  for (const c of cards) playerCounts[c.player] = (playerCounts[c.player] || 0) + 1;
  const samePlayerPairs = Object.values(playerCounts).filter((n) => n >= 2).length;
  const playerBonus = samePlayerPairs * 200;

  let type: HandType;
  let description: string;

  if (allRookies && allSameSport) {
    type = 'Royal Flush';
    description = `5 rookie cards, all ${cards[0].sport} — hobby royalty.`;
  } else if (allSameSport && isStraight) {
    type = 'Straight Flush';
    description = `5 consecutive decades, all ${cards[0].sport}.`;
  } else if (maxYearCount === 4) {
    type = 'Four of a Kind';
    const year = Object.keys(yearCounts).find((y) => yearCounts[+y] === 4);
    description = `4 cards from ${year}.`;
  } else if (maxYearCount === 3 && pairCount === 1) {
    type = 'Full House';
    description = '3 cards from one year + 2 from another.';
  } else if (allSameSport) {
    type = 'Flush';
    description = `5 ${cards[0].sport} cards.`;
  } else if (isStraight) {
    type = 'Straight';
    description = `Decades ${decades[0]}s through ${decades[4]}s.`;
  } else if (maxYearCount === 3) {
    type = 'Three of a Kind';
    const year = Object.keys(yearCounts).find((y) => yearCounts[+y] === 3);
    description = `3 cards from ${year}.`;
  } else if (pairCount === 2) {
    type = 'Two Pair';
    description = '2 pairs of same-year cards.';
  } else if (pairCount === 1) {
    type = 'One Pair';
    const year = Object.keys(yearCounts).find((y) => yearCounts[+y] === 2);
    description = `2 cards from ${year}.`;
  } else {
    type = 'High Card';
    const max = Math.max(...cards.map((c) => c.value));
    description = `Highest-value card: ${formatMoney(max)}.`;
  }

  let points = HAND_POINTS[type];
  if (type === 'High Card') {
    const max = Math.max(...cards.map((c) => c.value));
    points = Math.max(20, Math.floor(max / 100));
  }

  return {
    type,
    points: points + playerBonus,
    description,
    playerBonus,
    emoji: HAND_EMOJI[type],
  };
}

/* ─── Deal (biased for interesting hands) ───────────── */
function dealSeven(allCards: PCard[], sportFilter: SportFilter, rng: () => number): PCard[] {
  let pool = allCards;
  if (sportFilter !== 'all') {
    pool = allCards.filter((c) => c.sport === sportFilter);
    return shuffle(pool, rng).slice(0, 7);
  }

  const sports = ['baseball', 'basketball', 'football', 'hockey'] as const;
  const primarySport = sports[Math.floor(rng() * sports.length)];
  const primaryPool = allCards.filter((c) => c.sport === primarySport);
  const otherPool = allCards.filter((c) => c.sport !== primarySport);

  const primaryCount = 4 + Math.floor(rng() * 2);
  const dealt: PCard[] = [];
  const used = new Set<string>();

  let attempts = 0;
  while (dealt.length < primaryCount && attempts < 100) {
    const c = primaryPool[Math.floor(rng() * primaryPool.length)];
    if (!used.has(c.slug)) {
      dealt.push(c);
      used.add(c.slug);
    }
    attempts++;
  }
  attempts = 0;
  while (dealt.length < 7 && attempts < 100) {
    const c = otherPool[Math.floor(rng() * otherPool.length)];
    if (!used.has(c.slug)) {
      dealt.push(c);
      used.add(c.slug);
    }
    attempts++;
  }

  return shuffle(dealt, rng);
}

function getGrade(score: number): { grade: string; color: string } {
  if (score >= 12000) return { grade: 'S', color: 'text-amber-300' };
  if (score >= 7000) return { grade: 'A', color: 'text-emerald-300' };
  if (score >= 3500) return { grade: 'B', color: 'text-sky-300' };
  if (score >= 1500) return { grade: 'C', color: 'text-violet-300' };
  if (score >= 500) return { grade: 'D', color: 'text-gray-300' };
  return { grade: 'F', color: 'text-rose-300' };
}

/* ─── Component ─────────────────────────────────────── */
export default function CardPokerClient() {
  const allCards = useMemo<PCard[]>(
    () =>
      sportsCards
        .map((c: any) => ({
          slug: c.slug,
          name: c.name,
          player: c.player,
          sport: c.sport,
          year: c.year,
          value: parseValue(c.estimatedValueRaw),
          rookie: !!c.rookie,
        }))
        .filter((c) => c.value > 0),
    [],
  );

  const [mode, setMode] = useState<Mode>('daily');
  const [sportFilter, setSportFilter] = useState<SportFilter>('all');
  const [state, setState] = useState<GameState>('menu');
  const [handIndex, setHandIndex] = useState(0);
  const [dealt, setDealt] = useState<PCard[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [handResult, setHandResult] = useState<HandResult | null>(null);
  const [history, setHistory] = useState<HandRecord[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [stats, setStats] = useState<PokerStats>({
    games: 0,
    bestScore: 0,
    bestGrade: 'F',
    royalFlushes: 0,
    straightFlushes: 0,
    fourKinds: 0,
  });
  const [shareText, setShareText] = useState('');
  const rngRef = useRef<() => number>(() => 0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STATS_KEY);
      if (raw) setStats(JSON.parse(raw));
    } catch {}
  }, []);

  const persistStats = useCallback((next: PokerStats) => {
    setStats(next);
    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(next));
    } catch {}
  }, []);

  const startGame = useCallback(() => {
    const seed = mode === 'daily' ? dateHash() + sportFilter.charCodeAt(0) * 7 : Math.floor(Math.random() * 2147483647);
    rngRef.current = seededRng(seed);
    setState('playing');
    setHandIndex(0);
    setDealt(dealSeven(allCards, sportFilter, rngRef.current));
    setSelected(new Set());
    setHandResult(null);
    setHistory([]);
    setTotalScore(0);
    setShareText('');
  }, [mode, sportFilter, allCards]);

  const toggleSelect = useCallback((slug: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else if (next.size < 5) {
        next.add(slug);
      }
      return next;
    });
  }, []);

  const lockHand = useCallback(() => {
    if (selected.size !== 5) return;
    const chosen = dealt.filter((c) => selected.has(c.slug));
    const result = evaluateHand(chosen);
    setHandResult(result);
    setHistory((h) => [...h, { type: result.type, points: result.points, emoji: result.emoji, cards: chosen }]);
    setTotalScore((s) => s + result.points);
    setState('revealed');
  }, [selected, dealt]);

  const nextHand = useCallback(() => {
    const next = handIndex + 1;
    if (next >= HANDS_PER_GAME) {
      const grade = getGrade(totalScore).grade;
      const royals = history.filter((h) => h.type === 'Royal Flush').length;
      const straightFlushes = history.filter((h) => h.type === 'Straight Flush').length;
      const fourKinds = history.filter((h) => h.type === 'Four of a Kind').length;
      const nextStats: PokerStats = {
        games: stats.games + 1,
        bestScore: Math.max(stats.bestScore, totalScore),
        bestGrade: stats.bestScore > totalScore ? stats.bestGrade : grade,
        royalFlushes: stats.royalFlushes + royals,
        straightFlushes: stats.straightFlushes + straightFlushes,
        fourKinds: stats.fourKinds + fourKinds,
      };
      persistStats(nextStats);
      const emojiLine = history.map((h) => h.emoji).join('');
      setShareText(
        `CardVault Card Poker — ${mode === 'daily' ? 'Daily' : 'Random'} ${sportFilter !== 'all' ? `(${sportFilter})` : ''}\n${emojiLine}\nScore: ${totalScore.toLocaleString()} pts · Grade ${grade}\nhttps://cardvault-two.vercel.app/card-poker`,
      );
      setState('complete');
      return;
    }
    setHandIndex(next);
    setDealt(dealSeven(allCards, sportFilter, rngRef.current));
    setSelected(new Set());
    setHandResult(null);
    setState('playing');
  }, [handIndex, totalScore, history, stats, mode, sportFilter, allCards, persistStats]);

  const copyShare = useCallback(() => {
    if (!shareText) return;
    try {
      navigator.clipboard.writeText(shareText);
    } catch {}
  }, [shareText]);

  /* ─── Render ────────────────────────────────────────── */
  if (state === 'menu') {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-green-950/60 to-emerald-950/40 border border-green-800/40 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-3">How It Works</h2>
          <ol className="space-y-2 text-sm text-gray-300 list-decimal list-inside">
            <li>You get 5 hands. Each hand deals 7 real sports cards.</li>
            <li>Pick 5 of the 7 to build your best Card Poker hand.</li>
            <li>Same-year cards = pairs, trips, quads. Same-sport 5 = Flush. 5 consecutive decades = Straight.</li>
            <li>Royal Flush: 5 rookie cards, all same sport. Rarest hand, 10,000 points.</li>
            <li>Same-player bonus: +200 pts per repeat player in your hand.</li>
          </ol>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setMode('daily')}
            className={`rounded-xl border-2 px-4 py-3 text-sm font-medium transition-colors ${mode === 'daily' ? 'border-green-500 bg-green-950/60 text-white' : 'border-gray-700 bg-gray-900/40 text-gray-400 hover:border-gray-600'}`}
          >
            Daily Deal
            <div className="text-xs text-gray-500 mt-1">Same 5 hands for every player today</div>
          </button>
          <button
            onClick={() => setMode('random')}
            className={`rounded-xl border-2 px-4 py-3 text-sm font-medium transition-colors ${mode === 'random' ? 'border-green-500 bg-green-950/60 text-white' : 'border-gray-700 bg-gray-900/40 text-gray-400 hover:border-gray-600'}`}
          >
            Random
            <div className="text-xs text-gray-500 mt-1">New deal every game</div>
          </button>
        </div>

        <div>
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Sport Filter</div>
          <div className="flex flex-wrap gap-2">
            {(['all', 'baseball', 'basketball', 'football', 'hockey'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSportFilter(s)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${sportFilter === s ? 'bg-green-600 text-white' : 'bg-gray-800/60 text-gray-400 hover:bg-gray-700/60'}`}
              >
                {s === 'all' ? 'All Sports' : `${SPORT_EMOJI[s]} ${s.charAt(0).toUpperCase() + s.slice(1)}`}
              </button>
            ))}
          </div>
          {sportFilter === 'all' && (
            <p className="text-xs text-gray-500 mt-2">In All-Sports mode the deal is biased toward one sport per hand — Flush attempts are viable.</p>
          )}
        </div>

        {stats.games > 0 && (
          <div className="bg-gray-900/40 border border-gray-700/40 rounded-xl p-4">
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-3">Your Stats</div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-2xl font-bold text-white">{stats.games}</div>
                <div className="text-xs text-gray-500">Games</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-300">{stats.bestScore.toLocaleString()}</div>
                <div className="text-xs text-gray-500">Best Score ({stats.bestGrade})</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-300">{stats.royalFlushes}</div>
                <div className="text-xs text-gray-500">Royal Flushes</div>
              </div>
              <div>
                <div className="text-lg font-bold text-violet-300">{stats.straightFlushes}</div>
                <div className="text-xs text-gray-500">Straight Flushes</div>
              </div>
              <div>
                <div className="text-lg font-bold text-yellow-300">{stats.fourKinds}</div>
                <div className="text-xs text-gray-500">Four of a Kind</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-400">—</div>
                <div className="text-xs text-gray-500">{stats.games >= 10 ? 'Veteran' : 'Rookie'}</div>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={startGame}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold text-lg py-4 rounded-xl transition-all shadow-lg shadow-green-900/50"
        >
          Deal {HANDS_PER_GAME} Hands
        </button>

        <div className="bg-gray-900/40 border border-gray-700/40 rounded-xl p-4">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-3">Hand Rankings</div>
          <div className="space-y-1.5 text-sm">
            {(Object.keys(HAND_POINTS) as HandType[]).map((h) => (
              <div key={h} className="flex items-center justify-between text-gray-300">
                <span>
                  <span className="mr-2">{HAND_EMOJI[h]}</span>
                  {h}
                </span>
                <span className="font-mono text-gray-500">
                  {h === 'High Card' ? 'max $ / 100' : `${HAND_POINTS[h].toLocaleString()} pts`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (state === 'playing') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-gray-900/50 border border-gray-700/50 rounded-xl px-4 py-3">
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">Hand</div>
            <div className="text-lg font-bold text-white">
              {handIndex + 1} / {HANDS_PER_GAME}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400 uppercase tracking-wider">Selected</div>
            <div className={`text-lg font-bold ${selected.size === 5 ? 'text-green-300' : 'text-white'}`}>
              {selected.size} / 5
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400 uppercase tracking-wider">Score</div>
            <div className="text-lg font-bold text-green-300">{totalScore.toLocaleString()}</div>
          </div>
        </div>

        <p className="text-sm text-gray-400 text-center">
          Pick 5 of 7 cards to form your best poker hand.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {dealt.map((c) => {
            const isSelected = selected.has(c.slug);
            const decade = Math.floor(c.year / 10) * 10;
            return (
              <button
                key={c.slug}
                onClick={() => toggleSelect(c.slug)}
                className={`text-left bg-gradient-to-b from-gray-900/80 to-gray-950/90 rounded-xl p-3 border-2 transition-all ${
                  isSelected
                    ? 'border-green-500 shadow-lg shadow-green-900/50 scale-[1.02]'
                    : `${SPORT_BORDER[c.sport] || 'border-gray-700/50'} hover:scale-[1.01]`
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xl">{SPORT_EMOJI[c.sport]}</span>
                  {c.rookie && (
                    <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">RC</span>
                  )}
                </div>
                <div className="text-xs text-gray-300 font-medium leading-tight mb-1 line-clamp-2">{c.player}</div>
                <div className="text-[11px] text-gray-500 line-clamp-1">{c.year} &middot; {decade}s</div>
                <div className="text-xs text-green-300 font-bold mt-1">{formatMoney(c.value)}</div>
                {isSelected && (
                  <div className="text-[10px] font-bold text-green-400 mt-1">SELECTED</div>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={lockHand}
          disabled={selected.size !== 5}
          className={`w-full font-bold py-4 rounded-xl transition-all ${
            selected.size === 5
              ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-lg shadow-green-900/50'
              : 'bg-gray-800/60 text-gray-500 cursor-not-allowed'
          }`}
        >
          {selected.size === 5 ? 'Lock Hand' : `Pick ${5 - selected.size} more`}
        </button>

        {history.length > 0 && (
          <div className="bg-gray-900/40 border border-gray-700/40 rounded-xl p-3">
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Hands So Far</div>
            <div className="flex flex-wrap gap-2">
              {history.map((h, i) => (
                <div key={i} className="text-xs bg-gray-800/60 border border-gray-700/50 rounded-lg px-2 py-1 flex items-center gap-1.5">
                  <span>{h.emoji}</span>
                  <span className="text-gray-300">{h.type}</span>
                  <span className="text-green-300 font-mono">+{h.points}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (state === 'revealed' && handResult) {
    const chosen = dealt.filter((c) => selected.has(c.slug));
    const isTopHand = ['Royal Flush', 'Straight Flush', 'Four of a Kind', 'Full House'].includes(handResult.type);
    return (
      <div className="space-y-4">
        <div className={`rounded-2xl border-2 p-6 text-center ${isTopHand ? 'border-amber-500/60 bg-amber-950/30' : 'border-green-500/40 bg-green-950/20'}`}>
          <div className="text-6xl mb-2">{handResult.emoji}</div>
          <h2 className="text-3xl font-bold text-white mb-2">{handResult.type}</h2>
          <p className="text-sm text-gray-300 mb-4">{handResult.description}</p>
          <div className={`text-4xl font-bold ${isTopHand ? 'text-amber-300' : 'text-green-300'}`}>
            +{handResult.points.toLocaleString()} pts
          </div>
          {handResult.playerBonus > 0 && (
            <div className="text-xs text-amber-400 mt-1">Includes +{handResult.playerBonus} same-player bonus</div>
          )}
          <div className="text-xs text-gray-500 mt-2">Running: {totalScore.toLocaleString()} / {HANDS_PER_GAME} hands</div>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {chosen.map((c) => (
            <div
              key={c.slug}
              className={`bg-gradient-to-b from-gray-900/80 to-gray-950/90 rounded-lg p-2 border-2 ${SPORT_BORDER[c.sport] || 'border-gray-700/50'}`}
            >
              <div className="text-lg">{SPORT_EMOJI[c.sport]}</div>
              <div className="text-[10px] text-gray-300 font-medium leading-tight line-clamp-2">{c.player}</div>
              <div className="text-[10px] text-gray-500">{c.year}</div>
              <div className="text-[10px] text-green-300 font-bold">{formatMoney(c.value)}</div>
            </div>
          ))}
        </div>

        <button
          onClick={nextHand}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-green-900/50"
        >
          {handIndex + 1 >= HANDS_PER_GAME ? 'See Final Score' : `Next Hand (${handIndex + 2}/${HANDS_PER_GAME})`}
        </button>
      </div>
    );
  }

  if (state === 'complete') {
    const gradeInfo = getGrade(totalScore);
    return (
      <div className="space-y-5">
        <div className="bg-gradient-to-br from-green-950/60 to-emerald-950/40 border-2 border-green-700/40 rounded-2xl p-6 text-center">
          <div className="text-xs text-green-400 uppercase tracking-widest mb-2">Final Score</div>
          <div className="text-5xl font-bold text-white mb-2">{totalScore.toLocaleString()}</div>
          <div className={`text-3xl font-bold ${gradeInfo.color}`}>Grade {gradeInfo.grade}</div>
          <div className="text-xs text-gray-500 mt-3">
            {mode === 'daily' ? 'Daily Deal' : 'Random'} · {sportFilter === 'all' ? 'All Sports' : sportFilter}
          </div>
        </div>

        <div className="bg-gray-900/40 border border-gray-700/40 rounded-xl p-4">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-3">Hand Breakdown</div>
          <div className="space-y-2">
            {history.map((h, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{h.emoji}</span>
                  <span className="text-gray-300 font-medium">Hand {i + 1}: {h.type}</span>
                </div>
                <span className="text-green-300 font-mono font-bold">+{h.points.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900/60 border border-gray-700/50 rounded-xl p-4 font-mono text-sm whitespace-pre-wrap text-gray-300">
          {shareText}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={copyShare}
            className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 rounded-xl transition-colors"
          >
            Copy to Share
          </button>
          <button
            onClick={startGame}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-3 rounded-xl transition-all"
          >
            Play Again
          </button>
        </div>

        <button
          onClick={() => setState('menu')}
          className="w-full text-gray-400 hover:text-white text-sm py-2"
        >
          &larr; Back to Menu
        </button>
      </div>
    );
  }

  return null;
}
