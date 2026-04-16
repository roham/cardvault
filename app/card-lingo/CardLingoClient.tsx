'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/* ─── Term Bank ──────────────────────────────────────────── */
interface LingoTerm {
  term: string;
  definition: string;
  category: 'grading' | 'products' | 'card-types' | 'trading' | 'market' | 'general';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

const TERMS: LingoTerm[] = [
  // Grading
  { term: 'Gem Mint', definition: 'A perfect or near-perfect grade (PSA 10, BGS 9.5+) with no visible flaws', category: 'grading', difficulty: 'beginner' },
  { term: 'Slab', definition: 'A graded card encased in a hard plastic holder by a grading company', category: 'grading', difficulty: 'beginner' },
  { term: 'Raw', definition: 'An ungraded card not encased in a slab', category: 'grading', difficulty: 'beginner' },
  { term: 'Crossover', definition: 'Submitting a card graded by one company to be regraded by another', category: 'grading', difficulty: 'intermediate' },
  { term: 'Crack and Resubmit', definition: 'Breaking a card out of its slab to resubmit for a potentially higher grade', category: 'grading', difficulty: 'intermediate' },
  { term: 'Population Report', definition: 'Official count of how many cards of each grade a company has certified', category: 'grading', difficulty: 'intermediate' },
  { term: 'Registry Set', definition: 'A graded card collection registered with PSA or BGS for competitive ranking', category: 'grading', difficulty: 'advanced' },
  { term: 'Subgrades', definition: 'Individual scores for centering, corners, edges, and surface on a BGS card', category: 'grading', difficulty: 'intermediate' },
  { term: 'Black Label', definition: 'A BGS 10 Pristine card where all four subgrades are also 10', category: 'grading', difficulty: 'advanced' },
  { term: 'Qualifier', definition: 'A mark on a graded card indicating a specific flaw like an off-center or stain', category: 'grading', difficulty: 'advanced' },

  // Products
  { term: 'Wax', definition: 'Sealed card packs or boxes, named after the wax paper packs of the 1980s', category: 'products', difficulty: 'beginner' },
  { term: 'Hobby Box', definition: 'A premium sealed box sold through card shops, typically with guaranteed hits', category: 'products', difficulty: 'beginner' },
  { term: 'Blaster', definition: 'A retail sealed box typically found at Walmart or Target', category: 'products', difficulty: 'beginner' },
  { term: 'Hanger', definition: 'A mid-size retail pack, larger than a single pack but smaller than a blaster', category: 'products', difficulty: 'intermediate' },
  { term: 'Fat Pack', definition: 'A value pack containing more cards than a standard pack', category: 'products', difficulty: 'intermediate' },
  { term: 'Jumbo Box', definition: 'A premium hobby box with larger packs containing more cards each', category: 'products', difficulty: 'intermediate' },
  { term: 'ETB', definition: 'Elite Trainer Box — a Pokemon sealed product with packs, sleeves, and accessories', category: 'products', difficulty: 'beginner' },
  { term: 'Mega Box', definition: 'A larger retail sealed product, exclusive to specific retailers', category: 'products', difficulty: 'intermediate' },
  { term: 'Cello', definition: 'A clear-wrapped retail pack where you can see the top and bottom cards', category: 'products', difficulty: 'advanced' },
  { term: 'Rack Pack', definition: 'A tall retail pack containing multiple smaller packs, hung on a rack display', category: 'products', difficulty: 'advanced' },

  // Card Types
  { term: 'Rookie Card (RC)', definition: 'A player\'s first officially licensed trading card', category: 'card-types', difficulty: 'beginner' },
  { term: 'Short Print (SP)', definition: 'A card intentionally produced in lower quantities than the base set', category: 'card-types', difficulty: 'beginner' },
  { term: 'Refractor', definition: 'A shiny, rainbow-reflective parallel card, first introduced by Topps in 1993', category: 'card-types', difficulty: 'beginner' },
  { term: 'Parallel', definition: 'A variation of a base card with a different color, pattern, or numbering', category: 'card-types', difficulty: 'beginner' },
  { term: 'Auto', definition: 'A card with an authentic player autograph, either on-card or sticker', category: 'card-types', difficulty: 'beginner' },
  { term: 'Relic', definition: 'A card containing a piece of game-used jersey, bat, or other memorabilia', category: 'card-types', difficulty: 'beginner' },
  { term: 'Patch Card', definition: 'A relic card featuring a multi-color piece from a jersey logo or nameplate', category: 'card-types', difficulty: 'intermediate' },
  { term: 'Numbered Card', definition: 'A card serial numbered out of a specific print run, like /99 or /25', category: 'card-types', difficulty: 'beginner' },
  { term: '1/1', definition: 'A one-of-one card — only a single copy exists in the entire print run', category: 'card-types', difficulty: 'beginner' },
  { term: 'SSP', definition: 'Super Short Print — an extremely limited variation, rarer than a standard short print', category: 'card-types', difficulty: 'intermediate' },
  { term: 'Insert', definition: 'A special card from a subset within a product, not part of the base set', category: 'card-types', difficulty: 'intermediate' },
  { term: 'Base Card', definition: 'A standard card from the main numbered set, not a parallel or insert', category: 'card-types', difficulty: 'beginner' },
  { term: 'Chrome', definition: 'Topps premium card line printed on chromium stock with a glossy, reflective finish', category: 'card-types', difficulty: 'intermediate' },
  { term: 'Prizm', definition: 'Panini flagship basketball/football brand known for silver and colored parallels', category: 'card-types', difficulty: 'intermediate' },
  { term: 'Sticker Auto', definition: 'An autograph on a sticker applied to the card, as opposed to signed directly on-card', category: 'card-types', difficulty: 'intermediate' },
  { term: 'RPA', definition: 'Rookie Patch Auto — a card combining a rookie\'s first card, memorabilia patch, and autograph', category: 'card-types', difficulty: 'intermediate' },
  { term: 'Redemption', definition: 'A card that must be mailed in or submitted online to receive the actual card later', category: 'card-types', difficulty: 'intermediate' },
  { term: 'Error Card', definition: 'A card with a printing mistake like wrong photo, misspelled name, or incorrect stats', category: 'card-types', difficulty: 'intermediate' },
  { term: 'Variation', definition: 'A card with a deliberate difference from the base version, like an alternate photo', category: 'card-types', difficulty: 'intermediate' },

  // Trading
  { term: 'Comp', definition: 'A comparable recent sale used to estimate a card\'s current market value', category: 'trading', difficulty: 'beginner' },
  { term: 'Lot', definition: 'A group of cards sold together as a single unit', category: 'trading', difficulty: 'beginner' },
  { term: 'Break', definition: 'A group purchase where participants buy spots and a host opens product on livestream', category: 'trading', difficulty: 'beginner' },
  { term: 'Random Team', definition: 'A break format where teams are randomly assigned to participants after purchase', category: 'trading', difficulty: 'intermediate' },
  { term: 'PYT', definition: 'Pick Your Team — a break format where you choose which team\'s cards you receive', category: 'trading', difficulty: 'intermediate' },
  { term: 'Hit', definition: 'A valuable pull from a pack — typically an auto, relic, or numbered parallel', category: 'trading', difficulty: 'beginner' },
  { term: 'Case Hit', definition: 'The best or rarest card pulled from an entire case of boxes', category: 'trading', difficulty: 'intermediate' },
  { term: 'Brick', definition: 'A disappointing box or case with no significant pulls', category: 'trading', difficulty: 'intermediate' },
  { term: 'PC', definition: 'Personal Collection — cards you keep rather than sell or trade', category: 'trading', difficulty: 'beginner' },
  { term: 'COMC', definition: 'Check Out My Cards — an online consignment marketplace for sports cards', category: 'trading', difficulty: 'intermediate' },
  { term: 'LCS', definition: 'Local Card Shop — a brick-and-mortar store specializing in trading cards', category: 'trading', difficulty: 'beginner' },
  { term: 'BMWT', definition: 'Bubble Mailer With Tracking — a common shipping method for higher-value cards', category: 'trading', difficulty: 'intermediate' },
  { term: 'PWE', definition: 'Plain White Envelope — cheapest shipping method for low-value cards', category: 'trading', difficulty: 'intermediate' },

  // Market
  { term: 'Flip', definition: 'Buying a card at a low price and quickly reselling for profit', category: 'market', difficulty: 'beginner' },
  { term: 'Hold', definition: 'Keeping a card long-term as an investment rather than selling', category: 'market', difficulty: 'beginner' },
  { term: 'Buy the Dip', definition: 'Purchasing cards when prices drop, expecting them to recover', category: 'market', difficulty: 'intermediate' },
  { term: 'Sell the Hype', definition: 'Selling before a player\'s actual performance can disappoint and deflate prices', category: 'market', difficulty: 'intermediate' },
  { term: 'Rookie Premium', definition: 'The extra value a card commands specifically because it is the player\'s first card', category: 'market', difficulty: 'beginner' },
  { term: 'Slab Tax', definition: 'The price premium a graded card commands over the same card in raw condition', category: 'market', difficulty: 'intermediate' },
  { term: 'Pop Count', definition: 'The number of copies graded at a specific level, affecting scarcity and price', category: 'market', difficulty: 'intermediate' },
  { term: 'Prospect', definition: 'A pre-rookie player whose early cards are collected based on future potential', category: 'market', difficulty: 'beginner' },
  { term: 'Junk Wax Era', definition: 'The late 1980s to early 1990s when cards were massively overproduced', category: 'market', difficulty: 'beginner' },
  { term: 'Rainbow Chase', definition: 'Collecting every parallel color variation of a single card', category: 'market', difficulty: 'intermediate' },

  // General
  { term: 'Penny Sleeve', definition: 'A thin, inexpensive clear plastic sleeve used as the first layer of card protection', category: 'general', difficulty: 'beginner' },
  { term: 'Top Loader', definition: 'A rigid plastic card holder that slides in from the top, standard protection for raw cards', category: 'general', difficulty: 'beginner' },
  { term: 'One-Touch', definition: 'A magnetic snap-shut display case for individual cards, premium protection', category: 'general', difficulty: 'intermediate' },
  { term: 'Card Saver', definition: 'A semi-rigid sleeve required by PSA and other grading companies for submissions', category: 'general', difficulty: 'intermediate' },
  { term: 'Binder Page', definition: 'A 9-pocket plastic sheet that fits in a 3-ring binder for card storage and display', category: 'general', difficulty: 'beginner' },
  { term: 'Whammy', definition: 'An unexpected poor result, like a base card where a hit was expected', category: 'general', difficulty: 'advanced' },
];

/* ─── Helpers ────────────────────────────────────────────── */
function dateHash(): number {
  const d = new Date();
  const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  let h = seed;
  h = ((h >> 16) ^ h) * 0x45d9f3b;
  h = ((h >> 16) ^ h) * 0x45d9f3b;
  h = (h >> 16) ^ h;
  return Math.abs(h);
}

function shuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = ((s * 1103515245 + 12345) & 0x7fffffff);
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getWrongOptions(correctDef: string, allTerms: LingoTerm[], seed: number): string[] {
  const others = allTerms.filter(t => t.definition !== correctDef);
  const shuffled = shuffle(others, seed);
  return shuffled.slice(0, 3).map(t => t.definition);
}

interface QuizState {
  questions: { term: LingoTerm; options: string[]; correctIdx: number }[];
  current: number;
  score: number;
  streak: number;
  answers: (number | null)[];
  timeLeft: number;
  phase: 'menu' | 'playing' | 'result' | 'review';
  mode: 'daily' | 'random';
}

const QUESTIONS_PER_QUIZ = 10;
const TIME_PER_QUESTION = 15;

export default function CardLingoClient() {
  const [state, setState] = useState<QuizState>({
    questions: [],
    current: 0,
    score: 0,
    streak: 0,
    answers: [],
    timeLeft: TIME_PER_QUESTION,
    phase: 'menu',
    mode: 'daily',
  });
  const [stats, setStats] = useState({ played: 0, bestScore: 0, totalCorrect: 0, currentStreak: 0 });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('cv-lingo-stats');
    if (saved) {
      try { setStats(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  const saveStats = useCallback((newStats: typeof stats) => {
    setStats(newStats);
    localStorage.setItem('cv-lingo-stats', JSON.stringify(newStats));
  }, []);

  const generateQuiz = useCallback((mode: 'daily' | 'random') => {
    const seed = mode === 'daily' ? dateHash() : Date.now();
    const selected = shuffle(TERMS, seed).slice(0, QUESTIONS_PER_QUIZ);
    const questions = selected.map((term, idx) => {
      const wrongs = getWrongOptions(term.definition, TERMS, seed + idx * 7);
      const allOpts = [term.definition, ...wrongs];
      const shuffledOpts = shuffle(allOpts, seed + idx * 13);
      return {
        term,
        options: shuffledOpts,
        correctIdx: shuffledOpts.indexOf(term.definition),
      };
    });
    setState({
      questions,
      current: 0,
      score: 0,
      streak: 0,
      answers: new Array(QUESTIONS_PER_QUIZ).fill(null),
      timeLeft: TIME_PER_QUESTION,
      phase: 'playing',
      mode,
    });
  }, []);

  /* Timer */
  useEffect(() => {
    if (state.phase !== 'playing') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setState(prev => {
        if (prev.timeLeft <= 1) {
          // Time's up — move to next
          const newAnswers = [...prev.answers];
          newAnswers[prev.current] = -1; // -1 = timeout
          const next = prev.current + 1;
          if (next >= QUESTIONS_PER_QUIZ) {
            return { ...prev, answers: newAnswers, phase: 'result', timeLeft: 0 };
          }
          return { ...prev, answers: newAnswers, current: next, timeLeft: TIME_PER_QUESTION, streak: 0 };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [state.phase, state.current]);

  const answer = useCallback((optIdx: number) => {
    setState(prev => {
      if (prev.answers[prev.current] !== null) return prev; // already answered
      const correct = optIdx === prev.questions[prev.current].correctIdx;
      const newAnswers = [...prev.answers];
      newAnswers[prev.current] = optIdx;
      const newStreak = correct ? prev.streak + 1 : 0;
      const speedBonus = correct ? Math.round((prev.timeLeft / TIME_PER_QUESTION) * 50) : 0;
      const streakBonus = correct && newStreak >= 3 ? 25 : correct && newStreak >= 2 ? 10 : 0;
      const points = correct ? 100 + speedBonus + streakBonus : 0;
      const newScore = prev.score + points;

      // Auto-advance after 1.2s
      setTimeout(() => {
        setState(p => {
          const next = p.current + 1;
          if (next >= QUESTIONS_PER_QUIZ) {
            // Quiz done
            const totalCorrect = p.answers.filter((a, i) => a === p.questions[i].correctIdx).length + (correct ? 1 : 0);
            const newStats = {
              played: stats.played + 1,
              bestScore: Math.max(stats.bestScore, newScore),
              totalCorrect: stats.totalCorrect + totalCorrect,
              currentStreak: correct ? stats.currentStreak + 1 : 0,
            };
            saveStats(newStats);
            return { ...p, phase: 'result' as const };
          }
          return { ...p, current: next, timeLeft: TIME_PER_QUESTION };
        });
      }, 1200);

      return { ...prev, answers: newAnswers, score: newScore, streak: newStreak };
    });
  }, [stats, saveStats]);

  const correctCount = state.answers.filter((a, i) => state.questions[i] && a === state.questions[i].correctIdx).length;
  const grade = correctCount >= 10 ? 'S' : correctCount >= 9 ? 'A+' : correctCount >= 8 ? 'A' : correctCount >= 7 ? 'B+' : correctCount >= 6 ? 'B' : correctCount >= 5 ? 'C' : correctCount >= 4 ? 'D' : 'F';
  const gradeColor = grade.startsWith('S') ? 'text-yellow-400' : grade.startsWith('A') ? 'text-green-400' : grade.startsWith('B') ? 'text-blue-400' : grade.startsWith('C') ? 'text-orange-400' : 'text-red-400';

  const categoryIcon: Record<string, string> = {
    'grading': 'G', 'products': 'P', 'card-types': 'C', 'trading': 'T', 'market': 'M', 'general': '*',
  };

  const diffColor: Record<string, string> = {
    'beginner': 'text-green-400 bg-green-900/30',
    'intermediate': 'text-yellow-400 bg-yellow-900/30',
    'advanced': 'text-red-400 bg-red-900/30',
  };

  /* ─── Menu ─────────────────────────────────────────────── */
  if (state.phase === 'menu') {
    return (
      <div className="space-y-6">
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-6 text-center">
          <div className="text-5xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-white mb-2">Card Lingo Quiz</h2>
          <p className="text-slate-400 mb-6">10 questions. 15 seconds each. How well do you know your hobby terms?</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => generateQuiz('daily')}
              className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl transition-colors">
              Daily Challenge
            </button>
            <button onClick={() => generateQuiz('random')}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold rounded-xl transition-colors">
              Random Quiz
            </button>
          </div>
        </div>
        {stats.played > 0 && (
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Your Stats</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-xl font-bold text-white">{stats.played}</div>
                <div className="text-xs text-slate-500">Quizzes Played</div>
              </div>
              <div>
                <div className="text-xl font-bold text-violet-400">{stats.bestScore}</div>
                <div className="text-xs text-slate-500">Best Score</div>
              </div>
              <div>
                <div className="text-xl font-bold text-green-400">{stats.totalCorrect}</div>
                <div className="text-xs text-slate-500">Total Correct</div>
              </div>
              <div>
                <div className="text-xl font-bold text-amber-400">{stats.played > 0 ? Math.round((stats.totalCorrect / (stats.played * 10)) * 100) : 0}%</div>
                <div className="text-xs text-slate-500">Accuracy</div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ─── Playing ──────────────────────────────────────────── */
  if (state.phase === 'playing') {
    const q = state.questions[state.current];
    const answered = state.answers[state.current] !== null;
    const isCorrect = answered && state.answers[state.current] === q.correctIdx;

    return (
      <div className="space-y-6">
        {/* Progress bar */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400">Q{state.current + 1}/{QUESTIONS_PER_QUIZ}</span>
          <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-violet-600 transition-all" style={{ width: `${((state.current + (answered ? 1 : 0)) / QUESTIONS_PER_QUIZ) * 100}%` }} />
          </div>
          <span className="text-sm font-bold text-violet-400">{state.score} pts</span>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-2 justify-center">
          <div className={`text-3xl font-bold tabular-nums ${state.timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
            {state.timeLeft}s
          </div>
          {state.streak >= 2 && (
            <span className="text-xs bg-amber-900/40 text-amber-400 px-2 py-0.5 rounded-full border border-amber-800/40">
              {state.streak}x streak
            </span>
          )}
        </div>

        {/* Question */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${diffColor[q.term.difficulty]}`}>
              {q.term.difficulty}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-700/50 text-slate-400">
              {categoryIcon[q.term.category]} {q.term.category}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            &ldquo;{q.term.term}&rdquo;
          </h2>
          <p className="text-slate-400 text-sm mt-2">What does this term mean?</p>
        </div>

        {/* Options */}
        <div className="grid gap-3">
          {q.options.map((opt, idx) => {
            let btnClass = 'bg-slate-800/40 border-slate-700/50 hover:border-violet-600/50 text-slate-300';
            if (answered) {
              if (idx === q.correctIdx) btnClass = 'bg-green-900/30 border-green-600/50 text-green-400';
              else if (idx === state.answers[state.current]) btnClass = 'bg-red-900/30 border-red-600/50 text-red-400';
              else btnClass = 'bg-slate-800/20 border-slate-800/30 text-slate-600';
            }
            return (
              <button key={idx} onClick={() => !answered && answer(idx)} disabled={answered}
                className={`text-left border rounded-xl p-4 transition-all ${btnClass}`}>
                <span className="text-xs text-slate-500 mr-2">{String.fromCharCode(65 + idx)}.</span>
                <span className="text-sm">{opt}</span>
              </button>
            );
          })}
        </div>

        {answered && (
          <div className={`text-center text-sm font-medium ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
            {isCorrect ? 'Correct!' : `Wrong — it means: "${q.term.definition.slice(0, 80)}..."`}
          </div>
        )}
      </div>
    );
  }

  /* ─── Results ──────────────────────────────────────────── */
  if (state.phase === 'result' || state.phase === 'review') {
    if (state.phase === 'review') {
      return (
        <div className="space-y-4">
          <button onClick={() => setState(p => ({ ...p, phase: 'result' }))}
            className="text-sm text-violet-400 hover:text-violet-300">&larr; Back to Results</button>
          <h2 className="text-xl font-bold text-white">Answer Review</h2>
          {state.questions.map((q, i) => {
            const userAns = state.answers[i];
            const correct = userAns === q.correctIdx;
            return (
              <div key={i} className={`bg-slate-800/40 border rounded-xl p-4 ${correct ? 'border-green-800/40' : 'border-red-800/40'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-sm font-bold ${correct ? 'text-green-400' : 'text-red-400'}`}>
                    {correct ? 'Correct' : userAns === -1 ? 'Time Up' : 'Wrong'}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${diffColor[q.term.difficulty]}`}>
                    {q.term.difficulty}
                  </span>
                </div>
                <p className="text-white font-semibold">&ldquo;{q.term.term}&rdquo;</p>
                <p className="text-slate-400 text-sm mt-1">{q.term.definition}</p>
              </div>
            );
          })}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-8 text-center">
          <div className={`text-6xl font-black ${gradeColor} mb-2`}>{grade}</div>
          <p className="text-2xl font-bold text-white mb-1">{state.score} points</p>
          <p className="text-slate-400">{correctCount}/{QUESTIONS_PER_QUIZ} correct</p>
          <div className="flex gap-1 justify-center mt-4">
            {state.answers.map((a, i) => (
              <div key={i} className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                state.questions[i] && a === state.questions[i].correctIdx
                  ? 'bg-green-600 text-white'
                  : 'bg-red-900/50 text-red-400'
              }`}>
                {i + 1}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          <button onClick={() => generateQuiz('daily')}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-colors">
            Daily Challenge
          </button>
          <button onClick={() => generateQuiz('random')}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded-lg transition-colors">
            Random Quiz
          </button>
          <button onClick={() => setState(p => ({ ...p, phase: 'review' }))}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 text-sm rounded-lg transition-colors border border-slate-700/50">
            Review Answers
          </button>
          <button onClick={() => setState(p => ({ ...p, phase: 'menu' }))}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 text-sm rounded-lg transition-colors border border-slate-700/50">
            Menu
          </button>
        </div>
      </div>
    );
  }

  return null;
}
