import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardPyramidClient from './CardPyramidClient';

export const metadata: Metadata = {
  title: 'Card Pyramid Solitaire — Sports Card Matching Puzzle Game | CardVault',
  description: 'Clear a pyramid of 21 real sports cards by pairing cards whose values sum to the target. Daily + random modes. Score based on cards cleared and speed. S through F grading.',
  openGraph: {
    title: 'Card Pyramid Solitaire — Sports Card Puzzle | CardVault',
    description: 'Match pairs of sports cards whose values hit the target sum. Clear all 21 pyramid cards to win.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Pyramid Solitaire — CardVault',
    description: 'Clear a pyramid of 21 real sports cards by matching pairs that sum to the target value.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Card Pyramid' },
];

const faqItems = [
  {
    question: 'How do I play Card Pyramid Solitaire?',
    answer: 'Cards are arranged in a 6-row pyramid (21 cards total). Select two exposed cards whose estimated values add up within $5 of the target sum shown. Only cards in the bottom row, or cards with nothing blocking them below, are exposed and selectable. Remove all 21 cards to win.',
  },
  {
    question: 'Which cards are "exposed" and available to pick?',
    answer: 'A card is exposed when no other cards overlap it from the row below. The bottom row (row 6) is always fully exposed. As you remove pairs, cards in higher rows become exposed. Strategy matters — remove lower-row pairs to unlock better options above.',
  },
  {
    question: 'How is the target sum calculated?',
    answer: 'The target sum is set to approximately the median pair value of the 21 cards selected for your game. This ensures roughly half of all possible pairs are near the target. A pair matches when the two card values add up within $5 of the target sum.',
  },
  {
    question: 'How is scoring calculated?',
    answer: 'You earn 100 points per card cleared (200 per matched pair). A speed bonus is added based on how quickly you finish — the faster you clear the pyramid, the higher your bonus. Final score determines your grade: S (full clear + fast), A, B, C, D, or F.',
  },
  {
    question: 'What are Daily and Random modes?',
    answer: 'Daily mode uses the same date-seeded card layout for all players each day — compare scores with friends. Random mode picks a fresh set of 21 cards from the 9,000+ card database every game for unlimited practice.',
  },
];

export default function CardPyramidPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Card Pyramid Solitaire',
        description: 'Pyramid solitaire using real sports cards. Match pairs that sum to the target value to clear all 21 cards.',
        url: 'https://cardvault-two.vercel.app/card-pyramid',
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
        <div className="inline-flex items-center gap-2 bg-purple-950/60 border border-purple-800/50 text-purple-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
          Card Pyramid &middot; Solitaire Puzzle &middot; 9,000+ Cards
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Pyramid Solitaire</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          21 real sports cards stacked in a pyramid. Match pairs whose values hit the target sum to clear the board.
          Clear all cards to win. Daily and random modes.
        </p>
      </div>

      <CardPyramidClient />

      {/* FAQ */}
      <div className="mt-12 bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, idx) => (
            <details key={idx} className="group">
              <summary className="cursor-pointer text-white font-medium text-sm hover:text-purple-400 transition-colors list-none flex items-center gap-2">
                <span className="text-purple-400/60 group-open:rotate-90 transition-transform">&#9654;</span>
                {faq.question}
              </summary>
              <p className="text-zinc-400 text-sm mt-2 ml-5">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>

      {/* Related Games */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-white mb-4">More Card Games</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { href: '/card-mystery-box', label: 'Mystery Box', desc: 'Pick mystery boxes, reveal your haul', icon: '\ud83c\udfb0' },
            { href: '/card-snap', label: 'Card Snap', desc: 'Speed matching — SNAP if two cards share an attribute', icon: '\u26a1' },
            { href: '/card-blackjack', label: 'Card Blackjack', desc: 'Hit 21 with real sports cards', icon: '\ud83c\udccf' },
            { href: '/card-wordle', label: 'Card Wordle', desc: 'Guess the mystery player in 6 tries', icon: '\ud83d\udfe9' },
            { href: '/card-groups', label: 'Card Groups', desc: 'Sort 16 players into 4 hidden categories', icon: '\ud83d\udfe6' },
            { href: '/card-grid', label: 'Card Grid Challenge', desc: 'Immaculate Grid — fill 3x3 matching row + column criteria', icon: '\ud83e\udde9' },
          ].map(link => (
            <Link key={link.href} href={link.href} className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-3 hover:border-zinc-600/50 transition-colors group">
              <div className="text-lg mb-1">{link.icon}</div>
              <div className="text-white text-sm font-medium group-hover:text-purple-400 transition-colors">{link.label}</div>
              <div className="text-zinc-500 text-xs">{link.desc}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Internal links */}
      <div className="mt-8 text-sm text-zinc-500">
        <p>
          Part of the <Link href="/games" className="text-purple-400 hover:underline">CardVault Games</Link> collection.
          Also try: <Link href="/card-snap" className="text-purple-400 hover:underline">Card Snap</Link>,{' '}
          <Link href="/card-blackjack" className="text-purple-400 hover:underline">Card Blackjack</Link>,{' '}
          <Link href="/card-wordle" className="text-purple-400 hover:underline">Card Wordle</Link>.
        </p>
      </div>
    </div>
  );
}
