'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

/* ─── Types ────────────────────────────────────────── */
interface PlayerCard {
  slug: string;
  name: string;
  year: number;
  set: string;
  sport: string;
  player: string;
  cardNumber: string;
  valueRaw: number;
  valueGem: number;
  rawLabel: string;
  gemLabel: string;
  rookie: boolean;
}

interface PlayerProfile {
  name: string;
  sport: string;
  cards: PlayerCard[];
  totalValueRaw: number;
  totalValueGem: number;
  avgValueRaw: number;
  rookieCount: number;
  yearRange: [number, number];
  sets: string[];
  investmentGrade: string;
  gradeColor: string;
  bestCard: PlayerCard | null;
  cheapestEntry: PlayerCard | null;
}

/* ─── Helpers ──────────────────────────────────────── */
function parseValue(v: string): number {
  const m = v.match(/\$([0-9,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
}

function formatMoney(n: number): string {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${Math.round(n).toLocaleString()}`;
}

function getInvestmentGrade(cards: PlayerCard[]): { grade: string; color: string } {
  const avgValue = cards.reduce((s, c) => s + c.valueRaw, 0) / cards.length;
  const hasRookie = cards.some(c => c.rookie);
  const cardCount = cards.length;
  const yearSpan = cards.length > 0 ? Math.max(...cards.map(c => c.year)) - Math.min(...cards.map(c => c.year)) : 0;

  let score = 0;
  if (avgValue >= 500) score += 3; else if (avgValue >= 50) score += 2; else if (avgValue >= 10) score += 1;
  if (hasRookie) score += 2;
  if (cardCount >= 6) score += 2; else if (cardCount >= 3) score += 1;
  if (yearSpan >= 10) score += 1;

  if (score >= 7) return { grade: 'S', color: 'text-yellow-400' };
  if (score >= 5) return { grade: 'A', color: 'text-green-400' };
  if (score >= 4) return { grade: 'B', color: 'text-blue-400' };
  if (score >= 2) return { grade: 'C', color: 'text-purple-400' };
  return { grade: 'D', color: 'text-gray-400' };
}

const sportEmoji: Record<string, string> = {
  baseball: '\u26be', basketball: '\ud83c\udfc0', football: '\ud83c\udfc8', hockey: '\ud83c\udfd2',
};

const sportColor: Record<string, string> = {
  baseball: 'text-red-400',
  basketball: 'text-orange-400',
  football: 'text-blue-400',
  hockey: 'text-cyan-400',
};

/* ─── Component ────────────────────────────────────── */
export default function PlayerPortfolioClient() {
  const [query, setQuery] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'year' | 'value' | 'set'>('year');

  // Build player index
  const playerIndex = useMemo(() => {
    const index = new Map<string, PlayerCard[]>();
    for (const c of sportsCards) {
      const key = c.player;
      if (!index.has(key)) index.set(key, []);
      index.get(key)!.push({
        slug: c.slug,
        name: c.name,
        year: c.year,
        set: c.set,
        sport: c.sport,
        player: c.player,
        cardNumber: c.cardNumber,
        valueRaw: parseValue(c.estimatedValueRaw),
        valueGem: parseValue(c.estimatedValueGem),
        rawLabel: c.estimatedValueRaw,
        gemLabel: c.estimatedValueGem,
        rookie: c.rookie,
      });
    }
    return index;
  }, []);

  const playerNames = useMemo(() => [...playerIndex.keys()].sort(), [playerIndex]);

  // Search suggestions
  const suggestions = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    return playerNames.filter(n => n.toLowerCase().includes(q)).slice(0, 12);
  }, [query, playerNames]);

  // Build profile for selected player
  const profile = useMemo<PlayerProfile | null>(() => {
    if (!selectedPlayer) return null;
    const cards = playerIndex.get(selectedPlayer);
    if (!cards || cards.length === 0) return null;

    const totalRaw = cards.reduce((s, c) => s + c.valueRaw, 0);
    const totalGem = cards.reduce((s, c) => s + c.valueGem, 0);
    const { grade, color } = getInvestmentGrade(cards);
    const years = cards.map(c => c.year);
    const sorted = [...cards].sort((a, b) => b.valueRaw - a.valueRaw);

    return {
      name: selectedPlayer,
      sport: cards[0].sport,
      cards,
      totalValueRaw: totalRaw,
      totalValueGem: totalGem,
      avgValueRaw: totalRaw / cards.length,
      rookieCount: cards.filter(c => c.rookie).length,
      yearRange: [Math.min(...years), Math.max(...years)],
      sets: [...new Set(cards.map(c => c.set))],
      investmentGrade: grade,
      gradeColor: color,
      bestCard: sorted[0] || null,
      cheapestEntry: sorted[sorted.length - 1] || null,
    };
  }, [selectedPlayer, playerIndex]);

  const sortedCards = useMemo(() => {
    if (!profile) return [];
    const cards = [...profile.cards];
    if (sortBy === 'year') cards.sort((a, b) => a.year - b.year);
    if (sortBy === 'value') cards.sort((a, b) => b.valueRaw - a.valueRaw);
    if (sortBy === 'set') cards.sort((a, b) => a.set.localeCompare(b.set));
    return cards;
  }, [profile, sortBy]);

  const handleSelect = useCallback((name: string) => {
    setSelectedPlayer(name);
    setQuery(name);
  }, []);

  // Value distribution by tier
  const valueTiers = useMemo(() => {
    if (!profile) return [];
    const tiers = [
      { label: 'Under $5', min: 0, max: 5, count: 0, color: 'bg-gray-600' },
      { label: '$5-$24', min: 5, max: 25, count: 0, color: 'bg-blue-600' },
      { label: '$25-$99', min: 25, max: 100, count: 0, color: 'bg-green-600' },
      { label: '$100-$499', min: 100, max: 500, count: 0, color: 'bg-yellow-600' },
      { label: '$500+', min: 500, max: Infinity, count: 0, color: 'bg-red-600' },
    ];
    for (const c of profile.cards) {
      const t = tiers.find(t => c.valueRaw >= t.min && c.valueRaw < t.max);
      if (t) t.count++;
    }
    return tiers.filter(t => t.count > 0);
  }, [profile]);

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setSelectedPlayer(null); }}
          placeholder="Search any player (e.g., Mike Trout, LeBron James, Patrick Mahomes)..."
          className="w-full bg-gray-800/60 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none text-sm"
        />
        {suggestions.length > 0 && !selectedPlayer && (
          <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 rounded-xl shadow-lg max-h-64 overflow-y-auto">
            {suggestions.map(name => {
              const cards = playerIndex.get(name)!;
              const sport = cards[0].sport;
              return (
                <button key={name} onClick={() => handleSelect(name)}
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-700/60 transition-colors flex items-center justify-between">
                  <div>
                    <span className="text-white font-medium">{name}</span>
                    <span className={`ml-2 text-xs ${sportColor[sport] || 'text-gray-400'}`}>
                      {sportEmoji[sport] || ''} {sport}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{cards.length} card{cards.length !== 1 ? 's' : ''}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Popular Players */}
      {!selectedPlayer && (
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Popular Players</h3>
          <div className="flex flex-wrap gap-2">
            {['Mike Trout', 'LeBron James', 'Patrick Mahomes', 'Connor McDavid', 'Shohei Ohtani', 'Victor Wembanyama', 'Aaron Judge', 'Josh Allen'].map(name => (
              <button key={name} onClick={() => handleSelect(name)}
                className="px-3 py-1.5 bg-gray-800/60 border border-gray-700/40 rounded-lg text-sm text-gray-300 hover:text-white hover:border-indigo-500/50 transition-colors">
                {name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Player Profile */}
      {profile && (
        <>
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-950/50 to-purple-950/30 border border-indigo-800/40 rounded-xl p-5">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{sportEmoji[profile.sport] || ''}</span>
                  <span className={`text-xs uppercase tracking-wide ${sportColor[profile.sport] || 'text-gray-400'}`}>{profile.sport}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">{profile.name}</h2>
                <p className="text-sm text-gray-400 mt-1">
                  {profile.yearRange[0]}–{profile.yearRange[1]} &middot; {profile.cards.length} cards &middot; {profile.sets.length} sets
                  {profile.rookieCount > 0 && <span className="text-yellow-400"> &middot; {profile.rookieCount} RC{profile.rookieCount > 1 ? 's' : ''}</span>}
                </p>
              </div>
              <div className="text-center">
                <div className={`text-4xl font-black ${profile.gradeColor}`}>{profile.investmentGrade}</div>
                <div className="text-xs text-gray-500">Investment Grade</div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 border border-gray-700/40 rounded-xl p-4 text-center">
              <div className="text-xl font-black text-white">{formatMoney(profile.totalValueRaw)}</div>
              <div className="text-xs text-gray-500">Total Raw Value</div>
            </div>
            <div className="bg-gray-800/50 border border-gray-700/40 rounded-xl p-4 text-center">
              <div className="text-xl font-black text-yellow-400">{formatMoney(profile.totalValueGem)}</div>
              <div className="text-xs text-gray-500">Total Gem Mint</div>
            </div>
            <div className="bg-gray-800/50 border border-gray-700/40 rounded-xl p-4 text-center">
              <div className="text-xl font-black text-green-400">{formatMoney(profile.avgValueRaw)}</div>
              <div className="text-xs text-gray-500">Avg Raw Value</div>
            </div>
            <div className="bg-gray-800/50 border border-gray-700/40 rounded-xl p-4 text-center">
              <div className="text-xl font-black text-purple-400">{profile.cards.length}</div>
              <div className="text-xs text-gray-500">Total Cards</div>
            </div>
          </div>

          {/* Value Distribution */}
          {valueTiers.length > 0 && (
            <div className="bg-gray-800/40 border border-gray-700/40 rounded-xl p-4">
              <h3 className="text-sm font-bold text-white mb-3">Value Distribution</h3>
              <div className="space-y-2">
                {valueTiers.map(t => (
                  <div key={t.label} className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-16">{t.label}</span>
                    <div className="flex-1 bg-gray-700/30 rounded-full h-4 overflow-hidden">
                      <div className={`h-full ${t.color} rounded-full transition-all`}
                        style={{ width: `${(t.count / profile.cards.length) * 100}%` }} />
                    </div>
                    <span className="text-xs text-gray-400 w-8 text-right">{t.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Best Card + Cheapest Entry */}
          <div className="grid sm:grid-cols-2 gap-4">
            {profile.bestCard && (
              <div className="bg-yellow-950/30 border border-yellow-800/40 rounded-xl p-4">
                <div className="text-xs text-yellow-500 font-bold mb-2">TOP CARD</div>
                <Link href={`/sports/${profile.bestCard.slug}`} className="text-white font-bold hover:text-yellow-400 transition-colors text-sm">
                  {profile.bestCard.name}
                </Link>
                <div className="text-lg font-black text-yellow-400 mt-1">{formatMoney(profile.bestCard.valueRaw)}</div>
                <div className="text-xs text-gray-500">{profile.bestCard.rawLabel}</div>
              </div>
            )}
            {profile.cheapestEntry && (
              <div className="bg-green-950/30 border border-green-800/40 rounded-xl p-4">
                <div className="text-xs text-green-500 font-bold mb-2">CHEAPEST ENTRY</div>
                <Link href={`/sports/${profile.cheapestEntry.slug}`} className="text-white font-bold hover:text-green-400 transition-colors text-sm">
                  {profile.cheapestEntry.name}
                </Link>
                <div className="text-lg font-black text-green-400 mt-1">{formatMoney(profile.cheapestEntry.valueRaw)}</div>
                <div className="text-xs text-gray-500">{profile.cheapestEntry.rawLabel}</div>
              </div>
            )}
          </div>

          {/* Card List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-white">All {profile.name} Cards</h3>
              <div className="flex gap-2">
                {(['year', 'value', 'set'] as const).map(s => (
                  <button key={s} onClick={() => setSortBy(s)}
                    className={`px-3 py-1 text-xs rounded-lg ${sortBy === s ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
                    {s === 'year' ? 'Year' : s === 'value' ? 'Value' : 'Set'}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              {sortedCards.map((card, i) => (
                <Link key={card.slug} href={`/sports/${card.slug}`}
                  className="flex items-center justify-between bg-gray-800/40 border border-gray-700/30 rounded-lg px-4 py-3 hover:border-indigo-500/50 transition-colors group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-6">{i + 1}.</span>
                      <span className="text-white text-sm font-medium group-hover:text-indigo-400 truncate">{card.name}</span>
                      {card.rookie && <span className="text-[10px] bg-yellow-600/30 text-yellow-400 px-1.5 py-0.5 rounded shrink-0">RC</span>}
                    </div>
                    <div className="text-xs text-gray-500 ml-8">{card.set}</div>
                  </div>
                  <div className="text-right ml-4 shrink-0">
                    <div className="text-sm font-bold text-white">{formatMoney(card.valueRaw)}</div>
                    <div className="text-xs text-gray-500">raw</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Player Page Link */}
          <div className="text-center">
            <Link href={`/players/${profile.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/['']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors text-sm">
              View Full Player Profile &rarr;
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
