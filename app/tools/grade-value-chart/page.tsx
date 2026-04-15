import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import GradeValueChart from './GradeValueChart';

export const metadata: Metadata = {
  title: 'Grade Value Chart — Card Value at Every PSA Grade (1-10)',
  description: 'Free grade value chart for sports cards. See estimated market values at every PSA grade from 1 to 10. Find the sweet spot grade for maximum ROI. Compare grading costs across PSA, BGS, CGC, and SGC.',
  openGraph: {
    title: 'Grade Value Chart — CardVault',
    description: 'See any card\'s value at every PSA grade. Find the sweet spot for grading ROI.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Grade Value Chart — CardVault',
    description: 'Card values at every PSA grade 1-10. Free sweet spot finder.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Grade Value Chart' },
];

const faqItems = [
  {
    question: 'How are the grade values estimated?',
    answer: 'Grade values are estimated using established market multipliers relative to the PSA 10 (Gem Mint) value. Modern cards (post-1985) follow steeper curves where PSA 10 commands the vast majority of value. Vintage cards (pre-1985) retain more value in lower grades because condition-scarce copies are rarer. The multipliers are derived from historical eBay sold data and auction results.',
  },
  {
    question: 'What is the "sweet spot" grade?',
    answer: 'The sweet spot is the grade that gives you the highest return on investment (ROI) after factoring in grading costs. For most modern cards, this is PSA 9 — it offers 35-50% of the PSA 10 value at a much higher probability of achieving. For high-value cards, PSA 10 is the sweet spot because the premium justifies the grading difficulty.',
  },
  {
    question: 'Why is the PSA 10 value so much higher than PSA 9?',
    answer: 'The PSA 9-to-10 multiplier is the single biggest value jump in the entire grading scale — typically a 2-3x increase. This is because PSA 10 represents the absolute pinnacle of card condition (perfect centering, corners, edges, and surface) and the population of PSA 10s is much lower than PSA 9s. Collectors pay a premium for the "perfect" grade.',
  },
  {
    question: 'Should I grade my card?',
    answer: 'Grade your card if the PSA 10 value is at least 4x the grading cost. For example, if grading costs $25, the PSA 10 value should be $100+ to justify the expense. Use the ROI column in the chart — any grade showing positive ROI means the graded value exceeds the raw value plus grading costs.',
  },
  {
    question: 'Do vintage and modern cards have different grade value curves?',
    answer: 'Yes. Vintage cards (pre-1985) hold proportionally more value in lower grades because condition-scarce copies are rare — a 1952 Topps Mantle in PSA 5 is still incredibly valuable. Modern cards (post-1985) have much steeper curves because millions of copies exist in high grades, making only PSA 9-10 significantly valuable.',
  },
];

export default function GradeValueChartPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Grade Value Chart',
        description: 'See any sports card\'s estimated value at every PSA grade from 1 to 10. Find the sweet spot grade for maximum grading ROI.',
        url: 'https://cardvault-two.vercel.app/tools/grade-value-chart',
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
        <div className="inline-flex items-center gap-2 bg-blue-950/60 border border-blue-800/50 text-blue-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
          5,200+ Cards &middot; PSA 1-10 Values &middot; ROI Analysis &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Grade Value Chart</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          See what any card is worth at every PSA grade from 1 to 10. Find the sweet spot grade for maximum return on your grading investment.
        </p>
      </div>

      <GradeValueChart />

      {/* FAQ */}
      <div className="mt-12 space-y-6">
        <h2 className="text-xl font-bold text-white">Frequently Asked Questions</h2>
        {faqItems.map(f => (
          <details key={f.question} className="group bg-gray-800/50 border border-gray-700 rounded-xl">
            <summary className="px-4 py-3 text-white font-medium cursor-pointer hover:text-blue-400 transition-colors">
              {f.question}
            </summary>
            <div className="px-4 pb-4 text-gray-400 text-sm">{f.answer}</div>
          </details>
        ))}
      </div>
    </div>
  );
}
