'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

/* ───── Box Data ───── */
interface SubscriptionBox {
  id: string;
  name: string;
  url: string;
  priceRange: string;
  priceMin: number;
  priceMax: number;
  sports: string[];
  tiers: { name: string; price: number; description: string }[];
  frequency: string;
  avgEV: string;
  hitRate: string;
  rating: number;
  pros: string[];
  cons: string[];
  bestFor: string;
  guarantee: string;
}

const boxes: SubscriptionBox[] = [
  {
    id: 'boombox',
    name: 'Boombox',
    url: 'boombox.com',
    priceRange: '$50-$300/mo',
    priceMin: 50,
    priceMax: 300,
    sports: ['Baseball', 'Basketball', 'Football', 'Hockey', 'Soccer', 'Pokemon'],
    tiers: [
      { name: 'Starter', price: 50, description: '1-2 packs from quality products' },
      { name: 'Mid-Range', price: 100, description: '3-4 packs including hobby products' },
      { name: 'Elite', price: 200, description: 'Premium hobby boxes and hits guaranteed' },
      { name: 'Ultra', price: 300, description: 'Top-tier products with auto/relic guarantee' },
    ],
    frequency: 'Monthly',
    avgEV: '70-90% of retail',
    hitRate: 'Varies by tier — Elite+ guarantees auto/relic',
    rating: 4.2,
    pros: ['Wide sport selection', 'Multiple price tiers', 'Hit guarantees at higher tiers', 'Well-known brand'],
    cons: ['EV often below purchase price', 'Lower tiers can feel underwhelming', 'Shipping adds to cost'],
    bestFor: 'Casual collectors who want variety across sports',
    guarantee: 'Auto or relic guaranteed in Elite+ tiers',
  },
  {
    id: 'layton',
    name: 'Layton Sports Cards',
    url: 'laytonsportscards.com',
    priceRange: '$40-$250/mo',
    priceMin: 40,
    priceMax: 250,
    sports: ['Baseball', 'Basketball', 'Football', 'Hockey'],
    tiers: [
      { name: 'Bronze', price: 40, description: 'Entry-level packs and products' },
      { name: 'Silver', price: 80, description: 'Mix of retail and hobby packs' },
      { name: 'Gold', price: 150, description: 'Hobby boxes with guaranteed hits' },
      { name: 'Platinum', price: 250, description: 'Premium hobby with multiple autos' },
    ],
    frequency: 'Monthly',
    avgEV: '75-95% of retail',
    hitRate: 'Gold+ guarantees autograph',
    rating: 4.4,
    pros: ['Strong EV at higher tiers', 'Good product selection', 'Reliable shipping', 'Transparent about what you get'],
    cons: ['Lower tiers are basic', 'Limited sport options vs Boombox', 'Can sell out quickly'],
    bestFor: 'Serious collectors who want hobby-grade products',
    guarantee: 'Autograph guaranteed in Gold+ tiers',
  },
  {
    id: 'sportscardbox',
    name: 'Sports Card Box',
    url: 'sportscardbox.com',
    priceRange: '$25-$200/mo',
    priceMin: 25,
    priceMax: 200,
    sports: ['Baseball', 'Basketball', 'Football'],
    tiers: [
      { name: 'Rookie', price: 25, description: 'Fun starter pack for beginners' },
      { name: 'Pro', price: 75, description: 'Quality packs with hit potential' },
      { name: 'Hall of Fame', price: 150, description: 'Premium products, auto guaranteed' },
      { name: 'GOAT', price: 200, description: 'Top-tier hobby products' },
    ],
    frequency: 'Monthly',
    avgEV: '65-85% of retail',
    hitRate: 'HoF+ guarantees auto',
    rating: 3.8,
    pros: ['Low entry price ($25)', 'Good for beginners', 'Clean unboxing experience'],
    cons: ['Lower EV than competitors', 'Limited to 3 sports', 'Auto quality varies'],
    bestFor: 'Beginners and gift-givers looking for affordable entry',
    guarantee: 'Auto guaranteed in Hall of Fame+',
  },
  {
    id: 'topps-rip',
    name: 'Topps Rip',
    url: 'topps.com',
    priceRange: '$25-$100/card',
    priceMin: 25,
    priceMax: 100,
    sports: ['Baseball'],
    tiers: [
      { name: 'Standard Rip', price: 25, description: 'Rippable card with insert inside' },
      { name: 'Premium Rip', price: 50, description: 'Higher-value insert potential' },
      { name: 'Ultra Rip', price: 100, description: 'Premium inserts including autos' },
    ],
    frequency: 'Per-card (not subscription)',
    avgEV: '50-200% (high variance)',
    hitRate: 'Every card has an insert — variance is the value',
    rating: 4.0,
    pros: ['Unique rip mechanic is exciting', 'Chance at huge hits', 'Official Topps product', 'Great for content/streaming'],
    cons: ['Baseball only', 'High variance — most rips lose value', 'Not a true subscription', 'Can be addictive'],
    bestFor: 'Content creators and thrill-seekers who love the gamble',
    guarantee: 'Every card contains a rippable insert',
  },
  {
    id: 'hit-parade',
    name: 'Hit Parade',
    url: 'dacardworld.com',
    priceRange: '$50-$500/box',
    priceMin: 50,
    priceMax: 500,
    sports: ['Baseball', 'Basketball', 'Football', 'Hockey', 'Wrestling'],
    tiers: [
      { name: 'Signature Series', price: 50, description: 'Guaranteed auto from graded company' },
      { name: 'Graded Card Edition', price: 100, description: 'Guaranteed graded card (PSA/BGS)' },
      { name: 'Premium', price: 250, description: 'Higher-end autos and graded cards' },
      { name: 'Case Hit', price: 500, description: 'Case hit potential with premium autos' },
    ],
    frequency: 'Per-box (not subscription)',
    avgEV: '80-120% of retail',
    hitRate: 'Every box guarantees a hit (auto or graded)',
    rating: 4.3,
    pros: ['Guaranteed hit every box', 'Good EV', 'Wide selection', 'Great for gifts'],
    cons: ['Not a true subscription', 'Can be repetitive', 'Some autos are minor players'],
    bestFor: 'Gift-givers and collectors who want guaranteed value',
    guarantee: 'Guaranteed autograph or graded card in every box',
  },
];

