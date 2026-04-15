import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import MarketIntelClient from './MarketIntelClient';

export const metadata: Metadata = {
  title: 'Hobby Insider: Card Market Intel Report — Institutional-Grade Market Analysis | CardVault',
  description: 'Institutional-grade sports card market intelligence. Money flow analysis, supply-demand signals, smart money positioning, sector rotation, risk assessment, and actionable intelligence across baseball, basketball, football, and hockey cards. Updated weekly.',
  openGraph: {
    title: 'Hobby Insider: Card Market Intel Report — CardVault',
    description: 'Institutional-grade card market intelligence. Money flow, supply signals, smart money moves, and risk assessment.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Hobby Insider: Card Market Intel Report — CardVault',
    description: 'Card market intelligence for serious collectors and investors.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Market Intel' },
];

const faqItems = [
  {
    question: 'What is the Card Market Intel Report?',
    answer: 'The Hobby Insider Intel Report is a weekly institutional-style market intelligence briefing for serious card collectors and investors. It covers five key areas: Money Flow (where capital is moving), Supply Picture (print runs, sealed product availability, population reports), Demand Signals (which sports, eras, and card types are heating up), Smart Money Moves (what sophisticated collectors and dealers are doing), and Risk Assessment (factors that could negatively impact card values). Think of it as a hedge fund research report, but for the card market.',
  },
  {
    question: 'How often is the intel report updated?',
    answer: 'The report uses deterministic data models that refresh daily based on the current date, season, and market cycle position. The sector rotation model tracks where each sport is in its annual demand cycle (peak season, off-season, transitional periods). Money flow indicators update based on seasonal patterns and known catalysts (drafts, playoffs, Hall of Fame announcements). Key signals shift throughout the week.',
  },
  {
    question: 'What does the confidence level mean?',
    answer: 'Each intelligence signal carries a confidence level from Low to Very High. Very High confidence signals are based on recurring seasonal patterns with years of historical precedent (e.g., football card demand peaks during NFL playoffs). High confidence signals are based on strong correlations but have more variables. Medium confidence signals reflect emerging trends that need more data points. Low confidence signals are early indicators that could go either way.',
  },
  {
    question: 'Who is this report for?',
    answer: 'The Intel Report is designed for serious collectors who treat cards as an asset class: flippers tracking arbitrage opportunities, investors building long-term positions, dealers making inventory decisions, and portfolio-minded collectors who want to understand macro trends. Beginners can learn from the market education sections, but the actionable intelligence targets experienced market participants.',
  },
  {
    question: 'Should I make buy/sell decisions based on this report?',
    answer: 'The Intel Report provides market context and identifies trends, but it is not financial advice. Card values are influenced by many unpredictable factors (injuries, scandals, viral moments). Use this report as one input alongside your own research, risk tolerance, and collecting goals. The signals highlight where to focus your attention, not what specific cards to buy or sell.',
  },
];

export default function MarketIntelPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Hobby Insider: Card Market Intel Report',
        description: 'Institutional-grade sports card market intelligence. Money flow, supply signals, smart money moves, and risk assessment.',
        url: 'https://cardvault-two.vercel.app/market-intel',
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
        <div className="inline-flex items-center gap-2 bg-indigo-950/60 border border-indigo-800/50 text-indigo-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          Weekly Intel &middot; 5 Sectors &middot; Risk Assessment
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Hobby Insider: Card Market Intel Report
        </h1>
        <p className="text-gray-400 text-lg">
          Institutional-grade market intelligence for serious card collectors and investors.
          Money flow, supply-demand signals, smart money positioning, and risk assessment.
        </p>
      </div>

      <MarketIntelClient />

      {/* FAQ */}
      <div className="mt-12 bg-gray-900/50 border border-gray-800/50 rounded-xl p-6 sm:p-8">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((faq, i) => (
            <div key={i}>
              <h3 className="font-semibold text-white mb-2">{faq.question}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related */}
      <div className="mt-8 grid sm:grid-cols-3 gap-4">
        <Link href="/market-weather" className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-4 hover:border-gray-700/60 transition-colors">
          <h3 className="font-semibold text-white mb-1">Market Weather</h3>
          <p className="text-gray-400 text-xs">Daily conditions at a glance</p>
        </Link>
        <Link href="/power-rankings" className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-4 hover:border-gray-700/60 transition-colors">
          <h3 className="font-semibold text-white mb-1">Power Rankings</h3>
          <p className="text-gray-400 text-xs">Top 10 cards per sport weekly</p>
        </Link>
        <Link href="/prospect-pipeline" className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-4 hover:border-gray-700/60 transition-colors">
          <h3 className="font-semibold text-white mb-1">Prospect Pipeline</h3>
          <p className="text-gray-400 text-xs">Hottest draft prospects to watch</p>
        </Link>
      </div>

      <div className="mt-8 text-center text-gray-600 text-xs">
        Market intelligence is for informational purposes only. Not financial advice. Card values can fluctuate significantly.
      </div>
    </div>
  );
}
