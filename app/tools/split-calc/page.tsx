import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import SplitCalcClient from './SplitCalcClient';

export const metadata: Metadata = {
  title: 'Card Split Calculator — Split Box & Break Costs Fairly | CardVault',
  description: 'Split hobby box, group break, and card lot costs between 2-6 people. 3 split methods: even, proportional by value, or draft + settle. Log every card pulled, assign to each person, and calculate who owes what. Free card cost splitter for collectors.',
  openGraph: {
    title: 'Card Split Calculator — Fair Box & Break Cost Splitting | CardVault',
    description: 'Split hobby box and break costs fairly between friends. Log cards, assign values, calculate settlements. Free.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Split Calculator — CardVault',
    description: 'Split hobby box and group break costs fairly. 3 methods, card logging, settlement calculator. Free.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Card Split Calculator' },
];

const faqItems = [
  {
    question: 'How do you fairly split a hobby box between friends?',
    answer: 'The fairest method depends on your group. Even Split works when you draft cards in order — everyone pays the same and takes turns picking. By Value (proportional) works when one person wants specific expensive cards — they pay a larger share of the cost. Draft + Settle works for group breaks where you settle value differences with cash after seeing what was pulled. The key is agreeing on the method BEFORE opening.',
  },
  {
    question: 'What is the best way to split group break costs?',
    answer: 'For traditional group breaks where everyone buys a team spot, use Even Split — each person pays their spot price and keeps what their team pulls. If you are splitting a hobby box among friends, Draft + Settle is fairest: everyone pays equally, then you settle value differences so nobody feels cheated by randomness. Use recent eBay sold prices (not listings) to value each card.',
  },
  {
    question: 'How do you calculate card values for splitting?',
    answer: 'Search the exact card on eBay using the "Sold Items" filter. Look at the last 3-5 completed sales for that specific card, year, set, and condition. Use the average sold price. For base cards worth under $1, enter $0.50 or just $0 — the value difference on base cards is negligible. Focus accurate pricing on the hits: autos, relics, numbered parallels, and rookies worth $5+.',
  },
  {
    question: 'What if someone pulls a huge hit in a box split?',
    answer: 'This is exactly what the Draft + Settle method solves. Everyone pays an equal share of the box, then the person who received more total card value pays the difference to those who received less. For example, if 3 people split a $300 box and one person pulls a $200 auto while the others got $30 each, the lucky puller pays about $57 each to the other two to equalize value.',
  },
  {
    question: 'Can I use this for card show lot splits?',
    answer: 'Yes — the Card Split Calculator works for any shared card purchase: hobby boxes, group breaks, card show lots, estate sale pickups, bulk lot purchases, or even splitting a collection between family members. Enter the total cost, add each card with its estimated value, assign cards to whoever keeps them, and the calculator handles the rest.',
  },
];

export default function SplitCalcPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Split Calculator — Split Box & Break Costs Fairly',
        description: 'Split hobby box, group break, and card lot costs between 2-6 people. 3 split methods with card logging and settlement calculator.',
        url: 'https://cardvault-two.vercel.app/tools/split-calc',
        applicationCategory: 'FinanceApplication',
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
        <div className="inline-flex items-center gap-2 bg-blue-950/60 border border-blue-800/50 text-blue-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
          Box Splits &middot; Break Costs &middot; Fair Settlements &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Split Calculator</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Splitting a hobby box, group break, or card lot with friends? Add everyone, log every card pulled, and let the calculator figure out who owes what. Three split methods. Zero arguments.
        </p>
      </div>

      <SplitCalcClient />

      {/* FAQ */}
      <section className="mt-12">
        <h2 className="text-lg font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map(f => (
            <details key={f.question} className="group bg-gray-900/60 border border-gray-800 rounded-xl">
              <summary className="px-4 py-3 text-white text-sm font-medium cursor-pointer hover:text-blue-400 transition-colors list-none flex items-center justify-between">
                {f.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform ml-2">&#9662;</span>
              </summary>
              <div className="px-4 pb-3 text-gray-400 text-sm leading-relaxed">{f.answer}</div>
            </details>
          ))}
        </div>
      </section>

      {/* Footer breadcrumb */}
      <div className="mt-12 pt-6 border-t border-gray-800 flex flex-wrap gap-4 text-sm text-gray-500">
        <Link href="/" className="hover:text-gray-300">Home</Link>
        <span>/</span>
        <Link href="/tools" className="hover:text-gray-300">Tools</Link>
        <span>/</span>
        <span className="text-gray-400">Card Split Calculator</span>
      </div>
    </div>
  );
}
