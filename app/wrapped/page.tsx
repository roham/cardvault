import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import WrappedClient from './WrappedClient';

export const metadata: Metadata = {
  title: 'Your 2025 Collecting Wrapped — Season Recap | CardVault',
  description: 'Your personalized card collecting season in review. See your packs opened, games played, tools used, streaks, and discover your collector personality. Share your Wrapped card with friends.',
  openGraph: {
    title: 'My 2025 Collecting Wrapped — CardVault',
    description: 'My personalized card collecting season recap. Packs opened, games played, streaks, and more.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'My 2025 Collecting Wrapped — CardVault',
    description: 'See my card collecting season in review on CardVault.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'My Hub', href: '/my-hub' },
  { label: 'Wrapped' },
];

const faqItems = [
  {
    question: 'How does CardVault Wrapped work?',
    answer: 'CardVault Wrapped reads your activity data stored locally in your browser. This includes packs opened, games played, tools used, achievements earned, and streak data. All data stays on your device — nothing is sent to any server. The feature compiles your stats into a personalized, shareable recap of your collecting season.',
  },
  {
    question: 'Why are my stats low or empty?',
    answer: 'Your Wrapped stats are based on activity tracked in your browser localStorage. If you recently cleared your browser data, used a different browser, or are new to CardVault, your stats will reflect only what has been tracked since. The more you use CardVault — opening packs, playing games, using tools — the richer your Wrapped will be.',
  },
  {
    question: 'Can I share my Wrapped results?',
    answer: 'Yes! After viewing your full Wrapped recap, you will see a shareable summary card with your top stats and collector personality type. You can copy the text to share on social media or with friends. Your Wrapped is unique to your activity so no two collectors will have the same results.',
  },
  {
    question: 'When does Wrapped reset?',
    answer: 'Wrapped pulls from all your cumulative CardVault activity. As you continue using the platform — opening more packs, playing more games, hitting longer streaks — your stats will grow. Think of it as a living recap that gets richer over time, not a one-time annual snapshot.',
  },
  {
    question: 'What is my collector personality type?',
    answer: 'Based on your usage patterns, Wrapped assigns you one of 8 collector personality types: The Ripper (loves opening packs), The Grinder (daily engagement), The Analyst (tools-focused), The Gamer (plays all the games), The Completionist (high achievement count), The Flipper (trade and value focused), The Scholar (guides and content), or The Legend (does everything). Your type reflects how you actually use CardVault.',
  },
];

export default function WrappedPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Wrapped — Your Collecting Season in Review',
        description: 'Personalized card collecting season recap with stats, personality type, and shareable results.',
        url: 'https://cardvault-two.vercel.app/wrapped',
        applicationCategory: 'EntertainmentApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
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
        <div className="inline-flex items-center gap-2 bg-purple-950/60 border border-purple-800/50 text-purple-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
          Feature #100 &middot; Your Season in Review
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Your 2025 Collecting Wrapped
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl">
          Your personalized card collecting season in review. See every pack ripped,
          every game played, every streak earned &mdash; and discover your collector personality type.
        </p>
      </div>

      <WrappedClient />

      {/* Related Features */}
      <div className="mt-16 border-t border-zinc-800 pt-10">
        <h2 className="text-xl font-bold text-white mb-4">Boost Your Stats</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/tools/pack-sim" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-purple-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">Pack Simulator</h3>
            <p className="text-xs text-zinc-500">Rip packs from 20+ products</p>
          </Link>
          <Link href="/tools/daily-pack" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-purple-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">Daily Pack</h3>
            <p className="text-xs text-zinc-500">Free pack every day</p>
          </Link>
          <Link href="/streak" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-purple-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">Streak Tracker</h3>
            <p className="text-xs text-zinc-500">Build your visit streak</p>
          </Link>
          <Link href="/achievements" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-purple-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">Achievements</h3>
            <p className="text-xs text-zinc-500">Unlock 24 badges</p>
          </Link>
          <Link href="/trivia" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-purple-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">Daily Trivia</h3>
            <p className="text-xs text-zinc-500">Test your card knowledge</p>
          </Link>
          <Link href="/my-hub" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-purple-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">Collector Hub</h3>
            <p className="text-xs text-zinc-500">Your personal dashboard</p>
          </Link>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-16 border-t border-zinc-800 pt-10">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((faq) => (
            <div key={faq.question}>
              <h3 className="font-semibold text-white mb-2">{faq.question}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
