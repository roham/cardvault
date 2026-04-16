'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';
import type { SportsCard } from '@/data/sports-cards';

const sportIcons: Record<string, string> = {
  baseball: '⚾', basketball: '🏀', football: '🏈', hockey: '🏒',
};

const sportFilters = ['all', 'baseball', 'basketball', 'football', 'hockey'] as const;

function parseValue(v: string): number {
  const m = v.match(/\$([\d,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
}

type Rating = 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Avoid';
type RiskLevel = 'Low' | 'Medium' | 'High' | 'Speculative';
type TimeHorizon = 'Short-term (0-6 months)' | 'Medium-term (6-24 months)' | 'Long-term (2-10+ years)';

interface ThesisResult {
  rating: Rating;
  ratingScore: number; // 0-100
  riskLevel: RiskLevel;
  timeHorizon: TimeHorizon;
  targetLow: number;
  targetHigh: number;
  currentValue: number;
  bullCase: { title: string; detail: string }[];
  bearCase: { title: string; detail: string }[];
  catalysts: { event: string; impact: string; timeline: string }[];
  comparable: { card: SportsCard; reason: string }[];
  summary: string;
}

function generateThesis(card: SportsCard, allCards: SportsCard[]): ThesisResult {
  const rawValue = parseValue(card.estimatedValueRaw);
  const gemValue = parseValue(card.estimatedValueGem);
  const currentYear = 2026;
  const age = currentYear - card.year;
  const playerCards = allCards.filter(c => c.player === card.player);
  const playerCardCount = playerCards.length;
  const playerMaxValue = Math.max(...playerCards.map(c => parseValue(c.estimatedValueGem)));
  const isRookie = card.rookie;
  const sportCards = allCards.filter(c => c.sport === card.sport);

  // Premium set detection
  const premiumSets = ['Topps Chrome', 'Prizm', 'Bowman Chrome', 'SP Authentic', 'National Treasures', 'Fleer', 'Select', 'Donruss Optic', 'Upper Deck Young Guns'];
  const isPremiumSet = premiumSets.some(s => card.set.toLowerCase().includes(s.toLowerCase()));

  // Vintage detection
  const isVintage = age >= 40;
  const isUltraVintage = age >= 80;
  const isModern = age <= 5;

  // Calculate grading multiplier
  const gradingMult = rawValue > 0 && gemValue > 0 ? gemValue / rawValue : 2;

  // === RATING SCORE (0-100) ===
  let score = 50; // Base

  // Rookie premium
  if (isRookie) score += 15;

  // Player depth (more cards = more established = more demand)
  if (playerCardCount >= 6) score += 10;
  else if (playerCardCount >= 4) score += 6;
  else if (playerCardCount >= 3) score += 3;

  // Premium set bonus
  if (isPremiumSet) score += 8;

  // Value sweet spot ($10-$500 raw = most liquid range)
  if (rawValue >= 10 && rawValue <= 500) score += 5;
  else if (rawValue > 500) score += 2;
  else if (rawValue < 5) score -= 5;

  // Vintage appreciation potential
  if (isVintage) score += 10;
  if (isUltraVintage) score += 5;

  // Grading upside
  if (gradingMult >= 5) score += 8;
  else if (gradingMult >= 3) score += 5;

  // Modern card risk
  if (isModern && !isRookie) score -= 8;

  // Clamp
  score = Math.max(10, Math.min(95, score));

  // === RATING ===
  let rating: Rating;
  if (score >= 80) rating = 'Strong Buy';
  else if (score >= 65) rating = 'Buy';
  else if (score >= 45) rating = 'Hold';
  else if (score >= 30) rating = 'Sell';
  else rating = 'Avoid';

  // === RISK LEVEL ===
  let riskLevel: RiskLevel;
  if (isVintage && rawValue >= 50) riskLevel = 'Low';
  else if (isRookie && isPremiumSet && rawValue >= 20) riskLevel = 'Medium';
  else if (isModern && rawValue < 10) riskLevel = 'Speculative';
  else if (rawValue >= 100) riskLevel = 'Low';
  else if (rawValue >= 20) riskLevel = 'Medium';
  else riskLevel = 'High';

  // === TIME HORIZON ===
  let timeHorizon: TimeHorizon;
  if (isVintage) timeHorizon = 'Long-term (2-10+ years)';
  else if (isRookie) timeHorizon = 'Medium-term (6-24 months)';
  else if (isModern) timeHorizon = 'Short-term (0-6 months)';
  else timeHorizon = 'Medium-term (6-24 months)';

  // === TARGET PRICES ===
  const baseAppreciation = isVintage ? 1.3 : isRookie ? 1.2 : 1.05;
  const riskPremium = riskLevel === 'Speculative' ? 1.5 : riskLevel === 'High' ? 1.3 : 1.1;
  const targetLow = Math.round(gemValue * 0.85);
  const targetHigh = Math.round(gemValue * baseAppreciation * riskPremium);

  // === BULL CASE ===
  const bullCase: { title: string; detail: string }[] = [];

  if (isRookie) {
    bullCase.push({
      title: 'Rookie Card Premium',
      detail: `First-year cards carry a permanent scarcity premium. ${card.player}'s rookie card is the most liquid and widely collected card in their portfolio of ${playerCardCount} cards.`,
    });
  }

  if (isPremiumSet) {
    bullCase.push({
      title: 'Premium Product Line',
      detail: `${card.set} is a top-tier product with strong collector demand. Premium sets command 2-5x higher prices than base Topps/Donruss counterparts and hold value better in downturns.`,
    });
  }

  if (isVintage) {
    bullCase.push({
      title: 'Vintage Scarcity Advantage',
      detail: `At ${age} years old, this card benefits from natural attrition — damaged, lost, and deteriorated examples shrink the surviving population each year. Supply can only decrease.`,
    });
  }

  if (gradingMult >= 3) {
    bullCase.push({
      title: 'Strong Grading Upside',
      detail: `The ${gradingMult.toFixed(1)}x grading multiplier means a raw copy at $${rawValue} could be worth $${gemValue}+ in gem mint condition. Professional grading unlocks significant value.`,
    });
  }

  if (playerCardCount >= 4) {
    bullCase.push({
      title: 'Established Collector Base',
      detail: `${card.player} has ${playerCardCount} cards in the CardVault database, indicating strong collector interest. An established collector base creates consistent demand and price support.`,
    });
  }

  if (rawValue >= 50 && rawValue <= 300) {
    bullCase.push({
      title: 'Accessible Price Point',
      detail: `At $${rawValue} raw, this card sits in the "sweet spot" — affordable enough for most collectors but valuable enough to feel like a real investment. This range has the highest trading volume.`,
    });
  }

  if (card.sport === 'baseball' && isVintage) {
    bullCase.push({
      title: 'Baseball Vintage Premium',
      detail: 'Vintage baseball cards have the longest track record of appreciation in the hobby, dating back to the 1880s. Institutional collectors and museums actively acquire pre-war baseball.',
    });
  }

  // Ensure at least 3 bull cases
  if (bullCase.length < 3) {
    if (!bullCase.find(b => b.title.includes('Player'))) {
      bullCase.push({
        title: 'Player Portfolio Value',
        detail: `${card.player}'s total card portfolio spans ${playerCardCount} cards with a combined gem mint value up to $${playerMaxValue}. Name recognition and career achievements drive long-term demand.`,
      });
    }
    if (bullCase.length < 3) {
      bullCase.push({
        title: 'Hobby Growth Tailwind',
        detail: 'The sports card market has grown from $5B to $50B+ since 2020. New collectors enter the hobby daily through social media, breaking content, and mainstream coverage. Rising tide lifts all cards.',
      });
    }
    if (bullCase.length < 3) {
      bullCase.push({
        title: 'Physical Asset Diversification',
        detail: 'Sports cards are uncorrelated to stock markets and bonds, making them attractive for portfolio diversification. High-grade vintage cards have outperformed the S&P 500 over 20-year periods.',
      });
    }
  }

  // === BEAR CASE ===
  const bearCase: { title: string; detail: string }[] = [];

  if (isModern) {
    bearCase.push({
      title: 'Modern Overproduction Risk',
      detail: 'Modern card print runs are significantly higher than vintage. If the hobby contracts, modern cards face the steepest declines due to abundant supply and limited scarcity.',
    });
  }

  if (!isRookie) {
    bearCase.push({
      title: 'Non-Rookie Liquidity Discount',
      detail: `This is not ${card.player}'s rookie card, which means it has a smaller buyer pool and lower resale priority. In a market downturn, non-RC cards are the first to lose value.`,
    });
  }

  if (rawValue < 10) {
    bearCase.push({
      title: 'Low Value Floor',
      detail: `At $${rawValue} raw, shipping and transaction fees eat a significant percentage of the card's value. Selling at this price point is often unprofitable after platform fees (10-15%) and shipping ($4-5).`,
    });
  }

  if (riskLevel === 'Speculative') {
    bearCase.push({
      title: 'Speculative Positioning',
      detail: 'This card\'s value is largely based on future potential rather than established demand. If the player underperforms, gets injured, or falls out of favor, the card could lose 50-80% of its value.',
    });
  }

  if (gradingMult < 2) {
    bearCase.push({
      title: 'Limited Grading Upside',
      detail: `The grading multiplier is only ${gradingMult.toFixed(1)}x, meaning professional grading doesn't significantly increase value. The $25-75 grading cost may not be justified by the price increase.`,
    });
  }

  if (card.sport === 'football') {
    bearCase.push({
      title: 'Injury & Career Risk',
      detail: 'Football has the highest injury rate of the four major sports. A career-ending injury can instantly crater card values by 40-70%, with limited recovery potential.',
    });
  }

  // Ensure at least 3 bear cases
  if (bearCase.length < 3) {
    if (!bearCase.find(b => b.title.includes('Market'))) {
      bearCase.push({
        title: 'Market Cycle Risk',
        detail: 'The card market is cyclical. The 2021-2022 boom saw 200-500% price spikes that have since corrected 30-60% across most categories. Future corrections are possible.',
      });
    }
    if (bearCase.length < 3) {
      bearCase.push({
        title: 'Liquidity Constraints',
        detail: 'Sports cards are illiquid compared to stocks. Selling at fair market value can take days to weeks on eBay, and quick liquidation typically requires a 20-40% discount.',
      });
    }
    if (bearCase.length < 3) {
      bearCase.push({
        title: 'Storage & Insurance Costs',
        detail: 'Physical cards require proper storage (penny sleeves, toploaders, climate control) and potentially insurance for valuable items. These ongoing costs reduce net returns.',
      });
    }
  }

  // === CATALYSTS ===
  const catalysts: { event: string; impact: string; timeline: string }[] = [];

  if (card.sport === 'baseball') {
    catalysts.push(
      { event: 'Hall of Fame Induction', impact: 'HOF announcement boosts rookie cards 30-80%', timeline: 'January each year' },
      { event: 'Postseason Performance', impact: 'World Series appearances drive 20-50% spikes', timeline: 'October' },
      { event: 'New Product Releases', impact: 'Major Topps/Bowman releases create market activity', timeline: 'February-April' },
    );
  } else if (card.sport === 'basketball') {
    catalysts.push(
      { event: 'NBA Playoffs & Finals', impact: 'Championship runs boost player cards 25-60%', timeline: 'April-June' },
      { event: 'NBA Draft', impact: 'New rookies shift collecting attention and capital', timeline: 'June' },
      { event: 'MVP/Award Announcements', impact: 'Season awards drive 15-40% card value increases', timeline: 'May' },
    );
  } else if (card.sport === 'football') {
    catalysts.push(
      { event: 'NFL Draft', impact: 'New rookie class creates massive market activity', timeline: 'April' },
      { event: 'Super Bowl', impact: 'Championship winners see 30-80% card spikes', timeline: 'February' },
      { event: 'Fantasy Football Season', impact: 'Performance-driven card demand increases', timeline: 'September-January' },
    );
  } else if (card.sport === 'hockey') {
    catalysts.push(
      { event: 'Stanley Cup Playoffs', impact: 'Playoff heroes see 20-50% value spikes', timeline: 'April-June' },
      { event: 'NHL Draft & Young Guns', impact: 'New Young Guns releases are the #1 hockey card event', timeline: 'October-November' },
      { event: 'World Juniors', impact: 'Prospect visibility boosts pre-NHL card values', timeline: 'December-January' },
    );
  }

  if (isRookie) {
    catalysts.push({ event: 'Career Milestone', impact: 'First All-Star, MVP, or championship drives 20-100% spikes', timeline: 'Varies' });
  }
  if (isVintage) {
    catalysts.push({ event: 'Major Auction Record', impact: 'Record sale for the card or player resets market floor', timeline: 'Ongoing' });
  }

  // === COMPARABLES ===
  const comparable: { card: SportsCard; reason: string }[] = [];
  const samePlayerCards = playerCards.filter(c => c.slug !== card.slug).slice(0, 2);
  samePlayerCards.forEach(c => {
    comparable.push({ card: c, reason: `Same player, different card — compare value across ${card.player}'s portfolio` });
  });

  // Find similar-value cards in same sport
  const similarValue = sportCards
    .filter(c => c.slug !== card.slug && c.player !== card.player && Math.abs(parseValue(c.estimatedValueGem) - gemValue) < gemValue * 0.3)
    .slice(0, 2);
  similarValue.forEach(c => {
    comparable.push({ card: c, reason: `Similar value range in ${card.sport} — alternative investment at comparable price point` });
  });

  // === SUMMARY ===
  const ratingLabel = rating === 'Strong Buy' ? 'strong investment candidate' : rating === 'Buy' ? 'solid addition to a collection' : rating === 'Hold' ? 'reasonable hold for existing owners' : rating === 'Sell' ? 'candidate for selling to reallocate capital' : 'risky position to avoid';
  const summary = `${card.name} scores ${score}/100, making it a ${ratingLabel}. ${isRookie ? 'As a rookie card, it benefits from permanent scarcity premium and the broadest buyer pool.' : ''} ${isVintage ? `At ${age} years old, natural attrition supports long-term appreciation.` : ''} ${isPremiumSet ? `The premium ${card.set} product line adds collector appeal.` : ''} Risk is ${riskLevel.toLowerCase()} with a ${timeHorizon.toLowerCase()} investment horizon.`;

  return {
    rating,
    ratingScore: score,
    riskLevel,
    timeHorizon,
    targetLow,
    targetHigh,
    currentValue: gemValue,
    bullCase: bullCase.slice(0, 4),
    bearCase: bearCase.slice(0, 4),
    catalysts: catalysts.slice(0, 4),
    comparable: comparable.slice(0, 4),
    summary,
  };
}

const ratingColors: Record<Rating, string> = {
  'Strong Buy': 'text-emerald-400 bg-emerald-950/60 border-emerald-700/50',
  'Buy': 'text-green-400 bg-green-950/60 border-green-700/50',
  'Hold': 'text-amber-400 bg-amber-950/60 border-amber-700/50',
  'Sell': 'text-orange-400 bg-orange-950/60 border-orange-700/50',
  'Avoid': 'text-red-400 bg-red-950/60 border-red-700/50',
};

const riskColors: Record<RiskLevel, string> = {
  'Low': 'text-emerald-400',
  'Medium': 'text-amber-400',
  'High': 'text-orange-400',
  'Speculative': 'text-red-400',
};

export default function ThesisGeneratorClient() {
  const [query, setQuery] = useState('');
  const [sportFilter, setSportFilter] = useState<string>('all');
  const [selectedCard, setSelectedCard] = useState<SportsCard | null>(null);
  const [thesis, setThesis] = useState<ThesisResult | null>(null);
  const [showResults, setShowResults] = useState(false);

  const allCards = useMemo(() => sportsCards, []);

  const searchResults = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    return allCards
      .filter(c => {
        if (sportFilter !== 'all' && c.sport !== sportFilter) return false;
        return c.name.toLowerCase().includes(q) || c.player.toLowerCase().includes(q) || c.set.toLowerCase().includes(q);
      })
      .slice(0, 12);
  }, [query, sportFilter, allCards]);

  function handleSelect(card: SportsCard) {
    setSelectedCard(card);
    setThesis(generateThesis(card, allCards));
    setQuery('');
    setShowResults(false);
  }

  function handleClear() {
    setSelectedCard(null);
    setThesis(null);
    setQuery('');
  }

  return (
    <div>
      {/* Search */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Search for a Card</h2>

        {/* Sport Filter */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {sportFilters.map(s => (
            <button
              key={s}
              onClick={() => setSportFilter(s)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                sportFilter === s
                  ? 'bg-violet-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300'
              }`}
            >
              {s === 'all' ? 'All Sports' : `${sportIcons[s] || ''} ${s.charAt(0).toUpperCase() + s.slice(1)}`}
            </button>
          ))}
        </div>

        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setShowResults(true); }}
            onFocus={() => setShowResults(true)}
            placeholder="Search by player name, card name, or set..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
          />
          {showResults && searchResults.length > 0 && (
            <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-xl max-h-80 overflow-y-auto">
              {searchResults.map(c => (
                <button
                  key={c.slug}
                  onClick={() => handleSelect(c)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-800 border-b border-gray-800 last:border-b-0 transition-colors"
                >
                  <div className="text-white text-sm font-medium">{c.name}</div>
                  <div className="text-gray-500 text-xs mt-0.5">
                    {sportIcons[c.sport] || ''} {c.player} &middot; {c.estimatedValueRaw} raw &middot; {c.estimatedValueGem} gem
                    {c.rookie && <span className="ml-2 text-amber-400">RC</span>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Thesis Display */}
      {selectedCard && thesis && (
        <div className="space-y-6">
          {/* Card Header + Rating */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <div>
                <div className="text-gray-400 text-sm mb-1">{sportIcons[selectedCard.sport] || ''} {selectedCard.sport.charAt(0).toUpperCase() + selectedCard.sport.slice(1)} &middot; {selectedCard.set}</div>
                <h3 className="text-xl font-bold text-white">{selectedCard.name}</h3>
                <div className="text-gray-400 text-sm mt-1">{selectedCard.player} {selectedCard.rookie ? <span className="text-amber-400 font-medium">Rookie Card</span> : ''}</div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className={`px-4 py-2 rounded-lg border text-lg font-bold ${ratingColors[thesis.rating]}`}>
                  {thesis.rating}
                </div>
                <div className="text-gray-500 text-xs">{thesis.ratingScore}/100 score</div>
              </div>
            </div>

            {/* Key Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              <div className="bg-gray-800/60 rounded-lg p-3 text-center">
                <div className="text-gray-500 text-xs mb-1">Current Value</div>
                <div className="text-white font-bold">${thesis.currentValue.toLocaleString()}</div>
                <div className="text-gray-500 text-xs">gem mint</div>
              </div>
              <div className="bg-gray-800/60 rounded-lg p-3 text-center">
                <div className="text-gray-500 text-xs mb-1">Target Range</div>
                <div className="text-white font-bold">${thesis.targetLow.toLocaleString()}-${thesis.targetHigh.toLocaleString()}</div>
                <div className="text-gray-500 text-xs">projected</div>
              </div>
              <div className="bg-gray-800/60 rounded-lg p-3 text-center">
                <div className="text-gray-500 text-xs mb-1">Risk Level</div>
                <div className={`font-bold ${riskColors[thesis.riskLevel]}`}>{thesis.riskLevel}</div>
              </div>
              <div className="bg-gray-800/60 rounded-lg p-3 text-center">
                <div className="text-gray-500 text-xs mb-1">Time Horizon</div>
                <div className="text-white font-bold text-sm">{thesis.timeHorizon.split('(')[0].trim()}</div>
                <div className="text-gray-500 text-xs">{thesis.timeHorizon.match(/\((.+)\)/)?.[1] || ''}</div>
              </div>
            </div>

            {/* Score Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Avoid</span>
                <span>Sell</span>
                <span>Hold</span>
                <span>Buy</span>
                <span>Strong Buy</span>
              </div>
              <div className="h-3 bg-gray-800 rounded-full relative overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${thesis.ratingScore}%`,
                    background: thesis.ratingScore >= 80 ? 'linear-gradient(90deg, #059669, #10b981)'
                      : thesis.ratingScore >= 65 ? 'linear-gradient(90deg, #059669, #22c55e)'
                      : thesis.ratingScore >= 45 ? 'linear-gradient(90deg, #d97706, #f59e0b)'
                      : thesis.ratingScore >= 30 ? 'linear-gradient(90deg, #ea580c, #f97316)'
                      : 'linear-gradient(90deg, #dc2626, #ef4444)',
                  }}
                />
              </div>
            </div>

            {/* Summary */}
            <p className="text-gray-300 text-sm mt-4 leading-relaxed">{thesis.summary}</p>
          </div>

          {/* Bull & Bear Cases Side by Side */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Bull Case */}
            <div className="bg-gray-900/80 border border-emerald-900/40 rounded-xl p-6">
              <h3 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                <span className="text-xl">&#x2191;</span> Bull Case
              </h3>
              <div className="space-y-4">
                {thesis.bullCase.map((b, i) => (
                  <div key={i} className="border-l-2 border-emerald-700/50 pl-3">
                    <div className="text-white text-sm font-semibold">{b.title}</div>
                    <div className="text-gray-400 text-xs mt-1 leading-relaxed">{b.detail}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bear Case */}
            <div className="bg-gray-900/80 border border-red-900/40 rounded-xl p-6">
              <h3 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
                <span className="text-xl">&#x2193;</span> Bear Case
              </h3>
              <div className="space-y-4">
                {thesis.bearCase.map((b, i) => (
                  <div key={i} className="border-l-2 border-red-700/50 pl-3">
                    <div className="text-white text-sm font-semibold">{b.title}</div>
                    <div className="text-gray-400 text-xs mt-1 leading-relaxed">{b.detail}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Catalysts */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-violet-400 mb-4">Key Catalysts</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {thesis.catalysts.map((c, i) => (
                <div key={i} className="bg-gray-800/60 rounded-lg p-3">
                  <div className="text-white text-sm font-semibold">{c.event}</div>
                  <div className="text-gray-400 text-xs mt-1">{c.impact}</div>
                  <div className="text-violet-400 text-xs mt-1 font-medium">{c.timeline}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Comparable Cards */}
          {thesis.comparable.length > 0 && (
            <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-bold text-sky-400 mb-4">Comparable Cards</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {thesis.comparable.map((c, i) => (
                  <Link
                    key={i}
                    href={`/sports/${c.card.slug}`}
                    className="bg-gray-800/60 rounded-lg p-3 hover:bg-gray-700/60 transition-colors block"
                  >
                    <div className="text-white text-sm font-semibold">{c.card.name}</div>
                    <div className="text-gray-400 text-xs mt-1">{sportIcons[c.card.sport] || ''} {c.card.player} &middot; {c.card.estimatedValueGem}</div>
                    <div className="text-sky-400 text-xs mt-1">{c.reason}</div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Related Tools */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Related Tools</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Link href="/tools/value-dna" className="bg-gray-800/60 rounded-lg p-3 text-center hover:bg-gray-700/60 transition-colors">
                <div className="text-2xl mb-1">&#x1F9EC;</div>
                <div className="text-white text-xs font-medium">Value DNA</div>
              </Link>
              <Link href="/tools/investment-calc" className="bg-gray-800/60 rounded-lg p-3 text-center hover:bg-gray-700/60 transition-colors">
                <div className="text-2xl mb-1">&#x1F4C8;</div>
                <div className="text-white text-xs font-medium">Investment Calc</div>
              </Link>
              <Link href="/tools/grading-roi" className="bg-gray-800/60 rounded-lg p-3 text-center hover:bg-gray-700/60 transition-colors">
                <div className="text-2xl mb-1">&#x1F4B0;</div>
                <div className="text-white text-xs font-medium">Grading ROI</div>
              </Link>
              <Link href="/tools/rarity-score" className="bg-gray-800/60 rounded-lg p-3 text-center hover:bg-gray-700/60 transition-colors">
                <div className="text-2xl mb-1">&#x1F48E;</div>
                <div className="text-white text-xs font-medium">Rarity Score</div>
              </Link>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 flex-wrap">
            <Link
              href={selectedCard.ebaySearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors"
            >
              Search on eBay
            </Link>
            <Link
              href={`/sports/${selectedCard.slug}`}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
            >
              View Card Page
            </Link>
            <button
              onClick={handleClear}
              className="px-4 py-2 bg-gray-800 text-gray-400 rounded-lg text-sm font-medium hover:bg-gray-700 hover:text-white transition-colors"
            >
              Analyze Another Card
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!selectedCard && (
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-10 text-center">
          <div className="text-4xl mb-4">&#x1F4CA;</div>
          <h3 className="text-lg font-semibold text-white mb-2">Search for a card to generate its investment thesis</h3>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Get a structured bull/bear analysis, risk rating, catalysts, target prices, and comparable cards for any card in our database of {allCards.length.toLocaleString()}+ cards.
          </p>
        </div>
      )}
    </div>
  );
}
