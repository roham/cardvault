'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

type Category = 'all' | 'buying' | 'selling' | 'market' | 'valuation';
type SelfRating = 'yes' | 'sometimes' | 'no' | null;

interface Bias {
  id: string;
  name: string;
  icon: string;
  category: 'buying' | 'selling' | 'market' | 'valuation';
  severity: number; // 1-5
  description: string;
  hobbyExample: string;
  howToOvercome: string;
  scenario: string; // self-assessment question
}

const BIASES: Bias[] = [
  {
    id: 'fomo',
    name: 'FOMO (Fear of Missing Out)',
    icon: '😰',
    category: 'buying',
    severity: 5,
    description: 'The anxiety that you will miss a great deal or a card will skyrocket in price if you do not buy immediately. Leads to impulse purchases without proper research.',
    hobbyExample: 'A rookie hits a walk-off home run and his Bowman Chrome goes from $20 to $60 overnight. You panic-buy at $55, but within a week it settles back to $30 as hype fades. The performance spike was real, but the price spike was emotional.',
    howToOvercome: 'Set a 24-hour cooling-off rule for any purchase over $50. If the deal is still available tomorrow and still makes sense, buy it then. Most "once in a lifetime" deals happen every week.',
    scenario: 'You see a card spiking on eBay after a big game. Do you feel pressure to buy immediately before it goes higher?',
  },
  {
    id: 'anchoring',
    name: 'Anchoring Bias',
    icon: '⚓',
    category: 'buying',
    severity: 4,
    description: 'Over-relying on the first price you see for a card. If you first see a Trout PSA 10 listed at $800, a $600 listing feels like a steal — even if the actual market value is $450.',
    hobbyExample: 'A dealer at a card show prices a raw Wembanyama Prizm at $300. You negotiate down to $200 and feel great — but eBay sold listings show the card regularly sells for $140-160. The high anchor made a bad deal feel like a win.',
    howToOvercome: 'Always check eBay sold listings and 130point before buying. The actual sold price is the only anchor that matters, not asking prices from dealers or marketplace listings.',
    scenario: 'When shopping for cards, do you feel like you got a deal just because you paid less than the asking price, without checking actual comps?',
  },
  {
    id: 'bandwagon',
    name: 'Bandwagon Effect',
    icon: '🚂',
    category: 'buying',
    severity: 4,
    description: 'Buying cards just because everyone else is buying them. Social media hype creates a rush into specific players or products, pushing prices above sustainable levels.',
    hobbyExample: 'A TikTok video goes viral showing someone pulling a valuable card from a new product. Suddenly every breaker and collector rushes to buy the same product, creating artificial scarcity and price inflation. Within months, supply catches up and prices crash.',
    howToOvercome: 'Ask yourself: "Would I buy this card if nobody on social media was talking about it?" If the answer is no, you are following the crowd, not making a rational investment.',
    scenario: 'Have you bought a card or product mainly because you saw others on social media excited about it?',
  },
  {
    id: 'endowment',
    name: 'Endowment Effect',
    icon: '💎',
    category: 'selling',
    severity: 5,
    description: 'Overvaluing cards you own simply because you own them. Your PSA 9 Jeter feels worth $500 to you, but the market says $350. Ownership creates emotional attachment that distorts perceived value.',
    hobbyExample: 'You pulled a graded rookie card from a break two years ago. Comps show $200, but you refuse to sell under $300 because of the memory of pulling it. That $100 premium is the endowment effect — the story is worth something to you, but nothing to a buyer.',
    howToOvercome: 'Price your cards as if you were buying them, not selling them. Would you pay $300 for that card from a stranger? If not, it is not worth $300.',
    scenario: 'Do you price your cards for sale higher than what you would be willing to pay if you were the buyer?',
  },
  {
    id: 'loss-aversion',
    name: 'Loss Aversion',
    icon: '📉',
    category: 'selling',
    severity: 5,
    description: 'The pain of losing $100 on a card feels twice as bad as the pleasure of gaining $100. This causes you to hold declining cards too long, hoping they will recover.',
    hobbyExample: 'You bought a Trae Young Prizm PSA 10 for $400 in 2021. It is now worth $120. Instead of selling and redeploying that $120 into a better investment, you hold and hope — watching the value drop to $80. The loss already happened; holding just makes it worse.',
    howToOvercome: 'Ask: "If I had $120 cash right now, would I buy this exact card?" If not, sell it. What you paid is irrelevant — only what you can do with the current value matters.',
    scenario: 'Do you avoid selling cards at a loss, even when you know the card is unlikely to recover?',
  },
  {
    id: 'sunk-cost',
    name: 'Sunk Cost Fallacy',
    icon: '🕳️',
    category: 'selling',
    severity: 4,
    description: 'Continuing to invest in a failing card or collection because of what you have already spent. "I have $2,000 into this player, I cannot stop now."',
    hobbyExample: 'You have spent $3,000 grading 40 cards of a single player, and most came back PSA 8 or lower. Instead of cutting losses, you send 20 more hoping the grades improve — throwing good money after bad because you cannot write off the original investment.',
    howToOvercome: 'Past spending is gone. Every new dollar should be evaluated on its own merits. Ask: "Ignoring what I have already spent, is this the best use of my next $100?"',
    scenario: 'Have you continued spending on a player or product mainly because you have already invested a lot in it?',
  },
  {
    id: 'herd',
    name: 'Herd Mentality',
    icon: '🐑',
    category: 'market',
    severity: 4,
    description: 'Following the collective behavior of other collectors without independent analysis. When everyone says "buy rookies," you buy rookies. When panic selling starts, you panic sell too.',
    hobbyExample: 'During the 2020-2021 card boom, the herd said "everything goes up forever." Collectors took out loans to buy cards. When the market corrected in 2022, the same herd panic-sold at 40-60% losses. Independent thinkers who bought during the panic got cards at historic lows.',
    howToOvercome: 'Develop your own thesis before reading others. Write down why you are buying or selling a card. If your reason is "because everyone else is," that is not a thesis — it is gambling.',
    scenario: 'When the market drops and others are panic-selling, do you feel compelled to sell too?',
  },
  {
    id: 'recency',
    name: 'Recency Bias',
    icon: '📅',
    category: 'market',
    severity: 3,
    description: 'Giving too much weight to recent events and too little to long-term trends. A player\'s hot week feels more important than their 5-year career trajectory.',
    hobbyExample: 'A quarterback throws 4 touchdowns in a nationally televised game and his cards spike 30%. You assume this is the new normal. But his career average is 1.8 TDs per game, and the spike reverses within two weeks. One game is not a trend.',
    howToOvercome: 'Always zoom out. Look at 6-month and 1-year price history, not just the last week. Seasonal patterns repeat — a hot start in April for a baseball player does not guarantee an All-Star season.',
    scenario: 'After a player has a great game, do you feel more confident buying their cards than you did the day before?',
  },
  {
    id: 'confirmation',
    name: 'Confirmation Bias',
    icon: '🔍',
    category: 'market',
    severity: 4,
    description: 'Seeking out information that confirms what you already believe and ignoring evidence that contradicts it. If you own a card, you notice every positive mention and dismiss every warning sign.',
    hobbyExample: 'You own 10 copies of a prospect. You follow every account that hypes the player and dismiss the scouting reports that highlight strikeout rates or injury concerns. When the player busts, you are blindsided — but the warning signs were there all along.',
    howToOvercome: 'Actively seek the bear case for every card you own. Before buying, find three reasons NOT to buy. If you cannot steelman the other side, you have not done enough research.',
    scenario: 'When you own a player, do you tend to follow mostly positive accounts and skip critical analysis?',
  },
  {
    id: 'availability',
    name: 'Availability Heuristic',
    icon: '🧠',
    category: 'valuation',
    severity: 3,
    description: 'Judging probability based on how easily examples come to mind. You remember the one card that 10x\'d, not the twenty that lost money. Dramatic wins are memorable; quiet losses are forgotten.',
    hobbyExample: 'You remember the collector who bought a Caleb Williams Prizm for $20 and sold it for $200 after draft night. What you forget: the dozens of other draft prospects whose cards went down after being drafted. The availability of the success story makes the strategy seem more reliable than it is.',
    howToOvercome: 'Track ALL your transactions, not just the wins. A simple spreadsheet showing every buy and sell reveals your true hit rate. Most flippers profit on 40-60% of trades — the other 40-60% are losses they do not post about.',
    scenario: 'Do success stories from social media make you feel more confident about your own card investments than your actual track record suggests?',
  },
  {
    id: 'overconfidence',
    name: 'Overconfidence Bias',
    icon: '👑',
    category: 'valuation',
    severity: 4,
    description: 'Believing you can predict card values better than you actually can. After a few successful flips, you start taking bigger risks, investing more per card, and doing less research.',
    hobbyExample: 'You correctly predicted the rise of three rookies in a row. Feeling like a market genius, you put $5,000 into a single prospect — 10 times your usual bet. The prospect gets injured in preseason and his cards drop 60%. One loss wiped out all your prior gains.',
    howToOvercome: 'Keep position sizes consistent regardless of confidence level. Never put more than 5-10% of your collection budget into a single card. Past success does not predict future results — even Warren Buffett limits position sizes.',
    scenario: 'After a few good trades, do you find yourself investing larger amounts with less research?',
  },
  {
    id: 'gamblers-fallacy',
    name: 'Gambler\'s Fallacy',
    icon: '🎰',
    category: 'valuation',
    severity: 3,
    description: 'Believing that past results affect future independent events. "I have opened 5 boxes with no hits — the next one HAS to hit." Each pack is independent; the universe does not owe you a pull.',
    hobbyExample: 'After opening 4 hobby boxes of Prizm with nothing over $20, you buy a 5th box thinking you are "due." Each box is an independent event with the same hit rates. Your odds on box 5 are exactly the same as box 1. The hobby does not keep score.',
    howToOvercome: 'Treat each purchase as a standalone decision. Ask: "Based on the EV of this product, is this a good buy?" If the math does not work on a per-box basis, buying more boxes does not fix it.',
    scenario: 'After several bad pulls or losing trades, do you feel like your luck is "due" to turn around?',
  },
];

