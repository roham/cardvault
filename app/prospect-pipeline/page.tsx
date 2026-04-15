import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import ProspectPipelineClient from './ProspectPipelineClient';

export const metadata: Metadata = {
  title: 'Prospect Pipeline — 2025 Draft Prospects to Collect | CardVault',
  description: 'Track the hottest prospects across NFL, NBA, MLB, and NHL for card collectors. Draft projections, key cards to buy, risk levels, and card market impact analysis. Get ahead of the market.',
  openGraph: {
    title: 'Prospect Pipeline — CardVault',
    description: 'The hottest 2025 draft prospects for card collectors. Which rookies to buy now before prices spike.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Prospect Pipeline — CardVault',
    description: '2025 draft prospects ranked by card collecting potential. NFL, NBA, MLB, NHL.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Media', href: '/news' },
  { label: 'Prospect Pipeline' },
];

const faqItems = [
  {
    question: 'What is the Prospect Pipeline?',
    answer: 'The Prospect Pipeline is a curated tracker of the most collectible prospects across the NFL, NBA, MLB, and NHL. Each prospect is rated by heat level (must-watch to sleeper), risk level, and includes specific card recommendations, market impact analysis, and a bull case for their collecting upside. It is designed to help you get ahead of the market before draft night price spikes.',
  },
  {
    question: 'When should I buy prospect cards?',
    answer: 'The best time to buy is before draft night. Card prices typically spike 20-50% when a player is drafted, especially for top picks. The second best window is during a rookie slump — if a player struggles early, prices dip and patient collectors can buy at a discount. The worst time to buy is immediately after a breakout game, when prices are inflated by hype.',
  },
  {
    question: 'What are the best prospect card products to buy?',
    answer: 'For football, Bowman University Chrome and Panini Prizm Draft Picks are the key products. For basketball, Panini Prizm Draft Picks. For baseball, Bowman Chrome is the gold standard for prospect cards. For hockey, Upper Deck Series 1 Young Guns is the flagship rookie card product. Chrome and Prizm parallels hold the most long-term value.',
  },
  {
    question: 'How is the heat level determined?',
    answer: 'Heat level is based on a combination of draft projection, hobby buzz, card availability, and market trajectory. FIRE means the player is generating massive collector interest and prices are moving fast. HOT means strong demand with upward price momentum. WARM means growing interest worth monitoring. WATCH means early-stage prospect with future potential.',
  },
  {
    question: 'How risky is investing in prospect cards?',
    answer: 'Prospect cards are inherently speculative. Even consensus #1 picks can bust — Anthony Bennett, Markelle Fultz, and Sam Darnold were all top picks whose card values cratered. To manage risk, diversify across multiple prospects and sports, focus on chrome and prizm base cards rather than expensive parallels, and never invest more than you can afford to lose. The upside is significant: a $5 base RC of a future MVP can become a $500 card.',
  },
];

export default function ProspectPipelinePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Prospect Pipeline',
        description: 'Track the hottest draft prospects across 4 sports for card collecting. Heat levels, risk ratings, key cards, and market impact analysis.',
        url: 'https://cardvault-two.vercel.app/prospect-pipeline',
        applicationCategory: 'ReferenceApplication',
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
        <div className="inline-flex items-center gap-2 bg-red-950/60 border border-red-800/50 text-red-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
          2025 Draft Classes &middot; 4 Sports &middot; Updated Weekly
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Prospect Pipeline
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl">
          The hottest draft prospects for card collectors. Heat levels, risk ratings,
          key cards to buy, and market impact analysis — across NFL, NBA, MLB, and NHL.
          Get ahead of the market before prices spike.
        </p>
      </div>

      <ProspectPipelineClient />

      {/* Related Pages */}
      <div className="mt-16 border-t border-zinc-800 pt-10">
        <h2 className="text-xl font-bold text-white mb-4">Related Resources</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/draft-hub" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-red-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">Draft Hub</h3>
            <p className="text-xs text-zinc-500">Live draft companion with card values</p>
          </Link>
          <Link href="/draft-war-room" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-red-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">Draft War Room</h3>
            <p className="text-xs text-zinc-500">Build your draft night portfolio</p>
          </Link>
          <Link href="/tools/draft-predictor" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-red-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">Draft Night Predictor</h3>
            <p className="text-xs text-zinc-500">Card value predictions by draft position</p>
          </Link>
          <Link href="/power-rankings" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-red-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">Power Rankings</h3>
            <p className="text-xs text-zinc-500">This week&apos;s hottest cards by sport</p>
          </Link>
          <Link href="/rookies" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-red-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">Rookie Cards</h3>
            <p className="text-xs text-zinc-500">Browse all rookie cards in the database</p>
          </Link>
          <Link href="/tools/rookie-finder" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-red-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">Rookie Finder</h3>
            <p className="text-xs text-zinc-500">Search and filter rookie card inventory</p>
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
