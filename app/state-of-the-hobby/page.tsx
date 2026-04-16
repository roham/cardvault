import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import HobbyReportClient from './HobbyReportClient';

export const metadata: Metadata = {
  title: '2025 State of the Hobby — Card Collecting Industry Report | CardVault',
  description: 'Comprehensive 2025 card collecting industry report. Market size ($15.2B), grading volumes (28M+ cards), collector demographics, sport rankings, platform market share, price trends, and 2026 predictions. Free interactive report.',
  openGraph: {
    title: '2025 State of the Hobby — Card Collecting Industry Report | CardVault',
    description: '$15.2B market, 42M collectors, 28M cards graded. The definitive annual report on card collecting.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '2025 State of the Hobby Report — CardVault',
    description: 'Interactive card collecting industry report with market data, trends, and predictions.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'State of the Hobby' },
];

const faqItems = [
  {
    question: 'How big is the card collecting market in 2025?',
    answer: 'The global sports card and trading card market is estimated at $15.2 billion in 2025, growing 11% year-over-year. This includes sports cards (baseball, basketball, football, hockey), Pokemon TCG, and other trading cards. The US accounts for approximately 65% of the global market, with Japan, UK, and Australia being the fastest-growing international markets.',
  },
  {
    question: 'How many cards were graded in 2025?',
    answer: 'Over 28 million cards were graded by the four major companies in 2025. PSA led with approximately 14.2 million cards (52% market share), followed by BGS/Beckett at 5.1 million (18%), CGC at 4.3 million (15%), and SGC at 3.5 million (12%). This represents an 18% increase over 2024 volumes.',
  },
  {
    question: 'What is the most popular sport for card collecting?',
    answer: 'Baseball leads with approximately 35% market share, driven by vintage card demand and Shohei Ohtani\'s global appeal. Basketball is second at 28%, fueled by Victor Wembanyama\'s historic rookie class. Football holds 22%, with strong seasonal spikes around the NFL Draft and playoffs. Hockey (8%) and soccer (4%) round out the major sports.',
  },
  {
    question: 'What are the biggest card collecting trends in 2025-2026?',
    answer: 'Key trends include: vintage cards (pre-1980) appreciating 15-25%, sealed wax products rising 10-20%, PSA 10 premiums expanding, card show attendance up 22%, CGC overtaking BGS in monthly volume, Whatnot surpassing $1B in annual GMV, and the upcoming Fanatics licensing transition for NFL and NBA cards in 2026.',
  },
  {
    question: 'Where do most collectors sell cards in 2025?',
    answer: 'eBay remains dominant with 48% of card sales by volume. COMC (12%) is popular for bulk consignment. Whatnot (10%) leads live auction streaming. Facebook groups (8%), MySlabs (7%), Mercari (6%), and card shows (5%) round out the platforms. Most successful sellers use 2-3 platforms depending on card value and urgency.',
  },
];

export default function StateOfTheHobbyPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: '2025 State of the Hobby Report',
        description: 'Interactive annual report on the card collecting industry. Market data, trends, grading volumes, and predictions.',
        url: 'https://cardvault-two.vercel.app/state-of-the-hobby',
        applicationCategory: 'ReferenceApplication',
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
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-blue-950/60 border border-blue-800/50 text-blue-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
          2025 Annual Report · Interactive Data
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">State of the Hobby</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          The definitive annual report on card collecting. Market size, collector demographics, grading volumes, sport rankings, platform data, price trends, and 2026 predictions — all in one interactive report.
        </p>
      </div>

      {/* Interactive Report */}
      <HobbyReportClient />

      {/* Guide Section */}
      <div className="mt-12 bg-gray-900 rounded-lg p-6 border border-gray-800">
        <h2 className="text-xl font-bold text-white mb-4">How to Use This Report</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-300">
          <div>
            <h3 className="font-medium text-white mb-1">For Collectors</h3>
            <p>Understand where the market is heading. Use sport breakdowns and trend data to inform your collecting strategy. Focus on categories showing appreciation.</p>
          </div>
          <div>
            <h3 className="font-medium text-white mb-1">For Sellers</h3>
            <p>Platform market share data helps you choose where to sell. Fee comparisons and best-use-cases maximize your net profit per transaction.</p>
          </div>
          <div>
            <h3 className="font-medium text-white mb-1">For Investors</h3>
            <p>Trend data and predictions help time your buys and sells. Vintage appreciation, sealed wax growth, and PSA 10 premiums are key signals.</p>
          </div>
          <div>
            <h3 className="font-medium text-white mb-1">For Beginners</h3>
            <p>Demographics show you&apos;re not alone — 42M collectors strong. Start with the sport you love, use the tools linked below, and enjoy the journey.</p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-12">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <details key={i} className="bg-gray-900 rounded-lg border border-gray-800 group">
              <summary className="p-4 cursor-pointer font-medium text-white hover:text-blue-400 transition flex justify-between items-center">
                {item.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform">&#9662;</span>
              </summary>
              <div className="px-4 pb-4 text-gray-400 text-sm leading-relaxed">{item.answer}</div>
            </details>
          ))}
        </div>
      </div>

      {/* Related Links */}
      <div className="mt-12">
        <h2 className="text-xl font-bold text-white mb-4">Related Resources</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { href: '/market-analysis', label: 'Daily Market Analysis', desc: 'Live market data and movers' },
            { href: '/fear-greed', label: 'Fear & Greed Index', desc: 'Real-time market sentiment' },
            { href: '/market-sectors', label: 'Market Sectors', desc: 'Sector rotation and momentum' },
            { href: '/market-outlook', label: '2025 Market Outlook', desc: 'Quarterly predictions by sport' },
            { href: '/collecting-roadmap', label: 'Collecting Roadmap', desc: 'Beginner to expert path' },
            { href: '/tools/grading-roi', label: 'Grading ROI Calculator', desc: 'Is grading worth it?' },
          ].map(link => (
            <Link key={link.href} href={link.href} className="bg-gray-900 rounded-lg p-4 border border-gray-800 hover:border-blue-800/50 transition group">
              <div className="text-white font-medium group-hover:text-blue-400 transition text-sm">{link.label}</div>
              <div className="text-gray-500 text-xs">{link.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
