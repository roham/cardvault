import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import EstateSaleClient from './EstateSaleClient';

export const metadata: Metadata = {
  title: 'Estate Sale Simulator — Inherit a Card Collection, Liquidate Wisely | CardVault',
  description: 'You inherit a deceased collector\'s card collection. Over 15 rounds, decide what to keep, sell fast, list online, or consign to a major auction house. Model fees, speed, and recovery rate. Get your Executor Grade.',
  keywords: [
    'card collection inheritance', 'estate sale cards', 'inherit sports cards what to do',
    'liquidate card collection', 'card estate simulator', 'consignment auction card',
    'sell inherited cards', 'grandfather baseball card collection', 'deceased collector estate',
    'quick sale vs auction cards', 'card liquidation calculator', 'heir to card collection',
  ],
  openGraph: {
    title: 'Estate Sale Simulator — CardVault',
    description: 'You inherited a card collection. Now what? Model the liquidation decision tree — quick sale, online auction, big-house consignment, or keep.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Estate Sale Simulator — CardVault',
    description: 'Inherit 15 cards. Decide how to liquidate. Earn your Executor Grade.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Vault', href: '/vault' },
  { label: 'Estate Sale Simulator' },
];

const faqItems = [
  {
    question: 'What is the Estate Sale Simulator?',
    answer: 'A decision-flow simulator for what actually happens when you inherit a card collection. You receive 15 cards discovered in a late collector\'s basement. For each card, you pick one of four liquidation paths: Quick Sell to a dealer (cash today, ~50% of fair market value), List Online on eBay/COMC (70-85% FMV but 6-8 weeks and fees), Consign to a major auction house (85-95% FMV but 12-16 weeks and premium), or Keep. At the end you see your total recovered, time-weighted yield, and Executor Grade A-F.',
  },
  {
    question: 'Why are the quick-sale percentages so low?',
    answer: 'They match reality. A local card shop dealer has to flip the card, pay grading fees, wait for it to sell, and absorb risk. They typically offer 40-55% of fair market value on a raw card. An auction house gets near-retail but takes 20% buyer premium + 12% seller fee and takes months to pay out. Online self-selling gets 70-85% but takes weeks and costs 13%+ in eBay/PayPal fees. The simulator models these real trade-offs — speed vs recovery.',
  },
  {
    question: 'Is the Executor Grade based on max cash only?',
    answer: 'No. The grade is a composite: 60% recovery rate (cash as % of FMV), 30% time-to-cash (faster is better when estate must settle), 10% judgment (did you consign the right cards vs quick-sell the right cards — auction houses maximize return on high-value unique pieces, quick sale is fine for commons). An executor who dumped everything quickly gets a C. One who consigned the grails and quick-sold the bulk gets an A.',
  },
  {
    question: 'Are the cards real?',
    answer: 'Yes. Cards are drawn from CardVault\'s 9,800+ sports card database — real cards, real estimated FMV ranges. The collection is seeded by a date + random seed so the same set of 15 cards appears across replays if you use the same seed (useful for retrying strategy).',
  },
  {
    question: 'Why include "Keep" as an option?',
    answer: 'Because in real estates, not every card should be sold. Sentimental cards (birth-year rookies, hometown-team cards) and aspirational grails (the Wagner, the Jordan Fleer) are often kept by heirs who become collectors themselves. The simulator rewards keeping cards that fit a coherent personal collection — though every kept card is $0 in the cash total, so there is a real trade-off. Many collectors get their start this way.',
  },
];

export default function EstateSalePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Estate Sale Simulator',
        applicationCategory: 'GameApplication',
        operatingSystem: 'Web',
        url: 'https://cardvault-two.vercel.app/estate-sale',
        description: 'Inherit a card collection, decide how to liquidate across 4 paths, earn an Executor Grade.',
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

      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 bg-stone-950/60 border border-stone-800/50 text-stone-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-pulse" />
          Commerce &middot; Inheritance Flow &middot; 15 Cards
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          The Estate Sale Simulator
        </h1>
        <p className="text-gray-400 text-lg max-w-3xl leading-relaxed">
          You just inherited a collection. A dusty box. 15 cards, some junk, some gems. The estate has to
          settle. How do you liquidate — quick-sell to a dealer, list online, consign to Heritage? Every
          path has a trade-off. Get your Executor Grade.
        </p>
      </div>

      <EstateSaleClient />

      {/* FAQ */}
      <div className="mt-12 bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, idx) => (
            <details key={idx} className="group">
              <summary className="cursor-pointer text-white font-medium text-sm hover:text-amber-400 transition-colors list-none flex items-center gap-2">
                <span className="text-amber-400/60 group-open:rotate-90 transition-transform">&#9654;</span>
                {faq.question}
              </summary>
              <p className="text-gray-400 text-sm mt-2 ml-5 leading-relaxed">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>

      {/* Internal Links */}
      <div className="mt-8 text-sm text-gray-500">
        <p>
          See also:{' '}
          <Link href="/vault/consignment" className="text-amber-400 hover:underline">Consignment Simulator</Link>,{' '}
          <Link href="/vault/pawn-shop" className="text-amber-400 hover:underline">Pawn Shop</Link>,{' '}
          <Link href="/vault/liquidation" className="text-amber-400 hover:underline">Liquidation Tool</Link>,{' '}
          <Link href="/vault/loan-office" className="text-amber-400 hover:underline">Loan Office</Link>,{' '}
          <Link href="/vault/bulk-sale" className="text-amber-400 hover:underline">Bulk Sale</Link>,{' '}
          <Link href="/tools/flip-calc" className="text-amber-400 hover:underline">Flip Calculator</Link>.
        </p>
      </div>
    </div>
  );
}
