'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

/* ---------- Types ---------- */

type CardType = 'raw' | 'graded-slab' | 'graded-onetouch' | 'raw-toploader';
type Destination = 'domestic' | 'canada' | 'international';

interface ShippingMethod {
  id: string;
  name: string;
  carrier: string;
  baseCostDomestic: [number, number]; // [min, max]
  baseCostCanada: [number, number];
  baseCostInternational: [number, number];
  tracking: boolean;
  includedInsurance: number;
  transitDays: string;
  transitDaysCanada: string;
  transitDaysInternational: string;
  maxRawCards: number;
  maxSlabs: number;
  allowsPWE: boolean; // only PWE is true
  allowsInternational: boolean;
  suppliesCost: [number, number]; // [min, max]
  risk: string;
}

type Verdict = 'BEST VALUE' | 'RECOMMENDED' | 'PREMIUM' | 'NOT RECOMMENDED' | 'GOOD';

/* ---------- Data ---------- */

const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: 'pwe',
    name: 'PWE (Plain White Envelope)',
    carrier: 'USPS',
    baseCostDomestic: [0.73, 0.73],
    baseCostCanada: [0, 0],
    baseCostInternational: [0, 0],
    tracking: false,
    includedInsurance: 0,
    transitDays: '3-5 days',
    transitDaysCanada: 'N/A',
    transitDaysInternational: 'N/A',
    maxRawCards: 2,
    maxSlabs: 0,
    allowsPWE: true,
    allowsInternational: false,
    suppliesCost: [0.50, 0.50],
    risk: 'No protection, no tracking. Buyer disputes will side with buyer on eBay.',
  },
  {
    id: 'usps-first-class',
    name: 'USPS First Class Package',
    carrier: 'USPS',
    baseCostDomestic: [4.50, 5.50],
    baseCostCanada: [15.00, 18.00],
    baseCostInternational: [18.00, 25.00],
    tracking: true,
    includedInsurance: 0,
    transitDays: '3-5 days',
    transitDaysCanada: '6-10 days',
    transitDaysInternational: '7-21 days',
    maxRawCards: 15,
    maxSlabs: 3,
    allowsPWE: false,
    allowsInternational: true,
    suppliesCost: [0.75, 1.50],
    risk: 'No insurance included. Add insurance for cards over $50.',
  },
  {
    id: 'usps-priority',
    name: 'USPS Priority Mail',
    carrier: 'USPS',
    baseCostDomestic: [9.00, 12.00],
    baseCostCanada: [30.00, 45.00],
    baseCostInternational: [45.00, 65.00],
    tracking: true,
    includedInsurance: 50,
    transitDays: '2-3 days',
    transitDaysCanada: '6-10 days',
    transitDaysInternational: '6-10 days',
    maxRawCards: 50,
    maxSlabs: 8,
    allowsPWE: false,
    allowsInternational: true,
    suppliesCost: [1.00, 2.00],
    risk: 'Recommended for $50+ cards. Flat rate small box $10.40.',
  },
  {
    id: 'usps-priority-express',
    name: 'USPS Priority Mail Express',
    carrier: 'USPS',
    baseCostDomestic: [28.00, 35.00],
    baseCostCanada: [50.00, 65.00],
    baseCostInternational: [55.00, 80.00],
    tracking: true,
    includedInsurance: 100,
    transitDays: '1-2 days',
    transitDaysCanada: '3-5 days',
    transitDaysInternational: '3-5 days',
    maxRawCards: 50,
    maxSlabs: 10,
    allowsPWE: false,
    allowsInternational: true,
    suppliesCost: [1.50, 3.00],
    risk: 'Guaranteed next/2-day delivery. For high-value cards needing speed.',
  },
  {
    id: 'ups-ground',
    name: 'UPS Ground',
    carrier: 'UPS',
    baseCostDomestic: [10.00, 15.00],
    baseCostCanada: [25.00, 35.00],
    baseCostInternational: [40.00, 60.00],
    tracking: true,
    includedInsurance: 100,
    transitDays: '3-7 days',
    transitDaysCanada: '5-10 days',
    transitDaysInternational: '7-14 days',
    maxRawCards: 100,
    maxSlabs: 15,
    allowsPWE: false,
    allowsInternational: true,
    suppliesCost: [1.50, 3.00],
    risk: 'Better for multi-slab shipments. $100 insurance included.',
  },
  {
    id: 'fedex-ground',
    name: 'FedEx Ground',
    carrier: 'FedEx',
    baseCostDomestic: [11.00, 16.00],
    baseCostCanada: [28.00, 38.00],
    baseCostInternational: [45.00, 70.00],
    tracking: true,
    includedInsurance: 100,
    transitDays: '3-7 days',
    transitDaysCanada: '5-10 days',
    transitDaysInternational: '7-14 days',
    maxRawCards: 100,
    maxSlabs: 15,
    allowsPWE: false,
    allowsInternational: true,
    suppliesCost: [1.50, 3.00],
    risk: 'Similar to UPS. Good for bulk shipments.',
  },
];

