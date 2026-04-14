import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import BreakRoomClient from './BreakRoomClient';

export const metadata: Metadata = {
  title: 'Community Break Room — Live Card Breaks with AI Commentary | CardVault',
  description: 'Join live simulated card breaks with AI-powered commentary. Watch pulls in real time with play-by-play analysis, market insights, and hype calls from unique AI hosts. Multiple break formats — hobby boxes, team breaks, pick-your-pack. Free to join.',
  openGraph: {
    title: 'Community Break Room with AI Commentary — CardVault',
    description: 'Watch live card breaks with AI-powered hosts. Play-by-play, market analysis, and hype commentary. Free to join.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Community Break Room with AI Commentary — CardVault',
    description: 'Live card breaks with AI hosts, real-time pulls, reactions, and collector chat.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Break Room' },
];

const faqItems = [
  {
    question: 'What is a card break?',
    answer: 'A card break (or group break) is where a breaker opens sealed product live while participants watch. In a team break, you buy a team slot and receive all cards pulled for that team. In a hobby break, everyone watches as boxes are opened. CardVault simulates this experience with real card data and AI-powered commentary from unique host personalities.',
  },
  {
    question: 'How does the AI Commentary work?',
    answer: 'Each break room features an AI host with a unique personality — from the hype-heavy CardKingMike to the analytical JaxWax. The AI provides five types of commentary: play-by-play calls for every pull, market analysis with grading ROI insights, hype reactions for big hits, trivia about players and sets, and context-aware observations that track streaks, rookie counts, and running break value.',
  },
  {
    question: 'What are the different break formats?',
    answer: 'Hobby Box breaks open a full hobby box one pack at a time. Team Breaks assign teams to participants — you get all cards for your team. Pick Your Pack lets you choose which pack to open from a selection. Random Team breaks randomly assign teams for a lower buy-in.',
  },
  {
    question: 'Is it free to watch breaks?',
    answer: 'Yes, watching breaks is completely free. You can join any active break room, see every card pulled, react, and chat with the AI host commentary. In the future, team break slots and pick-your-pack selections may use your wallet balance, but spectating is always free.',
  },
  {
    question: 'What types of AI commentary are available?',
    answer: 'The AI hosts provide five commentary types displayed in the dedicated ticker: LIVE play-by-play for card-by-card calls, ANALYSIS for grading and valuation insights, HYPE for big hit celebrations and streak alerts, TRIVIA for fun facts about players and sets, and MARKET for flip potential and investment observations. Commentary adapts based on what is pulled — hitting a streak or pulling a high-value rookie triggers different responses.',
  },
];

export default function BreakRoomPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Community Break Room',
        description: 'Live simulated card breaks with AI-powered commentary, real-time pulls, market analysis, and collector chat.',
        url: 'https://cardvault-two.vercel.app/break-room',
        applicationCategory: 'EntertainmentApplication',
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

      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-red-950/60 border border-red-800/50 text-red-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
          Live Breaks - AI Commentary - Real-Time Pulls - Chat - Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Community Break Room</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Watch live card breaks with AI-powered commentary. Each room features a unique AI host calling play-by-play, market analysis, and hype reactions. See every pull, react to hits, and chat during breaks.
        </p>
      </div>

      <BreakRoomClient />

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

      {/* Related Features */}
      <div className="mt-8 bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">More Live Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link href="/auction" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">🔨</span>
            <div>
              <div className="text-white text-sm font-medium">Auction House</div>
              <div className="text-gray-500 text-xs">Bid on cards in real time</div>
            </div>
          </Link>
          <Link href="/tools/pack-sim" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">🎰</span>
            <div>
              <div className="text-white text-sm font-medium">Pack Simulator</div>
              <div className="text-gray-500 text-xs">Open your own packs</div>
            </div>
          </Link>
          <Link href="/drops" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">📅</span>
            <div>
              <div className="text-white text-sm font-medium">Drop Calendar</div>
              <div className="text-gray-500 text-xs">Upcoming releases and breaks</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
