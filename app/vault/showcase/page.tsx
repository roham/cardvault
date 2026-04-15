import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import ShowcaseClient from './ShowcaseClient';

export const metadata: Metadata = {
  title: 'Collection Showcase — Display Your Best Cards | CardVault',
  description: 'Create a stunning visual showcase of your best sports cards. Pick up to 9 cards, choose themes and layouts, and share a link with friends, dealers, or social media. Free, no account needed.',
  openGraph: {
    title: 'Collection Showcase — Display Your Best Cards | CardVault',
    description: 'Build a shareable gallery of your top sports cards. Multiple themes, layouts, and one-click sharing.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Collection Showcase — CardVault',
    description: 'Create and share a visual gallery of your best sports cards. Free collector tool.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Vault', href: '/vault' },
  { label: 'Showcase' },
];

const faqItems = [
  {
    question: 'What is the Collection Showcase?',
    answer: 'The Collection Showcase lets you curate your best sports cards into a visual gallery. Pick up to 9 cards from the full CardVault database or your vault, choose a theme and layout, and generate a shareable link. It is like a "Top 9" for card collectors — show off your best pulls, most valuable cards, or themed collections.',
  },
  {
    question: 'How do I share my showcase?',
    answer: 'Click "Share Link" to copy a URL to your clipboard. The entire showcase is encoded in the URL — no account or server needed. Paste the link in texts, social media, forums, or card show group chats. Anyone who opens it sees your showcase exactly as you designed it.',
  },
  {
    question: 'Can I save multiple showcases?',
    answer: 'Yes. Click "Save Showcase" to store it locally. You can save up to 10 showcases in your browser. Name each one differently — for example "My Grails", "Best Pulls 2024", or "Trade Bait". Load any saved showcase with one click.',
  },
  {
    question: 'What themes and layouts are available?',
    answer: 'Four themes: Midnight (dark navy with gold accents), Classic (clean dark with white borders), Emerald (green gradient, premium feel), and Sport Colors (each card styled by its sport). Four layouts: 3x3 Grid (9 cards), 2x2 Grid (4 cards), Top 3 (3 cards in a row), and Featured (1 hero card with 4 supporting).',
  },
  {
    question: 'Do I need cards in my vault to use this?',
    answer: 'No. You can search the entire CardVault database of 5,000+ cards. The vault filter is optional — use it to quickly find cards you have already collected. The showcase works with any card in the database.',
  },
];

export default function ShowcasePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Collection Showcase',
        description: 'Create a visual showcase gallery of your best sports cards. Choose themes, layouts, and share with a link.',
        url: 'https://cardvault-two.vercel.app/vault/showcase',
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
        <div className="inline-flex items-center gap-2 bg-purple-950/60 border border-purple-800/50 text-purple-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
          Themes - Layouts - Shareable Links - Save Multiple
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Collection Showcase</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Curate your best cards into a stunning visual gallery. Pick up to 9 cards, choose a theme and layout, then share with a single link.
        </p>
      </div>

      <ShowcaseClient />

      {/* Use Cases */}
      <section className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
          <div className="text-xl mb-2">🏆</div>
          <h3 className="text-white text-sm font-semibold mb-1">Show Off Your Grails</h3>
          <p className="text-gray-500 text-xs">Curate your most prized cards — vintage legends, numbered parallels, or PSA 10 gems. The showcase makes them shine.</p>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
          <div className="text-xl mb-2">🤝</div>
          <h3 className="text-white text-sm font-semibold mb-1">Trade Bait Display</h3>
          <p className="text-gray-500 text-xs">Build a showcase of cards you are willing to trade. Share the link in Discord, Facebook groups, or at card shows to find trading partners.</p>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
          <div className="text-xl mb-2">📱</div>
          <h3 className="text-white text-sm font-semibold mb-1">Social Sharing</h3>
          <p className="text-gray-500 text-xs">Create a visual gallery perfect for sharing on Instagram stories, TikTok, or X. Screenshot the preview for instant card content.</p>
        </div>
      </section>

      {/* Related Links */}
      <section className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link href="/vault" className="flex items-center gap-2 px-3 py-2.5 bg-gray-900/60 border border-gray-800 hover:border-gray-600 rounded-xl transition-colors text-sm">
          <span>🗄️</span>
          <span className="text-gray-300">My Vault</span>
        </Link>
        <Link href="/vault/wishlist" className="flex items-center gap-2 px-3 py-2.5 bg-gray-900/60 border border-gray-800 hover:border-gray-600 rounded-xl transition-colors text-sm">
          <span>🎯</span>
          <span className="text-gray-300">Wishlist</span>
        </Link>
        <Link href="/vault/analytics" className="flex items-center gap-2 px-3 py-2.5 bg-gray-900/60 border border-gray-800 hover:border-gray-600 rounded-xl transition-colors text-sm">
          <span>📊</span>
          <span className="text-gray-300">Analytics</span>
        </Link>
        <Link href="/tools/visual-binder" className="flex items-center gap-2 px-3 py-2.5 bg-gray-900/60 border border-gray-800 hover:border-gray-600 rounded-xl transition-colors text-sm">
          <span>📖</span>
          <span className="text-gray-300">Visual Binder</span>
        </Link>
      </section>

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
    </div>
  );
}
