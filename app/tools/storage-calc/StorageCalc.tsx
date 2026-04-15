'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

/* ───── Supply item definitions ───── */
interface SupplyItem {
  id: string;
  name: string;
  description: string;
  unitPrice: number; // per unit in dollars
  bulkPrice: number; // per unit in bulk (100+)
  bulkQty: number; // what counts as "bulk"
  category: 'protection' | 'storage' | 'display' | 'shipping';
  forTypes: ('raw' | 'graded' | 'vintage' | 'sealed')[];
  perCard: number; // how many of this supply per card (1 penny sleeve per card, 1 top loader per card, etc.)
  tip: string;
}

const supplies: SupplyItem[] = [
  // Protection
  {
    id: 'penny-sleeves',
    name: 'Penny Sleeves',
    description: 'Standard soft inner sleeves. Every raw card needs one.',
    unitPrice: 0.02,
    bulkPrice: 0.01,
    bulkQty: 100,
    category: 'protection',
    forTypes: ['raw', 'vintage'],
    perCard: 1,
    tip: 'Ultra Pro or BCW penny sleeves are the standard. Always sleeve BEFORE top loading.',
  },
  {
    id: 'top-loaders',
    name: 'Top Loaders (3x4 Standard)',
    description: 'Rigid plastic holders for your best cards. 35pt for standard thickness.',
    unitPrice: 0.15,
    bulkPrice: 0.08,
    bulkQty: 100,
    category: 'protection',
    forTypes: ['raw'],
    perCard: 1,
    tip: '35pt top loaders fit standard cards. Thicker cards (jerseys, patches) need 55pt-180pt.',
  },
  {
    id: 'semi-rigids',
    name: 'Card Savers (Semi-Rigid)',
    description: 'Required for PSA/CGC grading submissions. Flexible but protective.',
    unitPrice: 0.12,
    bulkPrice: 0.06,
    bulkQty: 100,
    category: 'protection',
    forTypes: ['raw'],
    perCard: 1,
    tip: 'Card Saver 1 is the standard for grading submissions. Never send cards to PSA in top loaders.',
  },
  {
    id: 'one-touch',
    name: 'One-Touch Magnetic Cases',
    description: 'Premium magnetic cases for high-value raw cards. Screw-free.',
    unitPrice: 3.50,
    bulkPrice: 2.50,
    bulkQty: 25,
    category: 'protection',
    forTypes: ['raw'],
    perCard: 1,
    tip: 'Use for cards worth $50+. The magnetic closure makes them easy to open without damaging the card. 35pt for standard cards.',
  },
  {
    id: 'team-bags',
    name: 'Resealable Team Bags',
    description: 'Outer bags for top loaders and one-touches. Dust and moisture protection.',
    unitPrice: 0.03,
    bulkPrice: 0.02,
    bulkQty: 100,
    category: 'protection',
    forTypes: ['raw', 'graded'],
    perCard: 1,
    tip: 'Put every top loader or one-touch inside a team bag. Prevents scratching during storage.',
  },
  // Storage
  {
    id: 'binder-pages',
    name: '9-Pocket Binder Pages',
    description: 'Standard binder pages. Each holds 9 cards (18 front and back).',
    unitPrice: 0.35,
    bulkPrice: 0.20,
    bulkQty: 100,
    category: 'storage',
    forTypes: ['raw'],
    perCard: 1/9, // 9 cards per page
    tip: 'Ultra Pro Platinum series are acid-free and archival quality. Never use PVC pages — they damage cards over time.',
  },
  {
    id: 'binder-3ring',
    name: '3-Ring Card Binder (D-Ring)',
    description: 'Standard 3-inch D-ring binder. Holds ~50 pages (450 cards).',
    unitPrice: 12.00,
    bulkPrice: 9.00,
    bulkQty: 5,
    category: 'storage',
    forTypes: ['raw'],
    perCard: 1/450,
    tip: 'D-ring binders are better than O-ring — they don\'t warp pages. Store binders upright like books.',
  },
  {
    id: 'cardboard-box-200',
    name: '200-Count Storage Box',
    description: 'Small cardboard box for top-loaded cards. Fits ~50 top-loaded cards.',
    unitPrice: 1.50,
    bulkPrice: 1.00,
    bulkQty: 25,
    category: 'storage',
    forTypes: ['raw'],
    perCard: 1/50,
    tip: 'Great for organizing by set or player. Label the outside for easy retrieval.',
  },
  {
    id: 'cardboard-box-800',
    name: '800-Count Storage Box',
    description: 'Standard hobby box. Fits ~800 raw cards or ~200 top-loaded.',
    unitPrice: 3.00,
    bulkPrice: 2.00,
    bulkQty: 10,
    category: 'storage',
    forTypes: ['raw'],
    perCard: 1/200, // top-loaded
    tip: 'The workhorse of card storage. Stack up to 4 high. Keep off the floor to prevent moisture damage.',
  },
  {
    id: 'graded-box',
    name: 'Graded Card Storage Box',
    description: 'Holds ~25-30 graded slabs. Foam-lined for protection.',
    unitPrice: 8.00,
    bulkPrice: 6.00,
    bulkQty: 5,
    category: 'storage',
    forTypes: ['graded'],
    perCard: 1/25,
    tip: 'Store graded cards standing up (like books) to prevent warping. Never stack slabs flat — the weight can crack lower cases.',
  },
  // Display
  {
    id: 'card-stand',
    name: 'Acrylic Card Stand',
    description: 'Desktop display stand for graded slabs or one-touch cases.',
    unitPrice: 4.00,
    bulkPrice: 3.00,
    bulkQty: 10,
    category: 'display',
    forTypes: ['graded', 'raw'],
    perCard: 1,
    tip: 'Keep displayed cards out of direct sunlight — UV exposure fades card surfaces and yellows cases.',
  },
  {
    id: 'wall-frame',
    name: 'Card Wall Frame',
    description: 'UV-protected wall frame for showcasing graded cards.',
    unitPrice: 15.00,
    bulkPrice: 12.00,
    bulkQty: 5,
    category: 'display',
    forTypes: ['graded'],
    perCard: 1,
    tip: 'Look for frames with UV-filtering acrylic. Museum-grade glass blocks 99% of UV rays.',
  },
  // Shipping
  {
    id: 'bubble-mailer',
    name: 'Bubble Mailer (#000)',
    description: '4x8 padded mailer for shipping 1-3 cards in top loaders.',
    unitPrice: 0.50,
    bulkPrice: 0.25,
    bulkQty: 50,
    category: 'shipping',
    forTypes: ['raw'],
    perCard: 1/2, // typically 2 cards per mailer
    tip: 'Tape the top loader to cardboard inside the mailer so it can\'t move. "Non-machinable" stamp prevents bending.',
  },
  {
    id: 'shipping-box',
    name: 'Small Shipping Box (6x4x2)',
    description: 'For graded cards, one-touches, or multi-card shipments.',
    unitPrice: 1.00,
    bulkPrice: 0.60,
    bulkQty: 25,
    category: 'shipping',
    forTypes: ['graded', 'raw'],
    perCard: 1/4,
    tip: 'Wrap graded slabs in bubble wrap inside the box. Fill empty space so nothing moves.',
  },
  {
    id: 'painters-tape',
    name: 'Blue Painter\'s Tape',
    description: 'Secure top loaders to backing without residue. Never use Scotch tape on cards.',
    unitPrice: 0.01,
    bulkPrice: 0.005,
    bulkQty: 100,
    category: 'shipping',
    forTypes: ['raw'],
    perCard: 1,
    tip: 'Always tape the opening of the top loader shut to prevent the card from sliding out during shipping.',
  },
];

