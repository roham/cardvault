'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { sportsCards, type SportsCard } from '@/data/sports-cards';

// Simulated population data based on card characteristics
// In production, this would come from a real population database
function generatePopData(card: SportsCard) {
  // Seed from card slug for deterministic results
  let hash = 0;
  for (let i = 0; i < card.slug.length; i++) {
    hash = ((hash << 5) - hash) + card.slug.charCodeAt(i);
    hash |= 0;
  }
  const seed = Math.abs(hash);

  // Base population scales with card age and popularity
  const yearsOld = 2026 - card.year;
  const isModern = card.year >= 2015;
  const isVintage = card.year < 1980;
  const isJunkWax = card.year >= 1987 && card.year <= 1994;

  // Parse raw price for popularity factor
  const rawMatch = card.estimatedValueRaw.replace(/,/g, '').match(/[\d.]+/);
  const rawPrice = rawMatch ? parseFloat(rawMatch[0]) : 5;

  // Higher value = more submissions
  const popularityMult = Math.min(5, Math.max(0.5, rawPrice / 20));

  // Base total graded
  let totalBase: number;
  if (isVintage) totalBase = 200 + (seed % 800);
  else if (isJunkWax) totalBase = 500 + (seed % 3000);
  else if (isModern) totalBase = 300 + (seed % 2000);
  else totalBase = 400 + (seed % 1500);

  const total = Math.round(totalBase * popularityMult);
  if (card.rookie) {
    // Rookies get more graded
  }

  // Grade distribution based on era
  let dist: Record<number, number>;
  if (isVintage) {
    // Vintage: heavily weighted to lower grades
    dist = {
      1: Math.round(total * 0.03), 2: Math.round(total * 0.05),
      3: Math.round(total * 0.08), 4: Math.round(total * 0.12),
      5: Math.round(total * 0.15), 6: Math.round(total * 0.18),
      7: Math.round(total * 0.17), 8: Math.round(total * 0.13),
      9: Math.round(total * 0.06), 10: Math.round(total * 0.005),
    };
  } else if (isJunkWax) {
    // Junk wax: lots of high grades due to mass production + better centering
    dist = {
      1: Math.round(total * 0.01), 2: Math.round(total * 0.01),
      3: Math.round(total * 0.02), 4: Math.round(total * 0.03),
      5: Math.round(total * 0.05), 6: Math.round(total * 0.07),
      7: Math.round(total * 0.10), 8: Math.round(total * 0.18),
      9: Math.round(total * 0.28), 10: Math.round(total * 0.15),
    };
  } else if (isModern) {
    // Modern: very top-heavy because people only submit mint cards
    dist = {
      1: Math.round(total * 0.005), 2: Math.round(total * 0.005),
      3: Math.round(total * 0.01), 4: Math.round(total * 0.02),
      5: Math.round(total * 0.03), 6: Math.round(total * 0.04),
      7: Math.round(total * 0.06), 8: Math.round(total * 0.12),
      9: Math.round(total * 0.30), 10: Math.round(total * 0.25),
    };
  } else {
    // 1995-2014: moderate
    dist = {
      1: Math.round(total * 0.01), 2: Math.round(total * 0.02),
      3: Math.round(total * 0.03), 4: Math.round(total * 0.04),
      5: Math.round(total * 0.06), 6: Math.round(total * 0.09),
      7: Math.round(total * 0.12), 8: Math.round(total * 0.18),
      9: Math.round(total * 0.25), 10: Math.round(total * 0.12),
    };
  }

  // Add small randomness per grade
  for (const g of [1,2,3,4,5,6,7,8,9,10]) {
    const variance = (((seed * (g + 7)) % 20) - 10) / 100;
    dist[g] = Math.max(0, Math.round(dist[g] * (1 + variance)));
  }

  // Recalculate actual total
  const actualTotal = Object.values(dist).reduce((a, b) => a + b, 0);

  // PSA 10 percentage
  const gemRate = actualTotal > 0 ? (dist[10] / actualTotal * 100) : 0;

  return { distribution: dist, total: actualTotal, gemRate };
}

function formatNum(n: number): string {
  return n.toLocaleString('en-US');
}

function getGradeBarColor(grade: number): string {
  if (grade >= 10) return 'bg-yellow-500';
  if (grade >= 9) return 'bg-emerald-500';
  if (grade >= 8) return 'bg-sky-500';
  if (grade >= 7) return 'bg-blue-500';
  if (grade >= 6) return 'bg-zinc-400';
  if (grade >= 5) return 'bg-orange-400';
  return 'bg-red-400';
}

