'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

interface RarityResult {
  score: number;
  tier: string;
  tierColor: string;
  factors: { name: string; value: number; max: number; detail: string }[];
  advice: string;
}

function parseEstValue(raw: string): number {
  const m = raw.match(/\$([0-9,]+)/);
  if (!m) return 0;
  return parseInt(m[1].replace(/,/g, ''), 10);
}

function calculateRarity(
  year: number,
  isRookie: boolean,
  sport: string,
  rawValue: number,
  gemValue: number,
  setName: string,
  player: string
): RarityResult {
  const factors: RarityResult['factors'] = [];
  const currentYear = 2026;
  const age = currentYear - year;

  // Factor 1: Age (older = rarer due to attrition) — max 25
  let ageFactor = 0;
  if (age >= 80) ageFactor = 25;
  else if (age >= 60) ageFactor = 22;
  else if (age >= 40) ageFactor = 18;
  else if (age >= 25) ageFactor = 14;
  else if (age >= 15) ageFactor = 10;
  else if (age >= 5) ageFactor = 5;
  else ageFactor = 2;
  factors.push({ name: 'Card Age', value: ageFactor, max: 25, detail: `${age} years old (${year}). Older cards are rarer due to natural attrition, lost collections, and condition degradation.` });

  // Factor 2: Value indicator (market prices reflect scarcity) — max 25
  let valueFactor = 0;
  if (rawValue >= 10000) valueFactor = 25;
  else if (rawValue >= 5000) valueFactor = 22;
  else if (rawValue >= 1000) valueFactor = 18;
  else if (rawValue >= 500) valueFactor = 15;
  else if (rawValue >= 100) valueFactor = 12;
  else if (rawValue >= 50) valueFactor = 8;
  else if (rawValue >= 20) valueFactor = 5;
  else if (rawValue >= 5) valueFactor = 3;
  else valueFactor = 1;
  factors.push({ name: 'Market Value', value: valueFactor, max: 25, detail: `Raw value ~$${rawValue.toLocaleString()}. Market prices reflect supply and demand — higher prices generally indicate scarcer cards.` });

  // Factor 3: Gem rate multiplier (gem/raw ratio indicates grading scarcity) — max 20
  let gemFactor = 0;
  const gemRatio = rawValue > 0 ? gemValue / rawValue : 1;
  if (gemRatio >= 100) gemFactor = 20;
  else if (gemRatio >= 50) gemFactor = 17;
  else if (gemRatio >= 20) gemFactor = 14;
  else if (gemRatio >= 10) gemFactor = 11;
  else if (gemRatio >= 5) gemFactor = 8;
  else gemFactor = 4;
  factors.push({ name: 'Gem Rate Premium', value: gemFactor, max: 20, detail: `Gem/raw ratio: ${gemRatio.toFixed(1)}x. Higher ratios mean gem-mint copies are exceptionally scarce relative to raw copies.` });

  // Factor 4: Rookie card status — max 10
  const rookieFactor = isRookie ? 10 : 3;
  factors.push({ name: 'Rookie Status', value: rookieFactor, max: 10, detail: isRookie ? 'Rookie card. First-year cards are the most collected and command the highest premiums.' : 'Not a rookie card. Base/veteran cards are more common than their RC counterparts.' });

  // Factor 5: Set/era rarity — max 10
  let setFactor = 0;
  const setLower = setName.toLowerCase();
  if (setLower.includes('t206') || setLower.includes('1952 topps') || setLower.includes('1933 goudey')) setFactor = 10;
  else if (year < 1960) setFactor = 9;
  else if (year < 1975) setFactor = 7;
  else if (setLower.includes('sp ') || setLower.includes('bowman chrome') || setLower.includes('prizm')) setFactor = 6;
  else if (year >= 1987 && year <= 1994) setFactor = 2; // junk wax
  else setFactor = 4;
  factors.push({ name: 'Set/Era Rarity', value: setFactor, max: 10, detail: year >= 1987 && year <= 1994 ? `Junk wax era (${year}). Massive overproduction means millions of copies exist.` : year < 1960 ? `Pre-1960 card. Very few surviving copies in any condition.` : `${setName}. Print run and set prestige affect long-term availability.` });

  // Factor 6: Sport multiplier — max 10
  let sportFactor = 4;
  if (sport === 'hockey') sportFactor = 7; // smaller collector base, fewer preserved
  else if (sport === 'baseball' && year < 1970) sportFactor = 8;
  else if (sport === 'basketball') sportFactor = 5;
  else if (sport === 'football') sportFactor = 4;
  factors.push({ name: 'Sport Factor', value: sportFactor, max: 10, detail: sport === 'hockey' ? 'Hockey cards have a smaller collector base and lower print runs, making them relatively scarcer.' : sport === 'baseball' && year < 1970 ? 'Pre-1970 baseball cards are among the rarest and most collected cards in the hobby.' : `${sport.charAt(0).toUpperCase() + sport.slice(1)} cards have a large and active collector market.` });

  const totalScore = factors.reduce((sum, f) => sum + f.value, 0);

  // Determine tier
  let tier = '';
  let tierColor = '';
  let advice = '';
  if (totalScore >= 85) { tier = 'Legendary'; tierColor = 'text-amber-300 bg-amber-950/60 border-amber-700/50'; advice = 'Museum-quality rarity. This card belongs in a top-tier collection. Professional storage and insurance recommended. Consider PSA or SGC for optimal presentation.'; }
  else if (totalScore >= 70) { tier = 'Ultra Rare'; tierColor = 'text-purple-300 bg-purple-950/60 border-purple-700/50'; advice = 'Extremely scarce card. High-grade copies are particularly valuable. Consider professional grading if ungraded — the gem premium is significant at this rarity level.'; }
  else if (totalScore >= 55) { tier = 'Rare'; tierColor = 'text-blue-300 bg-blue-950/60 border-blue-700/50'; advice = 'Above-average scarcity. This card has solid collector demand and limited supply. A good long-term hold, especially in high grades.'; }
  else if (totalScore >= 40) { tier = 'Uncommon'; tierColor = 'text-emerald-300 bg-emerald-950/60 border-emerald-700/50'; advice = 'Moderate availability. The card exists in reasonable numbers but still has collectible value. Focus on condition — high-grade copies stand out from the crowd.'; }
  else if (totalScore >= 25) { tier = 'Common'; tierColor = 'text-gray-300 bg-gray-800/60 border-gray-600/50'; advice = 'Widely available card. Many copies exist in the market. Value comes from player significance rather than scarcity. Buy in bulk at low prices.'; }
  else { tier = 'Mass Produced'; tierColor = 'text-gray-400 bg-gray-900/60 border-gray-700/50'; advice = 'Extremely common. Likely from the junk wax era or modern base set. Millions of copies produced. Collect for personal enjoyment, not investment.'; }

  return { score: totalScore, tier, tierColor, factors, advice };
}

