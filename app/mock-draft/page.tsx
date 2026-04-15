import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import MockDraftClient from './MockDraftClient';

export const metadata: Metadata = {
  title: 'Mock Draft Simulator — Be the GM, Build Your Rookie Card Portfolio',
  description: 'Free NFL Mock Draft simulator for card collectors. Pick a team, draft prospects over 3 rounds, and build the best rookie card portfolio. See card values for each pick, compete for highest total portfolio value. Perfect for draft week preparation.',
  openGraph: {
    title: 'Mock Draft Simulator — CardVault',
    description: 'Be the GM. Draft prospects, build a rookie card portfolio, beat the AI.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Mock Draft Simulator — CardVault',
    description: 'Draft prospects and build a winning rookie card portfolio. Free mock draft game.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Mock Draft Simulator' },
];

const faqItems = [
  {
    question: 'Which rookie cards spike most after the NFL Draft?',
    answer: 'Quarterbacks see the biggest spikes — often 100-300% within 48 hours of being drafted to a good team. Wide receivers and running backs typically spike 50-150%. Defensive players see smaller bumps (20-60%) unless they go to a major market team. Landing spot matters enormously: a QB drafted by Dallas or New York will spike more than the same player drafted by Jacksonville.',
  },
  {
    question: 'When should I buy rookie cards — before or after the draft?',
    answer: 'Buy BEFORE the draft for players you are confident will be top-10 picks. Pre-draft prices are lower because landing spot uncertainty suppresses demand. After the draft, prices spike immediately — often within minutes of the pick being announced. The optimal strategy is to buy pre-draft and sell within 24-48 hours of the pick for players who land in premium spots.',
  },
  {
    question: 'What are the best rookie card sets to target for NFL Draft picks?',
    answer: 'For pre-draft: Bowman University, Panini Prizm Draft Picks, and Contenders Draft Picks are the main sets. For post-draft NFL licensed cards: Panini Prizm, Donruss Optic, Select, and Mosaic are the premium options. Topps does not currently have an NFL license. Chrome-style cards (Prizm, Optic) consistently hold value better than base paper.',
  },
  {
    question: 'How does the 2025 NFL Draft class compare to recent years for card collectors?',
    answer: 'The 2025 class is QB-heavy with Cam Ward, Shedeur Sanders, and Jalen Milroe all generating significant hobby buzz. Travis Hunter as a two-way player is a unique hobby asset. The class is considered above-average for card collecting potential, though not as strong as the 2021 class (Lawrence, Lance, Fields, Wilson, Jones) which was historic for QB volume.',
  },
];

export default function MockDraftPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Mock Draft Simulator',
        description: 'NFL Mock Draft simulator for card collectors. Draft prospects, build a rookie card portfolio, compete for highest value.',
        url: 'https://cardvault-two.vercel.app/mock-draft',
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
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          2025 NFL Draft &middot; 3 Rounds &middot; Card Values &middot; Portfolio Score &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Mock Draft Simulator</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Be the GM. Pick your NFL team, draft prospects over 3 rounds, and build the most
          valuable rookie card portfolio. See projected card values for every pick.
        </p>
      </div>

      <MockDraftClient />

      {/* FAQ Section */}
      <section className="mt-16 mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((f, i) => (
            <details key={i} className="group bg-gray-800/50 border border-gray-700 rounded-xl">
              <summary className="cursor-pointer px-6 py-4 text-white font-medium list-none flex items-center justify-between">
                {f.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform">&#9662;</span>
              </summary>
              <div className="px-6 pb-4 text-gray-400 text-sm leading-relaxed">{f.answer}</div>
            </details>
          ))}
        </div>
      </section>

      {/* Related */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-white mb-4">Related</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/tools/draft-predictor', label: 'Draft Predictor', icon: '🎯' },
            { href: '/draft-war-room', label: 'Draft War Room', icon: '🏟️' },
            { href: '/tools/prospect-tracker', label: 'Prospect Pipeline', icon: '🔮' },
            { href: '/tools/investment-calc', label: 'Investment Calculator', icon: '📊' },
            { href: '/tools/flip-calc', label: 'Flip Profit Calculator', icon: '💰' },
            { href: '/rookies', label: 'Rookie Card Index', icon: '⭐' },
          ].map(t => (
            <Link
              key={t.href}
              href={t.href}
              className="flex items-center gap-2 px-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-xl text-sm text-gray-300 hover:text-white transition-colors"
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
