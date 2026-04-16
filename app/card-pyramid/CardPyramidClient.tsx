'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { sportsCards } from '@/data/sports-cards';

// --- Types ---
type Sport = 'baseball' | 'basketball' | 'football' | 'hockey';

interface PyramidCard {
  id: number;           // position 0-20 in pyramid
  card: typeof sportsCards[0];
  value: number;        // parsed dollar value
  removed: boolean;
  selected: boolean;
}

interface GameStats {
  gamesPlayed: number;
  wins: number;
  bestScore: number;
  longestStreak: number;
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

function parseValue(val: string): number {
  const m = val.match(/\$([0-9,.]+)/);
  return m ? parseFloat(m[1].replace(',', '')) : 5;
}

// Pyramid structure: row 0 = top (1 card), row 5 = bottom (6 cards)
// Card at position p in row r is covered by cards at positions in row r+1:
// specifically, row r card at index i is covered by row (r+1) cards at index i and i+1
// We store all 21 cards flat: row 0 = index 0, row 1 = [1,2], row 2 = [3,4,5], etc.
function rowStart(row: number): number {
  return (row * (row + 1)) / 2;
}

function isExposed(id: number, cards: PyramidCard[]): boolean {
  // Find which row this card is in
  let row = 0;
  while (rowStart(row + 1) <= id) row++;
  const indexInRow = id - rowStart(row);

  // If it's the bottom row (row 5), always exposed
  if (row === 5) return true;

  // Cards in row below that cover this card: same index and index+1 in row+1
  const lowerLeft = rowStart(row + 1) + indexInRow;
  const lowerRight = rowStart(row + 1) + indexInRow + 1;

  return cards[lowerLeft].removed && cards[lowerRight].removed;
}

const sportColors: Record<string, string> = {
  baseball: 'text-red-400',
  basketball: 'text-orange-400',
  football: 'text-blue-400',
  hockey: 'text-cyan-400',
};

const sportBadgeBg: Record<string, string> = {
  baseball: 'bg-red-900/50 border-red-700/50',
  basketball: 'bg-orange-900/50 border-orange-700/50',
  football: 'bg-blue-900/50 border-blue-700/50',
  hockey: 'bg-cyan-900/50 border-cyan-700/50',
};

const sportAbbr: Record<string, string> = {
  baseball: 'MLB',
  basketball: 'NBA',
  football: 'NFL',
  hockey: 'NHL',
};

// Build pyramid from seeded random selection of 21 cards
function buildPyramid(seed: number): { cards: PyramidCard[]; targetSum: number } {
  const rng = seededRng(seed);

  // Shuffle a copy of the cards
  const pool = [...sportsCards];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  // Pick first 21
  const selected = pool.slice(0, 21);
  const values = selected.map(c => parseValue(c.estimatedValueRaw));

  // Compute target sum: median of all pairwise sums (sample-based)
  const pairSums: number[] = [];
  for (let i = 0; i < values.length; i++) {
    for (let j = i + 1; j < values.length; j++) {
      pairSums.push(values[i] + values[j]);
    }
  }
  pairSums.sort((a, b) => a - b);
  const medianSum = pairSums[Math.floor(pairSums.length / 2)];

  // Count valid pairs with this target
  const TOLERANCE = 5;
  let validPairCount = 0;
  for (let i = 0; i < values.length; i++) {
    for (let j = i + 1; j < values.length; j++) {
      if (Math.abs(values[i] + values[j] - medianSum) <= TOLERANCE) {
        validPairCount++;
      }
    }
  }

  // If fewer than 3 valid pairs, widen tolerance or use different target
  let targetSum = medianSum;
  if (validPairCount < 3) {
    // Find the sum that maximises pairs within tolerance
    const candidates = [...new Set(pairSums)];
    let bestCount = 0;
    for (const candidate of candidates) {
      let count = 0;
      for (let i = 0; i < values.length; i++) {
        for (let j = i + 1; j < values.length; j++) {
          if (Math.abs(values[i] + values[j] - candidate) <= TOLERANCE) count++;
        }
      }
      if (count > bestCount) {
        bestCount = count;
        targetSum = candidate;
      }
    }
  }

  const cards: PyramidCard[] = selected.map((card, id) => ({
    id,
    card,
    value: values[id],
    removed: false,
    selected: false,
  }));

  return { cards, targetSum };
}

// Check if any valid pair exists among exposed cards
function hasValidPairs(cards: PyramidCard[], targetSum: number): boolean {
  const TOLERANCE = 5;
  const exposed = cards.filter(c => !c.removed && isExposed(c.id, cards));
  for (let i = 0; i < exposed.length; i++) {
    for (let j = i + 1; j < exposed.length; j++) {
      if (Math.abs(exposed[i].value + exposed[j].value - targetSum) <= TOLERANCE) {
        return true;
      }
    }
  }
  return false;
}

function computeGrade(cleared: number, totalSeconds: number): { letter: string; color: string; label: string } {
  // Base: cleared / 21; bonus for speed
  const pct = cleared / 21;
  if (cleared === 21 && totalSeconds < 60) return { letter: 'S', color: 'text-yellow-400', label: 'LEGENDARY' };
  if (cleared === 21) return { letter: 'A', color: 'text-green-400', label: 'CLEARED!' };
  if (pct >= 0.85) return { letter: 'B', color: 'text-blue-400', label: 'GREAT' };
  if (pct >= 0.65) return { letter: 'C', color: 'text-purple-400', label: 'GOOD' };
  if (pct >= 0.45) return { letter: 'D', color: 'text-orange-400', label: 'FAIR' };
  return { letter: 'F', color: 'text-red-400', label: 'STUCK' };
}

export default function CardPyramidClient() {
  const [mode, setMode] = useState<'menu' | 'playing' | 'result'>('menu');
  const [isDaily, setIsDaily] = useState(true);
  const [cards, setCards] = useState<PyramidCard[]>([]);
  const [targetSum, setTargetSum] = useState(0);
  const [moves, setMoves] = useState(0);
  const [cleared, setCleared] = useState(0);
  const [score, setScore] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [hint, setHint] = useState<[number, number] | null>(null);
  const [flash, setFlash] = useState<{ type: 'good' | 'bad'; text: string } | null>(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [stats, setStats] = useState<GameStats>({
    gamesPlayed: 0, wins: 0, bestScore: 0, longestStreak: 0,
  });

  // Load stats from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cardvault-pyramid-stats');
      if (saved) setStats(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  const saveStats = useCallback((s: GameStats) => {
    setStats(s);
    try { localStorage.setItem('cardvault-pyramid-stats', JSON.stringify(s)); } catch { /* ignore */ }
  }, []);

  // Timer
  useEffect(() => {
    if (mode !== 'playing') return;
    timerRef.current = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [mode]);

  const startGame = useCallback((daily: boolean) => {
    const seed = daily ? dateHash() : Date.now();
    const { cards: newCards, targetSum: ts } = buildPyramid(seed);
    setCards(newCards);
    setTargetSum(ts);
    setMoves(0);
    setCleared(0);
    setScore(0);
    setSeconds(0);
    setHint(null);
    setFlash(null);
    setCurrentStreak(0);
    setIsDaily(daily);
    setMode('playing');
  }, []);

  const endGame = useCallback((finalCleared: number, finalScore: number, finalSeconds: number, won: boolean) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setMode('result');

    const newStats: GameStats = {
      gamesPlayed: stats.gamesPlayed + 1,
      wins: stats.wins + (won ? 1 : 0),
      bestScore: Math.max(stats.bestScore, finalScore),
      longestStreak: Math.max(stats.longestStreak, currentStreak),
    };
    saveStats(newStats);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats, currentStreak, saveStats]);

  const selectedCard = useMemo(() => cards.find(c => c.selected), [cards]);

  const handleCardClick = useCallback((id: number) => {
    if (mode !== 'playing') return;
    const card = cards[id];
    if (card.removed) return;
    if (!isExposed(id, cards)) return;

    setHint(null);

    if (!selectedCard) {
      // Select this card
      setCards(prev => prev.map(c => c.id === id ? { ...c, selected: true } : c));
      return;
    }

    if (selectedCard.id === id) {
      // Deselect
      setCards(prev => prev.map(c => c.id === id ? { ...c, selected: false } : c));
      return;
    }

    // Try to match
    const TOLERANCE = 5;
    const sum = selectedCard.value + card.value;
    if (Math.abs(sum - targetSum) <= TOLERANCE) {
      // Valid pair!
      const newCards = cards.map(c =>
        (c.id === selectedCard.id || c.id === id) ? { ...c, removed: true, selected: false } : { ...c, selected: false }
      );
      const newCleared = cleared + 2;
      const pairScore = 200; // 100 per card
      const newScore = score + pairScore;
      const newStreak = currentStreak + 1;

      setCards(newCards);
      setCleared(newCleared);
      setScore(newScore);
      setMoves(m => m + 1);
      setCurrentStreak(newStreak);
      setFlash({ type: 'good', text: `+${pairScore} pts! $${selectedCard.value} + $${card.value} = $${sum.toFixed(0)}` });

      setTimeout(() => setFlash(null), 1200);

      // Check win
      if (newCleared === 21) {
        const speedBonus = Math.max(0, Math.floor(3000 / Math.max(seconds + 1, 1)));
        const finalScore = newScore + speedBonus;
        setScore(finalScore);
        setTimeout(() => endGame(newCleared, finalScore, seconds, true), 800);
        return;
      }

      // Check no more pairs
      if (!hasValidPairs(newCards, targetSum)) {
        setTimeout(() => endGame(newCleared, newScore, seconds, false), 800);
        return;
      }
    } else {
      // Invalid pair
      setCurrentStreak(0);
      setCards(prev => prev.map(c => ({ ...c, selected: false })));
      setFlash({ type: 'bad', text: `$${selectedCard.value} + $${card.value} = $${sum.toFixed(0)} — target is ~$${targetSum.toFixed(0)}` });
      setTimeout(() => setFlash(null), 1200);
    }
  }, [mode, cards, selectedCard, targetSum, cleared, score, seconds, currentStreak, endGame]);

  const handleHint = useCallback(() => {
    const TOLERANCE = 5;
    const exposed = cards.filter(c => !c.removed && isExposed(c.id, cards));
    for (let i = 0; i < exposed.length; i++) {
      for (let j = i + 1; j < exposed.length; j++) {
        if (Math.abs(exposed[i].value + exposed[j].value - targetSum) <= TOLERANCE) {
          setHint([exposed[i].id, exposed[j].id]);
          // Deselect any selected card
          setCards(prev => prev.map(c => ({ ...c, selected: false })));
          return;
        }
      }
    }
    setFlash({ type: 'bad', text: 'No valid pairs remaining!' });
    setTimeout(() => setFlash(null), 1500);
  }, [cards, targetSum]);

  const grade = useMemo(() => computeGrade(cleared, seconds), [cleared, seconds]);

  const shareText = useMemo(() => {
    if (mode !== 'result') return '';
    const g = computeGrade(cleared, seconds);
    return `Card Pyramid Solitaire ${isDaily ? '(Daily)' : ''}\nScore: ${score} | Grade: ${g.letter}\nCleared: ${cleared}/21 | Moves: ${moves}\nhttps://cardvault-two.vercel.app/card-pyramid`;
  }, [mode, score, cleared, moves, seconds, isDaily]);

  // Format time
  function formatTime(s: number): string {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  // Pyramid layout: row r has (r+1) cards, centered
  const rows = useMemo(() => {
    if (cards.length === 0) return [];
    const result: PyramidCard[][] = [];
    for (let r = 0; r < 6; r++) {
      const start = rowStart(r);
      const rowCards = cards.slice(start, start + r + 1);
      result.push(rowCards);
    }
    return result;
  }, [cards]);

  return (
    <div>
      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Games', value: stats.gamesPlayed, icon: '\ud83c\udfae' },
          { label: 'Wins', value: stats.wins, icon: '\ud83c\udfc6' },
          { label: 'Best Score', value: stats.bestScore, icon: '\u2b50' },
          { label: 'Best Streak', value: stats.longestStreak, icon: '\ud83d\udd25' },
        ].map(s => (
          <div key={s.label} className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-3 py-2 text-center">
            <div className="text-lg">{s.icon}</div>
            <div className="text-white font-bold text-lg">{s.value}</div>
            <div className="text-zinc-400 text-xs">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Menu */}
      {mode === 'menu' && (
        <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-6 mb-8 text-center">
          <div className="text-5xl mb-4">\ud83c\udfb2</div>
          <h2 className="text-2xl font-bold text-white mb-2">Card Pyramid Solitaire</h2>
          <p className="text-zinc-400 mb-6 max-w-md mx-auto">
            21 real sports cards arranged in a pyramid. Select two <strong className="text-purple-400">exposed</strong> cards
            whose values add up to the <strong className="text-purple-400">target sum</strong> (within $5) to remove them.
            Clear all 21 cards to win!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => startGame(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              Daily Challenge
            </button>
            <button
              onClick={() => startGame(false)}
              className="bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              Random Game
            </button>
          </div>

          <div className="mt-8 bg-zinc-900/50 rounded-lg p-4 text-left max-w-md mx-auto">
            <h3 className="text-white font-bold text-sm mb-3">How to Play</h3>
            <div className="space-y-2 text-xs text-zinc-400">
              {[
                'Cards in the bottom row and any unblocked cards are exposed (selectable)',
                'Pick two exposed cards whose values sum to within $5 of the target',
                'Matched pairs are removed, exposing cards above them',
                'Clear all 21 cards for maximum score — speed bonus rewards fast clears',
                'Use the Hint button to reveal a valid pair (free!)',
              ].map((tip, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-purple-400 shrink-0">{i + 1}.</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Playing */}
      {mode === 'playing' && (
        <div className="mb-8">
          {/* HUD */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-3 py-1.5 text-center">
                <div className="text-zinc-400 text-xs">Score</div>
                <div className="text-white font-bold">{score}</div>
              </div>
              <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-3 py-1.5 text-center">
                <div className="text-zinc-400 text-xs">Cleared</div>
                <div className="text-white font-bold">{cleared}/21</div>
              </div>
              <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-3 py-1.5 text-center">
                <div className="text-zinc-400 text-xs">Moves</div>
                <div className="text-white font-bold">{moves}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-3 py-1.5 text-center">
                <div className="text-zinc-400 text-xs">Time</div>
                <div className="text-white font-bold font-mono">{formatTime(seconds)}</div>
              </div>
              <div className="bg-purple-950/60 border border-purple-700/50 rounded-lg px-3 py-1.5 text-center">
                <div className="text-purple-300 text-xs">Target Sum</div>
                <div className="text-purple-200 font-bold">${targetSum.toFixed(0)} ±$5</div>
              </div>
            </div>
          </div>

          {/* Flash message */}
          {flash && (
            <div className={`text-center py-2 rounded-lg mb-4 text-sm font-bold transition-all ${
              flash.type === 'good'
                ? 'bg-green-950/50 text-green-400 border border-green-800/40'
                : 'bg-red-950/50 text-red-400 border border-red-800/40'
            }`}>
              {flash.text}
            </div>
          )}

          {/* Pyramid */}
          <div className="bg-zinc-900/60 border border-zinc-700/50 rounded-xl p-4 sm:p-6 mb-4 overflow-x-auto">
            <div className="flex flex-col items-center gap-1 sm:gap-2 min-w-[320px]">
              {rows.map((row, rowIdx) => {
                const exposed = row.map(c => isExposed(c.id, cards));
                return (
                  <div key={rowIdx} className="flex gap-1 sm:gap-2">
                    {row.map((c, colIdx) => {
                      const isExp = exposed[colIdx];
                      const isSelected = c.selected;
                      const isHinted = hint && (hint[0] === c.id || hint[1] === c.id);
                      const isRemoved = c.removed;

                      if (isRemoved) {
                        return (
                          <div
                            key={c.id}
                            className="w-16 sm:w-20 h-20 sm:h-24 rounded-lg border border-zinc-800/30 bg-zinc-900/20 opacity-20"
                          />
                        );
                      }

                      return (
                        <button
                          key={c.id}
                          onClick={() => handleCardClick(c.id)}
                          disabled={!isExp}
                          className={[
                            'w-16 sm:w-20 h-20 sm:h-24 rounded-lg border text-left p-1.5 sm:p-2 transition-all relative overflow-hidden',
                            isSelected
                              ? 'border-purple-400 bg-purple-950/60 ring-2 ring-purple-400/50 scale-105'
                              : isHinted
                              ? 'border-yellow-400 bg-yellow-950/40 ring-2 ring-yellow-400/50 animate-pulse'
                              : isExp
                              ? 'border-zinc-600/50 bg-zinc-800/70 hover:border-purple-500/60 hover:bg-zinc-700/70 cursor-pointer'
                              : 'border-zinc-800/50 bg-zinc-900/50 cursor-not-allowed',
                          ].join(' ')}
                        >
                          {/* Dim overlay for unexposed */}
                          {!isExp && (
                            <div className="absolute inset-0 bg-zinc-900/50 rounded-lg" />
                          )}
                          <div className={`text-[10px] font-medium mb-0.5 ${sportColors[c.card.sport] || 'text-zinc-400'}`}>
                            {sportAbbr[c.card.sport] || c.card.sport}
                          </div>
                          <div className="text-white text-[10px] sm:text-xs font-bold leading-tight line-clamp-2 mb-1">
                            {c.card.player.split(' ').slice(-1)[0]}
                          </div>
                          <div className={`text-xs font-bold ${c.value >= 100 ? 'text-yellow-400' : c.value >= 25 ? 'text-amber-400' : 'text-zinc-300'}`}>
                            ${c.value >= 1000 ? `${(c.value / 1000).toFixed(1)}k` : c.value.toFixed(0)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleHint}
              className="bg-yellow-700/70 hover:bg-yellow-700 text-yellow-200 font-medium py-2 px-5 rounded-lg transition-colors text-sm"
            >
              Hint
            </button>
            <button
              onClick={() => startGame(isDaily)}
              className="bg-zinc-700 hover:bg-zinc-600 text-white font-medium py-2 px-5 rounded-lg transition-colors text-sm"
            >
              New Game
            </button>
            <button
              onClick={() => {
                if (timerRef.current) clearInterval(timerRef.current);
                setMode('menu');
              }}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium py-2 px-5 rounded-lg transition-colors text-sm"
            >
              Menu
            </button>
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-3 text-xs text-zinc-500">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded border border-purple-400 bg-purple-950/60 inline-block" />
              Selected
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded border border-yellow-400 bg-yellow-950/40 inline-block" />
              Hint pair
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded border border-zinc-600 bg-zinc-800/70 inline-block" />
              Exposed (selectable)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded border border-zinc-800 bg-zinc-900/50 inline-block" />
              Blocked
            </span>
          </div>
        </div>
      )}

      {/* Result */}
      {mode === 'result' && (
        <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-6 mb-8">
          <div className="text-center mb-6">
            <div className={`text-6xl font-bold ${grade.color} mb-1`}>{grade.letter}</div>
            <div className={`text-sm font-medium ${grade.color} mb-2`}>{grade.label}</div>
            <div className="text-white text-3xl font-bold">{score} pts</div>
            {cleared === 21 && (
              <div className="mt-2 text-green-400 font-bold text-lg">\ud83c\udf89 Pyramid Cleared!</div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Cards Cleared', value: `${cleared}/21`, color: 'text-purple-400' },
              { label: 'Moves', value: moves, color: 'text-blue-400' },
              { label: 'Time', value: formatTime(seconds), color: 'text-zinc-300' },
              { label: 'Pairs Made', value: Math.floor(cleared / 2), color: 'text-green-400' },
            ].map(s => (
              <div key={s.label} className="bg-zinc-900/40 rounded-lg p-3 text-center">
                <div className={`font-bold text-xl ${s.color}`}>{s.value}</div>
                <div className="text-zinc-500 text-xs">{s.label}</div>
              </div>
            ))}
          </div>

          <button
            onClick={() => { try { navigator.clipboard.writeText(shareText); } catch { /* ignore */ } }}
            className="w-full bg-zinc-700 hover:bg-zinc-600 text-white font-medium py-2 rounded-lg transition-colors text-sm mb-4"
          >
            Copy Results to Share
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => startGame(true)}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-colors"
            >
              Daily
            </button>
            <button
              onClick={() => startGame(false)}
              className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-3 rounded-lg transition-colors"
            >
              Random
            </button>
            <button
              onClick={() => setMode('menu')}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium py-3 rounded-lg transition-colors"
            >
              Menu
            </button>
          </div>
        </div>
      )}

      {/* How It Works */}
      {mode !== 'playing' && (
        <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-6 mb-8">
          <h3 className="text-white font-bold mb-4">How Card Pyramid Solitaire Works</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { step: '1', title: '6-Row Pyramid', desc: '21 cards arranged in a pyramid — 1 card at the top, 6 at the bottom. Cards are drawn from the 9,000+ CardVault database.' },
              { step: '2', title: 'Expose Cards', desc: 'Only cards with nothing blocking them below are selectable. Clear the bottom rows to unlock the pyramid above.' },
              { step: '3', title: 'Match the Target', desc: 'Select two exposed cards whose dollar values add up within $5 of the target sum shown. Both cards are removed.' },
              { step: '4', title: 'Clear & Score', desc: 'Each cleared card is worth 100 pts (200 per pair). Clear all 21 for a speed bonus. Grade from S (legendary clear) to F.' },
            ].map(s => (
              <div key={s.step} className="flex gap-3">
                <div className="w-8 h-8 bg-purple-600/20 border border-purple-600/30 rounded-full flex items-center justify-center text-purple-400 font-bold text-sm shrink-0">
                  {s.step}
                </div>
                <div>
                  <div className="text-white font-medium text-sm">{s.title}</div>
                  <div className="text-zinc-400 text-xs mt-0.5">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
