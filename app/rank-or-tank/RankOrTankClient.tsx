'use client';

import { useEffect, useMemo, useState } from 'react';
import { sportsCards } from '@/data/sports-cards';

type Phase = 'ranking' | 'revealed';

type RankCard = {
  slug: string;
  name: string;
  player: string;
  year: number;
  sport: string;
  rookie: boolean;
  ask: number;
  askLabel: string;
};

const SPORT_COLORS: Record<string, string> = {
  baseball: 'bg-sky-500/15 border-sky-500/40 text-sky-300',
  basketball: 'bg-orange-500/15 border-orange-500/40 text-orange-300',
  football: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300',
  hockey: 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300',
};

function parseLowPrice(v: string): number {
  const cleaned = v.replace(/,/g, '');
  const m = cleaned.match(/\$([0-9]+(?:\.[0-9]+)?)/);
  return m ? parseFloat(m[1]) : 0;
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return `$${Math.round(n).toLocaleString('en-US')}`;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function dealFive(): RankCard[] {
  const pool = sportsCards
    .filter((c: typeof sportsCards[number]) => {
      const price = parseLowPrice(c.estimatedValueRaw);
      return price > 0 && price < 200_000;
    });
  const shuffled = shuffle(pool);
  const picks: RankCard[] = [];
  const usedPrices: number[] = [];
  for (const c of shuffled) {
    const price = parseLowPrice(c.estimatedValueRaw);
    const tooClose = usedPrices.some(p => Math.abs(p - price) / Math.max(p, price) < 0.15);
    if (tooClose) continue;
    picks.push({
      slug: c.slug,
      name: c.name,
      player: c.player,
      year: c.year,
      sport: c.sport,
      rookie: c.rookie,
      ask: price,
      askLabel: c.estimatedValueRaw,
    });
    usedPrices.push(price);
    if (picks.length === 5) break;
  }
  return picks;
}

function computeGrade(correctPositions: number, kendallTau: number): { grade: string; label: string; icon: string; color: string } {
  if (correctPositions === 5) {
    return { grade: 'S', label: 'Perfect — Market Whisperer', icon: '🎯', color: 'from-fuchsia-500 to-violet-600' };
  }
  if (correctPositions === 4) {
    return { grade: 'A+', label: 'One Off — Elite Eye', icon: '🏆', color: 'from-amber-400 to-amber-600' };
  }
  if (correctPositions === 3 && kendallTau >= 0.6) {
    return { grade: 'A', label: 'Mostly Right — Seasoned Collector', icon: '🥇', color: 'from-emerald-500 to-teal-600' };
  }
  if (correctPositions >= 2 && kendallTau >= 0.4) {
    return { grade: 'B', label: 'Close Ordering — Hobby Literate', icon: '📗', color: 'from-lime-500 to-emerald-600' };
  }
  if (correctPositions >= 1 && kendallTau >= 0.2) {
    return { grade: 'C', label: 'Rough Instincts — Casual Heat', icon: '🎲', color: 'from-yellow-500 to-orange-500' };
  }
  if (kendallTau >= 0) {
    return { grade: 'D', label: 'Mostly Tanked — Shop Before Bidding', icon: '📉', color: 'from-orange-500 to-red-500' };
  }
  return { grade: 'F', label: 'Inverted — You Ordered Backwards', icon: '🙃', color: 'from-rose-600 to-red-700' };
}

function kendallTauDistance(userOrder: string[], trueOrder: string[]): number {
  const n = userOrder.length;
  const idxOf = (slug: string) => trueOrder.indexOf(slug);
  let agree = 0;
  let total = 0;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const a = idxOf(userOrder[i]);
      const b = idxOf(userOrder[j]);
      if (a < b) agree++;
      total++;
    }
  }
  return total === 0 ? 0 : (2 * agree / total) - 1;
}

type Stats = {
  rounds: number;
  perfect: number;
  bestStreak: number;
  currentStreak: number;
};

const STATS_KEY = 'cardvault.rank-or-tank.stats.v1';

function loadStats(): Stats {
  if (typeof window === 'undefined') return { rounds: 0, perfect: 0, bestStreak: 0, currentStreak: 0 };
  try {
    const raw = window.localStorage.getItem(STATS_KEY);
    if (!raw) return { rounds: 0, perfect: 0, bestStreak: 0, currentStreak: 0 };
    return JSON.parse(raw);
  } catch {
    return { rounds: 0, perfect: 0, bestStreak: 0, currentStreak: 0 };
  }
}

function saveStats(s: Stats) {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(STATS_KEY, JSON.stringify(s)); } catch {}
}

