'use client';

import { useState } from 'react';
import Link from 'next/link';

interface QuizQuestion {
  id: string;
  question: string;
  options: {
    label: string;
    description: string;
    scores: Record<string, number>;
  }[];
}

interface CollectorProfile {
  id: string;
  title: string;
  emoji: string;
  tagline: string;
  description: string;
  whatToCollect: string[];
  startingProducts: { name: string; price: string; link: string }[];
  toolsToUse: { name: string; link: string }[];
  tips: string[];
  color: string;
  borderColor: string;
}

const questions: QuizQuestion[] = [
  {
    id: 'budget',
    question: 'What\'s your monthly card budget?',
    options: [
      { label: 'Under $50', description: 'Just getting started or keeping it casual', scores: { casual: 3, setBuilder: 2, flipper: 0, investor: 0, pokeFan: 2 } },
      { label: '$50 - $200', description: 'Enough for a hobby box or a few singles', scores: { casual: 1, setBuilder: 3, flipper: 2, investor: 1, pokeFan: 3 } },
      { label: '$200 - $500', description: 'Serious about the hobby', scores: { casual: 0, setBuilder: 2, flipper: 3, investor: 2, pokeFan: 2 } },
      { label: '$500+', description: 'All in — this is more than a hobby', scores: { casual: 0, setBuilder: 1, flipper: 2, investor: 3, pokeFan: 1 } },
    ],
  },
  {
    id: 'motivation',
    question: 'What excites you most about cards?',
    options: [
      { label: 'The thrill of opening packs', description: 'Ripping packs and hoping for a big hit', scores: { casual: 3, setBuilder: 1, flipper: 1, investor: 0, pokeFan: 3 } },
      { label: 'Completing a set or collection', description: 'Checking cards off a list — satisfying', scores: { casual: 1, setBuilder: 3, flipper: 0, investor: 0, pokeFan: 2 } },
      { label: 'Making money flipping', description: 'Buy low, sell high — cards are inventory', scores: { casual: 0, setBuilder: 0, flipper: 3, investor: 2, pokeFan: 0 } },
      { label: 'Long-term investment potential', description: 'Holding cards that appreciate over years', scores: { casual: 0, setBuilder: 1, flipper: 1, investor: 3, pokeFan: 0 } },
      { label: 'The art and nostalgia', description: 'Beautiful cards of players and characters I love', scores: { casual: 2, setBuilder: 2, flipper: 0, investor: 0, pokeFan: 3 } },
    ],
  },
  {
    id: 'sports',
    question: 'What sports or categories interest you?',
    options: [
      { label: 'Baseball', description: 'America\'s pastime — Topps, Bowman, Chrome', scores: { casual: 2, setBuilder: 3, flipper: 2, investor: 2, pokeFan: 0 } },
      { label: 'Basketball', description: 'Prizm, Select, Donruss — the Wemby era', scores: { casual: 2, setBuilder: 2, flipper: 3, investor: 3, pokeFan: 0 } },
      { label: 'Football', description: 'Rookies drive the market — draft night is everything', scores: { casual: 2, setBuilder: 2, flipper: 3, investor: 2, pokeFan: 0 } },
      { label: 'Hockey', description: 'Upper Deck Young Guns and a tight-knit community', scores: { casual: 2, setBuilder: 3, flipper: 1, investor: 1, pokeFan: 0 } },
      { label: 'Pokemon', description: 'TCG cards with stunning artwork and devoted fans', scores: { casual: 2, setBuilder: 2, flipper: 1, investor: 1, pokeFan: 3 } },
      { label: 'Multiple / All of the above', description: 'I like variety and want to explore', scores: { casual: 3, setBuilder: 1, flipper: 2, investor: 2, pokeFan: 1 } },
    ],
  },
  {
    id: 'experience',
    question: 'How would you describe your collecting experience?',
    options: [
      { label: 'Brand new — never bought a card', description: 'Starting from zero', scores: { casual: 3, setBuilder: 1, flipper: 0, investor: 0, pokeFan: 2 } },
      { label: 'I collected as a kid and I\'m getting back in', description: 'Returning after a break — things have changed', scores: { casual: 2, setBuilder: 2, flipper: 1, investor: 1, pokeFan: 1 } },
      { label: 'Casual collector — I buy when I see something I like', description: 'No system, just fun', scores: { casual: 3, setBuilder: 1, flipper: 0, investor: 0, pokeFan: 2 } },
      { label: 'Active collector with a strategy', description: 'I track what I have and what I want', scores: { casual: 0, setBuilder: 3, flipper: 2, investor: 2, pokeFan: 1 } },
      { label: 'Full-time dealer or serious investor', description: 'This is my business or a serious portfolio', scores: { casual: 0, setBuilder: 0, flipper: 3, investor: 3, pokeFan: 0 } },
    ],
  },
  {
    id: 'time',
    question: 'How much time do you want to spend on cards per week?',
    options: [
      { label: 'A few minutes — very casual', description: 'Quick browse, maybe buy one thing', scores: { casual: 3, setBuilder: 0, flipper: 0, investor: 2, pokeFan: 1 } },
      { label: '1-3 hours', description: 'Research, watch breaks, buy/sell a bit', scores: { casual: 1, setBuilder: 2, flipper: 1, investor: 2, pokeFan: 2 } },
      { label: '3-10 hours', description: 'Serious time — sourcing, listing, organizing', scores: { casual: 0, setBuilder: 3, flipper: 2, investor: 1, pokeFan: 2 } },
      { label: '10+ hours', description: 'This is a major part of my week', scores: { casual: 0, setBuilder: 1, flipper: 3, investor: 1, pokeFan: 1 } },
    ],
  },
  {
    id: 'preference',
    question: 'Singles or sealed product?',
    options: [
      { label: 'Singles — I want specific cards', description: 'Buy exactly what I want on eBay/TCGPlayer', scores: { casual: 0, setBuilder: 3, flipper: 2, investor: 3, pokeFan: 1 } },
      { label: 'Sealed — I love opening packs', description: 'The mystery and dopamine of the rip', scores: { casual: 3, setBuilder: 1, flipper: 1, investor: 0, pokeFan: 3 } },
      { label: 'Both equally', description: 'Buy singles to fill gaps, open packs for fun', scores: { casual: 1, setBuilder: 2, flipper: 2, investor: 1, pokeFan: 2 } },
    ],
  },
];

