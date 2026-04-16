import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import PurchaseLogClient from './PurchaseLogClient';

export const metadata: Metadata = {
  title: 'Card Purchase Log — Track Every Card You Buy | CardVault',
  description: 'Free card purchase tracker. Log every card you buy with date, price, platform, and condition. See spending analytics by sport, platform, month, and condition. Export to CSV for taxes.',
  alternates: { canonical: './' },
  openGraph: {
    title: 'Card Purchase Log | CardVault',
    description: 'Track every card purchase. See spending analytics and export for taxes.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Purchase Log | CardVault',
    description: 'Track card purchases. Analytics by sport, platform, and month. Free.',
  },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Purchase Log' },
];

const faqItems = [
  {
    question: 'How is this different from the Flip Journal?',
    answer: 'The Flip Journal tracks buy-and-sell transactions to calculate profit. The Purchase Log tracks ALL card purchases — including cards you keep in your collection. It is a spending tracker, not a profit tracker. Use both: Purchase Log for everything you buy, Flip Journal for cards you resell.',
  },
  {
    question: 'Where is my data stored?',
    answer: 'All purchase data is saved in your browser\'s local storage. It never leaves your device and is not uploaded to any server. Clear your browser data and it is gone. Use the CSV Export feature to create a permanent backup of your purchase history.',
  },
  {
    question: 'Can I use this for tax purposes?',
    answer: 'The CSV export includes date, card name, price, and platform — the key fields needed for cost basis documentation. If you sell cards at a profit, the IRS considers this taxable income. Your Purchase Log provides the acquisition cost records you need to calculate capital gains. Consult a tax professional for specific advice.',
  },
  {
    question: 'How should I track card show purchases?',
    answer: 'Select "Card Show" as the platform and enter the exact price paid. Use the Notes field to record the show name and location (e.g., "National 2025 Chicago"). This helps you compare card show pricing to online platforms over time.',
  },
  {
    question: 'What insights will I get from the analytics?',
    answer: 'The analytics tab shows: total spending, average price per card, spending by sport (are you over-indexed on one sport?), spending by platform (where do you buy most?), monthly spending trends (is your spending increasing?), and spending by condition (raw vs graded). Most collectors are surprised by what they learn.',
  },
];

export default function PurchaseLogPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Purchase Log',
        description: 'Track every card purchase with date, price, platform, and condition. See spending analytics and export to CSV.',
        url: 'https://cardvault-two.vercel.app/tools/purchase-log',
        applicationCategory: 'UtilityApplication',
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

      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          11 Platforms &bull; 10 Conditions &bull; Spending Analytics &bull; CSV Export &bull; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">
          Purchase Log
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl">
          Track every card you buy. Log date, price, platform, and condition — then see where your money goes with spending analytics by sport, platform, month, and condition.
        </p>
      </div>

      <PurchaseLogClient />

      {/* FAQ Section */}
      <div className="mt-12 border-t border-slate-800 pt-10">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((item, i) => (
            <div key={i}>
              <h3 className="text-sm font-bold text-white mb-2">{item.question}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related Links */}
      <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { href: '/tools/flip-calc', label: 'Flip Profit Calculator', desc: 'Calculate profit on flips' },
          { href: '/flip-journal', label: 'Flip Journal', desc: 'Track buy-sell P&L' },
          { href: '/tools/budget-planner', label: 'Budget Planner', desc: 'Plan monthly hobby spending' },
          { href: '/tools/tax-calc', label: 'Card Tax Calculator', desc: 'Estimate taxes on card sales' },
          { href: '/tools/collection-value', label: 'Collection Value', desc: 'Estimate total collection worth' },
          { href: '/tools/hobby-cost', label: 'Hobby Cost Calculator', desc: 'Annual hobby cost breakdown' },
        ].map(link => (
          <Link key={link.href} href={link.href} className="bg-slate-800/40 border border-slate-700 rounded-lg p-3 hover:bg-slate-800 hover:border-slate-600 transition-colors">
            <p className="text-sm font-medium text-indigo-400">{link.label}</p>
            <p className="text-xs text-slate-500 mt-0.5">{link.desc}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link href="/tools" className="text-indigo-400 hover:text-indigo-300 text-sm">
          &larr; Back to All Tools
        </Link>
      </div>
    </div>
  );
}
