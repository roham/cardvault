import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import TierListClient from './TierListClient';

export const metadata: Metadata = {
  title: 'Card Product Tier List Maker — Rank Every Box & Pack | CardVault',
  description: 'Create and share your own sports card and Pokemon TCG product tier list. Rank 40+ products from S-tier to F-tier. Load community consensus, flipper, and investor presets. Compare hobby boxes, blasters, and ETBs across baseball, basketball, football, hockey, and Pokemon.',
  alternates: { canonical: './' },
  openGraph: {
    title: 'Card Product Tier List Maker | CardVault',
    description: 'Rank every card product from S to F tier. 40+ products, 5 sports, shareable results.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Product Tier List — Rank Every Box | CardVault',
    description: 'Create your card product tier list and share it. Baseball, basketball, football, hockey, Pokemon.',
  },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Product Tier List' },
];

const faqItems = [
  {
    question: 'What makes a card product S-tier?',
    answer: 'S-tier products combine a strong checklist (top rookies, numbered parallels, on-card autos), good hit rates, strong brand recognition, and proven resale value. Products like Topps Chrome, Panini Prizm, and Bowman Chrome consistently rank S-tier because they have the most sought-after rookie cards and parallel chase cards in the hobby.',
  },
  {
    question: 'Should I buy hobby boxes or retail products?',
    answer: 'Hobby boxes offer guaranteed hits (autographs, numbered cards, memorabilia) and better overall expected value (EV). Retail products like blasters and hangers are more affordable ($25-50) and great for casual ripping. If you are looking for value, hobby is almost always better per dollar. If you want affordable fun, retail wins.',
  },
  {
    question: 'Why do tier rankings differ between flippers and investors?',
    answer: 'Flippers care about short-term demand and quick resale — they want products that sell fast on release day. Investors care about long-term appreciation of sealed product — they look for products with iconic rookie classes that will be sought-after years later. A product can be great for flipping (high retail demand) but mediocre for investing (weak checklist long-term), or vice versa.',
  },
  {
    question: 'How often should tier rankings be updated?',
    answer: 'Product tier rankings shift based on rookie performance, market demand, and print runs. A product with a breakout rookie can jump from B-tier to S-tier mid-season. We recommend revisiting your rankings quarterly or after major events like the NFL Draft, NBA Draft, or when key rookies debut. Our presets are updated regularly.',
  },
  {
    question: 'Are Pokemon products comparable to sports card products?',
    answer: 'Pokemon and sports cards have different value drivers. Pokemon is driven by art, chase cards (illustration rares, alt arts), and nostalgia. Sports cards are driven by player performance and rookie scarcity. Both can be S-tier in their category. We include Pokemon products so collectors who span both hobbies can rank everything in one place.',
  },
];

export default function TierListPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Product Tier List Maker',
        description: 'Create and share card product tier lists. Rank 40+ hobby boxes, blasters, and ETBs across baseball, basketball, football, hockey, and Pokemon.',
        url: 'https://cardvault-two.vercel.app/tools/tier-list',
        applicationCategory: 'UtilityApplication',
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

      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-amber-950/60 border border-amber-800/50 text-amber-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
          40 Products &bull; 5 Sports &bull; 6 Tiers &bull; 3 Presets &bull; Shareable &bull; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">
          Card Product Tier List
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl">
          Rank every card product from S-tier (must buy) to F-tier (avoid). Load community presets or create your own. Share your rankings and compare with friends.
        </p>
      </div>

      <TierListClient />

      {/* FAQ Section */}
      <div className="mt-12 border-t border-slate-800 pt-10">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((item, i) => (
            <div key={i}>
              <h3 className="text-sm font-bold text-white mb-2">{item.question}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related Links */}
      <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { href: '/tools/sealed-ev', label: 'Sealed Product EV Calculator', desc: 'Calculate expected value per box' },
          { href: '/tools/wax-vs-singles', label: 'Wax vs Singles Calculator', desc: 'Should you buy boxes or singles?' },
          { href: '/tools/rip-or-hold', label: 'Rip or Hold Calculator', desc: 'Open now or hold sealed?' },
          { href: '/tools/sealed-portfolio', label: 'Sealed Portfolio Tracker', desc: 'Track your sealed investments' },
          { href: '/tools/pack-sim', label: 'Pack Simulator', desc: 'Simulate opening packs' },
          { href: '/tools/market-timer', label: 'Market Timer', desc: 'Best time to buy or sell' },
        ].map(link => (
          <Link key={link.href} href={link.href} className="bg-slate-800/40 border border-slate-700 rounded-lg p-3 hover:bg-slate-800 hover:border-slate-600 transition-colors">
            <p className="text-sm font-medium text-indigo-400">{link.label}</p>
            <p className="text-xs text-slate-500 mt-0.5">{link.desc}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link href="/tools" className="text-indigo-400 hover:text-indigo-300 text-sm">
          &larr; Back to All Tools
        </Link>
      </div>
    </div>
  );
}
