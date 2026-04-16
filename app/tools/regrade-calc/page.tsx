import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import RegradeCalcClient from './RegradeCalcClient';

export const metadata: Metadata = {
  title: 'Card Regrade Calculator — Should You Crack & Resubmit? | CardVault',
  description: 'Free crack-and-resubmit calculator for graded cards. Enter your current slab grade, pick a target company, and see the expected value of regrading. Covers PSA, BGS, CGC, and SGC with upgrade probabilities, costs, and net profit analysis.',
  openGraph: {
    title: 'Card Regrade Calculator — Crack & Resubmit Analysis | CardVault',
    description: 'Should you crack your slab and resubmit? Calculate upgrade probability, grading costs, and expected profit for PSA, BGS, CGC, and SGC.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Regrade Calculator — CardVault',
    description: 'Calculate if cracking and regrading your card is worth it. PSA, BGS, CGC, SGC analysis.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Regrade Calculator' },
];

const faqItems = [
  {
    question: 'What does "crack and resubmit" mean?',
    answer: 'Cracking and resubmitting is when you remove a graded card from its protective slab (case) and submit it to the same or a different grading company for a new grade. Collectors do this to upgrade a grade (e.g., PSA 9 to PSA 10), switch companies (e.g., CGC to PSA for higher resale), or challenge a grade they believe was too low. It involves cracking costs ($5-15), grading fees ($18-150+), and risk of receiving the same or lower grade.',
  },
  {
    question: 'How are regrade probabilities calculated?',
    answer: 'Regrade probabilities are based on historical patterns from the grading hobby. Key factors include: current grade (higher grades like 9 have more upgrade potential than 6), source company standards (BGS 9.5 crosses to PSA 10 at roughly 60-70%), card condition consistency, and grading company tendencies. PSA is generally considered slightly more lenient on centering, while BGS is stricter with half-grade precision. These are estimates based on community data, not guarantees.',
  },
  {
    question: 'When is regrading worth it?',
    answer: 'Regrading is worth it when the expected value gain exceeds total costs. The best candidates are: high-value cards where a one-grade bump means hundreds or thousands in added value, BGS 9.5 cards crossing to PSA 10 (where PSA 10 commands a significant premium), cards you believe were undergraded, and cards from less popular companies (CGC/SGC) moving to PSA for wider market appeal. Avoid regrading low-value cards where costs exceed potential gains.',
  },
  {
    question: 'What are typical cracking and grading costs?',
    answer: 'Cracking a slab yourself costs $0 but risks card damage. Professional cracking services charge $5-15 per card. Grading fees vary by company and service level: PSA Economy ($18-20, 60-90 days), PSA Regular ($50, 30 days), PSA Express ($100, 15 days). BGS Standard ($22, 40-60 days), BGS Quick ($40, 20 days). CGC Standard ($20, 40-60 days). SGC Standard ($20, 30-45 days). Plus return shipping ($10-15 per submission).',
  },
  {
    question: 'What are the risks of cracking a slab?',
    answer: 'The main risks are: physical damage during cracking (scratches, dings, fingerprints), receiving a lower grade than expected, the card being deemed "altered" if cleaning residue or marks are detected, and loss of the original grade with no guarantee of matching or exceeding it. Always use a proper slab cracking tool, wear cotton gloves, and work on a clean soft surface. Never crack a card you cannot afford to lose value on.',
  },
];

export default function RegradeCalcPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Regrade Calculator — Crack & Resubmit Analysis',
        description: 'Calculate whether cracking and regrading a card is profitable. Covers PSA, BGS, CGC, SGC with upgrade probabilities and cost analysis.',
        url: 'https://cardvault-two.vercel.app/tools/regrade-calc',
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
        <div className="inline-flex items-center gap-2 bg-amber-950/60 border border-amber-800/50 text-amber-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
          PSA &middot; BGS &middot; CGC &middot; SGC &middot; Upgrade Probabilities
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Regrade Calculator</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Should you crack your slab and resubmit? Find any card, enter its current grade, and see the expected profit or loss from regrading.
        </p>
      </div>

      <RegradeCalcClient />

      {/* FAQ */}
      <div className="mt-12 space-y-4">
        <h2 className="text-xl font-bold text-white">Frequently Asked Questions</h2>
        {faqItems.map((f, i) => (
          <details key={i} className="group bg-gray-900/40 border border-gray-800/40 rounded-lg">
            <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-gray-300 hover:text-white flex items-center justify-between">
              {f.question}
              <span className="text-gray-600 group-open:rotate-180 transition-transform">&#9662;</span>
            </summary>
            <p className="px-4 pb-4 text-sm text-gray-400 leading-relaxed">{f.answer}</p>
          </details>
        ))}
      </div>

      {/* Related Tools */}
      <div className="mt-10 bg-gray-900/40 border border-gray-800/40 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-3">Related Grading Tools</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/tools/grading-roi', label: 'Grading ROI Calculator' },
            { href: '/tools/cross-grade', label: 'Cross-Grade Converter' },
            { href: '/tools/grade-spread', label: 'Grade Price Spread' },
            { href: '/tools/centering-check', label: 'Centering Checker' },
            { href: '/tools/condition-grader', label: 'Condition Grader' },
            { href: '/tools/slab-weight', label: 'Slab Weight Verifier' },
            { href: '/tools/submission-planner', label: 'Submission Planner' },
            { href: '/tools/cert-check', label: 'Cert Number Checker' },
          ].map(l => (
            <Link key={l.href} href={l.href} className="text-sm text-amber-400 hover:text-amber-300 underline underline-offset-2">
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
