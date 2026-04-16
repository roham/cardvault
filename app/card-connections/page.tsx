import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardConnectionsClient from './CardConnectionsClient';
import { sportsCards } from '@/data/sports-cards';

export const metadata: Metadata = {
  title: 'Card Connections — Link Two Players Through Shared Attributes | CardVault',
  description: 'Free daily word game for card collectors. Connect two random players from different sports through shared years, sets, and sports. Like Six Degrees of Kevin Bacon for sports cards. New puzzle every day.',
  openGraph: {
    title: 'Card Connections — CardVault',
    description: 'Connect two players through shared card attributes. Daily puzzle, shareable results.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Connections — CardVault',
    description: 'Six Degrees of Kevin Bacon for sports cards. Link two players daily.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/games' },
  { label: 'Card Connections' },
];

const faqItems = [
  {
    question: 'How does Card Connections work?',
    answer: 'Card Connections gives you two random players from different sports (e.g., a baseball player and a hockey player). Your goal is to find the chain of connections linking them through shared attributes like card year, sport, or set. Each day features a new puzzle with the same chain for everyone, so you can compare strategies with friends.',
  },
  {
    question: 'What counts as a connection between two cards?',
    answer: 'Cards can be connected through several attributes: same year (both cards from 2024), same sport (both football cards), same card set (both from 2024 Topps Chrome), or cross-sport bridges where two cards from different sports share a year. The challenge is finding the shortest path between the start and end players.',
  },
  {
    question: 'Is the puzzle the same for everyone?',
    answer: 'Yes! Card Connections uses a daily seed, so every player gets the exact same start player, end player, and connection chain each day. This means you can share your results and compare strategies with friends. The puzzle resets at midnight.',
  },
  {
    question: 'How many steps are there?',
    answer: 'Most daily puzzles have 3-4 connection steps. The chain always crosses at least one sport boundary, making it impossible to solve with knowledge of just one sport. You need to know players across baseball, basketball, football, and hockey — or use the reveal hints.',
  },
  {
    question: 'Can I play previous days?',
    answer: 'Currently, only today\'s puzzle is available. Each day generates a fresh connection chain from the 6,300+ card database. The variety of possible connections means you\'ll rarely see the same type of chain twice.',
  },
];

export default function CardConnectionsPage() {
  // Prepare lightweight card data for client
  const cardData = sportsCards.map(c => ({
    player: c.player,
    sport: c.sport,
    year: c.year,
    set: c.set,
    slug: c.slug,
  }));

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Connections',
        description: 'Daily connection puzzle for sports card collectors. Link two players through shared attributes.',
        url: 'https://cardvault-two.vercel.app/card-connections',
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

      <Breadcrumb items={breadcrumbs} />

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-violet-950/60 border border-violet-800/50 text-violet-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
          Daily Puzzle &middot; Cross-Sport &middot; 6,300+ Cards &middot; Shareable
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Card Connections
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Six Degrees of Kevin Bacon, but for sports cards. Connect two players from different sports through shared years, sets, and attributes. New puzzle every day.
        </p>
      </div>

      <CardConnectionsClient cards={cardData} />

      {/* FAQ */}
      <section className="mt-12 border-t border-gray-800 pt-10">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((faq, i) => (
            <details key={i} className="group">
              <summary className="cursor-pointer text-white font-medium hover:text-violet-400 transition-colors">
                {faq.question}
              </summary>
              <p className="mt-2 text-gray-400 text-sm leading-relaxed pl-4">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Internal Links */}
      <section className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-lg font-semibold text-white mb-3">More Games</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { href: '/card-clash', label: 'Card Clash' },
            { href: '/guess-the-card', label: 'Guess the Card' },
            { href: '/trivia', label: 'Daily Trivia' },
            { href: '/card-speed-quiz', label: 'Speed Quiz' },
            { href: '/card-value-snap', label: 'Value Snap' },
            { href: '/flip-or-keep', label: 'Flip or Keep' },
            { href: '/card-dealer', label: 'Card Dealer Sim' },
          ].map(link => (
            <Link key={link.href} href={link.href} className="text-sm text-gray-400 hover:text-emerald-400 bg-gray-900 border border-gray-800 rounded-full px-3 py-1 transition-colors">
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
