'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';

interface PackOpen {
  id: string;
  packName: string;
  packType: string;
  date: string;
  cards: { name: string; value: number; rarity: string }[];
  totalValue: number;
  packCost: number;
}

const RARITY_COLORS: Record<string, string> = {
  common: 'bg-zinc-700 text-zinc-300',
  uncommon: 'bg-blue-900/60 text-blue-400',
  rare: 'bg-purple-900/60 text-purple-400',
  epic: 'bg-amber-900/60 text-amber-400',
  legendary: 'bg-red-900/60 text-red-400',
};

// Generate demo history from deterministic seed
function generateDemoHistory(): PackOpen[] {
  const packs = [
    'Topps Chrome Hobby', 'Panini Prizm Basketball', 'Prizm Football', 'Upper Deck Hockey',
    'Topps Series 1', 'Donruss Optic', 'Select Football', 'Bowman Chrome',
  ];
  const packTypes = ['hobby', 'hobby', 'blaster', 'hobby', 'retail', 'hobby', 'hobby', 'hobby'];
  const cardNames = [
    'Base Chrome Auto', 'Prizm Silver Parallel', 'Refractor /250', 'Young Guns RC', 'Base Card',
    'Color Blast Insert', 'Gold Parallel /50', 'Rookie Auto Patch', 'Base Prizm', 'Downtown Insert',
    'Numbered /199', 'Mojo Refractor', 'Orange Parallel', 'Canvas Insert', 'Purple Prizm',
  ];
  const rarities = ['common', 'common', 'common', 'uncommon', 'uncommon', 'rare', 'rare', 'epic', 'legendary'];

  const history: PackOpen[] = [];
  let seed = 42;
  const rng = () => { seed = (seed * 1664525 + 1013904223) & 0x7fffffff; return seed / 0x7fffffff; };

  for (let i = 0; i < 25; i++) {
    const packIdx = Math.floor(rng() * packs.length);
    const cardCount = 5 + Math.floor(rng() * 8);
    const cards: PackOpen['cards'] = [];
    let totalValue = 0;

    for (let j = 0; j < cardCount; j++) {
      const rarityIdx = Math.floor(rng() * rarities.length);
      const rarity = rarities[rarityIdx];
      const value = rarity === 'legendary' ? 50 + Math.floor(rng() * 200) :
                    rarity === 'epic' ? 20 + Math.floor(rng() * 60) :
                    rarity === 'rare' ? 8 + Math.floor(rng() * 20) :
                    rarity === 'uncommon' ? 3 + Math.floor(rng() * 8) :
                    1 + Math.floor(rng() * 3);
      totalValue += value;
      cards.push({
        name: cardNames[Math.floor(rng() * cardNames.length)],
        value,
        rarity,
      });
    }

    const daysAgo = Math.floor(rng() * 30);
    const date = new Date(Date.now() - daysAgo * 86400000).toISOString().split('T')[0];
    const packCost = packTypes[packIdx] === 'hobby' ? 15 + Math.floor(rng() * 30) : 8 + Math.floor(rng() * 15);

    history.push({
      id: `pack-${i}`,
      packName: packs[packIdx],
      packType: packTypes[packIdx],
      date,
      cards: cards.sort((a, b) => b.value - a.value),
      totalValue,
      packCost,
    });
  }

  return history.sort((a, b) => b.date.localeCompare(a.date));
}

