'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

const sportIcons: Record<string, string> = {
  baseball: '⚾', basketball: '🏀', football: '🏈', hockey: '🏒',
};

function parseLowValue(val: string): number {
  const m = val.match(/\$([\d,]+)/);
  if (!m) return 0;
  return parseInt(m[1].replace(/,/g, ''), 10) || 0;
}

function parseMidValue(val: string): number {
  const matches = val.match(/\$([\d,]+)/g);
  if (!matches || matches.length === 0) return 0;
  const nums = matches.map(m => parseInt(m.replace(/[$,]/g, ''), 10));
  if (nums.length === 1) return nums[0];
  return Math.round((nums[0] + nums[1]) / 2);
}

interface SetInfo {
  name: string;
  sport: string;
  year: number;
  cardCount: number;
  totalCostLow: number;
  totalCostMid: number;
  cheapestCard: { player: string; value: number };
  mostExpensive: { player: string; value: number };
  rookieCount: number;
}

export default function SetCostEstimator() {
  const [sportFilter, setSportFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'cost-asc' | 'cost-desc' | 'cards-desc' | 'year-desc'>('year-desc');
  const [selectedSet, setSelectedSet] = useState<string | null>(null);

  const sets = useMemo(() => {
    const setMap = new Map<string, SetInfo>();

    for (const card of sportsCards) {
      const existing = setMap.get(card.set);
      const lowVal = parseLowValue(card.estimatedValueRaw);
      const midVal = parseMidValue(card.estimatedValueRaw);

      if (existing) {
        existing.cardCount++;
        existing.totalCostLow += lowVal;
        existing.totalCostMid += midVal;
        if (card.rookie) existing.rookieCount++;
        if (midVal < existing.cheapestCard.value) {
          existing.cheapestCard = { player: card.player, value: midVal };
        }
        if (midVal > existing.mostExpensive.value) {
          existing.mostExpensive = { player: card.player, value: midVal };
        }
      } else {
        setMap.set(card.set, {
          name: card.set,
          sport: card.sport,
          year: card.year,
          cardCount: 1,
          totalCostLow: lowVal,
          totalCostMid: midVal,
          cheapestCard: { player: card.player, value: midVal },
          mostExpensive: { player: card.player, value: midVal },
          rookieCount: card.rookie ? 1 : 0,
        });
      }
    }

    let result = Array.from(setMap.values());

    if (sportFilter !== 'all') {
      result = result.filter(s => s.sport === sportFilter);
    }

    // Only show sets with 3+ cards
    result = result.filter(s => s.cardCount >= 3);

    switch (sortBy) {
      case 'cost-asc': result.sort((a, b) => a.totalCostMid - b.totalCostMid); break;
      case 'cost-desc': result.sort((a, b) => b.totalCostMid - a.totalCostMid); break;
      case 'cards-desc': result.sort((a, b) => b.cardCount - a.cardCount); break;
      case 'year-desc': result.sort((a, b) => b.year - a.year || b.cardCount - a.cardCount); break;
    }

    return result;
  }, [sportFilter, sortBy]);

  const selectedSetCards = useMemo(() => {
    if (!selectedSet) return [];
    return sportsCards
      .filter(c => c.set === selectedSet)
      .sort((a, b) => {
        const aNum = parseInt(a.cardNumber || '0', 10);
        const bNum = parseInt(b.cardNumber || '0', 10);
        return aNum - bNum;
      });
  }, [selectedSet]);

  const selectedSetInfo = sets.find(s => s.name === selectedSet);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Browse Sets</h2>
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-2 block">Sport</label>
            <div className="flex flex-wrap gap-2">
              {['all', 'baseball', 'basketball', 'football', 'hockey'].map(s => (
                <button
                  key={s}
                  onClick={() => { setSportFilter(s); setSelectedSet(null); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    sportFilter === s
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
                  }`}
                >
                  {s === 'all' ? 'All Sports' : `${sportIcons[s]} ${s.charAt(0).toUpperCase() + s.slice(1)}`}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-2 block">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="year-desc">Newest First</option>
              <option value="cost-asc">Cheapest to Complete</option>
              <option value="cost-desc">Most Expensive</option>
              <option value="cards-desc">Most Cards</option>
            </select>
          </div>
        </div>
      </div>

      {/* Set grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sets.map(set => (
          <button
            key={set.name}
            onClick={() => setSelectedSet(set.name === selectedSet ? null : set.name)}
            className={`text-left p-4 rounded-xl border transition-all ${
              selectedSet === set.name
                ? 'border-emerald-500 bg-emerald-950/20 ring-1 ring-emerald-500/30'
                : 'border-gray-800 bg-gray-900 hover:border-gray-600'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="text-xs text-gray-500">{sportIcons[set.sport]} {set.year}</span>
              <span className="text-xs text-gray-500">{set.cardCount} cards</span>
            </div>
            <h3 className="text-white font-semibold text-sm mb-2 leading-tight">{set.name}</h3>
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-gray-500 text-xs">Est. cost to complete</p>
                <p className="text-emerald-400 font-bold text-lg">${set.totalCostMid.toLocaleString()}</p>
              </div>
              {set.rookieCount > 0 && (
                <span className="text-xs bg-amber-900/30 text-amber-400 px-2 py-0.5 rounded-full">
                  {set.rookieCount} RC{set.rookieCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {sets.length === 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
          <p className="text-gray-400">No sets with 3+ cards found for this filter.</p>
        </div>
      )}

      {/* Selected set detail */}
      {selectedSet && selectedSetInfo && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">{selectedSetInfo.name}</h3>
              <p className="text-gray-400 text-sm">
                {sportIcons[selectedSetInfo.sport]} {selectedSetInfo.year} &middot; {selectedSetInfo.cardCount} cards in database &middot; {selectedSetInfo.rookieCount} rookies
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-gray-500 text-xs">Est. Total Cost</p>
              <p className="text-emerald-400 font-bold text-xl">${selectedSetInfo.totalCostMid.toLocaleString()}</p>
              <p className="text-gray-600 text-xs">${selectedSetInfo.totalCostLow.toLocaleString()} low estimate</p>
            </div>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Avg per card</p>
              <p className="text-white font-bold">${Math.round(selectedSetInfo.totalCostMid / selectedSetInfo.cardCount).toLocaleString()}</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Cheapest</p>
              <p className="text-white font-bold">${selectedSetInfo.cheapestCard.value.toLocaleString()}</p>
              <p className="text-gray-600 text-xs truncate">{selectedSetInfo.cheapestCard.player}</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Most Expensive</p>
              <p className="text-white font-bold">${selectedSetInfo.mostExpensive.value.toLocaleString()}</p>
              <p className="text-gray-600 text-xs truncate">{selectedSetInfo.mostExpensive.player}</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Rookies</p>
              <p className="text-white font-bold">{selectedSetInfo.rookieCount}</p>
            </div>
          </div>

          {/* Card checklist */}
          <h4 className="text-white font-semibold text-sm mb-3">Card Checklist</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left text-gray-400 font-medium py-2 px-3">#</th>
                  <th className="text-left text-gray-400 font-medium py-2 px-3">Player</th>
                  <th className="text-left text-gray-400 font-medium py-2 px-3 hidden sm:table-cell">Type</th>
                  <th className="text-right text-gray-400 font-medium py-2 px-3">Raw Value</th>
                  <th className="text-right text-gray-400 font-medium py-2 px-3">Gem Value</th>
                </tr>
              </thead>
              <tbody>
                {selectedSetCards.map(card => (
                  <tr key={card.slug} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="py-2 px-3 text-gray-500 text-xs">{card.cardNumber || '—'}</td>
                    <td className="py-2 px-3">
                      <Link href={`/sports/${card.slug}`} className="text-white hover:text-emerald-400 font-medium text-sm transition-colors">
                        {card.player}
                      </Link>
                      {card.rookie && (
                        <span className="ml-1.5 text-xs bg-amber-900/30 text-amber-400 px-1 py-0.5 rounded">RC</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-gray-500 text-xs hidden sm:table-cell">
                      {card.rookie ? 'Rookie' : 'Base'}
                    </td>
                    <td className="py-2 px-3 text-right text-gray-300 text-xs">{card.estimatedValueRaw}</td>
                    <td className="py-2 px-3 text-right text-emerald-400 text-xs">{card.estimatedValueGem}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-gray-600 text-xs mt-4">
            * This shows cards in our database for this set. Actual set checklists may contain more cards. Values are estimates based on market data.
          </p>
        </div>
      )}
    </div>
  );
}
