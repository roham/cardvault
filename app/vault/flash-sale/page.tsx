import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import FlashSaleClient from './FlashSaleClient';

export const metadata: Metadata = {
  title: 'Flash Sales — Limited-Time Card Deals & Discounted Packs | CardVault',
  description: 'Grab limited-time flash deals on sports card packs, singles, bundles, and mystery boxes. 15-50% off with countdown timers and limited inventory. New deals rotate daily across baseball, basketball, football, and hockey.',
  openGraph: {
    title: 'Flash Sales — Limited-Time Card Deals | CardVault',
    description: '8 rotating flash deals daily. Discounted packs, single card steals, bundles, and mystery boxes. Act fast — limited inventory.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Flash Sales — CardVault',
    description: 'Limited-time card deals. 15-50% off packs, singles, bundles, and mystery boxes. New deals daily.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Vault', href: '/vault' },
  { label: 'Flash Sales' },
];

const faqItems = [
  {
    question: 'What are CardVault Flash Sales?',
    answer: 'Flash Sales are limited-time deals on card packs, individual cards, bundles, and mystery boxes. Each day features 8 rotating deals with 15-50% discounts. Every deal has a countdown timer and limited inventory — once it sells out or expires, it is gone. Deals rotate daily and cover all four major sports: baseball, basketball, football, and hockey.',
  },
  {
    question: 'How often do Flash Sales change?',
    answer: 'New Flash Sale deals are generated every day. Each deal has its own countdown timer ranging from 2 to 8 hours. When a deal expires or sells out, it cannot be purchased. Check back multiple times per day to catch the best deals before they are gone.',
  },
  {
    question: 'What types of Flash Sale deals are available?',
    answer: 'There are four deal types: Pack Deals (20-44% off individual packs), Single Steals (30-49% off specific cards below market value), Bundles (3-5 packs at bulk discount), and Mystery Boxes (15-34% off curated mystery boxes with guaranteed hits). Each type has different discount ranges and inventory levels.',
  },
  {
    question: 'How do I pay for Flash Sale items?',
    answer: 'Flash Sales use your CardVault wallet balance. You start with $250 or whatever balance you have from opening packs and selling cards. The wallet is shared across the Pack Store, Marketplace, Auction Sniper, and Flash Sales. All purchases are simulated using your browser local storage — no real money is involved.',
  },
  {
    question: 'Can I track my Flash Sale savings?',
    answer: 'Yes. The stats bar at the top shows your current balance, total deals snagged, total spent, and total saved. The Recent Purchases section shows your last 10 purchases with individual savings. Your purchase history persists in your browser between visits.',
  },
];

export default function FlashSalePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Flash Sales',
        description: 'Limited-time flash deals on sports card packs, singles, bundles, and mystery boxes. 15-50% off with countdown timers.',
        url: 'https://cardvault-two.vercel.app/vault/flash-sale',
        applicationCategory: 'ShoppingApplication',
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
        <div className="inline-flex items-center gap-2 bg-green-950/60 border border-green-800/50 text-green-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          Flash Sales &middot; Limited Time &middot; Up to 50% Off
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-zinc-100 mb-2">Flash Sales</h1>
        <p className="text-zinc-400 text-sm sm:text-base max-w-2xl">
          Limited-time deals on packs, singles, bundles, and mystery boxes. 8 deals rotate daily with countdown timers and limited inventory. Snag deals before they sell out.
        </p>
      </div>

      <FlashSaleClient />

      {/* FAQ */}
      <div className="mt-12 border-t border-zinc-800 pt-8">
        <h2 className="text-lg font-semibold text-zinc-100 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-zinc-900/40 border border-zinc-800/50 rounded-lg">
              <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-zinc-200 hover:text-zinc-100">
                {faq.question}
              </summary>
              <div className="px-4 pb-3 text-sm text-zinc-400">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Back to Vault */}
      <div className="mt-8 text-center">
        <Link href="/vault" className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
          &larr; Back to My Vault
        </Link>
      </div>
    </div>
  );
}
