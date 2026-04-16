import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import YieldComparatorClient from './YieldComparatorClient';

export const metadata: Metadata = {
  title: 'Card Yield Comparator — Which Card Gives the Best Return? | CardVault',
  description: 'Compare up to 6 cards side-by-side on annualized yield. Projected appreciation minus storage, insurance, and S&P opportunity cost, normalized per dollar invested. Find which card earns its rent in your collection.',
  openGraph: {
    title: 'Card Yield Comparator — CardVault',
    description: 'Pick 2-6 cards. See which one gives the best annualized yield after carry costs and opportunity cost. Ranked head-to-head.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Yield Comparator | CardVault',
    description: 'Rank cards by annualized yield after carry + opportunity cost. Find the best return per dollar invested.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Yield Comparator' },
];

const faqItems = [
  {
    question: 'What does "yield" mean for a card?',
    answer: 'Yield is the annualized growth rate on your net position after subtracting carry costs (storage + insurance) and opportunity cost (what the S&P would have earned on the same dollars). A card projected to grow 7% per year that costs 2%/year to carry yields about 5% net — before accounting for the S&P alternative. Yield is the fairest apples-to-apples comparison across cards with different price points, because it normalizes per dollar invested.',
  },
  {
    question: 'Why compare multiple cards instead of just using the Hold Optimizer on each?',
    answer: 'Hold Optimizer answers "when should I sell this one card?" Yield Comparator answers "which of these cards should I BUY in the first place?" Collectors often face budget-constrained choices: three cards catch my eye, I can only buy one. Ranking them by normalized annualized yield turns a gut decision into a numeric one — and the results frequently surprise. A cheap rookie often out-yields a pricey grail on a per-dollar basis.',
  },
  {
    question: 'How is the appreciation rate calculated?',
    answer: 'Same engine as Hold Optimizer: sport baseline (football 8%, basketball 7.5%, baseball 5.5%, hockey 4.5%) plus rookie bonus (+2%), era modifier (vintage pre-1990 +3%, semi-vintage +1.5%), and value-tier adjustment (sub-$25 headroom +1.5%, grails $5K+ drag -0.5%). These are directional long-run estimates, not forecasts.',
  },
  {
    question: 'What is "net yield" vs "gross yield"?',
    answer: 'Gross yield = raw appreciation rate (what the card market returns). Net yield = after storage, insurance, and — if enabled — opportunity cost. A card with 8% gross yield but $55/yr vault cost + 1.2% insurance has substantially lower net yield on a $500 buy-in than on a $5,000 buy-in. Storage is a fixed cost; it hits small-dollar cards proportionally harder. This is why the comparator matters: it surfaces cost drag that is invisible on the sticker price.',
  },
  {
    question: 'Can I compare cards across different sports?',
    answer: 'Yes — that is the point. The comparator applies sport-specific appreciation rates (football higher, hockey lower) automatically, so a Mahomes rookie vs. a Connor McDavid rookie gets compared on their true expected yields, not on a flat rate. Cross-sport comparison is where the tool earns its keep: most collectors anchor to one sport by habit, and the ranked output shows where cross-sport diversification might improve overall return.',
  },
  {
    question: 'Why show multiple horizons?',
    answer: 'Short horizons (1-3 years) emphasize carry-cost drag — small-dollar cards look worse on a 1-year view because storage fees are a larger % of the investment. Long horizons (5-10 years) let appreciation compound past the cost base — often flipping the ranking. The best card at 1 year is frequently NOT the best card at 10 years. Viewing all horizons at once helps match the card to your actual hold intent.',
  },
];

export default function YieldComparatorPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Yield Comparator',
        description: 'Rank sports cards by annualized yield after carry costs and opportunity cost.',
        url: 'https://cardvault-two.vercel.app/tools/yield-comparator',
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
          Yield Comparator &middot; Multi-card return ranking &middot; Per-dollar normalized
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">Card Yield Comparator</h1>
        <p className="text-gray-400 text-lg">
          Add up to 6 cards. We project each forward, subtract carrying costs and S&amp;P opportunity cost,
          and rank them by annualized yield — the fairest per-dollar return metric. Best card wins a gold badge.
        </p>
      </div>

      <YieldComparatorClient />

      {/* FAQ */}
      <div className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-800/40 border border-gray-700/40 rounded-lg">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium hover:text-amber-400 transition-colors">
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
          <Link href="/tools/hold-optimizer" className="text-amber-500 hover:text-amber-400">Hold Optimizer</Link>
          <Link href="/tools/monte-carlo" className="text-amber-500 hover:text-amber-400">Monte Carlo Simulator</Link>
          <Link href="/tools/true-cost" className="text-amber-500 hover:text-amber-400">True-Cost Calculator</Link>
          <Link href="/tools/comp-calculator" className="text-amber-500 hover:text-amber-400">Comp Calculator</Link>
          <Link href="/tools/flip-scorer" className="text-amber-500 hover:text-amber-400">Quick-Flip Scorer</Link>
          <Link href="/tools/stress-test" className="text-amber-500 hover:text-amber-400">Portfolio Stress Test</Link>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <Link href="/tools" className="text-amber-500 hover:text-amber-400">&larr; All Tools</Link>
        <Link href="/games" className="text-amber-500 hover:text-amber-400">Games</Link>
        <Link href="/" className="text-amber-500 hover:text-amber-400">Home</Link>
      </div>
    </div>
  );
}
