import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import BreakRoiClient from './BreakRoiClient';

export const metadata: Metadata = {
  title: 'Break ROI Tracker — Group Break Profit & Loss Calculator | CardVault',
  description: 'Track your group break purchases and calculate running P&L. Log spot costs, cards pulled, and values to see your ROI across every break. Best break, worst break, average ROI, and lifetime stats. Free break profit tracker.',
  openGraph: {
    title: 'Break ROI Tracker — Group Break P&L Calculator | CardVault',
    description: 'Are you winning or losing on group breaks? Track spot costs, pulls, and ROI across every break.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Break ROI Tracker — CardVault',
    description: 'Track group break P&L. Log spot costs and cards pulled. See running ROI and lifetime stats. Free.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Break ROI Tracker' },
];

const faqItems = [
  {
    question: 'What is a group break ROI tracker?',
    answer: 'A break ROI tracker logs every group break you participate in — the product, team spot cost, and every card you pull with its estimated value. It calculates your running profit or loss, ROI percentage, and lifetime stats so you can see whether breaks are profitable for you over time. Most breakers lose money without tracking, so this tool helps you make data-driven decisions about which breaks to join.',
  },
  {
    question: 'How do I estimate card values for my pulls?',
    answer: 'Use recent eBay sold prices (not listings) for the most accurate values. Search for the exact card — player, year, set, parallel, and condition — and look at the last 3-5 sales. For base cards worth under $1, you can enter $0.50 or $0 and focus on tracking your hits (autos, relics, numbered parallels). The goal is a reasonable estimate, not perfection.',
  },
  {
    question: 'What is a good ROI for group breaks?',
    answer: 'Breaking even (0% ROI) is actually above average for most break participants. The break host takes a margin, so the average participant loses 20-40% of their spot cost. If you are consistently above -10% ROI, you are picking good teams. Positive ROI usually requires hitting a big card occasionally or consistently buying undervalued team spots.',
  },
  {
    question: 'Is my break data saved?',
    answer: 'Yes, all break data is stored in your browser\'s localStorage. It persists between sessions on the same device and browser. No account or sign-up is required. You can export your complete break history to your clipboard at any time, or clear all data to start fresh.',
  },
  {
    question: 'Should I count base cards in my pull value?',
    answer: 'It depends on your goal. For a realistic P&L picture, include everything — even base cards worth $0.25 each. But for a simpler workflow, many breakers only log cards worth $2+ and accept that base cards are essentially worthless. Either approach works as long as you are consistent across all your breaks.',
  },
];

export default function BreakRoiPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Break ROI Tracker — Group Break Profit & Loss Calculator',
        description: 'Track group break purchases and calculate running P&L. Log spot costs, cards pulled, and values to see lifetime ROI.',
        url: 'https://cardvault-two.vercel.app/tools/break-roi',
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
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
          Break P&L &middot; ROI Tracking &middot; Lifetime Stats &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Break ROI Tracker
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Are your group breaks profitable? Log every break — spot cost, team, cards pulled — and track your running P&L, ROI, and lifetime stats. All data stored locally.
        </p>
      </div>

      <BreakRoiClient />

      {/* Related Tools */}
      <div className="mt-8 bg-gray-800/60 border border-gray-700 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-3">Related Tools</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/tools/break-spot', label: 'Break Spot Picker', desc: 'Find the best team to buy' },
            { href: '/tools/flip-calc', label: 'Flip Profit Calc', desc: 'Calculate flip profit after fees' },
            { href: '/tools/box-break', label: 'Box Break Calculator', desc: 'Simulate box break EV' },
            { href: '/tools/sealed-ev', label: 'Sealed Product EV', desc: 'Expected value by product' },
            { href: '/tools/flip-tracker', label: 'Flip Tracker', desc: 'Full P&L journal for flips' },
            { href: '/tools/roi-heatmap', label: 'ROI Heatmap', desc: 'Visual ROI by sport and era' },
          ].map(t => (
            <Link key={t.href} href={t.href} className="block bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 hover:border-amber-600/50 transition-colors">
              <div className="text-white text-sm font-medium">{t.label}</div>
              <div className="text-gray-500 text-xs mt-0.5">{t.desc}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-8 space-y-4">
        <h2 className="text-lg font-bold text-white">Frequently Asked Questions</h2>
        {faqItems.map((f) => (
          <details key={f.question} className="group bg-gray-800/40 border border-gray-700/50 rounded-lg">
            <summary className="cursor-pointer px-5 py-4 text-sm font-medium text-white group-open:border-b group-open:border-gray-700/50">
              {f.question}
            </summary>
            <div className="px-5 py-4 text-sm text-gray-400">{f.answer}</div>
          </details>
        ))}
      </div>

      <p className="text-center text-gray-600 text-xs mt-10">
        Break ROI Tracker is for informational purposes. Card values are estimates based on user input. Not financial advice.
      </p>
    </div>
  );
}
