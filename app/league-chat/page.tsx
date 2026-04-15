import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import LeagueChatClient from './LeagueChatClient';

export const metadata: Metadata = {
  title: 'League Chat — Per-Sport Collector Chat Rooms | CardVault',
  description: 'Join live chat rooms for Baseball, Basketball, Football, and Hockey card collectors. Discuss pulls, trades, market moves, and rookie watch with fellow collectors. Trending topics, simulated community, and real card data.',
  openGraph: {
    title: 'League Chat — Per-Sport Collector Rooms | CardVault',
    description: 'Chat rooms for every sport. Discuss pulls, trades, and market moves with collectors.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'League Chat — Per-Sport Collector Rooms | CardVault',
    description: 'Baseball, Basketball, Football, Hockey chat rooms for card collectors.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'League Chat' },
];

const faqItems = [
  {
    question: 'What is League Chat?',
    answer: 'League Chat provides dedicated chat rooms for each major sport — Baseball, Basketball, Football, and Hockey — plus a General room for cross-sport discussion. Talk about pulls, trades, grading decisions, market moves, and rookie watch with other card collectors who share your interests.',
  },
  {
    question: 'How does the chat work?',
    answer: 'Select a sport room from the sidebar, type your message, and send. You will see a live feed of messages from other collectors (simulated in the current prototype) discussing topics relevant to that sport. Messages are stored locally so your chat history persists between sessions.',
  },
  {
    question: 'What are Trending Topics?',
    answer: 'Each room surfaces trending topics based on current events — playoff speculation, rookie card prices, notable sales, and grading news. These update daily and give you conversation starters relevant to what is happening in that sport right now.',
  },
  {
    question: 'Can I chat across different sport rooms?',
    answer: 'Yes! Switch between rooms freely using the room selector. Your messages are saved per-room. The General room is for cross-sport discussions like grading company comparisons, sealed product advice, and card show meetups.',
  },
  {
    question: 'Is my username saved?',
    answer: 'Your display name is saved in your browser so you do not have to re-enter it. You can change it at any time from the chat settings. All data is stored locally — no account required.',
  },
];

export default function LeagueChatPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'League Chat',
        description: 'Per-sport collector chat rooms for discussing pulls, trades, market moves, and rookie watch.',
        url: 'https://cardvault-two.vercel.app/league-chat',
        applicationCategory: 'SocialApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      }} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map(q => ({
          '@type': 'Question',
          name: q.question,
          acceptedAnswer: { '@type': 'Answer', text: q.answer },
        })),
      }} />

      <LeagueChatClient />

      {/* FAQ Section */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item) => (
            <details key={item.question} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 group">
              <summary className="text-white font-medium cursor-pointer group-open:mb-2">{item.question}</summary>
              <p className="text-slate-400 text-sm leading-relaxed">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Internal Links */}
      <section className="mt-12 border-t border-slate-800 pt-8">
        <h2 className="text-lg font-semibold text-white mb-4">More Community Features</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Link href="/break-room" className="text-sm text-blue-400 hover:text-blue-300">Community Break Room</Link>
          <Link href="/activity" className="text-sm text-blue-400 hover:text-blue-300">Activity Feed</Link>
          <Link href="/card-battle" className="text-sm text-blue-400 hover:text-blue-300">Card Battles</Link>
          <Link href="/trade-hub" className="text-sm text-blue-400 hover:text-blue-300">Trade Hub</Link>
          <Link href="/showcase" className="text-sm text-blue-400 hover:text-blue-300">Trophy Case</Link>
          <Link href="/leaderboard" className="text-sm text-blue-400 hover:text-blue-300">Leaderboards</Link>
          <Link href="/predictions" className="text-sm text-blue-400 hover:text-blue-300">Predictions</Link>
          <Link href="/bingo" className="text-sm text-blue-400 hover:text-blue-300">Card Bingo</Link>
          <Link href="/progression" className="text-sm text-blue-400 hover:text-blue-300">Progression System</Link>
        </div>
      </section>
    </div>
  );
}
