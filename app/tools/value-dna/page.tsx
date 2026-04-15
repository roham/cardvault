import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import ValueDnaClient from './ValueDnaClient';

export const metadata: Metadata = {
  title: 'Card Value DNA — Understand Why Cards Are Worth What They Are | CardVault',
  description: 'Break down any sports card\'s value into its core components: player fame, card age, set quality, rookie status, grading premium, and scarcity. Understand the DNA of card pricing to make smarter collecting decisions.',
  openGraph: {
    title: 'Card Value DNA — Value Breakdown Tool | CardVault',
    description: 'See the DNA of any card\'s value. 6 factors scored and visualized to explain why a card is worth what it is.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Value DNA — CardVault',
    description: 'Understand WHY cards are worth what they are. 6-factor value breakdown for any sports card.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Value DNA' },
];

const faqItems = [
  {
    question: 'What is Card Value DNA?',
    answer: 'Card Value DNA breaks down the price of any sports card into six core factors that determine its market value: Player Fame (name recognition and demand), Age & Era (vintage premium from older cards), Set Quality (how desirable the product line is), Rookie Status (the premium for first-year cards), Grading Premium (how much a PSA 10 multiplies the raw value), and Scarcity (how rare the card is in the market). Each factor is scored 0-100 and shown as a percentage of total value.',
  },
  {
    question: 'How are the value percentages calculated?',
    answer: 'The percentages estimate how much of a card\'s total value is attributable to each factor. For example, a Michael Jordan 1986 Fleer rookie might show 30% Player Fame (iconic player), 20% Age (40 years old), 18% Set Quality (premium product), 20% Rookie Status (first card), and smaller portions for grading and scarcity. The analysis uses data from our database of 6,500+ cards including card counts per player, set averages, and grading multipliers.',
  },
  {
    question: 'How can I use Value DNA for investing?',
    answer: 'Understanding a card\'s value DNA helps you make smarter investment decisions. Cards dominated by Player Fame are tied to on-field performance and career trajectory. Cards with high Age scores have built-in scarcity that supports long-term value. Cards with high Rookie Status percentage are the most liquid and tradeable. Cards with high Grading Premium suggest professional grading is worthwhile. Use this to match cards to your investment strategy and risk tolerance.',
  },
  {
    question: 'Why does rookie status matter so much?',
    answer: 'Rookie cards are the foundation of player collecting. They carry a 2-5x premium because they represent the first licensed card of a player and have the longest appreciation runway. When a player wins an MVP, championship, or enters the Hall of Fame, rookie cards see the biggest percentage gains. They are also the most liquid cards to sell because they have the broadest buyer pool.',
  },
  {
    question: 'Does this work for all sports?',
    answer: 'Yes! Card Value DNA works for all four major sports (baseball, basketball, football, hockey) in our database of 6,500+ cards. The analysis adapts to sport-specific factors — for example, baseball vintage cards carry higher age premiums because the hobby started earlier (1880s vs 1950s for basketball/hockey).',
  },
];

export default function ValueDnaPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Value DNA',
        description: 'Break down any sports card\'s value into 6 core factors. Understand the DNA of card pricing to make smarter collecting decisions.',
        url: 'https://cardvault-two.vercel.app/tools/value-dna',
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
        <div className="inline-flex items-center gap-2 bg-violet-950/60 border border-violet-800/50 text-violet-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
          6 Value Factors &middot; Visual Breakdown &middot; Investment Insights
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Value DNA</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Understand <em>why</em> a card is worth what it is. See the six factors that make up
          every card&apos;s price — from player fame to vintage scarcity.
        </p>
      </div>

      <ValueDnaClient />

      {/* FAQ */}
      <div className="mt-12 border-t border-gray-800 pt-10">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <details key={i} className="group bg-gray-900/60 border border-gray-800 rounded-lg">
              <summary className="flex items-center justify-between cursor-pointer px-5 py-4 text-white font-medium">
                {item.question}
                <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-5 pb-4 text-gray-400 text-sm leading-relaxed">{item.answer}</div>
            </details>
          ))}
        </div>
      </div>

      <div className="mt-10 flex flex-wrap gap-3 text-sm">
        <Link href="/tools/grading-roi" className="text-emerald-400 hover:underline">Grading ROI</Link>
        <span className="text-gray-600">&middot;</span>
        <Link href="/tools/investment-calc" className="text-emerald-400 hover:underline">Investment Calculator</Link>
        <span className="text-gray-600">&middot;</span>
        <Link href="/tools/rarity-score" className="text-emerald-400 hover:underline">Rarity Score</Link>
        <span className="text-gray-600">&middot;</span>
        <Link href="/tools/roi-heatmap" className="text-emerald-400 hover:underline">ROI Heatmap</Link>
        <span className="text-gray-600">&middot;</span>
        <Link href="/tools" className="text-emerald-400 hover:underline">All Tools</Link>
      </div>
    </div>
  );
}
