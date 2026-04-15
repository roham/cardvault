'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { sportsCards } from '@/data/sports-cards';
import Link from 'next/link';

// ── Helpers ──────────────────────────────────────────────────────────────────

function seededRng(seed: number) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
}

function dateHash(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function scrambleWord(word: string, rng: () => number): string {
  const letters = word.split('');
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }
  const result = letters.join('');
  // If scramble is identical to original, swap first two letters
  if (result.toLowerCase() === word.toLowerCase() && word.length > 1) {
    [letters[0], letters[1]] = [letters[1], letters[0]];
    return letters.join('');
  }
  return result;
}

// ── Word Banks ──────────────────────────────────────────────────────────────

const hobbyTerms = [
  { word: 'ROOKIE', hint: 'A player\'s first-year card' },
  { word: 'GRADING', hint: 'Process of professionally evaluating card condition' },
  { word: 'REFRACTOR', hint: 'Shiny chromium parallel card type' },
  { word: 'PARALLEL', hint: 'Alternate version of a base card' },
  { word: 'INSERT', hint: 'Special card randomly placed in packs' },
  { word: 'CENTERING', hint: 'How evenly the image is positioned on the card' },
  { word: 'VINTAGE', hint: 'Cards from the pre-1980 era' },
  { word: 'SLAB', hint: 'Protective case from a grading company' },
  { word: 'BLASTER', hint: 'Retail box typically found at Target/Walmart' },
  { word: 'CHECKLIST', hint: 'Complete list of all cards in a set' },
  { word: 'SERIAL', hint: '___ numbered — limited print run cards' },
  { word: 'HOBBY', hint: '___ box — premium sealed product for collectors' },
  { word: 'PATCH', hint: 'Card with piece of a game-worn jersey embedded' },
  { word: 'CHROME', hint: 'Premium Topps card line with glossy finish' },
  { word: 'PRIZM', hint: 'Popular Panini card line with colorful parallels' },
  { word: 'FLIPPING', hint: 'Buying and reselling cards for profit' },
  { word: 'WAXPACK', hint: 'Old-school card package sealed with wax paper' },
  { word: 'PROSPECT', hint: 'Up-and-coming player expected to be a star' },
  { word: 'PREMIUM', hint: 'Higher-end product with better hits' },
  { word: 'TOPLOADER', hint: 'Rigid plastic card protector' },
  { word: 'AUTOGRAPH', hint: 'Card with a real player signature' },
  { word: 'BREAKOUT', hint: 'Player whose card value suddenly spikes' },
  { word: 'COLLECTION', hint: 'A group of cards owned by one person' },
  { word: 'INVEST', hint: 'Buy cards expecting future value increase' },
  { word: 'SEALED', hint: 'Unopened product still in original packaging' },
];

const setNames = [
  { word: 'TOPPS', hint: 'Oldest active baseball card company (est. 1951)' },
  { word: 'BOWMAN', hint: 'Known for prospect and draft pick cards' },
  { word: 'FLEER', hint: 'Made the iconic 1986-87 Jordan card' },
  { word: 'DONRUSS', hint: 'Card brand known for Rated Rookies' },
  { word: 'PANINI', hint: 'Italian company that makes most sports cards now' },
  { word: 'MOSAIC', hint: 'Panini line with geometric pattern parallels' },
  { word: 'SELECT', hint: 'Panini line with Concourse, Premier, and Field levels' },
  { word: 'OPTIC', hint: 'Chromium version of Donruss cards' },
  { word: 'HERITAGE', hint: 'Topps line that recreates classic card designs' },
  { word: 'CONTENDERS', hint: 'Known for its "Rookie Ticket" autograph cards' },
  { word: 'IMMACULATE', hint: 'Ultra-premium Panini line with all hits' },
  { word: 'STERLING', hint: 'High-end Topps baseball card product' },
  { word: 'NATIONAL', hint: 'Topps ___ Treasures — classic baseball line' },
  { word: 'PRESTIGE', hint: 'Panini football line with rookie parallel cards' },
  { word: 'STADIUM', hint: '___ Club — Topps premium on-card autograph set' },
  { word: 'GALLERY', hint: 'Art-styled Panini card product' },
  { word: 'ARCHIVES', hint: 'Topps retro product with buyback autographs' },
  { word: 'OBSIDIAN', hint: 'Dark-themed Panini card line' },
  { word: 'DYNASTY', hint: 'Ultra-premium Topps product, one pack per box' },
  { word: 'SPECTRA', hint: 'Panini line known for its colorful patterns' },
];

