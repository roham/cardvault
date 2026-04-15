import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import GradeSpreadClient from './GradeSpreadClient';

export const metadata: Metadata = {
  title: 'Grade Price Spread — Card Value at Every PSA Grade | CardVault',
  description: 'See what any card is worth at every PSA grade from 1 to 10 plus raw. Visualize the price curve, find the sweet spot grade, and understand the premium between PSA 8, 9, and 10. Search 6,200+ cards or enter any value manually. Vintage and modern price curves.',
  openGraph: {
    title: 'Grade Price Spread — CardVault',
    description: 'What is a card worth at every PSA grade? See the full price curve from PSA 1 to PSA 10.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Grade Price Spread — CardVault',
    description: 'Card value at every PSA grade. Find the sweet spot between PSA 8, 9, and 10.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Grade Price Spread' },
];

const faqItems = [
  {
    question: 'How much more is a PSA 10 worth than a PSA 9?',
    answer: 'For modern cards (2000+), a PSA 10 is typically 2-3x the price of a PSA 9. For vintage cards (pre-1980), the gap can be 3-5x or more because far fewer vintage cards survive in gem mint condition. The exact multiplier depends on the card\'s population (how many exist at each grade), player demand, and scarcity. This tool shows you the estimated spread for any card.',
  },
  {
    question: 'What is the best PSA grade to buy for value?',
    answer: 'PSA 9 is generally the best value grade for most collectors. You get approximately 90% of the visual quality of a PSA 10 at 40-60% of the cost. PSA 8 is the budget sweet spot if you want a slabbed card without paying the premium grades. PSA 10 is only worth the extra cost for iconic cards you plan to hold long-term, or cards with very low PSA 10 populations.',
  },
  {
    question: 'Why do vintage and modern cards have different price curves?',
    answer: 'Vintage cards (pre-1980) have steeper grade-price curves because survival rates in high grades are much lower. A 1952 Topps card that has survived 70+ years in PSA 8 condition is genuinely rare. Modern cards (2000+) have flatter curves in lower grades because millions of copies exist and most were stored in sleeves from day one. The scarcity is concentrated at PSA 10 for modern cards, while it\'s spread across all high grades for vintage.',
  },
  {
    question: 'How accurate are these grade-price estimates?',
    answer: 'These estimates use market-validated multiplier curves that represent typical price relationships between grades. The actual premium at each grade varies by specific card, population, and current demand. For the most accurate data, cross-reference with recent eBay sold listings (use the card page links) and check PSA population reports. This tool gives you the general framework — sold comps give you the exact number.',
  },
  {
    question: 'Should I grade my raw card based on these numbers?',
    answer: 'Compare the PSA 10 value to your raw card\'s value plus grading cost. If a PSA 10 is worth $200 but your raw card is $30 and grading costs $50, you need to grade a 10 to profit — and only ~15-20% of submissions get a PSA 10. Use this tool alongside the Grading ROI Calculator and Grading Probability tool for a complete picture. The grade-price spread shows you the upside; the probability tools show you the odds.',
  },
];

export default function GradeSpreadPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Grade Price Spread',
        description: 'See what any sports card is worth at every PSA grade from 1 to 10. Visualize the price curve, find the sweet spot grade, and understand grade premiums.',
        url: 'https://cardvault-two.vercel.app/tools/grade-spread',
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
        <div className="inline-flex items-center gap-2 bg-indigo-950/60 border border-indigo-800/50 text-indigo-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          6,200+ Cards &middot; PSA 1–10 &middot; Sweet Spot Analysis
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Grade Price Spread</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          See what any card is worth at every PSA grade. Visualize the price curve from PSA 1 to Gem Mint 10,
          find the sweet-spot grade for your budget, and understand the premium between PSA 8, 9, and 10.
        </p>
      </div>

      <GradeSpreadClient />

      {/* FAQ */}
      <section className="mt-16 mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((f, i) => (
            <details key={i} className="group bg-gray-800/50 border border-gray-700 rounded-xl">
              <summary className="cursor-pointer px-6 py-4 text-white font-medium list-none flex items-center justify-between">
                {f.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform">&#9662;</span>
              </summary>
              <div className="px-6 pb-4 text-gray-400 text-sm leading-relaxed">{f.answer}</div>
            </details>
          ))}
        </div>
      </section>

      {/* Related Tools */}
      <div className="border-t border-gray-800 pt-8">
        <h2 className="text-lg font-semibold text-white mb-4">Related Tools</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/tools/grading-roi', label: 'Grading ROI Calculator', desc: 'Is grading worth it?' },
            { href: '/tools/pop-report', label: 'Population Report', desc: 'How many at each grade' },
            { href: '/tools/condition-grader', label: 'Condition Self-Grader', desc: 'Grade before you submit' },
            { href: '/tools/bgs-subgrade', label: 'BGS Subgrade Calc', desc: 'BGS 4-subgrade math' },
            { href: '/tools/cross-grade', label: 'Cross-Grade Converter', desc: 'PSA/BGS/CGC/SGC equivalents' },
            { href: '/tools/grade-value-chart', label: 'Grade Value Chart', desc: 'Quick grade reference' },
          ].map(l => (
            <Link key={l.href} href={l.href} className="p-3 bg-gray-800/40 hover:bg-gray-800/70 border border-gray-700 rounded-lg transition-colors group">
              <div className="text-white text-sm font-medium group-hover:text-indigo-400 transition-colors">{l.label}</div>
              <div className="text-gray-500 text-xs">{l.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