/* ───── Collection input ───── */
interface CollectionInput {
  rawValueCards: number;   // raw cards worth protecting (top loader)
  rawBulkCards: number;    // raw cards for binder storage
  gradedCards: number;     // graded slabs
  vintageCards: number;    // vintage cards needing extra care
  displayCards: number;    // cards to display
  gradingSubmission: number; // cards planned for grading
  shippingPerMonth: number;  // cards shipped per month
}

const defaultCollection: CollectionInput = {
  rawValueCards: 50,
  rawBulkCards: 500,
  gradedCards: 10,
  vintageCards: 0,
  displayCards: 5,
  gradingSubmission: 0,
  shippingPerMonth: 0,
};

const categoryLabels: Record<string, { label: string; color: string; icon: string }> = {
  protection: { label: 'Card Protection', color: 'text-blue-400', icon: '🛡' },
  storage: { label: 'Storage Solutions', color: 'text-emerald-400', icon: '📦' },
  display: { label: 'Display & Showcase', color: 'text-purple-400', icon: '🖼' },
  shipping: { label: 'Shipping Supplies', color: 'text-amber-400', icon: '📬' },
};

export default function StorageCalc() {
  const [collection, setCollection] = useState<CollectionInput>(defaultCollection);

  const results = useMemo(() => {
    const items: { supply: SupplyItem; quantity: number; cost: number; isBulk: boolean }[] = [];

    // Calculate needs based on collection
    const needs: Record<string, number> = {};

    // Raw value cards need: penny sleeve + top loader + team bag
    if (collection.rawValueCards > 0) {
      needs['penny-sleeves'] = (needs['penny-sleeves'] || 0) + collection.rawValueCards;
      needs['top-loaders'] = (needs['top-loaders'] || 0) + collection.rawValueCards;
      needs['team-bags'] = (needs['team-bags'] || 0) + collection.rawValueCards;
      needs['cardboard-box-200'] = Math.ceil(collection.rawValueCards / 50);
    }

    // Raw bulk cards need: penny sleeve + binder page + binder
    if (collection.rawBulkCards > 0) {
      needs['penny-sleeves'] = (needs['penny-sleeves'] || 0) + collection.rawBulkCards;
      needs['binder-pages'] = Math.ceil(collection.rawBulkCards / 9);
      needs['binder-3ring'] = Math.ceil(collection.rawBulkCards / 450);
    }

    // Graded cards need: team bag + graded box
    if (collection.gradedCards > 0) {
      needs['team-bags'] = (needs['team-bags'] || 0) + collection.gradedCards;
      needs['graded-box'] = Math.ceil(collection.gradedCards / 25);
    }

    // Vintage cards need: penny sleeve + top loader + team bag (extra care)
    if (collection.vintageCards > 0) {
      needs['penny-sleeves'] = (needs['penny-sleeves'] || 0) + collection.vintageCards;
      needs['top-loaders'] = (needs['top-loaders'] || 0) + collection.vintageCards;
      needs['team-bags'] = (needs['team-bags'] || 0) + collection.vintageCards;
    }

    // Display cards need: card stand or wall frame
    if (collection.displayCards > 0) {
      needs['card-stand'] = collection.displayCards;
    }

    // High-value raw cards get one-touch upgrade recommendation
    if (collection.rawValueCards >= 10) {
      needs['one-touch'] = Math.min(Math.ceil(collection.rawValueCards * 0.2), 20); // top 20% get one-touches
    }

    // Grading submission cards need: semi-rigids
    if (collection.gradingSubmission > 0) {
      needs['semi-rigids'] = collection.gradingSubmission;
      needs['penny-sleeves'] = (needs['penny-sleeves'] || 0) + collection.gradingSubmission;
    }

    // Shipping supplies
    if (collection.shippingPerMonth > 0) {
      needs['bubble-mailer'] = Math.ceil(collection.shippingPerMonth / 2);
      needs['painters-tape'] = collection.shippingPerMonth;
      if (collection.gradedCards > 0) {
        needs['shipping-box'] = Math.ceil(collection.shippingPerMonth * 0.3); // assume 30% are graded shipments
      }
    }

    // Build results
    for (const supply of supplies) {
      const qty = needs[supply.id];
      if (qty && qty > 0) {
        const roundedQty = Math.ceil(qty);
        const isBulk = roundedQty >= supply.bulkQty;
        const price = isBulk ? supply.bulkPrice : supply.unitPrice;
        items.push({
          supply,
          quantity: roundedQty,
          cost: roundedQty * price,
          isBulk,
        });
      }
    }

    return items;
  }, [collection]);

  const totalCost = results.reduce((sum, r) => sum + r.cost, 0);
  const totalItems = results.reduce((sum, r) => sum + r.quantity, 0);

  const resultsByCategory = useMemo(() => {
    const grouped: Record<string, typeof results> = {};
    for (const r of results) {
      const cat = r.supply.category;
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(r);
    }
    return grouped;
  }, [results]);

  const updateField = (field: keyof CollectionInput, value: number) => {
    setCollection(prev => ({ ...prev, [field]: Math.max(0, value) }));
  };

  return (
    <div className="space-y-8">
      {/* Collection Input */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-1">Your Collection</h3>
        <p className="text-gray-500 text-sm mb-6">Enter how many cards you have in each category. We&apos;ll calculate exactly what supplies you need.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { field: 'rawValueCards' as const, label: 'Raw Value Cards', sub: 'Cards worth $5+ you want in top loaders', icon: '💎' },
            { field: 'rawBulkCards' as const, label: 'Raw Bulk Cards', sub: 'Commons/base for binder storage', icon: '📚' },
            { field: 'gradedCards' as const, label: 'Graded Slabs', sub: 'PSA, BGS, CGC, SGC slabs', icon: '🏅' },
            { field: 'vintageCards' as const, label: 'Vintage Cards', sub: 'Pre-1980 cards needing extra care', icon: '🏛' },
            { field: 'displayCards' as const, label: 'Cards to Display', sub: 'Cards you want on a stand or wall', icon: '🖼' },
            { field: 'gradingSubmission' as const, label: 'Grading Submissions', sub: 'Cards you plan to send for grading', icon: '📋' },
            { field: 'shippingPerMonth' as const, label: 'Cards Shipped/Month', sub: 'How many cards you sell/trade monthly', icon: '📬' },
          ].map(({ field, label, sub, icon }) => (
            <div key={field} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                <span className="mr-1.5">{icon}</span>{label}
              </label>
              <p className="text-xs text-gray-500 mb-2">{sub}</p>
              <input
                type="number"
                min="0"
                value={collection[field]}
                onChange={e => updateField(field, parseInt(e.target.value) || 0)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-lg font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          ))}
        </div>

        {/* Quick presets */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-xs text-gray-500 self-center mr-1">Quick setup:</span>
          {[
            { label: 'Beginner (100 cards)', config: { rawValueCards: 10, rawBulkCards: 90, gradedCards: 0, vintageCards: 0, displayCards: 2, gradingSubmission: 0, shippingPerMonth: 0 } },
            { label: 'Casual (500 cards)', config: { rawValueCards: 50, rawBulkCards: 400, gradedCards: 10, vintageCards: 5, displayCards: 5, gradingSubmission: 5, shippingPerMonth: 2 } },
            { label: 'Serious (2,000 cards)', config: { rawValueCards: 200, rawBulkCards: 1500, gradedCards: 50, vintageCards: 20, displayCards: 10, gradingSubmission: 20, shippingPerMonth: 10 } },
            { label: 'Dealer (5,000+)', config: { rawValueCards: 500, rawBulkCards: 4000, gradedCards: 200, vintageCards: 50, displayCards: 20, gradingSubmission: 50, shippingPerMonth: 50 } },
          ].map(preset => (
            <button
              key={preset.label}
              onClick={() => setCollection(preset.config)}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-xs text-gray-400 hover:text-white transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Summary */}
      {results.length > 0 && (
        <div className="bg-gradient-to-br from-blue-950/40 to-gray-900/60 border border-blue-800/30 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Your Supply List</h3>
              <p className="text-gray-400 text-sm">{results.length} supply types &middot; {totalItems.toLocaleString()} total items</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-400">${totalCost.toFixed(2)}</div>
              <div className="text-xs text-gray-500">Estimated total cost</div>
            </div>
          </div>

          {/* Cost per card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Per Value Card', value: collection.rawValueCards > 0 ? (totalCost / (collection.rawValueCards + collection.rawBulkCards + collection.gradedCards + collection.vintageCards || 1)).toFixed(2) : '—' },
              { label: 'Protection', value: `$${results.filter(r => r.supply.category === 'protection').reduce((s, r) => s + r.cost, 0).toFixed(2)}` },
              { label: 'Storage', value: `$${results.filter(r => r.supply.category === 'storage').reduce((s, r) => s + r.cost, 0).toFixed(2)}` },
              { label: 'Display + Ship', value: `$${results.filter(r => ['display', 'shipping'].includes(r.supply.category)).reduce((s, r) => s + r.cost, 0).toFixed(2)}` },
            ].map(stat => (
              <div key={stat.label} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-3 text-center">
                <div className="text-lg font-semibold text-white">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Supplies by category */}
          {Object.entries(resultsByCategory).map(([cat, items]) => {
            const catInfo = categoryLabels[cat];
            return (
              <div key={cat} className="mb-6 last:mb-0">
                <h4 className={`text-sm font-semibold ${catInfo.color} mb-3`}>
                  <span className="mr-1.5">{catInfo.icon}</span>{catInfo.label}
                </h4>
                <div className="space-y-2">
                  {items.map(item => (
                    <div key={item.supply.id} className="bg-gray-800/40 border border-gray-700/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium text-sm">{item.supply.name}</span>
                          {item.isBulk && (
                            <span className="text-[10px] bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 px-1.5 py-0.5 rounded-full">BULK PRICE</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{item.supply.description}</p>
                      </div>
                      <div className="flex items-center gap-4 sm:gap-6">
                        <div className="text-center">
                          <div className="text-lg font-mono font-semibold text-white">{item.quantity.toLocaleString()}</div>
                          <div className="text-[10px] text-gray-500">QTY</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-mono text-gray-400">${item.isBulk ? item.supply.bulkPrice.toFixed(2) : item.supply.unitPrice.toFixed(2)}/ea</div>
                          <div className="text-[10px] text-gray-500">PRICE</div>
                        </div>
                        <div className="text-center min-w-[60px]">
                          <div className="text-lg font-mono font-semibold text-blue-400">${item.cost.toFixed(2)}</div>
                          <div className="text-[10px] text-gray-500">TOTAL</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pro Tips */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Storage Pro Tips</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { title: 'Climate Control', tip: 'Store cards at 65-72F with 40-50% humidity. Avoid attics, garages, and basements. A climate-controlled closet is ideal.', icon: '🌡' },
            { title: 'UV Protection', tip: 'Keep cards out of direct sunlight. UV exposure fades card surfaces and yellows plastic holders. UV-filtered cases help for displayed cards.', icon: '☀' },
            { title: 'Never Use Rubber Bands', tip: 'Rubber bands leave permanent indentations on cards. Use dividers in storage boxes instead of banding cards together.', icon: '⚠' },
            { title: 'Sleeve Before Loading', tip: 'Always put a penny sleeve on the card FIRST, then insert into the top loader. Inserting an unsleeved card into a top loader scratches the surface.', icon: '📋' },
            { title: 'No PVC Pages', tip: 'Cheap binder pages contain PVC which causes cards to stick and deteriorate. Only use polypropylene or polyethylene pages (Ultra Pro Platinum).', icon: '🚫' },
            { title: 'Insurance Matters', tip: 'Collections over $5K should be insured separately from homeowner\'s insurance. Document everything with photos for claims.', icon: '🔒' },
          ].map(t => (
            <div key={t.title} className="bg-gray-800/40 border border-gray-700/30 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <span className="text-lg">{t.icon}</span>
                <div>
                  <div className="text-sm font-medium text-white">{t.title}</div>
                  <p className="text-xs text-gray-400 mt-1">{t.tip}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cross-links */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Related Tools</h3>
        <div className="flex flex-wrap gap-2">
          {[
            { href: '/tools/insurance-calc', label: 'Insurance Calculator', icon: '🛡' },
            { href: '/tools/shipping-calc', label: 'Shipping Calculator', icon: '📬' },
            { href: '/tools/condition-grader', label: 'Condition Self-Grader', icon: '🔬' },
            { href: '/tools/submission-planner', label: 'Grading Submission Planner', icon: '📋' },
            { href: '/tools/auth-check', label: 'Authentication Checker', icon: '🔐' },
            { href: '/tools/collection-value', label: 'Collection Value Calculator', icon: '💎' },
          ].map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-xs text-gray-400 hover:text-white transition-colors"
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}