import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CollectionHeatmapClient from './CollectionHeatmapClient';

export const metadata: Metadata = {
  title: 'Card Collection Heatmap — Visualize 9,500+ Cards by Sport, Era & Value | CardVault',
  description: 'Interactive heatmap visualization of 9,500+ sports cards. Explore the card market by sport, decade, value tier, and card type. See where the hobby is concentrated, find gaps, and discover collecting opportunities. Free visual analytics tool.',
  openGraph: {
    title: 'Card Collection Heatmap — Visual Card Market Analytics | CardVault',
    description: 'Explore 9,500+ cards as an interactive heatmap. Sport x Decade, Sport x Value, and more views.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Collection Heatmap — CardVault',
    description: 'Interactive heatmap of 9,500+ sports cards. Explore by sport, decade, value, and type.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Collection Heatmap' },
];

const faqItems = [
  {
    question: 'What is the Collection Heatmap?',
    answer: 'The Collection Heatmap is a visual analytics tool that displays 9,500+ sports cards as an interactive heatmap grid. Each cell represents a combination of two dimensions (like Sport x Decade or Sport x Value Tier), colored by intensity — darker cells have more cards or higher total value. It helps you see where the card market is concentrated and where collecting opportunities exist.',
  },
  {
    question: 'What views are available?',
    answer: 'Four heatmap views: Sport x Decade (see how card coverage spans eras), Sport x Value Tier (where the money is), Decade x Value Tier (how card values distribute across eras), and Rookie vs Veteran breakdown by sport. Each view reveals different patterns in the card market.',
  },
  {
    question: 'What do the colors mean?',
    answer: 'Cells are color-coded from cool (blue/teal, low count or value) to hot (amber/red, high count or value). The intensity scale adapts to each view — the hottest cell in the current view gets the most saturated color. Empty cells are shown as dark gray. Hover or tap any cell for detailed stats.',
  },
  {
    question: 'How can I use this for collecting?',
    answer: 'Use the heatmap to find gaps in the market — decades or sports with fewer cards may represent underserved collecting areas. Value concentration shows which sports and eras command premiums. The rookie breakdown helps you understand which sports produce the most valuable rookie cards.',
  },
  {
    question: 'Is this based on real data?',
    answer: 'Yes. Every cell in the heatmap is calculated from our database of 9,500+ real sports cards with estimated market values. The data covers baseball, basketball, football, and hockey from the early 1900s through 2025, including vintage legends and modern rookies.',
  },
];

export default function CollectionHeatmapPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Collection Heatmap',
        description: 'Interactive heatmap visualization of 9,500+ sports cards by sport, decade, value, and type.',
        url: 'https://cardvault-two.vercel.app/tools/collection-heatmap',
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
        <div className="inline-flex items-center gap-2 bg-violet-950/60 border border-violet-800/50 text-violet-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
          Heatmap &middot; 9,500+ Cards &middot; 4 Views
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Collection Heatmap</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Visualize the card market as an interactive heatmap. See where cards concentrate by sport,
          decade, value, and type. Find gaps, discover trends, and explore collecting opportunities.
        </p>
      </div>

      <CollectionHeatmapClient />

      {/* FAQ */}
      <div className="mt-12 bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, idx) => (
            <details key={idx} className="group">
              <summary className="cursor-pointer text-white font-medium text-sm hover:text-violet-400 transition-colors list-none flex items-center gap-2">
                <span className="text-violet-400/60 group-open:rotate-90 transition-transform">&#9654;</span>
                {faq.question}
              </summary>
              <p className="text-gray-400 text-sm mt-2 ml-5">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>

      {/* How to Read section */}
      <div className="mt-8 bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">How to Read the Heatmap</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <h3 className="text-violet-400 font-medium mb-2">Color Intensity</h3>
            <p className="text-gray-400">Darker/warmer colors mean higher concentration. Cool blues = fewer cards or lower value. Hot ambers/reds = many cards or high value. The scale adapts to each view.</p>
          </div>
          <div>
            <h3 className="text-violet-400 font-medium mb-2">Cell Details</h3>
            <p className="text-gray-400">Hover or tap any cell to see: card count, total estimated value, average card value, top player in that segment, and percentage of database.</p>
          </div>
          <div>
            <h3 className="text-violet-400 font-medium mb-2">Finding Opportunities</h3>
            <p className="text-gray-400">Cool/empty cells in valuable eras may represent underpriced segments. Hot cells show where collector attention is already high — more competition but also more liquidity.</p>
          </div>
          <div>
            <h3 className="text-violet-400 font-medium mb-2">Metric Toggle</h3>
            <p className="text-gray-400">Switch between Count (how many cards) and Value (total estimated worth) to see different patterns. Some eras have few cards but high value — those are the hidden gems.</p>
          </div>
        </div>
      </div>

      {/* Internal Links */}
      <div className="mt-8 text-sm text-gray-500">
        <p>
          Part of <Link href="/tools" className="text-violet-400 hover:underline">CardVault Tools</Link>.
          See also: <Link href="/tools/market-dashboard" className="text-violet-400 hover:underline">Market Dashboard</Link>,{' '}
          <Link href="/tools/collection-value" className="text-violet-400 hover:underline">Collection Value</Link>,{' '}
          <Link href="/tools/collection-health" className="text-violet-400 hover:underline">Collection Health</Link>,{' '}
          <Link href="/tools/price-history" className="text-violet-400 hover:underline">Price History</Link>,{' '}
          <Link href="/tools/diversification" className="text-violet-400 hover:underline">Diversification Tool</Link>,{' '}
          <Link href="/tools/roi-heatmap" className="text-violet-400 hover:underline">ROI Heatmap</Link>.
        </p>
      </div>
    </div>
  );
}
