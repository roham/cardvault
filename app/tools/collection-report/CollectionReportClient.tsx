'use client';

import { useState, useMemo } from 'react';

interface CollectionInput {
  totalCards: number;
  totalValue: number;
  sports: string[];
  vintagePrePct: number;   // pre-1980
  junkWaxPct: number;      // 1980-1995
  modernPct: number;       // 1996-2010
  ultraModernPct: number;  // 2011+
  gradedPct: number;
  avgGrade: number;
  rookiePct: number;
  uniquePlayers: number;
  activePct: number;       // % of players currently active
  autosPct: number;        // % autographed
  parallelsPct: number;    // % numbered parallels
  topPlayerPct: number;    // % of value in top 3 players
}

interface DimensionGrade {
  name: string;
  letter: string;
  gpa: number;
  score: number;
  color: string;
  summary: string;
  recommendation: string;
}

const GRADE_SCALE: { min: number; letter: string; gpa: number; color: string }[] = [
  { min: 95, letter: 'A+', gpa: 4.0, color: 'text-emerald-400' },
  { min: 90, letter: 'A', gpa: 3.85, color: 'text-emerald-400' },
  { min: 85, letter: 'A-', gpa: 3.7, color: 'text-emerald-400' },
  { min: 80, letter: 'B+', gpa: 3.3, color: 'text-green-400' },
  { min: 75, letter: 'B', gpa: 3.0, color: 'text-green-400' },
  { min: 70, letter: 'B-', gpa: 2.7, color: 'text-yellow-400' },
  { min: 65, letter: 'C+', gpa: 2.3, color: 'text-yellow-400' },
  { min: 60, letter: 'C', gpa: 2.0, color: 'text-yellow-500' },
  { min: 55, letter: 'C-', gpa: 1.7, color: 'text-orange-400' },
  { min: 50, letter: 'D+', gpa: 1.3, color: 'text-orange-400' },
  { min: 40, letter: 'D', gpa: 1.0, color: 'text-red-400' },
  { min: 0, letter: 'F', gpa: 0.0, color: 'text-red-500' },
];

function toGrade(score: number): { letter: string; gpa: number; color: string } {
  const clamped = Math.max(0, Math.min(100, score));
  for (const g of GRADE_SCALE) {
    if (clamped >= g.min) return g;
  }
  return GRADE_SCALE[GRADE_SCALE.length - 1];
}

