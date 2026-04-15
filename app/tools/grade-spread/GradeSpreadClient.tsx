'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

/* ─── helpers ─── */
function parseValue(est: string): number {
  const m = est.match(/\$([0-9,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) || 5 : 5;
}

function fmt(n: number): string {
  if (n >= 10000) return `$${(n / 1000).toFixed(0)}K`;
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${n.toLocaleString()}`;
}

/* Grade multiplier curves — based on real market data patterns */
const GRADE_MULTIPLIERS: Record<string, number> = {
  'Raw':   1.0,
  'PSA 1': 0.15,
  'PSA 2': 0.20,
  'PSA 3': 0.28,
  'PSA 4': 0.35,
  'PSA 5': 0.45,
  'PSA 6': 0.55,
  'PSA 7': 0.70,
  'PSA 8': 1.0,
  'PSA 9': 2.0,
  'PSA 10': 5.0,
};

/* For vintage cards (pre-1980), the curve is steeper */
const VINTAGE_MULTIPLIERS: Record<string, number> = {
  'Raw':   1.0,
  'PSA 1': 0.30,
  'PSA 2': 0.40,
  'PSA 3': 0.55,
  'PSA 4': 0.70,
  'PSA 5': 0.90,
  'PSA 6': 1.15,
  'PSA 7': 1.50,
  'PSA 8': 2.5,
  'PSA 9': 6.0,
  'PSA 10': 20.0,
};

const GRADES = ['Raw', 'PSA 1', 'PSA 2', 'PSA 3', 'PSA 4', 'PSA 5', 'PSA 6', 'PSA 7', 'PSA 8', 'PSA 9', 'PSA 10'];

const GRADE_LABELS: Record<string, string> = {
  'Raw': 'Ungraded',
  'PSA 1': 'Poor',
  'PSA 2': 'Good',
  'PSA 3': 'Very Good',
  'PSA 4': 'VG-EX',
  'PSA 5': 'Excellent',
  'PSA 6': 'EX-MT',
  'PSA 7': 'Near Mint',
  'PSA 8': 'NM-MT',
  'PSA 9': 'Mint',
  'PSA 10': 'Gem Mint',
};

interface GradeData {
  grade: string;
  label: string;
  price: number;
  multiplier: number;
  stepUp: number;
  stepUpPct: number;
  barWidth: number;
}

function slugify(name: string): string {
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/* unique searchable players */
const uniquePlayers = Array.from(new Set(sportsCards.map(c => c.player)))
  .map(name => {
    const cards = sportsCards.filter(c => c.player === name);
    return { name, sport: cards[0].sport, count: cards.length, slug: slugify(name) };
  })
  .sort((a, b) => b.count - a.count);

export default function GradeSpreadClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCard, setSelectedCard] = useState<typeof sportsCards[0] | null>(null);
  const [mode, setMode] = useState<'search' | 'manual'>('search');
  const [manualValue, setManualValue] = useState('');
  const [manualYear, setManualYear] = useState('2023');

  const searchResults = useMemo(() => {
    if (searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase();
    return sportsCards.filter(c =>
      c.name.toLowerCase().includes(q) || c.player.toLowerCase().includes(q)
    ).slice(0, 12);
  }, [searchQuery]);

  /* ─── calculate grade spread ─── */
  const gradeData: GradeData[] = useMemo(() => {
    let baseRawValue = 0;
    let isVintage = false;

    if (mode === 'search' && selectedCard) {
      baseRawValue = parseValue(selectedCard.estimatedValueRaw);
      isVintage = selectedCard.year < 1980;
    } else if (mode === 'manual') {
      baseRawValue = parseFloat(manualValue) || 0;
      isVintage = parseInt(manualYear) < 1980;
    }

    if (baseRawValue <= 0) return [];

    const multipliers = isVintage ? VINTAGE_MULTIPLIERS : GRADE_MULTIPLIERS;
    const psa8Base = baseRawValue; // PSA 8 ≈ raw NM value as anchor

    const data: GradeData[] = GRADES.map(grade => {
      const mult = multipliers[grade];
      const price = Math.round(psa8Base * mult);
      return {
        grade,
        label: GRADE_LABELS[grade],
        price,
        multiplier: mult,
        stepUp: 0,
        stepUpPct: 0,
        barWidth: 0,
      };
    });

    const maxPrice = Math.max(...data.map(d => d.price), 1);
    for (let i = 0; i < data.length; i++) {
      data[i].barWidth = (data[i].price / maxPrice) * 100;
      if (i > 0) {
        data[i].stepUp = data[i].price - data[i - 1].price;
        data[i].stepUpPct = data[i - 1].price > 0 ? ((data[i].price - data[i - 1].price) / data[i - 1].price) * 100 : 0;
      }
    }

    return data;
  }, [mode, selectedCard, manualValue, manualYear]);

  /* ─── sweet spot analysis ─── */
  const sweetSpot = useMemo(() => {
    if (gradeData.length === 0) return null;
    // Best value = highest multiplier jump relative to price
    // PSA 8 or 9 is usually the sweet spot
    const psa8 = gradeData.find(d => d.grade === 'PSA 8');
    const psa9 = gradeData.find(d => d.grade === 'PSA 9');
    const psa10 = gradeData.find(d => d.grade === 'PSA 10');
    if (!psa8 || !psa9 || !psa10) return null;

    const jump9to10 = psa10.price - psa9.price;
    const jump8to9 = psa9.price - psa8.price;
    const jump8to10 = psa10.price - psa8.price;

    return {
      psa8Price: psa8.price,
      psa9Price: psa9.price,
      psa10Price: psa10.price,
      premium9over8: jump8to9,
      premium10over9: jump9to10,
      premium10over8: jump8to10,
      pct9over8: psa8.price > 0 ? (jump8to9 / psa8.price * 100) : 0,
      pct10over9: psa9.price > 0 ? (jump9to10 / psa9.price * 100) : 0,
      sweetSpotGrade: jump9to10 > jump8to9 * 3 ? 'PSA 9' : 'PSA 10',
      sweetSpotReason: jump9to10 > jump8to9 * 3
        ? 'PSA 9 offers 90%+ of the visual appeal at a fraction of the PSA 10 premium'
        : 'The PSA 10 premium is moderate enough to justify for long-term holds',
    };
  }, [gradeData]);

  return (
    <div className="space-y-8">
      {/* Mode toggle */}
      <div className="flex gap-2 p-1 bg-gray-800/60 rounded-xl w-fit">
        <button onClick={() => setMode('search')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'search' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}>
          Search Cards
        </button>
        <button onClick={() => setMode('manual')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'manual' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}>
          Manual Entry
        </button>
      </div>

      {/* Input Section */}
      <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6">
        {mode === 'search' ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 block mb-1">Search any card from 6,200+ in the database</label>
              <input
                type="text"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setSelectedCard(null); }}
                placeholder="Search player name or card..."
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            {searchResults.length > 0 && !selectedCard && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                {searchResults.map(card => (
                  <button
                    key={card.slug}
                    onClick={() => { setSelectedCard(card); setSearchQuery(card.name); }}
                    className="text-left p-3 bg-gray-900/60 border border-gray-700 rounded-lg hover:border-indigo-600/50 transition-colors"
                  >
                    <div className="text-white text-sm font-medium truncate">{card.name}</div>
                    <div className="text-gray-500 text-xs">{card.set} &middot; Raw: {card.estimatedValueRaw.split(' ')[0]}</div>
                  </button>
                ))}
              </div>
            )}
            {selectedCard && (
              <div className="p-4 bg-indigo-950/30 border border-indigo-800/40 rounded-lg">
                <div className="text-white font-medium">{selectedCard.name}</div>
                <div className="text-gray-400 text-sm">{selectedCard.set} &middot; {selectedCard.year} &middot; Raw: {selectedCard.estimatedValueRaw.split('(')[0].trim()}</div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 block mb-1">Estimated Raw Value ($)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={manualValue}
                  onChange={e => setManualValue(e.target.value)}
                  placeholder="100"
                  className="w-full pl-7 pr-4 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Card Year</label>
              <input
                type="number"
                value={manualYear}
                onChange={e => setManualYear(e.target.value)}
                placeholder="2023"
                min="1900"
                max="2026"
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">Pre-1980 cards use a steeper vintage price curve.</p>
            </div>
          </div>
        )}
      </div>

      {/* Grade Spread Chart */}
      {gradeData.length > 0 && (
        <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-1">Price by Grade</h2>
          <p className="text-sm text-gray-500 mb-6">Estimated market value at each PSA grade level</p>

          <div className="space-y-2">
            {gradeData.map((d, i) => (
              <div key={d.grade} className="flex items-center gap-3">
                <div className="w-16 text-right">
                  <span className={`text-sm font-mono ${d.grade === 'PSA 10' ? 'text-amber-400 font-bold' : d.grade === 'PSA 9' ? 'text-emerald-400' : d.grade === 'Raw' ? 'text-gray-500' : 'text-gray-300'}`}>
                    {d.grade}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="h-7 bg-gray-900 rounded-lg overflow-hidden relative">
                    <div
                      className={`h-full rounded-lg transition-all duration-500 ${
                        d.grade === 'PSA 10' ? 'bg-gradient-to-r from-amber-600 to-amber-400' :
                        d.grade === 'PSA 9' ? 'bg-gradient-to-r from-emerald-700 to-emerald-500' :
                        d.grade === 'Raw' ? 'bg-gray-700' :
                        'bg-gradient-to-r from-indigo-800 to-indigo-600'
                      }`}
                      style={{ width: `${Math.max(d.barWidth, 2)}%` }}
                    />
                    <div className="absolute inset-y-0 flex items-center px-2">
                      <span className="text-white text-xs font-medium drop-shadow">{fmt(d.price)}</span>
                    </div>
                  </div>
                </div>
                <div className="w-20 text-right">
                  {i > 0 && d.stepUp > 0 ? (
                    <span className="text-xs text-emerald-400">+{fmt(d.stepUp)}</span>
                  ) : i === 0 ? (
                    <span className="text-xs text-gray-600">base</span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          {/* Grade step table */}
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left text-gray-400 py-2 pr-3">Grade</th>
                  <th className="text-left text-gray-400 py-2 px-2">Label</th>
                  <th className="text-right text-gray-400 py-2 px-2">Est. Price</th>
                  <th className="text-right text-gray-400 py-2 px-2">vs Raw</th>
                  <th className="text-right text-gray-400 py-2 pl-2">Step Up</th>
                </tr>
              </thead>
              <tbody>
                {gradeData.map((d, i) => {
                  const rawPrice = gradeData[0]?.price || 1;
                  const vsRaw = d.price / rawPrice;
                  return (
                    <tr key={d.grade} className={`border-b border-gray-800 ${d.grade === 'PSA 10' ? 'bg-amber-950/10' : d.grade === 'PSA 9' ? 'bg-emerald-950/10' : ''}`}>
                      <td className="py-2 pr-3">
                        <span className={`font-mono text-sm ${d.grade === 'PSA 10' ? 'text-amber-400 font-bold' : d.grade === 'PSA 9' ? 'text-emerald-400' : 'text-white'}`}>{d.grade}</span>
                      </td>
                      <td className="py-2 px-2 text-gray-400">{d.label}</td>
                      <td className="py-2 px-2 text-right text-white font-medium">{fmt(d.price)}</td>
                      <td className="py-2 px-2 text-right text-gray-400">{vsRaw.toFixed(1)}x</td>
                      <td className="py-2 pl-2 text-right">
                        {i > 0 && d.stepUpPct > 0 ? (
                          <span className="text-emerald-400">+{d.stepUpPct.toFixed(0)}%</span>
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sweet Spot Analysis */}
      {sweetSpot && (
        <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Sweet Spot Analysis</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-gray-900/60 border border-gray-800 rounded-lg text-center">
              <div className="text-gray-400 text-xs mb-1">PSA 8 (NM-MT)</div>
              <div className="text-white text-xl font-bold">{fmt(sweetSpot.psa8Price)}</div>
              <div className="text-gray-500 text-xs">baseline</div>
            </div>
            <div className="p-4 bg-emerald-950/20 border border-emerald-800/40 rounded-lg text-center">
              <div className="text-emerald-400 text-xs mb-1">PSA 9 (Mint)</div>
              <div className="text-white text-xl font-bold">{fmt(sweetSpot.psa9Price)}</div>
              <div className="text-emerald-400 text-xs">+{fmt(sweetSpot.premium9over8)} ({sweetSpot.pct9over8.toFixed(0)}%)</div>
            </div>
            <div className="p-4 bg-amber-950/20 border border-amber-800/40 rounded-lg text-center">
              <div className="text-amber-400 text-xs mb-1">PSA 10 (Gem Mint)</div>
              <div className="text-white text-xl font-bold">{fmt(sweetSpot.psa10Price)}</div>
              <div className="text-amber-400 text-xs">+{fmt(sweetSpot.premium10over9)} over PSA 9</div>
            </div>
          </div>
          <div className="p-4 bg-indigo-950/30 border border-indigo-800/40 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-indigo-400 font-semibold text-sm">Recommended Sweet Spot: {sweetSpot.sweetSpotGrade}</span>
            </div>
            <p className="text-gray-400 text-sm">{sweetSpot.sweetSpotReason}</p>
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-gray-900/40 border border-gray-800 rounded-lg">
              <div className="text-white text-sm font-medium">PSA 9 vs PSA 10 Premium</div>
              <div className="text-amber-400 text-lg font-bold">+{fmt(sweetSpot.premium10over9)} ({sweetSpot.pct10over9.toFixed(0)}%)</div>
              <div className="text-gray-500 text-xs">Extra cost for that last half-grade</div>
            </div>
            <div className="p-3 bg-gray-900/40 border border-gray-800 rounded-lg">
              <div className="text-white text-sm font-medium">PSA 8 to PSA 10 Total Premium</div>
              <div className="text-amber-400 text-lg font-bold">+{fmt(sweetSpot.premium10over8)}</div>
              <div className="text-gray-500 text-xs">Full cost of going from NM-MT to Gem</div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Examples */}
      <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Try These Cards</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { name: '1952 Topps Mantle', query: '1952 Topps Mickey Mantle', desc: 'Vintage grail' },
            { name: 'Wemby Prizm RC', query: 'Wembanyama 2023 Prizm', desc: 'Modern hot card' },
            { name: 'Ohtani Topps Chrome', query: 'Ohtani Topps Chrome', desc: 'Two-way star' },
            { name: 'Caleb Williams RC', query: 'Caleb Williams 2024 Prizm', desc: '2024 #1 pick' },
          ].map(ex => (
            <button
              key={ex.name}
              onClick={() => { setMode('search'); setSearchQuery(ex.query); setSelectedCard(null); }}
              className="text-left p-3 bg-gray-900/60 border border-gray-700 rounded-lg hover:border-indigo-600/50 transition-colors"
            >
              <div className="text-white text-sm font-medium">{ex.name}</div>
              <div className="text-gray-500 text-xs">{ex.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Understanding the Curve */}
      <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Understanding the Grade-Price Curve</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { title: 'The Exponential Jump', text: 'Card prices don\'t increase linearly with grade — they increase exponentially. A PSA 10 is typically 2.5-5x more than a PSA 9, which is already 2x a PSA 8. This is because PSA 10 population is much smaller.' },
            { title: 'Vintage vs Modern Curves', text: 'Pre-1980 cards have steeper curves because survival rates are lower. A 1952 Topps Mantle in PSA 8 is worth far more relative to raw than a 2023 Prizm in PSA 8, because fewer vintage cards survive in high grade.' },
            { title: 'The PSA 9 Sweet Spot', text: 'For most cards, PSA 9 is the best value. You get 90%+ of the visual quality of a PSA 10 at 40-60% of the price. Unless you\'re buying a long-term hold or an iconic card, PSA 9 is often the smart buy.' },
            { title: 'Population Affects Everything', text: 'If a card has 10,000 PSA 10s, the premium shrinks. If it has 50 PSA 10s, the premium skyrockets. Always check PSA population data alongside this tool for the full picture.' },
          ].map(tip => (
            <div key={tip.title} className="p-4 bg-gray-900/40 border border-gray-800 rounded-lg">
              <h3 className="text-white text-sm font-semibold mb-1">{tip.title}</h3>
              <p className="text-gray-400 text-xs leading-relaxed">{tip.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Cross-links */}
      <div className="flex flex-wrap gap-3">
        {[
          { href: '/tools/grading-roi', label: 'Grading ROI Calculator' },
          { href: '/tools/pop-report', label: 'Population Report' },
          { href: '/tools/condition-grader', label: 'Condition Self-Grader' },
          { href: '/tools/bgs-subgrade', label: 'BGS Subgrade Calculator' },
          { href: '/tools/cross-grade', label: 'Cross-Grade Converter' },
          { href: '/tools/grade-value-chart', label: 'Grade Value Chart' },
          { href: '/tools/submission-planner', label: 'Submission Planner' },
        ].map(l => (
          <Link key={l.href} href={l.href} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white border border-gray-700 rounded-lg text-xs transition-colors">
            {l.label} &rarr;
          </Link>
        ))}
      </div>
    </div>
  );
}