function getScarcityLabel(gemRate: number, total: number): { label: string; color: string; detail: string } {
  if (total < 50 && gemRate < 2) return { label: 'Extremely Rare', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30', detail: 'Very few graded examples exist. Gem mint copies are exceptionally scarce.' };
  if (gemRate < 3) return { label: 'Scarce in High Grade', color: 'text-orange-400 bg-orange-500/10 border-orange-500/30', detail: 'PSA 10 copies are rare. High-grade examples command significant premiums.' };
  if (gemRate < 10) return { label: 'Moderate Population', color: 'text-sky-400 bg-sky-500/10 border-sky-500/30', detail: 'Reasonable number of graded copies. PSA 10 is achievable but not common.' };
  if (gemRate < 25) return { label: 'Available in High Grade', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', detail: 'Good number of high-grade copies exist. Gem mint is fairly common.' };
  return { label: 'Abundant', color: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/30', detail: 'Large population with many gem mint copies. Premium over raw is limited.' };
}

export default function PopReport() {
  const [query, setQuery] = useState('');
  const [selectedCard, setSelectedCard] = useState<SportsCard | null>(null);

  const results = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    return sportsCards.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.player.toLowerCase().includes(q) ||
      c.slug.includes(q)
    ).slice(0, 12);
  }, [query]);

  const popData = useMemo(() => {
    if (!selectedCard) return null;
    return generatePopData(selectedCard);
  }, [selectedCard]);

  const scarcity = useMemo(() => {
    if (!popData) return null;
    return getScarcityLabel(popData.gemRate, popData.total);
  }, [popData]);

  const maxCount = popData ? Math.max(...Object.values(popData.distribution)) : 0;

  return (
    <div className="space-y-8">
      {/* Search */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
        <label className="block text-sm font-medium text-zinc-300 mb-2">Search for a card</label>
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setSelectedCard(null); }}
          placeholder="e.g., 1986 Fleer Michael Jordan, 2018 Prizm Luka..."
          className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50"
        />

        {/* Results */}
        {results.length > 0 && !selectedCard && (
          <div className="mt-3 space-y-1 max-h-72 overflow-y-auto">
            {results.map(card => (
              <button
                key={card.slug}
                onClick={() => { setSelectedCard(card); setQuery(card.name); }}
                className="w-full text-left p-3 bg-zinc-800/50 hover:bg-zinc-700/50 rounded-lg border border-zinc-700/50 hover:border-amber-600/30 transition-colors"
              >
                <div className="text-white text-sm font-medium">{card.name}</div>
                <div className="text-zinc-500 text-xs mt-0.5">{card.sport} &middot; {card.estimatedValueRaw} raw &middot; {card.estimatedValueGem} gem</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Population Report */}
      {selectedCard && popData && scarcity && (
        <div className="space-y-6">
          {/* Card Info */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-white">{selectedCard.name}</h3>
                <p className="text-zinc-400 text-sm mt-1">{selectedCard.description}</p>
              </div>
              <div className="flex gap-4 text-center">
                <div>
                  <div className="text-amber-400 text-2xl font-bold">{formatNum(popData.total)}</div>
                  <div className="text-zinc-500 text-xs">Total Graded</div>
                </div>
                <div>
                  <div className="text-yellow-400 text-2xl font-bold">{formatNum(popData.distribution[10])}</div>
                  <div className="text-zinc-500 text-xs">PSA 10</div>
                </div>
                <div>
                  <div className="text-emerald-400 text-2xl font-bold">{popData.gemRate.toFixed(1)}%</div>
                  <div className="text-zinc-500 text-xs">Gem Rate</div>
                </div>
              </div>
            </div>
          </div>

          {/* Scarcity Rating */}
          <div className={`border rounded-xl p-5 ${scarcity.color}`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {scarcity.label === 'Extremely Rare' ? '💎' :
                 scarcity.label === 'Scarce in High Grade' ? '🔥' :
                 scarcity.label === 'Moderate Population' ? '📊' :
                 scarcity.label === 'Available in High Grade' ? '✅' : '📦'}
              </span>
              <div>
                <div className="font-bold text-lg">{scarcity.label}</div>
                <p className="text-sm opacity-80">{scarcity.detail}</p>
              </div>
            </div>
          </div>

          {/* Grade Distribution Chart */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-6">Grade Distribution</h3>
            <div className="space-y-3">
              {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(grade => {
                const count = popData.distribution[grade];
                const pct = popData.total > 0 ? (count / popData.total * 100) : 0;
                const barWidth = maxCount > 0 ? (count / maxCount * 100) : 0;
                return (
                  <div key={grade} className="flex items-center gap-3">
                    <div className="w-16 text-right">
                      <span className="text-sm font-bold text-zinc-300">PSA {grade}</span>
                    </div>
                    <div className="flex-1 h-7 bg-zinc-800 rounded-lg overflow-hidden relative">
                      <div
                        className={`h-full rounded-lg transition-all duration-700 ${getGradeBarColor(grade)}`}
                        style={{ width: `${barWidth}%` }}
                      />
                      {count > 0 && (
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-white font-medium">
                          {formatNum(count)}
                        </span>
                      )}
                    </div>
                    <div className="w-14 text-right">
                      <span className="text-xs text-zinc-500">{pct.toFixed(1)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Insights */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Population Insights</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <div className="text-amber-400 text-sm font-medium mb-1">Grading Recommendation</div>
                <p className="text-zinc-300 text-sm">
                  {popData.gemRate < 5
                    ? 'Low gem rate makes PSA 10 copies very valuable. Grade if you believe your card is mint — the premium is substantial.'
                    : popData.gemRate < 15
                      ? 'Moderate gem rate. PSA 10 still commands a good premium. Grade cards you believe are clean.'
                      : 'High gem rate means PSA 10 premium is limited. Only grade if the card has significant base value ($50+ raw).'
                  }
                </p>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <div className="text-emerald-400 text-sm font-medium mb-1">Market Impact</div>
                <p className="text-zinc-300 text-sm">
                  {popData.total < 200
                    ? 'Low total population means limited supply. High-grade copies rarely come to market, supporting strong prices.'
                    : popData.total < 1000
                      ? 'Moderate population. Enough copies to establish market prices, but not so many that supply overwhelms demand.'
                      : 'Large population. Supply is sufficient that price is driven more by demand shifts than scarcity.'
                  }
                </p>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <div className="text-sky-400 text-sm font-medium mb-1">PSA 9 vs PSA 10 Gap</div>
                <p className="text-zinc-300 text-sm">
                  {(() => {
                    const ratio = popData.distribution[9] > 0 ? popData.distribution[10] / popData.distribution[9] : 0;
                    if (ratio < 0.2) return 'Very few PSA 10s compared to PSA 9s. The jump from 9 to 10 commands a massive premium — often 3-5x or more.';
                    if (ratio < 0.5) return 'PSA 10 is less common than PSA 9. Expect a 2-3x premium for gem mint over mint.';
                    return 'PSA 10 population is close to PSA 9. The premium for gem mint is moderate — typically 1.5-2x.';
                  })()}
                </p>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <div className="text-violet-400 text-sm font-medium mb-1">Era Context</div>
                <p className="text-zinc-300 text-sm">
                  {selectedCard.year < 1970
                    ? 'Pre-1970 card. Very few survive in high grade. Even PSA 7-8 copies are desirable and valuable.'
                    : selectedCard.year < 1987
                      ? '1970s-80s card. Better survival rates than pre-war, but high grades are still challenging and valuable.'
                      : selectedCard.year <= 1994
                        ? 'Junk wax era. Mass production means high population, but PSA 10 can still be condition-sensitive.'
                        : selectedCard.year < 2015
                          ? 'Modern classic era. Well-preserved, but not over-produced. Population is meaningful for this period.'
                          : 'Ultra-modern card. Many collectors submit immediately from pack to grading. Population grows quickly.'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Disclaimer + Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => { setSelectedCard(null); setQuery(''); }}
              className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors text-sm border border-zinc-700"
            >
              Search Another Card
            </button>
            <Link
              href="/tools/condition-grader"
              className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-lg transition-colors text-sm"
            >
              Grade Your Card →
            </Link>
            <Link
              href="/tools/grading-roi"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors text-sm"
            >
              Check Grading ROI →
            </Link>
          </div>

          <p className="text-zinc-600 text-xs text-center">
            Population data is estimated based on card characteristics and market patterns. For official PSA population data, visit psacard.com/pop. Estimates are illustrative and may not match actual population counts.
          </p>
        </div>
      )}
    </div>
  );
}
