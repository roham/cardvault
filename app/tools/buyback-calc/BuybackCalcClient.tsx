'use client';

import { useState, useMemo, useCallback } from 'react';

interface CardEntry {
  id: string;
  name: string;
  marketValue: number;
  condition: 'raw' | 'graded';
  grade?: number;
  category: 'hot' | 'standard' | 'slow';
}

interface DealerTier {
  label: string;
  description: string;
  hotPct: number;
  stdPct: number;
  slowPct: number;
}

const DEALER_TIERS: DealerTier[] = [
  { label: 'Aggressive Buyer', description: 'High-volume dealer, card show, wants inventory fast', hotPct: 0.60, stdPct: 0.50, slowPct: 0.35 },
  { label: 'Fair Market Dealer', description: 'Standard LCS or online dealer, balanced offers', hotPct: 0.55, stdPct: 0.45, slowPct: 0.30 },
  { label: 'Conservative Buyer', description: 'Cautious dealer, cherry-picks, low-balls bulk', hotPct: 0.50, stdPct: 0.40, slowPct: 0.20 },
];

const SELF_SELL_CHANNELS = [
  { label: 'eBay', feePct: 0.1325, fixedFee: 0.30, shippingCost: 1.50, timeEstimate: '3-14 days' },
  { label: 'Mercari', feePct: 0.10, fixedFee: 0, shippingCost: 1.50, timeEstimate: '3-21 days' },
  { label: 'Facebook Groups', feePct: 0.03, fixedFee: 0, shippingCost: 1.50, timeEstimate: '1-7 days' },
  { label: 'Card Show Table', feePct: 0, fixedFee: 0, shippingCost: 0, timeEstimate: '1-2 days' },
];

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function fmt(n: number): string {
  return n < 0 ? `-$${Math.abs(n).toFixed(2)}` : `$${n.toFixed(2)}`;
}

function pct(n: number): string {
  return `${(n * 100).toFixed(0)}%`;
}

function getCategoryLabel(cat: string): string {
  switch (cat) {
    case 'hot': return 'Hot / High Demand';
    case 'slow': return 'Slow / Low Demand';
    default: return 'Standard';
  }
}

function getCategoryColor(cat: string): string {
  switch (cat) {
    case 'hot': return 'text-red-400';
    case 'slow': return 'text-blue-400';
    default: return 'text-gray-400';
  }
}

