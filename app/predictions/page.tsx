import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import PredictionMarkets from './PredictionMarkets';

export const metadata: Metadata = {
  title: 'Prediction Markets — Over/Under on Card Prices',
  description: 'Free card price prediction markets. Pick over or under on sports card prices, trends, and milestones. Track your prediction record. No money involved — just bragging rights.',
  openGraph: {
    title: 'Prediction Markets — CardVault',
    description: 'Pick over/under on card prices. Track your prediction record. Free to play.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Prediction Markets — CardVault',
    description: 'Over/under on card prices. Free prediction markets for collectors.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Prediction Markets' },
];

const faqItems = [
  {
    question: 'How do card prediction markets work?',
    answer: 'Each market presents a question about a card price, trend, or milestone — like "Will Player X PSA 10 exceed $500 by end of month?" You pick OVER or UNDER before the deadline. When the market resolves, your pick is scored and your record updated.',
  },
  {
    question: 'Is real money involved?',
    answer: 'No. CardVault prediction markets are completely free and for entertainment only. There is no wagering, no tokens, no currency of any kind. Your record tracks bragging rights and tests your card market knowledge.',
  },
  {
    question: 'How are markets resolved?',
    answer: 'Markets resolve based on simulated price movements derived from market data patterns. The odds shown represent estimated community sentiment, not actual probabilities. New markets are generated daily.',
  },
  {
    question: 'Can I see my prediction history?',
    answer: 'Yes. Your picks are saved locally in your browser. The stats bar shows your total picks, correct predictions, and accuracy rate. Switch to the "Resolved" tab to see past markets and whether you were right.',
  },
  {
    question: 'How often are new markets added?',
    answer: 'New prediction markets are generated daily based on current card market activity. Markets have different expiration windows ranging from 24 hours to end of month, so there are always fresh opportunities to make predictions.',
  },
];

export default function PredictionsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Prediction Markets — CardVault',
        description: 'Free card price prediction markets. Over/under on sports card prices and trends.',
        url: 'https://cardvault-two.vercel.app/predictions',
        applicationCategory: 'GameApplication',
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

      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-purple-950/60 border border-purple-800/50 text-purple-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
          Free to play &middot; New markets daily
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Prediction Markets</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Think you know where card prices are heading? Pick over or under on daily markets. Track your record. Prove you have the sharpest eye in the hobby.
        </p>
      </div>

      <PredictionMarkets />

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
        <div className="grid sm:grid-cols-3 gap-3">
          <Link href="/tools/market-dashboard" className="p-4 bg-gray-900/40 border border-gray-800 rounded-xl hover:border-gray-600 transition-colors">
            <h3 className="text-sm font-semibold text-white">Market Dashboard</h3>
            <p className="text-xs text-gray-400 mt-1">Real-time indices, movers, and alerts.</p>
          </Link>
          <Link href="/tools/portfolio" className="p-4 bg-gray-900/40 border border-gray-800 rounded-xl hover:border-gray-600 transition-colors">
            <h3 className="text-sm font-semibold text-white">Fantasy Portfolio</h3>
            <p className="text-xs text-gray-400 mt-1">Draft 5 cards and track performance.</p>
          </Link>
          <Link href="/flip-or-keep" className="p-4 bg-gray-900/40 border border-gray-800 rounded-xl hover:border-gray-600 transition-colors">
            <h3 className="text-sm font-semibold text-white">Flip or Keep</h3>
            <p className="text-xs text-gray-400 mt-1">Daily game — flip for cash or keep?</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
