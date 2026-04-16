'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

// --- Types ---
interface CardPair {
  left: typeof sportsCards[0];
  right: typeof sportsCards[0];
  match: boolean;
  matchReason: string;
}

interface GameStats {
  gamesPlayed: number;
  bestScore: number;
  bestStreak: number;
  totalSnaps: number;
  totalCorrect: number;
}

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

function getDecade(year: number): number {
  return Math.floor(year / 10) * 10;
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

// Match attributes
type MatchType = 'sport' | 'player' | 'decade' | 'rookie' | 'value' | 'set';

function findMatch(a: typeof sportsCards[0], b: typeof sportsCards[0]): { match: boolean; reason: string; type: MatchType } | null {
  if (a.player === b.player) return { match: true, reason: `Same player: ${a.player}`, type: 'player' };
  if (a.sport === b.sport) return { match: true, reason: `Same sport: ${a.sport}`, type: 'sport' };
  if (getDecade(a.year) === getDecade(b.year)) return { match: true, reason: `Same decade: ${getDecade(a.year)}s`, type: 'decade' };
  if (a.rookie && b.rookie) return { match: true, reason: 'Both rookie cards', type: 'rookie' };
  const va = parseValue(a.estimatedValueRaw);
  const vb = parseValue(b.estimatedValueRaw);
  if (va >= 50 && vb >= 50) return { match: true, reason: 'Both worth $50+', type: 'value' };
  if (a.set === b.set) return { match: true, reason: `Same set: ${a.set}`, type: 'set' };
  return null;
}

// Generate game pairs
function generatePairs(seed: number, count: number): CardPair[] {
  const rng = seededRng(seed);
  const cards = [...sportsCards];
  const pairs: CardPair[] = [];

  // Aim for ~60% matches, ~40% no match
  for (let i = 0; i < count; i++) {
    const shouldMatch = rng() < 0.6;

    if (shouldMatch) {
      // Pick a match type
      const matchTypes: MatchType[] = ['sport', 'decade', 'rookie', 'value', 'player'];
      const mt = matchTypes[Math.floor(rng() * matchTypes.length)];

      const idx1 = Math.floor(rng() * cards.length);
      const c1 = cards[idx1];
      let c2: typeof sportsCards[0] | null = null;

      // Find a card that matches
      const shuffled = cards.filter((_, i2) => i2 !== idx1).sort(() => rng() - 0.5);
      for (const candidate of shuffled) {
        const m = findMatch(c1, candidate);
        if (m && m.type === mt) {
          c2 = candidate;
          break;
        }
      }

      // Fallback: any match
      if (!c2) {
        for (const candidate of shuffled) {
          const m = findMatch(c1, candidate);
          if (m) {
            c2 = candidate;
            break;
          }
        }
      }

      if (c2) {
        const m = findMatch(c1, c2);
        pairs.push({ left: c1, right: c2, match: true, matchReason: m?.reason || 'Match found' });
        continue;
      }
    }

    // No match pair — pick cards from different sports, decades, etc.
    let attempts = 0;
    let leftIdx: number, rightIdx: number;
    do {
      leftIdx = Math.floor(rng() * cards.length);
      rightIdx = Math.floor(rng() * cards.length);
      attempts++;
    } while ((leftIdx === rightIdx || findMatch(cards[leftIdx], cards[rightIdx]) !== null) && attempts < 50);

    const left = cards[leftIdx];
    const right = cards[rightIdx];
    const m = findMatch(left, right);
    if (m) {
      // If we couldn't avoid a match, just mark it as a match
      pairs.push({ left, right, match: true, matchReason: m.reason });
    } else {
      pairs.push({ left, right, match: false, matchReason: 'No shared attributes' });
    }
  }

  return pairs;
}

export default function CardSnapClient() {
  const [mode, setMode] = useState<'menu' | 'playing' | 'result'>('menu');
  const [isDaily, setIsDaily] = useState(true);
  const [pairs, setPairs] = useState<CardPair[]>([]);
  const [currentPair, setCurrentPair] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong' | 'miss'; text: string } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Stats
  const [stats, setStats] = useState<GameStats>({
    gamesPlayed: 0, bestScore: 0, bestStreak: 0, totalSnaps: 0, totalCorrect: 0,
  });

  // Load stats
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cardvault-snap-stats');
      if (saved) setStats(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  const saveStats = useCallback((s: GameStats) => {
    setStats(s);
    try { localStorage.setItem('cardvault-snap-stats', JSON.stringify(s)); } catch { /* ignore */ }
  }, []);

  // Start game
  const startGame = useCallback((daily: boolean) => {
    const seed = daily ? dateHash() : Date.now();
    const gamePairs = generatePairs(seed, 20);
    setPairs(gamePairs);
    setCurrentPair(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setCorrect(0);
    setWrong(0);
    setTimeLeft(60);
    setFeedback(null);
    setIsDaily(daily);
    setMode('playing');
  }, []);

  // Timer
  useEffect(() => {
    if (mode !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setMode('result');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [mode]);

  // End game when out of pairs
  useEffect(() => {
    if (mode === 'playing' && currentPair >= pairs.length) {
      if (timerRef.current) clearInterval(timerRef.current);
      setMode('result');
    }
  }, [currentPair, pairs.length, mode]);

  // Save stats on game end
  useEffect(() => {
    if (mode === 'result' && pairs.length > 0) {
      const newStats: GameStats = {
        gamesPlayed: stats.gamesPlayed + 1,
        bestScore: Math.max(stats.bestScore, score),
        bestStreak: Math.max(stats.bestStreak, bestStreak),
        totalSnaps: stats.totalSnaps + correct + wrong,
        totalCorrect: stats.totalCorrect + correct,
      };
      saveStats(newStats);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // Handle SNAP
  const handleSnap = useCallback(() => {
    if (mode !== 'playing' || currentPair >= pairs.length) return;
    const pair = pairs[currentPair];

    if (pair.match) {
      // Correct snap
      const speedBonus = Math.max(0, Math.floor(timeLeft / 10));
      const streakBonus = streak >= 3 ? 5 : streak >= 2 ? 2 : 0;
      const points = 10 + speedBonus + streakBonus;
      setScore(s => s + points);
      setStreak(s => s + 1);
      setBestStreak(s => Math.max(s, streak + 1));
      setCorrect(c => c + 1);
      setFeedback({ type: 'correct', text: `+${points} pts! ${pair.matchReason}` });
    } else {
      // Wrong snap — penalty
      setScore(s => Math.max(0, s - 5));
      setStreak(0);
      setWrong(w => w + 1);
      setFeedback({ type: 'wrong', text: '-5 pts! No match here.' });
    }

    setTimeout(() => {
      setFeedback(null);
      setCurrentPair(c => c + 1);
    }, 800);
  }, [mode, currentPair, pairs, timeLeft, streak]);

  // Handle PASS (no match)
  const handlePass = useCallback(() => {
    if (mode !== 'playing' || currentPair >= pairs.length) return;
    const pair = pairs[currentPair];

    if (!pair.match) {
      // Correct pass
      const points = 5;
      setScore(s => s + points);
      setStreak(s => s + 1);
      setBestStreak(s => Math.max(s, streak + 1));
      setCorrect(c => c + 1);
      setFeedback({ type: 'correct', text: `+${points} pts! Correctly passed.` });
    } else {
      // Missed a match
      setStreak(0);
      setWrong(w => w + 1);
      setFeedback({ type: 'miss', text: `Missed! ${pair.matchReason}` });
    }

    setTimeout(() => {
      setFeedback(null);
      setCurrentPair(c => c + 1);
    }, 800);
  }, [mode, currentPair, pairs, streak]);

  // Grade
  const grade = useMemo(() => {
    if (score >= 200) return { letter: 'S', color: 'text-yellow-400', label: 'LEGENDARY' };
    if (score >= 150) return { letter: 'A', color: 'text-green-400', label: 'EXCELLENT' };
    if (score >= 100) return { letter: 'B', color: 'text-blue-400', label: 'GREAT' };
    if (score >= 60) return { letter: 'C', color: 'text-purple-400', label: 'GOOD' };
    if (score >= 30) return { letter: 'D', color: 'text-orange-400', label: 'FAIR' };
    return { letter: 'F', color: 'text-red-400', label: 'NEEDS PRACTICE' };
  }, [score]);

  // Emoji share
  const shareText = useMemo(() => {
    if (mode !== 'result') return '';
    const accuracy = correct + wrong > 0 ? Math.round((correct / (correct + wrong)) * 100) : 0;
    return `Card Snap ${isDaily ? '(Daily)' : ''}\nScore: ${score} | Grade: ${grade.letter}\nAccuracy: ${accuracy}% | Streak: ${bestStreak}\nhttps://cardvault-two.vercel.app/card-snap`;
  }, [mode, score, grade, correct, wrong, bestStreak, isDaily]);

  return (
    <div>
      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Games Played', value: stats.gamesPlayed, icon: '\ud83c\udfae' },
          { label: 'Best Score', value: stats.bestScore, icon: '\ud83c\udfc6' },
          { label: 'Best Streak', value: stats.bestStreak, icon: '\ud83d\udd25' },
          { label: 'Accuracy', value: stats.totalSnaps > 0 ? `${Math.round((stats.totalCorrect / stats.totalSnaps) * 100)}%` : '—', icon: '\ud83c\udfaf' },
        ].map(s => (
          <div key={s.label} className="bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2 text-center">
            <div className="text-lg">{s.icon}</div>
            <div className="text-white font-bold text-lg">{s.value}</div>
            <div className="text-gray-400 text-xs">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Menu */}
      {mode === 'menu' && (
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 mb-8 text-center">
          <div className="text-5xl mb-4">\u26a1</div>
          <h2 className="text-2xl font-bold text-white mb-2">Card Snap!</h2>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Two cards flash on screen. Tap <strong className="text-green-400">SNAP</strong> if they share an attribute
            (same sport, player, decade, both rookies, both $50+, same set).
            Tap <strong className="text-red-400">PASS</strong> if they don&apos;t match.
            20 pairs. 60 seconds. Speed matters!
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => startGame(true)}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              Daily Challenge
            </button>
            <button
              onClick={() => startGame(false)}
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              Random Game
            </button>
          </div>

          {/* Match types legend */}
          <div className="mt-8 bg-gray-900/40 rounded-lg p-4 text-left max-w-md mx-auto">
            <h3 className="text-white font-bold text-sm mb-3">Match Types</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { icon: sportIcons.baseball, label: 'Same Sport', desc: 'Both baseball, both hockey, etc.' },
                { icon: '\ud83d\udc64', label: 'Same Player', desc: 'Two cards of the same player' },
                { icon: '\ud83d\udcc5', label: 'Same Decade', desc: '2020s, 2010s, 2000s, etc.' },
                { icon: '\u2b50', label: 'Both Rookies', desc: 'Both cards are rookie cards' },
                { icon: '\ud83d\udcb0', label: 'Both $50+', desc: 'Both worth $50 or more raw' },
                { icon: '\ud83d\udce6', label: 'Same Set', desc: 'Both from the same card set' },
              ].map(m => (
                <div key={m.label} className="flex items-start gap-2">
                  <span className="text-sm">{m.icon}</span>
                  <div>
                    <div className="text-white font-medium">{m.label}</div>
                    <div className="text-gray-500">{m.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Playing */}
      {mode === 'playing' && currentPair < pairs.length && (
        <div className="mb-8">
          {/* HUD */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-1.5">
                <span className="text-gray-400 text-xs">Score</span>
                <div className="text-white font-bold">{score}</div>
              </div>
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-1.5">
                <span className="text-gray-400 text-xs">Streak</span>
                <div className={`font-bold ${streak >= 3 ? 'text-yellow-400' : streak >= 2 ? 'text-green-400' : 'text-white'}`}>{streak}</div>
              </div>
            </div>
            <div className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
              {timeLeft}s
            </div>
            <div className="text-gray-400 text-sm">
              {currentPair + 1}/{pairs.length}
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-gray-800 rounded-full mb-6">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-300"
              style={{ width: `${((currentPair) / pairs.length) * 100}%` }}
            />
          </div>

          {/* Card pair */}
          <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-6">
            {[pairs[currentPair].left, pairs[currentPair].right].map((card, idx) => (
              <div
                key={idx}
                className={`${sportBg[card.sport]} border rounded-xl p-3 sm:p-5 transition-all`}
              >
                <div className={`text-xs font-medium ${sportColors[card.sport]} mb-1`}>
                  {sportIcons[card.sport]} {card.sport.charAt(0).toUpperCase() + card.sport.slice(1)}
                </div>
                <div className="text-white font-bold text-sm sm:text-base mb-1 line-clamp-2">{card.player}</div>
                <div className="text-gray-400 text-xs mb-2 line-clamp-1">{card.name}</div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-gray-500 text-xs">{card.year}</span>
                  {card.rookie && (
                    <span className="text-[10px] bg-yellow-900/40 text-yellow-400 px-1.5 py-0.5 rounded">RC</span>
                  )}
                  <span className="text-amber-400 text-xs font-medium">${parseValue(card.estimatedValueRaw)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Feedback overlay */}
          {feedback && (
            <div className={`text-center py-2 rounded-lg mb-4 text-sm font-bold ${
              feedback.type === 'correct' ? 'bg-green-950/50 text-green-400 border border-green-800/40' :
              feedback.type === 'wrong' ? 'bg-red-950/50 text-red-400 border border-red-800/40' :
              'bg-amber-950/50 text-amber-400 border border-amber-800/40'
            }`}>
              {feedback.text}
            </div>
          )}

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleSnap}
              disabled={!!feedback}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-colors text-lg"
            >
              SNAP!
            </button>
            <button
              onClick={handlePass}
              disabled={!!feedback}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-colors text-lg"
            >
              PASS
            </button>
          </div>
        </div>
      )}

      {/* Result */}
      {mode === 'result' && (
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 mb-8">
          <div className="text-center mb-6">
            <div className={`text-6xl font-bold ${grade.color} mb-2`}>{grade.letter}</div>
            <div className={`text-sm font-medium ${grade.color}`}>{grade.label}</div>
            <div className="text-white text-3xl font-bold mt-2">{score} pts</div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Correct', value: correct, color: 'text-green-400' },
              { label: 'Wrong', value: wrong, color: 'text-red-400' },
              { label: 'Best Streak', value: bestStreak, color: 'text-yellow-400' },
              { label: 'Accuracy', value: `${correct + wrong > 0 ? Math.round((correct / (correct + wrong)) * 100) : 0}%`, color: 'text-blue-400' },
            ].map(s => (
              <div key={s.label} className="bg-gray-900/40 rounded-lg p-3 text-center">
                <div className={`font-bold text-xl ${s.color}`}>{s.value}</div>
                <div className="text-gray-500 text-xs">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Share */}
          <button
            onClick={() => { navigator.clipboard.writeText(shareText); }}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 rounded-lg transition-colors text-sm mb-4"
          >
            Copy Results to Share
          </button>

          {/* Play again */}
          <div className="flex gap-3">
            <button
              onClick={() => startGame(true)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors"
            >
              Daily Again
            </button>
            <button
              onClick={() => startGame(false)}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition-colors"
            >
              Random
            </button>
            <button
              onClick={() => setMode('menu')}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-3 rounded-lg transition-colors"
            >
              Menu
            </button>
          </div>
        </div>
      )}

      {/* How It Works */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 mb-8">
        <h3 className="text-white font-bold mb-4">How to Play Card Snap</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { step: '1', title: 'Two Cards Appear', desc: 'Each round shows two sports cards side by side with their sport, player, year, rookie status, and value.' },
            { step: '2', title: 'Find the Match', desc: 'Look for shared attributes: same sport, same player, same decade, both rookies, both worth $50+, or same set.' },
            { step: '3', title: 'SNAP or PASS', desc: 'Tap SNAP if they match (10+ pts with speed bonus). Tap PASS if they don\'t (5 pts). Wrong answers cost -5 pts.' },
            { step: '4', title: 'Beat the Clock', desc: '20 pairs in 60 seconds. Build streaks for bonus points. Grade from S (200+) to F. Share your score!' },
          ].map(s => (
            <div key={s.step} className="flex gap-3">
              <div className="w-8 h-8 bg-green-600/20 border border-green-600/30 rounded-full flex items-center justify-center text-green-400 font-bold text-sm shrink-0">
                {s.step}
              </div>
              <div>
                <div className="text-white font-medium text-sm">{s.title}</div>
                <div className="text-gray-400 text-xs mt-0.5">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Related Links */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          { href: '/card-wordle', label: 'Card Wordle', desc: 'Guess the mystery player in 6 tries', icon: '\ud83d\udfe9' },
          { href: '/card-groups', label: 'Card Groups', desc: 'Sort 16 players into 4 categories', icon: '\ud83d\udfe6' },
          { href: '/card-streak', label: 'Card Streak', desc: 'Higher or lower card values', icon: '\ud83d\udd25' },
          { href: '/price-blitz', label: 'Price Blitz', desc: '20 cards in 60 seconds — over or under?', icon: '\u26a1' },
          { href: '/card-mystery-box', label: 'Mystery Box', desc: 'Pick mystery boxes, reveal your haul', icon: '\ud83c\udfb0' },
          { href: '/games', label: 'All Games', desc: 'Browse all card collecting games', icon: '\ud83c\udfae' },
        ].map(link => (
          <Link key={link.href} href={link.href} className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 hover:border-gray-600/50 transition-colors group">
            <div className="text-lg mb-1">{link.icon}</div>
            <div className="text-white text-sm font-medium group-hover:text-green-400 transition-colors">{link.label}</div>
            <div className="text-gray-500 text-xs">{link.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
