import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import BuybackCalcClient from './BuybackCalcClient';

export const metadata: Metadata = {
  title: 'Dealer Buyback Calculator — What Will a Dealer Pay for Your Cards?',
  description: 'Free dealer buyback calculator. Estimate what card shops and dealers will offer for your cards (typically 40-60% of market value). Compare dealer offers to self-selling profits across eBay, Mercari, and Facebook. Know if a dealer offer is fair before you accept.',
  openGraph: {
    title: 'Dealer Buyback Calculator — CardVault',
    description: 'Know what dealers should pay for your cards. Compare dealer offers to selling yourself.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Dealer Buyback Calculator — CardVault',
    description: 'Estimate fair dealer offers for your cards. Compare to self-selling profit. Free.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Dealer Buyback Calculator' },
];

const faqItems = [
  {
    question: 'How much do card dealers typically pay for cards?',
    answer: 'Card dealers typically offer 40-60% of market value for individual cards. For bulk lots, offers can drop to 20-40%. High-demand cards (PSA 10 rookies, vintage stars) may get 50-65% offers because they resell quickly. Slow-moving inventory like base cards and commons may only get 10-25%. The dealer needs margin for overhead, grading risk, and holding costs.',
  },
  {
    question: 'When should I sell to a dealer vs sell myself?',
    answer: 'Sell to a dealer when you value speed and convenience over maximum profit, when you have a large collection to liquidate quickly, or when individual cards are worth less than $20 (fees and shipping eat into self-selling profits on cheap cards). Sell yourself when cards are worth $50+ individually, when you have time to list and ship, or when you have rare items that command premium prices from collectors.',
  },
  {
    question: 'How do I negotiate with a card dealer?',
    answer: 'Know your market values before approaching a dealer. Start by asking what they would offer — never name a price first. If their offer is below 40%, counter with recent eBay sold comps. Bundle high-demand cards with slower inventory to sweeten the deal. Be willing to walk away — dealers at shows expect negotiation. Cash deals often get better rates than trades.',
  },
  {
    question: 'What factors affect dealer buyback offers?',
    answer: 'Key factors include: card liquidity (how fast it resells), current market demand, condition and grading status, whether the dealer already has the card in inventory, time of year (shows vs slow season), and deal size (larger lots may get better rates per card). Rookie cards and graded cards typically command higher buyback percentages than raw commons.',
  },
  {
    question: 'Should I get my cards graded before selling to a dealer?',
    answer: 'Usually no — dealers prefer to grade cards themselves to control costs and maximize their margin. The exception is if you have a card likely to grade PSA 9 or 10, where the graded premium far exceeds the grading cost. For most cards under $100 raw value, selling ungraded to a dealer is more efficient.',
  },
];

export default function BuybackCalcPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Dealer Buyback Calculator',
        description: 'Estimate what card dealers will offer for your cards. Compare dealer buyback to self-selling across eBay, Mercari, and Facebook.',
        url: 'https://cardvault-two.vercel.app/tools/buyback-calc',
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
          Dealer Offers &middot; Self-Sell Comparison &middot; Fair Price Check &middot; Mobile-First &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Dealer Buyback Calculator</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Find out what a dealer should pay for your cards. Add cards with estimated market values,
          see buyback offers at different dealer tiers, and compare against selling yourself.
        </p>
      </div>

      <BuybackCalcClient />

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

      {/* Related Tools */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-white mb-4">Related Tools</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/tools/selling-platforms', label: 'Selling Platform Comparison', icon: '🏪' },
            { href: '/tools/negotiation-calc', label: 'Negotiation Calculator', icon: '🤝' },
            { href: '/tools/flip-calc', label: 'Flip Profit Calculator', icon: '💰' },
            { href: '/tools/collection-value', label: 'Collection Value Calculator', icon: '💎' },
            { href: '/tools/ebay-fee-calc', label: 'eBay Fee Calculator', icon: '💲' },
            { href: '/tools/listing-generator', label: 'Listing Generator', icon: '📝' },
          ].map(t => (
            <Link
              key={t.href}
              href={t.href}
              className="flex items-center gap-2 px-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-xl text-sm text-gray-300 hover:text-white transition-colors"
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
