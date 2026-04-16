import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import ProductReviewsClient from './ProductReviewsClient';

export const metadata: Metadata = {
  title: 'Card Product Release Reviews 2024-2025 — Ratings, Verdicts & Best Boxes | CardVault',
  description: 'Honest reviews of every major 2024-2025 sports card release. 15 products rated across baseball, basketball, football, and hockey. Ratings, pros/cons, key cards to chase, value verdicts (Buy/Hold/Avoid), and eBay links. Find the best boxes to rip.',
  openGraph: {
    title: 'Card Product Release Reviews 2024-2025 | CardVault',
    description: 'Honest reviews of 15 major card releases. Ratings, key pulls, pros/cons, and buy/hold/avoid verdicts for every collector.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '2024-2025 Card Product Reviews — CardVault',
    description: '15 card product reviews with ratings, verdicts, and best pulls. Find the best boxes to buy.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'News', href: '/news' },
  { label: 'Product Reviews' },
];

const faqItems = [
  {
    question: 'How are card products rated?',
    answer: 'Each product is rated on a 1-10 scale based on five factors: card design quality, hit rate (autographs and memorabilia per box), rookie and prospect checklist strength, value proposition (cost vs expected returns), and long-term collectibility. The final rating is a weighted average that emphasizes value and checklist quality, since those matter most to collectors deciding whether to buy.',
  },
  {
    question: 'What do the verdicts (Buy/Hold/Avoid) mean?',
    answer: 'BUY means we think the product offers strong value at current box prices — great hits, strong rookie class, or excellent design. HOLD means the product is decent but wait for prices to drop or buy singles instead of sealed. AVOID means the product is overpriced relative to its expected returns, has a weak checklist, or better alternatives exist in the same price range.',
  },
  {
    question: 'Should I buy hobby boxes or retail?',
    answer: 'Hobby boxes guarantee a certain number of autographs and premium inserts, making them better for collectors chasing specific hits. Retail products (blasters, hangers, megas) are better for casual ripping and can occasionally produce valuable parallels at a fraction of the cost. Our reviews specify the format (Hobby, Retail, Value) so you can find the right product for your budget and goals.',
  },
  {
    question: 'Are these reviews updated when prices change?',
    answer: 'Box prices fluctuate based on market demand, especially around major sporting events like the NFL Draft, NBA Playoffs, and World Series. Our verdicts reflect general value at typical market prices. If you find a product significantly below the listed price range, it may be a better buy than our verdict suggests. Always check current eBay sold listings for real-time box pricing.',
  },
  {
    question: 'Which product should a beginner buy first?',
    answer: 'For absolute beginners, we recommend starting with a value-tier product like Donruss or Mosaic in your favorite sport. These offer the pack-ripping experience at a lower price point and still have valuable parallels. Once you understand what you enjoy collecting (rookies, parallels, autographs), you can upgrade to hobby-tier products like Prizm, Chrome, or Select for better hit rates.',
  },
];

export default function ProductReviewsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Product Release Reviews 2024-2025',
        description: 'Comprehensive reviews of 15 major 2024-2025 sports card product releases with ratings, verdicts, and buy recommendations.',
        applicationCategory: 'SportsApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        url: 'https://cardvault-two.vercel.app/product-reviews',
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

      <ProductReviewsClient />

      <section className="mt-16 border-t border-gray-800 pt-10">
        <h2 className="text-xl font-bold mb-4 text-white">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((f, i) => (
            <details key={i} className="group" open={i === 0}>
              <summary className="cursor-pointer text-gray-300 hover:text-white font-medium">{f.question}</summary>
              <p className="mt-2 text-gray-400 text-sm leading-relaxed">{f.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-12 border-t border-gray-800 pt-10">
        <h2 className="text-xl font-bold mb-4 text-white">Related Resources</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { href: '/starter-packs', label: 'Starter Packs', desc: 'Curated collections for every type' },
            { href: '/daily-flip', label: 'The Daily Flip', desc: 'Morning market brief' },
            { href: '/market-outlook', label: '2025 Outlook', desc: 'Full-year market forecast' },
            { href: '/record-book', label: 'Record Book', desc: 'Most expensive cards ever sold' },
            { href: '/tools/sealed-ev', label: 'Sealed EV Calculator', desc: 'Calculate expected value per box' },
            { href: '/tools/rip-or-hold', label: 'Rip or Hold', desc: 'Should you open or keep sealed?' },
            { href: '/tools/box-break', label: 'Box Break Calculator', desc: 'Calculate break spot value' },
            { href: '/market-sectors', label: 'Market Sectors', desc: 'Sector rotation and signals' },
          ].map(l => (
            <Link key={l.href} href={l.href} className="block p-3 rounded-lg bg-gray-900/60 border border-gray-800 hover:border-gray-600 transition-colors">
              <div className="text-sm font-medium text-white">{l.label}</div>
              <div className="text-xs text-gray-400">{l.desc}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
