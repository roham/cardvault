'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

/* ───── Platform Fee Data ───── */
interface Platform {
  name: string;
  icon: string;
  sellerFee: number; // percentage of sale price
  sellerFeeLabel: string;
  buyerPremium: number; // percentage added to hammer price (affects realized price for auction houses)
  paymentProcessing: number; // percentage
  paymentProcessingLabel: string;
  fixedFee: number; // flat fee per transaction
  shippingCost: number; // estimated shipping cost seller pays
  shippingLabel: string;
  minValue: number; // minimum card value where this platform makes sense
  speed: string; // how fast you get paid
  audience: string; // who buys here
  bestFor: string;
  notes: string;
}

const platforms: Platform[] = [
  {
    name: 'eBay',
    icon: '🛒',
    sellerFee: 0.1325,
    sellerFeeLabel: '13.25% final value fee',
    buyerPremium: 0,
    paymentProcessing: 0,
    paymentProcessingLabel: 'Included in FVF',
    fixedFee: 0.30,
    shippingCost: 4.50,
    shippingLabel: '$4.50 avg (PWE–bubble mailer)',
    minValue: 1,
    speed: '2–5 days after delivery',
    audience: 'Everyone — largest buyer pool',
    bestFor: 'Cards under $500, quick sales, high volume',
    notes: 'Largest marketplace. Managed payments includes processing. 13.25% FVF on sports cards category.',
  },
  {
    name: 'PWCC Marketplace',
    icon: '🏛️',
    sellerFee: 0.10,
    sellerFeeLabel: '10% seller commission',
    buyerPremium: 0.20,
    paymentProcessing: 0,
    paymentProcessingLabel: 'Included in commission',
    fixedFee: 0,
    shippingCost: 0,
    shippingLabel: 'Free (vault-to-vault)',
    minValue: 50,
    speed: '7–14 days after auction closes',
    audience: 'Serious collectors and investors',
    bestFor: 'Graded cards $100+, auction format',
    notes: 'Weekly auctions. Buyer premium means buyers pay 20% above hammer price, which can depress hammer prices slightly. Strong for PSA 9/10 cards.',
  },
  {
    name: 'Goldin',
    icon: '⭐',
    sellerFee: 0.10,
    sellerFeeLabel: '10% seller commission',
    buyerPremium: 0.22,
    paymentProcessing: 0,
    paymentProcessingLabel: 'Included in commission',
    fixedFee: 0,
    shippingCost: 0,
    shippingLabel: 'Free (vault-to-vault)',
    minValue: 250,
    speed: '14–21 days after auction closes',
    audience: 'High-end collectors, investors',
    bestFor: 'Premium cards $500+, flagship auctions',
    notes: 'Premium auction house. Higher buyer premium (22%) can suppress hammer prices. Best for marquee, high-value cards that benefit from their marketing.',
  },
  {
    name: 'Heritage Auctions',
    icon: '🏦',
    sellerFee: 0.10,
    sellerFeeLabel: '10% seller commission (negotiable)',
    buyerPremium: 0.20,
    paymentProcessing: 0,
    paymentProcessingLabel: 'Included in commission',
    fixedFee: 0,
    shippingCost: 0,
    shippingLabel: 'Handled by Heritage',
    minValue: 500,
    speed: '30–45 days after auction closes',
    audience: 'Wealthy collectors, institutions',
    bestFor: 'Ultra-premium cards $1,000+, vintage',
    notes: 'Largest collectibles auction house. Monthly and weekly auctions. Commission negotiable for high-value consignments. Slowest payout but highest realized prices for top cards.',
  },
  {
    name: 'MySlabs',
    icon: '📱',
    sellerFee: 0.08,
    sellerFeeLabel: '8% seller fee',
    buyerPremium: 0,
    paymentProcessing: 0.029,
    paymentProcessingLabel: '2.9% payment processing',
    fixedFee: 0.30,
    shippingCost: 5.00,
    shippingLabel: '$5.00 avg (tracked shipping)',
    minValue: 25,
    speed: '3–5 days after delivery confirmed',
    audience: 'Mobile-first collectors',
    bestFor: 'Graded slabs $25–$500, mobile selling',
    notes: 'Mobile marketplace for graded cards. Lower fees than eBay. Growing buyer base but smaller than eBay. Authentication built in.',
  },
  {
    name: 'COMC',
    icon: '📦',
    sellerFee: 0.05,
    sellerFeeLabel: '5% processing fee',
    buyerPremium: 0,
    paymentProcessing: 0,
    paymentProcessingLabel: 'Included in processing',
    fixedFee: 1.00,
    shippingCost: 0,
    shippingLabel: '$0 (already in COMC vault)',
    minValue: 2,
    speed: '30+ days (consignment model)',
    audience: 'Budget collectors, set builders',
    bestFor: 'Bulk low-value cards $2–$50, long-term consignment',
    notes: 'Check Out My Cards — consignment marketplace. Ship cards once, they handle storage, listing, and shipping. Great for bulk but slow. $1 min processing fee per card.',
  },
  {
    name: 'Facebook Groups',
    icon: '👥',
    sellerFee: 0,
    sellerFeeLabel: '0% platform fee',
    buyerPremium: 0,
    paymentProcessing: 0.029,
    paymentProcessingLabel: '2.9% + $0.30 (PayPal G&S)',
    fixedFee: 0.30,
    shippingCost: 4.50,
    shippingLabel: '$4.50 avg (PWE–bubble mailer)',
    minValue: 10,
    speed: 'Instant (PayPal/Venmo)',
    audience: 'Community collectors, deal seekers',
    bestFor: 'Mid-range cards $10–$300, fast direct sales',
    notes: 'No platform fees — only PayPal G&S or Venmo fees. Requires group membership and reputation. Risk of scams. Best for established sellers with good feedback.',
  },
  {
    name: 'Local Card Shop',
    icon: '🏪',
    sellerFee: 0,
    sellerFeeLabel: '0% fees (cash sale)',
    buyerPremium: 0,
    paymentProcessing: 0,
    paymentProcessingLabel: 'N/A — cash or store credit',
    fixedFee: 0,
    shippingCost: 0,
    shippingLabel: '$0 (in-person)',
    minValue: 5,
    speed: 'Instant (cash or credit)',
    audience: 'Local collectors, shop owners',
    bestFor: 'Quick cash, bulk offloading, cards you want gone today',
    notes: 'Expect 40–60% of market value. Instant cash, no fees, no shipping hassle. Best for cards you want to move fast or bulk lots. Negotiate — shops need inventory.',
  },
];

