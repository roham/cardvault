import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import LiveEventHubClient from './LiveEventHubClient';

export const metadata: Metadata = {
  title: 'Live Event Hub — Card Shows, Breaks, Auctions & Drops | CardVault',
  description: 'Your command center for everything happening in the card hobby right now. Upcoming breaks, live auctions, card show schedule, product drops, trending moments, and community activity all in one place.',
  openGraph: {
    title: 'Live Event Hub — CardVault',
    description: 'Everything happening in the card hobby right now. Breaks, auctions, shows, drops, and trending moments.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Live Event Hub — CardVault',
    description: 'Your command center for live card hobby events. Breaks, auctions, shows, and drops.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Live', href: '/break-room' },
  { label: 'Event Hub' },
];

const faqItems = [
  {
    question: 'What is the Live Event Hub?',
    answer: 'The Live Event Hub is your central command center for everything happening in the sports card hobby. It aggregates upcoming card breaks, live auctions, card show schedules, product drops, trending cards, and community activity into a single dashboard so you never miss what matters.',
  },
  {
    question: 'How often does the hub update?',
    answer: 'The hub refreshes event countdowns in real time. New events, breaks, and drops are added to the schedule regularly. Trending cards and community activity update based on the latest hobby movements.',
  },
  {
    question: 'Can I set reminders for upcoming events?',
    answer: 'Yes! Click the bookmark icon on any event to save it to your personal schedule. Your saved events are stored locally and will show countdown timers as the event approaches.',
  },
  {
    question: 'What types of events are tracked?',
    answer: 'The hub tracks five event categories: Live Breaks (group and solo box breaks), Auctions (timed card auctions with snipe protection), Card Shows (in-person events and conventions), Product Drops (new set releases and restocks), and Community Events (tournaments, challenges, and themed days).',
  },
  {
    question: 'How do I participate in a live break or auction?',
    answer: 'Click on any active break or auction to join. Live breaks let you watch cards being pulled in real time. Auctions have countdown timers with snipe protection. Both use your CardVault balance for bidding and spot purchases.',
  },
];

export default function LiveEventHubPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Live Event Hub — Sports Card Events Dashboard',
        description: 'Central dashboard for live card breaks, auctions, shows, drops, and community events.',
        url: 'https://cardvault-two.vercel.app/live-hub',
        applicationCategory: 'EntertainmentApplication',
        operatingSystem: 'Any',
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
          Live Now &middot; Events &middot; Real-Time
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Live Event Hub</h1>
        <p className="text-zinc-400 text-lg leading-relaxed">
          Your command center for everything happening in the card hobby. Breaks, auctions,
          shows, drops, and trending moments — all in one place.
        </p>
      </div>

      <LiveEventHubClient />

      {/* FAQ */}
      <div className="mt-12 border-t border-zinc-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((f, i) => (
            <details key={i} className="group bg-zinc-900/50 border border-zinc-800 rounded-lg">
              <summary className="cursor-pointer p-4 text-white font-medium hover:text-red-400 transition-colors">
                {f.question}
              </summary>
              <p className="px-4 pb-4 text-zinc-400 text-sm leading-relaxed">{f.answer}</p>
            </details>
          ))}
        </div>
      </div>

      {/* Internal links */}
      <div className="mt-8 border-t border-zinc-800 pt-8">
        <h2 className="text-lg font-bold text-white mb-4">Explore Live Features</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/break-room', label: 'Break Room', desc: 'Join live breaks' },
            { href: '/auction', label: 'Auction House', desc: 'Bid on cards' },
            { href: '/card-show-feed', label: 'Card Show Feed', desc: 'Live show updates' },
            { href: '/drops', label: 'Drop Calendar', desc: 'Upcoming releases' },
            { href: '/break-schedule', label: 'Break Schedule', desc: 'Upcoming breaks' },
            { href: '/hot-right-now', label: 'Hot Right Now', desc: 'Trending cards' },
            { href: '/market-pulse', label: 'Market Pulse', desc: 'Activity dashboard' },
            { href: '/watch-party', label: 'Watch Party', desc: 'Group viewing' },
            { href: '/break-tracker', label: 'Break Tracker', desc: 'Log your breaks' },
          ].map(link => (
            <Link key={link.href} href={link.href} className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:border-red-800/50 transition-colors">
              <div className="text-white text-sm font-medium">{link.label}</div>
              <div className="text-zinc-500 text-xs">{link.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
