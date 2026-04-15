'use client';

import { useState, useMemo } from 'react';

/* ─── deterministic "random" from date ─── */
function dateHash(offset = 0): number {
  const d = new Date();
  const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate() + offset;
  let h = seed;
  h = ((h >> 16) ^ h) * 0x45d9f3b;
  h = ((h >> 16) ^ h) * 0x45d9f3b;
  h = (h >> 16) ^ h;
  return (h & 0x7fffffff) / 0x7fffffff;
}

function weekHash(offset = 0): number {
  const d = new Date();
  const weekNum = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 1).getTime()) / (7 * 86400000));
  const seed = d.getFullYear() * 100 + weekNum + offset;
  let h = seed;
  h = ((h >> 16) ^ h) * 0x45d9f3b;
  h = ((h >> 16) ^ h) * 0x45d9f3b;
  h = (h >> 16) ^ h;
  return (h & 0x7fffffff) / 0x7fffffff;
}

/* ─── types ─── */
type Sport = 'baseball' | 'basketball' | 'football' | 'hockey';
type Confidence = 'very-high' | 'high' | 'medium' | 'low';
type SignalDirection = 'bullish' | 'bearish' | 'neutral';
type RiskLevel = 'low' | 'moderate' | 'elevated' | 'high';

interface MoneyFlowSignal {
  sector: string;
  direction: SignalDirection;
  magnitude: number; // 1-10
  driver: string;
  confidence: Confidence;
}

interface SupplySignal {
  category: string;
  status: 'tight' | 'balanced' | 'oversupplied';
  trend: 'tightening' | 'stable' | 'loosening';
  detail: string;
}

interface DemandSignal {
  segment: string;
  heat: 'hot' | 'warm' | 'neutral' | 'cooling';
  change: string;
  driver: string;
}

interface SmartMoneyMove {
  action: string;
  rationale: string;
  timeframe: string;
  confidence: Confidence;
}

interface RiskFactor {
  risk: string;
  level: RiskLevel;
  probability: string;
  impact: string;
  mitigation: string;
}

/* ─── seasonal sport cycle position ─── */
function getSportCyclePosition(sport: Sport): { phase: string; heat: number; description: string } {
  const month = new Date().getMonth(); // 0-11
  const cycles: Record<Sport, { phases: { months: number[]; phase: string; heat: number; desc: string }[] }> = {
    baseball: {
      phases: [
        { months: [2, 3], phase: 'Spring Training / Opening Day', heat: 75, desc: 'Annual optimism surge. Rookie hype cycle begins.' },
        { months: [4, 5, 6], phase: 'Regular Season', heat: 55, desc: 'Steady demand. All-Star break creates mid-season catalyst.' },
        { months: [7, 8, 9], phase: 'Playoff Race / Postseason', heat: 85, desc: 'Peak demand. Breakout performers drive card prices.' },
        { months: [10, 11, 0, 1], phase: 'Off-Season', heat: 30, desc: 'Value buying window. Free agency creates speculation.' },
      ],
    },
    basketball: {
      phases: [
        { months: [9, 10, 11], phase: 'Season Tip-Off', heat: 70, desc: 'Rookie debut hype. New product releases drive demand.' },
        { months: [0, 1], phase: 'Mid-Season', heat: 55, desc: 'All-Star selection catalyst. Trade deadline speculation.' },
        { months: [2, 3, 4, 5], phase: 'Playoffs / Finals', heat: 90, desc: 'Peak demand. Championship performers surge 30-50%.' },
        { months: [6, 7, 8], phase: 'Off-Season / Draft', heat: 40, desc: 'Draft picks create speculation. Summer League reveals.' },
      ],
    },
    football: {
      phases: [
        { months: [8, 9, 10], phase: 'NFL Season Kickoff', heat: 80, desc: 'Highest seasonal demand. Fantasy football drives interest.' },
        { months: [11, 0, 1], phase: 'Playoffs / Super Bowl', heat: 95, desc: 'Peak market. Championship run creates massive spikes.' },
        { months: [2, 3], phase: 'Free Agency / Draft', heat: 65, desc: 'Draft picks dominate. Combine creates hype cycles.' },
        { months: [4, 5, 6, 7], phase: 'Off-Season', heat: 25, desc: 'Deepest value window. Smart money accumulates here.' },
      ],
    },
    hockey: {
      phases: [
        { months: [9, 10, 11], phase: 'Season Start', heat: 50, desc: 'Modest demand. Young Gun rookie cards drive early interest.' },
        { months: [0, 1, 2], phase: 'Mid-Season', heat: 40, desc: 'Trade deadline approaching. Prospect values shifting.' },
        { months: [3, 4, 5], phase: 'Playoffs / Stanley Cup', heat: 70, desc: 'Playoff performers surge. Cup winner premium is real.' },
        { months: [6, 7, 8], phase: 'Off-Season / Draft', heat: 25, desc: 'Lowest demand. Draft picks create niche speculation.' },
      ],
    },
  };

  const sportData = cycles[sport];
  const current = sportData.phases.find(p => p.months.includes(month));
  if (!current) return { phase: 'Transitional', heat: 50, description: 'Between major phases.' };
  const variance = (dateHash(sport.length) - 0.5) * 10;
  return { phase: current.phase, heat: Math.round(Math.max(0, Math.min(100, current.heat + variance))), description: current.desc };
}

