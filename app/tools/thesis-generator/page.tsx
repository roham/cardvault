import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import ThesisGeneratorClient from './ThesisGeneratorClient';

export const metadata: Metadata = {
  title: 'Card Investment Thesis Generator — Build Your Buy Case | CardVault',
  description: 'Free investment thesis generator for sports cards. Search any card, get a data-driven buy/sell/hold rating with risk assessment, price targets, time horizon, and supporting catalysts. Build your investment case.',
  openGraph: {
    title: 'Card Investment Thesis Generator — CardVault',
    description: 'Generate a data-driven investment thesis for any sports card with buy/sell/hold ratings, price targets, and risk assessment.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Investment Thesis Generator — CardVault',
    description: 'Build your card investment case with data-driven thesis generation.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Investment Thesis Generator' },
];

const faqItems = [
  {
    question: 'What is a card investment thesis?',
    answer: 'A card investment thesis is a structured argument for why a specific card is a good (or bad) investment. It includes a buy/sell/hold rating, risk assessment, time horizon, price targets, and key catalysts that could drive value up or down. Having a written thesis helps collectors make disciplined decisions rather than emotional purchases.',
  },
  {
    question: 'How are the ratings calculated?',
    answer: 'Ratings are based on multiple factors: rookie status (higher weight for true rookie cards), card era and scarcity, current market value relative to historical trends, player career trajectory, and sport-specific seasonality. A "Strong Buy" requires multiple positive catalysts aligning, while "Avoid" signals significant downside risk. These are algorithmic estimates based on card attributes, not financial advice.',
  },
  {
    question: 'What do the risk levels mean?',
    answer: 'Low Risk: established vintage cards or proven Hall of Famers with stable demand. Medium Risk: modern stars with established careers but price volatility. High Risk: young players or recent rookies whose career trajectory is uncertain. Speculative: unproven prospects, error cards, or cards dependent on specific future events for value appreciation.',
  },
  {
    question: 'Should I base buying decisions solely on these ratings?',
    answer: 'No. This tool provides a structured framework for thinking about card investments, but it should be one input among many. Always check recent eBay sold prices, PSA population reports, and market trends independently. Card values can change rapidly based on player performance, injuries, or hobby sentiment shifts that no algorithm can predict.',
  },
  {
    question: 'How often should I revisit my investment thesis?',
    answer: 'Review your thesis quarterly or whenever a major catalyst occurs (trade, injury, award, retirement). If your original thesis is invalidated — for example, a player you expected to improve suffers a career-ending injury — reassess immediately. The best card investors have clear entry AND exit criteria defined before they buy.',
  },
];

export default function ThesisGeneratorPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Investment Thesis Generator',
        description: 'Generate a data-driven investment thesis for any sports card with buy/sell/hold ratings, price targets, and risk assessment.',
        url: 'https://cardvault-two.vercel.app/tools/thesis-generator',
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
        <div className="inline-flex items-center gap-2 bg-indigo-950/60 border border-indigo-800/50 text-indigo-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
          Data-Driven &middot; All Sports &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Investment Thesis Generator</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Search any card and build a structured investment case. Get a buy/sell/hold rating, risk assessment, price targets, time horizon, and key catalysts.
        </p>
      </div>

      <ThesisGeneratorClient />

      {/* FAQ */}
      <div className="mt-12 space-y-4">
        <h2 className="text-xl font-bold text-white">Frequently Asked Questions</h2>
        {faqItems.map((f, i) => (
          <details key={i} className="group bg-gray-900/40 border border-gray-800/40 rounded-lg">
            <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-gray-300 hover:text-white flex items-center justify-between">
              {f.question}
              <span className="text-gray-600 group-open:rotate-180 transition-transform">&#9662;</span>
            </summary>
            <p className="px-4 pb-4 text-sm text-gray-400 leading-relaxed">{f.answer}</p>
          </details>
        ))}
      </div>

      {/* Related Tools */}
      <div className="mt-10 bg-gray-900/40 border border-gray-800/40 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-3">Related Investment Tools</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/tools/investment-calc', label: 'Investment Calculator' },
            { href: '/tools/portfolio', label: 'Fantasy Portfolio' },
            { href: '/tools/flip-scorer', label: 'Quick-Flip Scorer' },
            { href: '/tools/diversification', label: 'Diversification Analyzer' },
            { href: '/tools/prospect-tracker', label: 'Prospect Pipeline' },
            { href: '/tools/dca-calculator', label: 'DCA Calculator' },
            { href: '/tools/stress-test', label: 'Portfolio Stress Test' },
            { href: '/tools/trend-predictor', label: 'Trend Predictor' },
          ].map(l => (
            <Link key={l.href} href={l.href} className="text-sm text-indigo-400 hover:text-indigo-300 underline underline-offset-2">
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
