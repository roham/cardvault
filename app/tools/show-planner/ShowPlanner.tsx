'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

interface SellItem {
  id: number;
  name: string;
  askPrice: number;
  cost: number;
}

interface BuyTarget {
  id: number;
  name: string;
  budget: number;
}

function fmt(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return `$${Math.round(n).toLocaleString()}`;
}

const SHOW_PRESETS = [
  { label: 'Small Local Show', table: 50, travel: 20, food: 15, sellThrough: 0.3 },
  { label: 'Regional Show', table: 150, travel: 75, food: 30, sellThrough: 0.35 },
  { label: 'Major Show (National)', table: 500, travel: 300, food: 60, sellThrough: 0.4 },
  { label: 'Card Shop Popup', table: 0, travel: 10, food: 10, sellThrough: 0.25 },
];

export default function ShowPlanner() {
  const [tableCost, setTableCost] = useState(150);
  const [travelCost, setTravelCost] = useState(75);
  const [foodCost, setFoodCost] = useState(30);
  const [sellThroughRate, setSellThroughRate] = useState(0.35);
  const [sellItems, setSellItems] = useState<SellItem[]>([
    { id: 1, name: 'PSA 10 Rookie Card', askPrice: 200, cost: 80 },
    { id: 2, name: 'Vintage Base Card', askPrice: 50, cost: 15 },
    { id: 3, name: 'Sealed Product', askPrice: 150, cost: 100 },
  ]);
  const [buyTargets, setBuyTargets] = useState<BuyTarget[]>([
    { id: 1, name: 'Target pickup', budget: 100 },
  ]);
  const [nextId, setNextId] = useState(4);
  const [nextBuyId, setNextBuyId] = useState(2);
  const [showResults, setShowResults] = useState(false);
  const [negotiationDiscount, setNegotiationDiscount] = useState(10); // buyers negotiate down %

  const totalExpenses = tableCost + travelCost + foodCost;
  const totalBuyBudget = buyTargets.reduce((s, b) => s + b.budget, 0);
  const totalAskPrice = sellItems.reduce((s, i) => s + i.askPrice, 0);
  const totalCOGS = sellItems.reduce((s, i) => s + i.cost, 0);
  const effectiveSellPrice = totalAskPrice * (1 - negotiationDiscount / 100);
  const projectedRevenue = effectiveSellPrice * sellThroughRate;
  const projectedProfit = projectedRevenue - totalExpenses - totalBuyBudget;
  const breakEvenRevenue = totalExpenses + totalBuyBudget;
  const breakEvenSellThrough = totalAskPrice > 0 ? breakEvenRevenue / effectiveSellPrice : 0;
  const roiOnInventory = totalCOGS > 0 ? ((projectedRevenue - totalCOGS * sellThroughRate) / (totalCOGS * sellThroughRate + totalExpenses)) * 100 : 0;
  const profitPerItem = sellItems.length > 0 ? projectedProfit / (sellItems.length * sellThroughRate || 1) : 0;

  const addSellItem = () => {
    setSellItems([...sellItems, { id: nextId, name: '', askPrice: 0, cost: 0 }]);
    setNextId(n => n + 1);
    setShowResults(false);
  };
  const removeSellItem = (id: number) => {
    setSellItems(sellItems.filter(i => i.id !== id));
    setShowResults(false);
  };
  const updateSellItem = (id: number, field: keyof SellItem, value: string | number) => {
    setSellItems(sellItems.map(i => i.id === id ? { ...i, [field]: value } : i));
    setShowResults(false);
  };
  const addBuyTarget = () => {
    setBuyTargets([...buyTargets, { id: nextBuyId, name: '', budget: 0 }]);
    setNextBuyId(n => n + 1);
    setShowResults(false);
  };
  const removeBuyTarget = (id: number) => {
    setBuyTargets(buyTargets.filter(b => b.id !== id));
    setShowResults(false);
  };
  const updateBuyTarget = (id: number, field: keyof BuyTarget, value: string | number) => {
    setBuyTargets(buyTargets.map(b => b.id === id ? { ...b, [field]: value } : b));
    setShowResults(false);
  };

  const applyPreset = (preset: typeof SHOW_PRESETS[0]) => {
    setTableCost(preset.table);
    setTravelCost(preset.travel);
    setFoodCost(preset.food);
    setSellThroughRate(preset.sellThrough);
    setShowResults(false);
  };

  const verdict = projectedProfit > 200 ? { text: 'Profitable Show', color: 'text-green-400 bg-green-950/50 border-green-800/50', desc: 'Strong projected profit. This show is worth attending.' }
    : projectedProfit > 0 ? { text: 'Marginal Profit', color: 'text-emerald-400 bg-emerald-950/50 border-emerald-800/50', desc: 'Small profit expected. Could go either way depending on foot traffic.' }
    : projectedProfit > -50 ? { text: 'Break Even', color: 'text-yellow-400 bg-yellow-950/50 border-yellow-800/50', desc: 'Likely to break even. Good for networking, not for profit.' }
    : { text: 'Skip This Show', color: 'text-red-400 bg-red-950/50 border-red-800/50', desc: 'Projected loss. Sell online or wait for a better show.' };

  // Best and worst items
  const itemsWithMargin = sellItems.map(i => ({
    ...i,
    margin: i.askPrice > 0 ? ((i.askPrice * (1 - negotiationDiscount / 100) - i.cost) / i.askPrice) * 100 : 0,
    profit: i.askPrice * (1 - negotiationDiscount / 100) - i.cost,
  })).sort((a, b) => b.margin - a.margin);

  return (
    <div className="space-y-8">
      {/* Presets */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Quick Presets</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SHOW_PRESETS.map(p => (
            <button key={p.label} onClick={() => applyPreset(p)}
              className="p-3 bg-gray-800 border border-gray-700 rounded-lg text-left hover:bg-gray-700 transition-colors"
            >
              <div className="text-white text-sm font-medium">{p.label}</div>
              <div className="text-gray-400 text-xs mt-1">Table: ${p.table} &middot; Travel: ${p.travel}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Show Costs */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">1. Show Expenses</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { label: 'Table/Booth Cost', value: tableCost, set: setTableCost },
            { label: 'Travel (gas/parking/hotel)', value: travelCost, set: setTravelCost },
            { label: 'Food & Supplies', value: foodCost, set: setFoodCost },
          ].map(f => (
            <div key={f.label}>
              <label className="text-gray-400 text-sm block mb-1">{f.label}</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                <input type="number" value={f.value}
                  onChange={e => { f.set(Number(e.target.value) || 0); setShowResults(false); }}
                  className="w-full pl-7 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-4">
          <div>
            <label className="text-gray-400 text-sm block mb-1">Expected Sell-Through Rate</label>
            <div className="flex items-center gap-2">
              <input type="range" min="10" max="80" step="5" value={sellThroughRate * 100}
                onChange={e => { setSellThroughRate(Number(e.target.value) / 100); setShowResults(false); }}
                className="flex-1"
              />
              <span className="text-indigo-400 font-mono text-sm w-12 text-right">{(sellThroughRate * 100).toFixed(0)}%</span>
            </div>
          </div>
          <div>
            <label className="text-gray-400 text-sm block mb-1">Negotiation Discount</label>
            <div className="flex items-center gap-2">
              <input type="range" min="0" max="30" step="5" value={negotiationDiscount}
                onChange={e => { setNegotiationDiscount(Number(e.target.value)); setShowResults(false); }}
                className="flex-1"
              />
              <span className="text-amber-400 font-mono text-sm w-12 text-right">{negotiationDiscount}%</span>
            </div>
          </div>
        </div>
        <div className="mt-3 text-right text-sm">
          <span className="text-gray-400">Total Expenses: </span>
          <span className="text-red-400 font-bold">{fmt(totalExpenses)}</span>
        </div>
      </div>

      {/* Cards to Sell */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-white">2. Cards to Sell</h2>
          <button onClick={addSellItem}
            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm transition-colors"
          >+ Add Card</button>
        </div>
        <div className="space-y-3">
          {sellItems.map(item => (
            <div key={item.id} className="flex gap-2 items-center">
              <input type="text" value={item.name} placeholder="Card name"
                onChange={e => updateSellItem(item.id, 'name', e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
              />
              <div className="relative w-24">
                <span className="absolute left-2 top-2 text-gray-500 text-sm">$</span>
                <input type="number" value={item.askPrice || ''} placeholder="Ask"
                  onChange={e => updateSellItem(item.id, 'askPrice', Number(e.target.value) || 0)}
                  className="w-full pl-5 pr-2 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="relative w-24">
                <span className="absolute left-2 top-2 text-gray-500 text-sm">$</span>
                <input type="number" value={item.cost || ''} placeholder="Cost"
                  onChange={e => updateSellItem(item.id, 'cost', Number(e.target.value) || 0)}
                  className="w-full pl-5 pr-2 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
              <button onClick={() => removeSellItem(item.id)} className="text-gray-500 hover:text-red-400 text-sm px-1">X</button>
            </div>
          ))}
        </div>
        <div className="mt-3 text-right text-sm">
          <span className="text-gray-400">Total Ask: </span>
          <span className="text-green-400 font-bold">{fmt(totalAskPrice)}</span>
          <span className="text-gray-500 mx-2">|</span>
          <span className="text-gray-400">COGS: </span>
          <span className="text-gray-300">{fmt(totalCOGS)}</span>
        </div>
      </div>

      {/* Buy Targets */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-white">3. Buy Budget (optional)</h2>
          <button onClick={addBuyTarget}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
          >+ Add Target</button>
        </div>
        <div className="space-y-3">
          {buyTargets.map(b => (
            <div key={b.id} className="flex gap-2 items-center">
              <input type="text" value={b.name} placeholder="What to buy"
                onChange={e => updateBuyTarget(b.id, 'name', e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
              />
              <div className="relative w-28">
                <span className="absolute left-2 top-2 text-gray-500 text-sm">$</span>
                <input type="number" value={b.budget || ''} placeholder="Budget"
                  onChange={e => updateBuyTarget(b.id, 'budget', Number(e.target.value) || 0)}
                  className="w-full pl-5 pr-2 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
              <button onClick={() => removeBuyTarget(b.id)} className="text-gray-500 hover:text-red-400 text-sm px-1">X</button>
            </div>
          ))}
        </div>
      </div>

      {/* Calculate */}
      <button onClick={() => setShowResults(true)}
        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-lg transition-all"
      >
        Calculate Show P&L
      </button>

      {/* Results */}
      {showResults && (
        <div className="space-y-6">
          {/* Verdict */}
          <div className={`border rounded-xl p-6 ${verdict.color}`}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="text-2xl font-bold">{verdict.text}</div>
                <div className="text-sm opacity-80 mt-1">{verdict.desc}</div>
              </div>
              <div className="text-right">
                <div className="text-sm opacity-70">Projected P&L</div>
                <div className="text-2xl font-bold">{projectedProfit >= 0 ? '+' : ''}{fmt(projectedProfit)}</div>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Projected Revenue', value: fmt(projectedRevenue), sub: `${(sellThroughRate * 100).toFixed(0)}% sell-through` },
              { label: 'Total Expenses', value: fmt(totalExpenses + totalBuyBudget), sub: `Table + Travel + Buys` },
              { label: 'Break-Even Rate', value: `${Math.min(100, breakEvenSellThrough * 100).toFixed(0)}%`, sub: breakEvenSellThrough <= sellThroughRate ? 'Achievable' : 'Tough target' },
              { label: 'ROI on Inventory', value: `${roiOnInventory.toFixed(0)}%`, sub: roiOnInventory > 0 ? 'Positive return' : 'Negative return' },
            ].map(s => (
              <div key={s.label} className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
                <div className="text-gray-400 text-xs mb-1">{s.label}</div>
                <div className="text-white text-xl font-bold">{s.value}</div>
                <div className="text-gray-500 text-xs mt-1">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* P&L Breakdown */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
            <h3 className="text-white font-bold mb-4">P&L Breakdown</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Total Ask Price</span><span className="text-gray-300">{fmt(totalAskPrice)}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">After {negotiationDiscount}% negotiation</span><span className="text-gray-300">{fmt(effectiveSellPrice)}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">At {(sellThroughRate * 100).toFixed(0)}% sell-through</span><span className="text-green-400 font-bold">{fmt(projectedRevenue)}</span></div>
              <div className="border-t border-gray-800 my-2" />
              <div className="flex justify-between"><span className="text-gray-400">Table/Booth</span><span className="text-red-400">-{fmt(tableCost)}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Travel</span><span className="text-red-400">-{fmt(travelCost)}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Food & Supplies</span><span className="text-red-400">-{fmt(foodCost)}</span></div>
              {totalBuyBudget > 0 && (
                <div className="flex justify-between"><span className="text-gray-400">Buy Budget</span><span className="text-red-400">-{fmt(totalBuyBudget)}</span></div>
              )}
              <div className="border-t-2 border-gray-700 my-2" />
              <div className="flex justify-between font-bold">
                <span className="text-white">Net Profit/Loss</span>
                <span className={projectedProfit >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {projectedProfit >= 0 ? '+' : ''}{fmt(projectedProfit)}
                </span>
              </div>
            </div>
          </div>

          {/* Item Analysis */}
          {itemsWithMargin.length > 0 && (
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
              <h3 className="text-white font-bold mb-4">Item Margin Analysis</h3>
              <div className="space-y-2">
                {itemsWithMargin.filter(i => i.name).map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="flex-1 text-white text-sm">{item.name}</div>
                    <div className="w-24 text-right text-sm text-gray-400">{fmt(item.profit)} profit</div>
                    <div className="w-16">
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div className={`h-2 rounded-full ${item.margin > 50 ? 'bg-green-500' : item.margin > 20 ? 'bg-emerald-500' : item.margin > 0 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${Math.min(100, Math.max(5, item.margin))}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-12 text-right text-xs font-mono text-gray-400">{item.margin.toFixed(0)}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
            <h3 className="text-white font-bold mb-4">Show Day Tips</h3>
            <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-400">
              <div>
                <div className="text-white font-medium mb-1">Pricing Strategy</div>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Price 10-15% above target to leave negotiation room</li>
                  <li>Bundle deals move slow inventory faster</li>
                  <li>End-of-show discounts (last 2 hours) boost sell-through</li>
                </ul>
              </div>
              <div>
                <div className="text-white font-medium mb-1">Maximize Sales</div>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Display high-value cards at eye level</li>
                  <li>Accept multiple payment methods (cash, Venmo, PayPal)</li>
                  <li>Bring business cards for follow-up sales</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Related Tools */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
            <h3 className="text-white font-bold mb-4">Related Tools</h3>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { href: '/tools/flip-calc', label: 'Flip Profit Calculator', desc: 'Calculate per-card flip profit' },
                { href: '/tools/show-finder', label: 'Card Show Finder', desc: 'Find shows near you' },
                { href: '/tools/show-checklist', label: 'Show Checklist', desc: 'What to bring to a show' },
                { href: '/tools/listing-generator', label: 'eBay Listing Generator', desc: 'List unsold cards online' },
                { href: '/tools/shipping-calc', label: 'Shipping Calculator', desc: 'Ship sales after the show' },
                { href: '/tools/bulk-lookup', label: 'Bulk Card Lookup', desc: 'Price check your inventory' },
              ].map(t => (
                <Link key={t.href} href={t.href}
                  className="p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg hover:bg-gray-700/50 transition-colors"
                >
                  <div className="text-white text-sm font-medium">{t.label}</div>
                  <div className="text-gray-500 text-xs mt-1">{t.desc}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
