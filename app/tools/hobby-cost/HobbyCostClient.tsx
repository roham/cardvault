'use client';

import { useState, useMemo } from 'react';

/* ---------- Types ---------- */

type Intensity = 'casual' | 'moderate' | 'serious' | 'hardcore';
type Sport = 'baseball' | 'basketball' | 'football' | 'hockey' | 'pokemon' | 'multi';

interface CostCategory {
  name: string;
  annual: number;
  monthly: number;
  description: string;
  items: string[];
}

interface HobbyComparison {
  hobby: string;
  annual: number;
}

/* ---------- Cost Engine ---------- */

const INTENSITY_LABELS: Record<Intensity, { label: string; desc: string }> = {
  casual: { label: 'Casual Collector', desc: 'A few packs or singles per month. Mostly for fun.' },
  moderate: { label: 'Moderate Collector', desc: 'Regular purchases. Building sets. Some grading.' },
  serious: { label: 'Serious Collector', desc: 'Hobby boxes. Targeted singles. Frequent grading. Shows.' },
  hardcore: { label: 'Hardcore Collector', desc: 'Cases. High-end singles. Maximum grading. Travel for shows.' },
};

const SPORT_LABELS: Record<Sport, string> = {
  baseball: 'Baseball', basketball: 'Basketball', football: 'Football',
  hockey: 'Hockey', pokemon: 'Pokemon', multi: 'Multi-Sport/Category',
};

