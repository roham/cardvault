import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import PowerRankingsClient from './PowerRankingsClient';

export const metadata: Metadata = {
  title: 'Card Market Power Rankings — Hottest Cards by Sport | CardVault',
  description: 'Weekly power rankings for the hottest sports cards. Top 10 cards per sport with movement arrows, trend reasons, and estimated values. Updated weekly. The ESPN Power Rankings of card collecting.',
  openGraph: {
    title: 'Card Market Power Rankings — CardVault',
    description: 'This week\'s hottest sports cards. Top 10 per sport with movement, reasons, and values.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Market Power Rankings — CardVault',
    description: 'Weekly power rankings for the hottest cards in baseball, basketball, football, and hockey.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Media', href: '/news' },
  { label: 'Power Rankings' },
];

const faqItems = [
  {
    question: 'How are the card power rankings determined?',
    answer: 'Rankings are based on a composite score combining recent price movement, search volume trends, player performance, and market activity (sales volume and auction results). Cards that are rising in value due to on-field performance, hobby buzz, or population report changes rank higher. Rankings update weekly to reflect the latest market dynamics.',
  },
  {
    question: 'What does the movement arrow mean?',
    answer: 'The arrow shows how a card\'s ranking changed from last week. A green up arrow means the card moved up in the rankings (gaining momentum). A red down arrow means it dropped. "NEW" means the card just entered the top 10 this week. "HOLD" means it stayed at the same rank.',
  },
  {
    question: 'Why do some cards keep appearing in the rankings?',
    answer: 'Certain cards are perennial top performers — think LeBron rookies, Wembanyama Prizm, or Ohtani Chrome. These cards maintain high rankings because of consistent demand, strong player performance, and deep collector interest. However, rankings shift with seasons: football cards dominate in fall, baseball in spring/summer, and basketball during playoffs.',
  },
  {
    question: 'How can I use power rankings to make buying decisions?',
    answer: 'Power rankings are best used as a market awareness tool, not a direct buying signal. Cards that are climbing fast may be near their peak (buying high). Better opportunities often come from watching cards that dropped out of the rankings — they may be undervalued. The "reason" column helps you judge whether a card\'s rise is sustainable (career milestone) or temporary (one-game performance).',
  },
  {
    question: 'Do the rankings cover all sports equally?',
    answer: 'Each sport has its own independent top 10, so yes — baseball, basketball, football, and hockey each get equal coverage. However, overall market activity varies by season. Football card trading peaks August through February, baseball from February through October, and basketball during the NBA season and draft. Rankings reflect these seasonal patterns.',
  },
];

export default function PowerRankingsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Market Power Rankings',
        description: 'Weekly power rankings for the hottest sports cards by sport.',
        url: 'https://cardvault-two.vercel.app/power-rankings',
        applicationCategory: 'UtilitiesApplication',
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
        <div className="inline-flex items-center gap-2 bg-amber-950/60 border border-amber-800/50 text-amber-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
          Updated Weekly &middot; 4 Sports &middot; Top 10 Per Sport
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Card Market Power Rankings
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl">
          This week&apos;s hottest cards across all four major sports. Movement arrows, trend reasons,
          and estimated values — the ESPN Power Rankings of card collecting.
        </p>
      </div>

      <PowerRankingsClient />

      {/* Related Media */}
      <div className="mt-16 border-t border-zinc-800 pt-10">
        <h2 className="text-xl font-bold text-white mb-4">More Market Intel</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/market-movers" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-amber-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">Market Movers</h3>
            <p className="text-xs text-zinc-500">Daily gainers and decliners</p>
          </Link>
          <Link href="/market-heatmap" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-amber-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">Market Heat Map</h3>
            <p className="text-xs text-zinc-500">Visual temperature grid</p>
          </Link>
          <Link href="/market-weather" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-amber-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">Market Weather</h3>
            <p className="text-xs text-zinc-500">Today&apos;s market conditions</p>
          </Link>
          <Link href="/market-pulse" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-amber-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">Market Pulse</h3>
            <p className="text-xs text-zinc-500">Live activity dashboard</p>
          </Link>
          <Link href="/market-data" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-amber-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">Data Room</h3>
            <p className="text-xs text-zinc-500">Comprehensive market stats</p>
          </Link>
          <Link href="/market-report-card" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-amber-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">Report Card</h3>
            <p className="text-xs text-zinc-500">Quarterly sport grades</p>
          </Link>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-16 border-t border-zinc-800 pt-10">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((faq) => (
            <div key={faq.question}>
              <h3 className="font-semibold text-white mb-2">{faq.question}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
