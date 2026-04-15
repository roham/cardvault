'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

type Sport = 'all' | 'baseball' | 'basketball' | 'football' | 'hockey';
type SortBy = 'gem' | 'raw' | 'cards' | 'premium';
type ViewMode = 'rankings' | 'overview';

function parseValue(val: string): number {
  const match = val.match(/\$([0-9,]+)/);
  if (!match) return 0;
  return parseInt(match[1].replace(/,/g, ''), 10);
}

function parseValueHigh(val: string): number {
  const parts = val.match(/\$([0-9,]+)/g);
  if (!parts || parts.length === 0) return 0;
  const last = parts[parts.length - 1];
  return parseInt(last.replace(/[$,]/g, ''), 10);
}

interface PlayerMarketCap {
  player: string;
  sport: string;
  cardCount: number;
  rawMarketCap: number;
  gemMarketCap: number;
  gradingPremium: number;
  topCard: string;
  topCardValue: number;
  hasRookie: boolean;
  slug: string;
}

const sportColors: Record<string, string> = {
  baseball: 'text-red-400',
  basketball: 'text-orange-400',
  football: 'text-green-400',
  hockey: 'text-blue-400',
};

const sportBg: Record<string, string> = {
  baseball: 'bg-red-500/10 border-red-500/20',
  basketball: 'bg-orange-500/10 border-orange-500/20',
  football: 'bg-green-500/10 border-green-500/20',
  hockey: 'bg-blue-500/10 border-blue-500/20',
};

