import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardDetectiveClient from './CardDetectiveClient';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Card Detective — Daily Mystery Card Game | CardVault',
  description: 'Free daily card guessing game. Identify the mystery sports card from progressive clues about sport, era, value, and set. New card every day. Track your streak and stats.',
  openGraph: {
    title: 'Card Detective — CardVault',
    description: 'Can you identify the mystery card? Daily guessing game with 6 progressive clues.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Detective — CardVault',
    description: 'Daily mystery card game. Identify the card from clues. Track your streak.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/games' },
  { label: 'Card Detective' },
];

const faqItems = [
  {
    question: 'How does Card Detective work?',
    answer: 'Each day, a mystery card is selected from our database of 5,700+ sports cards. You start with one clue (the sport) and try to guess the player. Each wrong guess reveals the next clue. You have 6 clues total: sport, era/decade, rookie status, value tier, exact year, and card set. Try to solve it with as few clues as possible.',
  },
  {
    question: 'Is it the same card for everyone?',
    answer: 'Yes! The daily mystery card is the same for all players. The card is selected using a deterministic algorithm based on the date, so everyone gets the same challenge. Compare your results with friends to see who needed fewer clues.',
  },
  {
    question: 'When does the card reset?',
    answer: 'A new mystery card is available every day at midnight in your local timezone. Your progress and guesses are saved locally, so you can close the page and come back to finish later the same day.',
  },
  {
    question: 'What if I cannot figure it out?',
    answer: 'After 6 wrong guesses, all clues are revealed and the answer is shown. The game tracks your win rate and distribution of how many clues you typically need. Even losses help you learn about cards in the database for future games.',
  },
];

export default function CardDetectivePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Detective',
        description: 'Daily mystery card guessing game. Identify sports cards from progressive clues about sport, era, value, and set.',
        url: 'https://cardvault-two.vercel.app/card-detective',
        applicationCategory: 'GameApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      }} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map(item => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      }} />

      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-indigo-950/60 border border-indigo-800/50 text-indigo-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
          New Mystery Card Daily
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Detective</h1>
        <p className="text-gray-400 text-lg max-w-xl">
          Can you identify the mystery card? You get 6 clues — each wrong guess reveals the next one. Solve it with fewer clues for a better score.
        </p>
      </div>

      {/* Game */}
      <CardDetectiveClient />

      {/* FAQ */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-white mb-6">How to Play</h2>
        <div className="space-y-4">
          {faqItems.map((item) => (
            <div key={item.question} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-2">{item.question}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* More games */}
      <div className="mt-12 bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-white font-bold text-lg mb-4">More Games</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/card-streak', label: 'Card Streak' },
            { href: '/card-memory', label: 'Memory Match' },
            { href: '/price-is-right', label: 'Price is Right' },
            { href: '/card-battles', label: 'Card Battles' },
            { href: '/tournament', label: 'Tournament' },
            { href: '/trivia', label: 'Card Trivia' },
          ].map(t => (
            <Link
              key={t.href}
              href={t.href}
              className="flex items-center justify-center px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 rounded-lg text-xs font-medium transition-colors"
            >
              {t.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
