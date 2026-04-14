'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { sportsCards, type SportsCard } from '@/data/sports-cards';
import {
  getWallet,
  getVaultCards,
  getTransactions,
  buybackCard,
  type VaultCard,
  type MockWallet,
  type Transaction,
} from '@/lib/vault';

function parseValue(v: string): number {
  const m = v.match(/\$([\d,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
}

function formatCurrency(n: number): string {
  return '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function getRarityLabel(value: number): { label: string; color: string; bg: string } {
  if (value >= 5000) return { label: 'LEGENDARY', color: 'text-yellow-300', bg: 'bg-yellow-500/20 border-yellow-500/50' };
  if (value >= 1000) return { label: 'ULTRA RARE', color: 'text-red-300', bg: 'bg-red-500/20 border-red-500/50' };
  if (value >= 200) return { label: 'RARE', color: 'text-purple-300', bg: 'bg-purple-500/20 border-purple-500/50' };
  if (value >= 50) return { label: 'UNCOMMON', color: 'text-blue-300', bg: 'bg-blue-500/20 border-blue-500/50' };
  return { label: 'COMMON', color: 'text-gray-400', bg: 'bg-gray-700/30 border-gray-600/50' };
}

type SortBy = 'newest' | 'oldest' | 'value-high' | 'value-low' | 'sport' | 'player';
type Tab = 'cards' | 'stats' | 'history';

interface EnrichedVaultCard {
  vault: VaultCard;
  card: SportsCard;
  value: number;
}

export default function VaultClient() {
  const [mounted, setMounted] = useState(false);
  const [wallet, setWallet] = useState<MockWallet | null>(null);
  const [vaultCards, setVaultCards] = useState<VaultCard[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tab, setTab] = useState<Tab>('cards');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [filterSport, setFilterSport] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sellConfirm, setSellConfirm] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    setWallet(getWallet());
    setVaultCards(getVaultCards());
    setTransactions(getTransactions());
  }, []);

  // Enrich vault cards with full card data
  const enriched = useMemo(() => {
    const cardMap = new Map(sportsCards.map(c => [c.slug, c]));
    return vaultCards
      .map(vc => {
        const card = cardMap.get(vc.slug);
        if (!card) return null;
        return { vault: vc, card, value: parseValue(card.estimatedValueRaw) } as EnrichedVaultCard;
      })
      .filter((c): c is EnrichedVaultCard => c !== null);
  }, [vaultCards]);

  // Filtered and sorted
  const displayed = useMemo(() => {
    let result = [...enriched];
    if (filterSport !== 'all') result = result.filter(e => e.card.sport === filterSport);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(e =>
        e.card.player.toLowerCase().includes(q) ||
        e.card.name.toLowerCase().includes(q) ||
        e.card.set.toLowerCase().includes(q)
      );
    }
    switch (sortBy) {
      case 'newest': result.sort((a, b) => new Date(b.vault.acquiredAt).getTime() - new Date(a.vault.acquiredAt).getTime()); break;
      case 'oldest': result.sort((a, b) => new Date(a.vault.acquiredAt).getTime() - new Date(b.vault.acquiredAt).getTime()); break;
      case 'value-high': result.sort((a, b) => b.value - a.value); break;
      case 'value-low': result.sort((a, b) => a.value - b.value); break;
      case 'sport': result.sort((a, b) => a.card.sport.localeCompare(b.card.sport) || b.value - a.value); break;
      case 'player': result.sort((a, b) => a.card.player.localeCompare(b.card.player)); break;
    }
    return result;
  }, [enriched, filterSport, searchQuery, sortBy]);

  // Stats
  const stats = useMemo(() => {
    const totalValue = enriched.reduce((sum, e) => sum + e.value, 0);
    const totalPaid = enriched.reduce((sum, e) => sum + e.vault.pricePaid, 0);
    const sports = new Set(enriched.map(e => e.card.sport));
    const players = new Set(enriched.map(e => e.card.player));
    const rookies = enriched.filter(e => e.card.rookie).length;
    const topCard = [...enriched].sort((a, b) => b.value - a.value)[0];
    const bySource: Record<string, number> = {};
    enriched.forEach(e => { bySource[e.vault.acquiredFrom] = (bySource[e.vault.acquiredFrom] || 0) + 1; });
    return { totalValue, totalPaid, pnl: totalValue - totalPaid, sports: sports.size, players: players.size, rookies, topCard, bySource };
  }, [enriched]);

  function handleSellBack(slug: string) {
    const result = buybackCard(slug);
    if (result.success) {
      setWallet(getWallet());
      setVaultCards(getVaultCards());
      setTransactions(getTransactions());
      setSellConfirm(null);
    }
  }

  if (!mounted) {
    return <div className="text-center py-20 text-gray-500">Loading vault...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Wallet bar */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Balance</p>
            <p className="text-2xl font-bold text-emerald-400">{formatCurrency(wallet?.balance || 0)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Vault Value</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalValue)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total P&L</p>
            <p className={`text-2xl font-bold ${stats.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {stats.pnl >= 0 ? '+' : ''}{formatCurrency(stats.pnl)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Cards</p>
            <p className="text-2xl font-bold text-white">{enriched.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-800 pb-1">
        {(['cards', 'stats', 'history'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${tab === t ? 'bg-gray-800 text-white border-b-2 border-emerald-500' : 'text-gray-500 hover:text-gray-300'}`}>
            {t === 'cards' ? `Cards (${enriched.length})` : t === 'stats' ? 'Stats' : 'History'}
          </button>
        ))}
      </div>

      {/* Cards Tab */}
      {tab === 'cards' && (
        <>
          {/* Controls */}
          <div className="flex flex-wrap gap-3">
            <input
              type="text" placeholder="Search cards..." value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 w-48 focus:outline-none focus:border-emerald-600"
            />
            <select value={filterSport} onChange={e => setFilterSport(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white">
              <option value="all">All Sports</option>
              <option value="baseball">Baseball</option>
              <option value="basketball">Basketball</option>
              <option value="football">Football</option>
              <option value="hockey">Hockey</option>
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value as SortBy)}
              className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="value-high">Value: High to Low</option>
              <option value="value-low">Value: Low to High</option>
              <option value="sport">By Sport</option>
              <option value="player">By Player</option>
            </select>
          </div>

          {/* Card Grid */}
          {displayed.length === 0 ? (
            <div className="text-center py-16 bg-gray-900/50 border border-gray-800 rounded-2xl">
              <p className="text-3xl mb-3">📦</p>
              <p className="text-gray-400 text-lg mb-2">Your vault is empty</p>
              <p className="text-gray-500 text-sm mb-6">Open packs to start building your collection</p>
              <Link href="/packs" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-medium transition-colors">
                Open Pack Store
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayed.map((e, i) => {
                const rarity = getRarityLabel(e.value);
                const buybackValue = Math.round(e.value * 0.9);
                const isSelling = sellConfirm === e.vault.slug + '-' + i;
                return (
                  <div key={e.vault.slug + '-' + i} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-colors">
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${rarity.bg} ${rarity.color}`}>{rarity.label}</span>
                        <span className="text-xs text-gray-500">{e.card.sport}</span>
                      </div>
                      <Link href={`/sports/${e.card.slug}`} className="block group">
                        <h3 className="text-white font-semibold text-sm group-hover:text-emerald-400 transition-colors mb-1 line-clamp-2">{e.card.name}</h3>
                      </Link>
                      <p className="text-gray-500 text-xs mb-3">{e.card.player} &middot; {e.card.year}</p>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-xs text-gray-500">Est. Value</p>
                          <p className="text-white font-bold">{e.card.estimatedValueRaw}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Paid</p>
                          <p className="text-gray-400 text-sm">{formatCurrency(e.vault.pricePaid)}</p>
                        </div>
                      </div>
                      {e.card.rookie && <span className="inline-block mt-2 text-[10px] font-bold text-amber-400 bg-amber-950/50 border border-amber-800/50 px-2 py-0.5 rounded">RC</span>}
                    </div>
                    <div className="border-t border-gray-800 px-4 py-3 flex gap-2">
                      {isSelling ? (
                        <>
                          <button onClick={() => handleSellBack(e.vault.slug)}
                            className="flex-1 text-xs bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-lg font-medium transition-colors">
                            Confirm ({formatCurrency(buybackValue)})
                          </button>
                          <button onClick={() => setSellConfirm(null)}
                            className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition-colors">
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <Link href={`/sports/${e.card.slug}`}
                            className="flex-1 text-xs text-center bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition-colors">
                            View Card
                          </Link>
                          <button onClick={() => setSellConfirm(e.vault.slug + '-' + i)}
                            className="flex-1 text-xs bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-800/50 transition-colors">
                            Sell Back (90%)
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Stats Tab */}
      {tab === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: 'Total Cards', value: enriched.length.toString(), icon: '🃏' },
              { label: 'Unique Players', value: stats.players.toString(), icon: '👤' },
              { label: 'Sports', value: stats.sports.toString(), icon: '🏆' },
              { label: 'Rookies', value: stats.rookies.toString(), icon: '⭐' },
              { label: 'Vault Value', value: formatCurrency(stats.totalValue), icon: '💎' },
              { label: 'Net P&L', value: `${stats.pnl >= 0 ? '+' : ''}${formatCurrency(stats.pnl)}`, icon: stats.pnl >= 0 ? '📈' : '📉' },
            ].map(s => (
              <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <p className="text-2xl mb-1">{s.icon}</p>
                <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                <p className="text-white font-bold text-lg">{s.value}</p>
              </div>
            ))}
          </div>

          {stats.topCard && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-3">Most Valuable Card</h3>
              <Link href={`/sports/${stats.topCard.card.slug}`} className="text-emerald-400 hover:underline font-medium">
                {stats.topCard.card.name}
              </Link>
              <p className="text-gray-400 text-sm mt-1">{stats.topCard.card.estimatedValueRaw} &middot; {stats.topCard.card.player}</p>
            </div>
          )}

          {/* Sport breakdown */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-3">By Sport</h3>
            <div className="space-y-2">
              {['baseball', 'basketball', 'football', 'hockey'].map(sport => {
                const count = enriched.filter(e => e.card.sport === sport).length;
                const total = enriched.length || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={sport} className="flex items-center gap-3">
                    <span className="text-sm text-gray-400 w-24 capitalize">{sport}</span>
                    <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-sm text-gray-500 w-16 text-right">{count} ({pct}%)</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Acquisition source */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-3">Acquisition Source</h3>
            <div className="flex flex-wrap gap-3">
              {Object.entries(stats.bySource).map(([source, count]) => (
                <div key={source} className="bg-gray-800 rounded-lg px-3 py-2">
                  <p className="text-xs text-gray-500 capitalize">{source}</p>
                  <p className="text-white font-bold">{count}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* History Tab */}
      {tab === 'history' && (
        <div className="space-y-2">
          {transactions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">No transactions yet</p>
              <p className="text-sm">Open packs to see your transaction history</p>
            </div>
          ) : (
            transactions.slice(0, 50).map(tx => (
              <div key={tx.id} className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-lg px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    tx.amount > 0 ? 'bg-emerald-950/60 text-emerald-400' : 'bg-red-950/60 text-red-400'
                  }`}>
                    {tx.type === 'purchase' ? '📦' : tx.type === 'buyback' ? '💰' : tx.type === 'starter-bonus' ? '🎁' : '💳'}
                  </span>
                  <div>
                    <p className="text-white text-sm font-medium">{tx.description}</p>
                    <p className="text-gray-500 text-xs">{new Date(tx.timestamp).toLocaleString()}</p>
                  </div>
                </div>
                <span className={`font-bold text-sm ${tx.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Actions bar */}
      <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-800">
        <Link href="/packs" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
          Open Packs
        </Link>
        <Link href="/binder" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-5 py-2.5 rounded-xl text-sm font-medium border border-gray-700 transition-colors">
          Digital Binder
        </Link>
        <Link href="/showcase" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-5 py-2.5 rounded-xl text-sm font-medium border border-gray-700 transition-colors">
          Trophy Case
        </Link>
        <Link href="/tools/collection-value" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-5 py-2.5 rounded-xl text-sm font-medium border border-gray-700 transition-colors">
          Collection Value
        </Link>
      </div>
    </div>
  );
}
