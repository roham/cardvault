import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardKeeperClient from './CardKeeperClient';

export const metadata: Metadata = {
  title: 'Card Keeper — Fast Card Selection Game | CardVault',
  description: 'Cards fly by one at a time — you have 4 seconds to decide: KEEP or PASS. Spend your budget wisely to build the most valuable collection. Daily challenge, 3 difficulty levels, score tracking. Free sports card game.',
  openGraph: {
    title: 'Card Keeper — Fast Card Selection Game | CardVault',
    description: 'Quick-fire card game: KEEP or PASS in 4 seconds. Budget management meets card knowledge.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Keeper — CardVault',
    description: 'Can you spot the valuable cards in 4 seconds? Test your card knowledge in this fast-paced game.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/card-battle' },
  { label: 'Card Keeper' },
];

const faqItems = [
  {
    question: 'How does Card Keeper work?',
    answer: 'Card Keeper shows you 20 sports cards one at a time. For each card, you have 4 seconds to decide: KEEP (add to your collection) or PASS (skip it). Each card you keep costs money from your budget. Your goal is to maximize the total value of your kept collection while staying within budget. Cards that cost more to keep are generally more valuable, but the real skill is knowing which cards offer the best value-to-cost ratio.',
  },
  {
    question: 'What are the difficulty levels?',
    answer: 'There are three difficulty levels based on budget: Easy ($500 budget), Medium ($300 budget), and Hard ($150 budget). With less budget, you need to be more selective about which cards to keep. Hard mode forces you to be extremely strategic, only keeping the absolute best value cards. The Daily Challenge uses Medium difficulty so all players have the same experience.',
  },
  {
    question: 'What is the Daily Challenge?',
    answer: 'The Daily Challenge presents the same 20 cards to all players on a given day, using the date as a seed. This lets you compare your collection value with friends or other collectors. Your best daily score is tracked separately from your overall best. Play the daily challenge to compete on an even playing field.',
  },
  {
    question: 'How is the grade calculated?',
    answer: 'Your grade is based on the ratio of collection value to budget. S grade (Card Master) means you got 20x your budget in value, A (Sharp Eye) is 12x, B (Good Scout) is 7x, C (Decent) is 4x, D (Needs Practice) is 2x, and below that is F (Rookie). Higher grades require knowing which cards are valuable and managing your budget efficiently.',
  },
  {
    question: 'Can I use keyboard controls?',
    answer: 'Yes! Press A or Left Arrow to PASS, and D or Right Arrow to KEEP. Keyboard controls make the game faster and more fluid, especially when the timer is running low. You can also tap the on-screen buttons on mobile devices. If you run out of time on a card, it automatically passes.',
  },
];

export default function CardKeeperPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Keeper',
        description: 'Fast-paced card selection game. Cards appear one at a time — KEEP or PASS in 4 seconds. Budget management meets card knowledge. Daily challenge and 3 difficulty levels.',
        url: 'https://cardvault-two.vercel.app/card-keeper',
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
        <div className="inline-flex items-center gap-2 bg-cyan-950/60 border border-cyan-800/50 text-cyan-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
          20 Cards &middot; 4 Seconds Each &middot; Budget Management
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Keeper</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Cards fly by one at a time. KEEP the valuable ones, PASS on the rest.
          Spend your budget wisely to build the most valuable collection.
        </p>
      </div>

      <CardKeeperClient />

      {/* FAQ */}
      <div className="mt-12 border-t border-gray-800 pt-10">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <details key={i} className="group bg-gray-900/60 border border-gray-800 rounded-lg">
              <summary className="flex items-center justify-between cursor-pointer px-5 py-4 text-white font-medium">
                {item.question}
                <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-5 pb-4 text-gray-400 text-sm leading-relaxed">{item.answer}</div>
            </details>
          ))}
        </div>
      </div>

      {/* Related links */}
      <div className="mt-10 flex flex-wrap gap-3 text-sm">
        <Link href="/flip-or-keep" className="text-emerald-400 hover:underline">Flip or Keep</Link>
        <span className="text-gray-600">&middot;</span>
        <Link href="/card-battle" className="text-emerald-400 hover:underline">Card Battles</Link>
        <span className="text-gray-600">&middot;</span>
        <Link href="/grading-game" className="text-emerald-400 hover:underline">Grading Game</Link>
        <span className="text-gray-600">&middot;</span>
        <Link href="/card-speed-quiz" className="text-emerald-400 hover:underline">Speed Quiz</Link>
        <span className="text-gray-600">&middot;</span>
        <Link href="/tools" className="text-emerald-400 hover:underline">All Tools</Link>
      </div>
    </div>
  );
}
