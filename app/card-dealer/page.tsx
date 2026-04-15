import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardDealerClient from './CardDealerClient';

export const metadata: Metadata = {
  title: 'Card Dealer Simulator — Run Your Own Card Shop | CardVault',
  description: 'Run your own card shop for a day! 15 customers walk in wanting to buy and sell real sports cards. Set prices, negotiate deals, and maximize your profit. Daily seed — same customers for everyone. Free card collecting game.',
  openGraph: {
    title: 'Card Dealer Simulator — CardVault',
    description: 'Run a card shop for a day. Buy low, sell high, negotiate with 15 customers. Free daily game.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Dealer Simulator — CardVault',
    description: '15 customers. $1,000 cash. One day. Run your card shop.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/games' },
  { label: 'Card Dealer Simulator' },
];

const faqItems = [
  {
    question: 'How does the Card Dealer Simulator work?',
    answer: 'You start with $1,000 in cash and run a card shop for one day. 15 customers visit — some want to buy cards from you, others want to sell you their cards. Each customer has a personality type (collector, flipper, whale, etc.) that affects their willingness to pay and negotiate. Accept deals, pass on bad ones, or counter-offer to get a better price. Your goal is to maximize total assets (cash + inventory value) by the end of the day.',
  },
  {
    question: 'Are the card values real?',
    answer: 'Yes — every card and estimated value comes from CardVault\'s database of 6,200+ real sports cards. Customer offer prices are based on real market values adjusted by their customer type. A collector might overpay for a card they love, while a flipper will try to get the lowest price possible.',
  },
  {
    question: 'How does negotiation work?',
    answer: 'Each customer has a patience level (1-3 rounds) based on their type. You can enter a counter-offer and they\'ll respond. If your counter is reasonable, they may accept. If it\'s too aggressive, they\'ll meet you halfway. Push too hard and they walk away. Different customer types have different tolerance — whales are patient, flippers aren\'t.',
  },
  {
    question: 'Is it the same game every day?',
    answer: 'Yes — the customer sequence and cards are seeded by today\'s date, so everyone faces the same customers and deals. This makes it fair to compare scores. Tomorrow brings a completely new set of customers and cards.',
  },
  {
    question: 'What makes a good card dealer?',
    answer: 'Buy cards below market value and sell above. Pay attention to customer types — a whale will overpay while a flipper won\'t. Don\'t be afraid to pass on bad deals. Keep enough cash to buy good deals when they come. Building inventory is fine if you buy below market — your final score counts unsold inventory at market value.',
  },
];

export default function CardDealerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Dealer Simulator',
        description: 'Run your own card shop for a day. Buy and sell real sports cards, negotiate with customers, and maximize profit.',
        url: 'https://cardvault-two.vercel.app/card-dealer',
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
          Daily Game &middot; Real Card Values &middot; Negotiation
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Dealer Simulator</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Run your own card shop for a day. Start with <span className="text-green-400 font-bold">$1,000</span>,
          serve 15 customers, buy low, sell high, and negotiate your way to profit.
        </p>
      </div>

      <CardDealerClient />

      {/* FAQ */}
      <section className="mt-16 mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
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
      <div className="border-t border-gray-800 pt-8">
        <h2 className="text-lg font-semibold text-white mb-4">More Games</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/card-stack', label: 'Card Stack', desc: 'Hit $500 exactly' },
            { href: '/market-tycoon', label: 'Market Tycoon', desc: 'Trade cards like stocks' },
            { href: '/flip-or-keep', label: 'Flip or Keep', desc: 'Cash out or collect' },
            { href: '/card-roulette', label: 'Card Roulette', desc: 'Buy or pass — 20 spins' },
            { href: '/trade-up', label: 'Trade-Up Challenge', desc: '$5 to grail in 10 trades' },
            { href: '/card-war', label: 'Card War', desc: 'Pick the higher value' },
          ].map(l => (
            <Link key={l.href} href={l.href} className="p-3 bg-gray-800/40 hover:bg-gray-800/70 border border-gray-700 rounded-lg transition-colors group">
              <div className="text-white text-sm font-medium group-hover:text-amber-400 transition-colors">{l.label}</div>
              <div className="text-gray-500 text-xs">{l.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
