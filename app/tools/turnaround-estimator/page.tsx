import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import TurnaroundEstimator from './TurnaroundEstimator';

export const metadata: Metadata = {
  title: 'Grading Turnaround Estimator — PSA, BGS, CGC, SGC Wait Times',
  description: 'Free grading turnaround time estimator. Compare PSA, BGS, CGC, and SGC service levels by speed, cost, and value. Set a deadline, filter by company, and find the best grading option for your cards.',
  openGraph: {
    title: 'Grading Turnaround Estimator — CardVault',
    description: 'Compare PSA, BGS, CGC, SGC turnaround times and costs across all service levels.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Grading Turnaround Estimator — CardVault',
    description: 'How long will PSA/BGS/CGC/SGC take? Compare all tiers. Free tool.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Turnaround Estimator' },
];

const faqItems = [
  {
    question: 'How long does PSA grading take right now?',
    answer: 'PSA turnaround times range from 3-5 business days (Walk-Through at $300/card) to 65-90 business days (Value at $25/card). The most popular Regular tier ($50/card) takes approximately 40-65 business days. Actual times can vary based on submission volume and time of year.',
  },
  {
    question: 'Which grading company is the fastest?',
    answer: 'For standard submissions, SGC often has the fastest turnaround times at comparable price points. Their Standard tier (20-35 business days at $30/card) is competitive with more expensive tiers from other companies. For premium rush service, PSA Walk-Through (3-5 days) and CGC Walk-Through (3-5 days) are the fastest options.',
  },
  {
    question: 'Which grading company is the cheapest?',
    answer: 'SGC Economy at $15/card is the cheapest grading option, followed by CGC Economy at $18/card and BGS Economy at $22/card. These economy tiers typically require minimum submissions of 10-20 cards and have the longest turnaround times (50-120 business days).',
  },
  {
    question: 'Should I pay for faster grading turnaround?',
    answer: 'It depends on the card value and your timeline. A general rule is to never spend more than 10-15% of the card value on grading. For a $500 card, a $50 Regular submission makes sense. For a $50 card, use the $15-25 Economy tier. Only pay for express service if the card is time-sensitive (hot rookie, trending player) and the faster return will capture a price window.',
  },
  {
    question: 'Do grading turnaround times include shipping?',
    answer: 'No. Quoted turnaround times start when the grading company receives and logs your submission, and end when the cards are shipped back. Add 3-7 business days for inbound shipping and 3-7 business days for return shipping, depending on your carrier and location. Total door-to-door time is typically 1-2 weeks longer than the quoted turnaround.',
  },
];

export default function TurnaroundEstimatorPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Grading Turnaround Estimator',
        description: 'Compare grading turnaround times and costs across PSA, BGS, CGC, and SGC service levels.',
        url: 'https://cardvault-two.vercel.app/tools/turnaround-estimator',
        applicationCategory: 'UtilitiesApplication',
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
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          PSA &middot; BGS &middot; CGC &middot; SGC &middot; All Tiers &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Grading Turnaround Estimator</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Compare turnaround times and costs across all PSA, BGS, CGC, and SGC service levels. Set your card value, number of cards, and deadline to find the best grading option.
        </p>
      </div>

      <TurnaroundEstimator />

      {/* FAQ Section */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((f, i) => (
            <div key={i} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
              <h3 className="font-semibold text-white mb-2">{f.question}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
