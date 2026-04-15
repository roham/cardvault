'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { sportsCards, type SportsCard } from '@/data/sports-cards';
import { getVaultCards, type VaultCard } from '@/lib/vault';

type Sport = 'all' | 'baseball' | 'basketball' | 'football' | 'hockey';

function parseValue(raw: string): number {
  const m = raw.match(/\$([0-9,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
}

function getCardBySlug(slug: string): SportsCard | undefined {
  return sportsCards.find(c => c.slug === slug);
}

// Platform fee structures for sell-then-buy comparison
const PLATFORMS = [
  { name: 'eBay', sellFee: 0.1313, buyFee: 0, shipping: 4.50, label: 'eBay (13.13% + ship)' },
  { name: 'Mercari', sellFee: 0.10, buyFee: 0, shipping: 4.00, label: 'Mercari (10% + ship)' },
  { name: 'Facebook', sellFee: 0, buyFee: 0, shipping: 0, label: 'Facebook Marketplace (0%)' },
  { name: 'Card Show', sellFee: 0, buyFee: 0, shipping: 0, label: 'Card Show / LCS (0%)' },
  { name: 'COMC', sellFee: 0.05, buyFee: 0.05, shipping: 3.00, label: 'COMC (5% each side)' },
];

export default function TradeInClient() {
  const [targetSearch, setTargetSearch] = useState('');
  const [targetCard, setTargetCard] = useState<SportsCard | null>(null);
  const [sportFilter, setSportFilter] = useState<Sport>('all');
  const [tradeInSlugs, setTradeInSlugs] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const [vaultCards, setVaultCards] = useState<VaultCard[]>([]);
  const [useVault, setUseVault] = useState(false);
  const [vaultSearch, setVaultSearch] = useState('');

  // Load vault on mount
  useState(() => {
    setMounted(true);
    try {
      const vc = getVaultCards();
      setVaultCards(vc);
    } catch { /* no vault */ }
  });

  // Search results for target card
  const targetResults = useMemo(() => {
    if (targetSearch.length < 2) return [];
    const q = targetSearch.toLowerCase();
    return sportsCards
      .filter(c => {
        if (sportFilter !== 'all' && c.sport !== sportFilter) return false;
        return c.name.toLowerCase().includes(q) || c.player.toLowerCase().includes(q);
      })
      .sort((a, b) => parseValue(b.estimatedValueRaw) - parseValue(a.estimatedValueRaw))
      .slice(0, 12);
  }, [targetSearch, sportFilter]);

  // Available cards for trade-in (from vault or full DB)
  const availableCards = useMemo(() => {
    if (!targetCard) return [];
    const q = vaultSearch.toLowerCase();

    if (useVault && mounted) {
      const vaultSlugs = new Set(vaultCards.map(vc => vc.slug));
      return sportsCards
        .filter(c => {
          if (!vaultSlugs.has(c.slug)) return false;
          if (c.slug === targetCard.slug) return false;
          if (tradeInSlugs.includes(c.slug)) return false;
          if (q && !c.name.toLowerCase().includes(q) && !c.player.toLowerCase().includes(q)) return false;
          return true;
        })
        .sort((a, b) => parseValue(b.estimatedValueRaw) - parseValue(a.estimatedValueRaw))
        .slice(0, 50);
    }

    // Full DB mode
    return sportsCards
      .filter(c => {
        if (c.slug === targetCard.slug) return false;
        if (tradeInSlugs.includes(c.slug)) return false;
        if (q.length >= 2 && !c.name.toLowerCase().includes(q) && !c.player.toLowerCase().includes(q)) return false;
        if (q.length < 2) return false; // Require search in full DB mode
        return true;
      })
      .sort((a, b) => parseValue(b.estimatedValueRaw) - parseValue(a.estimatedValueRaw))
      .slice(0, 20);
  }, [targetCard, useVault, vaultCards, mounted, tradeInSlugs, vaultSearch]);

  // Trade-in cards detail
  const tradeInCards = useMemo(() => {
    return tradeInSlugs
      .map(slug => getCardBySlug(slug))
      .filter((c): c is SportsCard => !!c);
  }, [tradeInSlugs]);

  // Values
  const targetValue = targetCard ? parseValue(targetCard.estimatedValueRaw) : 0;
  const tradeInTotal = tradeInCards.reduce((sum, c) => sum + parseValue(c.estimatedValueRaw), 0);
  const cashGap = Math.max(0, targetValue - tradeInTotal);
  const surplus = Math.max(0, tradeInTotal - targetValue);
  const coveragePercent = targetValue > 0 ? Math.min(100, Math.round((tradeInTotal / targetValue) * 100)) : 0;

  // Trade-in value (dealers typically offer 60-70% of market value)
  const tradeInOffer = Math.round(tradeInTotal * 0.65);
  const tradeInGap = Math.max(0, targetValue - tradeInOffer);

  // Sell-then-buy comparison
  const sellThenBuy = useMemo(() => {
    return PLATFORMS.map(p => {
      const sellProceeds = tradeInCards.reduce((sum, c) => {
        const val = parseValue(c.estimatedValueRaw);
        return sum + val * (1 - p.sellFee) - (p.shipping || 0);
      }, 0);
      const buyTotal = targetValue + (targetValue * p.buyFee) + (p.shipping || 0);
      const netCost = buyTotal - sellProceeds;
      return {
        ...p,
        sellProceeds: Math.round(sellProceeds),
        buyTotal: Math.round(buyTotal),
        netCost: Math.round(netCost),
      };
    });
  }, [tradeInCards, targetValue]);

  const addTradeIn = useCallback((slug: string) => {
    setTradeInSlugs(prev => [...prev, slug]);
  }, []);

  const removeTradeIn = useCallback((slug: string) => {
    setTradeInSlugs(prev => prev.filter(s => s !== slug));
  }, []);

  const clearAll = useCallback(() => {
    setTradeInSlugs([]);
    setTargetCard(null);
    setTargetSearch('');
    setVaultSearch('');
  }, []);

  // Best approach verdict
  const bestApproach = useMemo(() => {
    if (!targetCard || tradeInCards.length === 0) return null;
    const directTradeGap = tradeInGap;
    const bestSellBuy = Math.min(...sellThenBuy.map(p => p.netCost));
    const bestPlatform = sellThenBuy.find(p => p.netCost === bestSellBuy);

    if (directTradeGap <= bestSellBuy) {
      return {
        method: 'Direct Trade-In',
        savings: bestSellBuy - directTradeGap,
        note: `Trading in directly saves you ~$${bestSellBuy - directTradeGap} vs selling online then buying. Dealers offer ~65% of market value but you avoid platform fees, shipping, and the hassle of multiple listings.`,
      };
    }
    return {
      method: `Sell then Buy (${bestPlatform?.name || 'Online'})`,
      savings: directTradeGap - bestSellBuy,
      note: `Selling your cards on ${bestPlatform?.name || 'a platform'} then buying the target nets ~$${directTradeGap - bestSellBuy} more than a direct trade-in. More work, but better value.`,
    };
  }, [targetCard, tradeInCards, tradeInGap, sellThenBuy]);

  const sportEmoji: Record<string, string> = { baseball: '⚾', basketball: '🏀', football: '🏈', hockey: '🏒' };

  return (
    <div className="space-y-8">
      {/* Step 1: Select Target Card */}
      <section className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-emerald-900/60 border border-emerald-700/50 flex items-center justify-center text-emerald-400 text-sm font-bold">1</div>
          <h2 className="text-lg font-bold text-white">Select the Card You Want</h2>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {(['all', 'baseball', 'basketball', 'football', 'hockey'] as Sport[]).map(s => (
            <button
              key={s}
              onClick={() => setSportFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${sportFilter === s ? 'bg-emerald-900/60 text-emerald-400 border border-emerald-700/50' : 'bg-gray-700/50 text-gray-400 border border-gray-600/50 hover:text-white'}`}
            >
              {s === 'all' ? 'All Sports' : `${sportEmoji[s] || ''} ${s.charAt(0).toUpperCase() + s.slice(1)}`}
            </button>
          ))}
        </div>

        {!targetCard ? (
          <div>
            <input
              type="text"
              placeholder="Search for a card by player name or card name..."
              value={targetSearch}
              onChange={e => setTargetSearch(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-600"
            />
            {targetResults.length > 0 && (
              <div className="mt-2 space-y-1 max-h-64 overflow-y-auto">
                {targetResults.map(card => (
                  <button
                    key={card.slug}
                    onClick={() => { setTargetCard(card); setTargetSearch(''); }}
                    className="w-full text-left px-3 py-2.5 bg-gray-900/50 hover:bg-gray-700/50 border border-gray-700/30 rounded-lg transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-white text-sm font-medium">{card.name}</span>
                        <span className="text-gray-500 text-xs ml-2">{card.player} &middot; {card.year}</span>
                      </div>
                      <span className="text-emerald-400 text-sm font-semibold">{card.estimatedValueRaw}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-emerald-400 text-xs font-medium mb-1">TARGET CARD</p>
                <p className="text-white font-bold text-lg">{targetCard.name}</p>
                <p className="text-gray-400 text-sm">{targetCard.player} &middot; {targetCard.year} &middot; {sportEmoji[targetCard.sport] || ''} {targetCard.sport}</p>
              </div>
              <div className="text-right">
                <p className="text-emerald-400 font-bold text-2xl">{targetCard.estimatedValueRaw}</p>
                <p className="text-gray-500 text-xs">estimated market value</p>
                <button onClick={() => { setTargetCard(null); setTradeInSlugs([]); setTargetSearch(''); }} className="mt-2 text-red-400 text-xs hover:text-red-300 transition-colors">Change card</button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Step 2: Build Trade-In Package */}
      {targetCard && (
        <section className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-amber-900/60 border border-amber-700/50 flex items-center justify-center text-amber-400 text-sm font-bold">2</div>
            <h2 className="text-lg font-bold text-white">Build Your Trade-In Package</h2>
          </div>

          {/* Vault toggle */}
          {mounted && vaultCards.length > 0 && (
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => setUseVault(!useVault)}
                className={`relative w-10 h-5 rounded-full transition-colors ${useVault ? 'bg-emerald-600' : 'bg-gray-600'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${useVault ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
              <span className="text-sm text-gray-300">Use cards from My Vault ({vaultCards.length} cards)</span>
            </div>
          )}

          {/* Search for trade-in cards */}
          <input
            type="text"
            placeholder={useVault ? 'Filter vault cards...' : 'Search cards to trade in...'}
            value={vaultSearch}
            onChange={e => setVaultSearch(e.target.value)}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-amber-600 mb-3"
          />

          {/* Available cards */}
          {availableCards.length > 0 && (
            <div className="space-y-1 max-h-48 overflow-y-auto mb-4">
              {availableCards.map(card => {
                const val = parseValue(card.estimatedValueRaw);
                return (
                  <button
                    key={card.slug}
                    onClick={() => addTradeIn(card.slug)}
                    className="w-full text-left px-3 py-2 bg-gray-900/50 hover:bg-amber-900/20 border border-gray-700/30 hover:border-amber-700/40 rounded-lg transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-amber-400 text-lg">+</span>
                        <div>
                          <span className="text-white text-sm">{card.name}</span>
                          <span className="text-gray-500 text-xs ml-2">{card.player}</span>
                        </div>
                      </div>
                      <span className="text-amber-400 text-sm font-medium">${val.toLocaleString()}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Trade-in package */}
          {tradeInCards.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-amber-400">Your Trade-In Package ({tradeInCards.length} cards)</h3>
                <button onClick={() => setTradeInSlugs([])} className="text-xs text-gray-500 hover:text-red-400 transition-colors">Clear all</button>
              </div>
              <div className="space-y-1">
                {tradeInCards.map(card => {
                  const val = parseValue(card.estimatedValueRaw);
                  return (
                    <div key={card.slug} className="flex justify-between items-center px-3 py-2 bg-amber-950/20 border border-amber-800/30 rounded-lg">
                      <div>
                        <span className="text-white text-sm">{card.name}</span>
                        <span className="text-gray-500 text-xs ml-2">{card.player}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-amber-400 text-sm font-medium">${val.toLocaleString()}</span>
                        <button onClick={() => removeTradeIn(card.slug)} className="text-red-400/60 hover:text-red-400 text-lg leading-none transition-colors">&times;</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Step 3: Analysis */}
      {targetCard && tradeInCards.length > 0 && (
        <section className="space-y-6">
          {/* Coverage meter */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-violet-900/60 border border-violet-700/50 flex items-center justify-center text-violet-400 text-sm font-bold">3</div>
              <h2 className="text-lg font-bold text-white">Trade-In Analysis</h2>
            </div>

            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Coverage</span>
                <span className={`font-bold ${coveragePercent >= 100 ? 'text-emerald-400' : coveragePercent >= 75 ? 'text-amber-400' : 'text-red-400'}`}>
                  {coveragePercent}%
                </span>
              </div>
              <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${coveragePercent >= 100 ? 'bg-emerald-500' : coveragePercent >= 75 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(100, coveragePercent)}%` }}
                />
              </div>
            </div>

            {/* Value breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                <p className="text-gray-500 text-xs mb-1">Target Value</p>
                <p className="text-white font-bold text-lg">${targetValue.toLocaleString()}</p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                <p className="text-gray-500 text-xs mb-1">Trade-In Total</p>
                <p className="text-amber-400 font-bold text-lg">${tradeInTotal.toLocaleString()}</p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                <p className="text-gray-500 text-xs mb-1">{surplus > 0 ? 'Surplus' : 'Cash Gap'}</p>
                <p className={`font-bold text-lg ${surplus > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  ${surplus > 0 ? surplus.toLocaleString() : cashGap.toLocaleString()}
                </p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                <p className="text-gray-500 text-xs mb-1">Dealer Offer (65%)</p>
                <p className="text-violet-400 font-bold text-lg">${tradeInOffer.toLocaleString()}</p>
              </div>
            </div>

            {/* Direct trade-in scenario */}
            <div className="bg-amber-950/20 border border-amber-800/30 rounded-lg p-4 mb-4">
              <h3 className="text-amber-400 text-sm font-semibold mb-2">Option A: Direct Trade-In at a Dealer/LCS</h3>
              <p className="text-gray-300 text-sm mb-2">
                Dealers typically offer <span className="text-amber-400 font-semibold">60-70% of market value</span> for trade-ins (we use 65% as the midpoint).
              </p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-gray-500 text-xs">Your cards&apos; market value</p>
                  <p className="text-white font-semibold">${tradeInTotal.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Dealer trade-in credit</p>
                  <p className="text-amber-400 font-semibold">${tradeInOffer.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Cash you still owe</p>
                  <p className={`font-semibold ${tradeInGap > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {tradeInGap > 0 ? `$${tradeInGap.toLocaleString()}` : 'Covered!'}
                  </p>
                </div>
              </div>
            </div>

            {/* Sell-then-buy comparison */}
            <div className="bg-violet-950/20 border border-violet-800/30 rounded-lg p-4 mb-4">
              <h3 className="text-violet-400 text-sm font-semibold mb-3">Option B: Sell Your Cards Online, Then Buy Target</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left text-gray-400 py-2 pr-2 font-medium">Platform</th>
                      <th className="text-right text-gray-400 py-2 px-2 font-medium">You Get</th>
                      <th className="text-right text-gray-400 py-2 px-2 font-medium">Target Cost</th>
                      <th className="text-right text-gray-400 py-2 pl-2 font-medium">Net Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sellThenBuy.map(p => (
                      <tr key={p.name} className="border-b border-gray-800/50">
                        <td className="py-2 pr-2 text-gray-300">{p.label}</td>
                        <td className="py-2 px-2 text-right text-emerald-400">${p.sellProceeds.toLocaleString()}</td>
                        <td className="py-2 px-2 text-right text-white">${p.buyTotal.toLocaleString()}</td>
                        <td className={`py-2 pl-2 text-right font-semibold ${p.netCost <= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {p.netCost <= 0 ? `-$${Math.abs(p.netCost).toLocaleString()}` : `$${p.netCost.toLocaleString()}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Verdict */}
            {bestApproach && (
              <div className={`rounded-lg p-4 ${bestApproach.method.startsWith('Direct') ? 'bg-amber-950/30 border border-amber-700/40' : 'bg-violet-950/30 border border-violet-700/40'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{bestApproach.method.startsWith('Direct') ? '🤝' : '💻'}</span>
                  <h3 className="text-white font-bold">Best Approach: {bestApproach.method}</h3>
                  {bestApproach.savings > 0 && (
                    <span className="text-emerald-400 text-sm font-semibold ml-auto">Save ~${bestApproach.savings.toLocaleString()}</span>
                  )}
                </div>
                <p className="text-gray-300 text-sm">{bestApproach.note}</p>
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5">
            <h3 className="text-white font-bold mb-3">Trade-In Tips</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex gap-2"><span className="text-emerald-400 flex-shrink-0">1.</span> Bring trade-in cards <span className="text-white font-medium">sleeved and organized</span> — dealers offer more for well-presented collections</li>
              <li className="flex gap-2"><span className="text-emerald-400 flex-shrink-0">2.</span> Know your cards&apos; values before walking in — use <Link href="/tools" className="text-emerald-400 hover:underline">CardVault price tools</Link> or eBay sold comps</li>
              <li className="flex gap-2"><span className="text-emerald-400 flex-shrink-0">3.</span> Trade-in credit is often <span className="text-white font-medium">5-10% higher</span> than a cash offer from the same dealer</li>
              <li className="flex gap-2"><span className="text-emerald-400 flex-shrink-0">4.</span> Card shows offer the best trade-in opportunities — more dealers = more competition for your cards</li>
              <li className="flex gap-2"><span className="text-emerald-400 flex-shrink-0">5.</span> Graded cards command higher trade-in percentages (70-80% vs 55-65% for raw)</li>
              <li className="flex gap-2"><span className="text-emerald-400 flex-shrink-0">6.</span> Consider the time value: selling online gets more cash but takes days/weeks vs instant trade-in</li>
            </ul>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-2">
            {targetCard && (
              <Link href={`/sports/${targetCard.slug}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 rounded-lg text-sm transition-colors">
                View {targetCard.player}&apos;s Cards
              </Link>
            )}
            <a href={targetCard ? `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(targetCard.name)}&LH_Sold=1&LH_Complete=1` : '#'} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 rounded-lg text-sm transition-colors">
              eBay Sold Listings
            </a>
            <Link href="/tools/flip-calc" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 rounded-lg text-sm transition-colors">
              Flip Calculator
            </Link>
            <Link href="/vault" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 rounded-lg text-sm transition-colors">
              My Vault
            </Link>
          </div>
        </section>
      )}

      {/* Empty state */}
      {!targetCard && (
        <div className="text-center py-10 text-gray-500">
          <p className="text-4xl mb-3">🔄</p>
          <p className="text-lg">Search for a card you want to acquire</p>
          <p className="text-sm mt-1">Then build a trade-in package from your collection to see how much it covers</p>
        </div>
      )}

      {targetCard && tradeInCards.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-3xl mb-3">📦</p>
          <p className="text-lg">Add cards to your trade-in package</p>
          <p className="text-sm mt-1">Search for cards above or toggle on vault mode to use your collection</p>
        </div>
      )}
    </div>
  );
}
