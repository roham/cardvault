'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

/* ─── Types ──────────────────────────────────────────────── */
interface Rookie {
  rank: number;
  name: string;
  sport: 'baseball' | 'basketball' | 'football' | 'hockey';
  team: string;
  position: string;
  draftPick: string;
  keyCard: string;
  keyCardValue: string;
  investmentRating: 'S' | 'A' | 'B' | 'C';
  ceiling: string;
  risk: 'Low' | 'Medium' | 'High';
  blurb: string;
  slug?: string;
}

/* ─── Data ───────────────────────────────────────────────── */
const ROOKIES: Rookie[] = [
  // Baseball 2025
  { rank: 1, name: 'Paul Skenes', sport: 'baseball', team: 'PIT', position: 'SP', draftPick: '2023 #1', keyCard: '2024 Topps Chrome RC', keyCardValue: '$30-$80 (PSA 10)', investmentRating: 'S', ceiling: 'Top 5 SP', risk: 'Low', blurb: 'Generational pitching talent. 100+ mph heat with a devastating splinker. Already an All-Star in his debut season. The safest pitching investment since Strasburg.', slug: 'paul-skenes' },
  { rank: 2, name: 'Jackson Merrill', sport: 'baseball', team: 'SD', position: 'CF', draftPick: '2021 #27', keyCard: '2024 Topps Chrome RC', keyCardValue: '$15-$50 (PSA 10)', investmentRating: 'A', ceiling: 'All-Star OF', risk: 'Low', blurb: 'NL ROY finalist. Switch-hit power and elite defense in center field. The Padres found their franchise centerfielder.', slug: 'jackson-merrill' },
  { rank: 3, name: 'Colton Cowser', sport: 'baseball', team: 'BAL', position: 'OF', draftPick: '2021 #5', keyCard: '2024 Topps Chrome RC', keyCardValue: '$10-$35 (PSA 10)', investmentRating: 'A', ceiling: 'Consistent OF', risk: 'Low', blurb: 'Balanced offensive profile with power and patience. The Orioles lineup is loaded and Cowser is the table-setter.', slug: 'colton-cowser' },
  { rank: 4, name: 'Junior Caminero', sport: 'baseball', team: 'TB', position: '3B', draftPick: 'IFA 2019', keyCard: '2024 Topps Chrome RC', keyCardValue: '$8-$25 (PSA 10)', investmentRating: 'A', ceiling: 'Star 3B', risk: 'Medium', blurb: 'Dominican prodigy with elite bat speed. His raw tools are top of the class but the Rays will manage his development carefully.', slug: 'junior-caminero' },
  { rank: 5, name: 'Wyatt Langford', sport: 'baseball', team: 'TEX', position: 'OF', draftPick: '2023 #4', keyCard: '2024 Topps Chrome RC', keyCardValue: '$8-$25 (PSA 10)', investmentRating: 'B', ceiling: 'Solid OF', risk: 'Medium', blurb: 'Texas Rangers invested big and Langford delivered power and speed in his debut. Room to grow in a potent lineup.' },
  // Basketball 2024-25
  { rank: 6, name: 'Zaccharie Risacher', sport: 'basketball', team: 'ATL', position: 'SF', draftPick: '2024 #1', keyCard: '2024-25 Prizm RC', keyCardValue: '$20-$60 (PSA 10)', investmentRating: 'A', ceiling: 'Star Wing', risk: 'Medium', blurb: 'French wing with NBA-ready shooting touch and defensive versatility. The #1 pick carries premium but Risacher has the tools to justify it.' },
  { rank: 7, name: 'Alex Sarr', sport: 'basketball', team: 'WAS', position: 'C', draftPick: '2024 #2', keyCard: '2024-25 Prizm RC', keyCardValue: '$15-$45 (PSA 10)', investmentRating: 'A', ceiling: 'Elite Rim Protector', risk: 'Medium', blurb: 'The Wizards franchise cornerstone. 7-1 with guard-like agility and elite shot-blocking. Development timeline is the only question.' },
  { rank: 8, name: 'Reed Sheppard', sport: 'basketball', team: 'HOU', position: 'SG', draftPick: '2024 #3', keyCard: '2024-25 Prizm RC', keyCardValue: '$12-$40 (PSA 10)', investmentRating: 'A', ceiling: 'Elite Shooter', risk: 'Low', blurb: 'Kentucky product with the purest shooting stroke in the draft. Houston loaded roster means playing time is earned, but the talent is undeniable.' },
  { rank: 9, name: 'Stephon Castle', sport: 'basketball', team: 'SA', position: 'PG', draftPick: '2024 #4', keyCard: '2024-25 Prizm RC', keyCardValue: '$10-$30 (PSA 10)', investmentRating: 'B', ceiling: 'Starter PG', risk: 'Medium', blurb: 'UConn champion with size and defensive prowess at the guard spot. Learning next to Wemby is the ultimate development lab.' },
  { rank: 10, name: 'Dalton Knecht', sport: 'basketball', team: 'LAL', position: 'SG', draftPick: '2024 #17', keyCard: '2024-25 Prizm RC', keyCardValue: '$8-$25 (PSA 10)', investmentRating: 'B', ceiling: 'Starting Wing', risk: 'Low', blurb: 'Lakers brand premium is real. Knecht scoring ability from Tennessee translates immediately. Best value pick in the class.' },
  // Football 2025
  { rank: 11, name: 'Travis Hunter', sport: 'football', team: 'TBD (2025 Draft)', position: 'CB/WR', draftPick: 'Proj. Top 3', keyCard: '2025 Prizm RC', keyCardValue: '$20-$80 (PSA 10)', investmentRating: 'S', ceiling: 'Generational', risk: 'Low', blurb: 'Two-way phenom. Heisman winner who plays both cornerback and wide receiver at an elite level. There is no comparison in modern football.' },
  { rank: 12, name: 'Shedeur Sanders', sport: 'football', team: 'TBD (2025 Draft)', position: 'QB', draftPick: 'Proj. Top 5', keyCard: '2025 Prizm RC', keyCardValue: '$15-$60 (PSA 10)', investmentRating: 'A', ceiling: 'Franchise QB', risk: 'Medium', blurb: 'Deion son has NFL arm talent and pedigree. The celebrity factor drives card demand beyond pure football metrics.' },
  { rank: 13, name: 'Cam Ward', sport: 'football', team: 'TBD (2025 Draft)', position: 'QB', draftPick: 'Proj. Top 5', keyCard: '2025 Prizm RC', keyCardValue: '$12-$50 (PSA 10)', investmentRating: 'A', ceiling: 'Starting QB', risk: 'Medium', blurb: 'Miami gunslinger with elite arm talent and playmaking ability. Transfer portal success story. QBs always command premium prices.' },
  { rank: 14, name: 'Abdul Carter', sport: 'football', team: 'TBD (2025 Draft)', position: 'EDGE', draftPick: 'Proj. Top 5', keyCard: '2025 Prizm RC', keyCardValue: '$8-$30 (PSA 10)', investmentRating: 'B', ceiling: 'All-Pro EDGE', risk: 'Low', blurb: 'Penn State pass rusher with elite athleticism. Defensive players are undervalued in the hobby — smart money buys here.' },
  { rank: 15, name: 'Tetairoa McMillan', sport: 'football', team: 'TBD (2025 Draft)', position: 'WR', draftPick: 'Proj. Top 10', keyCard: '2025 Prizm RC', keyCardValue: '$10-$40 (PSA 10)', investmentRating: 'A', ceiling: 'WR1', risk: 'Low', blurb: 'Arizona 6-5 receiver with elite contested-catch ability. Size, route-running, and hands make him the most complete WR prospect since Ja\'Marr Chase.' },
  // Hockey 2024-25
  { rank: 16, name: 'Macklin Celebrini', sport: 'hockey', team: 'SJS', position: 'C', draftPick: '2024 #1', keyCard: '2024-25 UD Young Guns RC', keyCardValue: '$30-$100 (PSA 10)', investmentRating: 'S', ceiling: 'Franchise C', risk: 'Low', blurb: 'The consensus #1 pick brings generational skating and scoring ability. San Jose franchise cornerstone. The safest hockey rookie investment available.' },
  { rank: 17, name: 'Ivan Demidov', sport: 'hockey', team: 'MTL', position: 'RW', draftPick: '2024 #5', keyCard: '2024-25 UD Young Guns RC', keyCardValue: '$15-$50 (PSA 10)', investmentRating: 'A', ceiling: 'Elite Scorer', risk: 'Medium', blurb: 'Russian sniper with KHL experience at 18. Montreal needs a franchise scorer, and Demidov has the talent. Russia-to-NHL transition is the only risk.' },
  { rank: 18, name: 'Artyom Levshunov', sport: 'hockey', team: 'CHI', position: 'D', draftPick: '2024 #2', keyCard: '2024-25 UD Young Guns RC', keyCardValue: '$12-$40 (PSA 10)', investmentRating: 'A', ceiling: 'Top-Pair D', risk: 'Low', blurb: 'Belarusian blueliner with NHL size and skating. Chicago rebuilding around him and Bedard. Defensemen take longer to develop but the ceiling is massive.' },
  { rank: 19, name: 'Cayden Lindstrom', sport: 'hockey', team: 'CBJ', position: 'C', draftPick: '2024 #4', keyCard: '2024-25 UD Young Guns RC', keyCardValue: '$10-$30 (PSA 10)', investmentRating: 'B', ceiling: 'Power C', risk: 'Medium', blurb: 'WHL power center with elite size and shot. Columbus is building a young core and Lindstrom is the centerpiece of their forward group.' },
  { rank: 20, name: 'Zeev Buium', sport: 'hockey', team: 'MIN', position: 'D', draftPick: '2024 #12', keyCard: '2024-25 UD CHL RC', keyCardValue: '$5-$20 (PSA 10)', investmentRating: 'B', ceiling: 'PP Quarterback', risk: 'Low', blurb: 'Offensive defenseman with elite skating from Denver/BU. The Wild need a puck-moving D-man and Buium fits perfectly. Great value at his current prices.' },
];

