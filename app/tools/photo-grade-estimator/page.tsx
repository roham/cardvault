import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import PhotoGradeEstimator from './PhotoGradeEstimator';

export const metadata: Metadata = {
  title: 'Photo Grade Estimator — Estimate PSA Grade From Your Card Photo Free',
  description: 'Free photo-based card grading tool. Assess corners, edges, surface, and centering from your card photo to estimate PSA, BGS, and CGC grades. Includes visual reference chart and common photo pitfalls.',
  openGraph: {
    title: 'Photo Grade Estimator — CardVault',
    description: 'Estimate your card grade from a photo. Quick visual assessment for PSA, BGS, and CGC with grade reference chart.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Photo Grade Estimator — CardVault',
    description: 'What grade will your card get? Quick photo-based grade estimator for PSA, BGS, and CGC.',
  },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Photo Grade Estimator' },
];

const faqItems = [
  {
    question: 'How accurate is a photo-based grade estimate?',
    answer: 'Photo-based estimates are typically within 0.5-1 grade point of the actual PSA grade for most modern cards. However, photos can miss subtle surface defects, back-of-card issues, and printing anomalies that graders catch under magnification. Use this as a screening tool — not a guarantee. Cards estimated at PSA 9+ should be physically inspected before investing in professional grading.',
  },
  {
    question: 'What is the difference between this and the Condition Self-Grader?',
    answer: 'The Photo Grade Estimator is designed for quick visual assessment — you evaluate what you see in a photo and get instant grade estimates across PSA, BGS, and CGC. The Condition Self-Grader is a more detailed step-by-step inspection tool. Use this tool for quick screening at card shows or when buying online, and the Self-Grader for thorough pre-submission analysis.',
  },
  {
    question: 'Can I accurately grade a card from an eBay listing photo?',
    answer: 'eBay photos can be misleading. Sellers may use favorable lighting that hides scratches, shoot at angles that disguise centering issues, or use low resolution that obscures corner wear. Look for listings with 8+ photos showing all corners, both sides, and angled shots. Be skeptical of listings with only 1-2 photos or heavy filtering.',
  },
  {
    question: 'Why does my card look different in photos vs real life?',
    answer: 'Camera sensors, lighting color temperature, screen calibration, and lens distortion all affect how cards appear in photos. Glossy and chrome cards are especially tricky because reflections can hide or create apparent defects. For the most accurate assessment, evaluate the physical card under natural daylight with a 5-10x loupe.',
  },
  {
    question: 'Does card era affect grading standards?',
    answer: 'Yes. Grading companies are more lenient with vintage cards (pre-1980) because surviving examples in pristine condition are extremely rare. A 1952 Topps Mantle with slight corner wear might still earn a PSA 7, while a 2024 Prizm rookie with the same wear would likely grade PSA 5-6. Our vintage toggle adjusts estimates accordingly.',
  },
];

export default function PhotoGradeEstimatorPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Photo Grade Estimator',
        description: 'Free photo-based card grading estimator. Assess corners, edges, surface, and centering to estimate PSA, BGS, and CGC grades from your card photo.',
        url: 'https://cardvault-two.vercel.app/tools/photo-grade-estimator',
        applicationCategory: 'UtilitiesApplication',
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
        <div className="inline-flex items-center gap-2 bg-cyan-950/60 border border-cyan-800/50 text-cyan-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
          Quick Visual Assessment - PSA / BGS / CGC - Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Photo Grade Estimator
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl">
          Look at your card (or a photo of it) and select the closest description for each criterion.
          Get instant PSA, BGS, and CGC grade estimates with a grading recommendation.
        </p>
      </div>

      <PhotoGradeEstimator />

      {/* FAQ */}
      <section className="mt-16 mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item) => (
            <details key={item.question} className="group bg-zinc-900/60 border border-zinc-800 rounded-xl">
              <summary className="p-5 cursor-pointer text-white font-medium flex items-center justify-between">
                {item.question}
                <span className="text-zinc-500 group-open:rotate-180 transition-transform ml-4 shrink-0">▼</span>
              </summary>
              <div className="px-5 pb-5 text-zinc-400 text-sm leading-relaxed">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Internal links */}
      <section className="mt-12 mb-8 border-t border-zinc-800 pt-8">
        <h2 className="text-lg font-bold text-white mb-4">More Grading & Condition Tools</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { href: '/tools/condition-grader', label: 'Condition Self-Grader' },
            { href: '/tools/grading-roi', label: 'Grading ROI Calculator' },
            { href: '/tools/centering-calc', label: 'Centering Calculator' },
            { href: '/tools/submission-planner', label: 'Submission Planner' },
            { href: '/tools/pop-report', label: 'Population Report' },
            { href: '/tools/bgs-subgrade', label: 'BGS Subgrade Calculator' },
            { href: '/tools/cross-grade', label: 'Cross-Grade Converter' },
            { href: '/tools/cert-check', label: 'PSA Cert Verifier' },
            { href: '/tools/turnaround-estimator', label: 'Turnaround Estimator' },
            { href: '/tools/photo-guide', label: 'Card Photography Guide' },
          ].map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 rounded-xl text-sm font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
