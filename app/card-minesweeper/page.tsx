import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardMinesweeperClient from './CardMinesweeperClient';

export const metadata: Metadata = {
  title: 'Card Minesweeper — Hit Finder Puzzle for Collectors | CardVault',
  description: 'Free minesweeper game for card collectors. Find the hidden hit cards without clicking on them. 3 difficulty levels, daily challenge mode, and stats tracking. Classic minesweeper with a card hobby twist.',
  openGraph: {
    title: 'Card Minesweeper — Find the Hidden Hits | CardVault',
    description: 'Minesweeper with a card collecting twist. Flag the hit cards, reveal the base cards. Daily challenge + unlimited random.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Minesweeper — CardVault',
    description: 'Classic minesweeper meets card collecting. Find the hidden hits!',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games' },
  { label: 'Card Minesweeper' },
];

const faqItems = [
  {
    question: 'What is Card Minesweeper?',
    answer: 'Card Minesweeper is a classic minesweeper game with a sports card collecting twist. Instead of mines, the grid contains hidden "hit" cards — valuable pulls like PSA 10 Gem Mints, 1/1 Superfractors, and Auto Patches. Your goal is to reveal all safe cells without clicking on a hit card. Numbers show how many adjacent cells contain hits.',
  },
  {
    question: 'How do I play Card Minesweeper?',
    answer: 'Click cells to reveal them. Numbers indicate how many of the 8 surrounding cells contain hit cards. Use logic to deduce which cells are safe. Right-click (desktop) or long-press (mobile) to flag cells you believe contain hits. Win by revealing all non-hit cells. The first click is always safe.',
  },
  {
    question: 'What are the difficulty levels?',
    answer: 'Easy is an 8×8 grid with 10 hidden hits — great for beginners. Medium is a 10×10 grid with 18 hits. Hard is a 12×12 grid with 30 hits — a serious challenge. Each difficulty tracks its own best time separately.',
  },
  {
    question: 'Is the daily challenge the same for everyone?',
    answer: 'Yes, the Daily Challenge uses a date-based seed so all players get the same board each day per difficulty level. Compare your time with friends! Random mode generates a new unique board each time for unlimited play.',
  },
  {
    question: 'What happens when I win?',
    answer: 'When you successfully reveal all safe cells, you see all the hidden hit cards you avoided — real card types like Prizm Silver RCs, Topps Chrome Autos, and Downtown Inserts. Your time is recorded, and if it is your fastest, it becomes your new best time for that difficulty.',
  },
];

export default function CardMinesweeperPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Minesweeper — Hit Finder Puzzle',
        description: 'Classic minesweeper game with a card collecting twist. Find hidden hit cards across 3 difficulty levels.',
        url: 'https://cardvault-two.vercel.app/card-minesweeper',
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
          3 Difficulties &middot; Daily Challenge &middot; Stats Tracking
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Minesweeper</h1>
        <p className="text-gray-400 text-lg max-w-xl">
          Classic minesweeper with a card collecting twist. Reveal safe cells and avoid the hidden 💎 hit cards. How fast can you clear the board?
        </p>
      </div>

      <CardMinesweeperClient />

      {/* FAQ */}
      <div className="mt-12">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-800/50 border border-gray-700/50 rounded-xl">
              <summary className="flex items-center justify-between cursor-pointer px-5 py-4 text-white font-medium text-sm">
                {faq.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform ml-2">&#9660;</span>
              </summary>
              <div className="px-5 pb-4 text-gray-400 text-sm leading-relaxed">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link href="/" className="text-amber-400 hover:text-amber-300 text-sm transition-colors">
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
}
