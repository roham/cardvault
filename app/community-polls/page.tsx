import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CommunityPollsClient from './CommunityPollsClient';

export const metadata: Metadata = {
  title: 'Community Polls — Vote on Card Collecting Hot Takes | CardVault',
  description: 'Vote on the biggest debates in card collecting. PSA vs BGS? Modern vs vintage? Rip or hold? See where the community stands on 20+ collecting topics with live results.',
  openGraph: {
    title: 'Community Polls — CardVault',
    description: 'Vote on card collecting hot takes. See where the community stands.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Community Polls — CardVault',
    description: 'PSA vs BGS? Modern vs vintage? Vote and see the results.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Community', href: '/community-polls' },
  { label: 'Polls' },
];

const faqItems = [
  {
    question: 'How do Community Polls work?',
    answer: 'Each poll presents two options on a card collecting topic. Tap your choice to vote. Results update instantly showing the percentage split. A new poll is featured each day, and you can browse and vote on all polls at any time. Your votes are saved locally in your browser.',
  },
  {
    question: 'Can I change my vote?',
    answer: 'No — once you vote on a poll, your choice is locked in. This prevents vote manipulation and ensures results reflect genuine first impressions. Think carefully before you vote!',
  },
  {
    question: 'How are the daily featured polls chosen?',
    answer: 'The daily featured poll rotates through all available polls on a deterministic schedule. Every visitor sees the same featured poll on the same day. This creates a shared conversation topic for the collecting community.',
  },
  {
    question: 'Are these real community votes?',
    answer: 'Votes are stored locally in your browser. The displayed percentages represent simulated community sentiment based on common hobby perspectives, combined with your individual vote. Future versions may include server-side vote aggregation.',
  },
];

export default function CommunityPollsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Community Polls',
        description: 'Vote on the biggest debates in card collecting. 20+ polls on grading, investing, collecting, and sport preferences.',
        url: 'https://cardvault-two.vercel.app/community-polls',
        applicationCategory: 'EntertainmentApplication',
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
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-purple-950/60 border border-purple-800/50 text-purple-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
          Live Community Voting
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Community Polls</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Where does the hobby stand? Vote on 20+ card collecting debates and see how your opinions compare to the community.
        </p>
      </div>

      <CommunityPollsClient />

      {/* FAQ Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item) => (
            <div key={item.question} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-2">{item.question}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related Links */}
      <div className="mt-12 bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-white font-bold text-lg mb-4">Related Features</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/hobby-debates', label: 'Hobby Debates' },
            { href: '/myth-busters', label: 'Myth Busters' },
            { href: '/card-detective', label: 'Card Detective' },
            { href: '/trivia', label: 'Card Trivia' },
            { href: '/live-hub', label: 'Live Event Hub' },
            { href: '/news', label: 'Hobby News' },
            { href: '/leaderboard', label: 'Leaderboards' },
            { href: '/market-data', label: 'Market Data Room' },
          ].map(t => (
            <Link
              key={t.href}
              href={t.href}
              className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 rounded-lg text-xs font-medium transition-colors"
            >
              {t.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