type SortKey = 'rating' | 'priceMin' | 'priceMax' | 'name';

export default function SubscriptionBoxes() {
  const [selectedBox, setSelectedBox] = useState<string | null>(null);
  const [sportFilter, setSportFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortKey>('rating');
  const [maxPrice, setMaxPrice] = useState<number>(500);

  const allSports = useMemo(() => {
    const sports = new Set<string>();
    boxes.forEach(b => b.sports.forEach(s => sports.add(s)));
    return ['all', ...Array.from(sports).sort()];
  }, []);

  const filteredBoxes = useMemo(() => {
    return boxes
      .filter(b => sportFilter === 'all' || b.sports.includes(sportFilter))
      .filter(b => b.priceMin <= maxPrice)
      .sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'priceMin') return a.priceMin - b.priceMin;
        if (sortBy === 'priceMax') return b.priceMax - a.priceMax;
        return a.name.localeCompare(b.name);
      });
  }, [sportFilter, sortBy, maxPrice]);

  const activeBox = boxes.find(b => b.id === selectedBox);

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Sport</label>
          <select
            value={sportFilter}
            onChange={e => setSportFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-1.5"
          >
            {allSports.map(s => <option key={s} value={s}>{s === 'all' ? 'All Sports' : s}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Sort By</label>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortKey)}
            className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-1.5"
          >
            <option value="rating">Highest Rated</option>
            <option value="priceMin">Lowest Price</option>
            <option value="priceMax">Highest Price</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Max Budget: ${maxPrice}</label>
          <input type="range" min={25} max={500} step={25} value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} className="w-32 accent-emerald-500" />
        </div>
      </div>

      {/* Box Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredBoxes.map(box => (
          <button
            key={box.id}
            onClick={() => setSelectedBox(selectedBox === box.id ? null : box.id)}
            className={`text-left p-5 rounded-xl border transition-all ${
              selectedBox === box.id
                ? 'bg-emerald-950/40 border-emerald-600/60 ring-1 ring-emerald-500/30'
                : 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600/70'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-white">{box.name}</h3>
              <div className="flex items-center gap-1">
                <span className="text-amber-400 text-sm">{'★'.repeat(Math.round(box.rating))}</span>
                <span className="text-gray-400 text-xs">{box.rating}</span>
              </div>
            </div>
            <p className="text-emerald-400 font-semibold text-sm mb-1">{box.priceRange}</p>
            <p className="text-gray-400 text-xs mb-2">{box.frequency} &middot; EV: {box.avgEV}</p>
            <div className="flex flex-wrap gap-1">
              {box.sports.map(s => (
                <span key={s} className="text-[10px] bg-gray-900/60 text-gray-400 px-2 py-0.5 rounded">{s}</span>
              ))}
            </div>
            <p className="text-gray-500 text-xs mt-2">{box.bestFor}</p>
          </button>
        ))}
      </div>

      {/* Box Detail */}
      {activeBox && (
        <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">{activeBox.name}</h2>
            <p className="text-gray-400 text-sm">{activeBox.url} &middot; {activeBox.frequency}</p>
          </div>

          {/* Tiers */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Available Tiers</h3>
            <div className="space-y-2">
              {activeBox.tiers.map((tier, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-900/50 border border-gray-700/30 rounded-lg p-3">
                  <div>
                    <p className="text-white text-sm font-medium">{tier.name}</p>
                    <p className="text-gray-500 text-xs">{tier.description}</p>
                  </div>
                  <span className="text-emerald-400 font-semibold">${tier.price}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pros & Cons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-emerald-400 mb-2">Pros</h3>
              <ul className="space-y-1">
                {activeBox.pros.map((p, i) => (
                  <li key={i} className="text-gray-300 text-xs flex items-start gap-1.5">
                    <span className="text-emerald-400 mt-0.5">+</span>{p}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-red-400 mb-2">Cons</h3>
              <ul className="space-y-1">
                {activeBox.cons.map((c, i) => (
                  <li key={i} className="text-gray-300 text-xs flex items-start gap-1.5">
                    <span className="text-red-400 mt-0.5">-</span>{c}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-900/50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Expected Value</p>
              <p className="text-white font-semibold text-sm">{activeBox.avgEV}</p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Hit Rate</p>
              <p className="text-white font-semibold text-sm">{activeBox.hitRate}</p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Guarantee</p>
              <p className="text-white font-semibold text-sm">{activeBox.guarantee}</p>
            </div>
          </div>
        </div>
      )}

      {/* Buying Tips */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-3">Subscription Box Tips</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { title: 'EV Is Usually Negative', tip: 'Most subscription boxes cost more than the expected value of the cards inside. You are paying for convenience, curation, and the unboxing experience — not guaranteed profit.' },
            { title: 'Higher Tiers = Better EV', tip: 'The cheapest tiers have the worst value. If you subscribe, go for mid-range or higher where products are hobby-grade and hits are guaranteed.' },
            { title: 'Compare to Buying Direct', tip: 'Before subscribing, check if you could buy the same products cheaper from your local card shop or online retailer. Subscription markup is typically 10-25%.' },
            { title: 'Great for Content', tip: 'Subscription boxes are ideal for YouTube/TikTok content. The surprise element and variety make great unboxing videos. Factor in content value when evaluating cost.' },
          ].map((item, i) => (
            <div key={i} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
              <h3 className="font-semibold text-white text-sm mb-1">{item.title}</h3>
              <p className="text-gray-400 text-xs leading-relaxed">{item.tip}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Related Tools */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { href: '/tools/sealed-ev', label: 'Sealed Product EV' },
            { href: '/tools/wax-vs-singles', label: 'Wax vs Singles' },
            { href: '/tools/box-break', label: 'Box Break Calculator' },
            { href: '/tools/pack-sim', label: 'Pack Simulator' },
            { href: '/tools/budget-planner', label: 'Hobby Budget Planner' },
          ].map(link => (
            <Link key={link.href} href={link.href} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 rounded-lg text-xs font-medium transition-colors">
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
