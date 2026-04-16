import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import AuctionClient from './AuctionClient';

export const metadata: Metadata = {
  title: 'Card Auction House — Bid Against AI Collectors | CardVault',
  description: 'Free simulated card auction for sports card collectors. Bid against 4 AI opponents with different strategies. $500 budget, 5 lots, 15-second bidding windows. Win cards below market value. Daily challenge + random mode. 9,500+ real sports cards.',
  openGraph: {
    title: 'Card Auction House — Simulated Bidding | CardVault',
    description: 'Bid against AI collectors in a simulated card auction. $500 budget, 5 lots, 4 opponents.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Auction House — CardVault',
    description: 'Simulated card auction — outbid 4 AI opponents with $500.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Vault', href: '/vault' },
  { label: 'Auction House' },
];

const faqItems = [
  {
    question: 'How does the Card Auction House work?',
    answer: 'Five sports cards go up for auction one at a time. You start with a $500 virtual budget to bid across all 5 lots. Four AI bidders with different strategies compete against you. Each lot has a 15-second bidding window. The highest bid when time runs out wins the card. Try to win cards below their market value for the best grade.',
  },
  {
    question: 'Who are the AI bidders?',
    answer: 'Four distinct AI personalities: Big Mike (aggressive — bids hard and fast), Penny (conservative — sticks to fair prices), The Sniper (waits then strikes late), and CardFan99 (emotional — overpays for favorites). Each has a different maximum they will pay relative to market value.',
  },
  {
    question: 'How is the grade calculated?',
    answer: 'Your grade is based on how many of the 5 lots you win. S grade = won 4-5 lots, A = won 3, B = won 2, C = won 1, D = won 0. The key is budget management — you cannot win every lot if you overspend early.',
  },
  {
    question: 'What is the best bidding strategy?',
    answer: 'Manage your budget carefully. Skip overpriced lots where AI bidders are emotional. Focus on lots where you can win below market value. Watch the bid history to learn each AI personality. Late bids in the final 3 seconds are risky but can snipe deals.',
  },
  {
    question: 'What is the difference between Daily and Random?',
    answer: 'Daily mode uses a date-based seed — everyone gets the same 5 cards that day. Random mode picks 5 new cards each time, so you can practice unlimited auctions and test different strategies.',
  },
];

export default function AuctionPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Auction House',
        description: 'Simulated sports card auction with AI bidders. Compete for cards with a $500 budget.',
        url: 'https://cardvault-two.vercel.app/vault/auction',
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
        <div className="inline-flex items-center gap-2 bg-amber-950/60 border border-amber-800/50 text-amber-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
          Live Auction &middot; 9,500+ Cards &middot; 4 AI Bidders
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3 tracking-tight">
          Card Auction House
        </h1>
        <p className="text-gray-400 text-base sm:text-lg max-w-2xl">
          Bid against 4 AI collectors in a simulated sports card auction. Manage your $500 budget
          across 5 lots. Win cards below market value for the best grade.
        </p>
      </div>

      <AuctionClient />

      {/* FAQ */}
      <div className="mt-12 space-y-4">
        <h2 className="text-xl font-bold text-white">Frequently Asked Questions</h2>
        {faqItems.map(f => (
          <details key={f.question} className="group bg-gray-900/50 border border-gray-800/50 rounded-xl">
            <summary className="px-5 py-4 cursor-pointer text-sm font-medium text-gray-200 hover:text-white transition">{f.question}</summary>
            <div className="px-5 pb-4 text-sm text-gray-400 leading-relaxed">{f.answer}</div>
          </details>
        ))}
      </div>

      {/* Related */}
      <div className="mt-12">
        <h2 className="text-xl font-bold text-white mb-4">More Vault Features</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/vault/pawn-shop', title: 'Pawn Shop', desc: 'Negotiate card prices with AI Vinny' },
            { href: '/vault/mystery-crate', title: 'Mystery Crate', desc: 'Open virtual mystery lots' },
            { href: '/vault/market-maker', title: 'Market Maker', desc: 'Set bid/ask spreads on cards' },
            { href: '/vault/swap-meet', title: 'Swap Meet', desc: 'Trade cards at the virtual swap meet' },
            { href: '/vault/garage-sale', title: 'Garage Sale', desc: 'Browse random deals at the sale' },
            { href: '/vault', title: 'All Vault →', desc: 'Digital card vault features' },
          ].map(g => (
            <Link key={g.href} href={g.href} className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-3 hover:border-amber-700/50 transition">
              <p className="text-sm font-bold text-white">{g.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{g.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
