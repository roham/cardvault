import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardPincerClient from './CardPincerClient';

export const metadata: Metadata = {
  title: 'Card Pincer — Pinch Two Cards That Match the Rule | CardVault',
  description: 'Daily snap-judgment matching game. Ten rounds, sixty seconds total. Each round shows twelve real sports cards and a matching rule \u2014 same year, same sport, same set family, or same player. Pinch the two that satisfy. Correct + 1. Wrong = next. Fast.',
  openGraph: {
    title: 'Card Pincer — CardVault',
    description: 'Ten rounds. Sixty seconds. Pinch the two cards that share the attribute. Daily matching game.',
    type: 'website',
  },
  twitter: { card: 'summary', title: 'Card Pincer — CardVault', description: 'Find the matching pair in a twelve-card grid. Daily snap-judgment game.' },
  alternates: { canonical: './' },
};

const breadcrumbs = [ { label: 'Home', href: '/' }, { label: 'Games', href: '/games' }, { label: 'Card Pincer' } ];

const faqItems = [
  { question: 'What counts as a match?', answer: 'The rule shown at the top of each round: SAME YEAR (both cards printed in the same year), SAME SPORT (both from MLB / NBA / NFL / NHL), SAME SET FAMILY (both from Topps Chrome, Panini Prizm, Bowman Chrome, etc. \u2014 ignoring year), or SAME PLAYER (both are cards of the same player across different sets).' },
  { question: 'Do I have to find the ONLY valid pair?', answer: 'No. Any valid pair works \u2014 multiple valid pairs may exist in each round, and you only need to find one of them. The game generates the grid such that at least one valid pair is always present.' },
  { question: 'Why is the timer sixty seconds total, not per round?', answer: 'Sixty seconds across ten rounds averages out to six seconds per round, which rewards snap recognition rather than systematic analysis. Banking time on easy rounds lets you spend longer on harder ones \u2014 the classic speed-and-depth trade-off that makes the game replayable.' },
  { question: 'What\u2019s the share grid?', answer: 'Ten emoji squares representing each round\u2019s outcome \u2014 green for correct, black for wrong. Score + grid + mode are in the share text; the actual card names are not, so you can post your result without spoiling today\u2019s Daily Pincer for anyone else.' },
  { question: 'How does streak work?', answer: 'Score 6/10 or better on Daily to maintain the streak. Free Play results do not affect streak. Streak resets to zero if you skip a day; the game checks whether your last Daily completion was yesterday to determine continuation.' },
];

export default function CardPincerPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'Game', name: 'Card Pincer', description: 'Daily snap-judgment matching game: pinch two sports cards from a twelve-card grid that share the round\u2019s attribute (year, sport, set family, or player).', url: 'https://cardvault-two.vercel.app/card-pincer', genre: 'Card matching game', applicationCategory: 'GameApplication', operatingSystem: 'Web', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } }} />
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqItems.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })) }} />

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-purple-950/60 border border-purple-800/50 text-purple-300 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
          Daily game &middot; 10 rounds &middot; 60-second total clock &middot; 4 match types
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">Card Pincer</h1>
        <p className="text-gray-400 text-lg max-w-3xl">Twelve cards on the table. One matching rule. Pinch the two that satisfy. Ten rounds. Sixty seconds total. Same year, same sport, same set family, or same player \u2014 the rule changes every round.</p>
      </div>

      <CardPincerClient />

      <div className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-800/40 border border-gray-700/40 rounded-lg">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium hover:text-purple-300 transition-colors">{faq.question}<span className="text-gray-500 group-open:rotate-180 transition-transform">&#9660;</span></summary>
              <div className="px-4 pb-4 text-sm text-gray-400 leading-relaxed">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>

      <div className="mt-8 border-t border-gray-800 pt-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Related Games</h3>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/card-dozen" className="text-purple-300 hover:text-purple-200">Card Dozen</Link>
          <Link href="/card-connections" className="text-purple-300 hover:text-purple-200">Card Connections</Link>
          <Link href="/card-mastermind" className="text-purple-300 hover:text-purple-200">Card Mastermind</Link>
          <Link href="/rank-or-tank" className="text-purple-300 hover:text-purple-200">Rank or Tank</Link>
          <Link href="/card-briefcase" className="text-purple-300 hover:text-purple-200">Card Briefcase</Link>
          <Link href="/flip-or-keep" className="text-purple-300 hover:text-purple-200">Flip or Keep</Link>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <Link href="/games" className="text-purple-300 hover:text-purple-200">&larr; All Games</Link>
        <Link href="/tools" className="text-purple-300 hover:text-purple-200">Tools</Link>
        <Link href="/" className="text-purple-300 hover:text-purple-200">Home</Link>
      </div>
    </div>
  );
}
