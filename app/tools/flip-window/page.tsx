import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import FlipWindowClient from './FlipWindowClient';

export const metadata: Metadata = {
  title: 'Card Flip Window Calculator — When to Buy & Sell Sports Cards | CardVault',
  description: 'Find the optimal time to buy and sell any sports card. Sport-specific seasonal analysis, event-driven price spikes, monthly price calendar, and flip profit estimates for baseball, basketball, football, and hockey cards.',
  openGraph: {
    title: 'Card Flip Window Calculator — Buy & Sell Timing | CardVault',
    description: 'When should you buy and sell sports cards? Seasonal analysis with monthly signals, events, and profit estimates.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Flip Window Calculator — CardVault',
    description: 'Optimal buy and sell timing for any sports card. Seasonal patterns, events, and flip profit estimates.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Flip Window Calculator' },
];

const faqItems = [
  {
    question: 'What is the Card Flip Window Calculator?',
    answer: 'The Card Flip Window Calculator analyzes seasonal market patterns for any sports card to identify the optimal months to buy and sell. Each sport has different price cycles: baseball cards peak around Opening Day and the World Series, basketball peaks during the Finals, football during the Super Bowl and NFL Draft, and hockey during the Stanley Cup Finals. The tool shows a 12-month price calendar with buy/sell/hold signals, estimates monthly price variations, and calculates potential flip profits.',
  },
  {
    question: 'How accurate are the seasonal price estimates?',
    answer: 'The seasonal patterns are based on well-documented market trends in the sports card hobby — for example, football cards consistently see 20-30% increases around the NFL Draft and Super Bowl. However, individual card prices can deviate significantly based on player performance, injuries, or viral moments. Use this tool as a general timing guide, not an exact price prediction. Always check recent eBay sold prices before making buying or selling decisions.',
  },
  {
    question: 'Why are rookie cards more volatile?',
    answer: 'Rookie cards carry a 40% higher volatility modifier because they are more sensitive to market cycles. During peak seasons, rookie card demand surges as collectors chase the next big thing. During off-seasons, rookies drop more than established veterans because their long-term value is less certain. This means bigger potential profits for flippers who time their buys and sells correctly, but also bigger potential losses if timing is wrong.',
  },
  {
    question: 'What are the best months to buy sports cards overall?',
    answer: 'The cheapest time to buy varies by sport: Baseball cards are cheapest in November-January (off-season). Basketball cards are cheapest in August-September (summer dead period). Football cards are cheapest in June-July (between draft and preseason). Hockey cards are cheapest in August-September (summer). For cross-sport collecting, July-August is generally the best buying window because all major sports have reduced activity.',
  },
  {
    question: 'How should I factor in fees when flipping cards?',
    answer: 'The flip profit shown is a gross estimate before fees. For a realistic net profit, subtract: eBay fees (~13% of sale price), shipping costs (~$4-5 for a single card, $1-2 for PWE), packaging supplies (~$0.50-1), and any grading costs ($18-150+ depending on service level and company). A card needs roughly 20% gross margin to break even after all fees on eBay. The Flip Profit Calculator tool provides detailed fee calculations.',
  },
];

export default function FlipWindowPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Flip Window Calculator',
        description: 'Find the optimal time to buy and sell any sports card based on seasonal patterns and market events.',
        url: 'https://cardvault-two.vercel.app/tools/flip-window',
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
        <div className="inline-flex items-center gap-2 bg-amber-950/60 border border-amber-800/50 text-amber-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
          Seasonal Analysis &middot; 4 Sports &middot; Monthly Signals
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Flip Window Calculator</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          When should you buy? When should you sell? Search any card to see sport-specific seasonal patterns, upcoming events that move prices, and optimal flip timing.
        </p>
      </div>

      <FlipWindowClient />

      {/* FAQ */}
      <section className="mt-12 border-t border-gray-800 pt-10">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <details key={i} className="group bg-gray-800/40 border border-gray-700/50 rounded-xl">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium text-sm hover:text-amber-400 transition-colors">
                {item.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform ml-2">▼</span>
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
        <h2 className="text-lg font-bold text-white mb-4">Related Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <Link href="/tools/flip-calc" className="text-amber-400 hover:text-amber-300">Flip Profit Calculator →</Link>
          <Link href="/tools/seasonality" className="text-amber-400 hover:text-amber-300">Market Seasonality Guide →</Link>
          <Link href="/tools/grading-roi" className="text-amber-400 hover:text-amber-300">Grading ROI Calculator →</Link>
          <Link href="/tools/flip-tracker" className="text-amber-400 hover:text-amber-300">Flip Tracker P&L →</Link>
          <Link href="/tools/ebay-fee-calc" className="text-amber-400 hover:text-amber-300">eBay Fee Calculator →</Link>
          <Link href="/market-correlations" className="text-amber-400 hover:text-amber-300">Market Correlations →</Link>
          <Link href="/tools/trend-predictor" className="text-amber-400 hover:text-amber-300">Trend Predictor →</Link>
          <Link href="/daily-flip" className="text-amber-400 hover:text-amber-300">The Daily Flip →</Link>
        </div>
      </section>
    </div>
  );
}