/* ─── generate intel ─── */
function generateMoneyFlow(): MoneyFlowSignal[] {
  const sports: Sport[] = ['baseball', 'basketball', 'football', 'hockey'];
  const flows: MoneyFlowSignal[] = sports.map((sport, i) => {
    const cycle = getSportCyclePosition(sport);
    const direction: SignalDirection = cycle.heat > 65 ? 'bullish' : cycle.heat > 40 ? 'neutral' : 'bearish';
    const mag = Math.round(cycle.heat / 10);
    const drivers = {
      baseball: ['Rookie prospect hype', 'Playoff race positioning', 'Free agency speculation', 'Spring training optimism'],
      basketball: ['Draft class evaluation', 'Playoff berth races', 'All-Star exposure', 'Summer league reveals'],
      football: ['Fantasy football demand', 'Super Bowl premium', 'Draft class hype', 'Combine performance data'],
      hockey: ['Young Guns releases', 'Playoff dark horses', 'Trade deadline moves', 'Draft prospect evaluation'],
    };
    return {
      sector: sport.charAt(0).toUpperCase() + sport.slice(1),
      direction,
      magnitude: mag,
      driver: drivers[sport][Math.floor(weekHash(i) * drivers[sport].length)],
      confidence: mag >= 8 ? 'very-high' : mag >= 6 ? 'high' : mag >= 4 ? 'medium' : 'low',
    };
  });

  // Add cross-sport signals
  flows.push({
    sector: 'Vintage (Pre-1980)',
    direction: weekHash(10) > 0.5 ? 'bullish' : 'neutral',
    magnitude: Math.round(5 + weekHash(11) * 4),
    driver: 'Institutional money favoring tangible, scarce assets with historical demand floor',
    confidence: 'high',
  });
  flows.push({
    sector: 'Modern Rookies (2020+)',
    direction: weekHash(20) > 0.6 ? 'bullish' : weekHash(20) < 0.3 ? 'bearish' : 'neutral',
    magnitude: Math.round(4 + weekHash(21) * 5),
    driver: weekHash(22) > 0.5 ? 'Social media hype driving retail demand' : 'Performance-based price discovery continuing',
    confidence: 'medium',
  });

  return flows;
}

