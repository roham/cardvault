import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardWordleClient from './CardWordleClient';

export const metadata: Metadata = {
  title: 'Card Wordle — Guess the Mystery Player in 6 Tries | CardVault',
  description: 'Free Wordle-style guessing game for sports card collectors. Guess the mystery player in 6 tries using color-coded clues about sport, position, team, era, and card value. Daily challenge + unlimited random games. 8,600+ real cards from MLB, NBA, NFL, and NHL.',
  openGraph: {
    title: 'Card Wordle — Guess the Mystery Player | CardVault',
    description: 'Guess the mystery player in 6 tries with color-coded clues. Daily challenge + unlimited mode.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Wordle — CardVault',
    description: 'Wordle-style guessing game for card collectors. 6 tries, 5 clue categories, 8,600+ players.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/games' },
  { label: 'Card Wordle' },
];

const faqItems = [
  {
    question: 'How does Card Wordle work?',
    answer: 'You guess a mystery player in 6 tries. After each guess, you see color-coded clues for 5 categories: Sport, Position, Team, Era, and Value tier. Use the feedback to narrow down the possibilities and identify the mystery player before your guesses run out. A new daily puzzle is available every day, or switch to random mode for unlimited games.',
  },
  {
    question: 'What do the colors mean?',
    answer: 'Green means an exact match — your guess shares the same attribute as the mystery player. Yellow means close — for example, the same conference but different team, or an adjacent decade. Red means wrong — no overlap in that category. Use the combination of greens, yellows, and reds across all 5 categories to deduce the answer.',
  },
  {
    question: 'What are the 5 clue categories?',
    answer: 'Sport (MLB, NBA, NFL, or NHL), Position (QB, PG, SP, C, etc.), Team (the player\'s primary team), Era (the decade the player was most active — 1950s through 2020s), and Value tier (based on average card value in the database). Each category gives independent feedback after every guess.',
  },
  {
    question: 'Is the daily game the same for everyone?',
    answer: 'Yes! The daily puzzle uses a date-based seed so every player sees the same mystery player. This means you can share your results with friends and compare how many guesses it took. Switch to Random mode for unlimited practice puzzles with a different mystery player each time.',
  },
  {
    question: 'How is the value tier determined?',
    answer: 'Cards are grouped into 5 value tiers based on their average market value in the CardVault database: Budget (under $5), Mid ($5–$20), Premium ($20–$75), High-End ($75–$250), and Elite ($250+). The tier clue helps you gauge whether the mystery player is a common card or a high-value chase card.',
  },
];

export default function CardWordlePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Wordle',
        description: 'Wordle-style guessing game for sports card collectors. Guess the mystery player in 6 tries using color-coded clues about sport, position, team, era, and card value.',
        applicationCategory: 'GameApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        url: 'https://cardvault-two.vercel.app/card-wordle',
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

      <CardWordleClient />

      <section className="mt-16 border-t border-gray-800 pt-10">
        <h2 className="text-xl font-bold mb-4 text-white">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((f, i) => (
            <details key={i} className="group" open={i === 0}>
              <summary className="cursor-pointer text-gray-300 hover:text-white font-medium">{f.question}</summary>
              <p className="mt-2 text-gray-400 text-sm leading-relaxed">{f.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-12 border-t border-gray-800 pt-10">
        <h2 className="text-xl font-bold mb-4 text-white">More Card Games</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { href: '/card-groups', label: 'Card Groups', desc: 'Group 16 players into 4 categories' },
            { href: '/card-hangman', label: 'Card Hangman', desc: 'Guess the mystery player name' },
            { href: '/card-detective', label: 'Card Detective', desc: 'Daily mystery card guessing game' },
            { href: '/trivia', label: 'Card Trivia', desc: '40 questions across 6 categories' },
            { href: '/games', label: 'All Games', desc: 'Browse 50+ card collecting games' },
            { href: '/card-jeopardy', label: 'Card Jeopardy', desc: 'Sports card trivia Jeopardy-style' },
          ].map(l => (
            <Link key={l.href} href={l.href} className="block p-3 rounded-lg bg-gray-900/60 border border-gray-800 hover:border-gray-600 transition-colors">
              <div className="text-sm font-medium text-white">{l.label}</div>
              <div className="text-xs text-gray-400">{l.desc}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
