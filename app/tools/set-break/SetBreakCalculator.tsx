'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

/* ---------- Types ---------- */
interface KeyCard {
  id: string;
  name: string;
  estimatedValue: number;
  quantity: number;
}

interface BreakResult {
  totalKeyCardRevenue: number;
  totalCommonRevenue: number;
  grossRevenue: number;
  platformFees: number;
  shippingCost: number;
  packagingCost: number;
  netRevenue: number;
  profit: number;
  profitMargin: number;
  breakEvenPrice: number;
  timeValue: number;
  verdict: 'excellent' | 'profitable' | 'marginal' | 'unprofitable';
}

/* ---------- Presets ---------- */
const SET_PRESETS = [
  { name: '1987 Topps Baseball (792 cards)', setCost: 25, totalCards: 792, keyCards: [{ name: 'Barry Bonds RC #320', value: 15 }, { name: 'Bo Jackson RC #170', value: 8 }, { name: 'Mark McGwire RC #366', value: 8 }, { name: 'Rafael Palmeiro RC #634', value: 3 }, { name: 'Barry Larkin RC #648', value: 5 }], commonValue: 0.10 },
  { name: '1986 Topps Football (396 cards)', setCost: 80, totalCards: 396, keyCards: [{ name: 'Jerry Rice RC #161', value: 60 }, { name: 'Steve Young RC #374', value: 25 }, { name: 'Reggie White RC #275', value: 15 }, { name: 'Andre Reed RC #388', value: 5 }], commonValue: 0.15 },
  { name: '2020 Topps Chrome Baseball (200 cards)', setCost: 200, totalCards: 200, keyCards: [{ name: 'Luis Robert RC #60', value: 20 }, { name: 'Kyle Lewis RC #186', value: 8 }, { name: 'Bo Bichette #150', value: 5 }, { name: 'Yordan Alvarez #200', value: 10 }], commonValue: 0.50 },
  { name: '1989 Upper Deck Baseball (800 cards)', setCost: 30, totalCards: 800, keyCards: [{ name: 'Ken Griffey Jr RC #1', value: 30 }, { name: 'Randy Johnson RC #25', value: 10 }, { name: 'Gary Sheffield RC #13', value: 5 }, { name: 'John Smoltz RC #17', value: 4 }], commonValue: 0.05 },
  { name: '2022 Topps Series 1 Baseball (330 cards)', setCost: 60, totalCards: 330, keyCards: [{ name: 'Wander Franco #215', value: 5 }, { name: 'Bobby Witt Jr RC #BW', value: 8 }, { name: 'Julio Rodriguez RC #JR', value: 10 }, { name: 'Oneil Cruz RC #OC', value: 3 }], commonValue: 0.25 },
  { name: '1993-94 Topps Basketball (396 cards)', setCost: 40, totalCards: 396, keyCards: [{ name: 'Chris Webber RC #224', value: 8 }, { name: 'Anfernee Hardaway RC #334', value: 10 }, { name: 'Jamal Mashburn RC #238', value: 3 }, { name: 'Vin Baker RC #232', value: 2 }], commonValue: 0.10 },
  { name: '2019-20 Panini Prizm Basketball (300 cards)', setCost: 500, totalCards: 300, keyCards: [{ name: 'Zion Williamson RC #248', value: 80 }, { name: 'Ja Morant RC #249', value: 50 }, { name: 'RJ Barrett RC #250', value: 10 }, { name: 'Tyler Herro RC #259', value: 15 }, { name: 'Rui Hachimura RC #255', value: 5 }], commonValue: 0.75 },
  { name: '2024 Topps Series 1 Baseball (330 cards)', setCost: 55, totalCards: 330, keyCards: [{ name: 'Shohei Ohtani #1', value: 8 }, { name: 'Elly De La Cruz #150', value: 5 }, { name: 'Corbin Carroll #200', value: 3 }, { name: 'Gunnar Henderson #100', value: 3 }], commonValue: 0.25 },
];

const PLATFORMS = [
  { name: 'eBay', feeRate: 0.1325, label: '13.25%' },
  { name: 'COMC', feeRate: 0.20, label: '20%' },
  { name: 'MySlabs', feeRate: 0.05, label: '5%' },
  { name: 'Mercari', feeRate: 0.10, label: '10%' },
  { name: 'Facebook Groups', feeRate: 0.0, label: '0% (but PayPal G&S 2.9%)' },
  { name: 'Card Shows', feeRate: 0.0, label: '0% (table fee separate)' },
];

