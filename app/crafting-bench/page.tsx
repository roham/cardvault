import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CraftingBenchClient from './CraftingBenchClient';

export const metadata: Metadata = {
  title: 'Card Crafting Bench — Combine Cards to Upgrade | CardVault',
  description: 'Combine 3 cards of the same rarity tier to craft 1 upgraded card. Turn commons into uncommons, rares into epics, and epics into legendaries. Free card crafting game.',
  openGraph: {
    title: 'Card Crafting Bench — CardVault',
    description: 'Combine 3 cards to craft an upgraded card. Turn common cards into legendary pulls.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Crafting Bench — CardVault',
    description: 'Combine 3 cards to craft an upgraded card. Card collecting meets crafting.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Collect', href: '/binder' },
  { label: 'Crafting Bench' },
];

const faqItems = [
  {
    question: 'How does the Card Crafting Bench work?',
    answer: 'Select 3 cards of the same rarity tier from your vault, then combine them to receive 1 card from the next tier up. Common cards craft into Uncommon, Uncommon into Rare, Rare into Epic, and Epic into Legendary. The 3 input cards are consumed in the process, so choose wisely.',
  },
  {
    question: 'What are the rarity tiers?',
    answer: 'Cards are organized into 5 tiers based on estimated value: Common (under $25), Uncommon ($25–$99), Rare ($100–$499), Epic ($500–$999), and Legendary ($1,000+). Each tier has its own color and icon for easy identification.',
  },
  {
    question: 'Where do I get cards to craft?',
    answer: 'Cards come from opening packs in the Pack Store, claiming your Daily Free Pack, receiving gift packs from friends, or trading with other collectors in the Trade Hub. Any card in your vault can be used for crafting as long as you have 3 cards in the same rarity tier.',
  },
  {
    question: 'Can I undo a craft?',
    answer: 'No — crafting is permanent. The 3 input cards are removed from your vault and replaced with 1 upgraded card. Make sure you are happy with your selection before hitting the Craft button. You can always open more packs to rebuild your collection.',
  },
  {
    question: 'What card will I get from crafting?',
    answer: 'The crafted card is randomly selected from all cards in the database that fall within the target rarity tier. For example, crafting 3 Common cards gives you a random Uncommon card ($25–$99 estimated value). The exact card is a surprise each time.',
  },
];

export default function CraftingBenchPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Crafting Bench',
        description: 'Combine 3 cards of the same rarity tier to craft 1 upgraded card. Free card crafting game for collectors.',
        url: 'https://cardvault-two.vercel.app/crafting-bench',
        applicationCategory: 'GameApplication',
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

      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
          Card Crafting Bench
        </h1>
        <p className="text-gray-400 text-lg">
          Combine 3 cards of the same tier to craft 1 upgraded card.
        </p>
      </div>

      <CraftingBenchClient />

      {/* FAQ Section */}
      <section className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq) => (
            <details key={faq.question} className="group bg-gray-800/30 border border-gray-700/50 rounded-lg">
              <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-gray-200 hover:text-white transition-colors">
                {faq.question}
              </summary>
              <div className="px-4 pb-3 text-sm text-gray-400 leading-relaxed">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Footer nav */}
      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        <Link href="/packs" className="text-blue-400 hover:text-blue-300">Pack Store</Link>
        <span className="text-gray-700">|</span>
        <Link href="/vault" className="text-blue-400 hover:text-blue-300">My Vault</Link>
        <span className="text-gray-700">|</span>
        <Link href="/trade-hub" className="text-blue-400 hover:text-blue-300">Trade Hub</Link>
        <span className="text-gray-700">|</span>
        <Link href="/binder" className="text-blue-400 hover:text-blue-300">Digital Binder</Link>
        <span className="text-gray-700">|</span>
        <Link href="/digital-pack" className="text-blue-400 hover:text-blue-300">Daily Pack</Link>
        <span className="text-gray-700">|</span>
        <Link href="/premium-packs" className="text-blue-400 hover:text-blue-300">Premium Packs</Link>
      </div>
    </div>
  );
}
