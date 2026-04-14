import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CenteringCalculator from './CenteringCalculator';

export const metadata: Metadata = {
  title: 'Card Centering Calculator — Will Your Card Get a 10?',
  description: 'Free card centering calculator for PSA, BGS, and CGC grading. Measure left-right and top-bottom borders to estimate your centering grade before submitting.',
  openGraph: {
    title: 'Card Centering Calculator — CardVault',
    description: 'Measure your card centering and see if it passes PSA, BGS, or CGC standards. Free centering tool for card grading.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Centering Calculator — CardVault',
    description: 'Will your card get a 10? Check centering before you submit for grading.',
  },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Centering Calculator' },
];

const faqItems = [
  {
    question: 'What centering ratio does PSA require for a 10?',
    answer: 'PSA requires 60/40 or better centering (both left-right AND top-bottom) for a PSA 10 Gem Mint grade. For a PSA 9 Mint, the threshold is 65/35. Cards with 70/30 or worse centering are typically limited to PSA 8 or below.',
  },
  {
    question: 'How does BGS grade centering differently from PSA?',
    answer: 'BGS (Beckett Grading Services) uses a sub-grade system. Centering is one of four sub-grades (centering, corners, edges, surface). A BGS centering sub-grade of 10 requires 50/50 to 55/45. A sub-grade of 9.5 allows up to 60/40. The centering sub-grade directly impacts the overall BGS grade.',
  },
  {
    question: 'How do I measure my card centering?',
    answer: 'Measure the border on each side of the card (left, right, top, bottom) using a ruler or centering tool. The centering ratio is calculated as the smaller border divided by the larger border on each axis. For example, if the left border is 2mm and right is 3mm, the left-right centering is approximately 60/40.',
  },
  {
    question: 'Does centering matter more for modern or vintage cards?',
    answer: 'Centering matters significantly for modern cards where PSA 10 or BGS 10 commands a huge premium. Vintage cards (pre-1980) are graded more leniently on centering since manufacturing standards were lower. A vintage card with 65/35 centering can still receive high grades.',
  },
  {
    question: 'What is the most common centering issue?',
    answer: 'Top-bottom miscentering is more common than left-right due to how card sheets are cut during manufacturing. Many cards that look centered left-right are actually off-center top-bottom. Always check both axes before submitting for grading.',
  },
];

export default function CenteringCalcPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Centering Calculator',
        description: 'Free card centering calculator for PSA, BGS, and CGC grading standards. Measure borders and estimate your centering grade.',
        url: 'https://cardvault-two.vercel.app/tools/centering-calc',
        applicationCategory: 'UtilitiesApplication',
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

      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-sky-950/60 border border-sky-800/50 text-sky-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-pulse" />
          PSA / BGS / CGC Standards - Visual Preview - Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Card Centering Calculator
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl">
          Measure your card&#39;s borders and instantly see if it meets PSA 10, BGS 10, or CGC 10
          centering standards. Know before you submit.
        </p>
      </div>

      <CenteringCalculator />

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

      {/* Related Tools */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Related Tools</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Grading ROI Calculator', href: '/tools/grading-roi', desc: 'Is grading your card worth the cost?' },
            { title: 'Head-to-Head Compare', href: '/tools/head-to-head', desc: 'Compare two cards side-by-side' },
            { title: 'Collection Value', href: '/tools/collection-value', desc: 'Calculate your collection total value' },
            { title: 'Price History', href: '/tools/price-history', desc: '90-day price trends for any card' },
          ].map(tool => (
            <Link key={tool.href} href={tool.href} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 hover:border-sky-700/50 transition-colors">
              <h3 className="text-white font-medium text-sm mb-1">{tool.title}</h3>
              <p className="text-zinc-500 text-xs">{tool.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="text-center text-zinc-600 text-xs mt-8">
        <p>Centering estimates are based on published grading company standards. Actual grades may vary.</p>
        <p className="mt-1">
          <Link href="/tools" className="text-sky-500 hover:text-sky-400">All Tools</Link>
          {' '}&middot;{' '}
          <Link href="/guides/psa-grading-scale" className="text-sky-500 hover:text-sky-400">PSA Grading Guide</Link>
          {' '}&middot;{' '}
          <Link href="/guides/psa-vs-bgs-vs-cgc" className="text-sky-500 hover:text-sky-400">PSA vs BGS vs CGC</Link>
        </p>
      </div>
    </div>
  );
}