function getPlayerWords(): { word: string; hint: string }[] {
  const uniquePlayers = [...new Set(sportsCards.map(c => c.player))];
  // Pick players with short-ish names (5-10 chars) for scrambling
  return uniquePlayers
    .filter(p => {
      const clean = p.replace(/[^A-Za-z]/g, '');
      return clean.length >= 5 && clean.length <= 12 && !p.includes('.') && !p.includes("'");
    })
    .map(p => {
      const card = sportsCards.find(c => c.player === p)!;
      const sportLabel = card.sport.charAt(0).toUpperCase() + card.sport.slice(1);
      return {
        word: p.toUpperCase().replace(/[^A-Z]/g, ''),
        hint: `${sportLabel} player — ${card.description?.split('.')[0] || card.name}`.slice(0, 80),
      };
    });
}

type Category = 'hobby' | 'sets' | 'players';
type GameMode = 'daily' | 'random';
type GameState = 'menu' | 'playing' | 'results';

interface Round {
  original: string;
  scrambled: string;
  hint: string;
  category: Category;
  guess: string;
  solved: boolean;
  hintUsed: boolean;
  timeSpent: number;
  points: number;
}

const STORAGE_KEY = 'cardvault-card-scramble';
const TOTAL_WORDS = 10;
const TIME_LIMIT = 90;

const categoryLabels: Record<Category, string> = { hobby: 'Hobby Term', sets: 'Card Brand/Set', players: 'Player Name' };
const categoryColors: Record<Category, string> = { hobby: 'text-emerald-400', sets: 'text-amber-400', players: 'text-blue-400' };
const categoryBg: Record<Category, string> = { hobby: 'bg-emerald-950/50 border-emerald-800/50', sets: 'bg-amber-950/50 border-amber-800/50', players: 'bg-blue-950/50 border-blue-800/50' };

function getGrade(score: number): { grade: string; color: string } {
  if (score >= 900) return { grade: 'S', color: 'text-yellow-400' };
  if (score >= 700) return { grade: 'A', color: 'text-emerald-400' };
  if (score >= 500) return { grade: 'B', color: 'text-blue-400' };
  if (score >= 300) return { grade: 'C', color: 'text-purple-400' };
  if (score >= 150) return { grade: 'D', color: 'text-orange-400' };
  return { grade: 'F', color: 'text-red-400' };
}

// ── Component ────────────────────────────────────────────────────────────────

