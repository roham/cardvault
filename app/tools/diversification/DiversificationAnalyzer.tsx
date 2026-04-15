'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

/* ───── Types ───── */
interface PortfolioCard {
  id: string;
  name: string;
  sport: string;
  era: string;
  value: number;
  grade: string;
  isRookie: boolean;
}

const SPORTS = ['Baseball', 'Basketball', 'Football', 'Hockey', 'Pokemon', 'Other'];
const ERAS = ['Vintage (Pre-1970)', 'Junk Wax (1987-1993)', 'Modern (1994-2009)', 'Ultra-Modern (2010-2019)', 'Current (2020+)'];
const GRADES = ['Raw', 'PSA 1-6', 'PSA 7-8', 'PSA 9', 'PSA 10', 'BGS 9.5+', 'CGC/SGC'];
const VALUE_TIERS = ['Under $10', '$10-$49', '$50-$199', '$200-$999', '$1,000-$4,999', '$5,000+'];

function getValueTier(value: number): string {
  if (value < 10) return 'Under $10';
  if (value < 50) return '$10-$49';
  if (value < 200) return '$50-$199';
  if (value < 1000) return '$200-$999';
  if (value < 5000) return '$1,000-$4,999';
  return '$5,000+';
}

function entropy(counts: number[]): number {
  const total = counts.reduce((a, b) => a + b, 0);
  if (total === 0) return 0;
  let h = 0;
  for (const c of counts) {
    if (c > 0) {
      const p = c / total;
      h -= p * Math.log2(p);
    }
  }
  return h;
}

function diversityScore(counts: number[], maxCategories: number): number {
  const maxEntropy = Math.log2(Math.min(counts.filter(c => c > 0).length, maxCategories) || 1);
  if (maxEntropy === 0) return 0;
  return Math.min(100, Math.round((entropy(counts) / Math.log2(maxCategories)) * 100));
}

function scoreLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: 'Excellent', color: 'text-emerald-400' };
  if (score >= 60) return { label: 'Good', color: 'text-blue-400' };
  if (score >= 40) return { label: 'Moderate', color: 'text-yellow-400' };
  if (score >= 20) return { label: 'Concentrated', color: 'text-orange-400' };
  return { label: 'Very Concentrated', color: 'text-red-400' };
}

let idCounter = 0;
function nextId() { return `card-${++idCounter}`; }

