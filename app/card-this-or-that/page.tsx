import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import { sportsCards } from '@/data/sports-cards';
import ThisOrThatClient from './ThisOrThatClient';

export const metadata: Metadata = {
  title: 'Card This or That — Would You Rather Collector Game | CardVault',
  description: 'Would you rather own this card or that one? 20 head-to-head matchups reveal your Collector Personality. Daily mode with the same matchups for everyone, plus random mode for unlimited play.',
  openGraph: {
    title: 'Card This or That — Discover Your Collector Personality | CardVault',
    description: '20 rounds. 2 cards each. Pick the one you\'d rather own. Discover if you\'re a Vintage Connoisseur, Modern Flipper, Bargain Hunter, or something else entirely.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card This or That — CardVault',
    description: 'Would you rather own this card or that one? 20 rounds reveal your Collector Personality.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/games' },
  { label: 'Card This or That' },
];

const faqItems = [
  {
    question: 'How does Card This or That work?',
    answer: 'You\'re shown two sports cards side by side for 20 rounds. In each round, pick the card you\'d rather have in your collection. After all 20 rounds, the game analyzes your choices and assigns you a Collector Personality based on patterns in your picks — like whether you gravitated toward vintage cards, rookies, expensive cards, or bargains.',
  },
  {
    question: 'What are the Collector Personality types?',
    answer: 'There are 8 possible personalities: Vintage Connoisseur (loves pre-1990 cards), Modern Flipper (prefers newer high-value cards), Bargain Hunter (picks lower-value cards), Big Spender (always picks the pricier option), Rookie Chaser (gravitates toward rookie cards), Cross-Sport Collector (picks across multiple sports), Brand Loyalist (sticks to one brand), and The Contrarian (consistently picks the less popular option).',
  },
  {
    question: 'Is the daily game the same for everyone?',
    answer: 'Yes! Daily mode uses a date-based seed so everyone sees the same 20 matchups on the same day. This lets you compare your Collector Personality with friends. Random mode generates fresh matchups every time for unlimited play.',
  },
  {
    question: 'How is my personality determined?',
    answer: 'The game tracks several metrics across your 20 picks: average card value, era distribution (pre-1990 vs modern), rookie card percentage, sport diversity, brand consistency, and whether you tend to pick the higher or lower-value card. The dominant pattern in your choices determines your personality type.',
  },
  {
    question: 'Can I play more than once a day?',
    answer: 'Daily mode is once per day with the same 20 matchups for everyone. You can play Random mode as many times as you want for fresh matchups. Your personality history, games played, and favorite sport/era are all tracked in your browser\'s local storage.',
  },
];

export default function CardThisOrThatPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card This or That — Collector Personality Game',
        description: 'Would you rather own this card or that one? 20 rounds reveal your Collector Personality type.',
        url: 'https://cardvault-two.vercel.app/card-this-or-that',
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
        <div className="inline-flex items-center gap-2 bg-violet-950/60 border border-violet-800/50 text-violet-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
          Personality Game &middot; 20 Rounds &middot; 8 Types
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Card This or That
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl">
          Would you rather own this card or that one? Pick your favorite in 20 head-to-head matchups and discover your Collector Personality.
        </p>
      </div>

      <ThisOrThatClient cards={sportsCards} />

      {/* Related Games */}
      <div className="mt-8 bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-3">More Games</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/card-bracket', label: 'Card Bracket', desc: '16-card tournament' },
            { href: '/card-price-is-right', label: 'Price is Right', desc: 'Guess the card value' },
            { href: '/flip-or-keep', label: 'Flip or Keep', desc: 'Keep or cash out?' },
            { href: '/card-groups', label: 'Card Groups', desc: 'Find hidden categories' },
            { href: '/rip-or-skip', label: 'Rip or Skip', desc: 'Vote on sealed products' },
            { href: '/card-war', label: 'Card War', desc: 'High card wins' },
          ].map(g => (
            <Link key={g.href} href={g.href} className="block bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-3 hover:border-violet-600/50 transition-colors">
              <div className="text-white text-sm font-medium">{g.label}</div>
              <div className="text-zinc-500 text-xs mt-0.5">{g.desc}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-8 space-y-4">
        <h2 className="text-lg font-bold text-white">Frequently Asked Questions</h2>
        {faqItems.map((f) => (
          <details key={f.question} className="group bg-zinc-900/60 border border-zinc-800 rounded-lg">
            <summary className="cursor-pointer px-5 py-4 text-sm font-medium text-white group-open:border-b group-open:border-zinc-800">
              {f.question}
            </summary>
            <div className="px-5 py-4 text-sm text-zinc-400">{f.answer}</div>
          </details>
        ))}
      </div>

      <p className="text-center text-zinc-600 text-xs mt-10">
        Card values are estimates. Collector Personality results are for entertainment. Your picks reflect personal preference, not financial advice.
      </p>
    </div>
  );
}
