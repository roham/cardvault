import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import Tax1099kTrackerClient from './Tax1099kTrackerClient';

export const metadata: Metadata = {
  title: '1099-K Threshold Tracker — YTD Card Sales Monitor Across Platforms | CardVault',
  description: 'Track your card-selling year across eBay, Whatnot, Fanatics Collect, Mercari, PayPal, StockX, and more. See per-platform YTD gross, the federal 1099-K threshold ($2,500 for 2025, $600 for 2026+), state-specific lower thresholds, and warnings before you trigger reportable forms. Net proceeds and tax gain estimator included.',
  openGraph: {
    title: '1099-K Threshold Tracker — CardVault',
    description: 'YTD card-sales tracker across every marketplace. Know when eBay, Whatnot, or Fanatics Collect will issue a 1099-K to the IRS — before it happens.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '1099-K Threshold Tracker — CardVault',
    description: 'Which of your selling platforms will issue a 1099-K this year? Track YTD gross, state thresholds, taxable gain.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: '1099-K Threshold Tracker' },
];

const faqItems = [
  {
    question: 'What is a 1099-K and when will I get one?',
    answer: 'A 1099-K is a tax form that third-party payment networks (eBay, Whatnot, PayPal, Fanatics Collect, Mercari, StockX, and others) must send to you AND to the IRS when your gross payments exceed a threshold. For 2025 tax year the federal threshold is $2,500. For 2026 and later the threshold drops to $600 (the "American Rescue Plan" threshold phased in after multiple one-year delays). Each platform calculates its own threshold separately — if you sold $1,000 on eBay and $1,200 on Whatnot in 2026, BOTH platforms will issue a 1099-K because each individually exceeded $600.',
  },
  {
    question: 'Why does my state matter? Aren\'t thresholds federal?',
    answer: 'Some states adopted lower thresholds years before the IRS did. Massachusetts, Vermont, Virginia, Maryland, and DC use $600 as their state threshold (unchanged since before 2022). Illinois uses $1,000 AND 4+ transactions. New Jersey uses $1,000. Arkansas uses $2,500. If you live in one of these states, platforms issue 1099-Ks based on the LOWER of federal-vs-state threshold. A Massachusetts seller triggered a 1099-K at $600 even in 2024 when the federal threshold was $5,000. The tracker applies your state threshold automatically.',
  },
  {
    question: 'Does a 1099-K mean I owe tax on that full amount?',
    answer: 'No. A 1099-K reports GROSS payments received — what buyers paid, before fees, shipping costs, or your cost basis. You owe tax only on your NET PROFIT (sale price minus cost basis minus fees minus shipping minus other deductible expenses). Example: you sold a card for $2,000 on eBay. eBay took $300 in fees, shipping cost you $20, and you bought the card for $1,500. Your 1099-K shows $2,000 gross, but your taxable gain is only $180. The tracker estimates taxable gain if you enter cost basis.',
  },
  {
    question: 'What counts toward the 1099-K threshold?',
    answer: 'The threshold is calculated on GROSS payments — not net after fees. A $2,000 sale on eBay counts as $2,000 toward your threshold even though eBay kept $300. Sales tax collected by the platform generally does NOT count (platforms exclude it). Refunds generally DO reduce the gross if processed through the same platform. Cancelled orders that never charged do not count. Chargebacks on sales that DID charge typically still count until the chargeback is resolved. When in doubt, assume gross payments = threshold math.',
  },
  {
    question: 'How can I avoid getting a 1099-K?',
    answer: 'You shouldn\'t try to avoid one — reporting income is required whether or not a 1099-K is issued. The IRS has always required you to report all capital gains regardless of form issuance. BUT you can spread sales across multiple platforms so no single one crosses its threshold, reducing paperwork. The more honest approach is to keep organized cost-basis records so when a 1099-K arrives, you can offset the gross payments with your basis + fees + shipping to compute actual taxable gain. The tracker warns you which platforms are approaching threshold so you can plan — whether that\'s slowing sales, moving to another platform, or preparing for the form.',
  },
  {
    question: 'What about Zelle, Venmo Friends & Family, or cash sales?',
    answer: 'Zelle specifically exempted itself from 1099-K reporting — no 1099-K is issued regardless of volume. Venmo F&F transfers are NOT reportable (but Venmo for Business IS — threshold applies). Cash App Personal is not reportable; Cash App for Business is. Facebook Marketplace local cash-and-carry is not reportable. Peer-to-peer cash at card shows is not reportable by a platform, but you still owe tax on any gain. IMPORTANT: buyers paying via F&F for goods are committing payment platform violation, and you bear the risk if they reverse the payment later. The tracker does not track these payment methods because no 1099-K is ever issued — but the income is still taxable.',
  },
  {
    question: 'Does this replace tax advice from a CPA?',
    answer: 'No. This tool is educational — it tracks YTD payment volume and warns you about 1099-K thresholds. It does NOT prepare your taxes, compute actual federal-plus-state tax owed, handle cost-basis adjustments for inventory turnover, or address business-vs-hobby classification. If card selling is your trade or business (Schedule C), if you sell more than $20K in a year, if you have inherited-card basis questions, or if you sold a grail for a major gain, consult a CPA familiar with collectibles taxation. Collectibles capital gains are taxed differently from stocks (28% cap long-term vs 15-20%). The Card Tax Calculator on this site handles single-sale capital-gains math.',
  },
];

export default function Tax1099kTrackerPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault 1099-K Threshold Tracker',
        description: 'Multi-platform YTD card-sales tracker with federal and state 1099-K threshold warnings. Tracks eBay, Whatnot, Fanatics Collect, Mercari, PayPal, StockX, and other marketplaces. Estimates taxable gain if cost basis is entered.',
        url: 'https://cardvault-two.vercel.app/tools/tax1099k-tracker',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: faqItems.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
      }} />

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-blue-950/60 border border-blue-800/50 text-blue-300 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
          12 platforms &middot; federal + state thresholds &middot; 2024/2025/2026+ tax years
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">1099-K Threshold Tracker</h1>
        <p className="text-gray-400 text-lg max-w-3xl">
          When your card-selling year will produce a 1099-K depends on three things: the platform, the tax year, and your state. This tracker monitors YTD gross payments per marketplace, applies the correct federal and state thresholds, and warns you before a form hits your inbox &mdash; or your accountant&rsquo;s.
        </p>
      </div>

      <Tax1099kTrackerClient />

      <div className="mt-6 rounded-xl bg-amber-950/30 border border-amber-900/40 p-4 text-sm text-amber-200">
        This tracker is educational. It tracks payment volume against published 1099-K thresholds; it does not prepare tax returns, compute tax owed, or replace CPA advice. Federal and state thresholds can change by legislation or IRS guidance; always confirm current thresholds with the IRS and your state department of revenue before filing.
      </div>

      <div className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-800/40 border border-gray-700/40 rounded-lg">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium hover:text-blue-300 transition-colors">{faq.question}<span className="text-gray-500 group-open:rotate-180 transition-transform">&#9660;</span></summary>
              <div className="px-4 pb-4 text-sm text-gray-400 leading-relaxed">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>

      <div className="mt-8 border-t border-gray-800 pt-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Related Tools</h3>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/tools/tax-calc" className="text-blue-300 hover:text-blue-200">Card Tax Calculator (single sale)</Link>
          <Link href="/tools/fee-comparator" className="text-blue-300 hover:text-blue-200">Fee Comparator</Link>
          <Link href="/tools/ebay-fee-calc" className="text-blue-300 hover:text-blue-200">eBay Fee Calc</Link>
          <Link href="/tools/flip-tracker" className="text-blue-300 hover:text-blue-200">Flip Tracker P&amp;L</Link>
          <Link href="/tools/donation-value" className="text-blue-300 hover:text-blue-200">Donation Value (tax write-off)</Link>
          <Link href="/tools/true-cost" className="text-blue-300 hover:text-blue-200">True Cost</Link>
          <Link href="/tools/export-calculator" className="text-blue-300 hover:text-blue-200">Export Calculator</Link>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <Link href="/tools" className="text-blue-300 hover:text-blue-200">&larr; All Tools</Link>
        <Link href="/vault" className="text-blue-300 hover:text-blue-200">Vault</Link>
        <Link href="/" className="text-blue-300 hover:text-blue-200">Home</Link>
      </div>
    </div>
  );
}
