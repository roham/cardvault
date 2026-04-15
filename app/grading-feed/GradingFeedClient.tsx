'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// ── Types ────────────────────────────────────────────────────────────────────
type GradingCompany = 'PSA' | 'BGS' | 'CGC' | 'SGC';
type Sport = 'all' | 'Baseball' | 'Basketball' | 'Football' | 'Hockey';

interface GradeResult {
  id: number;
  card: string;
  player: string;
  sport: string;
  company: GradingCompany;
  grade: number;
  subgrades?: { centering: number; corners: number; edges: number; surface: number }; // BGS only
  rawValue: number;
  gradedValue: number;
  submitter: string;
  timestamp: number;
}

// ── Data ─────────────────────────────────────────────────────────────────────
const CARDS = [
  { card: '2023 Panini Prizm Victor Wembanyama RC', player: 'Victor Wembanyama', sport: 'Basketball', rawValue: 50 },
  { card: '2018 Panini Prizm Luka Doncic RC', player: 'Luka Doncic', sport: 'Basketball', rawValue: 150 },
  { card: '2020 Panini Prizm Anthony Edwards RC', player: 'Anthony Edwards', sport: 'Basketball', rawValue: 65 },
  { card: '2015 Panini Prizm Nikola Jokic RC', player: 'Nikola Jokic', sport: 'Basketball', rawValue: 130 },
  { card: '2024 Panini Prizm Caitlin Clark RC', player: 'Caitlin Clark', sport: 'Basketball', rawValue: 90 },
  { card: '2011 Topps Update Mike Trout RC', player: 'Mike Trout', sport: 'Baseball', rawValue: 400 },
  { card: '2018 Topps Update Shohei Ohtani RC', player: 'Shohei Ohtani', sport: 'Baseball', rawValue: 120 },
  { card: '2019 Topps Chrome Fernando Tatis Jr. RC', player: 'Fernando Tatis Jr.', sport: 'Baseball', rawValue: 45 },
  { card: '2024 Topps Chrome Jackson Chourio RC', player: 'Jackson Chourio', sport: 'Baseball', rawValue: 30 },
  { card: '2024 Bowman Chrome Paul Skenes', player: 'Paul Skenes', sport: 'Baseball', rawValue: 110 },
  { card: '2017 Panini Prizm Patrick Mahomes RC', player: 'Patrick Mahomes', sport: 'Football', rawValue: 300 },
  { card: '2020 Panini Prizm Joe Burrow RC', player: 'Joe Burrow', sport: 'Football', rawValue: 55 },
  { card: '2020 Panini Prizm Justin Herbert RC', player: 'Justin Herbert', sport: 'Football', rawValue: 100 },
  { card: '2024 Panini Prizm Caleb Williams RC', player: 'Caleb Williams', sport: 'Football', rawValue: 20 },
  { card: '2024 Panini Prizm Marvin Harrison Jr. RC', player: 'Marvin Harrison Jr.', sport: 'Football', rawValue: 25 },
  { card: '2023 Upper Deck Connor Bedard RC YG', player: 'Connor Bedard', sport: 'Hockey', rawValue: 200 },
  { card: '2005 Upper Deck Sidney Crosby YG RC', player: 'Sidney Crosby', sport: 'Hockey', rawValue: 175 },
  { card: '2015 Upper Deck Connor McDavid YG RC', player: 'Connor McDavid', sport: 'Hockey', rawValue: 250 },
  { card: '2019 Upper Deck Cale Makar YG RC', player: 'Cale Makar', sport: 'Hockey', rawValue: 60 },
  { card: '2003 Topps Chrome LeBron James RC', player: 'LeBron James', sport: 'Basketball', rawValue: 500 },
];

const SUBMITTER_NAMES = [
  'CardKing99', 'GradingGuru', 'RookieHunter', 'WaxRipper23', 'PSA10Chaser',
  'VintageCollector', 'SportsVault', 'FlipMaster', 'ChromeJunkie', 'CardShark88',
  'MintCondition', 'SlabNation', 'GemMintGary', 'PackPuller', 'BaseballDad42',
  'HoopsKing', 'GridironCards', 'PuckCollector', 'InvestorKai', 'DealerTony',
];

const COMPANIES: GradingCompany[] = ['PSA', 'BGS', 'CGC', 'SGC'];

