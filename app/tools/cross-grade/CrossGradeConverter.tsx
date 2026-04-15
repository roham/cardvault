'use client';

import { useState } from 'react';
import Link from 'next/link';

type GradingCompany = 'PSA' | 'BGS' | 'CGC' | 'SGC';

interface GradeRow {
  psa: string;
  bgs: string;
  cgc: string;
  sgc: string;
  label: string;
  tier: 'gem' | 'near-mint' | 'mid' | 'low';
  notes: string;
}

const GRADE_TABLE: GradeRow[] = [
  { psa: '10', bgs: '10 (Pristine)', cgc: '10 (Pristine)', sgc: '10 (Pristine)', label: 'Pristine / Perfect', tier: 'gem', notes: 'PSA 10 is NOT equal to BGS 10. BGS 10 (Black Label) and CGC 10 are rarer and command a premium. PSA 10 is closer to BGS 9.5.' },
  { psa: '10', bgs: '9.5 (Gem Mint)', cgc: '9.5 (Gem Mint)', sgc: '10 (Gem)', label: 'Gem Mint', tier: 'gem', notes: 'This is the most common "top grade" tier. A PSA 10 is roughly equivalent to a BGS 9.5. SGC 10 aligns with PSA 10. All are highly desirable.' },
  { psa: '9', bgs: '9 (Mint)', cgc: '9 (Mint)', sgc: '9 (Mint)', label: 'Mint', tier: 'near-mint', notes: 'A great grade across all companies. Minor imperfections visible under 5x magnification. Often 30-60% less than the gem tier.' },
  { psa: '8', bgs: '8.5 (NM-MT+)', cgc: '8.5 (NM-MT+)', sgc: '8.5 (NM-MT+)', label: 'NM-MT+', tier: 'near-mint', notes: 'BGS and CGC offer half grades; PSA does not. A BGS 8.5 falls between PSA 8 and 9. This can create arbitrage opportunities.' },
  { psa: '8', bgs: '8 (NM-MT)', cgc: '8 (NM-MT)', sgc: '8 (NM-MT)', label: 'Near Mint-Mint', tier: 'near-mint', notes: 'Solid collector grade. Light wear on corners, clean surface. Great entry point for vintage cards.' },
  { psa: '7', bgs: '7.5 (NM+)', cgc: '7.5 (NM+)', sgc: '7.5 (NM+)', label: 'Near Mint+', tier: 'mid', notes: 'Half grades from BGS/CGC sit between PSA whole numbers. A BGS 7.5 is between PSA 7 and 8.' },
  { psa: '7', bgs: '7 (NM)', cgc: '7 (NM)', sgc: '7 (NM)', label: 'Near Mint', tier: 'mid', notes: 'Visible wear but still presentable. Common grade for vintage cards from the 1950s-1970s.' },
  { psa: '6', bgs: '6.5 (EX-NM+)', cgc: '6.5 (EX-NM+)', sgc: '6.5 (EX-NM+)', label: 'EX-NM+', tier: 'mid', notes: 'Noticeable wear on corners and edges. Surface may have light scratches. Affordable entry for key vintage cards.' },
  { psa: '6', bgs: '6 (EX-NM)', cgc: '6 (EX-NM)', sgc: '6 (EX-NM)', label: 'Excellent-Near Mint', tier: 'mid', notes: 'Moderate wear. Corners show rounding. Creasing may be present but not prominent.' },
  { psa: '5', bgs: '5 (EX)', cgc: '5 (EX)', sgc: '5 (EX)', label: 'Excellent', tier: 'mid', notes: 'Obvious wear but card is still intact and presentable. Common for 1960s-1970s cards.' },
  { psa: '4', bgs: '4 (VG-EX)', cgc: '4 (VG-EX)', sgc: '4 (VG-EX)', label: 'Very Good-Excellent', tier: 'low', notes: 'Significant corner wear, possible light crease. A good grade for affordable vintage with eye appeal.' },
  { psa: '3', bgs: '3 (VG)', cgc: '3 (VG)', sgc: '3 (VG)', label: 'Very Good', tier: 'low', notes: 'Heavy corner wear, possible creases. Still a complete card. Entry-grade for pre-war and tobacco cards.' },
  { psa: '2', bgs: '2 (Good)', cgc: '2 (Good)', sgc: '2 (Good)', label: 'Good', tier: 'low', notes: 'Major creasing, staining, or wear. For ultra-high-end cards (T206 Wagner, 1952 Mantle), even a PSA 2 is valuable.' },
  { psa: '1', bgs: '1 (Poor)', cgc: '1 (Poor)', sgc: '1 (Poor)', label: 'Poor', tier: 'low', notes: 'Heavily damaged. Missing pieces, heavy creases, stains. Only graded to authenticate extremely rare/valuable cards.' },
];

