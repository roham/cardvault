'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

type Era = 'pre_war' | 'post_war' | 'vintage' | 'junk_wax' | 'modern_limited' | 'modern_mass' | 'ultra_modern';
type Brand = 'topps' | 'bowman' | 'fleer' | 'upper_deck' | 'panini' | 'donruss' | 'score' | 'other';
type SetType = 'base' | 'insert' | 'parallel' | 'auto' | 'relic' | 'short_print' | 'ssp';

interface EraData {
  id: Era;
  label: string;
  years: string;
  baseMultiplier: string;
  description: string;
}

interface EstimateResult {
  low: number;
  high: number;
  confidence: 'high' | 'medium' | 'low';
  factors: string[];
  context: string;
  survivalRate: string;
  gradedPct: string;
}

const ERAS: EraData[] = [
  { id: 'pre_war', label: 'Pre-War (1887–1945)', years: '1887–1945', baseMultiplier: '500–50,000', description: 'Tobacco cards, candy cards, strip cards. Very small print runs by modern standards.' },
  { id: 'post_war', label: 'Post-War (1946–1969)', years: '1946–1969', baseMultiplier: '10,000–500,000', description: 'Early Topps/Bowman era. Growing production but still limited by standards.' },
  { id: 'vintage', label: 'Vintage (1970–1980)', years: '1970–1980', baseMultiplier: '200,000–2,000,000', description: 'Topps monopoly era. Production ramping up significantly.' },
  { id: 'junk_wax', label: 'Junk Wax (1981–1993)', years: '1981–1993', baseMultiplier: '5,000,000–800,000,000+', description: 'Massive overproduction. Multiple companies, multiple sets. Billions of cards printed.' },
  { id: 'modern_limited', label: 'Modern Premium (1994–2005)', years: '1994–2005', baseMultiplier: '500,000–5,000,000', description: 'Post-crash correction. Serial numbering introduced. More controlled production.' },
  { id: 'modern_mass', label: 'Modern Mass (2006–2019)', years: '2006–2019', baseMultiplier: '1,000,000–10,000,000', description: 'Hobby and retail tiers. Base cards mass-produced, inserts limited.' },
  { id: 'ultra_modern', label: 'Ultra-Modern (2020+)', years: '2020–present', baseMultiplier: '2,000,000–15,000,000+', description: 'Record production fueled by pandemic hobby boom. But many numbered products.' },
];

const SET_TYPES: { id: SetType; label: string; divisor: [number, number] }[] = [
  { id: 'base', label: 'Base Card', divisor: [1, 1] },
  { id: 'short_print', label: 'Short Print (SP)', divisor: [3, 10] },
  { id: 'ssp', label: 'Super Short Print (SSP)', divisor: [10, 50] },
  { id: 'insert', label: 'Insert/Subset', divisor: [5, 25] },
  { id: 'parallel', label: 'Parallel (unnumbered)', divisor: [10, 50] },
  { id: 'relic', label: 'Game-Used Relic', divisor: [50, 500] },
  { id: 'auto', label: 'Autograph', divisor: [100, 2000] },
];

const SURVIVAL_RATES: Record<Era, { rate: string; pct: number }> = {
  pre_war: { rate: '1–5%', pct: 0.03 },
  post_war: { rate: '5–15%', pct: 0.10 },
  vintage: { rate: '15–30%', pct: 0.22 },
  junk_wax: { rate: '60–90%', pct: 0.75 },
  modern_limited: { rate: '70–90%', pct: 0.80 },
  modern_mass: { rate: '80–95%', pct: 0.87 },
  ultra_modern: { rate: '90–98%', pct: 0.94 },
};

const GRADED_PCT: Record<Era, string> = {
  pre_war: '15–30%',
  post_war: '10–25%',
  vintage: '8–20%',
  junk_wax: '0.5–3%',
  modern_limited: '5–15%',
  modern_mass: '3–10%',
  ultra_modern: '5–15%',
};

function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(0);
}

