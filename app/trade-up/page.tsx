import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import TradeUpClient from './TradeUpClient';

export const metadata: Metadata = {
  title: 'Card Trade-Up Challenge — Turn $5 into $500 | CardVault',
  description: 'Start with a $5 common card and trade your way to a grail. 10 rounds of trade offers from collectors — accept, reject, or keep what you have. Free card collecting game.',
  openGraph: {
    title: 'Card Trade-Up Challenge — CardVault',
    description: 'Start with a $5 card and trade up to a grail. 10 rounds, 3 offers each. Can you hit $500?',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Trade-Up Challenge — CardVault',
    description: 'Turn a $5 common into a $500 grail through smart trades. 10 rounds.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/games' },
  { label: 'Trade-Up Challenge' },
];

const faqItems = [
  {
    question: 'How does the Card Trade-Up Challenge work?',
    answer: 'You start with a $5 common card from the card pool. Each round, three different collectors offer you trades — their card for yours. Some offers are upgrades, some are lateral moves, and some are traps. You can also choose to keep your current card if none of the offers look good. After 10 rounds, your final card value is your score. The goal is to turn $5 into $500 or more through smart trading decisions.',
  },
  {
    question: 'What makes a good trade in the game?',
    answer: 'A good trade increases your card value without taking on too much risk. Look at the offered card value compared to what you are holding. Watch out for trap offers where a lower-value card comes with a small cash sweetener — the total package may still be a downgrade. Sometimes keeping your current card is the smartest move if all three offers are downgrades.',
  },
  {
    question: 'Is this how real card trading works?',
    answer: 'The core dynamics mirror real trading: every trade has a winner and a loser, and the key skill is knowing your card values. In real life, trades happen at card shows, through Facebook groups, Reddit, and Discord servers. The motivations shown in the game (PC building, set completion, sport switching) are all real reasons collectors trade. The values used are based on real market prices for popular cards.',
  },
  {
    question: 'Can I really turn a $5 card into a $500 card through trading?',
    answer: 'In the real hobby, the famous "red paperclip" concept absolutely applies to cards. Patient traders who know their values can turn budget cards into premium ones over time. The key is finding motivated sellers, knowing which cards are undervalued, and being willing to make many small trades rather than waiting for one big win. Some collectors have documented trading up from dollar cards to PSA 10 rookies over months of persistent trading at card shows.',
  },
  {
    question: 'What do the trader motivations mean?',
    answer: 'Each offer shows why the other collector wants to trade. "Collecting that player" means they want your card for their personal collection and may overpay. "Desperate for cash" means they are offering a valuable card cheaply. "Thinks your card will spike" means they see upside in your card you might be missing. Understanding motivations helps you evaluate whether the offer is truly good or if there is a hidden catch.',
  },
];

export default function TradeUpPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Trade-Up Challenge',
        description: 'Start with a $5 card and trade your way to a grail through 10 rounds of collector trades.',
        url: 'https://cardvault-two.vercel.app/trade-up',
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
        <div className="inline-flex items-center gap-2 bg-amber-950/60 border border-amber-800/50 text-amber-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
          10 Rounds &middot; 3 Offers Each &middot; $5 to Grail
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Card Trade-Up Challenge
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl">
          Start with a $5 common card. Each round, three collectors offer you trades.
          Accept the best deal, dodge the traps, and see how high you can go in 10 rounds.
        </p>
      </div>

      <TradeUpClient />

      {/* How It Works */}
      <div className="mt-16 border-t border-zinc-800 pt-10">
        <h2 className="text-xl font-bold text-white mb-4">The Art of Trading Up</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-lg p-4">
            <p className="text-2xl mb-2">{'\u{1F50D}'}</p>
            <h3 className="font-semibold text-white mb-1">Know Your Values</h3>
            <p className="text-xs text-zinc-500">The player who knows card prices wins every trade. Study the market before you deal.</p>
          </div>
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-lg p-4">
            <p className="text-2xl mb-2">{'\u{1F4A1}'}</p>
            <h3 className="font-semibold text-white mb-1">Read Motivations</h3>
            <p className="text-xs text-zinc-500">A collector building a PC will overpay. A flipper dumping stock will underprice. Use it.</p>
          </div>
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-lg p-4">
            <p className="text-2xl mb-2">{'\u{1F6E1}\u{FE0F}'}</p>
            <h3 className="font-semibold text-white mb-1">Skip Bad Deals</h3>
            <p className="text-xs text-zinc-500">Keeping your card is always an option. Sometimes patience is the best strategy.</p>
          </div>
        </div>
      </div>

      {/* Related Games */}
      <div className="mt-16 border-t border-zinc-800 pt-10">
        <h2 className="text-xl font-bold text-white mb-4">More Card Games</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/trading-sim" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-amber-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">Trading Simulator</h3>
            <p className="text-xs text-zinc-500">Full trading experience with AI collectors</p>
          </Link>
          <Link href="/hot-potato" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-amber-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">Hot Potato</h3>
            <p className="text-xs text-zinc-500">Sell before the price crashes</p>
          </Link>
          <Link href="/market-tycoon" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-amber-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">Market Tycoon</h3>
            <p className="text-xs text-zinc-500">Trade cards over 20 market days</p>
          </Link>
          <Link href="/card-roulette" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-amber-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">Card Roulette</h3>
            <p className="text-xs text-zinc-500">Spin, buy or pass, 20 rounds</p>
          </Link>
          <Link href="/price-is-right" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-amber-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">Price Is Right</h3>
            <p className="text-xs text-zinc-500">Guess card prices without going over</p>
          </Link>
          <Link href="/card-auction" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-amber-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">Auction Showdown</h3>
            <p className="text-xs text-zinc-500">Bid against AI collectors</p>
          </Link>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-16 border-t border-zinc-800 pt-10">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((faq) => (
            <div key={faq.question}>
              <h3 className="font-semibold text-white mb-2">{faq.question}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
