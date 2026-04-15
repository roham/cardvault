'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';
import type { SportsCard } from '@/data/sports-cards';

const sportIcons: Record<string, string> = {
  baseball: '⚾', basketball: '🏀', football: '🏈', hockey: '🏒',
};

function parseValue(v: string): number {
  const m = v.match(/\$([\d,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
}

interface DnaFactor {
  name: string;
  score: number; // 0-100
  pct: number;   // what % of value this accounts for
  description: string;
  color: string;
}

function analyzeCard(card: SportsCard, allCards: SportsCard[]): DnaFactor[] {
  const rawValue = parseValue(card.estimatedValueRaw);
  const gemValue = parseValue(card.estimatedValueGem);
  const currentYear = 2026;
  const age = currentYear - card.year;

  // 1. Player Fame — based on how many cards exist for this player
  const playerCards = allCards.filter(c => c.player === card.player);
  const playerCardCount = playerCards.length;
  const playerTotalValue = playerCards.reduce((s, c) => s + parseValue(c.estimatedValueRaw), 0);
  const fameScore = Math.min(100, playerCardCount * 12 + Math.min(50, Math.floor(Math.log2(Math.max(1, playerTotalValue)) * 5)));
  const famePct = fameScore >= 80 ? 30 : fameScore >= 50 ? 22 : 15;

  // 2. Age & Era Premium
  let ageScore: number;
  let agePct: number;
  if (age >= 80) { ageScore = 100; agePct = 25; }
  else if (age >= 50) { ageScore = 85; agePct = 20; }
  else if (age >= 30) { ageScore = 60; agePct = 12; }
  else if (age >= 10) { ageScore = 30; agePct = 8; }
  else { ageScore = Math.max(5, age * 3); agePct = 5; }

  // 3. Set Desirability
  const premiumSets = ['Topps Chrome', 'Prizm', 'Bowman Chrome', 'Upper Deck Young Guns', 'SP Authentic', 'Fleer', 'T206', 'Goudey', 'Topps', 'Donruss Optic', 'Select', 'National Treasures'];
  const isPremiumSet = premiumSets.some(s => card.set.toLowerCase().includes(s.toLowerCase()));
  const setCards = allCards.filter(c => c.set === card.set);
  const setAvgValue = setCards.reduce((s, c) => s + parseValue(c.estimatedValueRaw), 0) / Math.max(1, setCards.length);
  const setScore = isPremiumSet ? Math.min(100, 60 + Math.floor(Math.log2(Math.max(1, setAvgValue)) * 5)) : Math.min(80, Math.floor(Math.log2(Math.max(1, setAvgValue)) * 8));
  const setPct = setScore >= 70 ? 18 : 12;

  // 4. Rookie Status
  const rookieScore = card.rookie ? 100 : 0;
  const rookiePct = card.rookie ? 20 : 3;

  // 5. Condition Premium (grading multiplier)
  const gradingMultiplier = gemValue > 0 && rawValue > 0 ? gemValue / rawValue : 1;
  const conditionScore = Math.min(100, Math.floor(gradingMultiplier * 15));
  const conditionPct = gradingMultiplier >= 5 ? 15 : gradingMultiplier >= 3 ? 12 : 8;

  // 6. Scarcity / Market Position
  const isHighValue = rawValue >= 100;
  const isVintage = age >= 30;
  const scarcityScore = (isHighValue ? 40 : 10) + (isVintage ? 30 : 0) + (card.rookie ? 20 : 0) + Math.min(10, playerCardCount);
  const scarcityPct = 100 - famePct - agePct - setPct - rookiePct - conditionPct;

  return [
    { name: 'Player Fame', score: Math.min(100, fameScore), pct: famePct, description: `${card.player} has ${playerCardCount} cards in the database worth a combined $${playerTotalValue.toLocaleString()}. ${fameScore >= 70 ? 'Major name recognition drives collector demand.' : 'Growing reputation adds value.'}`, color: 'bg-blue-500' },
    { name: 'Age & Era', score: Math.min(100, ageScore), pct: agePct, description: `${age} years old (${card.year}). ${age >= 50 ? 'Pre-1980 vintage cards carry significant age premiums due to scarcity.' : age >= 30 ? 'Junk wax era — age alone adds modest premium.' : age >= 10 ? 'Modern card — value driven by player performance.' : 'Ultra-modern — value highly tied to current performance.'}`, color: 'bg-amber-500' },
    { name: 'Set Quality', score: Math.min(100, setScore), pct: setPct, description: `${card.set}. ${isPremiumSet ? 'Premium product line with strong collector demand and resale value.' : 'Standard set — value primarily from the player, not the product.'} Set average value: $${Math.round(setAvgValue)}.`, color: 'bg-emerald-500' },
    { name: 'Rookie Status', score: rookieScore, pct: rookiePct, description: card.rookie ? 'Rookie cards are the cornerstone of player collecting. They typically carry 2-5x premiums over base cards and are the most liquid cards for any player.' : 'Non-rookie card — value comes from other factors like era, set, and player performance.', color: 'bg-rose-500' },
    { name: 'Grading Premium', score: Math.min(100, conditionScore), pct: conditionPct, description: `Gem mint (PSA 10) multiplier: ${gradingMultiplier.toFixed(1)}x over raw. ${gradingMultiplier >= 5 ? 'Massive grading premium — condition is critical for this card.' : gradingMultiplier >= 3 ? 'Strong grading premium makes professional grading worthwhile.' : 'Moderate premium — grading adds value but is not essential.'}`, color: 'bg-violet-500' },
    { name: 'Scarcity', score: Math.min(100, scarcityScore), pct: Math.max(5, scarcityPct), description: `${isHighValue ? 'High-value card with limited supply at this price point.' : 'Accessible price point with broader availability.'} ${isVintage ? 'Vintage scarcity adds natural supply constraint.' : ''} ${card.rookie ? 'Rookie cards have concentrated demand.' : ''}`.trim(), color: 'bg-cyan-500' },
  ];
}

export default function ValueDnaClient() {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCard, setSelectedCard] = useState<SportsCard | null>(null);
  const [sportFilter, setSportFilter] = useState<string>('all');

  useEffect(() => { setMounted(true); }, []);

  const filteredCards = useMemo(() => {
    if (!search && sportFilter === 'all') return [];
    let cards = [...sportsCards];
    if (sportFilter !== 'all') cards = cards.filter(c => c.sport === sportFilter);
    if (search) {
      const q = search.toLowerCase();
      cards = cards.filter(c => c.player.toLowerCase().includes(q) || c.name.toLowerCase().includes(q));
    }
    return cards.sort((a, b) => parseValue(b.estimatedValueRaw) - parseValue(a.estimatedValueRaw)).slice(0, 30);
  }, [search, sportFilter]);

  const dna = useMemo(() => {
    if (!selectedCard) return null;
    return analyzeCard(selectedCard, sportsCards);
  }, [selectedCard]);

  if (!mounted) return <div className="min-h-[400px] flex items-center justify-center text-gray-500">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search for a card to analyze..."
          value={search}
          onChange={e => { setSearch(e.target.value); setSelectedCard(null); }}
          className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-600"
        />
        <div className="flex gap-2">
          {['all', 'baseball', 'basketball', 'football', 'hockey'].map(s => (
            <button
              key={s}
              onClick={() => { setSportFilter(s); setSelectedCard(null); }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                sportFilter === s ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {s === 'all' ? 'All' : sportIcons[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Search results */}
      {!selectedCard && filteredCards.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {filteredCards.map(card => (
            <button
              key={card.slug}
              onClick={() => setSelectedCard(card)}
              className="bg-gray-900/80 border border-gray-800 hover:border-emerald-700 rounded-xl p-3 text-left transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span>{sportIcons[card.sport]}</span>
                  <div className="min-w-0">
                    <div className="font-medium text-white truncate text-sm">{card.player}</div>
                    <div className="text-xs text-gray-500 truncate">{card.year} {card.set} {card.rookie ? '🌟' : ''}</div>
                  </div>
                </div>
                <span className="text-sm font-bold text-emerald-400 shrink-0 ml-2">{card.estimatedValueRaw}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {!selectedCard && search === '' && (
        <div className="text-center text-gray-500 py-8">Search for any card to see its Value DNA breakdown.</div>
      )}

      {/* DNA Results */}
      {selectedCard && dna && (
        <div className="space-y-6">
          <button onClick={() => setSelectedCard(null)} className="text-sm text-emerald-400 hover:underline">&larr; Back to search</button>

          {/* Card header */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{sportIcons[selectedCard.sport]}</span>
              <div>
                <h2 className="text-xl font-bold text-white">{selectedCard.player}</h2>
                <p className="text-sm text-gray-400">{selectedCard.year} {selectedCard.set} #{selectedCard.cardNumber}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-gray-800/60 rounded-lg p-3">
                <div className="text-xs text-gray-500">Raw Value</div>
                <div className="text-lg font-bold text-white">{selectedCard.estimatedValueRaw}</div>
              </div>
              <div className="bg-gray-800/60 rounded-lg p-3">
                <div className="text-xs text-gray-500">Gem Mint</div>
                <div className="text-lg font-bold text-emerald-400">{selectedCard.estimatedValueGem}</div>
              </div>
              <div className="bg-gray-800/60 rounded-lg p-3">
                <div className="text-xs text-gray-500">Age</div>
                <div className="text-lg font-bold text-white">{2026 - selectedCard.year} years</div>
              </div>
              <div className="bg-gray-800/60 rounded-lg p-3">
                <div className="text-xs text-gray-500">Status</div>
                <div className="text-lg font-bold text-amber-400">{selectedCard.rookie ? 'Rookie' : 'Base'}</div>
              </div>
            </div>
          </div>

          {/* DNA Helix — visual bar breakdown */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5">
            <h3 className="text-lg font-bold text-white mb-4">Value DNA Breakdown</h3>

            {/* Stacked bar */}
            <div className="flex h-8 rounded-lg overflow-hidden mb-6">
              {dna.map((factor, i) => (
                <div
                  key={i}
                  className={`${factor.color} relative group`}
                  style={{ width: `${factor.pct}%` }}
                  title={`${factor.name}: ${factor.pct}%`}
                >
                  {factor.pct >= 12 && (
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white/90">
                      {factor.pct}%
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Factor details */}
            <div className="space-y-4">
              {dna.map((factor, i) => (
                <div key={i} className="bg-gray-800/40 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${factor.color}`} />
                      <span className="font-semibold text-white">{factor.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-400">{factor.pct}% of value</span>
                      <span className="text-sm font-bold text-white">{factor.score}/100</span>
                    </div>
                  </div>
                  {/* Score bar */}
                  <div className="h-2 bg-gray-700 rounded-full mb-2 overflow-hidden">
                    <div className={`h-full ${factor.color} rounded-full transition-all`} style={{ width: `${factor.score}%` }} />
                  </div>
                  <p className="text-sm text-gray-400">{factor.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Insight */}
          <div className="bg-emerald-950/20 border border-emerald-800/30 rounded-xl p-5">
            <h3 className="text-lg font-bold text-emerald-300 mb-2">Investment Insight</h3>
            <p className="text-sm text-gray-300">
              {dna[0].score >= 70 && dna[3].score > 0
                ? `${selectedCard.player}'s rookie cards benefit from both strong name recognition and rookie status — these are the most liquid cards to own. Consider grading for a ${(parseValue(selectedCard.estimatedValueGem) / Math.max(1, parseValue(selectedCard.estimatedValueRaw))).toFixed(1)}x potential multiplier.`
                : dna[1].score >= 70
                ? `This vintage card derives significant value from age and scarcity. Pre-${1980} cards have a natural supply ceiling that supports long-term price stability.`
                : dna[0].score >= 70
                ? `${selectedCard.player}'s strong collector following creates consistent demand. Non-rookie cards of major stars can still appreciate if the player continues to perform or enters the Hall of Fame.`
                : `This card's value is distributed across multiple factors. Consider focusing your investment on cards where one dominant factor (player fame, rookie status, or vintage scarcity) creates a clearer value thesis.`
              }
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href={`/sports/${selectedCard.slug}`} className="text-emerald-400 hover:underline">View Card Details &rarr;</Link>
            <Link href="/tools/grading-roi" className="text-emerald-400 hover:underline">Grading ROI Calculator</Link>
            <Link href="/tools/investment-calc" className="text-emerald-400 hover:underline">Investment Calculator</Link>
          </div>
        </div>
      )}
    </div>
  );
}
