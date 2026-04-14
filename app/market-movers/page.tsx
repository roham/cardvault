import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import MarketMovers from './MarketMovers';

export const metadata: Metadata = {
  title: 'Market Movers — Card Price Trends Today',
  description: 'Daily card market trends. See which sports cards and Pokemon cards are trending up, trending down, and most searched today. Updated daily.',
  openGraph: {
    title: 'Market Movers — CardVault',
    description: 'Which cards are hot today? Daily gainers, losers, and most-searched cards across all sports and Pokemon.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Market Movers — CardVault',
    description: 'Daily card market trends. Top gainers, losers, and trending cards.',
  },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Market Movers' },
];

export default function MarketMoversPage() {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Market Movers — Card Price Trends',
        description: 'Daily card market trends showing top gainers, losers, and most-searched cards.',
        url: 'https://cardvault-two.vercel.app/market-movers',
      }} />

      <div className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-green-400 via-emerald-400 to-teal-500 bg-clip-text text-transparent mb-3">
          Market Movers
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Which cards are hot today? Track daily price trends across sports cards and Pokemon.
        </p>
        <p className="text-sm text-gray-500 mt-2">{today}</p>
      </div>

      <MarketMovers />

      {/* Related */}
      <section className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Related</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <Link href="/tools/collection-value" className="block p-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-600 transition-colors">
            <h3 className="font-semibold text-white">Collection Value</h3>
            <p className="text-sm text-gray-400 mt-1">Calculate your collection&apos;s total value.</p>
          </Link>
          <Link href="/tools/portfolio" className="block p-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-600 transition-colors">
            <h3 className="font-semibold text-white">Fantasy Portfolio</h3>
            <p className="text-sm text-gray-400 mt-1">Draft 5 cards and track their performance.</p>
          </Link>
          <Link href="/tools/watchlist" className="block p-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-600 transition-colors">
            <h3 className="font-semibold text-white">Price Watchlist</h3>
            <p className="text-sm text-gray-400 mt-1">Track cards and get price alerts.</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
