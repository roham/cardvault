import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import EstatePlannerClient from './EstatePlannerClient';

export const metadata: Metadata = {
  title: 'Collection Estate Planner — Protect Your Card Collection Legacy | CardVault',
  description: 'Plan what happens to your sports card collection. Assign beneficiaries, understand tax implications, generate heir instructions, and create a printable estate document. Free tool for collectors.',
  openGraph: {
    title: 'Collection Estate Planner — CardVault',
    description: 'Protect your card collection legacy. Assign beneficiaries, understand taxes, and create heir instructions.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Collection Estate Planner — CardVault',
    description: 'Free estate planning tool for card collectors. Protect your collection legacy.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Estate Planner' },
];

const faqItems = [
  {
    question: 'What happens to a sports card collection when someone passes away?',
    answer: 'A sports card collection is considered personal property and passes to heirs through probate or a will. If no will exists, state intestacy laws determine who inherits. The collection receives a "stepped-up" cost basis equal to the fair market value at the date of death, which means heirs who sell won\'t owe capital gains on appreciation during the original owner\'s lifetime. Without proper documentation, heirs may unknowingly sell valuable cards below market value or damage them through improper storage.',
  },
  {
    question: 'Do I need to pay taxes on an inherited card collection?',
    answer: 'Inheriting the collection itself is generally not a taxable event. However, if the total estate exceeds the federal exemption ($13.61 million in 2024 for individuals), estate tax may apply. When heirs sell inherited cards, they only pay capital gains on appreciation AFTER the date of death (thanks to stepped-up basis). For example, if a card was worth $5,000 at inheritance and you sell for $6,000, you owe tax on $1,000 — not on what the original owner paid. State inheritance taxes vary.',
  },
  {
    question: 'How should I document my card collection for estate planning?',
    answer: 'Create an inventory with: (1) photos or scans of high-value cards, (2) estimated values with dates, (3) grading company and cert numbers for graded cards, (4) purchase prices and dates if available, (5) storage locations. Update this annually. Keep one copy with your will/trust and another in a secure location your executor knows about. For collections worth $50,000+, consider a professional appraisal for insurance and estate tax purposes.',
  },
  {
    question: 'Should I sell my collection before I pass or leave it to heirs?',
    answer: 'For most collectors, leaving the collection to heirs is more tax-efficient because of the stepped-up cost basis. If you bought a card for $100 and it\'s now worth $10,000: selling it yourself triggers $9,900 in capital gains (taxed at 28% for collectibles). If heirs inherit it, their cost basis resets to $10,000 — zero tax if they sell at that price. The exception: if the total estate might trigger estate tax (over $13.61M), strategically selling some assets before death could reduce the taxable estate.',
  },
  {
    question: 'What instructions should I leave for heirs who don\'t collect cards?',
    answer: 'Leave clear instructions covering: (1) Do NOT throw anything away — even common-looking cards can be valuable. (2) Keep cards in their current storage (don\'t remove from sleeves, top loaders, or slabs). (3) Contact list of trusted dealers, auction houses, or collectors who can appraise. (4) Which cards are most valuable and roughly what they\'re worth. (5) Where to sell (Heritage Auctions, Goldin, PWCC for high-value; eBay for mid-range; local card shops for bulk). (6) Red flags when selling (avoid anyone offering a single price for the whole collection without itemizing).',
  },
];

export default function EstatePlannerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Collection Estate Planner',
        description: 'Plan what happens to your sports card collection. Assign beneficiaries, understand tax implications, and create heir instructions.',
        url: 'https://cardvault-two.vercel.app/tools/estate-planner',
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
        <div className="inline-flex items-center gap-2 bg-amber-950/60 border border-amber-800/50 text-amber-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
          Estate Planning for Collectors
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Collection Estate Planner
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Protect your card collection legacy. Document your collection, assign beneficiaries, understand tax implications, and generate instructions for your heirs.
        </p>
      </div>

      <EstatePlannerClient />

      {/* FAQ */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((f, i) => (
            <details key={i} className="group bg-gray-900/50 border border-gray-800 rounded-xl">
              <summary className="flex items-center justify-between cursor-pointer px-6 py-4 text-white font-medium">
                {f.question}
                <span className="ml-2 text-gray-500 group-open:rotate-180 transition-transform">&#9662;</span>
              </summary>
              <div className="px-6 pb-4 text-gray-400 text-sm leading-relaxed">
                {f.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Related Tools */}
      <section className="mt-12 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Related Tools</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/tools/insurance-calc', label: 'Insurance Calculator', icon: '🛡️' },
            { href: '/tools/collection-value', label: 'Collection Value', icon: '💎' },
            { href: '/tools/appraisal-report', label: 'Appraisal Report', icon: '📋' },
            { href: '/tools/tax-calc', label: 'Tax Calculator', icon: '🧾' },
            { href: '/tools/export-collection', label: 'Export Collection', icon: '📥' },
            { href: '/vault', label: 'My Vault', icon: '🏦' },
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
