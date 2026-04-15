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

interface Strategy {
  id: string;
  name: string;
  icon: string;
  tagline: string;
  description: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Very High';
  riskColor: string;
  timeHorizon: string;
  entryBudget: string;
  expectedReturn: string;
  bestFor: string;
  steps: string[];
  pros: string[];
  cons: string[];
  cardFilter: (c: typeof sportsCards[0]) => boolean;
  cardSort: (a: typeof sportsCards[0], b: typeof sportsCards[0]) => number;
  cardLabel: string;
}

const strategies: Strategy[] = [
  {
    id: 'value',
    name: 'Value Hunting',
    icon: '🔍',
    tagline: 'Buy quality cards below fair value',
    description: 'Find cards that are priced below their fundamental value based on player quality, set prestige, and card condition. These are the "sale rack" finds — great players in premium sets at below-market prices. Value hunters wait patiently for market inefficiencies and buy when others are selling.',
    riskLevel: 'Low',
    riskColor: 'emerald',
    timeHorizon: '6-24 months',
    entryBudget: '$50-500',
    expectedReturn: '15-50% over 12 months',
    bestFor: 'Beginners, patient collectors, risk-averse investors',
    steps: [
      'Identify players with strong careers but temporarily depressed card prices (injury, bad season, team change)',
      'Focus on premium sets (Topps Chrome, Prizm, Bowman Chrome) where quality is guaranteed',
      'Buy raw cards in the $5-50 range that could grade PSA 9+ for a grading premium',
      'Hold through the recovery period (usually 3-12 months)',
      'Sell when the card returns to fair value or grade and sell for a premium',
    ],
    pros: ['Lowest risk of all strategies', 'Works in any market condition', 'Builds a quality collection while investing', 'Easy to find opportunities daily on eBay'],
    cons: ['Requires patience (months, not days)', 'Returns are moderate, not explosive', 'Need knowledge to identify true value vs value traps', 'Some "cheap" cards are cheap for a reason'],
    cardFilter: (c) => {
      const raw = parseValue(c.estimatedValueRaw);
      const gem = parseValue(c.estimatedValueGem);
      return raw >= 5 && raw <= 50 && gem >= raw * 3 && c.rookie;
    },
    cardSort: (a, b) => {
      const aRatio = parseValue(a.estimatedValueGem) / Math.max(1, parseValue(a.estimatedValueRaw));
      const bRatio = parseValue(b.estimatedValueGem) / Math.max(1, parseValue(b.estimatedValueRaw));
      return bRatio - aRatio;
    },
    cardLabel: 'Best value plays (highest raw-to-gem multiplier)',
  },
  {
    id: 'rookie-growth',
    name: 'Rookie Growth',
    icon: '🚀',
    tagline: 'Buy young players before they break out',
    description: 'Invest in rookie cards of promising young players early in their careers. The thesis: if the player becomes a star, their rookie cards will appreciate 3-10x. This is the most popular card investing strategy because the upside is enormous — a $20 rookie card can become a $200 card after an MVP season.',
    riskLevel: 'Medium',
    riskColor: 'amber',
    timeHorizon: '1-5 years',
    entryBudget: '$100-2,000',
    expectedReturn: '50-500% for winners (with 30-50% loss rate on busts)',
    bestFor: 'Sports fans who follow prospects, risk-tolerant investors, portfolio builders',
    steps: [
      'Research prospects: minor leagues (MLB), college (NBA/NFL), junior leagues (NHL)',
      'Buy rookie cards BEFORE the breakout season — not after',
      'Diversify across 5-10 players to reduce bust risk',
      'Focus on Prizm, Topps Chrome, and Bowman Chrome as the most liquid rookie products',
      'Set price targets: sell half at 3x, hold half for long-term',
    ],
    pros: ['Highest upside of any strategy', 'Liquid market — easy to buy and sell', 'Fun — you are invested in player careers', 'Works across all 4 major sports'],
    cons: ['High bust rate (50%+ of prospects never become stars)', 'Requires sports knowledge to pick winners', 'Cards can lose 80%+ if player busts', 'Population growth can dilute value over time'],
    cardFilter: (c) => c.rookie && c.year >= 2022 && parseValue(c.estimatedValueRaw) >= 3 && parseValue(c.estimatedValueRaw) <= 100,
    cardSort: (a, b) => parseValue(b.estimatedValueGem) - parseValue(a.estimatedValueGem),
    cardLabel: 'Top recent rookies by gem-mint value',
  },
  {
    id: 'vintage',
    name: 'Vintage Appreciation',
    icon: '🏛️',
    tagline: 'Own a piece of sports history',
    description: 'Invest in pre-1980 cards of Hall of Famers and legendary players. Vintage cards have a built-in supply constraint — they were printed decades ago and many have been lost or damaged. As the surviving population shrinks, values tend to appreciate steadily. This is the "blue chip" strategy of card investing.',
    riskLevel: 'Low',
    riskColor: 'emerald',
    timeHorizon: '3-10+ years',
    entryBudget: '$200-5,000+',
    expectedReturn: '5-15% annually (compound appreciation)',
    bestFor: 'Long-term investors, history buffs, wealth preservation, estate planning',
    steps: [
      'Focus on Hall of Famers with established collector demand (Mantle, Aaron, Jordan, Gretzky)',
      'Buy the best grade you can afford — condition matters most for vintage',
      'Prefer iconic sets: 1952 Topps, T206, 1986 Fleer, 1979 OPC',
      'Verify authenticity — vintage fakes are common. Buy from reputable dealers or graded cards only',
      'Hold for years and enjoy the history. These cards are also beautiful display pieces',
    ],
    pros: ['Lowest volatility of any strategy', 'Supply can only decrease (cards get lost/damaged)', 'Strong floor — HOF legends always have demand', 'Tangible asset that survives market crashes', 'Tax benefits (collectibles capital gains rate)'],
    cons: ['High entry cost for top-tier cards', 'Low liquidity — can take weeks to sell', 'Authentication risk for raw cards', 'Minimal short-term upside', 'Storage and insurance costs'],
    cardFilter: (c) => c.year <= 1985 && parseValue(c.estimatedValueRaw) >= 50,
    cardSort: (a, b) => parseValue(b.estimatedValueRaw) - parseValue(a.estimatedValueRaw),
    cardLabel: 'Top vintage cards (pre-1985, highest value)',
  },
  {
    id: 'momentum',
    name: 'Momentum Trading',
    icon: '📈',
    tagline: 'Ride hot streaks and seasonal spikes',
    description: 'Buy cards that are trending up and sell before the momentum fades. Sports cards have strong seasonal patterns: football cards spike during playoffs, basketball during March Madness and Finals, baseball during the World Series. Momentum traders profit from these predictable cycles by buying early and selling into the hype.',
    riskLevel: 'High',
    riskColor: 'rose',
    timeHorizon: '1-8 weeks',
    entryBudget: '$200-5,000',
    expectedReturn: '20-100% per trade (with 20-40% loss rate)',
    bestFor: 'Active traders, sports bettors, people who follow games daily',
    steps: [
      'Learn seasonal patterns: buy football in summer, sell in January. Buy basketball in October, sell in June.',
      'Follow player performance: buy after a great game, sell after a career milestone',
      'Monitor social media: when a player trends on Twitter/X, their cards move 24-48 hours later',
      'Set stop-losses: if a card drops 15% from your buy price, sell and move on',
      'Take profits: sell half your position at 30% gain, let the rest ride with a trailing stop',
    ],
    pros: ['Fast returns (days to weeks)', 'Predictable seasonal patterns', 'High excitement — you are trading the games', 'Can be combined with other strategies'],
    cons: ['Highest time commitment', 'Transaction costs (eBay fees, shipping) eat into margins', 'Requires active monitoring', 'Emotional decisions lead to losses', 'Can lose money fast if momentum reverses'],
    cardFilter: (c) => c.rookie && c.year >= 2020 && parseValue(c.estimatedValueRaw) >= 10 && parseValue(c.estimatedValueRaw) <= 200,
    cardSort: (a, b) => b.year - a.year || parseValue(b.estimatedValueRaw) - parseValue(a.estimatedValueRaw),
    cardLabel: 'Recent rookies with momentum potential',
  },
  {
    id: 'contrarian',
    name: 'Contrarian Buying',
    icon: '🔄',
    tagline: 'Buy when others are selling',
    description: 'Buy cards when the market panics — after an injury, trade, or bad season. The contrarian thesis: elite players recover, and their cards rebound to previous levels. When Patrick Mahomes tore his ACL, his rookie cards dropped 40% — then doubled after his MVP comeback. Contrarians buy the dip and wait.',
    riskLevel: 'Medium',
    riskColor: 'amber',
    timeHorizon: '3-18 months',
    entryBudget: '$100-3,000',
    expectedReturn: '30-200% (when the thesis plays out)',
    bestFor: 'Patient investors, people who can separate emotion from data, value investors',
    steps: [
      'Create a watch list of elite players whose cards you want to own',
      'Wait for a negative catalyst: injury, suspension, trade to a bad team, poor stretch of games',
      'Buy when the card drops 20-40% from its 52-week high',
      'Average down if it drops further (but only for elite, proven players)',
      'Sell when sentiment recovers and the card returns to fair value (or higher)',
    ],
    pros: ['Buy quality at a discount', 'Contrarian positions have built-in recovery catalysts', 'Lower competition — most collectors are panic selling, not buying', 'Works especially well for proven superstars'],
    cons: ['Some "dips" are permanent (career-ending injuries, scandals)', 'Requires conviction to buy when everyone is negative', 'Can be wrong — career declines happen', 'Opportunity cost while waiting for recovery'],
    cardFilter: (c) => {
      const raw = parseValue(c.estimatedValueRaw);
      const playerCards = sportsCards.filter(sc => sc.player === c.player);
      return c.rookie && raw >= 20 && raw <= 500 && playerCards.length >= 3;
    },
    cardSort: (a, b) => parseValue(b.estimatedValueRaw) - parseValue(a.estimatedValueRaw),
    cardLabel: 'Established players with liquid rookie cards',
  },
  {
    id: 'set-completion',
    name: 'Set Completion',
    icon: '📋',
    tagline: 'Complete full sets for premium value',
    description: 'Build complete sets of specific card products. Complete sets often sell for more than the sum of individual cards because collectors value the accomplishment and display potential. The PSA Set Registry formalizes this approach — top-ranked sets in premier products can sell for 2-5x the individual card values combined.',
    riskLevel: 'Low',
    riskColor: 'emerald',
    timeHorizon: '1-3 years',
    entryBudget: '$200-10,000+',
    expectedReturn: '20-100% premium over individual card values',
    bestFor: 'Completionists (like Mia persona), organized collectors, long-term hobbyists',
    steps: [
      'Choose a set that is achievable and has collector demand (Topps flagship, Prizm, Upper Deck)',
      'Use our Set Completion Cost tool to estimate total investment',
      'Buy commons and low-value cards first (they are cheapest and easy to find)',
      'Save key cards (rookies, stars, short prints) for last when you know you are committed',
      'Grade the complete set with PSA for maximum registry and resale value',
    ],
    pros: ['Built-in premium for complete sets', 'PSA Set Registry adds value and prestige', 'Enjoyable pursuit — the hunt is part of the fun', 'Lower individual card risk (spread across dozens of cards)', 'Beautiful display pieces'],
    cons: ['High total investment for premium sets', 'Last few cards can be expensive (short prints, key rookies)', 'Time-intensive to complete', 'Set values can decline if the product falls out of favor', 'Storage requirements for large sets'],
    cardFilter: (c) => {
      const raw = parseValue(c.estimatedValueRaw);
      return raw >= 1 && raw <= 25 && !c.rookie;
    },
    cardSort: (a, b) => a.set.localeCompare(b.set) || a.year - b.year,
    cardLabel: 'Affordable set-building cards',
  },
];

