import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardShowGuideClient from './CardShowGuideClient';

export const metadata: Metadata = {
  title: 'Card Show Survival Guide — Tips, Negotiation & Checklist | CardVault',
  description: 'Your complete card show survival guide. Pre-show checklist, negotiation tactics, red flags to avoid, show pricing vs online, and post-show P&L tracker. Free interactive tool for sports card collectors.',
  keywords: ['card show tips', 'how to buy at card shows', 'card show negotiation', 'card show checklist', 'sports card show guide', 'card show red flags', 'card show pricing'],
  openGraph: {
    title: 'Card Show Survival Guide — CardVault',
    description: 'Pre-show checklist, negotiation tactics, red flags, pricing guide, and P&L tracker for card shows.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Show Survival Guide — CardVault',
    description: 'Everything you need to dominate your next card show. Checklist, tactics, pricing, and P&L tracker.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Guides', href: '/guides' },
  { label: 'Card Show Survival Guide' },
];

const faqItems = [
  {
    question: 'How much cash should I bring to a card show?',
    answer: 'Bring 20-30% more than you plan to spend. If your budget is $300, bring $360-$400 in small bills ($1s, $5s, $10s, $20s). Dealers strongly prefer cash and often give 5-15% discounts over card payments. ATMs at convention centers charge high fees and may have low limits. Keep your cash in multiple pockets or a money clip — never flash your full bankroll at a table.',
  },
  {
    question: 'What is the best time to arrive at a card show?',
    answer: 'Arrive at opening for the best selection — top cards sell fast, especially at major shows. However, the last 1-2 hours offer the best prices as dealers want to avoid packing inventory. Strategy: do a full lap at opening to scout, make your priority purchases early, then return to negotiation targets at the end of the day for better deals.',
  },
  {
    question: 'How do I negotiate prices at card shows?',
    answer: 'Always ask "What is your best price on this?" before making an offer — dealers often discount 10-20% immediately. Bundle multiple cards for bigger discounts (15-30% off). Be polite and ready to walk away. Cash purchases get better deals. At end-of-show, dealers are motivated to reduce inventory rather than pack it. Never lowball aggressively — it burns bridges with dealers you will see again.',
  },
  {
    question: 'How do card show prices compare to online prices?',
    answer: 'Dealer table prices are typically 110-130% of online market value to cover booth rental and travel costs. However, you can negotiate down to 90-100% of market, especially on bulk purchases and end-of-day deals. Trade-in values are 50-65% of market. Common cards at shows are often 50-75% of online prices since shipping costs are eliminated. The best show deals beat online prices by 15-25%.',
  },
  {
    question: 'What red flags should I watch for at card shows?',
    answer: 'Watch for trimmed cards (unnaturally sharp or uneven edges), restored corners (filler or paint on vintage), recolored jersey patches (altered memorabilia), fake autographs (no COA from reputable authenticator), stolen graded slabs (check PSA/BGS cert numbers online), too-good-to-be-true graded cards (could be counterfeit slabs), pressure sales tactics ("someone else is looking at it"), and dealers with no return policy. Always inspect cards under good lighting before purchasing.',
  },
];

export default function CardShowGuidePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Show Survival Guide',
        description: 'Interactive card show survival guide with pre-show checklist, negotiation tactics, pricing calculator, and post-show P&L tracker.',
        applicationCategory: 'ReferenceApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        url: 'https://cardvault-two.vercel.app/card-show-guide',
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

      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-orange-950/60 border border-orange-800/50 text-orange-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
          Checklist &middot; Tactics &middot; Pricing &middot; P&amp;L Tracker
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Card Show Survival Guide
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Everything you need before, during, and after the show.
          Interactive checklist, negotiation playbook, pricing guide, and post-show P&amp;L tracker.
        </p>
      </div>

      {/* Client component */}
      <CardShowGuideClient />

      {/* FAQ Section */}
      <section className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group border border-gray-800 rounded-lg">
              <summary className="flex items-center justify-between cursor-pointer px-4 py-3 text-white font-medium hover:bg-gray-900/50 rounded-lg">
                {faq.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform ml-2">&#9660;</span>
              </summary>
              <div className="px-4 pb-4 text-gray-400 text-sm leading-relaxed">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Related Links */}
      <section className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Related Resources</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { href: '/tools/show-finder', label: 'Show Finder', desc: 'Find card shows near you' },
            { href: '/show-companion', label: 'Show Companion', desc: 'Live show-day assistant' },
            { href: '/tools/dealer-scanner', label: 'Dealer Scanner', desc: 'Scan and compare dealer prices' },
            { href: '/vault/pawn-shop', label: 'Pawn Shop', desc: 'Quick-sell value estimator' },
            { href: '/tools/buying-guide', label: 'Buying Guide', desc: 'Smart purchasing strategies' },
            { href: '/tools/flip-calc', label: 'Flip Calculator', desc: 'Calculate your flip profit' },
          ].map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="flex flex-col gap-1 p-3 rounded-lg border border-gray-800 hover:border-orange-700/50 hover:bg-orange-950/20 transition-colors"
            >
              <span className="text-white text-sm font-medium">{link.label}</span>
              <span className="text-gray-500 text-xs">{link.desc}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
