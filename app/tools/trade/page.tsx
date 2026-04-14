import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import TradeEvaluator from './TradeEvaluator';

export const metadata: Metadata = {
  title: 'Trade Evaluator — Is This Card Trade Fair?',
  description: 'Free card trade evaluator for sports cards. Add cards to both sides of a trade and see who\'s getting the better deal. Compare raw and graded values instantly.',
  openGraph: {
    title: 'Trade Evaluator — CardVault',
    description: 'Is that card trade fair? Add cards to both sides and see the value comparison instantly.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Trade Evaluator — CardVault',
    description: 'Compare both sides of a card trade. See who\'s winning.',
  },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Trade Evaluator' },
];

const faqItems = [
  {
    question: 'How do you determine card values for trades?',
    answer: 'We use estimated market values based on recent eBay sold listings and market data. Raw values represent ungraded card prices, while graded values represent gem mint (PSA 10 / BGS 9.5) prices. Always verify with actual recent sales before finalizing any trade.',
  },
  {
    question: 'What makes a fair trade?',
    answer: 'A fair trade is one where both sides are within 10% of each other in total market value. But value isn\'t everything — consider which cards better fit your collection goals, which have more upside potential, and which are harder to find. A "losing" trade on paper can be a win if you\'re getting a card you\'ve been chasing.',
  },
  {
    question: 'Should I always trade for equal value?',
    answer: 'Not necessarily. Trade for what you want to own. If you\'re getting your personal grail card, paying a small premium is worth it. If you\'re trading away a card you don\'t care about, getting 80% of its value in a card you love is a win. Value is one input, not the only input.',
  },
  {
    question: 'How do I trade cards safely?',
    answer: 'For in-person trades, meet at a card shop or public place. For online trades, use a trusted middleman service or trade on platforms with buyer protection (eBay, COMC, Sportlots). Never ship first to an unverified trader. Document everything with photos before and after.',
  },
];

export default function TradePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Trade Evaluator',
        description: 'Free card trade evaluator. Compare both sides of a sports card trade and see who gets the better deal.',
        url: 'https://cardvault-two.vercel.app/tools/trade',
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
        <div className="inline-flex items-center gap-2 bg-blue-950/60 border border-blue-800/50 text-blue-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
          Compare both sides · Raw & graded · Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Trade Evaluator
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Is this trade fair? Add cards to both sides, toggle between raw and graded values, and see who&apos;s getting the better deal.
        </p>
      </div>

      {/* Evaluator */}
      <TradeEvaluator />

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
          <Link href="/tools/compare" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
            Compare Cards
          </Link>
          <Link href="/tools" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
            Price Check
          </Link>
          <Link href="/tools/grading-roi" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
            Grading ROI Calculator
          </Link>
          <Link href="/sports" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
            Sports Cards
          </Link>
        </div>
      </div>
    </div>
  );
}
