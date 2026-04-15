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

function getTierLabel(value: number): { label: string; color: string; bg: string } {
  if (value < 10) return { label: 'Budget', color: 'text-gray-400', bg: 'bg-gray-800/50' };
  if (value < 50) return { label: 'Starter', color: 'text-blue-400', bg: 'bg-blue-950/40' };
  if (value < 200) return { label: 'Mid-Tier', color: 'text-emerald-400', bg: 'bg-emerald-950/40' };
  if (value < 1000) return { label: 'Premium', color: 'text-amber-400', bg: 'bg-amber-950/40' };
  if (value < 10000) return { label: 'High-End', color: 'text-orange-400', bg: 'bg-orange-950/40' };
  return { label: 'Elite', color: 'text-red-400', bg: 'bg-red-950/40' };
}

function getUpgradeReason(prev: typeof sportsCards[0] | null, curr: typeof sportsCards[0]): string {
  if (!prev) return 'Starting point — most affordable entry into this player';

  const prevVal = parseValue(prev.estimatedValueRaw);
  const currVal = parseValue(curr.estimatedValueRaw);
  const reasons: string[] = [];

  if (curr.rookie && !prev.rookie) reasons.push('Rookie card designation');
  if (curr.year < prev.year) reasons.push(`Older vintage (${curr.year} vs ${prev.year})`);

  const premiumSets = ['Topps Chrome', 'Prizm', 'Select', 'Optic', 'National Treasures', 'Fleer', 'Upper Deck'];
  const currIsPremium = premiumSets.some(s => curr.set.includes(s));
  const prevIsPremium = premiumSets.some(s => prev.set.includes(s));
  if (currIsPremium && !prevIsPremium) reasons.push('Premium set');

  if (curr.set !== prev.set) reasons.push(`Different set (${curr.set})`);

  const multiplier = currVal / Math.max(prevVal, 1);
  if (multiplier > 5) reasons.push(`${multiplier.toFixed(1)}x value jump`);
  else if (multiplier > 2) reasons.push(`${multiplier.toFixed(1)}x value increase`);

  if (reasons.length === 0) reasons.push('Higher market demand');
  return reasons.slice(0, 2).join(' + ');
}

/* ─── unique players list ─── */
const uniquePlayers = Array.from(new Set(sportsCards.map(c => c.player)))
  .map(name => {
    const cards = sportsCards.filter(c => c.player === name);
    return { name, sport: cards[0].sport, count: cards.length };
  })
  .sort((a, b) => b.count - a.count);

const popularPlayers = uniquePlayers.filter(p => p.count >= 5).slice(0, 20);

