import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardSlotsClient from './CardSlotsClient';
import { sportsCards } from '@/data/sports-cards';

export const metadata: Metadata = {
  title: 'Card Slots — Daily Slot Machine Card Game',
  description: 'Free daily card slot machine game. Spin three reels of sports cards and match players, sports, eras, or teams to win points. Daily spins, combos, and shareable high scores.',
  openGraph: {
    title: 'Card Slots — Daily Slot Machine Game — CardVault',
    description: 'Spin three reels of sports cards. Match players, sports, eras, or teams for points. Free daily spins.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Slots — CardVault',
    description: 'Spin three reels of sports cards. Match for combos and chase high scores.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/tools' },
  { label: 'Card Slots' },
];

const faqItems = [
  {
    question: 'How do you play Card Slots?',
    answer: 'You get 10 free spins per day. Each spin shows three random sports cards on the reels. You earn points based on matches: same player (Jackpot, 500 pts), same sport (100 pts), same era/decade (75 pts), same team (150 pts). Multiple matches stack. After 10 spins, see your daily score and try to beat your high score.',
  },
  {
    question: 'What are the Card Slots combo multipliers?',
    answer: 'Card Slots rewards multiple matches on a single spin. If you land same sport + same era, you get both bonuses plus a combo multiplier. Three identical sport cards with a team match can yield 300+ points on one spin. The theoretical maximum on a single spin is a Jackpot (same player three times) worth 500 points.',
  },
  {
    question: 'Do Card Slots reset daily?',
    answer: 'Yes, you get 10 fresh spins every day at midnight. Your all-time high score and total spins are saved in your browser. The card pool changes daily using a date-based shuffle, so every day brings new combinations.',
  },
  {
    question: 'What cards appear in Card Slots?',
    answer: 'Card Slots uses CardVault\'s full database of 5,000+ sports cards across baseball, basketball, football, and hockey. Cards range from vintage legends to modern rookies, with values from a few dollars to six figures.',
  },
];

export default function CardSlotsPage() {
  const cardData = sportsCards.map(c => ({
    name: c.name,
    player: c.player,
    sport: c.sport,
    year: c.year,
    set: c.set,
    estimatedValueRaw: c.estimatedValueRaw,
    slug: c.slug,
  }));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Slots — Daily Slot Machine Card Game',
        description: 'Spin three reels of sports cards and match for combos. Free daily game with high scores.',
        url: 'https://cardvault-two.vercel.app/card-slots',
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
        <div className="inline-flex items-center gap-2 bg-yellow-950/60 border border-yellow-800/50 text-yellow-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
          10 daily spins
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Slots</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Spin three reels of sports cards. Match players, sports, eras, or teams for points. 10 free spins daily.
        </p>
      </div>

      {/* How to play */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
          <div className="text-lg mb-1">&#127920;</div>
          <p className="text-white text-sm font-medium">Spin</p>
          <p className="text-gray-500 text-xs">Pull the lever</p>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
          <div className="text-lg mb-1">&#127183;</div>
          <p className="text-white text-sm font-medium">Match</p>
          <p className="text-gray-500 text-xs">Sport, era, team</p>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
          <div className="text-lg mb-1">&#127942;</div>
          <p className="text-white text-sm font-medium">Score</p>
          <p className="text-gray-500 text-xs">Beat your best</p>
        </div>
      </div>

      {/* Game */}
      <CardSlotsClient cards={cardData} />

      {/* FAQ */}
      <div className="mt-12 space-y-4">
        <h2 className="text-xl font-bold text-white">Frequently Asked Questions</h2>
        {faqItems.map((f, i) => (
          <details key={i} className="bg-gray-900/40 border border-gray-800 rounded-xl p-4 group">
            <summary className="text-white font-medium cursor-pointer list-none flex items-center justify-between">
              {f.question}
              <span className="text-gray-500 group-open:rotate-180 transition-transform">&#9660;</span>
            </summary>
            <p className="text-gray-400 text-sm mt-3 leading-relaxed">{f.answer}</p>
          </details>
        ))}
      </div>

      {/* Bottom links */}
      <div className="mt-12 p-5 bg-gray-900/40 border border-gray-800 rounded-2xl">
        <h3 className="text-white font-semibold text-sm mb-3">More Daily Games</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Link href="/card-ladder" className="text-blue-400 hover:text-blue-300 text-sm py-1.5 px-3 bg-gray-900/60 border border-gray-800 rounded-lg text-center transition-colors">Card Ladder</Link>
          <Link href="/flip-or-keep" className="text-blue-400 hover:text-blue-300 text-sm py-1.5 px-3 bg-gray-900/60 border border-gray-800 rounded-lg text-center transition-colors">Flip or Keep</Link>
          <Link href="/guess-the-card" className="text-blue-400 hover:text-blue-300 text-sm py-1.5 px-3 bg-gray-900/60 border border-gray-800 rounded-lg text-center transition-colors">Guess the Card</Link>
          <Link href="/trivia" className="text-blue-400 hover:text-blue-300 text-sm py-1.5 px-3 bg-gray-900/60 border border-gray-800 rounded-lg text-center transition-colors">Daily Trivia</Link>
        </div>
      </div>
    </div>
  );
}
