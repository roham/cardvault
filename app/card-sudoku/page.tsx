import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardSudokuClient from './CardSudokuClient';

export const metadata: Metadata = {
  title: 'Card Sudoku — Sports Card Logic Puzzle | CardVault',
  description: 'Free card sudoku puzzle for sports card collectors. Place cards from 4 sports into a 4x4 grid — each row and column needs exactly one MLB, NBA, NFL, and NHL card. Daily challenge plus unlimited random mode.',
  openGraph: {
    title: 'Card Sudoku — Logic Puzzle for Collectors | CardVault',
    description: '4x4 grid, 4 sports. Place cards so each row and column has one of each sport. Daily + random.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Sudoku — CardVault',
    description: 'Sports card logic puzzle. One of each sport per row and column.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games' },
  { label: 'Card Sudoku' },
];

const faqItems = [
  {
    question: 'What is Card Sudoku?',
    answer: 'Card Sudoku is a logic puzzle for sports card collectors. You have a 4x4 grid and must place cards from 4 sports (MLB, NBA, NFL, NHL) so that each row and column contains exactly one card from each sport. Some cells are pre-filled as clues — use logic to figure out the rest.',
  },
  {
    question: 'How do I place cards?',
    answer: 'First, select a sport from the palette at the top (baseball, basketball, football, or hockey). Then click any empty cell to place that sport there. If the placement is wrong for that cell, it will flash red. Double-click a non-clue cell to clear your placement.',
  },
  {
    question: 'What makes this different from regular Sudoku?',
    answer: 'Instead of numbers 1-9 in a 9x9 grid, Card Sudoku uses real sports cards from 4 sports in a 4x4 grid. Each card shows a real player from the CardVault database. The constraint is the same — each row and column must have exactly one of each type.',
  },
  {
    question: 'Is the daily puzzle the same for everyone?',
    answer: 'Yes, the Daily Challenge generates the same puzzle for all players based on the date. Compare strategies with friends! Random mode generates a unique puzzle each time for unlimited practice.',
  },
  {
    question: 'What are the clue cells?',
    answer: 'Clue cells are pre-filled cards that cannot be changed. They show a sport icon, player name, and a "clue" label. Use these locked cells as starting points to logically deduce which sports go in the remaining empty cells.',
  },
];

export default function CardSudokuPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Sudoku — Sports Card Logic Puzzle',
        description: 'Place cards from 4 sports into a 4x4 grid with logic constraints.',
        url: 'https://cardvault-two.vercel.app/card-sudoku',
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
          4×4 Grid &middot; 4 Sports &middot; Daily Puzzle
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Sudoku</h1>
        <p className="text-gray-400 text-lg max-w-xl">
          Place one ⚾ 🏀 🏈 🏒 card in each row and column. Use logic and the clues to solve the grid.
        </p>
      </div>

      <CardSudokuClient />

      {/* FAQ */}
      <div className="mt-12">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-800/50 border border-gray-700/50 rounded-xl">
              <summary className="flex items-center justify-between cursor-pointer px-5 py-4 text-white font-medium text-sm">
                {faq.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform ml-2">&#9660;</span>
              </summary>
              <div className="px-5 pb-4 text-gray-400 text-sm leading-relaxed">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link href="/" className="text-amber-400 hover:text-amber-300 text-sm transition-colors">
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
}
