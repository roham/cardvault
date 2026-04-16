import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import ParallelRainbowClient from './ParallelRainbowClient';

export const metadata: Metadata = {
  title: 'The Parallel Rainbow Encyclopedia — Every Refractor, Prizm & Parallel Explained | CardVault',
  description: 'The definitive visual reference for modern card parallel systems. Topps Chrome Refractor rainbow, Panini Prizm rainbow, Select tiers, Bowman Chrome prospects, Donruss Optic, Mosaic, Young Guns, Pokemon rarity — 8 systems with print runs, rarity tiers, and value multipliers.',
  keywords: [
    'what is a refractor', 'what is a prizm', 'silver prizm vs base prizm', 'gold refractor print run',
    'superfractor 1/1', 'panini prizm rainbow', 'topps chrome parallels', 'bowman chrome parallel',
    'select concourse premier club field level', 'donruss optic parallels', 'panini mosaic parallels',
    'upper deck young guns', 'pokemon rare holo ultra rare secret', 'parallel rainbow encyclopedia',
    'what is a refractor card', 'card parallel explained', 'card print run guide',
  ],
  openGraph: {
    title: 'The Parallel Rainbow Encyclopedia',
    description: 'Every refractor, Prizm, and parallel explained. 8 systems, 70+ parallels, real print runs and value multipliers.',
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: 'Parallel Rainbow Encyclopedia — CardVault',
    description: 'The visual reference for every modern card parallel system.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Guides', href: '/guides' },
  { label: 'Parallel Rainbow Encyclopedia' },
];

const faqItems = [
  {
    question: 'What is a "parallel" in card collecting?',
    answer: 'A parallel is a card with the same design as a base card but printed on a different colored or patterned foil — often at a much lower print run. Parallels drive rarity in modern hobby boxes. A 2024 Topps Chrome Mike Trout base card and a 2024 Topps Chrome Mike Trout Gold /50 refractor are the same photo and design, but the gold version is 99.8% scarcer than base. Parallels can cost 2x to 500x the base card depending on the tier.',
  },
  {
    question: 'What is a refractor?',
    answer: 'A refractor is a chrome-stock parallel with a light-refracting foil surface that produces a rainbow shimmer when tilted. Topps invented the refractor in 1993 (Topps Finest) and it became the template for modern parallels. Every "Chrome" product (Topps Chrome, Bowman Chrome, Topps Finest) uses a refractor rainbow. "Prizm" is Paninis equivalent of the refractor — different name, same optical concept.',
  },
  {
    question: 'What is a SuperFractor?',
    answer: 'A SuperFractor is the 1-of-1 top-tier parallel in a Chrome product (Topps Chrome, Bowman Chrome, Topps Finest). Only one exists. Gold mirror-like foil. SuperFractors of elite rookies regularly sell for $100,000+ — a 2011 Topps Update Mike Trout SuperFractor sold for $900,000 in 2020. Panini uses "Black Finite" or "Nebula" as the 1-of-1 equivalent in Prizm/Select products.',
  },
  {
    question: 'What does "numbered /25" or "/10" mean?',
    answer: 'Numbered print run. A card marked /25 means only 25 copies exist of that card in that parallel — usually stamped as "XX/25" in a serial number on the front or back. Smaller numbers = scarcer. Typical hierarchy from common to rare: /499, /250, /199, /150, /99, /75, /50, /25, /10, /5, /1. Cards without a number on them (base, base refractor, base Prizm) are print-on-demand and have no published print run.',
  },
  {
    question: 'Is a "Silver Prizm" just the base Prizm?',
    answer: 'Yes. In Panini Prizm products the base Prizm card has a silvery chrome finish — many collectors call it "Silver Prizm" informally. It is unnumbered. The actual numbered color tiers (Red, Blue, Purple, Orange, Green, Gold, Black) sit above it. One common beginner mistake: paying premium prices for a base Silver Prizm thinking it is a special parallel. It is the base.',
  },
  {
    question: 'How do I value a parallel I pulled?',
    answer: 'Three factors: (1) the underlying player demand — a Patrick Mahomes Blue Prizm /99 is worth much more than a bench player Blue Prizm /99 even at the same print run; (2) the parallel tier — Green /25 beats Purple /75 beats Blue /149 as a rule of thumb at the same player; (3) sold comp data — always check eBay sold listings for the specific card + parallel. Use the Rainbow Value Estimator on this page as a rough multiplier starting point.',
  },
];

