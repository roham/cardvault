'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

const sportIcons: Record<string, string> = {
  baseball: '⚾', basketball: '🏀', football: '🏈', hockey: '🏒',
};

function parseValue(v: string): number {
  const m = v.match(/\$([\d,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
}

interface StarterPack {
  id: string;
  name: string;
  description: string;
  icon: string;
  budget: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  color: string;
  border: string;
  criteria: (card: typeof sportsCards[0]) => number; // scoring function
  cardCount: number;
  whyThisPack: string;
  tips: string[];
}

const packs: StarterPack[] = [
  {
    id: 'budget-rookies',
    name: 'Budget Rookie Collection',
    description: 'Best rookie cards under $25. High upside, low cost of entry.',
    icon: '🌟', budget: 'Under $100 total', difficulty: 'beginner',
    color: 'bg-emerald-950/40', border: 'border-emerald-800/40',
    criteria: (c) => {
      const v = parseValue(c.estimatedValueRaw);
      if (!c.rookie || v > 25 || v < 2) return 0;
      return (25 - v) + (c.year >= 2020 ? 20 : 0);
    },
    cardCount: 8,
    whyThisPack: 'Rookie cards have the highest upside in the hobby. These picks all cost under $25 raw but have room to grow if the player breaks out. Perfect for learning the hobby without major financial risk.',
    tips: ['Start with raw cards — grading adds cost', 'Focus on current players still improving', 'Buy when players are slumping for better prices'],
  },
  {
    id: 'vintage-starter',
    name: 'Vintage Starter Collection',
    description: 'Classic cards from the 1950s-1980s. Timeless value, beautiful designs.',
    icon: '🏛️', budget: '$200-$500 total', difficulty: 'intermediate',
    color: 'bg-amber-950/40', border: 'border-amber-800/40',
    criteria: (c) => {
      const v = parseValue(c.estimatedValueRaw);
      if (c.year > 1985 || c.year < 1950 || v > 200 || v < 5) return 0;
      return (c.year <= 1970 ? 30 : 15) + (c.rookie ? 20 : 0) + Math.min(20, Math.floor(v / 5));
    },
    cardCount: 8,
    whyThisPack: 'Vintage cards from the golden era have a natural price floor — there are only so many 1960s Topps cards in existence. These picks combine history, beauty, and investment potential.',
    tips: ['Condition matters hugely for vintage — aim for VG-EX or better', 'Look for cards with clean corners and no creases', 'Topps and Fleer are the most recognizable vintage brands'],
  },
  {
    id: 'modern-stars',
    name: 'Current Superstars',
    description: 'Cards of today\'s biggest names. Maximum name recognition.',
    icon: '⭐', budget: '$50-$200 total', difficulty: 'beginner',
    color: 'bg-blue-950/40', border: 'border-blue-800/40',
    criteria: (c) => {
      const v = parseValue(c.estimatedValueRaw);
      if (c.year < 2018 || v > 100 || v < 3) return 0;
      const playerCards = sportsCards.filter(x => x.player === c.player).length;
      return playerCards * 5 + (c.rookie ? 25 : 0) + Math.min(20, Math.floor(v / 3));
    },
    cardCount: 8,
    whyThisPack: 'These are the players everyone knows — the names casual fans recognize. Their cards are easy to sell, fun to show off, and tied to active careers. Great conversation starters.',
    tips: ['Chrome and Prizm are the most sought-after modern brands', 'Rookie cards of active superstars are the most liquid investments', 'Watch for PSA 10 pop reports — lower populations mean higher value'],
  },
  {
    id: 'multi-sport',
    name: 'All-Sport Sampler',
    description: 'One from each sport. The diverse starting point.',
    icon: '🏅', budget: '$50-$150 total', difficulty: 'beginner',
    color: 'bg-violet-950/40', border: 'border-violet-800/40',
    criteria: (c) => {
      const v = parseValue(c.estimatedValueRaw);
      if (v > 50 || v < 3) return 0;
      return (c.rookie ? 20 : 0) + Math.min(15, Math.floor(v / 2)) + (c.year >= 2020 ? 10 : 0);
    },
    cardCount: 8,
    whyThisPack: 'Not sure which sport you like collecting? Start with one card from each sport and see what excites you. Many collectors discover a passion they did not expect — hockey collectors often start by accident!',
    tips: ['Try to get at least 2 cards per sport for comparison', 'Visit a local card shop or show to see cards in person', 'Join sport-specific subreddits and communities'],
  },
  {
    id: 'grading-candidates',
    name: 'Grading Investment Pack',
    description: 'Cards with the biggest raw-to-graded value jumps.',
    icon: '📈', budget: '$100-$300 total', difficulty: 'advanced',
    color: 'bg-rose-950/40', border: 'border-rose-800/40',
    criteria: (c) => {
      const raw = parseValue(c.estimatedValueRaw);
      const gem = parseValue(c.estimatedValueGem);
      if (raw < 5 || gem < 20) return 0;
      const multiplier = gem / raw;
      return Math.min(100, Math.floor(multiplier * 10)) + (c.rookie ? 15 : 0);
    },
    cardCount: 8,
    whyThisPack: 'These cards have the highest raw-to-gem multipliers in the database. Buy them raw, send to PSA/BGS/CGC, and if they come back a 10, you could see 3-10x your investment. High risk, high reward.',
    tips: ['Only submit cards in truly gem mint condition', 'Factor in grading costs ($20-$150 per card)', 'Check PSA pop reports — low PSA 10 populations = higher value'],
  },
  {
    id: 'pre-war-legends',
    name: 'Pre-War Hall of Famers',
    description: 'Cards from the 1900s-1940s. Museum-quality collecting.',
    icon: '🏺', budget: '$500+ total', difficulty: 'advanced',
    color: 'bg-orange-950/40', border: 'border-orange-800/40',
    criteria: (c) => {
      const v = parseValue(c.estimatedValueRaw);
      if (c.year > 1945 || v < 10) return 0;
      return Math.min(50, Math.floor(v / 10)) + (2026 - c.year) / 2 + (c.rookie ? 20 : 0);
    },
    cardCount: 8,
    whyThisPack: 'Pre-war cards are true collectibles — 80-120 years old, scarce by nature, and connected to the legends who built American sports. These are museum pieces you can hold in your hand.',
    tips: ['Even low-grade pre-war cards hold value due to extreme scarcity', 'T206, Goudey, and Play Ball are the most collectible pre-war sets', 'Authentication is critical — always buy from reputable dealers'],
  },
];

export default function StarterPacksClient() {
  const [selectedPack, setSelectedPack] = useState<string | null>(null);

  const packCards = useMemo(() => {
    if (!selectedPack) return [];
    const pack = packs.find(p => p.id === selectedPack);
    if (!pack) return [];

    const scored = sportsCards
      .map(card => ({ card, score: pack.criteria(card) }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score);

    // For multi-sport, ensure diversity
    if (selectedPack === 'multi-sport') {
      const bySport: Record<string, typeof scored> = {};
      for (const s of scored) {
        const sport = s.card.sport;
        if (!bySport[sport]) bySport[sport] = [];
        bySport[sport].push(s);
      }
      const result: typeof scored = [];
      const sports = Object.keys(bySport);
      for (let i = 0; result.length < pack.cardCount; i++) {
        for (const sport of sports) {
          if (bySport[sport][i] && result.length < pack.cardCount) {
            result.push(bySport[sport][i]);
          }
        }
        if (i > 10) break;
      }
      return result.map(x => x.card);
    }

    // Deduplicate by player (max 1 card per player)
    const seen = new Set<string>();
    const result: typeof sportsCards = [];
    for (const { card } of scored) {
      if (!seen.has(card.player) && result.length < pack.cardCount) {
        seen.add(card.player);
        result.push(card);
      }
    }
    return result;
  }, [selectedPack]);

  const activePack = packs.find(p => p.id === selectedPack);
  const totalCost = packCards.reduce((s, c) => s + parseValue(c.estimatedValueRaw), 0);

  if (selectedPack && activePack) {
    return (
      <div className="space-y-6">
        <button onClick={() => setSelectedPack(null)} className="text-sm text-emerald-400 hover:underline">&larr; All Starter Packs</button>

        <div className={`${activePack.color} ${activePack.border} border rounded-xl p-6`}>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">{activePack.icon}</span>
            <div>
              <h2 className="text-2xl font-bold text-white">{activePack.name}</h2>
              <p className="text-sm text-gray-400">{activePack.description}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4 text-center text-sm">
            <div className="bg-gray-800/40 rounded-lg p-2">
              <div className="text-gray-500">Budget</div>
              <div className="font-semibold text-white">{activePack.budget}</div>
            </div>
            <div className="bg-gray-800/40 rounded-lg p-2">
              <div className="text-gray-500">Difficulty</div>
              <div className="font-semibold text-white capitalize">{activePack.difficulty}</div>
            </div>
            <div className="bg-gray-800/40 rounded-lg p-2">
              <div className="text-gray-500">Est. Total</div>
              <div className="font-semibold text-emerald-400">${totalCost}</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5">
          <h3 className="text-lg font-bold text-white mb-2">Why This Pack?</h3>
          <p className="text-gray-400 text-sm">{activePack.whyThisPack}</p>
        </div>

        <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5">
          <h3 className="text-lg font-bold text-white mb-3">Recommended Cards</h3>
          <div className="space-y-3">
            {packCards.map((card, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-800/40 rounded-xl p-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xl font-bold text-gray-600 w-6">{i + 1}</span>
                  <span className="text-lg">{sportIcons[card.sport]}</span>
                  <div className="min-w-0">
                    <Link href={`/sports/${card.slug}`} className="font-medium text-white hover:text-emerald-400 truncate block">
                      {card.player}
                    </Link>
                    <div className="text-xs text-gray-500">
                      {card.year} {card.set} {card.rookie ? '🌟 RC' : ''}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <div className="text-sm font-bold text-emerald-400">{card.estimatedValueRaw}</div>
                  <a href={card.ebaySearchUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline">
                    Buy on eBay
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-amber-950/20 border border-amber-800/30 rounded-xl p-5">
          <h3 className="text-lg font-bold text-amber-300 mb-2">Tips for This Pack</h3>
          <ul className="space-y-1.5">
            {activePack.tips.map((tip, i) => (
              <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                <span className="text-amber-400 mt-0.5">&#8226;</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {packs.map(pack => (
        <button
          key={pack.id}
          onClick={() => setSelectedPack(pack.id)}
          className={`${pack.color} ${pack.border} border rounded-xl p-5 text-left transition-all hover:scale-[1.02]`}
        >
          <span className="text-3xl block mb-3">{pack.icon}</span>
          <h3 className="text-lg font-bold text-white mb-1">{pack.name}</h3>
          <p className="text-sm text-gray-400 mb-3">{pack.description}</p>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">{pack.budget}</span>
            <span className={`px-2 py-0.5 rounded ${
              pack.difficulty === 'beginner' ? 'bg-emerald-900/40 text-emerald-400' :
              pack.difficulty === 'intermediate' ? 'bg-amber-900/40 text-amber-400' :
              'bg-red-900/40 text-red-400'
            }`}>
              {pack.difficulty}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
