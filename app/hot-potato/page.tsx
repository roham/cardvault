import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import HotPotatoClient from './HotPotatoClient';

export const metadata: Metadata = {
  title: 'Card Hot Potato — Sell Before the Crash | CardVault',
  description: 'Buy a card and watch the price climb. Sell before it crashes to lock in profit — hold too long and you lose everything. 10 rounds of market timing. Free card collecting game.',
  openGraph: {
    title: 'Card Hot Potato — CardVault',
    description: 'Buy a card, watch the price rise, sell before the crash. Test your market timing instincts.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Hot Potato — CardVault',
    description: 'Can you sell before the crash? 10 rounds of card market timing.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/games' },
  { label: 'Hot Potato' },
];

const faqItems = [
  {
    question: 'How does Card Hot Potato work?',
    answer: 'Each round, you buy a card at its starting price. The price then begins ticking — sometimes up, sometimes down. You need to hit "Sell" to lock in your current profit before the price crashes. If the price drops below your buy price and you have not sold, you lose your entire investment for that round. The game lasts 10 rounds, and your goal is to maximize total profit across all rounds.',
  },
  {
    question: 'What determines when the price crashes?',
    answer: 'Each card has a hidden "crash point" — a random timer that determines when the price peaks and starts falling rapidly. Some cards crash early after a small gain. Others climb to 3x or 4x before crashing. The volatility is different each round, simulating the unpredictability of real card markets.',
  },
  {
    question: 'What is a good strategy for Hot Potato?',
    answer: 'Experienced players use the "double or out" strategy — sell as soon as the price doubles (2x) to guarantee consistent returns. Greedy players who always wait for 3x or 4x occasionally score huge, but also suffer more total losses. The optimal strategy mirrors real investing: take profits consistently rather than always holding for the moonshot.',
  },
  {
    question: 'Is this how real card prices work?',
    answer: 'The game exaggerates the speed and volatility for entertainment, but the core lesson is real: card prices can spike quickly on hype (new release, player performance, social media buzz) and crash just as fast when the hype fades. Knowing when to sell — whether a card or a stock — is one of the hardest skills in any market. This game trains that instinct in a fun, risk-free way.',
  },
];

export default function HotPotatoPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Hot Potato',
        description: 'Buy cards and sell before the price crashes. A market timing game for card collectors.',
        url: 'https://cardvault-two.vercel.app/hot-potato',
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
          <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
          10 Rounds &middot; Sell Before the Crash &middot; High Scores
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Card Hot Potato
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl">
          Buy a card. Watch the price climb. Sell before it crashes — or lose everything.
          How much profit can you lock in across 10 rounds?
        </p>
      </div>

      <HotPotatoClient />

      {/* Related Games */}
      <div className="mt-16 border-t border-zinc-800 pt-10">
        <h2 className="text-xl font-bold text-white mb-4">More Card Games</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/market-tycoon" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-red-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">Market Tycoon</h3>
            <p className="text-xs text-zinc-500">Trade cards over 20 market days</p>
          </Link>
          <Link href="/card-roulette" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-red-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">Card Roulette</h3>
            <p className="text-xs text-zinc-500">Spin and buy or pass, 20 rounds</p>
          </Link>
          <Link href="/card-streak" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-red-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">Card Streak</h3>
            <p className="text-xs text-zinc-500">Higher or lower card values</p>
          </Link>
          <Link href="/card-auction" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-red-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">Auction Showdown</h3>
            <p className="text-xs text-zinc-500">Bid against AI collectors</p>
          </Link>
          <Link href="/price-is-right" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-red-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">Price Is Right</h3>
            <p className="text-xs text-zinc-500">Guess card prices without going over</p>
          </Link>
          <Link href="/trading-sim" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-red-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">Trading Simulator</h3>
            <p className="text-xs text-zinc-500">Simulate trades with AI collectors</p>
          </Link>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-16 border-t border-zinc-800 pt-10">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((faq) => (
            <div key={faq.question}>
              <h3 className="font-semibold text-white mb-2">{faq.question}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