const CATEGORIES: { key: Category; label: string; color: string }[] = [
  { key: 'all', label: 'All Biases', color: 'bg-purple-600' },
  { key: 'buying', label: 'Buying Biases', color: 'bg-blue-600' },
  { key: 'selling', label: 'Selling Biases', color: 'bg-red-600' },
  { key: 'market', label: 'Market Biases', color: 'bg-amber-600' },
  { key: 'valuation', label: 'Valuation Biases', color: 'bg-emerald-600' },
];

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  buying: { bg: 'bg-blue-950/60', border: 'border-blue-800/50', text: 'text-blue-400' },
  selling: { bg: 'bg-red-950/60', border: 'border-red-800/50', text: 'text-red-400' },
  market: { bg: 'bg-amber-950/60', border: 'border-amber-800/50', text: 'text-amber-400' },
  valuation: { bg: 'bg-emerald-950/60', border: 'border-emerald-800/50', text: 'text-emerald-400' },
};

function getSeverityLabel(s: number) {
  if (s >= 5) return { label: 'Critical', color: 'text-red-400', bar: 'bg-red-500' };
  if (s >= 4) return { label: 'High', color: 'text-orange-400', bar: 'bg-orange-500' };
  if (s >= 3) return { label: 'Moderate', color: 'text-yellow-400', bar: 'bg-yellow-500' };
  return { label: 'Low', color: 'text-green-400', bar: 'bg-green-500' };
}

