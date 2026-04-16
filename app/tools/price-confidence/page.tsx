import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import PriceConfidenceClient from './PriceConfidenceClient';
import { sportsCards } from '@/data/sports-cards';

export const metadata: Metadata = {
  title: 'Card Price Confidence Score — How Reliable Is That Price? | CardVault',
  description: 'Free card price confidence analyzer. See how reliable any sports card or Pokemon card price really is. Scores 6 factors: sales volume, price stability, population data, liquidity, data recency, and source diversity. Know before you buy or sell.',
  alternates: { canonical: './' },
  openGraph: {
    title: 'Card Price Confidence Score | CardVault',
    description: 'How reliable is that card price? Analyze 6 factors to find out.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Price Confidence Score | CardVault',
    description: 'How reliable is that card price? Free confidence analysis.',
  },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Price Confidence Score' },
];

const faqItems = [
  {
    question: 'What does the price confidence score mean?',
    answer: 'The score (0-100) tells you how reliable a card\'s listed price is based on available market data. A score of 85+ means the price is backed by strong, recent, multi-source data. A score below 45 means the price is based on limited data and you should verify independently before buying or selling.',
  },
  {
    question: 'Why do some cards have low confidence scores?',
    answer: 'Low scores typically mean: few recent sales (low volume), high price variation between sales (volatility), limited grading data (unknown population), or pricing from only one platform. Vintage cards, rare parallels, and niche players often have lower confidence because they trade infrequently.',
  },
  {
    question: 'How is this different from a price guide?',
    answer: 'A price guide tells you WHAT a card might be worth. The confidence score tells you HOW RELIABLE that estimate is. A card priced at $500 with a 90 confidence score is much more reliable than one priced at $500 with a 35 confidence score. Always pair price with confidence.',
  },
  {
    question: 'Does a low confidence score mean the price is wrong?',
    answer: 'Not necessarily. A low score means there is insufficient data to be confident either way. The actual value could be higher or lower than listed. It is a measure of data quality, not price accuracy. Use low-confidence scores as a signal to do additional research before transacting.',
  },
  {
    question: 'What factors have the most impact on confidence?',
    answer: 'Sales Volume (25%) and Price Stability (20%) are the two heaviest factors. A card with 100+ recent sales at consistent prices will always score high. Cards with fewer than 10 sales or 30%+ price swings between sales will score lower regardless of other factors.',
  },
];

// Prepare card data for client
const cardData = sportsCards.map(c => ({
  name: c.name,
  slug: c.slug,
  sport: c.sport,
  year: c.year,
  rookie: c.rookie,
}));

export default function PriceConfidencePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Price Confidence Score',
        description: 'Analyze how reliable any card price is. Scores 6 factors: sales volume, price stability, population data, liquidity, recency, and source diversity.',
        url: 'https://cardvault-two.vercel.app/tools/price-confidence',
        applicationCategory: 'UtilityApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map(item => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      }} />

      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-amber-950/60 border border-amber-800/50 text-amber-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
          9,000+ Cards &bull; 6 Factors &bull; 0-100 Score &bull; Actionable Tips &bull; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">
          Price Confidence Score
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl">
          How reliable is that card price? Search any card and get a confidence score analyzing sales volume, price stability, population data, market liquidity, data recency, and source diversity.
        </p>
      </div>

      <PriceConfidenceClient cards={cardData} />

      {/* FAQ Section */}
      <div className="mt-12 border-t border-slate-800 pt-10">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((item, i) => (
            <div key={i}>
              <h3 className="text-sm font-bold text-white mb-2">{item.question}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related Links */}
      <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { href: '/tools/price-history', label: 'Price History Charts', desc: 'View 90-day price trends' },
          { href: '/tools/pop-report', label: 'Population Report', desc: 'Check graded population data' },
          { href: '/tools/investment-calc', label: 'Investment Calculator', desc: 'Calculate returns vs benchmarks' },
          { href: '/tools/watchlist', label: 'Price Watchlist', desc: 'Track cards for price movements' },
          { href: '/tools/value-projector', label: 'Value Projector', desc: 'Estimate future card values' },
          { href: '/tools/selling-platforms', label: 'Selling Platforms', desc: 'Compare where to sell' },
        ].map(link => (
          <Link key={link.href} href={link.href} className="bg-slate-800/40 border border-slate-700 rounded-lg p-3 hover:bg-slate-800 hover:border-slate-600 transition-colors">
            <p className="text-sm font-medium text-indigo-400">{link.label}</p>
            <p className="text-xs text-slate-500 mt-0.5">{link.desc}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link href="/tools" className="text-indigo-400 hover:text-indigo-300 text-sm">
          &larr; Back to All Tools
        </Link>
      </div>
    </div>
  );
}
