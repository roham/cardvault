import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import VaultHistory from './VaultHistory';

export const metadata: Metadata = {
  title: 'Pack Opening History — Your Pull Log & Stats | CardVault',
  description: 'Track every pack you have opened with detailed pull logs, P&L tracking, hit rates, and best pull highlights. Filter by pack type, profitability, and date. Full stats dashboard.',
  openGraph: {
    title: 'Pack Opening History — CardVault',
    description: 'Your complete pack opening history with pull details, ROI tracking, and hit rate stats.',
    type: 'website',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Vault', href: '/vault' },
  { label: 'Pack History' },
];

const faqItems = [
  {
    question: 'What is tracked in pack opening history?',
    answer: 'Every pack opened in CardVault is logged with the pack name, type (hobby/blaster/retail), date opened, every card pulled with rarity and estimated value, total pack value, pack cost, and net P&L. You can see your running hit rate and best pull across all packs.',
  },
  {
    question: 'How is the ROI calculated for each pack?',
    answer: 'ROI is calculated as (Total Card Value - Pack Cost) / Pack Cost * 100%. A 50% ROI means the cards pulled were worth 1.5x what you paid for the pack. Positive ROI packs show in green, negative in red.',
  },
  {
    question: 'What counts as a hit?',
    answer: 'Hits include epic and legendary rarity cards — typically autographs, numbered parallels, and premium inserts. The hit rate shows what percentage of all cards pulled were hits, helping you understand your luck over time.',
  },
];

export default function VaultHistoryPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Pack Opening History',
        description: 'Track every pack opened with detailed pull logs, P&L tracking, and hit rate statistics.',
        url: 'https://cardvault-two.vercel.app/vault/history',
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

      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-indigo-950/60 border border-indigo-800/50 text-indigo-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
          Pull Log - P&L Tracking - Hit Rate Stats
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Pack Opening History
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl">
          Every pack. Every pull. Every dollar. Track your complete pack opening history with
          detailed stats, P&L tracking, and hit rate analysis.
        </p>
      </div>

      <VaultHistory />

      {/* FAQ */}
      <section className="mt-16 mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item) => (
            <details key={item.question} className="group bg-zinc-900/60 border border-zinc-800 rounded-xl">
              <summary className="p-5 cursor-pointer text-white font-medium flex items-center justify-between">
                {item.question}
                <span className="text-zinc-500 group-open:rotate-180 transition-transform ml-4 shrink-0">▼</span>
              </summary>
              <div className="px-5 pb-5 text-zinc-400 text-sm leading-relaxed">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-12 mb-8 border-t border-zinc-800 pt-8">
        <h2 className="text-lg font-bold text-white mb-4">More Vault Features</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { href: '/vault', label: 'My Vault' },
            { href: '/vault/analytics', label: 'Vault Analytics' },
            { href: '/vault/wishlist', label: 'Vault Wishlist' },
            { href: '/vault/buyback', label: 'Buyback Center' },
            { href: '/packs', label: 'Pack Store' },
            { href: '/tools/flip-tracker', label: 'Flip Tracker P&L' },
          ].map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 rounded-xl text-sm font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
