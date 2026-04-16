import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import AuctionPaddleClient from './AuctionPaddleClient';

export const metadata: Metadata = {
  title: 'Live Auction Paddle — Bid at 5 Live Card Auctions | CardVault',
  description: 'Experience live card auctioneering across 5 simultaneous houses — Heritage, Goldin, PWCC, REA, Lelands. Raise your paddle, follow the chant, win lots. Simulated with real card data. Free.',
  openGraph: {
    title: 'Live Auction Paddle — CardVault',
    description: 'Hold the paddle at 5 simultaneous card auctions. Switch houses, bid live, hear the chant.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Live Auction Paddle — CardVault',
    description: 'Live card auctions across 5 houses. Raise the paddle. Win lots.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Live', href: '/live-hub' },
  { label: 'Auction Paddle' },
];

const faqItems = [
  {
    question: 'What is the Live Auction Paddle?',
    answer: 'It is a real-time simulation of holding a paddle across five major card auction houses running concurrently — Heritage Auctions, Goldin, PWCC Marketplace, Robert Edward Auctions, and Lelands. Each house rotates through lots pulled from 9,800+ real sports cards. A text-based auctioneer chant advances every ~1.5 seconds with bids, call-outs, warnings, and final hammer-downs. You have a $10,000 paddle budget and can switch focus between houses at any time.',
  },
  {
    question: 'How does bidding work?',
    answer: 'Pick a house by tapping its chip. The focused house shows the current lot in detail — card, opening estimate, current bid, next increment, and the live auctioneer chant. Tap RAISE PADDLE to bid the next increment. AI bidders (phone bidders, the room, internet bidders, other paddles) bid back probabilistically based on each house\'s aggression profile. If the chant reaches "going twice... SOLD!" while you hold the lead, the hammer comes down to YOU — the lot lands in your won-lots tally plus buyer\'s premium.',
  },
  {
    question: 'What are buyer\'s premiums?',
    answer: 'Every major auction house charges a buyer\'s premium — a percentage added on top of the hammer price. This simulator uses realistic 2025 rates: Heritage 20%, Goldin 22%, PWCC 20%, REA 20%, Lelands 23%. If you hammer at $500 with Heritage, your actual cost is $600. The premium is deducted from your $10,000 budget when you win. This is why sniping lots near the estimate matters — the premium stacks up fast.',
  },
  {
    question: 'How do the 5 houses differ?',
    answer: 'Each house has a different vibe. Heritage runs deep vintage and high-end modern — longest chant cadence, most deliberate bidders. Goldin is the influencer-driven modern house — fastest tempo, aggressive bidders, big paddle wars. PWCC bridges vintage and modern with steady pacing. Robert Edward Auctions (REA) specializes in pre-war and 1950s cardboard — patient, expert bidders. Lelands runs memorabilia and unusual lots — unpredictable, bargains and overpays both possible. Bidder aggression and chant speed vary per house.',
  },
  {
    question: 'What makes this different from the Auction Sniper simulator?',
    answer: 'V-035 Auction Sniper is about timing — setting a max bid seconds before a listed eBay-style auction ends. Auction Paddle is about atmosphere — rolling live auctions with an auctioneer chanting "$500... $550! Going once... do I hear $600?" The skill is rhythm, budget discipline across five simultaneous rooms, and knowing when to let a lot walk. Sniper is asynchronous; paddle is live.',
  },
];

export default function AuctionPaddlePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Live Auction Paddle',
        description: 'Simulated live card auctioneering across 5 major houses with auctioneer chant and real card data.',
        url: 'https://cardvault-two.vercel.app/auction-paddle',
        applicationCategory: 'GameApplication',
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
        <div className="inline-flex items-center gap-2 bg-red-950/60 border border-red-800/50 text-red-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
          Live Auction &middot; 5 Houses &middot; $10,000 Paddle
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Live Auction Paddle</h1>
        <p className="text-gray-400 text-lg">
          Five houses. One paddle. Switch rooms, follow the chant, raise on what you love.
          Heritage, Goldin, PWCC, REA, Lelands — all running simultaneously with real card data.
        </p>
      </div>

      <AuctionPaddleClient />

      {/* FAQ */}
      <section className="mt-16 border-t border-gray-800 pt-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map(f => (
            <details key={f.question} className="group bg-gray-900 border border-gray-800 rounded-xl">
              <summary className="px-5 py-4 text-white font-medium cursor-pointer hover:text-red-400 transition-colors">
                {f.question}
              </summary>
              <div className="px-5 pb-4 text-gray-400 text-sm">
                {f.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Related */}
      <section className="mt-8 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">More Live Experiences</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href="/auction-ticker" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-red-700/50 rounded-xl transition-colors">
            <span className="text-xl">📊</span>
            <div><div className="text-white text-sm font-medium">Auction Ticker</div><div className="text-gray-500 text-xs">Live feed of auction results across platforms</div></div>
          </Link>
          <Link href="/vault/auction-sniper" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-red-700/50 rounded-xl transition-colors">
            <span className="text-xl">🎯</span>
            <div><div className="text-white text-sm font-medium">Auction Sniper</div><div className="text-gray-500 text-xs">Time your bid at the final second</div></div>
          </Link>
          <Link href="/break-bingo" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-red-700/50 rounded-xl transition-colors">
            <span className="text-xl">🎱</span>
            <div><div className="text-white text-sm font-medium">Break Bingo</div><div className="text-gray-500 text-xs">Bingo during a card break</div></div>
          </Link>
          <Link href="/hobby-radio" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-red-700/50 rounded-xl transition-colors">
            <span className="text-xl">📻</span>
            <div><div className="text-white text-sm font-medium">Hobby Radio</div><div className="text-gray-500 text-xs">Live card market radio broadcast</div></div>
          </Link>
          <Link href="/market-roundtable" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-red-700/50 rounded-xl transition-colors">
            <span className="text-xl">🎙️</span>
            <div><div className="text-white text-sm font-medium">Market Roundtable</div><div className="text-gray-500 text-xs">5 analysts debate card topics</div></div>
          </Link>
          <Link href="/card-wire" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-red-700/50 rounded-xl transition-colors">
            <span className="text-xl">📰</span>
            <div><div className="text-white text-sm font-medium">Card Wire</div><div className="text-gray-500 text-xs">Bloomberg-style live market news</div></div>
          </Link>
        </div>
      </section>
    </div>
  );
}
