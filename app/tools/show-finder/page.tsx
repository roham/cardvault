import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import ShowFinder from './ShowFinder';

export const metadata: Metadata = {
  title: 'Card Show Finder — Upcoming Sports Card Shows Near You | CardVault',
  description: 'Find card shows near you. Browse upcoming sports card shows, Pokemon card shows, and collectibles expos across the US. Filter by state, show type, and category. The National, regional shows, and local card shows.',
  openGraph: {
    title: 'Card Show Finder — Find Shows Near You | CardVault',
    description: 'Browse upcoming card shows across the US. Filter by state, type, and category.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Show Finder — CardVault',
    description: 'Find sports card and Pokemon card shows near you.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Card Show Finder' },
];

const faqItems = [
  {
    question: 'How do I find card shows near me?',
    answer: 'Use the state filter to narrow shows to your area. We list national conventions, regional expos, and local card shows across the US. Shows range from 30-table local meetups to 800+ table national events like The National Sports Collectors Convention.',
  },
  {
    question: 'What should I bring to a card show?',
    answer: 'Bring cash (most dealers prefer it and give better deals), your phone with CardVault\'s Dealer Scanner tool loaded, a top loader or small box to protect purchases, and a list of cards you are looking for. For multi-day events, comfortable shoes are essential.',
  },
  {
    question: 'Are card shows worth attending?',
    answer: 'Absolutely. Card shows offer prices 10-30% below online for raw cards because there are no platform fees or shipping costs. You can inspect condition in person, negotiate directly with dealers, and find cards that never make it to eBay. Plus the community atmosphere is unmatched.',
  },
  {
    question: 'What is The National?',
    answer: 'The National Sports Collectors Convention (NSCC) is the largest annual card show in the world. It features 800+ dealer tables, exclusive card releases, celebrity autograph signings, and draws collectors from every state and country. It is held in a different US city each year.',
  },
  {
    question: 'Do card shows have Pokemon cards?',
    answer: 'Many modern card shows now include Pokemon dealers alongside sports cards. Regional and national shows almost always have Pokemon tables. Use the category filter to find shows that specifically list Pokemon as a category. The hobby has become increasingly cross-category.',
  },
];

export default function ShowFinderPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Show Finder',
        description: 'Find upcoming sports card shows, Pokemon card shows, and collectibles expos near you.',
        url: 'https://cardvault-two.vercel.app/tools/show-finder',
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
        <div className="inline-flex items-center gap-2 bg-blue-950/60 border border-blue-800/50 text-blue-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
          20 Shows Listed - Filter by State - Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Show Finder</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Find upcoming card shows across the US. From The National to local meetups — browse by state, show type, and category. Never miss a show again.
        </p>
      </div>

      <ShowFinder />

      {/* FAQ Section */}
      <div className="mt-12 border-t border-gray-800 pt-10">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <details key={i} className="group bg-gray-900/60 border border-gray-800 rounded-xl">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium text-sm hover:text-blue-400 transition-colors">
                {item.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform ml-2">&#9660;</span>
              </summary>
              <div className="px-4 pb-4 text-sm text-gray-400 leading-relaxed">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mt-10 text-center">
        <p className="text-gray-500 text-sm mb-3">Going to a show? Use these tools on your phone:</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link href="/card-show" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-sm text-gray-300 hover:text-white transition-colors">
            Card Show Companion
          </Link>
          <Link href="/tools/dealer-scanner" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-sm text-gray-300 hover:text-white transition-colors">
            Dealer Scanner
          </Link>
          <Link href="/tools/condition-grader" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-sm text-gray-300 hover:text-white transition-colors">
            Condition Grader
          </Link>
          <Link href="/tools" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-sm text-gray-300 hover:text-white transition-colors">
            All Tools
          </Link>
        </div>
      </div>
    </div>
  );
}
