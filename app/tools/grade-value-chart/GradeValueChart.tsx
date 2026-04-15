'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

const GRADES = [
  { grade: 10, label: 'Gem Mint', abbr: 'PSA 10' },
  { grade: 9, label: 'Mint', abbr: 'PSA 9' },
  { grade: 8, label: 'NM-MT', abbr: 'PSA 8' },
  { grade: 7, label: 'Near Mint', abbr: 'PSA 7' },
  { grade: 6, label: 'EX-MT', abbr: 'PSA 6' },
  { grade: 5, label: 'Excellent', abbr: 'PSA 5' },
  { grade: 4, label: 'VG-EX', abbr: 'PSA 4' },
  { grade: 3, label: 'Very Good', abbr: 'PSA 3' },
  { grade: 2, label: 'Good', abbr: 'PSA 2' },
  { grade: 1, label: 'Poor', abbr: 'PSA 1' },
];

// Multipliers relative to PSA 10 value — modern cards (post-1985)
const MODERN_MULTIPLIERS: Record<number, number> = {
  10: 1.0, 9: 0.40, 8: 0.18, 7: 0.10, 6: 0.06,
  5: 0.04, 4: 0.025, 3: 0.015, 2: 0.008, 1: 0.004,
};

// Vintage cards (pre-1985) hold value better in lower grades
const VINTAGE_MULTIPLIERS: Record<number, number> = {
  10: 1.0, 9: 0.50, 8: 0.28, 7: 0.18, 6: 0.12,
  5: 0.08, 4: 0.055, 3: 0.035, 2: 0.02, 1: 0.012,
};

const GRADING_COSTS: Record<string, number> = {
  'PSA Economy': 20,
  'PSA Regular': 50,
  'PSA Express': 100,
  'BGS Standard': 30,
  'CGC Standard': 25,
  'SGC Standard': 22,
};

function parseValue(s: string): number {
  const m = s.match(/\$([0-9,]+)/);
  if (!m) return 0;
  return parseInt(m[1].replace(/,/g, ''), 10);
}

function fmt(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  if (n >= 1) return `$${Math.round(n).toLocaleString()}`;
  return '<$1';
}

