import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardAuctionClient from './CardAuctionClient';
import { sportsCards } from '@/data/sports-cards';

export const metadata: Metadata = {
  title: 'Card Auction Showdown — Bid on Cards Against AI Collectors | CardVault',
  description: 'Free daily card auction game. Bid on real sports cards against 3 AI collectors with different strategies. Manage your $500 budget, win the most valuable collection. Daily auctions + practice mode.',
  openGraph: {
    title: 'Card Auction Showdown — CardVault',
    description: 'Bid on sports cards against AI collectors. Manage your budget. Win the most valuable collection.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Auction Showdown — CardVault',
    description: 'Bid on sports cards against AI opponents. Strategy meets card knowledge.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/tools' },
  { label: 'Card Auction Showdown' },
];

const faqItems = [
  {
    question: 'How does Card Auction Showdown work?',
    answer: 'You start with a $500 budget and compete against 3 AI collectors in 8 rounds of bidding. Each round, a real sports card comes up for auction. You place your bid, and the highest bidder wins the card. After all 8 rounds, the player with the most valuable collection wins. Strategy matters — spend wisely on high-value cards and let opponents waste money on lesser ones.',
  },
  {
    question: 'Who are the AI opponents?',
    answer: 'You face three AI collectors, each with a distinct strategy. "The Whale" bids aggressively on high-value cards. "The Sniper" waits patiently and strikes on undervalued lots. "The Rookie" bids emotionally and inconsistently. Learning their patterns is key to winning consistently.',
  },
  {
    question: 'What happens if I run out of budget?',
    answer: 'If your remaining budget is too low to place a minimum bid ($10), you automatically pass on the remaining lots. The AI opponents face the same constraint. Budget management is the core skill — winning every auction is actually a losing strategy because you will overpay.',
  },
  {
    question: 'Does the auction pool change daily?',
    answer: 'Yes, the Daily Auction features 8 cards selected from CardVault\'s database of 5,000+ sports cards, shuffled using a date-based seed so everyone gets the same auction pool. Practice Mode uses a random pool each time so you can hone your strategy.',
  },
  {
    question: 'How is the winner determined?',
    answer: 'The winner is the collector whose won cards have the highest total estimated market value — not who spent the most. This means you can win by picking up bargains while opponents overpay. Your profit margin (value won minus budget spent) is also tracked.',
  },
];

export default function CardAuctionPage() {
  const cardData = sportsCards.map(c => ({
    name: c.name,
    player: c.player,
    sport: c.sport,
    year: c.year,
    set: c.set,
    estimatedValueRaw: c.estimatedValueRaw,
    slug: c.slug,
    rookie: c.rookie,
  }));

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Auction Showdown — Bid on Cards Against AI Collectors',
        description: 'Bid on real sports cards against 3 AI collectors. Manage your $500 budget and win the most valuable collection.',
        url: 'https://cardvault-two.vercel.app/card-auction',
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
          Auction Game &middot; Daily + Practice &middot; 5,000+ Cards &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Auction Showdown</h1>
        <p className="text-zinc-400 text-lg leading-relaxed">
          Bid on real sports cards against 3 AI collectors. Manage your $500 budget,
          outsmart your opponents, and build the most valuable collection in 8 rounds.
        </p>
      </div>

      <CardAuctionClient cards={cardData} />

      {/* FAQ */}
      <section className="mt-16 border-t border-zinc-800 pt-10">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((faq, i) => (
            <details key={i} className="group">
              <summary className="cursor-pointer text-zinc-300 font-medium hover:text-white transition-colors">
                {faq.question}
              </summary>
              <p className="mt-2 text-zinc-500 text-sm leading-relaxed pl-4 border-l border-zinc-800">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Internal links */}
      <section className="mt-12 border-t border-zinc-800 pt-8">
        <h2 className="text-lg font-bold text-white mb-4">More Card Games</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/card-streak', label: 'Card Streak' },
            { href: '/card-slots', label: 'Card Slots' },
            { href: '/card-ladder', label: 'Card Ladder' },
            { href: '/price-is-right', label: 'Price is Right' },
            { href: '/card-battle', label: 'Card Battles' },
            { href: '/collection-draft', label: 'Collection Draft' },
            { href: '/grade-or-fade', label: 'Grade or Fade' },
            { href: '/price-prediction', label: 'Price Prediction' },
            { href: '/trading-sim', label: 'Trading Sim' },
          ].map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-zinc-400 hover:text-white bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-center transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
