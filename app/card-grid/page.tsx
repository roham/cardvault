import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardGridClient from './CardGridClient';

export const metadata: Metadata = {
  title: 'Card Grid Challenge — Immaculate Grid for Card Collectors | CardVault',
  description: 'Fill a 3x3 grid where each cell must match both its row and column criteria. Search 9,000+ real sports cards by sport, decade, value, and card type. Daily challenge plus random mode. The ultimate card knowledge test.',
  openGraph: {
    title: 'Card Grid Challenge — Immaculate Grid for Cards | CardVault',
    description: '3x3 grid puzzle. Each cell needs a card matching both row and column criteria. 9,000+ cards, 90 seconds, daily challenge.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Grid Challenge — CardVault',
    description: 'Immaculate Grid for card collectors. Fill all 9 cells using your sports card knowledge.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/games' },
  { label: 'Card Grid Challenge' },
];

const faqItems = [
  {
    question: 'How do I play Card Grid Challenge?',
    answer: 'You are presented with a 3x3 grid. Each row and each column has a criteria — like a specific sport, decade, value range, or card type (rookie vs veteran). Click a cell, then search for a card from the database that satisfies BOTH the row criteria and column criteria. Fill all 9 cells before the 90-second timer runs out. Correct placements earn 100 points plus a time bonus.',
  },
  {
    question: 'What types of criteria appear on the grid?',
    answer: 'Four types of criteria are used: Sport (Baseball, Basketball, Football, Hockey), Decade (Pre-1980 through 2020s), Value Tier (Under $25, $25-99, $100-499, $500+), and Card Type (Rookie or Veteran). Each game randomly pairs two different criteria types for rows and columns, creating unique puzzles every time.',
  },
  {
    question: 'Can I use the same card in multiple cells?',
    answer: 'No. Each card can only be placed once per game. This is why strategy matters — versatile cards that match multiple criteria should be saved for the hardest cells. Plan your picks carefully to avoid running out of options.',
  },
  {
    question: 'What happens if I pick a wrong card?',
    answer: 'Wrong picks stay on the board and count against your 9-guess limit, but they are marked in red. You still score 0 for that cell but you do not get another chance. Each game allows exactly 9 guesses — one per cell — so accuracy is critical.',
  },
  {
    question: 'Is the Daily Challenge the same for everyone?',
    answer: 'Yes. The Daily Challenge generates the same 3x3 grid for all players each day using a date-based seed. This means you can compare scores and share emoji result grids with friends. Random mode creates a unique grid each time for unlimited practice.',
  },
];

export default function CardGridPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Card Grid Challenge',
        description: 'Immaculate Grid-style puzzle game for sports card collectors. Fill a 3x3 grid where each cell must match both row and column criteria. 9,000+ real cards.',
        url: 'https://cardvault-two.vercel.app/card-grid',
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
        <div className="inline-flex items-center gap-2 bg-indigo-950/60 border border-indigo-800/50 text-indigo-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
          Card Grid &middot; Puzzle Game &middot; 9,000+ Cards
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Grid Challenge</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          The Immaculate Grid for card collectors. Fill every cell with a card that matches
          both its row and column criteria. 9 cells. 90 seconds. How well do you know your cards?
        </p>
      </div>

      <CardGridClient />

      {/* FAQ */}
      <div className="mt-12 bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, idx) => (
            <details key={idx} className="group">
              <summary className="cursor-pointer text-white font-medium text-sm hover:text-indigo-400 transition-colors list-none flex items-center gap-2">
                <span className="text-indigo-400/60 group-open:rotate-90 transition-transform">&#9654;</span>
                {faq.question}
              </summary>
              <p className="text-gray-400 text-sm mt-2 ml-5">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>

      {/* Internal Links */}
      <div className="mt-8 text-sm text-gray-500">
        <p>
          Part of the <Link href="/games" className="text-indigo-400 hover:underline">CardVault Games</Link> collection.
          See also: <Link href="/card-wordle" className="text-indigo-400 hover:underline">Card Wordle</Link>,{' '}
          <Link href="/card-groups" className="text-indigo-400 hover:underline">Card Groups</Link>,{' '}
          <Link href="/card-sudoku" className="text-indigo-400 hover:underline">Card Sudoku</Link>,{' '}
          <Link href="/card-detective" className="text-indigo-400 hover:underline">Card Detective</Link>,{' '}
          <Link href="/card-millionaire" className="text-indigo-400 hover:underline">Card Millionaire</Link>.
        </p>
      </div>
    </div>
  );
}
