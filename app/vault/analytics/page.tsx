import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import AnalyticsClient from './AnalyticsClient';

export const metadata: Metadata = {
  title: 'Vault Analytics — Portfolio Breakdown & Performance | CardVault',
  description: 'Deep analytics for your card vault. See portfolio allocation by sport, rarity distribution, era breakdown, ROI by acquisition source, top holdings, and performance metrics.',
  openGraph: {
    title: 'Vault Analytics — CardVault',
    description: 'Portfolio analytics: sport allocation, rarity distribution, era breakdown, ROI tracking, and top holdings.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Vault Analytics — CardVault',
    description: 'Deep portfolio analytics for your digital card vault.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'My Vault', href: '/vault' },
  { label: 'Analytics' },
];

const faqItems = [
  {
    question: 'What does the Vault Analytics dashboard show?',
    answer: 'The analytics dashboard gives you a detailed breakdown of your card portfolio: total value, ROI, sport allocation, rarity distribution, era breakdown, top holdings, best/worst performers, acquisition source returns, and a timeline of your collecting activity.',
  },
  {
    question: 'How is ROI calculated?',
    answer: 'ROI (Return on Investment) is calculated as: ((Current Value - Total Spent) / Total Spent) x 100. For example, if you spent $50 on packs and your cards are now worth $120, your ROI is +140%. This uses current estimated fair market values.',
  },
  {
    question: 'What are the rarity tiers?',
    answer: 'Cards are classified into 5 rarity tiers based on estimated value: Legendary ($5,000+), Ultra Rare ($1,000-$4,999), Rare ($200-$999), Uncommon ($50-$199), and Common (under $50). Higher rarities are harder to pull from packs.',
  },
  {
    question: 'What are the era categories?',
    answer: 'Cards are grouped into collecting eras: Pre-War (before 1945), Vintage (1945-1974), Junk Wax (1975-1994), Modern (1995-2014), and Ultra-Modern (2015+). Each era has different characteristics and collector appeal.',
  },
  {
    question: 'Can I share my analytics?',
    answer: 'Analytics are stored locally in your browser. You can take a screenshot to share your portfolio breakdown. Visit the Trophy Case to create shareable displays of your best pulls and holdings.',
  },
];

export default function VaultAnalyticsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault — Vault Analytics',
        description: 'Portfolio analytics dashboard for your digital card vault. Sport allocation, rarity distribution, ROI tracking.',
        url: 'https://cardvault-two.vercel.app/vault/analytics',
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

      <Breadcrumb items={breadcrumbs} />

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Vault Analytics</h1>
          <span className="text-xs bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 px-2 py-0.5 rounded-full">Beta</span>
        </div>
        <p className="text-gray-400 text-lg">
          Deep dive into your collection. Portfolio allocation, rarity breakdown, performance metrics, and more.
        </p>
      </div>

      <AnalyticsClient />

      {/* FAQ section */}
      <section className="mt-16 border-t border-gray-800 pt-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map(f => (
            <details key={f.question} className="group bg-gray-900 border border-gray-800 rounded-xl">
              <summary className="px-5 py-4 text-white font-medium cursor-pointer hover:text-emerald-400 transition-colors">
                {f.question}
              </summary>
              <div className="px-5 pb-4 text-gray-400 text-sm">
                {f.answer}
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
