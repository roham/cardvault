import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import HotRightNowClient from './HotRightNowClient';

export const metadata: Metadata = {
  title: 'Hot Right Now — Trending Cards, Players & Hobby Buzz | CardVault',
  description: 'See what is trending in card collecting right now. Hottest cards, buzzing players, active breaks, popular tools, and community activity — the pulse of the hobby in real time.',
  openGraph: {
    title: 'Hot Right Now — The Pulse of the Hobby',
    description: 'Trending cards, buzzing players, and what the hobby is talking about right now.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Hot Right Now — CardVault',
    description: 'The pulse of card collecting. See what is trending right now.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Hot Right Now' },
];

const faqItems = [
  {
    question: 'How is the Hot Right Now page generated?',
    answer: 'The page aggregates trending signals from across CardVault: card views, tool usage, market movements, break activity, and community engagement. Cards and players that see spikes in attention rise to the top. The data refreshes throughout the day to reflect what collectors are focused on right now.',
  },
  {
    question: 'How often does the trending data update?',
    answer: 'Trending data rotates daily based on current sports events, card releases, and market activity. The page is designed to feel alive — different content every time you visit. Morning visitors see overnight market movers, afternoon visitors see live break activity, and evening visitors see the day\'s biggest stories.',
  },
  {
    question: 'Can I set alerts for trending cards?',
    answer: 'Currently, the Hot Right Now page is a real-time dashboard. For price alerts on specific cards, use the Watchlist tool to track cards and get notified when they hit your target price. The Market Sentiment page also tracks broader hobby trends.',
  },
  {
    question: 'What makes a card "hot" right now?',
    answer: 'Cards trend for many reasons: playoff performances (player cards spike during hot streaks), rookie debuts (first games drive immediate demand), grading company announcements (PSA service changes), product releases (new set drop day), viral moments (social media attention), and market corrections (buy-the-dip opportunities). The page captures all these signals.',
  },
  {
    question: 'Is this real-time market data?',
    answer: 'The trending signals are generated from CardVault activity patterns and sports calendar events. While not connected to live auction feeds, the page reflects genuine hobby sentiment based on what collectors are searching for, which tools they are using, and which cards are getting the most attention on the platform.',
  },
];

export default function HotRightNowPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Hot Right Now — Trending Cards & Hobby Buzz',
        description: 'Real-time trending dashboard for card collecting.',
        url: 'https://cardvault-two.vercel.app/hot-right-now',
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

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-orange-950/60 border border-orange-800/50 text-orange-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
          Live — Updates Daily
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Hot Right Now</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          The pulse of card collecting. See trending cards, buzzing players, active breaks, and what the hobby is talking about — all in one place.
        </p>
      </div>

      <HotRightNowClient />

      {/* FAQ */}
      <section className="mt-16 border-t border-gray-800 pt-10">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((item, i) => (
            <details key={i} className="group bg-gray-900/50 border border-gray-800 rounded-lg">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium hover:text-orange-400 transition-colors">
                {item.question}
                <span className="ml-2 text-gray-500 group-open:rotate-180 transition-transform">&#9660;</span>
              </summary>
              <p className="px-4 pb-4 text-gray-400 text-sm leading-relaxed">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Related */}
      <section className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-lg font-bold text-white mb-4">Related</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'Market Movers', href: '/market-movers' },
            { label: 'Live Ticker', href: '/ticker' },
            { label: 'Breaking News', href: '/breaking-news' },
            { label: 'Card Show Feed', href: '/card-show-feed' },
            { label: 'Market Sentiment', href: '/market-sentiment' },
            { label: 'Drop Calendar', href: '/drops' },
          ].map(link => (
            <Link key={link.href} href={link.href} className="bg-gray-900/60 border border-gray-800 rounded-lg px-4 py-3 text-sm text-gray-300 hover:text-white hover:border-gray-700 transition-colors">
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
