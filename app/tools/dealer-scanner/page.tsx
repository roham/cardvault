import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import DealerScanner from './DealerScanner';

export const metadata: Metadata = {
  title: 'Dealer Scanner — Instant Card Pricing for Shows & Shops',
  description: 'Free card show pricing tool built for dealers. Scan cards fast with instant price lookups, batch mode for pricing stacks, and quick-reference grade multipliers. Mobile-first — works one-handed at the table.',
  openGraph: {
    title: 'Dealer Scanner — CardVault',
    description: 'Instant card pricing at shows. Batch mode, grade multipliers, and eBay comps in one mobile-first tool.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Dealer Scanner — CardVault',
    description: 'Fast card pricing for dealers. One-handed mobile design for shows and shops.',
  },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Dealer Scanner' },
];

const faqItems = [
  {
    question: 'How do dealers price cards at shows?',
    answer: 'Most dealers reference eBay sold comps for recent market prices, then apply a margin based on their costs (table fees, travel, inventory carrying costs). Common practice is to price at 80-90% of recent eBay sold comps for quick sales, or 100-110% for desirable cards in high demand. Graded cards command higher prices and move faster than raw.',
  },
  {
    question: 'What is a good margin for card dealers?',
    answer: 'Dealers typically target 30-50% margin on individual card sales. Table fees at major shows run $500-$5,000+ per day, so volume matters more than per-card margin. Many dealers target $1,000-$2,000/day in gross profit. The Dealer Scanner helps you quickly verify pricing against recent comps so you can make fast buy/sell decisions at the table.',
  },
  {
    question: 'How do I price raw cards vs graded cards?',
    answer: 'Raw cards in apparent near-mint condition typically sell for 40-60% of a PSA 9 price. A PSA 10 commands a 2-5x premium over PSA 9 for modern cards, and 5-20x for vintage. BGS 9.5 and PSA 10 trade at roughly similar levels. Always factor in grading costs ($20-$50 per card for standard service) when deciding whether to sell raw or grade first.',
  },
  {
    question: 'What is the best way to look up card prices quickly?',
    answer: 'For speed at shows, use a mobile tool like CardVault Dealer Scanner that searches your query instantly as you type. For verification, check eBay sold listings (filter to "Sold Items" in the last 90 days). For high-value cards, cross-reference with PWCC, Goldin, and 130point.com. The key is having a fast, one-handed tool you can check between customer interactions.',
  },
  {
    question: 'How many cards should a dealer bring to a show?',
    answer: 'Most experienced dealers bring 3,000-10,000 cards to a major show, organized by sport, then by value tier. High-value cards ($50+) go in a display case. Dollar box cards fill long boxes. The average show customer browses 200-500 cards. Having a diverse inventory across price points ($1, $5, $20, $50, $100+) maximizes sales per table.',
  },
];

export default function DealerScannerPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Dealer Scanner',
        description: 'Fast card pricing tool for dealers at shows and shops. Instant lookups, batch mode, grade multipliers.',
        url: 'https://cardvault-two.vercel.app/tools/dealer-scanner',
        applicationCategory: 'BusinessApplication',
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
        <div className="inline-flex items-center gap-2 bg-orange-950/60 border border-orange-800/50 text-orange-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
          Instant Lookup - Batch Mode - Grade Multipliers - Mobile-First - Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Dealer Scanner</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Price cards in seconds at shows and shops. Type a player name, see instant pricing across all grades. Batch mode lets you price a whole stack. Built for one-handed use on your phone.
        </p>
      </div>

      <DealerScanner />

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
          <Link href="/tools/flip-calc" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">💸</span>
            <div>
              <div className="text-white text-sm font-medium">Flip Profit Calculator</div>
              <div className="text-gray-500 text-xs">Calculate profit after fees</div>
            </div>
          </Link>
          <Link href="/tools/grading-roi" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">💰</span>
            <div>
              <div className="text-white text-sm font-medium">Grading ROI Calculator</div>
              <div className="text-gray-500 text-xs">Is it worth grading?</div>
            </div>
          </Link>
          <Link href="/tools/collection-value" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">💎</span>
            <div>
              <div className="text-white text-sm font-medium">Collection Value</div>
              <div className="text-gray-500 text-xs">Total up your whole inventory</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
