import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import HotDealsClient from './HotDealsClient';

export const metadata: Metadata = {
  title: 'Hot Card Deals — Daily Price Drops & Undervalued Listings | CardVault',
  description: 'Find the best deals on sports cards today. Daily feed of price drops, undervalued listings, flash sales, and buy-the-dip opportunities across baseball, basketball, football, and hockey cards.',
  openGraph: {
    title: 'Hot Card Deals — CardVault',
    description: 'Daily feed of sports card deals, price drops, and undervalued listings.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Hot Card Deals — CardVault',
    description: 'Find undervalued sports cards and price drops today.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Market', href: '/market-movers' },
  { label: 'Hot Deals' },
];

const faqItems = [
  {
    question: 'How are the deals found?',
    answer: 'Our system scans card listings and compares them against recent sold data to identify cards listed significantly below market value. Deals are refreshed daily and categorized by type: price drops, undervalued listings, flash sales, hot buys, and buy-the-dip opportunities.',
  },
  {
    question: 'What does "Buy the Dip" mean for cards?',
    answer: 'Buy the dip refers to purchasing a card when its price has temporarily dropped due to a short-term event — like a player injury, a bad game, or off-season demand decline. If you believe the player will recover or demand will return, buying during the dip lets you acquire cards below their long-term value.',
  },
  {
    question: 'How do I verify a deal is real?',
    answer: 'Always check eBay sold listings (use the "sold" filter) for the same card in the same condition. Compare the deal price against the last 3-5 sales. If the deal is 20% or more below recent comps, it is likely a genuine deal. Be cautious of deals that seem too good to be true — check seller reputation and card authenticity.',
  },
  {
    question: 'What is the best time to find card deals?',
    answer: 'The best deals are typically found during off-seasons (football cards in summer, basketball in fall), late at night when fewer buyers are watching auctions, and immediately after negative news like player injuries. Sunday nights and Monday mornings tend to have the freshest listings from weekend card show inventory.',
  },
  {
    question: 'Are these real listings I can buy?',
    answer: 'The deals shown are simulated based on real market data and pricing patterns. They represent the types of deals that appear daily across eBay, COMC, Mercari, and card show tables. Use the eBay search links to find actual current listings for any card that interests you.',
  },
];

export default function HotDealsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Hot Card Deals',
        description: 'Daily feed of sports card deals, price drops, and undervalued listings across all four major sports.',
        url: 'https://cardvault-two.vercel.app/hot-deals',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      }} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map(f => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: { '@type': 'Answer', text: f.answer },
        })),
      }} />

      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
          Hot Card Deals
        </h1>
        <p className="text-gray-400 text-lg">
          Daily price drops, undervalued listings, and buying opportunities across all sports.
        </p>
      </div>

      <HotDealsClient />

      {/* FAQ */}
      <section className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq) => (
            <details key={faq.question} className="group bg-gray-800/30 border border-gray-700/50 rounded-lg">
              <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-gray-200 hover:text-white transition-colors">
                {faq.question}
              </summary>
              <div className="px-4 pb-3 text-sm text-gray-400 leading-relaxed">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        <Link href="/market-movers" className="text-blue-400 hover:text-blue-300">Market Movers</Link>
        <span className="text-gray-700">|</span>
        <Link href="/tools/flip-calc" className="text-blue-400 hover:text-blue-300">Flip Calculator</Link>
        <span className="text-gray-700">|</span>
        <Link href="/tools/watchlist" className="text-blue-400 hover:text-blue-300">Price Watchlist</Link>
        <span className="text-gray-700">|</span>
        <Link href="/tools/quick-flip" className="text-blue-400 hover:text-blue-300">Quick-Flip Scorer</Link>
        <span className="text-gray-700">|</span>
        <Link href="/market-report" className="text-blue-400 hover:text-blue-300">Market Report</Link>
      </div>
    </div>
  );
}
