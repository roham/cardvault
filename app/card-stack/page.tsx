import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardStackClient from './CardStackClient';

export const metadata: Metadata = {
  title: 'Card Stack Challenge — Hit $500 Exactly | CardVault',
  description: 'Build a 5-card stack that totals exactly $500. Cards stream by — add or skip. 30 seconds on the clock. Test your card pricing instincts in this fast-paced daily challenge. Shareable results and high score tracking.',
  openGraph: {
    title: 'Card Stack Challenge — CardVault',
    description: 'Build a 5-card stack worth exactly $500. 30 seconds. How close can you get?',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Stack Challenge — CardVault',
    description: '5 cards. $500 target. 30 seconds. Go.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/games' },
  { label: 'Card Stack Challenge' },
];

const faqItems = [
  {
    question: 'How does the Card Stack Challenge work?',
    answer: 'Cards from our database of 6,200+ real sports cards stream by one at a time. Each shows the player, set, year, and estimated raw value. You have 30 seconds to build a 5-card stack that totals as close to $500 as possible. Tap "Add to Stack" to keep a card or "Skip" to pass. The game ends when you have 5 cards, run out of time, or run out of cards.',
  },
  {
    question: 'How is the score calculated?',
    answer: 'Your score starts at 1,000 and decreases based on how far your stack total is from the $500 target. Hitting exactly $500 earns 1,000 points. You get a 200-point bonus for filling all 5 slots. The maximum possible score is 1,200 (perfect $500 with a full stack). Grades range from S (perfect) to D (keep practicing).',
  },
  {
    question: 'Are the card values real?',
    answer: 'Yes — every card and price comes from CardVault\'s database of real sports cards with estimated market values based on recent sold data. The challenge uses cards valued between $10 and $300 raw for interesting gameplay. This is a great way to test and improve your knowledge of card values across baseball, basketball, football, and hockey.',
  },
  {
    question: 'Is it the same cards every day?',
    answer: 'Yes — the card sequence is seeded by today\'s date, so everyone who plays today sees the same cards in the same order. This makes it fair for comparing scores and sharing results. Tomorrow brings a new set of cards. Your high score persists across sessions.',
  },
  {
    question: 'What strategy works best?',
    answer: 'Keep a running mental total and know how much room you have left. Early picks are flexible — take cards in the $80-$120 range. As you get closer to 5 cards, you need to be more precise. The "preview" text under each card shows what your total would be if you add it. Skip expensive cards early unless they perfectly fit your target. Leave room for adjustment on the last 1-2 picks.',
  },
];

export default function CardStackPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Stack Challenge',
        description: 'Build a 5-card stack that totals exactly $500. Cards stream by with real values — add or skip in 30 seconds.',
        url: 'https://cardvault-two.vercel.app/card-stack',
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
          Daily Challenge &middot; 30 Seconds &middot; Real Card Values
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Stack Challenge</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Build a 5-card stack that totals exactly <span className="text-amber-400 font-bold">$500</span>.
          Cards stream by with real prices — add or skip. You have 30 seconds. How close can you get?
        </p>
      </div>

      <CardStackClient />

      {/* FAQ */}
      <section className="mt-16 mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
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
      <div className="border-t border-gray-800 pt-8">
        <h2 className="text-lg font-semibold text-white mb-4">More Games</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/card-value-snap', label: 'Value Snap', desc: 'Which card is worth more?' },
            { href: '/card-roulette', label: 'Card Roulette', desc: 'Buy or pass — 20 spins' },
            { href: '/flip-or-keep', label: 'Flip or Keep', desc: 'Cash out or collect' },
            { href: '/card-war', label: 'Card War', desc: 'Pick the higher value' },
            { href: '/hot-potato', label: 'Hot Potato', desc: 'Sell before the crash' },
            { href: '/market-tycoon', label: 'Market Tycoon', desc: 'Trade cards like stocks' },
          ].map(l => (
            <Link key={l.href} href={l.href} className="p-3 bg-gray-800/40 hover:bg-gray-800/70 border border-gray-700 rounded-lg transition-colors group">
              <div className="text-white text-sm font-medium group-hover:text-amber-400 transition-colors">{l.label}</div>
              <div className="text-gray-500 text-xs">{l.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
