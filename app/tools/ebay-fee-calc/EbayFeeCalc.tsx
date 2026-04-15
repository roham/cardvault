'use client';

import { useState, useMemo } from 'react';

const STORE_TYPES = [
  { name: 'No Store', fvfRate: 0.1325, monthlyFee: 0 },
  { name: 'Starter Store', fvfRate: 0.1325, monthlyFee: 7.95 },
  { name: 'Basic Store', fvfRate: 0.1325, monthlyFee: 27.95 },
  { name: 'Premium Store', fvfRate: 0.1175, monthlyFee: 74.95 },
  { name: 'Anchor Store', fvfRate: 0.1075, monthlyFee: 349.95 },
];

function fmt(n: number): string {
  return `$${n.toFixed(2)}`;
}

function pct(n: number): string {
  return `${(n * 100).toFixed(2)}%`;
}

export default function EbayFeeCalc() {
  const [salePrice, setSalePrice] = useState<string>('50');
  const [shippingCharged, setShippingCharged] = useState<string>('0');
  const [shippingCost, setShippingCost] = useState<string>('1.25');
  const [packagingCost, setPackagingCost] = useState<string>('0.35');
  const [cardCost, setCardCost] = useState<string>('');
  const [promotedRate, setPromotedRate] = useState<string>('0');
  const [storeIdx, setStoreIdx] = useState(0);
  const [quantity, setQuantity] = useState<string>('1');

  const result = useMemo(() => {
    const price = parseFloat(salePrice) || 0;
    const shipCharged = parseFloat(shippingCharged) || 0;
    const shipCost = parseFloat(shippingCost) || 0;
    const packCost = parseFloat(packagingCost) || 0;
    const cost = parseFloat(cardCost) || 0;
    const promoRate = (parseFloat(promotedRate) || 0) / 100;
    const store = STORE_TYPES[storeIdx];
    const qty = parseInt(quantity) || 1;

    if (price <= 0) return null;

    const totalSale = price + shipCharged;

    // eBay fees
    const fvf = totalSale * store.fvfRate;
    const perOrderFee = 0.30;
    const promotedFee = promoRate > 0 ? totalSale * promoRate : 0;
    const totalEbayFees = fvf + perOrderFee + promotedFee;

    // All costs
    const totalCosts = totalEbayFees + shipCost + packCost;
    const totalCostsWithCard = totalCosts + cost;

    // Net profit
    const netRevenue = totalSale - totalEbayFees;
    const netProfit = netRevenue - shipCost - packCost - cost;
    const profitMargin = totalSale > 0 ? (netProfit / totalSale) * 100 : 0;

    // Break-even (what you need to sell at to cover card cost + all fees)
    // breakEven * (1 - fvfRate - promoRate) - perOrderFee - shipCost - packCost = cost
    // breakEven = (cost + perOrderFee + shipCost + packCost) / (1 - fvfRate - promoRate)
    const effectiveRate = 1 - store.fvfRate - promoRate;
    const breakEven = effectiveRate > 0
      ? (cost + perOrderFee + shipCost + packCost) / effectiveRate
      : 0;

    // Effective fee rate
    const effectiveFeeRate = totalSale > 0 ? totalEbayFees / totalSale : 0;

    // Batch calculation
    const batchNetProfit = netProfit * qty;
    const batchFees = totalEbayFees * qty;

    return {
      totalSale,
      fvf,
      perOrderFee,
      promotedFee,
      totalEbayFees,
      shipCost,
      packCost,
      totalCosts,
      totalCostsWithCard,
      netRevenue,
      netProfit,
      profitMargin,
      breakEven,
      effectiveFeeRate,
      batchNetProfit,
      batchFees,
      qty,
    };
  }, [salePrice, shippingCharged, shippingCost, packagingCost, cardCost, promotedRate, storeIdx, quantity]);

  return (
    <div className="space-y-8">
      {/* Inputs */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
        <h2 className="text-lg font-bold text-white mb-4">Sale Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Sale Price ($)</label>
            <input type="number" step="0.01" value={salePrice} onChange={e => setSalePrice(e.target.value)} placeholder="50.00" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Shipping Charged to Buyer ($)</label>
            <input type="number" step="0.01" value={shippingCharged} onChange={e => setShippingCharged(e.target.value)} placeholder="0 (free shipping)" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Your Shipping Cost ($)</label>
            <input type="number" step="0.01" value={shippingCost} onChange={e => setShippingCost(e.target.value)} placeholder="1.25" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Packaging Cost ($)</label>
            <input type="number" step="0.01" value={packagingCost} onChange={e => setPackagingCost(e.target.value)} placeholder="0.35" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Card Cost / What You Paid ($)</label>
            <input type="number" step="0.01" value={cardCost} onChange={e => setCardCost(e.target.value)} placeholder="Optional" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Promoted Listing Rate (%)</label>
            <input type="number" min="0" max="100" step="0.5" value={promotedRate} onChange={e => setPromotedRate(e.target.value)} placeholder="0" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">eBay Store Type</label>
            <select value={storeIdx} onChange={e => setStoreIdx(parseInt(e.target.value))} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500">
              {STORE_TYPES.map((s, i) => (
                <option key={i} value={i}>{s.name} ({pct(s.fvfRate)} FVF)</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Quantity (for batch calc)</label>
            <input type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500" />
          </div>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Summary Banner */}
          <div className={`border rounded-xl p-6 ${result.netProfit >= 0 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-gray-400">Total Sale</div>
                <div className="text-2xl font-bold text-white">{fmt(result.totalSale)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Total eBay Fees</div>
                <div className="text-2xl font-bold text-red-400">-{fmt(result.totalEbayFees)}</div>
                <div className="text-xs text-gray-500">{pct(result.effectiveFeeRate)} effective</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Net Profit</div>
                <div className={`text-2xl font-bold ${result.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {result.netProfit >= 0 ? '+' : ''}{fmt(result.netProfit)}
                </div>
                <div className="text-xs text-gray-500">{result.profitMargin.toFixed(1)}% margin</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Break-Even Price</div>
                <div className="text-2xl font-bold text-amber-400">{fmt(result.breakEven)}</div>
                <div className="text-xs text-gray-500">minimum to sell at</div>
              </div>
            </div>
          </div>

          {/* Fee Breakdown */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
            <h3 className="text-lg font-bold text-white mb-4">Fee Breakdown</h3>
            <div className="space-y-2">
              {[
                { label: `Final Value Fee (${pct(STORE_TYPES[storeIdx].fvfRate)})`, value: result.fvf, color: 'text-red-400' },
                { label: 'Per-Order Surcharge', value: result.perOrderFee, color: 'text-red-400' },
                ...(result.promotedFee > 0 ? [{ label: `Promoted Listing (${promotedRate}%)`, value: result.promotedFee, color: 'text-red-400' }] : []),
              ].map(row => (
                <div key={row.label} className="flex justify-between text-sm">
                  <span className="text-gray-400">{row.label}</span>
                  <span className={row.color}>-{fmt(row.value)}</span>
                </div>
              ))}
              <div className="border-t border-gray-700 pt-2 flex justify-between text-sm font-medium">
                <span className="text-gray-300">Total eBay Fees</span>
                <span className="text-red-400">-{fmt(result.totalEbayFees)}</span>
              </div>
            </div>
          </div>

          {/* P&L Breakdown */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
            <h3 className="text-lg font-bold text-white mb-4">Profit & Loss</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Sale Amount</span><span className="text-emerald-400">+{fmt(result.totalSale)}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">eBay Fees</span><span className="text-red-400">-{fmt(result.totalEbayFees)}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Shipping Cost</span><span className="text-red-400">-{fmt(result.shipCost)}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Packaging</span><span className="text-red-400">-{fmt(result.packCost)}</span></div>
              {parseFloat(cardCost) > 0 && (
                <div className="flex justify-between"><span className="text-gray-400">Card Cost</span><span className="text-red-400">-{fmt(parseFloat(cardCost))}</span></div>
              )}
              <div className="border-t border-gray-700 pt-2 flex justify-between font-medium">
                <span className="text-gray-300">Net Profit</span>
                <span className={result.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                  {result.netProfit >= 0 ? '+' : ''}{fmt(result.netProfit)}
                </span>
              </div>
            </div>
          </div>

          {/* Batch Calculation */}
          {result.qty > 1 && (
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
              <h3 className="text-lg font-bold text-white mb-4">Batch: {result.qty} Cards</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                  <div className="text-xs text-gray-400 mb-1">Total Revenue</div>
                  <div className="text-xl font-bold text-white">{fmt(result.totalSale * result.qty)}</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                  <div className="text-xs text-gray-400 mb-1">Total Fees</div>
                  <div className="text-xl font-bold text-red-400">-{fmt(result.batchFees)}</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                  <div className="text-xs text-gray-400 mb-1">Total Profit</div>
                  <div className={`text-xl font-bold ${result.batchNetProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {result.batchNetProfit >= 0 ? '+' : ''}{fmt(result.batchNetProfit)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Reference */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
            <h3 className="text-lg font-bold text-white mb-3">eBay Fee Quick Reference (Sports Trading Cards)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left text-gray-400 pb-2">Store Type</th>
                    <th className="text-right text-gray-400 pb-2">FVF Rate</th>
                    <th className="text-right text-gray-400 pb-2">Monthly Fee</th>
                    <th className="text-right text-gray-400 pb-2">Fees on ${salePrice}</th>
                  </tr>
                </thead>
                <tbody>
                  {STORE_TYPES.map((s, i) => {
                    const fees = (parseFloat(salePrice) || 0) * s.fvfRate + 0.30;
                    return (
                      <tr key={i} className={`border-b border-gray-800 ${i === storeIdx ? 'bg-blue-500/10' : ''}`}>
                        <td className="py-2 text-white">{s.name}</td>
                        <td className="py-2 text-right text-gray-400">{pct(s.fvfRate)}</td>
                        <td className="py-2 text-right text-gray-400">{s.monthlyFee > 0 ? fmt(s.monthlyFee) : 'Free'}</td>
                        <td className="py-2 text-right text-red-400">-{fmt(fees)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