function buildCosts(intensity: Intensity, sport: Sport): CostCategory[] {
  // Sport multipliers (some sports cost more)
  const sportMult = sport === 'basketball' ? 1.2 : sport === 'pokemon' ? 0.9 : sport === 'multi' ? 1.3 : 1.0;

  const base: Record<Intensity, { sealed: number; singles: number; grading: number; supplies: number; shows: number; subscriptions: number; shipping: number }> = {
    casual:   { sealed: 360, singles: 240, grading: 0, supplies: 60, shows: 0, subscriptions: 0, shipping: 100 },
    moderate: { sealed: 1200, singles: 1000, grading: 400, supplies: 150, shows: 200, subscriptions: 120, shipping: 300 },
    serious:  { sealed: 3600, singles: 3000, grading: 1500, supplies: 300, shows: 800, subscriptions: 240, shipping: 600 },
    hardcore: { sealed: 12000, singles: 10000, grading: 5000, supplies: 600, shows: 3000, subscriptions: 360, shipping: 1500 },
  };

  const b = base[intensity];
  const costs: CostCategory[] = [
    {
      name: 'Sealed Product',
      annual: Math.round(b.sealed * sportMult),
      monthly: Math.round((b.sealed * sportMult) / 12),
      description: intensity === 'casual' ? 'A few blasters or retail packs per month' : intensity === 'moderate' ? 'Mix of hobby and retail boxes' : intensity === 'serious' ? 'Hobby boxes and occasional cases' : 'Full cases, high-end products, release day purchases',
      items: intensity === 'casual'
        ? ['2-3 blaster boxes/month ($25-$40 each)', 'Occasional retail packs']
        : intensity === 'moderate'
        ? ['1 hobby box/month ($100-$250)', '2-3 blasters/month', 'ETBs and mega boxes for new releases']
        : intensity === 'serious'
        ? ['2-3 hobby boxes/month ($150-$400)', '1 premium box/quarter ($500+)', 'Release day retail runs']
        : ['Full cases on release day ($2K-$5K each)', 'High-end products (National Treasures, Flawless)', 'Pre-orders and group breaks'],
    },
    {
      name: 'Singles & Raw Cards',
      annual: Math.round(b.singles * sportMult),
      monthly: Math.round((b.singles * sportMult) / 12),
      description: intensity === 'casual' ? 'Occasional eBay pickups of favorites' : intensity === 'moderate' ? 'Targeted player and set completion purchases' : intensity === 'serious' ? 'Strategic purchases for investment and PC' : 'High-value graded cards, vintage, numbered parallels',
      items: intensity === 'casual'
        ? ['$10-$20 eBay purchases for favorite players', 'Bargain bin finds at card shops']
        : intensity === 'moderate'
        ? ['$20-$100 singles for set completion', 'Rookie cards of rising players', 'COMC and eBay targeted buys']
        : intensity === 'serious'
        ? ['$50-$500 graded singles', 'Targeted rookie and prospect investments', 'Vintage pickup ($100-$1K range)']
        : ['$500+ premium graded cards', 'Vintage HOF cards ($1K-$10K+)', 'Numbered parallels and 1/1 chases'],
    },
    {
      name: 'Grading Services',
      annual: Math.round(b.grading * sportMult),
      monthly: Math.round((b.grading * sportMult) / 12),
      description: intensity === 'casual' ? 'No grading at this level' : intensity === 'moderate' ? 'Economy submissions of best pulls' : intensity === 'serious' ? 'Regular submissions across PSA/BGS/CGC' : 'Bulk submissions, express services, crossover grading',
      items: intensity === 'casual'
        ? ['Not typically grading at this level']
        : intensity === 'moderate'
        ? ['1-2 PSA economy submissions/year (10-15 cards each)', '$20-$30 per card at economy tier', 'Selective grading of best pulls only']
        : intensity === 'serious'
        ? ['4-6 submissions/year across PSA, BGS, CGC', 'Mix of economy and regular service tiers', 'Bulk submissions (20-50 cards each)', 'SGC for vintage']
        : ['Monthly submissions to multiple companies', 'Express/Super Express for high-value cards', 'Crossover grading (BGS to PSA)', 'Bulk pricing negotiations'],
    },
    {
      name: 'Supplies & Storage',
      annual: Math.round(b.supplies * sportMult),
      monthly: Math.round((b.supplies * sportMult) / 12),
      description: 'Penny sleeves, toploaders, one-touches, binder pages, storage boxes',
      items: intensity === 'casual'
        ? ['Penny sleeves ($3-$5/100)', 'Basic toploaders ($5-$8/25)', '1-2 storage boxes']
        : intensity === 'moderate'
        ? ['Penny sleeves and toploaders in bulk', 'One-touch magnetic holders for hits ($3-$5 each)', 'Binder pages and albums', '3-5 storage boxes']
        : intensity === 'serious'
        ? ['Bulk supply orders (500+ sleeves, 200+ toploaders)', 'One-touch holders for all grading candidates', 'Premium display cases', 'Climate-controlled storage considerations']
        : ['Industrial supply quantities', 'Premium display cases and shelving', 'Fireproof safe for high-value cards', 'Humidity control equipment'],
    },
    {
      name: 'Shows & Travel',
      annual: Math.round(b.shows * sportMult),
      monthly: Math.round((b.shows * sportMult) / 12),
      description: intensity === 'casual' ? 'No shows at this level' : intensity === 'moderate' ? 'Local card shows' : intensity === 'serious' ? 'Regional shows and one major event' : 'The National, multiple regional shows, dealer tables',
      items: intensity === 'casual'
        ? ['Not typically attending shows yet']
        : intensity === 'moderate'
        ? ['2-4 local card shows/year (free-$10 entry)', 'Gas and parking', 'Cash for show purchases ($50-$100 per show)']
        : intensity === 'serious'
        ? ['6-10 local/regional shows', '1 major show (The National, NSCC)', 'Hotel and travel for major show ($500-$1,000)', 'VIP passes ($50-$200)']
        : ['The National + 2-3 major regional shows', 'Dealer table rental ($300-$1,000 per show)', 'Travel, hotels, meals ($500-$1,500 per trip)', '15+ local shows per year'],
    },
    {
      name: 'Subscriptions & Services',
      annual: Math.round(b.subscriptions * sportMult),
      monthly: Math.round((b.subscriptions * sportMult) / 12),
      description: intensity === 'casual' ? 'No paid subscriptions needed' : 'Price guides, market tools, and community access',
      items: intensity === 'casual'
        ? ['Free resources like CardVault are sufficient']
        : intensity === 'moderate'
        ? ['Beckett Online Price Guide ($10-$25/mo)', 'Card Ladder or Market Movers ($10-$15/mo)']
        : intensity === 'serious'
        ? ['Beckett Online ($25/mo)', 'Card Ladder Pro ($15/mo)', 'Sports Card Investor premium ($10/mo)', '130point.com or similar']
        : ['All major price guide subscriptions', 'Market analytics tools', 'Auction sniping services', 'Collector community memberships'],
    },
    {
      name: 'Shipping & Fees',
      annual: Math.round(b.shipping * sportMult),
      monthly: Math.round((b.shipping * sportMult) / 12),
      description: 'eBay/platform fees, shipping supplies, postage for sales and purchases',
      items: intensity === 'casual'
        ? ['Incoming shipping on eBay purchases ($3-$5 each)', 'Occasional bubble mailers']
        : intensity === 'moderate'
        ? ['Shipping on 20-40 eBay purchases/year', 'Selling fees (13% eBay)', 'Bubble mailers and packing supplies', 'USPS First Class and Priority Mail']
        : intensity === 'serious'
        ? ['High-volume shipping supplies', 'Insurance on valuable shipments', 'Platform selling fees (eBay, COMC, Whatnot)', 'Tracked and insured shipping for grading']
        : ['Commercial shipping rates', 'Full insurance on all shipments', 'Signature confirmation on $200+ items', 'Return shipping for grading submissions'],
    },
  ];
  return costs;
}

