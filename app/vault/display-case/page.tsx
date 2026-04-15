import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import DisplayCaseClient from './DisplayCaseClient';

export const metadata: Metadata = {
  title: 'Display Case Builder — Plan Your Slab Display Layout | CardVault',
  description: 'Visual display case planner for graded sports card slabs. Choose case size (2x2 to 4x5), arrange cards by value, sport, year, or rookie status. Save multiple layouts. Plan your perfect card display before buying a case.',
  openGraph: {
    title: 'Display Case Builder — Slab Layout Planner | CardVault',
    description: 'Plan your graded card display layout. Choose case size, arrange cards, auto-sort by value or sport.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Display Case Builder — CardVault',
    description: 'Visual slab display planner. Arrange your graded cards perfectly.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Vault', href: '/vault' },
  { label: 'Display Case Builder' },
];

const faqItems = [
  {
    question: 'What is the Display Case Builder?',
    answer: 'The Display Case Builder is a visual planning tool that lets you arrange your graded sports card slabs in a virtual display case before buying a physical case or rearranging your collection. Choose from 5 case sizes (2x2 through 4x5), search and place cards from our database of 6,800+ cards, auto-arrange by value, sport, year, or rookie status, and save multiple layouts.',
  },
  {
    question: 'How do I place cards in the display case?',
    answer: 'Search for a card using the search bar, then click it to place it in the next available empty slot. To place a card in a specific slot, click the slot first (it turns green) then select a card from search results. To remove a card, click the "remove" link on the card in the display case.',
  },
  {
    question: 'Can I save multiple display case layouts?',
    answer: 'Yes, you can save as many layouts as you want. Each saved layout stores the case size, card arrangement, and a custom name. Saved layouts persist in your browser\'s local storage. Use this to plan different themed displays — one for baseball, one for rookies, one for your highest-value slabs.',
  },
  {
    question: 'What display case size should I choose?',
    answer: 'For PSA slabs, a 3x3 case (9 cards) is the most popular size for desk or shelf displays. A 3x4 case (12 cards) works well for wall-mounted displays. 4x4 and 4x5 cases are great for dedicated display cabinets. Consider leaving 1-2 empty slots for future additions — a display case with room to grow looks intentional.',
  },
  {
    question: 'What are the best arrangement strategies for display cases?',
    answer: 'The most popular arrangements are: (1) Center your highest-value card and radiate outward by decreasing value, (2) Group by sport with each row dedicated to one sport, (3) Timeline arrangement from oldest to newest left-to-right and top-to-bottom, (4) All-rookies display for investment collections. The auto-arrange buttons let you try each strategy instantly.',
  },
];

export default function DisplayCasePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Display Case Builder — Slab Layout Planner',
        description: 'Visual display case planner for graded sports card slabs. Arrange cards, auto-sort, save layouts.',
        url: 'https://cardvault-two.vercel.app/vault/display-case',
        applicationCategory: 'UtilitiesApplication',
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
        <div className="inline-flex items-center gap-2 bg-amber-950/60 border border-amber-800/50 text-amber-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
          5 Case Sizes &middot; Auto-Arrange &middot; Save Layouts
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Display Case Builder</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Plan your perfect graded card display. Choose a case size, arrange your slabs, auto-sort by value or sport, and save layouts for different themes.
        </p>
      </div>

      <DisplayCaseClient />

      {/* FAQ */}
      <div className="mt-12">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-800/50 border border-gray-700/50 rounded-xl">
              <summary className="flex items-center justify-between cursor-pointer px-5 py-4 text-white font-medium text-sm">
                {faq.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform ml-2">&#9660;</span>
              </summary>
              <div className="px-5 pb-4 text-gray-400 text-sm leading-relaxed">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Back */}
      <div className="mt-8 text-center">
        <Link href="/vault" className="text-amber-400 hover:text-amber-300 text-sm transition-colors">
          &larr; Back to My Vault
        </Link>
      </div>
    </div>
  );
}