function getGrade(score: number): { grade: string; label: string; color: string } {
  if (score >= 95) return { grade: 'S', label: 'Perfectly Rational', color: 'text-yellow-400' };
  if (score >= 85) return { grade: 'A', label: 'Highly Disciplined', color: 'text-emerald-400' };
  if (score >= 70) return { grade: 'B', label: 'Mostly Rational', color: 'text-blue-400' };
  if (score >= 55) return { grade: 'C', label: 'Average Collector', color: 'text-gray-300' };
  if (score >= 40) return { grade: 'D', label: 'Emotion-Driven', color: 'text-orange-400' };
  return { grade: 'F', label: 'Highly Emotional', color: 'text-red-400' };
}

export default function MarketPsychologyClient() {
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [expandedBias, setExpandedBias] = useState<string | null>(null);
  const [assessmentMode, setAssessmentMode] = useState(false);
  const [ratings, setRatings] = useState<Record<string, SelfRating>>({});
  const [showResults, setShowResults] = useState(false);

  const filteredBiases = useMemo(() => {
    if (activeCategory === 'all') return BIASES;
    return BIASES.filter(b => b.category === activeCategory);
  }, [activeCategory]);

  const assessmentScore = useMemo(() => {
    const answered = Object.values(ratings).filter(r => r !== null);
    if (answered.length === 0) return null;
    let total = 0;
    for (const r of answered) {
      if (r === 'no') total += 100;
      else if (r === 'sometimes') total += 50;
      // 'yes' = 0
    }
    return Math.round(total / answered.length);
  }, [ratings]);

  const answeredCount = Object.values(ratings).filter(r => r !== null).length;

  const handleRate = (biasId: string, rating: SelfRating) => {
    setRatings(prev => ({ ...prev, [biasId]: rating }));
  };

  const resetAssessment = () => {
    setRatings({});
    setShowResults(false);
  };

  return (
    <div className="space-y-8">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-purple-950/40 border border-purple-800/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-purple-300">{BIASES.length}</div>
          <div className="text-xs text-gray-500">Biases Covered</div>
        </div>
        <div className="bg-purple-950/40 border border-purple-800/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-purple-300">4</div>
          <div className="text-xs text-gray-500">Categories</div>
        </div>
        <div className="bg-purple-950/40 border border-purple-800/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-purple-300">{BIASES.reduce((a, b) => a + b.severity, 0)}</div>
          <div className="text-xs text-gray-500">Total Severity</div>
        </div>
        <div className="bg-purple-950/40 border border-purple-800/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-purple-300">{assessmentMode ? `${answeredCount}/${BIASES.length}` : '—'}</div>
          <div className="text-xs text-gray-500">Self-Assessment</div>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-3">
        <button
          onClick={() => { setAssessmentMode(false); setShowResults(false); }}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${!assessmentMode ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-gray-300'}`}
        >
          Learn the Biases
        </button>
        <button
          onClick={() => setAssessmentMode(true)}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${assessmentMode ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-gray-300'}`}
        >
          Self-Assessment Quiz
        </button>
      </div>

      {/* Category Filter */}
      {!assessmentMode && (
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${activeCategory === cat.key ? `${cat.color} text-white` : 'bg-gray-800 text-gray-400 hover:text-gray-300'}`}
            >
              {cat.label} {cat.key !== 'all' && `(${BIASES.filter(b => b.category === cat.key).length})`}
            </button>
          ))}
        </div>
      )}

      {/* Learn Mode */}
      {!assessmentMode && (
        <div className="space-y-4">
          {filteredBiases.map(bias => {
            const catColor = CATEGORY_COLORS[bias.category];
            const sev = getSeverityLabel(bias.severity);
            const isExpanded = expandedBias === bias.id;

            return (
              <div
                key={bias.id}
                className={`${catColor.bg} border ${catColor.border} rounded-xl overflow-hidden transition-all`}
              >
                <button
                  onClick={() => setExpandedBias(isExpanded ? null : bias.id)}
                  className="w-full text-left p-4 sm:p-5"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">{bias.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="text-white font-bold text-sm sm:text-base">{bias.name}</h3>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-xs font-medium ${catColor.text}`}>
                            {bias.category.charAt(0).toUpperCase() + bias.category.slice(1)}
                          </span>
                          <span className={`text-xs ${sev.color}`}>{sev.label}</span>
                        </div>
                      </div>
                      <p className="text-gray-400 text-xs sm:text-sm line-clamp-2">{bias.description}</p>
                      <div className="mt-2 flex items-center gap-1">
                        <span className="text-xs text-gray-600">Severity:</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className={`w-4 h-1.5 rounded-full ${i <= bias.severity ? sev.bar : 'bg-gray-700'}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className={`text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>&#9660;</span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 sm:px-5 pb-5 space-y-4 border-t border-gray-700/30 pt-4">
                    <div>
                      <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wide mb-1">Real Hobby Example</h4>
                      <p className="text-gray-300 text-sm">{bias.hobbyExample}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wide mb-1">How to Overcome It</h4>
                      <p className="text-gray-300 text-sm">{bias.howToOvercome}</p>
                    </div>
                    <div className="bg-gray-800/60 border border-gray-700/40 rounded-lg p-3">
                      <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wide mb-1">Self-Check Scenario</h4>
                      <p className="text-gray-400 text-sm italic">{bias.scenario}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Assessment Mode */}
      {assessmentMode && !showResults && (
        <div className="space-y-4">
          <div className="bg-purple-950/30 border border-purple-800/30 rounded-lg p-4">
            <p className="text-gray-300 text-sm">
              Answer honestly for each scenario. There are no wrong answers — this is about self-awareness.
              Rate each: <span className="text-red-400 font-medium">Yes</span> (this is me),{' '}
              <span className="text-amber-400 font-medium">Sometimes</span>, or{' '}
              <span className="text-emerald-400 font-medium">No</span> (not me).
            </p>
          </div>

          {BIASES.map((bias, idx) => {
            const catColor = CATEGORY_COLORS[bias.category];
            return (
              <div key={bias.id} className={`${catColor.bg} border ${catColor.border} rounded-xl p-4 sm:p-5`}>
                <div className="flex items-start gap-3">
                  <span className="text-gray-500 text-sm font-mono">{idx + 1}.</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{bias.icon}</span>
                      <span className={`text-xs font-medium ${catColor.text}`}>{bias.name}</span>
                    </div>
                    <p className="text-gray-300 text-sm mb-3">{bias.scenario}</p>
                    <div className="flex gap-2">
                      {([['yes', 'Yes', 'bg-red-600', 'bg-red-500/20 border-red-500/50'], ['sometimes', 'Sometimes', 'bg-amber-600', 'bg-amber-500/20 border-amber-500/50'], ['no', 'No', 'bg-emerald-600', 'bg-emerald-500/20 border-emerald-500/50']] as const).map(([value, label, activeColor, selectedBg]) => (
                        <button
                          key={value}
                          onClick={() => handleRate(bias.id, value)}
                          className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all border ${ratings[bias.id] === value ? `${selectedBg} text-white` : 'bg-gray-800/50 border-gray-700/50 text-gray-400 hover:text-gray-300'}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Show Results Button */}
          <div className="flex gap-3">
            <button
              onClick={() => answeredCount >= 6 && setShowResults(true)}
              disabled={answeredCount < 6}
              className={`flex-1 py-3 rounded-lg font-medium transition-all ${answeredCount >= 6 ? 'bg-purple-600 text-white hover:bg-purple-500' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}
            >
              See Results ({answeredCount}/{BIASES.length} answered{answeredCount < 6 ? ' — need at least 6' : ''})
            </button>
            <button
              onClick={resetAssessment}
              className="px-4 py-3 rounded-lg bg-gray-800 text-gray-400 hover:text-white transition-colors text-sm"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {assessmentMode && showResults && assessmentScore !== null && (
        <div className="space-y-6">
          {/* Score Card */}
          <div className="bg-purple-950/40 border border-purple-800/30 rounded-xl p-6 text-center">
            <h3 className="text-gray-400 text-sm uppercase tracking-wide mb-2">Your Collector Rationality Score</h3>
            <div className={`text-6xl font-black ${getGrade(assessmentScore).color} mb-1`}>
              {getGrade(assessmentScore).grade}
            </div>
            <div className="text-3xl font-bold text-white mb-1">{assessmentScore}/100</div>
            <div className={`text-sm font-medium ${getGrade(assessmentScore).color}`}>
              {getGrade(assessmentScore).label}
            </div>

            {/* Score bar */}
            <div className="mt-4 max-w-xs mx-auto">
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-purple-500 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${assessmentScore}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>Emotional</span>
                <span>Rational</span>
              </div>
            </div>
          </div>

          {/* Per-Bias Breakdown */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5">
            <h3 className="text-white font-bold mb-4">Your Bias Profile</h3>
            <div className="space-y-3">
              {BIASES.map(bias => {
                const rating = ratings[bias.id];
                if (!rating) return null;
                const colors = {
                  yes: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Affects You' },
                  sometimes: { bg: 'bg-amber-500/20', text: 'text-amber-400', label: 'Sometimes' },
                  no: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Not an Issue' },
                };
                const c = colors[rating];
                return (
                  <div key={bias.id} className={`flex items-center gap-3 ${c.bg} rounded-lg px-3 py-2`}>
                    <span className="text-lg">{bias.icon}</span>
                    <span className="text-gray-300 text-sm flex-1">{bias.name}</span>
                    <span className={`text-xs font-medium ${c.text}`}>{c.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tips for worst biases */}
          {(() => {
            const yesRated = BIASES.filter(b => ratings[b.id] === 'yes');
            if (yesRated.length === 0) return null;
            return (
              <div className="bg-purple-950/30 border border-purple-800/30 rounded-xl p-5">
                <h3 className="text-white font-bold mb-3">Your Top Actions</h3>
                <p className="text-gray-400 text-sm mb-4">Focus on overcoming these biases first — they have the biggest impact on your collecting decisions:</p>
                <div className="space-y-3">
                  {yesRated.sort((a, b) => b.severity - a.severity).slice(0, 5).map(bias => (
                    <div key={bias.id} className="bg-gray-800/40 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span>{bias.icon}</span>
                        <span className="text-white font-medium text-sm">{bias.name}</span>
                      </div>
                      <p className="text-emerald-400 text-xs">{bias.howToOvercome}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Share & Reset */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                const g = getGrade(assessmentScore);
                const text = `My Collector Rationality Score: ${g.grade} (${assessmentScore}/100) — ${g.label}\n\nTest yours at CardVault: cardvault-two.vercel.app/market-psychology`;
                navigator.clipboard.writeText(text);
              }}
              className="flex-1 py-2.5 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-500 transition-colors"
            >
              Copy Result
            </button>
            <button
              onClick={resetAssessment}
              className="flex-1 py-2.5 rounded-lg bg-gray-800 text-gray-400 text-sm font-medium hover:text-white transition-colors"
            >
              Retake Quiz
            </button>
          </div>
        </div>
      )}

      {/* How It Works */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
        <h2 className="text-white font-bold mb-4">Understanding Collector Psychology</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { title: 'Why It Matters', desc: 'Studies show cognitive biases cost investors 1-4% annually. In the card hobby — where emotions run higher — the cost is often much greater. Recognizing your biases is the first step to better decisions.' },
            { title: 'The 4 Categories', desc: 'Buying biases drive impulse purchases. Selling biases make you hold too long. Market biases cause herd behavior. Valuation biases distort what cards are really worth.' },
            { title: 'Self-Assessment', desc: 'Take the quiz to see which biases affect you most. Score ranges from 0 (all biases) to 100 (perfectly rational). Most collectors score 40-60 — awareness alone improves outcomes.' },
            { title: 'Practical Tips', desc: 'Each bias includes a real hobby example and a concrete strategy to overcome it. Start with your highest-severity biases for the biggest improvement in your collecting.' },
          ].map((item, idx) => (
            <div key={idx} className="bg-gray-900/50 rounded-lg p-4">
              <h3 className="text-purple-400 font-semibold text-sm mb-1">{item.title}</h3>
              <p className="text-gray-400 text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related Tools */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5">
        <h3 className="text-white font-bold mb-3">Tools to Fight Your Biases</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { href: '/tools/watchlist', label: 'Price Watchlist', desc: 'Track before buying' },
            { href: '/tools/flip-calc', label: 'Flip Calculator', desc: 'Check margins first' },
            { href: '/tools/portfolio-stress', label: 'Stress Test', desc: 'Prepare for drops' },
            { href: '/tools/collection-health', label: 'Collection Health', desc: 'Objective analysis' },
            { href: '/collecting-mistakes', label: '20 Mistakes', desc: 'Common traps' },
            { href: '/golden-rules', label: '25 Golden Rules', desc: 'Discipline framework' },
          ].map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="bg-gray-900/50 hover:bg-gray-700/50 border border-gray-700/40 rounded-lg p-3 transition-colors"
            >
              <div className="text-white text-xs font-medium">{link.label}</div>
              <div className="text-gray-500 text-xs">{link.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