function getEstimate(era: Era, setType: SetType, year: number, isHighNumber: boolean): EstimateResult {
  // Base production estimates by era
  const baseProd: Record<Era, [number, number]> = {
    pre_war: [500, 50000],
    post_war: [10000, 500000],
    vintage: [200000, 2000000],
    junk_wax: [5000000, 800000000],
    modern_limited: [500000, 5000000],
    modern_mass: [1000000, 10000000],
    ultra_modern: [2000000, 15000000],
  };

  const [baseLow, baseHigh] = baseProd[era];
  const typeDivisor = SET_TYPES.find(t => t.id === setType)!.divisor;

  let low = Math.round(baseLow / typeDivisor[1]);
  let high = Math.round(baseHigh / typeDivisor[0]);

  // High-number series adjustment
  if (isHighNumber) {
    low = Math.round(low * 0.3);
    high = Math.round(high * 0.5);
  }

  // Specific year adjustments
  if (era === 'junk_wax') {
    if (year >= 1989 && year <= 1991) {
      low = Math.round(low * 1.5);
      high = Math.round(high * 2);
    }
  }

  const survival = SURVIVAL_RATES[era];
  const survivingLow = Math.round(low * survival.pct);
  const survivingHigh = Math.round(high * survival.pct);

  const factors: string[] = [];
  if (isHighNumber) factors.push('High-number series: 50–70% fewer printed');
  if (era === 'junk_wax') factors.push('Junk wax era: extreme overproduction');
  if (era === 'pre_war') factors.push('Pre-war: most copies destroyed or lost');
  if (setType === 'auto') factors.push('Autographs: individually signed, strictly limited');
  if (setType === 'ssp') factors.push('SSP: intentionally scarce, often 10–50x fewer than base');

  let context = '';
  if (era === 'junk_wax' && setType === 'base') {
    context = 'During the junk wax era, base cards were printed in such massive quantities that most remain worth only pennies. The 1989 Ken Griffey Jr. Upper Deck RC had an estimated 500K+ copies printed.';
  } else if (era === 'pre_war') {
    context = 'Pre-war cards were produced as promotional items (tobacco, candy, bread). Most were discarded, damaged, or lost. Surviving examples in any condition are genuinely rare.';
  } else if (setType === 'auto') {
    context = 'Modern autograph cards are individually signed by players. Print runs are typically disclosed on the card (serial numbered) or can be estimated from redemption rates.';
  } else if (era === 'ultra_modern' && setType === 'base') {
    context = 'Modern base cards from Topps/Panini flagship products are produced in huge quantities across hobby, retail, jumbo, and online exclusive formats. The exact number is proprietary.';
  }

  const confidence: 'high' | 'medium' | 'low' =
    setType === 'auto' || setType === 'relic' ? 'low' :
    (era === 'junk_wax' || era === 'ultra_modern') && setType === 'base' ? 'medium' :
    'low';

  return {
    low: survivingLow,
    high: survivingHigh,
    confidence,
    factors,
    context,
    survivalRate: survival.rate,
    gradedPct: GRADED_PCT[era],
  };
}

