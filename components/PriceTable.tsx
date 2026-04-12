'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { SportsCard } from '@/data/sports-cards';

interface PokemonRow {
  type: 'pokemon';
  id: string;
  name: string;
  set: string;
  rarity: string;
  price: string;
  priceNum: number;
  href: string;
  year: string;
  sport: null;
}

interface SportsRow {
  type: 'sports';
  id: string;
  name: string;
  set: string;
  rarity: string;
  price: string;
  priceNum: number;
  href: string;
  year: string;
  sport: string;
}

type Row = PokemonRow | SportsRow;

interface PriceTableProps {
  sportsCards: SportsCard[];
  initialQuery?: string;
}

interface PokemonApiCard {
  id: string;
  name: string;
  set?: { name?: string; releaseDate?: string };
  rarity?: string;
  tcgplayer?: { prices?: { holofoil?: { market?: number }; normal?: { market?: number }; reverseHolofoil?: { market?: number }; '1stEditionHolofoil'?: { market?: number } } };
  cardmarket?: { prices?: { averageSellPrice?: number } };
}

async function fetchTopPokemonCards(): Promise<PokemonRow[]> {
  try {
    const res = await fetch(
      'https://api.pokemontcg.io/v2/cards?q=tcgplayer.prices.holofoil.market:[10 TO *]&orderBy=-tcgplayer.prices.holofoil.market&pageSize=100',
      { signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const cards: PokemonApiCard[] = data.data ?? [];
    return cards.map(card => {
      const tcgPrices = card.tcgplayer?.prices;
      const priceNum =
        tcgPrices?.['1stEditionHolofoil']?.market ??
        tcgPrices?.holofoil?.market ??
        tcgPrices?.normal?.market ??
        tcgPrices?.reverseHolofoil?.market ??
        card.cardmarket?.prices?.averageSellPrice ??
        0;
      return {
        type: 'pokemon' as const,
        id: card.id,
        name: card.name,
        set: card.set?.name ?? 'Unknown Set',
        rarity: card.rarity ?? 'Unknown',
        price: priceNum > 0 ? `$${priceNum.toFixed(2)}` : 'N/A',
        priceNum,
        href: `/pokemon/cards/${card.id}`,
        year: card.set?.releaseDate?.split('/')?.[0] ?? '',
        sport: null,
      };
    });
  } catch {
    return [];
  }
}

export default function PriceTable({ sportsCards, initialQuery = '' }: PriceTableProps) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<'all' | 'sports' | 'pokemon'>('all');
  const [sport, setSport] = useState<'all' | 'baseball' | 'basketball' | 'football' | 'hockey'>('all');
  const [rookieOnly, setRookieOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'year' | 'set' | 'price'>('price');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [pokemonRows, setPokemonRows] = useState<PokemonRow[]>([]);
  const [pokemonLoading, setPokemonLoading] = useState(false);
  const [pokemonLoaded, setPokemonLoaded] = useState(false);

  const loadPokemon = useCallback(async () => {
    if (pokemonLoaded || pokemonLoading) return;
    setPokemonLoading(true);
    const rows = await fetchTopPokemonCards();
    setPokemonRows(rows);
    setPokemonLoaded(true);
    setPokemonLoading(false);
  }, [pokemonLoaded, pokemonLoading]);

  // Load Pokémon when category includes it
  useEffect(() => {
    if (category === 'pokemon' || category === 'all') {
      loadPokemon();
    }
  }, [category, loadPokemon]);

  const sportsRows: Row[] = useMemo(() => {
    return sportsCards.map(c => {
      // Parse a rough numeric from e.g. "$1,000–$5,000" or "$150"
      const raw = c.estimatedValueRaw.replace(/[^0-9]/g, '');
      const priceNum = raw ? parseInt(raw, 10) : 0;
      return {
        type: 'sports' as const,
        id: c.slug,
        name: c.name,
        set: c.set,
        rarity: c.rookie ? 'Rookie Card' : 'Base Card',
        price: c.estimatedValueRaw,
        priceNum,
        href: `/sports/${c.slug}`,
        year: c.year.toString(),
        sport: c.sport,
      };
    });
  }, [sportsCards]);

  const allRows: Row[] = useMemo(() => {
    return [...sportsRows, ...pokemonRows];
  }, [sportsRows, pokemonRows]);

  const totalCards = sportsRows.length;

  const filtered = useMemo(() => {
    let result: Row[] = [];

    if (category === 'all') {
      result = allRows;
    } else if (category === 'sports') {
      result = sportsRows;
    } else {
      result = pokemonRows;
    }

    if (sport !== 'all' && category !== 'pokemon') {
      result = result.filter(r => r.sport === sport);
    }

    if (rookieOnly) {
      result = result.filter(r => r.rarity === 'Rookie Card');
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.set.toLowerCase().includes(q)
      );
    }

    result = [...result].sort((a, b) => {
      if (sortBy === 'price') {
        const diff = a.priceNum - b.priceNum;
        return sortDir === 'asc' ? diff : -diff;
      }
      let valA = '';
      let valB = '';
      if (sortBy === 'name') { valA = a.name; valB = b.name; }
      else if (sortBy === 'year') { valA = a.year; valB = b.year; }
      else if (sortBy === 'set') { valA = a.set; valB = b.set; }

      const cmp = valA.localeCompare(valB);
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [allRows, sportsRows, pokemonRows, query, category, sport, sortBy, sortDir, rookieOnly]);

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortDir(col === 'price' ? 'desc' : 'asc');
    }
  };

  const SortIcon = ({ col }: { col: typeof sortBy }) => (
    <span className="ml-1 inline-block text-gray-500">
      {sortBy === col ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  );

  const hasActiveFilters = query.trim() || sport !== 'all' || category !== 'all' || rookieOnly;

  const clearAll = () => {
    setQuery('');
    setCategory('all');
    setSport('all');
    setRookieOnly(false);
  };

  const displayedCount = pokemonLoading && (category === 'all' || category === 'pokemon')
    ? 'Loading…'
    : filtered.length;

  const totalDisplay = category === 'pokemon'
    ? `${pokemonLoaded ? pokemonRows.length : '…'} Pokémon cards`
    : category === 'sports'
    ? `${totalCards} sports cards`
    : `${totalCards} sports · ${pokemonLoaded ? pokemonRows.length : '…'} Pokémon`;

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative flex-1">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by player, card name, or set… (results update instantly)"
          className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-400 rounded-xl pl-9 pr-24 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            aria-label="Clear search"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Quick filter chips */}
      <div className="flex flex-wrap gap-2">
        {/* Category chips */}
        {[
          { value: 'all', label: 'All Cards' },
          { value: 'sports', label: 'Sports Cards' },
          { value: 'pokemon', label: '⚡ Pokémon' },
        ].map(opt => (
          <button
            key={opt.value}
            onClick={() => setCategory(opt.value as typeof category)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              category === opt.value
                ? opt.value === 'pokemon'
                  ? 'bg-yellow-600 text-white border-yellow-600'
                  : 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-white hover:border-gray-600'
            }`}
          >
            {opt.label}
          </button>
        ))}

        {category !== 'pokemon' && (
          <>
            <span className="text-gray-700 self-center">|</span>

            {/* Sport chips */}
            {[
              { value: 'all', label: 'All Sports', emoji: '' },
              { value: 'baseball', label: 'Baseball', emoji: '⚾' },
              { value: 'basketball', label: 'Basketball', emoji: '🏀' },
              { value: 'football', label: 'Football', emoji: '🏈' },
              { value: 'hockey', label: 'Hockey', emoji: '🏒' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setSport(opt.value as typeof sport)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                  sport === opt.value
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-white hover:border-gray-600'
                }`}
              >
                {opt.emoji && <span className="mr-1">{opt.emoji}</span>}
                {opt.label}
              </button>
            ))}

            <span className="text-gray-700 self-center">|</span>

            {/* Rookie toggle */}
            <button
              onClick={() => setRookieOnly(r => !r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                rookieOnly
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-white hover:border-gray-600'
              }`}
            >
              Rookie Cards Only
            </button>
          </>
        )}

        {/* Clear all */}
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:text-white transition-colors border border-gray-700 hover:border-gray-600 bg-gray-800"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Results count */}
      <div className="flex items-center gap-2 flex-wrap">
        <p className="text-gray-400 text-sm">
          <span className="text-white font-semibold">{displayedCount}</span> results · {totalDisplay}
          {pokemonLoading && <span className="ml-2 text-yellow-500 text-xs animate-pulse">Fetching Pokémon prices…</span>}
        </p>
        {hasActiveFilters && filtered.length === 0 && !pokemonLoading && (
          <span className="text-amber-400 text-xs">No matches — try adjusting your filters</span>
        )}
      </div>

      {/* Table — desktop */}
      <div className="hidden sm:block overflow-x-auto rounded-xl border border-gray-800">
        <table className="w-full text-sm">
          <thead className="bg-gray-900 border-b border-gray-800">
            <tr>
              <th className="text-left px-4 py-3 text-gray-400 font-medium cursor-pointer hover:text-white" onClick={() => toggleSort('name')}>
                Card <SortIcon col="name" />
              </th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium cursor-pointer hover:text-white" onClick={() => toggleSort('set')}>
                Set <SortIcon col="set" />
              </th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium cursor-pointer hover:text-white" onClick={() => toggleSort('year')}>
                Year <SortIcon col="year" />
              </th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Type</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium cursor-pointer hover:text-white" onClick={() => toggleSort('price')}>
                Market Value <SortIcon col="price" />
              </th>
            </tr>
          </thead>
          <tbody>
            {pokemonLoading && filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-yellow-500">
                  <span className="animate-pulse">Loading Pokémon card prices…</span>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                  No cards match your search
                </td>
              </tr>
            ) : (
              filtered.map(row => (
                <tr key={`${row.type}-${row.id}`} className="border-b border-gray-800/50 hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={row.href} className="text-white hover:text-emerald-400 transition-colors font-medium">
                      {row.name}
                    </Link>
                    {row.type === 'pokemon' && (
                      <span className="ml-2 text-xs text-yellow-600">⚡</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-400">{row.set}</td>
                  <td className="px-4 py-3 text-gray-400">{row.year}</td>
                  <td className="px-4 py-3">
                    {row.type === 'pokemon' ? (
                      <span className="text-xs px-2 py-0.5 rounded bg-yellow-900/30 text-yellow-500">
                        {row.rarity}
                      </span>
                    ) : (
                      <span className={`text-xs px-2 py-0.5 rounded ${row.rarity === 'Rookie Card' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-gray-800 text-gray-400'}`}>
                        {row.rarity}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-emerald-400 font-medium">{row.price}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile card view */}
      <div className="sm:hidden space-y-3">
        {pokemonLoading && filtered.length === 0 ? (
          <p className="text-center text-yellow-500 py-12 animate-pulse">Loading Pokémon card prices…</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-500 py-12">No cards match your search</p>
        ) : (
          filtered.map(row => (
            <Link key={`${row.type}-${row.id}`} href={row.href} className="block bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-emerald-500/50 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-white font-medium text-sm truncate">
                    {row.name}
                    {row.type === 'pokemon' && <span className="ml-1 text-yellow-600">⚡</span>}
                  </p>
                  <p className="text-gray-400 text-xs mt-0.5">{row.set} · {row.year}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-emerald-400 text-sm font-medium">{row.price}</p>
                  <span className={`text-xs ${row.type === 'pokemon' ? 'text-yellow-600' : row.rarity === 'Rookie Card' ? 'text-emerald-500' : 'text-gray-500'}`}>
                    {row.rarity}
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
