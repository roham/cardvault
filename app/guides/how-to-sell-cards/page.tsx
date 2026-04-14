import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'How to Sell Sports Cards in 2026: Complete Seller\'s Guide',
  description: 'Step-by-step guide to selling sports cards and Pokemon cards. Where to sell, how to price, shipping tips, platform fees, and how to maximize your return. eBay, TCGPlayer, COMC, consignment, and local options compared.',
  keywords: ['how to sell sports cards', 'selling cards on eBay', 'where to sell Pokemon cards', 'COMC selling', 'card selling tips', 'sports card selling guide'],
};

interface SellingPlatform {
  name: string;
  bestFor: string;
  fees: string;
  speed: string;
  effort: string;
  pros: string[];
  cons: string[];
}

const platforms: SellingPlatform[] = [
  {
    name: 'eBay',
    bestFor: 'Graded cards, high-value singles, sports cards',
    fees: '13.25% final value + promoted listings (2-15% optional)',
    speed: '1-14 days (auction or BIN)',
    effort: 'Medium — photos, listing, shipping',
    pros: ['Largest audience of card buyers', 'Auction format captures max value for rare cards', 'Sold listings create transparent market pricing', 'Global reach'],
    cons: ['13.25% fees are the highest of major platforms', 'Buyer returns/fraud risk', 'Promoted listings pressure increases costs', 'Requires quality photos and descriptions'],
  },
  {
    name: 'TCGPlayer',
    bestFor: 'Raw Pokemon/TCG singles, bulk inventory',
    fees: '10.25% + $0.30 per sale (standard)',
    speed: '1-7 days (fixed price)',
    effort: 'Low-Medium — standardized listings',
    pros: ['Lower fees than eBay', 'Standardized condition grades simplify listing', 'Cart optimizer drives traffic to competitive sellers', 'TCGPlayer Direct handles shipping for you'],
    cons: ['Limited sports card market', 'No auction format', 'Market price competition can drive margins thin', 'Direct program competes with your listings'],
  },
  {
    name: 'COMC (Check Out My Cards)',
    bestFor: 'Mid-range cards ($5-$500), hands-off selling',
    fees: '5% commission (minimum $0.25) + shipping to COMC',
    speed: 'Slow — 2-8 weeks processing, then wait for buyer',
    effort: 'Very low — ship once, COMC handles everything',
    pros: ['Lowest effective commission for many cards', 'COMC photographs, stores, and ships for you', 'Port to eBay option for dual listing', 'No individual shipping hassle'],
    cons: ['Slow intake processing', 'Upfront shipping cost to COMC', 'Less control over pricing and timing', 'Best for patient sellers'],
  },
  {
    name: 'Local Card Shop (LCS)',
    bestFor: 'Quick cash, bulk lots, cards under $20',
    fees: '0% commission (but 40-60% of market value offered)',
    speed: 'Instant',
    effort: 'Very low — walk in, walk out',
    pros: ['Immediate cash', 'No shipping, no fees, no hassle', 'Can negotiate in person', 'Good for bulk/junk wax liquidation'],
    cons: ['Typically offered 40-60% of market value', 'Limited by shop\'s buying needs', 'No price transparency', 'Varies wildly by shop'],
  },
  {
    name: 'Goldin / Heritage / PWCC',
    bestFor: 'Premium cards worth $1,000+',
    fees: '15-20% seller commission',
    speed: '30-90 days (auction cycle)',
    effort: 'Low — consignment, they handle everything',
    pros: ['Access to wealthy collector audience', 'Professional marketing and presentation', 'Authenticated and verified lots', 'Record-setting sales happen here'],
    cons: ['High fees (15-20%)', 'Minimum value thresholds ($200-$1,000+)', 'Long timeline from consignment to payment', 'Not viable for mid-range cards'],
  },
];

const shippingTips = [
  { title: 'Penny sleeve + top loader + team bag', detail: 'The minimum protection for any card over $5. Place the card in a penny sleeve, then a semi-rigid top loader, then seal in a resealable team bag.' },
  { title: 'Tape the top loader shut (but not on the card)', detail: 'Use painters tape or washi tape across the top of the top loader. NEVER let tape touch the card or penny sleeve. Buyers hate sticky residue.' },
  { title: 'Sandwich between cardboard in a bubble mailer', detail: 'For cards under $50: PWE (plain white envelope) with non-machinable stamp works. Over $50: bubble mailer with tracking.' },
  { title: 'Always add tracking for cards over $50', detail: 'eBay buyer protection strongly favors buyers without tracking. USPS First Class with tracking is ~$4. Worth every penny.' },
  { title: 'Insure anything over $250', detail: 'USPS Priority Mail includes $50 insurance. For higher value, add insurance through USPS, Pirate Ship, or a third-party provider.' },
  { title: 'Ship within 1-2 business days', detail: 'Fast shipping gets positive feedback and repeat buyers. Print labels from home using Pirate Ship (free) for discounted USPS rates.' },
];

