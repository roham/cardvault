'use client';

import { useEffect, useMemo, useState } from 'react';
import { sportsCards } from '@/data/sports-cards';

type Phase = 'picking' | 'eliminating' | 'banker-offer' | 'final-choice' | 'revealed';
type Mode = 'daily' | 'free';

interface Briefcase {
  id: number;
  cardName: string;
  player: string;
  year: number;
  sport: string;
  value: number;
  opened: boolean;
  isPlayer: boolean;
}

interface Stats {
  games: number;
  dealsPlayed: number;
  bestPayout: number;
  bestGrade: string;
  bestStreak: number;
  currentStreak: number;
  lastDaily: string;
}

const STATS_KEY = 'cv_card_briefcase_stats_v1';
const ROUND_ELIMS = [6, 4, 3, 2]; // total eliminations per round
const BANKER_FACTORS = [0.35, 0.55, 0.75, 0.90, 1.05];

const SPORT_COLORS: Record<string, string> = {
  baseball: 'text-sky-400',
  basketball: 'text-orange-400',
  football: 'text-emerald-400',
  hockey: 'text-cyan-400',
};

function parseLowPrice(v: string): number {
  const cleaned = v.replace(/,/g, '');
  const m = cleaned.match(/\$([0-9]+(?:\.[0-9]+)?)/);
  return m ? parseFloat(m[1]) : 0;
}

