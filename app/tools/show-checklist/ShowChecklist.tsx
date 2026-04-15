'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';

/* ───── Checklist Data ───── */
interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  priority: 'essential' | 'recommended' | 'optional';
  forMode: ('buying' | 'selling' | 'both')[];
}

const categories: { name: string; icon: string; items: ChecklistItem[] }[] = [
  {
    name: 'Card Protection & Supplies',
    icon: '🛡️',
    items: [
      { id: 'penny-sleeves', label: 'Penny Sleeves (100+ pack)', description: 'Sleeve every raw card before it goes in a toploader', priority: 'essential', forMode: ['buying', 'selling', 'both'] },
      { id: 'toploaders', label: 'Toploaders (50+ pack)', description: 'Standard 3x4 for purchased cards or sales inventory', priority: 'essential', forMode: ['buying', 'selling', 'both'] },
      { id: 'team-bags', label: 'Team Bags / Resealable Sleeves', description: 'Extra dust protection over toploaders', priority: 'recommended', forMode: ['buying', 'selling', 'both'] },
      { id: 'one-touch', label: 'One-Touch Magnetic Holders', description: 'For higher-value raw purchases ($50+)', priority: 'optional', forMode: ['buying', 'both'] },
      { id: 'card-savers', label: 'Card Saver I (Semi-Rigids)', description: 'Required for grading submissions — buy in bulk at shows', priority: 'recommended', forMode: ['buying', 'both'] },
      { id: 'rubber-bands', label: 'Rubber Bands / Card Dividers', description: 'Organize inventory by player, set, or price point', priority: 'recommended', forMode: ['selling', 'both'] },
    ],
  },
  {
    name: 'Display & Selling Supplies',
    icon: '📦',
    items: [
      { id: 'display-binder', label: 'Display Binder (9-pocket pages)', description: 'Showcase your best cards visually — draws buyers in', priority: 'essential', forMode: ['selling', 'both'] },
      { id: 'card-boxes', label: 'Card Storage Boxes (800ct or 3200ct)', description: 'Transport bulk inventory organized and protected', priority: 'essential', forMode: ['selling', 'both'] },
      { id: 'price-stickers', label: 'Price Stickers / Labels', description: 'Pre-price everything — saves time and prevents lowball offers', priority: 'recommended', forMode: ['selling', 'both'] },
      { id: 'table-cloth', label: 'Table Cloth / Felt Mat', description: 'Professional look for your table setup', priority: 'recommended', forMode: ['selling', 'both'] },
      { id: 'card-stands', label: 'Card Display Stands', description: 'Prop up your flagship cards for visibility', priority: 'optional', forMode: ['selling', 'both'] },
      { id: 'signage', label: 'Price Signs / Banner', description: '"All cards $5" or "Make an offer" signs draw traffic', priority: 'optional', forMode: ['selling', 'both'] },
    ],
  },
  {
    name: 'Tech & Tools',
    icon: '📱',
    items: [
      { id: 'phone-charger', label: 'Phone + Portable Charger', description: 'You will drain your battery checking prices on eBay', priority: 'essential', forMode: ['buying', 'selling', 'both'] },
      { id: 'price-app', label: 'Price Checking App (eBay/CardVault)', description: 'Check sold comps before buying — never overpay', priority: 'essential', forMode: ['buying', 'both'] },
      { id: 'payment-app', label: 'Payment Apps (PayPal, Venmo, Zelle, Cash App)', description: 'Most deals happen electronically now — have all 4 ready', priority: 'essential', forMode: ['buying', 'selling', 'both'] },
      { id: 'square-reader', label: 'Card Reader (Square/Stripe)', description: 'Accept credit cards if you sell volume', priority: 'recommended', forMode: ['selling', 'both'] },
      { id: 'loupe', label: 'Jeweler Loupe (10x or 30x)', description: 'Inspect surface condition before buying raw cards', priority: 'recommended', forMode: ['buying', 'both'] },
      { id: 'flashlight', label: 'Small LED Flashlight / UV Light', description: 'Check for surface scratches and altered cards', priority: 'optional', forMode: ['buying', 'both'] },
    ],
  },
  {
    name: 'Cash & Payment',
    icon: '💰',
    items: [
      { id: 'cash', label: 'Cash — Mostly Small Bills', description: 'Many dealers prefer cash and give cash discounts (5-10%)', priority: 'essential', forMode: ['buying', 'both'] },
      { id: 'cash-breakdown', label: '$1s and $5s for Making Change', description: 'If selling — have $100+ in change ready', priority: 'essential', forMode: ['selling', 'both'] },
      { id: 'cash-box', label: 'Cash Box or Fanny Pack', description: 'Keep money secure — card shows are crowded', priority: 'recommended', forMode: ['selling', 'both'] },
      { id: 'budget-list', label: 'Written Budget / Want List', description: 'Set a spending limit BEFORE you walk in — stick to it', priority: 'recommended', forMode: ['buying', 'both'] },
    ],
  },
  {
    name: 'Personal Comfort',
    icon: '🎒',
    items: [
      { id: 'backpack', label: 'Backpack or Messenger Bag', description: 'Carry purchases hands-free — leave display inventory in your car until setup', priority: 'essential', forMode: ['buying', 'selling', 'both'] },
      { id: 'water-snacks', label: 'Water Bottle & Snacks', description: 'Card shows run 4-8 hours — concession prices are brutal', priority: 'recommended', forMode: ['buying', 'selling', 'both'] },
      { id: 'comfortable-shoes', label: 'Comfortable Shoes', description: 'You will walk miles on concrete floors', priority: 'recommended', forMode: ['buying', 'selling', 'both'] },
      { id: 'hand-sanitizer', label: 'Hand Sanitizer', description: 'Keep hands clean before handling raw cards', priority: 'optional', forMode: ['buying', 'selling', 'both'] },
      { id: 'business-cards', label: 'Business Cards / Social Handle', description: 'Network with dealers and other collectors for future deals', priority: 'optional', forMode: ['selling', 'both'] },
    ],
  },
  {
    name: 'Pre-Show Prep',
    icon: '📋',
    items: [
      { id: 'want-list', label: 'Written Want List with Target Prices', description: 'Know exactly what you want and what you will pay — prevents impulse buys', priority: 'essential', forMode: ['buying', 'both'] },
      { id: 'sell-list', label: 'Inventory Spreadsheet with Prices', description: 'Know your cost basis and minimum sell price for every card', priority: 'essential', forMode: ['selling', 'both'] },
      { id: 'research-prices', label: 'Research Current eBay Sold Comps', description: 'eBay 130-point auctions are the floor price — dont pay more at a show', priority: 'recommended', forMode: ['buying', 'both'] },
      { id: 'arrive-early', label: 'Plan to Arrive Early', description: 'Best deals happen in the first hour — the "early bird" window is worth the fee', priority: 'recommended', forMode: ['buying', 'both'] },
      { id: 'charge-devices', label: 'Charge All Devices Night Before', description: 'Phone, portable charger, Square reader — everything charged to 100%', priority: 'recommended', forMode: ['buying', 'selling', 'both'] },
    ],
  },
];