const faqItems = [
  {
    question: 'How much are my sports cards worth?',
    answer: 'The most reliable way to price cards is eBay "sold listings" — filter by your exact card, grade, and condition. TCGPlayer Market Price works for raw TCG cards. Book values (Beckett) are outdated and unreliable for most cards. CardVault provides estimated values based on recent market data.',
  },
  {
    question: 'Should I grade my cards before selling?',
    answer: 'Grade before selling IF: the card is worth $100+ raw AND likely to receive a 9 or 10 grade AND the PSA/BGS premium for that grade exceeds the grading cost + wait time. For cards under $50 raw, grading usually doesn\'t make financial sense unless you\'re building a long-term collection.',
  },
  {
    question: 'What\'s the best day to end an eBay auction?',
    answer: 'Sunday evenings (7-9 PM EST) consistently produce the highest final auction prices for sports cards. Avoid ending auctions on Friday or Saturday nights when collectors are out. 7-day auctions starting on Sunday morning capture a full week of bidding activity.',
  },
  {
    question: 'How do I sell a large collection at once?',
    answer: 'Options ranked by return: (1) Cherry-pick the top 20-30 cards and sell individually on eBay, (2) Sell mid-range cards in lots by player/team/set on eBay, (3) Consign to COMC for hands-off selling, (4) Sell the remaining bulk to a local card shop. Avoid selling a large collection as one lot — you leave significant money on the table.',
  },
  {
    question: 'Do I need to pay taxes on card sales?',
    answer: 'In the US, eBay and other platforms report sales over $600/year to the IRS via 1099-K. Cards held over one year qualify for long-term capital gains rates. Keep records of your purchase price (cost basis) to calculate actual profit. Consult a tax professional for significant collections.',
  },
];