function formatMoney(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 10_000) return `$${(n / 1000).toFixed(0)}K`;
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${Math.round(n).toLocaleString('en-US')}`;
}

function formatMoneyFull(n: number): string {
  return `$${Math.round(n).toLocaleString('en-US')}`;
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleWithRng<T>(arr: T[], rng: () => number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function dateSeed(d: Date = new Date()): number {
  const iso = d.toISOString().slice(0, 10);
  let h = 2166136261;
  for (let i = 0; i < iso.length; i++) {
    h ^= iso.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const TIERS = [
  { label: 'trophy', count: 1, minPrice: 10000, maxPrice: 200000 },
  { label: 'elite', count: 2, minPrice: 1000, maxPrice: 10000 },
  { label: 'high', count: 4, minPrice: 100, maxPrice: 1000 },
  { label: 'mid', count: 5, minPrice: 25, maxPrice: 100 },
  { label: 'common', count: 4, minPrice: 0.01, maxPrice: 25 },
];

function buildBriefcases(mode: Mode): Briefcase[] {
  const rng = mode === 'daily' ? mulberry32(dateSeed()) : mulberry32(Math.floor(Math.random() * 1_000_000));
  const picks: Briefcase[] = [];
  const usedIds = new Set<string>();
  let id = 1;

  for (const tier of TIERS) {
    const pool = sportsCards.filter(c => {
      const p = parseLowPrice(c.estimatedValueRaw);
      return p >= tier.minPrice && p <= tier.maxPrice && !usedIds.has(c.slug);
    });
    const shuffled = shuffleWithRng(pool, rng);
    for (let i = 0; i < tier.count && i < shuffled.length; i++) {
      const c = shuffled[i];
      usedIds.add(c.slug);
      picks.push({
        id: id++,
        cardName: c.name,
        player: c.player,
        year: c.year,
        sport: c.sport,
        value: parseLowPrice(c.estimatedValueRaw),
        opened: false,
        isPlayer: false,
      });
    }
  }

  while (picks.length < 16) {
    const pool = sportsCards.filter(c => !usedIds.has(c.slug) && parseLowPrice(c.estimatedValueRaw) > 0);
    const pick = shuffleWithRng(pool, rng)[0];
    if (!pick) break;
    usedIds.add(pick.slug);
    picks.push({
      id: id++,
      cardName: pick.name,
      player: pick.player,
      year: pick.year,
      sport: pick.sport,
      value: parseLowPrice(pick.estimatedValueRaw),
      opened: false,
      isPlayer: false,
    });
  }

  return shuffleWithRng(picks, rng).map((p, i) => ({ ...p, id: i + 1 }));
}

function loadStats(): Stats {
  if (typeof window === 'undefined') {
    return { games: 0, dealsPlayed: 0, bestPayout: 0, bestGrade: '—', bestStreak: 0, currentStreak: 0, lastDaily: '' };
  }
  try {
    const raw = window.localStorage.getItem(STATS_KEY);
    if (!raw) throw new Error('no stats');
    return JSON.parse(raw);
  } catch {
    return { games: 0, dealsPlayed: 0, bestPayout: 0, bestGrade: '—', bestStreak: 0, currentStreak: 0, lastDaily: '' };
  }
}

function saveStats(s: Stats) {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(STATS_KEY, JSON.stringify(s)); } catch {}
}

function computeGrade(payout: number, maxValue: number): { grade: string; label: string; color: string } {
  const pct = maxValue > 0 ? payout / maxValue : 0;
  if (pct >= 0.9) return { grade: 'S', label: 'Showcase Closer', color: 'from-emerald-500 to-green-600' };
  if (pct >= 0.7) return { grade: 'A+', label: 'Deal of the Day', color: 'from-teal-400 to-emerald-500' };
  if (pct >= 0.5) return { grade: 'A', label: 'Solid Walk-Off', color: 'from-sky-400 to-cyan-500' };
  if (pct >= 0.3) return { grade: 'B', label: 'Middle of the Pack', color: 'from-lime-400 to-yellow-500' };
  if (pct >= 0.15) return { grade: 'C', label: 'Left Money on the Table', color: 'from-yellow-500 to-orange-500' };
  if (pct >= 0.05) return { grade: 'D', label: 'Should Have Dealt', color: 'from-orange-500 to-red-500' };
  return { grade: 'F', label: 'Busted the Suitcase', color: 'from-rose-600 to-red-700' };
}

export default function CardBriefcaseClient() {
  const [mode, setMode] = useState<Mode>('daily');
  const [phase, setPhase] = useState<Phase>('picking');
  const [cases, setCases] = useState<Briefcase[]>([]);
  const [playerId, setPlayerId] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  const [eliminationsThisRound, setEliminationsThisRound] = useState(0);
  const [bankerOffer, setBankerOffer] = useState(0);
  const [accepted, setAccepted] = useState(false);
  const [finalCase, setFinalCase] = useState<Briefcase | null>(null);
  const [stats, setStats] = useState<Stats>({ games: 0, dealsPlayed: 0, bestPayout: 0, bestGrade: '—', bestStreak: 0, currentStreak: 0, lastDaily: '' });
  const [mounted, setMounted] = useState(false);
  const [payout, setPayout] = useState(0);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    setMounted(true);
    setStats(loadStats());
  }, []);

  useEffect(() => {
    if (!mounted) return;
    setCases(buildBriefcases(mode));
    setPhase('picking');
    setPlayerId(null);
    setRound(0);
    setEliminationsThisRound(0);
    setBankerOffer(0);
    setAccepted(false);
    setFinalCase(null);
    setPayout(0);
    setShared(false);
  }, [mode, mounted]);

  const maxValue = useMemo(() => cases.reduce((m, c) => Math.max(m, c.value), 0), [cases]);
  const remainingCases = cases.filter(c => !c.opened);
  const remainingOther = cases.filter(c => !c.opened && c.id !== playerId);

  function pickPlayerCase(id: number) {
    if (phase !== 'picking') return;
    setCases(prev => prev.map(c => c.id === id ? { ...c, isPlayer: true } : c));
    setPlayerId(id);
    setPhase('eliminating');
    setRound(0);
    setEliminationsThisRound(0);
  }

  function eliminate(id: number) {
    if (phase !== 'eliminating') return;
    if (id === playerId) return;
    const c = cases.find(x => x.id === id);
    if (!c || c.opened) return;
    const nextCases = cases.map(x => x.id === id ? { ...x, opened: true } : x);
    const nextElims = eliminationsThisRound + 1;
    setCases(nextCases);
    setEliminationsThisRound(nextElims);
    if (nextElims >= ROUND_ELIMS[round]) {
      const unopened = nextCases.filter(x => !x.opened);
      const mean = unopened.reduce((sum, x) => sum + x.value, 0) / unopened.length;
      const factor = BANKER_FACTORS[round];
      const offer = Math.round(mean * factor);
      setBankerOffer(offer);
      setPhase('banker-offer');
    }
  }

  function acceptDeal() {
    setAccepted(true);
    setPayout(bankerOffer);
    const playerCase = cases.find(c => c.id === playerId) ?? null;
    setFinalCase(playerCase);
    setPhase('revealed');
    recordGame(bankerOffer, true);
  }

  function declineDeal() {
    const nextRound = round + 1;
    if (nextRound >= ROUND_ELIMS.length) {
      // Round 5 = final choice between player case and the last remaining other
      setPhase('final-choice');
      return;
    }
    setRound(nextRound);
    setEliminationsThisRound(0);
    setPhase('eliminating');
    setBankerOffer(0);
  }

  function finalKeep() {
    const playerCase = cases.find(c => c.id === playerId) ?? null;
    if (!playerCase) return;
    setFinalCase(playerCase);
    setPayout(playerCase.value);
    setPhase('revealed');
    recordGame(playerCase.value, false);
  }

  function finalSwap() {
    const other = remainingOther[0];
    if (!other) return;
    setCases(prev => prev.map(c =>
      c.id === other.id ? { ...c, isPlayer: true } : c.id === playerId ? { ...c, isPlayer: false } : c
    ));
    setPlayerId(other.id);
    setFinalCase(other);
    setPayout(other.value);
    setPhase('revealed');
    recordGame(other.value, false);
  }

  function recordGame(finalPayout: number, dealt: boolean) {
    const { grade } = computeGrade(finalPayout, maxValue);
    const today = new Date().toISOString().slice(0, 10);
    setStats(prev => {
      const next: Stats = {
        games: prev.games + 1,
        dealsPlayed: prev.dealsPlayed + (dealt ? 1 : 0),
        bestPayout: Math.max(prev.bestPayout, finalPayout),
        bestGrade: rankGrade(grade) > rankGrade(prev.bestGrade) ? grade : prev.bestGrade,
        bestStreak: prev.bestStreak,
        currentStreak: prev.currentStreak,
        lastDaily: prev.lastDaily,
      };
      if (mode === 'daily' && today !== prev.lastDaily) {
        next.currentStreak = prev.lastDaily ? (isYesterday(prev.lastDaily, today) ? prev.currentStreak + 1 : 1) : 1;
        next.bestStreak = Math.max(prev.bestStreak, next.currentStreak);
        next.lastDaily = today;
      }
      saveStats(next);
      return next;
    });
  }

  function startNewGame() {
    setCases(buildBriefcases(mode));
    setPhase('picking');
    setPlayerId(null);
    setRound(0);
    setEliminationsThisRound(0);
    setBankerOffer(0);
    setAccepted(false);
    setFinalCase(null);
    setPayout(0);
    setShared(false);
  }

  function shareResult() {
    if (!finalCase) return;
    const grade = computeGrade(payout, maxValue);
    const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const text = `💼 Card Briefcase ${dateStr}\n${grade.grade} — ${grade.label}\nPayout: ${formatMoney(payout)} (${Math.round((payout / maxValue) * 100)}% of max ${formatMoney(maxValue)})\n${accepted ? '💰 Took the Banker\'s deal' : finalCase.id === playerId ? '📦 Kept my original case' : '🔄 Swapped at the end'}\n\ncardvault-two.vercel.app/card-briefcase`;
    navigator.clipboard.writeText(text).then(() => {
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    });
  }

  const grade = useMemo(() => phase === 'revealed' ? computeGrade(payout, maxValue) : null, [phase, payout, maxValue]);

  if (!mounted) {
    return <div className="h-96 bg-gray-900/40 border border-gray-800 rounded-2xl animate-pulse" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 justify-between bg-gray-900/40 border border-gray-800 rounded-2xl p-4">
        <div className="flex gap-2">
          {(['daily', 'free'] as Mode[]).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors ${mode === m ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300' : 'border-gray-800 bg-black/30 text-gray-400 hover:border-gray-700'}`}
            >
              {m === 'daily' ? "📅 Today's Game" : '🎲 Free Play'}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-gray-400">
          <Stat label="Games" value={String(stats.games)} />
          <Stat label="Deals taken" value={String(stats.dealsPlayed)} />
          <Stat label="Best payout" value={formatMoney(stats.bestPayout)} />
          <Stat label="Best grade" value={stats.bestGrade} />
          {mode === 'daily' && <Stat label="Streak" value={`${stats.currentStreak} (best ${stats.bestStreak})`} />}
        </div>
      </div>

      {phase === 'picking' && (
        <div className="bg-emerald-500/5 border border-emerald-500/30 rounded-2xl p-5 text-center">
          <div className="text-emerald-300 text-sm font-bold mb-1">PICK YOUR BRIEFCASE</div>
          <div className="text-gray-400 text-xs">Tap one of the sixteen cases below. It stays yours — closed — for the rest of the game.</div>
        </div>
      )}

      {phase === 'eliminating' && (
        <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-xs uppercase tracking-wider text-gray-500">Round {round + 1} of {ROUND_ELIMS.length}</div>
              <div className="text-white font-bold">Eliminate {ROUND_ELIMS[round] - eliminationsThisRound} more case{ROUND_ELIMS[round] - eliminationsThisRound !== 1 ? 's' : ''}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Remaining</div>
              <div className="text-emerald-400 font-bold text-xl">{remainingCases.length}</div>
            </div>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all"
              style={{ width: `${(eliminationsThisRound / ROUND_ELIMS[round]) * 100}%` }}
            />
          </div>
        </div>
      )}

      {phase === 'banker-offer' && (
        <div className="bg-gradient-to-br from-emerald-600/20 to-teal-500/10 border-2 border-emerald-500/50 rounded-2xl p-8 text-center">
          <div className="text-xs uppercase tracking-wider text-emerald-300 mb-1">📞 THE BANKER IS CALLING</div>
          <div className="text-gray-300 text-sm mb-4">
            {round === 0 && 'A lowball opener — test your nerve.'}
            {round === 1 && 'Getting warmer. Do you hold the grail?'}
            {round === 2 && 'Real numbers now. Where\'s the trophy?'}
            {round === 3 && 'Final squeeze — walk or risk it?'}
          </div>
          <div className="text-5xl sm:text-7xl font-black text-emerald-300 mb-2 font-mono">{formatMoney(bankerOffer)}</div>
          <div className="text-xs text-gray-500 mb-6">Based on the mean of {remainingCases.length} unopened cases × {Math.round(BANKER_FACTORS[round] * 100)}%</div>
          <div className="flex flex-wrap gap-3 justify-center">
            <button onClick={acceptDeal} className="px-6 py-3 rounded-xl bg-emerald-500 text-black font-black text-lg hover:bg-emerald-400 transition-colors">
              💰 DEAL
            </button>
            <button onClick={declineDeal} className="px-6 py-3 rounded-xl bg-gray-800 text-white font-black text-lg hover:bg-gray-700 transition-colors border border-gray-700">
              🚫 NO DEAL
            </button>
          </div>
        </div>
      )}

      {phase === 'final-choice' && (
        <div className="bg-amber-500/5 border-2 border-amber-500/40 rounded-2xl p-6 text-center">
          <div className="text-xs uppercase tracking-wider text-amber-300 mb-1">🎯 THE FINAL MOMENT</div>
          <div className="text-white text-lg font-bold mb-2">Keep your original case or swap with the last one on the table?</div>
          <div className="text-gray-400 text-sm mb-6">No more Banker offers. One case reveals $. The other reveals nothing you get to keep.</div>
          <div className="flex flex-wrap gap-3 justify-center">
            <button onClick={finalKeep} className="px-6 py-3 rounded-xl bg-amber-500 text-black font-black text-lg hover:bg-amber-400 transition-colors">
              📦 KEEP MINE (#{playerId})
            </button>
            <button onClick={finalSwap} className="px-6 py-3 rounded-xl bg-gray-800 text-white font-black text-lg hover:bg-gray-700 transition-colors border border-gray-700">
              🔄 SWAP (#{remainingOther[0]?.id})
            </button>
          </div>
        </div>
      )}

      {phase === 'revealed' && finalCase && grade && (
        <div className={`bg-gradient-to-br ${grade.color} rounded-2xl p-8 text-center`}>
          <div className="text-xs uppercase tracking-wider text-white/80 mb-1">FINAL RESULT</div>
          <div className="text-6xl sm:text-8xl font-black text-white mb-1">{grade.grade}</div>
          <div className="text-white/90 text-lg font-bold mb-4">{grade.label}</div>
          <div className="bg-black/30 rounded-xl p-4 inline-block text-left mb-4">
            <div className="text-xs text-white/70 mb-1">
              {accepted ? 'Banker offer accepted' : `Your case #${finalCase.id} revealed`}
            </div>
            <div className="text-3xl font-black text-white font-mono">{formatMoneyFull(payout)}</div>
            <div className="text-xs text-white/70 mt-1">{Math.round((payout / maxValue) * 100)}% of max possible ({formatMoney(maxValue)})</div>
            {!accepted && (
              <div className="mt-3 pt-3 border-t border-white/20 text-xs text-white/80">
                Inside case #{finalCase.id}: {finalCase.cardName} {finalCase.year} ({finalCase.sport})
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            <button onClick={shareResult} className="px-4 py-2 rounded-lg bg-white/20 text-white text-sm font-semibold hover:bg-white/30 transition-colors border border-white/30">
              {shared ? '✓ Copied' : '📋 Share result'}
            </button>
            <button onClick={startNewGame} className="px-4 py-2 rounded-lg bg-black/30 text-white text-sm font-semibold hover:bg-black/50 transition-colors border border-white/20">
              🎲 Play again
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-2 sm:gap-3">
        {cases.map(c => (
          <BriefcaseTile
            key={c.id}
            briefcase={c}
            phase={phase}
            onClick={() => {
              if (phase === 'picking') pickPlayerCase(c.id);
              else if (phase === 'eliminating') eliminate(c.id);
            }}
          />
        ))}
      </div>

      {phase === 'revealed' && (
        <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-5">
          <div className="text-xs uppercase tracking-wider text-gray-500 mb-3">All cases revealed</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {[...cases].sort((a, b) => b.value - a.value).map(c => (
              <div key={c.id} className={`px-2 py-1.5 rounded-lg border ${c.id === finalCase?.id ? 'border-emerald-500/60 bg-emerald-500/10' : 'border-gray-800 bg-black/30'}`}>
                <div className="font-mono text-gray-500">#{c.id}</div>
                <div className="font-bold text-white font-mono">{formatMoney(c.value)}</div>
                <div className={`truncate ${SPORT_COLORS[c.sport] ?? 'text-gray-400'}`}>{c.player}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BriefcaseTile({ briefcase, phase, onClick }: { briefcase: Briefcase; phase: Phase; onClick: () => void }) {
  const { id, opened, isPlayer, value, player, sport } = briefcase;
  const clickable = (phase === 'picking' && !opened) || (phase === 'eliminating' && !opened && !isPlayer);
  const isRevealed = phase === 'revealed';
  const bgClass = isPlayer
    ? 'bg-gradient-to-br from-emerald-600 to-teal-600 border-emerald-400 text-white'
    : opened
      ? 'bg-black/40 border-gray-800 text-gray-600'
      : clickable
        ? 'bg-gradient-to-br from-gray-700 to-gray-900 border-gray-600 text-white hover:from-emerald-700 hover:to-teal-800 hover:border-emerald-500 cursor-pointer'
        : 'bg-gradient-to-br from-gray-700 to-gray-900 border-gray-600 text-white';

  return (
    <button
      onClick={onClick}
      disabled={!clickable}
      className={`relative aspect-[3/4] rounded-lg border-2 p-2 transition-all flex flex-col items-center justify-center text-center ${bgClass} disabled:cursor-default`}
    >
      {isPlayer && !isRevealed && (
        <div className="absolute -top-1.5 -right-1.5 bg-amber-500 text-black text-[10px] font-black px-1.5 py-0.5 rounded-full">YOURS</div>
      )}
      {opened && !isPlayer && !isRevealed ? (
        <div className="opacity-50">
          <div className="text-lg sm:text-xl font-black font-mono">#{id}</div>
          <div className="text-[10px] sm:text-xs mt-1 font-mono">{formatMoney(value)}</div>
          <div className="text-[9px] sm:text-[10px] mt-0.5 truncate max-w-full">{player}</div>
        </div>
      ) : isRevealed ? (
        <div>
          <div className="text-xs sm:text-sm font-black font-mono">#{id}</div>
          <div className="text-xs sm:text-sm mt-1 font-mono font-bold">{formatMoney(value)}</div>
          <div className="text-[9px] sm:text-[10px] mt-0.5 truncate max-w-full">{player}</div>
        </div>
      ) : (
        <div>
          <div className="text-xl sm:text-2xl">💼</div>
          <div className="text-sm sm:text-base font-black font-mono mt-1">#{id}</div>
        </div>
      )}
    </button>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-start">
      <span className="text-[10px] uppercase tracking-wider text-gray-600">{label}</span>
      <span className="font-bold text-white">{value}</span>
    </div>
  );
}

function rankGrade(g: string): number {
  const order = ['F', 'D', 'C', 'B', 'A', 'A+', 'S', '—'];
  return order.indexOf(g);
}

function isYesterday(prev: string, today: string): boolean {
  const d1 = new Date(prev);
  const d2 = new Date(today);
  const diff = (d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24);
  return Math.abs(diff - 1) < 0.01;
}
