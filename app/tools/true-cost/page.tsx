import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import TrueCostClient from './TrueCostClient';

export const metadata: Metadata = {
  title: 'Collection True-Cost Calculator — Annual Ownership Cost | CardVault',
  description: 'Calculate the true annual cost of owning a sports card collection — storage, insurance, resubmissions, inspection time, opportunity cost, and show travel. See breakeven appreciation needed to match the S&P 500.',
  openGraph: {
    title: 'Collection True-Cost Calculator — CardVault',
    description: 'The real annual cost of owning cards. Storage + insurance + time + opportunity cost vs S&P 500.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Collection True-Cost Calculator | CardVault',
    description: 'What your collection actually costs you every year. Free.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'True-Cost Calculator' },
];

const faqItems = [
  {
    question: 'What is the True-Cost of a card collection?',
    answer: 'Most collectors think of their collection\'s cost as the purchase price of each card. The true cost also includes annual overhead — storage supplies or vault fees, insurance premiums, PSA/CGC resubmission budgets for upgrade attempts, the time you spend inspecting and organizing, travel and entry fees for card shows, and the opportunity cost of capital locked up in cardboard instead of invested in index funds. This calculator sums all six categories to give you a realistic annual holding cost.',
  },
  {
    question: 'Why include opportunity cost?',
    answer: 'Every dollar you have in cards is a dollar not earning ~8-10% in a diversified stock index. If your $25,000 collection is flat YoY, you "lost" roughly $2,200 in foregone S&P 500 returns. The True-Cost Calculator defaults to 7% (a conservative long-run S&P 500 real return) and shows how much appreciation your cards need just to match that baseline. This is the number most collectors never calculate — and it explains why a flat collection can still be a losing position.',
  },
  {
    question: 'How do the storage tiers work?',
    answer: 'Plastic box ($0/yr): free but no protection against climate or theft. Shoebox + dehumidifier (~$40/yr): replacement desiccants + power. Top-loaders + binders (~$120/yr): consumable supplies for ~500 card collection. Climate case (~$300/yr): dedicated storage cabinet + humidity control. Safe deposit box (~$250/yr): bank vault rental. Professional vault service (~$600-1,500/yr): PWCC / Goldin / ALT vault fees typically 1-2% of collection value annually. Pick what matches your actual setup — most collectors underpay on storage relative to collection value.',
  },
  {
    question: 'What counts as a fair resubmission budget?',
    answer: 'Active collectors resubmit 5-15% of their slabs each year hunting for upgrades (PSA 9 to 10 can 3-5x a card\'s value). At ~$25-$75 per PSA submission plus shipping and insurance, that overhead adds up fast for a 200-slab collection. The calculator takes your slab count, your target resubmission rate, and your average service tier, then gives an annual resubmission budget. Set to 0% if you never crack and regrade — that zeros out the category.',
  },
  {
    question: 'How should I value my inspection time?',
    answer: 'Use your effective hourly earnings — after-tax salary / hours worked, or your freelance rate if self-employed. If you spend 4 hours a month organizing, photographing, listing, and checking your collection, that\'s 48 hours a year. At $50/hour, that\'s $2,400 of your time annually. This is a "soft" cost — it\'s not cash out of pocket — but if you wouldn\'t do that work for free for a friend, it\'s real. Set to $0/hr to ignore, or crank it up to see the true cost of the hobby hours.',
  },
];

export default function TrueCostPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Collection True-Cost Calculator',
        description: 'Calculate the true annual cost of owning a sports card collection — storage, insurance, grading, time, and opportunity cost.',
        url: 'https://cardvault-two.vercel.app/tools/true-cost',
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
          Finance Tool · 6 Cost Categories · vs S&P 500
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Collection True-Cost Calculator</h1>
        <p className="text-gray-400 text-lg">
          Your collection costs more than the cards. Add storage, insurance, resubmissions, time, travel, and opportunity cost.
          See the real annual holding bill — and the appreciation you need just to break even vs the S&P 500.
        </p>
      </div>

      <TrueCostClient />

      {/* FAQ */}
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

      {/* Related */}
      <section className="mt-8 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Related Financial Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href="/tools/investment-return" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-emerald-700/50 rounded-xl transition-colors">
            <span className="text-xl">📈</span>
            <div><div className="text-white text-sm font-medium">Investment Return Calc</div><div className="text-gray-500 text-xs">Cards vs S&P, gold, bonds, inflation</div></div>
          </Link>
          <Link href="/tools/hobby-cost" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-emerald-700/50 rounded-xl transition-colors">
            <span className="text-xl">💰</span>
            <div><div className="text-white text-sm font-medium">Hobby Cost Calculator</div><div className="text-gray-500 text-xs">Monthly hobby spend breakdown</div></div>
          </Link>
          <Link href="/tools/insurance-calc" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-emerald-700/50 rounded-xl transition-colors">
            <span className="text-xl">🛡️</span>
            <div><div className="text-white text-sm font-medium">Insurance Calculator</div><div className="text-gray-500 text-xs">Coverage estimates for your cards</div></div>
          </Link>
          <Link href="/tools/storage-calc" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-emerald-700/50 rounded-xl transition-colors">
            <span className="text-xl">📦</span>
            <div><div className="text-white text-sm font-medium">Storage Calculator</div><div className="text-gray-500 text-xs">Sizing supplies for your collection</div></div>
          </Link>
          <Link href="/tools/tax-calc" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-emerald-700/50 rounded-xl transition-colors">
            <span className="text-xl">🧾</span>
            <div><div className="text-white text-sm font-medium">Tax Calculator</div><div className="text-gray-500 text-xs">Capital gains on card sales</div></div>
          </Link>
          <Link href="/tools/diversification" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-emerald-700/50 rounded-xl transition-colors">
            <span className="text-xl">🎯</span>
            <div><div className="text-white text-sm font-medium">Diversification Analyzer</div><div className="text-gray-500 text-xs">Concentration risk score</div></div>
          </Link>
        </div>
      </section>
    </div>
  );
}