function StrategyCard({ strategy, isActive, onClick }: { strategy: Strategy; isActive: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`text-left p-4 rounded-xl border transition-all w-full ${isActive ? `bg-${strategy.riskColor}-950/30 border-${strategy.riskColor}-600/50` : 'bg-gray-900/50 border-gray-800/50 hover:border-gray-700'}`}
    >
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{strategy.icon}</span>
        <div>
          <div className="text-white font-bold text-sm">{strategy.name}</div>
          <div className="text-gray-500 text-xs">{strategy.tagline}</div>
        </div>
      </div>
      <div className="flex gap-3 text-xs">
        <span className={`text-${strategy.riskColor}-400`}>{strategy.riskLevel} Risk</span>
        <span className="text-gray-600">|</span>
        <span className="text-gray-500">{strategy.timeHorizon}</span>
      </div>
    </button>
  );
}

export default function InvestingPlaybookClient() {
  const [activeStrategy, setActiveStrategy] = useState<string>('value');
  const [showCards, setShowCards] = useState(false);

  const strategy = strategies.find(s => s.id === activeStrategy)!;

  const exampleCards = useMemo(() => {
    return sportsCards.filter(strategy.cardFilter).sort(strategy.cardSort).slice(0, 8);
  }, [activeStrategy]);

  const riskBg = strategy.riskLevel === 'Low' ? 'bg-emerald-500/20 text-emerald-400' : strategy.riskLevel === 'Medium' ? 'bg-amber-500/20 text-amber-400' : strategy.riskLevel === 'High' ? 'bg-rose-500/20 text-rose-400' : 'bg-red-500/20 text-red-400';

  return (
    <div>
      {/* Strategy Selector */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        {strategies.map(s => (
          <StrategyCard key={s.id} strategy={s} isActive={activeStrategy === s.id} onClick={() => { setActiveStrategy(s.id); setShowCards(false); }} />
        ))}
      </div>

      {/* Active Strategy Detail */}
      <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{strategy.icon}</span>
          <div>
            <h2 className="text-2xl font-bold text-white">{strategy.name}</h2>
            <p className="text-gray-500 text-sm">{strategy.tagline}</p>
          </div>
        </div>

        <p className="text-gray-400 text-sm leading-relaxed mb-6">{strategy.description}</p>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-gray-800/40 rounded-lg p-3">
            <div className="text-gray-500 text-[10px] uppercase mb-1">Risk Level</div>
            <span className={`text-xs px-2 py-1 rounded-full ${riskBg}`}>{strategy.riskLevel}</span>
          </div>
          <div className="bg-gray-800/40 rounded-lg p-3">
            <div className="text-gray-500 text-[10px] uppercase mb-1">Time Horizon</div>
            <div className="text-white text-sm font-medium">{strategy.timeHorizon}</div>
          </div>
          <div className="bg-gray-800/40 rounded-lg p-3">
            <div className="text-gray-500 text-[10px] uppercase mb-1">Entry Budget</div>
            <div className="text-white text-sm font-medium">{strategy.entryBudget}</div>
          </div>
          <div className="bg-gray-800/40 rounded-lg p-3">
            <div className="text-gray-500 text-[10px] uppercase mb-1">Expected Return</div>
            <div className="text-emerald-400 text-sm font-medium">{strategy.expectedReturn}</div>
          </div>
        </div>

        <div className="text-xs text-gray-600 mb-6">Best for: {strategy.bestFor}</div>

        {/* Step-by-Step Playbook */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-white mb-3">Step-by-Step Playbook</h3>
          <div className="space-y-2">
            {strategy.steps.map((step, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-6 h-6 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400 text-xs font-bold flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pros & Cons */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-emerald-950/20 border border-emerald-800/30 rounded-lg p-4">
            <h4 className="text-emerald-400 font-bold text-sm mb-2">Advantages</h4>
            <ul className="space-y-1">
              {strategy.pros.map((p, i) => (
                <li key={i} className="text-gray-400 text-xs flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">+</span> {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-rose-950/20 border border-rose-800/30 rounded-lg p-4">
            <h4 className="text-rose-400 font-bold text-sm mb-2">Risks</h4>
            <ul className="space-y-1">
              {strategy.cons.map((c, i) => (
                <li key={i} className="text-gray-400 text-xs flex items-start gap-2">
                  <span className="text-rose-500 mt-0.5">-</span> {c}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Example Cards */}
        <div>
          <button onClick={() => setShowCards(!showCards)} className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
            {showCards ? 'Hide Example Cards' : `Show Example Cards (${exampleCards.length})`} &rarr;
          </button>
          {showCards && (
            <div className="mt-3 space-y-2">
              <div className="text-gray-600 text-xs mb-2">{strategy.cardLabel}</div>
              {exampleCards.map(card => (
                <Link
                  key={card.slug}
                  href={`/sports/${card.slug}`}
                  className="flex items-center gap-3 p-3 bg-gray-800/40 rounded-lg hover:bg-gray-800/70 transition-colors"
                >
                  <span className="text-base">{sportIcons[card.sport]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium truncate">{card.name}</div>
                    <div className="text-gray-500 text-xs">{card.player} &middot; ${parseValue(card.estimatedValueRaw)} raw &middot; ${parseValue(card.estimatedValueGem)} gem</div>
                  </div>
                  {card.rookie && <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded flex-shrink-0">RC</span>}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-4 text-xs text-gray-600 leading-relaxed">
        <strong className="text-gray-500">Disclaimer:</strong> This playbook is for educational purposes only. Sports cards are speculative investments with no guaranteed returns. Past performance does not predict future results. Card values shown are estimates and may not reflect current market prices. Always do your own research before investing, and never invest more than you can afford to lose.
      </div>
    </div>
  );
}
