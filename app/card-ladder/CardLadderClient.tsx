'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';

/* ───── Types ───── */
interface LadderCard {
  name: string;
  player: string;
  sport: string;
  year: number;
  value: number; // numeric value for comparison
  valueDisplay: string; // display string
  slug: string;
}

/* ───── Helpers ───── */
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function parseValue(raw: string): number {
  // Extract the first dollar amount from strings like "$5-$12 (PSA 7)"
  const match = raw.match(/\$([0-9,]+)/);
  if (!match) return 0;
  return parseInt(match[1].replace(/,/g, ''), 10);
}

function shuffleArray<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatValue(v: number): string {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `$${(v / 1000).toFixed(0)}K`;
  return `$${v}`;
}

/* ───── Component ───── */
export default function CardLadderClient({ cards }: { cards: { name: string; player: string; sport: string; year: number; estimatedValueRaw: string; slug: string }[] }) {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [revealing, setRevealing] = useState(false);
  const [lastGuess, setLastGuess] = useState<'higher' | 'lower' | null>(null);
  const [wasCorrect, setWasCorrect] = useState(false);

  // Build deck from cards with valid values
  const deck = useMemo(() => {
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const rng = seededRandom(seed);

    const validCards: LadderCard[] = cards
      .map(c => ({
        name: c.name,
        player: c.player,
        sport: c.sport,
        year: c.year,
        value: parseValue(c.estimatedValueRaw),
        valueDisplay: c.estimatedValueRaw,
        slug: c.slug,
      }))
      .filter(c => c.value > 0 && c.value < 10000000); // exclude zero and astronomical outliers

    return shuffleArray(validCards, rng).slice(0, 50);
  }, [cards]);

  // Load high score from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('cardvault-ladder-high');
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  const currentCard = deck[currentIndex];
  const nextCard = deck[currentIndex + 1];

  const sportIcon: Record<string, string> = {
    baseball: '⚾',
    basketball: '🏀',
    football: '🏈',
    hockey: '🏒',
  };

  const sportColor: Record<string, string> = {
    baseball: 'text-emerald-400',
    basketball: 'text-orange-400',
    football: 'text-blue-400',
    hockey: 'text-cyan-400',
  };

  const handleGuess = useCallback((guess: 'higher' | 'lower') => {
    if (!nextCard || revealing) return;

    const correct =
      guess === 'higher'
        ? nextCard.value >= currentCard.value
        : nextCard.value <= currentCard.value;

    setLastGuess(guess);
    setWasCorrect(correct);
    setRevealing(true);

    setTimeout(() => {
      if (correct) {
        const newScore = score + 1;
        setScore(newScore);
        if (newScore > highScore) {
          setHighScore(newScore);
          localStorage.setItem('cardvault-ladder-high', String(newScore));
        }
        setCurrentIndex(i => i + 1);
        setRevealing(false);
        setLastGuess(null);

        // Check if we've run out of cards
        if (currentIndex + 2 >= deck.length) {
          setGameOver(true);
        }
      } else {
        setGameOver(true);
        setRevealing(false);
      }
    }, 1500);
  }, [currentCard, nextCard, score, highScore, revealing, currentIndex, deck.length]);

  const restart = useCallback(() => {
    setScore(0);
    setCurrentIndex(0);
    setGameOver(false);
    setRevealing(false);
    setLastGuess(null);
    setWasCorrect(false);
  }, []);

  const getGrade = (s: number): { letter: string; title: string; color: string } => {
    if (s >= 20) return { letter: 'S', title: 'Card Market Savant', color: 'text-yellow-400' };
    if (s >= 15) return { letter: 'A', title: 'Expert Collector', color: 'text-emerald-400' };
    if (s >= 10) return { letter: 'B', title: 'Sharp Eye', color: 'text-blue-400' };
    if (s >= 5) return { letter: 'C', title: 'Getting There', color: 'text-purple-400' };
    if (s >= 2) return { letter: 'D', title: 'Keep Learning', color: 'text-orange-400' };
    return { letter: 'F', title: 'Card Newbie', color: 'text-red-400' };
  };

  if (!currentCard || !nextCard) {
    return <div className="text-center text-gray-400 py-12">Loading today&apos;s ladder...</div>;
  }

  if (gameOver) {
    const grade = getGrade(score);
    return (
      <div className="max-w-lg mx-auto text-center space-y-6">
        <div className={`text-8xl font-black ${grade.color}`}>{grade.letter}</div>
        <div className="text-2xl font-bold text-white">{grade.title}</div>
        <div className="text-gray-400">
          You climbed <span className="text-white font-bold">{score}</span> rungs
          {score === highScore && score > 0 && <span className="text-yellow-400 ml-2">New High Score!</span>}
        </div>
        <div className="text-sm text-gray-500">High Score: {highScore}</div>

        {/* Share */}
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
          <p className="text-sm text-gray-400 mb-2">Share your result</p>
          <p className="text-white font-mono text-sm">
            🪜 Card Ladder — {score} rungs | Grade: {grade.letter} ({grade.title}) | cardvault-two.vercel.app/card-ladder
          </p>
          <button
            onClick={() => {
              navigator.clipboard.writeText(
                `🪜 Card Ladder — ${score} rungs | Grade: ${grade.letter} (${grade.title}) | cardvault-two.vercel.app/card-ladder`
              );
            }}
            className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-500 transition-colors"
          >
            Copy to Clipboard
          </button>
        </div>

        <button
          onClick={restart}
          className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-500 transition-colors"
        >
          Play Again
        </button>

        <div className="flex flex-wrap justify-center gap-3 pt-4">
          <Link href="/grade-or-fade" className="text-emerald-400 hover:underline text-sm">Grade or Fade</Link>
          <Link href="/price-is-right" className="text-emerald-400 hover:underline text-sm">The Price is Right</Link>
          <Link href="/flip-or-keep" className="text-emerald-400 hover:underline text-sm">Flip or Keep</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Score Bar */}
      <div className="flex items-center justify-between bg-gray-800/50 rounded-xl p-3 border border-gray-700/50">
        <div className="text-sm text-gray-400">Streak: <span className="text-white font-bold">{score}</span></div>
        <div className="text-sm text-gray-400">High: <span className="text-yellow-400 font-bold">{highScore}</span></div>
        <div className="text-sm text-gray-400">Card {currentIndex + 1} of {deck.length}</div>
      </div>

      {/* Card Comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Current Card (revealed) */}
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 text-center">
          <div className="text-xs text-gray-500 uppercase mb-2">Current Card</div>
          <div className={`text-sm mb-1 ${sportColor[currentCard.sport] || 'text-gray-400'}`}>
            {sportIcon[currentCard.sport] || '🃏'} {currentCard.sport}
          </div>
          <h3 className="font-bold text-white text-sm mb-1">{currentCard.player}</h3>
          <p className="text-xs text-gray-400 mb-3">{currentCard.name}</p>
          <div className="text-3xl font-black text-emerald-400">{formatValue(currentCard.value)}</div>
          <div className="text-xs text-gray-500 mt-1">Raw value est.</div>
        </div>

        {/* Next Card (hidden or revealing) */}
        <div className={`border rounded-xl p-5 text-center transition-all duration-500 ${
          revealing
            ? wasCorrect
              ? 'bg-emerald-950/40 border-emerald-700/50'
              : 'bg-red-950/40 border-red-700/50'
            : 'bg-gray-800/50 border-gray-700/50'
        }`}>
          <div className="text-xs text-gray-500 uppercase mb-2">Next Card</div>
          <div className={`text-sm mb-1 ${sportColor[nextCard.sport] || 'text-gray-400'}`}>
            {sportIcon[nextCard.sport] || '🃏'} {nextCard.sport}
          </div>
          <h3 className="font-bold text-white text-sm mb-1">{nextCard.player}</h3>
          <p className="text-xs text-gray-400 mb-3">{nextCard.name}</p>
          {revealing ? (
            <>
              <div className={`text-3xl font-black ${wasCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                {formatValue(nextCard.value)}
              </div>
              <div className={`text-sm font-medium mt-2 ${wasCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                {wasCorrect ? '✓ Correct!' : '✗ Wrong!'}
              </div>
            </>
          ) : (
            <>
              <div className="text-3xl font-black text-gray-600">???</div>
              <div className="text-xs text-gray-500 mt-1">Higher or Lower?</div>
            </>
          )}
        </div>
      </div>

      {/* Buttons */}
      {!revealing && (
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleGuess('higher')}
            className="py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors text-lg"
          >
            ↑ Higher
          </button>
          <button
            onClick={() => handleGuess('lower')}
            className="py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-colors text-lg"
          >
            ↓ Lower
          </button>
        </div>
      )}

      {/* Hint */}
      <p className="text-center text-gray-500 text-xs">
        Is the next card worth more or less than {formatValue(currentCard.value)}? Equal counts as correct for both.
      </p>
    </div>
  );
}