const CARD_TYPES: { value: CardType; label: string; desc: string }[] = [
  { value: 'raw', label: 'Raw Card', desc: 'Ungraded, no holder' },
  { value: 'graded-slab', label: 'Graded Slab', desc: 'PSA / BGS / CGC / SGC' },
  { value: 'graded-onetouch', label: 'Graded + One-Touch', desc: 'Slab in magnetic case' },
  { value: 'raw-toploader', label: 'Raw in Top-Loader', desc: 'Penny sleeve + top-loader' },
];

const DESTINATIONS: { value: Destination; label: string }[] = [
  { value: 'domestic', label: 'Domestic (US)' },
  { value: 'canada', label: 'Canada' },
  { value: 'international', label: 'International' },
];

const PRESETS: { label: string; cards: number; type: CardType }[] = [
  { label: '1 Raw Card', cards: 1, type: 'raw' },
  { label: '1 Slab', cards: 1, type: 'graded-slab' },
  { label: '5 Slabs', cards: 5, type: 'graded-slab' },
  { label: 'Bulk (20+)', cards: 25, type: 'raw' },
];

/* ---------- Insurance Calculation ---------- */

function getAdditionalInsuranceCost(declaredValue: number, includedInsurance: number, carrier: string): number {
  const excess = declaredValue - includedInsurance;
  if (excess <= 0) return 0;

  if (carrier === 'USPS') {
    if (excess <= 50) return 2.75;
    if (excess <= 100) return 3.25;
    if (excess <= 200) return 4.00;
    if (excess <= 300) return 5.00;
    if (excess <= 500) return 5.75;
    if (excess <= 1000) return 8.50;
    if (excess <= 2000) return 12.25;
    if (excess <= 5000) return 20.00;
    return 35.00;
  }
  // UPS and FedEx
  if (excess <= 100) return 0; // already covered by included $100
  if (excess <= 300) return 3.00;
  if (excess <= 500) return 5.00;
  if (excess <= 1000) return 8.00;
  if (excess <= 2000) return 12.00;
  if (excess <= 5000) return 18.00;
  return 30.00;
}

/* ---------- Helper Functions ---------- */

function getBaseCost(method: ShippingMethod, dest: Destination, numCards: number): [number, number] {
  const costRange = dest === 'domestic'
    ? method.baseCostDomestic
    : dest === 'canada'
    ? method.baseCostCanada
    : method.baseCostInternational;

  // Scale slightly for higher card counts (heavier packages)
  const weightMultiplier = numCards <= 3 ? 1 : numCards <= 10 ? 1.1 : numCards <= 25 ? 1.25 : 1.4;
  if (method.id === 'pwe') return costRange; // PWE is fixed

  return [
    Math.round(costRange[0] * weightMultiplier * 100) / 100,
    Math.round(costRange[1] * weightMultiplier * 100) / 100,
  ];
}

