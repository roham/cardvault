import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import NegotiationCalc from './NegotiationCalc';

export const metadata: Metadata = {
  title: 'Card Negotiation Calculator — Know What to Offer at Card Shows',
  description: 'Free card negotiation calculator. Get fair offer prices, walk-away prices, and negotiation scripts for buying sports cards and Pokemon cards at shows, shops, and online. Never overpay again.',
  openGraph: {
    title: 'Card Negotiation Calculator — CardVault',
    description: 'Know exactly what to offer. Get fair prices, negotiation tactics, and scripts for buying cards at shows and online.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Negotiation Calculator — CardVault',
    description: 'Never overpay for a card again. Free negotiation calculator with scripts and tactics.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Negotiation Calculator' },
];

const faqItems = [
  {
    question: 'How much should I offer below asking price at a card show?',
    answer: 'At card shows, 10-25% below asking price is standard for an opening offer. Dealers expect negotiation and price their cards accordingly. Start at 15-20% below, and aim to settle at 10-15% off. Higher-value cards ($200+) have more room for negotiation. Late in the day, you can push for 20-30% off as dealers want to avoid packing inventory.',
  },
  {
    question: 'Should I negotiate prices at a local card shop?',
    answer: 'Yes, but be more conservative than at shows. Local card shops have higher overhead costs. A 5-15% discount on cards over $50 is reasonable. Building a relationship with your LCS owner often leads to better deals over time. Regular customers may get 10-20% off or first access to new inventory.',
  },
  {
    question: 'Is it rude to negotiate on card prices?',
    answer: 'No. Negotiation is expected and respected in the card hobby, especially at shows and for higher-value cards. Always be polite and reasonable. Never insult the seller or lowball aggressively (50%+ below asking). A respectful "Would you take $X?" is perfectly normal. The worst they can say is no.',
  },
  {
    question: 'Does paying cash get a better price on cards?',
    answer: 'Usually yes. Cash saves the seller 3-4% in credit card processing fees, so many dealers will pass that savings on to you. Some dealers offer a flat 5-10% cash discount. Having cash ready also creates urgency — "I have $80 cash right now" is more compelling than "I might pay $80."',
  },
  {
    question: 'When is the best time to buy cards at a show?',
    answer: 'The last 1-2 hours of the show are the best time for deals. Dealers have already covered their table costs and want to avoid packing inventory home. You can often get 20-30% off asking price during this window. However, the best selection is early — so serious buyers go early for selection and return late for deals.',
  },
];

export default function NegotiationCalcPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Negotiation Calculator',
        description: 'Calculate fair offer prices for buying sports cards and Pokemon cards at shows, shops, and online. Get negotiation scripts and tactics.',
        url: 'https://cardvault-two.vercel.app/tools/negotiation-calc',
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
        <div className="inline-flex items-center gap-2 bg-yellow-950/60 border border-yellow-800/50 text-yellow-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
          Fair Prices &middot; Negotiation Scripts &middot; Counter-Offer Analysis &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Card Negotiation Calculator
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Never overpay for a card again. Enter the asking price and context to get your opening offer, target price, walk-away price, and word-for-word negotiation scripts.
        </p>
      </div>

      <NegotiationCalc />

      {/* FAQ */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-900/60 border border-gray-800 rounded-xl">
              <summary className="cursor-pointer p-4 text-white font-medium hover:text-yellow-400 transition-colors list-none flex justify-between items-center">
                {faq.question}
                <span className="text-gray-500 group-open:rotate-45 transition-transform text-xl">+</span>
              </summary>
              <div className="px-4 pb-4 text-gray-400 text-sm">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>

      {/* SEO Content */}
      <div className="mt-12 prose prose-invert prose-sm max-w-none">
        <h2>How the Card Negotiation Calculator Works</h2>
        <p>
          Our calculator uses five factors to determine your ideal negotiation range: the buying venue (card show, LCS, online, private sale), card condition, whether the card is graded, your motivation level, and the time of day at shows. Each factor adjusts the recommended discount range up or down.
        </p>
        <p>
          Card shows offer the most negotiation room because dealers price with negotiation built in. Local card shops have less room due to overhead costs. Online platforms like eBay have the least flexibility, but Best Offer listings still expect 5-15% below asking. Private sales offer the biggest potential discounts since there are no platform fees.
        </p>
        <h3>Why Graded Cards Have Less Negotiation Room</h3>
        <p>
          PSA, BGS, and CGC graded cards have easily comparable sold prices on eBay. Both buyer and seller can verify the fair price in seconds. This means graded cards trade closer to market value with less room for negotiation — typically 5-10% off versus 15-25% for raw cards where condition is subjective.
        </p>
      </div>
    </div>
  );
}
