import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import HoldOptimizerClient from './HoldOptimizerClient';

export const metadata: Metadata = {
  title: 'Card Holding Period Optimizer — When To Sell Your Card | CardVault',
  description: 'When is the best year to sell a sports card? Project any card forward 1-20 years, subtract storage, insurance, and S&P opportunity cost, and find the year that maximizes net position. Free hold-period calculator powered by 9,800+ cards.',
  openGraph: {
    title: 'Card Holding Period Optimizer — CardVault',
    description: 'Pick any card. See the year that maximizes net position after carrying costs. FLIP NOW, SHORT HOLD, LONG HOLD, or GRAIL.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Holding Period Optimizer | CardVault',
    description: 'How long should you hold that card? 20-year projection + carrying costs + break-even year.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Hold Optimizer' },
];

const faqItems = [
  {
    question: 'What does the Hold Optimizer actually calculate?',
    answer: 'For any card you pick, the tool projects value year-by-year from 1 to 20 years forward using an appreciation rate tuned to sport, rookie status, era, and price tier. It subtracts your annual carrying costs — storage fees, insurance premiums, and the S&P 500 opportunity cost on your cost basis — and reports the year where your net position (projected value minus total basis) peaks. That peak year is your mathematically optimal sell window.',
  },
  {
    question: 'Why include an opportunity cost?',
    answer: 'Every dollar locked in a card is a dollar not invested elsewhere. If the S&P 500 averages 7% annually and your card averages 5%, you are underperforming even with gains — the cost is silent. The optimizer surfaces this gap so you can compare a card honestly against an index-fund alternative, not just against a flat zero.',
  },
  {
    question: 'How does the appreciation rate get picked?',
    answer: 'Base rates come from long-run hobby trends: football around 8%, basketball 7.5%, baseball 5.5%, hockey 4.5%. A rookie card adds ~2%. Vintage cards (pre-1990) add ~3% for scarcity. Cards under $25 get a small-card headroom bump; grails over $5,000 get a slight ceiling drag (it is harder to double a $10K card than a $50 card). These are directional — actual outcomes swing widely.',
  },
  {
    question: 'What do FLIP NOW, SHORT HOLD, LONG HOLD, and GRAIL mean?',
    answer: 'FLIP NOW: net peaks today or year 1 — carrying costs will outrun appreciation. SHORT HOLD: peak is in years 2-4, plan an exit. LONG HOLD: peak is years 5-10, patience wins. GRAIL HOLD: net keeps climbing past year 10, this is a long-term keeper. COST SINK means projected appreciation never outruns carrying costs — consider selling now or removing insurance.',
  },
  {
    question: 'Can I use this for a card I have not bought yet?',
    answer: 'Yes. Set the "Purchase price" to the ask you are considering. If the optimizer returns FLIP NOW or COST SINK at that price, you are paying too much — the carrying cost math kills the trade. Negotiate, or pass. This is a powerful sanity check before pulling the trigger on a grail card.',
  },
  {
    question: 'Does the tool use real market data?',
    answer: 'Appreciation rates are directional estimates derived from public hobby reports and long-run price trends, not live comps. Carrying cost numbers (insurance 1.2%/yr, vault $55/yr) are benchmarked from Chubb, PWCC, and Goldin published rates. Treat the output as a framework for structured thinking, not a forecast. Cross-check with Comp Calculator and Card Value Projector before large moves.',
  },
];

export default function HoldOptimizerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Hold Optimizer',
        description: 'Find the optimal year to sell a sports card by projecting value vs. carrying costs.',
        url: 'https://cardvault-two.vercel.app/tools/hold-optimizer',
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
          Hold Optimizer &middot; 20-year projections &middot; Carrying cost math
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">Card Holding Period Optimizer</h1>
        <p className="text-gray-400 text-lg">
          When is the best year to sell your card? Pick a card, set your cost basis, and we subtract
          storage, insurance, and S&amp;P opportunity cost from each year&apos;s projected value.
          The peak year is your sell window.
        </p>
      </div>

      <HoldOptimizerClient />

      {/* FAQ */}
      <div className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-800/40 border border-gray-700/40 rounded-lg">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium hover:text-emerald-400 transition-colors">
                {faq.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform">&#9660;</span>
              </summary>
              <div className="px-4 pb-4 text-sm text-gray-400">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>

      {/* Related Tools */}
      <div className="mt-8 border-t border-gray-800 pt-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Related Tools</h3>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/tools/true-cost" className="text-emerald-500 hover:text-emerald-400">True-Cost Calculator</Link>
          <Link href="/tools/value-projector" className="text-emerald-500 hover:text-emerald-400">Value Projector</Link>
          <Link href="/tools/stress-test" className="text-emerald-500 hover:text-emerald-400">Portfolio Stress Test</Link>
          <Link href="/tools/comp-calculator" className="text-emerald-500 hover:text-emerald-400">Comp Calculator</Link>
          <Link href="/tools/flip-scorer" className="text-emerald-500 hover:text-emerald-400">Quick-Flip Scorer</Link>
          <Link href="/tools/thesis-generator" className="text-emerald-500 hover:text-emerald-400">Investment Thesis</Link>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <Link href="/tools" className="text-emerald-500 hover:text-emerald-400">&larr; All Tools</Link>
        <Link href="/games" className="text-emerald-500 hover:text-emerald-400">Games</Link>
        <Link href="/" className="text-emerald-500 hover:text-emerald-400">Home</Link>
      </div>
    </div>
  );
}
