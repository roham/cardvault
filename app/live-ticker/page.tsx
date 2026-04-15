import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import LiveTickerClient from './LiveTickerClient';

export const metadata: Metadata = {
  title: 'Live Card Price Ticker — Real-Time Market Movement | CardVault',
  description: 'Free live card price ticker. Watch card prices move in real time with a scrolling ticker, trending cards, biggest movers, and market alerts. Like a stock ticker for sports cards. Updated continuously.',
  openGraph: {
    title: 'Live Card Price Ticker — CardVault',
    description: 'Watch card prices move in real time. Scrolling ticker, trending cards, biggest movers.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Live Card Price Ticker — CardVault',
    description: 'Real-time card price ticker. Biggest movers, trending cards, market alerts.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Live Experience' },
  { label: 'Price Ticker' },
];

const faqItems = [
  {
    question: 'How does the live price ticker work?',
    answer: 'The ticker displays simulated real-time price movements based on our database of 5,900+ cards. Price changes are calculated using a deterministic algorithm that factors in card popularity, seasonal trends, and player performance. The ticker updates every few seconds to simulate live market activity.',
  },
  {
    question: 'Are these real-time prices?',
    answer: 'The price movements shown are simulated estimates based on market data and trends. They represent realistic directional movements but are not live feeds from any exchange. For actual current prices, check recent eBay sold listings for any specific card.',
  },
  {
    question: 'What do the arrows and colors mean?',
    answer: 'Green arrows (up) indicate a price increase, red arrows (down) indicate a price decrease, and gray dashes indicate no significant change. The percentage shows the magnitude of the movement. Cards with larger movements appear in the "Biggest Movers" section.',
  },
];

export default function LiveTickerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Live Card Price Ticker',
        description: 'Real-time scrolling card price ticker with trending cards, biggest movers, and market alerts.',
        url: 'https://cardvault-two.vercel.app/live-ticker',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Web',
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
        <div className="inline-flex items-center gap-2 bg-red-950/60 border border-red-800/50 text-red-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
          LIVE &middot; Scrolling Ticker &middot; Trending Cards &middot; Biggest Movers &middot; Market Alerts
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Live Card Price Ticker</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Watch card prices move in real time. A scrolling ticker shows the latest price changes,
          trending cards, and market alerts — like a Bloomberg terminal for card collectors.
        </p>
      </div>

      <LiveTickerClient />

      {/* FAQ */}
      <section className="mt-16 mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((f, i) => (
            <details key={i} className="group bg-gray-800/50 border border-gray-700 rounded-xl">
              <summary className="cursor-pointer px-6 py-4 text-white font-medium list-none flex items-center justify-between">
                {f.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform">&#9662;</span>
              </summary>
              <div className="px-6 pb-4 text-gray-400 text-sm leading-relaxed">{f.answer}</div>
            </details>
          ))}
        </div>
      </section>

      {/* Related */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-white mb-4">Related</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/market-movers', label: 'Market Movers', icon: '📈' },
            { href: '/market-pulse', label: 'Market Pulse', icon: '💓' },
            { href: '/hot-right-now', label: 'Hot Right Now', icon: '🔥' },
            { href: '/market-heatmap', label: 'Market Heat Map', icon: '🗺️' },
            { href: '/tools/watchlist', label: 'Price Watchlist', icon: '👀' },
            { href: '/market-sentiment', label: 'Market Sentiment', icon: '🎭' },
          ].map(t => (
            <Link
              key={t.href}
              href={t.href}
              className="flex items-center gap-2 px-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-xl text-sm text-gray-300 hover:text-white transition-colors"
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
