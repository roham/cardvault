'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

/* ── helpers ─────────────────────────────────────────────────────── */

function parseValue(raw: string): number {
  const m = raw.match(/\$(\d[\d,]*)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
}

function parseGem(raw: string): number {
  const m = raw.match(/\$(\d[\d,]*)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
}

const GRADES = ['Raw', 'PSA 1', 'PSA 2', 'PSA 3', 'PSA 4', 'PSA 5', 'PSA 6', 'PSA 7', 'PSA 8', 'PSA 9', 'PSA 10'] as const;
const GRADE_MULTIPLIERS = [0.3, 0.1, 0.12, 0.15, 0.2, 0.3, 0.4, 0.55, 0.75, 1.0, 3.5];
const CONDITION_MAP: Record<string, number> = {
  'mint': 9, 'near-mint': 8, 'excellent': 7, 'very-good': 5, 'good': 4, 'fair': 2, 'poor': 1,
};

const PLATFORMS = [
  { name: 'eBay', fee: 0.13, time: '3-7 days', audience: 'Largest marketplace, global reach', best: 'Most cards' },
  { name: 'COMC', fee: 0.15, time: '1-4 weeks', audience: 'Dedicated card marketplace', best: 'Mid-range cards $5-$200' },
  { name: 'MySlabs', fee: 0.08, time: '1-3 days', audience: 'Graded card specialists', best: 'PSA/BGS slabs' },
  { name: 'Facebook Groups', fee: 0.0, time: '1-7 days', audience: 'Community collectors', best: 'Common and vintage cards' },
  { name: 'Card Shows', fee: 0.0, time: 'Same day', audience: 'Local collectors and dealers', best: 'Bulk lots, vintage' },
  { name: 'Heritage Auctions', fee: 0.20, time: '2-4 months', audience: 'High-end collectors', best: 'Cards worth $1,000+' },
];

interface AppraisalResult {
  card: typeof sportsCards[number];
  condition: string;
  estimatedGrade: number;
  rawValue: number;
  gradedValue: number;
  gradingROI: number;
  shouldGrade: boolean;
  bestPlatform: typeof PLATFORMS[number];
  comparables: typeof sportsCards[number][];
  rarity: string;
  investmentOutlook: string;
  gradeCurve: { grade: string; value: number }[];
}

/* ── component ───────────────────────────────────────────────────── */

export default function AppraisalClient() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCard, setSelectedCard] = useState<typeof sportsCards[number] | null>(null);
  const [condition, setCondition] = useState('near-mint');
  const [hasCrease, setHasCrease] = useState(false);
  const [hasStain, setHasStain] = useState(false);
  const [offCenter, setOffCenter] = useState(false);
  const [result, setResult] = useState<AppraisalResult | null>(null);
  const [copied, setCopied] = useState(false);

  const SPORTS_COLORS: Record<string, string> = {
    baseball: 'text-rose-400', basketball: 'text-orange-400', football: 'text-blue-400', hockey: 'text-cyan-400',
  };
  const SPORTS_ICONS: Record<string, string> = {
    baseball: '⚾', basketball: '🏀', football: '🏈', hockey: '🏒',
  };

  const searchResults = useMemo(() => {
    if (searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase();
    return sportsCards
      .filter(c => (c.sport as string) !== 'pokemon')
      .filter(c => c.name.toLowerCase().includes(q) || c.player.toLowerCase().includes(q))
      .slice(0, 12);
  }, [searchQuery]);

  const generateAppraisal = useCallback(() => {
    if (!selectedCard) return;

    const rawVal = parseValue(selectedCard.estimatedValueRaw || '$0');
    const gemVal = parseGem(selectedCard.estimatedValueGem || '$0');

    // Estimate grade based on condition + defects
    let estGrade = CONDITION_MAP[condition] || 7;
    if (hasCrease) estGrade = Math.min(estGrade, 4);
    if (hasStain) estGrade = Math.min(estGrade, 5);
    if (offCenter) estGrade = Math.max(1, estGrade - 1);

    // Calculate values at different grades
    const baseValue = rawVal > 0 ? rawVal : 5;
    const gemMultiplier = gemVal > 0 ? gemVal / Math.max(baseValue, 1) : 3.5;

    const gradeCurve = GRADES.map((grade, i) => {
      const mult = i === GRADES.length - 1 ? gemMultiplier : GRADE_MULTIPLIERS[i] * (gemMultiplier / 3.5);
      return { grade, value: Math.round(baseValue * Math.max(mult, 0.1)) };
    });

    const currentGradeIdx = Math.min(Math.max(estGrade, 0), 10);
    const gradedValue = gradeCurve[currentGradeIdx]?.value || baseValue;

    // Grading ROI
    const gradingCost = baseValue > 500 ? 150 : baseValue > 100 ? 50 : 30;
    const gradingROI = ((gradedValue - baseValue - gradingCost) / (baseValue + gradingCost)) * 100;
    const shouldGrade = gradingROI > 20 && estGrade >= 7;

    // Best selling platform
    const bestPlatform = gradedValue > 1000
      ? PLATFORMS[5] // Heritage
      : gradedValue > 100
        ? PLATFORMS[0] // eBay
        : gradedValue > 20
          ? PLATFORMS[1] // COMC
          : PLATFORMS[3]; // Facebook

    // Comparable cards
    const comparables = sportsCards
      .filter(c => c.player === selectedCard.player && c.slug !== selectedCard.slug)
      .slice(0, 5);

    // Rarity assessment
    const playerCards = sportsCards.filter(c => c.player === selectedCard.player).length;
    const rarity = playerCards <= 2 ? 'Scarce' : playerCards <= 4 ? 'Common' : 'Widely Available';

    // Investment outlook
    const isRookie = selectedCard.rookie;
    const isVintage = selectedCard.year < 1980;
    const isModern = selectedCard.year >= 2020;
    const investmentOutlook = isRookie && isModern
      ? 'Strong upside — modern rookies appreciate with career milestones'
      : isRookie && isVintage
        ? 'Blue chip — vintage rookies are the gold standard of card investing'
        : isVintage
          ? 'Stable — vintage cards hold value well with slow, steady appreciation'
          : isModern
            ? 'Volatile — modern non-rookies are sensitive to player performance'
            : 'Moderate — established players with predictable value trajectories';

    setResult({
      card: selectedCard,
      condition,
      estimatedGrade: estGrade,
      rawValue: baseValue,
      gradedValue,
      gradingROI,
      shouldGrade,
      bestPlatform,
      comparables,
      rarity,
      investmentOutlook,
      gradeCurve,
    });
    setStep(3);
  }, [selectedCard, condition, hasCrease, hasStain, offCenter]);

  const shareAppraisal = useCallback(() => {
    if (!result) return;
    const text = [
      `Card Appraisal — ${result.card.name}`,
      `Est. Grade: PSA ${result.estimatedGrade}`,
      `Raw Value: $${result.rawValue}`,
      `Graded Value: $${result.gradedValue}`,
      `Grade ROI: ${result.gradingROI > 0 ? '+' : ''}${result.gradingROI.toFixed(0)}%`,
      `Verdict: ${result.shouldGrade ? 'GRADE IT' : 'Keep Raw'}`,
      `Best Platform: ${result.bestPlatform.name}`,
      '',
      'https://cardvault-two.vercel.app/vault/appraisal',
    ].join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [result]);

  return (
    <div className="mt-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Card Appraisal Service</h1>
        <p className="text-gray-400">Get a detailed valuation report for any sports card</p>
      </div>

      {/* Progress steps */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[
          { n: 1, label: 'Select Card' },
          { n: 2, label: 'Describe Condition' },
          { n: 3, label: 'View Report' },
        ].map(({ n, label }) => (
          <div key={n} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
              ${step >= n ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-500'}`}>
              {step > n ? '✓' : n}
            </div>
            <span className={`text-xs hidden sm:inline ${step >= n ? 'text-white' : 'text-gray-500'}`}>{label}</span>
            {n < 3 && <div className={`w-8 h-0.5 ${step > n ? 'bg-amber-600' : 'bg-gray-800'}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Select Card */}
      {step === 1 && (
        <div className="max-w-xl mx-auto">
          <label className="block text-sm text-gray-400 mb-2">Search for your card</label>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Type player name or card name..."
            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />

          {searchResults.length > 0 && (
            <div className="mt-3 space-y-2 max-h-96 overflow-y-auto">
              {searchResults.map(card => (
                <button
                  key={card.slug}
                  onClick={() => {
                    setSelectedCard(card);
                    setSearchQuery(card.name);
                    setStep(2);
                  }}
                  className={`w-full text-left p-3 rounded-lg border transition-colors
                    ${selectedCard?.slug === card.slug
                      ? 'bg-amber-900/30 border-amber-600'
                      : 'bg-gray-900/60 border-gray-800 hover:border-gray-600'}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{SPORTS_ICONS[card.sport] || '🃏'}</span>
                    <div>
                      <div className="text-sm font-medium text-white">{card.player}</div>
                      <div className="text-xs text-gray-400">{card.name}</div>
                      <div className="text-xs text-gray-500">{card.estimatedValueRaw} raw | {card.estimatedValueGem} gem</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {searchQuery.length >= 2 && searchResults.length === 0 && (
            <p className="mt-3 text-gray-500 text-sm">No cards found. Try a different search term.</p>
          )}
        </div>
      )}

      {/* Step 2: Condition Assessment */}
      {step === 2 && selectedCard && (
        <div className="max-w-xl mx-auto">
          <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{SPORTS_ICONS[selectedCard.sport] || '🃏'}</span>
              <div>
                <div className="text-sm font-medium text-white">{selectedCard.player}</div>
                <div className="text-xs text-gray-400">{selectedCard.name}</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Overall Condition</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { value: 'mint', label: 'Mint', desc: 'Perfect corners, no flaws' },
                  { value: 'near-mint', label: 'Near Mint', desc: 'Minor imperfections' },
                  { value: 'excellent', label: 'Excellent', desc: 'Light wear visible' },
                  { value: 'very-good', label: 'Very Good', desc: 'Moderate wear' },
                  { value: 'good', label: 'Good', desc: 'Noticeable wear' },
                  { value: 'fair', label: 'Fair', desc: 'Heavy wear' },
                  { value: 'poor', label: 'Poor', desc: 'Major damage' },
                ].map(c => (
                  <button
                    key={c.value}
                    onClick={() => setCondition(c.value)}
                    className={`p-2 rounded-lg text-center border transition-colors
                      ${condition === c.value
                        ? 'bg-amber-900/30 border-amber-600 text-white'
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'}`}
                  >
                    <div className="text-xs font-medium">{c.label}</div>
                    <div className="text-[10px] text-gray-500">{c.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Known Defects</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Crease / Bend', state: hasCrease, setter: setHasCrease },
                  { label: 'Stain / Mark', state: hasStain, setter: setHasStain },
                  { label: 'Off-Center', state: offCenter, setter: setOffCenter },
                ].map(d => (
                  <button
                    key={d.label}
                    onClick={() => d.setter(!d.state)}
                    className={`px-3 py-2 rounded-lg text-sm border transition-colors
                      ${d.state
                        ? 'bg-red-900/30 border-red-600 text-red-400'
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'}`}
                  >
                    {d.state ? '✕ ' : ''}{d.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setStep(1)}
                className="px-5 py-2 rounded-lg text-sm bg-gray-800 text-gray-300 hover:text-white transition-colors"
              >
                Back
              </button>
              <button
                onClick={generateAppraisal}
                className="flex-1 px-6 py-2 rounded-lg text-sm font-medium bg-amber-600 text-white hover:bg-amber-500 transition-colors"
              >
                Generate Appraisal Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Appraisal Report */}
      {step === 3 && result && (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header card */}
          <div className="bg-gradient-to-br from-amber-900/30 to-yellow-900/20 border border-amber-800/40 rounded-xl p-6">
            <div className="text-center">
              <div className="text-xs uppercase tracking-wider text-amber-400 mb-1">CardVault Appraisal</div>
              <h2 className="text-xl font-bold text-white mb-1">{result.card.player}</h2>
              <p className="text-sm text-gray-400">{result.card.name}</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className={`text-sm ${SPORTS_COLORS[result.card.sport]}`}>
                  {SPORTS_ICONS[result.card.sport]} {result.card.sport}
                </span>
                {result.card.rookie && <span className="px-2 py-0.5 bg-green-900/40 text-green-400 text-xs rounded">RC</span>}
                <span className="text-xs text-gray-500">{result.rarity}</span>
              </div>
            </div>
          </div>

          {/* Value summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Raw Value', value: `$${result.rawValue}`, color: 'text-white' },
              { label: `PSA ${result.estimatedGrade}`, value: `$${result.gradedValue}`, color: 'text-amber-400' },
              { label: 'Grade ROI', value: `${result.gradingROI > 0 ? '+' : ''}${result.gradingROI.toFixed(0)}%`, color: result.gradingROI > 0 ? 'text-green-400' : 'text-red-400' },
              { label: 'Verdict', value: result.shouldGrade ? 'GRADE IT' : 'Keep Raw', color: result.shouldGrade ? 'text-green-400' : 'text-yellow-400' },
            ].map(s => (
              <div key={s.label} className="bg-gray-900/60 border border-gray-800 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500">{s.label}</div>
                <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Grade curve */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4">
            <h3 className="text-sm font-bold text-white mb-3">Value by Grade</h3>
            <div className="space-y-1.5">
              {result.gradeCurve.filter((_, i) => i === 0 || i >= 6).map((gc, i) => {
                const maxVal = Math.max(...result.gradeCurve.map(g => g.value));
                const pct = maxVal > 0 ? (gc.value / maxVal) * 100 : 0;
                const isEstimate = gc.grade === `PSA ${result.estimatedGrade}` || (gc.grade === 'Raw' && result.estimatedGrade === 0);
                return (
                  <div key={gc.grade} className="flex items-center gap-2">
                    <span className={`text-xs w-14 text-right ${isEstimate ? 'text-amber-400 font-bold' : 'text-gray-400'}`}>
                      {gc.grade}
                    </span>
                    <div className="flex-1 bg-gray-800 rounded-full h-4 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${isEstimate ? 'bg-amber-500' : 'bg-gray-600'}`}
                        style={{ width: `${Math.max(pct, 2)}%` }}
                      />
                    </div>
                    <span className={`text-xs w-16 ${isEstimate ? 'text-amber-400 font-bold' : 'text-gray-400'}`}>
                      ${gc.value.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selling recommendation */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4">
            <h3 className="text-sm font-bold text-white mb-3">Best Selling Platform</h3>
            <div className="flex items-center gap-3 bg-gray-800/60 rounded-lg p-3 mb-3">
              <div className="text-2xl">🏆</div>
              <div>
                <div className="text-white font-medium">{result.bestPlatform.name}</div>
                <div className="text-xs text-gray-400">{result.bestPlatform.audience}</div>
                <div className="text-xs text-gray-500">Fees: {(result.bestPlatform.fee * 100).toFixed(0)}% | Time: {result.bestPlatform.time}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PLATFORMS.filter(p => p.name !== result.bestPlatform.name).map(p => {
                const net = result.gradedValue * (1 - p.fee);
                return (
                  <div key={p.name} className="bg-gray-800/40 rounded-lg p-2 text-xs">
                    <div className="text-gray-300 font-medium">{p.name}</div>
                    <div className="text-gray-500">Net: ${Math.round(net)} | {p.time}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Investment outlook */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4">
            <h3 className="text-sm font-bold text-white mb-2">Investment Outlook</h3>
            <p className="text-sm text-gray-400">{result.investmentOutlook}</p>
          </div>

          {/* Comparable cards */}
          {result.comparables.length > 0 && (
            <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4">
              <h3 className="text-sm font-bold text-white mb-3">Other {result.card.player} Cards</h3>
              <div className="space-y-2">
                {result.comparables.map(c => (
                  <Link
                    key={c.slug}
                    href={`/sports/${c.slug}`}
                    className="flex items-center justify-between p-2 rounded-lg bg-gray-800/40 hover:bg-gray-800/60 transition-colors"
                  >
                    <div className="text-xs text-gray-300">{c.name}</div>
                    <div className="text-xs text-gray-500">{c.estimatedValueRaw}</div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={shareAppraisal}
              className="px-5 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-500 transition-colors"
            >
              {copied ? 'Copied!' : 'Share Appraisal'}
            </button>
            <button
              onClick={() => { setStep(1); setSelectedCard(null); setSearchQuery(''); setResult(null); }}
              className="px-5 py-2 rounded-lg text-sm font-medium bg-gray-700 text-white hover:bg-gray-600 transition-colors"
            >
              Appraise Another Card
            </button>
            <Link
              href={result.card.ebaySearchUrl}
              target="_blank"
              className="px-5 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-500 transition-colors"
            >
              Check eBay Prices
            </Link>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-gray-600 text-center">
            This appraisal is an estimate based on CardVault data. Actual market values may vary.
            For high-value cards ($500+), consult a professional appraiser or auction house.
          </p>
        </div>
      )}

      {/* Related links */}
      <section className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-lg font-bold text-white mb-3">Related Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { href: '/tools/condition', label: 'Condition Grader', desc: 'Self-grade your card step by step' },
            { href: '/tools/grading-roi', label: 'Grading ROI Calculator', desc: 'Should you grade? Math-based answer' },
            { href: '/vault/grading-queue', label: 'Grading Queue', desc: 'Track your grading submissions' },
            { href: '/vault/insurance', label: 'Insurance Estimator', desc: 'Estimate collection insurance costs' },
            { href: '/vault/bulk-sale', label: 'Bulk Sale Calculator', desc: '6 ways to sell your collection' },
            { href: '/tools/flip-profit', label: 'Flip Profit Calculator', desc: 'Calculate flip profit after fees' },
          ].map(l => (
            <Link key={l.href} href={l.href} className="block p-3 rounded-lg bg-gray-900/60 border border-gray-800 hover:border-gray-600 transition-colors">
              <div className="text-sm font-medium text-white">{l.label}</div>
              <div className="text-xs text-gray-400">{l.desc}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
