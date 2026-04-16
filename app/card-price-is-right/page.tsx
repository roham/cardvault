import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardPriceIsRightClient from './CardPriceIsRightClient';

export const metadata: Metadata = {
  title: 'Card Price is Right — Guess the Card Value Game | CardVault',
  description: 'Test your card pricing knowledge! See a sports card, guess its market value. Price is Right rules: closest without going over wins. 10 rounds, daily challenge, high scores. 7,800+ real cards from MLB, NBA, NFL, and NHL.',
  openGraph: {
    title: 'Card Price is Right — Can You Guess the Value? | CardVault',
    description: 'Guess the market value of sports cards. Price is Right rules — closest without going over. Daily challenge mode.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Price is Right — CardVault',
    description: 'Guess card values in this Price is Right-style game. 7,800+ real sports cards.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/games' },
  { label: 'Card Price is Right' },
];

const faqItems = [
  {
    question: 'How does Card Price is Right work?',
    answer: 'You are shown a sports card from the CardVault database — the player, year, set, and sport are visible, but NOT the price. You type your best guess for the raw (ungraded) market value. Scoring uses Price is Right rules: the closer you are WITHOUT going over, the more points you earn. Going over the actual value is a BUST (0 points). Play 10 rounds and try to maximize your total score.',
  },
  {
    question: 'What are the scoring tiers?',
    answer: 'Perfect (within 10% under): 1,000 points. Excellent (within 25% under): 750 points. Good (within 50% under): 500 points. Low (more than 50% under): 250 points. BUST (over the actual value): 0 points. A perfect game is 10,000 points.',
  },
  {
    question: 'What is the Daily Challenge?',
    answer: 'The Daily Challenge uses the same 10 cards for everyone on a given day, so you can compare scores with friends. The Random mode generates a fresh set of cards each game for unlimited practice. Both modes track your high score separately.',
  },
  {
    question: 'Which cards appear in the game?',
    answer: 'Cards are drawn from CardVault\'s database of 7,800+ real sports cards spanning MLB, NBA, NFL, and NHL. Values range from under $1 to over $100,000, so you need to know your market across all sports and eras. You can filter by sport to focus on your area of expertise.',
  },
  {
    question: 'How does this help me as a collector?',
    answer: 'Knowing card values by sight is the #1 skill for finding deals at card shows, spotting underpriced eBay listings, and making smart trades. This game trains your pricing instincts across thousands of real cards. Top collectors and dealers can estimate values within 20% on sight — this game helps you build that skill.',
  },
];

export default function CardPriceIsRightPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Price is Right — Guess the Card Value Game',
        description: 'Test your card pricing knowledge. Guess sports card market values using Price is Right rules.',
        url: 'https://cardvault-two.vercel.app/card-price-is-right',
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
        <div className="inline-flex items-center gap-2 bg-green-950/60 border border-green-800/50 text-green-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          Price Game &middot; 10 Rounds &middot; Daily Challenge
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Card Price is Right
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl">
          See a card. Guess the value. Closest without going over wins.
          Price is Right rules with 7,800+ real sports cards.
        </p>
      </div>

      <CardPriceIsRightClient />

      {/* How to Play */}
      <div className="mt-12 bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">How to Play</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm text-zinc-400">
          <div className="flex gap-3">
            <span className="text-green-400 font-bold text-lg">1</span>
            <div><span className="text-white font-medium">See the card</span> — player, year, set, and sport are shown. The price is hidden.</div>
          </div>
          <div className="flex gap-3">
            <span className="text-green-400 font-bold text-lg">2</span>
            <div><span className="text-white font-medium">Type your guess</span> — estimate the raw (ungraded) market value in dollars.</div>
          </div>
          <div className="flex gap-3">
            <span className="text-green-400 font-bold text-lg">3</span>
            <div><span className="text-white font-medium">Don&apos;t go over!</span> — like the TV show, going over the real price is a BUST (0 points).</div>
          </div>
          <div className="flex gap-3">
            <span className="text-green-400 font-bold text-lg">4</span>
            <div><span className="text-white font-medium">Score points</span> — closer guesses earn more. Perfect = 1,000 pts per round.</div>
          </div>
        </div>
      </div>

      {/* Related Games */}
      <div className="mt-8 bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-3">More Card Games</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/card-tycoon', label: 'Card Tycoon', desc: 'Buy low, sell high simulator' },
            { href: '/card-groups', label: 'Card Groups', desc: 'Find the hidden categories' },
            { href: '/card-hangman', label: 'Card Hangman', desc: 'Guess the player letter by letter' },
            { href: '/card-trivia', label: 'Card Trivia', desc: '5 daily trivia questions' },
            { href: '/flip-or-keep', label: 'Flip or Keep', desc: 'Flip for cash or keep for collection' },
            { href: '/card-speed-quiz', label: 'Speed Quiz', desc: 'Rapid-fire card knowledge test' },
          ].map(g => (
            <Link key={g.href} href={g.href} className="block bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-3 hover:border-green-600/50 transition-colors">
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
        Card values are estimates based on recent market data. Actual sold prices vary. For entertainment and education only.
      </p>
    </div>
  );
}
