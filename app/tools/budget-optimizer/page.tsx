import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import BudgetOptimizerClient from './BudgetOptimizerClient';

export const metadata: Metadata = {
  title: 'Card Budget Optimizer — Best Cards for Your Budget | CardVault',
  description: 'Free card budget optimizer tool. Enter your budget ($25-$5,000+) and collecting goal, get personalized card recommendations from 6,900+ sports cards. Maximize value, find rookies, or build a diversified portfolio.',
  openGraph: {
    title: 'Card Budget Optimizer — Maximize Your Collecting Budget | CardVault',
    description: 'Enter budget and goal, get optimized card recommendations. 6 strategies, 4 sports, 6,900+ cards.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Budget Optimizer — CardVault',
    description: 'What should you buy with your card budget? Get optimized recommendations.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Budget Optimizer' },
];

const faqItems = [
  {
    question: 'How does the Card Budget Optimizer work?',
    answer: 'Enter your total spending budget ($25 to $5,000+), choose a collecting goal (maximum cards, best single card, investment portfolio, rookie collection, set completion, or diversified mix), and optionally filter by sport. The optimizer analyzes 6,900+ cards in our database and recommends the best cards to buy based on your criteria, budget, and goals.',
  },
  {
    question: 'What collecting goals can I choose?',
    answer: 'Six strategies: Maximum Cards (most cards for your money), Best Single Card (one high-value centerpiece), Investment Portfolio (cards with highest grading multipliers), Rookie Collection (rookie cards with upside), Set Starter (begin completing a specific set), and Diversified Mix (balanced across sports and eras).',
  },
  {
    question: 'Are the card prices accurate?',
    answer: 'Card values shown are estimated market values based on recent sales data from eBay, auction houses, and dealer prices. Actual prices may vary based on condition, specific card variations, and market conditions. Use these as directional guidance, not exact pricing. Each recommendation includes a direct eBay search link so you can see current listings.',
  },
  {
    question: 'What does the grading multiplier mean?',
    answer: 'The grading multiplier shows how much more a card is worth in gem mint condition (PSA 10 or equivalent) vs raw. A 5x multiplier means a card worth $20 raw could be worth $100 graded. Higher multipliers indicate better grading ROI, which is especially important for the Investment strategy.',
  },
  {
    question: 'Can I filter by sport?',
    answer: 'Yes, you can filter recommendations to a single sport (MLB, NBA, NFL, or NHL) or view all sports together. The Diversified Mix strategy automatically balances across all four sports regardless of the filter.',
  },
];

export default function BudgetOptimizerPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Budget Optimizer',
        description: 'Optimize your sports card collecting budget with personalized recommendations from 6,900+ cards.',
        url: 'https://cardvault-two.vercel.app/tools/budget-optimizer',
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
        <div className="inline-flex items-center gap-2 bg-amber-950/60 border border-amber-800/50 text-amber-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
          6 Strategies &middot; 4 Sports &middot; 6,900+ Cards
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Budget Optimizer</h1>
        <p className="text-gray-400 text-lg max-w-xl">
          Enter your budget and collecting goal. Get personalized card recommendations optimized for maximum value.
        </p>
      </div>

      <BudgetOptimizerClient />

      {/* FAQ */}
      <div className="mt-12">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-800/50 border border-gray-700/50 rounded-xl">
              <summary className="flex items-center justify-between cursor-pointer px-5 py-4 text-white font-medium text-sm">
                {faq.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform ml-2">&#9660;</span>
              </summary>
              <div className="px-5 pb-4 text-gray-400 text-sm leading-relaxed">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link href="/tools" className="text-amber-400 hover:text-amber-300 text-sm transition-colors">
          &larr; All Tools
        </Link>
      </div>
    </div>
  );
}