/* ─── component ─── */
export default function CardLadderClient() {
  const [search, setSearch] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [sportFilter, setSportFilter] = useState<string>('all');
  const [showGemValues, setShowGemValues] = useState(false);

  const searchResults = useMemo(() => {
    if (search.length < 2) return [];
    const q = search.toLowerCase();
    return uniquePlayers
      .filter(p => p.name.toLowerCase().includes(q))
      .filter(p => sportFilter === 'all' || p.sport === sportFilter)
      .slice(0, 15);
  }, [search, sportFilter]);

  const ladder = useMemo(() => {
    if (!selectedPlayer) return [];
    const cards = sportsCards
      .filter(c => c.player === selectedPlayer)
      .map(c => ({
        ...c,
        rawValue: parseValue(c.estimatedValueRaw),
        gemValue: parseValue(c.estimatedValueGem),
      }))
      .sort((a, b) => a.rawValue - b.rawValue);
    return cards;
  }, [selectedPlayer]);

  const ladderStats = useMemo(() => {
    if (ladder.length === 0) return null;
    const values = ladder.map(c => showGemValues ? c.gemValue : c.rawValue);
    const min = values[0];
    const max = values[values.length - 1];
    const totalCost = values.reduce((a, b) => a + b, 0);
    const rookieCards = ladder.filter(c => c.rookie).length;
    return { min, max, totalCost, rookieCards, range: max - min };
  }, [ladder, showGemValues]);

  const selectPlayer = (name: string) => {
    setSelectedPlayer(name);
    setSearch('');
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setSelectedPlayer(null); }}
              placeholder="Search player name (e.g. Mike Trout, LeBron James)..."
              className="w-full bg-gray-900/80 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
            />
            {searchResults.length > 0 && !selectedPlayer && (
              <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                {searchResults.map(p => (
                  <button
                    key={p.name}
                    onClick={() => selectPlayer(p.name)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-700 flex items-center justify-between border-b border-gray-700/50 last:border-0"
                  >
                    <span className="text-white font-medium">{p.name}</span>
                    <span className="text-xs text-gray-500 capitalize">{p.sport} &middot; {p.count} cards</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {['all', 'baseball', 'basketball', 'football', 'hockey'].map(s => (
              <button
                key={s}
                onClick={() => setSportFilter(s)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  sportFilter === s
                    ? 'bg-violet-900/50 border border-violet-700/50 text-violet-400'
                    : 'bg-gray-700/50 border border-gray-600 text-gray-400 hover:text-gray-300'
                }`}
              >
                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Popular players */}
      {!selectedPlayer && search.length < 2 && (
        <div>
          <h2 className="text-sm font-medium text-gray-500 mb-3">Popular Players (5+ cards)</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {popularPlayers
              .filter(p => sportFilter === 'all' || p.sport === sportFilter)
              .map(p => (
                <button
                  key={p.name}
                  onClick={() => selectPlayer(p.name)}
                  className="px-3 py-2.5 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 hover:border-violet-700/50 rounded-lg text-left transition-colors"
                >
                  <div className="text-sm text-white font-medium truncate">{p.name}</div>
                  <div className="text-xs text-gray-500 capitalize">{p.sport} &middot; {p.count} cards</div>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Ladder */}
      {selectedPlayer && ladder.length > 0 && ladderStats && (
        <>
          {/* Player header */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">{selectedPlayer}</h2>
                <p className="text-sm text-gray-400 capitalize">{ladder[0].sport} &middot; {ladder.length} cards in database</p>
              </div>
              <button
                onClick={() => setShowGemValues(!showGemValues)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  showGemValues
                    ? 'bg-amber-900/50 border border-amber-700/50 text-amber-400'
                    : 'bg-gray-700/50 border border-gray-600 text-gray-400'
                }`}
              >
                {showGemValues ? '💎 Gem Mint Values' : '📦 Raw Values'}
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500 mb-1">Entry Price</div>
                <div className="text-lg font-bold text-emerald-400">{fmt(showGemValues ? ladder[0].gemValue : ladderStats.min)}</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500 mb-1">Top Rung</div>
                <div className="text-lg font-bold text-amber-400">{fmt(showGemValues ? ladder[ladder.length - 1].gemValue : ladderStats.max)}</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500 mb-1">Rungs</div>
                <div className="text-lg font-bold text-violet-400">{ladder.length}</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500 mb-1">Rookie Cards</div>
                <div className="text-lg font-bold text-blue-400">{ladderStats.rookieCards}</div>
              </div>
            </div>
          </div>

          {/* Ladder rungs */}
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-600 via-amber-600 to-red-600 opacity-30" />

            <div className="space-y-3">
              {ladder.map((card, i) => {
                const value = showGemValues ? card.gemValue : card.rawValue;
                const prevCard = i > 0 ? ladder[i - 1] : null;
                const prevValue = prevCard ? (showGemValues ? prevCard.gemValue : prevCard.rawValue) : 0;
                const stepCost = value - prevValue;
                const tier = getTierLabel(value);
                const reason = getUpgradeReason(prevCard, card);
                const maxVal = showGemValues ? ladder[ladder.length - 1].gemValue : ladderStats.max;
                const barWidth = maxVal > 0 ? Math.max(5, (value / maxVal) * 100) : 5;

                return (
                  <div key={card.slug} className="relative pl-14">
                    {/* Rung number circle */}
                    <div className={`absolute left-3 top-4 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${tier.bg} ${tier.color} border-current z-10`}>
                      {i + 1}
                    </div>

                    <div className={`${tier.bg} border border-gray-700/50 rounded-xl p-4 hover:border-gray-600 transition-colors`}>
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${tier.bg} ${tier.color} border border-current/20`}>
                              {tier.label}
                            </span>
                            {card.rookie && (
                              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-950/40 text-blue-400 border border-blue-800/30">
                                RC
                              </span>
                            )}
                            <span className="text-xs text-gray-600">{card.year}</span>
                          </div>
                          <h3 className="text-sm font-semibold text-white truncate">{card.name}</h3>
                          <p className="text-xs text-gray-500">{card.set}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-lg font-bold text-white">{fmt(value)}</div>
                          {i > 0 && (
                            <div className="text-xs text-gray-500">
                              +{fmt(stepCost)} to upgrade
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Value bar */}
                      <div className="h-1.5 bg-gray-700/50 rounded-full mb-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            value >= 10000 ? 'bg-red-500' :
                            value >= 1000 ? 'bg-amber-500' :
                            value >= 200 ? 'bg-emerald-500' :
                            value >= 50 ? 'bg-blue-500' : 'bg-gray-500'
                          }`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>

                      {/* Upgrade reason + link */}
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500 italic">{reason}</p>
                        <Link
                          href={`/cards/${card.slug}`}
                          className="text-xs text-violet-400 hover:text-violet-300 font-medium shrink-0 ml-2"
                        >
                          View Card &rarr;
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-5">
            <h3 className="text-sm font-bold text-white mb-3">Ladder Summary</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xs text-gray-500 mb-1">Complete Ladder Cost</div>
                <div className="text-xl font-bold text-white">
                  {fmt(ladder.reduce((a, c) => a + (showGemValues ? c.gemValue : c.rawValue), 0))}
                </div>
                <div className="text-xs text-gray-600">all {ladder.length} cards {showGemValues ? '(gem mint)' : '(raw)'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Biggest Jump</div>
                <div className="text-xl font-bold text-amber-400">
                  {ladder.length > 1 ? fmt(
                    Math.max(...ladder.slice(1).map((c, i) => {
                      const curr = showGemValues ? c.gemValue : c.rawValue;
                      const prev = showGemValues ? ladder[i].gemValue : ladder[i].rawValue;
                      return curr - prev;
                    }))
                  ) : '—'}
                </div>
                <div className="text-xs text-gray-600">single step upgrade cost</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Value Multiplier</div>
                <div className="text-xl font-bold text-violet-400">
                  {ladderStats.min > 0 ? `${(ladderStats.max / ladderStats.min).toFixed(1)}x` : '—'}
                </div>
                <div className="text-xs text-gray-600">bottom to top rung</div>
              </div>
            </div>
          </div>

          {/* Pro tips */}
          <div className="bg-violet-950/20 border border-violet-800/30 rounded-xl p-5">
            <h3 className="text-sm font-bold text-violet-400 mb-3">Upgrade Strategy Tips</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex gap-2">
                <span className="text-violet-400 shrink-0">1.</span>
                <span>Start at the bottom rung. A {fmt(ladderStats.min)} entry gets you in the game for {selectedPlayer}.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-violet-400 shrink-0">2.</span>
                <span>Skip mid-tier cards if investing — they have the worst resale value relative to cost.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-violet-400 shrink-0">3.</span>
                <span>{ladderStats.rookieCards > 0 ? `This player has ${ladderStats.rookieCards} rookie card${ladderStats.rookieCards > 1 ? 's' : ''} — these hold value best long-term.` : 'No rookie cards in the database — focus on flagship set cards for best value retention.'}</span>
              </li>
              <li className="flex gap-2">
                <span className="text-violet-400 shrink-0">4.</span>
                <span>Toggle to gem mint values to see the premium grading adds. Sometimes grading a raw card is the cheapest upgrade step.</span>
              </li>
            </ul>
          </div>
        </>
      )}

      {/* Empty state for selected player with no cards */}
      {selectedPlayer && ladder.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <div className="text-4xl mb-3">🪜</div>
          <p className="font-medium">No cards found for {selectedPlayer}</p>
          <p className="text-sm mt-1">Try searching for another player</p>
        </div>
      )}
    </div>
  );
}