const HOBBY_COMPARISONS: HobbyComparison[] = [
  { hobby: 'Golf (green fees, equipment)', annual: 3500 },
  { hobby: 'Gaming (console, games, subscriptions)', annual: 1200 },
  { hobby: 'Fishing (gear, licenses, trips)', annual: 2000 },
  { hobby: 'Woodworking (tools, materials)', annual: 2500 },
  { hobby: 'Photography (camera, lenses, editing)', annual: 3000 },
  { hobby: 'Craft Beer/Wine (tastings, bottles)', annual: 2400 },
  { hobby: 'Gym/Fitness (membership, supplements)', annual: 1500 },
  { hobby: 'Streaming (Netflix, Spotify, etc.)', annual: 600 },
];

/* ---------- Component ---------- */

export default function HobbyCostClient() {
  const [intensity, setIntensity] = useState<Intensity | null>(null);
  const [sport, setSport] = useState<Sport>('multi');
  const [step, setStep] = useState(1);

  const costs = useMemo(() => intensity ? buildCosts(intensity, sport) : [], [intensity, sport]);
  const totalAnnual = useMemo(() => costs.reduce((s, c) => s + c.annual, 0), [costs]);
  const totalMonthly = useMemo(() => Math.round(totalAnnual / 12), [totalAnnual]);

  function fmt(n: number): string {
    return `$${n.toLocaleString('en-US')}`;
  }

  if (step === 1) {
    return (
      <div>
        <h2 className="text-white font-bold text-lg mb-4">Step 1: Your Collecting Intensity</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {(Object.entries(INTENSITY_LABELS) as [Intensity, { label: string; desc: string }][]).map(([key, { label, desc }]) => (
            <button key={key} onClick={() => { setIntensity(key); setStep(2); }}
              className={`text-left p-4 rounded-xl border transition-colors ${intensity === key ? 'bg-blue-600/20 border-blue-600/50' : 'bg-gray-900/60 border-gray-800 hover:border-gray-600'}`}>
              <div className="text-white font-semibold mb-1">{label}</div>
              <div className="text-gray-400 text-sm">{desc}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div>
        <h2 className="text-white font-bold text-lg mb-4">Step 2: What Do You Collect?</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {(Object.entries(SPORT_LABELS) as [Sport, string][]).map(([key, label]) => (
            <button key={key} onClick={() => { setSport(key); setStep(3); }}
              className={`p-4 rounded-xl border transition-colors ${sport === key ? 'bg-blue-600/20 border-blue-600/50' : 'bg-gray-900/60 border-gray-800 hover:border-gray-600'}`}>
              <div className="text-white font-semibold text-sm">{label}</div>
            </button>
          ))}
        </div>
        <button onClick={() => setStep(1)} className="mt-4 text-sm text-gray-500 hover:text-gray-300">
          &larr; Back
        </button>
      </div>
    );
  }

  // Step 3: Results
  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="px-3 py-1 bg-blue-600/20 border border-blue-600/40 text-blue-400 text-sm rounded-full font-medium">
          {INTENSITY_LABELS[intensity!].label}
        </span>
        <span className="px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded-full">
          {SPORT_LABELS[sport]}
        </span>
        <button onClick={() => setStep(1)} className="ml-auto text-sm text-gray-500 hover:text-gray-300">
          Change &rarr;
        </button>
      </div>

      {/* Total Summary */}
      <div className="bg-gradient-to-r from-blue-950/60 to-purple-950/60 border border-blue-800/40 rounded-2xl p-6 mb-6 text-center">
        <div className="text-gray-400 text-sm mb-1">Estimated Annual Hobby Cost</div>
        <div className="text-4xl sm:text-5xl font-bold text-white mb-2">{fmt(totalAnnual)}</div>
        <div className="text-gray-400 text-sm">{fmt(totalMonthly)}/month</div>
      </div>

      {/* Cost Breakdown */}
      <div className="space-y-3 mb-8">
        {costs.map((cat, i) => {
          const pct = totalAnnual > 0 ? (cat.annual / totalAnnual) * 100 : 0;
          return (
            <details key={i} className="group bg-gray-900/60 border border-gray-800 rounded-xl">
              <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-900/80 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 text-right text-gray-500 text-xs">{pct.toFixed(0)}%</div>
                  <div className="w-20 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                  <span className="text-white font-medium text-sm">{cat.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-white font-semibold text-sm">{fmt(cat.annual)}/yr</span>
                  <span className="text-gray-500 group-open:rotate-180 transition-transform">&#9662;</span>
                </div>
              </summary>
              <div className="px-4 pb-4 border-t border-gray-800 pt-3">
                <p className="text-gray-400 text-sm mb-3">{cat.description}</p>
                <div className="text-gray-500 text-xs mb-2">{fmt(cat.monthly)}/month</div>
                <ul className="space-y-1">
                  {cat.items.map((item, j) => (
                    <li key={j} className="text-gray-400 text-sm flex gap-2">
                      <span className="text-blue-400 shrink-0">&bull;</span>{item}
                    </li>
                  ))}
                </ul>
              </div>
            </details>
          );
        })}
      </div>

      {/* Allocation Visual */}
      <div className="mb-8">
        <h3 className="text-white font-bold mb-3">Where Your Money Goes</h3>
        <div className="flex h-8 rounded-full overflow-hidden">
          {costs.map((cat, i) => {
            const pct = totalAnnual > 0 ? (cat.annual / totalAnnual) * 100 : 0;
            if (pct < 2) return null;
            const colors = ['bg-blue-600', 'bg-emerald-600', 'bg-purple-600', 'bg-amber-600', 'bg-red-500', 'bg-cyan-600', 'bg-pink-600'];
            return (
              <div key={i} className={`${colors[i % colors.length]} relative group`} style={{ width: `${pct}%` }} title={`${cat.name}: ${pct.toFixed(0)}%`}>
                {pct > 12 && <span className="absolute inset-0 flex items-center justify-center text-white text-[10px] font-bold truncate px-1">{cat.name}</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Hobby Comparison */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 mb-8">
        <h3 className="text-white font-bold mb-4">How Does Card Collecting Compare?</h3>
        <div className="space-y-2">
          {[...HOBBY_COMPARISONS, { hobby: `Card Collecting (${INTENSITY_LABELS[intensity!].label})`, annual: totalAnnual }]
            .sort((a, b) => a.annual - b.annual)
            .map((h, i) => {
              const isCards = h.hobby.startsWith('Card Collecting');
              const maxVal = Math.max(...HOBBY_COMPARISONS.map(x => x.annual), totalAnnual);
              const pct = (h.annual / maxVal) * 100;
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-48 sm:w-56 text-sm truncate" title={h.hobby}>
                    <span className={isCards ? 'text-blue-400 font-semibold' : 'text-gray-400'}>{h.hobby}</span>
                  </div>
                  <div className="flex-1 h-4 bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${isCards ? 'bg-blue-500' : 'bg-gray-600'}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className={`w-16 text-right text-sm ${isCards ? 'text-blue-400 font-semibold' : 'text-gray-500'}`}>{fmt(h.annual)}</div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Money-Saving Tips */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
        <h3 className="text-white font-bold mb-3">Tips to Reduce Your Hobby Costs</h3>
        <ul className="space-y-2 text-sm text-gray-400">
          <li className="flex gap-2"><span className="text-green-400 shrink-0">1.</span>Buy supplies in bulk — penny sleeves and toploaders are 50% cheaper in 1,000-packs vs 100-packs</li>
          <li className="flex gap-2"><span className="text-green-400 shrink-0">2.</span>Use PSA/BGS economy tiers — $20-$30 per card vs $100+ for regular service, same result</li>
          <li className="flex gap-2"><span className="text-green-400 shrink-0">3.</span>Join Facebook groups for deals — zero platform fees means 10-20% lower prices than eBay</li>
          <li className="flex gap-2"><span className="text-green-400 shrink-0">4.</span>Negotiate at card shows — dealers expect it, especially late afternoon on the last day</li>
          <li className="flex gap-2"><span className="text-green-400 shrink-0">5.</span>Set a monthly budget and stick to it — the hobby is designed to create FOMO spending</li>
          <li className="flex gap-2"><span className="text-green-400 shrink-0">6.</span>Buy singles instead of ripping sealed — the expected value of opening boxes is almost always negative</li>
        </ul>
      </div>
    </div>
  );
}
