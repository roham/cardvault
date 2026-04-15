'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { sportsCards, type SportsCard } from '@/data/sports-cards';
import {
  getWallet,
  getVaultCards,
  getTransactions,
  buybackCards,
  type VaultCard,
  type MockWallet,
} from '@/lib/vault';

// ── Helpers ──────────────────────────────────────────────────────────

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

// ── Types ────────────────────────────────────────────────────────────

type SortBy = 'value-high' | 'value-low' | 'best-deal' | 'newest' | 'sport';
type View = 'select' | 'confirm' | 'success';

interface EnrichedVaultCard {
  vault: VaultCard;
  card: SportsCard;
  value: number;
  buybackValue: number;
  profit: number;
  key: string; // unique key for selection (slug + index)
}

// ── Component ────────────────────────────────────────────────────────

export default function BuybackClient() {
  const [mounted, setMounted] = useState(false);
  const [wallet, setWallet] = useState<MockWallet | null>(null);
  const [vaultCards, setVaultCards] = useState<VaultCard[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [view, setView] = useState<View>('select');
  const [sortBy, setSortBy] = useState<SortBy>('value-high');
  const [filterSport, setFilterSport] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [successData, setSuccessData] = useState<{ totalCredit: number; count: number; results: { name: string; credit: number }[] } | null>(null);

  useEffect(() => {
    setMounted(true);
    setWallet(getWallet());
    setVaultCards(getVaultCards());
  }, []);

  // Enrich vault cards
  const enriched = useMemo(() => {
    const cardMap = new Map(sportsCards.map(c => [c.slug, c]));
    return vaultCards
      .map((vc, i) => {
        const card = cardMap.get(vc.slug);
        if (!card) return null;
        const value = parseValue(card.estimatedValueRaw);
        const buybackValue = Math.round(value * 0.9 * 100) / 100;
        const profit = buybackValue - vc.pricePaid;
        const key = `${vc.slug}-${i}`;
        return { vault: vc, card, value, buybackValue, profit, key } as EnrichedVaultCard;
      })
      .filter((c): c is EnrichedVaultCard => c !== null);
  }, [vaultCards]);

  // Filter and sort
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
      case 'value-high': result.sort((a, b) => b.buybackValue - a.buybackValue); break;
      case 'value-low': result.sort((a, b) => a.buybackValue - b.buybackValue); break;
      case 'best-deal': result.sort((a, b) => b.profit - a.profit); break;
      case 'newest': result.sort((a, b) => new Date(b.vault.acquiredAt).getTime() - new Date(a.vault.acquiredAt).getTime()); break;
      case 'sport': result.sort((a, b) => a.card.sport.localeCompare(b.card.sport) || b.buybackValue - a.buybackValue); break;
    }
    return result;
  }, [enriched, filterSport, searchQuery, sortBy]);

  // Selection summary
  const summary = useMemo(() => {
    const selectedCards = enriched.filter(e => selected.has(e.key));
    const totalBuyback = selectedCards.reduce((sum, e) => sum + e.buybackValue, 0);
    const totalPaid = selectedCards.reduce((sum, e) => sum + e.vault.pricePaid, 0);
    const totalProfit = totalBuyback - totalPaid;
    return { count: selectedCards.length, totalBuyback, totalPaid, totalProfit, cards: selectedCards };
  }, [enriched, selected]);

  const toggleCard = useCallback((key: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    if (selected.size === displayed.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(displayed.map(e => e.key)));
    }
  }, [displayed, selected.size]);

  const handleConfirmSell = useCallback(() => {
    const slugs = summary.cards.map(e => e.vault.slug);
    const result = buybackCards(slugs);
    if (result.success) {
      setSuccessData({
        totalCredit: result.totalCredit,
        count: result.results.length,
        results: result.results.map(r => ({ name: r.name, credit: r.credit })),
      });
      setView('success');
      setSelected(new Set());
      setWallet(getWallet());
      setVaultCards(getVaultCards());
    }
  }, [summary.cards]);

  const handleReset = useCallback(() => {
    setView('select');
    setSuccessData(null);
  }, []);

  if (!mounted) {
    return <div className="text-center py-20 text-gray-500">Loading buyback...</div>;
  }

  // ── Success View ───────────────────────────────────────────────────
  if (view === 'success' && successData) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12 bg-gray-900 border border-emerald-800/50 rounded-2xl">
          <div className="text-5xl mb-4">&#x1F4B0;</div>
          <h2 className="text-3xl font-bold text-white mb-2">Cards Sold!</h2>
          <p className="text-emerald-400 text-4xl font-bold mb-2">+{formatCurrency(successData.totalCredit)}</p>
          <p className="text-gray-400">{successData.count} card{successData.count > 1 ? 's' : ''} sold at 90% fair market value</p>
          <p className="text-gray-500 text-sm mt-2">Credits added to your wallet balance</p>
        </div>

        {/* Sold cards list */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-800">
            <h3 className="text-white font-semibold">Sale Receipt</h3>
          </div>
          <div className="divide-y divide-gray-800/50">
            {successData.results.map((r, i) => (
              <div key={i} className="px-5 py-3 flex items-center justify-between">
                <span className="text-gray-300 text-sm truncate mr-4">{r.name}</span>
                <span className="text-emerald-400 font-medium text-sm whitespace-nowrap">+{formatCurrency(r.credit)}</span>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 border-t border-gray-700 bg-gray-800/50 flex items-center justify-between">
            <span className="text-white font-semibold">Total</span>
            <span className="text-emerald-400 font-bold text-lg">+{formatCurrency(successData.totalCredit)}</span>
          </div>
        </div>

        {/* New balance */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Updated Balance</p>
          <p className="text-3xl font-bold text-emerald-400">{formatCurrency(wallet?.balance || 0)}</p>
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <button onClick={handleReset}
            className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-medium transition-colors border border-gray-700">
            Sell More Cards
          </button>
          <Link href="/vault"
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-6 py-3 rounded-xl font-medium transition-colors border border-gray-700">
            Back to Vault
          </Link>
          <Link href="/packs"
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-medium transition-colors">
            Open More Packs
          </Link>
        </div>
      </div>
    );
  }

  // ── Confirm View ───────────────────────────────────────────────────
  if (view === 'confirm') {
    return (
      <div className="space-y-6">
        <div className="bg-gray-900 border border-amber-800/50 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-1">Confirm Sale</h2>
          <p className="text-gray-400 text-sm">You are about to sell {summary.count} card{summary.count > 1 ? 's' : ''} at 90% of fair market value. This cannot be undone.</p>
        </div>

        {/* Cards to sell */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-800 flex items-center justify-between">
            <h3 className="text-white font-semibold">Cards to Sell ({summary.count})</h3>
            <span className="text-xs text-gray-500">90% FMV buyback rate</span>
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-800/50">
            {summary.cards.map(e => {
              const rarity = getRarityLabel(e.value);
              return (
                <div key={e.key} className="px-5 py-3 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${rarity.bg} ${rarity.color}`}>{rarity.label}</span>
                      <span className="text-xs text-gray-500">{e.card.sport}</span>
                    </div>
                    <p className="text-white text-sm font-medium truncate">{e.card.name}</p>
                    <p className="text-gray-500 text-xs">{e.card.player} &middot; {e.card.year}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-gray-500 text-xs line-through">{e.card.estimatedValueRaw}</p>
                    <p className="text-emerald-400 font-bold text-sm">{formatCurrency(e.buybackValue)}</p>
                    <p className={`text-xs ${e.profit >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                      {e.profit >= 0 ? '+' : ''}{formatCurrency(e.profit)} P&L
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">You Paid</p>
              <p className="text-white font-bold">{formatCurrency(summary.totalPaid)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">You Get</p>
              <p className="text-emerald-400 font-bold text-lg">{formatCurrency(summary.totalBuyback)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Net P&L</p>
              <p className={`font-bold ${summary.totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {summary.totalProfit >= 0 ? '+' : ''}{formatCurrency(summary.totalProfit)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => setView('select')}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 px-6 py-3 rounded-xl font-medium transition-colors border border-gray-700">
            Go Back
          </button>
          <button onClick={handleConfirmSell}
            className="flex-1 bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-xl font-bold transition-colors">
            Sell {summary.count} Card{summary.count > 1 ? 's' : ''} for {formatCurrency(summary.totalBuyback)}
          </button>
        </div>
      </div>
    );
  }

  // ── Select View (main) ─────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Wallet summary */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Balance</p>
            <p className="text-xl font-bold text-emerald-400">{formatCurrency(wallet?.balance || 0)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Vault Cards</p>
            <p className="text-xl font-bold text-white">{enriched.length}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Earned</p>
            <p className="text-xl font-bold text-emerald-400">{formatCurrency(wallet?.totalEarned || 0)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Buyback Rate</p>
            <p className="text-xl font-bold text-white">90%</p>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {enriched.length === 0 ? (
        <div className="text-center py-16 bg-gray-900/50 border border-gray-800 rounded-2xl">
          <p className="text-3xl mb-3">&#x1F4E6;</p>
          <p className="text-gray-400 text-lg mb-2">No cards to sell</p>
          <p className="text-gray-500 text-sm mb-6">Open packs first to build your collection</p>
          <Link href="/packs" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-medium transition-colors">
            Open Pack Store
          </Link>
        </div>
      ) : (
        <>
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text" placeholder="Search cards..." value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 w-44 focus:outline-none focus:border-emerald-600"
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
              <option value="value-high">Highest Value</option>
              <option value="value-low">Lowest Value</option>
              <option value="best-deal">Best Deal (Profit)</option>
              <option value="newest">Newest First</option>
              <option value="sport">By Sport</option>
            </select>
            <button onClick={selectAll}
              className="ml-auto text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-2 rounded-lg border border-gray-700 transition-colors">
              {selected.size === displayed.length && displayed.length > 0 ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          {/* How it works banner */}
          <div className="bg-emerald-950/30 border border-emerald-900/50 rounded-xl px-5 py-3">
            <p className="text-emerald-400 text-sm font-medium mb-1">How Buyback Works</p>
            <p className="text-gray-400 text-xs">Select cards below and sell them back at 90% of fair market value. Credits are instantly added to your wallet. Select multiple cards for a batch sale.</p>
          </div>

          {/* Card grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {displayed.map(e => {
              const rarity = getRarityLabel(e.value);
              const isSelected = selected.has(e.key);
              return (
                <button
                  key={e.key}
                  onClick={() => toggleCard(e.key)}
                  className={`text-left bg-gray-900 border rounded-xl overflow-hidden transition-all ${
                    isSelected
                      ? 'border-emerald-500 ring-1 ring-emerald-500/50 bg-emerald-950/10'
                      : 'border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-emerald-600 border-emerald-500' : 'border-gray-600'
                        }`}>
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${rarity.bg} ${rarity.color}`}>{rarity.label}</span>
                      </div>
                      <span className="text-xs text-gray-500">{e.card.sport}</span>
                    </div>
                    <h3 className="text-white font-semibold text-sm mb-0.5 line-clamp-2">{e.card.name}</h3>
                    <p className="text-gray-500 text-xs mb-3">{e.card.player} &middot; {e.card.year}</p>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs text-gray-500">FMV</p>
                        <p className="text-gray-400 text-sm">{e.card.estimatedValueRaw}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">You Get (90%)</p>
                        <p className="text-emerald-400 font-bold">{formatCurrency(e.buybackValue)}</p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-gray-600">Paid: {formatCurrency(e.vault.pricePaid)}</span>
                      <span className={`text-xs font-medium ${e.profit >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                        {e.profit >= 0 ? '+' : ''}{formatCurrency(e.profit)} P&L
                      </span>
                    </div>
                    {e.card.rookie && <span className="inline-block mt-2 text-[10px] font-bold text-amber-400 bg-amber-950/50 border border-amber-800/50 px-2 py-0.5 rounded">RC</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Sticky bottom bar */}
      {selected.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-md border-t border-gray-800 px-4 py-4 z-50">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-white font-bold text-sm">{summary.count} card{summary.count > 1 ? 's' : ''} selected</p>
                <p className="text-gray-400 text-xs">Total: {formatCurrency(summary.totalBuyback)}</p>
              </div>
              <div className={`text-sm font-medium ${summary.totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {summary.totalProfit >= 0 ? '+' : ''}{formatCurrency(summary.totalProfit)} P&L
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setSelected(new Set())}
                className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-2 rounded-lg border border-gray-700 transition-colors">
                Clear
              </button>
              <button onClick={() => setView('confirm')}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors">
                Sell for {formatCurrency(summary.totalBuyback)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Spacer when sticky bar is visible */}
      {selected.size > 0 && <div className="h-20" />}
    </div>
  );
}
