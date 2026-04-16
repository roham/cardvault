import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import PowerRankingsClient from './PowerRankingsClient';

export const metadata: Metadata = {
  title: 'Card Power Rankings — Top 25 Hottest Sports Cards This Week | CardVault',
  description: 'Weekly power rankings of the 25 hottest sports cards. Like ESPN rankings for the hobby. Momentum scores, trend arrows, and collector voting. MLB, NBA, NFL, NHL, and Pokemon cards ranked by market heat.',
  openGraph: {
    title: 'Card Power Rankings — Who\'s #1 This Week? | CardVault',
    description: 'Top 25 hottest cards ranked weekly. Momentum scores, trend arrows, and collector votes.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Power Rankings — CardVault',
    description: 'Weekly power rankings of the 25 hottest sports cards. Vote and compare.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Power Rankings' },
];

const faqItems = [
  {
    question: 'How are the Power Rankings determined?',
    answer: 'Rankings are based on a composite "Heat Score" (0-100) that factors in recent price movement, eBay search volume, social media mentions, auction activity, and rookie/breakout momentum. Cards can move up or down each week based on changes in these factors. The algorithm favors cards with strong multi-factor momentum over single-factor spikes.',
  },
  {
    question: 'How often are rankings updated?',
    answer: 'Rankings refresh weekly, every Monday. Each week features a new set of rankings based on the previous 7 days of market activity. Daily volatility is smoothed out to show meaningful trends rather than noise.',
  },
  {
    question: 'Can I vote on the rankings?',
    answer: 'Yes! Each card has an Agree/Disagree vote. This doesn\'t change the algorithmic ranking, but it shows community sentiment. If a card is ranked #5 but 80% of voters disagree, it suggests the market and the community have different views — which can be a valuable signal.',
  },
  {
    question: 'Which sports are included?',
    answer: 'All four major sports (MLB, NBA, NFL, NHL) are included in the combined rankings. You can filter by sport to see sport-specific top 25. The most competitive category is typically football during NFL season and basketball during the NBA playoffs.',
  },
  {
    question: 'How can I use these rankings?',
    answer: 'Power Rankings help identify which cards have momentum — useful for buying into trends early or selling into hype. Cards that have been in the top 10 for multiple weeks often have sustained demand, while one-week spikes might be short-lived. Use alongside the Watchlist and Price History tools for a complete picture.',
  },
];

export default function PowerRankingsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Power Rankings — Top 25 Hottest Sports Cards',
        description: 'Weekly power rankings of the 25 hottest sports cards with momentum scores and collector voting.',
        url: 'https://cardvault-two.vercel.app/card-power-rankings',
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
        <div className="inline-flex items-center gap-2 bg-orange-950/60 border border-orange-800/50 text-orange-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
          Weekly Rankings &middot; Top 25 &middot; Vote
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Card Power Rankings
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl">
          The 25 hottest cards in the hobby this week. Momentum scores, trend arrows, and community votes. Updated every Monday.
        </p>
      </div>

      <PowerRankingsClient />

      {/* Related */}
      <div className="mt-8 bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-3">Related</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/market-movers', label: 'Market Movers', desc: 'Daily gainers and losers' },
            { href: '/tools/watchlist', label: 'Watchlist', desc: 'Track cards you\'re watching' },
            { href: '/tools/price-history', label: 'Price History', desc: '90-day trends for any card' },
            { href: '/tools/heat-score', label: 'Heat Score', desc: 'Rate any card\'s market heat' },
            { href: '/tools/trend-predictor', label: 'Trend Predictor', desc: 'Where is this card headed?' },
            { href: '/market-report', label: 'Market Report', desc: 'Weekly market analysis' },
          ].map(r => (
            <Link key={r.href} href={r.href} className="block bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-3 hover:border-orange-600/50 transition-colors">
              <div className="text-white text-sm font-medium">{r.label}</div>
              <div className="text-zinc-500 text-xs mt-0.5">{r.desc}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-8 space-y-4">
        <h2 className="text-lg font-bold text-white">Frequently Asked Questions</h2>
        {faqItems.map((f) => (
          <details key={f.question} className="group bg-zinc-900/60 border border-zinc-800 rounded-lg">
            <summary className="cursor-pointer px-5 py-4 text-sm font-medium text-white group-open:border-b group-open:border-zinc-800">
              {f.question}
            </summary>
            <div className="px-5 py-4 text-sm text-zinc-400">{f.answer}</div>
          </details>
        ))}
      </div>

      <p className="text-center text-zinc-600 text-xs mt-10">
        Rankings are algorithmically generated based on market data estimates. Not investment advice. Past performance does not guarantee future results.
      </p>
    </div>
  );
}
