'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { sportsCards, type SportsCard } from '@/data/sports-cards';

type SportFilter = 'all' | 'baseball' | 'basketball' | 'football' | 'hockey';
type SortMode = 'value-desc' | 'value-asc' | 'year-desc' | 'year-asc' | 'name';

const SPORT_COLORS: Record<string, string> = {
  baseball: 'bg-red-500/20 text-red-400 border-red-800/50',
  basketball: 'bg-orange-500/20 text-orange-400 border-orange-800/50',
  football: 'bg-blue-500/20 text-blue-400 border-blue-800/50',
  hockey: 'bg-cyan-500/20 text-cyan-400 border-cyan-800/50',
};

function parseMinValue(raw: string): number {
  const match = raw.match(/\$([\d,]+)/);
  if (!match) return 0;
  return parseInt(match[1].replace(/,/g, ''), 10);
}

function formatValueRange(raw: string, gem: string): { rawRange: string; gemRange: string } {
  return { rawRange: raw, gemRange: gem };
}

// Pre-compute all rookie cards
const allRookieCards = sportsCards.filter(c => c.rookie);

// Get unique player names that have rookie cards for autocomplete
const rookiePlayers = [...new Set(allRookieCards.map(c => c.player))].sort();

// Top searched players for quick access
const FEATURED_PLAYERS = [
  'Mike Trout', 'Shohei Ohtani', 'LeBron James', 'Luka Doncic',
  'Patrick Mahomes', 'Justin Herbert', 'Connor McDavid', 'Caitlin Clark',
  'Victor Wembanyama', 'Jayson Tatum', 'Caleb Williams', 'Gunnar Henderson',
];

