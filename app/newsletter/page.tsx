import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import NewsletterClient from './NewsletterClient';

export const metadata: Metadata = {
  title: 'The Morning Flip — Daily Sports Card Newsletter | CardVault',
  description: 'The Morning Flip is a free daily newsletter for sports card collectors. Market movers, card of the day, flip alerts, collector intel, and what to watch — delivered every morning.',
  openGraph: {
    title: 'The Morning Flip — Daily Card Collecting Newsletter',
    description: 'Free daily newsletter: market movers, flip alerts, and collector intel for sports card enthusiasts.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'The Morning Flip — CardVault Newsletter',
    description: 'Daily market movers, flip alerts, and collecting intel. Free.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'The Morning Flip' },
];

const faqItems = [
  {
    question: 'What is The Morning Flip?',
    answer: 'The Morning Flip is a free daily newsletter for sports card collectors. It includes top market movers, the card of the day, collector tips, and a preview of what to watch in the hobby. Delivered every morning at 7 AM ET.',
  },
  {
    question: 'How much does the newsletter cost?',
    answer: 'The Morning Flip is completely free. No ads, no paid promotions, no affiliate links. Just data-driven market intelligence for card collectors.',
  },
  {
    question: 'What data powers the newsletter?',
    answer: 'The Morning Flip is powered by CardVault database of 3,300+ sports cards across baseball, basketball, football, and hockey. Price movements, movers, and alerts are generated from real market estimate data.',
  },
  {
    question: 'How do I unsubscribe?',
    answer: 'Every edition of The Morning Flip includes an unsubscribe link at the bottom. One click and you are removed immediately.',
  },
  {
    question: 'Can I share the newsletter?',
    answer: 'Absolutely! Each edition is also published at cardvault-two.vercel.app/newsletter so you can share the link with friends, on social media, or in card collecting forums.',
  },
];

export default function NewsletterPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'The Morning Flip — Daily Sports Card Newsletter',
        description: 'Free daily newsletter for sports card collectors with market movers, flip alerts, and collector intelligence.',
        url: 'https://cardvault-two.vercel.app/newsletter',
        publisher: {
          '@type': 'Organization',
          name: 'CardVault',
          url: 'https://cardvault-two.vercel.app',
        },
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

      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-amber-950/60 border border-amber-800/50 text-amber-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
          Daily at 7 AM ET
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">The Morning Flip</h1>
        <p className="text-gray-400 max-w-2xl">
          Your daily sports card market briefing. Top movers, flip alerts, card of the day,
          collector intel, and what to watch — all in one quick read.
        </p>
      </div>

      <NewsletterClient />

      {/* FAQ */}
      <div className="mt-12 border-t border-gray-800/50 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <details key={i} className="group bg-gray-900/40 border border-gray-800/40 rounded-lg">
              <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-gray-200 hover:text-white transition-colors">
                {item.question}
              </summary>
              <div className="px-4 pb-3 text-sm text-gray-400 leading-relaxed">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Related */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link href="/market-analysis" className="bg-gray-900/40 border border-gray-800/40 rounded-lg p-3 text-center hover:border-gray-700/50 transition-colors">
          <p className="text-lg mb-1">&#x1F4CA;</p>
          <p className="text-xs font-medium text-gray-300">Market Analysis</p>
        </Link>
        <Link href="/market-report" className="bg-gray-900/40 border border-gray-800/40 rounded-lg p-3 text-center hover:border-gray-700/50 transition-colors">
          <p className="text-lg mb-1">&#x1F4D1;</p>
          <p className="text-xs font-medium text-gray-300">Weekly Report</p>
        </Link>
        <Link href="/news" className="bg-gray-900/40 border border-gray-800/40 rounded-lg p-3 text-center hover:border-gray-700/50 transition-colors">
          <p className="text-lg mb-1">&#x1F4F0;</p>
          <p className="text-xs font-medium text-gray-300">Card News</p>
        </Link>
        <Link href="/tools/watchlist" className="bg-gray-900/40 border border-gray-800/40 rounded-lg p-3 text-center hover:border-gray-700/50 transition-colors">
          <p className="text-lg mb-1">&#x1F440;</p>
          <p className="text-xs font-medium text-gray-300">Price Watchlist</p>
        </Link>
      </div>
    </div>
  );
}
