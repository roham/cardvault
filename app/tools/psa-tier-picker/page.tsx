import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import PsaTierPickerClient from './PsaTierPickerClient';

export const metadata: Metadata = {
  title: 'PSA Tier Picker — Optimal PSA Submission Tier Calculator | CardVault',
  description: 'Choose the right PSA submission tier for each card. Enter raw value, expected grade odds, graded values, and capital cost — the picker ranks all 10 PSA tiers by expected net profit after fees, turnaround opportunity cost, and declared-value fit. Unlike multi-company planners, this optimizes within PSA specifically.',
  openGraph: {
    title: 'PSA Tier Picker — CardVault',
    description: 'Per-card PSA tier optimization: which submission service (Bulk / Value / Regular / Express / Super Express / Walkthrough / Premier) gives the best net profit?',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'PSA Tier Picker — CardVault',
    description: 'Which PSA tier maximizes your net profit? Enter the math, get the answer.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'PSA Tier Picker' },
];

const faqItems = [
  {
    question: 'How does the PSA Tier Picker differ from the Submission Planner?',
    answer: 'The Submission Planner compares grading companies (PSA vs BGS vs CGC vs SGC) and helps you pick between them for a batch of cards. The Tier Picker assumes you\'ve already chosen PSA (the most-common decision for modern sports and Pokemon premium submissions) and optimizes within PSA — which of the 10 available PSA service tiers gives the best net profit for THIS specific card? Declared value constraints, tier fees, turnaround times, and opportunity cost all matter, and they vary in non-obvious ways across tiers.',
  },
  {
    question: 'Why does the Tier Picker care about turnaround time?',
    answer: 'Because your capital is tied up while the card is in PSA\'s queue. A $5,000 card waiting 60 days in the Value tier costs you 60 days of opportunity — if you could have deployed that capital elsewhere at a 20% annualized return, that\'s roughly $164 of foregone earnings. A 5-day Super Express tier on the same card costs $150 up front but only ~$14 in opportunity cost, netting you ~$150 lower total cost. For high-value cards during a rising market, faster tiers often beat cheaper tiers on pure net-profit math. The picker calculates this for each tier.',
  },
  {
    question: 'Which grade probabilities should I use?',
    answer: 'Start with your own eyeball assessment. A pristine modern pack-fresh card probably has a 30-50% PSA 10 rate, a 40-50% PSA 9 rate, and 10-20% PSA 8 or below. A vintage raw card might have a 5-15% PSA 9 rate and 40-60% PSA 7-8 rate. If you can find PSA\'s public population report for your specific card, use its ratio of 10s-to-9s-to-8s (pop 10 / pop 9 / pop 8) as a prior — it reflects the card\'s historical gem rate across thousands of submissions. The Picker warns you if your probabilities don\'t sum to ~100%.',
  },
  {
    question: 'What is the "declared value" constraint?',
    answer: 'PSA requires you to declare the fair market value of each card before grading. If the card exceeds a tier\'s maximum declared value, that tier isn\'t available — you must submit at a higher tier. For example, a $2,000 raw Mahomes rookie cannot use the Value tier ($499 max) or the Regular tier ($1,499 max); you must use Express ($2,499 max) or higher. The Picker automatically excludes tiers whose max declared value is below your raw value and highlights available options.',
  },
  {
    question: 'Do tier fees change over time?',
    answer: 'Yes. PSA adjusts its tier pricing roughly every 12-18 months and turnaround times fluctuate with queue depth (major set releases and show seasons slow turnarounds). The Picker uses current 2026 fees and PSA\'s published target turnaround windows. For real-time queue depth, check PSA\'s public dashboard and adjust the "actual turnaround" slider if you expect delays. Values shown are estimates — always confirm current pricing on psacard.com before submitting.',
  },
  {
    question: 'What about cross-grading or paid upgrades?',
    answer: 'The Tier Picker assumes a first-time raw-to-PSA submission. For PSA cross-grades (from BGS/SGC to PSA) or mechanical re-holders, PSA uses a different fee schedule (PSA Crossover) that isn\'t modeled here. For value-tier upgrades mid-queue (e.g., bumping from Value to Express to skip the line), PSA typically charges the delta between tiers plus a service fee — use the Regular vs Express tier results in the Picker as a rough proxy but confirm with PSA before paying the upgrade.',
  },
  {
    question: 'What if my capital cost is different?',
    answer: 'Capital cost reflects what you\'d earn deploying that money elsewhere. Typical hobby reference points: 5% (savings account / treasuries), 12-15% (S&P 500 historical average), 20-30% (experienced card flipping annualized ROI), 40-60% (aggressive flipping or a seller\'s "I need this money now" opportunity cost). The default 15% approximates a broad-market benchmark. If you\'re a career flipper, raise it to 25-30% — tier decisions shift materially toward faster-turnaround tiers as capital cost rises.',
  },
];

export default function PsaTierPickerPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault PSA Tier Picker',
        description: 'Per-card PSA submission tier optimizer. Enter card value, expected grade probabilities, graded values, and capital cost; the tool ranks all 10 PSA service tiers by expected net profit after fees, turnaround opportunity cost, and declared-value constraints.',
        url: 'https://cardvault-two.vercel.app/tools/psa-tier-picker',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: faqItems.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
      }} />

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-sky-950/60 border border-sky-800/50 text-sky-300 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-pulse" />
          10 PSA tiers &middot; fee + turnaround + opportunity-cost optimized
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">PSA Tier Picker</h1>
        <p className="text-gray-400 text-lg max-w-3xl">
          Choosing the right PSA submission tier can swing your net profit by $50-$500 per card. This picker runs the full math across all 10 PSA tiers &mdash; Bulk, Value, Value Plus, Regular, Express, Super Express, Walkthrough, Walkthrough Plus, Premier, and SuperPremier &mdash; accounting for fees, turnaround, declared-value caps, and the opportunity cost of your capital sitting in the queue.
        </p>
      </div>

      <PsaTierPickerClient />

      <div className="mt-6 rounded-xl bg-amber-950/30 border border-amber-900/40 p-4 text-sm text-amber-200">
        PSA fees and turnaround windows change periodically. This picker uses current 2026 pricing as of the last update; always confirm on psacard.com before submitting. The tool produces an estimate of expected net profit; actual outcomes depend on the grade you receive and market conditions at the time of sale.
      </div>

      <div className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-800/40 border border-gray-700/40 rounded-lg">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium hover:text-sky-300 transition-colors">{faq.question}<span className="text-gray-500 group-open:rotate-180 transition-transform">&#9660;</span></summary>
              <div className="px-4 pb-4 text-sm text-gray-400 leading-relaxed">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>

      <div className="mt-8 border-t border-gray-800 pt-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Related Tools</h3>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/tools/submission-planner" className="text-sky-300 hover:text-sky-200">Submission Planner (cross-company)</Link>
          <Link href="/tools/bulk-grading-roi" className="text-sky-300 hover:text-sky-200">Bulk Grading ROI</Link>
          <Link href="/tools/regrade-calc" className="text-sky-300 hover:text-sky-200">Regrade Calc</Link>
          <Link href="/tools/cross-grade" className="text-sky-300 hover:text-sky-200">Cross-Grade</Link>
          <Link href="/tools/flip-window" className="text-sky-300 hover:text-sky-200">Flip Window</Link>
          <Link href="/tools/true-cost" className="text-sky-300 hover:text-sky-200">True Cost</Link>
          <Link href="/tools/turnaround-estimator" className="text-sky-300 hover:text-sky-200">Turnaround Estimator</Link>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <Link href="/tools" className="text-sky-300 hover:text-sky-200">&larr; All Tools</Link>
        <Link href="/vault" className="text-sky-300 hover:text-sky-200">Vault</Link>
        <Link href="/" className="text-sky-300 hover:text-sky-200">Home</Link>
      </div>
    </div>
  );
}
