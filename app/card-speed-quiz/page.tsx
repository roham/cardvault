import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import SpeedQuizClient from './SpeedQuizClient';

export const metadata: Metadata = {
  title: 'Card Speed Quiz — How Fast Can You Name That Player? | CardVault',
  description: 'Race against the clock to identify sports cards. See a card description, guess the player. 15 rounds, 10 seconds each. Daily challenge with shareable results. Test your card knowledge.',
  openGraph: {
    title: 'Card Speed Quiz — CardVault',
    description: 'Race the clock to guess sports card players. 15 rounds. How fast are you?',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Speed Quiz — CardVault',
    description: '15 rounds, 10 seconds each. Can you name every card player?',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/games' },
  { label: 'Speed Quiz' },
];

const faqItems = [
  {
    question: 'How does the Card Speed Quiz work?',
    answer: 'You get 15 rounds. Each round shows you clues about a sports card — the year, set, sport, card number, and a description hint. You choose the correct player from 4 options. The faster you answer correctly, the more points you score. Wrong answers score zero. Your total is based on speed and accuracy across all 15 rounds.',
  },
  {
    question: 'How is the score calculated?',
    answer: 'Each correct answer earns up to 1,000 points based on speed. Answer in under 2 seconds for the full 1,000. The score decreases linearly — at 5 seconds you get about 500, and at the 10-second limit you get 100 points. Wrong answers and timeouts score zero. A perfect game (all 15 correct, all under 2 seconds) would be 15,000 points.',
  },
  {
    question: 'Does the quiz change every day?',
    answer: 'Yes. The card selection and answer options shuffle daily using a date-based seed. You will see different cards each day, but everyone playing on the same day gets the same quiz. This makes it fair to compare scores with friends.',
  },
  {
    question: 'What sports are included?',
    answer: 'Cards from all four major sports: baseball, basketball, football, and hockey. The quiz draws from over 6,000 cards in the CardVault database spanning vintage legends to modern rookies.',
  },
  {
    question: 'Can I share my score?',
    answer: 'Yes! After completing all 15 rounds, you can copy your results to share on social media. The share card shows your score, accuracy, and average response time without spoiling the answers for others.',
  },
];

export default function SpeedQuizPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Speed Quiz',
        description: 'Race against the clock to identify sports card players. 15 rounds, daily challenge.',
        url: 'https://cardvault-two.vercel.app/card-speed-quiz',
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
        <div className="inline-flex items-center gap-2 bg-rose-950/60 border border-rose-800/50 text-rose-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse" />
          Daily Challenge &middot; 15 Rounds &middot; 10 Sec Each
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Card Speed Quiz
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl">
          How well do you know your cards? See the clues, pick the player, beat the clock.
          15 rounds, 10 seconds each. Score big by answering fast.
        </p>
      </div>

      <SpeedQuizClient />

      {/* Related Games */}
      <div className="mt-16 border-t border-zinc-800 pt-10">
        <h2 className="text-xl font-bold text-white mb-4">More Games</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/trivia" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-rose-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">Daily Trivia</h3>
            <p className="text-xs text-zinc-500">5 questions per day</p>
          </Link>
          <Link href="/guess-the-card" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-rose-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">Guess the Card</h3>
            <p className="text-xs text-zinc-500">Wordle for card collectors</p>
          </Link>
          <Link href="/flip-or-keep" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-rose-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">Flip or Keep</h3>
            <p className="text-xs text-zinc-500">Flip for cash or keep?</p>
          </Link>
          <Link href="/hot-potato" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-rose-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">Hot Potato</h3>
            <p className="text-xs text-zinc-500">Sell before the crash</p>
          </Link>
          <Link href="/card-memory" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-rose-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">Memory Match</h3>
            <p className="text-xs text-zinc-500">Card memory game</p>
          </Link>
          <Link href="/leaderboard" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-rose-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">Leaderboard</h3>
            <p className="text-xs text-zinc-500">Global rankings</p>
          </Link>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-16 border-t border-zinc-800 pt-10">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((faq) => (
            <div key={faq.question}>
              <h3 className="font-semibold text-white mb-2">{faq.question}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
