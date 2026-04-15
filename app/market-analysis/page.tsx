import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import MarketAnalysisClient from './MarketAnalysisClient';

export const metadata: Metadata = {
  title: 'Daily Market Analysis — What Moved & Why | CardVault',
  description: 'AI-powered daily analysis of the sports card market. What moved today, why it moved, sport-by-sport breakdown, sector trends, and buying signals. Updated every day.',
  openGraph: {
    title: 'Daily Market Analysis — CardVault',
    description: 'What moved in the card market today? AI analysis of trends, movers, and opportunities.',
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: 'Daily Market Analysis — CardVault',
    description: 'Daily card market analysis. What moved and why.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'News', href: '/news' },
  { label: 'Daily Analysis' },
];

const faqItems = [
  {
    question: 'How is the daily analysis generated?',
    answer: 'Our AI engine analyzes price movements, volume changes, and market signals across 2,900+ sports cards every day. It identifies the biggest movers, explains why prices shifted, and highlights emerging trends.',
  },
  {
    question: 'When is the analysis updated?',
    answer: 'A fresh analysis is generated every day at midnight. The content reflects the previous trading day activity across eBay, auction houses, and major marketplaces.',
  },
  {
    question: 'Can I use this to make buying decisions?',
    answer: 'The analysis highlights trends and provides context, but all investment decisions carry risk. Use it as one input alongside your own research. Past performance does not guarantee future results.',
  },
  {
    question: 'What sports are covered?',
    answer: 'We analyze baseball, basketball, football, and hockey cards daily. Each sport gets its own sector breakdown with top movers and trend context.',
  },
];

export default function MarketAnalysisPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        name: 'Daily Card Market Analysis',
        description: 'AI-powered daily analysis of sports card price movements, trends, and market signals.',
        url: 'https://cardvault-two.vercel.app/market-analysis',
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
        <div className="inline-flex items-center gap-2 bg-blue-950/60 border border-blue-800/50 text-blue-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
          Updated daily · AI-powered
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Daily Market Analysis</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          What moved in the card market today — and why. AI-generated insights across baseball, basketball, football, and hockey.
        </p>
      </div>

      <MarketAnalysisClient />

      {/* FAQ */}
      <section className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <details key={i} className="group bg-gray-900/40 border border-gray-800 rounded-xl">
              <summary className="p-4 cursor-pointer text-white font-medium text-sm flex justify-between items-center">
                {item.question}
                <span className="text-gray-500 group-open:rotate-45 transition-transform text-lg">+</span>
              </summary>
              <div className="px-4 pb-4">
                <p className="text-sm text-gray-400 leading-relaxed">{item.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Related */}
      <section className="mt-10">
        <h2 className="text-lg font-bold text-white mb-4">Related</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link href="/market-movers" className="p-4 bg-gray-900/40 border border-gray-800 rounded-xl hover:border-gray-600 transition-colors">
            <h3 className="text-sm font-semibold text-white">Market Movers</h3>
            <p className="text-xs text-gray-400 mt-1">Today&#39;s top gainers and losers.</p>
          </Link>
          <Link href="/market-report" className="p-4 bg-gray-900/40 border border-gray-800 rounded-xl hover:border-gray-600 transition-colors">
            <h3 className="text-sm font-semibold text-white">Weekly Report</h3>
            <p className="text-xs text-gray-400 mt-1">Deep weekly analysis with sector trends.</p>
          </Link>
          <Link href="/tools/market-dashboard" className="p-4 bg-gray-900/40 border border-gray-800 rounded-xl hover:border-gray-600 transition-colors">
            <h3 className="text-sm font-semibold text-white">Market Dashboard</h3>
            <p className="text-xs text-gray-400 mt-1">Real-time indices, alerts, and data.</p>
          </Link>
          <Link href="/card-catalysts" className="p-4 bg-gray-900/40 border border-gray-800 rounded-xl hover:border-gray-600 transition-colors">
            <h3 className="text-sm font-semibold text-white">Price Catalysts</h3>
            <p className="text-xs text-gray-400 mt-1">Events that move card prices.</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
