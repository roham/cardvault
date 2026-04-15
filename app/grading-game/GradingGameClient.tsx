'use client';

import { useState, useMemo, useCallback } from 'react';
import { sportsCards } from '@/data/sports-cards';

// ── Types ──────────────────────────────────────────────────────────────────
interface CardScenario {
  playerName: string;
  year: number;
  set: string;
  sport: string;
  centering: string;
  corners: string;
  edges: string;
  surface: string;
  overallNote: string;
  correctGrade: number;
  explanation: string;
}

interface GameStats {
  gamesPlayed: number;
  bestScore: number;
  totalCorrect: number;
  totalRounds: number;
  dailyStreak: number;
  lastDailyDate: string;
}

type GameMode = 'menu' | 'playing' | 'result' | 'summary';

// ── PSA Grade Labels ──────────────────────────────────────────────────────
const gradeLabels: Record<number, string> = {
  1: 'Poor', 2: 'Good', 3: 'Very Good', 4: 'VG-EX', 5: 'Excellent',
  6: 'EX-MT', 7: 'Near Mint', 8: 'NM-MT', 9: 'Mint', 10: 'Gem Mint',
};

const gradeColors: Record<number, string> = {
  1: 'text-red-500', 2: 'text-red-400', 3: 'text-orange-500',
  4: 'text-orange-400', 5: 'text-yellow-500', 6: 'text-yellow-400',
  7: 'text-lime-400', 8: 'text-green-400', 9: 'text-emerald-400',
  10: 'text-cyan-400',
};