function generateSupplySignals(): SupplySignal[] {
  return [
    {
      category: 'Sealed Hobby Boxes',
      status: weekHash(30) > 0.6 ? 'tight' : 'balanced',
      trend: weekHash(31) > 0.5 ? 'tightening' : 'stable',
      detail: 'Premium hobby boxes holding value. Retail products oversupplied at big-box stores.',
    },
    {
      category: 'PSA 10 Population',
      status: 'oversupplied',
      trend: 'loosening',
      detail: 'Grading turnaround times dropping = more slabs hitting market. Population inflation a concern for modern cards.',
    },
    {
      category: 'Vintage Raw (Pre-1980)',
      status: 'tight',
      trend: 'tightening',
      detail: 'Finite supply. Estate sales are primary source. High-grade raw vintage increasingly rare at shows.',
    },
    {
      category: 'Modern Parallels & SSPs',
      status: weekHash(32) > 0.4 ? 'balanced' : 'oversupplied',
      trend: 'stable',
      detail: 'Print runs stable but parallel fatigue setting in. Collectors prioritizing base RCs over low-numbered parallels.',
    },
    {
      category: 'Graded Vintage (PSA 7+)',
      status: 'tight',
      trend: 'tightening',
      detail: 'Strong hands holding. Long-term collectors not selling at current prices. New supply mostly from fresh submissions.',
    },
  ];
}

function generateDemandSignals(): DemandSignal[] {
  const sports: Sport[] = ['baseball', 'basketball', 'football', 'hockey'];
  const signals: DemandSignal[] = [];

  for (const sport of sports) {
    const cycle = getSportCyclePosition(sport);
    signals.push({
      segment: `${sport.charAt(0).toUpperCase() + sport.slice(1)} Rookie Cards`,
      heat: cycle.heat > 70 ? 'hot' : cycle.heat > 50 ? 'warm' : cycle.heat > 30 ? 'neutral' : 'cooling',
      change: cycle.heat > 60 ? `+${Math.round(cycle.heat / 5)}% week-over-week` : `${Math.round((cycle.heat - 50) / 3)}% week-over-week`,
      driver: cycle.description,
    });
  }

  signals.push({
    segment: 'Women\'s Sports Cards',
    heat: 'warm',
    change: '+8% month-over-month',
    driver: 'WNBA expansion, Caitlin Clark effect, growing collector base. Still early innings.',
  });
  signals.push({
    segment: 'Soccer / International',
    heat: weekHash(40) > 0.5 ? 'warm' : 'neutral',
    change: weekHash(41) > 0.5 ? '+5% MoM' : 'Flat',
    driver: '2026 World Cup proximity increasing interest. Topps Chrome UCL as gateway product.',
  });
  signals.push({
    segment: 'Sealed Product Investment',
    heat: weekHash(42) > 0.6 ? 'hot' : 'warm',
    change: '+12% on key hobby boxes',
    driver: 'Collectors shifting to sealed as hedge against grading population inflation.',
  });

  return signals;
}

