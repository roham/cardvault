'use client';

import { useState } from 'react';
import Link from 'next/link';

type Category = 'all' | 'buying' | 'selling' | 'grading' | 'collecting';

interface CheatSheetItem {
  label: string;
  detail: string;
  important?: boolean;
}

interface CheatSheet {
  id: string;
  title: string;
  subtitle: string;
  category: Category;
  icon: string;
  color: string;
  borderColor: string;
  badgeColor: string;
  quickTip: string;
  items: CheatSheetItem[];
  relatedTool?: { href: string; label: string };
}

const categories: { key: Category; label: string }[] = [
  { key: 'all', label: 'All Sheets' },
  { key: 'buying', label: 'Buying' },
  { key: 'selling', label: 'Selling' },
  { key: 'grading', label: 'Grading' },
  { key: 'collecting', label: 'Collecting' },
];

const sheets: CheatSheet[] = [
  {
    id: 'card-show-buying',
    title: 'Card Show Buying Guide',
    subtitle: '12 rules for card show success',
    category: 'buying',
    icon: '🏪',
    color: 'bg-emerald-950/40',
    borderColor: 'border-emerald-800/40',
    badgeColor: 'bg-emerald-900/60 text-emerald-300',
    quickTip: 'Bring cash in small bills. Most dealers give 10-15% discounts for cash over card.',
    items: [
      { label: 'Set a firm budget BEFORE you go', detail: 'Bring cash in an envelope — when it\'s empty, you\'re done. Card shows are designed to make you overspend.' },
      { label: 'Bring a want list (printed or on your phone)', detail: 'Know exactly what you\'re looking for. Without a list, you\'ll impulse-buy cards that sit in a box for years.' },
      { label: 'Walk the ENTIRE show before buying anything', detail: 'The same card can be priced 30-50% differently between dealers. Do a full lap first to know fair prices.', important: true },
      { label: 'Bring penny sleeves and top loaders', detail: 'Many dealers have cards loose in boxes. Protect your purchases immediately — a damaged card loses 50%+ value.' },
      { label: 'Check card condition with a bright light', detail: 'Hold cards at an angle under good light to spot surface scratches, print defects, and off-center cutting.' },
      { label: 'Negotiate — but be respectful', detail: 'Asking "what\'s your best price on this?" is expected. Offering 50% of asking is insulting. Start at 75-80%.' },
      { label: 'Buy in bundles for better deals', detail: '"I\'ll take all three for $X" often works. Dealers prefer moving volume over maximizing per-card profit.' },
      { label: 'Verify expensive cards with your phone', detail: 'Check eBay sold listings before any purchase over $50. Dealers sometimes price above market.' },
      { label: 'Arrive early for the best inventory', detail: 'Serious dealers and the best inventory move within the first 2 hours. The bargains come at close.', important: true },
      { label: 'Bring your own magnifying glass', detail: 'A 10x loupe ($5 on Amazon) helps you spot centering issues, surface problems, and fake autos.' },
      { label: 'Save receipts for every purchase', detail: 'You need them for insurance claims, capital gains calculations, and return disputes.' },
      { label: 'Don\'t be afraid to walk away', detail: 'If a deal doesn\'t feel right, leave. The card will be on eBay tomorrow. FOMO is the #1 cause of overpaying.' },
    ],
    relatedTool: { href: '/tools/smart-buy-list', label: 'Smart Buy List' },
  },
  {
    id: 'ebay-selling',
    title: 'eBay Selling Checklist',
    subtitle: '10 steps to maximize your sale price',
    category: 'selling',
    icon: '💵',
    color: 'bg-blue-950/40',
    borderColor: 'border-blue-800/40',
    badgeColor: 'bg-blue-900/60 text-blue-300',
    quickTip: 'List on Sunday evening 7-9pm EST — that\'s when the most collectors are browsing eBay.',
    items: [
      { label: 'Take 4+ clear photos on a dark background', detail: 'Front, back, and close-ups of corners. Use natural daylight or a ring light. Blurry photos kill bids.', important: true },
      { label: 'Research recent sold prices (not listings)', detail: 'Click "Sold Items" on eBay. Active listings mean nothing — only what actually sold shows real market value.' },
      { label: 'Use specific keywords in your title', detail: 'Format: [Year] [Set] [Player] [Card #] [Parallel] [Grade]. Example: "2024 Topps Chrome Paul Skenes RC #123 Refractor PSA 10".' },
      { label: 'Start auction at 70-80% of expected sale price', detail: 'Starting at $0.99 gets attention but risks selling below value. A reasonable starting bid protects your floor.' },
      { label: 'Ship within 1 business day of payment', detail: 'Fast shipping = positive feedback = higher seller rating = more trust = higher future sale prices.' },
      { label: 'Use a penny sleeve + top loader + team bag', detail: 'Then sandwich between cardboard in a bubble mailer. This is the industry standard — anything less risks a return.' },
      { label: 'Add tracking to every shipment', detail: 'Untracked shipments mean eBay sides with the buyer in disputes. Always track packages over $20.' },
      { label: 'Factor in ALL fees before pricing', detail: 'eBay takes ~13.25% (final value + payment processing). USPS First Class starts at $4. Your net is ~83% of sale price.', important: true },
      { label: 'Offer free shipping when possible', detail: 'Listings with free shipping rank higher in eBay search and convert better. Build shipping cost into your price.' },
      { label: 'End your auction on Sunday evening', detail: '7-9pm EST gets the most eyeballs. Avoid ending on Friday/Saturday nights when collectors are out.' },
    ],
    relatedTool: { href: '/tools/flip-profit', label: 'Flip Profit Calculator' },
  },
  {
    id: 'grading-decision',
    title: 'Grading Decision Tree',
    subtitle: 'Should you grade this card?',
    category: 'grading',
    icon: '🔍',
    color: 'bg-amber-950/40',
    borderColor: 'border-amber-800/40',
    badgeColor: 'bg-amber-900/60 text-amber-300',
    quickTip: 'Only grade if the gem mint value is at least 3x the raw value + grading cost. Otherwise, sell raw.',
    items: [
      { label: 'Is the card worth more than $50 raw?', detail: 'If the raw card is worth less than $50, grading fees ($20-$150) will eat your margin. Sell raw instead.', important: true },
      { label: 'Does the card have sharp corners?', detail: 'Corner wear is the #1 reason cards grade below PSA 9. Check all 4 corners with a loupe. Any whitening = PSA 8 or lower.' },
      { label: 'Is the centering within 55/45?', detail: 'PSA 10 requires 55/45 or better left-right AND top-bottom. Use a centering tool or app to check before submitting.' },
      { label: 'Are there ANY surface scratches?', detail: 'Hold the card at a 45-degree angle under bright light. Even micro-scratches on chrome/refractors will drop you to PSA 9.' },
      { label: 'Is this a card that NEEDS grading to sell?', detail: 'High-end vintage (pre-1980) and key rookies benefit most from grading. Base cards and commons rarely benefit.' },
      { label: 'Which grading company should you use?', detail: 'PSA for resale value. BGS for sub-grade fans and basketball/football. CGC for budget grading. SGC for vintage cards.', important: true },
      { label: 'What service level should you pick?', detail: 'Economy ($20-30, 3-6 months) for patience. Regular ($50-75, 1-2 months) for moderate urgency. Express ($150+) only for $500+ cards.' },
      { label: 'Should you submit as a group?', detail: 'Group submissions save on shipping. Wait until you have 10-20 cards to submit together. Many LCS offer group subs at lower per-card costs.' },
      { label: 'Are you timing the market?', detail: 'Grade before the player\'s big moment (draft, playoffs, milestone). A PSA 10 after a championship can be worth 2-3x more.' },
      { label: 'Have you compared grade premiums?', detail: 'Check what PSA 9 vs PSA 10 sells for. If PSA 9 is only 20% less than PSA 10, a 9 is still a great return on grading fees.' },
    ],
    relatedTool: { href: '/tools/grading-roi', label: 'Grading ROI Calculator' },
  },
  {
    id: 'authentication-check',
    title: 'Card Authentication Quick Check',
    subtitle: '10 red flags for fakes and reprints',
    category: 'buying',
    icon: '🛡️',
    color: 'bg-red-950/40',
    borderColor: 'border-red-800/40',
    badgeColor: 'bg-red-900/60 text-red-300',
    quickTip: 'If a deal seems too good to be true, it is. A PSA 10 Wemby RC for $50 is 100% fake.',
    items: [
      { label: 'Check the card stock thickness', detail: 'Real cards have specific thickness per manufacturer. Fakes often feel thinner or flimsier. Compare to a known real card.', important: true },
      { label: 'Look for the rosette pattern under magnification', detail: 'Real printed cards show a dot pattern (CMYK rosette) under 10x magnification. Inkjet fakes show solid color or banding.' },
      { label: 'Check the edges for clean cutting', detail: 'Factory-cut cards have clean, consistent edges. Trimmed or reprinted cards often have slightly uneven or rough edges.' },
      { label: 'Verify the font and text alignment', detail: 'Compare the suspect card\'s text to verified images on PSA\'s cert database. Fakes often have slightly off fonts or spacing.' },
      { label: 'Do the light test', detail: 'Hold the card up to a bright light. Real cards block light evenly. Reprints on thinner stock will show light bleeding through.' },
      { label: 'Check holographic elements', detail: 'Holo foil on Prizm, Select, and Chrome cards should shift smoothly. Fake holo looks static or pixelated under movement.', important: true },
      { label: 'Verify PSA/BGS slab labels', detail: 'Check the cert number on PSA\'s website (psacard.com/cert). Fake slabs use real cert numbers from different cards.' },
      { label: 'Compare the card back carefully', detail: 'The back is where most fakes fail. Color saturation, text clarity, and barcode quality are usually worse on counterfeits.' },
      { label: 'Weigh slabbed cards', detail: 'PSA slabs have specific weight ranges per era. A fake slab will often weigh differently. Use a kitchen scale (0.1g accuracy).' },
      { label: 'Trust your gut on autographs', detail: 'Compare the auto to PSA\'s autograph examples. Look for pen pressure, letter formation, and consistency. Autopens are uniform and lifeless.' },
    ],
    relatedTool: { href: '/tools/slab-weight', label: 'Slab Weight Verifier' },
  },
  {
    id: 'storage-protection',
    title: 'Card Storage & Protection',
    subtitle: 'Keep your collection safe',
    category: 'collecting',
    icon: '📦',
    color: 'bg-violet-950/40',
    borderColor: 'border-violet-800/40',
    badgeColor: 'bg-violet-900/60 text-violet-300',
    quickTip: 'Never store cards in a garage, attic, or basement. Temperature swings and humidity destroy cards.',
    items: [
      { label: 'Every card gets a penny sleeve first', detail: 'Even $1 base cards. Penny sleeves prevent surface scratches that accumulate over time. Cost: $0.01 per sleeve.' },
      { label: 'Valuable cards ($10+) get a top loader', detail: '3x4" semi-rigid top loaders protect corners and edges. Use 35pt for standard cards, 55pt+ for thicker relics/patches.' },
      { label: 'Seal top loaders with team bags', detail: 'A resealable team bag over the top loader prevents dust and protects the card during storage and shipping.', important: true },
      { label: 'Store upright in a cool, dry, dark place', detail: 'Ideal: 65-72°F, 35-50% humidity. UV light fades card surfaces. A closet shelf beats a display case for preservation.' },
      { label: 'Use silica gel packets in storage boxes', detail: 'Toss 2-3 silica packets per 800-count box to absorb moisture. Replace every 6 months.' },
      { label: 'Never use rubber bands on cards', detail: 'Rubber bands leave permanent indentations and residue. Use dividers or card savers to organize instead.', important: true },
      { label: 'Magnetic one-touches for display cards', detail: 'Ultra Pro One-Touch cases are the gold standard for displaying valuable cards. 35pt for standard, 55-180pt for relics.' },
      { label: 'Graded slabs need slab sleeves', detail: 'PSA and BGS slabs scratch easily. Resealable slab sleeves ($0.05 each) protect your $50+ grading investment.' },
      { label: 'Consider a fireproof safe for $1,000+ cards', detail: 'A small fireproof safe ($50-100) protects your most valuable cards from disaster. Worth it for any serious collection.' },
      { label: 'Keep an inventory spreadsheet', detail: 'Track every card over $20: player, year, set, grade, purchase price, current value. Essential for insurance claims.' },
    ],
    relatedTool: { href: '/guides/card-storage', label: 'Card Storage Guide' },
  },
  {
    id: 'rookie-investing',
    title: 'Rookie Card Investing',
    subtitle: 'Buy windows, hold periods, sell signals',
    category: 'buying',
    icon: '📈',
    color: 'bg-teal-950/40',
    borderColor: 'border-teal-800/40',
    badgeColor: 'bg-teal-900/60 text-teal-300',
    quickTip: 'The best time to buy rookie cards is 3-6 months AFTER the hype dies. Patience beats FOMO every time.',
    items: [
      { label: 'Buy BEFORE the breakout, not after', detail: 'Once a player has a viral moment, prices spike 200-500% overnight. Buy prospects before they become household names.', important: true },
      { label: 'Focus on Flagship products', detail: 'Topps Chrome (baseball), Prizm (basketball/football), Upper Deck Young Guns (hockey). These hold value best long-term.' },
      { label: 'Rookies dip 3-6 months after release', detail: 'Initial hype inflates prices. Wait for the "sophomore slump" dip — most rookies drop 30-50% from release highs.' },
      { label: 'Only invest in top-10 draft picks or proven starters', detail: 'Mid-round picks rarely sustain value. Focus on #1-10 overall picks, All-Star caliber, or statistically elite players.' },
      { label: 'Sell into career milestones', detail: 'MVP awards, championships, record-breaking seasons — these are sell windows. Prices often peak at the moment, not after.', important: true },
      { label: 'Diversify across sports and players', detail: 'Don\'t put all your money into one player. Build a portfolio of 10-20 players across multiple sports to spread risk.' },
      { label: 'Grade your best copies for maximum premium', detail: 'A PSA 10 typically commands 3-10x the raw price. Grade your sharpest copy and sell the rest raw.' },
      { label: 'Track your cost basis religiously', detail: 'Know exactly what you paid (card + shipping + grading + fees). You can\'t know your profit without knowing your cost.' },
      { label: 'Injury = buy opportunity', detail: 'When a star player gets injured, their card prices drop 20-40%. If you believe in the long-term talent, buy the dip.' },
      { label: 'Watch the draft and offseason moves', detail: 'Players traded to contenders see 20-30% price bumps. Players in contract years have built-in sell catalysts.' },
    ],
    relatedTool: { href: '/tools/flip-window', label: 'Flip Window Calculator' },
  },
  {
    id: 'condition-assessment',
    title: 'Card Condition Quick Check',
    subtitle: 'Estimate the grade in 60 seconds',
    category: 'grading',
    icon: '🔎',
    color: 'bg-orange-950/40',
    borderColor: 'border-orange-800/40',
    badgeColor: 'bg-orange-900/60 text-orange-300',
    quickTip: 'A card is only as strong as its weakest attribute. One bad corner caps the entire grade.',
    items: [
      { label: 'CORNERS: Check all 4 with a loupe', detail: 'Sharp corners = PSA 9-10. Minor wear (fuzzy tip) = PSA 7-8. Visible rounding = PSA 5-6. Heavily worn = PSA 3-4.', important: true },
      { label: 'EDGES: Run your finger along all 4 sides', detail: 'Smooth and clean = PSA 9-10. Minor chipping or rough spots = PSA 7-8. Noticeable wear = PSA 5-6.' },
      { label: 'SURFACE: Angle under bright light', detail: 'No scratches or print dots = PSA 9-10. Light scratches visible at angle = PSA 7-8. Obvious marks = PSA 5-6.' },
      { label: 'CENTERING: Compare borders left/right and top/bottom', detail: 'PSA 10: 55/45 or better. PSA 9: 60/40. PSA 8: 65/35. PSA 7: 70/30. Worse than 70/30 = PSA 6 or below.' },
      { label: 'CREASES: Feel gently for bends', detail: 'Any crease visible without magnification = PSA 5 max. A crease caps the grade regardless of other factors.', important: true },
      { label: 'STAINING: Check for yellow spots or foxing', detail: 'Yellowing on vintage cards is common and reduces grade. White borders show staining faster than dark borders.' },
      { label: 'PRINT DEFECTS: Look for color dots or lines', detail: 'Factory print defects (fish-eye, snow, roller marks) affect grade. Modern chrome/refractors are especially susceptible.' },
      { label: 'WAX STAINING: Check for wax residue on vintage', detail: 'Pre-1990 cards stored in wax packs often have waxy film on surfaces. This caps most cards at PSA 7-8.' },
      { label: 'Compare to PSA pop report data', detail: 'If 60% of submissions grade PSA 10, the card is easy to gem. If only 5% gem, your card needs to be near-perfect.' },
      { label: 'When in doubt, get a second opinion', detail: 'Ask a trusted dealer or post in grading forums. A $3 card graded wrong wastes $20. A $300 card graded wrong wastes real money.' },
    ],
    relatedTool: { href: '/tools/condition-grader', label: 'Condition Self-Grader' },
  },
  {
    id: 'shipping-safely',
    title: 'Shipping Cards Safely',
    subtitle: 'From penny sleeve to doorstep',
    category: 'selling',
    icon: '📮',
    color: 'bg-indigo-950/40',
    borderColor: 'border-indigo-800/40',
    badgeColor: 'bg-indigo-900/60 text-indigo-300',
    quickTip: 'Cards under $20: PWE with non-machinable stamp. Cards over $20: bubble mailer with tracking. Always.',
    items: [
      { label: 'Step 1: Penny sleeve the card', detail: 'Insert the card into a penny sleeve top-first. This prevents corner damage during insertion.', important: true },
      { label: 'Step 2: Place in top loader or card saver', detail: 'For raw cards: semi-rigid top loader. For grading submissions: Card Saver 1 (required by PSA and BGS).' },
      { label: 'Step 3: Seal with team bag or tape', detail: 'Put the top loader in a team bag OR tape the opening of the top loader. Never let the card slide out.' },
      { label: 'Step 4: Sandwich between cardboard', detail: 'Two pieces of cardboard slightly larger than the top loader. Tape them together so nothing shifts in transit.' },
      { label: 'Step 5: Choose your shipping method', detail: 'PWE: $1.30 with non-machinable stamp (cards under $20). Bubble mailer: $4-5 First Class (cards $20-$200). Priority: $8+ (cards $200+).', important: true },
      { label: 'ALWAYS add tracking for $20+ cards', detail: 'USPS First Class Package ($4+) includes tracking. Without tracking, eBay will side with the buyer in any dispute.' },
      { label: 'Add insurance for $100+ cards', detail: 'USPS insurance is cheap: $2.75 for up to $100, $5 for up to $500. Ship via Priority Mail ($8+) for cards over $200.' },
      { label: 'Write "Non-Machinable" on PWEs', detail: 'Rigid top loaders will jam USPS sorting machines. The non-machinable stamp ($0.30 extra) routes it to hand-sorting.' },
      { label: 'Never use paper envelopes for slabs', detail: 'Graded slabs need a small box or padded mailer. Slabs crack easily if the envelope bends during transit.' },
      { label: 'Drop off at the counter, don\'t use the box', detail: 'Get a receipt with scan confirmation. Packages dropped in blue boxes occasionally go missing without proof of mailing.' },
    ],
    relatedTool: { href: '/tools/shipping-cost', label: 'Shipping Cost Calculator' },
  },
];

