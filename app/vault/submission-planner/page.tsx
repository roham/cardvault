import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import SubmissionPlannerClient from './SubmissionPlannerClient';

export const metadata: Metadata = {
  title: 'Grading Submission Planner — Optimize Your Card Grading Batch | CardVault',
  description: 'Plan the perfect grading submission. Add cards, get per-card recommendations for PSA vs BGS vs CGC vs SGC, optimize batch sizes for price breaks, see ROI per card, and export your submission plan. Free grading batch optimizer for card collectors.',
  openGraph: {
    title: 'Grading Submission Planner — Optimize Your Batch | CardVault',
    description: 'Get per-card grading company recommendations, batch size optimization, and ROI projections. Free.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Grading Submission Planner — CardVault',
    description: 'Optimize your grading submission: which company, which service level, batch pricing, ROI per card.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Vault', href: '/vault' },
  { label: 'Submission Planner' },
];

const faqItems = [
  {
    question: 'How does the grading submission planner work?',
    answer: 'Add cards with their name, raw value, and estimated condition. The planner recommends the optimal grading company (PSA, BGS, CGC, or SGC) for each card based on value, sport, and era. It calculates costs at each service level, projects ROI, and suggests batch groupings to hit volume price breaks. Export the full plan when ready to submit.',
  },
  {
    question: 'How does it decide which grading company to use?',
    answer: 'The recommendation engine considers card value (PSA commands highest premiums on high-value cards), sport (basketball and baseball collectors favor PSA, football collectors accept BGS/SGC), era (vintage cards get better grades from SGC, modern from PSA), and batch economics (CGC and SGC offer lower per-card costs for bulk submissions).',
  },
  {
    question: 'What are the current grading service levels and costs?',
    answer: 'PSA: Economy ($25, 20+ cards, 65+ days), Regular ($50, 1+, 45 days), Express ($100, 1+, 20 days), Super Express ($200, 1+, 5 days). BGS: Standard ($35, 1+, 50 days), Express ($80, 1+, 10 days). CGC: Standard ($30, 1+, 50 days), Express ($75, 1+, 15 days). SGC: Economy ($22, 10+, 60 days), Regular ($30, 1+, 40 days). Prices are approximate and may vary.',
  },
  {
    question: 'When should I NOT submit a card for grading?',
    answer: 'Skip grading if: the raw card is worth less than $15 (grading fees exceed likely value increase), you estimate the grade below PSA 7 (low grades rarely add value), the card is a common base card from the junk wax era (1987-1993), or the card has obvious damage like creases or staining. Focus your grading budget on rookie cards, star players, and cards in visibly excellent condition.',
  },
  {
    question: 'How are batch size recommendations calculated?',
    answer: 'Most grading companies offer volume discounts: PSA Economy requires 20+ cards at $25/each vs $50 for single cards. The planner groups your cards to maximize these price breaks. If you have 18 cards for PSA, it may suggest adding 2 more to reach the 20-card Economy threshold, saving $25 per card across the batch. The ROI calculation includes these savings.',
  },
];

export default function SubmissionPlannerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Grading Submission Planner',
        description: 'Optimize your card grading batch. Per-card company recommendations, batch size optimization, ROI projections, and exportable submission plans.',
        url: 'https://cardvault-two.vercel.app/vault/submission-planner',
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
        <div className="inline-flex items-center gap-2 bg-purple-950/60 border border-purple-800/50 text-purple-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
          PSA &middot; BGS &middot; CGC &middot; SGC &middot; Batch Optimizer &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Grading Submission Planner</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Plan the perfect grading batch. Add your cards, get per-card company recommendations,
          optimize batch sizes for price breaks, and see projected ROI before you submit.
        </p>
      </div>

      <SubmissionPlannerClient />

      <section className="mt-16 border-t border-gray-800 pt-10">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-900/60 border border-gray-800 rounded-lg">
              <summary className="flex items-center justify-between cursor-pointer px-5 py-4 text-white font-medium">
                {faq.question}
                <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </summary>
              <div className="px-5 pb-4 text-gray-400 text-sm leading-relaxed">{faq.answer}</div>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-12 border-t border-gray-800 pt-10">
        <h2 className="text-xl font-bold text-white mb-4">How to Use This Planner</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { step: '1', title: 'Add Your Cards', desc: 'Enter card name, estimated raw value, and condition rating (Mint to Poor).' },
            { step: '2', title: 'Review Recommendations', desc: 'Each card gets a recommended grading company, service level, and projected ROI.' },
            { step: '3', title: 'Optimize Batch', desc: 'The planner groups cards by company and suggests adds to hit volume price breaks.' },
            { step: '4', title: 'Export & Submit', desc: 'Copy your finalized plan with per-company checklists, costs, and instructions.' },
          ].map(s => (
            <div key={s.step} className="bg-gray-900/60 border border-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="w-7 h-7 bg-purple-900/60 border border-purple-700/40 rounded-full flex items-center justify-center text-purple-400 text-sm font-bold">{s.step}</span>
                <h3 className="text-white font-semibold text-sm">{s.title}</h3>
              </div>
              <p className="text-gray-400 text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 border-t border-gray-800 pt-10">
        <h2 className="text-xl font-bold text-white mb-4">Related Tools</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { href: '/vault/grading-queue', label: 'Grading Queue Manager', desc: 'Track submitted & returned cards' },
            { href: '/tools/grading-roi', label: 'Grading ROI Calculator', desc: 'Is grading worth it for one card?' },
            { href: '/tools/centering-checker', label: 'Centering Checker', desc: 'Check L/R and T/B centering' },
            { href: '/tools/slab-weight', label: 'Slab Weight Verifier', desc: 'Verify slab authenticity by weight' },
            { href: '/tools/regrade-calc', label: 'Regrade Calculator', desc: 'Should you crack and resubmit?' },
            { href: '/vault/appraisal', label: 'Card Appraisal', desc: 'Get a full card valuation report' },
          ].map(t => (
            <Link key={t.href} href={t.href} className="bg-gray-900/60 border border-gray-800 rounded-lg p-3 hover:border-purple-700/50 transition-colors">
              <span className="text-white text-sm font-medium">{t.label}</span>
              <span className="text-gray-500 text-xs block mt-0.5">{t.desc}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
