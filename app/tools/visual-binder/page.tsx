import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import VisualBinderClient from './VisualBinderClient';

export const metadata: Metadata = {
  title: 'Visual Binder — See Your Collection Like a Real Binder',
  description: 'Free visual card binder for sports card collectors. Pick a set, track owned cards on binder pages with 9-card grids. See completion progress, flip through pages, and share your binder.',
  openGraph: {
    title: 'Visual Binder — CardVault',
    description: 'Track your sports card sets in a visual binder layout. 9-card pages, completion tracking, shareable progress.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Visual Binder — CardVault',
    description: 'Visual set completion tracker with binder pages, card slots, and shareable progress.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Visual Binder' },
];

const faqItems = [
  {
    question: 'How does the Visual Binder work?',
    answer: 'Pick any sports card set from our database. The binder shows cards arranged in a 3x3 grid per page — just like a real binder. Tap a card slot to mark it as owned. Owned cards show in color with team-specific styling; missing cards appear as ghosted placeholders. Your progress saves automatically.',
  },
  {
    question: 'Is my binder progress saved between visits?',
    answer: 'Yes. All binder data is saved locally in your browser using localStorage. Your progress persists between visits on the same device. You can also share your binder via a URL link so friends can see which cards you have and which you still need.',
  },
  {
    question: 'Can I track multiple sets at once?',
    answer: 'Absolutely. The binder home screen shows all sets with your completion progress for each one. Jump between sets freely — your progress for every set is saved independently. The dashboard shows your total cards owned across all sets.',
  },
  {
    question: 'What do the binder page colors mean?',
    answer: 'Owned cards appear with their sport color (red for baseball, orange for basketball, green for football, blue for hockey). Missing cards are ghosted outlines. When you complete a full binder page (all 9 slots), it gets a gold border. Complete an entire set and it gets a trophy badge.',
  },
  {
    question: 'How is the cost to complete calculated?',
    answer: 'The estimated cost sums up the raw card values (approximate PSA 7 equivalent) for every card you have not yet marked as owned. This gives you a rough idea of what it would cost to fill in the remaining slots at current market prices.',
  },
];

export default function VisualBinderPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Visual Binder',
        description: 'Visual set completion tracker with binder-page card grids. Track owned cards, flip through pages, share your collection.',
        url: 'https://cardvault-two.vercel.app/tools/visual-binder',
        applicationCategory: 'UtilitiesApplication',
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

      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-violet-950/60 border border-violet-800/50 text-violet-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
          Visual Binder Pages &middot; 9-Card Grid &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Visual Binder
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Track your sets the way they look in a real binder. Pick a set, flip through 9-card pages,
          and tap to mark cards you own. Watch your collection come to life slot by slot.
        </p>
      </div>

      {/* Tool */}
      <VisualBinderClient />

      {/* FAQ */}
      <section className="mt-16 mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map(item => (
            <details key={item.question} className="group bg-gray-900/60 border border-gray-800 rounded-xl">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium text-sm hover:text-violet-400 transition-colors">
                {item.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform ml-2">&#9660;</span>
              </summary>
              <div className="px-4 pb-4 text-sm text-gray-400 leading-relaxed">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Related */}
      <div className="border-t border-gray-800 pt-10">
        <h3 className="text-white font-semibold mb-4">Related Tools</h3>
        <div className="flex flex-wrap gap-3">
          <Link href="/tools/set-checklist" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 rounded-xl text-sm font-medium transition-colors">
            Set Checklist
          </Link>
          <Link href="/tools/set-cost" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 rounded-xl text-sm font-medium transition-colors">
            Set Completion Cost
          </Link>
          <Link href="/binder" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 rounded-xl text-sm font-medium transition-colors">
            Digital Binder
          </Link>
          <Link href="/tools/collection-value" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 rounded-xl text-sm font-medium transition-colors">
            Collection Value
          </Link>
        </div>
      </div>
    </div>
  );
}
