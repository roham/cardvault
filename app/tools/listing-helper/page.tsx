import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import ListingHelperClient from './ListingHelperClient';

export const metadata: Metadata = {
  title: 'eBay Listing Helper — Optimize Your Card Listings | CardVault',
  description: 'Free eBay listing optimizer for sports card sellers. Generate keyword-optimized titles, professional descriptions, pricing recommendations, and shipping settings. Compare auction vs BIN. 8,600+ cards in database.',
  alternates: { canonical: './' },
  openGraph: {
    title: 'eBay Listing Helper — Optimize Your Card Listings | CardVault',
    description: 'Generate keyword-optimized titles, professional descriptions, pricing recommendations, and shipping settings for your sports card eBay listings.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'eBay Listing Helper — CardVault',
    description: 'Free eBay listing optimizer. Keyword-optimized titles, descriptions, pricing, and shipping settings for sports cards.',
  },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'eBay Listing Helper' },
];

const faqItems = [
  {
    question: 'How does the eBay Listing Helper work?',
    answer: 'Enter your card details — player name, year, set, card number, condition, and any parallels or inserts — and the tool generates a keyword-optimized title under 80 characters, a professional description with all relevant details, a suggested price based on comparable sales, and recommended shipping settings. Everything is formatted for maximum visibility in eBay search results.',
  },
  {
    question: 'How is the suggested price calculated?',
    answer: 'Based on market data from 8,600+ cards in our database, the tool estimates a fair market value by analyzing recent comparable sales, card condition, player demand, and set popularity. The suggested price accounts for eBay fees so you can see your expected net profit. Always check recent sold listings on eBay to confirm pricing for high-value cards.',
  },
  {
    question: 'What makes a good eBay card listing title?',
    answer: 'Key details packed into 80 characters: year, brand, set name, player name, card number, parallel or insert name, and condition. Lead with the most-searched terms. Avoid filler words like "LOOK" or "HOT" — they waste characters and do not improve search ranking. Include the sport if space allows. Example: "2023 Topps Chrome Victor Wembanyama RC Refractor #201 PSA 10".',
  },
  {
    question: 'Should I auction or Buy It Now?',
    answer: 'Auction works best for high-demand cards where competitive bidding drives the price up — new releases, trending rookies, or rare parallels. Buy It Now (BIN) is better for common cards, steady-value singles, and cards where you know the market price. BIN with Best Offer gives you the best of both worlds: a firm price with room to negotiate. Most experienced sellers use BIN for 80%+ of their listings.',
  },
  {
    question: 'What shipping method is best for cards?',
    answer: 'PWE (plain white envelope) for cards under $20 — costs about $1.50 with a stamp, no tracking. BMWT (bubble mailer with tracking) for cards $20 and up — costs $4-$5 via USPS First Class. For graded slabs or high-value raw cards over $50, use a small box with tracking and insurance. Always use a penny sleeve plus top-loader for raw cards, and never ship without a rigid holder.',
  },
];

export default function ListingHelperPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'eBay Listing Helper',
        description: 'Free eBay listing optimizer for sports card sellers. Generate keyword-optimized titles, professional descriptions, pricing recommendations, and shipping settings.',
        url: 'https://cardvault-two.vercel.app/tools/listing-helper',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
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

      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Title Optimizer - Description Generator - Pricing - Shipping - Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">eBay Listing Helper</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Optimize your sports card eBay listings in seconds. Generate keyword-rich titles, professional descriptions, pricing suggestions, and shipping recommendations — all tuned for maximum visibility and sales.
        </p>
      </div>

      <ListingHelperClient />

      {/* FAQ Section */}
      <div className="mt-12 bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((item, i) => (
            <div key={i} className="border-b border-gray-700/50 pb-5 last:border-0 last:pb-0">
              <h3 className="text-white font-semibold mb-2">{item.question}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related Tools */}
      <div className="mt-8 bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Related Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link href="/tools/flip-calc" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">💵</span>
            <div>
              <div className="text-white text-sm font-medium">Flip Profit Calculator</div>
              <div className="text-gray-500 text-xs">Know your margins before you sell</div>
            </div>
          </Link>
          <Link href="/tools/flip-tracker" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">📒</span>
            <div>
              <div className="text-white text-sm font-medium">Flip Tracker</div>
              <div className="text-gray-500 text-xs">Full P&L journal for all flips</div>
            </div>
          </Link>
          <Link href="/tools/collection-value" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">💎</span>
            <div>
              <div className="text-white text-sm font-medium">Collection Value</div>
              <div className="text-gray-500 text-xs">What is your whole collection worth?</div>
            </div>
          </Link>
          <Link href="/tools/watchlist" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">👀</span>
            <div>
              <div className="text-white text-sm font-medium">Price Watchlist</div>
              <div className="text-gray-500 text-xs">Track price movements on cards you own</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