export default function CardScrambleClient() {
  const [mounted, setMounted] = useState(false);
  const [gameState, setGameState] = useState<GameState>('menu');
  const [mode, setMode] = useState<GameMode>('daily');
  const [rounds, setRounds] = useState<Round[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [input, setInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [roundStart, setRoundStart] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [stats, setStats] = useState({ gamesPlayed: 0, bestScore: 0, bestDaily: 0, totalSolved: 0, bestStreak: 0 });
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const playerWords = useMemo(() => getPlayerWords(), []);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setStats(JSON.parse(saved));
    } catch { /* ignore */ }
  }, [mounted]);

  const saveStats = useCallback((newStats: typeof stats) => {
    setStats(newStats);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newStats));
  }, []);

  const generateRounds = useCallback((gameMode: GameMode): Round[] => {
    const seed = gameMode === 'daily' ? dateHash() * 7919 : Date.now();
    const rng = seededRng(seed);

    // Mix of categories: 3 hobby terms, 3 sets, 4 players
    const allHobby = [...hobbyTerms].sort(() => rng() - 0.5).slice(0, 3);
    const allSets = [...setNames].sort(() => rng() - 0.5).slice(0, 3);
    const allPlayers = [...playerWords].sort(() => rng() - 0.5).slice(0, 4);

    const words: { word: string; hint: string; category: Category }[] = [
      ...allHobby.map(w => ({ ...w, category: 'hobby' as Category })),
      ...allSets.map(w => ({ ...w, category: 'sets' as Category })),
      ...allPlayers.map(w => ({ ...w, category: 'players' as Category })),
    ].sort(() => rng() - 0.5);

    return words.map(w => ({
      original: w.word,
      scrambled: scrambleWord(w.word, rng),
      hint: w.hint,
      category: w.category,
      guess: '',
      solved: false,
      hintUsed: false,
      timeSpent: 0,
      points: 0,
    }));
  }, [playerWords]);

  // Timer
  useEffect(() => {
    if (gameState !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setGameState('results');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [gameState]);

  const startGame = useCallback((gameMode: GameMode) => {
    setMode(gameMode);
    const newRounds = generateRounds(gameMode);
    setRounds(newRounds);
    setCurrentIdx(0);
    setInput('');
    setTimeLeft(TIME_LIMIT);
    setRoundStart(Date.now());
    setShowHint(false);
    setFeedback(null);
    setGameState('playing');
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [generateRounds]);

  const submitGuess = useCallback(() => {
    if (gameState !== 'playing' || !input.trim()) return;
    const round = rounds[currentIdx];
    if (!round) return;

    const guess = input.trim().toUpperCase().replace(/[^A-Z]/g, '');
    const correct = guess === round.original;
    const elapsed = (Date.now() - roundStart) / 1000;
    const basePoints = correct ? 100 : 0;
    const speedBonus = correct ? Math.max(0, Math.round((15 - elapsed) * 3)) : 0;
    const hintPenalty = correct && showHint ? 30 : 0;
    const points = Math.max(0, basePoints + speedBonus - hintPenalty);

    const updated = [...rounds];
    updated[currentIdx] = { ...round, guess, solved: correct, hintUsed: showHint, timeSpent: elapsed, points };
    setRounds(updated);
    setFeedback(correct ? 'correct' : 'wrong');

    setTimeout(() => {
      setFeedback(null);
      if (currentIdx < TOTAL_WORDS - 1) {
        setCurrentIdx(currentIdx + 1);
        setInput('');
        setShowHint(false);
        setRoundStart(Date.now());
        setTimeout(() => inputRef.current?.focus(), 50);
      } else {
        // Game over
        if (timerRef.current) clearInterval(timerRef.current);
        const totalScore = updated.reduce((s, r) => s + r.points, 0);
        const solved = updated.filter(r => r.solved).length;
        const newStats = {
          gamesPlayed: stats.gamesPlayed + 1,
          bestScore: Math.max(stats.bestScore, totalScore),
          bestDaily: mode === 'daily' ? Math.max(stats.bestDaily, totalScore) : stats.bestDaily,
          totalSolved: stats.totalSolved + solved,
          bestStreak: Math.max(stats.bestStreak, longestStreak(updated)),
        };
        saveStats(newStats);
        setGameState('results');
      }
    }, 800);
  }, [gameState, input, rounds, currentIdx, roundStart, showHint, stats, mode, saveStats]);

  const skipWord = useCallback(() => {
    if (gameState !== 'playing') return;
    const updated = [...rounds];
    updated[currentIdx] = { ...rounds[currentIdx], guess: '', solved: false, timeSpent: (Date.now() - roundStart) / 1000, points: 0 };
    setRounds(updated);
    if (currentIdx < TOTAL_WORDS - 1) {
      setCurrentIdx(currentIdx + 1);
      setInput('');
      setShowHint(false);
      setRoundStart(Date.now());
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      const totalScore = updated.reduce((s, r) => s + r.points, 0);
      const solved = updated.filter(r => r.solved).length;
      const newStats = {
        gamesPlayed: stats.gamesPlayed + 1,
        bestScore: Math.max(stats.bestScore, totalScore),
        bestDaily: mode === 'daily' ? Math.max(stats.bestDaily, totalScore) : stats.bestDaily,
        totalSolved: stats.totalSolved + solved,
        bestStreak: Math.max(stats.bestStreak, longestStreak(updated)),
      };
      saveStats(newStats);
      setGameState('results');
    }
  }, [gameState, rounds, currentIdx, roundStart, stats, mode, saveStats]);

  function longestStreak(rs: Round[]): number {
    let max = 0, cur = 0;
    for (const r of rs) { if (r.solved) { cur++; max = Math.max(max, cur); } else { cur = 0; } }
    return max;
  }

  const totalScore = rounds.reduce((s, r) => s + r.points, 0);
  const solvedCount = rounds.filter(r => r.solved).length;
  const gradeInfo = getGrade(totalScore);

  const shareText = useMemo(() => {
    if (gameState !== 'results') return '';
    const grid = rounds.map(r => r.solved ? (r.hintUsed ? '🟡' : '🟢') : '🔴').join('');
    return `Card Scramble ${mode === 'daily' ? 'Daily' : 'Random'}\n${grid}\n${solvedCount}/${TOTAL_WORDS} solved | ${totalScore} pts | Grade: ${gradeInfo.grade}\nhttps://cardvault-two.vercel.app/card-scramble`;
  }, [gameState, rounds, mode, solvedCount, totalScore, gradeInfo.grade]);

  if (!mounted) return <div className="min-h-[400px] flex items-center justify-center"><div className="text-gray-500">Loading...</div></div>;

  // ── MENU ──────────────────────────────────────────────────────────────────

  if (gameState === 'menu') {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <div className="text-6xl">🔤</div>
          <h2 className="text-2xl font-bold text-white">Card Scramble</h2>
          <p className="text-gray-400 max-w-md mx-auto">
            Unscramble {TOTAL_WORDS} card-related words in {TIME_LIMIT} seconds. Player names, set names, and hobby terms — how well do you know the hobby?
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
          <button onClick={() => startGame('daily')} className="bg-emerald-900/40 border border-emerald-700/50 rounded-xl p-6 text-center hover:bg-emerald-900/60 transition-colors">
            <div className="text-2xl mb-2">📅</div>
            <div className="text-lg font-bold text-emerald-400">Daily Challenge</div>
            <div className="text-sm text-gray-400 mt-1">Same words for everyone today</div>
          </button>
          <button onClick={() => startGame('random')} className="bg-blue-900/40 border border-blue-700/50 rounded-xl p-6 text-center hover:bg-blue-900/60 transition-colors">
            <div className="text-2xl mb-2">🎲</div>
            <div className="text-lg font-bold text-blue-400">Random</div>
            <div className="text-sm text-gray-400 mt-1">Fresh words every time</div>
          </button>
        </div>

        {stats.gamesPlayed > 0 && (
          <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-6 max-w-lg mx-auto">
            <h3 className="text-sm font-semibold text-gray-400 uppercase mb-4">Your Stats</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div><div className="text-2xl font-bold text-white">{stats.gamesPlayed}</div><div className="text-xs text-gray-500">Games</div></div>
              <div><div className="text-2xl font-bold text-emerald-400">{stats.bestScore}</div><div className="text-xs text-gray-500">Best Score</div></div>
              <div><div className="text-2xl font-bold text-amber-400">{stats.bestDaily}</div><div className="text-xs text-gray-500">Best Daily</div></div>
              <div><div className="text-2xl font-bold text-blue-400">{stats.totalSolved}</div><div className="text-xs text-gray-500">Total Solved</div></div>
            </div>
          </div>
        )}

        <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-6 max-w-lg mx-auto">
          <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">How to Play</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-start gap-2"><span className="text-emerald-400">1.</span> You get a scrambled word + its category (Hobby Term, Card Brand, or Player Name)</li>
            <li className="flex items-start gap-2"><span className="text-emerald-400">2.</span> Type the unscrambled word and press Enter</li>
            <li className="flex items-start gap-2"><span className="text-emerald-400">3.</span> Use the hint if stuck (costs 30 points)</li>
            <li className="flex items-start gap-2"><span className="text-emerald-400">4.</span> Skip if you can&apos;t get it — no penalty beyond lost points</li>
            <li className="flex items-start gap-2"><span className="text-emerald-400">5.</span> Faster answers earn bonus points (up to +45)</li>
          </ul>
        </div>
      </div>
    );
  }

  // ── PLAYING ───────────────────────────────────────────────────────────────

  if (gameState === 'playing') {
    const round = rounds[currentIdx];
    if (!round) return null;

    const timerPct = (timeLeft / TIME_LIMIT) * 100;
    const timerColor = timeLeft > 60 ? 'bg-emerald-500' : timeLeft > 30 ? 'bg-amber-500' : 'bg-red-500';

    return (
      <div className="space-y-6">
        {/* Timer + progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Word {currentIdx + 1} of {TOTAL_WORDS}</span>
            <span className={`font-mono font-bold ${timeLeft <= 15 ? 'text-red-400 animate-pulse' : 'text-white'}`}>{timeLeft}s</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div className={`h-full ${timerColor} transition-all duration-1000 ease-linear rounded-full`} style={{ width: `${timerPct}%` }} />
          </div>
          <div className="flex gap-1">
            {rounds.map((r, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full ${i < currentIdx ? (r.solved ? 'bg-emerald-500' : 'bg-red-500') : i === currentIdx ? 'bg-white' : 'bg-gray-700'}`} />
            ))}
          </div>
        </div>

        {/* Score bar */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">Score: <span className="text-white font-bold">{rounds.slice(0, currentIdx).reduce((s, r) => s + r.points, 0)}</span></div>
          <div className="text-sm text-gray-400">Solved: <span className="text-emerald-400 font-bold">{rounds.slice(0, currentIdx).filter(r => r.solved).length}</span></div>
        </div>

        {/* Category badge */}
        <div className="text-center">
          <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full border ${categoryBg[round.category]}`}>
            <span className={categoryColors[round.category]}>{categoryLabels[round.category]}</span>
          </span>
        </div>

        {/* Scrambled word */}
        <div className={`text-center py-8 transition-all ${feedback === 'correct' ? 'scale-105' : feedback === 'wrong' ? 'animate-shake' : ''}`}>
          <div className="flex justify-center gap-2 flex-wrap mb-4">
            {round.scrambled.split('').map((letter, i) => (
              <div key={i} className={`w-10 h-12 sm:w-12 sm:h-14 flex items-center justify-center rounded-lg text-xl sm:text-2xl font-bold border ${
                feedback === 'correct' ? 'bg-emerald-900/50 border-emerald-500 text-emerald-400' :
                feedback === 'wrong' ? 'bg-red-900/50 border-red-500 text-red-400' :
                'bg-gray-800/80 border-gray-600 text-white'
              }`}>
                {letter}
              </div>
            ))}
          </div>

          {feedback === 'correct' && <div className="text-emerald-400 font-bold text-lg">Correct! +{round.points} pts</div>}
          {feedback === 'wrong' && <div className="text-red-400 font-bold text-lg">Wrong — it was {round.original}</div>}
        </div>

        {/* Hint */}
        {showHint && !feedback && (
          <div className="bg-amber-950/30 border border-amber-800/40 rounded-lg p-3 text-center">
            <span className="text-amber-400 text-sm">💡 {round.hint}</span>
            <span className="text-amber-600 text-xs ml-2">(-30 pts)</span>
          </div>
        )}

        {/* Input */}
        {!feedback && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value.toUpperCase())}
                onKeyDown={e => { if (e.key === 'Enter') submitGuess(); }}
                placeholder="Type the word..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-lg font-mono placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 tracking-wider"
                autoComplete="off"
                autoCapitalize="characters"
              />
              <button onClick={submitGuess} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-lg transition-colors">
                Go
              </button>
            </div>
            <div className="flex gap-2 justify-center">
              {!showHint && (
                <button onClick={() => setShowHint(true)} className="text-sm text-amber-400 hover:text-amber-300 transition-colors">
                  💡 Show Hint (-30 pts)
                </button>
              )}
              <button onClick={skipWord} className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                Skip →
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── RESULTS ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className={`text-7xl font-black ${gradeInfo.color}`}>{gradeInfo.grade}</div>
        <div className="text-3xl font-bold text-white">{totalScore} Points</div>
        <div className="text-gray-400">{solvedCount}/{TOTAL_WORDS} words solved{timeLeft > 0 ? ` | ${timeLeft}s remaining` : ' | Time up!'}</div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-4">
          <div className="text-2xl font-bold text-emerald-400">{solvedCount}</div>
          <div className="text-xs text-gray-500">Solved</div>
        </div>
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-4">
          <div className="text-2xl font-bold text-amber-400">{longestStreak(rounds)}</div>
          <div className="text-xs text-gray-500">Best Streak</div>
        </div>
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-4">
          <div className="text-2xl font-bold text-blue-400">{rounds.filter(r => r.hintUsed && r.solved).length}</div>
          <div className="text-xs text-gray-500">Hints Used</div>
        </div>
      </div>

      {/* Round breakdown */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-400 uppercase">Round Breakdown</h3>
        {rounds.map((r, i) => (
          <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border ${r.solved ? 'bg-emerald-950/20 border-emerald-800/30' : 'bg-red-950/20 border-red-800/30'}`}>
            <span className="text-lg">{r.solved ? '🟢' : '🔴'}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-white font-mono font-bold">{r.original}</span>
                <span className={`text-xs ${categoryColors[r.category]}`}>({categoryLabels[r.category]})</span>
              </div>
              <div className="text-xs text-gray-500 truncate">{r.hint}</div>
            </div>
            <div className="text-right">
              <div className={`font-bold ${r.solved ? 'text-emerald-400' : 'text-red-400'}`}>{r.points > 0 ? `+${r.points}` : '0'}</div>
              {r.hintUsed && <div className="text-xs text-amber-500">hint</div>}
            </div>
          </div>
        ))}
      </div>

      {/* Share + play again */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => navigator.clipboard.writeText(shareText)}
          className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors"
        >
          📋 Copy Results
        </button>
        <button
          onClick={() => setGameState('menu')}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition-colors"
        >
          🔄 Play Again
        </button>
      </div>

      {/* Related links */}
      <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-gray-400 uppercase mb-4">More Card Games</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Link href="/guess-the-card" className="text-emerald-400 hover:text-emerald-300">🔮 Guess the Card</Link>
          <Link href="/price-blitz" className="text-emerald-400 hover:text-emerald-300">⏱️ Price Blitz</Link>
          <Link href="/trivia" className="text-emerald-400 hover:text-emerald-300">🧠 Card Trivia</Link>
          <Link href="/card-connections" className="text-emerald-400 hover:text-emerald-300">🔗 Card Connections</Link>
          <Link href="/card-keeper" className="text-emerald-400 hover:text-emerald-300">⚡ Card Keeper</Link>
          <Link href="/memory-match" className="text-emerald-400 hover:text-emerald-300">🧩 Memory Match</Link>
          <Link href="/flip-or-keep" className="text-emerald-400 hover:text-emerald-300">🃏 Flip or Keep</Link>
          <Link href="/card-streak" className="text-emerald-400 hover:text-emerald-300">🔥 Card Streak</Link>
        </div>
      </div>
    </div>
  );
}
