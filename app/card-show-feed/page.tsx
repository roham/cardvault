import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardShowFeedClient from './CardShowFeedClient';

export const metadata: Metadata = {
  title: 'Card Show Live Feed — Real-Time Finds, Deals & Pulls | CardVault',
  description: 'Live feed of what is happening at card shows across the country. See the latest finds, steals, graded hits, and table deals. Filter by sport, show type, and deal quality.',
  openGraph: {
    title: 'Card Show Live Feed — CardVault',
    description: 'Live feed of card show finds, deals, and pulls across the country.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Show Live Feed — CardVault',
    description: 'See what collectors are finding at card shows. Deals, pulls, and steals.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Card Show Feed' },
];

const faqItems = [
  {
    question: 'What is the Card Show Live Feed?',
    answer: 'The Card Show Live Feed simulates what collectors are finding at card shows across the country. See deals, steals, graded hits, raw finds, and table pickups — all featuring real cards from our database with realistic pricing.',
  },
  {
    question: 'How often does the feed update?',
    answer: 'The feed generates new activity every few seconds to simulate the buzz of a busy card show floor. New content appears throughout the day with different collector profiles and show locations.',
  },
  {
    question: 'Are these real card show reports?',
    answer: 'The feed uses real card data from our database combined with simulated collector activity and show locations. Prices and deals reflect realistic market scenarios. This is a demonstration of the kind of live card show experience we are building.',
  },
  {
    question: 'What do the different post types mean?',
    answer: 'Deal Alert means someone found a card below market value. Graded Hit is a high-grade pull from a submission. Raw Find is a notable ungraded card discovery. Table Pickup is a purchase from a dealer table. Fire Pull is an exciting hit from a pack or break.',
  },
];

export default function CardShowFeedPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Show Live Feed — CardVault',
        description: 'Live feed of card show activity. Finds, deals, and pulls from shows across the country.',
        url: 'https://cardvault-two.vercel.app/card-show-feed',
        applicationCategory: 'SocialNetworkingApplication',
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
        <div className="inline-flex items-center gap-2 bg-red-950/60 border border-red-800/50 text-red-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          Live Feed
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Card Show Live Feed
        </h1>
        <p className="text-gray-400 text-lg">
          What collectors are finding at card shows right now. Deals, steals, and fire pulls.
        </p>
      </div>

      <CardShowFeedClient />

      {/* FAQ */}
      <div className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((item, i) => (
            <div key={i}>
              <h3 className="text-white font-semibold mb-2">{item.question}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Internal Links */}
      <div className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-lg font-bold text-white mb-4">Related</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Link href="/tools/show-finder" className="bg-gray-900 border border-gray-800 rounded-lg p-3 hover:border-gray-600 transition-colors">
            <div className="text-sm font-medium text-white">Show Finder</div>
            <div className="text-xs text-gray-500">Find shows near you</div>
          </Link>
          <Link href="/tools/dealer-scanner" className="bg-gray-900 border border-gray-800 rounded-lg p-3 hover:border-gray-600 transition-colors">
            <div className="text-sm font-medium text-white">Dealer Scanner</div>
            <div className="text-xs text-gray-500">Quick mobile pricing</div>
          </Link>
          <Link href="/break-room" className="bg-gray-900 border border-gray-800 rounded-lg p-3 hover:border-gray-600 transition-colors">
            <div className="text-sm font-medium text-white">Break Room</div>
            <div className="text-xs text-gray-500">Live community breaks</div>
          </Link>
          <Link href="/marketplace" className="bg-gray-900 border border-gray-800 rounded-lg p-3 hover:border-gray-600 transition-colors">
            <div className="text-sm font-medium text-white">Marketplace</div>
            <div className="text-xs text-gray-500">Browse listings</div>
          </Link>
          <Link href="/auction-live" className="bg-gray-900 border border-gray-800 rounded-lg p-3 hover:border-gray-600 transition-colors">
            <div className="text-sm font-medium text-white">Live Auction</div>
            <div className="text-xs text-gray-500">Bid on cards</div>
          </Link>
          <Link href="/market-sentiment" className="bg-gray-900 border border-gray-800 rounded-lg p-3 hover:border-gray-600 transition-colors">
            <div className="text-sm font-medium text-white">Sentiment Index</div>
            <div className="text-xs text-gray-500">Market Fear &amp; Greed</div>
          </Link>
          <Link href="/watch-party" className="bg-gray-900 border border-gray-800 rounded-lg p-3 hover:border-gray-600 transition-colors">
            <div className="text-sm font-medium text-white">Watch Party</div>
            <div className="text-xs text-gray-500">Live game card tracker</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
