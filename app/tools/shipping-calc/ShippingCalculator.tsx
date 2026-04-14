'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

type CardType = 'raw-single' | 'graded-slab' | 'lot' | 'sealed-box';
type ShippingMethod = 'pwe' | 'bubble-mailer' | 'small-box' | 'medium-box' | 'large-box';

interface ShippingOption {
  method: ShippingMethod;
  label: string;
  carrier: string;
  service: string;
  cost: number;
  insurance: number;
  tracking: boolean;
  transitDays: string;
  maxValue: number;
  notes: string;
}

const SHIPPING_OPTIONS: Record<CardType, ShippingOption[]> = {
  'raw-single': [
    { method: 'pwe', label: 'PWE (Plain White Envelope)', carrier: 'USPS', service: 'First Class Letter', cost: 1.50, insurance: 0, tracking: false, transitDays: '3-5', maxValue: 20, notes: 'Top-loader + penny sleeve + team bag. Write "Non-Machinable" on envelope. Best for sub-$20 cards.' },
    { method: 'bubble-mailer', label: 'Bubble Mailer', carrier: 'USPS', service: 'First Class Package', cost: 4.50, insurance: 0, tracking: true, transitDays: '3-5', maxValue: 100, notes: 'Top-loader + penny sleeve in bubble mailer. Tracking included. Standard for $20-$100 cards.' },
    { method: 'bubble-mailer', label: 'Bubble Mailer', carrier: 'USPS', service: 'Priority Mail', cost: 8.50, insurance: 50, tracking: true, transitDays: '1-3', maxValue: 250, notes: 'Priority includes $50 free insurance. Faster delivery. Good for $100-$250 cards.' },
    { method: 'small-box', label: 'Small Box', carrier: 'USPS', service: 'Priority Mail', cost: 10.00, insurance: 50, tracking: true, transitDays: '1-3', maxValue: 500, notes: 'Small flat-rate box. $50 insurance included. Card in top-loader, secured in box with packing material.' },
    { method: 'small-box', label: 'Small Box', carrier: 'UPS', service: 'Ground', cost: 12.00, insurance: 100, tracking: true, transitDays: '3-7', maxValue: 500, notes: 'UPS includes $100 declared value. Better damage claims process than USPS.' },
  ],
  'graded-slab': [
    { method: 'bubble-mailer', label: 'Bubble Mailer', carrier: 'USPS', service: 'First Class Package', cost: 5.50, insurance: 0, tracking: true, transitDays: '3-5', maxValue: 75, notes: 'Slab in bubble wrap inside bubble mailer. Budget option for lower-value slabs.' },
    { method: 'small-box', label: 'Small Box', carrier: 'USPS', service: 'Priority Mail', cost: 10.00, insurance: 50, tracking: true, transitDays: '1-3', maxValue: 500, notes: 'Recommended minimum for slabs. Slab in bubble wrap, secured in small flat-rate box. $50 included insurance.' },
    { method: 'small-box', label: 'Small Box', carrier: 'UPS', service: 'Ground', cost: 13.00, insurance: 100, tracking: true, transitDays: '3-7', maxValue: 1000, notes: '$100 declared value included. Best for $200-$1,000 slabs. Superior damage claim process.' },
    { method: 'small-box', label: 'Small Box', carrier: 'USPS', service: 'Priority Mail Express', cost: 28.00, insurance: 100, tracking: true, transitDays: '1-2', maxValue: 2000, notes: 'Overnight/2-day guaranteed. $100 insurance included. For high-value slabs needing fast delivery.' },
    { method: 'medium-box', label: 'Medium Box', carrier: 'UPS', service: '2nd Day Air', cost: 25.00, insurance: 100, tracking: true, transitDays: '2', maxValue: 5000, notes: 'For premium slabs. Add declared value for cards over $100. Full tracking and signature available.' },
  ],
  'lot': [
    { method: 'small-box', label: 'Small Flat Rate Box', carrier: 'USPS', service: 'Priority Mail', cost: 10.20, insurance: 50, tracking: true, transitDays: '1-3', maxValue: 200, notes: 'Fits 50-100 raw cards or 2-3 slabs. $50 insurance included. Best for small lots.' },
    { method: 'medium-box', label: 'Medium Flat Rate Box', carrier: 'USPS', service: 'Priority Mail', cost: 17.10, insurance: 50, tracking: true, transitDays: '1-3', maxValue: 500, notes: 'Fits 200-400 raw cards or 8-12 slabs. $50 insurance included. Most popular for lots.' },
    { method: 'large-box', label: 'Large Flat Rate Box', carrier: 'USPS', service: 'Priority Mail', cost: 22.80, insurance: 50, tracking: true, transitDays: '1-3', maxValue: 1000, notes: 'Fits 500+ raw cards or 20+ slabs. Flat rate = no weight penalty. Best for big collections.' },
    { method: 'medium-box', label: 'Medium Box', carrier: 'UPS', service: 'Ground', cost: 15.00, insurance: 100, tracking: true, transitDays: '3-7', maxValue: 1000, notes: 'Weight-based pricing. $100 declared value. Good for heavy lots. Better damage protection.' },
    { method: 'large-box', label: 'Large Box', carrier: 'FedEx', service: 'Ground', cost: 18.00, insurance: 100, tracking: true, transitDays: '3-7', maxValue: 2000, notes: 'Competitive pricing for heavy shipments. Good for dealer inventory transfers.' },
  ],
  'sealed-box': [
    { method: 'medium-box', label: 'Medium Box', carrier: 'USPS', service: 'Priority Mail', cost: 17.10, insurance: 50, tracking: true, transitDays: '1-3', maxValue: 500, notes: 'Fits most hobby boxes and blasters. Flat rate = no weight penalty. $50 included insurance.' },
    { method: 'medium-box', label: 'Medium Box', carrier: 'UPS', service: 'Ground', cost: 16.00, insurance: 100, tracking: true, transitDays: '3-7', maxValue: 1000, notes: '$100 declared value. Good for hobby boxes. Better claims process for damaged boxes.' },
    { method: 'large-box', label: 'Large Box', carrier: 'USPS', service: 'Priority Mail', cost: 22.80, insurance: 50, tracking: true, transitDays: '1-3', maxValue: 1000, notes: 'Fits jumbo hobby boxes, cases, or multiple products. Flat rate advantage for heavy items.' },
    { method: 'large-box', label: 'Large Box', carrier: 'UPS', service: 'Ground', cost: 22.00, insurance: 100, tracking: true, transitDays: '3-7', maxValue: 2000, notes: 'For cases and high-value sealed products. Add extra declared value for items over $100.' },
    { method: 'large-box', label: 'Large Box', carrier: 'FedEx', service: '2Day', cost: 35.00, insurance: 100, tracking: true, transitDays: '2', maxValue: 5000, notes: 'Premium option for high-value sealed products. Signature required. Full insurance available.' },
  ],
};

