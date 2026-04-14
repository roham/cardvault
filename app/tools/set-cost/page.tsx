import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import SetCostEstimator from './SetCostEstimator';

export const metadata: Metadata = {
  title: 'Set Completion Cost Estimator — How Much to Complete a Set?',
  description: 'Free set completion cost estimator for sports cards. Pick a set, see the full checklist with prices, and find out how much it costs to complete. 230+ sets across baseball, basketball, football, and hockey.',
  openGraph: {
    title: 'Set Completion Cost Estimator — CardVault',
    description: 'How much does it cost to complete a card set? Browse 230+ sets with pricing for every card.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Set Completion Cost Estimator — CardVault',
    description: 'Calculate the cost to complete any sports card set. Full checklists with pricing.',
  },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Set Completion Cost' },
];

const faqItems = [
  {
    question: 'How much does it cost to complete a card set?',
    answer: 'It varies enormously by set. A modern base set like 2025 Topps Series 1 can be completed for under $100 if you buy commons in bulk. A vintage set like 1952 Topps would cost millions for a complete run in high grade. Our estimator shows the cost for the key cards we track in each set.',
  },
  {
    question: 'What\'s the cheapest way to complete a set?',
    answer: 'Buy a hobby box first to get a big chunk of base cards, then buy the remaining singles individually. For commons, buy lots on eBay ("complete your set" listings). Only buy stars and rookies as individual singles. This is much cheaper than buying more sealed product.',
  },
  {
    question: 'Should I build vintage or modern sets?',
    answer: 'Modern sets (2010+) are much cheaper and easier to complete — most base cards are under $1. Vintage sets (pre-1980) are expensive but rewarding — each card has history and scarcity. Start with a modern set to learn the process, then tackle vintage when you\'re ready for the investment.',
  },
];

export default function SetCostPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Set Completion Cost Estimator',
        description: 'Estimate the cost to complete any sports card set. Browse sets with full checklists and pricing.',
        url: 'https://cardvault-two.vercel.app/tools/set-cost',
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

      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-rose-950/60 border border-rose-800/50 text-rose-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse" />
          230+ sets · Full checklists · Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Set Completion Cost Estimator
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          How much does it cost to complete a card set? Pick a set, see the full checklist with estimated prices, and plan your build.
        </p>
      </div>

      {/* Estimator */}
      <SetCostEstimator />

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
          <Link href="/sports/sets" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
            Browse All Sets
          </Link>
          <Link href="/tools" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
            Price Check
          </Link>
          <Link href="/tools/compare" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
            Compare Cards
          </Link>
          <Link href="/tools/sealed-ev" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
            Sealed Product EV
          </Link>
        </div>
      </div>
    </div>
  );
}