const priorityColors = {
  essential: { bg: 'bg-red-950/40', border: 'border-red-800/50', text: 'text-red-400', label: 'Essential' },
  recommended: { bg: 'bg-yellow-950/40', border: 'border-yellow-800/50', text: 'text-yellow-400', label: 'Recommended' },
  optional: { bg: 'bg-blue-950/40', border: 'border-blue-800/50', text: 'text-blue-400', label: 'Nice to Have' },
};

export default function ShowChecklist() {
  const [mode, setMode] = useState<'buying' | 'selling' | 'both'>('both');
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [showCompleted, setShowCompleted] = useState(true);

  const toggleItem = useCallback((id: string) => {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const filteredCategories = categories.map(cat => ({
    ...cat,
    items: cat.items.filter(item => item.forMode.includes(mode) || item.forMode.includes('both')),
  })).filter(cat => cat.items.length > 0);

  const totalItems = filteredCategories.reduce((sum, cat) => sum + cat.items.length, 0);
  const checkedCount = filteredCategories.reduce((sum, cat) => sum + cat.items.filter(i => checked.has(i.id)).length, 0);
  const progressPct = totalItems > 0 ? (checkedCount / totalItems) * 100 : 0;

  const essentialItems = filteredCategories.flatMap(c => c.items).filter(i => i.priority === 'essential');
  const essentialChecked = essentialItems.filter(i => checked.has(i.id)).length;
  const allEssentialDone = essentialChecked === essentialItems.length;

  return (
    <div className="space-y-8">
      {/* Mode Selector */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">What Are You Doing at the Show?</h2>
        <div className="grid grid-cols-3 gap-3">
          {([
            { key: 'buying', label: 'Buying Cards', icon: '🛒', desc: 'Checklist for buyers' },
            { key: 'selling', label: 'Selling Cards', icon: '💰', desc: 'Checklist for sellers' },
            { key: 'both', label: 'Buying & Selling', icon: '🔄', desc: 'Complete checklist' },
          ] as const).map(m => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={`p-4 rounded-xl border text-center transition-all ${
                mode === m.key
                  ? 'bg-emerald-600/20 border-emerald-500 ring-1 ring-emerald-500/20'
                  : 'bg-gray-800 border-gray-600 hover:border-gray-500'
              }`}
            >
              <div className="text-2xl mb-1">{m.icon}</div>
              <div className={`text-sm font-medium ${mode === m.key ? 'text-emerald-400' : 'text-gray-300'}`}>{m.label}</div>
              <div className="text-[10px] text-gray-500 mt-0.5">{m.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-400">
            <span className="text-white font-bold">{checkedCount}</span> of <span className="text-white font-bold">{totalItems}</span> items packed
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              allEssentialDone ? 'bg-emerald-950/60 text-emerald-400' : 'bg-red-950/60 text-red-400'
            }`}>
              {allEssentialDone ? 'All essentials packed' : `${essentialItems.length - essentialChecked} essentials remaining`}
            </span>
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showCompleted ? 'Hide checked' : 'Show checked'}
            </button>
          </div>
        </div>
        <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${progressPct === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Checklist */}
      <div className="space-y-6">
        {filteredCategories.map(cat => {
          const visibleItems = showCompleted ? cat.items : cat.items.filter(i => !checked.has(i.id));
          if (visibleItems.length === 0) return null;
          const catChecked = cat.items.filter(i => checked.has(i.id)).length;
          return (
            <div key={cat.name} className="bg-gray-800/50 border border-gray-700/50 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700/50">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{cat.icon}</span>
                  <h3 className="font-semibold text-white">{cat.name}</h3>
                </div>
                <span className="text-xs text-gray-500">{catChecked}/{cat.items.length}</span>
              </div>
              <div className="divide-y divide-gray-700/30">
                {visibleItems.map(item => {
                  const p = priorityColors[item.priority];
                  const isDone = checked.has(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className={`w-full flex items-start gap-3 px-5 py-3.5 text-left transition-all hover:bg-gray-700/20 ${isDone ? 'opacity-60' : ''}`}
                    >
                      <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                        isDone ? 'bg-emerald-600 border-emerald-500' : 'border-gray-600'
                      }`}>
                        {isDone && <span className="text-white text-xs">✓</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${isDone ? 'line-through text-gray-500' : 'text-white'}`}>{item.label}</span>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${p.bg} ${p.border} ${p.text} border`}>{p.label}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pro Tips */}
      <section className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Card Show Pro Tips</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { tip: 'Make a lap first', detail: 'Walk the entire show once before buying anything. Compare prices across dealers — the same card can vary 30-50% between tables.' },
            { tip: 'Cash is king', detail: 'Dealers give 5-10% cash discounts because they avoid payment processing fees. Ask "what is the cash price?" on every deal.' },
            { tip: 'Buy at the end', detail: 'Last 1-2 hours of the show, dealers want to avoid packing inventory. Offer 10-20% below asking — many will deal.' },
            { tip: 'Bring your own supplies', detail: 'Penny sleeves and toploaders at shows cost 2-3x retail. Bring your own to protect purchases immediately.' },
            { tip: 'Network with dealers', detail: 'Give your phone number to dealers who have what you collect. They will text you deals before the next show.' },
            { tip: 'Check condition carefully', detail: 'Card show lighting is often poor. Use your loupe and flashlight to inspect corners, edges, and surface before buying raw.' },
          ].map(t => (
            <div key={t.tip} className="bg-gray-900/50 rounded-xl p-4">
              <div className="text-sm font-semibold text-emerald-400 mb-1">{t.tip}</div>
              <p className="text-xs text-gray-400 leading-relaxed">{t.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Related Tools */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Related Tools</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/tools/show-finder', label: 'Card Show Finder', icon: '📍' },
            { href: '/tools/selling-platforms', label: 'Selling Platforms', icon: '🏪' },
            { href: '/tools/condition-grader', label: 'Condition Self-Grader', icon: '🔬' },
            { href: '/tools/holder-guide', label: 'Holder Size Guide', icon: '📏' },
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
