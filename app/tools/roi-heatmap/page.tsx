import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import ROIHeatmapClient from './ROIHeatmapClient';

export const metadata: Metadata = {
  title: 'Card ROI Heatmap — Grading ROI by Sport, Era & Value Tier',
  description: 'Interactive heatmap showing which sports card categories have the best grading ROI. See raw-to-gem price multipliers by sport, era, and value tier using real card data from 2,100+ cards.',
  openGraph: {
    title: 'Card ROI Heatmap — CardVault',
    description: 'Visual heatmap of grading ROI across sports, eras, and value tiers. Find which card categories return the most from grading.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card ROI Heatmap — CardVault',
    description: 'Which cards have the best grading ROI? Interactive heatmap with real data from 2,100+ sports cards.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'ROI Heatmap' },
];

const faqItems = [
  {
    question: 'What does the ROI heatmap show?',
    answer: 'The ROI heatmap shows the average grading multiplier for different card categories. Each cell represents a combination of sport and era (or value tier), showing how many times the gem mint value exceeds the raw value on average. Green cells indicate high ROI categories (8x+ multiplier), yellow cells indicate moderate ROI (4-8x), and red cells indicate low ROI (under 4x).',
  },
  {
    question: 'How is the grading ROI multiplier calculated?',
    answer: 'For each card, we take the midpoint of the estimated gem mint value range (e.g., "$40-$80" becomes $60) and divide it by the midpoint of the estimated raw value range (e.g., "$3-$8" becomes $5.50). This gives a multiplier of roughly 10.9x, meaning grading that card and getting a gem mint grade would multiply its value by about 11 times.',
  },
  {
    question: 'Which sport has the best grading ROI overall?',
    answer: 'ROI varies significantly by era and value tier, but vintage cards (pre-1970) across all sports tend to have the highest multipliers because the condition gap between raw and gem mint is largest for older cards. Within modern cards, basketball and football rookies often show strong grading premiums due to collector demand for slabbed copies.',
  },
  {
    question: 'Should I grade every card with a high ROI multiplier?',
    answer: 'No. A high multiplier does not guarantee profit. You also need to factor in grading costs ($15-$300 per card), shipping, insurance, and the probability of actually receiving a gem mint grade. A $5 raw card with a 10x multiplier gives a $50 gem value, but after $35+ in grading costs, the actual profit is modest. Use this heatmap alongside the Grading ROI Calculator for individual card decisions.',
  },
  {
    question: 'Why do some cells show very high multipliers?',
    answer: 'Extremely high multipliers (20x+) are common for vintage and ultra-high-value cards where the condition premium is enormous. A 1952 Topps card might be worth $15,000 raw but $200,000+ in gem mint, giving a 13x+ multiplier. These outliers can skew category averages. Click any cell to see the individual cards driving that average.',
  },
];

export default function ROIHeatmapPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card ROI Heatmap',
        description: 'Interactive heatmap showing grading ROI multipliers by sport, era, and value tier for 2,100+ sports cards.',
        url: 'https://cardvault-two.vercel.app/tools/roi-heatmap',
        applicationCategory: 'UtilityApplication',
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
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Real Data &middot; 2,100+ Cards &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card ROI Heatmap</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          See which card categories deliver the best return from grading. This heatmap compares raw-to-gem-mint price multipliers across sports, eras, and value tiers using real data from our entire card database.
        </p>
      </div>

      <ROIHeatmapClient />

      {/* FAQ Section */}
      <section className="mt-16 mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((f, i) => (
            <div key={i} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
              <h3 className="font-semibold text-white mb-2">{f.question}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Related Tools */}
      <div className="border-t border-gray-800 pt-10">
        <h3 className="text-white font-semibold mb-4">Related Tools</h3>
        <div className="flex flex-wrap gap-3">
          <Link href="/tools/grading-roi" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
            Grading ROI Calculator
          </Link>
          <Link href="/tools/investment-calc" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
            Investment Calculator
          </Link>
          <Link href="/tools/diversification" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
            Diversification Analyzer
          </Link>
          <Link href="/tools/cross-grade" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
            Cross-Grade Converter
          </Link>
          <Link href="/tools/rarity-score" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
            Rarity Score Calculator
          </Link>
        </div>
      </div>
    </div>
  );
}
