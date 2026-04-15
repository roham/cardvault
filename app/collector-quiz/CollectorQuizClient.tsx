'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Question {
  id: number;
  text: string;
  answers: { text: string; scores: Record<string, number> }[];
}

interface Archetype {
  id: string;
  name: string;
  title: string;
  emoji: string;
  color: string;
  borderColor: string;
  bgColor: string;
  description: string;
  strengths: string[];
  blindSpots: string[];
  tools: { name: string; href: string }[];
  funFact: string;
}

const ARCHETYPES: Record<string, Archetype> = {
  flipper: {
    id: 'flipper',
    name: 'Marcus',
    title: 'The Flipper',
    emoji: '$',
    color: 'text-emerald-400',
    borderColor: 'border-emerald-700',
    bgColor: 'bg-emerald-950/40',
    description: 'You see every card as an opportunity. Buy low, sell high — it is not just a strategy, it is a lifestyle. You track margins, monitor market trends, and your eBay seller rating is impeccable. For you, the hobby pays for itself.',
    strengths: ['Market timing', 'Negotiation skills', 'Understanding supply/demand', 'Quick decision-making'],
    blindSpots: ['May miss the joy of collecting', 'Transaction fatigue', 'Tax implications of frequent sales'],
    tools: [
      { name: 'Flip Tracker P&L', href: '/tools/flip-tracker' },
      { name: 'ROI Heatmap', href: '/tools/roi-heatmap' },
      { name: 'Market Dashboard', href: '/tools/market-dashboard' },
      { name: 'Bulk Sale Calculator', href: '/vault/bulk-sale' },
    ],
    funFact: '23% of active collectors identify as flippers — and they account for 47% of all eBay sports card transactions.',
  },
  dad: {
    id: 'dad',
    name: 'Dave',
    title: 'The Returning Collector',
    emoji: '!',
    color: 'text-blue-400',
    borderColor: 'border-blue-700',
    bgColor: 'bg-blue-950/40',
    description: 'You just found your old card collection in the attic and now you are back. The hobby has changed a lot since 1992 — grading, parallels, Prizm, Bowman Chrome — but the thrill of holding a great card never left. You are reconnecting with something you loved as a kid.',
    strengths: ['Nostalgia-driven passion', 'Patient approach', 'Teaching the next generation', 'Appreciation for history'],
    blindSpots: ['Overwhelmed by modern complexity', 'May overpay for nostalgia buys', 'Not up to date on grading standards'],
    tools: [
      { name: 'What Is My Card Worth?', href: '/tools/collection-value' },
      { name: 'Card Identifier', href: '/tools/identify' },
      { name: 'Grading ROI Calculator', href: '/tools/grading-roi' },
      { name: 'What Should I Collect?', href: '/tools/quiz' },
    ],
    funFact: '42% of card collectors are "re-entry" collectors who left the hobby as teenagers and returned as adults. The average gap is 18 years.',
  },
  investor: {
    id: 'investor',
    name: 'Kai',
    title: 'The Investor',
    emoji: '#',
    color: 'text-purple-400',
    borderColor: 'border-purple-700',
    bgColor: 'bg-purple-950/40',
    description: 'You treat your collection like a portfolio. Diversification across sports, eras, and value tiers. You track ROI, understand population reports, and think about cards the way Wall Street thinks about equities. Allocation matters.',
    strengths: ['Data-driven decisions', 'Long-term thinking', 'Risk management', 'Cross-category knowledge'],
    blindSpots: ['Over-analysis paralysis', 'May ignore emotional value', 'Market timing is harder than it looks'],
    tools: [
      { name: 'Portfolio Rebalancer', href: '/tools/portfolio-rebalancer' },
      { name: 'Investment Calculator', href: '/tools/investment-calc' },
      { name: 'Diversification Analyzer', href: '/tools/diversification' },
      { name: 'Sealed Product EV', href: '/tools/sealed-ev' },
    ],
    funFact: 'The sports card market has outperformed the S&P 500 over the last 5 years for PSA 10 copies of top-100 all-time players.',
  },
  completionist: {
    id: 'completionist',
    name: 'Mia',
    title: 'The Completionist',
    emoji: '%',
    color: 'text-pink-400',
    borderColor: 'border-pink-700',
    bgColor: 'bg-pink-950/40',
    description: 'There is no greater satisfaction than checking off every card on a checklist. You build sets, chase short prints, and the last card is always the hardest. Your binder pages are organized by number, and a gap in the sequence haunts you.',
    strengths: ['Incredible patience', 'Deep set knowledge', 'Organized systems', 'Long-term commitment'],
    blindSpots: ['Can overpay for the final card', 'Completionism can become compulsive', 'May hoard low-value cards'],
    tools: [
      { name: 'Set Completion Tracker', href: '/tools/set-completion' },
      { name: 'Visual Binder', href: '/tools/visual-binder' },
      { name: 'Set Cost Estimator', href: '/tools/set-cost' },
      { name: 'Vault Wishlist', href: '/vault/wishlist' },
    ],
    funFact: 'The average 2024 Topps Series 1 set takes 14 hobby boxes to complete naturally. The last 10 cards take longer than the first 300.',
  },
  dealer: {
    id: 'dealer',
    name: 'Tony',
    title: 'The Dealer',
    emoji: '@',
    color: 'text-amber-400',
    borderColor: 'border-amber-700',
    bgColor: 'bg-amber-950/40',
    description: 'You know the market better than anyone because you live in it. Card shows, eBay, Whatnot — you are buying and selling daily. Your phone is your most important tool, and you can grade a card by feel. The hobby is your business.',
    strengths: ['Encyclopedic market knowledge', 'Speed and efficiency', 'Relationship-driven', 'Inventory management'],
    blindSpots: ['Burnout from constant hustle', 'May lose passion for collecting itself', 'Overhead and logistics stress'],
    tools: [
      { name: 'Dealer Scanner', href: '/tools/dealer-scanner' },
      { name: 'Listing Generator', href: '/tools/listing-generator' },
      { name: 'Show Planner', href: '/tools/show-planner' },
      { name: 'Bulk Lookup', href: '/tools/bulk-lookup' },
    ],
    funFact: 'The average card show dealer brings 3,000-5,000 cards to a show and sells 8-15% of inventory per event.',
  },
  opener: {
    id: 'opener',
    name: 'Jess',
    title: 'The Opener',
    emoji: '*',
    color: 'text-rose-400',
    borderColor: 'border-rose-700',
    bgColor: 'bg-rose-950/40',
    description: 'Rip it. Film it. Share it. The rush of cracking a fresh pack is unmatched, and your camera is always ready for the hit. You know the pack odds, the best products to open, and your followers love watching you pull bangers. Content and collecting are the same thing.',
    strengths: ['Community building', 'Product knowledge', 'Content creation', 'Excitement and energy'],
    blindSpots: ['Can spend more than planned chasing hits', 'Content pressure may drive bad buys', 'Pack odds are not in your favor'],
    tools: [
      { name: 'Pack Simulator', href: '/tools/pack-sim' },
      { name: 'Rip or Hold Calculator', href: '/tools/rip-or-hold' },
      { name: 'Pack Odds Calculator', href: '/tools/pack-odds' },
      { name: 'Box Break Calculator', href: '/tools/box-break' },
    ],
    funFact: 'The average hobby box costs $200 and returns $140 in card value. But 1 in 12 boxes contains a card worth more than the box itself.',
  },
};

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: 'You find a $50 card at a flea market for $10. What do you do?',
    answers: [
      { text: 'Buy it and list it on eBay before leaving the parking lot', scores: { flipper: 3, dealer: 2 } },
      { text: 'Buy it and add it to my collection — great find', scores: { dad: 2, completionist: 2 } },
      { text: 'Buy it, analyze the ROI, and decide if it fits my portfolio', scores: { investor: 3 } },
      { text: 'Buy it and make a TikTok about the find', scores: { opener: 3 } },
    ],
  },
  {
    id: 2,
    text: 'What is your ideal Saturday morning?',
    answers: [
      { text: 'Hitting the card show at 8am to get first pick', scores: { dealer: 3, flipper: 1 } },
      { text: 'Organizing my binder and updating my checklist', scores: { completionist: 3 } },
      { text: 'Opening packs with my kids or friends', scores: { dad: 2, opener: 2 } },
      { text: 'Reviewing my portfolio and checking price movements', scores: { investor: 3 } },
    ],
  },
  {
    id: 3,
    text: 'You just pulled a massive hit worth $500. First reaction?',
    answers: [
      { text: 'Check comps and calculate the best time to sell', scores: { flipper: 3, investor: 1 } },
      { text: 'Immediately sleeve it and grab my camera', scores: { opener: 3 } },
      { text: 'Check if I need it for my set or player collection', scores: { completionist: 3 } },
      { text: 'Text my buddy — this is going in the case', scores: { dad: 3 } },
    ],
  },
  {
    id: 4,
    text: 'What matters most when choosing what to collect?',
    answers: [
      { text: 'Resale potential and market demand', scores: { flipper: 2, dealer: 2 } },
      { text: 'Long-term appreciation and scarcity', scores: { investor: 3 } },
      { text: 'Completing the set or having every card of my player', scores: { completionist: 3 } },
      { text: 'Whether it makes me feel something when I hold it', scores: { dad: 2, opener: 1 } },
    ],
  },
  {
    id: 5,
    text: 'Your friend asks for card advice. You recommend...',
    answers: [
      { text: 'Start with a budget and learn to flip common cards', scores: { flipper: 2, dealer: 2 } },
      { text: 'Buy what you love — the value will follow', scores: { dad: 3 } },
      { text: 'Diversify across sports and eras, think long-term', scores: { investor: 3 } },
      { text: 'Open a hobby box on camera and see what happens', scores: { opener: 3 } },
    ],
  },
  {
    id: 6,
    text: 'How do you store your most valuable cards?',
    answers: [
      { text: 'Ready to ship — penny sleeve, toploader, team bag', scores: { flipper: 2, dealer: 2 } },
      { text: 'In a fireproof safe or safety deposit box', scores: { investor: 3 } },
      { text: 'In a binder, organized by set and card number', scores: { completionist: 3 } },
      { text: 'In a display case where I can see them every day', scores: { dad: 2, opener: 1 } },
    ],
  },
  {
    id: 7,
    text: 'What is your biggest card collecting fear?',
    answers: [
      { text: 'Buying at the top and watching value crash', scores: { flipper: 2, investor: 2 } },
      { text: 'Missing the last card I need for a complete set', scores: { completionist: 3 } },
      { text: 'Getting scammed on a fake or trimmed card', scores: { dealer: 2, dad: 1 } },
      { text: 'Opening 10 boxes and hitting nothing', scores: { opener: 3 } },
    ],
  },
  {
    id: 8,
    text: 'How often do you check card prices?',
    answers: [
      { text: 'Multiple times a day — I have alerts set up', scores: { flipper: 3, dealer: 1 } },
      { text: 'Weekly — I track my portfolio performance', scores: { investor: 3 } },
      { text: 'Only when I am buying or selling something specific', scores: { dad: 2, completionist: 1 } },
      { text: 'When something big happens — a trade, injury, or breakout', scores: { opener: 2, dealer: 1 } },
    ],
  },
  {
    id: 9,
    text: 'What is your dream card?',
    answers: [
      { text: 'A card I can buy for $1K and sell for $5K next year', scores: { flipper: 3 } },
      { text: 'A PSA 10 of my childhood hero', scores: { dad: 3 } },
      { text: 'A rare vintage card with a proven appreciation track record', scores: { investor: 3 } },
      { text: 'A 1/1 pulled live on stream', scores: { opener: 3, completionist: 0 } },
    ],
  },
  {
    id: 10,
    text: 'If the card market crashed 50% tomorrow, you would...',
    answers: [
      { text: 'Buy aggressively — this is where fortunes are made', scores: { flipper: 2, investor: 2 } },
      { text: 'Hold everything — my collection means more than money', scores: { dad: 2, completionist: 2 } },
      { text: 'Liquidate the losers and double down on blue chips', scores: { dealer: 2, investor: 1 } },
      { text: 'Keep opening packs — the thrill is the same regardless', scores: { opener: 3 } },
    ],
  },
];

