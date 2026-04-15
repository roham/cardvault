import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import MemoryMatchClient from './MemoryMatchClient';

export const metadata: Metadata = {
  title: 'Card Memory Match — Daily Matching Game',
  description: 'Test your memory with sports cards! Flip and match 8 pairs of cards on a 4x4 grid. New cards every day, track your best time, and share your score with friends.',
  openGraph: {
    title: 'Card Memory Match — CardVault',
    description: 'Daily card memory game. Match 8 pairs on a 4x4 grid. Track your best time and share your score.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Memory Match — CardVault',
    description: 'Flip and match sports cards. New board every day. How fast can you clear it?',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Memory Match' },
];

export default function MemoryMatchPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Memory Match — Daily Matching Game',
        description: 'Daily card memory matching game. Flip and match 8 pairs of sports cards on a 4x4 grid. Track your best time.',
        url: 'https://cardvault-two.vercel.app/memory-match',
        applicationCategory: 'GameApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      }} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          { '@type': 'Question', name: 'How does Card Memory Match work?', acceptedAnswer: { '@type': 'Answer', text: 'Flip two cards at a time to find matching pairs. The board has 16 cards (8 pairs) from the sports card database. Match all 8 pairs to win. Your time and number of moves are tracked.' } },
          { '@type': 'Question', name: 'Does the board change every day?', acceptedAnswer: { '@type': 'Answer', text: 'Yes! A new set of 8 card pairs is selected every day. The card positions are also randomized daily. Come back each day for a fresh challenge.' } },
          { '@type': 'Question', name: 'How is my score calculated?', acceptedAnswer: { '@type': 'Answer', text: 'Your score combines time and moves. Fewer moves and faster time = better score. A perfect game is 8 moves (one match per attempt). Your best score and time are saved.' } },
          { '@type': 'Question', name: 'Can I share my results?', acceptedAnswer: { '@type': 'Answer', text: 'Yes! After completing the game, you can share your time and move count. Challenge your friends to beat your score on the same daily board.' } },
          { '@type': 'Question', name: 'What cards are used in the game?', acceptedAnswer: { '@type': 'Answer', text: 'Cards are drawn from over 4,000 sports cards across baseball, basketball, football, and hockey. Each day features a mix of sports, eras, and player types.' } },
        ],
      }} />

      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-violet-950/60 border border-violet-800/50 text-violet-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
          New board daily
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Memory Match</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Flip and match 8 pairs of sports cards. New board every day. How fast can you clear it?
        </p>
      </div>

      {/* Game */}
      <MemoryMatchClient />

      {/* Bottom links */}
      <div className="mt-12 p-5 bg-gray-900/40 border border-gray-800 rounded-2xl">
        <h3 className="text-white font-semibold text-sm mb-3">More Daily Games</h3>
        <div className="flex flex-wrap gap-2">
          {[
            { href: '/guess-the-card', label: 'Guess the Card' },
            { href: '/trivia', label: 'Daily Trivia' },
            { href: '/flip-or-keep', label: 'Flip or Keep' },
            { href: '/card-battle', label: 'Card Battles' },
            { href: '/bingo', label: 'Card Bingo' },
            { href: '/rip-or-skip', label: 'Rip or Skip' },
            { href: '/tools/daily-pack', label: 'Daily Free Pack' },
            { href: '/card-of-the-day', label: 'Card of the Day' },
            { href: '/my-hub', label: 'My Hub' },
          ].map(l => (
            <Link key={l.href} href={l.href} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white text-xs rounded-lg border border-gray-700 transition-colors">
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
