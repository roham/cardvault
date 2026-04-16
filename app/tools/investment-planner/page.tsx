import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import InvestmentPlannerClient from './InvestmentPlannerClient';

export const metadata: Metadata = {
  title: 'Card Investment Planner — Build Your Portfolio Strategy | CardVault',
  description: 'Free card investment planner. Enter your budget, risk tolerance, and timeline to get a personalized portfolio allocation across rookie cards, vintage, graded, sealed wax, and more.',
  openGraph: {
    title: 'Card Investment Planner | CardVault',
    description: 'Build a card portfolio strategy based on your budget, risk tolerance, and goals. Free allocation recommendations.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Investment Planner | CardVault',
    description: 'Personalized card portfolio allocation based on your budget and goals.',
  },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Investment Planner' },
];

const faqItems = [
  {
    question: 'How should I allocate my card investment budget?',
    answer: 'A balanced card portfolio typically includes: 30-40% in "blue chip" established stars (safe value storage), 20-30% in rookie cards of current young stars (growth potential), 10-20% in vintage cards (historical appreciation), 10-15% in sealed product (preservation play), and 5-10% in speculative picks (high risk, high reward). Your exact allocation should match your risk tolerance and timeline.',
  },
  {
    question: 'Are sports cards a good investment?',
    answer: 'Sports cards can be a good ALTERNATIVE investment within a diversified portfolio. Top-tier vintage cards (PSA 9-10 of Hall of Famers) have historically appreciated 8-15% annually. However, most cards lose value — only a small percentage appreciate significantly. Never invest money you cannot afford to lose, and always prioritize cards you enjoy collecting.',
  },
  {
    question: 'What is the safest card investment?',
    answer: 'PSA 10 or BGS 9.5/10 copies of confirmed Hall of Famers in their iconic sets (1952 Topps Mantle, 1986 Fleer Jordan, 2003 Topps Chrome LeBron) are considered the safest. These are the "blue chips" of the card world. They rarely lose value long-term and have deep liquidity — you can always find a buyer.',
  },
  {
    question: 'How long should I hold card investments?',
    answer: 'Most successful card investors hold for 3-7 years minimum. Short-term flipping (under 1 year) is more trading than investing and requires deep market knowledge. The 28% collectibles capital gains tax rate applies to gains held over 1 year, so tax planning matters for larger portfolios.',
  },
  {
    question: 'Should I invest in raw or graded cards?',
    answer: 'For investment purposes, graded cards are strongly preferred because: (1) condition is verified and guaranteed, (2) they have standardized pricing, (3) they are easier to sell, and (4) they command premium prices. Buy raw cards only if you plan to grade them yourself (which is a valid strategy for cards you believe will grade well).',
  },
];

export default function InvestmentPlannerPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Investment Planner',
        description: 'Build a personalized card portfolio strategy. Enter your budget, risk tolerance, and timeline to get allocation recommendations.',
        url: 'https://cardvault-two.vercel.app/tools/investment-planner',
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

      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Portfolio Allocation - Risk Analysis - Budget Planning - Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Investment Planner</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Tell us your budget, risk tolerance, and timeline — we&apos;ll recommend how to allocate your card portfolio across rookies, vintage, graded, sealed, and speculative picks.
        </p>
      </div>

      <InvestmentPlannerClient />

      {/* FAQ Section */}
      <div className="mt-12 bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((item, i) => (
            <div key={i} className="border-b border-gray-700/50 pb-5 last:border-0 last:pb-0">
              <h3 className="text-white font-semibold mb-2">{item.question}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related Tools */}
      <div className="mt-8 bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Related Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Link href="/tools/investment-calc" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">📊</span>
            <div>
              <div className="text-white text-sm font-medium">Investment Calculator</div>
              <div className="text-gray-500 text-xs">Calculate annualized returns</div>
            </div>
          </Link>
          <Link href="/tools/diversification" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">📊</span>
            <div>
              <div className="text-white text-sm font-medium">Diversification Analyzer</div>
              <div className="text-gray-500 text-xs">Analyze collection diversity</div>
            </div>
          </Link>
          <Link href="/tools/portfolio-rebalancer" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">⚖️</span>
            <div>
              <div className="text-white text-sm font-medium">Portfolio Rebalancer</div>
              <div className="text-gray-500 text-xs">Rebalance your holdings</div>
            </div>
          </Link>
          <Link href="/tools/grading-roi" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">💰</span>
            <div>
              <div className="text-white text-sm font-medium">Grading ROI Calculator</div>
              <div className="text-gray-500 text-xs">Is grading worth the cost?</div>
            </div>
          </Link>
          <Link href="/tools/budget-planner" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">💰</span>
            <div>
              <div className="text-white text-sm font-medium">Hobby Budget Planner</div>
              <div className="text-gray-500 text-xs">Plan monthly spending</div>
            </div>
          </Link>
          <Link href="/tools/stress-test" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">🧪</span>
            <div>
              <div className="text-white text-sm font-medium">Portfolio Stress Test</div>
              <div className="text-gray-500 text-xs">Simulate market scenarios</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
