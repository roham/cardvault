import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import BundleCreatorClient from './BundleCreatorClient';

export const metadata: Metadata = {
  title: 'Card Bundle Creator — Build Team Lots & Player Bundles for Sale | CardVault',
  description: 'Free card bundle builder for sports card sellers. Create team lots, player bundles, sport bundles, and custom lots from 8,100+ cards. Calculate bundle value, set discounts, generate eBay and Mercari listing copy. Perfect for dealers and flippers.',
  openGraph: {
    title: 'Card Bundle Creator — CardVault',
    description: 'Build card bundles from 8,100+ sports cards. Team lots, player bundles, discount pricing, listing copy generator.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Bundle Creator — CardVault',
    description: 'Build team lots and player bundles. Calculate value, set discounts, generate listing copy.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Vault', href: '/vault' },
  { label: 'Bundle Creator' },
];

const faqItems = [
  {
    question: 'How does the Card Bundle Creator work?',
    answer: 'Search the CardVault database of 8,100+ sports cards and add cards to your bundle. Choose a bundle type (Team Lot, Player Bundle, Sport Bundle, Era Bundle, or Custom), set a discount percentage (5-30%), and the tool calculates total value, bundle price, and savings. Then generate a ready-to-paste listing title and description for eBay, Mercari, or other platforms.',
  },
  {
    question: 'What discount should I set for card bundles?',
    answer: 'Most collectors expect 10-20% off individual prices when buying a bundle. For common cards, 15-25% is typical. For higher-value lots with premium cards, 5-15% works because the convenience factor is already a selling point. The tool shows you the exact dollar savings at each discount level.',
  },
  {
    question: 'How are card values estimated?',
    answer: 'Card values are based on eBay sold listings and auction house data. The tool uses PSA 9 (raw) estimates as the baseline since most bundle cards are ungraded. Values are approximate and intended for pricing guidance — always check recent sold comps for your specific card condition and variation.',
  },
  {
    question: 'Can I save my bundles?',
    answer: 'Yes. Bundles are saved to your browser\'s local storage, so you can come back and edit them later. You can also copy the bundle details to your clipboard for pasting into listings. Each bundle is saved with its name, cards, discount, and creation date.',
  },
  {
    question: 'What makes a good card bundle for selling?',
    answer: 'The best-selling bundles have a clear theme: same team, same player, same sport, or same era. Team lots during playoffs sell fast. Player bundles for trending rookies move quickly. Include a mix of values (one premium card plus several base cards) to create a perceived deal. Always photograph the actual cards and list the exact cards in your description.',
  },
];

export default function BundleCreatorPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Bundle Creator',
        description: 'Build team lots, player bundles, and custom card bundles from 8,100+ sports cards. Calculate value, set discounts, generate listing copy.',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        url: 'https://cardvault-two.vercel.app/vault/bundle-creator',
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

      <BundleCreatorClient />

      {/* Related Links */}
      <section className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-lg font-bold text-white mb-4">Related Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href="/vault/bulk-sale" className="px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-gray-600 rounded-xl transition-colors">
            <div className="text-white text-sm font-medium">Bulk Sale Calculator</div>
            <div className="text-gray-500 text-xs">Compare 6 selling methods</div>
          </Link>
          <Link href="/tools/listing-generator" className="px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-gray-600 rounded-xl transition-colors">
            <div className="text-white text-sm font-medium">Listing Generator</div>
            <div className="text-gray-500 text-xs">Create optimized card listings</div>
          </Link>
          <Link href="/tools/ebay-fee-calc" className="px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-gray-600 rounded-xl transition-colors">
            <div className="text-white text-sm font-medium">eBay Fee Calculator</div>
            <div className="text-gray-500 text-xs">Know your exact payout</div>
          </Link>
          <Link href="/vault/liquidation" className="px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-gray-600 rounded-xl transition-colors">
            <div className="text-white text-sm font-medium">Liquidation Planner</div>
            <div className="text-gray-500 text-xs">Sell your collection strategically</div>
          </Link>
          <Link href="/tools/shipping-calc" className="px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-gray-600 rounded-xl transition-colors">
            <div className="text-white text-sm font-medium">Shipping Calculator</div>
            <div className="text-gray-500 text-xs">Compare carrier costs</div>
          </Link>
          <Link href="/vault/showcase" className="px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-gray-600 rounded-xl transition-colors">
            <div className="text-white text-sm font-medium">Collection Showcase</div>
            <div className="text-gray-500 text-xs">Display your best cards</div>
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold mb-4 text-white">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((f, i) => (
            <details key={i} className="group" open={i === 0}>
              <summary className="cursor-pointer text-gray-300 hover:text-white font-medium">{f.question}</summary>
              <p className="mt-2 text-gray-400 text-sm leading-relaxed">{f.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
