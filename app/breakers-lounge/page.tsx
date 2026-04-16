import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import BreakersLoungeClient from './BreakersLoungeClient';

export const metadata: Metadata = {
  title: 'Breakers Lounge Live — Who\'s Online Right Now | CardVault',
  description: 'The live directory of card breakers broadcasting right now. 8 host personalities, live break status, viewer counts, recent hits, and next-break countdowns. The who\'s-on-the-air of the sports card break scene.',
  openGraph: {
    title: 'Breakers Lounge Live — CardVault',
    description: '8 breakers, 8 personalities, live status every 6 seconds. See who\'s hot right now.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Breakers Lounge Live — CardVault',
    description: 'Simulated live directory of 8 card breakers with personalities, viewer counts, and live hit feeds.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Live', href: '/live-hub' },
  { label: 'Breakers Lounge' },
];

const faqItems = [
  {
    question: 'Is this a real breakers directory?',
    answer: 'Breakers Lounge Live is a simulated directory featuring 8 fictional breaker personas with distinct styles — Hype King, Calm Analyst, Comedy Bit host, Prospect Hunter, Old-School Dealer, Speed Ripper, Bass Blaster, and Bargain Master. All card references come from CardVault\'s 9,800+ card database. No real hosts, no real streams — the feed gamifies discovery so you understand the breaker personality archetypes the industry actually has.',
  },
  {
    question: 'What does each panel show?',
    answer: 'Each breaker\'s tile shows: live status (ON AIR / between breaks / offline / Q&A / pre-break hype), current product being ripped (if live), viewer count, last big hit pulled with value, time-to-next-break countdown (if not live), and a recent signature quote that matches their personality. Tiles auto-update every 6-8 seconds.',
  },
  {
    question: 'Can I follow a breaker?',
    answer: 'Click any tile to "follow" a breaker — their tile gets pinned to the top of the lounge with a star, and their activity updates appear in the Followed Activity feed at the bottom. Follows save to your browser localStorage so they persist between visits. This is a prototype UI — no real notifications are sent.',
  },
  {
    question: 'Why do the breakers have different "styles"?',
    answer: 'Card breaks have developed distinct presenter archetypes over the last decade. Hype King breakers (think Layton at Layton Sports Cards) drive engagement with high energy. Calm Analysts explain player/set context in depth. Comedy Bit hosts turn breaks into entertainment. Prospect Hunters focus on low-number Bowman and minor-league specialists. Understanding the archetypes helps new collectors pick breakers aligned with their own taste.',
  },
  {
    question: 'What are the status types?',
    answer: 'Five status types rotate: ON AIR (actively breaking, has viewer count + current product), Q&A (answering chat questions between products), Pre-Break Hype (announcing the next break), Between Breaks (short intermission), and Offline (signed off for the night). Each status persists ~30-90 seconds before rotating — matching real Whatnot host rhythms where a single break product gets 5-15 minutes of airtime.',
  },
];

export default function BreakersLoungePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Breakers Lounge Live',
        description: 'Live simulated directory of 8 card breaker personas with status updates, viewer counts, live hits, and next-break countdowns.',
        url: 'https://cardvault-two.vercel.app/breakers-lounge',
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
        <div className="inline-flex items-center gap-2 bg-violet-950/60 border border-violet-800/50 text-violet-300 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
          Breakers Lounge &middot; Live Directory &middot; 8 Hosts
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Breakers Lounge Live</h1>
        <p className="text-gray-400 text-lg max-w-3xl">
          Who&apos;s on the air right now? Live directory of 8 card breaker personalities with
          real-time status updates, viewer counts, recent hits, and next-break countdowns.
          Click a host to follow them and pin their tile.
        </p>
      </div>

      <BreakersLoungeClient />

      <div className="mt-12 bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, idx) => (
            <details key={idx} className="group">
              <summary className="cursor-pointer text-white font-medium text-sm hover:text-violet-400 transition-colors list-none flex items-center gap-2">
                <span className="text-violet-400/60 group-open:rotate-90 transition-transform">&#9654;</span>
                {faq.question}
              </summary>
              <p className="text-gray-400 text-sm mt-2 ml-5">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>

      <div className="mt-8 text-sm text-gray-500">
        <p>
          Part of the <Link href="/live-hub" className="text-violet-400 hover:underline">CardVault Live</Link> experience.
          See also: <Link href="/market-chat" className="text-violet-400 hover:underline">Market Chat</Link>,{' '}
          <Link href="/live-rip-feed" className="text-violet-400 hover:underline">Live Rip Feed</Link>,{' '}
          <Link href="/hobby-radio" className="text-violet-400 hover:underline">Hobby Radio</Link>,{' '}
          <Link href="/break-schedule" className="text-violet-400 hover:underline">Break Schedule</Link>,{' '}
          <Link href="/community-pulse" className="text-violet-400 hover:underline">Community Pulse</Link>,{' '}
          <Link href="/card-wire" className="text-violet-400 hover:underline">Card Wire</Link>.
        </p>
      </div>
    </div>
  );
}
