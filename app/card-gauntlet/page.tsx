import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardGauntletClient from './CardGauntletClient';

export const metadata: Metadata = {
  title: 'Card Gauntlet — Endless Survival Card Game | CardVault',
  description: 'How far can you survive? Pick the more valuable sports card in each round. 3 lives, escalating difficulty, streak multipliers, bonus rounds every 10. 9,600+ real cards from MLB, NBA, NFL, NHL.',
  openGraph: {
    title: 'Card Gauntlet — Endless Survival Mode | CardVault',
    description: 'Endless card value survival game. 3 lives, 5 difficulty tiers, bonus rounds. Daily + random modes.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Gauntlet | CardVault',
    description: 'Survive the gauntlet. Pick the more valuable card. 3 lives, escalating difficulty, bonus rounds.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/games' },
  { label: 'Card Gauntlet' },
];

const faqItems = [
  {
    question: 'How do I play Card Gauntlet?',
    answer: 'Two sports cards appear each round. Pick the one you think is worth more. Correct picks earn points with streak multipliers. Wrong picks cost one of your 3 lives. Survive as many rounds as possible.',
  },
  {
    question: 'How does difficulty work?',
    answer: 'Difficulty increases every 10 rounds. Easy (rounds 1-10) has wide value gaps between cards. Medium (11-20) narrows the gap. Hard (21-35) presents close values. Expert (36-50) shows very close values. Legendary (51+) features near-identical prices — only true card market experts survive.',
  },
  {
    question: 'What are bonus rounds?',
    answer: 'Every 10 rounds you enter a bonus round. Three mystery cards appear face-down — pick one for bonus points. The card value determines your bonus (up to 500 points). It is a chance to boost your score with no risk.',
  },
  {
    question: 'How do streak multipliers work?',
    answer: 'Getting consecutive correct answers builds a streak. At 5 in a row you earn 2x points per correct pick. At 10 in a row it jumps to 3x. At 15+ in a row you earn 4x. A single wrong answer resets your streak to zero.',
  },
  {
    question: 'What cards are used in the game?',
    answer: 'Card Gauntlet uses over 9,600 real sports cards from the CardVault database spanning baseball, basketball, football, and hockey from 1909 to 2025. You can filter by sport to practice with cards from a specific league.',
  },
];

export default function CardGauntletPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Card Gauntlet',
        description: 'Endless survival card game. Pick the more valuable sports card in each round. 3 lives, escalating difficulty, streak multipliers, bonus rounds.',
        url: 'https://cardvault-two.vercel.app/card-gauntlet',
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
        <div className="inline-flex items-center gap-2 bg-rose-950/60 border border-rose-800/50 text-rose-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse" />
          Card Gauntlet &middot; 3 Lives &middot; 5 Tiers &middot; Endless
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">Card Gauntlet</h1>
        <p className="text-gray-400 text-lg">
          Two cards. One question: which is worth more? Get it right and advance.
          Get it wrong and lose a life. Difficulty escalates every 10 rounds. How far can you go?
        </p>
      </div>

      <CardGauntletClient />

      {/* FAQ */}
      <div className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-800/40 border border-gray-700/40 rounded-lg">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium hover:text-rose-400 transition-colors">
                {faq.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform">&#9660;</span>
              </summary>
              <div className="px-4 pb-4 text-sm text-gray-400">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>

      {/* Related Links */}
      <div className="mt-8 border-t border-gray-800 pt-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">More Games</h3>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/card-ladder" className="text-rose-500 hover:text-rose-400">Card Ladder</Link>
          <Link href="/card-streak" className="text-rose-500 hover:text-rose-400">Card Streak</Link>
          <Link href="/card-war" className="text-rose-500 hover:text-rose-400">Card War</Link>
          <Link href="/card-chain" className="text-rose-500 hover:text-rose-400">Card Chain</Link>
          <Link href="/card-value-snap" className="text-rose-500 hover:text-rose-400">Value Snap</Link>
          <Link href="/card-bracket" className="text-rose-500 hover:text-rose-400">Card Bracket</Link>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <Link href="/games" className="text-rose-500 hover:text-rose-400">&larr; All Games</Link>
        <Link href="/tools" className="text-rose-500 hover:text-rose-400">Tools</Link>
        <Link href="/" className="text-rose-500 hover:text-rose-400">Home</Link>
      </div>
    </div>
  );
}
