import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import ExportTool from './ExportTool';

export const metadata: Metadata = {
  title: 'Export Collection — Download Your Card Collection as CSV, JSON, or Text',
  description: 'Export your CardVault collection as CSV (for Excel/Google Sheets), JSON (for developers), or plain text. Download your binder, vault, or the full 4,400+ card database. Free, instant, no account required.',
  openGraph: {
    title: 'Export Collection — CardVault',
    description: 'Download your card collection as CSV, JSON, or plain text. Free and instant.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Export Collection — CardVault',
    description: 'Export your card collection in any format. CSV, JSON, or text. Free.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Export Collection' },
];

const faqItems = [
  {
    question: 'What formats can I export my collection in?',
    answer: 'CardVault supports three export formats: CSV (opens in Excel, Google Sheets, and Numbers), JSON (for developers and API integrations), and plain text (simple list that can be pasted anywhere). CSV is the most popular format for tracking collection value in spreadsheets.',
  },
  {
    question: 'What data is included in the export?',
    answer: 'Each export includes: card name, player name, year, set, sport, card number, estimated raw value, estimated gem mint value, rookie card status, and eBay search URL. This gives you everything you need to track, value, and research your collection.',
  },
  {
    question: 'Can I use this for insurance purposes?',
    answer: 'Yes. Exporting your collection as a CSV provides documentation of what you own and estimated values. For insurance claims, supplement the export with photographs of each card and receipts when available. Update your export regularly as values change.',
  },
  {
    question: 'Does the export include my binder and vault cards?',
    answer: 'You can choose what to export: just your binder (collected cards), just your vault (stored cards), or the full CardVault database of 4,400+ sports cards. Your collection data is stored locally in your browser — no account needed.',
  },
  {
    question: 'How often should I export my collection?',
    answer: 'We recommend exporting monthly to track value changes over time. Create a spreadsheet where you paste each monthly export, then compare columns to see which cards are appreciating. This is especially useful during hobby peaks (NFL Draft, NBA Playoffs, etc.).',
  },
];

export default function ExportCollectionPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Export Collection — Download Card Collection',
        description: 'Export your card collection as CSV, JSON, or plain text for tracking and insurance.',
        url: 'https://cardvault-two.vercel.app/tools/export-collection',
        applicationCategory: 'UtilitiesApplication',
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
          CSV &middot; JSON &middot; Text &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Export Collection</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Download your card collection as CSV (for spreadsheets), JSON (for developers), or plain text. Export your binder, vault, or the full CardVault database.
        </p>
      </div>

      <ExportTool />

      {/* FAQ */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-900/80 border border-gray-800 rounded-lg">
              <summary className="flex items-center justify-between cursor-pointer p-4 text-white font-medium">
                {faq.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform">&#x25BC;</span>
              </summary>
              <div className="px-4 pb-4 text-gray-400 text-sm">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>

      {/* Internal Links */}
      <div className="mt-12 pt-8 border-t border-gray-800">
        <h2 className="text-lg font-semibold text-white mb-4">Collection Management Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link href="/tools/collection-value" className="block p-4 bg-gray-900/80 border border-gray-800 rounded-lg hover:border-gray-600 transition-colors">
            <div className="text-white font-medium mb-1">Collection Value Calculator</div>
            <div className="text-gray-400 text-sm">See what your entire collection is worth</div>
          </Link>
          <Link href="/tools/insurance-calc" className="block p-4 bg-gray-900/80 border border-gray-800 rounded-lg hover:border-gray-600 transition-colors">
            <div className="text-white font-medium mb-1">Insurance Calculator</div>
            <div className="text-gray-400 text-sm">Estimate coverage needs for your cards</div>
          </Link>
          <Link href="/binder" className="block p-4 bg-gray-900/80 border border-gray-800 rounded-lg hover:border-gray-600 transition-colors">
            <div className="text-white font-medium mb-1">Digital Binder</div>
            <div className="text-gray-400 text-sm">Collect and organize your cards</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
