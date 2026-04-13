import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'TCGPlayer vs eBay: Where Should You Buy and Sell Cards in 2026?',
  description: 'Honest comparison of TCGPlayer and eBay for buying and selling sports cards and Pokemon TCG. Fees, buyer protection, pricing transparency, and which platform is better for each use case.',
  keywords: ['TCGPlayer vs eBay', 'best place to buy cards', 'TCGPlayer fees', 'eBay card selling fees', 'where to sell sports cards', 'where to buy Pokemon cards'],
};

interface PlatformInfo {
  name: string;
  type: string;
  sellerFees: string;
  buyerProtection: string;
  bestForBuying: string[];
  bestForSelling: string[];
  weaknesses: string[];
  pricingModel: string;
}

const platforms: PlatformInfo[] = [
  {
    name: 'TCGPlayer',
    type: 'Dedicated TCG Marketplace',
    sellerFees: '10.25% + $0.30 per sale (standard sellers); 8.95% for Pro sellers',
    buyerProtection: 'TCGPlayer Buyer Safeguard — covers cards not as described, damaged in shipping, or not received. Refund or replacement guaranteed.',
    pricingModel: 'Market Price algorithm based on recent sales. Fixed-price listings only (no auctions). Transparent pricing with daily updates.',
    bestForBuying: [
      'Pokemon TCG singles — largest selection and most competitive pricing',
      'Comparison shopping — see prices from multiple sellers on one page',
      'Raw singles under $100 — TCGPlayer market prices are usually the lowest',
      'Buying in bulk — cart optimizer finds the cheapest way to buy from fewest sellers',
    ],
    bestForSelling: [
      'Pokemon TCG and other TCG singles with high volume',
      'Building a storefront with inventory management',
      'Sellers who want to match market pricing automatically',
    ],
    weaknesses: [
      'Limited sports card inventory compared to eBay',
      'No auction format — can\'t capture maximum value on rare cards',
      'Lower traffic for graded/high-value cards',
      'Direct program competes with your own listings',
    ],
  },
  {
    name: 'eBay',
    type: 'General Marketplace (largest card market)',
    sellerFees: '13.25% final value fee (up to $7,500) + 2.35% above $7,500. Promoted listings add 2-15% more.',
    buyerProtection: 'eBay Money Back Guarantee — covers items not as described or not received. 30-day window. Can be slow to process but comprehensive.',
    pricingModel: 'Auction or fixed-price (Buy It Now). Sold listings are the industry standard for "real market value." Most transparent pricing data in the hobby.',
    bestForBuying: [
      'Sports cards — largest selection in the world by far',
      'Graded cards (PSA, BGS, CGC) — eBay is the primary market',
      'Vintage and high-value cards — most available inventory',
      'Auction hunting — can find deals below market value',
      'Research — "sold listings" filter shows true market prices',
    ],
    bestForSelling: [
      'Sports cards of all types — highest traffic and demand',
      'Graded cards — eBay PSA 10 listings set the market price',
      'High-value or rare cards — auction format captures maximum demand',
      'Anything over $500 — eBay\'s audience for premium cards is unmatched',
    ],
    weaknesses: [
      'Higher fees than TCGPlayer (13.25% vs 10.25%)',
      'More scams and fraudulent buyers/sellers than TCGPlayer',
      'Promoted listings pressure increases effective fees',
      'Returns policy can be abused by bad-faith buyers',
      'Raw card condition descriptions are less standardized than TCGPlayer',
    ],
  },
];