export default function ParallelRainbowPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'The Parallel Rainbow Encyclopedia — Every Refractor, Prizm & Parallel Explained',
        description: 'Visual reference for 8 major card parallel systems with print runs, rarity tiers, and typical value multipliers.',
        url: 'https://cardvault-two.vercel.app/parallel-rainbow',
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
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-950/60 via-yellow-950/60 to-cyan-950/60 border border-purple-800/50 text-purple-300 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-purple-300 rounded-full animate-pulse" />
          Visual Reference &middot; 8 Systems &middot; 75+ Parallels
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-red-400 via-yellow-300 via-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-3">
          The Parallel Rainbow Encyclopedia
        </h1>
        <p className="text-gray-400 text-lg max-w-3xl leading-relaxed">
          Every refractor, every Prizm, every tier — decoded. The 8 major parallel systems in modern card
          collecting, with real print runs, rarity tiers, and typical value multipliers vs base. Built for the
          collector who just pulled something shiny and wants to know what it is worth.
        </p>
      </div>

      {/* Primer */}
      <div className="mb-10 grid sm:grid-cols-3 gap-3">
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
          <div className="text-[10px] uppercase tracking-wider text-cyan-400 font-semibold mb-2">Invented 1993</div>
          <div className="text-sm text-white font-medium mb-1">Topps Finest</div>
          <div className="text-xs text-gray-400">First refractor ever printed. Rainbow shimmer foil stock. Revolutionized what a "hit" means in a box.</div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
          <div className="text-[10px] uppercase tracking-wider text-yellow-400 font-semibold mb-2">Peaked 2012</div>
          <div className="text-sm text-white font-medium mb-1">Panini Prizm Launch</div>
          <div className="text-xs text-gray-400">The Prizm rainbow becomes the flagship for football and basketball. Modern hobby collectors have now grown up on Prizm as the standard.</div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
          <div className="text-[10px] uppercase tracking-wider text-purple-400 font-semibold mb-2">Today</div>
          <div className="text-sm text-white font-medium mb-1">75+ Parallels</div>
          <div className="text-xs text-gray-400">A single elite rookie now has 20-30 distinct parallel versions across Chrome and Prizm. Completing a rainbow is a multi-year pursuit.</div>
        </div>
      </div>

      <ParallelRainbowClient />

      {/* FAQ */}
      <div className="mt-12 bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, idx) => (
            <details key={idx} className="group">
              <summary className="cursor-pointer text-white font-medium text-sm hover:text-purple-400 transition-colors list-none flex items-center gap-2">
                <span className="text-purple-400/60 group-open:rotate-90 transition-transform">&#9654;</span>
                {faq.question}
              </summary>
              <p className="text-gray-400 text-sm mt-2 ml-5 leading-relaxed">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>

      {/* Internal Links */}
      <div className="mt-8 text-sm text-gray-500">
        <p>
          Part of the <Link href="/guides" className="text-purple-400 hover:underline">CardVault Guides</Link> collection.
          See also:{' '}
          <Link href="/card-hall-of-fame" className="text-purple-400 hover:underline">Card Hall of Fame</Link>,{' '}
          <Link href="/guides/card-collecting-glossary" className="text-purple-400 hover:underline">Collecting Glossary</Link>,{' '}
          <Link href="/card-encyclopedia" className="text-purple-400 hover:underline">Card Encyclopedia</Link>,{' '}
          <Link href="/tools/pop-report" className="text-purple-400 hover:underline">Pop Report Tool</Link>,{' '}
          <Link href="/guides/most-valuable-sports-cards" className="text-purple-400 hover:underline">Most Valuable Cards</Link>.
        </p>
      </div>
    </div>
  );
}
