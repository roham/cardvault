'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

type Sport = 'baseball' | 'basketball' | 'football' | 'hockey';

interface Prospect {
  name: string;
  sport: Sport;
  position: string;
  age: number;
  team: string;
  rank: number;
  eta: string; // when they'll arrive in the major league
  keyCard: string;
  keyCardValue: string;
  ceiling: 'Generational' | 'Star' | 'Starter' | 'Role Player';
  hype: number; // 1-10
  risk: 'Low' | 'Medium' | 'High';
  notes: string;
  cardSlug?: string;
}

const PROSPECTS: Prospect[] = [
  // Baseball
  { name: 'Jackson Holliday', sport: 'baseball', position: 'SS/2B', age: 21, team: 'Baltimore Orioles', rank: 1, eta: '2024 (arrived)', keyCard: '2022 Bowman Chrome 1st', keyCardValue: '$200-$800 (PSA 10)', ceiling: 'Star', hype: 9, risk: 'Medium', notes: '#1 overall pick (2022). Struggled in initial callup but immense talent. Elite bat speed and plate discipline. Son of Matt Holliday.' },
  { name: 'Paul Skenes', sport: 'baseball', position: 'SP', age: 22, team: 'Pittsburgh Pirates', rank: 2, eta: '2024 (arrived)', keyCard: '2023 Bowman Chrome 1st', keyCardValue: '$150-$500 (PSA 10)', ceiling: 'Star', hype: 10, risk: 'Low', notes: 'NL ROY 2024. Triple-digit fastball with a splinker that baffles hitters. LSU product. Already an All-Star in his rookie season.' },
  { name: 'Roman Anthony', sport: 'baseball', position: 'OF', age: 20, team: 'Boston Red Sox', rank: 3, eta: '2025', keyCard: '2023 Bowman Chrome 1st', keyCardValue: '$100-$400 (PSA 10)', ceiling: 'Star', hype: 8, risk: 'Medium', notes: 'Switch-hitting OF with plus power and patience. Compared to Bryce Harper for his offensive ceiling. Fast-tracked through the minors.' },
  { name: 'Travis Bazzana', sport: 'baseball', position: '2B', age: 22, team: 'Cleveland Guardians', rank: 4, eta: '2025-2026', keyCard: '2024 Bowman Chrome 1st', keyCardValue: '$80-$250 (PSA 10)', ceiling: 'Star', hype: 7, risk: 'Medium', notes: '#1 overall pick (2024). Australian-born Oregon State product. Elite hit tool with power. First Australian #1 pick in MLB Draft history.' },
  { name: 'Roki Sasaki', sport: 'baseball', position: 'SP', age: 23, team: 'Los Angeles Dodgers', rank: 5, eta: '2025 (arrived)', keyCard: '2025 Topps Chrome', keyCardValue: '$100-$500 (PSA 10)', ceiling: 'Generational', hype: 10, risk: 'Medium', notes: 'Japanese phenom who threw a perfect game in NPB at 20. Triple-digit fastball. Signed with the Dodgers as an international FA. Global card market frenzy.' },
  // Basketball
  { name: 'Cooper Flagg', sport: 'basketball', position: 'SF/PF', age: 18, team: '2025 Draft (#1)', rank: 1, eta: '2025 Draft', keyCard: '2025 Bowman University 1st', keyCardValue: '$200-$800 (PSA 10)', ceiling: 'Generational', hype: 10, risk: 'Low', notes: 'Projected #1 pick. Duke freshman who dominated the ACC. Versatile 6-9 two-way player compared to a young LeBron for his passing and defensive instincts.' },
  { name: 'Ace Bailey', sport: 'basketball', position: 'SF', age: 19, team: '2025 Draft (Top 3)', rank: 2, eta: '2025 Draft', keyCard: '2025 Bowman University 1st', keyCardValue: '$80-$300 (PSA 10)', ceiling: 'Star', hype: 8, risk: 'Medium', notes: 'Rutgers freshman with Kevin Durant comparisons. 6-9 wing with elite scoring ability. Could go as high as #2 in the 2025 Draft.' },
  { name: 'Dylan Harper', sport: 'basketball', position: 'PG/SG', age: 19, team: '2025 Draft (Top 5)', rank: 3, eta: '2025 Draft', keyCard: '2025 Bowman University 1st', keyCardValue: '$60-$200 (PSA 10)', ceiling: 'Star', hype: 7, risk: 'Medium', notes: 'Rutgers guard, son of Ron Harper. Physical combo guard with elite finishing ability. The Flagg-Bailey-Harper draft class is considered elite.' },
  { name: 'Reed Sheppard', sport: 'basketball', position: 'SG', age: 20, team: 'Houston Rockets', rank: 4, eta: '2024 (arrived)', keyCard: '2024 Panini Prizm RC', keyCardValue: '$50-$200 (PSA 10)', ceiling: 'Star', hype: 8, risk: 'Low', notes: 'Kentucky product taken #3 in 2024. Elite shooter and playmaker. Already showing NBA-ready skills for the Rockets. Son of Jeff Sheppard.' },
  // Football
  { name: 'Shedeur Sanders', sport: 'football', position: 'QB', age: 22, team: '2025 Draft (1st Round)', rank: 1, eta: '2025 Draft', keyCard: '2025 Panini Prizm Draft', keyCardValue: '$100-$400 (PSA 10)', ceiling: 'Star', hype: 9, risk: 'Medium', notes: 'Colorado QB, son of Deion Sanders. Elite accuracy and pocket presence. Pre-draft cards already commanding premiums due to the Sanders brand name.' },
  { name: 'Travis Hunter', sport: 'football', position: 'WR/CB', age: 22, team: '2025 Draft (Top 5)', rank: 2, eta: '2025 Draft', keyCard: '2025 Panini Prizm Draft', keyCardValue: '$100-$500 (PSA 10)', ceiling: 'Generational', hype: 10, risk: 'Low', notes: 'Heisman Trophy winner. Two-way player (WR + CB) — the first since Champ Bailey to play both ways at an elite level. His card market is red-hot.' },
  { name: 'Abdul Carter', sport: 'football', position: 'EDGE', age: 21, team: '2025 Draft (Top 5)', rank: 3, eta: '2025 Draft', keyCard: '2025 Bowman University', keyCardValue: '$40-$150 (PSA 10)', ceiling: 'Star', hype: 7, risk: 'Low', notes: 'Penn State EDGE rusher. Projected top-5 pick. Explosive first step and bend. Defensive players have limited card markets but elite ones command respect.' },
  // Hockey
  { name: 'Macklin Celebrini', sport: 'hockey', position: 'C', age: 18, team: 'San Jose Sharks', rank: 1, eta: '2024 (arrived)', keyCard: '2024-25 Upper Deck YG', keyCardValue: '$100-$400 (PSA 10)', ceiling: 'Generational', hype: 10, risk: 'Low', notes: '#1 overall pick (2024). Already showing elite skills in the NHL as an 18-year-old. The next franchise player for San Jose. Calder Trophy favorite.' },
  { name: 'Ivan Demidov', sport: 'hockey', position: 'RW', age: 19, team: 'Montreal Canadiens', rank: 2, eta: '2025-2026', keyCard: '2024-25 Upper Deck YG', keyCardValue: '$50-$200 (PSA 10)', ceiling: 'Star', hype: 8, risk: 'High', notes: '5th overall pick (2024). Russian winger with elite offensive instincts. Still in the KHL — the risk is the Russia factor and timeline to NHL arrival.' },
  { name: 'Artyom Levshunov', sport: 'hockey', position: 'D', age: 19, team: 'Chicago Blackhawks', rank: 3, eta: '2025', keyCard: '2024-25 Upper Deck YG', keyCardValue: '$30-$120 (PSA 10)', ceiling: 'Star', hype: 7, risk: 'Low', notes: '#2 overall pick (2024). Michigan State product. Physical, mobile defenseman who can run a power play. Blackhawks building around him and Bedard.' },
];

