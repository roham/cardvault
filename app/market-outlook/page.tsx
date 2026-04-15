import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import MarketOutlookClient from './MarketOutlookClient';

export const metadata: Metadata = {
  title: '2025 Card Market Outlook — Sports Card Price Predictions & Investment Guide | CardVault',
  description: 'Comprehensive 2025 sports card market outlook with quarterly predictions, sport-by-sport analysis, sector signals (buy/hold/sell), investment strategies by budget, key dates, and risk factors. Updated daily.',
  openGraph: {
    title: '2025 Card Market Outlook — Sports Card Predictions | CardVault',
    description: 'Full-year card market analysis: quarterly forecasts, sector outlook, budget strategies, and key dates for baseball, basketball, football, and hockey collectors.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '2025 Card Market Outlook | CardVault',
    description: 'Sports card market predictions for 2025 — quarterly breakdown, sector outlook, investment strategies, and key dates.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'News', href: '/news' },
  { label: '2025 Market Outlook' },
];

const faqItems = [
  {
    question: 'What is the 2025 Card Market Outlook?',
    answer: 'The 2025 Card Market Outlook is a comprehensive forward-looking analysis of the sports card market covering all four major sports (baseball, basketball, football, hockey). It includes quarterly predictions with confidence ratings, sport-by-sport forecasts with YTD returns and projections, sector-level buy/hold/sell signals for 6 market segments, investment strategies across 5 budget tiers, and a calendar of key dates that could move card prices. The outlook is updated daily with fresh picks and market confidence metrics.',
  },
  {
    question: 'How are the market predictions calculated?',
    answer: 'Market predictions are based on a combination of historical seasonal patterns, current card data from our 6,600+ card database, sport calendar analysis, and market cycle indicators. Quarterly confidence ratings factor in upcoming catalysts (draft, playoffs, holidays) weighted against risk factors (oversupply, economic headwinds, grading backlogs). These are estimated models, not real-time market data — always verify with actual sold prices on platforms like eBay before making buying decisions.',
  },
  {
    question: 'What do the sector signals (Buy, Hold, Sell, Strong Buy, Speculative) mean?',
    answer: 'Sector signals indicate our outlook for each market segment: "Strong Buy" means high confidence the sector will appreciate significantly. "Buy" means positive outlook with moderate upside. "Hold" means stable — good for existing positions but not aggressive new buying. "Speculative" means high risk with potential for large gains or losses. Each signal comes with a confidence percentage and trend direction (up, stable, volatile) to help you gauge conviction level.',
  },
  {
    question: 'How should beginners use the investment strategy guide?',
    answer: 'Start with the budget tier that matches your monthly collecting budget. The Under $25 tier focuses on volume — buying many affordable rookie cards of emerging players, knowing that 2-3 winners can make the portfolio profitable. As your budget increases, the strategies shift toward quality over quantity: numbered parallels, graded slabs, and eventually trophy cards. The key principle across all tiers: buy cards of players with upcoming catalysts (playoffs, awards, milestones) and sell into hype peaks.',
  },
  {
    question: 'Are the "Today\'s Outlook Picks" real recommendations?',
    answer: 'The daily picks are algorithmically selected rookie cards from our database that meet specific criteria (rookie status, $5-$500 value range, across all sports). They are generated using a date-seeded algorithm so everyone sees the same picks each day — great for discussion. However, they are for educational and entertainment purposes only. Always do your own research, check recent eBay sold listings, and consider your personal risk tolerance before making any purchase decisions.',
  },
];

export default function MarketOutlookPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: '2025 Card Market Outlook — Sports Card Predictions',
        description: 'Comprehensive 2025 sports card market outlook with quarterly predictions, sector signals, investment strategies, and key dates.',
        url: 'https://cardvault-two.vercel.app/market-outlook',
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
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Market Intelligence &middot; Updated Daily &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">2025 Card Market Outlook</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Where is the sports card market headed? Quarterly forecasts, sector signals, sport-by-sport analysis, and investment strategies for every budget level.
        </p>
      </div>

      <MarketOutlookClient />

      {/* FAQ */}
      <section className="mt-12 border-t border-gray-800 pt-10">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <details key={i} className="group bg-gray-800/40 border border-gray-700/50 rounded-xl">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium text-sm hover:text-amber-400 transition-colors">
                {item.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform ml-2">&#9660;</span>
              </summary>
              <div className="px-4 pb-4 text-gray-400 text-sm leading-relaxed">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Internal Links */}
      <section className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-lg font-bold text-white mb-4">More Market Intelligence</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <Link href="/daily-flip" className="text-amber-400 hover:text-amber-300">The Daily Flip &rarr;</Link>
          <Link href="/fear-greed" className="text-amber-400 hover:text-amber-300">Fear & Greed Index &rarr;</Link>
          <Link href="/market-sectors" className="text-amber-400 hover:text-amber-300">Sector Report &rarr;</Link>
          <Link href="/power-rankings" className="text-amber-400 hover:text-amber-300">Power Rankings &rarr;</Link>
          <Link href="/market-correlations" className="text-amber-400 hover:text-amber-300">Price Correlations &rarr;</Link>
          <Link href="/seasonal-calendar" className="text-amber-400 hover:text-amber-300">Seasonal Calendar &rarr;</Link>
          <Link href="/tools/market-dashboard" className="text-amber-400 hover:text-amber-300">Market Dashboard &rarr;</Link>
          <Link href="/market-weather" className="text-amber-400 hover:text-amber-300">Market Weather &rarr;</Link>
        </div>
      </section>
    </div>
  );
}