export default function RookieFinderClient() {
  const [query, setQuery] = useState('');
  const [sportFilter, setSportFilter] = useState<SportFilter>('all');
  const [sortMode, setSortMode] = useState<SortMode>('value-desc');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fuzzy match players for autocomplete
  const suggestions = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    return rookiePlayers
      .filter(p => p.toLowerCase().includes(q))
      .slice(0, 8);
  }, [query]);

  // Search results
  const results = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    let cards = allRookieCards.filter(c =>
      c.player.toLowerCase().includes(q)
    );
    if (sportFilter !== 'all') {
      cards = cards.filter(c => c.sport === sportFilter);
    }
    // Sort
    switch (sortMode) {
      case 'value-desc':
        cards.sort((a, b) => parseMinValue(b.estimatedValueGem) - parseMinValue(a.estimatedValueGem));
        break;
      case 'value-asc':
        cards.sort((a, b) => parseMinValue(a.estimatedValueGem) - parseMinValue(b.estimatedValueGem));
        break;
      case 'year-desc':
        cards.sort((a, b) => b.year - a.year);
        break;
      case 'year-asc':
        cards.sort((a, b) => a.year - b.year);
        break;
      case 'name':
        cards.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
    return cards;
  }, [query, sportFilter, sortMode]);

  // Group results by player
  const groupedResults = useMemo(() => {
    const groups: Record<string, SportsCard[]> = {};
    for (const card of results) {
      if (!groups[card.player]) groups[card.player] = [];
      groups[card.player].push(card);
    }
    return Object.entries(groups).sort((a, b) => {
      // Sort players by highest-value RC
      const aMax = Math.max(...a[1].map(c => parseMinValue(c.estimatedValueGem)));
      const bMax = Math.max(...b[1].map(c => parseMinValue(c.estimatedValueGem)));
      return bMax - aMax;
    });
  }, [results]);

  // Stats
  const stats = useMemo(() => {
    return {
      totalRookies: allRookieCards.length,
      byBaseball: allRookieCards.filter(c => c.sport === 'baseball').length,
      byBasketball: allRookieCards.filter(c => c.sport === 'basketball').length,
      byFootball: allRookieCards.filter(c => c.sport === 'football').length,
      byHockey: allRookieCards.filter(c => c.sport === 'hockey').length,
      uniquePlayers: rookiePlayers.length,
    };
  }, []);

  const selectPlayer = useCallback((player: string) => {
    setQuery(player);
    setShowSuggestions(false);
  }, []);

  return (
    <div className="space-y-8">
      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search any player (e.g. Mike Trout, LeBron James, Connor McDavid)..."
          value={query}
          onChange={e => { setQuery(e.target.value); setShowSuggestions(true); }}
          onFocus={() => setShowSuggestions(true)}
          className="w-full px-5 py-4 bg-zinc-900/60 border border-zinc-700 rounded-xl text-white text-lg placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
        />
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-20 left-0 right-0 mt-1 bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden shadow-xl">
            {suggestions.map(player => (
              <button
                key={player}
                onClick={() => selectPlayer(player)}
                className="w-full text-left px-5 py-3 text-white hover:bg-zinc-800 transition-colors border-b border-zinc-800/50 last:border-0"
              >
                {player}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Access */}
      {query.length < 2 && (
        <>
          <div>
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wide mb-3">Popular Searches</h3>
            <div className="flex flex-wrap gap-2">
              {FEATURED_PLAYERS.map(player => (
                <button
                  key={player}
                  onClick={() => selectPlayer(player)}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 rounded-lg text-sm transition-colors"
                >
                  {player}
                </button>
              ))}
            </div>
          </div>

          {/* Database Stats */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Rookie Card Database</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-400">{stats.totalRookies.toLocaleString()}</div>
                <div className="text-xs text-zinc-500">Rookie Cards</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{stats.uniquePlayers.toLocaleString()}</div>
                <div className="text-xs text-zinc-500">Players with RCs</div>
              </div>
              <div className="text-center col-span-2 sm:col-span-1">
                <div className="text-2xl font-bold text-white">4</div>
                <div className="text-xs text-zinc-500">Major Sports</div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-red-500/10 border border-red-800/30 rounded-lg px-3 py-2 text-center">
                <div className="text-lg font-bold text-red-400">{stats.byBaseball}</div>
                <div className="text-[10px] text-zinc-500">Baseball</div>
              </div>
              <div className="bg-orange-500/10 border border-orange-800/30 rounded-lg px-3 py-2 text-center">
                <div className="text-lg font-bold text-orange-400">{stats.byBasketball}</div>
                <div className="text-[10px] text-zinc-500">Basketball</div>
              </div>
              <div className="bg-blue-500/10 border border-blue-800/30 rounded-lg px-3 py-2 text-center">
                <div className="text-lg font-bold text-blue-400">{stats.byFootball}</div>
                <div className="text-[10px] text-zinc-500">Football</div>
              </div>
              <div className="bg-cyan-500/10 border border-cyan-800/30 rounded-lg px-3 py-2 text-center">
                <div className="text-lg font-bold text-cyan-400">{stats.byHockey}</div>
                <div className="text-[10px] text-zinc-500">Hockey</div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Filters (show when searching) */}
      {query.length >= 2 && (
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex gap-1.5">
            {(['all', 'baseball', 'basketball', 'football', 'hockey'] as const).map(sport => (
              <button
                key={sport}
                onClick={() => setSportFilter(sport)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  sportFilter === sport
                    ? 'bg-amber-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {sport === 'all' ? 'All Sports' : sport.charAt(0).toUpperCase() + sport.slice(1)}
              </button>
            ))}
          </div>
          <select
            value={sortMode}
            onChange={e => setSortMode(e.target.value as SortMode)}
            className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-300 focus:outline-none"
          >
            <option value="value-desc">Highest Value</option>
            <option value="value-asc">Lowest Value</option>
            <option value="year-desc">Newest First</option>
            <option value="year-asc">Oldest First</option>
            <option value="name">Alphabetical</option>
          </select>
        </div>
      )}

      {/* Results */}
      {query.length >= 2 && groupedResults.length === 0 && (
        <div className="text-center py-12 text-zinc-500">
          <div className="text-4xl mb-3">&#128269;</div>
          <div className="text-lg font-medium text-white mb-1">No rookie cards found</div>
          <div className="text-sm">Try a different spelling or search for another player</div>
        </div>
      )}

      {groupedResults.map(([player, cards]) => (
        <div key={player} className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden">
          {/* Player Header */}
          <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">{player}</h3>
              <div className="text-xs text-zinc-500">
                {cards.length} rookie card{cards.length !== 1 ? 's' : ''} found
              </div>
            </div>
            <Link
              href={`/players/${cards[0].player.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')}`}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium"
            >
              View All Cards &rarr;
            </Link>
          </div>

          {/* Cards */}
          <div className="divide-y divide-zinc-800/50">
            {cards.map(card => {
              const { rawRange, gemRange } = formatValueRange(card.estimatedValueRaw, card.estimatedValueGem);
              const sportColor = SPORT_COLORS[card.sport] || 'bg-zinc-700 text-zinc-300';
              return (
                <div key={card.slug} className="px-5 py-4 hover:bg-zinc-800/30 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/sports/${card.slug}`}
                        className="text-white font-medium hover:text-amber-400 transition-colors text-sm block truncate"
                      >
                        {card.name}
                      </Link>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${sportColor}`}>
                          {card.sport}
                        </span>
                        <span className="text-xs text-zinc-500">{card.set}</span>
                        <span className="text-xs text-zinc-600">#{card.cardNumber}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs text-zinc-500">Raw</div>
                      <div className="text-sm text-white font-medium">{rawRange}</div>
                      <div className="text-xs text-zinc-500 mt-1">Gem Mint</div>
                      <div className="text-sm text-amber-400 font-bold">{gemRange}</div>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-500 mt-2 line-clamp-2">{card.description}</p>
                  <a
                    href={card.ebaySearchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-xs text-emerald-400 hover:text-emerald-300"
                  >
                    Search on eBay &rarr;
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Result count */}
      {query.length >= 2 && results.length > 0 && (
        <div className="text-center text-xs text-zinc-500">
          Showing {results.length} rookie card{results.length !== 1 ? 's' : ''} across {groupedResults.length} player{groupedResults.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
