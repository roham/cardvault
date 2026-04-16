import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardTycoonClient from './CardTycoonClient';

export const metadata: Metadata = {
  title: 'Card Tycoon — Buy Low, Sell High Card Market Simulator | CardVault',
  description: 'Play Card Tycoon, the card market trading simulator. Start with $500, buy and sell sports cards across 10 rounds of market fluctuations. Learn card flipping strategy while having fun. Free daily challenge.',
  openGraph: {
    title: 'Card Tycoon — Can You Beat the Card Market? | CardVault',
    description: 'Start with $500. Buy low, sell high across 10 rounds. How much can you grow your card portfolio?',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Tycoon — CardVault',
    description: 'Card market trading simulator. Start with $500, grow your portfolio across 10 rounds.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/games' },
  { label: 'Card Tycoon' },
];

const faqItems = [
  {
    question: 'What is Card Tycoon?',
    answer: 'Card Tycoon is a card market trading simulator where you start with $500 and try to grow your portfolio by buying and selling sports cards over 10 rounds. Each round, the market shows 3 cards at current prices. You decide when to buy, hold, and sell based on price movements. Your final score is your total value (cash + portfolio) after all 10 rounds.',
  },
  {
    question: 'How do card prices change between rounds?',
    answer: 'Card prices fluctuate each round by up to 20% in either direction, with a slight upward bias mimicking real card market trends. Some cards will spike in value while others drop. The key to winning is buying undervalued cards and selling when prices peak — just like real card flipping.',
  },
  {
    question: 'What is the Daily Challenge?',
    answer: 'The Daily Challenge uses the same card market for everyone on a given day, so you can compare your trading skills with other players. The Random Market mode generates a fresh set of cards each game, letting you practice different strategies without competing on the same board.',
  },
  {
    question: 'What do the letter grades mean?',
    answer: 'Your grade is based on total profit: S (Card Mogul, +$200+), A (Smart Investor, +$100-199), B (Savvy Trader, +$50-99), C (Careful Collector, $0-49), D (Learning Curve, -$1 to -$100), F (Bust, worse than -$100). The game teaches real card market dynamics — when to buy the dip, when to take profits, and when to hold.',
  },
  {
    question: 'How does this help me with real card collecting?',
    answer: 'Card Tycoon teaches the fundamentals of card flipping and investing: buy when prices are low (dips), sell into strength (rallies), diversify across sports, and manage your cash reserves so you can capitalize on deals. The same principles apply whether you are flipping cards on eBay or buying at card shows.',
  },
];

export default function CardTycoonPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Tycoon — Buy Low, Sell High Card Market Simulator',
        description: 'Card market trading simulator. Buy and sell sports cards across 10 rounds of market fluctuations.',
        url: 'https://cardvault-two.vercel.app/card-tycoon',
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
        <div className="inline-flex items-center gap-2 bg-green-950/60 border border-green-800/50 text-green-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          Market Simulator &middot; 10 Rounds &middot; Daily Challenge
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Tycoon</h1>
        <p className="text-gray-400 text-lg">
          Start with $500. Buy low, sell high. Grow your card portfolio across 10 rounds
          of market fluctuations. Can you beat the market?
        </p>
      </div>

      <CardTycoonClient />

      {/* FAQ */}
      <div className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map(f => (
            <details key={f.question} className="group bg-gray-900/80 border border-gray-800 rounded-lg">
              <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-gray-200 hover:text-white flex items-center justify-between">
                {f.question}
                <span className="text-gray-600 group-open:rotate-180 transition-transform">&#x25BC;</span>
              </summary>
              <div className="px-4 pb-4 text-sm text-gray-400">{f.answer}</div>
            </details>
          ))}
        </div>
      </div>

      {/* Internal Links */}
      <div className="mt-8 text-sm text-gray-500 space-y-1">
        <p>
          More games: <Link href="/card-streak" className="text-amber-400 hover:underline">Card Streak</Link> &middot;{' '}
          <Link href="/flip-or-keep" className="text-amber-400 hover:underline">Flip or Keep</Link> &middot;{' '}
          <Link href="/card-auction" className="text-amber-400 hover:underline">Auction House</Link> &middot;{' '}
          <Link href="/card-market-simulator" className="text-amber-400 hover:underline">Market Simulator</Link>
        </p>
        <p>
          Tools: <Link href="/tools/flip-calc" className="text-amber-400 hover:underline">Flip Calculator</Link> &middot;{' '}
          <Link href="/tools/flip-scorer" className="text-amber-400 hover:underline">Flip Scorer</Link> &middot;{' '}
          <Link href="/tools/investment-calc" className="text-amber-400 hover:underline">Investment Calculator</Link> &middot;{' '}
          <Link href="/tools" className="text-amber-400 hover:underline">All Tools</Link>
        </p>
      </div>
    </div>
  );
}
