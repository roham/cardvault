import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import FearGreedIndex from './FearGreedIndex';

export const metadata: Metadata = {
  title: 'Card Market Fear & Greed Index — Daily Collector Sentiment Gauge',
  description: 'The Card Market Fear & Greed Index combines 10 market signals across momentum, volume, sentiment, valuation, and volatility into a single 0-100 score. Updated daily. Know when to buy, hold, or sell.',
  openGraph: {
    title: 'Card Market Fear & Greed Index — CardVault',
    description: 'Daily sentiment gauge for the sports card market. 10 signals, 5 categories, one score.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Market Fear & Greed Index — CardVault',
    description: 'Is the card market fearful or greedy today? Check the daily sentiment gauge.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Fear & Greed Index' },
];

const faqItems = [
  {
    question: 'What is the Card Market Fear & Greed Index?',
    answer: 'Inspired by CNN\'s Fear & Greed Index for stocks, our Card Market Fear & Greed Index combines 10 market signals into a single 0-100 score measuring overall card market sentiment. Scores below 40 indicate fear (potential buying opportunities), while scores above 60 indicate greed (potential overheating). Updated daily.',
  },
  {
    question: 'What signals make up the index?',
    answer: 'The index tracks 10 signals across 5 categories: Momentum (35% weight — market trends and rookie demand), Volume (20% — auction activity and eBay sales), Sentiment (15% — social media buzz and break participation), Valuation (20% — price-to-population ratios and sealed premiums), and Volatility (10% — price swings and grading submission volume).',
  },
  {
    question: 'Should I buy when the index shows fear?',
    answer: 'Historically in most markets, extreme fear often presents buying opportunities because prices drop below fair value due to panic selling. However, this is not financial advice — always do your own research and buy cards you personally enjoy collecting. The index is one tool among many for understanding market conditions.',
  },
  {
    question: 'How often is the index updated?',
    answer: 'The index refreshes daily with new signal readings. The 7-day history chart shows how sentiment has shifted over the past week, helping you identify trends rather than reacting to a single day\'s reading.',
  },
  {
    question: 'Why does the index change by sport season?',
    answer: 'Card market activity is heavily influenced by sports seasons. Baseball cards peak around Opening Day (February-April), football peaks before and during the NFL season (August-January), basketball peaks during the NBA season, and hockey follows a similar pattern. These seasonal cycles naturally affect market momentum, volume, and sentiment.',
  },
];

export default function FearGreedPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Market Fear & Greed Index',
        description: 'Daily sentiment gauge combining 10 market signals into a single 0-100 score for the sports card market.',
        url: 'https://cardvault-two.vercel.app/fear-greed',
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
          10 Signals &middot; 5 Categories &middot; Updated Daily &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Market Fear &amp; Greed Index</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Is the card market fearful or greedy today? Our daily sentiment gauge combines momentum, volume,
          sentiment, valuation, and volatility signals into one actionable score.
        </p>
      </div>

      <FearGreedIndex />

      {/* FAQ Section */}
      <div className="mt-12 border-t border-gray-700/50 pt-8">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-800/30 border border-gray-700/30 rounded-xl">
              <summary className="cursor-pointer p-4 text-white font-medium hover:text-orange-300 transition-colors list-none flex items-center justify-between">
                {faq.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform ml-2">&#9660;</span>
              </summary>
              <div className="px-4 pb-4 text-gray-400 text-sm leading-relaxed">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
