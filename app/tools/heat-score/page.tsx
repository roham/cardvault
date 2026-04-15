import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import HeatScore from './HeatScore';

export const metadata: Metadata = {
  title: 'Collection Heat Score — How Hot Is Your Collection Right Now?',
  description: 'Free collection heat score calculator. Analyze your cards across 5 factors: rookie status, recency, grade premium, value tier, and seasonal timing. Get a 0-100 heat score with buy/sell/hold recommendations for every card.',
  openGraph: {
    title: 'Collection Heat Score — CardVault',
    description: 'Score your collection 0-100. Know which cards to sell now and which to hold. Free.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Collection Heat Score — CardVault',
    description: 'How hot is your collection right now? Free 0-100 score with buy/sell/hold recs.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Collection Heat Score' },
];

const faqItems = [
  {
    question: 'What does the heat score measure?',
    answer: 'The heat score (0-100) measures how "hot" a card is right now based on 5 factors: rookie status (rookies command premiums), recency (newer cards have more active demand), grade premium (high gem multipliers signal grading opportunity), value tier (higher-value cards attract more collector interest), and seasonal timing (in-season sports have higher demand).',
  },
  {
    question: 'What should I do with a high heat score card?',
    answer: 'Cards scoring 75+ are at peak demand — consider selling if you want to maximize value. Cards at 55-74 are in a good position — hold and watch for catalysts (player performance, awards, trades) that could push them higher. Cards below 40 are cooling off — they may be buy opportunities if the player has long-term potential.',
  },
  {
    question: 'How does seasonal timing affect heat score?',
    answer: 'Each sport has demand cycles. Baseball cards peak March-June (spring training through the first half). Football peaks August-February (preseason through playoffs). Basketball follows October-April. Hockey follows October-June. Off-season cards lose 5-10 heat points.',
  },
  {
    question: 'Can I analyze my entire collection?',
    answer: 'Yes! Add as many cards as you want. The tool calculates an overall collection heat score (average of all cards) and shows individual scores for each card. This helps you identify which cards to prioritize selling and which to continue holding.',
  },
  {
    question: 'Is the heat score the same as market value?',
    answer: 'No. A high heat score means a card is in a favorable position to sell NOW — not necessarily that it is the most valuable. A $10 rookie card in-season might score higher than a $500 vintage card in the off-season because the rookie has more immediate demand drivers.',
  },
];

export default function HeatScorePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Collection Heat Score',
        description: 'Analyze your card collection with a 0-100 heat score. 5 factors: rookie status, recency, grade premium, value, seasonal timing. Buy/sell/hold recommendations.',
        url: 'https://cardvault-two.vercel.app/tools/heat-score',
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
        <div className="inline-flex items-center gap-2 bg-orange-950/60 border border-orange-800/50 text-orange-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
          5,300+ Cards &middot; 5 Heat Factors &middot; Buy/Sell/Hold &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Collection Heat Score
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          How hot is your collection right now? Add your cards and get a 0-100 heat score with personalized buy, sell, and hold recommendations.
        </p>
      </div>

      <HeatScore />

      {/* FAQ */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-900/60 border border-gray-800 rounded-xl">
              <summary className="cursor-pointer p-4 text-white font-medium hover:text-orange-400 transition-colors list-none flex justify-between items-center">
                {faq.question}
                <span className="text-gray-500 group-open:rotate-45 transition-transform text-xl">+</span>
              </summary>
              <div className="px-4 pb-4 text-gray-400 text-sm leading-relaxed">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
