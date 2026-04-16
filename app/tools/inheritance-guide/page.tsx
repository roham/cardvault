import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import InheritanceGuideClient from './InheritanceGuideClient';

export const metadata: Metadata = {
  title: 'I Inherited a Card Collection — Free Step-by-Step Guide | CardVault',
  description: 'Free guide for inherited sports card collections. Get a personalized action plan: sort, identify valuable cards, get appraisals, decide what to grade, and sell strategically. Covers all eras from pre-war to modern.',
  openGraph: {
    title: 'I Inherited a Card Collection — What Do I Do? | CardVault',
    description: 'Inherited a sports card collection? Get a free personalized plan to sort, evaluate, and handle your inherited cards.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'I Inherited a Card Collection — What Now? | CardVault',
    description: 'Free step-by-step guide for inherited sports card collections. Personalized action plan.',
  },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Inheritance Guide' },
];

const faqItems = [
  {
    question: 'I inherited a sports card collection. Where do I start?',
    answer: 'Start by documenting everything with photos before touching anything. Then sort cards into categories: graded slabs (most valuable), cards in sleeves/top-loaders (probably valuable — the previous owner protected these for a reason), binder pages, loose cards, and sealed product. Look for recognizable player names and any cards marked "RC" (Rookie Card). Use our step-by-step tool above for a personalized plan based on your specific collection.',
  },
  {
    question: 'How do I find out what inherited cards are worth?',
    answer: 'The fastest way is to search each card on eBay and filter by "Sold Items" to see what the same card actually sold for recently. For graded slabs, use the certification number to look up the card on PSA or BGS\'s website. For a quick overall assessment, use our Vintage Card Evaluator or Collection Value Calculator. For collections potentially worth $5,000+, consider hiring a professional appraiser.',
  },
  {
    question: 'Should I sell an inherited card collection or keep it?',
    answer: 'Consider: (1) Do you have any interest in card collecting? If yes, keep the best cards and sell the rest. (2) Do you need the money? Most collections can be sold within 2-4 weeks. (3) Is the collection appreciating? Vintage cards and star rookies tend to increase in value over time. (4) Sentimental value? Keep meaningful cards and sell duplicates. Many people sell the valuable cards and keep a small "memorial" collection.',
  },
  {
    question: 'Do I have to pay taxes on inherited sports cards?',
    answer: 'Inherited collectibles receive a "stepped-up basis" — the IRS considers the cost basis to be the fair market value on the date of death, not the original purchase price. This means if the cards were bought for $100 and are worth $10,000 when inherited, you only pay capital gains on any appreciation AFTER the date of death. Collectibles are taxed at up to 28% federal for long-term gains. Consult a tax professional for large collections.',
  },
  {
    question: 'Where is the best place to sell inherited cards?',
    answer: 'For individual cards worth $50+: eBay (largest audience, 13% fees) or COMC (consignment, handles everything). For bulk collections: local card shops (fast but you\'ll get 30-50% of market value), Facebook card collecting groups, or card shows. For collections worth $10,000+: auction houses like Heritage Auctions, PWCC, or Goldin Auctions. Always get at least 2-3 offers before selling a large collection.',
  },
];

export default function InheritanceGuidePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Collection Inheritance Guide',
        description: 'Free step-by-step guide for inherited sports card collections. Get a personalized action plan based on your collection type, size, era, and goals.',
        url: 'https://cardvault-two.vercel.app/tools/inheritance-guide',
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

      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-purple-950/60 border border-purple-800/50 text-purple-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
          Personalized Plan - Tax Info - Selling Strategy - Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">I Inherited a Card Collection. Now What?</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Answer 4 questions about the collection you inherited and get a personalized step-by-step action plan — what to check first, what might be valuable, and how to sell it.
        </p>
      </div>

      <InheritanceGuideClient />

      {/* FAQ Section */}
      <div className="mt-12 bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((item, i) => (
            <div key={i} className="border-b border-gray-700/50 pb-5 last:border-0 last:pb-0">
              <h3 className="text-white font-semibold mb-2">{item.question}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related Tools */}
      <div className="mt-8 bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Related Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Link href="/tools/vintage-evaluator" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">🏛️</span>
            <div>
              <div className="text-white text-sm font-medium">Vintage Card Evaluator</div>
              <div className="text-gray-500 text-xs">Are my old cards worth anything?</div>
            </div>
          </Link>
          <Link href="/tools/collection-value" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">💰</span>
            <div>
              <div className="text-white text-sm font-medium">Collection Value</div>
              <div className="text-gray-500 text-xs">Estimate total collection worth</div>
            </div>
          </Link>
          <Link href="/tools/condition-grader" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">🏅</span>
            <div>
              <div className="text-white text-sm font-medium">Condition Grader</div>
              <div className="text-gray-500 text-xs">Estimate card grade</div>
            </div>
          </Link>
          <Link href="/tools/grading-roi" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">📊</span>
            <div>
              <div className="text-white text-sm font-medium">Grading ROI</div>
              <div className="text-gray-500 text-xs">Is grading worth the cost?</div>
            </div>
          </Link>
          <Link href="/tools/listing-generator" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">📝</span>
            <div>
              <div className="text-white text-sm font-medium">eBay Listing Generator</div>
              <div className="text-gray-500 text-xs">Create optimized listings</div>
            </div>
          </Link>
          <Link href="/tools/tax-calc" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">🧾</span>
            <div>
              <div className="text-white text-sm font-medium">Card Tax Calculator</div>
              <div className="text-gray-500 text-xs">Capital gains on collectibles</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
