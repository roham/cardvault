import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CollectionDraftClient from './CollectionDraftClient';

export const metadata: Metadata = {
  title: 'Collection Draft — Snake Draft Card Game vs AI | CardVault',
  description: 'Draft cards against AI opponents in a fantasy-style snake draft. Pick the best cards, outsmart rival collectors, and build the most valuable collection. 4, 6, or 8-team leagues.',
  openGraph: {
    title: 'Collection Draft — Snake Draft Card Game | CardVault',
    description: 'Fantasy-style snake draft for card collectors. Build the most valuable collection against AI opponents.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Collection Draft — CardVault',
    description: 'Snake draft card game: outsmart AI opponents and build the best collection.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/card-battle' },
  { label: 'Collection Draft' },
];

const faqItems = [
  {
    question: 'What is the Collection Draft?',
    answer: 'The Collection Draft is a fantasy-style snake draft game where you pick cards against AI opponents. Each drafter takes turns selecting real cards from the database. The goal is to build the collection with the highest total estimated value.',
  },
  {
    question: 'How does a snake draft work?',
    answer: 'In a snake draft, the pick order reverses each round. If you pick 3rd in round 1 (order: 1-2-3-4), you pick 2nd in round 2 (order: 4-3-2-1). This balances the advantage of picking early with getting consecutive picks at the turn.',
  },
  {
    question: 'How do the AI opponents decide what to pick?',
    answer: 'Each AI drafter has a unique collecting personality — some prefer rookies, others chase vintage cards, and some focus on specific sports. They prioritize cards that match their strategy but also recognize high value picks. They are not perfect — you can outmaneuver them with smart strategy.',
  },
  {
    question: 'What league sizes are available?',
    answer: 'You can draft in 4-team, 6-team, or 8-team leagues. Larger leagues mean more competition for top cards, making later picks more strategic. You can also choose between 3, 5, 7, or 10 rounds.',
  },
  {
    question: 'Can I filter the card pool?',
    answer: 'Yes. You can limit the draft to a single sport (baseball, basketball, football, or hockey) or use the full all-sports pool. Only cards valued at $10 or more are included in the draft pool.',
  },
];

export default function CollectionDraftPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault — Collection Draft',
        description: 'Fantasy-style snake draft game for card collectors. Draft against AI opponents to build the most valuable collection.',
        url: 'https://cardvault-two.vercel.app/collection-draft',
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
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Collection Draft</h1>
          <span className="text-xs bg-purple-950/60 border border-purple-800/50 text-purple-400 px-2 py-0.5 rounded-full">Game</span>
        </div>
        <p className="text-gray-400 text-lg">
          Snake draft against AI collectors. Pick the best cards, outsmart your rivals, build the most valuable collection.
        </p>
      </div>

      <CollectionDraftClient />

      {/* FAQ section */}
      <section className="mt-16 border-t border-gray-800 pt-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map(f => (
            <details key={f.question} className="group bg-gray-900 border border-gray-800 rounded-xl">
              <summary className="px-5 py-4 text-white font-medium cursor-pointer hover:text-emerald-400 transition-colors">
                {f.question}
              </summary>
              <div className="px-5 pb-4 text-gray-400 text-sm">
                {f.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Related */}
      <section className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-lg font-bold text-white mb-4">More Games</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/card-battle', label: 'Card Battles', icon: '⚔️' },
            { href: '/price-is-right', label: 'The Price is Right', icon: '💰' },
            { href: '/trading-sim', label: 'Trading Simulator', icon: '🔄' },
            { href: '/tournament', label: 'Tournament Bracket', icon: '🏆' },
          ].map(g => (
            <Link key={g.href} href={g.href}
              className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center hover:border-gray-700 transition-colors">
              <span className="text-2xl block mb-1">{g.icon}</span>
              <span className="text-white text-sm font-medium">{g.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