const COMPANY_COLORS: Record<GradingCompany, { text: string; bg: string; border: string }> = {
  PSA: { text: 'text-red-400', bg: 'bg-red-950/40', border: 'border-red-800/40' },
  BGS: { text: 'text-blue-400', bg: 'bg-blue-950/40', border: 'border-blue-800/40' },
  CGC: { text: 'text-yellow-400', bg: 'bg-yellow-950/40', border: 'border-yellow-800/40' },
  SGC: { text: 'text-green-400', bg: 'bg-green-950/40', border: 'border-green-800/40' },
};

const SPORT_COLORS: Record<string, string> = {
  Basketball: 'text-orange-400',
  Football: 'text-green-400',
  Baseball: 'text-blue-400',
  Hockey: 'text-cyan-400',
};

// Grade distribution (weighted — most cards come back 7-9)
const GRADE_WEIGHTS = [
  { grade: 10, weight: 8 },   // ~8% gem mint
  { grade: 9.5, weight: 12 }, // ~12% mint+
  { grade: 9, weight: 25 },   // ~25% mint
  { grade: 8.5, weight: 18 }, // ~18%
  { grade: 8, weight: 15 },   // ~15%
  { grade: 7.5, weight: 8 },
  { grade: 7, weight: 6 },
  { grade: 6.5, weight: 3 },
  { grade: 6, weight: 2 },
  { grade: 5, weight: 1.5 },
  { grade: 4, weight: 1 },
  { grade: 3, weight: 0.5 },
];

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function pickWeightedGrade(rng: () => number): number {
  const totalWeight = GRADE_WEIGHTS.reduce((a, b) => a + b.weight, 0);
  let r = rng() * totalWeight;
  for (const gw of GRADE_WEIGHTS) {
    r -= gw.weight;
    if (r <= 0) return gw.grade;
  }
  return 8;
}

function gradeMultiplier(grade: number): number {
  if (grade >= 10) return 3.5;
  if (grade >= 9.5) return 2.5;
  if (grade >= 9) return 1.8;
  if (grade >= 8.5) return 1.4;
  if (grade >= 8) return 1.15;
  if (grade >= 7) return 0.9;
  if (grade >= 6) return 0.7;
  return 0.5;
}

function formatValue(v: number): string {
  return v >= 1000 ? `$${(v / 1000).toFixed(1)}K` : `$${v}`;
}

function timeAgo(ts: number): string {
  const seconds = Math.floor((Date.now() - ts) / 1000);
  if (seconds < 10) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}

function generateResult(id: number, rng: () => number): GradeResult {
  const cardData = CARDS[Math.floor(rng() * CARDS.length)];
  const company = COMPANIES[Math.floor(rng() * COMPANIES.length)];
  const grade = pickWeightedGrade(rng);
  const mult = gradeMultiplier(grade);
  const gradedValue = Math.round(cardData.rawValue * mult);

  const result: GradeResult = {
    id,
    card: cardData.card,
    player: cardData.player,
    sport: cardData.sport,
    company,
    grade,
    rawValue: cardData.rawValue,
    gradedValue,
    submitter: SUBMITTER_NAMES[Math.floor(rng() * SUBMITTER_NAMES.length)],
    timestamp: Date.now(),
  };

  // BGS gets subgrades
  if (company === 'BGS') {
    const baseSubgrade = Math.max(grade - 0.5, 6);
    result.subgrades = {
      centering: Math.min(10, baseSubgrade + Math.round(rng() * 10) / 10),
      corners: Math.min(10, baseSubgrade + Math.round(rng() * 10) / 10),
      edges: Math.min(10, baseSubgrade + Math.round(rng() * 10) / 10),
      surface: Math.min(10, baseSubgrade + Math.round(rng() * 10) / 10),
    };
  }

  return result;
}

const MAX_RESULTS = 50;
const NEW_RESULT_INTERVAL = 12000; // new result every 12s

