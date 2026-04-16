import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardDigClient from './CardDigClient';

export const metadata: Metadata = {
  title: 'Card Dig — Excavate Hidden Sports Cards | CardVault',
  description: 'Dig through dirt, clay, and rock to unearth hidden sports cards! 6 cards buried in a 6x5 grid, 15 digs to find them all. Daily challenge + random mode. 9,500+ real cards from MLB, NBA, NFL, NHL.',
  openGraph: {
    title: 'Card Dig — Excavate Hidden Cards | CardVault',
    description: 'Archaeological card game. Dig through layers to find 6 buried sports cards. 15 digs, daily + random.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Dig | CardVault',
    description: 'Excavate hidden sports cards from a 6x5 grid. 15 digs, 6 buried cards, daily challenge.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/games' },
  { label: 'Card Dig' },
];

const faqItems = [
  {
    question: 'How do I play Card Dig?',
    answer: 'Tap cells on the 6x5 grid to dig. Each cell has 1-3 layers of terrain (dirt, clay, rock). Remove all layers to reveal what is underneath. 6 sports cards are buried in the grid — find as many as possible with your 15 digs. Cards buried under more layers are harder to reach but are still random.',
  },
  {
    question: 'What do the terrain layers mean?',
    answer: 'Dirt (brown, 1 dig) is the shallowest. Clay (orange, 2 digs) requires two taps. Rock (gray, 3 digs) is the deepest and costs the most digs. The number shown on each cell tells you how many digs remain before it is fully excavated.',
  },
  {
    question: 'How is the grade calculated?',
    answer: 'Your grade is based on the total value of cards found multiplied by how many of the 6 you discovered. Finding all 6 cards with high total value earns an S grade. Finding few cards or only low-value ones results in lower grades.',
  },
  {
    question: 'Is there a daily challenge?',
    answer: 'Yes. Daily Dig uses the same grid layout and card placements for everyone each day, so you can compare strategies and results with friends. Random mode generates a fresh grid every time.',
  },
  {
    question: 'What cards are in the game?',
    answer: 'Card Dig uses over 9,500 real sports cards from the CardVault database spanning baseball, basketball, football, and hockey from 1909 to 2025. You can filter by sport to dig for cards from your favorite league.',
  },
];

export default function CardDigPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Card Dig',
        description: 'Excavate hidden sports cards from a grid. Dig through dirt, clay, and rock layers to find 6 buried cards.',
        url: 'https://cardvault-two.vercel.app/card-dig',
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
          Card Dig &middot; 6&times;5 Grid &middot; 15 Digs &middot; 6 Hidden Cards
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">Card Dig</h1>
        <p className="text-gray-400 text-lg">
          Six valuable sports cards are buried in the excavation site. Dig through layers of dirt,
          clay, and rock to unearth them. You have 15 digs — choose wisely.
        </p>
      </div>

      <CardDigClient />

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

      <div className="mt-8 flex flex-wrap gap-4 text-sm">
        <Link href="/games" className="text-amber-500 hover:text-amber-400">&larr; All Games</Link>
        <Link href="/tools" className="text-amber-500 hover:text-amber-400">Tools</Link>
        <Link href="/" className="text-amber-500 hover:text-amber-400">Home</Link>
      </div>
    </div>
  );
}
