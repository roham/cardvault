'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

function parseValue(raw: string): number {
  const m = raw.match(/\$[\d,]+/);
  if (!m) return 0;
  return parseInt(m[0].replace(/[$,]/g, ''), 10);
}

function parseGemValue(gem: string): number {
  const m = gem.match(/\$[\d,]+/);
  if (!m) return 0;
  return parseInt(m[0].replace(/[$,]/g, ''), 10);
}

const SPORT_COLORS: Record<string, string> = {
  baseball: 'text-red-400',
  basketball: 'text-orange-400',
  football: 'text-blue-400',
  hockey: 'text-cyan-400',
};

const SPORT_BG: Record<string, string> = {
  baseball: 'bg-red-950/40 border-red-800/40',
  basketball: 'bg-orange-950/40 border-orange-800/40',
  football: 'bg-blue-950/40 border-blue-800/40',
  hockey: 'bg-cyan-950/40 border-cyan-800/40',
};

interface FlipScore {
  overall: number;
  liquidity: number;
  margin: number;
  demand: number;
  timing: number;
  risk: number;
  verdict: string;
  verdictColor: string;
  verdictBg: string;
  timeToSell: string;
  bestPlatform: string;
  suggestedPrice: string;
  tips: string[];
}

function getMonthIndex(): number {
  return new Date().getMonth();
}

