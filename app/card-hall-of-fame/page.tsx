import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardHallOfFameClient from './CardHallOfFameClient';

export const metadata: Metadata = {
  title: 'Card Hall of Fame — The 60 Most Iconic Sports Cards Ever | CardVault',
  description: 'The definitive pantheon of sports card collecting — 60 cards that built the hobby. Honus Wagner T206, 1952 Mantle, Jordan Fleer, Gretzky OPC, Brady Contenders, Ohtani RC, and 54 more. Filter by sport and era, build your Mount Rushmore.',
  keywords: [
    'most iconic sports cards', 'card hall of fame', 'greatest sports cards ever',
    'most famous trading cards', 'vintage card pantheon', 'hobby icon cards',
    'honus wagner t206', 'mickey mantle 1952 topps', 'michael jordan fleer rookie',
    'wayne gretzky rookie card', 'tom brady rookie', 'historic sports cards',
  ],
  openGraph: {
    title: 'Card Hall of Fame — The 60 Most Iconic Cards Ever',
    description: 'The pantheon of the hobby. Wagner, Mantle, Jordan, Gretzky, Brady, Ohtani — 60 cards that built sports card collecting.',
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: 'Card Hall of Fame — CardVault',
    description: '60 most historically significant sports cards ever. Build your Mount Rushmore.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Guides', href: '/guides' },
  { label: 'Card Hall of Fame' },
];

const faqItems = [
  {
    question: 'What is the Card Hall of Fame?',
    answer: 'The CardVault Hall of Fame is a curated pantheon of the 60 most historically significant trading cards in sports collecting — the T206 Honus Wagner, the 1952 Topps Mickey Mantle, the 1986 Fleer Michael Jordan, the 1979 O-Pee-Chee Gretzky, the 2000 Playoff Contenders Tom Brady auto, and 55 more. Cards are organized into three tiers: Inner Circle (top 10 most iconic), Hall of Fame (next 40), and Honors Wing (10 modern cards on a permanent trajectory).',
  },
  {
    question: 'How were these cards selected?',
    answer: 'Cards were curated based on four weighted factors: (1) historical significance — did the player or card change the sport; (2) market consensus — sustained high demand over decades; (3) cultural weight — recognition beyond the hobby; (4) set-design legacy — did the card define a format or release. The list spans 1909 (T206 Wagner) through 2024 (Paul Skenes), covering 115 years of cardboard history across MLB, NBA, NFL, NHL, and golf.',
  },
  {
    question: 'Is this a price ranking?',
    answer: 'No. While many of these cards are extremely valuable, ranking is based on significance not price. The 1980 Topps Bird/Magic/Erving rookie is ranked higher than several cards worth 10x more because its three-in-one format is unique to hobby history. Significance is measured on a 1–10 scale combining demand, importance, and cultural pull — not dollars.',
  },
  {
    question: 'What is the Inner Circle vs Hall of Fame vs Honors?',
    answer: 'Inner Circle (10 cards) are the most universally recognized cards in the hobby — every serious collector can identify them on sight. Hall of Fame (40 cards) define entire eras and sports, with enough historical weight to be permanent fixtures. Honors Wing (10 modern cards) are on a clear trajectory toward permanent Hall of Fame status but are still early in their long-term legacy — Wembanyama, Skenes, LaMelo Ball, Herbert, and others whose careers are still being written.',
  },
  {
    question: 'Can I make my own Hall of Fame picks?',
    answer: 'Yes. Use the Mount Rushmore feature to select your personal top 4 cards from the pantheon. Your picks are saved locally in your browser and can be shared as text to copy to social media or messaging apps. It is a fun way to see how your personal hobby bias compares to the curated list — vintage baseball collectors tend to lean heavy on T206 and 1950s Topps, while modern collectors often pick Brady, Mahomes, Ohtani, and Wembanyama.',
  },
];

export default function CardHallOfFamePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Card Hall of Fame — The 60 Most Iconic Sports Cards Ever Printed',
        description: 'Curated pantheon of the 60 most historically significant trading cards in sports collecting, organized by tier and era.',
        url: 'https://cardvault-two.vercel.app/card-hall-of-fame',
        author: { '@type': 'Organization', name: 'CardVault' },
        publisher: { '@type': 'Organization', name: 'CardVault' },
        datePublished: '2026-04-16',
        dateModified: '2026-04-16',
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

      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-amber-950/60 border border-amber-800/50 text-amber-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
          The Pantheon &middot; 60 Cards &middot; 115 Years of Cardboard
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Hall of Fame</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          The 60 most historically significant trading cards ever printed. The T206 Wagner. The 52 Mantle.
          The Jordan Fleer. The Gretzky OPC. The Brady Contenders. Build your Mount Rushmore.
        </p>
      </div>

      <CardHallOfFameClient />

      {/* FAQ */}
      <div className="mt-12 bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, idx) => (
            <details key={idx} className="group">
              <summary className="cursor-pointer text-white font-medium text-sm hover:text-amber-400 transition-colors list-none flex items-center gap-2">
                <span className="text-amber-400/60 group-open:rotate-90 transition-transform">&#9654;</span>
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
          Part of the <Link href="/guides" className="text-amber-400 hover:underline">CardVault Guides</Link> collection.
          See also:{' '}
          <Link href="/bucket-list" className="text-amber-400 hover:underline">Bucket List</Link>,{' '}
          <Link href="/collecting-roadmap" className="text-amber-400 hover:underline">Collecting Roadmap</Link>,{' '}
          <Link href="/card-encyclopedia" className="text-amber-400 hover:underline">Card Encyclopedia</Link>,{' '}
          <Link href="/card-timeline" className="text-amber-400 hover:underline">Hobby Timeline</Link>,{' '}
          <Link href="/rookie-rankings" className="text-amber-400 hover:underline">2025 Rookie Rankings</Link>,{' '}
          <Link href="/card-of-the-week" className="text-amber-400 hover:underline">Card of the Week</Link>.
        </p>
      </div>
    </div>
  );
}
