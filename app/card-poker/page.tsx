import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardPokerClient from './CardPokerClient';

export const metadata: Metadata = {
  title: 'Card Poker — Build Your Best 5-Card Hand | CardVault',
  description: 'Pick 5 of 7 real sports cards to form the best poker-style hand. Same-year cards make pairs, same-sport 5 makes a Flush, 5 rookies same sport is a Royal Flush. 5 hands per game, daily + random, S-F grade, shareable.',
  openGraph: {
    title: 'Card Poker — CardVault',
    description: 'Deal 7, keep 5, chase the Royal Flush. Real sports cards form real poker hands.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Poker — CardVault',
    description: 'Deal 7 cards, pick 5, form poker hands with real sports cards.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/games' },
  { label: 'Card Poker' },
];

const faqItems = [
  {
    question: 'How do poker hands work with sports cards?',
    answer: 'Same-year cards act like rank matches — four cards from 1989 = Four of a Kind, three from 2018 + two from 1952 = Full House. Same-sport cards act like suits — five baseball cards = Flush. Five consecutive decades (e.g., 1960s–2000s) = Straight. Royal Flush is the rarest: five rookie cards all from the same sport.',
  },
  {
    question: 'What are the point values?',
    answer: 'Royal Flush 10,000. Straight Flush 5,000. Four of a Kind 2,500. Full House 1,500. Flush 1,000. Straight 750. Three of a Kind 400. Two Pair 200. One Pair 100. High Card is based on the max card value in your hand (value ÷ 100, minimum 20). Same-player pairs add a +200 bonus each — find two Mickey Mantle cards in your hand and you stack the bonus.',
  },
  {
    question: 'Is the deal fair?',
    answer: 'Daily mode seeds the random number generator from today\'s date plus the sport-filter letter, so every player gets the same 5 hands on the same day and can compare scores fairly. Random mode reseeds on each game for replay variety. In All-Sports mode the deal is biased toward one primary sport per hand (4–5 of 7 cards same sport) so Flush attempts are viable — otherwise uniform random across all four sports would make Flush essentially unreachable.',
  },
  {
    question: 'Why are some "pairs" across different years that share nothing?',
    answer: 'Only same-year cards count as pairs in Card Poker. Two 1989 Upper Deck Griffeys = a pair. A 1989 Griffey and a 1991 Thomas do NOT — different years, even if both are famous rookies. The year rank maps to the suit-free "rank" from traditional poker. Same-player repeats trigger a separate +200 bonus layered on top of the base hand.',
  },
  {
    question: 'How is my final grade calculated?',
    answer: 'Total score across 5 hands determines your grade. S: 12,000+ (requires at least one of the top-4 hand types plus consistent mid-tier play). A: 7,000–11,999. B: 3,500–6,999. C: 1,500–3,499. D: 500–1,499. F: under 500. Best score, grade, and rare-hand counts (Royal Flushes, Straight Flushes, Four of a Kinds) persist in localStorage so you can chase a lifetime Best Ever.',
  },
];

export default function CardPokerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Card Poker',
        description: 'Deal 7 real sports cards, pick 5, form the best poker-style hand. Same-year cards = pairs/trips/quads. Same-sport 5 = Flush. 5 rookies same sport = Royal Flush.',
        url: 'https://cardvault-two.vercel.app/card-poker',
        applicationCategory: 'GameApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map((f) => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: { '@type': 'Answer', text: f.answer },
        })),
      }} />

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-green-950/60 border border-green-800/50 text-green-300 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span>&#127922;</span>
          Card Poker &middot; 5 Hands &middot; Deal 7, Keep 5
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Poker</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Seven real sports cards. Five picks. Build the best poker hand you can —
          same-year cards make pairs, same-sport cards make flushes, and five rookies
          from one sport is a Royal Flush. Five hands per game, shareable final score.
        </p>
      </div>

      <CardPokerClient />

      <div className="mt-12 bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, idx) => (
            <details key={idx} className="group">
              <summary className="cursor-pointer text-white font-medium text-sm hover:text-green-400 transition-colors list-none flex items-center gap-2">
                <span className="text-green-400/60 group-open:rotate-90 transition-transform">&#9654;</span>
                {faq.question}
              </summary>
              <p className="text-gray-400 text-sm mt-2 ml-5">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>

      <div className="mt-8 text-sm text-gray-500">
        <p>
          More <Link href="/games" className="text-green-400 hover:underline">CardVault Games</Link>:{' '}
          <Link href="/card-blackjack" className="text-green-400 hover:underline">Card Blackjack</Link>,{' '}
          <Link href="/card-yahtzee" className="text-green-400 hover:underline">Card Yahtzee</Link>,{' '}
          <Link href="/card-slots" className="text-green-400 hover:underline">Card Slots</Link>,{' '}
          <Link href="/card-darts" className="text-green-400 hover:underline">Card Darts</Link>,{' '}
          <Link href="/card-plinko" className="text-green-400 hover:underline">Card Plinko</Link>,{' '}
          <Link href="/card-roulette" className="text-green-400 hover:underline">Card Roulette</Link>.
        </p>
      </div>
    </div>
  );
}