// ── Seeded random ─────────────────────────────────────────────────────────
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function dateHash(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

// ── Condition description generators ──────────────────────────────────────
const centeringDescs: Record<number, string[]> = {
  10: ['Perfectly centered 50/50 on both axes', 'Dead-center print registration, flawless alignment'],
  9: ['Very slightly off-center, approximately 55/45', 'Near-perfect centering with minimal shift'],
  8: ['Slightly off-center, roughly 60/40 left-right', 'Minor centering shift visible on close inspection'],
  7: ['Noticeably off-center, about 65/35', 'Centering shift visible at arm\'s length'],
  6: ['Moderately off-center, approximately 70/30', 'Clear centering issue but not severe'],
  5: ['Significantly off-center, about 75/25 on one axis', 'Obvious centering shift'],
  4: ['Heavily off-center, roughly 80/20', 'Severe centering that affects eye appeal'],
  3: ['Very heavily off-center, about 85/15', 'Extreme centering shift'],
  2: ['Grossly off-center with one border nearly absent', 'Dramatic miscut or misalignment'],
  1: ['Severely miscut, possibly showing adjacent card edge', 'Centering is essentially non-existent'],
};

const cornerDescs: Record<number, string[]> = {
  10: ['All four corners are razor sharp with no wear', 'Corners are perfect points under magnification'],
  9: ['Corners appear sharp — one corner has the faintest hint of softness under 10x magnification', 'Nearly perfect corners, one shows micro-level imperfection'],
  8: ['Slight corner wear on two corners, barely noticeable without close inspection', 'Corners are mostly sharp with minor blunting on a couple points'],
  7: ['Light fuzzing on all four corners visible to the naked eye', 'Moderate corner wear evident but corners still have shape'],
  6: ['Noticeable rounding on corners with slight paper loss', 'Corners show clear wear but are not heavily rounded'],
  5: ['Corners are visibly rounded with moderate wear', 'All corners show significant softening'],
  4: ['Heavy corner wear with rounded points and paper loss', 'Corners are clearly dinged with layering starting to show'],
  3: ['Severe corner rounding with heavy paper loss', 'Corners are damaged with visible fraying'],
  2: ['Corners are heavily damaged, creased, or missing paper', 'Extreme corner wear with structural damage'],
  1: ['Corners are destroyed — torn, missing, or completely rounded off', 'No corner integrity remains'],
};

const edgeDescs: Record<number, string[]> = {
  10: ['Edges are pristine with no chipping, whitening, or wear', 'Perfect edge integrity all around'],
  9: ['Edges are nearly flawless — one edge shows the tiniest hint of whitening under magnification', 'Essentially perfect edges with one micro-flaw'],
  8: ['Minor edge whitening on one or two edges, barely visible', 'Slight chipping visible under close inspection on a couple edges'],
  7: ['Light edge wear on multiple edges with visible whitening', 'Moderate edge chipping apparent at normal viewing distance'],
  6: ['Noticeable edge whitening and minor chipping on most edges', 'Edges show clear wear but maintain structural integrity'],
  5: ['Moderate edge wear with chipping and whitening throughout', 'Edges are clearly worn around the perimeter'],
  4: ['Heavy edge whitening with significant chipping', 'Edges show extensive wear with paper loss'],
  3: ['Severe edge damage with major chipping and potential tearing', 'Edges are heavily compromised'],
  2: ['Extreme edge damage with tearing and structural issues', 'Edges barely maintain card shape'],
  1: ['Edges are destroyed, torn, or disintegrating', 'No edge integrity remains'],
};

const surfaceDescs: Record<number, string[]> = {
  10: ['Surface is flawless — no scratches, print defects, or staining', 'Perfect surface gloss and clarity'],
  9: ['Surface is pristine with one barely visible print dot or micro-scratch', 'Nearly perfect surface with one negligible imperfection'],
  8: ['A few minor surface scratches visible under direct light', 'Surface shows light handling evidence but overall clean'],
  7: ['Mild surface scratches and a small area of gloss loss', 'Surface shows moderate handling wear'],
  6: ['Multiple surface scratches and slight discoloration in one area', 'Surface wear visible but photo and text remain clear'],
  5: ['Noticeable surface scratches with moderate gloss loss', 'Surface shows significant handling marks'],
  4: ['Heavy surface scratches with staining or wax residue', 'Surface is clearly damaged but image remains visible'],
  3: ['Severe surface damage including deep scratches or staining', 'Major surface issues affecting eye appeal'],
  2: ['Extreme surface damage — heavy staining, writing, or paint', 'Surface barely recognizable as original'],
  1: ['Surface is destroyed — heavy staining, tears, or holes', 'Card face is severely compromised'],
};

const overallNotes: Record<number, string[]> = {
  10: ['A flawless card that would impress any collector', 'This card appears to have been pulled from the pack and immediately sleeved'],
  9: ['An exceptional card with only the most trivial imperfection', 'A card any serious collector would be proud to own'],
  8: ['A very clean card that presents well despite minor flaws', 'Above average condition — handled carefully but not perfectly preserved'],
  7: ['A solid card with visible but moderate wear', 'A respectable example that shows some age or handling'],
  6: ['A decent card with noticeable flaws but still displayable', 'Shows honest wear consistent with being a played or handled card'],
  5: ['A well-loved card with clear condition issues', 'Would satisfy a set builder but not a condition-sensitive collector'],
  4: ['A card with significant wear but all major elements intact', 'Heavy use evident — this card was in a bicycle spoke or shoebox'],
  3: ['A heavily worn card that has seen better days', 'Major condition issues throughout — only for the dedicated collector'],
  2: ['A severely damaged card, barely holding together', 'This card has been through extreme handling or storage conditions'],
  1: ['A card in the worst possible condition while still being identifiable', 'Extensive damage in every category — a true "filler" copy'],
};

// ── Generate a scenario ───────────────────────────────────────────────────
function generateScenario(rand: () => number, index: number): CardScenario {
  // Pick a random card from the database
  const cardIdx = Math.floor(rand() * sportsCards.length);
  const card = sportsCards[cardIdx];

  // Generate the correct grade (weighted toward 6-9 as those are most common)
  const gradeWeights = [1, 2, 3, 5, 7, 10, 15, 20, 20, 17]; // grades 1-10
  const totalWeight = gradeWeights.reduce((a, b) => a + b, 0);
  let r = rand() * totalWeight;
  let correctGrade = 1;
  for (let i = 0; i < gradeWeights.length; i++) {
    r -= gradeWeights[i];
    if (r <= 0) { correctGrade = i + 1; break; }
  }

  // Sub-attributes can vary ±1 from the overall grade (with some randomness)
  const subGrade = (base: number): number => {
    const delta = rand() < 0.4 ? (rand() < 0.5 ? -1 : 1) : 0;
    return Math.max(1, Math.min(10, base + delta));
  };

  const centeringGrade = subGrade(correctGrade);
  const cornersGrade = subGrade(correctGrade);
  const edgesGrade = subGrade(correctGrade);
  const surfaceGrade = subGrade(correctGrade);

  const pick = (arr: string[]): string => arr[Math.floor(rand() * arr.length)];

  return {
    playerName: card.player,
    year: card.year,
    set: card.set,
    sport: card.sport,
    centering: pick(centeringDescs[centeringGrade]),
    corners: pick(cornerDescs[cornersGrade]),
    edges: pick(edgeDescs[edgesGrade]),
    surface: pick(surfaceDescs[surfaceGrade]),
    overallNote: pick(overallNotes[correctGrade]),
    correctGrade,
    explanation: `This card grades PSA ${correctGrade} (${gradeLabels[correctGrade]}). The centering (${gradeLabels[centeringGrade]}-level), corners (${gradeLabels[cornersGrade]}-level), edges (${gradeLabels[edgesGrade]}-level), and surface (${gradeLabels[surfaceGrade]}-level) combine for an overall ${gradeLabels[correctGrade]} grade. ${correctGrade >= 8 ? 'A strong card that commands a premium.' : correctGrade >= 5 ? 'A mid-grade card that serves as a good placeholder or set filler.' : 'A low-grade card valued mainly by player or historical significance.'}`,
  };
}

// ── Score calculation ─────────────────────────────────────────────────────
function calculateScore(guess: number, correct: number): number {
  const diff = Math.abs(guess - correct);
  if (diff === 0) return 100;
  if (diff === 1) return 70;
  if (diff === 2) return 40;
  if (diff === 3) return 20;
  return 0;
}

function getLetterGrade(score: number): { letter: string; color: string } {
  if (score >= 950) return { letter: 'S', color: 'text-cyan-400' };
  if (score >= 800) return { letter: 'A', color: 'text-emerald-400' };
  if (score >= 600) return { letter: 'B', color: 'text-lime-400' };
  if (score >= 400) return { letter: 'C', color: 'text-yellow-400' };
  if (score >= 200) return { letter: 'D', color: 'text-orange-400' };
  return { letter: 'F', color: 'text-red-400' };
}

// ── LocalStorage helpers ──────────────────────────────────────────────────
function loadStats(): GameStats {
  if (typeof window === 'undefined') return { gamesPlayed: 0, bestScore: 0, totalCorrect: 0, totalRounds: 0, dailyStreak: 0, lastDailyDate: '' };
  try {
    const raw = localStorage.getItem('cv-grading-game-stats');
    return raw ? JSON.parse(raw) : { gamesPlayed: 0, bestScore: 0, totalCorrect: 0, totalRounds: 0, dailyStreak: 0, lastDailyDate: '' };
  } catch { return { gamesPlayed: 0, bestScore: 0, totalCorrect: 0, totalRounds: 0, dailyStreak: 0, lastDailyDate: '' }; }
}

function saveStats(stats: GameStats) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('cv-grading-game-stats', JSON.stringify(stats));
}

