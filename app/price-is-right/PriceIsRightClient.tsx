'use client';

import { useMemo, useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

function dateHash(dateStr: string): number {
  let hash = 0;
  const str = 'cardvault-pir-' + dateStr;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function parseValue(v: string): number {
  const match = v.match(/\$([\d,]+)/);
  if (!match) return 0;
  return parseInt(match[1].replace(/,/g, ''), 10);
}

function formatPrice(n: number): string {
  if (n >= 1000000) return '$' + (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return '$' + (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'K';
  return '$' + n.toLocaleString();
}

function slugifyPlayer(name: string): string {
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const sportIcons: Record<string, string> = { baseball: '\u26be', basketball: '\ud83c\udfc0', football: '\ud83c\udfc8', hockey: '\ud83c\udfd2' };

type GameState = 'playing' | 'revealed' | 'finished';

function getGrade(score: number): { grade: string; color: string; title: string } {
  if (score >= 950) return { grade: 'S', color: 'text-purple-400', title: 'Market Savant' };
  if (score >= 850) return { grade: 'A', color: 'text-emerald-400', title: 'Expert Collector' };
  if (score >= 700) return { grade: 'B', color: 'text-blue-400', title: 'Solid Knowledge' };
  if (score >= 500) return { grade: 'C', color: 'text-yellow-400', title: 'Average Joe' };
  if (score >= 300) return { grade: 'D', color: 'text-orange-400', title: 'Still Learning' };
  return { grade: 'F', color: 'text-red-400', title: 'Check More Guides' };
}

function getAccuracyColor(pct: number): string {
  if (pct >= 90) return 'text-emerald-400';
  if (pct >= 70) return 'text-blue-400';
  if (pct >= 50) return 'text-yellow-400';
  if (pct >= 30) return 'text-orange-400';
  return 'text-red-400';
}

const TOTAL_ROUNDS = 10;
const LS_KEY = 'cardvault-pir-best';

export default function PriceIsRightClient() {
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Select 10 cards for today, ensuring variety in value ranges
  const todayCards = useMemo(() => {
    const seed = dateHash(todayStr);
    const rng = seededRng(seed);

    // Filter to cards with parseable values > 0
    const valid = sportsCards.filter(c => parseValue(c.estimatedValueRaw) > 0);

    // Shuffle with seeded random
    const shuffled = [...valid].sort(() => rng() - 0.5);

    // Pick 10 with at least 2 sports represented
    const picked: typeof sportsCards = [];
    const sportsSeen = new Set<string>();
    for (const card of shuffled) {
      if (picked.length >= TOTAL_ROUNDS) break;
      // Ensure we don't get too many from one sport
      const sportCount = picked.filter(p => p.sport === card.sport).length;
      if (sportCount >= 4) continue;
      picked.push(card);
      sportsSeen.add(card.sport);
    }
    return picked;
  }, [todayStr]);

  const [currentRound, setCurrentRound] = useState(0);
  const [guessInput, setGuessInput] = useState('');
  const [gameState, setGameState] = useState<GameState>('playing');
  const [scores, setScores] = useState<number[]>([]);
  const [guesses, setGuesses] = useState<number[]>([]);
  const [bestScore, setBestScore] = useState<number | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) setBestScore(JSON.parse(saved).best ?? null);
    } catch {}
  }, []);

  const currentCard = todayCards[currentRound];
  const actualValue = currentCard ? parseValue(currentCard.estimatedValueRaw) : 0;
  const totalScore = scores.reduce((a, b) => a + b, 0);

  const handleGuess = useCallback(() => {
    const guess = parseInt(guessInput.replace(/[$,]/g, ''), 10);
    if (isNaN(guess) || guess < 0) return;

    // Score: 100 * max(0, 1 - |guess - actual| / actual)
    const accuracy = Math.max(0, 1 - Math.abs(guess - actualValue) / Math.max(actualValue, 1));
    const roundScore = Math.round(accuracy * 100);

    setGuesses(prev => [...prev, guess]);
    setScores(prev => [...prev, roundScore]);
    setGameState('revealed');
  }, [guessInput, actualValue]);

  const handleNext = useCallback(() => {
    if (currentRound + 1 >= TOTAL_ROUNDS) {
      // Game over
      setGameState('finished');
      const finalScore = totalScore + scores[scores.length - 1]; // already added above via setScores
      try {
        const saved = localStorage.getItem(LS_KEY);
        const prev = saved ? JSON.parse(saved).best ?? 0 : 0;
        const newBest = Math.max(prev, totalScore);
        localStorage.setItem(LS_KEY, JSON.stringify({ best: newBest, date: todayStr }));
        setBestScore(newBest);
      } catch {}
    } else {
      setCurrentRound(prev => prev + 1);
      setGuessInput('');
      setGameState('playing');
    }
  }, [currentRound, totalScore, scores, todayStr]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (gameState === 'playing') handleGuess();
      else if (gameState === 'revealed') handleNext();
    }
  }, [gameState, handleGuess, handleNext]);

  // Finished screen
  if (gameState === 'finished') {
    const { grade, color, title } = getGrade(totalScore);
    return (
      <div className="space-y-6">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 text-center">
          <div className="text-gray-500 text-sm mb-2">Final Score</div>
          <div className={`text-6xl font-bold ${color} mb-2`}>{totalScore}</div>
          <div className="text-gray-400 mb-1">out of {TOTAL_ROUNDS * 100}</div>
          <div className={`text-2xl font-bold ${color} mb-1`}>Grade: {grade}</div>
          <div className="text-gray-400 text-sm">{title}</div>
          {bestScore !== null && (
            <div className="mt-3 text-gray-500 text-xs">
              Personal Best: {bestScore} {totalScore >= bestScore && totalScore > 0 ? '(New Record!)' : ''}
            </div>
          )}
        </div>

        {/* Round recap */}
        <div>
          <h2 className="text-lg font-bold text-white mb-3">Round Recap</h2>
          <div className="space-y-2">
            {todayCards.map((card, i) => {
              if (i >= scores.length) return null;
              const actual = parseValue(card.estimatedValueRaw);
              const guess = guesses[i];
              const diff = guess - actual;
              const pct = scores[i];
              return (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg p-3 flex items-center gap-3">
                  <div className="w-6 text-gray-600 text-xs font-mono">{i + 1}</div>
                  <div className="text-lg">{sportIcons[card.sport] || ''}</div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/sports/${card.slug}`} className="text-white text-sm font-medium hover:text-blue-400 truncate block">
                      {card.player} ({card.year})
                    </Link>
                    <div className="text-xs text-gray-500">
                      Actual: {formatPrice(actual)} | You: {formatPrice(guess)} ({diff >= 0 ? '+' : ''}{formatPrice(diff)})
                    </div>
                  </div>
                  <div className={`text-lg font-bold ${getAccuracyColor(pct)}`}>{pct}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Play again CTA */}
        <div className="text-center text-gray-500 text-sm">
          New cards tomorrow at midnight. Come back daily to improve your score!
        </div>
      </div>
    );
  }

  // Active game
  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="flex items-center gap-2">
        {Array.from({ length: TOTAL_ROUNDS }, (_, i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded-full transition-colors ${
              i < scores.length ? (scores[i] >= 70 ? 'bg-emerald-500' : scores[i] >= 40 ? 'bg-yellow-500' : 'bg-red-500')
              : i === currentRound ? 'bg-purple-500 animate-pulse'
              : 'bg-gray-800'
            }`}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>Card {currentRound + 1} of {TOTAL_ROUNDS}</span>
        <span>Score: {totalScore} / {scores.length * 100}</span>
      </div>

      {/* Card display */}
      {currentCard && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="text-3xl mb-2">{sportIcons[currentCard.sport] || ''}</div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">{currentCard.name}</h2>
            <div className="text-gray-400 text-sm">{currentCard.player} &middot; {currentCard.set}</div>
            {currentCard.rookie && (
              <span className="inline-block mt-2 text-xs bg-amber-950/60 border border-amber-800/50 text-amber-400 px-2 py-0.5 rounded-full">
                Rookie Card
              </span>
            )}
          </div>

          {/* Card details (no price!) */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <div className="text-gray-500 text-xs mb-1">Year</div>
              <div className="text-white font-bold">{currentCard.year}</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <div className="text-gray-500 text-xs mb-1">Sport</div>
              <div className="text-white font-bold capitalize">{currentCard.sport}</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <div className="text-gray-500 text-xs mb-1">Card #</div>
              <div className="text-white font-bold">{currentCard.cardNumber}</div>
            </div>
          </div>

          {gameState === 'playing' ? (
            /* Guess input */
            <div>
              <label className="block text-gray-400 text-sm mb-2">What is this card worth? (raw, ungraded)</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={guessInput}
                    onChange={e => setGuessInput(e.target.value.replace(/[^0-9,]/g, ''))}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter your guess..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-8 pr-4 py-3 text-white text-lg focus:outline-none focus:border-purple-500 transition-colors"
                    autoFocus
                  />
                </div>
                <button
                  onClick={handleGuess}
                  disabled={!guessInput}
                  className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Lock In
                </button>
              </div>
              <div className="mt-2 text-gray-600 text-xs">
                Hint: Think about era, player popularity, and rookie status
              </div>
            </div>
          ) : (
            /* Revealed result */
            <div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                  <div className="text-gray-500 text-xs mb-1">Your Guess</div>
                  <div className="text-white text-xl font-bold">{formatPrice(guesses[guesses.length - 1])}</div>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                  <div className="text-gray-500 text-xs mb-1">Actual Value</div>
                  <div className="text-emerald-400 text-xl font-bold">{formatPrice(actualValue)}</div>
                </div>
              </div>

              {/* Score animation */}
              <div className="text-center mb-4">
                <div className={`text-4xl font-bold ${getAccuracyColor(scores[scores.length - 1])}`}>
                  +{scores[scores.length - 1]} points
                </div>
                <div className="text-gray-500 text-sm mt-1">
                  {scores[scores.length - 1] >= 90 ? 'Incredible! You know this market.' :
                   scores[scores.length - 1] >= 70 ? 'Great guess! Very close.' :
                   scores[scores.length - 1] >= 50 ? 'Not bad. In the ballpark.' :
                   scores[scores.length - 1] >= 25 ? 'Rough estimate. Keep learning!' :
                   'Way off! This one was tricky.'}
                </div>
              </div>

              {/* Difference bar */}
              {(() => {
                const guess = guesses[guesses.length - 1];
                const diff = guess - actualValue;
                const pctOff = actualValue > 0 ? Math.abs(diff) / actualValue * 100 : 0;
                return (
                  <div className="mb-4 p-3 bg-gray-800/30 rounded-lg text-center text-sm">
                    <span className="text-gray-400">You were </span>
                    <span className={diff > 0 ? 'text-red-400' : 'text-blue-400'}>
                      {diff > 0 ? 'over' : 'under'} by {formatPrice(Math.abs(diff))}
                    </span>
                    <span className="text-gray-400"> ({pctOff.toFixed(0)}% off)</span>
                  </div>
                );
              })()}

              <button
                onClick={handleNext}
                className="w-full py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-500 transition-colors"
              >
                {currentRound + 1 >= TOTAL_ROUNDS ? 'See Final Results' : `Next Card (${currentRound + 2}/${TOTAL_ROUNDS})`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Running scores */}
      {scores.length > 0 && gameState === 'playing' && (
        <div className="flex flex-wrap gap-2">
          {scores.map((s, i) => (
            <div key={i} className={`text-xs px-2 py-1 rounded-full ${
              s >= 70 ? 'bg-emerald-950/60 border border-emerald-800/30 text-emerald-400' :
              s >= 40 ? 'bg-yellow-950/60 border border-yellow-800/30 text-yellow-400' :
              'bg-red-950/60 border border-red-800/30 text-red-400'
            }`}>
              #{i + 1}: {s}pts
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
