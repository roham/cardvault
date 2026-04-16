import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import FlipJournalClient from './FlipJournalClient';

export const metadata: Metadata = {
  title: 'Flip Journal — Card Flip P&L Tracker | CardVault',
  description: 'Track your card flips with a free P&L journal. Log buys, sales, and expenses across eBay, Mercari, Whatnot, and card shows. See profit, ROI, win rate, and monthly analytics. No account required.',
  openGraph: {
    title: 'Flip Journal — Card Flip Profit Tracker | CardVault',
    description: 'Free card flipping P&L tracker. Log buys and sells, track profit by sport and platform, see monthly analytics.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Flip Journal — CardVault',
    description: 'Track card flip profit and loss. Log buys, mark sells, see ROI and win rate across platforms.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Flip Journal' },
];

const faqItems = [
  {
    question: 'What is the Flip Journal?',
    answer: 'The Flip Journal is a free profit-and-loss tracking tool for card flippers. Log every card you buy and sell, and the journal automatically calculates your net profit, ROI, platform fees, and win rate. It works like a personal ledger for your card flipping business.',
  },
  {
    question: 'How are platform fees calculated?',
    answer: 'Each platform has a different seller fee structure. eBay charges approximately 13.12% (final value fee + payment processing). Mercari takes 10%. COMC charges 20%. MySlabs charges 8%. Whatnot takes 8.9%. Facebook Marketplace charges 5%. Card show sales and direct trades have 0% fees. The journal applies these automatically when you select a sell platform.',
  },
  {
    question: 'Is my data saved?',
    answer: 'Yes — all flip data is saved locally in your browser using localStorage. Your data stays on your device and is never sent to any server. This means it is private, but also means if you clear your browser data, your journal entries will be lost. Use the Copy P&L button to export your data regularly.',
  },
  {
    question: 'What is a good win rate for card flipping?',
    answer: 'Experienced card flippers typically aim for a 60-70% win rate. Breaking even on some flips is normal — the key is making your wins bigger than your losses. Focus on cards you know well, buy at the right time (off-season dips), and sell during demand spikes (playoffs, draft night). A 50%+ ROI per successful flip is considered strong.',
  },
  {
    question: 'How do I track grading costs?',
    answer: 'When logging a flip, use the Grading Cost field to add PSA, BGS, CGC, or SGC submission fees. This cost is factored into your total investment and profit calculation. For example, if you buy a card for $20, pay $30 for PSA grading, and sell the PSA 10 for $120 on eBay, your profit is $120 minus $20 minus $30 minus $15.74 (eBay fees) minus shipping = approximately $50.',
  },
];

export default function FlipJournalPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Flip Journal',
        description: 'Free P&L tracking tool for card flippers. Log buys, sales, platform fees, and grading costs. See profit, ROI, win rate, and monthly analytics.',
        url: 'https://cardvault-two.vercel.app/flip-journal',
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
          Free &middot; No Account &middot; Saved Locally &middot; Platform Fee Calculator
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Flip Journal</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Track every card flip with P&L analytics. Log buys, mark sells, and see your profit by sport,
          platform, and month. Built for flippers who want to know if they&apos;re actually making money.
        </p>
      </div>

      <FlipJournalClient />

      {/* FAQ */}
      <section className="mt-16 border-t border-gray-800 pt-10">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-900/60 border border-gray-800 rounded-lg">
              <summary className="flex items-center justify-between cursor-pointer px-5 py-4 text-white font-medium">
                {faq.question}
                <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </summary>
              <div className="px-5 pb-4 text-gray-400 text-sm leading-relaxed">{faq.answer}</div>
            </details>
          ))}
        </div>
      </section>

      {/* Related Tools */}
      <section className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-lg font-bold text-white mb-4">Related Tools</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/tools/flip-calc', label: 'Flip Profit Calculator', desc: 'Calculate profit on a single flip' },
            { href: '/tools/grading-roi', label: 'Grading ROI Calculator', desc: 'Is grading worth it?' },
            { href: '/tools/listing-generator', label: 'eBay Listing Generator', desc: 'Create optimized listings' },
            { href: '/tools/shipping-calc', label: 'Shipping Calculator', desc: 'Compare shipping costs' },
            { href: '/tools/tax-calc', label: 'Card Tax Calculator', desc: 'Estimate tax on profits' },
            { href: '/tools/market-dashboard', label: 'Market Dashboard', desc: 'Track card market trends' },
          ].map(tool => (
            <Link key={tool.href} href={tool.href}
              className="bg-gray-900/60 border border-gray-800 rounded-lg p-3 hover:border-emerald-800/50 transition-colors group">
              <div className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors">{tool.label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{tool.desc}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