const profiles: CollectorProfile[] = [
  {
    id: 'casual',
    title: 'The Casual Collector',
    emoji: '🎯',
    tagline: 'You collect for fun — no spreadsheets needed.',
    description: 'You\'re in it for the experience. Opening packs at card shows, grabbing a blaster at Target, picking up a cool card of your favorite player. You don\'t need to optimize every dollar — the joy IS the hobby.',
    whatToCollect: [
      'Blaster boxes from Target/Walmart ($25-40) for the rip experience',
      'Single cards of your favorite players in the $5-50 range',
      'Base set rookies of current stars — affordable and fun to collect',
      'One hobby box per quarter as a treat',
    ],
    startingProducts: [
      { name: '2025 Topps Series 1 Blaster', price: '$30', link: '/tools/sealed-ev' },
      { name: 'Prizm Football Blaster', price: '$40', link: '/tools/sealed-ev' },
      { name: 'A base RC of your favorite player', price: '$5-20', link: '/sports' },
    ],
    toolsToUse: [
      { name: 'Price Check', link: '/tools' },
      { name: 'Sealed Product EV Calculator', link: '/tools/sealed-ev' },
    ],
    tips: [
      'Set a monthly budget and stick to it',
      'Don\'t chase — enjoy what you pull',
      'The experience of opening is worth the "negative EV" at this level',
    ],
    color: 'bg-emerald-950/20',
    borderColor: 'border-emerald-800/50',
  },
  {
    id: 'setBuilder',
    title: 'The Set Builder',
    emoji: '📋',
    tagline: 'You find satisfaction in completing things.',
    description: 'You love the hunt for that last card to finish a set. Organized, methodical, patient. You get more satisfaction from checking every card off a checklist than from pulling one big hit. The binder page with every card slotted is your masterpiece.',
    whatToCollect: [
      'Pick one flagship set per year to build: Topps Series 1, Prizm, or Upper Deck Series 1',
      'Buy a hobby box to start your set, then fill gaps with singles',
      'Focus on base sets first — parallels and inserts can come later',
      'Consider vintage sets (1980s-90s) where completion is achievable under $200',
    ],
    startingProducts: [
      { name: '2025 Topps Series 1 Hobby Box', price: '$160', link: '/tools/sealed-ev' },
      { name: 'Singles from eBay/TCGPlayer for gaps', price: 'varies', link: '/sports/sets' },
    ],
    toolsToUse: [
      { name: 'Browse by Set', link: '/sports/sets' },
      { name: 'Price Check', link: '/tools' },
      { name: 'Compare Cards', link: '/tools/compare' },
    ],
    tips: [
      'Track your set completion in a spreadsheet or app',
      'Buy your last 20% of needs as singles — don\'t open more product chasing them',
      'Consider joining set building communities for trades',
    ],
    color: 'bg-blue-950/20',
    borderColor: 'border-blue-800/50',
  },
  {
    id: 'flipper',
    title: 'The Flipper',
    emoji: '💸',
    tagline: 'Buy low, sell high — cards are inventory.',
    description: 'You treat cards as a side hustle or business. You\'re looking for arbitrage: retail finds at MSRP that sell for more online, undervalued singles before a player breaks out, or hot products at release. Speed and market knowledge are your edges.',
    whatToCollect: [
      'Retail blasters and megas at MSRP from Target/Walmart (resale within a week)',
      'Rookie singles of breakout players BEFORE they break out',
      'Pre-sell or quick-flip new release hobby boxes at drop',
      'Grading submissions of $100+ raw cards that grade PSA 10 for 3-5x return',
    ],
    startingProducts: [
      { name: 'Check Grading ROI first', price: '—', link: '/tools/grading-roi' },
      { name: 'Monitor new releases on calendar', price: '—', link: '/calendar' },
      { name: 'Use EV calc to identify +EV products', price: '—', link: '/tools/sealed-ev' },
    ],
    toolsToUse: [
      { name: 'Grading ROI Calculator', link: '/tools/grading-roi' },
      { name: 'Sealed Product EV Calculator', link: '/tools/sealed-ev' },
      { name: 'Compare Cards', link: '/tools/compare' },
    ],
    tips: [
      'Track EVERY transaction — cost, sell price, fees, shipping. Know your actual profit',
      'eBay takes 13% + shipping. Factor this into every buy decision',
      'The best time to sell a new product is the first 72 hours after release',
      'Follow @CardPurchaser and @SportsCardInvestor for deal alerts',
    ],
    color: 'bg-amber-950/20',
    borderColor: 'border-amber-800/50',
  },
  {
    id: 'investor',
    title: 'The Investor',
    emoji: '📈',
    tagline: 'Long-term holds, diversified portfolio.',
    description: 'You think in years, not weeks. You\'re buying PSA 10 rookies of generational players, sealed wax that appreciates over time, and key vintage cards that are blue-chip assets. You view cards as an alternative investment alongside stocks and real estate.',
    whatToCollect: [
      'PSA 10 / BGS 9.5 rookies of proven franchise players (Mahomes, Wemby, Ohtani)',
      'Sealed hobby boxes of key sets from 3-5 years ago',
      'Vintage graded cards: 1952 Topps, 1986 Fleer, T206',
      'Key rookie cards of prospects BEFORE they hit the majors (Bowman Chrome 1sts)',
    ],
    startingProducts: [
      { name: 'PSA 10 base Prizm of a top-5 player', price: '$200-500', link: '/sports' },
      { name: 'Sealed hobby box from 2-3 years ago', price: '$300+', link: '/tools/sealed-ev' },
      { name: 'Bowman Chrome 1st of a top prospect', price: '$50-200', link: '/sports' },
    ],
    toolsToUse: [
      { name: 'Compare Cards', link: '/tools/compare' },
      { name: 'Grading ROI Calculator', link: '/tools/grading-roi' },
      { name: 'Rookie Investment Guide', link: '/guides/best-rookie-cards-to-invest-2026' },
    ],
    tips: [
      'Diversify across sports and eras — don\'t put everything in one player',
      'Condition is everything — only buy PSA 9+ for modern, PSA 7+ for vintage',
      'Hold through the dips — career injuries create buying opportunities for HOF players',
      'Insurance your high-value cards and store them in a safe/vault',
    ],
    color: 'bg-purple-950/20',
    borderColor: 'border-purple-800/50',
  },
  {
    id: 'pokeFan',
    title: 'The Pokemon Collector',
    emoji: '⚡',
    tagline: 'Gotta catch \'em all — the artwork is everything.',
    description: 'You\'re drawn to Pokemon cards for the art, the nostalgia, or both. Whether you\'re building a master set, chasing Special Art Rares, or just love opening packs, the Pokemon TCG community is welcoming and the cards are stunning.',
    whatToCollect: [
      'Elite Trainer Boxes of new sets for a balanced opening experience',
      'Special Art Rares (SARs) as singles — the most beautiful cards in the hobby',
      'Booster boxes for set building + pull chances',
      'Vintage WOTC cards if you grew up with the originals (Base Set, Jungle, Fossil)',
    ],
    startingProducts: [
      { name: 'Prismatic Evolutions ETB', price: '$60', link: '/tools/sealed-ev' },
      { name: 'Surging Sparks Booster Box', price: '$140', link: '/tools/sealed-ev' },
      { name: 'A SAR single of your favorite Pokemon', price: '$20-100', link: '/pokemon' },
    ],
    toolsToUse: [
      { name: 'Pokemon Cards', link: '/pokemon' },
      { name: 'Sealed Product EV Calculator', link: '/tools/sealed-ev' },
      { name: 'Price Check', link: '/tools' },
    ],
    tips: [
      'CGC is gaining market share for Pokemon grading — consider them alongside PSA',
      'ETBs are the best value for the experience (9 packs + storage box + sleeves)',
      'Japanese cards often have better print quality and unique artwork',
      'Follow Prismatic Evolutions drops — restocks happen frequently in 2025',
    ],
    color: 'bg-yellow-950/20',
    borderColor: 'border-yellow-800/50',
  },
];

