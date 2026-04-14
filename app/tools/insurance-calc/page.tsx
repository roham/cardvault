import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import InsuranceCalculator from './InsuranceCalculator';

export const metadata: Metadata = {
  title: 'Collection Insurance Calculator — How Much Coverage Do You Need?',
  description: 'Free card collection insurance calculator. Estimate replacement cost, recommended coverage amount, and annual premium for your sports card and Pokemon collection.',
  openGraph: {
    title: 'Collection Insurance Calculator — CardVault',
    description: 'Protect your card collection. Calculate replacement cost and insurance coverage needs.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Collection Insurance Calculator — CardVault',
    description: 'How much insurance does your collection need? Free calculator.',
  },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Insurance Calculator' },
];

const faqItems = [
  {
    question: 'Does homeowners insurance cover my card collection?',
    answer: 'Most homeowners policies cover personal property, but typically with a $2,500-$5,000 sublimit for collectibles. If your collection is worth more, you need a scheduled personal property rider or a separate collectibles insurance policy. Always check your policy and get specific coverage for high-value cards.',
  },
  {
    question: 'How much does card collection insurance cost?',
    answer: 'Collectibles insurance typically costs $10-$20 per $1,000 of coverage per year (1-2% of value annually). Some specialty insurers like Collectibles Insurance Services offer rates as low as $0.88 per $100 of value. Graded cards in a safe may qualify for lower rates.',
  },
  {
    question: 'What should I insure my cards for — market value or replacement cost?',
    answer: 'Insure for replacement cost, which is what it would cost to buy the same card at current market prices. This is usually 10-20% more than fair market value because you need to account for buying from retailers/auction houses with fees and premiums. Always get agreed-value coverage, not actual cash value.',
  },
  {
    question: 'Do I need to get my cards appraised for insurance?',
    answer: 'For collections under $50,000, most insurers accept a detailed inventory with photos and recent comparable sales. For collections over $50,000, a professional appraisal from a qualified appraiser strengthens your claim. Graded cards with certification numbers are easiest to document and insure.',
  },
  {
    question: 'What risks does collection insurance cover?',
    answer: 'Comprehensive collectibles insurance typically covers: theft, fire, water damage, accidental damage, natural disasters, and loss during shipping. Some policies also cover mysterious disappearance (you noticed a card is missing but cannot pinpoint when). Coverage varies by insurer — always read your policy.',
  },
];

export default function InsuranceCalcPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Collection Insurance Calculator',
        description: 'Free calculator to estimate insurance coverage needs for sports card and Pokemon collections.',
        url: 'https://cardvault-two.vercel.app/tools/insurance-calc',
        applicationCategory: 'FinanceApplication',
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
        <div className="inline-flex items-center gap-2 bg-violet-950/60 border border-violet-800/50 text-violet-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
          Coverage Estimator - Replacement Cost - Premium Estimate - Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Collection Insurance Calculator
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl">
          Estimate how much insurance coverage your card collection needs. Enter your cards and
          get replacement cost, recommended coverage, and estimated annual premium.
        </p>
      </div>

      <InsuranceCalculator />

      {/* FAQ */}
      <section className="mt-16 mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item) => (
            <details key={item.question} className="group bg-zinc-900/60 border border-zinc-800 rounded-xl">
              <summary className="p-5 cursor-pointer text-white font-medium flex items-center justify-between">
                {item.question}
                <span className="text-zinc-500 group-open:rotate-180 transition-transform">&#9660;</span>
              </summary>
              <p className="px-5 pb-5 text-zinc-400 text-sm leading-relaxed">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Related Tools</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Collection Value', href: '/tools/collection-value', desc: 'Calculate your total collection value' },
            { title: 'Grading ROI', href: '/tools/grading-roi', desc: 'Is grading worth the investment?' },
            { title: 'Price Watchlist', href: '/tools/watchlist', desc: 'Track card prices over time' },
            { title: 'Card Storage Guide', href: '/guides/card-storage-guide', desc: 'Protect your cards from damage' },
          ].map(tool => (
            <Link key={tool.href} href={tool.href} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 hover:border-violet-700/50 transition-colors">
              <h3 className="text-white font-medium text-sm mb-1">{tool.title}</h3>
              <p className="text-zinc-500 text-xs">{tool.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="text-center text-zinc-600 text-xs mt-8">
        <p>This calculator provides estimates only. Consult an insurance professional for actual coverage recommendations.</p>
        <p className="mt-1">
          <Link href="/tools" className="text-violet-500 hover:text-violet-400">All Tools</Link>
          {' '}&middot;{' '}
          <Link href="/guides/card-storage-guide" className="text-violet-500 hover:text-violet-400">Storage Guide</Link>
        </p>
      </div>
    </div>
  );
}