function fmt(n: number): string {
  if (n >= 10000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

function getVerdict(margin: number): { label: string; color: string; bg: string; desc: string } {
  if (margin >= 40) return { label: 'EXCELLENT', color: 'text-emerald-400', bg: 'bg-emerald-500/20 border-emerald-500/30', desc: 'Very strong profit margin. This set break is a clear win.' };
  if (margin >= 15) return { label: 'PROFITABLE', color: 'text-sky-400', bg: 'bg-sky-500/20 border-sky-500/30', desc: 'Solid profit after fees. Worth the time investment.' };
  if (margin >= 0) return { label: 'MARGINAL', color: 'text-amber-400', bg: 'bg-amber-500/20 border-amber-500/30', desc: 'Small profit. Consider if the time spent is worth it.' };
  return { label: 'UNPROFITABLE', color: 'text-red-400', bg: 'bg-red-500/20 border-red-500/30', desc: 'You will lose money breaking this set. Keep it complete.' };
}

let nextId = 1;
function genId(): string { return `kc-${nextId++}`; }

export default function SetBreakCalculator() {
  const [setCost, setSetCost] = useState<string>('');
  const [totalCards, setTotalCards] = useState<string>('');
  const [commonBulkPrice, setCommonBulkPrice] = useState<string>('0.25');
  const [platformIdx, setPlatformIdx] = useState(0);
  const [shippingPerCard, setShippingPerCard] = useState<string>('1.25');
  const [packagingPerCard, setPackagingPerCard] = useState<string>('0.35');
  const [minutesPerCard, setMinutesPerCard] = useState<string>('3');
  const [hourlyRate, setHourlyRate] = useState<string>('15');
  const [sellThroughPct, setSellThroughPct] = useState<string>('80');
  const [keyCards, setKeyCards] = useState<KeyCard[]>([
    { id: genId(), name: '', estimatedValue: 0, quantity: 1 },
  ]);

  /* Preset loader */
  function loadPreset(idx: number) {
    const p = SET_PRESETS[idx];
    if (!p) return;
    setSetCost(String(p.setCost));
    setTotalCards(String(p.totalCards));
    setCommonBulkPrice(String(p.commonValue));
    const cards = p.keyCards.map(k => ({
      id: genId(),
      name: k.name,
      estimatedValue: k.value,
      quantity: 1,
    }));
    setKeyCards(cards);
  }

  /* Add / remove key cards */
  function addKeyCard() {
    setKeyCards(prev => [...prev, { id: genId(), name: '', estimatedValue: 0, quantity: 1 }]);
  }
  function removeKeyCard(id: string) {
    setKeyCards(prev => prev.length <= 1 ? prev : prev.filter(c => c.id !== id));
  }
  function updateKeyCard(id: string, field: keyof KeyCard, value: string | number) {
    setKeyCards(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  }

  /* Calculate */
  const result = useMemo((): BreakResult | null => {
    const cost = parseFloat(setCost);
    const total = parseInt(totalCards);
    const commonPrice = parseFloat(commonBulkPrice) || 0;
    const platform = PLATFORMS[platformIdx];
    const shipPer = parseFloat(shippingPerCard) || 0;
    const packPer = parseFloat(packagingPerCard) || 0;
    const minsPerCard = parseFloat(minutesPerCard) || 0;
    const hourly = parseFloat(hourlyRate) || 0;
    const sellThrough = (parseFloat(sellThroughPct) || 80) / 100;

    if (!cost || cost <= 0 || !total || total <= 0) return null;

    const validKeys = keyCards.filter(k => k.estimatedValue > 0);
    const keyCardCount = validKeys.reduce((s, k) => s + (k.quantity || 1), 0);
    const commonCount = Math.max(0, total - keyCardCount);

    // Revenue from key cards (adjusted by sell-through)
    const totalKeyCardRevenue = validKeys.reduce((s, k) => s + k.estimatedValue * (k.quantity || 1), 0) * sellThrough;

    // Revenue from commons sold in bulk lots
    const totalCommonRevenue = commonCount * commonPrice * sellThrough;

    const grossRevenue = totalKeyCardRevenue + totalCommonRevenue;

    // Costs
    // Only key cards get individually shipped — commons go in bulk lots
    const individualSales = Math.ceil(validKeys.length * sellThrough);
    const bulkLots = Math.ceil(commonCount / 50); // assume 50-card bulk lots
    const totalShipments = individualSales + bulkLots;

    const platformFees = grossRevenue * platform.feeRate;
    const shippingCost = totalShipments * shipPer;
    const packagingCost = totalShipments * packPer;
    const timeValue = ((individualSales + bulkLots) * minsPerCard / 60) * hourly;

    const netRevenue = grossRevenue - platformFees - shippingCost - packagingCost;
    const profit = netRevenue - cost;
    const profitMargin = cost > 0 ? (profit / cost) * 100 : 0;

    const breakEvenPrice = netRevenue > 0 ? cost : 0;

    let verdict: BreakResult['verdict'] = 'unprofitable';
    if (profitMargin >= 40) verdict = 'excellent';
    else if (profitMargin >= 15) verdict = 'profitable';
    else if (profitMargin >= 0) verdict = 'marginal';

    return {
      totalKeyCardRevenue,
      totalCommonRevenue,
      grossRevenue,
      platformFees,
      shippingCost,
      packagingCost,
      netRevenue,
      profit,
      profitMargin,
      breakEvenPrice,
      timeValue,
      verdict,
    };
  }, [setCost, totalCards, commonBulkPrice, platformIdx, shippingPerCard, packagingPerCard, minutesPerCard, hourlyRate, sellThroughPct, keyCards]);

  const verdictInfo = result ? getVerdict(result.profitMargin) : null;

  return (
    <div className="space-y-8">
      {/* Preset Selector */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
        <h2 className="text-lg font-bold text-white mb-3">Quick Start — Load a Set Preset</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SET_PRESETS.map((p, i) => (
            <button
              key={i}
              onClick={() => loadPreset(i)}
              className="text-left p-3 bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 rounded-lg transition-colors"
            >
              <div className="text-white text-sm font-medium">{p.name}</div>
              <div className="text-gray-500 text-xs mt-1">
                ~{fmt(p.setCost)} set cost &middot; {p.keyCards.length} key cards
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Set Info */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
        <h2 className="text-lg font-bold text-white mb-4">Set Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Complete Set Cost ($)</label>
            <input
              type="number"
              value={setCost}
              onChange={e => setSetCost(e.target.value)}
              placeholder="e.g. 80"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Total Cards in Set</label>
            <input
              type="number"
              value={totalCards}
              onChange={e => setTotalCards(e.target.value)}
              placeholder="e.g. 396"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Common Card Value (each)</label>
            <input
              type="number"
              step="0.05"
              value={commonBulkPrice}
              onChange={e => setCommonBulkPrice(e.target.value)}
              placeholder="0.25"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Key Cards */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Key Cards (Stars, Rookies, Inserts)</h2>
          <button
            onClick={addKeyCard}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium rounded-lg transition-colors"
          >
            + Add Card
          </button>
        </div>
        <div className="space-y-3">
          {keyCards.map((card) => (
            <div key={card.id} className="flex items-center gap-3">
              <input
                type="text"
                value={card.name}
                onChange={e => updateKeyCard(card.id, 'name', e.target.value)}
                placeholder="Card name (e.g. Jerry Rice RC #161)"
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
              />
              <div className="w-24">
                <input
                  type="number"
                  step="0.5"
                  value={card.estimatedValue || ''}
                  onChange={e => updateKeyCard(card.id, 'estimatedValue', parseFloat(e.target.value) || 0)}
                  placeholder="Value $"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="w-16">
                <input
                  type="number"
                  min="1"
                  value={card.quantity}
                  onChange={e => updateKeyCard(card.id, 'quantity', parseInt(e.target.value) || 1)}
                  placeholder="Qty"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
              {keyCards.length > 1 && (
                <button
                  onClick={() => removeKeyCard(card.id)}
                  className="text-gray-500 hover:text-red-400 transition-colors text-lg"
                  title="Remove"
                >
                  x
                </button>
              )}
            </div>
          ))}
        </div>
        <p className="text-gray-500 text-xs mt-3">
          List the most valuable cards in the set. Everything else is calculated as commons at the bulk price above.
        </p>
      </div>

      {/* Selling Assumptions */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
        <h2 className="text-lg font-bold text-white mb-4">Selling Assumptions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Selling Platform</label>
            <select
              value={platformIdx}
              onChange={e => setPlatformIdx(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
            >
              {PLATFORMS.map((p, i) => (
                <option key={i} value={i}>{p.name} ({p.label})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Shipping per Sale ($)</label>
            <input
              type="number"
              step="0.25"
              value={shippingPerCard}
              onChange={e => setShippingPerCard(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Packaging per Sale ($)</label>
            <input
              type="number"
              step="0.05"
              value={packagingPerCard}
              onChange={e => setPackagingPerCard(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Sell-Through Rate (%)</label>
            <input
              type="number"
              min="10"
              max="100"
              value={sellThroughPct}
              onChange={e => setSellThroughPct(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Minutes per Listing</label>
            <input
              type="number"
              value={minutesPerCard}
              onChange={e => setMinutesPerCard(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Your Hourly Rate ($)</label>
            <input
              type="number"
              value={hourlyRate}
              onChange={e => setHourlyRate(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      {result && verdictInfo && (
        <div className="space-y-6">
          {/* Verdict Banner */}
          <div className={`border rounded-xl p-6 ${verdictInfo.bg}`}>
            <div className="flex items-center gap-3 mb-3">
              <span className={`text-2xl font-black ${verdictInfo.color}`}>{verdictInfo.label}</span>
              <span className={`text-sm ${verdictInfo.color}`}>
                {result.profitMargin >= 0 ? '+' : ''}{result.profitMargin.toFixed(1)}% margin
              </span>
            </div>
            <p className="text-gray-300 text-sm">{verdictInfo.desc}</p>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-gray-400">Set Cost</div>
                <div className="text-white font-bold">{fmt(parseFloat(setCost) || 0)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Net Revenue</div>
                <div className="text-white font-bold">{fmt(result.netRevenue)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Profit/Loss</div>
                <div className={`font-bold ${result.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {result.profit >= 0 ? '+' : ''}{fmt(result.profit)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Time Cost</div>
                <div className="text-gray-300 font-bold">{fmt(result.timeValue)}</div>
              </div>
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
            <h3 className="text-lg font-bold text-white mb-4">Revenue Breakdown</h3>
            <div className="space-y-3">
              {[
                { label: 'Key Card Sales', value: result.totalKeyCardRevenue, color: 'bg-amber-500' },
                { label: 'Common/Bulk Sales', value: result.totalCommonRevenue, color: 'bg-gray-500' },
              ].map(row => (
                <div key={row.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">{row.label}</span>
                    <span className="text-white font-medium">{fmt(row.value)}</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${row.color} rounded-full`}
                      style={{ width: `${result.grossRevenue > 0 ? (row.value / result.grossRevenue) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
              <div className="border-t border-gray-700 pt-3 flex justify-between">
                <span className="text-gray-400 font-medium">Gross Revenue</span>
                <span className="text-white font-bold">{fmt(result.grossRevenue)}</span>
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
            <h3 className="text-lg font-bold text-white mb-4">Cost Breakdown</h3>
            <div className="space-y-2">
              {[
                { label: 'Set Purchase Price', value: parseFloat(setCost) || 0 },
                { label: `Platform Fees (${PLATFORMS[platformIdx].name} ${PLATFORMS[platformIdx].label})`, value: result.platformFees },
                { label: 'Shipping Costs', value: result.shippingCost },
                { label: 'Packaging/Supplies', value: result.packagingCost },
              ].map(row => (
                <div key={row.label} className="flex justify-between text-sm">
                  <span className="text-gray-400">{row.label}</span>
                  <span className="text-red-400">-{fmt(row.value)}</span>
                </div>
              ))}
              <div className="border-t border-gray-700 pt-2 flex justify-between text-sm">
                <span className="text-gray-400 font-medium">Total Costs</span>
                <span className="text-red-400 font-bold">
                  -{fmt((parseFloat(setCost) || 0) + result.platformFees + result.shippingCost + result.packagingCost)}
                </span>
              </div>
              <div className="border-t border-gray-700 pt-2 flex justify-between text-sm">
                <span className="text-gray-400 font-medium">Time Investment (opportunity cost)</span>
                <span className="text-amber-400">{fmt(result.timeValue)} ({((result.timeValue / (parseFloat(hourlyRate) || 15)) * 60).toFixed(0)} min)</span>
              </div>
            </div>
          </div>

          {/* Profit After Time */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
            <h3 className="text-lg font-bold text-white mb-4">Profit After Time</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                <div className="text-xs text-gray-400 mb-1">Before Time Cost</div>
                <div className={`text-2xl font-bold ${result.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {result.profit >= 0 ? '+' : ''}{fmt(result.profit)}
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                <div className="text-xs text-gray-400 mb-1">After Time Cost</div>
                <div className={`text-2xl font-bold ${(result.profit - result.timeValue) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {(result.profit - result.timeValue) >= 0 ? '+' : ''}{fmt(result.profit - result.timeValue)}
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                <div className="text-xs text-gray-400 mb-1">Effective Hourly Rate</div>
                <div className="text-2xl font-bold text-white">
                  {result.timeValue > 0
                    ? `${fmt(result.profit / (result.timeValue / (parseFloat(hourlyRate) || 15)))}/hr`
                    : 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Platform Comparison */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
            <h3 className="text-lg font-bold text-white mb-4">Platform Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left text-gray-400 pb-2">Platform</th>
                    <th className="text-right text-gray-400 pb-2">Fee Rate</th>
                    <th className="text-right text-gray-400 pb-2">Fees</th>
                    <th className="text-right text-gray-400 pb-2">Net Profit</th>
                    <th className="text-right text-gray-400 pb-2">Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {PLATFORMS.map((p, i) => {
                    const fees = result.grossRevenue * p.feeRate;
                    const net = result.grossRevenue - fees - result.shippingCost - result.packagingCost - (parseFloat(setCost) || 0);
                    const margin = (parseFloat(setCost) || 0) > 0 ? (net / (parseFloat(setCost) || 1)) * 100 : 0;
                    return (
                      <tr key={i} className={`border-b border-gray-800 ${i === platformIdx ? 'bg-amber-500/10' : ''}`}>
                        <td className="py-2 text-white">{p.name} {i === platformIdx && <span className="text-amber-400 text-xs ml-1">(selected)</span>}</td>
                        <td className="py-2 text-right text-gray-400">{p.label}</td>
                        <td className="py-2 text-right text-red-400">-{fmt(fees)}</td>
                        <td className={`py-2 text-right font-medium ${net >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {net >= 0 ? '+' : ''}{fmt(net)}
                        </td>
                        <td className={`py-2 text-right ${margin >= 15 ? 'text-emerald-400' : margin >= 0 ? 'text-amber-400' : 'text-red-400'}`}>
                          {margin.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
            <h3 className="text-lg font-bold text-white mb-3">Set Break Pro Tips</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex gap-2"><span className="text-amber-400">1.</span> Sell key cards individually, commons in bulk lots of 25-100 on eBay for the best time-to-profit ratio.</li>
              <li className="flex gap-2"><span className="text-amber-400">2.</span> List key cards at auction starting at $0.99 — competition usually drives to fair value and you save on listing fees.</li>
              <li className="flex gap-2"><span className="text-amber-400">3.</span> Consider grading the top 2-3 cards if they are in Near Mint+ condition — a PSA 10 can be worth 3-10x raw value.</li>
              <li className="flex gap-2"><span className="text-amber-400">4.</span> Check recent eBay sold comps before committing — prices can shift significantly with player performance changes.</li>
              <li className="flex gap-2"><span className="text-amber-400">5.</span> Factor in unsold inventory — the sell-through rate slider above helps model realistic outcomes.</li>
              <li className="flex gap-2"><span className="text-amber-400">6.</span> For junk wax era sets (1987-1993), set breaking is usually not profitable — the commons are essentially worthless individually.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!result && (
        <div className="bg-gray-900/60 border border-gray-800 border-dashed rounded-xl p-10 text-center">
          <div className="text-4xl mb-3">&#x1F4E6;</div>
          <p className="text-gray-400 mb-2">Enter a set cost and total cards above to calculate break profitability.</p>
          <p className="text-gray-500 text-sm">Or load a preset to get started quickly.</p>
        </div>
      )}
    </div>
  );
}