export default function CheatSheetsClient() {
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [expandedSheet, setExpandedSheet] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, Set<number>>>({});

  const filtered = activeCategory === 'all' ? sheets : sheets.filter(s => s.category === activeCategory);

  const toggleCheck = (sheetId: string, idx: number) => {
    setCheckedItems(prev => {
      const next = { ...prev };
      const set = new Set(prev[sheetId] || []);
      if (set.has(idx)) set.delete(idx);
      else set.add(idx);
      next[sheetId] = set;
      return next;
    });
  };

  const getProgress = (sheetId: string, total: number) => {
    const checked = checkedItems[sheetId]?.size || 0;
    return Math.round((checked / total) * 100);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-cyan-950/60 border border-cyan-800/50 text-cyan-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
          8 Cheat Sheets &middot; Mobile-First &middot; Checkable &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Collecting Cheat Sheets</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Quick-reference guides for every collecting scenario. Check off items as you go — perfect for card shows,
          eBay listings, and grading submissions.
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Cheat Sheets', value: '8', sub: 'reference guides' },
          { label: 'Total Tips', value: '82', sub: 'actionable items' },
          { label: 'Categories', value: '4', sub: 'buying · selling · grading · collecting' },
          { label: 'Your Progress', value: `${Object.values(checkedItems).reduce((a, s) => a + s.size, 0)}/82`, sub: 'items checked' },
        ].map(s => (
          <div key={s.label} className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-white">{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map(c => (
          <button
            key={c.key}
            onClick={() => setActiveCategory(c.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === c.key
                ? 'bg-cyan-600 text-white'
                : 'bg-gray-800/60 text-gray-400 hover:text-white hover:bg-gray-700/60'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Cheat Sheets Grid */}
      <div className="space-y-4">
        {filtered.map(sheet => {
          const isExpanded = expandedSheet === sheet.id;
          const progress = getProgress(sheet.id, sheet.items.length);
          const checked = checkedItems[sheet.id]?.size || 0;

          return (
            <div key={sheet.id} className={`${sheet.color} border ${sheet.borderColor} rounded-2xl overflow-hidden transition-all`}>
              {/* Sheet Header */}
              <button
                onClick={() => setExpandedSheet(isExpanded ? null : sheet.id)}
                className="w-full p-4 sm:p-5 flex items-center gap-4 text-left"
              >
                <div className="text-3xl flex-shrink-0">{sheet.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold text-white">{sheet.title}</h2>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${sheet.badgeColor}`}>{sheet.subtitle}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex-1 h-1.5 bg-gray-700/50 rounded-full overflow-hidden max-w-[200px]">
                      <div
                        className="h-full bg-cyan-500 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400">{checked}/{sheet.items.length}</span>
                  </div>
                </div>
                <span className={`text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>&#9660;</span>
              </button>

              {/* Sheet Content */}
              {isExpanded && (
                <div className="px-4 sm:px-5 pb-5">
                  {/* Quick Tip */}
                  <div className="bg-gray-900/60 border border-gray-700/40 rounded-xl p-3 mb-4">
                    <div className="text-xs text-cyan-400 font-semibold uppercase tracking-wide mb-1">Quick Tip</div>
                    <div className="text-sm text-gray-300">{sheet.quickTip}</div>
                  </div>

                  {/* Items Checklist */}
                  <div className="space-y-2">
                    {sheet.items.map((item, idx) => {
                      const isChecked = checkedItems[sheet.id]?.has(idx) || false;
                      return (
                        <div
                          key={idx}
                          className={`rounded-xl border transition-all ${
                            isChecked ? 'bg-gray-800/30 border-gray-700/30' : 'bg-gray-900/40 border-gray-700/40'
                          }`}
                        >
                          <button
                            onClick={() => toggleCheck(sheet.id, idx)}
                            className="w-full p-3 flex items-start gap-3 text-left"
                          >
                            <div className={`mt-0.5 w-5 h-5 rounded flex-shrink-0 border flex items-center justify-center ${
                              isChecked ? 'bg-cyan-600 border-cyan-500' : 'border-gray-600 hover:border-gray-400'
                            }`}>
                              {isChecked && <span className="text-white text-xs">&#10003;</span>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className={`text-sm font-medium ${isChecked ? 'text-gray-500 line-through' : 'text-white'} ${item.important ? 'flex items-center gap-2' : ''}`}>
                                {item.label}
                                {item.important && <span className="text-amber-400 text-xs">KEY</span>}
                              </div>
                              <div className={`text-xs mt-1 leading-relaxed ${isChecked ? 'text-gray-600' : 'text-gray-400'}`}>{item.detail}</div>
                            </div>
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Related Tool Link */}
                  {sheet.relatedTool && (
                    <Link
                      href={sheet.relatedTool.href}
                      className="mt-4 inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      Related tool: {sheet.relatedTool.label} &rarr;
                    </Link>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
