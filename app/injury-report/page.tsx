import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import InjuryReportClient from './InjuryReportClient';

export const metadata: Metadata = {
  title: 'Card Injury Report — Which Cards Are Declining & Recovering | CardVault',
  description: 'Daily card market injury report. See which sports cards are declining (Out, Questionable, Day-to-Day) and which are recovering (Returning from IR). Buy-the-dip opportunities, recovery timelines, and trading recommendations for baseball, basketball, football, and hockey cards.',
  openGraph: {
    title: 'Card Injury Report — CardVault',
    description: 'Daily report on declining and recovering card values. Find buy-the-dip opportunities before the market catches on.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Injury Report — CardVault',
    description: 'Which cards are declining? Which are recovering? Daily card market injury report.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Market', href: '/market-movers' },
  { label: 'Injury Report' },
];

const faqItems = [
  {
    question: 'What is the Card Injury Report?',
    answer: 'The Card Injury Report uses the familiar sports injury report format to track card value movements. Cards are classified as Out (major decline 20%+), Questionable (10-25% decline), Day-to-Day (minor 3-12% dip), Probable (slight wobble), or Returning from IR (recovering from a previous dip). It helps collectors identify buy-the-dip opportunities and avoid catching falling knives.',
  },
  {
    question: 'How often is the injury report updated?',
    answer: 'The injury report refreshes daily with new analysis based on simulated market movements. Check back each day for the latest status updates on card values across all four major sports.',
  },
  {
    question: 'Should I buy cards marked as Out?',
    answer: 'Cards marked Out carry the highest risk but also the highest potential reward. Only buy if you believe in the player long-term and can afford to hold for 3-12 months. If the player recovers or has a breakout season, these cards can see massive gains. However, some may never recover to previous values.',
  },
  {
    question: 'What does Returning from IR mean for cards?',
    answer: 'Returning from IR means a card that previously declined is now trending upward. These are often the safest buy-the-dip plays because the worst is likely behind them and positive momentum is building. They typically have clear catalysts driving the recovery — like a player returning from injury, making an All-Star team, or getting traded to a contender.',
  },
  {
    question: 'Are these real price movements?',
    answer: 'The injury report uses simulated price movements based on real card data and market patterns. It represents the types of fluctuations that commonly occur in the card market. Use the card detail links and eBay search to verify current real-world prices before making purchasing decisions.',
  },
];

export default function InjuryReportPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Injury Report',
        description: 'Daily card market injury report showing declining and recovering card values with buy-the-dip opportunities.',
        url: 'https://cardvault-two.vercel.app/injury-report',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Any',
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
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🏥</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Card Injury Report
          </h1>
        </div>
        <p className="text-gray-400 text-lg">
          Daily status update on card values. Which cards are declining? Which are recovering? Updated every 24 hours.
        </p>
      </div>

      <InjuryReportClient />

      {/* FAQ */}
      <section className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq) => (
            <details key={faq.question} className="group bg-gray-800/30 border border-gray-700/50 rounded-lg">
              <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-gray-200 hover:text-white transition-colors">
                {faq.question}
              </summary>
              <div className="px-4 pb-3 text-sm text-gray-400 leading-relaxed">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Related Links */}
      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        <Link href="/market-movers" className="text-blue-400 hover:text-blue-300">Market Movers</Link>
        <span className="text-gray-700">|</span>
        <Link href="/hot-deals" className="text-blue-400 hover:text-blue-300">Hot Deals</Link>
        <span className="text-gray-700">|</span>
        <Link href="/tools/watchlist" className="text-blue-400 hover:text-blue-300">Price Watchlist</Link>
        <span className="text-gray-700">|</span>
        <Link href="/tools/investment-calc" className="text-blue-400 hover:text-blue-300">Investment Calc</Link>
        <span className="text-gray-700">|</span>
        <Link href="/tools/quick-flip" className="text-blue-400 hover:text-blue-300">Quick-Flip Scorer</Link>
        <span className="text-gray-700">|</span>
        <Link href="/market-report" className="text-blue-400 hover:text-blue-300">Market Report</Link>
        <span className="text-gray-700">|</span>
        <Link href="/breaking-news" className="text-blue-400 hover:text-blue-300">Breaking News</Link>
        <span className="text-gray-700">|</span>
        <Link href="/market-sentiment" className="text-blue-400 hover:text-blue-300">Market Sentiment</Link>
      </div>
    </div>
  );
}
