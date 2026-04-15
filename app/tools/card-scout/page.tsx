import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardScout from './CardScout';

export const metadata: Metadata = {
  title: 'Card Scout — Find Your Next Card Based on Your Preferences',
  description: 'Free personalized card recommendation engine. Filter by sport, budget, era, card type, and collector style. Search 4,800+ sports cards to find undervalued picks, rookie investments, vintage gems, and set fillers. Powered by real market data.',
  openGraph: {
    title: 'Card Scout — CardVault',
    description: 'Find your next card based on sport, budget, era, and collector style. 4,800+ cards with personalized recommendations.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Scout — CardVault',
    description: 'Personalized card recommendations from 4,800+ sports cards. Free tool.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Card Scout' },
];

const faqItems = [
  {
    question: 'How does Card Scout recommend cards?',
    answer: 'Card Scout searches CardVault\'s database of 4,800+ sports cards and filters by your preferences — sport, budget range, era, card type (rookie, vintage, modern), and collector style (invest, collect, flip). Results are ranked by relevance to your criteria. All price data comes from real eBay sold listings and auction house results.',
  },
  {
    question: 'What collector styles does Card Scout support?',
    answer: 'Card Scout supports five collector styles: Investor (cards with high grading ROI and appreciation potential), Flipper (undervalued cards with quick resale opportunity), Completionist (set fillers and missing pieces), Rookie Hunter (first-year cards of rising stars), and Vintage Collector (pre-1980 classics and hall-of-famers). Each style weights different factors in the recommendation algorithm.',
  },
  {
    question: 'Can I filter by budget range?',
    answer: 'Yes. Card Scout offers six budget tiers: Under $10, $10–$50, $50–$200, $200–$1,000, $1,000–$10,000, and $10,000+. Budget is based on estimated raw card value. For graded cards, use the Grading ROI Calculator to estimate gem mint premiums on any recommended card.',
  },
  {
    question: 'Does Card Scout cover Pokemon cards?',
    answer: 'Card Scout currently covers sports cards across baseball, basketball, football, and hockey. Pokemon card recommendations are planned for a future update. For Pokemon pricing, use the main CardVault search tool which covers 20,000+ Pokemon TCG cards.',
  },
  {
    question: 'How often are Card Scout recommendations updated?',
    answer: 'Card Scout pulls from the live CardVault database which is updated regularly with new cards, players, and price estimates. Recommendations change as new cards are added and prices shift. Check back weekly for fresh picks, especially during draft season and new set releases when rookie card values are most volatile.',
  },
];

export default function CardScoutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Scout — Personalized Card Recommendations',
        description: 'Find your next sports card based on sport, budget, era, and collector style. Search 4,800+ cards with personalized recommendations powered by real market data.',
        url: 'https://cardvault-two.vercel.app/tools/card-scout',
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

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          4,800+ Cards &middot; 5 Collector Styles &middot; Real Prices &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Scout</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Tell us what you collect and we&apos;ll find your next card. Filter by sport, budget, era, and collector style — powered by real market data from 4,800+ sports cards.
        </p>
      </div>

      <CardScout />

      {/* FAQ Section */}
      <div className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((item, i) => (
            <div key={i}>
              <h3 className="text-lg font-semibold text-white mb-2">{item.question}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Internal links */}
      <div className="mt-8 border-t border-gray-800 pt-6 text-sm text-gray-500">
        <p>
          Check the <Link href="/tools/grading-roi" className="text-emerald-400 hover:underline">Grading ROI Calculator</Link> to see if recommended cards are worth grading.
          Use the <Link href="/tools/investment-calc" className="text-emerald-400 hover:underline">Card Investment Calculator</Link> for long-term return estimates.
          Browse <Link href="/tools/roi-heatmap" className="text-emerald-400 hover:underline">ROI Heatmap</Link> to see which categories offer the best grading returns.
          Track recommendations with the <Link href="/tools/watchlist" className="text-emerald-400 hover:underline">Price Watchlist</Link>.
          Take the <Link href="/tools/quiz" className="text-emerald-400 hover:underline">Collector Quiz</Link> to discover your collector profile.
        </p>
      </div>
    </div>
  );
}
