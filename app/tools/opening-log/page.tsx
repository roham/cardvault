import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import OpeningLogClient from './OpeningLogClient';

export const metadata: Metadata = {
  title: 'Card Opening Log — Track Every Pack & Box You Open | CardVault',
  description: 'Free pack opening tracker. Log every box and pack you open with cost and pulls. See running EV vs cost, hit rates, and whether you are running hot or cold. Export to CSV.',
  alternates: { canonical: './' },
  openGraph: {
    title: 'Card Opening Log — Track Your Pulls | CardVault',
    description: 'Log every pack opening. Track cost vs value, hit rates, and your luck over time.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Opening Log | CardVault',
    description: 'Track pack openings. Cost vs value analytics. Are you running hot or cold?',
  },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Opening Log' },
];

const faqItems = [
  {
    question: 'How do I log a pack opening?',
    answer: 'Click "Log Opening" and select the product you opened (or type a custom name). Enter the cost you paid and add your notable pulls with their estimated values. The tool automatically calculates your EV, profit/loss, and running totals.',
  },
  {
    question: 'What counts as a notable pull?',
    answer: 'Log anything worth tracking: autographs, numbered parallels, refractors, short prints, rookie cards of top players, or any card worth more than a few dollars. You do not need to log every base card — just the hits and cards with value.',
  },
  {
    question: 'How is the hot or cold rating calculated?',
    answer: 'Your luck rating compares total pull value against total cost. Over 150 percent means you are running hot. Between 80 and 150 percent is normal. Below 80 percent means you are running cold. The rating updates as you log more openings.',
  },
  {
    question: 'Can I export my opening log?',
    answer: 'Yes. Click Export CSV to download your full opening history including dates, products, costs, pulls, and values in a spreadsheet-compatible format. Great for tax tracking or personal records.',
  },
  {
    question: 'Does this work for Pokemon and sports cards?',
    answer: 'Yes. The opening log works for any card product — sports cards, Pokemon, Yu-Gi-Oh, or any other TCG. Just enter the product name, cost, and what you pulled.',
  },
];

export default function OpeningLogPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Opening Log',
        description: 'Track every pack and box you open. Log costs and pulls, see running EV vs cost analytics.',
        url: 'https://cardvault-two.vercel.app/tools/opening-log',
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

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-pink-950/60 border border-pink-800/50 text-pink-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse" />
          Opening Log &middot; Track Pulls &middot; Analytics
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Opening Log</h1>
        <p className="text-slate-400 text-lg max-w-2xl">
          Track every pack and box you open. Log your costs and pulls. See if you are running hot or cold.
        </p>
      </div>

      <OpeningLogClient />

      {/* Tips */}
      <div className="mt-12 bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Opening Log Tips</h2>
        <div className="space-y-3">
          {[
            { title: 'Log Immediately', tip: 'Log pulls right after opening while you remember what you got. Waiting leads to forgotten hits.' },
            { title: 'Track Everything Over $5', tip: 'Even mid-range pulls add up. A $8 insert times 10 is $80 in value you might not track otherwise.' },
            { title: 'Compare Products', tip: 'After 5+ openings of each product, compare which ones give you the best return. Data beats gut feeling.' },
            { title: 'Set a Stop-Loss', tip: 'If you are 30%+ negative after 10 openings of a product, consider switching to buying singles instead.' },
          ].map((t, i) => (
            <div key={i} className="flex gap-3">
              <span className="text-pink-400 mt-0.5">&#x2022;</span>
              <div>
                <span className="text-white font-medium text-sm">{t.title}:</span>{' '}
                <span className="text-slate-400 text-sm">{t.tip}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-8 bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((f, i) => (
            <details key={i} className="group">
              <summary className="cursor-pointer text-white font-medium text-sm hover:text-pink-400 transition-colors">
                {f.question}
              </summary>
              <p className="text-slate-400 text-sm mt-2 pl-4 border-l-2 border-slate-700">{f.answer}</p>
            </details>
          ))}
        </div>
      </div>

      {/* Related Links */}
      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          { href: '/tools/pack-sim', label: 'Pack Simulator', desc: 'Simulate opening packs' },
          { href: '/tools/sealed-ev', label: 'Sealed EV Calculator', desc: 'Expected value per box' },
          { href: '/tools/purchase-log', label: 'Purchase Log', desc: 'Track all card purchases' },
          { href: '/tools/flip-calc', label: 'Flip Calculator', desc: 'Calculate sell profits' },
          { href: '/tools/wax-vs-singles', label: 'Wax vs Singles', desc: 'Should you open or buy singles?' },
          { href: '/tools/rip-or-hold', label: 'Rip or Hold', desc: 'Open now or keep sealed?' },
        ].map(link => (
          <Link key={link.href} href={link.href} className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-3 hover:border-pink-700/50 transition-colors group">
            <span className="text-white text-sm font-medium group-hover:text-pink-400 transition-colors">{link.label}</span>
            <span className="text-slate-500 text-xs block mt-0.5">{link.desc}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