function fmt(n: number): string {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function scoreDiversification(input: CollectionInput): { score: number; summary: string; rec: string } {
  let score = 0;
  const sportCount = input.sports.length;
  // Sport diversity: 1=30, 2=55, 3=70, 4=85, 5+=95
  score += sportCount === 1 ? 30 : sportCount === 2 ? 55 : sportCount === 3 ? 70 : sportCount === 4 ? 85 : 95;

  // Era diversity bonus: penalize >70% in any one era
  const eras = [input.vintagePrePct, input.junkWaxPct, input.modernPct, input.ultraModernPct];
  const maxEra = Math.max(...eras);
  if (maxEra <= 40) score = Math.min(100, score + 10);
  else if (maxEra <= 60) score = Math.min(100, score + 5);
  else if (maxEra > 80) score = Math.max(0, score - 15);

  // Player concentration penalty
  if (input.topPlayerPct > 60) score = Math.max(0, score - 15);
  else if (input.topPlayerPct > 40) score = Math.max(0, score - 5);
  else if (input.topPlayerPct <= 25) score = Math.min(100, score + 5);

  const summary = sportCount === 1
    ? `Single-sport collection — concentrated risk`
    : `${sportCount} sports represented — ${sportCount >= 4 ? 'excellent' : 'good'} spread`;
  const rec = sportCount === 1
    ? `Add 5-10 cards from a second sport to reduce single-sport risk`
    : input.topPlayerPct > 50
      ? `Too much value in top 3 players (${input.topPlayerPct}%). Diversify into other players.`
      : `Good diversification. Consider adding vintage cards if era mix is heavy modern.`;
  return { score, summary, rec };
}

function scoreValueDensity(input: CollectionInput): { score: number; summary: string; rec: string } {
  const avgValue = input.totalCards > 0 ? input.totalValue / input.totalCards : 0;
  // <$5 = 30, $5-15 = 50, $15-50 = 65, $50-100 = 80, $100-500 = 90, $500+ = 97
  let score = avgValue < 5 ? 30 : avgValue < 15 ? 50 : avgValue < 50 ? 65 : avgValue < 100 ? 80 : avgValue < 500 ? 90 : 97;
  const summary = `Average card value: ${fmt(avgValue)} across ${input.totalCards.toLocaleString()} cards`;
  const rec = avgValue < 15
    ? `Consider trading up — sell 10 lower-value cards to fund 1 higher-value card.`
    : avgValue < 50
      ? `Solid value density. Focus new acquisitions on the $50-200 range for best flip potential.`
      : `Strong collection density. Maintain quality over quantity.`;
  return { score, summary, rec };
}

function scoreGradeQuality(input: CollectionInput): { score: number; summary: string; rec: string } {
  let score = 0;
  // Graded percentage: 0%=20, 1-10%=40, 10-25%=55, 25-50%=70, 50-75%=85, 75%+=95
  score = input.gradedPct < 1 ? 20 : input.gradedPct < 10 ? 40 : input.gradedPct < 25 ? 55 : input.gradedPct < 50 ? 70 : input.gradedPct < 75 ? 85 : 95;
  // Grade quality bonus
  if (input.gradedPct > 0) {
    if (input.avgGrade >= 9.5) score = Math.min(100, score + 10);
    else if (input.avgGrade >= 9) score = Math.min(100, score + 5);
    else if (input.avgGrade < 7) score = Math.max(0, score - 10);
  }
  const summary = input.gradedPct < 1
    ? `No graded cards — significant value being left on the table`
    : `${input.gradedPct}% graded, avg grade: ${input.avgGrade.toFixed(1)}`;
  const rec = input.gradedPct < 10
    ? `Submit your top 5-10 cards for grading — even a PSA 8 adds 30-50% value premium.`
    : input.avgGrade < 8.5
      ? `Focus on acquiring higher-grade raw cards. Target cards likely to grade 9+.`
      : `Strong grading profile. Consider resubmitting any 8s or 8.5s that might upgrade.`;
  return { score, summary, rec };
}

function scoreRookieRatio(input: CollectionInput): { score: number; summary: string; rec: string } {
  // Rookies are the backbone of card investing. 0%=25, 10%=40, 20%=55, 30%=70, 40%=80, 50%=90, 60%+=95
  let score = input.rookiePct < 10 ? 25 : input.rookiePct < 20 ? 40 : input.rookiePct < 30 ? 55 : input.rookiePct < 40 ? 70 : input.rookiePct < 50 ? 80 : input.rookiePct < 60 ? 90 : 95;
  // Too many rookies is slightly negative (speculation heavy)
  if (input.rookiePct > 80) score = Math.max(0, score - 5);
  const summary = `${input.rookiePct}% rookie cards — ${input.rookiePct < 20 ? 'below ideal' : input.rookiePct < 50 ? 'solid mix' : 'rookie-heavy'}`;
  const rec = input.rookiePct < 20
    ? `Increase rookie card allocation. RCs drive 60-80% of long-term card value appreciation.`
    : input.rookiePct > 70
      ? `Very speculation-heavy. Add some established veteran cards for stability.`
      : `Good rookie mix. Focus new RC acquisitions on 2nd-year players who have proven themselves.`;
  return { score, summary, rec };
}

function scoreVintageDepth(input: CollectionInput): { score: number; summary: string; rec: string } {
  // Any vintage = good. More vintage = better up to a point.
  const vintagePct = input.vintagePrePct;
  let score = vintagePct < 1 ? 25 : vintagePct < 5 ? 40 : vintagePct < 10 ? 55 : vintagePct < 20 ? 70 : vintagePct < 35 ? 85 : 95;
  // Junk wax heavy is bad
  if (input.junkWaxPct > 50) score = Math.max(0, score - 10);
  const summary = vintagePct < 1
    ? `No vintage cards — missing the bedrock of the hobby`
    : `${vintagePct}% vintage (pre-1980) — ${vintagePct < 10 ? 'room to grow' : 'solid vintage presence'}`;
  const rec = vintagePct < 5
    ? `Add 3-5 affordable vintage cards ($20-100 range). Vintage holds value through market cycles.`
    : input.junkWaxPct > 40
      ? `Reduce junk wax era (1987-1995) holdings. Most have minimal long-term upside.`
      : `Good vintage depth. Consider pre-war cards (1900s-1940s) for the ultimate hedge.`;
  return { score, summary, rec };
}

function scoreGrowthPotential(input: CollectionInput): { score: number; summary: string; rec: string } {
  // Active players = growth. Rookies + active = max growth.
  let score = 0;
  score = input.activePct < 10 ? 25 : input.activePct < 25 ? 40 : input.activePct < 40 ? 55 : input.activePct < 60 ? 70 : input.activePct < 75 ? 85 : 95;
  // Rookie + active combo bonus
  if (input.rookiePct > 30 && input.activePct > 50) score = Math.min(100, score + 10);
  // Young star bonus (ultra-modern + active)
  if (input.ultraModernPct > 40 && input.activePct > 60) score = Math.min(100, score + 5);
  const summary = `${input.activePct}% active players — ${input.activePct < 30 ? 'legacy-heavy' : input.activePct < 60 ? 'balanced mix' : 'growth-oriented'}`;
  const rec = input.activePct < 25
    ? `Add cards of current young stars. Active players drive price spikes on performance milestones.`
    : input.activePct > 80
      ? `Very growth-heavy. Add retired HOF players for stability — their value is established.`
      : `Great balance of active and retired players. Active players provide upside; legends provide stability.`;
  return { score, summary, rec };
}

function scoreLiquidity(input: CollectionInput): { score: number; summary: string; rec: string } {
  // Graded + popular sport + higher value = more liquid
  let score = 50; // base
  // Grading adds liquidity
  if (input.gradedPct > 50) score += 15;
  else if (input.gradedPct > 25) score += 10;
  else if (input.gradedPct > 10) score += 5;
  // Popular sports are more liquid
  const hasBball = input.sports.includes('Baseball');
  const hasBasketball = input.sports.includes('Basketball');
  const hasFootball = input.sports.includes('Football');
  if (hasBball || hasBasketball || hasFootball) score += 10;
  if ((hasBball ? 1 : 0) + (hasBasketball ? 1 : 0) + (hasFootball ? 1 : 0) >= 2) score += 5;
  // Value density helps
  const avgVal = input.totalCards > 0 ? input.totalValue / input.totalCards : 0;
  if (avgVal > 100) score += 10;
  else if (avgVal > 25) score += 5;
  else if (avgVal < 5) score -= 10;
  // Autos and parallels help
  if (input.autosPct > 20) score += 5;
  if (input.parallelsPct > 15) score += 5;
  // Too many unique players spreads thin
  const playersPerCard = input.uniquePlayers / Math.max(1, input.totalCards);
  if (playersPerCard > 0.8) score -= 5; // barely any doubles, hard to lot
  score = Math.max(0, Math.min(100, score));
  const summary = `Estimated liquidity: ${score >= 75 ? 'High' : score >= 50 ? 'Moderate' : 'Low'} — ${input.gradedPct > 25 ? 'good grading helps' : 'more grading would help'}`;
  const rec = score < 50
    ? `Low liquidity. Grade your best cards, focus on popular players, and consolidate into fewer, higher-value pieces.`
    : score < 75
      ? `Moderate liquidity. Grading more cards and focusing on big-3 sports would improve sellability.`
      : `High liquidity. Your collection would sell quickly. Consider consignment for highest-value pieces.`;
  return { score, summary, rec };
}

function scoreSpecialCards(input: CollectionInput): { score: number; summary: string; rec: string } {
  // Autos, parallels, and other special cards
  const specialPct = input.autosPct + input.parallelsPct;
  let score = specialPct < 5 ? 25 : specialPct < 15 ? 45 : specialPct < 25 ? 60 : specialPct < 40 ? 75 : specialPct < 60 ? 88 : 95;
  // Having both autos AND parallels is better than just one
  if (input.autosPct > 5 && input.parallelsPct > 5) score = Math.min(100, score + 5);
  const summary = `${input.autosPct}% autos, ${input.parallelsPct}% numbered parallels — ${specialPct < 10 ? 'mostly base cards' : specialPct < 30 ? 'good variety' : 'premium-heavy'}`;
  const rec = specialPct < 10
    ? `Your collection is base-heavy. Add numbered parallels ($15-50) for the best value-to-premium ratio.`
    : input.autosPct < 5
      ? `Consider adding autographed cards — autos command 2-5x premium over base versions.`
      : `Strong special card presence. These drive collector interest and resale value.`;
  return { score, summary, rec };
}

const SPORT_OPTIONS = ['Baseball', 'Basketball', 'Football', 'Hockey', 'Soccer', 'Other'];

const PRESETS = [
  {
    name: "Marcus's Flip Portfolio",
    desc: 'Modern rookies, heavy grading, quick-turn focused',
    data: { totalCards: 120, totalValue: 18500, sports: ['Baseball', 'Basketball', 'Football'], vintagePrePct: 2, junkWaxPct: 3, modernPct: 15, ultraModernPct: 80, gradedPct: 65, avgGrade: 9.2, rookiePct: 70, uniquePlayers: 45, activePct: 85, autosPct: 15, parallelsPct: 25, topPlayerPct: 30 },
  },
  {
    name: "Dave's Family Collection",
    desc: 'Mixed eras, mostly raw, sentimental picks',
    data: { totalCards: 450, totalValue: 3200, sports: ['Baseball', 'Football'], vintagePrePct: 10, junkWaxPct: 45, modernPct: 25, ultraModernPct: 20, gradedPct: 5, avgGrade: 8.0, rookiePct: 20, uniquePlayers: 200, activePct: 30, autosPct: 5, parallelsPct: 8, topPlayerPct: 15 },
  },
  {
    name: "Kai's Investment Vault",
    desc: 'Blue-chip graded slabs, diversified, high value',
    data: { totalCards: 85, totalValue: 42000, sports: ['Baseball', 'Basketball', 'Football', 'Hockey'], vintagePrePct: 20, junkWaxPct: 5, modernPct: 25, ultraModernPct: 50, gradedPct: 80, avgGrade: 9.5, rookiePct: 55, uniquePlayers: 40, activePct: 55, autosPct: 25, parallelsPct: 20, topPlayerPct: 35 },
  },
  {
    name: "Mia's Set Builder",
    desc: 'Complete sets, organized, base-heavy',
    data: { totalCards: 1200, totalValue: 5800, sports: ['Baseball'], vintagePrePct: 5, junkWaxPct: 15, modernPct: 30, ultraModernPct: 50, gradedPct: 10, avgGrade: 9.0, rookiePct: 15, uniquePlayers: 600, activePct: 60, autosPct: 3, parallelsPct: 5, topPlayerPct: 20 },
  },
];

export default function CollectionReportClient() {
  const [totalCards, setTotalCards] = useState('');
  const [totalValue, setTotalValue] = useState('');
  const [sports, setSports] = useState<string[]>([]);
  const [vintagePrePct, setVintagePrePct] = useState(10);
  const [junkWaxPct, setJunkWaxPct] = useState(15);
  const [modernPct, setModernPct] = useState(30);
  const [ultraModernPct, setUltraModernPct] = useState(45);
  const [gradedPct, setGradedPct] = useState(20);
  const [avgGrade, setAvgGrade] = useState('9.0');
  const [rookiePct, setRookiePct] = useState(30);
  const [uniquePlayers, setUniquePlayers] = useState('');
  const [activePct, setActivePct] = useState(50);
  const [autosPct, setAutosPct] = useState(10);
  const [parallelsPct, setParallelsPct] = useState(10);
  const [topPlayerPct, setTopPlayerPct] = useState(30);
  const [showReport, setShowReport] = useState(false);

  function loadPreset(preset: typeof PRESETS[0]) {
    const d = preset.data;
    setTotalCards(d.totalCards.toString());
    setTotalValue(d.totalValue.toString());
    setSports(d.sports);
    setVintagePrePct(d.vintagePrePct);
    setJunkWaxPct(d.junkWaxPct);
    setModernPct(d.modernPct);
    setUltraModernPct(d.ultraModernPct);
    setGradedPct(d.gradedPct);
    setAvgGrade(d.avgGrade.toString());
    setRookiePct(d.rookiePct);
    setUniquePlayers(d.uniquePlayers.toString());
    setActivePct(d.activePct);
    setAutosPct(d.autosPct);
    setParallelsPct(d.parallelsPct);
    setTopPlayerPct(d.topPlayerPct);
    setShowReport(false);
  }

  function toggleSport(s: string) {
    setSports(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  }

  const input: CollectionInput = useMemo(() => ({
    totalCards: parseInt(totalCards) || 0,
    totalValue: parseFloat(totalValue) || 0,
    sports,
    vintagePrePct,
    junkWaxPct,
    modernPct,
    ultraModernPct,
    gradedPct,
    avgGrade: parseFloat(avgGrade) || 9,
    rookiePct,
    uniquePlayers: parseInt(uniquePlayers) || 0,
    activePct,
    autosPct,
    parallelsPct,
    topPlayerPct,
  }), [totalCards, totalValue, sports, vintagePrePct, junkWaxPct, modernPct, ultraModernPct, gradedPct, avgGrade, rookiePct, uniquePlayers, activePct, autosPct, parallelsPct, topPlayerPct]);

  const grades: DimensionGrade[] = useMemo(() => {
    if (!showReport) return [];
    const dims: { name: string; fn: (i: CollectionInput) => { score: number; summary: string; rec: string } }[] = [
      { name: 'Diversification', fn: scoreDiversification },
      { name: 'Value Density', fn: scoreValueDensity },
      { name: 'Grade Quality', fn: scoreGradeQuality },
      { name: 'Rookie Ratio', fn: scoreRookieRatio },
      { name: 'Vintage Depth', fn: scoreVintageDepth },
      { name: 'Growth Potential', fn: scoreGrowthPotential },
      { name: 'Liquidity', fn: scoreLiquidity },
      { name: 'Premium Cards', fn: scoreSpecialCards },
    ];
    return dims.map(d => {
      const r = d.fn(input);
      const g = toGrade(r.score);
      return { name: d.name, letter: g.letter, gpa: g.gpa, score: r.score, color: g.color, summary: r.summary, recommendation: r.rec };
    });
  }, [showReport, input]);

  const overallGpa = useMemo(() => {
    if (grades.length === 0) return 0;
    return grades.reduce((sum, g) => sum + g.gpa, 0) / grades.length;
  }, [grades]);

  const overallLetter = useMemo(() => {
    const score = grades.length > 0 ? grades.reduce((sum, g) => sum + g.score, 0) / grades.length : 0;
    return toGrade(score);
  }, [grades]);

  const canGenerate = parseInt(totalCards) > 0 && parseFloat(totalValue) > 0 && sports.length > 0;

  const dimIcons: Record<string, string> = {
    'Diversification': '🌐',
    'Value Density': '💎',
    'Grade Quality': '🏅',
    'Rookie Ratio': '⭐',
    'Vintage Depth': '🏛️',
    'Growth Potential': '📈',
    'Liquidity': '💧',
    'Premium Cards': '✨',
  };

  return (
    <div>
      {/* Presets */}
      <div className="mb-8">
        <p className="text-sm text-gray-500 mb-3">Quick start — load a sample collection:</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(p => (
            <button
              key={p.name}
              onClick={() => loadPreset(p)}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm text-gray-300 hover:text-white transition-colors text-left"
            >
              <span className="font-medium block">{p.name}</span>
              <span className="text-xs text-gray-500">{p.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-6">Describe Your Collection</h2>

        {/* Basics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Total Cards</label>
            <input type="number" value={totalCards} onChange={e => setTotalCards(e.target.value)} placeholder="e.g. 200"
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Total Estimated Value ($)</label>
            <input type="number" value={totalValue} onChange={e => setTotalValue(e.target.value)} placeholder="e.g. 5000"
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none" />
          </div>
        </div>

        {/* Sports */}
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">Sports in Your Collection</label>
          <div className="flex flex-wrap gap-2">
            {SPORT_OPTIONS.map(s => (
              <button key={s} onClick={() => toggleSport(s)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  sports.includes(s)
                    ? 'bg-emerald-900/60 border-emerald-700 text-emerald-400'
                    : 'bg-gray-900 border-gray-600 text-gray-400 hover:border-gray-500'
                }`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Era Breakdown */}
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-3">Era Breakdown (approximate %)</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Vintage (pre-1980)', value: vintagePrePct, set: setVintagePrePct },
              { label: 'Junk Wax (1980-1995)', value: junkWaxPct, set: setJunkWaxPct },
              { label: 'Modern (1996-2010)', value: modernPct, set: setModernPct },
              { label: 'Ultra-Modern (2011+)', value: ultraModernPct, set: setUltraModernPct },
            ].map(era => (
              <div key={era.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-300">{era.label}</span>
                  <span className="text-sm text-emerald-400 font-mono">{era.value}%</span>
                </div>
                <input type="range" min={0} max={100} value={era.value} onChange={e => era.set(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">Total: {vintagePrePct + junkWaxPct + modernPct + ultraModernPct}% (doesn&apos;t need to equal exactly 100%)</p>
        </div>

        {/* Grading */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-gray-400">% Graded Cards</label>
              <span className="text-sm text-emerald-400 font-mono">{gradedPct}%</span>
            </div>
            <input type="range" min={0} max={100} value={gradedPct} onChange={e => setGradedPct(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Average Grade (if any graded)</label>
            <select value={avgGrade} onChange={e => setAvgGrade(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none">
              {['10', '9.5', '9', '8.5', '8', '7.5', '7', '6.5', '6', '5', '4', '3'].map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Card Types */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-gray-400">% Rookie Cards</label>
              <span className="text-sm text-emerald-400 font-mono">{rookiePct}%</span>
            </div>
            <input type="range" min={0} max={100} value={rookiePct} onChange={e => setRookiePct(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-gray-400">% Autographs</label>
              <span className="text-sm text-emerald-400 font-mono">{autosPct}%</span>
            </div>
            <input type="range" min={0} max={100} value={autosPct} onChange={e => setAutosPct(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-gray-400">% Numbered Parallels</label>
              <span className="text-sm text-emerald-400 font-mono">{parallelsPct}%</span>
            </div>
            <input type="range" min={0} max={100} value={parallelsPct} onChange={e => setParallelsPct(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
          </div>
        </div>

        {/* Player Mix */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Unique Players</label>
            <input type="number" value={uniquePlayers} onChange={e => setUniquePlayers(e.target.value)} placeholder="e.g. 50"
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-gray-400">% Active Players</label>
              <span className="text-sm text-emerald-400 font-mono">{activePct}%</span>
            </div>
            <input type="range" min={0} max={100} value={activePct} onChange={e => setActivePct(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-gray-400">% Value in Top 3 Players</label>
              <span className="text-sm text-emerald-400 font-mono">{topPlayerPct}%</span>
            </div>
            <input type="range" min={0} max={100} value={topPlayerPct} onChange={e => setTopPlayerPct(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
          </div>
        </div>

        <button
          onClick={() => setShowReport(true)}
          disabled={!canGenerate}
          className={`w-full py-3 rounded-xl font-bold text-lg transition-colors ${
            canGenerate
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          Generate Report Card
        </button>
      </div>

      {/* Report Card Results */}
      {showReport && grades.length > 0 && (
        <div className="space-y-6">
          {/* Overall GPA */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 text-center">
            <p className="text-sm text-gray-500 mb-2 uppercase tracking-wider">Overall Collection Grade</p>
            <div className={`text-7xl font-black ${overallLetter.color} mb-2`}>{overallLetter.letter}</div>
            <p className="text-2xl text-gray-300 font-bold">{overallGpa.toFixed(2)} GPA</p>
            <p className="text-sm text-gray-500 mt-2">
              {fmt(input.totalValue)} across {input.totalCards.toLocaleString()} cards &middot;
              {' '}{input.sports.join(', ')} &middot;
              {' '}{input.gradedPct}% graded
            </p>
            <div className="mt-4 flex justify-center gap-1">
              {grades.map(g => (
                <div key={g.name} className="flex flex-col items-center px-2">
                  <span className={`text-lg font-bold ${g.color}`}>{g.letter}</span>
                  <span className="text-[10px] text-gray-500 mt-0.5 whitespace-nowrap">{g.name.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Individual Dimensions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {grades.map(g => (
              <div key={g.name} className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{dimIcons[g.name] || '📊'}</span>
                    <h3 className="text-white font-bold">{g.name}</h3>
                  </div>
                  <div className={`text-3xl font-black ${g.color}`}>{g.letter}</div>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      g.score >= 80 ? 'bg-emerald-500' : g.score >= 60 ? 'bg-yellow-500' : g.score >= 40 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${g.score}%` }}
                  />
                </div>
                <p className="text-sm text-gray-400 mb-2">{g.summary}</p>
                <div className="bg-gray-900/60 border border-gray-700/50 rounded-lg px-3 py-2">
                  <p className="text-xs text-emerald-400 font-medium mb-0.5">Recommendation</p>
                  <p className="text-xs text-gray-300">{g.recommendation}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Strengths & Weaknesses Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-5">
              <h3 className="text-emerald-400 font-bold mb-3">Strengths</h3>
              <ul className="space-y-2">
                {grades.filter(g => g.score >= 75).sort((a, b) => b.score - a.score).slice(0, 3).map(g => (
                  <li key={g.name} className="flex items-center gap-2 text-sm text-gray-300">
                    <span className={`font-bold ${g.color}`}>{g.letter}</span>
                    <span>{g.name}</span>
                  </li>
                ))}
                {grades.filter(g => g.score >= 75).length === 0 && (
                  <li className="text-sm text-gray-500">No strong areas yet — room to grow everywhere</li>
                )}
              </ul>
            </div>
            <div className="bg-red-950/20 border border-red-800/30 rounded-xl p-5">
              <h3 className="text-red-400 font-bold mb-3">Areas to Improve</h3>
              <ul className="space-y-2">
                {grades.filter(g => g.score < 60).sort((a, b) => a.score - b.score).slice(0, 3).map(g => (
                  <li key={g.name} className="flex items-center gap-2 text-sm text-gray-300">
                    <span className={`font-bold ${g.color}`}>{g.letter}</span>
                    <span>{g.name}</span>
                  </li>
                ))}
                {grades.filter(g => g.score < 60).length === 0 && (
                  <li className="text-sm text-gray-500">No major weaknesses — strong across the board</li>
                )}
              </ul>
            </div>
          </div>

          {/* Action Plan */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
            <h3 className="text-white font-bold mb-3">Your Top 3 Action Items</h3>
            <ol className="space-y-3">
              {grades.sort((a, b) => a.score - b.score).slice(0, 3).map((g, i) => (
                <li key={g.name} className="flex gap-3 text-sm">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-900/60 border border-emerald-800/50 text-emerald-400 text-xs flex items-center justify-center font-bold">{i + 1}</span>
                  <div>
                    <span className="text-white font-medium">{g.name}</span>
                    <span className={`ml-2 text-xs ${g.color}`}>({g.letter})</span>
                    <p className="text-gray-400 mt-0.5">{g.recommendation}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
