import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import RaffleClient from './RaffleClient';

export const metadata: Metadata = {
  title: 'Card Raffle — Win Sports Cards in Simulated Raffles | CardVault',
  description: 'Enter card raffles to win sports cards! Browse active raffles featuring 9,700+ real cards, buy tickets, and watch the drawing. Track your win rate, net P&L, and biggest wins. Daily + random modes.',
  openGraph: {
    title: 'Card Raffle — Simulated Card Raffles | CardVault',
    description: 'Enter raffles for real sports cards. Buy tickets, watch drawings, track your wins.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Raffle — CardVault',
    description: 'Simulated card raffles. Buy tickets, watch drawings, win cards. Free to play.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Vault', href: '/vault' },
  { label: 'Card Raffle' },
];

const faqItems = [
  {
    question: 'What is the Card Raffle?',
    answer: 'The Card Raffle is a simulated raffle experience featuring real sports cards from our database of 9,700+ cards. You start with a $500 wallet balance, browse active raffles, buy tickets ($2-$25 each), and watch the drawing. If your ticket is selected, you win the card value added to your wallet. It teaches raffle math and expected value in a risk-free environment.',
  },
  {
    question: 'How are winners determined?',
    answer: 'Each raffle has a fixed number of tickets. When you enter, all tickets (yours, simulated participants, and remaining pool) are shuffled and one is drawn at random. Your win probability equals your tickets divided by total tickets. More tickets means a higher chance, but each raffle has a house edge built into the ticket pricing.',
  },
  {
    question: 'What is the house edge?',
    answer: 'Like real-world card raffles, the total ticket revenue exceeds the card value by 20-50%. This means the expected value of each ticket is negative on average. The simulation teaches this important lesson: most card raffles are -EV for participants, which is why setting a budget is crucial.',
  },
  {
    question: 'Are card raffles legal in real life?',
    answer: 'Card raffles exist in a gray area. Many states consider them a form of gambling and regulate them. Instagram and Facebook card raffles are popular but often unregulated. Always check your local laws before participating in real card raffles, and only enter from trusted, verified sellers.',
  },
  {
    question: 'How do I improve my raffle grade?',
    answer: 'Your grade is based on total wins and win rate. Entering fewer raffles with more tickets each (concentrating your bets) tends to produce better win rates than spreading thin across many raffles. The S-grade requires 5+ wins with a 30%+ win rate — a challenging but achievable goal.',
  },
];

export default function RafflePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Raffle',
        description: 'Simulated card raffle experience. Buy tickets, watch drawings, win sports cards.',
        url: 'https://cardvault-two.vercel.app/vault/raffle',
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
        <div className="inline-flex items-center gap-2 bg-teal-950/60 border border-teal-800/50 text-teal-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
          Raffle Sim &middot; 9,700+ Cards &middot; Daily + Random
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Raffle</h1>
        <p className="text-gray-400 text-lg">
          Enter raffles for real sports cards. Buy tickets, watch the drawing, and see if luck is on your side.
          Track your win rate, biggest wins, and net P&L.
        </p>
      </div>

      <RaffleClient />

      {/* FAQ section */}
      <section className="mt-16 border-t border-gray-800 pt-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map(f => (
            <details key={f.question} className="group bg-gray-900 border border-gray-800 rounded-xl">
              <summary className="px-5 py-4 text-white font-medium cursor-pointer hover:text-teal-400 transition-colors">
                {f.question}
              </summary>
              <div className="px-5 pb-4 text-gray-400 text-sm">
                {f.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Related Links */}
      <section className="mt-8 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">More Vault Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href="/vault/auction-sniper" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-teal-700/50 rounded-xl transition-colors">
            <span className="text-xl">🎯</span>
            <div><div className="text-white text-sm font-medium">Auction Sniper</div><div className="text-gray-500 text-xs">Bid on timed auctions vs AI</div></div>
          </Link>
          <Link href="/vault/mystery-crate" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-teal-700/50 rounded-xl transition-colors">
            <span className="text-xl">📦</span>
            <div><div className="text-white text-sm font-medium">Mystery Crate</div><div className="text-gray-500 text-xs">Open themed mystery lots</div></div>
          </Link>
          <Link href="/vault/pawn-shop" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-teal-700/50 rounded-xl transition-colors">
            <span className="text-xl">💰</span>
            <div><div className="text-white text-sm font-medium">Pawn Shop</div><div className="text-gray-500 text-xs">Negotiate with AI card broker</div></div>
          </Link>
          <Link href="/vault/garage-sale" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-teal-700/50 rounded-xl transition-colors">
            <span className="text-xl">🏷️</span>
            <div><div className="text-white text-sm font-medium">Garage Sale</div><div className="text-gray-500 text-xs">Price cards and watch buyers decide</div></div>
          </Link>
          <Link href="/vault/flash-sale" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-teal-700/50 rounded-xl transition-colors">
            <span className="text-xl">⚡</span>
            <div><div className="text-white text-sm font-medium">Flash Sale</div><div className="text-gray-500 text-xs">Limited-time card deals</div></div>
          </Link>
          <Link href="/vault/market-maker" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-teal-700/50 rounded-xl transition-colors">
            <span className="text-xl">📈</span>
            <div><div className="text-white text-sm font-medium">Market Maker</div><div className="text-gray-500 text-xs">Set spreads and trade with AI</div></div>
          </Link>
        </div>
      </section>
    </div>
  );
}
