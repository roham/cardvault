import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import ListingGenerator from './ListingGenerator';

export const metadata: Metadata = {
  title: 'eBay Listing Generator — Optimized Titles & Descriptions for Card Sales',
  description: 'Free eBay listing generator for sports cards and Pokemon cards. Generate SEO-optimized titles (under 80 chars), professional descriptions, hashtags, and pricing tips. Sell cards faster.',
  openGraph: {
    title: 'eBay Listing Generator for Card Sellers | CardVault',
    description: 'Generate optimized eBay titles, descriptions, and hashtags for your card listings. Sell faster with professional listing content.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'eBay Listing Generator for Card Sellers | CardVault',
    description: 'Optimized titles, descriptions, and pricing tips for card listings.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'eBay Listing Generator' },
];

const faqItems = [
  {
    question: 'How do I write a good eBay title for sports cards?',
    answer: 'Include the year, set name, player name, card number, parallel (if any), and grade in that order. eBay titles are limited to 80 characters, so prioritize the most searchable keywords. Our generator creates three optimized title variants following proven selling formulas used by top card sellers.',
  },
  {
    question: 'What should I include in my card listing description?',
    answer: 'A good listing description includes: card details (year, set, player, card number, parallel), condition or grade information, shipping method and materials used, return/refund policy, and clear photos showing front, back, and all four corners. Our generator creates a professional template covering all these sections.',
  },
  {
    question: 'How do hashtags help sell cards on eBay?',
    answer: 'While eBay does not use hashtags directly, the hashtags we generate are optimized for cross-posting your listing on Instagram, X (Twitter), TikTok, and Facebook card groups. Social media cross-promotion can increase your buyer pool significantly beyond just eBay search traffic.',
  },
  {
    question: 'When is the best time to list cards on eBay?',
    answer: 'For auctions, end them on Sunday evening between 6-9 PM Eastern time — this is when the most collectors are browsing. For Buy It Now listings, list on Thursday-Friday so they appear in weekend searches. Avoid listing during major holidays when fewer collectors are active.',
  },
  {
    question: 'Should I use auction or Buy It Now for card listings?',
    answer: 'Use Buy It Now with Best Offer for cards with established market value (recent sales data available). Use auctions starting at $0.99 for rare or unique cards where the true market value is uncertain — competitive bidding often drives the price above what a fixed price would achieve. Our pricing tips section gives card-specific recommendations.',
  },
];

export default function ListingGeneratorPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'eBay Listing Generator for Card Sellers',
        description: 'Generate optimized eBay listing titles, descriptions, hashtags, and pricing tips for sports cards and Pokemon cards.',
        url: 'https://cardvault-two.vercel.app/tools/listing-generator',
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

      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Optimized Titles - Pro Descriptions - Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">eBay Listing Generator</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Enter your card details and get instant, SEO-optimized eBay listing titles, professional descriptions, social hashtags, and pricing tips. Sell your cards faster with better listings.
        </p>
      </div>

      <ListingGenerator />

      {/* FAQ Section */}
      <div className="mt-12 border-t border-gray-800 pt-10">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <details key={i} className="group bg-gray-900/60 border border-gray-800 rounded-xl">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium text-sm hover:text-emerald-400 transition-colors">
                {item.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform ml-2">&#9660;</span>
              </summary>
              <div className="px-4 pb-4 text-sm text-gray-400 leading-relaxed">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mt-10 text-center">
        <p className="text-gray-500 text-sm mb-3">Ready to sell? Use these tools to maximize your profits:</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link href="/tools/flip-calc" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-sm text-gray-300 hover:text-white transition-colors">
            Flip Profit Calculator
          </Link>
          <Link href="/tools/shipping-calc" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-sm text-gray-300 hover:text-white transition-colors">
            Shipping Calculator
          </Link>
          <Link href="/tools/grading-roi" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-sm text-gray-300 hover:text-white transition-colors">
            Grading ROI
          </Link>
          <Link href="/tools" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-sm text-gray-300 hover:text-white transition-colors">
            All Tools
          </Link>
        </div>
      </div>
    </div>
  );
}
