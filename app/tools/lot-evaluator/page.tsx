import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import LotEvaluatorClient from './LotEvaluatorClient';

export const metadata: Metadata = {
  title: 'Card Lot Evaluator — Is That Bulk Lot Worth It? | CardVault',
  description: 'Evaluate any sports card lot before you buy. Add cards from our database of 6,600+ cards or enter manually, set the asking price, and get an instant verdict on whether the lot is a deal. Works for card show lots, eBay bulk listings, and estate sales.',
  openGraph: {
    title: 'Card Lot Evaluator — CardVault',
    description: 'Is that card lot worth the asking price? Add cards, enter the price, get a verdict instantly.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Lot Evaluator — CardVault',
    description: 'Free tool to evaluate bulk sports card lots. Know if you\'re getting a deal before you buy.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Lot Evaluator' },
];

const faqItems = [
  {
    question: 'How do I evaluate a card lot?',
    answer: 'Add the individual cards in the lot using our database search (6,600+ cards with estimated values) or manual entry for cards not in our database. Then enter the seller\'s asking price. The tool instantly calculates the total estimated value and tells you if the lot is a Great Deal, Good Value, Fair Price, or Bad Deal based on the ratio of asking price to estimated value.',
  },
  {
    question: 'What is a good price for a card lot?',
    answer: 'A good card lot purchase typically prices at 50-70% of the total estimated individual card values. This accounts for the convenience premium the seller gets from selling in bulk rather than listing cards individually. At card shows, most dealers expect to negotiate and will accept 60-70% of their asking price. Online lots should be priced at 50-60% of individual values to account for shipping costs.',
  },
  {
    question: 'How are card values estimated?',
    answer: 'Cards from our database use estimated market values based on recent eBay sold listings and market data for raw (ungraded) condition. For manually entered cards, you provide your own value estimate. Always cross-reference values with recent eBay sold listings (not active listings) for the most accurate pricing. Remember that condition significantly affects value — assume lot cards are EX condition or lower unless described otherwise.',
  },
  {
    question: 'Should I buy card lots at card shows?',
    answer: 'Card show lots can be excellent deals if you know what to look for. Focus on lots where 1-2 key cards cover at least 50% of the asking price — everything else is bonus value. Always inspect cards for condition before buying. Bring your phone to check eBay sold prices in real time. Negotiate — most show dealers price lots expecting a 20-30% discount. Arrive early for the best selection or late in the day when dealers want to reduce inventory.',
  },
  {
    question: 'How do I evaluate eBay card lots?',
    answer: 'For eBay lots, add shipping costs to the asking price before evaluating. Many lots show only the front of key cards — assume the backs have flaws. Check the seller\'s feedback and return policy. Look at the photos carefully for off-center cards, dinged corners, or surface issues. A lot that looks like a "great deal" at $50 + $12 shipping might not be worth $62 when you factor in that the cards are likely EX condition, not NM.',
  },
];

export default function LotEvaluatorPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Lot Evaluator',
        description: 'Evaluate bulk sports card lots. Add cards, enter the asking price, and get an instant verdict on deal quality.',
        url: 'https://cardvault-two.vercel.app/tools/lot-evaluator',
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
        <div className="inline-flex items-center gap-2 bg-orange-950/60 border border-orange-800/50 text-orange-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
          Lot Analysis &middot; Deal Verdict &middot; Card Show Ready
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Lot Evaluator</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Is that bulk lot worth the asking price? Add the cards, enter the price,
          and get an instant verdict before you buy.
        </p>
      </div>

      <LotEvaluatorClient />

      {/* FAQ */}
      <div className="mt-12 border-t border-gray-800 pt-10">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <details key={i} className="group bg-gray-900/60 border border-gray-800 rounded-lg">
              <summary className="flex items-center justify-between cursor-pointer px-5 py-4 text-white font-medium">
                {item.question}
                <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-5 pb-4 text-gray-400 text-sm leading-relaxed">{item.answer}</div>
            </details>
          ))}
        </div>
      </div>

      <div className="mt-10 flex flex-wrap gap-3 text-sm">
        <Link href="/tools/flip-calc" className="text-emerald-400 hover:underline">Flip Profit Calculator</Link>
        <span className="text-gray-600">&middot;</span>
        <Link href="/tools/value-dna" className="text-emerald-400 hover:underline">Card Value DNA</Link>
        <span className="text-gray-600">&middot;</span>
        <Link href="/tools/investment-calc" className="text-emerald-400 hover:underline">Investment Calculator</Link>
        <span className="text-gray-600">&middot;</span>
        <Link href="/tools/listing-generator" className="text-emerald-400 hover:underline">eBay Listing Generator</Link>
        <span className="text-gray-600">&middot;</span>
        <Link href="/tools" className="text-emerald-400 hover:underline">All Tools</Link>
      </div>
    </div>
  );
}
