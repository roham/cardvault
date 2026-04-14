import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import WatchlistClient from './WatchlistClient';

export const metadata: Metadata = {
  title: 'Price Watchlist — Track Card Prices & Get Alerts',
  description: 'Free card price watchlist. Track sports cards you want to buy or sell, see 7-day price trends, and get alerts when cards move more than 5%. No account needed.',
  openGraph: {
    title: 'Price Watchlist — CardVault',
    description: 'Track card prices and get alerts. Watch sports cards, see 7-day trends, share your watchlist.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Price Watchlist — CardVault',
    description: 'Track card prices and get alerts when they move.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Price Watchlist' },
];

const faqItems = [
  {
    question: 'How do the price alerts work?',
    answer: 'CardVault tracks simulated 7-day price trends for every card on your watchlist. When a card moves more than 5% in either direction, it appears in your alerts banner. Prices are estimated based on recent market data patterns, not real-time feeds.',
  },
  {
    question: 'Is my watchlist saved?',
    answer: 'Your watchlist is saved in your browser automatically. You can also share it with others using the Share button, which generates a URL anyone can open to see your watchlist.',
  },
  {
    question: 'How accurate are the price trends?',
    answer: 'Price trends shown are simulated estimates based on historical market patterns. They reflect the general direction cards move based on factors like player performance, set popularity, and seasonal demand. For real-time prices, always check eBay sold listings.',
  },
  {
    question: 'How many cards can I watch?',
    answer: 'There is no limit. Add as many cards as you want to your watchlist. You can filter by sport and sort by value, name, or price change to manage large watchlists.',
  },
];

export default function WatchlistPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Price Watchlist — CardVault',
        description: 'Free card price watchlist with 7-day trend tracking and price alerts.',
        url: 'https://cardvault-two.vercel.app/tools/watchlist',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      }} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map(faq => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      }} />

      <div className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-amber-400 via-orange-400 to-red-500 bg-clip-text text-transparent mb-3">
          Price Watchlist
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Track cards you want to buy or sell. See 7-day price trends and get alerts when cards move.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          No account needed. Saved in your browser. Shareable via URL.
        </p>
      </div>

      <WatchlistClient />

      {/* FAQ */}
      <section className="mt-16 border-t border-gray-800 pt-10">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map(faq => (
            <div key={faq.question}>
              <h3 className="text-white font-semibold text-sm mb-2">{faq.question}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Related */}
      <section className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Related Tools</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <Link href="/tools/collection-value" className="block p-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-600 transition-colors">
            <h3 className="font-semibold text-white">Collection Value</h3>
            <p className="text-sm text-gray-400 mt-1">Calculate what your collection is worth.</p>
          </Link>
          <Link href="/market-movers" className="block p-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-600 transition-colors">
            <h3 className="font-semibold text-white">Market Movers</h3>
            <p className="text-sm text-gray-400 mt-1">Today&apos;s top gainers and losers.</p>
          </Link>
          <Link href="/tools/grading-roi" className="block p-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-600 transition-colors">
            <h3 className="font-semibold text-white">Grading ROI</h3>
            <p className="text-sm text-gray-400 mt-1">Is it worth grading your card?</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
