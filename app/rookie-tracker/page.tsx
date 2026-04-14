import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import RookieTracker from './RookieTracker';

export const metadata: Metadata = {
  title: 'Rookie Investment Tracker — Track Your Rookie Card Portfolio',
  description: 'Free rookie card investment tracker. Log purchases, track current values, see your P&L. Monitor your rookie card portfolio across baseball, basketball, football, hockey, and Pokemon.',
  openGraph: {
    title: 'Rookie Investment Tracker — CardVault',
    description: 'Track your rookie card investments. Log buys, update values, see your portfolio P&L.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Rookie Investment Tracker — CardVault',
    description: 'Track rookie card investments and portfolio P&L for free.',
  },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Rookie Investment Tracker' },
];

const faqItems = [
  {
    question: 'What is the Rookie Investment Tracker?',
    answer: 'The Rookie Investment Tracker is a free tool for tracking your rookie card investments. Add the cards you buy, their purchase price, current market value, and grade. The tracker calculates your total invested, total current value, and net profit or loss across your entire portfolio.',
  },
  {
    question: 'How do I know the current value of my cards?',
    answer: 'Use our Price Check tool or check eBay sold listings for recent comparable sales. Update your card values periodically (weekly or after major events) to keep your portfolio P&L accurate. The Flip Calculator can also help estimate net proceeds after fees.',
  },
  {
    question: 'Is my data saved?',
    answer: 'Yes — all data is stored locally on your device using localStorage. Your investments persist between visits and are never sent to any server. This also means your data is private to your device.',
  },
  {
    question: 'What makes a good rookie card investment?',
    answer: 'Look for players with proven performance (not just hype), buy in the off-season when prices dip, target PSA 10 or BGS 9.5 graded copies for blue-chip investments, and diversify across sports and price points. Use our Prospect Rankings and Grading ROI Calculator to inform your decisions.',
  },
];

export default function RookieTrackerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Rookie Card Investment Tracker',
        description: 'Free portfolio tracker for rookie card investments with P&L calculation.',
        url: 'https://cardvault-two.vercel.app/rookie-tracker',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      }} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map(item => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      }} />

      <div className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-3">
          Rookie Investment Tracker
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Track your rookie card investments. Log buys, update values, see your portfolio P&amp;L.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Free. Private. All data stays on your device.
        </p>
      </div>

      <RookieTracker />

      {/* FAQ */}
      <section className="mt-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <details key={i} className="group border border-gray-800 rounded-lg">
              <summary className="px-5 py-4 cursor-pointer text-gray-200 font-medium hover:text-white transition-colors">
                {item.question}
              </summary>
              <p className="px-5 pb-4 text-gray-400 text-sm leading-relaxed">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Related */}
      <section className="mt-12 max-w-3xl mx-auto">
        <h2 className="text-lg font-bold text-white mb-4">Related Tools</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { href: '/prospects', label: 'Prospect Rankings', icon: '📊' },
            { href: '/tools/flip-calc', label: 'Flip Calculator', icon: '💸' },
            { href: '/tools/grading-roi', label: 'Grading ROI', icon: '💰' },
            { href: '/tools/watchlist', label: 'Price Watchlist', icon: '👀' },
            { href: '/card-show', label: 'Card Show Companion', icon: '🏪' },
          ].map(t => (
            <Link
              key={t.href}
              href={t.href}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 rounded-xl text-sm font-medium transition-colors"
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