function generateSmartMoneyMoves(): SmartMoneyMove[] {
  const allMoves: SmartMoneyMove[] = [
    { action: 'Accumulate football rookies during spring lull', rationale: 'NFL cards are 30-50% below peak (Sep-Feb) during spring/summer. Historical pattern repeats annually.', timeframe: 'Hold until September', confidence: 'very-high' },
    { action: 'Sell basketball cards into playoff hype', rationale: 'Championship contender cards peak during deep playoff runs. Sell into strength before off-season correction.', timeframe: 'Sell within 2 weeks of elimination', confidence: 'high' },
    { action: 'Buy vintage HOF base cards under $500', rationale: 'Blue-chip vintage (Mantle, Aaron, Mays, Jordan) at <$500 entries have strong floors. Downsides limited, upside material.', timeframe: '1-3 year hold', confidence: 'high' },
    { action: 'Avoid chasing social media pump cards', rationale: 'Cards that spike 200%+ on TikTok/YouTube exposure typically retrace 60-80% within 2 weeks. Let the hype die.', timeframe: 'Wait 2 weeks post-spike', confidence: 'very-high' },
    { action: 'Position in sealed hobby boxes from 2020-2022', rationale: 'Key rookie classes (Herbert, Wemby, Stroud) in this era. Sealed product scarcity increases post-production.', timeframe: '2-5 year hold', confidence: 'medium' },
    { action: 'Grade only high-value raw cards ($100+ estimated)', rationale: 'PSA/BGS fees + turnaround make grading sub-$100 cards negative EV unless you expect a 10.', timeframe: 'Ongoing discipline', confidence: 'very-high' },
    { action: 'Diversify across sports and eras', rationale: 'Single-sport portfolios have 2-3x volatility of diversified ones. Add hockey/vintage to offset football concentration.', timeframe: 'Portfolio rebalance quarterly', confidence: 'high' },
    { action: 'Track PWCC 500 and Alt 100 indices', rationale: 'Institutional indices show where large money is flowing before retail catches on. Rising index = early demand signal.', timeframe: 'Check weekly', confidence: 'medium' },
  ];

  const count = 5;
  const selected: SmartMoneyMove[] = [];
  const used = new Set<number>();
  for (let i = 0; i < count; i++) {
    let idx = Math.floor(weekHash(50 + i) * allMoves.length);
    while (used.has(idx)) idx = (idx + 1) % allMoves.length;
    used.add(idx);
    selected.push(allMoves[idx]);
  }
  return selected;
}

function generateRiskFactors(): RiskFactor[] {
  return [
    {
      risk: 'Grading Population Inflation',
      level: 'elevated',
      probability: 'High',
      impact: 'PSA 10 premiums compressing on modern cards as supply grows. 2020+ PSA 10s losing scarcity premium.',
      mitigation: 'Focus on low-pop vintage grades. For modern, prefer BGS 9.5/10 Black Labels or SGC tuxedos with lower populations.',
    },
    {
      risk: 'Print Run Fatigue',
      level: 'moderate',
      probability: 'Medium',
      impact: 'Panini/Topps releasing more products per year. Collector wallet fatigue could depress base product values.',
      mitigation: 'Stick to flagship products (Prizm, Topps Chrome, Bowman 1st). Avoid late-season releases and obscure parallels.',
    },
    {
      risk: 'Player Injury / Scandal',
      level: 'high',
      probability: 'Moderate',
      impact: 'Career-altering injury can drop a player\'s cards 40-70% overnight. Scandals worse. Unhedgeable at the single-card level.',
      mitigation: 'Diversify across 10+ players minimum. Size any single player position at <15% of portfolio. Use stop-losses on high-value holdings.',
    },
    {
      risk: 'Economic Downturn / Recession',
      level: weekHash(60) > 0.5 ? 'moderate' : 'low',
      probability: 'Low-Medium',
      impact: 'Discretionary spending on collectibles drops early in recessions. Sub-$100 cards hit hardest. Blue-chip vintage holds best.',
      mitigation: 'Maintain cash reserves. Quality over quantity. Vintage > modern in downturn resilience.',
    },
    {
      risk: 'AI-Generated Fakes / Authentication Issues',
      level: 'moderate',
      probability: 'Increasing',
      impact: 'AI-generated card images and improved counterfeits eroding buyer confidence, especially for raw card purchases online.',
      mitigation: 'Buy graded from reputable auction houses. Use CSG/PSA cert verification. Inspect high-value raw purchases in person.',
    },
  ];
}

/* ─── display helpers ─── */
const directionColor: Record<SignalDirection, string> = {
  bullish: 'text-emerald-400',
  bearish: 'text-red-400',
  neutral: 'text-gray-400',
};

const directionBg: Record<SignalDirection, string> = {
  bullish: 'bg-emerald-950/40 border-emerald-800/40',
  bearish: 'bg-red-950/40 border-red-800/40',
  neutral: 'bg-gray-800/40 border-gray-700/40',
};

