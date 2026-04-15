import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import DraftLiveClient from './DraftLiveClient';

export const metadata: Metadata = {
  title: 'Draft Night Live — 2026 NFL & NBA Mock Draft with Card Impact Tracker | CardVault',
  description: 'Follow the 2026 NFL and NBA Drafts pick by pick with real-time card price impact tracking. Mock draft board, hot takes, collector chat, reaction emojis, and card investment tips. See which rookies will spike your portfolio.',
  openGraph: {
    title: 'Draft Night Live — Card Impact Tracker | CardVault',
    description: 'Follow every draft pick with card price impact tracking, hot takes, and collector chat. NFL & NBA 2026 mock drafts.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Draft Night Live — 2026 NFL & NBA Draft Tracker',
    description: 'Pick-by-pick draft board with card price impacts, hot takes, and live collector chat.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Draft Night Live' },
];

const faqItems = [
  {
    question: 'How does the Draft Night Card Impact Tracker work?',
    answer: 'The Card Impact Tracker shows estimated price movements for each draft pick. When a player gets drafted to a specific team, their card values change based on landing spot, team market size, and expected playing time. QBs drafted to large-market teams see the biggest spikes. The tracker shows both percentage increases for existing cards and estimated starting values for new rookie cards entering the market.',
  },
  {
    question: 'When is the 2026 NFL Draft?',
    answer: 'The 2026 NFL Draft is scheduled for April 24-26, 2026 in Green Bay, Wisconsin. Round 1 is Thursday evening (April 24), Rounds 2-3 are Friday (April 25), and Rounds 4-7 are Saturday (April 26). CardVault will track every pick with real-time card price impact analysis.',
  },
  {
    question: 'Should I buy rookie cards before or after the draft?',
    answer: 'Pre-draft cards (Bowman University, Prizm Draft Picks) tend to spike 30-200% on draft night as landing spots are revealed. However, the initial spike usually corrects within 48 hours. The best strategy is to buy cards of prospects you believe in BEFORE the draft, then decide whether to hold or sell based on landing spot. QBs going to large-market teams (New York, Dallas, Chicago) see the biggest and most sustained value increases.',
  },
  {
    question: 'What types of cards spike the most on draft night?',
    answer: 'Quarterbacks see the largest price spikes — a QB going #1 overall can see 200%+ increases. Skill position players (WR, RB, TE) see 50-100% spikes. Defensive players see smaller increases (20-50%) but also carry less downside risk. Landing spot matters more than pick number — a WR drafted by the Cowboys or Chiefs will spike more than one drafted by a rebuilding team.',
  },
  {
    question: 'What is the hot take commentary?',
    answer: 'Each pick includes a simulated hot take from a card collecting perspective — predicting whether the pick will be good or bad for card values. These are entertainment and analysis combined, similar to what you would hear on a draft night podcast. Use them as conversation starters, not investment advice.',
  },
];

export default function DraftLivePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Draft Night Live — Card Impact Tracker',
        description: 'Follow 2026 NFL and NBA Drafts pick by pick with real-time card price impact tracking, hot takes, and collector chat.',
        url: 'https://cardvault-two.vercel.app/draft-live',
        applicationCategory: 'SportsApplication',
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

      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">
          Draft Night Live
        </h1>
        <p className="text-gray-400 text-base max-w-2xl">
          Follow the 2026 NFL & NBA Drafts pick by pick. Track card price impacts in real time, react to picks, and see which rookies are about to spike your portfolio.
        </p>
      </div>

      <DraftLiveClient />

      {/* How It Works */}
      <section className="mt-16 bg-gray-900/40 border border-gray-800/30 rounded-2xl p-6 sm:p-8">
        <h2 className="text-xl font-bold text-white mb-4">How Draft Night Live Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { step: '1', title: 'Watch the Board', desc: 'Reveal picks one by one or see the full round instantly. Each pick shows team, player, position, and college.' },
            { step: '2', title: 'Track Card Impact', desc: 'See estimated price movements for each pick. Existing card holders see percentage gains. New rookies show expected starting values.' },
            { step: '3', title: 'React & Chat', desc: 'Vote on each pick with reaction emojis. Follow the live chat for collector reactions and hot takes from the community.' },
            { step: '4', title: 'Make Moves', desc: 'Use the Card Impact Tracker to identify which rookies to buy, hold, or sell. Link directly to card pages and investment tools.' },
          ].map(item => (
            <div key={item.step} className="text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-900/50 border border-emerald-700/30 flex items-center justify-center text-emerald-400 font-bold mx-auto mb-3">
                {item.step}
              </div>
              <h3 className="text-white font-semibold text-sm mb-1">{item.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mt-12">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <details key={i} className="group bg-gray-900/40 border border-gray-800/30 rounded-xl">
              <summary className="cursor-pointer p-4 text-white font-medium text-sm flex items-center justify-between">
                {item.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform">&#9660;</span>
              </summary>
              <div className="px-4 pb-4 text-gray-400 text-sm leading-relaxed">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Cross Links */}
      <section className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/tools/draft-predictor" className="bg-gray-900/40 border border-gray-800/30 rounded-xl p-4 hover:border-emerald-700/30 transition-colors">
          <h3 className="text-white font-bold text-sm mb-1">Draft Night Predictor</h3>
          <p className="text-gray-500 text-xs">See which cards spike the most on draft night</p>
        </Link>
        <Link href="/predictions" className="bg-gray-900/40 border border-gray-800/30 rounded-xl p-4 hover:border-emerald-700/30 transition-colors">
          <h3 className="text-white font-bold text-sm mb-1">Prediction Markets</h3>
          <p className="text-gray-500 text-xs">Make picks on card price movements</p>
        </Link>
        <Link href="/prospects" className="bg-gray-900/40 border border-gray-800/30 rounded-xl p-4 hover:border-emerald-700/30 transition-colors">
          <h3 className="text-white font-bold text-sm mb-1">Prospect Rankings</h3>
          <p className="text-gray-500 text-xs">Weekly-updated top rookie card rankings</p>
        </Link>
      </section>
    </div>
  );
}
