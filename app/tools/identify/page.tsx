import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardIdentifier from './CardIdentifier';

export const metadata: Metadata = {
  title: 'Card Identifier — Find Any Sports Card',
  description: 'Describe a sports card and find the exact match. Search by player name, year, set, card number, or any detail you know. Free card identification tool.',
  openGraph: {
    title: 'Card Identifier — CardVault',
    description: 'Can\'t identify a card? Describe it and we\'ll find it. Search 959+ sports cards by any detail.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Identifier — CardVault',
    description: 'Describe a card, find the match. Player, year, set, number — any detail works.',
  },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Card Identifier' },
];

const faqItems = [
  {
    question: 'How do I identify an unknown sports card?',
    answer: 'Look for these details on the card: player name (front), card number (usually on the back), set name and year (back or bottom edge), and the card manufacturer logo (Topps, Panini, Upper Deck). Enter any of these details into our Card Identifier and we\'ll find the closest matches from our database of 959+ cards.',
  },
  {
    question: 'How do I find out what year a card is from?',
    answer: 'Check the back of the card — most cards list the copyright year and set name. Look for text like "2024 Topps" or "2023-24 Panini Prizm." If there\'s no year visible, the card design, player photo, and manufacturer can help narrow it down. Enter what you can see into our identifier.',
  },
  {
    question: 'What\'s the difference between a base card and an insert?',
    answer: 'Base cards are the standard cards in a set (numbered sequentially, same design). Inserts are special themed subset cards with unique designs — they\'re typically rarer and more valuable. Parallels are base cards with different finishes (refractor, foil, numbered). Our identifier searches across all types.',
  },
];

export default function IdentifyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Card Identifier',
        description: 'Free card identification tool. Describe any sports card and find the exact match from our database.',
        url: 'https://cardvault-two.vercel.app/tools/identify',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map(item => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      }} />

      <Breadcrumb items={breadcrumbs} />

      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-orange-950/60 border border-orange-800/50 text-orange-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
          959+ cards · Smart search · Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Card Identifier
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Found a card and don&apos;t know what it is? Type any details you can see — player name, year, set, card number — and we&apos;ll find it.
        </p>
      </div>

      {/* Identifier */}
      <CardIdentifier />

      {/* FAQ */}
      <section className="mt-16 mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map(item => (
            <div key={item.question} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-white font-semibold text-sm mb-2">{item.question}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Internal links */}
      <div className="border-t border-gray-800 pt-10">
        <h3 className="text-white font-semibold mb-4">Related Tools</h3>
        <div className="flex flex-wrap gap-3">
          <Link href="/tools" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
            Price Check
          </Link>
          <Link href="/tools/compare" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
            Compare Cards
          </Link>
          <Link href="/tools/grading-roi" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
            Grading ROI
          </Link>
          <Link href="/sports" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
            Browse All Cards
          </Link>
        </div>
      </div>
    </div>
  );
}
