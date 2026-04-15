import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardWarClient from './CardWarClient';

export const metadata: Metadata = {
  title: 'Card War — Guess Which Card Is Worth More',
  description: 'Free card value guessing game. Two cards are drawn — pick the more valuable one. Learn real card prices while playing. Uses 6,000+ real sports cards with actual market values. Streak tracking, high scores, and shareable results.',
  openGraph: {
    title: 'Card War — CardVault',
    description: 'Which card is worth more? Test your card value knowledge in this addictive guessing game.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card War — CardVault',
    description: 'Two cards, one choice. Pick the more valuable card. Free.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Card War' },
];

const faqItems = [
  {
    question: 'How do you determine card values in Card War?',
    answer: 'Card values are based on estimated PSA 10 (Gem Mint) prices from recent eBay sold listings and major auction houses. Values are updated regularly and reflect real market conditions. Some vintage cards are valued at PSA 7-9 where gem mint copies are extremely rare.',
  },
  {
    question: 'What makes some sports cards more valuable than others?',
    answer: 'Card value is driven by: player popularity and performance, card rarity (print run, parallels), condition (grade), age (vintage premium), whether it is a rookie card, and the set it belongs to. A Mickey Mantle 1952 Topps is valuable because of all these factors combined — iconic player, vintage age, limited surviving copies, and the most famous set in the hobby.',
  },
  {
    question: 'Why are rookie cards worth more than other cards?',
    answer: 'Rookie cards are a player\'s first officially licensed card and serve as the "stock" of that player\'s career. They capture the most upside — if a rookie becomes a Hall of Famer, the RC appreciates the most. The hobby convention of "rookie card = flagship card" drives demand and liquidity.',
  },
  {
    question: 'Are vintage cards always worth more than modern cards?',
    answer: 'Not always. While vintage cards have a scarcity premium (fewer survived in good condition), modern cards of elite players can match or exceed vintage values. A PSA 10 2018-19 Prizm Luka Doncic RC ($5,000+) is worth more than many 1960s stars in similar condition. The key factors are player greatness, card condition, and supply.',
  },
];

export default function CardWarPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card War',
        description: 'Guess which card is worth more. Learn real card values while playing. 6,000+ real sports cards.',
        url: 'https://cardvault-two.vercel.app/card-war',
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
          6,000+ Cards &middot; Real Prices &middot; Streak Tracking &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card War</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Two cards. One question: which is worth more? Test your hobby knowledge and
          learn real market values. Streak tracking and high scores included.
        </p>
      </div>

      <CardWarClient />

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

      {/* Related Games */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-white mb-4">More Card Games</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/card-streak', label: 'Card Streak', icon: '🔥' },
            { href: '/card-roulette', label: 'Card Roulette', icon: '🎰' },
            { href: '/flip-or-keep', label: 'Flip or Keep', icon: '💰' },
            { href: '/guess-the-card', label: 'Guess the Card', icon: '🧩' },
            { href: '/price-is-right', label: 'Price is Right', icon: '💵' },
            { href: '/card-ladder', label: 'Card Ladder', icon: '🪜' },
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
