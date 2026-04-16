import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import RankOrTankClient from './RankOrTankClient';

export const metadata: Metadata = {
  title: 'Rank or Tank — Order 5 Cards by Value Before the Reveal | CardVault',
  description: 'A snap-judgment card valuation game. You get 5 random sports cards. Drag them from Most Valuable to Least Valuable. Every position you get right earns points; every swap you miss costs you. Your ordinal-accuracy grade becomes a collector archetype, a lifetime stat, and a shareable emoji-grid result.',
  openGraph: {
    title: 'Rank or Tank — CardVault',
    description: 'Can you rank 5 cards by value before the reveal? Snap-judgment game for hobby veterans.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Rank or Tank — CardVault',
    description: 'Rank 5 cards by value. Miss by one, you tank. Snap-judgment hobby game.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/games' },
  { label: 'Rank or Tank' },
];

export default function RankOrTankPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Game',
        name: 'Rank or Tank',
        description: 'Snap-judgment ordinal-ranking game: order 5 random cards by estimated value before the reveal.',
        url: 'https://cardvault-two.vercel.app/rank-or-tank',
        genre: 'Card valuation game',
      }} />

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-fuchsia-950/60 border border-fuchsia-800/50 text-fuchsia-300 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-fuchsia-400 rounded-full animate-pulse" />
          Ordinal-Ranking Game · Snap Judgment · 2 min
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Rank or Tank</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Five cards, ordered wrong. Drag them top-to-bottom by estimated value — Most Valuable up top, Least Valuable down bottom. Perfect call earns S-tier. One miss knocks you a grade. Two misses, you tank.
        </p>
      </div>

      <RankOrTankClient />
    </div>
  );
}