const INSURANCE_RATES = [
  { upTo: 50, usps: 0, ups: 0, fedex: 0 },
  { upTo: 100, usps: 2.75, ups: 0, fedex: 0 },
  { upTo: 200, usps: 3.50, ups: 3.00, fedex: 3.00 },
  { upTo: 300, usps: 4.50, ups: 3.00, fedex: 3.00 },
  { upTo: 500, usps: 6.00, ups: 5.00, fedex: 5.00 },
  { upTo: 1000, usps: 8.50, ups: 8.00, fedex: 8.00 },
  { upTo: 2000, usps: 12.00, ups: 12.00, fedex: 12.00 },
  { upTo: 5000, usps: 20.00, ups: 18.00, fedex: 18.00 },
  { upTo: 10000, usps: 35.00, ups: 30.00, fedex: 30.00 },
];

function getInsuranceCost(value: number, carrier: string, includedInsurance: number): number {
  const amountToInsure = Math.max(0, value - includedInsurance);
  if (amountToInsure <= 0) return 0;
  const key = carrier === 'USPS' ? 'usps' : carrier === 'UPS' ? 'ups' : 'fedex';
  for (const tier of INSURANCE_RATES) {
    if (amountToInsure <= tier.upTo) return tier[key];
  }
  return INSURANCE_RATES[INSURANCE_RATES.length - 1][key];
}

