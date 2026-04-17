import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardPathClient from './CardPathClient';

export const metadata: Metadata = {
  title: 'Card Path — Daily Branching Collection-Builder Game | CardVault',
  description: 'Pick one of two cards each round. Your picks bias the next pair. Build a 5-card collection, get a coherence bonus if your cards share a theme, and chase the S-tier total value. Free daily sports card collection-building game with date-seeded pairs.',
  openGraph: {
    title: 'Card Path — CardVault',
    description: '5 rounds, 2 cards each, your picks steer the deck. Bag a coherent collection and rack a value score.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Path — CardVault',
    description: 'Branching card-collection game — each pick shapes what comes next.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/games' },
  { label: 'Card Path' },
];

const faqItems = [
  {
    question: 'How do you play Card Path?',
    answer: 'Every game gives you five rounds. Each round shows two real sports cards side by side. Pick one — your pick enters your collection. What you pick steers what you see next: the following round is weighted toward cards that share attributes with your prior picks (same sport, same decade, rookie status, same value tier). After five picks you have a five-card collection, and the game scores you on two things: total fair-market value, and a coherence bonus for themed collections.',
  },
  {
    question: 'What is the coherence bonus?',
    answer: 'The game checks your five-card collection for shared themes: all the same sport (+40% value bonus), all rookie cards (+40%), all from the same decade (+30%), all in the same value tier (+25%). You can stack bonuses — an all-baseball-all-rookie collection gets both the sport and rookie bonuses. Coherent collections score materially higher than grab-bag collections of the same raw FMV, which rewards committing to a theme in early rounds.',
  },
  {
    question: 'Daily mode vs Free Play — what is the difference?',
    answer: 'Daily mode uses a date-seeded starting pair — every player who opens Card Path on the same day faces the same Round 1 pair, and the branching weights evolve the same way. Your final score is comparable across players. You get one daily run per day. Free Play generates a fresh starting pair every game with no branching constraints, so you can replay infinitely and experiment with different themes. Both modes feed the same lifetime stats.',
  },
  {
    question: 'How does branching work?',
    answer: 'After you make a pick, the game computes attribute weights based on what you\u2019ve collected so far. If you\u2019ve picked two baseball rookies, the next pair heavily favors baseball rookies. If your picks are spread across sports, the branching is looser. The branching is deliberate: it rewards players who commit to a theme and makes it harder to accidentally finish with a coherent collection. The mechanic is similar to a hobby-shop window: you walked in looking for vintage basketball, the shop owner shows you more vintage basketball.',
  },
  {
    question: 'How is the grade calculated?',
    answer: 'Your final score is (total FMV of five cards) multiplied by (1 + sum of coherence bonuses). The grade ladder is S = over $5,000, A = $2,000-$5,000, B = $1,000-$2,000, C = $500-$1,000, D = $200-$500, F = under $200. For a well-themed $500 collection, the coherence multiplier can push you from C into B territory. High-value grails pulled without a theme grade lower than modest but coherent sets.',
  },
  {
    question: 'What is the emoji share grid?',
    answer: 'After the game ends, the share button copies a small emoji summary of your picks: the card sport as an emoji (⚾ 🏀 🏈 🏒), a rookie indicator (R) or blank, and your final grade. Perfect for dropping into a group chat or a hobby Discord without leaking the specific cards you pulled.',
  },
  {
    question: 'Is this just Card Streak but branching?',
    answer: 'No. Card Streak (G-018) is an infinite higher-or-lower value game with no collection building — one wrong call ends the run. Card Path is a fixed five-round collection builder where every pick counts and coherence bonuses reshape the optimization problem. Card Streak is pure binary value-comparison; Card Path is about theme-committing vs value-chasing trade-offs. Completely different mechanic family.',
  },
  {
    question: 'How does this differ from the other branching/choice games?',
    answer: 'Card Trade-Up Challenge (G-026) is one-way — you always trade up in value, and the challenge is finding the path. Card Bracket Challenge (G-045) is a 16-card tournament. Card Path is neither: it is a five-round collection builder with biased branching that rewards theme commitment. The core tension — grail chase vs theme coherence — does not exist in any other game in the CardVault catalog.',
  },
];

export default function CardPathPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Game',
        name: 'Card Path',
        description: 'Daily branching card-collection builder. Five rounds, two cards each round, your picks bias the next pair. Score by total FMV plus coherence bonuses for themed collections.',
        url: 'https://cardvault-two.vercel.app/card-path',
        gameItem: { '@type': 'Thing', name: 'Sports trading card' },
        numberOfPlayers: { '@type': 'QuantitativeValue', value: 1 },
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
      }} />

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-orange-950/60 border border-orange-800/50 text-orange-300 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
          Daily collection-builder &middot; 5 rounds &middot; branching pairs
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">Card Path</h1>
        <p className="text-gray-400 text-lg max-w-3xl">
          Pick one of two cards each round. Your picks steer the next pair. Build a five-card collection — and if you commit to a theme, the coherence bonus pushes you up the grade ladder.
        </p>
      </div>

      <CardPathClient />

      <div className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-800/40 border border-gray-700/40 rounded-lg">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium hover:text-orange-300 transition-colors">
                {faq.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform">&#9660;</span>
              </summary>
              <div className="px-4 pb-4 text-sm text-gray-400 leading-relaxed">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>

      <div className="mt-8 border-t border-gray-800 pt-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">More card games</h3>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/card-echo" className="text-orange-300 hover:text-orange-200">Card Echo</Link>
          <Link href="/card-exile" className="text-orange-300 hover:text-orange-200">Card Exile</Link>
          <Link href="/card-oddball" className="text-orange-300 hover:text-orange-200">Card Oddball</Link>
          <Link href="/card-streak" className="text-orange-300 hover:text-orange-200">Card Streak</Link>
          <Link href="/card-bracket" className="text-orange-300 hover:text-orange-200">Card Bracket</Link>
          <Link href="/card-trade-up" className="text-orange-300 hover:text-orange-200">Trade-Up Challenge</Link>
          <Link href="/card-pyramid" className="text-orange-300 hover:text-orange-200">Card Pyramid</Link>
          <Link href="/card-wordle" className="text-orange-300 hover:text-orange-200">Card Wordle</Link>
          <Link href="/card-grid" className="text-orange-300 hover:text-orange-200">Card Grid</Link>
          <Link href="/games" className="text-orange-300 hover:text-orange-200">All Games</Link>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <Link href="/games" className="text-orange-300 hover:text-orange-200">&larr; Games</Link>
        <Link href="/" className="text-orange-300 hover:text-orange-200">Home</Link>
      </div>
    </div>
  );
}
