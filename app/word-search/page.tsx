import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import WordSearchClient from './WordSearchClient';

export const metadata: Metadata = {
  title: 'Card Word Search — Daily Puzzle Game for Collectors | CardVault',
  description: 'Find hidden card collecting words in a daily word search puzzle. 8 words per grid — hobby terms (Prizm, Chrome, Refractor) and player names (Trout, Jordan, Gretzky). Daily challenge with shared puzzles plus unlimited random mode.',
  openGraph: {
    title: 'Card Word Search — CardVault',
    description: 'Daily word search puzzle with card collecting terms and player names. Find all 8 words!',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Word Search — CardVault',
    description: 'Find hidden card collecting words in a daily puzzle. Share your time!',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/my-hub' },
  { label: 'Word Search' },
];

const faqItems = [
  {
    question: 'How do I play the Card Word Search?',
    answer: 'Click on cells in the grid to select letters that form a word from the word list. Words can be placed horizontally (left or right), vertically (down), or diagonally in any direction. Click cells one at a time to build your selection. When your selected letters match a word in the list, it will be marked as found. Right-click or tap the Clear button to reset your current selection. Find all 8 words to complete the puzzle.',
  },
  {
    question: 'What is the difference between Daily Challenge and Random mode?',
    answer: 'Daily Challenge generates the same puzzle for every player each day — everyone gets the same grid, same words, same layout. This lets you compare completion times with friends. Random mode generates a new unique puzzle each time you play, with unlimited puzzles available. Your stats track games played, best completion time, and total words found across both modes.',
  },
  {
    question: 'What types of words are hidden in the puzzle?',
    answer: 'Each puzzle contains 8 words split between two categories: 4 hobby terms (card brands like Topps, Prizm, Bowman; grading terms like Centering, Mint, Slab; product types like Chrome, Refractor, Insert) and 4 player names (legends and stars from baseball, basketball, football, and hockey). Words are color-coded: green for hobby terms and amber for player names.',
  },
  {
    question: 'Can words go in any direction?',
    answer: 'Words can go right (horizontal), down (vertical), diagonally down-right, diagonally up-right, left (reversed horizontal), and diagonally down-left. This means some words may appear backwards. Check all directions when searching for a word.',
  },
  {
    question: 'How is my score calculated?',
    answer: 'Your score is based on completion time — how quickly you find all 8 words. The game tracks your best time across all games played. There is no penalty for incorrect selections, so feel free to explore the grid. Share your results to compare times with friends.',
  },
];

export default function WordSearchPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Word Search',
        description: 'Daily word search puzzle with card collecting terms and player names. Find all 8 hidden words.',
        url: 'https://cardvault-two.vercel.app/word-search',
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
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          Daily Puzzle &middot; 8 Hidden Words &middot; Hobby Terms + Player Names
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Word Search</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Find 8 hidden words in the grid — card brands, hobby terms, and legendary player names. New daily puzzle every day, or play unlimited random puzzles.
        </p>
      </div>

      <WordSearchClient />

      {/* Related */}
      <section className="mt-16 mb-12">
        <h2 className="text-xl font-bold text-white mb-4">More Games</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { href: '/card-scramble', label: 'Card Scramble', icon: '🔤' },
            { href: '/card-trivia', label: 'Card Trivia', icon: '🧠' },
            { href: '/card-detective', label: 'Card Detective', icon: '🔍' },
            { href: '/card-timeline', label: 'Timeline Challenge', icon: '📅' },
            { href: '/grading-game', label: 'Grading Game', icon: '🎯' },
            { href: '/card-memory', label: 'Memory Match', icon: '🃏' },
            { href: '/card-streak', label: 'Card Streak', icon: '🔥' },
            { href: '/price-blitz', label: 'Price Blitz', icon: '⚡' },
          ].map(t => (
            <Link key={t.href} href={t.href} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 rounded-lg text-sm transition-colors">
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-800/50 border border-gray-700/50 rounded-xl">
              <summary className="cursor-pointer px-5 py-4 text-white font-medium text-sm flex items-center justify-between">
                {faq.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform ml-2">&#9662;</span>
              </summary>
              <div className="px-5 pb-4 text-gray-400 text-sm leading-relaxed">{faq.answer}</div>
            </details>
          ))}
        </div>
      </section>

      <section className="border-t border-gray-800 pt-8 mt-8 text-sm text-gray-500">
        <p>
          Try <Link href="/card-scramble" className="text-emerald-400 hover:underline">Card Scramble</Link> for word unscrambling,
          test your knowledge with <Link href="/card-trivia" className="text-emerald-400 hover:underline">Card Trivia</Link>,
          or play <Link href="/card-detective" className="text-emerald-400 hover:underline">Card Detective</Link>.
          Browse all <Link href="/tools" className="text-emerald-400 hover:underline">87+ collecting tools</Link>.
        </p>
      </section>
    </div>
  );
}
