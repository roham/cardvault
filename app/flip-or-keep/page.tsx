import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import FlipOrKeepClient from './FlipOrKeepClient';

export const metadata: Metadata = {
  title: 'Flip or Keep — Daily Card Collecting Game',
  description: 'Daily card collecting mini-game. See 10 random sports cards and decide: flip for cash or keep for your collection? Track your streak, share your results, and play every day.',
  openGraph: {
    title: 'Flip or Keep — CardVault',
    description: 'Daily card game: 10 random cards, flip for cash or keep for your collection. New cards every day. Track your streak and share results.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Flip or Keep — CardVault',
    description: 'Daily card collecting game. Flip for cash or keep for your collection? 10 new cards every day.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Flip or Keep' },
];

export default function FlipOrKeepPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Flip or Keep — Daily Card Game',
        description: 'Daily card collecting mini-game. See 10 random sports cards and decide to flip for cash or keep for your collection.',
        url: 'https://cardvault-two.vercel.app/flip-or-keep',
        applicationCategory: 'GameApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      }} />

      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-purple-950/60 border border-purple-800/50 text-purple-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
          New cards daily
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Flip or Keep</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          10 random cards. Each one: flip it for cash or keep it for your collection. New cards every day.
        </p>
      </div>

      {/* How to play */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
          <div className="text-lg mb-1">&#127183;</div>
          <p className="text-white text-sm font-medium">See Card</p>
          <p className="text-gray-500 text-xs">Player, year, set</p>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
          <div className="text-lg mb-1">&#129300;</div>
          <p className="text-white text-sm font-medium">Decide</p>
          <p className="text-gray-500 text-xs">Flip or keep?</p>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
          <div className="text-lg mb-1">&#128200;</div>
          <p className="text-white text-sm font-medium">Score</p>
          <p className="text-gray-500 text-xs">Compare results</p>
        </div>
      </div>

      {/* Game */}
      <FlipOrKeepClient />

      {/* Bottom links */}
      <div className="mt-12 p-5 bg-gray-900/40 border border-gray-800 rounded-2xl">
        <h3 className="text-white font-semibold text-sm mb-3">More Daily Activities</h3>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/tools/daily-pack" className="text-emerald-400 hover:text-emerald-300 transition-colors">Daily Pack &rarr;</Link>
          <Link href="/trivia" className="text-emerald-400 hover:text-emerald-300 transition-colors">Card Trivia &rarr;</Link>
          <Link href="/rip-or-skip" className="text-emerald-400 hover:text-emerald-300 transition-colors">Rip or Skip &rarr;</Link>
          <Link href="/card-of-the-day" className="text-emerald-400 hover:text-emerald-300 transition-colors">Card of the Day &rarr;</Link>
          <Link href="/weekly-challenge" className="text-emerald-400 hover:text-emerald-300 transition-colors">Weekly Challenge &rarr;</Link>
          <Link href="/my-hub" className="text-emerald-400 hover:text-emerald-300 transition-colors">Collector Hub &rarr;</Link>
        </div>
      </div>
    </div>
  );
}
