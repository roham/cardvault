import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import ShowPrepClient from './ShowPrepClient';

export const metadata: Metadata = {
  title: 'Card Show Prep Tool — Plan Your Visit, Set a Budget, Build a Want List',
  description: 'Free card show preparation tool. Set a budget, build a want list with fair prices, plan what to buy at the show, and log purchases after. Print-friendly format for bringing to card shows. Mobile-first for on-site use.',
  openGraph: {
    title: 'Card Show Prep Tool — CardVault',
    description: 'Plan your card show visit. Budget, want list, fair prices, and post-show logging.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Show Prep Tool — CardVault',
    description: 'Plan your card show visit with budget tracking, want lists, and fair prices. Free.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Card Show Prep Tool' },
];

const faqItems = [
  {
    question: 'How much should I budget for a card show?',
    answer: 'Budget depends on your goals. Casual browsers should bring $50-150 for base cards and bargain bins. Serious collectors targeting specific cards should budget $200-500. Investors and flippers often bring $500-2,000+ for high-end purchases. Always set a firm budget before the show and bring cash — most dealers give 5-10% discounts for cash transactions.',
  },
  {
    question: 'What should I bring to a card show?',
    answer: 'Essential items: cash (dealers prefer it, often give discounts), your phone with this prep tool loaded, penny sleeves and top loaders for purchases, a want list with fair prices noted, a small bag or backpack, and a portable phone charger. Optional: magnifying glass for checking card condition, a binder to trade from, and business cards if you deal.',
  },
  {
    question: 'How do I negotiate with card dealers at shows?',
    answer: 'Always be respectful and friendly. Start by asking the price — never make the first offer. If the price is above market value, politely mention recent eBay sold comps. Bundle multiple cards for a better deal. Cash buyers get better prices. If buying $200+, ask for 10-15% off. Be willing to walk away — many dealers will call you back with a better offer. Visit the same dealer late in the show when they are more motivated to sell.',
  },
  {
    question: 'When is the best time to arrive at a card show?',
    answer: 'Arrive early (first hour) for the best selection — high-end cards and bargains get picked over fast. However, the last 1-2 hours of the show is best for negotiating deals, as dealers prefer to sell inventory rather than pack it up. A two-visit strategy works well: early for must-haves, late for bargain hunting.',
  },
  {
    question: 'How do I know if a dealer price is fair at a card show?',
    answer: 'Check eBay sold listings (filter by "Sold Items") for the same card in the same condition. Card show prices should be within 10-20% of recent eBay sold comps. Dealers price above eBay to cover booth costs but should be below eBay retail (since there are no shipping or platform fees). Use this tool to pre-research fair prices before the show.',
  },
];

export default function ShowPrepPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Show Prep Tool',
        description: 'Plan your card show visit with budget tracking, want lists with fair prices, and post-show purchase logging.',
        url: 'https://cardvault-two.vercel.app/tools/show-prep',
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
          Budget Planner &middot; Want List &middot; Fair Prices &middot; Purchase Log &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Show Prep Tool</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Plan your card show visit like a pro. Set a budget, build a prioritized want list with
          fair market prices, and track your purchases on-site. Mobile-first for use at the show.
        </p>
      </div>

      <ShowPrepClient />

      {/* FAQ Section */}
      <section className="mt-16 mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((f, i) => (
            <details key={i} className="group bg-gray-800/50 border border-gray-700 rounded-xl">
              <summary className="cursor-pointer px-6 py-4 text-white font-medium list-none flex items-center justify-between">
                {f.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform">&#9662;</span>
              </summary>
              <div className="px-6 pb-4 text-gray-400 text-sm leading-relaxed">{f.answer}</div>
            </details>
          ))}
        </div>
      </section>

      {/* Related Tools */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-white mb-4">Related Tools</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/tools/show-finder', label: 'Card Show Finder', icon: '📍' },
            { href: '/tools/show-budget', label: 'Show Budget Tracker', icon: '💵' },
            { href: '/tools/show-checklist', label: 'Show Checklist', icon: '✅' },
            { href: '/tools/buyback-calc', label: 'Dealer Buyback Calc', icon: '🤝' },
            { href: '/tools/negotiation-calc', label: 'Negotiation Calculator', icon: '🤝' },
            { href: '/tools/flip-calc', label: 'Flip Profit Calculator', icon: '💰' },
          ].map(t => (
            <Link
              key={t.href}
              href={t.href}
              className="flex items-center gap-2 px-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-xl text-sm text-gray-300 hover:text-white transition-colors"
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
