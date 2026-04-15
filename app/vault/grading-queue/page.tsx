import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import GradingQueueClient from './GradingQueueClient';

export const metadata: Metadata = {
  title: 'Grading Queue Manager — Plan & Track Card Grading Submissions | CardVault',
  description: 'Free grading queue manager. Add cards, estimate expected grades, calculate submission costs by company (PSA, BGS, CGC, SGC), track submitted vs returned cards, and see potential value increase. Plan your next grading batch.',
  openGraph: {
    title: 'Grading Queue Manager — CardVault',
    description: 'Plan and track card grading submissions. Expected grades, costs, value increase estimates.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Grading Queue Manager — CardVault',
    description: 'Manage your grading submissions. Track costs, expected grades, and potential ROI.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Vault', href: '/vault' },
  { label: 'Grading Queue' },
];

const faqItems = [
  {
    question: 'How does the grading queue work?',
    answer: 'Add cards you want to grade, set your expected grade and preferred grading company, and the queue calculates total cost, estimated value increase, and ROI for each card. Move cards between Queue (planning), Submitted (sent out), and Returned (graded back). All data saves locally in your browser.',
  },
  {
    question: 'How are grading costs calculated?',
    answer: 'Costs are based on current published rates: PSA Regular ($50/card), PSA Economy ($25/card), BGS Standard ($35/card), CGC Standard ($30/card), and SGC Regular ($30/card). Actual costs vary by declared value and service level. These are estimates for planning purposes.',
  },
  {
    question: 'How is expected value increase estimated?',
    answer: 'Value increase is estimated by comparing the raw value you enter against a multiplier for the expected grade. A PSA 10 typically commands 3-8x raw value, PSA 9 is 1.5-3x, PSA 8 is 0.8-1.5x. Lower grades may actually decrease value since you also pay the grading fee. The tool flags cards where grading may not be profitable.',
  },
  {
    question: 'When should I NOT submit a card for grading?',
    answer: 'Avoid grading cards worth less than $20 raw (fees eat your margin), cards with obvious surface damage (likely grade 6 or below), and cards from junk wax era base sets (graded commons rarely sell for more than raw + grading fee). Focus grading budget on rookie cards, star players, and cards in visibly excellent condition.',
  },
];

export default function GradingQueuePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Grading Queue Manager',
        description: 'Plan and track card grading submissions. Calculate costs, expected grades, and ROI.',
        url: 'https://cardvault-two.vercel.app/vault/grading-queue',
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
          Queue &middot; Submitted &middot; Returned &middot; ROI Tracking &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Grading Queue Manager</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Plan your next grading submission. Add cards, estimate expected grades, compare costs across
          PSA, BGS, CGC, and SGC, and track cards through the submission process.
        </p>
      </div>

      <GradingQueueClient />

      {/* FAQ Section */}
      <section className="mt-16 mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((f, i) => (
            <details key={i} className="group bg-gray-800/50 border border-gray-700 rounded-xl">
              <summary className="cursor-pointer px-6 py-4 text-white font-medium list-none flex items-center justify-between">
                {f.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform">&#9662;</span>
              </summary>
              <div className="px-6 pb-4 text-gray-400 text-sm leading-relaxed">{f.answer}</div>
            </details>
          ))}
        </div>
      </section>

      {/* Related */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-white mb-4">Related Tools</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/tools/grading-roi', label: 'Grading ROI Calculator', icon: '📈' },
            { href: '/tools/submission-planner', label: 'Submission Planner', icon: '📋' },
            { href: '/tools/bulk-grading-roi', label: 'Bulk Grading ROI', icon: '📦' },
            { href: '/tools/turnaround-estimator', label: 'Turnaround Estimator', icon: '⏱️' },
            { href: '/vault', label: 'My Vault', icon: '🏦' },
            { href: '/vault/analytics', label: 'Vault Analytics', icon: '📊' },
          ].map(t => (
            <Link
              key={t.href}
              href={t.href}
              className="flex items-center gap-2 px-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-xl text-sm text-gray-300 hover:text-white transition-colors"
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
