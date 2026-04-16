'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';

// ─── Types ───────────────────────────────────────────────────────────

interface CardInfo {
  slug: string;
  player: string;
  sport: string;
  year: number;
  set: string;
}

interface SetMatch {
  cards: CardInfo[];
  type: string;
  points: number;
}

interface GameStats {
  played: number;
  bestScore: number;
  totalSets: number;
  bestStreak: number;
  lastPlayDate: string;
}

type GamePhase = 'menu' | 'playing' | 'results';
type GameMode = 'daily' | 'random';

// ─── Helpers ─────────────────────────────────────────────────────────

const STORAGE_KEY = 'cardvault-set-rush';
const STATS_KEY = 'cardvault-set-rush-stats';
const GAME_DURATION = 60;

function dateHash(d: Date): number {
  const s = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-set-rush`;
  let h = 0;
  for (let i = 0; i < s.length; i++) { h = ((h << 5) - h + s.charCodeAt(i)) | 0; }
  return Math.abs(h);
}

function seededRng(seed: number) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

const sportColors: Record<string, string> = {
  baseball: 'bg-red-900/60 border-red-700 text-red-300',
  basketball: 'bg-orange-900/60 border-orange-700 text-orange-300',
  football: 'bg-blue-900/60 border-blue-700 text-blue-300',
  hockey: 'bg-cyan-900/60 border-cyan-700 text-cyan-300',
};

const sportEmoji: Record<string, string> = {
  baseball: '\u26BE',
  basketball: '\uD83C\uDFC0',
  football: '\uD83C\uDFC8',
  hockey: '\uD83C\uDFD2',
};

function getDecade(year: number): string {
  return `${Math.floor(year / 10) * 10}s`;
}

function findSetMatch(cards: (CardInfo | null)[]): { type: string; points: number } | null {
  const filled = cards.filter((c): c is CardInfo => c !== null);
  if (filled.length !== 3) return null;

  // Same player = 50 pts
  if (filled[0].player === filled[1].player && filled[1].player === filled[2].player) {
    return { type: `Same Player: ${filled[0].player}`, points: 50 };
  }
  // Same set = 40 pts
  if (filled[0].set === filled[1].set && filled[1].set === filled[2].set) {
    return { type: `Same Set: ${filled[0].set}`, points: 40 };
  }
  // Same year = 30 pts
  if (filled[0].year === filled[1].year && filled[1].year === filled[2].year) {
    return { type: `Same Year: ${filled[0].year}`, points: 30 };
  }
  // Same decade = 20 pts
  const d0 = getDecade(filled[0].year), d1 = getDecade(filled[1].year), d2 = getDecade(filled[2].year);
  if (d0 === d1 && d1 === d2) {
    return { type: `Same Decade: ${d0}`, points: 20 };
  }
  // Same sport = 10 pts
  if (filled[0].sport === filled[1].sport && filled[1].sport === filled[2].sport) {
    return { type: `Same Sport: ${filled[0].sport}`, points: 10 };
  }
  return null;
}

// ─── Component ───────────────────────────────────────────────────────

export default function CardSetRushClient({ cards }: { cards: CardInfo[] }) {
  const [phase, setPhase] = useState<GamePhase>('menu');
  const [mode, setMode] = useState<GameMode>('daily');
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [score, setScore] = useState(0);
  const [setsCompleted, setSetsCompleted] = useState<SetMatch[]>([]);
  const [streak, setStreak] = useState(0);
  const [bestStreakThisGame, setBestStreakThisGame] = useState(0);
  const [slots, setSlots] = useState<(CardInfo | null)[]>([null, null, null]);
  const [currentCard, setCurrentCard] = useState<CardInfo | null>(null);
  const [cardQueue, setCardQueue] = useState<CardInfo[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [discards, setDiscards] = useState(0);
  const [stats, setStats] = useState<GameStats>({ played: 0, bestScore: 0, totalSets: 0, bestStreak: 0, lastPlayDate: '' });
  const [dailyPlayed, setDailyPlayed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [flashSlot, setFlashSlot] = useState<number | null>(null);
  const [setFlash, setSetFlash] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load stats and daily state
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STATS_KEY);
      if (saved) setStats(JSON.parse(saved));
      const daily = localStorage.getItem(STORAGE_KEY);
      if (daily) {
        const d = JSON.parse(daily);
        if (d.date === todayStr()) setDailyPlayed(true);
      }
    } catch { /* ignore */ }
  }, []);

  // Generate shuffled card queue
  const generateQueue = useCallback((gameMode: GameMode) => {
    const seed = gameMode === 'daily' ? dateHash(new Date()) : Math.floor(Math.random() * 999999);
    const rng = seededRng(seed);
    const shuffled = [...cards].sort(() => rng() - 0.5);
    // Take first 100 cards for the round
    return shuffled.slice(0, 100);
  }, [cards]);

  // Start game
  const startGame = useCallback((gameMode: GameMode) => {
    const queue = generateQueue(gameMode);
    setMode(gameMode);
    setCardQueue(queue);
    setQueueIndex(0);
    setCurrentCard(queue[0]);
    setSlots([null, null, null]);
    setScore(0);
    setSetsCompleted([]);
    setStreak(0);
    setBestStreakThisGame(0);
    setDiscards(0);
    setTimeLeft(GAME_DURATION);
    setPhase('playing');
  }, [generateQueue]);

  // Timer
  useEffect(() => {
    if (phase !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setPhase('results');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  // Save results on game end
  useEffect(() => {
    if (phase !== 'results' || !mounted) return;
    const newStats: GameStats = {
      played: stats.played + 1,
      bestScore: Math.max(stats.bestScore, score),
      totalSets: stats.totalSets + setsCompleted.length,
      bestStreak: Math.max(stats.bestStreak, bestStreakThisGame),
      lastPlayDate: todayStr(),
    };
    setStats(newStats);
    localStorage.setItem(STATS_KEY, JSON.stringify(newStats));
    if (mode === 'daily') {
      setDailyPlayed(true);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: todayStr(), score, sets: setsCompleted.length }));
    }
  }, [phase]);

  // Advance to next card
  const nextCard = useCallback(() => {
    const next = queueIndex + 1;
    if (next < cardQueue.length) {
      setQueueIndex(next);
      setCurrentCard(cardQueue[next]);
    } else {
      setCurrentCard(null);
    }
  }, [queueIndex, cardQueue]);

  // Place card in slot
  const placeInSlot = useCallback((slotIdx: number) => {
    if (!currentCard || phase !== 'playing') return;
    if (slots[slotIdx] !== null) return; // slot occupied

    const newSlots = [...slots];
    newSlots[slotIdx] = currentCard;
    setSlots(newSlots);
    setFlashSlot(slotIdx);
    setTimeout(() => setFlashSlot(null), 300);

    // Check if set is complete
    const match = findSetMatch(newSlots);
    if (match) {
      const bonus = streak > 0 ? Math.min(streak * 5, 25) : 0;
      const totalPts = match.points + bonus;
      setScore(prev => prev + totalPts);
      const newStreak = streak + 1;
      setStreak(newStreak);
      setBestStreakThisGame(prev => Math.max(prev, newStreak));
      setSetsCompleted(prev => [...prev, { cards: newSlots.filter((c): c is CardInfo => c !== null), ...match }]);
      setSetFlash(true);
      setTimeout(() => {
        setSlots([null, null, null]);
        setSetFlash(false);
      }, 600);
    }

    nextCard();
  }, [currentCard, slots, phase, streak, nextCard]);

  // Discard current card
  const discardCard = useCallback(() => {
    if (!currentCard || phase !== 'playing') return;
    setDiscards(prev => prev + 1);
    setStreak(0);
    nextCard();
  }, [currentCard, phase, nextCard]);

  // Clear a slot (return card to discard)
  const clearSlot = useCallback((slotIdx: number) => {
    if (phase !== 'playing' || slots[slotIdx] === null) return;
    const newSlots = [...slots];
    newSlots[slotIdx] = null;
    setSlots(newSlots);
  }, [phase, slots]);

  // Share results
  const shareResults = useCallback(() => {
    const text = [
      `Card Set Rush ${mode === 'daily' ? '(Daily)' : '(Random)'} - ${todayStr()}`,
      `Score: ${score} | Sets: ${setsCompleted.length} | Streak: ${bestStreakThisGame}`,
      setsCompleted.map(s => `${s.type} (+${s.points})`).slice(0, 5).join('\n'),
      setsCompleted.length > 5 ? `...and ${setsCompleted.length - 5} more` : '',
      'https://cardvault-two.vercel.app/card-set-rush',
    ].filter(Boolean).join('\n');
    navigator.clipboard.writeText(text);
  }, [mode, score, setsCompleted, bestStreakThisGame]);

  if (!mounted) return <div className="text-gray-500 text-center py-20">Loading...</div>;

  // ─── Menu ──────────────────────────────────────────────────────────
  if (phase === 'menu') {
    return (
      <div className="space-y-6">
        {/* How to play */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-3">How to Play</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-400">
            <div className="bg-gray-800/50 rounded-xl p-3">
              <div className="text-2xl mb-1">&#127183;</div>
              <p className="text-white font-medium">Place Cards</p>
              <p>Cards appear one at a time. Place each into one of 3 slots.</p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-3">
              <div className="text-2xl mb-1">&#9989;</div>
              <p className="text-white font-medium">Build Sets</p>
              <p>Fill all 3 slots with cards sharing an attribute to score.</p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-3">
              <div className="text-2xl mb-1">&#9201;</div>
              <p className="text-white font-medium">Beat the Clock</p>
              <p>60 seconds. Build as many sets as possible. Streak = bonus points!</p>
            </div>
          </div>
        </div>

        {/* Scoring */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-3">Scoring</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-sm">
            {[
              { label: 'Same Player', pts: 50, color: 'text-yellow-400' },
              { label: 'Same Set', pts: 40, color: 'text-purple-400' },
              { label: 'Same Year', pts: 30, color: 'text-emerald-400' },
              { label: 'Same Decade', pts: 20, color: 'text-blue-400' },
              { label: 'Same Sport', pts: 10, color: 'text-gray-400' },
            ].map(s => (
              <div key={s.label} className="bg-gray-800/50 rounded-lg p-2 text-center">
                <div className={`font-bold ${s.color}`}>+{s.pts}</div>
                <div className="text-gray-500 text-xs">{s.label}</div>
              </div>
            ))}
          </div>
          <p className="text-gray-500 text-xs mt-2">Streak bonus: +5 per consecutive set (max +25)</p>
        </div>

        {/* Start buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => startGame('daily')}
            disabled={dailyPlayed}
            className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all ${dailyPlayed ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}
          >
            {dailyPlayed ? 'Daily Complete' : 'Daily Rush'}
          </button>
          <button
            onClick={() => startGame('random')}
            className="flex-1 py-4 rounded-xl font-bold text-lg bg-violet-600 hover:bg-violet-500 text-white transition-all"
          >
            Random Rush
          </button>
        </div>

        {/* Stats */}
        {stats.played > 0 && (
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Played', value: stats.played },
              { label: 'Best Score', value: stats.bestScore },
              { label: 'Total Sets', value: stats.totalSets },
              { label: 'Best Streak', value: stats.bestStreak },
            ].map(s => (
              <div key={s.label} className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
                <div className="text-white text-xl font-bold">{s.value}</div>
                <div className="text-gray-500 text-xs">{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ─── Playing ───────────────────────────────────────────────────────
  if (phase === 'playing') {
    const timerPct = (timeLeft / GAME_DURATION) * 100;
    const timerColor = timeLeft > 20 ? 'bg-emerald-500' : timeLeft > 10 ? 'bg-amber-500' : 'bg-red-500';

    return (
      <div className="space-y-4">
        {/* Timer bar */}
        <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden">
          <div className={`h-full ${timerColor} transition-all duration-1000 rounded-full`} style={{ width: `${timerPct}%` }} />
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="text-white font-bold text-lg">{timeLeft}s</span>
            <span className="text-emerald-400 font-medium">Score: {score}</span>
            <span className="text-violet-400">Sets: {setsCompleted.length}</span>
          </div>
          {streak > 0 && (
            <span className="text-amber-400 font-medium animate-pulse">Streak: {streak}x (+{Math.min(streak * 5, 25)} bonus)</span>
          )}
        </div>

        {/* Current card */}
        <div className="bg-gray-900/80 border border-gray-700 rounded-2xl p-4">
          <div className="text-gray-500 text-xs mb-2 uppercase tracking-wider">Current Card ({queueIndex + 1}/{cardQueue.length})</div>
          {currentCard ? (
            <div className={`border rounded-xl p-4 ${sportColors[currentCard.sport] || 'bg-gray-800 border-gray-700 text-gray-300'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-lg">{sportEmoji[currentCard.sport]} {currentCard.player}</div>
                  <div className="text-sm opacity-80">{currentCard.year} {currentCard.set}</div>
                </div>
                <div className="text-xs uppercase opacity-60">{currentCard.sport}</div>
              </div>
            </div>
          ) : (
            <div className="text-gray-600 text-center py-4">No more cards!</div>
          )}
        </div>

        {/* Slots */}
        <div className={`grid grid-cols-3 gap-3 transition-all ${setFlash ? 'scale-95 opacity-50' : ''}`}>
          {slots.map((slot, i) => (
            <button
              key={i}
              onClick={() => slot ? clearSlot(i) : placeInSlot(i)}
              className={`relative min-h-[100px] rounded-xl border-2 border-dashed transition-all ${
                slot
                  ? `${sportColors[slot.sport] || 'bg-gray-800 border-gray-600 text-gray-300'} border-solid`
                  : flashSlot === i
                    ? 'bg-emerald-900/30 border-emerald-500'
                    : 'bg-gray-900/40 border-gray-700 hover:border-gray-500'
              }`}
            >
              {slot ? (
                <div className="p-3 text-left">
                  <div className="font-bold text-sm">{sportEmoji[slot.sport]} {slot.player}</div>
                  <div className="text-xs opacity-70 mt-1">{slot.year} {slot.set}</div>
                  <div className="absolute top-1 right-2 text-xs opacity-50">tap to clear</div>
                </div>
              ) : (
                <div className="text-gray-600 text-sm">Slot {i + 1}</div>
              )}
            </button>
          ))}
        </div>

        {/* Set match hint */}
        {(() => {
          const filled = slots.filter(s => s !== null);
          if (filled.length === 2) {
            const s0 = filled[0]!, s1 = filled[1]!;
            const hints: string[] = [];
            if (s0.player === s1.player) hints.push(`Same player: ${s0.player}`);
            if (s0.set === s1.set) hints.push(`Same set: ${s0.set}`);
            if (s0.year === s1.year) hints.push(`Same year: ${s0.year}`);
            if (getDecade(s0.year) === getDecade(s1.year)) hints.push(`Same decade: ${getDecade(s0.year)}`);
            if (s0.sport === s1.sport) hints.push(`Same sport: ${s0.sport}`);
            if (hints.length > 0) {
              return (
                <div className="text-xs text-amber-400/80 text-center">
                  Matching: {hints.join(' | ')}
                </div>
              );
            }
          }
          return null;
        })()}

        {/* Discard button */}
        <button
          onClick={discardCard}
          disabled={!currentCard}
          className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-xl text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Skip Card (breaks streak)
        </button>

        {/* Recent sets */}
        {setsCompleted.length > 0 && (
          <div className="text-xs text-gray-500">
            Last set: <span className="text-emerald-400">{setsCompleted[setsCompleted.length - 1].type}</span> (+{setsCompleted[setsCompleted.length - 1].points})
          </div>
        )}
      </div>
    );
  }

  // ─── Results ───────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Score hero */}
      <div className="bg-gradient-to-br from-emerald-900/40 to-violet-900/40 border border-emerald-800/50 rounded-2xl p-6 text-center">
        <div className="text-6xl font-black text-white mb-2">{score}</div>
        <div className="text-emerald-400 font-medium text-lg">Points Scored</div>
        <div className="flex justify-center gap-6 mt-4 text-sm">
          <div>
            <span className="text-white font-bold">{setsCompleted.length}</span>
            <span className="text-gray-500 ml-1">Sets</span>
          </div>
          <div>
            <span className="text-white font-bold">{bestStreakThisGame}</span>
            <span className="text-gray-500 ml-1">Best Streak</span>
          </div>
          <div>
            <span className="text-white font-bold">{discards}</span>
            <span className="text-gray-500 ml-1">Discards</span>
          </div>
          <div>
            <span className="text-white font-bold">{queueIndex + 1}</span>
            <span className="text-gray-500 ml-1">Cards Seen</span>
          </div>
        </div>
      </div>

      {/* Grade */}
      <div className="text-center">
        <span className={`text-4xl font-black ${
          score >= 200 ? 'text-yellow-400' :
          score >= 150 ? 'text-emerald-400' :
          score >= 100 ? 'text-blue-400' :
          score >= 50 ? 'text-gray-300' : 'text-gray-600'
        }`}>
          {score >= 200 ? 'S' : score >= 150 ? 'A' : score >= 100 ? 'B' : score >= 50 ? 'C' : 'D'}
        </span>
        <span className="text-gray-500 text-sm ml-2">
          {score >= 200 ? 'Set Master!' :
           score >= 150 ? 'Excellent!' :
           score >= 100 ? 'Great Job!' :
           score >= 50 ? 'Not Bad!' : 'Keep Practicing!'}
        </span>
      </div>

      {/* Sets breakdown */}
      {setsCompleted.length > 0 && (
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4">
          <h3 className="text-white font-semibold mb-3">Sets Built ({setsCompleted.length})</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {setsCompleted.map((s, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-800/50 rounded-lg px-3 py-2 text-sm">
                <div>
                  <span className="text-emerald-400 font-medium">{s.type}</span>
                  <div className="text-gray-600 text-xs mt-0.5">
                    {s.cards.map(c => c.player).join(', ')}
                  </div>
                </div>
                <span className="text-white font-bold">+{s.points}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={shareResults} className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-all">
          Copy Results
        </button>
        <button onClick={() => startGame('random')} className="flex-1 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium transition-all">
          Play Again (Random)
        </button>
        <button onClick={() => setPhase('menu')} className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-xl font-medium transition-all">
          Back to Menu
        </button>
      </div>

      {/* All-time stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Played', value: stats.played },
          { label: 'Best Score', value: stats.bestScore },
          { label: 'Total Sets', value: stats.totalSets },
          { label: 'Best Streak', value: stats.bestStreak },
        ].map(s => (
          <div key={s.label} className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
            <div className="text-white text-xl font-bold">{s.value}</div>
            <div className="text-gray-500 text-xs">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
