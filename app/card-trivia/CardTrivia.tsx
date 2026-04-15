'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';

/* ── question bank ─────────────────────────────────────────── */

interface Question {
  id: number;
  category: 'history' | 'grading' | 'players' | 'products' | 'market' | 'culture';
  question: string;
  options: string[];
  correct: number; // index of correct option
  explanation: string;
}

const CATEGORIES: Record<string, { label: string; color: string }> = {
  history: { label: 'History', color: 'text-amber-400' },
  grading: { label: 'Grading', color: 'text-purple-400' },
  players: { label: 'Players', color: 'text-blue-400' },
  products: { label: 'Products', color: 'text-green-400' },
  market: { label: 'Market', color: 'text-red-400' },
  culture: { label: 'Culture', color: 'text-cyan-400' },
};

const ALL_QUESTIONS: Question[] = [
  // ── HISTORY ──
  { id: 1, category: 'history', question: 'What year was the first known baseball card produced?', options: ['1869', '1886', '1909', '1933'], correct: 1, explanation: 'The earliest known baseball cards were produced in 1886 by Goodwin & Company, included in Old Judge and Gypsy Queen cigarette packs.' },
  { id: 2, category: 'history', question: 'Which card set is considered the "Holy Grail" of baseball cards?', options: ['1952 Topps', '1909 T206', '1933 Goudey', '1914 Cracker Jack'], correct: 1, explanation: 'The 1909 T206 set, particularly the Honus Wagner card, is considered the most iconic and valuable card set in collecting history.' },
  { id: 3, category: 'history', question: 'What year did Topps begin its legendary partnership with Major League Baseball?', options: ['1948', '1951', '1952', '1955'], correct: 2, explanation: 'Topps released its first major baseball card set in 1952, featuring the iconic Mickey Mantle rookie card (#311).' },
  { id: 4, category: 'history', question: 'Which era is known as the "Junk Wax" era in card collecting?', options: ['1970-1979', '1980-1985', '1986-1994', '1995-2000'], correct: 2, explanation: 'The Junk Wax era (roughly 1986-1994) saw massive overproduction of cards, flooding the market and crashing values for most common cards from this period.' },
  { id: 5, category: 'history', question: 'When did Upper Deck release its first baseball card set?', options: ['1986', '1987', '1989', '1991'], correct: 2, explanation: 'Upper Deck entered the market in 1989 with its iconic Ken Griffey Jr. rookie card (#1), setting new standards for card quality with hologram technology.' },
  { id: 6, category: 'history', question: 'What was the first sports card company to use hologram technology?', options: ['Topps', 'Fleer', 'Upper Deck', 'Donruss'], correct: 2, explanation: 'Upper Deck pioneered hologram technology on sports cards in 1989 as an anti-counterfeiting measure, revolutionizing card security.' },
  { id: 7, category: 'history', question: 'The 1986-87 Fleer set is most famous for which basketball rookie card?', options: ['Hakeem Olajuwon', 'Patrick Ewing', 'Michael Jordan', 'Charles Barkley'], correct: 2, explanation: 'The 1986-87 Fleer Michael Jordan rookie card (#57) is the most iconic basketball card ever produced and a benchmark for the entire hobby.' },
  { id: 8, category: 'history', question: 'Which company held an exclusive MLB license from 2009 to 2025?', options: ['Panini', 'Upper Deck', 'Topps', 'Fanatics'], correct: 2, explanation: 'Topps held the exclusive MLB Players Association license from 2009 until Fanatics acquired the rights, which began transitioning around 2025.' },

  // ── GRADING ──
  { id: 9, category: 'grading', question: 'What is the highest grade a PSA card can receive?', options: ['PSA 9', 'PSA 10', 'PSA Pristine', 'PSA 10 Gem Mint'], correct: 3, explanation: 'PSA 10 Gem Mint is the highest grade PSA awards. The card must have perfect centering, sharp corners, smooth edges, and an unblemished surface.' },
  { id: 10, category: 'grading', question: 'Which grading company uses four subgrades (centering, corners, edges, surface)?', options: ['PSA', 'BGS (Beckett)', 'CGC', 'SGC'], correct: 1, explanation: 'BGS (Beckett Grading Services) is known for its four subgrade system, each scored from 1-10. A perfect 10 across all four earns the coveted BGS Black Label.' },
  { id: 11, category: 'grading', question: 'What does "pop report" mean in card grading?', options: ['Popularity ranking of cards', 'Population count of graded cards at each grade', 'The sound a fresh slab makes', 'Power Of Purchase report'], correct: 1, explanation: 'A pop report (population report) shows how many copies of a specific card have been graded at each level. Low pop counts often command premium prices.' },
  { id: 12, category: 'grading', question: 'What is the BGS equivalent of a PSA 10?', options: ['BGS 10', 'BGS 9.5', 'BGS Pristine', 'BGS Black Label'], correct: 1, explanation: 'BGS 9.5 Gem Mint is roughly equivalent to PSA 10. A BGS 10 Pristine and BGS 10 Black Label are actually rarer and more valuable than a PSA 10.' },
  { id: 13, category: 'grading', question: 'What does "raw" mean when referring to a sports card?', options: ['A card in terrible condition', 'An ungraded card', 'A card fresh from a pack', 'A card without a sleeve'], correct: 1, explanation: 'A "raw" card simply means it has not been submitted to or authenticated by a professional grading company. It can be in any condition.' },
  { id: 14, category: 'grading', question: 'Which grading company uses a tuxedo-black label for its highest grade?', options: ['PSA', 'BGS', 'CGC', 'SGC'], correct: 1, explanation: 'BGS uses a black label for cards that receive a perfect 10 in all four subgrades — the legendary BGS Black Label, the rarest and most valuable grade designation in the hobby.' },
  { id: 15, category: 'grading', question: 'What PSA grade typically represents the biggest value jump from the grade below it?', options: ['PSA 7 to PSA 8', 'PSA 8 to PSA 9', 'PSA 9 to PSA 10', 'PSA 6 to PSA 7'], correct: 2, explanation: 'The jump from PSA 9 to PSA 10 is typically the largest value multiplier, often 2-5x or more for popular cards. This is the most consequential grade break in the hobby.' },

  // ── PLAYERS ──
  { id: 16, category: 'players', question: 'Which player has the most expensive sports card ever sold at auction?', options: ['Babe Ruth', 'Mickey Mantle', 'Honus Wagner', 'LeBron James'], correct: 1, explanation: 'A 1952 Topps Mickey Mantle PSA 9.5 sold for $12.6 million in August 2022, making it the most expensive sports card ever auctioned.' },
  { id: 17, category: 'players', question: 'Shohei Ohtani is unique in card collecting because he appears in which two card categories?', options: ['Rookie and veteran', 'Pitcher and hitter', 'American and Japanese', 'Baseball and basketball'], correct: 1, explanation: 'Ohtani is the ultimate two-way player, appearing as both a pitcher and hitter on cards — creating unique collector demand across both categories.' },
  { id: 18, category: 'players', question: 'Which NBA player had the most expensive basketball card sale (over $5.8 million)?', options: ['Michael Jordan', 'LeBron James', 'Kobe Bryant', 'Giannis Antetokounmpo'], correct: 1, explanation: 'A 2003-04 Upper Deck Exquisite Collection LeBron James Rookie Patch Auto sold for $5.8 million, the record for a basketball card.' },
  { id: 19, category: 'players', question: 'Victor Wembanyama\'s most sought-after rookie card brand is typically:', options: ['Topps Chrome', 'Panini Prizm', 'Upper Deck', 'Bowman'], correct: 1, explanation: 'Panini Prizm is the premier brand for basketball rookies. The Prizm Silver parallel is the most iconic modern basketball card design.' },
  { id: 20, category: 'players', question: 'Which quarterback\'s rookie cards saw the biggest spike after being drafted #1 overall in 2024?', options: ['Jayden Daniels', 'Caleb Williams', 'Drake Maye', 'Bo Nix'], correct: 1, explanation: 'Caleb Williams, drafted #1 overall by the Chicago Bears in 2024, saw the biggest spike in rookie card values due to the combination of draft position and market hype.' },
  { id: 21, category: 'players', question: 'Wayne Gretzky\'s most valuable hockey card is from which set?', options: ['1979 O-Pee-Chee', '1980 Topps', '1985 Topps', '1979 Topps'], correct: 0, explanation: 'The 1979 O-Pee-Chee Wayne Gretzky rookie card is the most valuable hockey card in existence, with high-grade examples selling for over $1 million.' },
  { id: 22, category: 'players', question: 'Which female athlete\'s rookie cards broke records in 2024?', options: ['Angel Reese', 'Caitlin Clark', 'Sabrina Ionescu', 'Paige Bueckers'], correct: 1, explanation: 'Caitlin Clark\'s rookie cards broke records for women\'s sports cards in 2024, driven by her historic NCAA career and WNBA debut with the Indiana Fever.' },

  // ── PRODUCTS ──
  { id: 23, category: 'products', question: 'What is a "hobby box" vs a "retail box"?', options: ['Same thing, different names', 'Hobby has guaranteed hits, retail does not', 'Retail is more expensive', 'Hobby is only sold online'], correct: 1, explanation: 'Hobby boxes are sold at card shops and typically guarantee autographs or relics. Retail boxes (blasters, hangers) are sold at stores like Target/Walmart with no guaranteed hits.' },
  { id: 24, category: 'products', question: 'What does "ETB" stand for in Pokemon card collecting?', options: ['Elite Trainer Box', 'Extended Trading Box', 'Energy Trainer Bundle', 'Exclusive Trading Booster'], correct: 0, explanation: 'ETB stands for Elite Trainer Box, a popular Pokemon TCG product containing booster packs, energy cards, dice, and card sleeves.' },
  { id: 25, category: 'products', question: 'In card collecting, what is a "parallel"?', options: ['Two identical cards', 'A variant version of a base card with different finish or numbering', 'A card showing two players side by side', 'A counterfeit card'], correct: 1, explanation: 'Parallels are alternate versions of base cards with different colors, finishes (refractor, prizm, holo), or serial numbering. They range from common to extremely rare.' },
  { id: 26, category: 'products', question: 'What is a "1/1" (one-of-one) card?', options: ['The first card in a set', 'A card with only one copy in existence', 'A card worth exactly $1', 'The best card in a pack'], correct: 1, explanation: 'A 1/1 card is serial-numbered to just one copy, making it the only example that exists. These are among the most valuable cards in any product.' },
  { id: 27, category: 'products', question: 'Which Panini brand features distinctive silver-colored prizm parallels?', options: ['Donruss', 'Select', 'Prizm', 'Mosaic'], correct: 2, explanation: 'Panini Prizm is known for its silver Prizm parallel, a hyper, shimmering refractor-style card that has become the defining look of modern basketball and football collecting.' },
  { id: 28, category: 'products', question: 'What is "Bowman" primarily known for in baseball card collecting?', options: ['Vintage cards from the 1950s', 'Prospect and draft pick cards', 'Autograph-only products', 'Digital-only cards'], correct: 1, explanation: 'Bowman (now owned by Topps) is the premier brand for MLB prospects, featuring players\' first officially licensed cards before they reach the majors. Bowman 1st cards are highly sought after.' },

  // ── MARKET ──
  { id: 29, category: 'market', question: 'What typically happens to a player\'s card value right after they win MVP?', options: ['Drops immediately', 'Stays flat', 'Spikes then gradually settles', 'Steadily increases for years'], correct: 2, explanation: 'MVP awards typically cause an immediate price spike as demand surges, followed by a gradual settling to a new, higher baseline — a pattern known as "buy the rumor, sell the news."' },
  { id: 30, category: 'market', question: 'What is "flipping" in the card collecting hobby?', options: ['Literally flipping cards upside down', 'Buying cards to resell quickly for profit', 'Trading cards between collectors', 'Grading cards and reselling'], correct: 1, explanation: 'Flipping is the practice of buying cards at one price and quickly reselling them at a higher price for profit. Flippers often target undervalued cards or exploit market inefficiencies.' },
  { id: 31, category: 'market', question: 'Which time of year typically sees the highest baseball card prices?', options: ['Opening Day / Spring Training', 'All-Star Break', 'World Series', 'Off-season (December)'], correct: 0, explanation: 'Baseball card prices typically peak around Opening Day and spring training when optimism is highest. Rookie cards especially benefit from pre-season hype.' },
  { id: 32, category: 'market', question: 'What does "comps" mean when valuing a sports card?', options: ['Complimentary free cards', 'Comparable recent sales of the same card', 'Competition between bidders', 'Complete set pricing'], correct: 1, explanation: 'Comps (comparables) are recent actual sales of the same card in similar condition. They are the gold standard for determining a card\'s fair market value.' },
  { id: 33, category: 'market', question: 'What platform handles the majority of sports card sales online?', options: ['StockX', 'COMC', 'eBay', 'Amazon'], correct: 2, explanation: 'eBay remains the dominant marketplace for sports card sales, handling an estimated 60-70% of all online card transactions. Its completed listings serve as the primary pricing reference.' },
  { id: 34, category: 'market', question: 'What is the "$600 rule" that affects card sellers?', options: ['Maximum price for a single card', 'IRS reporting threshold for online sales', 'eBay listing fee threshold', 'Grading cost limit'], correct: 1, explanation: 'The $600 rule requires online marketplaces to issue 1099-K tax forms to sellers who exceed $600 in annual gross sales. This affects many card sellers on eBay, COMC, and other platforms.' },

  // ── CULTURE ──
  { id: 35, category: 'culture', question: 'What is "The National" in card collecting?', options: ['A patriotic card set', 'The largest annual card collecting convention', 'A grading designation', 'The National Card Association'], correct: 1, explanation: 'The National Sports Collectors Convention (NSCC), known as "The National," is the largest annual card show in the world, featuring hundreds of dealers, exclusive releases, and industry events.' },
  { id: 36, category: 'culture', question: 'What does "PC" stand for in card collecting?', options: ['Personal Collection', 'Price Check', 'Perfect Condition', 'Player Card'], correct: 0, explanation: 'PC stands for Personal Collection — the cards a collector keeps for themselves rather than for investment or trade. "That\'s going straight to the PC" means it\'s a keeper.' },
  { id: 37, category: 'culture', question: 'What is a "grail" card?', options: ['A card in a cup holder', 'The most desired card in a collector\'s pursuit', 'A card worth over $10,000', 'A card with a printing error'], correct: 1, explanation: 'A "grail" card (from Holy Grail) is the ultimate card a collector is searching for — their most desired, often hard-to-find card. Every collector has their own grail.' },
  { id: 38, category: 'culture', question: 'What does "wax" refer to in card collecting?', options: ['A card preservation technique', 'Sealed packs or boxes of cards', 'A type of card surface finish', 'A grading term'], correct: 1, explanation: 'Wax refers to sealed card packs or boxes, originating from the wax paper wrapping on vintage card packs. "Ripping wax" means opening sealed packs.' },
  { id: 39, category: 'culture', question: 'In card collecting, what is a "break"?', options: ['A damaged card', 'Group opening where participants buy spots for specific teams', 'A pause in collecting', 'Breaking a card out of a graded slab'], correct: 1, explanation: 'A break is a group box opening where participants buy spots (usually assigned to teams) and receive all cards of their team. This lets collectors access expensive products affordably.' },
  { id: 40, category: 'culture', question: 'What is a "penny sleeve"?', options: ['A card worth one cent', 'A thin plastic card protector costing about a penny', 'A rare sleeve parallel card', 'A budget storage solution'], correct: 1, explanation: 'A penny sleeve is a thin, inexpensive plastic sleeve used as the first layer of card protection. Combined with a top loader or one-touch, it forms the standard card storage setup.' },
];