const RATING_COLORS: Record<string, string> = {
  S: 'text-yellow-400 bg-yellow-950/40 border-yellow-800/40',
  A: 'text-purple-400 bg-purple-950/40 border-purple-800/40',
  B: 'text-blue-400 bg-blue-950/40 border-blue-800/40',
  C: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40',
};

const RISK_COLORS: Record<string, string> = {
  Low: 'text-emerald-400',
  Medium: 'text-amber-400',
  High: 'text-red-400',
};

const SPORT_ICONS: Record<string, string> = {
  baseball: '⚾', basketball: '🏀', football: '🏈', hockey: '🏒',
};

export default function RookieRankingsClient() {
  const [sportFilter, setSportFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'rank' | 'value' | 'risk'>('rank');

  const filtered = useMemo(() => {
    let result = [...ROOKIES];
    if (sportFilter !== 'all') result = result.filter(r => r.sport === sportFilter);
    if (ratingFilter !== 'all') result = result.filter(r => r.investmentRating === ratingFilter);
    if (sortBy === 'risk') result.sort((a, b) => {
      const order = { Low: 0, Medium: 1, High: 2 };
      return order[a.risk] - order[b.risk];
    });
    return result;
  }, [sportFilter, ratingFilter, sortBy]);

  const sportCounts = {
    baseball: ROOKIES.filter(r => r.sport === 'baseball').length,
    basketball: ROOKIES.filter(r => r.sport === 'basketball').length,
    football: ROOKIES.filter(r => r.sport === 'football').length,
    hockey: ROOKIES.filter(r => r.sport === 'hockey').length,
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['all', 'baseball', 'basketball', 'football', 'hockey'].map(s => (
          <button key={s} onClick={() => setSportFilter(s)} className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${sportFilter === s ? 'bg-amber-900/40 border-amber-700/50 text-amber-300' : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'}`}>
            {s === 'all' ? `All (${ROOKIES.length})` : `${SPORT_ICONS[s]} ${s.charAt(0).toUpperCase() + s.slice(1)} (${sportCounts[s as keyof typeof sportCounts]})`}
          </button>
        ))}
        <div className="ml-auto flex gap-1.5">
          {['S', 'A', 'B', 'C'].map(r => (
            <button key={r} onClick={() => setRatingFilter(ratingFilter === r ? 'all' : r)} className={`text-xs px-2.5 py-1.5 rounded-lg border font-bold transition-colors ${ratingFilter === r ? RATING_COLORS[r] : 'bg-slate-800/60 border-slate-700 text-slate-500 hover:text-white'}`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div className="flex gap-2 text-xs">
        <span className="text-slate-500">Sort:</span>
        {[
          { key: 'rank' as const, label: 'Rank' },
          { key: 'risk' as const, label: 'Lowest Risk' },
        ].map(s => (
          <button key={s.key} onClick={() => setSortBy(s.key)} className={`px-2 py-0.5 rounded ${sortBy === s.key ? 'text-amber-400 underline' : 'text-slate-500 hover:text-white'}`}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Rankings */}
      <div className="space-y-3">
        {filtered.map(rookie => (
          <div key={rookie.rank} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 hover:border-amber-800/40 transition-colors">
            <div className="flex items-start gap-4">
              {/* Rank badge */}
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center">
                <span className="text-white font-bold text-sm">#{rookie.rank}</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-lg">{SPORT_ICONS[rookie.sport]}</span>
                  {rookie.slug ? (
                    <Link href={`/players/${rookie.slug}`} className="text-white font-bold text-base hover:text-amber-400 transition-colors">
                      {rookie.name}
                    </Link>
                  ) : (
                    <span className="text-white font-bold text-base">{rookie.name}</span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-bold ${RATING_COLORS[rookie.investmentRating]}`}>
                    {rookie.investmentRating}
                  </span>
                  <span className="text-slate-500 text-xs">{rookie.team} &middot; {rookie.position}</span>
                </div>

                <p className="text-slate-400 text-sm mb-2">{rookie.blurb}</p>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                  <span className="text-slate-500">Draft: <span className="text-white">{rookie.draftPick}</span></span>
                  <span className="text-slate-500">Key Card: <span className="text-white">{rookie.keyCard}</span></span>
                  <span className="text-slate-500">Value: <span className="text-amber-400 font-medium">{rookie.keyCardValue}</span></span>
                  <span className="text-slate-500">Ceiling: <span className="text-white">{rookie.ceiling}</span></span>
                  <span className="text-slate-500">Risk: <span className={`font-medium ${RISK_COLORS[rookie.risk]}`}>{rookie.risk}</span></span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-8 text-center">
          <div className="text-4xl mb-3">🌟</div>
          <h3 className="text-white font-bold text-lg mb-2">No Rookies Match</h3>
          <p className="text-slate-400 text-sm">Try adjusting your filters.</p>
        </div>
      )}
    </div>
  );
}
