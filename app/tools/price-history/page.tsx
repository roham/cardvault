import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import PriceHistoryClient from './PriceHistoryClient';

export const metadata: Metadata = {
  title: 'Card Price History — 90-Day Price Trends',
  description: 'Free card price history tool. Search any sports card and see a simulated 90-day price chart with trend analysis, daily changes, and grade comparisons. No account needed.',
  openGraph: {
    title: 'Card Price History — CardVault',
    description: 'Search any sports card and see 90-day price trends. Compare raw vs PSA 10 values with interactive charts.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Price History — CardVault',
    description: 'Search any sports card and see 90-day price trends with interactive charts.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Price History' },
];

export default function PriceHistoryPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Price History — CardVault',
        description: 'Free card price history tool with 90-day trend charts for sports cards.',
        url: 'https://cardvault-two.vercel.app/tools/price-history',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      }} />

      <div className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-500 bg-clip-text text-transparent mb-3">
          Card Price History
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Search any sports card and see a 90-day simulated price chart. Compare raw vs graded values and track trends over time.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          No account needed. Simulated prices based on market patterns.
        </p>
      </div>

      <PriceHistoryClient />
    </div>
  );
}
