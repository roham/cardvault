import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import GradingROICalculator from './GradingROICalculator';

export const metadata: Metadata = {
  title: 'Grading ROI Calculator — Is It Worth Grading Your Card?',
  description: 'Free grading ROI calculator for sports cards and Pokémon. Compare PSA, CGC, and SGC costs. See your expected profit, break-even grade, and whether grading is worth it.',
  openGraph: {
    title: 'Grading ROI Calculator — CardVault',
    description: 'Is it worth grading your card? Input your card value, pick a grading company, and see the expected ROI instantly.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Grading ROI Calculator — CardVault',
    description: 'Compare PSA vs CGC vs SGC grading costs and expected returns.',
  },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Grading ROI Calculator' },
];

const faqItems = [
  {
    question: 'Is it worth grading a $20 card?',
    answer: 'Usually not. Grading costs $20–$50+ per card (plus shipping). For a $20 raw card, you\'d need at least a 3–4x grade multiplier just to break even. Most sub-$50 raw cards only make financial sense to grade if you\'re very confident of a PSA 10 or BGS 9.5+.',
  },
  {
    question: 'Which grading company has the best ROI?',
    answer: 'PSA generally commands the highest resale premium (10–30% more than CGC or SGC at the same grade), but it also costs the most and has the longest turnaround. CGC offers the best value for mid-tier cards ($50–$500 raw). SGC is popular for vintage cards and has fast turnaround.',
  },
  {
    question: 'What grade multiplier should I expect?',
    answer: 'For modern cards: PSA 10 typically adds 2–5x raw value, PSA 9 adds 1.2–2x. For vintage cards: even mid-grades (PSA 5–7) can add 1.5–3x. The exact multiplier depends on population, demand, and card rarity.',
  },
  {
    question: 'How much does PSA grading cost in 2026?',
    answer: 'PSA Economy ($20/card, 65+ business days), PSA Regular ($50/card, 30 business days), PSA Express ($100/card, 10 business days), PSA Super Express ($200/card, 5 business days), PSA Walk-Through ($300/card, 1 business day). Plus ~$15 shipping each way.',
  },
  {
    question: 'Should I use PSA, CGC, or SGC?',
    answer: 'PSA for maximum resale value on modern sports and Pokémon cards. CGC for Pokémon cards (they\'re gaining market share fast) and cards you want subgrades on. SGC for vintage cards and fast turnaround. All three are trusted — PSA just has the biggest liquidity premium.',
  },
];

export default function GradingROIPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Grading ROI Calculator',
        description: 'Free grading ROI calculator for sports cards and Pokémon. Compare PSA, CGC, and SGC grading costs and expected returns.',
        url: 'https://cardvault-two.vercel.app/tools/grading-roi',
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

      <Breadcrumb items={breadcrumbs} />

      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Compare PSA, CGC, and SGC · Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Grading ROI Calculator
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Is it worth grading your card? Input your card&apos;s raw value, pick a grading company and expected grade, and see the expected profit or loss instantly.
        </p>
      </div>

      {/* Calculator */}
      <GradingROICalculator />

      {/* How it works */}
      <section className="mt-16 mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">How the Grading ROI Calculator Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { step: '1', title: 'Enter Raw Value', desc: 'What your card is worth ungraded, based on recent eBay sold comps or TCGPlayer market price.' },
            { step: '2', title: 'Pick Company & Grade', desc: 'Choose PSA, CGC, or SGC. Select the grade you expect to receive. Be honest — most cards aren\'t 10s.' },
            { step: '3', title: 'See Your ROI', desc: 'We calculate: grading cost + shipping vs. estimated graded value. Green = profit. Red = loss.' },
          ].map(s => (
            <div key={s.step} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="w-8 h-8 bg-emerald-950/60 border border-emerald-800/50 rounded-lg flex items-center justify-center text-emerald-400 font-bold text-sm mb-3">{s.step}</div>
              <h3 className="text-white font-semibold text-sm mb-1">{s.title}</h3>
              <p className="text-gray-400 text-xs leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Grading cost comparison table */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">2026 Grading Costs Compared</h2>
        <p className="text-gray-400 text-sm mb-6">All prices per card. Shipping costs are estimates based on standard USPS/UPS rates.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-400 font-medium py-3 px-4">Service</th>
                <th className="text-left text-gray-400 font-medium py-3 px-4">PSA</th>
                <th className="text-left text-gray-400 font-medium py-3 px-4">CGC</th>
                <th className="text-left text-gray-400 font-medium py-3 px-4">SGC</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {[
                { service: 'Economy / Value', psa: '$20 (65+ days)', cgc: '$15 (50+ days)', sgc: '$20 (45+ days)' },
                { service: 'Regular / Standard', psa: '$50 (30 days)', cgc: '$30 (30 days)', sgc: '$30 (20 days)' },
                { service: 'Express', psa: '$100 (10 days)', cgc: '$65 (10 days)', sgc: '$50 (5 days)' },
                { service: 'Super Express / Premium', psa: '$200 (5 days)', cgc: '$150 (5 days)', sgc: '$100 (2 days)' },
                { service: 'Walk-Through', psa: '$300 (1 day)', cgc: '$250 (2 days)', sgc: '—' },
                { service: 'Shipping (est.)', psa: '$15–$20', cgc: '$15–$20', sgc: '$12–$18' },
              ].map(row => (
                <tr key={row.service} className="border-b border-gray-800/50">
                  <td className="py-3 px-4 text-white font-medium">{row.service}</td>
                  <td className="py-3 px-4">{row.psa}</td>
                  <td className="py-3 px-4">{row.cgc}</td>
                  <td className="py-3 px-4">{row.sgc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-gray-600 text-xs mt-3">Costs as of April 2026. Prices vary by card value tier — cards declared over $500 have additional fees. Sources: PSA, CGC, SGC official pricing pages.</p>
      </section>

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map(item => (
            <div key={item.question} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-white font-semibold text-sm mb-2">{item.question}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Internal links */}
      <div className="border-t border-gray-800 pt-10">
        <h3 className="text-white font-semibold mb-4">Related Tools & Guides</h3>
        <div className="flex flex-wrap gap-3">
          <Link href="/tools" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
            Price Check
          </Link>
          <Link href="/tools/compare" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
            Compare Cards
          </Link>
          <Link href="/guides/psa-vs-bgs-vs-cgc" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
            PSA vs BGS vs CGC Guide
          </Link>
          <Link href="/guides/grading-guide" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
            Grading Guide
          </Link>
          <Link href="/sports" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
            Sports Cards
          </Link>
          <Link href="/pokemon" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
            Pokemon Cards
          </Link>
        </div>
      </div>
    </div>
  );
}
