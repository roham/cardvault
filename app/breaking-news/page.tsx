import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import BreakingNewsClient from './BreakingNewsClient';

export const metadata: Metadata = {
  title: 'Breaking News — Live Card Market Alerts & Price Spikes | CardVault',
  description: 'Real-time card market alerts: price spikes, record sales, grading news, rookie watch, and set releases. Live breaking news for sports card and Pokemon collectors. Updated throughout the day.',
  openGraph: {
    title: 'Breaking News — Live Card Market Alerts | CardVault',
    description: 'Real-time alerts for card collectors: price spikes, record sales, grading updates, and market movers.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Breaking News — CardVault',
    description: 'Live card market alerts: price spikes, record sales, grading news, and rookie watch.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'News', href: '/news' },
  { label: 'Breaking News' },
];

const faqItems = [
  {
    question: 'What are Breaking News Triggers?',
    answer: 'Breaking News Triggers are real-time alerts about significant events in the card collecting market. They cover six categories: price spikes (cards gaining value rapidly), record sales (new price records at auction), grading news (updates from PSA, BGS, CGC, SGC), market movers (broader market trends), rookie watch (trending rookie cards), and new set releases.',
  },
  {
    question: 'How often are alerts updated?',
    answer: 'Alerts are generated throughout the day based on market activity. The feed refreshes automatically every 5 minutes. Critical alerts (major price spikes over 35% and high-value record sales) are flagged prominently so you never miss significant market moves.',
  },
  {
    question: 'What do the severity levels mean?',
    answer: 'Critical alerts represent major market events — price spikes over 35%, record sales above $1,000, or breaking grading company news. High severity covers notable price movements (25-35%) and significant sales. Medium severity includes smaller price changes, routine grading updates, and set release announcements.',
  },
  {
    question: 'Can I filter alerts by sport or type?',
    answer: 'Yes. Use the type buttons at the top to filter by alert category (price spikes, record sales, etc.). Use the dropdown filters to narrow by sport (baseball, basketball, football, hockey) and severity level. Your filter preferences are saved in your browser.',
  },
  {
    question: 'How do price spike alerts work?',
    answer: 'Price spike alerts trigger when a card shows a significant percentage increase in recent sales or asking prices compared to its previous value. Each alert includes the percentage change, new estimated price, and the likely reason for the movement (game performance, trade news, award buzz, etc.).',
  },
];

export default function BreakingNewsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Breaking News — Card Market Alerts',
        description: 'Real-time card market alerts covering price spikes, record sales, grading news, and market trends.',
        url: 'https://cardvault-two.vercel.app/breaking-news',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Web',
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

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-red-950/60 border border-red-800/50 text-red-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
          Live Alerts - Price Spikes - Record Sales - Grading News - Rookie Watch
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Breaking News</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Real-time market alerts for card collectors. Price spikes, record sales, grading company updates, rookie card trends, and new set releases — all in one feed.
        </p>
      </div>

      <BreakingNewsClient />

      {/* FAQ Section */}
      <div className="mt-12 bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((item, i) => (
            <div key={i} className="border-b border-gray-700/50 pb-5 last:border-0 last:pb-0">
              <h3 className="text-white font-semibold mb-2">{item.question}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related pages */}
      <div className="mt-8 bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">More Market Intelligence</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link href="/news" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">📰</span>
            <div>
              <div className="text-white text-sm font-medium">News Feed</div>
              <div className="text-gray-500 text-xs">Full card collecting news</div>
            </div>
          </Link>
          <Link href="/market-analysis" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">📊</span>
            <div>
              <div className="text-white text-sm font-medium">Market Analysis</div>
              <div className="text-gray-500 text-xs">Daily market breakdown</div>
            </div>
          </Link>
          <Link href="/newsletter" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">📧</span>
            <div>
              <div className="text-white text-sm font-medium">The Morning Flip</div>
              <div className="text-gray-500 text-xs">Daily newsletter</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
