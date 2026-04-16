import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import WantListClient from './WantListClient';
import { sportsCards } from '@/data/sports-cards';

export const metadata: Metadata = {
  title: 'Card Want List Builder — Track Cards You Need | CardVault',
  description: 'Free card want list builder. Search 9,000+ cards or add custom entries. Set priorities, max prices, and share your list with dealers. Perfect for card show prep and set completion.',
  alternates: { canonical: './' },
  openGraph: {
    title: 'Card Want List Builder | CardVault',
    description: 'Build and share your card want list. Set priorities, max prices, and prep for card shows.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Want List Builder | CardVault',
    description: 'Build and share your card want list. Free tool for collectors.',
  },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Want List Builder' },
];

const faqItems = [
  {
    question: 'How do I save my want list?',
    answer: 'Your want list is automatically saved to your browser\'s local storage. It persists between visits on the same device and browser. To access your list on a different device, use the Share Link feature to generate a URL containing your full list.',
  },
  {
    question: 'Can I share my want list with dealers?',
    answer: 'Yes! Click "Share Link" to generate a URL containing your entire want list. Send this link to dealers, card shop owners, or fellow collectors. They can see exactly what you are looking for, including your max price and priority level. You can also click "Copy as Text" for a plain-text version perfect for email or social media.',
  },
  {
    question: 'What do the priority levels mean?',
    answer: 'Need Now (red) means you are actively searching for this card and willing to buy immediately at the right price. Want (yellow) means you are interested but not in a rush. Eventually (white) means it is on your wish list but low urgency — you will grab it if the price is right but are not actively hunting.',
  },
  {
    question: 'Should I set max prices on my want list?',
    answer: 'Absolutely. Setting max prices prevents impulse purchases, especially at card shows where excitement can lead to overpaying. Your max price should reflect your research on recent sold prices. It also helps dealers understand your budget when you share your list with them.',
  },
  {
    question: 'How do I use this for set completion?',
    answer: 'Use the "Quick Add from Database" search to add specific cards from sets you are working on. Mark each card as "Found" when you acquire it. Use the sport filter to focus on one set at a time. The stats bar shows your completion progress at a glance.',
  },
];

const cardData = sportsCards.map(c => ({
  name: c.name,
  slug: c.slug,
  sport: c.sport,
  year: c.year,
  set: c.set,
}));

export default function WantListPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Want List Builder',
        description: 'Build, manage, and share your card want list. Search 9,000+ cards, set priorities and max prices, share with dealers.',
        url: 'https://cardvault-two.vercel.app/tools/want-list',
        applicationCategory: 'UtilityApplication',
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
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          9,000+ Cards &bull; Priorities &bull; Max Prices &bull; Shareable &bull; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">
          Want List Builder
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl">
          Track every card you need. Search the database or add custom entries. Set priorities, max prices, and share your list with dealers for card show prep or online buying.
        </p>
      </div>

      <WantListClient cards={cardData} />

      {/* FAQ Section */}
      <div className="mt-12 border-t border-slate-800 pt-10">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((item, i) => (
            <div key={i}>
              <h3 className="text-sm font-bold text-white mb-2">{item.question}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related Links */}
      <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { href: '/tools/set-cost', label: 'Set Completion Cost', desc: 'See what your set costs to complete' },
          { href: '/tools/set-checklist', label: 'Set Checklist', desc: 'Full checklists for every set' },
          { href: '/tools/show-companion', label: 'Card Show Companion', desc: 'Mobile toolkit for card shows' },
          { href: '/tools/watchlist', label: 'Price Watchlist', desc: 'Track price movements on cards' },
          { href: '/tools/smart-buy-list', label: 'Smart Buy List', desc: 'AI-recommended cards to buy' },
          { href: '/tools/export-collection', label: 'Export Collection', desc: 'Download your collection data' },
        ].map(link => (
          <Link key={link.href} href={link.href} className="bg-slate-800/40 border border-slate-700 rounded-lg p-3 hover:bg-slate-800 hover:border-slate-600 transition-colors">
            <p className="text-sm font-medium text-indigo-400">{link.label}</p>
            <p className="text-xs text-slate-500 mt-0.5">{link.desc}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link href="/tools" className="text-indigo-400 hover:text-indigo-300 text-sm">
          &larr; Back to All Tools
        </Link>
      </div>
    </div>
  );
}
