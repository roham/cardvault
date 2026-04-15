import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import MilestoneTracker from './MilestoneTracker';

export const metadata: Metadata = {
  title: 'Player Milestone Tracker — Card Value Catalysts for Sports Card Investors',
  description: 'Track athletes approaching career milestones that spike card values. Ovechkin chasing Gretzky, LeBron scoring records, Ohtani 500 HR watch — know which milestones are next and which cards to buy before the spike.',
  openGraph: {
    title: 'Player Milestone Tracker — CardVault',
    description: 'Which players are about to hit career milestones? Track the catalysts that spike card values.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Player Milestone Tracker — CardVault',
    description: 'Track player milestones that move card markets. Buy before the spike.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Milestone Tracker' },
];

const faqItems = [
  {
    question: 'How do player milestones affect card values?',
    answer: 'Career milestones create short-term demand spikes of 20-100%+ depending on the significance. When Alex Ovechkin scores his 895th goal to pass Wayne Gretzky, his cards will spike dramatically. The key is buying BEFORE the milestone hits — cards appreciate as the milestone approaches, then spike on the day, then often settle 20-30% below the peak within 2-4 weeks.',
  },
  {
    question: 'When should I buy cards before a milestone?',
    answer: 'The best time to buy is 2-6 months before the projected milestone date, when prices are still near baseline. As the milestone approaches (within 1 month), prices start climbing due to media attention. Buy early, sell into the spike, and avoid being the last buyer after the milestone hits.',
  },
  {
    question: 'Which milestones have the biggest impact on card values?',
    answer: 'The biggest spikes come from: (1) All-time records (Gretzky goal record, career HR record), (2) Round-number milestones (500 HR, 3000 hits, 1000 points), (3) Championships (Super Bowl, NBA Finals, Stanley Cup), and (4) Award wins (MVP, Cy Young, Heisman). All-time records can create permanent 50-100% price increases, while round numbers typically spike 20-50% and fade.',
  },
  {
    question: 'Do milestones affect rookie cards differently than base cards?',
    answer: 'Yes — rookie cards see the largest percentage gains from milestones because they are the most collected and most liquid. A player PSA 10 Prizm rookie might spike 40-60% on a milestone, while their base card from the same year might only move 10-20%. Autograph and numbered parallel cards also see strong spikes due to lower supply.',
  },
  {
    question: 'How long do milestone-driven card price spikes last?',
    answer: 'Most milestone spikes last 1-3 weeks. The pattern is: prices climb 2-4 weeks before the milestone, spike 20-100% on the day it happens, hold for 3-7 days of celebration/media coverage, then gradually decline over 2-3 weeks to a new baseline that is typically 10-25% above pre-milestone levels. All-time records can create permanent price increases.',
  },
];

export default function MilestoneTrackerPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Player Milestone Tracker',
        description: 'Track athletes approaching career milestones that spike sports card values. Projected dates, card impact ratings, and buy/sell signals for card investors.',
        url: 'https://cardvault-two.vercel.app/tools/milestone-tracker',
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
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Live Tracking &middot; 4 Sports &middot; Card Impact Ratings &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Player Milestone Tracker</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Track athletes approaching career milestones that spike card values. Buy before the milestone, sell into the spike. Know which cards to watch and when to act.
        </p>
      </div>

      <MilestoneTracker />

      {/* FAQ */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((f, i) => (
            <div key={i} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
              <h3 className="font-semibold text-white mb-2">{f.question}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 pt-8 border-t border-gray-800">
        <p className="text-gray-500 text-sm">
          Check the <a href="/tools/seasonality" className="text-emerald-400 hover:underline">market seasonality guide</a>,{' '}
          analyze <a href="/tools/investment-calc" className="text-emerald-400 hover:underline">card investment returns</a>,{' '}
          track <a href="/tools/watchlist" className="text-emerald-400 hover:underline">card prices on your watchlist</a>, or{' '}
          see <a href="/tools/prospect-tracker" className="text-emerald-400 hover:underline">prospect pipeline updates</a>.
        </p>
      </section>
    </div>
  );
}
