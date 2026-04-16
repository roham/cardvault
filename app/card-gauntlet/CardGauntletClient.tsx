'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

/* ─── Types ────────────────────────────────────────── */
type GameState = 'menu' | 'playing' | 'bonus' | 'over';
type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Expert' | 'Legendary';

interface GCard {
  slug: string;
  name: string;
  player: string;
  sport: string;
  year: number;
  value: number;
  rookie: boolean;
}

interface GauntletStats {
  gamesPlayed: number;
  bestRound: number;
  bestScore: number;
  totalCorrect: number;
  longestStreak: number;
}

/* ─── Helpers ──────────────────────────────────────── */
function seededRng(seed: number): () => number {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
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

function getDifficulty(round: number): { diff: Difficulty; color: string; tierDesc: string } {
  if (round <= 10) return { diff: 'Easy', color: 'text-green-400', tierDesc: 'Wide value gaps' };
  if (round <= 20) return { diff: 'Medium', color: 'text-yellow-400', tierDesc: 'Moderate gaps' };
  if (round <= 35) return { diff: 'Hard', color: 'text-orange-400', tierDesc: 'Close values' };
  if (round <= 50) return { diff: 'Expert', color: 'text-red-400', tierDesc: 'Very close values' };
  return { diff: 'Legendary', color: 'text-purple-400', tierDesc: 'Near-identical values' };
}

function getGrade(round: number): { grade: string; color: string } {
  if (round >= 50) return { grade: 'S', color: 'text-yellow-400' };
  if (round >= 35) return { grade: 'A', color: 'text-green-400' };
  if (round >= 20) return { grade: 'B', color: 'text-blue-400' };
  if (round >= 10) return { grade: 'C', color: 'text-purple-400' };
  if (round >= 5) return { grade: 'D', color: 'text-gray-400' };
  return { grade: 'F', color: 'text-red-400' };
}

const sportEmoji: Record<string, string> = {
  baseball: '\u26be', basketball: '\ud83c\udfc0', football: '\ud83c\udfc8', hockey: '\ud83c\udfd2',
};

const sportColor: Record<string, string> = {
  baseball: 'border-red-600/50 bg-red-950/30',
  basketball: 'border-orange-600/50 bg-orange-950/30',
  football: 'border-blue-600/50 bg-blue-950/30',
  hockey: 'border-cyan-600/50 bg-cyan-950/30',
};

const STATS_KEY = 'cv-card-gauntlet-stats';

/* ─── Component ────────────────────────────────────── */
export default function CardGauntletClient() {
  const allCards = useMemo<GCard[]>(() =>
    sportsCards.map(c => ({
      slug: c.slug,
      name: c.name,
      player: c.player,
      sport: c.sport,
      year: c.year,
      value: parseValue(c.estimatedValueRaw),
      rookie: c.rookie,
    })).filter(c => c.value > 0),
  []);

  const [mode, setMode] = useState<'daily' | 'random'>('daily');
  const [state, setState] = useState<GameState>('menu');
  const [round, setRound] = useState(1);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [pair, setPair] = useState<[GCard, GCard] | null>(null);
  const [chosen, setChosen] = useState<number | null>(null);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [bonusCards, setBonusCards] = useState<GCard[]>([]);
  const [bonusPick, setBonusPick] = useState<number | null>(null);
  const [history, setHistory] = useState<{ round: number; correct: boolean; card1: string; card2: string }[]>([]);
  const [rngFn, setRngFn] = useState<() => number>(() => seededRng(dateHash()));
  const [stats, setStats] = useState<GauntletStats>({ gamesPlayed: 0, bestRound: 0, bestScore: 0, totalCorrect: 0, longestStreak: 0 });
  const [cardPool, setCardPool] = useState<GCard[]>([]);
  const [poolIdx, setPoolIdx] = useState(0);
  const [sportFilter, setSportFilter] = useState<string>('all');

  useEffect(() => {
    try {
      const s = localStorage.getItem(STATS_KEY);
      if (s) setStats(JSON.parse(s));
    } catch {}
  }, []);

  const saveStats = useCallback((s: GauntletStats) => {
    setStats(s);
    try { localStorage.setItem(STATS_KEY, JSON.stringify(s)); } catch {}
  }, []);

  const startGame = useCallback((m: 'daily' | 'random') => {
    setMode(m);
    const seed = m === 'daily' ? dateHash() + 7777 : Math.floor(Math.random() * 999999);
    const rng = seededRng(seed);
    setRngFn(() => rng);

    const filtered = sportFilter === 'all' ? allCards : allCards.filter(c => c.sport === sportFilter);
    const shuffled = shuffle(filtered.length > 200 ? filtered : allCards, rng);
    setCardPool(shuffled);
    setPoolIdx(0);

    setState('playing');
    setRound(1);
    setLives(3);
    setScore(0);
    setStreak(0);
    setChosen(null);
    setCorrect(null);
    setBonusCards([]);
    setBonusPick(null);
    setHistory([]);

    // Set first pair
    const diff = getDifficulty(1);
    const p = pickPair(shuffled, 0, diff.diff, rng);
    setPair(p.pair);
    setPoolIdx(p.nextIdx);
  }, [allCards, sportFilter]);

  function pickPair(pool: GCard[], idx: number, diff: Difficulty, rng: () => number): { pair: [GCard, GCard]; nextIdx: number } {
    // Get next cards from pool, cycling if needed
    const getCard = (i: number) => pool[i % pool.length];
    let c1 = getCard(idx);
    let c2 = getCard(idx + 1);
    let nextIdx = idx + 2;

    // Adjust difficulty by finding pairs with appropriate value gaps
    if (diff !== 'Easy') {
      const candidates: GCard[] = [];
      for (let i = 0; i < Math.min(40, pool.length); i++) {
        candidates.push(getCard(idx + i));
      }
      nextIdx = idx + 40;

      // Sort by value and find pairs with the right gap
      candidates.sort((a, b) => a.value - b.value);

      let bestPair: [GCard, GCard] | null = null;
      let bestDelta = Infinity;

      const targetGap = diff === 'Medium' ? 50 : diff === 'Hard' ? 20 : diff === 'Expert' ? 8 : 3;

      for (let i = 0; i < candidates.length - 1; i++) {
        const gap = Math.abs(candidates[i].value - candidates[i + 1].value);
        const delta = Math.abs(gap - targetGap);
        if (delta < bestDelta && candidates[i].slug !== candidates[i + 1].slug) {
          bestDelta = delta;
          bestPair = [candidates[i], candidates[i + 1]];
        }
      }
      if (bestPair) {
        // Randomize order so the higher value isn't always on one side
        if (rng() > 0.5) bestPair = [bestPair[1], bestPair[0]];
        return { pair: bestPair, nextIdx };
      }
    }

    // Ensure different cards
    if (c1.slug === c2.slug) { c2 = getCard(idx + 2); nextIdx = idx + 3; }
    return { pair: [c1, c2], nextIdx };
  }

  const handlePick = useCallback((idx: 0 | 1) => {
    if (!pair || chosen !== null) return;
    setChosen(idx);

    const picked = pair[idx];
    const other = pair[1 - idx];
    const isCorrect = picked.value >= other.value;
    setCorrect(isCorrect);

    setHistory(prev => [...prev, {
      round,
      correct: isCorrect,
      card1: pair[0].name,
      card2: pair[1].name,
    }]);

    const streakMultiplier = streak >= 15 ? 4 : streak >= 10 ? 3 : streak >= 5 ? 2 : 1;

    if (isCorrect) {
      const pts = 100 * streakMultiplier;
      setScore(prev => prev + pts);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
      setLives(prev => prev - 1);
    }

    // After 1.2s, advance
    setTimeout(() => {
      const newLives = isCorrect ? lives : lives - 1;
      if (newLives <= 0) {
        // Game over
        const finalRound = round;
        const finalScore = isCorrect ? score + 100 * streakMultiplier : score;
        const finalStreak = isCorrect ? streak + 1 : 0;
        setState('over');
        saveStats({
          gamesPlayed: stats.gamesPlayed + 1,
          bestRound: Math.max(stats.bestRound, finalRound),
          bestScore: Math.max(stats.bestScore, finalScore),
          totalCorrect: stats.totalCorrect + history.filter(h => h.correct).length + (isCorrect ? 1 : 0),
          longestStreak: Math.max(stats.longestStreak, isCorrect ? streak + 1 : stats.longestStreak),
        });
        return;
      }

      const nextRound = round + 1;

      // Bonus round every 10 rounds
      if (nextRound % 10 === 1 && nextRound > 1) {
        const bCards: GCard[] = [];
        for (let i = 0; i < 3; i++) {
          bCards.push(cardPool[(poolIdx + i) % cardPool.length]);
        }
        setBonusCards(bCards);
        setBonusPick(null);
        setState('bonus');
        setRound(nextRound);
        setChosen(null);
        setCorrect(null);
        setPoolIdx(prev => prev + 3);
        return;
      }

      setRound(nextRound);
      setChosen(null);
      setCorrect(null);

      const diff = getDifficulty(nextRound);
      const p = pickPair(cardPool, poolIdx, diff.diff, rngFn);
      setPair(p.pair);
      setPoolIdx(p.nextIdx);
    }, 1200);
  }, [pair, chosen, round, lives, score, streak, history, cardPool, poolIdx, rngFn, stats, saveStats]);

  const handleBonusPick = useCallback((idx: number) => {
    if (bonusPick !== null) return;
    setBonusPick(idx);
    const picked = bonusCards[idx];
    const bonus = Math.min(500, Math.max(50, Math.floor(picked.value / 2)));
    setScore(prev => prev + bonus);

    setTimeout(() => {
      setState('playing');
      setChosen(null);
      setCorrect(null);
      const diff = getDifficulty(round);
      const p = pickPair(cardPool, poolIdx, diff.diff, rngFn);
      setPair(p.pair);
      setPoolIdx(p.nextIdx);
    }, 1500);
  }, [bonusCards, bonusPick, round, cardPool, poolIdx, rngFn]);

  const shareResult = useCallback(() => {
    const { grade } = getGrade(round);
    const hearts = '\u2764\ufe0f'.repeat(lives) + '\ud83d\udc94'.repeat(3 - lives);
    const text = `Card Gauntlet ${mode === 'daily' ? 'Daily' : 'Random'}\nRound ${round} | Grade: ${grade} | Score: ${score.toLocaleString()}\n${hearts}\n${history.slice(-10).map(h => h.correct ? '\u2705' : '\u274c').join('')}\nhttps://cardvault-two.vercel.app/card-gauntlet`;
    navigator.clipboard.writeText(text).catch(() => {});
  }, [round, lives, score, mode, history]);

  /* ─── Render: Menu ─── */
  if (state === 'menu') {
    return (
      <div className="space-y-6">
        {/* Sport Filter */}
        <div className="flex flex-wrap gap-2">
          {['all', 'baseball', 'basketball', 'football', 'hockey'].map(s => (
            <button key={s} onClick={() => setSportFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${sportFilter === s
                ? 'bg-rose-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'}`}>
              {s === 'all' ? 'All Sports' : `${sportEmoji[s] || ''} ${s.charAt(0).toUpperCase() + s.slice(1)}`}
            </button>
          ))}
        </div>

        {/* Mode Selection */}
        <div className="grid sm:grid-cols-2 gap-4">
          <button onClick={() => startGame('daily')}
            className="bg-gradient-to-br from-rose-900/50 to-rose-800/30 border border-rose-700/40 rounded-xl p-6 text-left hover:border-rose-500/60 transition-colors group">
            <div className="text-2xl mb-2">&#x1F525;</div>
            <h3 className="text-lg font-bold text-white group-hover:text-rose-300">Daily Gauntlet</h3>
            <p className="text-sm text-gray-400 mt-1">Same sequence for everyone today. Compare scores with friends.</p>
          </button>
          <button onClick={() => startGame('random')}
            className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 border border-gray-600/40 rounded-xl p-6 text-left hover:border-gray-500/60 transition-colors group">
            <div className="text-2xl mb-2">&#x1F3B2;</div>
            <h3 className="text-lg font-bold text-white group-hover:text-gray-300">Random Gauntlet</h3>
            <p className="text-sm text-gray-400 mt-1">Fresh sequence each time. Practice your card knowledge.</p>
          </button>
        </div>

        {/* How It Works */}
        <div className="bg-gray-800/40 border border-gray-700/40 rounded-xl p-5">
          <h3 className="font-bold text-white mb-3">How It Works</h3>
          <div className="grid sm:grid-cols-2 gap-3 text-sm text-gray-400">
            <div className="flex gap-2"><span className="text-rose-400 font-bold">1.</span> Two cards appear &mdash; pick the more valuable one</div>
            <div className="flex gap-2"><span className="text-rose-400 font-bold">2.</span> Correct picks score points with streak multipliers</div>
            <div className="flex gap-2"><span className="text-rose-400 font-bold">3.</span> Wrong picks cost a life &mdash; you start with 3 lives</div>
            <div className="flex gap-2"><span className="text-rose-400 font-bold">4.</span> Every 10 rounds &mdash; bonus round to earn extra points</div>
            <div className="flex gap-2"><span className="text-rose-400 font-bold">5.</span> Difficulty increases: Easy &rarr; Medium &rarr; Hard &rarr; Expert &rarr; Legendary</div>
            <div className="flex gap-2"><span className="text-rose-400 font-bold">6.</span> Survive as long as you can &mdash; how far can you go?</div>
          </div>
        </div>

        {/* Stats */}
        {stats.gamesPlayed > 0 && (
          <div className="bg-gray-800/40 border border-gray-700/40 rounded-xl p-5">
            <h3 className="font-bold text-white mb-3">Your Stats</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
              <div>
                <div className="text-2xl font-black text-white">{stats.gamesPlayed}</div>
                <div className="text-xs text-gray-500">Games</div>
              </div>
              <div>
                <div className="text-2xl font-black text-rose-400">{stats.bestRound}</div>
                <div className="text-xs text-gray-500">Best Round</div>
              </div>
              <div>
                <div className="text-2xl font-black text-yellow-400">{stats.bestScore.toLocaleString()}</div>
                <div className="text-xs text-gray-500">Best Score</div>
              </div>
              <div>
                <div className="text-2xl font-black text-green-400">{stats.totalCorrect}</div>
                <div className="text-xs text-gray-500">Total Correct</div>
              </div>
              <div>
                <div className="text-2xl font-black text-purple-400">{stats.longestStreak}</div>
                <div className="text-xs text-gray-500">Best Streak</div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ─── Render: Bonus Round ─── */
  if (state === 'bonus') {
    return (
      <div className="space-y-6">
        {/* HUD */}
        <div className="flex items-center justify-between bg-gray-800/50 border border-gray-700/40 rounded-xl px-4 py-3">
          <div className="flex gap-1 text-xl">{Array.from({ length: 3 }, (_, i) => <span key={i}>{i < lives ? '\u2764\ufe0f' : '\ud83d\udc94'}</span>)}</div>
          <div className="text-sm text-gray-400">Round <span className="text-white font-bold">{round}</span></div>
          <div className="text-sm text-gray-400">Score <span className="text-yellow-400 font-bold">{score.toLocaleString()}</span></div>
        </div>

        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-yellow-950/60 border border-yellow-700/40 text-yellow-400 text-sm font-bold px-4 py-2 rounded-full mb-4">
            &#x2B50; BONUS ROUND &#x2B50;
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Pick a card for bonus points!</h2>
          <p className="text-gray-400 text-sm">Higher value = more bonus points (up to 500)</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {bonusCards.map((card, i) => {
            const revealed = bonusPick !== null;
            const isPicked = bonusPick === i;
            const isHighest = revealed && card.value === Math.max(...bonusCards.map(c => c.value));
            return (
              <button key={i} onClick={() => handleBonusPick(i)} disabled={revealed}
                className={`relative p-5 rounded-xl border-2 transition-all text-left ${
                  revealed
                    ? isPicked
                      ? 'border-yellow-500 bg-yellow-950/40 shadow-lg shadow-yellow-500/10'
                      : isHighest
                        ? 'border-green-600/50 bg-green-950/20'
                        : 'border-gray-700/30 bg-gray-900/30 opacity-60'
                    : 'border-gray-600/50 bg-gray-800/40 hover:border-yellow-500/60 hover:bg-gray-800/60 cursor-pointer'
                }`}>
                {!revealed && <div className="text-3xl mb-3">&#x2753;</div>}
                {revealed && (
                  <>
                    <div className="text-xs text-gray-500 mb-1">{sportEmoji[card.sport] || ''} {card.sport}</div>
                    <div className="font-bold text-white text-sm mb-1">{card.player}</div>
                    <div className="text-xs text-gray-400 mb-2">{card.name}</div>
                    <div className="text-lg font-black text-yellow-400">{formatMoney(card.value)}</div>
                    {isPicked && <div className="mt-2 text-sm text-yellow-300">+{Math.min(500, Math.max(50, Math.floor(card.value / 2)))} pts</div>}
                  </>
                )}
                {!revealed && (
                  <div className="font-bold text-gray-300">Card {i + 1}</div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  /* ─── Render: Game Over ─── */
  if (state === 'over') {
    const { grade, color } = getGrade(round);
    const correctCount = history.filter(h => h.correct).length;
    const accuracy = history.length > 0 ? Math.round((correctCount / history.length) * 100) : 0;
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="text-6xl font-black mb-2">
            <span className={color}>{grade}</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">Game Over</h2>
          <p className="text-gray-400">You survived {round} round{round !== 1 ? 's' : ''}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 border border-gray-700/40 rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-white">{round}</div>
            <div className="text-xs text-gray-500">Rounds</div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700/40 rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-yellow-400">{score.toLocaleString()}</div>
            <div className="text-xs text-gray-500">Score</div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700/40 rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-green-400">{accuracy}%</div>
            <div className="text-xs text-gray-500">Accuracy</div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700/40 rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-purple-400">{Math.max(streak, ...history.reduce((acc, h) => {
              if (h.correct) { acc[acc.length - 1]++; } else { acc.push(0); }
              return acc;
            }, [0]))}</div>
            <div className="text-xs text-gray-500">Best Streak</div>
          </div>
        </div>

        {/* Recent History */}
        <div className="bg-gray-800/40 border border-gray-700/40 rounded-xl p-4">
          <h3 className="font-bold text-white text-sm mb-3">Round History (last 15)</h3>
          <div className="flex flex-wrap gap-1">
            {history.slice(-15).map((h, i) => (
              <div key={i} className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold ${h.correct ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                {h.correct ? '\u2713' : '\u2717'}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button onClick={shareResult}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg transition-colors">
            Share Result
          </button>
          <button onClick={() => startGame(mode)}
            className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-colors">
            Play Again
          </button>
          <button onClick={() => setState('menu')}
            className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold rounded-lg transition-colors">
            Menu
          </button>
        </div>
      </div>
    );
  }

  /* ─── Render: Playing ─── */
  const { diff, color: diffColor, tierDesc } = getDifficulty(round);
  const streakMultiplier = streak >= 15 ? 4 : streak >= 10 ? 3 : streak >= 5 ? 2 : 1;

  return (
    <div className="space-y-5">
      {/* HUD */}
      <div className="flex items-center justify-between bg-gray-800/50 border border-gray-700/40 rounded-xl px-4 py-3">
        <div className="flex gap-1 text-xl">{Array.from({ length: 3 }, (_, i) => <span key={i}>{i < lives ? '\u2764\ufe0f' : '\ud83d\udc94'}</span>)}</div>
        <div className="text-center">
          <div className="text-xs text-gray-500">Round</div>
          <div className="text-lg font-black text-white">{round}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500">Streak</div>
          <div className={`text-lg font-black ${streak >= 5 ? 'text-yellow-400' : 'text-white'}`}>{streak}{streakMultiplier > 1 && <span className="text-xs text-yellow-500 ml-1">{streakMultiplier}x</span>}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500">Score</div>
          <div className="text-lg font-black text-yellow-400">{score.toLocaleString()}</div>
        </div>
      </div>

      {/* Difficulty Indicator */}
      <div className="flex items-center justify-between text-sm">
        <span className={`font-bold ${diffColor}`}>{diff}</span>
        <span className="text-gray-500">{tierDesc}</span>
        {round % 10 >= 7 && round % 10 !== 0 && <span className="text-yellow-500 text-xs animate-pulse">Bonus in {10 - (round % 10)} rounds</span>}
      </div>

      {/* Question */}
      <div className="text-center mb-2">
        <h2 className="text-lg font-bold text-white">Which card is worth more?</h2>
      </div>

      {/* Card Pair */}
      {pair && (
        <div className="grid sm:grid-cols-2 gap-4">
          {pair.map((card, i) => {
            const isChosen = chosen === i;
            const isOther = chosen !== null && chosen !== i;
            const showResult = chosen !== null;
            const isWinner = showResult && card.value >= pair[1 - i].value;
            const sc = sportColor[card.sport] || 'border-gray-600/50 bg-gray-800/30';

            return (
              <button key={i} onClick={() => handlePick(i as 0 | 1)} disabled={chosen !== null}
                className={`relative p-5 sm:p-6 rounded-xl border-2 transition-all text-left ${
                  showResult
                    ? isWinner
                      ? 'border-green-500 bg-green-950/30 shadow-lg shadow-green-500/10'
                      : 'border-red-500/50 bg-red-950/20 opacity-70'
                    : `${sc} hover:scale-[1.02] active:scale-[0.98] cursor-pointer`
                }`}>
                {/* Sport badge */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{sportEmoji[card.sport] || ''}</span>
                  <span className="text-xs text-gray-400 uppercase tracking-wide">{card.sport}</span>
                  {card.rookie && <span className="text-[10px] bg-yellow-600/30 text-yellow-400 px-1.5 py-0.5 rounded">RC</span>}
                </div>

                <h3 className="font-bold text-white text-lg mb-1">{card.player}</h3>
                <p className="text-xs text-gray-400 mb-3">{card.name}</p>

                {/* Value reveal */}
                {showResult ? (
                  <div className={`text-2xl font-black ${isWinner ? 'text-green-400' : 'text-red-400'}`}>
                    {formatMoney(card.value)}
                    {isChosen && (
                      <span className={`ml-2 text-sm ${correct ? 'text-green-400' : 'text-red-400'}`}>
                        {correct ? '\u2713 Correct!' : '\u2717 Wrong'}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="text-2xl font-black text-gray-500">???</div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Mini History */}
      {history.length > 0 && (
        <div className="flex items-center gap-1 justify-center">
          {history.slice(-20).map((h, i) => (
            <div key={i} className={`w-3 h-3 rounded-full ${h.correct ? 'bg-green-500' : 'bg-red-500'}`} />
          ))}
        </div>
      )}
    </div>
  );
}
