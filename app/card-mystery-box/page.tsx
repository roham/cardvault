import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import MysteryBoxClient from './MysteryBoxClient';

export const metadata: Metadata = {
  title: 'Card Mystery Box — Pick Your Cards Blind | CardVault',
  description: 'Open 5 mystery boxes with 3 face-down cards each. Pick based on hints, reveal what you got vs what you missed. Daily challenge and unlimited random mode. Free card collecting game.',
  openGraph: {
    title: 'Card Mystery Box — Pick Your Cards Blind | CardVault',
    description: '5 boxes, 3 cards each, pick one blind. Can you find the gems? Daily + random modes.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Mystery Box — CardVault',
    description: 'Open mystery boxes and pick cards based on hints. Daily challenge + unlimited random.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/games' },
  { label: 'Mystery Box' },
];

const faqItems = [
  {
    question: 'How does Card Mystery Box work?',
    answer: 'You open 5 mystery boxes. Each box contains 3 face-down cards from real players in our database of 8,800+ cards. You get a hint about the box contents (sport, era, value range, or rookie status) and pick one card blind. After picking, all 3 cards are revealed so you can see what you got and what you missed. Your score is the total value of your 5 picks.',
  },
  {
    question: 'What are the different game modes?',
    answer: 'Daily Challenge uses a date-based seed so everyone gets the same 5 boxes on the same day. Compare scores with friends! Random mode generates a new set of boxes each time you play, with unlimited replays.',
  },
  {
    question: 'How is the grade calculated?',
    answer: 'Your grade (S through F) is based on how close your total value is to the maximum possible. If you picked the most valuable card in every box, you would get an S grade. The percentage shows how much of the optimal value you captured.',
  },
  {
    question: 'What do the share emojis mean?',
    answer: 'Green square means you picked the best card in that box. Yellow square means you picked a good card (70%+ of the best value). Red square means you picked the lowest value card. Share your emoji grid to challenge friends!',
  },
  {
    question: 'Are the same cards available to everyone in Daily mode?',
    answer: 'Yes! The Daily Challenge uses a deterministic seed based on the date, so everyone sees the same 5 boxes with the same 15 cards. This makes scores directly comparable across players.',
  },
];

export default function CardMysteryBoxPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Mystery Box',
        description: 'Open mystery boxes and pick cards based on hints. 5 boxes, 3 cards each, pick one blind.',
        url: 'https://cardvault-two.vercel.app/card-mystery-box',
        applicationCategory: 'GameApplication',
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

      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-purple-950/60 border border-purple-800/50 text-purple-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
          Daily Challenge · 8,800+ Real Cards
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Mystery Box</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Open 5 mystery boxes. Each has 3 face-down cards — pick one based on the hint. Can you find the hidden gems?
        </p>
      </div>

      {/* Game */}
      <MysteryBoxClient />

      {/* FAQ */}
      <div className="mt-12">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <details key={i} className="bg-gray-900 rounded-lg border border-gray-800 group">
              <summary className="p-4 cursor-pointer font-medium text-white hover:text-purple-400 transition flex justify-between items-center">
                {item.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform">&#9662;</span>
              </summary>
              <div className="px-4 pb-4 text-gray-400 text-sm leading-relaxed">{item.answer}</div>
            </details>
          ))}
        </div>
      </div>

      {/* Related */}
      <div className="mt-12">
        <h2 className="text-xl font-bold text-white mb-4">More Card Games</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { href: '/card-wordle', label: 'Card Wordle', desc: 'Guess the mystery player in 6 tries' },
            { href: '/card-groups', label: 'Card Groups', desc: 'NYT Connections with players' },
            { href: '/card-blackjack', label: 'Card Blackjack', desc: 'Blackjack with real card values' },
            { href: '/card-bracket', label: 'Card Bracket', desc: '16-card tournament bracket' },
            { href: '/card-detective', label: 'Card Detective', desc: 'Daily mystery card guessing' },
            { href: '/games', label: 'All 50+ Games', desc: 'Browse all card games' },
          ].map(link => (
            <Link key={link.href} href={link.href} className="bg-gray-900 rounded-lg p-4 border border-gray-800 hover:border-purple-800/50 transition group">
              <div className="text-white font-medium group-hover:text-purple-400 transition text-sm">{link.label}</div>
              <div className="text-gray-500 text-xs">{link.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