function computeFlipScore(card: typeof sportsCards[0]): FlipScore {
  const rawVal = parseValue(card.estimatedValueRaw);
  const gemVal = parseGemValue(card.estimatedValueGem);
  const month = getMonthIndex();
  const currentYear = 2026;
  const cardAge = currentYear - card.year;

  // Count how many cards this player has (proxy for fame)
  const playerCards = sportsCards.filter(c => c.player === card.player).length;

  // --- LIQUIDITY (0-100) ---
  // Based on player popularity (card count), sport market size, and value range
  const sportLiquidityBase: Record<string, number> = { baseball: 70, basketball: 75, football: 80, hockey: 55 };
  const sportLiq = sportLiquidityBase[card.sport] || 60;
  const fameLiq = Math.min(playerCards * 8, 40); // More cards = more famous = more liquid
  const valueLiq = rawVal >= 5 && rawVal <= 200 ? 30 : rawVal > 200 ? 20 : rawVal < 5 ? 10 : 25; // Sweet spot $5-$200
  const liquidity = Math.min(Math.round((sportLiq * 0.4) + fameLiq + valueLiq), 100);

  // --- MARGIN POTENTIAL (0-100) ---
  // Spread between buy price and sell price after fees (~13% eBay + 3% shipping)
  const fees = 0.16; // ~16% total selling costs
  const buyDiscount = 0.85; // Assume you can buy at 85% of market
  const effectiveBuy = rawVal * buyDiscount;
  const effectiveSell = rawVal * (1 - fees);
  const spreadPct = effectiveBuy > 0 ? ((effectiveSell - effectiveBuy) / effectiveBuy) * 100 : 0;
  // Grading uplift potential
  const gradingUplift = gemVal > 0 && rawVal > 0 ? (gemVal / rawVal) : 1;
  const gradingBonus = gradingUplift > 5 ? 25 : gradingUplift > 3 ? 15 : gradingUplift > 2 ? 10 : 0;
  const marginBase = spreadPct > 0 ? Math.min(Math.round(spreadPct * 3), 60) : 15;
  const margin = Math.min(marginBase + gradingBonus + (card.rookie ? 10 : 0), 100);

  // --- DEMAND TREND (0-100) ---
  // Seasonal + rookie + era factors
  const rookieDemand = card.rookie ? 25 : 0;
  const modernDemand = cardAge <= 3 ? 20 : cardAge <= 10 ? 15 : cardAge <= 30 ? 10 : 5;
  const vintagePremium = cardAge > 50 ? 15 : cardAge > 30 ? 10 : 0;
  // Sport-specific seasonal demand
  const sportSeasonalDemand: Record<string, number[]> = {
    baseball: [40, 50, 70, 80, 60, 55, 65, 60, 55, 75, 50, 40], // peaks: spring training, opening day, playoffs
    basketball: [60, 55, 50, 45, 50, 70, 55, 50, 55, 70, 65, 60], // peaks: draft (June), playoffs
    football: [70, 80, 55, 75, 65, 50, 55, 65, 70, 60, 55, 60], // peaks: SB (Feb), draft (Apr)
    hockey: [55, 50, 55, 65, 60, 75, 50, 50, 55, 65, 55, 50], // peaks: playoffs, draft
  };
  const seasonalBase = (sportSeasonalDemand[card.sport] || Array(12).fill(50))[month];
  const demand = Math.min(Math.round((seasonalBase * 0.4) + rookieDemand + modernDemand + vintagePremium), 100);

  // --- SEASONAL TIMING (0-100) ---
  // How good is RIGHT NOW for flipping this sport
  const timingScores: Record<string, number[]> = {
    baseball: [30, 45, 65, 80, 60, 50, 70, 55, 50, 85, 55, 35], // Best: Apr (opening), Oct (WS)
    basketball: [65, 60, 50, 70, 75, 85, 55, 45, 50, 70, 65, 60], // Best: Jun (draft/finals), Apr-May (playoffs)
    football: [60, 90, 55, 80, 70, 50, 55, 70, 75, 55, 50, 55], // Best: Feb (SB), Apr (draft)
    hockey: [50, 45, 55, 70, 65, 85, 55, 45, 50, 60, 50, 45], // Best: Jun (Cup/draft), Apr (playoffs)
  };
  // Current month is April (index 3)
  const timing = (timingScores[card.sport] || Array(12).fill(50))[month];

  // --- RISK LEVEL (0-100, higher = LESS risk = better for flipping) ---
  // Inverted: high score = low risk = good
  const valueRisk = rawVal > 500 ? 30 : rawVal > 100 ? 50 : rawVal > 20 ? 70 : rawVal > 5 ? 60 : 40;
  const eraRisk = cardAge > 50 ? 80 : cardAge > 20 ? 65 : cardAge > 5 ? 50 : 35; // Vintage = stable
  const rookieRisk = card.rookie && cardAge <= 3 ? -15 : 0; // Recent rookies = volatile
  const risk = Math.min(Math.max(valueRisk + (eraRisk > 60 ? 15 : 0) + rookieRisk, 0), 100);

  // --- OVERALL SCORE ---
  const overall = Math.round(
    liquidity * 0.20 +
    margin * 0.25 +
    demand * 0.20 +
    timing * 0.15 +
    risk * 0.20
  );

  // --- VERDICT ---
  let verdict: string, verdictColor: string, verdictBg: string;
  if (overall >= 75) { verdict = 'HOT FLIP'; verdictColor = 'text-green-400'; verdictBg = 'bg-green-950/60 border-green-700/50'; }
  else if (overall >= 60) { verdict = 'GOOD FLIP'; verdictColor = 'text-emerald-400'; verdictBg = 'bg-emerald-950/60 border-emerald-700/50'; }
  else if (overall >= 45) { verdict = 'HOLD'; verdictColor = 'text-amber-400'; verdictBg = 'bg-amber-950/60 border-amber-700/50'; }
  else if (overall >= 30) { verdict = 'RISKY'; verdictColor = 'text-orange-400'; verdictBg = 'bg-orange-950/60 border-orange-700/50'; }
  else { verdict = 'AVOID'; verdictColor = 'text-red-400'; verdictBg = 'bg-red-950/60 border-red-700/50'; }

  // --- TIME TO SELL ---
  let timeToSell: string;
  if (liquidity >= 80 && rawVal <= 100) timeToSell = '1-3 days';
  else if (liquidity >= 60 && rawVal <= 200) timeToSell = '3-7 days';
  else if (liquidity >= 40) timeToSell = '1-2 weeks';
  else if (rawVal > 500) timeToSell = '2-4 weeks';
  else timeToSell = '1-3 weeks';

  // --- BEST PLATFORM ---
  let bestPlatform: string;
  if (rawVal >= 500) bestPlatform = 'eBay Auction (7-day)';
  else if (rawVal >= 100) bestPlatform = 'eBay Buy It Now';
  else if (rawVal >= 20) bestPlatform = 'eBay / Mercari';
  else if (rawVal >= 5) bestPlatform = 'Mercari / Card Shows';
  else bestPlatform = 'Card Shows / Lots';

  // --- SUGGESTED PRICE ---
  const listPrice = Math.round(rawVal * 1.05); // Slight premium for BIN
  const suggestedPrice = rawVal >= 5 ? `$${listPrice.toLocaleString()} BIN` : `$${Math.max(rawVal, 1)} lot`;

  // --- TIPS ---
  const tips: string[] = [];
  if (card.rookie && cardAge <= 3) tips.push('Recent rookie — price volatile. Sell into hype, not after.');
  if (card.rookie && cardAge > 3) tips.push('Established rookie card — stable demand from set builders.');
  if (gradingUplift > 3) tips.push(`Grade-and-flip potential: ${gradingUplift.toFixed(1)}x uplift to gem mint.`);
  if (rawVal < 10) tips.push('Low-value card — bundle in lots of 5-10 similar cards for better margins.');
  if (rawVal > 200) tips.push('High-value card — use eBay authenticity guarantee for buyer confidence.');
  if (timing >= 70) tips.push(`Great timing! ${card.sport} cards are in peak demand right now.`);
  if (timing < 40) tips.push(`Off-season for ${card.sport} — consider holding for a better window.`);
  if (cardAge > 30) tips.push('Vintage card — emphasize condition and era in your listing title.');
  if (playerCards >= 5) tips.push(`Popular player (${playerCards} cards in DB) — strong buyer pool.`);
  if (liquidity < 40) tips.push('Lower liquidity — price competitively and consider Best Offer.');

  return { overall, liquidity, margin, demand, timing, risk, verdict, verdictColor, verdictBg, timeToSell, bestPlatform, suggestedPrice, tips };
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-400 w-20 shrink-0">{label}</span>
      <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-mono text-gray-300 w-8 text-right">{value}</span>
    </div>
  );
}

