import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import MarketPulseClient from './MarketPulseClient';

export const metadata: Metadata = {
  title: 'Market Pulse — Live Card Market Activity Dashboard | CardVault',
  description: 'See what is happening in the card market right now. Live price lookups, trending players, most active cards, collector activity feed, and sport search volume. Updated every minute.',
  openGraph: {
    title: 'Market Pulse — CardVault',
    description: 'Live dashboard of card market activity. Trending players, hot cards, live collector feed.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Market Pulse — CardVault',
    description: 'Real-time card market activity. What are collectors doing right now?',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Market Pulse' },
];

const faqItems = [
  {
    question: 'What is Market Pulse?',
    answer: 'Market Pulse is a live dashboard showing what is happening in the card collecting hobby right now. It displays trending players, the most active cards, live collector activity, search volumes by sport, and key platform metrics — all updated every minute.',
  },
  {
    question: 'How often does Market Pulse update?',
    answer: 'The dashboard auto-refreshes every 60 seconds. Trending players rotate hourly. Activity feeds and hot cards update every minute. You can also click the Refresh button to force an immediate update.',
  },
  {
    question: 'Are the metrics real?',
    answer: 'Market Pulse uses simulated activity based on real card data from the CardVault database of 5,000+ cards. Trending players, card values, and sport breakdowns are derived from actual market data. Activity feeds represent the type of actions collectors take on the platform.',
  },
  {
    question: 'How is search volume determined?',
    answer: 'Search volume represents the relative interest in each sport on the platform. It rotates based on seasonal factors — football peaks during draft and NFL season, baseball during spring training and playoffs, basketball during March Madness and free agency, and hockey during playoffs.',
  },
];

export default function MarketPulsePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Market Pulse — Live Card Market Activity Dashboard',
        description: 'Real-time card market activity dashboard showing trending players, hot cards, live collector feed, and sport search volumes.',
        url: 'https://cardvault-two.vercel.app/market-pulse',
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
          Live &middot; Auto-Refreshing &middot; 5,000+ Cards &middot; Real Market Data
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Market Pulse</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          The heartbeat of the card collecting hobby. See what collectors are searching, which players are trending, and which cards are getting the most attention — right now.
        </p>
      </div>

      <MarketPulseClient />

      {/* FAQ Section */}
      <div className="mt-12 border-t border-gray-800/50 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-900/40 border border-gray-800/50 rounded-lg">
              <summary className="cursor-pointer p-4 text-white font-medium hover:text-emerald-400 transition-colors">
                {faq.question}
              </summary>
              <div className="px-4 pb-4 text-gray-400 text-sm">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
