import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import DailyFlipClient from './DailyFlipClient';

export const metadata: Metadata = {
  title: 'The Daily Flip — Your Morning Card Market Brief | CardVault',
  description: 'Start your day with The Daily Flip: today\'s top card market stories, pick of the day, avoid alerts, top gainers and decliners, market mood, stat of the day, and upcoming catalysts. New brief every morning — same picks for everyone.',
  openGraph: {
    title: 'The Daily Flip — Morning Card Market Brief | CardVault',
    description: 'Your daily sports card market briefing. Top stories, picks, movers, and catalysts — refreshed every day.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'The Daily Flip — CardVault',
    description: 'Morning card market brief: top stories, pick of the day, market movers, and upcoming catalysts.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'News', href: '/news' },
  { label: 'The Daily Flip' },
];

const faqItems = [
  {
    question: 'What is The Daily Flip?',
    answer: 'The Daily Flip is a free daily card market briefing that gives you everything you need to know in under 2 minutes: overall market mood (bullish/neutral/bearish), sport-by-sport snapshots, top 3 stories of the day, a "Pick of the Day" (undervalued card worth buying), an "Avoid Today" warning (overpriced card), top 5 gainers and decliners, a stat of the day, and upcoming events that could move card prices. New brief every morning — same content for everyone so you can discuss with friends.',
  },
  {
    question: 'How are the daily picks selected?',
    answer: 'The Pick of the Day and Avoid Today are selected algorithmically from our database of 6,600+ sports cards. The Pick targets cards in the $5-$200 range that are undervalued relative to the player\'s profile and upcoming catalysts. The Avoid flags cards that may be temporarily overpriced due to hype, oversupply, or declining performance. Both picks are generated fresh daily using a date-seeded algorithm so everyone sees the same recommendations.',
  },
  {
    question: 'Are the price movements real?',
    answer: 'The percentage changes shown are estimated daily movements based on our market models, not real-time transaction data. They reflect simulated market conditions based on seasonal patterns, sport calendars, and card characteristics. For real-time sold prices, we recommend checking eBay sold listings, which are linked from each card\'s detail page.',
  },
  {
    question: 'Can I share The Daily Flip with friends?',
    answer: 'Yes! Click the "Share Brief" button to copy a formatted text summary of today\'s brief to your clipboard. It includes the market mood, top stories, picks, movers, and stats — perfect for pasting into group chats, Discord servers, or social media.',
  },
  {
    question: 'When does the brief refresh?',
    answer: 'The Daily Flip refreshes at midnight (your local time) every day. Each day\'s brief is generated from a unique seed, ensuring fresh content while keeping the same picks for everyone worldwide. You can visit any time during the day — the content stays consistent until the next refresh.',
  },
];

export default function DailyFlipPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'The Daily Flip — Morning Card Market Brief',
        description: 'Free daily card market briefing with picks, movers, stories, and catalysts. New brief every morning.',
        url: 'https://cardvault-two.vercel.app/daily-flip',
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
          Daily Brief &middot; Same Picks for Everyone &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">The Daily Flip</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Your morning card market brief. Top stories, picks, movers, and catalysts — refreshed every day. Start your collecting day informed.
        </p>
      </div>

      <DailyFlipClient />

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
        <h2 className="text-lg font-bold text-white mb-4">More Market Intelligence</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <Link href="/market-analysis" className="text-amber-400 hover:text-amber-300">Daily Market Analysis →</Link>
          <Link href="/fear-greed" className="text-amber-400 hover:text-amber-300">Fear & Greed Index →</Link>
          <Link href="/market-movers" className="text-amber-400 hover:text-amber-300">Market Movers →</Link>
          <Link href="/power-rankings" className="text-amber-400 hover:text-amber-300">Power Rankings →</Link>
          <Link href="/market-sectors" className="text-amber-400 hover:text-amber-300">Sector Report →</Link>
          <Link href="/market-correlations" className="text-amber-400 hover:text-amber-300">Price Correlations →</Link>
          <Link href="/tools/market-dashboard" className="text-amber-400 hover:text-amber-300">Market Dashboard →</Link>
          <Link href="/news" className="text-amber-400 hover:text-amber-300">Card News Hub →</Link>
        </div>
      </section>
    </div>
  );
}
