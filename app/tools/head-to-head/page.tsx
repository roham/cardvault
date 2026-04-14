import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import HeadToHeadClient from './HeadToHeadClient';

export const metadata: Metadata = {
  title: 'Head-to-Head Card Comparison — Compare Any Two Cards',
  description: 'Compare any two sports cards side-by-side. See raw price, PSA 10 value, grading ROI, price trends, and more. Free head-to-head card comparison tool.',
  openGraph: {
    title: 'Head-to-Head Card Comparison — CardVault',
    description: 'Pick any two sports cards and compare them side-by-side on price, grading ROI, and investment potential.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Head-to-Head Card Comparison — CardVault',
    description: 'Compare any two sports cards side-by-side with price, ROI, and trend analysis.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Head-to-Head' },
];

export default function HeadToHeadPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Head-to-Head Card Comparison — CardVault',
        description: 'Free head-to-head card comparison tool. Compare any two sports cards on price, grading ROI, trends, and investment potential.',
        url: 'https://cardvault-two.vercel.app/tools/head-to-head',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      }} />

      <Breadcrumb items={breadcrumbs} />

      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-orange-950/60 border border-orange-800/50 text-orange-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
          Side-by-side · Every metric · Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent mb-3">
          Head-to-Head Comparison
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Pick any two cards and compare them side-by-side on price, grading ROI, simulated trends, and more. Who wins?
        </p>
      </div>

      <HeadToHeadClient />
    </div>
  );
}
