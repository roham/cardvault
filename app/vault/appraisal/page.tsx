import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import AppraisalClient from './AppraisalClient';

export const metadata: Metadata = {
  title: 'Card Appraisal Service — Get a Free Sports Card Valuation | CardVault',
  description: 'Free instant sports card appraisal. Search 7,500+ cards, describe condition, and get a detailed valuation report with estimated grade, raw and graded values, grading ROI, best selling platform, and investment outlook.',
  openGraph: {
    title: 'Card Appraisal Service — CardVault',
    description: 'Free instant sports card appraisal with grading ROI, selling platform comparison, and investment outlook.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Appraisal — CardVault',
    description: 'Get a free appraisal for any sports card. Grade estimate, value, selling advice.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Vault', href: '/vault' },
  { label: 'Card Appraisal' },
];

const faqItems = [
  {
    question: 'How does the card appraisal work?',
    answer: 'Search for your card from our database of 7,500+ sports cards, then describe its condition (mint through poor) and any defects (creases, stains, off-centering). Our algorithm estimates the likely PSA grade, calculates raw and graded values, determines whether grading is worth the cost, and recommends the best selling platform.',
  },
  {
    question: 'How accurate are the valuations?',
    answer: 'CardVault appraisals are estimates based on market data and grading probability models. They are useful for ballpark valuations and grading decisions. For high-value cards ($500+), we recommend consulting a professional appraiser or submitting to a major auction house like Heritage or Goldin for an expert opinion.',
  },
  {
    question: 'Should I get my card professionally graded?',
    answer: 'The appraisal report includes a grading ROI calculation that compares the cost of grading (PSA fees, shipping, insurance) against the expected value increase. If the ROI exceeds 20% and the estimated grade is PSA 7 or higher, the report recommends grading. Cards in poor condition or low base value are typically not worth grading.',
  },
  {
    question: 'What selling platforms are compared?',
    answer: 'We compare six major selling channels: eBay (largest marketplace), COMC (dedicated card marketplace), MySlabs (graded card specialists), Facebook Groups (zero fees), Card Shows (same-day sales), and Heritage Auctions (premium consignment). Each platform is evaluated for fees, selling time, and target audience.',
  },
  {
    question: 'Is the appraisal report shareable?',
    answer: 'Yes! Click the "Share Appraisal" button to copy a text summary of your card\'s appraisal to your clipboard. You can paste it into texts, social media, or card collecting forums. The report includes estimated grade, raw and graded values, grading ROI, and the best selling platform recommendation.',
  },
];

export default function AppraisalPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Appraisal Service',
        description: 'Free instant sports card appraisal with estimated grade, value at every grade level, grading ROI, and selling platform comparison.',
        applicationCategory: 'UtilityApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        url: 'https://cardvault-two.vercel.app/vault/appraisal',
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

      <AppraisalClient />

      <section className="mt-16 border-t border-gray-800 pt-10">
        <h2 className="text-xl font-bold mb-4 text-white">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((f, i) => (
            <details key={i} className="group" open={i === 0}>
              <summary className="cursor-pointer text-gray-300 hover:text-white font-medium">{f.question}</summary>
              <p className="mt-2 text-gray-400 text-sm leading-relaxed">{f.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
