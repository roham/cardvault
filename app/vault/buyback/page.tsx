import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import BuybackClient from './BuybackClient';

export const metadata: Metadata = {
  title: 'Sell Cards — 90% Buyback | CardVault',
  description: 'Sell cards from your vault at 90% of fair market value. Batch sell multiple cards, see profit/loss per card, and get instant wallet credits. CardVault buyback.',
  openGraph: {
    title: 'Sell Cards — 90% Buyback | CardVault',
    description: 'Select cards from your vault and sell them back at 90% FMV. Batch sell, P&L tracking, instant credits.',
    type: 'website',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'My Vault', href: '/vault' },
  { label: 'Sell Cards' },
];

const faqItems = [
  {
    question: 'How does the 90% buyback work?',
    answer: 'When you sell a card back, you receive 90% of its estimated fair market value as an instant credit to your wallet. The 10% fee represents the marketplace spread — similar to how real card dealers operate.',
  },
  {
    question: 'Can I sell multiple cards at once?',
    answer: 'Yes! Select multiple cards by tapping them, then confirm the batch sale. You will see a detailed breakdown of each card\'s value, your profit or loss, and the total credit before confirming.',
  },
  {
    question: 'How is the buyback value calculated?',
    answer: 'The buyback value is 90% of the card\'s estimated fair market value (FMV). FMV is based on recent eBay sold prices and auction records. For example, a card worth $100 sells back for $90.',
  },
  {
    question: 'Can I undo a sale?',
    answer: 'No. Once you confirm a sale, the cards are removed from your vault and the credits are added to your balance. You can always use those credits to open more packs and find new cards.',
  },
  {
    question: 'What is the P&L column?',
    answer: 'P&L (Profit & Loss) shows the difference between what you will receive (90% buyback value) and what you originally paid for the card from packs. Green means profit, red means loss.',
  },
];

export default function BuybackPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault — Sell Cards (90% Buyback)',
        description: 'Sell cards from your vault at 90% fair market value. Batch sell with P&L tracking.',
        url: 'https://cardvault-two.vercel.app/vault/buyback',
        applicationCategory: 'GameApplication',
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
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Sell Cards</h1>
          <span className="text-xs bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 px-2 py-0.5 rounded-full">90% FMV</span>
        </div>
        <p className="text-gray-400 text-lg">
          Select cards from your vault to sell back at 90% of fair market value. Batch sell for convenience.
        </p>
      </div>

      <BuybackClient />

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

      {/* Internal links */}
      <section className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-lg font-semibold text-white mb-4">Related</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link href="/vault" className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-300 hover:text-emerald-400 hover:border-gray-700 transition-colors">
            My Vault
          </Link>
          <Link href="/packs" className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-300 hover:text-emerald-400 hover:border-gray-700 transition-colors">
            Pack Store
          </Link>
          <Link href="/marketplace" className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-300 hover:text-emerald-400 hover:border-gray-700 transition-colors">
            Marketplace
          </Link>
          <Link href="/tools/collection-value" className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-300 hover:text-emerald-400 hover:border-gray-700 transition-colors">
            Collection Value
          </Link>
        </div>
      </section>
    </div>
  );
}