export default function CollectorQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Record<string, number>>>({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = (questionId: string, scores: Record<string, number>) => {
    const newAnswers = { ...answers, [questionId]: scores };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const getResults = () => {
    const totals: Record<string, number> = {};
    for (const scores of Object.values(answers)) {
      for (const [profile, score] of Object.entries(scores)) {
        totals[profile] = (totals[profile] || 0) + score;
      }
    }
    const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);
    const maxScore = sorted[0]?.[1] || 0;
    return sorted.map(([id, score]) => ({
      profile: profiles.find(p => p.id === id)!,
      score,
      percentage: Math.round((score / maxScore) * 100),
    }));
  };

  const restart = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
  };

  if (showResults) {
    const results = getResults();
    const topResult = results[0];
    const p = topResult.profile;

    return (
      <div className="space-y-8">
        {/* Primary result */}
        <div className={`${p.color} border ${p.borderColor} rounded-2xl p-6`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gray-900/50 rounded-xl flex items-center justify-center text-2xl">{p.emoji}</div>
            <div>
              <h3 className="text-white font-bold text-xl">{p.title}</h3>
              <p className="text-gray-400 text-sm">{p.tagline}</p>
            </div>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed mb-6">{p.description}</p>

          {/* What to collect */}
          <div className="mb-6">
            <h4 className="text-white font-semibold text-sm mb-3">What You Should Collect</h4>
            <div className="space-y-2">
              {p.whatToCollect.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-emerald-400 shrink-0 mt-0.5">*</span>
                  <p className="text-gray-300 text-sm">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Starting products */}
          <div className="mb-6">
            <h4 className="text-white font-semibold text-sm mb-3">Where to Start</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {p.startingProducts.map(prod => (
                <Link key={prod.name} href={prod.link} className="block bg-gray-900/50 border border-gray-800 rounded-xl p-3 hover:border-gray-600 transition-colors">
                  <p className="text-white font-medium text-sm">{prod.name}</p>
                  <p className="text-gray-500 text-xs mt-1">{prod.price}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Tools */}
          <div className="mb-6">
            <h4 className="text-white font-semibold text-sm mb-3">Tools for You</h4>
            <div className="flex flex-wrap gap-2">
              {p.toolsToUse.map(tool => (
                <Link
                  key={tool.name}
                  href={tool.link}
                  className="inline-flex items-center gap-2 bg-gray-900/60 hover:bg-gray-800 text-gray-300 hover:text-white text-sm px-3 py-1.5 rounded-lg border border-gray-700 transition-colors"
                >
                  {tool.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Pro tips */}
          <div className="bg-gray-900/30 rounded-xl p-4">
            <h4 className="text-amber-300 font-semibold text-sm mb-2">Pro Tips</h4>
            <div className="space-y-1.5">
              {p.tips.map((tip, i) => (
                <p key={i} className="text-amber-200/70 text-sm">* {tip}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Score breakdown */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h3 className="text-white font-bold text-lg mb-4">Your Collector Profile Breakdown</h3>
          <div className="space-y-3">
            {results.map(r => (
              <div key={r.profile.id}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-300">
                    <span className="mr-1">{r.profile.emoji}</span>
                    {r.profile.title}
                  </span>
                  <span className="text-gray-400">{r.percentage}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div
                    className={`rounded-full h-2 transition-all duration-500 ${r.percentage === 100 ? 'bg-emerald-500' : 'bg-gray-600'}`}
                    style={{ width: `${r.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Retake */}
        <div className="text-center">
          <button
            onClick={restart}
            className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-sm font-medium px-6 py-3 rounded-xl border border-gray-700 transition-colors"
          >
            Retake Quiz
          </button>
        </div>
      </div>
    );
  }

  // Quiz in progress
  const q = questions[currentQuestion];
  const progress = ((currentQuestion) / questions.length) * 100;

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span>Question {currentQuestion + 1} of {questions.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-1.5">
          <div
            className="bg-emerald-500 rounded-full h-1.5 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">{q.question}</h2>
        <div className="space-y-3">
          {q.options.map((option, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(q.id, option.scores)}
              className="w-full text-left bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-emerald-600/50 rounded-xl p-4 transition-all hover:-translate-y-0.5 group"
            >
              <p className="text-white font-medium text-sm group-hover:text-emerald-400 transition-colors">{option.label}</p>
              <p className="text-gray-500 text-xs mt-1">{option.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
