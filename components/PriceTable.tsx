'use client';

import { useState, useMemo } from 'react';
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

export default function PriceTable({ sportsCards, initialQuery = '' }: PriceTableProps) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<'all' | 'sports' | 'pokemon'>('all');
  const [sport, setSport] = useState<'all' | 'baseball' | 'basketball' | 'football' | 'hockey'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'year' | 'set'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const rows: Row[] = useMemo(() => {
    return sportsCards.map(c => ({
      type: 'sports' as const,
      id: c.slug,
      name: c.name,
      set: c.set,
      rarity: c.rookie ? 'Rookie Card' : 'Base Card',
      price: c.estimatedValueRaw,
      priceNum: 0,
      href: `/sports/${c.slug}`,
      year: c.year.toString(),
      sport: c.sport,
    }));
  }, [sportsCards]);

  const filtered = useMemo(() => {
    let result = rows;

    if (category !== 'all') {
      result = result.filter(r => r.type === category);
    }

    if (sport !== 'all' && category !== 'pokemon') {
      result = result.filter(r => r.sport === sport);
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.set.toLowerCase().includes(q)
      );
    }

    result = [...result].sort((a, b) => {
      let valA = '';
      let valB = '';
      if (sortBy === 'name') { valA = a.name; valB = b.name; }
      else if (sortBy === 'year') { valA = a.year; valB = b.year; }
      else if (sortBy === 'set') { valA = a.set; valB = b.set; }

      const cmp = valA.localeCompare(valB);
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [rows, query, category, sport, sortBy, sortDir]);

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ col }: { col: typeof sortBy }) => (
    <span className="ml-1 inline-block text-gray-500">
      {sortBy === col ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  );

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by name or set..."
            className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-400 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>

        <select
          value={category}
          onChange={e => setCategory(e.target.value as typeof category)}
          className="bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
        >
          <option value="all">All Categories</option>
          <option value="sports">Sports Cards</option>
          <option value="pokemon">Pokémon TCG</option>
        </select>

        {category !== 'pokemon' && (
          <select
            value={sport}
            onChange={e => setSport(e.target.value as typeof sport)}
            className="bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Sports</option>
            <option value="baseball">Baseball</option>
            <option value="basketball">Basketball</option>
            <option value="football">Football</option>
            <option value="hockey">Hockey</option>
          </select>
        )}
      </div>

      {/* Results count */}
      <p className="text-gray-400 text-sm">{filtered.length} cards</p>

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
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Est. Value</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                  No cards match your search
                </td>
              </tr>
            ) : (
              filtered.map(row => (
                <tr key={row.id} className="border-b border-gray-800/50 hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={row.href} className="text-white hover:text-emerald-400 transition-colors font-medium">
                      {row.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{row.set}</td>
                  <td className="px-4 py-3 text-gray-400">{row.year}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded ${row.rarity === 'Rookie Card' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-gray-800 text-gray-400'}`}>
                      {row.rarity}
                    </span>
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
        {filtered.length === 0 ? (
          <p className="text-center text-gray-500 py-12">No cards match your search</p>
        ) : (
          filtered.map(row => (
            <Link key={row.id} href={row.href} className="block bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-emerald-500/50 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-white font-medium text-sm truncate">{row.name}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{row.set} · {row.year}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-emerald-400 text-sm font-medium">{row.price}</p>
                  <span className={`text-xs ${row.rarity === 'Rookie Card' ? 'text-emerald-500' : 'text-gray-500'}`}>
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
