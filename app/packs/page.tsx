import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import PackStoreClient from './PackStoreClient';

export const metadata: Metadata = {
  title: 'Pack Store — Buy & Open Digital Card Packs | CardVault',
  description: 'Browse and open digital sports card packs. Bronze to Platinum tiers across baseball, basketball, football, and hockey. Real card data, simulated purchases.',
  openGraph: {
    title: 'Pack Store — CardVault',
    description: 'Browse and open digital sports card packs from Bronze to Platinum.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Pack Store — CardVault',
    description: 'Digital sports card packs. Real cards, real data. Open now.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Pack Store' },
];

const faqItems = [
  {
    question: 'How does the pack store work?',
    answer: 'You start with a $250 welcome bonus. Browse packs by sport or tier, purchase them with your balance, and open them to reveal real sports cards that go into your vault. Every card uses real data from our database of 2,900+ sports cards.',
  },
  {
    question: 'What are the pack tiers?',
    answer: 'Bronze ($4.99) gives you 5 cards with a chance at hits. Silver ($14.99) guarantees one $50+ card. Gold ($29.99) guarantees one $200+ card. Platinum ($49.99) gives 3 cards all worth $100+.',
  },
  {
    question: 'Can I sell cards back?',
    answer: 'Yes! Every card can be sold back to CardVault for 90% of its fair market value. This instant buyback lets you reinvest in more packs or save your balance.',
  },
  {
    question: 'Are these real cards?',
    answer: 'The pack store is a prototype experience. All card data, values, and players are real — sourced from our database of verified eBay sold comps and auction records. The purchase and wallet system is simulated using your browser.',
  },
  {
    question: 'How do I get more balance?',
    answer: 'You start with $250. Sell cards back at 90% FMV to earn credits, or reset your wallet from the pack store page. In the future, we plan to add daily login bonuses and challenge rewards.',
  },
];

export default function PackStorePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Pack Store',
        description: 'Browse and open digital sports card packs with real card data. Bronze to Platinum tiers across all major sports.',
        url: 'https://cardvault-two.vercel.app/packs',
        applicationCategory: 'EntertainmentApplication',
        operatingSystem: 'Any',
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

      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          16 packs available · Prototype
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Pack Store</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Buy and open digital card packs with real sports card data. Start with $250 — chase hits from Bronze to Platinum.
        </p>
      </div>

      <PackStoreClient />

      {/* FAQ */}
      <section className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <details key={i} className="group bg-gray-900/40 border border-gray-800 rounded-xl">
              <summary className="p-4 cursor-pointer text-white font-medium text-sm flex justify-between items-center">
                {item.question}
                <span className="text-gray-500 group-open:rotate-45 transition-transform text-lg">+</span>
              </summary>
              <div className="px-4 pb-4">
                <p className="text-sm text-gray-400 leading-relaxed">{item.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Related */}
      <section className="mt-10">
        <h2 className="text-lg font-bold text-white mb-4">Related</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <Link href="/premium-packs" className="p-4 bg-gray-900/40 border border-gray-800 rounded-xl hover:border-gray-600 transition-colors">
            <h3 className="text-sm font-semibold text-white">Premium Packs</h3>
            <p className="text-xs text-gray-400 mt-1">Free themed packs with cooldown timers.</p>
          </Link>
          <Link href="/binder" className="p-4 bg-gray-900/40 border border-gray-800 rounded-xl hover:border-gray-600 transition-colors">
            <h3 className="text-sm font-semibold text-white">Digital Binder</h3>
            <p className="text-xs text-gray-400 mt-1">Organize your collection across tabs.</p>
          </Link>
          <Link href="/drops" className="p-4 bg-gray-900/40 border border-gray-800 rounded-xl hover:border-gray-600 transition-colors">
            <h3 className="text-sm font-semibold text-white">Drop Calendar</h3>
            <p className="text-xs text-gray-400 mt-1">Themed events and limited-time packs.</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
