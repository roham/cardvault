import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import FlipCalculator from './FlipCalculator';

export const metadata: Metadata = {
  title: 'Flip Profit Calculator — Know Your Margins Before You Sell',
  description: 'Free card flipping profit calculator. Enter buy price, sell price, and platform to see exact fees, net profit, and ROI. Supports eBay, COMC, Mercari, MySlabs, and direct sales. Batch tracker included.',
  openGraph: {
    title: 'Flip Profit Calculator — CardVault',
    description: 'Calculate exact profit after eBay fees, shipping, and grading costs. Compare platforms. Track multiple flips.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Flip Profit Calculator — CardVault',
    description: 'Know your margins before you sell. Free flip profit calculator with fee breakdown.',
  },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Flip Profit Calculator' },
];

const faqItems = [
  {
    question: 'What are eBay fees for selling sports cards?',
    answer: 'eBay charges a 13.25% final value fee on the total sale amount (including shipping paid by buyer) plus $0.30 per order. There is no separate PayPal fee since eBay uses managed payments. If you use Promoted Listings Standard, add another 2-5% ad rate on top. On a $100 card, expect ~$13.55 in eBay fees before shipping costs.',
  },
  {
    question: 'What is a good ROI for card flipping?',
    answer: 'Most experienced flippers target at least 30-50% ROI after all fees and shipping. Below 20% ROI, the profit rarely justifies the time spent listing, shipping, and handling buyer questions. For high-volume flippers doing 50+ sales per month, even 15-20% ROI can work due to volume. For casual sellers, aim for 50%+ per flip.',
  },
  {
    question: 'How much does it cost to ship a sports card?',
    answer: 'PWE (plain white envelope) with a top-loader costs about $1.50 with a stamp. Bubble mailer with tracking via USPS First Class costs $4-$5. Small box with tracking for graded slabs costs $7-$10. For cards over $100, add insurance. Always use top-loaders and penny sleeves to protect cards during shipping.',
  },
  {
    question: 'Which platform has the lowest fees for selling cards?',
    answer: 'For zero fees, sell direct via Facebook Marketplace, card shows, or local meetups. COMC charges 5% + 2.5% processing. MySlabs charges 9%. Mercari charges 10%. eBay charges 13.25% + $0.30 but has the largest buyer pool. The best platform depends on your card value, volume, and how quickly you need to sell.',
  },
  {
    question: 'Do I have to pay taxes on card flipping profits?',
    answer: 'In the US, profit from selling sports cards is taxable income. If you sell more than $600 on platforms like eBay or Mercari, they report your sales to the IRS via 1099-K. You can deduct your cost basis (what you paid for the card), shipping supplies, grading fees, and other business expenses. Keep detailed records of every purchase and sale.',
  },
];

export default function FlipCalcPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Flip Profit Calculator',
        description: 'Free card flipping profit calculator with platform fee comparison, batch tracking, and ROI analysis.',
        url: 'https://cardvault-two.vercel.app/tools/flip-calc',
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
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Fee Calculator - Platform Comparison - Batch Tracker - Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Flip Profit Calculator</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Know exactly what you keep after fees. Enter your buy price, sell price, and platform to see net profit, ROI, and a full fee breakdown. Compare all platforms side-by-side.
        </p>
      </div>

      <FlipCalculator />

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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link href="/tools/grading-roi" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">💰</span>
            <div>
              <div className="text-white text-sm font-medium">Grading ROI Calculator</div>
              <div className="text-gray-500 text-xs">Is it worth grading before selling?</div>
            </div>
          </Link>
          <Link href="/tools/collection-value" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">💎</span>
            <div>
              <div className="text-white text-sm font-medium">Collection Value</div>
              <div className="text-gray-500 text-xs">What is your whole collection worth?</div>
            </div>
          </Link>
          <Link href="/tools/watchlist" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">👀</span>
            <div>
              <div className="text-white text-sm font-medium">Price Watchlist</div>
              <div className="text-gray-500 text-xs">Track price movements on cards you own</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