function getSuppliesCost(method: ShippingMethod, cardType: CardType, numCards: number): number {
  const base = (method.suppliesCost[0] + method.suppliesCost[1]) / 2;
  const perCardCost = cardType === 'graded-slab' || cardType === 'graded-onetouch' ? 0.35 : 0.17;
  return Math.round((base + (numCards > 1 ? perCardCost * (numCards - 1) : 0)) * 100) / 100;
}

function getTransitDays(method: ShippingMethod, dest: Destination): string {
  if (dest === 'domestic') return method.transitDays;
  if (dest === 'canada') return method.transitDaysCanada;
  return method.transitDaysInternational;
}

/* ---------- Determine eligibility and verdict ---------- */

interface CalculatedOption {
  method: ShippingMethod;
  eligible: boolean;
  reason: string;
  baseCostMin: number;
  baseCostMax: number;
  baseCostAvg: number;
  insuranceCost: number;
  suppliesCost: number;
  totalCostMin: number;
  totalCostMax: number;
  totalCostAvg: number;
  costPctOfValue: number;
  transitDays: string;
  verdict: Verdict;
}

function calculateOptions(
  numCards: number,
  cardType: CardType,
  dest: Destination,
  wantInsurance: boolean,
  declaredValue: number,
): CalculatedOption[] {
  const isGraded = cardType === 'graded-slab' || cardType === 'graded-onetouch';

  const results: CalculatedOption[] = SHIPPING_METHODS.map(method => {
    let eligible = true;
    let reason = '';

    // PWE restrictions
    if (method.id === 'pwe') {
      if (isGraded) { eligible = false; reason = 'PWE cannot ship graded slabs'; }
      else if (numCards > 2) { eligible = false; reason = 'PWE supports 1-2 raw cards only'; }
      else if (dest !== 'domestic') { eligible = false; reason = 'PWE is domestic only'; }
      else if (declaredValue > 20) { reason = 'Warning: No tracking means you lose eBay disputes. Risky for cards over $20.'; }
    }

    // International check
    if (dest !== 'domestic' && !method.allowsInternational) {
      eligible = false;
      reason = `${method.name} not available for international shipping`;
    }

    // Capacity check
    if (isGraded && numCards > method.maxSlabs) {
      eligible = false;
      reason = `Max ${method.maxSlabs} slabs for ${method.name}`;
    } else if (!isGraded && numCards > method.maxRawCards) {
      eligible = false;
      reason = `Max ${method.maxRawCards} raw cards for ${method.name}`;
    }

    // Costs
    const [costMin, costMax] = getBaseCost(method, dest, numCards);
    const insuranceCost = wantInsurance ? getAdditionalInsuranceCost(declaredValue, method.includedInsurance, method.carrier) : 0;
    const supplies = getSuppliesCost(method, cardType, numCards);
    const totalMin = costMin + insuranceCost + supplies;
    const totalMax = costMax + insuranceCost + supplies;
    const totalAvg = (totalMin + totalMax) / 2;
    const costPct = declaredValue > 0 ? (totalAvg / declaredValue) * 100 : 0;

    return {
      method,
      eligible,
      reason,
      baseCostMin: costMin,
      baseCostMax: costMax,
      baseCostAvg: (costMin + costMax) / 2,
      insuranceCost,
      suppliesCost: supplies,
      totalCostMin: totalMin,
      totalCostMax: totalMax,
      totalCostAvg: totalAvg,
      costPctOfValue: costPct,
      transitDays: getTransitDays(method, dest),
      verdict: 'GOOD' as Verdict, // will be set below
    };
  });

  // Assign verdicts
  const eligibleResults = results.filter(r => r.eligible);
  if (eligibleResults.length > 0) {
    const sorted = [...eligibleResults].sort((a, b) => a.totalCostAvg - b.totalCostAvg);
    const cheapest = sorted[0];

    for (const r of results) {
      if (!r.eligible) {
        r.verdict = 'NOT RECOMMENDED';
        continue;
      }

      if (r === cheapest) {
        r.verdict = 'BEST VALUE';
        continue;
      }

      // Premium if express or 2x+ the cheapest
      if (r.method.id === 'usps-priority-express' || r.totalCostAvg > cheapest.totalCostAvg * 2.5) {
        r.verdict = 'PREMIUM';
        continue;
      }

      // Recommended: Priority mail for $50+ cards
      if (r.method.id === 'usps-priority' && declaredValue >= 50) {
        r.verdict = 'RECOMMENDED';
        continue;
      }

      // UPS/FedEx recommended for multi-slab
      if ((r.method.id === 'ups-ground' || r.method.id === 'fedex-ground') && isGraded && numCards >= 3) {
        r.verdict = 'RECOMMENDED';
        continue;
      }

      r.verdict = 'GOOD';
    }
  }

  return results;
}

