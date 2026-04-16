import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardDraftClient from './CardDraftClient';

export const metadata: Metadata = {
  title: 'Card Draft Showdown — Snake Draft vs AI Opponents | CardVault',
  description: 'Draft 8 sports cards in a snake draft against 3 AI opponents. Outmaneuver The Investor, The Rookie Hunter, and The Vintage Collector to build the most valuable portfolio. Free daily challenge.',
  openGraph: {
    title: 'Card Draft Showdown — Can You Out-Draft the AI? | CardVault',
    description: 'Snake draft 8 cards against 3 AI opponents with unique strategies. Build the highest-value portfolio to win.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Draft Showdown — CardVault',
    description: 'Snake draft vs 3 AI opponents. Build the best 8-card portfolio.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/' },
  { label: 'Card Draft Showdown' },
];

const faqItems = [
  {
    question: 'How does Card Draft Showdown work?',
    answer: 'You and 3 AI opponents take turns picking cards in a snake draft format. The draft has 8 rounds with 4 picks per round (one per player). In odd rounds the order is You → AI 1 → AI 2 → AI 3. In even rounds the order reverses: AI 3 → AI 2 → AI 1 → You. Each player ends up with 8 cards. The player with the highest total portfolio value wins.',
  },
  {
    question: 'Who are the AI opponents?',
    answer: 'There are 3 AI drafters, each with a unique strategy. The Investor always picks the highest-value card available. The Rookie Hunter prioritizes rookie cards (RC) above all else, then falls back to highest value. The Vintage Collector targets the oldest cards first. Understanding their strategies is key to winning — you can snipe high-value cards before The Investor or grab a valuable rookie before The Rookie Hunter gets it.',
  },
  {
    question: 'What is a snake draft?',
    answer: 'A snake draft reverses the pick order every round to keep things fair. If you pick first in round 1, you pick last in round 2, then first again in round 3. This ensures the player who picks first overall does not always get first choice. It is the same format used in fantasy football, NBA drafts, and other competitive drafts.',
  },
  {
    question: 'Is the Daily Draft the same for everyone?',
    answer: 'Yes! Daily mode uses a date-based seed so the same 32-card pool appears for all players. This lets you compare your draft strategy and results with friends. Random mode generates a fresh pool every game for unlimited practice.',
  },
  {
    question: 'How is my grade calculated?',
    answer: 'Your grade compares your total portfolio value against the best AI opponent. S grade means you beat the best AI by 20%+. A is 10-20% ahead, B is 0-10%, C is 0-10% behind, D is 10-25% behind, and F is more than 25% behind. Beating all 3 AIs requires strategic drafting — not just always picking the most expensive card.',
  },
];

export default function CardDraftPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Draft Showdown — Snake Draft vs AI Opponents',
        description: 'Draft 8 sports cards in a snake draft against 3 AI opponents. Build the highest-value portfolio.',
        url: 'https://cardvault-two.vercel.app/card-draft',
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
          Snake Draft &middot; 8 Rounds &middot; 3 AI Opponents
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Card Draft Showdown
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl">
          Draft 8 cards against 3 AI opponents in a snake draft. Each AI has a different strategy — outmaneuver them all to build the most valuable portfolio.
        </p>
      </div>

      <CardDraftClient />

      {/* Related Games */}
      <div className="mt-8 bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-3">More Games</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/card-tycoon', label: 'Card Tycoon', desc: 'Buy low, sell high market sim' },
            { href: '/card-bracket', label: 'Card Bracket', desc: '16-card tournament' },
            { href: '/card-this-or-that', label: 'This or That', desc: 'Discover your collector type' },
            { href: '/weekly-challenge', label: 'Weekly Challenge', desc: 'Draft 5, compete weekly' },
            { href: '/card-price-is-right', label: 'Price is Right', desc: 'Guess the card value' },
            { href: '/card-battle', label: 'Card Battles', desc: 'Stat-based card combat' },
          ].map(g => (
            <Link key={g.href} href={g.href} className="bg-zinc-800/60 border border-zinc-700/30 rounded-lg p-3 hover:border-zinc-600/50 transition-colors">
              <p className="text-white text-sm font-medium">{g.label}</p>
              <p className="text-zinc-500 text-xs">{g.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-8 border-t border-zinc-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {faqItems.map(f => (
            <details key={f.question} className="group bg-zinc-900/80 border border-zinc-800 rounded-lg">
              <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-zinc-200 hover:text-white flex items-center justify-between">
                {f.question}
                <span className="text-zinc-600 group-open:rotate-180 transition-transform">&#x25BC;</span>
              </summary>
              <div className="px-4 pb-4 text-sm text-zinc-400 leading-relaxed">
                {f.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