export default function VaultHistory() {
  const [history] = useState(generateDemoHistory);
  const [filter, setFilter] = useState<string>('all');
  const [expandedPack, setExpandedPack] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filter === 'all') return history;
    if (filter === 'profit') return history.filter(h => h.totalValue >= h.packCost);
    if (filter === 'loss') return history.filter(h => h.totalValue < h.packCost);
    return history.filter(h => h.packType === filter);
  }, [history, filter]);

  const stats = useMemo(() => {
    const totalSpent = history.reduce((s, h) => s + h.packCost, 0);
    const totalValue = history.reduce((s, h) => s + h.totalValue, 0);
    const totalCards = history.reduce((s, h) => s + h.cards.length, 0);
    const bestPull = history.reduce((best, h) => {
      const max = h.cards.reduce((m, c) => c.value > m.value ? c : m, { name: '', value: 0, rarity: '' });
      return max.value > best.value ? max : best;
    }, { name: '', value: 0, rarity: '' });
    const hitRate = history.reduce((s, h) => s + h.cards.filter(c => c.rarity === 'epic' || c.rarity === 'legendary').length, 0) / totalCards * 100;

    return { totalSpent, totalValue, totalCards, bestPull, hitRate, packsOpened: history.length };
  }, [history]);

  return (
    <div className="space-y-8">
      {/* Stats overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Packs Opened', value: stats.packsOpened.toString(), color: 'text-white' },
          { label: 'Total Spent', value: `$${stats.totalSpent}`, color: 'text-white' },
          { label: 'Total Value', value: `$${stats.totalValue}`, color: stats.totalValue >= stats.totalSpent ? 'text-emerald-400' : 'text-red-400' },
          { label: 'Net P&L', value: `${stats.totalValue >= stats.totalSpent ? '+' : ''}$${stats.totalValue - stats.totalSpent}`, color: stats.totalValue >= stats.totalSpent ? 'text-emerald-400' : 'text-red-400' },
          { label: 'Total Cards', value: stats.totalCards.toString(), color: 'text-white' },
          { label: 'Hit Rate', value: `${stats.hitRate.toFixed(1)}%`, color: 'text-amber-400' },
        ].map(s => (
          <div key={s.label} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 text-center">
            <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-xs text-zinc-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Best pull */}
      {stats.bestPull.name && (
        <div className="bg-gradient-to-r from-amber-950/40 to-amber-900/20 border border-amber-800/50 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-amber-400 uppercase tracking-wider font-semibold">Best Pull Ever</div>
            <div className="text-lg font-bold text-white mt-1">{stats.bestPull.name}</div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${RARITY_COLORS[stats.bestPull.rarity] || RARITY_COLORS.common}`}>
              {stats.bestPull.rarity}
            </span>
          </div>
          <div className="text-2xl font-black text-amber-400">${stats.bestPull.value}</div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'all', label: 'All Packs' },
          { id: 'profit', label: 'Profitable' },
          { id: 'loss', label: 'Losses' },
          { id: 'hobby', label: 'Hobby' },
          { id: 'blaster', label: 'Blaster' },
          { id: 'retail', label: 'Retail' },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f.id ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Pack history list */}
      <div className="space-y-3">
        {filtered.map(pack => {
          const isExpanded = expandedPack === pack.id;
          const profit = pack.totalValue - pack.packCost;
          const isProfitable = profit >= 0;

          return (
            <div key={pack.id} className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedPack(isExpanded ? null : pack.id)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-zinc-800/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-10 rounded-full ${isProfitable ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  <div>
                    <div className="text-sm font-semibold text-white">{pack.packName}</div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                      <span>{pack.date}</span>
                      <span className="capitalize px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">{pack.packType}</span>
                      <span>{pack.cards.length} cards</span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex items-center gap-4">
                  <div>
                    <div className="text-sm font-bold text-white">${pack.totalValue}</div>
                    <div className={`text-xs font-semibold ${isProfitable ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isProfitable ? '+' : ''}{((profit / pack.packCost) * 100).toFixed(0)}% ROI
                    </div>
                  </div>
                  <span className={`text-zinc-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-zinc-800/50">
                  <div className="flex items-center justify-between text-xs text-zinc-500 py-2">
                    <span>Pack cost: ${pack.packCost}</span>
                    <span className={isProfitable ? 'text-emerald-400' : 'text-red-400'}>
                      Net: {isProfitable ? '+' : ''}${profit}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {pack.cards.map((card, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-zinc-800/30 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${RARITY_COLORS[card.rarity] || RARITY_COLORS.common}`}>
                            {card.rarity}
                          </span>
                          <span className="text-sm text-zinc-300">{card.name}</span>
                        </div>
                        <span className="text-sm font-bold text-zinc-400">${card.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-12 text-zinc-500">
          <p className="text-lg">No packs match this filter</p>
          <button onClick={() => setFilter('all')} className="text-emerald-400 text-sm mt-2 hover:underline">Show all</button>
        </div>
      )}

      {/* Related */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
        <h2 className="text-lg font-bold text-white mb-3">Open More Packs</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { href: '/packs', label: 'Pack Store', desc: 'Buy and open packs', icon: '🎁' },
            { href: '/tools/pack-sim', label: 'Pack Simulator', desc: 'Free pack rips', icon: '🎰' },
            { href: '/tools/daily-pack', label: 'Daily Free Pack', desc: 'One free pack per day', icon: '📅' },
          ].map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/40 hover:bg-zinc-800/60 transition-colors"
            >
              <span className="text-2xl">{link.icon}</span>
              <div>
                <span className="text-sm font-medium text-white">{link.label}</span>
                <p className="text-xs text-zinc-500">{link.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
