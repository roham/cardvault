import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import { gradingCompanies } from '@/data/grading-companies';

export const metadata: Metadata = {
  title: 'Card Grading Companies Compared — PSA vs BGS vs CGC vs SGC (2026)',
  description: 'Complete guide to the 4 major card grading companies: PSA, BGS (Beckett), CGC, and SGC. Compare pricing, turnaround times, grading scales, and which company is best for your cards. Updated for 2026.',
  openGraph: {
    title: 'Card Grading Companies — PSA vs BGS vs CGC vs SGC | CardVault',
    description: 'Compare all 4 major grading companies. Pricing, turnaround, grading scales, and when to use each.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Grading Companies Compared — CardVault',
    description: 'PSA vs BGS vs CGC vs SGC — pricing, turnaround, scales, and best use cases.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Grading Companies' },
];

const faqItems = [
  {
    question: 'Which card grading company is best?',
    answer: 'There is no single "best" grading company — it depends on your goals. PSA commands the highest resale premiums and is best for cards you plan to sell. BGS offers detailed subgrades and the coveted Black Label 10. CGC has the fastest turnaround and lowest prices, great for Pokemon/TCG. SGC is the vintage card specialist with the best-looking slab. Use our comparison table to find the right company for your specific cards.',
  },
  {
    question: 'How much does card grading cost in 2026?',
    answer: 'Card grading in 2026 ranges from $15/card (CGC Economy) to $1,000+/card (PSA Premium next-day). The most popular economy tiers: CGC $15/card (50 days), SGC $18/card (20 days), PSA $25/card (65 days), BGS $25/card (80+ days). Express and priority services at all companies range from $60-$300/card with 2-15 day turnaround.',
  },
  {
    question: 'PSA 10 vs BGS 9.5 — which is worth more?',
    answer: 'PSA 10 typically sells for 15-40% more than a BGS 9.5 Gem Mint, despite both representing top-grade cards. This is because PSA has higher brand recognition and liquidity. However, a BGS Black Label 10 (all four subgrades perfect 10) can sell for significantly MORE than a PSA 10 — sometimes 2-5x more for popular modern cards. The decision between PSA and BGS depends on whether your card has Black Label potential.',
  },
  {
    question: 'What is the fastest card grading company?',
    answer: 'SGC consistently offers the fastest turnaround times. Their Economy tier (20 business days at $18/card) is faster than the economy tiers of PSA (65 days), BGS (80+ days), and CGC (50 days). At premium tiers, all four companies offer 1-5 day service, but SGC\'s base speed means even their cheapest option gets cards back relatively quickly.',
  },
  {
    question: 'Is it worth grading cards under $50?',
    answer: 'Generally, grading cards worth less than $50 raw is not profitable unless the graded premium is very high. For a card worth $30 raw, even a $15 CGC Economy submission means the graded card needs to sell for $45+ just to break even. However, grading makes sense for personal collection (protection and display), if you believe the card is significantly undervalued, or for rookie cards of players who could break out and spike in value.',
  },
];