export default function BuybackCalcClient() {
  const [cards, setCards] = useState<CardEntry[]>([]);
  const [name, setName] = useState('');
  const [marketValue, setMarketValue] = useState('');
  const [condition, setCondition] = useState<'raw' | 'graded'>('raw');
  const [grade, setGrade] = useState('9');
  const [category, setCategory] = useState<'hot' | 'standard' | 'slow'>('standard');
  const [showResults, setShowResults] = useState(false);

  const addCard = useCallback(() => {
    const val = parseFloat(marketValue);
    if (!name.trim() || isNaN(val) || val <= 0) return;
    const entry: CardEntry = {
      id: genId(),
      name: name.trim(),
      marketValue: val,
      condition,
      grade: condition === 'graded' ? parseFloat(grade) : undefined,
      category,
    };
    setCards(prev => [...prev, entry]);
    setName('');
    setMarketValue('');
    setCategory('standard');
  }, [name, marketValue, condition, grade, category]);

  const removeCard = useCallback((id: string) => {
    setCards(prev => prev.filter(c => c.id !== id));
  }, []);

  const totalMarketValue = useMemo(() => cards.reduce((s, c) => s + c.marketValue, 0), [cards]);

  const dealerOffers = useMemo(() => {
    return DEALER_TIERS.map(tier => {
      let totalOffer = 0;
      const perCard = cards.map(c => {
        let rate: number;
        switch (c.category) {
          case 'hot': rate = tier.hotPct; break;
          case 'slow': rate = tier.slowPct; break;
          default: rate = tier.stdPct;
        }
        // Graded cards get a small bump
        if (c.condition === 'graded' && c.grade && c.grade >= 9) rate = Math.min(rate + 0.05, 0.70);
        const offer = c.marketValue * rate;
        totalOffer += offer;
        return { ...c, rate, offer };
      });
      return {
        ...tier,
        totalOffer,
        pctOfMarket: totalMarketValue > 0 ? totalOffer / totalMarketValue : 0,
        perCard,
      };
    });
  }, [cards, totalMarketValue]);

  const selfSellAnalysis = useMemo(() => {
    return SELF_SELL_CHANNELS.map(ch => {
      let totalNet = 0;
      let totalFees = 0;
      let totalShipping = 0;
      cards.forEach(c => {
        const fees = c.marketValue * ch.feePct + ch.fixedFee;
        const net = c.marketValue - fees - ch.shippingCost;
        totalFees += fees;
        totalShipping += ch.shippingCost;
        totalNet += net;
      });
      return {
        ...ch,
        totalNet,
        totalFees,
        totalShipping,
        pctOfMarket: totalMarketValue > 0 ? totalNet / totalMarketValue : 0,
      };
    });
  }, [cards, totalMarketValue]);

  const bestDealerOffer = useMemo(() => {
    if (dealerOffers.length === 0) return 0;
    return Math.max(...dealerOffers.map(d => d.totalOffer));
  }, [dealerOffers]);

  const bestSelfSell = useMemo(() => {
    if (selfSellAnalysis.length === 0) return 0;
    return Math.max(...selfSellAnalysis.map(s => s.totalNet));
  }, [selfSellAnalysis]);

  const verdict = useMemo(() => {
    if (cards.length === 0) return null;
    const gap = bestSelfSell - bestDealerOffer;
    const gapPct = totalMarketValue > 0 ? gap / totalMarketValue : 0;
    if (gapPct < 0.05) {
      return { text: 'Dealer offer is close to self-selling profit — convenience may be worth it', color: 'text-green-400', recommendation: 'SELL TO DEALER' };
    } else if (gapPct < 0.15) {
      return { text: 'Self-selling earns moderately more — worth it if you have time', color: 'text-yellow-400', recommendation: 'CONSIDER SELF-SELLING' };
    } else {
      return { text: 'Significant profit left on the table with a dealer — sell yourself', color: 'text-red-400', recommendation: 'SELL YOURSELF' };
    }
  }, [cards, bestSelfSell, bestDealerOffer, totalMarketValue]);

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Add Cards to Evaluate</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Card Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. 2020 Prizm Justin Herbert RC"
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Market Value ($)</label>
            <input
              type="number"
              value={marketValue}
              onChange={e => setMarketValue(e.target.value)}
              placeholder="e.g. 150"
              min="0"
              step="0.01"
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Condition</label>
            <select
              value={condition}
              onChange={e => setCondition(e.target.value as 'raw' | 'graded')}
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-600 rounded-xl text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="raw">Raw (ungraded)</option>
              <option value="graded">Graded (slabbed)</option>
            </select>
          </div>
          {condition === 'graded' && (
            <div>
              <label className="block text-sm text-gray-400 mb-1">Grade</label>
              <select
                value={grade}
                onChange={e => setGrade(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-600 rounded-xl text-white focus:border-emerald-500 focus:outline-none"
              >
                {[10, 9.5, 9, 8.5, 8, 7.5, 7, 6.5, 6, 5, 4, 3, 2, 1].map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Demand Level</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as 'hot' | 'standard' | 'slow')}
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-600 rounded-xl text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="hot">Hot / High Demand (rookies, stars, trending)</option>
              <option value="standard">Standard (regular cards, decent sellers)</option>
              <option value="slow">Slow / Low Demand (commons, base, niche)</option>
            </select>
          </div>
        </div>
        <button
          onClick={addCard}
          disabled={!name.trim() || !marketValue || parseFloat(marketValue) <= 0}
          className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-xl transition-colors"
        >
          + Add Card
        </button>
      </div>

      {/* Quick Presets */}
      <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-4">
        <p className="text-sm text-gray-400 mb-3">Quick Add Examples:</p>
        <div className="flex flex-wrap gap-2">
          {[
            { n: 'PSA 10 Wemby Prizm RC', v: 800, cond: 'graded' as const, g: 10, cat: 'hot' as const },
            { n: 'Raw Jalen Brunson Prizm', v: 45, cond: 'raw' as const, cat: 'standard' as const },
            { n: 'Lot of 50 Base Cards', v: 25, cond: 'raw' as const, cat: 'slow' as const },
            { n: 'PSA 9 Ohtani RC', v: 350, cond: 'graded' as const, g: 9, cat: 'hot' as const },
            { n: 'Raw Vintage Hank Aaron', v: 200, cond: 'raw' as const, cat: 'standard' as const },
          ].map((ex, i) => (
            <button
              key={i}
              onClick={() => {
                setCards(prev => [...prev, {
                  id: genId(),
                  name: ex.n,
                  marketValue: ex.v,
                  condition: ex.cond,
                  grade: ex.g,
                  category: ex.cat,
                }]);
              }}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-xs text-gray-300 hover:text-white transition-colors"
            >
              {ex.n} ({fmt(ex.v)})
            </button>
          ))}
        </div>
      </div>

      {/* Card List */}
      {cards.length > 0 && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Your Cards ({cards.length})</h2>
            <div className="text-right">
              <div className="text-sm text-gray-400">Total Market Value</div>
              <div className="text-xl font-bold text-emerald-400">{fmt(totalMarketValue)}</div>
            </div>
          </div>
          <div className="space-y-2 mb-4">
            {cards.map(c => (
              <div key={c.id} className="flex items-center justify-between gap-3 bg-gray-900/50 border border-gray-700/50 rounded-xl px-4 py-3">
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate">{c.name}</div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                    <span>{c.condition === 'graded' ? `Graded ${c.grade}` : 'Raw'}</span>
                    <span>&middot;</span>
                    <span className={getCategoryColor(c.category)}>{getCategoryLabel(c.category)}</span>
                  </div>
                </div>
                <div className="text-right flex items-center gap-3">
                  <span className="text-white font-medium">{fmt(c.marketValue)}</span>
                  <button onClick={() => removeCard(c.id)} className="text-gray-500 hover:text-red-400 text-lg transition-colors">&times;</button>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowResults(true)}
            className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors text-lg"
          >
            Calculate Buyback Offers
          </button>
        </div>
      )}

      {/* Results */}
      {showResults && cards.length > 0 && (
        <>
          {/* Verdict */}
          {verdict && (
            <div className="bg-gray-800/80 border-2 border-emerald-800/50 rounded-2xl p-6 text-center">
              <div className="text-sm text-gray-400 mb-1">Recommendation</div>
              <div className={`text-2xl font-bold mb-2 ${verdict.color}`}>{verdict.recommendation}</div>
              <p className="text-gray-400 text-sm">{verdict.text}</p>
              <div className="flex justify-center gap-8 mt-4">
                <div>
                  <div className="text-xs text-gray-500">Best Dealer Offer</div>
                  <div className="text-lg font-bold text-orange-400">{fmt(bestDealerOffer)}</div>
                  <div className="text-xs text-gray-500">{totalMarketValue > 0 ? pct(bestDealerOffer / totalMarketValue) : '0%'} of market</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Best Self-Sell Net</div>
                  <div className="text-lg font-bold text-emerald-400">{fmt(bestSelfSell)}</div>
                  <div className="text-xs text-gray-500">{totalMarketValue > 0 ? pct(bestSelfSell / totalMarketValue) : '0%'} of market</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Difference</div>
                  <div className="text-lg font-bold text-white">{fmt(bestSelfSell - bestDealerOffer)}</div>
                  <div className="text-xs text-gray-500">extra from self-selling</div>
                </div>
              </div>
            </div>
          )}

          {/* Dealer Offers Table */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Dealer Buyback Estimates</h2>
            <div className="space-y-4">
              {dealerOffers.map((d, i) => (
                <div key={i} className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-white font-medium">{d.label}</div>
                      <div className="text-xs text-gray-500">{d.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-orange-400">{fmt(d.totalOffer)}</div>
                      <div className="text-xs text-gray-500">{pct(d.pctOfMarket)} of market</div>
                    </div>
                  </div>
                  {/* Per-card breakdown */}
                  <div className="mt-3 border-t border-gray-700/50 pt-3">
                    <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 text-xs">
                      <div className="text-gray-500 font-medium">Card</div>
                      <div className="text-gray-500 font-medium text-right">Market</div>
                      <div className="text-gray-500 font-medium text-right">Rate</div>
                      <div className="text-gray-500 font-medium text-right">Offer</div>
                      {d.perCard.map(pc => (
                        <div key={pc.id} className="contents">
                          <div className="text-gray-300 truncate">{pc.name}</div>
                          <div className="text-gray-400 text-right">{fmt(pc.marketValue)}</div>
                          <div className="text-gray-400 text-right">{pct(pc.rate)}</div>
                          <div className="text-orange-400 text-right font-medium">{fmt(pc.offer)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Self-Sell Comparison */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Self-Selling Comparison</h2>
            <p className="text-sm text-gray-400 mb-4">
              What you&apos;d keep after fees and shipping if you sold each card individually.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 text-xs">
                    <th className="text-left pb-3 font-medium">Platform</th>
                    <th className="text-right pb-3 font-medium">Fees</th>
                    <th className="text-right pb-3 font-medium">Shipping</th>
                    <th className="text-right pb-3 font-medium">Net Payout</th>
                    <th className="text-right pb-3 font-medium">% of Market</th>
                    <th className="text-right pb-3 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {selfSellAnalysis.map((ch, i) => (
                    <tr key={i} className="border-t border-gray-700/50">
                      <td className="py-3 text-white font-medium">{ch.label}</td>
                      <td className="py-3 text-right text-red-400">{fmt(ch.totalFees)}</td>
                      <td className="py-3 text-right text-red-400">{fmt(ch.totalShipping)}</td>
                      <td className="py-3 text-right text-emerald-400 font-bold">{fmt(ch.totalNet)}</td>
                      <td className="py-3 text-right text-gray-400">{pct(ch.pctOfMarket)}</td>
                      <td className="py-3 text-right text-gray-500">{ch.timeEstimate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tips Section */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Dealer Negotiation Tips</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: 'Know Your Numbers', tip: 'Look up recent eBay sold comps before approaching a dealer. Having data gives you leverage.' },
                { title: 'Let Them Offer First', tip: 'Never name your price first. Ask "What would you give me for these?" and negotiate from their starting point.' },
                { title: 'Bundle Strategically', tip: 'Pair high-demand cards with slower movers. Dealers may offer better rates on bulk if the lot includes cards they want.' },
                { title: 'Cash Is King', tip: 'Cash deals often get 5-10% better offers than trades or store credit. Dealers save on payment processing.' },
                { title: 'Timing Matters', tip: 'Sunday afternoon at a card show = dealers want to avoid packing unsold inventory. Best time for bulk offers.' },
                { title: 'Walk Away Power', tip: 'The willingness to walk away is your strongest negotiation tool. There are always other dealers and other shows.' },
              ].map((t, i) => (
                <div key={i} className="bg-gray-900/50 rounded-xl p-4">
                  <div className="text-white font-medium text-sm mb-1">{t.title}</div>
                  <div className="text-gray-400 text-xs leading-relaxed">{t.tip}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Empty State */}
      {cards.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-3">🤝</div>
          <p className="text-lg mb-1">Add cards above to calculate dealer buyback offers</p>
          <p className="text-sm">Or use the quick-add examples to see how it works</p>
        </div>
      )}
    </div>
  );
}
