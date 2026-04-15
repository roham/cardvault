import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CollectionSplitClient from './CollectionSplitClient';

export const metadata: Metadata = {
  title: 'Collection Split Calculator — Divide Cards Fairly Between People | CardVault',
  description: 'Split a card collection fairly between 2-4 people. Add cards with values, choose split method (value-balanced, round-robin, or random), and get an instant fair division. Perfect for estate planning, partnership splits, and trade lot breakdowns. Free card collection divider.',
  openGraph: {
    title: 'Collection Split Calculator — CardVault',
    description: 'Divide a card collection fairly. Value-balanced splits for estates, partnerships, and trades.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Collection Split Calculator — CardVault',
    description: 'Split a card collection fairly between 2-4 people. Value-balanced algorithm.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Vault', href: '/vault' },
  { label: 'Collection Split' },
];

const faqItems = [
  {
    question: 'How does the Collection Split Calculator work?',
    answer: 'Add your cards with their estimated values, then choose how many people (2-4) are splitting the collection. The calculator uses a value-balanced algorithm that assigns cards to each person one at a time, always giving the next highest-value card to the person with the lowest total. This produces the fairest possible split based on monetary value. You can also use round-robin (alternating picks) or random assignment.',
  },
  {
    question: 'What is the value-balanced split method?',
    answer: 'Value-balanced splitting uses a greedy algorithm: cards are sorted by value from highest to lowest, then each card is assigned to the person with the current lowest total value. This minimizes the difference between the highest and lowest share. For example, if splitting 4 cards worth $100, $80, $60, $40 between 2 people, Person A gets $100 + $60 = $160 and Person B gets $80 + $40 = $120, for a $40 difference — the smallest possible gap.',
  },
  {
    question: 'When would I use this calculator?',
    answer: 'Common scenarios include: (1) Estate planning — dividing a parent\'s card collection among children, (2) Partnership dissolution — splitting a joint collection between business partners, (3) Trade lot breakdown — breaking a bulk purchase into fair groups, (4) Gift splitting — dividing a large gift set among recipients, (5) Charity lots — creating equal-value lots for auction.',
  },
  {
    question: 'Can I import cards from my vault?',
    answer: 'Yes. If you have cards in your CardVault vault, clicking "Import from Vault" will pull in your saved cards with their estimated values. You can also manually add cards by typing a name and value. The calculator supports up to 100 cards per split.',
  },
  {
    question: 'What if the split cannot be perfectly equal?',
    answer: 'Most splits won\'t be perfectly equal — that\'s normal. The calculator shows each person\'s total value, the difference from the average, and a fairness score (percentage of how close the split is to perfect equality). A fairness score above 90% is considered excellent. If the difference is too large, consider adding a cash equalizer — the calculator shows how much cash each person should pay or receive to make the split perfectly fair.',
  },
];

export default function CollectionSplitPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Collection Split Calculator',
        description: 'Divide a card collection fairly between 2-4 people using value-balanced, round-robin, or random split methods.',
        url: 'https://cardvault-two.vercel.app/vault/split',
        applicationCategory: 'FinanceApplication',
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
        <div className="inline-flex items-center gap-2 bg-teal-950/60 border border-teal-800/50 text-teal-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          2-4 People &middot; Value-Balanced &middot; Cash Equalizer
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Collection Split Calculator</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Divide a card collection fairly between 2-4 people. Add your cards, choose a split method,
          and get an instant fair division with cash equalization.
        </p>
      </div>

      <CollectionSplitClient />

      {/* FAQ */}
      <section className="mt-16 mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((f, i) => (
            <details key={i} className="group bg-gray-800/50 border border-gray-700 rounded-xl">
              <summary className="cursor-pointer px-6 py-4 text-white font-medium list-none flex items-center justify-between">
                {f.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform">&#9662;</span>
              </summary>
              <div className="px-6 pb-4 text-gray-400 text-sm leading-relaxed">{f.answer}</div>
            </details>
          ))}
        </div>
      </section>

      {/* Related */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-white mb-4">Related</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/vault', label: 'My Vault', icon: '🏦' },
            { href: '/vault/analytics', label: 'Vault Analytics', icon: '📊' },
            { href: '/vault/bulk-sale', label: 'Bulk Sale Calculator', icon: '💰' },
            { href: '/tools/collection-value', label: 'Collection Value', icon: '💎' },
            { href: '/vault/insurance', label: 'Insurance Estimator', icon: '🛡️' },
            { href: '/tools/tax-calc', label: 'Card Tax Calculator', icon: '🧾' },
          ].map(t => (
            <Link
              key={t.href}
              href={t.href}
              className="flex items-center gap-2 px-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-xl text-sm text-gray-300 hover:text-white transition-colors"
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
