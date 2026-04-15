import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import StorageCalc from './StorageCalc';

export const metadata: Metadata = {
  title: 'Card Storage & Supplies Calculator — What Do I Need for My Collection?',
  description: 'Free card storage calculator. Enter your collection size and get an exact supplies shopping list: penny sleeves, top loaders, binder pages, storage boxes, and more. With bulk pricing.',
  openGraph: {
    title: 'Card Storage & Supplies Calculator | CardVault',
    description: 'Enter your collection size, get an instant shopping list. Penny sleeves, top loaders, binder pages, one-touches, and more with cost estimates.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Storage & Supplies Calculator — CardVault',
    description: 'How many supplies do you need? Enter your collection, get an exact shopping list with prices.',
  },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Storage & Supplies Calculator' },
];

const faqItems = [
  {
    question: 'What supplies do I need for my card collection?',
    answer: 'Every raw card needs a penny sleeve ($0.01-0.02 each). Cards worth $5+ should go in top loaders ($0.08-0.15 each) or one-touch magnetic cases ($2.50-3.50 for high-value cards). Bulk/commons go in 9-pocket binder pages ($0.20-0.35 each, holds 9 cards). You also need team bags for dust protection, storage boxes, and optionally display stands. Our calculator gives you exact quantities and costs based on your collection.',
  },
  {
    question: 'How should I store valuable cards?',
    answer: 'For cards worth $5-50: penny sleeve + 35pt top loader + team bag, stored upright in a storage box. For cards worth $50-500: penny sleeve + one-touch magnetic case + team bag. For cards worth $500+: consider professional grading (PSA, BGS, CGC) for the tamper-evident case, or store in a one-touch case inside a safe or safety deposit box. Always store in climate-controlled conditions (65-72°F, 40-50% humidity).',
  },
  {
    question: 'What is the best way to store graded cards?',
    answer: 'Store graded slabs standing up vertically (like books on a shelf) in purpose-built graded card boxes. Never stack slabs flat — the weight can crack lower cases. Keep them in team bags to prevent case scratching. For valuable graded cards ($500+), consider a fireproof safe or safety deposit box with separate insurance coverage.',
  },
  {
    question: 'How much does it cost to properly store a card collection?',
    answer: 'Basic protection costs about $0.10-0.25 per card (penny sleeve + top loader + team bag). Binder storage is cheaper at $0.03-0.05 per card (penny sleeve + binder page share). A 500-card collection typically costs $30-60 for proper supplies. Buying in bulk (100+ units) saves 30-50% on most supplies. Our calculator gives you exact costs for your collection size.',
  },
  {
    question: 'What card storage supplies should I avoid?',
    answer: 'Avoid: PVC binder pages (they cause cards to stick and deteriorate — use polypropylene instead), rubber bands (they leave permanent indentations), Scotch tape near cards (use blue painter\'s tape), magnetic cases from unknown brands (weak magnets can open and drop cards), and any storage in non-climate-controlled spaces like attics, garages, or basements.',
  },
];

export default function StorageCalcPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Storage & Supplies Calculator',
        description: 'Free card storage calculator. Enter your collection size and get an exact supplies shopping list with cost estimates.',
        url: 'https://cardvault-two.vercel.app/tools/storage-calc',
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

      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-blue-950/60 border border-blue-800/50 text-blue-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
          Instant Shopping List - Bulk Pricing - Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Storage & Supplies Calculator</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Enter your collection breakdown and get an exact shopping list with quantities and costs. Includes penny sleeves, top loaders, binder pages, storage boxes, display stands, and shipping supplies.
        </p>
      </div>

      <StorageCalc />

      {/* FAQ Section */}
      <div className="mt-12 border-t border-gray-800 pt-10">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <details key={i} className="group bg-gray-900/60 border border-gray-800 rounded-xl">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium text-sm hover:text-blue-400 transition-colors">
                {item.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform ml-2">&#9660;</span>
              </summary>
              <div className="px-4 pb-4 text-sm text-gray-400 leading-relaxed">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mt-10 text-center">
        <p className="text-gray-500 text-sm mb-3">Need help with other aspects of your collection?</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link href="/tools" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-sm text-gray-300 hover:text-white transition-colors">
            All Tools
          </Link>
          <Link href="/tools/insurance-calc" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-sm text-gray-300 hover:text-white transition-colors">
            Insurance Calculator
          </Link>
          <Link href="/guides" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-sm text-gray-300 hover:text-white transition-colors">
            Collector Guides
          </Link>
        </div>
      </div>
    </div>
  );
}