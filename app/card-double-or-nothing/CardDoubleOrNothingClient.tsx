'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

// --- Types ---
interface RunHistory {
  cardsRevealed: number;
  finalScore: number;
  cashedOut: boolean;
  grade: string;
  date: string;
}

interface GameStats {
  gamesPlayed: number;
  bestScore: number;
  bestStreak: number;
  totalCashedOut: number;
  totalBusted: number;
}

type GamePhase = 'ready' | 'playing' | 'result';

// --- Helpers ---
function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
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

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getGrade(score: number): { grade: string; label: string; color: string } {
  if (score >= 25600) return { grade: 'S', label: 'Legendary', color: 'text-yellow-400' };
  if (score >= 12800) return { grade: 'A+', label: 'Elite', color: 'text-purple-400' };
  if (score >= 6400) return { grade: 'A', label: 'Excellent', color: 'text-green-400' };
  if (score >= 3200) return { grade: 'B+', label: 'Great', color: 'text-blue-400' };
  if (score >= 1600) return { grade: 'B', label: 'Good', color: 'text-cyan-400' };
  if (score >= 800) return { grade: 'C', label: 'Decent', color: 'text-gray-300' };
  if (score >= 400) return { grade: 'D', label: 'Cautious', color: 'text-orange-400' };
  return { grade: 'F', label: 'Busted', color: 'text-red-400' };
}

const sportColors: Record<string, string> = {
  baseball: 'text-red-400',
  basketball: 'text-orange-400',
  football: 'text-blue-400',
  hockey: 'text-cyan-400',
};

const sportBg: Record<string, string> = {
  baseball: 'bg-red-950/40 border-red-800/40',
  basketball: 'bg-orange-950/40 border-orange-800/40',
  football: 'bg-blue-950/40 border-blue-800/40',
  hockey: 'bg-cyan-950/40 border-cyan-800/40',
};

const sportIcons: Record<string, string> = {
  baseball: '\u26be',
  basketball: '\ud83c\udfc0',
  football: '\ud83c\udfc8',
  hockey: '\ud83c\udfd2',
};

const DECK_SIZE = 12;
const START_SCORE = 100;

