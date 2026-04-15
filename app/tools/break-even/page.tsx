import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import BreakEven from './BreakEven';

export const metadata: Metadata = {
  title: 'Break-Even Calculator — Minimum Sell Price After Fees',
  description: 'Free break-even calculator for card sellers. Input your purchase price, shipping, grading costs, and selling platform to find the exact minimum sell price to avoid losing money. Compare eBay, PWCC, Goldin, MySlabs, Facebook Groups, and COMC.',
  openGraph: {
    title: 'Break-Even Calculator — CardVault',
    description: 'Find the minimum sell price to break even after platform fees, shipping, and grading costs.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Break-Even Calculator — CardVault',
    description: 'What price do you need to sell at to break even? Free calculator.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Break-Even Calculator' },
];

const faqItems = [
  {
    question: 'How do I calculate my break-even sell price?',
    answer: 'Add up all your costs: purchase price + shipping paid + grading fees + supplies. Then divide by (1 - platform fee rate) and add any fixed fees and outbound shipping. For example, a $50 card with $5 shipping on eBay (13.25% fee + $0.30 + $4.50 shipping): break-even = ($55 + $0.30 + $4.50) / (1 - 0.1325) = $68.95. You need to sell for at least $68.95 to not lose money.',
  },
  {
    question: 'Should I include grading costs in my break-even?',
    answer: 'Yes, always. Grading is a real cost that increases your investment in the card. PSA Value costs $25/card, Regular costs $50/card. If you paid $100 for a raw card and $50 to grade it, your true cost basis is $150 plus shipping both ways. Many sellers forget this and think they profited when they actually lost money.',
  },
  {
    question: 'Which platform has the lowest break-even price?',
    answer: 'Facebook Groups typically has the lowest break-even because there are zero platform fees — you only pay PayPal Goods & Services (2.9% + $0.30) and shipping. COMC is also low at 5% + $1 flat fee but has no shipping cost since inventory is pre-shipped. eBay at 13.25% has the highest fees but the largest buyer pool.',
  },
  {
    question: 'What costs do card sellers often forget?',
    answer: 'The most commonly forgotten costs are: (1) original inbound shipping on the card you bought, (2) supplies like penny sleeves, toploaders, and bubble mailers ($0.50-$2 per sale), (3) insurance on high-value shipments, (4) grading return shipping ($10-15), and (5) the time spent photographing, listing, and shipping. These add up and can turn apparent profits into losses.',
  },
  {
    question: 'How do I lower my break-even price?',
    answer: 'Three strategies: (1) Lower your purchase price — negotiate cash discounts at shows (5-10%), buy from Facebook Groups instead of eBay, buy bulk lots. (2) Use lower-fee platforms — Facebook Groups (2.9%) vs eBay (13.25%) saves 10% per sale. (3) Reduce shipping costs — use Plain White Envelope (PWE) for cards under $20, buy bubble mailers in bulk, use PirateShip for discounted postage.',
  },
];

export default function BreakEvenPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Break-Even Calculator for Card Sellers',
        description: 'Calculate the minimum sell price to break even after platform fees, shipping, and grading costs across eBay, PWCC, Goldin, MySlabs, Facebook Groups, and COMC.',
        url: 'https://cardvault-two.vercel.app/tools/break-even',
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
          6 Platforms &middot; All Costs &middot; Instant Results &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Break-Even Calculator</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          What is the minimum price you need to sell a card for to not lose money? Enter your total costs and compare break-even prices across 6 selling platforms.
        </p>
      </div>

      <BreakEven />

      {/* FAQ Section */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((f, i) => (
            <div key={i} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
              <h3 className="font-semibold text-white mb-2">{f.question}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
