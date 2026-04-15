import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import SubscriptionBoxes from './SubscriptionBoxes';

export const metadata: Metadata = {
  title: 'Card Subscription Box Comparison — Best Monthly Card Boxes 2025',
  description: 'Compare the best card subscription boxes for 2025. Boombox, Layton Sports Cards, Sports Card Box, and more. Prices, tiers, expected value, hit rates, and honest pros/cons.',
  openGraph: {
    title: 'Card Subscription Box Comparison — CardVault',
    description: 'Find the best monthly card subscription box. Compare prices, EV, and hit rates across top services.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Subscription Box Comparison — CardVault',
    description: 'Compare monthly card subscription boxes. Prices, tiers, EV, and reviews.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Subscription Box Comparison' },
];

const faqItems = [
  {
    question: 'Are card subscription boxes worth it?',
    answer: 'It depends on what you value. Most subscription boxes have a negative expected value — you pay more than the cards are worth on average. However, you are paying for convenience, curation, surprise factor, and the unboxing experience. For content creators, the entertainment value can justify the cost. For pure investment, buying singles is almost always better.',
  },
  {
    question: 'What is the best card subscription box?',
    answer: 'Layton Sports Cards consistently ranks highest for serious collectors due to strong EV at higher tiers and transparent product selection. Boombox is best for variety across sports. Sports Card Box has the lowest entry point ($25) for beginners. The best box depends on your budget, sport preference, and whether you prioritize value or entertainment.',
  },
  {
    question: 'How much should I spend on a card subscription box?',
    answer: 'For the best experience, budget $75-$150/month. Under $50/month, most boxes include only retail-level products with low hit potential. At $100+, you start getting hobby-grade products with guaranteed autographs or relics. Never spend more than you can afford to lose — treat subscription boxes as entertainment, not investment.',
  },
  {
    question: 'Can I cancel a card subscription box anytime?',
    answer: 'Most card subscription services allow month-to-month cancellation. However, some offer discounts for 3, 6, or 12-month commitments. Read the cancellation policy carefully before subscribing. The flexibility to cancel anytime is worth paying slightly more per month.',
  },
];

export default function SubscriptionBoxesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Subscription Box Comparison Tool',
        description: 'Compare monthly card subscription boxes. Filter by sport, price, and rating. See tiers, expected value, hit rates, and pros/cons for Boombox, Layton, Sports Card Box, and more.',
        url: 'https://cardvault-two.vercel.app/tools/subscription-boxes',
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
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          5 Services &middot; Filter by Sport &middot; Compare Tiers &middot; Honest Reviews &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Subscription Box Comparison</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Compare the best monthly card subscription boxes. Filter by sport and budget, compare tiers and expected value, and find the right box for your collecting style.
        </p>
      </div>

      <SubscriptionBoxes />

      {/* FAQ */}
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

      <section className="mt-12 pt-8 border-t border-gray-800">
        <p className="text-gray-500 text-sm">
          Calculate the <a href="/tools/sealed-ev" className="text-emerald-400 hover:underline">expected value of sealed products</a>,{' '}
          compare <a href="/tools/wax-vs-singles" className="text-emerald-400 hover:underline">wax vs singles</a>,{' '}
          or plan your hobby spending with the <a href="/tools/budget-planner" className="text-emerald-400 hover:underline">budget planner</a>.
        </p>
      </section>
    </div>
  );
}
