import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardDoubleOrNothingClient from './CardDoubleOrNothingClient';

export const metadata: Metadata = {
  title: 'Card Double or Nothing — Push Your Luck Card Game | CardVault',
  description: 'A push-your-luck card game for sports card collectors. See a card and its value — then decide: cash out or double it? If the next card is worth more, your score doubles. If not, you lose everything. How far will you push it?',
  openGraph: {
    title: 'Card Double or Nothing — Push Your Luck Game | CardVault',
    description: 'See a card, know its value. Double or cash out? Next card higher = 2x score. Lower = bust. Pure push-your-luck with 9,000+ real sports cards.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Double or Nothing — CardVault',
    description: 'Push your luck card game. Double your score or lose it all!',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/games' },
  { label: 'Card Double or Nothing' },
];

const faqItems = [
  {
    question: 'How do I play Card Double or Nothing?',
    answer: 'A sports card is revealed with its real market value. You start with 100 points. Choose DOUBLE to flip the next card — if it is worth more than your current card, your score doubles. If it is worth less, you bust and lose everything. Choose CASH OUT at any time to lock in your score. Ties (same value) are a free push — you move forward without risk.',
  },
  {
    question: 'What is the maximum possible score?',
    answer: 'Starting at 100 points with a 12-card deck, the theoretical maximum is 8 successful doubles in a row for 25,600 points (100 x 2^8), earning an S grade. In practice, most skilled players cash out between 800-3,200 points (3-5 doubles).',
  },
  {
    question: 'Is there a daily challenge?',
    answer: 'Yes. The Daily Challenge uses the same deck of cards for all players that day, so you can compare strategies with friends. Did you cash out too early, or push too far? Random mode generates a fresh deck every time for unlimited practice.',
  },
  {
    question: 'What strategy should I use?',
    answer: 'The key insight is that high-value cards are harder to beat. If your current card is worth $500+, the chance of the next card being worth even more is lower. Conversely, starting with a low-value card ($5-20) gives you great odds on the first double. Most experienced players target 3-5 successful doubles (800-3,200 points) before cashing out.',
  },
  {
    question: 'How many cards are in the game?',
    answer: 'Card Double or Nothing draws from over 9,000 real sports cards in the CardVault database, covering baseball, basketball, football, and hockey from 1909 to 2025. Each game uses a shuffled deck of 12 cards, giving you up to 11 double-or-nothing decisions.',
  },
];

export default function CardDoubleOrNothingPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Card Double or Nothing',
        description: 'Push-your-luck card game using real sports cards. Flip the next card — if it is worth more, your score doubles. If less, you lose everything.',
        url: 'https://cardvault-two.vercel.app/card-double-or-nothing',
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
        <div className="inline-flex items-center gap-2 bg-amber-950/60 border border-amber-800/50 text-amber-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
          Double or Nothing &middot; Push Your Luck &middot; 9,000+ Cards
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Double or Nothing</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          See a card. Know its value. Double or cash out?
          If the next card is worth more, your score doubles. If not, you lose everything.
          How far will you push your luck?
        </p>
      </div>

      <CardDoubleOrNothingClient />

      {/* FAQ */}
      <div className="mt-12 bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, idx) => (
            <details key={idx} className="group">
              <summary className="cursor-pointer text-white font-medium text-sm hover:text-amber-400 transition-colors list-none flex items-center gap-2">
                <span className="text-amber-400/60 group-open:rotate-90 transition-transform">&#9654;</span>
                {faq.question}
              </summary>
              <p className="text-gray-400 text-sm mt-2 ml-5">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>

      {/* Internal Links */}
      <div className="mt-8 text-sm text-gray-500">
        <p>
          Part of the <Link href="/games" className="text-green-400 hover:underline">CardVault Games</Link> collection.
          See also: <Link href="/card-streak" className="text-green-400 hover:underline">Card Streak</Link>,{' '}
          <Link href="/card-roulette" className="text-green-400 hover:underline">Card Roulette</Link>,{' '}
          <Link href="/card-blackjack" className="text-green-400 hover:underline">Card Blackjack</Link>,{' '}
          <Link href="/card-tycoon" className="text-green-400 hover:underline">Card Tycoon</Link>,{' '}
          <Link href="/card-millionaire" className="text-green-400 hover:underline">Card Millionaire</Link>.
        </p>
      </div>
    </div>
  );
}
