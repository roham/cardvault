import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import DraftWarRoomClient from './DraftWarRoomClient';

export const metadata: Metadata = {
  title: 'Draft War Room — 2025 NFL & NBA Draft Night Card Companion | CardVault',
  description: 'Your draft night command center for sports card collecting. Track 2025 NFL and NBA draft picks with instant card value predictions, spike estimates, and a build-your-own draft portfolio. Know what to buy before each pick is announced.',
  openGraph: {
    title: 'Draft War Room — 2025 NFL & NBA Draft | CardVault',
    description: 'Draft night card collecting companion. Track picks, card values, and build your portfolio in real time.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Draft War Room — CardVault',
    description: '2025 NFL and NBA Draft card companion. Track picks and card values live.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Draft War Room' },
];

const faqItems = [
  {
    question: 'What is the Draft War Room?',
    answer: 'The Draft War Room is your command center for draft night card collecting. It shows each pick with pre-draft card values, post-draft spike estimates, the specific card to buy, and a portfolio tracker. Switch between the 2025 NFL Draft (April 24-26) and 2025 NBA Draft (June 25-26).',
  },
  {
    question: 'How accurate are the spike predictions?',
    answer: 'Spike predictions are based on historical draft-night data: QBs picked 1-3 typically see 200-350% spikes, WRs see 150-250%, RBs 150-200%, and defensive players 80-150%. First overall picks consistently spike the most. Actual results depend on landing spot, team market size, and pre-draft hype level.',
  },
  {
    question: 'What is the Draft Portfolio?',
    answer: 'The Draft Portfolio lets you track which players you are buying on draft night. Click "Track" on any pick to add them. The portfolio shows your total estimated value and lets you monitor your draft night haul. It is like a fantasy football draft but for card collecting.',
  },
  {
    question: 'When should I buy draft night cards?',
    answer: 'The best time to buy is BEFORE the pick is announced — pre-draft prices are lowest. Prices spike within minutes of the pick. If you miss the window, wait 2-3 weeks for the initial hype to cool. Draft night is the single biggest card price event of the year for rookies.',
  },
  {
    question: 'What card sets should I focus on for draft picks?',
    answer: 'For football: Bowman University (available before the draft) and Panini Prizm Draft Picks are the two key sets. For basketball: Panini Prizm Draft is the main product. Chrome and auto versions carry the highest premiums. Base versions are the most liquid for quick flips.',
  },
];

export default function DraftWarRoomPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Draft War Room',
        description: 'Draft night command center for sports card collectors. Track 2025 NFL and NBA picks with card value predictions and portfolio builder.',
        url: 'https://cardvault-two.vercel.app/draft-war-room',
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
        <div className="inline-flex items-center gap-2 bg-yellow-950/60 border border-yellow-800/50 text-yellow-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
          NFL Apr 24-26 - NBA Jun 25-26 - Card Values - Portfolio Builder
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Draft War Room</h1>
        <p className="text-gray-400 text-lg">
          Your draft night command center. Track every pick with instant card value predictions, spike estimates, and the cards to buy. Build your draft night portfolio.
        </p>
      </div>

      <DraftWarRoomClient />

      {/* FAQ section */}
      <section className="mt-16 border-t border-gray-800 pt-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map(f => (
            <details key={f.question} className="group bg-gray-900 border border-gray-800 rounded-xl">
              <summary className="px-5 py-4 text-white font-medium cursor-pointer hover:text-yellow-400 transition-colors">
                {f.question}
              </summary>
              <div className="px-5 pb-4 text-gray-400 text-sm">
                {f.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Internal Links */}
      <section className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Draft Night Essentials</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/tools/draft-predictor', label: 'Draft Night Predictor', desc: 'Full draft card value analysis' },
            { href: '/tools/rookie-finder', label: 'Rookie Card Finder', desc: 'Search all rookie cards' },
            { href: '/tools/pack-odds', label: 'Pack Odds Calculator', desc: 'Hit rates for draft products' },
            { href: '/tools/watchlist', label: 'Price Watchlist', desc: 'Track draft prospect cards' },
            { href: '/market-movers', label: 'Market Movers', desc: 'See draft-night price spikes' },
            { href: '/tools/rip-or-hold', label: 'Rip or Hold', desc: 'Open draft boxes or hold sealed?' },
          ].map(link => (
            <Link key={link.href} href={link.href} className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-yellow-700 transition-colors group">
              <div className="text-white text-sm font-medium group-hover:text-yellow-400 transition-colors">{link.label}</div>
              <div className="text-gray-500 text-xs mt-1">{link.desc}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
