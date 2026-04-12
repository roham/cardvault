'use client';

import { useState } from 'react';
import Link from 'next/link';

type CardType = 'sports' | 'pokemon' | 'both' | 'unsure' | null;
type Goal = 'worth' | 'collect' | 'learn' | null;

const cardTypeOptions = [
  { id: 'sports' as CardType, label: 'Sports Cards', icon: '🏆', desc: 'Baseball, basketball, football, hockey' },
  { id: 'pokemon' as CardType, label: 'Pokémon Cards', icon: '⚡', desc: 'Base Set, modern sets, SARs, ex cards' },
  { id: 'both' as CardType, label: 'Both', icon: '🃏', desc: 'I collect multiple types' },
  { id: 'unsure' as CardType, label: 'Not Sure', icon: '🤔', desc: 'Just exploring what I have' },
];

const goalOptions = [
  {
    id: 'worth' as Goal,
    label: 'Find out what they\'re worth',
    icon: '💰',
    desc: 'Check prices, see what similar cards sold for',
  },
  {
    id: 'collect' as Goal,
    label: 'Start or grow my collection',
    icon: '📦',
    desc: 'Track what I have, find what\'s next to add',
  },
  {
    id: 'learn' as Goal,
    label: 'Learn about the hobby',
    icon: '📚',
    desc: 'Grading, sets, conditions, where to buy and sell',
  },
];

interface RouteConfig {
  primary: { label: string; href: string; color: string };
  secondary: { label: string; href: string }[];
  tip: string;
}

function getRoutes(cardType: CardType, goal: Goal): RouteConfig {
  if (goal === 'worth') {
    if (cardType === 'pokemon' || cardType === 'both') {
      return {
        primary: { label: 'Check Pokémon Card Prices', href: '/pokemon', color: 'bg-yellow-500 hover:bg-yellow-400 text-black' },
        secondary: [
          { label: 'Price Check Tool', href: '/tools' },
          { label: 'Sports Card Prices', href: '/sports' },
        ],
        tip: 'Look up your card by set name. For Pokémon, the set symbol on the card bottom-left identifies the set. For sports cards, search by player name and year.',
      };
    }
    if (cardType === 'sports') {
      return {
        primary: { label: 'Browse Sports Card Prices', href: '/sports', color: 'bg-emerald-500 hover:bg-emerald-400 text-black' },
        secondary: [
          { label: 'Price Check Tool', href: '/tools' },
          { label: 'Price Guide', href: '/price-guide' },
        ],
        tip: 'Search by player name + year + brand. Condition matters enormously — a PSA 10 can be 10x–100x a PSA 7 of the same card.',
      };
    }
    return {
      primary: { label: 'Use the Price Check Tool', href: '/tools', color: 'bg-emerald-500 hover:bg-emerald-400 text-black' },
      secondary: [
        { label: 'Sports Card Prices', href: '/sports' },
        { label: 'Pokémon Prices', href: '/pokemon' },
      ],
      tip: 'Search for your card by name. Prices shown are based on recent eBay sold listings and TCGPlayer marketplace data.',
    };
  }

  if (goal === 'collect') {
    if (cardType === 'pokemon' || cardType === 'both') {
      return {
        primary: { label: 'Browse Pokémon Sets', href: '/pokemon', color: 'bg-yellow-500 hover:bg-yellow-400 text-black' },
        secondary: [
          { label: 'Track My Collection', href: '/collection' },
          { label: 'Sports Sets', href: '/sports/sets' },
        ],
        tip: 'Pick a set you love and open its checklist to track what you have. Your progress saves automatically — no account needed.',
      };
    }
    if (cardType === 'sports') {
      return {
        primary: { label: 'Browse Sports Card Sets', href: '/sports/sets', color: 'bg-emerald-500 hover:bg-emerald-400 text-black' },
        secondary: [
          { label: 'Track My Collection', href: '/collection' },
          { label: 'Featured Cards', href: '/sports' },
        ],
        tip: 'Start with a set from a player you already know. Rookie cards from your favorite player\'s first year are the most collectible.',
      };
    }
    return {
      primary: { label: 'View My Collection', href: '/collection', color: 'bg-emerald-500 hover:bg-emerald-400 text-black' },
      secondary: [
        { label: 'Pokémon Sets', href: '/pokemon' },
        { label: 'Sports Sets', href: '/sports/sets' },
      ],
      tip: 'Use a set checklist to track what you own. Everything saves locally in your browser — no signup required.',
    };
  }

  // learn
  return {
    primary: { label: 'Read the Guides', href: '/guides', color: 'bg-blue-500 hover:bg-blue-400 text-white' },
    secondary: [
      { label: 'Price Guide', href: '/price-guide' },
      { label: cardType === 'pokemon' ? 'Pokémon Sets' : 'Sports Cards', href: cardType === 'pokemon' ? '/pokemon' : '/sports' },
    ],
    tip: 'The most important concepts: card condition (grading), rookie cards, print runs, and the difference between raw and graded cards.',
  };
}