export default function DiversificationAnalyzer() {
  const [cards, setCards] = useState<PortfolioCard[]>([]);
  const [showAdd, setShowAdd] = useState(true);

  // Form state
  const [name, setName] = useState('');
  const [sport, setSport] = useState(SPORTS[0]);
  const [era, setEra] = useState(ERAS[4]);
  const [value, setValue] = useState('');
  const [grade, setGrade] = useState(GRADES[0]);
  const [isRookie, setIsRookie] = useState(false);

  const addCard = () => {
    if (!name.trim()) return;
    setCards(prev => [...prev, {
      id: nextId(),
      name: name.trim(),
      sport,
      era,
      value: parseFloat(value) || 0,
      grade,
      isRookie,
    }]);
    setName('');
    setValue('');
    setIsRookie(false);
  };

  const removeCard = (id: string) => setCards(prev => prev.filter(c => c.id !== id));

  const analysis = useMemo(() => {
    if (cards.length < 2) return null;

    const sportCounts = SPORTS.map(s => cards.filter(c => c.sport === s).length);
    const eraCounts = ERAS.map(e => cards.filter(c => c.era === e).length);
    const gradeCounts = GRADES.map(g => cards.filter(c => c.grade === g).length);
    const valueTierCounts = VALUE_TIERS.map(t => cards.filter(c => getValueTier(c.value) === t).length);

    const sportScore = diversityScore(sportCounts, SPORTS.length);
    const eraScore = diversityScore(eraCounts, ERAS.length);
    const gradeScore = diversityScore(gradeCounts, GRADES.length);
    const valueScore = diversityScore(valueTierCounts, VALUE_TIERS.length);

    const overall = Math.round((sportScore * 0.3 + eraScore * 0.25 + gradeScore * 0.2 + valueScore * 0.25));

    const totalValue = cards.reduce((s, c) => s + c.value, 0);
    const avgValue = totalValue / cards.length;
    const rookiePercent = Math.round((cards.filter(c => c.isRookie).length / cards.length) * 100);

    // Top concentration risk
    const sportMode = SPORTS[sportCounts.indexOf(Math.max(...sportCounts))];
    const sportModePct = Math.round((Math.max(...sportCounts) / cards.length) * 100);

    // Recommendations
    const recs: string[] = [];
    if (sportScore < 40) recs.push(`Your portfolio is ${sportModePct}% ${sportMode}. Consider adding cards from other sports to reduce single-sport risk.`);
    if (eraScore < 40) {
      const topEra = ERAS[eraCounts.indexOf(Math.max(...eraCounts))];
      recs.push(`Heavy concentration in ${topEra} cards. Mix in cards from different eras for better diversification.`);
    }
    if (gradeScore < 30) recs.push('Most cards are the same grade type. Mixing raw and graded cards, or different grade levels, reduces grading-company risk.');
    if (valueScore < 30) recs.push('Cards are clustered in one value tier. Spread across price points — some affordable staples and some premium anchors.');
    if (rookiePercent > 70) recs.push('Over 70% rookies. Rookies are volatile — add some established star cards for stability.');
    if (rookiePercent < 10 && cards.length > 5) recs.push('Very few rookies. Adding some rookie cards provides upside potential.');
    if (totalValue > 0 && cards.some(c => c.value > totalValue * 0.5)) recs.push('One card represents over 50% of your portfolio value. This is high single-card risk.');
    if (recs.length === 0) recs.push('Your portfolio is well-diversified across all dimensions. Keep it up!');

    return {
      sportScore, eraScore, gradeScore, valueScore, overall,
      totalValue, avgValue, rookiePercent,
      sportCounts, eraCounts, gradeCounts, valueTierCounts,
      sportMode, sportModePct,
      recs,
    };
  }, [cards]);

  return (
    <div className="space-y-8">
      {/* Add Card Form */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">
            Your Portfolio ({cards.length} card{cards.length !== 1 ? 's' : ''})
          </h2>
          <button onClick={() => setShowAdd(!showAdd)} className="text-sm text-emerald-400 hover:text-emerald-300">
            {showAdd ? 'Hide Form' : '+ Add Card'}
          </button>
        </div>

        {showAdd && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Card Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="2024 Prizm Luka Doncic"
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
                onKeyDown={e => e.key === 'Enter' && addCard()} />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Sport</label>
              <select value={sport} onChange={e => setSport(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500">
                {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Era</label>
              <select value={era} onChange={e => setEra(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500">
                {ERAS.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Estimated Value ($)</label>
              <input type="number" min="0" value={value} onChange={e => setValue(e.target.value)} placeholder="100"
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Grade</label>
              <select value={grade} onChange={e => setGrade(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500">
                {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="flex items-end gap-3">
              <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer pb-2">
                <input type="checkbox" checked={isRookie} onChange={e => setIsRookie(e.target.checked)}
                  className="rounded border-gray-600" />
                Rookie Card
              </label>
              <button onClick={addCard}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-500 transition-colors">
                Add
              </button>
            </div>
          </div>
        )}

        {/* Card List */}
        {cards.length > 0 && (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {cards.map(c => (
              <div key={c.id} className="flex items-center justify-between bg-gray-900/50 rounded-lg px-3 py-2">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-white text-sm truncate">{c.name}</span>
                  <span className="text-xs text-gray-500">{c.sport} &middot; {c.grade}</span>
                  {c.isRookie && <span className="text-xs bg-yellow-600/30 text-yellow-400 px-1.5 py-0.5 rounded">RC</span>}
                  {c.value > 0 && <span className="text-xs text-emerald-400">${c.value.toLocaleString()}</span>}
                </div>
                <button onClick={() => removeCard(c.id)} className="text-gray-600 hover:text-red-400 text-sm ml-2">x</button>
              </div>
            ))}
          </div>
        )}

        {cards.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-4">Add at least 2 cards to see your diversification analysis.</p>
        )}
      </div>

      {/* Analysis Results */}
      {analysis && (
        <>
          {/* Overall Score */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 text-center">
            <div className="text-6xl font-bold text-white mb-2">{analysis.overall}</div>
            <div className={`text-lg font-medium ${scoreLabel(analysis.overall).color} mb-1`}>
              {scoreLabel(analysis.overall).label} Diversification
            </div>
            <p className="text-gray-500 text-sm">
              {cards.length} cards &middot; ${analysis.totalValue.toLocaleString()} total value &middot; {analysis.rookiePercent}% rookies
            </p>
          </div>

          {/* Dimension Scores */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Sport Mix', score: analysis.sportScore, weight: '30%' },
              { label: 'Era Spread', score: analysis.eraScore, weight: '25%' },
              { label: 'Value Spread', score: analysis.valueScore, weight: '25%' },
              { label: 'Grade Mix', score: analysis.gradeScore, weight: '20%' },
            ].map(d => (
              <div key={d.label} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 text-center">
                <div className={`text-2xl font-bold ${scoreLabel(d.score).color}`}>{d.score}</div>
                <div className="text-sm text-white mt-1">{d.label}</div>
                <div className="text-xs text-gray-500">Weight: {d.weight}</div>
                <div className="mt-2 h-1.5 bg-gray-900 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${d.score >= 60 ? 'bg-emerald-500' : d.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${d.score}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Distribution Breakdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Sport Distribution */}
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5">
              <h3 className="font-semibold text-white mb-3 text-sm">Sport Distribution</h3>
              {SPORTS.map((s, i) => {
                const count = analysis.sportCounts[i];
                if (count === 0) return null;
                const pct = Math.round((count / cards.length) * 100);
                return (
                  <div key={s} className="mb-2">
                    <div className="flex justify-between text-xs text-gray-400 mb-0.5">
                      <span>{s}</span>
                      <span>{count} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 bg-gray-900 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Era Distribution */}
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5">
              <h3 className="font-semibold text-white mb-3 text-sm">Era Distribution</h3>
              {ERAS.map((e, i) => {
                const count = analysis.eraCounts[i];
                if (count === 0) return null;
                const pct = Math.round((count / cards.length) * 100);
                return (
                  <div key={e} className="mb-2">
                    <div className="flex justify-between text-xs text-gray-400 mb-0.5">
                      <span>{e}</span>
                      <span>{count} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 bg-gray-900 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommendations */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">Recommendations</h2>
            <div className="space-y-3">
              {analysis.recs.map((r, i) => (
                <div key={i} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 flex items-start gap-3">
                  <span className="text-emerald-400 text-lg mt-0.5">{i === 0 && analysis.recs.length === 1 ? '✓' : '→'}</span>
                  <p className="text-gray-300 text-sm">{r}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Related Tools */}
      <section className="pt-6 border-t border-gray-800">
        <h2 className="text-lg font-semibold text-white mb-4">Related Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { href: '/tools/investment-calc', label: 'Investment Calculator', desc: 'Returns vs S&P 500, Gold, Bitcoin' },
            { href: '/tools/collection-value', label: 'Collection Value', desc: 'Estimate total collection worth' },
            { href: '/collection-heatmap', label: 'Collection Heatmap', desc: 'Visual analytics for your cards' },
          ].map(t => (
            <Link key={t.href} href={t.href} className="block bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 hover:bg-gray-700/50 transition-colors">
              <span className="text-white font-medium text-sm">{t.label}</span>
              <span className="block text-gray-500 text-xs mt-1">{t.desc}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
