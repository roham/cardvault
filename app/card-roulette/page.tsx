import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardRouletteClient from './CardRouletteClient';

export const metadata: Metadata = {
  title: 'Card Roulette — Quick-Fire Buy or Pass Card Game | CardVault',
  description: 'Free card collecting game. Cards spin and land randomly — decide BUY or PASS in seconds. Build the best collection within your budget. Track your score, streak, and total value. Uses real card data from 5,900+ sports cards.',
  openGraph: {
    title: 'Card Roulette — CardVault',
    description: 'Quick-fire card game. BUY or PASS on random cards within a budget. Beat your high score.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Roulette — CardVault',
    description: 'Spin the roulette, see a random card, decide: BUY or PASS? Beat your high score!',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/games' },
  { label: 'Card Roulette' },
];

const faqItems = [
  {
    question: 'How does Card Roulette work?',
    answer: 'You start with a $500 budget. Each spin shows a random card from our database of 5,900+ real sports cards with its market price. You have 5 seconds to decide BUY (adds card value to your collection) or PASS (skip it). The game ends after 20 spins or when your budget runs out. Your score is the total value of cards you collected.',
  },
  {
    question: 'What is the best strategy?',
    answer: 'Buy cards where the market value exceeds the asking price (look for the deal indicator). Pass on overpriced cards. Save budget for potentially high-value cards in later rounds. The randomized pricing means some cards will be deals and others will be overpriced — your job is to spot the difference.',
  },
  {
    question: 'Are the card values real?',
    answer: 'Yes. All cards come from the CardVault database with real estimated market values. The asking price in the game is randomized around the market value (sometimes higher, sometimes lower) to create buying decisions.',
  },
  {
    question: 'How is the score calculated?',
    answer: 'Your score equals the total estimated market value of all cards you bought, minus what you paid. Positive score means you got more value than you spent. The leaderboard tracks your best score across sessions.',
  },
];

export default function CardRoulettePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Roulette',
        description: 'Quick-fire card collecting game. Buy or pass on random sports cards within a budget.',
        url: 'https://cardvault-two.vercel.app/card-roulette',
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
          20 Spins &middot; $500 Budget &middot; 5-Second Timer &middot; Real Card Data &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Roulette</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Spin the roulette. A random card appears with an asking price. You have 5 seconds: BUY or PASS.
          Build the highest-value collection within your $500 budget across 20 spins.
        </p>
      </div>

      <CardRouletteClient />

      {/* FAQ */}
      <section className="mt-16 mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((f, i) => (
            <details key={i} className="group bg-gray-800/50 border border-gray-700 rounded-xl">
              <summary className="cursor-pointer px-6 py-4 text-white font-medium list-none flex items-center justify-between">
                {f.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform">&#9662;</span>
              </summary>
              <div className="px-6 pb-4 text-gray-400 text-sm leading-relaxed">{f.answer}</div>
            </details>
          ))}
        </div>
      </section>

      {/* Related */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-white mb-4">More Games</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/card-streak', label: 'Card Streak', icon: '🔥' },
            { href: '/card-auction', label: 'Auction Showdown', icon: '🔨' },
            { href: '/card-detective', label: 'Card Detective', icon: '🔍' },
            { href: '/flip-or-keep', label: 'Flip or Keep', icon: '💰' },
            { href: '/guess-the-card', label: 'Guess the Card', icon: '🎯' },
            { href: '/collector-quiz', label: 'Collector Quiz', icon: '📝' },
          ].map(t => (
            <Link
              key={t.href}
              href={t.href}
              className="flex items-center gap-2 px-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-xl text-sm text-gray-300 hover:text-white transition-colors"
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
