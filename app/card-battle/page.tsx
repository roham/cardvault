import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardBattleClient from './CardBattleClient';

export const metadata: Metadata = {
  title: 'Card Battles — Stat-Based Card Combat | CardVault',
  description: 'Battle sports cards head-to-head using real stats. Player year equals experience, rookie status equals potential, card value equals power. Grade multipliers amplify everything. Win streaks, battle log, and leaderboard.',
  openGraph: {
    title: 'Card Battles — CardVault',
    description: 'Stat-based card combat with real sports card data. Pick your fighter, battle the AI.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Battles — CardVault',
    description: 'Head-to-head card battles with real stats and grade multipliers.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Card Battles' },
];

const faqItems = [
  {
    question: 'How do card battles work?',
    answer: 'Each card has stats derived from real data: Power (card value), Experience (years since release), Potential (rookie bonus), and a random Clutch factor. Grade multiplier (PSA 10 = 1.5x, PSA 9 = 1.3x, etc.) amplifies all stats. The card with the higher total score wins the round.',
  },
  {
    question: 'How are card stats calculated?',
    answer: 'Power comes from estimated card value. Experience is years since the card was printed. Potential gives rookies a +25 bonus. Clutch is a random factor (1-20) that adds excitement. Grade multiplier scales everything based on the card condition.',
  },
  {
    question: 'Can I choose my own card?',
    answer: 'Yes! Search for any card in the database, pick it as your fighter, then battle against a randomly selected opponent. You can also use Quick Match for a fully random matchup.',
  },
  {
    question: 'What are battle streaks?',
    answer: 'Win consecutive battles to build a streak. Your highest streak is saved in your profile. Streaks reset on a loss. The battle log tracks your last 20 battles.',
  },
];

export default function CardBattlePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Card Battles',
        description: 'Head-to-head card combat using real sports card stats, grade multipliers, and strategic matchups.',
        url: 'https://cardvault-two.vercel.app/card-battle',
        applicationCategory: 'GameApplication',
        operatingSystem: 'Any',
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

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-red-950/60 border border-red-800/50 text-red-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
          Quick Match · Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Battles</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Pick a card, battle the AI. Real stats, grade multipliers, and clutch factor decide the winner.
        </p>
      </div>

      <CardBattleClient />

      <section className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <details key={i} className="group bg-gray-900/40 border border-gray-800 rounded-xl">
              <summary className="p-4 cursor-pointer text-white font-medium text-sm flex justify-between items-center">
                {item.question}
                <span className="text-gray-500 group-open:rotate-45 transition-transform text-lg">+</span>
              </summary>
              <div className="px-4 pb-4">
                <p className="text-sm text-gray-400 leading-relaxed">{item.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-bold text-white mb-4">Related</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <Link href="/tools/head-to-head" className="p-4 bg-gray-900/40 border border-gray-800 rounded-xl hover:border-gray-600 transition-colors">
            <h3 className="text-sm font-semibold text-white">Head-to-Head</h3>
            <p className="text-xs text-gray-400 mt-1">Compare any two cards side-by-side.</p>
          </Link>
          <Link href="/predictions" className="p-4 bg-gray-900/40 border border-gray-800 rounded-xl hover:border-gray-600 transition-colors">
            <h3 className="text-sm font-semibold text-white">Predictions</h3>
            <p className="text-xs text-gray-400 mt-1">Over/under on card prices.</p>
          </Link>
          <Link href="/flip-or-keep" className="p-4 bg-gray-900/40 border border-gray-800 rounded-xl hover:border-gray-600 transition-colors">
            <h3 className="text-sm font-semibold text-white">Flip or Keep</h3>
            <p className="text-xs text-gray-400 mt-1">Daily card collecting game.</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
