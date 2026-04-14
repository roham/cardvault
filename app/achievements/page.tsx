import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import AchievementsClient from './AchievementsClient';

export const metadata: Metadata = {
  title: 'Achievements — Unlock Badges by Exploring CardVault',
  description: 'Track your CardVault achievements. Earn badges for exploring cards, using tools, opening packs, and building your collection. How many can you unlock?',
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Achievements' },
];

export default function AchievementsPage() {
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://cardvault-two.vercel.app' },
      { '@type': 'ListItem', position: 2, name: 'Achievements' },
    ],
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={breadcrumbLd} />
      <Breadcrumb items={breadcrumbs} />

      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-purple-950/60 border border-purple-800/50 text-purple-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
          Track Your Progress
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Achievements</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Earn badges by exploring CardVault. View cards, use tools, open packs, and build your collection to unlock them all.
        </p>
      </div>

      <AchievementsClient />
    </div>
  );
}
