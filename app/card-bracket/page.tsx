import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardBracketClient from './CardBracketClient';

export const metadata: Metadata = {
  title: 'Card Bracket Challenge — 16-Card Single Elimination Tournament | CardVault',
  description: 'March Madness for sports cards! 16 cards compete in a single-elimination bracket. Pick the card you\'d rather own in each matchup. Daily bracket with the same 16 cards for everyone. Shareable results.',
  openGraph: {
    title: 'Card Bracket Challenge — Who Wins Your Bracket? | CardVault',
    description: '16 cards, 4 rounds, 1 champion. Pick the card you\'d rather own in each matchup.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Bracket Challenge — CardVault',
    description: 'March Madness for sports cards. 16 cards compete head-to-head.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/games' },
  { label: 'Card Bracket' },
];

const faqItems = [
  {
    question: 'How does the Card Bracket Challenge work?',
    answer: 'Sixteen cards from the CardVault database are seeded into a single-elimination bracket based on their estimated market value (#1 seed = highest value). In each matchup, you pick the card you\'d rather own. Your picks advance through 4 rounds (Sweet 16, Elite 8, Final 4, Championship) until one card is crowned champion.',
  },
  {
    question: 'Is the daily bracket the same for everyone?',
    answer: 'Yes! The Daily Bracket uses the same 16 cards for everyone on a given day, seeded the same way. This means you can compare your bracket picks with friends. Random mode generates fresh brackets for unlimited play.',
  },
  {
    question: 'How are cards seeded?',
    answer: 'Cards are seeded 1-16 based on their estimated raw market value, with #1 being the most valuable. Like March Madness, #1 seeds face #16 seeds in the first round, #2 faces #15, and so on. This creates interesting matchups between high-value and low-value cards.',
  },
  {
    question: 'What does "card you\'d rather own" mean?',
    answer: 'It\'s your choice! You might pick based on investment potential, personal fandom, aesthetic appeal, rarity, or any other reason. There\'s no wrong answer — the bracket reveals your collecting preferences and values.',
  },
  {
    question: 'Can I filter by sport?',
    answer: 'Yes! You can run brackets for all sports combined, or filter to baseball-only, basketball-only, football-only, or hockey-only brackets. Sport-specific brackets create more focused matchups between cards of the same type.',
  },
];

export default function CardBracketPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Bracket Challenge — 16-Card Tournament',
        description: 'March Madness style bracket tournament for sports cards. Pick the card you\'d rather own.',
        url: 'https://cardvault-two.vercel.app/card-bracket',
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
          Bracket Game &middot; 16 Cards &middot; 4 Rounds
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Card Bracket Challenge
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl">
          March Madness for sports cards. 16 cards, 4 rounds, 1 champion.
          Pick the card you&apos;d rather own in every matchup.
        </p>
      </div>

      <CardBracketClient />

      {/* Related Games */}
      <div className="mt-8 bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-3">More Games</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/card-price-is-right', label: 'Price is Right', desc: 'Guess the card value' },
            { href: '/card-groups', label: 'Card Groups', desc: 'Find hidden categories' },
            { href: '/card-tycoon', label: 'Card Tycoon', desc: 'Buy low, sell high' },
            { href: '/flip-or-keep', label: 'Flip or Keep', desc: 'Keep or cash out?' },
            { href: '/card-war', label: 'Card War', desc: 'High card wins' },
            { href: '/rip-or-skip', label: 'Rip or Skip', desc: 'Vote on sealed products' },
          ].map(g => (
            <Link key={g.href} href={g.href} className="block bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-3 hover:border-purple-600/50 transition-colors">
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
        Card values are estimates. Bracket matchups are for entertainment. Your picks reflect personal preference, not financial advice.
      </p>
    </div>
  );
}
