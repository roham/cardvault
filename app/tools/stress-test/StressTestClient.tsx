'use client';

import { useState, useMemo, useCallback } from 'react';
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

function pct(n: number): string {
  const sign = n >= 0 ? '+' : '';
  return `${sign}${n.toFixed(1)}%`;
}

function getCardYear(card: { year?: number | string; set?: string }): number {
  if (card.year) return typeof card.year === 'string' ? parseInt(card.year, 10) : card.year;
  const m = card.set?.match(/(19|20)\d{2}/);
  return m ? parseInt(m[0], 10) : 2020;
}

function isRookie(card: { rookie?: boolean; set?: string; name?: string }): boolean {
  if (card.rookie) return true;
  const s = `${card.set || ''} ${card.name || ''}`.toLowerCase();
  return s.includes('rookie') || s.includes('1st bowman') || s.includes('rated rookie');
}

function isVintage(card: { year?: number | string; set?: string }): boolean {
  return getCardYear(card) < 1980;
}

function isGraded(card: { estimatedValueRaw?: string }): boolean {
  const v = (card.estimatedValueRaw || '').toLowerCase();
  return v.includes('psa') || v.includes('bgs') || v.includes('sgc') || v.includes('cgc');
}

/* ─── scenarios ─── */
interface Scenario {
  id: string;
  name: string;
  icon: string;
  description: string;
  severity: 'extreme' | 'high' | 'moderate' | 'low';
  apply: (card: typeof sportsCards[0]) => number; // multiplier on value
}

const SCENARIOS: Scenario[] = [
  {
    id: 'market-crash',
    name: 'Market Crash',
    icon: '📉',
    description: 'Broad market downturn. Modern cards drop 30-40%, vintage holds better (-10%). Graded premium cards lose less.',
    severity: 'extreme',
    apply: (card) => {
      const yr = getCardYear(card);
      const v = parseValue(card.estimatedValueRaw || '$5');
      if (yr < 1980) return 0.90; // vintage resilient
      if (yr < 2000) return 0.80;
      if (v > 5000) return 0.72; // high-value modern hit hard
      if (isRookie(card)) return 0.65; // rookie speculation crushed
      return 0.70;
    },
  },
  {
    id: 'sport-lockout',
    name: 'Sport Lockout',
    icon: '🔒',
    description: 'Major sport league lockout. That sport drops 25-35%. Other sports surge 5-10% as collectors redirect.',
    severity: 'high',
    apply: (card) => {
      const sport = (card.sport || '').toLowerCase();
      // Randomly pick a sport to lock out — use basketball as the example
      if (sport === 'basketball') return 0.70;
      return 1.07; // other sports benefit
    },
  },
  {
    id: 'player-injury',
    name: 'Star Player Injury',
    icon: '🏥',
    description: 'A top player suffers a career-threatening injury. Their cards drop 40-60%. Teammates drop 10-15%.',
    severity: 'high',
    apply: (card) => {
      const v = parseValue(card.estimatedValueRaw || '$5');
      if (isRookie(card) && v > 200) return 0.55; // high-value rookies of stars drop most
      if (isRookie(card)) return 0.70;
      if (v > 1000) return 0.65;
      return 0.85;
    },
  },
  {
    id: 'grading-scandal',
    name: 'Grading Scandal',
    icon: '⚠️',
    description: 'Major grading company credibility crisis. Graded premiums drop 20-30%. Raw cards hold or gain 5%.',
    severity: 'high',
    apply: (card) => {
      if (isGraded(card)) return 0.72;
      return 1.05; // raw cards benefit slightly
    },
  },
  {
    id: 'rookie-bubble',
    name: 'Rookie Bubble Pop',
    icon: '💥',
    description: 'Speculative rookie market correction. Modern rookies (-40%), 2nd+ year stars (-15%), vintage unaffected.',
    severity: 'extreme',
    apply: (card) => {
      if (isVintage(card)) return 1.0;
      if (isRookie(card)) {
        const yr = getCardYear(card);
        if (yr >= 2020) return 0.55; // recent rookies crushed
        if (yr >= 2015) return 0.65;
        return 0.80;
      }
      return 0.90;
    },
  },
  {
    id: 'vintage-surge',
    name: 'Vintage Surge',
    icon: '📜',
    description: 'Flight to quality. Pre-1980 cards up 25-40%. Pre-1960 up 50%+. Modern cards flat or slightly down.',
    severity: 'moderate',
    apply: (card) => {
      const yr = getCardYear(card);
      if (yr < 1960) return 1.50;
      if (yr < 1980) return 1.30;
      if (yr < 2000) return 1.05;
      return 0.95; // modern slight dip
    },
  },
  {
    id: 'rookie-boom',
    name: 'Rookie Boom',
    icon: '🚀',
    description: 'Hot draft class + breakout season. Rookies surge 30-60%. Established stars gain 10%. Vintage flat.',
    severity: 'moderate',
    apply: (card) => {
      if (isVintage(card)) return 1.0;
      if (isRookie(card)) {
        const yr = getCardYear(card);
        if (yr >= 2022) return 1.55;
        if (yr >= 2018) return 1.30;
        return 1.10;
      }
      return 1.10;
    },
  },
  {
    id: 'seasonal-dip',
    name: 'Off-Season Dip',
    icon: '❄️',
    description: 'Typical seasonal slump. Baseball cards dip in winter (-15%), football in summer (-15%). Predictable and recoverable.',
    severity: 'low',
    apply: (card) => {
      const sport = (card.sport || '').toLowerCase();
      if (sport === 'baseball') return 0.87;
      if (sport === 'football') return 0.88;
      if (sport === 'basketball') return 0.92;
      if (sport === 'hockey') return 0.90;
      return 0.90;
    },
  },
];

