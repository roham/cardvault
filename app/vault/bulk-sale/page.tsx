import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import BulkSaleClient from './BulkSaleClient';

export const metadata: Metadata = {
  title: 'Bulk Sale Calculator — Best Way to Sell Your Card Collection | CardVault',
  description: 'Compare 6 selling methods for your sports card collection: eBay individual, lot sales, consignment (PWCC/Goldin), local card shop, Facebook Groups, and Whatnot. See net payout, fees, time required, and get a personalized selling strategy.',
  openGraph: {
    title: 'Bulk Sale Calculator — Best Way to Sell Your Card Collection | CardVault',
    description: 'Compare selling methods and find the best strategy to liquidate your card collection. Free calculator.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Bulk Sale Calculator — CardVault',
    description: 'Find the best way to sell your card collection. Compare 6 methods side by side.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Vault', href: '/vault' },
  { label: 'Bulk Sale Calculator' },
];

const faqItems = [
  {
    question: 'What is the Bulk Sale Calculator?',
    answer: 'The Bulk Sale Calculator helps you figure out the best way to sell your card collection. Add your cards (from our database, your vault, or manual entry), and it compares 6 selling methods side by side: eBay individual listings, eBay lot sales, consignment services like PWCC and Goldin, selling to your local card shop, Facebook Groups, and Whatnot live selling. For each method, it shows your net payout after fees and shipping, time required, and dollars earned per hour of work.',
  },
  {
    question: 'Which selling method gives the most money?',
    answer: 'Generally, selling cards individually on eBay gives the highest per-card payout because you reach the largest buyer pool. However, it is also the most time-consuming — about 15 minutes per card for photos, listing, shipping, and customer service. For high-value cards ($50+), consignment services like PWCC or Goldin often achieve premium prices with less work. The best strategy usually combines multiple methods based on card value.',
  },
  {
    question: 'What fees does each platform charge?',
    answer: 'eBay charges about 13.25% of the sale price plus $0.30 per transaction. Consignment houses like PWCC and Goldin take 10-15% but require minimum card values (usually $50+). Facebook Groups typically charge no platform fee but PayPal Goods & Services adds about 3%. Whatnot takes 9.5%. Local card shops pay cash with no fees, but offer only 40-60% of market value. The calculator accounts for all these fees automatically.',
  },
  {
    question: 'How accurate are the time estimates?',
    answer: 'Time estimates are based on average seller experience: 15 minutes per eBay individual listing (photos, description, shipping), 3 minutes per card in lot sales, 2 minutes per card for consignment prep, 8 minutes per card for Facebook posts, and 1 minute per card for Whatnot streams. Your actual time may vary based on experience and setup. The estimates include listing, packaging, and shipping time.',
  },
  {
    question: 'Should I sell to my local card shop?',
    answer: 'Selling to your LCS is the fastest option — walk in, walk out with cash. But dealers typically pay 40-60% of market value because they need margin to resell. This makes sense for low-value cards (under $10 each) where your time listing individually costs more than the card is worth. For valuable cards, other methods recover significantly more of the market value.',
  },
];

export default function BulkSalePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Bulk Sale Calculator',
        description: 'Compare 6 selling methods for your sports card collection. See net payout, fees, time, and get a personalized selling strategy.',
        url: 'https://cardvault-two.vercel.app/vault/bulk-sale',
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

      <Breadcrumb items={breadcrumbs} />

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          6 Methods - Fee Comparison - Time Estimate - Strategy Advice
        </div>
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Bulk Sale Calculator</h1>
          <span className="text-xs bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 px-2 py-0.5 rounded-full">Free</span>
        </div>
        <p className="text-gray-400 text-lg">
          Find the best way to sell your card collection. Compare eBay, consignment, local shops, Facebook Groups, and Whatnot — see net payout after all fees, shipping costs, and time required.
        </p>
      </div>

      <BulkSaleClient />

      {/* FAQ section */}
      <section className="mt-16 border-t border-gray-800 pt-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map(f => (
            <details key={f.question} className="group bg-gray-900 border border-gray-800 rounded-xl">
              <summary className="px-5 py-4 text-white font-medium cursor-pointer hover:text-emerald-400 transition-colors">
                {f.question}
              </summary>
              <div className="px-5 pb-4 text-gray-400 text-sm">
                {f.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Internal Links */}
      <section className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Related Tools</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/tools/selling-platforms', label: 'Selling Platform Guide', desc: 'Compare all selling platforms in detail' },
            { href: '/tools/ebay-fee-calc', label: 'eBay Fee Calculator', desc: 'Exact fee breakdown for eBay sellers' },
            { href: '/tools/shipping-calc', label: 'Shipping Calculator', desc: 'USPS, UPS, FedEx cost comparison' },
            { href: '/tools/flip-tracker', label: 'Flip Tracker P&L', desc: 'Track buy/sell profit and loss' },
            { href: '/vault/insurance', label: 'Insurance Estimator', desc: 'Protect your collection value' },
            { href: '/tools/listing-generator', label: 'Listing Generator', desc: 'Generate optimized eBay listings' },
          ].map(link => (
            <Link key={link.href} href={link.href} className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-emerald-700 transition-colors group">
              <div className="text-white text-sm font-medium group-hover:text-emerald-400 transition-colors">{link.label}</div>
              <div className="text-gray-500 text-xs mt-1">{link.desc}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