export default function CollectorQuizClient() {
  const [currentQ, setCurrentQ] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const handleAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    const answer = QUESTIONS[currentQ].answers[answerIndex];

    setTimeout(() => {
      const newScores = { ...scores };
      for (const [archetype, points] of Object.entries(answer.scores)) {
        newScores[archetype] = (newScores[archetype] || 0) + points;
      }
      setScores(newScores);

      if (currentQ < QUESTIONS.length - 1) {
        setCurrentQ(currentQ + 1);
        setSelectedAnswer(null);
      } else {
        setShowResult(true);
      }
    }, 400);
  };

  const getResult = (): Archetype => {
    let maxScore = 0;
    let resultId = 'dad';
    for (const [id, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        resultId = id;
      }
    }
    return ARCHETYPES[resultId];
  };

  const getSecondary = (): Archetype | null => {
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    if (sorted.length < 2) return null;
    return ARCHETYPES[sorted[1][0]] || null;
  };

  const getAllScores = () => {
    return Object.entries(ARCHETYPES).map(([id, arch]) => ({
      ...arch,
      score: scores[id] || 0,
    })).sort((a, b) => b.score - a.score);
  };

  const resetQuiz = () => {
    setCurrentQ(0);
    setScores({});
    setShowResult(false);
    setSelectedAnswer(null);
  };

  const shareText = () => {
    const result = getResult();
    const text = `I am "${result.title}" on CardVault! ${result.description.split('.')[0]}. Take the Collector Personality Quiz: https://cardvault-two.vercel.app/collector-quiz`;
    if (navigator.share) {
      navigator.share({ text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).catch(() => {});
    }
  };

  // Quiz in progress
  if (!showResult) {
    const question = QUESTIONS[currentQ];
    const progress = ((currentQ) / QUESTIONS.length) * 100;

    return (
      <div className="space-y-6">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Question {currentQ + 1} of {QUESTIONS.length}</span>
            <span className="text-gray-500">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Question */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">{question.text}</h2>
          <div className="space-y-3">
            {question.answers.map((answer, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={selectedAnswer !== null}
                className={`w-full text-left px-5 py-4 rounded-xl border transition-all duration-300 ${
                  selectedAnswer === i
                    ? 'bg-emerald-950/60 border-emerald-600 text-emerald-300'
                    : selectedAnswer !== null
                    ? 'bg-gray-800/50 border-gray-700/50 text-gray-500'
                    : 'bg-gray-800 border-gray-700 text-gray-200 hover:border-emerald-600 hover:bg-gray-800/80'
                }`}
              >
                <span className="text-sm">{answer.text}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Results
  const result = getResult();
  const secondary = getSecondary();
  const allScores = getAllScores();
  const maxPossible = Math.max(...allScores.map(s => s.score), 1);

  return (
    <div className="space-y-6">
      {/* Main result */}
      <div className={`${result.bgColor} border ${result.borderColor} rounded-xl p-8 text-center`}>
        <div className="text-5xl mb-3">{result.emoji}</div>
        <div className="text-gray-400 text-sm mb-1">You are...</div>
        <h2 className={`text-3xl font-bold ${result.color} mb-2`}>{result.title}</h2>
        <p className="text-gray-400 text-sm mb-1">Like <strong className="text-white">{result.name}</strong> from the CardVault personas</p>
        <p className="text-gray-300 text-sm mt-4 max-w-xl mx-auto">{result.description}</p>
      </div>

      {/* Secondary archetype */}
      {secondary && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="text-gray-400 text-sm mb-1">With a streak of...</div>
          <div className={`text-lg font-bold ${secondary.color}`}>{secondary.title}</div>
          <p className="text-gray-500 text-sm mt-1">{secondary.description.split('.')[0]}.</p>
        </div>
      )}

      {/* Score breakdown */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Your Archetype Breakdown</h3>
        <div className="space-y-3">
          {allScores.map(arch => (
            <div key={arch.id}>
              <div className="flex justify-between text-sm mb-1">
                <span className={arch.color}>{arch.title}</span>
                <span className="text-gray-500">{arch.score} pts</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all duration-700 ${
                    arch.id === result.id ? 'bg-emerald-500' : 'bg-gray-600'
                  }`}
                  style={{ width: `${Math.max(3, (arch.score / maxPossible) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths & Blind Spots */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-white font-bold mb-3">Your Strengths</h3>
          <ul className="space-y-2">
            {result.strengths.map(s => (
              <li key={s} className="text-emerald-400/80 text-sm flex items-start gap-2">
                <span className="mt-0.5">+</span> {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-white font-bold mb-3">Watch Out For</h3>
          <ul className="space-y-2">
            {result.blindSpots.map(b => (
              <li key={b} className="text-amber-400/80 text-sm flex items-start gap-2">
                <span className="mt-0.5">!</span> {b}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recommended tools */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Tools Made for You</h3>
        <div className="grid grid-cols-2 gap-3">
          {result.tools.map(tool => (
            <Link
              key={tool.href}
              href={tool.href}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 hover:border-emerald-600 transition-colors group"
            >
              <span className="text-white text-sm font-medium group-hover:text-emerald-400 transition-colors">{tool.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Fun fact */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
        <div className="text-gray-500 text-xs uppercase tracking-wider mb-1">Did you know?</div>
        <p className="text-gray-300 text-sm">{result.funFact}</p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={shareText}
          className="flex-1 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-500 transition-colors"
        >
          Share Your Result
        </button>
        <button
          onClick={resetQuiz}
          className="flex-1 py-3 bg-gray-800 border border-gray-700 text-gray-300 font-semibold rounded-xl hover:border-gray-600 transition-colors"
        >
          Take Quiz Again
        </button>
      </div>
    </div>
  );
}