const SEVERITY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  extreme: { bg: 'bg-red-950/60', text: 'text-red-400', border: 'border-red-800/50' },
  high: { bg: 'bg-orange-950/60', text: 'text-orange-400', border: 'border-orange-800/50' },
  moderate: { bg: 'bg-yellow-950/60', text: 'text-yellow-400', border: 'border-yellow-800/50' },
  low: { bg: 'bg-blue-950/60', text: 'text-blue-400', border: 'border-blue-800/50' },
};

/* ─── build a card pool for selection ─── */
type CardEntry = typeof sportsCards[0] & { _idx: number };

export default function StressTestClient() {
  const [searchTerm, setSearchTerm] = useState('');
  const [portfolio, setPortfolio] = useState<CardEntry[]>([]);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  /* Search results */
  const searchResults = useMemo(() => {
    if (searchTerm.length < 2) return [];
    const q = searchTerm.toLowerCase();
    return sportsCards
      .map((c, i) => ({ ...c, _idx: i } as CardEntry))
      .filter(c => {
        const haystack = `${c.name} ${c.player} ${c.set} ${c.sport}`.toLowerCase();
        return haystack.includes(q);
      })
      .slice(0, 12);
  }, [searchTerm]);

  /* Add card to portfolio (max 20) */
  const addCard = useCallback((card: CardEntry) => {
    setPortfolio(prev => {
      if (prev.length >= 20) return prev;
      if (prev.some(c => c._idx === card._idx)) return prev;
      return [...prev, card];
    });
    setSearchTerm('');
    setShowResults(false);
  }, []);

  /* Remove card */
  const removeCard = useCallback((idx: number) => {
    setPortfolio(prev => prev.filter(c => c._idx !== idx));
    setShowResults(false);
  }, []);

  /* Quick-fill presets */
  const fillPreset = useCallback((type: 'rookies' | 'vintage' | 'balanced' | 'high-value') => {
    const all = sportsCards.map((c, i) => ({ ...c, _idx: i } as CardEntry));
    let selected: CardEntry[] = [];
    if (type === 'rookies') {
      selected = all.filter(c => isRookie(c) && getCardYear(c) >= 2020).sort((a, b) => parseValue(b.estimatedValueRaw || '$5') - parseValue(a.estimatedValueRaw || '$5')).slice(0, 10);
    } else if (type === 'vintage') {
      selected = all.filter(c => isVintage(c)).sort((a, b) => parseValue(b.estimatedValueRaw || '$5') - parseValue(a.estimatedValueRaw || '$5')).slice(0, 10);
    } else if (type === 'balanced') {
      const rookies = all.filter(c => isRookie(c)).sort((a, b) => parseValue(b.estimatedValueRaw || '$5') - parseValue(a.estimatedValueRaw || '$5')).slice(0, 3);
      const vint = all.filter(c => isVintage(c)).sort((a, b) => parseValue(b.estimatedValueRaw || '$5') - parseValue(a.estimatedValueRaw || '$5')).slice(0, 3);
      const modern = all.filter(c => !isRookie(c) && !isVintage(c) && parseValue(c.estimatedValueRaw || '$5') > 100).sort((a, b) => parseValue(b.estimatedValueRaw || '$5') - parseValue(a.estimatedValueRaw || '$5')).slice(0, 4);
      selected = [...rookies, ...vint, ...modern];
    } else {
      selected = all.sort((a, b) => parseValue(b.estimatedValueRaw || '$5') - parseValue(a.estimatedValueRaw || '$5')).slice(0, 10);
    }
    setPortfolio(selected);
    setShowResults(false);
  }, []);

  /* Run stress test */
  const runTest = useCallback((scenarioId: string) => {
    setActiveScenario(scenarioId);
    setShowResults(true);
  }, []);

  /* Compute results */
  const results = useMemo(() => {
    if (!activeScenario || portfolio.length === 0) return null;
    const scenario = SCENARIOS.find(s => s.id === activeScenario)!;
    const totalBefore = portfolio.reduce((sum, c) => sum + parseValue(c.estimatedValueRaw || '$5'), 0);
    const cardResults = portfolio.map(card => {
      const before = parseValue(card.estimatedValueRaw || '$5');
      const multiplier = scenario.apply(card);
      const after = Math.round(before * multiplier);
      const change = after - before;
      const changePct = ((multiplier - 1) * 100);
      return { card, before, after, change, changePct, multiplier };
    });
    const totalAfter = cardResults.reduce((sum, r) => sum + r.after, 0);
    const totalChange = totalAfter - totalBefore;
    const totalChangePct = totalBefore > 0 ? ((totalAfter / totalBefore) - 1) * 100 : 0;

    // Risk score: 0 (invulnerable) to 100 (destroyed)
    const avgDrop = cardResults.reduce((sum, r) => sum + (1 - r.multiplier), 0) / cardResults.length;
    const riskScore = Math.round(Math.max(0, Math.min(100, avgDrop * 200)));

    // Resilience grade
    let grade = 'S';
    if (riskScore > 60) grade = 'F';
    else if (riskScore > 45) grade = 'D';
    else if (riskScore > 30) grade = 'C';
    else if (riskScore > 20) grade = 'B';
    else if (riskScore > 10) grade = 'A';

    // Most vulnerable and most resilient
    const sorted = [...cardResults].sort((a, b) => a.multiplier - b.multiplier);
    const mostVulnerable = sorted.slice(0, 3);
    const mostResilient = sorted.slice(-3).reverse();

    // Diversification breakdown
    const sports = new Set(portfolio.map(c => c.sport || 'Unknown'));
    const rookieCount = portfolio.filter(c => isRookie(c)).length;
    const vintageCount = portfolio.filter(c => isVintage(c)).length;
    const gradedCount = portfolio.filter(c => isGraded(c)).length;

    return {
      scenario,
      totalBefore,
      totalAfter,
      totalChange,
      totalChangePct,
      riskScore,
      grade,
      cardResults,
      mostVulnerable,
      mostResilient,
      sportsCount: sports.size,
      rookieCount,
      vintageCount,
      gradedCount,
    };
  }, [activeScenario, portfolio]);

  /* All-scenario summary */
  const allScenarioSummary = useMemo(() => {
    if (portfolio.length === 0) return [];
    const totalBefore = portfolio.reduce((sum, c) => sum + parseValue(c.estimatedValueRaw || '$5'), 0);
    return SCENARIOS.map(scenario => {
      const totalAfter = portfolio.reduce((sum, card) => {
        return sum + Math.round(parseValue(card.estimatedValueRaw || '$5') * scenario.apply(card));
      }, 0);
      const changePct = totalBefore > 0 ? ((totalAfter / totalBefore) - 1) * 100 : 0;
      return { scenario, totalAfter, changePct };
    });
  }, [portfolio]);

  const portfolioValue = portfolio.reduce((sum, c) => sum + parseValue(c.estimatedValueRaw || '$5'), 0);

  return (
    <div className="space-y-8">
      {/* ─── Portfolio Builder ─── */}
      <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-1">Build Your Portfolio</h2>
        <p className="text-gray-400 text-sm mb-4">Add up to 20 cards, or use a preset to get started.</p>

        {/* Presets */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { key: 'rookies' as const, label: 'Top Rookies', icon: '🌟' },
            { key: 'vintage' as const, label: 'Vintage Collection', icon: '📜' },
            { key: 'balanced' as const, label: 'Balanced Mix', icon: '⚖️' },
            { key: 'high-value' as const, label: 'High Value', icon: '💎' },
          ].map(p => (
            <button
              key={p.key}
              onClick={() => fillPreset(p.key)}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm text-gray-300 hover:text-white transition-colors"
            >
              {p.icon} {p.label}
            </button>
          ))}
          {portfolio.length > 0 && (
            <button
              onClick={() => { setPortfolio([]); setShowResults(false); }}
              className="px-3 py-1.5 bg-red-950/40 hover:bg-red-950/60 border border-red-800/50 rounded-lg text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search cards to add (e.g., LeBron, Jeter, Mahomes)..."
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-600 text-sm"
          />
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-20 max-h-72 overflow-y-auto">
              {searchResults.map(card => (
                <button
                  key={card._idx}
                  onClick={() => addCard(card)}
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-700 transition-colors border-b border-gray-700/50 last:border-0"
                >
                  <span className="text-white text-sm font-medium">{card.player}</span>
                  <span className="text-gray-400 text-xs ml-2">{card.name}</span>
                  <span className="text-emerald-400 text-xs ml-2 font-medium">{card.estimatedValueRaw}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Portfolio cards */}
        {portfolio.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">{portfolio.length}/20 cards &middot; Portfolio value: <span className="text-emerald-400 font-bold">{fmt(portfolioValue)}</span></span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {portfolio.map(card => (
                <div key={card._idx} className="flex items-center justify-between bg-gray-800/80 border border-gray-700/50 rounded-lg px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-white text-sm font-medium truncate">{card.player}</div>
                    <div className="text-gray-500 text-xs truncate">{card.name}</div>
                  </div>
                  <div className="flex items-center gap-2 ml-2 shrink-0">
                    <span className="text-emerald-400 text-sm font-medium">{card.estimatedValueRaw}</span>
                    <button
                      onClick={() => removeCard(card._idx)}
                      className="text-gray-600 hover:text-red-400 transition-colors text-lg leading-none"
                      aria-label="Remove card"
                    >
                      &times;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {portfolio.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-4xl mb-2">🃏</p>
            <p className="text-sm">Search for cards above or pick a preset to build your test portfolio</p>
          </div>
        )}
      </section>

      {/* ─── Scenario Selector ─── */}
      {portfolio.length > 0 && (
        <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-1">Choose a Stress Scenario</h2>
          <p className="text-gray-400 text-sm mb-4">Select a market scenario to test your portfolio against.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {SCENARIOS.map(s => {
              const colors = SEVERITY_COLORS[s.severity];
              const summary = allScenarioSummary.find(x => x.scenario.id === s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => runTest(s.id)}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    activeScenario === s.id
                      ? 'bg-emerald-950/40 border-emerald-600 ring-1 ring-emerald-600/50'
                      : 'bg-gray-800/80 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{s.icon}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} ${colors.border} border`}>
                      {s.severity}
                    </span>
                  </div>
                  <div className="text-white font-semibold text-sm mb-1">{s.name}</div>
                  <div className="text-gray-500 text-xs leading-relaxed line-clamp-2">{s.description}</div>
                  {summary && (
                    <div className={`mt-2 text-sm font-bold ${summary.changePct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {pct(summary.changePct)} ({fmt(summary.totalAfter)})
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* ─── Results ─── */}
      {showResults && results && (
        <section className="space-y-6">
          {/* Hero result */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{results.scenario.icon}</span>
              <div>
                <h2 className="text-xl font-bold text-white">{results.scenario.name} — Impact Analysis</h2>
                <p className="text-gray-400 text-sm">{results.scenario.description}</p>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-800/60 rounded-xl p-4 text-center">
                <div className="text-gray-500 text-xs mb-1">Before</div>
                <div className="text-white font-bold text-lg">{fmt(results.totalBefore)}</div>
              </div>
              <div className="bg-gray-800/60 rounded-xl p-4 text-center">
                <div className="text-gray-500 text-xs mb-1">After</div>
                <div className={`font-bold text-lg ${results.totalChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {fmt(results.totalAfter)}
                </div>
              </div>
              <div className="bg-gray-800/60 rounded-xl p-4 text-center">
                <div className="text-gray-500 text-xs mb-1">Impact</div>
                <div className={`font-bold text-lg ${results.totalChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {pct(results.totalChangePct)}
                </div>
              </div>
              <div className="bg-gray-800/60 rounded-xl p-4 text-center">
                <div className="text-gray-500 text-xs mb-1">Resilience</div>
                <div className={`font-bold text-2xl ${
                  results.grade === 'S' || results.grade === 'A' ? 'text-emerald-400' :
                  results.grade === 'B' ? 'text-yellow-400' :
                  results.grade === 'C' ? 'text-orange-400' : 'text-red-400'
                }`}>{results.grade}</div>
              </div>
            </div>

            {/* Risk gauge */}
            <div className="mb-6">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Invulnerable</span>
                <span>Risk Score: {results.riskScore}/100</span>
                <span>Devastated</span>
              </div>
              <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    results.riskScore < 20 ? 'bg-emerald-500' :
                    results.riskScore < 40 ? 'bg-yellow-500' :
                    results.riskScore < 60 ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${results.riskScore}%` }}
                />
              </div>
            </div>

            {/* Portfolio composition */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-gray-800/40 rounded-lg px-3 py-2 text-center">
                <div className="text-gray-500 text-xs">Sports</div>
                <div className="text-white font-bold">{results.sportsCount}</div>
              </div>
              <div className="bg-gray-800/40 rounded-lg px-3 py-2 text-center">
                <div className="text-gray-500 text-xs">Rookies</div>
                <div className="text-white font-bold">{results.rookieCount}/{portfolio.length}</div>
              </div>
              <div className="bg-gray-800/40 rounded-lg px-3 py-2 text-center">
                <div className="text-gray-500 text-xs">Vintage</div>
                <div className="text-white font-bold">{results.vintageCount}/{portfolio.length}</div>
              </div>
              <div className="bg-gray-800/40 rounded-lg px-3 py-2 text-center">
                <div className="text-gray-500 text-xs">Graded</div>
                <div className="text-white font-bold">{results.gradedCount}/{portfolio.length}</div>
              </div>
            </div>
          </div>

          {/* Most vulnerable / resilient */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-900 border border-red-900/50 rounded-2xl p-5">
              <h3 className="text-red-400 font-bold text-sm mb-3">Most Vulnerable</h3>
              <div className="space-y-2">
                {results.mostVulnerable.map((r, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="text-white text-sm truncate">{r.card.player}</div>
                      <div className="text-gray-500 text-xs truncate">{r.card.name}</div>
                    </div>
                    <div className="text-red-400 font-bold text-sm ml-2 shrink-0">{pct(r.changePct)}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-900 border border-emerald-900/50 rounded-2xl p-5">
              <h3 className="text-emerald-400 font-bold text-sm mb-3">Most Resilient</h3>
              <div className="space-y-2">
                {results.mostResilient.map((r, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="text-white text-sm truncate">{r.card.player}</div>
                      <div className="text-gray-500 text-xs truncate">{r.card.name}</div>
                    </div>
                    <div className={`font-bold text-sm ml-2 shrink-0 ${r.changePct >= 0 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                      {pct(r.changePct)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Per-card breakdown */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-white font-bold mb-4">Card-by-Card Impact</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left text-gray-500 font-medium py-2 pr-2">Card</th>
                    <th className="text-right text-gray-500 font-medium py-2 px-2">Before</th>
                    <th className="text-right text-gray-500 font-medium py-2 px-2">After</th>
                    <th className="text-right text-gray-500 font-medium py-2 px-2">Change</th>
                    <th className="text-right text-gray-500 font-medium py-2 pl-2">Impact</th>
                  </tr>
                </thead>
                <tbody>
                  {results.cardResults.sort((a, b) => a.changePct - b.changePct).map((r, i) => (
                    <tr key={i} className="border-b border-gray-800/50">
                      <td className="py-2 pr-2">
                        <div className="text-white font-medium truncate max-w-[180px]">{r.card.player}</div>
                        <div className="text-gray-500 text-xs truncate max-w-[180px]">{r.card.name}</div>
                      </td>
                      <td className="text-right text-gray-300 py-2 px-2">{fmt(r.before)}</td>
                      <td className={`text-right py-2 px-2 font-medium ${r.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {fmt(r.after)}
                      </td>
                      <td className={`text-right py-2 px-2 ${r.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {r.change >= 0 ? '+' : ''}{fmt(Math.abs(r.change))}
                      </td>
                      <td className="text-right py-2 pl-2">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                          r.changePct >= 5 ? 'bg-emerald-950/60 text-emerald-400' :
                          r.changePct >= -10 ? 'bg-gray-800 text-gray-400' :
                          r.changePct >= -25 ? 'bg-orange-950/60 text-orange-400' :
                          'bg-red-950/60 text-red-400'
                        }`}>
                          {pct(r.changePct)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-white font-bold mb-3">Hedging Recommendations</h3>
            <div className="space-y-3">
              {results.sportsCount < 3 && (
                <div className="flex items-start gap-3 text-sm">
                  <span className="text-yellow-400 mt-0.5">!</span>
                  <div>
                    <div className="text-white font-medium">Diversify across more sports</div>
                    <div className="text-gray-400">Your portfolio only covers {results.sportsCount} sport{results.sportsCount === 1 ? '' : 's'}. Adding cards from other sports reduces lockout and seasonal risk.</div>
                  </div>
                </div>
              )}
              {results.rookieCount / portfolio.length > 0.6 && (
                <div className="flex items-start gap-3 text-sm">
                  <span className="text-yellow-400 mt-0.5">!</span>
                  <div>
                    <div className="text-white font-medium">Heavy rookie exposure ({Math.round(results.rookieCount / portfolio.length * 100)}%)</div>
                    <div className="text-gray-400">Rookies are most volatile in downturns. Consider adding established star base cards or vintage for stability.</div>
                  </div>
                </div>
              )}
              {results.vintageCount === 0 && (
                <div className="flex items-start gap-3 text-sm">
                  <span className="text-yellow-400 mt-0.5">!</span>
                  <div>
                    <div className="text-white font-medium">No vintage cards</div>
                    <div className="text-gray-400">Pre-1980 cards are the most resilient asset class in downturns. Even 2-3 affordable vintage cards significantly improve portfolio stability.</div>
                  </div>
                </div>
              )}
              {results.vintageCount > 0 && results.sportsCount >= 3 && results.rookieCount / portfolio.length <= 0.6 && (
                <div className="flex items-start gap-3 text-sm">
                  <span className="text-emerald-400 mt-0.5">&#10003;</span>
                  <div>
                    <div className="text-white font-medium">Well-diversified portfolio</div>
                    <div className="text-gray-400">Your mix of vintage, modern, and multi-sport cards provides solid resilience across most scenarios.</div>
                  </div>
                </div>
              )}
              {results.gradedCount / portfolio.length > 0.8 && (
                <div className="flex items-start gap-3 text-sm">
                  <span className="text-yellow-400 mt-0.5">!</span>
                  <div>
                    <div className="text-white font-medium">Heavily graded ({Math.round(results.gradedCount / portfolio.length * 100)}%)</div>
                    <div className="text-gray-400">A grading company scandal would hit your portfolio hard. Keep some raw inventory as a hedge.</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* All scenarios comparison */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-white font-bold mb-4">All Scenarios at a Glance</h3>
            <div className="space-y-3">
              {allScenarioSummary.sort((a, b) => a.changePct - b.changePct).map(s => {
                const barWidth = Math.min(100, Math.abs(s.changePct) * 2);
                const isPositive = s.changePct >= 0;
                return (
                  <button
                    key={s.scenario.id}
                    onClick={() => runTest(s.scenario.id)}
                    className={`w-full text-left rounded-lg p-3 transition-colors ${
                      activeScenario === s.scenario.id ? 'bg-gray-800 ring-1 ring-emerald-600/50' : 'bg-gray-800/40 hover:bg-gray-800/70'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span>{s.scenario.icon}</span>
                        <span className="text-white text-sm font-medium">{s.scenario.name}</span>
                      </div>
                      <span className={`text-sm font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                        {pct(s.changePct)}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isPositive ? 'bg-emerald-500' : 'bg-red-500'}`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Internal links */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-white font-bold mb-3">Related Tools</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { href: '/tools/collection-report', label: 'Collection Report Card' },
                { href: '/tools/diversification', label: 'Diversification Analyzer' },
                { href: '/tools/investment-return', label: 'Investment Return Calculator' },
                { href: '/tools/portfolio-rebalancer', label: 'Portfolio Rebalancer' },
                { href: '/tools/heat-score', label: 'Collection Heat Score' },
                { href: '/tools/seasonality', label: 'Market Seasonality Guide' },
                { href: '/tools/rip-or-hold', label: 'Rip or Hold Calculator' },
              ].map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm text-gray-300 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
