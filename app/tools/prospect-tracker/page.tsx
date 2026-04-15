import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import ProspectTracker from './ProspectTracker';

export const metadata: Metadata = {
  title: 'Prospect Pipeline Tracker — Top Card Prospects Across All Sports',
  description: 'Track the hottest prospects in baseball, basketball, football, and hockey. See key cards, estimated values, hype levels, ceiling grades, and scouting notes for the next generation of stars. Updated for 2025.',
  openGraph: {
    title: 'Prospect Pipeline Tracker — CardVault',
    description: 'Top prospects across MLB, NBA, NFL, and NHL. Key cards, values, and scouting notes.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Prospect Pipeline Tracker — CardVault',
    description: 'Track the hottest card prospects across all 4 major sports. Updated for 2025.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Prospect Pipeline Tracker' },
];

const faqItems = [
  {
    question: 'What makes a good prospect card investment?',
    answer: 'The best prospect card investments combine elite talent ceiling, a clear path to the majors/NFL/NBA/NHL, and affordable entry prices. Look for Bowman Chrome 1st Bowman cards in baseball, Panini Prizm Draft RCs in football, and Upper Deck Young Guns in hockey. Buy before the player arrives — prices spike dramatically on debut and first big performance.',
  },
  {
    question: 'When should I buy prospect cards?',
    answer: 'The ideal time to buy is after the draft but before the pro debut — this is when prices are lowest for top prospects. Baseball prospects have the longest timeline (1-3 years in minors), giving you more buying windows. Football and basketball prospects debut immediately, so the pre-draft card market moves fast.',
  },
  {
    question: 'What is "hype level" and how is it calculated?',
    answer: 'Hype level (1-10) reflects the current market buzz around a prospect based on social media mentions, card sales volume, price trends, and media coverage. A 10/10 means the player is dominating card hobby discussion. High hype can mean cards are overpriced — look for prospects with high ceiling but moderate hype for the best value.',
  },
  {
    question: 'What do the ceiling tiers mean for card values?',
    answer: 'Generational prospects (1 per decade) have the highest long-term value — think Wembanyama, Bedard, Celebrini. Star-ceiling prospects become multi-time All-Stars with strong but not record-breaking card values. Starter-ceiling prospects have cards that peak around their best season. Role Player cards rarely appreciate.',
  },
  {
    question: 'How risky are prospect card investments?',
    answer: 'Very risky. Even top-5 picks bust regularly — roughly 30-40% of top-10 picks in any sport fail to meet expectations. Injuries, off-field issues, and underperformance can tank card values. Diversify across multiple prospects and sports. Never invest more than you can afford to lose. Prospect cards are speculation, not investment.',
  },
];

export default function ProspectTrackerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Prospect Pipeline Tracker — Top Card Prospects',
        description: 'Track the hottest prospects across MLB, NBA, NFL, and NHL. Key cards, values, scouting notes, and hype levels.',
        url: 'https://cardvault-two.vercel.app/tools/prospect-tracker',
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
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          MLB &middot; NBA &middot; NFL &middot; NHL &middot; Updated 2025
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Prospect Pipeline Tracker</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          The next generation of card hobby stars. Track top prospects across all four major sports with key cards, estimated values, hype levels, and scouting reports.
        </p>
      </div>

      <ProspectTracker />

      {/* FAQ */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-900/80 border border-gray-800 rounded-lg">
              <summary className="flex items-center justify-between cursor-pointer p-4 text-white font-medium">
                {faq.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform">&#x25BC;</span>
              </summary>
              <div className="px-4 pb-4 text-gray-400 text-sm">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>

      {/* Internal Links */}
      <div className="mt-12 pt-8 border-t border-gray-800">
        <h2 className="text-lg font-semibold text-white mb-4">More Prospect & Investment Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link href="/tools/draft-predictor" className="block p-4 bg-gray-900/80 border border-gray-800 rounded-lg hover:border-gray-600 transition-colors">
            <div className="text-white font-medium mb-1">2025 Draft Predictor</div>
            <div className="text-gray-400 text-sm">Which rookies&apos; cards will spike?</div>
          </Link>
          <Link href="/tools/investment-calc" className="block p-4 bg-gray-900/80 border border-gray-800 rounded-lg hover:border-gray-600 transition-colors">
            <div className="text-white font-medium mb-1">Investment Calculator</div>
            <div className="text-gray-400 text-sm">Track returns vs S&P 500 and gold</div>
          </Link>
          <Link href="/tools/rarity-score" className="block p-4 bg-gray-900/80 border border-gray-800 rounded-lg hover:border-gray-600 transition-colors">
            <div className="text-white font-medium mb-1">Rarity Score Calculator</div>
            <div className="text-gray-400 text-sm">How rare is your card? 0-100 score</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
