import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import PopReport from './PopReport';

export const metadata: Metadata = {
  title: 'PSA Population Report Checker — Card Grading Population Data',
  description: 'Free PSA population report lookup for sports cards. See estimated grade distribution, gem rate, scarcity analysis, and grading recommendations for any card in our database.',
  openGraph: {
    title: 'PSA Population Report Checker — CardVault',
    description: 'Look up estimated PSA population data for any sports card. Grade distribution, gem rate, and scarcity analysis.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'PSA Population Report Checker — CardVault',
    description: 'How many PSA 10s exist? Check estimated population data before you grade.',
  },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Population Report' },
];

const faqItems = [
  {
    question: 'What is a PSA population report?',
    answer: 'A PSA population report (or "pop report") shows how many copies of a specific card have been graded by PSA across all grade levels (1-10). It tells you total graded, how many PSA 10s exist, how many PSA 9s, and so on. This data is critical for understanding scarcity — a card with only 50 PSA 10s is far more valuable than the same card with 5,000 PSA 10s.',
  },
  {
    question: 'Why does population data matter for card values?',
    answer: 'Population directly impacts value through scarcity. When a PSA 10 population is low relative to total graded (gem rate under 5%), the PSA 10 premium is massive — often 5-10x or more over PSA 9. When gem rates are high (over 25%), the PSA 10 premium shrinks because supply is abundant. Pop data helps you decide whether grading is worth the investment.',
  },
  {
    question: 'How do I use population data to decide whether to grade?',
    answer: 'Check the gem rate (PSA 10 as % of total). If the gem rate is under 10%, PSA 10 copies are scarce and the premium is high — grade your card if you believe it\'s mint. If the gem rate is over 25%, PSA 10 is common and the premium is smaller — only grade if the card has high base value. Also compare PSA 9 to PSA 10 counts: a bigger gap means a bigger price jump for landing a 10.',
  },
  {
    question: 'Do population numbers always go up?',
    answer: 'Yes — PSA population only increases over time as more cards are submitted. A card graded PSA 10 stays PSA 10 forever in the population count, even if the holder is cracked for re-submission. However, re-submissions (cracking a PSA 9 to try for a 10) can shift the distribution. Some vintage cards have been submitted 3-4 times, inflating total population.',
  },
  {
    question: 'What is a good gem rate for card investment?',
    answer: 'For investment purposes, look for cards with gem rates under 10%. These have genuine scarcity at the top grade. Cards with gem rates of 2-5% are particularly attractive because the PSA 10 premium is high and growing. Cards with gem rates over 30% have limited upside from grading alone — the value is in the card itself, not the slab.',
  },
];

export default function PopReportPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'PSA Population Report Checker',
        description: 'Free PSA population report lookup. See estimated grade distribution, gem rate, scarcity analysis, and grading recommendations.',
        url: 'https://cardvault-two.vercel.app/tools/pop-report',
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
        <div className="inline-flex items-center gap-2 bg-amber-950/60 border border-amber-800/50 text-amber-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
          Grade Distribution - Gem Rate - Scarcity Analysis - Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Population Report Checker
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl">
          Look up estimated PSA population data for any card. See grade distribution, gem rate,
          scarcity analysis, and whether grading is worth it.
        </p>
      </div>

      <PopReport />

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
            { title: 'Condition Self-Grader', href: '/tools/condition-grader', desc: 'Assess your card for estimated PSA/BGS/CGC grade' },
            { title: 'Grading ROI Calculator', href: '/tools/grading-roi', desc: 'Is grading your card worth the cost?' },
            { title: 'Centering Calculator', href: '/tools/centering-calc', desc: 'Check centering against grading standards' },
            { title: 'Grading Tracker', href: '/tools/grading-tracker', desc: 'Track your grading submissions and results' },
          ].map(tool => (
            <Link key={tool.href} href={tool.href} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 hover:border-amber-700/50 transition-colors">
              <h3 className="text-white font-medium text-sm mb-1">{tool.title}</h3>
              <p className="text-zinc-500 text-xs">{tool.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="text-center text-zinc-600 text-xs mt-8">
        <p>Population estimates are based on card characteristics and market patterns. For official data, visit psacard.com/pop.</p>
        <p className="mt-1">
          <Link href="/tools" className="text-amber-500 hover:text-amber-400">All Tools</Link>
          {' '}&middot;{' '}
          <Link href="/guides/psa-grading-scale" className="text-amber-500 hover:text-amber-400">PSA Grading Guide</Link>
          {' '}&middot;{' '}
          <Link href="/guides/psa-vs-bgs-vs-cgc" className="text-amber-500 hover:text-amber-400">PSA vs BGS vs CGC</Link>
        </p>
      </div>
    </div>
  );
}
