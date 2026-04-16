import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardMastermindClient from './CardMastermindClient';

export const metadata: Metadata = {
  title: 'Card Mastermind — Daily Card Deduction Puzzle | CardVault',
  description: 'Free daily card mastermind puzzle. A mystery sports card is hidden — deduce its decade, sport, rookie status, and value tier in 10 guesses. Green / yellow / white feedback per attribute. Sport filter and share-your-grid.',
  openGraph: {
    title: 'Card Mastermind — CardVault',
    description: 'Crack the mystery card in 10 guesses. Deductive attribute puzzle with 4-dimension feedback. Daily and random modes.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Mastermind — CardVault',
    description: 'Can you crack the mystery card in 10 guesses? Daily deduction puzzle.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/games' },
  { label: 'Card Mastermind' },
];

const faqItems = [
  {
    question: 'How is Card Mastermind different from Wordle or Connections?',
    answer: 'Wordle asks you to guess a specific 5-letter word with per-letter feedback. Card Connections asks you to group 16 tiles into four themes. Card Mastermind is a deductive attribute puzzle inspired by the classic Mastermind board game — the hidden target is a real sports card from our 9,968-card database, and each guess narrows the answer along four axes: decade, sport, rookie status, and value tier. Green means that attribute is exactly right. Yellow means decade or value tier is one step off. White means wrong. After 10 guesses, you either match all four exactly (a win) or the mystery card is revealed.',
  },
  {
    question: 'Why are only decade and value tier eligible for yellow feedback?',
    answer: 'Decade and value tier are ordered scales — the 1980s are closer to the 1990s than to the 1920s, and the $100-$999 tier is closer to the $1K-$9.9K tier than to the under-$25 tier. Yellow on these axes gives you actionable signal: you were close, try one step up or down. Sport and rookie status are categorical with no ordering — a card is either baseball or it is not, and either a rookie or not. Those two attributes use binary green-or-white feedback because partial credit would be meaningless.',
  },
  {
    question: 'What makes the S grade possible?',
    answer: 'The S grade is awarded for solving in 2 or fewer guesses. This is possible but very rare — you essentially need to get lucky with your first guess narrowing the answer to a single combination. In Daily mode, the mystery card is seeded from the date, so the answer is the same for every player on a given day. Share your grid emoji pattern to compare with friends. A grade means 3 guesses, B means 4-5, C means 6-7, D means 8-9, F means you ran out of guesses.',
  },
  {
    question: 'Is the Daily card the same for everyone?',
    answer: 'Yes. The daily mystery card is selected from the card pool using a deterministic seed based on today\'s date (plus the first character of your sport filter if you change it). Everyone who plays the same day with the same sport filter gets the same hidden card. Share your emoji grid — 4 squares per guess, green/yellow/white — and compare how many guesses it took to crack it. The card resets each day at local midnight.',
  },
  {
    question: 'How should I approach the first guess?',
    answer: 'The best opening guess maximizes the information you gain regardless of the answer. A neutral opener like "2010s / baseball / rookie / $100-$999" covers high-probability mid-tier ranges in a popular decade and sport. If decade comes back yellow, you know it\'s either the 2000s or 2020s. If value tier comes back white, you know the card is much cheaper or much more expensive — pivot toward the extremes on your next guess. Each guess should split the remaining possibility space as evenly as possible.',
  },
  {
    question: 'Why does the "Rookie" filter change my strategy?',
    answer: 'Modern packs emphasize rookies heavily, so rookie-to-veteran ratios skew across decades. In the 1950s-1970s, rookie cards were just cards — most weren\'t labeled as such. In the 1980s-present, rookies became a recognized category with clear designations like RC stamps, Bowman Chrome 1st, and autographed prospects. If the mystery is from the 1960s, rookie status is harder to predict; if it\'s from the 2010s-2020s, rookies are the dominant category in our database. Use decade feedback to weight your rookie guess accordingly.',
  },
];

export default function CardMastermindPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Card Mastermind',
        description: 'Daily deductive puzzle game where players must identify a mystery sports card in 10 guesses by selecting decade, sport, rookie status, and value tier attributes with green/yellow/white feedback.',
        url: 'https://cardvault-two.vercel.app/card-mastermind',
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
        <div className="inline-flex items-center gap-2 bg-violet-950/60 border border-violet-800/50 text-violet-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
          Mastermind &middot; Daily deduction &middot; 10 guesses &middot; 4 attributes
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">Card Mastermind</h1>
        <p className="text-gray-400 text-lg">
          A mystery sports card is hidden. Deduce its <strong className="text-white">decade</strong>, <strong className="text-white">sport</strong>,
          {' '}<strong className="text-white">rookie status</strong>, and <strong className="text-white">value tier</strong> in ten guesses.
          {' '}Green means exact, yellow means one step off (decade or value only), white means wrong.
        </p>
      </div>

      <CardMastermindClient />

      {/* FAQ */}
      <div className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-800/40 border border-gray-700/40 rounded-lg">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium hover:text-violet-400 transition-colors">
                {faq.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform">&#9660;</span>
              </summary>
              <div className="px-4 pb-4 text-sm text-gray-400">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>

      {/* Related Games */}
      <div className="mt-8 border-t border-gray-800 pt-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Related Games</h3>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/card-wordle" className="text-violet-500 hover:text-violet-400">Card Wordle</Link>
          <Link href="/card-connections" className="text-violet-500 hover:text-violet-400">Card Connections</Link>
          <Link href="/card-detective" className="text-violet-500 hover:text-violet-400">Card Detective</Link>
          <Link href="/card-poker" className="text-violet-500 hover:text-violet-400">Card Poker</Link>
          <Link href="/card-chain" className="text-violet-500 hover:text-violet-400">Card Chain</Link>
          <Link href="/rank-or-tank" className="text-violet-500 hover:text-violet-400">Rank or Tank</Link>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <Link href="/games" className="text-violet-500 hover:text-violet-400">&larr; All Games</Link>
        <Link href="/tools" className="text-violet-500 hover:text-violet-400">Tools</Link>
        <Link href="/" className="text-violet-500 hover:text-violet-400">Home</Link>
      </div>
    </div>
  );
}
