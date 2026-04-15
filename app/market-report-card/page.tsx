import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import MarketReportCardClient from './MarketReportCardClient';

export const metadata: Metadata = {
  title: 'Card Market Report Card — Q1 2026 Sports Card Market Grades | CardVault',
  description: 'Quarterly letter grades for every sports card market. Baseball, basketball, football, hockey — see which markets are hot (A+) and which are cooling (C-). Top movers, trends, and investment outlook updated quarterly.',
  openGraph: {
    title: 'Card Market Report Card — Q1 2026 | CardVault',
    description: 'Quarterly grades for every card market. Which sports are hot? Which are cooling? Market analysis updated quarterly.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Market Report Card — CardVault',
    description: 'Baseball: A-. Basketball: B+. Football: A. Hockey: B-. See the full quarterly grades.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Media', href: '/news' },
  { label: 'Market Report Card' },
];

const faqItems = [
  {
    question: 'How are the card market grades determined?',
    answer: 'Grades are based on a composite of market momentum (price trends across top cards), collector demand (search volume, social media activity), new releases impact (how new products are performing), and investment outlook (3-6 month projection). Each factor is weighted and combined into a letter grade from A+ (exceptional) to F (severe decline).',
  },
  {
    question: 'How often is the Card Market Report Card updated?',
    answer: 'The report card is updated quarterly — at the start of each new quarter. Each update reflects the previous quarter\'s market performance and trends, with forward-looking projections for the next 3 months.',
  },
  {
    question: 'What does each letter grade mean?',
    answer: 'A+/A = Exceptional market, strong appreciation across the board. B+/B = Solid market with healthy demand. C+/C = Mixed signals, some segments up and others down. D = Declining market with falling prices. F = Severe market correction. Most sports grade between B- and A in typical quarters.',
  },
  {
    question: 'Which sport is the best card investment right now?',
    answer: 'The report card helps you compare across sports, but the best investment depends on your timeline and risk tolerance. Football cards tend to spike around the draft and season start. Baseball peaks during the World Series. Basketball has year-round demand. Hockey is often undervalued relative to star power.',
  },
  {
    question: 'How can I use the Market Report Card for collecting decisions?',
    answer: 'Use the grades to time your buying and selling. Buy when grades are lower (B- or C range) as prices may be depressed. Consider selling or holding when grades are A or A+ as the market may be peaking. The "Top Movers" section highlights specific cards driving each market.',
  },
];

export default function MarketReportCardPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Card Market Report Card — Q1 2026 Sports Card Market Grades',
        description: 'Quarterly letter grades for every sports card market with analysis and investment outlook.',
        url: 'https://cardvault-two.vercel.app/market-report-card',
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
          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
          Quarterly Analysis &middot; 4 Sports &middot; Updated Q1 2026
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Market Report Card</h1>
        <p className="text-zinc-400 text-lg leading-relaxed">
          Quarterly letter grades for every sports card market. See which categories are hot,
          which are cooling, and where the smart money is moving.
        </p>
      </div>

      <MarketReportCardClient />

      {/* FAQ */}
      <section className="mt-16 border-t border-zinc-800 pt-10">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((faq, i) => (
            <details key={i} className="group">
              <summary className="cursor-pointer text-zinc-300 font-medium hover:text-white transition-colors">
                {faq.question}
              </summary>
              <p className="mt-2 text-zinc-500 text-sm leading-relaxed pl-4 border-l border-zinc-800">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Internal links */}
      <section className="mt-12 border-t border-zinc-800 pt-8">
        <h2 className="text-lg font-bold text-white mb-4">More Market Analysis</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/market-analysis', label: 'Daily Market Analysis' },
            { href: '/market-movers', label: 'Market Movers' },
            { href: '/market-pulse', label: 'Market Pulse' },
            { href: '/market-sentiment', label: 'Market Sentiment' },
            { href: '/hot-right-now', label: 'Hot Right Now' },
            { href: '/hobby-debates', label: 'Hobby Debates' },
            { href: '/card-catalysts', label: 'Card Catalysts' },
            { href: '/tools/seasonality', label: 'Seasonality Guide' },
            { href: '/news', label: 'Card News' },
          ].map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-zinc-400 hover:text-white bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-center transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