const LCS_BUYBACK_RATE = 0.50; // Local card shops pay ~50% of market value

function calculateNetProceeds(platform: Platform, cardValue: number): { net: number; fees: number; feePercent: number; effectiveSale: number } {
  if (platform.name === 'Local Card Shop') {
    const effectiveSale = cardValue * LCS_BUYBACK_RATE;
    return { net: effectiveSale, fees: cardValue - effectiveSale, feePercent: 50, effectiveSale };
  }

  // For auction houses with buyer premium, the hammer price tends to be lower
  // because buyers factor in the premium. Model: effective sale ≈ cardValue / (1 + buyerPremium * 0.5)
  // This is a simplification — in practice, strong lots still hit full value
  const buyerPremiumDrag = platform.buyerPremium > 0 ? platform.buyerPremium * 0.3 : 0;
  const effectiveSale = cardValue * (1 - buyerPremiumDrag);

  const sellerCommission = effectiveSale * platform.sellerFee;
  const processing = effectiveSale * platform.paymentProcessing;
  const totalFees = sellerCommission + processing + platform.fixedFee + platform.shippingCost;
  const net = effectiveSale - totalFees;
  const feePercent = cardValue > 0 ? ((cardValue - net) / cardValue) * 100 : 0;

  return { net: Math.max(0, net), fees: cardValue - Math.max(0, net), feePercent, effectiveSale };
}

