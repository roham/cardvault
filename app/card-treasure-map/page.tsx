import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardTreasureMapClient from './CardTreasureMapClient';

export const metadata: Metadata = {
  title: 'Card Treasure Map — Find the Hidden Card | CardVault',
  description: 'Explore a 7x7 grid to find the hidden treasure card! Use hot/cold distance hints to triangulate the location. 20 moves to find it. Daily challenge + random mode. 9,500+ real sports cards.',
  openGraph: {
    title: 'Card Treasure Map — Find the Hidden Treasure Card | CardVault',
    description: 'Explore a grid, follow hot/cold hints, find the hidden treasure card in 20 moves. Daily challenge + random.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Treasure Map | CardVault',
    description: 'Find the hidden treasure card on a 7x7 grid. Hot/cold hints, 20 moves, daily + random modes.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/games' },
  { label: 'Card Treasure Map' },
];

const faqItems = [
  {
    question: 'How do I play Card Treasure Map?',
    answer: 'Tap any cell on the 7x7 grid to reveal it. Each revealed cell shows a number representing its Manhattan distance (horizontal + vertical steps) to the hidden treasure card. Use these numbers to triangulate the treasure location. You have 20 moves to find it. Finding bonus loot cards (yellow dots) along the way earns extra rewards.',
  },
  {
    question: 'What do the distance numbers mean?',
    answer: 'The number in each revealed cell shows how many grid steps away the treasure is. A 1 means the treasure is in an adjacent cell. A 0 means you found it. Use two or more revealed cells to narrow down the exact location through triangulation.',
  },
  {
    question: 'What is Daily vs Random mode?',
    answer: 'Daily mode gives everyone the same map each day so you can compare scores with friends. Random mode generates a new map every time you play. Both use real cards from the CardVault database of 9,500+ sports cards.',
  },
  {
    question: 'How is the grade calculated?',
    answer: 'Grades are based on how few moves you used to find the treasure. S grade requires 5 or fewer moves (expert triangulation), A needs 8 or fewer, B needs 12, C needs 16, and D is anything above. Not finding the treasure results in an F.',
  },
  {
    question: 'What are the yellow loot dots?',
    answer: 'Eight cells on the grid contain bonus loot cards. When you reveal one, you collect that card as a bonus find. They do not count toward the treasure, but they reward exploration and show you interesting cards from the database.',
  },
];

export default function CardTreasureMapPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Card Treasure Map',
        description: 'Explore a 7x7 grid to find the hidden treasure card using hot/cold distance hints. Daily challenge and random modes.',
        url: 'https://cardvault-two.vercel.app/card-treasure-map',
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
        <div className="inline-flex items-center gap-2 bg-amber-950/60 border border-amber-800/50 text-amber-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
          Card Treasure Map &middot; 7&times;7 Grid &middot; 20 Moves
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">
          Card Treasure Map
        </h1>
        <p className="text-gray-400 text-lg">
          A valuable card is hidden somewhere on the grid. Reveal cells to get distance hints,
          triangulate the location, and find the treasure in 20 moves or fewer.
        </p>
      </div>

      <CardTreasureMapClient />

      {/* FAQ */}
      <div className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-800/40 border border-gray-700/40 rounded-lg">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium hover:text-amber-400 transition-colors">
                {faq.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform">&#9660;</span>
              </summary>
              <div className="px-4 pb-4 text-sm text-gray-400">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>

      {/* Back links */}
      <div className="mt-8 flex flex-wrap gap-4 text-sm">
        <Link href="/games" className="text-amber-500 hover:text-amber-400">&larr; All Games</Link>
        <Link href="/tools" className="text-amber-500 hover:text-amber-400">Tools</Link>
        <Link href="/" className="text-amber-500 hover:text-amber-400">Home</Link>
      </div>
    </div>
  );
}
