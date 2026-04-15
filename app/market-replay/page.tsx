import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import MarketReplayClient from './MarketReplayClient';

export const metadata: Metadata = {
  title: 'Card Market Replay — Time Machine for Card Prices | CardVault',
  description: 'Travel back in time to see what the card market looked like on any date. Market mood, top gainers and losers, sport performance, events, and card of the day. Compare two dates side by side.',
  openGraph: {
    title: 'Card Market Replay — Price History Time Machine | CardVault',
    description: 'Replay any day in the card market. See movers, mood, events, and insights from any date.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Market Replay — CardVault',
    description: 'Card market time machine. Pick any date, see what happened.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Live', href: '/live-hub' },
  { label: 'Market Replay' },
];

const faqItems = [
  {
    question: 'What is Card Market Replay?',
    answer: 'Card Market Replay is a time machine for the sports card market. Select any date and see a simulated snapshot of what the market looked like: overall mood (bullish/neutral/bearish), market cap, daily volume, sport-by-sport performance, top gainers and losers, the card of the day, active events, and a market insight. You can also compare two dates side by side to see how the market has changed.',
  },
  {
    question: 'Is this real historical data?',
    answer: 'The data is simulated using deterministic algorithms seeded by date — meaning the same date always produces the same snapshot, but the values are estimates based on seasonal patterns and market models, not actual historical transaction data. For real historical sold prices, check eBay completed listings or major auction house archives.',
  },
  {
    question: 'How does the date comparison work?',
    answer: 'Click "Compare Dates" to enter a second date. The page shows both snapshots side by side so you can see how market mood, sport performance, and top movers differ between the two dates. This is useful for understanding seasonal patterns (e.g., compare January to July) or year-over-year trends.',
  },
  {
    question: 'Why do different dates show different moods?',
    answer: 'Market mood is influenced by seasonal factors (sports seasons, holidays, events), day-of-week patterns, and randomized market conditions. The mood algorithm accounts for the fact that card markets tend to be more bullish during active sports seasons and more bearish during off-seasons, with events like the Super Bowl, NBA Finals, and NFL Draft creating price spikes.',
  },
  {
    question: 'What are the market insights based on?',
    answer: 'Market insights are curated facts about the sports card hobby drawn from industry data and collector experience. They cover topics like seasonal pricing patterns, grading trends, fee structures, and market dynamics. Each date shows a different insight to give you a well-rounded understanding of the hobby over time.',
  },
];

export default function MarketReplayPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Market Replay — Time Machine',
        description: 'Travel back in time to see card market snapshots for any date. Compare dates side by side.',
        url: 'https://cardvault-two.vercel.app/market-replay',
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
        <div className="inline-flex items-center gap-2 bg-violet-950/60 border border-violet-800/50 text-violet-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
          Time Machine &middot; Any Date &middot; Compare Side by Side
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Market Replay</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          What did the card market look like last week? Last month? A year ago? Pick any date and replay the market — mood, movers, events, and insights.
        </p>
      </div>

      <MarketReplayClient />

      {/* FAQ */}
      <section className="mt-12 border-t border-gray-800 pt-10">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <details key={i} className="group bg-gray-800/40 border border-gray-700/50 rounded-xl">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium text-sm hover:text-violet-400 transition-colors">
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
        <h2 className="text-lg font-bold text-white mb-4">More Market Intelligence</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <Link href="/daily-flip" className="text-violet-400 hover:text-violet-300">The Daily Flip →</Link>
          <Link href="/market-analysis" className="text-violet-400 hover:text-violet-300">Daily Analysis →</Link>
          <Link href="/fear-greed" className="text-violet-400 hover:text-violet-300">Fear & Greed Index →</Link>
          <Link href="/market-movers" className="text-violet-400 hover:text-violet-300">Market Movers →</Link>
          <Link href="/market-heatmap" className="text-violet-400 hover:text-violet-300">Market Heat Map →</Link>
          <Link href="/tools/flip-window" className="text-violet-400 hover:text-violet-300">Flip Window Calculator →</Link>
          <Link href="/power-rankings" className="text-violet-400 hover:text-violet-300">Power Rankings →</Link>
          <Link href="/market-sectors" className="text-violet-400 hover:text-violet-300">Sector Report →</Link>
        </div>
      </section>
    </div>
  );
}
