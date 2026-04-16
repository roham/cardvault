import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardPairsClient from './CardPairsClient';

export const metadata: Metadata = {
  title: 'Card Pair Trader — Match Cards to a Target Value | CardVault',
  description: 'Pick two cards whose combined value hits the target — 10 rounds, real sports cards, daily + random modes. Free card-value-intuition training game.',
  openGraph: {
    title: 'Card Pair Trader — CardVault',
    description: 'Pair up real sports cards to hit a target value. 10 rounds. Daily + random.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Pair Trader — CardVault',
    description: 'Pick the right 2-card pair. Real cards. Free.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/games' },
  { label: 'Card Pair Trader' },
];

const faqItems = [
  {
    question: 'What is Card Pair Trader?',
    answer: 'Each of 10 rounds shows you 4 real sports cards from our 9,800+ card database plus a target dollar value. Your job is to pick the 2 cards whose combined value is closest to the target. Get a bullseye (within 5%) for maximum points. Perfect for training your eye on relative card values across sports, decades, and grade tiers.',
  },
  {
    question: 'How is scoring calculated?',
    answer: 'Points per round scale with how close your combined pair value gets to the target. Within 5% = 100 points (bullseye 🎯). Within 15% = 75 points (✓ close). Within 30% = 50 points. Within 50% = 25 points. Over 50% off = 0 points. Max game score is 1,000. Final grade S (900+), A (750+), B (600+), C (400+), D (200+), F (under 200).',
  },
  {
    question: 'What is the difference between Daily and Random modes?',
    answer: 'Daily mode gives every collector the same 10 rounds for the calendar day, so you can share scores with friends. Random mode regenerates a fresh 10-round gauntlet every time, for unlimited practice. Both pull from the same 9,800+ card database.',
  },
  {
    question: 'Are the target values random or meaningful?',
    answer: 'Targets are derived from the specific 4 cards in each round. The tool picks a target inside the possible pair-sum range so there is always at least one mathematically valid answer. Some rounds will have one obvious bullseye pair, others will have two competing pairs within ~10% of the target — that is where the skill lives.',
  },
  {
    question: 'How does this help my real collecting?',
    answer: 'Collectors who can quickly estimate pair or package values negotiate better at card shows, lot sales, and trades. Pair Trader trains that intuition using real card price data. It reinforces which sports, eras, and grade levels tend to cluster in certain value ranges. Over enough daily runs, you build mental benchmarks without having to pull up eBay for every card.',
  },
];

export default function CardPairsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Pair Trader',
        description: 'Match 2 of 4 sports cards to a target value across 10 rounds. Real card data. Daily + random modes.',
        url: 'https://cardvault-two.vercel.app/card-pairs',
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
        <div className="inline-flex items-center gap-2 bg-indigo-950/60 border border-indigo-800/50 text-indigo-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
          Value-Intuition Game · 10 Rounds · Daily + Random
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Pair Trader</h1>
        <p className="text-gray-400 text-lg">
          Four cards, one target. Pick the 2 whose combined value hits closest.
          Ten rounds. Real cards. Daily mode for bragging rights with friends.
        </p>
      </div>

      <CardPairsClient />

      <section className="mt-16 border-t border-gray-800 pt-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map(f => (
            <details key={f.question} className="group bg-gray-900 border border-gray-800 rounded-xl">
              <summary className="px-5 py-4 text-white font-medium cursor-pointer hover:text-indigo-400 transition-colors">
                {f.question}
              </summary>
              <div className="px-5 pb-4 text-gray-400 text-sm">
                {f.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-8 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">More Card Games</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href="/card-thrift" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-indigo-700/50 rounded-xl transition-colors">
            <span className="text-xl">🛍️</span>
            <div><div className="text-white text-sm font-medium">Card Thrift Store</div><div className="text-gray-500 text-xs">Pick 10 unmarked cards for $50</div></div>
          </Link>
          <Link href="/price-blitz" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-indigo-700/50 rounded-xl transition-colors">
            <span className="text-xl">⚡</span>
            <div><div className="text-white text-sm font-medium">Card Price Blitz</div><div className="text-gray-500 text-xs">20 cards in 60 seconds — over/under</div></div>
          </Link>
          <Link href="/card-grid" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-indigo-700/50 rounded-xl transition-colors">
            <span className="text-xl">🧩</span>
            <div><div className="text-white text-sm font-medium">Card Grid Challenge</div><div className="text-gray-500 text-xs">Immaculate Grid for cards</div></div>
          </Link>
          <Link href="/card-stack" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-indigo-700/50 rounded-xl transition-colors">
            <span className="text-xl">🃏</span>
            <div><div className="text-white text-sm font-medium">Card Stack</div><div className="text-gray-500 text-xs">Build a $500 5-card stack</div></div>
          </Link>
          <Link href="/card-wordle" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-indigo-700/50 rounded-xl transition-colors">
            <span className="text-xl">🟩</span>
            <div><div className="text-white text-sm font-medium">Card Wordle</div><div className="text-gray-500 text-xs">Guess the mystery player in 6 tries</div></div>
          </Link>
          <Link href="/games" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-indigo-700/50 rounded-xl transition-colors">
            <span className="text-xl">🎮</span>
            <div><div className="text-white text-sm font-medium">All Games</div><div className="text-gray-500 text-xs">Full game library</div></div>
          </Link>
        </div>
      </section>
    </div>
  );
}
