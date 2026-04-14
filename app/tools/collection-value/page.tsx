import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CollectionValueClient from './CollectionValueClient';

export const metadata: Metadata = {
  title: 'Collection Value Calculator — What Is Your Card Collection Worth?',
  description: 'Free collection value calculator. Search for sports cards, add them to your collection, and see the total estimated value instantly. Track raw and graded values.',
  openGraph: {
    title: 'Collection Value Calculator — CardVault',
    description: 'Find out what your card collection is worth. Add cards, see values, track your portfolio.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Collection Value Calculator — CardVault',
    description: 'Find out what your card collection is worth.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Collection Value Calculator' },
];

const faqItems = [
  {
    question: 'How accurate are the card values?',
    answer: 'Values are estimated ranges based on recent eBay sold listings, Heritage Auctions, and Goldin data as of April 2026. Actual market prices fluctuate daily based on condition, centering, and demand. Use these as reference points, not guarantees.',
  },
  {
    question: 'What does raw vs gem mint value mean?',
    answer: 'Raw value is what an ungraded card in typical condition sells for. Gem mint value is what a professionally graded card in top condition (PSA 10, BGS 9.5+) sells for. Most collections contain raw cards, so the raw total is usually more realistic.',
  },
  {
    question: 'Can I save my collection?',
    answer: 'Your collection is saved in your browser automatically. You can also share it via a URL — click the Share button to generate a shareable link that anyone can view.',
  },
  {
    question: 'How do I track my card collection value over time?',
    answer: 'Bookmark this page after adding your cards. Values update as our price data refreshes. For more detailed tracking with price history charts, check out our Fantasy Card Portfolio tool.',
  },
];

export default function CollectionValuePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Collection Value Calculator',
        description: 'Free collection value calculator for sports cards. Search, add cards, and see total estimated value.',
        url: 'https://cardvault-two.vercel.app/tools/collection-value',
        applicationCategory: 'FinanceApplication',
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

      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Free Collection Tracker
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Collection Value Calculator
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          What is your card collection worth? Search for cards, add them to your collection, and see the total estimated value — raw and graded.
        </p>
      </div>

      <CollectionValueClient />

      {/* FAQ */}
      <div className="mt-16 border-t border-gray-800 pt-10">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((item, i) => (
            <div key={i}>
              <h3 className="text-white font-semibold mb-2">{item.question}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
