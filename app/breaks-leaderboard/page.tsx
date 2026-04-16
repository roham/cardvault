import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import BreaksLeaderboardClient from './BreaksLeaderboardClient';

export const metadata: Metadata = {
  title: 'Breaks Leaderboard — Today\'s Best Card Pulls | CardVault',
  description: 'Daily card break leaderboard showing the biggest hits from box breaks. Top pulls ranked by value, sport filters, weekly and monthly leaderboards, breaker rankings. Updated daily.',
  openGraph: {
    title: 'Breaks Leaderboard — Today\'s Best Card Pulls | CardVault',
    description: 'See who hit the biggest cards today. Daily leaderboard with sport filters and breaker rankings.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Breaks Leaderboard — CardVault',
    description: 'Daily card break leaderboard. Top pulls, breaker rankings, sport filters.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Breaks Leaderboard' },
];

const faqItems = [
  {
    question: 'What is the Breaks Leaderboard?',
    answer: 'The Breaks Leaderboard is a daily ranking of the biggest card pulls from simulated box breaks across all four major sports (MLB, NBA, NFL, NHL). It shows which cards were pulled, their estimated value, the product they came from, and the breaker who pulled them. The leaderboard resets daily with fresh results.',
  },
  {
    question: 'How are break results generated?',
    answer: 'Results are generated using a deterministic algorithm seeded by the current date. This means everyone sees the same leaderboard on the same day. Card values are based on realistic market estimates for the card type, player, and parallel rarity. The simulation uses real products and real player names.',
  },
  {
    question: 'What makes a card a "Big Hit"?',
    answer: 'Cards valued at $500 or more are classified as Big Hits. These typically include numbered parallels (/25 or lower), autographed cards, patch cards, and 1/1 superfractors of star players. The rarer the parallel and the bigger the player, the higher the value.',
  },
  {
    question: 'Can I filter by sport?',
    answer: 'Yes. Use the sport filter buttons to see only MLB (baseball), NBA (basketball), NFL (football), or NHL (hockey) results. You can also toggle between Today, This Week, and This Month time ranges to see different leaderboard periods.',
  },
  {
    question: 'What is the difference between Top Hits and Leaderboard views?',
    answer: 'Top Hits shows individual card pulls ranked by value — the single best cards pulled that day. Leaderboard shows breaker rankings based on total value across all their pulls, plus their best single hit and number of breaks. It rewards consistency as well as big hits.',
  },
];

export default function BreaksLeaderboardPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Breaks Leaderboard',
        description: 'Daily card break leaderboard showing the biggest hits from box breaks across all four major sports.',
        url: 'https://cardvault-two.vercel.app/breaks-leaderboard',
        applicationCategory: 'GameApplication',
        operatingSystem: 'Web',
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
        <div className="inline-flex items-center gap-2 bg-amber-950/60 border border-amber-800/50 text-amber-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
          Daily Leaderboard · Updated Every Day
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Breaks Leaderboard</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Today&apos;s biggest card pulls from box breaks. See who hit the best cards, track top breakers, and filter by sport. Same leaderboard for everyone — updated daily.
        </p>
      </div>

      {/* Interactive Leaderboard */}
      <BreaksLeaderboardClient />

      {/* FAQ Section */}
      <div className="mt-12">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <details key={i} className="bg-gray-900 rounded-lg border border-gray-800 group">
              <summary className="p-4 cursor-pointer font-medium text-white hover:text-amber-400 transition flex justify-between items-center">
                {item.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform">&#9662;</span>
              </summary>
              <div className="px-4 pb-4 text-gray-400 text-sm leading-relaxed">{item.answer}</div>
            </details>
          ))}
        </div>
      </div>

      {/* Related Links */}
      <div className="mt-12">
        <h2 className="text-xl font-bold text-white mb-4">Related Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { href: '/live-rip-feed', label: 'Live Rip Feed', desc: 'Watch packs open in real time' },
            { href: '/pack-race', label: 'Live Pack Race', desc: 'Race AI collectors opening packs' },
            { href: '/tools/pack-sim', label: 'Pack Simulator', desc: 'Open packs yourself' },
            { href: '/hot-deals', label: 'Hot Card Deals', desc: 'Daily deal feed' },
            { href: '/break-tracker', label: 'Break Tracker', desc: 'Track your break results' },
            { href: '/tools/break-roi', label: 'Break ROI Tracker', desc: 'Calculate break profitability' },
          ].map(link => (
            <Link key={link.href} href={link.href} className="bg-gray-900 rounded-lg p-4 border border-gray-800 hover:border-amber-800/50 transition group">
              <div className="text-white font-medium group-hover:text-amber-400 transition text-sm">{link.label}</div>
              <div className="text-gray-500 text-xs">{link.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
