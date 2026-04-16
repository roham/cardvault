import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardSetRushClient from './CardSetRushClient';
import { sportsCards } from '@/data/sports-cards';

export const metadata: Metadata = {
  title: 'Card Set Rush — 60-Second Set-Building Challenge | CardVault',
  description: 'Race against the clock to build sets of 3 matching sports cards. Match by player, set, year, decade, or sport. Score points, build streaks, and compete on the daily challenge. Free daily card collecting game.',
  openGraph: {
    title: 'Card Set Rush — CardVault',
    description: '60-second set-building challenge with 7,500+ sports cards. Match by player, set, year, or sport.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Set Rush — CardVault',
    description: 'Can you build the most sets in 60 seconds? Daily challenge for card collectors.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/games' },
  { label: 'Card Set Rush' },
];

const faqItems = [
  {
    question: 'How does Card Set Rush work?',
    answer: 'Cards appear one at a time from a shuffled deck of 100 cards drawn from the 7,500+ card database. You have 60 seconds to place cards into 3 slots. When all 3 slots share an attribute (same player, set, year, decade, or sport), you score points and the slots clear for the next set.',
  },
  {
    question: 'How is scoring calculated?',
    answer: 'Same Player = 50 points, Same Set = 40 points, Same Year = 30 points, Same Decade = 20 points, Same Sport = 10 points. Consecutive sets without discarding earn a streak bonus of +5 per set (max +25 bonus).',
  },
  {
    question: 'What is the difference between Daily and Random mode?',
    answer: 'Daily Rush uses the same shuffled deck for every player that day, so you can compare scores with friends. Random Rush generates a new deck each time you play. Daily mode can only be played once per day.',
  },
  {
    question: 'Can I remove a card from a slot?',
    answer: 'Yes! Tap any filled slot to clear it and make room for a different card. This is useful when you realize a better match is possible. Only the Skip button breaks your streak.',
  },
  {
    question: 'What is a good score?',
    answer: 'Under 50 points earns a D grade, 50-99 is a C, 100-149 is a B, 150-199 is an A, and 200+ earns the elite S grade. Building same-player sets and maintaining streaks is key to high scores.',
  },
];

export default function CardSetRushPage() {
  const cardData = sportsCards.map(c => ({
    slug: c.slug,
    player: c.player,
    sport: c.sport,
    year: c.year,
    set: c.set,
  }));

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Set Rush',
        description: '60-second set-building challenge. Match 3 sports cards by player, set, year, decade, or sport.',
        url: 'https://cardvault-two.vercel.app/card-set-rush',
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

      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          60 Seconds &middot; Build Sets &middot; Beat the Clock
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Set Rush</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Race against the clock to build sets of 3 matching cards. Same player, same set, same year, same decade, or same sport — every match scores. How many can you build in 60 seconds?
        </p>
      </div>

      {/* Game */}
      <CardSetRushClient cards={cardData} />

      {/* FAQ */}
      <section className="mt-12 border-t border-gray-800 pt-10">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((faq, i) => (
            <details key={i} className="group">
              <summary className="cursor-pointer text-white font-medium hover:text-emerald-400 transition-colors">
                {faq.question}
              </summary>
              <p className="mt-2 text-gray-400 text-sm leading-relaxed pl-4">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Related Links */}
      <section className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-lg font-semibold text-white mb-3">More Games &amp; Activities</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { href: '/card-speed-quiz', label: 'Speed Quiz' },
            { href: '/card-streak', label: 'Card Streak' },
            { href: '/guess-the-card', label: 'Guess the Card' },
            { href: '/trivia', label: 'Daily Trivia' },
            { href: '/flip-or-keep', label: 'Flip or Keep' },
            { href: '/card-memory', label: 'Card Memory' },
            { href: '/card-2048', label: 'Card 2048' },
            { href: '/card-bingo', label: 'Collector Bingo' },
            { href: '/pack-race', label: 'Pack Race' },
            { href: '/my-hub', label: 'My Hub' },
          ].map(link => (
            <Link key={link.href} href={link.href} className="text-sm text-gray-400 hover:text-emerald-400 bg-gray-900 border border-gray-800 rounded-full px-3 py-1 transition-colors">
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
