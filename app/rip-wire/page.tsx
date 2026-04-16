import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import RipWireClient from './RipWireClient';

export const metadata: Metadata = {
  title: 'Rip Wire — Live Pack-Rip Pulls Feed | CardVault',
  description: 'Simulated live ticker of pack-opening pulls across sports. Someone hits a 1/1 Superfractor. Someone pulls an on-card rookie auto. A common case-break breaks open in front of you. Filter by sport and by hit tier. Pause, watch, or scout the stream to find the products everyone is ripping right now.',
  openGraph: {
    title: 'Rip Wire — Live Pack-Rip Pulls Feed | CardVault',
    description: 'Live ticker of pack-opening pulls. Superfractors, autos, 1/1s — the pulls happening right now across the hobby.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Rip Wire — CardVault',
    description: 'Live pack-rip pulls feed. Watch the hits roll in.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Rip Wire' },
];

const faqItems = [
  {
    question: 'Where do these pulls come from?',
    answer: 'Rip Wire is a SIMULATED live feed built from CardVault\'s 9,900+ card database plus realistic hit-rate modeling for Topps Chrome, Bowman Chrome, Panini Prizm, Select, and Optic products. The ripper handles (e.g., @BluesPackAddict, @VintageDave) and cities are fictional; the cards, products, and estimated pull values are from real hobby data. For actual pack-opening, use our Pack Simulator at /tools/pack-sim.',
  },
  {
    question: 'What are the hit tiers?',
    answer: '1/1 SUPERFRACTOR (top tier, pink gradient): the rarest single-copy parallel on any hit card — estimated 1:20,000 to 1:100,000 packs depending on product. AUTO (amber): on-card autograph of a named player — 1:150 to 1:1,500 depending on tier. REFRACTOR (cyan): numbered parallel with print run under /499 — 1:25 to 1:300. RC (emerald): rookie card base or short-print — roughly 1-in-6 packs with rookie content. DUD (zinc): worthless base — the most-common outcome, shown occasionally for emotional realism.',
  },
  {
    question: 'Why is it mostly hits and not duds?',
    answer: 'Because the ticker is filtered for content that matters. In reality, 19 out of 20 pack rips are duds. If the feed showed every common, you\'d see nothing else. The Rip Wire simulates 5-10% dud rate to preserve emotional rhythm (hit-hit-hit-dud creates "is the next one a hit?" anticipation) while still making the feed primarily about the hits. Same editorial principle a Whatnot break-caller applies: narrate the hits, skim the bases.',
  },
  {
    question: 'How do I use this to pick products?',
    answer: 'Watch the feed for 30-60 seconds. Note which PRODUCTS keep producing hits — if 2025 Topps Chrome Football keeps showing up in the SUPERFRACTOR and AUTO tiers, that product is in rotation heavy right now. Note which PLAYERS keep hitting — if Justin Fields autos pulled 3 times in 5 minutes, Fields is a case-break hit target that week. Check the filter bar to narrow by sport and tier so you\'re scouting your niche.',
  },
  {
    question: 'Does the feed pause?',
    answer: 'Yes. Tap PAUSE in the header and the feed stops advancing while keeping existing entries visible. Timestamps still update (relative "30s ago" still counts up). Useful if you want to read a pull in detail or show someone a hit. Hit RESUME to restart the stream.',
  },
  {
    question: 'Why no sound or animation?',
    answer: 'Ticker feeds are addictive enough without dopamine audio. Rip Wire is designed for passive watching — a feed you keep open in a browser tab while doing something else, glancing back when the periphery flashes a color-coded hit. Adding sound effects or confetti would make it harder to keep open in a work tab. If you want the dopamine experience, open /tools/pack-sim and rip live.',
  },
  {
    question: 'Is this different from Listing Wire and Mailday?',
    answer: 'Yes — three different emotional axes. Mailday Live = buyer-arrival emotion (your card arrived). Listing Wire = seller-side emotion (fresh listings to hunt). Rip Wire = pack-opener emotion (watching hits roll in from other rippers). Grading Feed = grader emotion (PSA-slab results). Four orthogonal slices of hobby-flow live content. Watch them simultaneously for the full pulse.',
  },
  {
    question: 'Can I filter by ripper?',
    answer: 'Not yet. Future version will include a ripper-leaderboard showing which simulated handles are on a hot streak. For now the filter is Sport + Hit Tier. Filter state is preserved across refresh via URL params (coming in v2).',
  },
];

export default function RipWirePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Rip Wire',
        description: 'Live-feed simulation of pack-opening pulls across sports card products. Filter by sport and hit tier.',
        url: 'https://cardvault-two.vercel.app/rip-wire',
        applicationCategory: 'EntertainmentApplication',
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

      <div className="mb-6">
        <div className="inline-flex items-center gap-2 bg-pink-950/60 border border-pink-800/50 text-pink-300 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse" />
          Simulated Live Feed · Pack-Rip Pulls · Hit Tiers
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Rip Wire</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Live ticker of pack-rip pulls. Superfractors, autos, refractors, rookies — the hits happening right now across the hobby. Filter by sport, filter by hit tier, pause to read, resume to watch.
        </p>
      </div>

      <RipWireClient />

      <div className="mt-12 bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">FAQ</h2>
        <div className="space-y-5">
          {faqItems.map((item, i) => (
            <div key={i} className="border-b border-gray-700/50 pb-4 last:border-0 last:pb-0">
              <h3 className="text-white font-semibold mb-1.5 text-sm">{item.question}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">More Live Feeds</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link href="/listing-wire" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">💹</span>
            <div>
              <div className="text-white text-sm font-medium">Listing Wire</div>
              <div className="text-gray-500 text-xs">Marketplace feed</div>
            </div>
          </Link>
          <Link href="/mailday" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">📬</span>
            <div>
              <div className="text-white text-sm font-medium">Mailday Live</div>
              <div className="text-gray-500 text-xs">Arrival feed</div>
            </div>
          </Link>
          <Link href="/tools/pack-sim" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">🎰</span>
            <div>
              <div className="text-white text-sm font-medium">Pack Simulator</div>
              <div className="text-gray-500 text-xs">Rip live</div>
            </div>
          </Link>
          <Link href="/news" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">📰</span>
            <div>
              <div className="text-white text-sm font-medium">News Feed</div>
              <div className="text-gray-500 text-xs">Daily digest</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
