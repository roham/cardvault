import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import MarketCorrelationsClient from './MarketCorrelationsClient';

export const metadata: Metadata = {
  title: 'Card Market Correlations — What Moves Card Prices | CardVault',
  description: 'Understand what drives sports card prices. Explore 20+ market correlations: drafts, injuries, awards, seasons, media appearances, and more. Visual impact scores and timing guides for smart buying and selling.',
  openGraph: {
    title: 'Card Market Correlations — CardVault',
    description: 'What drives sports card prices? Explore 20+ correlations between events and card values.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Market Correlations — CardVault',
    description: 'Understand what moves card prices. 20+ market correlations with visual impact scores.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Market Analysis', href: '/market-report' },
  { label: 'Market Correlations' },
];

const faqItems = [
  {
    question: 'What events have the biggest impact on sports card prices?',
    answer: 'The NFL and NBA Drafts are the single biggest price catalysts, with rookie cards of top picks often spiking 200-500% from pre-draft to post-draft. Championship wins create 50-150% spikes for key players. Player injuries cause 20-40% drops that can be buying opportunities. Award announcements (MVP, ROY, All-Star selections) create 30-80% increases. Media appearances on mainstream outlets can drive 20-50% spikes from increased casual interest.',
  },
  {
    question: 'When is the best time to buy sports cards?',
    answer: 'The best buying windows are: (1) Off-season lows — football cards are cheapest in March-April, basketball cards in August-September. (2) Post-injury dips — when a star player gets injured, prices drop 20-40% and often recover within 1-2 seasons. (3) Pre-draft — before the draft, last year\'s rookie class prices stabilize at lower levels as attention shifts. (4) Summer doldrums — July is historically the lowest-volume month for card sales across all sports.',
  },
  {
    question: 'How do player injuries affect card values?',
    answer: 'The impact depends on injury severity and career stage. Minor injuries (2-4 weeks) cause 10-15% dips that recover quickly. Major injuries (ACL, Achilles) cause 25-40% drops that may take 6-12 months to recover. Career-threatening injuries for older players can cause permanent 50%+ declines. Young stars with serious injuries often present buying opportunities — examples: Zion Williamson, Joe Burrow, and Saquon Barkley all saw price recoveries after major injuries.',
  },
  {
    question: 'Do championship wins permanently increase card values?',
    answer: 'Championship wins create an initial 50-150% spike that typically settles back 30-50% within 3-6 months. However, the "new floor" is usually 20-40% higher than pre-championship levels. Multiple championships have a compounding effect — Patrick Mahomes\' cards have seen sustained increases with each Super Bowl win. The effect is strongest for the team\'s best player and Finals/Super Bowl MVP.',
  },
  {
    question: 'How does social media affect card prices?',
    answer: 'Viral moments can cause overnight price spikes of 50-200%. Examples: Steph Curry\'s 62-point game, Shohei Ohtani highlights, Travis Kelce\'s Taylor Swift connection. YouTube/TikTok box breaks featuring a card can increase demand for that specific card or product. Celebrity collectors (like Drake or Travis Scott) mentioning a player can drive prices. These social media-driven spikes are typically short-lived (1-2 weeks) unless backed by on-field performance.',
  },
];

export default function MarketCorrelationsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Market Correlations',
        description: 'Explore what drives sports card prices. Visual impact analysis of 20+ market correlations.',
        url: 'https://cardvault-two.vercel.app/market-correlations',
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
        <div className="inline-flex items-center gap-2 bg-violet-950/60 border border-violet-800/50 text-violet-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-violet-400 rounded-full" />
          Market Intelligence
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Card Market Correlations
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          What moves card prices? Explore 20+ correlations between real-world events and card market behavior. Every smart collector should understand these patterns.
        </p>
      </div>

      <MarketCorrelationsClient />

      {/* FAQ */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((f, i) => (
            <details key={i} className="group bg-gray-900/50 border border-gray-800 rounded-xl">
              <summary className="flex items-center justify-between cursor-pointer px-6 py-4 text-white font-medium">
                {f.question}
                <span className="ml-2 text-gray-500 group-open:rotate-180 transition-transform">&#9662;</span>
              </summary>
              <div className="px-6 pb-4 text-gray-400 text-sm leading-relaxed">
                {f.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Related */}
      <section className="mt-12 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Related Analysis</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/market-report', label: 'Weekly Market Report', icon: '📊' },
            { href: '/fear-greed', label: 'Fear & Greed Index', icon: '📈' },
            { href: '/sector-report', label: 'Sector Report', icon: '📋' },
            { href: '/tools/seasonality', label: 'Seasonality Guide', icon: '📅' },
            { href: '/market-heat-map', label: 'Market Heat Map', icon: '🗺️' },
            { href: '/power-rankings', label: 'Power Rankings', icon: '🏆' },
          ].map(t => (
            <Link
              key={t.href}
              href={t.href}
              className="flex items-center gap-2 px-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-xl text-sm text-gray-300 hover:text-white transition-colors"
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
