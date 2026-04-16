'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';

// --- Types ---
interface Question {
  question: string;
  answers: string[];
  correct: number; // index 0-3
  category: string;
}

// --- Deterministic RNG ---
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

// --- Prize ladder ---
const PRIZES = [
  '$100', '$200', '$300', '$500', '$1,000',
  '$2,000', '$4,000', '$8,000', '$16,000', '$32,000',
  '$64,000', '$125,000', '$250,000', '$500,000', '$1,000,000',
];

const SAFETY_NETS = [4, 9]; // Q5 ($1,000) and Q10 ($32,000) are guaranteed

// --- Question Bank (120 questions across 6 categories, 3 difficulties) ---
const QUESTIONS: { easy: Question[]; medium: Question[]; hard: Question[] } = {
  easy: [
    { question: 'What does "RC" stand for on a sports card?', answers: ['Rare Collection', 'Rookie Card', 'Reserve Copy', 'Retail Card'], correct: 1, category: 'Basics' },
    { question: 'Which grading company uses a 10-point scale and is the most popular?', answers: ['BGS', 'CGC', 'PSA', 'SGC'], correct: 2, category: 'Grading' },
    { question: 'What sport does Shohei Ohtani play?', answers: ['Basketball', 'Football', 'Baseball', 'Hockey'], correct: 2, category: 'Players' },
    { question: 'What does PSA stand for?', answers: ['Pro Sports Authority', 'Professional Sports Authenticator', 'Premier Slab Association', 'Player Stats Analytics'], correct: 1, category: 'Grading' },
    { question: 'Which card brand is known for "Prizm" parallels?', answers: ['Topps', 'Upper Deck', 'Panini', 'Leaf'], correct: 2, category: 'Sets' },
    { question: 'What is a "hit" in card collecting?', answers: ['A damaged card', 'An autograph or relic card', 'A base card', 'A common card'], correct: 1, category: 'Basics' },
    { question: 'In which sport did Wayne Gretzky play?', answers: ['Baseball', 'Basketball', 'Football', 'Hockey'], correct: 3, category: 'Players' },
    { question: 'What does "BGS" stand for?', answers: ['Beckett Grading Services', 'Best Grade Standard', 'Base Grade System', 'Beckett Gold Standard'], correct: 0, category: 'Grading' },
    { question: 'What is a "parallel" card?', answers: ['A card printed sideways', 'A card with an alternate design or color', 'Two identical cards', 'A damaged misprint'], correct: 1, category: 'Basics' },
    { question: 'Which era is known for massive overproduction of cards?', answers: ['Pre-War (1900-1945)', 'Vintage (1950-1979)', 'Junk Wax (1987-1994)', 'Modern (2000-present)'], correct: 2, category: 'History' },
    { question: 'What is a "short print" (SP)?', answers: ['A small-sized card', 'A card printed in lower quantities', 'A card with short text', 'A card from a short set'], correct: 1, category: 'Basics' },
    { question: 'Which basketball player is known as "The King"?', answers: ['Michael Jordan', 'LeBron James', 'Kobe Bryant', 'Stephen Curry'], correct: 1, category: 'Players' },
    { question: 'What does a "1/1" on a card mean?', answers: ['First series', 'One of one — only copy that exists', 'Grade 1 out of 1', 'January first release'], correct: 1, category: 'Basics' },
    { question: 'What is a hobby box?', answers: ['A storage box', 'A sealed box of packs sold through card shops', 'A display case', 'A grading submission box'], correct: 1, category: 'Basics' },
    { question: 'Which company makes the official MLB card license?', answers: ['Panini', 'Upper Deck', 'Topps', 'Leaf'], correct: 2, category: 'Sets' },
    { question: 'What is "centering" on a card?', answers: ['The card\'s position in a binder', 'How evenly the borders are on all sides', 'The player\'s position on the team', 'The card number in the set'], correct: 1, category: 'Grading' },
    { question: 'Which football player is known for winning 7 Super Bowls?', answers: ['Peyton Manning', 'Joe Montana', 'Tom Brady', 'Aaron Rodgers'], correct: 2, category: 'Players' },
    { question: 'What does "raw" mean when describing a card?', answers: ['Ungraded', 'Damaged', 'Brand new', 'Autographed'], correct: 0, category: 'Basics' },
    { question: 'What is the highest PSA grade a card can receive?', answers: ['8', '9', '10', '100'], correct: 2, category: 'Grading' },
    { question: 'What color are base Prizm cards?', answers: ['Silver', 'Gold', 'Red', 'Blue'], correct: 0, category: 'Sets' },
  ],
  medium: [
    { question: 'What is the most valuable baseball card of all time?', answers: ['1952 Topps Mickey Mantle', '1909 T206 Honus Wagner', '1989 Upper Deck Ken Griffey Jr.', '1986 Fleer Michael Jordan'], correct: 1, category: 'Value' },
    { question: 'What year did Topps Chrome first release?', answers: ['1990', '1993', '1996', '2000'], correct: 2, category: 'Sets' },
    { question: 'Which grading company uses sub-grades for corners, edges, centering, and surface?', answers: ['PSA', 'CGC', 'BGS', 'SGC'], correct: 2, category: 'Grading' },
    { question: 'What does "EV" stand for in sealed product analysis?', answers: ['Extra Value', 'Expected Value', 'Estimated Volume', 'Elite Version'], correct: 1, category: 'Investing' },
    { question: 'Which player\'s 1986 Fleer rookie card is the most valuable basketball card?', answers: ['Larry Bird', 'Michael Jordan', 'Magic Johnson', 'Patrick Ewing'], correct: 1, category: 'Value' },
    { question: 'What is a "case hit"?', answers: ['A dented case', 'The rarest card found roughly once per sealed case', 'A card from a court case', 'A card stored in a case'], correct: 1, category: 'Basics' },
    { question: 'Which was the first sports card set ever produced?', answers: ['1909 T206', '1887 Old Judge', '1933 Goudey', '1952 Topps'], correct: 1, category: 'History' },
    { question: 'What is the "Junk Wax Era" approximately?', answers: ['1970-1980', '1987-1994', '1995-2005', '2000-2010'], correct: 1, category: 'History' },
    { question: 'What does "Gem Mint 10" mean at PSA?', answers: ['The card is gold', 'Perfect condition — no flaws under 10x magnification', 'Top 10% of all cards', 'The card has gems on it'], correct: 1, category: 'Grading' },
    { question: 'Which auction house sold the $12.6M Mickey Mantle card?', answers: ['Sotheby\'s', 'Heritage Auctions', 'Goldin', 'PWCC'], correct: 2, category: 'Value' },
    { question: 'What is a "refractor" card?', answers: ['A card that refracts light with a rainbow/chrome effect', 'A card that was returned', 'A card from a referee', 'A type of error card'], correct: 0, category: 'Sets' },
    { question: 'What does "wax" refer to in card collecting?', answers: ['Card protectors', 'Sealed packs/boxes (from wax-sealed packs)', 'Polished cards', 'Floor wax for card shows'], correct: 1, category: 'Basics' },
    { question: 'Who holds the record for most expensive football card ever sold?', answers: ['Joe Montana', 'Tom Brady', 'Patrick Mahomes', 'Jerry Rice'], correct: 2, category: 'Value' },
    { question: 'What percentage does eBay typically charge in selling fees?', answers: ['5%', '8%', '13%', '20%'], correct: 2, category: 'Investing' },
    { question: 'What is a "slab" in card collecting?', answers: ['A thick card', 'A graded card in its protective case', 'A card show table', 'A type of storage box'], correct: 1, category: 'Grading' },
    { question: 'Which hockey card set features "Young Guns" rookies?', answers: ['Topps', 'O-Pee-Chee', 'Upper Deck', 'Panini'], correct: 2, category: 'Sets' },
    { question: 'What year was the first Bowman Chrome set released?', answers: ['1995', '1997', '2000', '2003'], correct: 1, category: 'Sets' },
    { question: 'What does "COMC" stand for?', answers: ['Card of My Collection', 'Check Out My Cards', 'Collectors Only Market Club', 'Cards On Market Consignment'], correct: 1, category: 'Investing' },
    { question: 'Victor Wembanyama was the #1 pick in which NBA Draft?', answers: ['2021', '2022', '2023', '2024'], correct: 2, category: 'Players' },
    { question: 'What is a "buyback" card?', answers: ['A card the company bought back from collectors and re-stamped', 'A returned card', 'A cheap bulk card', 'A card you sold and rebought'], correct: 0, category: 'Sets' },
  ],
  hard: [
    { question: 'What is the pop report count for PSA 10 1952 Topps Mickey Mantle #311?', answers: ['3', '7', '14', '50+'], correct: 0, category: 'Grading' },
    { question: 'Which T206 card back is considered rarest?', answers: ['Sweet Caporal', 'Piedmont', 'American Beauty', 'Broad Leaf'], correct: 3, category: 'History' },
    { question: 'What was the final sale price of the SGC 3 T206 Honus Wagner in 2022?', answers: ['$3.2M', '$5.5M', '$7.25M', '$12.6M'], correct: 2, category: 'Value' },
    { question: 'Which year introduced the first "refractor" technology in Topps Chrome?', answers: ['1993', '1996', '1998', '2000'], correct: 1, category: 'Sets' },
    { question: 'How many BGS 10 "Pristine" grades exist for 2003 Topps Chrome LeBron James RC?', answers: ['Under 10', '25-50', '100-200', '500+'], correct: 0, category: 'Grading' },
    { question: 'What was the original retail price of a 1986 Fleer Basketball wax box?', answers: ['$12', '$24', '$36', '$48'], correct: 0, category: 'History' },
    { question: 'Which card is known as the "Holy Grail" of hockey cards?', answers: ['1951 Parkhurst Gordie Howe RC', '1979 Topps Wayne Gretzky RC', '1966 Topps Bobby Orr RC', '1911 C55 Georges Vezina'], correct: 2, category: 'Value' },
    { question: 'What is the centering tolerance for a PSA Gem Mint 10?', answers: ['50/50 to 55/45', '55/45 to 60/40', '60/40 to 65/35', '65/35 to 70/30'], correct: 1, category: 'Grading' },
    { question: 'Which player has the most valuable rookie card in the Ultra-Modern era (2018+)?', answers: ['Luka Doncic', 'Patrick Mahomes', 'Victor Wembanyama', 'Connor McDavid'], correct: 2, category: 'Value' },
    { question: 'What is the PSA population for Gem Mint 10 1993 SP Derek Jeter RC #279?', answers: ['Under 100', '500-1,000', '2,000-3,000', '5,000+'], correct: 2, category: 'Grading' },
    { question: 'Which vintage set used "Play Ball" as its brand name in 1939-1941?', answers: ['Topps', 'Gum Inc.', 'Bowman', 'Leaf'], correct: 1, category: 'History' },
    { question: 'What percentage of cards submitted to PSA receive a 10 grade on average?', answers: ['2-5%', '10-15%', '25-30%', '40-50%'], correct: 1, category: 'Grading' },
    { question: 'The 1933 Goudey set is missing which card number, creating a famous collector chase?', answers: ['#1', '#106', '#188', '#240'], correct: 1, category: 'History' },
    { question: 'What was the first year Panini held the exclusive NBA card license?', answers: ['2009', '2012', '2015', '2018'], correct: 1, category: 'Sets' },
    { question: 'What is the approximate turnaround time for PSA "Regular" service as of 2025?', answers: ['5 business days', '30 business days', '65 business days', '120 business days'], correct: 2, category: 'Grading' },
    { question: 'Which error made the 1989 Fleer Billy Ripken card infamous?', answers: ['Wrong photo', 'Misspelled name', 'Obscene phrase on bat knob', 'Upside down printing'], correct: 2, category: 'History' },
    { question: 'What is the "Superfractor" numbered to?', answers: ['1/1', '/5', '/10', '/25'], correct: 0, category: 'Sets' },
    { question: 'What year did eBay introduce the Authenticity Guarantee for cards over $150?', answers: ['2019', '2020', '2021', '2022'], correct: 2, category: 'Investing' },
    { question: 'Which player\'s 2009-10 National Treasures Logoman Auto sold for $4.6M?', answers: ['Stephen Curry', 'LeBron James', 'Kevin Durant', 'James Harden'], correct: 1, category: 'Value' },
    { question: 'What is the typical auction house buyer\'s premium?', answers: ['5%', '10%', '15-20%', '25-30%'], correct: 2, category: 'Investing' },
  ],
};