const CARD_TYPES: { value: CardType; label: string; icon: string; desc: string }[] = [
  { value: 'raw-single', label: 'Raw Single', icon: '🃏', desc: 'Ungraded card in top-loader' },
  { value: 'graded-slab', label: 'Graded Slab', icon: '🏆', desc: 'PSA, BGS, CGC, or SGC slab' },
  { value: 'lot', label: 'Card Lot', icon: '📦', desc: 'Multiple cards or small collection' },
  { value: 'sealed-box', label: 'Sealed Product', icon: '🎁', desc: 'Hobby box, blaster, or ETB' },
];

const SUPPLIES_COST: Record<CardType, { items: string[]; cost: number }> = {
  'raw-single': { items: ['Penny sleeve ($0.02)', 'Top-loader ($0.10)', 'Team bag ($0.05)', 'Envelope/mailer ($0.50)'], cost: 0.67 },
  'graded-slab': { items: ['Bubble wrap ($0.30)', 'Slab-sized box or mailer ($1.00)'], cost: 1.30 },
  'lot': { items: ['Penny sleeves ($0.50)', 'Top-loaders ($1.00)', 'Team bags ($0.25)', 'Box ($1.00)'], cost: 2.75 },
  'sealed-box': { items: ['Bubble wrap ($0.50)', 'Shipping box ($1.50)', 'Packing peanuts/paper ($0.50)'], cost: 2.50 },
};