const COMPANIES: { id: GradingCompany; name: string; color: string; bg: string; turnaround: string; cost: string }[] = [
  { id: 'PSA', name: 'PSA', color: 'text-red-400', bg: 'bg-red-950/40 border-red-800/50', turnaround: '5-65 business days', cost: '$25-$150+' },
  { id: 'BGS', name: 'BGS (Beckett)', color: 'text-blue-400', bg: 'bg-blue-950/40 border-blue-800/50', turnaround: '10-90 business days', cost: '$22-$250+' },
  { id: 'CGC', name: 'CGC', color: 'text-yellow-400', bg: 'bg-yellow-950/40 border-yellow-800/50', turnaround: '15-65 business days', cost: '$20-$150+' },
  { id: 'SGC', name: 'SGC', color: 'text-green-400', bg: 'bg-green-950/40 border-green-800/50', turnaround: '5-20 business days', cost: '$20-$100+' },
];

// Price multipliers relative to PSA (approximate market data)
const PRICE_MULTIPLIERS: Record<GradingCompany, Record<string, number>> = {
  PSA: { '10': 1.0, '9': 1.0, '8': 1.0, '7': 1.0, '6': 1.0, '5': 1.0, '4': 1.0, '3': 1.0, '2': 1.0, '1': 1.0 },
  BGS: { '10': 2.5, '9.5': 1.15, '9': 0.9, '8.5': 0.85, '8': 0.8, '7.5': 0.78, '7': 0.75, '6.5': 0.72, '6': 0.7, '5': 0.7, '4': 0.7, '3': 0.7, '2': 0.7, '1': 0.7 },
  CGC: { '10': 2.0, '9.5': 1.05, '9': 0.85, '8.5': 0.8, '8': 0.75, '7.5': 0.73, '7': 0.7, '6.5': 0.68, '6': 0.65, '5': 0.65, '4': 0.65, '3': 0.65, '2': 0.65, '1': 0.65 },
  SGC: { '10': 0.85, '9': 0.8, '8.5': 0.75, '8': 0.7, '7.5': 0.68, '7': 0.65, '6.5': 0.63, '6': 0.6, '5': 0.6, '4': 0.6, '3': 0.6, '2': 0.6, '1': 0.6 },
};

function getTierColor(tier: string) {
  switch (tier) {
    case 'gem': return 'bg-emerald-900/40 border-emerald-700/50 text-emerald-300';
    case 'near-mint': return 'bg-blue-900/40 border-blue-700/50 text-blue-300';
    case 'mid': return 'bg-yellow-900/40 border-yellow-700/50 text-yellow-300';
    case 'low': return 'bg-red-900/40 border-red-700/50 text-red-300';
    default: return 'bg-gray-900/40 border-gray-700/50 text-gray-300';
  }
}

