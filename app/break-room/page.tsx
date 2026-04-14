import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import BreakRoomClient from './BreakRoomClient';

export const metadata: Metadata = {
  title: 'Community Break Room — Watch Live Card Breaks | CardVault',
  description: 'Join live simulated card breaks with other collectors. Watch pulls in real time, react to hits, and chat during breaks. Multiple break formats — hobby boxes, team breaks, pick-your-pack. Free to join.',
  openGraph: {
    title: 'Community Break Room — CardVault',
    description: 'Watch live card breaks, react to pulls, and chat with collectors. Multiple break formats. Free to join.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Community Break Room — CardVault',
    description: 'Live card breaks with real-time pulls, reactions, and collector chat.',
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
    answer: 'A card break (or group break) is where a breaker opens sealed product live while participants watch. In a team break, you buy a team slot and receive all cards pulled for that team. In a hobby break, everyone watches as boxes are opened. CardVault simulates this experience with real card data and AI-generated commentary.',
  },
  {
    question: 'How do Community Break Rooms work?',
    answer: 'Join any active break room to watch cards being pulled in real time. Each break features a simulated host opening packs with cards drawn from our database. You can react to pulls, chat with other viewers, and see running statistics. Cards are pulled at realistic intervals to simulate the excitement of a real break.',
  },
  {
    question: 'What are the different break formats?',
    answer: 'Hobby Box breaks open a full hobby box one pack at a time. Team Breaks assign teams to participants — you get all cards for your team. Pick Your Pack lets you choose which pack to open from a selection. Random Team breaks randomly assign teams for a lower buy-in.',
  },
  {
    question: 'Is it free to watch breaks?',
    answer: 'Yes, watching breaks is completely free. You can join any active break room, see every card pulled, react, and chat. In the future, team break slots and pick-your-pack selections may use your wallet balance, but spectating is always free.',
  },
  {
    question: 'How often do new breaks start?',
    answer: 'New breaks start throughout the day on a rotating schedule. Each break lasts 3-5 minutes with cards pulled every few seconds. When one break ends, the next one on the schedule begins shortly after. Check the break schedule for upcoming sessions.',
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
        description: 'Live simulated card breaks with real-time pulls, reactions, and collector chat.',
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
          Live Breaks - Real-Time Pulls - Reactions - Chat - Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Community Break Room</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Watch live card breaks with other collectors. See every pull in real time, react to big hits, and chat during breaks. Pick a room and join the action.
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
