import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardCrosswordClient from './CardCrosswordClient';

export const metadata: Metadata = {
  title: 'Card Crossword — Mini Puzzle for Collectors | CardVault',
  description: 'Free daily mini crossword puzzle for card collectors. 5x5 grid with hobby-themed clues about grading, sets, card types, and collecting terms. New puzzle every day plus unlimited random mode.',
  openGraph: {
    title: 'Card Crossword — Daily Hobby Puzzle | CardVault',
    description: '5x5 crossword with hobby clues. New puzzle daily, unlimited random mode.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Crossword — CardVault',
    description: 'Mini crossword puzzle for card collectors. Test your hobby knowledge.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games' },
  { label: 'Card Crossword' },
];

const faqItems = [
  {
    question: 'What is the Card Crossword?',
    answer: 'The Card Crossword is a daily mini crossword puzzle designed for sports card collectors. Each puzzle is a 5x5 grid with across and down clues about card collecting terminology, grading companies, card types, set names, and hobby culture. New puzzles every day, plus unlimited random mode.',
  },
  {
    question: 'How do I fill in the crossword?',
    answer: 'Click any white cell to start typing. The puzzle auto-advances to the next cell in the active direction (across or down). Click a cell again to toggle direction. Click a clue to jump to that word. The puzzle auto-detects when you have solved it correctly.',
  },
  {
    question: 'What do the clues reference?',
    answer: 'Clues reference card collecting vocabulary: grading terms (PSA, BGS, CGC, slab, gem mint), card types (rookie, auto, base, parallel, SSP), selling platforms (eBay, COMC), card brands (Topps, Panini, Prizm), and hobby activities (rip, flip, pull, break). Every answer is a real hobby term.',
  },
  {
    question: 'Is the daily puzzle the same for everyone?',
    answer: 'Yes, the daily puzzle is generated from a date-based seed so all players get the same puzzle each day. This makes it fun to compare with friends. Random mode gives a different puzzle each time for unlimited practice.',
  },
  {
    question: 'Can I reveal the answer if I get stuck?',
    answer: 'Yes, click the Reveal Answer button to see the complete solution. Your streak will reset, but you can start fresh with a random puzzle right away. Use the clues list — clicking a clue jumps to that word in the grid.',
  },
];

export default function CardCrosswordPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Crossword — Mini Hobby Puzzle',
        description: 'Daily mini crossword puzzle for sports card collectors with hobby-themed clues.',
        url: 'https://cardvault-two.vercel.app/card-crossword',
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
          5×5 Grid &middot; Hobby Clues &middot; Daily Puzzle
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Crossword</h1>
        <p className="text-gray-400 text-lg max-w-xl">
          Mini crossword puzzle for card collectors. Fill in hobby terms from the clues. How fast can you solve it?
        </p>
      </div>

      <CardCrosswordClient />

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