export default function SellingPlatforms() {
  const [cardValue, setCardValue] = useState<number>(100);
  const [isGraded, setIsGraded] = useState(true);
  const [sortBy, setSortBy] = useState<'net' | 'speed' | 'fees'>('net');

  const results = useMemo(() => {
    return platforms
      .filter(p => cardValue >= p.minValue)
      .map(p => ({
        platform: p,
        ...calculateNetProceeds(p, cardValue),
      }))
      .sort((a, b) => {
        if (sortBy === 'net') return b.net - a.net;
        if (sortBy === 'fees') return a.feePercent - b.feePercent;
        return 0; // speed sort is qualitative
      });
  }, [cardValue, sortBy]);

  const bestNet = results.length > 0 ? results.reduce((max, r) => r.net > max ? r.net : max, 0) : 0;

  const presets = [25, 50, 100, 250, 500, 1000, 5000];

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Enter Your Card Details</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Estimated Card Value</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">$</span>
              <input
                type="number"
                value={cardValue}
                onChange={e => setCardValue(Math.max(0, Number(e.target.value)))}
                className="w-full bg-gray-900 border border-gray-600 text-white rounded-xl pl-8 pr-4 py-3 text-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                min={0}
                step={5}
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {presets.map(v => (
                <button
                  key={v}
                  onClick={() => setCardValue(v)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    cardValue === v
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'bg-gray-800 border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300'
                  }`}
                >
                  ${v.toLocaleString()}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Card Type</label>
            <div className="flex gap-3">
              <button
                onClick={() => setIsGraded(true)}
                className={`flex-1 py-3 rounded-xl text-sm font-medium border transition-colors ${
                  isGraded ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-gray-800 border-gray-600 text-gray-400 hover:border-gray-500'
                }`}
              >
                Graded Slab
              </button>
              <button
                onClick={() => setIsGraded(false)}
                className={`flex-1 py-3 rounded-xl text-sm font-medium border transition-colors ${
                  !isGraded ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-gray-800 border-gray-600 text-gray-400 hover:border-gray-500'
                }`}
              >
                Raw Card
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {isGraded
                ? 'Graded cards sell well on all platforms, especially auction houses.'
                : 'Raw cards work best on eBay, Facebook Groups, and local shops. Auction houses prefer graded.'}
            </p>
          </div>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-400">Sort by:</span>
        {([['net', 'Most Money'], ['fees', 'Lowest Fees'], ['speed', 'Fastest Payment']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSortBy(key as typeof sortBy)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              sortBy === key
                ? 'bg-emerald-600 border-emerald-500 text-white'
                : 'bg-gray-800 border-gray-600 text-gray-400 hover:border-gray-500'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="space-y-4">
        {results.length === 0 ? (
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-8 text-center">
            <p className="text-gray-400">Enter a card value above to see platform comparisons.</p>
          </div>
        ) : (
          results.map((r, idx) => {
            const isBest = r.net === bestNet && idx === 0;
            const barWidth = bestNet > 0 ? (r.net / bestNet) * 100 : 0;
            return (
              <div
                key={r.platform.name}
                className={`bg-gray-800/50 border rounded-xl p-5 transition-all ${
                  isBest ? 'border-emerald-500/60 ring-1 ring-emerald-500/20' : 'border-gray-700/50'
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{r.platform.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white">{r.platform.name}</h3>
                        {isBest && (
                          <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Best Net
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{r.platform.bestFor}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`text-xl font-bold ${isBest ? 'text-emerald-400' : 'text-white'}`}>
                      ${r.net.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">you keep</div>
                  </div>
                </div>

                {/* Net proceeds bar */}
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${isBest ? 'bg-emerald-500' : 'bg-blue-500'}`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>

                {/* Fee breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-gray-900/50 rounded-lg p-2.5">
                    <div className="text-gray-500 mb-0.5">Platform Fee</div>
                    <div className="text-gray-300 font-medium">{r.platform.sellerFeeLabel}</div>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-2.5">
                    <div className="text-gray-500 mb-0.5">Processing</div>
                    <div className="text-gray-300 font-medium">{r.platform.paymentProcessingLabel}</div>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-2.5">
                    <div className="text-gray-500 mb-0.5">Shipping</div>
                    <div className="text-gray-300 font-medium">{r.platform.shippingLabel}</div>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-2.5">
                    <div className="text-gray-500 mb-0.5">Payment Speed</div>
                    <div className="text-gray-300 font-medium">{r.platform.speed}</div>
                  </div>
                </div>

                {/* Total fee summary */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700/50 text-xs">
                  <span className="text-gray-500">
                    Total fees: <span className="text-red-400 font-medium">${r.fees.toFixed(2)}</span> ({r.feePercent.toFixed(1)}% of card value)
                  </span>
                  <span className="text-gray-500">{r.platform.audience}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Comparison Table */}
      {results.length > 0 && (
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-gray-700/50">
            <h2 className="text-lg font-semibold text-white">Quick Comparison</h2>
            <p className="text-sm text-gray-400">Side-by-side for a ${cardValue.toLocaleString()} card</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700/50">
                  <th className="text-left text-gray-400 font-medium px-5 py-3">Platform</th>
                  <th className="text-right text-gray-400 font-medium px-5 py-3">Sale Price</th>
                  <th className="text-right text-gray-400 font-medium px-5 py-3">Total Fees</th>
                  <th className="text-right text-gray-400 font-medium px-5 py-3">You Keep</th>
                  <th className="text-right text-gray-400 font-medium px-5 py-3">Fee %</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, idx) => (
                  <tr key={r.platform.name} className={`border-b border-gray-700/30 ${idx === 0 ? 'bg-emerald-950/20' : ''}`}>
                    <td className="px-5 py-3 font-medium text-white">{r.platform.icon} {r.platform.name}</td>
                    <td className="px-5 py-3 text-right text-gray-300">${r.effectiveSale.toFixed(2)}</td>
                    <td className="px-5 py-3 text-right text-red-400">${r.fees.toFixed(2)}</td>
                    <td className={`px-5 py-3 text-right font-bold ${idx === 0 ? 'text-emerald-400' : 'text-white'}`}>${r.net.toFixed(2)}</td>
                    <td className="px-5 py-3 text-right text-gray-400">{r.feePercent.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Platform Tips */}
      <section className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Selling Tips by Value Range</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { range: 'Under $25', tip: 'Sell on eBay with PWE shipping or offload in bulk to your LCS. Auction house and PWCC fees eat too much at this price point.', color: 'text-gray-400' },
            { range: '$25–$100', tip: 'eBay and Facebook Groups are your best bet. MySlabs works well for graded slabs. COMC for hands-off consignment if you can wait.', color: 'text-blue-400' },
            { range: '$100–$500', tip: 'PWCC Marketplace becomes competitive here. eBay auction format can drive bidding wars. Facebook Groups for the quickest sale at a fair price.', color: 'text-purple-400' },
            { range: '$500–$5,000', tip: 'Auction houses shine here. PWCC, Goldin, and Heritage all make sense. Their marketing reach and buyer base justify the buyer premium drag on hammer price.', color: 'text-emerald-400' },
            { range: '$5,000+', tip: 'Heritage Auctions or Goldin flagship events. Negotiate seller commission — at these values, auction houses will deal. Never sell ultra-premium cards on eBay.', color: 'text-yellow-400' },
            { range: 'Bulk Lots', tip: 'Local card shops for instant cash. COMC for patient consignment. eBay lots with good photos. Facebook groups with a fair BIN price.', color: 'text-orange-400' },
          ].map(t => (
            <div key={t.range} className="bg-gray-900/50 rounded-xl p-4">
              <div className={`text-sm font-semibold mb-1 ${t.color}`}>{t.range}</div>
              <p className="text-xs text-gray-400 leading-relaxed">{t.tip}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Related Tools */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Related Tools</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/tools/flip-calc', label: 'Flip Profit Calculator', icon: '💸' },
            { href: '/tools/listing-generator', label: 'eBay Listing Generator', icon: '📝' },
            { href: '/tools/shipping-calc', label: 'Shipping Calculator', icon: '📬' },
            { href: '/tools/tax-calc', label: 'Card Tax Calculator', icon: '🧾' },
          ].map(t => (
            <Link
              key={t.href}
              href={t.href}
              className="bg-gray-800/50 border border-gray-700/50 hover:border-gray-600 rounded-xl p-4 text-center transition-colors"
            >
              <div className="text-2xl mb-2">{t.icon}</div>
              <div className="text-xs text-gray-400">{t.label}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
