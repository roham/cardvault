'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

/* ── helpers ────────────────────────────────────────────────────── */

function weekKey(): string {
  const d = new Date();
  const start = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${week}`;
}

function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function hashStr(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/* ── prospect data ──────────────────────────────────────────────── */

type Sport = 'baseball' | 'basketball' | 'football' | 'hockey';
type Risk = 'low' | 'medium' | 'high' | 'speculative';

interface Prospect {
  name: string;
  sport: Sport;
  team: string;
  position: string;
  age: number;
  keyCard: string;
  keyCardPrice: string;
  reason: string;
  risk: Risk;
  trend: 'hot' | 'warm' | 'cold' | 'steady';
  baseScore: number; // 1-100 base ranking score
  draftPedigree: string;
  recentPerformance: string;
  investmentThesis: string;
  slug?: string;
}

const PROSPECTS: Prospect[] = [
  // Baseball
  { name: 'Paul Skenes', sport: 'baseball', team: 'Pittsburgh Pirates', position: 'SP', age: 22, keyCard: '2024 Bowman Chrome 1st Auto', keyCardPrice: '$800-$2,500', reason: '#1 pick, Cy Young trajectory, 100mph sinker', risk: 'low', trend: 'hot', baseScore: 96, draftPedigree: '2023 #1 overall pick', recentPerformance: '2024: 11-3, 1.96 ERA, 170 K in 133 IP as rookie', investmentThesis: 'Generational pitching talent with ace stuff. His 2024 rookie campaign was historically dominant. Cards should appreciate as he builds toward multiple Cy Young bids.' },
  { name: 'Jackson Merrill', sport: 'baseball', team: 'San Diego Padres', position: 'CF', age: 21, keyCard: '2024 Bowman Chrome 1st Auto', keyCardPrice: '$150-$500', reason: 'NL ROY, 5-tool talent, 24 HRs as rookie', risk: 'medium', trend: 'warm', baseScore: 88, draftPedigree: '2021 1st round (27th overall)', recentPerformance: '2024 NL ROY: .292 BA, 24 HR, Gold Glove defense', investmentThesis: 'Young five-tool center fielder who won ROY and Gold Glove. His early production profile mirrors the greatest CF ever. Underpriced relative to ceiling.' },
  { name: 'Junior Caminero', sport: 'baseball', team: 'Tampa Bay Rays', position: 'SS', age: 21, keyCard: '2023 Bowman Chrome 1st Auto', keyCardPrice: '$100-$400', reason: 'Top prospect, plus bat speed, youngest in majors', risk: 'high', trend: 'warm', baseScore: 82, draftPedigree: 'International signing $300K (2021)', recentPerformance: 'Hit .280 in MLB debut. Top-10 prospect in all of baseball', investmentThesis: 'Elite bat speed and contact skills at age 20. If he becomes an everyday shortstop, 1st Bowman Chromes 10x. High risk but rare upside at this price.' },
  { name: 'Wyatt Langford', sport: 'baseball', team: 'Texas Rangers', position: 'OF', age: 23, keyCard: '2024 Bowman Chrome 1st Auto', keyCardPrice: '$50-$200', reason: 'Top-5 pick, Rangers OF, plus power and speed', risk: 'medium', trend: 'steady', baseScore: 79, draftPedigree: '2023 #4 overall pick', recentPerformance: '2024: .263 BA, 13 HR, 8 SB in half-season debut', investmentThesis: 'Former top-5 pick with 20/20 potential. Rangers have a track record of developing young hitters. Entry price is low relative to draft pedigree.' },
  { name: 'Roki Sasaki', sport: 'baseball', team: 'Los Angeles Dodgers', position: 'SP', age: 23, keyCard: '2025 Topps Series 1 RC', keyCardPrice: '$30-$150', reason: 'Japanese phenom, perfect game at 18, Dodger hype', risk: 'high', trend: 'hot', baseScore: 85, draftPedigree: 'International posting (2024)', recentPerformance: 'NPB: 2.10 ERA, 525 K in 414 IP. Perfect game in 2022. Threw 165 km/h (102.5 mph)', investmentThesis: 'Dodgers hype machine + elite stuff + already proven in NPB. If he replicates even 80% of his Japanese stats, cards explode. Injury history is the risk.' },

  // Basketball
  { name: 'Zaccharie Risacher', sport: 'basketball', team: 'Atlanta Hawks', position: 'SF', age: 19, keyCard: '2024 Prizm Draft RC Auto', keyCardPrice: '$80-$300', reason: '#1 pick, 6-9 wing, French prospect', risk: 'high', trend: 'warm', baseScore: 80, draftPedigree: '2024 #1 overall pick', recentPerformance: '2024-25 rookie: showing flashes of two-way wing potential', investmentThesis: '#1 picks historically see card price spikes by year 2-3. Even if he is not a superstar, the draft position provides a floor. Buy low during rookie struggles.' },
  { name: 'Zach Edey', sport: 'basketball', team: 'Memphis Grizzlies', position: 'C', age: 22, keyCard: '2024 Prizm Draft RC', keyCardPrice: '$20-$80', reason: '2x Naismith POY, 7-4 center, Grizzlies fit', risk: 'medium', trend: 'steady', baseScore: 76, draftPedigree: '2024 #9 overall pick', recentPerformance: '2024-25: learning curve but showing dominant moments', investmentThesis: 'Two-time college POY whose size creates matchup nightmares. If Grizzlies build around him and Ja, cards appreciate fast. Entry price is incredibly low for his pedigree.' },
  { name: 'Cooper Flagg', sport: 'basketball', team: '2025 NBA Draft', position: 'SF/PF', age: 18, keyCard: '2024 Bowman University Chrome', keyCardPrice: '$200-$800', reason: 'Projected #1 pick 2025, Duke phenom, LeBron comps', risk: 'speculative', trend: 'hot', baseScore: 92, draftPedigree: 'Projected #1 pick 2025', recentPerformance: 'Duke: dominant freshman. 18-year-old with elite two-way game. Youngest to debut for USA Basketball', investmentThesis: 'Generational talent with LeBron-level hype. Pre-draft cards are speculative but upside is massive. If he goes #1, University Chrome cards could 5-10x from current levels.' },
  { name: 'Donovan Clingan', sport: 'basketball', team: 'Portland Trail Blazers', position: 'C', age: 20, keyCard: '2024 Prizm Draft RC', keyCardPrice: '$15-$50', reason: 'Back-to-back NCAA champ, 7-2, elite rim protection', risk: 'medium', trend: 'steady', baseScore: 73, draftPedigree: '2024 #7 overall pick', recentPerformance: '2024-25 rookie: elite shot blocking, growing offensive game', investmentThesis: 'Back-to-back NCAA champion at UConn. His defensive impact is already elite. If Portland rebuilds around Scoot and Clingan, this looks like a steal at current prices.' },

  // Football
  { name: 'Caleb Williams', sport: 'football', team: 'Chicago Bears', position: 'QB', age: 23, keyCard: '2024 Prizm RC Auto', keyCardPrice: '$200-$800', reason: '#1 pick, Heisman winner, Bears franchise QB', risk: 'medium', trend: 'warm', baseScore: 89, draftPedigree: '2024 #1 overall pick', recentPerformance: '2024 rookie: 3,200+ yards, 20 TDs, showed elite mobility and arm talent', investmentThesis: 'Heisman-winning #1 pick on a team with weapons. QB cards have the highest ceiling in football. If Bears make playoffs in 2025, cards double from here.' },
  { name: 'Drake Maye', sport: 'football', team: 'New England Patriots', position: 'QB', age: 22, keyCard: '2024 Prizm RC Auto', keyCardPrice: '$60-$250', reason: '#3 pick, UNC star, big-market team', risk: 'high', trend: 'steady', baseScore: 78, draftPedigree: '2024 #3 overall pick', recentPerformance: '2024 rookie: took over as starter, showed development', investmentThesis: 'Patriots franchise QB with elite arm talent. New England is a massive market. If offensive line improves and he takes a Year 2 leap, cards could 3-5x.' },
  { name: 'Brock Bowers', sport: 'football', team: 'Las Vegas Raiders', position: 'TE', age: 22, keyCard: '2024 Prizm RC Auto', keyCardPrice: '$80-$300', reason: 'Broke Kelce rookie TE record, electric talent', risk: 'low', trend: 'hot', baseScore: 86, draftPedigree: '2024 1st round (13th overall)', recentPerformance: '2024: 112 catches, 1,194 yards — broke Travis Kelce rookie records', investmentThesis: 'Already the best tight end in football as a rookie. His 2024 production was historically unprecedented. TEs who start this hot become perennial All-Pros. Buy before Year 2 breakout pricing.' },
  { name: 'Marvin Harrison Jr.', sport: 'football', team: 'Arizona Cardinals', position: 'WR', age: 22, keyCard: '2024 Prizm RC Auto', keyCardPrice: '$100-$400', reason: '#4 pick, father is HOF WR, elite route running', risk: 'medium', trend: 'warm', baseScore: 84, draftPedigree: '2024 #4 overall pick', recentPerformance: '2024 rookie: 59 catches, 843 yards, 8 TDs', investmentThesis: 'Football royalty with a father in the HOF. MHJ has elite route running and hands. If Cardinals improve around him, his production could explode in Year 2.' },
  { name: 'Jayden Daniels', sport: 'football', team: 'Washington Commanders', position: 'QB', age: 23, keyCard: '2024 Prizm RC Auto', keyCardPrice: '$150-$500', reason: 'Heisman winner, #2 pick, dual-threat', risk: 'medium', trend: 'hot', baseScore: 90, draftPedigree: '2024 #2 overall pick', recentPerformance: '2024 rookie: Pro Bowl, led Commanders to playoffs, dual-threat dominance', investmentThesis: 'Heisman winner who immediately elevated Washington. His dual-threat ability is elite. Leading his team to the playoffs as a rookie is extremely rare. Cards have strong upside heading into Year 2.' },

  // Hockey
  { name: 'Connor Bedard', sport: 'hockey', team: 'Chicago Blackhawks', position: 'C', age: 19, keyCard: '2023-24 Upper Deck Young Guns RC', keyCardPrice: '$80-$300', reason: '#1 pick, generational scorer, Crosby-level hype', risk: 'low', trend: 'warm', baseScore: 91, draftPedigree: '2023 #1 overall pick', recentPerformance: '2024-25: point-per-game pace, elite offensive instincts', investmentThesis: 'Most hyped hockey prospect since McDavid. His offensive instincts are generational. Young Guns RC is the flagship hockey card. Price should track upward as Blackhawks improve around him.' },
  { name: 'Macklin Celebrini', sport: 'hockey', team: 'San Jose Sharks', position: 'C', age: 18, keyCard: '2024-25 Upper Deck Young Guns RC', keyCardPrice: '$40-$150', reason: '#1 pick, youngest Hobey Baker winner, franchise center', risk: 'medium', trend: 'hot', baseScore: 85, draftPedigree: '2024 #1 overall pick', recentPerformance: 'Youngest Hobey Baker winner in history. Immediate NHL impact as a teenager', investmentThesis: 'Franchise cornerstone for San Jose rebuild. Youngest Hobey Baker winner ever shows elite talent. Entry price is reasonable for a #1 pick — if Sharks improve, cards appreciate rapidly.' },
  { name: 'Logan Stankoven', sport: 'hockey', team: 'Dallas Stars', position: 'C', age: 21, keyCard: '2024-25 Upper Deck Young Guns RC', keyCardPrice: '$15-$60', reason: 'Elite skill, Stars contender, point-producing forward', risk: 'medium', trend: 'warm', baseScore: 77, draftPedigree: '2021 2nd round (47th overall)', recentPerformance: '2024-25: strong rookie season with a legitimate Cup contender', investmentThesis: 'Skilled forward producing immediately on a Cup contender. Second-round picks who stick in the NHL have massive ROI on their cards. Dallas system is perfect for his skill set.' },
];

/* ── component ──────────────────────────────────────────────────── */

const SPORT_COLORS: Record<Sport, string> = {
  baseball: 'text-red-400 bg-red-950/40 border-red-800/40',
  basketball: 'text-orange-400 bg-orange-950/40 border-orange-800/40',
  football: 'text-green-400 bg-green-950/40 border-green-800/40',
  hockey: 'text-blue-400 bg-blue-950/40 border-blue-800/40',
};

const RISK_COLORS: Record<Risk, { text: string; bg: string }> = {
  low: { text: 'text-green-400', bg: 'bg-green-950/40' },
  medium: { text: 'text-yellow-400', bg: 'bg-yellow-950/40' },
  high: { text: 'text-orange-400', bg: 'bg-orange-950/40' },
  speculative: { text: 'text-red-400', bg: 'bg-red-950/40' },
};

const TREND_ICONS: Record<string, { icon: string; color: string }> = {
  hot: { icon: '🔥', color: 'text-red-400' },
  warm: { icon: '📈', color: 'text-yellow-400' },
  steady: { icon: '➡️', color: 'text-gray-400' },
  cold: { icon: '📉', color: 'text-blue-400' },
};

export default function ProspectsClient() {
  const [sportFilter, setSportFilter] = useState<Sport | 'all'>('all');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const wk = weekKey();
  const rng = seededRng(hashStr(wk + '-prospects'));

  // Weekly shuffle: re-rank by adding small random noise to base scores
  const rankedProspects = useMemo(() => {
    return [...PROSPECTS]
      .map(p => ({
        ...p,
        weeklyScore: p.baseScore + (rng() * 8 - 4), // +/- 4 points of noise
        weeklyChange: Math.round(rng() * 6 - 3), // -3 to +3 rank change
      }))
      .sort((a, b) => b.weeklyScore - a.weeklyScore);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wk]);

  const filtered = sportFilter === 'all'
    ? rankedProspects
    : rankedProspects.filter(p => p.sport === sportFilter);

  return (
    <div>
      {/* Week indicator */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-gray-500">
          Rankings for <span className="text-white font-medium">{wk}</span>
        </div>
        <div className="text-xs text-gray-600">
          {PROSPECTS.length} prospects tracked
        </div>
      </div>

      {/* Sport filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(['all', 'baseball', 'basketball', 'football', 'hockey'] as const).map(sport => (
          <button
            key={sport}
            onClick={() => setSportFilter(sport)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors capitalize ${
              sportFilter === sport
                ? 'bg-white/10 border-white/30 text-white'
                : 'bg-gray-900/60 border-gray-800 text-gray-400 hover:text-white hover:border-gray-600'
            }`}
          >
            {sport === 'all' ? `All (${PROSPECTS.length})` : `${sport} (${PROSPECTS.filter(p => p.sport === sport).length})`}
          </button>
        ))}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-gray-900/80 border border-gray-800 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-red-400">{PROSPECTS.filter(p => p.trend === 'hot').length}</div>
          <div className="text-xs text-gray-500">Hot</div>
        </div>
        <div className="bg-gray-900/80 border border-gray-800 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-yellow-400">{PROSPECTS.filter(p => p.trend === 'warm').length}</div>
          <div className="text-xs text-gray-500">Warm</div>
        </div>
        <div className="bg-gray-900/80 border border-gray-800 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-400">{PROSPECTS.filter(p => p.risk === 'low').length}</div>
          <div className="text-xs text-gray-500">Low Risk</div>
        </div>
        <div className="bg-gray-900/80 border border-gray-800 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-orange-400">{PROSPECTS.filter(p => p.risk === 'speculative').length}</div>
          <div className="text-xs text-gray-500">Speculative</div>
        </div>
      </div>

      {/* Rankings list */}
      <div className="space-y-3">
        {filtered.map((prospect, i) => {
          const rank = rankedProspects.indexOf(prospect) + 1;
          const isExpanded = expandedIndex === i;
          const sportColor = SPORT_COLORS[prospect.sport];
          const riskColor = RISK_COLORS[prospect.risk];
          const trendInfo = TREND_ICONS[prospect.trend];

          return (
            <div key={prospect.name} className="bg-gray-900/60 border border-gray-800 rounded-xl overflow-hidden">
              {/* Main row */}
              <button
                onClick={() => setExpandedIndex(isExpanded ? null : i)}
                className="w-full text-left p-4 hover:bg-gray-800/40 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
                    <span className={`text-lg font-bold ${rank <= 3 ? 'text-yellow-400' : rank <= 10 ? 'text-white' : 'text-gray-400'}`}>
                      {rank}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-semibold">{prospect.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded border capitalize ${sportColor}`}>
                        {prospect.sport}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded ${riskColor.bg} ${riskColor.text}`}>
                        {prospect.risk} risk
                      </span>
                    </div>
                    <div className="text-sm text-gray-400 mt-0.5">
                      {prospect.team} &middot; {prospect.position} &middot; Age {prospect.age}
                    </div>
                  </div>

                  {/* Trend + Price */}
                  <div className="flex-shrink-0 text-right hidden sm:block">
                    <div className="flex items-center gap-1 justify-end">
                      <span>{trendInfo.icon}</span>
                      <span className={`text-sm font-medium ${trendInfo.color}`}>
                        {prospect.trend}
                      </span>
                      {prospect.weeklyChange !== 0 && (
                        <span className={`text-xs ml-1 ${prospect.weeklyChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {prospect.weeklyChange > 0 ? '+' : ''}{prospect.weeklyChange}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{prospect.keyCardPrice}</div>
                  </div>

                  {/* Expand chevron */}
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {/* Mobile trend */}
                <div className="flex items-center gap-2 mt-2 sm:hidden">
                  <span>{trendInfo.icon}</span>
                  <span className={`text-xs ${trendInfo.color}`}>{prospect.trend}</span>
                  <span className="text-xs text-gray-500">&middot; {prospect.keyCardPrice}</span>
                </div>
              </button>

              {/* Expanded details */}
              {isExpanded && (
                <div className="border-t border-gray-800 p-4 space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-1">Key Card</h4>
                      <p className="text-white text-sm">{prospect.keyCard}</p>
                      <p className="text-yellow-400 text-sm font-medium">{prospect.keyCardPrice}</p>
                    </div>
                    <div>
                      <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-1">Draft Pedigree</h4>
                      <p className="text-white text-sm">{prospect.draftPedigree}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-1">Recent Performance</h4>
                    <p className="text-gray-300 text-sm">{prospect.recentPerformance}</p>
                  </div>

                  <div>
                    <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-1">Why He Ranks Here</h4>
                    <p className="text-gray-300 text-sm">{prospect.reason}</p>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-1">Investment Thesis</h4>
                    <p className="text-gray-300 text-sm">{prospect.investmentThesis}</p>
                  </div>

                  {/* Score bar */}
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Composite Score</span>
                      <span className="text-white font-medium">{prospect.baseScore}/100</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          prospect.baseScore >= 90 ? 'bg-green-500' :
                          prospect.baseScore >= 80 ? 'bg-yellow-500' :
                          prospect.baseScore >= 70 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${prospect.baseScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/tools/price-history?q=${encodeURIComponent(prospect.name)}`}
                      className="text-xs px-3 py-1.5 bg-blue-950/40 border border-blue-800/40 text-blue-400 rounded-lg hover:bg-blue-900/40 transition-colors"
                    >
                      Price History
                    </Link>
                    <Link
                      href={`/tools/grading-roi?q=${encodeURIComponent(prospect.name)}`}
                      className="text-xs px-3 py-1.5 bg-green-950/40 border border-green-800/40 text-green-400 rounded-lg hover:bg-green-900/40 transition-colors"
                    >
                      Grading ROI
                    </Link>
                    <Link
                      href={`/sports?q=${encodeURIComponent(prospect.name)}`}
                      className="text-xs px-3 py-1.5 bg-purple-950/40 border border-purple-800/40 text-purple-400 rounded-lg hover:bg-purple-900/40 transition-colors"
                    >
                      View Cards
                    </Link>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <div className="mt-8 bg-gray-900/40 border border-gray-800 rounded-lg p-4">
        <p className="text-xs text-gray-500">
          <strong className="text-gray-400">Disclaimer:</strong> These rankings are for informational purposes only and do not constitute financial or investment advice.
          Card markets are volatile. Past performance does not guarantee future results. Always do your own research before buying or selling cards.
          Prices shown are estimated market ranges and may vary by condition, grading, and seller.
        </p>
      </div>
    </div>
  );
}