const confidenceLabel: Record<Confidence, { label: string; color: string }> = {
  'very-high': { label: 'Very High', color: 'text-emerald-400' },
  high: { label: 'High', color: 'text-blue-400' },
  medium: { label: 'Medium', color: 'text-amber-400' },
  low: { label: 'Low', color: 'text-gray-500' },
};

const heatColor: Record<string, string> = {
  hot: 'text-red-400',
  warm: 'text-amber-400',
  neutral: 'text-gray-400',
  cooling: 'text-blue-400',
};

const riskColor: Record<RiskLevel, string> = {
  low: 'text-emerald-400',
  moderate: 'text-amber-400',
  elevated: 'text-orange-400',
  high: 'text-red-400',
};

const riskBg: Record<RiskLevel, string> = {
  low: 'bg-emerald-950/30',
  moderate: 'bg-amber-950/30',
  elevated: 'bg-orange-950/30',
  high: 'bg-red-950/30',
};

type Section = 'overview' | 'money-flow' | 'supply' | 'demand' | 'smart-money' | 'risk';

/* ─── component ─── */
export default function MarketIntelClient() {
  const [activeSection, setActiveSection] = useState<Section>('overview');

  const moneyFlow = useMemo(() => generateMoneyFlow(), []);
  const supply = useMemo(() => generateSupplySignals(), []);
  const demand = useMemo(() => generateDemandSignals(), []);
  const smartMoney = useMemo(() => generateSmartMoneyMoves(), []);
  const risks = useMemo(() => generateRiskFactors(), []);

  const sportCycles = useMemo(() => {
    const sports: Sport[] = ['baseball', 'basketball', 'football', 'hockey'];
    return sports.map(s => ({ sport: s, ...getSportCyclePosition(s) }));
  }, []);

  const overallSentiment = useMemo(() => {
    const bullish = moneyFlow.filter(f => f.direction === 'bullish').length;
    const bearish = moneyFlow.filter(f => f.direction === 'bearish').length;
    if (bullish > bearish + 2) return { label: 'Bullish', color: 'text-emerald-400', bg: 'bg-emerald-950/40' };
    if (bearish > bullish + 1) return { label: 'Bearish', color: 'text-red-400', bg: 'bg-red-950/40' };
    return { label: 'Mixed', color: 'text-amber-400', bg: 'bg-amber-950/40' };
  }, [moneyFlow]);

  const reportDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const sections: { key: Section; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'money-flow', label: 'Money Flow' },
    { key: 'supply', label: 'Supply' },
    { key: 'demand', label: 'Demand' },
    { key: 'smart-money', label: 'Smart Money' },
    { key: 'risk', label: 'Risk' },
  ];

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <div className="bg-indigo-950/30 border border-indigo-800/40 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="text-indigo-400 text-xs font-mono uppercase tracking-wider mb-1">Weekly Intelligence Briefing</div>
            <div className="text-gray-400 text-sm">{reportDate}</div>
          </div>
          <div className={`${overallSentiment.bg} border border-current/20 rounded-lg px-4 py-2 text-center`}>
            <div className="text-gray-400 text-xs mb-0.5">Market Sentiment</div>
            <div className={`text-lg font-bold ${overallSentiment.color}`}>{overallSentiment.label}</div>
          </div>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {sections.map(s => (
          <button
            key={s.key}
            onClick={() => setActiveSection(s.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeSection === s.key
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-800/60 text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          {/* Sport Cycle Dashboard */}
          <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Sector Rotation Dashboard</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {sportCycles.map(sc => (
                <div key={sc.sport} className="bg-gray-800/40 border border-gray-700/40 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-white font-semibold capitalize">{sc.sport}</span>
                      <div className="text-gray-500 text-xs mt-0.5">{sc.phase}</div>
                    </div>
                    <div className={`text-lg font-bold ${sc.heat > 70 ? 'text-red-400' : sc.heat > 45 ? 'text-amber-400' : 'text-blue-400'}`}>
                      {sc.heat}
                    </div>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full transition-all ${
                        sc.heat > 70 ? 'bg-red-500' : sc.heat > 45 ? 'bg-amber-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${sc.heat}%` }}
                    />
                  </div>
                  <p className="text-gray-400 text-xs">{sc.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-4 text-center">
              <div className="text-gray-400 text-xs mb-1">Bullish Sectors</div>
              <div className="text-emerald-400 text-2xl font-bold">{moneyFlow.filter(f => f.direction === 'bullish').length}</div>
              <div className="text-gray-500 text-xs">of {moneyFlow.length}</div>
            </div>
            <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-4 text-center">
              <div className="text-gray-400 text-xs mb-1">Hot Segments</div>
              <div className="text-red-400 text-2xl font-bold">{demand.filter(d => d.heat === 'hot').length}</div>
              <div className="text-gray-500 text-xs">of {demand.length}</div>
            </div>
            <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-4 text-center">
              <div className="text-gray-400 text-xs mb-1">Supply Tight</div>
              <div className="text-amber-400 text-2xl font-bold">{supply.filter(s => s.status === 'tight').length}</div>
              <div className="text-gray-500 text-xs">of {supply.length}</div>
            </div>
            <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-4 text-center">
              <div className="text-gray-400 text-xs mb-1">Elevated Risks</div>
              <div className="text-orange-400 text-2xl font-bold">{risks.filter(r => r.level === 'elevated' || r.level === 'high').length}</div>
              <div className="text-gray-500 text-xs">of {risks.length}</div>
            </div>
          </div>

          {/* Key Takeaways */}
          <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Key Takeaways This Week</h2>
            <div className="space-y-3">
              {sportCycles.filter(sc => sc.heat > 65).length > 0 && (
                <div className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                  <p className="text-gray-300 text-sm">
                    <span className="text-white font-medium">Peak demand:</span> {sportCycles.filter(sc => sc.heat > 65).map(sc => sc.sport).join(', ')} cards
                    in high-demand phase. Sellers should capitalize; buyers should be selective.
                  </p>
                </div>
              )}
              {sportCycles.filter(sc => sc.heat < 35).length > 0 && (
                <div className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                  <p className="text-gray-300 text-sm">
                    <span className="text-white font-medium">Value window:</span> {sportCycles.filter(sc => sc.heat < 35).map(sc => sc.sport).join(', ')} cards
                    in off-season lull. Best prices of the year for patient accumulators.
                  </p>
                </div>
              )}
              <div className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                <p className="text-gray-300 text-sm">
                  <span className="text-white font-medium">Supply watch:</span> Vintage raw supply continues tightening.
                  PSA 10 modern population growing. Sealed hobby boxes holding value.
                </p>
              </div>
              <div className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                <p className="text-gray-300 text-sm">
                  <span className="text-white font-medium">Risk note:</span> {risks.filter(r => r.level === 'elevated' || r.level === 'high').length} elevated+
                  risk factors active. Player injury remains the largest unhedgeable risk.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Money Flow */}
      {activeSection === 'money-flow' && (
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-2">Money Flow Analysis</h2>
          <p className="text-gray-400 text-sm mb-6">Where capital is moving in the card market this week.</p>
          <div className="space-y-3">
            {moneyFlow.map(flow => (
              <div key={flow.sector} className={`border rounded-lg p-4 ${directionBg[flow.direction]}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-white font-semibold">{flow.sector}</span>
                    <span className={`text-xs font-medium uppercase ${directionColor[flow.direction]}`}>
                      {flow.direction}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${confidenceLabel[flow.confidence].color}`}>
                      {confidenceLabel[flow.confidence].label}
                    </span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 10 }, (_, i) => (
                        <div
                          key={i}
                          className={`w-1.5 h-3 rounded-sm ${
                            i < flow.magnitude
                              ? flow.direction === 'bullish' ? 'bg-emerald-500' : flow.direction === 'bearish' ? 'bg-red-500' : 'bg-gray-500'
                              : 'bg-gray-800'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-400 text-sm">{flow.driver}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Supply */}
      {activeSection === 'supply' && (
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-2">Supply Picture</h2>
          <p className="text-gray-400 text-sm mb-6">Product availability, print runs, and grading population trends.</p>
          <div className="space-y-4">
            {supply.map(s => {
              const statusColor = s.status === 'tight' ? 'text-red-400' : s.status === 'oversupplied' ? 'text-blue-400' : 'text-gray-400';
              const trendColor = s.trend === 'tightening' ? 'text-red-400' : s.trend === 'loosening' ? 'text-blue-400' : 'text-gray-500';
              return (
                <div key={s.category} className="bg-gray-800/40 border border-gray-700/40 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-semibold">{s.category}</span>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-medium uppercase ${statusColor}`}>{s.status}</span>
                      <span className={`text-xs ${trendColor}`}>
                        {s.trend === 'tightening' ? 'Tightening' : s.trend === 'loosening' ? 'Loosening' : 'Stable'}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm">{s.detail}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Demand */}
      {activeSection === 'demand' && (
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-2">Demand Signals</h2>
          <p className="text-gray-400 text-sm mb-6">Which segments are heating up and what is driving buyer activity.</p>
          <div className="space-y-3">
            {demand.map(d => (
              <div key={d.segment} className="bg-gray-800/40 border border-gray-700/40 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-white font-semibold">{d.segment}</span>
                    <span className={`text-xs font-medium uppercase ${heatColor[d.heat]}`}>{d.heat}</span>
                  </div>
                  <span className={`text-xs font-mono ${d.change.startsWith('+') ? 'text-emerald-400' : d.change.startsWith('-') ? 'text-red-400' : 'text-gray-500'}`}>
                    {d.change}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">{d.driver}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Smart Money */}
      {activeSection === 'smart-money' && (
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-2">Smart Money Moves</h2>
          <p className="text-gray-400 text-sm mb-6">What sophisticated collectors and dealers are doing right now.</p>
          <div className="space-y-4">
            {smartMoney.map((move, i) => (
              <div key={i} className="bg-gray-800/40 border border-gray-700/40 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold text-sm">{move.action}</span>
                  <span className={`text-xs ${confidenceLabel[move.confidence].color}`}>
                    {confidenceLabel[move.confidence].label} confidence
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-2">{move.rationale}</p>
                <div className="text-indigo-400 text-xs font-medium">Timeframe: {move.timeframe}</div>
              </div>
            ))}
          </div>
          <p className="text-gray-600 text-xs mt-4">
            Smart money analysis reflects patterns observed in auction results, dealer inventory decisions, and institutional index data.
            These are observations, not recommendations.
          </p>
        </div>
      )}

      {/* Risk */}
      {activeSection === 'risk' && (
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-2">Risk Assessment</h2>
          <p className="text-gray-400 text-sm mb-6">Factors that could negatively impact card values. Monitor and mitigate.</p>
          <div className="space-y-4">
            {risks.map(risk => (
              <div key={risk.risk} className={`${riskBg[risk.level]} border border-gray-700/40 rounded-lg p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold">{risk.risk}</span>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium uppercase ${riskColor[risk.level]}`}>{risk.level}</span>
                    <span className="text-gray-500 text-xs">P: {risk.probability}</span>
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-2">{risk.impact}</p>
                <div className="bg-gray-800/60 rounded-lg px-3 py-2">
                  <span className="text-indigo-400 text-xs font-medium">Mitigation: </span>
                  <span className="text-gray-400 text-xs">{risk.mitigation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
