import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import InsuranceClient from './InsuranceClient';

export const metadata: Metadata = {
  title: 'Collection Insurance Estimator — Know What Your Cards Are Worth to Insure | CardVault',
  description: 'Estimate the replacement value of your sports card collection for insurance purposes. Calculate coverage tiers, compare insurance providers, and get documentation tips. Works with your vault or manual entry.',
  openGraph: {
    title: 'Collection Insurance Estimator — CardVault',
    description: 'Calculate your card collection\'s insured replacement value. Compare hobby-specific insurance providers and coverage tiers.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Collection Insurance Estimator — CardVault',
    description: 'Estimate your card collection\'s insurance value. Free, no account needed.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Vault', href: '/vault' },
  { label: 'Insurance Estimator' },
];

const faqItems = [
  {
    question: 'Why should I insure my card collection?',
    answer: 'Card collections can represent significant financial value — even a modest collection of graded cards can be worth thousands. Homeowner or renter insurance often has low limits for collectibles (typically $1,000-$2,500). A dedicated collectibles policy or rider ensures you can replace your collection if it is lost, stolen, or damaged.',
  },
  {
    question: 'How is the replacement value calculated?',
    answer: 'The replacement value is based on estimated fair market value of each card in raw or gem mint condition. The Standard tier uses FMV directly. The Recommended tier adds a 15% buffer for market fluctuation and replacement difficulty. The Premium tier adds 30% to account for shipping, grading, and time to rebuild.',
  },
  {
    question: 'What is the difference between actual cash value and replacement value?',
    answer: 'Actual cash value (ACV) deducts depreciation — which makes no sense for collectibles that appreciate. Replacement value (RV) covers what it costs to buy an equivalent card today. Always insist on replacement value coverage for sports cards.',
  },
  {
    question: 'Do I need a separate policy for cards I take to shows?',
    answer: 'Most homeowner/renter riders only cover cards at your residence. If you take cards to shows, ship them for grading, or sell at events, you need an inland marine or hobby-specific policy that covers transit and off-premises locations. CollectInsure and similar providers offer this.',
  },
  {
    question: 'How often should I update my insured value?',
    answer: 'At least annually, or whenever you make a significant acquisition or sale. Card values can change dramatically — a breakout season can double a player\'s card values overnight. Use this estimator regularly to keep your coverage up to date.',
  },
];

export default function InsurancePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Collection Insurance Estimator',
        description: 'Estimate the replacement value of your sports card collection for insurance purposes. Compare coverage tiers and insurance providers.',
        url: 'https://cardvault-two.vercel.app/vault/insurance',
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

      <Breadcrumb items={breadcrumbs} />

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Collection Insurance Estimator</h1>
          <span className="text-xs bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 px-2 py-0.5 rounded-full">Free</span>
        </div>
        <p className="text-gray-400 text-lg">
          Know what your collection is worth to insure. Calculate replacement value, compare insurance providers, and protect your investment.
        </p>
      </div>

      <InsuranceClient />

      {/* FAQ section */}
      <section className="mt-16 border-t border-gray-800 pt-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map(f => (
            <details key={f.question} className="group bg-gray-900 border border-gray-800 rounded-xl">
              <summary className="px-5 py-4 text-white font-medium cursor-pointer hover:text-emerald-400 transition-colors">
                {f.question}
              </summary>
              <div className="px-5 pb-4 text-gray-400 text-sm">
                {f.answer}
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