export default function GradingIndexPage() {
  const cheapest = gradingCompanies.reduce((min, c) => {
    const price = parseInt(c.tiers[0].price.replace(/[^0-9]/g, ''));
    const minPrice = parseInt(min.tiers[0].price.replace(/[^0-9]/g, ''));
    return price < minPrice ? c : min;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Card Grading Companies Compared — PSA vs BGS vs CGC vs SGC',
        description: 'Complete comparison of the 4 major card grading companies with pricing, turnaround times, and grading scales.',
        url: 'https://cardvault-two.vercel.app/grading',
        publisher: { '@type': 'Organization', name: 'CardVault' },
        dateModified: '2026-04-15',
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

      {/* Hero */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-violet-950/60 border border-violet-800/50 text-violet-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-violet-400 rounded-full" />
          4 Companies &middot; Price Comparison &middot; Grade Scales &middot; Updated 2026
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Card Grading Companies Compared
        </h1>
        <p className="text-gray-400 text-lg max-w-3xl">
          PSA, BGS, CGC, and SGC — the four major card grading companies explained. Compare pricing, turnaround times, grading scales, and find which company is right for your cards.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        {gradingCompanies.map(c => (
          <Link key={c.slug} href={`/grading/${c.slug}`} className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-600 transition-colors">
            <div className={`text-xl font-bold ${c.accent} mb-1`}>{c.name}</div>
            <div className="text-xs text-gray-500 mb-2">est. {c.founded}</div>
            <div className="text-sm text-gray-300">{c.totalCardsGraded} graded</div>
            <div className="text-xs text-gray-500">~{c.marketShare} market share</div>
          </Link>
        ))}
      </div>

      {/* Comparison Table */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Side-by-Side Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-400 py-3 px-3 font-medium">Feature</th>
                {gradingCompanies.map(c => (
                  <th key={c.slug} className={`text-center py-3 px-3 font-bold ${c.accent}`}>
                    <Link href={`/grading/${c.slug}`} className="hover:underline">{c.name}</Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-gray-800/50">
                <td className="py-3 px-3 text-gray-400 font-medium">Founded</td>
                {gradingCompanies.map(c => <td key={c.slug} className="text-center py-3 px-3">{c.founded}</td>)}
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-3 px-3 text-gray-400 font-medium">Cards Graded</td>
                {gradingCompanies.map(c => <td key={c.slug} className="text-center py-3 px-3">{c.totalCardsGraded}</td>)}
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-3 px-3 text-gray-400 font-medium">Cheapest Tier</td>
                {gradingCompanies.map(c => <td key={c.slug} className="text-center py-3 px-3">{c.tiers[0].price}</td>)}
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-3 px-3 text-gray-400 font-medium">Economy Turnaround</td>
                {gradingCompanies.map(c => <td key={c.slug} className="text-center py-3 px-3">{c.tiers[0].turnaround}</td>)}
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-3 px-3 text-gray-400 font-medium">Subgrades</td>
                {gradingCompanies.map(c => {
                  const has = c.slug === 'bgs' ? 'Included' : c.slug === 'cgc' ? '+$10 optional' : 'No';
                  return <td key={c.slug} className="text-center py-3 px-3">{has}</td>;
                })}
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-3 px-3 text-gray-400 font-medium">Resale Premium</td>
                {gradingCompanies.map(c => {
                  const prem = c.slug === 'psa' ? 'Highest' : c.slug === 'bgs' ? 'High' : c.slug === 'cgc' ? 'Growing' : 'Moderate';
                  return <td key={c.slug} className="text-center py-3 px-3">{prem}</td>;
                })}
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-3 px-3 text-gray-400 font-medium">Best For</td>
                {gradingCompanies.map(c => {
                  const best = c.slug === 'psa' ? 'Selling & Vintage' : c.slug === 'bgs' ? 'Modern & Detail' : c.slug === 'cgc' ? 'Pokemon & Budget' : 'Vintage & Speed';
                  return <td key={c.slug} className="text-center py-3 px-3 text-xs">{best}</td>;
                })}
              </tr>
              <tr>
                <td className="py-3 px-3 text-gray-400 font-medium">Slab Style</td>
                {gradingCompanies.map(c => <td key={c.slug} className="text-center py-3 px-3 text-xs">{c.slabColor}</td>)}
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Pricing Comparison */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Pricing Comparison</h2>
        <p className="text-gray-400 mb-6">All prices are per-card and may vary based on declared value, quantity, and current promotions.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {gradingCompanies.map(c => (
            <div key={c.slug} className={`bg-gray-900 border ${c.accentBorder} rounded-lg overflow-hidden`}>
              <div className={`${c.accentBg} px-4 py-3`}>
                <Link href={`/grading/${c.slug}`} className={`font-bold ${c.accent} text-lg hover:underline`}>{c.name}</Link>
                <div className="text-xs text-gray-400">{c.fullName}</div>
              </div>
              <div className="p-4 space-y-2">
                {c.tiers.map(tier => (
                  <div key={tier.name} className="flex justify-between text-sm">
                    <span className="text-gray-400">{tier.name}</span>
                    <span className="text-white font-medium">{tier.price}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* When to Use Each Company */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">When to Use Each Company</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {gradingCompanies.map(c => (
            <div key={c.slug} className="bg-gray-900 border border-gray-800 rounded-lg p-5">
              <Link href={`/grading/${c.slug}`} className={`text-xl font-bold ${c.accent} hover:underline mb-3 block`}>
                {c.name} — {c.fullName}
              </Link>
              <p className="text-gray-400 text-sm mb-4">{c.description}</p>
              <div className="space-y-1">
                {c.bestFor.slice(0, 4).map((use, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className={`mt-1 w-1.5 h-1.5 rounded-full ${c.accent.replace('text-', 'bg-')} flex-shrink-0`} />
                    {use}
                  </div>
                ))}
              </div>
              <Link href={`/grading/${c.slug}`} className={`inline-block mt-4 text-sm ${c.accent} hover:underline`}>
                Full {c.name} guide &rarr;
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Related Tools */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Related Grading Tools</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { href: '/tools/grading-roi', title: 'Grading ROI Calculator', desc: 'Is your card worth grading? Check the raw vs graded price delta.' },
            { href: '/tools/submission-planner', title: 'Submission Planner', desc: 'Compare all tiers across PSA, BGS, CGC, and SGC.' },
            { href: '/tools/turnaround-estimator', title: 'Turnaround Estimator', desc: 'Current wait times for every service level.' },
            { href: '/tools/condition-grader', title: 'Condition Self-Grader', desc: 'Estimate your card\'s grade before submitting.' },
            { href: '/tools/bgs-subgrade', title: 'BGS Subgrade Calculator', desc: 'Calculate BGS overall grade from subgrades.' },
            { href: '/tools/cross-grade', title: 'Cross-Grade Converter', desc: 'PSA ↔ BGS ↔ CGC ↔ SGC grade equivalents.' },
            { href: '/tools/photo-grade-estimator', title: 'Photo Grade Estimator', desc: 'Quick visual grade assessment from card photos.' },
            { href: '/tools/bulk-grading-roi', title: 'Bulk Grading ROI', desc: 'Calculate ROI for grading multiple cards at once.' },
            { href: '/tools/cert-check', title: 'Cert Verifier', desc: 'Analyze certification numbers for authenticity clues.' },
          ].map(tool => (
            <Link key={tool.href} href={tool.href} className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-emerald-800 transition-colors">
              <div className="text-white font-medium text-sm mb-1">{tool.title}</div>
              <div className="text-gray-500 text-xs">{tool.desc}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-gray-800 pt-10">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((faq, i) => (
            <details key={i} className="group">
              <summary className="cursor-pointer text-white font-medium hover:text-violet-400 transition-colors">
                {faq.question}
              </summary>
              <p className="mt-2 text-gray-400 text-sm leading-relaxed pl-4">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Internal Links */}
      <section className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-lg font-semibold text-white mb-3">Explore More</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { href: '/guides/psa-vs-bgs-vs-cgc', label: 'PSA vs BGS vs CGC Guide' },
            { href: '/tools/grading-roi', label: 'Grading ROI Calculator' },
            { href: '/tools/roi-heatmap', label: 'ROI Heatmap' },
            { href: '/tools/grade-spread', label: 'Grade Price Spread' },
            { href: '/invest', label: 'Investment Guides' },
            { href: '/tools', label: 'All Tools' },
          ].map(link => (
            <Link key={link.href} href={link.href} className="text-sm text-gray-400 hover:text-emerald-400 bg-gray-900 border border-gray-800 rounded-full px-3 py-1 transition-colors">
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
