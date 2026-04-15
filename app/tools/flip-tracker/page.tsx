import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import FlipTrackerClient from './FlipTrackerClient';

export const metadata: Metadata = {
  title: 'Flip Tracker — Card Flipping P&L Journal | CardVault',
  description: 'Free card flipping profit tracker. Log every buy and sell, track your P&L, win rate, ROI, and average hold time. Filter by sport, time period, and status. Export to CSV. Works on mobile at card shows.',
  openGraph: {
    title: 'Flip Tracker — Card P&L Journal | CardVault',
    description: 'Track every card flip. See your total profit, win rate, ROI, and best/worst flips. Free, works offline.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Flip Tracker — Card Flipping P&L Journal | CardVault',
    description: 'Log buys and sells, track profit, win rate, ROI. Export to CSV. Free.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Flip Tracker' },
];

const faqItems = [
  {
    question: 'What is the Flip Tracker?',
    answer: 'The Flip Tracker is a free profit and loss journal for card flippers. Log every card you buy and sell, and the tracker calculates your net profit after platform fees, shipping, and grading costs. See your overall win rate, average ROI, average hold time, best flip, and worst flip. Filter by time period, sport, or status (sold, listed, holding).',
  },
  {
    question: 'How are platform fees calculated?',
    answer: 'When you select a selling platform, fees are auto-estimated: eBay (13.13% including PayPal/managed payments), Mercari (10%), COMC (5%), MySlabs (8%). Card show, Facebook, Instagram, and direct sales have 0% platform fees. You can manually adjust the fee amount if your actual fees differ.',
  },
  {
    question: 'Is my data saved?',
    answer: 'Yes, all flip data is stored in your browser localStorage. It persists between sessions on the same device. You can export your complete history to CSV at any time for backup or tax purposes. No account or sign-up required.',
  },
  {
    question: 'Can I use this for tax reporting?',
    answer: 'The Flip Tracker logs buy price, sell price, fees, and dates — the core data needed for Schedule D or 1099 reporting. Use the CSV export to share with your accountant. Note: this is a tracking tool, not tax software. Consult a tax professional for reporting obligations.',
  },
  {
    question: 'What do the status options mean?',
    answer: 'Sold means the card has been sold and the flip is complete — profit is calculated. Listed means the card is currently listed for sale on a platform. Holding means you own the card but have not listed it yet. Pipeline value combines your holding and listed inventory cost.',
  },
];

export default function FlipTrackerPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Flip Tracker — Card Flipping P&L Journal',
        description: 'Free card flipping profit tracker. Log buys and sells, track P&L, win rate, ROI, and hold time.',
        url: 'https://cardvault-two.vercel.app/tools/flip-tracker',
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

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
          P&L Tracking - Win Rate - ROI - CSV Export - Mobile-First
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Flip Tracker</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Log every card flip, track your total profit, win rate, and ROI over time. Auto-calculates platform fees. Export to CSV for tax reporting. All data stored locally — no account needed.
        </p>
      </div>

      <FlipTrackerClient />

      {/* FAQ Section */}
      <div className="mt-12 bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((item, i) => (
            <div key={i} className="border-b border-gray-700/50 pb-5 last:border-0 last:pb-0">
              <h3 className="text-white font-semibold mb-2">{item.question}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
