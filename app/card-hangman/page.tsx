import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardHangmanClient from './CardHangmanClient';

export const metadata: Metadata = {
  title: 'Card Hangman — Guess the Mystery Player Name | CardVault',
  description: 'Classic hangman with sports card players. Guess the mystery player name letter by letter. Use hints about sport, position, and era. Daily challenge mode with the same player for everyone. 2,000+ players from MLB, NBA, NFL, and NHL.',
  openGraph: {
    title: 'Card Hangman — Guess the Player | CardVault',
    description: 'Guess the mystery sports card player letter by letter. Daily challenge + random mode.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Hangman — CardVault',
    description: 'Classic hangman with 2,000+ sports card players. Daily challenge + hints.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/games' },
  { label: 'Card Hangman' },
];

const faqItems = [
  {
    question: 'How does Card Hangman work?',
    answer: 'A mystery player name is hidden behind blank spaces. Guess one letter at a time by tapping the on-screen keyboard. Correct letters are revealed in position. Wrong guesses add body parts to the hangman figure. You have 6 wrong guesses before the game ends.',
  },
  {
    question: 'What hints are available?',
    answer: 'Four hints are available in order: Sport (MLB/NBA/NFL/NHL), Position (QB, PG, SP, etc.), Era (Pre-1960 through Modern), and Cards in Database. Hints are revealed sequentially — you must reveal Hint 1 before Hint 2. Using fewer hints earns more bragging rights.',
  },
  {
    question: 'Is there a daily challenge?',
    answer: 'Yes! The Daily Challenge uses the same mystery player for everyone, so you can compare results with friends. Switch to Random mode for unlimited games with different players each time.',
  },
  {
    question: 'How many players are in the game?',
    answer: 'Card Hangman draws from over 2,000 unique players across MLB, NBA, NFL, and NHL in the CardVault database. Only players with 2 or more cards and names of 5+ characters are included, ensuring quality puzzles.',
  },
  {
    question: 'What if the player name has special characters?',
    answer: 'Spaces, periods, hyphens, and apostrophes in player names are shown automatically — you only need to guess the letters A-Z. Names like "J.J. Watt" or "De\'Aaron Fox" will have the special characters pre-filled.',
  },
];

export default function CardHangmanPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Hangman',
        description: 'Classic hangman game with 2,000+ sports card players. Guess the mystery player name letter by letter with hints.',
        applicationCategory: 'GameApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        url: 'https://cardvault-two.vercel.app/card-hangman',
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

      <CardHangmanClient />

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
            { href: '/card-detective', label: 'Card Detective', desc: 'Daily mystery card guessing game' },
            { href: '/card-connections', label: 'Card Connections', desc: 'Group 16 items into 4 categories' },
            { href: '/card-crossword', label: 'Card Crossword', desc: 'Daily mini crossword with hobby clues' },
            { href: '/card-sudoku', label: 'Card Sudoku', desc: 'Logic puzzle — one sport per row' },
            { href: '/trivia', label: 'Card Trivia', desc: '40 questions across 6 categories' },
            { href: '/card-scramble', label: 'Card Scramble', desc: 'Unscramble player names and terms' },
            { href: '/word-search', label: 'Word Search', desc: 'Find hidden words in the grid' },
            { href: '/card-minesweeper', label: 'Card Minesweeper', desc: 'Find hidden hit cards' },
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