export default function FlipScorerClient() {
  const [query, setQuery] = useState('');
  const [sportFilter, setSportFilter] = useState<string>('all');
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  const searchResults = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    return sportsCards
      .filter(c =>
        (sportFilter === 'all' || c.sport === sportFilter) &&
        (c.name.toLowerCase().includes(q) || c.player.toLowerCase().includes(q))
      )
      .slice(0, 12);
  }, [query, sportFilter]);

  const selectedCard = useMemo(() => {
    if (!selectedSlug) return null;
    return sportsCards.find(c => c.slug === selectedSlug) || null;
  }, [selectedSlug]);

  const flipScore = useMemo(() => {
    if (!selectedCard) return null;
    return computeFlipScore(selectedCard);
  }, [selectedCard]);

  const selectCard = useCallback((slug: string) => {
    setSelectedSlug(slug);
    setQuery('');
    setShowResults(false);
  }, []);

  const sportButtons = ['all', 'baseball', 'basketball', 'football', 'hockey'] as const;

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="bg-gray-900/60 border border-gray-800/60 rounded-xl p-4 sm:p-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {sportButtons.map(s => (
            <button
              key={s}
              onClick={() => setSportFilter(s)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                sportFilter === s
                  ? 'bg-purple-900/60 border-purple-600/50 text-purple-300'
                  : 'bg-gray-800/40 border-gray-700/40 text-gray-400 hover:text-white hover:border-gray-600/50'
              }`}
            >
              {s === 'all' ? 'All Sports' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setShowResults(true); }}
            onFocus={() => setShowResults(true)}
            placeholder="Search any card or player..."
            className="w-full bg-gray-800/60 border border-gray-700/50 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-purple-500/50 placeholder:text-gray-500"
          />
          {showResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-700/60 rounded-lg shadow-xl z-20 max-h-72 overflow-y-auto">
              {searchResults.map(c => (
                <button
                  key={c.slug}
                  onClick={() => selectCard(c.slug)}
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-800/60 flex items-center gap-3 border-b border-gray-800/40 last:border-0"
                >
                  <span className={`text-[10px] font-bold uppercase ${SPORT_COLORS[c.sport] || 'text-gray-400'}`}>{c.sport.slice(0, 3)}</span>
                  <span className="text-sm text-white truncate flex-1">{c.name}</span>
                  <span className="text-xs text-gray-500">{c.estimatedValueRaw.split('(')[0].trim()}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {selectedCard && flipScore && (
        <div className="space-y-4">
          {/* Card Info + Overall Score */}
          <div className="bg-gray-900/60 border border-gray-800/60 rounded-xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${SPORT_BG[selectedCard.sport] || ''} ${SPORT_COLORS[selectedCard.sport] || ''}`}>
                    {selectedCard.sport}
                  </span>
                  {selectedCard.rookie && (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/40 text-amber-400">RC</span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-white mb-1 truncate">{selectedCard.name}</h3>
                <p className="text-sm text-gray-400">{selectedCard.player} &middot; {selectedCard.year} &middot; {selectedCard.set}</p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="text-gray-400">Raw: <span className="text-white font-medium">{selectedCard.estimatedValueRaw.split('(')[0].trim()}</span></span>
                  <span className="text-gray-400">Gem: <span className="text-emerald-400 font-medium">{selectedCard.estimatedValueGem.split('(')[0].trim()}</span></span>
                </div>
              </div>

              {/* Big Score Circle */}
              <div className="flex flex-col items-center shrink-0">
                <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center ${
                  flipScore.overall >= 75 ? 'border-green-500 bg-green-950/30' :
                  flipScore.overall >= 60 ? 'border-emerald-500 bg-emerald-950/30' :
                  flipScore.overall >= 45 ? 'border-amber-500 bg-amber-950/30' :
                  flipScore.overall >= 30 ? 'border-orange-500 bg-orange-950/30' :
                  'border-red-500 bg-red-950/30'
                }`}>
                  <span className="text-3xl font-bold text-white">{flipScore.overall}</span>
                </div>
                <span className={`text-sm font-bold mt-2 ${flipScore.verdictColor}`}>{flipScore.verdict}</span>
              </div>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="bg-gray-900/60 border border-gray-800/60 rounded-xl p-4 sm:p-6">
            <h4 className="text-sm font-semibold text-white mb-4">Flip Score Breakdown</h4>
            <div className="space-y-3">
              <ScoreBar label="Liquidity" value={flipScore.liquidity} color="bg-blue-500" />
              <ScoreBar label="Margin" value={flipScore.margin} color="bg-green-500" />
              <ScoreBar label="Demand" value={flipScore.demand} color="bg-purple-500" />
              <ScoreBar label="Timing" value={flipScore.timing} color="bg-amber-500" />
              <ScoreBar label="Risk" value={flipScore.risk} color="bg-cyan-500" />
            </div>
            <p className="text-[11px] text-gray-500 mt-3">Liquidity = ease of sale &middot; Margin = profit potential &middot; Demand = current market interest &middot; Timing = seasonal window &middot; Risk = stability (higher = safer)</p>
          </div>

          {/* Action Panel */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-gray-900/60 border border-gray-800/60 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">Time to Sell</p>
              <p className="text-lg font-bold text-white">{flipScore.timeToSell}</p>
            </div>
            <div className="bg-gray-900/60 border border-gray-800/60 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">Best Platform</p>
              <p className="text-sm font-bold text-white">{flipScore.bestPlatform}</p>
            </div>
            <div className="bg-gray-900/60 border border-gray-800/60 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">List Price</p>
              <p className="text-lg font-bold text-emerald-400">{flipScore.suggestedPrice}</p>
            </div>
          </div>

          {/* Tips */}
          {flipScore.tips.length > 0 && (
            <div className="bg-gray-900/60 border border-gray-800/60 rounded-xl p-4 sm:p-6">
              <h4 className="text-sm font-semibold text-white mb-3">Flip Tips for This Card</h4>
              <ul className="space-y-2">
                {flipScore.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-purple-400 shrink-0 mt-0.5">&#9656;</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Links */}
          <div className="flex flex-wrap gap-3">
            <Link href={`/sports/${selectedCard.slug}`} className="text-sm text-purple-400 hover:text-purple-300 underline underline-offset-2">
              View Card Details
            </Link>
            <Link href={`/players/${selectedCard.player.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')}`} className="text-sm text-purple-400 hover:text-purple-300 underline underline-offset-2">
              Player Profile
            </Link>
            <a href={selectedCard.ebaySearchUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-purple-400 hover:text-purple-300 underline underline-offset-2">
              Search eBay
            </a>
            <Link href="/tools/flip-profit" className="text-sm text-purple-400 hover:text-purple-300 underline underline-offset-2">
              Flip Profit Calculator
            </Link>
            <Link href="/tools/flip-window" className="text-sm text-purple-400 hover:text-purple-300 underline underline-offset-2">
              Flip Window Calendar
            </Link>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!selectedCard && (
        <div className="bg-gray-900/40 border border-gray-800/40 rounded-xl p-8 text-center">
          <p className="text-4xl mb-3">&#128200;</p>
          <p className="text-gray-400">Search for any card above to get its flip score</p>
          <p className="text-xs text-gray-600 mt-2">Scores combine liquidity, margins, demand, timing, and risk into one number</p>
        </div>
      )}
    </div>
  );
}
