import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardPlinkoClient from './CardPlinkoClient';

export const metadata: Metadata = {
  title: 'Card Plinko — Drop Cards for Multipliers | CardVault',
  description: 'Drop sports cards down a plinko board and win multipliers! Land on 5x for a massive score or 0x for nothing. 5 drops per game, daily challenge mode, 9,500+ real cards from MLB, NBA, NFL, and NHL.',
  openGraph: {
    title: 'Card Plinko — Drop Cards, Win Multipliers | CardVault',
    description: 'Plinko meets card collecting. Drop cards through pegs, land on multipliers from 0x to 5x. Daily challenge + random mode.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Plinko | CardVault',
    description: 'Drop sports cards down a plinko board. 5 drops, multipliers from 0x to 5x. How high can you score?',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/games' },
  { label: 'Card Plinko' },
];

const faqItems = [
  {
    question: 'How do I play Card Plinko?',
    answer: 'A random sports card is shown with its estimated market value. Click Drop to send it down a 10-row plinko board. The card bounces left or right at each peg randomly. At the bottom, it lands in a multiplier slot ranging from 0x to 5x. Your score for that drop is the card value times the multiplier. You get 5 drops per game.',
  },
  {
    question: 'What are the multiplier slots?',
    answer: 'The board has 11 slots at the bottom. From left to right: 0x, 0.3x, 0.5x, 1x, 2x, 5x, 2x, 1x, 0.5x, 0.3x, 0x. The center 5x slot is the jackpot, while the edges are 0x — you lose the card value entirely. Most drops land in the 0.5x to 2x range.',
  },
  {
    question: 'Is there a daily challenge?',
    answer: 'Yes. Daily mode uses the same 5 cards and the same plinko paths for everyone each day, so you can compare scores with friends. Random mode generates fresh cards and random bounces every time.',
  },
  {
    question: 'How is the final grade calculated?',
    answer: 'Your total score across all 5 drops determines your grade. Getting multiple 5x jackpots on high-value cards earns an S grade. The grading scale goes S, A, B, C, D, F based on total accumulated value.',
  },
  {
    question: 'What cards are in the game?',
    answer: 'Card Plinko draws from over 9,500 real sports cards in the CardVault database, covering baseball, basketball, football, and hockey from 1909 to 2025. Higher-value cards make the 5x jackpot much more exciting.',
  },
];

export default function CardPlinkoPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Card Plinko',
        description: 'Drop sports cards down a plinko board and win multipliers. 5 drops per game with daily challenge mode.',
        url: 'https://cardvault-two.vercel.app/card-plinko',
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
        <div className="inline-flex items-center gap-2 bg-orange-950/60 border border-orange-800/50 text-orange-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
          Card Plinko &middot; 5 Drops &middot; 0x to 5x Multipliers
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Plinko</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Drop a card down the plinko board. Watch it bounce through the pegs. Land on the 5x jackpot — or lose it all at 0x. Five drops, one score. How lucky are you?
        </p>
      </div>

      <CardPlinkoClient />

      {/* How to Play */}
      <div className="mt-12 bg-gray-900/60 border border-gray-800/50 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">How to Play</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-300">
          <div className="flex gap-3">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-orange-900/60 text-orange-400 flex items-center justify-center text-xs font-bold">1</span>
            <p>A random card appears with its estimated value. This is your base score for the drop.</p>
          </div>
          <div className="flex gap-3">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-orange-900/60 text-orange-400 flex items-center justify-center text-xs font-bold">2</span>
            <p>Click <strong>Drop</strong> to release the card into the plinko board. It bounces randomly at each row of pegs.</p>
          </div>
          <div className="flex gap-3">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-orange-900/60 text-orange-400 flex items-center justify-center text-xs font-bold">3</span>
            <p>The card lands in a multiplier slot: 0x, 0.3x, 0.5x, 1x, 2x, or the jackpot 5x. Your score = value x multiplier.</p>
          </div>
          <div className="flex gap-3">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-orange-900/60 text-orange-400 flex items-center justify-center text-xs font-bold">4</span>
            <p>After 5 drops, your total score is graded S through F. Daily mode lets you compare with friends!</p>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-8 bg-gray-900/60 border border-gray-800/50 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Plinko Tips</h2>
        <ul className="space-y-2 text-sm text-gray-300">
          <li className="flex gap-2"><span className="text-orange-400 font-bold">1.</span> High-value cards make jackpots worth much more — a $500 card at 5x = $2,500 points.</li>
          <li className="flex gap-2"><span className="text-orange-400 font-bold">2.</span> The 5x center slot is the hardest to hit — most drops land in the 0.5x to 2x range.</li>
          <li className="flex gap-2"><span className="text-orange-400 font-bold">3.</span> Daily mode uses the same cards for everyone — compare scores to see who got luckier.</li>
          <li className="flex gap-2"><span className="text-orange-400 font-bold">4.</span> In random mode, keep playing to chase that perfect game: five 5x jackpots in a row!</li>
          <li className="flex gap-2"><span className="text-orange-400 font-bold">5.</span> Watch the physics — the ball genuinely bounces randomly at each peg. No two drops are the same.</li>
        </ul>
      </div>

      {/* FAQ */}
      <div className="mt-8 space-y-4">
        <h2 className="text-xl font-bold text-white">FAQ</h2>
        {faqItems.map(f => (
          <details key={f.question} className="bg-gray-900/60 border border-gray-800/50 rounded-xl p-4 group">
            <summary className="text-white font-medium cursor-pointer group-open:mb-2">{f.question}</summary>
            <p className="text-sm text-gray-400">{f.answer}</p>
          </details>
        ))}
      </div>

      {/* Related */}
      <div className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-lg font-bold text-white mb-4">More Card Games</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/card-double-or-nothing', label: 'Double or Nothing' },
            { href: '/card-slots', label: 'Card Slots' },
            { href: '/card-roulette', label: 'Card Roulette' },
            { href: '/card-price-is-right', label: 'Price is Right' },
            { href: '/fortune-wheel', label: 'Fortune Wheel' },
            { href: '/card-mystery-box', label: 'Mystery Box' },
          ].map(link => (
            <Link key={link.href} href={link.href} className="block bg-gray-900/60 border border-gray-800/50 rounded-lg p-3 text-sm text-gray-300 hover:text-orange-400 hover:border-orange-800/50 transition-colors">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