// ── Component ─────────────────────────────────────────────────────────────
export default function GradingGameClient() {
  const [mode, setMode] = useState<GameMode>('menu');
  const [isDaily, setIsDaily] = useState(false);
  const [seed, setSeed] = useState(0);
  const [round, setRound] = useState(0);
  const [guess, setGuess] = useState<number | null>(null);
  const [scores, setScores] = useState<number[]>([]);
  const [guesses, setGuesses] = useState<number[]>([]);
  const [stats, setStats] = useState<GameStats>(loadStats);
  const [copied, setCopied] = useState(false);

  const scenarios = useMemo(() => {
    if (seed === 0) return [];
    const rand = seededRandom(seed);
    return Array.from({ length: 10 }, (_, i) => generateScenario(rand, i));
  }, [seed]);

  const currentScenario = scenarios[round] || null;
  const totalScore = scores.reduce((a, b) => a + b, 0);

  const startGame = useCallback((daily: boolean) => {
    const s = daily ? dateHash() : Math.floor(Math.random() * 999999) + 1;
    setSeed(s);
    setIsDaily(daily);
    setRound(0);
    setGuess(null);
    setScores([]);
    setGuesses([]);
    setMode('playing');
  }, []);

  const submitGuess = useCallback(() => {
    if (guess === null || !currentScenario) return;
    const pts = calculateScore(guess, currentScenario.correctGrade);
    setScores(prev => [...prev, pts]);
    setGuesses(prev => [...prev, guess]);
    setMode('result');
  }, [guess, currentScenario]);

  const nextRound = useCallback(() => {
    if (round >= 9) {
      // Game over — update stats
      const finalScore = [...scores].reduce((a, b) => a + b, 0);
      const perfectCount = scores.filter((s, i) => guesses[i] === scenarios[i].correctGrade).length;

      const newStats = { ...stats };
      newStats.gamesPlayed += 1;
      newStats.bestScore = Math.max(newStats.bestScore, finalScore);
      newStats.totalCorrect += perfectCount;
      newStats.totalRounds += 10;

      if (isDaily) {
        const today = new Date().toISOString().slice(0, 10);
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        if (newStats.lastDailyDate === yesterday) {
          newStats.dailyStreak += 1;
        } else if (newStats.lastDailyDate !== today) {
          newStats.dailyStreak = 1;
        }
        newStats.lastDailyDate = today;
      }

      setStats(newStats);
      saveStats(newStats);
      setMode('summary');
    } else {
      setRound(prev => prev + 1);
      setGuess(null);
      setMode('playing');
    }
  }, [round, scores, guesses, scenarios, stats, isDaily]);

  const handleShare = useCallback(() => {
    const grade = getLetterGrade(totalScore);
    const emojis = scores.map(s => s === 100 ? '🎯' : s >= 70 ? '✅' : s >= 40 ? '🟡' : s >= 20 ? '🟠' : '❌').join('');
    const text = `Card Grading Game ${isDaily ? '(Daily)' : ''}\nScore: ${totalScore}/1,000 (${grade.letter})\n${emojis}\n\nhttps://cardvault-two.vercel.app/grading-game`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [totalScore, scores, isDaily]);

  // ── Menu ──────────────────────────────────────────────────────────────
  if (mode === 'menu') {
    return (
      <div className="space-y-6">
        {/* Stats bar */}
        {stats.gamesPlayed > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Games Played', value: stats.gamesPlayed },
              { label: 'Best Score', value: `${stats.bestScore}/1000` },
              { label: 'Accuracy', value: stats.totalRounds > 0 ? `${Math.round(stats.totalCorrect / stats.totalRounds * 100)}%` : '—' },
              { label: 'Daily Streak', value: `${stats.dailyStreak} day${stats.dailyStreak !== 1 ? 's' : ''}` },
            ].map((s, i) => (
              <div key={i} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-3 text-center">
                <p className="text-gray-500 text-xs">{s.label}</p>
                <p className="text-white font-bold text-lg">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Mode selection */}
        <div className="grid sm:grid-cols-2 gap-4">
          <button
            onClick={() => startGame(true)}
            className="text-left bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 rounded-xl p-5 transition-colors"
          >
            <p className="text-violet-400 text-lg font-bold mb-1">Daily Challenge</p>
            <p className="text-gray-400 text-sm">Same 10 cards for everyone today. Compare scores with friends.</p>
          </button>
          <button
            onClick={() => startGame(false)}
            className="text-left bg-gray-800/50 hover:bg-gray-800/80 border border-gray-700/50 rounded-xl p-5 transition-colors"
          >
            <p className="text-white text-lg font-bold mb-1">Random Game</p>
            <p className="text-gray-400 text-sm">Random cards each time. Practice your grading eye.</p>
          </button>
        </div>

        {/* How to play */}
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-3">How to Play</h3>
          <ol className="space-y-2 text-gray-400 text-sm list-decimal list-inside">
            <li>Read the condition description — centering, corners, edges, and surface</li>
            <li>Select the PSA grade you think this card deserves (1-10)</li>
            <li>See the correct grade and explanation</li>
            <li>Play 10 rounds and earn a letter grade (S, A, B, C, D, F)</li>
          </ol>
          <div className="mt-4 flex flex-wrap gap-3 text-xs">
            <span className="bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded">🎯 Perfect = 100pts</span>
            <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">±1 = 70pts</span>
            <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">±2 = 40pts</span>
            <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded">±3 = 20pts</span>
            <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded">±4+ = 0pts</span>
          </div>
        </div>
      </div>
    );
  }

  // ── Playing / Result ──────────────────────────────────────────────────
  if ((mode === 'playing' || mode === 'result') && currentScenario) {
    return (
      <div>
        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-6">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className={`flex-1 h-2 rounded-full ${
              i < round ? (scores[i] === 100 ? 'bg-cyan-500' : scores[i] >= 70 ? 'bg-emerald-500' : scores[i] >= 40 ? 'bg-yellow-500' : scores[i] >= 20 ? 'bg-orange-500' : 'bg-red-500')
              : i === round ? 'bg-violet-500/60' : 'bg-gray-800'
            }`} />
          ))}
          <span className="text-gray-500 text-xs ml-1">{round + 1}/10</span>
          <span className="text-gray-600 text-xs ml-2">{totalScore}pts</span>
        </div>

        {/* Card info */}
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-3 text-sm">
            <span className="bg-gray-700 text-gray-300 px-2 py-0.5 rounded text-xs">{currentScenario.year}</span>
            <span className="text-gray-400">{currentScenario.set}</span>
            <span className="text-gray-600">|</span>
            <span className="text-gray-400">{currentScenario.playerName}</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-violet-400 text-xs font-medium uppercase tracking-wide mb-1">Centering</p>
              <p className="text-gray-300 text-sm">{currentScenario.centering}</p>
            </div>
            <div>
              <p className="text-violet-400 text-xs font-medium uppercase tracking-wide mb-1">Corners</p>
              <p className="text-gray-300 text-sm">{currentScenario.corners}</p>
            </div>
            <div>
              <p className="text-violet-400 text-xs font-medium uppercase tracking-wide mb-1">Edges</p>
              <p className="text-gray-300 text-sm">{currentScenario.edges}</p>
            </div>
            <div>
              <p className="text-violet-400 text-xs font-medium uppercase tracking-wide mb-1">Surface</p>
              <p className="text-gray-300 text-sm">{currentScenario.surface}</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-700/50">
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-1">Overall Impression</p>
            <p className="text-gray-300 text-sm italic">{currentScenario.overallNote}</p>
          </div>
        </div>

        {mode === 'playing' ? (
          <>
            {/* Grade selector */}
            <div className="mb-4">
              <p className="text-white font-semibold mb-3">What PSA grade would you give this card?</p>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(g => (
                  <button
                    key={g}
                    onClick={() => setGuess(g)}
                    className={`py-3 rounded-xl border text-center transition-all ${
                      guess === g
                        ? 'bg-violet-600/30 border-violet-500 text-white scale-105'
                        : 'bg-gray-800/50 border-gray-700/50 text-gray-400 hover:bg-gray-800 hover:border-gray-600'
                    }`}
                  >
                    <p className="text-lg font-bold">{g}</p>
                    <p className="text-[10px] text-gray-500 hidden sm:block">{gradeLabels[g]}</p>
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={submitGuess}
              disabled={guess === null}
              className="w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-xl text-base transition-colors"
            >
              Submit Grade
            </button>
          </>
        ) : (
          <>
            {/* Result */}
            <div className={`rounded-xl p-5 mb-4 border ${
              scores[round] === 100 ? 'bg-cyan-500/10 border-cyan-500/30' :
              scores[round] >= 70 ? 'bg-emerald-500/10 border-emerald-500/30' :
              scores[round] >= 40 ? 'bg-yellow-500/10 border-yellow-500/30' :
              scores[round] >= 20 ? 'bg-orange-500/10 border-orange-500/30' :
              'bg-red-500/10 border-red-500/30'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-gray-400 text-sm">Your Guess</p>
                  <p className="text-white text-2xl font-bold">PSA {guesses[round]} <span className="text-sm font-normal text-gray-400">({gradeLabels[guesses[round]]})</span></p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-sm">Correct Grade</p>
                  <p className={`text-2xl font-bold ${gradeColors[currentScenario.correctGrade]}`}>
                    PSA {currentScenario.correctGrade} <span className="text-sm font-normal text-gray-400">({gradeLabels[currentScenario.correctGrade]})</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-lg font-bold ${scores[round] === 100 ? 'text-cyan-400' : scores[round] >= 70 ? 'text-emerald-400' : scores[round] >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {scores[round] === 100 ? '🎯 Perfect!' : scores[round] >= 70 ? '✅ Close!' : scores[round] >= 40 ? '🟡 Not bad' : scores[round] >= 20 ? '🟠 Off target' : '❌ Way off'}
                </span>
                <span className="text-gray-500">+{scores[round]} pts</span>
              </div>
              <p className="text-gray-400 text-sm mt-3">{currentScenario.explanation}</p>
            </div>
            <button
              onClick={nextRound}
              className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl text-base transition-colors"
            >
              {round >= 9 ? 'See Final Score' : `Next Card (${round + 2}/10)`}
            </button>
          </>
        )}
      </div>
    );
  }

  // ── Summary ───────────────────────────────────────────────────────────
  if (mode === 'summary') {
    const grade = getLetterGrade(totalScore);
    const perfectCount = scores.filter(s => s === 100).length;

    return (
      <div>
        {/* Score hero */}
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-8 text-center mb-6">
          <p className={`text-6xl font-black mb-2 ${grade.color}`}>{grade.letter}</p>
          <p className="text-white text-2xl font-bold">{totalScore} / 1,000</p>
          <p className="text-gray-400 mt-1">{isDaily ? 'Daily Challenge' : 'Random Game'} — {perfectCount} perfect grade{perfectCount !== 1 ? 's' : ''}</p>
          <div className="flex justify-center gap-1 mt-4">
            {scores.map((s, i) => (
              <span key={i} className="text-xl">{s === 100 ? '🎯' : s >= 70 ? '✅' : s >= 40 ? '🟡' : s >= 20 ? '🟠' : '❌'}</span>
            ))}
          </div>
        </div>

        {/* Round breakdown */}
        <div className="space-y-2 mb-6">
          {scenarios.map((sc, i) => (
            <div key={i} className="flex items-center gap-3 bg-gray-800/30 border border-gray-700/30 rounded-lg px-4 py-2 text-sm">
              <span className="text-gray-500 w-8">R{i + 1}</span>
              <span className="text-gray-400 flex-1 truncate">{sc.playerName} ({sc.year})</span>
              <span className="text-gray-500">You: {guesses[i]}</span>
              <span className={`font-semibold ${gradeColors[sc.correctGrade]}`}>PSA {sc.correctGrade}</span>
              <span className={`w-16 text-right font-bold ${scores[i] === 100 ? 'text-cyan-400' : scores[i] >= 70 ? 'text-emerald-400' : scores[i] >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                +{scores[i]}
              </span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={handleShare} className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold transition-colors">
            {copied ? 'Copied!' : 'Share Score'}
          </button>
          <button onClick={() => startGame(false)} className="flex-1 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-semibold transition-colors">
            Play Again
          </button>
          <button onClick={() => setMode('menu')} className="px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-semibold transition-colors">
            Menu
          </button>
        </div>
      </div>
    );
  }

  return null;
}