export default function PrintRunEstimator() {
  const [selectedEra, setSelectedEra] = useState<Era>('ultra_modern');
  const [selectedType, setSelectedType] = useState<SetType>('base');
  const [year, setYear] = useState<string>('2024');
  const [isHighNumber, setIsHighNumber] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const numYear = parseInt(year) || 2024;

  const result = useMemo(
    () => getEstimate(selectedEra, selectedType, numYear, isHighNumber),
    [selectedEra, selectedType, numYear, isHighNumber]
  );

  const eraInfo = ERAS.find(e => e.id === selectedEra)!;

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
        <h2 className="text-lg font-semibold text-white">Card Details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Era</label>
            <select
              value={selectedEra}
              onChange={e => setSelectedEra(e.target.value as Era)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              {ERAS.map(era => (
                <option key={era.id} value={era.id}>{era.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Year</label>
            <input
              type="number"
              min="1887"
              max="2026"
              value={year}
              onChange={e => setYear(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">Card Type</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SET_TYPES.map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedType(t.id)}
                className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  selectedType === t.id
                    ? 'bg-amber-600 border-amber-500 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isHighNumber}
            onChange={e => setIsHighNumber(e.target.checked)}
            className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-amber-500 focus:ring-amber-500"
          />
          <span className="text-sm text-gray-300">High-number series (printed 50–70% less)</span>
        </label>
      </div>

      {/* Results */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Estimated Surviving Copies</h2>
          <span className={`px-2.5 py-1 rounded text-xs font-medium ${
            result.confidence === 'high' ? 'bg-green-950 text-green-400' :
            result.confidence === 'medium' ? 'bg-yellow-950 text-yellow-400' :
            'bg-red-950 text-red-400'
          }`}>
            {result.confidence === 'high' ? 'High' : result.confidence === 'medium' ? 'Medium' : 'Low'} Confidence
          </span>
        </div>

        <div className="text-center py-6">
          <div className="text-4xl sm:text-5xl font-bold text-white mb-2">
            {formatNumber(result.low)} – {formatNumber(result.high)}
          </div>
          <p className="text-gray-400 text-sm">estimated surviving copies today</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-xl p-4 text-center">
            <div className="text-xs text-gray-500 mb-1">Survival Rate</div>
            <div className="text-lg font-bold text-amber-400">{result.survivalRate}</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 text-center">
            <div className="text-xs text-gray-500 mb-1">% Graded (est.)</div>
            <div className="text-lg font-bold text-blue-400">{result.gradedPct}</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 text-center">
            <div className="text-xs text-gray-500 mb-1">Era</div>
            <div className="text-sm font-bold text-white">{eraInfo.years}</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 text-center">
            <div className="text-xs text-gray-500 mb-1">Type Scarcity</div>
            <div className="text-lg font-bold text-purple-400">
              {selectedType === 'base' ? '1x' : `${SET_TYPES.find(t => t.id === selectedType)!.divisor[0]}–${SET_TYPES.find(t => t.id === selectedType)!.divisor[1]}x`}
            </div>
          </div>
        </div>

        {result.factors.length > 0 && (
          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold text-gray-400">Key Factors</h3>
            {result.factors.map(f => (
              <div key={f} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-amber-400 mt-0.5">*</span>
                <span>{f}</span>
              </div>
            ))}
          </div>
        )}

        {result.context && (
          <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-4">
            <p className="text-sm text-amber-200">{result.context}</p>
          </div>
        )}
      </div>

      {/* Era Comparison Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Production by Era</h2>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-amber-400 hover:text-amber-300"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
        </div>

        <div className="space-y-2">
          {ERAS.map(era => {
            const isSelected = era.id === selectedEra;
            return (
              <button
                key={era.id}
                onClick={() => setSelectedEra(era.id)}
                className={`w-full text-left p-3 rounded-xl border transition-colors ${
                  isSelected
                    ? 'bg-amber-950/40 border-amber-700/50'
                    : 'bg-gray-800/50 border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className={`font-medium ${isSelected ? 'text-amber-300' : 'text-white'}`}>{era.label}</span>
                  </div>
                  <span className="text-sm text-gray-400">{era.baseMultiplier} base cards</span>
                </div>
                {showDetails && (
                  <div className="mt-2 text-sm text-gray-400">
                    <p>{era.description}</p>
                    <p className="mt-1 text-xs">Survival: {SURVIVAL_RATES[era.id].rate} | Graded: {GRADED_PCT[era.id]}</p>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Famous Examples */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">Known Print Runs &amp; Estimated Survivors</h2>
        <div className="space-y-3">
          {[
            { card: '1952 Topps Mickey Mantle #311', printed: '~10,000–20,000', surviving: '~1,500–3,000', graded: '~1,800 (PSA)', note: 'High-number series. Thousands dumped in the ocean by Topps.' },
            { card: '1989 Upper Deck Ken Griffey Jr. #1', printed: '~500,000+', surviving: '~400,000+', graded: '~85,000 (PSA)', note: 'The iconic modern RC. Massive production but high grading rate.' },
            { card: '1986-87 Fleer Michael Jordan #57', printed: '~250,000–500,000', surviving: '~150,000–300,000', graded: '~45,000+ (PSA)', note: 'Printed before the hobby boom. Many in collections by now.' },
            { card: '2018 Topps Update Shohei Ohtani #US1', printed: '~5,000,000+', surviving: '~4,500,000+', graded: '~100,000+ (PSA)', note: 'Modern flagship RC. Massive hobby + retail print run.' },
            { card: '1909-11 T206 Honus Wagner', printed: '~60–200', surviving: '~60', graded: '~50', note: 'The most famous card in history. Pulled from production early (tobacco objection theory).' },
            { card: '2003-04 Topps Chrome LeBron RC #111', printed: '~500,000+', surviving: '~450,000+', graded: '~40,000+ (PSA)', note: 'Chrome version is more scarce than base Topps. High demand.' },
          ].map(ex => (
            <div key={ex.card} className="bg-gray-800 rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <span className="text-white font-medium text-sm">{ex.card}</span>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-2">
                <div>
                  <div className="text-xs text-gray-500">Printed</div>
                  <div className="text-sm font-semibold text-amber-400">{ex.printed}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Surviving</div>
                  <div className="text-sm font-semibold text-green-400">{ex.surviving}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Graded</div>
                  <div className="text-sm font-semibold text-blue-400">{ex.graded}</div>
                </div>
              </div>
              <p className="text-xs text-gray-400">{ex.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related Tools */}
      <div className="flex flex-wrap gap-3">
        {[
          { href: '/tools/pop-report', label: 'Population Report' },
          { href: '/tools/rarity-score', label: 'Rarity Score Calculator' },
          { href: '/tools/parallel-value', label: 'Parallel Value Calculator' },
          { href: '/tools/era-guide', label: 'Era Guide' },
          { href: '/tools/grading-roi', label: 'Grading ROI Calculator' },
          { href: '/tools/investment-calc', label: 'Investment Calculator' },
        ].map(t => (
          <Link
            key={t.href}
            href={t.href}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 rounded-xl text-sm font-medium transition-colors"
          >
            {t.label} &rarr;
          </Link>
        ))}
      </div>
    </div>
  );
}
