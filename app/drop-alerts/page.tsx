import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import DropAlertsClient from './DropAlertsClient';

export const metadata: Metadata = {
  title: 'Product Drop Alerts — Card Releases, Restocks & Deals | CardVault',
  description: 'Live feed of sports card and Pokemon product drops, restocks, deals, and sell-outs. Track 24 products across 5 categories from 16 major retailers. Never miss a release.',
  alternates: { canonical: './' },
  openGraph: {
    title: 'Product Drop Alerts — Never Miss a Release | CardVault',
    description: 'Live alerts for card product drops, restocks, and deals. All sports + Pokemon.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Product Drop Alerts | CardVault',
    description: 'Live card product drops, restocks, deals. 24 products, 16 retailers.',
  },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Live', href: '/news' },
  { label: 'Drop Alerts' },
];

const faqItems = [
  {
    question: 'How often are drop alerts updated?',
    answer: 'The alert feed updates in real time, with new alerts appearing every 5 to 13 seconds. You will see new drops, restocks, deals, sell-outs, and price cuts as they happen across all tracked retailers and products.',
  },
  {
    question: 'What products are tracked?',
    answer: 'We track 24 major card products across baseball (Topps Series 1, Bowman Chrome, Topps Chrome), basketball (Panini Prizm, Select, Donruss Optic), football (Prizm, Mosaic, Select, National Treasures, Contenders), hockey (Upper Deck Series 2, SP Authentic), and Pokemon (Prismatic Evolutions, 151, Journey Together, Surging Sparks).',
  },
  {
    question: 'Which retailers are monitored?',
    answer: 'We track 16 major retailers including Target, Walmart, Fanatics, Steel City Collectibles, Blowout Cards, Dave and Adams, Topps.com, Panini Direct, Upper Deck e-Pack, Pokemon Center, and several specialty hobby shops.',
  },
  {
    question: 'What does the HOT tag mean?',
    answer: 'The HOT tag appears on alerts for products that are currently in high demand and likely to sell out quickly. This includes chase products like Prizm Basketball, Bowman Chrome, and Prismatic Evolutions when they appear as new drops or restocks.',
  },
  {
    question: 'Can I filter alerts by sport or type?',
    answer: 'Yes. Use the sport filter buttons (Baseball, Basketball, Football, Hockey, Pokemon) and the type filter buttons (New Drop, Restock, Deal, Sold Out, Price Cut) to narrow the feed to exactly what you care about. You can also pause the feed to review alerts without new ones pushing older ones down.',
  },
];

export default function DropAlertsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Product Drop Alerts',
        description: 'Live feed of sports card and Pokemon product drops, restocks, deals, and sell-outs from major retailers.',
        url: 'https://cardvault-two.vercel.app/drop-alerts',
        applicationCategory: 'ShoppingApplication',
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

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-red-950/60 border border-red-800/50 text-red-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
          Live Feed &middot; Drops &middot; Restocks &middot; Deals
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Product Drop Alerts</h1>
        <p className="text-slate-400 text-lg max-w-2xl">
          Live feed of card product releases, restocks, deals, and sell-outs. Track 24 products across baseball, basketball, football, hockey, and Pokemon from 16 major retailers.
        </p>
      </div>

      <DropAlertsClient />

      {/* Tips */}
      <div className="mt-12 bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Drop Alert Tips</h2>
        <div className="space-y-3">
          {[
            { title: 'Act on HOT Drops', tip: 'Products tagged HOT sell out fast. When you see a restock for Prismatic Evolutions or Prizm Basketball, expect single-digit minutes of availability.' },
            { title: 'Compare Prices', tip: 'Deal alerts show discounted prices, but always compare across retailers. A deal at one store might still be above market price.' },
            { title: 'Set Your Filters', tip: 'If you only collect one sport, filter the feed to avoid alert fatigue. Focus on what matters to you.' },
            { title: 'Watch Sold-Outs', tip: 'Sold-out alerts tell you which products have the most demand. This is useful market intelligence for investing and flipping decisions.' },
          ].map((t, i) => (
            <div key={i} className="flex gap-3">
              <span className="text-red-400 mt-0.5">&#x2022;</span>
              <div>
                <span className="text-white font-medium text-sm">{t.title}:</span>{' '}
                <span className="text-slate-400 text-sm">{t.tip}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-8 bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((f, i) => (
            <details key={i} className="group">
              <summary className="cursor-pointer text-white font-medium text-sm hover:text-red-400 transition-colors">
                {f.question}
              </summary>
              <p className="text-slate-400 text-sm mt-2 pl-4 border-l-2 border-slate-700">{f.answer}</p>
            </details>
          ))}
        </div>
      </div>

      {/* Related Links */}
      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          { href: '/calendar', label: 'Release Calendar', desc: '2026 card release dates' },
          { href: '/tools/sealed-ev', label: 'Sealed Product EV', desc: 'Expected value per product' },
          { href: '/tools/pack-sim', label: 'Pack Simulator', desc: 'Open virtual packs' },
          { href: '/market-reactions', label: 'Market Reactions', desc: 'How events affect card prices' },
          { href: '/tools/rip-or-hold', label: 'Rip or Hold', desc: 'Open now or keep sealed?' },
          { href: '/tools/break-cost', label: 'Break Cost Splitter', desc: 'Fair pricing for break spots' },
        ].map(link => (
          <Link key={link.href} href={link.href} className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-3 hover:border-red-700/50 transition-colors group">
            <span className="text-white text-sm font-medium group-hover:text-red-400 transition-colors">{link.label}</span>
            <span className="text-slate-500 text-xs block mt-0.5">{link.desc}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
