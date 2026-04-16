import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CraftingClient from './CraftingClient';

export const metadata: Metadata = {
  title: 'Crafting Station — Combine Cards to Craft Upgrades | CardVault',
  description: 'Combine 3 cards of the same sport to craft a random upgraded card. Turn common cards into rare pulls. Free card crafting game for collectors.',
  openGraph: {
    title: 'Crafting Station — CardVault',
    description: 'Combine 3 cards to craft upgrades. Turn commons into rares.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Crafting Station — CardVault',
    description: 'Sacrifice 3 cards, get 1 upgraded card. Will you hit Legendary?',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Vault', href: '/vault' },
  { label: 'Crafting Station' },
];

const faqItems = [
  {
    question: 'How does the Crafting Station work?',
    answer: 'Select 3 cards of the same sport from your vault. The Crafting Station combines them and produces 1 new card. The output card is from the same sport and is typically of higher value than your inputs. Higher-value inputs increase your chances of crafting a premium card.',
  },
  {
    question: 'What happens to my input cards?',
    answer: 'The 3 cards you select are permanently removed from your vault and replaced with 1 new crafted card. Choose wisely — you cannot undo a craft.',
  },
  {
    question: 'How are craft results determined?',
    answer: 'The output card is randomly selected from the same sport as your inputs. There is a 5% chance of hitting a jackpot (top-tier card), 20% chance of a premium pull, and 75% chance of a standard upgrade. Higher-value inputs shift the pool toward better cards.',
  },
  {
    question: 'What are the rarity tiers?',
    answer: 'Cards are classified into 5 tiers based on gem mint value: Common (under $10), Uncommon ($10-$49), Rare ($50-$199), Epic ($200-$999), and Legendary ($1,000+). Crafting a Legendary card is the ultimate goal.',
  },
  {
    question: 'Where do I get cards to craft?',
    answer: 'Open packs in the Pack Store, collect daily free packs, or trade with other collectors. Any cards in your vault can be used as crafting materials.',
  },
];

export default function CraftingPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Crafting Station',
        description: 'Combine 3 cards of the same sport to craft a random upgraded card.',
        url: 'https://cardvault-two.vercel.app/vault/crafting',
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

      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-purple-950/60 border border-purple-800/50 text-purple-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
          Combine 3 &middot; Craft 1 &middot; Chase Legendary
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Crafting Station</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Sacrifice 3 cards of the same sport to craft a random upgraded card. Turn your duplicates and commons into something special.
        </p>
      </div>

      {/* How it works */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
          <div className="text-2xl mb-1">&#127183;&#127183;&#127183;</div>
          <p className="text-white text-sm font-medium">Select 3</p>
          <p className="text-gray-500 text-xs">Same sport</p>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
          <div className="text-2xl mb-1">&#9889;</div>
          <p className="text-white text-sm font-medium">Craft</p>
          <p className="text-gray-500 text-xs">Combine them</p>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
          <div className="text-2xl mb-1">&#11088;</div>
          <p className="text-white text-sm font-medium">Upgrade</p>
          <p className="text-gray-500 text-xs">Get 1 better card</p>
        </div>
      </div>

      {/* Crafting tiers */}
      <div className="mb-8 bg-gray-900/40 border border-gray-800 rounded-2xl p-4">
        <h3 className="text-white font-semibold text-sm mb-2">Craft Tiers</h3>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-2 py-1 rounded bg-gray-800 text-gray-400">Common &lt;$10</span>
          <span className="px-2 py-1 rounded bg-green-900/30 text-green-400 border border-green-800/50">Uncommon $10-$49</span>
          <span className="px-2 py-1 rounded bg-blue-900/30 text-blue-400 border border-blue-800/50">Rare $50-$199</span>
          <span className="px-2 py-1 rounded bg-purple-900/30 text-purple-400 border border-purple-800/50">Epic $200-$999</span>
          <span className="px-2 py-1 rounded bg-yellow-900/30 text-yellow-400 border border-yellow-800/50">Legendary $1,000+</span>
        </div>
      </div>

      {/* Game */}
      <CraftingClient />

      {/* FAQ */}
      <section className="mt-12 border-t border-gray-800 pt-10">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((faq, i) => (
            <details key={i} className="group">
              <summary className="cursor-pointer text-white font-medium hover:text-purple-400 transition-colors">
                {faq.question}
              </summary>
              <p className="mt-2 text-gray-400 text-sm leading-relaxed pl-4">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Related */}
      <section className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-lg font-semibold text-white mb-3">Related</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { href: '/packs', label: 'Pack Store' },
            { href: '/vault', label: 'My Vault' },
            { href: '/vault/value-tracker', label: 'Value Tracker' },
            { href: '/tools/daily-pack', label: 'Daily Pack' },
            { href: '/trade-hub', label: 'Trade Hub' },
            { href: '/fortune-wheel', label: 'Fortune Wheel' },
            { href: '/vault/display-case', label: 'Display Case' },
            { href: '/vault/buyback', label: 'Buyback' },
          ].map(link => (
            <Link key={link.href} href={link.href} className="text-sm text-gray-400 hover:text-purple-400 bg-gray-900 border border-gray-800 rounded-full px-3 py-1 transition-colors">
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
