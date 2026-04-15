import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import MarketSentimentClient from './MarketSentimentClient';

export const metadata: Metadata = {
  title: 'Market Sentiment Index — Fear & Greed for Card Collectors | CardVault',
  description: 'Free sports card market sentiment index. See whether the card market is in Fear or Greed mode across baseball, basketball, football, and hockey. Historical sentiment chart, sport breakdowns, and collector confidence signals.',
  openGraph: {
    title: 'Market Sentiment Index — CardVault',
    description: 'Is the card market in Fear or Greed? Real-time sentiment tracking across all sports.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Market Sentiment Index — CardVault',
    description: 'Fear & Greed index for sports card collectors. Track market sentiment daily.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'News', href: '/news' },
  { label: 'Market Sentiment' },
];

const faqItems = [
  {
    question: 'What is the Market Sentiment Index?',
    answer: 'The Market Sentiment Index is a Fear & Greed gauge for the sports card market. It combines multiple signals — price momentum, volume activity, market breadth, and sector rotation — into a single 0-100 score. Scores below 30 indicate Fear (potential buying opportunity), 30-70 is Neutral, and above 70 indicates Greed (potential overheating).',
  },
  {
    question: 'How is market sentiment calculated?',
    answer: 'We analyze four key factors: Price Momentum (are more cards going up or down?), Volume Signal (is trading activity above or below average?), Market Breadth (how many sports are participating in the move?), and Sector Rotation (which card eras and sports are leading or lagging?). Each factor is weighted and combined into the overall score.',
  },
  {
    question: 'How often is sentiment updated?',
    answer: 'The sentiment index refreshes daily at midnight. Historical data shows the past 30 days of sentiment readings so you can spot trends — is the market getting more fearful or more greedy over time?',
  },
  {
    question: 'Should I buy when the index shows Fear?',
    answer: 'Warren Buffett famously said "be greedy when others are fearful." In the card market, periods of extreme fear often present buying opportunities — but not always. Use the index as one signal among many. Combine it with your own research, budget, and collecting goals.',
  },
  {
    question: 'Which sports tend to be most volatile?',
    answer: 'Football cards tend to show the most seasonal volatility — sentiment spikes during draft season and playoffs, then cools in the offseason. Basketball follows the NBA season closely. Baseball has the steadiest sentiment year-round. Hockey cards are the most niche and can swing on breakout rookie performances.',
  },
];

export default function MarketSentimentPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Market Sentiment Index — CardVault',
        description: 'Fear & Greed index for the sports card market. Track sentiment across baseball, basketball, football, and hockey.',
        url: 'https://cardvault-two.vercel.app/market-sentiment',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Any',
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
        <div className="inline-flex items-center gap-2 bg-purple-950/60 border border-purple-800/50 text-purple-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          Updated Daily
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Market Sentiment Index
        </h1>
        <p className="text-gray-400 text-lg">
          Fear &amp; Greed gauge for sports card collectors. Is the market overheating or undervalued?
        </p>
      </div>

      <MarketSentimentClient />

      {/* FAQ Section */}
      <div className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((item, i) => (
            <div key={i}>
              <h3 className="text-white font-semibold mb-2">{item.question}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Internal Links */}
      <div className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-lg font-bold text-white mb-4">Related Tools &amp; Analysis</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Link href="/tools/market-dashboard" className="bg-gray-900 border border-gray-800 rounded-lg p-3 hover:border-gray-600 transition-colors">
            <div className="text-sm font-medium text-white">Market Dashboard</div>
            <div className="text-xs text-gray-500">Indices &amp; movers</div>
          </Link>
          <Link href="/market-analysis" className="bg-gray-900 border border-gray-800 rounded-lg p-3 hover:border-gray-600 transition-colors">
            <div className="text-sm font-medium text-white">Daily Analysis</div>
            <div className="text-xs text-gray-500">What moved &amp; why</div>
          </Link>
          <Link href="/market-movers" className="bg-gray-900 border border-gray-800 rounded-lg p-3 hover:border-gray-600 transition-colors">
            <div className="text-sm font-medium text-white">Market Movers</div>
            <div className="text-xs text-gray-500">Top gainers &amp; losers</div>
          </Link>
          <Link href="/card-catalysts" className="bg-gray-900 border border-gray-800 rounded-lg p-3 hover:border-gray-600 transition-colors">
            <div className="text-sm font-medium text-white">Price Catalysts</div>
            <div className="text-xs text-gray-500">Event-driven intel</div>
          </Link>
          <Link href="/tools/investment-calc" className="bg-gray-900 border border-gray-800 rounded-lg p-3 hover:border-gray-600 transition-colors">
            <div className="text-sm font-medium text-white">Investment Calc</div>
            <div className="text-xs text-gray-500">ROI projections</div>
          </Link>
          <Link href="/news" className="bg-gray-900 border border-gray-800 rounded-lg p-3 hover:border-gray-600 transition-colors">
            <div className="text-sm font-medium text-white">News Feed</div>
            <div className="text-xs text-gray-500">Latest updates</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
