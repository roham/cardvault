import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import MarketHeatmapClient from './MarketHeatmapClient';

export const metadata: Metadata = {
  title: 'Card Market Heat Map — See What Is Hot and Cold in Sports Cards | CardVault',
  description: 'Visual heat map showing which sports card segments are hot, warm, or cold right now. Compare by sport, era, value tier, and card type. Updated daily with data from 5,900+ cards across all four major sports.',
  openGraph: {
    title: 'Card Market Heat Map — CardVault',
    description: 'See which card segments are hot and cold. Visual heat map across sports, eras, and value tiers.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Market Heat Map — CardVault',
    description: 'Visual market temperature for every sports card segment. Free daily updates.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Market Heat Map' },
];

const faqItems = [
  {
    question: 'What is the Card Market Heat Map?',
    answer: 'The Card Market Heat Map is a visual dashboard that shows the relative market temperature of every sports card segment. It cross-references sport (baseball, basketball, football, hockey) against era, value tier, or card type to create a color-coded grid. Hot segments (red) have high demand signals, cold segments (blue) have low activity. The temperature updates daily.',
  },
  {
    question: 'How is the temperature calculated?',
    answer: 'Each segment temperature is based on four factors: card count in the segment (more cards = more collector interest), average card value (higher values = premium demand), rookie card percentage (more rookies = trending growth), and seasonal factors that shift daily. Temperatures range from -100 (coldest) to +100 (hottest).',
  },
  {
    question: 'What do the different views show?',
    answer: 'Sport x Era shows market heat by sport and time period (Pre-War through Ultra-Modern). Sport x Value Tier shows which price ranges are hottest per sport. Era x Card Type compares rookie cards vs base cards across different time periods. Each view reveals different market dynamics — use them together for the full picture.',
  },
  {
    question: 'Should I buy cards in hot or cold segments?',
    answer: 'It depends on your strategy. Flippers and dealers want hot segments where cards move quickly. Investors and value buyers often target cold segments where prices are depressed but fundamentals are strong. The heat map shows market sentiment, not intrinsic value — sometimes the best buys are in the coldest segments.',
  },
  {
    question: 'How often does the heat map update?',
    answer: 'The heat map updates daily with fresh market temperature calculations. Seasonal factors shift each day, reflecting real-world events like the NFL Draft (football cards heat up), MLB Opening Day (baseball), NBA Playoffs (basketball), and NHL Stanley Cup (hockey). Long-term trends are visible when you check back regularly.',
  },
];

export default function MarketHeatmapPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Market Heat Map',
        description: 'Visual heat map showing market temperature across sports card segments by sport, era, value tier, and card type.',
        url: 'https://cardvault-two.vercel.app/market-heatmap',
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

      <Breadcrumb items={breadcrumbs} />

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-red-950/60 border border-red-800/50 text-red-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
          Updated Daily - 3 Views - 5,900+ Cards Analyzed
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Market Heat Map</h1>
        <p className="text-gray-400 text-lg">
          See what is hot and cold in sports cards right now. A visual temperature grid across sports, eras, value tiers, and card types — updated daily.
        </p>
      </div>

      <MarketHeatmapClient />

      {/* FAQ section */}
      <section className="mt-16 border-t border-gray-800 pt-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map(f => (
            <details key={f.question} className="group bg-gray-900 border border-gray-800 rounded-xl">
              <summary className="px-5 py-4 text-white font-medium cursor-pointer hover:text-red-400 transition-colors">
                {f.question}
              </summary>
              <div className="px-5 pb-4 text-gray-400 text-sm">
                {f.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Internal Links */}
      <section className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Related Market Tools</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/market-movers', label: 'Market Movers', desc: 'Daily price gainers and losers' },
            { href: '/market-pulse', label: 'Market Pulse', desc: 'Real-time market activity' },
            { href: '/tools/seasonality', label: 'Seasonality Guide', desc: 'When to buy and sell each sport' },
            { href: '/data-room', label: 'Market Data Room', desc: 'Comprehensive market statistics' },
            { href: '/tools/trend-predictor', label: 'Trend Predictor', desc: 'AI-powered price forecasting' },
            { href: '/tools/investment-calc', label: 'Investment Calculator', desc: 'ROI and growth projections' },
          ].map(link => (
            <Link key={link.href} href={link.href} className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-red-700 transition-colors group">
              <div className="text-white text-sm font-medium group-hover:text-red-400 transition-colors">{link.label}</div>
              <div className="text-gray-500 text-xs mt-1">{link.desc}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
