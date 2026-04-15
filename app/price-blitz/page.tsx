import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import PriceBlitzClient from './PriceBlitzClient';

export const metadata: Metadata = {
  title: 'Card Price Blitz — Speed Pricing Challenge | CardVault',
  description: 'How fast can you price cards? 20 cards in 60 seconds — guess OVER or UNDER the threshold. Streak bonuses, daily challenges, and S-F grade system. Test your card market IQ against the clock.',
  openGraph: {
    title: 'Card Price Blitz — CardVault',
    description: '20 cards, 60 seconds. Guess OVER or UNDER. How well do you know card prices?',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Price Blitz — CardVault',
    description: 'Speed pricing challenge. 20 cards in 60 seconds.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/my-hub' },
  { label: 'Price Blitz' },
];

const faqItems = [
  {
    question: 'How does Price Blitz work?',
    answer: 'You see 20 real sports cards one at a time, each with a price threshold (like "Is this card worth OVER or UNDER $100?"). You have 60 seconds total to answer all 20. Correct answers earn 50 base points plus streak bonuses — the longer your streak, the higher the multiplier (up to 3x). Your final score determines your letter grade from S (perfect) to F.',
  },
  {
    question: 'How are the price thresholds determined?',
    answer: 'Each card gets a threshold near its actual estimated value to make the decision challenging. For example, a card worth $150 might get a threshold of $100 or $200 — close enough that you need genuine card knowledge, not just wild guesses. The thresholds vary by card to keep every round interesting.',
  },
  {
    question: 'What is the streak bonus system?',
    answer: 'Every consecutive correct answer increases your streak multiplier: 1x for the first correct, 1.5x for 2 in a row, 2x for 3 in a row, 2.5x for 4, and 3x for 5+. One wrong answer resets the streak back to 1x. This means confident, accurate answers are rewarded more than cautious guessing.',
  },
  {
    question: 'Is there a daily challenge mode?',
    answer: 'Yes. The Daily Challenge uses the same 20 cards and thresholds for everyone on the same day, so you can compare scores with friends. The Random mode gives you a fresh set of cards each time for unlimited practice. Both modes track your best scores separately.',
  },
  {
    question: 'How is the letter grade calculated?',
    answer: 'Grades are based on your total score out of a theoretical maximum of about 3,000 points (20 correct at 3x streak). S grade requires 2,500+, A needs 2,000+, B needs 1,500+, C needs 1,000+, D needs 500+, and below that is F. The time bonus (remaining seconds x5) rewards faster players.',
  },
];

export default function PriceBlitzPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Price Blitz',
        description: 'Speed pricing challenge. 20 cards in 60 seconds. Guess OVER or UNDER.',
        url: 'https://cardvault-two.vercel.app/price-blitz',
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
          Speed Challenge &middot; 60 Seconds &middot; 20 Cards
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Price Blitz</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          20 cards. 60 seconds. Is it OVER or UNDER? Test your card pricing instincts at lightning speed.
        </p>
      </div>

      <PriceBlitzClient />

      {/* Related */}
      <section className="mt-16 mb-12">
        <h2 className="text-xl font-bold text-white mb-4">More Games</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { href: '/card-streak', label: 'Card Streak', icon: '🔥' },
            { href: '/card-war', label: 'Card War', icon: '⚔️' },
            { href: '/card-keeper', label: 'Card Keeper', icon: '⚡' },
            { href: '/card-trivia', label: 'Trivia Challenge', icon: '🧠' },
            { href: '/grading-game', label: 'Grading Game', icon: '🏅' },
            { href: '/card-timeline', label: 'Timeline Challenge', icon: '📅' },
            { href: '/price-is-right', label: 'Price Is Right', icon: '💰' },
            { href: '/card-detective', label: 'Card Detective', icon: '🔍' },
          ].map(t => (
            <Link key={t.href} href={t.href} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 rounded-lg text-sm transition-colors">
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-800/50 border border-gray-700/50 rounded-xl">
              <summary className="cursor-pointer px-5 py-4 text-white font-medium text-sm flex items-center justify-between">
                {faq.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform ml-2">&#9662;</span>
              </summary>
              <div className="px-5 pb-4 text-gray-400 text-sm leading-relaxed">{faq.answer}</div>
            </details>
          ))}
        </div>
      </section>

      <section className="border-t border-gray-800 pt-8 mt-8 text-sm text-gray-500">
        <p>
          Play <Link href="/card-streak" className="text-emerald-400 hover:underline">Card Streak</Link> for a relaxed higher/lower game,
          or test your knowledge with <Link href="/card-trivia" className="text-emerald-400 hover:underline">Card Trivia</Link>.
          Browse all <Link href="/tools" className="text-emerald-400 hover:underline">86+ collecting tools</Link>.
        </p>
      </section>
    </div>
  );
}
