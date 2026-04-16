import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardYahtzeeClient from './CardYahtzeeClient';

export const metadata: Metadata = {
  title: 'Card Yahtzee — Roll 5 Cards, Score Big Hands | CardVault',
  description: 'Roll 5 random sports cards and try to score the best hand. Hold cards and reroll up to 2 times. Score Rookie Rush, Full Team, Full Sport, High Roller, and more. Daily challenge and random mode. Free card collecting game.',
  openGraph: {
    title: 'Card Yahtzee — CardVault',
    description: 'Roll 5 sports cards, hold the best, reroll the rest. Score big hands like Rookie Rush and Full Team.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Yahtzee — CardVault',
    description: 'Roll 5 cards, hold and reroll. Score hands like Rookie Rush, Full Sport, and High Roller.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/games' },
  { label: 'Card Yahtzee' },
];

const faqItems = [
  {
    question: 'How does Card Yahtzee work?',
    answer: 'You roll 5 random sports cards from the 7,500+ card database. After the first roll, you can hold any cards you want to keep and reroll the rest. You get up to 3 total rolls (the initial roll plus 2 rerolls). After your final roll or when you choose to stand, your hand is scored based on the best matching category — like Rookie Rush (all 5 rookies), Full Sport (all same sport), or High Roller (total value over $500).',
  },
  {
    question: 'What are the scoring categories?',
    answer: 'From highest to lowest: Rookie Rush (100 pts, all 5 rookies), Full Team (90 pts, all same set), Full Sport (80 pts, all same sport), High Roller (70 pts, $500+ total value), Decade Match (60 pts, all same decade), Triple (50 pts, 3 same player), Value Run (45 pts, ascending value order), Two Pair (40 pts, 2 different pairs), Pair (25 pts, 2 same player), Mixed Bag (20 pts, 4+ different sports). Plus a value bonus of +1 point per $50 of total hand value.',
  },
  {
    question: 'What is the Daily Challenge?',
    answer: 'The Daily Challenge uses a date-based seed so everyone gets the same cards on the same day. It lets you compare scores with friends and fellow collectors. After completing the daily, switch to Random mode for unlimited play with different cards each game.',
  },
  {
    question: 'What strategy should I use?',
    answer: 'The best strategy depends on your first roll. If you see multiple rookies, hold them and go for Rookie Rush (100 pts). If you see cards from the same sport, hold those for Full Sport (80 pts). High-value cards are worth holding for the value bonus even if you get a lower category. Sometimes keeping a pair and rerolling for a triple is better than chasing a long shot.',
  },
  {
    question: 'Is Card Yahtzee free to play?',
    answer: 'Yes, Card Yahtzee is completely free. Play the Daily Challenge once per day and Random mode as many times as you want. No account required — your stats are saved locally in your browser.',
  },
];

export default function CardYahtzeePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'GameApplication',
        name: 'Card Yahtzee',
        description: 'Roll 5 random sports cards and try to score the best hand. Hold cards and reroll up to 2 times.',
        url: 'https://cardvault-two.vercel.app/card-yahtzee',
        applicationCategory: 'GameApplication',
        operatingSystem: 'Any',
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

      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 bg-clip-text text-transparent mb-2">
          Card Yahtzee
        </h1>
        <p className="text-gray-400 text-lg">
          Roll 5 cards. Hold the keepers. Reroll the rest. Score big hands.
        </p>
      </div>

      <CardYahtzeeClient />

      {/* FAQ */}
      <section className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq) => (
            <details key={faq.question} className="group bg-gray-800/30 border border-gray-700/50 rounded-lg">
              <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-gray-200 hover:text-white transition-colors">
                {faq.question}
              </summary>
              <div className="px-4 pb-3 text-sm text-gray-400 leading-relaxed">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Related Links */}
      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        <Link href="/card-tycoon" className="text-blue-400 hover:text-blue-300">Card Tycoon</Link>
        <span className="text-gray-700">|</span>
        <Link href="/card-slots" className="text-blue-400 hover:text-blue-300">Card Slots</Link>
        <span className="text-gray-700">|</span>
        <Link href="/card-roulette" className="text-blue-400 hover:text-blue-300">Card Roulette</Link>
        <span className="text-gray-700">|</span>
        <Link href="/card-clash" className="text-blue-400 hover:text-blue-300">Card Clash</Link>
        <span className="text-gray-700">|</span>
        <Link href="/flip-or-keep" className="text-blue-400 hover:text-blue-300">Flip or Keep</Link>
        <span className="text-gray-700">|</span>
        <Link href="/card-streak" className="text-blue-400 hover:text-blue-300">Card Streak</Link>
      </div>
    </div>
  );
}
