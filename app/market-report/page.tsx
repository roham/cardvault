import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import MarketReportClient from './MarketReportClient';

export const metadata: Metadata = {
  title: 'Weekly Market Report — Sports Card Market Analysis',
  description: 'Weekly analysis of the sports card and Pokemon card market. Top movers, sector trends, rookie watch, and buying opportunities. Updated every Monday.',
  openGraph: {
    title: 'Weekly Market Report — CardVault',
    description: 'AI-powered weekly analysis of the card collecting market. Trends, movers, and buying opportunities.',
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: 'Weekly Market Report — CardVault',
    description: 'Weekly card market analysis. Trends, movers, and buying opportunities.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Market Report' },
];

export default function MarketReportPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        name: 'Weekly Sports Card Market Report',
        description: 'AI-powered weekly analysis of the sports card and Pokemon card market.',
        url: 'https://cardvault-two.vercel.app/market-report',
        publisher: {
          '@type': 'Organization',
          name: 'CardVault',
          url: 'https://cardvault-two.vercel.app',
        },
      }} />

      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-blue-950/60 border border-blue-800/50 text-blue-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
          Updated weekly
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Weekly Market Report</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          AI-powered analysis of the sports card and Pokemon card market. Trends, top movers, sector performance, and buying opportunities.
        </p>
      </div>

      <MarketReportClient />

      {/* Bottom links */}
      <div className="mt-12 p-5 bg-gray-900/40 border border-gray-800 rounded-2xl">
        <h3 className="text-white font-semibold text-sm mb-3">Related Market Tools</h3>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/market-movers" className="text-emerald-400 hover:text-emerald-300 transition-colors">Daily Movers &rarr;</Link>
          <Link href="/tools/watchlist" className="text-emerald-400 hover:text-emerald-300 transition-colors">Price Watchlist &rarr;</Link>
          <Link href="/tools/price-history" className="text-emerald-400 hover:text-emerald-300 transition-colors">Price History &rarr;</Link>
          <Link href="/tools/portfolio" className="text-emerald-400 hover:text-emerald-300 transition-colors">Fantasy Portfolio &rarr;</Link>
          <Link href="/tools/grading-roi" className="text-emerald-400 hover:text-emerald-300 transition-colors">Grading ROI &rarr;</Link>
          <Link href="/news" className="text-emerald-400 hover:text-emerald-300 transition-colors">Hobby News &rarr;</Link>
        </div>
      </div>
    </div>
  );
}
