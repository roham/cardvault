import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardThriftClient from './CardThriftClient';

export const metadata: Metadata = {
  title: 'Card Thrift Store — Bargain Bin Card Dig | CardVault',
  description: 'Dig through a thrift store bargain bin of 20 unmarked cards. Only year and sport are visible. Pick 10 for $50 and find hidden gems. Daily + Random modes. Free.',
  openGraph: {
    title: 'Card Thrift Store — Bargain Bin Card Dig | CardVault',
    description: 'Pick 10 of 20 cards with only year and sport shown. Flip to reveal values. Beat the bin.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Thrift Store — CardVault',
    description: 'Bargain bin card dig. Pick with partial info, flip for value. Free.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/games' },
  { label: 'Card Thrift Store' },
];

const faqItems = [
  {
    question: 'How does Card Thrift Store work?',
    answer: 'You walk into a simulated thrift store where a bin holds 20 unmarked cards pulled from our 9,800+ card database. Each card shows only its year and sport — no player, no set, no price. You have $50 to spend and each card costs $5, so you pick any 10. After you check out, every card is flipped to reveal its actual market value. Your score is total revealed value minus your $50 spend.',
  },
  {
    question: 'What strategy should I use?',
    answer: 'Every era has hits and duds. Vintage (pre-1980) cards have huge variance — could be a junk commons or a $10K grail. Late-80s/early-90s is the famous "junk wax" era where most cards are worth pennies, but a few rookies broke out. Modern (2020+) is heavy on rookies — high ceiling, low floor. Filtering by sport narrows the pool so you can specialize: NHL has more sleepers, NBA rookies have the highest peaks.',
  },
  {
    question: 'What determines my grade?',
    answer: 'Your grade is based on total profit ($ value of 10 picks minus $50 paid). S-grade is $500+ profit (typically means you found one big hit). A-grade is $200-$499. B is $100-$199. C is $25-$99. D is breakeven to $25. F is negative profit. Any single card over $100 is a "Gem Found" bonus notification.',
  },
  {
    question: 'Can I change which sport appears in the bin?',
    answer: 'Yes. Before starting a run, choose a sport filter: All Sports (most variety), MLB only, NBA only, NFL only, or NHL only. Each filter pulls the 20 cards from a different subset of our database. Specialized bins tend to be more predictable but may have fewer huge upside hits.',
  },
  {
    question: 'Difference between Daily and Random modes?',
    answer: 'Daily mode uses a date-seeded random so every player sees the same 20-card bin for that day — compare your picks with friends. Random mode reshuffles the bin every run, for unlimited practice and variance training.',
  },
  {
    question: 'Is any of this real inventory?',
    answer: 'The cards pulled into the bin are real cards from our database with real estimated market values. The thrift store itself is simulated — no actual cards change hands and no money is spent. It is a risk-free dig simulator for training your eye on variance.',
  },
];

export default function CardThriftStorePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Thrift Store',
        description: 'Bargain bin card selection game. Pick 10 of 20 cards shown with year and sport only. Flip to reveal values.',
        url: 'https://cardvault-two.vercel.app/card-thrift',
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
        <div className="inline-flex items-center gap-2 bg-orange-950/60 border border-orange-800/50 text-orange-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
          Bargain Bin Game &middot; 9,800+ Cards &middot; Daily + Random
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Thrift Store</h1>
        <p className="text-gray-400 text-lg">
          Twenty unmarked cards in a bin. You only see year and sport. Pick 10 for $50 and flip to reveal what you paid for.
          Hidden gems, junk wax, and vintage surprises.
        </p>
      </div>

      <CardThriftClient />

      <section className="mt-16 border-t border-gray-800 pt-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map(f => (
            <details key={f.question} className="group bg-gray-900 border border-gray-800 rounded-xl">
              <summary className="px-5 py-4 text-white font-medium cursor-pointer hover:text-orange-400 transition-colors">
                {f.question}
              </summary>
              <div className="px-5 pb-4 text-gray-400 text-sm">
                {f.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-8 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">More Card Games</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href="/vault/mystery-crate" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-orange-700/50 rounded-xl transition-colors">
            <span className="text-xl">📦</span>
            <div><div className="text-white text-sm font-medium">Mystery Crate</div><div className="text-gray-500 text-xs">Buy crates, reveal contents</div></div>
          </Link>
          <Link href="/vault/pawn-shop" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-orange-700/50 rounded-xl transition-colors">
            <span className="text-xl">🏪</span>
            <div><div className="text-white text-sm font-medium">Pawn Shop</div><div className="text-gray-500 text-xs">Negotiate with AI broker</div></div>
          </Link>
          <Link href="/vault/raffle" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-orange-700/50 rounded-xl transition-colors">
            <span className="text-xl">🎟️</span>
            <div><div className="text-white text-sm font-medium">Card Raffle</div><div className="text-gray-500 text-xs">Buy tickets, win cards</div></div>
          </Link>
          <Link href="/vault/auction" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-orange-700/50 rounded-xl transition-colors">
            <span className="text-xl">🔨</span>
            <div><div className="text-white text-sm font-medium">Auction House</div><div className="text-gray-500 text-xs">Bid against AI collectors</div></div>
          </Link>
          <Link href="/card-dig" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-orange-700/50 rounded-xl transition-colors">
            <span className="text-xl">⛏️</span>
            <div><div className="text-white text-sm font-medium">Card Dig</div><div className="text-gray-500 text-xs">Excavation puzzle game</div></div>
          </Link>
          <Link href="/card-gauntlet" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-orange-700/50 rounded-xl transition-colors">
            <span className="text-xl">🔥</span>
            <div><div className="text-white text-sm font-medium">Card Gauntlet</div><div className="text-gray-500 text-xs">Endless survival game</div></div>
          </Link>
        </div>
      </section>
    </div>
  );
}
