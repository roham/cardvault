'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  STORE_PACKS,
  TIER_INFO,
  type StorePack,
  type PackTier,
  type MockWallet,
  getWallet,
  saveWallet,
  purchasePack,
  getVaultCards,
  getTransactions,
  type Transaction,
} from '@/lib/vault';
import type { SportsCard } from '@/data/sports-cards';
import CinematicReveal from '@/components/CinematicReveal';

function parseValue(v: string): number {
  const m = v.match(/\$([\d,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
}

function formatCurrency(n: number): string {
  return '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function getRarityLabel(value: number): { label: string; color: string; bg: string } {
  if (value >= 5000) return { label: 'LEGENDARY', color: 'text-yellow-300', bg: 'bg-yellow-500/20 border border-yellow-500/50' };
  if (value >= 1000) return { label: 'ULTRA RARE', color: 'text-red-300', bg: 'bg-red-500/20 border border-red-500/50' };
  if (value >= 200) return { label: 'RARE', color: 'text-purple-300', bg: 'bg-purple-500/20 border border-purple-500/50' };
  if (value >= 50) return { label: 'UNCOMMON', color: 'text-blue-300', bg: 'bg-blue-500/20 border border-blue-500/50' };
  return { label: 'COMMON', color: 'text-gray-400', bg: 'bg-gray-700/30 border border-gray-600/50' };
}

type ViewState = 'store' | 'confirm' | 'reveal' | 'results';

export default function PackStoreClient() {
  const [mounted, setMounted] = useState(false);
  const [wallet, setWallet] = useState<MockWallet | null>(null);
  const [filterTier, setFilterTier] = useState<PackTier | 'all'>('all');
  const [filterSport, setFilterSport] = useState<string>('all');
  const [view, setView] = useState<ViewState>('store');
  const [selectedPack, setSelectedPack] = useState<StorePack | null>(null);
  const [pulledCards, setPulledCards] = useState<SportsCard[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [vaultCount, setVaultCount] = useState(0);

  useEffect(() => {
    setMounted(true);
    const w = getWallet();
    setWallet(w);
    setVaultCount(getVaultCards().length);
    setTransactions(getTransactions().slice(0, 20));
  }, []);

  const filteredPacks = useMemo(() => {
    return STORE_PACKS.filter(p => {
      if (filterTier !== 'all' && p.tier !== filterTier) return false;
      if (filterSport !== 'all' && p.sport !== filterSport && p.sport !== 'mixed') return false;
      return true;
    });
  }, [filterTier, filterSport]);

  const handleBuy = useCallback((pack: StorePack) => {
    setSelectedPack(pack);
    setView('confirm');
  }, []);

  const handleConfirmPurchase = useCallback(() => {
    if (!selectedPack) return;
    const result = purchasePack(selectedPack);
    if (result.success) {
      setPulledCards(result.cards);
      setRevealedCount(0);
      setView('reveal');
      // Update wallet
      setWallet(getWallet());
      setVaultCount(getVaultCards().length);
      setTransactions(getTransactions().slice(0, 20));
      // Start reveal animation
      const interval = setInterval(() => {
        setRevealedCount(prev => {
          if (prev >= result.cards.length) {
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, 600);
    }
  }, [selectedPack]);

  const totalPullValue = useMemo(() => {
    return pulledCards.reduce((sum, c) => sum + parseValue(c.estimatedValueRaw), 0);
  }, [pulledCards]);

  if (!mounted || !wallet) {
    return (
      <div className="space-y-6">
        <div className="h-16 bg-gray-800/30 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-gray-800/30 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // ── Confirm Purchase Modal ──
  if (view === 'confirm' && selectedPack) {
    const tier = TIER_INFO[selectedPack.tier];
    const canAfford = wallet.balance >= selectedPack.price;
    return (
      <div className="max-w-lg mx-auto">
        <div className={`bg-gradient-to-br ${selectedPack.gradient} border ${selectedPack.borderColor} rounded-2xl p-6`}>
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">{selectedPack.icon}</div>
            <h2 className="text-xl font-bold text-white">{selectedPack.name}</h2>
            <div className={`inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded ${tier.bg} ${tier.border} ${tier.color}`}>
              {tier.label} Tier
            </div>
          </div>

          <div className="bg-gray-950/60 rounded-xl p-4 mb-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Cards per pack</span>
              <span className="text-white font-medium">{selectedPack.cardsPerPack}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Guaranteed</span>
              <span className="text-emerald-400 font-medium">{selectedPack.guaranteedRarity}</span>
            </div>
            {selectedPack.odds.map((o, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-400">{o.label}</span>
                <span className="text-gray-300">{o.chance}</span>
              </div>
            ))}
          </div>

          <div className="bg-gray-950/60 rounded-xl p-4 mb-6">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Pack price</span>
              <span className="text-white font-bold">{formatCurrency(selectedPack.price)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Your balance</span>
              <span className={canAfford ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>{formatCurrency(wallet.balance)}</span>
            </div>
            {canAfford && (
              <div className="flex justify-between text-sm mt-1 pt-1 border-t border-gray-800">
                <span className="text-gray-500">After purchase</span>
                <span className="text-gray-400">{formatCurrency(wallet.balance - selectedPack.price)}</span>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => { setView('store'); setSelectedPack(null); }}
              className="flex-1 py-3 rounded-xl bg-gray-800 text-gray-300 font-medium text-sm hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            {canAfford ? (
              <button
                onClick={handleConfirmPurchase}
                className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-500 transition-colors"
              >
                Buy &amp; Open — {formatCurrency(selectedPack.price)}
              </button>
            ) : (
              <div className="flex-1 py-3 rounded-xl bg-red-900/40 text-red-400 font-medium text-sm text-center border border-red-800/50">
                Insufficient balance
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Cinematic Reveal ──
  if (view === 'reveal' && pulledCards.length > 0 && selectedPack) {
    return (
      <div className="max-w-2xl mx-auto">
        <CinematicReveal
          cards={pulledCards}
          packName={selectedPack.name}
          packPrice={selectedPack.price}
          onComplete={() => { setView('store'); setSelectedPack(null); setPulledCards([]); }}
          onBuyAnother={wallet.balance >= selectedPack.price ? () => handleConfirmPurchase() : undefined}
        />
      </div>
    );
  }

  // ── Store View (default) ──
  return (
    <div>
      {/* Wallet bar */}
      <div className="flex flex-wrap items-center gap-4 bg-gray-900/60 border border-gray-800 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-900/40 border border-emerald-800/50 rounded-lg flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-emerald-400">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Balance</p>
            <p className="text-emerald-400 font-bold text-lg">{formatCurrency(wallet.balance)}</p>
          </div>
        </div>
        <div className="hidden sm:block h-8 w-px bg-gray-800" />
        <div className="flex gap-6">
          <div>
            <p className="text-gray-500 text-xs">Spent</p>
            <p className="text-gray-300 font-medium text-sm">{formatCurrency(wallet.totalSpent)}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Earned</p>
            <p className="text-gray-300 font-medium text-sm">{formatCurrency(wallet.totalEarned)}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Vault Cards</p>
            <p className="text-gray-300 font-medium text-sm">{vaultCount}</p>
          </div>
        </div>
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            {showHistory ? 'Hide History' : 'History'}
          </button>
          <button
            onClick={() => {
              const fresh: MockWallet = { balance: 250, totalSpent: 0, totalEarned: 0, createdAt: new Date().toISOString() };
              saveWallet(fresh);
              setWallet(fresh);
            }}
            className="text-xs text-gray-500 hover:text-red-400 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Transaction history */}
      {showHistory && transactions.length > 0 && (
        <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-4 mb-6">
          <h3 className="text-sm font-bold text-white mb-3">Recent Transactions</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {transactions.map(tx => (
              <div key={tx.id} className="flex items-center justify-between text-sm">
                <div className="min-w-0 flex-1">
                  <p className="text-gray-300 text-xs truncate">{tx.description}</p>
                  <p className="text-gray-600 text-xs">{new Date(tx.timestamp).toLocaleString()}</p>
                </div>
                <span className={`font-mono text-xs font-bold shrink-0 ml-3 ${tx.amount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {tx.amount >= 0 ? '+' : ''}{formatCurrency(Math.abs(tx.amount))}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex gap-1 bg-gray-900/60 border border-gray-800 rounded-lg p-1">
          {(['all', 'bronze', 'silver', 'gold', 'platinum'] as const).map(t => (
            <button
              key={t}
              onClick={() => setFilterTier(t)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filterTier === t
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {t === 'all' ? 'All Tiers' : TIER_INFO[t].label}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-gray-900/60 border border-gray-800 rounded-lg p-1">
          {['all', 'baseball', 'basketball', 'football', 'hockey'].map(s => (
            <button
              key={s}
              onClick={() => setFilterSport(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filterSport === s
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {s === 'all' ? 'All Sports' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Pack grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPacks.map(pack => {
          const tier = TIER_INFO[pack.tier];
          const canAfford = wallet.balance >= pack.price;
          return (
            <div
              key={pack.id}
              className={`relative bg-gradient-to-br ${pack.gradient} border ${pack.borderColor} rounded-2xl overflow-hidden transition-all hover:-translate-y-0.5`}
            >
              {/* Badges */}
              <div className="absolute top-3 right-3 flex gap-1.5">
                {pack.featured && (
                  <span className="text-xs bg-emerald-900/60 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-700/50 font-medium">Featured</span>
                )}
                {pack.isNew && (
                  <span className="text-xs bg-amber-900/60 text-amber-400 px-2 py-0.5 rounded-full border border-amber-700/50 font-medium">New</span>
                )}
              </div>

              <div className="p-5">
                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-3xl">{pack.icon}</div>
                  <div>
                    <h3 className="text-white font-bold">{pack.name}</h3>
                    <div className={`inline-block text-xs font-medium px-2 py-0.5 rounded mt-0.5 ${tier.bg} ${tier.border} ${tier.color}`}>
                      {tier.label} · {pack.cardsPerPack} cards
                    </div>
                  </div>
                </div>

                <p className="text-gray-400 text-xs leading-relaxed mb-4">{pack.description}</p>

                {/* Odds */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-emerald-400">✓</span>
                    <span className="text-emerald-400 font-medium">{pack.guaranteedRarity}</span>
                  </div>
                  {pack.odds.map((o, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">{o.label}</span>
                      <span className="text-gray-500 font-mono">{o.chance}</span>
                    </div>
                  ))}
                </div>

                {/* Price + Buy */}
                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <span className="text-white font-bold text-lg">{formatCurrency(pack.price)}</span>
                  <div className="flex items-center gap-2">
                    <Link href={`/packs/${pack.id}`} className="text-xs text-gray-400 hover:text-white transition-colors px-2 py-2">
                      Details
                    </Link>
                    <button
                      onClick={() => handleBuy(pack)}
                      disabled={!canAfford}
                      className={`px-5 py-2 rounded-xl text-sm font-bold transition-colors ${
                        canAfford
                          ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                          : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {canAfford ? 'Buy' : 'Low funds'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredPacks.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500 text-sm">No packs match your filters.</p>
          <button
            onClick={() => { setFilterTier('all'); setFilterSport('all'); }}
            className="text-emerald-400 text-sm mt-2 hover:text-emerald-300 transition-colors"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* How it works */}
      <div className="mt-10 bg-gray-900/40 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">How the Pack Store Works</h3>
        <div className="grid sm:grid-cols-4 gap-4">
          {[
            { step: '1', title: 'Browse', desc: 'Pick a pack by sport, tier, or budget. Higher tiers guarantee better pulls.' },
            { step: '2', title: 'Buy', desc: 'Spend from your $250 starter balance. Track every purchase in your history.' },
            { step: '3', title: 'Reveal', desc: 'Watch cards flip one-by-one. See rarity, value, and whether you hit profit.' },
            { step: '4', title: 'Collect', desc: 'Cards go to your vault. Sell back at 90% FMV or keep building your collection.' },
          ].map(s => (
            <div key={s.step} className="text-center">
              <div className="w-8 h-8 rounded-full bg-emerald-900/40 border border-emerald-800/50 text-emerald-400 font-bold text-sm flex items-center justify-center mx-auto mb-2">
                {s.step}
              </div>
              <h4 className="text-white font-bold text-sm mb-1">{s.title}</h4>
              <p className="text-gray-400 text-xs leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
