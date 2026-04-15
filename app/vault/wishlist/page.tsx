import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import WishlistClient from './WishlistClient';

export const metadata: Metadata = {
  title: 'Vault Wishlist — Track Cards You Want to Buy | CardVault',
  description: 'Build your card collecting wishlist. Search from 4,600+ cards, set target buy prices, track priorities, and link directly to eBay listings. See potential savings vs market prices. Free, no account needed.',
  openGraph: {
    title: 'Vault Wishlist — Track Cards You Want | CardVault',
    description: 'Build a want list, set target prices, search eBay in one click. Free card collecting wishlist.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Vault Wishlist — CardVault',
    description: 'Track cards you want to buy. Set targets, priorities, and search eBay instantly.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Vault', href: '/vault' },
  { label: 'Wishlist' },
];

const faqItems = [
  {
    question: 'What is the Vault Wishlist?',
    answer: 'The Vault Wishlist is a want-list tracker for card collectors. Add any card from the CardVault database, set a target buy price below market value, assign priority levels (must-have, want, nice-to-have), and track your progress. Each item links directly to eBay buy-it-now listings filtered by your card.',
  },
  {
    question: 'How do target prices work?',
    answer: 'When you add a card, the target price defaults to 15% below current market value — a realistic discount target for patient buyers. You can adjust this to any amount. The dashboard shows your total potential savings if you buy every card at target vs market price.',
  },
  {
    question: 'Can I share my wishlist?',
    answer: 'Yes, use the Copy Wishlist button to copy a formatted text version to your clipboard. Share it with friends, post it on social media, or send it to dealers at card shows so they know what you are looking for.',
  },
  {
    question: 'What do the status options mean?',
    answer: 'Searching means you are actively looking. Found means you have spotted it at a good price (but have not bought yet). Purchased means you have acquired the card. Use these to track your collecting journey from want to own.',
  },
  {
    question: 'Is my data saved?',
    answer: 'Yes, your wishlist is stored in browser localStorage. It persists between sessions. No account required. Data stays on your device.',
  },
];

export default function WishlistPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Vault Wishlist — Card Want List Tracker',
        description: 'Track cards you want to buy with target prices, priority levels, and eBay integration.',
        url: 'https://cardvault-two.vercel.app/vault/wishlist',
        applicationCategory: 'FinanceApplication',
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

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-indigo-950/60 border border-indigo-800/50 text-indigo-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
          Want List - Target Prices - eBay Search - Priority Tracking
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Vault Wishlist</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Track cards you want to buy. Search from 4,600+ cards, set target buy prices, assign priorities, and search eBay in one click. See your total potential savings at a glance.
        </p>
      </div>

      <WishlistClient />

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
    </div>
  );
}