export default function HowToSellCardsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: 'How to Sell Sports Cards',
        description: metadata.description as string,
        step: [
          { '@type': 'HowToStep', name: 'Research your card values', text: 'Check eBay sold listings and TCGPlayer market prices for your specific cards and grades.' },
          { '@type': 'HowToStep', name: 'Choose your selling platform', text: 'Match your cards to the right platform: eBay for graded/sports, TCGPlayer for raw TCG, COMC for hands-off, auction houses for premium.' },
          { '@type': 'HowToStep', name: 'Take quality photos', text: 'Use natural light, photograph front and back, show any defects. For eBay, 3-5 photos per listing.' },
          { '@type': 'HowToStep', name: 'Write accurate descriptions', text: 'Include card name, year, set, card number, condition, and any defects. Honesty prevents returns.' },
          { '@type': 'HowToStep', name: 'Ship safely', text: 'Penny sleeve + top loader + team bag minimum. Bubble mailer with tracking for cards over $50.' },
        ],
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map(item => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://cardvault-two.vercel.app/' },
          { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://cardvault-two.vercel.app/guides' },
          { '@type': 'ListItem', position: 3, name: 'How to Sell Cards' },
        ],
      }} />
      <Breadcrumb items={[
        { label: 'Home', href: '/' },
        { label: 'Guides', href: '/guides' },
        { label: 'How to Sell Cards' },
      ]} />

      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
          Updated April 2026
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          How to Sell Sports Cards: The Complete Guide
        </h1>
        <p className="text-gray-400 text-lg max-w-3xl leading-relaxed">
          Whether you inherited a collection, need to downsize, or want to cash in on a hot market — this guide covers every platform, fee structure, and shipping technique to maximize your return.
        </p>
      </div>

      {/* Step 1: Know Your Card Values */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-white mb-4">Step 1: Know What Your Cards Are Worth</h2>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <p className="text-gray-300 text-sm leading-relaxed mb-4">
            Before listing anything, research real market prices. Book values (Beckett) are unreliable for most cards. Use these methods instead:
          </p>
          <div className="space-y-3">
            {[
              { method: 'eBay Sold Listings', how: 'Search your exact card + grade, filter by "Sold Items." This is the gold standard for graded card pricing.', icon: '1' },
              { method: 'TCGPlayer Market Price', how: 'For raw Pokemon and TCG singles, TCGPlayer\'s algorithmically-set Market Price is the most accurate reference.', icon: '2' },
              { method: 'CardVault Price Guide', how: 'Search any card on CardVault for estimated value ranges by grade, with links to verify on eBay.', icon: '3' },
              { method: 'Auction House Archives', how: 'For premium cards ($1,000+), check Goldin and Heritage Auctions past results for comparable sales.', icon: '4' },
            ].map(item => (
              <div key={item.method} className="flex gap-4 bg-gray-800/40 rounded-xl p-4">
                <span className="text-emerald-400 font-bold text-lg shrink-0 w-8 text-center">{item.icon}</span>
                <div>
                  <p className="text-white font-semibold text-sm">{item.method}</p>
                  <p className="text-gray-400 text-sm mt-0.5">{item.how}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Step 2: Choose Your Platform */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-white mb-4">Step 2: Choose the Right Selling Platform</h2>
        <div className="space-y-6">
          {platforms.map(p => (
            <div key={p.name} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                <h3 className="text-xl font-bold text-white">{p.name}</h3>
                <span className="text-xs font-medium px-2.5 py-1 bg-gray-800 text-gray-300 rounded-full">{p.bestFor}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div className="bg-gray-800/40 rounded-lg p-3">
                  <p className="text-gray-500 text-xs uppercase tracking-wide">Fees</p>
                  <p className="text-white text-sm font-medium mt-0.5">{p.fees}</p>
                </div>
                <div className="bg-gray-800/40 rounded-lg p-3">
                  <p className="text-gray-500 text-xs uppercase tracking-wide">Speed to Sale</p>
                  <p className="text-white text-sm font-medium mt-0.5">{p.speed}</p>
                </div>
                <div className="bg-gray-800/40 rounded-lg p-3">
                  <p className="text-gray-500 text-xs uppercase tracking-wide">Effort Level</p>
                  <p className="text-white text-sm font-medium mt-0.5">{p.effort}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-white font-semibold text-xs uppercase tracking-wide mb-2">Pros</h4>
                  <ul className="space-y-1">
                    {p.pros.map(pro => (
                      <li key={pro} className="text-gray-300 text-sm flex gap-2"><span className="text-emerald-400 shrink-0">+</span>{pro}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-semibold text-xs uppercase tracking-wide mb-2">Cons</h4>
                  <ul className="space-y-1">
                    {p.cons.map(con => (
                      <li key={con} className="text-gray-300 text-sm flex gap-2"><span className="text-red-400 shrink-0">-</span>{con}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Step 3: Shipping */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-white mb-4">Step 3: Ship Cards Safely</h2>
        <div className="space-y-3">
          {shippingTips.map((tip, i) => (
            <div key={tip.title} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex gap-4">
              <span className="text-emerald-400 font-bold text-lg shrink-0 w-8 text-center">{i + 1}</span>
              <div>
                <p className="text-white font-semibold text-sm">{tip.title}</p>
                <p className="text-gray-400 text-sm mt-0.5">{tip.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map(item => (
            <div key={item.question} className="border border-gray-800 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-2">{item.question}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Related */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-white mb-4">Related Guides</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { href: '/guides/how-to-read-price-data', title: 'How to Read Card Price Data', desc: 'Understand eBay sold comps, book value, and market price' },
            { href: '/guides/tcgplayer-vs-ebay', title: 'TCGPlayer vs eBay', desc: 'Detailed platform comparison for buyers and sellers' },
            { href: '/guides/psa-vs-bgs-vs-cgc', title: 'PSA vs BGS vs CGC', desc: 'Should you grade before selling?' },
            { href: '/guides/when-to-grade-your-cards', title: 'When to Grade Your Cards', desc: 'Calculate if grading makes financial sense' },
            { href: '/tools', title: 'Card Price Checker', desc: 'Look up estimated values for any card' },
          ].map(link => (
            <Link key={link.href} href={link.href} className="group block border border-gray-800 rounded-xl p-4 hover:border-emerald-500/40 transition-colors">
              <p className="text-white font-semibold text-sm group-hover:text-emerald-400 transition-colors">{link.title}</p>
              <p className="text-gray-500 text-xs mt-1">{link.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="flex justify-between items-center pt-8 border-t border-gray-800">
        <Link href="/guides" className="text-gray-400 hover:text-white text-sm flex items-center gap-1 transition-colors">
          <span>&#8592;</span> All Guides
        </Link>
        <Link href="/guides/best-rookie-cards-2026" className="text-gray-400 hover:text-white text-sm flex items-center gap-1 transition-colors">
          Best Rookie Cards 2026 <span>&#8594;</span>
        </Link>
      </div>
    </div>
  );
}
