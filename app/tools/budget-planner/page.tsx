import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import BudgetPlanner from './BudgetPlanner';

export const metadata: Metadata = {
  title: 'Hobby Budget Planner — How Much Should You Spend on Cards?',
  description: 'Free card collecting budget planner. Set your monthly budget, allocate across singles, sealed, grading, supplies, and card shows. Get ROI estimates, grail savings goals, and personalized tips for your collector type.',
  openGraph: {
    title: 'Hobby Budget Planner — CardVault',
    description: 'Plan your card collecting budget. Allocate spending, estimate ROI, and save for grail cards.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Hobby Budget Planner — CardVault',
    description: 'Free budget planner for card collectors. Allocation, ROI estimates, and grail savings goals.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Hobby Budget Planner' },
];

const faqItems = [
  {
    question: 'How much should I spend on card collecting per month?',
    answer: 'There is no right answer — it depends on your income, goals, and how serious you are. Casual collectors typically spend $50–$150/month. Active collectors and flippers spend $200–$500/month. Dealers and serious investors may spend $1,000+/month. The key rule: never spend money you cannot afford to lose. Card values fluctuate, and most sealed products have negative expected value when opened.',
  },
  {
    question: 'What percentage should go to sealed vs singles?',
    answer: 'For investment purposes, singles are almost always better than sealed. You know exactly what you\'re getting. Most sealed products have an expected value (EV) of 60-80% of retail price when opened. However, sealed product that stays unopened appreciates 5-15% per year on average. A balanced approach: 40-60% singles, 10-25% sealed, with the rest split across grading, supplies, and shows.',
  },
  {
    question: 'Is card grading worth the money?',
    answer: 'Grading is worth it when the raw-to-graded value difference exceeds 3-5x the grading cost. For example, if grading costs $20 (PSA Economy) and a PSA 10 sells for $200 vs $50 raw, the $150 premium far exceeds the cost. Never grade cards worth less than $50 raw — the math rarely works. Use our Grading ROI Calculator for specific card analysis.',
  },
  {
    question: 'How do I save up for an expensive grail card?',
    answer: 'Set aside 10-20% of your monthly hobby budget as a dedicated "grail fund." Don\'t touch it for impulse buys. At $200/month with 15% saved, you accumulate $360 in a year — enough for a PSA 9 key rookie. At $500/month, you save $900/year — approaching PSA 10 territory for modern stars. Patience is the key advantage budget collectors have over impulse buyers.',
  },
  {
    question: 'What is the average return on card collecting?',
    answer: 'Returns vary enormously. Blue-chip vintage cards (pre-1980 HOF rookies) have averaged 8-15% annual returns over 20+ years. Modern key rookies are much more volatile — a hot rookie can gain 200% in a season then drop 50% after an injury. Sealed hobby boxes appreciate 5-15% annually on average. Most common cards depreciate. The key is selectivity: buy quality over quantity, and diversify across eras and sports.',
  },
];

export default function BudgetPlannerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Hobby Budget Planner — Card Collecting Budget Calculator',
        description: 'Plan your monthly card collecting budget. Allocate across singles, sealed products, grading, supplies, and card shows. Get ROI estimates and grail card savings goals.',
        url: 'https://cardvault-two.vercel.app/tools/budget-planner',
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

      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Budget allocation + ROI estimates + grail savings · Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Hobby Budget Planner</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Set your monthly card collecting budget, allocate across categories, and see projected ROI. Choose a collector profile or customize your own split.
        </p>
      </div>

      <BudgetPlanner />

      {/* FAQ Section */}
      <div className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-800/40 border border-gray-700 rounded-xl">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium hover:text-emerald-400 transition-colors">
                {faq.question}
                <span className="ml-2 text-gray-500 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-4 pb-4 text-gray-400 text-sm leading-relaxed">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>

      {/* Back link */}
      <div className="mt-8 text-center">
        <Link href="/tools" className="text-emerald-400 hover:text-emerald-300 text-sm font-medium">
          ← Back to All Tools
        </Link>
      </div>
    </div>
  );
}
