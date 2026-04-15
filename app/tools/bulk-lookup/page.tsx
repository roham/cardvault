import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import BulkLookupClient from './BulkLookupClient';
import { sportsCards } from '@/data/sports-cards';

export const metadata: Metadata = {
  title: 'Bulk Card Lookup — Instant Price Check for Multiple Cards',
  description: 'Paste a list of sports cards and get estimated values for all of them instantly. Perfect for card shows, buy lists, and collection inventory. Search 5,000+ cards at once.',
  openGraph: {
    title: 'Bulk Card Lookup — Instant Multi-Card Price Check — CardVault',
    description: 'Paste your card list, get prices for all of them instantly. 5,000+ sports cards.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Bulk Card Lookup — CardVault',
    description: 'Paste a card list, get instant price estimates. Built for card shows.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Bulk Card Lookup' },
];

const faqItems = [
  {
    question: 'How does Bulk Card Lookup work?',
    answer: 'Paste a list of cards (one per line) in any format — player name, card name, or "year player set". The tool fuzzy-matches each line against CardVault\'s database of 5,000+ sports cards and returns estimated raw and graded values. Unmatched lines are flagged so you can refine them.',
  },
  {
    question: 'What card formats are supported?',
    answer: 'You can paste cards in almost any format: "Mickey Mantle 1952 Topps", "2024 Prizm Jayden Daniels", just "Ohtani", or even eBay-style titles. The search is fuzzy — it finds the best match for each line. You can also paste CSV data from spreadsheets.',
  },
  {
    question: 'How accurate are the estimated values?',
    answer: 'Values are based on recent eBay sold listings and market data. Raw values represent typical selling prices for average-condition cards. PSA 10/Gem Mint values are for top-graded examples. Values are estimates — actual prices vary by condition, market timing, and buyer/seller dynamics.',
  },
  {
    question: 'Can I export the results?',
    answer: 'Yes. After looking up your cards, you can copy all results to clipboard in a tab-separated format that pastes directly into Excel or Google Sheets. You can also download as CSV. Results include card name, raw value, gem value, and match confidence.',
  },
];

export default function BulkLookupPage() {
  const cardData = sportsCards.map(c => ({
    slug: c.slug,
    name: c.name,
    player: c.player,
    sport: c.sport,
    year: c.year,
    set: c.set,
    estimatedValueRaw: c.estimatedValueRaw,
    estimatedValueGem: c.estimatedValueGem,
  }));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Bulk Card Lookup — Multi-Card Price Check',
        description: 'Paste a list of sports cards and get estimated values instantly. Search 5,000+ cards.',
        url: 'https://cardvault-two.vercel.app/tools/bulk-lookup',
        applicationCategory: 'UtilitiesApplication',
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

      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-cyan-950/60 border border-cyan-800/50 text-cyan-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
          5,000+ cards searchable
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Bulk Card Lookup</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Paste a list of cards, get instant price estimates. Perfect for card shows, buy lists, and inventory checks.
        </p>
      </div>

      {/* How it works */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
          <div className="text-lg mb-1">&#128203;</div>
          <p className="text-white text-sm font-medium">Paste</p>
          <p className="text-gray-500 text-xs">One card per line</p>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
          <div className="text-lg mb-1">&#128269;</div>
          <p className="text-white text-sm font-medium">Match</p>
          <p className="text-gray-500 text-xs">Fuzzy search</p>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
          <div className="text-lg mb-1">&#128176;</div>
          <p className="text-white text-sm font-medium">Price</p>
          <p className="text-gray-500 text-xs">Raw + graded</p>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
          <div className="text-lg mb-1">&#128190;</div>
          <p className="text-white text-sm font-medium">Export</p>
          <p className="text-gray-500 text-xs">Copy or CSV</p>
        </div>
      </div>

      {/* Tool */}
      <BulkLookupClient cards={cardData} />

      {/* FAQ */}
      <div className="mt-12 space-y-4">
        <h2 className="text-xl font-bold text-white">Frequently Asked Questions</h2>
        {faqItems.map((f, i) => (
          <details key={i} className="bg-gray-900/40 border border-gray-800 rounded-xl p-4 group">
            <summary className="text-white font-medium cursor-pointer list-none flex items-center justify-between">
              {f.question}
              <span className="text-gray-500 group-open:rotate-180 transition-transform">&#9660;</span>
            </summary>
            <p className="text-gray-400 text-sm mt-3 leading-relaxed">{f.answer}</p>
          </details>
        ))}
      </div>

      {/* Bottom links */}
      <div className="mt-12 p-5 bg-gray-900/40 border border-gray-800 rounded-2xl">
        <h3 className="text-white font-semibold text-sm mb-3">Related Tools</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Link href="/tools/identify" className="text-blue-400 hover:text-blue-300 text-sm py-1.5 px-3 bg-gray-900/60 border border-gray-800 rounded-lg text-center transition-colors">Card Identifier</Link>
          <Link href="/tools/collection-value" className="text-blue-400 hover:text-blue-300 text-sm py-1.5 px-3 bg-gray-900/60 border border-gray-800 rounded-lg text-center transition-colors">Collection Value</Link>
          <Link href="/tools/flip-calc" className="text-blue-400 hover:text-blue-300 text-sm py-1.5 px-3 bg-gray-900/60 border border-gray-800 rounded-lg text-center transition-colors">Flip Calculator</Link>
          <Link href="/tools/export-collection" className="text-blue-400 hover:text-blue-300 text-sm py-1.5 px-3 bg-gray-900/60 border border-gray-800 rounded-lg text-center transition-colors">Export Collection</Link>
        </div>
      </div>
    </div>
  );
}
