import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import LeaderboardClient from './LeaderboardClient';

export const metadata: Metadata = {
  title: 'Leaderboards — Top Card Collectors & Challenge Scores',
  description: 'See who has the best weekly challenge scores and fantasy portfolio returns on CardVault. Compete against other collectors. Free, no account needed.',
  openGraph: {
    title: 'Leaderboards — CardVault',
    description: 'Who has the best card picks? Global leaderboards for weekly challenges and fantasy portfolios.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Leaderboards — CardVault',
    description: 'Compete against other collectors. Weekly challenges and fantasy portfolio rankings.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Leaderboards' },
];

export default function LeaderboardPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'CardVault Leaderboards',
        description: 'Global leaderboards for weekly card challenges and fantasy portfolio competitions.',
        url: 'https://cardvault-two.vercel.app/leaderboard',
      }} />

      <div className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500 bg-clip-text text-transparent mb-3">
          Leaderboards
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Compete against other collectors. See where you rank in weekly challenges and fantasy portfolios.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Your scores sync automatically from your games. No account needed.
        </p>
      </div>

      <LeaderboardClient />

      {/* Related */}
      <section className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Play Now</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <Link href="/weekly-challenge" className="block p-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-600 transition-colors">
            <h3 className="font-semibold text-white">Weekly Challenge</h3>
            <p className="text-sm text-gray-400 mt-1">Draft 5 cards, compete for the best score.</p>
          </Link>
          <Link href="/tools/portfolio" className="block p-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-600 transition-colors">
            <h3 className="font-semibold text-white">Fantasy Portfolio</h3>
            <p className="text-sm text-gray-400 mt-1">Build a portfolio and track performance.</p>
          </Link>
          <Link href="/achievements" className="block p-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-600 transition-colors">
            <h3 className="font-semibold text-white">Achievements</h3>
            <p className="text-sm text-gray-400 mt-1">Unlock badges for collecting milestones.</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
