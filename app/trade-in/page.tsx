import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import TradeInClient from './TradeInClient';

export const metadata: Metadata = {
  title: 'Card Trade-In Estimator — Calculate Your Trade-In Value | CardVault',
  description: 'Build a trade-in package from your card collection and see how much it covers toward a target card. Compare direct dealer trade-in (65% value) vs selling online then buying. Platform fee comparison across eBay, Mercari, Facebook, COMC, and card shows.',
  openGraph: {
    title: 'Card Trade-In Estimator — CardVault',
    description: 'Calculate trade-in value for your cards. Compare dealer trade-in vs sell-then-buy across 5 platforms.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Trade-In Estimator — CardVault',
    description: 'Build a trade-in package and compare dealer offers vs selling online.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Trade-In Estimator' },
];

const faqItems = [
  {
    question: 'How much will a dealer offer for my cards as trade-in?',
    answer: 'Most dealers and local card shops (LCS) offer 55-70% of market value for trade-in credit, depending on the card, demand, and how quickly they can resell. Graded cards typically command 70-80% because they are easier to price and sell. Raw cards usually get 55-65%. This tool uses 65% as the midpoint estimate. Trade-in credit is usually 5-10% higher than a straight cash buyout from the same dealer.',
  },
  {
    question: 'Is it better to trade in cards or sell them online first?',
    answer: 'It depends on the value and your patience. Direct trade-in is instant but you get less (65% of value). Selling online on eBay gets you ~87% after fees and shipping, but takes days or weeks and involves listing, shipping, and platform risk. For cards under $50, trade-in is usually more efficient. For high-value cards ($200+), selling online and then buying your target can save significantly. This tool compares both approaches side by side.',
  },
  {
    question: 'What platforms are best for selling cards before buying a target?',
    answer: 'eBay has the largest audience and best prices but charges 13.13% in fees plus shipping costs. Mercari charges 10% with simpler listing. Facebook Marketplace and local groups charge zero fees but have smaller reach and more scam risk. COMC (Check Out My Cards) charges 5% on each side but handles storage and shipping for you. Card shows let you sell face-to-face with zero fees but require attending an event.',
  },
  {
    question: 'How do I get the best trade-in value at a card show?',
    answer: 'Bring your cards sleeved, organized, and with recent eBay sold comparables on your phone. Visit multiple dealers for competing offers. Graded cards get the best trade-in percentages. Bundle cards together for leverage. Mention you are looking to trade toward a specific card the dealer has — dealers prefer trade-in over cash buyouts because they restock inventory. End of show on Sunday afternoon is when dealers are most willing to negotiate.',
  },
  {
    question: 'Can I use my CardVault vault cards for trade-in calculations?',
    answer: 'Yes. Toggle on "Use cards from My Vault" to see cards you have collected through pack openings, daily packs, and marketplace purchases. This lets you quickly build a trade-in package from your existing collection without searching the full database. If you have not opened any packs yet, visit the Pack Store to start building your vault.',
  },
];

export default function TradeInPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Trade-In Estimator',
        description: 'Calculate trade-in value for your card collection. Compare dealer trade-in vs selling online across 5 platforms.',
        url: 'https://cardvault-two.vercel.app/trade-in',
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
        <div className="inline-flex items-center gap-2 bg-violet-950/60 border border-violet-800/50 text-violet-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          Trade-In Value &middot; Dealer vs Online &middot; 5 Platforms Compared
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Trade-In Estimator</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Pick a card you want, build a trade-in package from your collection, and instantly see how much it covers. Compare dealer trade-in vs selling online across eBay, Mercari, Facebook, COMC, and card shows.
        </p>
      </div>

      <TradeInClient />

      {/* Related */}
      <section className="mt-16 mb-12">
        <h2 className="text-xl font-bold text-white mb-4">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { href: '/tools/flip-calc', label: 'Flip Calculator', icon: '💸' },
            { href: '/tools/buyback-calc', label: 'Dealer Buyback Calc', icon: '🤝' },
            { href: '/tools/selling-platforms', label: 'Platform Comparison', icon: '🏪' },
            { href: '/vault', label: 'My Vault', icon: '🏦' },
            { href: '/tools/collection-report', label: 'Collection Report Card', icon: '📋' },
            { href: '/card-show-prep', label: 'Card Show Prep Kit', icon: '🎯' },
            { href: '/trade-hub', label: 'Trade Hub', icon: '🔄' },
            { href: '/tools/ebay-fee-calc', label: 'eBay Fee Calc', icon: '💲' },
          ].map(t => (
            <Link key={t.href} href={t.href} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 rounded-lg text-sm transition-colors">
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-800/50 border border-gray-700/50 rounded-xl">
              <summary className="cursor-pointer px-5 py-4 text-white font-medium text-sm flex items-center justify-between">
                {faq.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform ml-2">&#9662;</span>
              </summary>
              <div className="px-5 pb-4 text-gray-400 text-sm leading-relaxed">{faq.answer}</div>
            </details>
          ))}
        </div>
      </section>

      <section className="border-t border-gray-800 pt-8 mt-8 text-sm text-gray-500">
        <p>
          Calculate <Link href="/tools/flip-calc" className="text-emerald-400 hover:underline">flip profits</Link> before selling,
          compare <Link href="/tools/selling-platforms" className="text-emerald-400 hover:underline">selling platforms</Link>,
          or prepare for <Link href="/card-show-prep" className="text-emerald-400 hover:underline">card shows</Link>.
          Browse all <Link href="/tools" className="text-emerald-400 hover:underline">87+ collecting tools</Link>.
        </p>
      </section>
    </div>
  );
}
