import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CrossGradeConverter from './CrossGradeConverter';

export const metadata: Metadata = {
  title: 'Cross-Grade Converter — PSA vs BGS vs CGC vs SGC Grade Equivalents',
  description: 'Free grade conversion tool. Convert between PSA, BGS, CGC, and SGC grades instantly. See equivalent grades, estimated value differences, crossover advice, and the full equivalency table. Know what your card is worth in any slab.',
  openGraph: {
    title: 'Cross-Grade Converter — CardVault',
    description: 'Convert PSA, BGS, CGC, and SGC grades. See equivalents, values, and crossover advice.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Cross-Grade Converter — CardVault',
    description: 'Free PSA/BGS/CGC/SGC grade conversion tool with value estimates and crossover advice.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Cross-Grade Converter' },
];

const faqItems = [
  {
    question: 'Is a PSA 10 the same as a BGS 10?',
    answer: 'No. A BGS 10 (Black Label / Pristine) is significantly rarer and more valuable than a PSA 10. BGS requires perfect 10s on all four sub-grades (centering, corners, edges, surface). A PSA 10 is closer to a BGS 9.5 Gem Mint. For high-end cards, a BGS 10 can command 2-5x the price of a PSA 10.',
  },
  {
    question: 'What is crossover grading and is it worth it?',
    answer: 'Crossover grading means submitting a card already graded by one company (e.g., BGS) to another company (e.g., PSA) to get a new grade in a different holder. It\'s worth doing when the potential price increase exceeds grading costs ($25-150 + shipping). The most popular crossover is BGS 9.5 to PSA 10, which has a 60-70% success rate for cards with strong sub-grades.',
  },
  {
    question: 'Which grading company should I use?',
    answer: 'PSA has the highest liquidity and resale values for most modern cards. BGS (Beckett) is preferred for basketball Prizm and offers detailed sub-grades. SGC is excellent for vintage cards (pre-1980) and has fast turnaround times. CGC is newer to sports cards but growing rapidly, with competitive pricing.',
  },
  {
    question: 'Why do PSA cards sell for more than BGS or CGC?',
    answer: 'PSA dominates market share (~60-70% of graded cards sold) which creates higher liquidity and demand. More buyers searching for PSA means higher sold prices. However, this premium varies by sport and era — BGS commands premiums on basketball Prizm, and SGC is gaining ground in vintage.',
  },
  {
    question: 'Do half grades (8.5, 9.5) affect value?',
    answer: 'Yes, significantly. BGS, CGC, and SGC offer half grades while PSA does not. A BGS 9.5 commands roughly 90-100% of a PSA 10 price, while a BGS 9 is only 60-80% of a PSA 10. Half grades create arbitrage opportunities — a BGS 8.5 priced like a PSA 8 might successfully cross to PSA 9.',
  },
];

export default function CrossGradePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Cross-Grade Converter — PSA vs BGS vs CGC vs SGC',
        description: 'Convert between PSA, BGS, CGC, and SGC grades. See equivalent grades, estimated values, and crossover advice.',
        url: 'https://cardvault-two.vercel.app/tools/cross-grade',
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
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          PSA &middot; BGS &middot; CGC &middot; SGC &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Cross-Grade Converter</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Convert grades between PSA, BGS, CGC, and SGC instantly. See equivalent grades, estimated value differences, and get crossover advice to maximize your card&apos;s value.
        </p>
      </div>

      <CrossGradeConverter />

      {/* FAQ */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-900/80 border border-gray-800 rounded-lg">
              <summary className="flex items-center justify-between cursor-pointer p-4 text-white font-medium">
                {faq.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform">&#x25BC;</span>
              </summary>
              <div className="px-4 pb-4 text-gray-400 text-sm">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>

      {/* Internal Links */}
      <div className="mt-12 pt-8 border-t border-gray-800">
        <h2 className="text-lg font-semibold text-white mb-4">More Card Grading Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link href="/tools/grading-roi" className="block p-4 bg-gray-900/80 border border-gray-800 rounded-lg hover:border-gray-600 transition-colors">
            <div className="text-white font-medium mb-1">Grading ROI Calculator</div>
            <div className="text-gray-400 text-sm">Is grading your card worth the cost?</div>
          </Link>
          <Link href="/tools/submission-planner" className="block p-4 bg-gray-900/80 border border-gray-800 rounded-lg hover:border-gray-600 transition-colors">
            <div className="text-white font-medium mb-1">Submission Planner</div>
            <div className="text-gray-400 text-sm">Compare all tiers across PSA, BGS, CGC, SGC</div>
          </Link>
          <Link href="/tools/condition-grader" className="block p-4 bg-gray-900/80 border border-gray-800 rounded-lg hover:border-gray-600 transition-colors">
            <div className="text-white font-medium mb-1">Condition Self-Grader</div>
            <div className="text-gray-400 text-sm">Estimate your card&apos;s grade before submitting</div>
          </Link>
          <Link href="/tools/pop-report" className="block p-4 bg-gray-900/80 border border-gray-800 rounded-lg hover:border-gray-600 transition-colors">
            <div className="text-white font-medium mb-1">Population Report</div>
            <div className="text-gray-400 text-sm">Check how many copies exist at each grade</div>
          </Link>
          <Link href="/tools/auth-check" className="block p-4 bg-gray-900/80 border border-gray-800 rounded-lg hover:border-gray-600 transition-colors">
            <div className="text-white font-medium mb-1">Authentication Checker</div>
            <div className="text-gray-400 text-sm">12-point inspection for fake card detection</div>
          </Link>
          <Link href="/guides/psa-vs-bgs-vs-cgc" className="block p-4 bg-gray-900/80 border border-gray-800 rounded-lg hover:border-gray-600 transition-colors">
            <div className="text-white font-medium mb-1">PSA vs BGS vs CGC Guide</div>
            <div className="text-gray-400 text-sm">Complete comparison of grading companies</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
