import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import PortfolioRebalancerClient from './PortfolioRebalancerClient';

export const metadata: Metadata = {
  title: 'Card Portfolio Rebalancer — Optimize Your Collection Allocation | CardVault',
  description: 'Free card portfolio rebalancer. See your collection allocation by sport, era, and value tier — then get buy/sell recommendations to hit your target mix. Like a financial portfolio optimizer for card collectors.',
  openGraph: {
    title: 'Card Portfolio Rebalancer — CardVault',
    description: 'Optimize your card collection allocation. Buy/sell recommendations to reach your target mix.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Portfolio Rebalancer — CardVault',
    description: 'Rebalance your card portfolio like a financial advisor. Free.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Portfolio Rebalancer' },
];

const faqItems = [
  {
    question: 'What is the Card Portfolio Rebalancer?',
    answer: 'The Card Portfolio Rebalancer analyzes your card collection like a financial portfolio. It shows your current allocation by sport, era, and value tier, compares it to your target allocation, and generates specific buy/sell recommendations to bring your portfolio in line with your goals.',
  },
  {
    question: 'How do I set my target allocation?',
    answer: 'Choose from three preset strategies (Balanced, Growth, or Conservative) or create a custom allocation. Each strategy sets target percentages for sports (baseball, basketball, football, hockey), eras (vintage, modern, ultra-modern), and value tiers (budget, mid-range, premium). Adjust the sliders to match your investing goals.',
  },
  {
    question: 'What do the buy/sell recommendations mean?',
    answer: 'Recommendations are based on the gap between your current and target allocations. If you are overweight in basketball (50%) but your target is 30%, the tool will suggest reducing basketball exposure. If you are underweight in vintage (5%) but targeting 20%, it will suggest adding vintage cards. Specific card suggestions come from our database.',
  },
  {
    question: 'Is this actual financial advice?',
    answer: 'No. This tool is for entertainment and educational purposes only. Card collecting involves significant risks including total loss of value. The tool helps you think about diversification and allocation in your collection, but should not be used as the sole basis for buying or selling decisions.',
  },
  {
    question: 'What strategies are available?',
    answer: 'Three presets: Balanced (equal sport mix, mixed eras, diversified tiers), Growth (tilted toward basketball and football, ultra-modern, higher risk), and Conservative (tilted toward baseball vintage, established value, lower risk). You can also fully customize percentages.',
  },
];

export default function PortfolioRebalancerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Portfolio Rebalancer',
        description: 'Analyze and optimize your card collection allocation by sport, era, and value tier. Buy/sell recommendations to reach your target portfolio mix.',
        url: 'https://cardvault-two.vercel.app/tools/portfolio-rebalancer',
        applicationCategory: 'FinanceApplication',
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

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-cyan-950/60 border border-cyan-800/50 text-cyan-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
          Portfolio Optimization
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Portfolio Rebalancer</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Add your cards, set your target allocation, and get buy/sell recommendations to optimize your collection like a financial portfolio.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-2xl mb-2">1.</div>
          <h3 className="text-white font-semibold text-sm mb-1">Add Your Cards</h3>
          <p className="text-gray-500 text-xs">Search and add cards from our 5,700+ database to build your portfolio.</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-2xl mb-2">2.</div>
          <h3 className="text-white font-semibold text-sm mb-1">Set Your Targets</h3>
          <p className="text-gray-500 text-xs">Choose a preset strategy or customize your target allocation by sport, era, and value tier.</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-2xl mb-2">3.</div>
          <h3 className="text-white font-semibold text-sm mb-1">Get Recommendations</h3>
          <p className="text-gray-500 text-xs">See your current vs target allocation and get specific buy/sell recommendations.</p>
        </div>
      </div>

      <PortfolioRebalancerClient />

      <div className="mt-16">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item) => (
            <div key={item.question} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-2">{item.question}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-white font-bold text-lg mb-4">Related Tools</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/tools/portfolio', label: 'Fantasy Portfolio' },
            { href: '/tools/investment-calc', label: 'Investment Calculator' },
            { href: '/tools/diversification', label: 'Diversification Score' },
            { href: '/tools/heat-score', label: 'Collection Heat Score' },
            { href: '/tools/collection-value', label: 'Collection Value' },
            { href: '/investment-thesis', label: 'Investment Thesis' },
            { href: '/tools/trend-predictor', label: 'Trend Predictor' },
            { href: '/market-data', label: 'Market Data Room' },
          ].map(t => (
            <Link
              key={t.href}
              href={t.href}
              className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 rounded-lg text-xs font-medium transition-colors"
            >
              {t.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
