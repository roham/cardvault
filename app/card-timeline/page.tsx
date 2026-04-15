import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardTimelineClient from './CardTimelineClient';

export const metadata: Metadata = {
  title: 'Card Timeline Challenge — Sort Cards by Year | CardVault',
  description: 'Test your card collecting knowledge! Sort 7 random sports cards in chronological order. Daily challenge mode with the same cards for everyone. Score by accuracy and speed. Free game for card collectors.',
  openGraph: {
    title: 'Card Timeline Challenge — CardVault',
    description: 'Sort sports cards by year. Daily challenge + random mode. How well do you know your card history?',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Timeline Challenge — CardVault',
    description: 'Sort sports cards by year. Test your card collecting knowledge!',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/my-hub' },
  { label: 'Card Timeline Challenge' },
];

const faqItems = [
  {
    question: 'How does the Card Timeline Challenge work?',
    answer: 'You are shown 7 sports cards in a random order. Your goal is to arrange them in chronological order from oldest to newest by dragging cards into the correct positions. You earn points based on how many cards you place correctly and how fast you complete the puzzle. The Daily Challenge uses the same cards for everyone, so you can compare scores with friends.',
  },
  {
    question: 'How is my score calculated?',
    answer: 'You earn 100 points for each card placed in the exact correct position, plus bonus points for speed. A perfect placement of all 7 cards earns 700 base points plus up to 300 speed bonus points (1000 max). If a card is one position off, you earn 30 points. Two or more positions off earns 0. Your final score is graded on an S/A/B/C/D/F scale.',
  },
  {
    question: 'What is the difference between Daily Challenge and Random Game?',
    answer: 'The Daily Challenge uses a fixed set of 7 cards that are the same for all players on a given day, allowing you to compare your score and strategy with others. Random Game generates a fresh set of cards each time you play, giving you unlimited practice. Both modes count toward your stats (games played, best score, accuracy).',
  },
  {
    question: 'Does Card Timeline Challenge track my progress?',
    answer: 'Yes! The game tracks your total games played, best score ever, average accuracy percentage, and current daily streak (consecutive days playing the Daily Challenge). All stats are saved locally in your browser. You can also share your daily score with a visual emoji grid showing which cards you placed correctly.',
  },
  {
    question: 'What types of cards appear in the game?',
    answer: 'Cards span the full history of sports card collecting, from vintage pre-war cards (1900s-1940s) through the junk wax era (1980s-1990s) to ultra-modern releases (2020s). You might see a 1933 Goudey Babe Ruth next to a 2024 Bowman Chrome prospect card. The game draws from over 6,500 real cards across baseball, basketball, football, and hockey.',
  },
];

export default function CardTimelinePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Timeline Challenge',
        description: 'Sort sports cards in chronological order. Daily challenge and random modes with score tracking.',
        url: 'https://cardvault-two.vercel.app/card-timeline',
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
          Sort Cards by Year
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Card Timeline Challenge
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Can you arrange 7 sports cards in chronological order? Test your knowledge of card collecting history from vintage to ultra-modern.
        </p>
      </div>

      <CardTimelineClient />

      {/* FAQ */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((f, i) => (
            <details key={i} className="group bg-gray-900/50 border border-gray-800 rounded-xl">
              <summary className="flex items-center justify-between cursor-pointer px-6 py-4 text-white font-medium">
                {f.question}
                <span className="ml-2 text-gray-500 group-open:rotate-180 transition-transform">&#9662;</span>
              </summary>
              <div className="px-6 pb-4 text-gray-400 text-sm leading-relaxed">
                {f.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Related Games */}
      <section className="mt-12 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">More Games</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/card-streak', label: 'Card Streak', icon: '🔥' },
            { href: '/grading-game', label: 'Grading Game', icon: '🎯' },
            { href: '/card-trivia', label: 'Card Trivia', icon: '🧠' },
            { href: '/card-detective', label: 'Card Detective', icon: '🔍' },
            { href: '/price-prediction', label: 'Price Prediction', icon: '📈' },
            { href: '/card-memory', label: 'Memory Match', icon: '🧩' },
          ].map(t => (
            <Link
              key={t.href}
              href={t.href}
              className="flex items-center gap-2 px-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-xl text-sm text-gray-300 hover:text-white transition-colors"
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
