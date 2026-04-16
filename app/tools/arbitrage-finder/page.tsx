import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import ArbitrageClient from './ArbitrageClient';

export const metadata: Metadata = {
  title: 'Card Arbitrage Finder — Cross-Platform Price Comparison & Profit Calculator | CardVault',
  description: 'Find profitable card arbitrage opportunities across 7 platforms: eBay, COMC, Goldin, Heritage, MySlabs, Facebook Groups, and local card shops. Compare prices, calculate fees and shipping, and see net profit for every buy/sell combination. Free card flipping tool for sports card collectors.',
  openGraph: {
    title: 'Card Arbitrage Finder — CardVault',
    description: 'Compare card prices across 7 platforms and find profitable arbitrage opportunities after fees and shipping.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Arbitrage Finder — CardVault',
    description: 'Find card price gaps across eBay, COMC, Goldin, Heritage, MySlabs & more. Calculate real profit after all fees.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Arbitrage Finder' },
];

const faqItems = [
  {
    question: 'What is card arbitrage and how does it work?',
    answer: 'Card arbitrage means buying a sports card on one platform where it\'s priced lower and selling it on another platform where it\'s priced higher, pocketing the difference as profit. For example, you might find a PSA 10 rookie card listed at $80 on COMC but selling for $110 on eBay. After fees and shipping, you could net $15-20 profit per flip. This tool compares prices across 7 major platforms and calculates your actual profit after all fees, commissions, and shipping costs.',
  },
  {
    question: 'Which platforms have the lowest fees for selling cards?',
    answer: 'Facebook Groups and local card shops have zero platform fees, making them ideal for selling. However, Facebook buyers expect discounts (typically 10-15% below eBay prices), and card shops buy at 50-70% of market value. For online platforms, MySlabs charges 10% seller commission (lowest of the marketplaces), followed by eBay at 13.25% (final value fee + payment processing), then COMC at 20%, and auction houses (Goldin, Heritage) at 10% seller commission but with a 20% buyer premium that inflates final prices.',
  },
  {
    question: 'What cards have the best arbitrage opportunities?',
    answer: 'The best arbitrage opportunities are typically found in: (1) Mid-value graded cards ($50-$500) where platform price variance is highest relative to fees; (2) Recently graded cards that sellers list below market on COMC or MySlabs before eBay comps update; (3) Auction house wins — cards won at Goldin or Heritage auctions during low-attention periods; (4) Local card shop pickups where shops price based on outdated guides. Cards under $20 rarely work because shipping costs ($4-6) eat the margin.',
  },
  {
    question: 'How accurate are these price estimates?',
    answer: 'The prices shown are simulated estimates based on our card database values with platform-specific adjustments. eBay prices cluster around market value (±10%), COMC tends to be 5-20% below, auction houses can run 5-40% above due to buyer premiums and competitive bidding, Facebook Groups are typically 5-25% below, and card shops buy at 50-70% of market. For actual flipping decisions, always check real-time sold listings on each platform before committing.',
  },
  {
    question: 'How much money do I need to start card arbitrage?',
    answer: 'You can start card arbitrage with as little as $100-$200, but $500-$1,000 gives you more flexibility. The key is focusing on cards in the $50-$200 range where price spreads are meaningful but risk per card is manageable. With a $500 budget, you might run 3-5 cards simultaneously with expected profit of $10-$30 per flip. As you learn which niches have consistent price gaps (vintage baseball PSA 7-8, modern basketball rookies, etc.), you can scale up your investment.',
  },
];

export default function ArbitrageFinderPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Arbitrage Finder',
        description: 'Compare card prices across 7 platforms and find profitable arbitrage opportunities after fees and shipping.',
        url: 'https://cardvault-two.vercel.app/tools/arbitrage-finder',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Any',
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

      <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 mb-2">
        Card Arbitrage Finder
      </h1>
      <p className="text-zinc-400 mb-8 max-w-2xl">
        Compare prices across 7 platforms and find profitable buy/sell routes. Every opportunity includes real
        fee calculations, shipping costs, and net profit — so you see exactly what you&apos;d pocket.
      </p>

      <ArbitrageClient />

      {/* FAQ */}
      <div className="mt-12 space-y-4">
        <h2 className="text-xl font-bold text-white">Frequently Asked Questions</h2>
        {faqItems.map((faq, idx) => (
          <details key={idx} className="group bg-zinc-800/40 rounded-lg border border-zinc-700/50">
            <summary className="cursor-pointer px-4 py-3 text-white font-medium list-none flex items-center justify-between">
              {faq.question}
              <span className="text-zinc-400 group-open:rotate-180 transition-transform">▾</span>
            </summary>
            <div className="px-4 pb-4 text-zinc-400 text-sm leading-relaxed">{faq.answer}</div>
          </details>
        ))}
      </div>

      {/* Internal links */}
      <div className="mt-10 text-sm text-zinc-500 space-y-2">
        <p>
          More tools: <Link href="/tools" className="text-amber-400 hover:underline">All 82+ Tools</Link> ·
          <Link href="/tools/flip-tracker" className="text-amber-400 hover:underline ml-1">Flip Tracker</Link> ·
          <Link href="/tools/ebay-fee-calc" className="text-amber-400 hover:underline ml-1">eBay Fee Calculator</Link> ·
          <Link href="/tools/selling-platforms" className="text-amber-400 hover:underline ml-1">Selling Platforms</Link> ·
          <Link href="/tools/watchlist" className="text-amber-400 hover:underline ml-1">Price Watchlist</Link> ·
          <Link href="/tools/grade-spread" className="text-amber-400 hover:underline ml-1">Grade Price Spread</Link>
        </p>
        <p>
          Browse: <Link href="/cards" className="text-amber-400 hover:underline">All Cards</Link> ·
          <Link href="/players" className="text-amber-400 hover:underline ml-1">All Players</Link> ·
          <Link href="/sets" className="text-amber-400 hover:underline ml-1">All Sets</Link>
        </p>
      </div>
    </div>
  );
}
