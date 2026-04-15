import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import GradePredictorClient from './GradePredictorClient';

export const metadata: Metadata = {
  title: 'Card Grade Predictor — Estimate PSA, BGS, CGC Grade Before Submitting',
  description: 'Free card grade predictor. Rate your card corners, edges, surface, and centering to get an estimated PSA, BGS, and CGC grade with confidence score. Know before you submit.',
  openGraph: {
    title: 'Card Grade Predictor — CardVault',
    description: 'Predict your card grade before submitting. Free PSA/BGS/CGC estimate.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Grade Predictor — CardVault',
    description: 'What grade will your card get? Predict before you pay to submit.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Grade Predictor' },
];

const faqItems = [
  {
    question: 'How accurate is this grade predictor?',
    answer: 'This tool provides an estimate based on common grading criteria. Actual grades from PSA, BGS, and CGC can vary because grading involves human judgment. Use this as a guide to decide whether a card is worth submitting, not as a guarantee of the final grade.',
  },
  {
    question: 'What is the difference between PSA and BGS grading scales?',
    answer: 'PSA uses whole-number grades (1-10) while BGS uses half-point increments (1-10) with sub-grades for centering, corners, edges, and surface. A PSA 10 and a BGS 10 (Pristine) are roughly equivalent, but BGS 10 is rarer. A BGS 9.5 (Gem Mint) is between a PSA 9 and PSA 10 in difficulty.',
  },
  {
    question: 'What grade should I aim for before submitting?',
    answer: 'For most modern cards, aim for PSA 9 or higher to make grading worthwhile. The value premium for graded cards under PSA 8 is often less than the grading cost. For vintage cards (pre-1980), even lower grades like PSA 5-7 can add significant value due to scarcity.',
  },
  {
    question: 'Why does centering matter less for PSA?',
    answer: 'PSA is more lenient on centering than BGS. PSA allows approximately 60/40 front and 75/25 back for a PSA 10, while BGS requires approximately 50/50 to 55/45 for sub-grade 10. This is why many BGS 9.5 cards with a low centering sub-grade cross to PSA 10.',
  },
  {
    question: 'Should I grade raw cards or buy already-graded cards?',
    answer: 'It depends on your eye and risk tolerance. If you can accurately assess card condition, grading raw cards can be profitable — you pay $25-50 per card and potentially add hundreds in value. If you want certainty, buying already-graded cards eliminates the risk of getting a lower grade than expected.',
  },
];

export default function GradePredictorPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Grade Predictor',
        description: 'Predict PSA, BGS, and CGC grades for trading cards before submitting for grading.',
        url: 'https://cardvault-two.vercel.app/grade-predictor',
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
          PSA &middot; BGS &middot; CGC &middot; Instant &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Grade Predictor</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Rate your card's corners, edges, surface, and centering to get an instant predicted PSA, BGS, and CGC grade. Know before you submit.
        </p>
      </div>

      <GradePredictorClient />

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