export default function RarityCalculator() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCard, setSelectedCard] = useState<typeof sportsCards[0] | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [manualYear, setManualYear] = useState('2024');
  const [manualRookie, setManualRookie] = useState(false);
  const [manualSport, setManualSport] = useState('baseball');
  const [manualValue, setManualValue] = useState('50');
  const [manualGemValue, setManualGemValue] = useState('500');
  const [manualSet, setManualSet] = useState('2024 Topps Chrome');

  const searchResults = useMemo(() => {
    if (searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase();
    return sportsCards
      .filter(c => c.name.toLowerCase().includes(q) || c.player.toLowerCase().includes(q))
      .slice(0, 8);
  }, [searchQuery]);

  const selectCard = (card: typeof sportsCards[0]) => {
    setSelectedCard(card);
    setSearchQuery(card.name);
    setShowResults(true);
    setManualMode(false);
  };

  const runManual = () => {
    setSelectedCard(null);
    setShowResults(true);
    setManualMode(true);
  };

  const result = useMemo(() => {
    if (!showResults) return null;
    if (selectedCard && !manualMode) {
      const rawVal = parseEstValue(selectedCard.estimatedValueRaw);
      const gemVal = parseEstValue(selectedCard.estimatedValueGem);
      return calculateRarity(selectedCard.year, selectedCard.rookie, selectedCard.sport, rawVal, gemVal, selectedCard.set, selectedCard.player);
    }
    if (manualMode) {
      return calculateRarity(parseInt(manualYear), manualRookie, manualSport, parseFloat(manualValue) || 0, parseFloat(manualGemValue) || 0, manualSet, 'Manual Entry');
    }
    return null;
  }, [showResults, selectedCard, manualMode, manualYear, manualRookie, manualSport, manualValue, manualGemValue, manualSet]);

  return (
    <div className="space-y-8">
      {/* Search */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Find Your Card</h2>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setShowResults(false); setSelectedCard(null); }}
            placeholder="Search 4,300+ cards by name or player..."
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          {searchResults.length > 0 && !selectedCard && (
            <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-64 overflow-y-auto">
              {searchResults.map(card => (
                <button
                  key={card.slug}
                  onClick={() => selectCard(card)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-700 border-b border-gray-700/50 last:border-0"
                >
                  <div className="text-white text-sm font-medium">{card.name}</div>
                  <div className="text-gray-400 text-xs">{card.sport} &middot; {card.year} &middot; {card.rookie ? 'RC' : 'Base'} &middot; Raw: {card.estimatedValueRaw}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-800">
          <button
            onClick={() => { setManualMode(true); setShowResults(false); setSelectedCard(null); setSearchQuery(''); }}
            className="text-sm text-emerald-400 hover:text-emerald-300"
          >
            Or enter card details manually
          </button>
        </div>
      </div>

      {/* Manual Entry */}
      {manualMode && !showResults && (
        <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Manual Card Details</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Year</label>
              <input type="number" value={manualYear} onChange={e => setManualYear(e.target.value)} className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Sport</label>
              <select value={manualSport} onChange={e => setManualSport(e.target.value)} className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2">
                <option value="baseball">Baseball</option>
                <option value="basketball">Basketball</option>
                <option value="football">Football</option>
                <option value="hockey">Hockey</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Set Name</label>
              <input type="text" value={manualSet} onChange={e => setManualSet(e.target.value)} className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Raw Value ($)</label>
              <input type="number" value={manualValue} onChange={e => setManualValue(e.target.value)} className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Gem Value ($)</label>
              <input type="number" value={manualGemValue} onChange={e => setManualGemValue(e.target.value)} className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2" />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={manualRookie} onChange={e => setManualRookie(e.target.checked)} className="rounded bg-gray-800 border-gray-600 text-emerald-500" />
                <span className="text-sm text-gray-300">Rookie Card</span>
              </label>
            </div>
          </div>
          <button onClick={runManual} className="mt-4 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors">
            Calculate Rarity Score
          </button>
        </div>
      )}

      {/* Results */}
      {result && (
        <>
          {/* Score Header */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6 text-center">
            <div className="text-6xl font-bold text-white mb-2">{result.score}<span className="text-2xl text-gray-500">/100</span></div>
            <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold border ${result.tierColor}`}>
              {result.tier}
            </div>
            {selectedCard && (
              <div className="mt-3 text-gray-400 text-sm">{selectedCard.name}</div>
            )}
          </div>

          {/* Factor Breakdown */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4">Rarity Factor Breakdown</h3>
            <div className="space-y-4">
              {result.factors.map((factor, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white font-medium">{factor.name}</span>
                    <span className="text-sm text-gray-400">{factor.value}/{factor.max}</span>
                  </div>
                  <div className="h-3 bg-gray-800 rounded-full overflow-hidden mb-1">
                    <div
                      className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-emerald-600 to-emerald-400"
                      style={{ width: `${(factor.value / factor.max) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">{factor.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Advice */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-2">Collector Advice</h3>
            <p className="text-gray-400 text-sm">{result.advice}</p>
          </div>

          {/* Rarity Scale */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4">Rarity Scale</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { tier: 'Legendary', range: '85-100', color: 'text-amber-300 bg-amber-950/40 border-amber-800/50', desc: 'Museum-quality. Pre-war icons, PSA 10 vintage.' },
                { tier: 'Ultra Rare', range: '70-84', color: 'text-purple-300 bg-purple-950/40 border-purple-800/50', desc: 'HOF RCs, key vintage, high-value modern.' },
                { tier: 'Rare', range: '55-69', color: 'text-blue-300 bg-blue-950/40 border-blue-800/50', desc: 'Desirable cards with limited supply.' },
                { tier: 'Uncommon', range: '40-54', color: 'text-emerald-300 bg-emerald-950/40 border-emerald-800/50', desc: 'Moderate availability, solid collectibles.' },
                { tier: 'Common', range: '25-39', color: 'text-gray-300 bg-gray-800/40 border-gray-600/50', desc: 'Widely available, affordable.' },
                { tier: 'Mass Produced', range: '0-24', color: 'text-gray-400 bg-gray-900/40 border-gray-700/50', desc: 'Junk wax era, modern base.' },
              ].map(t => (
                <div key={t.tier} className={`p-3 rounded-lg border ${t.color} ${result.tier === t.tier ? 'ring-2 ring-white/30' : ''}`}>
                  <div className="font-semibold text-sm">{t.tier}</div>
                  <div className="text-xs opacity-70">{t.range} pts</div>
                  <div className="text-xs mt-1 opacity-50">{t.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Related Tools */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">Related Tools</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/tools/pop-report', label: 'Population Report' },
            { href: '/tools/investment-calc', label: 'Investment Calculator' },
            { href: '/tools/cross-grade', label: 'Cross-Grade Converter' },
            { href: '/tools/condition-grader', label: 'Condition Self-Grader' },
          ].map(t => (
            <Link
              key={t.href}
              href={t.href}
              className="flex items-center gap-2 px-3 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm text-gray-300 hover:text-white transition-colors"
            >
              <span>{t.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
