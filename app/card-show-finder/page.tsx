import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardShowFinder from './CardShowFinder';

export const metadata: Metadata = {
  title: 'Card Show Finder — Upcoming Sports Card Shows, Conventions & Expos Near You',
  description: 'Find card shows near you. 24 upcoming sports card shows, conventions, and expos across 15 states. Filter by region, type, and search by city. Show details, dealer counts, features, tips, and countdown timers.',
  openGraph: {
    title: 'Card Show Finder — CardVault',
    description: 'Find upcoming card shows near you. 24 shows across 5 regions with details and countdown timers.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Show Finder — CardVault',
    description: 'Find card shows, conventions, and expos near you.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Card Show Finder' },
];

const faqItems = [
  {
    question: 'How do I find card shows near me?',
    answer: 'Use the region filter to narrow to your area (Northeast, Southeast, Midwest, Southwest, or West), or search by city or state name. Shows are sorted by date with the soonest events first. Each listing includes venue, address, admission price, dealer table count, and special features.',
  },
  {
    question: 'What is the difference between local, regional, and national shows?',
    answer: 'Local shows are smaller monthly events with 40-80 tables, great for finding deals and building relationships with dealers. Regional shows are larger (100-250 tables) with grading company drop-offs and special guests. National shows like The NSCC are the biggest events (800+ tables) with exclusive releases and industry panels.',
  },
  {
    question: 'How much does it cost to attend a card show?',
    answer: 'Local shows typically charge $3-5 admission, regional shows $10-15, and national conventions $20-30 per day. Most shows offer early bird VIP passes for an additional fee. Many local shows have free admission for children under 12. Bring extra cash for purchases, food, and parking.',
  },
  {
    question: 'What should I bring to a card show?',
    answer: 'Essential supplies: cash (small bills for negotiation), penny sleeves and top loaders for protection, a team bag for bulk purchases, your phone with price checking apps, a want list, and a set budget. For larger shows, bring water, comfortable shoes, and a backpack for your purchases.',
  },
  {
    question: 'When is The National (NSCC) this year?',
    answer: 'The 2025 National Sports Collectors Convention (NSCC) is scheduled for July 30 - August 3, 2025, at the Atlantic City Convention Center in New Jersey. It is the largest card show in the world with 800+ dealer tables, every major brand represented, exclusive card releases, celebrity signings, and industry panels.',
  },
];

export default function CardShowFinderPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Show Finder',
        description: 'Find upcoming sports card shows, conventions, and expos across the United States.',
        url: 'https://cardvault-two.vercel.app/card-show-finder',
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
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          24 Shows &middot; 5 Regions &middot; 15 States &middot; Updated Weekly
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Show Finder</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Find upcoming card shows, conventions, and expos near you. Filter by region and type,
          see dealer counts and features, and get countdown timers for every event.
        </p>
      </div>

      <CardShowFinder />

      {/* FAQ Section */}
      <div className="mt-12 border-t border-gray-700/50 pt-8">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-800/30 border border-gray-700/30 rounded-xl">
              <summary className="cursor-pointer p-4 text-white font-medium hover:text-emerald-300 transition-colors list-none flex items-center justify-between">
                {faq.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform ml-2">&#9660;</span>
              </summary>
              <div className="px-4 pb-4 text-gray-400 text-sm leading-relaxed">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
