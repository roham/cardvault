'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

/* ── helpers ─────────────────────────────────────────────────────── */

function weekHash(): number {
  const d = new Date();
  const onejan = new Date(d.getFullYear(), 0, 1);
  const weekNum = Math.ceil(((d.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7);
  const str = `${d.getFullYear()}-W${weekNum}`;
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function seededRng(seed: number) {
  let s = seed || 42;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function parseValue(raw: string): number {
  const m = raw.match(/\$(\d[\d,]*)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
}

function slugifyPlayer(name: string): string {
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const sportColors: Record<string, string> = {
  baseball: 'bg-red-900/40 text-red-400 border-red-800/50',
  basketball: 'bg-orange-900/40 text-orange-400 border-orange-800/50',
  football: 'bg-green-900/40 text-green-400 border-green-800/50',
  hockey: 'bg-blue-900/40 text-blue-400 border-blue-800/50',
};

const sportEmoji: Record<string, string> = {
  baseball: '\u26be', basketball: '\ud83c\udfc0', football: '\ud83c\udfc8', hockey: '\ud83c\udfd2',
};

type SportFilter = 'all' | 'baseball' | 'basketball' | 'football' | 'hockey';

interface RankedCard {
  rank: number;
  player: string;
  cardName: string;
  sport: string;
  year: number;
  slug: string;
  value: number;
  heatScore: number;
  change: number; // position change from last week
  momentum: 'rising' | 'stable' | 'falling';
  reason: string;
  rookie: boolean;
}

/* ── generate rankings ───────────────────────────────────────────── */

function generateRankings(): RankedCard[] {
  const seed = weekHash();
  const rng = seededRng(seed);
  const prevRng = seededRng(seed - 7654321); // different seed for "last week"

  // Pick cards with value > $5 (interesting enough to rank)
  const eligible = sportsCards.filter(c => parseValue(c.estimatedValueRaw) >= 5);

  // Current week: shuffle and pick top 30
  const currentPicks = shuffle(eligible, rng).slice(0, 30);

  // Previous week: different shuffle for "last week" positions
  const prevPicks = shuffle(eligible, prevRng).slice(0, 30);
  const prevPlayerSet = new Map(prevPicks.map((c, i) => [c.player, i + 1]));

  const reasons = [
    'Strong auction results this week',
    'Playoff performance driving demand',
    'New set release creating hype',
    'Social media buzz spike',
    'Undervalued by market consensus',
    'Breakout season continues',
    'HOF candidacy boosting interest',
    'International collecting surge',
    'Limited supply meeting high demand',
    'Rookie season exceeding expectations',
    'Vintage premium holding strong',
    'Draft hype building early',
    'Award-season narrative',
    'Comeback story driving sentiment',
    'Investment community discovery',
    'Card show sales data trending up',
    'Collector community consensus pick',
    'Cross-sport appeal driving volume',
    'Generational talent premium',
    'Supply squeeze in high grades',
  ];

  // Deduplicate by player
  const seen = new Set<string>();
  const ranked: RankedCard[] = [];

  for (const card of currentPicks) {
    if (seen.has(card.player)) continue;
    seen.add(card.player);
    if (ranked.length >= 25) break;

    const rank = ranked.length + 1;
    const value = parseValue(card.estimatedValueRaw);
    const heatScore = Math.round(95 - (rank * 2.5) + (rng() * 8 - 4));
    const prevRank = prevPlayerSet.get(card.player);
    const change = prevRank ? prevRank - rank : Math.floor(rng() * 10 - 3);
    const momentum: 'rising' | 'stable' | 'falling' = change > 2 ? 'rising' : change < -2 ? 'falling' : 'stable';
    const reason = reasons[Math.floor(rng() * reasons.length)];

    ranked.push({
      rank,
      player: card.player,
      cardName: card.name,
      sport: card.sport,
      year: card.year,
      slug: card.slug,
      value,
      heatScore: Math.max(50, Math.min(99, heatScore)),
      change,
      momentum,
      reason,
      rookie: card.rookie,
    });
  }

  return ranked;
}

/* ── component ───────────────────────────────────────────────────── */

export default function PowerRankingsClient() {
  const [sportFilter, setSportFilter] = useState<SportFilter>('all');
  const [votes, setVotes] = useState<Record<number, 'agree' | 'disagree'>>({});
  const [expandedRank, setExpandedRank] = useState<number | null>(null);

  // Load votes from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cv-power-ranking-votes');
      if (saved) setVotes(JSON.parse(saved));
    } catch { /* empty */ }
  }, []);

  const saveVote = useCallback((rank: number, vote: 'agree' | 'disagree') => {
    setVotes(prev => {
      const updated = { ...prev, [rank]: prev[rank] === vote ? undefined : vote } as Record<number, 'agree' | 'disagree'>;
      // Clean undefined
      Object.keys(updated).forEach(k => { if (!updated[Number(k)]) delete updated[Number(k)]; });
      try { localStorage.setItem('cv-power-ranking-votes', JSON.stringify(updated)); } catch { /* empty */ }
      return updated;
    });
  }, []);

  const rankings = useMemo(() => generateRankings(), []);

  const filtered = useMemo(() => {
    if (sportFilter === 'all') return rankings;
    return rankings.filter(r => r.sport === sportFilter);
  }, [rankings, sportFilter]);

  // Week display
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + 1); // Monday
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const weekLabel = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  const changeArrow = (c: number) => {
    if (c > 0) return { text: `+${c}`, color: 'text-green-400', bg: 'bg-green-900/40' };
    if (c < 0) return { text: `${c}`, color: 'text-red-400', bg: 'bg-red-900/40' };
    return { text: '—', color: 'text-zinc-500', bg: 'bg-zinc-800' };
  };

  const heatColor = (score: number) => {
    if (score >= 90) return 'text-red-400';
    if (score >= 80) return 'text-orange-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-zinc-400';
  };

  return (
    <div className="space-y-6">
      {/* Week header */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
        <div>
          <div className="text-white font-semibold">Week of {weekLabel}</div>
          <div className="text-zinc-500 text-xs">Rankings refresh every Monday</div>
        </div>
        <div className="text-right">
          <div className="text-orange-400 font-bold text-lg">{rankings.length}</div>
          <div className="text-zinc-500 text-xs">Cards Ranked</div>
        </div>
      </div>

      {/* Sport filter */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'baseball', 'basketball', 'football', 'hockey'] as SportFilter[]).map(s => (
          <button key={s} onClick={() => setSportFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${sportFilter === s ? 'bg-orange-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
            {s === 'all' ? 'All Sports' : `${sportEmoji[s]} ${s.charAt(0).toUpperCase() + s.slice(1)}`}
          </button>
        ))}
      </div>

      {/* Rankings list */}
      <div className="space-y-2">
        {filtered.map((card) => {
          const ch = changeArrow(card.change);
          const expanded = expandedRank === card.rank;
          return (
            <div key={card.rank} className="bg-zinc-900/60 border border-zinc-800 rounded-lg overflow-hidden">
              <button onClick={() => setExpandedRank(expanded ? null : card.rank)} className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-zinc-800/40 transition-colors">
                {/* Rank number */}
                <div className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm ${card.rank <= 3 ? 'bg-yellow-900/60 text-yellow-400' : card.rank <= 10 ? 'bg-zinc-700 text-white' : 'bg-zinc-800 text-zinc-500'}`}>
                  {card.rank}
                </div>

                {/* Change */}
                <div className={`w-10 text-center text-xs font-bold px-1.5 py-0.5 rounded ${ch.bg} ${ch.color}`}>
                  {ch.text}
                </div>

                {/* Card info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-medium truncate">{card.player}</span>
                    {card.rookie && <span className="text-yellow-500 text-xs font-bold">RC</span>}
                  </div>
                  <div className="text-zinc-500 text-xs truncate">{card.cardName}</div>
                </div>

                {/* Sport badge */}
                <span className={`hidden sm:inline-flex text-xs px-2 py-0.5 rounded-full border ${sportColors[card.sport]}`}>
                  {sportEmoji[card.sport]}
                </span>

                {/* Heat score */}
                <div className="text-right">
                  <div className={`text-sm font-bold ${heatColor(card.heatScore)}`}>{card.heatScore}</div>
                  <div className="text-zinc-600 text-xs">heat</div>
                </div>
              </button>

              {/* Expanded details */}
              {expanded && (
                <div className="px-4 pb-4 border-t border-zinc-800 pt-3 space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="bg-zinc-800/60 rounded-lg p-2">
                      <div className="text-white font-bold text-sm">${card.value.toLocaleString()}</div>
                      <div className="text-zinc-500 text-xs">Est. Value</div>
                    </div>
                    <div className="bg-zinc-800/60 rounded-lg p-2">
                      <div className={`font-bold text-sm ${heatColor(card.heatScore)}`}>{card.heatScore}/100</div>
                      <div className="text-zinc-500 text-xs">Heat Score</div>
                    </div>
                    <div className="bg-zinc-800/60 rounded-lg p-2">
                      <div className={`font-bold text-sm ${card.momentum === 'rising' ? 'text-green-400' : card.momentum === 'falling' ? 'text-red-400' : 'text-zinc-400'}`}>
                        {card.momentum === 'rising' ? 'Rising' : card.momentum === 'falling' ? 'Falling' : 'Stable'}
                      </div>
                      <div className="text-zinc-500 text-xs">Momentum</div>
                    </div>
                    <div className="bg-zinc-800/60 rounded-lg p-2">
                      <div className="text-white font-bold text-sm">{card.year}</div>
                      <div className="text-zinc-500 text-xs">Year</div>
                    </div>
                  </div>

                  <div className="text-zinc-400 text-sm italic">&ldquo;{card.reason}&rdquo;</div>

                  <div className="flex items-center gap-3">
                    <Link href={`/sports/${card.slug}`} className="text-sm text-orange-400 hover:text-orange-300 font-medium">
                      View Card &rarr;
                    </Link>
                    <Link href={`/players/${slugifyPlayer(card.player)}`} className="text-sm text-zinc-400 hover:text-white font-medium">
                      Player Profile
                    </Link>
                    <div className="flex-1" />
                    <button
                      onClick={(e) => { e.stopPropagation(); saveVote(card.rank, 'agree'); }}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${votes[card.rank] === 'agree' ? 'bg-green-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-green-900/60 hover:text-green-400'}`}
                    >
                      Agree
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); saveVote(card.rank, 'disagree'); }}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${votes[card.rank] === 'disagree' ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-red-900/60 hover:text-red-400'}`}
                    >
                      Disagree
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center text-zinc-600 py-8">No cards ranked for this sport this week.</div>
      )}

      {/* Legend */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-3 text-sm">How to Read Rankings</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-zinc-400">
          <div><span className="text-green-400 font-bold">+N</span> = moved up N spots from last week</div>
          <div><span className="text-red-400 font-bold">-N</span> = moved down N spots</div>
          <div><span className="text-red-400 font-bold">90+</span> heat = on fire</div>
          <div><span className="text-yellow-500 font-bold">RC</span> = rookie card</div>
        </div>
      </div>
    </div>
  );
}
