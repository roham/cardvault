import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import GradingProbability from './GradingProbability';

export const metadata: Metadata = {
  title: 'Grading Probability Estimator — Predict Your Card Grade Before Submitting',
  description: 'Free grading probability calculator. Input your card\'s condition, get probability distribution for every PSA grade (1-10), expected value, ROI analysis, and should-you-grade verdict. Works with 5,200+ sports cards.',
  openGraph: {
    title: 'Grading Probability Estimator — CardVault',
    description: 'Predict your PSA grade before submitting. Probability distribution, expected value, ROI analysis. Free.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Grading Probability Estimator — CardVault',
    description: 'Predict your card grade before submitting. Probability-based analysis. Free.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Grading Probability Estimator' },
];

const faqItems = [
  {
    question: 'How accurate is the grading probability estimate?',
    answer: 'The tool uses statistical modeling based on condition factors that PSA, BGS, CGC, and SGC graders evaluate. Results are probability estimates — actual grades depend on many factors including print quality, era-specific leniency, and individual grader judgment. Use this as a decision-making guide, not a guarantee.',
  },
  {
    question: 'What factors affect grading probability?',
    answer: 'Four main factors determine your grade probability: corners (30% weight), edges (25% weight), surface condition (25% weight), and centering (20% weight). Corners and edges are the most common reasons for grade reductions. Centering is often the difference between a PSA 9 and PSA 10.',
  },
  {
    question: 'When is grading worth it?',
    answer: 'Grading is worth it when the expected graded value minus grading costs exceeds your raw card value. Generally, cards worth $50+ raw with a realistic chance at PSA 9 or 10 are the best candidates. Lower-value cards need very high gem mint probability to justify the grading fee.',
  },
  {
    question: 'Which grading service should I choose?',
    answer: 'PSA commands the highest premiums for most modern cards. BGS is preferred for their sub-grade detail and 10 "Black Label" designation. CGC is gaining market share with competitive pricing. SGC is popular for vintage cards. Economy/standard services are fine for most submissions — express services only make sense for high-value cards you need quickly.',
  },
  {
    question: 'How do I honestly assess my card condition?',
    answer: 'Use a loupe or magnifying glass. Check all four corners under bright light for any fuzzing or wear. Run your finger along edges feeling for chips or roughness. Examine the surface at an angle for scratches, print dots, or roller marks. Measure centering with a ruler — anything beyond 60/40 on either axis will cap your grade at PSA 8 or below.',
  },
];

export default function GradingProbabilityPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Grading Probability Estimator',
        description: 'Predict your card grade before submitting. Probability distribution for every PSA grade, expected value calculation, ROI analysis, and grading verdict.',
        url: 'https://cardvault-two.vercel.app/tools/grading-probability',
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
          5,200+ Cards &middot; Probability Model &middot; Expected Value &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Grading Probability Estimator
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Don&apos;t guess — calculate. Input your card&apos;s condition, get the probability of every PSA grade, expected graded value, and a clear should-you-grade verdict.
        </p>
      </div>

      <GradingProbability />

      {/* FAQ Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-900/60 border border-gray-800 rounded-xl">
              <summary className="cursor-pointer p-4 text-white font-medium hover:text-indigo-400 transition-colors list-none flex justify-between items-center">
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
