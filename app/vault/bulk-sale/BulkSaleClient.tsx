'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { sportsCards, type SportsCard } from '@/data/sports-cards';

function parseValue(v: string): number {
  const m = v.match(/\$([0-9,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
}

interface SellingMethod {
  id: string;
  name: string;
  description: string;
  feePercent: number;
  shippingPerItem: number;
  flatFee: number;
  timePerItemMin: number;
  minItemValue: number;
  bulkDiscountThreshold: number;
  bulkDiscountPercent: number;
  color: string;
  pros: string[];
  cons: string[];
}

const SELLING_METHODS: SellingMethod[] = [
  {
    id: 'ebay-individual',
    name: 'eBay (Individual)',
    description: 'List each card individually on eBay for maximum value',
    feePercent: 13.25,
    shippingPerItem: 1.20,
    flatFee: 0.30,
    timePerItemMin: 15,
    minItemValue: 0,
    bulkDiscountThreshold: 0,
    bulkDiscountPercent: 0,
    color: 'blue',
    pros: ['Highest per-card payout', 'Largest buyer pool', 'Good for cards $10+'],
    cons: ['Very time-consuming', 'Shipping hassle', 'Returns and buyer disputes'],
  },
  {
    id: 'ebay-lots',
    name: 'eBay (Lot Sales)',
    description: 'Bundle cards into lots of 5-20 for faster sales',
    feePercent: 13.25,
    shippingPerItem: 0.40,
    flatFee: 0.30,
    timePerItemMin: 3,
    minItemValue: 0,
    bulkDiscountThreshold: 0,
    bulkDiscountPercent: 20,
    color: 'indigo',
    pros: ['Faster than individual listings', 'Lower shipping per card', 'Good for base cards'],
    cons: ['20-30% lower per-card value', 'Still eBay fees', 'Lot pricing is guesswork'],
  },
  {
    id: 'consignment',
    name: 'Consignment (PWCC/Goldin)',
    description: 'Let an auction house sell your high-value cards',
    feePercent: 10,
    shippingPerItem: 0,
    flatFee: 0,
    timePerItemMin: 2,
    minItemValue: 50,
    bulkDiscountThreshold: 20,
    bulkDiscountPercent: 0,
    color: 'purple',
    pros: ['Professional photography', 'Premium buyer pool', 'No shipping hassle'],
    cons: ['Only for $50+ cards', '6-8 week timeline', '10-15% seller fees'],
  },
  {
    id: 'lcs-bulk',
    name: 'Local Card Shop (Bulk)',
    description: 'Sell everything to your LCS in one visit',
    feePercent: 0,
    shippingPerItem: 0,
    flatFee: 0,
    timePerItemMin: 0.5,
    minItemValue: 0,
    bulkDiscountThreshold: 0,
    bulkDiscountPercent: 50,
    color: 'amber',
    pros: ['Instant cash', 'Zero shipping', 'One trip, done'],
    cons: ['40-60% of market value', 'LCS cherry-picks best cards', 'No negotiation leverage on junk'],
  },
  {
    id: 'facebook-groups',
    name: 'Facebook Groups',
    description: 'Sell directly to collectors in hobby groups',
    feePercent: 3,
    shippingPerItem: 1.00,
    flatFee: 0,
    timePerItemMin: 8,
    minItemValue: 0,
    bulkDiscountThreshold: 0,
    bulkDiscountPercent: 10,
    color: 'sky',
    pros: ['Lower fees than eBay', 'Direct to collectors', 'No returns policy'],
    cons: ['Scam risk', 'Slower sales', 'No buyer protection'],
  },
  {
    id: 'whatnot',
    name: 'Whatnot (Live Selling)',
    description: 'Sell cards live on Whatnot streams',
    feePercent: 9.5,
    shippingPerItem: 0.80,
    flatFee: 0,
    timePerItemMin: 1,
    minItemValue: 0,
    bulkDiscountThreshold: 0,
    bulkDiscountPercent: 15,
    color: 'rose',
    pros: ['Fast liquidation', 'Impulse buyers pay more', 'Entertainment factor'],
    cons: ['Need to build audience', 'Time commitment for streaming', 'Unpredictable prices'],
  },
];

type SortOption = 'net-payout' | 'time' | 'payout-per-hour';

interface CardEntry {
  id: string;
  card: SportsCard | null;
  manualName: string;
  manualValue: number;
  quantity: number;
}

export default function BulkSaleClient() {
  const [entries, setEntries] = useState<CardEntry[]>([]);
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('net-payout');
  const [manualName, setManualName] = useState('');
  const [manualValue, setManualValue] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [loadFromVault, setLoadFromVault] = useState(false);

  const searchResults = useMemo(() => {
    if (!search || search.length < 2) return [];
    const q = search.toLowerCase();
    return sportsCards.filter(c =>
      c.name.toLowerCase().includes(q) || c.player.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [search]);

  const addCard = (card: SportsCard) => {
    setEntries(prev => [...prev, {
      id: `${card.slug}-${Date.now()}`,
      card,
      manualName: '',
      manualValue: 0,
      quantity: 1,
    }]);
    setSearch('');
    setShowSearch(false);
  };

  const addManualCard = () => {
    if (!manualName || !manualValue) return;
    setEntries(prev => [...prev, {
      id: `manual-${Date.now()}`,
      card: null,
      manualName,
      manualValue: parseFloat(manualValue),
      quantity: 1,
    }]);
    setManualName('');
    setManualValue('');
  };

  const removeEntry = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const updateQuantity = (id: string, qty: number) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, quantity: Math.max(1, qty) } : e));
  };

  const loadVaultCards = () => {
    try {
      const raw = localStorage.getItem('cardvault_collection');
      if (!raw) return;
      const collection = JSON.parse(raw);
      if (!Array.isArray(collection)) return;
      const newEntries: CardEntry[] = [];
      for (const item of collection) {
        const card = sportsCards.find(c => c.slug === item.slug);
        if (card) {
          newEntries.push({
            id: `vault-${card.slug}-${Date.now()}`,
            card,
            manualName: '',
            manualValue: 0,
            quantity: item.quantity || 1,
          });
        }
      }
      if (newEntries.length > 0) {
        setEntries(prev => [...prev, ...newEntries]);
        setLoadFromVault(true);
      }
    } catch {
      // localStorage unavailable
    }
  };

  const totalCards = entries.reduce((sum, e) => sum + e.quantity, 0);
  const totalValue = entries.reduce((sum, e) => {
    const val = e.card ? parseValue(e.card.estimatedValueRaw) : e.manualValue;
    return sum + val * e.quantity;
  }, 0);

  const methodResults = useMemo(() => {
    return SELLING_METHODS.map(method => {
      let grossRevenue = 0;
      let totalFees = 0;
      let totalShipping = 0;
      let totalTimeMin = 0;
      let eligibleCards = 0;
      let skippedCards = 0;

      for (const entry of entries) {
        const cardValue = entry.card ? parseValue(entry.card.estimatedValueRaw) : entry.manualValue;
        const qty = entry.quantity;

        for (let i = 0; i < qty; i++) {
          if (cardValue < method.minItemValue) {
            skippedCards++;
            continue;
          }
          eligibleCards++;

          let salePrice = cardValue;
          if (method.bulkDiscountPercent > 0) {
            salePrice = cardValue * (1 - method.bulkDiscountPercent / 100);
          }

          const fees = salePrice * (method.feePercent / 100) + method.flatFee;
          const shipping = method.shippingPerItem;
          const net = salePrice - fees - shipping;

          grossRevenue += salePrice;
          totalFees += fees;
          totalShipping += shipping;
          totalTimeMin += method.timePerItemMin;
        }
      }

      const netPayout = grossRevenue - totalFees - totalShipping;
      const timeHours = totalTimeMin / 60;
      const payoutPerHour = timeHours > 0 ? netPayout / timeHours : 0;

      return {
        method,
        grossRevenue,
        totalFees,
        totalShipping,
        netPayout,
        timeHours,
        payoutPerHour,
        eligibleCards,
        skippedCards,
        recoveryRate: totalValue > 0 ? (netPayout / totalValue) * 100 : 0,
      };
    });
  }, [entries, totalValue]);

  const sortedResults = useMemo(() => {
    return [...methodResults].sort((a, b) => {
      if (sortBy === 'net-payout') return b.netPayout - a.netPayout;
      if (sortBy === 'time') return a.timeHours - b.timeHours;
      return b.payoutPerHour - a.payoutPerHour;
    });
  }, [methodResults, sortBy]);

  const bestPayout = sortedResults.length > 0 ? sortedResults.reduce((best, r) => r.netPayout > best.netPayout ? r : best) : null;
  const fastestMethod = sortedResults.length > 0 ? sortedResults.reduce((best, r) => r.timeHours < best.timeHours ? r : best) : null;
  const bestEfficiency = sortedResults.length > 0 ? sortedResults.reduce((best, r) => r.payoutPerHour > best.payoutPerHour ? r : best) : null;

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-950/60 border-blue-800/50 text-blue-400',
    indigo: 'bg-indigo-950/60 border-indigo-800/50 text-indigo-400',
    purple: 'bg-purple-950/60 border-purple-800/50 text-purple-400',
    amber: 'bg-amber-950/60 border-amber-800/50 text-amber-400',
    sky: 'bg-sky-950/60 border-sky-800/50 text-sky-400',
    rose: 'bg-rose-950/60 border-rose-800/50 text-rose-400',
  };

  const barColorMap: Record<string, string> = {
    blue: 'bg-blue-500',
    indigo: 'bg-indigo-500',
    purple: 'bg-purple-500',
    amber: 'bg-amber-500',
    sky: 'bg-sky-500',
    rose: 'bg-rose-500',
  };

  return (
    <div className="space-y-8">
      {/* Add Cards Section */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Add Cards to Sell</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* Search from database */}
          <div>
            <label className="text-sm text-gray-400 block mb-1">Search CardVault Database</label>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setShowSearch(true); }}
                onFocus={() => setShowSearch(true)}
                placeholder="Search by player or card name..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
              />
              {showSearch && searchResults.length > 0 && (
                <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg max-h-60 overflow-y-auto">
                  {searchResults.map(card => (
                    <button
                      key={card.slug}
                      onClick={() => addCard(card)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors"
                    >
                      <div className="text-white text-sm">{card.name}</div>
                      <div className="text-gray-500 text-xs">{card.estimatedValueRaw}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Manual entry */}
          <div>
            <label className="text-sm text-gray-400 block mb-1">Or Add Manually</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualName}
                onChange={e => setManualName(e.target.value)}
                placeholder="Card name"
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
              />
              <input
                type="number"
                value={manualValue}
                onChange={e => setManualValue(e.target.value)}
                placeholder="$ Value"
                className="w-24 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
              />
              <button
                onClick={addManualCard}
                className="px-3 py-2.5 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-500 transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-2 mb-4">
          {!loadFromVault && (
            <button
              onClick={loadVaultCards}
              className="text-xs px-3 py-1.5 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg hover:border-emerald-600 hover:text-emerald-400 transition-colors"
            >
              Load from My Vault
            </button>
          )}
          {entries.length > 0 && (
            <button
              onClick={() => setEntries([])}
              className="text-xs px-3 py-1.5 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg hover:border-red-600 hover:text-red-400 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Card list */}
        {entries.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm text-gray-400 mb-2">{entries.length} unique card{entries.length !== 1 ? 's' : ''} ({totalCards} total) &mdash; Est. value: ${totalValue.toLocaleString()}</div>
            <div className="max-h-60 overflow-y-auto space-y-1">
              {entries.map(entry => {
                const name = entry.card ? entry.card.name : entry.manualName;
                const value = entry.card ? parseValue(entry.card.estimatedValueRaw) : entry.manualValue;
                return (
                  <div key={entry.id} className="flex items-center justify-between bg-gray-800/60 border border-gray-700/50 rounded-lg px-3 py-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm truncate">{name}</div>
                      <div className="text-gray-500 text-xs">${value.toLocaleString()} each</div>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <button onClick={() => updateQuantity(entry.id, entry.quantity - 1)} className="w-6 h-6 bg-gray-700 text-gray-300 rounded text-sm hover:bg-gray-600">-</button>
                      <span className="text-white text-sm w-6 text-center">{entry.quantity}</span>
                      <button onClick={() => updateQuantity(entry.id, entry.quantity + 1)} className="w-6 h-6 bg-gray-700 text-gray-300 rounded text-sm hover:bg-gray-600">+</button>
                      <button onClick={() => removeEntry(entry.id)} className="ml-2 text-gray-500 hover:text-red-400 text-sm">x</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Calculate Button */}
      {entries.length > 0 && (
        <button
          onClick={() => setShowResults(true)}
          className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-500 transition-colors text-lg"
        >
          Calculate Best Selling Strategy
        </button>
      )}

      {/* Results */}
      {showResults && entries.length > 0 && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-900 border border-emerald-800/50 rounded-xl p-5 text-center">
              <div className="text-gray-400 text-sm mb-1">Best Net Payout</div>
              <div className="text-2xl font-bold text-emerald-400">${bestPayout?.netPayout.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
              <div className="text-gray-500 text-xs mt-1">{bestPayout?.method.name}</div>
              <div className="text-gray-600 text-xs">{bestPayout?.recoveryRate.toFixed(0)}% recovery</div>
            </div>
            <div className="bg-gray-900 border border-sky-800/50 rounded-xl p-5 text-center">
              <div className="text-gray-400 text-sm mb-1">Fastest Method</div>
              <div className="text-2xl font-bold text-sky-400">{fastestMethod && fastestMethod.timeHours < 1 ? `${Math.round(fastestMethod.timeHours * 60)}m` : `${fastestMethod?.timeHours.toFixed(1)}h`}</div>
              <div className="text-gray-500 text-xs mt-1">{fastestMethod?.method.name}</div>
              <div className="text-gray-600 text-xs">${fastestMethod?.netPayout.toLocaleString(undefined, { maximumFractionDigits: 0 })} net</div>
            </div>
            <div className="bg-gray-900 border border-amber-800/50 rounded-xl p-5 text-center">
              <div className="text-gray-400 text-sm mb-1">Best $/Hour</div>
              <div className="text-2xl font-bold text-amber-400">${bestEfficiency?.payoutPerHour.toLocaleString(undefined, { maximumFractionDigits: 0 })}/hr</div>
              <div className="text-gray-500 text-xs mt-1">{bestEfficiency?.method.name}</div>
              <div className="text-gray-600 text-xs">{bestEfficiency?.timeHours.toFixed(1)}h total time</div>
            </div>
          </div>

          {/* Sort toggle */}
          <div className="flex gap-2 items-center">
            <span className="text-gray-400 text-sm">Sort by:</span>
            {[
              { value: 'net-payout' as SortOption, label: 'Highest Payout' },
              { value: 'time' as SortOption, label: 'Fastest' },
              { value: 'payout-per-hour' as SortOption, label: 'Best $/Hour' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setSortBy(opt.value)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  sortBy === opt.value
                    ? 'bg-emerald-950/60 border-emerald-700 text-emerald-400'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Method Comparison */}
          <div className="space-y-4">
            {sortedResults.map((result, i) => {
              const isBestPayout = result.method.id === bestPayout?.method.id;
              const isFastest = result.method.id === fastestMethod?.method.id;
              const isBestEfficiency = result.method.id === bestEfficiency?.method.id;
              const maxPayout = sortedResults[0]?.netPayout || 1;
              const barWidth = Math.max(5, (result.netPayout / (maxPayout > 0 ? maxPayout : 1)) * 100);

              return (
                <div key={result.method.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-white">{i + 1}.</span>
                        <h3 className="text-lg font-bold text-white">{result.method.name}</h3>
                        {isBestPayout && <span className="text-xs bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 px-2 py-0.5 rounded-full">Best Payout</span>}
                        {isFastest && <span className="text-xs bg-sky-950/60 border border-sky-800/50 text-sky-400 px-2 py-0.5 rounded-full">Fastest</span>}
                        {isBestEfficiency && !isBestPayout && !isFastest && <span className="text-xs bg-amber-950/60 border border-amber-800/50 text-amber-400 px-2 py-0.5 rounded-full">Best $/hr</span>}
                      </div>
                      <p className="text-gray-500 text-sm mt-0.5">{result.method.description}</p>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold text-white">${result.netPayout.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                      <div className="text-gray-500 text-xs">{result.recoveryRate.toFixed(0)}% of market value</div>
                    </div>
                  </div>

                  {/* Payout bar */}
                  <div className="w-full bg-gray-800 rounded-full h-2.5 mb-4">
                    <div className={`h-2.5 rounded-full ${barColorMap[result.method.color]} transition-all duration-500`} style={{ width: `${barWidth}%` }} />
                  </div>

                  {/* Breakdown grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-3">
                    <div>
                      <div className="text-gray-500 text-xs">Gross Revenue</div>
                      <div className="text-white text-sm font-medium">${result.grossRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs">Fees</div>
                      <div className="text-red-400 text-sm font-medium">-${result.totalFees.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs">Shipping</div>
                      <div className="text-red-400 text-sm font-medium">-${result.totalShipping.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs">Time Required</div>
                      <div className="text-white text-sm font-medium">{result.timeHours < 1 ? `${Math.round(result.timeHours * 60)}m` : `${result.timeHours.toFixed(1)}h`}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs">$/Hour Earned</div>
                      <div className="text-amber-400 text-sm font-medium">${result.payoutPerHour.toLocaleString(undefined, { maximumFractionDigits: 0 })}/hr</div>
                    </div>
                  </div>

                  {result.skippedCards > 0 && (
                    <div className="text-xs text-gray-500 mb-3">
                      {result.skippedCards} card{result.skippedCards !== 1 ? 's' : ''} below ${result.method.minItemValue} minimum — not eligible for this method
                    </div>
                  )}

                  {/* Pros/Cons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="space-y-1">
                      {result.method.pros.map(p => (
                        <div key={p} className="text-xs text-emerald-400/80 flex items-start gap-1.5">
                          <span className="mt-0.5">+</span> {p}
                        </div>
                      ))}
                    </div>
                    <div className="space-y-1">
                      {result.method.cons.map(c => (
                        <div key={c} className="text-xs text-red-400/80 flex items-start gap-1.5">
                          <span className="mt-0.5">-</span> {c}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recommendation */}
          <div className="bg-gray-900 border border-emerald-800/50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-3">Our Recommendation</h3>
            {totalValue > 5000 ? (
              <div className="space-y-2 text-gray-300 text-sm">
                <p><strong className="text-emerald-400">Split strategy recommended.</strong> Your collection is worth ${totalValue.toLocaleString()} — use a hybrid approach:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-400">
                  <li>Cards worth $50+: <strong className="text-white">Consignment</strong> (PWCC, Goldin) for maximum exposure to premium buyers</li>
                  <li>Cards worth $10-49: <strong className="text-white">eBay individual listings</strong> for best per-card return</li>
                  <li>Cards worth &lt;$10: <strong className="text-white">Lot sales</strong> on eBay or Facebook Groups for time efficiency</li>
                </ul>
              </div>
            ) : totalValue > 500 ? (
              <div className="space-y-2 text-gray-300 text-sm">
                <p><strong className="text-emerald-400">eBay individual + lots recommended.</strong> At ${totalValue.toLocaleString()}, maximize payout by listing valuable cards individually and bundling the rest into lots.</p>
                <ul className="list-disc list-inside space-y-1 text-gray-400">
                  <li>Cards worth $10+: List individually on eBay</li>
                  <li>Cards worth &lt;$10: Bundle into sport-specific or era lots</li>
                </ul>
              </div>
            ) : (
              <div className="space-y-2 text-gray-300 text-sm">
                <p><strong className="text-emerald-400">Quick sale recommended.</strong> For a ${totalValue.toLocaleString()} collection, your time is the biggest cost. Sell to your LCS or bundle everything into 1-2 Facebook Group posts.</p>
              </div>
            )}
          </div>

          {/* Cross-links */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { href: '/tools/selling-platforms', label: 'Platform Fee Guide', desc: 'Compare all selling platforms' },
              { href: '/tools/ebay-fee-calc', label: 'eBay Fee Calculator', desc: 'Exact eBay payout math' },
              { href: '/tools/shipping-calc', label: 'Shipping Calculator', desc: 'Cost per method' },
              { href: '/vault/insurance', label: 'Insurance Estimator', desc: 'Insure before you sell' },
            ].map(link => (
              <Link key={link.href} href={link.href} className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-emerald-700 transition-colors group">
                <div className="text-white text-sm font-medium group-hover:text-emerald-400 transition-colors">{link.label}</div>
                <div className="text-gray-500 text-xs mt-1">{link.desc}</div>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* Empty state */}
      {entries.length === 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-10 text-center">
          <div className="text-4xl mb-3">$</div>
          <h3 className="text-lg font-bold text-white mb-2">Add cards to see selling strategies</h3>
          <p className="text-gray-400 text-sm mb-4">
            Search for cards in our database, add them manually, or load your vault collection.
            We will compare 6 different selling methods and show you the best strategy.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => {
                const samples = sportsCards.slice(0, 5);
                setEntries(samples.map(c => ({
                  id: `sample-${c.slug}`,
                  card: c,
                  manualName: '',
                  manualValue: 0,
                  quantity: 1,
                })));
              }}
              className="text-sm px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg hover:border-emerald-600 hover:text-emerald-400 transition-colors"
            >
              Try with Sample Cards
            </button>
            <button
              onClick={loadVaultCards}
              className="text-sm px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg hover:border-emerald-600 hover:text-emerald-400 transition-colors"
            >
              Load from Vault
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
