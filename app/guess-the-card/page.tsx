import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import GuessTheCardClient from './GuessTheCardClient';

export const metadata: Metadata = {
  title: 'Guess the Card — Daily Card Collecting Puzzle',
  description: 'Can you guess the mystery sports card in 6 tries? Get clues about sport, year, value, and set after each guess. A new puzzle every day — track your streak and share your results.',
  openGraph: {
    title: 'Guess the Card — CardVault',
    description: 'Daily card-guessing puzzle. 6 tries to identify the mystery card. Sport, year, value, and set clues after each guess.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Guess the Card — CardVault',
    description: 'Daily card puzzle for collectors. Can you guess it in 6 tries?',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Guess the Card' },
];

export default function GuessTheCardPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Guess the Card — Daily Card Puzzle',
        description: 'Daily card-guessing puzzle. 6 tries to identify the mystery sports card using sport, year, value, and set clues.',
        url: 'https://cardvault-two.vercel.app/guess-the-card',
        applicationCategory: 'GameApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      }} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          { '@type': 'Question', name: 'How does Guess the Card work?', acceptedAnswer: { '@type': 'Answer', text: 'Each day a mystery sports card is selected. You have 6 guesses to identify it. After each guess, you get color-coded clues: green means correct, yellow means close, red means wrong. Arrows show if you need to go higher or lower for year and value.' } },
          { '@type': 'Question', name: 'When does the daily puzzle reset?', acceptedAnswer: { '@type': 'Answer', text: 'A new mystery card is selected every day at midnight. Your streak tracks consecutive days played.' } },
          { '@type': 'Question', name: 'What clues do I get after each guess?', acceptedAnswer: { '@type': 'Answer', text: 'Five clues: Sport (correct or wrong), Year (exact, within 5 years, or wrong with direction), Value tier (exact, adjacent, or wrong with direction), Rookie status (match or not), and Set (correct or wrong).' } },
          { '@type': 'Question', name: 'Can I share my results?', acceptedAnswer: { '@type': 'Answer', text: 'Yes! After completing the puzzle, you can copy a Wordle-style emoji grid showing your guesses without spoiling the answer.' } },
          { '@type': 'Question', name: 'How many cards are in the puzzle pool?', acceptedAnswer: { '@type': 'Answer', text: 'The puzzle draws from over 4,000 sports cards across baseball, basketball, football, and hockey. Every day is a different card.' } },
        ],
      }} />

      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-amber-950/60 border border-amber-800/50 text-amber-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
          New puzzle daily
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Guess the Card</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Can you identify the mystery card in 6 tries? Each guess reveals clues about the sport, year, value, and more.
        </p>
      </div>

      {/* How to play */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
          <div className="text-lg mb-1">&#128269;</div>
          <p className="text-white text-sm font-medium">Search</p>
          <p className="text-gray-500 text-xs">Pick a card</p>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
          <div className="text-lg mb-1">&#127912;</div>
          <p className="text-white text-sm font-medium">Guess</p>
          <p className="text-gray-500 text-xs">Submit it</p>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
          <div className="text-lg mb-1">&#128161;</div>
          <p className="text-white text-sm font-medium">Clues</p>
          <p className="text-gray-500 text-xs">Read feedback</p>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
          <div className="text-lg mb-1">&#127942;</div>
          <p className="text-white text-sm font-medium">Solve</p>
          <p className="text-gray-500 text-xs">Share results</p>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-8 p-4 bg-gray-900/40 border border-gray-800 rounded-2xl">
        <h3 className="text-white font-semibold text-sm mb-2">Clue Colors</h3>
        <div className="flex flex-wrap gap-3 text-xs text-gray-400">
          <span className="inline-flex items-center gap-1"><span className="w-4 h-4 bg-emerald-600 rounded" /> Correct</span>
          <span className="inline-flex items-center gap-1"><span className="w-4 h-4 bg-amber-600 rounded" /> Close</span>
          <span className="inline-flex items-center gap-1"><span className="w-4 h-4 bg-red-900 rounded" /> Wrong</span>
          <span className="inline-flex items-center gap-1">&#11014;&#65039; Higher</span>
          <span className="inline-flex items-center gap-1">&#11015;&#65039; Lower</span>
        </div>
      </div>

      {/* Game */}
      <GuessTheCardClient />

      {/* Bottom links */}
      <div className="mt-12 p-5 bg-gray-900/40 border border-gray-800 rounded-2xl">
        <h3 className="text-white font-semibold text-sm mb-3">More Daily Activities</h3>
        <div className="flex flex-wrap gap-2">
          {[
            { href: '/trivia', label: 'Daily Trivia' },
            { href: '/flip-or-keep', label: 'Flip or Keep' },
            { href: '/card-of-the-day', label: 'Card of the Day' },
            { href: '/rip-or-skip', label: 'Rip or Skip' },
            { href: '/tools/daily-pack', label: 'Daily Free Pack' },
            { href: '/bingo', label: 'Collector Bingo' },
            { href: '/card-battle', label: 'Card Battle' },
            { href: '/streak', label: 'Streak Tracker' },
            { href: '/weekly-challenge', label: 'Weekly Challenge' },
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
