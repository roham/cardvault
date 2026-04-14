import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import WeeklyChallenge from './WeeklyChallenge';

export const metadata: Metadata = {
  title: 'Weekly Card Challenge — Draft 5 Cards, Compete for the Best Score',
  description: 'Free weekly card collecting challenge. Draft 5 cards from this week\'s selection, lock in your picks, and see how your portfolio performs. New challenge every week!',
  openGraph: {
    title: 'Weekly Card Challenge — CardVault',
    description: 'Draft 5 cards. Lock in your picks. See how your portfolio performs. New challenge every week!',
    type: 'website',
  },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Weekly Challenge' },
];

export default function WeeklyChallengePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Weekly Card Challenge',
        description: 'Free weekly card collecting challenge. Draft 5 cards and compete for the best score.',
        url: 'https://cardvault-two.vercel.app/weekly-challenge',
        applicationCategory: 'Entertainment',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      }} />

      <div className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-red-500 bg-clip-text text-transparent mb-3">
          Weekly Challenge
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Draft 5 cards. Lock in your picks. See how your portfolio performs this week.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          New challenge every week. No account needed. Compete against yourself.
        </p>
      </div>

      <WeeklyChallenge />

      {/* Related */}
      <section className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">More Games</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <Link href="/tools/portfolio" className="block p-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-600 transition-colors">
            <h3 className="font-semibold text-white">Fantasy Portfolio</h3>
            <p className="text-sm text-gray-400 mt-1">Draft 5 cards with 7-day simulation.</p>
          </Link>
          <Link href="/tools/daily-pack" className="block p-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-600 transition-colors">
            <h3 className="font-semibold text-white">Daily Free Pack</h3>
            <p className="text-sm text-gray-400 mt-1">One free pack every day.</p>
          </Link>
          <Link href="/leaderboard" className="block p-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-600 transition-colors">
            <h3 className="font-semibold text-white">Leaderboards</h3>
            <p className="text-sm text-gray-400 mt-1">See where you rank globally.</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
