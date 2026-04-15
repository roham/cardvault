'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { sportsCards } from '@/data/sports-cards';
import Link from 'next/link';

interface GameCard {
  name: string;
  player: string;
  sport: string;
  year: number;
  value: number;
  slug: string;
  rookie: boolean;
}

const SPORT_EMOJI: Record<string, string> = {
  baseball: '\u26BE',
  basketball: '\uD83C\uDFC0',
  football: '\uD83C\uDFC8',
  hockey: '\uD83C\uDFD2',
};

function parseValue(raw: string): number {
  const match = raw.match(/\$[\d,]+/g);
  if (!match) return 10;
  const values = match.map(v => parseInt(v.replace(/[$,]/g, '')));
  return values.length > 1 ? Math.round((values[0] + values[values.length - 1]) / 2) : values[0];
}

function fmt(n: number): string {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`;
  return `$${n.toLocaleString()}`;
}

function getCards(): GameCard[] {
  return sportsCards.map(c => ({
    name: c.name,
    player: c.player,
    sport: c.sport,
    year: c.year,
    value: parseValue(c.estimatedValueGem),
    slug: c.slug,
    rookie: c.rookie,
  }));
}

function pickTwo(cards: GameCard[], rng: () => number): [GameCard, GameCard] {
  const idx1 = Math.floor(rng() * cards.length);
  let idx2 = Math.floor(rng() * (cards.length - 1));
  if (idx2 >= idx1) idx2++;
  return [cards[idx1], cards[idx2]];
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

type Phase = 'playing' | 'revealed' | 'gameover';

const ROUNDS_PER_GAME = 15;

export default function CardWarClient() {
  const allCards = useMemo(() => getCards(), []);
  const [phase, setPhase] = useState<Phase>('playing');
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [seed, setSeed] = useState(() => Date.now());
  const [pair, setPair] = useState<[GameCard, GameCard]>(() => pickTwo(allCards, seededRandom(Date.now())));
  const [chosen, setChosen] = useState<0 | 1 | null>(null);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem('cardvault-card-war-high');
    if (stored) setHighScore(parseInt(stored));
  }, []);

  const newPair = useCallback((s: number, r: number) => {
    const rng = seededRandom(s + r * 997);
    setPair(pickTwo(allCards, rng));
  }, [allCards]);

  const choose = useCallback((idx: 0 | 1) => {
    if (phase !== 'playing') return;
    setChosen(idx);
    const other = idx === 0 ? 1 : 0;
    const isCorrect = pair[idx].value >= pair[other].value;
    setCorrect(isCorrect);
    if (isCorrect) {
      setScore(s => s + 1);
      setStreak(s => {
        const newStreak = s + 1;
        setBestStreak(b => Math.max(b, newStreak));
        return newStreak;
      });
    } else {
      setStreak(0);
    }
    setPhase('revealed');
  }, [phase, pair]);

  const nextRound = useCallback(() => {
    if (round >= ROUNDS_PER_GAME) {
      setPhase('gameover');
      const finalScore = score;
      if (finalScore > highScore) {
        setHighScore(finalScore);
        localStorage.setItem('cardvault-card-war-high', finalScore.toString());
      }
      return;
    }
    setRound(r => r + 1);
    setChosen(null);
    setCorrect(null);
    setPhase('playing');
    newPair(seed, round + 1);
  }, [round, seed, score, highScore, newPair]);

  const restart = useCallback(() => {
    const newSeed = Date.now();
    setSeed(newSeed);
    setRound(1);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setChosen(null);
    setCorrect(null);
    setPhase('playing');
    newPair(newSeed, 1);
  }, [newPair]);

  // Game Over screen
  if (phase === 'gameover') {
    const pct = Math.round((score / ROUNDS_PER_GAME) * 100);
    const grade = pct >= 90 ? 'Card Expert' : pct >= 70 ? 'Hobby Veteran' : pct >= 50 ? 'Solid Collector' : 'Still Learning';
    const isNew = score >= highScore && score > 0;

    return (
      <div className="space-y-6">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 text-center">
          <div className="text-xs text-gray-500 uppercase mb-2">Game Over</div>
          <div className="text-5xl font-bold text-white mb-1">{score}/{ROUNDS_PER_GAME}</div>
          <div className="text-lg text-gray-400 mb-2">{grade}</div>
          {isNew && <div className="text-yellow-400 font-bold text-sm mb-2">NEW HIGH SCORE!</div>}
          <div className="flex justify-center gap-6 mt-4 text-sm text-gray-500">
            <div>Accuracy: <span className="text-white font-bold">{pct}%</span></div>
            <div>Best Streak: <span className="text-emerald-400 font-bold">{bestStreak}</span></div>
            <div>High Score: <span className="text-yellow-400 font-bold">{highScore}</span></div>
          </div>
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={restart}
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors"
          >
            Play Again
          </button>
          <button
            onClick={() => {
              const text = `I scored ${score}/${ROUNDS_PER_GAME} in Card War on CardVault! (${grade})\n\nBest streak: ${bestStreak}\n\nPlay: cardvault-two.vercel.app/card-war`;
              navigator.clipboard?.writeText(text);
            }}
            className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl transition-colors"
          >
            Share Score
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Score Bar */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Round {round}/{ROUNDS_PER_GAME}</span>
          <span className="text-white font-bold">Score: {score}</span>
          <span className="text-emerald-400">Streak: {streak}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
          <div
            className="h-1.5 rounded-full bg-emerald-500 transition-all"
            style={{ width: `${(round / ROUNDS_PER_GAME) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="text-center text-lg font-bold text-white">
        Which card is worth more? {phase === 'playing' ? '(Gem Mint value)' : ''}
      </div>

      {/* Card Pair */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {pair.map((card, idx) => {
          const isChosen = chosen === idx;
          const isWinner = pair[0].value >= pair[1].value ? idx === 0 : idx === 1;
          const borderClass = phase === 'revealed'
            ? isWinner
              ? 'border-emerald-500 bg-emerald-900/20'
              : 'border-red-500/50 bg-red-900/10'
            : isChosen
              ? 'border-emerald-500'
              : 'border-gray-700 hover:border-gray-500';

          return (
            <button
              key={idx}
              onClick={() => phase === 'playing' && choose(idx as 0 | 1)}
              disabled={phase !== 'playing'}
              className={`p-6 rounded-xl border-2 transition-all text-left ${borderClass} ${
                phase === 'playing' ? 'cursor-pointer hover:scale-[1.02]' : ''
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{SPORT_EMOJI[card.sport] || '🃏'}</span>
                <span className="text-xs text-gray-500 uppercase">{card.sport}</span>
                {card.rookie && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 rounded">RC</span>
                )}
              </div>
              <div className="text-sm font-bold text-white mb-1">{card.name}</div>
              <div className="text-xs text-gray-400 mb-3">{card.player} &middot; {card.year}</div>

              {phase === 'revealed' ? (
                <div className={`text-2xl font-bold ${isWinner ? 'text-emerald-400' : 'text-red-400'}`}>
                  {fmt(card.value)}
                  {isWinner && <span className="ml-2 text-sm">WINNER</span>}
                </div>
              ) : (
                <div className="text-lg font-bold text-gray-600">Tap to pick</div>
              )}

              {phase === 'revealed' && (
                <Link
                  href={`/sports/${card.slug}`}
                  className="text-xs text-emerald-400 hover:underline mt-2 inline-block"
                  onClick={e => e.stopPropagation()}
                >
                  View card details &rarr;
                </Link>
              )}
            </button>
          );
        })}
      </div>

      {/* Result + Next */}
      {phase === 'revealed' && (
        <div className="text-center space-y-4">
          <div className={`text-lg font-bold ${correct ? 'text-emerald-400' : 'text-red-400'}`}>
            {correct ? 'Correct!' : 'Wrong!'} {pair[0].value === pair[1].value ? '(Same value — both correct!)' : ''}
          </div>
          <div className="text-sm text-gray-400">
            {pair[0].name}: <span className="text-white font-medium">{fmt(pair[0].value)}</span>
            {' vs '}
            {pair[1].name}: <span className="text-white font-medium">{fmt(pair[1].value)}</span>
          </div>
          <button
            onClick={nextRound}
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors"
          >
            {round >= ROUNDS_PER_GAME ? 'See Results' : 'Next Round'}
          </button>
        </div>
      )}
    </div>
  );
}