export default function GradeValueChart() {
  const [query, setQuery] = useState('');
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [gradingCost, setGradingCost] = useState(25);

  const results = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    return sportsCards
      .filter(c => c.name.toLowerCase().includes(q) || c.player.toLowerCase().includes(q))
      .slice(0, 8);
  }, [query]);

  const card = useMemo(() => {
    if (!selectedSlug) return null;
    return sportsCards.find(c => c.slug === selectedSlug) ?? null;
  }, [selectedSlug]);

  const analysis = useMemo(() => {
    if (!card) return null;
    const gemValue = parseValue(card.estimatedValueGem);
    const rawValue = parseValue(card.estimatedValueRaw);
    if (gemValue <= 0) return null;

    const isVintage = card.year < 1985;
    const mults = isVintage ? VINTAGE_MULTIPLIERS : MODERN_MULTIPLIERS;

    const grades = GRADES.map(g => {
      const value = Math.round(gemValue * mults[g.grade]);
      const roi = g.grade >= 7 ? ((value - gradingCost) / gradingCost * 100) : null;
      return { ...g, value, roi };
    });

    const maxValue = grades[0].value;

    // Sweet spot: highest ROI grade >= 7 where grading makes sense
    const gradeable = grades.filter(g => g.grade >= 7 && g.roi !== null && g.roi > 0);
    const sweetSpot = gradeable.length > 0
      ? gradeable.reduce((best, g) => (g.roi! > best.roi! ? g : best))
      : null;

    // Buy recommendation: best value-per-dollar grade
    const buyRec = grades.filter(g => g.grade >= 5 && g.grade <= 9)
      .reduce((best, g) => {
        const ratio = g.value / (g.grade * 10); // rough value-to-effort ratio
        const bestRatio = best.value / (best.grade * 10);
        return ratio > bestRatio ? g : best;
      });

    return { grades, maxValue, sweetSpot, buyRec, gemValue, rawValue, isVintage };
  }, [card, gradingCost]);

  return (
    <div>
      {/* Search */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-400 mb-2">Search a card</label>
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setSelectedSlug(null); }}
          placeholder="e.g. 2023 Topps Chrome Ohtani or Mike Trout"
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        />
        {results.length > 0 && !selectedSlug && (
          <div className="mt-2 bg-gray-800 border border-gray-700 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
            {results.map(c => (
              <button
                key={c.slug}
                onClick={() => { setSelectedSlug(c.slug); setQuery(c.name); }}
                className="w-full text-left px-4 py-3 hover:bg-gray-700 border-b border-gray-700/50 last:border-0 transition-colors"
              >
                <span className="text-white text-sm">{c.name}</span>
                <span className="text-gray-500 text-xs ml-2">{c.sport}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grading cost input */}
      {card && analysis && (
        <>
          <div className="mb-6 flex items-center gap-4">
            <label className="text-sm text-gray-400">Grading cost:</label>
            <div className="flex gap-2 flex-wrap">
              {[20, 25, 30, 50, 100].map(cost => (
                <button
                  key={cost}
                  onClick={() => setGradingCost(cost)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    gradingCost === cost
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  ${cost}
                </button>
              ))}
              <input
                type="number"
                value={gradingCost}
                onChange={e => setGradingCost(Math.max(0, Number(e.target.value)))}
                className="w-20 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-white text-sm text-center"
              />
            </div>
          </div>

          {/* Card info bar */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 mb-6 flex flex-wrap gap-4 items-center">
            <div>
              <span className="text-xs text-gray-500 block">Card</span>
              <Link href={`/sports/${card.slug}`} className="text-blue-400 hover:underline text-sm font-medium">{card.name}</Link>
            </div>
            <div>
              <span className="text-xs text-gray-500 block">Raw Value</span>
              <span className="text-white text-sm font-medium">{card.estimatedValueRaw}</span>
            </div>
            <div>
              <span className="text-xs text-gray-500 block">Gem Mint Value</span>
              <span className="text-emerald-400 text-sm font-bold">{card.estimatedValueGem}</span>
            </div>
            <div>
              <span className="text-xs text-gray-500 block">Era</span>
              <span className={`text-sm font-medium ${analysis.isVintage ? 'text-amber-400' : 'text-blue-400'}`}>
                {analysis.isVintage ? 'Vintage (pre-1985)' : 'Modern'}
              </span>
            </div>
          </div>

          {/* Sweet Spot + Buy Rec */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {analysis.sweetSpot && (
              <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-xl p-4">
                <div className="text-emerald-400 font-semibold text-sm mb-1">Best Grade to Target (Sweet Spot)</div>
                <div className="text-2xl font-bold text-white">{analysis.sweetSpot.abbr}</div>
                <div className="text-gray-400 text-sm mt-1">
                  Value: {fmt(analysis.sweetSpot.value)} &middot; ROI: {analysis.sweetSpot.roi?.toFixed(0)}% after ${gradingCost} grading
                </div>
              </div>
            )}
            <div className="bg-blue-950/30 border border-blue-800/50 rounded-xl p-4">
              <div className="text-blue-400 font-semibold text-sm mb-1">Best Buy-at-Grade</div>
              <div className="text-2xl font-bold text-white">{analysis.buyRec.abbr}</div>
              <div className="text-gray-400 text-sm mt-1">
                Value: {fmt(analysis.buyRec.value)} &middot; Good balance of quality and price
              </div>
            </div>
          </div>

          {/* Grade value chart */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden mb-8">
            <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-white font-semibold">Value by Grade</h3>
              <span className="text-xs text-gray-500">Estimated market values</span>
            </div>
            <div className="divide-y divide-gray-700/50">
              {analysis.grades.map(g => {
                const pct = analysis.maxValue > 0 ? (g.value / analysis.maxValue) * 100 : 0;
                const isSweetSpot = analysis.sweetSpot?.grade === g.grade;
                return (
                  <div
                    key={g.grade}
                    className={`px-4 py-3 flex items-center gap-3 ${isSweetSpot ? 'bg-emerald-950/20' : ''}`}
                  >
                    <div className="w-16 shrink-0">
                      <span className={`text-sm font-bold ${isSweetSpot ? 'text-emerald-400' : 'text-white'}`}>
                        {g.abbr}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-900 rounded-full h-5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isSweetSpot
                                ? 'bg-gradient-to-r from-emerald-600 to-emerald-400'
                                : g.grade >= 9
                                  ? 'bg-gradient-to-r from-blue-600 to-blue-400'
                                  : g.grade >= 7
                                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-400'
                                    : 'bg-gradient-to-r from-gray-600 to-gray-500'
                            }`}
                            style={{ width: `${Math.max(pct, 2)}%` }}
                          />
                        </div>
                        <span className="text-white font-medium text-sm w-20 text-right shrink-0">{fmt(g.value)}</span>
                      </div>
                    </div>
                    <div className="w-24 text-right shrink-0">
                      {g.roi !== null ? (
                        <span className={`text-xs font-medium ${g.roi > 100 ? 'text-emerald-400' : g.roi > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {g.roi > 0 ? '+' : ''}{g.roi.toFixed(0)}% ROI
                        </span>
                      ) : (
                        <span className="text-xs text-gray-600">—</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Grading cost breakdown */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 mb-8">
            <h3 className="text-white font-semibold mb-3">Grading Service Costs</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(GRADING_COSTS).map(([svc, cost]) => {
                const gem10ROI = analysis.gemValue > 0 ? ((analysis.gemValue - cost) / cost * 100) : 0;
                return (
                  <button
                    key={svc}
                    onClick={() => setGradingCost(cost)}
                    className={`text-left p-3 rounded-lg border transition-colors ${
                      gradingCost === cost
                        ? 'border-blue-500 bg-blue-950/30'
                        : 'border-gray-700 bg-gray-900/50 hover:bg-gray-800'
                    }`}
                  >
                    <div className="text-white text-sm font-medium">{svc}</div>
                    <div className="text-gray-400 text-xs">${cost}</div>
                    <div className="text-xs mt-1">
                      <span className={gem10ROI > 100 ? 'text-emerald-400' : gem10ROI > 0 ? 'text-yellow-400' : 'text-red-400'}>
                        PSA 10 ROI: {gem10ROI > 0 ? '+' : ''}{gem10ROI.toFixed(0)}%
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <h3 className="text-white font-semibold mb-3">Grade Investment Tips</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">&#x2022;</span>PSA 9 often offers the best value — 35-50% of PSA 10 price at a fraction of the difficulty</li>
              <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">&#x2022;</span>The PSA 9-to-10 jump is the biggest multiplier in cards — a 2-3x jump for just one grade</li>
              <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">&#x2022;</span>Vintage cards (pre-1985) hold value better in lower grades because condition-scarce copies are rare</li>
              <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">&#x2022;</span>Only grade cards where the PSA 10 value exceeds 4x the grading cost for positive expected ROI</li>
              <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">&#x2022;</span>BGS 9.5 (Gem Mint) trades close to PSA 10 value — consider BGS if you want half-grade precision</li>
              <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">&#x2022;</span>Buying raw cards and grading them yourself is how flippers create value — the grade unlock is the alpha</li>
            </ul>
          </div>
        </>
      )}

      {/* Empty state */}
      {!card && (
        <div className="text-center py-16 text-gray-500">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-lg">Search for any card above to see its value at every PSA grade</p>
          <p className="text-sm mt-2">5,200+ sports cards with instant grade value estimates</p>
        </div>
      )}

      {/* Related tools */}
      <div className="mt-10 pt-6 border-t border-gray-800">
        <h3 className="text-white font-semibold mb-3">Related Tools</h3>
        <div className="flex flex-wrap gap-2">
          {[
            { href: '/tools/grading-roi', label: 'Grading ROI Calculator' },
            { href: '/tools/cross-grade', label: 'Cross-Grade Converter' },
            { href: '/tools/bgs-subgrade', label: 'BGS Subgrade Calculator' },
            { href: '/tools/submission-planner', label: 'Submission Planner' },
            { href: '/tools/pop-report', label: 'Population Report' },
            { href: '/tools/condition-grader', label: 'Condition Self-Grader' },
          ].map(t => (
            <Link key={t.href} href={t.href} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 rounded-lg text-sm transition-colors">
              {t.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
