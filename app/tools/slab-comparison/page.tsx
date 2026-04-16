import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import SlabComparisonClient from './SlabComparisonClient';

export const metadata: Metadata = {
  title: 'Grading Slab Comparison — PSA vs BGS vs CGC vs SGC | CardVault',
  description: 'Free side-by-side comparison of PSA, BGS, CGC, and SGC grading company slabs. Compare market share, grading scales, pricing, turnaround times, resale premiums, slab design, security features, and best use cases.',
  alternates: { canonical: './' },
  openGraph: {
    title: 'Grading Slab Comparison — PSA vs BGS vs CGC vs SGC | CardVault',
    description: 'Compare all 4 major grading companies. Pricing, speed, resale value, slab design, and more.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Slab Comparison — PSA vs BGS vs CGC vs SGC | CardVault',
    description: 'Which grading company should you use? Compare all 4 side-by-side.',
  },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Slab Comparison' },
];

const faqItems = [
  {
    question: 'Which grading company gives the highest resale value?',
    answer: 'PSA generally provides the highest resale premiums, especially for sports cards. A PSA 10 typically sells for 20-50% more than the equivalent BGS 9.5 and 50-100% more than CGC or SGC gems. However, BGS Black Label 10s (all four subgrades at 10) can exceed PSA 10 prices on modern cards. For Pokemon cards specifically, CGC and BGS are competitive with PSA on resale premiums.',
  },
  {
    question: 'Is BGS 9.5 equal to PSA 10?',
    answer: 'They are roughly equivalent in terms of quality, but not in market value. A BGS 9.5 Gem Mint indicates a card with extremely high quality across all four subgrade categories. A PSA 10 indicates gem mint quality without specifying which aspects scored highest. In the marketplace, PSA 10s generally sell for 20-40% more than BGS 9.5s for the same card, though this gap narrows for modern ultra-premium cards.',
  },
  {
    question: 'What is the cheapest grading company?',
    answer: 'SGC offers the most affordable economy pricing at $17/card with 30+ business day turnaround. CGC is close at $18/card with 45+ business days. PSA economy is $25/card and BGS economy is $22/card. For bulk submissions (20+ cards), all companies offer volume discounts that can reduce per-card costs by 15-30%.',
  },
  {
    question: 'Which grading company is best for vintage cards?',
    answer: 'PSA and SGC are the most respected for vintage cards (pre-1980). PSA has graded more vintage cards than any other company and their grades are universally accepted. SGC has a reputation for strict, consistent grading of vintage cards, and their Tuxedo slab makes vintage cards look stunning. BGS and CGC are less commonly used for vintage cards.',
  },
  {
    question: 'Can I cross-grade a card from one company to another?',
    answer: 'Yes. You can submit a card already graded by one company to a different grading company for "crossover" grading. The new company will crack the existing slab, re-evaluate the card, and re-slab it. The most common crossover is BGS/CGC/SGC to PSA. Success rates vary: SGC 10s cross to PSA 10 about 35-50% of the time, BGS 9.5s cross to PSA 10 about 30-40%, and CGC 10s cross about 20-30%.',
  },
];

export default function SlabComparisonPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Grading Slab Comparison Tool',
        description: 'Free side-by-side comparison of PSA, BGS, CGC, and SGC grading companies. Compare pricing, turnaround, resale premiums, and slab design.',
        url: 'https://cardvault-two.vercel.app/tools/slab-comparison',
        applicationCategory: 'UtilityApplication',
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

      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-indigo-950/60 border border-indigo-800/50 text-indigo-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
          4 Companies &bull; 6 Comparison Categories &bull; Pricing &bull; Resale Data &bull; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">
          Grading Slab Comparison
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl">
          PSA vs BGS vs CGC vs SGC — compare pricing, turnaround times, resale premiums, slab design, grading scales, and more. Find the right grading company for your cards.
        </p>
      </div>

      <SlabComparisonClient />

      {/* FAQ Section */}
      <div className="mt-12 border-t border-slate-800 pt-10">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((item, i) => (
            <div key={i}>
              <h3 className="text-sm font-bold text-white mb-2">{item.question}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 text-center">
        <Link href="/tools" className="text-indigo-400 hover:text-indigo-300 text-sm">
          &larr; Back to All Tools
        </Link>
      </div>
    </div>
  );
}