// --- Shuffle array with seeded RNG ---
function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// --- Generate 15 questions for a game ---
function generateQuestions(seed: number): Question[] {
  const rng = seededRng(seed);
  const easy = shuffle(QUESTIONS.easy, rng).slice(0, 5);
  const medium = shuffle(QUESTIONS.medium, rng).slice(0, 5);
  const hard = shuffle(QUESTIONS.hard, rng).slice(0, 5);
  // Shuffle answer order for each question
  return [...easy, ...medium, ...hard].map(q => {
    const indices = [0, 1, 2, 3];
    const shuffled = shuffle(indices, rng);
    return {
      ...q,
      answers: shuffled.map(i => q.answers[i]),
      correct: shuffled.indexOf(q.correct),
    };
  });
}

// --- Lifeline types ---
type Lifeline = 'fifty-fifty' | 'phone-friend' | 'ask-audience';

// --- Main Component ---
export default function CardMillionaireClient() {
  const [mode, setMode] = useState<'menu' | 'playing' | 'result'>('menu');
  const [gameMode, setGameMode] = useState<'daily' | 'random'>('daily');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [eliminated, setEliminated] = useState<number[]>([]);
  const [usedLifelines, setUsedLifelines] = useState<Lifeline[]>([]);
  const [walkAway, setWalkAway] = useState(false);
  const [audienceData, setAudienceData] = useState<number[] | null>(null);
  const [friendHint, setFriendHint] = useState<string | null>(null);

  // Stats
  const [stats, setStats] = useState({ played: 0, won: 0, bestPrize: '$0', totalWinnings: 0 });

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cv-millionaire-stats');
      if (saved) setStats(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  const saveStats = useCallback((s: typeof stats) => {
    setStats(s);
    try { localStorage.setItem('cv-millionaire-stats', JSON.stringify(s)); } catch { /* ignore */ }
  }, []);

  // Start game
  const startGame = useCallback((m: 'daily' | 'random') => {
    const seed = m === 'daily' ? dateHash() : Math.floor(Math.random() * 1000000);
    setGameMode(m);
    setQuestions(generateQuestions(seed));
    setCurrent(0);
    setSelected(null);
    setConfirmed(false);
    setEliminated([]);
    setUsedLifelines([]);
    setWalkAway(false);
    setAudienceData(null);
    setFriendHint(null);
    setMode('playing');
  }, []);

  // Answer
  const handleAnswer = useCallback(() => {
    if (selected === null || confirmed) return;
    setConfirmed(true);

    const isCorrect = selected === questions[current].correct;

    setTimeout(() => {
      if (isCorrect) {
        if (current === 14) {
          // Won the million!
          const newStats = {
            played: stats.played + 1,
            won: stats.won + 1,
            bestPrize: '$1,000,000',
            totalWinnings: stats.totalWinnings + 1000000,
          };
          saveStats(newStats);
          setMode('result');
        } else {
          setCurrent(c => c + 1);
          setSelected(null);
          setConfirmed(false);
          setEliminated([]);
          setAudienceData(null);
          setFriendHint(null);
        }
      } else {
        // Wrong — fall to safety net
        const safetyIdx = SAFETY_NETS.filter(s => s <= current).pop();
        const prize = safetyIdx !== undefined ? PRIZES[safetyIdx] : '$0';
        const amount = parseInt(prize.replace(/[$,]/g, ''), 10);
        const best = Math.max(stats.totalWinnings > 0 ? parseInt(stats.bestPrize.replace(/[$,]/g, ''), 10) : 0, amount);
        const newStats = {
          played: stats.played + 1,
          won: stats.won,
          bestPrize: `$${best.toLocaleString()}`,
          totalWinnings: stats.totalWinnings + amount,
        };
        saveStats(newStats);
        setMode('result');
      }
    }, 1500);
  }, [selected, confirmed, questions, current, stats, saveStats]);

  // Walk away
  const handleWalkAway = useCallback(() => {
    if (current === 0) return;
    setWalkAway(true);
    const prize = PRIZES[current - 1];
    const amount = parseInt(prize.replace(/[$,]/g, ''), 10);
    const best = Math.max(parseInt(stats.bestPrize.replace(/[$,]/g, ''), 10) || 0, amount);
    const newStats = {
      played: stats.played + 1,
      won: stats.won,
      bestPrize: `$${best.toLocaleString()}`,
      totalWinnings: stats.totalWinnings + amount,
    };
    saveStats(newStats);
    setMode('result');
  }, [current, stats, saveStats]);

  // Lifelines
  const useFiftyFifty = useCallback(() => {
    if (usedLifelines.includes('fifty-fifty') || confirmed) return;
    const q = questions[current];
    const wrong = [0, 1, 2, 3].filter(i => i !== q.correct);
    const toRemove = wrong.sort(() => Math.random() - 0.5).slice(0, 2);
    setEliminated(toRemove);
    setUsedLifelines(l => [...l, 'fifty-fifty']);
  }, [usedLifelines, confirmed, questions, current]);

  const usePhoneFriend = useCallback(() => {
    if (usedLifelines.includes('phone-friend') || confirmed) return;
    const q = questions[current];
    const confidence = current < 5 ? 90 : current < 10 ? 70 : 50;
    const isRight = Math.random() * 100 < confidence;
    const answer = isRight ? q.answers[q.correct] : q.answers[(q.correct + 1) % 4];
    setFriendHint(`"I'm ${confidence}% sure it's ${answer}."`);
    setUsedLifelines(l => [...l, 'phone-friend']);
  }, [usedLifelines, confirmed, questions, current]);

  const useAskAudience = useCallback(() => {
    if (usedLifelines.includes('ask-audience') || confirmed) return;
    const q = questions[current];
    const correctPct = current < 5 ? 60 + Math.random() * 25 : current < 10 ? 40 + Math.random() * 25 : 25 + Math.random() * 20;
    const remaining = 100 - correctPct;
    const others = [0, 1, 2, 3].map(i => i === q.correct ? correctPct : remaining / 3 + (Math.random() - 0.5) * 10);
    const total = others.reduce((a, b) => a + b, 0);
    setAudienceData(others.map(v => Math.round((v / total) * 100)));
    setUsedLifelines(l => [...l, 'ask-audience']);
  }, [usedLifelines, confirmed, questions, current]);

  // Result info
  const resultPrize = useMemo(() => {
    if (mode !== 'result') return '$0';
    if (walkAway) return current > 0 ? PRIZES[current - 1] : '$0';
    if (current === 14 && confirmed && selected === questions[current]?.correct) return '$1,000,000';
    const safetyIdx = SAFETY_NETS.filter(s => s <= current).pop();
    return safetyIdx !== undefined ? PRIZES[safetyIdx] : '$0';
  }, [mode, walkAway, current, confirmed, selected, questions]);

  // --- Render ---
  if (mode === 'menu') {
    return (
      <div>
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <div className="bg-zinc-900/60 border border-zinc-700/40 rounded-lg p-3 text-center">
            <div className="text-[10px] text-zinc-500 uppercase">Games</div>
            <div className="text-lg font-bold text-zinc-100">{stats.played}</div>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-700/40 rounded-lg p-3 text-center">
            <div className="text-[10px] text-zinc-500 uppercase">Millionaires</div>
            <div className="text-lg font-bold text-green-400">{stats.won}</div>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-700/40 rounded-lg p-3 text-center">
            <div className="text-[10px] text-zinc-500 uppercase">Best Prize</div>
            <div className="text-lg font-bold text-amber-400">{stats.bestPrize}</div>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-700/40 rounded-lg p-3 text-center">
            <div className="text-[10px] text-zinc-500 uppercase">Total Winnings</div>
            <div className="text-lg font-bold text-green-400">${stats.totalWinnings.toLocaleString()}</div>
          </div>
        </div>

        {/* Mode Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => startGame('daily')}
            className="bg-gradient-to-br from-amber-900/60 to-amber-950/40 border border-amber-700/50 rounded-xl p-6 text-left hover:border-amber-500/60 transition-all cursor-pointer"
          >
            <div className="text-amber-400 text-xs font-bold tracking-wider mb-2">DAILY CHALLENGE</div>
            <div className="text-lg font-semibold text-zinc-100 mb-1">Today&apos;s Questions</div>
            <div className="text-sm text-zinc-400">Same 15 questions for everyone. One attempt per day.</div>
          </button>
          <button
            onClick={() => startGame('random')}
            className="bg-gradient-to-br from-purple-900/60 to-purple-950/40 border border-purple-700/50 rounded-xl p-6 text-left hover:border-purple-500/60 transition-all cursor-pointer"
          >
            <div className="text-purple-400 text-xs font-bold tracking-wider mb-2">RANDOM GAME</div>
            <div className="text-lg font-semibold text-zinc-100 mb-1">Unlimited Practice</div>
            <div className="text-sm text-zinc-400">Random questions every game. Play as many times as you want.</div>
          </button>
        </div>

        {/* How It Works */}
        <div className="bg-zinc-900/50 border border-zinc-700/40 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-zinc-100 mb-4">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-zinc-300">
            <div>
              <div className="font-medium text-zinc-100 mb-1">15 Questions</div>
              <div className="text-xs text-zinc-400">Answer correctly to climb from $100 to $1,000,000. Questions get harder as you go — basics, then deep hobby knowledge.</div>
            </div>
            <div>
              <div className="font-medium text-zinc-100 mb-1">Safety Nets</div>
              <div className="text-xs text-zinc-400">Reach Q5 ($1,000) or Q10 ($32,000) and that amount is guaranteed even if you answer wrong later.</div>
            </div>
            <div>
              <div className="font-medium text-zinc-100 mb-1">3 Lifelines</div>
              <div className="text-xs text-zinc-400">50:50 (remove 2 wrong answers), Phone a Friend (expert hint), Ask the Audience (see vote distribution).</div>
            </div>
            <div>
              <div className="font-medium text-zinc-100 mb-1">Walk Away</div>
              <div className="text-xs text-zinc-400">Take your current winnings and leave at any time. Better to walk away rich than leave with nothing.</div>
            </div>
          </div>
        </div>

        {/* Related Links */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/trivia', label: 'Daily Trivia', desc: '5 questions daily' },
            { href: '/card-jeopardy', label: 'Card Jeopardy', desc: 'Category-based quiz' },
            { href: '/card-wordle', label: 'Card Wordle', desc: 'Guess the player' },
            { href: '/card-detective', label: 'Card Detective', desc: 'Clue-based guessing' },
            { href: '/games', label: 'All Games', desc: '50+ card games' },
            { href: '/tools', label: 'All Tools', desc: '100+ collector tools' },
          ].map(link => (
            <Link key={link.href} href={link.href} className="bg-zinc-900/50 border border-zinc-700/40 rounded-lg p-3 hover:border-zinc-500/60 transition-all">
              <div className="text-sm font-medium text-zinc-200">{link.label}</div>
              <div className="text-[10px] text-zinc-500">{link.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  if (mode === 'result') {
    const won = current === 14 && !walkAway && confirmed && selected === questions[current]?.correct;
    return (
      <div className="text-center">
        <div className={`text-5xl mb-4 ${won ? 'text-amber-400' : walkAway ? 'text-green-400' : 'text-red-400'}`}>
          {won ? 'MILLIONAIRE!' : walkAway ? 'Smart Walk Away' : 'Wrong Answer'}
        </div>
        <div className="text-3xl font-bold text-zinc-100 mb-2">You won {resultPrize}</div>
        {!walkAway && !won && questions[current] && (
          <div className="text-sm text-zinc-400 mb-4">
            Correct answer: <span className="text-green-400">{questions[current].answers[questions[current].correct]}</span>
          </div>
        )}
        <div className="text-sm text-zinc-400 mb-8">
          Answered {walkAway ? current : (confirmed && selected === questions[current]?.correct ? current + 1 : current)} of 15 questions correctly
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <button onClick={() => setMode('menu')} className="px-6 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-100 rounded-lg text-sm font-medium cursor-pointer">
            Back to Menu
          </button>
          <button onClick={() => startGame(gameMode)} className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-medium cursor-pointer">
            Play Again
          </button>
        </div>

        {/* Prize Ladder Review */}
        <div className="max-w-sm mx-auto bg-zinc-900/50 border border-zinc-700/40 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-zinc-300 mb-3">Prize Ladder</h3>
          <div className="space-y-1">
            {[...PRIZES].reverse().map((prize, ri) => {
              const qi = 14 - ri;
              const reached = walkAway ? qi < current : qi <= current;
              const isSafety = SAFETY_NETS.includes(qi);
              return (
                <div key={qi} className={`flex justify-between px-3 py-1 rounded text-xs ${
                  qi === current && !walkAway ? 'bg-amber-900/50 text-amber-300 font-bold' :
                  reached ? 'text-green-400' : 'text-zinc-600'
                }`}>
                  <span>Q{qi + 1}{isSafety ? ' *' : ''}</span>
                  <span>{prize}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Playing
  const q = questions[current];
  if (!q) return null;

  return (
    <div>
      {/* Prize Ladder (sidebar on desktop, top bar on mobile) */}
      <div className="flex flex-wrap gap-1 justify-center mb-6">
        {PRIZES.map((prize, i) => (
          <div key={i} className={`px-2 py-0.5 rounded text-[10px] font-medium ${
            i === current ? 'bg-amber-600 text-white' :
            i < current ? 'bg-green-900/40 text-green-400' :
            SAFETY_NETS.includes(i) ? 'bg-zinc-800 text-amber-400' :
            'bg-zinc-800/50 text-zinc-600'
          }`}>
            {prize}
          </div>
        ))}
      </div>

      {/* Question Info */}
      <div className="text-center mb-6">
        <div className="text-xs text-zinc-500 mb-1">Question {current + 1} of 15 &middot; {q.category}</div>
        <div className="text-amber-400 font-bold text-lg">For {PRIZES[current]}</div>
      </div>

      {/* Question */}
      <div className="bg-zinc-900/60 border border-zinc-700/40 rounded-xl p-6 mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-zinc-100 text-center">{q.question}</h2>
      </div>

      {/* Answers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {q.answers.map((answer, i) => {
          const isEliminated = eliminated.includes(i);
          const isSelected = selected === i;
          const isCorrect = i === q.correct;
          const showResult = confirmed;

          let bg = 'bg-zinc-800/80 border-zinc-600/50 hover:border-amber-500/60';
          if (isEliminated) bg = 'bg-zinc-900/30 border-zinc-800/30 opacity-30 cursor-default';
          else if (showResult && isCorrect) bg = 'bg-green-900/60 border-green-500/60';
          else if (showResult && isSelected && !isCorrect) bg = 'bg-red-900/60 border-red-500/60';
          else if (isSelected) bg = 'bg-amber-900/60 border-amber-500/60';

          return (
            <button
              key={i}
              onClick={() => !confirmed && !isEliminated && setSelected(i)}
              disabled={confirmed || isEliminated}
              className={`border rounded-lg px-4 py-3 text-left transition-all ${bg} ${
                !confirmed && !isEliminated ? 'cursor-pointer' : ''
              }`}
            >
              <span className="text-xs text-zinc-500 mr-2">{String.fromCharCode(65 + i)}:</span>
              <span className="text-sm text-zinc-100">{answer}</span>
            </button>
          );
        })}
      </div>

      {/* Audience Data */}
      {audienceData && (
        <div className="bg-zinc-900/50 border border-zinc-700/40 rounded-lg p-4 mb-4">
          <div className="text-xs text-zinc-500 mb-2">Audience Results</div>
          <div className="flex gap-2 items-end h-20">
            {audienceData.map((pct, i) => (
              <div key={i} className="flex-1 text-center">
                <div className="text-[10px] text-zinc-400 mb-1">{pct}%</div>
                <div className="bg-zinc-700 rounded-t" style={{ height: `${pct * 0.6}px` }}>
                  <div className="w-full h-full bg-amber-600/60 rounded-t" />
                </div>
                <div className="text-[10px] text-zinc-500 mt-1">{String.fromCharCode(65 + i)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friend Hint */}
      {friendHint && (
        <div className="bg-blue-900/30 border border-blue-700/40 rounded-lg p-3 mb-4 text-sm text-blue-300">
          Phone a Friend: {friendHint}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-center mb-6">
        {/* Lifelines */}
        <button
          onClick={useFiftyFifty}
          disabled={usedLifelines.includes('fifty-fifty') || confirmed}
          className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
            usedLifelines.includes('fifty-fifty')
              ? 'bg-zinc-900/30 border-zinc-800/30 text-zinc-600 cursor-default'
              : 'bg-zinc-800 border-zinc-600 text-zinc-200 hover:border-amber-500/60 cursor-pointer'
          }`}
        >
          50:50
        </button>
        <button
          onClick={usePhoneFriend}
          disabled={usedLifelines.includes('phone-friend') || confirmed}
          className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
            usedLifelines.includes('phone-friend')
              ? 'bg-zinc-900/30 border-zinc-800/30 text-zinc-600 cursor-default'
              : 'bg-zinc-800 border-zinc-600 text-zinc-200 hover:border-blue-500/60 cursor-pointer'
          }`}
        >
          Phone Friend
        </button>
        <button
          onClick={useAskAudience}
          disabled={usedLifelines.includes('ask-audience') || confirmed}
          className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
            usedLifelines.includes('ask-audience')
              ? 'bg-zinc-900/30 border-zinc-800/30 text-zinc-600 cursor-default'
              : 'bg-zinc-800 border-zinc-600 text-zinc-200 hover:border-purple-500/60 cursor-pointer'
          }`}
        >
          Ask Audience
        </button>

        {/* Walk Away */}
        {current > 0 && !confirmed && (
          <button
            onClick={handleWalkAway}
            className="px-3 py-2 rounded-lg text-xs font-medium border bg-zinc-800 border-zinc-600 text-zinc-200 hover:border-red-500/60 cursor-pointer transition-all"
          >
            Walk Away ({PRIZES[current - 1]})
          </button>
        )}
      </div>

      {/* Confirm / Final Answer */}
      {selected !== null && !confirmed && (
        <div className="text-center">
          <button
            onClick={handleAnswer}
            className="px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-bold cursor-pointer transition-all"
          >
            Final Answer
          </button>
        </div>
      )}
    </div>
  );
}
