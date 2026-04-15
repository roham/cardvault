import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import TaxReportClient from './TaxReportClient';

export const metadata: Metadata = {
  title: 'Card Tax Reporter — Capital Gains Calculator for Collectors | CardVault',
  description: 'Track card purchases and sales, calculate capital gains and losses, and generate tax summaries for your card collecting hobby. Short-term vs long-term holding periods, collectibles tax rate (28%), and export-ready reports.',
  openGraph: {
    title: 'Card Tax Reporter — CardVault',
    description: 'Calculate capital gains and losses from card flipping. Short-term vs long-term, 28% collectibles rate, export-ready reports.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Tax Reporter — CardVault',
    description: 'Capital gains calculator for card collectors and flippers.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Tax Reporter' },
];

const faqItems = [
  {
    question: 'Do I need to pay taxes on sports card sales?',
    answer: 'Yes. The IRS classifies sports cards and other collectibles as capital assets. When you sell a card for more than you paid, the profit is a capital gain subject to tax. Collectibles held over one year are taxed at a maximum rate of 28% (the collectibles rate), while cards held under one year are taxed as ordinary income at your marginal tax rate. Even if you sell on eBay, at card shows, or through Facebook groups, these sales are taxable events.',
  },
  {
    question: 'What is the difference between short-term and long-term capital gains for cards?',
    answer: 'Short-term capital gains apply to cards held for one year or less and are taxed at your ordinary income tax rate (10-37% depending on your bracket). Long-term capital gains apply to cards held for more than one year and are taxed at the collectibles rate of 28% maximum. This means high-income flippers may actually benefit from holding cards longer than one year, while lower-income collectors may see little difference.',
  },
  {
    question: 'Can I deduct card collecting losses on my taxes?',
    answer: 'Yes, capital losses from card sales can offset capital gains. If your total losses exceed your gains, you can deduct up to $3,000 per year against ordinary income, with excess losses carrying forward to future years. This means a bad year of flipping can reduce your tax bill. Keep detailed records of all purchases and sales, including shipping costs and fees, as these increase your cost basis.',
  },
  {
    question: 'What expenses can I include in my cost basis?',
    answer: 'Your cost basis includes the original purchase price plus: shipping costs to receive the card, eBay/platform fees on the purchase side, grading fees (PSA/BGS/CGC/SGC), insurance costs, and sales tax paid. On the selling side, platform fees, shipping costs, and packing materials reduce your net proceeds. The more expenses you track, the lower your taxable gain.',
  },
  {
    question: 'Is this a substitute for professional tax advice?',
    answer: 'No. This tool provides estimates and educational information about collectibles taxation. Tax law is complex and varies by state. Consult a tax professional for advice specific to your situation, especially if your card selling income exceeds $600/year (the 1099-K threshold for online platforms) or if you operate as a card dealer/business rather than a hobbyist.',
  },
];

export default function TaxReportPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Tax Reporter',
        description: 'Capital gains and losses calculator for card collectors. Track transactions, calculate taxes, export reports.',
        url: 'https://cardvault-two.vercel.app/tax-report',
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
        <div className="inline-flex items-center gap-2 bg-amber-950/60 border border-amber-800/50 text-amber-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          Tax Season Ready &middot; Capital Gains &middot; 28% Collectibles Rate
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Tax Reporter</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Track your card purchases and sales, calculate capital gains and losses, and generate tax-ready summaries. Know your 28% collectibles rate exposure before April 15.
        </p>
      </div>

      <TaxReportClient />

      {/* Related */}
      <section className="mt-16 mb-12">
        <h2 className="text-xl font-bold text-white mb-4">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { href: '/tools/flip-calc', label: 'Flip Calculator', icon: '💵' },
            { href: '/tools/flip-tracker', label: 'Flip Tracker P&L', icon: '📒' },
            { href: '/tools/investment-return', label: 'Investment Return', icon: '📊' },
            { href: '/tools/ebay-fee-calc', label: 'eBay Fee Calc', icon: '🏷️' },
            { href: '/tools/selling-platforms', label: 'Platform Comparison', icon: '🏪' },
            { href: '/tools/insurance-calc', label: 'Insurance Calc', icon: '🛡️' },
          ].map(t => (
            <Link key={t.href} href={t.href} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 rounded-lg text-sm transition-colors">
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-800/50 border border-gray-700/50 rounded-xl">
              <summary className="cursor-pointer px-5 py-4 text-white font-medium text-sm flex items-center justify-between">
                {faq.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform ml-2">&#9662;</span>
              </summary>
              <div className="px-5 pb-4 text-gray-400 text-sm leading-relaxed">{faq.answer}</div>
            </details>
          ))}
        </div>
      </section>

      <section className="border-t border-gray-800 pt-8 mt-8 text-sm text-gray-500">
        <p>
          Calculate <Link href="/tools/flip-calc" className="text-emerald-400 hover:underline">flip profits</Link> before selling,
          track your <Link href="/tools/flip-tracker" className="text-emerald-400 hover:underline">P&amp;L journal</Link>,
          or compare <Link href="/tools/investment-return" className="text-emerald-400 hover:underline">card returns vs stocks</Link>.
          Browse all <Link href="/tools" className="text-emerald-400 hover:underline">86+ collecting tools</Link>.
        </p>
      </section>
    </div>
  );
}
