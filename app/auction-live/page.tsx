import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import AuctionLiveClient from './AuctionLiveClient';

export const metadata: Metadata = {
  title: 'Live Auction — Bid on Real Sports Cards Against AI | CardVault',
  description: 'Free live auction simulator. Bid against AI opponents on real sports cards with a 45-second countdown. Snipe protection, bid history, and win/loss tracking. New card every hour.',
  openGraph: {
    title: 'Live Auction — CardVault',
    description: 'Bid against AI opponents on real sports cards. 45-second auctions with snipe protection.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Live Auction — CardVault',
    description: 'Live auction simulator. Bid on real sports cards against AI opponents.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Live', href: '/auction' },
  { label: 'Live Auction' },
];

const faqItems = [
  {
    question: 'How does the live auction work?',
    answer: 'Each auction features a real sports card from our database. You compete against 2-3 AI bidders in a 45-second countdown. Place bids to stay in the lead. The highest bidder when the timer hits zero wins.',
  },
  {
    question: 'What is snipe protection?',
    answer: 'If any bid is placed in the final 10 seconds, 5 seconds are added to the clock. This prevents last-second sniping and keeps auctions fair, just like real auction houses use.',
  },
  {
    question: 'How often do new auctions start?',
    answer: 'A new card is featured every hour. Everyone who plays during the same hour gets the same card and starting conditions.',
  },
  {
    question: 'How are AI bidders different?',
    answer: 'Each AI bidder has a different personality — some are aggressive and bid frequently, others are patient and wait. They each have a maximum they are willing to pay based on the card value, so strategic timing matters.',
  },
  {
    question: 'Is this using real money?',
    answer: 'No, this is a free simulation. No real money or cards change hands. It is designed to teach auction dynamics and help you practice bidding strategy.',
  },
];

export default function AuctionLivePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Live Auction Simulator',
        description: 'Bid against AI opponents on real sports cards in timed auctions.',
        url: 'https://cardvault-two.vercel.app/auction-live',
        applicationCategory: 'GameApplication',
        operatingSystem: 'Web',
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
          <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
          Live auction &middot; New card every hour
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Live Auction</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Bid against AI opponents on real sports cards. 45-second countdown, snipe protection, and win tracking. Can you outbid the competition?
        </p>
      </div>

      <AuctionLiveClient />

      {/* FAQ */}
      <section className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <details key={i} className="group bg-gray-900/40 border border-gray-800 rounded-xl">
              <summary className="p-4 cursor-pointer text-white font-medium text-sm flex justify-between items-center">
                {item.question}
                <span className="text-gray-500 group-open:rotate-45 transition-transform text-lg">+</span>
              </summary>
              <div className="px-4 pb-4">
                <p className="text-sm text-gray-400 leading-relaxed">{item.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Related */}
      <section className="mt-10">
        <h2 className="text-lg font-bold text-white mb-4">Related</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <Link href="/auction" className="p-4 bg-gray-900/40 border border-gray-800 rounded-xl hover:border-gray-600 transition-colors">
            <h3 className="text-sm font-semibold text-white">Auction House</h3>
            <p className="text-xs text-gray-400 mt-1">Browse all auction listings.</p>
          </Link>
          <Link href="/break-room" className="p-4 bg-gray-900/40 border border-gray-800 rounded-xl hover:border-gray-600 transition-colors">
            <h3 className="text-sm font-semibold text-white">Break Room</h3>
            <p className="text-xs text-gray-400 mt-1">Live card breaking with community.</p>
          </Link>
          <Link href="/trading-sim" className="p-4 bg-gray-900/40 border border-gray-800 rounded-xl hover:border-gray-600 transition-colors">
            <h3 className="text-sm font-semibold text-white">Trading Simulator</h3>
            <p className="text-xs text-gray-400 mt-1">Buy &amp; sell cards over 7 days.</p>
          </Link>
          <Link href="/card-battle" className="p-4 bg-gray-900/40 border border-gray-800 rounded-xl hover:border-gray-600 transition-colors">
            <h3 className="text-sm font-semibold text-white">Card Battles</h3>
            <p className="text-xs text-gray-400 mt-1">Stat-based card combat.</p>
          </Link>
          <Link href="/tools/flip-calc" className="p-4 bg-gray-900/40 border border-gray-800 rounded-xl hover:border-gray-600 transition-colors">
            <h3 className="text-sm font-semibold text-white">Flip Calculator</h3>
            <p className="text-xs text-gray-400 mt-1">Calculate auction flip profits.</p>
          </Link>
          <Link href="/packs" className="p-4 bg-gray-900/40 border border-gray-800 rounded-xl hover:border-gray-600 transition-colors">
            <h3 className="text-sm font-semibold text-white">Pack Store</h3>
            <p className="text-xs text-gray-400 mt-1">Open digital card packs.</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
