import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import StorageGuideClient from './StorageGuideClient';

export const metadata: Metadata = {
  title: 'Card Storage & Protection Guide — How to Store Sports Cards Safely | CardVault',
  description: 'Complete guide to storing and protecting sports cards. Penny sleeves, top loaders, one-touch magnetics, graded card cases, binder pages, storage boxes, climate control, and display options. Interactive supply checklist with cost calculator.',
  openGraph: {
    title: 'Card Storage & Protection Guide — CardVault',
    description: 'Everything you need to protect your card collection. 40+ products across 6 categories with cost calculator.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Storage & Protection Guide — CardVault',
    description: '40+ storage products. 6 categories. Interactive supply checklist with cost calculator.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Guides', href: '/guides' },
  { label: 'Card Storage & Protection' },
];

const faqItems = [
  {
    question: 'What is the best way to store sports cards?',
    answer: 'The gold standard is a penny sleeve inside a top loader, stored upright in a card storage box in a cool, dry location. For valuable cards ($50+), use semi-rigid holders or one-touch magnetic cases. For graded slabs, use slab storage boxes or display cases. Always store cards away from direct sunlight, heat, and humidity.',
  },
  {
    question: 'Do penny sleeves damage cards?',
    answer: 'No — modern penny sleeves are acid-free and archival-safe. They actually protect cards from scratches, dust, and fingerprints. Always sleeve cards before putting them in top loaders or binder pages. Avoid old, non-acid-free sleeves which can yellow and stick to card surfaces over time.',
  },
  {
    question: 'How much does it cost to properly store a card collection?',
    answer: 'Basic protection costs about $0.03-$0.05 per card (penny sleeve + top loader). A 500-card collection costs roughly $15-$25 to properly store. Premium options like one-touch magnetics ($3-$8 each) are reserved for high-value cards. Starter supply kits covering 200-500 cards cost $30-$60.',
  },
  {
    question: 'Should I put all my cards in top loaders?',
    answer: 'No — top loaders are best for cards worth $5+. For bulk commons and base cards, penny sleeves in a card storage box or 9-pocket binder pages are more practical and cost-effective. Use the "value threshold" approach: commons in sleeves, $5+ in top loaders, $50+ in one-touch magnetics, $200+ consider grading.',
  },
  {
    question: 'What temperature and humidity should I store cards at?',
    answer: 'Ideal conditions are 65-72°F (18-22°C) with 40-50% relative humidity. Avoid attics (heat), basements (moisture), and garages (temperature swings). Use a dehumidifier if your storage area exceeds 60% humidity. Silica gel packets inside storage boxes provide extra moisture protection.',
  },
];

export default function CardStorageGuidePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Storage & Protection Guide',
        description: 'Interactive guide to storing and protecting sports cards. 40+ products, 6 categories, supply checklist with cost calculator.',
        applicationCategory: 'ReferenceApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        url: 'https://cardvault-two.vercel.app/card-storage-guide',
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
        <div className="inline-flex items-center gap-2 bg-teal-950/60 border border-teal-800/50 text-teal-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
          40+ Products · 6 Categories · Interactive Checklist
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Card Storage & Protection Guide
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Everything you need to protect your card collection — from penny sleeves to climate control.
          Interactive supply checklist with cost calculator.
        </p>
      </div>

      {/* Client component */}
      <StorageGuideClient />

      {/* FAQ Section */}
      <section className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group border border-gray-800 rounded-lg">
              <summary className="flex items-center justify-between cursor-pointer px-4 py-3 text-white font-medium hover:bg-gray-900/50 rounded-lg">
                {faq.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform ml-2">&#9660;</span>
              </summary>
              <div className="px-4 pb-4 text-gray-400 text-sm leading-relaxed">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Related Links */}
      <section className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Related Resources</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { href: '/vault/display-case', label: 'Display Case Builder', desc: 'Plan your slab display layout' },
            { href: '/vault/insurance', label: 'Collection Insurance', desc: 'Estimate insurance costs' },
            { href: '/collecting-roadmap', label: 'Collecting Roadmap', desc: '6-stage learning path' },
            { href: '/card-encyclopedia', label: 'Encyclopedia', desc: '120+ collecting terms' },
            { href: '/collecting-mistakes', label: '20 Mistakes Guide', desc: 'Avoid costly errors' },
            { href: '/tools/collection-health', label: 'Collection Health', desc: 'Score your collection' },
          ].map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="flex flex-col gap-1 p-3 rounded-lg border border-gray-800 hover:border-teal-700/50 hover:bg-teal-950/20 transition-colors"
            >
              <span className="text-white text-sm font-medium">{link.label}</span>
              <span className="text-gray-500 text-xs">{link.desc}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
