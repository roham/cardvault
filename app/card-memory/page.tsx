import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardMemoryClient from './CardMemoryClient';

export const metadata: Metadata = {
  title: 'Card Memory Match — Flip, Match & Test Your Knowledge | CardVault',
  description: 'Classic memory matching game with real sports cards. Match player pairs across 3 difficulty levels. Daily challenge mode with the same cards for everyone. Free, mobile-friendly.',
  openGraph: {
    title: 'Card Memory Match — Flip, Match & Test Your Knowledge | CardVault',
    description: 'Classic memory game with real sports cards. 3 difficulties, daily challenge, and sport filters.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Memory Match — CardVault',
    description: 'Memory matching game with 5,300+ real sports cards. Free daily challenge.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/games' },
  { label: 'Card Memory Match' },
];

const faqItems = [
  {
    question: 'How do I play Card Memory Match?',
    answer: 'Flip two cards per turn to reveal the player underneath. If both cards show the same player, it is a match and they stay face-up. If not, they flip back. Match all pairs to win. Fewer moves and faster times earn better ratings.',
  },
  {
    question: 'What are the difficulty levels?',
    answer: 'Easy has 6 pairs (12 cards in a 4x3 grid), Medium has 8 pairs (16 cards in a 4x4 grid), and Hard has 10 pairs (20 cards in a 5x4 grid). Higher difficulties require more memory and concentration.',
  },
  {
    question: 'What is the Daily Challenge?',
    answer: 'The Daily Challenge uses the same set of cards for all players on a given day. Compare your score with friends to see who can match all pairs in the fewest moves. A new challenge appears every day.',
  },
  {
    question: 'Can I filter by sport?',
    answer: 'Yes. Choose All Sports to see cards from every sport, or filter to baseball, basketball, football, or hockey only. Each sport draws from its full player database.',
  },
  {
    question: 'How is the star rating calculated?',
    answer: 'Three stars means you matched all pairs in near-perfect moves (pairs + 2 or fewer extra moves). Two stars means under double the number of pairs. One star is awarded for completing the game regardless of moves.',
  },
];

export default function CardMemoryPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Memory Match — Sports Card Memory Game',
        description: 'Classic memory matching game using real sports cards from 5,300+ card database.',
        url: 'https://cardvault-two.vercel.app/card-memory',
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

      <Breadcrumb items={breadcrumbs} />

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-violet-950/60 border border-violet-800/50 text-violet-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-violet-400 rounded-full" />
          3 Difficulties - Daily Challenge - Sport Filters - High Scores
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Memory Match</h1>
        <p className="text-gray-400 text-lg">
          Flip cards, find matching players. Classic memory game with 5,300+ real sports cards.
        </p>
      </div>

      <CardMemoryClient />

      {/* Related Games */}
      <section className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link href="/card-streak" className="flex items-center gap-2 px-3 py-2.5 bg-gray-900/60 border border-gray-800 hover:border-gray-600 rounded-xl transition-colors text-sm">
          <span>📈</span>
          <span className="text-gray-300">Card Streak</span>
        </Link>
        <Link href="/price-is-right" className="flex items-center gap-2 px-3 py-2.5 bg-gray-900/60 border border-gray-800 hover:border-gray-600 rounded-xl transition-colors text-sm">
          <span>💰</span>
          <span className="text-gray-300">Price is Right</span>
        </Link>
        <Link href="/trivia" className="flex items-center gap-2 px-3 py-2.5 bg-gray-900/60 border border-gray-800 hover:border-gray-600 rounded-xl transition-colors text-sm">
          <span>🧠</span>
          <span className="text-gray-300">Card Trivia</span>
        </Link>
        <Link href="/card-bingo" className="flex items-center gap-2 px-3 py-2.5 bg-gray-900/60 border border-gray-800 hover:border-gray-600 rounded-xl transition-colors text-sm">
          <span>🎯</span>
          <span className="text-gray-300">Card Bingo</span>
        </Link>
      </section>

      {/* FAQ section */}
      <section className="mt-16 border-t border-gray-800 pt-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map(f => (
            <details key={f.question} className="group bg-gray-900 border border-gray-800 rounded-xl">
              <summary className="px-5 py-4 text-white font-medium cursor-pointer hover:text-emerald-400 transition-colors">
                {f.question}
              </summary>
              <div className="px-5 pb-4 text-gray-400 text-sm">
                {f.answer}
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
