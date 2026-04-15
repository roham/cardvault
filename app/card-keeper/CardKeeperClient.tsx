'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';
import type { SportsCard } from '@/data/sports-cards';

const STORAGE_KEY = 'cardvault-card-keeper';
const TOTAL_CARDS = 20;
const TIME_PER_CARD = 4000; // 4 seconds per card
const BUDGETS = { easy: 500, medium: 300, hard: 150 } as const;

type Difficulty = keyof typeof BUDGETS;

interface GameStats {
  gamesPlayed: number;
  bestValue: number;
  bestStreak: number;
  totalKept: number;
  avgAccuracy: number;
  dailyPlayed: string;
  dailyBestValue: number;
}

const sportIcons: Record<string, string> = {
  baseball: '⚾', basketball: '🏀', football: '🏈', hockey: '🏒',
};

const sportColors: Record<string, string> = {
  baseball: 'rose', basketball: 'orange', football: 'emerald', hockey: 'sky',
};

function parseValue(v: string): number {
  const m = v.match(/\$([\d,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
}

function dateHash(): number {
  const d = new Date();
  const str = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function shuffleWithSeed<T>(arr: T[], seed: number): T[] {
  const rng = seededRng(seed);
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getCardCost(card: SportsCard): number {
  const raw = parseValue(card.estimatedValueRaw);
  // Cost is a fraction of actual value — you're "buying" at a market cost
  // Higher value cards cost more proportionally
  if (raw >= 500) return Math.floor(raw * 0.15);
  if (raw >= 100) return Math.floor(raw * 0.20);
  if (raw >= 25) return Math.floor(raw * 0.30);
  return Math.floor(raw * 0.40) || 2;
}

function formatValue(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${n}`;
}

type GamePhase = 'menu' | 'playing' | 'reveal' | 'results';

export default function CardKeeperClient() {
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<GamePhase>('menu');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [isDaily, setIsDaily] = useState(false);

  // Game state
  const [cardQueue, setCardQueue] = useState<SportsCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [budget, setBudget] = useState(0);
  const [kept, setKept] = useState<SportsCard[]>([]);
  const [passed, setPassed] = useState<SportsCard[]>([]);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_CARD);
  const [showResult, setShowResult] = useState<'kept' | 'passed' | 'timeout' | null>(null);
  const [stats, setStats] = useState<GameStats>({
    gamesPlayed: 0, bestValue: 0, bestStreak: 0, totalKept: 0,
    avgAccuracy: 0, dailyPlayed: '', dailyBestValue: 0,
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const revealTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const allCards = useMemo(() => {
    return sportsCards.filter(c => parseValue(c.estimatedValueRaw) > 0);
  }, []);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setStats(JSON.parse(saved));
    } catch { /* empty */ }
  }, []);

  const saveStats = useCallback((s: GameStats) => {
    setStats(s);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch { /* empty */ }
  }, []);

  const startGame = useCallback((daily: boolean, diff: Difficulty) => {
    const seed = daily ? dateHash() : Date.now();
    const shuffled = shuffleWithSeed(allCards, seed);
    // Pick cards with a good spread of values — some cheap, some expensive
    const selected = shuffled.slice(0, TOTAL_CARDS);

    setCardQueue(selected);
    setCurrentIndex(0);
    setBudget(BUDGETS[diff]);
    setKept([]);
    setPassed([]);
    setTimeLeft(TIME_PER_CARD);
    setShowResult(null);
    setIsDaily(daily);
    setDifficulty(diff);
    setPhase('playing');
  }, [allCards]);

  // Timer logic
  useEffect(() => {
    if (phase !== 'playing' || showResult) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 100) {
          // Time's up — auto-pass
          clearInterval(timerRef.current!);
          handleDecision('timeout');
          return 0;
        }
        return prev - 100;
      });
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, currentIndex, showResult]);

  const handleDecision = useCallback((decision: 'kept' | 'passed' | 'timeout') => {
    if (timerRef.current) clearInterval(timerRef.current);

    const card = cardQueue[currentIndex];
    if (!card) return;

    if (decision === 'kept') {
      const cost = getCardCost(card);
      if (cost <= budget) {
        setBudget(prev => prev - cost);
        setKept(prev => [...prev, card]);
      } else {
        // Can't afford — treat as pass
        decision = 'passed';
        setPassed(prev => [...prev, card]);
      }
    } else {
      setPassed(prev => [...prev, card]);
    }

    setShowResult(decision);

    // Brief pause to show decision, then advance
    revealTimeoutRef.current = setTimeout(() => {
      setShowResult(null);
      if (currentIndex + 1 >= cardQueue.length) {
        setPhase('results');
      } else {
        setCurrentIndex(prev => prev + 1);
        setTimeLeft(TIME_PER_CARD);
      }
    }, 800);
  }, [cardQueue, currentIndex, budget]);

  // Keyboard controls
  useEffect(() => {
    if (phase !== 'playing' || showResult) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        handleDecision('passed');
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        handleDecision('kept');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase, showResult, handleDecision]);

  // Calculate results
  const totalValue = useMemo(() => {
    return kept.reduce((sum, c) => sum + parseValue(c.estimatedValueRaw), 0);
  }, [kept]);

  const totalCostSpent = useMemo(() => {
    return kept.reduce((sum, c) => sum + getCardCost(c), 0);
  }, [kept]);

  const roi = totalCostSpent > 0 ? ((totalValue - totalCostSpent) / totalCostSpent * 100).toFixed(0) : '0';

  const grade = useMemo(() => {
    const budgetUsed = BUDGETS[difficulty];
    const ratio = totalValue / budgetUsed;
    if (ratio >= 20) return { letter: 'S', color: 'text-yellow-400', label: 'Card Master' };
    if (ratio >= 12) return { letter: 'A', color: 'text-emerald-400', label: 'Sharp Eye' };
    if (ratio >= 7) return { letter: 'B', color: 'text-blue-400', label: 'Good Scout' };
    if (ratio >= 4) return { letter: 'C', color: 'text-gray-300', label: 'Decent' };
    if (ratio >= 2) return { letter: 'D', color: 'text-orange-400', label: 'Needs Practice' };
    return { letter: 'F', color: 'text-red-400', label: 'Rookie' };
  }, [totalValue, difficulty]);

  // Save results on game end
  useEffect(() => {
    if (phase !== 'results') return;

    const todayStr = new Date().toISOString().slice(0, 10);
    const newStats: GameStats = {
      ...stats,
      gamesPlayed: stats.gamesPlayed + 1,
      bestValue: Math.max(stats.bestValue, totalValue),
      totalKept: stats.totalKept + kept.length,
    };
    if (isDaily) {
      newStats.dailyPlayed = todayStr;
      newStats.dailyBestValue = Math.max(
        todayStr === stats.dailyPlayed ? stats.dailyBestValue : 0,
        totalValue
      );
    }
    saveStats(newStats);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current);
    };
  }, []);

  const shareResults = useCallback(() => {
    const lines = [
      `Card Keeper ${isDaily ? 'Daily' : difficulty.toUpperCase()} | CardVault`,
      `Cards: ${kept.length}/${TOTAL_CARDS} kept`,
      `Value: ${formatValue(totalValue)} | ROI: ${roi}%`,
      `Grade: ${grade.letter} — ${grade.label}`,
      '',
      `Top picks: ${kept.slice(0, 3).map(c => c.player).join(', ')}`,
      '',
      'https://cardvault-two.vercel.app/card-keeper',
    ];
    navigator.clipboard.writeText(lines.join('\n'));
  }, [kept, totalValue, roi, grade, difficulty, isDaily]);

  if (!mounted) {
    return <div className="min-h-[400px] flex items-center justify-center text-gray-500">Loading...</div>;
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  const dailyDone = stats.dailyPlayed === todayStr;

  // Menu
  if (phase === 'menu') {
    return (
      <div className="space-y-8">
        <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-2">How to Play</h2>
          <p className="text-gray-400 mb-4">
            Cards appear one at a time. You have <strong className="text-white">4 seconds</strong> to decide:
            <span className="text-emerald-400 font-semibold"> KEEP</span> or
            <span className="text-red-400 font-semibold"> PASS</span>.
            Each card you keep costs money from your budget. Maximize the total value of your kept collection!
          </p>
          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            <div className="bg-gray-800/60 rounded-lg p-3">
              <div className="text-2xl mb-1">20</div>
              <div className="text-gray-500">Cards</div>
            </div>
            <div className="bg-gray-800/60 rounded-lg p-3">
              <div className="text-2xl mb-1">4s</div>
              <div className="text-gray-500">Per Card</div>
            </div>
            <div className="bg-gray-800/60 rounded-lg p-3">
              <div className="text-2xl mb-1">$$$</div>
              <div className="text-gray-500">Budget</div>
            </div>
          </div>
        </div>

        {/* Daily Challenge */}
        <div className="bg-gradient-to-r from-amber-950/40 to-orange-950/40 border border-amber-800/40 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-lg font-bold text-amber-300">Daily Challenge</h3>
              <p className="text-amber-200/60 text-sm">Same cards for everyone. Compare scores with friends.</p>
            </div>
            {dailyDone && (
              <span className="text-xs bg-amber-800/40 text-amber-300 px-2 py-1 rounded">
                Best: {formatValue(stats.dailyBestValue)}
              </span>
            )}
          </div>
          <button
            onClick={() => startGame(true, 'medium')}
            className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-lg transition-colors"
          >
            {dailyDone ? 'Replay Daily' : 'Play Daily Challenge'}
          </button>
        </div>

        {/* Free Play */}
        <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Free Play</h3>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                  difficulty === d
                    ? 'border-emerald-500 bg-emerald-950/40 text-emerald-400'
                    : 'border-gray-700 bg-gray-800/40 text-gray-400 hover:border-gray-600'
                }`}
              >
                <div className="capitalize">{d}</div>
                <div className="text-xs opacity-70">${BUDGETS[d]} budget</div>
              </button>
            ))}
          </div>
          <button
            onClick={() => startGame(false, difficulty)}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg transition-colors"
          >
            Start Game
          </button>
        </div>

        {/* Stats */}
        {stats.gamesPlayed > 0 && (
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-3">Your Stats</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-xl font-bold text-white">{stats.gamesPlayed}</div>
                <div className="text-xs text-gray-500">Games</div>
              </div>
              <div>
                <div className="text-xl font-bold text-emerald-400">{formatValue(stats.bestValue)}</div>
                <div className="text-xs text-gray-500">Best Value</div>
              </div>
              <div>
                <div className="text-xl font-bold text-white">{stats.totalKept}</div>
                <div className="text-xs text-gray-500">Cards Kept</div>
              </div>
              <div>
                <div className="text-xl font-bold text-amber-400">{formatValue(stats.dailyBestValue)}</div>
                <div className="text-xs text-gray-500">Daily Best</div>
              </div>
            </div>
          </div>
        )}

        {/* Controls hint */}
        <div className="text-center text-sm text-gray-500">
          <p>Keyboard: <kbd className="bg-gray-800 px-2 py-0.5 rounded text-gray-300">A</kbd> Pass &middot; <kbd className="bg-gray-800 px-2 py-0.5 rounded text-gray-300">D</kbd> Keep &middot; or use arrow keys</p>
        </div>
      </div>
    );
  }

  // Playing
  if (phase === 'playing') {
    const card = cardQueue[currentIndex];
    if (!card) return null;

    const cost = getCardCost(card);
    const canAfford = cost <= budget;
    const timerPct = (timeLeft / TIME_PER_CARD) * 100;
    const timerColor = timerPct > 50 ? 'bg-emerald-500' : timerPct > 25 ? 'bg-amber-500' : 'bg-red-500';
    const sportColor = sportColors[card.sport] || 'gray';
    const icon = sportIcons[card.sport] || '🃏';
    const value = parseValue(card.estimatedValueRaw);

    return (
      <div className="space-y-4">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Card <span className="text-white font-bold">{currentIndex + 1}</span>/{TOTAL_CARDS}
          </div>
          <div className="text-sm">
            Budget: <span className={`font-bold ${budget > 50 ? 'text-emerald-400' : budget > 20 ? 'text-amber-400' : 'text-red-400'}`}>
              ${budget}
            </span>
          </div>
          <div className="text-sm text-gray-400">
            Kept: <span className="text-white font-bold">{kept.length}</span>
          </div>
        </div>

        {/* Timer bar */}
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full ${timerColor} transition-all duration-100 ease-linear rounded-full`}
            style={{ width: `${timerPct}%` }}
          />
        </div>

        {/* Card display */}
        <div className={`relative bg-gray-900/90 border-2 rounded-2xl p-6 sm:p-8 text-center transition-all duration-300 ${
          showResult === 'kept' ? 'border-emerald-500 bg-emerald-950/30' :
          showResult === 'passed' ? 'border-red-500 bg-red-950/30' :
          showResult === 'timeout' ? 'border-gray-600 bg-gray-800/30' :
          `border-${sportColor}-800/50`
        }`}>
          {/* Decision overlay */}
          {showResult && (
            <div className={`absolute inset-0 flex items-center justify-center rounded-2xl z-10 ${
              showResult === 'kept' ? 'bg-emerald-950/60' :
              showResult === 'passed' ? 'bg-red-950/60' : 'bg-gray-900/60'
            }`}>
              <span className={`text-4xl font-black ${
                showResult === 'kept' ? 'text-emerald-400' :
                showResult === 'passed' ? 'text-red-400' : 'text-gray-400'
              }`}>
                {showResult === 'kept' ? 'KEPT!' : showResult === 'passed' ? 'PASSED' : 'TIME UP'}
              </span>
            </div>
          )}

          <div className="text-4xl mb-3">{icon}</div>
          <div className={`text-xs font-medium text-${sportColor}-400 uppercase tracking-wider mb-2`}>
            {card.sport} &middot; {card.year} &middot; {card.set}
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-1">{card.player}</h3>
          <p className="text-gray-400 text-sm mb-4">{card.name}</p>

          {card.rookie && (
            <span className="inline-block bg-amber-900/40 text-amber-400 text-xs font-medium px-2 py-0.5 rounded mb-4">
              ROOKIE CARD
            </span>
          )}

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-gray-800/60 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">Raw Value</div>
              <div className="text-lg font-bold text-white">{card.estimatedValueRaw}</div>
            </div>
            <div className="bg-gray-800/60 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">Cost to Keep</div>
              <div className={`text-lg font-bold ${canAfford ? 'text-emerald-400' : 'text-red-400'}`}>
                ${cost}
                {!canAfford && <span className="text-xs ml-1">(over budget)</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        {!showResult && (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleDecision('passed')}
              className="bg-red-900/40 hover:bg-red-900/60 border border-red-800/50 text-red-300 font-bold py-4 rounded-xl transition-colors text-lg"
            >
              PASS
              <span className="block text-xs font-normal text-red-400/60 mt-0.5">A / &larr;</span>
            </button>
            <button
              onClick={() => handleDecision('kept')}
              disabled={!canAfford}
              className={`font-bold py-4 rounded-xl transition-colors text-lg ${
                canAfford
                  ? 'bg-emerald-900/40 hover:bg-emerald-900/60 border border-emerald-800/50 text-emerald-300'
                  : 'bg-gray-800/40 border border-gray-700/50 text-gray-600 cursor-not-allowed'
              }`}
            >
              KEEP ${cost}
              <span className="block text-xs font-normal text-emerald-400/60 mt-0.5">D / &rarr;</span>
            </button>
          </div>
        )}

        {/* Kept cards preview */}
        {kept.length > 0 && (
          <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-2">Your Collection ({kept.length} cards &middot; Value: {formatValue(kept.reduce((s, c) => s + parseValue(c.estimatedValueRaw), 0))})</div>
            <div className="flex flex-wrap gap-1.5">
              {kept.map((k, i) => (
                <span key={i} className="bg-gray-800 text-gray-300 text-xs px-2 py-0.5 rounded">
                  {sportIcons[k.sport]} {k.player}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Results
  if (phase === 'results') {
    const bestKept = [...kept].sort((a, b) => parseValue(b.estimatedValueRaw) - parseValue(a.estimatedValueRaw));
    const worstPassed = [...passed]
      .sort((a, b) => parseValue(b.estimatedValueRaw) - parseValue(a.estimatedValueRaw))
      .slice(0, 3);

    return (
      <div className="space-y-6">
        {/* Grade banner */}
        <div className="text-center bg-gray-900/80 border border-gray-800 rounded-2xl p-8">
          <div className={`text-7xl font-black ${grade.color} mb-2`}>{grade.letter}</div>
          <div className="text-xl text-gray-300 mb-1">{grade.label}</div>
          <div className="text-sm text-gray-500">{isDaily ? 'Daily Challenge' : `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Mode`}</div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-emerald-400">{formatValue(totalValue)}</div>
            <div className="text-xs text-gray-500">Total Value</div>
          </div>
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{kept.length}</div>
            <div className="text-xs text-gray-500">Cards Kept</div>
          </div>
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-amber-400">{roi}%</div>
            <div className="text-xs text-gray-500">ROI</div>
          </div>
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">${BUDGETS[difficulty] - budget}</div>
            <div className="text-xs text-gray-500">Spent of ${BUDGETS[difficulty]}</div>
          </div>
        </div>

        {/* Best picks */}
        {bestKept.length > 0 && (
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5">
            <h3 className="text-lg font-bold text-white mb-3">Your Collection</h3>
            <div className="space-y-2">
              {bestKept.map((card, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-800/40 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-lg">{sportIcons[card.sport]}</span>
                    <div className="min-w-0">
                      <Link href={`/sports/${card.slug}`} className="text-sm font-medium text-white hover:text-emerald-400 truncate block">
                        {card.player}
                      </Link>
                      <div className="text-xs text-gray-500">{card.year} {card.set} {card.rookie ? '🌟 RC' : ''}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <div className="text-sm font-bold text-emerald-400">{card.estimatedValueRaw}</div>
                    <div className="text-xs text-gray-500">cost ${getCardCost(card)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Missed opportunities */}
        {worstPassed.length > 0 && parseValue(worstPassed[0].estimatedValueRaw) > 50 && (
          <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-5">
            <h3 className="text-lg font-bold text-red-300 mb-3">Biggest Misses</h3>
            <div className="space-y-2">
              {worstPassed.map((card, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-800/20 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span>{sportIcons[card.sport]}</span>
                    <span className="text-sm text-gray-300">{card.player}</span>
                  </div>
                  <span className="text-sm text-red-400">{card.estimatedValueRaw}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setPhase('menu')}
            className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 rounded-xl transition-colors"
          >
            Back to Menu
          </button>
          <button
            onClick={shareResults}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-xl transition-colors"
          >
            Copy Results
          </button>
        </div>

        {/* Play again */}
        <button
          onClick={() => startGame(isDaily, difficulty)}
          className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-xl transition-colors"
        >
          Play Again
        </button>

        {/* Related features */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">More Games</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Link href="/flip-or-keep" className="text-emerald-400 hover:underline">Flip or Keep</Link>
            <Link href="/card-speed-quiz" className="text-emerald-400 hover:underline">Speed Quiz</Link>
            <Link href="/card-battle" className="text-emerald-400 hover:underline">Card Battles</Link>
            <Link href="/grading-game" className="text-emerald-400 hover:underline">Grading Game</Link>
            <Link href="/card-streak" className="text-emerald-400 hover:underline">Card Streak</Link>
            <Link href="/collection-draft" className="text-emerald-400 hover:underline">Collection Draft</Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
