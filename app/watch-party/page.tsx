import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import WatchPartyClient from './WatchPartyClient';

export const metadata: Metadata = {
  title: 'Watch Party — Live Game Card Impact Tracker | CardVault',
  description: 'Join live game watch parties and track how player performances affect card values in real time. NBA, MLB, NFL, NHL — play-by-play, card impact alerts, collector chat, and top mover tracking. Free to join.',
  openGraph: {
    title: 'Watch Party — Live Game Card Impact Tracker | CardVault',
    description: 'Watch live games with fellow collectors. Track card price impacts from player performances in real time.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Watch Party — Live Card Impact Tracker | CardVault',
    description: 'Live game watch parties with real-time card impact tracking. NBA, MLB, NFL, NHL.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Watch Party' },
];

const faqItems = [
  {
    question: 'What is a CardVault Watch Party?',
    answer: 'A Watch Party is a social viewing experience for card collectors. Join other collectors watching live games across NBA, MLB, NFL, and NHL. As the game unfolds, our Card Impact Tracker shows how player performances affect card values in real time. Chat with other collectors, react to big plays, and track which cards are moving.',
  },
  {
    question: 'How does the Card Impact Tracker work?',
    answer: 'The Card Impact Tracker monitors in-game events — touchdowns, home runs, highlight plays, dominant performances — and estimates their effect on related player card values. High-impact plays like a game-winning shot can boost a player card by 3-10% overnight. The tracker aggregates all impacts into a Top Movers leaderboard so you can see which cards benefited most from the game.',
  },
  {
    question: 'Which sports are covered?',
    answer: 'Watch Parties cover all four major North American sports: NBA basketball, MLB baseball, NFL football, and NHL hockey. Games rotate based on the current schedule, with rivalry matchups and playoff games getting priority. Each sport has tailored play-by-play and card impact calculations.',
  },
  {
    question: 'Is it free to join a Watch Party?',
    answer: 'Yes, Watch Parties are completely free. Join any active game room, see the play-by-play, track card impacts, react to plays, and chat with other collectors. No account required to spectate.',
  },
  {
    question: 'Can I chat during Watch Parties?',
    answer: 'Yes, each Watch Party has a live chat where collectors discuss the game, share card collecting insights, and react to big plays. You will also see card alert messages when significant price-impacting events happen. Reactions like fire, rocket, and gem mint emojis let you express excitement without typing.',
  },
];

export default function WatchPartyPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Watch Party — Live Game Card Impact Tracker',
        description: 'Join live game watch parties and track how player performances affect sports card values in real time.',
        url: 'https://cardvault-two.vercel.app/watch-party',
        applicationCategory: 'SocialNetworkingApplication',
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

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-indigo-950/60 border border-indigo-800/50 text-indigo-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
          Live Games - Card Impact Tracking - Collector Chat - Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Watch Party</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Watch live games with fellow collectors. Track how player performances impact card values in real time. Play-by-play, card impact alerts, top movers, and collector chat — all in one screen.
        </p>
      </div>

      <WatchPartyClient />

      {/* FAQ Section */}
      <div className="mt-12 bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((item, i) => (
            <div key={i} className="border-b border-gray-700/50 pb-5 last:border-0 last:pb-0">
              <h3 className="text-white font-semibold mb-2">{item.question}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