export default function CardDoubleOrNothingClient() {
  const [mode, setMode] = useState<'daily' | 'random'>('daily');
  const [phase, setPhase] = useState<GamePhase>('ready');
  const [deck, setDeck] = useState<typeof sportsCards[0][]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(START_SCORE);
  const [streak, setStreak] = useState(0);
  const [cashedOut, setCashedOut] = useState(false);
  const [revealing, setRevealing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [stats, setStats] = useState<GameStats>({ gamesPlayed: 0, bestScore: 0, bestStreak: 0, totalCashedOut: 0, totalBusted: 0 });
  const [dailyPlayed, setDailyPlayed] = useState(false);
  const [history, setHistory] = useState<RunHistory[]>([]);

  // Load stats
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cardvault-double-or-nothing-stats');
      if (saved) setStats(JSON.parse(saved));
      const h = localStorage.getItem('cardvault-double-or-nothing-history');
      if (h) setHistory(JSON.parse(h));
      const dp = localStorage.getItem('cardvault-double-or-nothing-daily');
      if (dp === String(dateHash())) setDailyPlayed(true);
    } catch {}
  }, []);

  const buildDeck = useCallback((isDaily: boolean) => {
    const seed = isDaily ? dateHash() * 7919 : Date.now();
    const rng = seededRng(seed);
    const cards = shuffle([...sportsCards], rng).slice(0, DECK_SIZE);
    return cards;
  }, []);

  const startGame = useCallback((gameMode: 'daily' | 'random') => {
    if (gameMode === 'daily' && dailyPlayed) return;
    setMode(gameMode);
    const newDeck = buildDeck(gameMode === 'daily');
    setDeck(newDeck);
    setCurrentIndex(0);
    setScore(START_SCORE);
    setStreak(0);
    setCashedOut(false);
    setRevealing(false);
    setShowResult(false);
    setPhase('playing');
  }, [buildDeck, dailyPlayed]);

  const currentCard = deck[currentIndex];
  const nextCard = deck[currentIndex + 1];
  const currentValue = currentCard ? parseValue(currentCard.estimatedValueRaw) : 0;
  const nextValue = nextCard ? parseValue(nextCard.estimatedValueRaw) : 0;

  const endGame = useCallback((finalScore: number, didCashOut: boolean, streakLen: number) => {
    const gradeInfo = getGrade(finalScore);
    const newStats: GameStats = {
      gamesPlayed: stats.gamesPlayed + 1,
      bestScore: Math.max(stats.bestScore, finalScore),
      bestStreak: Math.max(stats.bestStreak, streakLen),
      totalCashedOut: stats.totalCashedOut + (didCashOut ? 1 : 0),
      totalBusted: stats.totalBusted + (didCashOut ? 0 : 1),
    };
    setStats(newStats);
    localStorage.setItem('cardvault-double-or-nothing-stats', JSON.stringify(newStats));

    const entry: RunHistory = {
      cardsRevealed: streakLen + 1,
      finalScore,
      cashedOut: didCashOut,
      grade: gradeInfo.grade,
      date: new Date().toLocaleDateString(),
    };
    const newHistory = [entry, ...history].slice(0, 20);
    setHistory(newHistory);
    localStorage.setItem('cardvault-double-or-nothing-history', JSON.stringify(newHistory));

    if (mode === 'daily') {
      setDailyPlayed(true);
      localStorage.setItem('cardvault-double-or-nothing-daily', String(dateHash()));
    }

    setPhase('result');
  }, [stats, history, mode]);

  const handleDouble = useCallback(() => {
    if (revealing || !nextCard) return;
    setRevealing(true);

    setTimeout(() => {
      if (nextValue > currentValue) {
        // WIN — score doubles
        const newScore = score * 2;
        const newStreak = streak + 1;
        setScore(newScore);
        setStreak(newStreak);
        setCurrentIndex(prev => prev + 1);
        setRevealing(false);

        // Check if we've exhausted the deck
        if (currentIndex + 2 >= deck.length) {
          endGame(newScore, true, newStreak);
        }
      } else if (nextValue === currentValue) {
        // TIE — push, move forward, keep score
        setCurrentIndex(prev => prev + 1);
        setRevealing(false);

        if (currentIndex + 2 >= deck.length) {
          endGame(score, true, streak);
        }
      } else {
        // BUST — lose everything
        setScore(0);
        setShowResult(true);
        setTimeout(() => {
          endGame(0, false, streak);
        }, 1500);
      }
    }, 800);
  }, [revealing, nextCard, nextValue, currentValue, score, streak, currentIndex, deck.length, endGame]);

  const handleCashOut = useCallback(() => {
    if (revealing) return;
    setCashedOut(true);
    endGame(score, true, streak);
  }, [revealing, score, streak, endGame]);

  const gradeInfo = useMemo(() => getGrade(score), [score]);

  const shareText = useMemo(() => {
    if (phase !== 'result') return '';
    const g = getGrade(cashedOut ? score : 0);
    const lines = [
      `Card Double or Nothing ${mode === 'daily' ? '(Daily)' : '(Random)'}`,
      `${cashedOut ? 'Cashed out' : 'Busted'} after ${streak + 1} card${streak === 0 ? '' : 's'}`,
      `Score: ${cashedOut ? score.toLocaleString() : '0'} | Grade: ${g.grade}`,
      '',
      Array.from({ length: Math.min(streak + 1, 10) }, (_, i) => i < streak ? (cashedOut || i < streak ? '\u2705' : '\u274c') : (cashedOut ? '\ud83d\udcb0' : '\ud83d\udca5')).join(''),
      '',
      'cardvault-two.vercel.app/card-double-or-nothing',
    ];
    return lines.join('\n');
  }, [phase, cashedOut, score, streak, mode]);

  const copyResults = useCallback(() => {
    navigator.clipboard.writeText(shareText);
  }, [shareText]);

  // --- RENDER ---
  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Games', value: stats.gamesPlayed },
          { label: 'Best Score', value: stats.bestScore.toLocaleString() },
          { label: 'Best Streak', value: `${stats.bestStreak}x` },
          { label: 'Cash Outs', value: stats.totalCashedOut },
          { label: 'Busts', value: stats.totalBusted },
        ].map(s => (
          <div key={s.label} className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500">{s.label}</div>
            <div className="text-lg font-bold text-white">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Mode Selector */}
      {phase === 'ready' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => startGame('daily')}
              disabled={dailyPlayed}
              className={`p-6 rounded-xl border text-center transition-all ${
                dailyPlayed
                  ? 'bg-gray-800/30 border-gray-700/30 text-gray-600 cursor-not-allowed'
                  : 'bg-amber-950/40 border-amber-800/40 hover:border-amber-600/60 text-white cursor-pointer'
              }`}
            >
              <div className="text-2xl mb-2">{dailyPlayed ? '\u2705' : '\ud83d\udcc5'}</div>
              <div className="font-bold">{dailyPlayed ? 'Played Today' : 'Daily Challenge'}</div>
              <div className="text-xs text-gray-400 mt-1">Same deck for everyone</div>
            </button>
            <button
              onClick={() => startGame('random')}
              className="p-6 rounded-xl border bg-green-950/40 border-green-800/40 hover:border-green-600/60 text-white text-center transition-all cursor-pointer"
            >
              <div className="text-2xl mb-2">{'\ud83c\udfb2'}</div>
              <div className="font-bold">Random</div>
              <div className="text-xs text-gray-400 mt-1">Fresh deck every time</div>
            </button>
          </div>

          {/* How to Play */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">How to Play</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { step: '1', title: 'See Your Card', desc: 'A sports card is revealed with its market value. This is your starting point.' },
                { step: '2', title: 'Double or Cash Out', desc: 'DOUBLE to flip the next card. If it is worth MORE, your score doubles. If LESS, you bust and lose everything.' },
                { step: '3', title: 'Push Your Luck', desc: 'Keep doubling for bigger scores, or cash out to lock in your points. Ties are a free pass.' },
                { step: '4', title: 'Chase the Grade', desc: 'Score 100 to start. Perfect run of 8 doubles = 25,600 points and an S grade. How far will you push it?' },
              ].map(s => (
                <div key={s.step} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-900/60 border border-green-700/50 flex items-center justify-center text-green-400 text-sm font-bold shrink-0">{s.step}</div>
                  <div>
                    <div className="font-semibold text-white text-sm">{s.title}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-3">Recent Runs</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {history.slice(0, 10).map((h, i) => {
                  const g = getGrade(h.finalScore);
                  return (
                    <div key={i} className="flex items-center justify-between text-sm bg-gray-900/50 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${g.color}`}>{h.grade}</span>
                        <span className="text-gray-400">{h.cardsRevealed} cards</span>
                        <span className={h.cashedOut ? 'text-green-400' : 'text-red-400'}>
                          {h.cashedOut ? 'Cashed Out' : 'Busted'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-white font-medium">{h.finalScore.toLocaleString()} pts</span>
                        <span className="text-gray-600 text-xs">{h.date}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Game Play */}
      {phase === 'playing' && currentCard && (
        <div className="space-y-6">
          {/* Score & Streak Bar */}
          <div className="flex items-center justify-between bg-gray-800/60 border border-gray-700/50 rounded-xl p-4">
            <div>
              <div className="text-xs text-gray-500">Score</div>
              <div className={`text-3xl font-black ${score >= 6400 ? 'text-yellow-400' : score >= 1600 ? 'text-green-400' : 'text-white'}`}>
                {score.toLocaleString()}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500">Streak</div>
              <div className="text-2xl font-bold text-amber-400">{streak}x</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500">Cards Left</div>
              <div className="text-2xl font-bold text-gray-300">{deck.length - currentIndex - 1}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Grade</div>
              <div className={`text-2xl font-bold ${gradeInfo.color}`}>{gradeInfo.grade}</div>
            </div>
          </div>

          {/* Multiplier Progress */}
          <div className="flex items-center gap-1">
            {Array.from({ length: DECK_SIZE - 1 }, (_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full transition-all ${
                  i < streak ? 'bg-green-500' : i === streak ? (revealing ? 'bg-amber-500 animate-pulse' : 'bg-amber-800') : 'bg-gray-700'
                }`}
              />
            ))}
          </div>

          {/* Card Display */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 justify-center">
            {/* Current Card */}
            <div className={`w-full sm:w-72 border rounded-xl p-5 ${sportBg[currentCard.sport] || 'bg-gray-800/50 border-gray-700/50'}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-400">Current Card</span>
                <span className={`text-sm ${sportColors[currentCard.sport] || 'text-gray-400'}`}>
                  {sportIcons[currentCard.sport] || ''} {currentCard.sport}
                </span>
              </div>
              <div className="text-lg font-bold text-white mb-1">{currentCard.player}</div>
              <div className="text-sm text-gray-400 mb-2">{currentCard.year} {currentCard.set}</div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-green-400">${currentValue.toLocaleString()}</span>
                {currentCard.rookie && <span className="text-xs bg-amber-900/60 border border-amber-700/40 text-amber-400 px-2 py-0.5 rounded-full">RC</span>}
              </div>
            </div>

            {/* VS / Arrow */}
            <div className="text-center">
              {revealing ? (
                <div className="text-4xl animate-bounce">{'\ud83c\udfb0'}</div>
              ) : (
                <div className="text-2xl font-black text-gray-600">VS</div>
              )}
            </div>

            {/* Next Card (hidden or revealing) */}
            <div className={`w-full sm:w-72 border rounded-xl p-5 transition-all ${
              revealing && showResult
                ? (nextValue > currentValue ? 'bg-green-950/50 border-green-700/50' : nextValue === currentValue ? 'bg-amber-950/50 border-amber-700/50' : 'bg-red-950/50 border-red-700/50')
                : revealing
                  ? `${sportBg[nextCard?.sport || ''] || 'bg-gray-800/50 border-gray-700/50'}`
                  : 'bg-gray-800/30 border-gray-700/30 border-dashed'
            }`}>
              {revealing && nextCard ? (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-400">Next Card</span>
                    <span className={`text-sm ${sportColors[nextCard.sport] || 'text-gray-400'}`}>
                      {sportIcons[nextCard.sport] || ''} {nextCard.sport}
                    </span>
                  </div>
                  <div className="text-lg font-bold text-white mb-1">{nextCard.player}</div>
                  <div className="text-sm text-gray-400 mb-2">{nextCard.year} {nextCard.set}</div>
                  <div className="flex items-center justify-between">
                    <span className={`text-2xl font-black ${nextValue > currentValue ? 'text-green-400' : nextValue === currentValue ? 'text-amber-400' : 'text-red-400'}`}>
                      ${nextValue.toLocaleString()}
                    </span>
                    {showResult && nextValue < currentValue && <span className="text-red-400 text-sm font-bold">BUST!</span>}
                    {nextValue > currentValue && <span className="text-green-400 text-sm font-bold">2x!</span>}
                    {nextValue === currentValue && <span className="text-amber-400 text-sm font-bold">PUSH</span>}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-gray-600">
                  <div className="text-4xl mb-2">?</div>
                  <div className="text-sm">Next card hidden</div>
                  <div className="text-xs text-gray-700 mt-1">Higher value = 2x score</div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {!revealing && !showResult && (
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleCashOut}
                className="px-8 py-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-lg transition-all cursor-pointer"
              >
                Cash Out ({score.toLocaleString()})
              </button>
              <button
                onClick={handleDouble}
                className="px-8 py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl text-lg transition-all cursor-pointer animate-pulse"
              >
                Double It!
              </button>
            </div>
          )}

          {revealing && !showResult && (
            <div className="text-center text-gray-400 animate-pulse">Revealing...</div>
          )}

          {showResult && (
            <div className="text-center">
              <div className="text-4xl font-black text-red-400 animate-bounce">BUSTED!</div>
              <div className="text-gray-400 mt-2">You lost {score > 0 ? score.toLocaleString() : 'everything'}. Should have cashed out!</div>
            </div>
          )}
        </div>
      )}

      {/* Result Screen */}
      {phase === 'result' && (
        <div className="space-y-6">
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-8 text-center">
            <div className={`text-6xl font-black ${cashedOut ? getGrade(score).color : 'text-red-400'} mb-2`}>
              {cashedOut ? getGrade(score).grade : 'F'}
            </div>
            <div className="text-xl text-gray-300 mb-1">
              {cashedOut ? getGrade(score).label : 'Busted'}
            </div>
            <div className="text-4xl font-black text-white my-4">
              {cashedOut ? score.toLocaleString() : '0'} <span className="text-lg text-gray-500">pts</span>
            </div>

            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mt-6">
              <div className="bg-gray-900/60 rounded-lg p-3">
                <div className="text-xs text-gray-500">Cards Seen</div>
                <div className="text-lg font-bold text-white">{streak + 1}</div>
              </div>
              <div className="bg-gray-900/60 rounded-lg p-3">
                <div className="text-xs text-gray-500">Doubles</div>
                <div className="text-lg font-bold text-amber-400">{streak}x</div>
              </div>
              <div className="bg-gray-900/60 rounded-lg p-3">
                <div className="text-xs text-gray-500">Result</div>
                <div className={`text-lg font-bold ${cashedOut ? 'text-green-400' : 'text-red-400'}`}>
                  {cashedOut ? 'Cashed Out' : 'Busted'}
                </div>
              </div>
            </div>

            {/* Cards Revealed */}
            <div className="mt-6 space-y-2 max-w-lg mx-auto">
              {deck.slice(0, streak + (cashedOut ? 1 : 2)).map((card, i) => {
                const val = parseValue(card.estimatedValueRaw);
                const prevVal = i > 0 ? parseValue(deck[i - 1].estimatedValueRaw) : 0;
                const isWin = i > 0 && val > prevVal;
                const isTie = i > 0 && val === prevVal;
                const isLoss = i > 0 && val < prevVal;
                return (
                  <div key={i} className={`flex items-center justify-between text-sm rounded-lg px-3 py-2 ${
                    i === 0 ? 'bg-gray-900/50' : isWin ? 'bg-green-950/40' : isTie ? 'bg-amber-950/40' : 'bg-red-950/40'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 text-xs w-6">#{i + 1}</span>
                      <span className={sportColors[card.sport] || 'text-gray-400'}>{sportIcons[card.sport] || ''}</span>
                      <span className="text-white">{card.player}</span>
                      <span className="text-gray-600 text-xs">{card.year}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-400 font-medium">${val.toLocaleString()}</span>
                      {i > 0 && (
                        <span className={`text-xs font-bold ${isWin ? 'text-green-400' : isTie ? 'text-amber-400' : 'text-red-400'}`}>
                          {isWin ? '2x' : isTie ? 'PUSH' : 'BUST'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Share */}
            <div className="mt-6 flex gap-3 justify-center">
              <button
                onClick={copyResults}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl text-sm font-medium transition-all cursor-pointer"
              >
                Copy Results
              </button>
              <button
                onClick={() => { setPhase('ready'); setShowResult(false); }}
                className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-medium transition-all cursor-pointer"
              >
                Play Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Strategy Tips</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { tip: 'Cash Out at 3,200+', detail: 'Three successful doubles (800 points) is a solid run. Four (1,600) is great. Pushing past 3,200 is where risk really climbs.' },
            { tip: 'Watch Card Values', detail: 'If your current card is very high value ($500+), the next card is statistically less likely to beat it. Consider cashing out.' },
            { tip: 'Low Cards Are Good', detail: 'Starting with a low-value card ($5-$20) means almost any next card will beat it. Low starts often lead to long streaks.' },
            { tip: 'Know When to Walk', detail: 'The greed trap is real. Cashing out at B+ grade (3,200) beats busting while chasing S grade (25,600). Lock in your profits.' },
          ].map(t => (
            <div key={t.tip} className="bg-gray-900/40 rounded-lg p-3">
              <div className="text-sm font-semibold text-green-400">{t.tip}</div>
              <div className="text-xs text-gray-400 mt-1">{t.detail}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Score Guide */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Score Guide</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { grade: 'S', min: '25,600+', doubles: '8+', color: 'text-yellow-400 bg-yellow-950/30 border-yellow-800/30' },
            { grade: 'A+', min: '12,800+', doubles: '7', color: 'text-purple-400 bg-purple-950/30 border-purple-800/30' },
            { grade: 'A', min: '6,400+', doubles: '6', color: 'text-green-400 bg-green-950/30 border-green-800/30' },
            { grade: 'B+', min: '3,200+', doubles: '5', color: 'text-blue-400 bg-blue-950/30 border-blue-800/30' },
            { grade: 'B', min: '1,600+', doubles: '4', color: 'text-cyan-400 bg-cyan-950/30 border-cyan-800/30' },
            { grade: 'C', min: '800+', doubles: '3', color: 'text-gray-300 bg-gray-950/30 border-gray-700/30' },
            { grade: 'D', min: '400+', doubles: '2', color: 'text-orange-400 bg-orange-950/30 border-orange-800/30' },
            { grade: 'F', min: 'Bust', doubles: '0', color: 'text-red-400 bg-red-950/30 border-red-800/30' },
          ].map(g => (
            <div key={g.grade} className={`rounded-lg border p-3 text-center ${g.color}`}>
              <div className="text-2xl font-black">{g.grade}</div>
              <div className="text-xs mt-1">{g.min}</div>
              <div className="text-xs text-gray-500">{g.doubles} doubles</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
