import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import TradingSimClient from './TradingSimClient';

export const metadata: Metadata = {
  title: 'Card Trading Simulator — Buy & Sell Cards Over 7 Days | CardVault',
  description: 'Free card trading simulator. Start with $500, buy and sell from 20 real sports cards over 7 simulated market days. Track your P&L, maximize your portfolio, and earn a grade. New market daily.',
  openGraph: {
    title: 'Card Trading Simulator — CardVault',
    description: 'Start with $500. Buy and sell cards over 7 days. Can you beat the market?',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Trading Simulator — CardVault',
    description: 'Buy and sell cards over 7 simulated days. Start with $500. Maximize your returns.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/my-hub' },
  { label: 'Trading Simulator' },
];

const faqItems = [
  {
    question: 'How does the trading simulator work?',
    answer: 'You start with $500 in virtual cash and access to a market of 20 real sports cards. Prices change each day over 7 simulated days. Buy low, sell high, and try to maximize your total portfolio value by the end of day 7.',
  },
  {
    question: 'Are the prices real?',
    answer: 'Base prices come from real eBay sold data for each card. The daily price movements are simulated using realistic volatility ranges (4-12% daily swings) based on actual card market patterns.',
  },
  {
    question: 'Does the market change every day?',
    answer: 'Yes! A new set of 20 cards and new price movements are generated each real-world day. Everyone who plays on the same day gets the same market, so you can compare strategies with friends.',
  },
  {
    question: 'What do the grades mean?',
    answer: 'Your grade is based on total return: S (20%+) = Wall Street Wolf, A (10-20%) = Savvy Flipper, B (5-10%) = Smart Collector, C (0-5%) = Break Even, D (-10 to 0%) = Learning Curve, F (below -10%) = Market Tuition.',
  },
  {
    question: 'Can I play multiple times?',
    answer: 'Yes, you can play as many times as you want each day. The market stays the same within a day, so you can refine your strategy. Your best score is saved locally.',
  },
];

export default function TradingSimPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Trading Simulator',
        description: 'Free card trading simulator. Buy and sell sports cards over 7 simulated market days.',
        url: 'https://cardvault-two.vercel.app/trading-sim',
        applicationCategory: 'GameApplication',
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

      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-blue-950/60 border border-blue-800/50 text-blue-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
          New market daily &middot; Free to play
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Trading Simulator</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Start with $500. Buy and sell from 20 real cards over 7 simulated market days. Track your P&amp;L and try to beat the market.
        </p>
      </div>

      <TradingSimClient />

      {/* FAQ */}
      <section className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <details key={i} className="group bg-gray-900/40 border border-gray-800 rounded-xl">
              <summary className="p-4 cursor-pointer text-white font-medium text-sm flex justify-between items-center">
                {item.question}
                <span className="text-gray-500 group-open:rotate-45 transition-transform text-lg">+</span>
              </summary>
              <div className="px-4 pb-4">
                <p className="text-sm text-gray-400 leading-relaxed">{item.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Related */}
      <section className="mt-10">
        <h2 className="text-lg font-bold text-white mb-4">Related</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <Link href="/tools/portfolio" className="p-4 bg-gray-900/40 border border-gray-800 rounded-xl hover:border-gray-600 transition-colors">
            <h3 className="text-sm font-semibold text-white">Fantasy Portfolio</h3>
            <p className="text-xs text-gray-400 mt-1">Draft 5 cards, track 7-day performance.</p>
          </Link>
          <Link href="/card-catalysts" className="p-4 bg-gray-900/40 border border-gray-800 rounded-xl hover:border-gray-600 transition-colors">
            <h3 className="text-sm font-semibold text-white">Price Catalysts</h3>
            <p className="text-xs text-gray-400 mt-1">Events that move card prices.</p>
          </Link>
          <Link href="/card-battle" className="p-4 bg-gray-900/40 border border-gray-800 rounded-xl hover:border-gray-600 transition-colors">
            <h3 className="text-sm font-semibold text-white">Card Battles</h3>
            <p className="text-xs text-gray-400 mt-1">Stat-based card combat with real data.</p>
          </Link>
          <Link href="/tools/flip-calc" className="p-4 bg-gray-900/40 border border-gray-800 rounded-xl hover:border-gray-600 transition-colors">
            <h3 className="text-sm font-semibold text-white">Flip Profit Calculator</h3>
            <p className="text-xs text-gray-400 mt-1">Calculate real flip profits after fees.</p>
          </Link>
          <Link href="/market-movers" className="p-4 bg-gray-900/40 border border-gray-800 rounded-xl hover:border-gray-600 transition-colors">
            <h3 className="text-sm font-semibold text-white">Market Movers</h3>
            <p className="text-xs text-gray-400 mt-1">Today&#39;s biggest card price changes.</p>
          </Link>
          <Link href="/tools/watchlist" className="p-4 bg-gray-900/40 border border-gray-800 rounded-xl hover:border-gray-600 transition-colors">
            <h3 className="text-sm font-semibold text-white">Price Watchlist</h3>
            <p className="text-xs text-gray-400 mt-1">Track cards and get price alerts.</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
