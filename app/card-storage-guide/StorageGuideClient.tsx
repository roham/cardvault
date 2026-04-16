'use client';

import { useState, useMemo } from 'react';

/* ── types ───────────────────────────────────────────────────────── */

type Category = 'sleeves' | 'holders' | 'binders' | 'boxes' | 'display' | 'climate';

interface Product {
  name: string;
  category: Category;
  priceRange: string;
  priceLow: number;       // $ per unit (lowest)
  priceHigh: number;      // $ per unit (highest)
  bestFor: string;
  description: string;
  valueThreshold?: string; // when to use this product
  tier: 'budget' | 'standard' | 'premium';
  proTip?: string;
}

const CATEGORIES: { value: Category | 'all'; label: string; icon: string; color: string }[] = [
  { value: 'all', label: 'All Products', icon: '📦', color: 'text-white' },
  { value: 'sleeves', label: 'Sleeves', icon: '🧤', color: 'text-blue-400' },
  { value: 'holders', label: 'Holders & Cases', icon: '🔒', color: 'text-amber-400' },
  { value: 'binders', label: 'Binders & Pages', icon: '📒', color: 'text-green-400' },
  { value: 'boxes', label: 'Storage Boxes', icon: '📦', color: 'text-purple-400' },
  { value: 'display', label: 'Display', icon: '🖼️', color: 'text-pink-400' },
  { value: 'climate', label: 'Climate Control', icon: '🌡️', color: 'text-cyan-400' },
];

const CAT_COLORS: Record<Category, string> = {
  sleeves: 'border-blue-800/40 bg-blue-950/20',
  holders: 'border-amber-800/40 bg-amber-950/20',
  binders: 'border-green-800/40 bg-green-950/20',
  boxes: 'border-purple-800/40 bg-purple-950/20',
  display: 'border-pink-800/40 bg-pink-950/20',
  climate: 'border-cyan-800/40 bg-cyan-950/20',
};

const CAT_BADGE: Record<Category, string> = {
  sleeves: 'bg-blue-900/50 text-blue-400',
  holders: 'bg-amber-900/50 text-amber-400',
  binders: 'bg-green-900/50 text-green-400',
  boxes: 'bg-purple-900/50 text-purple-400',
  display: 'bg-pink-900/50 text-pink-400',
  climate: 'bg-cyan-900/50 text-cyan-400',
};

const TIER_BADGE: Record<string, string> = {
  budget: 'bg-green-900/50 text-green-400',
  standard: 'bg-blue-900/50 text-blue-400',
  premium: 'bg-amber-900/50 text-amber-400',
};

/* ── data ────────────────────────────────────────────────────────── */

