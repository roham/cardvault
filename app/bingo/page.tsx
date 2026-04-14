import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import BingoClient from './BingoClient';

export const metadata: Metadata = {
  title: 'Card Bingo — Daily Collecting Challenge',
  description: 'Daily 5x5 bingo card with collecting challenges. Complete rows, columns, or diagonals to earn points. Explore tools, open packs, and discover cards across CardVault. New board every day.',
  openGraph: {
    title: 'Card Bingo — CardVault',
    description: 'Daily 5x5 bingo board with collecting challenges. Complete lines to score points. New board every day.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Bingo — CardVault',
    description: 'Daily collecting bingo. 25 challenges, 5x5 grid. Complete lines to score. New board daily.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Card Bingo' },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How does Card Bingo work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Each day you get a fresh 5x5 bingo board with 25 collecting challenges. Tap a square to complete it (visit the linked feature or answer the prompt). Complete 5 in a row, column, or diagonal to score a Bingo. The center square is always free.',
      },
    },
    {
      '@type': 'Question',
      name: 'When does the bingo board reset?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A brand new bingo board is generated every day at midnight. Your progress resets with the new board, but your lifetime stats (total bingos, best streak, days played) are saved.',
      },
    },
    {
      '@type': 'Question',
      name: 'What do I win for getting a bingo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Each bingo (completed line) earns points. A single line = 100 points, two lines = 250, three lines = 500, and a full blackout (all 25 squares) = 1,000 points. Track your lifetime score on the stats panel.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I share my bingo results?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! After completing your board, use the Share button to copy a visual grid of your results (like Wordle) that you can paste on social media or share with friends.',
      },
    },
  ],
};

export default function BingoPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Bingo — Daily Collecting Challenge',
        description: 'Daily 5x5 bingo card with collecting challenges. Complete rows, columns, or diagonals to earn points.',
        url: 'https://cardvault-two.vercel.app/bingo',
        applicationCategory: 'GameApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      }} />
      <JsonLd data={faqSchema} />

      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-yellow-950/60 border border-yellow-800/50 text-yellow-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
          New board daily
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Bingo</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Daily 5x5 collecting challenge. Tap squares to complete them. Get 5 in a row for Bingo!
        </p>
      </div>

      {/* How to play */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
          <div className="text-lg mb-1">&#127922;</div>
          <p className="text-white text-sm font-medium">Get Board</p>
          <p className="text-gray-500 text-xs">New 5x5 daily</p>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
          <div className="text-lg mb-1">&#9989;</div>
          <p className="text-white text-sm font-medium">Complete</p>
          <p className="text-gray-500 text-xs">Tap to mark</p>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
          <div className="text-lg mb-1">&#127942;</div>
          <p className="text-white text-sm font-medium">Score</p>
          <p className="text-gray-500 text-xs">Lines = points</p>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
          <div className="text-lg mb-1">&#128200;</div>
          <p className="text-white text-sm font-medium">Track</p>
          <p className="text-gray-500 text-xs">Lifetime stats</p>
        </div>
      </div>

      <BingoClient />

      {/* Related features */}
      <section className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">More Daily Games</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <Link href="/trivia" className="block p-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-600 transition-colors">
            <h3 className="font-semibold text-white">Daily Trivia</h3>
            <p className="text-sm text-gray-400">5 card collecting questions daily</p>
          </Link>
          <Link href="/flip-or-keep" className="block p-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-600 transition-colors">
            <h3 className="font-semibold text-white">Flip or Keep</h3>
            <p className="text-sm text-gray-400">10 cards — flip for cash or keep?</p>
          </Link>
          <Link href="/rip-or-skip" className="block p-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-600 transition-colors">
            <h3 className="font-semibold text-white">Rip or Skip</h3>
            <p className="text-sm text-gray-400">Should you open today&apos;s product?</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