export default function StartPage() {
  const [cardType, setCardType] = useState<CardType>(null);
  const [goal, setGoal] = useState<Goal>(null);

  const step = !cardType ? 1 : !goal ? 2 : 3;
  const routes = cardType && goal ? getRoutes(cardType, goal) : null;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
          3 questions to the right tool
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">New to cards?<br />Start here.</h1>
        <p className="text-gray-400">Answer two questions — we&apos;ll send you exactly where you need to go.</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-10 justify-center">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step > s
                ? 'bg-emerald-500 text-black'
                : step === s
                  ? 'bg-white text-black'
                  : 'bg-gray-800 text-gray-500'
            }`}>
              {step > s ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : s}
            </div>
            {s < 3 && <div className={`w-10 h-px ${step > s ? 'bg-emerald-500' : 'bg-gray-700'}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Card type */}
      {step >= 1 && (
        <div className={`mb-8 transition-all ${step > 1 ? 'opacity-50' : ''}`}>
          <p className="text-white font-semibold text-lg mb-4">
            1. What kind of cards do you have?
          </p>
          <div className="grid grid-cols-2 gap-3">
            {cardTypeOptions.map(opt => (
              <button
                key={opt.id}
                onClick={() => {
                  setCardType(opt.id);
                  setGoal(null);
                }}
                className={`text-left rounded-xl border p-4 transition-all ${
                  cardType === opt.id
                    ? 'border-emerald-500 bg-emerald-950/30'
                    : 'border-gray-800 bg-gray-900 hover:border-gray-600'
                }`}
              >
                <span className="text-2xl mb-2 block">{opt.icon}</span>
                <p className="text-white font-medium text-sm mb-0.5">{opt.label}</p>
                <p className="text-gray-500 text-xs leading-snug">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Goal */}
      {step >= 2 && (
        <div className={`mb-8 transition-all ${step > 2 ? 'opacity-50' : ''}`}>
          <p className="text-white font-semibold text-lg mb-4">
            2. What do you want to do?
          </p>
          <div className="flex flex-col gap-3">
            {goalOptions.map(opt => (
              <button
                key={opt.id}
                onClick={() => setGoal(opt.id)}
                className={`text-left rounded-xl border p-4 transition-all flex items-start gap-4 ${
                  goal === opt.id
                    ? 'border-emerald-500 bg-emerald-950/30'
                    : 'border-gray-800 bg-gray-900 hover:border-gray-600'
                }`}
              >
                <span className="text-2xl shrink-0">{opt.icon}</span>
                <div>
                  <p className="text-white font-medium text-sm mb-0.5">{opt.label}</p>
                  <p className="text-gray-500 text-xs">{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Routes */}
      {step === 3 && routes && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
            <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-1">Quick tip</p>
            <p className="text-gray-300 text-sm leading-relaxed">{routes.tip}</p>
          </div>

          <Link
            href={routes.primary.href}
            className={`flex items-center justify-center gap-2 w-full font-bold px-6 py-4 rounded-xl text-base transition-colors mb-3 ${routes.primary.color}`}
          >
            {routes.primary.label}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>

          <div className="flex flex-col gap-2">
            {routes.secondary.map(r => (
              <Link
                key={r.href}
                href={r.href}
                className="flex items-center justify-center gap-2 w-full bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium px-6 py-3 rounded-xl text-sm transition-colors border border-gray-700"
              >
                {r.label}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>

          <button
            onClick={() => { setCardType(null); setGoal(null); }}
            className="w-full text-center text-gray-600 hover:text-gray-400 text-xs mt-4 transition-colors"
          >
            Start over
          </button>
        </div>
      )}
    </div>
  );
}
