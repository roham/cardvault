import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import TrendPredictor from './TrendPredictor';

export const metadata: Metadata = {
  title: 'Card Market Trend Predictor — Will Your Card Go Up or Down?',
  description: 'Free card market trend predictor. Analyze any sports card across 6 market factors to predict if the value will rise, fall, or stay stable. Data-driven insights for buy, sell, or hold decisions.',
  openGraph: {
    title: 'Card Market Trend Predictor — CardVault',
    description: 'Predict if a card\'s value will rise, fall, or stay stable. 6 market factors analyzed. Free.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Market Trend Predictor — CardVault',
    description: 'Will your card go up or down? Free market trend analysis.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Trend Predictor' },
];

const faqItems = [
  {
    question: 'How does the trend prediction work?',
    answer: 'We analyze 6 key market factors for each card: player career trajectory, card age and era, rookie status premium, seasonal timing, current market conditions for the sport, and scarcity/grade premium potential. Each factor is scored and weighted to produce an overall trend direction and confidence level.',
  },
  {
    question: 'How accurate are the predictions?',
    answer: 'These are educated estimates based on historical patterns and current market conditions, not guaranteed predictions. Card markets are influenced by many unpredictable factors including player injuries, trades, scandals, and broader economic conditions. Use this as one input in your buy/sell decisions, not the sole deciding factor.',
  },
  {
    question: 'What do the trend directions mean?',
    answer: 'RISING means we expect the card to increase in value over the next 3-6 months based on positive factors. FALLING means negative factors outweigh positives. STABLE means the card is likely to hold its current value. Each prediction includes a confidence level (Low/Medium/High) and the specific factors driving the prediction.',
  },
  {
    question: 'Should I buy cards marked as RISING?',
    answer: 'A RISING prediction suggests favorable conditions, but always do your own research. Check recent eBay sold comps, consider your budget, and factor in selling fees if you plan to flip. Cards with High confidence RISING predictions backed by strong fundamentals (young star, rookie year, team success) tend to be the safest investments.',
  },
  {
    question: 'When is the best time to sell a card?',
    answer: 'Generally, sell when the trend is RISING with High confidence and you have reached your profit target. Seasonal peaks matter: football cards peak during NFL season (Sep-Feb), baseball during playoffs (Oct), basketball during NBA season (Nov-Jun). Sell before major negative events like player retirements or off-field issues.',
  },
];

export default function TrendPredictorPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Market Trend Predictor',
        description: 'Predict card market trends. Analyze 6 factors to determine if a card will rise, fall, or stay stable. Free tool.',
        url: 'https://cardvault-two.vercel.app/tools/trend-predictor',
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
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          5,500+ Cards &middot; 6 Market Factors &middot; Buy/Sell/Hold &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Card Market Trend Predictor
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Will your card go up or down? Analyze any card across 6 market factors to predict the trend direction with a confidence score.
        </p>
      </div>

      <TrendPredictor />

      {/* FAQ */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-900/60 border border-gray-800 rounded-xl">
              <summary className="cursor-pointer p-4 text-white font-medium hover:text-emerald-400 transition-colors list-none flex justify-between items-center">
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

      {/* Related Tools */}
      <div className="mt-12 bg-gray-900/60 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Related Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { href: '/tools/heat-score', label: 'Collection Heat Score', desc: 'Score your collection by market heat' },
            { href: '/tools/price-history', label: 'Price History', desc: '90-day price chart for any card' },
            { href: '/tools/seasonality', label: 'Market Seasonality', desc: 'When to buy and sell by sport' },
            { href: '/tools/investment-calc', label: 'Investment Calculator', desc: 'Annualized returns vs benchmarks' },
          ].map(tool => (
            <a key={tool.href} href={tool.href} className="block p-3 bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 rounded-lg transition-colors">
              <div className="text-white text-sm font-medium">{tool.label}</div>
              <div className="text-gray-500 text-xs mt-1">{tool.desc}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
