'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

/* ---------- Types ---------- */
interface Factor {
  name: string;
  score: number; // -2 to +2
  weight: number;
  reasoning: string;
  icon: string;
}

interface Prediction {
  direction: 'RISING' | 'FALLING' | 'STABLE';
  confidence: 'High' | 'Medium' | 'Low';
  score: number; // -100 to +100
  factors: Factor[];
  recommendation: string;
  timeframe: string;
}

function parseValue(s: string): number {
  const m = s.match(/\$([0-9,.]+)/);
  if (!m) return 0;
  return parseFloat(m[1].replace(/,/g, '')) || 0;
}

function fmt(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${n.toLocaleString()}`;
}

/* ---------- Prediction Engine ---------- */
function predictTrend(card: typeof sportsCards[0]): Prediction {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-11
  const cardAge = currentYear - card.year;
  const rawVal = parseValue(card.estimatedValueRaw);
  const gemVal = parseValue(card.estimatedValueGem);

  const factors: Factor[] = [];

  // Factor 1: Player Career Trajectory
  const isYoungPlayer = cardAge <= 3;
  const isMidCareer = cardAge > 3 && cardAge <= 8;

  if (card.rookie) {
    if (isYoungPlayer) {
      factors.push({ name: 'Player Trajectory', score: 2, weight: 25, reasoning: 'Recent rookie card with high upside if player develops into a star. Rookie premium is strongest in first 3 years.', icon: '\uD83D\uDCC8' });
    } else if (isMidCareer) {
      factors.push({ name: 'Player Trajectory', score: 1, weight: 25, reasoning: 'Established player with rookie card. Value has likely settled but could spike with career achievements (MVP, championship).', icon: '\uD83D\uDCCA' });
    } else {
      factors.push({ name: 'Player Trajectory', score: 0, weight: 25, reasoning: 'Veteran/retired player. Value is mostly driven by legacy and nostalgia rather than on-field performance.', icon: '\u27A1\uFE0F' });
    }
  } else {
    if (isYoungPlayer) {
      factors.push({ name: 'Player Trajectory', score: 1, weight: 25, reasoning: 'Recent non-rookie card. Player is still developing but this is not the flagship rookie card that collectors chase.', icon: '\uD83D\uDCCA' });
    } else {
      factors.push({ name: 'Player Trajectory', score: -1, weight: 25, reasoning: 'Non-rookie card of established player. Base cards typically decline as newer products release each year.', icon: '\uD83D\uDCC9' });
    }
  }

  // Factor 2: Card Age & Era
  if (cardAge <= 2) {
    factors.push({ name: 'Card Age', score: 1, weight: 15, reasoning: 'Current product still in the initial hype window. Value can swing sharply based on player performance.', icon: '\u2728' });
  } else if (cardAge <= 5) {
    factors.push({ name: 'Card Age', score: 0, weight: 15, reasoning: 'Recent product (2-5 years). The initial hype has settled and value is stabilizing at a fair market level.', icon: '\uD83D\uDCC5' });
  } else if (cardAge <= 20) {
    factors.push({ name: 'Card Age', score: -1, weight: 15, reasoning: 'Aging product. Most modern cards in this window decline unless the player becomes a Hall of Famer.', icon: '\uD83D\uDCC9' });
  } else if (cardAge <= 40) {
    factors.push({ name: 'Card Age', score: 1, weight: 15, reasoning: 'Vintage territory. Cards 20-40 years old are entering the nostalgia buying window as collectors gain purchasing power.', icon: '\uD83D\uDCC8' });
  } else {
    factors.push({ name: 'Card Age', score: 2, weight: 15, reasoning: 'True vintage (40+ years). Finite supply with growing collector base. These trend up long-term as condition-sensitive examples get scarcer.', icon: '\uD83D\uDD25' });
  }

  // Factor 3: Grade Premium Potential
  const gradeMultiplier = gemVal > 0 && rawVal > 0 ? gemVal / rawVal : 1;
  if (gradeMultiplier >= 5) {
    factors.push({ name: 'Grade Premium', score: 2, weight: 15, reasoning: `Gem mint commands ${gradeMultiplier.toFixed(1)}x raw value. Strong grading ROI potential makes this card attractive to submit.`, icon: '\uD83D\uDC8E' });
  } else if (gradeMultiplier >= 3) {
    factors.push({ name: 'Grade Premium', score: 1, weight: 15, reasoning: `Gem mint is ${gradeMultiplier.toFixed(1)}x raw value. Moderate grading premium supports demand.`, icon: '\uD83C\uDFC5' });
  } else if (gradeMultiplier >= 2) {
    factors.push({ name: 'Grade Premium', score: 0, weight: 15, reasoning: `Gem mint is ${gradeMultiplier.toFixed(1)}x raw value. Typical grade premium.`, icon: '\u27A1\uFE0F' });
  } else {
    factors.push({ name: 'Grade Premium', score: -1, weight: 15, reasoning: `Low grade premium (${gradeMultiplier.toFixed(1)}x). Less incentive to grade means less demand from the grading community.`, icon: '\uD83D\uDCC9' });
  }

  // Factor 4: Value Tier
  if (rawVal >= 100) {
    factors.push({ name: 'Value Tier', score: 1, weight: 15, reasoning: `High-value card (${fmt(rawVal)} raw). Cards in the $100+ range attract serious collectors and tend to hold value better.`, icon: '\uD83D\uDCB0' });
  } else if (rawVal >= 20) {
    factors.push({ name: 'Value Tier', score: 0, weight: 15, reasoning: `Mid-range card (${fmt(rawVal)} raw). Solid collector interest without the premium pricing barrier.`, icon: '\uD83D\uDCB2' });
  } else if (rawVal >= 5) {
    factors.push({ name: 'Value Tier', score: -1, weight: 15, reasoning: `Low-value card (${fmt(rawVal)} raw). Hard to maintain value after selling fees and shipping costs.`, icon: '\uD83D\uDCC9' });
  } else {
    factors.push({ name: 'Value Tier', score: -2, weight: 15, reasoning: `Common-level value (${fmt(rawVal)} raw). At this price point, cards rarely appreciate meaningfully.`, icon: '\u274C' });
  }

  // Factor 5: Seasonal Timing
  const sport = card.sport;
  let seasonalScore = 0;
  let seasonalReason = '';
  if (sport === 'football') {
    if (currentMonth >= 8 || currentMonth <= 1) { seasonalScore = 2; seasonalReason = 'Peak football season (Sep-Feb). Demand and prices are at their highest.'; }
    else if (currentMonth >= 2 && currentMonth <= 4) { seasonalScore = -1; seasonalReason = 'Football off-season. Prices typically dip 15-30% from peak.'; }
    else { seasonalScore = 0; seasonalReason = 'Pre-season period. Prices are recovering as draft hype builds.'; }
  } else if (sport === 'baseball') {
    if (currentMonth >= 2 && currentMonth <= 9) { seasonalScore = 1; seasonalReason = 'Baseball season active. Player performance drives daily price changes.'; }
    else if (currentMonth === 10) { seasonalScore = 2; seasonalReason = 'Playoff season! Cards of playoff players spike dramatically.'; }
    else { seasonalScore = -1; seasonalReason = 'Baseball off-season. Prices typically soften until spring training.'; }
  } else if (sport === 'basketball') {
    if (currentMonth >= 9 || currentMonth <= 5) { seasonalScore = 1; seasonalReason = 'Basketball season active. Steady demand from collectors following the action.'; }
    else { seasonalScore = -1; seasonalReason = 'NBA off-season. Free agency can cause spikes but overall demand dips.'; }
  } else if (sport === 'hockey') {
    if (currentMonth >= 9 || currentMonth <= 5) { seasonalScore = 1; seasonalReason = 'Hockey season active. Playoff push drives interest in key players.'; }
    else { seasonalScore = -1; seasonalReason = 'NHL off-season. Hockey card demand is lowest of all four major sports in summer.'; }
  }
  factors.push({ name: 'Seasonal Timing', score: seasonalScore, weight: 15, reasoning: seasonalReason, icon: '\uD83D\uDCC5' });

  // Factor 6: Market Conditions (2026 market snapshot)
  const marketConditions: Record<string, { score: number; reason: string }> = {
    baseball: { score: 1, reason: 'Baseball card market is strong in 2026. New collectors entering, Topps products selling well.' },
    basketball: { score: 1, reason: 'Basketball card market is recovering. Young stars like Wemby and Chet driving new interest.' },
    football: { score: 2, reason: 'Football cards are the hottest sport in 2026. NFL is the most popular US sport and card demand reflects it.' },
    hockey: { score: 0, reason: 'Hockey card market is the smallest of the four major sports. Steady but limited upside.' },
  };
  const mc = marketConditions[sport] || { score: 0, reason: 'Unknown sport market.' };
  factors.push({ name: 'Market Conditions', score: mc.score, weight: 15, reasoning: mc.reason, icon: '\uD83C\uDF10' });

  // Calculate overall score
  const totalWeight = factors.reduce((s, f) => s + f.weight, 0);
  const weightedScore = factors.reduce((s, f) => s + (f.score / 2) * f.weight, 0);
  const normalizedScore = Math.round((weightedScore / totalWeight) * 100);

  // Determine direction
  let direction: Prediction['direction'];
  if (normalizedScore >= 15) direction = 'RISING';
  else if (normalizedScore <= -15) direction = 'FALLING';
  else direction = 'STABLE';

  // Determine confidence
  const absScore = Math.abs(normalizedScore);
  let confidence: Prediction['confidence'];
  if (absScore >= 40) confidence = 'High';
  else if (absScore >= 20) confidence = 'Medium';
  else confidence = 'Low';

  // Recommendation
  let recommendation = '';
  if (direction === 'RISING' && confidence === 'High') {
    recommendation = 'Strong buy signal. This card has multiple positive factors aligned. Consider buying raw and grading for maximum upside.';
  } else if (direction === 'RISING') {
    recommendation = 'Positive outlook. Hold if you own it, consider buying if the price is right. Watch for confirmation of the trend.';
  } else if (direction === 'FALLING' && confidence === 'High') {
    recommendation = 'Consider selling. Multiple negative factors suggest this card will decline. Lock in current value before further drops.';
  } else if (direction === 'FALLING') {
    recommendation = 'Caution advised. The trend is negative but could reverse with player performance changes. Monitor closely.';
  } else {
    recommendation = 'Hold position. The card is likely to trade sideways in the near term. Wait for a catalyst before buying or selling.';
  }

  return {
    direction,
    confidence,
    score: normalizedScore,
    factors,
    recommendation,
    timeframe: '3-6 months',
  };
}

export default function TrendPredictor() {
  const [query, setQuery] = useState('');
  const [selectedCard, setSelectedCard] = useState<typeof sportsCards[0] | null>(null);

  const filtered = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    return sportsCards.filter(c =>
      c.name.toLowerCase().includes(q) || c.player.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [query]);

  const prediction = useMemo(() => {
    if (!selectedCard) return null;
    return predictTrend(selectedCard);
  }, [selectedCard]);

  function selectCard(card: typeof sportsCards[0]) {
    setSelectedCard(card);
    setQuery('');
  }

  const directionConfig = {
    RISING: { text: 'text-emerald-400', bg: 'bg-emerald-500/20 border-emerald-500/30', arrow: '\u2191' },
    FALLING: { text: 'text-red-400', bg: 'bg-red-500/20 border-red-500/30', arrow: '\u2193' },
    STABLE: { text: 'text-sky-400', bg: 'bg-sky-500/20 border-sky-500/30', arrow: '\u2192' },
  };

  return (
    <div className="space-y-8">
      {/* Search */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
        <h2 className="text-lg font-bold text-white mb-3">Search for a Card</h2>
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setSelectedCard(null); }}
          placeholder="Search by player name or card name..."
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
        />
        {filtered.length > 0 && (
          <div className="mt-2 bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
            {filtered.map(c => (
              <button
                key={c.slug}
                onClick={() => selectCard(c)}
                className="w-full text-left px-4 py-3 hover:bg-gray-700 border-b border-gray-700/50 last:border-0 transition-colors"
              >
                <div className="text-white text-sm font-medium">{c.name}</div>
                <div className="text-gray-500 text-xs">
                  {c.player} &middot; {c.sport} &middot; Raw: {c.estimatedValueRaw}
                  {c.rookie && <span className="ml-2 text-amber-400">RC</span>}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      {selectedCard && prediction && (() => {
        const dc = directionConfig[prediction.direction];
        return (
          <div className="space-y-6">
            {/* Card Info */}
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-white font-bold text-lg">{selectedCard.name}</h3>
                  <p className="text-gray-400 text-sm mt-1">
                    {selectedCard.player} &middot; {selectedCard.sport} &middot; {selectedCard.set}
                    {selectedCard.rookie && <span className="ml-2 text-amber-400 font-medium">Rookie Card</span>}
                  </p>
                  <div className="flex gap-4 mt-3">
                    <div>
                      <div className="text-xs text-gray-500">Raw Value</div>
                      <div className="text-white font-medium">{selectedCard.estimatedValueRaw}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Gem Mint Value</div>
                      <div className="text-emerald-400 font-medium">{selectedCard.estimatedValueGem}</div>
                    </div>
                  </div>
                </div>
                <a
                  href={selectedCard.ebaySearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-xs text-gray-400 hover:text-white transition-colors"
                >
                  Check eBay
                </a>
              </div>
            </div>

            {/* Prediction Banner */}
            <div className={`border rounded-xl p-6 ${dc.bg}`}>
              <div className="flex items-center gap-4 mb-3">
                <span className={`text-4xl font-black ${dc.text}`}>{dc.arrow}</span>
                <div>
                  <span className={`text-2xl font-black ${dc.text}`}>{prediction.direction}</span>
                  <span className="text-gray-400 text-sm ml-3">{prediction.confidence} Confidence</span>
                </div>
              </div>
              <p className="text-gray-300 text-sm">{prediction.recommendation}</p>
              <div className="mt-4 flex items-center gap-6 text-xs text-gray-400">
                <span>Score: {prediction.score > 0 ? '+' : ''}{prediction.score}/100</span>
                <span>Timeframe: {prediction.timeframe}</span>
              </div>

              {/* Score bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Bearish</span>
                  <span>Neutral</span>
                  <span>Bullish</span>
                </div>
                <div className="h-3 bg-gray-800 rounded-full overflow-hidden relative">
                  <div className="absolute inset-0 flex">
                    <div className="w-1/2 bg-gradient-to-r from-red-600/30 to-transparent" />
                    <div className="w-1/2 bg-gradient-to-l from-emerald-600/30 to-transparent" />
                  </div>
                  <div
                    className={`absolute top-0 h-full w-1 rounded ${prediction.score >= 0 ? 'bg-emerald-400' : 'bg-red-400'}`}
                    style={{ left: `${Math.max(2, Math.min(98, 50 + prediction.score / 2))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Factor Breakdown */}
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
              <h3 className="text-lg font-bold text-white mb-4">Factor Analysis</h3>
              <div className="space-y-4">
                {prediction.factors.map((factor, i) => (
                  <div key={i} className="border-b border-gray-800 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span>{factor.icon}</span>
                        <span className="text-white font-medium text-sm">{factor.name}</span>
                        <span className="text-gray-500 text-xs">({factor.weight}% weight)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {[-2, -1, 0, 1, 2].map(v => (
                          <div
                            key={v}
                            className={`w-5 h-5 rounded-full border text-xs flex items-center justify-center ${
                              v === factor.score
                                ? v > 0
                                  ? 'bg-emerald-500 border-emerald-400 text-white'
                                  : v < 0
                                    ? 'bg-red-500 border-red-400 text-white'
                                    : 'bg-gray-500 border-gray-400 text-white'
                                : 'border-gray-700 text-gray-600'
                            }`}
                          >
                            {v > 0 ? '+' : ''}{v}
                          </div>
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-400 text-xs leading-relaxed">{factor.reasoning}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Items */}
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
              <h3 className="text-lg font-bold text-white mb-3">What To Do</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className={`p-4 rounded-lg border ${prediction.direction === 'RISING' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-gray-800/50 border-gray-700/50'}`}>
                  <div className="text-sm font-bold text-emerald-400 mb-1">BUY</div>
                  <p className="text-xs text-gray-400">
                    {prediction.direction === 'RISING'
                      ? 'Favorable conditions. Check eBay for deals below estimated value.'
                      : 'Wait for the trend to improve before buying.'}
                  </p>
                </div>
                <div className={`p-4 rounded-lg border ${prediction.direction === 'STABLE' ? 'bg-sky-500/10 border-sky-500/30' : 'bg-gray-800/50 border-gray-700/50'}`}>
                  <div className="text-sm font-bold text-sky-400 mb-1">HOLD</div>
                  <p className="text-xs text-gray-400">
                    {prediction.direction === 'STABLE'
                      ? 'No urgency to act. Card is holding value. Wait for a catalyst.'
                      : prediction.direction === 'RISING'
                        ? 'Hold for further gains. The trend favors patience.'
                        : 'Consider holding only if you believe in a turnaround.'}
                  </p>
                </div>
                <div className={`p-4 rounded-lg border ${prediction.direction === 'FALLING' ? 'bg-red-500/10 border-red-500/30' : 'bg-gray-800/50 border-gray-700/50'}`}>
                  <div className="text-sm font-bold text-red-400 mb-1">SELL</div>
                  <p className="text-xs text-gray-400">
                    {prediction.direction === 'FALLING'
                      ? 'Negative factors suggest selling. Lock in value before further decline.'
                      : 'No immediate sell pressure. Hold or wait for peak conditions.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Empty state */}
      {!selectedCard && (
        <div className="bg-gray-900/60 border border-gray-800 border-dashed rounded-xl p-10 text-center">
          <div className="text-4xl mb-3">{'\uD83D\uDD2E'}</div>
          <p className="text-gray-400 mb-2">Search for any card to see the trend prediction.</p>
          <p className="text-gray-500 text-sm">We analyze 6 market factors to predict if your card will rise, fall, or stay stable.</p>
        </div>
      )}
    </div>
  );
}