const PRODUCTS: Product[] = [
  // SLEEVES (7)
  { name: 'Penny Sleeves', category: 'sleeves', priceRange: '$1-$3 per 100', priceLow: 0.01, priceHigh: 0.03, bestFor: 'Every card in your collection', description: 'Soft, clear plastic sleeves that are the first line of defense. Every card should be in a penny sleeve before going into any other holder. Acid-free and archival-safe.', tier: 'budget', proTip: 'Buy in bulk (1,000+) to get the best per-sleeve price. Ultra Pro and BCW are the industry standards.' },
  { name: 'Perfect Fit Sleeves', category: 'sleeves', priceRange: '$3-$5 per 100', priceLow: 0.03, priceHigh: 0.05, bestFor: 'Cards going into top loaders or one-touch cases', description: 'Slightly snugger than penny sleeves with a perfect fit around standard cards. Reduces movement inside top loaders and provides better dust protection.', tier: 'standard', proTip: 'Use these for any card worth $20+ that you want extra protection on.' },
  { name: 'Thick Penny Sleeves (130pt)', category: 'sleeves', priceRange: '$2-$4 per 100', priceLow: 0.02, priceHigh: 0.04, bestFor: 'Relic cards, patch cards, thick inserts', description: 'Wider sleeves designed for thick cards like memorabilia/relic cards, booklets, and thick inserts. Standard sleeves will crinkle or not fit.', tier: 'budget', valueThreshold: 'Any thick card (jersey, patch, relic)' },
  { name: 'Team Bags', category: 'sleeves', priceRange: '$3-$6 per 100', priceLow: 0.03, priceHigh: 0.06, bestFor: 'Graded slabs, top-loaded cards, small stacks', description: 'Resealable bags that fit a top-loaded or graded card. The resealable strip keeps dust out. Essential for protecting top loaders during shipping.', tier: 'budget', proTip: 'Always use team bags when shipping cards — they prevent the top loader from sliding out and protect against moisture.' },
  { name: 'Graded Card Sleeves', category: 'sleeves', priceRange: '$4-$8 per 50', priceLow: 0.08, priceHigh: 0.16, bestFor: 'PSA, BGS, CGC, SGC slabs', description: 'Fitted plastic sleeves specifically sized for graded card slabs. Protect the slab from scratches, dust, and fingerprints without hiding the card or label.', tier: 'standard', proTip: 'Different sizes for PSA, BGS, and CGC slabs — make sure you buy the right fit.' },
  { name: 'Resealable Penny Sleeves', category: 'sleeves', priceRange: '$3-$5 per 100', priceLow: 0.03, priceHigh: 0.05, bestFor: 'Cards you access frequently', description: 'Penny sleeves with a resealable flap. Provides better dust and moisture protection than open-top sleeves. Great for trade binders.', tier: 'standard' },
  { name: 'Semi-Rigid Card Holders', category: 'sleeves', priceRange: '$5-$10 per 50', priceLow: 0.10, priceHigh: 0.20, bestFor: 'Grading submissions, shipping valuable cards', description: 'Thin, semi-rigid plastic holders that protect cards during shipping and grading submissions. Most grading companies prefer cards submitted in semi-rigid holders.', tier: 'standard', proTip: 'PSA and BGS specifically recommend semi-rigid holders (Card Savers) for submissions. Required for many service levels.' },

  // HOLDERS & CASES (8)
  { name: 'Standard Top Loaders (35pt)', category: 'holders', priceRange: '$5-$10 per 25', priceLow: 0.20, priceHigh: 0.40, bestFor: 'Cards worth $5-$50', description: 'Rigid plastic holders that protect cards from bending, surface damage, and handling. The workhorse of card protection. Always put a penny sleeve on first.', tier: 'budget', valueThreshold: '$5+ cards', proTip: 'Never put a card directly into a top loader without a penny sleeve — it can cause scratching.' },
  { name: 'Thick Top Loaders (75-130pt)', category: 'holders', priceRange: '$6-$12 per 25', priceLow: 0.24, priceHigh: 0.48, bestFor: 'Jersey cards, patch cards, thick inserts', description: 'Thicker top loaders for memorabilia cards and thick inserts that don\'t fit standard 35pt holders. Available in 75pt, 100pt, and 130pt thicknesses.', tier: 'standard', valueThreshold: 'Thick cards worth $5+' },
  { name: 'One-Touch Magnetic Cases', category: 'holders', priceRange: '$3-$8 each', priceLow: 3.00, priceHigh: 8.00, bestFor: 'Cards worth $50-$500', description: 'Premium magnetic snap cases with UV protection. One-touch opening makes it easy to insert and remove cards. The gold standard for displaying ungraded valuable cards.', tier: 'premium', valueThreshold: '$50+ cards', proTip: 'One-touch cases with UV protection prevent fading from light exposure — essential for display cards.' },
  { name: 'Screw-Down Cases', category: 'holders', priceRange: '$2-$5 each', priceLow: 2.00, priceHigh: 5.00, bestFor: 'Long-term display of valuable cards', description: 'Four-screw recessed holders that completely seal the card. More secure than top loaders but harder to access. Good for permanent display or long-term storage.', tier: 'standard', proTip: 'Don\'t overtighten screws — excessive pressure can damage card edges over time.' },
  { name: 'Card Stands / Easels', category: 'holders', priceRange: '$1-$3 each', priceLow: 1.00, priceHigh: 3.00, bestFor: 'Desk display of graded slabs or one-touch cases', description: 'Small acrylic or plastic stands that prop up a graded slab or one-touch case at an angle for display. Simple and effective for desk or shelf showcasing.', tier: 'budget' },
  { name: 'Snap Cases', category: 'holders', priceRange: '$1-$3 each', priceLow: 1.00, priceHigh: 3.00, bestFor: 'Budget alternative to one-touch magnetics', description: 'Two-piece hinged cases that snap together around a card. Cheaper than one-touch magnetics but less premium feel. Good middle ground for $20-$50 cards.', tier: 'budget', valueThreshold: '$20-$50 cards' },
  { name: 'Booklet Card Holders', category: 'holders', priceRange: '$5-$15 each', priceLow: 5.00, priceHigh: 15.00, bestFor: 'Booklet cards, oversized inserts', description: 'Specialized holders for booklet cards that open like a book. Standard holders don\'t fit these larger formats. Essential for protecting valuable booklet autos and relics.', tier: 'premium', valueThreshold: 'Any booklet card' },
  { name: 'Currency Sleeves (for Tobacco Cards)', category: 'holders', priceRange: '$3-$6 per 100', priceLow: 0.03, priceHigh: 0.06, bestFor: 'Pre-war cards, tobacco cards (T206, etc.)', description: 'Smaller sleeves sized for tobacco-era cards (2.5" x 3.5" or smaller). Standard penny sleeves are too large for these vintage formats.', tier: 'standard', valueThreshold: 'Pre-war cards' },

  // BINDERS & PAGES (6)
  { name: '9-Pocket Binder Pages', category: 'binders', priceRange: '$5-$10 per 25', priceLow: 0.20, priceHigh: 0.40, bestFor: 'Set building, base card organization', description: 'Clear plastic sheets with 9 pockets that fit standard cards. Slide into 3-ring binders. The classic way to organize base sets, commons, and mid-value cards.', tier: 'budget', proTip: 'Use side-loading pages (opening on the side) to prevent cards from sliding out when binder is upright.' },
  { name: '4-Pocket Top Loader Pages', category: 'binders', priceRange: '$8-$15 per 20', priceLow: 0.40, priceHigh: 0.75, bestFor: 'Organizing top-loaded cards in binders', description: 'Binder pages with 4 pockets sized for top loaders. Display your best cards in top loaders organized in a binder format.', tier: 'standard' },
  { name: 'D-Ring Binder (3-inch)', category: 'binders', priceRange: '$8-$15 each', priceLow: 8.00, priceHigh: 15.00, bestFor: 'Set collecting, organized browsing', description: 'Standard 3-ring binder for holding 9-pocket pages. D-ring design lays pages flat. A 3-inch binder holds about 50 pages (450 cards). Use binders with no metal clips that could scratch.', tier: 'budget', proTip: 'Avoid O-ring binders — the ring gap catches and bends pages. D-ring binders lay completely flat.' },
  { name: 'Zippered Card Binder', category: 'binders', priceRange: '$15-$40 each', priceLow: 15.00, priceHigh: 40.00, bestFor: 'Travel, card shows, trade nights', description: 'Binders with zippered closure for taking cards on the go. Prevents pages from falling out during transport. Essential for card shows and trade meetups.', tier: 'premium', proTip: 'Get one with a handle or shoulder strap for card shows — your hands are full with purchases.' },
  { name: 'Mini Binder (4-pocket)', category: 'binders', priceRange: '$5-$10 each', priceLow: 5.00, priceHigh: 10.00, bestFor: 'Player collections, small sets, kids', description: 'Compact binders with built-in 4-pocket pages. Great for curating a small player collection or for younger collectors. Portable and easy to handle.', tier: 'budget' },
  { name: 'Slab Binder Pages', category: 'binders', priceRange: '$10-$20 per 10', priceLow: 1.00, priceHigh: 2.00, bestFor: 'Organizing graded card collections in binders', description: 'Special binder pages with pockets sized for PSA/BGS/CGC slabs. Typically 2 slabs per page. A clean way to organize and browse a graded collection.', tier: 'premium' },

  // STORAGE BOXES (7)
  { name: '200-Count Card Box', category: 'boxes', priceRange: '$1-$2 each', priceLow: 1.00, priceHigh: 2.00, bestFor: 'Small collections, singles by player or team', description: 'Small cardboard boxes that hold about 200 standard cards. Good for organizing cards by player, team, or set. Stack easily.', tier: 'budget' },
  { name: '800-Count Card Box', category: 'boxes', priceRange: '$2-$4 each', priceLow: 2.00, priceHigh: 4.00, bestFor: 'Mid-size collections, set organization', description: 'The most popular storage box size. Holds about 800 standard cards with dividers. Sturdy cardboard construction. Good balance of capacity and portability.', tier: 'budget', proTip: 'Use cardboard dividers to separate by sport, year, or set. Label the outside for quick identification.' },
  { name: '3,200-Count Monster Box', category: 'boxes', priceRange: '$5-$8 each', priceLow: 5.00, priceHigh: 8.00, bestFor: 'Large collections, bulk storage', description: 'Four-row box holding 3,200+ cards. The standard for serious collectors with large inventory. Has a lid and can stack. Heavy when full.', tier: 'budget', proTip: 'Don\'t overfill — leave room for cards to stand upright rather than tilting. Tilted cards can develop warping.' },
  { name: '5,000-Count Super Monster Box', category: 'boxes', priceRange: '$7-$12 each', priceLow: 7.00, priceHigh: 12.00, bestFor: 'Dealer inventory, massive collections', description: 'The largest standard card box — holds 5,000+ cards in 5 rows. Used by dealers and collectors with extensive inventories. Very heavy when full.', tier: 'standard' },
  { name: 'Top Loader Storage Box', category: 'boxes', priceRange: '$5-$10 each', priceLow: 5.00, priceHigh: 10.00, bestFor: 'Organizing 50-100 top-loaded cards', description: 'Boxes specifically sized for cards in top loaders. Standard card boxes waste space with top-loaded cards. These use space efficiently.', tier: 'standard' },
  { name: 'Slab Storage Box', category: 'boxes', priceRange: '$10-$25 each', priceLow: 10.00, priceHigh: 25.00, bestFor: 'Graded card collections of 20-50 slabs', description: 'Padded or reinforced boxes designed for graded card slabs. Interior dividers prevent slabs from rattling and scratching each other. Some have foam inserts.', tier: 'premium', proTip: 'PSA, BGS, and CGC slabs are different sizes — check compatibility before buying slab boxes.' },
  { name: 'Fireproof Safe / Lock Box', category: 'boxes', priceRange: '$50-$200+', priceLow: 50.00, priceHigh: 200.00, bestFor: 'High-value cards ($1,000+), irreplaceable vintage', description: 'Fire-rated safes or lock boxes for protecting your most valuable cards from theft, fire, and water damage. Consider a safety deposit box at a bank for $10K+ cards.', tier: 'premium', valueThreshold: '$1,000+ cards or irreplaceable vintage' },

  // DISPLAY (6)
  { name: 'Wall-Mount Card Frame', category: 'display', priceRange: '$15-$40 each', priceLow: 15.00, priceHigh: 40.00, bestFor: 'Showcasing grail cards on walls', description: 'Shadow box-style frames that mount on walls. Display 1-4 cards (slabbed or in one-touch cases) as wall art. UV-protective glass prevents fading.', tier: 'premium', proTip: 'Avoid hanging in direct sunlight even with UV protection — no protection is 100% effective.' },
  { name: 'Tabletop Display Case', category: 'display', priceRange: '$10-$30 each', priceLow: 10.00, priceHigh: 30.00, bestFor: 'Desk or shelf display of 3-6 cards', description: 'Acrylic or wood display cases that sit on a desk or shelf. Some have tiered steps to show multiple cards at different heights. Great for a "Top 5" display.', tier: 'standard' },
  { name: 'LED Display Case', category: 'display', priceRange: '$30-$80 each', priceLow: 30.00, priceHigh: 80.00, bestFor: 'Premium collection showcasing', description: 'Display cases with built-in LED lighting that illuminates your best cards. Available in wall-mount or tabletop styles. The premium way to showcase grails.', tier: 'premium' },
  { name: 'Card Display Shelf / Rail', category: 'display', priceRange: '$10-$25 each', priceLow: 10.00, priceHigh: 25.00, bestFor: 'Rotating display of featured cards', description: 'Narrow shelf or picture rail that holds cards (in one-touch or slabs) upright. Easy to swap cards in and out for a rotating display. Some hold 8-12 cards per shelf.', tier: 'standard' },
  { name: 'Bookshelf Display Risers', category: 'display', priceRange: '$5-$15 per set', priceLow: 5.00, priceHigh: 15.00, bestFor: 'Turning a bookshelf into a card display', description: 'Acrylic tiered risers that turn a bookshelf into a card showcase. Place slabs or one-touch cases at different heights for visual interest.', tier: 'budget' },
  { name: 'UV-Protective Glass / Film', category: 'display', priceRange: '$10-$30', priceLow: 10.00, priceHigh: 30.00, bestFor: 'Any display exposed to light', description: 'UV-filtering film or glass that blocks 95%+ of harmful UV rays. Apply to display cases, windows near storage, or frame glass. Prevents fading and yellowing.', tier: 'standard' },

  // CLIMATE CONTROL (6)
  { name: 'Silica Gel Desiccant Packs', category: 'climate', priceRange: '$5-$10 per 20', priceLow: 0.25, priceHigh: 0.50, bestFor: 'Individual storage boxes', description: 'Small moisture-absorbing packets placed inside card storage boxes. Absorb excess humidity that can cause warping, sticking, and mold. Replace every 3-6 months.', tier: 'budget', proTip: 'Rechargeable silica gel packs can be dried in the oven and reused — better for the environment and your wallet.' },
  { name: 'Hygrometer (Humidity Monitor)', category: 'climate', priceRange: '$8-$20 each', priceLow: 8.00, priceHigh: 20.00, bestFor: 'Any card storage room or area', description: 'Digital device that displays temperature and humidity levels. Place one in your card storage area to monitor conditions. Alert you if humidity exceeds the 50% danger zone.', tier: 'budget', proTip: 'Target 40-50% humidity and 65-72°F. If humidity consistently exceeds 55%, invest in a dehumidifier.' },
  { name: 'Mini Dehumidifier', category: 'climate', priceRange: '$30-$60 each', priceLow: 30.00, priceHigh: 60.00, bestFor: 'Small card rooms, closets, storage areas', description: 'Small electric dehumidifier for spaces up to 200 sq ft. Removes excess moisture that causes warping, mold, and adhesive breakdown. Essential in humid climates.', tier: 'standard' },
  { name: 'Room Dehumidifier', category: 'climate', priceRange: '$100-$250 each', priceLow: 100.00, priceHigh: 250.00, bestFor: 'Dedicated card rooms, basements', description: 'Full-size dehumidifier for larger spaces. If you store cards in a basement or dedicated room, this maintains proper humidity levels year-round.', tier: 'premium' },
  { name: 'Anti-Static Gloves', category: 'climate', priceRange: '$5-$10 per pair', priceLow: 5.00, priceHigh: 10.00, bestFor: 'Handling vintage cards, high-value raw cards', description: 'Cotton or microfiber gloves that prevent fingerprint oils from contacting card surfaces. Essential when handling raw vintage cards worth $100+. Oils cause long-term surface damage.', tier: 'budget', proTip: 'White cotton gloves are fine for most cards. For glossy modern cards, lint-free nitrile gloves work better.' },
  { name: 'Card Storage Labels / Dividers', category: 'climate', priceRange: '$5-$10 per pack', priceLow: 5.00, priceHigh: 10.00, bestFor: 'Organization within storage boxes', description: 'Pre-cut dividers and adhesive labels for organizing cards within boxes. Sort by sport, year, set, player, or value tier. Good organization prevents handling damage from searching.', tier: 'budget' },
];

