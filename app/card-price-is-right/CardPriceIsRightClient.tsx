'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

/* ── helpers ─────────────────────────────────────────────────────── */

function dateHash(d: Date): number {
  const str = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function seededRng(seed: number) {
  let s = seed || 42;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Parse the low end of estimatedValueRaw like "$500–$2,000 (PSA 8)" → 500 */
function parseValue(raw: string): number {
  const m = raw.match(/\$(\d[\d,]*)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
}

function formatMoney(n: number): string {
  if (n >= 1000) return `$${n.toLocaleString()}`;
  return `$${n}`;
}

const sportColors: Record<string, string> = {
  baseball: 'bg-red-900/40 text-red-400 border-red-800/50',
  basketball: 'bg-orange-900/40 text-orange-400 border-orange-800/50',
  football: 'bg-green-900/40 text-green-400 border-green-800/50',
  hockey: 'bg-blue-900/40 text-blue-400 border-blue-800/50',
};

const sportEmoji: Record<string, string> = {
  baseball: '\u26be', basketball: '\ud83c\udfc0', football: '\ud83c\udfc8', hockey: '\ud83c\udfd2',
};

type Sport = 'all' | 'baseball' | 'basketball' | 'football' | 'hockey';
type GameMode = 'daily' | 'random';

interface RoundResult {
  cardName: string;
  player: string;
  sport: string;
  actualValue: number;
  guess: number;
  points: number;
  verdict: string;
}

const ROUNDS = 10;

/* ── component ───────────────────────────────────────────────────── */

export default function CardPriceIsRightClient() {
  const [mode, setMode] = useState<GameMode>('daily');
  const [sportFilter, setSportFilter] = useState<Sport>('all');
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'result'>('menu');
  const [round, setRound] = useState(0);
  const [guess, setGuess] = useState('');
  const [results, setResults] = useState<RoundResult[]>([]);
  const [showReveal, setShowReveal] = useState(false);
  const [gameCards, setGameCards] = useState<typeof sportsCards>([]);
  const [randomSeed, setRandomSeed] = useState(0);

  // Stats from localStorage
  const [stats, setStats] = useState({ gamesPlayed: 0, highScore: 0, perfectRounds: 0, totalPoints: 0, streak: 0 });

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cv-price-right-stats');
      if (saved) setStats(JSON.parse(saved));
    } catch { /* empty */ }
  }, []);

  const saveStats = useCallback((updated: typeof stats) => {
    setStats(updated);
    try { localStorage.setItem('cv-price-right-stats', JSON.stringify(updated)); } catch { /* empty */ }
  }, []);

  // Filter cards that have a parseable value > 0
  const validCards = useMemo(() => {
    const filtered = sportFilter === 'all' ? sportsCards : sportsCards.filter(c => c.sport === sportFilter);
    return filtered.filter(c => parseValue(c.estimatedValueRaw) > 0);
  }, [sportFilter]);

  const startGame = useCallback(() => {
    const seed = mode === 'daily' ? dateHash(new Date()) + (sportFilter === 'all' ? 0 : sportFilter.charCodeAt(0)) : Date.now();
    setRandomSeed(seed);
    const rng = seededRng(seed);
    const picked = shuffle(validCards, rng).slice(0, ROUNDS);
    setGameCards(picked);
    setRound(0);
    setResults([]);
    setShowReveal(false);
    setGuess('');
    setGameState('playing');
  }, [mode, validCards, sportFilter]);

  const currentCard = gameCards[round];

  const scoreGuess = useCallback((actual: number, g: number): { points: number; verdict: string } => {
    if (g > actual) return { points: 0, verdict: 'BUST' };
    const pct = actual > 0 ? (actual - g) / actual : 1;
    if (pct <= 0.10) return { points: 1000, verdict: 'PERFECT' };
    if (pct <= 0.25) return { points: 750, verdict: 'EXCELLENT' };
    if (pct <= 0.50) return { points: 500, verdict: 'GOOD' };
    return { points: 250, verdict: 'LOW' };
  }, []);

  const submitGuess = useCallback(() => {
    if (!currentCard || showReveal) return;
    const g = Math.max(0, parseInt(guess.replace(/[^0-9]/g, ''), 10) || 0);
    const actual = parseValue(currentCard.estimatedValueRaw);
    const { points, verdict } = scoreGuess(actual, g);
    const result: RoundResult = {
      cardName: currentCard.name,
      player: currentCard.player,
      sport: currentCard.sport,
      actualValue: actual,
      guess: g,
      points,
      verdict,
    };
    setResults(prev => [...prev, result]);
    setShowReveal(true);
  }, [currentCard, guess, showReveal, scoreGuess]);

  const nextRound = useCallback(() => {
    if (round + 1 >= ROUNDS) {
      // Game over
      const totalPts = results.reduce((s, r) => s + r.points, 0);
      const perfects = results.filter(r => r.verdict === 'PERFECT').length;
      const newStats = {
        gamesPlayed: stats.gamesPlayed + 1,
        highScore: Math.max(stats.highScore, totalPts),
        perfectRounds: stats.perfectRounds + perfects,
        totalPoints: stats.totalPoints + totalPts,
        streak: stats.streak + 1,
      };
      saveStats(newStats);
      setGameState('result');
    } else {
      setRound(r => r + 1);
      setGuess('');
      setShowReveal(false);
    }
  }, [round, results, stats, saveStats]);

  const totalScore = results.reduce((s, r) => s + r.points, 0);

  const getGrade = (score: number): { letter: string; label: string; color: string } => {
    if (score >= 9000) return { letter: 'S', label: 'Card Savant', color: 'text-yellow-400' };
    if (score >= 7500) return { letter: 'A', label: 'Price Expert', color: 'text-green-400' };
    if (score >= 6000) return { letter: 'B', label: 'Sharp Eye', color: 'text-blue-400' };
    if (score >= 4000) return { letter: 'C', label: 'Decent Guess', color: 'text-zinc-300' };
    if (score >= 2000) return { letter: 'D', label: 'Needs Practice', color: 'text-orange-400' };
    return { letter: 'F', label: 'Overbidder', color: 'text-red-400' };
  };

  const verdictColor = (v: string) => {
    switch (v) {
      case 'PERFECT': return 'text-yellow-400';
      case 'EXCELLENT': return 'text-green-400';
      case 'GOOD': return 'text-blue-400';
      case 'LOW': return 'text-zinc-400';
      case 'BUST': return 'text-red-400';
      default: return 'text-zinc-400';
    }
  };

  const shareResults = useCallback(() => {
    const grade = getGrade(totalScore);
    const emojis = results.map(r => {
      switch (r.verdict) {
        case 'PERFECT': return '\ud83d\udfe8';  // yellow
        case 'EXCELLENT': return '\ud83d\udfe9'; // green
        case 'GOOD': return '\ud83d\udfe6';      // blue
        case 'LOW': return '\u2b1c';              // white
        case 'BUST': return '\ud83d\udfe5';       // red
        default: return '\u2b1c';
      }
    }).join('');
    const text = `Card Price is Right ${mode === 'daily' ? '(Daily)' : ''}\n${emojis}\nScore: ${totalScore.toLocaleString()}/10,000 (${grade.letter})\nhttps://cardvault-two.vercel.app/card-price-is-right`;
    navigator.clipboard.writeText(text).catch(() => {});
  }, [results, totalScore, mode]);

  /* ── render: menu ─────────────────────────────────────────────── */
  if (gameState === 'menu') {
    return (
      <div className="space-y-6">
        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Games', value: stats.gamesPlayed },
            { label: 'High Score', value: stats.highScore.toLocaleString() },
            { label: 'Perfect Rounds', value: stats.perfectRounds },
            { label: 'Avg Score', value: stats.gamesPlayed > 0 ? Math.round(stats.totalPoints / stats.gamesPlayed).toLocaleString() : '—' },
          ].map(s => (
            <div key={s.label} className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-3 text-center">
              <div className="text-white font-bold text-lg">{s.value}</div>
              <div className="text-zinc-500 text-xs">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Mode select */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-3">Game Mode</h3>
          <div className="flex gap-3">
            <button onClick={() => setMode('daily')} className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${mode === 'daily' ? 'bg-green-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
              Daily Challenge
            </button>
            <button onClick={() => setMode('random')} className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${mode === 'random' ? 'bg-green-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
              Random Cards
            </button>
          </div>
        </div>

        {/* Sport filter */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-3">Sport Filter</h3>
          <div className="flex flex-wrap gap-2">
            {(['all', 'baseball', 'basketball', 'football', 'hockey'] as Sport[]).map(s => (
              <button key={s} onClick={() => setSportFilter(s)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${sportFilter === s ? 'bg-green-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
                {s === 'all' ? 'All Sports' : `${sportEmoji[s]} ${s.charAt(0).toUpperCase() + s.slice(1)}`}
              </button>
            ))}
          </div>
          <p className="text-zinc-500 text-xs mt-2">{validCards.length.toLocaleString()} cards available</p>
        </div>

        {/* Start button */}
        <button onClick={startGame} disabled={validCards.length < ROUNDS} className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold text-lg rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          Start Game ({ROUNDS} Rounds)
        </button>
      </div>
    );
  }

  /* ── render: playing ──────────────────────────────────────────── */
  if (gameState === 'playing' && currentCard) {
    const actual = parseValue(currentCard.estimatedValueRaw);
    return (
      <div className="space-y-5">
        {/* Progress bar */}
        <div className="flex items-center gap-3">
          <span className="text-zinc-500 text-sm font-medium">Round {round + 1}/{ROUNDS}</span>
          <div className="flex-1 bg-zinc-800 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${((round + (showReveal ? 1 : 0)) / ROUNDS) * 100}%` }} />
          </div>
          <span className="text-green-400 font-bold text-sm">{totalScore.toLocaleString()} pts</span>
        </div>

        {/* Card display */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${sportColors[currentCard.sport] || 'bg-zinc-800 text-zinc-400'}`}>
              {sportEmoji[currentCard.sport]} {currentCard.sport.charAt(0).toUpperCase() + currentCard.sport.slice(1)}
            </span>
            {currentCard.rookie && (
              <span className="text-xs font-medium px-2 py-1 bg-yellow-900/40 text-yellow-400 border border-yellow-800/50 rounded-full">RC</span>
            )}
          </div>

          <h2 className="text-xl font-bold text-white mb-1">{currentCard.player}</h2>
          <p className="text-zinc-400 text-sm mb-1">{currentCard.set} &middot; #{currentCard.cardNumber}</p>
          <p className="text-zinc-500 text-xs">{currentCard.year}</p>

          {!showReveal && (
            <div className="mt-6 flex items-center gap-2 text-2xl font-bold text-zinc-600">
              <span>$</span>
              <span>???</span>
            </div>
          )}

          {showReveal && (
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-zinc-500 text-xs">Actual Value</div>
                  <div className="text-white font-bold text-2xl">{formatMoney(actual)}</div>
                  <div className="text-zinc-500 text-xs mt-0.5">{currentCard.estimatedValueRaw}</div>
                </div>
                <div className="text-right">
                  <div className="text-zinc-500 text-xs">Your Guess</div>
                  <div className="text-white font-bold text-2xl">{formatMoney(results[results.length - 1]?.guess || 0)}</div>
                </div>
              </div>
              <div className="flex items-center justify-between bg-zinc-800/60 rounded-lg px-4 py-3">
                <span className={`text-lg font-bold ${verdictColor(results[results.length - 1]?.verdict || '')}`}>
                  {results[results.length - 1]?.verdict}
                </span>
                <span className="text-white font-bold">+{results[results.length - 1]?.points.toLocaleString()} pts</span>
              </div>
              {/* Value comparison bar */}
              {actual > 0 && (
                <div className="relative h-3 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="absolute inset-y-0 left-0 bg-green-600/60 rounded-full" style={{ width: '100%' }} />
                  <div className="absolute inset-y-0 left-0 bg-yellow-500 rounded-full" style={{ width: `${Math.min(100, ((results[results.length - 1]?.guess || 0) / actual) * 100)}%` }} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input area */}
        {!showReveal ? (
          <div className="space-y-3">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-xl font-bold">$</span>
              <input
                type="text"
                inputMode="numeric"
                value={guess}
                onChange={e => setGuess(e.target.value.replace(/[^0-9]/g, ''))}
                onKeyDown={e => { if (e.key === 'Enter') submitGuess(); }}
                placeholder="Your guess..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-10 pr-4 py-4 text-white text-xl font-bold focus:outline-none focus:border-green-500 placeholder:text-zinc-600"
                autoFocus
              />
            </div>
            <button onClick={submitGuess} disabled={!guess} className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Lock In Guess
            </button>
          </div>
        ) : (
          <button onClick={nextRound} className="w-full py-3 bg-zinc-700 hover:bg-zinc-600 text-white font-bold rounded-xl transition-colors">
            {round + 1 >= ROUNDS ? 'See Results' : `Next Card (${round + 2}/${ROUNDS})`}
          </button>
        )}

        {/* Mini results row */}
        {results.length > 0 && (
          <div className="flex gap-1.5 justify-center">
            {results.map((r, i) => (
              <div key={i} className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold ${r.verdict === 'BUST' ? 'bg-red-900/60 text-red-400' : r.verdict === 'PERFECT' ? 'bg-yellow-900/60 text-yellow-400' : r.verdict === 'EXCELLENT' ? 'bg-green-900/60 text-green-400' : r.verdict === 'GOOD' ? 'bg-blue-900/60 text-blue-400' : 'bg-zinc-800 text-zinc-500'}`}>
                {r.verdict === 'BUST' ? 'X' : r.verdict === 'PERFECT' ? '\u2605' : r.verdict === 'EXCELLENT' ? '\u2713' : r.verdict === 'GOOD' ? '\u2713' : '\u25cb'}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ── render: results ──────────────────────────────────────────── */
  if (gameState === 'result') {
    const grade = getGrade(totalScore);
    const busts = results.filter(r => r.verdict === 'BUST').length;
    const perfects = results.filter(r => r.verdict === 'PERFECT').length;

    return (
      <div className="space-y-5">
        {/* Score header */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 text-center">
          <div className={`text-6xl font-black ${grade.color}`}>{grade.letter}</div>
          <div className="text-zinc-400 text-sm mt-1">{grade.label}</div>
          <div className="text-white text-3xl font-bold mt-3">{totalScore.toLocaleString()}<span className="text-zinc-500 text-lg"> / 10,000</span></div>
          <div className="flex justify-center gap-4 mt-3 text-sm">
            <span className="text-yellow-400">{perfects} Perfect</span>
            <span className="text-red-400">{busts} Bust{busts !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Round-by-round */}
        <div className="space-y-2">
          {results.map((r, i) => (
            <div key={i} className="bg-zinc-900/60 border border-zinc-800 rounded-lg px-4 py-3 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-medium truncate">{r.player}</div>
                <div className="text-zinc-500 text-xs truncate">{r.cardName}</div>
              </div>
              <div className="flex items-center gap-3 text-right">
                <div>
                  <div className="text-zinc-400 text-xs">Actual</div>
                  <div className="text-white text-sm font-medium">{formatMoney(r.actualValue)}</div>
                </div>
                <div>
                  <div className="text-zinc-400 text-xs">Guess</div>
                  <div className={`text-sm font-medium ${r.verdict === 'BUST' ? 'text-red-400' : 'text-white'}`}>{formatMoney(r.guess)}</div>
                </div>
                <div className={`text-xs font-bold px-2 py-1 rounded ${r.verdict === 'BUST' ? 'bg-red-900/60 text-red-400' : r.verdict === 'PERFECT' ? 'bg-yellow-900/60 text-yellow-400' : 'bg-zinc-800 text-zinc-300'}`}>
                  +{r.points}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={shareResults} className="flex-1 py-3 bg-zinc-700 hover:bg-zinc-600 text-white font-medium rounded-xl transition-colors text-sm">
            Copy Results
          </button>
          <button onClick={() => setGameState('menu')} className="flex-1 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-colors text-sm">
            Play Again
          </button>
        </div>

        {/* High score */}
        {totalScore >= stats.highScore && totalScore > 0 && (
          <div className="text-center text-yellow-400 text-sm font-medium animate-pulse">
            New High Score!
          </div>
        )}
      </div>
    );
  }

  return null;
}
