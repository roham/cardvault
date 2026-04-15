import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import TaxCalculator from './TaxCalculator';

export const metadata: Metadata = {
  title: 'Card Tax Calculator — Capital Gains on Sports Card Sales',
  description: 'Free card tax calculator for sports card flippers and collectors. Enter buy/sell price, holding period, and income bracket to see federal + state capital gains tax owed, net profit after tax, and effective tax rate.',
  openGraph: {
    title: 'Card Tax Calculator — CardVault',
    description: 'Calculate capital gains tax on card sales. Short-term vs long-term rates, state taxes, net profit after tax.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Tax Calculator — CardVault',
    description: 'Free capital gains tax calculator for card flippers. Federal + state rates, net profit.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Card Tax Calculator' },
];

const faqItems = [
  {
    question: 'Do I have to pay taxes on sports card sales?',
    answer: 'Yes. The IRS considers sports cards and collectibles as capital assets. Profits from selling cards are subject to capital gains tax. If you held the card for less than 1 year, you pay short-term capital gains (taxed as ordinary income at your bracket). If held for more than 1 year, you pay the collectibles long-term rate of 28% (higher than the 15-20% rate for stocks).',
  },
  {
    question: 'What is the collectibles tax rate?',
    answer: 'Long-term capital gains on collectibles (including sports cards, Pokemon cards, coins, art, and stamps) are taxed at a maximum rate of 28% at the federal level. This is higher than the 15-20% rate for stocks and real estate. If your ordinary income tax bracket is below 28%, you pay at your ordinary rate instead.',
  },
  {
    question: 'Do I need to report card sales under $600?',
    answer: 'Technically, all capital gains must be reported to the IRS regardless of amount. However, platforms like eBay only issue a 1099-K if your total sales exceed $5,000 (for 2024, dropping to $2,500 in 2025). Even without a 1099, the IRS expects you to report all gains. Many casual sellers fly under the radar, but it is not legally compliant.',
  },
  {
    question: 'Can I deduct losses on card sales?',
    answer: 'Yes. Capital losses on collectible sales can offset capital gains. If your losses exceed gains, you can deduct up to $3,000 against ordinary income per year. Excess losses carry forward to future years. Keep records of every purchase and sale for tax purposes.',
  },
  {
    question: 'What expenses can I deduct from card flipping profits?',
    answer: 'You can deduct: eBay/platform selling fees, shipping costs, grading fees (PSA/BGS/CGC), supplies (top-loaders, penny sleeves, mailers), card show admission, mileage to card shows, and storage costs. If card flipping is your business, you may also deduct a home office. Keep all receipts.',
  },
];

export default function TaxCalcPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Tax Calculator — Capital Gains on Collectible Sales',
        description: 'Calculate federal and state capital gains tax on sports card and collectible sales. Short-term vs long-term rates, deductions, net profit.',
        url: 'https://cardvault-two.vercel.app/tools/tax-calc',
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

      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-green-950/60 border border-green-800/50 text-green-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          2024/2025 tax rates
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Tax Calculator</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Calculate capital gains tax on your card sales. Federal + state rates, short-term vs long-term, deductible expenses, and net profit after tax.
        </p>
      </div>

      {/* Calculator */}
      <TaxCalculator />

      {/* Tax Tips */}
      <div className="mt-12 p-6 bg-gray-900/40 border border-gray-800 rounded-2xl">
        <h2 className="text-white font-bold text-lg mb-4">Tax Tips for Card Collectors</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { title: 'Hold for 1+ year when possible', desc: 'Long-term collectibles rate (max 28%) is often lower than short-term (up to 37%).' },
            { title: 'Track EVERY purchase', desc: 'Your cost basis reduces your taxable gain. No receipt = no deduction.' },
            { title: 'Deduct platform fees', desc: 'eBay fees, shipping costs, grading fees, and supplies are all deductible against gains.' },
            { title: 'Harvest losses', desc: 'Sell losing cards in December to offset gains. Up to $3,000 in net losses deducts from income.' },
            { title: 'Consider a business entity', desc: 'High-volume flippers (50+ sales/month) may benefit from filing as a business for additional deductions.' },
            { title: 'Consult a CPA', desc: 'This calculator provides estimates. A tax professional can optimize your specific situation.' },
          ].map(tip => (
            <div key={tip.title} className="p-3 bg-gray-800/40 border border-gray-700/50 rounded-xl">
              <h3 className="text-white text-sm font-medium mb-1">{tip.title}</h3>
              <p className="text-gray-500 text-xs">{tip.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-12">
        <h2 className="text-white font-bold text-lg mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map(f => (
            <details key={f.question} className="group bg-gray-900/40 border border-gray-800 rounded-xl">
              <summary className="p-4 cursor-pointer text-white font-medium text-sm flex items-center justify-between">
                {f.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform">&#9660;</span>
              </summary>
              <p className="px-4 pb-4 text-gray-400 text-sm leading-relaxed">{f.answer}</p>
            </details>
          ))}
        </div>
      </div>

      {/* Related Tools */}
      <div className="mt-12 p-5 bg-gray-900/40 border border-gray-800 rounded-2xl">
        <h3 className="text-white font-semibold text-sm mb-3">Related Tools</h3>
        <div className="flex flex-wrap gap-2">
          {[
            { href: '/tools/flip-calc', label: 'Flip Profit Calculator' },
            { href: '/tools/investment-calc', label: 'Investment Calculator' },
            { href: '/tools/grading-roi', label: 'Grading ROI Calculator' },
            { href: '/tools/insurance-calc', label: 'Insurance Calculator' },
            { href: '/tools/listing-generator', label: 'eBay Listing Generator' },
            { href: '/tools/shipping-calc', label: 'Shipping Calculator' },
          ].map(l => (
            <Link key={l.href} href={l.href} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white text-xs rounded-lg border border-gray-700 transition-colors">
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
