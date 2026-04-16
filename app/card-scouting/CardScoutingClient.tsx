'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

/* ─── Helpers ───────────────────────────────────────────── */
function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function dateHash(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function parseValue(v: string): number {
  const m = v.match(/\$([0-9,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 5;
}

function formatMoney(n: number): string {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${Math.round(n).toLocaleString()}`;
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Verdict = 'BUY' | 'HOLD' | 'SELL' | 'WATCH';

interface ScoutingReport {
  player: string;
  sport: string;
  cards: typeof sportsCards;
  totalCards: number;
  highestValue: number;
  lowestValue: number;
  avgValue: number;
  rookieCount: number;
  setDiversity: number;
  yearSpan: [number, number];
  verdict: Verdict;
  confidence: number; // 1-5
  investmentGrade: string;
  strengths: string[];
  risks: string[];
  comparables: string[];
  thesis: string;
}

const sportColors: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  baseball: { bg: 'bg-red-900/20', border: 'border-red-700/40', text: 'text-red-400', badge: 'bg-red-900/60 text-red-300' },
  basketball: { bg: 'bg-orange-900/20', border: 'border-orange-700/40', text: 'text-orange-400', badge: 'bg-orange-900/60 text-orange-300' },
  football: { bg: 'bg-blue-900/20', border: 'border-blue-700/40', text: 'text-blue-400', badge: 'bg-blue-900/60 text-blue-300' },
  hockey: { bg: 'bg-cyan-900/20', border: 'border-cyan-700/40', text: 'text-cyan-400', badge: 'bg-cyan-900/60 text-cyan-300' },
};

const verdictMeta: Record<Verdict, { color: string; bg: string; icon: string; desc: string }> = {
  BUY: { color: 'text-green-400', bg: 'bg-green-900/40 border-green-600/50', icon: '📈', desc: 'Strong accumulation opportunity' },
  HOLD: { color: 'text-amber-400', bg: 'bg-amber-900/40 border-amber-600/50', icon: '⏸️', desc: 'Maintain current position' },
  SELL: { color: 'text-red-400', bg: 'bg-red-900/40 border-red-600/50', icon: '📉', desc: 'Consider taking profits' },
  WATCH: { color: 'text-purple-400', bg: 'bg-purple-900/40 border-purple-600/50', icon: '👁️', desc: 'Monitor for entry point' },
};

const strengthPool = [
  'Strong rookie card market with high PSA 10 premiums',
  'Multiple card sets provide entry points at various price tiers',
  'Player still in prime years with upside remaining',
  'Historic franchise adds collector demand',
  'International appeal extends beyond US market',
  'Emerging breakout star — early cards still affordable',
  'Proven track record of on-field/court/ice performance',
  'Fan favorite with strong community following',
  'Draft pedigree supports long-term value floor',
  'Cross-sport appeal for multi-category collectors',
  'Undervalued relative to comparable players',
  'Strong set representation across major brands',
];

const riskPool = [
  'Injury history could impact long-term value',
  'Overproduction era cards limit scarcity premium',
  'Player approaching career decline phase',
  'Team situation may limit individual stat production',
  'Market may have already priced in upside',
  'Limited card variety reduces collector engagement',
  'Younger players carry higher career volatility',
  'Position (pitcher/goalie/kicker) has lower card market ceiling',
  'Non-marquee market reduces resale liquidity',
  'Competition from newer prospects in same position',
  'Value concentrated in PSA 10 — raw cards lag',
  'Seasonal sport means off-season demand dips',
];

const thesisTemplates = [
  '{player} represents a {quality} investment in the {sport} card market. With {cardCount} cards across {setCount} sets spanning {yearSpan} years, there is good depth for collectors at multiple price points. The {verdict} verdict reflects {reason}.',
  'The scouting report on {player} reveals a {quality} portfolio opportunity. At an average value of {avgVal}, the entry barrier is accessible. Key to the {verdict} call: {reason}.',
  '{player} cards tell a story of {narrative}. Collectors should note the {quality} fundamentals — {cardCount} cards, {rookieCount} rookies, and values ranging from {lowVal} to {highVal}. Verdict: {verdict} based on {reason}.',
];

function generateReport(player: string, cards: typeof sportsCards, rng: () => number): ScoutingReport {
  const values = cards.map(c => parseValue(c.estimatedValueRaw));
  const highestValue = Math.max(...values);
  const lowestValue = Math.min(...values);
  const avgValue = values.reduce((a, b) => a + b, 0) / values.length;
  const rookieCount = cards.filter(c => c.rookie).length;
  const uniqueSets = new Set(cards.map(c => c.set));
  const years = cards.map(c => c.year);
  const yearSpan: [number, number] = [Math.min(...years), Math.max(...years)];
  const sport = cards[0].sport.toLowerCase();

  // Determine verdict based on data characteristics
  const valueScore = avgValue > 50 ? 3 : avgValue > 20 ? 2 : 1;
  const diversityScore = uniqueSets.size > 4 ? 3 : uniqueSets.size > 2 ? 2 : 1;
  const rookieScore = rookieCount > 2 ? 3 : rookieCount > 0 ? 2 : 1;
  const totalScore = valueScore + diversityScore + rookieScore;

  let verdict: Verdict;
  const roll = rng();
  if (totalScore >= 7) verdict = roll > 0.3 ? 'BUY' : 'HOLD';
  else if (totalScore >= 5) verdict = roll > 0.5 ? 'HOLD' : roll > 0.2 ? 'BUY' : 'WATCH';
  else if (totalScore >= 3) verdict = roll > 0.4 ? 'WATCH' : roll > 0.2 ? 'HOLD' : 'SELL';
  else verdict = roll > 0.5 ? 'SELL' : 'WATCH';

  const confidence = Math.min(5, Math.max(1, Math.round(totalScore / 2 + rng())));
  const grades = ['D', 'C', 'C+', 'B-', 'B', 'B+', 'A-', 'A', 'A+', 'S'];
  const gradeIndex = Math.min(grades.length - 1, Math.floor(totalScore * 1.1 + rng() * 2));
  const investmentGrade = grades[gradeIndex];

  // Pick strengths and risks
  const shuffledStrengths = shuffle([...strengthPool], rng);
  const shuffledRisks = shuffle([...riskPool], rng);
  const strengths = shuffledStrengths.slice(0, 3);
  const risks = shuffledRisks.slice(0, 2);

  // Find comparable players (same sport, similar card count)
  const allPlayers = new Map<string, number>();
  sportsCards.forEach(c => {
    if (c.sport.toLowerCase() === sport && c.player !== player) {
      allPlayers.set(c.player, (allPlayers.get(c.player) || 0) + 1);
    }
  });
  const playerArr = Array.from(allPlayers.entries())
    .filter(([, count]) => count >= 3)
    .sort((a, b) => Math.abs(a[1] - cards.length) - Math.abs(b[1] - cards.length));
  const comparables = shuffle(playerArr.slice(0, 10), rng).slice(0, 3).map(([name]) => name);

  // Generate thesis
  const template = thesisTemplates[Math.floor(rng() * thesisTemplates.length)];
  const quality = totalScore >= 7 ? 'strong' : totalScore >= 5 ? 'moderate' : 'speculative';
  const narrative = rookieCount > 2 ? 'a player with strong rookie card foundations'
    : uniqueSets.size > 4 ? 'broad market presence across multiple sets'
    : 'concentrated value in key releases';
  const reason = verdict === 'BUY' ? 'favorable value metrics and growth potential'
    : verdict === 'SELL' ? 'diminishing returns at current price levels'
    : verdict === 'HOLD' ? 'stable fundamentals with no catalyst for change'
    : 'uncertainty that warrants further monitoring';

  const thesis = template
    .replace('{player}', player)
    .replace('{sport}', sport)
    .replace('{quality}', quality)
    .replace('{cardCount}', String(cards.length))
    .replace('{setCount}', String(uniqueSets.size))
    .replace('{yearSpan}', String(yearSpan[1] - yearSpan[0]))
    .replace('{verdict}', verdict)
    .replace('{reason}', reason)
    .replace('{avgVal}', formatMoney(avgValue))
    .replace('{lowVal}', formatMoney(lowestValue))
    .replace('{highVal}', formatMoney(highestValue))
    .replace('{rookieCount}', String(rookieCount))
    .replace('{narrative}', narrative);

  return {
    player,
    sport,
    cards,
    totalCards: cards.length,
    highestValue,
    lowestValue,
    avgValue,
    rookieCount,
    setDiversity: uniqueSets.size,
    yearSpan,
    verdict,
    confidence,
    investmentGrade,
    strengths,
    risks,
    comparables,
    thesis,
  };
}

/* ─── Component ────────────────────────────────────────── */
export default function CardScoutingClient() {
  const [mode, setMode] = useState<'daily' | 'random'>('daily');
  const [sportFilter, setSportFilter] = useState<string>('all');
  const [report, setReport] = useState<ScoutingReport | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [shareText, setShareText] = useState('');

  // Build player pool
  const playerPool = useMemo(() => {
    const map = new Map<string, typeof sportsCards>();
    sportsCards.forEach(c => {
      const arr = map.get(c.player) || [];
      arr.push(c);
      map.set(c.player, arr);
    });
    // Only players with 3+ cards
    return Array.from(map.entries())
      .filter(([, cards]) => cards.length >= 3)
      .filter(([, cards]) => sportFilter === 'all' || cards[0].sport.toLowerCase() === sportFilter);
  }, [sportFilter]);

  const generateScout = (gameMode: 'daily' | 'random') => {
    const seed = gameMode === 'daily' ? dateHash() * 4219 : Date.now();
    const rng = seededRng(seed);
    const shuffled = shuffle(playerPool, rng);
    if (shuffled.length === 0) return;

    const [player, cards] = shuffled[0];
    const rep = generateReport(player, cards, rng);
    setReport(rep);
    setHistory(prev => {
      const updated = [player, ...prev.filter(p => p !== player)].slice(0, 10);
      return updated;
    });

    // Share text
    const vm = verdictMeta[rep.verdict];
    setShareText(
      `Card Scouting Report: ${rep.player}\n` +
      `${vm.icon} ${rep.verdict} | Grade: ${rep.investmentGrade} | Confidence: ${'★'.repeat(rep.confidence)}${'☆'.repeat(5 - rep.confidence)}\n` +
      `${rep.totalCards} cards | ${rep.rookieCount} rookies | ${formatMoney(rep.avgValue)} avg\n\n` +
      `https://cardvault-two.vercel.app/card-scouting`
    );
  };

  useEffect(() => {
    generateScout(mode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, sportFilter]);

  const colors = report ? (sportColors[report.sport] || sportColors.baseball) : sportColors.baseball;

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex rounded-lg overflow-hidden border border-gray-700">
          <button onClick={() => setMode('daily')} className={`px-4 py-2 text-sm font-medium transition-colors ${mode === 'daily' ? 'bg-amber-700 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
            Daily Scout
          </button>
          <button onClick={() => setMode('random')} className={`px-4 py-2 text-sm font-medium transition-colors ${mode === 'random' ? 'bg-amber-700 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
            Random
          </button>
        </div>
        <select value={sportFilter} onChange={e => setSportFilter(e.target.value)} className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2">
          <option value="all">All Sports</option>
          <option value="baseball">Baseball</option>
          <option value="basketball">Basketball</option>
          <option value="football">Football</option>
          <option value="hockey">Hockey</option>
        </select>
        {mode === 'random' && (
          <button onClick={() => generateScout('random')} className="px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg hover:bg-gray-700 transition-colors">
            New Scout
          </button>
        )}
      </div>

      {report && (
        <>
          {/* Player Header */}
          <div className={`rounded-xl p-5 mb-6 border ${colors.bg} ${colors.border}`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${colors.badge}`}>
                  {report.sport.charAt(0).toUpperCase() + report.sport.slice(1)}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">{report.player}</h2>
                <p className="text-gray-400 text-sm mt-1">
                  {report.totalCards} cards &middot; {report.setDiversity} sets &middot; {report.yearSpan[0]}–{report.yearSpan[1]}
                </p>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-black ${verdictMeta[report.verdict].color}`}>
                  {verdictMeta[report.verdict].icon} {report.verdict}
                </div>
                <div className="text-xs text-gray-500 mt-1">{verdictMeta[report.verdict].desc}</div>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-gray-800/60 border border-gray-700/50 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-white">{report.investmentGrade}</div>
              <div className="text-xs text-gray-500">Investment Grade</div>
            </div>
            <div className="bg-gray-800/60 border border-gray-700/50 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-amber-400">
                {'★'.repeat(report.confidence)}{'☆'.repeat(5 - report.confidence)}
              </div>
              <div className="text-xs text-gray-500">Confidence</div>
            </div>
            <div className="bg-gray-800/60 border border-gray-700/50 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-green-400">{formatMoney(report.highestValue)}</div>
              <div className="text-xs text-gray-500">Top Card Value</div>
            </div>
            <div className="bg-gray-800/60 border border-gray-700/50 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-blue-400">{formatMoney(report.avgValue)}</div>
              <div className="text-xs text-gray-500">Avg Card Value</div>
            </div>
          </div>

          {/* Verdict Box */}
          <div className={`rounded-xl p-5 mb-6 border ${verdictMeta[report.verdict].bg}`}>
            <h3 className="text-lg font-bold text-white mb-2">Investment Thesis</h3>
            <p className="text-gray-300 text-sm leading-relaxed">{report.thesis}</p>
          </div>

          {/* Strengths & Risks */}
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-800/40 border border-gray-700/40 rounded-xl p-4">
              <h3 className="text-sm font-bold text-green-400 mb-3">Strengths</h3>
              <ul className="space-y-2">
                {report.strengths.map((s, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-300">
                    <span className="text-green-500 mt-0.5 shrink-0">+</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-800/40 border border-gray-700/40 rounded-xl p-4">
              <h3 className="text-sm font-bold text-red-400 mb-3">Risks</h3>
              <ul className="space-y-2">
                {report.risks.map((r, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-300">
                    <span className="text-red-500 mt-0.5 shrink-0">!</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Card Portfolio */}
          <div className="bg-gray-800/40 border border-gray-700/40 rounded-xl p-5 mb-6">
            <h3 className="text-lg font-bold text-white mb-3">Card Portfolio ({report.totalCards})</h3>
            <div className="space-y-2">
              {report.cards.slice(0, 10).map((c, i) => (
                <Link key={i} href={`/sports/${c.slug}`} className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-gray-700/30 transition-colors group">
                  <div className="min-w-0">
                    <div className="text-sm text-white font-medium truncate group-hover:text-amber-400 transition-colors">
                      {c.name}
                    </div>
                    <div className="text-xs text-gray-500">{c.set} {c.rookie ? '· RC' : ''}</div>
                  </div>
                  <div className="text-sm text-amber-400 font-medium whitespace-nowrap">{c.estimatedValueRaw}</div>
                </Link>
              ))}
              {report.cards.length > 10 && (
                <p className="text-xs text-gray-500 text-center pt-2">+ {report.cards.length - 10} more cards</p>
              )}
            </div>
          </div>

          {/* Comparables */}
          {report.comparables.length > 0 && (
            <div className="bg-gray-800/40 border border-gray-700/40 rounded-xl p-5 mb-6">
              <h3 className="text-lg font-bold text-white mb-3">Comparable Players</h3>
              <div className="flex flex-wrap gap-2">
                {report.comparables.map((name, i) => {
                  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                  return (
                    <Link key={i} href={`/players/${slug}`} className="px-3 py-1.5 bg-gray-700/50 border border-gray-600/40 rounded-lg text-sm text-gray-300 hover:text-amber-400 hover:border-amber-600/40 transition-colors">
                      {name}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Share */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => navigator.clipboard.writeText(shareText).catch(() => {})}
              className="px-4 py-2 bg-amber-700 text-white text-sm rounded-lg hover:bg-amber-600 transition-colors"
            >
              Copy Report
            </button>
            <Link
              href={`/players/${report.player.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`}
              className="px-4 py-2 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors"
            >
              View Player Page
            </Link>
          </div>

          {/* History */}
          {history.length > 1 && (
            <div className="bg-gray-800/40 border border-gray-700/40 rounded-xl p-5 mb-6">
              <h3 className="text-sm font-bold text-gray-400 mb-2">Recent Scouts</h3>
              <div className="flex flex-wrap gap-2">
                {history.slice(1).map((p, i) => (
                  <span key={i} className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">{p}</span>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* How It Works */}
      <div className="bg-gray-800/40 border border-gray-700/40 rounded-xl p-5 mb-6">
        <h2 className="text-lg font-bold text-white mb-3">How Scouting Reports Work</h2>
        <div className="grid sm:grid-cols-2 gap-3 text-sm text-gray-300">
          <div className="flex gap-2"><span className="text-amber-400 font-bold">1.</span><span>A player is selected from 9,500+ cards in the database</span></div>
          <div className="flex gap-2"><span className="text-amber-400 font-bold">2.</span><span>Their complete card portfolio is analyzed for value, diversity, and rarity</span></div>
          <div className="flex gap-2"><span className="text-amber-400 font-bold">3.</span><span>A BUY/HOLD/SELL/WATCH verdict is generated with confidence rating</span></div>
          <div className="flex gap-2"><span className="text-amber-400 font-bold">4.</span><span>Strengths, risks, and comparable players provide full context</span></div>
        </div>
      </div>

      {/* Related Links */}
      <div className="bg-gray-800/40 border border-gray-700/40 rounded-xl p-5">
        <h2 className="text-lg font-bold text-white mb-3">Related Tools</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { href: '/tools/grading-roi', label: 'Grading ROI Calc' },
            { href: '/tools/value-projector', label: 'Value Projector' },
            { href: '/tools/investment-calc', label: 'Investment Calc' },
            { href: '/market-movers', label: 'Market Movers' },
            { href: '/power-plays', label: 'Power Plays' },
            { href: '/tools/watchlist', label: 'Price Watchlist' },
          ].map(l => (
            <Link key={l.href} href={l.href} className="text-sm text-amber-500 hover:text-amber-400 transition-colors">
              {l.label} &rarr;
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
