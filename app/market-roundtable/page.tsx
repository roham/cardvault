import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import MarketRoundtableClient from './MarketRoundtableClient';

export const metadata: Metadata = {
  title: 'Card Market Roundtable — Daily Debate Panel | CardVault',
  description: 'Watch 5 AI analysts debate today\'s hottest card market topics. The Bull, The Bear, The Veteran, The Flipper, and The Newcomer argue their positions — then vote for who you agree with. New topic daily across MLB, NFL, NBA, and NHL.',
  openGraph: {
    title: 'Card Market Roundtable — Daily Debate Panel | CardVault',
    description: '5 AI analysts debate today\'s card market topic. Vote for the best argument. New topic every day.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Market Roundtable — CardVault',
    description: 'Daily card market debates — 5 analysts, 5 perspectives, your vote decides.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Live', href: '/live-hub' },
  { label: 'Market Roundtable' },
];

const faqItems = [
  {
    question: 'What is the Card Market Roundtable?',
    answer: 'The Card Market Roundtable is a daily simulated panel discussion where 5 AI analysts with distinct collecting philosophies debate the hottest topics in the sports card hobby. Each panelist — The Bull (optimist), The Bear (skeptic), The Veteran (30-year collector), The Flipper (profit-focused), and The Newcomer (fresh perspective) — presents their argument using real data from our 9,600+ card database. You vote for the argument you find most convincing.',
  },
  {
    question: 'How are daily topics chosen?',
    answer: 'A new topic is generated each day using a date-based seed, ensuring all visitors see the same debate. Topics span 5 categories: Market Outlook, Investment Strategy, Sport Analysis, Collecting Philosophy, and Current Events. Switch to Random mode anytime for a fresh debate topic.',
  },
  {
    question: 'Who are the 5 panelists?',
    answer: 'The Bull is an optimistic investor who sees upside everywhere. The Bear is a cautious skeptic who warns about market risks. The Veteran brings 30+ years of collecting wisdom and historical context. The Flipper focuses on short-term profit and quick turnarounds. The Newcomer offers fresh perspective from the social media and modern collecting era. Each approaches every topic from their unique angle.',
  },
  {
    question: 'Can I filter debates by sport?',
    answer: 'Yes. Use the sport filter to focus on MLB, NBA, NFL, or NHL card topics. The All filter shows topics covering the entire hobby. Panelist arguments reference real cards from the selected sport when applicable.',
  },
  {
    question: 'Are votes and stats tracked?',
    answer: 'Yes. Your voting history is saved locally on your device. The stats panel tracks total debates participated in, votes cast, your favorite panelist (most voted for), and agreement rate with the simulated community consensus. Stats persist between visits.',
  },
];

export default function MarketRoundtablePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Market Roundtable — Daily Debate Panel',
        description: 'Daily simulated panel discussion with 5 AI analysts debating sports card market topics. Vote for the best argument.',
        url: 'https://cardvault-two.vercel.app/market-roundtable',
        applicationCategory: 'EntertainmentApplication',
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
        <div className="inline-flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 text-slate-300 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-pulse" />
          LIVE DEBATE &middot; 5 Analysts &middot; Daily Topic
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Card Market Roundtable
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Five analysts. Five perspectives. One topic. Watch the debate, then vote for who makes the strongest case.
        </p>
      </div>

      <MarketRoundtableClient />

      {/* How It Works */}
      <div className="mt-12 bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">How the Roundtable Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-400">
          <div>
            <h3 className="font-semibold text-sky-400 mb-1">1. Read the Topic</h3>
            <p>Each day features a new debate topic covering market trends, investment strategy, sport analysis, or collecting philosophy.</p>
          </div>
          <div>
            <h3 className="font-semibold text-sky-400 mb-1">2. Hear Each Panelist</h3>
            <p>Five analysts present their arguments from different angles — bullish, bearish, veteran, flipper, and newcomer perspectives.</p>
          </div>
          <div>
            <h3 className="font-semibold text-sky-400 mb-1">3. Cast Your Vote</h3>
            <p>Vote for the panelist whose argument you find most convincing. See how the simulated community voted.</p>
          </div>
          <div>
            <h3 className="font-semibold text-sky-400 mb-1">4. Track Your Stats</h3>
            <p>View your debate history, favorite panelist, and how often you agree with community consensus.</p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-10">
        <h2 className="text-lg font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((f, i) => (
            <details key={i} className="group bg-gray-900/50 border border-gray-800 rounded-lg">
              <summary className="cursor-pointer px-5 py-3 text-sm font-medium text-gray-200 hover:text-white">
                {f.question}
              </summary>
              <div className="px-5 pb-4 text-sm text-gray-400">
                {f.answer}
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Related Links */}
      <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { href: '/hobby-radio', label: 'Hobby Radio', icon: '📻' },
          { href: '/market-chat', label: 'Market Chat', icon: '💬' },
          { href: '/card-wire', label: 'Card Wire', icon: '📡' },
          { href: '/hobby-buzz', label: 'Hobby Buzz', icon: '🗣️' },
          { href: '/power-plays', label: 'Power Plays', icon: '⚡' },
          { href: '/market-analysis', label: 'Market Analysis', icon: '📊' },
        ].map(link => (
          <Link key={link.href} href={link.href} className="flex items-center gap-2 bg-gray-900/50 border border-gray-800 rounded-lg px-4 py-3 text-sm text-gray-300 hover:text-white hover:border-sky-700/50 transition-colors">
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
