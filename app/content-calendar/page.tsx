import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import ContentCalendarClient from './ContentCalendarClient';

export const metadata: Metadata = {
  title: 'Content Calendar — What\'s Coming to CardVault | Editorial Hub',
  description: 'See what is coming to CardVault. Upcoming articles, tool launches, guides, player spotlights, and product drop previews. Timeline and grid views with category and status filters.',
  openGraph: {
    title: 'Content Calendar — CardVault Editorial Hub',
    description: 'What is coming to CardVault: articles, tools, guides, and features on the editorial roadmap.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Content Calendar — CardVault',
    description: 'See upcoming articles, tools, guides, and features. CardVault editorial roadmap.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Content Calendar' },
];

const faqItems = [
  {
    question: 'What is the Content Calendar?',
    answer: 'The Content Calendar is CardVault\'s editorial hub showing what content is published, in progress, and coming soon. Browse articles, tool launches, guides, player spotlights, product drop previews, and community events — all in one place. Switch between timeline and grid views.',
  },
  {
    question: 'How often is new content published?',
    answer: 'CardVault publishes new content multiple times per week. This includes market analysis articles, tool launches, collector guides, player spotlights, and product drop previews. Major features and tools are launched weekly.',
  },
  {
    question: 'Can I suggest content topics?',
    answer: 'Yes — the CardVault editorial team tracks what collectors want to read about. The most requested topics include grading company comparisons, rookie card investment guides, set-by-set break analyses, and seasonal market previews.',
  },
  {
    question: 'What content types are available?',
    answer: 'Six content types: Articles (market analysis, news, opinion), Tools (calculators, trackers, simulators), Guides (how-to, comparison, investment), Spotlights (player and collector profiles), Events (card shows, community activities), and Product Drops (new release previews and checklists).',
  },
];

export default function ContentCalendarPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Content Calendar — CardVault Editorial Hub',
        description: 'What is coming to CardVault: articles, tools, guides, and features on the editorial roadmap.',
        url: 'https://cardvault-two.vercel.app/content-calendar',
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
        <div className="inline-flex items-center gap-2 bg-purple-950/60 border border-purple-800/50 text-purple-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
          Articles - Tools - Guides - Spotlights - Events - Drops
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Content Calendar</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          See what is coming to CardVault. Browse upcoming articles, tool launches, collector guides, and product drop previews. Filter by type and status, switch between timeline and grid views.
        </p>
      </div>

      <ContentCalendarClient />

      {/* FAQ */}
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
