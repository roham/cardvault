import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import SubmissionPlanner from './SubmissionPlanner';

export const metadata: Metadata = {
  title: 'Grading Submission Planner — PSA, BGS, CGC, SGC Cost Calculator',
  description: 'Plan your card grading submission. Compare PSA, BGS, CGC, and SGC costs, service tiers, turnaround times, and calculate total cost including shipping and insurance.',
  openGraph: {
    title: 'Grading Submission Planner — CardVault',
    description: 'Plan your next grading submission. Compare all 4 companies, see total cost, and decide if grading is worth it.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Grading Submission Planner — CardVault',
    description: 'Compare PSA, BGS, CGC, SGC costs and plan your submission with full cost breakdown.',
  },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Submission Planner' },
];

const faqItems = [
  {
    question: 'How much does it cost to grade cards with PSA?',
    answer: 'PSA pricing starts at $25/card for Value tier (60-90 business day turnaround) and goes up to $600/card for Walk-Through (1-3 business days). Membership ($99/year) is required. Add $12 shipping to PSA and $15 return shipping. For a 10-card Value submission, expect approximately $289 total, or ~$29 per card.',
  },
  {
    question: 'Which grading company is cheapest?',
    answer: 'SGC is typically the cheapest at $15/card for Economy tier with no membership required. CGC starts at $18/card (requires $25/year membership). BGS starts at $20/card with no membership. PSA starts at $25/card (requires $99/year membership). However, PSA and BGS slabs generally command higher resale premiums, so cheapest grading does not always mean best value.',
  },
  {
    question: 'Is it worth grading my cards?',
    answer: 'Grading is worth it when the expected graded value minus grading costs exceeds the raw value by a meaningful margin. General rules: cards worth $50+ raw are candidates for grading, cards under $20 raw rarely make sense unless they are condition-rare vintage. Use our calculator to input your specific cards and see the exact breakeven point.',
  },
  {
    question: 'How long does card grading take?',
    answer: 'Economy tiers: 45-90 business days (2-4 months). Standard tiers: 20-45 business days (1-2 months). Express: 10-15 business days (2-3 weeks). Premium: 5-7 business days (1-2 weeks). Walk-Through: 1-3 business days. SGC Economy is typically the fastest economy option at 45-60 days. Add 1-2 weeks for shipping each way.',
  },
  {
    question: 'Should I submit to PSA or BGS?',
    answer: 'PSA slabs command the highest premiums for most sports cards (10-30% more than BGS). BGS is preferred for Pokemon/TCG cards and offers sub-grades that serious collectors value. CGC is gaining market share with lower prices. SGC is best for vintage cards and budget submissions. For maximum resale value on sports rookies, PSA is the default choice.',
  },
];

export default function SubmissionPlannerPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Grading Submission Planner',
        description: 'Plan your card grading submission. Compare PSA, BGS, CGC, and SGC costs, service tiers, and turnaround times.',
        url: 'https://cardvault-two.vercel.app/tools/submission-planner',
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

      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          PSA - BGS - CGC - SGC - All Service Tiers - Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Grading Submission Planner
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl">
          Plan your next grading submission. Compare all 4 companies, see full cost breakdowns
          including shipping and insurance, and decide if the grade is worth the investment.
        </p>
      </div>

      <SubmissionPlanner />

      {/* FAQ */}
      <section className="mt-16 mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item) => (
            <details key={item.question} className="group bg-zinc-900/60 border border-zinc-800 rounded-xl">
              <summary className="p-5 cursor-pointer text-white font-medium flex items-center justify-between">
                {item.question}
                <span className="text-zinc-500 group-open:rotate-180 transition-transform">&#9660;</span>
              </summary>
              <p className="px-5 pb-5 text-zinc-400 text-sm leading-relaxed">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <div className="text-center text-zinc-600 text-xs mt-8">
        <p>Pricing data is approximate and may change. Check each company&apos;s website for current rates.</p>
        <p className="mt-1">
          <Link href="/tools" className="text-emerald-500 hover:text-emerald-400">All Tools</Link>
          {' '}&middot;{' '}
          <Link href="/tools/condition-grader" className="text-emerald-500 hover:text-emerald-400">Condition Self-Grader</Link>
          {' '}&middot;{' '}
          <Link href="/tools/grading-roi" className="text-emerald-500 hover:text-emerald-400">Grading ROI Calculator</Link>
        </p>
      </div>
    </div>
  );
}
