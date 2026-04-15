import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import TournamentBracketClient from './TournamentBracketClient';

export const metadata: Metadata = {
  title: 'Card Tournament Bracket — March Madness for Sports Cards | CardVault',
  description: 'Build a tournament bracket with real sports cards. 8 or 16 cards seeded by value battle head-to-head through elimination rounds. Pick winners, track upsets, and crown a champion.',
  openGraph: {
    title: 'Card Tournament Bracket — CardVault',
    description: 'Elimination bracket tournament using real sports card stats. Seed cards by value, battle through rounds, crown a champion.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Tournament Bracket — CardVault',
    description: 'March Madness-style bracket for sports cards. Pick your winners.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/card-battle' },
  { label: 'Tournament Bracket' },
];

const faqItems = [
  {
    question: 'How does the card tournament bracket work?',
    answer: 'Cards are seeded into an elimination bracket based on their estimated value (#1 seed = most valuable). Each round, two cards face off using stats derived from real data — Power (value), Experience (years since release), Potential (rookie bonus), and a random Clutch factor. You pick the winner of each matchup, or let the stats decide with auto-battle.',
  },
  {
    question: 'How are cards seeded?',
    answer: 'Cards are seeded by estimated value, highest to lowest. The #1 seed faces the lowest seed, #2 faces the second-lowest, and so on — just like March Madness. Higher seeds have a statistical advantage but upsets happen thanks to the Clutch factor and grade multipliers.',
  },
  {
    question: 'What bracket sizes are available?',
    answer: 'You can run 8-card (3 rounds) or 16-card (4 rounds) tournaments. You can also filter the card pool by sport — baseball, basketball, football, or hockey — or use the full all-sports pool.',
  },
  {
    question: 'Can I pick the winners myself?',
    answer: 'Yes! In Manual mode, you click to pick the winner of each matchup. In Auto-Battle mode, the stats engine determines each winner automatically with animated reveals. You can also use a hybrid approach — manually pick some matchups and auto-battle others.',
  },
  {
    question: 'What is the upset tracker?',
    answer: 'The upset tracker counts how many lower-seeded cards beat higher-seeded opponents during the tournament. A perfect bracket (all favorites win) scores 0 upsets. More upsets mean a wilder, more exciting tournament.',
  },
];

export default function TournamentBracketPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault — Card Tournament Bracket',
        description: 'March Madness-style elimination bracket for sports cards. Seed by value, battle through rounds, crown a champion.',
        url: 'https://cardvault-two.vercel.app/tournament',
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

      <Breadcrumb items={breadcrumbs} />

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Tournament Bracket</h1>
          <span className="text-xs bg-amber-950/60 border border-amber-800/50 text-amber-400 px-2 py-0.5 rounded-full">Game</span>
        </div>
        <p className="text-gray-400 text-lg">
          March Madness for sports cards. Seed a bracket by value, battle through rounds, crown a champion.
        </p>
      </div>

      <TournamentBracketClient />

      <section className="mt-16 border-t border-gray-800 pt-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map(f => (
            <details key={f.question} className="group bg-gray-900 border border-gray-800 rounded-xl">
              <summary className="px-5 py-4 text-white font-medium cursor-pointer hover:text-amber-400 transition-colors">
                {f.question}
              </summary>
              <div className="px-5 pb-4 text-gray-400 text-sm">
                {f.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-lg font-bold text-white mb-4">More Games</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/card-battle', label: 'Card Battles', desc: 'Head-to-head stat combat' },
            { href: '/collection-draft', label: 'Collection Draft', desc: 'Snake draft vs AI' },
            { href: '/price-is-right', label: 'The Price is Right', desc: 'Guess the card price' },
            { href: '/collection-challenge', label: 'Collection Challenge', desc: 'Timed collecting' },
          ].map(g => (
            <Link key={g.href} href={g.href}
              className="bg-gray-900 border border-gray-800 rounded-xl p-3 hover:border-gray-700 transition-colors">
              <span className="text-white text-sm font-medium block">{g.label}</span>
              <span className="text-xs text-gray-500 mt-1 block">{g.desc}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