export default function GradingFeedClient() {
  const [results, setResults] = useState<GradeResult[]>([]);
  const [paused, setPaused] = useState(false);
  const [sportFilter, setSportFilter] = useState<Sport>('all');
  const [companyFilter, setCompanyFilter] = useState<GradingCompany | 'all'>('all');
  const [, setTick] = useState(0); // force re-render for timeAgo
  const nextId = useRef(1);
  const rngRef = useRef(seededRandom(Date.now()));

  // Initialize with some results
  useEffect(() => {
    const initial: GradeResult[] = [];
    for (let i = 0; i < 15; i++) {
      const result = generateResult(nextId.current++, rngRef.current);
      result.timestamp = Date.now() - (15 - i) * 8000; // stagger timestamps
      initial.push(result);
    }
    setResults(initial);
  }, []);

  // Add new results on interval
  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      const newResult = generateResult(nextId.current++, rngRef.current);
      setResults(prev => [newResult, ...prev].slice(0, MAX_RESULTS));
    }, NEW_RESULT_INTERVAL);
    return () => clearInterval(interval);
  }, [paused]);

  // Update time display
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 5000);
    return () => clearInterval(interval);
  }, []);

  const filtered = useMemo(() => {
    return results.filter(r => {
      if (sportFilter !== 'all' && r.sport !== sportFilter) return false;
      if (companyFilter !== 'all' && r.company !== companyFilter) return false;
      return true;
    });
  }, [results, sportFilter, companyFilter]);

  // Stats
  const stats = useMemo(() => {
    const total = results.length;
    const gemMints = results.filter(r => r.grade >= 10).length;
    const avgGrade = total > 0 ? results.reduce((a, r) => a + r.grade, 0) / total : 0;
    const totalValueAdded = results.reduce((a, r) => a + (r.gradedValue - r.rawValue), 0);
    return { total, gemMints, avgGrade, totalValueAdded };
  }, [results]);

  const isGemMint = useCallback((grade: number) => grade >= 10, []);

  return (
    <div className="space-y-6">
      {/* Live Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-white">{stats.total}</p>
          <p className="text-xs text-zinc-500">Results In</p>
        </div>
        <div className="bg-yellow-950/30 border border-yellow-800/30 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-yellow-400">{stats.gemMints}</p>
          <p className="text-xs text-zinc-500">Gem Mints</p>
        </div>
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-white">{stats.avgGrade.toFixed(1)}</p>
          <p className="text-xs text-zinc-500">Avg Grade</p>
        </div>
        <div className={`border rounded-lg p-3 text-center ${stats.totalValueAdded >= 0 ? 'bg-green-950/30 border-green-800/30' : 'bg-red-950/30 border-red-800/30'}`}>
          <p className={`text-2xl font-bold ${stats.totalValueAdded >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {stats.totalValueAdded >= 0 ? '+' : ''}{formatValue(stats.totalValueAdded)}
          </p>
          <p className="text-xs text-zinc-500">Value Added</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1 bg-zinc-900/70 border border-zinc-800 rounded-lg p-1">
          {(['all', 'Baseball', 'Basketball', 'Football', 'Hockey'] as const).map(s => (
            <button
              key={s}
              onClick={() => setSportFilter(s)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                sportFilter === s ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-zinc-900/70 border border-zinc-800 rounded-lg p-1">
          {(['all', ...COMPANIES] as const).map(c => (
            <button
              key={c}
              onClick={() => setCompanyFilter(c)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                companyFilter === c ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {c === 'all' ? 'All' : c}
            </button>
          ))}
        </div>
        <button
          onClick={() => setPaused(p => !p)}
          className={`ml-auto px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            paused ? 'border-green-800/50 text-green-400 hover:bg-green-950/30' : 'border-red-800/50 text-red-400 hover:bg-red-950/30'
          }`}
        >
          {paused ? '\u25B6 Resume' : '\u23F8 Pause'}
        </button>
      </div>

      {/* Live indicator */}
      {!paused && (
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          Live — new results every 12 seconds
        </div>
      )}

      {/* Results Feed */}
      <div className="space-y-2">
        {filtered.map((result) => {
          const gem = isGemMint(result.grade);
          const valueChange = result.gradedValue - result.rawValue;
          const roi = ((result.gradedValue - result.rawValue) / result.rawValue * 100).toFixed(0);
          const cc = COMPANY_COLORS[result.company];

          return (
            <div
              key={result.id}
              className={`border rounded-xl p-4 transition-all ${
                gem ? 'border-yellow-600/60 bg-yellow-950/20 ring-1 ring-yellow-500/20' : `${cc.border} ${cc.bg}`
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {gem && <span className="text-lg">{'\u2728'}</span>}
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${cc.bg} ${cc.text} ${cc.border} border`}>
                      {result.company}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      gem ? 'bg-yellow-950/60 text-yellow-400 border border-yellow-700/50' :
                      result.grade >= 9 ? 'bg-green-950/40 text-green-400' :
                      result.grade >= 7 ? 'bg-zinc-800 text-zinc-300' :
                      'bg-red-950/40 text-red-400'
                    }`}>
                      {result.grade}
                    </span>
                    {gem && <span className="text-xs font-bold text-yellow-400">GEM MINT!</span>}
                  </div>
                  <p className="text-white font-medium text-sm truncate">{result.card}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs">
                    <span className={SPORT_COLORS[result.sport]}>{result.sport}</span>
                    <span className="text-zinc-600">&middot;</span>
                    <span className="text-zinc-500">by {result.submitter}</span>
                    <span className="text-zinc-600">&middot;</span>
                    <span className="text-zinc-600">{timeAgo(result.timestamp)}</span>
                  </div>
                  {/* BGS Subgrades */}
                  {result.subgrades && (
                    <div className="flex gap-3 mt-2 text-xs text-zinc-500">
                      <span>CEN: <span className="text-zinc-300">{result.subgrades.centering}</span></span>
                      <span>COR: <span className="text-zinc-300">{result.subgrades.corners}</span></span>
                      <span>EDG: <span className="text-zinc-300">{result.subgrades.edges}</span></span>
                      <span>SUR: <span className="text-zinc-300">{result.subgrades.surface}</span></span>
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-zinc-500">Raw: {formatValue(result.rawValue)}</p>
                  <p className="text-sm font-bold text-white">{formatValue(result.gradedValue)}</p>
                  <p className={`text-xs font-medium ${valueChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {valueChange >= 0 ? '+' : ''}{formatValue(valueChange)} ({valueChange >= 0 ? '+' : ''}{roi}%)
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-zinc-500">
          <p className="text-lg mb-2">No results match your filters</p>
          <button
            onClick={() => { setSportFilter('all'); setCompanyFilter('all'); }}
            className="text-sm text-red-400 hover:text-red-300"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Grade Distribution */}
      <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-5">
        <h3 className="font-bold text-white mb-4">Grade Distribution</h3>
        <div className="space-y-2">
          {GRADE_WEIGHTS.slice(0, 8).map(gw => {
            const count = results.filter(r => r.grade === gw.grade).length;
            const pct = results.length > 0 ? (count / results.length) * 100 : 0;
            return (
              <div key={gw.grade} className="flex items-center gap-3 text-sm">
                <span className={`w-8 text-right font-bold ${
                  gw.grade >= 10 ? 'text-yellow-400' : gw.grade >= 9 ? 'text-green-400' : 'text-zinc-400'
                }`}>
                  {gw.grade}
                </span>
                <div className="flex-1 h-4 bg-zinc-800 rounded overflow-hidden">
                  <div
                    className={`h-full rounded transition-all duration-500 ${
                      gw.grade >= 10 ? 'bg-yellow-600' : gw.grade >= 9 ? 'bg-green-600' : 'bg-zinc-600'
                    }`}
                    style={{ width: `${Math.max(pct, 1)}%` }}
                  />
                </div>
                <span className="text-xs text-zinc-500 w-8">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grading Company Comparison */}
      <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-5">
        <h3 className="font-bold text-white mb-4">Company Comparison</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {COMPANIES.map(company => {
            const compResults = results.filter(r => r.company === company);
            const avg = compResults.length > 0 ? compResults.reduce((a, r) => a + r.grade, 0) / compResults.length : 0;
            const gems = compResults.filter(r => r.grade >= 10).length;
            const cc = COMPANY_COLORS[company];
            return (
              <div key={company} className={`${cc.bg} border ${cc.border} rounded-lg p-3 text-center`}>
                <p className={`font-bold ${cc.text}`}>{company}</p>
                <p className="text-xs text-zinc-500 mt-1">{compResults.length} graded</p>
                <p className="text-sm text-white font-medium">{avg.toFixed(1)} avg</p>
                <p className="text-xs text-yellow-400">{gems} gems</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