const STORAGE_KEY = 'cardvault_trivia';
const QUESTIONS_PER_GAME = 10;

/* ── seeded random ─────────────────────────────────────────── */

function dateHash(): number {
  const d = new Date();
  const str = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

interface TriviaState {
  bestScore: number;
  gamesPlayed: number;
  totalCorrect: number;
  totalAnswered: number;
  streak: number;
  bestStreak: number;
  lastPlayed: string;
  categoryStats: Record<string, { correct: number; total: number }>;
}

function loadState(): TriviaState {
  if (typeof window === 'undefined') return defaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultState(), ...JSON.parse(raw) } : defaultState();
  } catch { return defaultState(); }
}

function defaultState(): TriviaState {
  return { bestScore: 0, gamesPlayed: 0, totalCorrect: 0, totalAnswered: 0, streak: 0, bestStreak: 0, lastPlayed: '', categoryStats: {} };
}

function saveState(s: TriviaState) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
}

/* ── component ─────────────────────────────────────────────── */

type GamePhase = 'menu' | 'playing' | 'result' | 'review';
type Mode = 'daily' | 'random' | 'category';

export default function CardTrivia() {
  const [state, setState] = useState<TriviaState>(defaultState());
  const [phase, setPhase] = useState<GamePhase>('menu');
  const [mode, setMode] = useState<Mode>('daily');
  const [categoryFilter, setCategoryFilter] = useState<string>('history');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [inGameStreak, setInGameStreak] = useState(0);

  useEffect(() => {
    setState(loadState());
  }, []);

  const startGame = useCallback((m: Mode) => {
    setMode(m);
    let pool: Question[];
    if (m === 'daily') {
      pool = seededShuffle(ALL_QUESTIONS, dateHash()).slice(0, QUESTIONS_PER_GAME);
    } else if (m === 'category') {
      const catQs = ALL_QUESTIONS.filter(q => q.category === categoryFilter);
      pool = seededShuffle(catQs, Date.now()).slice(0, Math.min(QUESTIONS_PER_GAME, catQs.length));
    } else {
      pool = seededShuffle(ALL_QUESTIONS, Date.now()).slice(0, QUESTIONS_PER_GAME);
    }
    setQuestions(pool);
    setCurrentQ(0);
    setSelected(null);
    setScore(0);
    setAnswers([]);
    setInGameStreak(0);
    setPhase('playing');
  }, [categoryFilter]);

  const handleAnswer = useCallback((idx: number) => {
    if (selected !== null) return; // already answered
    setSelected(idx);
    const correct = questions[currentQ].correct === idx;
    const newAnswers = [...answers, idx];
    setAnswers(newAnswers);

    if (correct) {
      setScore(s => s + 1);
      setInGameStreak(s => s + 1);
    } else {
      setInGameStreak(0);
    }

    // Auto-advance after delay
    setTimeout(() => {
      if (currentQ + 1 < questions.length) {
        setCurrentQ(q => q + 1);
        setSelected(null);
      } else {
        // Game over
        const finalScore = correct ? score + 1 : score;
        const totalQs = questions.length;
        setState(prev => {
          const next = {
            ...prev,
            bestScore: Math.max(prev.bestScore, finalScore),
            gamesPlayed: prev.gamesPlayed + 1,
            totalCorrect: prev.totalCorrect + finalScore,
            totalAnswered: prev.totalAnswered + totalQs,
            streak: mode === 'daily' ? prev.streak + 1 : prev.streak,
            bestStreak: Math.max(prev.bestStreak, mode === 'daily' ? prev.streak + 1 : prev.streak),
            lastPlayed: new Date().toISOString().split('T')[0],
            categoryStats: { ...prev.categoryStats },
          };
          for (let i = 0; i < questions.length; i++) {
            const cat = questions[i].category;
            if (!next.categoryStats[cat]) next.categoryStats[cat] = { correct: 0, total: 0 };
            next.categoryStats[cat].total++;
            if (newAnswers[i] === questions[i].correct) next.categoryStats[cat].correct++;
          }
          saveState(next);
          return next;
        });
        setPhase('result');
      }
    }, 1500);
  }, [selected, questions, currentQ, answers, score, mode]);

  const getGrade = (s: number, total: number): { grade: string; color: string } => {
    const pct = total > 0 ? s / total : 0;
    if (pct >= 0.9) return { grade: 'S', color: 'text-yellow-400' };
    if (pct >= 0.8) return { grade: 'A', color: 'text-emerald-400' };
    if (pct >= 0.7) return { grade: 'B', color: 'text-blue-400' };
    if (pct >= 0.6) return { grade: 'C', color: 'text-orange-400' };
    if (pct >= 0.5) return { grade: 'D', color: 'text-red-400' };
    return { grade: 'F', color: 'text-red-500' };
  };

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{state.gamesPlayed}</div>
          <div className="text-xs text-gray-400 mt-1">Games Played</div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400">{state.bestScore}/{QUESTIONS_PER_GAME}</div>
          <div className="text-xs text-gray-400 mt-1">Best Score</div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {state.totalAnswered > 0 ? Math.round(state.totalCorrect / state.totalAnswered * 100) : 0}%
          </div>
          <div className="text-xs text-gray-400 mt-1">Accuracy</div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-orange-400">{state.bestStreak}</div>
          <div className="text-xs text-gray-400 mt-1">Best Day Streak</div>
        </div>
      </div>

      {/* ── MENU ────────────────────────────────────────── */}
      {phase === 'menu' && (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-3 gap-4">
            <button
              onClick={() => startGame('daily')}
              className="bg-indigo-900/40 border border-indigo-700/50 hover:border-indigo-500 rounded-xl p-6 text-left transition-colors group"
            >
              <div className="text-2xl mb-2">&#128197;</div>
              <h3 className="text-white font-bold text-lg group-hover:text-indigo-300 transition-colors">Daily Challenge</h3>
              <p className="text-gray-400 text-sm mt-1">Same 10 questions for everyone today. Compare scores with friends.</p>
            </button>

            <button
              onClick={() => startGame('random')}
              className="bg-purple-900/40 border border-purple-700/50 hover:border-purple-500 rounded-xl p-6 text-left transition-colors group"
            >
              <div className="text-2xl mb-2">&#127922;</div>
              <h3 className="text-white font-bold text-lg group-hover:text-purple-300 transition-colors">Random Mix</h3>
              <p className="text-gray-400 text-sm mt-1">10 random questions from all categories. Every game is different.</p>
            </button>

            <div className="bg-cyan-900/40 border border-cyan-700/50 rounded-xl p-6">
              <div className="text-2xl mb-2">&#127919;</div>
              <h3 className="text-white font-bold text-lg">Category Focus</h3>
              <p className="text-gray-400 text-sm mt-1 mb-3">Deep dive into one category.</p>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm mb-2 focus:outline-none focus:border-cyan-500"
              >
                {Object.entries(CATEGORIES).map(([key, cat]) => (
                  <option key={key} value={key}>{cat.label}</option>
                ))}
              </select>
              <button
                onClick={() => startGame('category')}
                className="w-full px-4 py-2 bg-cyan-700/60 hover:bg-cyan-600/60 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Start
              </button>
            </div>
          </div>

          {/* Category Performance */}
          {state.gamesPlayed > 0 && (
            <div>
              <h3 className="text-white font-semibold mb-3">Category Performance</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(CATEGORIES).map(([key, cat]) => {
                  const cs = state.categoryStats[key];
                  const pct = cs && cs.total > 0 ? Math.round(cs.correct / cs.total * 100) : 0;
                  return (
                    <div key={key} className="bg-gray-800/40 border border-gray-700/30 rounded-lg p-3">
                      <div className={`text-xs font-medium ${cat.color}`}>{cat.label}</div>
                      <div className="text-white font-bold mt-1">{pct}%</div>
                      <div className="text-xs text-gray-500">{cs?.correct ?? 0}/{cs?.total ?? 0} correct</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── PLAYING ─────────────────────────────────────── */}
      {phase === 'playing' && questions.length > 0 && (
        <div className="space-y-4">
          {/* Progress */}
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-800 rounded-full h-2">
              <div
                className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((currentQ + (selected !== null ? 1 : 0)) / questions.length) * 100}%` }}
              />
            </div>
            <span className="text-gray-400 text-sm font-mono">{currentQ + 1}/{questions.length}</span>
            <span className="text-emerald-400 text-sm font-bold">{score} pts</span>
            {inGameStreak >= 3 && (
              <span className="text-orange-400 text-xs font-bold animate-pulse">{inGameStreak} streak!</span>
            )}
          </div>

          {/* Question Card */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border border-gray-700/50 ${CATEGORIES[questions[currentQ].category]?.color ?? 'text-gray-400'}`}>
                {CATEGORIES[questions[currentQ].category]?.label ?? questions[currentQ].category}
              </span>
              <span className="text-xs text-gray-500">Question {currentQ + 1} of {questions.length}</span>
            </div>

            <h3 className="text-white text-lg sm:text-xl font-bold mb-6">{questions[currentQ].question}</h3>

            <div className="grid gap-3">
              {questions[currentQ].options.map((opt, idx) => {
                const isCorrect = questions[currentQ].correct === idx;
                const isSelected = selected === idx;
                let btnClass = 'bg-gray-700/40 border-gray-600/50 hover:border-indigo-500 text-white';
                if (selected !== null) {
                  if (isCorrect) btnClass = 'bg-emerald-900/50 border-emerald-500 text-emerald-200';
                  else if (isSelected) btnClass = 'bg-red-900/50 border-red-500 text-red-200';
                  else btnClass = 'bg-gray-800/30 border-gray-700/30 text-gray-500';
                }
                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    disabled={selected !== null}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-all text-sm sm:text-base font-medium ${btnClass} ${selected === null ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    <span className="text-gray-500 mr-2 font-mono">{String.fromCharCode(65 + idx)}.</span>
                    {opt}
                    {selected !== null && isCorrect && <span className="float-right">&#10003;</span>}
                    {selected !== null && isSelected && !isCorrect && <span className="float-right">&#10007;</span>}
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {selected !== null && (
              <div className="mt-4 p-3 bg-gray-900/50 border border-gray-700/30 rounded-lg">
                <p className="text-gray-300 text-sm">{questions[currentQ].explanation}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── RESULT ──────────────────────────────────────── */}
      {phase === 'result' && (
        <div className="text-center space-y-6">
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-8">
            {(() => {
              const g = getGrade(score, questions.length);
              return (
                <>
                  <div className={`text-6xl font-black ${g.color}`}>{g.grade}</div>
                  <div className="text-3xl font-bold text-white mt-2">{score}/{questions.length}</div>
                  <div className="text-gray-400 mt-1">
                    {score === questions.length ? 'PERFECT SCORE!' : score >= questions.length * 0.8 ? 'Excellent!' : score >= questions.length * 0.6 ? 'Good job!' : score >= questions.length * 0.4 ? 'Keep studying!' : 'Room to improve!'}
                  </div>

                  {/* Per-question review */}
                  <div className="flex justify-center gap-1 mt-4">
                    {questions.map((q, i) => (
                      <div
                        key={q.id}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                          answers[i] === q.correct ? 'bg-emerald-900/50 text-emerald-300' : 'bg-red-900/50 text-red-300'
                        }`}
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>

          <div className="flex justify-center gap-3 flex-wrap">
            <button
              onClick={() => setPhase('review')}
              className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Review Answers
            </button>
            <button
              onClick={() => setPhase('menu')}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Play Again
            </button>
            <button
              onClick={() => {
                const text = `CardVault Trivia: ${score}/${questions.length} (${getGrade(score, questions.length).grade} grade) 🎯\nhttps://cardvault-two.vercel.app/card-trivia`;
                navigator.clipboard?.writeText(text);
              }}
              className="px-5 py-2.5 bg-cyan-700/60 hover:bg-cyan-600/60 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Share Score
            </button>
          </div>
        </div>
      )}

      {/* ── REVIEW ──────────────────────────────────────── */}
      {phase === 'review' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-bold text-lg">Answer Review</h3>
            <button onClick={() => setPhase('menu')} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors">
              Back to Menu
            </button>
          </div>
          {questions.map((q, i) => {
            const wasCorrect = answers[i] === q.correct;
            return (
              <div key={q.id} className={`border rounded-xl p-4 ${wasCorrect ? 'bg-emerald-950/20 border-emerald-800/30' : 'bg-red-950/20 border-red-800/30'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${wasCorrect ? 'bg-emerald-800 text-emerald-200' : 'bg-red-800 text-red-200'}`}>
                    {wasCorrect ? '\u2713' : '\u2717'}
                  </span>
                  <span className={`text-xs ${CATEGORIES[q.category]?.color}`}>{CATEGORIES[q.category]?.label}</span>
                </div>
                <p className="text-white font-medium text-sm mb-2">{q.question}</p>
                <div className="space-y-1 mb-2">
                  {q.options.map((opt, oi) => (
                    <div key={oi} className={`text-xs px-2 py-1 rounded ${
                      oi === q.correct ? 'text-emerald-300 font-bold' : oi === answers[i] ? 'text-red-300' : 'text-gray-500'
                    }`}>
                      {String.fromCharCode(65 + oi)}. {opt}
                      {oi === q.correct && ' \u2190 Correct'}
                      {oi === answers[i] && oi !== q.correct && ' \u2190 Your answer'}
                    </div>
                  ))}
                </div>
                <p className="text-gray-400 text-xs">{q.explanation}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Internal Links */}
      <div className="border-t border-gray-700/50 pt-6 mt-8">
        <h3 className="text-white font-semibold mb-3">More Games & Features</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { href: '/card-detective', label: 'Card Detective' },
            { href: '/card-streak', label: 'Card Streak' },
            { href: '/card-clash', label: 'Card Clash' },
            { href: '/card-memory', label: 'Memory Match' },
            { href: '/daily-challenges', label: 'Daily Challenges' },
            { href: '/guides', label: 'Collecting Guides' },
          ].map(link => (
            <Link key={link.href} href={link.href} className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors">
              {link.label} &rarr;
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
