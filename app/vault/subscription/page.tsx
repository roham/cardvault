import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import SubscriptionClient from './SubscriptionClient';

export const metadata: Metadata = {
  title: 'Pack Subscription Simulator — Monthly Card Packs | CardVault',
  description: 'Simulate a monthly sports card subscription box. Choose your tier ($25-$200/mo), open monthly packs, track ROI, and build your collection over time. See if subscription boxes are worth it before you commit real money.',
  openGraph: {
    title: 'Pack Subscription Simulator — Monthly Card Packs | CardVault',
    description: 'Simulate a monthly card subscription. 4 tiers, real card pulls, ROI tracking over time.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Pack Subscription Simulator — CardVault',
    description: 'Monthly card subscription simulator with ROI tracking.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Vault', href: '/vault' },
  { label: 'Pack Subscription' },
];

const faqItems = [
  {
    question: 'What is the Pack Subscription Simulator?',
    answer: 'The Pack Subscription Simulator lets you experience what a monthly sports card subscription box would be like. Choose from 4 tiers ($25, $50, $100, or $200 per month), open monthly packs of real cards from our 7,000+ card database, and track your cumulative ROI over time. It helps you decide if subscription boxes are worth the investment before committing real money.',
  },
  {
    question: 'How are cards selected for each monthly pack?',
    answer: 'Cards are selected using a seeded random algorithm based on the month, year, and your subscription tier. Higher tiers get more cards per month, higher rookie card rates, and guaranteed hits (cards worth $20+). The Starter tier gives 5 cards/month with a 20% rookie rate. The Elite tier gives 12 cards/month with a 50% rookie rate and guaranteed premium hits.',
  },
  {
    question: 'What makes each tier different?',
    answer: 'Starter ($25/mo): 5 cards, 20% rookie rate, no guaranteed hits — good for casual collecting. Collector ($50/mo): 8 cards, 35% rookie rate — best value for most collectors. Premium ($100/mo): 10 cards, 40% rookie rate, guaranteed $20+ hit — for serious builders. Elite ($200/mo): 12 cards, 50% rookie rate, guaranteed premium hits — maximum value potential.',
  },
  {
    question: 'Is the ROI tracking accurate?',
    answer: 'The ROI is calculated using estimated raw card values from our database. A positive ROI means the estimated value of your pulled cards exceeds your subscription cost. In real subscription boxes, ROI varies widely — some months you hit big, others you barely break even. This simulator gives you a realistic sense of the variance over time.',
  },
  {
    question: 'Can I filter by sport?',
    answer: 'Yes! You can filter your subscription to only include cards from a specific sport — Baseball, Basketball, Football, or Hockey. This mirrors real subscription services that offer sport-specific boxes. Use "All Sports" for maximum variety.',
  },
];

export default function SubscriptionPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Pack Subscription Simulator — Monthly Card Packs',
        description: 'Simulate a monthly sports card subscription box with 4 tiers and ROI tracking.',
        url: 'https://cardvault-two.vercel.app/vault/subscription',
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
        <div className="inline-flex items-center gap-2 bg-purple-950/60 border border-purple-800/50 text-purple-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
          4 Tiers &middot; Monthly Packs &middot; ROI Tracking
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Pack Subscription Simulator</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Simulate a monthly card subscription box. Pick your tier, open monthly packs, and track whether subscription boxes are worth it over time.
        </p>
      </div>

      <SubscriptionClient />

      {/* FAQ */}
      <div className="mt-12 space-y-4">
        <h2 className="text-xl font-bold text-white">Frequently Asked Questions</h2>
        {faqItems.map((f, i) => (
          <details key={i} className="group bg-gray-900/40 border border-gray-800/40 rounded-lg">
            <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-gray-300 hover:text-white flex items-center justify-between">
              {f.question}
              <span className="text-gray-600 group-open:rotate-180 transition-transform">&#9662;</span>
            </summary>
            <p className="px-4 pb-4 text-sm text-gray-400 leading-relaxed">{f.answer}</p>
          </details>
        ))}
      </div>

      {/* Related */}
      <div className="mt-10 bg-gray-900/40 border border-gray-800/40 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-3">Related Features</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/store', label: 'Pack Store' },
            { href: '/vault', label: 'My Vault' },
            { href: '/vault/history', label: 'Pack History' },
            { href: '/tools/subscription-boxes', label: 'Subscription Box Comparison' },
            { href: '/tools/sealed-ev', label: 'Sealed Product EV' },
            { href: '/vault/analytics', label: 'Vault Analytics' },
            { href: '/tools/pack-sim', label: 'Pack Simulator' },
            { href: '/vault/sealed-wax', label: 'Sealed Wax Vault' },
          ].map(l => (
            <Link key={l.href} href={l.href} className="text-sm text-purple-400 hover:text-purple-300 underline underline-offset-2">
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
