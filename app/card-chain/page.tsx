import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardChainClient from './CardChainClient';

export const metadata: Metadata = {
  title: 'Card Chain — Build the Longest Connected Chain | CardVault',
  description: 'Free chain-building game for sports card collectors. Each card must share an attribute with the previous one — same sport, decade, player, or value tier. How long can you keep the chain going? Daily challenge + random mode. 9,600+ real sports cards.',
  openGraph: {
    title: 'Card Chain — Connected Card Challenge | CardVault',
    description: 'Build chains of connected cards. Each card shares an attribute with the last. Beat the clock!',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Chain — CardVault',
    description: 'Build the longest chain of connected cards. Each must share an attribute with the last.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/games' },
  { label: 'Card Chain' },
];

const faqItems = [
  {
    question: 'How does Card Chain work?',
    answer: 'You start with one random card. Then you pick from 4 options — each shares at least one attribute (sport, decade, value tier, or player) with the current card. Pick the right connection to extend your chain. The longer your chain, the higher your score. You have 90 seconds to build the longest chain possible.',
  },
  {
    question: 'What counts as a valid connection?',
    answer: 'Four connection types: Same Sport (both baseball, both hockey, etc.), Same Decade (both from 2020s, both from 1990s), Same Value Tier (both $5-$24, both $100+), or Same Player (different cards of the same player). The connection type is shown with a colored badge when you select.',
  },
  {
    question: 'How is scoring calculated?',
    answer: 'Base points: 10 per link. Streak bonus: consecutive correct picks multiply your score (2x after 5, 3x after 10). Speed bonus: faster picks earn more points. A perfect chain of 15+ links earns an S grade. The daily challenge uses a fixed seed so everyone gets the same starting card and options.',
  },
  {
    question: 'What is the difference between Daily and Random?',
    answer: 'Daily mode uses a date-based seed — everyone gets the same starting card and option pool that day. Compare scores with friends. Random mode generates unique games each time for unlimited practice.',
  },
  {
    question: 'What happens when I pick wrong?',
    answer: 'If you pick a card with no valid connection to the current card, the chain breaks and the game ends. Your final score is based on chain length, speed, and streak bonuses. You can always see which connections are valid before picking.',
  },
];

export default function CardChainPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Chain',
        description: 'Build the longest chain of connected sports cards. Each card must share an attribute with the previous one.',
        url: 'https://cardvault-two.vercel.app/card-chain',
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
        <div className="inline-flex items-center gap-2 bg-cyan-950/60 border border-cyan-800/50 text-cyan-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
          Chain Game &middot; 9,600+ Cards &middot; 4 Connection Types
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Chain</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Build the longest chain of connected cards. Each card must share an attribute with the last —
          same sport, decade, value tier, or player. How long can you keep the chain going?
        </p>
      </div>

      <CardChainClient />

      {/* FAQ */}
      <div className="mt-12 bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, idx) => (
            <details key={idx} className="group">
              <summary className="cursor-pointer text-white font-medium text-sm hover:text-cyan-400 transition-colors list-none flex items-center gap-2">
                <span className="text-cyan-400/60 group-open:rotate-90 transition-transform">&#9654;</span>
                {faq.question}
              </summary>
              <p className="text-gray-400 text-sm mt-2 ml-5">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>

      {/* Internal Links */}
      <div className="mt-8 text-sm text-gray-500">
        <p>
          Part of <Link href="/games" className="text-cyan-400 hover:underline">CardVault Games</Link>.
          See also: <Link href="/card-connections" className="text-cyan-400 hover:underline">Card Connections</Link>,{' '}
          <Link href="/card-snap" className="text-cyan-400 hover:underline">Card Snap</Link>,{' '}
          <Link href="/card-grid" className="text-cyan-400 hover:underline">Card Grid</Link>,{' '}
          <Link href="/card-wordle" className="text-cyan-400 hover:underline">Card Wordle</Link>,{' '}
          <Link href="/card-timeline" className="text-cyan-400 hover:underline">Card Timeline</Link>,{' '}
          <Link href="/card-battle" className="text-cyan-400 hover:underline">Card Battle</Link>.
        </p>
      </div>
    </div>
  );
}
