import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CompCalculatorClient from './CompCalculatorClient';

export const metadata: Metadata = {
  title: 'Card Comp Calculator — Find Comparable Card Prices | CardVault',
  description: 'Find comparable sales for any sports card across 9,700+ cards. Get median, min, max, and average comp prices. Match by sport, decade, value tier, and rookie status. Free fair-price calculator.',
  openGraph: {
    title: 'Card Comp Calculator — Find Fair Card Prices | CardVault',
    description: 'Real comps from 9,700+ cards. Median, range, and a UNDERPRICED/FAIR/OVERPRICED verdict on any ask or bid.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Comp Calculator | CardVault',
    description: 'Find comparable prices for any sports card. MLB, NBA, NFL, NHL.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Comp Calculator' },
];

const faqItems = [
  {
    question: 'What is a card comp?',
    answer: 'A comp (short for comparable) is a similar card used as a price reference. When pricing a card for sale or deciding if a buy is fair, collectors look at recent sales of cards with similar attributes: same sport, similar era, similar rarity, similar player tier. The more comps you have, the more confident the fair-price estimate.',
  },
  {
    question: 'How does the Comp Calculator pick comparables?',
    answer: 'The tool starts from your target card and filters the 9,700+ card database. By default it matches same sport and same decade. You can add filters for same value tier (within 50%) or rookies-only. The tool shows you 8-50 comps and highlights median, min, and max prices.',
  },
  {
    question: 'How accurate are the comps?',
    answer: 'Our estimates are derived from sold-listings data, dealer catalogs, and auction results. They are directional, not live market prices. Always verify on eBay sold listings before a significant purchase or sale. The more comps the tool finds, the tighter the confidence interval.',
  },
  {
    question: 'What does the verdict mean?',
    answer: 'If you enter an asking price or offer, the tool compares it to the comp median. Under 75% of median = UNDERPRICED (good buy). 75-125% = FAIR. Over 125% = OVERPRICED. Use this as a starting point for negotiation, not a final answer.',
  },
  {
    question: 'Why might my card have few comps?',
    answer: 'Ultra-rare cards, one-of-one parallels, and esoteric vintage items may have few or no true comparables. For these, look at price per era-tier or use our Investment Thesis Generator for a structured analysis.',
  },
];

export default function CompCalculatorPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Comp Calculator',
        description: 'Find comparable sports card prices from 9,700+ cards with median, range, and fair-price verdicts.',
        url: 'https://cardvault-two.vercel.app/tools/comp-calculator',
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
        <div className="inline-flex items-center gap-2 bg-sky-950/60 border border-sky-800/50 text-sky-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-pulse" />
          Comp Calculator &middot; 9,700+ cards &middot; Fair-price verdicts
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">Card Comp Calculator</h1>
        <p className="text-gray-400 text-lg">
          Pick any card. We find its closest comparables across 9,700+ cards and show the median, range,
          and a UNDERPRICED/FAIR/OVERPRICED verdict on your ask or offer.
        </p>
      </div>

      <CompCalculatorClient />

      {/* FAQ */}
      <div className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-800/40 border border-gray-700/40 rounded-lg">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium hover:text-sky-400 transition-colors">
                {faq.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform">&#9660;</span>
              </summary>
              <div className="px-4 pb-4 text-sm text-gray-400">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>

      {/* Related Links */}
      <div className="mt-8 border-t border-gray-800 pt-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Related Tools</h3>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/tools/player-portfolio" className="text-sky-500 hover:text-sky-400">Player Portfolio</Link>
          <Link href="/tools/grade-spread" className="text-sky-500 hover:text-sky-400">Grade Price Spread</Link>
          <Link href="/tools/thesis-generator" className="text-sky-500 hover:text-sky-400">Investment Thesis</Link>
          <Link href="/tools/negotiation-calc" className="text-sky-500 hover:text-sky-400">Negotiation Calculator</Link>
          <Link href="/tools/auction-bid" className="text-sky-500 hover:text-sky-400">Auction Bid Calculator</Link>
          <Link href="/tools/flip-scorer" className="text-sky-500 hover:text-sky-400">Quick-Flip Scorer</Link>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <Link href="/tools" className="text-sky-500 hover:text-sky-400">&larr; All Tools</Link>
        <Link href="/games" className="text-sky-500 hover:text-sky-400">Games</Link>
        <Link href="/" className="text-sky-500 hover:text-sky-400">Home</Link>
      </div>
    </div>
  );
}
