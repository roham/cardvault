import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import EbayFeeCalc from './EbayFeeCalc';

export const metadata: Metadata = {
  title: 'eBay Fee Calculator for Card Sellers — Exact Fees, Net Profit, Break-Even',
  description: 'Free eBay fee calculator for sports card and Pokemon card sellers. Calculate exact final value fees, payment processing, promoted listing costs, and net profit. Updated for 2026 eBay fee structure.',
  openGraph: {
    title: 'eBay Fee Calculator for Card Sellers — CardVault',
    description: 'Calculate exact eBay fees and net profit for card sales. Updated 2026 rates. Free.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'eBay Fee Calculator for Card Sellers — CardVault',
    description: 'Know your exact eBay fees and profit before listing. Free calculator.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'eBay Fee Calculator' },
];

const faqItems = [
  {
    question: 'What are the current eBay fees for selling cards?',
    answer: 'As of 2026, eBay charges a final value fee of 13.25% on the total sale amount (item price + shipping) for Sports Trading Cards, up to $7,500 per item. There is also a $0.30 per-order surcharge. If you use promoted listings, add an additional 2-30% ad rate on top. Managed payments processing is included in the final value fee.',
  },
  {
    question: 'How do eBay promoted listings affect my profit?',
    answer: 'Promoted listings (Standard) charge an ad fee only when the item sells. The ad rate is a percentage of the sale price (typically 2-15% depending on category competition). This is in ADDITION to the 13.25% final value fee. A 5% promoted listing on a $100 sale means $5 extra in fees on top of the $13.55 final value fee + $0.30 surcharge.',
  },
  {
    question: 'Should I offer free shipping on card sales?',
    answer: 'eBay considers total sale amount (item + shipping) for fee calculation, so the fees are the same either way. However, free shipping listings tend to get more views and sales because eBay boosts them in search results. Most successful card sellers include free shipping and price it into the item cost.',
  },
  {
    question: 'What is the break-even price for selling a card on eBay?',
    answer: 'To break even, your sale price needs to cover: what you paid for the card + eBay fees (13.25% + $0.30) + shipping cost + packaging materials. Our calculator shows your exact break-even price. For a card you paid $10 for with $1.50 shipping cost, you need to sell for about $13.50 to break even.',
  },
  {
    question: 'Are eBay fees different for auctions vs Buy It Now?',
    answer: 'No. The final value fee rate is the same for auctions and fixed-price (Buy It Now) listings in the Sports Trading Cards category. The only difference is that promoted listings are not available on auction-format listings. Store subscribers may get slightly lower rates on some categories.',
  },
];

export default function EbayFeeCalcPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'eBay Fee Calculator for Card Sellers',
        description: 'Calculate exact eBay fees and net profit for sports card and Pokemon card sales. Updated 2026 rates.',
        url: 'https://cardvault-two.vercel.app/tools/ebay-fee-calc',
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
        <div className="inline-flex items-center gap-2 bg-blue-950/60 border border-blue-800/50 text-blue-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
          2026 Rates &middot; Exact Fees &middot; Net Profit &middot; Break-Even &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          eBay Fee Calculator for Card Sellers
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Know your exact fees and profit before listing. Calculate eBay final value fees, promoted listing costs, shipping, and net profit for any card sale.
        </p>
      </div>

      <EbayFeeCalc />

      {/* FAQ */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-900/60 border border-gray-800 rounded-xl">
              <summary className="cursor-pointer p-4 text-white font-medium hover:text-blue-400 transition-colors list-none flex justify-between items-center">
                {faq.question}
                <span className="text-gray-500 group-open:rotate-45 transition-transform text-xl">+</span>
              </summary>
              <div className="px-4 pb-4 text-gray-400 text-sm leading-relaxed">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Related Tools */}
      <div className="mt-12 bg-gray-900/60 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Related Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { href: '/tools/flip-calc', label: 'Flip Profit Calculator', desc: 'Full flip profit with 7 platform options' },
            { href: '/tools/listing-generator', label: 'eBay Listing Generator', desc: 'Create optimized card listings' },
            { href: '/tools/break-even', label: 'Break-Even Calculator', desc: 'Minimum sell price after all costs' },
            { href: '/tools/selling-platforms', label: 'Platform Comparison', desc: 'Compare eBay, COMC, Mercari fees' },
          ].map(tool => (
            <a key={tool.href} href={tool.href} className="block p-3 bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 rounded-lg transition-colors">
              <div className="text-white text-sm font-medium">{tool.label}</div>
              <div className="text-gray-500 text-xs mt-1">{tool.desc}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
