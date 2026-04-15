import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import GoalsClient from './GoalsClient';

export const metadata: Metadata = {
  title: 'Collection Goal Tracker — Set & Track Collecting Goals | CardVault',
  description: 'Set collecting goals and track your progress. Complete a set, reach a target value, collect all HOF rookies, or create custom goals. Visual progress bars, milestones, and celebrations. Free goal tracker for card collectors.',
  openGraph: {
    title: 'Collection Goal Tracker — CardVault',
    description: 'Set collecting goals, track progress, celebrate milestones. 8 goal templates + custom goals. Free.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Collection Goal Tracker — CardVault',
    description: 'Set and track your card collecting goals. 8 templates + custom goals. Free tool.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Vault', href: '/vault' },
  { label: 'Goal Tracker' },
];

const faqItems = [
  {
    question: 'How does the collection goal tracker work?',
    answer: 'Choose from 8 pre-built goal templates or create a custom goal. Each goal has a target (number of cards, dollar value, grade count, etc.) and tracks your progress with a visual bar. Update your progress manually as you acquire cards, reach milestones, or complete sub-goals. When you hit 100%, a celebration animation plays and the goal is marked complete. All data is saved locally in your browser.',
  },
  {
    question: 'What goal templates are available?',
    answer: 'Eight templates cover the most common collecting goals: Complete a Set (track cards in any set), Reach a Value Target (hit a dollar amount), HOF Rookie Collection (collect Hall of Fame rookie cards by sport), PSA 10 Club (accumulate gem mint slabs), One From Every Team (cover all 30-32 teams), Budget Master (stay under a monthly spending limit), Rainbow Chase (collect every parallel of one card), and Card Count Milestone (reach a total card count). You can also create fully custom goals.',
  },
  {
    question: 'Can I track multiple goals at once?',
    answer: 'Yes, there is no limit on active goals. Many collectors run 3-5 goals simultaneously — for example, a long-term set completion alongside a monthly budget goal and a grading target. The dashboard shows all active goals sorted by progress, so you can see at a glance what is closest to completion.',
  },
  {
    question: 'Is my goal data saved?',
    answer: 'All goal data is stored in your browser\'s local storage. It persists between visits on the same device and browser. To keep your goals across devices, use the export feature to save a backup, then import on another device. Clearing browser data will erase your goals, so export regularly if your goals are important to you.',
  },
  {
    question: 'What collecting goals should beginners set?',
    answer: 'Start with achievable, motivating goals: a card count milestone (collect 50 or 100 cards), a budget goal (spend under $100/month to build discipline), or a simple set completion (a base set from a recent year is affordable and satisfying). Avoid setting value-based goals too early — focus on learning what you enjoy collecting before chasing dollar amounts. As your collection grows, add more ambitious goals like HOF rookies or grading targets.',
  },
];

export default function GoalsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Collection Goal Tracker',
        description: 'Set and track card collecting goals with visual progress bars, milestones, and celebrations.',
        url: 'https://cardvault-two.vercel.app/vault/goals',
        applicationCategory: 'UtilitiesApplication',
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
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          8 Templates &middot; Custom Goals &middot; Progress Tracking &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Collection Goal Tracker
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl">
          Set collecting goals, track progress with visual meters, and celebrate when you hit milestones.
          Choose from 8 templates or create custom goals.
        </p>
      </div>

      <GoalsClient />

      {/* Related Tools */}
      <div className="mt-16 border-t border-zinc-800 pt-10">
        <h2 className="text-xl font-bold text-white mb-4">Related Vault Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/vault" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-emerald-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">My Vault</h3>
            <p className="text-xs text-zinc-500">View your full collection</p>
          </Link>
          <Link href="/vault/wishlist" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-emerald-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">Wishlist</h3>
            <p className="text-xs text-zinc-500">Cards you want with target prices</p>
          </Link>
          <Link href="/vault/analytics" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-emerald-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">Vault Analytics</h3>
            <p className="text-xs text-zinc-500">Collection stats and trends</p>
          </Link>
          <Link href="/vault/showcase" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-emerald-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">Collection Showcase</h3>
            <p className="text-xs text-zinc-500">Shareable visual gallery</p>
          </Link>
          <Link href="/tools/collection-report" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-emerald-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">Collection Report Card</h3>
            <p className="text-xs text-zinc-500">Grade your collection A+ to F</p>
          </Link>
          <Link href="/tools/set-completion" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-emerald-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">Set Completion Tracker</h3>
            <p className="text-xs text-zinc-500">Track progress on set builds</p>
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
