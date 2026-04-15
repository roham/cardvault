import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import ConsignmentClient from './ConsignmentClient';

export const metadata: Metadata = {
  title: 'Consignment Tracker — Track Cards at Auction Houses',
  description: 'Free consignment tracker for card collectors. Track cards at Heritage, Goldin, PWCC, MySlabs, and other auction houses. Monitor status from shipped to sold to paid. Compare commission rates across 8 consignment houses. Calculate net proceeds.',
  openGraph: {
    title: 'Consignment Tracker — CardVault',
    description: 'Track cards at auction houses. Compare commission rates. Monitor status and net proceeds.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Consignment Tracker — CardVault',
    description: 'Track your consigned cards. Compare 8 auction houses. Free.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Vault', href: '/vault' },
  { label: 'Consignment Tracker' },
];

const faqItems = [
  {
    question: 'Which consignment house should I use for my cards?',
    answer: 'It depends on card value and your timeline. For cards worth $1,000+, Heritage Auctions or Goldin provide the highest realized prices due to their premium buyer base. For $100-$1,000 cards, PWCC or Probstein123 offer lower commission and faster turnaround. For quick sales under $100, eBay consignment or MySlabs are most efficient. Premium houses charge 10% commission but attract wealthy bidders who often pay above market.',
  },
  {
    question: 'What is a buyer premium and how does it affect my sale?',
    answer: 'A buyer premium is an additional fee the BUYER pays on top of the hammer price. Heritage and Goldin charge 20% buyer premiums. So if your card sells for $1,000, the buyer pays $1,200 total. You receive $1,000 minus your seller commission (typically 10%), netting you $900. The buyer premium does not directly reduce your payout, but it can suppress bidding since buyers factor it into their maximum bids.',
  },
  {
    question: 'How long does consignment typically take?',
    answer: 'Timeline varies by house: PWCC and Probstein123 run weekly auctions (7-21 days from receipt to sale). Goldin runs twice-monthly auctions (30-60 days). Heritage and Lelands have longer cataloging periods (60-120 days) but often achieve higher prices due to extensive marketing. After the sale, payment typically takes 30-45 days from most houses.',
  },
  {
    question: 'When should I consign vs sell myself?',
    answer: 'Consign when: you have cards worth $500+ where auction competition drives prices up, you lack the time to photograph/list/ship individual sales, or you have a large collection to liquidate efficiently. Sell yourself when: cards are under $200 (consignment minimums and commissions eat too much), you need money fast (eBay BIN is faster than auction cycles), or you have an established selling reputation with repeat buyers.',
  },
  {
    question: 'What should I insure consigned cards for during shipping?',
    answer: 'Always insure for FULL replacement value, not your cost basis. If you paid $200 for a card now worth $800, insure for $800. Use registered USPS mail for items over $5,000 — it requires a signature at every postal transfer. For shipments over $25,000, consider a specialized fine art/collectibles carrier. Keep detailed photos of every card front, back, and slab before shipping.',
  },
];

export default function ConsignmentPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Consignment Tracker',
        description: 'Track cards at consignment houses. Compare commission rates across Heritage, Goldin, PWCC, and more.',
        url: 'https://cardvault-two.vercel.app/vault/consignment',
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
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          8 Houses &middot; Status Tracking &middot; Commission Comparison &middot; Net Proceeds &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Consignment Tracker</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Track cards you&apos;ve sent to auction houses and consignment services. Monitor status
          from shipped to sold to paid. Compare commission rates across 8 houses.
        </p>
      </div>

      <ConsignmentClient />

      {/* FAQ Section */}
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
        <h2 className="text-xl font-bold text-white mb-4">Related Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { href: '/vault/bulk-sale', label: 'Bulk Sale Calculator', desc: 'Compare 6 methods for selling lots' },
            { href: '/auction-estimator', label: 'Auction House Estimator', desc: 'Heritage vs Goldin vs PWCC comparison' },
            { href: '/tools/selling-platforms', label: 'Selling Platform Comparison', desc: 'eBay vs Mercari vs COMC' },
            { href: '/tools/shipping-calc', label: 'Shipping Calculator', desc: 'Calculate shipping costs and insurance' },
            { href: '/tools/ebay-fee-calc', label: 'eBay Fee Calculator', desc: 'Compare to self-selling fees' },
            { href: '/vault/grading-queue', label: 'Grading Queue Manager', desc: 'Track grading submissions' },
          ].map(t => (
            <Link key={t.href} href={t.href} className="flex items-center gap-3 p-3 bg-gray-800/50 border border-gray-700 rounded-xl hover:bg-gray-700/50 hover:border-gray-600 transition-colors">
              <div>
                <span className="text-white text-sm font-medium">{t.label}</span>
                <span className="text-gray-500 text-xs block">{t.desc}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
