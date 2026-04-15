'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { type StorePack, getWallet, purchasePack, getVaultCards, TIER_INFO } from '@/lib/vault';
import type { SportsCard } from '@/data/sports-cards';

function parseValue(v: string): number {
  const m = v.match(/\$([\d,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
}

function formatCurrency(n: number): string {
  return '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

interface Props {
  pack: StorePack;
}

export default function PackDetailClient({ pack }: Props) {
  const [mounted, setMounted] = useState(false);
  const [balance, setBalance] = useState(0);
  const [vaultCount, setVaultCount] = useState(0);
  const [buying, setBuying] = useState(false);
  const [pulledCards, setPulledCards] = useState<SportsCard[] | null>(null);
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    setMounted(true);
    const w = getWallet();
    setBalance(w.balance);
    setVaultCount(getVaultCards().length);
  }, []);

  const canAfford = balance >= pack.price;
  const tier = TIER_INFO[pack.tier];

  const handleBuy = () => {
    if (!canAfford || buying) return;
    setBuying(true);
    const result = purchasePack(pack);
    if (result.success) {
      setPulledCards(result.cards);
      setRevealed(0);
      const w = getWallet();
      setBalance(w.balance);
      setVaultCount(getVaultCards().length);
      // Staggered reveal
      const interval = setInterval(() => {
        setRevealed(prev => {
          if (prev >= result.cards.length) {
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, 500);
    }
    setBuying(false);
  };

  if (!mounted) {
    return <div className="h-12 bg-slate-800 rounded-xl animate-pulse" />;
  }

  // Show results if cards were pulled
  if (pulledCards) {
    const totalValue = pulledCards.reduce((s, c) => s + parseValue(c.estimatedValueRaw), 0);
    return (
      <div className="space-y-4">
        <div className="bg-emerald-900/20 border border-emerald-700/40 rounded-xl p-4">
          <h3 className="text-lg font-bold text-emerald-400 mb-3">Pack Opened!</h3>
          <div className="space-y-2">
            {pulledCards.map((card, i) => {
              const value = parseValue(card.estimatedValueRaw);
              const isRevealed = i < revealed;
              return (
                <div
                  key={card.slug}
                  className={`flex items-center justify-between p-2 rounded-lg transition-all duration-300 ${
                    isRevealed ? 'bg-slate-800/60 opacity-100' : 'bg-slate-800/20 opacity-40'
                  }`}
                >
                  {isRevealed ? (
                    <>
                      <div className="flex-1 min-w-0">
                        <Link href={`/sports/${card.slug}`} className="text-sm text-white hover:text-blue-400 truncate block">
                          {card.name}
                        </Link>
                        <span className="text-xs text-slate-500">{card.player} · {card.year}</span>
                      </div>
                      <span className={`text-sm font-bold shrink-0 ml-2 ${
                        value >= 200 ? 'text-amber-400' : value >= 50 ? 'text-blue-400' : 'text-slate-400'
                      }`}>{card.estimatedValueRaw}</span>
                    </>
                  ) : (
                    <div className="w-full h-5 bg-slate-700/50 rounded animate-pulse" />
                  )}
                </div>
              );
            })}
          </div>
          {revealed >= pulledCards.length && (
            <div className="mt-4 flex items-center justify-between border-t border-emerald-800/40 pt-3">
              <span className="text-sm text-slate-400">Total Pull Value</span>
              <span className="text-lg font-bold text-emerald-400">{formatCurrency(totalValue)}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => { setPulledCards(null); setRevealed(0); }}
            className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-xl transition-colors"
          >
            Open Another
          </button>
          <Link
            href="/vault"
            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl transition-colors text-center"
          >
            View Vault ({vaultCount})
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Balance Display */}
      <div className="flex items-center justify-between bg-slate-800/50 border border-slate-700/40 rounded-xl px-4 py-2.5">
        <span className="text-sm text-slate-400">Your Balance</span>
        <span className={`text-lg font-bold ${canAfford ? 'text-emerald-400' : 'text-red-400'}`}>
          {formatCurrency(balance)}
        </span>
      </div>

      {/* Buy Button */}
      <button
        onClick={handleBuy}
        disabled={!canAfford}
        className={`w-full py-3 rounded-xl text-white font-bold text-lg transition-all ${
          canAfford
            ? `bg-gradient-to-r ${pack.gradient} hover:brightness-110 hover:scale-[1.01] active:scale-[0.99]`
            : 'bg-slate-700 text-slate-500 cursor-not-allowed'
        }`}
      >
        {canAfford ? `Buy Pack — $${pack.price.toFixed(2)}` : `Insufficient Balance ($${pack.price.toFixed(2)} needed)`}
      </button>

      {!canAfford && (
        <p className="text-xs text-slate-500 text-center">
          Sell cards from your <Link href="/vault" className="text-blue-400 hover:text-blue-300">vault</Link> to earn credits, or visit the <Link href="/packs" className="text-blue-400 hover:text-blue-300">pack store</Link> for cheaper packs.
        </p>
      )}

      <div className="text-xs text-slate-500 text-center">
        Vault: {vaultCount} cards · Prototype — no real money
      </div>
    </div>
  );
}