/* ---------- Component ---------- */

export default function ShippingCalcClient() {
  const [numCards, setNumCards] = useState(1);
  const [cardType, setCardType] = useState<CardType>('raw');
  const [destination, setDestination] = useState<Destination>('domestic');
  const [wantInsurance, setWantInsurance] = useState(false);
  const [declaredValue, setDeclaredValue] = useState(50);
  const [copied, setCopied] = useState(false);

  const options = useMemo(
    () => calculateOptions(numCards, cardType, destination, wantInsurance, declaredValue),
    [numCards, cardType, destination, wantInsurance, declaredValue],
  );

  const eligible = options.filter(o => o.eligible);
  const ineligible = options.filter(o => !o.eligible);
  const sorted = [...eligible].sort((a, b) => a.totalCostAvg - b.totalCostAvg);
  const bestValue = sorted[0] || null;
  const costWarning = bestValue && bestValue.costPctOfValue > 10;

  function applyPreset(preset: typeof PRESETS[number]) {
    setNumCards(preset.cards);
    setCardType(preset.type);
  }

  function copyDetails() {
    const lines = [
      `Card Shipping Calculator Results`,
      `================================`,
      `Cards: ${numCards} x ${CARD_TYPES.find(c => c.value === cardType)?.label}`,
      `Destination: ${DESTINATIONS.find(d => d.value === destination)?.label}`,
      `Declared Value: $${declaredValue}`,
      `Insurance: ${wantInsurance ? 'Yes' : 'No'}`,
      ``,
      `Shipping Options:`,
      ...sorted.map(o =>
        `  ${o.method.name} — $${o.totalCostMin.toFixed(2)}-$${o.totalCostMax.toFixed(2)} (${o.transitDays}) [${o.verdict}]`
      ),
      ``,
      `Generated by CardVault Card Shipping Calculator`,
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function verdictColor(v: Verdict): string {
    switch (v) {
      case 'BEST VALUE': return 'bg-emerald-900/60 text-emerald-300 border-emerald-700/50';
      case 'RECOMMENDED': return 'bg-teal-900/60 text-teal-300 border-teal-700/50';
      case 'PREMIUM': return 'bg-amber-900/60 text-amber-300 border-amber-700/50';
      case 'GOOD': return 'bg-gray-800/60 text-gray-300 border-gray-700/50';
      case 'NOT RECOMMENDED': return 'bg-red-900/60 text-red-300 border-red-700/50';
    }
  }

  function verdictBadge(v: Verdict): string {
    switch (v) {
      case 'BEST VALUE': return 'bg-emerald-600 text-white';
      case 'RECOMMENDED': return 'bg-teal-600 text-white';
      case 'PREMIUM': return 'bg-amber-600 text-white';
      case 'GOOD': return 'bg-gray-600 text-gray-200';
      case 'NOT RECOMMENDED': return 'bg-red-600 text-white';
    }
  }

  function carrierBadge(carrier: string): string {
    switch (carrier) {
      case 'USPS': return 'bg-blue-900/60 text-blue-300';
      case 'UPS': return 'bg-amber-900/60 text-amber-300';
      case 'FedEx': return 'bg-purple-900/60 text-purple-300';
      default: return 'bg-gray-700 text-gray-300';
    }
  }

  return (
    <div className="space-y-8">
      {/* Quick Presets */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map(p => (
          <button
            key={p.label}
            onClick={() => applyPreset(p)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
              numCards === p.cards && cardType === p.type
                ? 'bg-teal-600 border-teal-500 text-white'
                : 'bg-gray-800/60 border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Input Section */}
      <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Shipment Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Number of Cards */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Number of Cards</label>
            <input
              type="number"
              min={1}
              max={100}
              value={numCards}
              onChange={e => setNumCards(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">1-100 cards per shipment</p>
          </div>

          {/* Card Type */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Card Type</label>
            <select
              value={cardType}
              onChange={e => setCardType(e.target.value as CardType)}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
            >
              {CARD_TYPES.map(ct => (
                <option key={ct.value} value={ct.value}>{ct.label} — {ct.desc}</option>
              ))}
            </select>
          </div>

          {/* Destination */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Destination</label>
            <div className="grid grid-cols-3 gap-2">
              {DESTINATIONS.map(d => (
                <button
                  key={d.value}
                  onClick={() => setDestination(d.value)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                    destination === d.value
                      ? 'bg-teal-950/60 border-teal-500 text-teal-300 ring-1 ring-teal-500/50'
                      : 'bg-gray-900 border-gray-600 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Declared Value */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Declared Value</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                min={0}
                step={1}
                value={declaredValue || ''}
                onChange={e => setDeclaredValue(Math.max(0, parseFloat(e.target.value) || 0))}
                placeholder="50"
                className="w-full pl-8 pr-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Used for insurance and cost-as-% analysis</p>
          </div>

          {/* Insurance Toggle */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={wantInsurance}
                onChange={e => setWantInsurance(e.target.checked)}
                className="w-5 h-5 rounded border-gray-600 text-teal-500 focus:ring-teal-500/50 bg-gray-900"
              />
              <div>
                <span className="text-sm text-gray-300 font-medium">Add shipping insurance</span>
                {declaredValue > 50 && !wantInsurance && (
                  <span className="block text-xs text-amber-400 mt-0.5">
                    Recommended for cards valued at ${declaredValue}+
                  </span>
                )}
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Cost Warning */}
      {costWarning && bestValue && (
        <div className="bg-amber-950/40 border border-amber-700/50 rounded-xl p-4 flex items-start gap-3">
          <span className="text-amber-400 text-xl mt-0.5">&#9888;</span>
          <div>
            <div className="text-amber-300 font-semibold text-sm">Shipping cost exceeds 10% of card value</div>
            <p className="text-amber-400/80 text-sm mt-1">
              The cheapest option ({bestValue.method.name}) costs {bestValue.costPctOfValue.toFixed(1)}% of your declared value.
              Consider selling locally or bundling with other cards to reduce per-card shipping cost.
            </p>
          </div>
        </div>
      )}

      {/* Results Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Shipping Options</h2>
          <button
            onClick={copyDetails}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-gray-300 text-sm font-medium rounded-xl transition-colors"
          >
            {copied ? 'Copied!' : 'Copy Details'}
          </button>
        </div>

        {/* Best Value Highlight */}
        {bestValue && (
          <div className="bg-emerald-950/40 border border-emerald-700/50 rounded-xl p-5 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-600 text-white">BEST VALUE</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${carrierBadge(bestValue.method.carrier)}`}>
                {bestValue.method.carrier}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-white font-bold text-lg">{bestValue.method.name}</span>
              </div>
              <span className="text-emerald-400 font-bold text-2xl">
                ${bestValue.totalCostMin.toFixed(2)}
                {bestValue.totalCostMin !== bestValue.totalCostMax && (
                  <span className="text-lg">-${bestValue.totalCostMax.toFixed(2)}</span>
                )}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-400">
              <span>{bestValue.transitDays}</span>
              <span>{bestValue.method.tracking ? 'Tracking included' : 'No tracking'}</span>
              {bestValue.method.includedInsurance > 0 && (
                <span>${bestValue.method.includedInsurance} insurance included</span>
              )}
              {declaredValue > 0 && (
                <span className={`font-medium ${bestValue.costPctOfValue < 10 ? 'text-emerald-400' : bestValue.costPctOfValue < 20 ? 'text-amber-400' : 'text-red-400'}`}>
                  {bestValue.costPctOfValue.toFixed(1)}% of card value
                </span>
              )}
            </div>
          </div>
        )}

        {/* All Eligible Options */}
        <div className="space-y-3">
          {sorted.map((opt, i) => (
            <div
              key={opt.method.id}
              className={`border rounded-xl p-4 transition-colors ${
                i === 0 ? 'bg-emerald-950/20 border-emerald-700/30' : 'bg-gray-800/60 border-gray-700/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${carrierBadge(opt.method.carrier)}`}>
                    {opt.method.carrier}
                  </span>
                  <span className="text-white font-semibold">{opt.method.name}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${verdictBadge(opt.verdict)}`}>
                    {opt.verdict}
                  </span>
                </div>
                <span className="text-white font-bold text-lg whitespace-nowrap ml-2">
                  ${opt.totalCostMin.toFixed(2)}
                  {opt.totalCostMin !== opt.totalCostMax && (
                    <span className="text-sm text-gray-400">-${opt.totalCostMax.toFixed(2)}</span>
                  )}
                </span>
              </div>

              {/* Cost Breakdown */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 mb-2">
                <span>Base: ${opt.baseCostMin.toFixed(2)}{opt.baseCostMin !== opt.baseCostMax ? `-$${opt.baseCostMax.toFixed(2)}` : ''}</span>
                {opt.insuranceCost > 0 && <span>Insurance: +${opt.insuranceCost.toFixed(2)}</span>}
                <span>Supplies: +${opt.suppliesCost.toFixed(2)}</span>
                <span className="text-gray-600">|</span>
                <span>{opt.transitDays}</span>
                <span>{opt.method.tracking ? 'Tracking' : 'No tracking'}</span>
                {opt.method.includedInsurance > 0 && <span>${opt.method.includedInsurance} ins. included</span>}
              </div>

              {/* Cost as % of value bar */}
              {declaredValue > 0 && (
                <div className="mb-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-500">Cost as % of card value</span>
                    <span className={`font-medium ${
                      opt.costPctOfValue < 10 ? 'text-emerald-400' :
                      opt.costPctOfValue < 20 ? 'text-amber-400' :
                      'text-red-400'
                    }`}>
                      {opt.costPctOfValue.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        opt.costPctOfValue < 10 ? 'bg-emerald-500' :
                        opt.costPctOfValue < 20 ? 'bg-amber-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(100, opt.costPctOfValue * 2)}%` }}
                    />
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-500">{opt.method.risk}</p>

              {/* PWE warning for expensive cards */}
              {opt.method.id === 'pwe' && declaredValue > 20 && (
                <div className="mt-2 bg-amber-950/40 border border-amber-800/40 rounded-lg px-3 py-2 text-xs text-amber-400">
                  Warning: PWE has no tracking. If card value is ${declaredValue}, you risk losing the full amount in a buyer dispute.
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Ineligible Options */}
        {ineligible.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-500 mb-2">Not Available for This Shipment</h3>
            <div className="space-y-2">
              {ineligible.map(opt => (
                <div
                  key={opt.method.id}
                  className="bg-gray-900/40 border border-gray-800 rounded-xl px-4 py-3 flex items-center justify-between opacity-60"
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${carrierBadge(opt.method.carrier)}`}>
                      {opt.method.carrier}
                    </span>
                    <span className="text-gray-400 text-sm">{opt.method.name}</span>
                  </div>
                  <span className="text-xs text-red-400">{opt.reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Platform Shipping Comparison */}
      <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-2">Platform Shipping Costs vs Actual</h2>
        <p className="text-sm text-gray-400 mb-4">
          What marketplace standard shipping charges buyers vs what it actually costs you.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 px-3 text-gray-400 font-medium">Platform</th>
                <th className="text-right py-2 px-3 text-gray-400 font-medium">Buyer Pays</th>
                <th className="text-right py-2 px-3 text-gray-400 font-medium">Your Cost (est.)</th>
                <th className="text-right py-2 px-3 text-gray-400 font-medium">Margin</th>
              </tr>
            </thead>
            <tbody>
              {[
                { platform: 'eBay Standard (raw)', buyer: 1.00, cost: 0.73, note: 'PWE stamp' },
                { platform: 'eBay Standard (tracked)', buyer: 4.99, cost: 3.50, note: 'eBay commercial rate' },
                { platform: 'eBay Priority', buyer: 8.99, cost: 8.00, note: 'eBay commercial rate' },
                { platform: 'Mercari (prepaid label)', buyer: 5.99, cost: 5.99, note: 'Mercari provides label' },
                { platform: 'COMC (they ship)', buyer: 0, cost: 0, note: 'COMC handles shipping' },
                { platform: 'Facebook / Direct', buyer: 0, cost: 4.50, note: 'You pay full cost' },
              ].map((row, i) => {
                const margin = row.buyer - row.cost;
                return (
                  <tr key={i} className="border-b border-gray-700/50">
                    <td className="py-2.5 px-3 text-white">{row.platform}</td>
                    <td className="py-2.5 px-3 text-right text-gray-300">
                      {row.buyer > 0 ? `$${row.buyer.toFixed(2)}` : 'N/A'}
                    </td>
                    <td className="py-2.5 px-3 text-right text-gray-300">
                      {row.cost > 0 ? `$${row.cost.toFixed(2)}` : 'N/A'}
                    </td>
                    <td className={`py-2.5 px-3 text-right font-medium ${
                      margin > 0 ? 'text-emerald-400' : margin < 0 ? 'text-red-400' : 'text-gray-500'
                    }`}>
                      {row.buyer > 0 && row.cost > 0 ? (
                        <>
                          {margin >= 0 ? '+' : ''}${margin.toFixed(2)}
                        </>
                      ) : (
                        <span className="text-gray-500 text-xs">{row.note}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          eBay sellers get Commercial Base pricing when printing labels through eBay, saving 10-30% vs retail USPS rates.
          Use our <Link href="/tools/flip-calc" className="text-teal-400 hover:underline">Flip Profit Calculator</Link> to factor shipping into your total profit.
        </p>
      </div>

      {/* Packaging Tips */}
      <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Packaging Guide</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-900/60 rounded-xl p-4 border border-gray-700/50">
            <h3 className="text-teal-400 font-semibold text-sm mb-2">Shipping Raw Cards</h3>
            <ol className="text-gray-400 text-sm space-y-1.5 list-decimal list-inside">
              <li>Insert card into penny sleeve ($0.02)</li>
              <li>Slide into top-loader ($0.10)</li>
              <li>Seal top-loader with blue painters tape</li>
              <li>Place in team bag for moisture protection ($0.05)</li>
              <li>PWE: cardboard sandwich method. Mailer: place in bubble mailer</li>
              <li>Write &quot;Non-Machinable&quot; on PWE envelopes</li>
            </ol>
          </div>
          <div className="bg-gray-900/60 rounded-xl p-4 border border-gray-700/50">
            <h3 className="text-teal-400 font-semibold text-sm mb-2">Shipping Graded Slabs</h3>
            <ol className="text-gray-400 text-sm space-y-1.5 list-decimal list-inside">
              <li>Wrap slab in 2-3 layers of bubble wrap</li>
              <li>Place in rigid box (not just a padded mailer)</li>
              <li>Fill void space with packing paper or bubble wrap</li>
              <li>Tape all seams of the box securely</li>
              <li>Use USPS Priority or UPS Ground minimum</li>
              <li>Add insurance for slabs over $50 value</li>
            </ol>
          </div>
          <div className="bg-gray-900/60 rounded-xl p-4 border border-gray-700/50">
            <h3 className="text-teal-400 font-semibold text-sm mb-2">Bubble Mailer vs Box</h3>
            <p className="text-gray-400 text-sm">
              Bubble mailers work for 1-3 raw cards or 1 low-value slab. For anything worth $100+, always use a rigid box.
              Slabs can crack if bent in a bubble mailer. Boxes cost $0.50-$1.50 more but protect against damage claims.
              USPS small flat rate box ($10.40) is the sweet spot for most card shipments.
            </p>
          </div>
          <div className="bg-gray-900/60 rounded-xl p-4 border border-gray-700/50">
            <h3 className="text-teal-400 font-semibold text-sm mb-2">Pro Tips</h3>
            <ul className="text-gray-400 text-sm space-y-1.5 list-disc list-inside">
              <li>Print labels at home with <span className="text-teal-400">Pirate Ship</span> for cheapest USPS rates</li>
              <li>eBay Commercial rates save 10-30% on USPS postage</li>
              <li>Never use scotch tape on top-loaders (it damages cards)</li>
              <li>Add &quot;FRAGILE&quot; stickers for slab shipments</li>
              <li>Photograph packaging process for insurance claims</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Supplies Cost Reference */}
      <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Packaging Supplies Cost Reference</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 px-3 text-gray-400 font-medium">Supply</th>
                <th className="text-right py-2 px-3 text-gray-400 font-medium">Cost (each)</th>
                <th className="text-left py-2 px-3 text-gray-400 font-medium">Used For</th>
              </tr>
            </thead>
            <tbody>
              {[
                { item: 'Penny Sleeve', cost: '$0.02', use: 'Every card, always first layer' },
                { item: 'Top-Loader (3x4)', cost: '$0.10', use: 'Raw card protection' },
                { item: 'Team Bag', cost: '$0.05', use: 'Moisture seal over top-loader' },
                { item: 'Bubble Mailer (4x8)', cost: '$0.50', use: '1-3 raw cards or 1 slab' },
                { item: 'Small Flat Rate Box', cost: '$0.00*', use: 'Free from USPS, fits 1-3 slabs' },
                { item: 'Bubble Wrap (per ft)', cost: '$0.30', use: 'Slab wrapping' },
                { item: 'Blue Painters Tape', cost: '$0.05/use', use: 'Sealing top-loaders (peels clean)' },
                { item: 'Cardboard Stiffener', cost: '$0.10', use: 'PWE sandwich method' },
              ].map((row, i) => (
                <tr key={i} className="border-b border-gray-700/50">
                  <td className="py-2 px-3 text-white">{row.item}</td>
                  <td className="py-2 px-3 text-right text-teal-400 font-medium">{row.cost}</td>
                  <td className="py-2 px-3 text-gray-400">{row.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          *USPS flat rate boxes are free at your local post office or{' '}
          <span className="text-teal-400">usps.com</span>. Order in bulk to save trips.
          See our <Link href="/tools/holder-guide" className="text-teal-400 hover:underline">Holder Guide</Link> for
          detailed sleeve and case recommendations.
        </p>
      </div>
    </div>
  );
}