const SPORT_COLORS: Record<Sport, string> = {
  baseball: 'bg-red-950/40 border-red-800/50 text-red-400',
  basketball: 'bg-orange-950/40 border-orange-800/50 text-orange-400',
  football: 'bg-green-950/40 border-green-800/50 text-green-400',
  hockey: 'bg-blue-950/40 border-blue-800/50 text-blue-400',
};

const CEILING_COLORS: Record<string, string> = {
  'Generational': 'bg-amber-900/60 text-amber-300',
  'Star': 'bg-purple-900/60 text-purple-300',
  'Starter': 'bg-blue-900/60 text-blue-300',
  'Role Player': 'bg-gray-800/60 text-gray-400',
};

const RISK_COLORS: Record<string, string> = {
  'Low': 'text-emerald-400',
  'Medium': 'text-yellow-400',
  'High': 'text-red-400',
};

export default function ProspectTracker() {
  const [sportFilter, setSportFilter] = useState<Sport | 'all'>('all');
  const [sortBy, setSortBy] = useState<'rank' | 'hype' | 'value'>('rank');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const filtered = useMemo(() => {
    let list = sportFilter === 'all' ? PROSPECTS : PROSPECTS.filter(p => p.sport === sportFilter);
    if (sortBy === 'hype') list = [...list].sort((a, b) => b.hype - a.hype);
    else if (sortBy === 'value') {
      list = [...list].sort((a, b) => {
        const aVal = parseInt(a.keyCardValue.replace(/[^0-9]/g, ''));
        const bVal = parseInt(b.keyCardValue.replace(/[^0-9]/g, ''));
        return bVal - aVal;
      });
    }
    return list;
  }, [sportFilter, sortBy]);

  const sportCounts = useMemo(() => {
    const counts: Record<string, number> = { all: PROSPECTS.length };
    for (const p of PROSPECTS) counts[p.sport] = (counts[p.sport] || 0) + 1;
    return counts;
  }, []);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {(['all', 'baseball', 'basketball', 'football', 'hockey'] as const).map(s => (
          <button
            key={s}
            onClick={() => setSportFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
              sportFilter === s
                ? 'bg-emerald-600 border-emerald-500 text-white'
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'
            }`}
          >
            {s === 'all' ? 'All Sports' : s.charAt(0).toUpperCase() + s.slice(1)} ({sportCounts[s] || 0})
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <span>Sort by:</span>
        {(['rank', 'hype', 'value'] as const).map(s => (
          <button
            key={s}
            onClick={() => setSortBy(s)}
            className={`px-3 py-1 rounded text-xs font-medium ${
              sortBy === s ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {s === 'rank' ? 'Rank' : s === 'hype' ? 'Hype Level' : 'Card Value'}
          </button>
        ))}
      </div>

      {/* Prospect Cards */}
      <div className="space-y-3">
        {filtered.map((prospect, i) => (
          <div
            key={prospect.name}
            className={`border rounded-xl overflow-hidden transition-colors ${SPORT_COLORS[prospect.sport]}`}
          >
            <button
              onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
              className="w-full text-left p-4 sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-bold text-gray-500">#{prospect.rank}</span>
                    <span className="text-white font-semibold">{prospect.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CEILING_COLORS[prospect.ceiling]}`}>
                      {prospect.ceiling}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>{prospect.position}</span>
                    <span>{prospect.team}</span>
                    <span>Age {prospect.age}</span>
                    <span>ETA: {prospect.eta}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs text-gray-500 mb-0.5">Hype</div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 10 }).map((_, j) => (
                      <div
                        key={j}
                        className={`w-2 h-4 rounded-sm ${j < prospect.hype ? 'bg-emerald-500' : 'bg-gray-700'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </button>

            {expandedIndex === i && (
              <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0 border-t border-gray-800/50">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Key Card</div>
                    <div className="text-sm text-white">{prospect.keyCard}</div>
                    <div className="text-sm font-semibold text-emerald-400">{prospect.keyCardValue}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Risk Level</div>
                    <div className={`text-sm font-semibold ${RISK_COLORS[prospect.risk]}`}>{prospect.risk}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Ceiling</div>
                    <div className="text-sm text-white">{prospect.ceiling}</div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-xs text-gray-500 mb-1">Scouting Notes</div>
                  <p className="text-sm text-gray-300">{prospect.notes}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-3">Ceiling Tiers Explained</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(CEILING_COLORS).map(([tier, color]) => (
            <div key={tier} className={`p-2 rounded-lg text-center text-xs font-medium ${color}`}>
              {tier}
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3">
          <strong>Generational:</strong> Franchise-altering talent (once per decade). <strong>Star:</strong> Multi-time All-Star ceiling.
          <strong> Starter:</strong> Solid starter, limited upside. <strong>Role Player:</strong> Depth piece.
        </p>
      </div>

      {/* Related Tools */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-3">Related Tools</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/tools/draft-predictor', label: '2025 Draft Predictor' },
            { href: '/tools/rarity-score', label: 'Rarity Score Calculator' },
            { href: '/tools/investment-calc', label: 'Investment Calculator' },
            { href: '/tools/pack-sim', label: 'Pack Simulator' },
          ].map(t => (
            <Link key={t.href} href={t.href} className="px-3 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm text-gray-300 hover:text-white transition-colors text-center">
              {t.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
