import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import ShowPlanner from './ShowPlanner';

export const metadata: Metadata = {
  title: 'Card Show Profit Planner — Plan Your Show Strategy Before You Go',
  description: 'Free card show profit calculator. Plan table costs, inventory, travel expenses, sell-through estimates, and projected P&L before attending a card show. Break-even analysis, item margin tracking, and show day tips.',
  openGraph: {
    title: 'Card Show Profit Planner — CardVault',
    description: 'Plan your card show P&L before you go. Table costs, inventory, projected profit. Free.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Show Profit Planner — CardVault',
    description: 'Calculate if a card show is worth attending. Free P&L planner.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Card Show Profit Planner' },
];

const faqItems = [
  {
    question: 'How does the Card Show Profit Planner work?',
    answer: 'Input your show expenses (table rental, travel, food), list the cards you plan to sell with ask prices and costs, set your expected sell-through rate and negotiation discount, and the tool calculates your projected P&L with a clear verdict on whether the show is worth attending.',
  },
  {
    question: 'What is a realistic sell-through rate for a card show?',
    answer: 'Typical sell-through rates range from 25-40% depending on the show size, pricing, and inventory quality. Small local shows average 25-30%, regional shows 30-35%, and major national shows (like The National) can hit 35-45%. Price competitively and bring diverse inventory to maximize your rate.',
  },
  {
    question: 'How much should I budget for negotiation?',
    answer: 'Most card show buyers expect to negotiate 10-15% off sticker price. Price your cards accordingly — if you want $100 for a card, price it at $110-$115. Savvy dealers build negotiation room into every price tag.',
  },
  {
    question: 'What expenses should I include?',
    answer: 'Include table/booth rental, gas or travel costs, parking, hotel (for multi-day shows), food, display supplies (top loaders, stands, tablecloth), and any cards you plan to buy. The presets give typical expense ranges for different show types.',
  },
  {
    question: 'When is it NOT worth attending a card show?',
    answer: 'If your projected profit is negative or near break-even, consider selling online instead. Also skip shows where table costs are disproportionate to your inventory value, or when your sell-through rate would need to exceed 50% to break even. Focus on shows where the math works.',
  },
];

export default function ShowPlannerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Show Profit Planner',
        description: 'Plan your card show strategy. Calculate projected P&L, break-even sell-through rate, item margins, and get a verdict on whether the show is worth attending.',
        url: 'https://cardvault-two.vercel.app/tools/show-planner',
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
          P&L Calculator &middot; Show Presets &middot; Break-Even Analysis &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Card Show Profit Planner
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Know your numbers before you go. Plan expenses, inventory, and projected sales to decide if a card show is worth attending.
        </p>
      </div>

      <ShowPlanner />

      {/* FAQ Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-900/60 border border-gray-800 rounded-xl">
              <summary className="cursor-pointer p-4 text-white font-medium hover:text-amber-400 transition-colors list-none flex justify-between items-center">
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