const faqItems = [
  {
    question: 'Is TCGPlayer cheaper than eBay for buying cards?',
    answer: 'For raw Pokemon TCG and other TCG singles under $100, TCGPlayer is usually cheaper due to competitive seller pricing and the cart optimizer. For graded cards and sports cards, eBay often has better prices due to auction format and larger seller competition.',
  },
  {
    question: 'Which has lower seller fees — TCGPlayer or eBay?',
    answer: 'TCGPlayer charges 10.25% + $0.30 (standard) vs eBay\'s 13.25%. That means TCGPlayer saves you about 3% per sale. For a $100 card, that\'s $3 difference. For high-volume sellers, this adds up significantly.',
  },
  {
    question: 'Where should I sell my PSA graded cards?',
    answer: 'eBay is the clear winner for graded cards. eBay sold listings are the industry standard for graded card pricing, and the auction format lets you capture maximum value. COMC and MySlabs are alternatives but have lower traffic.',
  },
  {
    question: 'Is it safe to buy on TCGPlayer?',
    answer: 'Yes. TCGPlayer\'s Buyer Safeguard program covers all purchases. The platform verifies sellers and handles disputes. Condition grading for raw cards (Near Mint, Lightly Played, etc.) is more standardized than eBay. TCGPlayer Direct adds an extra layer of quality control.',
  },
  {
    question: 'What about COMC, Goldin, or other platforms?',
    answer: 'COMC (Check Out My Cards) is excellent for mid-range graded cards and consignment. Goldin Auctions specializes in high-end cards ($1,000+) and takes 20% seller fees. Heritage Auctions handles museum-quality items. For most collectors, eBay + TCGPlayer covers 90%+ of needs.',
  },
];

