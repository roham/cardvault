import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import StreakClient from './StreakClient';

export const metadata: Metadata = {
  title: 'Daily Streak Tracker — How Many Consecutive Days Can You Visit?',
  description: 'Track your daily visit streak on CardVault. Come back every day to build your streak, unlock milestones, and compete for the longest streak. Free daily engagement challenge.',
  alternates: { canonical: './' },
};

export default function StreakPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://cardvault-two.vercel.app' },
          { '@type': 'ListItem', position: 2, name: 'Daily Streak' },
        ],
      }} />
      <StreakClient />
    </div>
  );
}
