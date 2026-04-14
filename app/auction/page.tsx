import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import AuctionHouseClient from './AuctionHouseClient';

export const metadata: Metadata = {
  title: 'Auction House — Bid on Sports Cards in Real Time | CardVault',
  description: 'Bid on sports cards in the CardVault Auction House. 12 new auctions daily across baseball, basketball, football, and hockey. Snipe protection, live countdown timers, and won cards go straight to your vault.',
  openGraph: {
    title: 'Auction House — CardVault',
    description: 'Bid on sports cards in real time. 12 daily auctions, snipe protection, live timers.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Auction House — CardVault',
    description: 'Bid on sports cards. 12 daily auctions with snipe protection and vault integration.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Auction House' },
];

const faqItems = [
  {
    question: 'How does the Auction House work?',
    answer: 'The CardVault Auction House features 12 new card auctions every day, drawn from our database of 3,200+ sports cards. Browse auctions filtered by sport, place bids using your wallet balance, and win cards that are automatically added to your vault.',
  },
  {
    question: 'What is snipe protection?',
    answer: 'Snipe protection prevents last-second bid sniping. If any bid is placed within the final 60 seconds of an auction, the timer extends by 30 seconds. This gives all bidders a fair chance to respond.',
  },
  {
    question: 'How do I get balance to bid?',
    answer: 'New users start with a $250 welcome bonus. You can earn more by selling cards from your vault at 90% fair market value through the Pack Store, or by winning auctions at below-market prices and selling the cards.',
  },
  {
    question: 'What happens when I get outbid?',
    answer: 'When another bidder tops your bid, your funds are refunded to your wallet instantly. You will see your bid status change from "Leading" to "Outbid" in the My Bids tab.',
  },
  {
    question: 'Where do won cards go?',
    answer: 'Won auction cards are automatically added to your vault at /vault. You can view, organize, or sell them back at 90% of fair market value from your vault page.',
  },
];

export default function AuctionPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Auction House',
        description: 'Bid on sports cards in real-time auctions. 12 new daily auctions with snipe protection, live countdown timers, and vault integration.',
        url: 'https://cardvault-two.vercel.app/auction',
        applicationCategory: 'EntertainmentApplication',
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
          <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
          Live Auctions
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Auction House</h1>
        <p className="text-gray-400 max-w-2xl">
          Bid on sports cards from across all major sports. 12 new auctions daily with countdown timers,
          snipe protection, and won cards automatically added to your vault.
        </p>
      </div>

      <AuctionHouseClient />

      {/* FAQ */}
      <div className="mt-12 border-t border-gray-800/50 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <details key={i} className="group bg-gray-900/40 border border-gray-800/40 rounded-lg">
              <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-gray-200 hover:text-white transition-colors">
                {item.question}
              </summary>
              <div className="px-4 pb-3 text-sm text-gray-400 leading-relaxed">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Related */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link href="/packs" className="bg-gray-900/40 border border-gray-800/40 rounded-lg p-3 text-center hover:border-gray-700/50 transition-colors">
          <p className="text-lg mb-1">&#x1F4E6;</p>
          <p className="text-xs font-medium text-gray-300">Pack Store</p>
        </Link>
        <Link href="/vault" className="bg-gray-900/40 border border-gray-800/40 rounded-lg p-3 text-center hover:border-gray-700/50 transition-colors">
          <p className="text-lg mb-1">&#x1F512;</p>
          <p className="text-xs font-medium text-gray-300">My Vault</p>
        </Link>
        <Link href="/trade-hub" className="bg-gray-900/40 border border-gray-800/40 rounded-lg p-3 text-center hover:border-gray-700/50 transition-colors">
          <p className="text-lg mb-1">&#x1F91D;</p>
          <p className="text-xs font-medium text-gray-300">Trade Hub</p>
        </Link>
        <Link href="/drops" className="bg-gray-900/40 border border-gray-800/40 rounded-lg p-3 text-center hover:border-gray-700/50 transition-colors">
          <p className="text-lg mb-1">&#x1F4C5;</p>
          <p className="text-xs font-medium text-gray-300">Drop Calendar</p>
        </Link>
      </div>
    </div>
  );
}
