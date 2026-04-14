import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import MarketDashboard from './MarketDashboard';

export const metadata: Metadata = {
  title: 'Real-Time Market Dashboard — Card Price Tracker & Market Indices',
  description: 'Free sports card market dashboard. Track card market indices by sport, top gainers and losers, volume leaders, era performance, and live market alerts. The Bloomberg Terminal for card collectors.',
  openGraph: {
    title: 'Real-Time Market Dashboard — CardVault',
    description: 'Track card market indices, top movers, volume leaders, and live alerts. The Bloomberg Terminal for card collectors.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Real-Time Market Dashboard — CardVault',
    description: 'Card market indices, movers, volume, and alerts. Updated daily.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Market Dashboard' },
];

const faqItems = [
  {
    question: 'What does the Market Dashboard track?',
    answer: 'The Market Dashboard tracks four sport-specific market indices (Baseball, Basketball, Football, Hockey), daily top gainers and losers, volume leaders, era performance heatmaps (Pre-War through Ultra-Modern), and live market alerts. It provides a Bloomberg Terminal-style view of the card collecting market.',
  },
  {
    question: 'How are the sport indices calculated?',
    answer: 'Each sport index is calculated from the aggregate estimated values of all tracked cards in that sport, weighted by rarity, grade, and recent market activity. The 14-day sparkline shows recent trend direction. These are estimated indices based on market patterns, not real-time exchange data.',
  },
  {
    question: 'How often is the dashboard updated?',
    answer: 'The free tier updates daily. Market movers, volume leaders, and alerts refresh each day based on the latest market activity patterns. A Pro tier with real-time updates, custom alerts, and advanced analytics is planned.',
  },
  {
    question: 'What do the era performance heatmaps show?',
    answer: 'The era heatmap breaks the card market into five periods: Pre-War (pre-1945), Vintage (1946-1979), Junk Wax (1980-1994), Modern (1995-2019), and Ultra-Modern (2020+). Each shows the estimated price change for cards in that era, helping collectors identify which periods are heating up or cooling down.',
  },
  {
    question: 'Can I get alerts for specific cards?',
    answer: 'Currently the dashboard shows market-wide alerts. For card-specific tracking, use the Price Watchlist tool which lets you track individual cards and see 7-day price trends. Custom alert rules with push notifications are planned for the Pro tier.',
  },
];

export default function MarketDashboardPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Real-Time Market Dashboard — CardVault',
        description: 'Free sports card market dashboard with indices, movers, volume leaders, and live alerts.',
        url: 'https://cardvault-two.vercel.app/tools/market-dashboard',
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
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Updated daily &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Real-Time Market Dashboard</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          The Bloomberg Terminal for card collectors. Track market indices by sport, top movers, volume leaders, era trends, and live market alerts — all in one view.
        </p>
      </div>

      <MarketDashboard />

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

      {/* Related Tools */}
      <section className="mt-10">
        <h2 className="text-lg font-bold text-white mb-4">Related Tools</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <Link href="/market-movers" className="p-4 bg-gray-900/40 border border-gray-800 rounded-xl hover:border-gray-600 transition-colors">
            <h3 className="text-sm font-semibold text-white">Daily Movers</h3>
            <p className="text-xs text-gray-400 mt-1">Top gainers, losers, and most-searched cards today.</p>
          </Link>
          <Link href="/tools/watchlist" className="p-4 bg-gray-900/40 border border-gray-800 rounded-xl hover:border-gray-600 transition-colors">
            <h3 className="text-sm font-semibold text-white">Price Watchlist</h3>
            <p className="text-xs text-gray-400 mt-1">Track specific cards with 7-day trends and alerts.</p>
          </Link>
          <Link href="/market-report" className="p-4 bg-gray-900/40 border border-gray-800 rounded-xl hover:border-gray-600 transition-colors">
            <h3 className="text-sm font-semibold text-white">Weekly Report</h3>
            <p className="text-xs text-gray-400 mt-1">In-depth weekly analysis of market trends.</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
