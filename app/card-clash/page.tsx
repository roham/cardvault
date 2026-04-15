import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardClashClient from './CardClashClient';

export const metadata: Metadata = {
  title: 'Card Clash — Head-to-Head Card Draft Battle | CardVault',
  description: 'Draft cards head-to-head against an AI opponent. 12 cards on the table, alternate picks, 6 each. Highest total value wins the round. Best of 3 wins the match. Three AI personalities: aggressive, strategic, and balanced. Daily seed, streak tracking, shareable results. Free card collecting game.',
  openGraph: {
    title: 'Card Clash — Draft Battle | CardVault',
    description: 'Draft cards head-to-head against AI. 12 cards, alternate picks, best of 3. Can you outdraft the AI?',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Clash — CardVault',
    description: 'Head-to-head card drafting. Pick cards, beat the AI, build your streak. Free daily game.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/games' },
  { label: 'Card Clash' },
];

const faqItems = [
  {
    question: 'How does Card Clash work?',
    answer: 'Card Clash is a head-to-head card drafting game. Each round, 12 random cards from the 6,200+ card database are laid out on the table. You and an AI opponent take turns picking cards — you always pick first. After 6 picks each (all 12 cards taken), the player with the higher total card value wins the round. The match is best of 3 rounds. Strategy matters: do you grab the highest value card, or deny the AI a card it needs?',
  },
  {
    question: 'What are the AI personality types?',
    answer: 'Each match randomly assigns one of three AI opponents. "Max Value" (aggressive) always grabs the highest value card available. "Deny King" (strategic) watches what sport you\'re collecting and tries to steal valuable cards in your preferred sport. "Steady Eddie" (balanced) mixes high-value grabs with occasional deny plays. Each personality requires different counter-strategies to beat consistently.',
  },
  {
    question: 'Is Card Clash the same every day?',
    answer: 'Yes — Card Clash uses a daily seed, so the card pools and AI personality are the same for everyone on the same day. This means you can compare strategies with friends or discuss optimal picks. The seed changes at midnight, giving you a fresh match every day.',
  },
  {
    question: 'How do I beat the strategic AI?',
    answer: 'Against the "Deny King" strategic AI, the best counter is to diversify your picks across multiple sports early so the AI can\'t identify your strategy. If you pick 3 baseball cards in a row, the AI will start grabbing baseball cards to deny you. Mix sports in your first few picks, then pivot to grabbing remaining high-value cards once the AI has committed to a deny strategy on the wrong sport.',
  },
  {
    question: 'How does the streak system work?',
    answer: 'Every match you win adds 1 to your current streak. A loss resets your streak to zero. Your best-ever streak is saved permanently. Since the daily seed gives everyone the same cards, you can compare streaks with friends to see who drafts more consistently.',
  },
];

export default function CardClashPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Clash',
        description: 'Head-to-head card drafting battle against AI. Pick cards, beat your opponent, best of 3 wins.',
        url: 'https://cardvault-two.vercel.app/card-clash',
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
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          1v1 Draft &middot; 3 AI Personalities &middot; Best of 3 &middot; Daily Seed
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Card Clash
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Draft cards head-to-head against AI. 12 cards on the table. Alternate picks. Highest total value wins. Can you outdraft the machine?
        </p>
      </div>

      <CardClashClient />

      {/* FAQ */}
      <section className="mt-12 border-t border-gray-800 pt-10">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((faq, i) => (
            <details key={i} className="group">
              <summary className="cursor-pointer text-white font-medium hover:text-emerald-400 transition-colors">
                {faq.question}
              </summary>
              <p className="mt-2 text-gray-400 text-sm leading-relaxed pl-4 border-l-2 border-gray-800">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Internal links */}
      <section className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-lg font-bold text-white mb-3">More Card Games</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { href: '/collection-draft', label: 'Collection Draft', desc: 'Snake draft cards against AI opponents' },
            { href: '/card-battle', label: 'Card Battles', desc: 'Stat-based card battles with grade multipliers' },
            { href: '/card-stack', label: 'Card Stack Challenge', desc: 'Build a 5-card stack totaling exactly $500' },
            { href: '/card-roulette', label: 'Card Roulette', desc: 'Spin the wheel, buy or pass on 20 cards' },
            { href: '/card-detective', label: 'Card Detective', desc: 'Daily mystery card guessing game' },
            { href: '/market-tycoon', label: 'Market Tycoon', desc: 'Trade cards over 20 simulated days' },
          ].map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="block p-3 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl transition-colors"
            >
              <div className="text-white font-medium text-sm">{link.label}</div>
              <div className="text-gray-500 text-xs mt-0.5">{link.desc}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