export default function RankOrTankClient() {
  const [phase, setPhase] = useState<Phase>('ranking');
  const [cards, setCards] = useState<RankCard[]>([]);
  const [order, setOrder] = useState<string[]>([]);
  const [stats, setStats] = useState<Stats>({ rounds: 0, perfect: 0, bestStreak: 0, currentStreak: 0 });
  const [mounted, setMounted] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    setMounted(true);
    setStats(loadStats());
    const deal = dealFive();
    setCards(deal);
    setOrder(shuffle(deal).map(c => c.slug));
  }, []);

  const cardBySlug = useMemo(() => {
    const map = new Map<string, RankCard>();
    cards.forEach(c => map.set(c.slug, c));
    return map;
  }, [cards]);

  const trueOrder = useMemo(() => {
    return [...cards].sort((a, b) => b.ask - a.ask).map(c => c.slug);
  }, [cards]);

  const result = useMemo(() => {
    if (phase !== 'revealed' || cards.length === 0) return null;
    const correctPositions = order.reduce((acc, slug, i) => acc + (slug === trueOrder[i] ? 1 : 0), 0);
    const tau = kendallTauDistance(order, trueOrder);
    const grade = computeGrade(correctPositions, tau);
    return { correctPositions, tau, grade };
  }, [phase, order, trueOrder, cards]);

  function moveUp(idx: number) {
    if (idx === 0) return;
    setOrder(prev => {
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  }

  function moveDown(idx: number) {
    if (idx === order.length - 1) return;
    setOrder(prev => {
      const next = [...prev];
      [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
      return next;
    });
  }

  function reveal() {
    if (phase !== 'ranking') return;
    const correctPositions = order.reduce((acc, slug, i) => acc + (slug === trueOrder[i] ? 1 : 0), 0);
    const isPerfect = correctPositions === 5;
    setStats(prev => {
      const next: Stats = {
        rounds: prev.rounds + 1,
        perfect: prev.perfect + (isPerfect ? 1 : 0),
        currentStreak: isPerfect ? prev.currentStreak + 1 : 0,
        bestStreak: isPerfect ? Math.max(prev.bestStreak, prev.currentStreak + 1) : prev.bestStreak,
      };
      saveStats(next);
      return next;
    });
    setPhase('revealed');
  }

  function newRound() {
    const deal = dealFive();
    setCards(deal);
    setOrder(shuffle(deal).map(c => c.slug));
    setPhase('ranking');
    setShared(false);
  }

  function shareResult() {
    if (!result) return;
    const emojiGrid = order.map((slug, i) => slug === trueOrder[i] ? '🟩' : '🟥').join('');
    const text = `Rank or Tank on CardVault — ${result.grade.grade} ${result.grade.icon}\n\n${emojiGrid}\n\n${result.correctPositions}/5 correct positions · ${Math.round((result.tau + 1) * 50)}% ordering accuracy\n\nPlay: https://cardvault-two.vercel.app/rank-or-tank`;
    if (navigator.share) {
      navigator.share({ title: 'Rank or Tank', text }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(text).then(() => {
        setShared(true);
        setTimeout(() => setShared(false), 1800);
      }).catch(() => {});
    }
  }

  if (!mounted || cards.length === 0) {
    return <div className="text-gray-400 text-sm">Dealing cards...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats bar (returning player) */}
      {stats.rounds > 0 && (
        <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Rounds Played</div>
            <div className="text-xl font-black text-white">{stats.rounds}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Perfect Calls</div>
            <div className="text-xl font-black text-fuchsia-300">{stats.perfect}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Best Streak</div>
            <div className="text-xl font-black text-amber-300">{stats.bestStreak}</div>
          </div>
        </div>
      )}

      {/* Header strip */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-fuchsia-500/15 border border-fuchsia-500/40 flex items-center justify-center text-fuchsia-300 font-black text-xs">
            {phase === 'ranking' ? '▲▼' : '✓'}
          </span>
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">{phase === 'ranking' ? 'Rank These 5' : 'Reveal'}</div>
            <div className="text-sm text-white font-semibold">
              {phase === 'ranking' ? 'Most Valuable → Least Valuable' : `${result?.correctPositions}/5 positions correct`}
            </div>
          </div>
        </div>
        {phase === 'ranking' ? (
          <button
            onClick={reveal}
            className="px-5 py-2.5 bg-gradient-to-r from-fuchsia-500 to-violet-600 text-white font-bold rounded-lg shadow-lg shadow-fuchsia-900/30 hover:shadow-fuchsia-900/60 transition-shadow"
          >
            Lock Ranking → Reveal
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={shareResult}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg border border-gray-700 text-sm font-semibold transition-colors"
            >
              {shared ? '✓ Copied' : 'Share Result'}
            </button>
            <button
              onClick={newRound}
              className="px-5 py-2.5 bg-gradient-to-r from-fuchsia-500 to-violet-600 text-white font-bold rounded-lg shadow-lg shadow-fuchsia-900/30 hover:shadow-fuchsia-900/60 transition-shadow"
            >
              New Round
            </button>
          </div>
        )}
      </div>

      {/* Grade banner (revealed only) */}
      {phase === 'revealed' && result && (
        <div className={`rounded-2xl p-6 bg-gradient-to-br ${result.grade.color} text-white shadow-lg`}>
          <div className="flex items-center gap-4">
            <div className="text-6xl sm:text-7xl font-black">{result.grade.grade}</div>
            <div className="flex-1">
              <div className="text-xl sm:text-2xl font-bold leading-tight">
                {result.grade.icon} {result.grade.label}
              </div>
              <div className="mt-1 text-sm text-white/85">
                {result.correctPositions}/5 exact positions · {Math.round((result.tau + 1) * 50)}% ordering agreement
              </div>
            </div>
          </div>
          <div className="mt-4 text-center text-2xl font-mono tracking-wider">
            {order.map((slug, i) => slug === trueOrder[i] ? '🟩' : '🟥').join(' ')}
          </div>
        </div>
      )}

      {/* Ranked list */}
      <ol className="space-y-3">
        {order.map((slug, i) => {
          const card = cardBySlug.get(slug);
          if (!card) return null;
          const trueIdx = trueOrder.indexOf(slug);
          const positionCorrect = phase === 'revealed' && trueIdx === i;
          const positionWrong = phase === 'revealed' && trueIdx !== i;
          return (
            <li
              key={slug}
              className={`bg-gray-800/60 border rounded-xl p-4 flex items-center gap-3 sm:gap-4 ${
                positionCorrect ? 'border-emerald-500/60 bg-emerald-950/15' :
                positionWrong ? 'border-rose-500/40 bg-rose-950/10' :
                'border-gray-700'
              }`}
            >
              <div className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gray-900 border border-gray-700 flex flex-col items-center justify-center">
                <div className="text-[9px] text-gray-500 uppercase">Rank</div>
                <div className="text-base sm:text-lg font-black text-white">#{i + 1}</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full border ${SPORT_COLORS[card.sport] || 'border-gray-700 text-gray-400'}`}>
                    {card.sport}
                  </span>
                  <span className="text-[10px] font-semibold text-gray-500">{card.year}</span>
                  {card.rookie && (
                    <span className="text-[10px] font-bold tracking-widest uppercase text-amber-400">★ RC</span>
                  )}
                </div>
                <div className="text-sm sm:text-base font-semibold text-white leading-tight truncate">{card.player}</div>
                <div className="text-xs text-gray-400 truncate">{card.name.replace(`${card.player} `, '').substring(0, 80)}</div>
                {phase === 'revealed' && (
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono text-fuchsia-300 font-semibold">{fmt(card.ask)}</span>
                    <span className="text-[10px] text-gray-500">ask</span>
                    {trueIdx !== i && (
                      <span className="text-[10px] text-rose-300 font-semibold uppercase tracking-wide">
                        should be #{trueIdx + 1}
                      </span>
                    )}
                  </div>
                )}
              </div>
              {phase === 'ranking' && (
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => moveUp(i)}
                    disabled={i === 0}
                    className="w-8 h-8 bg-gray-900 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed border border-gray-700 rounded text-white text-sm font-bold transition-colors"
                    aria-label="Move up"
                  >▲</button>
                  <button
                    onClick={() => moveDown(i)}
                    disabled={i === order.length - 1}
                    className="w-8 h-8 bg-gray-900 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed border border-gray-700 rounded text-white text-sm font-bold transition-colors"
                    aria-label="Move down"
                  >▼</button>
                </div>
              )}
              {phase === 'revealed' && (
                <div className="shrink-0">
                  {positionCorrect ? (
                    <span className="text-2xl">🟩</span>
                  ) : (
                    <span className="text-2xl">🟥</span>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {/* How-to strip */}
      {phase === 'ranking' && (
        <div className="bg-gradient-to-br from-fuchsia-950/30 to-violet-950/30 border border-fuchsia-800/30 rounded-xl p-4 text-sm text-gray-300">
          <strong className="text-white">How it scores:</strong> every card in its exactly-correct position = 1 point. Perfect 5/5 = S-tier. 4 right = A+. Ordering accuracy (Kendall&apos;s tau) is a secondary metric — getting closer to the true order earns partial credit even if no exact position is right.
        </div>
      )}
    </div>
  );
}
