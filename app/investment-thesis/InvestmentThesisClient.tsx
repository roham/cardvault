'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { sportsCards, type SportsCard } from '@/data/sports-cards';

// --- Utility helpers ---

function parseValue(v: string): number {
  const m = v.match(/\$([0-9,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
}

function slugifyPlayer(name: string): string {
  return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/['']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function getEra(year: number): string {
  if (year < 1950) return 'Pre-War / Golden Age';
  if (year < 1970) return 'Post-War Vintage';
  if (year < 1980) return 'Vintage';
  if (year < 1994) return 'Junk Wax Era';
  if (year < 2010) return 'Modern Era';
  return 'Ultra-Modern';
}

function getPlayerAge(year: number): string {
  const age = 2026 - year;
  if (age <= 3) return 'Active Young Star';
  if (age <= 8) return 'Prime Career';
  if (age <= 15) return 'Established Veteran';
  if (age <= 30) return 'Retired / Legend';
  return 'All-Time Great';
}

function getValueTier(val: number): string {
  if (val < 5) return 'Budget';
  if (val < 25) return 'Affordable';
  if (val < 100) return 'Mid-Range';
  if (val < 500) return 'Premium';
  if (val < 2000) return 'High-End';
  if (val < 10000) return 'Elite';
  return 'Grail';
}

// --- Thesis Generation Engine ---

interface ThesisResult {
  verdict: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell';
  riskScore: number; // 1-10
  confidenceScore: number; // 0-100
  bullPoints: string[];
  bearPoints: string[];
  catalysts: string[];
  comparableCards: SportsCard[];
  shortTermOutlook: string;
  mediumTermOutlook: string;
  longTermOutlook: string;
  summary: string;
}

function generateThesis(card: SportsCard, allCards: SportsCard[]): ThesisResult {
  const rawVal = parseValue(card.estimatedValueRaw);
  const gemVal = parseValue(card.estimatedValueGem);
  const era = getEra(card.year);
  const playerStage = getPlayerAge(card.year);
  const tier = getValueTier(rawVal);
  const cardAge = 2026 - card.year;

  // Multiplier ratio tells us how much grading amplifies value
  const gradeMultiplier = rawVal > 0 ? gemVal / rawVal : 1;

  // Player card count in the database
  const playerCards = allCards.filter(c => c.player === card.player);
  const playerCardCount = playerCards.length;

  // How many cards does this sport have?
  const sportCards = allCards.filter(c => c.sport === card.sport);

  // --- BULL CASE ---
  const bullPoints: string[] = [];

  if (card.rookie) {
    bullPoints.push(`Rookie card — the most collected and historically appreciating card type. Rookie cards of Hall of Famers have returned 10-20x over decades.`);
  }
  if (cardAge > 50) {
    bullPoints.push(`${cardAge}-year-old card with natural scarcity. Pre-${card.year + 20} cards are increasingly rare in high grades, creating supply-driven appreciation.`);
  } else if (cardAge > 30) {
    bullPoints.push(`Vintage scarcity premium — ${cardAge} years of attrition means fewer surviving copies in collectible condition.`);
  }
  if (gradeMultiplier > 5) {
    bullPoints.push(`Massive grade premium (${gradeMultiplier.toFixed(1)}x raw-to-gem multiplier). High-grade copies command significant premiums, suggesting strong collector demand for quality.`);
  }
  if (playerStage === 'Active Young Star' || playerStage === 'Prime Career') {
    bullPoints.push(`Player is in ${playerStage.toLowerCase()} phase — career achievements ahead (MVP, championships, milestones) could drive future price spikes.`);
  }
  if (playerStage === 'Retired / Legend' || playerStage === 'All-Time Great') {
    bullPoints.push(`Established legacy — the player's place in history is secured. Hall of Fame induction or anniversary milestones provide predictable catalysts.`);
  }
  if (rawVal < 50 && card.rookie) {
    bullPoints.push(`Undervalued entry point at $${rawVal} raw. Low barrier to entry means you can build a position before a breakout event drives prices higher.`);
  }
  if (card.sport === 'baseball' && card.year < 1970) {
    bullPoints.push(`Golden Age baseball card — the most liquid and broadly collected segment of the hobby. Consistent institutional buyer demand at auction.`);
  }
  if (card.sport === 'basketball' && (card.year >= 2018)) {
    bullPoints.push(`Modern basketball is the highest-growth segment of the hobby. International appeal and social media engagement drive strong demand among younger collectors.`);
  }
  if (card.sport === 'hockey') {
    bullPoints.push(`Hockey cards are the most undervalued major sport. Canadian collector base provides a stable floor, and growing US interest is an upside catalyst.`);
  }
  if (gemVal > 5000) {
    bullPoints.push(`High absolute value ($${gemVal.toLocaleString()} gem) signals institutional-grade demand. Cards at this level attract auction house consignment interest.`);
  }
  if (playerCardCount >= 5) {
    bullPoints.push(`Strong database representation (${playerCardCount} cards tracked) indicates high collector interest and market liquidity for this player.`);
  }

  // Ensure at least 3 bull points
  if (bullPoints.length < 3) {
    bullPoints.push(`Part of the ${card.set} set — a recognized product line with established collector following.`);
  }
  if (bullPoints.length < 3) {
    bullPoints.push(`${card.sport.charAt(0).toUpperCase() + card.sport.slice(1)} card market benefits from the overall hobby growth trend and mainstream media coverage.`);
  }

  // --- BEAR CASE ---
  const bearPoints: string[] = [];

  if (card.year >= 1986 && card.year <= 1993) {
    bearPoints.push(`Junk Wax Era production (${card.year}). Massive print runs mean abundant supply even in high grades. Most junk wax cards have limited upside unless the player is a top-tier Hall of Famer.`);
  }
  if (!card.rookie) {
    bearPoints.push(`Not a rookie card. Non-rookie issues typically appreciate slower and have lower collector priority than the player's rookie.`);
  }
  if (rawVal > 500 && playerStage !== 'All-Time Great') {
    bearPoints.push(`Premium valuation ($${rawVal} raw) leaves less room for appreciation relative to risk. A player controversy, injury, or market downturn could erase gains quickly.`);
  }
  if (card.sport === 'football') {
    bearPoints.push(`Football cards face the concussion/CTE narrative risk. Long-term health concerns may dampen mainstream collecting enthusiasm for the sport.`);
  }
  if (playerStage === 'Active Young Star') {
    bearPoints.push(`Young player risk — career trajectory is uncertain. Injuries, team changes, or performance decline could significantly reduce card values.`);
  }
  if (gradeMultiplier < 2) {
    bearPoints.push(`Low grade premium (${gradeMultiplier.toFixed(1)}x) suggests limited demand differentiation between raw and graded copies. Grading may not add meaningful value.`);
  }
  if (cardAge < 5) {
    bearPoints.push(`Very recent release (${card.year}). Ultra-modern cards often experience a "hype spike" followed by price normalization within 1-3 years.`);
  }
  if (card.year >= 2010 && card.sport === 'baseball') {
    bearPoints.push(`Modern baseball parallels and variations create dilution. Collectors spread spending across multiple versions rather than concentrating on base cards.`);
  }
  if (gemVal < 50) {
    bearPoints.push(`Low absolute gem value ($${gemVal}) means grading costs ($20-50) consume a significant portion of the card's value. Hard to profit on individual transactions.`);
  }
  if (card.sport === 'hockey' && cardAge < 10) {
    bearPoints.push(`Modern hockey has the smallest US collector base among the four major sports. Liquidity can be thin, making it harder to sell at market prices.`);
  }

  // Ensure at least 3 bear points
  if (bearPoints.length < 3) {
    bearPoints.push(`General market risk — the card collecting hobby is cyclical. Economic downturns, shifting demographics, or competing hobbies could reduce demand.`);
  }
  if (bearPoints.length < 3) {
    bearPoints.push(`Condition sensitivity — physical cards degrade over time. Storage costs, handling damage, and natural aging can reduce value if not properly preserved.`);
  }
  if (bearPoints.length < 3) {
    bearPoints.push(`Authentication risk — counterfeit cards exist across all eras. Buying from unverified sources introduces the risk of acquiring fakes.`);
  }

  // --- KEY CATALYSTS ---
  const catalysts: string[] = [];

  if (playerStage === 'Active Young Star' || playerStage === 'Prime Career') {
    catalysts.push('Upcoming season performance — strong stats, All-Star selection, or award contention could spike demand');
    catalysts.push('Playoff run or championship appearance — postseason success is the strongest short-term price catalyst');
    if (card.sport === 'football') catalysts.push('NFL Draft (April) and Free Agency (March) — team changes and draft capital affect card values');
    if (card.sport === 'basketball') catalysts.push('NBA Playoffs and Finals (April-June) — deep runs by the player\'s team drive card prices');
    if (card.sport === 'baseball') catalysts.push('MLB Trade Deadline (July) and Postseason (October) — contender acquisitions and playoff heroics move prices');
    if (card.sport === 'hockey') catalysts.push('NHL Stanley Cup Playoffs (April-June) — playoff performances are the primary hockey card catalyst');
  }
  if (playerStage === 'Established Veteran') {
    catalysts.push('Retirement announcement — final-season demand creates a predictable price bump');
    catalysts.push('Career milestone approaching — round-number achievements (500 HR, 1000 points, etc.) generate media coverage');
  }
  if (playerStage === 'Retired / Legend') {
    catalysts.push('Hall of Fame eligibility or induction ceremony — the most reliable long-term catalyst for retired player cards');
    catalysts.push('Documentary, book, or media feature — renewed public interest drives casual collector demand');
  }
  if (playerStage === 'All-Time Great') {
    catalysts.push('Anniversary milestones (50th anniversary of a record, centennial of birth) — periodic nostalgia-driven demand');
    catalysts.push('Estate sales or significant auction results — record prices for comparable cards lift the entire player market');
  }
  catalysts.push('New product releases featuring the player — Topps/Panini releases with autograph or relic inserts create cross-product demand');
  if (card.year < 1970) {
    catalysts.push('Heritage Auctions or Goldin high-profile sale — institutional auction results set price benchmarks for vintage cards');
  }

  // --- COMPARABLE CARDS ---
  // Find cards from the same sport, similar era, similar value range
  const comparableCards = allCards
    .filter(c => c.slug !== card.slug
      && c.sport === card.sport
      && Math.abs(c.year - card.year) <= 10
      && c.rookie === card.rookie
    )
    .sort((a, b) => Math.abs(parseValue(a.estimatedValueRaw) - rawVal) - Math.abs(parseValue(b.estimatedValueRaw) - rawVal))
    .slice(0, 5);

  // --- RISK SCORE (1-10, higher = riskier) ---
  let risk = 5;
  if (playerStage === 'Active Young Star') risk += 2;
  if (playerStage === 'All-Time Great') risk -= 2;
  if (card.year >= 1986 && card.year <= 1993) risk += 1;
  if (cardAge > 50) risk -= 1;
  if (rawVal > 1000) risk += 1;
  if (rawVal < 20) risk -= 1;
  if (!card.rookie) risk += 0.5;
  if (card.rookie && rawVal < 100) risk -= 0.5;
  if (gradeMultiplier > 10) risk += 0.5;
  risk = Math.max(1, Math.min(10, Math.round(risk)));

  // --- CONFIDENCE SCORE (0-100) ---
  let confidence = 60;
  if (playerCardCount >= 5) confidence += 10;
  if (card.rookie) confidence += 5;
  if (playerStage === 'All-Time Great') confidence += 15;
  if (playerStage === 'Active Young Star') confidence -= 10;
  if (cardAge > 30) confidence += 5;
  if (card.year >= 1986 && card.year <= 1993) confidence -= 5;
  confidence = Math.max(20, Math.min(95, confidence));

  // --- VERDICT ---
  let score = 50; // neutral
  // Bull factors
  if (card.rookie) score += 10;
  if (cardAge > 30) score += 8;
  if (gradeMultiplier > 5) score += 5;
  if (playerStage === 'All-Time Great') score += 12;
  if (playerStage === 'Retired / Legend') score += 5;
  if (rawVal < 50 && card.rookie) score += 8;
  if (card.sport === 'basketball' && card.year >= 2018) score += 3;
  // Bear factors
  if (card.year >= 1986 && card.year <= 1993 && !card.rookie) score -= 15;
  if (card.year >= 1986 && card.year <= 1993 && card.rookie) score -= 5;
  if (!card.rookie && rawVal > 200) score -= 5;
  if (cardAge < 3) score -= 8;
  if (gemVal < 30) score -= 5;
  if (rawVal > 2000 && playerStage !== 'All-Time Great') score -= 5;

  let verdict: ThesisResult['verdict'];
  if (score >= 75) verdict = 'Strong Buy';
  else if (score >= 60) verdict = 'Buy';
  else if (score >= 40) verdict = 'Hold';
  else if (score >= 25) verdict = 'Sell';
  else verdict = 'Strong Sell';

  // --- TIME HORIZON OUTLOOKS ---
  const shortTermOutlook = playerStage === 'Active Young Star' || playerStage === 'Prime Career'
    ? 'Volatile — price movement is tied to upcoming season performance and breaking news. High potential for short-term gains or losses.'
    : cardAge < 5
      ? 'Normalizing — recent releases often cool off after initial hype. Wait for a dip before buying or hold if already invested.'
      : 'Stable — established cards tend to be less volatile short-term. Price is driven by broader market conditions more than individual news.';

  const mediumTermOutlook = card.rookie && (playerStage === 'Active Young Star' || playerStage === 'Prime Career')
    ? 'High upside — the next 3-5 years will define this player\'s legacy trajectory. A breakout or championship could 2-5x current values.'
    : playerStage === 'All-Time Great'
      ? 'Steady appreciation — all-time greats appreciate consistently at 5-10% annually. Low risk, predictable returns.'
      : card.year >= 1986 && card.year <= 1993
        ? 'Flat — junk wax cards face a supply ceiling. Unless the player transcends the era, expect minimal appreciation.'
        : 'Moderate — mid-term price driven by player milestones, hobby health, and supply attrition.';

  const longTermOutlook = cardAge > 50
    ? 'Strong — vintage scarcity compounds over decades. Population of surviving copies only decreases, while collector base grows generationally.'
    : card.rookie && playerStage === 'All-Time Great'
      ? 'Excellent — rookie cards of all-time greats are the blue-chip investments of the hobby. 50-100 year time horizon favors these strongly.'
      : card.year >= 1986 && card.year <= 1993
        ? 'Weak — overproduction era supply is unlikely to diminish meaningfully. Only the top 1% of junk wax players will appreciate long-term.'
        : 'Uncertain — long-term returns depend on the player\'s ultimate legacy and the hobby\'s structural health over the next 10-20 years.';

  // --- SUMMARY ---
  const summary = `${card.name} is a ${tier.toLowerCase()}-tier ${card.rookie ? 'rookie' : ''} card from the ${era} (${card.year}). ` +
    `The player is in the ${playerStage.toLowerCase()} phase. ` +
    `At $${rawVal} raw / $${gemVal.toLocaleString()} gem mint, the grade multiplier of ${gradeMultiplier.toFixed(1)}x ` +
    (gradeMultiplier > 5 ? 'suggests strong collector demand for high-grade copies. ' : gradeMultiplier > 2 ? 'indicates moderate grading upside. ' : 'shows limited grading premium. ') +
    `Our algorithmic analysis scores this card as a ${verdict} with a risk level of ${risk}/10 and ${confidence}% confidence.`;

  return {
    verdict,
    riskScore: risk,
    confidenceScore: confidence,
    bullPoints: bullPoints.slice(0, 5),
    bearPoints: bearPoints.slice(0, 5),
    catalysts: catalysts.slice(0, 5),
    comparableCards,
    shortTermOutlook,
    mediumTermOutlook,
    longTermOutlook,
    summary,
  };
}

// --- Verdict color helpers ---
function verdictColor(v: string) {
  switch (v) {
    case 'Strong Buy': return 'text-emerald-400 bg-emerald-950/60 border-emerald-700/50';
    case 'Buy': return 'text-green-400 bg-green-950/60 border-green-700/50';
    case 'Hold': return 'text-yellow-400 bg-yellow-950/60 border-yellow-700/50';
    case 'Sell': return 'text-orange-400 bg-orange-950/60 border-orange-700/50';
    case 'Strong Sell': return 'text-red-400 bg-red-950/60 border-red-700/50';
    default: return 'text-gray-400 bg-gray-950/60 border-gray-700/50';
  }
}

function riskColor(r: number) {
  if (r <= 3) return 'text-emerald-400';
  if (r <= 5) return 'text-yellow-400';
  if (r <= 7) return 'text-orange-400';
  return 'text-red-400';
}

function riskLabel(r: number) {
  if (r <= 2) return 'Very Low';
  if (r <= 4) return 'Low';
  if (r <= 6) return 'Moderate';
  if (r <= 8) return 'High';
  return 'Very High';
}

// --- Component ---
export default function InvestmentThesisClient() {
  const [query, setQuery] = useState('');
  const [selectedCard, setSelectedCard] = useState<SportsCard | null>(null);
  const [showResults, setShowResults] = useState(false);

  const searchResults = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    return sportsCards
      .filter(c => c.name.toLowerCase().includes(q) || c.player.toLowerCase().includes(q))
      .slice(0, 8);
  }, [query]);

  const thesis = useMemo(() => {
    if (!selectedCard) return null;
    return generateThesis(selectedCard, sportsCards);
  }, [selectedCard]);

  function handleSelect(card: SportsCard) {
    setSelectedCard(card);
    setQuery('');
    setShowResults(false);
  }

  return (
    <div>
      {/* Search */}
      <div className="relative mb-8">
        <label className="block text-sm font-medium text-gray-300 mb-2">Search for a card</label>
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setShowResults(true); }}
          onFocus={() => setShowResults(true)}
          placeholder="e.g. 1986 Fleer Michael Jordan, Mike Trout Rookie, Wemby..."
          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
        />
        {showResults && searchResults.length > 0 && (
          <div className="absolute z-20 w-full mt-1 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-h-64 overflow-y-auto">
            {searchResults.map(c => (
              <button
                key={c.slug}
                onClick={() => handleSelect(c)}
                className="w-full text-left px-4 py-3 hover:bg-gray-800 border-b border-gray-800 last:border-b-0 transition-colors"
              >
                <div className="text-white text-sm font-medium">{c.name}</div>
                <div className="text-gray-500 text-xs">{c.player} &middot; {c.sport} &middot; {c.estimatedValueRaw} raw</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Card Summary */}
      {selectedCard && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-white font-bold text-lg">{selectedCard.name}</h2>
              <p className="text-gray-400 text-sm">{selectedCard.player} &middot; {selectedCard.sport.charAt(0).toUpperCase() + selectedCard.sport.slice(1)} &middot; {selectedCard.set}</p>
              <div className="flex gap-3 mt-1">
                <span className="text-gray-500 text-xs">Raw: <span className="text-white">{selectedCard.estimatedValueRaw}</span></span>
                <span className="text-gray-500 text-xs">Gem: <span className="text-emerald-400">{selectedCard.estimatedValueGem}</span></span>
                {selectedCard.rookie && <span className="text-xs bg-amber-900/60 text-amber-400 px-2 py-0.5 rounded-full border border-amber-700/50">RC</span>}
              </div>
            </div>
            <Link
              href={`/cards/${selectedCard.slug}`}
              className="text-xs text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
            >
              View Card Page
            </Link>
          </div>
        </div>
      )}

      {/* Thesis Output */}
      {thesis && selectedCard && (
        <div className="space-y-6">
          {/* Verdict Banner */}
          <div className={`rounded-xl border p-6 text-center ${verdictColor(thesis.verdict)}`}>
            <div className="text-xs uppercase tracking-wider mb-1 opacity-80">Investment Verdict</div>
            <div className="text-3xl sm:text-4xl font-black">{thesis.verdict}</div>
            <div className="flex justify-center gap-6 mt-3 text-sm">
              <div>
                <span className="opacity-70">Risk: </span>
                <span className={`font-bold ${riskColor(thesis.riskScore)}`}>{thesis.riskScore}/10 ({riskLabel(thesis.riskScore)})</span>
              </div>
              <div>
                <span className="opacity-70">Confidence: </span>
                <span className="font-bold">{thesis.confidenceScore}%</span>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-white font-bold mb-2">Executive Summary</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{thesis.summary}</p>
          </div>

          {/* Bull & Bear Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bull Case */}
            <div className="bg-gray-900 border border-emerald-900/50 rounded-xl p-5">
              <h3 className="text-emerald-400 font-bold mb-3 flex items-center gap-2">
                <span className="text-lg">&#9650;</span> Bull Case
              </h3>
              <ul className="space-y-3">
                {thesis.bullPoints.map((p, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className="text-emerald-500 mt-0.5 shrink-0">+</span>
                    <span className="text-gray-300">{p}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Bear Case */}
            <div className="bg-gray-900 border border-red-900/50 rounded-xl p-5">
              <h3 className="text-red-400 font-bold mb-3 flex items-center gap-2">
                <span className="text-lg">&#9660;</span> Bear Case
              </h3>
              <ul className="space-y-3">
                {thesis.bearPoints.map((p, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className="text-red-500 mt-0.5 shrink-0">-</span>
                    <span className="text-gray-300">{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Risk Meter Visual */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-white font-bold mb-3">Risk Assessment</h3>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${thesis.riskScore * 10}%`,
                    background: thesis.riskScore <= 3 ? '#10b981' : thesis.riskScore <= 5 ? '#eab308' : thesis.riskScore <= 7 ? '#f97316' : '#ef4444',
                  }}
                />
              </div>
              <span className={`font-bold text-sm ${riskColor(thesis.riskScore)}`}>{thesis.riskScore}/10</span>
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>Low Risk</span>
              <span>High Risk</span>
            </div>
          </div>

          {/* Key Catalysts */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-white font-bold mb-3">Key Catalysts</h3>
            <div className="space-y-2">
              {thesis.catalysts.map((c, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-amber-400 mt-0.5 shrink-0">&#9889;</span>
                  <span className="text-gray-300">{c}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Time Horizon Outlook */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-white font-bold mb-4">Time Horizon Analysis</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Short-Term (0-1 yr)</div>
                <p className="text-gray-300 text-sm">{thesis.shortTermOutlook}</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Medium-Term (1-5 yr)</div>
                <p className="text-gray-300 text-sm">{thesis.mediumTermOutlook}</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Long-Term (5-20 yr)</div>
                <p className="text-gray-300 text-sm">{thesis.longTermOutlook}</p>
              </div>
            </div>
          </div>

          {/* Comparable Cards */}
          {thesis.comparableCards.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-white font-bold mb-3">Comparable Cards</h3>
              <p className="text-gray-500 text-xs mb-3">Similar era, sport, and card type — useful for relative valuation</p>
              <div className="space-y-2">
                {thesis.comparableCards.map(c => (
                  <Link
                    key={c.slug}
                    href={`/cards/${c.slug}`}
                    className="flex items-center justify-between bg-gray-800/50 hover:bg-gray-800 rounded-lg px-4 py-3 transition-colors"
                  >
                    <div>
                      <div className="text-white text-sm font-medium">{c.name}</div>
                      <div className="text-gray-500 text-xs">{c.player} &middot; {c.year} &middot; {c.rookie ? 'RC' : 'Non-RC'}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-300 text-sm">{c.estimatedValueRaw}</div>
                      <div className="text-emerald-400 text-xs">{c.estimatedValueGem} gem</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="bg-amber-950/30 border border-amber-800/30 rounded-xl p-4">
            <p className="text-amber-400/80 text-xs leading-relaxed">
              <strong>Disclaimer:</strong> This investment thesis is generated algorithmically for educational and entertainment purposes only. It is not financial advice. Card values are estimated and can change rapidly based on market conditions, player performance, and other unpredictable factors. Past performance does not guarantee future results. Always do your own research before making any investment decisions.
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!selectedCard && (
        <div className="text-center py-16 bg-gray-900/50 border border-gray-800 border-dashed rounded-xl">
          <div className="text-4xl mb-3">&#128200;</div>
          <h3 className="text-white font-semibold mb-2">Search for a card above</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Pick any card from our 5,700+ database and we will generate a structured investment thesis with bull/bear analysis, risk scoring, and a verdict.
          </p>
        </div>
      )}
    </div>
  );
}
