import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import MarketSimClient from './MarketSimClient';

export const metadata: Metadata = {
  title: 'Card Market Simulator — Trade Cards Like Stocks',
  description: 'Free card market simulation game. Start with $10,000, buy and sell cards as prices fluctuate based on real-world events. Track your portfolio value, beat the market, and learn card investing. Uses real card data from 6,000+ sports cards.',
  openGraph: {
    title: 'Card Market Simulator — CardVault',
    description: 'Trade cards like stocks. $10K virtual balance. Beat the market.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Market Simulator — CardVault',
    description: 'Start with $10K. Buy/sell cards. Beat the market. Free game.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Card Market Simulator' },
];

const faqItems = [
  {
    question: 'How does the Card Market Simulator work?',
    answer: 'You start with a virtual $10,000 balance. The market shows 20 real sports cards with current prices. Each round simulates a "day" where news events cause prices to move — player injuries drop prices, awards raise them, draft picks create spikes. Buy low, sell high, and grow your portfolio. Your goal is to beat the market benchmark over 10 rounds.',
  },
  {
    question: 'Are the price movements realistic?',
    answer: 'Price movements are modeled on real hobby market patterns. Rookie cards of hot players spike 20-50% on positive news. Injuries cause 10-30% drops. Award announcements (MVP, ROY) create 15-40% increases. Seasonal patterns like the NFL Draft and baseball opening day are reflected. The volatility is compressed for gameplay but directionally accurate.',
  },
  {
    question: 'What skills does the Card Market Simulator teach?',
    answer: 'The simulator teaches: buy-the-dip mentality (buying after price drops), selling into hype (selling during peaks), portfolio diversification (not going all-in on one card), and understanding catalysts (what events move card prices). These are the same skills that successful card investors use in the real market.',
  },
  {
    question: 'Can I use the Card Market Simulator to practice real card investing?',
    answer: 'Yes — the simulator uses real cards with market-accurate pricing and realistic news catalysts. While the game compresses time (each round = 1 week of market movement), the principles translate directly. Players who consistently beat the benchmark in the sim tend to have the instincts needed for real card investing.',
  },
];

export default function MarketSimPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Market Simulator',
        description: 'Trade cards like stocks. Start with $10,000 virtual balance, buy and sell as prices fluctuate. Learn card investing.',
        url: 'https://cardvault-two.vercel.app/card-market-simulator',
        applicationCategory: 'GameApplication',
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
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          $10K Virtual Balance &middot; Real Cards &middot; Market Events &middot; Portfolio Tracking &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Market Simulator</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Trade cards like stocks. Start with $10,000, buy and sell as market events move prices.
          Learn to spot dips, sell into hype, and beat the benchmark. Real cards, realistic movements.
        </p>
      </div>

      <MarketSimClient />

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
            { href: '/tools/portfolio', label: 'Fantasy Portfolio', icon: '📈' },
            { href: '/tools/investment-calc', label: 'Investment Calculator', icon: '📊' },
            { href: '/tools/flip-calc', label: 'Flip Profit Calculator', icon: '💰' },
            { href: '/market-movers', label: 'Market Movers', icon: '📈' },
            { href: '/tools/watchlist', label: 'Price Watchlist', icon: '👀' },
            { href: '/card-war', label: 'Card War', icon: '⚔️' },
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
