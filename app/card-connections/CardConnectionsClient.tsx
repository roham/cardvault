'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';

interface CardInfo {
  player: string;
  sport: string;
  year: number;
  set: string;
  slug: string;
}

interface ConnectionStep {
  from: CardInfo;
  to: CardInfo;
  link: string; // e.g. "Same Sport", "Same Year", "Same Set"
}

// Deterministic daily seed
function dateHash(): number {
  const d = new Date();
  const str = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function findConnections(cards: CardInfo[]): { start: CardInfo; end: CardInfo; chain: ConnectionStep[] } | null {
  const rand = seededRandom(dateHash());

  // Pick two random players from different sports
  const sports = ['baseball', 'basketball', 'football', 'hockey'];
  const sportA = sports[Math.floor(rand() * sports.length)];
  let sportB = sports[Math.floor(rand() * sports.length)];
  while (sportB === sportA) sportB = sports[Math.floor(rand() * sports.length)];

  const poolA = cards.filter(c => c.sport === sportA);
  const poolB = cards.filter(c => c.sport === sportB);
  if (poolA.length === 0 || poolB.length === 0) return null;

  const start = poolA[Math.floor(rand() * poolA.length)];
  const end = poolB[Math.floor(rand() * poolB.length)];

  // Build a chain of 3-5 steps
  // Step 1: start → same-year card from another player in same sport
  // Step 2: → a card sharing a set with someone from a middle sport
  // Step 3: → same-sport card as the end target
  // Step 4: → end target

  const chain: ConnectionStep[] = [];

  // Find a bridge player in start's sport with same year
  const sameYearSameSport = cards.filter(c => c.year === start.year && c.sport === start.sport && c.player !== start.player);
  const bridge1 = sameYearSameSport.length > 0 ? sameYearSameSport[Math.floor(rand() * sameYearSameSport.length)] : null;

  if (bridge1) {
    chain.push({ from: start, to: bridge1, link: `Same Year (${start.year})` });

    // Find someone in end's sport from same year
    const sameYearEndSport = cards.filter(c => c.year === bridge1.year && c.sport === end.sport && c.player !== end.player);
    const bridge2 = sameYearEndSport.length > 0 ? sameYearEndSport[Math.floor(rand() * sameYearEndSport.length)] : null;

    if (bridge2) {
      chain.push({ from: bridge1, to: bridge2, link: `Same Year (${bridge1.year}) + Cross-Sport` });

      // Connect bridge2 to end via same sport
      chain.push({ from: bridge2, to: end, link: `Same Sport (${end.sport})` });
    } else {
      // Fallback: direct cross-sport link
      chain.push({ from: bridge1, to: end, link: 'Cross-Sport Link' });
    }
  } else {
    chain.push({ from: start, to: end, link: 'Direct Connection' });
  }

  return { start, end, chain };
}

const sportEmoji: Record<string, string> = {
  baseball: '⚾', basketball: '🏀', football: '🏈', hockey: '🏒',
};

export default function CardConnectionsClient({ cards }: { cards: CardInfo[] }) {
  const puzzle = useMemo(() => findConnections(cards), [cards]);

  const [revealed, setRevealed] = useState<number>(0); // how many steps revealed
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameComplete, setGameComplete] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  const chain = puzzle?.chain || [];
  const maxSteps = chain.length;

  const handleGuess = useCallback(() => {
    if (!currentGuess.trim() || !puzzle) return;
    const guess = currentGuess.trim().toLowerCase();
    setGuesses(prev => [...prev, guess]);

    // Check if guess matches any unrevealed player in the chain
    const nextStep = chain[revealed];
    if (nextStep) {
      const targetName = nextStep.to.player.toLowerCase();
      if (guess.includes(targetName) || targetName.includes(guess)) {
        setRevealed(prev => {
          const next = prev + 1;
          if (next >= maxSteps) setGameComplete(true);
          return next;
        });
      }
    }
    setCurrentGuess('');
  }, [currentGuess, puzzle, chain, revealed, maxSteps]);

  const revealNext = useCallback(() => {
    setRevealed(prev => {
      const next = prev + 1;
      if (next >= maxSteps) {
        setGameComplete(true);
        setShowAnswer(true);
      }
      return next;
    });
  }, [maxSteps]);

  const revealAll = useCallback(() => {
    setRevealed(maxSteps);
    setGameComplete(true);
    setShowAnswer(true);
  }, [maxSteps]);

  const shareResults = useCallback(() => {
    if (!puzzle) return;
    const steps = showAnswer ? '(revealed)' : `${guesses.length} guesses`;
    const text = `Card Connections 🔗\n${puzzle.start.player} → ${puzzle.end.player}\n${chain.length} steps | ${steps}\n\nhttps://cardvault-two.vercel.app/card-connections`;
    navigator.clipboard.writeText(text);
  }, [puzzle, chain, guesses, showAnswer]);

  if (!puzzle) return <div className="text-gray-400">Loading today&apos;s puzzle...</div>;

  return (
    <div className="space-y-6">
      {/* Puzzle Header */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="text-center mb-6">
          <div className="text-sm text-gray-500 mb-2">Connect these two players</div>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="bg-gray-800 border border-emerald-800/50 rounded-lg px-5 py-3 text-center">
              <div className="text-xs text-gray-500 mb-1">{sportEmoji[puzzle.start.sport]} Start</div>
              <div className="text-white font-bold text-lg">{puzzle.start.player}</div>
              <div className="text-gray-500 text-xs">{puzzle.start.set}</div>
            </div>
            <div className="text-gray-600 text-2xl">→</div>
            <div className="text-gray-500 text-sm">
              {chain.length} steps
            </div>
            <div className="text-gray-600 text-2xl">→</div>
            <div className="bg-gray-800 border border-violet-800/50 rounded-lg px-5 py-3 text-center">
              <div className="text-xs text-gray-500 mb-1">{sportEmoji[puzzle.end.sport]} End</div>
              <div className="text-white font-bold text-lg">{puzzle.end.player}</div>
              <div className="text-gray-500 text-xs">{puzzle.end.set}</div>
            </div>
          </div>
        </div>

        {/* Chain Visualization */}
        <div className="space-y-3">
          {chain.map((step, i) => {
            const isRevealed = i < revealed;
            return (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-lg transition-all ${isRevealed ? 'bg-emerald-950/30 border border-emerald-800/30' : 'bg-gray-800/50 border border-gray-700/30'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isRevealed ? 'bg-emerald-900 text-emerald-400' : 'bg-gray-700 text-gray-500'}`}>
                  {i + 1}
                </div>
                {isRevealed ? (
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-medium">{step.from.player}</span>
                      <span className="text-emerald-400 text-xs bg-emerald-950/50 px-2 py-0.5 rounded">{step.link}</span>
                      <span className="text-gray-500">→</span>
                      <span className="text-white font-medium">{step.to.player}</span>
                    </div>
                    <div className="text-gray-500 text-xs mt-0.5">
                      {sportEmoji[step.to.sport]} {step.to.set}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 text-gray-500 text-sm">
                    ? → ? (hidden)
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Input / Controls */}
      {!gameComplete ? (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={currentGuess}
              onChange={e => setCurrentGuess(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleGuess()}
              placeholder="Guess the next player in the chain..."
              className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-emerald-600 focus:outline-none"
            />
            <button
              onClick={handleGuess}
              className="bg-emerald-700 hover:bg-emerald-600 text-white px-5 py-3 rounded-lg font-medium transition-colors"
            >
              Guess
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={revealNext}
              className="text-sm text-gray-400 hover:text-white bg-gray-800 px-3 py-1.5 rounded transition-colors"
            >
              Reveal Next Step
            </button>
            <button
              onClick={revealAll}
              className="text-sm text-gray-400 hover:text-white bg-gray-800 px-3 py-1.5 rounded transition-colors"
            >
              Show Full Chain
            </button>
          </div>
          {guesses.length > 0 && (
            <div className="text-xs text-gray-500">
              Guesses: {guesses.join(', ')} ({guesses.length} total)
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-900 border border-emerald-800/50 rounded-xl p-6 text-center">
          <div className="text-2xl mb-2">{showAnswer ? '🔗' : '🎉'}</div>
          <div className="text-white font-bold text-lg mb-1">
            {showAnswer ? 'Chain Revealed!' : 'Connected!'}
          </div>
          <div className="text-gray-400 text-sm mb-4">
            {puzzle.start.player} → {puzzle.end.player} in {chain.length} steps
            {!showAnswer && ` | ${guesses.length} guesses`}
          </div>
          <button
            onClick={shareResults}
            className="bg-emerald-700 hover:bg-emerald-600 text-white px-5 py-2 rounded-lg font-medium transition-colors"
          >
            Copy Results
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-500">Steps</div>
          <div className="text-xl font-bold text-emerald-400">{chain.length}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-500">Revealed</div>
          <div className="text-xl font-bold text-white">{revealed}/{maxSteps}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-500">Guesses</div>
          <div className="text-xl font-bold text-white">{guesses.length}</div>
        </div>
      </div>

      {/* How It Works */}
      <details className="bg-gray-900 border border-gray-800 rounded-lg">
        <summary className="px-4 py-3 cursor-pointer text-white font-medium hover:text-emerald-400 transition-colors">
          How Card Connections Works
        </summary>
        <div className="px-4 pb-4 text-gray-400 text-sm space-y-2">
          <p>Each day, two random players from different sports are selected. Your goal is to find the chain of connections linking them.</p>
          <p>Connections include: same year, same sport, same card set, or cross-sport bridges through shared years.</p>
          <p>Type a player name to guess the next link, or reveal steps if you get stuck. The chain is the same for everyone each day — compare with friends!</p>
        </div>
      </details>

      {/* Related Links */}
      <div className="flex flex-wrap gap-2">
        {[
          { href: '/card-clash', label: 'Card Clash' },
          { href: '/guess-the-card', label: 'Guess the Card' },
          { href: '/trivia', label: 'Daily Trivia' },
          { href: '/card-speed-quiz', label: 'Speed Quiz' },
          { href: '/tools', label: 'All Tools' },
        ].map(link => (
          <Link key={link.href} href={link.href} className="text-xs text-gray-400 hover:text-emerald-400 bg-gray-800 border border-gray-700 rounded-full px-3 py-1 transition-colors">
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