const MISTAKES = [
  { title: 'Rubber bands on card stacks', severity: 'high' as const, description: 'Rubber bands leave indentations and chemical marks on card edges. They dry out, crack, and stick to surfaces. Use card dividers in a box instead.' },
  { title: 'Storing in attics or garages', severity: 'high' as const, description: 'Extreme temperature swings (hot summers, cold winters) cause warping, peeling, and adhesive failure. Humidity in these spaces promotes mold. Store in climate-controlled rooms.' },
  { title: 'Leaving cards in direct sunlight', severity: 'high' as const, description: 'UV light fades card colors within weeks. Even UV-protected cases don\'t block 100%. Keep cards away from windows and direct light sources.' },
  { title: 'No penny sleeve before top loader', severity: 'medium' as const, description: 'Cards can scratch against the rigid plastic interior of top loaders. Always penny-sleeve first. The 2-second step saves your card\'s condition.' },
  { title: 'Overpacking storage boxes', severity: 'medium' as const, description: 'Cramming too many cards in a box causes edge wear from friction. Leave 10-15% space so cards stand upright without pressure.' },
  { title: 'Using cheap, non-acid-free supplies', severity: 'medium' as const, description: 'Non-archival sleeves and pages can yellow, stick to card surfaces, and cause chemical damage over decades. Stick to Ultra Pro, BCW, and other archival brands.' },
  { title: 'Touching card surfaces with bare hands', severity: 'medium' as const, description: 'Fingerprint oils cause long-term surface damage, especially on glossy cards and vintage cardboard. Use edges to handle cards, or wear gloves for valuable pieces.' },
  { title: 'Ignoring humidity levels', severity: 'low' as const, description: 'Humidity above 60% promotes mold and warping. Below 30% can cause cards to become brittle. A $10 hygrometer prevents thousands in damage.' },
];

