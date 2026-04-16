import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import ValueTrackerClient from './ValueTrackerClient';

export const metadata: Metadata = {
  title: 'Collection Value Tracker — Portfolio Growth Chart | CardVault',
  description: 'Track your card collection value over time with daily snapshots. SVG growth chart, 7-day change, all-time high, sport breakdown, and collection milestones. Monitor your portfolio like a pro investor.',
  openGraph: {
    title: 'Collection Value Tracker — CardVault',
    description: 'Track your card portfolio value over time. Growth chart, daily snapshots, sport breakdown, milestones.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Collection Value Tracker — CardVault',
    description: 'Track your card collection value over time with daily snapshots and growth charts.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'My Vault', href: '/vault' },
  { label: 'Value Tracker' },
];

const faqItems = [
  {
    question: 'What does the Collection Value Tracker do?',
    answer: 'The Collection Value Tracker monitors your card vault\'s total value over time. Take daily or weekly snapshots to build a value history, see growth charts, track 7-day and all-time performance, and view sport-by-sport breakdowns. It turns your card collection into a visual portfolio you can monitor like a stock portfolio.',
  },
  {
    question: 'How do I start tracking my collection value?',
    answer: 'First, add cards to your vault by opening packs in the Pack Store or adding cards manually. Then visit this page and click "Take Snapshot" to record your current vault value. Repeat daily or weekly to build a meaningful value history. The more snapshots you take, the more useful the growth chart becomes.',
  },
  {
    question: 'How accurate are the portfolio values?',
    answer: 'Values are based on estimated fair market prices in our database of 7,000+ cards. These are approximations based on recent sales data and market conditions. Actual values may vary based on card condition, grading, and current market demand. Use the tracker for directional trends rather than exact dollar amounts.',
  },
  {
    question: 'What are the collection milestones?',
    answer: 'Milestones track your collecting progress across two dimensions: card count (1, 10, 25, 50, 100 cards) and portfolio value ($1K, $5K, $10K). Each milestone shows a progress bar until achieved, then marks as complete. They give you goals to work toward as you build your collection.',
  },
  {
    question: 'Can I see my value broken down by sport?',
    answer: 'Yes! The Breakdown tab shows your portfolio value split across Baseball, Basketball, Football, and Hockey with visual progress bars. This helps you understand your collection\'s diversification and identify if you\'re over-concentrated in any single sport.',
  },
];

export default function ValueTrackerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Collection Value Tracker — Portfolio Growth Chart',
        description: 'Track your card collection value over time with daily snapshots, growth charts, sport breakdowns, and collection milestones.',
        url: 'https://cardvault-two.vercel.app/vault/value-tracker',
        applicationCategory: 'FinanceApplication',
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
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Collection Value Tracker</h1>
          <span className="text-xs bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 px-2 py-0.5 rounded-full">Beta</span>
        </div>
        <p className="text-gray-400 text-sm sm:text-base">
          Monitor your card portfolio like a pro investor. Take snapshots, track growth, and hit collection milestones.
        </p>
      </div>

      <ValueTrackerClient />

      {/* FAQ */}
      <div className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq) => (
            <details key={faq.question} className="group bg-gray-800/30 border border-gray-700/50 rounded-lg">
              <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-gray-200 hover:text-white transition-colors">
                {faq.question}
              </summary>
              <div className="px-4 pb-3 text-sm text-gray-400">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>

      {/* Back link */}
      <div className="mt-8 text-center">
        <Link href="/vault" className="text-emerald-400 hover:text-emerald-300 text-sm">
          &larr; Back to My Vault
        </Link>
      </div>
    </div>
  );
}