export default function ShippingCalculator() {
  const [cardType, setCardType] = useState<CardType>('raw-single');
  const [cardValue, setCardValue] = useState<number>(50);
  const [addInsurance, setAddInsurance] = useState(false);
  const [showSupplies, setShowSupplies] = useState(false);

  const options = useMemo(() => {
    return SHIPPING_OPTIONS[cardType].map(opt => {
      const insuranceCost = addInsurance ? getInsuranceCost(cardValue, opt.carrier, opt.insurance) : 0;
      const suppliesCost = showSupplies ? SUPPLIES_COST[cardType].cost : 0;
      const totalCost = opt.cost + insuranceCost + suppliesCost;
      return { ...opt, insuranceCost, suppliesCost, totalCost };
    }).sort((a, b) => a.totalCost - b.totalCost);
  }, [cardType, cardValue, addInsurance, showSupplies]);

  const bestOption = options[0];
  const needsInsurance = cardValue > 50;

  return (
    <div className="space-y-8">
      {/* Card Type Selector */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">What are you shipping?</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CARD_TYPES.map(ct => (
            <button
              key={ct.value}
              onClick={() => setCardType(ct.value)}
              className={`p-4 rounded-xl border text-left transition-all ${
                cardType === ct.value
                  ? 'bg-emerald-950/60 border-emerald-500 ring-1 ring-emerald-500/50'
                  : 'bg-gray-800/60 border-gray-700 hover:border-gray-600'
              }`}
            >
              <span className="text-2xl block mb-1">{ct.icon}</span>
              <span className="text-sm font-semibold text-white block">{ct.label}</span>
              <span className="text-xs text-gray-400">{ct.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Card Value */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Card / shipment value</h2>
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">$</span>
            <input
              type="number"
              value={cardValue}
              onChange={e => setCardValue(Math.max(0, Number(e.target.value)))}
              className="w-full pl-8 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50"
              placeholder="50"
              min={0}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {[10, 25, 50, 100, 250, 500, 1000].map(v => (
              <button
                key={v}
                onClick={() => setCardValue(v)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  cardValue === v
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
                }`}
              >
                ${v >= 1000 ? `${v / 1000}K` : v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={addInsurance}
            onChange={e => setAddInsurance(e.target.checked)}
            className="w-4 h-4 rounded border-gray-600 text-emerald-500 focus:ring-emerald-500/50 bg-gray-800"
          />
          <span className="text-sm text-gray-300">Add shipping insurance</span>
          {needsInsurance && !addInsurance && (
            <span className="text-xs text-amber-400 ml-1">Recommended for ${cardValue}+ value</span>
          )}
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showSupplies}
            onChange={e => setShowSupplies(e.target.checked)}
            className="w-4 h-4 rounded border-gray-600 text-emerald-500 focus:ring-emerald-500/50 bg-gray-800"
          />
          <span className="text-sm text-gray-300">Include packing supplies cost</span>
        </label>
      </div>

      {/* Results */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Shipping options</h2>

        {/* Best option highlight */}
        {bestOption && (
          <div className="bg-emerald-950/40 border border-emerald-700/50 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-emerald-400 text-sm font-semibold">BEST VALUE</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-white font-bold text-lg">{bestOption.carrier} {bestOption.service}</span>
                <span className="text-gray-400 text-sm ml-2">({bestOption.label})</span>
              </div>
              <span className="text-emerald-400 font-bold text-2xl">${bestOption.totalCost.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
              <span>{bestOption.transitDays} business days</span>
              <span>{bestOption.tracking ? 'Tracking included' : 'No tracking'}</span>
              {bestOption.insurance > 0 && <span>${bestOption.insurance} insurance included</span>}
            </div>
          </div>
        )}

        {/* All options */}
        <div className="space-y-3">
          {options.map((opt, i) => (
            <div
              key={`${opt.carrier}-${opt.service}-${opt.method}-${i}`}
              className={`bg-gray-800/60 border rounded-xl p-4 ${
                i === 0 ? 'border-emerald-700/30' : 'border-gray-700/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                    opt.carrier === 'USPS' ? 'bg-blue-900/60 text-blue-300' :
                    opt.carrier === 'UPS' ? 'bg-amber-900/60 text-amber-300' :
                    'bg-purple-900/60 text-purple-300'
                  }`}>
                    {opt.carrier}
                  </span>
                  <span className="text-white font-semibold">{opt.service}</span>
                  <span className="text-gray-500 text-sm hidden sm:inline">({opt.label})</span>
                </div>
                <span className="text-white font-bold text-lg">${opt.totalCost.toFixed(2)}</span>
              </div>

              {/* Cost breakdown */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 mb-2">
                <span>Postage: ${opt.cost.toFixed(2)}</span>
                {opt.insuranceCost > 0 && <span>Insurance: +${opt.insuranceCost.toFixed(2)}</span>}
                {opt.suppliesCost > 0 && <span>Supplies: +${opt.suppliesCost.toFixed(2)}</span>}
                <span className="text-gray-600">|</span>
                <span>{opt.transitDays} days</span>
                <span>{opt.tracking ? '+ Tracking' : 'No tracking'}</span>
                {opt.insurance > 0 && <span>+ ${opt.insurance} ins. included</span>}
              </div>

              {/* Shipping cost as % of card value */}
              {cardValue > 0 && (
                <div className="mb-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-500">Shipping as % of value</span>
                    <span className={`font-medium ${
                      (opt.totalCost / cardValue) * 100 < 10 ? 'text-emerald-400' :
                      (opt.totalCost / cardValue) * 100 < 20 ? 'text-amber-400' :
                      'text-red-400'
                    }`}>
                      {((opt.totalCost / cardValue) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        (opt.totalCost / cardValue) * 100 < 10 ? 'bg-emerald-500' :
                        (opt.totalCost / cardValue) * 100 < 20 ? 'bg-amber-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(100, (opt.totalCost / cardValue) * 100)}%` }}
                    />
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-500">{opt.notes}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Packing supplies breakdown */}
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-3">Packing Supplies for {CARD_TYPES.find(c => c.value === cardType)?.label}</h3>
        <div className="space-y-2 mb-3">
          {SUPPLIES_COST[cardType].items.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-gray-300">{item.split('(')[0].trim()}</span>
              <span className="text-gray-400">{item.match(/\(([^)]+)\)/)?.[1]}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-700 pt-2 flex items-center justify-between">
          <span className="text-white font-semibold">Total supplies</span>
          <span className="text-emerald-400 font-bold">${SUPPLIES_COST[cardType].cost.toFixed(2)}</span>
        </div>
      </div>

      {/* Quick Reference */}
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Quick Reference: When to Use Each Method</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 text-gray-400 font-medium">Method</th>
                <th className="text-left py-2 text-gray-400 font-medium">Best For</th>
                <th className="text-right py-2 text-gray-400 font-medium">Cost Range</th>
                <th className="text-center py-2 text-gray-400 font-medium">Tracking</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-800">
                <td className="py-2 text-white">PWE</td>
                <td className="py-2 text-gray-300">Raw singles under $20</td>
                <td className="py-2 text-gray-300 text-right">$1.50</td>
                <td className="py-2 text-center text-red-400">No</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 text-white">Bubble Mailer</td>
                <td className="py-2 text-gray-300">$20-$100 raw or low-value slabs</td>
                <td className="py-2 text-gray-300 text-right">$4-$9</td>
                <td className="py-2 text-center text-emerald-400">Yes</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 text-white">Small Box</td>
                <td className="py-2 text-gray-300">$100+ slabs, small lots</td>
                <td className="py-2 text-gray-300 text-right">$10-$13</td>
                <td className="py-2 text-center text-emerald-400">Yes</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 text-white">Medium Box</td>
                <td className="py-2 text-gray-300">Multiple slabs, sealed boxes</td>
                <td className="py-2 text-gray-300 text-right">$15-$25</td>
                <td className="py-2 text-center text-emerald-400">Yes</td>
              </tr>
              <tr>
                <td className="py-2 text-white">Large Box</td>
                <td className="py-2 text-gray-300">Cases, big lots, heavy sealed</td>
                <td className="py-2 text-gray-300 text-right">$18-$35</td>
                <td className="py-2 text-center text-emerald-400">Yes</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Pro tips */}
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Pro Shipping Tips</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { title: 'Always use top-loaders', tip: 'Never ship a raw card without a penny sleeve + top-loader. Team bags add extra moisture protection. Cost: $0.17 per card.' },
            { title: 'PWE = risk for seller', tip: 'No tracking means eBay will side with the buyer in disputes. Only use PWE for sub-$20 cards where the risk is worth the savings.' },
            { title: 'Add "Non-Machinable" stamp', tip: 'PWE envelopes with top-loaders get damaged by USPS sorting machines. The non-machinable surcharge ($0.40) prevents machine processing.' },
            { title: 'Insure anything over $50', tip: 'USPS insurance starts at $2.75. It costs less than 5% of value for most cards. Worth it for every card over $50.' },
            { title: 'Use blue painters tape', tip: 'Tape the top-loader shut with painters tape (not scotch tape). It peels off cleanly without damaging the card or sleeve.' },
            { title: 'Sandwich method for PWE', tip: 'Place the top-loader between two pieces of cardboard, taped together. This prevents bending during mail processing.' },
            { title: 'Print labels at home', tip: 'USPS, UPS, and Pirate Ship offer discounts for printing labels online. Save 10-30% vs post office window prices.' },
            { title: 'eBay shipping discounts', tip: 'eBay sellers get USPS Commercial rates. First Class is ~$3.50 instead of $4.50. Priority is ~$8 instead of $10. Print through eBay.' },
          ].map((tip, i) => (
            <div key={i} className="p-3 bg-gray-900/50 rounded-lg">
              <h4 className="text-emerald-400 font-semibold text-sm mb-1">{tip.title}</h4>
              <p className="text-gray-400 text-xs leading-relaxed">{tip.tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related tools */}
      <div className="border-t border-gray-800 pt-6">
        <h3 className="text-lg font-bold text-white mb-3">Related Tools</h3>
        <div className="flex flex-wrap gap-3">
          {[
            { href: '/tools/flip-calc', label: 'Flip Profit Calculator', icon: '💸' },
            { href: '/tools/grading-roi', label: 'Grading ROI Calculator', icon: '💰' },
            { href: '/tools/insurance-calc', label: 'Insurance Calculator', icon: '🛡️' },
            { href: '/tools/dealer-scanner', label: 'Dealer Scanner', icon: '📱' },
            { href: '/tools/investment-calc', label: 'Investment Calculator', icon: '📊' },
          ].map(t => (
            <Link
              key={t.href}
              href={t.href}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 rounded-xl text-sm font-medium transition-colors"
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
