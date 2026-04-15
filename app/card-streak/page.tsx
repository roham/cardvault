import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardStreakClient from './CardStreakClient';

export const metadata: Metadata = {
  title: 'Card Streak — Higher or Lower Card Value Game | CardVault',
  description: 'How well do you know card values? See a card and its price, then guess if the next card is worth MORE or LESS. Build the longest streak you can. Daily challenge + endless mode. Free card collecting game.',
  openGraph: {
    title: 'Card Streak — CardVault',
    description: 'Higher or lower card value game. Build the longest streak you can!',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Streak — CardVault',
    description: 'Higher or lower card value game. How long can you keep the streak alive?',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Card Streak' },
];

const faqItems = [
  {
    question: 'How does Card Streak work?',
    answer: 'You see a sports card with its estimated value. Then a mystery card appears. You guess whether the mystery card is worth MORE or LESS than the current card. Guess correctly to extend your streak. One wrong answer ends the game. Try to build the longest streak possible!',
  },
  {
    question: 'What is the difference between Daily and Endless mode?',
    answer: 'Daily Challenge gives everyone the same 50-card sequence each day, so you can compare streaks with friends. Endless Mode uses a random sequence from all 5,000+ cards in the database — no limit on how long you can go.',
  },
  {
    question: 'What happens when two cards have the same value?',
    answer: 'If two cards have the same estimated value, either answer (Higher or Lower) is accepted as correct. You will never lose on a tie.',
  },
  {
    question: 'How are card values determined?',
    answer: 'Card values are estimated raw (ungraded) market prices based on recent sales data from platforms like eBay. Values represent typical market prices and may vary based on condition, timing, and seller.',
  },
  {
    question: 'What do the grades mean?',
    answer: 'S (20+ streak) = Market Genius. A (15+) = Sharp Trader. B (10+) = Savvy Collector. C (5+) = Decent Eye. D (2+) = Getting Warmer. F = Study Up! Your grade is based on how long you can maintain your streak.',
  },
];

export default function CardStreakPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Streak — Higher or Lower Card Value Game',
        description: 'Guess if the next card is worth more or less. Build the longest streak you can from 5,000+ real sports cards.',
        url: 'https://cardvault-two.vercel.app/card-streak',
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
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Higher or Lower &middot; Daily + Endless &middot; 5,000+ Cards &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Streak</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Is the next card worth more or less? Build the longest streak you can. One wrong answer and it&apos;s game over.
        </p>
      </div>

      <CardStreakClient />

      {/* FAQ Section */}
      <div className="mt-12 border-t border-gray-800/50 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-900/40 border border-gray-800/50 rounded-lg">
              <summary className="cursor-pointer p-4 text-white font-medium hover:text-emerald-400 transition-colors">
                {faq.question}
              </summary>
              <div className="px-4 pb-4 text-gray-400 text-sm">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