function formatValue(v: number): string {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}K`;
  return `$${v}`;
}

export default function MarketCapClient() {
  const [sport, setSport] = useState<Sport>('all');
  const [sortBy, setSortBy] = useState<SortBy>('gem');
  const [search, setSearch] = useState('');
  const [view, setView] = useState<ViewMode>('rankings');
  const [page, setPage] = useState(0);
  const perPage = 25;

  const players = useMemo(() => {
    const map = new Map<string, PlayerMarketCap>();
    for (const card of sportsCards) {
      if (!card.player || !['baseball', 'basketball', 'football', 'hockey'].includes(card.sport)) continue;
      const key = `${card.player}__${card.sport}`;
      const raw = parseValue(card.estimatedValueRaw || '');
      const rawHigh = parseValueHigh(card.estimatedValueRaw || '');
      const gem = parseValue(card.estimatedValueGem || '');
      const gemHigh = parseValueHigh(card.estimatedValueGem || '');
      const avgRaw = Math.round((raw + rawHigh) / 2);
      const avgGem = Math.round((gem + gemHigh) / 2);

      if (!map.has(key)) {
        map.set(key, {
          player: card.player,
          sport: card.sport,
          cardCount: 0,
          rawMarketCap: 0,
          gemMarketCap: 0,
          gradingPremium: 0,
          topCard: card.name,
          topCardValue: avgGem,
          hasRookie: false,
          slug: card.player.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        });
      }

      const p = map.get(key)!;
      p.cardCount++;
      p.rawMarketCap += avgRaw;
      p.gemMarketCap += avgGem;
      if (avgGem > p.topCardValue) {
        p.topCard = card.name;
        p.topCardValue = avgGem;
      }
      if (card.rookie) p.hasRookie = true;
    }

    for (const p of map.values()) {
      p.gradingPremium = p.rawMarketCap > 0
        ? Math.round(((p.gemMarketCap - p.rawMarketCap) / p.rawMarketCap) * 100)
        : 0;
    }

    return Array.from(map.values());
  }, []);

  const overview = useMemo(() => {
    const sports = ['baseball', 'basketball', 'football', 'hockey'];
    return sports.map(s => {
      const sp = players.filter(p => p.sport === s);
      const totalGem = sp.reduce((a, p) => a + p.gemMarketCap, 0);
      const totalRaw = sp.reduce((a, p) => a + p.rawMarketCap, 0);
      const totalCards = sp.reduce((a, p) => a + p.cardCount, 0);
      const top = [...sp].sort((a, b) => b.gemMarketCap - a.gemMarketCap).slice(0, 3);
      return { sport: s, players: sp.length, cards: totalCards, gemCap: totalGem, rawCap: totalRaw, top };
    });
  }, [players]);

  const filtered = useMemo(() => {
    let list = players;
    if (sport !== 'all') list = list.filter(p => p.sport === sport);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => p.player.toLowerCase().includes(q));
    }
    const sortFns: Record<SortBy, (a: PlayerMarketCap, b: PlayerMarketCap) => number> = {
      gem: (a, b) => b.gemMarketCap - a.gemMarketCap,
      raw: (a, b) => b.rawMarketCap - a.rawMarketCap,
      cards: (a, b) => b.cardCount - a.cardCount,
      premium: (a, b) => b.gradingPremium - a.gradingPremium,
    };
    return [...list].sort(sortFns[sortBy]);
  }, [players, sport, search, sortBy]);

  const paged = filtered.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const globalStats = useMemo(() => ({
    totalGem: players.reduce((a, p) => a + p.gemMarketCap, 0),
    totalRaw: players.reduce((a, p) => a + p.rawMarketCap, 0),
    totalPlayers: players.length,
    totalCards: players.reduce((a, p) => a + p.cardCount, 0),
    avgPremium: Math.round(players.reduce((a, p) => a + p.gradingPremium, 0) / players.length),
  }), [players]);

  return (
    <div>
      {/* Global Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
        {[
          { label: 'Total Gem Mint Cap', value: formatValue(globalStats.totalGem), color: 'text-emerald-400' },
          { label: 'Total Raw Cap', value: formatValue(globalStats.totalRaw), color: 'text-yellow-400' },
          { label: 'Players', value: globalStats.totalPlayers.toLocaleString(), color: 'text-white' },
          { label: 'Cards', value: globalStats.totalCards.toLocaleString(), color: 'text-white' },
          { label: 'Avg Grading Premium', value: `${globalStats.avgPremium}%`, color: 'text-purple-400' },
        ].map(stat => (
          <div key={stat.label} className="bg-gray-900 rounded-lg p-3 text-center">
            <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* View Toggle */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setView('rankings')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'rankings' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
          Rankings
        </button>
        <button onClick={() => setView('overview')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'overview' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
          Sport Overview
        </button>
      </div>

      {view === 'overview' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {overview.map(o => (
            <div key={o.sport} className={`rounded-xl border p-5 ${sportBg[o.sport]}`}>
              <h3 className={`text-lg font-bold capitalize mb-3 ${sportColors[o.sport]}`}>{o.sport}</h3>
              <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                <div><span className="text-gray-400">Gem Cap:</span> <span className="font-semibold">{formatValue(o.gemCap)}</span></div>
                <div><span className="text-gray-400">Raw Cap:</span> <span className="font-semibold">{formatValue(o.rawCap)}</span></div>
                <div><span className="text-gray-400">Players:</span> <span className="font-semibold">{o.players}</span></div>
                <div><span className="text-gray-400">Cards:</span> <span className="font-semibold">{o.cards}</span></div>
              </div>
              <div className="text-xs text-gray-400 mb-2">Top 3 by Market Cap:</div>
              <div className="space-y-1">
                {o.top.map((p, i) => (
                  <Link key={p.player} href={`/players/${p.slug}`} className="flex items-center justify-between bg-black/20 rounded-lg px-3 py-1.5 hover:bg-black/30 transition-colors">
                    <span className="text-sm">
                      <span className="text-gray-500 mr-2">#{i + 1}</span>
                      {p.player}
                    </span>
                    <span className="text-sm font-semibold text-emerald-400">{formatValue(p.gemMarketCap)}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <input
              type="text"
              placeholder="Search players..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0); }}
              className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-1">
              {(['all', 'baseball', 'basketball', 'football', 'hockey'] as Sport[]).map(s => (
                <button key={s} onClick={() => { setSport(s); setPage(0); }} className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${sport === s ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                  {s === 'all' ? 'All Sports' : s}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Controls */}
          <div className="flex gap-2 mb-4">
            <span className="text-xs text-gray-500 self-center mr-1">Sort:</span>
            {([
              { key: 'gem' as SortBy, label: 'Gem Cap' },
              { key: 'raw' as SortBy, label: 'Raw Cap' },
              { key: 'cards' as SortBy, label: 'Card Count' },
              { key: 'premium' as SortBy, label: 'Grading Premium' },
            ]).map(s => (
              <button key={s.key} onClick={() => { setSortBy(s.key); setPage(0); }} className={`px-3 py-1 rounded text-xs transition-colors ${sortBy === s.key ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800 text-gray-500 hover:text-gray-300'}`}>
                {s.label}
              </button>
            ))}
          </div>

          {/* Results count */}
          <p className="text-sm text-gray-500 mb-4">{filtered.length} players found</p>

          {/* Rankings Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 text-xs">
                  <th className="text-left py-2 pr-2">#</th>
                  <th className="text-left py-2 pr-4">Player</th>
                  <th className="text-left py-2 pr-2 hidden sm:table-cell">Sport</th>
                  <th className="text-right py-2 pr-2">Cards</th>
                  <th className="text-right py-2 pr-2">Gem Cap</th>
                  <th className="text-right py-2 pr-2 hidden sm:table-cell">Raw Cap</th>
                  <th className="text-right py-2 pr-2 hidden md:table-cell">Premium</th>
                  <th className="text-left py-2 hidden lg:table-cell">Top Card</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((p, i) => {
                  const rank = page * perPage + i + 1;
                  return (
                    <tr key={`${p.player}-${p.sport}`} className="border-b border-gray-900 hover:bg-gray-900/50 transition-colors">
                      <td className="py-2.5 pr-2 text-gray-500 font-mono text-xs">{rank}</td>
                      <td className="py-2.5 pr-4">
                        <Link href={`/players/${p.slug}`} className="hover:text-blue-400 transition-colors">
                          <span className="font-medium">{p.player}</span>
                          {p.hasRookie && <span className="ml-1.5 text-[10px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded">RC</span>}
                        </Link>
                        <span className={`sm:hidden ml-2 text-xs ${sportColors[p.sport]}`}>
                          {p.sport.slice(0, 3).toUpperCase()}
                        </span>
                      </td>
                      <td className={`py-2.5 pr-2 capitalize text-xs hidden sm:table-cell ${sportColors[p.sport]}`}>{p.sport}</td>
                      <td className="py-2.5 pr-2 text-right font-mono">{p.cardCount}</td>
                      <td className="py-2.5 pr-2 text-right font-semibold text-emerald-400">{formatValue(p.gemMarketCap)}</td>
                      <td className="py-2.5 pr-2 text-right text-yellow-400 hidden sm:table-cell">{formatValue(p.rawMarketCap)}</td>
                      <td className="py-2.5 pr-2 text-right hidden md:table-cell">
                        <span className={p.gradingPremium > 500 ? 'text-purple-400' : p.gradingPremium > 300 ? 'text-blue-400' : 'text-gray-400'}>
                          {p.gradingPremium}%
                        </span>
                      </td>
                      <td className="py-2.5 text-xs text-gray-500 truncate max-w-[200px] hidden lg:table-cell">{p.topCard}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="px-3 py-1.5 bg-gray-800 rounded text-sm disabled:opacity-30 hover:bg-gray-700 transition-colors">
                Prev
              </button>
              <span className="text-sm text-gray-400">
                Page {page + 1} of {totalPages}
              </span>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="px-3 py-1.5 bg-gray-800 rounded text-sm disabled:opacity-30 hover:bg-gray-700 transition-colors">
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
