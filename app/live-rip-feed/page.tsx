import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import LiveRipFeedClient from './LiveRipFeedClient';

export const metadata: Metadata = {
  title: 'Live Rip Feed — Watch Pack Openings in Real Time | CardVault',
  description: 'See what card collectors are pulling right now. Live feed of simulated pack openings across baseball, basketball, football, and hockey. Card-by-card reveals, big hit celebrations, best pull of the day, and real-time stats. The hobby never sleeps.',
  openGraph: {
    title: 'Live Rip Feed — Real-Time Pack Openings | CardVault',
    description: 'Watch the hobby in action. Live pack openings, big pulls, and real-time card market activity.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Live Rip Feed — CardVault',
    description: 'Real-time pack opening feed. See what collectors are pulling right now.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Live', href: '/live-hub' },
  { label: 'Live Rip Feed' },
];

const faqItems = [
  {
    question: 'What is the Live Rip Feed?',
    answer: 'The Live Rip Feed is a simulated real-time stream of card pack openings happening across the hobby. Watch as collectors rip baseball, basketball, football, and hockey products — see every card revealed with estimated values, celebrate big hits, and track the best pulls of the day. Think of it as a live scoreboard for the card hobby.',
  },
  {
    question: 'Are these real pack openings?',
    answer: 'The openings are simulated using our database of 6,900+ real sports cards and realistic product configurations. Each pack contains cards from the actual products being ripped, with realistic rarity distributions. The collector names and timestamps are generated for demonstration purposes, but the cards and values are real.',
  },
  {
    question: 'How are card values determined?',
    answer: 'Card values shown are estimated market values based on recent eBay sold listings and market trends. Raw values represent ungraded card prices, while gem mint values represent PSA 10 or BGS 9.5 prices. Actual prices may vary based on condition, specific parallel, and market timing.',
  },
  {
    question: 'Can I pause and resume the feed?',
    answer: 'Yes! Click the Pause button to freeze the feed and review recent openings. Click Resume to continue watching new openings. The feed auto-generates new openings every few seconds to simulate real-time activity across the hobby.',
  },
  {
    question: 'What counts as a big hit?',
    answer: 'A "big hit" is any card valued at $50 or more in raw condition. These are highlighted with a celebration effect in the feed. Cards valued over $200 get an extra "fire" indicator. The Best Pull of the Day tracks the single highest-value card pulled across all openings since you started watching.',
  },
];

export default function LiveRipFeedPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Live Rip Feed — Real-Time Pack Openings',
        description: 'Watch simulated pack openings in real time. See what collectors are pulling across baseball, basketball, football, and hockey.',
        applicationCategory: 'SportsApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        url: 'https://cardvault-two.vercel.app/live-rip-feed',
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

      <LiveRipFeedClient />

      <section className="mt-16 border-t border-gray-800 pt-10">
        <h2 className="text-xl font-bold mb-4 text-white">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((f, i) => (
            <details key={i} className="group" open={i === 0}>
              <summary className="cursor-pointer text-gray-300 hover:text-white font-medium">{f.question}</summary>
              <p className="mt-2 text-gray-400 text-sm leading-relaxed">{f.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-12 border-t border-gray-800 pt-10">
        <h2 className="text-xl font-bold mb-4 text-white">Related Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { href: '/community-pulse', label: 'Community Pulse', desc: 'Live collecting activity feed' },
            { href: '/hobby-buzz', label: 'Hobby Buzz', desc: 'Collector discussion feed' },
            { href: '/live-ticker', label: 'Price Ticker', desc: 'Scrolling price updates' },
            { href: '/break-room', label: 'Break Room', desc: 'Join a community break' },
            { href: '/grading-feed', label: 'Grading Results', desc: 'Live grading feed' },
            { href: '/products', label: 'Pack Store', desc: 'Browse and open packs' },
          ].map(l => (
            <Link key={l.href} href={l.href} className="block p-3 rounded-lg bg-gray-900/60 border border-gray-800 hover:border-gray-600 transition-colors">
              <div className="text-sm font-medium text-white">{l.label}</div>
              <div className="text-xs text-gray-400">{l.desc}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