const VALUE_TIERS = [
  { range: 'Under $5', sleeve: 'Penny sleeve', holder: 'None (box storage)', display: '9-pocket page', color: 'text-gray-400' },
  { range: '$5 - $24', sleeve: 'Penny sleeve', holder: 'Top loader', display: '9-pocket or top loader page', color: 'text-blue-400' },
  { range: '$25 - $99', sleeve: 'Perfect fit', holder: 'Top loader + team bag', display: 'Top loader page or stand', color: 'text-green-400' },
  { range: '$100 - $499', sleeve: 'Perfect fit', holder: 'One-touch magnetic', display: 'One-touch + stand', color: 'text-amber-400' },
  { range: '$500 - $999', sleeve: 'Perfect fit', holder: 'One-touch or grade it', display: 'Display case', color: 'text-orange-400' },
  { range: '$1,000+', sleeve: 'Consider grading', holder: 'PSA/BGS slab', display: 'Wall frame or safe', color: 'text-red-400' },
];

/* ── component ───────────────────────────────────────────────────── */

export default function StorageGuideClient() {
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');
  const [activeTier, setActiveTier] = useState<'all' | 'budget' | 'standard' | 'premium'>('all');
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'tiers' | 'mistakes' | 'checklist'>('products');

  const filtered = useMemo(() => {
    return PRODUCTS.filter(p => {
      if (activeCategory !== 'all' && p.category !== activeCategory) return false;
      if (activeTier !== 'all' && p.tier !== activeTier) return false;
      return true;
    });
  }, [activeCategory, activeTier]);

  const toggleCheck = (name: string) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const checkedProducts = PRODUCTS.filter(p => checkedItems.has(p.name));
  const estimatedCost = checkedProducts.reduce((sum, p) => sum + (p.priceLow + p.priceHigh) / 2, 0);

  return (
    <div>
      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Products Listed', value: PRODUCTS.length.toString(), color: 'text-teal-400' },
          { label: 'Categories', value: '6', color: 'text-blue-400' },
          { label: 'On Your List', value: checkedItems.size.toString(), color: 'text-green-400' },
          { label: 'Est. Cost', value: `$${estimatedCost.toFixed(0)}`, color: 'text-amber-400' },
        ].map(s => (
          <div key={s.label} className="bg-gray-900/60 border border-gray-800 rounded-lg p-3 text-center">
            <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
            <div className="text-gray-500 text-xs">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tab Nav */}
      <div className="flex flex-wrap gap-2 mb-6">
        {([
          { value: 'products' as const, label: 'Supply Guide', icon: '📦' },
          { value: 'tiers' as const, label: 'Value Tiers', icon: '💎' },
          { value: 'mistakes' as const, label: 'Common Mistakes', icon: '⚠️' },
          { value: 'checklist' as const, label: 'My Supply List', icon: '✅' },
        ]).map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? 'bg-teal-900/50 text-teal-300 border border-teal-700/50'
                : 'bg-gray-900/50 text-gray-400 border border-gray-800 hover:border-gray-700'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* PRODUCTS TAB */}
      {activeTab === 'products' && (
        <div>
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-4">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  activeCategory === cat.value
                    ? 'bg-teal-900/50 text-teal-300 border border-teal-700/50'
                    : 'bg-gray-900/50 text-gray-500 border border-gray-800 hover:border-gray-700'
                }`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>

          {/* Tier Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            {(['all', 'budget', 'standard', 'premium'] as const).map(t => (
              <button
                key={t}
                onClick={() => setActiveTier(t)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  activeTier === t
                    ? 'bg-teal-900/50 text-teal-300 border border-teal-700/50'
                    : 'bg-gray-900/50 text-gray-500 border border-gray-800 hover:border-gray-700'
                }`}
              >
                {t === 'all' ? 'All Tiers' : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <div className="text-gray-500 text-sm mb-4">{filtered.length} product{filtered.length !== 1 ? 's' : ''}</div>

          {/* Product Cards */}
          <div className="space-y-3">
            {filtered.map(product => {
              const isExpanded = expandedProduct === product.name;
              const isChecked = checkedItems.has(product.name);
              return (
                <div
                  key={product.name}
                  className={`border rounded-lg transition-colors ${CAT_COLORS[product.category]} ${isChecked ? 'ring-1 ring-teal-600/50' : ''}`}
                >
                  <div className="flex items-start gap-3 p-4">
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleCheck(product.name)}
                      className={`mt-0.5 w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                        isChecked ? 'bg-teal-600 border-teal-500 text-white' : 'border-gray-600 hover:border-teal-500'
                      }`}
                    >
                      {isChecked && <span className="text-xs">&#10003;</span>}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <button
                          onClick={() => setExpandedProduct(isExpanded ? null : product.name)}
                          className="text-white font-medium text-sm hover:text-teal-300 transition-colors text-left"
                        >
                          {product.name}
                        </button>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${CAT_BADGE[product.category]}`}>
                          {product.category}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${TIER_BADGE[product.tier]}`}>
                          {product.tier}
                        </span>
                      </div>
                      <div className="text-gray-400 text-xs mb-1">{product.bestFor}</div>
                      <div className="text-teal-400 text-xs font-medium">{product.priceRange}</div>

                      {isExpanded && (
                        <div className="mt-3 space-y-2">
                          <p className="text-gray-300 text-sm leading-relaxed">{product.description}</p>
                          {product.valueThreshold && (
                            <div className="text-xs text-amber-400">Use for: {product.valueThreshold}</div>
                          )}
                          {product.proTip && (
                            <div className="bg-teal-950/30 border border-teal-800/30 rounded p-2">
                              <span className="text-teal-400 text-xs font-medium">Pro Tip: </span>
                              <span className="text-gray-300 text-xs">{product.proTip}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => setExpandedProduct(isExpanded ? null : product.name)}
                      className={`text-gray-500 text-xs flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    >
                      &#9660;
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VALUE TIERS TAB */}
      {activeTab === 'tiers' && (
        <div>
          <h2 className="text-lg font-bold text-white mb-4">Protection by Card Value</h2>
          <p className="text-gray-400 text-sm mb-6">Match your protection level to your card&apos;s value. Don&apos;t spend $8 on a one-touch for a $3 card — but don&apos;t put a $500 card in just a penny sleeve either.</p>

          <div className="space-y-3">
            {VALUE_TIERS.map(tier => (
              <div key={tier.range} className="bg-gray-900/60 border border-gray-800 rounded-lg p-4">
                <div className={`font-bold text-sm mb-2 ${tier.color}`}>{tier.range}</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <div className="text-gray-500 text-xs mb-0.5">Sleeve</div>
                    <div className="text-gray-300 text-sm">{tier.sleeve}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs mb-0.5">Holder</div>
                    <div className="text-gray-300 text-sm">{tier.holder}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs mb-0.5">Display</div>
                    <div className="text-gray-300 text-sm">{tier.display}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Reference */}
          <div className="mt-6 bg-teal-950/20 border border-teal-800/30 rounded-lg p-4">
            <h3 className="text-teal-400 font-medium text-sm mb-2">The 3x Rule for Protection</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Spend no more than 10% of a card&apos;s value on protection. A $5 card gets a $0.25 penny sleeve + $0.30 top loader. A $100 card justifies a $5 one-touch magnetic. A $1,000+ card justifies a $30+ grading submission. Scale your investment proportionally.
            </p>
          </div>
        </div>
      )}

      {/* MISTAKES TAB */}
      {activeTab === 'mistakes' && (
        <div>
          <h2 className="text-lg font-bold text-white mb-4">8 Storage Mistakes That Destroy Cards</h2>
          <p className="text-gray-400 text-sm mb-6">Avoid these common errors that silently damage card collections over time.</p>

          <div className="space-y-3">
            {MISTAKES.map((m, i) => (
              <div key={i} className={`border rounded-lg p-4 ${
                m.severity === 'high' ? 'border-red-800/40 bg-red-950/20' :
                m.severity === 'medium' ? 'border-amber-800/40 bg-amber-950/20' :
                'border-blue-800/40 bg-blue-950/20'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    m.severity === 'high' ? 'bg-red-900/50 text-red-400' :
                    m.severity === 'medium' ? 'bg-amber-900/50 text-amber-400' :
                    'bg-blue-900/50 text-blue-400'
                  }`}>
                    {m.severity.toUpperCase()} RISK
                  </span>
                  <span className="text-white font-medium text-sm">{m.title}</span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">{m.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MY SUPPLY LIST TAB */}
      {activeTab === 'checklist' && (
        <div>
          <h2 className="text-lg font-bold text-white mb-4">My Supply Shopping List</h2>
          <p className="text-gray-400 text-sm mb-6">
            Check products in the Supply Guide tab to add them here. Your personalized shopping list with estimated costs.
          </p>

          {checkedProducts.length === 0 ? (
            <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-8 text-center">
              <div className="text-3xl mb-3">📋</div>
              <div className="text-gray-400 text-sm mb-2">No items on your list yet</div>
              <button
                onClick={() => setActiveTab('products')}
                className="text-teal-400 text-sm hover:underline"
              >
                Browse the Supply Guide to add items
              </button>
            </div>
          ) : (
            <div>
              <div className="space-y-2 mb-6">
                {checkedProducts.map(p => (
                  <div key={p.name} className="flex items-center justify-between bg-gray-900/60 border border-gray-800 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleCheck(p.name)}
                        className="w-5 h-5 rounded bg-teal-600 border-teal-500 text-white flex items-center justify-center text-xs"
                      >
                        &#10003;
                      </button>
                      <div>
                        <div className="text-white text-sm">{p.name}</div>
                        <div className="text-gray-500 text-xs">{p.category}</div>
                      </div>
                    </div>
                    <div className="text-teal-400 text-sm font-medium">{p.priceRange}</div>
                  </div>
                ))}
              </div>

              <div className="bg-teal-950/20 border border-teal-800/30 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-teal-400 font-medium">Estimated Total</div>
                    <div className="text-gray-500 text-xs">{checkedProducts.length} item{checkedProducts.length !== 1 ? 's' : ''} selected</div>
                  </div>
                  <div className="text-2xl font-bold text-white">${estimatedCost.toFixed(0)}</div>
                </div>
              </div>

              <button
                onClick={() => setCheckedItems(new Set())}
                className="mt-4 text-gray-500 text-xs hover:text-red-400 transition-colors"
              >
                Clear all items
              </button>
            </div>
          )}

          {/* Starter Kits */}
          <div className="mt-8">
            <h3 className="text-white font-medium text-sm mb-3">Suggested Starter Kits</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  name: 'Beginner Kit',
                  cost: '$25-$40',
                  items: ['Penny Sleeves', 'Standard Top Loaders (35pt)', 'Team Bags', '800-Count Card Box', 'Silica Gel Desiccant Packs'],
                  color: 'border-green-800/40 bg-green-950/20',
                },
                {
                  name: 'Enthusiast Kit',
                  cost: '$60-$100',
                  items: ['Perfect Fit Sleeves', 'Standard Top Loaders (35pt)', 'One-Touch Magnetic Cases', 'Semi-Rigid Card Holders', '9-Pocket Binder Pages', 'D-Ring Binder (3-inch)', '800-Count Card Box', 'Hygrometer (Humidity Monitor)'],
                  color: 'border-blue-800/40 bg-blue-950/20',
                },
                {
                  name: 'Serious Collector Kit',
                  cost: '$150-$250+',
                  items: ['Perfect Fit Sleeves', 'One-Touch Magnetic Cases', 'Graded Card Sleeves', 'Slab Storage Box', 'Zippered Card Binder', 'Wall-Mount Card Frame', 'LED Display Case', 'Mini Dehumidifier', 'Hygrometer (Humidity Monitor)', 'Anti-Static Gloves'],
                  color: 'border-amber-800/40 bg-amber-950/20',
                },
              ].map(kit => (
                <div key={kit.name} className={`border rounded-lg p-4 ${kit.color}`}>
                  <div className="text-white font-medium text-sm mb-1">{kit.name}</div>
                  <div className="text-teal-400 text-xs font-medium mb-2">{kit.cost}</div>
                  <ul className="space-y-1">
                    {kit.items.map(item => (
                      <li key={item} className="text-gray-400 text-xs flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-gray-600" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => {
                      const next = new Set(checkedItems);
                      kit.items.forEach(item => next.add(item));
                      setCheckedItems(next);
                    }}
                    className="mt-3 text-teal-400 text-xs hover:underline"
                  >
                    Add all to my list
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
