import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import GameNightClient from './GameNightClient';

export const metadata: Metadata = {
  title: 'Game Night Live — Sports Card Impact Tracker | CardVault',
  description: 'Watch live sporting events and see which cards are moving in real time. Second-screen experience for card collectors. Live scores, card impact percentages, top movers, and event feed across MLB, NBA, NFL, and NHL.',
  openGraph: {
    title: 'Game Night Live — Real-Time Card Impact | CardVault',
    description: 'The second screen for card collectors. See how tonight\'s games affect card prices in real time.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Game Night Live — CardVault',
    description: 'Real-time card price impact from live sporting events. The collector\'s second screen.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Live', href: '/live-hub' },
  { label: 'Game Night Live' },
];

const faqItems = [
  {
    question: 'What is Game Night Live?',
    answer: 'Game Night Live is a second-screen experience for sports card collectors. It shows simulated live sporting events across MLB, NBA, NFL, and NHL, and calculates how each play affects the value of related sports cards. When a player hits a home run, scores a touchdown, or makes a big play, you can see the estimated percentage impact on their card prices in real time.',
  },
  {
    question: 'How are the card impact percentages calculated?',
    answer: 'Card impact is estimated based on the type of play and its historical significance for card prices. High-impact plays like walk-off hits (+5-15%), buzzer-beaters (+5-15%), and pick-sixes (+4-12%) have larger effects, while routine plays like singles (+0.5-2%) or field goals (+0.5-2%) have smaller impacts. These are directional estimates — actual card price movements depend on many factors including overall market conditions.',
  },
  {
    question: 'Are the games and scores real?',
    answer: 'The games, scores, and events shown are simulated using your real sports card database. The matchups are realistic pairings and the events reflect actual play types for each sport. This is a demonstration of how live sporting events could affect card markets — think of it as a prototype for real-time card price tracking during live games.',
  },
  {
    question: 'Can I filter by sport?',
    answer: 'Yes! Use the sport filter buttons at the top to focus on a specific sport — Baseball, Basketball, Football, or Hockey. You can also view all sports at once. The live scoreboard, event feed, and top movers all update based on your filter selection.',
  },
  {
    question: 'What are the Top Movers?',
    answer: 'The Top Movers sidebar shows which players have had the biggest cumulative card impact during tonight\'s games. A player who makes multiple big plays will accumulate impact percentage, making them the top mover. This helps you identify which cards are gaining the most value from tonight\'s action — useful for deciding what to buy or sell.',
  },
];

export default function GameNightPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Game Night Live',
        description: 'Real-time sports card impact tracker. Watch live games and see how plays affect card prices. The second screen for card collectors.',
        url: 'https://cardvault-two.vercel.app/game-night',
        applicationCategory: 'GameApplication',
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
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          LIVE &middot; Real-Time Card Impact
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Game Night Live</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          The second screen for card collectors. Watch tonight&apos;s games and see which
          cards are moving in real time.
        </p>
      </div>

      <GameNightClient />

      {/* FAQ */}
      <div className="mt-12 border-t border-gray-800 pt-10">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <details key={i} className="group bg-gray-900/60 border border-gray-800 rounded-lg">
              <summary className="flex items-center justify-between cursor-pointer px-5 py-4 text-white font-medium">
                {item.question}
                <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-5 pb-4 text-gray-400 text-sm leading-relaxed">{item.answer}</div>
            </details>
          ))}
        </div>
      </div>

      {/* Related links */}
      <div className="mt-10 flex flex-wrap gap-3 text-sm">
        <Link href="/live-hub" className="text-emerald-400 hover:underline">Live Hub</Link>
        <span className="text-gray-600">&middot;</span>
        <Link href="/market-movers" className="text-emerald-400 hover:underline">Market Movers</Link>
        <span className="text-gray-600">&middot;</span>
        <Link href="/community-pulse" className="text-emerald-400 hover:underline">Community Pulse</Link>
        <span className="text-gray-600">&middot;</span>
        <Link href="/market-alerts" className="text-emerald-400 hover:underline">Market Alerts</Link>
        <span className="text-gray-600">&middot;</span>
        <Link href="/event-countdowns" className="text-emerald-400 hover:underline">Event Countdowns</Link>
      </div>
    </div>
  );
}
