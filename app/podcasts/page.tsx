import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import PodcastDirectoryClient from './PodcastDirectoryClient';

export const metadata: Metadata = {
  title: 'Card Collecting Podcasts — Best Sports Card & Pokemon Podcasts | CardVault',
  description: 'Discover the best card collecting podcasts for sports cards and Pokemon. Curated directory of 15+ podcasts covering investing, grading, ripping, vintage, and hobby news.',
  openGraph: {
    title: 'Card Collecting Podcasts — CardVault',
    description: 'Best podcasts for sports card and Pokemon collectors. Market analysis, product reviews, grading, and hobby news.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Collecting Podcasts — CardVault',
    description: 'Curated directory of the best card collecting podcasts.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Media', href: '/creators' },
  { label: 'Podcasts' },
];

const faqItems = [
  {
    question: 'What is the best card collecting podcast?',
    answer: 'Sports Card Investor by Geoff Wilson is the most popular, with daily episodes and data-driven market analysis. For broader hobby coverage, Card Chat and Cardboard Connection Podcast are excellent choices. For sport-specific content, Baseball Card Breakdown, Football Card Fire, and Hoops Card Central each focus deeply on their respective sports.',
  },
  {
    question: 'Are there podcasts specifically about Pokemon cards?',
    answer: 'Yes — Pokemon TCG Radio covers everything from set reviews to investment strategies specifically for the Pokemon card market. Several general hobby podcasts also cover Pokemon alongside sports cards, especially when major sets release.',
  },
  {
    question: 'How can podcasts help me make better card investments?',
    answer: 'Card collecting podcasts provide real-time market intelligence that is hard to find elsewhere. Hosts break down daily price movements, analyze the impact of player performance on card values, review new products before release, and interview industry insiders who share knowledge about upcoming trends. Listening regularly gives you an information edge.',
  },
  {
    question: 'Where can I listen to card collecting podcasts?',
    answer: 'Most card collecting podcasts are available on Apple Podcasts, Spotify, and YouTube. Some also have dedicated websites with show notes and links. Several podcasts started as YouTube channels and expanded to audio-only formats, so checking both platforms gives you the full content library.',
  },
  {
    question: 'How often do card collecting podcasts release new episodes?',
    answer: 'It varies by show. Sports Card Investor releases daily market updates. Most others release weekly episodes. Some, like Wax Museum and The Beckett Experience, release monthly deep-dive episodes. We recommend subscribing to 2-3 that match your collecting interests for consistent hobby coverage.',
  },
];

export default function PodcastDirectoryPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Card Collecting Podcast Directory',
        description: 'Curated directory of the best sports card and Pokemon card collecting podcasts.',
        url: 'https://cardvault-two.vercel.app/podcasts',
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
          Card Collecting Podcasts
        </h1>
        <p className="text-gray-400 text-lg">
          The best podcasts for sports card and Pokemon collectors. Market analysis, product reviews, and hobby news.
        </p>
      </div>

      <PodcastDirectoryClient />

      {/* FAQ */}
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

      {/* Footer links */}
      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        <Link href="/creators" className="text-blue-400 hover:text-blue-300">Content Creators</Link>
        <span className="text-gray-700">|</span>
        <Link href="/news" className="text-blue-400 hover:text-blue-300">Hobby News</Link>
        <span className="text-gray-700">|</span>
        <Link href="/guides" className="text-blue-400 hover:text-blue-300">Collecting Guides</Link>
        <span className="text-gray-700">|</span>
        <Link href="/glossary" className="text-blue-400 hover:text-blue-300">Card Glossary</Link>
        <span className="text-gray-700">|</span>
        <Link href="/market-report" className="text-blue-400 hover:text-blue-300">Market Report</Link>
      </div>
    </div>
  );
}
