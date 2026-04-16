import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import GradeProbabilityClient from './GradeProbabilityClient';

export const metadata: Metadata = {
  title: 'Card Grade Probability Calculator — What Grade Will My Card Get? | CardVault',
  description: 'Free card grading probability calculator. Rate corners, edges, surface, and centering to see your probability of getting a PSA 10, BGS 9.5, or CGC 10. See grade distributions for all three companies before you submit.',
  alternates: { canonical: './' },
  openGraph: {
    title: 'Card Grade Probability Calculator | CardVault',
    description: 'What grade will my card get? See PSA, BGS, and CGC probability distributions before submitting.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Grade Probability Calculator | CardVault',
    description: 'What grade will your card get? Free probability calculator for PSA, BGS & CGC.',
  },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Grade Probability Calculator' },
];

const faqItems = [
  {
    question: 'How accurate is this grade probability calculator?',
    answer: 'This calculator uses the same four criteria professional graders evaluate (corners, edges, surface, centering) and models the known grading tendencies of PSA, BGS, and CGC. Most users find their actual grades fall within 0.5-1 points of the expected grade. It is a screening tool — not a guarantee. Factors like print quality, card stock thickness, and specific grader tendencies introduce real-world variance.',
  },
  {
    question: 'Why does PSA not show 9.5 or 8.5 grades?',
    answer: 'PSA uses whole-number grades only (1-10). There is no PSA 9.5 — a card either gets a 10 (Gem Mint) or a 9 (Mint). BGS uses half-grades (9.5, 8.5) and gives subgrades for each criterion. This is why some collectors prefer BGS for borderline cards — a BGS 9.5 Gem Mint is easier to achieve than a PSA 10 and still commands strong premiums.',
  },
  {
    question: 'What is the cap rule in grading?',
    answer: 'Your weakest criterion limits your maximum grade. If your corners are a 5/5 but centering is 2/5, you cannot receive a PSA 10 — the centering caps your maximum. PSA generally caps at the weakest + 1 grade point. This means one weak area can drag down an otherwise perfect card. Always assess your weakest criterion first.',
  },
  {
    question: 'Should I submit to PSA, BGS, or CGC?',
    answer: 'PSA 10 commands the highest resale premium for most cards (especially sports). BGS 9.5 Gem Mint is easier to achieve and sells within 70-85% of a PSA 10 for most cards. BGS 10 Black Label actually sells HIGHER than PSA 10 but is extremely rare. CGC is newer to sports cards, has the fastest turnaround, and is generally the most affordable. Choose based on your priorities: maximum premium (PSA), subgrade detail (BGS), or speed and value (CGC).',
  },
  {
    question: 'Does vintage vs modern matter for grading?',
    answer: 'Yes, significantly. Graders are more lenient with vintage cards (pre-1980) because pristine condition is extremely rare for cards that are 40+ years old. A PSA 8 vintage card has far more market value relative to raw than a PSA 8 modern card. Additionally, vintage cards benefit from authentication — grading proves the card is genuine, which is valuable even at lower grades.',
  },
];

export default function GradeProbabilityPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Grade Probability Calculator',
        description: 'Calculate the probability of getting PSA 10, BGS 9.5, or CGC 10 for your card. Rate corners, edges, surface, and centering to see grade distributions across all three companies.',
        url: 'https://cardvault-two.vercel.app/tools/grade-probability',
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
          PSA &bull; BGS &bull; CGC &bull; 4 Criteria &bull; Probability Distributions &bull; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">
          Grade Probability Calculator
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl">
          What grade will your card get? Rate corners, edges, surface, and centering — then see your probability of getting each grade from PSA, BGS, and CGC before you pay to submit.
        </p>
      </div>

      <GradeProbabilityClient />

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

      {/* Related Links */}
      <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { href: '/tools/condition-grader', label: 'Condition Self-Grader', desc: 'Step-by-step grade assessment' },
          { href: '/tools/submission-planner', label: 'Submission Planner', desc: 'Compare grading company costs' },
          { href: '/tools/grading-roi', label: 'Grading ROI Calculator', desc: 'Is grading worth it financially?' },
          { href: '/tools/bgs-subgrade', label: 'BGS Subgrade Calculator', desc: 'Calculate BGS overall from subs' },
          { href: '/tools/photo-grade', label: 'Photo Grade Estimator', desc: 'Quick visual grade assessment' },
          { href: '/tools/centering-calc', label: 'Centering Calculator', desc: 'Measure border centering ratio' },
        ].map(link => (
          <Link key={link.href} href={link.href} className="bg-slate-800/40 border border-slate-700 rounded-lg p-3 hover:bg-slate-800 hover:border-slate-600 transition-colors">
            <p className="text-sm font-medium text-indigo-400">{link.label}</p>
            <p className="text-xs text-slate-500 mt-0.5">{link.desc}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link href="/tools" className="text-indigo-400 hover:text-indigo-300 text-sm">
          &larr; Back to All Tools
        </Link>
      </div>
    </div>
  );
}
