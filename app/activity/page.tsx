import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import ActivityFeedClient from './ActivityFeedClient';

export const metadata: Metadata = {
  title: 'Activity Feed — See What Collectors Are Doing | CardVault',
  description: 'The CardVault Activity Feed shows real-time collector activity: pack openings, card pulls, battle wins, trivia scores, streak milestones, and achievement unlocks from the community.',
  openGraph: {
    title: 'Activity Feed — CardVault',
    description: 'See what collectors are doing: pack opens, card pulls, battles, streaks, and achievements.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Activity Feed — CardVault',
    description: 'Real-time collector activity feed. Pack opens, pulls, battles, and more.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Activity Feed' },
];

const faqItems = [
  {
    question: 'What shows up in the Activity Feed?',
    answer: 'The feed shows collector activities including pack openings, card pulls, trivia scores, card battle wins, streak milestones, achievement unlocks, auction bids, watchlist additions, and collection shares from the community.',
  },
  {
    question: 'Is my activity visible to others?',
    answer: 'In the current prototype, your activities are visible in the feed alongside simulated community activity. Future versions will include privacy controls for what you share.',
  },
  {
    question: 'How do I get more activity?',
    answer: 'Use CardVault features daily: open packs, play trivia, battle cards, maintain your streak, earn achievements, and bid in auctions. Each action adds to your activity feed.',
  },
  {
    question: 'Can I filter the feed?',
    answer: 'Yes! Use the filter buttons at the top to see specific activity types like Packs, Battles, Trivia, or Streaks. You can also filter to see only your own activity.',
  },
];

export default function ActivityPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Activity Feed',
        description: 'Real-time activity feed showing collector actions across the CardVault platform.',
        url: 'https://cardvault-two.vercel.app/activity',
        applicationCategory: 'SocialNetworkingApplication',
        operatingSystem: 'Any',
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
        <div className="inline-flex items-center gap-2 bg-indigo-950/60 border border-indigo-800/50 text-indigo-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
          Live Feed
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Activity Feed</h1>
        <p className="text-gray-400 max-w-2xl">
          See what collectors are doing right now. Pack openings, card pulls, battle wins,
          streak milestones, and more from the CardVault community.
        </p>
      </div>

      <ActivityFeedClient />

      {/* FAQ */}
      <div className="mt-12 border-t border-gray-800/50 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <details key={i} className="group bg-gray-900/40 border border-gray-800/40 rounded-lg">
              <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-gray-200 hover:text-white transition-colors">
                {item.question}
              </summary>
              <div className="px-4 pb-3 text-sm text-gray-400 leading-relaxed">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
