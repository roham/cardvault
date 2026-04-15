import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import MarketDataRoomClient from './MarketDataRoomClient';

export const metadata: Metadata = {
  title: 'Card Market Data Room — Sports Card Market Statistics & Analytics | CardVault',
  description: 'Comprehensive sports card market statistics. Total cards tracked, average values by sport and era, price distributions, top 25 most valuable cards, player rankings, and set analysis across baseball, basketball, football, and hockey.',
  openGraph: {
    title: 'Card Market Data Room — Sports Card Analytics | CardVault',
    description: 'Bloomberg for card collectors. Market stats, price distributions, era analysis, and rankings across 5,600+ sports cards.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Market Data Room — CardVault',
    description: 'Comprehensive sports card market data. 5,600+ cards analyzed across 4 sports.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Media', href: '/news' },
  { label: 'Market Data Room' },
];

const faqItems = [
  {
    question: 'What is the Card Market Data Room?',
    answer: 'The Card Market Data Room is a comprehensive analytics dashboard for the sports card market. It provides real-time statistics calculated from our database of 5,600+ sports cards across baseball, basketball, football, and hockey including price distributions, era analysis, sport breakdowns, and player/set rankings.',
  },
  {
    question: 'How are card values calculated?',
    answer: 'Card values are based on estimated market prices for both raw (ungraded) and gem mint (PSA 10/BGS 9.5) conditions. Values are sourced from recent eBay sales, auction results, and dealer pricing. The midpoint of the raw value range is used for statistical calculations throughout the Data Room.',
  },
  {
    question: 'What sports are covered in the Data Room?',
    answer: 'The Data Room covers all four major North American sports card markets: baseball (MLB), basketball (NBA/WNBA), football (NFL), and hockey (NHL). Each sport has its own breakdown showing card count, average values, top players, and most valuable cards.',
  },
  {
    question: 'How often is the market data updated?',
    answer: 'The Data Room statistics update automatically as new cards are added to the CardVault database. We add approximately 30 new cards per update cycle, covering new releases, vintage discoveries, and expanding player coverage.',
  },
  {
    question: 'Can I use this data for investment decisions?',
    answer: 'The Data Room provides market overview statistics that can inform collecting and investment decisions, but should not be the sole basis for purchases. Card values fluctuate based on player performance, market sentiment, and grading populations. Always do additional research and consider your personal budget and risk tolerance.',
  },
];

export default function MarketDataRoomPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Market Data Room — Sports Card Market Statistics',
        description: 'Comprehensive sports card market analytics dashboard with price distributions, era analysis, and rankings.',
        url: 'https://cardvault-two.vercel.app/market-data',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Any',
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
          Live Analytics &middot; 4 Sports &middot; 5,600+ Cards
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Market Data Room</h1>
        <p className="text-zinc-400 text-lg leading-relaxed">
          The Bloomberg terminal for card collectors. Comprehensive market statistics, price distributions,
          era analysis, and rankings across our entire database of sports cards.
        </p>
      </div>

      <MarketDataRoomClient />

      {/* FAQ */}
      <div className="mt-12 border-t border-zinc-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((f, i) => (
            <details key={i} className="group bg-zinc-900/50 border border-zinc-800 rounded-lg">
              <summary className="cursor-pointer p-4 text-white font-medium hover:text-emerald-400 transition-colors">
                {f.question}
              </summary>
              <p className="px-4 pb-4 text-zinc-400 text-sm leading-relaxed">{f.answer}</p>
            </details>
          ))}
        </div>
      </div>

      {/* Internal links */}
      <div className="mt-8 border-t border-zinc-800 pt-8">
        <h2 className="text-lg font-bold text-white mb-4">Related Market Tools</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/market-movers', label: 'Market Movers', desc: 'Daily gainers & losers' },
            { href: '/market-sentiment', label: 'Sentiment Index', desc: 'Fear & Greed gauge' },
            { href: '/market-pulse', label: 'Market Pulse', desc: 'Live activity feed' },
            { href: '/market-report-card', label: 'Report Card', desc: 'Quarterly sport grades' },
            { href: '/market-analysis', label: 'Market Analysis', desc: 'Weekly AI analysis' },
            { href: '/hot-right-now', label: 'Hot Right Now', desc: 'Trending dashboard' },
            { href: '/tools/price-history', label: 'Price History', desc: 'Card price charts' },
            { href: '/tools/heat-score', label: 'Heat Score', desc: 'Collection momentum' },
            { href: '/tools/investment-calc', label: 'Investment Calc', desc: 'ROI projections' },
          ].map(link => (
            <Link key={link.href} href={link.href} className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:border-emerald-800/50 transition-colors">
              <div className="text-white text-sm font-medium">{link.label}</div>
              <div className="text-zinc-500 text-xs">{link.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