export default function TcgplayerVsEbayPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: metadata.title as string,
        description: metadata.description as string,
        author: { '@type': 'Organization', name: 'CardVault' },
        publisher: { '@type': 'Organization', name: 'CardVault', url: 'https://cardvault-two.vercel.app' },
        datePublished: '2026-04-13',
        dateModified: '2026-04-13',
        url: 'https://cardvault-two.vercel.app/guides/tcgplayer-vs-ebay',
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
          { '@type': 'ListItem', position: 3, name: 'TCGPlayer vs eBay' },
        ],
      }} />
      <Breadcrumb items={[
        { label: 'Home', href: '/' },
        { label: 'Guides', href: '/guides' },
        { label: 'TCGPlayer vs eBay' },
      ]} />

      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-violet-950/60 border border-violet-800/50 text-violet-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-violet-400 rounded-full" />
          Updated April 2026
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          TCGPlayer vs eBay: Where Should You Buy and Sell Cards?
        </h1>
        <p className="text-gray-400 text-lg max-w-3xl leading-relaxed">
          Both platforms serve different use cases. TCGPlayer excels at raw TCG singles with transparent pricing. eBay dominates graded cards and sports cards with the largest audience. Here is when to use each.
        </p>
      </div>

      {/* Quick verdict */}
      <div className="mb-10 bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">The Short Answer</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-emerald-950/30 border border-emerald-800/30 rounded-xl p-4">
            <p className="text-emerald-400 font-semibold text-sm mb-1">Use TCGPlayer when...</p>
            <p className="text-gray-300 text-sm">Buying raw Pokemon/TCG singles under $100. Best prices, cart optimizer, standardized condition grading.</p>
          </div>
          <div className="bg-blue-950/30 border border-blue-800/30 rounded-xl p-4">
            <p className="text-blue-400 font-semibold text-sm mb-1">Use eBay when...</p>
            <p className="text-gray-300 text-sm">Buying or selling graded cards, sports cards, anything over $500, or when you want auction format to set the market price.</p>
          </div>
        </div>
      </div>

      {/* Detailed Platform Sections */}
      {platforms.map((platform, i) => (
        <section key={platform.name} className="mb-10 rounded-2xl border border-gray-800 bg-gray-900/40 p-6 sm:p-8">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-white">{platform.name}</h2>
            <p className="text-gray-400 text-sm">{platform.type}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-900/60 rounded-xl p-4">
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-1">Seller Fees</p>
              <p className="text-white text-sm font-semibold">{platform.sellerFees}</p>
            </div>
            <div className="bg-gray-900/60 rounded-xl p-4">
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-1">Buyer Protection</p>
              <p className="text-white text-sm">{platform.buyerProtection}</p>
            </div>
          </div>

          <div className="bg-gray-900/60 rounded-xl p-4 mb-6">
            <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-1">Pricing Model</p>
            <p className="text-gray-300 text-sm">{platform.pricingModel}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <h3 className="text-white font-semibold text-sm mb-2">Best for Buying</h3>
              <ul className="space-y-1.5">
                {platform.bestForBuying.map(item => (
                  <li key={item} className="text-gray-300 text-sm flex gap-2">
                    <span className="text-emerald-400 shrink-0">+</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm mb-2">Best for Selling</h3>
              <ul className="space-y-1.5">
                {platform.bestForSelling.map(item => (
                  <li key={item} className="text-gray-300 text-sm flex gap-2">
                    <span className="text-emerald-400 shrink-0">+</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm mb-2">Weaknesses</h3>
              <ul className="space-y-1.5">
                {platform.weaknesses.map(item => (
                  <li key={item} className="text-gray-300 text-sm flex gap-2">
                    <span className="text-red-400 shrink-0">-</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ))}

      {/* Fee Comparison */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Fee Comparison: What You Actually Pay</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-3 text-gray-400 font-medium">Sale Price</th>
                <th className="text-center py-3 px-3 text-gray-400 font-medium">TCGPlayer Fee (10.25%)</th>
                <th className="text-center py-3 px-3 text-gray-400 font-medium">eBay Fee (13.25%)</th>
                <th className="text-center py-3 px-3 text-emerald-400 font-medium">You Save with TCGPlayer</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {[
                { price: '$25', tcg: '$2.86', ebay: '$3.31', save: '$0.45' },
                { price: '$100', tcg: '$10.55', ebay: '$13.25', save: '$2.70' },
                { price: '$500', tcg: '$51.55', ebay: '$66.25', save: '$14.70' },
                { price: '$1,000', tcg: '$102.80', ebay: '$132.50', save: '$29.70' },
                { price: '$5,000', tcg: '$512.80', ebay: '$662.50', save: '$149.70' },
              ].map(row => (
                <tr key={row.price} className="border-b border-gray-800/50 hover:bg-gray-800/20">
                  <td className="py-2.5 px-3 text-white font-medium">{row.price}</td>
                  <td className="py-2.5 px-3 text-center">{row.tcg}</td>
                  <td className="py-2.5 px-3 text-center">{row.ebay}</td>
                  <td className="py-2.5 px-3 text-center text-emerald-400">{row.save}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-gray-500 text-xs mt-3">Note: eBay fees include 13.25% FVF. Promoted listings, shipping costs, and payment processing may add more. TCGPlayer fees include payment processing.</p>
      </section>

      {/* FAQ Section */}
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
            { href: '/guides/how-to-read-price-data', title: 'How to Read Card Price Data', desc: 'eBay sold comps vs book value vs TCGPlayer market price' },
            { href: '/guides/investing-101', title: 'Sports Card Investing 101', desc: 'What to buy, when to sell, and how to avoid traps' },
            { href: '/guides/psa-vs-bgs-vs-cgc', title: 'PSA vs BGS vs CGC', desc: 'Which grading company for your cards' },
            { href: '/tools', title: 'Card Price Checker', desc: 'Look up any card and see estimated values' },
          ].map(link => (
            <Link key={link.href} href={link.href} className="group block border border-gray-800 rounded-xl p-4 hover:border-emerald-500/40 transition-colors">
              <p className="text-white font-semibold text-sm group-hover:text-emerald-400 transition-colors">{link.title}</p>
              <p className="text-gray-500 text-xs mt-1">{link.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Nav */}
      <div className="flex justify-between items-center pt-8 border-t border-gray-800">
        <Link href="/guides" className="text-gray-400 hover:text-white text-sm flex items-center gap-1 transition-colors">
          <span>&#8592;</span> All Guides
        </Link>
        <Link href="/guides/psa-vs-bgs-vs-cgc" className="text-gray-400 hover:text-white text-sm flex items-center gap-1 transition-colors">
          PSA vs BGS vs CGC <span>&#8594;</span>
        </Link>
      </div>
    </div>
  );
}
