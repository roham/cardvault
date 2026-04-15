import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardCatalystsClient from './CardCatalystsClient';

export const metadata: Metadata = {
  title: 'Card Price Catalysts — Sports Events That Move Card Values | CardVault',
  description: 'Track upcoming sports events that impact card prices. NFL Draft, NBA Playoffs, MLB All-Star Game, and more — with buy/sell/hold signals for specific cards. Free event-driven card market intelligence.',
  openGraph: {
    title: 'Card Price Catalysts — Events That Move Card Values',
    description: 'Which sports events will move card prices next? Buy, sell, and hold signals based on historical patterns.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Price Catalysts — CardVault',
    description: 'Sports events that move card prices. Buy/sell/hold signals for collectors and investors.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'News', href: '/news' },
  { label: 'Card Price Catalysts' },
];

const faqItems = [
  {
    question: 'What are card price catalysts?',
    answer: 'Card price catalysts are real-world sports events that historically cause significant price movements in the trading card market. Events like the NFL Draft, NBA Playoffs, and MLB Postseason consistently create buying opportunities and price spikes for specific cards.',
  },
  {
    question: 'How are buy/sell/hold signals determined?',
    answer: 'Signals are based on historical price patterns around similar events. For example, first-round NFL Draft picks have historically seen 40-80% price increases on their cards within 48 hours of being drafted. We combine historical patterns with current market positioning to generate signals.',
  },
  {
    question: 'How far in advance should I buy before an event?',
    answer: 'Generally, 2-4 weeks before a major event is the sweet spot. Prices often start climbing 1-2 weeks out as anticipation builds. Buying the day before is usually too late — the move has already started. After the event, prices often correct 10-20% within a week.',
  },
  {
    question: 'Are these signals guaranteed?',
    answer: 'No. Card prices are volatile and influenced by many factors beyond events — injuries, scandals, population reports, and general market sentiment all play a role. These signals are based on historical patterns and should be used as one input in your research, not as financial advice.',
  },
  {
    question: 'Which events have the biggest impact on card prices?',
    answer: 'The NFL Draft, NBA Draft, and World Series/Super Bowl consistently create the largest price movements. The NFL Draft is particularly impactful because rookie cards of top picks can spike 100-300% within days. Playoff performances also create significant moves, especially for young stars.',
  },
];

export default function CardCatalystsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Card Price Catalysts — Sports Events That Move Card Values',
        description: 'Track upcoming sports events that impact card prices with buy/sell/hold signals.',
        url: 'https://cardvault-two.vercel.app/card-catalysts',
        publisher: {
          '@type': 'Organization',
          name: 'CardVault',
          url: 'https://cardvault-two.vercel.app',
        },
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
        <div className="inline-flex items-center gap-2 bg-amber-950/60 border border-amber-800/50 text-amber-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
          Live event tracking &middot; Updated daily
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Price Catalysts</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Sports events that move card prices. Track upcoming catalysts with historical patterns and actionable buy/sell/hold signals for your collection.
        </p>
      </div>

      <CardCatalystsClient />

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

      {/* Related Pages */}
      <section className="mt-10">
        <h2 className="text-lg font-bold text-white mb-4">Related</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <Link href="/market-movers" className="p-4 bg-gray-900/40 border border-gray-800 rounded-xl hover:border-gray-600 transition-colors">
            <h3 className="text-sm font-semibold text-white">Market Movers</h3>
            <p className="text-xs text-gray-400 mt-1">Today&#39;s biggest price changes.</p>
          </Link>
          <Link href="/tools/draft-predictor" className="p-4 bg-gray-900/40 border border-gray-800 rounded-xl hover:border-gray-600 transition-colors">
            <h3 className="text-sm font-semibold text-white">Draft Night Predictor</h3>
            <p className="text-xs text-gray-400 mt-1">NFL &amp; NBA draft card spike predictions.</p>
          </Link>
          <Link href="/market-analysis" className="p-4 bg-gray-900/40 border border-gray-800 rounded-xl hover:border-gray-600 transition-colors">
            <h3 className="text-sm font-semibold text-white">Daily Market Analysis</h3>
            <p className="text-xs text-gray-400 mt-1">AI-powered daily market insights.</p>
          </Link>
          <Link href="/tools/watchlist" className="p-4 bg-gray-900/40 border border-gray-800 rounded-xl hover:border-gray-600 transition-colors">
            <h3 className="text-sm font-semibold text-white">Price Watchlist</h3>
            <p className="text-xs text-gray-400 mt-1">Track cards and set price alerts.</p>
          </Link>
          <Link href="/calendar" className="p-4 bg-gray-900/40 border border-gray-800 rounded-xl hover:border-gray-600 transition-colors">
            <h3 className="text-sm font-semibold text-white">Release Calendar</h3>
            <p className="text-xs text-gray-400 mt-1">Upcoming card product releases.</p>
          </Link>
          <Link href="/tools/portfolio" className="p-4 bg-gray-900/40 border border-gray-800 rounded-xl hover:border-gray-600 transition-colors">
            <h3 className="text-sm font-semibold text-white">Fantasy Portfolio</h3>
            <p className="text-xs text-gray-400 mt-1">Draft cards and track performance.</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