export default function CrossGradeConverter() {
  const [sourceCompany, setSourceCompany] = useState<GradingCompany>('PSA');
  const [sourceGrade, setSourceGrade] = useState('10');
  const [cardValue, setCardValue] = useState('');
  const [showFullTable, setShowFullTable] = useState(false);

  // Get available grades for selected company
  const availableGrades = Object.keys(PRICE_MULTIPLIERS[sourceCompany]).sort((a, b) => parseFloat(b) - parseFloat(a));

  // Find matching row(s) in the grade table
  const matchingRows = GRADE_TABLE.filter(row => {
    const companyKey = sourceCompany.toLowerCase() as 'psa' | 'bgs' | 'cgc' | 'sgc';
    return row[companyKey].startsWith(sourceGrade);
  });

  // Calculate cross-grade equivalents and estimated values
  const getEquivalents = () => {
    const baseValue = cardValue ? parseFloat(cardValue) : 0;
    const sourceMultiplier = PRICE_MULTIPLIERS[sourceCompany][sourceGrade] || 1;
    const psaEquivValue = baseValue > 0 ? baseValue / sourceMultiplier : 0;

    return COMPANIES.filter(c => c.id !== sourceCompany).map(company => {
      // Find the closest equivalent grade
      const row = matchingRows[0];
      if (!row) return { company, grade: 'N/A', estimatedValue: 0, multiplier: 0, label: '', vsSource: 0 };

      const companyKey = company.id.toLowerCase() as 'psa' | 'bgs' | 'cgc' | 'sgc';
      const equivalentGrade = row[companyKey];
      const gradeNum = equivalentGrade.split(' ')[0];
      const multiplier = PRICE_MULTIPLIERS[company.id][gradeNum] || 0.7;
      const estimatedValue = psaEquivValue * multiplier;

      return {
        company,
        grade: equivalentGrade,
        estimatedValue,
        multiplier,
        label: row.label,
        vsSource: baseValue > 0 ? ((estimatedValue / baseValue - 1) * 100) : 0,
      };
    });
  };

  const equivalents = getEquivalents();
  const hasValue = cardValue && parseFloat(cardValue) > 0;

  // Crossover advice
  const getCrossoverAdvice = () => {
    if (sourceCompany === 'BGS' && sourceGrade === '9.5') {
      return { text: 'BGS 9.5 to PSA 10 crossover is the most popular regrading play. Success rate ~60-70% for cards with strong sub-grades (all 9.5+). The PSA 10 premium often justifies the $50-150 grading cost.', verdict: 'High Potential' };
    }
    if (sourceCompany === 'CGC' && parseFloat(sourceGrade) >= 9) {
      return { text: 'CGC to PSA crossovers can unlock value since PSA commands higher market prices. CGC 9.5 has ~50-60% chance of crossing to PSA 10. Worth pursuing for cards valued over $200.', verdict: 'Worth Considering' };
    }
    if (sourceCompany === 'SGC' && parseFloat(sourceGrade) >= 9) {
      return { text: 'SGC to PSA crossovers are popular for vintage cards. SGC grades vintage more strictly, so SGC 8+ often crosses to the same or higher PSA grade. Modern cards have ~40-50% crossover success.', verdict: 'Depends on Era' };
    }
    if (sourceCompany === 'PSA' && sourceGrade === '9') {
      return { text: 'PSA 9 rarely upgrades to PSA 10 on review (~5-15% success). Consider cracking and submitting to BGS where you might land a 9.5 with sub-grades. Not recommended unless card value exceeds $500.', verdict: 'Low Success Rate' };
    }
    return { text: 'Crossover grading works best when moving from a less-liquid grading company to PSA, which has the highest market liquidity. Factor in grading costs ($25-150), shipping ($10-20), and insurance before deciding.', verdict: 'Evaluate ROI First' };
  };

  const advice = getCrossoverAdvice();

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Convert a Grade</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Source Company */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Grading Company</label>
            <select
              value={sourceCompany}
              onChange={(e) => {
                const newCompany = e.target.value as GradingCompany;
                setSourceCompany(newCompany);
                const newGrades = Object.keys(PRICE_MULTIPLIERS[newCompany]);
                if (!newGrades.includes(sourceGrade)) {
                  setSourceGrade(newGrades[0]);
                }
              }}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              {COMPANIES.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Source Grade */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Grade</label>
            <select
              value={sourceGrade}
              onChange={(e) => setSourceGrade(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              {availableGrades.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Card Value (optional) */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Card Value (optional)</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">$</span>
              <input
                type="number"
                value={cardValue}
                onChange={(e) => setCardValue(e.target.value)}
                placeholder="e.g. 500"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg pl-7 pr-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {equivalents.map(eq => (
          <div key={eq.company.id} className={`rounded-xl p-5 border ${eq.company.bg}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-sm font-bold ${eq.company.color}`}>{eq.company.name}</span>
              <span className="text-xs text-gray-500">{eq.company.turnaround}</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{eq.grade}</div>
            <div className="text-xs text-gray-400 mb-3">{eq.label}</div>
            {hasValue && (
              <div className="pt-3 border-t border-gray-700/50">
                <div className="text-lg font-semibold text-white">
                  ${eq.estimatedValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
                <div className={`text-xs font-medium ${eq.vsSource > 0 ? 'text-emerald-400' : eq.vsSource < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                  {eq.vsSource > 0 ? '+' : ''}{eq.vsSource.toFixed(1)}% vs your {sourceCompany} {sourceGrade}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Crossover Advice */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl" aria-hidden="true">&#9889;</span>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-white font-semibold">Crossover Advice</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                advice.verdict === 'High Potential' ? 'bg-emerald-900/60 text-emerald-300' :
                advice.verdict === 'Worth Considering' ? 'bg-blue-900/60 text-blue-300' :
                advice.verdict === 'Low Success Rate' ? 'bg-red-900/60 text-red-300' :
                'bg-yellow-900/60 text-yellow-300'
              }`}>
                {advice.verdict}
              </span>
            </div>
            <p className="text-gray-400 text-sm">{advice.text}</p>
          </div>
        </div>
      </div>

      {/* Price Multiplier Comparison */}
      {hasValue && (
        <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">Market Value by Company</h3>
          <p className="text-gray-400 text-sm mb-4">
            Approximate market value of equivalent grades across companies, based on a {sourceCompany} {sourceGrade} valued at ${parseFloat(cardValue).toLocaleString()}.
          </p>
          <div className="space-y-3">
            {[{ company: COMPANIES.find(c => c.id === sourceCompany)!, grade: sourceGrade, value: parseFloat(cardValue) }, ...equivalents.map(eq => ({ company: eq.company, grade: eq.grade.split(' ')[0], value: eq.estimatedValue }))].sort((a, b) => b.value - a.value).map((item, i) => {
              const maxValue = Math.max(parseFloat(cardValue), ...equivalents.map(eq => eq.estimatedValue));
              const pct = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
              return (
                <div key={item.company.id} className="flex items-center gap-3">
                  <div className={`w-20 text-sm font-medium ${item.company.color}`}>{item.company.name}</div>
                  <div className="flex-1">
                    <div className="h-7 bg-gray-800 rounded-lg overflow-hidden relative">
                      <div
                        className={`h-full rounded-lg transition-all duration-500 ${
                          item.company.id === 'PSA' ? 'bg-red-800/60' :
                          item.company.id === 'BGS' ? 'bg-blue-800/60' :
                          item.company.id === 'CGC' ? 'bg-yellow-800/60' :
                          'bg-green-800/60'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                      <span className="absolute inset-0 flex items-center px-3 text-xs text-white font-medium">
                        {item.grade} &mdash; ${item.value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>
                  {i === 0 && <span className="text-xs text-emerald-400 font-medium">Highest</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Full Grade Equivalency Table */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Full Grade Equivalency Table</h3>
          <button
            onClick={() => setShowFullTable(!showFullTable)}
            className="text-sm text-emerald-400 hover:text-emerald-300"
          >
            {showFullTable ? 'Collapse' : 'Expand All'}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 px-3 text-gray-400 font-medium">Tier</th>
                <th className="text-left py-2 px-3 text-red-400 font-medium">PSA</th>
                <th className="text-left py-2 px-3 text-blue-400 font-medium">BGS</th>
                <th className="text-left py-2 px-3 text-yellow-400 font-medium">CGC</th>
                <th className="text-left py-2 px-3 text-green-400 font-medium">SGC</th>
              </tr>
            </thead>
            <tbody>
              {(showFullTable ? GRADE_TABLE : GRADE_TABLE.slice(0, 6)).map((row, i) => {
                const isHighlighted = matchingRows.includes(row);
                return (
                  <tr
                    key={i}
                    className={`border-b border-gray-800/50 ${isHighlighted ? 'bg-emerald-950/30' : 'hover:bg-gray-800/30'}`}
                  >
                    <td className="py-2.5 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getTierColor(row.tier)}`}>
                        {row.label}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-white font-medium">{row.psa}</td>
                    <td className="py-2.5 px-3 text-white">{row.bgs}</td>
                    <td className="py-2.5 px-3 text-white">{row.cgc}</td>
                    <td className="py-2.5 px-3 text-white">{row.sgc}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!showFullTable && (
          <button
            onClick={() => setShowFullTable(true)}
            className="mt-3 text-sm text-gray-400 hover:text-white"
          >
            Show {GRADE_TABLE.length - 6} more grades...
          </button>
        )}
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-3">PSA 10 vs BGS 10</h3>
          <p className="text-gray-400 text-sm">A <strong className="text-white">BGS 10 (Black Label)</strong> is significantly rarer and more valuable than a PSA 10. BGS requires all four sub-grades to be 10. A PSA 10 is closer to a BGS 9.5 Gem Mint. For top-tier cards, a BGS 10 can command 2-5x the PSA 10 price.</p>
        </div>
        <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-3">Half Grades Matter</h3>
          <p className="text-gray-400 text-sm">BGS, CGC, and SGC offer <strong className="text-white">half grades</strong> (8.5, 9.5). PSA does not. A BGS 8.5 falls between PSA 8 and 9. This creates <strong className="text-white">arbitrage opportunities</strong> &mdash; a BGS 8.5 card priced like a PSA 8 might cross to a PSA 9.</p>
        </div>
        <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-3">Vintage vs Modern</h3>
          <p className="text-gray-400 text-sm">SGC is <strong className="text-white">preferred for vintage cards</strong> (pre-1980) &mdash; their tuxedo holders present beautifully and SGC grades vintage more strictly. For <strong className="text-white">modern cards</strong>, PSA has the highest liquidity and often the highest prices. BGS is king for basketball Prizm cards.</p>
        </div>
        <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-3">Crossover Economics</h3>
          <p className="text-gray-400 text-sm">Only crossover if the <strong className="text-white">price difference exceeds grading costs</strong> ($25-150 + shipping + insurance). Best play: BGS 9.5 to PSA 10 on cards worth $500+. A 60-70% success rate at $100 cost means you need at least a $200 premium to break even.</p>
        </div>
      </div>

      {/* Related Tools */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">Related Tools</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/tools/grading-roi', label: 'Grading ROI Calculator' },
            { href: '/tools/submission-planner', label: 'Submission Planner' },
            { href: '/tools/condition-grader', label: 'Condition Self-Grader' },
            { href: '/tools/pop-report', label: 'Population Report' },
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
